const Ethers = require("ethers");
const Id = require("./Id");
const Crypto = require("./Crypto");
const Utils = require("./Utils");

// -- Contract javascript files built using build/BuildContracts.js
const SpaceContract = require("./contracts/BaseContentSpace");
const LibraryContract = require("./contracts/BaseLibrary");
const TypeContract = require("./contracts/BaseContentType");
const ContentContract = require("./contracts/BaseContent");
const AccessibleContract = require("./contracts/Accessible");
const EditableContract = require("./contracts/Editable");

const ACCESS_TYPES = {
  SPACE: "space",
  LIBRARY: "library",
  TYPE: "type",
  OBJECT: "object",
  WALLET: "wallet",
  GROUP: "group",
  OTHER: "other"
};

class AuthorizationClient {
  constructor({client, contentSpaceId, noCache=false, noAuth=false}) {
    this.client = client;
    this.contentSpaceId = contentSpaceId;
    this.noCache = noCache;
    this.noAuth = noAuth;

    this.accessTransactions = {
      spaces: {},
      libraries: {},
      objects: {},
      encryptedObjects: {},
      types: {},
      other: {}
    };

    this.modifyTransactions = {
      spaces: {},
      libraries: {},
      objects: {},
      encryptedObjects: {},
      types: {},
      other: {}
    };

    this.channelContentTokens = {};
    this.reencryptionKeys = {};
    this.requestIds = {};
  }

  // Return authorization token in appropriate headers
  async AuthorizationHeader(params) {
    const authorizationToken = await this.AuthorizationToken(params);

    const headers = { Authorization: "Bearer " + authorizationToken };

    if(params.encryption && params.encryption !== "none") {
      headers["X-Content-Fabric-Encryption-Scheme"] = params.encryption;
    }

    return headers;
  }

  // Wrapper for GenerateAuthorizationHeader to allow for per-call disabling of cache
  async AuthorizationToken({
    libraryId,
    objectId,
    versionHash,
    partHash,
    encryption,
    audienceData,
    update=false,
    channelAuth=false,
    noCache=false,
    noAuth=false
  }) {
    const initialNoCache = this.noCache;

    try {
      // noCache enabled for this call
      if(noCache && !this.noCache) {
        this.noCache = true;
      }

      let authorizationToken;
      if(channelAuth) {
        authorizationToken = await this.GenerateChannelContentToken({objectId, audienceData});
      } else {
        authorizationToken = await this.GenerateAuthorizationToken({
          libraryId,
          objectId,
          versionHash,
          partHash,
          encryption,
          update,
          noAuth
        });
      }

      return authorizationToken;
    } catch(error) {
      throw error;
    } finally {
      this.noCache = initialNoCache;
    }
  }

