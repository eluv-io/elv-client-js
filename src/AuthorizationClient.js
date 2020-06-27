const HttpClient = require("./HttpClient");
const Ethers = require("ethers");
const Utils = require("./Utils");
const UrlJoin = require("url-join");

/*
// -- Contract javascript files built using build/BuildContracts.js
const SpaceContract = require("./contracts/BaseContentSpace");
const LibraryContract = require("./contracts/BaseLibrary");
const TypeContract = require("./contracts/BaseContentType");
const ContentContract = require("./contracts/BaseContent");
const AccessGroupContract = require("./contracts/BaseAccessControlGroup");
const WalletContract = require("./contracts/BaseAccessWallet");
const AccessibleContract = require("./contracts/Accessible");
const EditableContract = require("./contracts/Editable");
 */

const ACCESS_TYPES = {
  SPACE: "space",
  LIBRARY: "library",
  TYPE: "type",
  OBJECT: "object",
  WALLET: "wallet",
  GROUP: "group",
  ACCESSIBLE: "accessible",
  EDITABLE: "editable",
  OTHER: "other"
};

const CONTRACTS = {
  v2: {
    [ACCESS_TYPES.SPACE]: require("./contracts/v2/BaseContentSpace"),
    [ACCESS_TYPES.LIBRARY]: require("./contracts/v2/BaseLibrary"),
    [ACCESS_TYPES.TYPE]: require("./contracts/v2/BaseContentType"),
    [ACCESS_TYPES.OBJECT]: require("./contracts/v2/BaseContent"),
    [ACCESS_TYPES.WALLET]: require("./contracts/v2/BaseAccessWallet"),
    [ACCESS_TYPES.GROUP]: require("./contracts/v2/BaseAccessControlGroup"),
    [ACCESS_TYPES.ACCESSIBLE]: require("./contracts/v2/Accessible"),
    [ACCESS_TYPES.EDITABLE]: require("./contracts/v2/Editable")
  },
  v3: {
    [ACCESS_TYPES.SPACE]: require("./contracts/v3/BaseContentSpace"),
    [ACCESS_TYPES.LIBRARY]: require("./contracts/v3/BaseLibrary"),
    [ACCESS_TYPES.TYPE]: require("./contracts/v3/BaseContentType"),
    [ACCESS_TYPES.OBJECT]: require("./contracts/v3/BaseContent"),
    [ACCESS_TYPES.WALLET]: require("./contracts/v3/BaseAccessWallet"),
    [ACCESS_TYPES.GROUP]: require("./contracts/v3/BaseAccessControlGroup"),
    [ACCESS_TYPES.ACCESSIBLE]: require("./contracts/v3/Accessible"),
    [ACCESS_TYPES.EDITABLE]: require("./contracts/v3/Editable")
  }
};

class AuthorizationClient {
  Log(message, error=false) {
    if(!this.debug) { return; }

    if(typeof message === "object") {
      message = JSON.stringify(message);
    }

    error ?
      // eslint-disable-next-line no-console
      console.error(`\n(elv-client-js#AuthorizationClient) ${message}\n`) :
      // eslint-disable-next-line no-console
      console.log(`\n(elv-client-js#AuthorizationClient) ${message}\n`);
  }

