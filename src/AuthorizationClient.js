const Id = require("./Id");
const Ethers = require("ethers");
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
  constructor({client, contentSpaceId, stateChannelURIs, noCache=false, noAuth=false}) {
    this.client = client;
    this.contentSpaceId = contentSpaceId;
    this.stateChannelURIs = stateChannelURIs;
    this.stateChannelURIIndex = 0;
    this.noCache = noCache;
    this.noAuth = noAuth;

    this.userProfileTransaction = "";

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

    this.channelContentTokens = {};

    this.requestIds = {};
  }

  async AuthorizationHeader({
    libraryId,
    objectId,
    versionHash,
    transactionHash,
    update=false,
    channelAuth=false,
    noCache=false,
    noAuth=false
  }) {
    const authorizationToken = await this.AuthorizationToken({
      libraryId,
      objectId,
      versionHash,
      transactionHash,
      update,
      channelAuth,
      noCache,
      noAuth
    });

    return { Authorization: "Bearer " + authorizationToken };
  }

  // Wrapper for GenerateAuthorizationHeader to allow for per-call disabling of cache
  async AuthorizationToken({
    libraryId,
    objectId,
    versionHash,
    transactionHash,
    update=false,
    channelAuth=false,
    noCache=false,
    noAuth=false
  }) {
    const initialNoCache = this.noCache;

    try {
      // noCache enabled for this call
      if (noCache && !this.noCache) {
        this.noCache = true;
      }

      let authorizationToken;
      if(channelAuth) {
        authorizationToken = await this.GenerateChannelContentToken({objectId});
      } else {
        authorizationToken = await this.GenerateAuthorizationToken({
          libraryId,
          objectId,
          versionHash,
          transactionHash,
          update,
          noAuth
        });
      }

      this.noCache = initialNoCache;

      return authorizationToken;
    } catch(error) {
      // Ensure nocache is properly reset
      this.noCache = initialNoCache;
      throw error;
    }
  }

  async IsOwner({id, abi}) {
    if(!this.client.signer) { return false; }

    const ownerAddress = await this.client.CallContractMethod({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "owner",
      methodArgs: []
    });

    return ownerAddress.toLowerCase() === this.client.signer.address.toLowerCase();
  }

  async Sign(message) {
    return await Promise.resolve(
      Ethers.utils.joinSignature(this.client.signer.signingKey.signDigest(message))
    );
  }

  async MakeStateChannelRequest(params, attempts=0) {
    try {
      const stateChannelProvider = new Ethers.providers.JsonRpcProvider(this.stateChannelURIs[this.stateChannelURIIndex]);
      return await stateChannelProvider.send("elv_channelContentRequest", params);
    } catch(error) {
      if(attempts < this.stateChannelURIs.length) {
        this.stateChannelURIIndex = (this.stateChannelURIIndex + 1) % this.stateChannelURIs.length;
        return await this.MakeStateChannelRequest(params, attempts+1);
      }

      throw error;
    }
  }

  async GenerateChannelContentToken({objectId, value=0}) {
    if(!this.noCache && this.channelContentTokens[objectId]) {
      return this.channelContentTokens[objectId];
    }

    const nonce = (Date.now() + Id.next());

    const paramTypes = [
      "address",
      "address",
      "uint",
      "uint"
    ];

    let params = [
      this.client.signer.address,
      Utils.HashToAddress(objectId),
      value,
      nonce
    ];

    const packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
    params[4] = await this.Sign(packedHash);

    const payload = await this.MakeStateChannelRequest(params);

    const signature = await this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(payload)));
    const multiSig = Utils.FormatSignature(signature);

    const token = `${payload}.${B64(multiSig)}`;

    if(!this.noCache) {
      this.channelContentTokens[objectId] = token;
    }

    return token;
  }

  async GenerateAuthorizationToken({libraryId, objectId, versionHash, transactionHash, update=false, noAuth=false}) {
    if(!transactionHash && !this.noAuth && !noAuth) {
      const accessTransaction = await this.MakeAccessRequest({
        libraryId,
        objectId,
        versionHash,
        transactionHash,
        update,
        checkAccessCharge: true,
        noCache: this.noCache,
        noAuth
      });
      transactionHash = accessTransaction.transactionHash;
    } else if(this.noAuth) {
      // If noAuth is specified, throw out transaction hash
      transactionHash = undefined;
    }

    let token = {
      qspace_id: this.contentSpaceId,
      addr: ((this.client.signer && this.client.signer.address) || "").replace("0x", ""),
      tx_id: (transactionHash || "").replace("0x", "")
    };

    if(libraryId) {
      token.qlib_id = libraryId;
    }

    token = JSON.stringify(token);

    const signature = await this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(token)));
    const multiSig = Utils.FormatSignature(signature);

    return `${B64(token)}.${B64(multiSig)}`;
  }

  // Generate proper authorization header based on the information provided
  async MakeAccessRequest({
    libraryId,
    objectId,
    versionHash,
    args=[],
    update=false,
    checkAccessCharge=true,
    skipCache=false,
    noCache=false,
    cacheOnly
  }) {
    if(!this.client.signer) { return {transactionHash: ""}; }

    const isUserLibrary = libraryId && libraryId === Utils.AddressToLibraryId(this.client.signer.address);
    const isSpaceLibrary = Utils.EqualHash(this.contentSpaceId, libraryId);
    const isLibraryObject = Utils.EqualHash(libraryId, objectId);
    const cacheCollection = update ? this.modifyTransactions : this.accessTransactions;

    let id, abi, cache;
    let isObjectAccess = false;
    if(isUserLibrary) {
      // User profile library - library ID corresponds to signer's address
      if(!noCache && !skipCache && this.userProfileTransaction) { return this.userProfileTransaction; }

      return {transactionHash: ""};
      const userEvent = await this.client.ethClient.EngageAccountLibrary({
        contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
        signer: this.client.signer
      });

      if(!noCache) {
        this.userProfileTransaction = userEvent.transactionHash;
      }

      return userEvent.transactionHash;
    } else if((!libraryId && !objectId) || (!objectId && isSpaceLibrary) || (isSpaceLibrary && isLibraryObject)) {
      // Content Space - no library and object, content space library or content space library object
      id = this.contentSpaceId;
      abi = SpaceContract.abi;
      cache = cacheCollection.spaces;
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
    } else {
      // Object - any other case
      id = objectId;
      abi = ContentContract.abi;
      cache = cacheCollection.objects;
      isObjectAccess = true;

      if(args && args.length > 0) {
        // Inject public key of requester
        args[1] = this.client.signer.signingKey ? this.client.signer.signingKey.publicKey : "";
      } else {
        // Set default args
        args = [
          0, // Access level
          this.client.signer.signingKey? this.client.signer.signingKey.publicKey : "", // Public key of requester
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

    // If only checking the cache, don't continue to make access request
    if(cacheOnly) { return; }

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
      accessRequest.logs.some(log => {
        if(log.values && log.values.requestID) {
          this.requestIds[id] = log.values.requestID;
          return true;
        }
      });
    }

    // After making an access request, record the tags in the user's profile, if appropriate
    if(isObjectAccess && !update) {
      await this.client.userProfile.RecordTags({libraryId, objectId, versionHash});
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

  async GetAccessCharge({id, abi, args}) {
    // Ensure contract has a getAccessInfo method
    const method = abi.find(element => element.name === "getAccessInfo" && element.type === "function");

    if(!method) { return 0; }

    const info = await this.client.CallContractMethod({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "getAccessInfo",
      methodArgs: args
    });

    return info[1];
  }

  async AccessComplete({id, abi, score}) {
    const requestId = this.requestIds[id];

    if(!requestId) { throw Error("Unknown request ID for " + id); }

    const formattedArgs = this.client.FormatContractArguments({
      abi,
      methodName: "accessComplete",
      args: [requestId, score, ""]
    });

    // If access request did not succeed, no event will be emitted
    const event = await this.client.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "accessComplete",
      methodArgs: formattedArgs
    });

    delete this.requestIds[id];
    delete this.accessTransactions.objects[id];

    return event;
  }

  async AccessRequest({id, abi, args=[], checkAccessCharge=false}) {
    const isOwner = await this.IsOwner({id, abi});

    // Send some bux if access charge is required
    let accessCharge = 0;
    if(!isOwner && checkAccessCharge) {
      // Extract level, custom values and stakeholders from accessRequest arguments
      const accessChargeArgs = [args[0], args[3], args[4]];
      // Access charge is in wei, but methods take ether - convert to charge to ether
      accessCharge = Utils.WeiToEther(await this.GetAccessCharge({id, abi, args: accessChargeArgs}));
    }

    const formattedArgs = this.client.FormatContractArguments({
      abi,
      methodName: "accessRequest",
      args
    });

    // If access request did not succeed, no event will be emitted
    const event = await this.client.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "accessRequest",
      methodArgs: formattedArgs,
      value: accessCharge,
    });

    const accessRequestEvent = this.client.ExtractEventFromLogs({
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
    return await this.client.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "updateRequest",
      methodArgs: [],
    });
  }

  /* Creation methods */

  async CreateAccessGroup() {
    // Deploy contract
    const { contractAddress, transactionHash } = await this.client.ethClient.DeployAccessGroupContract({
      contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
      signer: this.client.signer
    });

    return {
      contractAddress,
      transactionHash
    };
  }

  async CreateContentType() {
    // Deploy contract
    const { contractAddress, transactionHash } = await this.client.ethClient.DeployTypeContract({
      contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
      signer: this.client.signer
    });

    return {
      contractAddress,
      transactionHash
    };
  }

  async CreateContentLibrary() {
    // Deploy contract
    const {contractAddress, transactionHash} = await this.client.ethClient.DeployLibraryContract({
      contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
      signer: this.client.signer
    });

    return {
      contractAddress,
      transactionHash
    };
  }

  async CreateContentObject({libraryId, typeId}) {
    // Deploy contract
    const { contractAddress, transactionHash } = await this.client.ethClient.DeployContentContract({
      contentLibraryAddress: Utils.HashToAddress(libraryId),
      typeAddress: typeId ? Utils.HashToAddress(typeId) : Utils.nullAddress,
      signer: this.client.signer
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
      this.channelContentTokens[objectId] = undefined;
    } else {
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

      this.channelContentTokens = {};
    }
  }
}

module.exports = AuthorizationClient;
