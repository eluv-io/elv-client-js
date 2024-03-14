const HttpClient = require("./HttpClient");
const Ethers = require("ethers");
const Utils = require("./Utils");
const UrlJoin = require("url-join");
const {LogMessage} = require("./LogMessage");

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
  TENANT: "tenant",
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
    [ACCESS_TYPES.EDITABLE]: require("./contracts/v3/Editable"),
    [ACCESS_TYPES.TENANT]: require("./contracts/v3/BaseTenantSpace")
  },
  v3b: {
    [ACCESS_TYPES.GROUP]: require("./contracts/v3b/BaseAccessControlGroup")
  }
};

const TOKEN_DURATION = 120000; //2 min

class AuthorizationClient {
  Log(message, error=false) {
    LogMessage(this, message, error);
  }

  constructor({client, contentSpaceId, debug=false, noCache=false, noAuth=false}) {
    this.ACCESS_TYPES = ACCESS_TYPES;
    this.CONTRACTS = CONTRACTS;

    this.client = client;
    this.contentSpaceId = contentSpaceId;
    this.noCache = noCache;
    this.noAuth = noAuth;
    this.debug = debug;

    this.accessTransactions = {};
    this.modifyTransactions = {};

    this.transactionLocks = {};

    this.methodAvailability = {};
    this.accessVersions = {};
    this.accessTypes = {};
    this.channelContentTokens = {};
    this.encryptionKeys = {};
    this.reencryptionKeys = {};
    this.requestIds = {};

    this.providers = {};
  }

