var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _typeof = require("@babel/runtime/helpers/typeof");

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

var HttpClient = require("./HttpClient"); // const ContentObjectVerification = require("./ContentObjectVerification");


var Utils = require("./Utils");

var Crypto = require("./Crypto");

var _require = require("./Validation"),
    ValidateAddress = _require.ValidateAddress,
    ValidateDate = _require.ValidateDate,
    ValidateObject = _require.ValidateObject,
    ValidatePresence = _require.ValidatePresence;

if (Utils.Platform() === Utils.PLATFORM_NODE) {
  // Define Response in node
  // eslint-disable-next-line no-global-assign
  global.Response = require("node-fetch").Response;
} else if (Utils.Platform() === Utils.PLATFORM_REACT_NATIVE) {
  // React native polyfill
  require("unorm");
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

      if (!this.debug) {
        return;
      }

      if (_typeof(message) === "object") {
        message = JSON.stringify(message);
      }

      error ? // eslint-disable-next-line no-console
      console.error("\n(elv-client-js#ElvClient) ".concat(message, "\n")) : // eslint-disable-next-line no-console
      console.log("\n(elv-client-js#ElvClient) ".concat(message, "\n"));
    }
    /**
     * Enable or disable verbose logging
     *
     * @methodGroup Miscellaneous
     *
     * @param {boolean} enable - Set logging
     */

  }, {
    key: "ToggleLogging",
    value: function ToggleLogging(enable) {
      this.debug = enable;
      this.authClient ? this.authClient.debug = enable : undefined;
      this.ethClient ? this.ethClient.debug = enable : undefined;
      this.HttpClient ? this.HttpClient.debug = enable : undefined;
      this.userProfileClient ? this.userProfileClient.debug = enable : undefined;

      if (enable) {
        this.Log("Debug Logging Enabled:\n        Content Space: ".concat(this.contentSpaceId, "\n        Fabric URLs: [\n\t\t").concat(this.fabricURIs.join(", \n\t\t"), "\n\t]\n        Ethereum URLs: [\n\t\t").concat(this.ethereumURIs.join(", \n\t\t"), "\n\t]"));
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

  }]);

  function ElvClient(_ref) {
    var contentSpaceId = _ref.contentSpaceId,
        fabricVersion = _ref.fabricVersion,
        fabricURIs = _ref.fabricURIs,
        ethereumURIs = _ref.ethereumURIs,
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
    this.fabricVersion = fabricVersion;
    this.fabricURIs = fabricURIs;
    this.ethereumURIs = ethereumURIs;
    this.trustAuthorityId = trustAuthorityId;
    this.noCache = noCache;
    this.noAuth = noAuth;
    this.debug = false;
    this.InitializeClients();

    if (staticToken) {
      this.SetStaticToken({
        token: staticToken
      });
    }
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


  _createClass(ElvClient, [{
    key: "InitializeClients",
    value: function InitializeClients() {
      // Cached info
      this.contentTypes = {};
      this.encryptionConks = {};
      this.reencryptionConks = {};
      this.stateChannelAccess = {};
      this.objectLibraryIds = {};
      this.objectImageUrls = {};
      this.visibilityInfo = {};
      this.HttpClient = new HttpClient({
        uris: this.fabricURIs,
        debug: this.debug
      });
      this.ethClient = new EthClient({
        client: this,
        uris: this.ethereumURIs,
        debug: this.debug
      });
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
     * - Available regions: na-west-north, na-west-south, na-east, eu-west, eu-east, as-east, au-east
     *
     * @return {Promise<Object>} - An object containing the updated fabric and ethereum URLs in order of preference
     */

  }, {
    key: "UseRegion",
    value: function UseRegion(_ref2) {
      var region, _ref3, fabricURIs, ethereumURIs;

      return _regeneratorRuntime.async(function UseRegion$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              region = _ref2.region;

              if (this.configUrl) {
                _context.next = 3;
                break;
              }

              throw Error("Unable to change region: Configuration URL not set");

            case 3:
              _context.next = 5;
              return _regeneratorRuntime.awrap(ElvClient.Configuration({
                configUrl: this.configUrl,
                region: region
              }));

            case 5:
              _ref3 = _context.sent;
              fabricURIs = _ref3.fabricURIs;
              ethereumURIs = _ref3.ethereumURIs;
              this.fabricURIs = fabricURIs;
              this.ethereumURIs = ethereumURIs;
              this.HttpClient.uris = fabricURIs;
              this.HttpClient.uriIndex = 0;
              this.ethClient.ethereumURIs = ethereumURIs;
              this.ethClient.ethereumURIIndex = 0;
              return _context.abrupt("return", {
                fabricURIs: fabricURIs,
                ethereumURIs: ethereumURIs
              });

            case 15:
            case "end":
              return _context.stop();
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
      return _regeneratorRuntime.async(function ResetRegion$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (this.configUrl) {
                _context2.next = 2;
                break;
              }

              throw Error("Unable to change region: Configuration URL not set");

            case 2:
              _context2.next = 4;
              return _regeneratorRuntime.awrap(this.UseRegion({
                region: ""
              }));

            case 4:
              return _context2.abrupt("return", _context2.sent);

            case 5:
            case "end":
              return _context2.stop();
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
    value: function NodeId(_ref4) {
      var region, _ref5, nodeId;

      return _regeneratorRuntime.async(function NodeId$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              region = _ref4.region;
              _context3.next = 3;
              return _regeneratorRuntime.awrap(ElvClient.Configuration({
                configUrl: this.configUrl,
                region: region
              }));

            case 3:
              _ref5 = _context3.sent;
              nodeId = _ref5.nodeId;
              return _context3.abrupt("return", nodeId);

            case 6:
            case "end":
              return _context3.stop();
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

  }, {
    key: "SetNodes",
    value: function SetNodes(_ref6) {
      var fabricURIs = _ref6.fabricURIs,
          ethereumURIs = _ref6.ethereumURIs;

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
      var signer = _ref7.signer;
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

  }, {
    key: "SetSignerFromWeb3Provider",
    value: function SetSignerFromWeb3Provider(_ref8) {
      var provider, ethProvider;
      return _regeneratorRuntime.async(function SetSignerFromWeb3Provider$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              provider = _ref8.provider;
              ethProvider = new Ethers.providers.Web3Provider(provider);
              ethProvider.pollingInterval = 250;
              this.signer = ethProvider.getSigner();
              _context4.next = 6;
              return _regeneratorRuntime.awrap(this.signer.getAddress());

            case 6:
              this.signer.address = _context4.sent;
              _context4.next = 9;
              return _regeneratorRuntime.awrap(this.InitializeClients());

            case 9:
            case "end":
              return _context4.stop();
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
    value: function SetOauthToken(_ref9) {
      var token, wallet, signer;
      return _regeneratorRuntime.async(function SetOauthToken$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              token = _ref9.token;
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
              return _context5.stop();
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
    value: function SetSignerFromOauthToken(_ref10) {
      var token, wallet, client, _ref11, urls, path, httpClient, response, privateKey;

      return _regeneratorRuntime.async(function SetSignerFromOauthToken$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              token = _ref10.token;

              if (this.trustAuthorityId) {
                _context6.next = 3;
                break;
              }

              throw Error("Unable to authorize with OAuth token: No trust authority ID set");

            case 3:
              wallet = this.GenerateWallet();
              _context6.prev = 4;

              if (this.kmsURIs) {
                _context6.next = 17;
                break;
              }

              _context6.next = 8;
              return _regeneratorRuntime.awrap(ElvClient.FromConfigurationUrl({
                configUrl: this.configUrl
              }));

            case 8:
              client = _context6.sent;
              client.SetSigner({
                signer: wallet.AddAccountFromMnemonic({
                  mnemonic: wallet.GenerateMnemonic()
                })
              });
              _context6.next = 12;
              return _regeneratorRuntime.awrap(client.authClient.KMSInfo({
                kmsId: this.trustAuthorityId
              }));

            case 12:
              _ref11 = _context6.sent;
              urls = _ref11.urls;

              if (!(!urls || urls.length === 0)) {
                _context6.next = 16;
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
              _context6.next = 22;
              return _regeneratorRuntime.awrap(this.utils.ResponseToJson(httpClient.Request({
                headers: {
                  Authorization: "Bearer ".concat(token)
                },
                method: "PUT",
                path: path,
                forceFailover: true
              })));

            case 22:
              response = _context6.sent;
              privateKey = response["UserSKHex"];
              this.SetSigner({
                signer: wallet.AddAccount({
                  privateKey: privateKey
                })
              }); // Ensure wallet is initialized

              _context6.next = 27;
              return _regeneratorRuntime.awrap(this.userProfileClient.WalletAddress());

            case 27:
              _context6.next = 36;
              break;

            case 29:
              _context6.prev = 29;
              _context6.t0 = _context6["catch"](4);
              this.Log("Failed to set signer from OAuth token:", true);
              this.Log(_context6.t0, true);
              _context6.next = 35;
              return _regeneratorRuntime.awrap(this.ClearSigner());

            case 35:
              throw _context6.t0;

            case 36:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this, [[4, 29]]);
    }
    /**
     * Set a static token for the client to use for all authorization
     *
     * @methodGroup Authorization
     * @namedParams
     * @param {string} token - The static token to use
     */

  }, {
    key: "SetStaticToken",
    value: function SetStaticToken(_ref12) {
      var token = _ref12.token;
      this.staticToken = token;

      if (!this.signer) {
        var wallet = this.GenerateWallet();
        var signer = wallet.AddAccountFromMnemonic({
          mnemonic: wallet.GenerateMnemonic()
        });
        this.SetSigner({
          signer: signer
        });
      }
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
    value: function SetPolicyAuthorization(_ref13) {
      var objectId;
      return _regeneratorRuntime.async(function SetPolicyAuthorization$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              objectId = _ref13.objectId;
              _context7.t0 = this;
              _context7.next = 4;
              return _regeneratorRuntime.awrap(this.GenerateStateChannelToken({
                objectId: objectId
              }));

            case 4:
              _context7.t1 = _context7.sent;
              _context7.t2 = {
                token: _context7.t1
              };

              _context7.t0.SetStaticToken.call(_context7.t0, _context7.t2);

            case 7:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
    /**
     * Issue an n-time-password (NTP) instance. This instance contains a specification for the tickets (AKA codes) to be issued, including
     * the target(s) to be authorized, how many tickets can be issued, and when and how many times tickets can be redeemed.
     *
     * Note: For date types (startTime/endTime), you may specify the date in any format parsable by JavaScript's `new Date()` constructor,
     * including Unix epoch timestamps and ISO strings
     *
     * @see <a href="#IssueNTPCode">IssueNTPCode</a>
     *
     * @methodGroup Tickets
     * @namedParams
     * @param {string} tenantId - The ID of the tenant in which to create the NTP instance
     * @param {string} objectId - ID of the object for the tickets to be authorized to
     * @param {Array<string>=} groupAddresses - List of group addresses for the tickets to inherit permissions from
     * @param {number=} maxTickets=0 - The maximum number of tickets that may be issued for this instance (if 0, no limit)
     * @param {number=} maxRedemptions=100 - The maximum number of times each ticket may be redeemed
     * @param {string|number=} startTime - The time when issued tickets can be redeemed
     * @param {string|number=} endTime - The time when issued tickets can no longer be redeemed
     * @param {number=} ticketLength=6 - The number of characters in each ticket code
     *
     * @return {Promise<string>} - The ID of the NTP instance. This ID can be used when issuing tickets (See IssueNTPCode)
     */

  }, {
    key: "CreateNTPInstance",
    value: function CreateNTPInstance(_ref14) {
      var _this = this;

      var tenantId, objectId, groupAddresses, _ref14$maxTickets, maxTickets, _ref14$maxRedemptions, maxRedemptions, startTime, endTime, _ref14$ticketLength, ticketLength, paramsJSON, groupIds;

      return _regeneratorRuntime.async(function CreateNTPInstance$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              tenantId = _ref14.tenantId, objectId = _ref14.objectId, groupAddresses = _ref14.groupAddresses, _ref14$maxTickets = _ref14.maxTickets, maxTickets = _ref14$maxTickets === void 0 ? 0 : _ref14$maxTickets, _ref14$maxRedemptions = _ref14.maxRedemptions, maxRedemptions = _ref14$maxRedemptions === void 0 ? 100 : _ref14$maxRedemptions, startTime = _ref14.startTime, endTime = _ref14.endTime, _ref14$ticketLength = _ref14.ticketLength, ticketLength = _ref14$ticketLength === void 0 ? 6 : _ref14$ticketLength;
              // targetIdStr string, defType int32, paramsJSON string, max, tsMillis int64, sig hexutil.Bytes
              ValidatePresence("tenantId", tenantId);
              ValidatePresence("objectId or groupAddresses", objectId || groupAddresses);

              if (objectId) {
                ValidateObject(objectId);
              }

              if (groupAddresses) {
                groupAddresses.forEach(function (address) {
                  return ValidateAddress(address);
                });
              }

              startTime = ValidateDate(startTime);
              endTime = ValidateDate(endTime);
              paramsJSON = ["ntp:".concat(maxRedemptions), "sen:".concat(ticketLength)];

              if (objectId) {
                paramsJSON.push("qid:".concat(objectId));
              } else if (groupAddresses) {
                groupIds = groupAddresses.map(function (address) {
                  return "igrp".concat(_this.utils.AddressToHash(address));
                });
                paramsJSON.push("gid:".concat(groupIds.join(",")));
              }

              if (startTime) {
                paramsJSON.push("vat:".concat(startTime));
              }

              if (endTime) {
                paramsJSON.push("exp:".concat(endTime));
              }

              _context8.next = 13;
              return _regeneratorRuntime.awrap(this.authClient.MakeKMSCall({
                methodName: "elv_createOTPInstance",
                params: [tenantId, 4, JSON.stringify(paramsJSON), maxTickets, Date.now()],
                paramTypes: ["string", "int", "string", "int", "int"]
              }));

            case 13:
              return _context8.abrupt("return", _context8.sent);

            case 14:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
    /**
     * Issue a ticket from the specified NTP ID
     *
     * @see <a href="#CreateNTPInstance">CreateNTPInstance</a>
     *
     * @methodGroup Tickets
     * @namedParams
     * @param {string} tenantId - The ID of the tenant in the NTP instance was created
     * @param {string} ntpId - The ID of the NTP instance from which to issue a ticket
     * @param {string=} email - The email address associated with this ticket. If specified, the email address will have to
     * be provided along with the ticket code in order to redeem the ticket.
     *
     * @return {Promise<Object>} - The generated ticket code and additional information about the ticket.
     */

  }, {
    key: "IssueNTPCode",
    value: function IssueNTPCode(_ref15) {
      var tenantId, ntpId, email, options, params, paramTypes;
      return _regeneratorRuntime.async(function IssueNTPCode$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              tenantId = _ref15.tenantId, ntpId = _ref15.ntpId, email = _ref15.email;
              ValidatePresence("tenantId", tenantId);
              ValidatePresence("ntpId", ntpId);
              options = [];

              if (email) {
                options.push("eml:".concat(email));
              }

              params = [tenantId, ntpId, JSON.stringify(options), Date.now()];
              paramTypes = ["string", "string", "string", "uint"];
              _context9.next = 9;
              return _regeneratorRuntime.awrap(this.authClient.MakeKMSCall({
                methodName: "elv_issueOTPCode",
                params: params,
                paramTypes: paramTypes
              }));

            case 9:
              return _context9.abrupt("return", _context9.sent);

            case 10:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
    /**
     * Redeem the specified ticket/code to authorize the client. Must provide either issuer or tenantId and ntpId
     *
     * @methodGroup Tickets
     * @namedParams
     * @param {string=} issuer - Issuer to authorize against
     * @param {string=} tenantId - The ID of the tenant from which the ticket was issued
     * @param {string} ntpId - The ID of the NTP instance from which the ticket was issued
     * @param {string} code - Access code
     * @param {string=} email - Email address associated with the code
     *
     * @return {Promise<string>} - The object ID which the ticket is authorized to
     */

  }, {
    key: "RedeemCode",
    value: function RedeemCode(_ref16) {
      var issuer, tenantId, ntpId, code, email, wallet, token, objectId, libraryId, Hash, codeHash, codeInfo, ak, sites, info, signer;
      return _regeneratorRuntime.async(function RedeemCode$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              issuer = _ref16.issuer, tenantId = _ref16.tenantId, ntpId = _ref16.ntpId, code = _ref16.code, email = _ref16.email;
              wallet = this.GenerateWallet();
              issuer = issuer || "";

              if (!this.signer) {
                this.SetSigner({
                  signer: wallet.AddAccountFromMnemonic({
                    mnemonic: wallet.GenerateMnemonic()
                  })
                });
              }

              if (!issuer.startsWith("iq__")) {
                _context10.next = 8;
                break;
              }

              ValidateObject(issuer);
              _context10.next = 27;
              break;

            case 8:
              if (!(issuer && !issuer.replace(/^\//, "").startsWith("otp/ntp/iten"))) {
                _context10.next = 12;
                break;
              }

              throw Error("Invalid issuer: " + issuer);

            case 12:
              // Ticket API
              ValidatePresence("issuer or tenantId and ntpId", issuer || tenantId && ntpId);

              if (!issuer) {
                issuer = "/otp/ntp/".concat(tenantId, "/").concat(ntpId);
              }

              _context10.prev = 14;
              _context10.next = 17;
              return _regeneratorRuntime.awrap(this.authClient.GenerateChannelContentToken({
                issuer: issuer,
                code: code,
                email: email
              }));

            case 17:
              token = _context10.sent;
              this.SetStaticToken({
                token: token
              });
              return _context10.abrupt("return", JSON.parse(Utils.FromB64(token)).qid);

            case 22:
              _context10.prev = 22;
              _context10.t0 = _context10["catch"](14);
              this.Log("Failed to redeem code:", true);
              this.Log(_context10.t0, true);
              throw _context10.t0;

            case 27:
              // Site selector
              objectId = issuer;
              _context10.next = 30;
              return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 30:
              libraryId = _context10.sent;

              Hash = function Hash(code) {
                var chars = code.split("").map(function (code) {
                  return code.charCodeAt(0);
                });
                return chars.reduce(function (sum, _char, i) {
                  return chars[i + 1] ? sum * 2 + _char * chars[i + 1] * (i + 1) : sum + _char;
                }, 0).toString();
              };

              codeHash = Hash(code);
              _context10.next = 35;
              return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: "public/codes/".concat(codeHash)
              }));

            case 35:
              codeInfo = _context10.sent;

              if (codeInfo) {
                _context10.next = 39;
                break;
              }

              this.Log("Code redemption failed:\n\t".concat(issuer, "\n\t").concat(code));
              throw Error("Invalid code: " + code);

            case 39:
              ak = codeInfo.ak, sites = codeInfo.sites, info = codeInfo.info;
              _context10.next = 42;
              return _regeneratorRuntime.awrap(wallet.AddAccountFromEncryptedPK({
                encryptedPrivateKey: this.utils.FromB64(ak),
                password: code
              }));

            case 42:
              signer = _context10.sent;
              this.SetSigner({
                signer: signer
              }); // Ensure wallet is initialized

              _context10.next = 46;
              return _regeneratorRuntime.awrap(this.userProfileClient.WalletAddress());

            case 46:
              return _context10.abrupt("return", {
                addr: this.utils.FormatAddress(signer.address),
                sites: sites,
                info: info || {}
              });

            case 47:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this, [[14, 22]]);
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
    value: function EncryptECIES(_ref17) {
      var message, publicKey;
      return _regeneratorRuntime.async(function EncryptECIES$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              message = _ref17.message, publicKey = _ref17.publicKey;

              if (this.signer) {
                _context11.next = 3;
                break;
              }

              throw "Signer not set";

            case 3:
              ValidatePresence("message", message);
              _context11.next = 6;
              return _regeneratorRuntime.awrap(this.Crypto.EncryptConk(message, publicKey || this.signer.signingKey.keyPair.publicKey));

            case 6:
              return _context11.abrupt("return", _context11.sent);

            case 7:
            case "end":
              return _context11.stop();
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
    value: function DecryptECIES(_ref18) {
      var message;
      return _regeneratorRuntime.async(function DecryptECIES$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              message = _ref18.message;

              if (this.signer) {
                _context12.next = 3;
                break;
              }

              throw "Signer not set";

            case 3:
              ValidatePresence("message", message);
              _context12.next = 6;
              return _regeneratorRuntime.awrap(this.Crypto.DecryptCap(message, this.signer.signingKey.privateKey));

            case 6:
              return _context12.abrupt("return", _context12.sent);

            case 7:
            case "end":
              return _context12.stop();
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
    value: function Request(_ref19) {
      var url = _ref19.url,
          _ref19$format = _ref19.format,
          format = _ref19$format === void 0 ? "json" : _ref19$format,
          _ref19$method = _ref19.method,
          method = _ref19$method === void 0 ? "GET" : _ref19$method,
          _ref19$headers = _ref19.headers,
          headers = _ref19$headers === void 0 ? {} : _ref19$headers,
          body = _ref19.body;
      return this.utils.ResponseToFormat(format, HttpClient.Fetch(url, {
        method: method,
        headers: headers,
        body: body
      }));
    }
    /* FrameClient related */
    // Whitelist of methods allowed to be called using the frame API

  }, {
    key: "FrameAllowedMethods",
    value: function FrameAllowedMethods() {
      var _this2 = this;

      var forbiddenMethods = ["constructor", "AccessGroupMembershipMethod", "CallFromFrameMessage", "ClearSigner", "FormatBlockNumbers", "FrameAllowedMethods", "FromConfigurationUrl", "GenerateWallet", "InitializeClients", "Log", "SetSigner", "SetSignerFromWeb3Provider", "ToggleLogging"];
      return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (method) {
        return typeof _this2[method] === "function" && !forbiddenMethods.includes(method);
      });
    } // Call a method specified in a message from a frame

  }, {
    key: "CallFromFrameMessage",
    value: function CallFromFrameMessage(message, Respond) {
      var _this3 = this;

      var callback, method, methodResults, responseError;
      return _regeneratorRuntime.async(function CallFromFrameMessage$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              if (!(message.type !== "ElvFrameRequest")) {
                _context13.next = 2;
                break;
              }

              return _context13.abrupt("return");

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

              _context13.prev = 3;
              method = message.calledMethod;

              if (!(message.module === "userProfileClient")) {
                _context13.next = 13;
                break;
              }

              if (this.userProfileClient.FrameAllowedMethods().includes(method)) {
                _context13.next = 8;
                break;
              }

              throw Error("Invalid user profile method: " + method);

            case 8:
              _context13.next = 10;
              return _regeneratorRuntime.awrap(this.userProfileClient[method](message.args));

            case 10:
              methodResults = _context13.sent;
              _context13.next = 18;
              break;

            case 13:
              if (this.FrameAllowedMethods().includes(method)) {
                _context13.next = 15;
                break;
              }

              throw Error("Invalid method: " + method);

            case 15:
              _context13.next = 17;
              return _regeneratorRuntime.awrap(this[method](message.args));

            case 17:
              methodResults = _context13.sent;

            case 18:
              Respond(this.utils.MakeClonable({
                type: "ElvFrameResponse",
                requestId: message.requestId,
                response: methodResults
              }));
              _context13.next = 27;
              break;

            case 21:
              _context13.prev = 21;
              _context13.t0 = _context13["catch"](3);
              // eslint-disable-next-line no-console
              this.Log("Frame Message Error:\n        Method: ".concat(message.calledMethod, "\n        Arguments: ").concat(JSON.stringify(message.args, null, 2), "\n        Error: ").concat(_typeof(_context13.t0) === "object" ? JSON.stringify(_context13.t0, null, 2) : _context13.t0), true); // eslint-disable-next-line no-console

              console.error(_context13.t0);
              responseError = _context13.t0 instanceof Error ? _context13.t0.message : _context13.t0;
              Respond(this.utils.MakeClonable({
                type: "ElvFrameResponse",
                requestId: message.requestId,
                error: responseError
              }));

            case 27:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this, [[3, 21]]);
    }
  }], [{
    key: "Configuration",
    value: function Configuration(_ref20) {
      var configUrl, _ref20$kmsUrls, kmsUrls, region, uri, fabricInfo, filterHTTPS, fabricURIs, ethereumURIs, fabricVersion;

      return _regeneratorRuntime.async(function Configuration$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              configUrl = _ref20.configUrl, _ref20$kmsUrls = _ref20.kmsUrls, kmsUrls = _ref20$kmsUrls === void 0 ? [] : _ref20$kmsUrls, region = _ref20.region;
              _context15.prev = 1;
              uri = new URI(configUrl);

              if (region) {
                uri.addSearch("elvgeo", region);
              }

              _context15.next = 6;
              return _regeneratorRuntime.awrap(Utils.ResponseToJson(HttpClient.Fetch(uri.toString())));

            case 6:
              fabricInfo = _context15.sent;

              // If any HTTPS urls present, throw away HTTP urls so only HTTPS will be used
              filterHTTPS = function filterHTTPS(uri) {
                return uri.toLowerCase().startsWith("https");
              };

              fabricURIs = fabricInfo.network.seed_nodes.fabric_api;

              if (fabricURIs.find(filterHTTPS)) {
                fabricURIs = fabricURIs.filter(filterHTTPS);
              }

              ethereumURIs = fabricInfo.network.seed_nodes.ethereum_api;

              if (ethereumURIs.find(filterHTTPS)) {
                ethereumURIs = ethereumURIs.filter(filterHTTPS);
              } // Test each eth url


              _context15.next = 14;
              return _regeneratorRuntime.awrap(Promise.all(ethereumURIs.map(function _callee(uri) {
                var response;
                return _regeneratorRuntime.async(function _callee$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        _context14.prev = 0;
                        _context14.next = 3;
                        return _regeneratorRuntime.awrap(Promise.race([HttpClient.Fetch(uri, {
                          method: "post",
                          headers: {
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                            method: "net_version",
                            params: [],
                            id: 1,
                            jsonrpc: "2.0"
                          })
                        }), new Promise(function (resolve) {
                          return setTimeout(function () {
                            return resolve({
                              ok: false
                            });
                          }, 5000);
                        })]));

                      case 3:
                        response = _context14.sent;

                        if (!response.ok) {
                          _context14.next = 6;
                          break;
                        }

                        return _context14.abrupt("return", uri);

                      case 6:
                        // eslint-disable-next-line no-console
                        console.error("Eth node unavailable: " + uri);
                        _context14.next = 13;
                        break;

                      case 9:
                        _context14.prev = 9;
                        _context14.t0 = _context14["catch"](0);
                        // eslint-disable-next-line no-console
                        console.error("Eth node unavailable: " + uri); // eslint-disable-next-line no-console

                        console.error(_context14.t0);

                      case 13:
                      case "end":
                        return _context14.stop();
                    }
                  }
                }, null, null, [[0, 9]]);
              })));

            case 14:
              _context15.t0 = function (uri) {
                return uri;
              };

              ethereumURIs = _context15.sent.filter(_context15.t0);
              fabricVersion = Math.max.apply(Math, _toConsumableArray(fabricInfo.network.api_versions || [2]));
              return _context15.abrupt("return", {
                nodeId: fabricInfo.node_id,
                contentSpaceId: fabricInfo.qspace.id,
                fabricURIs: fabricURIs,
                ethereumURIs: ethereumURIs,
                kmsURIs: kmsUrls,
                fabricVersion: fabricVersion
              });

            case 20:
              _context15.prev = 20;
              _context15.t1 = _context15["catch"](1);
              // eslint-disable-next-line no-console
              console.error("Error retrieving fabric configuration:"); // eslint-disable-next-line no-console

              console.error(_context15.t1);
              throw _context15.t1;

            case 25:
            case "end":
              return _context15.stop();
          }
        }
      }, null, null, [[1, 20]]);
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

  }, {
    key: "FromConfigurationUrl",
    value: function FromConfigurationUrl(_ref21) {
      var configUrl, region, trustAuthorityId, staticToken, _ref21$noCache, noCache, _ref21$noAuth, noAuth, _ref22, contentSpaceId, fabricURIs, ethereumURIs, fabricVersion, client;

      return _regeneratorRuntime.async(function FromConfigurationUrl$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              configUrl = _ref21.configUrl, region = _ref21.region, trustAuthorityId = _ref21.trustAuthorityId, staticToken = _ref21.staticToken, _ref21$noCache = _ref21.noCache, noCache = _ref21$noCache === void 0 ? false : _ref21$noCache, _ref21$noAuth = _ref21.noAuth, noAuth = _ref21$noAuth === void 0 ? false : _ref21$noAuth;
              _context16.next = 3;
              return _regeneratorRuntime.awrap(ElvClient.Configuration({
                configUrl: configUrl,
                region: region
              }));

            case 3:
              _ref22 = _context16.sent;
              contentSpaceId = _ref22.contentSpaceId;
              fabricURIs = _ref22.fabricURIs;
              ethereumURIs = _ref22.ethereumURIs;
              fabricVersion = _ref22.fabricVersion;
              client = new ElvClient({
                contentSpaceId: contentSpaceId,
                fabricVersion: fabricVersion,
                fabricURIs: fabricURIs,
                ethereumURIs: ethereumURIs,
                trustAuthorityId: trustAuthorityId,
                staticToken: staticToken,
                noCache: noCache,
                noAuth: noAuth
              });
              client.configUrl = configUrl;
              return _context16.abrupt("return", client);

            case 11:
            case "end":
              return _context16.stop();
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
exports.ElvClient = ElvClient;