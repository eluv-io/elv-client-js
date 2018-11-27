const Utils = require("./Utils");

// -- Contract javascript files built using build/BuildContracts.js
const SpaceContract = require("./contracts/BaseContentSpace");
const LibraryContract = require("./contracts/BaseLibrary");
const TypeContract = require("./contracts/BaseContentType");
const ContentContract = require("./contracts/BaseContent");

// Node doesn't implement btoa
const B64 = (str) => {
  if(typeof btoa !== "undefined") {
    return btoa(str);
  }

  return Buffer.from(str).toString("base64");
};

class AuthorizationClient {
  constructor({ethClient, contentSpaceId, signer, noCache=false}) {
    this.ethClient = ethClient;
    this.contentSpaceId = contentSpaceId;
    this.signer = signer;

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

  // Wrapper for GenerateAuthorizationHeader to allow for per-call disabling of cache
  async AuthorizationHeader({libraryId, objectId, transactionHash, update=false, noCache=false}) {
    const initialNoCache = this.noCache;

    try {
      // noCache enabled for this call
      if (noCache && !this.noCache) {
        this.noCache = true;
      }

      const authorizationHeader = await this.GenerateAuthorizationHeader({libraryId, objectId, transactionHash, update});

      this.noCache = initialNoCache;

      return authorizationHeader;
    } catch(error) {
      // Ensure nocache is properly reset
      this.noCache = initialNoCache;
      throw error;
    }
  }

  // Generate proper authorization header based on the information provided
  async GenerateAuthorizationHeader({libraryId, objectId, transactionHash, update=false}) {
    if(!transactionHash) {
      // If content library object, authorize against library, not object
      if(objectId && !Utils.EqualHash(libraryId, objectId)) {
        if(Utils.EqualHash(this.contentSpaceId, libraryId)) {
          // Content type
          if(update) {
            transactionHash = await this.ContentTypeUpdate({objectId});
          } else {
            transactionHash = await this.ContentTypeAccess({objectId});
          }
        } else {
          // Content object
          if(update) {
            transactionHash = await this.ContentObjectUpdate({objectId});
          } else {
            transactionHash = await this.ContentObjectAccess({objectId});
          }
        }
        // If content space library, authorize against space, not library
      } else if(libraryId && !Utils.EqualHash(this.contentSpaceId, libraryId)) {
        // Content Library
        if(update) {
          transactionHash = await this.ContentLibraryUpdate({libraryId});
        } else {
          //transactionHash = await this.ContentLibraryAccess({libraryId});
        }
      } else {
        // Content space
        //transactionHash = await this.ContentSpaceAccess();
      }
    }

    const token = B64(JSON.stringify({
      qspace_id: this.contentSpaceId,
      qlib_id: libraryId,
      addr: this.signer.signingKey.address,
      txid: transactionHash
    }));

    const signature = B64("SIGNATURE");

    return {
      Authorization: "Bearer " + token + "." + signature
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

    const formattedArgs = this.ethClient.FormatContractArguments({
      abi,
      methodName: "accessRequest",
      args,
      signer: this.signer
    });

    const methodEvent = await this.ethClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress({hash: id}),
      abi,
      methodName: "accessRequest",
      methodArgs: formattedArgs,
      signer: this.signer
    });

    // Verify result of access request -- 0 is success
    const validity = this.ethClient.ExtractValueFromEvent({
      abi,
      event: methodEvent,
      eventName: "AccessRequest",
      eventValue: "requestValidity",
      signer: this.signer
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
      id: this.contentSpaceId,
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

  ContentTypeAccess({objectId}) {
    return this.AccessRequest({
      id: objectId,
      abi: TypeContract.abi,
      args: [],
      accessCache: this.accessTransactions.libraries,
      modifyCache: this.modifyTransactions.libraries
    });
  }

  ContentObjectAccess({objectId}) {
    const args = [
      0, // Access level
      this.signer.privateKey, // Private key of requester
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
      contentSpaceAddress: Utils.HashToAddress({hash: this.contentSpaceId}),
      signer: this.signer
    });

    return {
      contractAddress,
      transactionHash
    };
  }

  async CreateContentType() {
    // Deploy contract
    const { contractAddress, transactionHash } = await this.ethClient.DeployTypeContract({
      contentSpaceAddress: Utils.HashToAddress({hash: this.contentSpaceId}),
      signer: this.signer
    });

    return {
      contractAddress,
      transactionHash
    };
  }

  async CreateContentObject({libraryId}) {
    // Deploy contract
    const { contractAddress, transactionHash } = await this.ethClient.DeployContentContract({
      contentLibraryAddress: Utils.HashToAddress({hash: libraryId}),
      signer: this.signer
    });

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

    const methodEvent = await this.ethClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress({hash: id}),
      abi,
      methodName: "updateRequest",
      methodArgs: [],
      signer: this.signer
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

  async ContentTypeUpdate({objectId}) {
    return this.UpdateRequest({
      id: objectId,
      abi: TypeContract.abi,
      cache: this.modifyTransactions.objects
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
