const URI = require("urijs");
const UrlJoin = require("url-join");
const Ethers = require("ethers");

const AuthorizationClient = require("./AuthorizationClient");
const ElvWallet = require("./ElvWallet");
const EthClient = require("./EthClient");
const UserProfileClient = require("./UserProfileClient");
const HttpClient = require("./HttpClient");
const ContentObjectVerification = require("./ContentObjectVerification");
const Utils = require("./Utils");
const Crypto = require("./Crypto");

const LibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");
const ContentTypeContract = require("./contracts/BaseContentType");
const AccessGroupContract = require("./contracts/BaseAccessControlGroup");

if(typeof Response === "undefined") {
  // eslint-disable-next-line no-global-assign
  Response = (require("node-fetch")).Response;
}

const ResponseToJson = async (response) => {
  return ResponseToFormat("json", response);
};

const ResponseToFormat = async (format, response) => {
  response = await response;

  switch(format.toLowerCase()) {
    case "json":
      return response.json();
    case "text":
      return response.text();
    case "blob":
      return response.blob();
    case "arraybuffer":
      return response.arrayBuffer();
    case "formdata":
      return response.formData();
    default:
      return response;
  }
};

class ElvClient {
  /**
   * Create a new ElvClient
   *
   * @constructor
   *
   * @namedParams
   * @param {string} contentSpaceId - ID of the content space
   * @param {string} hostname - Hostname of the content fabric API
   * @param {(string|number)} port - Port of the content fabric API
   * @param {boolean=} useHTTPS=true - Use HTTPS when communicating with the fabric
   * @param {string} ethHostname - Hostname of the blockchain RPC endpoint
   * @param {(string|number)} ethPort - Port of the blockchain RPC endpoint
   * @param {boolean=} ethUseHTTPS=true - Use HTTPS when communicating with the blockchain
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   * @return {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  constructor({contentSpaceId, hostname, port, useHTTPS=true, ethHostname, ethPort, ethUseHTTPS=true, noCache=false, noAuth=false}) {
    this.contentSpaceId = contentSpaceId;

    this.fabricURI = new URI()
      .protocol(useHTTPS ? "https" : "http")
      .host(hostname)
      .port(port);

    this.HttpClient = new HttpClient(this.fabricURI);

    this.ethereumURI = new URI()
      .protocol(ethUseHTTPS ? "https" : "http")
      .host(ethHostname)
      .port(ethPort)
      .path("")
      .hash("")
      .toString();

    this.noCache = noCache;
    this.noAuth = noAuth;

    this.utils = Utils;

    this.InitializeClients();
  }

  InitializeClients() {
    this.ethClient = new EthClient(this.ethereumURI);

    this.userProfile = new UserProfileClient({client: this});

    this.authClient = new AuthorizationClient({
      client: this,
      contentSpaceId: this.contentSpaceId,
      signer: this.signer,
      noCache: this.noCache,
      noAuth: this.noAuth
    });
  }

  /**
   * Create a new ElvClient from a formatted configuration
   * @see TestConfiguration.json for format of configuration
   *
   * @namedParams
   * @param {Object} configuration - Configuration containing information on connecting
   * to the content fabric and blockchain
   *
   *
   * @returns {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  static FromConfiguration({configuration}) {
    return new ElvClient({
      contentSpaceId: configuration.fabric.contentSpaceId,
      hostname: configuration.fabric.hostname,
      port: configuration.fabric.port,
      useHTTPS: configuration.fabric.use_https,
      ethHostname: configuration.ethereum.hostname,
      ethPort: configuration.ethereum.port,
      ethUseHTTPS: configuration.ethereum.use_https,
      noCache: configuration.noCache,
      noAuth: configuration.noAuth,
    });
  }

  /* Wallet and signers */

  /**
   * Generate a new ElvWallet that is connected to the client's provider
   *
   * @returns {ElvWallet} - ElvWallet instance with this client's provider
   */
  GenerateWallet() {
    return new ElvWallet(this.ethereumURI);
  }

  /**
   * Remove the signer from this client
   */
  ClearSigner() {
    this.signer = undefined;

    this.InitializeClients();
  }

  /**
   * Clear saved access requests
   *
   * @namedParams
   * @param {string=} libraryId - If present, cached access and modification transactions for the specified library will be cleared
   * - Note: This will not clear any transactions for any objects within the library
   * @param {string=} objectId - If present, cached access and modification transactions for the specified object will be cleared
   */
  ClearCache({libraryId, objectId}) {
    this.authClient.ClearCache({libraryId, objectId});
  }

  /**
   * Set the signer for this client to use for blockchain transactions
   *
   * @namedParams
   * @param {object} signer - The ethers.js signer object
   */
  SetSigner({signer}) {
    signer.connect(new Ethers.providers.JsonRpcProvider(this.ethereumURI));
    signer.provider.pollingInterval = 500;
    this.signer = signer;

    this.InitializeClients();
  }

  /**
   * Set the signer for this client to use for blockchain transactions from an existing web3 provider.
   * Useful for integrating with MetaMask
   *
   * @see https://github.com/ethers-io/ethers.js/issues/59#issuecomment-358224800
   *
   * @namedParams
   * @param {object} provider - The web3 provider object
   */
  SetSignerFromWeb3Provider({provider}) {
    this.SetSigner({signer: new Ethers.providers.Web3Provider(provider).getSigner()});
  }

  /**
   * Get the account address of the current signer
   *
   * @returns {string} - The address of the current signer
   */
  CurrentAccountAddress() {
    return this.signer ? this.utils.FormatAddress(this.signer.address) : "";
  }

  /**
   * Make an explicit call to accessRequest or updateRequest of the appropriate contract. Unless noCache is specified on
   * this method or on the client, the resultant transaction hash of this method will be cached for all subsequent
   * access to this contract.
   *
   * Note: Access and update requests are handled automatically by ElvClient. Use this method only if you need to make
   * an explicit call. For example, if you need to specify custom arguments to access a content object, you can call
   * this method explicitly with those arguments. Since the result is cached (by default), all subsequent calls to
   * that content object will be authorized with that AccessRequest transaction.
   *
   * Note: If the access request has an associated charge, this charge will be determined and supplied automatically.
   *
   * TODO: Content space and library access requests are currently disabled for performance reasons
   *
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object
   * @param {Array=} args=[] - Custom arguments to the accessRequest or updateRequest methods
   * @param {boolean=} update=false - If true, will call updateRequest instead of accessRequest
   * @param {boolean=} noCache=false - If true, the resultant transaction hash will not be cached for future use
   *
   * @return {object} - Resultant AccessRequest or UpdateRequest event
   */
  async AccessRequest({libraryId, objectId, versionHash, args=[], update=false, noCache=false}) {
    return await this.authClient.MakeAccessRequest({
      libraryId,
      objectId,
      versionHash,
      args,
      update,
      checkAccessCharge: true,
      skipCache: true,
      noCache
    });
  }

  /**
   * Return the cached access transaction of the specified item, if present
   *
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object
   *
   * @return {string} - The cached transaction hash if present, otherwise undefined
   */
  async CachedAccessTransaction({libraryId, objectId, versionHash}) {
    const cacheResult = await this.authClient.MakeAccessRequest({
      libraryId,
      objectId,
      versionHash,
      cacheOnly: true
    });

    if(cacheResult) {
      return cacheResult.transactionHash;
    }
  }

  /* Content Spaces */

  /**
   * Deploy a new content space contract
   *
   * @namedParams
   * @param {String} name - Name of the content space
   *
   * @returns {Promise<contentSpaceId>} - Content space ID of the created content space
   */
  async CreateContentSpace({name}) {
    const contentSpaceAddress = await this.ethClient.DeployContentSpaceContract({name, signer: this.signer});

    return Utils.AddressToSpaceId(contentSpaceAddress);
  }

  /* Libraries */

