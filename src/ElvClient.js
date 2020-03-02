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

const SpaceContract = require("./contracts/BaseContentSpace");
const LibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");
const ContentTypeContract = require("./contracts/BaseContentType");

const {
  ValidateLibrary,
  ValidateObject,
  ValidateVersion,
  ValidateWriteToken,
  ValidatePartHash,
  ValidateParameters
} = require("./Validation");

if(Utils.Platform() === Utils.PLATFORM_NODE) {
  // Define Response in node
  // eslint-disable-next-line no-global-assign
  global.Response = (require("node-fetch")).Response;
} else if(Utils.Platform() === Utils.PLATFORM_REACT_NATIVE) {
  // React native polyfill
  require("unorm");
}

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
    kmsURIs,
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
    this.kmsURIs = kmsURIs;

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

      const fabricInfo = await Utils.ResponseToJson(
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
   * @param {Array<string>} kmsURLs - List of KMS urls to use for OAuth authentication
   * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: na-west-north na-west-south na-east eu-west
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {Promise<ElvClient>} - New ElvClient connected to the specified content fabric and blockchain
   */
  static async FromConfigurationUrl({
    configUrl,
    kmsUrls=[],
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
      kmsURIs: kmsUrls,
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

  /**
   * Set the signer for this client via OAuth token. The client will exchange the given token
   * for the user's private key using the KMS specified in the configuration.
   *
   * NOTE: The KMS URL(s) must be set in the initial configuration of the client (FromConfigurationUrl)
   *
   * @param {string} token - The OAuth ID token to authenticate with
   */
  async SetOauthToken({token}) {
    if(!this.kmsURIs || this.kmsURIs.length === 0) {
      throw Error("Unable to authorize with OAuth token: No KMS URLs set");
    }

    this.oauthToken = token;

    const path = "/ks/jwt/wlt";
    const httpClient = new HttpClient({uris: this.kmsURIs});

    const response = await ResponseToJson(
      httpClient.Request({
        headers: { Authorization: `Bearer ${token}`},
        method: "PUT",
        path
      })
    );

    const privateKey = response["UserSKHex"];

    const wallet = this.GenerateWallet();
    const signer = wallet.AddAccount({privateKey});

    this.SetSigner({signer});
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
   *
   * @namedParams
   * @param {string} libraryId
   *
   * @returns {Promise<Object>}
   */
  async ContentLibrary({libraryId}) {
    ValidateLibrary(libraryId);

    const path = UrlJoin("qlibs", libraryId);

    const library = await this.utils.ResponseToJson(
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
    const createResponse = await this.utils.ResponseToJson(
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

    return await this.utils.ResponseToJson(
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

    return await this.utils.ResponseToJson(
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
      return await this.utils.LimitedMap(
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
    await this.utils.LimitedMap(
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
   * @methodGroup Metadata
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
   * @param {string=} writeToken - Write token of an object draft - if specified, will read metadata from the draft
   * @param {string=} metadataSubtree - Subtree of the object metadata to retrieve
   * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
   * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata

      Example:
       {
          "resolved-link": {
            ".": {
              "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
            },
            ...
          }
       }

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
    resolveIncludeSource=false,
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
      metadata = await this.utils.ResponseToJson(
        this.HttpClient.Request({
          headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, noAuth}),
          queryParams: {
            resolve: resolveLinks,
            resolve_include_source: resolveIncludeSource
          },
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

    return this.utils.ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, noAuth}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Retrieve the version hash of the latest version of the specified object
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object
   *
   * @returns {Promise<string>} - The latest version hash of the object
   */
  async LatestVersionHash({objectId, versionHash}) {
    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    ValidateObject(objectId);

    return await this.CallContractMethod({
      contractAddress: this.utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "objectHash"
    });
  }

  /* Content object creation, modification, deletion */

  /**
   * Create a new content object draft.
   *
   * A new content object contract is deployed from
   * the content library, and that contract ID is used to determine the object ID to
   * create in the fabric.
   *
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string=} objectId - ID of the object (if contract already exists)
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

      let type = options.type;
      if(type.startsWith("hq__")) {
        type = await this.ContentType({versionHash: type});
      } else if(type.startsWith("iq__")) {
        type = await this.ContentType({typeId: type});
      } else {
        type = await this.ContentType({name: type});
      }

      if(!type) {
        throw Error(`Unable to find content type '${options.type}'`);
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

    return await this.utils.ResponseToJson(
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
   * @methodGroup Content Objects
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {object=} options -
   * meta: New metadata for the object - will be merged into existing metadata if specified
   * type: New type for the object - Object ID, version hash or name of type
   *
   * @returns {Promise<object>} - Response containing the object ID and write token of the draft
   */
  async EditContentObject({libraryId, objectId, options={}}) {
    ValidateParameters({libraryId, objectId});

    this.Log(`Opening content draft: ${libraryId} ${objectId}`);

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

    let path = UrlJoin("qid", objectId);

    return this.utils.ResponseToJson(
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

    const finalizeResponse = await this.utils.ResponseToJson(
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
   * @param {ArrayBuffer | Buffer} chunk - The data to encrypt
   *
   * @return {Promise<ArrayBuffer>}
   */
  async Encrypt({libraryId, objectId, writeToken, chunk}) {
    ValidateParameters({libraryId, objectId});

    const conk = await this.EncryptionConk({libraryId, objectId, writeToken});
    const data = await Crypto.Encrypt(conk, chunk);

    // Convert to ArrayBuffer
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }

  /**
   * Decrypt the specified chunk for the specified object or draft
   *
   * @methodGroup Encryption
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {ArrayBuffer | Buffer} chunk - The data to decrypt
   *
   * @return {Promise<ArrayBuffer>}
   */
  async Decrypt({libraryId, objectId, writeToken, chunk}) {
    ValidateParameters({libraryId, objectId});

    const conk = await this.EncryptionConk({libraryId, objectId, writeToken});
    const data = await Crypto.Decrypt(conk, chunk);

    // Convert to ArrayBuffer
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
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
   * Generate a state channel token.
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
      versionHash = await this.LatestVersionHash({objectId});
    }

    this.stateChannelAccess[objectId] = versionHash;

    const audienceData = this.AudienceData({objectId, versionHash});

    return await this.authClient.AuthorizationToken({
      objectId,
      channelAuth: true,
      oauthToken: this.oauthToken,
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
        versionHash = await this.LatestVersionHash({objectId});
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
    const availableDRMs = ["clear", "aes-128"];

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
   * @param {Array<string>} protocols=["dash", "hls"] - Acceptable playout protocols ("dash", "hls")
   * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "widevine")
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

    let path, linkTargetLibraryId, linkTargetId, linkTargetHash;
    if(linkPath) {
      linkTargetHash = await this.LinkTarget({libraryId, objectId, versionHash, linkPath});
      linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
      linkTargetLibraryId = await this.ContentObjectLibraryId({objectId: linkTargetId});
      path = UrlJoin("q", versionHash || objectId, "meta", linkPath);
    } else {
      path = UrlJoin("q", versionHash || objectId, "rep", "playout", offering, "options.json");
    }

    const audienceData = this.AudienceData({
      objectId: linkTargetId || objectId,
      versionHash: linkTargetHash || versionHash || await this.LatestVersionHash({objectId}),
      protocols,
      drms
    });

    // Add authorization token to playout URLs
    let queryParams = {
      authorization: await this.authClient.AuthorizationToken({
        libraryId,
        objectId,
        channelAuth: true,
        oauthToken: this.oauthToken,
        audienceData
      })
    };

    if(linkPath) {
      queryParams.resolve = true;
    }

    const playoutOptions = Object.values(
      await this.utils.ResponseToJson(
        this.HttpClient.Request({
          path: path,
          method: "GET",
          queryParams
        })
      )
    );

    let playoutMap = {};
    for(let i = 0; i < playoutOptions.length; i++) {
      const option = playoutOptions[i];
      const protocol = option.properties.protocol;
      const drm = option.properties.drm;
      // Remove authorization parameter from playout path - it's re-added by Rep
      const playoutPath = option.uri.split("?")[0];
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
              rep: UrlJoin("playout", offering, playoutPath),
              channelAuth: true,
              queryParams: hlsjsProfile && protocol === "hls" ? {player_profile: "hls-js"} : {}
            }),
            drms: drm ? {[drm]: {licenseServers}} : undefined
          }
        }
      };

      // Exclude any options that do not satisfy the specified protocols and/or DRMs
      const protocolMatch = protocols.includes(protocol);
      const drmMatch = drms.includes(drm || "clear") || (drms.length === 0 && !drm);
      if(!protocolMatch || !drmMatch) {
        continue;
      }

      // This protocol / DRM satisfies the specifications (prefer DRM over clear, if available)
      if(!playoutMap[protocol].playoutUrl || (drm && drm !== "clear")) {
        playoutMap[protocol].playoutUrl = playoutMap[protocol].playoutMethods[drm || "clear"].playoutUrl;
        playoutMap[protocol].drms = playoutMap[protocol].playoutMethods[drm || "clear"].drms;
      }
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
   * @param {Array<string>} protocols=["dash", "hls"] - Acceptable playout protocols ("dash", "hls")
   * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "widevine")
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

    const authToken = await this.authClient.AuthorizationToken({
      objectId,
      channelAuth: true,
      oauthToken: this.oauthToken
    });

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
                Authorization: `Bearer ${authToken}`
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

    return this.utils.ResponseToFormat(
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
   * @see <a href="#FabricUrl">FabricUrl</a> for creating arbitrary fabric URLs
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
   *
   * @see <a href="#FabricUrl">FabricUrl</a> for creating arbitrary fabric URLs
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
   * @param {string=} writeToken - A write token for a draft of the object (requires libraryId)
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
    writeToken,
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
      writeToken: ${writeToken}
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
        path = UrlJoin(path, "q", writeToken || versionHash || objectId);
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
   * @param {string=} writeToken - A write token for a draft of the object (requires libraryId)
   * @param {string} filePath - Path to the content object file
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached.
   *
   * @returns {Promise<string>} - URL to the specified file with authorization token
   */
  async FileUrl({libraryId, objectId, versionHash, writeToken, filePath, queryParams={}, noCache=false}) {
    ValidateParameters({libraryId, objectId, versionHash});
    if(!filePath) { throw "File path not specified"; }

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    let path;

    if(libraryId) {
      path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash || objectId, "files", filePath);
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
   * Get a specific content object in the library
   *
   * @methodGroup Links
   * @namedParams
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
   * @param {boolean=} autoUpdate=false - If true, lists only links marked as auto-update links
   * @param {(string | Array<string>)=} select - Limit metadata fields return in link details
   *
   * @returns {Promise<Object>} - Description of created object
   */
  async ContentObjectGraph({libraryId, objectId, versionHash, autoUpdate=false, select}) {
    ValidateParameters({libraryId, objectId, versionHash});

    this.Log(`Retrieving content object graph: ${libraryId || ""} ${objectId || versionHash}`);

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    let path = UrlJoin("q", versionHash || objectId, "links");

    try {
      return await this.utils.ResponseToJson(
        this.HttpClient.Request({
          headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, noAuth: true}),
          queryParams: {
            auto_update: autoUpdate,
            select
          },
          method: "GET",
          path: path
        })
      );
    } catch(error) {
      // If a cycle is present, do some work to present useful information about it
      let errorInfo;
      try {
        const cycles = error.body.errors[0].cause.cause.cause.cycle;

        if(!cycles || cycles.length === 0) { throw error; }

        let info = {};
        await Promise.all(
          cycles.map(async cycleHash => {
            if(info[cycleHash]) { return; }

            const cycleId = (this.utils.DecodeVersionHash(cycleHash)).objectId;
            const name = (
              await this.ContentObjectMetadata({versionHash: cycleHash, metadataSubtree: "public/asset_metadata/display_title"}) ||
              await this.ContentObjectMetadata({versionHash: cycleHash, metadataSubtree: "public/name"}) ||
              await this.ContentObjectMetadata({versionHash: cycleHash, metadataSubtree: "name"}) ||
              cycleId
            );

            info[cycleHash] = { name, objectId: cycleId };
          })
        );

        errorInfo = cycles.map(cycleHash => `${info[cycleHash].name} (${info[cycleHash].objectId})`);
      } catch(e) {
        throw error;
      }

      throw new Error(
        `Cycle found in links: ${errorInfo.join(" -> ")}`
      );
    }
  }

  /**
   * Recursively update all auto_update links in the specified object.
   *
   * Note: Links will not be updated unless they are specifically marked as auto_update
   *
   * @param {string=} libraryId - ID of the library
   * @param {string=} objectId - ID of the object
   * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
   * @param {function=} callback - If specified, the callback will be called each time an object is updated with
   * current progress as well as information about the last update (action)
   * - Format: {completed: number, total: number, action: string}
   */
  async UpdateContentObjectGraph({libraryId, objectId, versionHash, callback}) {
    ValidateParameters({libraryId, objectId, versionHash});

    this.Log(`Updating content object graph: ${libraryId || ""} ${objectId || versionHash}`);

    if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

    let total;
    let completed = 0;

    // eslint-disable-next-line no-constant-condition
    while(1) {
      const graph = await this.ContentObjectGraph({
        libraryId,
        objectId,
        versionHash,
        autoUpdate: true,
        select: ["name", "public/name", "public/asset_metadata/display_title"]
      });

      if(Object.keys(graph.auto_updates).length === 0) {
        this.Log("No more updates required");
        return;
      }

      if(!total) {
        total = graph.auto_updates.order.length;
      }

      const currentHash = graph.auto_updates.order[0];
      const links = graph.auto_updates.links[currentHash];

      const details = graph.details[currentHash].meta;
      const name = (details.public && details.public.asset_metadata && details.public.asset_metadata.display_title) ||
        (details.public && details.public.name) || details.name || versionHash || objectId;

      const currentLibraryId = await this.ContentObjectLibraryId({versionHash: currentHash});
      const currentObjectId = (this.utils.DecodeVersionHash(currentHash)).objectId;

      if(callback) {
        callback({
          completed,
          total,
          action: `Updating ${name} (${currentObjectId})...`
        });
      }

      this.Log(`Updating links for ${name} (${currentObjectId} / ${currentHash})`);

      const {write_token} = await this.EditContentObject({
        libraryId: currentLibraryId,
        objectId: currentObjectId
      });

      await Promise.all(
        links.map(async ({path, updated}) => {
          await this.ReplaceMetadata({
            libraryId: currentLibraryId,
            objectId: currentObjectId,
            writeToken: write_token,
            metadataSubtree: path,
            metadata: updated
          });
        })
      );

      const { hash } = await this.FinalizeContentObject({
        libraryId: currentLibraryId,
        objectId: currentObjectId,
        writeToken: write_token
      });

      // If root object was specified by hash and updated, update hash
      if(currentHash === versionHash) {
        versionHash = hash;
      }

      completed += 1;
    }
  }

  /**
   * Create links to files, metadata and/or representations of this or or other
   * content objects.
   *
   * Expected format of links:
   *

       [
         {
            path: string (metadata path for the link)
            target: string (path to link target),
            type: string ("file", "meta" | "metadata", "rep" - default "metadata")
            targetHash: string (optional, for cross-object links),
            autoUpdate: boolean (if specified, link will be automatically updated to latest version by UpdateContentObjectGraph method)
          }
       ]

   * @methodGroup Links
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

      let type = (info.type || "file") === "file" ? "files" : info.type;
      if(type === "metadata") { type = "meta"; }

      let target = info.target.replace(/^(\/|\.)+/, "");
      if(info.targetHash) {
        target = `/qfab/${info.targetHash}/${type}/${target}`;
      } else {
        target = `./${type}/${target}`;
      }

      let link = {
        "/": target
      };

      if(info.autoUpdate) {
        link["."] = { auto_update: { tag: "latest"} };
      }

      await this.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: path,
        metadata: link
      });
    }
  }

  /**
   * Retrieve the version hash of the specified link's target. If the target is the same as the specified
   * object and versionHash is not specified, will return the latest version hash.
   *
   * @methodGroup Links
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

    /* For absolute links - extract the hash from the link itself. Otherwise use "container" */
    let targetHash = ((linkInfo["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1];
    if(!targetHash) {
      targetHash = linkInfo["."].container;
    }

    if(targetHash) {
      return targetHash;
    } else if(versionHash) {
      return versionHash;
    }

    // Link points to this object - get latest version
    if(!libraryId) {
      libraryId = await this.ContentObjectLibraryId({objectId});
    }

    return (await this.ContentObject({libraryId, objectId})).hash;
  }

  /**
   * Generate a URL to the specified file link with appropriate authentication
   *
   * @methodGroup Links
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
   * @methodGroup Links
   * @namedParams
   * @param {string=} libraryId - ID of an library
   * @param {string=} objectId - ID of an object
   * @param {string=} versionHash - Hash of an object version
   * @param {string} linkPath - Path to the content object link
   * @param {string=} format=json - Format of the response
   */
  async LinkData({libraryId, objectId, versionHash, linkPath, format="json"}) {
    const linkUrl = await this.LinkUrl({libraryId, objectId, versionHash, linkPath});

    return this.utils.ResponseToFormat(
      format,
      await HttpClient.Fetch(linkUrl)
    );
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

    return this.utils.ResponseToJson(
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

    return this.utils.ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, partHash}),
        method: "GET",
        path: path
      })
    );
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

Object.assign(ElvClient.prototype, require("./client/ABRPublishing"));
Object.assign(ElvClient.prototype, require("./client/AccessGroups").access);
Object.assign(ElvClient.prototype, require("./client/AccessGroups").manage);
Object.assign(ElvClient.prototype, require("./client/Contracts"));
Object.assign(ElvClient.prototype, require("./client/Files").access);
Object.assign(ElvClient.prototype, require("./client/Files").manage);

exports.ElvClient = ElvClient;
