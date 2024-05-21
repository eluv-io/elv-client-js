const {ElvClient} = require("../ElvClient");
const Configuration = require("./Configuration");
const {LinkTargetHash, FormatNFT, ActionPopup} = require("./Utils");
const HTTPClient = require("../HttpClient");
const UrlJoin = require("url-join");
const Utils = require("../Utils");
const Ethers = require("ethers");

const inBrowser = typeof window !== "undefined";
const embedded = inBrowser && window.top !== window.self;

let localStorageAvailable = false;
try {
  typeof localStorage !== "undefined" && localStorage.getItem("test");
  localStorageAvailable = true;
// eslint-disable-next-line no-empty
} catch(error) {}

/**
 * Use the <a href="#.Initialize">Initialize</a> method to initialize a new client.
 *
 *
 * See the Modules section on the sidebar for all client methods unrelated to login and authorization
 */
class ElvWalletClient {
  constructor({appId, client, network, mode, localization, marketplaceInfo, previewMarketplaceHash, storeAuthToken}) {
    this.appId = appId;

    this.client = client;
    this.loggedIn = false;

    this.localization = localization;

    this.network = network;
    this.mode = mode;
    this.purchaseMode = Configuration[network][mode].purchaseMode;
    this.mainSiteLibraryId = Configuration[network][mode].siteLibraryId;
    this.mainSiteId = Configuration[network][mode].siteId;
    this.appUrl = Configuration[network][mode].appUrl;
    this.publicStaticToken = client.staticToken;
    this.storeAuthToken = storeAuthToken;

    this.selectedMarketplaceInfo = marketplaceInfo;
    this.previewMarketplaceId = previewMarketplaceHash ? Utils.DecodeVersionHash(previewMarketplaceHash).objectId : undefined;
    this.previewMarketplaceHash = previewMarketplaceHash;

    this.availableMarketplaces = {};
    this.availableMarketplacesById = {};
    this.marketplaceHashes = {};
    this.tenantConfigs = {};

    this.stateStoreUrls = Configuration[network].stateStoreUrls;
    this.stateStoreClient = new HTTPClient({uris: this.stateStoreUrls});
    this.badgerAddress = Configuration[network].badgerAddress;

    // Caches
    this.cachedMarketplaces = {};
    this.cachedCSS = {};

    this.utils = client.utils;

    this.ForbiddenMethods = ElvWalletClient.ForbiddenMethods;
  }

  Log(message, error=false, errorObject) {
    if(error) {
      // eslint-disable-next-line no-console
      console.error("Eluvio Wallet Client:", message);
    } else {
      // eslint-disable-next-line no-console
      console.log("Eluvio Wallet Client:", message);
    }

    if(errorObject) {
      // eslint-disable-next-line no-console
      console.error(errorObject);
    }
  }

  // Methods forbidden from usage by FrameClient
  static ForbiddenMethods() {
    return [
      "constructor",
      "Authenticate",
      "AuthenticateOAuth",
      "AuthenticateExternalWallet",
      "AuthToken",
      "ClientAuthToken",
      "Initialize",
      "Log",
      "LogIn",
      "LogOut",
      "PersonalSign",
      "SetAuthorization",
      "SignMetamask"
    ];
  }

  // Used to generate AllowedWalletClientMethods for FrameClient
  // Note: Do not import ElvWalletClient in FrameClient directly
  static AllowedMethods() {
    return Object.getOwnPropertyNames(ElvWalletClient.prototype)
      .filter(methodName => !ElvWalletClient.ForbiddenMethods().includes(methodName))
      .sort();
  }

  /**
   * Initialize the wallet client.
   *
   * Specify tenantSlug and marketplaceSlug to automatically associate this tenant with a particular marketplace.
   *
   *
   * @methodGroup Initialization
   * @namedParams
   * @param {string} appId - A string identifying your app. This is used for namespacing user profile data.
   * @param {string} network=main - Name of the Fabric network to use (`main`, `demo`)
   * @param {string} mode=production - Environment to use (`production`, `staging`)
   * @param {Object=} marketplaceParams - Marketplace parameters
   * @param {boolean=} storeAuthToken=true - If specified, auth tokens will be stored in localstorage (if available)
   * @param {Object=} client - Existing instance of ElvClient to use instead of initializing a new one
   *
   * @returns {Promise<ElvWalletClient>}
   */
  static async Initialize({
    client,
    appId="general",
    network="main",
    mode="production",
    localization,
    marketplaceParams,
    previewMarketplaceId,
    storeAuthToken=true,
    skipMarketplaceLoad=false
  }) {
    let { tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash } = (marketplaceParams || {});

    if(!Configuration[network]) {
      throw Error(`ElvWalletClient: Invalid network ${network}`);
    } else if(!Configuration[network][mode]) {
      throw Error(`ElvWalletClient: Invalid mode ${mode}`);
    }

    if(!client) {
      client = await ElvClient.FromNetworkName({networkName: network, assumeV3: true});
    }

    let previewMarketplaceHash = previewMarketplaceId;
    if(previewMarketplaceHash && !previewMarketplaceHash.startsWith("hq__")) {
      previewMarketplaceHash = await client.LatestVersionHash({objectId: previewMarketplaceId});
    }

    const walletClient = new ElvWalletClient({
      appId,
      client,
      network,
      mode,
      localization,
      marketplaceInfo: {
        tenantSlug,
        marketplaceSlug,
        marketplaceId: marketplaceHash ? client.utils.DecodeVersionHash(marketplaceHash).objectId : marketplaceId,
        marketplaceHash
      },
      previewMarketplaceHash,
      storeAuthToken
    });

    if(inBrowser && window.location && window.location.href) {
      let url = new URL(window.location.href);
      if(url.searchParams.get("elvToken")) {
        await walletClient.Authenticate({token: url.searchParams.get("elvToken")});

        url.searchParams.delete("elvToken");

        window.history.replaceState("", "", url);
      } else if(storeAuthToken && localStorageAvailable) {
        try {
          // Load saved auth token
          let savedToken = localStorage.getItem(`__elv-token-${network}`);
          if(savedToken) {
            await walletClient.Authenticate({token: savedToken});
          }
          // eslint-disable-next-line no-empty
        } catch(error) {}
      }
    }

    if(!skipMarketplaceLoad) {
      await walletClient.LoadAvailableMarketplaces();
    }

    return walletClient;
  }

