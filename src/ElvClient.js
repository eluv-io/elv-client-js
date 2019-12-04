require("@babel/polyfill");

if(typeof Buffer === "undefined") { Buffer = require("buffer/").Buffer; }

const UrlJoin = require("url-join");
const URI = require("urijs");
const Ethers = require("ethers");

const AuthorizationClient = require("./AuthorizationClient");
const ElvWallet = require("./ElvWallet");
const EthClient = require("./EthClient");
const UserProfileClient = require("./UserProfileClient");
const HttpClient = require("./HttpClient");
// const ContentObjectVerification = require("./ContentObjectVerification");
const Utils = require("./Utils");
const Crypto = require("./Crypto");
const LimitedMap = require("./LimitedMap");

const SpaceContract = require("./contracts/BaseContentSpace");
const LibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");
const ContentTypeContract = require("./contracts/BaseContentType");
const AccessGroupContract = require("./contracts/BaseAccessControlGroup");

const {
  ValidateLibrary,
  ValidateObject,
  ValidateVersion,
  ValidateWriteToken,
  ValidatePartHash,
  ValidateAddress,
  ValidateParameters
} = require("./Validation");

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
  Log(message, error=false) {
    if(!this.debug) { return; }

    if(typeof message === "object") {
      message = JSON.stringify(message);
    }

    error ?
      // eslint-disable-next-line no-console
      console.error(`\n(elv-client-js#ElvClient) ${message}\n`) :
      // eslint-disable-next-line no-console
      console.log(`\n(elv-client-js#ElvClient) ${message}\n`);
  }

  /**
   * Enable or disable verbose logging
   *
   * @methodGroup Miscellaneous
   *
   * @param {boolean} enable - Set logging
   */
  ToggleLogging(enable) {
    this.debug = enable;
    this.authClient ? this.authClient.debug = enable : undefined;
    this.ethClient ? this.ethClient.debug = enable : undefined;
    this.HttpClient ? this.HttpClient.debug = enable : undefined;
    this.userProfileClient ? this.userProfileClient.debug = enable : undefined;

    if(enable) {
      this.Log(
        `Debug Logging Enabled:
        Content Space: ${this.contentSpaceId}
        Fabric URLs: [\n\t\t${this.fabricURIs.join(", \n\t\t")}\n\t]
        Ethereum URLs: [\n\t\t${this.ethereumURIs.join(", \n\t\t")}\n\t]`
      );
    }
  }

  /**
   * Create a new ElvClient
   *
   * @constructor
   *
   * @namedParams
   * @param {string} contentSpaceId - ID of the content space
   * @param {Array<string>} fabricURIs - A list of full URIs to content fabric nodes
   * @param {Array<string>} ethereumURIs - A list of full URIs to ethereum nodes
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  constructor({
    contentSpaceId,
    fabricURIs,
    ethereumURIs,
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

    this.noCache = noCache;
    this.noAuth = noAuth;

    this.debug = false;

    this.InitializeClients();
  }

  /**
   * Retrieve content space info and preferred fabric and blockchain URLs from the fabric
   *
   * @methodGroup Constructor
   * @namedParams
   * @param {string} configUrl - Full URL to the config endpoint
   * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: na-west-north na-west-south na-east eu-west
   *
   * @return {Promise<Object>} - Object containing content space ID and fabric and ethereum URLs
   */
  static async Configuration({
    configUrl,
    region
  }) {
    try {
      const uri = new URI(configUrl);

      if(region) {
        uri.addSearch("elvgeo", region);
      }

      const fabricInfo = await ResponseToJson(
        HttpClient.Fetch(uri.toString())
      );

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

      return {
        nodeId: fabricInfo.node_id,
        contentSpaceId: fabricInfo.qspace.id,
        fabricURIs,
        ethereumURIs
      };
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Error retrieving fabric configuration:");
      // eslint-disable-next-line no-console
      console.error(error);

      throw error;
    }
  }

  /**
   * Create a new ElvClient from the specified configuration URL
   *
   * @methodGroup Constructor
   * @namedParams
   * @param {string} configUrl - Full URL to the config endpoint
   * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: na-west-north na-west-south na-east eu-west
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {Promise<ElvClient>} - New ElvClient connected to the specified content fabric and blockchain
   */
  static async FromConfigurationUrl({
    configUrl,
    region,
    noCache=false,
    noAuth=false
  }) {
    const {
      contentSpaceId,
      fabricURIs,
      ethereumURIs
    } = await ElvClient.Configuration({
      configUrl,
      region
    });

    const client = new ElvClient({
      contentSpaceId,
      fabricURIs,
      ethereumURIs,
      noCache,
      noAuth
    });

    client.configUrl = configUrl;

    return client;
  }

  InitializeClients() {
    this.contentTypes = {};
    this.encryptionConks = {};
    this.reencryptionConks = {};
    this.stateChannelAccess = {};
    this.objectLibraryIds = {};

    this.HttpClient = new HttpClient({uris: this.fabricURIs, debug: this.debug});
    this.ethClient = new EthClient({uris: this.ethereumURIs, debug: this.debug});

    this.authClient = new AuthorizationClient({
      client: this,
      contentSpaceId: this.contentSpaceId,
      signer: this.signer,
      noCache: this.noCache,
      noAuth: this.noAuth,
      debug: this.debug
    });

    this.userProfileClient = new UserProfileClient({
      client: this,
      debug: this.debug
    });
  }

  SetAuth(auth) {
    this.noAuth = !auth;
    this.authClient.noAuth = !auth;
  }

  /**
   * Update fabric URLs to prefer the specified region.
   *
   * Note: Client must have been initialized with FromConfiguration
   *
   * @methodGroup Nodes
   * @namedParams
   * @param {string} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: na-west-north na-west-south na-east eu-west
   *
   * @return {Promise<Object>} - An object containing the updated fabric and ethereum URLs in order of preference
   */
  async UseRegion({region}) {
    if(!this.configUrl) {
      throw Error("Unable to change region: Configuration URL not set");
    }

    const { fabricURIs, ethereumURIs } = await ElvClient.Configuration({
      configUrl: this.configUrl,
      region
    });

    this.fabricURIs = fabricURIs;
    this.ethereumURIs = ethereumURIs;

    this.HttpClient.uris = fabricURIs;
    this.HttpClient.uriIndex = 0;

    this.ethClient.ethereumURIs = ethereumURIs;
    this.ethClient.ethereumURIIndex = 0;

    return {
      fabricURIs,
      ethereumURIs
    };
  }

  /**
   * Reset fabric URLs to prefer the best region auto-detected by the fabric.
   *
   * Note: Client must have been initialized with FromConfiguration
   *
   * @methodGroup Nodes
   *
   * @return {Promise<Object>} - An object containing the updated fabric and ethereum URLs in order of preference
   */
  async ResetRegion() {
    if(!this.configUrl) {
      throw Error("Unable to change region: Configuration URL not set");
    }

    return await this.UseRegion({region: ""});
  }

  /**
   * Retrieve the node ID reported by the fabric for the specified region
   *
   * Note: Client must have been initialized with FromConfiguration
   *
   * @methodGroup Nodes
   *
   * @namedParams
   * @param {string} region - Region from which to retrieve the node ID
   *
   * @return {Promise<string>} - The node ID reported by the fabric
   */
  async NodeId({region}) {
    const { nodeId } = await ElvClient.Configuration({
      configUrl: this.configUrl,
      region
    });

    return nodeId;
  }

  /**
   * Retrieve the fabric and ethereum nodes currently used by the client, in preference order
   *
   * @methodGroup Nodes
   *
   * @return {Promise<Object>} - An object containing the lists of fabric and ethereum urls in use by the client
   */
  Nodes() {
    return {
      fabricURIs: this.fabricURIs,
      ethereumURIs: this.ethereumURIs
    };
  }

  /**
   * Set the client to use the specified fabric and ethereum nodes, in preference order
   *
   * @namedParams
   * @param {Array<string>=} fabricURIs - A list of URLs for the fabric, in preference order
   * @param {Array<string>=} ethereumURIs - A list of URLs for the blockchain, in preference order
   *
   * @methodGroup Nodes
   */
  SetNodes({fabricURIs, ethereumURIs}) {
    if(fabricURIs) {
      this.fabricURIs = fabricURIs;

      this.HttpClient.uris = fabricURIs;
      this.HttpClient.uriIndex = 0;
    }

    if(ethereumURIs) {
      this.ethereumURIs = ethereumURIs;

      this.ethClient.ethereumURIs = ethereumURIs;
      this.ethClient.ethereumURIIndex = 0;
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
  SetSigner({signer}) {
    signer.connect(this.ethClient.Provider());
    signer.provider.pollingInterval = 250;
    this.signer = signer;

    this.InitializeClients();
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
    ValidateLibrary(libraryId);

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
    ValidateLibrary(libraryId);

    return this.utils.FormatAddress(
      await this.ethClient.CallContractMethod({
        contractAddress: Utils.HashToAddress(libraryId),
        abi: LibraryContract.abi,
        methodName: "owner",
        methodArgs: [],
        signer: this.signer
      })
    );
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

    this.Log("Creating content library");
    this.Log(`KMS ID: ${kmsId}`);

    const { contractAddress } = await this.authClient.CreateContentLibrary({kmsId});

    metadata = {
      ...metadata,
      name,
      description,
      public: {
        name,
        description
      }
    };

    const libraryId = this.utils.AddressToLibraryId(contractAddress);

    this.Log(`Library ID: ${libraryId}`);
    this.Log(`Contract address: ${contractAddress}`);

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

    this.Log(`Library ${libraryId} created`);

    return libraryId;
  }

  /**
   * Set the image associated with this library
   *
   * @methodGroup Content Libraries
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {Blob | ArrayBuffer | Buffer} image - Image to upload
   */
  async SetContentLibraryImage({libraryId, image}) {
    ValidateLibrary(libraryId);

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
   * @param {Blob | ArrayBuffer | Buffer} image - Image to upload
   */
  async SetContentObjectImage({libraryId, objectId, image}) {
    ValidateParameters({libraryId, objectId});

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

    await this.MergeMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadata: {
        "image": uploadResponse.part.hash,
      }
    });

    await this.MergeMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadataSubtree: "public",
      metadata: {
        "image": uploadResponse.part.hash,
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
    ValidateLibrary(libraryId);

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
    ValidateLibrary(libraryId);

    this.Log(`Adding library content type to ${libraryId}: ${typeId || typeHash || typeName}`);

    if(typeHash) { typeId = this.utils.DecodeVersionHash(typeHash).objectId; }

    if(!typeId) {
      // Look up type by name
      const type = await this.ContentType({name: typeName});
      typeId = type.id;
    }

    this.Log(`Type ID: ${typeId}`);

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
    ValidateLibrary(libraryId);

    this.Log(`Removing library content type from ${libraryId}: ${typeId || typeHash || typeName}`);

    if(typeHash) { typeId = this.utils.DecodeVersionHash(typeHash).objectId; }

    if(!typeId) {
      // Look up type by name
      const type = await this.ContentType({name: typeName});
      typeId = type.id;
    }

    this.Log(`Type ID: ${typeId}`);

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
   * @returns {Promise<Object>} - List of accepted content types - return format is equivalent to ContentTypes method
   */
  async LibraryContentTypes({libraryId}) {
    ValidateLibrary(libraryId);

    this.Log(`Retrieving library content types for ${libraryId}`);

    const typesLength = (await this.ethClient.CallContractMethod({
      contractAddress: Utils.HashToAddress(libraryId),
      abi: LibraryContract.abi,
      methodName: "contentTypesLength",
      methodArgs: [],
      signer: this.signer
    })).toNumber();

    this.Log(`${typesLength} types`);

    // No allowed types set - any type accepted
    if(typesLength === 0) { return {}; }

    // Get the list of allowed content type addresses
    let allowedTypes = {};
    await Promise.all(
      Array.from(new Array(typesLength), async (_, i) => {
        const typeAddress = await this.ethClient.CallContractMethod({
          contractAddress: Utils.HashToAddress(libraryId),
          abi: LibraryContract.abi,
          methodName: "contentTypes",
          methodArgs: [i],
          signer: this.signer
        });

        const typeId = this.utils.AddressToObjectId(typeAddress);
        allowedTypes[typeId] = await this.ContentType({typeId});
      })
    );

    this.Log(allowedTypes);

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

    return this.utils.FormatAddress(
      await this.ethClient.CallContractMethod({
        contractAddress: Utils.HashToAddress(contentType.id),
        abi: ContentTypeContract.abi,
        methodName: "owner",
        methodArgs: [],
        signer: this.signer
      })
    );
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
    this.Log(`Retrieving content type: ${name || typeId || versionHash}`);

    if(versionHash) { typeId = this.utils.DecodeVersionHash(versionHash).objectId; }

    if(name) {
      this.Log("Looking up type by name in content space metadata...");
      // Look up named type in content space metadata
      typeId = await this.ContentObjectMetadata({
        libraryId: this.contentSpaceLibraryId,
        objectId: this.contentSpaceObjectId,
        metadataSubtree: UrlJoin("contentTypes", name)
      });
    }

    if(!typeId) {
      this.Log("Looking up type by name in available types...");
      const types = await this.ContentTypes();

      if(name) {
        return Object.values(types).find(type => (type.name || "").toLowerCase() === name.toLowerCase());
      } else {
        return Object.values(types).find(type => type.hash === versionHash);
      }
    }

    try {
      this.Log("Looking up type by ID...");

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
      this.Log("Error looking up content type:");
      this.Log(error);
      throw new Error(`Content Type ${name || typeId} is invalid`);
    }
  }

  /**
   * List all content types accessible to this user.
   *
   * @methodGroup Content Types
   * @namedParams
   *
   * @return {Promise<Object>} - Available content types
   */
  async ContentTypes() {
    this.contentTypes = this.contentTypes || {};

    this.Log("Looking up all available content types");

    // Personally available types
    let typeAddresses = await this.Collection({collectionType: "contentTypes"});

    this.Log("Personally available types:");
    this.Log(typeAddresses);

    // Content space types
    const contentSpaceTypes = await this.ContentObjectMetadata({
      libraryId: this.contentSpaceLibraryId,
      objectId: this.contentSpaceObjectId,
      metadataSubtree: "contentTypes"
    }) || {};

    const contentSpaceTypeAddresses = Object.values(contentSpaceTypes)
      .map(typeId => this.utils.HashToAddress(typeId));

    this.Log("Content space types:");
    this.Log(contentSpaceTypeAddresses);

    typeAddresses = typeAddresses
      .concat(contentSpaceTypeAddresses)
      .filter(address => address)
      .map(address => this.utils.FormatAddress(address))
      .filter((v, i, a) => a.indexOf(v) === i);

    await Promise.all(
      typeAddresses.map(async typeAddress => {
        const typeId = this.utils.AddressToObjectId(typeAddress);

        if(!this.contentTypes[typeId]) {
          try {
            this.contentTypes[typeId] = await this.ContentType({typeId});
          } catch(error) {
            // eslint-disable-next-line no-console
            // console.error(error);
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
    this.Log(`Creating content type: ${name}`);

    metadata.name = name;
    metadata.public = {
      name,
      ...(metadata.public || {})
    };

    const { contractAddress } = await this.authClient.CreateContentType();

    const objectId = this.utils.AddressToObjectId(contractAddress);
    const path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);

    this.Log(`Created type: ${contractAddress} ${objectId}`);

    /* Create object, upload bitcode and finalize */
    const createResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({
          libraryId: this.contentSpaceLibraryId,
          objectId,
          update: true
        }),
        method: "POST",
        path: path,
        failover: false
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
    ValidateLibrary(libraryId);

    this.Log(`Retrieving content objects from ${libraryId}`);

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

    this.Log("Filter options:");
    this.Log(filterOptions);

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
    ValidateParameters({libraryId, objectId, versionHash});

    this.Log(`Retrieving content object: ${libraryId || ""} ${objectId || versionHash}`);

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
    ValidateObject(objectId);

    this.Log(`Retrieving content object owner: ${objectId}`);

    return this.utils.FormatAddress(
      await this.ethClient.CallContractMethod({
        contractAddress: Utils.HashToAddress(objectId),
        abi: ContentContract.abi,
        methodName: "owner",
        methodArgs: [],
        cacheContract: false,
        signer: this.signer
      })
    );
  }

  /**
   * Retrieve the library ID for the specified content object
   *
   * @methodGroup Content Objects
   *
   * @namedParams
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object
   *
   * @returns {Promise<string>} - Library ID of the object
   */
  async ContentObjectLibraryId({objectId, versionHash}) {
    versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    if(!this.objectLibraryIds[objectId]) {
      this.Log(`Retrieving content object library ID: ${objectId || versionHash}`);

      this.objectLibraryIds[objectId] = Utils.AddressToLibraryId(
        await this.CallContractMethod({
          contractAddress: Utils.HashToAddress(objectId),
          abi: ContentContract.abi,
          methodName: "libraryAddress"
        })
      );
    }

    return this.objectLibraryIds[objectId];
  }

  async ProduceMetadataLinks({
    libraryId,
    objectId,
    versionHash,
    path="/",
    metadata,
    noAuth=true
  }) {
    // Primitive
    if(!metadata || typeof metadata !== "object") { return metadata; }

    // Array
    if(Array.isArray(metadata)) {
      return await LimitedMap(
        5,
        metadata,
        async (entry, i) => await this.ProduceMetadataLinks({
          libraryId,
          objectId,
          versionHash,
          path: UrlJoin(path, i.toString()),
          metadata: entry,
          noAuth
        })
      );
    }

    // Object
    if(metadata["/"] &&
      (metadata["/"].match(/\.\/(rep|files)\/.+/) ||
        metadata["/"].match(/^\/?qfab\/([\w]+)\/?(rep|files)\/.+/)))
    {
      // Is file or rep link - produce a url
      return {
        ...metadata,
        url: await this.LinkUrl({libraryId, objectId, versionHash, linkPath: path})
      };
    }

    let result = {};
    await LimitedMap(
      5,
      Object.keys(metadata),
      async key => {
        result[key] = await this.ProduceMetadataLinks({
          libraryId,
          objectId,
          versionHash,
          path: UrlJoin(path, key),
          metadata: metadata[key],
          noAuth
        });
      }
    );

    return result;
  }

  /**
   * Get the metadata of a content object
   *
   * @see /qlibs/:qlibid/q/:qhit/meta
   *
   * @methodGroup Metadata
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
   * @param {string=} writeToken - Write token of an object draft - if specified, will read metadata from the draft
   * @param {string=} metadataSubtree - Subtree of the object metadata to retrieve
   * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
   * @param {boolean=} produceLinkUrls=false - If specified, file and rep links will automatically be populated with a
   * full URL
   * @param {boolean=} noAuth=false - If specified, authorization will not be performed for this call
   *
   * @returns {Promise<Object | string>} - Metadata of the content object
   */
  async ContentObjectMetadata({
    libraryId,
    objectId,
    versionHash,
    writeToken,
    metadataSubtree="/",
    resolveLinks=false,
    produceLinkUrls=false,
    noAuth=true
  }) {
    ValidateParameters({libraryId, objectId, versionHash});

    this.Log(
      `Retrieving content object metadata: ${libraryId || ""} ${objectId || versionHash} ${writeToken || ""}
       Subtree: ${metadataSubtree}`
    );

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    let path = UrlJoin("q", writeToken || versionHash || objectId, "meta", metadataSubtree);

    let metadata;
    try {
      metadata = await ResponseToJson(
        this.HttpClient.Request({
          headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, noAuth}),
          queryParams: {resolve: resolveLinks},
          method: "GET",
          path: path
        })
      );
    } catch(error) {
      if(error.status !== 404) {
        throw error;
      }

      metadata = metadataSubtree === "/" ? {} : undefined;
    }

    if(!produceLinkUrls) { return metadata; }

    return await this.ProduceMetadataLinks({
      libraryId,
      objectId,
      versionHash,
      path: metadataSubtree,
      metadata,
      noAuth
    });
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
  async ContentObjectVersions({libraryId, objectId, noAuth=false}) {
    ValidateParameters({libraryId, objectId});

    this.Log(`Retrieving content object versions: ${libraryId || ""} ${objectId || versionHash}`);

    let path = UrlJoin("qid", objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, noAuth}),
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
    ValidateLibrary(libraryId);
    if(objectId) { ValidateObject(objectId); }

    this.Log(`Creating content object: ${libraryId} ${objectId || ""}`);

    // Look up content type, if specified
    let typeId;
    if(options.type) {
      this.Log(`Type specified: ${options.type}`);

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
      this.Log("Deploying contract...");
      const { contractAddress } = await this.authClient.CreateContentObject({libraryId, typeId});

      objectId = this.utils.AddressToObjectId(contractAddress);
      this.Log(`Contract deployed: ${contractAddress} ${objectId}`);
    } else {
      this.Log(`Contract already deployed for contract type: ${await this.AccessType({id: objectId})}`);
    }

    if(options.visibility) {
      this.Log(`Setting visibility to ${options.visibility}`);

      await this.CallContractMethod({
        abi: ContentContract.abi,
        contractAddress: this.utils.HashToAddress(objectId),
        methodName: "setVisibility",
        methodArgs: [options.visibility]
      });
    }

    const path = UrlJoin("qid", objectId);

    return await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
        path: path,
        body: options,
        failover: false
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
    ValidateLibrary(libraryId);
    ValidateVersion(originalVersionHash);

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
    ValidateParameters({libraryId, objectId});

    this.Log(`Opening content draft: ${libraryId} ${objectId}`);

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
        body: options,
        failover: false
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
   * @param {boolean=} publish=true - If specified, the object will also be published
   * @param {boolean=} awaitCommitConfirmation=true - If specified, will wait for the publish commit to be confirmed.
   * Irrelevant if not publishing.
   */
  async FinalizeContentObject({libraryId, objectId, writeToken, publish=true, awaitCommitConfirmation=true}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(`Finalizing content draft: ${libraryId} ${objectId} ${writeToken}`);

    let path = UrlJoin("q", writeToken);

    const finalizeResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
        path: path,
        failover: false
      })
    );

    this.Log(`Finalized: ${finalizeResponse.hash}`);

    if(publish) {
      await this.PublishContentVersion({
        objectId,
        versionHash: finalizeResponse.hash,
        awaitCommitConfirmation
      });
    }

    // Invalidate cached content type, if this is one.
    delete this.contentTypes[objectId];

    return finalizeResponse;
  }

  /**
   * Publish a previously finalized content object version
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} versionHash - The version hash of the content object to publish
   * @param {boolean=} awaitCommitConfirmation=true - If specified, will wait for the publish commit to be confirmed.
   */
  async PublishContentVersion({objectId, versionHash, awaitCommitConfirmation=true}) {
    versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

    this.Log(`Publishing: ${objectId || versionHash}`);

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    await this.ethClient.CommitContent({
      contentObjectAddress: this.utils.HashToAddress(objectId),
      versionHash,
      signer: this.signer
    });

    if(awaitCommitConfirmation) {
      this.Log("Awaiting commit confirmation...");

      await this.ethClient.AwaitEvent({
        contractAddress: this.utils.HashToAddress(objectId),
        abi: ContentContract.abi,
        eventName: "VersionConfirm",
        signer: this.signer
      });
    }
  }

  /**
   * Delete specified version of the content object
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be deleted
   */
  async DeleteContentVersion({versionHash}) {
    ValidateVersion(versionHash);

    this.Log(`Deleting content version: ${versionHash}`);

    const { objectId } = this.utils.DecodeVersionHash(versionHash);

    await this.CallContractMethodAndWait({
      contractAddress: this.utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "deleteVersion",
      methodArgs: [versionHash]
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
    ValidateParameters({libraryId, objectId});

    this.Log(`Deleting content version: ${libraryId} ${objectId}`);

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
   * @methodGroup Metadata
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Object} metadata - New metadata to merge
   * @param {string=} metadataSubtree - Subtree of the object metadata to modify
   */
  async MergeMetadata({libraryId, objectId, writeToken, metadataSubtree="/", metadata={}}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(
      `Merging metadata: ${libraryId} ${objectId} ${writeToken}
      Subtree: ${metadataSubtree}`
    );
    this.Log(metadata);

    let path = UrlJoin("q", writeToken, "meta", metadataSubtree);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "POST",
      path: path,
      body: metadata,
      failover: false
    });
  }

  /**
   * Replace content object metadata with specified metadata
   *
   * @see PUT /qlibs/:qlibid/q/:write_token/meta
   *
   * @methodGroup Metadata
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Object} metadata - New metadata to merge
   * @param {string=} metadataSubtree - Subtree of the object metadata to modify
   */
  async ReplaceMetadata({libraryId, objectId, writeToken, metadataSubtree="/", metadata={}}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(
      `Replacing metadata: ${libraryId} ${objectId} ${writeToken}
      Subtree: ${metadataSubtree}`
    );
    this.Log(metadata);

    let path = UrlJoin("q", writeToken, "meta", metadataSubtree);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "PUT",
      path: path,
      body: metadata,
      failover: false
    });
  }

  /**
   * Delete content object metadata of specified subtree
   *
   * @see DELETE /qlibs/:qlibid/q/:write_token/meta
   *
   * @methodGroup Metadata
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {string=} metadataSubtree - Subtree of the object metadata to modify
   * - if not specified, all metadata will be deleted
   */
  async DeleteMetadata({libraryId, objectId, writeToken, metadataSubtree="/"}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(
      `Deleting metadata: ${libraryId} ${objectId} ${writeToken}
      Subtree: ${metadataSubtree}`
    );
    this.Log(`Subtree: ${metadataSubtree}`);

    let path = UrlJoin("q", writeToken, "meta", metadataSubtree);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "DELETE",
      path: path,
      failover: false
    });
  }

  /* Files */

  /**
   * List the file information about this object
   *
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be used
   */
  async ListFiles({libraryId, objectId, versionHash}) {
    ValidateParameters({libraryId, objectId, versionHash});

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
   * Create links to files, metadata and/or representations of this or or other
   * content objects.
   *
   * Expected format of links:
   *
   [
     {
        path: string (path to link)
        target: string (path to target),
        type: string ("file", "meta", "rep" - default "file")
        targetHash: string (optional, for cross-object links)
      }
   ]
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Array<Object>} links - Link specifications
   */
  async CreateLinks({
    libraryId,
    objectId,
    writeToken,
    links=[]
  }) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    for(let i = 0; i < links.length; i++) {
      const info = links[i];
      const path = info.path.replace(/^(\/|\.)+/, "");
      const type = (info.type || "file") === "file" ? "files" : info.type;

      let target = info.target.replace(/^(\/|\.)+/, "");
      if(info.targetHash) {
        target = `/qfab/${info.targetHash}/${type}/${target}`;
      } else {
        target = `./${type}/${target}`;
      }

      await this.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: path,
        metadata: {
          "/": target
        }
      });
    }
  }

  /**
   * Upload a file to a content object from a Node.js file stream
   *
   * Expected format of fileInfo:
   *
     {
        path: string,
        mime_type: string,
        size: number,
        stream: Stream
      }
   *
   *
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Array<object>} fileInfo - Info about the file to upload, including its size, type, and stream
   * @param {function=} callback - If specified, will be called after each job segment is finished with the current upload progress
   * - Format: {"filename1": {uploaded: number, total: number}, ...}
   */
  async UploadFileFromStream({libraryId, objectId, writeToken, fileInfo, callback}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(`Uploading files from stream: ${libraryId} ${objectId} ${writeToken}`);

    const concurrentUploads = 5;

    let progress = {
      [fileInfo.path]: {
        uploaded: 0,
        total: fileInfo.size
      }
    };

    fileInfo.path = fileInfo.path.replace(/^\/+/, "");
    fileInfo.type = "file";

    const stream = fileInfo.stream;
    delete fileInfo.stream;

    this.Log(fileInfo);

    if(callback) {
      callback(progress);
    }

    const {id, jobs} = await this.CreateFileUploadJob({libraryId, objectId, writeToken, ops: [fileInfo]});

    this.Log(`Upload ID: ${id}`);
    this.Log(jobs);

    let jobInfo = await LimitedMap(
      5,
      jobs,
      async jobId => await this.UploadJobStatus({
        libraryId,
        objectId,
        writeToken,
        uploadId: id,
        jobId
      })
    );

    // Ensure jobs are sorted in order of upload
    jobInfo = jobInfo.sort((a, b) => a.files[0].off < b.files[0].off ? -1 : 1);

    let currentUploads = 0;
    let currentJob = jobInfo.shift();
    let currentData = Buffer.from("");
    let currentReader = 0;
    let readerIndex = 0;
    await new Promise(async resolve => {
      stream.on("data", async chunk => {
        // Wait until all previous data has been handled
        let reader = readerIndex;
        readerIndex += 1;
        while(reader !== currentReader) {
          await new Promise(r => setTimeout(r, 250));
        }

        const neededBytes = currentJob.files[0].len - currentData.length;

        currentData = Buffer.concat([currentData, chunk.slice(0, neededBytes)]);

        if(currentData.length >= currentJob.files[0].len) {
          // Wait for ongoing uploads to complete before starting another
          while(currentUploads > concurrentUploads) {
            await new Promise(r => setTimeout(r, 250));
          }

          // Upload file data, but don't wait for it to complete
          let fileData = currentData;
          new Promise(async r => {
            currentUploads += 1;
            await this.UploadFileData({
              libraryId,
              objectId,
              writeToken,
              uploadId: id,
              jobId: currentJob.id,
              fileData
            });
            currentUploads -= 1;

            if(callback) {
              progress = {
                [fileInfo.path]: {
                  ...progress[fileInfo.path],
                  uploaded: progress[fileInfo.path].uploaded + fileData.length
                }
              };

              callback(progress);
            }

            r();
          });

          if(jobInfo.length === 0) {
            // Wait for uploads to complete and resolve promise
            while(currentUploads > 0) {
              await new Promise(r => setTimeout(r, 500));
            }
            resolve();
          } else {
            // Pull next job and grab remaining bytes
            currentJob = jobInfo.shift();
            currentData = chunk.slice(neededBytes);
          }
        }

        currentReader += 1;
      });
    });
  }

  /**
   * Copy/reference files from S3 to a content object
   *
   * Expected format of fileInfo:
   *
   [
     {
       path: string,
       source: string
     }
   ]
   *
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {string} region - AWS region to use
   * @param {string} bucket - AWS bucket to use
   * @param {Array<Object>} fileInfo - List of files to reference/copy
   * @param {string} accessKey - AWS access key
   * @param {string} secret - AWS secret
   * @param {boolean} copy=false - If true, will copy the data from S3 into the fabric. Otherwise, a reference to the content will be made.
   * @param {function=} callback - If specified, will be periodically called with current upload status
   * - Arguments (copy): { done: boolean, uploaded: number, total: number, uploadedFiles: number, totalFiles: number, fileStatus: Object }
   * - Arguments (reference): { done: boolean, uploadedFiles: number, totalFiles: number }
   */
  async UploadFilesFromS3({
    libraryId,
    objectId,
    writeToken,
    region,
    bucket,
    fileInfo,
    accessKey,
    secret,
    copy=false,
    callback
  }) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(`Uploading files from S3: ${libraryId} ${objectId} ${writeToken}`);

    const defaults = {
      access: {
        protocol: "s3",
        platform: "aws",
        path: bucket,
        storage_endpoint: {
          region
        },
        cloud_credentials: {
          access_key_id: accessKey,
          secret_access_key: secret
        }
      }
    };

    const ops = fileInfo.map(info => {
      if(copy) {
        return {
          op: "ingest-copy",
          path: info.path,
          ingest: {
            type: "key",
            path: info.source,
          }
        };
      } else {
        return {
          op: "add-reference",
          path: info.path,
          reference: {
            type: "key",
            path: info.source,
          }
        };
      }
    });

    // eslint-disable-next-line no-unused-vars
    const {id} = await this.CreateFileUploadJob({libraryId, objectId, writeToken, ops, defaults});

    // eslint-disable-next-line no-constant-condition
    while(true) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const status = await this.UploadStatus({libraryId, objectId, writeToken, uploadId: id});

      if(status.errors && status.errors.length > 1) {
        throw status.errors.join("\n");
      } else if(status.error) {
        this.Log(`S3 file upload failed:\n${JSON.stringify(status, null, 2)}`);
        throw status.error;
      } else if(status.status.toLowerCase() === "failed") {
        throw "File upload failed";
      }

      let done = false;
      if(copy) {
        done = status.ingest_copy.done;

        if(callback) {
          const progress = status.ingest_copy.progress;

          callback({
            done,
            uploaded: progress.bytes.completed,
            total: progress.bytes.total,
            uploadedFiles: progress.files.completed,
            totalFiles: progress.files.total,
            fileStatus: progress.files.details
          });
        }
      } else {
        done = status.add_reference.done;

        if(callback) {
          const progress = status.add_reference.progress;

          callback({
            done,
            uploadedFiles: progress.completed,
            totalFiles: progress.total,
          });
        }
      }

      if(done) { break; }
    }
  }

  /**
   * Upload files to a content object.
   *
   * Expected format of fileInfo:
   *
   [
     {
        path: string,
        mime_type: string,
        size: number,
        data: File | ArrayBuffer | Buffer
      }
   ]
   *
   *
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Array<object>} fileInfo - List of files to upload, including their size, type, and contents
   * @param {function=} callback - If specified, will be called after each job segment is finished with the current upload progress
   * - Format: {"filename1": {uploaded: number, total: number}, ...}
   */
  async UploadFiles({libraryId, objectId, writeToken, fileInfo, callback}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(`Uploading files: ${libraryId} ${objectId} ${writeToken}`);

    // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
    let progress = {};
    let fileDataMap = {};
    fileInfo = fileInfo.map(entry => {
      entry.path = entry.path.replace(/^\/+/, "");

      fileDataMap[entry.path] = entry.data;

      delete entry.data;
      entry.type = "file";

      progress[entry.path] = {
        uploaded: 0,
        total: entry.size
      };

      return entry;
    });

    this.Log(fileInfo);

    if(callback) {
      callback(progress);
    }

    const {id, jobs} = await this.CreateFileUploadJob({libraryId, objectId, writeToken, ops: fileInfo});

    this.Log(`Upload ID: ${id}`);
    this.Log(jobs);

    const jobInfo = await LimitedMap(
      5,
      jobs,
      async jobId => await this.UploadJobStatus({
        libraryId,
        objectId,
        writeToken,
        uploadId: id,
        jobId
      })
    );

    let concurrentUploads = 1;
    if(jobInfo.length > 1) {
      // Upload first chunk to estimate bandwidth
      const firstJob = jobInfo[0];
      const firstChunk = firstJob.files.shift();
      const fileData = fileDataMap[firstChunk.path].slice(firstChunk.off, firstChunk.off + firstChunk.len);

      const start = new Date().getTime();
      await this.UploadFileData({libraryId, objectId, writeToken, uploadId: id, jobId: firstJob.id, fileData});
      const elapsed = (new Date().getTime() - start) / 1000;
      const mbps = firstChunk.len / elapsed / 1000000;

      if(callback) {
        progress[firstChunk.path] = {
          ...progress[firstChunk.path],
          uploaded: progress[firstChunk.path].uploaded + firstChunk.len
        };

        callback(progress);
      }

      // Determine upload concurrency for rest of data based on estimated bandwidth
      concurrentUploads = Math.min(5, Math.max(1, Math.floor(mbps / 8)));

      this.Log(`Calculated speed: ${mbps} Mbps`);
      this.Log(`Proceeding with ${concurrentUploads} concurrent upload(s)`);
    }

    await LimitedMap(
      concurrentUploads,
      jobInfo,
      async job  => {
        const jobId = job.id;
        const files = job.files;

        // Upload each item
        for(let i = 0; i < files.length; i++) {
          const fileInfo = files[i];
          const fileData = fileDataMap[fileInfo.path].slice(fileInfo.off, fileInfo.off + fileInfo.len);

          await this.UploadFileData({libraryId, objectId, writeToken, uploadId: id, jobId, fileData});

          if(callback) {
            progress[fileInfo.path] = {
              ...progress[fileInfo.path],
              uploaded: progress[fileInfo.path].uploaded + fileInfo.len
            };

            callback(progress);
          }
        }
      }
    );
  }

  async CreateFileUploadJob({libraryId, objectId, writeToken, ops, defaults={}}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(`Creating file upload job: ${libraryId} ${objectId} ${writeToken}`);
    this.Log(ops);

    let path = UrlJoin("q", writeToken, "file_jobs");

    const body = {
      seq: 0,
      seq_complete: true,
      defaults,
      ops
    };

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
        path: path,
        body,
        failover: false
      })
    );
  }

  async UploadStatus({libraryId, objectId, writeToken, uploadId}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    let path = UrlJoin("q", writeToken, "file_jobs", uploadId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "GET",
        path: path,
        failover: false
      })
    );
  }

  async UploadJobStatus({libraryId, objectId, writeToken, uploadId, jobId}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    let path = UrlJoin("q", writeToken, "file_jobs", uploadId, "uploads", jobId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "GET",
        path: path,
        failover: false
      })
    );
  }

  async UploadFileData({libraryId, objectId, writeToken, uploadId, jobId, fileData}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    const path = UrlJoin("q", writeToken, "file_jobs", uploadId, jobId);

    await ResponseToJson(
      this.HttpClient.Request({
        method: "POST",
        path: path,
        body: fileData,
        bodyType: "BINARY",
        headers: {
          "Content-type": "application/octet-stream",
          ...(await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}))
        },
        failover: false
      })
    );
  }

  async FinalizeUploadJob({libraryId, objectId, writeToken}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(`Finalizing upload job: ${libraryId} ${objectId} ${writeToken}`);

    const path = UrlJoin("q", writeToken, "files");

    await this.HttpClient.Request({
      method: "POST",
      path: path,
      bodyType: "BINARY",
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      failover: false
    });
  }

  /**
   * Delete the specified list of files/directories
   *
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Array<string>} filePaths - List of file paths to delete
   */
  async DeleteFiles({libraryId, objectId, writeToken, filePaths}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    this.Log(`Deleting Files: ${libraryId} ${objectId} ${writeToken}`);
    this.Log(filePaths);

    const ops = filePaths.map(path => ({op: "del", path}));

    await this.CreateFileUploadJob({libraryId, objectId, writeToken, ops});
  }

  /**
   * Download a file from a content object
   *
   * @see GET /qlibs/:qlibid/q/:qhit/files/:filePath
   *
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} filePath - Path to the file to download
   * @param {string=} format="blob" - Format in which to return the data ("blob" | "arraybuffer")
   *
   * @returns {Promise<ArrayBuffer>} - File data in the requested format
   */
  async DownloadFile({libraryId, objectId, versionHash, filePath, format="arrayBuffer"}) {
    ValidateParameters({libraryId, objectId, versionHash});

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
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   *
   * @returns {Promise<Object>} - Response containing list of parts of the object
   */
  async ContentParts({libraryId, objectId, versionHash}) {
    ValidateParameters({libraryId, objectId, versionHash});

    this.Log(`Retrieving parts: ${libraryId} ${objectId || versionHash}`);

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
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} partHash - Hash of the part to retrieve
   *
   * @returns {Promise<Object>} - Response containing information about the specified part
   */
  async ContentPart({libraryId, objectId, versionHash, partHash}) {
    ValidateParameters({libraryId, objectId, versionHash});
    ValidatePartHash(partHash);

    this.Log(`Retrieving part: ${libraryId} ${objectId || versionHash} ${partHash}`);

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
   * @methodGroup Parts and Files
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
   * @returns {Promise<ArrayBuffer>} - Part data in the specified format
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
    ValidateParameters({libraryId, objectId, versionHash});
    ValidatePartHash(partHash);

    if(chunked && !callback) { throw Error("No callback specified for chunked part download"); }

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    const encrypted = partHash.startsWith("hqpe");
    const encryption = encrypted ? "cgck" : undefined;
    const path = UrlJoin("q", versionHash || objectId, "data", partHash);

    let headers = await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, encryption});

    let conk;
    if(encrypted) {
      conk = await this.EncryptionConk({libraryId, objectId});
    }

    if(!chunked) {
      // Download and decrypt entire part
      const response = await this.HttpClient.Request({headers, method: "GET", path: path});

      let data = await response.arrayBuffer();
      if(encrypted) {
        data = await Crypto.Decrypt(conk, data);
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
      stream = await Crypto.OpenDecryptionStream(conk);

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

  /**
   * Retrieve the encryption conk for the specified object. If one has not yet been created
   * and a writeToken has been specified, this method will create a new conk and
   * save it to the draft metadata
   *
   * @methodGroup Encryption
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} writeToken - Write token of the content object draft
   *
   * @return Promise<Object> - The encryption conk for the object
   */
  async EncryptionConk({libraryId, objectId, writeToken}) {
    ValidateParameters({libraryId, objectId});
    if(writeToken) { ValidateWriteToken(writeToken); }

    const owner = await this.authClient.Owner({id: objectId, abi: ContentContract.abi});

    if(!this.utils.EqualAddress(owner, this.signer.address)) {
      // Target decryption
      if(!this.reencryptionConks[objectId]) {
        this.reencryptionConks[objectId] = await this.authClient.ReEncryptionConk({libraryId, objectId});
      }

      return this.reencryptionConks[objectId];
    }

    // Primary encryption
    if(!this.encryptionConks[objectId]) {
      const capKey = `eluv.caps.iusr${this.utils.AddressToHash(this.signer.address)}`;

      const existingUserCap =
        await this.ContentObjectMetadata({
          libraryId,
          // Cap may only exist in draft
          objectId,
          writeToken,
          metadataSubtree: capKey
        });

      if(existingUserCap) {
        this.encryptionConks[objectId] = await Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey);
      } else {
        this.encryptionConks[objectId] = await Crypto.GeneratePrimaryConk();

        // If write token is specified, add it to the metadata
        if(writeToken) {
          let metadata = {};
          metadata[capKey] = await Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey);

          try {
            const kmsAddress = await this.authClient.KMSAddress({objectId});
            const kmsPublicKey = (await this.authClient.KMSInfo({objectId})).publicKey;
            const kmsCapKey = `eluv.caps.ikms${this.utils.AddressToHash(kmsAddress)}`;
            const existingKMSCap =
              await this.ContentObjectMetadata({
                libraryId,
                // Cap may only exist in draft
                objectId,
                writeToken,
                metadataSubtree: kmsCapKey
              });

            if(!existingKMSCap) {
              metadata[kmsCapKey] = await Crypto.EncryptConk(this.encryptionConks[objectId], kmsPublicKey);
            }
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error("Failed to create encryption cap for KMS with public key " + kmsPublicKey);
          }

          await this.MergeMetadata({
            libraryId,
            objectId,
            writeToken,
            metadata
          });
        }
      }
    }

    return this.encryptionConks[objectId];
  }

  /**
   * Encrypt the specified chunk for the specified object or draft
   *
   * @methodGroup Encryption
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {Promise<(ArrayBuffer | Buffer)>} chunk - The data to encrypt
   *
   * @return {Promise<ArrayBuffer>}
   */
  async Encrypt({libraryId, objectId, writeToken, chunk}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    const conk = await this.EncryptionConk({libraryId, objectId, writeToken});
    const data = await Crypto.Encrypt(conk, chunk);

    // Convert to ArrayBuffer
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }

  /**
   * Create a part upload draft
   *
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
   *
   * @returns {Promise<string>} - The part write token for the part draft
   */
  async CreatePart({libraryId, objectId, writeToken, encryption}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    const path = UrlJoin("q", writeToken, "parts");

    const openResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
        method: "POST",
        path,
        bodyType: "BINARY",
        body: "",
        failover: false
      })
    );

    return openResponse.part.write_token;
  }

  /**
   * Upload data to an open part draft
   *
   * @methodGroup Parts and Files
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
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    if(encryption && encryption !== "none") {
      const conk = await this.EncryptionConk({libraryId, objectId, writeToken});
      chunk = await Crypto.Encrypt(conk, chunk);
    }

    const path = UrlJoin("q", writeToken, "parts");
    await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
        method: "POST",
        path: UrlJoin(path, partWriteToken),
        body: chunk,
        bodyType: "BINARY",
        failover: false
      })
    );
  }

  /**
   * Finalize an open part draft
   *
   * @methodGroup Parts and Files
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
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    const path = UrlJoin("q", writeToken, "parts");
    return await ResponseToJson(
      await this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
        method: "POST",
        path: UrlJoin(path, partWriteToken),
        bodyType: "BINARY",
        body: "",
        failover: false
      })
    );
  }

  /**
   * Upload part to an object draft
   *
   * Note: If uploading a large file (especially with an HTML file and/or when using the FrameClient) it is
   * recommended to use the CreatePart + UploadPartChunk + FinalizePart flow to upload the file in
   * smaller chunks.
   *
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {(File | ArrayBuffer | Buffer)} data - Data to upload
   * @param {number=} chunkSize=1000000 (1MB) - Chunk size, in bytes
   * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
   *
   * @returns {Promise<Object>} - Response containing information about the uploaded part
   */
  async UploadPart({libraryId, objectId, writeToken, data, encryption="none"}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);

    const partWriteToken = await this.CreatePart({libraryId, objectId, writeToken, encryption});

    await this.UploadPartChunk({libraryId, objectId, writeToken, partWriteToken, chunk: data, encryption});

    return await this.FinalizePart({libraryId, objectId, writeToken, partWriteToken, encryption});
  }

  /**
   * Delete the specified part from a content draft
   *
   * @see DELETE /qlibs/:qlibid/q/:write_token/parts/:qparthash
   *
   * @methodGroup Parts and Files
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {string} partHash - Hash of the part to delete
   */
  async DeletePart({libraryId, objectId, writeToken, partHash}) {
    ValidateParameters({libraryId, objectId});
    ValidateWriteToken(writeToken);
    ValidatePartHash(partHash);

    let path = UrlJoin("q", writeToken, "parts", partHash);

    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "DELETE",
      path: path,
      failover: false
    });
  }

  /* Media Creation and Management */

  /**
   * Create a master media content object with the given files.
   *
   * - If uploading using local files, use fileInfo parameter (see UploadFiles for format)
   * - If uploading from S3 bucket, use access, filePath and copy, parameters (see UploadFilesFromS3 method)
   *
   * @methodGroup Media
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} name - Name of the content
   * @param {string=} description - Description of the content
   * @param {string} contentTypeName - Name of the content type to use
   * @param {Object=} metadata - Additional metadata for the content object
   * @param {Object=} fileInfo - Files to upload to (See UploadFiles/UploadFilesFromS3 method)
   * @param {Object=} fileInfo - Files to upload via node.js stream (See UploadFileFromStream method)
   * @param {boolean=} copy=false - (S3) If specified, files will be copied from S3
   * @param {function=} callback - Progress callback for file upload (See UploadFiles/UploadFilesFromS3 method)
   * @param {Object=} access - (S3) Region, bucket, access key and secret for S3
   * - Format: {region, bucket, accessKey, secret}
   *
   * @throws {Object} error - If the initialization of the master fails, error details can be found in error.body
   * @return {Object} - The finalize response for the object, as well as logs, warnings and errors from the master initialization
   */
  async CreateProductionMaster({
    libraryId,
    name,
    description,
    metadata={},
    fileInfo,
    streamInfo,
    access,
    copy=false,
    callback
  }) {
    ValidateLibrary(libraryId);

    const contentType = await this.ContentType({name: "Production Master"});

    if(!contentType) {
      throw "Unable to access content type 'Production Master' to create production master";
    }

    const {id, write_token} = await this.CreateContentObject({
      libraryId,
      options: {
        type: contentType.hash
      }
    });

    let accessParameter;
    if(fileInfo) {
      if(access) {
        // S3 Upload
        const {region, bucket, accessKey, secret} = access;

        await this.UploadFilesFromS3({
          libraryId,
          objectId: id,
          writeToken: write_token,
          fileInfo,
          region,
          bucket,
          accessKey,
          secret,
          copy,
          callback
        });

        accessParameter = [
          {
            path_matchers: [".*"],
            remote_access: {
              protocol: "s3",
              platform: "aws",
              path: bucket + "/",
              storage_endpoint: {
                region
              },
              cloud_credentials: {
                access_key_id: accessKey,
                secret_access_key: secret
              }
            }
          }
        ];
      } else {
        await this.UploadFiles({
          libraryId,
          objectId: id,
          writeToken: write_token,
          fileInfo,
          callback
        });
      }
    }

    if(streamInfo) {
      for(let i = 0; i < streamInfo.length; i++) {
        await this.UploadFileFromStream({
          libraryId,
          objectId: id,
          writeToken: write_token,
          fileInfo: streamInfo[i],
          callback
        });
      }
    }

    const { logs, errors, warnings } = await this.CallBitcodeMethod({
      libraryId,
      objectId: id,
      writeToken: write_token,
      method: UrlJoin("media", "production_master", "init"),
      body: {
        access: accessParameter
      },
      constant: false
    });

    await this.MergeMetadata({
      libraryId,
      objectId: id,
      writeToken: write_token,
      metadata: {
        name,
        description,
        reference: access && !copy,
        public: {
          name: name || "",
          description: description || ""
        },
        elv_created_at: new Date().getTime(),
        ...(metadata || {})
      }
    });

    const finalizeResponse = await this.FinalizeContentObject({
      libraryId,
      objectId: id,
      writeToken: write_token,
      awaitCommitConfirmation: false
    });

    return {
      errors: errors || [],
      logs: logs || [],
      warnings: warnings || [],
      ...finalizeResponse
    };
  }

  /**
   * Create a mezzanine of the given master content object
   *
   * @methodGroup Media
   * @namedParams
   * @param {string} libraryId - ID of the mezzanine library
   * @param {string} name - Name for mezzanine content object
   * @param {string=} description - Description for mezzanine content object
   * @param {Object=} metadata - Additional metadata for mezzanine content object
   * @param {string} masterVersionHash - The version hash of the production master content object
   * @param {string=} variant=default - What variant of the master content object to use
   * @param {string=} offeringKey=default - The key of the offering to create
   * @param {Object=} abrProfile - Custom ABR profile. If not specified, the profile of the mezzanine library will be used
   *
   * @return {Object} - The finalize response for the object, as well as logs, warnings and errors from the mezzanine initialization
   */
  async CreateABRMezzanine({libraryId, name, description, metadata={}, masterVersionHash, abrProfile, variant="default", offeringKey="default"}) {
    ValidateLibrary(libraryId);
    ValidateVersion(masterVersionHash);

    const abrMezType = await this.ContentType({name: "ABR Master"});

    if(!abrMezType) {
      throw Error("Unable to access ABR Master content type in library with ID=" + libraryId);
    }

    if(!masterVersionHash) {
      throw Error("Master version hash not specified");
    }

    const {id, write_token} = await this.CreateContentObject({
      libraryId,
      options: {
        type: abrMezType.hash
      }
    });

    const masterName = await this.ContentObjectMetadata({
      versionHash: masterVersionHash,
      metadataSubtree: "public/name"
    });

    // Include authorization for library, master, and mezzanine
    let authorizationTokens = [];
    authorizationTokens.push(await this.authClient.AuthorizationToken({libraryId, objectId: id, update: true}));
    authorizationTokens.push(await this.authClient.AuthorizationToken({libraryId}));
    authorizationTokens.push(await this.authClient.AuthorizationToken({versionHash: masterVersionHash}));

    const headers = {
      Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")
    };

    const body = {
      offering_key: offeringKey,
      variant_key: variant,
      prod_master_hash: masterVersionHash
    };

    let storeClear = false;
    if(abrProfile) {
      body.abr_profile = abrProfile;
      storeClear = abrProfile.store_clear;
    } else {
      // Retrieve ABR profile from library to check store clear
      storeClear = await this.ContentObjectMetadata({
        libraryId,
        objectId: this.utils.AddressToObjectId(this.utils.HashToAddress(libraryId)),
        metadataSubtree: "store_clear"
      });
    }

    if(!storeClear) {
      // If files are encrypted, generate encryption conks
      await this.EncryptionConk({
        libraryId,
        objectId: id,
        writeToken: write_token
      });
    }

    const {logs, errors, warnings} = await this.CallBitcodeMethod({
      libraryId,
      objectId: id,
      writeToken: write_token,
      method: UrlJoin("media", "abr_mezzanine", "init"),
      headers,
      body,
      constant: false
    });

    await this.MergeMetadata({
      libraryId,
      objectId: id,
      writeToken: write_token,
      metadata: {
        master: {
          name: masterName,
          id: this.utils.DecodeVersionHash(masterVersionHash).objectId,
          hash: masterVersionHash,
          variant
        },
        name: name || `${masterName} Mezzanine`,
        description,
        public: {
          name: name || `${masterName} Mezzanine`,
          description: description || ""
        },
        elv_created_at: new Date().getTime(),
        ...(metadata || {})
      }
    });

    const finalizeResponse = await this.FinalizeContentObject({
      libraryId,
      objectId: id,
      writeToken: write_token
    });

    return {
      logs: logs || [],
      warnings: warnings || [],
      errors: errors || [],
      ...finalizeResponse
    };
  }

  /**
   * Start any incomplete jobs on the specified mezzanine
   *
   * @methodGroup Media
   * @namedParams
   * @param {string} libraryId - ID of the mezzanine library
   * @param {string} objectId - ID of the mezzanine object
   * @param {string=} offeringKey=default - The offering to process
   * @param {Object=} access - (S3) Region, bucket, access key and secret for S3 - Required if any files in the masters are S3 references
   * - Format: {region, bucket, accessKey, secret}
   *
   * @return {Promise<Object>} - A write token for the mezzanine object, as well as any logs, warnings and errors from the job initialization
   */
  async StartABRMezzanineJobs({libraryId, objectId, offeringKey="default", access={}}) {
    ValidateParameters({libraryId, objectId});

    const mezzanineMetadata = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
    });

    const prepSpecs = mezzanineMetadata[offeringKey].mez_prep_specs || [];

    // Retrieve all masters associated with this offering
    let masterVersionHashes = Object.keys(prepSpecs).map(spec =>
      (prepSpecs[spec].source_streams || []).map(stream => stream.source_hash)
    );

    // Flatten and filter
    masterVersionHashes = [].concat.apply([], masterVersionHashes)
      .filter(hash => hash)
      .filter((v, i, a) => a.indexOf(v) === i);

    // Retrieve authorization tokens for all masters and the mezzanine

    let authorizationTokens = await Promise.all(
      masterVersionHashes.map(async versionHash => await this.authClient.AuthorizationToken({versionHash}))
    );

    authorizationTokens = [
      await this.authClient.AuthorizationToken({libraryId, objectId, update: true}),
      ...authorizationTokens
    ];

    const headers = {
      Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")
    };

    let accessParameter;
    if(access && Object.keys(access).length > 0) {
      const {region, bucket, accessKey, secret} = access;
      accessParameter = [
        {
          path_matchers: [".*"],
          remote_access: {
            protocol: "s3",
            platform: "aws",
            path: bucket + "/",
            storage_endpoint: {
              region
            },
            cloud_credentials: {
              access_key_id: accessKey,
              secret_access_key: secret
            }
          }
        }
      ];
    }

    const processingDraft = await this.EditContentObject({libraryId, objectId});

    const lroInfo = {
      write_token: processingDraft.write_token,
      node: this.HttpClient.BaseURI().toString(),
      offering: offeringKey
    };

    // Update metadata with LRO version write token
    const statusDraft = await this.EditContentObject({libraryId, objectId});
    await this.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: statusDraft.write_token,
      metadataSubtree: `lro_draft_${offeringKey}`,
      metadata: lroInfo
    });
    await this.FinalizeContentObject({libraryId, objectId, writeToken: statusDraft.write_token});

    const {data, errors, warnings, logs} = await this.CallBitcodeMethod({
      libraryId,
      objectId,
      writeToken: processingDraft.write_token,
      headers,
      method: UrlJoin("media", "abr_mezzanine", "prep_start"),
      constant: false,
      body: {
        access: accessParameter,
        offering_key: offeringKey
      }
    });

    return {
      lro_draft: lroInfo,
      writeToken: processingDraft.write_token,
      data,
      logs: logs || [],
      warnings: warnings || [],
      errors: errors || []
    };
  }

  /**
   * Retrieve status information for a long running operation (LRO) on the given object.
   *
   * @methodGroup Media
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} offeringKey=default - Offering key of the mezzanine
   *
   * @return {Promise<Object>} - LRO status
   */
  async LROStatus({libraryId, objectId, offeringKey="default"}) {
    ValidateParameters({libraryId, objectId});

    const lroDraft =
      await this.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: `lro_draft_${offeringKey}`
      }) ||
      await this.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "lro_draft"
      });

    if(!lroDraft || !lroDraft.write_token) {
      // Write token not present - check if mezz has already been finalized
      const ready = await this.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: UrlJoin("abr_mezzanine", "offerings", offeringKey, "ready")
      });

      if(ready) {
        throw Error(`Mezzanine already finalized for offering '${offeringKey}'`);
      } else {
        throw Error("No LRO draft found for this mezzanine");
      }
    }

    const httpClient = this.HttpClient;
    let error, result;
    try {
      // Point directly to the node containing the draft
      this.HttpClient = new HttpClient({uris: [lroDraft.node], debug: httpClient.debug});

      result = await this.ContentObjectMetadata({
        libraryId,
        objectId,
        writeToken: lroDraft.write_token,
        metadataSubtree: "lro_status"
      });
    } catch(err) {
      error = err;
    } finally {
      this.HttpClient = httpClient;
    }

    if(error) { throw error; }

    return result;
  }

  /**
   * Finalize a mezzanine object after all jobs have finished
   *
   * @methodGroup Media
   * @namedParams
   * @param {string} libraryId - ID of the mezzanine library
   * @param {string} objectId - ID of the mezzanine object
   * @param {string} writeToken - Write token for the mezzanine object
   * @param {string=} offeringKey=default - The offering to process
   *
   * @return {Promise<Object>} - The finalize response for the mezzanine object, as well as any logs, warnings and errors from the finalization
   */
  async FinalizeABRMezzanine({libraryId, objectId, offeringKey="default"}) {
    ValidateParameters({libraryId, objectId});

    const lroDraft = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: `lro_draft_${offeringKey}`
    });

    if(!lroDraft || !lroDraft.write_token) {
      throw Error("No LRO draft found for this mezzanine");
    }

    const httpClient = this.HttpClient;
    let error, result;
    try {
      // Point directly to the node containing the draft
      this.HttpClient = new HttpClient({uris: [lroDraft.node], debug: httpClient.debug});

      const mezzanineMetadata = await this.ContentObjectMetadata({
        libraryId,
        objectId,
        writeToken: lroDraft.write_token,
        metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
      });

      const masterHash = mezzanineMetadata.default.prod_master_hash;

      // Authorization token for mezzanine and master
      let authorizationTokens = [
        await this.authClient.AuthorizationToken({libraryId, objectId, update: true}),
        await this.authClient.AuthorizationToken({versionHash: masterHash})
      ];

      const headers = {
        Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")
      };

      const {data, errors, warnings, logs} = await this.CallBitcodeMethod({
        objectId,
        libraryId,
        writeToken: lroDraft.write_token,
        method: UrlJoin("media", "abr_mezzanine", "offerings", offeringKey, "finalize"),
        headers,
        constant: false
      });

      const finalizeResponse = await this.FinalizeContentObject({
        libraryId,
        objectId: objectId,
        writeToken: lroDraft.write_token,
        awaitCommitConfirmation: false
      });

      result = {
        data,
        logs: logs || [],
        warnings: warnings || [],
        errors: errors || [],
        ...finalizeResponse
      };
    } catch(err) {
      error = err;
    } finally {
      // Ensure original http client is restored
      this.HttpClient = httpClient;
    }

    if(error) { throw error; }

    return result;
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
    ValidateObject(objectId);

    this.Log(`Setting access charge: ${objectId} ${accessCharge}`);

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
   * @return {Promise<string>} - Contract type of the item - "space", "library", "type", "object", "wallet", "group", or "other"
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
    ValidateObject(objectId);

    if(!args) {
      args = [
        0, // Access level
        [], // Custom values
        [] // Stakeholders
      ];
    }

    this.Log(`Retrieving access info: ${objectId}`);

    const info = await this.ethClient.CallContractMethod({
      contractAddress: Utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "getAccessInfo",
      methodArgs: args,
      signer: this.signer
    });

    this.Log(info);

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
    ValidateParameters({libraryId, objectId, versionHash});

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
    ValidateParameters({libraryId, objectId, versionHash});

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
   * Generate a state channel token
   *
   * @methodGroup Access Requests
   * @namedParams
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object
   * @param {boolean=} noCache=false - If specified, a new state channel token will be generated
   * regardless whether or not one has been previously cached
   *
   * @return {Promise<string>} - The state channel token
   */
  async GenerateStateChannelToken({objectId, versionHash, noCache=false}) {
    versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

    if(versionHash) {
      objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    } else if(!this.stateChannelAccess[objectId]) {
      const libraryId = await this.ContentObjectLibraryId({objectId});
      versionHash = (await this.ContentObjectVersions({libraryId, objectId, noAuth: true})).versions[0].hash;
    }

    this.stateChannelAccess[objectId] = versionHash;

    const audienceData = this.AudienceData({objectId, versionHash});

    return await this.authClient.AuthorizationToken({
      objectId,
      channelAuth: true,
      audienceData,
      noCache
    });
  }

  /**
   * Finalize state channel access
   *
   * @methodGroup Access Requests
   * @namedParams
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object
   * @param {number} percentComplete - Completion percentage of the content
   */
  async FinalizeStateChannelAccess({objectId, versionHash, percentComplete}) {
    versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

    if(versionHash) {
      objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    } else {
      if(this.stateChannelAccess[objectId]) {
        versionHash = this.stateChannelAccess[objectId];
      } else {
        const libraryId = await this.ContentObjectLibraryId({objectId});
        versionHash = (await this.ContentObjectVersions({libraryId, objectId, noAuth: true})).versions[0].hash;
      }
    }

    this.stateChannelAccess[objectId] = undefined;

    const audienceData = this.AudienceData({objectId, versionHash});

    await this.authClient.ChannelContentFinalize({
      objectId,
      audienceData,
      percent: percentComplete
    });
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
    ValidateObject(objectId);

    if(score < 0 || score > 100) { throw Error("Invalid AccessComplete score: " + score); }

    return await this.authClient.AccessComplete({id: objectId, abi: ContentContract.abi, score});
  }

  /* URL Methods */

  /**
   * Determine available DRM types available in this browser environment.
   *
   * @methodGroup Media
   * @return {Promise<Array<string>>}
   */
  async AvailableDRMs() {
    const availableDRMs = ["aes-128"];

    if(!window) {
      return availableDRMs;
    }

    if(typeof window.navigator.requestMediaKeySystemAccess !== "function") {
      return availableDRMs;
    }

    try {
      const config = [{
        initDataTypes: ["cenc"],
        audioCapabilities: [{
          contentType: "audio/mp4;codecs=\"mp4a.40.2\""
        }],
        videoCapabilities: [{
          contentType: "video/mp4;codecs=\"avc1.42E01E\""
        }]
      }];

      await navigator.requestMediaKeySystemAccess("com.widevine.alpha", config);

      availableDRMs.push("widevine");
    // eslint-disable-next-line no-empty
    } catch(e) {}

    return availableDRMs;
  }

  AudienceData({objectId, versionHash, protocols=[], drms=[]}) {
    versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

    this.Log(`Retrieving audience data: ${objectId}`);

    let data = {
      user_address: this.utils.FormatAddress(this.signer.address),
      content_id: objectId || this.utils.DecodeVersionHash(versionHash).id,
      content_hash: versionHash,
      hostname: this.HttpClient.BaseURI().hostname(),
      access_time: Math.round(new Date().getTime()).toString(),
      format: protocols.join(","),
      drm: drms.join(",")
    };

    if(typeof window !== "undefined" && window.navigator) {
      data.user_string = window.navigator.userAgent;
      data.language = window.navigator.language;
    }

    this.Log(data);

    return data;
  }

  /**
   * Retrieve playout options for the specified content that satisfy the given protocol and DRM requirements
   *
   * The root level playoutOptions[protocol].playoutUrl and playoutOptions[protocol].drms will contain playout
   * information that satisfies the specified DRM requirements (if possible), while playoutOptions[protocol].playoutMethods
   * will contain all available playout options for this content.
   *
   * If only objectId is specified, latest version will be played. To retrieve playout options for
   * a specific version of the content, provide the versionHash parameter (in which case objectId is unnecessary)
   *
   * @methodGroup Media
   * @namedParams
   * @param {string=} objectId - Id of the content
   * @param {string=} versionHash - Version hash of the content
   * @param {string=} linkPath - If playing from a link, the path to the link
   * @param {Array<string>} protocols - Acceptable playout protocols
   * @param {Array<string>} drms - Acceptable DRM formats
   * @param {string=} offering=default - The offering to play
   */
  async PlayoutOptions({
    objectId,
    versionHash,
    linkPath,
    protocols=["dash", "hls"],
    offering="default",
    drms=[],
    hlsjsProfile=true
  }) {
    versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

    protocols = protocols.map(p => p.toLowerCase());
    drms = drms.map(d => d.toLowerCase());

    if(!objectId) {
      objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    }

    const libraryId = await this.ContentObjectLibraryId({objectId});
    if(!versionHash) {
      versionHash = (await this.ContentObjectVersions({libraryId, objectId, noAuth: true})).versions[0].hash;
    }

    let path, linkTargetLibraryId, linkTargetId, linkTargetHash;
    if(linkPath) {
      const linkInfo = await this.ContentObjectMetadata({
        objectId,
        versionHash,
        metadataSubtree: linkPath
      });

      if(!linkInfo || !linkInfo["/"]) {
        throw Error(`Invalid link path: ${linkPath}`);
      }

      linkTargetHash = linkInfo["."] ? linkInfo["."].container : linkInfo.container;

      if(!linkTargetHash) {
        throw Error(`Link missing container attribute: ${linkPath}`);
      }

      linkTargetId = this.utils.DecodeVersionHash(linkInfo.container).objectId;
      linkTargetLibraryId = await this.ContentObjectLibraryId({objectId: linkTargetId});
      path = UrlJoin("q", versionHash, "meta", linkPath);
    } else {
      path = UrlJoin("q", versionHash, "rep", "playout", offering, "options.json");
    }

    const audienceData = this.AudienceData({
      objectId: linkTargetId || objectId,
      versionHash: linkTargetHash || versionHash,
      protocols,
      drms
    });

    const playoutOptions = Object.values(
      await ResponseToJson(
        this.HttpClient.Request({
          headers: await this.authClient.AuthorizationHeader({
            objectId,
            channelAuth: true,
            audienceData
          }),
          queryParams: linkPath ? { resolve: true } : {},
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

      // Create full playout URLs for this protocol / drm combo
      playoutMap[protocol] = {
        ...(playoutMap[protocol] || {}),
        playoutMethods: {
          ...((playoutMap[protocol] || {}).playoutMethods || {}),
          [drm || "clear"]: {
            playoutUrl: await this.Rep({
              libraryId: linkTargetLibraryId || libraryId,
              objectId: linkTargetId || objectId,
              versionHash: linkTargetHash || versionHash,
              rep: UrlJoin("playout", offering, option.uri),
              channelAuth: true,
              queryParams: hlsjsProfile && protocol === "hls" ? {player_profile: "hls-js"} : {}
            }),
            drms: drm ? {[drm]: {licenseServers}} : undefined
          }
        }
      };

      // Exclude any options that do not satisfy the specified protocols and/or DRMs
      const protocolMatch = protocols.includes(protocol);
      const drmMatch = drms.includes(drm) || (drms.length === 0 && !drm);
      if(!protocolMatch || !drmMatch) {
        continue;
      }

      // This protocol / DRM satisfies the specifications
      playoutMap[protocol].playoutUrl = playoutMap[protocol].playoutMethods[drm || "clear"].playoutUrl;
      playoutMap[protocol].drms = playoutMap[protocol].playoutMethods[drm || "clear"].drms;
    }

    this.Log(playoutMap);

    return playoutMap;
  }

  /**
   * Retrieve playout options in BitMovin player format for the specified content that satisfy
   * the given protocol and DRM requirements
   *
   * If only objectId is specified, latest version will be played. To retrieve playout options for
   * a specific version of the content, provide the versionHash parameter (in which case objectId is unnecessary)
   *
   * @methodGroup Media
   * @namedParams
   * @param {string=} objectId - Id of the content
   * @param {string} versionHash - Version hash of the content
   * @param {string=} linkPath - If playing from a link, the path to the link
   * @param {Array<string>=} protocols=["dash", "hls"] - Acceptable playout protocols
   * @param {Array<string>=} drms=[] - Acceptable DRM formats
   * @param {string=} offering=default - The offering to play
   */
  async BitmovinPlayoutOptions({
    objectId,
    versionHash,
    linkPath,
    protocols=["dash", "hls"],
    drms=[],
    offering="default"
  }) {
    versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

    if(!objectId) {
      objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    }

    const playoutOptions = await this.PlayoutOptions({
      objectId,
      versionHash,
      linkPath,
      protocols,
      drms,
      offering,
      hlsjsProfile: false
    });

    delete playoutOptions.playoutMethods;

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
   * Call the specified bitcode method on the specified object
   *
   * @methodGroup URL Generation
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string=} writeToken - Write token of an object draft - if calling bitcode of a draft object
   * @param {string} method - Bitcode method to call
   * @param {Object=} queryParams - Query parameters to include in the request
   * @param {Object=} body - Request body to include, if calling a non-constant method
   * @param {Object=} headers - Request headers to include
   * @param {boolean=} constant=true - If specified, a GET request authenticated with an AccessRequest will be made.
   * Otherwise, a POST with an UpdateRequest will be performed
   * @param {string=} format=json - The format of the response
   *
   * @returns {Promise<format>} - The response from the call in the specified format
   */
  async CallBitcodeMethod({
    libraryId,
    objectId,
    versionHash,
    writeToken,
    method,
    queryParams={},
    body={},
    headers={},
    constant=true,
    format="json"
  }) {
    ValidateParameters({libraryId, objectId, versionHash});
    if(!method) { throw "Bitcode method not specified"; }

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    let path = UrlJoin("q", writeToken || versionHash || objectId, "call", method);

    if(libraryId) {
      path = UrlJoin("qlibs", libraryId, path);
    }

    let authHeader = headers.authorization || headers.Authorization;
    if(!authHeader) {
      headers.Authorization = (
        await this.authClient.AuthorizationHeader({
          libraryId,
          objectId,
          update: !constant
        })
      ).Authorization;
    }

    this.Log(
      `Calling bitcode method: ${libraryId || ""} ${objectId || versionHash} ${writeToken || ""}
      ${constant ? "GET" : "POST"} ${path}
      Query Params:
      ${queryParams}
      Body:
      ${body}
      Headers
      ${headers}`
    );

    return ResponseToFormat(
      format,
      await this.HttpClient.Request({
        body,
        headers,
        method: constant ? "GET" : "POST",
        path,
        queryParams,
        failover: false
      })
    );
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
   * @param {boolean=} channelAuth=false - If specified, state channel authorization will be performed instead of access request authorization
   * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
   * token. This is useful for accessing public assets.
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached. This option has no effect if noAuth is true.
   *
   * @see FabricUrl for creating arbitrary fabric URLs
   *
   * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
   */
  async Rep({libraryId, objectId, versionHash, rep, queryParams={}, channelAuth=false, noAuth=false, noCache=false}) {
    ValidateParameters({libraryId, objectId, versionHash});
    if(!rep) { throw "Rep not specified"; }

    return this.FabricUrl({libraryId, objectId, versionHash, rep, queryParams, channelAuth, noAuth, noCache});
  }

  /**
   * Generate a URL to the specified /public endpoint of a content object. URL includes authorization token.
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
   * @see FabricUrl for creating arbitrary fabric URLs
   *
   * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
   */
  async PublicRep({libraryId, objectId, versionHash, rep, queryParams={}}) {
    ValidateParameters({libraryId, objectId, versionHash});
    if(!rep) { throw "Rep not specified"; }

    return this.FabricUrl({libraryId, objectId, versionHash, publicRep: rep, queryParams, noAuth: true});
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
   * @param {string=} publicRep - Public rep parameter of the url
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
    publicRep,
    call,
    queryParams={},
    channelAuth=false,
    noAuth=false,
    noCache=false
  }) {
    if(objectId || versionHash) {
      ValidateParameters({libraryId, objectId, versionHash});
    }

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    this.Log(
      `Building Fabric URL:
      libraryId: ${libraryId}
      objectId: ${objectId}
      versionHash: ${versionHash}
      partHash: ${partHash}
      rep: ${rep}
      publicRep: ${publicRep}
      call: ${call}
      channelAuth: ${channelAuth}
      noAuth: ${noAuth}
      noCache: ${noCache}
      queryParams: ${JSON.stringify(queryParams || {}, null, 2)}`
    );

    // Clone queryParams to avoid modification of the original
    queryParams = {...queryParams};

    queryParams.authorization = await this.authClient.AuthorizationToken({libraryId, objectId, versionHash, channelAuth, noAuth, noCache});

    let path = "";
    if(libraryId) {
      path = UrlJoin(path, "qlibs", libraryId);

      if(objectId || versionHash) {
        path = UrlJoin(path, "q", versionHash || objectId);
      }
    } else if(versionHash) {
      path = UrlJoin("q", versionHash);
    }

    if(partHash){
      path = UrlJoin(path, "data", partHash);
    } else if(rep) {
      path = UrlJoin(path, "rep", rep);
    } else if(publicRep) {
      path = UrlJoin(path, "public", publicRep);
    } else if(call) {
      path = UrlJoin(path, "call", call);
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
   * @param {string=} libraryId - ID of an library
   * @param {string=} objectId - ID of an object
   * @param {string=} versionHash - Hash of an object version
   * @param {string} filePath - Path to the content object file
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached.
   *
   * @returns {Promise<string>} - URL to the specified file with authorization token
   */
  async FileUrl({libraryId, objectId, versionHash, filePath, queryParams={}, noCache=false}) {
    ValidateParameters({libraryId, objectId, versionHash});
    if(!filePath) { throw "File path not specified"; }

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

  /**
   * Retrieve the version hash of the specified link's target. If the target is the same as the specified
   * object, will return the latest version hash.
   *
   * @methodGroup URL Generation
   * @namedParams
   * @param {string=} libraryId - ID of an library
   * @param {string=} objectId - ID of an object
   * @param {string=} versionHash - Hash of an object version
   * @param {string} linkPath - Path to the content object link
   *
   * @returns {Promise<string>} - Version hash of the link's target
   */
  async LinkTarget({libraryId, objectId, versionHash, linkPath}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    const linkInfo = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      versionHash,
      metadataSubtree: UrlJoin(linkPath),
      resolveLinks: false
    });

    if(!linkInfo || !linkInfo["/"]) {
      throw Error(`No valid link at ${linkPath}`);
    }

    const targetHash = ((linkInfo["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1];

    if(targetHash) { return targetHash; }

    // Link points to this object - get latest version
    if(!libraryId) {
      libraryId = await this.ContentObjectLibraryId({objectId});
    }

    return (await this.ContentObject({libraryId, objectId})).hash;
  }

  /**
   * Generate a URL to the specified file link with appropriate authentication
   *
   * @methodGroup URL Generation
   * @namedParams
   * @param {string=} libraryId - ID of an library
   * @param {string=} objectId - ID of an object
   * @param {string=} versionHash - Hash of an object version
   * @param {string} linkPath - Path to the content object link
   * @param {string=} mimeType - Mime type to use when rendering the file
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached.
   *
   * @returns {Promise<string>} - URL to the specified file with authorization token
   */
  async LinkUrl({libraryId, objectId, versionHash, linkPath, mimeType, queryParams={}, noCache=false}) {
    ValidateParameters({libraryId, objectId, versionHash});

    if(!linkPath) { throw Error("Link path not specified"); }

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    let path;
    if(libraryId) {
      path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, "meta", linkPath);
    } else {
      path = UrlJoin("q", versionHash, "meta", linkPath);
    }

    queryParams = {
      ...queryParams,
      resolve: true,
      authorization: await this.authClient.AuthorizationToken({libraryId, objectId, noCache, noAuth: true})
    };

    if(mimeType) { queryParams["header-accept"] = mimeType; }

    return this.HttpClient.URL({
      path: path,
      queryParams
    });
  }

  /**
   * Retrieve the data at the specified link in the specified format
   *
   * @methodGroup URL Generation
   * @namedParams
   * @param {string=} libraryId - ID of an library
   * @param {string=} objectId - ID of an object
   * @param {string=} versionHash - Hash of an object version
   * @param {string} linkPath - Path to the content object link
   * @param {string=} format=json - Format of the response
   */
  async LinkData({libraryId, objectId, versionHash, linkPath, format="json"}) {
    const linkUrl = await this.LinkUrl({libraryId, objectId, versionHash, linkPath});

    return ResponseToFormat(
      format,
      await HttpClient.Fetch(linkUrl)
    );
  }

  /* Access Groups */

  /**
   * Create a access group
   *
   * A new access group contract is deployed from the content space
   *
   * @methodGroup Access Groups
   * @namedParams
   * @param {string} name - Name of the access group
   * @param {string=} description - Description for the access group
   * @param {object=} meta - Metadata for the access group
   *
   * @returns {Promise<string>} - Contract address of created access group
   */
  async CreateAccessGroup({name, description, metadata={}}) {
    this.Log(`Creating access group: ${name || ""} ${description || ""}`);
    const { contractAddress } = await this.authClient.CreateAccessGroup();

    const objectId = this.utils.AddressToObjectId(contractAddress);

    this.Log(`Access group: ${contractAddress} ${objectId}`);

    const editResponse = await this.EditContentObject({
      libraryId: this.contentSpaceLibraryId,
      objectId: objectId
    });

    await this.ReplaceMetadata({
      libraryId: this.contentSpaceLibraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadata: {
        public: {
          name,
          description
        },
        name,
        description,
        ...metadata
      }
    });

    await this.FinalizeContentObject({
      libraryId: this.contentSpaceLibraryId,
      objectId,
      writeToken: editResponse.write_token
    });

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
    ValidateAddress(contractAddress);

    this.Log(`Retrieving owner of access group ${contractAddress}`);

    return this.utils.FormatAddress(
      await this.ethClient.CallContractMethod({
        contractAddress,
        abi: AccessGroupContract.abi,
        methodName: "owner",
        methodArgs: [],
        signer: this.signer
      })
    );
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
    ValidateAddress(contractAddress);

    this.Log(`Deleting access group ${contractAddress}`);

    await this.CallContractMethodAndWait({
      contractAddress,
      abi: AccessGroupContract.abi,
      methodName: "kill",
      methodArgs: []
    });
  }

  /**
   * Get a list of addresses of members of the specified group
   *
   * @methodGroup AccessGroups
   * @namedParams
   * @param contractAddress - The address of the access group contract
   *
   * @return {Promise<Array<string>>} - List of member addresses
   */
  async AccessGroupMembers({contractAddress}) {
    ValidateAddress(contractAddress);

    this.Log(`Retrieving members for group ${contractAddress}`);

    const length = (await this.CallContractMethod({
      contractAddress,
      abi: AccessGroupContract.abi,
      methodName: "membersNum"
    })).toNumber();

    return await Promise.all(
      [...Array(length)].map(async (_, i) =>
        this.utils.FormatAddress(
          await this.CallContractMethod({
            contractAddress,
            abi: AccessGroupContract.abi,
            methodName: "membersList",
            methodArgs: [i]
          })
        )
      )
    );
  }

  /**
   * Get a list of addresses of managers of the specified group
   *
   * @methodGroup AccessGroups
   * @namedParams
   * @param contractAddress - The address of the access group contract
   *
   * @return {Promise<Array<string>>} - List of manager addresses
   */
  async AccessGroupManagers({contractAddress}) {
    ValidateAddress(contractAddress);

    this.Log(`Retrieving managers for group ${contractAddress}`);

    const length = (await this.CallContractMethod({
      contractAddress,
      abi: AccessGroupContract.abi,
      methodName: "managersNum"
    })).toNumber();

    return await Promise.all(
      [...Array(length)].map(async (_, i) =>
        this.utils.FormatAddress(
          await this.CallContractMethod({
            contractAddress,
            abi: AccessGroupContract.abi,
            methodName: "managersList",
            methodArgs: [i]
          })
        )
      )
    );
  }

  async AccessGroupMembershipMethod({contractAddress, memberAddress, methodName, eventName}) {
    ValidateAddress(contractAddress);
    ValidateAddress(memberAddress);

    // Ensure caller is the member being acted upon or a manager/owner of the group
    if(!this.utils.EqualAddress(this.signer.address, memberAddress)) {
      const isManager = await this.CallContractMethod({
        contractAddress,
        abi: AccessGroupContract.abi,
        methodName: "hasManagerAccess",
        methodArgs: [this.utils.FormatAddress(this.signer.address)]
      });

      if(!isManager) {
        throw Error("Manager access required");
      }
    }

    this.Log(`Calling ${methodName} on group ${contractAddress} for user ${memberAddress}`);

    const event = await this.CallContractMethodAndWait({
      contractAddress,
      abi: AccessGroupContract.abi,
      methodName,
      methodArgs: [ this.utils.FormatAddress(memberAddress) ],
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
    ValidateAddress(contractAddress);
    ValidateAddress(memberAddress);

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
    ValidateAddress(contractAddress);
    ValidateAddress(memberAddress);

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
    ValidateAddress(contractAddress);
    ValidateAddress(memberAddress);

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
    ValidateAddress(contractAddress);
    ValidateAddress(memberAddress);

    return await this.AccessGroupMembershipMethod({
      contractAddress,
      memberAddress,
      methodName: "revokeManagerAccess",
      eventName: "ManagerAccessRevoked"
    });
  }

  /**
   * List all of the groups with permissions on the specified library.
   *
   * @methodGroup Access Groups
   * @namedParams
   * @param {string} libraryId - The ID of the library* @param {string} libraryId - The ID of the library
   * @param {(Array<string>)=} permissions - Limit permission types. If not specified, all permissions will be included
   *
   * @return {Promise<Object>} - Object mapping group addresses to permissions, as an array
   * - Example: { "0x0": ["accessor", "contributor"], ...}
   */
  async ContentLibraryGroupPermissions({libraryId, permissions=[]}) {
    ValidateLibrary(libraryId);

    let libraryPermissions = {};

    if(!permissions || permissions.length === 0) {
      permissions = ["accessor", "contributor", "reviewer"];
    } else {
      // Format and validate specified permissions
      permissions = permissions.map(permission => {
        permission = permission.toLowerCase();

        if(!["accessor", "contributor", "reviewer"].includes(permission)) {
          throw Error(`Invalid permission: ${permission}`);
        }

        return permission;
      });
    }

    this.Log(`Retrieving ${permissions.join(", ")} group(s) for library ${libraryId}`);

    await Promise.all(
      permissions.map(async type => {
        // Get library access groups of the specified type
        let numGroups = await this.CallContractMethod({
          contractAddress: this.utils.HashToAddress(libraryId),
          abi: LibraryContract.abi,
          methodName: type + "GroupsLength"
        });

        numGroups = parseInt(numGroups._hex, 16);

        const accessGroupAddresses = await LimitedMap(
          3,
          [...Array(numGroups).keys()],
          async i => {
            try {
              return this.utils.FormatAddress(
                await this.CallContractMethod({
                  contractAddress: this.utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: type + "Groups",
                  methodArgs: [i]
                })
              );
            } catch(error) {
              // eslint-disable-next-line no-console
              console.error(error);
            }
          }
        );

        accessGroupAddresses.forEach(address =>
          libraryPermissions[address] = [...(libraryPermissions[address] || []), type].sort());
      })
    );

    return libraryPermissions;
  }

  /**
   * Add accessor, contributor or reviewer permissions for the specified group on the specified library
   *
   * @methodGroup Access Groups
   * @namedParams
   * @param {string} libraryId - The ID of the library
   * @param {string} groupAddress - The address of the group
   * @param {string} permission - The type of permission to add ("accessor", "contributor", "reviewer")
   */
  async AddContentLibraryGroup({libraryId, groupAddress, permission}) {
    ValidateLibrary(libraryId);
    ValidateAddress(groupAddress);

    groupAddress = this.utils.FormatAddress(groupAddress);

    if(!["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
      throw Error(`Invalid group type: ${permission}`);
    }

    this.Log(`Adding ${permission} group ${groupAddress} to library ${libraryId}`);

    const existingPermissions = await this.ContentLibraryGroupPermissions({
      libraryId,
      permissions: [permission]
    });

    if(existingPermissions[groupAddress]) { return; }

    // Capitalize permission to match method and event names
    permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();

    const event = await this.CallContractMethodAndWait({
      contractAddress: this.utils.HashToAddress(libraryId),
      abi: LibraryContract.abi,
      methodName: `add${permission}Group`,
      methodArgs: [this.utils.FormatAddress(groupAddress)]
    });

    await this.ExtractEventFromLogs({
      abi: LibraryContract.abi,
      event,
      eventName: `${permission}GroupAdded`
    });
  }

  /**
   * Remove accessor, contributor or reviewer permissions for the specified group on the specified library
   *
   * @methodGroup Access Groups
   * @namedParams
   * @param {string} libraryId - The ID of the library
   * @param {string} groupAddress - The address of the group
   * @param {string} permission - The type of permission to remove ("accessor", "contributor", "reviewer")
   */
  async RemoveContentLibraryGroup({libraryId, groupAddress, permission}) {
    ValidateLibrary(libraryId);
    ValidateAddress(groupAddress);

    if(!["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
      throw Error(`Invalid group type: ${permission}`);
    }

    this.Log(`Removing ${permission} group ${groupAddress} from library ${libraryId}`);

    const existingPermissions = await this.ContentLibraryGroupPermissions({
      libraryId,
      permissions: [permission]
    });

    if(!existingPermissions[groupAddress]) { return; }

    // Capitalize permission to match method and event names
    permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();

    const event = await this.CallContractMethodAndWait({
      contractAddress: this.utils.HashToAddress(libraryId),
      abi: LibraryContract.abi,
      methodName: `remove${permission}Group`,
      methodArgs: [this.utils.FormatAddress(groupAddress)]
    });

    await this.ExtractEventFromLogs({
      abi: LibraryContract.abi,
      event,
      eventName: `${permission}GroupRemoved`
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

    this.Log(`Retrieving ${collectionType} contract collection for user ${this.signer.address}`);

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
    ValidateParameters({libraryId, objectId, versionHash});

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
    ValidateParameters({libraryId, objectId, versionHash});
    ValidatePartHash(partHash);

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
    ValidateParameters({libraryId, objectId, versionHash});
    ValidatePartHash(partHash);

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
   * Return the name of the contract, as specified in the contracts "version" string
   *
   * @methodGroup Contracts
   *
   * @namedParams
   * @param {string} contractAddress - Address of the contract
   *
   * @return {Promise<string>} - Name of the contract
   */
  async ContractName({contractAddress}) {
    ValidateAddress(contractAddress);

    return await this.ethClient.ContractName(contractAddress);
  }

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
   * Use this method to call constant methods and contract attributes, as well as transaction-performing methods
   * for which the transaction does not need to be awaited.
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
  async CallContractMethod({contractAddress, abi, methodName, methodArgs=[], value, overrides={}, formatArguments=true, cacheContract=true}) {
    ValidateAddress(contractAddress);

    return await this.ethClient.CallContractMethod({
      contractAddress,
      abi,
      methodName,
      methodArgs,
      value,
      overrides,
      formatArguments,
      cacheContract,
      signer: this.signer
    });
  }

  /**
   * Call the specified method on a deployed contract and wait for the transaction to be mined.
   * This action will be performed by this client's signer.
   *
   * Use this method to call transaction-performing methods and wait for the transaction to complete.
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
   * @returns {Promise<*>} - The event object of this transaction. See the ExtractEventFromLogs method for parsing
   * the resulting event(s)
   */
  async CallContractMethodAndWait({contractAddress, abi, methodName, methodArgs, value, overrides={}, formatArguments=true}) {
    ValidateAddress(contractAddress);

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
    ValidateParameters({libraryId, objectId});
    ValidateAddress(customContractAddress);

    customContractAddress = this.utils.FormatAddress(customContractAddress);

    this.Log(`Setting custom contract address: ${objectId} ${customContractAddress}`);

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
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object
   *
   * @returns {Promise<string> | undefined} - If the object has a custom contract, this will return the address of the custom contract
   */
  async CustomContractAddress({libraryId, objectId, versionHash}) {
    ValidateParameters({libraryId, objectId, versionHash});

    if(versionHash) {
      objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    }

    if(libraryId === this.contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId)) {
      // Content type or content library object - no custom contract
      return;
    }

    this.Log(`Retrieving custom contract address: ${objectId}`);

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

  async FormatBlockNumbers({fromBlock, toBlock, count=10}) {
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

    return { fromBlock, toBlock };
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
   * @param {number=} count=1000 - Maximum range of blocks to search (unless both toBlock and fromBlock are specified)
   * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
   * Note: This requires one extra network call per block, so it should not be used for very large ranges
   * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
   */
  async ContractEvents({contractAddress, abi, fromBlock=0, toBlock, count=1000, includeTransaction=false}) {
    ValidateAddress(contractAddress);

    const blocks = await this.FormatBlockNumbers({fromBlock, toBlock, count});

    this.Log(`Querying contract events ${contractAddress} - Blocks ${blocks.fromBlock} to ${blocks.toBlock}`);

    return await this.ethClient.ContractEvents({
      contractAddress,
      abi,
      fromBlock: blocks.fromBlock,
      toBlock: blocks.toBlock,
      includeTransaction
    });
  }

  // TODO: Not implemented in contracts
  async WithdrawContractFunds({contractAddress, abi, ether}) {
    ValidateAddress(contractAddress);

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
   * @param {number=} count=10 - Max number of events to include (unless both toBlock and fromBlock are specified)
   * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
   * Note: This requires two extra network calls per transaction, so it should not be used for very large ranges
   * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
   */
  async Events({toBlock, fromBlock, count=10, includeTransaction=false}={}) {
    const blocks = await this.FormatBlockNumbers({fromBlock, toBlock, count});

    this.Log(`Querying events - Blocks ${blocks.fromBlock} to ${blocks.toBlock}`);

    return await this.ethClient.Events({
      fromBlock: blocks.fromBlock,
      toBlock: blocks.toBlock,
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
   * @returns {Promise<string>} - Balance of the account, in ether (as string)
   */
  async GetBalance({address}) {
    ValidateAddress(address);

    const balance = await this.ethClient.MakeProviderCall({methodName: "getBalance", args: [address]});

    return Ethers.utils.formatEther(balance);
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
    ValidateAddress(recipient);

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
      "FormatBlockNumbers",
      "FrameAllowedMethods",
      "FromConfigurationUrl",
      "GenerateWallet",
      "InitializeClients",
      "Log",
      "SetSigner",
      "SetSignerFromWeb3Provider",
      "ToggleLogging"
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
      this.Log(
        `Frame Message Error:
        Method: ${message.calledMethod}
        Arguments: ${JSON.stringify(message.args, null, 2)}
        Error: ${typeof error === "object" ? JSON.stringify(error, null, 2) : error}`,
        true
      );

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
