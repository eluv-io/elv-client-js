var _typeof = require("@babel/runtime/helpers/typeof");

var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var _require = require("../ElvClient"),
    ElvClient = _require.ElvClient;

var Configuration = require("./Configuration");

var _require2 = require("./Utils"),
    LinkTargetHash = _require2.LinkTargetHash,
    FormatNFT = _require2.FormatNFT,
    ActionPopup = _require2.ActionPopup;

var UrlJoin = require("url-join");

var Utils = require("../Utils");
/**
 * Use the <a href="#.Initialize">Initialize</a> method to initialize a new client.
 *
 *
 * See the Modules section on the sidebar for all client methods unrelated to login and authorization
 */


var ElvWalletClient = /*#__PURE__*/function () {
  "use strict";

  function ElvWalletClient(_ref) {
    var client = _ref.client,
        network = _ref.network,
        mode = _ref.mode,
        marketplaceInfo = _ref.marketplaceInfo,
        storeAuthToken = _ref.storeAuthToken;

    _classCallCheck(this, ElvWalletClient);

    this.client = client;
    this.loggedIn = false;
    this.network = network;
    this.mode = mode;
    this.purchaseMode = Configuration[network][mode].purchaseMode;
    this.mainSiteId = Configuration[network][mode].siteId;
    this.appUrl = Configuration[network][mode].appUrl;
    this.publicStaticToken = client.staticToken;
    this.storeAuthToken = storeAuthToken;
    this.selectedMarketplaceInfo = marketplaceInfo;
    this.availableMarketplaces = {};
    this.availableMarketplacesById = {};
    this.marketplaceHashes = {}; // Caches

    this.cachedMarketplaces = {};
    this.cachedCSS = {};
    this.utils = client.utils;
  }

  _createClass(ElvWalletClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Eluvio Wallet Client:", message);
      } else {
        // eslint-disable-next-line no-console
        console.log("Eluvio Wallet Client:", message);
      }
    }
    /**
     * Initialize the wallet client.
     *
     * Specify tenantSlug and marketplaceSlug to automatically associate this tenant with a particular marketplace.
     *
     * @methodGroup Initialization
     * @namedParams
     * @param {string} network=main - Name of the Fabric network to use (`main`, `demo`)
     * @param {string} mode=production - Environment to use (`production`, `staging`)
     * @param {Object=} marketplaceParams - Marketplace parameters
     * @param {boolean=} storeAuthToken=true - If specified, auth tokens will be stored in localstorage (if available)
     *
     * @returns {Promise<ElvWalletClient>}
     */

  }, {
    key: "LogIn",
    value:
    /* Login and authorization */

    /**
     * Direct the user to the Eluvio Media Wallet login page.
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
    function () {
      var _LogIn = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref2) {
        var _this = this;

        var _ref2$method, method, provider, _ref2$mode, mode, callbackUrl, marketplaceParams, _ref2$clearLogin, clearLogin, callback, loginUrl;

        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _ref2$method = _ref2.method, method = _ref2$method === void 0 ? "redirect" : _ref2$method, provider = _ref2.provider, _ref2$mode = _ref2.mode, mode = _ref2$mode === void 0 ? "login" : _ref2$mode, callbackUrl = _ref2.callbackUrl, marketplaceParams = _ref2.marketplaceParams, _ref2$clearLogin = _ref2.clearLogin, clearLogin = _ref2$clearLogin === void 0 ? false : _ref2$clearLogin, callback = _ref2.callback;
                loginUrl = new URL(this.appUrl);
                loginUrl.hash = "/login";
                loginUrl.searchParams.set("origin", window.location.origin);
                loginUrl.searchParams.set("action", "login");

                if (provider) {
                  loginUrl.searchParams.set("provider", provider);
                }

                if (mode) {
                  loginUrl.searchParams.set("mode", mode);
                }

                if (!marketplaceParams) {
                  _context3.next = 15;
                  break;
                }

                _context3.t0 = loginUrl.searchParams;
                _context3.next = 11;
                return this.MarketplaceInfo({
                  marketplaceParams: marketplaceParams
                });

              case 11:
                _context3.t1 = _context3.sent.marketplaceHash;

                _context3.t0.set.call(_context3.t0, "mid", _context3.t1);

                _context3.next = 16;
                break;

              case 15:
                if ((this.selectedMarketplaceInfo || {}).marketplaceHash) {
                  loginUrl.searchParams.set("mid", this.selectedMarketplaceInfo.marketplaceHash);
                }

              case 16:
                if (clearLogin) {
                  loginUrl.searchParams.set("clear", "");
                }

                if (!(method === "redirect")) {
                  _context3.next = 24;
                  break;
                }

                loginUrl.searchParams.set("response", "redirect");
                loginUrl.searchParams.set("source", "origin");
                loginUrl.searchParams.set("redirect", callbackUrl);
                window.location = loginUrl;
                _context3.next = 28;
                break;

              case 24:
                loginUrl.searchParams.set("response", "message");
                loginUrl.searchParams.set("source", "parent");
                _context3.next = 28;
                return new Promise( /*#__PURE__*/function () {
                  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(resolve, reject) {
                    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.next = 2;
                            return ActionPopup({
                              mode: "tab",
                              url: loginUrl.toString(),
                              onCancel: function onCancel() {
                                return reject("User cancelled login");
                              },
                              onMessage: function () {
                                var _onMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(event, Close) {
                                  return _regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                      switch (_context.prev = _context.next) {
                                        case 0:
                                          if (!(!event || !event.data || event.data.type !== "LoginResponse")) {
                                            _context.next = 2;
                                            break;
                                          }

                                          return _context.abrupt("return");

                                        case 2:
                                          _context.prev = 2;

                                          if (!callback) {
                                            _context.next = 8;
                                            break;
                                          }

                                          _context.next = 6;
                                          return callback(event.data.params);

                                        case 6:
                                          _context.next = 10;
                                          break;

                                        case 8:
                                          _context.next = 10;
                                          return _this.Authenticate({
                                            token: event.data.params.clientSigningToken || event.data.params.clientAuthToken
                                          });

                                        case 10:
                                          resolve();
                                          _context.next = 16;
                                          break;

                                        case 13:
                                          _context.prev = 13;
                                          _context.t0 = _context["catch"](2);
                                          reject(_context.t0);

                                        case 16:
                                          _context.prev = 16;
                                          Close();
                                          return _context.finish(16);

                                        case 19:
                                        case "end":
                                          return _context.stop();
                                      }
                                    }
                                  }, _callee, null, [[2, 13, 16, 19]]);
                                }));

                                function onMessage(_x4, _x5) {
                                  return _onMessage.apply(this, arguments);
                                }

                                return onMessage;
                              }()
                            });

                          case 2:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2);
                  }));

                  return function (_x2, _x3) {
                    return _ref3.apply(this, arguments);
                  };
                }());

              case 28:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function LogIn(_x) {
        return _LogIn.apply(this, arguments);
      }

      return LogIn;
    }()
    /**
     * Remove authorization for the current user.
     *
     * @methodGroup Login
     */

  }, {
    key: "LogOut",
    value: function LogOut() {
      this.__authorization = {};
      this.loggedIn = false;
      this.cachedMarketplaces = {}; // Delete saved auth token

      if (typeof localStorage !== "undefined") {
        try {
          localStorage.removeItem("__elv-token-".concat(this.network)); // eslint-disable-next-line no-empty
        } catch (error) {}
      }
    }
    /**
     * Authenticate with an ElvWalletClient authorization token
     *
     * @methodGroup Authorization
     * @namedParams
     * @param {string} token - A previously generated ElvWalletClient authorization token;
     */

  }, {
    key: "Authenticate",
    value: function () {
      var _Authenticate = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(_ref4) {
        var token, decodedToken;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                token = _ref4.token;
                _context4.prev = 1;
                decodedToken = JSON.parse(this.utils.FromB58ToStr(token)) || {};
                _context4.next = 8;
                break;

              case 5:
                _context4.prev = 5;
                _context4.t0 = _context4["catch"](1);
                throw new Error("Invalid authorization token " + token);

              case 8:
                if (!(!decodedToken.expiresAt || Date.now() > decodedToken.expiresAt)) {
                  _context4.next = 10;
                  break;
                }

                throw Error("ElvWalletClient: Provided authorization token has expired");

              case 10:
                this.client.SetStaticToken({
                  token: decodedToken.fabricToken
                });

                if (decodedToken.clusterToken) {
                  this.client.SetRemoteSigner({
                    authToken: decodedToken.clusterToken
                  });
                }

                return _context4.abrupt("return", this.SetAuthorization(decodedToken));

              case 13:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[1, 5]]);
      }));

      function Authenticate(_x6) {
        return _Authenticate.apply(this, arguments);
      }

      return Authenticate;
    }()
    /**
     * Authenticate with an OAuth ID token
     *
     * @methodGroup Authorization
     * @namedParams
     * @param {string} idToken - An OAuth ID token
     * @param {string=} tenantId - ID of tenant with which to associate the user. If marketplace info was set upon initialization, this will be determined automatically.
     * @param {string=} email - Email address of the user. If not specified, this method will attempt to extract the email from the ID token.
     * @param {boolean=} shareEmail=false - Whether or not the user consents to sharing their email
     * @param {number=} tokenDuration=24 - Number of hours the generated authorization token will last before expiring
     *
     * @returns {Promise<Object>} - Returns an authorization tokens that can be used to initialize the client using <a href="#Authenticate">Authenticate</a>.
     * Save this token to avoid having to reauthenticate with OAuth. This token expires after 24 hours.
     *
     * The result includes two tokens:
     * - token - Standard client auth token used to access content and perform actions on behalf of the user.
     * - signingToken - Identical to `authToken`, but also includes the ability to perform arbitrary signatures with the custodial wallet. This token should be protected and should not be
     * shared with third parties.
     */

  }, {
    key: "AuthenticateOAuth",
    value: function () {
      var _AuthenticateOAuth = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_ref5) {
        var idToken, tenantId, email, _ref5$shareEmail, shareEmail, _ref5$tokenDuration, tokenDuration, expiresAt, fabricToken, address, decodedToken;

        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                idToken = _ref5.idToken, tenantId = _ref5.tenantId, email = _ref5.email, _ref5$shareEmail = _ref5.shareEmail, shareEmail = _ref5$shareEmail === void 0 ? false : _ref5$shareEmail, _ref5$tokenDuration = _ref5.tokenDuration, tokenDuration = _ref5$tokenDuration === void 0 ? 24 : _ref5$tokenDuration;

                if (!(!tenantId && this.selectedMarketplaceInfo)) {
                  _context5.next = 5;
                  break;
                }

                _context5.next = 4;
                return this.AvailableMarketplaces();

              case 4:
                tenantId = this.selectedMarketplaceInfo.tenantId;

              case 5:
                _context5.next = 7;
                return this.client.SetRemoteSigner({
                  idToken: idToken,
                  tenantId: tenantId,
                  extraData: {
                    share_email: shareEmail
                  },
                  unsignedPublicAuth: true
                });

              case 7:
                expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
                _context5.next = 10;
                return this.client.CreateFabricToken({
                  duration: tokenDuration * 60 * 60 * 1000
                });

              case 10:
                fabricToken = _context5.sent;
                address = this.client.utils.FormatAddress(this.client.CurrentAccountAddress());

                if (email) {
                  _context5.next = 21;
                  break;
                }

                _context5.prev = 13;
                decodedToken = JSON.parse(this.utils.FromB64URL(idToken.split(".")[1]));
                email = decodedToken.email;
                _context5.next = 21;
                break;

              case 18:
                _context5.prev = 18;
                _context5.t0 = _context5["catch"](13);
                throw Error("Failed to decode ID token");

              case 21:
                this.client.SetStaticToken({
                  token: fabricToken
                });
                return _context5.abrupt("return", {
                  authToken: this.SetAuthorization({
                    fabricToken: fabricToken,
                    tenantId: tenantId,
                    address: address,
                    email: email,
                    expiresAt: expiresAt,
                    walletType: "Custodial",
                    walletName: "Eluvio"
                  }),
                  signingToken: this.SetAuthorization({
                    clusterToken: this.client.signer.authToken,
                    fabricToken: fabricToken,
                    tenantId: tenantId,
                    address: address,
                    email: email,
                    expiresAt: expiresAt,
                    walletType: "Custodial",
                    walletName: "Eluvio"
                  })
                });

              case 23:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[13, 18]]);
      }));

      function AuthenticateOAuth(_x7) {
        return _AuthenticateOAuth.apply(this, arguments);
      }

      return AuthenticateOAuth;
    }()
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

  }, {
    key: "AuthenticateExternalWallet",
    value: function () {
      var _AuthenticateExternalWallet = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(_ref6) {
        var _this2 = this;

        var address, _ref6$tokenDuration, tokenDuration, _ref6$walletName, walletName, Sign, expiresAt, fabricToken;

        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                address = _ref6.address, _ref6$tokenDuration = _ref6.tokenDuration, tokenDuration = _ref6$tokenDuration === void 0 ? 24 : _ref6$tokenDuration, _ref6$walletName = _ref6.walletName, walletName = _ref6$walletName === void 0 ? "Metamask" : _ref6$walletName, Sign = _ref6.Sign;

                if (!address) {
                  address = window.ethereum.selectedAddress;
                }

                address = this.utils.FormatAddress(address);

                if (!Sign) {
                  Sign = /*#__PURE__*/function () {
                    var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(message) {
                      return _regeneratorRuntime.wrap(function _callee6$(_context6) {
                        while (1) {
                          switch (_context6.prev = _context6.next) {
                            case 0:
                              return _context6.abrupt("return", _this2.SignMetamask({
                                message: message,
                                address: address
                              }));

                            case 1:
                            case "end":
                              return _context6.stop();
                          }
                        }
                      }, _callee6);
                    }));

                    return function Sign(_x9) {
                      return _ref7.apply(this, arguments);
                    };
                  }();
                }

                expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
                _context7.next = 7;
                return this.client.CreateFabricToken({
                  address: address,
                  duration: tokenDuration * 60 * 60 * 1000,
                  Sign: Sign,
                  addEthereumPrefix: false
                });

              case 7:
                fabricToken = _context7.sent;
                return _context7.abrupt("return", this.SetAuthorization({
                  fabricToken: fabricToken,
                  address: address,
                  expiresAt: expiresAt,
                  walletType: "External",
                  walletName: walletName
                }));

              case 9:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function AuthenticateExternalWallet(_x8) {
        return _AuthenticateExternalWallet.apply(this, arguments);
      }

      return AuthenticateExternalWallet;
    }()
    /**
     * <b><i>Requires login</i></b>
     *
     * Retrieve the current client auth token
     *
     * @returns {string} - The client auth token
     */

  }, {
    key: "ClientAuthToken",
    value: function ClientAuthToken() {
      if (!this.loggedIn) {
        return "";
      }

      return this.utils.B58(JSON.stringify(this.__authorization));
    }
  }, {
    key: "AuthToken",
    value: function AuthToken() {
      if (!this.loggedIn) {
        return this.publicStaticToken;
      }

      return this.__authorization.fabricToken;
    }
  }, {
    key: "SetAuthorization",
    value: function SetAuthorization(_ref8) {
      var clusterToken = _ref8.clusterToken,
          fabricToken = _ref8.fabricToken,
          tenantId = _ref8.tenantId,
          address = _ref8.address,
          email = _ref8.email,
          expiresAt = _ref8.expiresAt,
          walletType = _ref8.walletType,
          walletName = _ref8.walletName;
      address = this.client.utils.FormatAddress(address);
      this.__authorization = {
        fabricToken: fabricToken,
        tenantId: tenantId,
        address: address,
        email: email,
        expiresAt: expiresAt,
        walletType: walletType,
        walletName: walletName
      };

      if (clusterToken) {
        this.__authorization.clusterToken = clusterToken;
      }

      this.loggedIn = true;
      this.cachedMarketplaces = {};
      var token = this.ClientAuthToken();

      if (this.storeAuthToken && typeof localStorage !== "undefined") {
        try {
          localStorage.setItem("__elv-token-".concat(this.network), token); // eslint-disable-next-line no-empty
        } catch (error) {}
      }

      return token;
    }
  }, {
    key: "SignMetamask",
    value: function () {
      var _SignMetamask = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(_ref9) {
        var message, address, from;
        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                message = _ref9.message, address = _ref9.address;

                if (window.ethereum) {
                  _context8.next = 3;
                  break;
                }

                throw Error("ElvWalletClient: Unable to initialize - Metamask not available");

              case 3:
                _context8.next = 5;
                return window.ethereum.request({
                  method: "eth_requestAccounts"
                });

              case 5:
                from = address || window.ethereum.selectedAddress;
                _context8.next = 8;
                return window.ethereum.request({
                  method: "personal_sign",
                  params: [message, from, ""]
                });

              case 8:
                return _context8.abrupt("return", _context8.sent);

              case 9:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function SignMetamask(_x10) {
        return _SignMetamask.apply(this, arguments);
      }

      return SignMetamask;
    }() // Internal loading methods
    // If marketplace slug is specified, load only that marketplace. Otherwise load all

  }, {
    key: "LoadAvailableMarketplaces",
    value: function () {
      var _LoadAvailableMarketplaces = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9() {
        var _this3 = this;

        var forceReload,
            mainSiteHash,
            metadata,
            availableMarketplaces,
            availableMarketplacesById,
            _args9 = arguments;
        return _regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                forceReload = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : false;

                if (!(!forceReload && Object.keys(this.availableMarketplaces) > 0)) {
                  _context9.next = 3;
                  break;
                }

                return _context9.abrupt("return");

              case 3:
                _context9.next = 5;
                return this.client.LatestVersionHash({
                  objectId: this.mainSiteId
                });

              case 5:
                mainSiteHash = _context9.sent;
                _context9.next = 8;
                return this.client.ContentObjectMetadata({
                  versionHash: mainSiteHash,
                  metadataSubtree: "public/asset_metadata/tenants",
                  resolveLinks: true,
                  linkDepthLimit: 2,
                  resolveIncludeSource: true,
                  resolveIgnoreErrors: true,
                  produceLinkUrls: true,
                  authorizationToken: this.publicStaticToken,
                  noAuth: true,
                  select: ["*/.", "*/marketplaces/*/.", "*/marketplaces/*/info/tenant_id", "*/marketplaces/*/info/tenant_name", "*/marketplaces/*/info/branding"],
                  remove: ["*/marketplaces/*/info/branding/custom_css"]
                });

              case 8:
                metadata = _context9.sent;
                availableMarketplaces = _objectSpread({}, this.availableMarketplaces || {});
                availableMarketplacesById = _objectSpread({}, this.availableMarketplacesById || {});
                Object.keys(metadata || {}).forEach(function (tenantSlug) {
                  try {
                    availableMarketplaces[tenantSlug] = {
                      versionHash: metadata[tenantSlug]["."].source
                    };
                    Object.keys(metadata[tenantSlug].marketplaces || {}).forEach(function (marketplaceSlug) {
                      try {
                        var versionHash = metadata[tenantSlug].marketplaces[marketplaceSlug]["."].source;

                        var objectId = _this3.utils.DecodeVersionHash(versionHash).objectId;

                        availableMarketplaces[tenantSlug][marketplaceSlug] = _objectSpread(_objectSpread({}, metadata[tenantSlug].marketplaces[marketplaceSlug].info || {}), {}, {
                          tenantName: metadata[tenantSlug].marketplaces[marketplaceSlug].info.tenant_name,
                          tenantId: metadata[tenantSlug].marketplaces[marketplaceSlug].info.tenant_id,
                          tenantSlug: tenantSlug,
                          marketplaceSlug: marketplaceSlug,
                          marketplaceId: objectId,
                          marketplaceHash: versionHash,
                          order: Configuration.__MARKETPLACE_ORDER.findIndex(function (slug) {
                            return slug === marketplaceSlug;
                          })
                        });
                        availableMarketplacesById[objectId] = availableMarketplaces[tenantSlug][marketplaceSlug];
                        _this3.marketplaceHashes[objectId] = versionHash; // Fill out selected marketplace info

                        if (_this3.selectedMarketplaceInfo) {
                          if (_this3.selectedMarketplaceInfo.tenantSlug === tenantSlug && _this3.selectedMarketplaceInfo.marketplaceSlug === marketplaceSlug || _this3.selectedMarketplaceInfo.marketplaceId === objectId) {
                            _this3.selectedMarketplaceInfo = availableMarketplaces[tenantSlug][marketplaceSlug];
                          }
                        }
                      } catch (error) {
                        _this3.Log("Eluvio Wallet Client: Unable to load info for marketplace ".concat(tenantSlug, "/").concat(marketplaceSlug), true);
                      }
                    });
                  } catch (error) {
                    _this3.Log("Eluvio Wallet Client: Failed to load tenant info ".concat(tenantSlug), true);

                    _this3.Log(error, true);
                  }
                });
                this.availableMarketplaces = availableMarketplaces;
                this.availableMarketplacesById = availableMarketplacesById;

              case 14:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function LoadAvailableMarketplaces() {
        return _LoadAvailableMarketplaces.apply(this, arguments);
      }

      return LoadAvailableMarketplaces;
    }() // Get the hash of the currently linked marketplace

  }, {
    key: "LatestMarketplaceHash",
    value: function () {
      var _LatestMarketplaceHash = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(_ref10) {
        var tenantSlug, marketplaceSlug, mainSiteHash, marketplaceLink;
        return _regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                tenantSlug = _ref10.tenantSlug, marketplaceSlug = _ref10.marketplaceSlug;
                _context10.next = 3;
                return this.client.LatestVersionHash({
                  objectId: this.mainSiteId
                });

              case 3:
                mainSiteHash = _context10.sent;
                _context10.next = 6;
                return this.client.ContentObjectMetadata({
                  versionHash: mainSiteHash,
                  metadataSubtree: UrlJoin("/public", "asset_metadata", "tenants", tenantSlug, "marketplaces", marketplaceSlug),
                  resolveLinks: false
                });

              case 6:
                marketplaceLink = _context10.sent;
                return _context10.abrupt("return", LinkTargetHash(marketplaceLink));

              case 8:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function LatestMarketplaceHash(_x11) {
        return _LatestMarketplaceHash.apply(this, arguments);
      }

      return LatestMarketplaceHash;
    }()
  }, {
    key: "LoadMarketplace",
    value: function () {
      var _LoadMarketplace = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(marketplaceParams) {
        var _this4 = this;

        var marketplaceInfo, marketplaceId, marketplaceHash, marketplace;
        return _regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                marketplaceInfo = this.MarketplaceInfo({
                  marketplaceParams: marketplaceParams
                });
                marketplaceId = marketplaceInfo.marketplaceId;
                _context12.next = 4;
                return this.LatestMarketplaceHash({
                  tenantSlug: marketplaceInfo.tenantSlug,
                  marketplaceSlug: marketplaceInfo.marketplaceSlug
                });

              case 4:
                marketplaceHash = _context12.sent;

                if (this.cachedMarketplaces[marketplaceId] && this.cachedMarketplaces[marketplaceId].versionHash !== marketplaceHash) {
                  delete this.cachedMarketplaces[marketplaceId];
                }

                if (this.cachedMarketplaces[marketplaceId]) {
                  _context12.next = 19;
                  break;
                }

                _context12.next = 9;
                return this.client.ContentObjectMetadata({
                  versionHash: marketplaceHash,
                  metadataSubtree: "public/asset_metadata/info",
                  linkDepthLimit: 2,
                  resolveLinks: true,
                  resolveIgnoreErrors: true,
                  resolveIncludeSource: true,
                  produceLinkUrls: true,
                  authorizationToken: this.publicStaticToken
                });

              case 9:
                marketplace = _context12.sent;
                _context12.next = 12;
                return Promise.all(marketplace.items.map( /*#__PURE__*/function () {
                  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(item, index) {
                    return _regeneratorRuntime.wrap(function _callee11$(_context11) {
                      while (1) {
                        switch (_context11.prev = _context11.next) {
                          case 0:
                            if (!item.requires_permissions) {
                              _context11.next = 14;
                              break;
                            }

                            if (_this4.loggedIn) {
                              _context11.next = 5;
                              break;
                            }

                            item.authorized = false;
                            _context11.next = 14;
                            break;

                          case 5:
                            _context11.prev = 5;
                            _context11.next = 8;
                            return _this4.client.ContentObjectMetadata({
                              versionHash: LinkTargetHash(item.nft_template),
                              metadataSubtree: "permissioned"
                            });

                          case 8:
                            item.authorized = true;
                            _context11.next = 14;
                            break;

                          case 11:
                            _context11.prev = 11;
                            _context11.t0 = _context11["catch"](5);
                            item.authorized = false;

                          case 14:
                            item.nftTemplateMetadata = (item.nft_template || {}).nft || {};
                            item.itemIndex = index;
                            return _context11.abrupt("return", item);

                          case 17:
                          case "end":
                            return _context11.stop();
                        }
                      }
                    }, _callee11, null, [[5, 11]]);
                  }));

                  return function (_x13, _x14) {
                    return _ref11.apply(this, arguments);
                  };
                }()));

              case 12:
                marketplace.items = _context12.sent;
                marketplace.collections = (marketplace.collections || []).map(function (collection, collectionIndex) {
                  return _objectSpread(_objectSpread({}, collection), {}, {
                    collectionIndex: collectionIndex
                  });
                });
                marketplace.retrievedAt = Date.now();
                marketplace.marketplaceId = marketplaceId;
                marketplace.versionHash = marketplaceHash; // Generate embed URLs for pack opening animations

                ["purchase_animation", "purchase_animation__mobile", "reveal_animation", "reveal_animation_mobile"].forEach(function (key) {
                  try {
                    if (marketplace.storefront[key]) {
                      var embedUrl = new URL("https://embed.v3.contentfabric.io");
                      var targetHash = LinkTargetHash(marketplace.storefront[key]);
                      embedUrl.searchParams.set("p", "");
                      embedUrl.searchParams.set("net", _this4.network === "main" ? "main" : "demo");
                      embedUrl.searchParams.set("ath", (_this4.__authorization || {}).authToken || _this4.publicStaticToken);
                      embedUrl.searchParams.set("vid", targetHash);
                      embedUrl.searchParams.set("ap", "");

                      if (!key.startsWith("reveal")) {
                        embedUrl.searchParams.set("m", "");
                        embedUrl.searchParams.set("lp", "");
                      }

                      marketplace.storefront["".concat(key, "_embed_url")] = embedUrl.toString();
                    } // eslint-disable-next-line no-empty

                  } catch (error) {}
                });
                this.cachedMarketplaces[marketplaceId] = marketplace;

              case 19:
                return _context12.abrupt("return", this.cachedMarketplaces[marketplaceId]);

              case 20:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function LoadMarketplace(_x12) {
        return _LoadMarketplace.apply(this, arguments);
      }

      return LoadMarketplace;
    }()
  }, {
    key: "FilteredQuery",
    value: function () {
      var _FilteredQuery = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13() {
        var _ref12,
            _ref12$mode,
            mode,
            _ref12$sortBy,
            sortBy,
            _ref12$sortDesc,
            sortDesc,
            filter,
            editionFilter,
            attributeFilters,
            contractAddress,
            tokenId,
            currency,
            marketplaceParams,
            tenantId,
            _ref12$collectionInde,
            collectionIndex,
            sellerAddress,
            _ref12$lastNDays,
            lastNDays,
            _ref12$start,
            start,
            _ref12$limit,
            limit,
            params,
            marketplaceInfo,
            marketplace,
            filters,
            collection,
            path,
            _ref14,
            contents,
            paging,
            _args13 = arguments;

        return _regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _ref12 = _args13.length > 0 && _args13[0] !== undefined ? _args13[0] : {}, _ref12$mode = _ref12.mode, mode = _ref12$mode === void 0 ? "listings" : _ref12$mode, _ref12$sortBy = _ref12.sortBy, sortBy = _ref12$sortBy === void 0 ? "created" : _ref12$sortBy, _ref12$sortDesc = _ref12.sortDesc, sortDesc = _ref12$sortDesc === void 0 ? false : _ref12$sortDesc, filter = _ref12.filter, editionFilter = _ref12.editionFilter, attributeFilters = _ref12.attributeFilters, contractAddress = _ref12.contractAddress, tokenId = _ref12.tokenId, currency = _ref12.currency, marketplaceParams = _ref12.marketplaceParams, tenantId = _ref12.tenantId, _ref12$collectionInde = _ref12.collectionIndex, collectionIndex = _ref12$collectionInde === void 0 ? -1 : _ref12$collectionInde, sellerAddress = _ref12.sellerAddress, _ref12$lastNDays = _ref12.lastNDays, lastNDays = _ref12$lastNDays === void 0 ? -1 : _ref12$lastNDays, _ref12$start = _ref12.start, start = _ref12$start === void 0 ? 0 : _ref12$start, _ref12$limit = _ref12.limit, limit = _ref12$limit === void 0 ? 50 : _ref12$limit;
                collectionIndex = parseInt(collectionIndex);
                params = {
                  sort_by: sortBy,
                  sort_descending: sortDesc,
                  start: start,
                  limit: limit
                };

                if (!marketplaceParams) {
                  _context13.next = 11;
                  break;
                }

                _context13.next = 6;
                return this.MarketplaceInfo({
                  marketplaceParams: marketplaceParams
                });

              case 6:
                marketplaceInfo = _context13.sent;

                if (!(collectionIndex >= 0)) {
                  _context13.next = 11;
                  break;
                }

                _context13.next = 10;
                return this.Marketplace({
                  marketplaceParams: marketplaceParams
                });

              case 10:
                marketplace = _context13.sent;

              case 11:
                _context13.prev = 11;
                filters = [];

                if (sellerAddress) {
                  filters.push("seller:eq:".concat(this.client.utils.FormatAddress(sellerAddress)));
                }

                if (!(marketplace && collectionIndex >= 0)) {
                  _context13.next = 25;
                  break;
                }

                collection = marketplace.collections[collectionIndex];
                collection.items.forEach(function (sku) {
                  if (!sku) {
                    return;
                  }

                  var item = marketplace.items.find(function (item) {
                    return item.sku === sku;
                  });

                  if (!item) {
                    return;
                  }

                  var address = Utils.SafeTraverse(item, "nft_template", "nft", "address");

                  if (address) {
                    filters.push("".concat(mode === "owned" ? "contract_addr" : "contract", ":eq:").concat(Utils.FormatAddress(address)));
                  }
                }); // No valid items, so there must not be anything relevant in the collection

                if (!(filters.length === 0)) {
                  _context13.next = 23;
                  break;
                }

                if (!mode.includes("stats")) {
                  _context13.next = 22;
                  break;
                }

                return _context13.abrupt("return", {});

              case 22:
                return _context13.abrupt("return", {
                  paging: {
                    start: params.start,
                    limit: params.limit,
                    total: 0,
                    more: false
                  },
                  results: []
                });

              case 23:
                _context13.next = 26;
                break;

              case 25:
                if (mode !== "owned" && marketplaceInfo || tenantId) {
                  filters.push("tenant:eq:".concat(marketplaceInfo ? marketplaceInfo.tenantId : tenantId));
                }

              case 26:
                if (contractAddress) {
                  if (mode === "owned") {
                    filters.push("contract_addr:eq:".concat(Utils.FormatAddress(contractAddress)));
                  } else {
                    filters.push("contract:eq:".concat(Utils.FormatAddress(contractAddress)));
                  }

                  if (tokenId) {
                    filters.push("token:eq:".concat(tokenId));
                  }
                } else if (filter) {
                  if (mode.includes("listing")) {
                    filters.push("nft/display_name:eq:".concat(filter));
                  } else if (mode === "owned") {
                    filters.push("meta:@>:{\"display_name\":\"".concat(filter, "\"}"));
                    params.exact = false;
                  } else {
                    filters.push("name:eq:".concat(filter));
                  }
                }

                if (editionFilter) {
                  if (mode.includes("listing")) {
                    filters.push("nft/edition_name:eq:".concat(editionFilter));
                  } else if (mode === "owned") {
                    filters.push("meta:@>:{\"edition_name\":\"".concat(editionFilter, "\"}"));
                    params.exact = false;
                  } else {
                    filters.push("edition:eq:".concat(editionFilter));
                  }
                }

                if (attributeFilters) {
                  attributeFilters.map(function (_ref13) {
                    var name = _ref13.name,
                        value = _ref13.value;

                    if (!name || !value) {
                      return;
                    }

                    filters.push("nft/attributes/".concat(name, ":eq:").concat(value));
                  });
                }

                if (currency) {
                  filters.push("link_type:eq:sol");
                }

                if (lastNDays && lastNDays > 0) {
                  filters.push("created:gt:".concat((Date.now() / 1000 - lastNDays * 24 * 60 * 60).toFixed(0)));
                }

                _context13.t0 = mode;
                _context13.next = _context13.t0 === "owned" ? 34 : _context13.t0 === "listings" ? 37 : _context13.t0 === "sales" ? 39 : _context13.t0 === "listing-stats" ? 42 : _context13.t0 === "sales-stats" ? 44 : 46;
                break;

              case 34:
                path = UrlJoin("as", "wlt", "nfts");

                if (marketplaceInfo) {
                  path = UrlJoin("as", "wlt", "nfts", marketplaceInfo.tenantId);
                }

                return _context13.abrupt("break", 46);

              case 37:
                path = UrlJoin("as", "mkt", "f");
                return _context13.abrupt("break", 46);

              case 39:
                path = UrlJoin("as", "mkt", "hst", "f");
                filters.push("action:eq:SOLD");
                return _context13.abrupt("break", 46);

              case 42:
                path = UrlJoin("as", "mkt", "stats", "listed");
                return _context13.abrupt("break", 46);

              case 44:
                path = UrlJoin("as", "mkt", "stats", "sold");
                return _context13.abrupt("break", 46);

              case 46:
                if (filters.length > 0) {
                  params.filter = filters;
                }

                if (!mode.includes("stats")) {
                  _context13.next = 51;
                  break;
                }

                _context13.next = 50;
                return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
                  path: path,
                  method: "GET",
                  queryParams: params
                }));

              case 50:
                return _context13.abrupt("return", _context13.sent);

              case 51:
                _context13.t2 = Utils;
                _context13.next = 54;
                return this.client.authClient.MakeAuthServiceRequest({
                  path: path,
                  method: "GET",
                  queryParams: params,
                  headers: mode === "owned" ? {
                    Authorization: "Bearer ".concat(this.AuthToken())
                  } : {}
                });

              case 54:
                _context13.t3 = _context13.sent;
                _context13.next = 57;
                return _context13.t2.ResponseToJson.call(_context13.t2, _context13.t3);

              case 57:
                _context13.t1 = _context13.sent;

                if (_context13.t1) {
                  _context13.next = 60;
                  break;
                }

                _context13.t1 = [];

              case 60:
                _ref14 = _context13.t1;
                contents = _ref14.contents;
                paging = _ref14.paging;
                return _context13.abrupt("return", {
                  paging: {
                    start: params.start,
                    limit: params.limit,
                    total: paging.total,
                    more: paging.total > start + limit
                  },
                  results: (contents || []).map(function (item) {
                    return ["owned", "listings"].includes(mode) ? FormatNFT(item) : item;
                  })
                });

              case 66:
                _context13.prev = 66;
                _context13.t4 = _context13["catch"](11);

                if (!(_context13.t4.status && _context13.t4.status.toString() === "404")) {
                  _context13.next = 70;
                  break;
                }

                return _context13.abrupt("return", {
                  paging: {
                    start: params.start,
                    limit: params.limit,
                    total: 0,
                    more: false
                  },
                  results: []
                });

              case 70:
                throw _context13.t4;

              case 71:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this, [[11, 66]]);
      }));

      function FilteredQuery() {
        return _FilteredQuery.apply(this, arguments);
      }

      return FilteredQuery;
    }()
  }, {
    key: "MintingStatus",
    value: function () {
      var _MintingStatus = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref15) {
        var marketplaceParams, tenantId, marketplaceInfo, response;
        return _regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                marketplaceParams = _ref15.marketplaceParams, tenantId = _ref15.tenantId;

                if (tenantId) {
                  _context14.next = 6;
                  break;
                }

                _context14.next = 4;
                return this.MarketplaceInfo({
                  marketplaceParams: marketplaceParams || this.selectedMarketplaceInfo
                });

              case 4:
                marketplaceInfo = _context14.sent;
                tenantId = marketplaceInfo.tenantId;

              case 6:
                _context14.prev = 6;
                _context14.next = 9;
                return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
                  path: UrlJoin("as", "wlt", "status", "act", tenantId),
                  method: "GET",
                  headers: {
                    Authorization: "Bearer ".concat(this.AuthToken())
                  }
                }));

              case 9:
                response = _context14.sent;
                return _context14.abrupt("return", response.map(function (status) {
                  var _status$op$split = status.op.split(":"),
                      _status$op$split2 = _slicedToArray(_status$op$split, 3),
                      op = _status$op$split2[0],
                      address = _status$op$split2[1],
                      id = _status$op$split2[2];

                  address = address.startsWith("0x") ? Utils.FormatAddress(address) : address;
                  var confirmationId, tokenId;

                  if (op === "nft-buy") {
                    confirmationId = id;
                  } else if (op === "nft-claim") {
                    confirmationId = id;
                    status.marketplaceId = address;

                    if (status.extra && status.extra["0"]) {
                      address = status.extra.token_addr;
                      tokenId = status.extra.token_id_str;
                    }
                  } else if (op === "nft-redeem") {
                    confirmationId = status.op.split(":").slice(-1)[0];
                  } else {
                    tokenId = id;
                  }

                  if (op === "nft-transfer") {
                    confirmationId = status.extra && status.extra.trans_id;
                  }

                  return _objectSpread(_objectSpread({}, status), {}, {
                    timestamp: new Date(status.ts),
                    state: status.state && _typeof(status.state) === "object" ? Object.values(status.state) : status.state,
                    extra: status.extra && _typeof(status.extra) === "object" ? Object.values(status.extra) : status.extra,
                    confirmationId: confirmationId,
                    op: op,
                    address: address,
                    tokenId: tokenId
                  });
                }).sort(function (a, b) {
                  return a.ts < b.ts ? 1 : -1;
                }));

              case 13:
                _context14.prev = 13;
                _context14.t0 = _context14["catch"](6);
                this.Log("Failed to retrieve minting status", true);
                this.Log(_context14.t0);
                return _context14.abrupt("return", []);

              case 18:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this, [[6, 13]]);
      }));

      function MintingStatus(_x15) {
        return _MintingStatus.apply(this, arguments);
      }

      return MintingStatus;
    }()
  }], [{
    key: "Initialize",
    value: function () {
      var _Initialize = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(_ref16) {
        var _ref16$network, network, _ref16$mode, mode, marketplaceParams, _ref16$storeAuthToken, storeAuthToken, _ref17, tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash, client, walletClient, url, savedToken;

        return _regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _ref16$network = _ref16.network, network = _ref16$network === void 0 ? "main" : _ref16$network, _ref16$mode = _ref16.mode, mode = _ref16$mode === void 0 ? "production" : _ref16$mode, marketplaceParams = _ref16.marketplaceParams, _ref16$storeAuthToken = _ref16.storeAuthToken, storeAuthToken = _ref16$storeAuthToken === void 0 ? true : _ref16$storeAuthToken;
                _ref17 = marketplaceParams || {}, tenantSlug = _ref17.tenantSlug, marketplaceSlug = _ref17.marketplaceSlug, marketplaceId = _ref17.marketplaceId, marketplaceHash = _ref17.marketplaceHash;

                if (Configuration[network]) {
                  _context15.next = 6;
                  break;
                }

                throw Error("ElvWalletClient: Invalid network ".concat(network));

              case 6:
                if (Configuration[network][mode]) {
                  _context15.next = 8;
                  break;
                }

                throw Error("ElvWalletClient: Invalid mode ".concat(mode));

              case 8:
                _context15.next = 10;
                return ElvClient.FromNetworkName({
                  networkName: network,
                  assumeV3: true
                });

              case 10:
                client = _context15.sent;
                walletClient = new ElvWalletClient({
                  client: client,
                  network: network,
                  mode: mode,
                  marketplaceInfo: {
                    tenantSlug: tenantSlug,
                    marketplaceSlug: marketplaceSlug,
                    marketplaceId: marketplaceHash ? client.utils.DecodeVersionHash(marketplaceHash).objectId : marketplaceId,
                    marketplaceHash: marketplaceHash
                  },
                  storeAuthToken: storeAuthToken
                });

                if (!(window && window.location && window.location.href)) {
                  _context15.next = 31;
                  break;
                }

                url = new URL(window.location.href);

                if (!url.searchParams.get("elvToken")) {
                  _context15.next = 21;
                  break;
                }

                _context15.next = 17;
                return walletClient.Authenticate({
                  token: url.searchParams.get("elvToken")
                });

              case 17:
                url.searchParams["delete"]("elvToken");
                window.history.replaceState("", "", url);
                _context15.next = 31;
                break;

              case 21:
                if (!(storeAuthToken && typeof localStorage !== "undefined")) {
                  _context15.next = 31;
                  break;
                }

                _context15.prev = 22;
                // Load saved auth token
                savedToken = localStorage.getItem("__elv-token-".concat(network));

                if (!savedToken) {
                  _context15.next = 27;
                  break;
                }

                _context15.next = 27;
                return walletClient.Authenticate({
                  token: savedToken
                });

              case 27:
                _context15.next = 31;
                break;

              case 29:
                _context15.prev = 29;
                _context15.t0 = _context15["catch"](22);

              case 31:
                _context15.next = 33;
                return walletClient.LoadAvailableMarketplaces();

              case 33:
                return _context15.abrupt("return", walletClient);

              case 34:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, null, [[22, 29]]);
      }));

      function Initialize(_x16) {
        return _Initialize.apply(this, arguments);
      }

      return Initialize;
    }()
  }]);

  return ElvWalletClient;
}();

Object.assign(ElvWalletClient.prototype, require("./ClientMethods"));
exports.ElvWalletClient = ElvWalletClient;