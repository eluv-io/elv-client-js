if(typeof Buffer === "undefined") { Buffer = require("buffer/").Buffer; }

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

const {
  ValidateObject,
  ValidatePresence
} = require("./Validation");

if(Utils.Platform() === Utils.PLATFORM_NODE) {
  // Define Response in node
  // eslint-disable-next-line no-global-assign
  global.Response = (require("node-fetch")).Response;
} else if(Utils.Platform() === Utils.PLATFORM_REACT_NATIVE) {
  // React native polyfill
  require("unorm");
}

/**
 * See the Modules section on the sidebar for details about methods related to interacting with the Fabric.
 *
 */
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
   * NOTE: It is highly recommended to use ElvClient.FromConfiguration to
   * automatically import the client settings from the fabric
   *
   * @constructor
   *
   * @namedParams
   * @param {string} contentSpaceId - ID of the content space
   * @param {number} fabricVersion - The version of the target content fabric
   * @param {Array<string>} fabricURIs - A list of full URIs to content fabric nodes
   * @param {Array<string>} ethereumURIs - A list of full URIs to ethereum nodes
   * @param {string=} trustAuthorityId - (OAuth) The ID of the trust authority to use for OAuth authentication
   * @param {string=} staticToken - Static token that will be used for all authorization in place of normal auth
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  constructor({
    contentSpaceId,
    fabricVersion,
    fabricURIs,
    ethereumURIs,
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

    this.fabricVersion = fabricVersion;

    this.fabricURIs = fabricURIs;
    this.ethereumURIs = ethereumURIs;

    this.trustAuthorityId = trustAuthorityId;
    this.staticToken = staticToken;

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
   * @param {Array<string>} kmsUrls - List of KMS urls to use for OAuth authentication
   * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: na-west-north, na-west-south, na-east, eu-west, eu-east, as-east, au-east
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

      let fabricURIs = fabricInfo.network.seed_nodes.fabric_api;
      if(fabricURIs.find(filterHTTPS)) {
        fabricURIs = fabricURIs.filter(filterHTTPS);
      }

      let ethereumURIs = fabricInfo.network.seed_nodes.ethereum_api;
      if(ethereumURIs.find(filterHTTPS)) {
        ethereumURIs = ethereumURIs.filter(filterHTTPS);
      }

      // Test each eth url
      ethereumURIs = (await Promise.all(
        ethereumURIs.map(async (uri) => {
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
            console.error("Eth node unavailable: " + uri);
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error("Eth node unavailable: " + uri);
            // eslint-disable-next-line no-console
            console.error(error);
          }
        })
      )).filter(uri => uri);

      const fabricVersion = Math.max(...(fabricInfo.network.api_versions || [2]));

      return {
        nodeId: fabricInfo.node_id,
        contentSpaceId: fabricInfo.qspace.id,
        fabricURIs,
        ethereumURIs,
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
   * - Available regions: na-west-north, na-west-south, na-east, eu-west, eu-east, as-east, au-east
   * @param {string=} trustAuthorityId - (OAuth) The ID of the trust authority to use for OAuth authentication   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {string=} staticToken - Static token that will be used for all authorization in place of normal auth
   *
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {Promise<ElvClient>} - New ElvClient connected to the specified content fabric and blockchain
   */
  static async FromConfigurationUrl({
    configUrl,
    region,
    trustAuthorityId,
    staticToken,
    noCache=false,
    noAuth=false
  }) {
    const {
      contentSpaceId,
      fabricURIs,
      ethereumURIs,
      fabricVersion
    } = await ElvClient.Configuration({
      configUrl,
      region
    });

    const client = new ElvClient({
      contentSpaceId,
      fabricVersion,
      fabricURIs,
      ethereumURIs,
      trustAuthorityId,
      staticToken,
      noCache,
      noAuth
    });

    client.configUrl = configUrl;

    return client;
  }

  InitializeClients() {
    // Cached info
    this.contentTypes = {};
    this.encryptionConks = {};
    this.reencryptionConks = {};
    this.stateChannelAccess = {};
    this.objectLibraryIds = {};
    this.objectImageUrls = {};
    this.visibilityInfo = {};

    this.HttpClient = new HttpClient({uris: this.fabricURIs, debug: this.debug});
    this.ethClient = new EthClient({client: this, uris: this.ethereumURIs, debug: this.debug});

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
   * Note: Client must have been initialized with FromConfiguration
   *
   * @methodGroup Nodes
   * @namedParams
   * @param {string} region - Preferred region - the fabric will auto-detect the best region if not specified
   * - Available regions: na-west-north, na-west-south, na-east, eu-west, eu-east, as-east, au-east
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
   * Set the OAuth token for use in state channel calls
   *
   * @methodGroup Authorization
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
   * Redeem the specified code to authorize the client
   *
   * @methodGroup Authorization
   * @param {string} issuer - Issuer to authorize against
   * @param {string} code - Access code
   * @param {string=} email - Email address associated with the code
   *
   * @return {Promise<Object>} - Identifying address, list of accessible sites, and additional info about the authorized user
   */
  async RedeemCode({issuer, code, email}) {
    const wallet = this.GenerateWallet();
    if(!this.signer) {
      this.SetSigner({
        signer: wallet.AddAccountFromMnemonic({mnemonic: wallet.GenerateMnemonic()})
      });
    }

    if(issuer.startsWith("iq__")) {
      ValidateObject(issuer);
    } else if(!issuer.replace(/^\//, "").startsWith("otp/ntp/iten")) {
      throw Error("Invalid issuer: " + issuer);
    } else {
      // Ticket API

      try {
        const token = await this.authClient.GenerateChannelContentToken({
          issuer,
          code,
          email
        });

        this.staticToken = token;

        return JSON.parse(Utils.FromB64(token)).qid;
      } catch(error) {
        this.Log("Failed to redeem code:", true);
        this.Log(error, true);

        throw error;

        /*
        if((error.body || "").toString().includes("exceed configured maximum")) {
          throw Error("Code exceeded maximum number of uses");
        } else {
          throw Error("Invalid code");
        }
        */
      }
    }

    // Site selector

    const objectId = issuer;
    const libraryId = await this.ContentObjectLibraryId({objectId});

    const Hash = (code) => {
      const chars = code.split("").map(code => code.charCodeAt(0));
      return chars.reduce((sum, char, i) => (chars[i + 1] ? (sum * 2) + char * chars[i+1] * (i + 1) : sum + char), 0).toString();
    };

    const codeHash = Hash(code);
    const codeInfo = await this.ContentObjectMetadata({libraryId, objectId, metadataSubtree: `public/codes/${codeHash}`});

    if(!codeInfo){
      this.Log(`Code redemption failed:\n\t${issuer}\n\t${code}`);
      throw Error("Invalid code: " + code);
    }

    const { ak, sites, info } = codeInfo;

    const signer = await wallet.AddAccountFromEncryptedPK({
      encryptedPrivateKey: this.utils.FromB64(ak),
      password: code
    });

    this.SetSigner({signer});

    // Ensure wallet is initialized
    await this.userProfileClient.WalletAddress();

    return {
      addr: this.utils.FormatAddress(signer.address),
      sites,
      info: info || {}
    };
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

    return await this.Crypto.DecryptCap(message, publicKey || this.signer.signingKey.privateKey);
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
  Request({url, format="json", method="GET", headers={}, body}) {
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
      .filter(method => typeof this[method] === "function" && !forbiddenMethods.includes(method));
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

Object.assign(ElvClient.prototype, require("./client/AccessGroups"));
Object.assign(ElvClient.prototype, require("./client/ContentAccess"));
Object.assign(ElvClient.prototype, require("./client/Contracts"));
Object.assign(ElvClient.prototype, require("./client/Files"));
Object.assign(ElvClient.prototype, require("./client/ABRPublishing"));
Object.assign(ElvClient.prototype, require("./client/ContentManagement"));

exports.ElvClient = ElvClient;