  CreateStaticToken({libraryId}) {
    let token = { qspace_id: this.client.contentSpaceId };

    if(libraryId) {
      token.qlib_id = libraryId;
    }

    return Utils.B64(JSON.stringify(token));
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

  async AuthorizationToken({
    libraryId,
    objectId,
    versionHash,
    partHash,
    encryption,
    audienceData,
    context,
    update=false,
    makeAccessRequest=false,
    channelAuth=false,
    oauthToken,
    noCache=false,
    noAuth=false
  }) {
    if(versionHash) { objectId = this.client.utils.DecodeVersionHash(versionHash).objectId; }

    const isWalletRequest =
      objectId &&
      this.client.signer &&
      this.client.utils.EqualAddress(
        await this.client.userProfileClient.WalletAddress(false),
        this.client.utils.HashToAddress(objectId)
      );

    // User wallet requests can't use static token
    if(this.client.staticToken && !isWalletRequest) {
      return this.client.staticToken;
    }

    const initialNoCache = this.noCache;

    try {
      // noCache enabled for this call
      if(noCache && !this.noCache) {
        this.noCache = true;
      }

      if(channelAuth && this.client.signer && this.client.signer.remoteSigner) {
        // Channel auth not supported for remote signer, use a self-signed no-auth token instead
        noAuth = true;
        channelAuth = false;
      }

      let authorizationToken;
      if(channelAuth) {
        authorizationToken = await this.GenerateChannelContentToken({
          objectId,
          versionHash,
          audienceData,
          context,
          oauthToken
        });
      } else {
        if(noAuth && this.client.signer && this.client.signer.remoteSigner && this.client.signer.unsignedPublicAuth) {
          return this.CreateStaticToken({libraryId});
        }

        authorizationToken = await this.GenerateAuthorizationToken({
          libraryId,
          objectId,
          versionHash,
          partHash,
          encryption,
          update,
          makeAccessRequest
        });
      }

      return authorizationToken;
    } catch(error) {
      throw error;
    } finally {
      this.noCache = initialNoCache;
    }
  }

  async GenerateAuthorizationToken({libraryId, objectId, versionHash, partHash, encryption, update=false, makeAccessRequest=false}) {
    if(versionHash) { objectId = Utils.DecodeVersionHash(versionHash).objectId; }

    // Generate AFGH public key if encryption is specified
    let publicKey;
    if(encryption && encryption !== "none" && objectId && await this.AccessType(objectId) === ACCESS_TYPES.OBJECT) {
      const owner = await this.Owner({id: objectId});
      const ownerCapKey = `eluv.caps.iusr${Utils.AddressToHash(this.client.signer.address)}`;
      const ownerCap = await this.client.ContentObjectMetadata({libraryId, objectId, versionHash, metadataSubtree: ownerCapKey});

      if(!Utils.EqualAddress(owner, this.client.signer.address) && !ownerCap) {
        const cap = await this.ReEncryptionConk({libraryId, objectId});
        publicKey = cap.public_key;
      }
    }

    let token = {
      qspace_id: this.contentSpaceId,
      addr: Utils.FormatAddress(((this.client.signer && this.client.signer.address) || ""))
    };

    if(update || makeAccessRequest) {
      const { transactionHash } =  await this.MakeAccessRequest({
        libraryId,
        objectId,
        versionHash,
        update,
        publicKey,
        noCache: this.noCache
      });

      if(transactionHash) {
        token.tx_id = transactionHash;
      }
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

    if(typeof accessType === "undefined") {
      throw Error(`Unable to determine contract info for ${id} (${this.client.utils.HashToAddress(id)}) - Wrong network?`);
    }

    const { accessArgs, checkAccessCharge } = await this.AccessInfo({
      accessType,
      publicKey,
      update,
      args,
      isV3
    });

    const address = Utils.HashToAddress(id);

    let elapsed = 0;
    while(this.transactionLocks[id]) {
      await new Promise(resolve => setTimeout(resolve, 100));
      elapsed += 100;

      if(elapsed > 15000) {
        this.Log(`Lock never released for ${id} - releasing lock`);
        delete this.transactionLocks[id];
      }
    }

    try {
      this.transactionLocks[id] = true;

      // Check cache for existing transaction
      if(!noCache && !skipCache) {
        let cache = update ? this.modifyTransactions : this.accessTransactions;

        if(cache[address]) {
          // Expire after 12 hours
          if(cache[address].issuedAt > (Date.now() - (12 * 60 * 60 * 1000))) {

            return cache[address];
          } else {
            // Token expired
            delete cache[address];
          }
        }
      }

      // If only checking the cache, don't continue to make access request
      if(cacheOnly) {
        return;
      }

      // Make the request
      let accessRequest;
      if(update) {
        this.Log(`Making update request on ${accessType} ${id}`);
        accessRequest = await this.UpdateRequest({id, abi});
      } else {
        this.Log(`Making access request on ${accessType} ${id}`);
        accessRequest = await this.AccessRequest({id, args: accessArgs, checkAccessCharge});
      }

      const cache = update ? this.modifyTransactions : this.accessTransactions;

      try {
        if(!noCache) {
          cache[address] = {
            issuedAt: Date.now(),
            transactionHash: accessRequest.transactionHash
          };

          // Save request ID if present
          accessRequest.logs.some(log => {
            if(log.args && (log.args.requestID || log.args.requestNonce)) {
              this.requestIds[address] = (log.args.requestID || log.args.requestNonce || "").toString().replace(/^0x/, "");
              return true;
            }
          });
        }

        return accessRequest;
      } catch(error) {
        if(!noCache) {
          delete cache[address];
        }

        throw error;
      }
    } finally {
      delete this.transactionLocks[id];
    }
  }

  async AccessRequest({id, args=[], checkAccessCharge=false}) {
    const { isV3, accessType, abi } = await this.ContractInfo({id});

    // Send some bux if access charge is required
    let accessCharge = 0;
    if(checkAccessCharge && accessType === ACCESS_TYPES.OBJECT) {
      const owner = await this.Owner({id, abi});
      // Owner doesn't have to pay
      if(!Utils.EqualAddress(this.client.signer.address, owner)) {
        try {
          // Extract level, custom values and stakeholders from accessRequest arguments
          const accessChargeArgs = isV3 ? [0, [], []] : [args[0], args[3], args[4]];
          // Access charge is in wei, but methods take ether - convert to charge to ether
          accessCharge = Utils.WeiToEther(await this.GetAccessCharge({objectId: id, args: accessChargeArgs}));
        } catch(error) {
          this.Log("Failed to get access charge for", id);
          this.Log(error);
        }
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
      throw Error(`Access denied (${id})`);
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
      throw Error(`Update request denied for ${id}`);
    }

    return event;
  }

  AudienceData({objectId, versionHash, protocols=[], drms=[], context}) {
    this.Log(`Retrieving audience data: ${objectId}`);

    context = context || this.client.authContext || {};
    if(Object.values(context).find(value => typeof value !== "string")) {
      throw Error("Context must be a map of string->string");
    }

    let data = {
      user_address: Utils.FormatAddress(this.client.signer.address),
      content_id: objectId || Utils.DecodeVersionHash(versionHash).id,
      content_hash: versionHash,
      hostname: this.client.HttpClient.BaseURI().hostname(),
      access_time: Math.round(new Date().getTime()).toString(),
      format: protocols.join(","),
      drm: drms.join(","),
      ...context
    };

    if(typeof window !== "undefined" && window.navigator) {
      data.user_string = window.navigator.userAgent;
      data.language = window.navigator.language;
    }

    this.Log(data);

    return data;
  }

  async GenerateChannelContentToken({
    objectId,
    versionHash,
    issuer,
    code,
    email,
    audienceData,
    context,
    oauthToken,
    value=0
  }) {
    if(oauthToken) {
      return await this.GenerateOauthChannelToken({
        objectId,
        token: oauthToken,
      });
    }

    if(!this.noCache && this.channelContentTokens[objectId]) {
      // Expire after 12 hours
      if(this.channelContentTokens[objectId].issuedAt > (Date.now() - (12 * 60 * 60 * 1000))) {
        return this.channelContentTokens[objectId].token;
      } else {
        // Token expired
        delete this.channelContentTokens[objectId];
      }
    }

    this.Log(`Making state channel access request: ${objectId}`);

    let token;
    if(issuer) {
      // Ticket API
      const tenantId = issuer.replace(/^\//, "").split("/")[2];

      let kmsAddress;
      try {
        kmsAddress = await this.client.CallContractMethod({
          contractAddress: Utils.HashToAddress(tenantId),
          methodName: "addressKMS"
        });

        if(!kmsAddress) { throw ""; }
      } catch(error) {
        kmsAddress = await this.client.DefaultKMSAddress();
      }

      try {
        token = await Utils.ResponseToFormat(
          "text",
          this.MakeAuthServiceRequest({
            kmsId: "ikms" + Utils.AddressToHash(kmsAddress),
            method: "POST",
            path: UrlJoin("as", issuer),
            body: { "_PASSWORD": code, "_EMAIL": email }
          })
        );
      } catch(error) {
        this.Log("/as token redemption failed:", true);
        this.Log(error, true);

        token = await Utils.ResponseToFormat(
          "text",
          this.MakeKMSRequest({
            kmsId: "ikms" + Utils.AddressToHash(kmsAddress),
            method: "POST",
            path: UrlJoin("ks", issuer),
            body: {"_PASSWORD": code, "_EMAIL": email}
          })
        );
      }

      // Pull target object from token so token can be cached
      objectId = JSON.parse(Utils.FromB64(token)).qid;
    } else {
      // State channel API
      if(!audienceData) {
        audienceData = this.AudienceData({objectId, versionHash, context});
      }

      const stateChannelApi = "elv_channelContentRequestContext";
      const additionalParams = [JSON.stringify(audienceData)];

      const payload = await this.MakeKMSCall({
        objectId,
        methodName: stateChannelApi,
        paramTypes: ["address", "address", "uint", "uint"],
        params: [this.client.signer.address, Utils.HashToAddress(objectId), value, Date.now()],
        additionalParams
      });

      const signature = await this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(payload)));
      const multiSig = Utils.FormatSignature(signature);

      token = `${payload}.${Utils.B64(multiSig)}`;
    }

    if(!this.noCache) {
      this.channelContentTokens[objectId] = {
        token,
        issuedAt: Date.now()
      };
    }

    return token;
  }

  async ChannelContentFinalize({objectId, versionHash, percent=0}) {
    this.Log(`Making state channel finalize request: ${objectId}`);

    const result = await this.MakeKMSCall({
      objectId,
      methodName: "elv_channelContentFinalizeContext",
      paramTypes: ["address", "address", "uint", "uint"],
      params: [this.client.signer.address, Utils.HashToAddress(objectId), percent, Date.now()],
      additionalParams: [JSON.stringify(this.AudienceData({objectId, versionHash}))]
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

  async IsV3({id}) {
    if(this.client.assumeV3) {
      return true;
    }

    const contractName = await this.client.ethClient.ContractName(Utils.HashToAddress(id), true);

    if(!this.accessVersions[contractName]) {
      this.accessVersions[contractName] = this.ContractHasMethod({
        contractAddress: this.client.utils.HashToAddress(id),
        abi: this.CONTRACTS.v3[this.ACCESS_TYPES.ACCESSIBLE].abi,
        methodName: "accessRequestV3"
      });
    }

    return await this.accessVersions[contractName];
  }

  async AccessInfo({accessType, publicKey, args, isV3}) {
    let checkAccessCharge = false;

    if(accessType === ACCESS_TYPES.OBJECT) {
      checkAccessCharge = true;

      if(!isV3) {
        if(args && args.length > 0) {
          // Inject public key of requester
          args[1] = this.client.signer._signingKey ? this.client.signer._signingKey().publicKey : "";
        } else {
          // Set default args
          args = [
            0, // Access level
            this.client.signer._signingKey ? this.client.signer._signingKey().publicKey : "", // Public key of requester
            publicKey, //cap.public_key,
            [], // Custom values
            [] // Stakeholders
          ];
        }
      }
    }

    if(isV3 && (!args || args.length === 0)) {
      args = [
        [], // customValues
        [] // stakeholders
      ];
    }

    return {
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
        case "BaseTenantSpace":
          accessType = ACCESS_TYPES.TENANT;
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
    const { abi, isV3 } = await this.ContractInfo({id});

    const address = Utils.HashToAddress(id);
    const requestId = this.requestIds[address];

    if(!requestId) { throw Error("Unknown request ID for " + id); }

    let event;
    if(isV3) {
      event = await this.client.CallContractMethodAndWait({
        contractAddress: address,
        abi,
        methodName: "accessCompleteV3",
        methodArgs: [requestId, [], []]
      });
    } else {
      event = await this.client.CallContractMethodAndWait({
        contractAddress: address,
        abi,
        methodName: isV3 ? "accessCompleteV3" : "accessComplete",
        methodArgs: [requestId, score, ""]
      });
    }

    delete this.requestIds[address];
    delete this.accessTransactions[address];

    return event;
  }

  /* Utility methods */

  async ContractInfo({id, address}) {
    if(!address) { address = Utils.HashToAddress(id); }
    if(!id) { id = Utils.AddressToObjectId(address); }

    const isV3 = await this.IsV3({id});
    const contractName = await this.client.ethClient.ContractName(Utils.HashToAddress(id), true);
    const accessType = await this.AccessType(id);

    // Contract BsAccessCtrlGrp20210809150000PO has an outdated isAdmin method that checks a managersList array instead of managersMap
    const v3Version = (contractName === "BsAccessCtrlGrp20210809150000PO" && accessType === this.ACCESS_TYPES.GROUP) ? "v3b" : "v3";
    const version = isV3 ? v3Version : "v2";

    if(accessType === this.ACCESS_TYPES.OTHER) { return {}; }

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

    // Info: [visibility, hasAccess, accessCharge]
    return info[1] === 0 ? 0 : info[2];
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
    return await Ethers.utils.joinSignature(
      this.client.signer.signDigest ?
        await this.client.signer.signDigest(message) :
        await this.client.signer._signingKey().signDigest(message)
    );
  }

  async KMSAddress({objectId, versionHash}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    const { abi } = await this.ContractInfo({id: objectId});

    if(!abi) {
      throw Error(`Unable to determine contract info for ${objectId} - wrong network?`);
    }

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
  async RetrieveConk({libraryId, objectId}) {
    if(!libraryId) { libraryId = await this.client.ContentObjectLibraryId({objectId}); }

    const kmsAddress = await this.KMSAddress({objectId});
    const kmsCapId = `eluv.caps.ikms${Utils.AddressToHash(kmsAddress)}`;
    const kmsCap = await this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: kmsCapId
    });

    if(!kmsCap) {
      throw Error("No KMS key set for this object");
    }

    const cap = await this.MakeKMSCall({
      objectId,
      methodName: "elv_getEncryptionKey",
      paramTypes: ["string", "string", "string", "string", "string"],
      params: [this.client.contentSpaceId, libraryId, objectId, kmsCap || "", ""]
    });

    return JSON.parse(Utils.FromB58(cap.replace(/^kp__/, "")).toString("utf-8"));
  }

  // Retrieve symmetric key for object
  async RetrieveReencryptionSymmetricKey({libraryId, objectId}) {
    if(!libraryId) { libraryId = await this.client.ContentObjectLibraryId({objectId}); }

    const kmsAddress = await this.KMSAddress({objectId});
    const kmsCapId = `eluv.caps.ikms${Utils.AddressToHash(kmsAddress)}`;
    const kmsCap = await this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: kmsCapId
    });

    if(!kmsCap) {
      throw Error("No KMS key set for this object");
    }

    return await this.MakeKMSCall({
      objectId,
      methodName: "elv_getSymmetricKeyAuth",
      paramTypes: ["string", "string", "string", "string", "string"],
      params: [this.client.contentSpaceId, libraryId, objectId, kmsCap || "", ""]
    });
  }


  // Make an RPC call to the KMS with signed parameters
  async MakeKMSCall({kmsId, tenantId, objectId, versionHash, methodName, params, paramTypes, additionalParams=[], signature=true}) {
    if(versionHash) { objectId = Utils.DecodeVersionHash(versionHash).objectId; }

    if(!objectId) {
      kmsId = `ikms${Utils.AddressToHash(await this.client.DefaultKMSAddress({tenantId}))}`;
    }

    if(signature) {
      const packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
      params.push(await this.Sign(packedHash));
    }

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

        const kmsUrl = KMSUrls[i];
        if(!this.providers[kmsUrl]) {
          this.providers[kmsUrl] = new Ethers.providers.JsonRpcProvider(kmsUrl, this.client.networkId);
        }

        return await this.providers[kmsUrl].send(methodName, params);
      } catch(error) {
        this.Log(`KMS Call Error: ${error}`, true);

        // If the request has been attempted on all KMS urls, throw the error
        if(i === KMSUrls.length - 1) {
          throw error;
        }
      }
    }
  }

  // Make an arbitrary HTTP call to an authority server
  async MakeAuthServiceRequest({kmsId, objectId, versionHash, method="GET", path, bodyType, body={}, queryParams={}, headers}) {
    if(this.client.authServiceURIs.length === 0) {
      return await this.MakeKMSRequest({kmsId, objectId, versionHash, method, path, bodyType, body, queryParams, headers});
    }

    return await this.client.AuthHttpClient.Request({
      method,
      path,
      bodyType,
      body,
      headers,
      queryParams
    });
  }

  // Make an arbitrary HTTP call to the KMS
  async MakeKMSRequest({kmsId, objectId, versionHash, method="GET", path, bodyType, body={}, queryParams={}, headers}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    if(!objectId && !kmsId) {
      kmsId = `ikms${Utils.AddressToHash(await this.client.DefaultKMSAddress())}`;
    }

    const kmsUrls = (await this.KMSInfo({kmsId, objectId, versionHash})).urls;

    if(!kmsUrls || !kmsUrls[0]) {
      throw Error(`No KMS info set for ${versionHash || objectId || "default KMS"}`);
    }

    const kmsHttpClient = new HttpClient({
      uris: kmsUrls
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


  // MakeTenantAuthServiceRequest makes an auth service request with timestamp and signature
  // optional params kmsId, objectId, versionHash, bodyType
  async MakeTenantAuthServiceRequest({ kmsId, objectId, versionHash, method="GET", path, queryParams={}, body={}, headers = {}, useFabricToken=false }) {
    if (!body) {
      body = {};
    }
    let ts = Date.now();
    body.ts = ts;

    let token = "";
    if ( useFabricToken ) {
      token = await this.client.CreateFabricToken({
        duration: TOKEN_DURATION
      });

    } else {
      const { multiSig } = await this.TenantSign({
        message: JSON.stringify(body),
      });
      token = multiSig;
    }

    path = UrlJoin("as", path);
    
    let res;
    res = await this.client.authClient.MakeAuthServiceRequest({
      method,
      path,
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
      queryParams,
    });
    return res;
  }

  // MakeTenantPathAuthServiceRequest makes an auth service request with timestamp in params
  async MakeTenantPathAuthServiceRequest({ path, method, queryParams={}, headers = {}}) {
    let ts = Date.now();
    let params = { ts, ...queryParams };
    const paramString = new URLSearchParams(params).toString();

    var newPath = path + "?" + paramString;

    const { multiSig } = await this.TenantSign({
      message: newPath,
    });

    if (this.debug) {
      console.log(`Authorization: Bearer ${multiSig}`);
    }

    path = UrlJoin("as", path);

    let res = {};
    res = await this.client.authClient.MakeAuthServiceRequest({
      method,
      path,
      headers: {
        Authorization: `Bearer ${multiSig}`,
        ...headers,
      },
      queryParams: { ts, ...queryParams },
    });
    return res;

  }

  async TenantSign({ message }) {
    const signature = await this.client.authClient.Sign(
      Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(message))
    );
    const multiSig = this.client.utils.FormatSignature(signature);
    return { signature, multiSig };
  }

  async ContractHasMethod({contractAddress, abi, methodName}) {
    contractAddress = Utils.FormatAddress(contractAddress);

    const key = `${contractAddress}-${methodName}`;

    if(this.methodAvailability[key] === undefined) {
      this.Log(`Checking method availability: ${contractAddress} ${methodName}`);

      if(!abi) {
        abi = (await this.ContractInfo({address: contractAddress})).abi;
      }

      if(!abi) {
        throw Error(`No ABI for contract ${contractAddress} - Wrong network or deleted item?`);
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
    return await this.client.ethClient.MakeProviderCall({
      methodName: "send",
      args: [methodName, params]
    });
  }

  async ReEncryptionConk({libraryId, objectId, versionHash}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    if(!this.reencryptionKeys[objectId]) {
      let cap = await this.client.Crypto.GenerateTargetConk();
      cap.symm_key = await this.RetrieveReencryptionSymmetricKey({libraryId, objectId});

      this.reencryptionKeys[objectId] = cap;
    }

    return this.reencryptionKeys[objectId];
  }

  async EncryptionConk({libraryId, objectId, versionHash}) {
    if(versionHash) {
      objectId = Utils.DecodeVersionHash(versionHash).objectId;
    }

    if(!libraryId) { libraryId = await this.client.ContentObjectLibraryId({objectId}); }

    if(!this.encryptionKeys[objectId]) {
      const conk = await this.RetrieveConk({libraryId, objectId});

      const { secret_key } = await this.client.Crypto.GeneratePrimaryConk({objectId});
      conk.secret_key = secret_key;

      // { secret_key, public_key, symm_key, block_size }
      this.encryptionKeys[objectId] = conk;
    }

    return this.encryptionKeys[objectId];
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
    let { contractAddress, transactionHash } = await this.client.ethClient.DeployContentContract({
      contentLibraryAddress: Utils.HashToAddress(libraryId),
      typeAddress: typeId ? Utils.HashToAddress(typeId) : Utils.nullAddress,
      signer: this.client.signer
    });

    return {
      contractAddress,
      transactionHash
    };
  }

  // Clear cached access transaction IDs and state channel tokens
  ClearCache() {
    this.accessTransactions = {};
    this.modifyTransactions = {};
    this.channelContentTokens = {};
  }
}

module.exports = AuthorizationClient;