  async GenerateChannelContentToken({objectId, audienceData, value=0}) {
    if(!this.noCache && this.channelContentTokens[objectId]) {
      return this.channelContentTokens[objectId];
    }

    const nonce = Date.now() + Id.next();

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

    let stateChannelApi = "elv_channelContentRequest";
    if(audienceData) {
      stateChannelApi = "elv_channelContentRequestContext";
      params[5] = JSON.stringify(audienceData);
    }

    const stateChannelUri = await this.KMSUrl({objectId});
    const stateChannelProvider = new Ethers.providers.JsonRpcProvider(stateChannelUri);
    const payload = await stateChannelProvider.send(stateChannelApi, params);

    const signature = await this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(payload)));
    const multiSig = Utils.FormatSignature(signature);

    const token = `${payload}.${Utils.B64(multiSig)}`;

    if(!this.noCache) {
      this.channelContentTokens[objectId] = token;
    }

    return token;
  }

  async GenerateAuthorizationToken({libraryId, objectId, versionHash, partHash, encryption, update=false, noAuth=false}) {
    if(versionHash) { objectId = Utils.DecodeVersionHash(versionHash).objectId; }

    // Generate AFGH public key if encryption is specified
    let publicKey;
    if(encryption && objectId && await this.AccessType(objectId) === ACCESS_TYPES.OBJECT) {
      const owner = await this.Owner({id: objectId, abi: ContentContract.abi});
      if(!Utils.EqualAddress(owner, this.client.signer.address)) {
        const cap = await this.ReEncryptionConk({libraryId, objectId});
        publicKey = cap.public_key;
      }
    }

    let token = {
      qspace_id: this.contentSpaceId,
      addr: Utils.FormatAddress(((this.client.signer && this.client.signer.address) || ""))
    };

    if(!(this.noAuth || noAuth)) {
      const { transactionHash } =  await this.MakeAccessRequest({
        libraryId,
        objectId,
        versionHash,
        update,
        publicKey,
        noCache: this.noCache,
        noAuth: this.noAuth || noAuth
      });

      token.tx_id = transactionHash;
    }

    if(libraryId) {
      token.qlib_id = libraryId;
    }

    if(partHash) {
      token.qphash = partHash;
    }

    if(publicKey) {
      token.afgh_pk = publicKey;
    }

    token = Utils.B64(JSON.stringify(token));

    const signature = await this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(token)));
    const multiSig = Utils.FormatSignature(signature);

    return `${token}.${Utils.B64(multiSig)}`;
  }

  async MakeAccessRequest({
    libraryId,
    objectId,
    versionHash,
    args=[],
    publicKey="",
    update=false,
    skipCache=false,
    noCache=false,
    cacheOnly
  }) {
    if(!this.client.signer) {
      return { transactionHash: "" };
    }

    // Ensure the user's wallet contract has been deployed before performing the access request
    const walletContractAddress = await this.client.userProfileClient.UserWalletAddress({
      address: this.client.signer.address
    });

    if(!walletContractAddress) {
      // Attempt to create the wallet - will return undefined if the account has insufficient funds
      const walletCreated = await this.client.userProfileClient.WalletAddress();

      if(!walletCreated) {
        throw Error("User wallet contract is required to make access requests");
      }
    }

    if(versionHash) { objectId = Utils.DecodeVersionHash(versionHash).objectId; }

    const id = objectId || libraryId || this.contentSpaceId;
    const accessType = await this.AccessType(id);

    const {abi, cache, accessArgs, checkAccessCharge} = this.AccessInfo({accessType, publicKey, args});

    const address = Utils.HashToAddress(id);

    // Check cache for existing transaction
    if(!noCache && !skipCache) {
      let cacheHit = update ? cache.modify[address] : cache.access[address];

      if(cacheHit) { return { transactionHash: cacheHit }; }
    }

    // If only checking the cache, don't continue to make access request
    if(cacheOnly) { return; }

    let accessRequest = { transactionHash: "" };
    // Make the request
    if(update) {
      accessRequest = await this.UpdateRequest({id, abi});
    } else {
      accessRequest = await this.AccessRequest({id, abi, args: accessArgs, checkAccessCharge});
    }

    // Cache the transaction hash
    if(!noCache) {
      this.CacheTransaction({accessType, address, publicKey, update, transactionHash: accessRequest.transactionHash});

      // Save request ID if present
      accessRequest.logs.some(log => {
        if(log.values && log.values.requestID) {
          this.requestIds[address] = log.values.requestID;
          return true;
        }
      });
    }

    this.RecordTags({accessType, libraryId, objectId, versionHash});

    return accessRequest;
  }

  async AccessRequest({id, abi, args=[], checkAccessCharge=false}) {
    // Send some bux if access charge is required
    let accessCharge = 0;
    const accessType = await this.AccessType(id);
    if(checkAccessCharge && accessType === ACCESS_TYPES.OBJECT) {
      const owner = await this.Owner({id, abi});
      // Owner doesn't have to pay
      if(!Utils.EqualAddress(this.client.signer.address, owner)) {
        // Extract level, custom values and stakeholders from accessRequest arguments
        const accessChargeArgs = [args[0], args[3], args[4]];
        // Access charge is in wei, but methods take ether - convert to charge to ether
        accessCharge = Utils.WeiToEther(await this.GetAccessCharge({objectId: id, args: accessChargeArgs}));
      }
    }

    // If access request did not succeed, no event will be emitted
    const event = await this.client.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "accessRequest",
      methodArgs: args,
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

  CacheTransaction({accessType, address, publicKey, update, transactionHash}) {
    let cache = update ? this.modifyTransactions : this.accessTransactions;

    switch(accessType) {
      case ACCESS_TYPES.SPACE:
        cache = cache.spaces;
        break;

      case ACCESS_TYPES.LIBRARY:
        cache = cache.libraries;
        break;

      case ACCESS_TYPES.TYPE:
        cache = cache.types;
        break;

      case ACCESS_TYPES.OBJECT:
        cache = publicKey ? cache.encryptedObjects : cache.objects;
        break;
      default:
        cache = cache.other;
    }

    cache[address] = transactionHash;
  }

  AccessInfo({accessType, publicKey, args}) {
    let abi, cache, checkAccessCharge;

    switch(accessType) {
      case ACCESS_TYPES.SPACE:
        abi = SpaceContract.abi;
        cache = {
          access: this.accessTransactions.spaces,
          modify: this.modifyTransactions.spaces,
        };
        break;

      case ACCESS_TYPES.LIBRARY:
        abi = LibraryContract.abi;
        cache = {
          access: this.accessTransactions.libraries,
          modify: this.modifyTransactions.libraries,
        };
        break;

      case ACCESS_TYPES.TYPE:
        abi = TypeContract.abi;
        cache = {
          access: this.accessTransactions.types,
          modify: this.modifyTransactions.types
        };
        break;

      case ACCESS_TYPES.OBJECT:
        abi = ContentContract.abi;
        cache = publicKey ?
          {
            access: this.accessTransactions.encryptedObjects,
            modify: this.modifyTransactions.encryptedObjects
          } :
          {
            access: this.accessTransactions.objects,
            modify: this.modifyTransactions.objects
          };
        checkAccessCharge = true;

        if(args && args.length > 0) {
          // Inject public key of requester
          args[1] = this.client.signer.signingKey ? this.client.signer.signingKey.publicKey : "";
        } else {
          // Set default args
          args = [
            0, // Access level
            this.client.signer.signingKey ? this.client.signer.signingKey.publicKey : "", // Public key of requester
            publicKey, //cap.public_key,
            [], // Custom values
            [] // Stakeholders
          ];
        }
        break;
      default:
        abi = update ? EditableContract.abi : AccessibleContract.abi;
        cache = {
          access: this.accessTransactions.other,
          modify: this.modifyTransactions.other
        };
    }

    return {
      abi,
      cache,
      accessArgs: args,
      checkAccessCharge
    };
  }

  // Determine type of ID based on contract version string
  async AccessType(id) {
    const contractName = await this.client.ethClient.ContractName(Utils.HashToAddress(id));

    switch(contractName) {
      case "BaseContentSpace":
        return ACCESS_TYPES.SPACE;
      case "BaseLibrary":
        return ACCESS_TYPES.LIBRARY;
      case "BaseContentType":
        return ACCESS_TYPES.TYPE;
      case "BsAccessWallet":
        return ACCESS_TYPES.WALLET;
      case "BsAccessCtrlGrp":
        return ACCESS_TYPES.GROUP;
      case "BaseContent":
        return ACCESS_TYPES.OBJECT;
      default:
        return ACCESS_TYPES.OTHER;
    }
  }

  async AccessComplete({id, abi, score}) {
    const address = Utils.HashToAddress(id);
    const requestId = this.requestIds[address];

    if(!requestId) { throw Error("Unknown request ID for " + id); }

    // If access request did not succeed, no event will be emitted
    const event = await this.client.CallContractMethodAndWait({
      contractAddress: address,
      abi,
      methodName: "accessComplete",
      methodArgs: [requestId, score, ""]
    });

    delete this.requestIds[address];
    delete this.accessTransactions.objects[address];

    return event;
  }

  /* Utility methods */

  async GetAccessCharge({objectId, args}) {
    const info = await this.client.CallContractMethod({
      contractAddress: Utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "getAccessInfo",
      methodArgs: args
    });

    return info[2];
  }

  async Owner({id, abi}) {
    if(!this.client.signer) { return false; }

    const ownerAddress = await this.client.CallContractMethod({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "owner",
      methodArgs: []
    });

    return Utils.FormatAddress(ownerAddress);
  }

  async Sign(message) {
    return await Promise.resolve(
      Ethers.utils.joinSignature(this.client.signer.signingKey.signDigest(message))
    );
  }

  async KMSAddress({objectId, versionHash}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    return await this.client.CallContractMethod({
      contractAddress: Utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "addressKMS"
    });
  }

  async KMSInfo({objectId, versionHash}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    // Get KMS info for the object
    const KMSInfo = await this.client.CallContractMethod({
      contractAddress: Utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "getKMSInfo",
      methodArgs: [[]],
      formatArguments: false
    });

    // Public key is compressed and hashed
    const publicKey = Ethers.utils.computePublicKey(Utils.HashToAddress(KMSInfo[1]), false);

    return {
      urls: KMSInfo[0],
      publicKey
    };
  }

  async KMSUrl({objectId, versionHash}) {
    let KMSUrls = (await this.KMSInfo({objectId, versionHash})).urls;

    // Randomize order of URLs so the same one isn't chosen every time
    KMSUrls = KMSUrls.split(",").sort(() => 0.5 - Math.random());

    // Prefer HTTPS urls
    return KMSUrls.find(url => url.startsWith("https")) || KMSUrls.find(url => url.startsWith("http"));
  }

  // Retrieve symmetric key for object
  async KMSSymmetricKey({libraryId, objectId}) {
    if(!libraryId) { libraryId = this.client.ContentObjectLibraryId({objectId}); }

    const kmsAddress = await this.KMSAddress({objectId});
    const kmsCapId = `eluv.caps.ikms${Utils.AddressToHash(kmsAddress)}`;
    const kmsCap = await this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: kmsCapId
    });

    const args = [this.client.contentSpaceId, libraryId, objectId, kmsCap];
    const stateChannelUri = await this.KMSUrl({objectId});
    const stateChannelProvider = new Ethers.providers.JsonRpcProvider(stateChannelUri);

    return await stateChannelProvider.send("elv_getSymmetricKey", args);
  }

  async ReEncryptionConk({libraryId, objectId, versionHash}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    if(!this.reencryptionKeys[objectId]) {
      let cap = await Crypto.GenerateTargetConk();
      cap.symm_key = await this.KMSSymmetricKey({libraryId, objectId});

      this.reencryptionKeys[objectId] = cap;
    }

    return this.reencryptionKeys[objectId];
  }

  async RecordTags({accessType, libraryId, objectId, versionHash}) {
    if(accessType !== ACCESS_TYPES.OBJECT) { return; }

    // After making an access request, record the tags in the user's profile, if appropriate
    const owner = await this.Owner({id: objectId, abi: ContentContract.abi});
    if(!Utils.EqualAddress(owner, this.client.signer.address)) {
      await this.client.userProfileClient.RecordTags({libraryId, objectId, versionHash});
    }
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

  async CreateContentLibrary({kmsId}) {
    // Deploy contract
    const {contractAddress, transactionHash} = await this.client.ethClient.DeployLibraryContract({
      contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
      kmsId,
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

    // Cache object creation transaction for use in future updates
    const objectId = Utils.AddressToObjectId(contractAddress);
    if(!this.noCache) {
      this.modifyTransactions.objects[objectId] = transactionHash;
    }

    return {
      contractAddress,
      transactionHash
    };
  }

  // Clear cached access transaction IDs and state channel tokens
  ClearCache() {
    this.accessTransactions = {
      spaces: {},
      libraries: {},
      types: {},
      objects: {},
      encryptedObjects: {},
      other: {}
    };

    this.modifyTransactions = {
      spaces: {},
      libraries: {},
      types: {},
      objects: {},
      encryptedObjects: {},
      other: {}
    };

    this.channelContentTokens = {};
  }
}

module.exports = AuthorizationClient;
