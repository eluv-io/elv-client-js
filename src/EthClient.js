// NOTE: Querying Ethereum requires CORS enabled
// Use --rpccorsdomain "http[s]://hostname:port" or set up proxy

const Ethers = require("ethers");

// -- Contract javascript files build using build/BuildContracts.js
const ContentLibraryContract = require("./contracts/ContentLibrary");

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
	    console.log("ARG: " + JSON.stringify(arg));
      switch(method.inputs[i].type.toLowerCase()) {
      case "bytes32":
        return Ethers.utils.formatBytes32String(arg);
      default:
        return arg;
      }
    });
  }

  async DeployContract({abi, bytecode, constructorArgs=[], signer}) {
    let contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);

    let contract = await contractFactory.deploy(...constructorArgs);
    await contract.deployed();

    return {
      address: contract.address,
      deployTransaction: contract.deployTransaction
    };
  }

  async CallContractMethod({contractAddress, abi, methodName, methodArgs=[], signer}) {
    let contract = new Ethers.Contract(contractAddress, abi, signer.provider);
    contract = contract.connect(signer);

    if(!contract.functions[methodName]) {
      throw Error("Unknown method: " + methodName);
    }

    let overrides = {
      gasLimit: 4000000,
    };

    return await contract.functions[methodName](...methodArgs, overrides);
  }


  /* Specific contract management */

  // Deploy ContentLibrary contract, then set the library hash
  async DeployLibraryContract({libraryName, signer}) {
    const constructorArgs = this.FormatContractArguments({
      abi: ContentLibraryContract.abi,
      methodName: "constructor",
      args: [
        libraryName,
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

  async SetLibraryHash({contractAddress, libraryId, signer}) {
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
      signer
    });
  }

  // SS NEW
  async DeployContentContract({libraryAddress, signer}) {
    const methodArgs = this.FormatContractArguments({
      abi: ContentLibraryContract.abi,
      methodName: "createContent",
      args: [
        "aaabbb"
      ]
    });

    let x = await this.CallContractMethod({
      contractAddress: libraryAddress,
      abi: ContentLibraryContract.abi,
      methodName: "createContent",
      methodArgs,
      signer});
    return x;
  }

}

module.exports = EthClient;
