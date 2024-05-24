if(typeof globalThis.Buffer === "undefined") { globalThis.Buffer = require("buffer/").Buffer; }

const URI = require("urijs");
const Ethers = require("ethers");

const AuthorizationClient = require("./AuthorizationClient");
const ElvWallet = require("./ElvWallet");
const EthClient = require("./EthClient");
const UserProfileClient = require("./UserProfileClient");
const HttpClient = require("./HttpClient");
const RemoteSigner = require("./RemoteSigner");

// const ContentObjectVerification = require("./ContentObjectVerification");
const Utils = require("./Utils");
const Crypto = require("./Crypto");
const {LogMessage} = require("./LogMessage");

const Pako = require("pako");

const {
  ValidatePresence
} = require("./Validation");
const UrlJoin = require("url-join");

const networks = {
  "main": "https://main.net955305.contentfabric.io",
  "demo": "https://demov3.net955210.contentfabric.io",
  "demov3": "https://demov3.net955210.contentfabric.io",
  "test": "https://test.net955203.contentfabric.io"
};

if(Utils.Platform() === Utils.PLATFORM_NODE) {
  // Define Response in node
  // eslint-disable-next-line no-global-assign
  globalThis.Response = (require("node-fetch")).Response;
}

/**
 * See the Modules section on the sidebar for details about methods related to interacting with the Fabric.
 *
 * <br/>
 *
 * For information about the Eluvio Wallet Client, go <a href="wallet-client/index.html">here</a>.
 */
class ElvClient {
  Log(message, error = false) {
    LogMessage(this, message, error);
  }

  /**
   * Enable or disable verbose logging
   *
   * @methodGroup Miscellaneous
   *
   * @param {boolean} enable - Set logging
   * @param {Object=} options - Additional options for customizing logging
   * - log: custom log() function
   * - error: custom error() function
   * - (custom functions must accept same arguments as console.log/console.error)
   */
  ToggleLogging(enable, options = {}) {
    // define func with closure to pass to forEach
    const setDebug = (reporter) => {
      if(reporter) {
        reporter.debug = enable;
        reporter.debugOptions = options;
      }
    };

    [this,
      this.authClient,
      this.ethClient,
      this.HttpClient,
      this.userProfileClient].forEach(setDebug);

    if(enable) {
      this.Log(
        `Debug Logging Enabled:
        Content Space: ${this.contentSpaceId}
        Fabric URLs: [\n\t\t${this.fabricURIs.join(", \n\t\t")}\n\t]
        Ethereum URLs: [\n\t\t${this.ethereumURIs.join(", \n\t\t")}\n\t]
        Auth Service URLs: [\n\t\t${this.authServiceURIs.join(", \n\t\t")}\n\t]
        `
      );
    }
  }

  EnableMethodLogging() {
    const MethodLogger = (klass) => {
      Object.getOwnPropertyNames(Object.getPrototypeOf(klass))
        .filter(method => typeof klass[method] === "function")
        .forEach(methodName => {
          const originalMethod = klass[methodName].bind(klass);

          if(originalMethod.constructor.name === "AsyncFunction") {
            klass[methodName] = async (...args) => {
              const start = Date.now();
              const result = await originalMethod(...args);
              // eslint-disable-next-line no-console
              console.log(methodName, Date.now() - start, "ms", JSON.stringify(args));
              return result;
            };
          } else {
            klass[methodName] = (...args) => {
              const start = Date.now();
              const result = originalMethod(...args);
              // eslint-disable-next-line no-console
              console.log(methodName, Date.now() - start, "ms", JSON.stringify(args));
              return result;
            };
          }
        });
    };

    MethodLogger(this);
  }

