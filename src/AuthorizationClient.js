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
  constructor({ethClient, contentSpaceId, signer, noCache=false, noAuth=false}) {
    this.ethClient = ethClient;
    this.contentSpaceId = contentSpaceId;
    this.signer = signer;

    this.noCache = noCache;
    this.noAuth = noAuth;

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

    this.requestIds = {};
  }

  async AuthorizationHeader({libraryId, objectId, transactionHash, update=false, noCache=false}) {
    const authorizationToken = await this.AuthorizationToken({libraryId, objectId, transactionHash, update, noCache});

    return { Authorization: "Bearer " + authorizationToken };
  }

  // Wrapper for GenerateAuthorizationHeader to allow for per-call disabling of cache
  async AuthorizationToken({libraryId, objectId, transactionHash, update=false, noCache=false}) {
    const initialNoCache = this.noCache;

    try {
      // noCache enabled for this call
      if (noCache && !this.noCache) {
        this.noCache = true;
      }

      const authorizationToken = await this.GenerateAuthorizationToken({libraryId, objectId, transactionHash, update});

      this.noCache = initialNoCache;

      return authorizationToken;
    } catch(error) {
      // Ensure nocache is properly reset
      this.noCache = initialNoCache;
      throw error;
    }
  }

  async IsOwner({id, abi}) {
    const ownerAddress = await this.ethClient.CallContractMethod({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "owner",
      methodArgs: [],
      signer: this.signer
    });

    return ownerAddress.toLowerCase() === this.signer.address.toLowerCase();
  }

    async FormatAuthToken({libraryId, transactionHash}) {
	const token = B64(JSON.stringify({
	    qspace_id: this.contentSpaceId,
	    qlib_id: libraryId,
	    addr: this.signer.signingKey.address,
	    txid: transactionHash
	}));
	const signature = B64("SIGNATURE");
	return token + "." + signature;
    }

  async GenerateAuthorizationToken({libraryId, objectId, transactionHash, update=false}) {
    if(!transactionHash && !this.noAuth) {
      const accessTransaction = await this.MakeAccessRequest({
        libraryId,
        objectId,
        transactionHash,
        update,
        checkAccessCharge: true,
        noCache: this.noCache
      });
      transactionHash = accessTransaction.transactionHash;
    } else if(this.noAuth) {
      // If noAuth is specified, throw out transaction hash
      transactionHash = undefined;
    }

    const token = B64(JSON.stringify({
      qspace_id: this.contentSpaceId,
      qlib_id: libraryId,
      addr: this.signer.signingKey.address,
      txid: transactionHash
    }));

    const signature = B64("SIGNATURE");
    return token + "." + signature;
  }

  // Generate proper authorization header based on the information provided
  async MakeAccessRequest({
    libraryId,
    objectId,
    args=[],
    update=false,
    checkAccessCharge=true,
    skipCache=false,
    noCache=false
  }) {
    const isSpaceLibrary = Utils.EqualHash(this.contentSpaceId, libraryId);
    const isLibraryObject = Utils.EqualHash(libraryId, objectId);
    const cacheCollection = update ? this.modifyTransactions : this.accessTransactions;

    let id;
    let abi;
    let cache;
    if(!libraryId || (!objectId && isSpaceLibrary) || (isSpaceLibrary && isLibraryObject)) {
      // Content Space - no library, content space library or content space library object
      id = this.contentSpaceId;
      abi = SpaceContract.abi;
      cache = cacheCollection.spaces;
      return {transactionHash: ""};
    } else if(isSpaceLibrary) {
      // Content type - content space library but not content space library object
      id = objectId;
      abi = TypeContract.abi;
      cache = cacheCollection.objects;
    } else if(!objectId || isLibraryObject) {
      // Library - no object specified or library object
      id = libraryId;
      abi = LibraryContract.abi;
      cache = cacheCollection.libraries;
      return {transactionHash: ""};
    } else {
      // Object - any other case
      id = objectId;
      abi = ContentContract.abi;
      cache = cacheCollection.objects;

      if(!args || args.length === 0) {
        // Set default args
        args = [
          0, // Access level
          this.signer.signingKey.publicKey, // Public key of requester
          "", // AFGH string
          [], // Custom values
          [] // Stakeholders
        ];
      }
    }

    // Check cache for existing transaction
    if(!noCache && !skipCache) {
      if(cache[id]) { return { transactionHash: cache[id] }; }
    }

    // Make the request
    let accessRequest;
    if(update) {
      accessRequest = await this.UpdateRequest({id, abi});
    } else {
      accessRequest = await this.AccessRequest({id, abi, args, checkAccessCharge});
    }

    // Cache the transaction hash
    if(!noCache) {
      cache[id] = accessRequest.transactionHash;

      // Save request ID if present
      if(accessRequest.logs.length > 0 && accessRequest.logs[0].values && accessRequest.logs[0].values.requestID) {
        this.requestIds[id] = accessRequest.logs[0].values.requestID;
      }
    }

    return accessRequest;
  }

  CacheLibraryTransaction({libraryId, transactionHash}) {
    this.modifyTransactions.libraries[libraryId] = transactionHash;
  }

  CacheObjectTransaction({objectId, transactionHash}) {
    this.modifyTransactions.objects[objectId] = transactionHash;
  }

  /* Access */

  async GetAccessCharge({id, abi}) {
    // Ensure contract has a getAccessCharge method
    const method = abi.find(element => element.name === "getAccessCharge" && element.type === "function");

    if(!method) { return 0; }

    const event = await this.ethClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "getAccessCharge",
      methodArgs: [0, [], []],
      signer: this.signer
    });

    const eventLog = this.ethClient.ExtractEventFromLogs({
      abi: ContentContract.abi,
      event,
      eventName: "GetAccessCharge"
    });

    return eventLog.values.accessCharge;
  }

  async AccessComplete({id, abi, score}) {
    const requestId = this.requestIds[id];

    if(!requestId) { throw Error("Unknown request for " + id); }

    const formattedArgs = this.ethClient.FormatContractArguments({
      abi,
      methodName: "accessComplete",
      args: [requestId, score, ""],
      signer: this.signer
    });

    // If access request did not succeed, no event will be emitted
    const event = await this.ethClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "accessComplete",
      methodArgs: formattedArgs,
      signer: this.signer
    });

    delete this.requestIds[id];
    delete this.accessTransactions[id];

    return event;
  }

  async AccessRequest({id, abi, args=[], checkAccessCharge=false}) {
    const isOwner = await this.IsOwner({id, abi});

    // Send some bux if access charge is required
    let accessCharge = 0;
    if(!isOwner && checkAccessCharge) {
      // Access charge is in wei, but methods take ether - convert to charge to ether
      accessCharge = Utils.WeiToEther(await this.GetAccessCharge({id, abi}));
    }

    const formattedArgs = this.ethClient.FormatContractArguments({
      abi,
      methodName: "accessRequest",
      args,
      signer: this.signer
    });

    // If access request did not succeed, no event will be emitted
    const event = await this.ethClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "accessRequest",
      methodArgs: formattedArgs,
      value: accessCharge,
      signer: this.signer
    });

    const accessRequestEvent = this.ethClient.ExtractEventFromLogs({
      abi,
      event,
      eventName: "AccessRequest"
    });

    if(event.logs.length === 0 || !accessRequestEvent) {
      throw Error("Access denied");
    }

    return event;
  }

  async UpdateRequest({id, abi}) {
    return await this.ethClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "updateRequest",
      methodArgs: [],
      signer: this.signer
    });
  }

  /* Creation methods */

  async CreateAccessGroup() {
    // Deploy contract
    const { contractAddress, transactionHash } = await this.ethClient.DeployAccessGroupContract({
      contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
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
      contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
      signer: this.signer
    });

    return {
      contractAddress,
      transactionHash
    };
  }

  async CreateContentLibrary() {
    // Deploy contract
    const {contractAddress, transactionHash} = await this.ethClient.DeployLibraryContract({
      contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
      signer: this.signer
    });

    return {
      contractAddress,
      transactionHash
    };
  }

  async CreateContentObject({libraryId, typeId}) {
    // Deploy contract
    const { contractAddress, transactionHash } = await this.ethClient.DeployContentContract({
      contentLibraryAddress: Utils.HashToAddress(libraryId),
      typeAddress: typeId ? Utils.HashToAddress(typeId) : Utils.nullAddress,
      signer: this.signer
    });

    return {
      contractAddress,
      transactionHash
    };
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
