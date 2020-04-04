// NOTE: Querying Ethereum requires CORS enabled
// Use --rpccorsdomain "http[s]://hostname:port" or set up proxy
const Ethers = require("ethers");

const HttpClient = require("./HttpClient");

/*
// -- Contract javascript files built using build/BuildContracts.js
const ContentSpaceContract = require("./contracts/BaseContentSpace");
const ContentLibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");
 */

const AccessibleContract = require("./contracts/v3/Accessible");


const Utils = require("./Utils");

const Topics = require("./events/Topics");

class EthClient {
  Log(message, error=false) {
    if(!this.debug) { return; }

    if(typeof message === "object") {
      message = JSON.stringify(message);
    }

    error ?
      // eslint-disable-next-line no-console
      console.error(`\n(elv-client-js#EthClient) ${message}\n`) :
      // eslint-disable-next-line no-console
      console.log(`\n(elv-client-js#EthClient) ${message}\n`);
    // eslint-disable-next-line no-console
  }

  constructor({client, uris, debug}) {
    this.client = client;
    this.ethereumURIs = uris;
    this.ethereumURIIndex = 0;
    this.locked = false;
    this.debug = debug;

    this.cachedContracts = {};
    this.contractNames = {};

    // HTTP client for making misc calls to elv-master
    this.HttpClient = new HttpClient({uris: this.ethereumURIs, debug: this.debug});

    Ethers.errors.setLogLevel("error");
  }

  Provider() {
    if(!this.provider) {
      this.provider = new Ethers.providers.JsonRpcProvider(this.ethereumURIs[this.ethereumURIIndex]);

      // Ethers.js uses eth_getCode to ensure a contract is deployed and nothing else - this pulls a large chunk of pointless
      // data every time a contract is initialized in the client (often). Ethers.js just checks that the code isn't == "0x", so
      // we can give it some dummy string instead and assume the contract is fine
      this.provider.getCode = async () => "0x123";
      this.provider.pollingInterval = 500;
    }

    return this.provider;
  }

  async ContractName(contractAddress) {
    const versionContract = new Ethers.Contract(contractAddress, AccessibleContract.abi, this.Provider());

    if(!this.contractNames[contractAddress]) {
      try {
        // Call using general "ownable" abi
        const versionBytes32 = await this.CallContractMethod({
          contract: versionContract,
          abi: AccessibleContract.abi,
          methodName: "version",
          cacheContract: false
        });

        const version =
          Ethers.utils.parseBytes32String(
            // Ensure bytes32 string is null terminated
            versionBytes32.slice(0, -2) + "00"
          );
        this.contractNames[contractAddress] = version.split(/\d+/)[0];
      } catch(error) {
        this.contractNames[contractAddress] = "Unknown";
      }
    }

    return this.contractNames[contractAddress];
  }

  Contract({contractAddress, abi, cacheContract, overrideCachedContract}) {
    let contract;
    if(!overrideCachedContract) {
      contract = this.cachedContracts[contractAddress];
    }

    if(!contract) {
      contract = new Ethers.Contract(contractAddress, abi, this.Provider());
      contract = contract.connect(this.client.signer);

      if(cacheContract) {
        this.cachedContracts[contractAddress] = contract;
      }
    }

    return contract;
  }

  async MakeProviderCall({methodName, args=[], attempts=0}) {
    try {
      const provider = this.Provider();
      await this.provider.getNetwork();

      this.Log(`ETH ${provider.connection.url} ${methodName} [${args.join(", ")}]`);
      return await provider[methodName](...args);
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);

      if(attempts < this.ethereumURIs.length) {
        this.Log(`EthClient failing over: ${attempts + 1} attempts`, true);
        this.provider = undefined;
        this.ethereumURIIndex = (this.ethereumURIIndex + 1) % this.ethereumURIs.length;
        return this.MakeProviderCall({methodName, args, attempts: attempts + 1});
      }

      return {};
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
      case "bytes":
        return Ethers.utils.toUtf8Bytes(value);
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

    if(method === undefined) {
      throw Error("Unknown method: " + methodName);
    }

    // Format each argument
    return args.map((arg, i) => this.FormatContractArgument({type: method.inputs[i].type, value: arg}));
  }