  /**
   * Create a new ElvClient
   *
   * NOTE: It is highly recommended to use the <a href="#.FromConfigurationUrl">FromConfigurationUrl</a> or <a href="#.FromNetworkName">FromNetworkName</a> method
   * automatically import the client settings from the fabric
   *
   * @constructor
   *
   * @namedParams
   * @param {string} contentSpaceId - ID of the content space
   * @param {string} networkId - ID of the blockchain network
   * @param {string} networkName - Name of the blockchain network
   * @param {number} fabricVersion - The version of the target content fabric
   * @param {Array<string>} fabricURIs - A list of full URIs to content fabric nodes
   * @param {Array<string>} ethereumURIs - A list of full URIs to ethereum nodes
   * @param {Array<string>} authServiceURIs - A list of full URIs to auth service endpoints
   * @param {Array<string>=} searchURIs - A list of full URIs to search service endpoints
   * @param {number=} ethereumContractTimeout=10 - Number of seconds to wait for contract calls
   * @param {string=} trustAuthorityId - (OAuth) The ID of the trust authority to use for OAuth authentication
   * @param {string=} staticToken - Static token that will be used for all authorization in place of normal auth. Also known as an anonymous token containing the space
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   * @param {boolean=} assumeV3=false - If enabled, V3 fabric will be assumed
   * @param {string=} service=default - The mode that determines how HttpClient will be initialized.
   * If 'default' is set, HttpClient uris will use fabricUris. If 'search' is used, searchUris will be used
   *
   * @return {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  constructor({
    contentSpaceId,
    networkId,
    networkName,
    fabricVersion,
    fabricURIs,
    ethereumURIs,
    authServiceURIs,
    searchURIs,
    ethereumContractTimeout = 10,
    trustAuthorityId,
    staticToken,
    noCache=false,
    noAuth=false,
    assumeV3=false,
    service="default"
  }) {
    this.utils = Utils;

    this.contentSpaceId = contentSpaceId;
    this.contentSpaceAddress = this.utils.HashToAddress(contentSpaceId);
    this.contentSpaceLibraryId = this.utils.AddressToLibraryId(this.contentSpaceAddress);
    this.contentSpaceObjectId = this.utils.AddressToObjectId(this.contentSpaceAddress);

    this.networkId = networkId;
    this.networkName = networkName;

    this.fabricVersion = fabricVersion;

    this.fabricURIs = fabricURIs;
    this.authServiceURIs = authServiceURIs;
    this.ethereumURIs = ethereumURIs;
    this.searchURIs = searchURIs;
    this.ethereumContractTimeout = ethereumContractTimeout;

    this.trustAuthorityId = trustAuthorityId;

    this.noCache = noCache;
    this.noAuth = noAuth;
    this.assumeV3 = assumeV3;

    if(!["search", "default"].includes(service)) {
      throw Error(`Invalid service: ${service}`);
    }

    this.service = service;

    this.debug = false;

    this.InitializeClients({staticToken});
  }


  /**
   * Retrieve content space info and preferred fabric and blockchain URLs from the fabric
   *
   * @methodGroup Constructor
   * @namedParams
   * @param {string} configUrl - Full URL to the config endpoint
   * @param {Array<string>} kmsUrls - List of KMS urls to use for OAuth authentication
   * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: as-east, au-east, eu-east-north, eu-west-north, na-east-north, na-east-south, na-west-north, na-west-south, eu-east-south, eu-west-south
   * @param {string=} clientIP - IP address to use in determining the region to use
   * @return {Promise<Object>} - Object containing content space ID and fabric and ethereum URLs
   */
  static async Configuration({
    configUrl,
    kmsUrls=[],
    region,
    clientIP
  }) {
    try {
      const uri = new URI(configUrl);
      uri.pathname("/config");

      if(region) {
        uri.addSearch("elvgeo", region);
      }

      if(clientIP) {
        uri.addSearch("client_ip", clientIP);
      }

      const fabricInfo = await Utils.ResponseToJson(
        HttpClient.Fetch(uri.toString())
      );

      // If any HTTPS urls present, throw away HTTP urls so only HTTPS will be used
      const filterHTTPS = uri => uri.toLowerCase().startsWith("https");

      let fabricURIs = fabricInfo.network.services.fabric_api;
      if(fabricURIs.find(filterHTTPS)) {
        fabricURIs = fabricURIs.filter(filterHTTPS);
      }

      let ethereumURIs = fabricInfo.network.services.ethereum_api;
      if(ethereumURIs.find(filterHTTPS)) {
        ethereumURIs = ethereumURIs.filter(filterHTTPS);
      }

      let authServiceURIs = fabricInfo.network.services.authority_service || [];
      if(authServiceURIs.find(filterHTTPS)) {
        authServiceURIs = authServiceURIs.filter(filterHTTPS);
      }

      const searchURIs = fabricInfo.network.services.search || [];

      const fabricVersion = Math.max(...(fabricInfo.network.api_versions || [2]));

      return {
        nodeId: fabricInfo.node_id,
        contentSpaceId: fabricInfo.qspace.id,
        networkId: (fabricInfo.qspace.ethereum || {}).network_id,
        networkName: ((fabricInfo.qspace || {}).names || [])[0],
        fabricURIs,
        ethereumURIs,
        authServiceURIs,
        kmsURIs: kmsUrls,
        searchURIs,
        fabricVersion
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
   * Create a new ElvClient for the specified network
   *
   * @methodGroup Constructor
   * @namedParams
   * @param {string} networkName - Name of the network to connect to ("main", "demo", "test)
   * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: as-east, au-east, eu-east-north, eu-west-north, na-east-north, na-east-south, na-west-north, na-west-south, eu-east-south, eu-west-south
   * @param {string=} clientIP - IP address to use in determining the region to use
   * @param {string=} trustAuthorityId - (OAuth) The ID of the trust authority to use for OAuth authentication   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {string=} staticToken - Static token that will be used for all authorization in place of normal auth
   * @param {number=} ethereumContractTimeout=10 - Number of seconds to wait for contract calls
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {Promise<ElvClient>} - New ElvClient connected to the specified content fabric and blockchain
   */
  static async FromNetworkName({
    networkName,
    region,
    clientIP,
    trustAuthorityId,
    staticToken,
    ethereumContractTimeout=10,
    noCache=false,
    noAuth=false,
    assumeV3
  }) {
    const configUrl = networks[networkName];

    if(!configUrl) { throw Error("Invalid network name: " + networkName); }

    return await this.FromConfigurationUrl({
      configUrl,
      region,
      clientIP,
      trustAuthorityId,
      staticToken,
      ethereumContractTimeout,
      noCache,
      noAuth,
      assumeV3
    });
  }

  /**
   * Create a new ElvClient from the specified configuration URL
   *
   * @methodGroup Constructor
   * @namedParams
   * @param {string} configUrl - Full URL to the config endpoint
   * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: as-east, au-east, eu-east-north, eu-west-north, na-east-north, na-east-south, na-west-north, na-west-south, eu-east-south, eu-west-south
   * @param {string=} clientIP - IP address to use in determining the region to use
   * @param {string=} trustAuthorityId - (OAuth) The ID of the trust authority to use for OAuth authentication   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {string=} staticToken - Static token that will be used for all authorization in place of normal auth
   * @param {number=} ethereumContractTimeout=10 - Number of seconds to wait for contract calls
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {Promise<ElvClient>} - New ElvClient connected to the specified content fabric and blockchain
   */
  static async FromConfigurationUrl({
    configUrl,
    region,
    clientIP,
    trustAuthorityId,
    staticToken,
    ethereumContractTimeout=10,
    noCache=false,
    noAuth=false,
    assumeV3=false
  }) {
    const {
      contentSpaceId,
      networkId,
      networkName,
      fabricURIs,
      ethereumURIs,
      authServiceURIs,
      searchURIs,
      fabricVersion
    } = await ElvClient.Configuration({
      configUrl,
      clientIP,
      region
    });

    const client = new ElvClient({
      contentSpaceId,
      networkId,
      networkName,
      fabricVersion,
      fabricURIs,
      ethereumURIs,
      authServiceURIs,
      searchURIs,
      ethereumContractTimeout,
      trustAuthorityId,
      staticToken,
      noCache,
      noAuth,
      assumeV3
    });

    client.configUrl = configUrl;

    return client;
  }

  async InitializeClients({staticToken}={}) {
    // Cached info
    this.contentTypes = {};
    this.encryptionConks = {};
    this.stateChannelAccess = {};
    this.objectTenantIds = {};
    this.objectLibraryIds = {};
    this.objectImageUrls = {};
    this.visibilityInfo = {};
    this.inaccessibleLibraries = {};

    const uris = this.service === "search" ? this.searchURIs : this.fabricURIs;
    this.HttpClient = new HttpClient({uris, debug: this.debug});
    this.AuthHttpClient = new HttpClient({uris: this.authServiceURIs, debug: this.debug});
    this.SearchHttpClient = new HttpClient({uris: this.searchURIs || [], debug: this.debug});
    this.ethClient = new EthClient({client: this, uris: this.ethereumURIs, networkId: this.networkId, debug: this.debug, timeout: this.ethereumContractTimeout});

    if(!this.signer) {
      const wallet = this.GenerateWallet();
      const signer = wallet.AddAccountFromMnemonic({mnemonic: wallet.GenerateMnemonic()});

      this.SetSigner({signer, reset: false});
      this.SetStaticToken({token: staticToken});
    }

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

    // Initialize crypto wasm
    this.Crypto = Crypto;
    this.Crypto.ElvCrypto();
  }

  ConfigUrl() {
    return this.configUrl;
  }

  SetAuth(auth) {
    this.noAuth = !auth;
    this.authClient.noAuth = !auth;
  }

  /**
   * Update fabric URLs to prefer the specified region.
   *
   * Note: Client must have been initialized with FromConfigurationUrl or FromNetworkName
   *
   * @methodGroup Nodes
   * @namedParams
   * @param {string} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: as-east, au-east, eu-east-north, eu-west-north, na-east-north, na-east-south, na-west-north, na-west-south, eu-east-south, eu-west-south
   *
   * @return {Promise<Object>} - An object containing the updated fabric, ethereum, auth service, and search URLs in order of preference
   */
  async UseRegion({region}) {
    if(!this.configUrl) {
      throw Error("Unable to change region: Configuration URL not set");
    }

    const {fabricURIs, ethereumURIs, authServiceURIs, searchURIs} = await ElvClient.Configuration({
      configUrl: this.configUrl,
      region
    });

    this.authServiceURIs = authServiceURIs;
    this.fabricURIs = fabricURIs;
    this.ethereumURIs = ethereumURIs;
    this.searchURIs = searchURIs;

    this.HttpClient.uris = fabricURIs;
    this.HttpClient.uriIndex = 0;

    this.ethClient.ethereumURIs = ethereumURIs;
    this.ethClient.ethereumURIIndex = 0;

    return {
      fabricURIs,
      ethereumURIs,
      searchURIs
    };
  }

  /**
   * Reset fabric URLs to prefer the best region auto-detected by the fabric.
   *
   * Note: Client must have been initialized with FromConfigurationUrl or FromNetworkName
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
   * Note: Client must have been initialized with FromConfigurationUrl or FromNetworkName
   *
   * @methodGroup Nodes
   *
   * @namedParams
   * @param {string} region - Region from which to retrieve the node ID
   *
   * @return {Promise<string>} - The node ID reported by the fabric
   */
  async NodeId({region}) {
    const {nodeId} = await ElvClient.Configuration({
      configUrl: this.configUrl,
      region
    });

    return nodeId;
  }

  /**
   * Retrieve the fabric, ethereum, auth service, and search nodes currently used by the client, in preference order
   *
   * @methodGroup Nodes
   *
   * @return {Promise<Object>} - An object containing the lists of fabric, ethereum, auth service, and search urls in use by the client
   */
  Nodes() {
    return {
      fabricURIs: this.fabricURIs,
      ethereumURIs: this.ethereumURIs,
      authServiceURIs: this.authServiceURIs,
      searchURIs: this.searchURIs
    };
  }

  /**
   * Set the client to use the specified fabric, ethereum, auth service, and search nodes, in preference order
   *
   * @namedParams
   * @param {Array<string>=} fabricURIs - A list of URLs for the fabric, in preference order
   * @param {Array<string>=} ethereumURIs - A list of URLs for the blockchain, in preference order
   * @param {Array<string>=} authServiceURIs - A list of URLs for the auth service, in preference order
   * @param {Array<string>=} searchURIs - A list of URLs for the search nodes, in preference order
   *
   * @methodGroup Nodes
   */
  SetNodes({fabricURIs, ethereumURIs, authServiceURIs, searchURIs}) {
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

    if(authServiceURIs) {
      this.authServiceURIs = authServiceURIs;
      this.AuthHttpClient.uris = authServiceURIs;
      this.AuthHttpClient.uriIndex = 0;
    }

    if(searchURIs) {
      this.searchURIs = searchURIs;
    }
  }

  /**
   * Return a list of nodes in the content space, optionally filtered by node ID or endpoint.
   *
   * @methodGroup Nodes
   * @namedParams
   * @param {string=} matchEndpoint - Return node(s) matching the specified endpoint
   * @param {string=} matchNodeId - Return node(s) matching the specified node ID
   *
   * @return {Promise<Array<Object>>} - A list of nodes in the space matching the parameters
   */
  async SpaceNodes({matchEndpoint, matchNodeId}={}) {
    let nodes;
    this.SetStaticToken();

    if(matchEndpoint) {
      ({nodes} = await this.utils.ResponseToJson(
        this.HttpClient.Request({
          path: UrlJoin("nodes"),
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.staticToken}`
          }
        })
      ));

      if(!nodes || !Array.isArray(nodes) || nodes.length === 0) {
        return [];
      }

      return nodes.filter(node => {
        let match = false;

        if(
          node.services &&
          node.services.fabric_api &&
          node.services.fabric_api.urls &&
          (node.services.fabric_api.urls || []).includes(matchEndpoint)
        ) {
          match = true;
        }

        if(matchNodeId && node.id === matchNodeId) {
          match = true;
        }

        return match;
      });
    } else if(matchNodeId) {
      this.SetStaticToken();
      let node = await this.utils.ResponseToJson(
        this.HttpClient.Request({
          path: UrlJoin("nodes", matchNodeId),
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.staticToken}`
          }
        })
      );

      return [node];
    }
  }

  /**
   * Return information about how the client was connected to the network
   *
   * @methodGroup Nodes
   * @returns {Object} - The name, ID and configuration URL of the network
   */
  NetworkInfo() {
    return {
      name: this.networkName,
      id: this.networkId,
      configUrl: this.configUrl
    };
  }

  WriteTokenNodeUrl({writeToken}) {
    const nodeUrl = this.HttpClient.draftURIs[writeToken];

    return nodeUrl ? nodeUrl.toString() : undefined;
  }

  RecordWriteToken({writeToken, fabricNodeUrl}) {
    this.HttpClient.RecordWriteToken(writeToken, fabricNodeUrl);
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
  SetSigner({signer, reset=true}) {
    this.staticToken = undefined;

    signer.connect(this.ethClient.Provider());
    signer.provider.pollingInterval = 500;
    this.signer = signer;

    if(reset) {
      this.InitializeClients();
    }
  }

  /**
   * Set signer using OAuth ID token
   *
   * @methodGroup Signers
   * @namedParams
   * @param {string=} idToken - OAuth ID token
   * @param {string=} authToken - Eluvio authorization token previously issued from OAuth ID token
   * @param {string=} tenantId - If specified, user will be associated with the tenant
   * @param {Object=} extraData - Additional data to pass to the login API
   * @param {Array<string>=} signerURIs - (Only if using custom OAuth) - URIs corresponding to the key server(s) to use
   * @param {boolean=} unsignedPublicAuth=false - If specified, the client will use an unsigned static token for calls that don't require authorization (reduces remote signature calls)
   */
  async SetRemoteSigner({idToken, authToken, tenantId, extraData, signerURIs, unsignedPublicAuth}) {
    const signer = new RemoteSigner({
      signerURIs: signerURIs || this.authServiceURIs,
      idToken,
      authToken,
      tenantId,
      provider: await this.ethClient.Provider(),
      extraData,
      unsignedPublicAuth
    });

    await signer.Initialize();

    this.SetSigner({signer});
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
    this.staticToken = undefined;

    let ethProvider = new Ethers.providers.Web3Provider(provider);
    ethProvider.pollingInterval = 250;
    this.signer = ethProvider.getSigner();
    this.signer.address = await this.signer.getAddress();
    await this.InitializeClients();
  }

  /**
   * Initialize a new account using the provided funding and group tokens.
   *
   * This method will redeem the tokens for the current account (or create a new one if not set) in order to
   * retrieve funds and optionally have the user added to appropriate access groups.
   *
   * @methodGroup Signers
   * @namedParams
   * @param {string} tenantId - The ID of the tenant
   * @param {string} fundingToken - A token permitting the user to retrieve funds
   * @param {number=} funds=0.5 - The amount to fund this user. The maximum amount is limited by the token issuer.
   * @param {string=} groupToken - A token permitting the user to be added to access groups
   *
   * @return {string} - The address of the user
   */
  async CreateAccount({tenantId, fundingToken, funds=0.5, groupToken}) {
    if(!this.signer) {
      const wallet = this.GenerateWallet();
      const signer = wallet.AddAccountFromMnemonic({mnemonic: wallet.GenerateMnemonic()});

      this.SetSigner({signer});
    }

    await this.authClient.MakeKMSRequest({
      method: "POST",
      path: `/ks/otp/fnd/${tenantId}`,
      body: {
        toAddr: this.signer.address,
        amtStr: this.utils.EtherToWei(funds)
      },
      headers: {
        Authorization: `Bearer ${fundingToken}`
      }
    });

    await this.userProfileClient.CreateWallet();

    await this.userProfileClient.ReplaceUserMetadata({
      metadataSubtree: "tenantContractId",
      metadata: tenantId
    });

    if(groupToken) {
      await this.authClient.MakeKMSRequest({
        method: "POST",
        path: `/ks/otp/grp/${tenantId}`,
        body: {
          addAddr: this.signer.address,
        },
        headers: {
          Authorization: `Bearer ${groupToken}`
        }
      });
    }

    return this.utils.FormatAddress(this.signer.address);
  }

  /*
    TOKEN                  211b  PREFIX + BODY | aplsjcJf1HYcDDUuCdXcSZtU86nYK162YmYJeuqwMczEBJVkD5D5EvsBvVwYDRsf4hzDvBWMoe9piBpqx...
    PREFIX                   6b  aplsjc | apl=plain s=ES256K jc=json-compressed
    BODY                   205b  base58(SIGNATURE + PAYLOAD)
    SIGNATURE + PAYLOAD    151b  151b * 138 / 100 + 1 = 209b (>= 205b)
    SIGNATURE               66b  ES256K_Di9Lu83mz4wMoehCEeQhKpJJ7ApmDZLumAa2Cge48F6EHYnbn8msATGGpjucScwimei1TWGd7aeyQY45AdXd5tT1Z
    PAYLOAD                 85b  json-compressed
    json                    79b  {"adr":"VVf4DQU357tDnZGYQeDrntRJ5rs=","spc":"ispc3ANoVSzNA3P6t7abLR69ho5YPPZU"}
   */

  async PersonalSign({
    message,
    addEthereumPrefix,
    Sign
  }) {
    if(!Sign) {
      Sign = async message => this.authClient.Sign(message);
    }

    if(addEthereumPrefix) {
      message = Ethers.utils.keccak256(Buffer.from(`\x19Ethereum Signed Message:\n${message.length}${message}`, "utf-8"));
    }

    return await Sign(message);
  }

  /**
   * Create a signed authorization token that can be used to authorize against the fabric
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {number} duration=86400000 - Time until the token expires, in milliseconds (1 hour = 60 * 60 * 1000 = 3600000). Default is 24 hours.
   * @param {Object=} spec - Additional attributes for this token
   * @param {string=} address - Address of the signing account - if not specified, the current signer address will be used.
   * @param {function=} Sign - If specified, this function will be used to produce the signature instead of the client's current signer
   * @param {boolean=} addEthereumPrefix=true - If specified, the 'Ethereum Signed Message' prefixed hash format will be performed. Disable this if the provided Sign method already does this (e.g. Metamask)
   */
  async CreateFabricToken({
    duration=24 * 60 * 60 * 1000,
    spec={},
    address,
    Sign,
    addEthereumPrefix=true,
    context={}
  }={}) {
    address = address || this.CurrentAccountAddress();

    let token = {
      ...spec,
      sub:`iusr${Utils.AddressToHash(address)}`,
      adr: Buffer.from(address.replace(/^0x/, ""), "hex").toString("base64"),
      spc: await this.ContentSpaceId(),
      iat: Date.now(),
      exp: Date.now() + duration,
      ctx: context
    };

    let message = `Eluvio Content Fabric Access Token 1.0\n${JSON.stringify(token)}`;

    const signature = await this.PersonalSign({message, addEthereumPrefix, Sign});

    const compressedToken = Pako.deflateRaw(Buffer.from(JSON.stringify(token), "utf-8"));
    return `acspjc${this.utils.B58(
      Buffer.concat([
        Buffer.from(signature.replace(/^0x/, ""), "hex"),
        Buffer.from(compressedToken)
      ])
    )}`;
  }


  /**
   * Issue a self-signed authorization token
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string=} libraryId - Library ID to authorize
   * @param {string=} objectId - Object ID to authorize
   * @param {string=} versionHash - Version hash to authorize
   * @param {string=} policyId - The object ID of the policy for this token
   * @param {string=} subject - The subject of the token
   * @param {string} grantType=read - Permissions to grant for this token. Options: "access", "read", "create", "update", "read-crypt"
   * @param {number} duration - Time until the token expires, in milliseconds (1 hour = 60 * 60 * 1000 = 3600000)
   * @param {boolean} allowDecryption=false - If specified, the re-encryption key will be included in the token,
   * enabling the user of this token to download encrypted content from the specified object
   * @param {Object=} context - Additional JSON context
   */
  async CreateSignedToken({
    libraryId,
    objectId,
    versionHash,
    policyId,
    subject,
    grantType="read",
    allowDecryption=false,
    duration,
    context={}
  }) {
    if(!subject) {
      subject = `iusr${this.utils.AddressToHash(await this.CurrentAccountAddress())}`;
    }

    if(policyId) {
      context["elv:delegation-id"] = policyId;
    }

    let token = {
      adr: Buffer.from(await this.CurrentAccountAddress().replace(/^0x/, ""), "hex").toString("base64"),
      sub: subject,
      spc: await this.ContentSpaceId(),
      iat: Date.now(),
      exp: Date.now() + duration,
      gra: grantType,
      ctx: context
    };

    if(versionHash) {
      objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    }

    if(objectId) {
      token.qid = objectId;

      if(!libraryId) {
        libraryId = await this.ContentObjectLibraryId({objectId});
      }
    }

    if(libraryId) {
      token.lib = libraryId;
    }

    if(allowDecryption) {
      const cap = await this.authClient.ReEncryptionConk({libraryId, objectId});
      token.apk = cap.public_key;
    }

    const compressedToken = Pako.deflateRaw(Buffer.from(JSON.stringify(token), "utf-8"));
    const signature = await this.authClient.Sign(Ethers.utils.keccak256(compressedToken));

    return `aessjc${this.utils.B58(Buffer.concat([
      Buffer.from(signature.replace(/^0x/, ""), "hex"), 
      Buffer.from(compressedToken)
    ]))}`;
  }


  /**
   * Build a signed message (JSON) using the current signer.
   * Signed messages have a similar format to signed access tokens and they include the message itself
   * such that they can be both verified and decoded by the receiving entity.
   *
   * Messages can be encoded and signed using different methods, and the encoding and signature types
   * are described in the header of the resulting signed message blob.
   *
   * Note this type of message can not be verified and decoded on chain.
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} messasge - A JSON object representing the message to sign
   */
  async CreateSignedMessageJSON({
    message
  }) {

    // Only one kind of signature supported currently
    const type = "mje_"; // JSON message, EIP192 signature

    const msg = JSON.stringify(message);
    const signature = await this.PersonalSign({message: msg, addEthereumPrefix: true});
    return `${type}${Utils.B58(
      Buffer.concat([
        Buffer.from(signature.replace(/^0x/, ""), "hex"),
        Buffer.from(msg)
      ])
    )}`;
  }

  /**
   * Verify and decode a signed message (JSON).
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} signedMessage - a signed message as created by CreateSignedMessageJSON
   * @returns {Promise<Object>} - The decoded message, signer address, signature and signature type
   */
  async DecodeSignedMessageJSON({
    signedMessage
  })  {
    const type = signedMessage.slice(0,4);
    switch(type) {
      case "mje_":
        const msgBytes = Utils.FromB58(signedMessage.slice(4));
        const signature = msgBytes.slice(0, 65);
        const msg = msgBytes.slice(65);
        const obj = JSON.parse(msg);

        const prefixedMsgHash = Ethers.utils.keccak256(Buffer.from(`\x19Ethereum Signed Message:\n${msg.length}${msg}`, "utf-8"));
        const signerAddr = Ethers.utils.recoverAddress(prefixedMsgHash, signature);

        return {
          type: type,
          message: obj,
          signerAddress: signerAddr,
          signature: "0x" + signature.toString("hex")
        };
      default:
        throw new Error(`Bad message type: ${type}`);
    }
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
   * Set the OAuth token for use in state channel calls
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} token - The OAuth ID token
   */
  async SetOauthToken({token}) {
    this.oauthToken = token;

    const wallet = this.GenerateWallet();
    const signer = wallet.AddAccountFromMnemonic({mnemonic: wallet.GenerateMnemonic()});

    this.SetSigner({signer});
  }

  /**
   * Set the signer for this client via OAuth token. The client will exchange the given token
   * for the user's private key using the KMS specified in the configuration.
   *
   * NOTE: The KMS URL(s) must be set in the initial configuration of the client (FromConfigurationUrl or FromNetworkName)
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} token - The OAuth ID
   */
  async SetSignerFromOauthToken({token}) {
    if(!this.trustAuthorityId) {
      throw Error("Unable to authorize with OAuth token: No trust authority ID set");
    }

    const wallet = this.GenerateWallet();

    try {
      if(!this.kmsURIs) {
        // Make dummy client with dummy account to allow calling of contracts
        const client = await ElvClient.FromConfigurationUrl({configUrl: this.configUrl});
        client.SetSigner({
          signer: wallet.AddAccountFromMnemonic({mnemonic: wallet.GenerateMnemonic()})
        });

        const {urls} = await client.authClient.KMSInfo({
          kmsId: this.trustAuthorityId
        });

        if(!urls || urls.length === 0) {
          throw Error("Unable to authorize with OAuth token: No KMS URLs set");
        }

        this.kmsURIs = urls;
      }

      this.oauthToken = token;

      const path = "/ks/jwt/wlt";
      const httpClient = new HttpClient({uris: this.kmsURIs, debug: this.debug});

      const response = await this.utils.ResponseToJson(
        httpClient.Request({
          headers: {Authorization: `Bearer ${token}`},
          method: "PUT",
          path,
          forceFailover: true
        })
      );

      const privateKey = response["UserSKHex"];

      this.SetSigner({signer: wallet.AddAccount({privateKey})});

      // Ensure wallet is initialized
      await this.userProfileClient.WalletAddress();
    } catch(error) {
      this.Log("Failed to set signer from OAuth token:", true);
      this.Log(error, true);

      await this.ClearSigner();

      throw error;
    }
  }

  /**
   * Set a static token for the client to use for all authorization
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string=} token - The static token to use. If not provided, the default static token will be set.
   */
  SetStaticToken({token}={}) {
    if(!token) {
      token = this.utils.B64(JSON.stringify({qspace_id: this.contentSpaceId}));
    }

    this.staticToken = token;
  }

  /**
   * Clear the set static token for the client
   */
  ClearStaticToken() {
    this.staticToken = undefined;
  }

  /**
   * Authorize the client against the specified policy.
   *
   * NOTE: After authorizing, the client will only be able to access content allowed by the policy
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} objectId - The ID of the policy object
   */
  async SetPolicyAuthorization({objectId}) {
    this.SetStaticToken({
      token: await this.GenerateStateChannelToken({objectId})
    });
  }

  /**
   * Create a signature for the specified string
   *
   * @param {string} string - The string to sign
   * @return {Promise<string>} - The signed string
   */
  async Sign(string) {
    const signature = await this.authClient.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(string)));
    return this.utils.FormatSignature(signature);
  }

  /**
   * Encrypt the given string or object with the current signer's public key
   *
   * @namedParams
   * @param {string | Object} message - The string or object to encrypt
   * @param {string=} publicKey - If specified, message will be encrypted with this public key instead of the current user's
   *
   * @return {Promise<string>} - The encrypted message
   */
  async EncryptECIES({message, publicKey}) {
    if(!this.signer) {
      throw "Signer not set";
    }

    ValidatePresence("message", message);

    return await this.Crypto.EncryptConk(message, publicKey || this.signer._signingKey().publicKey);
  }

  /**
   * Decrypt the given encrypted message with the current signer's private key
   *
   * @namedParams
   * @param {string} message - The message to decrypt
   *
   * @return {Promise<string | Object>} - The decrypted string or object
   */
  async DecryptECIES({message}) {
    if(!this.signer) {
      throw "Signer not set";
    }

    ValidatePresence("message", message);

    return await this.Crypto.DecryptCap(message, this.signer._signingKey().privateKey);
  }

  /**
   * Request the specified URL with the given method and body, and return the result in the specified format
   *
   * @param {string} url - URL to request
   * @param {string=} format="json" - Format of response
   * @param {string=} method="GET" - Request method
   * @param {object=} body - Request body
   * @param {object=} headers - Request headers
   *
   * @return {Promise<*>} - Response in the specified format
   */
  async Request({url, format="json", method="GET", headers = {}, body}) {
    return this.utils.ResponseToFormat(
      format,
      HttpClient.Fetch(
        url,
        {
          method,
          headers,
          body
        }
      )
    );
  }

  async MakeAuthServiceRequest({kmsId, objectId, versionHash, method="GET", path, bodyType, body={}, queryParams={}, headers}) {
    return this.authClient.MakeAuthServiceRequest({kmsId, objectId, versionHash, method, path, bodyType, body, queryParams, headers});
  }

  /* FrameClient related */

  // Whitelist of methods allowed to be called using the frame API
  FrameAllowedMethods() {
    const forbiddenMethods = [
      "constructor",
      "AccessGroupMembershipMethod",
      "CallFromFrameMessage",
      "ClearSigner",
      "CreateAccount",
      "EnableMethodLogging",
      "FormatBlockNumbers",
      "FrameAllowedMethods",
      "FromConfigurationUrl",
      "GenerateWallet",
      "InitializeClients",
      "Log",
      "PersonalSign",
      "SetRemoteSigner",
      "SetSigner",
      "SetSignerFromWeb3Provider",
      "Sign",
      "ToggleLogging"
    ];

    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(method => typeof this[method] === "function" && !forbiddenMethods.includes(method));
  }

  // Call a method specified in a message from a frame
  async CallFromFrameMessage(message, Respond) {
    if(message.type !== "ElvFrameRequest") {
      return;
    }

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
      if(message.module === "walletClient") {
        if(!this.walletClient) {
          throw Error("Wallet client not set");
        }

        if(this.walletClient.ForbiddenMethods().includes(method)) {
          throw Error("Invalid user profile method: " + method);
        }

        methodResults = await this.walletClient[method](message.args);
      } else if(message.module === "userProfileClient") {
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

Object.assign(ElvClient.prototype, require("./client/AccessGroups"));
Object.assign(ElvClient.prototype, require("./client/ContentAccess"));
Object.assign(ElvClient.prototype, require("./client/Contracts"));
Object.assign(ElvClient.prototype, require("./client/Files"));
Object.assign(ElvClient.prototype, require("./client/ABRPublishing"));
Object.assign(ElvClient.prototype, require("./client/LiveStream"));
Object.assign(ElvClient.prototype, require("./client/ContentManagement"));
Object.assign(ElvClient.prototype, require("./client/NTP"));
Object.assign(ElvClient.prototype, require("./client/NFT"));

exports.ElvClient = ElvClient;
