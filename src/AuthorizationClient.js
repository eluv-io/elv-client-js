const Utils = require("./Utils");

// -- Contract javascript files built using build/BuildContracts.js
const SpaceContract = require("./contracts/BaseContentSpace");
const LibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");

class AuthorizationClient {
  constructor(elvClient, ethClient, noCache=false) {
    this.elvClient = elvClient;
    this.ethClient = ethClient;

    this.noCache = noCache;

    this.accessTransactions = {
      spaces: {},
      libraries: {},
      objects: {}
    };
  }

  CacheLibraryTransaction({libraryId, transactionHash}) {
    this.accessTransactions.libraries[libraryId] = transactionHash;
  }

  CacheObjectTransaction({objectId, transactionHash}) {
    this.accessTransactions.objects[objectId] = transactionHash;
  }

  async AccessRequest({id, abi, args=[], cache}) {
    // See if access request has already been made
    if(!this.noCache && cache) {
      let transactionHash = cache[id];
      if(transactionHash) { return transactionHash; }
    }

    const formattedArgs = this.elvClient.FormatContractArguments({
      abi,
      methodName: "accessRequest",
      args
    });

    const methodEvent = await this.elvClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress({hash: id}),
      abi,
      methodName: "accessRequest",
      methodArgs: formattedArgs
    });

    // Verify result of access request -- 0 is success
    const validity = this.elvClient.ethClient.ExtractValueFromEvent({
      abi,
      event: methodEvent,
      eventName: "AccessRequest",
      eventValue: "requestValidity"
    });

    if(validity.toNumber() !== 0) {
      throw Error("Invalid access request: " + validity.toNumber());
    }

    // Cache the transaction hash
    if(!this.noCache && cache) {
      cache[id] = methodEvent.transactionHash;
    }

    return methodEvent.transactionHash;
  }

  ContentSpaceAccess() {
    return this.AccessRequest({
      id: this.elvClient.contentSpaceId,
      abi: SpaceContract.abi,
      args: [],
      cache: this.accessTransactions.spaces
    });
  }

  ContentLibraryAccess({libraryId}) {
    return this.AccessRequest({
      id: libraryId,
      abi: LibraryContract.abi,
      args: [],
      cache: this.accessTransactions.libraries
    });
  }

  async ContentObjectAccess({objectId}) {
    const args = [
      0, // Access level
      this.elvClient.signer.privateKey, // Private key of requester
      "", // AFGH string
      [], // Custom values
      [] // Stakeholders
    ];

    return this.AccessRequest({
      id: objectId,
      abi: ContentContract.abi,
      args,
      cache: this.accessTransactions.objects
    });
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
