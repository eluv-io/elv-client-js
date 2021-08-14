var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");

var _typeof = require("@babel/runtime/helpers/typeof");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

if (typeof Buffer === "undefined") {
  Buffer = require("buffer/").Buffer;
}

var URI = require("urijs");

var Ethers = require("ethers");

var AuthorizationClient = require("./AuthorizationClient");

var ElvWallet = require("./ElvWallet");

var EthClient = require("./EthClient");

var UserProfileClient = require("./UserProfileClient");

var HttpClient = require("./HttpClient");

var RemoteSigner = require("./RemoteSigner"); // const ContentObjectVerification = require("./ContentObjectVerification");


var Utils = require("./Utils");

var Crypto = require("./Crypto");

var _require = require("./LogMessage"),
    LogMessage = _require.LogMessage;

var Pako = require("pako");

var _require2 = require("./Validation"),
    ValidatePresence = _require2.ValidatePresence;

var networks = {
  "main": "https://main.net955305.contentfabric.io",
  "demo": "https://demov3.net955210.contentfabric.io",
  "demov3": "https://demov3.net955210.contentfabric.io",
  "test": "https://test.net955203.contentfabric.io"
};

if (Utils.Platform() === Utils.PLATFORM_NODE) {
  // Define Response in node
  // eslint-disable-next-line no-global-assign
  global.Response = require("node-fetch").Response;
}
/**
 * See the Modules section on the sidebar for details about methods related to interacting with the Fabric.
 *
 */


