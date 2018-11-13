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

  // Apply any necessary formatting to contract arguments based on the ABI spec
  FormatContractArguments({abi, methodName, args}) {
    const method = abi.find(func => {
      // Constructor has type=constructor but no name
      return func.name === methodName || func.type === methodName;
    });

    if(!method) { throw Error("Unknown method: " + methodName); }

    return args.map((arg, i) => {
      switch(method.inputs[i].type.toLowerCase()) {
      case "bytes32":
        return Ethers.utils.formatBytes32String(arg);
      default:
        return arg;
      }
    });
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
    signer
  }) {
    this.ValidateSigner(signer);

    let contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);

    let contract = await contractFactory.deploy(...constructorArgs);
    await contract.deployed();

    return {
      address: contract.address,
      deployTransaction: contract.deployTransaction
    };
  }

  // Accepts either contract object or contract address
  async CallContractMethod({
    contract,
    contractAddress,
    abi,
    methodName,
    methodArgs=[],
    overrides={ gasLimit: 6000000, gasPrice: 100000 },
    signer
  }) {
    this.ValidateSigner(signer);

    if(!contract) {
      contract = new Ethers.Contract(contractAddress, abi, signer.provider);
      contract = contract.connect(signer);
    }

    if(!contract.functions[methodName]) {
      throw Error("Unknown method: " + methodName);
    }

    return await contract.functions[methodName](...methodArgs, overrides);
  }

  // Deploy contract by calling method on existing contract
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

    let contract = new Ethers.Contract(contractAddress, abi, signer.provider);
    contract = contract.connect(signer);

    // Call create content method on library contract
    const createMethodCall = await this.CallContractMethod({
      contract,
      abi,
      methodName,
      methodArgs,
      signer
    });

    // Await completion of call and creation of dependent contract
    // then extract contract address from the event log
    const dependentContractAddress = await new Promise((resolve, reject) => {
      signer.provider.on(createMethodCall.hash, async (event) => {
        try {
          // Loop through logs to find the desired event
          for(const log of event.logs) {
            const parsedLog = contract.interface.parseLog(log);

            if(parsedLog && parsedLog.name === eventName) {
              resolve(parsedLog.values[eventValue]);
            }
          }

          reject(eventName + " event not found");
        } catch(error) {
          reject(error);
        }
      });
    });

    // Make sure to remove listener when done
    signer.provider.removeAllListeners(createMethodCall.hash);

    return dependentContractAddress;
  }

  /* Specific contract management */


  async DeployContentSpaceContract({name, signer}) {
    const response = await this.DeployContract({
      abi: ContentSpaceContract.abi,
      bytecode: ContentSpaceContract.bytecode,
      constructorArgs: [name],
      signer
    });

    return response.address;
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
}

module.exports = EthClient;
