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

    this.modifyTransactions = {
      spaces: {},
      libraries: {},
      objects: {}
    };
  }

  CacheLibraryTransaction({libraryId, transactionHash}) {
    this.modifyTransactions.libraries[libraryId] = transactionHash;
  }

  CacheObjectTransaction({objectId, transactionHash}) {
    this.modifyTransactions.objects[objectId] = transactionHash;
  }

  /* Access */

  async AccessRequest({id, abi, args=[], accessCache={}, modifyCache={}}) {
    // See if access or modification request has already been made
    if(!this.noCache) {
      let transactionHash = accessCache[id] || modifyCache[id];
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
    if(!this.noCache) {
      accessCache[id] = methodEvent.transactionHash;
    }

    return methodEvent.transactionHash;
  }

  ContentSpaceAccess() {
    return this.AccessRequest({
      id: this.elvClient.contentSpaceId,
      abi: SpaceContract.abi,
      args: [],
      accessCache: this.accessTransactions.spaces,
      modifyCache: this.modifyTransactions.spaces
    });
  }

  ContentLibraryAccess({libraryId}) {
    return this.AccessRequest({
      id: libraryId,
      abi: LibraryContract.abi,
      args: [],
      accessCache: this.accessTransactions.libraries,
      modifyCache: this.modifyTransactions.libraries
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
      accessCache: this.accessTransactions.objects,
      modifyCache: this.modifyTransactions.objects
    });
  }

  /* Create */

  async CreateContentLibrary() {
    // Deploy contract
    const {contractAddress, transactionHash} = await this.ethClient.DeployLibraryContract({
      contentSpaceAddress: Utils.HashToAddress({hash: this.elvClient.contentSpaceId}),
      signer: this.elvClient.signer
    });

    const libraryId = Utils.AddressToLibraryId({address: contractAddress});

    // Cache creation hash
    if(!this.noCache) {
      this.modifyTransactions.libraries[libraryId] = transactionHash;
    }

    return {
      contractAddress,
      transactionHash
    };
  }

  async CreateContentType() {
    // Deploy contract
    const { contractAddress, transactionHash } = await this.ethClient.DeployTypeContract({
      contentSpaceAddress: Utils.HashToAddress({hash: this.elvClient.contentSpaceId}),
      signer: this.elvClient.signer
    });

    const objectId = Utils.AddressToLibraryId({address: contractAddress});

    // Cache creation hash
    if(!this.noCache) {
      this.modifyTransactions.objects[objectId] = transactionHash;
    }

    return {
      contractAddress,
      transactionHash
    };
  }

  async CreateContentObject({libraryId}) {
    // Deploy contract
    const { contractAddress, transactionHash } = await this.ethClient.DeployContentContract({
      contentLibraryAddress: Utils.HashToAddress({hash: libraryId}),
      signer: this.elvClient.signer
    });

    const objectId = Utils.AddressToLibraryId({address: contractAddress});

    // Cache creation hash
    if(!this.noCache) {
      this.modifyTransactions.objects[objectId] = transactionHash;
    }

    return {
      contractAddress,
      transactionHash
    };
  }

  /* Update */

  async UpdateRequest({id, abi, cache={}}) {
    // See if create or modification request has already been made
    if(!this.noCache && cache) {
      let transactionHash = cache[id];
      if(transactionHash) { return transactionHash; }
    }

    const methodEvent = await this.elvClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress({hash: id}),
      abi,
      methodName: "updateRequest",
      methodArgs: []
    });

    // Cache the transaction hash
    if(!this.noCache && cache) {
      cache[id] = methodEvent.transactionHash;
    }

    return methodEvent.transactionHash;
  }

  async ContentLibraryUpdate({libraryId}) {
    return this.UpdateRequest({
      id: libraryId,
      abi: LibraryContract.abi,
      cache: this.modifyTransactions.libraries
    });
  }

  async ContentObjectUpdate({objectId}) {
    return this.UpdateRequest({
      id: objectId,
      abi: ContentContract.abi,
      cache: this.modifyTransactions.objects
    });
  }

  // Clear cached access transaction IDs for either a specific library/object or all
  ClearCache({libraryId, objectId}) {
    if(libraryId) {
      this.accessTransactions.libraries[libraryId] = undefined;
      this.modifyTransactions.libraries[libraryId] = undefined;
    } else if(objectId) {
      this.accessTransactions.objects[objectId] = undefined;
      this.modifyTransactions.objects[objectId] = undefined;
    } else {
      this.accessTransactions = {};
      this.modifyTransactions = {};
    }
  }
}

module.exports = AuthorizationClient;
