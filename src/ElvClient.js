require("@babel/polyfill");

if(typeof Buffer === "undefined") { Buffer = require("buffer/").Buffer; }

const UrlJoin = require("url-join");
const Ethers = require("ethers");
const AuthorizationClient = require("./AuthorizationClient");
const ElvWallet = require("./ElvWallet");
const EthClient = require("./EthClient");
const UserProfileClient = require("./UserProfileClient");
const HttpClient = require("./HttpClient");
// const ContentObjectVerification = require("./ContentObjectVerification");
const Utils = require("./Utils");
const Crypto = require("./Crypto");

const SpaceContract = require("./contracts/BaseContentSpace");
const LibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");
const ContentTypeContract = require("./contracts/BaseContentType");
const AccessGroupContract = require("./contracts/BaseAccessControlGroup");

// Platform specific polyfills
switch(Utils.Platform()) {
  case Utils.PLATFORM_REACT_NATIVE:
    // React native polyfills
    // Polyfill for string.normalized
    require("unorm");
    break;
  case Utils.PLATFORM_NODE:
    // Define Response in node
    // eslint-disable-next-line no-global-assign
    global.Response = (require("node-fetch")).Response;
    break;
}

const ResponseToJson = async (response) => {
  return ResponseToFormat("json", response);
};

