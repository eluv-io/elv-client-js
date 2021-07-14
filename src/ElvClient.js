if(typeof Buffer === "undefined") {
  Buffer = require("buffer/").Buffer;
}

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

if(Utils.Platform() === Utils.PLATFORM_NODE) {
  // Define Response in node
  // eslint-disable-next-line no-global-assign
  global.Response = (require("node-fetch")).Response;
}

/**
 * See the Modules section on the sidebar for details about methods related to interacting with the Fabric.
 *
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
        Ethereum URLs: [\\n\\t\\t${this.ethereumURIs.join(", \n\t\t")}\\n\\t]
        Auth Service URLs: [\\n\\t\\t${this.authServiceURIs.join(", \n\t\t")}\\n\\t]
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
   * NOTE: It is highly recommended to use ElvClient.FromConfiguration to
   * automatically import the client settings from the fabric
   *
   * @constructor
   *
   * @namedParams
   * @param {string} contentSpaceId - ID of the content space
   * @param {string} contentSpaceId - ID of the blockchain network
   * @param {number} fabricVersion - The version of the target content fabric
   * @param {Array<string>} fabricURIs - A list of full URIs to content fabric nodes
   * @param {Array<string>} ethereumURIs - A list of full URIs to ethereum nodes
   * @param {Array<string>} ethereumURIs - A list of full URIs to auth service endpoints
   * @param {number=} ethereumContractTimeout=10 - Number of seconds to wait for contract calls
   * @param {string=} trustAuthorityId - (OAuth) The ID of the trust authority to use for OAuth authentication
   * @param {string=} staticToken - Static token that will be used for all authorization in place of normal auth
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  constructor({
    contentSpaceId,
    networkId,
    fabricVersion,
    fabricURIs,
    ethereumURIs,
    authServiceURIs,
    ethereumContractTimeout = 10,
    trustAuthorityId,
    staticToken,
    noCache=false,
    noAuth=false
  }) {
    this.utils = Utils;

    this.contentSpaceId = contentSpaceId;
    this.contentSpaceAddress = this.utils.HashToAddress(contentSpaceId);
    this.contentSpaceLibraryId = this.utils.AddressToLibraryId(this.contentSpaceAddress);
    this.contentSpaceObjectId = this.utils.AddressToObjectId(this.contentSpaceAddress);

    this.networkId = networkId;

    this.fabricVersion = fabricVersion;

    this.fabricURIs = fabricURIs;
    this.authServiceURIs = authServiceURIs;
    this.ethereumURIs = ethereumURIs;
    this.ethereumContractTimeout = ethereumContractTimeout;

    this.trustAuthorityId = trustAuthorityId;

    this.noCache = noCache;
    this.noAuth = noAuth;

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
   * - Available regions: as-east au-east eu-east-north eu-west-north na-east-north na-east-south na-west-north na-west-south eu-east-south eu-west-south
   *
   * @return {Promise<Object>} - Object containing content space ID and fabric and ethereum URLs
   */
  static async Configuration({
    configUrl,
    kmsUrls=[],
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

      const fabricVersion = Math.max(...(fabricInfo.network.api_versions || [2]));

      return {
        nodeId: fabricInfo.node_id,
        contentSpaceId: fabricInfo.qspace.id,
        networkId: (fabricInfo.qspace.ethereum || {}).network_id,
        fabricURIs,
        ethereumURIs,
        authServiceURIs,
        kmsURIs: kmsUrls,
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
   * Create a new ElvClient from the specified configuration URL
   *
   * @methodGroup Constructor
   * @namedParams
   * @param {string} configUrl - Full URL to the config endpoint
   * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: as-east au-east eu-east-north eu-west-north na-east-north na-east-south na-west-north na-west-south eu-east-south eu-west-south
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
    trustAuthorityId,
    staticToken,
    ethereumContractTimeout=10,
    noCache=false,
    noAuth=false
  }) {
    const {
      contentSpaceId,
      networkId,
      fabricURIs,
      ethereumURIs,
      authServiceURIs,
      fabricVersion
    } = await ElvClient.Configuration({
      configUrl,
      region
    });

    const client = new ElvClient({
      contentSpaceId,
      networkId,
      fabricVersion,
      fabricURIs,
      ethereumURIs,
      authServiceURIs,
      ethereumContractTimeout,
      trustAuthorityId,
      staticToken,
      noCache,
      noAuth
    });

    client.configUrl = configUrl;

    return client;
  }

  async InitializeClients({staticToken}={}) {
    // Cached info
    this.contentTypes = {};
    this.encryptionConks = {};
    this.stateChannelAccess = {};
    this.objectLibraryIds = {};
    this.objectImageUrls = {};
    this.visibilityInfo = {};
    this.inaccessibleLibraries = {};

    this.HttpClient = new HttpClient({uris: this.fabricURIs, debug: this.debug});
    this.AuthHttpClient = new HttpClient({uris: this.authServiceURIs, debug: this.debug});
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

    /*
    // Test each eth url
    const workingEthURIs = (await Promise.all(
      this.ethereumURIs.map(async (uri) => {
        try {
          const response = await Promise.race([
            HttpClient.Fetch(
              uri,
              {
                method: "post",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({method: "net_version", params: [], id: 1, jsonrpc: "2.0"})
              }
            ),
            new Promise(resolve => setTimeout(() => resolve({ok: false}), 5000))
          ]);

          if(response.ok) {
            return uri;
          }

          // eslint-disable-next-line no-console
          this.Log("Eth node unavailable: " + uri, true);
        } catch(error) {
          // eslint-disable-next-line no-console
          this.Log("Eth node unavailable: " + uri, true);
          // eslint-disable-next-line no-console
          this.Log(error, true);
        }
      })
    )).filter(uri => uri);

    // If any eth urls are bad, discard them
    if(workingEthURIs.length !== this.ethereumURIs.length) {
      this.ethereumURIs = workingEthURIs;
      this.ethClient.SetEthereumURIs(workingEthURIs);
    }

     */
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
   * Note: Client must have been initialized with FromConfiguration
   *
   * @methodGroup Nodes
   * @namedParams
   * @param {string} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: as-east au-east eu-east-north eu-west-north na-east-north na-east-south na-west-north na-west-south eu-east-south eu-west-south
   *
   * @return {Promise<Object>} - An object containing the updated fabric and ethereum URLs in order of preference
   */
  async UseRegion({region}) {
    if(!this.configUrl) {
      throw Error("Unable to change region: Configuration URL not set");
    }

    const {fabricURIs, ethereumURIs, authServiceURIs} = await ElvClient.Configuration({
      configUrl: this.configUrl,
      region
    });

    this.authServiceURIs = authServiceURIs;
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
    const {nodeId} = await ElvClient.Configuration({
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
      ethereumURIs: this.ethereumURIs,
      authServiceURIs: this.authServiceURIs
    };
  }

  /**
   * Set the client to use the specified fabric and ethereum nodes, in preference order
   *
   * @namedParams
   * @param {Array<string>=} fabricURIs - A list of URLs for the fabric, in preference order
   * @param {Array<string>=} ethereumURIs - A list of URLs for the blockchain, in preference order
   * @param {Array<string>=} authServiceURIs - A list of URLs for the auth service, in preference order
   *
   * @methodGroup Nodes
   */
  SetNodes({fabricURIs, ethereumURIs, authServiceURIs}) {
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
   * @param {string} token - OAuth ID token
   */
  async SetRemoteSigner({token}) {
    const signer = new RemoteSigner({
      rpcUris: this.authServiceURIs,
      idToken: token,
      provider: this.ethClient.provider
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
   * @param {number} duration - Time until the token expires, in milliseconds (1 hour = 60 * 60 * 1000)
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
   * NOTE: The KMS URL(s) must be set in the initial configuration of the client (FromConfigurationUrl)
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

    return await this.Crypto.EncryptConk(message, publicKey || this.signer.signingKey.keyPair.publicKey);
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

    return await this.Crypto.DecryptCap(message, this.signer.signingKey.privateKey);
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



  async MintNFT({tenantId, email, collectionId, requestBody={}}) {
    const accountInitializationBody = {
      ts: Date.now(),
      email
    };

    const accountInitializationSignature = await this.Sign(
      JSON.stringify(accountInitializationBody)
    );

    const { addr } = await this.utils.ResponseToJson(
      await this.authClient.MakeAuthServiceRequest({
        method: "POST",
        path: `/as/tnt/prov/eth/${tenantId}`,
        body: accountInitializationBody,
        headers: {
          "Authorization": `Bearer ${accountInitializationSignature}`
        }
      })
    );

    requestBody.email = email;
    requestBody.extra = {
      ...(requestBody.extra || {}),
      elv_addr: addr
    };
    requestBody.ts = Date.now();

    const mintSignature = await this.Sign(
      JSON.stringify(requestBody)
    );

    await this.authClient.MakeAuthServiceRequest({
      method: "POST",
      path: `/as/otp/webhook/base/${tenantId}/${collectionId}`,
      body: requestBody,
      headers: {
        "Authorization": `Bearer ${mintSignature}`
      }
    });

    return {
      address: addr
    };
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

Object.assign(ElvClient.prototype, require("./client/AccessGroups"));
Object.assign(ElvClient.prototype, require("./client/ContentAccess"));
Object.assign(ElvClient.prototype, require("./client/Contracts"));
Object.assign(ElvClient.prototype, require("./client/Files"));
Object.assign(ElvClient.prototype, require("./client/ABRPublishing"));
Object.assign(ElvClient.prototype, require("./client/ContentManagement"));
Object.assign(ElvClient.prototype, require("./client/NTP"));

exports.ElvClient = ElvClient;
