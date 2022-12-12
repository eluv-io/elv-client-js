var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _typeof = require("@babel/runtime/helpers/typeof");

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

var HTTPClient = require("../HttpClient");

var UrlJoin = require("url-join");

var Utils = require("../Utils");

var Ethers = require("ethers");

var inBrowser = typeof window !== "undefined";
var embedded = inBrowser && window.top !== window.self;
var localStorageAvailable = false;

try {
  typeof localStorage !== "undefined" && localStorage.getItem("test");
  localStorageAvailable = true; // eslint-disable-next-line no-empty
} catch (error) {}
/**
 * Use the <a href="#.Initialize">Initialize</a> method to initialize a new client.
 *
 *
 * See the Modules section on the sidebar for all client methods unrelated to login and authorization
 */


var ElvWalletClient = /*#__PURE__*/function () {
  "use strict";

  function ElvWalletClient(_ref) {
    var appId = _ref.appId,
        client = _ref.client,
        network = _ref.network,
        mode = _ref.mode,
        marketplaceInfo = _ref.marketplaceInfo,
        previewMarketplaceHash = _ref.previewMarketplaceHash,
        storeAuthToken = _ref.storeAuthToken;

    _classCallCheck(this, ElvWalletClient);

    this.appId = appId;
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
    this.previewMarketplaceId = previewMarketplaceHash ? Utils.DecodeVersionHash(previewMarketplaceHash).objectId : undefined;
    this.previewMarketplaceHash = previewMarketplaceHash;
    this.availableMarketplaces = {};
    this.availableMarketplacesById = {};
    this.marketplaceHashes = {};
    this.stateStoreUrls = Configuration[network].stateStoreUrls;
    this.stateStoreClient = new HTTPClient({
      uris: this.stateStoreUrls
    }); // Caches

    this.cachedMarketplaces = {};
    this.cachedCSS = {};
    this.utils = client.utils;
  }

  _createClass(ElvWalletClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var errorObject = arguments.length > 2 ? arguments[2] : undefined;

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Eluvio Wallet Client:", message);
      } else {
        // eslint-disable-next-line no-console
        console.log("Eluvio Wallet Client:", message);
      }

      if (errorObject) {
        // eslint-disable-next-line no-console
        console.error(errorObject);
      }
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

  }, {
    key: "CanSign",
    value:
    /* Login and authorization */

    /**
     * Check if this client can sign without opening a popup.
     *
     * Generally, Eluvio custodial wallet users will require a popup prompt, while Metamask and custom OAuth users will not.
     *
     * @methodGroup Signatures
     * @returns {boolean} - Whether or not this client can sign a message without a popup.
     */
    function CanSign() {
      if (!this.loggedIn) {
        return false;
      }

      return !!this.__authorization.clusterToken || inBrowser && !!(this.UserInfo().walletName.toLowerCase() === "metamask" && window.ethereum && window.ethereum.isMetaMask && window.ethereum.chainId);
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

  }, {
    key: "PersonalSign",
    value: function () {
      var _PersonalSign = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref2) {
        var message, parameters, url;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                message = _ref2.message;

                if (this.loggedIn) {
                  _context3.next = 3;
                  break;
                }

                throw Error("ElvWalletClient: Unable to perform signature - Not logged in");

              case 3:
                if (!this.CanSign()) {
                  _context3.next = 19;
                  break;
                }

                if (!this.__authorization.clusterToken) {
                  _context3.next = 12;
                  break;
                }

                // Custodial wallet sign
                message = _typeof(message) === "object" ? JSON.stringify(message) : message;
                message = Ethers.utils.keccak256(Buffer.from("\x19Ethereum Signed Message:\n".concat(message.length).concat(message), "utf-8"));
                _context3.next = 9;
                return this.client.authClient.Sign(message);

              case 9:
                return _context3.abrupt("return", _context3.sent);

              case 12:
                if (!(this.UserInfo().walletName.toLowerCase() === "metamask")) {
                  _context3.next = 16;
                  break;
                }

                return _context3.abrupt("return", this.SignMetamask({
                  message: message,
                  address: this.UserAddress()
                }));

              case 16:
                throw Error("ElvWalletClient: Unable to sign");

              case 17:
                _context3.next = 21;
                break;

              case 19:
                if (inBrowser) {
                  _context3.next = 21;
                  break;
                }

                throw Error("ElvWalletClient: Unable to sign");

              case 21:
                parameters = {
                  action: "personal-sign",
                  message: message,
                  logIn: true
                };
                url = new URL(this.appUrl);
                url.hash = UrlJoin("/action", "sign", Utils.B58(JSON.stringify(parameters)));
                url.searchParams.set("origin", window.location.origin);

                if (!(!embedded && window.location.origin === url.origin)) {
                  _context3.next = 27;
                  break;
                }

                throw Error("ElvWalletClient: Unable to sign");

              case 27:
                _context3.next = 29;
                return new Promise( /*#__PURE__*/function () {
                  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(resolve, reject) {
                    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.next = 2;
                            return ActionPopup({
                              mode: "tab",
                              url: url.toString(),
                              onCancel: function onCancel() {
                                return reject("User cancelled sign");
                              },
                              onMessage: function () {
                                var _onMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(event, Close) {
                                  return _regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                      switch (_context.prev = _context.next) {
                                        case 0:
                                          if (!(!event || !event.data || event.data.type !== "FlowResponse")) {
                                            _context.next = 2;
                                            break;
                                          }

                                          return _context.abrupt("return");

                                        case 2:
                                          try {
                                            resolve(event.data.response);
                                          } catch (error) {
                                            reject(error);
                                          } finally {
                                            Close();
                                          }

                                        case 3:
                                        case "end":
                                          return _context.stop();
                                      }
                                    }
                                  }, _callee);
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

              case 29:
                return _context3.abrupt("return", _context3.sent);

              case 30:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function PersonalSign(_x) {
        return _PersonalSign.apply(this, arguments);
      }

      return PersonalSign;
    }()
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

  }, {
    key: "LogIn",
    value: function () {
      var _LogIn = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref4) {
        var _this = this;

        var _ref4$method, method, provider, _ref4$mode, mode, callbackUrl, marketplaceParams, _ref4$clearLogin, clearLogin, callback, loginUrl;

        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _ref4$method = _ref4.method, method = _ref4$method === void 0 ? "redirect" : _ref4$method, provider = _ref4.provider, _ref4$mode = _ref4.mode, mode = _ref4$mode === void 0 ? "login" : _ref4$mode, callbackUrl = _ref4.callbackUrl, marketplaceParams = _ref4.marketplaceParams, _ref4$clearLogin = _ref4.clearLogin, clearLogin = _ref4$clearLogin === void 0 ? false : _ref4$clearLogin, callback = _ref4.callback;
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
                  _context6.next = 15;
                  break;
                }

                _context6.t0 = loginUrl.searchParams;
                _context6.next = 11;
                return this.MarketplaceInfo({
                  marketplaceParams: marketplaceParams
                });

              case 11:
                _context6.t1 = _context6.sent.marketplaceHash;

                _context6.t0.set.call(_context6.t0, "mid", _context6.t1);

                _context6.next = 16;
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
                  _context6.next = 24;
                  break;
                }

                loginUrl.searchParams.set("response", "redirect");
                loginUrl.searchParams.set("source", "origin");
                loginUrl.searchParams.set("redirect", callbackUrl);
                window.location = loginUrl;
                _context6.next = 28;
                break;

              case 24:
                loginUrl.searchParams.set("response", "message");
                loginUrl.searchParams.set("source", "parent");
                _context6.next = 28;
                return new Promise( /*#__PURE__*/function () {
                  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(resolve, reject) {
                    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.next = 2;
                            return ActionPopup({
                              mode: "tab",
                              url: loginUrl.toString(),
                              onCancel: function onCancel() {
                                return reject("User cancelled login");
                              },
                              onMessage: function () {
                                var _onMessage2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(event, Close) {
                                  return _regeneratorRuntime.wrap(function _callee4$(_context4) {
                                    while (1) {
                                      switch (_context4.prev = _context4.next) {
                                        case 0:
                                          if (!(!event || !event.data || event.data.type !== "LoginResponse")) {
                                            _context4.next = 2;
                                            break;
                                          }

                                          return _context4.abrupt("return");

                                        case 2:
                                          _context4.prev = 2;

                                          if (!callback) {
                                            _context4.next = 8;
                                            break;
                                          }

                                          _context4.next = 6;
                                          return callback(event.data.params);

                                        case 6:
                                          _context4.next = 10;
                                          break;

                                        case 8:
                                          _context4.next = 10;
                                          return _this.Authenticate({
                                            token: event.data.params.clientSigningToken || event.data.params.clientAuthToken
                                          });

                                        case 10:
                                          resolve();
                                          _context4.next = 16;
                                          break;

                                        case 13:
                                          _context4.prev = 13;
                                          _context4.t0 = _context4["catch"](2);
                                          reject(_context4.t0);

                                        case 16:
                                          _context4.prev = 16;
                                          Close();
                                          return _context4.finish(16);

                                        case 19:
                                        case "end":
                                          return _context4.stop();
                                      }
                                    }
                                  }, _callee4, null, [[2, 13, 16, 19]]);
                                }));

                                function onMessage(_x9, _x10) {
                                  return _onMessage2.apply(this, arguments);
                                }

                                return onMessage;
                              }()
                            });

                          case 2:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5);
                  }));

                  return function (_x7, _x8) {
                    return _ref5.apply(this, arguments);
                  };
                }());

              case 28:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function LogIn(_x6) {
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

      if (localStorageAvailable) {
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
      var _Authenticate = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(_ref6) {
        var token, decodedToken;
        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                token = _ref6.token;
                _context7.prev = 1;
                decodedToken = JSON.parse(this.utils.FromB58ToStr(token)) || {};
                _context7.next = 8;
                break;

              case 5:
                _context7.prev = 5;
                _context7.t0 = _context7["catch"](1);
                throw new Error("Invalid authorization token " + token);

              case 8:
                if (!(!decodedToken.expiresAt || Date.now() > decodedToken.expiresAt)) {
                  _context7.next = 10;
                  break;
                }

                throw Error("ElvWalletClient: Provided authorization token has expired");

              case 10:
                if (!decodedToken.clusterToken) {
                  _context7.next = 13;
                  break;
                }

                _context7.next = 13;
                return this.client.SetRemoteSigner({
                  authToken: decodedToken.clusterToken,
                  signerURIs: decodedToken.signerURIs
                });

              case 13:
                this.client.SetStaticToken({
                  token: decodedToken.fabricToken
                });
                return _context7.abrupt("return", this.SetAuthorization(_objectSpread({}, decodedToken)));

              case 15:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[1, 5]]);
      }));

      function Authenticate(_x11) {
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

  }, {
    key: "AuthenticateOAuth",
    value: function () {
      var _AuthenticateOAuth = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(_ref7) {
        var idToken, tenantId, email, signerURIs, _ref7$shareEmail, shareEmail, tokenDuration, expiresAt, fabricToken, address, decodedToken;

        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                idToken = _ref7.idToken, tenantId = _ref7.tenantId, email = _ref7.email, signerURIs = _ref7.signerURIs, _ref7$shareEmail = _ref7.shareEmail, shareEmail = _ref7$shareEmail === void 0 ? false : _ref7$shareEmail;
                tokenDuration = 24;

                if (!(!tenantId && this.selectedMarketplaceInfo)) {
                  _context8.next = 6;
                  break;
                }

                _context8.next = 5;
                return this.AvailableMarketplaces();

              case 5:
                tenantId = this.selectedMarketplaceInfo.tenantId;

              case 6:
                _context8.next = 8;
                return this.client.SetRemoteSigner({
                  idToken: idToken,
                  tenantId: tenantId,
                  signerURIs: signerURIs,
                  extraData: {
                    share_email: shareEmail
                  },
                  unsignedPublicAuth: true
                });

              case 8:
                expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
                _context8.next = 11;
                return this.client.CreateFabricToken({
                  duration: tokenDuration * 60 * 60 * 1000
                });

              case 11:
                fabricToken = _context8.sent;
                address = this.client.utils.FormatAddress(this.client.CurrentAccountAddress());

                if (email) {
                  _context8.next = 22;
                  break;
                }

                _context8.prev = 14;
                decodedToken = JSON.parse(this.utils.FromB64URL(idToken.split(".")[1]));
                email = decodedToken.email;
                _context8.next = 22;
                break;

              case 19:
                _context8.prev = 19;
                _context8.t0 = _context8["catch"](14);
                throw Error("Failed to decode ID token");

              case 22:
                this.client.SetStaticToken({
                  token: fabricToken
                });
                return _context8.abrupt("return", {
                  authToken: this.SetAuthorization({
                    fabricToken: fabricToken,
                    tenantId: tenantId,
                    address: address,
                    email: email,
                    expiresAt: expiresAt,
                    signerURIs: signerURIs,
                    walletType: "Custodial",
                    walletName: "Eluvio",
                    register: true
                  }),
                  signingToken: this.SetAuthorization({
                    clusterToken: this.client.signer.authToken,
                    fabricToken: fabricToken,
                    tenantId: tenantId,
                    address: address,
                    email: email,
                    expiresAt: expiresAt,
                    signerURIs: signerURIs,
                    walletType: "Custodial",
                    walletName: "Eluvio"
                  })
                });

              case 24:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[14, 19]]);
      }));

      function AuthenticateOAuth(_x12) {
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
      var _AuthenticateExternalWallet = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(_ref8) {
        var _this2 = this;

        var address, _ref8$tokenDuration, tokenDuration, _ref8$walletName, walletName, Sign, expiresAt, fabricToken;

        return _regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                address = _ref8.address, _ref8$tokenDuration = _ref8.tokenDuration, tokenDuration = _ref8$tokenDuration === void 0 ? 24 : _ref8$tokenDuration, _ref8$walletName = _ref8.walletName, walletName = _ref8$walletName === void 0 ? "Metamask" : _ref8$walletName, Sign = _ref8.Sign;

                if (!address) {
                  address = window.ethereum.selectedAddress;
                }

                address = this.utils.FormatAddress(address);

                if (!Sign) {
                  Sign = /*#__PURE__*/function () {
                    var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(message) {
                      return _regeneratorRuntime.wrap(function _callee9$(_context9) {
                        while (1) {
                          switch (_context9.prev = _context9.next) {
                            case 0:
                              return _context9.abrupt("return", _this2.SignMetamask({
                                message: message,
                                address: address
                              }));

                            case 1:
                            case "end":
                              return _context9.stop();
                          }
                        }
                      }, _callee9);
                    }));

                    return function Sign(_x14) {
                      return _ref9.apply(this, arguments);
                    };
                  }();
                }

                expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
                _context10.next = 7;
                return this.client.CreateFabricToken({
                  address: address,
                  duration: tokenDuration * 60 * 60 * 1000,
                  Sign: Sign,
                  addEthereumPrefix: false
                });

              case 7:
                fabricToken = _context10.sent;
                return _context10.abrupt("return", this.SetAuthorization({
                  fabricToken: fabricToken,
                  address: address,
                  expiresAt: expiresAt,
                  walletType: "External",
                  walletName: walletName,
                  register: true
                }));

              case 9:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function AuthenticateExternalWallet(_x13) {
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
    value: function SetAuthorization(_ref10) {
      var _this3 = this;

      var clusterToken = _ref10.clusterToken,
          fabricToken = _ref10.fabricToken,
          tenantId = _ref10.tenantId,
          address = _ref10.address,
          email = _ref10.email,
          expiresAt = _ref10.expiresAt,
          signerURIs = _ref10.signerURIs,
          walletType = _ref10.walletType,
          walletName = _ref10.walletName,
          _ref10$register = _ref10.register,
          register = _ref10$register === void 0 ? false : _ref10$register;
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

        if (signerURIs) {
          this.__authorization.signerURIs = signerURIs;
        }
      }

      this.loggedIn = true;
      this.cachedMarketplaces = {};
      var token = this.ClientAuthToken();

      if (this.storeAuthToken && localStorageAvailable) {
        try {
          localStorage.setItem("__elv-token-".concat(this.network), token); // eslint-disable-next-line no-empty
        } catch (error) {}
      }

      if (register) {
        this.client.authClient.MakeAuthServiceRequest({
          path: "/as/wlt/register",
          method: "POST",
          headers: {
            Authorization: "Bearer ".concat(this.AuthToken())
          }
        })["catch"](function (error) {
          _this3.Log("Failed to register account: ", true, error);
        });
      }

      return token;
    }
  }, {
    key: "SignMetamask",
    value: function () {
      var _SignMetamask = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref11) {
        var message, address, accounts;
        return _regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                message = _ref11.message, address = _ref11.address;

                if (!(!inBrowser || !window.ethereum)) {
                  _context11.next = 3;
                  break;
                }

                throw Error("ElvWalletClient: Unable to initialize - Metamask not available");

              case 3:
                address = address || this.UserAddress();
                _context11.next = 6;
                return window.ethereum.request({
                  method: "eth_requestAccounts"
                });

              case 6:
                accounts = _context11.sent;

                if (!(address && !Utils.EqualAddress(accounts[0], address))) {
                  _context11.next = 9;
                  break;
                }

                throw Error("ElvWalletClient: Incorrect MetaMask account selected. Expected ".concat(address, ", got ").concat(accounts[0]));

              case 9:
                _context11.next = 11;
                return window.ethereum.request({
                  method: "personal_sign",
                  params: [message, address, ""]
                });

              case 11:
                return _context11.abrupt("return", _context11.sent);

              case 12:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function SignMetamask(_x15) {
        return _SignMetamask.apply(this, arguments);
      }

      return SignMetamask;
    }() // Internal loading methods

  }, {
    key: "LoadAvailableMarketplaces",
    value: function () {
      var _LoadAvailableMarketplaces = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12() {
        var _this4 = this;

        var forceReload,
            mainSiteHash,
            metadata,
            previewTenantSlug,
            previewMarketplaceSlug,
            previewMarketplaceMetadata,
            availableMarketplaces,
            availableMarketplacesById,
            _args12 = arguments;
        return _regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                forceReload = _args12.length > 0 && _args12[0] !== undefined ? _args12[0] : false;

                if (!(!forceReload && Object.keys(this.availableMarketplaces) > 0)) {
                  _context12.next = 3;
                  break;
                }

                return _context12.abrupt("return");

              case 3:
                _context12.next = 5;
                return this.client.LatestVersionHash({
                  objectId: this.mainSiteId
                });

              case 5:
                mainSiteHash = _context12.sent;
                _context12.next = 8;
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
                  select: ["*/.", "*/marketplaces/*/.", "*/marketplaces/*/info/tenant_id", "*/marketplaces/*/info/tenant_name", "*/marketplaces/*/info/branding", "*/marketplaces/*/info/storefront/background", "*/marketplaces/*/info/storefront/background_mobile"],
                  remove: ["*/marketplaces/*/info/branding/custom_css"]
                });

              case 8:
                metadata = _context12.sent;

                if (!this.previewMarketplaceId) {
                  _context12.next = 24;
                  break;
                }

                previewTenantSlug = "PREVIEW";
                Object.keys(metadata || {}).forEach(function (tenantSlug) {
                  return Object.keys(metadata[tenantSlug].marketplaces || {}).forEach(function (marketplaceSlug) {
                    var versionHash = metadata[tenantSlug].marketplaces[marketplaceSlug]["."].source;

                    var objectId = _this4.utils.DecodeVersionHash(versionHash).objectId;

                    if (objectId === _this4.previewMarketplaceId) {
                      // Marketplace exists in site meta
                      previewTenantSlug = tenantSlug;
                      previewMarketplaceSlug = marketplaceSlug; // Deployed marketplace is same as preview marketplace

                      if (versionHash === _this4.previewMarketplaceHash) {
                        previewMarketplaceMetadata = metadata[tenantSlug].marketplaces[marketplaceSlug];
                      }
                    }
                  });
                }); // Marketplace not present in branch, or preview version is different - Load metadata directly

                if (previewMarketplaceMetadata) {
                  _context12.next = 17;
                  break;
                }

                _context12.next = 15;
                return this.client.ContentObjectMetadata({
                  versionHash: this.previewMarketplaceHash,
                  metadataSubtree: "public/asset_metadata",
                  produceLinkUrls: true,
                  authorizationToken: this.publicStaticToken,
                  noAuth: true,
                  select: ["slug", "info/tenant_id", "info/tenant_name", "info/branding"],
                  remove: ["info/branding/custom_css"]
                });

              case 15:
                previewMarketplaceMetadata = _context12.sent;

                if (!previewMarketplaceSlug) {
                  previewMarketplaceSlug = previewMarketplaceMetadata.slug;
                }

              case 17:
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

              case 24:
                availableMarketplaces = _objectSpread({}, this.availableMarketplaces || {});
                availableMarketplacesById = _objectSpread({}, this.availableMarketplacesById || {});
                Object.keys(metadata || {}).forEach(function (tenantSlug) {
                  try {
                    availableMarketplaces[tenantSlug] = metadata[tenantSlug]["."] ? {
                      versionHash: metadata[tenantSlug]["."].source
                    } : {};
                    Object.keys(metadata[tenantSlug].marketplaces || {}).forEach(function (marketplaceSlug) {
                      try {
                        var versionHash = metadata[tenantSlug].marketplaces[marketplaceSlug]["."].source;

                        var objectId = _this4.utils.DecodeVersionHash(versionHash).objectId;

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
                        _this4.marketplaceHashes[objectId] = versionHash; // Fill out selected marketplace info

                        if (_this4.selectedMarketplaceInfo) {
                          if (_this4.selectedMarketplaceInfo.tenantSlug === tenantSlug && _this4.selectedMarketplaceInfo.marketplaceSlug === marketplaceSlug || _this4.selectedMarketplaceInfo.marketplaceId === objectId) {
                            _this4.selectedMarketplaceInfo = availableMarketplaces[tenantSlug][marketplaceSlug];
                          }
                        }
                      } catch (error) {
                        _this4.Log("Eluvio Wallet Client: Unable to load info for marketplace ".concat(tenantSlug, "/").concat(marketplaceSlug), true);
                      }
                    });
                  } catch (error) {
                    _this4.Log("Eluvio Wallet Client: Failed to load tenant info ".concat(tenantSlug), true, error);
                  }
                });
                this.availableMarketplaces = availableMarketplaces;
                this.availableMarketplacesById = availableMarketplacesById;

              case 29:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function LoadAvailableMarketplaces() {
        return _LoadAvailableMarketplaces.apply(this, arguments);
      }

      return LoadAvailableMarketplaces;
    }() // Get the hash of the currently linked marketplace

  }, {
    key: "LatestMarketplaceHash",
    value: function () {
      var _LatestMarketplaceHash = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(_ref12) {
        var marketplaceParams, marketplaceInfo, mainSiteHash, marketplaceLink;
        return _regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                marketplaceParams = _ref12.marketplaceParams;
                _context13.next = 3;
                return this.MarketplaceInfo({
                  marketplaceParams: marketplaceParams
                });

              case 3:
                marketplaceInfo = _context13.sent;

                if (!(this.previewMarketplaceId && this.previewMarketplaceId === marketplaceInfo.marketplaceId)) {
                  _context13.next = 6;
                  break;
                }

                return _context13.abrupt("return", this.availableMarketplaces[marketplaceInfo.tenantSlug][marketplaceInfo.marketplaceSlug]["."].source);

              case 6:
                _context13.next = 8;
                return this.client.LatestVersionHash({
                  objectId: this.mainSiteId
                });

              case 8:
                mainSiteHash = _context13.sent;
                _context13.next = 11;
                return this.client.ContentObjectMetadata({
                  versionHash: mainSiteHash,
                  metadataSubtree: UrlJoin("/public", "asset_metadata", "tenants", marketplaceInfo.tenantSlug, "marketplaces", marketplaceInfo.marketplaceSlug),
                  resolveLinks: false
                });

              case 11:
                marketplaceLink = _context13.sent;
                return _context13.abrupt("return", LinkTargetHash(marketplaceLink));

              case 13:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function LatestMarketplaceHash(_x16) {
        return _LatestMarketplaceHash.apply(this, arguments);
      }

      return LatestMarketplaceHash;
    }()
  }, {
    key: "LoadMarketplace",
    value: function () {
      var _LoadMarketplace = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(marketplaceParams) {
        var _this5 = this;

        var marketplaceInfo, marketplaceId, marketplaceHash, marketplace;
        return _regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                marketplaceInfo = this.MarketplaceInfo({
                  marketplaceParams: marketplaceParams
                });
                marketplaceId = marketplaceInfo.marketplaceId;
                _context15.next = 4;
                return this.LatestMarketplaceHash({
                  marketplaceParams: marketplaceParams
                });

              case 4:
                marketplaceHash = _context15.sent;

                if (this.cachedMarketplaces[marketplaceId] && this.cachedMarketplaces[marketplaceId].versionHash !== marketplaceHash) {
                  delete this.cachedMarketplaces[marketplaceId];
                }

                if (this.cachedMarketplaces[marketplaceId]) {
                  _context15.next = 21;
                  break;
                }

                _context15.next = 9;
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
                marketplace = _context15.sent;
                _context15.next = 12;
                return Promise.all(marketplace.items.map( /*#__PURE__*/function () {
                  var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(item, index) {
                    var authorizationToken;
                    return _regeneratorRuntime.wrap(function _callee14$(_context14) {
                      while (1) {
                        switch (_context14.prev = _context14.next) {
                          case 0:
                            if (!item.requires_permissions) {
                              _context14.next = 14;
                              break;
                            }

                            if (_this5.loggedIn) {
                              _context14.next = 5;
                              break;
                            }

                            _context14.next = 4;
                            return _this5.client.CreateFabricToken({});

                          case 4:
                            authorizationToken = _context14.sent;

                          case 5:
                            _context14.prev = 5;
                            _context14.next = 8;
                            return _this5.client.ContentObjectMetadata({
                              versionHash: LinkTargetHash(item.nft_template),
                              metadataSubtree: "permissioned",
                              authorizationToken: authorizationToken
                            });

                          case 8:
                            item.authorized = true;
                            _context14.next = 14;
                            break;

                          case 11:
                            _context14.prev = 11;
                            _context14.t0 = _context14["catch"](5);
                            item.authorized = false;

                          case 14:
                            item.nftTemplateMetadata = (item.nft_template || {}).nft || {};
                            item.nftTemplateHash = ((item.nft_template || {})["."] || {}).source;
                            item.itemIndex = index;
                            return _context14.abrupt("return", item);

                          case 18:
                          case "end":
                            return _context14.stop();
                        }
                      }
                    }, _callee14, null, [[5, 11]]);
                  }));

                  return function (_x18, _x19) {
                    return _ref13.apply(this, arguments);
                  };
                }()));

              case 12:
                marketplace.items = _context15.sent;
                marketplace.collections = (marketplace.collections || []).map(function (collection, collectionIndex) {
                  return _objectSpread(_objectSpread({}, collection), {}, {
                    collectionIndex: collectionIndex
                  });
                });
                marketplace.retrievedAt = Date.now();
                marketplace.marketplaceId = marketplaceId;
                marketplace.versionHash = marketplaceHash;
                marketplace.marketplaceHash = marketplaceHash;

                if (this.previewMarketplaceId && marketplaceId === this.previewMarketplaceId) {
                  marketplace.branding.preview = true;
                } // Generate embed URLs for pack opening animations


                ["purchase_animation", "purchase_animation__mobile", "reveal_animation", "reveal_animation_mobile"].forEach(function (key) {
                  try {
                    if (marketplace.storefront[key]) {
                      var embedUrl = new URL("https://embed.v3.contentfabric.io");
                      var targetHash = LinkTargetHash(marketplace.storefront[key]);
                      embedUrl.searchParams.set("p", "");
                      embedUrl.searchParams.set("net", _this5.network === "main" ? "main" : "demo");
                      embedUrl.searchParams.set("ath", (_this5.__authorization || {}).authToken || _this5.publicStaticToken);
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

              case 21:
                return _context15.abrupt("return", this.cachedMarketplaces[marketplaceId]);

              case 22:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function LoadMarketplace(_x17) {
        return _LoadMarketplace.apply(this, arguments);
      }

      return LoadMarketplace;
    }()
  }, {
    key: "FilteredQuery",
    value: function () {
      var _FilteredQuery = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16() {
        var _this6 = this;

        var _ref14,
            _ref14$mode,
            mode,
            _ref14$sortBy,
            sortBy,
            _ref14$sortDesc,
            sortDesc,
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
            _ref14$lastNDays,
            lastNDays,
            _ref14$includeCheckou,
            includeCheckoutLocked,
            _ref14$start,
            start,
            _ref14$limit,
            limit,
            params,
            marketplaceInfo,
            marketplace,
            filters,
            path,
            _ref16,
            contents,
            paging,
            _args16 = arguments;

        return _regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _ref14 = _args16.length > 0 && _args16[0] !== undefined ? _args16[0] : {}, _ref14$mode = _ref14.mode, mode = _ref14$mode === void 0 ? "listings" : _ref14$mode, _ref14$sortBy = _ref14.sortBy, sortBy = _ref14$sortBy === void 0 ? "created" : _ref14$sortBy, _ref14$sortDesc = _ref14.sortDesc, sortDesc = _ref14$sortDesc === void 0 ? false : _ref14$sortDesc, filter = _ref14.filter, editionFilters = _ref14.editionFilters, attributeFilters = _ref14.attributeFilters, contractAddress = _ref14.contractAddress, tokenId = _ref14.tokenId, currency = _ref14.currency, marketplaceParams = _ref14.marketplaceParams, tenantId = _ref14.tenantId, collectionIndexes = _ref14.collectionIndexes, priceRange = _ref14.priceRange, tokenIdRange = _ref14.tokenIdRange, capLimit = _ref14.capLimit, userAddress = _ref14.userAddress, sellerAddress = _ref14.sellerAddress, _ref14$lastNDays = _ref14.lastNDays, lastNDays = _ref14$lastNDays === void 0 ? -1 : _ref14$lastNDays, _ref14$includeCheckou = _ref14.includeCheckoutLocked, includeCheckoutLocked = _ref14$includeCheckou === void 0 ? false : _ref14$includeCheckou, _ref14$start = _ref14.start, start = _ref14$start === void 0 ? 0 : _ref14$start, _ref14$limit = _ref14.limit, limit = _ref14$limit === void 0 ? 50 : _ref14$limit;
                collectionIndexes = (collectionIndexes || []).map(function (i) {
                  return parseInt(i);
                });
                params = {
                  start: start,
                  limit: limit,
                  sort_descending: sortDesc
                };

                if (mode !== "leaderboard") {
                  params.sort_by = sortBy;
                }

                if (mode.includes("listings") && includeCheckoutLocked) {
                  params.checkout = true;
                }

                if (!marketplaceParams) {
                  _context16.next = 13;
                  break;
                }

                _context16.next = 8;
                return this.MarketplaceInfo({
                  marketplaceParams: marketplaceParams
                });

              case 8:
                marketplaceInfo = _context16.sent;

                if (!(collectionIndexes.length > 0)) {
                  _context16.next = 13;
                  break;
                }

                _context16.next = 12;
                return this.Marketplace({
                  marketplaceParams: marketplaceParams
                });

              case 12:
                marketplace = _context16.sent;

              case 13:
                _context16.prev = 13;
                filters = [];

                if (sellerAddress) {
                  filters.push("seller:eq:".concat(this.client.utils.FormatAddress(sellerAddress)));
                } else if (userAddress && mode !== "owned") {
                  filters.push("addr:eq:".concat(this.client.utils.FormatAddress(userAddress)));
                }

                if (marketplace && collectionIndexes.length >= 0) {
                  collectionIndexes.forEach(function (collectionIndex) {
                    var collection = marketplace.collections[collectionIndex];
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
                    });
                  });
                } else if (marketplaceInfo || tenantId) {
                  filters.push("tenant:eq:".concat(marketplaceInfo ? marketplaceInfo.tenantId : tenantId));
                }

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
                    filters.push("meta/display_name:eq:".concat(filter));
                  } else {
                    filters.push("name:eq:".concat(filter));
                  }
                }

                if (editionFilters) {
                  editionFilters.forEach(function (editionFilter) {
                    if (mode.includes("listing")) {
                      filters.push("nft/edition_name:eq:".concat(editionFilter));
                    } else if (mode === "owned") {
                      filters.push("meta:@>:{\"edition_name\":\"".concat(editionFilter, "\"}"));
                      params.exact = false;
                    } else {
                      filters.push("edition:eq:".concat(editionFilter));
                    }
                  });
                }

                if (attributeFilters) {
                  attributeFilters.map(function (_ref15) {
                    var name = _ref15.name,
                        value = _ref15.value;

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

                if (priceRange) {
                  if (priceRange.min) {
                    filters.push("price:ge:".concat(parseFloat(priceRange.min)));
                  }

                  if (priceRange.max) {
                    filters.push("price:le:".concat(parseFloat(priceRange.max)));
                  }
                }

                if (tokenIdRange) {
                  if (tokenIdRange.min) {
                    filters.push("info/token_id:ge:".concat(parseInt(tokenIdRange.min)));
                  }

                  if (tokenIdRange.max) {
                    filters.push("info/token_id:le:".concat(parseInt(tokenIdRange.max)));
                  }
                }

                if (capLimit) {
                  filters.push("info/cap:le:".concat(parseInt(capLimit)));
                }

                _context16.t0 = mode;
                _context16.next = _context16.t0 === "owned" ? 28 : _context16.t0 === "listings" ? 30 : _context16.t0 === "transfers" ? 32 : _context16.t0 === "sales" ? 36 : _context16.t0 === "listing-stats" ? 40 : _context16.t0 === "sales-stats" ? 42 : _context16.t0 === "leaderboard" ? 45 : 47;
                break;

              case 28:
                path = UrlJoin("as", "wlt", userAddress || this.UserAddress());
                return _context16.abrupt("break", 47);

              case 30:
                path = UrlJoin("as", "mkt", "f");
                return _context16.abrupt("break", 47);

              case 32:
                path = UrlJoin("as", "mkt", "hst", "f");
                filters.push("action:eq:TRANSFERRED");
                filters.push("action:eq:SOLD");
                return _context16.abrupt("break", 47);

              case 36:
                path = UrlJoin("as", "mkt", "hst", "f");
                filters.push("action:eq:SOLD");
                filters.push("seller:co:0x");
                return _context16.abrupt("break", 47);

              case 40:
                path = UrlJoin("as", "mkt", "stats", "listed");
                return _context16.abrupt("break", 47);

              case 42:
                path = UrlJoin("as", "mkt", "stats", "sold");
                filters.push("seller:co:0x");
                return _context16.abrupt("break", 47);

              case 45:
                path = UrlJoin("as", "wlt", "leaders");
                return _context16.abrupt("break", 47);

              case 47:
                if (filters.length > 0) {
                  params.filter = filters;
                }

                if (!mode.includes("stats")) {
                  _context16.next = 52;
                  break;
                }

                _context16.next = 51;
                return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
                  path: path,
                  method: "GET",
                  queryParams: params
                }));

              case 51:
                return _context16.abrupt("return", _context16.sent);

              case 52:
                _context16.t2 = Utils;
                _context16.next = 55;
                return this.client.authClient.MakeAuthServiceRequest({
                  path: path,
                  method: "GET",
                  queryParams: params
                });

              case 55:
                _context16.t3 = _context16.sent;
                _context16.next = 58;
                return _context16.t2.ResponseToJson.call(_context16.t2, _context16.t3);

              case 58:
                _context16.t1 = _context16.sent;

                if (_context16.t1) {
                  _context16.next = 61;
                  break;
                }

                _context16.t1 = [];

              case 61:
                _ref16 = _context16.t1;
                contents = _ref16.contents;
                paging = _ref16.paging;
                return _context16.abrupt("return", {
                  paging: {
                    start: params.start,
                    limit: params.limit,
                    total: paging.total,
                    more: paging.total > start + limit
                  },
                  results: (contents || []).map(function (item) {
                    return ["owned", "listings"].includes(mode) ? FormatNFT(_this6, item) : item;
                  })
                });

              case 67:
                _context16.prev = 67;
                _context16.t4 = _context16["catch"](13);

                if (!(_context16.t4.status && _context16.t4.status.toString() === "404")) {
                  _context16.next = 71;
                  break;
                }

                return _context16.abrupt("return", {
                  paging: {
                    start: params.start,
                    limit: params.limit,
                    total: 0,
                    more: false
                  },
                  results: []
                });

              case 71:
                throw _context16.t4;

              case 72:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this, [[13, 67]]);
      }));

      function FilteredQuery() {
        return _FilteredQuery.apply(this, arguments);
      }

      return FilteredQuery;
    }()
  }, {
    key: "MintingStatus",
    value: function () {
      var _MintingStatus = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(_ref17) {
        var marketplaceParams, tenantId, marketplaceInfo, response;
        return _regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                marketplaceParams = _ref17.marketplaceParams, tenantId = _ref17.tenantId;

                if (tenantId) {
                  _context17.next = 6;
                  break;
                }

                _context17.next = 4;
                return this.MarketplaceInfo({
                  marketplaceParams: marketplaceParams || this.selectedMarketplaceInfo
                });

              case 4:
                marketplaceInfo = _context17.sent;
                tenantId = marketplaceInfo.tenantId;

              case 6:
                _context17.prev = 6;
                _context17.next = 9;
                return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
                  path: UrlJoin("as", "wlt", "status", "act", tenantId),
                  method: "GET",
                  headers: {
                    Authorization: "Bearer ".concat(this.AuthToken())
                  }
                }));

              case 9:
                response = _context17.sent;
                return _context17.abrupt("return", response.map(function (status) {
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
                _context17.prev = 13;
                _context17.t0 = _context17["catch"](6);
                this.Log("Failed to retrieve minting status", true, _context17.t0);
                return _context17.abrupt("return", []);

              case 17:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this, [[6, 13]]);
      }));

      function MintingStatus(_x20) {
        return _MintingStatus.apply(this, arguments);
      }

      return MintingStatus;
    }()
  }], [{
    key: "Initialize",
    value: function () {
      var _Initialize = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18(_ref18) {
        var client, _ref18$appId, appId, _ref18$network, network, _ref18$mode, mode, marketplaceParams, previewMarketplaceId, _ref18$storeAuthToken, storeAuthToken, _ref19, tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash, previewMarketplaceHash, walletClient, url, savedToken;

        return _regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                client = _ref18.client, _ref18$appId = _ref18.appId, appId = _ref18$appId === void 0 ? "general" : _ref18$appId, _ref18$network = _ref18.network, network = _ref18$network === void 0 ? "main" : _ref18$network, _ref18$mode = _ref18.mode, mode = _ref18$mode === void 0 ? "production" : _ref18$mode, marketplaceParams = _ref18.marketplaceParams, previewMarketplaceId = _ref18.previewMarketplaceId, _ref18$storeAuthToken = _ref18.storeAuthToken, storeAuthToken = _ref18$storeAuthToken === void 0 ? true : _ref18$storeAuthToken;
                _ref19 = marketplaceParams || {}, tenantSlug = _ref19.tenantSlug, marketplaceSlug = _ref19.marketplaceSlug, marketplaceId = _ref19.marketplaceId, marketplaceHash = _ref19.marketplaceHash;

                if (Configuration[network]) {
                  _context18.next = 6;
                  break;
                }

                throw Error("ElvWalletClient: Invalid network ".concat(network));

              case 6:
                if (Configuration[network][mode]) {
                  _context18.next = 8;
                  break;
                }

                throw Error("ElvWalletClient: Invalid mode ".concat(mode));

              case 8:
                if (client) {
                  _context18.next = 12;
                  break;
                }

                _context18.next = 11;
                return ElvClient.FromNetworkName({
                  networkName: network,
                  assumeV3: true
                });

              case 11:
                client = _context18.sent;

              case 12:
                previewMarketplaceHash = previewMarketplaceId;

                if (!(previewMarketplaceHash && !previewMarketplaceHash.startsWith("hq__"))) {
                  _context18.next = 17;
                  break;
                }

                _context18.next = 16;
                return client.LatestVersionHash({
                  objectId: previewMarketplaceId
                });

              case 16:
                previewMarketplaceHash = _context18.sent;

              case 17:
                walletClient = new ElvWalletClient({
                  appId: appId,
                  client: client,
                  network: network,
                  mode: mode,
                  marketplaceInfo: {
                    tenantSlug: tenantSlug,
                    marketplaceSlug: marketplaceSlug,
                    marketplaceId: marketplaceHash ? client.utils.DecodeVersionHash(marketplaceHash).objectId : marketplaceId,
                    marketplaceHash: marketplaceHash
                  },
                  previewMarketplaceHash: previewMarketplaceHash,
                  storeAuthToken: storeAuthToken
                });

                if (!(inBrowser && window.location && window.location.href)) {
                  _context18.next = 37;
                  break;
                }

                url = new URL(window.location.href);

                if (!url.searchParams.get("elvToken")) {
                  _context18.next = 27;
                  break;
                }

                _context18.next = 23;
                return walletClient.Authenticate({
                  token: url.searchParams.get("elvToken")
                });

              case 23:
                url.searchParams["delete"]("elvToken");
                window.history.replaceState("", "", url);
                _context18.next = 37;
                break;

              case 27:
                if (!(storeAuthToken && localStorageAvailable)) {
                  _context18.next = 37;
                  break;
                }

                _context18.prev = 28;
                // Load saved auth token
                savedToken = localStorage.getItem("__elv-token-".concat(network));

                if (!savedToken) {
                  _context18.next = 33;
                  break;
                }

                _context18.next = 33;
                return walletClient.Authenticate({
                  token: savedToken
                });

              case 33:
                _context18.next = 37;
                break;

              case 35:
                _context18.prev = 35;
                _context18.t0 = _context18["catch"](28);

              case 37:
                _context18.next = 39;
                return walletClient.LoadAvailableMarketplaces();

              case 39:
                return _context18.abrupt("return", walletClient);

              case 40:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, null, [[28, 35]]);
      }));

      function Initialize(_x21) {
        return _Initialize.apply(this, arguments);
      }

      return Initialize;
    }()
  }]);

  return ElvWalletClient;
}();

Object.assign(ElvWalletClient.prototype, require("./ClientMethods"));
Object.assign(ElvWalletClient.prototype, require("./Profile"));
Object.assign(ElvWalletClient.prototype, require("./Notifications"));
exports.ElvWalletClient = ElvWalletClient;