  // Validate signer is set
  ValidateSigner(signer) {
    if(!signer) { throw Error("Signer not set"); }
  }

  async DeployContract({
    abi,
    bytecode,
    constructorArgs=[],
    overrides={}
  }) {
    this.Log(`Deploying contract with args [${constructorArgs.join(", ")}]`);

    const provider = this.Provider();
    provider.getNetwork();

    const signer = this.client.signer.connect(provider);
    this.ValidateSigner(signer);

    let contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);

    let contract = await contractFactory.deploy(...constructorArgs, overrides);
    await contract.deployed();

    this.Log(`Deployed: ${contract.address}`);

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
    formatArguments=true,
    cacheContract=true,
    overrideCachedContract=false
  }) {
    if(!abi) { abi = await this.client.ContractAbi({contractAddress}); }

    contract = contract || this.Contract({contractAddress, abi, cacheContract, overrideCachedContract});

    abi = contract.interface.abi;

    // Automatically format contract arguments
    if(formatArguments) {
      methodArgs = this.FormatContractArguments({
        abi,
        methodName,
        args: methodArgs
      });
    }

    if(value) {
      // Convert Ether to Wei
      overrides.value = "0x" + Utils.EtherToWei(value.toString()).toString(16);
    }

    if(contract.functions[methodName] === undefined) {
      throw Error("Unknown method: " + methodName);
    }

    this.Log(
      `Calling contract method:
        Address: ${contract.address}
        Method: ${methodName}
        Args: [${methodArgs.join(", ")}]`
    );

    const methodAbi = contract.interface.abi.find(method => method.name === methodName);

    // Lock if performing a transaction
    if(!methodAbi || !methodAbi.constant) {
      while(this.locked) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.locked = true;
    }

    try {
      let result;
      let success = false;
      while(!success) {
        try {
          result = await contract.functions[methodName](...methodArgs, overrides);
          success = true;
        } catch(error) {
          if(error.code === -32000 || error.code === "REPLACEMENT_UNDERPRICED") {
            const latestBlock = await this.MakeProviderCall({methodName: "getBlock", args: ["latest"]});
            overrides.gasLimit = latestBlock.gasLimit;
            overrides.gasPrice = overrides.gasPrice ? overrides.gasPrice * 1.50 : 8000000000;
          } else if(!(error.message || error).includes("invalid response")) {
            this.Log(typeof error === "object" ? JSON.stringify(error, null, 2) : error, true);
            throw error;
          }
        }
      }

      return result;
    } finally {
      // Unlock if performing a transaction
      if(!methodAbi || !methodAbi.constant) {
        this.locked = false;
      }
    }
  }

  async CallContractMethodAndWait({
    contractAddress,
    abi,
    methodName,
    methodArgs,
    value,
    timeout=10000,
    formatArguments=true,
    cacheContract=true,
    overrideCachedContract=false,
  }) {
    if(!abi) { abi = await this.client.ContractAbi({contractAddress}); }

    const contract = this.Contract({contractAddress, abi, cacheContract, overrideCachedContract});

    // Make method call
    const createMethodCall = await this.CallContractMethod({
      contract,
      abi,
      methodName,
      methodArgs,
      value,
      formatArguments,
      cacheContract
    });

    this.Log(`Awaiting transaction completion: ${createMethodCall.hash}`);

    // Poll for transaction completion
    const interval = this.Provider().pollingInterval;
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
      throw Error(`Timed out waiting for completion of ${methodName}. TXID: ${createMethodCall.hash}`);
    }

    return methodEvent;
  }

  async AwaitEvent({contractAddress, abi, eventName}) {
    const contract = this.Contract({contractAddress, abi});

    return await new Promise(resolve => {
      contract.on(eventName, (_, __, event) => {
        contract.removeAllListeners(eventName);
        resolve(event);
      });
    });
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
  }

  async DeployDependentContract({
    contractAddress,
    methodName,
    args=[],
    eventName,
    eventValue
  }) {
    const abi = await this.client.ContractAbi({contractAddress});
    const event = await this.CallContractMethodAndWait({contractAddress, abi, methodName, methodArgs: args});
    const eventLog = this.ExtractEventFromLogs({abi, event, eventName, eventValue});

    if(!eventLog) {
      throw Error(`${methodName} failed - Log not present in transaction`);
    }

    const newContractAddress = eventLog.values[eventValue];

    return {
      contractAddress: Utils.FormatAddress(newContractAddress),
      transactionHash: event.transactionHash
    };
  }

  /* Specific contract management */

  async DeployAccessGroupContract({contentSpaceAddress}) {
    return this.DeployDependentContract({
      contractAddress: contentSpaceAddress,
      methodName: "createGroup",
      args: [],
      eventName: "CreateGroup",
      eventValue: "groupAddress"
    });
  }

  async DeployTypeContract({contentSpaceAddress}) {
    return this.DeployDependentContract({
      contractAddress: contentSpaceAddress,
      methodName: "createContentType",
      args: [],
      eventName: "CreateContentType",
      eventValue: "contentTypeAddress"
    });
  }

  async DeployLibraryContract({contentSpaceAddress, kmsId}) {
    const kmsAddress = Utils.HashToAddress(kmsId);

    return this.DeployDependentContract({
      contractAddress: contentSpaceAddress,
      methodName: "createLibrary",
      args: [kmsAddress],
      eventName: "CreateLibrary",
      eventValue: "libraryAddress"
    });
  }

  async DeployContentContract({contentLibraryAddress, typeAddress}) {
    // If type is not specified, use null address
    typeAddress = typeAddress || Utils.nullAddress;

    return this.DeployDependentContract({
      contractAddress: contentLibraryAddress,
      methodName: "createContent",
      args: [typeAddress],
      eventName: "ContentObjectCreated",
      eventValue: "contentAddress",
    });
  }

  async CommitContent({contentObjectAddress, versionHash}) {
    return await this.CallContractMethodAndWait({
      contractAddress: contentObjectAddress,
      methodName: "commit",
      methodArgs: [versionHash],
      eventName: "CommitPending",
      eventValue: "pendingHash",
    });
  }

  async EngageAccountLibrary({contentSpaceAddress}) {
    return this.CallContractMethodAndWait({
      contractAddress: contentSpaceAddress,
      methodName: "engageAccountLibrary",
      args: []
    });
  }

  async SetCustomContentContract({contentContractAddress, customContractAddress, overrides={}}) {
    return await this.CallContractMethodAndWait({
      contractAddress: contentContractAddress,
      methodName: "setContentContractAddress",
      methodArgs: [customContractAddress],
      overrides
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
    }) || [];

    if(!Array.isArray(contractLogs)) {
      return [];
    }

    let blocks = {};

    await Utils.LimitedMap(
      5,
      contractLogs,
      async log => {
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
      }
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
    // Pull logs in batches of 100
    let logs = [];
    for(let i = fromBlock; i < toBlock; i += 101) {
      const newLogs = await this.MakeProviderCall({
        methodName: "getLogs",
        args: [{
          fromBlock: i,
          toBlock: Math.min(toBlock, i + 100)
        }]
      });

      logs = logs.concat(newLogs || []);
    }

    // Group logs by blocknumber
    let blocks = {};
    logs.forEach(log => {
      blocks[log.blockNumber] = [this.ParseUnknownLog({log})].concat((blocks[log.blockNumber] || []));
    });

    let output = [];
    await Utils.LimitedMap(
      3,
      [...Array(toBlock - fromBlock + 1).keys()],
      async i => {
        const blockNumber = toBlock - i;
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
    );

    return output;
  }
}

module.exports = EthClient;
