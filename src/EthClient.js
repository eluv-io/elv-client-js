// NOTE: Querying Ethereum requires CORS enabled
// Use --rpccorsdomain "http[s]://hostname:port" or set up proxy
const Ethers = require("ethers");
const URI = require("urijs");

// -- Contract javascript files built using build/BuildContracts.js
const FactoryContract = require("./contracts/BaseFactory");
const WalletFactoryContract = require("./contracts/BaseAccessWalletFactory");
const LibraryFactoryContract = require("./contracts/BaseLibraryFactory");
const ContentFactoryContract = require("./contracts/BaseContentFactory");

const ContentSpaceContract = require("./contracts/BaseContentSpace");
const ContentLibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");

const Utils = require("./Utils");

const Topics = require("./events/Topics");

class EthClient {
  constructor(ethereumURIs) {
    this.ethereumURIs = ethereumURIs;
    this.ethereumURIIndex = 0;
    this.locked = false;
  }

  Provider() {
    return new Ethers.providers.JsonRpcProvider(this.ethereumURIs[this.ethereumURIIndex]);
  }

  async MakeProviderCall({methodName, args=[], attempts=0}) {
    try {
      return await this.Provider()[methodName](...args);
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);

      if(attempts < this.ethereumURIs.length) {
        this.ethereumURIIndex = (this.ethereumURIIndex + 1) % this.ethereumURIs.length;
        return this.MakeProviderCall({methodName, args, attempts: attempts + 1});
      }
    }
  }

  /* General contract management */

  FormatContractArgument({type, value}) {
    // For array types, parse into array if necessary, then format each value.
    if(type.endsWith("[]")) {
      if(typeof value === "string") {
        if(value.trim() === "") { return []; }

        value = value.split(",").map(s => s.trim());
      }

      const singleType = type.replace("[]", "");
      return value.map(element => this.FormatContractArgument({type: singleType, value: element}));
    }

    switch(type.toLowerCase()) {
      case "bytes32":
        return Ethers.utils.formatBytes32String(value);
      default:
        return value;
    }
  }

  // Apply any necessary formatting to contract arguments based on the ABI spec
  FormatContractArguments({abi, methodName, args}) {
    const method = abi.find(func => {
      // Constructor has type=constructor but no name
      return func.name === methodName || func.type === methodName;
    });

    if(!method) { throw Error("Unknown method: " + methodName); }

    // Format each argument
    return args.map((arg, i) => this.FormatContractArgument({type: method.inputs[i].type, value: arg}));
  }

  // Validate signer is set and provider is correct
  ValidateSigner(signer) {
    if(!signer) {
      throw Error("Signer not set");
    }

    if(!this.ethereumURIs.find(ethereumURI => URI(signer.provider.connection.url).equals(ethereumURI))) {
      throw Error("Signer provider '" + signer.provider.connection.url +
        "' does not match client provider");
    }
  }

  async DeployContract({
    abi,
    bytecode,
    constructorArgs=[],
    overrides={},
    signer
  }) {
    signer = signer.connect(this.Provider());
    this.ValidateSigner(signer);

    let contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);

    let contract = await contractFactory.deploy(...constructorArgs, overrides);
    await contract.deployed();

    return {
      contractAddress: Utils.FormatAddress(contract.address),
      transactionHash: contract.deployTransaction.hash
    };
  }

  // Accepts either contract object or contract address
  async CallContractMethod({
    contract,
    contractAddress,
    abi,
    methodName,
    methodArgs=[],
    value,
    overrides={},
    signer
  }) {
    while(this.locked) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.locked = true;

    try {
      if (value) {
        // Convert Ether to Wei
        overrides.value = "0x" + Utils.EtherToWei(value.toString()).toString(16);
      }

      this.ValidateSigner(signer);

      if (!contract) {
        contract = new Ethers.Contract(contractAddress, abi, this.Provider());
        contract = contract.connect(signer);
      }

      if (!contract.functions[methodName]) {
        throw Error("Unknown method: " + methodName);
      }

      let result;
      let success = false;
      while (!success) {
        try {
          result = await contract.functions[methodName](...methodArgs, overrides);
          success = true;
        } catch (error) {
          if (error.code === -32000 || error.code === "REPLACEMENT_UNDERPRICED") {
            const latestBlock = await this.MakeProviderCall({methodName: "getBlock", args: ["latest"]});
            overrides.gasLimit = latestBlock.gasLimit;
            overrides.gasPrice = overrides.gasPrice ? overrides.gasPrice * 1.50 : 8000000000;
          } else {
            throw error;
          }
        }
      }

      return result;
    } finally {
      this.locked = false;
    }
  }

  async CallContractMethodAndWait({
    contractAddress,
    abi,
    methodName,
    methodArgs,
    value,
    timeout=10000,
    signer
  }) {
    let contract = new Ethers.Contract(contractAddress, abi, this.Provider());
    contract = contract.connect(signer);

    // Make method call
    const createMethodCall = await this.CallContractMethod({
      contract,
      abi,
      methodName,
      methodArgs,
      value,
      signer
    });

    // Poll for transaction completion
    const interval = 250;
    let elapsed = 0;
    let methodEvent;

    while(elapsed < timeout) {
      methodEvent = await this.MakeProviderCall({methodName: "getTransactionReceipt", args: [createMethodCall.hash]});

      if(methodEvent) {
        methodEvent.logs = methodEvent.logs.map(log => {
          return {
            ...log,
            ...(contract.interface.parseLog(log))
          };
        });

        break;
      }

      elapsed += interval;
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    if(!methodEvent) {
      throw Error(`Timed out waiting for completion of ${methodName}. TXID: ${transactionHash}`);
    }

    return methodEvent;
  }

  ExtractEventFromLogs({abi, event, eventName}) {
    const contractInterface = new Ethers.utils.Interface(abi);
    // Loop through logs to find the desired log
    for(const log of event.logs) {
      const parsedLog = contractInterface.parseLog(log);
      if(parsedLog && parsedLog.name === eventName) {
        return parsedLog;
      }
    }

    throw Error(eventName + " event not found");
  }

  async DeployDependentContract({
    contractAddress,
    abi,
    methodName,
    args=[],
    eventName,
    eventValue,
    signer
  }) {
    const methodArgs = this.FormatContractArguments({abi, methodName, args});
    const event = await this.CallContractMethodAndWait({contractAddress, abi, methodName, methodArgs, signer});

    const eventLog = this.ExtractEventFromLogs({abi, event, eventName, eventValue});
    const newContractAddress = eventLog.values[eventValue];

    return {
      contractAddress: Utils.FormatAddress(newContractAddress),
      transactionHash: event.transactionHash
    };
  }

  /* Specific contract management */

  async DeployContentSpaceContract({name, signer}) {
    const deploySpaceEvent = await this.DeployContract({
      abi: ContentSpaceContract.abi,
      bytecode: ContentSpaceContract.bytecode,
      constructorArgs: [name],
      signer
    });

    const factoryContracts = [
      [FactoryContract, "setFactory"],
      [WalletFactoryContract, "setWalletFactory"],
      [LibraryFactoryContract, "setLibraryFactory"],
      [ContentFactoryContract, "setContentFactory"]
    ];

    for(let i = 0; i < factoryContracts.length; i++) {
      const [contract, setMethod] = factoryContracts[i];

      const factoryAddress = (
        await this.DeployContract({
          abi: contract.abi,
          bytecode: contract.bytecode,
          constructorArgs: [],
          signer
        })
      ).contractAddress;

      await this.CallContractMethodAndWait({
        contractAddress: deploySpaceEvent.contractAddress,
        abi: ContentSpaceContract.abi,
        methodName: setMethod,
        methodArgs: [factoryAddress],
        signer
      });
    }

    return deploySpaceEvent;
  }

  async DeployAccessGroupContract({contentSpaceAddress, signer}) {
    return this.DeployDependentContract({
      contractAddress: contentSpaceAddress,
      abi: ContentSpaceContract.abi,
      methodName: "createGroup",
      args: [],
      eventName: "CreateGroup",
      eventValue: "groupAddress",
      signer
    });
  }

  async DeployTypeContract({contentSpaceAddress, signer}) {
    return this.DeployDependentContract({
      contractAddress: contentSpaceAddress,
      abi: ContentSpaceContract.abi,
      methodName: "createContentType",
      args: [],
      eventName: "CreateContentType",
      eventValue: "contentTypeAddress",
      signer
    });
  }

  async DeployLibraryContract({contentSpaceAddress, signer}) {
    return this.DeployDependentContract({
      contractAddress: contentSpaceAddress,
      abi: ContentSpaceContract.abi,
      methodName: "createLibrary",
      args: [Utils.nullAddress],
      eventName: "CreateLibrary",
      eventValue: "libraryAddress",
      signer
    });
  }

  async DeployContentContract({contentLibraryAddress, typeAddress, signer}) {
    // If type is not specified, use null address
    typeAddress = typeAddress || Utils.nullAddress;

    return this.DeployDependentContract({
      contractAddress: contentLibraryAddress,
      abi: ContentLibraryContract.abi,
      methodName: "createContent",
      args: [typeAddress],
      eventName: "ContentObjectCreated",
      eventValue: "contentAddress",
      signer
    });
  }

  async CommitContent({contentObjectAddress, versionHash, signer}) {
    const event = await this.CallContractMethodAndWait({
      contractAddress: contentObjectAddress,
      abi: ContentContract.abi,
      methodName: "commit",
      methodArgs: [versionHash],
      eventName: "Publish",
      eventValue: "submitStatus",
      signer
    });

    return event;
  }

  async EngageAccountLibrary({contentSpaceAddress, signer}) {
    return this.CallContractMethodAndWait({
      contractAddress: contentSpaceAddress,
      abi: ContentSpaceContract.abi,
      methodName: "engageAccountLibrary",
      args: [],
      signer
    });
  }

  async SetCustomContentContract({contentContractAddress, customContractAddress, overrides={}, signer}) {
    const methodArgs = this.FormatContractArguments({
      abi: ContentContract.abi,
      methodName: "setContentContractAddress",
      args: [
        customContractAddress
      ]
    });

    return await this.CallContractMethodAndWait({
      contractAddress: contentContractAddress,
      abi: ContentContract.abi,
      methodName: "setContentContractAddress",
      methodArgs,
      overrides,
      signer
    });
  }

  // Get all logs for the specified contract in the specified range
  async ContractEvents({contractAddress, abi, fromBlock=0, toBlock, includeTransaction=false}) {
    const contractLogs = await this.MakeProviderCall({
      methodName: "getLogs",
      args: [{
        address: contractAddress,
        fromBlock,
        toBlock
      }]
    });

    let blocks = {};
    await Promise.all(
      contractLogs.map(async log => {
        const eventInterface = new Ethers.utils.Interface(abi);
        let parsedLog = {
          ...log,
          ...(eventInterface.parseLog(log))
        };

        if(includeTransaction) {
          parsedLog = {
            ...parsedLog,
            ...(await this.MakeProviderCall({methodName: "getTransaction", args: [log.transactionHash]}))
          };
        }

        blocks[log.blockNumber] = [parsedLog].concat((blocks[log.blockNumber] || []));
      })
    );

    return Object.values(blocks).sort((a, b) => a[0].blockNumber < b[0].blockNumber ? 1 : -1);
  }

  // Look up the log topic and see if it is known. If so, parse it and inject it into the log
  ParseUnknownLog({log}) {
    if(log.topics && log.topics.length > 0) {
      const topicHash = log.topics[0];
      const topicInfo = Topics[topicHash];
      if(topicInfo) {
        const eventInterface = new Ethers.utils.Interface(topicInfo.abi);
        if(eventInterface) {
          log = {
            ...log,
            ...(eventInterface.parseLog(log)),
            contract: topicInfo.contract
          };
        }
      }
    }

    return log;
  }

  // Get logs for all blocks in the specified range
  // Returns a list, sorted in descending block order, with each entry containing all logs or transactions in that block
  async Events({toBlock, fromBlock, includeTransaction=false}) {
    const logs = await this.MakeProviderCall({methodName: "getLogs", args: [{fromBlock, toBlock}]});

    // Group logs by blocknumber
    let blocks = {};
    logs.forEach(log => {
      blocks[log.blockNumber] = [this.ParseUnknownLog({log})].concat((blocks[log.blockNumber] || []));
    });

    // Iterate through each block, filling in any missing blocks
    let output = [];
    for(let blockNumber = toBlock; blockNumber >= fromBlock; blockNumber--) {
      let blockInfo = blocks[blockNumber];

      if(!blockInfo) {
        blockInfo = await this.MakeProviderCall({methodName: "getBlock", args: [blockNumber]});
        blockInfo = blockInfo.transactions.map(transactionHash => {
          return {
            blockNumber: blockInfo.number,
            blockHash: blockInfo.hash,
            ...blockInfo,
            transactionHash
          };
        });

        blocks[blockNumber] = blockInfo;
      }

      if(includeTransaction) {
        let transactionInfo = {};

        blocks[blockNumber] = await Promise.all(
          blockInfo.map(async block => {
            if(!transactionInfo[block.transactionHash]) {
              transactionInfo[block.transactionHash] = {
                ...(await this.MakeProviderCall({methodName: "getTransaction", args: [block.transactionHash]})),
                ...(await this.MakeProviderCall({methodName: "getTransactionReceipt", args: [block.transactionHash]})),
              };
            }
            return {
              ...block,
              ...transactionInfo[block.transactionHash]
            };
          })
        );
      }

      output.push(blocks[blockNumber]);
    }

    return output;
  }
}

module.exports = EthClient;