  constructor({client, contentSpaceId, debug=false, noCache=false, noAuth=false}) {
    this.ACCESS_TYPES = ACCESS_TYPES;
    this.CONTRACTS = CONTRACTS;

    this.client = client;
    this.contentSpaceId = contentSpaceId;
    this.noCache = noCache;
    this.noAuth = noAuth;
    this.debug = debug;

    this.accessTransactions = {
      spaces: {},
      libraries: {},
      objects: {},
      encryptedObjects: {},
      types: {},
      groups: {},
      wallets: {},
      other: {}
    };

    this.modifyTransactions = {
      spaces: {},
      libraries: {},
      objects: {},
      encryptedObjects: {},
      types: {},
      groups: {},
      wallets: {},
      other: {}
    };

    this.methodAvailability = {};
    this.accessVersions = {};
    this.accessTypes = {};
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
    oauthToken,
    noCache=false,
    noAuth=false
  }) {
    if(this.client.staticToken) {
      return this.client.staticToken;
    }

    const initialNoCache = this.noCache;

    try {
      // noCache enabled for this call
      if(noCache && !this.noCache) {
        this.noCache = true;
      }

      let authorizationToken;
      if(channelAuth) {
        authorizationToken = await this.GenerateChannelContentToken({objectId, audienceData, oauthToken});
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

  async GenerateAuthorizationToken({libraryId, objectId, versionHash, partHash, encryption, update=false, noAuth=false}) {
    if(versionHash) { objectId = Utils.DecodeVersionHash(versionHash).objectId; }

    // Generate AFGH public key if encryption is specified
    let publicKey;
    if(encryption && encryption !== "none" && objectId && await this.AccessType(objectId) === ACCESS_TYPES.OBJECT) {
      const owner = await this.Owner({id: objectId});
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
    const { isV3, accessType, abi } = await this.ContractInfo({id});
    const { cache, accessArgs, checkAccessCharge } = await this.AccessInfo({
      accessType,
      publicKey,
      update,
      args,
      isV3
    });

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
      this.Log(`Making update request on ${accessType} ${id}`);
      accessRequest = await this.UpdateRequest({id, abi});
    } else {
      this.Log(`Making access request on ${accessType} ${id}`);
      accessRequest = await this.AccessRequest({id, args: accessArgs, checkAccessCharge});
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

    //this.RecordTags({accessType, libraryId, objectId, versionHash});

    return accessRequest;
  }

  async AccessRequest({id, args=[], checkAccessCharge=false}) {
    const { isV3, accessType, abi } = await this.ContractInfo({id});

    // Send some bux if access charge is required
    let accessCharge = 0;
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

    if(accessCharge > 0) {
      this.Log(`Access charge: ${accessCharge}`);
    }

    let event, methodName;
    const contractAddress = Utils.HashToAddress(id);
    if(isV3) {
      methodName = "accessRequestV3";
    } else {
      methodName = "accessRequest";
    }

    if(!(await this.ContractHasMethod({contractAddress, abi, methodName}))) {
      this.Log(`${accessType} ${id} has no ${methodName} method. Skipping`);
      return { transactionHash: "", logs: [] };
    }

    event = await this.client.CallContractMethodAndWait({
      contractAddress,
      abi,
      methodName,
      methodArgs: args,
      value: accessCharge
    });

    // If access request did not succeed, no event will be emitted
    if(event.logs.length === 0) {
      throw Error("Access denied");
    }

    return event;
  }

  async UpdateRequest({id, abi}) {
    const event = await this.client.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(id),
      abi,
      methodName: "updateRequest",
      methodArgs: [],
    });

    const updateRequestEvent = this.client.ExtractEventFromLogs({
      abi,
      event,
      eventName: "UpdateRequest"
    });

    if(event.logs.length === 0 || !updateRequestEvent) {
      throw Error("Update request denied");
    }

    return event;
  }

  async GenerateChannelContentToken({objectId, audienceData, oauthToken, value=0}) {
    if(oauthToken) {
      return await this.GenerateOauthChannelToken({
        objectId,
        token: oauthToken,
      });
    }

    if(!this.noCache && this.channelContentTokens[objectId]) {
      if(this.channelContentTokens[objectId].issuedAt > (Date.now() - (12 * 60 * 60 * 1000))) {
        return this.channelContentTokens[objectId].token;
      }

      // Token expired
      this.channelContentTokens[objectId] = undefined;
    }

    this.Log(`Making state channel access request: ${objectId}`);

    let stateChannelApi = "elv_channelContentRequest";
    let additionalParams = [];
    if(audienceData) {
      stateChannelApi = "elv_channelContentRequestContext";
      additionalParams = [JSON.stringify(audienceData)];
    }

    const payload = await this.MakeKMSCall({
      objectId,
      methodName: stateChannelApi,
      paramTypes: ["address", "address", "uint", "uint"],
      params: [this.client.signer.address, Utils.HashToAddress(objectId), value, Date.now()],
      additionalParams
    });

    const signature = await this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(payload)));
    const multiSig = Utils.FormatSignature(signature);

    const token = `${payload}.${Utils.B64(multiSig)}`;

    if(!this.noCache) {
      this.channelContentTokens[objectId] = {
        token,
        issuedAt: Date.now()
      };
    }

    return token;
  }

  async ChannelContentFinalize({objectId, audienceData, percent=0}) {
    this.Log(`Making state channel finalize request: ${objectId}`);

    const result = await this.MakeKMSCall({
      objectId,
      methodName: "elv_channelContentFinalizeContext",
      paramTypes: ["address", "address", "uint", "uint"],
      params: [this.client.signer.address, Utils.HashToAddress(objectId), percent, Date.now()],
      additionalParams: [JSON.stringify(audienceData)]
    });

    this.channelContentTokens[objectId] = undefined;

    return result;
  }

  async GenerateOauthChannelToken({objectId, versionHash, token}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    if(!this.noCache && this.channelContentTokens[objectId]) {
      if(this.channelContentTokens[objectId].issuedAt > (Date.now() - (12 * 60 * 60 * 1000))) {
        return this.channelContentTokens[objectId].token;
      }

      // Token expired
      this.channelContentTokens[objectId] = undefined;
    }

    const fabricToken = await (await this.MakeKMSRequest({
      objectId,
      versionHash,
      method: "GET",
      path: UrlJoin("ks", "jwt", "q", objectId),
      bodyType: "NONE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })).text();

    if(!this.noCache) {
      this.channelContentTokens[objectId] = {
        token: fabricToken,
        issuedAt: Date.now()
      };
    }

    return fabricToken;
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

      case ACCESS_TYPES.GROUP:
        cache = cache.groups;
        break;

      case ACCESS_TYPES.WALLET:
        cache = cache.wallets;
        break;

      case ACCESS_TYPES.OBJECT:
        cache = publicKey ? cache.encryptedObjects : cache.objects;
        break;
      default:
        cache = cache.other;
    }

    cache[address] = transactionHash;
  }

  async IsV3({id}) {
    if(!this.accessVersions[id]) {
      this.accessVersions[id] = await this.ContractHasMethod({
        contractAddress: this.client.utils.HashToAddress(id),
        abi: this.CONTRACTS.v3[this.ACCESS_TYPES.ACCESSIBLE].abi,
        methodName: "accessRequestV3"
      });
    }

    return this.accessVersions[id];
  }

  async AccessInfo({accessType, publicKey, args, isV3}) {
    let cache, checkAccessCharge;

    switch(accessType) {
      case ACCESS_TYPES.SPACE:
        cache = {
          access: this.accessTransactions.spaces,
          modify: this.modifyTransactions.spaces,
        };
        break;

      case ACCESS_TYPES.LIBRARY:
        cache = {
          access: this.accessTransactions.libraries,
          modify: this.modifyTransactions.libraries,
        };
        break;

      case ACCESS_TYPES.TYPE:
        cache = {
          access: this.accessTransactions.types,
          modify: this.modifyTransactions.types
        };
        break;

      case ACCESS_TYPES.GROUP:
        cache = {
          access: this.accessTransactions.groups,
          modify: this.modifyTransactions.groups
        };
        break;

      case ACCESS_TYPES.WALLET:
        cache = {
          access: this.accessTransactions.wallets,
          modify: this.modifyTransactions.wallets
        };
        break;

      case ACCESS_TYPES.OBJECT:
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

        if(!isV3) {
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
        }
        break;
      default:
        cache = {
          access: this.accessTransactions.other,
          modify: this.modifyTransactions.other
        };
    }

    if(isV3 && (!args || args.length === 0)) {
      args = [
        [], // customValues
        [] // stakeholders
      ];
    }

    return {
      cache,
      accessArgs: args,
      checkAccessCharge
    };
  }

  // Determine type of ID based on contract version string
  async AccessType(id) {
    const contractName = await this.client.ethClient.ContractName(Utils.HashToAddress(id));

    if(!this.accessTypes[id]) {
      let accessType;
      switch(contractName) {
        case "BaseContentSpace":
          accessType = ACCESS_TYPES.SPACE;
          break;
        case "BaseLibrary":
          accessType = ACCESS_TYPES.LIBRARY;
          break;
        case "BaseContentType":
          accessType = ACCESS_TYPES.TYPE;
          break;
        case "BsAccessWallet":
          accessType = ACCESS_TYPES.WALLET;
          break;
        case "BsAccessCtrlGrp":
          accessType = ACCESS_TYPES.GROUP;
          break;
        case "BaseContent":
          accessType = ACCESS_TYPES.OBJECT;
          break;
        default:
          accessType = ACCESS_TYPES.OTHER;
      }

      this.accessTypes[id] = accessType;
    }

    return this.accessTypes[id];
  }

  async AccessComplete({id, score}) {
    this.Log(`Calling access complete on ${id} with score ${score}`);
    const { abi } = await this.ContractInfo({id});

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

  async ContractInfo({id, address}) {
    if(!address) { address = Utils.HashToAddress(id); }
    if(!id) { id = Utils.AddressToObjectId(address); }

    const isV3 = await this.IsV3({id});
    const version = isV3 ? "v3" : "v2";
    const accessType = await this.AccessType(id);

    if(accessType === this.ACCESS_TYPES.OTHER) { return; }

    return {
      isV3,
      accessType,
      abi: this.CONTRACTS[version][accessType].abi
    };
  }

  async GetAccessCharge({objectId, args}) {
    const { abi } = await this.ContractInfo({id: objectId});

    const info = await this.client.CallContractMethod({
      contractAddress: Utils.HashToAddress(objectId),
      abi,
      methodName: "getAccessInfo",
      methodArgs: args
    });

    return info[2];
  }

  async Owner({id, address}) {
    if(!this.client.signer) { return false; }

    if(id) {
      address = Utils.HashToAddress(id);
    }

    const ownerAddress = await this.client.CallContractMethod({
      contractAddress: address,
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

    const { abi } = await this.ContractInfo({id: objectId});

    return await this.client.CallContractMethod({
      contractAddress: Utils.HashToAddress(objectId),
      abi,
      methodName: "addressKMS"
    });
  }

  async KMSInfo({objectId, versionHash, kmsId}) {
    let KMSInfo;
    if(kmsId) {
      const { abi } = await this.ContractInfo({address: this.client.contentSpaceAddress});

      KMSInfo = await this.client.CallContractMethod({
        contractAddress: this.client.contentSpaceAddress,
        abi,
        methodName: "getKMSInfo",
        methodArgs: [kmsId, []],
        formatArguments: false
      });
    } else {
      if(versionHash) {
        objectId = Utils.DecodeVersionHash(versionHash).objectId;
      }

      const { abi } = await this.ContractInfo({id: objectId});

      // Get KMS info for the object
      KMSInfo = await this.client.CallContractMethod({
        contractAddress: Utils.HashToAddress(objectId),
        abi,
        methodName: "getKMSInfo",
        methodArgs: [[]],
        formatArguments: false
      });
    }

    // Public key is compressed and hashed
    const publicKey = Ethers.utils.computePublicKey(Utils.HashToAddress(KMSInfo[1]), false);

    return {
      urls: KMSInfo[0].split(","),
      publicKey
    };
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

    return await this.MakeKMSCall({
      objectId,
      methodName: "elv_getSymmetricKeyAuth",
      paramTypes: ["string", "string", "string", "string", "string"],
      params: [this.client.contentSpaceId, libraryId, objectId, kmsCap || "", ""]
    });
  }

  // Make an RPC call to the KMS with signed parameters
  async MakeKMSCall({kmsId, objectId, versionHash, methodName, params, paramTypes, additionalParams=[]}) {
    if(versionHash) { objectId = Utils.DecodeVersionHash(versionHash).objectId; }

    if(!objectId) {
      kmsId = `ikms${Utils.AddressToHash(await this.client.DefaultKMSAddress())}`;
    }

    const packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
    params.push(await this.Sign(packedHash));
    params = params.concat(additionalParams);

    const KMSUrls = (await this.KMSInfo({kmsId, objectId, versionHash})).urls;

    for(let i = 0; i < KMSUrls.length; i++) {
      try {
        this.Log(
          `Making KMS request:
          URL: ${KMSUrls[i]}
          Method: ${methodName}
          Params: ${params.join(", ")}`
        );

        const stateChannelProvider = new Ethers.providers.JsonRpcProvider(KMSUrls[i]);
        return await stateChannelProvider.send(methodName, params);
      } catch(error) {
        this.Log(`KMS Call Error: ${error}`, true);

        // If the request has been attempted on all KMS urls, throw the error
        if(i === KMSUrls.length - 1) {
          throw error;
        }
      }
    }
  }

  // Make an arbitrary HTTP call to the KMS
  async MakeKMSRequest({kmsId, objectId, versionHash, method="GET", path, bodyType, body={}, queryParams={}, headers}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    if(!objectId) {
      kmsId = `ikms${Utils.AddressToHash(await this.client.DefaultKMSAddress())}`;
    }

    const kmsUrls = (await this.KMSInfo({kmsId, objectId, versionHash})).urls;

    if(!kmsUrls || !kmsUrls[0]) {
      throw Error(`No KMS info set for ${versionHash || objectId || "default KMS"}`);
    }

    const kmsHttpClient = new HttpClient({
      uris: [kmsUrls[0]],
      debug: this.debug
    });

    return await kmsHttpClient.Request({
      method,
      path,
      bodyType,
      body,
      headers,
      queryParams
    });
  }

  async ContractHasMethod({contractAddress, abi, methodName}) {
    contractAddress = Utils.FormatAddress(contractAddress);

    const key = `${contractAddress}-${methodName}`;

    if(this.methodAvailability[key] === undefined) {
      this.Log(`Checking method availability: ${contractAddress} ${methodName}`);

      if(!abi) {
        abi = (await this.ContractInfo({address: contractAddress})).abi;
      }

      const method = abi.find(method => method.name === methodName);

      if(!method) {
        return false;
      }

      const methodSignature = `${method.name}(${method.inputs.map(i => i.type).join(",")})`;
      const methodId = Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(methodSignature))
        .replace("0x", "")
        .slice(0, 8);

      this.methodAvailability[key] = await this.MakeElvMasterCall({
        methodName: "elv_deployedContractHasMethod",
        params: [
          contractAddress,
          methodId
        ]
      });
    }

    return this.methodAvailability[key];
  }

  async MakeElvMasterCall({methodName, params}) {
    const ethUrls = this.client.ethClient.ethereumURIs;

    for(let i = 0; i < ethUrls.length; i++) {
      try {
        const url = ethUrls[i];

        this.Log(
          `Making elv-master request:
          URL: ${url}
          Method: ${methodName}
          Params: ${params.join(", ")}`
        );

        const elvMasterProvider = new Ethers.providers.JsonRpcProvider(url);
        return await elvMasterProvider.send(methodName, params);
      } catch(error) {
        this.Log(`elv-master Call Error: ${error}`, true);

        // If the request has been attempted on all KMS urls, throw the error
        if(i === ethUrls.length - 1) {
          throw error;
        }
      }
    }
  }

  async ReEncryptionConk({libraryId, objectId, versionHash}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    if(!this.reencryptionKeys[objectId]) {
      let cap = await this.client.Crypto.GenerateTargetConk();
      cap.symm_key = await this.KMSSymmetricKey({libraryId, objectId});

      this.reencryptionKeys[objectId] = cap;
    }

    return this.reencryptionKeys[objectId];
  }

  async RecordTags({accessType, libraryId, objectId, versionHash}) {
    if(accessType !== ACCESS_TYPES.OBJECT) { return; }

    const { abi } = await this.ContractInfo({id: objectId});

    // After making an access request, record the tags in the user's profile, if appropriate
    const owner = await this.Owner({id: objectId, abi});
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
      groups: {},
      wallets: {},
      other: {}
    };

    this.modifyTransactions = {
      spaces: {},
      libraries: {},
      types: {},
      objects: {},
      encryptedObjects: {},
      groups: {},
      wallets: {},
      other: {}
    };

    this.channelContentTokens = {};
  }
}

module.exports = AuthorizationClient;