var ElvClient =
/*#__PURE__*/
function () {
  "use strict";

  _createClass(ElvClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
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

  }, {
    key: "ToggleLogging",
    value: function ToggleLogging(enable) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // define func with closure to pass to forEach
      var setDebug = function setDebug(reporter) {
        if (reporter) {
          reporter.debug = enable;
          reporter.debugOptions = options;
        }
      };

      [this, this.authClient, this.ethClient, this.HttpClient, this.userProfileClient].forEach(setDebug);

      if (enable) {
        this.Log("Debug Logging Enabled:\n        Content Space: ".concat(this.contentSpaceId, "\n        Fabric URLs: [\n\t\t").concat(this.fabricURIs.join(", \n\t\t"), "\n\t]\n        Ethereum URLs: [\\n\\t\\t").concat(this.ethereumURIs.join(", \n\t\t"), "\\n\\t]\n        Auth Service URLs: [\\n\\t\\t").concat(this.authServiceURIs.join(", \n\t\t"), "\\n\\t]\n        "));
      }
    }
  }, {
    key: "EnableMethodLogging",
    value: function EnableMethodLogging() {
      var MethodLogger = function MethodLogger(klass) {
        Object.getOwnPropertyNames(Object.getPrototypeOf(klass)).filter(function (method) {
          return typeof klass[method] === "function";
        }).forEach(function (methodName) {
          var originalMethod = klass[methodName].bind(klass);

          if (originalMethod.constructor.name === "AsyncFunction") {
            klass[methodName] = function _callee() {
              var start,
                  _len,
                  args,
                  _key,
                  result,
                  _args = arguments;

              return _regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      start = Date.now();

                      for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = _args[_key];
                      }

                      _context.next = 4;
                      return _regeneratorRuntime.awrap(originalMethod.apply(void 0, args));

                    case 4:
                      result = _context.sent;
                      // eslint-disable-next-line no-console
                      console.log(methodName, Date.now() - start, "ms", JSON.stringify(args));
                      return _context.abrupt("return", result);

                    case 7:
                    case "end":
                      return _context.stop();
                  }
                }
              });
            };
          } else {
            klass[methodName] = function () {
              var start = Date.now();

              for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }

              var result = originalMethod.apply(void 0, args); // eslint-disable-next-line no-console

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

  }]);

  function ElvClient(_ref) {
    var contentSpaceId = _ref.contentSpaceId,
        networkId = _ref.networkId,
        networkName = _ref.networkName,
        fabricVersion = _ref.fabricVersion,
        fabricURIs = _ref.fabricURIs,
        ethereumURIs = _ref.ethereumURIs,
        authServiceURIs = _ref.authServiceURIs,
        _ref$ethereumContract = _ref.ethereumContractTimeout,
        ethereumContractTimeout = _ref$ethereumContract === void 0 ? 10 : _ref$ethereumContract,
        trustAuthorityId = _ref.trustAuthorityId,
        staticToken = _ref.staticToken,
        _ref$noCache = _ref.noCache,
        noCache = _ref$noCache === void 0 ? false : _ref$noCache,
        _ref$noAuth = _ref.noAuth,
        noAuth = _ref$noAuth === void 0 ? false : _ref$noAuth;

    _classCallCheck(this, ElvClient);

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
    this.ethereumContractTimeout = ethereumContractTimeout;
    this.trustAuthorityId = trustAuthorityId;
    this.noCache = noCache;
    this.noAuth = noAuth;
    this.debug = false;
    this.InitializeClients({
      staticToken: staticToken
    });
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


  _createClass(ElvClient, [{
    key: "InitializeClients",
    value: function InitializeClients() {
      var _ref2,
          staticToken,
          wallet,
          signer,
          _args2 = arguments;

      return _regeneratorRuntime.async(function InitializeClients$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _ref2 = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {}, staticToken = _ref2.staticToken;
              // Cached info
              this.contentTypes = {};
              this.encryptionConks = {};
              this.stateChannelAccess = {};
              this.objectLibraryIds = {};
              this.objectImageUrls = {};
              this.visibilityInfo = {};
              this.inaccessibleLibraries = {};
              this.HttpClient = new HttpClient({
                uris: this.fabricURIs,
                debug: this.debug
              });
              this.AuthHttpClient = new HttpClient({
                uris: this.authServiceURIs,
                debug: this.debug
              });
              this.ethClient = new EthClient({
                client: this,
                uris: this.ethereumURIs,
                networkId: this.networkId,
                debug: this.debug,
                timeout: this.ethereumContractTimeout
              });

              if (!this.signer) {
                wallet = this.GenerateWallet();
                signer = wallet.AddAccountFromMnemonic({
                  mnemonic: wallet.GenerateMnemonic()
                });
                this.SetSigner({
                  signer: signer,
                  reset: false
                });
                this.SetStaticToken({
                  token: staticToken
                });
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
              }); // Initialize crypto wasm

              this.Crypto = Crypto;
              this.Crypto.ElvCrypto();

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "ConfigUrl",
    value: function ConfigUrl() {
      return this.configUrl;
    }
  }, {
    key: "SetAuth",
    value: function SetAuth(auth) {
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

  }, {
    key: "UseRegion",
    value: function UseRegion(_ref3) {
      var region, _ref4, fabricURIs, ethereumURIs, authServiceURIs;

      return _regeneratorRuntime.async(function UseRegion$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              region = _ref3.region;

              if (this.configUrl) {
                _context3.next = 3;
                break;
              }

              throw Error("Unable to change region: Configuration URL not set");

            case 3:
              _context3.next = 5;
              return _regeneratorRuntime.awrap(ElvClient.Configuration({
                configUrl: this.configUrl,
                region: region
              }));

            case 5:
              _ref4 = _context3.sent;
              fabricURIs = _ref4.fabricURIs;
              ethereumURIs = _ref4.ethereumURIs;
              authServiceURIs = _ref4.authServiceURIs;
              this.authServiceURIs = authServiceURIs;
              this.fabricURIs = fabricURIs;
              this.ethereumURIs = ethereumURIs;
              this.HttpClient.uris = fabricURIs;
              this.HttpClient.uriIndex = 0;
              this.ethClient.ethereumURIs = ethereumURIs;
              this.ethClient.ethereumURIIndex = 0;
              return _context3.abrupt("return", {
                fabricURIs: fabricURIs,
                ethereumURIs: ethereumURIs
              });

            case 17:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "ResetRegion",
    value: function ResetRegion() {
      return _regeneratorRuntime.async(function ResetRegion$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (this.configUrl) {
                _context4.next = 2;
                break;
              }

              throw Error("Unable to change region: Configuration URL not set");

            case 2:
              _context4.next = 4;
              return _regeneratorRuntime.awrap(this.UseRegion({
                region: ""
              }));

            case 4:
              return _context4.abrupt("return", _context4.sent);

            case 5:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "NodeId",
    value: function NodeId(_ref5) {
      var region, _ref6, nodeId;

      return _regeneratorRuntime.async(function NodeId$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              region = _ref5.region;
              _context5.next = 3;
              return _regeneratorRuntime.awrap(ElvClient.Configuration({
                configUrl: this.configUrl,
                region: region
              }));

            case 3:
              _ref6 = _context5.sent;
              nodeId = _ref6.nodeId;
              return _context5.abrupt("return", nodeId);

            case 6:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /**
     * Retrieve the fabric and ethereum nodes currently used by the client, in preference order
     *
     * @methodGroup Nodes
     *
     * @return {Promise<Object>} - An object containing the lists of fabric and ethereum urls in use by the client
     */

  }, {
    key: "Nodes",
    value: function Nodes() {
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

  }, {
    key: "SetNodes",
    value: function SetNodes(_ref7) {
      var fabricURIs = _ref7.fabricURIs,
          ethereumURIs = _ref7.ethereumURIs,
          authServiceURIs = _ref7.authServiceURIs;

      if (fabricURIs) {
        this.fabricURIs = fabricURIs;
        this.HttpClient.uris = fabricURIs;
        this.HttpClient.uriIndex = 0;
      }

      if (ethereumURIs) {
        this.ethereumURIs = ethereumURIs;
        this.ethClient.ethereumURIs = ethereumURIs;
        this.ethClient.ethereumURIIndex = 0;
      }

      if (authServiceURIs) {
        this.authServiceURIs = authServiceURIs;
        this.AuthHttpClient.uris = authServiceURIs;
        this.AuthHttpClient.uriIndex = 0;
      }
    }
    /**
     * Return information about how the client was connected to the network
     *
     * @methodGroup Nodes
     * @returns {Object} - The name, ID and configuration URL of the network
     */

  }, {
    key: "NetworkInfo",
    value: function NetworkInfo() {
      return {
        name: this.networkName,
        id: this.networkId,
        configUrl: this.configUrl
      };
    }
    /* Wallet and signers */

    /**
     * Generate a new ElvWallet that is connected to the client's provider
     *
     * @methodGroup Signers
     * @returns {ElvWallet} - ElvWallet instance with this client's provider
     */

  }, {
    key: "GenerateWallet",
    value: function GenerateWallet() {
      return new ElvWallet(this.ethClient.Provider());
    }
    /**
     * Remove the signer from this client
     *
     * @methodGroup Signers
     */

  }, {
    key: "ClearSigner",
    value: function ClearSigner() {
      this.signer = undefined;
      this.InitializeClients();
    }
    /**
     * Clear saved access and state channel tokens
     *
     * @methodGroup Access Requests
     */

  }, {
    key: "ClearCache",
    value: function ClearCache() {
      this.authClient.ClearCache();
    }
    /**
     * Set the signer for this client to use for blockchain transactions
     *
     * @methodGroup Signers
     * @namedParams
     * @param {object} signer - The ethers.js signer object
     */

  }, {
    key: "SetSigner",
    value: function SetSigner(_ref8) {
      var signer = _ref8.signer,
          _ref8$reset = _ref8.reset,
          reset = _ref8$reset === void 0 ? true : _ref8$reset;
      this.staticToken = undefined;
      signer.connect(this.ethClient.Provider());
      signer.provider.pollingInterval = 500;
      this.signer = signer;

      if (reset) {
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
     */

  }, {
    key: "SetRemoteSigner",
    value: function SetRemoteSigner(_ref9) {
      var idToken, authToken, address, signer;
      return _regeneratorRuntime.async(function SetRemoteSigner$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              idToken = _ref9.idToken, authToken = _ref9.authToken, address = _ref9.address;
              signer = new RemoteSigner({
                rpcUris: this.authServiceURIs,
                idToken: idToken,
                authToken: authToken,
                address: address,
                provider: this.ethClient.provider
              });
              _context6.next = 4;
              return _regeneratorRuntime.awrap(signer.Initialize());

            case 4:
              this.SetSigner({
                signer: signer
              });

            case 5:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "SetSignerFromWeb3Provider",
    value: function SetSignerFromWeb3Provider(_ref10) {
      var provider, ethProvider;
      return _regeneratorRuntime.async(function SetSignerFromWeb3Provider$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              provider = _ref10.provider;
              this.staticToken = undefined;
              ethProvider = new Ethers.providers.Web3Provider(provider);
              ethProvider.pollingInterval = 250;
              this.signer = ethProvider.getSigner();
              _context7.next = 7;
              return _regeneratorRuntime.awrap(this.signer.getAddress());

            case 7:
              this.signer.address = _context7.sent;
              _context7.next = 10;
              return _regeneratorRuntime.awrap(this.InitializeClients());

            case 10:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "CreateAccount",
    value: function CreateAccount(_ref11) {
      var tenantId, fundingToken, _ref11$funds, funds, groupToken, wallet, signer;

      return _regeneratorRuntime.async(function CreateAccount$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              tenantId = _ref11.tenantId, fundingToken = _ref11.fundingToken, _ref11$funds = _ref11.funds, funds = _ref11$funds === void 0 ? 0.5 : _ref11$funds, groupToken = _ref11.groupToken;

              if (!this.signer) {
                wallet = this.GenerateWallet();
                signer = wallet.AddAccountFromMnemonic({
                  mnemonic: wallet.GenerateMnemonic()
                });
                this.SetSigner({
                  signer: signer
                });
              }

              _context8.next = 4;
              return _regeneratorRuntime.awrap(this.authClient.MakeKMSRequest({
                method: "POST",
                path: "/ks/otp/fnd/".concat(tenantId),
                body: {
                  toAddr: this.signer.address,
                  amtStr: this.utils.EtherToWei(funds)
                },
                headers: {
                  Authorization: "Bearer ".concat(fundingToken)
                }
              }));

            case 4:
              _context8.next = 6;
              return _regeneratorRuntime.awrap(this.userProfileClient.CreateWallet());

            case 6:
              _context8.next = 8;
              return _regeneratorRuntime.awrap(this.userProfileClient.ReplaceUserMetadata({
                metadataSubtree: "tenantContractId",
                metadata: tenantId
              }));

            case 8:
              if (!groupToken) {
                _context8.next = 11;
                break;
              }

              _context8.next = 11;
              return _regeneratorRuntime.awrap(this.authClient.MakeKMSRequest({
                method: "POST",
                path: "/ks/otp/grp/".concat(tenantId),
                body: {
                  addAddr: this.signer.address
                },
                headers: {
                  Authorization: "Bearer ".concat(groupToken)
                }
              }));

            case 11:
              return _context8.abrupt("return", this.utils.FormatAddress(this.signer.address));

            case 12:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "CreateSignedToken",
    value: function CreateSignedToken(_ref12) {
      var libraryId, objectId, versionHash, policyId, subject, _ref12$grantType, grantType, _ref12$allowDecryptio, allowDecryption, duration, _ref12$context, context, token, cap, compressedToken, signature;

      return _regeneratorRuntime.async(function CreateSignedToken$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              libraryId = _ref12.libraryId, objectId = _ref12.objectId, versionHash = _ref12.versionHash, policyId = _ref12.policyId, subject = _ref12.subject, _ref12$grantType = _ref12.grantType, grantType = _ref12$grantType === void 0 ? "read" : _ref12$grantType, _ref12$allowDecryptio = _ref12.allowDecryption, allowDecryption = _ref12$allowDecryptio === void 0 ? false : _ref12$allowDecryptio, duration = _ref12.duration, _ref12$context = _ref12.context, context = _ref12$context === void 0 ? {} : _ref12$context;

              if (subject) {
                _context9.next = 9;
                break;
              }

              _context9.t0 = "iusr";
              _context9.t1 = this.utils;
              _context9.next = 6;
              return _regeneratorRuntime.awrap(this.CurrentAccountAddress());

            case 6:
              _context9.t2 = _context9.sent;
              _context9.t3 = _context9.t1.AddressToHash.call(_context9.t1, _context9.t2);
              subject = _context9.t0.concat.call(_context9.t0, _context9.t3);

            case 9:
              if (policyId) {
                context["elv:delegation-id"] = policyId;
              }

              _context9.t4 = Buffer;
              _context9.next = 13;
              return _regeneratorRuntime.awrap(this.CurrentAccountAddress().replace(/^0x/, ""));

            case 13:
              _context9.t5 = _context9.sent;
              _context9.t6 = _context9.t4.from.call(_context9.t4, _context9.t5, "hex").toString("base64");
              _context9.t7 = subject;
              _context9.next = 18;
              return _regeneratorRuntime.awrap(this.ContentSpaceId());

            case 18:
              _context9.t8 = _context9.sent;
              _context9.t9 = Date.now();
              _context9.t10 = Date.now() + duration;
              _context9.t11 = grantType;
              _context9.t12 = context;
              token = {
                adr: _context9.t6,
                sub: _context9.t7,
                spc: _context9.t8,
                iat: _context9.t9,
                exp: _context9.t10,
                gra: _context9.t11,
                ctx: _context9.t12
              };

              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              if (!objectId) {
                _context9.next = 31;
                break;
              }

              token.qid = objectId;

              if (libraryId) {
                _context9.next = 31;
                break;
              }

              _context9.next = 30;
              return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 30:
              libraryId = _context9.sent;

            case 31:
              if (libraryId) {
                token.lib = libraryId;
              }

              if (!allowDecryption) {
                _context9.next = 37;
                break;
              }

              _context9.next = 35;
              return _regeneratorRuntime.awrap(this.authClient.ReEncryptionConk({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 35:
              cap = _context9.sent;
              token.apk = cap.public_key;

            case 37:
              compressedToken = Pako.deflateRaw(Buffer.from(JSON.stringify(token), "utf-8"));
              _context9.next = 40;
              return _regeneratorRuntime.awrap(this.authClient.Sign(Ethers.utils.keccak256(compressedToken)));

            case 40:
              signature = _context9.sent;
              return _context9.abrupt("return", "aessjc".concat(this.utils.B58(Buffer.concat([Buffer.from(signature.replace(/^0x/, ""), "hex"), Buffer.from(compressedToken)]))));

            case 42:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the account address of the current signer
     *
     * @methodGroup Signers
     * @returns {string} - The address of the current signer
     */

  }, {
    key: "CurrentAccountAddress",
    value: function CurrentAccountAddress() {
      return this.signer ? this.utils.FormatAddress(this.signer.address) : "";
    }
    /**
     * Set the OAuth token for use in state channel calls
     *
     * @methodGroup Authorization
     * @namedParams
     * @param {string} token - The OAuth ID token
     */

  }, {
    key: "SetOauthToken",
    value: function SetOauthToken(_ref13) {
      var token, wallet, signer;
      return _regeneratorRuntime.async(function SetOauthToken$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              token = _ref13.token;
              this.oauthToken = token;
              wallet = this.GenerateWallet();
              signer = wallet.AddAccountFromMnemonic({
                mnemonic: wallet.GenerateMnemonic()
              });
              this.SetSigner({
                signer: signer
              });

            case 5:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "SetSignerFromOauthToken",
    value: function SetSignerFromOauthToken(_ref14) {
      var token, wallet, client, _ref15, urls, path, httpClient, response, privateKey;

      return _regeneratorRuntime.async(function SetSignerFromOauthToken$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              token = _ref14.token;

              if (this.trustAuthorityId) {
                _context11.next = 3;
                break;
              }

              throw Error("Unable to authorize with OAuth token: No trust authority ID set");

            case 3:
              wallet = this.GenerateWallet();
              _context11.prev = 4;

              if (this.kmsURIs) {
                _context11.next = 17;
                break;
              }

              _context11.next = 8;
              return _regeneratorRuntime.awrap(ElvClient.FromConfigurationUrl({
                configUrl: this.configUrl
              }));

            case 8:
              client = _context11.sent;
              client.SetSigner({
                signer: wallet.AddAccountFromMnemonic({
                  mnemonic: wallet.GenerateMnemonic()
                })
              });
              _context11.next = 12;
              return _regeneratorRuntime.awrap(client.authClient.KMSInfo({
                kmsId: this.trustAuthorityId
              }));

            case 12:
              _ref15 = _context11.sent;
              urls = _ref15.urls;

              if (!(!urls || urls.length === 0)) {
                _context11.next = 16;
                break;
              }

              throw Error("Unable to authorize with OAuth token: No KMS URLs set");

            case 16:
              this.kmsURIs = urls;

            case 17:
              this.oauthToken = token;
              path = "/ks/jwt/wlt";
              httpClient = new HttpClient({
                uris: this.kmsURIs,
                debug: this.debug
              });
              _context11.next = 22;
              return _regeneratorRuntime.awrap(this.utils.ResponseToJson(httpClient.Request({
                headers: {
                  Authorization: "Bearer ".concat(token)
                },
                method: "PUT",
                path: path,
                forceFailover: true
              })));

            case 22:
              response = _context11.sent;
              privateKey = response["UserSKHex"];
              this.SetSigner({
                signer: wallet.AddAccount({
                  privateKey: privateKey
                })
              }); // Ensure wallet is initialized

              _context11.next = 27;
              return _regeneratorRuntime.awrap(this.userProfileClient.WalletAddress());

            case 27:
              _context11.next = 36;
              break;

            case 29:
              _context11.prev = 29;
              _context11.t0 = _context11["catch"](4);
              this.Log("Failed to set signer from OAuth token:", true);
              this.Log(_context11.t0, true);
              _context11.next = 35;
              return _regeneratorRuntime.awrap(this.ClearSigner());

            case 35:
              throw _context11.t0;

            case 36:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this, [[4, 29]]);
    }
    /**
     * Set a static token for the client to use for all authorization
     *
     * @methodGroup Authorization
     * @namedParams
     * @param {string=} token - The static token to use. If not provided, the default static token will be set.
     */

  }, {
    key: "SetStaticToken",
    value: function SetStaticToken() {
      var _ref16 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          token = _ref16.token;

      if (!token) {
        token = this.utils.B64(JSON.stringify({
          qspace_id: this.contentSpaceId
        }));
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

  }, {
    key: "SetPolicyAuthorization",
    value: function SetPolicyAuthorization(_ref17) {
      var objectId;
      return _regeneratorRuntime.async(function SetPolicyAuthorization$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              objectId = _ref17.objectId;
              _context12.t0 = this;
              _context12.next = 4;
              return _regeneratorRuntime.awrap(this.GenerateStateChannelToken({
                objectId: objectId
              }));

            case 4:
              _context12.t1 = _context12.sent;
              _context12.t2 = {
                token: _context12.t1
              };

              _context12.t0.SetStaticToken.call(_context12.t0, _context12.t2);

            case 7:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this);
    }
    /**
     * Create a signature for the specified string
     *
     * @param {string} string - The string to sign
     * @return {Promise<string>} - The signed string
     */

  }, {
    key: "Sign",
    value: function Sign(string) {
      var signature;
      return _regeneratorRuntime.async(function Sign$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _regeneratorRuntime.awrap(this.authClient.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(string))));

            case 2:
              signature = _context13.sent;
              return _context13.abrupt("return", this.utils.FormatSignature(signature));

            case 4:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "EncryptECIES",
    value: function EncryptECIES(_ref18) {
      var message, publicKey;
      return _regeneratorRuntime.async(function EncryptECIES$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              message = _ref18.message, publicKey = _ref18.publicKey;

              if (this.signer) {
                _context14.next = 3;
                break;
              }

              throw "Signer not set";

            case 3:
              ValidatePresence("message", message);
              _context14.next = 6;
              return _regeneratorRuntime.awrap(this.Crypto.EncryptConk(message, publicKey || this.signer.signingKey.keyPair.publicKey));

            case 6:
              return _context14.abrupt("return", _context14.sent);

            case 7:
            case "end":
              return _context14.stop();
          }
        }
      }, null, this);
    }
    /**
     * Decrypt the given encrypted message with the current signer's private key
     *
     * @namedParams
     * @param {string} message - The message to decrypt
     *
     * @return {Promise<string | Object>} - The decrypted string or object
     */

  }, {
    key: "DecryptECIES",
    value: function DecryptECIES(_ref19) {
      var message;
      return _regeneratorRuntime.async(function DecryptECIES$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              message = _ref19.message;

              if (this.signer) {
                _context15.next = 3;
                break;
              }

              throw "Signer not set";

            case 3:
              ValidatePresence("message", message);
              _context15.next = 6;
              return _regeneratorRuntime.awrap(this.Crypto.DecryptCap(message, this.signer.signingKey.privateKey));

            case 6:
              return _context15.abrupt("return", _context15.sent);

            case 7:
            case "end":
              return _context15.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "Request",
    value: function Request(_ref20) {
      var url, _ref20$format, format, _ref20$method, method, _ref20$headers, headers, body;

      return _regeneratorRuntime.async(function Request$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              url = _ref20.url, _ref20$format = _ref20.format, format = _ref20$format === void 0 ? "json" : _ref20$format, _ref20$method = _ref20.method, method = _ref20$method === void 0 ? "GET" : _ref20$method, _ref20$headers = _ref20.headers, headers = _ref20$headers === void 0 ? {} : _ref20$headers, body = _ref20.body;
              return _context16.abrupt("return", this.utils.ResponseToFormat(format, HttpClient.Fetch(url, {
                method: method,
                headers: headers,
                body: body
              })));

            case 2:
            case "end":
              return _context16.stop();
          }
        }
      }, null, this);
    }
    /* FrameClient related */
    // Whitelist of methods allowed to be called using the frame API

  }, {
    key: "FrameAllowedMethods",
    value: function FrameAllowedMethods() {
      var _this = this;

      var forbiddenMethods = ["constructor", "AccessGroupMembershipMethod", "CallFromFrameMessage", "ClearSigner", "CreateAccount", "EnableMethodLogging", "FormatBlockNumbers", "FrameAllowedMethods", "FromConfigurationUrl", "GenerateWallet", "InitializeClients", "Log", "SetRemoteSigner", "SetSigner", "SetSignerFromWeb3Provider", "Sign", "ToggleLogging"];
      return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (method) {
        return typeof _this[method] === "function" && !forbiddenMethods.includes(method);
      });
    } // Call a method specified in a message from a frame

  }, {
    key: "CallFromFrameMessage",
    value: function CallFromFrameMessage(message, Respond) {
      var _this2 = this;

      var callback, method, methodResults, responseError;
      return _regeneratorRuntime.async(function CallFromFrameMessage$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              if (!(message.type !== "ElvFrameRequest")) {
                _context17.next = 2;
                break;
              }

              return _context17.abrupt("return");

            case 2:
              if (message.callbackId) {
                callback = function callback(result) {
                  Respond(_this2.utils.MakeClonable({
                    type: "ElvFrameResponse",
                    requestId: message.callbackId,
                    response: result
                  }));
                };

                message.args.callback = callback;
              }

              _context17.prev = 3;
              method = message.calledMethod;

              if (!(message.module === "userProfileClient")) {
                _context17.next = 13;
                break;
              }

              if (this.userProfileClient.FrameAllowedMethods().includes(method)) {
                _context17.next = 8;
                break;
              }

              throw Error("Invalid user profile method: " + method);

            case 8:
              _context17.next = 10;
              return _regeneratorRuntime.awrap(this.userProfileClient[method](message.args));

            case 10:
              methodResults = _context17.sent;
              _context17.next = 18;
              break;

            case 13:
              if (this.FrameAllowedMethods().includes(method)) {
                _context17.next = 15;
                break;
              }

              throw Error("Invalid method: " + method);

            case 15:
              _context17.next = 17;
              return _regeneratorRuntime.awrap(this[method](message.args));

            case 17:
              methodResults = _context17.sent;

            case 18:
              Respond(this.utils.MakeClonable({
                type: "ElvFrameResponse",
                requestId: message.requestId,
                response: methodResults
              }));
              _context17.next = 27;
              break;

            case 21:
              _context17.prev = 21;
              _context17.t0 = _context17["catch"](3);
              // eslint-disable-next-line no-console
              this.Log("Frame Message Error:\n        Method: ".concat(message.calledMethod, "\n        Arguments: ").concat(JSON.stringify(message.args, null, 2), "\n        Error: ").concat(_typeof(_context17.t0) === "object" ? JSON.stringify(_context17.t0, null, 2) : _context17.t0), true); // eslint-disable-next-line no-console

              console.error(_context17.t0);
              responseError = _context17.t0 instanceof Error ? _context17.t0.message : _context17.t0;
              Respond(this.utils.MakeClonable({
                type: "ElvFrameResponse",
                requestId: message.requestId,
                error: responseError
              }));

            case 27:
            case "end":
              return _context17.stop();
          }
        }
      }, null, this, [[3, 21]]);
    }
  }], [{
    key: "Configuration",
    value: function Configuration(_ref21) {
      var configUrl, _ref21$kmsUrls, kmsUrls, region, uri, fabricInfo, filterHTTPS, fabricURIs, ethereumURIs, authServiceURIs, fabricVersion;

      return _regeneratorRuntime.async(function Configuration$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              configUrl = _ref21.configUrl, _ref21$kmsUrls = _ref21.kmsUrls, kmsUrls = _ref21$kmsUrls === void 0 ? [] : _ref21$kmsUrls, region = _ref21.region;
              _context18.prev = 1;
              uri = new URI(configUrl);
              uri.pathname("/config");

              if (region) {
                uri.addSearch("elvgeo", region);
              }

              _context18.next = 7;
              return _regeneratorRuntime.awrap(Utils.ResponseToJson(HttpClient.Fetch(uri.toString())));

            case 7:
              fabricInfo = _context18.sent;

              // If any HTTPS urls present, throw away HTTP urls so only HTTPS will be used
              filterHTTPS = function filterHTTPS(uri) {
                return uri.toLowerCase().startsWith("https");
              };

              fabricURIs = fabricInfo.network.services.fabric_api;

              if (fabricURIs.find(filterHTTPS)) {
                fabricURIs = fabricURIs.filter(filterHTTPS);
              }

              ethereumURIs = fabricInfo.network.services.ethereum_api;

              if (ethereumURIs.find(filterHTTPS)) {
                ethereumURIs = ethereumURIs.filter(filterHTTPS);
              }

              authServiceURIs = fabricInfo.network.services.authority_service || [];

              if (authServiceURIs.find(filterHTTPS)) {
                authServiceURIs = authServiceURIs.filter(filterHTTPS);
              }

              fabricVersion = Math.max.apply(Math, _toConsumableArray(fabricInfo.network.api_versions || [2]));
              return _context18.abrupt("return", {
                nodeId: fabricInfo.node_id,
                contentSpaceId: fabricInfo.qspace.id,
                networkId: (fabricInfo.qspace.ethereum || {}).network_id,
                networkName: ((fabricInfo.qspace || {}).names || [])[0],
                fabricURIs: fabricURIs,
                ethereumURIs: ethereumURIs,
                authServiceURIs: authServiceURIs,
                kmsURIs: kmsUrls,
                fabricVersion: fabricVersion
              });

            case 19:
              _context18.prev = 19;
              _context18.t0 = _context18["catch"](1);
              // eslint-disable-next-line no-console
              console.error("Error retrieving fabric configuration:"); // eslint-disable-next-line no-console

              console.error(_context18.t0);
              throw _context18.t0;

            case 24:
            case "end":
              return _context18.stop();
          }
        }
      }, null, null, [[1, 19]]);
    }
    /**
     * Create a new ElvClient for the specified network
     *
     * @methodGroup Constructor
     * @namedParams
     * @param {string} networkName - Name of the network to connect to ("main", "demo", "test)
     * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
     * - Available regions: as-east au-east eu-east-north eu-west-north na-east-north na-east-south na-west-north na-west-south eu-east-south eu-west-south
     * @param {string=} trustAuthorityId - (OAuth) The ID of the trust authority to use for OAuth authentication   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
     * @param {string=} staticToken - Static token that will be used for all authorization in place of normal auth
     * @param {number=} ethereumContractTimeout=10 - Number of seconds to wait for contract calls
     * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
     *
     * @return {Promise<ElvClient>} - New ElvClient connected to the specified content fabric and blockchain
     */

  }, {
    key: "FromNetworkName",
    value: function FromNetworkName(_ref22) {
      var networkName, region, trustAuthorityId, staticToken, _ref22$ethereumContra, ethereumContractTimeout, _ref22$noCache, noCache, _ref22$noAuth, noAuth, configUrl;

      return _regeneratorRuntime.async(function FromNetworkName$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              networkName = _ref22.networkName, region = _ref22.region, trustAuthorityId = _ref22.trustAuthorityId, staticToken = _ref22.staticToken, _ref22$ethereumContra = _ref22.ethereumContractTimeout, ethereumContractTimeout = _ref22$ethereumContra === void 0 ? 10 : _ref22$ethereumContra, _ref22$noCache = _ref22.noCache, noCache = _ref22$noCache === void 0 ? false : _ref22$noCache, _ref22$noAuth = _ref22.noAuth, noAuth = _ref22$noAuth === void 0 ? false : _ref22$noAuth;
              configUrl = networks[networkName];

              if (configUrl) {
                _context19.next = 4;
                break;
              }

              throw Error("Invalid network name: " + networkName);

            case 4:
              _context19.next = 6;
              return _regeneratorRuntime.awrap(this.FromConfigurationUrl({
                configUrl: configUrl,
                region: region,
                trustAuthorityId: trustAuthorityId,
                staticToken: staticToken,
                ethereumContractTimeout: ethereumContractTimeout,
                noCache: noCache,
                noAuth: noAuth
              }));

            case 6:
              return _context19.abrupt("return", _context19.sent);

            case 7:
            case "end":
              return _context19.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "FromConfigurationUrl",
    value: function FromConfigurationUrl(_ref23) {
      var configUrl, region, trustAuthorityId, staticToken, _ref23$ethereumContra, ethereumContractTimeout, _ref23$noCache, noCache, _ref23$noAuth, noAuth, _ref24, contentSpaceId, networkId, networkName, fabricURIs, ethereumURIs, authServiceURIs, fabricVersion, client;

      return _regeneratorRuntime.async(function FromConfigurationUrl$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              configUrl = _ref23.configUrl, region = _ref23.region, trustAuthorityId = _ref23.trustAuthorityId, staticToken = _ref23.staticToken, _ref23$ethereumContra = _ref23.ethereumContractTimeout, ethereumContractTimeout = _ref23$ethereumContra === void 0 ? 10 : _ref23$ethereumContra, _ref23$noCache = _ref23.noCache, noCache = _ref23$noCache === void 0 ? false : _ref23$noCache, _ref23$noAuth = _ref23.noAuth, noAuth = _ref23$noAuth === void 0 ? false : _ref23$noAuth;
              _context20.next = 3;
              return _regeneratorRuntime.awrap(ElvClient.Configuration({
                configUrl: configUrl,
                region: region
              }));

            case 3:
              _ref24 = _context20.sent;
              contentSpaceId = _ref24.contentSpaceId;
              networkId = _ref24.networkId;
              networkName = _ref24.networkName;
              fabricURIs = _ref24.fabricURIs;
              ethereumURIs = _ref24.ethereumURIs;
              authServiceURIs = _ref24.authServiceURIs;
              fabricVersion = _ref24.fabricVersion;
              client = new ElvClient({
                contentSpaceId: contentSpaceId,
                networkId: networkId,
                networkName: networkName,
                fabricVersion: fabricVersion,
                fabricURIs: fabricURIs,
                ethereumURIs: ethereumURIs,
                authServiceURIs: authServiceURIs,
                ethereumContractTimeout: ethereumContractTimeout,
                trustAuthorityId: trustAuthorityId,
                staticToken: staticToken,
                noCache: noCache,
                noAuth: noAuth
              });
              client.configUrl = configUrl;
              return _context20.abrupt("return", client);

            case 14:
            case "end":
              return _context20.stop();
          }
        }
      });
    }
  }]);

  return ElvClient;
}();

Object.assign(ElvClient.prototype, require("./client/AccessGroups"));
Object.assign(ElvClient.prototype, require("./client/ContentAccess"));
Object.assign(ElvClient.prototype, require("./client/Contracts"));
Object.assign(ElvClient.prototype, require("./client/Files"));
Object.assign(ElvClient.prototype, require("./client/ABRPublishing"));
Object.assign(ElvClient.prototype, require("./client/ContentManagement"));
Object.assign(ElvClient.prototype, require("./client/NTP"));
Object.assign(ElvClient.prototype, require("./client/NFT"));
exports.ElvClient = ElvClient;