  /* Login and authorization */

  /**
   * Check if this client can sign without opening a popup.
   *
   * Generally, Eluvio custodial wallet users will require a popup prompt, while Metamask and custom OAuth users will not.
   *
   * @methodGroup Signatures
   * @returns {boolean} - Whether or not this client can sign a message without a popup.
   */
  CanSign() {
    if(!this.loggedIn) { return false; }

    return !!this.__authorization.clusterToken || (inBrowser && !!(this.UserInfo().walletName.toLowerCase() === "metamask" && window.ethereum && window.ethereum.isMetaMask && window.ethereum.chainId));
  }

  /**
   * <b><i>Requires login</i></b>
   *
   * Request the current user sign the specified message.
   *
   * If this client is not able to perform the signature (Eluvio custodial OAuth users), a popup will be opened and the user will be prompted to sign.
   *
   * To check if the signature can be done without a popup, use the <a href="#CanSign">CanSign</a> method.
   *
   * @methodGroup Signatures
   * @namedParams
   * @param {string} message - The message to sign
   *
   * @throws - If the user rejects the signature or closes the popup, an error will be thrown.
   *
   * @returns {Promise<string>} - The signature of the message
   */
  async PersonalSign({message}) {
    if(!this.loggedIn) { throw Error("ElvWalletClient: Unable to perform signature - Not logged in"); }

    // Able to sign locally with either cluster token or metamask
    if(this.CanSign()) {
      if(this.__authorization.clusterToken) {
        // Custodial wallet sign

        message = typeof message === "object" ? JSON.stringify(message) : message;
        message = Ethers.utils.keccak256(Buffer.from(`\x19Ethereum Signed Message:\n${message.length}${message}`, "utf-8"));

        return await this.client.authClient.Sign(message);
      } else if(this.UserInfo().walletName.toLowerCase() === "metamask") {
        return this.SignMetamask({message, address: this.UserAddress()});
      } else {
        throw Error("ElvWalletClient: Unable to sign");
      }
    } else if(!inBrowser) {
      throw Error("ElvWalletClient: Unable to sign");
    }

    const parameters = {
      action: "personal-sign",
      message,
      logIn: true
    };

    let url = new URL(this.appUrl);
    url.hash = UrlJoin("/action", "sign", Utils.B58(JSON.stringify(parameters)));
    url.searchParams.set("origin", window.location.origin);

    if(!embedded && window.location.origin === url.origin) {
      // Already in wallet app, but still can't sign
      throw Error("ElvWalletClient: Unable to sign");
    }

    return await new Promise(async (resolve, reject) => {
      await ActionPopup({
        mode: "tab",
        url: url.toString(),
        onCancel: () => reject("User cancelled sign"),
        onMessage: async (event, Close) => {
          if(!event || !event.data || event.data.type !== "FlowResponse") {
            return;
          }

          try {
            resolve(event.data.response);
          } catch(error) {
            reject(error);
          } finally {
            Close();
          }
        }
      });
    });
  }

  async LogInURL({
    mode="login",
    provider,
    marketplaceParams,
    clearLogin
  }) {
    let loginUrl = new URL(this.appUrl);
    loginUrl.hash = "/login";

    loginUrl.searchParams.set("action", "login");

    if(typeof window !== "undefined") {
      loginUrl.searchParams.set("origin", window.location.origin);
    }

    if(provider) {
      loginUrl.searchParams.set("provider", provider);
    }

    if(mode) {
      loginUrl.searchParams.set("mode", mode);
    }

    if(marketplaceParams) {
      loginUrl.searchParams.set("mid", (await this.MarketplaceInfo({marketplaceParams})).marketplaceHash);
    } else if((this.selectedMarketplaceInfo || {}).marketplaceHash) {
      loginUrl.searchParams.set("mid", this.selectedMarketplaceInfo.marketplaceHash);
    }

    if(clearLogin) {
      loginUrl.searchParams.set("clear", "");
    }

    return loginUrl;
  }

