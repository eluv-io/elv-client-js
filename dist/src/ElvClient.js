var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");

var _typeof = require("@babel/runtime/helpers/typeof");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

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


var ElvClient = /*#__PURE__*/function () {
  "use strict";

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
        noAuth = _ref$noAuth === void 0 ? false : _ref$noAuth,
        _ref$assumeV = _ref.assumeV3,
        assumeV3 = _ref$assumeV === void 0 ? false : _ref$assumeV;

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
    this.assumeV3 = assumeV3;
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
        this.Log("Debug Logging Enabled:\n        Content Space: ".concat(this.contentSpaceId, "\n        Fabric URLs: [\n\t\t").concat(this.fabricURIs.join(", \n\t\t"), "\n\t]\n        Ethereum URLs: [\n\t\t").concat(this.ethereumURIs.join(", \n\t\t"), "\n\t]\n        Auth Service URLs: [\n\t\t").concat(this.authServiceURIs.join(", \n\t\t"), "\n\t]\n        "));
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
            klass[methodName] = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
              var start,
                  _len,
                  args,
                  _key,
                  result,
                  _args = arguments;

              return _regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      start = Date.now();

                      for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = _args[_key];
                      }

                      _context.next = 4;
                      return originalMethod.apply(void 0, args);

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
              }, _callee);
            }));
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
  }, {
    key: "InitializeClients",
    value: function () {
      var _InitializeClients = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
        var _ref3,
            staticToken,
            wallet,
            signer,
            _args2 = arguments;

        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _ref3 = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {}, staticToken = _ref3.staticToken;
                // Cached info
                this.contentTypes = {};
                this.encryptionConks = {};
                this.stateChannelAccess = {};
                this.objectTenantIds = {};
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

              case 17:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function InitializeClients() {
        return _InitializeClients.apply(this, arguments);
      }

      return InitializeClients;
    }()
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
    value: function () {
      var _UseRegion = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref4) {
        var region, _yield$ElvClient$Conf, fabricURIs, ethereumURIs, authServiceURIs;

        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                region = _ref4.region;

                if (this.configUrl) {
                  _context3.next = 3;
                  break;
                }

                throw Error("Unable to change region: Configuration URL not set");

              case 3:
                _context3.next = 5;
                return ElvClient.Configuration({
                  configUrl: this.configUrl,
                  region: region
                });

              case 5:
                _yield$ElvClient$Conf = _context3.sent;
                fabricURIs = _yield$ElvClient$Conf.fabricURIs;
                ethereumURIs = _yield$ElvClient$Conf.ethereumURIs;
                authServiceURIs = _yield$ElvClient$Conf.authServiceURIs;
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
        }, _callee3, this);
      }));

      function UseRegion(_x) {
        return _UseRegion.apply(this, arguments);
      }

      return UseRegion;
    }()
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
    value: function () {
      var _ResetRegion = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4() {
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
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
                return this.UseRegion({
                  region: ""
                });

              case 4:
                return _context4.abrupt("return", _context4.sent);

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function ResetRegion() {
        return _ResetRegion.apply(this, arguments);
      }

      return ResetRegion;
    }()
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
    value: function () {
      var _NodeId = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_ref5) {
        var region, _yield$ElvClient$Conf2, nodeId;

        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                region = _ref5.region;
                _context5.next = 3;
                return ElvClient.Configuration({
                  configUrl: this.configUrl,
                  region: region
                });

              case 3:
                _yield$ElvClient$Conf2 = _context5.sent;
                nodeId = _yield$ElvClient$Conf2.nodeId;
                return _context5.abrupt("return", nodeId);

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function NodeId(_x2) {
        return _NodeId.apply(this, arguments);
      }

      return NodeId;
    }()
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
    value: function SetNodes(_ref6) {
      var fabricURIs = _ref6.fabricURIs,
          ethereumURIs = _ref6.ethereumURIs,
          authServiceURIs = _ref6.authServiceURIs;

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
    value: function SetSigner(_ref7) {
      var signer = _ref7.signer,
          _ref7$reset = _ref7.reset,
          reset = _ref7$reset === void 0 ? true : _ref7$reset;
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
     * @param {string=} tenantId - If specified, user will be associated with the tenant
     * @param {Object=} extraData - Additional data to pass to the login API
     * @param {boolean=} unsignedPublicAuth=false - If specified, the client will use an unsigned static token for calls that don't require authorization (reduces remote signature calls)
     */

  }, {
    key: "SetRemoteSigner",
    value: function () {
      var _SetRemoteSigner = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref8) {
        var idToken, authToken, tenantId, extraData, unsignedPublicAuth, signer;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                idToken = _ref8.idToken, authToken = _ref8.authToken, tenantId = _ref8.tenantId, extraData = _ref8.extraData, unsignedPublicAuth = _ref8.unsignedPublicAuth;
                signer = new RemoteSigner({
                  rpcUris: this.authServiceURIs,
                  idToken: idToken,
                  authToken: authToken,
                  tenantId: tenantId,
                  provider: this.ethClient.provider,
                  extraData: extraData,
                  unsignedPublicAuth: unsignedPublicAuth
                });
                _context6.next = 4;
                return signer.Initialize();

              case 4:
                this.SetSigner({
                  signer: signer
                });

              case 5:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function SetRemoteSigner(_x3) {
        return _SetRemoteSigner.apply(this, arguments);
      }

      return SetRemoteSigner;
    }()
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
    value: function () {
      var _SetSignerFromWeb3Provider = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(_ref9) {
        var provider, ethProvider;
        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                provider = _ref9.provider;
                this.staticToken = undefined;
                ethProvider = new Ethers.providers.Web3Provider(provider);
                ethProvider.pollingInterval = 250;
                this.signer = ethProvider.getSigner();
                _context7.next = 7;
                return this.signer.getAddress();

              case 7:
                this.signer.address = _context7.sent;
                _context7.next = 10;
                return this.InitializeClients();

              case 10:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function SetSignerFromWeb3Provider(_x4) {
        return _SetSignerFromWeb3Provider.apply(this, arguments);
      }

      return SetSignerFromWeb3Provider;
    }()
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
    value: function () {
      var _CreateAccount = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(_ref10) {
        var tenantId, fundingToken, _ref10$funds, funds, groupToken, wallet, signer;

        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                tenantId = _ref10.tenantId, fundingToken = _ref10.fundingToken, _ref10$funds = _ref10.funds, funds = _ref10$funds === void 0 ? 0.5 : _ref10$funds, groupToken = _ref10.groupToken;

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
                return this.authClient.MakeKMSRequest({
                  method: "POST",
                  path: "/ks/otp/fnd/".concat(tenantId),
                  body: {
                    toAddr: this.signer.address,
                    amtStr: this.utils.EtherToWei(funds)
                  },
                  headers: {
                    Authorization: "Bearer ".concat(fundingToken)
                  }
                });

              case 4:
                _context8.next = 6;
                return this.userProfileClient.CreateWallet();

              case 6:
                _context8.next = 8;
                return this.userProfileClient.ReplaceUserMetadata({
                  metadataSubtree: "tenantContractId",
                  metadata: tenantId
                });

              case 8:
                if (!groupToken) {
                  _context8.next = 11;
                  break;
                }

                _context8.next = 11;
                return this.authClient.MakeKMSRequest({
                  method: "POST",
                  path: "/ks/otp/grp/".concat(tenantId),
                  body: {
                    addAddr: this.signer.address
                  },
                  headers: {
                    Authorization: "Bearer ".concat(groupToken)
                  }
                });

              case 11:
                return _context8.abrupt("return", this.utils.FormatAddress(this.signer.address));

              case 12:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function CreateAccount(_x5) {
        return _CreateAccount.apply(this, arguments);
      }

      return CreateAccount;
    }()
    /*
      TOKEN                  211b  PREFIX + BODY | aplsjcJf1HYcDDUuCdXcSZtU86nYK162YmYJeuqwMczEBJVkD5D5EvsBvVwYDRsf4hzDvBWMoe9piBpqx...
      PREFIX                   6b  aplsjc | apl=plain s=ES256K jc=json-compressed
      BODY                   205b  base58(SIGNATURE + PAYLOAD)
      SIGNATURE + PAYLOAD    151b  151b * 138 / 100 + 1 = 209b (>= 205b)
      SIGNATURE               66b  ES256K_Di9Lu83mz4wMoehCEeQhKpJJ7ApmDZLumAa2Cge48F6EHYnbn8msATGGpjucScwimei1TWGd7aeyQY45AdXd5tT1Z
      PAYLOAD                 85b  json-compressed
      json                    79b  {"adr":"VVf4DQU357tDnZGYQeDrntRJ5rs=","spc":"ispc3ANoVSzNA3P6t7abLR69ho5YPPZU"}
     */

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

  }, {
    key: "CreateFabricToken",
    value: function () {
      var _CreateFabricToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10() {
        var _this = this;

        var _ref11,
            _ref11$duration,
            duration,
            _ref11$spec,
            spec,
            address,
            Sign,
            _ref11$addEthereumPre,
            addEthereumPrefix,
            token,
            message,
            signature,
            compressedToken,
            _args10 = arguments;

        return _regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _ref11 = _args10.length > 0 && _args10[0] !== undefined ? _args10[0] : {}, _ref11$duration = _ref11.duration, duration = _ref11$duration === void 0 ? 24 * 60 * 60 * 1000 : _ref11$duration, _ref11$spec = _ref11.spec, spec = _ref11$spec === void 0 ? {} : _ref11$spec, address = _ref11.address, Sign = _ref11.Sign, _ref11$addEthereumPre = _ref11.addEthereumPrefix, addEthereumPrefix = _ref11$addEthereumPre === void 0 ? true : _ref11$addEthereumPre;
                address = address || this.CurrentAccountAddress();
                _context10.t0 = _objectSpread;
                _context10.t1 = _objectSpread({}, spec);
                _context10.t2 = {};
                _context10.t3 = "iusr".concat(Utils.AddressToHash(address));
                _context10.t4 = Buffer.from(address.replace(/^0x/, ""), "hex").toString("base64");
                _context10.next = 9;
                return this.ContentSpaceId();

              case 9:
                _context10.t5 = _context10.sent;
                _context10.t6 = Date.now();
                _context10.t7 = Date.now() + duration;
                _context10.t8 = {
                  sub: _context10.t3,
                  adr: _context10.t4,
                  spc: _context10.t5,
                  iat: _context10.t6,
                  exp: _context10.t7
                };
                token = (0, _context10.t0)(_context10.t1, _context10.t2, _context10.t8);

                if (!Sign) {
                  Sign = /*#__PURE__*/function () {
                    var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(message) {
                      return _regeneratorRuntime.wrap(function _callee9$(_context9) {
                        while (1) {
                          switch (_context9.prev = _context9.next) {
                            case 0:
                              return _context9.abrupt("return", _this.authClient.Sign(message));

                            case 1:
                            case "end":
                              return _context9.stop();
                          }
                        }
                      }, _callee9);
                    }));

                    return function Sign(_x6) {
                      return _ref12.apply(this, arguments);
                    };
                  }();
                }

                message = "Eluvio Content Fabric Access Token 1.0\n".concat(JSON.stringify(token));

                if (addEthereumPrefix) {
                  message = Ethers.utils.keccak256(Buffer.from("\x19Ethereum Signed Message:\n".concat(message.length).concat(message), "utf-8"));
                }

                _context10.next = 19;
                return Sign(message);

              case 19:
                signature = _context10.sent;
                compressedToken = Pako.deflateRaw(Buffer.from(JSON.stringify(token), "utf-8"));
                return _context10.abrupt("return", "acspjc".concat(this.utils.B58(Buffer.concat([Buffer.from(signature.replace(/^0x/, ""), "hex"), Buffer.from(compressedToken)]))));

              case 22:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function CreateFabricToken() {
        return _CreateFabricToken.apply(this, arguments);
      }

      return CreateFabricToken;
    }()
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

  }, {
    key: "CreateSignedToken",
    value: function () {
      var _CreateSignedToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref13) {
        var libraryId, objectId, versionHash, policyId, subject, _ref13$grantType, grantType, _ref13$allowDecryptio, allowDecryption, duration, _ref13$context, context, token, cap, compressedToken, signature;

        return _regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                libraryId = _ref13.libraryId, objectId = _ref13.objectId, versionHash = _ref13.versionHash, policyId = _ref13.policyId, subject = _ref13.subject, _ref13$grantType = _ref13.grantType, grantType = _ref13$grantType === void 0 ? "read" : _ref13$grantType, _ref13$allowDecryptio = _ref13.allowDecryption, allowDecryption = _ref13$allowDecryptio === void 0 ? false : _ref13$allowDecryptio, duration = _ref13.duration, _ref13$context = _ref13.context, context = _ref13$context === void 0 ? {} : _ref13$context;

                if (subject) {
                  _context11.next = 9;
                  break;
                }

                _context11.t0 = "iusr";
                _context11.t1 = this.utils;
                _context11.next = 6;
                return this.CurrentAccountAddress();

              case 6:
                _context11.t2 = _context11.sent;
                _context11.t3 = _context11.t1.AddressToHash.call(_context11.t1, _context11.t2);
                subject = _context11.t0.concat.call(_context11.t0, _context11.t3);

              case 9:
                if (policyId) {
                  context["elv:delegation-id"] = policyId;
                }

                _context11.t4 = Buffer;
                _context11.next = 13;
                return this.CurrentAccountAddress().replace(/^0x/, "");

              case 13:
                _context11.t5 = _context11.sent;
                _context11.t6 = _context11.t4.from.call(_context11.t4, _context11.t5, "hex").toString("base64");
                _context11.t7 = subject;
                _context11.next = 18;
                return this.ContentSpaceId();

              case 18:
                _context11.t8 = _context11.sent;
                _context11.t9 = Date.now();
                _context11.t10 = Date.now() + duration;
                _context11.t11 = grantType;
                _context11.t12 = context;
                token = {
                  adr: _context11.t6,
                  sub: _context11.t7,
                  spc: _context11.t8,
                  iat: _context11.t9,
                  exp: _context11.t10,
                  gra: _context11.t11,
                  ctx: _context11.t12
                };

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                if (!objectId) {
                  _context11.next = 31;
                  break;
                }

                token.qid = objectId;

                if (libraryId) {
                  _context11.next = 31;
                  break;
                }

                _context11.next = 30;
                return this.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 30:
                libraryId = _context11.sent;

              case 31:
                if (libraryId) {
                  token.lib = libraryId;
                }

                if (!allowDecryption) {
                  _context11.next = 37;
                  break;
                }

                _context11.next = 35;
                return this.authClient.ReEncryptionConk({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 35:
                cap = _context11.sent;
                token.apk = cap.public_key;

              case 37:
                compressedToken = Pako.deflateRaw(Buffer.from(JSON.stringify(token), "utf-8"));
                _context11.next = 40;
                return this.authClient.Sign(Ethers.utils.keccak256(compressedToken));

              case 40:
                signature = _context11.sent;
                return _context11.abrupt("return", "aessjc".concat(this.utils.B58(Buffer.concat([Buffer.from(signature.replace(/^0x/, ""), "hex"), Buffer.from(compressedToken)]))));

              case 42:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function CreateSignedToken(_x7) {
        return _CreateSignedToken.apply(this, arguments);
      }

      return CreateSignedToken;
    }()
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
    value: function () {
      var _SetOauthToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(_ref14) {
        var token, wallet, signer;
        return _regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                token = _ref14.token;
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
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function SetOauthToken(_x8) {
        return _SetOauthToken.apply(this, arguments);
      }

      return SetOauthToken;
    }()
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
    value: function () {
      var _SetSignerFromOauthToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(_ref15) {
        var token, wallet, client, _yield$client$authCli, urls, path, httpClient, response, privateKey;

        return _regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                token = _ref15.token;

                if (this.trustAuthorityId) {
                  _context13.next = 3;
                  break;
                }

                throw Error("Unable to authorize with OAuth token: No trust authority ID set");

              case 3:
                wallet = this.GenerateWallet();
                _context13.prev = 4;

                if (this.kmsURIs) {
                  _context13.next = 17;
                  break;
                }

                _context13.next = 8;
                return ElvClient.FromConfigurationUrl({
                  configUrl: this.configUrl
                });

              case 8:
                client = _context13.sent;
                client.SetSigner({
                  signer: wallet.AddAccountFromMnemonic({
                    mnemonic: wallet.GenerateMnemonic()
                  })
                });
                _context13.next = 12;
                return client.authClient.KMSInfo({
                  kmsId: this.trustAuthorityId
                });

              case 12:
                _yield$client$authCli = _context13.sent;
                urls = _yield$client$authCli.urls;

                if (!(!urls || urls.length === 0)) {
                  _context13.next = 16;
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
                _context13.next = 22;
                return this.utils.ResponseToJson(httpClient.Request({
                  headers: {
                    Authorization: "Bearer ".concat(token)
                  },
                  method: "PUT",
                  path: path,
                  forceFailover: true
                }));

              case 22:
                response = _context13.sent;
                privateKey = response["UserSKHex"];
                this.SetSigner({
                  signer: wallet.AddAccount({
                    privateKey: privateKey
                  })
                }); // Ensure wallet is initialized

                _context13.next = 27;
                return this.userProfileClient.WalletAddress();

              case 27:
                _context13.next = 36;
                break;

              case 29:
                _context13.prev = 29;
                _context13.t0 = _context13["catch"](4);
                this.Log("Failed to set signer from OAuth token:", true);
                this.Log(_context13.t0, true);
                _context13.next = 35;
                return this.ClearSigner();

              case 35:
                throw _context13.t0;

              case 36:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this, [[4, 29]]);
      }));

      function SetSignerFromOauthToken(_x9) {
        return _SetSignerFromOauthToken.apply(this, arguments);
      }

      return SetSignerFromOauthToken;
    }()
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
     * Clear the set static token for the client
     */

  }, {
    key: "ClearStaticToken",
    value: function ClearStaticToken() {
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

  }, {
    key: "SetPolicyAuthorization",
    value: function () {
      var _SetPolicyAuthorization = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref17) {
        var objectId;
        return _regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                objectId = _ref17.objectId;
                _context14.t0 = this;
                _context14.next = 4;
                return this.GenerateStateChannelToken({
                  objectId: objectId
                });

              case 4:
                _context14.t1 = _context14.sent;
                _context14.t2 = {
                  token: _context14.t1
                };

                _context14.t0.SetStaticToken.call(_context14.t0, _context14.t2);

              case 7:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function SetPolicyAuthorization(_x10) {
        return _SetPolicyAuthorization.apply(this, arguments);
      }

      return SetPolicyAuthorization;
    }()
    /**
     * Create a signature for the specified string
     *
     * @param {string} string - The string to sign
     * @return {Promise<string>} - The signed string
     */

  }, {
    key: "Sign",
    value: function () {
      var _Sign = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(string) {
        var signature;
        return _regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return this.authClient.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(string)));

              case 2:
                signature = _context15.sent;
                return _context15.abrupt("return", this.utils.FormatSignature(signature));

              case 4:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function Sign(_x11) {
        return _Sign.apply(this, arguments);
      }

      return Sign;
    }()
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
    value: function () {
      var _EncryptECIES = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16(_ref18) {
        var message, publicKey;
        return _regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                message = _ref18.message, publicKey = _ref18.publicKey;

                if (this.signer) {
                  _context16.next = 3;
                  break;
                }

                throw "Signer not set";

              case 3:
                ValidatePresence("message", message);
                _context16.next = 6;
                return this.Crypto.EncryptConk(message, publicKey || this.signer.signingKey.keyPair.publicKey);

              case 6:
                return _context16.abrupt("return", _context16.sent);

              case 7:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function EncryptECIES(_x12) {
        return _EncryptECIES.apply(this, arguments);
      }

      return EncryptECIES;
    }()
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
    value: function () {
      var _DecryptECIES = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(_ref19) {
        var message;
        return _regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                message = _ref19.message;

                if (this.signer) {
                  _context17.next = 3;
                  break;
                }

                throw "Signer not set";

              case 3:
                ValidatePresence("message", message);
                _context17.next = 6;
                return this.Crypto.DecryptCap(message, this.signer.signingKey.privateKey);

              case 6:
                return _context17.abrupt("return", _context17.sent);

              case 7:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function DecryptECIES(_x13) {
        return _DecryptECIES.apply(this, arguments);
      }

      return DecryptECIES;
    }()
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
    value: function () {
      var _Request = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18(_ref20) {
        var url, _ref20$format, format, _ref20$method, method, _ref20$headers, headers, body;

        return _regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                url = _ref20.url, _ref20$format = _ref20.format, format = _ref20$format === void 0 ? "json" : _ref20$format, _ref20$method = _ref20.method, method = _ref20$method === void 0 ? "GET" : _ref20$method, _ref20$headers = _ref20.headers, headers = _ref20$headers === void 0 ? {} : _ref20$headers, body = _ref20.body;
                return _context18.abrupt("return", this.utils.ResponseToFormat(format, HttpClient.Fetch(url, {
                  method: method,
                  headers: headers,
                  body: body
                })));

              case 2:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function Request(_x14) {
        return _Request.apply(this, arguments);
      }

      return Request;
    }()
    /* FrameClient related */
    // Whitelist of methods allowed to be called using the frame API

  }, {
    key: "FrameAllowedMethods",
    value: function FrameAllowedMethods() {
      var _this2 = this;

      var forbiddenMethods = ["constructor", "AccessGroupMembershipMethod", "CallFromFrameMessage", "ClearSigner", "CreateAccount", "EnableMethodLogging", "FormatBlockNumbers", "FrameAllowedMethods", "FromConfigurationUrl", "GenerateWallet", "InitializeClients", "Log", "SetRemoteSigner", "SetSigner", "SetSignerFromWeb3Provider", "Sign", "ToggleLogging"];
      return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (method) {
        return typeof _this2[method] === "function" && !forbiddenMethods.includes(method);
      });
    } // Call a method specified in a message from a frame

  }, {
    key: "CallFromFrameMessage",
    value: function () {
      var _CallFromFrameMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee19(message, Respond) {
        var _this3 = this;

        var callback, method, methodResults, responseError;
        return _regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                if (!(message.type !== "ElvFrameRequest")) {
                  _context19.next = 2;
                  break;
                }

                return _context19.abrupt("return");

              case 2:
                if (message.callbackId) {
                  callback = function callback(result) {
                    Respond(_this3.utils.MakeClonable({
                      type: "ElvFrameResponse",
                      requestId: message.callbackId,
                      response: result
                    }));
                  };

                  message.args.callback = callback;
                }

                _context19.prev = 3;
                method = message.calledMethod;

                if (!(message.module === "userProfileClient")) {
                  _context19.next = 13;
                  break;
                }

                if (this.userProfileClient.FrameAllowedMethods().includes(method)) {
                  _context19.next = 8;
                  break;
                }

                throw Error("Invalid user profile method: " + method);

              case 8:
                _context19.next = 10;
                return this.userProfileClient[method](message.args);

              case 10:
                methodResults = _context19.sent;
                _context19.next = 18;
                break;

              case 13:
                if (this.FrameAllowedMethods().includes(method)) {
                  _context19.next = 15;
                  break;
                }

                throw Error("Invalid method: " + method);

              case 15:
                _context19.next = 17;
                return this[method](message.args);

              case 17:
                methodResults = _context19.sent;

              case 18:
                Respond(this.utils.MakeClonable({
                  type: "ElvFrameResponse",
                  requestId: message.requestId,
                  response: methodResults
                }));
                _context19.next = 27;
                break;

              case 21:
                _context19.prev = 21;
                _context19.t0 = _context19["catch"](3);
                // eslint-disable-next-line no-console
                this.Log("Frame Message Error:\n        Method: ".concat(message.calledMethod, "\n        Arguments: ").concat(JSON.stringify(message.args, null, 2), "\n        Error: ").concat(_typeof(_context19.t0) === "object" ? JSON.stringify(_context19.t0, null, 2) : _context19.t0), true); // eslint-disable-next-line no-console

                console.error(_context19.t0);
                responseError = _context19.t0 instanceof Error ? _context19.t0.message : _context19.t0;
                Respond(this.utils.MakeClonable({
                  type: "ElvFrameResponse",
                  requestId: message.requestId,
                  error: responseError
                }));

              case 27:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this, [[3, 21]]);
      }));

      function CallFromFrameMessage(_x15, _x16) {
        return _CallFromFrameMessage.apply(this, arguments);
      }

      return CallFromFrameMessage;
    }()
  }], [{
    key: "Configuration",
    value: function () {
      var _Configuration = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee20(_ref21) {
        var configUrl, _ref21$kmsUrls, kmsUrls, region, uri, fabricInfo, filterHTTPS, fabricURIs, ethereumURIs, authServiceURIs, fabricVersion;

        return _regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                configUrl = _ref21.configUrl, _ref21$kmsUrls = _ref21.kmsUrls, kmsUrls = _ref21$kmsUrls === void 0 ? [] : _ref21$kmsUrls, region = _ref21.region;
                _context20.prev = 1;
                uri = new URI(configUrl);
                uri.pathname("/config");

                if (region) {
                  uri.addSearch("elvgeo", region);
                }

                _context20.next = 7;
                return Utils.ResponseToJson(HttpClient.Fetch(uri.toString()));

              case 7:
                fabricInfo = _context20.sent;

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
                return _context20.abrupt("return", {
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
                _context20.prev = 19;
                _context20.t0 = _context20["catch"](1);
                // eslint-disable-next-line no-console
                console.error("Error retrieving fabric configuration:"); // eslint-disable-next-line no-console

                console.error(_context20.t0);
                throw _context20.t0;

              case 24:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, null, [[1, 19]]);
      }));

      function Configuration(_x17) {
        return _Configuration.apply(this, arguments);
      }

      return Configuration;
    }()
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
    value: function () {
      var _FromNetworkName = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee21(_ref22) {
        var networkName, region, trustAuthorityId, staticToken, _ref22$ethereumContra, ethereumContractTimeout, _ref22$noCache, noCache, _ref22$noAuth, noAuth, assumeV3, configUrl;

        return _regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                networkName = _ref22.networkName, region = _ref22.region, trustAuthorityId = _ref22.trustAuthorityId, staticToken = _ref22.staticToken, _ref22$ethereumContra = _ref22.ethereumContractTimeout, ethereumContractTimeout = _ref22$ethereumContra === void 0 ? 10 : _ref22$ethereumContra, _ref22$noCache = _ref22.noCache, noCache = _ref22$noCache === void 0 ? false : _ref22$noCache, _ref22$noAuth = _ref22.noAuth, noAuth = _ref22$noAuth === void 0 ? false : _ref22$noAuth, assumeV3 = _ref22.assumeV3;
                configUrl = networks[networkName];

                if (configUrl) {
                  _context21.next = 4;
                  break;
                }

                throw Error("Invalid network name: " + networkName);

              case 4:
                _context21.next = 6;
                return this.FromConfigurationUrl({
                  configUrl: configUrl,
                  region: region,
                  trustAuthorityId: trustAuthorityId,
                  staticToken: staticToken,
                  ethereumContractTimeout: ethereumContractTimeout,
                  noCache: noCache,
                  noAuth: noAuth,
                  assumeV3: assumeV3
                });

              case 6:
                return _context21.abrupt("return", _context21.sent);

              case 7:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function FromNetworkName(_x18) {
        return _FromNetworkName.apply(this, arguments);
      }

      return FromNetworkName;
    }()
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
    value: function () {
      var _FromConfigurationUrl = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee22(_ref23) {
        var configUrl, region, trustAuthorityId, staticToken, _ref23$ethereumContra, ethereumContractTimeout, _ref23$noCache, noCache, _ref23$noAuth, noAuth, _ref23$assumeV, assumeV3, _yield$ElvClient$Conf3, contentSpaceId, networkId, networkName, fabricURIs, ethereumURIs, authServiceURIs, fabricVersion, client;

        return _regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                configUrl = _ref23.configUrl, region = _ref23.region, trustAuthorityId = _ref23.trustAuthorityId, staticToken = _ref23.staticToken, _ref23$ethereumContra = _ref23.ethereumContractTimeout, ethereumContractTimeout = _ref23$ethereumContra === void 0 ? 10 : _ref23$ethereumContra, _ref23$noCache = _ref23.noCache, noCache = _ref23$noCache === void 0 ? false : _ref23$noCache, _ref23$noAuth = _ref23.noAuth, noAuth = _ref23$noAuth === void 0 ? false : _ref23$noAuth, _ref23$assumeV = _ref23.assumeV3, assumeV3 = _ref23$assumeV === void 0 ? false : _ref23$assumeV;
                _context22.next = 3;
                return ElvClient.Configuration({
                  configUrl: configUrl,
                  region: region
                });

              case 3:
                _yield$ElvClient$Conf3 = _context22.sent;
                contentSpaceId = _yield$ElvClient$Conf3.contentSpaceId;
                networkId = _yield$ElvClient$Conf3.networkId;
                networkName = _yield$ElvClient$Conf3.networkName;
                fabricURIs = _yield$ElvClient$Conf3.fabricURIs;
                ethereumURIs = _yield$ElvClient$Conf3.ethereumURIs;
                authServiceURIs = _yield$ElvClient$Conf3.authServiceURIs;
                fabricVersion = _yield$ElvClient$Conf3.fabricVersion;
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
                  noAuth: noAuth,
                  assumeV3: assumeV3
                });
                client.configUrl = configUrl;
                return _context22.abrupt("return", client);

              case 14:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22);
      }));

      function FromConfigurationUrl(_x19) {
        return _FromConfigurationUrl.apply(this, arguments);
      }

      return FromConfigurationUrl;
    }()
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