const ResponseToFormat = async (format, response) => {
  response = await response;

  switch(format.toLowerCase()) {
    case "json":
      return await response.json();
    case "text":
      return await response.text();
    case "blob":
      return await response.blob();
    case "arraybuffer":
      return await response.arrayBuffer();
    case "formdata":
      return await response.formData();
    case "buffer":
      return await response.buffer();
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
   * @param {Array<string>} fabricURIs - A list of full URIs to content fabric nodes
   * @param {Array<string>} ethereumURIs - A list of full URIs to ethereum nodes
   * @param {boolean=} viewOnly - If specified, the client will not attempt to create a wallet contract for the user
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  constructor({
    contentSpaceId,
    fabricURIs,
    ethereumURIs,
    viewOnly=false,
    noCache=false,
    noAuth=false
  }) {
    this.utils = Utils;

    this.contentSpaceId = contentSpaceId;
    this.contentSpaceAddress = this.utils.HashToAddress(contentSpaceId);
    this.contentSpaceLibraryId = this.utils.AddressToLibraryId(this.contentSpaceAddress);
    this.contentSpaceObjectId = this.utils.AddressToObjectId(this.contentSpaceAddress);

    this.fabricURIs = fabricURIs;
    this.ethereumURIs = ethereumURIs;

    this.viewOnly = viewOnly;
    this.noCache = noCache;
    this.noAuth = noAuth;

    this.contentTypes = {};

    this.InitializeClients();
  }

  /**
   * Create a new ElvClient from the specified configuration URL
   *
   * @methodGroup Constructor
   * @namedParams
   * @param {string} configUrl - Full URL to the config endpoint
   * @param {boolean=} viewOnly - If specified, the client will not attempt to create a wallet contract for the user
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {Promise<ElvClient>} - New ElvClient connected to the specified content fabric and blockchain
   */
  static async FromConfigurationUrl({
    configUrl,
    viewOnly=false,
    noCache=false,
    noAuth=false
  }) {
    const httpClient = new HttpClient([configUrl]);
    const fabricInfo = await ResponseToJson(httpClient.Request({method: "GET", path: "/config"}));

    // If any HTTPS urls present, throw away HTTP urls so only HTTPS will be used
    const filterHTTPS = uri => uri.toLowerCase().startsWith("https");

    let fabricURIs = fabricInfo.network.seed_nodes.fabric_api;
    if(fabricURIs.find(filterHTTPS)) {
      fabricURIs = fabricURIs.filter(filterHTTPS);
    }

    let ethereumURIs = fabricInfo.network.seed_nodes.ethereum_api;
    if(ethereumURIs.find(filterHTTPS)) {
      ethereumURIs = ethereumURIs.filter(filterHTTPS);
    }

    return new ElvClient({
      contentSpaceId: fabricInfo.qspace.id,
      fabricURIs,
      ethereumURIs,
      viewOnly,
      noCache,
      noAuth
    });
  }

  async InitializeClients() {
    this.HttpClient = new HttpClient(this.fabricURIs);
    this.ethClient = new EthClient(this.ethereumURIs);

    this.authClient = new AuthorizationClient({
      client: this,
      contentSpaceId: this.contentSpaceId,
      signer: this.signer,
      noCache: this.noCache,
      noAuth: this.noAuth
    });

    this.userProfileClient = new UserProfileClient({client: this});
    if(!this.viewOnly && this.signer) {
      await this.userProfileClient.Initialize();
    }
  }

  /* Wallet and signers */

  /**
   * Generate a new ElvWallet that is connected to the client's provider
   *
   * @methodGroup Signers
   * @returns {ElvWallet} - ElvWallet instance with this client's provider
   */
  GenerateWallet() {
    return new ElvWallet(this.ethClient.Provider());
  }

  /**
   * Remove the signer from this client
   *
   * @methodGroup Signers
   */
  ClearSigner() {
    this.signer = undefined;

    this.InitializeClients();
  }

  /**
   * Clear saved access and state channel tokens
   *
   * @methodGroup Access Requests
   */
  ClearCache() {
    this.authClient.ClearCache();
  }

  /**
   * Set the signer for this client to use for blockchain transactions
   *
   * @methodGroup Signers
   * @namedParams
   * @param {object} signer - The ethers.js signer object
   */
  async SetSigner({signer}) {
    signer.connect(this.ethClient.Provider());
    signer.provider.pollingInterval = 250;
    this.signer = signer;

    await this.InitializeClients();
  }

  /**
   * Set the signer for this client to use for blockchain transactions from an existing web3 provider.
   * Useful for integrating with MetaMask
   *
   * @see https://github.com/ethers-io/ethers.js/issues/59#issuecomment-358224800
   *
   * @methodGroup Signers
   * @namedParams
   * @param {object} provider - The web3 provider object
   */
  async SetSignerFromWeb3Provider({provider}) {
    let ethProvider = new Ethers.providers.Web3Provider(provider);
    ethProvider.pollingInterval = 250;
    this.signer = ethProvider.getSigner();
    this.signer.address = await this.signer.getAddress();
    await this.InitializeClients();
  }

  /**
   * Get the account address of the current signer
   *
   * @methodGroup Signers
   * @returns {string} - The address of the current signer
   */
  CurrentAccountAddress() {
    return this.signer ? this.utils.FormatAddress(this.signer.address) : "";
  }

  /* Content Spaces */

  /**
   * Get the address of the default KMS of the content space
   *
   * @methodGroup Content Space
   *
   * @returns {Promise<string>} - Address of the KMS
   */
  async DefaultKMSAddress() {
    return await this.CallContractMethod({
      contractAddress: this.contentSpaceAddress,
      abi: SpaceContract.abi,
      methodName: "addressKMS",
    });
  }

  /**
   * Get the ID of the current content space
   *
   * @methodGroup Content Space
   *
   * @return {string} contentSpaceId - The ID of the current content space
   */
  ContentSpaceId() {
    return this.contentSpaceId;
  }

  /**
   * Deploy a new content space contract
   *
   * @methodGroup Content Space
   * @namedParams
   * @param {String} name - Name of the content space
   *
   * @returns {Promise<string>} - Content space ID of the created content space
   */
  async CreateContentSpace({name}) {
    const contentSpaceAddress = await this.ethClient.DeployContentSpaceContract({name, signer: this.signer});

    return Utils.AddressToSpaceId(contentSpaceAddress);
  }

  /* Libraries */

  /**
   * List content libraries - returns a list of content library IDs available to the current user
   *
   * @methodGroup Content Libraries
   *
   * @returns {Promise<Array<string>>}
   */
  async ContentLibraries() {
    const libraryAddresses = await this.Collection({collectionType: "libraries"});

    return libraryAddresses.map(address => this.utils.AddressToLibraryId(address));
  }

  /**
   * Returns information about the content library
   *
   * @methodGroup Content Libraries
   * @see GET /qlibs/:qlibid
   *
   * @namedParams
   * @param {string} libraryId
   *
   * @returns {Promise<Object>}
   */
  async ContentLibrary({libraryId}) {
    const path = UrlJoin("qlibs", libraryId);

    const library = await ResponseToJson(
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
   * @methodGroup Content Libraries
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
   * @methodGroup Content Libraries
   * @see PUT /qlibs/:qlibid
   *
   * @namedParams
   * @param {string} name - Library name
   * @param {string=} description - Library description
   * @param {blob=} image - Image associated with the library
   * @param {Object=} metadata - Metadata of library object
   * @param {string=} kmsId - ID of the KMS to use for content in this library. If not specified,
   * the default KMS will be used.
   *
   * @returns {Promise<string>} - Library ID of created library
   */
  async CreateContentLibrary({
    name,
    description,
    image,
    metadata={},
    kmsId,
  }) {
    if(!kmsId) {
      kmsId = `ikms${this.utils.AddressToHash(await this.DefaultKMSAddress())}`;
    }

    const { contractAddress } = await this.authClient.CreateContentLibrary({kmsId});

    metadata = {
      ...metadata,
      name,
      "eluv.description": description
    };

    const libraryId = this.utils.AddressToLibraryId(contractAddress);

    // Set library content object type and metadata on automatically created library object
    const objectId = libraryId.replace("ilib", "iq__");

    const editResponse = await this.EditContentObject({
      libraryId,
      objectId,
      options: {
        type: "library"
      }
    });

    await this.ReplaceMetadata({
      libraryId,
      objectId,
      metadata,
      writeToken: editResponse.write_token
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
   * @methodGroup Content Libraries
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
   * Set the image associated with this object
   *
   * Note: The content type of the object must support /rep/image
   *
   * @methodGroup Content Objects
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
   * @methodGroup Content Libraries
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

  /* Library Content Type Management */

  /**
   * Add a specified content type to a library
   *
   * @methodGroup Content Libraries
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string=} typeId - ID of the content type
   * @param {string=} typeName - Name of the content type
   * @param {string=} typeHash - Version hash of the content type
   * @param {string=} customContractAddress - Address of the custom contract to associate with
   * this content type for this library
   *
   * @returns {Promise<string>} - Hash of the addContentType transaction
   */
  async AddLibraryContentType({libraryId, typeId, typeName, typeHash, customContractAddress}) {
    if(typeHash) { typeId = this.utils.DecodeVersionHash(typeHash).objectId; }

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
   * @methodGroup Content Libraries
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string=} typeId - ID of the content type (required unless typeName is specified)
   * @param {string=} typeName - Name of the content type (required unless typeId is specified)
   * @param {string=} typeHash - Version hash of the content type
   *
   * @returns {Promise<string>} - Hash of the removeContentType transaction
   */
  async RemoveLibraryContentType({libraryId, typeId, typeName, typeHash}) {
    if(typeHash) { typeId = this.utils.DecodeVersionHash(typeHash).objectId; }

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
   * @methodGroup Content Libraries
   * @namedParams
   * @param {string} libraryId - ID of the library
   *
   * @returns {Promise<Array<object>>} - List of accepted content types - return format is equivalent to ContentTypes method
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

    const contentTypes = await this.ContentTypes();

    let allowedTypes = {};
    Object.values(contentTypes).map(type => {
      const typeAddress = this.utils.HashToAddress(type.id).toLowerCase();
      // If type address is allowed, include it
      if(allowedTypeAddresses.includes(typeAddress)) {
        allowedTypes[type.id] = type;
      }
    });

    return allowedTypes;
  }

  /* Content Types */

  /**
   * Returns the address of the owner of the specified content type
   *
   * @methodGroup Content Types
   * @namedParams
   * @param {string=} name - Name of the content type to find
   * @param {string=} typeId - ID of the content type to find
   * @param {string=} versionHash - Version hash of the content type to find
   *
   * @returns {Promise<string>} - The account address of the owner
   */
  async ContentTypeOwner({name, typeId, versionHash}) {
    const contentType = await this.ContentType({name, typeId, versionHash});

    return await this.ethClient.CallContractMethod({
      contractAddress: Utils.HashToAddress(contentType.id),
      abi: ContentTypeContract.abi,
      methodName: "owner",
      methodArgs: [],
      signer: this.signer
    });
  }

  /**
   * Find the content type accessible to the current user by name, ID, or version hash
   *
   * @methodGroup Content Types
   * @namedParams
   * @param {string=} name - Name of the content type to find
   * @param {string=} typeId - ID of the content type to find
   * @param {string=} versionHash - Version hash of the content type to find
   *
   * @return {Promise<Object>} - The content type, if found
   */
  async ContentType({name, typeId, versionHash}) {
    if(versionHash) { typeId = this.utils.DecodeVersionHash(versionHash).objectId; }

    if(name) {
      // Look up named type in content space metadata
      typeId = await this.ContentObjectMetadata({
        libraryId: this.contentSpaceLibraryId,
        objectId: this.contentSpaceObjectId,
        metadataSubtree: UrlJoin("contentTypes", name)
      });
    }

    if(!typeId) {
      const types = await this.ContentTypes();

      if(name) {
        return Object.values(types).find(type => (type.name || "").toLowerCase() === name.toLowerCase());
      } else {
        return Object.values(types).find(type => type.hash === versionHash);
      }
    }

    try {
      const typeInfo = await this.ContentObject({
        libraryId: this.contentSpaceLibraryId,
        objectId: typeId
      });

      delete typeInfo.type;

      const metadata = (await this.ContentObjectMetadata({
        libraryId: this.contentSpaceLibraryId,
        objectId: typeId
      })) || {};

      return {
        ...typeInfo,
        name: metadata.name,
        meta: metadata
      };
    } catch(error) {
      throw new Error(`Content Type ${name || typeId} is invalid`);
    }
  }

  /**
   * List all content types accessible to this user.
   *
   * @methodGroup Content Types
   * @namedParams
   *
   * @return {Promise<Array<Object>>} - A list of content types
   */
  async ContentTypes() {
    this.contentTypes = this.contentTypes || {};

    const typeAddresses = await this.Collection({collectionType: "contentTypes"});

    await Promise.all(
      typeAddresses.map(async typeAddress => {
        const typeId = this.utils.AddressToObjectId(typeAddress);

        if(!this.contentTypes[typeId]) {
          try {
            this.contentTypes[typeId] = await this.ContentType({typeId});
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
        }
      })
    );

    return this.contentTypes;
  }

  /**
   * Create a new content type.
   *
   * A new content type contract is deployed from
   * the content space, and that contract ID is used to determine the object ID to
   * create in the fabric. The content type object will be created in the special
   * content space library (ilib<content-space-hash>)
   *
   * @methodGroup Content Types
   * @namedParams
   * @param libraryId {string=} - ID of the library in which to create the content type. If not specified,
   * it will be created in the content space library
   * @param {string} name - Name of the content type
   * @param {object} metadata - Metadata for the new content type
   * @param {(Blob | Buffer)=} bitcode - Bitcode to be used for the content type
   *
   * @returns {Promise<string>} - Object ID of created content type
   */
  async CreateContentType({name, metadata={}, bitcode}) {
    metadata.name = name;

    const { contractAddress } = await this.authClient.CreateContentType();

    const objectId = this.utils.AddressToObjectId(contractAddress);
    const path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);

    /* Create object, upload bitcode and finalize */
    const createResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({
          libraryId: this.contentSpaceLibraryId,
          objectId,
          update: true
        }),
        method: "POST",
        path: path
      })
    );

    await this.ReplaceMetadata({
      libraryId: this.contentSpaceLibraryId,
      objectId,
      writeToken: createResponse.write_token,
      metadata
    });

    if(bitcode) {
      const uploadResponse = await this.UploadPart({
        libraryId: this.contentSpaceLibraryId,
        objectId,
        writeToken: createResponse.write_token,
        data: bitcode,
        encrypted: false
      });

      await this.ReplaceMetadata({
        libraryId: this.contentSpaceLibraryId,
        objectId,
        writeToken: createResponse.write_token,
        metadataSubtree: "bitcode_part",
        metadata: uploadResponse.part.hash
      });
    }

    await this.FinalizeContentObject({
      libraryId: this.contentSpaceLibraryId,
      objectId,
      writeToken: createResponse.write_token
    });

    return objectId;
  }

  /* Objects */

  /**
   * List content objects in the specified library
   *
   * @see /qlibs/:qlibid/q
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {object=} filterOptions - Pagination, sorting and filtering options
   * @param {boolean=} filterOptions.latestOnly=true - If specified, only latest version of objects will be included
   * @param {number=} filterOptions.start - Start index for pagination
   * @param {number=} filterOptions.limit - Max number of objects to return
   * @param {string=} filterOptions.cacheId - Cache ID corresponding a previous query
   * @param {(Array<string> | string)=} filterOptions.sort - Sort by the specified key(s)
   * * @param {boolean=} filterOptions.sortDesc=false - Sort in descending order
   * @param {(Array<string> | string)=} filterOptions.select - Include only the specified metadata keys
   * @param {(Array<object> | object)=} filterOptions.filter - Filter objects by metadata
   * @param {string=} filterOptions.filter.key - Key to filter on
   * @param {string=} filterOptions.filter.type - Type of filter to use for the specified key:
   * - eq, neq, lt, lte, gt, gte, cnt (contains), ncnt (does not contain),
   * @param {string=} filterOptions.filter.filter - Filter for the specified key
   *
   * @returns {Promise<Array<Object>>} - List of objects in library
   */
  async ContentObjects({libraryId, filterOptions={}}) {
    let path = UrlJoin("qlibs", libraryId, "q");

    let queryParams = {
      filter: []
    };

    // Cache ID
    if(filterOptions.cacheId) {
      queryParams.cache_id = filterOptions.cacheId;
    }

    // Start index
    if(filterOptions.start) {
      queryParams.start = filterOptions.start;
    }

    // Limit
    if(filterOptions.limit) {
      queryParams.limit = filterOptions.limit;
    }

    // Metadata select options
    if(filterOptions.select) {
      queryParams.select = filterOptions.select;
    }

    // Sorting options
    if(filterOptions.sort) {
      // Sort keys
      queryParams.sort_by = filterOptions.sort;

      // Sort order
      if(filterOptions.sortDesc) {
        queryParams.sort_descending = true;
      }
    }

    if(filterOptions.latestOnly === false) {
      queryParams.latest_version_only = false;
    }

    // Filters
    const filterTypeMap = {
      eq: ":eq:",
      neq: ":ne:",
      lt: ":lt:",
      lte: ":le:",
      gt: ":gt:",
      gte: ":ge:",
      cnt: ":co:",
      ncnt: ":nc:"
    };

    const addFilter = ({key, type, filter}) => {
      queryParams.filter.push(`${key}${filterTypeMap[type]}${filter}`);
    };

    if(filterOptions.filter) {
      if(Array.isArray(filterOptions.filter)) {
        filterOptions.filter.forEach(filter => addFilter(filter));
      } else {
        addFilter(filterOptions.filter);
      }
    }

    return await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path,
        queryParams
      })
    );
  }

  /**
   * Get a specific content object in the library
   *
   * @see /qlibs/:qlibid/q/:qhit
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
   *
   * @returns {Promise<Object>} - Description of created object
   */
  async ContentObject({libraryId, objectId, versionHash}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

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
   * Returns the address of the owner of the specified content object
   *
   * @methodGroup Content Objects
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
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
   * @param {string=} metadataSubtree - Subtree of the object metadata to retrieve
   * @param {boolean=} noAuth=false - If specified, authorization will not be performed for this call
   *
   * @returns {Promise<Object | string>} - Metadata of the content object
   */
  async ContentObjectMetadata({libraryId, objectId, versionHash, metadataSubtree="/", noAuth=true}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

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

      return metadataSubtree === "/" ? {} : undefined;
    }
  }

  /**
   * List the versions of a content object
   *
   * @see /qlibs/:qlibid/qid/:objectid
   *
   * @methodGroup Content Objects
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
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {objectId=} objectId - ID of the object (if contract already exists)
   * @param {Object=} options -
   * type: Version hash of the content type to associate with the object
   *
   * meta: Metadata to use for the new object
   *
   * @returns {Promise<Object>} - Response containing the object ID and write token of the draft
   */
  async CreateContentObject({libraryId, objectId, options={}}) {
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

    if(!objectId) {
      const { contractAddress } = await this.authClient.CreateContentObject({libraryId, typeId});

      await this.CallContractMethod({
        abi: ContentContract.abi,
        contractAddress,
        methodName: "setVisibility",
        methodArgs: [10]
      });

      objectId = this.utils.AddressToObjectId(contractAddress);
    }

    const path = UrlJoin("qid", objectId);

    return await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
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
   * @methodGroup Content Objects
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
   * @methodGroup Content Objects
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
        if(options.type.startsWith("hq__")) {
          // Type hash specified
          options.type = (await this.ContentType({versionHash: options.type})).hash;
        } else if(options.type.startsWith("iq__")) {
          // Type ID specified
          options.type = (await this.ContentType({typeId: options.type})).hash;
        } else {
          // Type name specified
          options.type = (await this.ContentType({name: options.type})).hash;
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
   * @methodGroup Content Objects
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

    // Invalidate cached content type, if this is one.
    delete this.contentTypes[objectId];

    return finalizeResponse;
  }

  /**
   * Publish a content object version
   *
   * @see PUT /qlibs/:qlibid/q/:versionHash
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} versionHash - The version hash of the content object to publish
   */
  async PublishContentVersion({libraryId, objectId, versionHash}) {
    await this.ethClient.CommitContent({
      contentObjectAddress: this.utils.HashToAddress(objectId),
      versionHash,
      signer: this.signer
    });

    const path = UrlJoin("qlibs", libraryId, "q", versionHash);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "PUT",
      path
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Delete specified version of the content object
   *
   * @see DELETE /qlibs/:qlibid/q/:qhit
   *
   * @methodGroup Content Objects
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
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   */
  async DeleteContentObject({libraryId, objectId}) {
    await this.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(libraryId),
      abi: LibraryContract.abi,
      methodName: "deleteContent",
      methodArgs: [this.utils.HashToAddress(objectId)]
    });
  }

  /* Content object metadata */

  /**
   * Merge specified metadata into existing content object metadata
   *
   * @see POST /qlibs/:qlibid/q/:write_token/meta
   *
   * @methodGroup Content Objects
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
   * @methodGroup Content Objects
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
   * @methodGroup Content Objects
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
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be used
   */
  async ListFiles({libraryId, objectId, versionHash}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

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
   * @methodGroup Content Objects
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
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} filePath - Path to the file to download
   * @param {string=} format="blob" - Format in which to return the data ("blob" | "arraybuffer")
   *
   * @returns {Promise<(Blob | ArrayBuffer)>} - Part data as a blob
   */
  async DownloadFile({libraryId, objectId, versionHash, filePath, format="blob"}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

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
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   *
   * @returns {Promise<Object>} - Response containing list of parts of the object
   */
  async ContentParts({libraryId, objectId, versionHash}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

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
   * Get information on a specific part
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} partHash - Hash of the part to retrieve
   *
   * @returns {Promise<Object>} - Response containing information about the specified part
   */
  async ContentPart({libraryId, objectId, versionHash, partHash}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    let path = UrlJoin("q", versionHash || objectId, "parts", partHash);

    return await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Download a part from a content object. The fromByte and range parameters can be used to specify a
   * specific section of the part to download.
   *
   * @see GET /qlibs/:qlibid/q/:qhit/data/:qparthash
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} partHash - Hash of the part to download
   * @param {string=} format="arrayBuffer" - Format in which to return the data
   * @param {boolean=} chunked=false - If specified, part will be downloaded and decrypted in chunks. The
   * specified callback will be invoked on completion of each chunk. This is recommended for large files,
   * especially if they are encrypted.
   * @param {number=} chunkSize=1000000 - If doing chunked download, size of each chunk to fetch
   * @param {function=} callback - Will be called on completion of each chunk
   * - Signature: ({bytesFinished, bytesTotal, chunk}) => {}
   *
   * Note: If the part is encrypted, bytesFinished/bytesTotal will not exactly match the size of the data
   * received. These values correspond to the size of the encrypted data - when decrypted, the part will be
   * slightly smaller.
   *
   * @returns {Promise<(Blob | ArrayBuffer)>} - Part data as a blob
   */
  async DownloadPart({
    libraryId,
    objectId,
    versionHash,
    partHash,
    format="arrayBuffer",
    chunked=false,
    chunkSize=10000000,
    callback
  }) {
    if(chunked && !callback) { throw Error("No callback specified for chunked part download"); }

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    const encrypted = partHash.startsWith("hqpe");
    const encryption = encrypted ? "cgck" : "none";
    const path = UrlJoin("q", versionHash || objectId, "data", partHash);

    let headers = await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, encryption});

    if(!chunked) {
      // Download and decrypt entire part
      const response = await this.HttpClient.Request({headers, method: "GET", path: path});

      let data = await response.arrayBuffer();

      if(encrypted) {
        const encryptionCap = await this.EncryptionCap({libraryId, objectId});
        data = await Crypto.Decrypt(encryptionCap, data);
      }

      return await ResponseToFormat(
        format,
        new Response(data)
      );
    }

    // Download part in chunks
    const bytesTotal = (await this.ContentPart({libraryId, objectId, versionHash, partHash})).part.size;
    let bytesFinished = 0;

    let stream;
    if(encrypted) {
      // Set up decryption stream
      const encryptionCap = await this.EncryptionCap({libraryId, objectId});
      stream = await Crypto.OpenDecryptionStream(encryptionCap);

      stream = stream.on("data", async chunk => {
        // Turn buffer into desired format, if necessary
        if(format !== "buffer") {
          const arrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);

          if(format === "arrayBuffer") {
            chunk = arrayBuffer;
          } else {
            chunk = await ResponseToFormat(
              format,
              new Response(arrayBuffer)
            );
          }
        }

        callback({
          bytesFinished,
          bytesTotal,
          chunk
        });
      });
    }

    const totalChunks = Math.ceil(bytesTotal / chunkSize);
    for(let i = 0; i < totalChunks; i++) {
      headers["Range"] = `bytes=${bytesFinished}-${bytesFinished + chunkSize - 1}`;
      const response = await this.HttpClient.Request({headers, method: "GET", path: path});

      bytesFinished = Math.min(bytesFinished + chunkSize, bytesTotal);

      if(encrypted) {
        stream.write(new Uint8Array(await response.arrayBuffer()));
      } else {
        callback({bytesFinished, bytesTotal, chunk: await ResponseToFormat(format, response)});
      }
    }

    if(stream) {
      // Wait for decryption to complete
      stream.end();
      await new Promise(resolve =>
        stream.on("finish", () => {
          resolve();
        })
      );
    }
  }

  async EncryptionCap({libraryId, objectId, writeToken, blockSize=1000000}) {
    const owner = await this.authClient.Owner({id: objectId, abi: ContentContract.abi});

    if(!this.utils.EqualAddress(owner, this.signer.address)) {
      // Target decryption
      return await this.authClient.ReencryptionKey(objectId);
    }

    // Primary encryption
    const capKey = `eluv.caps.iusr${this.utils.AddressToHash(this.signer.address)}`;
    const existingCap = await this.ContentObjectMetadata({
      libraryId,
      // Cap may only exist in draft
      objectId: writeToken || objectId,
      metadataSubtree: capKey
    });

    if(existingCap) { return await Crypto.DecryptCap(existingCap, this.signer.signingKey.privateKey); }

    const cap = await Crypto.GeneratePrimaryCap(blockSize);

    // If write token is specified, add it to the metadata
    if(writeToken) {
      const kmsAddress = await this.CallContractMethod({
        contractAddress: this.utils.HashToAddress(objectId),
        abi: ContentContract.abi,
        methodName: "addressKMS"
      });

      const kmsPublicKey = (await this.authClient.KMSInfo({objectId})).publicKey;
      const kmsCapKey = `eluv.caps.ikms${this.utils.AddressToHash(kmsAddress)}`;
      await this.MergeMetadata({
        libraryId,
        objectId,
        writeToken,
        metadata: {
          [capKey]: await Crypto.EncryptCap(cap, this.signer.signingKey.publicKey),
          [kmsCapKey]: await Crypto.EncryptCap(cap, kmsPublicKey)
        }
      });
    }

    return cap;
  }

  /**
   * Create a part upload draft
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
   *
   * @returns {Promise<string>} - The part write token for the part draft
   */
  async CreatePart({libraryId, objectId, writeToken, encryption}) {
    const path = UrlJoin("q", writeToken, "parts");

    const openResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
        method: "POST",
        path,
        bodyType: "BINARY",
        body: ""
      })
    );

    return openResponse.part.write_token;
  }

  /**
   * Upload data to an open part draft
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {string} partWriteToken - Write token of the part
   * @param {(ArrayBuffer | Buffer)} chunk - Data to upload
   * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
   *
   * @returns {Promise<string>} - The part write token for the part draft
   */
  async UploadPartChunk({libraryId, objectId, writeToken, partWriteToken, chunk, encryption}) {
    if(encryption && encryption !== "none") {
      const encryptionCap = await this.EncryptionCap({libraryId, objectId, writeToken});
      chunk = await Crypto.Encrypt(encryptionCap, chunk);
    }

    const path = UrlJoin("q", writeToken, "parts");
    await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
        method: "POST",
        path: UrlJoin(path, partWriteToken),
        body: chunk,
        bodyType: "BINARY",
      })
    );
  }

  /**
   * Finalize an open part draft
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {string} partWriteToken - Write token of the part
   * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
   *
   * @returns {Promise<object>} - The finalize response for the new part
   */
  async FinalizePart({libraryId, objectId, writeToken, partWriteToken, encryption}) {
    const path = UrlJoin("q", writeToken, "parts");
    return await ResponseToJson(
      await this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
        method: "POST",
        path: UrlJoin(path, partWriteToken),
        bodyType: "BINARY",
        body: ""
      })
    );
  }

  /**
   * Upload part to an object draft
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {(ArrayBuffer | Buffer)} data - Data to upload
   * @param {number=} chunkSize=1000000 (1MB) - Chunk size, in bytes
   * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
   *
   * @returns {Promise<Object>} - Response containing information about the uploaded part
   */
  async UploadPart({libraryId, objectId, writeToken, data, encryption="none"}) {
    const partWriteToken = await this.CreatePart({libraryId, objectId, writeToken, encryption});

    await this.UploadPartChunk({libraryId, objectId, writeToken, partWriteToken, chunk: data, encryption});

    return await this.FinalizePart({libraryId, objectId, writeToken, partWriteToken, encryption});
  }

  /**
   * Delete the specified part from a content draft
   *
   * @see DELETE /qlibs/:qlibid/q/:write_token/parts/:qparthash
   *
   * @methodGroup Content Objects
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

  /* Content Object Access */

  /**
   * Set the access charge for the specified object
   *
   * @methodGroup Access Requests
   * @namedParams
   * @param {string} objectId - ID of the object
   * @param {number | string} accessCharge - The new access charge, in ether
   */
  async SetAccessCharge({objectId, accessCharge}) {
    await this.ethClient.CallContractMethodAndWait({
      contractAddress: Utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "setAccessCharge",
      methodArgs: [Utils.EtherToWei(accessCharge).toString()],
      signer: this.signer
    });
  }

  /**
   * Return the type of contract backing the specified ID
   *
   * @methodGroup Access Requests
   * @namedParams
   * @param {string} id - ID of the item
   *
   * @return {Promise<string>} - Contract type of the item
   * - space
   * - library
   * - type,
   * - object
   * - wallet
   * - group
   * - other
   */
  async AccessType({id}) {
    return await this.authClient.AccessType(id);
  }

  /**
   * Retrieve info about the access charge and permissions for the specified object.
   *
   * Note: Access charge is specified in ether
   *
   * @methodGroup Access Requests
   * @namedParams
   * @param {string} objectId - ID of the object
   * @param {object=} args - Arguments to the getAccessInfo method - See the base content contract
   *
   * @return {Promise<Object>} - Info about the access charge and whether or not the object is accessible to the current user   */
  async AccessInfo({objectId, args}) {
    if(!args) {
      args = [
        0, // Access level
        [], // Custom values
        [] // Stakeholders
      ];
    }

    const info = await this.ethClient.CallContractMethod({
      contractAddress: Utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "getAccessInfo",
      methodArgs: args,
      signer: this.signer
    });

    return {
      visibilityCode: info[0],
      visible: info[0] >= 1,
      accessible: info[0] >= 10,
      editable: info[0] >= 100,
      hasAccess: info[1] === 0,
      accessCode: info[1],
      accessCharge: Utils.WeiToEther(info[2]).toString()
    };
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
   * @methodGroup Access Requests
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object
   * @param {Array=} args=[] - Custom arguments to the accessRequest or updateRequest methods
   * @param {boolean=} update=false - If true, will call updateRequest instead of accessRequest
   * @param {boolean=} noCache=false - If true, the resultant transaction hash will not be cached for future use
   *
   * @return {Promise<Object>} - Resultant AccessRequest or UpdateRequest event
   */
  async AccessRequest({libraryId, objectId, versionHash, args=[], update=false, noCache=false}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    return await this.authClient.MakeAccessRequest({
      libraryId,
      objectId,
      versionHash,
      args,
      update,
      skipCache: true,
      noCache
    });
  }

  /**
   * Return the cached access transaction of the specified item, if present
   *
   * @methodGroup Access Requests
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object
   *
   * @return {Promise<string>} - The cached transaction hash if present, otherwise undefined
   */
  async CachedAccessTransaction({libraryId, objectId, versionHash}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

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

  /**
   * Call accessComplete on the specified content object contract using a previously cached requestID.
   * Caching must be enabled and an access request must have been previously made on the specified
   * object by this client instance.
   *
   * @methodGroup Access Requests
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

  /* URL Methods */

  /**
   * Retrieve playout options for the specified content that satisfy the given protocol and DRM requirements
   *
   * @methodGroup URL Generation
   * @namedParams
   * @param {string} versionHash - Version hash of the content
   * @param {Array<string>} protocols - Acceptable playout protocols
   * @param {Array<string>} drms - Acceptable DRM formats
   */
  async PlayoutOptions({versionHash, protocols=["dash", "hls"], drms=[]}) {
    protocols = protocols.map(p => p.toLowerCase());
    drms = drms.map(d => d.toLowerCase());

    const objectId = this.utils.DecodeVersionHash(versionHash).objectId;

    let path = UrlJoin("q", versionHash, "rep", "playout", "default", "options.json");

    const playoutOptions = Object.values(
      await ResponseToJson(
        this.HttpClient.Request({
          headers: await this.authClient.AuthorizationHeader({objectId, channelAuth: true, noAuth: true}),
          method: "GET",
          path: path
        })
      )
    );

    let playoutMap = {};
    for(let i = 0; i < playoutOptions.length; i++) {
      const option = playoutOptions[i];
      const protocol = option.properties.protocol;
      const drm = option.properties.drm;
      const licenseServers = option.properties.license_servers;

      // Exclude any options that do not satisfy the specified protocols and/or DRMs
      const protocolMatch = protocols.includes(protocol);
      const drmMatch = drms.includes(drm) || (drms.length === 0 && !drm);
      if(!protocolMatch || !drmMatch) {
        continue;
      }

      if(!playoutMap[protocol]) {
        playoutMap[protocol] = {
          playoutUrl: await this.Rep({
            versionHash,
            rep: UrlJoin("playout", "default", option.uri)
          }),
        };
      }

      if(drm) {
        playoutMap[protocol].drms = {
          ...(playoutMap[protocol].drms || {}),
          [drm]: {
            licenseServers
          }
        };
      }
    }

    return playoutMap;
  }

  /**
   * Retrieve playout options in BitMovin player format for the specified content that satisfy
   * the given protocol and DRM requirements
   *
   * @methodGroup URL Generation
   * @namedParams
   * @param {string} versionHash - Version hash of the content
   * @param {Array<string>=} protocols=["dash", "hls"] - Acceptable playout protocols
   * @param {Array<string>=} drms=[] - Acceptable DRM formats
   */
  async BitmovinPlayoutOptions({versionHash, protocols=["dash", "hls"], drms=[]}) {
    const objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    const playoutOptions = await this.PlayoutOptions({versionHash, protocols, drms});
    let config = {
      drm: {}
    };

    Object.keys(playoutOptions).forEach(protocol => {
      const option = playoutOptions[protocol];
      config[protocol] = option.playoutUrl;

      if(option.drms) {
        Object.keys(option.drms).forEach(drm => {
          // No license URL specified
          if(!option.drms[drm].licenseServers || option.drms[drm].licenseServers.length === 0) { return; }

          // Opt for https urls
          const filterHTTPS = uri => uri.toLowerCase().startsWith("https");
          let licenseUrls = option.drms[drm].licenseServers;
          if(licenseUrls.find(filterHTTPS)) {
            licenseUrls = licenseUrls.filter(filterHTTPS);
          }

          // Choose a random license server from the available list
          const licenseUrl = licenseUrls.sort(() => 0.5 - Math.random())[0];

          if(!config.drm[drm]) {
            config.drm[drm] = {
              LA_URL: licenseUrl,
              headers: {
                Authorization: `Bearer ${this.authClient.channelContentTokens[objectId]}`
              }
            };
          }
        });
      }
    });

    return config;
  }

  /**
   * Generate a URL to the specified /call endpoint of a content object to call a bitcode method.
   * URL includes authorization token.
   *
   * Alias for the FabricUrl method with the "call" parameter
   *
   * @methodGroup URL Generation
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
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
   * @methodGroup URL Generation
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} rep - Representation to use
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} channelAuth=true - If specified, state channel authorization will be performed instead of access request authorization
   * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
   * token. This is useful for accessing public assets.
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached. This option has no effect if noAuth is true.
   *
   * @see FabricUrl for creating arbitrary fabric URLs
   *
   * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
   */
  async Rep({libraryId, objectId, versionHash, rep, queryParams={}, channelAuth=true, noAuth=false, noCache=false}) {
    return this.FabricUrl({libraryId, objectId, versionHash, rep, queryParams, channelAuth, noAuth, noCache});
  }

  /**
   * Generate a URL to the specified item in the content fabric with appropriate authorization token.
   *
   * @methodGroup URL Generation
   * @namedParams
   * @param {string=} libraryId - ID of an library
   * @param {string=} objectId - ID of an object
   * @param {string=} versionHash - Hash of an object version
   * @param {string=} partHash - Hash of a part - Requires object ID
   * @param {string=} rep - Rep parameter of the url
   * @param {string=} call - Bitcode method to call
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} channelAuth=false - If specified, state channel authorization will be used instead of access request authorization
   * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
   * token. This is useful for accessing public assets.
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached. This option has no effect if noAuth is true.
   *
   * @returns {Promise<string>} - URL to the specified endpoint with authorization token
   */
  async FabricUrl({
    libraryId,
    objectId,
    versionHash,
    partHash,
    rep,
    call,
    queryParams={},
    channelAuth=false,
    noAuth=false,
    noCache=false
  }) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    // Clone queryParams to avoid modification of the original
    queryParams = {...queryParams};

    let path = "";
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
        queryParams.authorization = await this.authClient.AuthorizationToken({libraryId, objectId, versionHash, channelAuth, noCache});
      }
    } else if(versionHash) {
      path = UrlJoin("q", versionHash);

      if(!noAuth) {
        queryParams.authorization = await this.authClient.AuthorizationToken({objectId, versionHash, channelAuth, noCache});
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
      path,
      queryParams
    });
  }

  /**
   * Generate a URL to the specified content object file with appropriate authorization token.
   *
   * @methodGroup URL Generation
   * @namedParams
   * @param {string=} libraryId - ID of an library - Required if versionHash not specified
   * @param {string=} objectId - ID of an object
   * @param {string=} versionHash - Hash of an object version - Required if libraryId is not specified
   * @param {string} filePath - Path to the content object file
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached.
   *
   * @returns {Promise<string>} - URL to the specified file with authorization token
   */
  async FileUrl({libraryId, objectId, versionHash, filePath, queryParams={}, noCache=false}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    let path;

    if(libraryId) {
      path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, "files", filePath);
    } else {
      path = UrlJoin("q", versionHash, "files", filePath);
    }

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
   * @methodGroup Access Groups
   *
   * @returns {Promise<string>} - Contract address of created access group
   */
  async CreateAccessGroup() {
    const { contractAddress } = await this.authClient.CreateAccessGroup();

    return contractAddress;
  }

  /**
   * Returns the address of the owner of the specified content object
   *
   * @methodGroup Access Groups
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
   * @methodGroup Access Groups
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

  async AccessGroupMembershipMethod({contractAddress, memberAddress, methodName, eventName}) {
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
   * @methodGroup Access Groups
   * @namedParams
   * @param {string} contractAddress - Address of the access group contract
   * @param {string} memberAddress - Address of the member to add
   *
   * @returns {Promise<string>} - The transaction hash of the call to the grantAccess method
   */
  async AddAccessGroupMember({contractAddress, memberAddress}) {
    return await this.AccessGroupMembershipMethod({
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
   * @methodGroup Access Groups
   * @namedParams
   * @param {string} contractAddress - Address of the access group contract
   * @param {string} memberAddress - Address of the member to remove
   *
   * @returns {Promise<string>} - The transaction hash of the call to the revokeAccess method
   */
  async RemoveAccessGroupMember({contractAddress, memberAddress}) {
    return await this.AccessGroupMembershipMethod({
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
   * @methodGroup Access Groups
   * @namedParams
   * @param {string} contractAddress - Address of the access group contract
   * @param {string} memberAddress - Address of the manager to add
   *
   * @returns {Promise<string>} - The transaction hash of the call to the grantManagerAccess method
   */
  async AddAccessGroupManager({contractAddress, memberAddress}) {
    return await this.AccessGroupMembershipMethod({
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
   * @methodGroup Access Groups
   * @namedParams
   * @param {string} contractAddress - Address of the access group contract
   * @param {string} memberAddress - Address of the manager to remove
   *
   * @returns {Promise<string>} - The transaction hash of the call to the revokeManagerAccess method
   */
  async RemoveAccessGroupManager({contractAddress, memberAddress}) {
    return await this.AccessGroupMembershipMethod({
      contractAddress,
      memberAddress,
      methodName: "revokeManagerAccess",
      eventName: "ManagerAccessRevoked"
    });
  }

  /* Collection */

  /**
   * Get a list of unique addresses of all of the specified type the current user has access
   * to through both their user wallet and through access groups
   *
   * @methodGroup Collections
   * @namedParams
   * @param {string} collectionType - Type of collection to retrieve
   * - accessGroups
   * - contentObjects
   * - contentTypes
   * - contracts
   * - libraries
   *
   * @return {Promise<Array<string>>} - List of addresses of available items
   */
  async Collection({collectionType}) {
    const validCollectionTypes = [
      "accessGroups",
      "contentObjects",
      "contentTypes",
      "contracts",
      "libraries"
    ];

    if(!validCollectionTypes.includes(collectionType)) {
      throw new Error("Invalid collection type: " + collectionType);
    }

    const walletAddress = this.signer ? await this.userProfileClient.WalletAddress() : undefined;
    if(!walletAddress) {
      throw new Error("Unable to get collection: User wallet doesn't exist");
    }

    return await this.ethClient.MakeProviderCall({
      methodName: "send",
      args: [
        "elv_getWalletCollection",
        [
          this.contentSpaceId,
          `iusr${this.utils.AddressToHash(this.signer.address)}`,
          collectionType
        ]
      ]
    });
  }

  /* Verification */

  /**
   * Verify the specified content object
   *
   * @methodGroup Content Objects
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
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - If not specified, latest version will be used
   * @param {string} partHash - Hash of the part
   *
   * @returns {Promise<Object>} - Response containing proof information
   */
  async Proofs({libraryId, objectId, versionHash, partHash}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

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
   * @methodGroup Content Objects
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
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, partHash}),
        method: "GET",
        path: path
      })
    );
  }

  /* Contracts */

  /**
   * Format the arguments to be used for the specified method of the contract
   *
   * @methodGroup Contracts
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
   * @methodGroup Contracts
   * @namedParams
   * @param {Object} abi - ABI of contract
   * @param {string} bytecode - Bytecode of the contract
   * @param {Array<string>} constructorArgs - List of arguments to the contract constructor
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
   * @methodGroup Contracts
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {string} methodName - Method to call on the contract
   * @param {Array=} methodArgs - List of arguments to the contract constructor
   * @param {(number | BigNumber)=} value - Amount of ether to include in the transaction
   * @param {boolean=} formatArguments=true - If specified, the arguments will automatically be formatted to the ABI specification
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   *
   * @returns {Promise<*>} - Response containing information about the transaction
   */
  async CallContractMethod({contractAddress, abi, methodName, methodArgs=[], value, overrides={}, formatArguments=true}) {
    return await this.ethClient.CallContractMethod({
      contractAddress,
      abi,
      methodName,
      methodArgs,
      value,
      overrides,
      formatArguments,
      signer: this.signer
    });
  }

  /**
   * Call the specified method on a deployed contract and wait for the transaction to be mined.
   * This action will be performed by this client's signer.
   *
   * @methodGroup Contracts
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {string} methodName - Method to call on the contract
   * @param {Array<string>=} methodArgs=[] - List of arguments to the contract constructor
   * @param {(number | BigNumber)=} value - Amount of ether to include in the transaction
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   * @param {boolean=} formatArguments=true - If specified, the arguments will automatically be formatted to the ABI specification
   *
   * @see Utils.WeiToEther
   *
   * @returns {Promise<*>} - The event object of this transaction
   */
  async CallContractMethodAndWait({contractAddress, abi, methodName, methodArgs, value, overrides={}, formatArguments=true}) {
    return await this.ethClient.CallContractMethodAndWait({
      contractAddress,
      abi,
      methodName,
      methodArgs,
      value,
      overrides,
      formatArguments,
      signer: this.signer
    });
  }

  /**
   * Extract the specified event log from the given event obtained from the
   * CallContractAndMethodAndWait method
   *
   * @methodGroup Contracts
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {Object} event - Event of the transaction from CallContractMethodAndWait
   * @param {string} eventName - Name of the event to parse
   *
   * @see Utils.WeiToEther
   *
   * @returns {Promise<Object>} - The parsed event log from the event
   */
  ExtractEventFromLogs({abi, event, eventName}) {
    return this.ethClient.ExtractEventFromLogs({abi, event, eventName});
  }

  /**
   * Extract the specified value from the specified event log from the given event obtained
   * from the CallContractAndMethodAndWait method
   *
   * @methodGroup Contracts
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {Object} event - Event of the transaction from CallContractMethodAndWait
   * @param {string} eventName - Name of the event to parse
   * @param {string} eventValue - Name of the value to extract from the event
   *
   * @returns {Promise<string>} The value extracted from the event
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
   * @methodGroup Contracts
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
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   *
   * @returns {Promise<string> | undefined} - If the object has a custom contract, this will return the address of the custom contract
   */
  async CustomContractAddress({libraryId, objectId}) {
    if(libraryId === this.contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId)) {
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
   * @methodGroup Contracts
   * @namedParams
   * @param {string} contractAddress - The address of the contract
   * @param {object} abi - The ABI of the contract
   * @param {number=} fromBlock - Limit results to events after the specified block (inclusive)
   * @param {number=} toBlock - Limit results to events before the specified block (inclusive)
   * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
   * Note: This requires one extra network call per block, so it should not be used for very large ranges
   * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
   */
  async ContractEvents({contractAddress, abi, fromBlock=0, toBlock, includeTransaction=false}) {
    return await this.ethClient.ContractEvents({
      contractAddress,
      abi,
      fromBlock,
      toBlock,
      includeTransaction
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
   * @methodGroup Contracts
   * @namedParams
   * @param {number=} toBlock - Limit results to events before the specified block (inclusive) - If not specified, will start from latest block
   * @param {number=} fromBlock - Limit results to events after the specified block (inclusive)
   * @param {number=} count=10 - Max number of events to include (unless both toBlock and fromBlock are unspecified)
   * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
   * Note: This requires two extra network calls per transaction, so it should not be used for very large ranges
   * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
   */
  async Events({toBlock, fromBlock, count=10, includeTransaction=false}={}) {
    const latestBlock = await this.BlockNumber();

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
      includeTransaction
    });
  }

  async BlockNumber() {
    return await this.ethClient.MakeProviderCall({methodName: "getBlockNumber"});
  }

  /**
   * Get the balance (in ether) of the specified address
   *
   * @methodGroup Signers
   * @namedParams
   * @param {string} address - Address to query
   *
   * @returns {Promise<number>} - Balance of the account, in ether
   */
  async GetBalance({address}) {
    const balance = await this.ethClient.MakeProviderCall({methodName: "getBalance", args: [address]});
    return await Ethers.utils.formatEther(balance);
  }

  /**
   * Send ether from this client's current signer to the specified recipient address
   *
   * @methodGroup Signers
   * @namedParams
   * @param {string} recipient - Address of the recipient
   * @param {number} ether - Amount of ether to send
   *
   * @returns {Promise<Object>} - The transaction receipt
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
      "AccessGroupMembershipMethod",
      "CallFromFrameMessage",
      "ClearSigner",
      "FrameAllowedMethods",
      "FromConfigurationUrl",
      "GenerateWallet",
      "InitializeClients",
      "SetSigner",
      "SetSignerFromWeb3Provider",
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
      if(message.module === "userProfileClient") {
        if(!this.userProfileClient.FrameAllowedMethods().includes(method)) {
          throw Error("Invalid user profile method: " + method);
        }

        methodResults = await this.userProfileClient[method](message.args);
      } else {
        if(!this.FrameAllowedMethods().includes(method)) {
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