  /**
   * Direct the user to the Eluvio Media Wallet login page.
   *
   * For redirect login, the authorization token will be included in the URL parameters of the callbackUrl. Simply re-initialize the wallet client and it will authorize with this token,
   * or you can retrieve the parameter (`elvToken`) yourself and use it in the <a href="#Authenticate">Authenticate</a> method.
   *
   * <b>NOTE:</b> The domain of the opening window (popup flow) or domain of the `callbackUrl` (redirect flow) MUST be allowed in the metadata of the specified marketplace.
   *
   * @methodGroup Login
   * @namedParams
   * @param {string=} method=redirect - How to present the login page.
   * - `redirect` - Redirect to the wallet login page. Upon login, the page will be redirected back to the specified `redirectUrl` with the authorization token.
   * - `popup` - Open the wallet login page in a new tab. Upon login, authorization information will be sent back to the client via message and the tab will be closed.
   * @param {string=} provider - If logging in via a specific method, specify the provider and mode. Options: `oauth`, `metamask`
   * @param {string=} mode - If logging in via a specific method, specify the mode. Options `login` (Log In), `create` (Sign Up)
   * @param {string=} callbackUrl - If using the redirect flow, the URL to redirect back to after login.
   * @param {Object=} marketplaceParams - Parameters of a marketplace to associate the login with. If not specified, the marketplace parameters used upon client initialization will be used. A marketplace is required when using the redirect flow.
   * @param {boolean=} clearLogin=false - If specified, the user will be prompted to log in anew even if they are already logged in on the Eluvio Media Wallet app
   *
   * @throws - If using the popup flow and the user closes the popup, this method will throw an error.
   */
  async LogIn({
    method="redirect",
    provider,
    mode="login",
    callbackUrl,
    marketplaceParams,
    clearLogin=false,
    callback
  }) {
    let loginUrl = await this.LogInURL({mode, provider, marketplaceParams, clearLogin});

    if(method === "redirect") {
      loginUrl.searchParams.set("response", "redirect");
      loginUrl.searchParams.set("source", "origin");
      loginUrl.searchParams.set("redirect", callbackUrl);

      window.location = loginUrl;
    } else {
      loginUrl.searchParams.set("response", "message");
      loginUrl.searchParams.set("source", "parent");

      await new Promise(async (resolve, reject) => {
        await ActionPopup({
          mode: "tab",
          url: loginUrl.toString(),
          onCancel: () => reject("User cancelled login"),
          onMessage: async (event, Close) => {
            if(!event || !event.data || event.data.type !== "LoginResponse") {
              return;
            }

            try {
              if(callback) {
                await callback(event.data.params);
              } else {
                await this.Authenticate({token: event.data.params.clientSigningToken || event.data.params.clientAuthToken});
              }

              resolve();
            } catch(error) {
              reject(error);
            } finally {
              Close();
            }
          }
        });
      });
    }
  }

  /**
   * Remove authorization for the current user.
   *
   * @methodGroup Login
   */
  LogOut() {
    this.__authorization = {};
    this.loggedIn = false;

    this.cachedMarketplaces = {};

    // Delete saved auth token
    if(localStorageAvailable) {
      try {
        localStorage.removeItem(`__elv-token-${this.network}`);
      // eslint-disable-next-line no-empty
      } catch(error) {}
    }
  }

  /**
   * Authenticate with an ElvWalletClient authorization token
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} token - A previously generated ElvWalletClient authorization token;
   */
  async Authenticate({token}) {
    let decodedToken;
    try {
      decodedToken = JSON.parse(this.utils.FromB58ToStr(token)) || {};
    } catch(error) {
      throw new Error("Invalid authorization token " + token);
    }

    if(!decodedToken.expiresAt || Date.now() > decodedToken.expiresAt) {
      throw Error("ElvWalletClient: Provided authorization token has expired");
    }

    if(decodedToken.clusterToken) {
      await this.client.SetRemoteSigner({authToken: decodedToken.clusterToken, signerURIs: decodedToken.signerURIs});
    }

    this.client.SetStaticToken({token: decodedToken.fabricToken});

    return this.SetAuthorization({...decodedToken});
  }

  /**
   * Authenticate with an OAuth ID token
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} idToken - An OAuth ID token
   * @param {string=} tenantId - ID of tenant with which to associate the user. If marketplace info was set upon initialization, this will be determined automatically.
   * @param {string=} email - Email address of the user. If not specified, this method will attempt to extract the email from the ID token.
   * @param {Array<string>=} signerURIs - (Only if using custom OAuth) - URIs corresponding to the key server(s) to use
   * @param {boolean=} shareEmail=false - Whether or not the user consents to sharing their email
   *
   * @returns {Promise<Object>} - Returns an authorization tokens that can be used to initialize the client using <a href="#Authenticate">Authenticate</a>.
   * Save this token to avoid having to reauthenticate with OAuth. This token expires after 24 hours.
   *
   * The result includes two tokens:
   * - token - Standard client auth token used to access content and perform actions on behalf of the user.
   * - signingToken - Identical to `authToken`, but also includes the ability to perform arbitrary signatures with the custodial wallet. This token should be protected and should not be
   * shared with third parties.
   */
  async AuthenticateOAuth({idToken, tenantId, email, signerURIs, shareEmail=false, nonce, createRemoteToken=true}) {
    let tokenDuration = 24;

    if(!tenantId && this.selectedMarketplaceInfo) {
      // Load tenant ID automatically from selected marketplace
      await this.AvailableMarketplaces();
      tenantId = this.selectedMarketplaceInfo.tenantId;
    }

    await this.client.SetRemoteSigner({idToken, tenantId, signerURIs, extraData: { share_email: shareEmail }, unsignedPublicAuth: true});

    let fabricToken, expiresAt;
    if(createRemoteToken && this.client.signer.remoteSigner) {
      expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      const tokenResponse = await this.client.signer.RetrieveFabricToken({email, nonce});
      fabricToken = tokenResponse.token;
      nonce = tokenResponse.nonce;
    } else {
      expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
      fabricToken = await this.client.CreateFabricToken({
        duration: tokenDuration * 60 * 60 * 1000,
        context: email ? {usr: {email}} : {}
      });
    }
    const address = this.client.utils.FormatAddress(this.client.CurrentAccountAddress());

    if(!email) {
      try {
        const decodedToken = JSON.parse(this.utils.FromB64URL(idToken.split(".")[1]));
        email = decodedToken.email;
      } catch(error) {
        throw Error("Failed to decode ID token");
      }
    }

    this.client.SetStaticToken({token: fabricToken});

    return {
      authToken: this.SetAuthorization({
        fabricToken,
        tenantId,
        address,
        email,
        expiresAt,
        signerURIs,
        walletType: "Custodial",
        walletName: "Eluvio",
        register: true,
        nonce
      }),
      signingToken: this.SetAuthorization({
        clusterToken: this.client.signer.authToken,
        fabricToken,
        tenantId,
        address,
        email,
        expiresAt,
        signerURIs,
        walletType: "Custodial",
        walletName: "Eluvio",
        nonce
      })
    };
  }

