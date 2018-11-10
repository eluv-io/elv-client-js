// NOTE: Querying Ethereum requires CORS enabled
// Use --rpccorsdomain "http[s]://hostname:port" or set up proxy

const Ethers = require("ethers");

// -- Contract javascript files build using build/BuildContracts.js
const ContentLibraryContract = require("./contracts/ContentLibrary");
const ContentContract = require("./contracts/Content");

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

  async DeployContract({
    abi,
    bytecode,
    constructorArgs=[],
    signer
  }) {
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
    if(!contract) {
      contract = new Ethers.Contract(contractAddress, abi, signer.provider);
      contract = contract.connect(signer);
    }

    if(!contract.functions[methodName]) {
      throw Error("Unknown method: " + methodName);
    }

    return await contract.functions[methodName](...methodArgs, overrides);
  }


  /* Specific contract management */

  // Deploy ContentLibrary contract, then set the library hash
  async DeployLibraryContract({name, signer}) {
    const constructorArgs = this.FormatContractArguments({
      abi: ContentLibraryContract.abi,
      methodName: "constructor",
      args: [
        name,
        "Content Space",
        "0x0000000000000000000000000000000000000000"
      ]
    });

    return await this.DeployContract({
      abi: ContentLibraryContract.abi,
      bytecode: ContentLibraryContract.bytecode,
      constructorArgs,
      signer
    });
  }

  async SetLibraryHash({contractAddress, libraryId, overrides={}, signer}) {
    const methodArgs = this.FormatContractArguments({
      abi: ContentLibraryContract.abi,
      methodName: "setLibraryHash",
      args: [
        libraryId
      ]
    });

    return await this.CallContractMethod({
      contractAddress,
      abi: ContentLibraryContract.abi,
      methodName: "setLibraryHash",
      methodArgs,
      overrides,
      signer
    });
  }

  // Deploy content object contract by calling method on library contract
  async DeployContentContract({libraryContractAddress, type, signer}) {
    const methodArgs = this.FormatContractArguments({
      abi: ContentLibraryContract.abi,
      methodName: "createContent",
      args: [
        type
      ]
    });

    let contract = new Ethers.Contract(libraryContractAddress, ContentLibraryContract.abi, signer.provider);
    contract = contract.connect(signer);

    // Call create content method on library contract
    const createMethodCall = await this.CallContractMethod({
      contract,
      abi: ContentLibraryContract.abi,
      methodName: "createContent",
      methodArgs,
      signer
    });

    // Await completion of call and creation of content contract
    // then extract content contract address from the event log
    const contentAddress = await new Promise((resolve, reject) => {
      signer.provider.on(contract.filters.ContentObjectCreated(), async (event) => {
        try {
          // Ensure correct transaction is handled
          if (!event || event.transactionHash !== createMethodCall.hash) { return; }

          const eventInfo = new Ethers.utils.Interface(ContentLibraryContract.abi).parseLog(event);
          resolve(eventInfo.values.contentAddress);
        } catch(error) {
          reject(error);
        }
      });
    });

    // Make sure to remove listener when done
    signer.provider.removeAllListeners(contract.filters.ContentObjectCreated());

    return contentAddress;
  }

  async SetCustomContentContract({contentContractAddress, customContractAddress, overrides={}, signer}) {
    const methodArgs = this.FormatContractArguments({
      abi: ContentContract.abi,
      methodName: "setCustomContractAddress",
      args: [
        customContractAddress
      ]
    });

    return await this.CallContractMethod({
      contractAddress: contentContractAddress,
      abi: ContentContract.abi,
      methodName: "setCustomContractAddress",
      methodArgs,
      overrides,
      signer
    });
  }
}

module.exports = EthClient;
