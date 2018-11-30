// NOTE: Querying Ethereum requires CORS enabled
// Use --rpccorsdomain "http[s]://hostname:port" or set up proxy
const Ethers = require("ethers");
const URI = require("urijs");

// -- Contract javascript files built using build/BuildContracts.js
const ContentSpaceContract = require("./contracts/BaseContentSpace");
const ContentLibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");

class EthClient {
  constructor(ethereumURI) {
    this.ethereumURI = ethereumURI;
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

    if(!URI(signer.provider.connection.url).equals(this.ethereumURI)) {
      throw Error("Signer provider '" + signer.provider.connection.url +
        "' does not match client provider '" + this.ethereumURI + "'");
    }
  }

  async DeployContract({
    abi,
    bytecode,
    constructorArgs=[],
    overrides={},
    signer
  }) {
    this.ValidateSigner(signer);

    let contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);

    let contract = await contractFactory.deploy(...constructorArgs, overrides);
    await contract.deployed();

    return {
      contractAddress: contract.address,
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
    if(value) { overrides.value = value; }

    this.ValidateSigner(signer);

    if(!contract) {
      contract = new Ethers.Contract(contractAddress, abi, signer.provider);
      contract = contract.connect(signer);
    }

    if(!contract.functions[methodName]) {
      throw Error("Unknown method: " + methodName);
    }

    let result;
    try {
      result = await contract.functions[methodName](...methodArgs, overrides);
    } catch(error) {
      // If the default gas limit was not sufficient, bump it up
      if(error.code === -32000 || error.message.startsWith("replacement fee too low")) {
        overrides.gasLimit = 8000000;
        overrides.gasPrice = 800000000;
        result = await contract.functions[methodName](...methodArgs, overrides);
      } else {
        throw error;
      }
    }
    
    return result;
  }

  async CallContractMethodAndWait({
    contractAddress,
    abi,
    methodName,
    methodArgs,
    value,
    signer
  }) {
    let contract = new Ethers.Contract(contractAddress, abi, signer.provider);
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

    // Await completion of call and get event
    const methodEvent = await new Promise((resolve) => {
      signer.provider.on(createMethodCall.hash, async (event) => {
        resolve(event);
      });
    });

    // Make sure to remove listener when done
    signer.provider.removeAllListeners(createMethodCall.hash);

    return methodEvent;
  }

  ExtractValueFromEvent({abi, event, eventName, eventValue}) {
    const contractInterface = new Ethers.utils.Interface(abi);
    // Loop through logs to find the desired log
    for(const log of event.logs) {
      const parsedLog = contractInterface.parseLog(log);

      if(parsedLog && parsedLog.name === eventName) {
        return parsedLog.values[eventValue];
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

    const newContractAddress = this.ExtractValueFromEvent({abi, event, eventName, eventValue});

    return {
      contractAddress: newContractAddress,
      transactionHash: event.transactionHash
    };
  }

  /* Specific contract management */


  async DeployContentSpaceContract({name, signer}) {
    return this.DeployContract({
      abi: ContentSpaceContract.abi,
      bytecode: ContentSpaceContract.bytecode,
      constructorArgs: [name],
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
      args: ["0x0000000000000000000000000000000000000000"],
      eventName: "CreateLibrary",
      eventValue: "libraryAddress",
      signer
    });
  }

  async DeployContentContract({contentLibraryAddress, signer}) {
    return this.DeployDependentContract({
      contractAddress: contentLibraryAddress,
      abi: ContentLibraryContract.abi,
      methodName: "createContent",
      args: ["0x0000000000000000000000000000000000000000"],
      eventName: "ContentObjectCreated",
      eventValue: "contentAddress",
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

    return await this.CallContractMethod({
      contractAddress: contentContractAddress,
      abi: ContentContract.abi,
      methodName: "setContentContractAddress",
      methodArgs,
      overrides,
      signer
    });
  }

  async ContractEvents({contract, contractAddress, abi, signer}) {
    if(!contract) {
      contract = new Ethers.Contract(contractAddress, abi, signer.provider);
      contract = contract.connect(signer);
    }

    const contractEvents = await signer.provider.getLogs({
      address: contract.address,
      fromBlock: 0
    });

    return contractEvents.map(event => contract.interface.parseLog(event));
  }
}

module.exports = EthClient;