  /**
   * Authenticate with an external Ethereum compatible wallet, like Metamask.
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} address - The address of the wallet
   * @param {number=} tokenDuration=24 - Number of hours the generated authorization token will last before expiring
   * @param {string=} walletName=Metamask - Name of the external wallet
   * @param {function=} Sign - The method used for signing by the wallet. If not specified, will attempt to sign with Metamask.
   *
   * @returns {Promise<string>} - Returns an authorization token that can be used to initialize the client using <a href="#Authenticate">Authenticate</a>.
   * Save this token to avoid having to reauthenticate. This token expires after 24 hours.
   */
  async AuthenticateExternalWallet({address, tokenDuration=24, walletName="Metamask", Sign}) {
    if(!address) {
      address = window.ethereum.selectedAddress;
    }

    address = this.utils.FormatAddress(address);

    if(!Sign) {
      Sign = async message => this.SignMetamask({message, address});
    }

    const expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
    const fabricToken = await this.client.CreateFabricToken({
      address,
      duration: tokenDuration * 60 * 60 * 1000,
      Sign,
      addEthereumPrefix: false
    });

    return this.SetAuthorization({fabricToken, address, expiresAt, walletType: "External", walletName, register: true});
  }

  /**
   * <b><i>Requires login</i></b>
   *
   * Retrieve the current client auth token
   *
   * @returns {string} - The client auth token
   */
  ClientAuthToken() {
    if(!this.loggedIn) { return ""; }

    return this.utils.B58(JSON.stringify(this.__authorization));
  }

  AuthToken() {
    if(!this.loggedIn) {
      return this.publicStaticToken;
    }

    return this.__authorization.fabricToken;
  }