  /**
   * List content libraries - returns a list of content library IDs
   *
   * @see GET /qlibs
   *
   * @returns {Promise<Array<string>>}
   */
  async ContentLibraries() {
    let path = UrlJoin("qlibs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Returns information about the content library
   *
   * @see GET /qlibs/:qlibid
   *
   * @namedParams
   * @param {string} libraryId
   *
   * @returns {Promise<*>}
   */
  async ContentLibrary({libraryId}) {
    let path = UrlJoin("qlibs", libraryId);

    let library = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );

    return {
      ...library,
      meta: library.meta || {}
    };
  }

  /**
   * Returns the address of the owner of the specified content library
   *
   * @namedParams
   * @param {string} libraryId
   *
   * @returns {Promise<string>} - The account address of the owner
   */
  async ContentLibraryOwner({libraryId}) {
    return await this.ethClient.CallContractMethod({
      contractAddress: Utils.HashToAddress(libraryId),
      abi: LibraryContract.abi,
      methodName: "owner",
      methodArgs: [],
      signer: this.signer
    });
  }

  /* Library creation and deletion */

  /**
   * Create a new content library.
   *
   * A new content library contract is deployed from
   * the content space, and that contract ID is used to determine the library ID to
   * create in the fabric.
   *
   * @see PUT /qlibs/:qlibid
   *
   * @namedParams
   * @param {string} name - Library name
   * @param {string=} description - Library description
   * @param {blob=} image - Image associated with the library
   * @param {Object=} publicMetadata - Public library metadata
   * @param {Object=} privateMetadata - Private library metadata (metadata of library object)
   *
   * @returns {Promise<string>} - Library ID of created library
   */
  async CreateContentLibrary({
    name,
    description,
    image,
    publicMetadata={},
    privateMetadata={},
    isUserLibrary
  }) {
    let libraryId, transactionHash;
    if(isUserLibrary) {
      libraryId = this.utils.AddressToLibraryId(this.signer.address);
    } else {
      const createRequest = await this.authClient.CreateContentLibrary();

      publicMetadata = {
        ...publicMetadata,
        name,
        "eluv.description": description
      };

      transactionHash = createRequest.transactionHash;
      libraryId = this.utils.AddressToLibraryId(createRequest.contractAddress);
    }

    const path = UrlJoin("qlibs", libraryId);

    // Create library in fabric
    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, transactionHash}),
      method: "PUT",
      path: path,
      body: {
        meta: publicMetadata,
        private_meta: privateMetadata
      }
    });

    // Set library content object type on automatically created library object
    const objectId = libraryId.replace("ilib", "iq__");

    const editResponse = await this.EditContentObject({
      libraryId,
      objectId,
      options: {
        type: "library"
      }
    });

    await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editResponse.write_token
    });

    // Upload image if provided
    if(image) {
      await this.SetContentLibraryImage({
        libraryId,
        image
      });
    }

    return libraryId;
  }

  /**
   * Set the image associated with this library
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {blob} image - Image to upload
   */
  async SetContentLibraryImage({libraryId, image}) {
    const objectId = libraryId.replace("ilib", "iq__");

    return this.SetContentObjectImage({
      libraryId,
      objectId,
      image
    });
  }

  /**
   * Set the image associated with this library
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {blob} image - Image to upload
   */
  async SetContentObjectImage({libraryId, objectId, image}) {
    const editResponse = await this.EditContentObject({
      libraryId,
      objectId
    });

    const uploadResponse = await this.UploadPart({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      data: image,
      encrypted: false
    });

    let metadata = await this.ContentObjectMetadata({
      libraryId,
      objectId
    });

    await this.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadata: {
        ...metadata,
        "image": uploadResponse.part.hash
      }
    });

    await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editResponse.write_token
    });
  }

  /**
   * Delete the specified content library
   *
   * @see DELETE /qlibs/:qlibid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library to delete
   */
  async DeleteContentLibrary({libraryId}) {
    let path = UrlJoin("qlibs", libraryId);

    const authorizationHeader = await this.authClient.AuthorizationHeader({libraryId, update: true});

    await this.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(libraryId),
      abi: LibraryContract.abi,
      methodName: "kill",
      methodArgs: []
    });

    await this.HttpClient.Request({
      headers: authorizationHeader,
      method: "DELETE",
      path: path
    });
  }

  /* Library metadata */

  /**
   * Get the public metadata of the specified library
   *
   * @see GET /qlibs/:qlibid/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string=} metadataSubtree - Subtree of the library metadata to retrieve
   * @returns {Promise<Object>} - Public metadata of the library
   */
  async PublicLibraryMetadata({libraryId, metadataSubtree="/"}) {
    let path = UrlJoin("qlibs", libraryId, "meta", metadataSubtree);

    try {
      const metadata = await ResponseToJson(
        this.HttpClient.Request({
          headers: await this.authClient.AuthorizationHeader({libraryId, noAuth: true}),
          method: "GET",
          path: path
        })
      );

      return metadata || {};
    } catch(error) {
      if(error.status !== 404) {
        throw error;
      }
    }
  }

  /**
   * Replace the specified library's public metadata
   *
   * @see PUT /qlibs/:qlibid/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {Object} metadata - New metadata
   * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
   */
  async ReplacePublicLibraryMetadata({libraryId, metadataSubtree="/", metadata={}}) {
    let path = UrlJoin("qlibs", libraryId, "meta", metadataSubtree);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, update: true}),
      method: "PUT",
      path: path,
      body: metadata
    });
  }

  /**
   * Delete the specified library's public metadata
   *
   * @see DELETE /qlibs/:qlibid/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string=} metadataSubtree - Subtree to delete - modifies root metadata if not specified
   */
  async DeletePublicLibraryMetadata({libraryId, metadataSubtree="/"}) {
    // Note: There is currently no delete method for public metadata
    // Instead, delete metadata manually and call replace
    let metadata = await this.PublicLibraryMetadata({libraryId});

    metadataSubtree = UrlJoin(metadataSubtree || "/");

    if(metadataSubtree === "/") {
      metadata = {};
    } else {
      let pointer = metadata;
      const keys = UrlJoin(metadataSubtree || "/").replace(/^\/+/g, "").split("/");
      for(let i = 0; i < keys.length - 1; i++) {
        pointer = pointer[keys[i]];

        if(!pointer) {
          break;
        }
      }

      if(!pointer || !pointer[keys[keys.length - 1]]) {
        throw Error({
          status: 404,
          statusText: "Not found: " + metadataSubtree
        });
      }

      delete pointer[keys[keys.length - 1]];
    }

    let path = UrlJoin("qlibs", libraryId, "meta");

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, update: true}),
      method: "PUT",
      path: path,
      body: metadata
    });
  }

  /* Library Content Type Management */

  /**
   * Add a specified content type to a library
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string=} typeId - ID of the content type (required unless typeName is specified)
   * @param {string=} typeName - Name of the content type (required unless typeId is specified)
   * @param {string=} customContractAddress - Address of the custom contract to associate with
   * this content type for this library
   *
   * @returns {string} - Hash of the addContentType transaction
   */
  async AddLibraryContentType({libraryId, typeId, typeName, customContractAddress}) {
    if(!typeId) {
      // Look up type by name
      const type = await this.ContentType({name: typeName});
      typeId = type.id;
    }

    const typeAddress = this.utils.HashToAddress(typeId);
    customContractAddress = customContractAddress || this.utils.nullAddress;

    const event = await this.ethClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(libraryId),
      abi: LibraryContract.abi,
      methodName: "addContentType",
      methodArgs: [typeAddress, customContractAddress],
      signer: this.signer
    });

    return event.transactionHash;
  }

  /**
   * Remove the specified content type from a library
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string=} typeId - ID of the content type (required unless typeName is specified)
   * @param {string=} typeName - Name of the content type (required unless typeId is specified)
   *
   * @returns {string} - Hash of the removeContentType transaction
   */
  async RemoveLibraryContentType({libraryId, typeId, typeName}) {
    if(!typeId) {
      // Look up type by name
      const type = await this.ContentType({name: typeName});
      typeId = type.id;
    }

    const typeAddress = this.utils.HashToAddress(typeId);

    const event = await this.ethClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(libraryId),
      abi: LibraryContract.abi,
      methodName: "removeContentType",
      methodArgs: [typeAddress],
      signer: this.signer
    });

    return event.transactionHash;
  }

  /**
   * Retrieve the allowed content types for the specified library.
   *
   * Note: If no content types have been set on the library, all types are allowed, but an empty hash will be returned.
   *
   * @see <a href="#ContentTypes">ContentTypes</a>
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   *
   * @returns {Array<object>} - List of accepted content types - return format is equivalent to ContentTypes method
   */
  async LibraryContentTypes({libraryId}) {
    const typesLength = (await this.ethClient.CallContractMethod({
      contractAddress: Utils.HashToAddress(libraryId),
      abi: LibraryContract.abi,
      methodName: "contentTypesLength",
      methodArgs: [],
      signer: this.signer
    })).toNumber();

    // No allowed types set - any type accepted
    if(typesLength === 0) { return {}; }

    // Get the list of allowed content type addresses
    const allowedTypeAddresses = await Promise.all(
      Array.from(new Array(typesLength), async (_, i) => {
        const typeAddress = await this.ethClient.CallContractMethod({
          contractAddress: Utils.HashToAddress(libraryId),
          abi: LibraryContract.abi,
          methodName: "contentTypes",
          methodArgs: [i],
          signer: this.signer
        });

        return typeAddress.toString().toLowerCase();
      })
    );

    const contentTypes = await this.ContentTypes({});

    let allowedTypes = {};
    Object.values(contentTypes).map(type => {
      const typeAddress = this.utils.HashToAddress(type.id).toLowerCase();
      // If type address is allowed, include it
      if(allowedTypeAddresses.includes(typeAddress)) {
        allowedTypes[type.hash] = type;
      }
    });

    return allowedTypes;
  }

  /* Content Types */

  /**
   * List the content types available in this content space
   *
   * @namedParams
   * @param {boolean=} latestOnly=true - If specified, only the most recent version of the content type will be included.
   *
   * Because content types are specified by their immutable version hash, setting this option to false is useful for
   * looking up information about existing content object types which may have been updated since the object was created.
   *
   * @returns {Promise<Object>} - A mapping of content type version hash to information about that content type version
   */
  async ContentTypes({latestOnly=true} = {}) {
    const contentSpaceAddress = this.utils.HashToAddress(this.contentSpaceId);
    const typeLibraryId = this.utils.AddressToLibraryId(contentSpaceAddress);

    let path = UrlJoin("qlibs", typeLibraryId, "q");

    // Does the same as ContentObjects(), but authorization cannot be performed
    // against the content type library because it does not have a library contract
    const typeObjects = (await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({}),
        method: "GET",
        path: path
      }))).contents;

    let contentTypes = {};
    typeObjects.map(typeObject => {
      // Skip content library object
      if(Utils.EqualHash(typeObject.id, typeLibraryId)) { return; }

      // If latestOnly specified, only include most recent versions
      if(latestOnly) {
        let type = typeObject.versions[0];
        contentTypes[type.hash] = {
          ...type,
          meta: type.meta || {}
        };
      } else {
        // Otherwise, include all versions
        typeObject.versions.map(type => {
          contentTypes[type.hash] = {
            ...type,
            meta: type.meta || {}
          };
        });
      }
    });

    return contentTypes;
  }

  /**
   * Look up content type record by name or by version hash
   *
   * @namedParams
   * @param {string=} name - Name of the content type to find
   * @param {string=} versionHash - Version hash of the content type to find
   *
   * NOTE: If looking up by name, only the latest version of content types will be searched.
   * If a specific version is required, use the version hash.
   *
   * @returns {Promise<Object>}
   */
  async ContentType({name, versionHash}) {
    if(versionHash) {
      const contentSpaceAddress = this.utils.HashToAddress(this.contentSpaceId);
      const typeLibraryId = this.utils.AddressToLibraryId(contentSpaceAddress);

      // Look through all versions of types when searching by version hash
      // Does the same as ContentObjects(), but authorization cannot be performed
      // against the content type library because it does not have a library contract
      const contentType = await ResponseToJson(
        this.HttpClient.Request({
          headers: await this.authClient.AuthorizationHeader({libraryId: typeLibraryId}),
          method: "GET",
          path: UrlJoin("q", versionHash)
        }));
      const contentTypeMetadata = await ResponseToJson(
        this.HttpClient.Request({
          headers: await this.authClient.AuthorizationHeader({libraryId: typeLibraryId}),
          method: "GET",
          path: UrlJoin("q", versionHash, "meta")
        }));

      return {
        ...contentType,
        meta: contentTypeMetadata || {}
      };
    }

    // Only look at latest versions of types when searching by name
    const contentTypes = await this.ContentTypes({latestOnly: true});
    const contentType = Object.values(contentTypes)
      .find(type => {
        const typeName = type.meta && (type.meta.name || type.hash || "");
        return typeName.toLowerCase() === name.toLowerCase();
      });

    if(!contentType) {
      throw Error("Unknown content type: " + name);
    }

    return contentType;
  }

  /**
   * Returns the address of the owner of the specified content type
   *
   * @namedParams
   * @param {string=} name - Name of the content type to find
   * @param {string=} versionHash - Version hash of the content type to find
   *
   * @returns {Promise<string>} - The account address of the owner
   */
  async ContentTypeOwner({name, versionHash}) {
    const contentType = await this.ContentType({name, versionHash});

    return await this.ethClient.CallContractMethod({
      contractAddress: Utils.HashToAddress(contentType.id),
      abi: ContentTypeContract.abi,
      methodName: "owner",
      methodArgs: [],
      signer: this.signer
    });
  }

  /**
   * Create a new content type.
   *
   * A new content type contract is deployed from
   * the content space, and that contract ID is used to determine the object ID to
   * create in the fabric. The content type object will be created in the special
   * content space library (ilib<content-space-hash>)
   *
   * @namedParams
   * @param {object} metadata - Metadata for the new content type
   * @param {(Blob | Buffer)=} bitcode - Bitcode to be used for the content type
   *
   * @returns {Promise<string>} - Object ID of created content type
   */
  async CreateContentType({metadata={}, bitcode}) {
    const { contractAddress, transactionHash } = await this.authClient.CreateContentType();

    const contentSpaceAddress = this.utils.HashToAddress(this.contentSpaceId);
    const typeLibraryId = this.utils.AddressToLibraryId(contentSpaceAddress);

    const objectId = this.utils.AddressToObjectId(contractAddress);
    const path = UrlJoin("qlibs", typeLibraryId, "q", objectId);

    /* Create object, upload bitcode and finalize */

    const createResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId: typeLibraryId, transactionHash}),
        method: "PUT",
        path: path,
        body: {
          type: "",
          meta: metadata
        }
      })
    );

    if(bitcode) {
      const uploadResponse = await this.UploadPart({
        libraryId: typeLibraryId,
        objectId,
        writeToken: createResponse.write_token,
        data: bitcode,
        encrypted: false
      });

      await this.ReplaceMetadata({
        libraryId: typeLibraryId,
        objectId,
        writeToken: createResponse.write_token,
        metadataSubtree: "bitcode_part",
        metadata: uploadResponse.part.hash
      });
    }

    await this.FinalizeContentObject({
      libraryId: typeLibraryId,
      objectId,
      writeToken: createResponse.write_token
    });

    return objectId;
  }

  /**
   * Create a new content type specifying all components.
   *
   * A new content type contract is deployed from
   * the content space, and that contract ID is used to determine the object ID to
   * create in the fabric. The content type object will be created in the special
   * content space library (ilib<content-space-hash>)
   *
   * @namedParams
   * @param {object} metadata - Metadata for the new content type
   * @param {(Blob | Buffer)=} bitcode - Bitcode to be used for the content type
   * @param {object} appsFileInfo - apps in the format required by UploadFiles
   * @param {object} schema - custom schema for the type
   * @param {string} contract - address of the contract associated with this type
   * @returns {Promise<string>} - Object ID of created content type
   */
  async CreateContentTypeFull({metadata={}, bitcode, appsFileInfo, schema, contract}) {
    const { contractAddress, transactionHash } = await this.authClient.CreateContentType();

    const contentSpaceAddress = this.utils.HashToAddress(this.contentSpaceId);
    const typeLibraryId = this.utils.AddressToLibraryId(contentSpaceAddress);

    const objectId = this.utils.AddressToObjectId(contractAddress);
    const path = UrlJoin("qlibs", typeLibraryId, "q", objectId);

    metadata.custom_contract = contract;
    if (schema != null) {
      metadata["eluv.schema"] = schema["eluv.schema"];
    }

    /* Create object, upload bitcode and finalize */

    const createResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId: typeLibraryId, transactionHash}),
        method: "PUT",
        path: path,
        body: {
          type: "",
          meta: metadata
        }
      })
    );

    await this.UploadFiles({
      libraryId: typeLibraryId,
      objectId,
      writeToken: createResponse.write_token,
      fileInfo: appsFileInfo});

    if(bitcode) {
      const uploadResponse = await this.UploadPart({
        libraryId: typeLibraryId,
        objectId,
        writeToken: createResponse.write_token,
        data: bitcode,
        encrypted: false
      });

      await this.ReplaceMetadata({
        libraryId: typeLibraryId,
        objectId,
        writeToken: createResponse.write_token,
        metadataSubtree: "bitcode_part",
        metadata: uploadResponse.part.hash
      });
    }

    await this.FinalizeContentObject({
      libraryId: typeLibraryId,
      objectId,
      writeToken: createResponse.write_token
    });

    return objectId;
  }

  /* Objects */

  /**
   * Call accessComplete on the specified content object contract using a previously cached requestID.
   * Caching must be enabled and an access request must have been previously made on the specified
   * object by this client instance.
   *
   * @namedParams
   * @param {string} objectId - ID of the object
   * @param {number} score - Percentage score (0-100)
   *
   * @returns {Promise<Object>} - Transaction log of the AccessComplete event
   */
  async ContentObjectAccessComplete({objectId, score=100}) {
    if(score < 0 || score > 100) { throw Error("Invalid AccessComplete score: " + score); }

    return await this.authClient.AccessComplete({id: objectId, abi: ContentContract.abi, score});
  }

  /**
   * List content objects in the specified library
   *
   * @see /qlibs/:qlibid/q
   *
   * @namedParams
   * @param libraryId - ID of the library
   *
   * @returns {Promise<Array<Object>>} - List of objects in library
   */
  async ContentObjects({libraryId}) {
    let path = UrlJoin("qlibs", libraryId, "q");

    let objects = (await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    )).contents;

    // Ensure "meta" is set for all versions
    return objects.map(object => {
      return {
        ...object,
        versions: object.versions.map(version => {
          return {
            ...version,
            meta: version.meta || {}
          };
        })
      };
    });
  }

  /**
   * Get a specific content object in the library
   *
   * @see /qlibs/:qlibid/q/:qhit
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
   *
   * @returns {Promise<Object>} - Description of created object
   */
  async ContentObject({libraryId, objectId, versionHash}) {
    let path = UrlJoin("q", versionHash || objectId);

    return await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, noAuth: true}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Get a specific content object in the library by version hash
   *
   * Note: This endpoint does not require authorization
   *
   * @see /q/:qhit
   *
   * @namedParams
   * @param {string=} versionHash - Version hash of the object
   *
   * @returns {Promise<Object>} - Description of created object
   */
  async ContentObjectByHash({versionHash}) {
    let path = UrlJoin("q", versionHash);

    return await ResponseToJson(
      this.HttpClient.Request({
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Returns the address of the owner of the specified content object
   *
   * @namedParams
   * @param {string} libraryId
   *
   * @returns {Promise<string>} - The account address of the owner
   */
  async ContentObjectOwner({objectId}) {
    return await this.ethClient.CallContractMethod({
      contractAddress: Utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "owner",
      methodArgs: [],
      signer: this.signer
    });
  }

  /**
   * Get the metadata of a content object
   *
   * @see /qlibs/:qlibid/q/:qhit/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
   * @param {string=} metadataSubtree - Subtree of the object metadata to retrieve
   * @param {boolean=} noAuth=false - If specified, authorization will not be performed for this call
   *
   * @returns {Promise<Object>} - Metadata of the content object
   */
  async ContentObjectMetadata({libraryId, objectId, versionHash, metadataSubtree="/", noAuth=false}) {
    let path = UrlJoin("q", versionHash || objectId, "meta", metadataSubtree);

    try {
      const metadata = await ResponseToJson(
        this.HttpClient.Request({
          headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, noAuth}),
          method: "GET",
          path: path
        })
      );

      return metadata || {};
    } catch(error) {
      if(error.status !== 404) {
        throw error;
      }
    }
  }

  /**
   * List the versions of a content object
   *
   * @see /qlibs/:qlibid/qid/:objectid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   *
   * @returns {Promise<Object>} - Response containing versions of the object
   */
  async ContentObjectVersions({libraryId, objectId}) {
    let path = UrlJoin("qid", objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Content object creation, modification, deletion */

  /**
   * Create a new content object draft.
   *
   * A new content object contract is deployed from
   * the content library, and that contract ID is used to determine the object ID to
   * create in the fabric.
   *
   * @see PUT /qlibs/:qlibid/q/:objectid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {Object=} options -
   * type: Version hash of the content type to associate with the object
   *
   * meta: Metadata to use for the new object
   *
   * @returns {Promise<Object>} - Response containing the object ID and write token of the draft
   */
  async CreateContentObject({libraryId, options={}}) {
    // Look up content type, if specified
    let typeId;
    if(options.type) {
      let type;
      if(!options.type.startsWith("hq__")) {
        // Type name specified
        type = await this.ContentType({name: options.type});
      } else {
        // Type hash specified
        type = await this.ContentType({versionHash: options.type});
      }

      typeId = type.id;
      options.type = type.hash;
    }

    const { contractAddress, transactionHash } = await this.authClient.CreateContentObject({libraryId, typeId});

    const objectId = this.utils.AddressToObjectId(contractAddress);
    const path = UrlJoin("q", objectId);

    return await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, transactionHash}),
        method: "PUT",
        path: path,
        body: options
      })
    );
  }

  /**
   * Create a new content object draft from an existing content object version.
   *
   * Note: The type of the new copy can be different from the original object.
   *
   * @see <a href="#CreateContentObject">CreateContentObject</a>
   *
   * @namedParams
   * @param {string} libraryId - ID of the library in which to create the new object
   * @param originalVersionHash - Version hash of the object to copy
   * @param {Object=} options -
   * type: Version hash of the content type to associate with the object - may be different from the original object
   *
   * meta: Metadata to use for the new object - This will be merged into the metadata of the original object
   *
   * @returns {Promise<Object>} - Response containing the object ID and write token of the draft
   */
  async CopyContentObject({libraryId, originalVersionHash, options={}}) {
    options.copy_from = originalVersionHash;

    return await this.CreateContentObject({libraryId, options});
  }

  /**
   * Create a new content object draft from an existing object.
   *
   * @see POST /qlibs/:qlibid/qid/:objectid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {object=} options -
   * meta: New metadata for the object - will be merged into existing metadata if specified
   *
   * @returns {Promise<object>} - Response containing the object ID and write token of the draft
   */
  async EditContentObject({libraryId, objectId, options={}}) {
    if(!this.utils.EqualHash(libraryId, objectId)) {
      // Don't allow changing of content type in this method
      delete options.type;
    } else {
      // Unless modifying the content library object
      if(options.type) {
        if(!options.type.startsWith("hq__")) {
          // Type name specified
          options.type = (await this.ContentType({name: options.type})).hash;
        } else {
          // Type hash specified
          options.type = (await this.ContentType({versionHash: options.type})).hash;
        }
      }
    }

    let path = UrlJoin("qid", objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
        path: path,
        body: options
      })
    );
  }

  /**
   * Finalize content draft
   *
   * @see POST /qlibs/:qlibid/q/:write_token
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   */
  async FinalizeContentObject({libraryId, objectId, writeToken}) {
    let path = UrlJoin("q", writeToken);

    const finalizeResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
        path: path
      })
    );

    await this.PublishContentVersion({
      libraryId,
      objectId,
      versionHash: finalizeResponse.hash
    });

    return finalizeResponse;
  }

  /**
   * Publish a content object version
   *
   * NOTE: Not yet intended for use - publishing is done in FinalizeContentObject
   *
   * @see POST /qlibs/:qlibid/q/:write_token
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} versionHash - The version hash of the content object to publish
   */
  async PublishContentVersion({libraryId, objectId, versionHash}) {
    let path = UrlJoin("q", versionHash);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "PUT",
      path: path
    });

    // Temporary - wait for publish to go through and for version to be accessible
    for(let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        return await this.ContentObject({libraryId, objectId, versionHash});
      // eslint-disable-next-line no-empty
      } catch(error) {}
    }

    throw Error("Version not published");
  }

  /**
   * Delete specified version of the content object
   *
   * @see DELETE /qlibs/:qlibid/q/:qhit
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be deleted
   */
  async DeleteContentVersion({libraryId, objectId, versionHash}) {
    let path = UrlJoin("q", versionHash || objectId);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "DELETE",
      path: path
    });
  }

  /**
   * Delete specified content object
   *
   * @see DELETE /qlibs/:qlibid/qid/:objectid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   */
  async DeleteContentObject({libraryId, objectId}) {
    let path = UrlJoin("qid", objectId);

    const authorizationHeader = await this.authClient.AuthorizationHeader({libraryId, objectId, update: true});

    await this.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "kill",
      methodArgs: []
    });

    await this.HttpClient.Request({
      headers: authorizationHeader,
      method: "DELETE",
      path: path
    });
  }

  /* Content object metadata */

  /**
   * Merge specified metadata into existing content object metadata
   *
   * @see POST /qlibs/:qlibid/q/:write_token/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Object} metadata - New metadata to merge
   * @param {string=} metadataSubtree - Subtree of the object metadata to modify
   */
  async MergeMetadata({libraryId, objectId, writeToken, metadataSubtree="/", metadata={}}) {
    let path = UrlJoin("q", writeToken, "meta", metadataSubtree);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "POST",
      path: path,
      body: metadata
    });
  }

  /**
   * Replace content object metadata with specified metadata
   *
   * @see PUT /qlibs/:qlibid/q/:write_token/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Object} metadata - New metadata to merge
   * @param {string=} metadataSubtree - Subtree of the object metadata to modify
   */
  async ReplaceMetadata({libraryId, objectId, writeToken, metadataSubtree="/", metadata={}}) {
    let path = UrlJoin("q", writeToken, "meta", metadataSubtree);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "PUT",
      path: path,
      body: metadata
    });
  }

  /**
   * Delete content object metadata of specified subtree
   *
   * @see DELETE /qlibs/:qlibid/q/:write_token/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {string=} metadataSubtree - Subtree of the object metadata to modify
   * - if not specified, all metadata will be deleted
   */
  async DeleteMetadata({libraryId, objectId, writeToken, metadataSubtree="/"}) {
    let path = UrlJoin("q", writeToken, "meta", metadataSubtree);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "DELETE",
      path: path
    });
  }

  /* Files */

  /**
   * List the file information about this object
   *
   * @see GET /qlibs/:qlibid/q/:qhit/meta/files
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be deleted
   */
  async ListFiles({libraryId, objectId, versionHash}) {
    let path = UrlJoin("q", versionHash || objectId, "meta", "files");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
        method: "GET",
        path: path,
      })
    );
  }

  /**
   * Upload files to a content object.
   * This method encapsulates the complexity of creating upload jobs and uploading data to them.
   * It is highly recommended to use this method over using CreateFileUploadJob, UploadFileData and FinalizeUploadJobs
   * individually
   *
   * @see GET /qlibs/:qlibid/q/:qhit/meta/files
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Array<object>} fileInfo - List of files to upload, including their size, type, and contents
   */
  async UploadFiles({libraryId, objectId, writeToken, fileInfo}) {
    // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
    let fileDataMap = {};
    fileInfo = fileInfo.map(entry => {
      fileDataMap[entry.path] = entry.data;

      return {
        ...entry,
        data: undefined
      };
    });

    const uploadJobs = (await this.CreateFileUploadJob({libraryId, objectId, writeToken, fileInfo})).upload_jobs;

    await Promise.all(
      uploadJobs.map(async jobInfo => {
        for(const fileInfo of jobInfo.files) {
          const fileData = fileDataMap[fileInfo.path].slice(fileInfo.off, fileInfo.off + fileInfo.len);
          await this.UploadFileData({
            libraryId,
            objectId,
            writeToken,
            jobId: jobInfo.id,
            fileData
          });
        }
      })
    );

    await this.FinalizeUploadJobs({libraryId, objectId, writeToken});
  }

  async CreateFileUploadJob({libraryId, objectId, writeToken, fileInfo}) {
    let path = UrlJoin("q", writeToken, "upload_jobs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "POST",
        path: path,
        body: fileInfo
      })
    );
  }

  async UploadFileData({libraryId, objectId, writeToken, jobId, fileData}) {
    let path = UrlJoin("q", writeToken, "upload_jobs", jobId);

    return ResponseToJson(
      this.HttpClient.Request({
        method: "POST",
        path: path,
        body: fileData,
        bodyType: "BINARY",
        headers: {
          "Content-type": "application/octet-stream",
          ...(await this.authClient.AuthorizationHeader({libraryId, objectId}))
        }
      })
    );
  }

  async UploadJobStatus({libraryId, objectId, writeToken, jobId}) {
    let path = UrlJoin("q", writeToken, "upload_jobs", jobId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  async FinalizeUploadJobs({libraryId, objectId, writeToken}) {
    let path = UrlJoin("q", writeToken, "files");

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
      method: "POST",
      path: path
    });
  }

  /**
   * Download a file from a content object
   *
   * @see GET /qlibs/:qlibid/q/:qhit/files/:filePath
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} filePath - Path to the file to download
   * @param {string=} format="blob" - Format in which to return the data ("blob" | "arraybuffer")
   *
   * @returns {Promise<(Blob | ArrayBuffer)>} - Part data as a blob
   */
  async DownloadFile({libraryId, objectId, versionHash, filePath, format="blob"}) {
    let path = UrlJoin("q", versionHash || objectId, "files", filePath);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
        method: "GET",
        path: path
      })
    );
  }

  /* Parts */

  /**
   * List content object parts
   *
   * @see GET /qlibs/:qlibid/q/:qhit/parts
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   *
   * @returns {Promise<Object>} - Response containing list of parts of the object
   */
  async ContentParts({libraryId, objectId, versionHash}) {
    let path = UrlJoin("q", versionHash || objectId, "parts");

    const response = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
        method: "GET",
        path: path
      })
    );

    return response.parts;
  }

  /**
   * Download a part from a content object
   *
   * @see GET /qlibs/:qlibid/q/:qhit/data/:qparthash
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} partHash - Hash of the part to download
   * @param {string=} format="blob" - Format in which to return the data ("blob" | "arraybuffer")
   *
   * @returns {Promise<(Blob | ArrayBuffer)>} - Part data as a blob
   */
  async DownloadPart({libraryId, objectId, versionHash, partHash, format="blob"}) {
    const path = UrlJoin("q", versionHash || objectId, "data", partHash);

    const response =
      await this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
        method: "GET",
        path: path
      });

    let data = await response.arrayBuffer();

    return (format && format.toLowerCase() === "blob") ? await new Response(data).blob() : data;
  }

  /**
   * Upload part to an object draft
   *
   * @see POST /qlibs/:qlibid/q/:write_token/data
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {(ArrayBuffer | Blob | Buffer)} data - Data to upload
   * @param {number=} chunkSize=1000000 (1MB) - Chunk size, in bytes
   * @param {function=} callback - If specified, function will be called with upload progress after completion of each chunk
   * - Method signatue: ({uploaded, total})
   *
   * @returns {Promise<Object>} - Response containing information about the uploaded part
   */
  async UploadPart({libraryId, objectId, writeToken, data, chunkSize=1000000, callback}) {
    const authorizationHeader = await this.authClient.AuthorizationHeader({libraryId, objectId, update: true});
    const totalSize = data.size || data.length || data.byteLength;

    if(callback) { callback({uploaded: 0, total: totalSize}); }

    // If the file is smaller than the chunk size, just upload it in one pass
    if(totalSize < chunkSize) {
      const uploadResult = await ResponseToJson(
        this.HttpClient.Request({
          headers: authorizationHeader,
          method: "POST",
          path: UrlJoin("q", writeToken, "data"),
          body: data,
          bodyType: "BINARY"
        })
      );

      if(callback) { callback({uploaded: totalSize, total: totalSize}); }

      return uploadResult;
    }

    const path = UrlJoin("q", writeToken, "parts");

    // Create the part for writing
    let partWriteToken = (await ResponseToJson(
      this.HttpClient.Request({
        headers: authorizationHeader,
        method: "POST",
        path,
        bodyType: "BINARY",
        body: ""
      })
    )).part.write_token;

    // Upload the part in chunks, calling progressCallback after each time
    for(let uploaded = 0; uploaded < totalSize; uploaded += chunkSize) {
      const to = Math.min(uploaded + chunkSize, totalSize);

      await ResponseToJson(
        this.HttpClient.Request({
          headers: authorizationHeader,
          method: "POST",
          path: UrlJoin(path, partWriteToken),
          body: data.slice(uploaded, to),
          bodyType: "BINARY",
        })
      );

      if(callback) { callback({uploaded: to, total: totalSize}); }
    }

    // Finalize part
    return await ResponseToJson(
      await this.HttpClient.Request({
        headers: authorizationHeader,
        method: "POST",
        path: UrlJoin(path, partWriteToken),
        bodyType: "BINARY",
        body: ""
      })
    );
  }

  /**
   * Delete the specified part from a content draft
   *
   * @see DELETE /qlibs/:qlibid/q/:write_token/parts/:qparthash
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {string} partHash - Hash of the part to delete
   */
  async DeletePart({libraryId, objectId, writeToken, partHash}) {
    let path = UrlJoin("q", writeToken, "parts", partHash);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "DELETE",
      path: path
    });
  }

  /**
   * Generate a URL to the specified /call endpoint of a content object to call a bitcode method.
   * URL includes authorization token.
   *
   * Alias for the FabricUrl method with the "call" parameter
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} method - Bitcode method to call
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
   * token. This is useful for accessing public assets.
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of whether such a request exists in the client cache. This request will not be cached.
   *
   * @see FabricUrl for creating arbitrary fabric URLs
   *
   * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
   */
  async BitcodeMethodUrl({libraryId, objectId, versionHash, method, queryParams={}, noAuth=false, noCache=false}) {
    return this.FabricUrl({libraryId, objectId, versionHash, call: method, queryParams, noAuth, noCache});
  }

  /**
   * Generate a URL to the specified /rep endpoint of a content object. URL includes authorization token.
   *
   * Alias for the FabricUrl method with the "rep" parameter
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} rep - Representation to use
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
   * token. This is useful for accessing public assets.
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached. This option has no effect if noAuth is true.
   *
   * @see FabricUrl for creating arbitrary fabric URLs
   *
   * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
   */
  async Rep({libraryId, objectId, versionHash, rep, queryParams={}, noAuth=false, noCache=false}) {
    return this.FabricUrl({libraryId, objectId, versionHash, rep, queryParams, noAuth, noCache});
  }

  /**
   * Generate a URL to the specified item in the content fabric with appropriate authorization token.
   *
   * @namedParams
   * @param {string=} libraryId - ID of an library
   * @param {string=} objectId - ID of an object
   * @param {string=} versionHash - Hash of an object version
   * @param {string=} partHash - Hash of a part - Requires object ID
   * @param {string=} rep - Rep parameter of the url
   * @param {string=} call - Bitcode method to call
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
   * token. This is useful for accessing public assets.
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached. This option has no effect if noAuth is true.
   *
   * @returns {Promise<string>} - URL to the specified endpoint with authorization token
   */
  async FabricUrl({libraryId, objectId, versionHash, partHash, rep, call, queryParams={}, noAuth=false, noCache=false}) {
    let path = "";
    // Clone queryParams to avoid modification of the original
    queryParams = {...queryParams};

    if(libraryId) {
      path = UrlJoin(path, "qlibs", libraryId);

      if(objectId || versionHash) {
        path = UrlJoin(path, "q", versionHash || objectId);

        if(partHash){
          path = UrlJoin(path, "data", partHash);
        } else if(rep) {
          path = UrlJoin(path, "rep", rep);
        } else if(call) {
          path = UrlJoin(path, "call", call);
        }
      }

      if(!noAuth) {
        queryParams.authorization = await this.authClient.AuthorizationToken({libraryId, objectId, versionHash, noCache});
      }
    } else if(versionHash) {
      path = UrlJoin("q", versionHash);

      if(!noAuth && objectId) {
        queryParams.authorization = await this.authClient.AuthorizationToken({objectId, versionHash, noCache});
      }

      if(partHash){
        path = UrlJoin(path, "data", partHash);
      } else if(rep) {
        path = UrlJoin(path, "rep", rep);
      } else if(call) {
        path = UrlJoin(path, "call", call);
      }
    }

    return this.HttpClient.URL({
      path: path,
      queryParams
    });
  }

  /**
   * Generate a URL to the specified content object file with appropriate authorization token.
   *
   * @namedParams
   * @param {string} libraryId - ID of an library
   * @param {string} objectId - ID of an object - Required if using versionHash
   * @param {string=} versionHash - Hash of an object version - If specified, will be used instead of objectID in URL
   * @param {string} filePath - Path to the content object file
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached.
   *
   * @returns {Promise<string>} - URL to the specified file with authorization token
   */
  async FileUrl({libraryId, objectId, versionHash, filePath, queryParams={}, noCache=false}) {
    let path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, "files", filePath);

    const authorizationToken = await this.authClient.AuthorizationToken({libraryId, objectId, noCache});

    return this.HttpClient.URL({
      path: path,
      queryParams: {
        ...queryParams,
        authorization: authorizationToken
      }
    });
  }

  /* Access Groups */

  /**
   * Create a access group
   *
   * A new access group contract is deployed from the content space
   *
   * @returns {Promise<string>} - Contract address of created access group
   */
  async CreateAccessGroup() {
    const { contractAddress, transactionHash } = await this.authClient.CreateAccessGroup();

    return contractAddress;
  }

  /**
   * Returns the address of the owner of the specified content object
   *
   * @namedParams
   * @param {string} libraryId
   *
   * @returns {Promise<string>} - The account address of the owner
   */
  async AccessGroupOwner({contractAddress}) {
    return await this.ethClient.CallContractMethod({
      contractAddress,
      abi: AccessGroupContract.abi,
      methodName: "owner",
      methodArgs: [],
      signer: this.signer
    });
  }

  /**
   * Delete an access group
   *
   * Calls the kill method on the specified access group's contract
   *
   * @namedParams
   * @param {string} contractAddress - The address of the access group contract
   */
  async DeleteAccessGroup({contractAddress}) {
    await this.CallContractMethodAndWait({
      contractAddress,
      abi: AccessGroupContract.abi,
      methodName: "kill",
      methodArgs: []
    });
  }

  async CallAccessGroupMethod({contractAddress, memberAddress, methodName, eventName}) {
    // Ensure address starts with 0x
    if(!memberAddress.startsWith("0x")) { memberAddress = "0x" + memberAddress; }

    // Ensure caller is a manager of the group
    const isManager = await this.CallContractMethod({
      contractAddress,
      abi: AccessGroupContract.abi,
      methodName: "hasManagerAccess",
      methodArgs: [ this.signer.address.toLowerCase() ]
    });

    if(!isManager) {
      throw Error("Manager access required");
    }

    const event = await this.CallContractMethodAndWait({
      contractAddress,
      abi: AccessGroupContract.abi,
      methodName,
      methodArgs: [ memberAddress.toLowerCase() ],
      eventName,
      eventValue: "candidate",
    });

    const candidate = this.ExtractValueFromEvent({
      abi: AccessGroupContract.abi,
      event,
      eventName,
      eventValue: "candidate"
    });

    if(this.utils.FormatAddress(candidate) !== this.utils.FormatAddress(memberAddress)) {
      // eslint-disable-next-line no-console
      console.error("Mismatch: " + candidate + " :: " + memberAddress);
      throw Error("Access group method " + methodName + " failed");
    }

    return event.transactionHash;
  }

  /**
   * Add a member to the access group at the specified contract address. This client's signer must
   * be a manager of the access group.
   *
   * @namedParams
   * @param {string} contractAddress - Address of the access group contract
   * @param {string} memberAddress - Address of the member to add
   *
   * @returns {Promise<transactionHash>} - The transaction hash of the call to the grantAccess method
   */
  async AddAccessGroupMember({contractAddress, memberAddress}) {
    return await this.CallAccessGroupMethod({
      contractAddress,
      memberAddress,
      methodName: "grantAccess",
      eventName: "MemberAdded"
    });
  }

  /**
   * Remove a member from the access group at the specified contract address. This client's signer must
   * be a manager of the access group.
   *
   * @namedParams
   * @param {string} contractAddress - Address of the access group contract
   * @param {string} memberAddress - Address of the member to remove
   *
   * @returns {Promise<transactionHash>} - The transaction hash of the call to the revokeAccess method
   */
  async RemoveAccessGroupMember({contractAddress, memberAddress}) {
    return await this.CallAccessGroupMethod({
      contractAddress,
      memberAddress,
      methodName: "revokeAccess",
      eventName: "MemberRevoked"
    });
  }

  /**
   * Add a manager to the access group at the specified contract address. This client's signer must
   * be a manager of the access group.
   *
   * @namedParams
   * @param {string} contractAddress - Address of the access group contract
   * @param {string} memberAddress - Address of the manager to add
   *
   * @returns {Promise<transactionHash>} - The transaction hash of the call to the grantManagerAccess method
   */
  async AddAccessGroupManager({contractAddress, memberAddress}) {
    return await this.CallAccessGroupMethod({
      contractAddress,
      memberAddress,
      methodName: "grantManagerAccess",
      eventName: "ManagerAccessGranted"
    });
  }

  /**
   * Remove a manager from the access group at the specified contract address. This client's signer must
   * be a manager of the access group.
   *
   * @namedParams
   * @param {string} contractAddress - Address of the access group contract
   * @param {string} memberAddress - Address of the manager to remove
   *
   * @returns {Promise<transactionHash>} - The transaction hash of the call to the revokeManagerAccess method
   */
  async RemoveAccessGroupManager({contractAddress, memberAddress}) {
    return await this.CallAccessGroupMethod({
      contractAddress,
      memberAddress,
      methodName: "revokeManagerAccess",
      eventName: "ManagerAccessRevoked"
    });
  }

  /* Verification */

  /**
   * Verify the specified content object
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} versionHash - Hash of the content object version
   *
   * @returns {Promise<Object>} - Response describing verification results
   */
  async VerifyContentObject({libraryId, objectId, versionHash}) {
    return await ContentObjectVerification.VerifyContentObject({
      client: this,
      libraryId,
      objectId,
      versionHash
    });
  }

  /**
   * Get the proofs associated with a given part
   *
   * @see GET /qlibs/:qlibid/q/:qhit/data/:qparthash/proofs
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - If not specified, latest version will be used
   * @param {string} partHash - Hash of the part
   *
   * @returns {Promise<Object>} - Response containing proof information
   */
  async Proofs({libraryId, objectId, versionHash, partHash}) {
    let path = UrlJoin("q", versionHash || objectId, "data", partHash, "proofs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Get part info in CBOR format
   *
   * @see GET /qparts/:qparthash
   *
   * @namedParams
   * @param {string} libraryId - ID of the library - required for authentication
   * @param {string} objectId - ID of the object - required for authentication
   * @param {string} partHash - Hash of the part
   * @param {string} format - Format to retrieve the response - defaults to Blob
   *
   * @returns {Promise<Format>} - Response containing the CBOR response in the specified format
   */
  async QParts({libraryId, objectId, partHash, format="blob"}) {
    let path = UrlJoin("qparts", partHash);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Contracts */

  /**
   * Format the arguments to be used for the specified method of the contract
   *
   * @namedParams
   * @param {Object} abi - ABI of contract
   * @param {string} methodName - Name of method for which arguments will be formatted
   * @param {Array<string>} args - List of arguments
   *
   * @returns {Array<string>} - List of formatted arguments
   */
  FormatContractArguments({abi, methodName, args}) {
    return this.ethClient.FormatContractArguments({abi, methodName, args});
  }

  /**
   * Deploy a contract from ABI and bytecode. This client's signer will be the owner of the contract.
   *
   * @namedParams
   * @param {Object} abi - ABI of contract
   * @param {string} bytecode - Bytecode of the contract
   * @param {Array<string>} constructorArgs - List of arguments to the contract constructor
   * - it is recommended to format these arguments using the FormatContractArguments method
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   *
   * @returns {Promise<Object>} - Response containing the deployed contract address and the transaction hash of the deployment
   */
  async DeployContract({abi, bytecode, constructorArgs, overrides={}}) {
    return await this.ethClient.DeployContract({abi, bytecode, constructorArgs, overrides, signer: this.signer});
  }

  /**
   * Call the specified method on a deployed contract. This action will be performed by this client's signer.
   *
   * NOTE: This method will only wait for the transaction to be created. If you want to wait for the transaction
   * to be mined, use the CallContractMethodAndWait method.
   *
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {string} methodName - Method to call on the contract
   * @param {Array<string>} methodArgs - List of arguments to the contract constructor
   * - it is recommended to format these arguments using the FormatContractArguments method
   * @param {(number | BigNumber)=} value - Amount of ether to include in the transaction
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   *
   * @returns {Promise<Object>} - Response containing information about the transaction
   */
  async CallContractMethod({contractAddress, abi, methodName, methodArgs, value, overrides={}}) {
    return await this.ethClient.CallContractMethod({contractAddress, abi, methodName, methodArgs, value, overrides, signer: this.signer});
  }

  /**
   * Call the specified method on a deployed contract and wait for the transaction to be mined.
   * This action will be performed by this client's signer.
   *
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {string} methodName - Method to call on the contract
   * @param {Array<string>} methodArgs - List of arguments to the contract constructor
   * - it is recommended to format these arguments using the FormatContractArguments method
   * @param {number | BigNumber} value - Amount of ether to include in the transaction
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   *
   * @see Utils.WeiToEther
   *
   * @returns {Promise<Object>} - The event object of this transaction
   */
  async CallContractMethodAndWait({contractAddress, abi, methodName, methodArgs, value, overrides={}}) {
    return await this.ethClient.CallContractMethodAndWait({
      contractAddress,
      abi,
      methodName,
      methodArgs,
      value,
      overrides,
      signer: this.signer
    });
  }

  /**
   * Extract the specified event log from the given event obtained from the
   * CallContractAndMethodAndWait method
   *
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {Object} event - Event of the transaction from CallContractMethodAndWait
   * @param {string} eventName - Name of the event to parse
   *
   * @see Utils.WeiToEther
   *
   * @returns {Promise<*>} - The parsed event log from the event
   */
  ExtractEventFromLogs({abi, event, eventName}) {
    return this.ethClient.ExtractEventFromLogs({abi, event, eventName});
  }

  /**
   * Extract the specified value from the specified event log from the given event obtained
   * from the CallContractAndMethodAndWait method
   *
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {Object} event - Event of the transaction from CallContractMethodAndWait
   * @param {string} eventName - Name of the event to parse
   * @param {string} eventValue - Name of the value to extract from the event
   *
   * @returns The value extracted from the event
   */
  ExtractValueFromEvent({abi, event, eventName, eventValue}) {
    const eventLog = this.ethClient.ExtractEventFromLogs({abi, event, eventName, eventValue});
    return eventLog ? eventLog.values[eventValue] : undefined;
  }

  /**
   * Set the custom contract of the specified object with the contract at the specified address
   *
   * Note: This also updates the content object metadata with information about the contract - particularly the ABI
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} customContractAddress - Address of the deployed custom contract
   * @param {string=} name - Optional name of the custom contract
   * @param {string=} description - Optional description of the custom contract
   * @param {Object} abi - ABI of the custom contract
   * @param {Object=} factoryAbi - If the custom contract is a factory, the ABI of the contract it deploys
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   *
   * @returns {Promise<Object>} - Result transaction of calling the setCustomContract method on the content object contract
   */
  async SetCustomContentContract({libraryId, objectId, customContractAddress, name, description, abi, factoryAbi, overrides={}}) {
    customContractAddress = this.utils.FormatAddress(customContractAddress);

    const setResult = await this.ethClient.SetCustomContentContract({
      contentContractAddress: Utils.HashToAddress(objectId),
      customContractAddress,
      overrides,
      signer: this.signer
    });

    const writeToken = (await this.EditContentObject({libraryId, objectId})).write_token;

    await this.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "custom_contract",
      metadata: {
        name,
        description,
        address: customContractAddress,
        abi,
        factoryAbi
      }
    });

    await this.FinalizeContentObject({libraryId, objectId, writeToken});

    return setResult;
  }

  /**
   * Get the custom contract of the specified object
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   *
   * @returns {Promise<string> | undefined} - If the object has a custom contract, this will return the address of the custom contract
   */
  async CustomContractAddress({libraryId, objectId}) {
    const contentSpaceAddress = this.utils.HashToAddress(this.contentSpaceId);
    const contentSpaceLibraryId = this.utils.AddressToLibraryId(contentSpaceAddress);

    if(libraryId === contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId)) {
      // Content type or content library object - no custom contract
      return;
    }

    const customContractAddress = await this.ethClient.CallContractMethod({
      contractAddress: this.utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "contentContractAddress",
      methodArgs: [],
      signer: this.signer
    });

    if(customContractAddress === this.utils.nullAddress) { return; }

    return this.utils.FormatAddress(customContractAddress);
  }

  /**
   * Get all events on the specified contract
   *
   * @namedParams
   * @param {string} contractAddress - The address of the contract
   * @param {object} abi - The ABI of the contract
   * @param {number=} fromBlock - Limit results to events after the specified block (inclusive)
   * @param {number=} toBlock - Limit results to events before the specified block (inclusive)
   * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
   * Note: This requires one extra network call per block, so it should not be used for very large ranges
   * @returns {Array.<Array.<Object>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
   */
  async ContractEvents({contractAddress, abi, fromBlock=0, toBlock, includeTransaction=false}) {
    return await this.ethClient.ContractEvents({
      contractAddress,
      abi,
      fromBlock,
      toBlock,
      includeTransaction,
      signer: this.signer
    });
  }

  // TODO: Not implemented in contracts
  async WithdrawContractFunds({contractAddress, abi, ether}) {
    return await this.ethClient.CallContractMethodAndWait({
      contractAddress,
      abi,
      methodName: "transfer",
      methodArgs: [this.signer.address, Ethers.utils.parseEther(ether.toString())],
      signer: this.signer
    });
  }

  /* Other blockchain operations */

  /**
   * Get events from the blockchain in reverse chronological order, starting from toBlock. This will also attempt
   * to identify and parse any known Eluvio contract methods. If successful, the method name, signature, and input
   * values will be included in the log entry.
   *
   * @namedParams
   * @param {number=} toBlock - Limit results to events before the specified block (inclusive) - If not specified, will start from latest block
   * @param {number=} fromBlock - Limit results to events after the specified block (inclusive)
   * @param {number=} count=10 - Max number of events to include (unless both toBlock and fromBlock are unspecified)
   * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
   * Note: This requires one extra network call per block, so it should not be used for very large ranges
   * @returns {Array.<Array.<Object>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
   */
  async Events({toBlock, fromBlock, count=10, includeTransaction=false}) {
    const latestBlock = await this.signer.provider.getBlockNumber();

    if(!toBlock) {
      if(!fromBlock) {
        toBlock = latestBlock;
        fromBlock = toBlock - count + 1;
      } else {
        toBlock = fromBlock + count - 1;
      }
    } else if(!fromBlock) {
      fromBlock = toBlock - count + 1;
    }

    // Ensure block numbers are valid
    if(toBlock > latestBlock) {
      toBlock = latestBlock;
    }

    if(fromBlock < 0) {
      fromBlock = 0;
    }

    if(fromBlock > toBlock) {
      return [];
    }

    return await this.ethClient.Events({
      toBlock,
      fromBlock,
      includeTransaction,
      signer: this.signer
    });
  }

  /**
   * Get the balance (in ether) of the specified address
   *
   * @namedParams
   * @param {string} address - Address to query
   *
   * @returns {Promise<number>} - Balance of the account, in ether
   */
  async GetBalance({address}) {
    const provider = new Ethers.providers.JsonRpcProvider(this.ethereumURI);
    return await Ethers.utils.formatEther(await provider.getBalance(address));
  }

  /**
   * Send ether from this client's current signer to the specified recipient address
   *
   * @namedParams
   * @param {string} recipient - Address of the recipient
   * @param {number} ether - Amount of ether to send
   *
   * @returns {Promise<TransactionReceipt>}
   */
  async SendFunds({recipient, ether}) {
    const transaction = await this.signer.sendTransaction({
      to: recipient,
      value: Ethers.utils.parseEther(ether.toString())
    });

    return await transaction.wait();
  }

  /* FrameClient related */

  // Whitelist of methods allowed to be called using the frame API
  FrameAllowedMethods() {
    const forbiddenMethods = [
      "constructor",
      "InitializeClients",
      "CallAccessGroupMethod",
      "CallFromFrameMessage",
      "FrameAllowedMethods",
      "GenerateWallet",
      "SetSigner",
      "SetSignerFromWeb3Provider",
      "ClearSigner"
    ];

    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(method => !forbiddenMethods.includes(method));
  }

  // Call a method specified in a message from a frame
  async CallFromFrameMessage(message, Respond) {
    if(message.type !== "ElvFrameRequest") { return; }

    let callback;
    if(message.callbackId) {
      callback = (result) => {
        Respond(this.utils.MakeClonable({
          type: "ElvFrameResponse",
          requestId: message.callbackId,
          response: result
        }));
      };

      message.args.callback = callback;
    }

    try {
      const method = message.calledMethod;

      let methodResults;
      if(message.module === "userProfile") {
        if (!this.userProfile.FrameAllowedMethods().includes(method)) {
          throw Error("Invalid user profile method: " + method);
        }

        methodResults = await this.userProfile[method](message.args);
      } else {
        if (!this.FrameAllowedMethods().includes(method)) {
          throw Error("Invalid method: " + method);
        }

        methodResults = await this[method](message.args);
      }

      Respond(this.utils.MakeClonable({
        type: "ElvFrameResponse",
        requestId: message.requestId,
        response: methodResults
      }));
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);

      const responseError = error instanceof Error ? error.message : error;
      Respond(this.utils.MakeClonable({
        type: "ElvFrameResponse",
        requestId: message.requestId,
        error: responseError
      }));
    }
  }
}

exports.ElvClient = ElvClient;
