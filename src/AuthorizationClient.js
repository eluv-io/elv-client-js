// -- Contract javascript files built using build/BuildContracts.js
const ContentLibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");

class AuthorizationClient {
  constructor(elvClient, ethClient) {
    this.elvClient = elvClient;
    this.ethClient = ethClient;

    this.accessTransactions = {
      libraries: {},
      objects: {}
    };
  }

  async LibraryContract(libraryId) {
    const libraryMetadata = await this.elvClient.PublicLibraryMetadata({libraryId});
    if(libraryMetadata && libraryMetadata["eluv.contract_address"]) {
      return libraryMetadata["eluv.contract_address"];
    }

    throw Error("Unable to find contract address for library " +libraryId);
  }

  async LibraryAccess(libraryId) {
    let transactionHash = this.accessTransactions.libraries[libraryId];
    if(transactionHash) { return transactionHash; }

    const contractAddress = await this.LibraryContract(libraryId);

    console.log(JSON.stringify(ContentLibraryContract.abi, null, 2));

    const args = [
      0, // Access level
      this.elvClient.signer.privateKey, // Private key of requester
      "", // AFGH string
      [], // Custom values
      [] // Stakeholders
    ];

    const formattedArgs = this.elvClient.FormatContractArguments({
      abi: ContentLibraryContract.abi,
      methodName: "accessRequest",
      args
    });

    console.log(args);
    console.log(formattedArgs);

    const response = await this.elvClient.CallContractMethod({
      contractAddress,
      abi: ContentLibraryContract.abi,
      methodName: "accessRequest",
      methodArgs: formattedArgs
    });

    console.log(response);
  }

  async ContentObjectContract(libraryId, objectId) {
    const objectMetadata = await this.elvClient.ContentObjectMetadata({libraryId, versionHash: objectId});
    if(objectMetadata && objectMetadata["caddr"]) {
      return objectMetadata["caddr"];
    }

    throw Error("Unable to find contract address for library " +libraryId);
  }

  async ContentObjectAccess(libraryId, objectId) {
    let transactionHash = this.accessTransactions.objects[objectId];
    if(transactionHash) { return transactionHash; }

    const contractAddress = this.elvClient.utils.HashToAddress({hash: objectId});

    const args = [
      0, // Access level
      this.elvClient.signer.privateKey, // Private key of requester
      "", // AFGH string
      [], // Custom values
      [] // Stakeholders
    ];

    const formattedArgs = this.elvClient.FormatContractArguments({
      abi: ContentContract.abi,
      methodName: "accessRequest",
      args
    });

    const response = await this.elvClient.CallContractMethod({
      contractAddress,
      abi: ContentContract.abi,
      methodName: "accessRequest",
      methodArgs: formattedArgs
    });

    this.accessTransactions.objects[objectId] = response.hash;

    return response.hash;
  }
}

module.exports = AuthorizationClient;