  SetAuthorization({clusterToken, fabricToken, tenantId, address, email, expiresAt, signerURIs, walletType, walletName, nonce, register=false}) {
    address = this.client.utils.FormatAddress(address);

    this.__authorization = {
      fabricToken,
      tenantId,
      address,
      email,
      expiresAt,
      walletType,
      walletName,
      nonce
    };

    if(clusterToken) {
      this.__authorization.clusterToken = clusterToken;

      if(signerURIs) {
        this.__authorization.signerURIs = signerURIs;
      }
    }

    this.loggedIn = true;

    this.cachedMarketplaces = {};

    const token = this.ClientAuthToken();

    if(this.storeAuthToken && localStorageAvailable) {
      try {
        localStorage.setItem(`__elv-token-${this.network}`, token);
      // eslint-disable-next-line no-empty
      } catch(error) {}
    }

    if(register) {
      this.client.authClient.MakeAuthServiceRequest({
        path: "/as/wlt/register",
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.AuthToken()}`
        }
      })
        .catch(error => {
          this.Log("Failed to register account: ", true, error);
        });
    }

    return token;
  }

  async SignMetamask({message, address}) {
    if(!inBrowser || !window.ethereum) {
      throw Error("ElvWalletClient: Unable to initialize - Metamask not available");
    }

    address = address || this.UserAddress();

    const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
    if(address && !Utils.EqualAddress(accounts[0], address)) {
      throw Error(`ElvWalletClient: Incorrect MetaMask account selected. Expected ${address}, got ${accounts[0]}`);
    }

    return await window.ethereum.request({
      method: "personal_sign",
      params: [message, address, ""],
    });
  }

  FlowURL({type="flow", flow, marketplaceId, parameters={}}) {
    const url = new URL(this.appUrl);
    if(marketplaceId) {
      url.pathname = UrlJoin("/", type, flow, "marketplace", marketplaceId, Utils.B58(JSON.stringify(parameters)));
    } else {
      url.pathname = UrlJoin("/", type, flow, Utils.B58(JSON.stringify(parameters)));
    }

    url.searchParams.set("origin", window.location.origin);

    return url.toString();
  }

  async GenerateCodeAuth({url}={}) {
    if(!url) {
      url = await this.LogInURL({mode: "login"});

      url.searchParams.set("response", "code");
      url.searchParams.set("source", "code");
    }

    const response = await Utils.ResponseToJson(
      this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "wlt", "login", "redirect", "metamask"),
        method: "POST",
        body: {
          op: "create",
          dest: url.toString()
        }
      })
    );

    response.code = response.id;
    response.url = response.url.startsWith("https://") ? response.url : `https://${response.url}`;
    response.metamask_url = response.metamask_url.startsWith("https://") ? response.metamask_url : `https://${response.metamask_url}`;

    return response;
  }

  async SetCodeAuth({code, address, type, authToken}) {
    await Utils.ResponseToJson(
      this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "wlt", "login", "session", code),
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.AuthToken()}`
        },
        body: {
          op: "set",
          id: code,
          format: "auth_token",
          payload: JSON.stringify({
            addr: Utils.FormatAddress(address),
            eth: address ? `ikms${Utils.AddressToHash(address)}` : "",
            type,
            token: authToken
          })
        }
      })
    );
  }

  async GetCodeAuth({code, passcode}) {
    try {
      return await Utils.ResponseToJson(
        this.client.authClient.MakeAuthServiceRequest({
          path: UrlJoin("as", "wlt", "login", "redirect", "metamask", code, passcode),
          method: "GET",
        })
      );
    } catch(error) {
      if(error && error.status === 404) { return undefined; }

      throw error;
    }
  }

  // Internal loading methods

  async LoadAvailableMarketplaces(forceReload=false) {
    if(!forceReload && Object.keys(this.availableMarketplaces) > 0) {
      return;
    }

    let metadata = await this.client.ContentObjectMetadata({
      libraryId: this.mainSiteLibraryId,
      objectId: this.mainSiteId,
      metadataSubtree: "public/asset_metadata",
      resolveLinks: true,
      linkDepthLimit: 2,
      resolveIncludeSource: true,
      resolveIgnoreErrors: true,
      produceLinkUrls: true,
      authorizationToken: this.publicStaticToken,
      noAuth: true,
      select: [
        "info/marketplace_order",
        "tenants/*/.",
        "tenants/*/info/branding",
        "tenants/*/marketplaces/*/.",
        "tenants/*/marketplaces/*/info/tenant_id",
        "tenants/*/marketplaces/*/info/tenant_name",
        "tenants/*/marketplaces/*/info/branding",
        "tenants/*/marketplaces/*/info/storefront/background",
        "tenants/*/marketplaces/*/info/storefront/background_mobile"
      ],
      remove: [
        "tenants/*/info/branding/wallet_css",
        "tenants/*/marketplaces/*/info/branding/custom_css"
      ]
    });

    const marketplaceOrder = ((metadata || {}).info || {}).marketplace_order || [];
    metadata = (metadata || {}).tenants || {};

    // If preview marketplace is specified, load it appropriately
    if(this.previewMarketplaceId) {
      let previewTenantSlug = "PREVIEW";
      let previewMarketplaceSlug, previewMarketplaceMetadata;
      Object.keys(metadata || {}).forEach(tenantSlug =>
        Object.keys(metadata[tenantSlug].marketplaces || {}).forEach(marketplaceSlug => {
          const versionHash = metadata[tenantSlug].marketplaces[marketplaceSlug]["."].source;
          const objectId = this.utils.DecodeVersionHash(versionHash).objectId;

          if(objectId === this.previewMarketplaceId) {
            // Marketplace exists in site meta
            previewTenantSlug = tenantSlug;
            previewMarketplaceSlug = marketplaceSlug;

            // Deployed marketplace is same as preview marketplace
            if(versionHash === this.previewMarketplaceHash) {
              previewMarketplaceMetadata = metadata[tenantSlug].marketplaces[marketplaceSlug];
            }
          }
        })
      );

      // Marketplace not present in branch, or preview version is different - Load metadata directly
      if(!previewMarketplaceMetadata) {
        previewMarketplaceMetadata = await this.client.ContentObjectMetadata({
          versionHash: this.previewMarketplaceHash,
          metadataSubtree: "public/asset_metadata",
          produceLinkUrls: true,
          authorizationToken: this.publicStaticToken,
          noAuth: true,
          select: [
            "slug",
            "info/tenant_id",
            "info/tenant_name",
            "info/branding",
          ],
          remove: [
            "info/branding/custom_css"
          ]
        });

        if(!previewMarketplaceSlug) {
          previewMarketplaceSlug = previewMarketplaceMetadata.slug;
        }
      }

      previewMarketplaceMetadata["."] = {
        source: this.previewMarketplaceHash
      };

      previewMarketplaceMetadata.info["."] = {
        source: this.previewMarketplaceHash
      };

      previewMarketplaceMetadata.info.branding.preview = true;
      previewMarketplaceMetadata.info.branding.show = true;

      metadata[previewTenantSlug] = metadata[previewTenantSlug] || {};
      metadata[previewTenantSlug].marketplaces = metadata[previewTenantSlug].marketplaces || {};
      metadata[previewTenantSlug].marketplaces[previewMarketplaceSlug] = previewMarketplaceMetadata;
    }

    let availableMarketplaces = { ...(this.availableMarketplaces || {}) };
    let availableMarketplacesById = { ...(this.availableMarketplacesById || {}) };
    Object.keys(metadata || {}).forEach(tenantSlug => {
      try {
        availableMarketplaces[tenantSlug] = metadata[tenantSlug]["."] ?
          { versionHash: metadata[tenantSlug]["."].source } : { };

        Object.keys(metadata[tenantSlug].marketplaces || {}).forEach(marketplaceSlug => {
          try {
            const versionHash = metadata[tenantSlug].marketplaces[marketplaceSlug]["."].source;
            const objectId = this.utils.DecodeVersionHash(versionHash).objectId;

            availableMarketplaces[tenantSlug][marketplaceSlug] = {
              ...(metadata[tenantSlug].marketplaces[marketplaceSlug].info || {}),
              tenantName: metadata[tenantSlug].marketplaces[marketplaceSlug].info.tenant_name,
              tenantId: metadata[tenantSlug].marketplaces[marketplaceSlug].info.tenant_id,
              tenantSlug,
              marketplaceSlug,
              marketplaceId: objectId,
              marketplaceHash: versionHash,
              tenantBranding: (metadata[tenantSlug].info || {}).branding || {},
              order: marketplaceOrder.findIndex(slug => slug === marketplaceSlug)
            };

            availableMarketplacesById[objectId] = availableMarketplaces[tenantSlug][marketplaceSlug];

            this.marketplaceHashes[objectId] = versionHash;

            // Fill out selected marketplace info
            if(this.selectedMarketplaceInfo) {
              if((this.selectedMarketplaceInfo.tenantSlug === tenantSlug && this.selectedMarketplaceInfo.marketplaceSlug === marketplaceSlug) || this.selectedMarketplaceInfo.marketplaceId === objectId) {
                this.selectedMarketplaceInfo = availableMarketplaces[tenantSlug][marketplaceSlug];
              }
            }
          } catch(error) {
            this.Log(`Eluvio Wallet Client: Unable to load info for marketplace ${tenantSlug}/${marketplaceSlug}`, true);
          }
        });
      } catch(error) {
        this.Log(`Eluvio Wallet Client: Failed to load tenant info ${tenantSlug}`, true, error);
      }
    });

    this.availableMarketplaces = availableMarketplaces;
    this.availableMarketplacesById = availableMarketplacesById;
  }

  // Get the hash of the currently linked marketplace
  async LatestMarketplaceHash({marketplaceParams}) {
    const marketplaceInfo = await this.MarketplaceInfo({marketplaceParams});

    if(this.previewMarketplaceId && Utils.EqualHash(this.previewMarketplaceId, marketplaceInfo.marketplaceId)) {
      return this.previewMarketplaceHash;
    }

    const marketplaceLink = await this.client.ContentObjectMetadata({
      libraryId: this.mainSiteLibraryId,
      objectId: this.mainSiteId,
      metadataSubtree: UrlJoin("/public", "asset_metadata", "tenants", marketplaceInfo.tenantSlug, "marketplaces", marketplaceInfo.marketplaceSlug),
      resolveLinks: false,
      noAuth: true
    });

    return LinkTargetHash(marketplaceLink);
  }

  async LoadMarketplace(marketplaceParams) {
    const marketplaceInfo = this.MarketplaceInfo({marketplaceParams});

    const marketplaceId = marketplaceInfo.marketplaceId;
    const marketplaceHash = await this.LatestMarketplaceHash({marketplaceParams});

    if(this.cachedMarketplaces[marketplaceId] && this.cachedMarketplaces[marketplaceId].versionHash !== marketplaceHash) {
      delete this.cachedMarketplaces[marketplaceId];
    }

    if(!this.cachedMarketplaces[marketplaceId]) {
      let marketplace;
      if(this.previewMarketplaceId && Utils.EqualHash(marketplaceId, this.previewMarketplaceId)) {
        // Load preview marketplace
        marketplace = await this.client.ContentObjectMetadata({
          versionHash: this.previewMarketplaceHash,
          metadataSubtree: "/public/asset_metadata/info",
          localizationSubtree: this.localization ? UrlJoin("public", "asset_metadata", "localizations", this.localization, "info") : undefined,
          linkDepthLimit: 1,
          resolveLinks: true,
          resolveIgnoreErrors: true,
          resolveIncludeSource: true,
          produceLinkUrls: true,
          authorizationToken: this.publicStaticToken
        });
      } else {
        // Load marketplace from main site tree
        marketplace = await this.client.ContentObjectMetadata({
          libraryId: this.mainSiteLibraryId,
          objectId: this.mainSiteId,
          metadataSubtree: UrlJoin("/public", "asset_metadata", "tenants", marketplaceInfo.tenantSlug, "marketplaces", marketplaceInfo.marketplaceSlug, "info"),
          localizationSubtree: this.localization ?
            UrlJoin("/public", "asset_metadata", "tenants", marketplaceInfo.tenantSlug, "marketplaces", marketplaceInfo.marketplaceSlug, "localizations", this.localization, "info") :
            undefined,
          linkDepthLimit: 1,
          resolveLinks: true,
          resolveIgnoreErrors: true,
          resolveIncludeSource: true,
          produceLinkUrls: true,
          authorizationToken: this.publicStaticToken
        });
      }

      if(marketplace.branding.use_tenant_styling) {
        marketplace.tenantBranding = (await this.client.ContentObjectMetadata({
          libraryId: this.mainSiteLibraryId,
          objectId: this.mainSiteId,
          metadataSubtree: UrlJoin("/public", "asset_metadata", "tenants", marketplaceInfo.tenantSlug, "info", "branding"),
          authorizationToken: this.publicStaticToken,
          produceLinkUrls: true
        })) || {};
      }

      marketplace.items = await Promise.all(
        marketplace.items.map(async (item, index) => {
          if(item.requires_permissions) {
            let authorizationToken;
            if(!this.loggedIn) {
              // If not logged in, generated a dummy signed token
              // Authorization may be based on geo-restriction, which doesn't require login
              authorizationToken = await this.client.CreateFabricToken({});
            }

            try {
              await this.client.ContentObjectMetadata({
                versionHash: LinkTargetHash(item.nft_template),
                metadataSubtree: "permissioned",
                authorizationToken
              });

              item.authorized = true;
            } catch(error) {
              item.authorized = false;
            }
          }

          item.nftTemplateMetadata = ((item.nft_template || {}).nft || {});
          item.nftTemplateHash = ((item.nft_template || {})["."] || {}).source;
          item.itemIndex = index;

          return item;
        })
      );

      marketplace.collections = (marketplace.collections || []).map((collection, collectionIndex) => ({
        ...collection,
        collectionIndex
      }));

      marketplace.retrievedAt = Date.now();
      marketplace.marketplaceId = marketplaceId;
      marketplace.versionHash = marketplaceHash;
      marketplace.marketplaceHash = marketplaceHash;

      if(this.previewMarketplaceId && marketplaceId === this.previewMarketplaceId) {
        marketplace.branding.preview = true;
      }

      // Generate embed URLs for pack opening animations
      ["purchase_animation", "purchase_animation_mobile", "reveal_animation", "reveal_animation_mobile"].forEach(key => {
        try {
          if(marketplace.storefront[key]) {
            let embedUrl = new URL("https://embed.v3.contentfabric.io");
            const targetHash = LinkTargetHash(marketplace.storefront[key]);
            embedUrl.searchParams.set("p", "");
            embedUrl.searchParams.set("net", this.network === "main" ? "main" : "demo");
            embedUrl.searchParams.set("ath", (this.__authorization || {}).authToken || this.publicStaticToken);
            embedUrl.searchParams.set("vid", targetHash);
            embedUrl.searchParams.set("ap", "");

            if(!key.startsWith("reveal")) {
              embedUrl.searchParams.set("m", "");
              embedUrl.searchParams.set("lp", "");
            }

            marketplace.storefront[`${key}_embed_url`] = embedUrl.toString();
          }
          // eslint-disable-next-line no-empty
        } catch(error) {
        }
      });

      this.cachedMarketplaces[marketplaceId] = marketplace;
    }

    return this.cachedMarketplaces[marketplaceId];
  }

  async FilteredQuery({
    mode="listings",
    sortBy="created",
    sortDesc=false,
    filter,
    editionFilters,
    attributeFilters,
    contractAddress,
    tokenId,
    currency,
    marketplaceParams,
    tenantId,
    collectionIndexes,
    priceRange,
    tokenIdRange,
    capLimit,
    userAddress,
    sellerAddress,
    lastNDays=-1,
    startTime,
    endTime,
    includeCheckoutLocked=false,
    start=0,
    limit=50
  }={}) {
    collectionIndexes = (collectionIndexes || []).map(i => parseInt(i));

    let params = {
      start,
      limit,
      sort_descending: sortDesc
    };

    // Created isn't a valid sort mode for owned
    if(mode === "owned" && sortBy === "created") {
      sortBy = "default";
    }

    if(mode !== "leaderboard") {
      params.sort_by = sortBy;
    }

    if(mode.includes("listings") && includeCheckoutLocked) {
      params.checkout = true;
    }

    let marketplaceInfo, marketplace;
    if(marketplaceParams) {
      marketplaceInfo = await this.MarketplaceInfo({marketplaceParams});

      if(collectionIndexes.length > 0) {
        marketplace = await this.Marketplace({marketplaceParams});
      }
    }

    try {
      let filters = [];

      if(sellerAddress) {
        filters.push(`seller:eq:${this.client.utils.FormatAddress(sellerAddress)}`);
      } else if(userAddress && mode !== "owned") {
        filters.push(`addr:eq:${this.client.utils.FormatAddress(userAddress)}`);
      }

      if(marketplace && collectionIndexes.length >= 0) {
        collectionIndexes.forEach(collectionIndex => {
          const collection = marketplace.collections[collectionIndex];

          collection.items.forEach(sku => {
            if(!sku) {
              return;
            }

            const item = marketplace.items.find(item => item.sku === sku);

            if(!item) {
              return;
            }

            const address = Utils.SafeTraverse(item, "nft_template", "nft", "address");

            if(address) {
              filters.push(
                `${mode === "owned" ? "contract_addr" : "contract"}:eq:${Utils.FormatAddress(address)}`
              );
            }
          });
        });
      } else if(marketplaceInfo || tenantId) {
        filters.push(`tenant:eq:${marketplaceInfo ? marketplaceInfo.tenantId : tenantId}`);
      }

      if(contractAddress) {
        if(mode === "owned") {
          filters.push(`contract_addr:eq:${Utils.FormatAddress(contractAddress)}`);
        } else {
          filters.push(`contract:eq:${Utils.FormatAddress(contractAddress)}`);
        }

        if(tokenId) {
          filters.push(`token:eq:${tokenId}`);
        }
      } else if(filter) {
        if(mode.includes("listing")) {
          filters.push(`nft/display_name:eq:${filter}`);
        } else if(mode === "owned") {
          filters.push(`meta/display_name:eq:${filter}`);
        } else {
          filters.push(`name:eq:${filter}`);
        }
      }

      if(editionFilters) {
        editionFilters.forEach(editionFilter => {
          if(mode.includes("listing")) {
            filters.push(`nft/edition_name:eq:${editionFilter}`);
          } else if(mode === "owned") {
            filters.push(`meta:@>:{"edition_name":"${editionFilter}"}`);
            params.exact = false;
          } else {
            filters.push(`edition:eq:${editionFilter}`);
          }
        });
      }

      if(attributeFilters) {
        attributeFilters.map(({name, value}) => {
          if(!name || !value) { return; }

          filters.push(`nft/attributes/${name}:eq:${value}`);
        });
      }

      if(currency) {
        filters.push("link_type:eq:sol");
      }

      if(startTime || endTime) {
        if(startTime) {
          filters.push(`created:gt:${parseInt(startTime) / 1000}`);
        }

        if(endTime) {
          filters.push(`created:lt:${parseInt(endTime) / 1000}`);
        }
      } else if(lastNDays && lastNDays > 0) {
        filters.push(`created:gt:${((Date.now() / 1000) - ( lastNDays * 24 * 60 * 60 )).toFixed(0)}`);
      }

      if(priceRange) {
        if(priceRange.min) {
          filters.push(`price:ge:${parseFloat(priceRange.min)}`);
        }

        if(priceRange.max) {
          filters.push(`price:le:${parseFloat(priceRange.max)}`);
        }
      }

      if(tokenIdRange) {
        if(tokenIdRange.min) {
          filters.push(`info/token_id:ge:${parseInt(tokenIdRange.min)}`);
        }

        if(tokenIdRange.max) {
          filters.push(`info/token_id:le:${parseInt(tokenIdRange.max)}`);
        }
      }

      if(capLimit) {
        filters.push(`info/cap:le:${parseInt(capLimit)}`);
      }


      let headers;
      let path;
      switch(mode) {
        case "owned":
          path = UrlJoin("as", "wlt", userAddress || this.UserAddress());
          break;

        case "owned-full-meta":
          path = UrlJoin("as", "apigw", "nfts");
          headers = { Authorization: `Bearer ${this.AuthToken()}` };
          break;

        case "listings":
          path = UrlJoin("as", "mkt", "f");
          break;

        case "transfers":
          path = UrlJoin("as", "mkt", "hst", "f");
          filters.push("action:eq:TRANSFERRED");
          filters.push("action:eq:SOLD");
          break;

        case "sales":
          path = UrlJoin("as", "mkt", "hst", "f");
          filters.push("action:eq:SOLD");
          filters.push("seller:co:0x");
          break;

        case "listing-stats":
          path = UrlJoin("as", "mkt", "stats", "listed");
          break;

        case "sales-stats":
          path = UrlJoin("as", "mkt", "stats", "sold");
          filters.push("seller:co:0x");
          break;

        case "leaderboard":
          path = UrlJoin("as", "wlt", "leaders");
          break;
      }

      if(filters.length > 0) {
        params.filter = filters;
      }

      if(mode.includes("stats")) {
        return await Utils.ResponseToJson(
          this.client.authClient.MakeAuthServiceRequest({
            path,
            method: "GET",
            queryParams: params,
            headers: headers
          })
        );
      }

      const { contents, paging } = await Utils.ResponseToJson(
        await this.client.authClient.MakeAuthServiceRequest({
          path,
          method: "GET",
          queryParams: params,
          headers: headers
        })
      ) || [];

      const modesToFormat = ["owned", "listings", "owned-full-meta"];
      return {
        paging: {
          start: params.start,
          limit: params.limit,
          total: paging.total,
          more: paging.total > start + limit
        },
        results: (contents || []).map(item => modesToFormat.includes(mode) ? FormatNFT(this, item) : item)
      };
    } catch(error) {
      if(error.status && error.status.toString() === "404") {
        return {
          paging: {
            start: params.start,
            limit: params.limit,
            total: 0,
            more: false
          },
          results: []
        };
      }

      throw error;
    }
  }

  async MintingStatus({marketplaceParams, tenantId}) {
    if(!tenantId) {
      const marketplaceInfo = await this.MarketplaceInfo({marketplaceParams: marketplaceParams || this.selectedMarketplaceInfo});
      tenantId = marketplaceInfo.tenantId;
    }

    try {
      const response = await Utils.ResponseToJson(
        this.client.authClient.MakeAuthServiceRequest({
          path: UrlJoin("as", "wlt", "status", "act", tenantId),
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.AuthToken()}`
          }
        })
      );

      return response
        .map(status => {
          let [op, address, id] = status.op.split(":");
          address = address.startsWith("0x") ? Utils.FormatAddress(address) : address;

          let confirmationId, tokenId, offerId, giftId;
          if(op === "nft-buy") {
            confirmationId = id;
          } else if(op === "nft-claim") {
            confirmationId = id;
            status.marketplaceId = address;

            if(status.extra && status.extra["0"]) {
              address = status.extra.token_addr;
              tokenId = status.extra.token_id_str;
            }
          } else if(op === "nft-redeem") {
            confirmationId = status.op.split(":").slice(-1)[0];
          } else {
            tokenId = id;
          }

          if(op === "nft-transfer") {
            confirmationId = status.extra && status.extra.trans_id;
            tokenId = (status.extra && status.extra.token_id_str) || tokenId;

            if(status.extra && status.extra.gift_action === "nft-gift-claim") {
              giftId = status.extra.gift_id;
            }
          }

          if(op === "nft-offer-redeem") {
            offerId = status.op.split(":")[3];
          }

          if(op === "nft-claim-entitlement") {
            let [op, marketplace, sku, purchaseId ] = status.op.split(":");
            confirmationId = purchaseId
            if(status.extra && status.extra["0"]) {
              address = status.extra["0"].token_addr;
              tokenId = status.extra["0"].token_id;

              address = address.startsWith("0x") ? Utils.FormatAddress(address) : address;
              status.marketplaceId = marketplace;
            }
          }

          return {
            ...status,
            timestamp: new Date(status.ts),
            state: status.state && typeof status.state === "object" ? Object.values(status.state) : status.state,
            extra: status.extra && typeof status.extra === "object" ? Object.values(status.extra) : status.extra,
            confirmationId,
            op,
            address: Utils.FormatAddress(address),
            tokenId,
            offerId,
            giftId
          };
        })
        .sort((a, b) => a.ts < b.ts ? 1 : -1);
    } catch(error) {
      this.Log("Failed to retrieve minting status", true, error);

      return [];
    }
  }

  async DeployTenant({tenantId, tenantSlug="", tenantHash}) {
    if(!tenantHash) {
      const tenantLink = await this.client.ContentObjectMetadata({
        libraryId: this.mainSiteLibraryId,
        objectId: this.mainSiteId,
        metadataSubtree: UrlJoin("public/asset_metadata/tenants", tenantSlug),
        resolveLinks: true,
        linkDepthLimit: 1,
        resolveIncludeSource: true,
        resolveIgnoreErrors: true,
        select: [
          "."
        ]
      });

      if(!tenantLink) {
        throw Error(`Eluvio Wallet Client: Invalid or missing tenancy: ${tenantSlug}`);
      }

      const deployedTenantHash = tenantLink["."].source;

      tenantHash = await this.client.LatestVersionHash({versionHash: deployedTenantHash});
    }

    const body = { content_hash: tenantHash, ts: Date.now() };
    const token = await this.client.Sign(JSON.stringify(body));
    await this.client.authClient.MakeAuthServiceRequest({
      path: UrlJoin("as", "tnt", "config", tenantId, "metadata"),
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}

Object.assign(ElvWalletClient.prototype, require("./ClientMethods"));
Object.assign(ElvWalletClient.prototype, require("./Profile"));
Object.assign(ElvWalletClient.prototype, require("./Notifications"));

exports.ElvWalletClient = ElvWalletClient;
