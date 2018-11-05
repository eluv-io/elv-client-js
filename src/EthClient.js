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

  async DeployContract({abi, bytecode, constructorArgs=[], signer}) {
    let contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);

    let contract = await contractFactory.deploy(...constructorArgs);
    await contract.deployed();

    return {
      address: contract.address,
      deployTransaction: contract.deployTransaction
    };
  }

  async CallContractMethod({
    contractAddress,
    abi,
    methodName,
    methodArgs=[],
    overrides={},
    signer
  }) {
    let contract = new Ethers.Contract(contractAddress, abi, signer.provider);
    contract = contract.connect(signer);

    if(!contract.functions[methodName]) {
      throw Error("Unknown method: " + methodName);
    }

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

  async DeployContentContract({libraryAddress, signer}) {
    const methodArgs = this.FormatContractArguments({
      abi: ContentLibraryContract.abi,
      methodName: "createContent",
      args: [
        "aaabbb"
      ]
    });

    return await this.CallContractMethod({
      contractAddress: libraryAddress,
      abi: ContentLibraryContract.abi,
      methodName: "createContent",
      methodArgs,
      signer
    });
  }

  async GetContractAddress() {

    var caddr;
    let provider = new Ethers.providers.JsonRpcProvider(this.ethereumURI);
    let filter = {
      fromBlock: "latest",
      toBlock: "latest",
    };
    await provider.getLogs(filter).then((result) => {
      console.log("EVENTS=" +  JSON.stringify(result));
      let i = new Ethers.utils.Interface(ContentLibraryContract.abi);
      let evt = i.parseLog(result[2]);
      console.log("Content create log: " + JSON.stringify(evt));
      caddr = evt.values["0"];
      console.log("NEW CONTRACT: ", caddr);
    });
    return caddr;
  }

  async SetCustomContract(contractAddress, customAddress, overrides={}, signer) {
    const methodArgs = this.FormatContractArguments({
      abi: ContentContract.abi,
      methodName: "setCustomContractAddress",
      args: [
        customAddress
      ]
    });

    return await this.CallContractMethod({
      contractAddress: contractAddress,
      abi: ContentContract.abi,
      methodName: "setCustomContractAddress",
      methodArgs,
      overrides,
      signer
    });
  }
}

module.exports = EthClient;
