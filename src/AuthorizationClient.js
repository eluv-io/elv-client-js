const Utils = require("./Utils");

// -- Contract javascript files built using build/BuildContracts.js
const ContentLibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");

class AuthorizationClient {
  constructor(elvClient, ethClient, noCache=false) {
    this.elvClient = elvClient;
    this.ethClient = ethClient;

    this.noCache = noCache;

    this.accessTransactions = {
      libraries: {},
      objects: {}
    };
  }

  async ContentObjectAccess(libraryId, objectId) {
    // See if object has already been accessed and re-use the transaction
    if(!this.noCache) {
      let transactionHash = this.accessTransactions.objects[objectId];
      if(transactionHash) { return transactionHash; }
    }

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

    const methodEvent = await this.elvClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress({hash: objectId}),
      abi: ContentContract.abi,
      methodName: "accessRequest",
      methodArgs: formattedArgs
    });

    if(!this.noCache) {
      this.accessTransactions.objects[objectId] = methodEvent.transactionHash;
    }

    return methodEvent.transactionHash;
  }

  // Clear cached access transaction IDs for either a specific library/object or all
  ClearCache({libraryId, objectId}) {
    if(libraryId) {
      this.accessTransactions.libraries[libraryId] = undefined;
    } else if(objectId) {
      this.accessTransactions.objects[objectId] = undefined;
    } else {
      this.accessTransactions = {};
    }
  }
}

module.exports = AuthorizationClient;
