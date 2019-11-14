"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require("@babel/polyfill");

if (typeof Buffer === "undefined") {
  Buffer = require("buffer/").Buffer;
}

var UrlJoin = require("url-join");

var Ethers = require("ethers");

var AuthorizationClient = require("./AuthorizationClient");

var ElvWallet = require("./ElvWallet");

var EthClient = require("./EthClient");

var UserProfileClient = require("./UserProfileClient");

var HttpClient = require("./HttpClient"); // const ContentObjectVerification = require("./ContentObjectVerification");


var Utils = require("./Utils");

var Crypto = require("./Crypto");

var LimitedMap = require("./LimitedMap");

var SpaceContract = require("./contracts/BaseContentSpace");

var LibraryContract = require("./contracts/BaseLibrary");

var ContentContract = require("./contracts/BaseContent");

var ContentTypeContract = require("./contracts/BaseContentType");

var AccessGroupContract = require("./contracts/BaseAccessControlGroup");

var _require = require("./Validation"),
    ValidateLibrary = _require.ValidateLibrary,
    ValidateObject = _require.ValidateObject,
    ValidateVersion = _require.ValidateVersion,
    ValidateWriteToken = _require.ValidateWriteToken,
    ValidatePartHash = _require.ValidatePartHash,
    ValidateAddress = _require.ValidateAddress,
    ValidateParameters = _require.ValidateParameters; // Platform specific polyfills


switch (Utils.Platform()) {
  case Utils.PLATFORM_REACT_NATIVE:
    // React native polyfills
    // Polyfill for string.normalized
    require("unorm");

    break;

  case Utils.PLATFORM_NODE:
    // Define Response in node
    // eslint-disable-next-line no-global-assign
    global.Response = require("node-fetch").Response;
    break;
}

var ResponseToJson =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(response) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", ResponseToFormat("json", response));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function ResponseToJson(_x) {
    return _ref.apply(this, arguments);
  };
}();

var ResponseToFormat =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(format, response) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return response;

          case 2:
            response = _context2.sent;
            _context2.t0 = format.toLowerCase();
            _context2.next = _context2.t0 === "json" ? 6 : _context2.t0 === "text" ? 9 : _context2.t0 === "blob" ? 12 : _context2.t0 === "arraybuffer" ? 15 : _context2.t0 === "formdata" ? 18 : _context2.t0 === "buffer" ? 21 : 24;
            break;

          case 6:
            _context2.next = 8;
            return response.json();

          case 8:
            return _context2.abrupt("return", _context2.sent);

          case 9:
            _context2.next = 11;
            return response.text();

          case 11:
            return _context2.abrupt("return", _context2.sent);

          case 12:
            _context2.next = 14;
            return response.blob();

          case 14:
            return _context2.abrupt("return", _context2.sent);

          case 15:
            _context2.next = 17;
            return response.arrayBuffer();

          case 17:
            return _context2.abrupt("return", _context2.sent);

          case 18:
            _context2.next = 20;
            return response.formData();

          case 20:
            return _context2.abrupt("return", _context2.sent);

          case 21:
            _context2.next = 23;
            return response.buffer();

          case 23:
            return _context2.abrupt("return", _context2.sent);

          case 24:
            return _context2.abrupt("return", response);

          case 25:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function ResponseToFormat(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

var ElvClient =
/*#__PURE__*/
function () {
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

  }]);

  function ElvClient(_ref3) {
    var contentSpaceId = _ref3.contentSpaceId,
        fabricURIs = _ref3.fabricURIs,
        ethereumURIs = _ref3.ethereumURIs,
        _ref3$noCache = _ref3.noCache,
        noCache = _ref3$noCache === void 0 ? false : _ref3$noCache,
        _ref3$noAuth = _ref3.noAuth,
        noAuth = _ref3$noAuth === void 0 ? false : _ref3$noAuth;

    _classCallCheck(this, ElvClient);

    this.utils = Utils;
    this.contentSpaceId = contentSpaceId;
    this.contentSpaceAddress = this.utils.HashToAddress(contentSpaceId);
    this.contentSpaceLibraryId = this.utils.AddressToLibraryId(this.contentSpaceAddress);
    this.contentSpaceObjectId = this.utils.AddressToObjectId(this.contentSpaceAddress);
    this.fabricURIs = fabricURIs;
    this.ethereumURIs = ethereumURIs;
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


  _createClass(ElvClient, [{
    key: "InitializeClients",
    value: function InitializeClients() {
      this.contentTypes = {};
      this.encryptionConks = {};
      this.reencryptionConks = {};
      this.stateChannelAccess = {};
      this.HttpClient = new HttpClient({
        uris: this.fabricURIs,
        debug: this.debug
      });
      this.ethClient = new EthClient({
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
      });
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
     * - Available regions: na-west-north na-west-south na-east eu-west
     *
     * @return {Promise<Object>} - An object containing the updated fabric and ethereum URLs in order of preference
     */

  }, {
    key: "UseRegion",
    value: function () {
      var _UseRegion = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(_ref4) {
        var region, _ref5, fabricURIs, ethereumURIs;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
                _ref5 = _context3.sent;
                fabricURIs = _ref5.fabricURIs;
                ethereumURIs = _ref5.ethereumURIs;
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

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function UseRegion(_x4) {
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
      var _ResetRegion = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
      var _NodeId = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(_ref6) {
        var region, _ref7, nodeId;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                region = _ref6.region;
                _context5.next = 3;
                return ElvClient.Configuration({
                  configUrl: this.configUrl,
                  region: region
                });

              case 3:
                _ref7 = _context5.sent;
                nodeId = _ref7.nodeId;
                return _context5.abrupt("return", nodeId);

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function NodeId(_x5) {
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
    value: function SetNodes(_ref8) {
      var fabricURIs = _ref8.fabricURIs,
          ethereumURIs = _ref8.ethereumURIs;

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
    value: function SetSigner(_ref9) {
      var signer = _ref9.signer;
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

  }, {
    key: "SetSignerFromWeb3Provider",
    value: function () {
      var _SetSignerFromWeb3Provider = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(_ref10) {
        var provider, ethProvider;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                provider = _ref10.provider;
                ethProvider = new Ethers.providers.Web3Provider(provider);
                ethProvider.pollingInterval = 250;
                this.signer = ethProvider.getSigner();
                _context6.next = 6;
                return this.signer.getAddress();

              case 6:
                this.signer.address = _context6.sent;
                _context6.next = 9;
                return this.InitializeClients();

              case 9:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function SetSignerFromWeb3Provider(_x6) {
        return _SetSignerFromWeb3Provider.apply(this, arguments);
      }

      return SetSignerFromWeb3Provider;
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
    /* Content Spaces */

    /**
     * Get the address of the default KMS of the content space
     *
     * @methodGroup Content Space
     *
     * @returns {Promise<string>} - Address of the KMS
     */

  }, {
    key: "DefaultKMSAddress",
    value: function () {
      var _DefaultKMSAddress = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7() {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.CallContractMethod({
                  contractAddress: this.contentSpaceAddress,
                  abi: SpaceContract.abi,
                  methodName: "addressKMS"
                });

              case 2:
                return _context7.abrupt("return", _context7.sent);

              case 3:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function DefaultKMSAddress() {
        return _DefaultKMSAddress.apply(this, arguments);
      }

      return DefaultKMSAddress;
    }()
    /**
     * Get the ID of the current content space
     *
     * @methodGroup Content Space
     *
     * @return {string} contentSpaceId - The ID of the current content space
     */

  }, {
    key: "ContentSpaceId",
    value: function ContentSpaceId() {
      return this.contentSpaceId;
    }
    /**
     * Deploy a new content space contract
     *
     * @methodGroup Content Space
     * @namedParams
     * @param {String} name - Name of the content space
     *
     * @returns {Promise<string>} - Content space ID of the created content space
     */

  }, {
    key: "CreateContentSpace",
    value: function () {
      var _CreateContentSpace = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(_ref11) {
        var name, contentSpaceAddress;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                name = _ref11.name;
                _context8.next = 3;
                return this.ethClient.DeployContentSpaceContract({
                  name: name,
                  signer: this.signer
                });

              case 3:
                contentSpaceAddress = _context8.sent;
                return _context8.abrupt("return", Utils.AddressToSpaceId(contentSpaceAddress));

              case 5:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function CreateContentSpace(_x7) {
        return _CreateContentSpace.apply(this, arguments);
      }

      return CreateContentSpace;
    }()
    /* Libraries */

    /**
     * List content libraries - returns a list of content library IDs available to the current user
     *
     * @methodGroup Content Libraries
     *
     * @returns {Promise<Array<string>>}
     */

  }, {
    key: "ContentLibraries",
    value: function () {
      var _ContentLibraries = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9() {
        var _this = this;

        var libraryAddresses;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.Collection({
                  collectionType: "libraries"
                });

              case 2:
                libraryAddresses = _context9.sent;
                return _context9.abrupt("return", libraryAddresses.map(function (address) {
                  return _this.utils.AddressToLibraryId(address);
                }));

              case 4:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function ContentLibraries() {
        return _ContentLibraries.apply(this, arguments);
      }

      return ContentLibraries;
    }()
    /**
     * Returns information about the content library
     *
     * @methodGroup Content Libraries
     * @see GET /qlibs/:qlibid
     *
     * @namedParams
     * @param {string} libraryId
     *
     * @returns {Promise<Object>}
     */

  }, {
    key: "ContentLibrary",
    value: function () {
      var _ContentLibrary = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(_ref12) {
        var libraryId, path, library;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                libraryId = _ref12.libraryId;
                ValidateLibrary(libraryId);
                path = UrlJoin("qlibs", libraryId);
                _context10.t0 = ResponseToJson;
                _context10.t1 = this.HttpClient;
                _context10.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId
                });

              case 7:
                _context10.t2 = _context10.sent;
                _context10.t3 = path;
                _context10.t4 = {
                  headers: _context10.t2,
                  method: "GET",
                  path: _context10.t3
                };
                _context10.t5 = _context10.t1.Request.call(_context10.t1, _context10.t4);
                _context10.next = 13;
                return (0, _context10.t0)(_context10.t5);

              case 13:
                library = _context10.sent;
                return _context10.abrupt("return", _objectSpread({}, library, {
                  meta: library.meta || {}
                }));

              case 15:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function ContentLibrary(_x8) {
        return _ContentLibrary.apply(this, arguments);
      }

      return ContentLibrary;
    }()
    /**
     * Returns the address of the owner of the specified content library
     *
     * @methodGroup Content Libraries
     * @namedParams
     * @param {string} libraryId
     *
     * @returns {Promise<string>} - The account address of the owner
     */

  }, {
    key: "ContentLibraryOwner",
    value: function () {
      var _ContentLibraryOwner = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11(_ref13) {
        var libraryId;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                libraryId = _ref13.libraryId;
                ValidateLibrary(libraryId);
                _context11.t0 = this.utils;
                _context11.next = 5;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 5:
                _context11.t1 = _context11.sent;
                return _context11.abrupt("return", _context11.t0.FormatAddress.call(_context11.t0, _context11.t1));

              case 7:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function ContentLibraryOwner(_x9) {
        return _ContentLibraryOwner.apply(this, arguments);
      }

      return ContentLibraryOwner;
    }()
    /* Library creation and deletion */

    /**
     * Create a new content library.
     *
     * A new content library contract is deployed from
     * the content space, and that contract ID is used to determine the library ID to
     * create in the fabric.
     *
     * @methodGroup Content Libraries
     * @see PUT /qlibs/:qlibid
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

  }, {
    key: "CreateContentLibrary",
    value: function () {
      var _CreateContentLibrary = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(_ref14) {
        var name, description, image, _ref14$metadata, metadata, kmsId, _ref15, contractAddress, libraryId, objectId, editResponse;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                name = _ref14.name, description = _ref14.description, image = _ref14.image, _ref14$metadata = _ref14.metadata, metadata = _ref14$metadata === void 0 ? {} : _ref14$metadata, kmsId = _ref14.kmsId;

                if (kmsId) {
                  _context12.next = 9;
                  break;
                }

                _context12.t0 = "ikms";
                _context12.t1 = this.utils;
                _context12.next = 6;
                return this.DefaultKMSAddress();

              case 6:
                _context12.t2 = _context12.sent;
                _context12.t3 = _context12.t1.AddressToHash.call(_context12.t1, _context12.t2);
                kmsId = _context12.t0.concat.call(_context12.t0, _context12.t3);

              case 9:
                this.Log("Creating content library");
                this.Log("KMS ID: ".concat(kmsId));
                _context12.next = 13;
                return this.authClient.CreateContentLibrary({
                  kmsId: kmsId
                });

              case 13:
                _ref15 = _context12.sent;
                contractAddress = _ref15.contractAddress;
                metadata = _objectSpread({}, metadata, {
                  name: name,
                  description: description,
                  "public": {
                    name: name,
                    description: description
                  }
                });
                libraryId = this.utils.AddressToLibraryId(contractAddress);
                this.Log("Library ID: ".concat(libraryId));
                this.Log("Contract address: ".concat(contractAddress)); // Set library content object type and metadata on automatically created library object

                objectId = libraryId.replace("ilib", "iq__");
                _context12.next = 22;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  options: {
                    type: "library"
                  }
                });

              case 22:
                editResponse = _context12.sent;
                _context12.next = 25;
                return this.ReplaceMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadata: metadata,
                  writeToken: editResponse.write_token
                });

              case 25:
                _context12.next = 27;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token
                });

              case 27:
                if (!image) {
                  _context12.next = 30;
                  break;
                }

                _context12.next = 30;
                return this.SetContentLibraryImage({
                  libraryId: libraryId,
                  image: image
                });

              case 30:
                this.Log("Library ".concat(libraryId, " created"));
                return _context12.abrupt("return", libraryId);

              case 32:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function CreateContentLibrary(_x10) {
        return _CreateContentLibrary.apply(this, arguments);
      }

      return CreateContentLibrary;
    }()
    /**
     * Set the image associated with this library
     *
     * @methodGroup Content Libraries
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {Blob | ArrayBuffer | Buffer} image - Image to upload
     */

  }, {
    key: "SetContentLibraryImage",
    value: function () {
      var _SetContentLibraryImage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(_ref16) {
        var libraryId, image, objectId;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                libraryId = _ref16.libraryId, image = _ref16.image;
                ValidateLibrary(libraryId);
                objectId = libraryId.replace("ilib", "iq__");
                return _context13.abrupt("return", this.SetContentObjectImage({
                  libraryId: libraryId,
                  objectId: objectId,
                  image: image
                }));

              case 4:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function SetContentLibraryImage(_x11) {
        return _SetContentLibraryImage.apply(this, arguments);
      }

      return SetContentLibraryImage;
    }()
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

  }, {
    key: "SetContentObjectImage",
    value: function () {
      var _SetContentObjectImage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee14(_ref17) {
        var libraryId, objectId, image, editResponse, uploadResponse;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                libraryId = _ref17.libraryId, objectId = _ref17.objectId, image = _ref17.image;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                _context14.next = 4;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 4:
                editResponse = _context14.sent;
                _context14.next = 7;
                return this.UploadPart({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  data: image,
                  encrypted: false
                });

              case 7:
                uploadResponse = _context14.sent;
                _context14.next = 10;
                return this.MergeMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  metadata: {
                    "image": uploadResponse.part.hash
                  }
                });

              case 10:
                _context14.next = 12;
                return this.MergeMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  metadataSubtree: "public",
                  metadata: {
                    "image": uploadResponse.part.hash
                  }
                });

              case 12:
                _context14.next = 14;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token
                });

              case 14:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function SetContentObjectImage(_x12) {
        return _SetContentObjectImage.apply(this, arguments);
      }

      return SetContentObjectImage;
    }()
    /**
     * Delete the specified content library
     *
     * @methodGroup Content Libraries
     * @see DELETE /qlibs/:qlibid
     *
     * @namedParams
     * @param {string} libraryId - ID of the library to delete
     */

  }, {
    key: "DeleteContentLibrary",
    value: function () {
      var _DeleteContentLibrary = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee15(_ref18) {
        var libraryId, path, authorizationHeader;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                libraryId = _ref18.libraryId;
                ValidateLibrary(libraryId);
                path = UrlJoin("qlibs", libraryId);
                _context15.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  update: true
                });

              case 5:
                authorizationHeader = _context15.sent;
                _context15.next = 8;
                return this.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "kill",
                  methodArgs: []
                });

              case 8:
                _context15.next = 10;
                return this.HttpClient.Request({
                  headers: authorizationHeader,
                  method: "DELETE",
                  path: path
                });

              case 10:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function DeleteContentLibrary(_x13) {
        return _DeleteContentLibrary.apply(this, arguments);
      }

      return DeleteContentLibrary;
    }()
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

  }, {
    key: "AddLibraryContentType",
    value: function () {
      var _AddLibraryContentType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee16(_ref19) {
        var libraryId, typeId, typeName, typeHash, customContractAddress, type, typeAddress, event;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                libraryId = _ref19.libraryId, typeId = _ref19.typeId, typeName = _ref19.typeName, typeHash = _ref19.typeHash, customContractAddress = _ref19.customContractAddress;
                ValidateLibrary(libraryId);
                this.Log("Adding library content type to ".concat(libraryId, ": ").concat(typeId || typeHash || typeName));

                if (typeHash) {
                  typeId = this.utils.DecodeVersionHash(typeHash).objectId;
                }

                if (typeId) {
                  _context16.next = 9;
                  break;
                }

                _context16.next = 7;
                return this.ContentType({
                  name: typeName
                });

              case 7:
                type = _context16.sent;
                typeId = type.id;

              case 9:
                this.Log("Type ID: ".concat(typeId));
                typeAddress = this.utils.HashToAddress(typeId);
                customContractAddress = customContractAddress || this.utils.nullAddress;
                _context16.next = 14;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "addContentType",
                  methodArgs: [typeAddress, customContractAddress],
                  signer: this.signer
                });

              case 14:
                event = _context16.sent;
                return _context16.abrupt("return", event.transactionHash);

              case 16:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function AddLibraryContentType(_x14) {
        return _AddLibraryContentType.apply(this, arguments);
      }

      return AddLibraryContentType;
    }()
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

  }, {
    key: "RemoveLibraryContentType",
    value: function () {
      var _RemoveLibraryContentType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee17(_ref20) {
        var libraryId, typeId, typeName, typeHash, type, typeAddress, event;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                libraryId = _ref20.libraryId, typeId = _ref20.typeId, typeName = _ref20.typeName, typeHash = _ref20.typeHash;
                ValidateLibrary(libraryId);
                this.Log("Removing library content type from ".concat(libraryId, ": ").concat(typeId || typeHash || typeName));

                if (typeHash) {
                  typeId = this.utils.DecodeVersionHash(typeHash).objectId;
                }

                if (typeId) {
                  _context17.next = 9;
                  break;
                }

                _context17.next = 7;
                return this.ContentType({
                  name: typeName
                });

              case 7:
                type = _context17.sent;
                typeId = type.id;

              case 9:
                this.Log("Type ID: ".concat(typeId));
                typeAddress = this.utils.HashToAddress(typeId);
                _context17.next = 13;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "removeContentType",
                  methodArgs: [typeAddress],
                  signer: this.signer
                });

              case 13:
                event = _context17.sent;
                return _context17.abrupt("return", event.transactionHash);

              case 15:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function RemoveLibraryContentType(_x15) {
        return _RemoveLibraryContentType.apply(this, arguments);
      }

      return RemoveLibraryContentType;
    }()
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

  }, {
    key: "LibraryContentTypes",
    value: function () {
      var _LibraryContentTypes = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee19(_ref21) {
        var _this2 = this;

        var libraryId, typesLength, allowedTypes;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                libraryId = _ref21.libraryId;
                ValidateLibrary(libraryId);
                this.Log("Retrieving library content types for ".concat(libraryId));
                _context19.next = 5;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "contentTypesLength",
                  methodArgs: [],
                  signer: this.signer
                });

              case 5:
                typesLength = _context19.sent.toNumber();
                this.Log("".concat(typesLength, " types")); // No allowed types set - any type accepted

                if (!(typesLength === 0)) {
                  _context19.next = 9;
                  break;
                }

                return _context19.abrupt("return", {});

              case 9:
                // Get the list of allowed content type addresses
                allowedTypes = {};
                _context19.next = 12;
                return Promise.all(Array.from(new Array(typesLength),
                /*#__PURE__*/
                function () {
                  var _ref22 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee18(_, i) {
                    var typeAddress, typeId;
                    return regeneratorRuntime.wrap(function _callee18$(_context18) {
                      while (1) {
                        switch (_context18.prev = _context18.next) {
                          case 0:
                            _context18.next = 2;
                            return _this2.ethClient.CallContractMethod({
                              contractAddress: Utils.HashToAddress(libraryId),
                              abi: LibraryContract.abi,
                              methodName: "contentTypes",
                              methodArgs: [i],
                              signer: _this2.signer
                            });

                          case 2:
                            typeAddress = _context18.sent;
                            typeId = _this2.utils.AddressToObjectId(typeAddress);
                            _context18.next = 6;
                            return _this2.ContentType({
                              typeId: typeId
                            });

                          case 6:
                            allowedTypes[typeId] = _context18.sent;

                          case 7:
                          case "end":
                            return _context18.stop();
                        }
                      }
                    }, _callee18);
                  }));

                  return function (_x17, _x18) {
                    return _ref22.apply(this, arguments);
                  };
                }()));

              case 12:
                this.Log(allowedTypes);
                return _context19.abrupt("return", allowedTypes);

              case 14:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function LibraryContentTypes(_x16) {
        return _LibraryContentTypes.apply(this, arguments);
      }

      return LibraryContentTypes;
    }()
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

  }, {
    key: "ContentTypeOwner",
    value: function () {
      var _ContentTypeOwner = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee20(_ref23) {
        var name, typeId, versionHash, contentType;
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                name = _ref23.name, typeId = _ref23.typeId, versionHash = _ref23.versionHash;
                _context20.next = 3;
                return this.ContentType({
                  name: name,
                  typeId: typeId,
                  versionHash: versionHash
                });

              case 3:
                contentType = _context20.sent;
                _context20.t0 = this.utils;
                _context20.next = 7;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(contentType.id),
                  abi: ContentTypeContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 7:
                _context20.t1 = _context20.sent;
                return _context20.abrupt("return", _context20.t0.FormatAddress.call(_context20.t0, _context20.t1));

              case 9:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function ContentTypeOwner(_x19) {
        return _ContentTypeOwner.apply(this, arguments);
      }

      return ContentTypeOwner;
    }()
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

  }, {
    key: "ContentType",
    value: function () {
      var _ContentType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee21(_ref24) {
        var name, typeId, versionHash, types, typeInfo, metadata;
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                name = _ref24.name, typeId = _ref24.typeId, versionHash = _ref24.versionHash;
                this.Log("Retrieving content type: ".concat(name || typeId || versionHash));

                if (versionHash) {
                  typeId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                if (!name) {
                  _context21.next = 8;
                  break;
                }

                this.Log("Looking up type by name in content space metadata..."); // Look up named type in content space metadata

                _context21.next = 7;
                return this.ContentObjectMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: this.contentSpaceObjectId,
                  metadataSubtree: UrlJoin("contentTypes", name)
                });

              case 7:
                typeId = _context21.sent;

              case 8:
                if (typeId) {
                  _context21.next = 18;
                  break;
                }

                this.Log("Looking up type by name in available types...");
                _context21.next = 12;
                return this.ContentTypes();

              case 12:
                types = _context21.sent;

                if (!name) {
                  _context21.next = 17;
                  break;
                }

                return _context21.abrupt("return", Object.values(types).find(function (type) {
                  return (type.name || "").toLowerCase() === name.toLowerCase();
                }));

              case 17:
                return _context21.abrupt("return", Object.values(types).find(function (type) {
                  return type.hash === versionHash;
                }));

              case 18:
                _context21.prev = 18;
                this.Log("Looking up type by ID...");
                _context21.next = 22;
                return this.ContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: typeId
                });

              case 22:
                typeInfo = _context21.sent;
                delete typeInfo.type;
                _context21.next = 26;
                return this.ContentObjectMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: typeId
                });

              case 26:
                _context21.t0 = _context21.sent;

                if (_context21.t0) {
                  _context21.next = 29;
                  break;
                }

                _context21.t0 = {};

              case 29:
                metadata = _context21.t0;
                return _context21.abrupt("return", _objectSpread({}, typeInfo, {
                  name: metadata.name,
                  meta: metadata
                }));

              case 33:
                _context21.prev = 33;
                _context21.t1 = _context21["catch"](18);
                this.Log("Error looking up content type:");
                this.Log(_context21.t1);
                throw new Error("Content Type ".concat(name || typeId, " is invalid"));

              case 38:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this, [[18, 33]]);
      }));

      function ContentType(_x20) {
        return _ContentType.apply(this, arguments);
      }

      return ContentType;
    }()
    /**
     * List all content types accessible to this user.
     *
     * @methodGroup Content Types
     * @namedParams
     *
     * @return {Promise<Object>} - Available content types
     */

  }, {
    key: "ContentTypes",
    value: function () {
      var _ContentTypes = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee23() {
        var _this3 = this;

        var typeAddresses, contentSpaceTypes, contentSpaceTypeAddresses;
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                this.contentTypes = this.contentTypes || {};
                this.Log("Looking up all available content types"); // Personally available types

                _context23.next = 4;
                return this.Collection({
                  collectionType: "contentTypes"
                });

              case 4:
                typeAddresses = _context23.sent;
                this.Log("Personally available types:");
                this.Log(typeAddresses); // Content space types

                _context23.next = 9;
                return this.ContentObjectMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: this.contentSpaceObjectId,
                  metadataSubtree: "contentTypes"
                });

              case 9:
                _context23.t0 = _context23.sent;

                if (_context23.t0) {
                  _context23.next = 12;
                  break;
                }

                _context23.t0 = {};

              case 12:
                contentSpaceTypes = _context23.t0;
                contentSpaceTypeAddresses = Object.values(contentSpaceTypes).map(function (typeId) {
                  return _this3.utils.HashToAddress(typeId);
                });
                this.Log("Content space types:");
                this.Log(contentSpaceTypeAddresses);
                typeAddresses = typeAddresses.concat(contentSpaceTypeAddresses).filter(function (address) {
                  return address;
                }).map(function (address) {
                  return _this3.utils.FormatAddress(address);
                }).filter(function (v, i, a) {
                  return a.indexOf(v) === i;
                });
                _context23.next = 19;
                return Promise.all(typeAddresses.map(
                /*#__PURE__*/
                function () {
                  var _ref25 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee22(typeAddress) {
                    var typeId;
                    return regeneratorRuntime.wrap(function _callee22$(_context22) {
                      while (1) {
                        switch (_context22.prev = _context22.next) {
                          case 0:
                            typeId = _this3.utils.AddressToObjectId(typeAddress);

                            if (_this3.contentTypes[typeId]) {
                              _context22.next = 10;
                              break;
                            }

                            _context22.prev = 2;
                            _context22.next = 5;
                            return _this3.ContentType({
                              typeId: typeId
                            });

                          case 5:
                            _this3.contentTypes[typeId] = _context22.sent;
                            _context22.next = 10;
                            break;

                          case 8:
                            _context22.prev = 8;
                            _context22.t0 = _context22["catch"](2);

                          case 10:
                          case "end":
                            return _context22.stop();
                        }
                      }
                    }, _callee22, null, [[2, 8]]);
                  }));

                  return function (_x21) {
                    return _ref25.apply(this, arguments);
                  };
                }()));

              case 19:
                return _context23.abrupt("return", this.contentTypes);

              case 20:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function ContentTypes() {
        return _ContentTypes.apply(this, arguments);
      }

      return ContentTypes;
    }()
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

  }, {
    key: "CreateContentType",
    value: function () {
      var _CreateContentType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee24(_ref26) {
        var name, _ref26$metadata, metadata, bitcode, _ref27, contractAddress, objectId, path, createResponse, uploadResponse;

        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                name = _ref26.name, _ref26$metadata = _ref26.metadata, metadata = _ref26$metadata === void 0 ? {} : _ref26$metadata, bitcode = _ref26.bitcode;
                this.Log("Creating content type: ".concat(name));
                metadata.name = name;
                metadata["public"] = _objectSpread({
                  name: name
                }, metadata["public"] || {});
                _context24.next = 6;
                return this.authClient.CreateContentType();

              case 6:
                _ref27 = _context24.sent;
                contractAddress = _ref27.contractAddress;
                objectId = this.utils.AddressToObjectId(contractAddress);
                path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);
                this.Log("Created type: ".concat(contractAddress, " ").concat(objectId));
                /* Create object, upload bitcode and finalize */

                _context24.t0 = ResponseToJson;
                _context24.t1 = this.HttpClient;
                _context24.next = 15;
                return this.authClient.AuthorizationHeader({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  update: true
                });

              case 15:
                _context24.t2 = _context24.sent;
                _context24.t3 = path;
                _context24.t4 = {
                  headers: _context24.t2,
                  method: "POST",
                  path: _context24.t3,
                  failover: false
                };
                _context24.t5 = _context24.t1.Request.call(_context24.t1, _context24.t4);
                _context24.next = 21;
                return (0, _context24.t0)(_context24.t5);

              case 21:
                createResponse = _context24.sent;
                _context24.next = 24;
                return this.ReplaceMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token,
                  metadata: metadata
                });

              case 24:
                if (!bitcode) {
                  _context24.next = 30;
                  break;
                }

                _context24.next = 27;
                return this.UploadPart({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token,
                  data: bitcode,
                  encrypted: false
                });

              case 27:
                uploadResponse = _context24.sent;
                _context24.next = 30;
                return this.ReplaceMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token,
                  metadataSubtree: "bitcode_part",
                  metadata: uploadResponse.part.hash
                });

              case 30:
                _context24.next = 32;
                return this.FinalizeContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token
                });

              case 32:
                return _context24.abrupt("return", objectId);

              case 33:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function CreateContentType(_x22) {
        return _CreateContentType.apply(this, arguments);
      }

      return CreateContentType;
    }()
    /* Objects */

    /**
     * List content objects in the specified library
     *
     * @see /qlibs/:qlibid/q
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

  }, {
    key: "ContentObjects",
    value: function () {
      var _ContentObjects = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee25(_ref28) {
        var libraryId, _ref28$filterOptions, filterOptions, path, queryParams, filterTypeMap, addFilter;

        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                libraryId = _ref28.libraryId, _ref28$filterOptions = _ref28.filterOptions, filterOptions = _ref28$filterOptions === void 0 ? {} : _ref28$filterOptions;
                ValidateLibrary(libraryId);
                this.Log("Retrieving content objects from ".concat(libraryId));
                path = UrlJoin("qlibs", libraryId, "q");
                queryParams = {
                  filter: []
                }; // Cache ID

                if (filterOptions.cacheId) {
                  queryParams.cache_id = filterOptions.cacheId;
                } // Start index


                if (filterOptions.start) {
                  queryParams.start = filterOptions.start;
                } // Limit


                if (filterOptions.limit) {
                  queryParams.limit = filterOptions.limit;
                } // Metadata select options


                if (filterOptions.select) {
                  queryParams.select = filterOptions.select;
                } // Sorting options


                if (filterOptions.sort) {
                  // Sort keys
                  queryParams.sort_by = filterOptions.sort; // Sort order

                  if (filterOptions.sortDesc) {
                    queryParams.sort_descending = true;
                  }
                }

                if (filterOptions.latestOnly === false) {
                  queryParams.latest_version_only = false;
                } // Filters


                filterTypeMap = {
                  eq: ":eq:",
                  neq: ":ne:",
                  lt: ":lt:",
                  lte: ":le:",
                  gt: ":gt:",
                  gte: ":ge:",
                  cnt: ":co:",
                  ncnt: ":nc:"
                };

                addFilter = function addFilter(_ref29) {
                  var key = _ref29.key,
                      type = _ref29.type,
                      filter = _ref29.filter;
                  queryParams.filter.push("".concat(key).concat(filterTypeMap[type]).concat(filter));
                };

                if (filterOptions.filter) {
                  if (Array.isArray(filterOptions.filter)) {
                    filterOptions.filter.forEach(function (filter) {
                      return addFilter(filter);
                    });
                  } else {
                    addFilter(filterOptions.filter);
                  }
                }

                this.Log("Filter options:");
                this.Log(filterOptions);
                _context25.t0 = ResponseToJson;
                _context25.t1 = this.HttpClient;
                _context25.next = 20;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId
                });

              case 20:
                _context25.t2 = _context25.sent;
                _context25.t3 = path;
                _context25.t4 = queryParams;
                _context25.t5 = {
                  headers: _context25.t2,
                  method: "GET",
                  path: _context25.t3,
                  queryParams: _context25.t4
                };
                _context25.t6 = _context25.t1.Request.call(_context25.t1, _context25.t5);
                _context25.next = 27;
                return (0, _context25.t0)(_context25.t6);

              case 27:
                return _context25.abrupt("return", _context25.sent);

              case 28:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function ContentObjects(_x23) {
        return _ContentObjects.apply(this, arguments);
      }

      return ContentObjects;
    }()
    /**
     * Get a specific content object in the library
     *
     * @see /qlibs/:qlibid/q/:qhit
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
     *
     * @returns {Promise<Object>} - Description of created object
     */

  }, {
    key: "ContentObject",
    value: function () {
      var _ContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee26(_ref30) {
        var libraryId, objectId, versionHash, path;
        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                libraryId = _ref30.libraryId, objectId = _ref30.objectId, versionHash = _ref30.versionHash;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });
                this.Log("Retrieving content object: ".concat(libraryId || "", " ").concat(objectId || versionHash));

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId);
                _context26.t0 = ResponseToJson;
                _context26.t1 = this.HttpClient;
                _context26.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  noAuth: true
                });

              case 9:
                _context26.t2 = _context26.sent;
                _context26.t3 = path;
                _context26.t4 = {
                  headers: _context26.t2,
                  method: "GET",
                  path: _context26.t3
                };
                _context26.t5 = _context26.t1.Request.call(_context26.t1, _context26.t4);
                _context26.next = 15;
                return (0, _context26.t0)(_context26.t5);

              case 15:
                return _context26.abrupt("return", _context26.sent);

              case 16:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function ContentObject(_x24) {
        return _ContentObject.apply(this, arguments);
      }

      return ContentObject;
    }()
    /**
     * Returns the address of the owner of the specified content object
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId
     *
     * @returns {Promise<string>} - The account address of the owner
     */

  }, {
    key: "ContentObjectOwner",
    value: function () {
      var _ContentObjectOwner = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee27(_ref31) {
        var objectId;
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                objectId = _ref31.objectId;
                ValidateObject(objectId);
                this.Log("Retrieving content object owner: ".concat(objectId));
                _context27.t0 = this.utils;
                _context27.next = 6;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  cacheContract: false,
                  signer: this.signer
                });

              case 6:
                _context27.t1 = _context27.sent;
                return _context27.abrupt("return", _context27.t0.FormatAddress.call(_context27.t0, _context27.t1));

              case 8:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function ContentObjectOwner(_x25) {
        return _ContentObjectOwner.apply(this, arguments);
      }

      return ContentObjectOwner;
    }()
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

  }, {
    key: "ContentObjectLibraryId",
    value: function () {
      var _ContentObjectLibraryId = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee28(_ref32) {
        var objectId, versionHash;
        return regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                objectId = _ref32.objectId, versionHash = _ref32.versionHash;
                versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
                this.Log("Retrieving content object library ID: ".concat(objectId || versionHash));

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context28.t0 = Utils;
                _context28.next = 7;
                return this.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "libraryAddress"
                });

              case 7:
                _context28.t1 = _context28.sent;
                return _context28.abrupt("return", _context28.t0.AddressToLibraryId.call(_context28.t0, _context28.t1));

              case 9:
              case "end":
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function ContentObjectLibraryId(_x26) {
        return _ContentObjectLibraryId.apply(this, arguments);
      }

      return ContentObjectLibraryId;
    }()
    /**
     * Get the metadata of a content object
     *
     * @see /qlibs/:qlibid/q/:qhit/meta
     *
     * @methodGroup Metadata
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
     * @param {string=} writeToken - Write token of an object draft - if specified, will read metadata from the draft
     * @param {string=} metadataSubtree - Subtree of the object metadata to retrieve
     * @param {boolean=} noAuth=false - If specified, authorization will not be performed for this call
     *
     * @returns {Promise<Object | string>} - Metadata of the content object
     */

  }, {
    key: "ContentObjectMetadata",
    value: function () {
      var _ContentObjectMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee29(_ref33) {
        var libraryId, objectId, versionHash, writeToken, _ref33$metadataSubtre, metadataSubtree, _ref33$noAuth, noAuth, path;

        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                libraryId = _ref33.libraryId, objectId = _ref33.objectId, versionHash = _ref33.versionHash, writeToken = _ref33.writeToken, _ref33$metadataSubtre = _ref33.metadataSubtree, metadataSubtree = _ref33$metadataSubtre === void 0 ? "/" : _ref33$metadataSubtre, _ref33$noAuth = _ref33.noAuth, noAuth = _ref33$noAuth === void 0 ? true : _ref33$noAuth;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });
                this.Log("Retrieving content object metadata: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n       Subtree: ").concat(metadataSubtree));

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", writeToken || versionHash || objectId, "meta", metadataSubtree);
                _context29.prev = 5;
                _context29.t0 = ResponseToJson;
                _context29.t1 = this.HttpClient;
                _context29.next = 10;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  noAuth: noAuth
                });

              case 10:
                _context29.t2 = _context29.sent;
                _context29.t3 = {
                  resolve: false
                };
                _context29.t4 = path;
                _context29.t5 = {
                  headers: _context29.t2,
                  queryParams: _context29.t3,
                  method: "GET",
                  path: _context29.t4
                };
                _context29.t6 = _context29.t1.Request.call(_context29.t1, _context29.t5);
                _context29.next = 17;
                return (0, _context29.t0)(_context29.t6);

              case 17:
                return _context29.abrupt("return", _context29.sent);

              case 20:
                _context29.prev = 20;
                _context29.t7 = _context29["catch"](5);

                if (!(_context29.t7.status !== 404)) {
                  _context29.next = 24;
                  break;
                }

                throw _context29.t7;

              case 24:
                return _context29.abrupt("return", metadataSubtree === "/" ? {} : undefined);

              case 25:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this, [[5, 20]]);
      }));

      function ContentObjectMetadata(_x27) {
        return _ContentObjectMetadata.apply(this, arguments);
      }

      return ContentObjectMetadata;
    }()
    /**
     * List the versions of a content object
     *
     * @see /qlibs/:qlibid/qid/:objectid
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     *
     * @returns {Promise<Object>} - Response containing versions of the object
     */

  }, {
    key: "ContentObjectVersions",
    value: function () {
      var _ContentObjectVersions = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee30(_ref34) {
        var libraryId, objectId, _ref34$noAuth, noAuth, path;

        return regeneratorRuntime.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                libraryId = _ref34.libraryId, objectId = _ref34.objectId, _ref34$noAuth = _ref34.noAuth, noAuth = _ref34$noAuth === void 0 ? false : _ref34$noAuth;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                this.Log("Retrieving content object versions: ".concat(libraryId || "", " ").concat(objectId || versionHash));
                path = UrlJoin("qid", objectId);
                _context30.t0 = ResponseToJson;
                _context30.t1 = this.HttpClient;
                _context30.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  noAuth: noAuth
                });

              case 8:
                _context30.t2 = _context30.sent;
                _context30.t3 = path;
                _context30.t4 = {
                  headers: _context30.t2,
                  method: "GET",
                  path: _context30.t3
                };
                _context30.t5 = _context30.t1.Request.call(_context30.t1, _context30.t4);
                return _context30.abrupt("return", (0, _context30.t0)(_context30.t5));

              case 13:
              case "end":
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function ContentObjectVersions(_x28) {
        return _ContentObjectVersions.apply(this, arguments);
      }

      return ContentObjectVersions;
    }()
    /* Content object creation, modification, deletion */

    /**
     * Create a new content object draft.
     *
     * A new content object contract is deployed from
     * the content library, and that contract ID is used to determine the object ID to
     * create in the fabric.
     *
     * @see PUT /qlibs/:qlibid/q/:objectid
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {objectId=} objectId - ID of the object (if contract already exists)
     * @param {Object=} options -
     * type: Version hash of the content type to associate with the object
     *
     * meta: Metadata to use for the new object
     *
     * @returns {Promise<Object>} - Response containing the object ID and write token of the draft
     */

  }, {
    key: "CreateContentObject",
    value: function () {
      var _CreateContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee31(_ref35) {
        var libraryId, objectId, _ref35$options, options, typeId, type, _ref36, contractAddress, path;

        return regeneratorRuntime.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                libraryId = _ref35.libraryId, objectId = _ref35.objectId, _ref35$options = _ref35.options, options = _ref35$options === void 0 ? {} : _ref35$options;
                ValidateLibrary(libraryId);

                if (objectId) {
                  ValidateObject(objectId);
                }

                this.Log("Creating content object: ".concat(libraryId, " ").concat(objectId || "")); // Look up content type, if specified

                if (!options.type) {
                  _context31.next = 17;
                  break;
                }

                this.Log("Type specified: ".concat(options.type));

                if (options.type.startsWith("hq__")) {
                  _context31.next = 12;
                  break;
                }

                _context31.next = 9;
                return this.ContentType({
                  name: options.type
                });

              case 9:
                type = _context31.sent;
                _context31.next = 15;
                break;

              case 12:
                _context31.next = 14;
                return this.ContentType({
                  versionHash: options.type
                });

              case 14:
                type = _context31.sent;

              case 15:
                typeId = type.id;
                options.type = type.hash;

              case 17:
                if (objectId) {
                  _context31.next = 27;
                  break;
                }

                this.Log("Deploying contract...");
                _context31.next = 21;
                return this.authClient.CreateContentObject({
                  libraryId: libraryId,
                  typeId: typeId
                });

              case 21:
                _ref36 = _context31.sent;
                contractAddress = _ref36.contractAddress;
                objectId = this.utils.AddressToObjectId(contractAddress);
                this.Log("Contract deployed: ".concat(contractAddress, " ").concat(objectId));
                _context31.next = 34;
                break;

              case 27:
                _context31.t0 = this;
                _context31.t1 = "Contract already deployed for contract type: ";
                _context31.next = 31;
                return this.AccessType({
                  id: objectId
                });

              case 31:
                _context31.t2 = _context31.sent;
                _context31.t3 = _context31.t1.concat.call(_context31.t1, _context31.t2);

                _context31.t0.Log.call(_context31.t0, _context31.t3);

              case 34:
                if (!options.visibility) {
                  _context31.next = 38;
                  break;
                }

                this.Log("Setting visibility to ".concat(options.visibility));
                _context31.next = 38;
                return this.CallContractMethod({
                  abi: ContentContract.abi,
                  contractAddress: this.utils.HashToAddress(objectId),
                  methodName: "setVisibility",
                  methodArgs: [options.visibility]
                });

              case 38:
                path = UrlJoin("qid", objectId);
                _context31.t4 = ResponseToJson;
                _context31.t5 = this.HttpClient;
                _context31.next = 43;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 43:
                _context31.t6 = _context31.sent;
                _context31.t7 = path;
                _context31.t8 = options;
                _context31.t9 = {
                  headers: _context31.t6,
                  method: "POST",
                  path: _context31.t7,
                  body: _context31.t8,
                  failover: false
                };
                _context31.t10 = _context31.t5.Request.call(_context31.t5, _context31.t9);
                _context31.next = 50;
                return (0, _context31.t4)(_context31.t10);

              case 50:
                return _context31.abrupt("return", _context31.sent);

              case 51:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function CreateContentObject(_x29) {
        return _CreateContentObject.apply(this, arguments);
      }

      return CreateContentObject;
    }()
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

  }, {
    key: "CopyContentObject",
    value: function () {
      var _CopyContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee32(_ref37) {
        var libraryId, originalVersionHash, _ref37$options, options;

        return regeneratorRuntime.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                libraryId = _ref37.libraryId, originalVersionHash = _ref37.originalVersionHash, _ref37$options = _ref37.options, options = _ref37$options === void 0 ? {} : _ref37$options;
                ValidateLibrary(libraryId);
                ValidateVersion(originalVersionHash);
                options.copy_from = originalVersionHash;
                _context32.next = 6;
                return this.CreateContentObject({
                  libraryId: libraryId,
                  options: options
                });

              case 6:
                return _context32.abrupt("return", _context32.sent);

              case 7:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function CopyContentObject(_x30) {
        return _CopyContentObject.apply(this, arguments);
      }

      return CopyContentObject;
    }()
    /**
     * Create a new content object draft from an existing object.
     *
     * @see POST /qlibs/:qlibid/qid/:objectid
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {object=} options -
     * meta: New metadata for the object - will be merged into existing metadata if specified
     *
     * @returns {Promise<object>} - Response containing the object ID and write token of the draft
     */

  }, {
    key: "EditContentObject",
    value: function () {
      var _EditContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee33(_ref38) {
        var libraryId, objectId, _ref38$options, options, path;

        return regeneratorRuntime.wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                libraryId = _ref38.libraryId, objectId = _ref38.objectId, _ref38$options = _ref38.options, options = _ref38$options === void 0 ? {} : _ref38$options;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                this.Log("Opening content draft: ".concat(libraryId, " ").concat(objectId));

                if (this.utils.EqualHash(libraryId, objectId)) {
                  _context33.next = 7;
                  break;
                }

                // Don't allow changing of content type in this method
                delete options.type;
                _context33.next = 23;
                break;

              case 7:
                if (!options.type) {
                  _context33.next = 23;
                  break;
                }

                if (!options.type.startsWith("hq__")) {
                  _context33.next = 14;
                  break;
                }

                _context33.next = 11;
                return this.ContentType({
                  versionHash: options.type
                });

              case 11:
                options.type = _context33.sent.hash;
                _context33.next = 23;
                break;

              case 14:
                if (!options.type.startsWith("iq__")) {
                  _context33.next = 20;
                  break;
                }

                _context33.next = 17;
                return this.ContentType({
                  typeId: options.type
                });

              case 17:
                options.type = _context33.sent.hash;
                _context33.next = 23;
                break;

              case 20:
                _context33.next = 22;
                return this.ContentType({
                  name: options.type
                });

              case 22:
                options.type = _context33.sent.hash;

              case 23:
                path = UrlJoin("qid", objectId);
                _context33.t0 = ResponseToJson;
                _context33.t1 = this.HttpClient;
                _context33.next = 28;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 28:
                _context33.t2 = _context33.sent;
                _context33.t3 = path;
                _context33.t4 = options;
                _context33.t5 = {
                  headers: _context33.t2,
                  method: "POST",
                  path: _context33.t3,
                  body: _context33.t4,
                  failover: false
                };
                _context33.t6 = _context33.t1.Request.call(_context33.t1, _context33.t5);
                return _context33.abrupt("return", (0, _context33.t0)(_context33.t6));

              case 34:
              case "end":
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }));

      function EditContentObject(_x31) {
        return _EditContentObject.apply(this, arguments);
      }

      return EditContentObject;
    }()
    /**
     * Finalize content draft
     *
     * @see POST /qlibs/:qlibid/q/:write_token
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

  }, {
    key: "FinalizeContentObject",
    value: function () {
      var _FinalizeContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee34(_ref39) {
        var libraryId, objectId, writeToken, _ref39$publish, publish, _ref39$awaitCommitCon, awaitCommitConfirmation, path, finalizeResponse;

        return regeneratorRuntime.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                libraryId = _ref39.libraryId, objectId = _ref39.objectId, writeToken = _ref39.writeToken, _ref39$publish = _ref39.publish, publish = _ref39$publish === void 0 ? true : _ref39$publish, _ref39$awaitCommitCon = _ref39.awaitCommitConfirmation, awaitCommitConfirmation = _ref39$awaitCommitCon === void 0 ? true : _ref39$awaitCommitCon;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                this.Log("Finalizing content draft: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
                path = UrlJoin("q", writeToken);
                _context34.t0 = ResponseToJson;
                _context34.t1 = this.HttpClient;
                _context34.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 9:
                _context34.t2 = _context34.sent;
                _context34.t3 = path;
                _context34.t4 = {
                  headers: _context34.t2,
                  method: "POST",
                  path: _context34.t3,
                  failover: false
                };
                _context34.t5 = _context34.t1.Request.call(_context34.t1, _context34.t4);
                _context34.next = 15;
                return (0, _context34.t0)(_context34.t5);

              case 15:
                finalizeResponse = _context34.sent;
                this.Log("Finalized: ".concat(finalizeResponse.hash));

                if (!publish) {
                  _context34.next = 20;
                  break;
                }

                _context34.next = 20;
                return this.PublishContentVersion({
                  objectId: objectId,
                  versionHash: finalizeResponse.hash,
                  awaitCommitConfirmation: awaitCommitConfirmation
                });

              case 20:
                // Invalidate cached content type, if this is one.
                delete this.contentTypes[objectId];
                return _context34.abrupt("return", finalizeResponse);

              case 22:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function FinalizeContentObject(_x32) {
        return _FinalizeContentObject.apply(this, arguments);
      }

      return FinalizeContentObject;
    }()
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

  }, {
    key: "PublishContentVersion",
    value: function () {
      var _PublishContentVersion = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee35(_ref40) {
        var objectId, versionHash, _ref40$awaitCommitCon, awaitCommitConfirmation;

        return regeneratorRuntime.wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                objectId = _ref40.objectId, versionHash = _ref40.versionHash, _ref40$awaitCommitCon = _ref40.awaitCommitConfirmation, awaitCommitConfirmation = _ref40$awaitCommitCon === void 0 ? true : _ref40$awaitCommitCon;
                versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
                this.Log("Publishing: ".concat(objectId || versionHash));

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context35.next = 6;
                return this.ethClient.CommitContent({
                  contentObjectAddress: this.utils.HashToAddress(objectId),
                  versionHash: versionHash,
                  signer: this.signer
                });

              case 6:
                if (!awaitCommitConfirmation) {
                  _context35.next = 10;
                  break;
                }

                this.Log("Awaiting commit confirmation...");
                _context35.next = 10;
                return this.ethClient.AwaitEvent({
                  contractAddress: this.utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  eventName: "VersionConfirm",
                  signer: this.signer
                });

              case 10:
              case "end":
                return _context35.stop();
            }
          }
        }, _callee35, this);
      }));

      function PublishContentVersion(_x33) {
        return _PublishContentVersion.apply(this, arguments);
      }

      return PublishContentVersion;
    }()
    /**
     * Delete specified version of the content object
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be deleted
     */

  }, {
    key: "DeleteContentVersion",
    value: function () {
      var _DeleteContentVersion = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee36(_ref41) {
        var versionHash, _this$utils$DecodeVer, objectId;

        return regeneratorRuntime.wrap(function _callee36$(_context36) {
          while (1) {
            switch (_context36.prev = _context36.next) {
              case 0:
                versionHash = _ref41.versionHash;
                ValidateVersion(versionHash);
                this.Log("Deleting content version: ".concat(versionHash));
                _this$utils$DecodeVer = this.utils.DecodeVersionHash(versionHash), objectId = _this$utils$DecodeVer.objectId;
                _context36.next = 6;
                return this.CallContractMethodAndWait({
                  contractAddress: this.utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "deleteVersion",
                  methodArgs: [versionHash]
                });

              case 6:
              case "end":
                return _context36.stop();
            }
          }
        }, _callee36, this);
      }));

      function DeleteContentVersion(_x34) {
        return _DeleteContentVersion.apply(this, arguments);
      }

      return DeleteContentVersion;
    }()
    /**
     * Delete specified content object
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     */

  }, {
    key: "DeleteContentObject",
    value: function () {
      var _DeleteContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee37(_ref42) {
        var libraryId, objectId;
        return regeneratorRuntime.wrap(function _callee37$(_context37) {
          while (1) {
            switch (_context37.prev = _context37.next) {
              case 0:
                libraryId = _ref42.libraryId, objectId = _ref42.objectId;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                this.Log("Deleting content version: ".concat(libraryId, " ").concat(objectId));
                _context37.next = 5;
                return this.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "deleteContent",
                  methodArgs: [this.utils.HashToAddress(objectId)]
                });

              case 5:
              case "end":
                return _context37.stop();
            }
          }
        }, _callee37, this);
      }));

      function DeleteContentObject(_x35) {
        return _DeleteContentObject.apply(this, arguments);
      }

      return DeleteContentObject;
    }()
    /* Content object metadata */

    /**
     * Merge specified metadata into existing content object metadata
     *
     * @see POST /qlibs/:qlibid/q/:write_token/meta
     *
     * @methodGroup Metadata
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the draft
     * @param {Object} metadata - New metadata to merge
     * @param {string=} metadataSubtree - Subtree of the object metadata to modify
     */

  }, {
    key: "MergeMetadata",
    value: function () {
      var _MergeMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee38(_ref43) {
        var libraryId, objectId, writeToken, _ref43$metadataSubtre, metadataSubtree, _ref43$metadata, metadata, path;

        return regeneratorRuntime.wrap(function _callee38$(_context38) {
          while (1) {
            switch (_context38.prev = _context38.next) {
              case 0:
                libraryId = _ref43.libraryId, objectId = _ref43.objectId, writeToken = _ref43.writeToken, _ref43$metadataSubtre = _ref43.metadataSubtree, metadataSubtree = _ref43$metadataSubtre === void 0 ? "/" : _ref43$metadataSubtre, _ref43$metadata = _ref43.metadata, metadata = _ref43$metadata === void 0 ? {} : _ref43$metadata;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                this.Log("Merging metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
                this.Log(metadata);
                path = UrlJoin("q", writeToken, "meta", metadataSubtree);
                _context38.t0 = this.HttpClient;
                _context38.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 9:
                _context38.t1 = _context38.sent;
                _context38.t2 = path;
                _context38.t3 = metadata;
                _context38.t4 = {
                  headers: _context38.t1,
                  method: "POST",
                  path: _context38.t2,
                  body: _context38.t3,
                  failover: false
                };
                _context38.next = 15;
                return _context38.t0.Request.call(_context38.t0, _context38.t4);

              case 15:
              case "end":
                return _context38.stop();
            }
          }
        }, _callee38, this);
      }));

      function MergeMetadata(_x36) {
        return _MergeMetadata.apply(this, arguments);
      }

      return MergeMetadata;
    }()
    /**
     * Replace content object metadata with specified metadata
     *
     * @see PUT /qlibs/:qlibid/q/:write_token/meta
     *
     * @methodGroup Metadata
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the draft
     * @param {Object} metadata - New metadata to merge
     * @param {string=} metadataSubtree - Subtree of the object metadata to modify
     */

  }, {
    key: "ReplaceMetadata",
    value: function () {
      var _ReplaceMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee39(_ref44) {
        var libraryId, objectId, writeToken, _ref44$metadataSubtre, metadataSubtree, _ref44$metadata, metadata, path;

        return regeneratorRuntime.wrap(function _callee39$(_context39) {
          while (1) {
            switch (_context39.prev = _context39.next) {
              case 0:
                libraryId = _ref44.libraryId, objectId = _ref44.objectId, writeToken = _ref44.writeToken, _ref44$metadataSubtre = _ref44.metadataSubtree, metadataSubtree = _ref44$metadataSubtre === void 0 ? "/" : _ref44$metadataSubtre, _ref44$metadata = _ref44.metadata, metadata = _ref44$metadata === void 0 ? {} : _ref44$metadata;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                this.Log("Replacing metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
                this.Log(metadata);
                path = UrlJoin("q", writeToken, "meta", metadataSubtree);
                _context39.t0 = this.HttpClient;
                _context39.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 9:
                _context39.t1 = _context39.sent;
                _context39.t2 = path;
                _context39.t3 = metadata;
                _context39.t4 = {
                  headers: _context39.t1,
                  method: "PUT",
                  path: _context39.t2,
                  body: _context39.t3,
                  failover: false
                };
                _context39.next = 15;
                return _context39.t0.Request.call(_context39.t0, _context39.t4);

              case 15:
              case "end":
                return _context39.stop();
            }
          }
        }, _callee39, this);
      }));

      function ReplaceMetadata(_x37) {
        return _ReplaceMetadata.apply(this, arguments);
      }

      return ReplaceMetadata;
    }()
    /**
     * Delete content object metadata of specified subtree
     *
     * @see DELETE /qlibs/:qlibid/q/:write_token/meta
     *
     * @methodGroup Metadata
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the draft
     * @param {string=} metadataSubtree - Subtree of the object metadata to modify
     * - if not specified, all metadata will be deleted
     */

  }, {
    key: "DeleteMetadata",
    value: function () {
      var _DeleteMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee40(_ref45) {
        var libraryId, objectId, writeToken, _ref45$metadataSubtre, metadataSubtree, path;

        return regeneratorRuntime.wrap(function _callee40$(_context40) {
          while (1) {
            switch (_context40.prev = _context40.next) {
              case 0:
                libraryId = _ref45.libraryId, objectId = _ref45.objectId, writeToken = _ref45.writeToken, _ref45$metadataSubtre = _ref45.metadataSubtree, metadataSubtree = _ref45$metadataSubtre === void 0 ? "/" : _ref45$metadataSubtre;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                this.Log("Deleting metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
                this.Log("Subtree: ".concat(metadataSubtree));
                path = UrlJoin("q", writeToken, "meta", metadataSubtree);
                _context40.t0 = this.HttpClient;
                _context40.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 9:
                _context40.t1 = _context40.sent;
                _context40.t2 = path;
                _context40.t3 = {
                  headers: _context40.t1,
                  method: "DELETE",
                  path: _context40.t2,
                  failover: false
                };
                _context40.next = 14;
                return _context40.t0.Request.call(_context40.t0, _context40.t3);

              case 14:
              case "end":
                return _context40.stop();
            }
          }
        }, _callee40, this);
      }));

      function DeleteMetadata(_x38) {
        return _DeleteMetadata.apply(this, arguments);
      }

      return DeleteMetadata;
    }()
    /* Files */

    /**
     * List the file information about this object
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be used
     */

  }, {
    key: "ListFiles",
    value: function () {
      var _ListFiles = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee41(_ref46) {
        var libraryId, objectId, versionHash, path;
        return regeneratorRuntime.wrap(function _callee41$(_context41) {
          while (1) {
            switch (_context41.prev = _context41.next) {
              case 0:
                libraryId = _ref46.libraryId, objectId = _ref46.objectId, versionHash = _ref46.versionHash;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "meta", "files");
                _context41.t0 = ResponseToJson;
                _context41.t1 = this.HttpClient;
                _context41.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 8:
                _context41.t2 = _context41.sent;
                _context41.t3 = path;
                _context41.t4 = {
                  headers: _context41.t2,
                  method: "GET",
                  path: _context41.t3
                };
                _context41.t5 = _context41.t1.Request.call(_context41.t1, _context41.t4);
                return _context41.abrupt("return", (0, _context41.t0)(_context41.t5));

              case 13:
              case "end":
                return _context41.stop();
            }
          }
        }, _callee41, this);
      }));

      function ListFiles(_x39) {
        return _ListFiles.apply(this, arguments);
      }

      return ListFiles;
    }()
    /**
     * Create links
     *
     * Expected format of links:
     *
     [
       {
          path: string (path to link)
          target: string (path to target file),
          targetHash: string (optional, for cross-object links)
        }
     ]
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the draft
     * @param {Array<Object>} links - Link specifications
     */

  }, {
    key: "CreateLinks",
    value: function () {
      var _CreateLinks = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee43(_ref47) {
        var _this4 = this;

        var libraryId, objectId, writeToken, _ref47$links, links;

        return regeneratorRuntime.wrap(function _callee43$(_context43) {
          while (1) {
            switch (_context43.prev = _context43.next) {
              case 0:
                libraryId = _ref47.libraryId, objectId = _ref47.objectId, writeToken = _ref47.writeToken, _ref47$links = _ref47.links, links = _ref47$links === void 0 ? [] : _ref47$links;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                _context43.next = 5;
                return LimitedMap(5, links,
                /*#__PURE__*/
                function () {
                  var _ref48 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee42(info) {
                    var path, target;
                    return regeneratorRuntime.wrap(function _callee42$(_context42) {
                      while (1) {
                        switch (_context42.prev = _context42.next) {
                          case 0:
                            path = info.path.replace(/^(\/|\.)+/, "");
                            target = info.target.replace(/^(\/|\.)+/, "");

                            if (info.targetHash) {
                              target = "/qfab/".concat(info.targetHash, "/files/").concat(target);
                            } else {
                              target = "./files/".concat(target);
                            }

                            _context42.next = 5;
                            return _this4.ReplaceMetadata({
                              libraryId: libraryId,
                              objectId: objectId,
                              writeToken: writeToken,
                              metadataSubtree: path,
                              metadata: {
                                "/": target
                              }
                            });

                          case 5:
                          case "end":
                            return _context42.stop();
                        }
                      }
                    }, _callee42);
                  }));

                  return function (_x41) {
                    return _ref48.apply(this, arguments);
                  };
                }());

              case 5:
              case "end":
                return _context43.stop();
            }
          }
        }, _callee43);
      }));

      function CreateLinks(_x40) {
        return _CreateLinks.apply(this, arguments);
      }

      return CreateLinks;
    }()
    /**
     * Copy/reference files from S3 to a content object
     *
     * Expected format of fileInfo:
     *
     [
       {
         path: string,
         source: string
       }
     ]
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the draft
     * @param {string} region - AWS region to use
     * @param {string} bucket - AWS bucket to use
     * @param {Array<Object>} fileInfo - List of files to reference/copy
     * @param {string} accessKey - AWS access key
     * @param {string} secret - AWS secret
     * @param {boolean} copy=false - If true, will copy the data from S3 into the fabric. Otherwise, a reference to the content will be made.
     * @param {function=} callback - If specified, will be periodically called with current upload status
     * - Arguments (copy): { done: boolean, uploaded: number, total: number, uploadedFiles: number, totalFiles: number, fileStatus: Object }
     * - Arguments (reference): { done: boolean, uploadedFiles: number, totalFiles: number }
     */

  }, {
    key: "UploadFilesFromS3",
    value: function () {
      var _UploadFilesFromS = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee44(_ref49) {
        var libraryId, objectId, writeToken, region, bucket, fileInfo, accessKey, secret, _ref49$copy, copy, callback, defaults, ops, _ref50, id, status, done, progress, _progress;

        return regeneratorRuntime.wrap(function _callee44$(_context44) {
          while (1) {
            switch (_context44.prev = _context44.next) {
              case 0:
                libraryId = _ref49.libraryId, objectId = _ref49.objectId, writeToken = _ref49.writeToken, region = _ref49.region, bucket = _ref49.bucket, fileInfo = _ref49.fileInfo, accessKey = _ref49.accessKey, secret = _ref49.secret, _ref49$copy = _ref49.copy, copy = _ref49$copy === void 0 ? false : _ref49$copy, callback = _ref49.callback;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                defaults = {
                  access: {
                    protocol: "s3",
                    platform: "aws",
                    path: bucket,
                    storage_endpoint: {
                      region: region
                    },
                    cloud_credentials: {
                      access_key_id: accessKey,
                      secret_access_key: secret
                    }
                  }
                };
                ops = fileInfo.map(function (info) {
                  if (copy) {
                    return {
                      op: "ingest-copy",
                      path: info.path,
                      ingest: {
                        type: "key",
                        path: info.source
                      }
                    };
                  } else {
                    return {
                      op: "add-reference",
                      path: info.path,
                      reference: {
                        type: "key",
                        path: info.source
                      }
                    };
                  }
                }); // eslint-disable-next-line no-unused-vars

                _context44.next = 7;
                return this.CreateFileUploadJob({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  ops: ops,
                  defaults: defaults
                });

              case 7:
                _ref50 = _context44.sent;
                id = _ref50.id;

              case 9:
                if (!true) {
                  _context44.next = 32;
                  break;
                }

                _context44.next = 12;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, 1000);
                });

              case 12:
                _context44.next = 14;
                return this.UploadStatus({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  uploadId: id
                });

              case 14:
                status = _context44.sent;

                if (!(status.errors && status.errors.length > 1)) {
                  _context44.next = 19;
                  break;
                }

                throw status.errors.join("\n");

              case 19:
                if (!status.error) {
                  _context44.next = 24;
                  break;
                }

                this.Log("S3 file upload failed:\n".concat(JSON.stringify(status, null, 2)));
                throw status.error;

              case 24:
                if (!(status.status.toLowerCase() === "failed")) {
                  _context44.next = 26;
                  break;
                }

                throw "File upload failed";

              case 26:
                done = false;

                if (copy) {
                  done = status.ingest_copy.done;

                  if (callback) {
                    progress = status.ingest_copy.progress;
                    callback({
                      done: done,
                      uploaded: progress.bytes.completed,
                      total: progress.bytes.total,
                      uploadedFiles: progress.files.completed,
                      totalFiles: progress.files.total,
                      fileStatus: progress.files.details
                    });
                  }
                } else {
                  done = status.add_reference.done;

                  if (callback) {
                    _progress = status.add_reference.progress;
                    callback({
                      done: done,
                      uploadedFiles: _progress.completed,
                      totalFiles: _progress.total
                    });
                  }
                }

                if (!done) {
                  _context44.next = 30;
                  break;
                }

                return _context44.abrupt("break", 32);

              case 30:
                _context44.next = 9;
                break;

              case 32:
              case "end":
                return _context44.stop();
            }
          }
        }, _callee44, this);
      }));

      function UploadFilesFromS3(_x42) {
        return _UploadFilesFromS.apply(this, arguments);
      }

      return UploadFilesFromS3;
    }()
    /**
     * Upload files to a content object.
     *
     * Expected format of fileInfo:
     *
     [
       {
          path: string,
          mime_type: string,
          size: number,
          data: File | ArrayBuffer | Buffer
        }
     ]
     *
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the draft
     * @param {Array<object>} fileInfo - List of files to upload, including their size, type, and contents
     * @param {function=} callback - If specified, will be called after each job segment is finished with the current upload progress
     * - Format: {"filename1": {uploaded: number, total: number}, ...}
     */

  }, {
    key: "UploadFiles",
    value: function () {
      var _UploadFiles = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee47(_ref51) {
        var _this5 = this;

        var libraryId, objectId, writeToken, fileInfo, callback, progress, fileDataMap, _ref52, id, jobs, jobInfo, concurrentUploads, firstJob, firstChunk, fileData, start, elapsed, mbps;

        return regeneratorRuntime.wrap(function _callee47$(_context47) {
          while (1) {
            switch (_context47.prev = _context47.next) {
              case 0:
                libraryId = _ref51.libraryId, objectId = _ref51.objectId, writeToken = _ref51.writeToken, fileInfo = _ref51.fileInfo, callback = _ref51.callback;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                this.Log("Uploading files: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken)); // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation

                progress = {};
                fileDataMap = {};
                fileInfo = fileInfo.map(function (entry) {
                  entry.path = entry.path.replace(/^\/+/, "");
                  fileDataMap[entry.path] = entry.data;
                  delete entry.data;
                  entry.type = "file";
                  progress[entry.path] = {
                    uploaded: 0,
                    total: entry.size
                  };
                  return entry;
                });
                this.Log(fileInfo);

                if (callback) {
                  callback(progress);
                }

                _context47.next = 11;
                return this.CreateFileUploadJob({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  ops: fileInfo
                });

              case 11:
                _ref52 = _context47.sent;
                id = _ref52.id;
                jobs = _ref52.jobs;
                this.Log("Upload ID: ".concat(id));
                this.Log(jobs);
                _context47.next = 18;
                return LimitedMap(5, jobs,
                /*#__PURE__*/
                function () {
                  var _ref53 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee45(jobId) {
                    return regeneratorRuntime.wrap(function _callee45$(_context45) {
                      while (1) {
                        switch (_context45.prev = _context45.next) {
                          case 0:
                            _context45.next = 2;
                            return _this5.UploadJobStatus({
                              libraryId: libraryId,
                              objectId: objectId,
                              writeToken: writeToken,
                              uploadId: id,
                              jobId: jobId
                            });

                          case 2:
                            return _context45.abrupt("return", _context45.sent);

                          case 3:
                          case "end":
                            return _context45.stop();
                        }
                      }
                    }, _callee45);
                  }));

                  return function (_x44) {
                    return _ref53.apply(this, arguments);
                  };
                }());

              case 18:
                jobInfo = _context47.sent;
                concurrentUploads = 1;

                if (!(jobInfo.length > 1)) {
                  _context47.next = 33;
                  break;
                }

                // Upload first chunk to estimate bandwidth
                firstJob = jobInfo[0];
                firstChunk = firstJob.files.shift();
                fileData = fileDataMap[firstChunk.path].slice(firstChunk.off, firstChunk.off + firstChunk.len);
                start = new Date().getTime();
                _context47.next = 27;
                return this.UploadFileData({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  uploadId: id,
                  jobId: firstJob.id,
                  fileData: fileData
                });

              case 27:
                elapsed = (new Date().getTime() - start) / 1000;
                mbps = firstChunk.len / elapsed / 1000000;

                if (callback) {
                  progress[firstChunk.path] = _objectSpread({}, progress[firstChunk.path], {
                    uploaded: progress[firstChunk.path].uploaded + firstChunk.len
                  });
                  callback(progress);
                } // Determine upload concurrency for rest of data based on estimated bandwidth


                concurrentUploads = Math.min(5, Math.max(1, Math.floor(mbps / 8)));
                this.Log("Calculated speed: ".concat(mbps, " Mbps"));
                this.Log("Proceeding with ".concat(concurrentUploads, " concurrent upload(s)"));

              case 33:
                _context47.next = 35;
                return LimitedMap(concurrentUploads, jobInfo,
                /*#__PURE__*/
                function () {
                  var _ref54 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee46(job) {
                    var jobId, files, i, _fileInfo, _fileData;

                    return regeneratorRuntime.wrap(function _callee46$(_context46) {
                      while (1) {
                        switch (_context46.prev = _context46.next) {
                          case 0:
                            jobId = job.id;
                            files = job.files; // Upload each item

                            i = 0;

                          case 3:
                            if (!(i < files.length)) {
                              _context46.next = 12;
                              break;
                            }

                            _fileInfo = files[i];
                            _fileData = fileDataMap[_fileInfo.path].slice(_fileInfo.off, _fileInfo.off + _fileInfo.len);
                            _context46.next = 8;
                            return _this5.UploadFileData({
                              libraryId: libraryId,
                              objectId: objectId,
                              writeToken: writeToken,
                              uploadId: id,
                              jobId: jobId,
                              fileData: _fileData
                            });

                          case 8:
                            if (callback) {
                              progress[_fileInfo.path] = _objectSpread({}, progress[_fileInfo.path], {
                                uploaded: progress[_fileInfo.path].uploaded + _fileInfo.len
                              });
                              callback(progress);
                            }

                          case 9:
                            i++;
                            _context46.next = 3;
                            break;

                          case 12:
                          case "end":
                            return _context46.stop();
                        }
                      }
                    }, _callee46);
                  }));

                  return function (_x45) {
                    return _ref54.apply(this, arguments);
                  };
                }());

              case 35:
              case "end":
                return _context47.stop();
            }
          }
        }, _callee47, this);
      }));

      function UploadFiles(_x43) {
        return _UploadFiles.apply(this, arguments);
      }

      return UploadFiles;
    }()
  }, {
    key: "CreateFileUploadJob",
    value: function () {
      var _CreateFileUploadJob = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee48(_ref55) {
        var libraryId, objectId, writeToken, ops, _ref55$defaults, defaults, path, body;

        return regeneratorRuntime.wrap(function _callee48$(_context48) {
          while (1) {
            switch (_context48.prev = _context48.next) {
              case 0:
                libraryId = _ref55.libraryId, objectId = _ref55.objectId, writeToken = _ref55.writeToken, ops = _ref55.ops, _ref55$defaults = _ref55.defaults, defaults = _ref55$defaults === void 0 ? {} : _ref55$defaults;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                this.Log("Creating file upload job: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
                this.Log(ops);
                path = UrlJoin("q", writeToken, "file_jobs");
                body = {
                  seq: 0,
                  seq_complete: true,
                  defaults: defaults,
                  ops: ops
                };
                _context48.t0 = ResponseToJson;
                _context48.t1 = this.HttpClient;
                _context48.next = 11;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 11:
                _context48.t2 = _context48.sent;
                _context48.t3 = path;
                _context48.t4 = body;
                _context48.t5 = {
                  headers: _context48.t2,
                  method: "POST",
                  path: _context48.t3,
                  body: _context48.t4,
                  failover: false
                };
                _context48.t6 = _context48.t1.Request.call(_context48.t1, _context48.t5);
                return _context48.abrupt("return", (0, _context48.t0)(_context48.t6));

              case 17:
              case "end":
                return _context48.stop();
            }
          }
        }, _callee48, this);
      }));

      function CreateFileUploadJob(_x46) {
        return _CreateFileUploadJob.apply(this, arguments);
      }

      return CreateFileUploadJob;
    }()
  }, {
    key: "UploadStatus",
    value: function () {
      var _UploadStatus = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee49(_ref56) {
        var libraryId, objectId, writeToken, uploadId, path;
        return regeneratorRuntime.wrap(function _callee49$(_context49) {
          while (1) {
            switch (_context49.prev = _context49.next) {
              case 0:
                libraryId = _ref56.libraryId, objectId = _ref56.objectId, writeToken = _ref56.writeToken, uploadId = _ref56.uploadId;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                path = UrlJoin("q", writeToken, "file_jobs", uploadId);
                _context49.t0 = ResponseToJson;
                _context49.t1 = this.HttpClient;
                _context49.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 8:
                _context49.t2 = _context49.sent;
                _context49.t3 = path;
                _context49.t4 = {
                  headers: _context49.t2,
                  method: "GET",
                  path: _context49.t3,
                  failover: false
                };
                _context49.t5 = _context49.t1.Request.call(_context49.t1, _context49.t4);
                return _context49.abrupt("return", (0, _context49.t0)(_context49.t5));

              case 13:
              case "end":
                return _context49.stop();
            }
          }
        }, _callee49, this);
      }));

      function UploadStatus(_x47) {
        return _UploadStatus.apply(this, arguments);
      }

      return UploadStatus;
    }()
  }, {
    key: "UploadJobStatus",
    value: function () {
      var _UploadJobStatus = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee50(_ref57) {
        var libraryId, objectId, writeToken, uploadId, jobId, path;
        return regeneratorRuntime.wrap(function _callee50$(_context50) {
          while (1) {
            switch (_context50.prev = _context50.next) {
              case 0:
                libraryId = _ref57.libraryId, objectId = _ref57.objectId, writeToken = _ref57.writeToken, uploadId = _ref57.uploadId, jobId = _ref57.jobId;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                path = UrlJoin("q", writeToken, "file_jobs", uploadId, "uploads", jobId);
                _context50.t0 = ResponseToJson;
                _context50.t1 = this.HttpClient;
                _context50.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 8:
                _context50.t2 = _context50.sent;
                _context50.t3 = path;
                _context50.t4 = {
                  headers: _context50.t2,
                  method: "GET",
                  path: _context50.t3,
                  failover: false
                };
                _context50.t5 = _context50.t1.Request.call(_context50.t1, _context50.t4);
                return _context50.abrupt("return", (0, _context50.t0)(_context50.t5));

              case 13:
              case "end":
                return _context50.stop();
            }
          }
        }, _callee50, this);
      }));

      function UploadJobStatus(_x48) {
        return _UploadJobStatus.apply(this, arguments);
      }

      return UploadJobStatus;
    }()
  }, {
    key: "UploadFileData",
    value: function () {
      var _UploadFileData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee51(_ref58) {
        var libraryId, objectId, writeToken, uploadId, jobId, fileData, path;
        return regeneratorRuntime.wrap(function _callee51$(_context51) {
          while (1) {
            switch (_context51.prev = _context51.next) {
              case 0:
                libraryId = _ref58.libraryId, objectId = _ref58.objectId, writeToken = _ref58.writeToken, uploadId = _ref58.uploadId, jobId = _ref58.jobId, fileData = _ref58.fileData;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                path = UrlJoin("q", writeToken, "file_jobs", uploadId, jobId);
                _context51.t0 = ResponseToJson;
                _context51.t1 = this.HttpClient;
                _context51.t2 = path;
                _context51.t3 = fileData;
                _context51.t4 = _objectSpread;
                _context51.t5 = {
                  "Content-type": "application/octet-stream"
                };
                _context51.next = 12;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 12:
                _context51.t6 = _context51.sent;
                _context51.t7 = (0, _context51.t4)(_context51.t5, _context51.t6);
                _context51.t8 = {
                  method: "POST",
                  path: _context51.t2,
                  body: _context51.t3,
                  bodyType: "BINARY",
                  headers: _context51.t7,
                  failover: false
                };
                _context51.t9 = _context51.t1.Request.call(_context51.t1, _context51.t8);
                _context51.next = 18;
                return (0, _context51.t0)(_context51.t9);

              case 18:
              case "end":
                return _context51.stop();
            }
          }
        }, _callee51, this);
      }));

      function UploadFileData(_x49) {
        return _UploadFileData.apply(this, arguments);
      }

      return UploadFileData;
    }()
  }, {
    key: "FinalizeUploadJob",
    value: function () {
      var _FinalizeUploadJob = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee52(_ref59) {
        var libraryId, objectId, writeToken, path;
        return regeneratorRuntime.wrap(function _callee52$(_context52) {
          while (1) {
            switch (_context52.prev = _context52.next) {
              case 0:
                libraryId = _ref59.libraryId, objectId = _ref59.objectId, writeToken = _ref59.writeToken;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                this.Log("Finalizing upload job: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
                path = UrlJoin("q", writeToken, "files");
                _context52.t0 = this.HttpClient;
                _context52.t1 = path;
                _context52.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 9:
                _context52.t2 = _context52.sent;
                _context52.t3 = {
                  method: "POST",
                  path: _context52.t1,
                  bodyType: "BINARY",
                  headers: _context52.t2,
                  failover: false
                };
                _context52.next = 13;
                return _context52.t0.Request.call(_context52.t0, _context52.t3);

              case 13:
              case "end":
                return _context52.stop();
            }
          }
        }, _callee52, this);
      }));

      function FinalizeUploadJob(_x50) {
        return _FinalizeUploadJob.apply(this, arguments);
      }

      return FinalizeUploadJob;
    }()
    /**
     * Delete the specified list of files/directories
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the draft
     * @param {Array<string>} filePaths - List of file paths to delete
     */

  }, {
    key: "DeleteFiles",
    value: function () {
      var _DeleteFiles = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee53(_ref60) {
        var libraryId, objectId, writeToken, filePaths, ops;
        return regeneratorRuntime.wrap(function _callee53$(_context53) {
          while (1) {
            switch (_context53.prev = _context53.next) {
              case 0:
                libraryId = _ref60.libraryId, objectId = _ref60.objectId, writeToken = _ref60.writeToken, filePaths = _ref60.filePaths;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                this.Log("Deleting Files: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
                this.Log(filePaths);
                ops = filePaths.map(function (path) {
                  return {
                    op: "del",
                    path: path
                  };
                });
                _context53.next = 8;
                return this.CreateFileUploadJob({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  fileInfo: ops
                });

              case 8:
              case "end":
                return _context53.stop();
            }
          }
        }, _callee53, this);
      }));

      function DeleteFiles(_x51) {
        return _DeleteFiles.apply(this, arguments);
      }

      return DeleteFiles;
    }()
    /**
     * Download a file from a content object
     *
     * @see GET /qlibs/:qlibid/q/:qhit/files/:filePath
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
     * @param {string} filePath - Path to the file to download
     * @param {string=} format="blob" - Format in which to return the data ("blob" | "arraybuffer")
     *
     * @returns {Promise<ArrayBuffer>} - File data in the requested format
     */

  }, {
    key: "DownloadFile",
    value: function () {
      var _DownloadFile = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee54(_ref61) {
        var libraryId, objectId, versionHash, filePath, _ref61$format, format, path;

        return regeneratorRuntime.wrap(function _callee54$(_context54) {
          while (1) {
            switch (_context54.prev = _context54.next) {
              case 0:
                libraryId = _ref61.libraryId, objectId = _ref61.objectId, versionHash = _ref61.versionHash, filePath = _ref61.filePath, _ref61$format = _ref61.format, format = _ref61$format === void 0 ? "arrayBuffer" : _ref61$format;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "files", filePath);
                _context54.t0 = ResponseToFormat;
                _context54.t1 = format;
                _context54.t2 = this.HttpClient;
                _context54.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 9:
                _context54.t3 = _context54.sent;
                _context54.t4 = path;
                _context54.t5 = {
                  headers: _context54.t3,
                  method: "GET",
                  path: _context54.t4
                };
                _context54.t6 = _context54.t2.Request.call(_context54.t2, _context54.t5);
                return _context54.abrupt("return", (0, _context54.t0)(_context54.t1, _context54.t6));

              case 14:
              case "end":
                return _context54.stop();
            }
          }
        }, _callee54, this);
      }));

      function DownloadFile(_x52) {
        return _DownloadFile.apply(this, arguments);
      }

      return DownloadFile;
    }()
    /* Parts */

    /**
     * List content object parts
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
     *
     * @returns {Promise<Object>} - Response containing list of parts of the object
     */

  }, {
    key: "ContentParts",
    value: function () {
      var _ContentParts = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee55(_ref62) {
        var libraryId, objectId, versionHash, path, response;
        return regeneratorRuntime.wrap(function _callee55$(_context55) {
          while (1) {
            switch (_context55.prev = _context55.next) {
              case 0:
                libraryId = _ref62.libraryId, objectId = _ref62.objectId, versionHash = _ref62.versionHash;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });
                this.Log("Retrieving parts: ".concat(libraryId, " ").concat(objectId || versionHash));

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "parts");
                _context55.t0 = ResponseToJson;
                _context55.t1 = this.HttpClient;
                _context55.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 9:
                _context55.t2 = _context55.sent;
                _context55.t3 = path;
                _context55.t4 = {
                  headers: _context55.t2,
                  method: "GET",
                  path: _context55.t3
                };
                _context55.t5 = _context55.t1.Request.call(_context55.t1, _context55.t4);
                _context55.next = 15;
                return (0, _context55.t0)(_context55.t5);

              case 15:
                response = _context55.sent;
                return _context55.abrupt("return", response.parts);

              case 17:
              case "end":
                return _context55.stop();
            }
          }
        }, _callee55, this);
      }));

      function ContentParts(_x53) {
        return _ContentParts.apply(this, arguments);
      }

      return ContentParts;
    }()
    /**
     * Get information on a specific part
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
     * @param {string} partHash - Hash of the part to retrieve
     *
     * @returns {Promise<Object>} - Response containing information about the specified part
     */

  }, {
    key: "ContentPart",
    value: function () {
      var _ContentPart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee56(_ref63) {
        var libraryId, objectId, versionHash, partHash, path;
        return regeneratorRuntime.wrap(function _callee56$(_context56) {
          while (1) {
            switch (_context56.prev = _context56.next) {
              case 0:
                libraryId = _ref63.libraryId, objectId = _ref63.objectId, versionHash = _ref63.versionHash, partHash = _ref63.partHash;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });
                ValidatePartHash(partHash);
                this.Log("Retrieving part: ".concat(libraryId, " ").concat(objectId || versionHash, " ").concat(partHash));

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "parts", partHash);
                _context56.t0 = ResponseToJson;
                _context56.t1 = this.HttpClient;
                _context56.next = 10;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 10:
                _context56.t2 = _context56.sent;
                _context56.t3 = path;
                _context56.t4 = {
                  headers: _context56.t2,
                  method: "GET",
                  path: _context56.t3
                };
                _context56.t5 = _context56.t1.Request.call(_context56.t1, _context56.t4);
                _context56.next = 16;
                return (0, _context56.t0)(_context56.t5);

              case 16:
                return _context56.abrupt("return", _context56.sent);

              case 17:
              case "end":
                return _context56.stop();
            }
          }
        }, _callee56, this);
      }));

      function ContentPart(_x54) {
        return _ContentPart.apply(this, arguments);
      }

      return ContentPart;
    }()
    /**
     * Download a part from a content object. The fromByte and range parameters can be used to specify a
     * specific section of the part to download.
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
     * @param {string} partHash - Hash of the part to download
     * @param {string=} format="arrayBuffer" - Format in which to return the data
     * @param {boolean=} chunked=false - If specified, part will be downloaded and decrypted in chunks. The
     * specified callback will be invoked on completion of each chunk. This is recommended for large files,
     * especially if they are encrypted.
     * @param {number=} chunkSize=1000000 - If doing chunked download, size of each chunk to fetch
     * @param {function=} callback - Will be called on completion of each chunk
     * - Signature: ({bytesFinished, bytesTotal, chunk}) => {}
     *
     * Note: If the part is encrypted, bytesFinished/bytesTotal will not exactly match the size of the data
     * received. These values correspond to the size of the encrypted data - when decrypted, the part will be
     * slightly smaller.
     *
     * @returns {Promise<ArrayBuffer>} - Part data in the specified format
     */

  }, {
    key: "DownloadPart",
    value: function () {
      var _DownloadPart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee58(_ref64) {
        var libraryId, objectId, versionHash, partHash, _ref64$format, format, _ref64$chunked, chunked, _ref64$chunkSize, chunkSize, callback, encrypted, encryption, path, headers, conk, response, data, bytesTotal, bytesFinished, stream, totalChunks, i, _response;

        return regeneratorRuntime.wrap(function _callee58$(_context58) {
          while (1) {
            switch (_context58.prev = _context58.next) {
              case 0:
                libraryId = _ref64.libraryId, objectId = _ref64.objectId, versionHash = _ref64.versionHash, partHash = _ref64.partHash, _ref64$format = _ref64.format, format = _ref64$format === void 0 ? "arrayBuffer" : _ref64$format, _ref64$chunked = _ref64.chunked, chunked = _ref64$chunked === void 0 ? false : _ref64$chunked, _ref64$chunkSize = _ref64.chunkSize, chunkSize = _ref64$chunkSize === void 0 ? 10000000 : _ref64$chunkSize, callback = _ref64.callback;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });
                ValidatePartHash(partHash);

                if (!(chunked && !callback)) {
                  _context58.next = 5;
                  break;
                }

                throw Error("No callback specified for chunked part download");

              case 5:
                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                encrypted = partHash.startsWith("hqpe");
                encryption = encrypted ? "cgck" : "none";
                path = UrlJoin("q", versionHash || objectId, "data", partHash);
                _context58.next = 11;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  encryption: encryption
                });

              case 11:
                headers = _context58.sent;

                if (!encrypted) {
                  _context58.next = 16;
                  break;
                }

                _context58.next = 15;
                return this.EncryptionConk({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 15:
                conk = _context58.sent;

              case 16:
                if (chunked) {
                  _context58.next = 30;
                  break;
                }

                _context58.next = 19;
                return this.HttpClient.Request({
                  headers: headers,
                  method: "GET",
                  path: path
                });

              case 19:
                response = _context58.sent;
                _context58.next = 22;
                return response.arrayBuffer();

              case 22:
                data = _context58.sent;

                if (!encrypted) {
                  _context58.next = 27;
                  break;
                }

                _context58.next = 26;
                return Crypto.Decrypt(conk, data);

              case 26:
                data = _context58.sent;

              case 27:
                _context58.next = 29;
                return ResponseToFormat(format, new Response(data));

              case 29:
                return _context58.abrupt("return", _context58.sent);

              case 30:
                _context58.next = 32;
                return this.ContentPart({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  partHash: partHash
                });

              case 32:
                bytesTotal = _context58.sent.part.size;
                bytesFinished = 0;

                if (!encrypted) {
                  _context58.next = 39;
                  break;
                }

                _context58.next = 37;
                return Crypto.OpenDecryptionStream(conk);

              case 37:
                stream = _context58.sent;
                stream = stream.on("data",
                /*#__PURE__*/
                function () {
                  var _ref65 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee57(chunk) {
                    var arrayBuffer;
                    return regeneratorRuntime.wrap(function _callee57$(_context57) {
                      while (1) {
                        switch (_context57.prev = _context57.next) {
                          case 0:
                            if (!(format !== "buffer")) {
                              _context57.next = 9;
                              break;
                            }

                            arrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);

                            if (!(format === "arrayBuffer")) {
                              _context57.next = 6;
                              break;
                            }

                            chunk = arrayBuffer;
                            _context57.next = 9;
                            break;

                          case 6:
                            _context57.next = 8;
                            return ResponseToFormat(format, new Response(arrayBuffer));

                          case 8:
                            chunk = _context57.sent;

                          case 9:
                            callback({
                              bytesFinished: bytesFinished,
                              bytesTotal: bytesTotal,
                              chunk: chunk
                            });

                          case 10:
                          case "end":
                            return _context57.stop();
                        }
                      }
                    }, _callee57);
                  }));

                  return function (_x56) {
                    return _ref65.apply(this, arguments);
                  };
                }());

              case 39:
                totalChunks = Math.ceil(bytesTotal / chunkSize);
                i = 0;

              case 41:
                if (!(i < totalChunks)) {
                  _context58.next = 68;
                  break;
                }

                headers["Range"] = "bytes=".concat(bytesFinished, "-").concat(bytesFinished + chunkSize - 1);
                _context58.next = 45;
                return this.HttpClient.Request({
                  headers: headers,
                  method: "GET",
                  path: path
                });

              case 45:
                _response = _context58.sent;
                bytesFinished = Math.min(bytesFinished + chunkSize, bytesTotal);

                if (!encrypted) {
                  _context58.next = 57;
                  break;
                }

                _context58.t0 = stream;
                _context58.t1 = Uint8Array;
                _context58.next = 52;
                return _response.arrayBuffer();

              case 52:
                _context58.t2 = _context58.sent;
                _context58.t3 = new _context58.t1(_context58.t2);

                _context58.t0.write.call(_context58.t0, _context58.t3);

                _context58.next = 65;
                break;

              case 57:
                _context58.t4 = callback;
                _context58.t5 = bytesFinished;
                _context58.t6 = bytesTotal;
                _context58.next = 62;
                return ResponseToFormat(format, _response);

              case 62:
                _context58.t7 = _context58.sent;
                _context58.t8 = {
                  bytesFinished: _context58.t5,
                  bytesTotal: _context58.t6,
                  chunk: _context58.t7
                };
                (0, _context58.t4)(_context58.t8);

              case 65:
                i++;
                _context58.next = 41;
                break;

              case 68:
                if (!stream) {
                  _context58.next = 72;
                  break;
                }

                // Wait for decryption to complete
                stream.end();
                _context58.next = 72;
                return new Promise(function (resolve) {
                  return stream.on("finish", function () {
                    resolve();
                  });
                });

              case 72:
              case "end":
                return _context58.stop();
            }
          }
        }, _callee58, this);
      }));

      function DownloadPart(_x55) {
        return _DownloadPart.apply(this, arguments);
      }

      return DownloadPart;
    }()
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

  }, {
    key: "EncryptionConk",
    value: function () {
      var _EncryptionConk = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee59(_ref66) {
        var libraryId, objectId, writeToken, owner, capKey, existingCap, kmsAddress, kmsPublicKey, kmsCapKey, metadata;
        return regeneratorRuntime.wrap(function _callee59$(_context59) {
          while (1) {
            switch (_context59.prev = _context59.next) {
              case 0:
                libraryId = _ref66.libraryId, objectId = _ref66.objectId, writeToken = _ref66.writeToken;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });

                if (writeToken) {
                  ValidateWriteToken(writeToken);
                }

                _context59.next = 5;
                return this.authClient.Owner({
                  id: objectId,
                  abi: ContentContract.abi
                });

              case 5:
                owner = _context59.sent;

                if (this.utils.EqualAddress(owner, this.signer.address)) {
                  _context59.next = 12;
                  break;
                }

                if (this.reencryptionConks[objectId]) {
                  _context59.next = 11;
                  break;
                }

                _context59.next = 10;
                return this.authClient.ReEncryptionConk({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 10:
                this.reencryptionConks[objectId] = _context59.sent;

              case 11:
                return _context59.abrupt("return", this.reencryptionConks[objectId]);

              case 12:
                if (this.encryptionConks[objectId]) {
                  _context59.next = 49;
                  break;
                }

                capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
                _context59.next = 16;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  // Cap may only exist in draft
                  objectId: objectId,
                  writeToken: writeToken,
                  metadataSubtree: capKey
                });

              case 16:
                existingCap = _context59.sent;

                if (!existingCap) {
                  _context59.next = 23;
                  break;
                }

                _context59.next = 20;
                return Crypto.DecryptCap(existingCap, this.signer.signingKey.privateKey);

              case 20:
                this.encryptionConks[objectId] = _context59.sent;
                _context59.next = 49;
                break;

              case 23:
                _context59.next = 25;
                return Crypto.GeneratePrimaryConk();

              case 25:
                this.encryptionConks[objectId] = _context59.sent;

                if (!writeToken) {
                  _context59.next = 49;
                  break;
                }

                _context59.next = 29;
                return this.authClient.KMSAddress({
                  objectId: objectId
                });

              case 29:
                kmsAddress = _context59.sent;
                _context59.next = 32;
                return this.authClient.KMSInfo({
                  objectId: objectId
                });

              case 32:
                kmsPublicKey = _context59.sent.publicKey;
                kmsCapKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
                metadata = {};
                _context59.next = 37;
                return Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey);

              case 37:
                metadata[capKey] = _context59.sent;
                _context59.prev = 38;
                _context59.next = 41;
                return Crypto.EncryptConk(this.encryptionConks[objectId], kmsPublicKey);

              case 41:
                metadata[kmsCapKey] = _context59.sent;
                _context59.next = 47;
                break;

              case 44:
                _context59.prev = 44;
                _context59.t0 = _context59["catch"](38);
                // eslint-disable-next-line no-console
                console.error("Failed to create encryption cap for KMS with public key " + kmsPublicKey);

              case 47:
                _context59.next = 49;
                return this.MergeMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  metadata: metadata
                });

              case 49:
                return _context59.abrupt("return", this.encryptionConks[objectId]);

              case 50:
              case "end":
                return _context59.stop();
            }
          }
        }, _callee59, this, [[38, 44]]);
      }));

      function EncryptionConk(_x57) {
        return _EncryptionConk.apply(this, arguments);
      }

      return EncryptionConk;
    }()
    /**
     * Encrypt the specified chunk for the specified object or draft
     *
     * @methodGroup Encryption
     *
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {Promise<(ArrayBuffer | Buffer)>} chunk - The data to encrypt
     *
     * @return {Promise<ArrayBuffer>}
     */

  }, {
    key: "Encrypt",
    value: function () {
      var _Encrypt = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee60(_ref67) {
        var libraryId, objectId, writeToken, chunk, conk, data;
        return regeneratorRuntime.wrap(function _callee60$(_context60) {
          while (1) {
            switch (_context60.prev = _context60.next) {
              case 0:
                libraryId = _ref67.libraryId, objectId = _ref67.objectId, writeToken = _ref67.writeToken, chunk = _ref67.chunk;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                _context60.next = 5;
                return this.EncryptionConk({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken
                });

              case 5:
                conk = _context60.sent;
                _context60.next = 8;
                return Crypto.Encrypt(conk, chunk);

              case 8:
                data = _context60.sent;
                return _context60.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

              case 10:
              case "end":
                return _context60.stop();
            }
          }
        }, _callee60, this);
      }));

      function Encrypt(_x58) {
        return _Encrypt.apply(this, arguments);
      }

      return Encrypt;
    }()
    /**
     * Create a part upload draft
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
     *
     * @returns {Promise<string>} - The part write token for the part draft
     */

  }, {
    key: "CreatePart",
    value: function () {
      var _CreatePart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee61(_ref68) {
        var libraryId, objectId, writeToken, encryption, path, openResponse;
        return regeneratorRuntime.wrap(function _callee61$(_context61) {
          while (1) {
            switch (_context61.prev = _context61.next) {
              case 0:
                libraryId = _ref68.libraryId, objectId = _ref68.objectId, writeToken = _ref68.writeToken, encryption = _ref68.encryption;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                path = UrlJoin("q", writeToken, "parts");
                _context61.t0 = ResponseToJson;
                _context61.t1 = this.HttpClient;
                _context61.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true,
                  encryption: encryption
                });

              case 8:
                _context61.t2 = _context61.sent;
                _context61.t3 = path;
                _context61.t4 = {
                  headers: _context61.t2,
                  method: "POST",
                  path: _context61.t3,
                  bodyType: "BINARY",
                  body: "",
                  failover: false
                };
                _context61.t5 = _context61.t1.Request.call(_context61.t1, _context61.t4);
                _context61.next = 14;
                return (0, _context61.t0)(_context61.t5);

              case 14:
                openResponse = _context61.sent;
                return _context61.abrupt("return", openResponse.part.write_token);

              case 16:
              case "end":
                return _context61.stop();
            }
          }
        }, _callee61, this);
      }));

      function CreatePart(_x59) {
        return _CreatePart.apply(this, arguments);
      }

      return CreatePart;
    }()
    /**
     * Upload data to an open part draft
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {string} partWriteToken - Write token of the part
     * @param {(ArrayBuffer | Buffer)} chunk - Data to upload
     * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
     *
     * @returns {Promise<string>} - The part write token for the part draft
     */

  }, {
    key: "UploadPartChunk",
    value: function () {
      var _UploadPartChunk = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee62(_ref69) {
        var libraryId, objectId, writeToken, partWriteToken, chunk, encryption, conk, path;
        return regeneratorRuntime.wrap(function _callee62$(_context62) {
          while (1) {
            switch (_context62.prev = _context62.next) {
              case 0:
                libraryId = _ref69.libraryId, objectId = _ref69.objectId, writeToken = _ref69.writeToken, partWriteToken = _ref69.partWriteToken, chunk = _ref69.chunk, encryption = _ref69.encryption;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);

                if (!(encryption && encryption !== "none")) {
                  _context62.next = 10;
                  break;
                }

                _context62.next = 6;
                return this.EncryptionConk({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken
                });

              case 6:
                conk = _context62.sent;
                _context62.next = 9;
                return Crypto.Encrypt(conk, chunk);

              case 9:
                chunk = _context62.sent;

              case 10:
                path = UrlJoin("q", writeToken, "parts");
                _context62.t0 = ResponseToJson;
                _context62.t1 = this.HttpClient;
                _context62.next = 15;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true,
                  encryption: encryption
                });

              case 15:
                _context62.t2 = _context62.sent;
                _context62.t3 = UrlJoin(path, partWriteToken);
                _context62.t4 = chunk;
                _context62.t5 = {
                  headers: _context62.t2,
                  method: "POST",
                  path: _context62.t3,
                  body: _context62.t4,
                  bodyType: "BINARY",
                  failover: false
                };
                _context62.t6 = _context62.t1.Request.call(_context62.t1, _context62.t5);
                _context62.next = 22;
                return (0, _context62.t0)(_context62.t6);

              case 22:
              case "end":
                return _context62.stop();
            }
          }
        }, _callee62, this);
      }));

      function UploadPartChunk(_x60) {
        return _UploadPartChunk.apply(this, arguments);
      }

      return UploadPartChunk;
    }()
    /**
     * Finalize an open part draft
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {string} partWriteToken - Write token of the part
     * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
     *
     * @returns {Promise<object>} - The finalize response for the new part
     */

  }, {
    key: "FinalizePart",
    value: function () {
      var _FinalizePart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee63(_ref70) {
        var libraryId, objectId, writeToken, partWriteToken, encryption, path;
        return regeneratorRuntime.wrap(function _callee63$(_context63) {
          while (1) {
            switch (_context63.prev = _context63.next) {
              case 0:
                libraryId = _ref70.libraryId, objectId = _ref70.objectId, writeToken = _ref70.writeToken, partWriteToken = _ref70.partWriteToken, encryption = _ref70.encryption;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                path = UrlJoin("q", writeToken, "parts");
                _context63.t0 = ResponseToJson;
                _context63.t1 = this.HttpClient;
                _context63.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true,
                  encryption: encryption
                });

              case 8:
                _context63.t2 = _context63.sent;
                _context63.t3 = UrlJoin(path, partWriteToken);
                _context63.t4 = {
                  headers: _context63.t2,
                  method: "POST",
                  path: _context63.t3,
                  bodyType: "BINARY",
                  body: "",
                  failover: false
                };
                _context63.next = 13;
                return _context63.t1.Request.call(_context63.t1, _context63.t4);

              case 13:
                _context63.t5 = _context63.sent;
                _context63.next = 16;
                return (0, _context63.t0)(_context63.t5);

              case 16:
                return _context63.abrupt("return", _context63.sent);

              case 17:
              case "end":
                return _context63.stop();
            }
          }
        }, _callee63, this);
      }));

      function FinalizePart(_x61) {
        return _FinalizePart.apply(this, arguments);
      }

      return FinalizePart;
    }()
    /**
     * Upload part to an object draft
     *
     * Note: If uploading a large file (especially with an HTML file and/or when using the FrameClient) it is
     * recommended to use the CreatePart + UploadPartChunk + FinalizePart flow to upload the file in
     * smaller chunks.
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {(File | ArrayBuffer | Buffer)} data - Data to upload
     * @param {number=} chunkSize=1000000 (1MB) - Chunk size, in bytes
     * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
     *
     * @returns {Promise<Object>} - Response containing information about the uploaded part
     */

  }, {
    key: "UploadPart",
    value: function () {
      var _UploadPart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee64(_ref71) {
        var libraryId, objectId, writeToken, data, _ref71$encryption, encryption, partWriteToken;

        return regeneratorRuntime.wrap(function _callee64$(_context64) {
          while (1) {
            switch (_context64.prev = _context64.next) {
              case 0:
                libraryId = _ref71.libraryId, objectId = _ref71.objectId, writeToken = _ref71.writeToken, data = _ref71.data, _ref71$encryption = _ref71.encryption, encryption = _ref71$encryption === void 0 ? "none" : _ref71$encryption;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                _context64.next = 5;
                return this.CreatePart({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  encryption: encryption
                });

              case 5:
                partWriteToken = _context64.sent;
                _context64.next = 8;
                return this.UploadPartChunk({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  partWriteToken: partWriteToken,
                  chunk: data,
                  encryption: encryption
                });

              case 8:
                _context64.next = 10;
                return this.FinalizePart({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  partWriteToken: partWriteToken,
                  encryption: encryption
                });

              case 10:
                return _context64.abrupt("return", _context64.sent);

              case 11:
              case "end":
                return _context64.stop();
            }
          }
        }, _callee64, this);
      }));

      function UploadPart(_x62) {
        return _UploadPart.apply(this, arguments);
      }

      return UploadPart;
    }()
    /**
     * Delete the specified part from a content draft
     *
     * @see DELETE /qlibs/:qlibid/q/:write_token/parts/:qparthash
     *
     * @methodGroup Parts and Files
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {string} partHash - Hash of the part to delete
     */

  }, {
    key: "DeletePart",
    value: function () {
      var _DeletePart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee65(_ref72) {
        var libraryId, objectId, writeToken, partHash, path;
        return regeneratorRuntime.wrap(function _callee65$(_context65) {
          while (1) {
            switch (_context65.prev = _context65.next) {
              case 0:
                libraryId = _ref72.libraryId, objectId = _ref72.objectId, writeToken = _ref72.writeToken, partHash = _ref72.partHash;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateWriteToken(writeToken);
                ValidatePartHash(partHash);
                path = UrlJoin("q", writeToken, "parts", partHash);
                _context65.t0 = this.HttpClient;
                _context65.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 8:
                _context65.t1 = _context65.sent;
                _context65.t2 = path;
                _context65.t3 = {
                  headers: _context65.t1,
                  method: "DELETE",
                  path: _context65.t2,
                  failover: false
                };
                _context65.next = 13;
                return _context65.t0.Request.call(_context65.t0, _context65.t3);

              case 13:
              case "end":
                return _context65.stop();
            }
          }
        }, _callee65, this);
      }));

      function DeletePart(_x63) {
        return _DeletePart.apply(this, arguments);
      }

      return DeletePart;
    }()
    /* Media Creation and Management */

    /**
     * Create a master media content object with the given files.
     *
     * - If uploading using local files, use fileInfo parameter (see UploadFiles for format)
     * - If uploading from S3 bucket, use access, filePath and copy, parameters (see UploadFilesFromS3 method)
     *
     * @methodGroup Media
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} name - Name of the content
     * @param {string=} description - Description of the content
     * @param {string} contentTypeName - Name of the content type to use
     * @param {Object=} metadata - Additional metadata for the content object
     * @param {Object=} fileInfo - Files to upload to (See UploadFiles/UploadFilesFromS3 method)
     * @param {boolean=} copy=false - (S3) If specified, files will be copied from S3
     * @param {function=} callback - Progress callback for file upload (See UploadFiles/UploadFilesFromS3 method)
     * @param {Object=} access - (S3) Region, bucket, access key and secret for S3
     * - Format: {region, bucket, accessKey, secret}
     *
     * @throws {Object} error - If the initialization of the master fails, error details can be found in error.body
     * @return {Object} - The finalize response for the object, as well as logs, warnings and errors from the master initialization
     */

  }, {
    key: "CreateProductionMaster",
    value: function () {
      var _CreateProductionMaster = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee66(_ref73) {
        var libraryId, name, description, _ref73$metadata, metadata, fileInfo, access, _ref73$copy, copy, callback, contentType, _ref74, id, write_token, accessParameter, region, bucket, accessKey, secret, _ref75, logs, errors, warnings, finalizeResponse;

        return regeneratorRuntime.wrap(function _callee66$(_context66) {
          while (1) {
            switch (_context66.prev = _context66.next) {
              case 0:
                libraryId = _ref73.libraryId, name = _ref73.name, description = _ref73.description, _ref73$metadata = _ref73.metadata, metadata = _ref73$metadata === void 0 ? {} : _ref73$metadata, fileInfo = _ref73.fileInfo, access = _ref73.access, _ref73$copy = _ref73.copy, copy = _ref73$copy === void 0 ? false : _ref73$copy, callback = _ref73.callback;
                ValidateLibrary(libraryId);
                _context66.next = 4;
                return this.ContentType({
                  name: "Production Master"
                });

              case 4:
                contentType = _context66.sent;

                if (contentType) {
                  _context66.next = 7;
                  break;
                }

                throw "Unable to access content type 'Production Master' to create production master";

              case 7:
                _context66.next = 9;
                return this.CreateContentObject({
                  libraryId: libraryId,
                  options: {
                    type: contentType.hash
                  }
                });

              case 9:
                _ref74 = _context66.sent;
                id = _ref74.id;
                write_token = _ref74.write_token;

                if (!access) {
                  _context66.next = 19;
                  break;
                }

                // S3 Upload
                region = access.region, bucket = access.bucket, accessKey = access.accessKey, secret = access.secret;
                _context66.next = 16;
                return this.UploadFilesFromS3({
                  libraryId: libraryId,
                  objectId: id,
                  writeToken: write_token,
                  fileInfo: fileInfo,
                  region: region,
                  bucket: bucket,
                  accessKey: accessKey,
                  secret: secret,
                  copy: copy,
                  callback: callback
                });

              case 16:
                accessParameter = [{
                  path_matchers: [".*"],
                  remote_access: {
                    protocol: "s3",
                    platform: "aws",
                    path: bucket + "/",
                    storage_endpoint: {
                      region: region
                    },
                    cloud_credentials: {
                      access_key_id: accessKey,
                      secret_access_key: secret
                    }
                  }
                }];
                _context66.next = 21;
                break;

              case 19:
                _context66.next = 21;
                return this.UploadFiles({
                  libraryId: libraryId,
                  objectId: id,
                  writeToken: write_token,
                  fileInfo: fileInfo,
                  callback: callback
                });

              case 21:
                _context66.next = 23;
                return this.CallBitcodeMethod({
                  libraryId: libraryId,
                  objectId: id,
                  writeToken: write_token,
                  method: UrlJoin("media", "production_master", "init"),
                  body: {
                    access: accessParameter
                  },
                  constant: false
                });

              case 23:
                _ref75 = _context66.sent;
                logs = _ref75.logs;
                errors = _ref75.errors;
                warnings = _ref75.warnings;
                _context66.next = 29;
                return this.MergeMetadata({
                  libraryId: libraryId,
                  objectId: id,
                  writeToken: write_token,
                  metadata: _objectSpread({
                    name: name,
                    description: description,
                    reference: access && !copy,
                    "public": {
                      name: name || "",
                      description: description || ""
                    },
                    elv_created_at: new Date().getTime()
                  }, metadata || {})
                });

              case 29:
                _context66.next = 31;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: id,
                  writeToken: write_token,
                  awaitCommitConfirmation: false
                });

              case 31:
                finalizeResponse = _context66.sent;
                return _context66.abrupt("return", _objectSpread({
                  errors: errors || [],
                  logs: logs || [],
                  warnings: warnings || []
                }, finalizeResponse));

              case 33:
              case "end":
                return _context66.stop();
            }
          }
        }, _callee66, this);
      }));

      function CreateProductionMaster(_x64) {
        return _CreateProductionMaster.apply(this, arguments);
      }

      return CreateProductionMaster;
    }()
    /**
     * Create a mezzanine of the given master content object
     *
     * @methodGroup Media
     * @namedParams
     * @param {string} libraryId - ID of the mezzanine library
     * @param {string} name - Name for mezzanine content object
     * @param {string=} description - Description for mezzanine content object
     * @param {Object=} metadata - Additional metadata for mezzanine content object
     * @param {string} masterVersionHash - The version hash of the production master content object
     * @param {string=} variant - What variant of the master content object to use
     *
     * @return {Object} - The finalize response for the object, as well as logs, warnings and errors from the mezzanine initialization
     */

  }, {
    key: "CreateABRMezzanine",
    value: function () {
      var _CreateABRMezzanine = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee67(_ref76) {
        var libraryId, name, description, _ref76$metadata, metadata, masterVersionHash, abrProfile, _ref76$variant, variant, abrMezType, _ref77, id, write_token, masterName, authorizationTokens, headers, body, _ref78, logs, errors, warnings, finalizeResponse;

        return regeneratorRuntime.wrap(function _callee67$(_context67) {
          while (1) {
            switch (_context67.prev = _context67.next) {
              case 0:
                libraryId = _ref76.libraryId, name = _ref76.name, description = _ref76.description, _ref76$metadata = _ref76.metadata, metadata = _ref76$metadata === void 0 ? {} : _ref76$metadata, masterVersionHash = _ref76.masterVersionHash, abrProfile = _ref76.abrProfile, _ref76$variant = _ref76.variant, variant = _ref76$variant === void 0 ? "default" : _ref76$variant;
                ValidateLibrary(libraryId);
                ValidateVersion(masterVersionHash);
                _context67.next = 5;
                return this.ContentType({
                  name: "ABR Master"
                });

              case 5:
                abrMezType = _context67.sent;

                if (abrMezType) {
                  _context67.next = 8;
                  break;
                }

                throw Error("Unable to access ABR Master content type in library with ID=" + libraryId);

              case 8:
                if (masterVersionHash) {
                  _context67.next = 10;
                  break;
                }

                throw Error("Master version hash not specified");

              case 10:
                _context67.next = 12;
                return this.CreateContentObject({
                  libraryId: libraryId,
                  options: {
                    type: abrMezType.hash
                  }
                });

              case 12:
                _ref77 = _context67.sent;
                id = _ref77.id;
                write_token = _ref77.write_token;
                _context67.next = 17;
                return this.ContentObjectMetadata({
                  versionHash: masterVersionHash,
                  metadataSubtree: "public/name"
                });

              case 17:
                masterName = _context67.sent;
                // Include authorization for library, master, and mezzanine
                authorizationTokens = [];
                _context67.t0 = authorizationTokens;
                _context67.next = 22;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: id,
                  update: true
                });

              case 22:
                _context67.t1 = _context67.sent;

                _context67.t0.push.call(_context67.t0, _context67.t1);

                _context67.t2 = authorizationTokens;
                _context67.next = 27;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId
                });

              case 27:
                _context67.t3 = _context67.sent;

                _context67.t2.push.call(_context67.t2, _context67.t3);

                _context67.t4 = authorizationTokens;
                _context67.next = 32;
                return this.authClient.AuthorizationToken({
                  versionHash: masterVersionHash
                });

              case 32:
                _context67.t5 = _context67.sent;

                _context67.t4.push.call(_context67.t4, _context67.t5);

                headers = {
                  Authorization: authorizationTokens.map(function (token) {
                    return "Bearer ".concat(token);
                  }).join(",")
                };
                body = {
                  offering_key: variant,
                  variant_key: variant,
                  prod_master_hash: masterVersionHash
                };

                if (abrProfile) {
                  body.abr_profile = abrProfile;
                }

                _context67.next = 39;
                return this.CallBitcodeMethod({
                  libraryId: libraryId,
                  objectId: id,
                  writeToken: write_token,
                  method: UrlJoin("media", "abr_mezzanine", "init"),
                  headers: headers,
                  body: body,
                  constant: false
                });

              case 39:
                _ref78 = _context67.sent;
                logs = _ref78.logs;
                errors = _ref78.errors;
                warnings = _ref78.warnings;
                _context67.next = 45;
                return this.MergeMetadata({
                  libraryId: libraryId,
                  objectId: id,
                  writeToken: write_token,
                  metadata: _objectSpread({
                    master: {
                      name: masterName,
                      id: this.utils.DecodeVersionHash(masterVersionHash).objectId,
                      hash: masterVersionHash,
                      variant: variant
                    },
                    name: name || "".concat(masterName, " Mezzanine"),
                    description: description,
                    "public": {
                      name: name || "".concat(masterName, " Mezzanine"),
                      description: description || ""
                    },
                    elv_created_at: new Date().getTime()
                  }, metadata || {})
                });

              case 45:
                _context67.next = 47;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: id,
                  writeToken: write_token
                });

              case 47:
                finalizeResponse = _context67.sent;
                return _context67.abrupt("return", _objectSpread({
                  logs: logs || [],
                  warnings: warnings || [],
                  errors: errors || []
                }, finalizeResponse));

              case 49:
              case "end":
                return _context67.stop();
            }
          }
        }, _callee67, this);
      }));

      function CreateABRMezzanine(_x65) {
        return _CreateABRMezzanine.apply(this, arguments);
      }

      return CreateABRMezzanine;
    }()
    /**
     * Start any incomplete jobs on the specified mezzanine
     *
     * @methodGroup Media
     * @namedParams
     * @param {string} libraryId - ID of the mezzanine library
     * @param {string} objectId - ID of the mezzanine object
     * @param {string=} offeringKey=default - The offering to process
     * @param {Object=} access - (S3) Region, bucket, access key and secret for S3 - Required if any files in the masters are S3 references
     * - Format: {region, bucket, accessKey, secret}
     *
     * @return {Promise<Object>} - A write token for the mezzanine object, as well as any logs, warnings and errors from the job initialization
     */

  }, {
    key: "StartABRMezzanineJobs",
    value: function () {
      var _StartABRMezzanineJobs = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee69(_ref79) {
        var _this6 = this;

        var libraryId, objectId, _ref79$offeringKey, offeringKey, _ref79$access, access, mezzanineMetadata, prepSpecs, masterVersionHashes, authorizationTokens, headers, accessParameter, region, bucket, accessKey, secret, processingDraft, lroInfo, statusDraft, _ref81, data, errors, warnings, logs;

        return regeneratorRuntime.wrap(function _callee69$(_context69) {
          while (1) {
            switch (_context69.prev = _context69.next) {
              case 0:
                libraryId = _ref79.libraryId, objectId = _ref79.objectId, _ref79$offeringKey = _ref79.offeringKey, offeringKey = _ref79$offeringKey === void 0 ? "default" : _ref79$offeringKey, _ref79$access = _ref79.access, access = _ref79$access === void 0 ? {} : _ref79$access;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                _context69.next = 4;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
                });

              case 4:
                mezzanineMetadata = _context69.sent;
                prepSpecs = mezzanineMetadata[offeringKey].mez_prep_specs || []; // Retrieve all masters associated with this offering

                masterVersionHashes = Object.keys(prepSpecs).map(function (spec) {
                  return (prepSpecs[spec].source_streams || []).map(function (stream) {
                    return stream.source_hash;
                  });
                }).flat().filter(function (hash) {
                  return hash;
                }).filter(function (v, i, a) {
                  return a.indexOf(v) === i;
                }); // Retrieve authorization tokens for all masters and the mezzanine

                _context69.next = 9;
                return Promise.all(masterVersionHashes.map(
                /*#__PURE__*/
                function () {
                  var _ref80 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee68(versionHash) {
                    return regeneratorRuntime.wrap(function _callee68$(_context68) {
                      while (1) {
                        switch (_context68.prev = _context68.next) {
                          case 0:
                            _context68.next = 2;
                            return _this6.authClient.AuthorizationToken({
                              versionHash: versionHash
                            });

                          case 2:
                            return _context68.abrupt("return", _context68.sent);

                          case 3:
                          case "end":
                            return _context68.stop();
                        }
                      }
                    }, _callee68);
                  }));

                  return function (_x67) {
                    return _ref80.apply(this, arguments);
                  };
                }()));

              case 9:
                authorizationTokens = _context69.sent;
                _context69.next = 12;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 12:
                _context69.t0 = _context69.sent;
                _context69.t1 = _toConsumableArray(authorizationTokens);
                authorizationTokens = [_context69.t0].concat(_context69.t1);
                headers = {
                  Authorization: authorizationTokens.map(function (token) {
                    return "Bearer ".concat(token);
                  }).join(",")
                };

                if (access && Object.keys(access).length > 0) {
                  region = access.region, bucket = access.bucket, accessKey = access.accessKey, secret = access.secret;
                  accessParameter = [{
                    path_matchers: [".*"],
                    remote_access: {
                      protocol: "s3",
                      platform: "aws",
                      path: bucket + "/",
                      storage_endpoint: {
                        region: region
                      },
                      cloud_credentials: {
                        access_key_id: accessKey,
                        secret_access_key: secret
                      }
                    }
                  }];
                }

                _context69.next = 19;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 19:
                processingDraft = _context69.sent;
                lroInfo = {
                  write_token: processingDraft.write_token,
                  node: this.HttpClient.BaseURI().toString()
                }; // Update metadata with LRO version write token

                _context69.next = 23;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 23:
                statusDraft = _context69.sent;
                _context69.next = 26;
                return this.ReplaceMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: statusDraft.write_token,
                  metadataSubtree: "lro_draft",
                  metadata: lroInfo
                });

              case 26:
                _context69.next = 28;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: statusDraft.write_token
                });

              case 28:
                _context69.next = 30;
                return this.CallBitcodeMethod({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: processingDraft.write_token,
                  headers: headers,
                  method: UrlJoin("media", "abr_mezzanine", "prep_start"),
                  constant: false,
                  body: {
                    access: accessParameter,
                    offering_key: offeringKey
                  }
                });

              case 30:
                _ref81 = _context69.sent;
                data = _ref81.data;
                errors = _ref81.errors;
                warnings = _ref81.warnings;
                logs = _ref81.logs;
                return _context69.abrupt("return", {
                  lro_draft: lroInfo,
                  writeToken: processingDraft.write_token,
                  data: data,
                  logs: logs || [],
                  warnings: warnings || [],
                  errors: errors || []
                });

              case 36:
              case "end":
                return _context69.stop();
            }
          }
        }, _callee69, this);
      }));

      function StartABRMezzanineJobs(_x66) {
        return _StartABRMezzanineJobs.apply(this, arguments);
      }

      return StartABRMezzanineJobs;
    }()
    /**
     * Retrieve status information for a long running operation (LRO) on the given object.
     *
     * @methodGroup Media
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     *
     * @return {Promise<Object>} - LRO status
     */

  }, {
    key: "LROStatus",
    value: function () {
      var _LROStatus = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee70(_ref82) {
        var libraryId, objectId, lroDraft, httpClient, error, result;
        return regeneratorRuntime.wrap(function _callee70$(_context70) {
          while (1) {
            switch (_context70.prev = _context70.next) {
              case 0:
                libraryId = _ref82.libraryId, objectId = _ref82.objectId;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                _context70.next = 4;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadataSubtree: "lro_draft"
                });

              case 4:
                lroDraft = _context70.sent;

                if (!(!lroDraft || !lroDraft.write_token)) {
                  _context70.next = 7;
                  break;
                }

                throw Error("No LRO draft found for this mezzanine");

              case 7:
                httpClient = this.HttpClient;
                _context70.prev = 8;
                // Point directly to the node containing the draft
                this.HttpClient = new HttpClient({
                  uris: [lroDraft.node],
                  debug: httpClient.debug
                });
                _context70.next = 12;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: lroDraft.write_token,
                  metadataSubtree: "lro_status"
                });

              case 12:
                result = _context70.sent;
                _context70.next = 18;
                break;

              case 15:
                _context70.prev = 15;
                _context70.t0 = _context70["catch"](8);
                error = _context70.t0;

              case 18:
                _context70.prev = 18;
                this.HttpClient = httpClient;
                return _context70.finish(18);

              case 21:
                if (!error) {
                  _context70.next = 23;
                  break;
                }

                throw error;

              case 23:
                return _context70.abrupt("return", result);

              case 24:
              case "end":
                return _context70.stop();
            }
          }
        }, _callee70, this, [[8, 15, 18, 21]]);
      }));

      function LROStatus(_x68) {
        return _LROStatus.apply(this, arguments);
      }

      return LROStatus;
    }()
    /**
     * Finalize a mezzanine object after all jobs have finished
     *
     * @methodGroup Media
     * @namedParams
     * @param {string} libraryId - ID of the mezzanine library
     * @param {string} objectId - ID of the mezzanine object
     * @param {string} writeToken - Write token for the mezzanine object
     * @param {string=} offeringKey=default - The offering to process
     *
     * @return {Promise<Object>} - The finalize response for the mezzanine object, as well as any logs, warnings and errors from the finalization
     */

  }, {
    key: "FinalizeABRMezzanine",
    value: function () {
      var _FinalizeABRMezzanine = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee71(_ref83) {
        var libraryId, objectId, _ref83$offeringKey, offeringKey, lroDraft, httpClient, error, result, mezzanineMetadata, masterHash, authorizationTokens, headers, _ref84, data, errors, warnings, logs, finalizeResponse;

        return regeneratorRuntime.wrap(function _callee71$(_context71) {
          while (1) {
            switch (_context71.prev = _context71.next) {
              case 0:
                libraryId = _ref83.libraryId, objectId = _ref83.objectId, _ref83$offeringKey = _ref83.offeringKey, offeringKey = _ref83$offeringKey === void 0 ? "default" : _ref83$offeringKey;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                _context71.next = 4;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadataSubtree: "lro_draft"
                });

              case 4:
                lroDraft = _context71.sent;

                if (!(!lroDraft || !lroDraft.write_token)) {
                  _context71.next = 7;
                  break;
                }

                throw Error("No LRO draft found for this mezzanine");

              case 7:
                httpClient = this.HttpClient;
                _context71.prev = 8;
                // Point directly to the node containing the draft
                this.HttpClient = new HttpClient({
                  uris: [lroDraft.node],
                  debug: httpClient.debug
                });
                _context71.next = 12;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: lroDraft.write_token,
                  metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
                });

              case 12:
                mezzanineMetadata = _context71.sent;
                masterHash = mezzanineMetadata["default"].prod_master_hash; // Authorization token for mezzanine and master

                _context71.next = 16;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 16:
                _context71.t0 = _context71.sent;
                _context71.next = 19;
                return this.authClient.AuthorizationToken({
                  versionHash: masterHash
                });

              case 19:
                _context71.t1 = _context71.sent;
                authorizationTokens = [_context71.t0, _context71.t1];
                headers = {
                  Authorization: authorizationTokens.map(function (token) {
                    return "Bearer ".concat(token);
                  }).join(",")
                };
                _context71.next = 24;
                return this.CallBitcodeMethod({
                  objectId: objectId,
                  libraryId: libraryId,
                  writeToken: lroDraft.write_token,
                  method: UrlJoin("media", "abr_mezzanine", "offerings", offeringKey, "finalize"),
                  headers: headers,
                  constant: false
                });

              case 24:
                _ref84 = _context71.sent;
                data = _ref84.data;
                errors = _ref84.errors;
                warnings = _ref84.warnings;
                logs = _ref84.logs;
                _context71.next = 31;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: lroDraft.write_token,
                  awaitCommitConfirmation: false
                });

              case 31:
                finalizeResponse = _context71.sent;
                result = _objectSpread({
                  data: data,
                  logs: logs || [],
                  warnings: warnings || [],
                  errors: errors || []
                }, finalizeResponse);
                _context71.next = 38;
                break;

              case 35:
                _context71.prev = 35;
                _context71.t2 = _context71["catch"](8);
                error = _context71.t2;

              case 38:
                _context71.prev = 38;
                // Ensure original http client is restored
                this.HttpClient = httpClient;
                return _context71.finish(38);

              case 41:
                if (!error) {
                  _context71.next = 43;
                  break;
                }

                throw error;

              case 43:
                return _context71.abrupt("return", result);

              case 44:
              case "end":
                return _context71.stop();
            }
          }
        }, _callee71, this, [[8, 35, 38, 41]]);
      }));

      function FinalizeABRMezzanine(_x69) {
        return _FinalizeABRMezzanine.apply(this, arguments);
      }

      return FinalizeABRMezzanine;
    }()
    /* Content Object Access */

    /**
     * Set the access charge for the specified object
     *
     * @methodGroup Access Requests
     * @namedParams
     * @param {string} objectId - ID of the object
     * @param {number | string} accessCharge - The new access charge, in ether
     */

  }, {
    key: "SetAccessCharge",
    value: function () {
      var _SetAccessCharge = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee72(_ref85) {
        var objectId, accessCharge;
        return regeneratorRuntime.wrap(function _callee72$(_context72) {
          while (1) {
            switch (_context72.prev = _context72.next) {
              case 0:
                objectId = _ref85.objectId, accessCharge = _ref85.accessCharge;
                ValidateObject(objectId);
                this.Log("Setting access charge: ".concat(objectId, " ").concat(accessCharge));
                _context72.next = 5;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "setAccessCharge",
                  methodArgs: [Utils.EtherToWei(accessCharge).toString()],
                  signer: this.signer
                });

              case 5:
              case "end":
                return _context72.stop();
            }
          }
        }, _callee72, this);
      }));

      function SetAccessCharge(_x70) {
        return _SetAccessCharge.apply(this, arguments);
      }

      return SetAccessCharge;
    }()
    /**
     * Return the type of contract backing the specified ID
     *
     * @methodGroup Access Requests
     * @namedParams
     * @param {string} id - ID of the item
     *
     * @return {Promise<string>} - Contract type of the item - "space", "library", "type", "object", "wallet", "group", or "other"
     */

  }, {
    key: "AccessType",
    value: function () {
      var _AccessType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee73(_ref86) {
        var id;
        return regeneratorRuntime.wrap(function _callee73$(_context73) {
          while (1) {
            switch (_context73.prev = _context73.next) {
              case 0:
                id = _ref86.id;
                _context73.next = 3;
                return this.authClient.AccessType(id);

              case 3:
                return _context73.abrupt("return", _context73.sent);

              case 4:
              case "end":
                return _context73.stop();
            }
          }
        }, _callee73, this);
      }));

      function AccessType(_x71) {
        return _AccessType.apply(this, arguments);
      }

      return AccessType;
    }()
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

  }, {
    key: "AccessInfo",
    value: function () {
      var _AccessInfo = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee74(_ref87) {
        var objectId, args, info;
        return regeneratorRuntime.wrap(function _callee74$(_context74) {
          while (1) {
            switch (_context74.prev = _context74.next) {
              case 0:
                objectId = _ref87.objectId, args = _ref87.args;
                ValidateObject(objectId);

                if (!args) {
                  args = [0, // Access level
                  [], // Custom values
                  [] // Stakeholders
                  ];
                }

                this.Log("Retrieving access info: ".concat(objectId));
                _context74.next = 6;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "getAccessInfo",
                  methodArgs: args,
                  signer: this.signer
                });

              case 6:
                info = _context74.sent;
                this.Log(info);
                return _context74.abrupt("return", {
                  visibilityCode: info[0],
                  visible: info[0] >= 1,
                  accessible: info[0] >= 10,
                  editable: info[0] >= 100,
                  hasAccess: info[1] === 0,
                  accessCode: info[1],
                  accessCharge: Utils.WeiToEther(info[2]).toString()
                });

              case 9:
              case "end":
                return _context74.stop();
            }
          }
        }, _callee74, this);
      }));

      function AccessInfo(_x72) {
        return _AccessInfo.apply(this, arguments);
      }

      return AccessInfo;
    }()
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

  }, {
    key: "AccessRequest",
    value: function () {
      var _AccessRequest = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee75(_ref88) {
        var libraryId, objectId, versionHash, _ref88$args, args, _ref88$update, update, _ref88$noCache, noCache;

        return regeneratorRuntime.wrap(function _callee75$(_context75) {
          while (1) {
            switch (_context75.prev = _context75.next) {
              case 0:
                libraryId = _ref88.libraryId, objectId = _ref88.objectId, versionHash = _ref88.versionHash, _ref88$args = _ref88.args, args = _ref88$args === void 0 ? [] : _ref88$args, _ref88$update = _ref88.update, update = _ref88$update === void 0 ? false : _ref88$update, _ref88$noCache = _ref88.noCache, noCache = _ref88$noCache === void 0 ? false : _ref88$noCache;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context75.next = 5;
                return this.authClient.MakeAccessRequest({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  args: args,
                  update: update,
                  skipCache: true,
                  noCache: noCache
                });

              case 5:
                return _context75.abrupt("return", _context75.sent);

              case 6:
              case "end":
                return _context75.stop();
            }
          }
        }, _callee75, this);
      }));

      function AccessRequest(_x73) {
        return _AccessRequest.apply(this, arguments);
      }

      return AccessRequest;
    }()
    /**
     * Return the cached access transaction of the specified item, if present
     *
     * @methodGroup Access Requests
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Version hash of the object
     *
     * @return {Promise<string>} - The cached transaction hash if present, otherwise undefined
     */

  }, {
    key: "CachedAccessTransaction",
    value: function () {
      var _CachedAccessTransaction = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee76(_ref89) {
        var libraryId, objectId, versionHash, cacheResult;
        return regeneratorRuntime.wrap(function _callee76$(_context76) {
          while (1) {
            switch (_context76.prev = _context76.next) {
              case 0:
                libraryId = _ref89.libraryId, objectId = _ref89.objectId, versionHash = _ref89.versionHash;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context76.next = 5;
                return this.authClient.MakeAccessRequest({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  cacheOnly: true
                });

              case 5:
                cacheResult = _context76.sent;

                if (!cacheResult) {
                  _context76.next = 8;
                  break;
                }

                return _context76.abrupt("return", cacheResult.transactionHash);

              case 8:
              case "end":
                return _context76.stop();
            }
          }
        }, _callee76, this);
      }));

      function CachedAccessTransaction(_x74) {
        return _CachedAccessTransaction.apply(this, arguments);
      }

      return CachedAccessTransaction;
    }()
    /**
     * Generate a state channel token
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

  }, {
    key: "GenerateStateChannelToken",
    value: function () {
      var _GenerateStateChannelToken = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee77(_ref90) {
        var objectId, versionHash, _ref90$noCache, noCache, libraryId, audienceData;

        return regeneratorRuntime.wrap(function _callee77$(_context77) {
          while (1) {
            switch (_context77.prev = _context77.next) {
              case 0:
                objectId = _ref90.objectId, versionHash = _ref90.versionHash, _ref90$noCache = _ref90.noCache, noCache = _ref90$noCache === void 0 ? false : _ref90$noCache;
                versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

                if (!versionHash) {
                  _context77.next = 6;
                  break;
                }

                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                _context77.next = 13;
                break;

              case 6:
                if (this.stateChannelAccess[objectId]) {
                  _context77.next = 13;
                  break;
                }

                _context77.next = 9;
                return this.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 9:
                libraryId = _context77.sent;
                _context77.next = 12;
                return this.ContentObjectVersions({
                  libraryId: libraryId,
                  objectId: objectId,
                  noAuth: true
                });

              case 12:
                versionHash = _context77.sent.versions[0].hash;

              case 13:
                this.stateChannelAccess[objectId] = versionHash;
                audienceData = this.AudienceData({
                  objectId: objectId,
                  versionHash: versionHash
                });
                _context77.next = 17;
                return this.authClient.AuthorizationToken({
                  objectId: objectId,
                  channelAuth: true,
                  audienceData: audienceData,
                  noCache: noCache
                });

              case 17:
                return _context77.abrupt("return", _context77.sent);

              case 18:
              case "end":
                return _context77.stop();
            }
          }
        }, _callee77, this);
      }));

      function GenerateStateChannelToken(_x75) {
        return _GenerateStateChannelToken.apply(this, arguments);
      }

      return GenerateStateChannelToken;
    }()
    /**
     * Finalize state channel access
     *
     * @methodGroup Access Requests
     * @namedParams
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Version hash of the object
     * @param {number} percentComplete - Completion percentage of the content
     */

  }, {
    key: "FinalizeStateChannelAccess",
    value: function () {
      var _FinalizeStateChannelAccess = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee78(_ref91) {
        var objectId, versionHash, percentComplete, libraryId, audienceData;
        return regeneratorRuntime.wrap(function _callee78$(_context78) {
          while (1) {
            switch (_context78.prev = _context78.next) {
              case 0:
                objectId = _ref91.objectId, versionHash = _ref91.versionHash, percentComplete = _ref91.percentComplete;
                versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

                if (!versionHash) {
                  _context78.next = 6;
                  break;
                }

                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                _context78.next = 16;
                break;

              case 6:
                if (!this.stateChannelAccess[objectId]) {
                  _context78.next = 10;
                  break;
                }

                versionHash = this.stateChannelAccess[objectId];
                _context78.next = 16;
                break;

              case 10:
                _context78.next = 12;
                return this.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 12:
                libraryId = _context78.sent;
                _context78.next = 15;
                return this.ContentObjectVersions({
                  libraryId: libraryId,
                  objectId: objectId,
                  noAuth: true
                });

              case 15:
                versionHash = _context78.sent.versions[0].hash;

              case 16:
                this.stateChannelAccess[objectId] = undefined;
                audienceData = this.AudienceData({
                  objectId: objectId,
                  versionHash: versionHash
                });
                _context78.next = 20;
                return this.authClient.ChannelContentFinalize({
                  objectId: objectId,
                  audienceData: audienceData,
                  percent: percentComplete
                });

              case 20:
              case "end":
                return _context78.stop();
            }
          }
        }, _callee78, this);
      }));

      function FinalizeStateChannelAccess(_x76) {
        return _FinalizeStateChannelAccess.apply(this, arguments);
      }

      return FinalizeStateChannelAccess;
    }()
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

  }, {
    key: "ContentObjectAccessComplete",
    value: function () {
      var _ContentObjectAccessComplete = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee79(_ref92) {
        var objectId, _ref92$score, score;

        return regeneratorRuntime.wrap(function _callee79$(_context79) {
          while (1) {
            switch (_context79.prev = _context79.next) {
              case 0:
                objectId = _ref92.objectId, _ref92$score = _ref92.score, score = _ref92$score === void 0 ? 100 : _ref92$score;
                ValidateObject(objectId);

                if (!(score < 0 || score > 100)) {
                  _context79.next = 4;
                  break;
                }

                throw Error("Invalid AccessComplete score: " + score);

              case 4:
                _context79.next = 6;
                return this.authClient.AccessComplete({
                  id: objectId,
                  abi: ContentContract.abi,
                  score: score
                });

              case 6:
                return _context79.abrupt("return", _context79.sent);

              case 7:
              case "end":
                return _context79.stop();
            }
          }
        }, _callee79, this);
      }));

      function ContentObjectAccessComplete(_x77) {
        return _ContentObjectAccessComplete.apply(this, arguments);
      }

      return ContentObjectAccessComplete;
    }()
    /* URL Methods */

    /**
     * Determine available DRM types available in this browser environment.
     *
     * @methodGroup Media
     * @return {Promise<Array<string>>}
     */

  }, {
    key: "AvailableDRMs",
    value: function () {
      var _AvailableDRMs = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee80() {
        var availableDRMs, config;
        return regeneratorRuntime.wrap(function _callee80$(_context80) {
          while (1) {
            switch (_context80.prev = _context80.next) {
              case 0:
                availableDRMs = ["aes-128"];

                if (window) {
                  _context80.next = 3;
                  break;
                }

                return _context80.abrupt("return", availableDRMs);

              case 3:
                if (!(typeof window.navigator.requestMediaKeySystemAccess !== "function")) {
                  _context80.next = 5;
                  break;
                }

                return _context80.abrupt("return", availableDRMs);

              case 5:
                _context80.prev = 5;
                config = [{
                  initDataTypes: ["cenc"],
                  audioCapabilities: [{
                    contentType: "audio/mp4;codecs=\"mp4a.40.2\""
                  }],
                  videoCapabilities: [{
                    contentType: "video/mp4;codecs=\"avc1.42E01E\""
                  }]
                }];
                _context80.next = 9;
                return navigator.requestMediaKeySystemAccess("com.widevine.alpha", config);

              case 9:
                availableDRMs.push("widevine"); // eslint-disable-next-line no-empty

                _context80.next = 14;
                break;

              case 12:
                _context80.prev = 12;
                _context80.t0 = _context80["catch"](5);

              case 14:
                return _context80.abrupt("return", availableDRMs);

              case 15:
              case "end":
                return _context80.stop();
            }
          }
        }, _callee80, null, [[5, 12]]);
      }));

      function AvailableDRMs() {
        return _AvailableDRMs.apply(this, arguments);
      }

      return AvailableDRMs;
    }()
  }, {
    key: "AudienceData",
    value: function AudienceData(_ref93) {
      var objectId = _ref93.objectId,
          versionHash = _ref93.versionHash,
          _ref93$protocols = _ref93.protocols,
          protocols = _ref93$protocols === void 0 ? [] : _ref93$protocols,
          _ref93$drms = _ref93.drms,
          drms = _ref93$drms === void 0 ? [] : _ref93$drms;
      versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
      this.Log("Retrieving audience data: ".concat(objectId));
      var data = {
        user_address: this.utils.FormatAddress(this.signer.address),
        content_id: objectId || this.utils.DecodeVersionHash(versionHash).id,
        content_hash: versionHash,
        hostname: this.HttpClient.BaseURI().hostname(),
        access_time: Math.round(new Date().getTime()).toString(),
        format: protocols.join(","),
        drm: drms.join(",")
      };

      if (typeof window !== "undefined" && window.navigator) {
        data.user_string = window.navigator.userAgent;
        data.language = window.navigator.language;
      }

      this.Log(data);
      return data;
    }
    /**
     * Retrieve playout options for the specified content that satisfy the given protocol and DRM requirements
     *
     * If only objectId is specified, latest version will be played. To retrieve playout options for
     * a specific version of the content, provide the versionHash parameter (in which case objectId is unnecessary)
     *
     * @methodGroup Media
     * @namedParams
     * @param {string=} objectId - Id of the content
     * @param {string=} versionHash - Version hash of the content
     * @param {Array<string>} protocols - Acceptable playout protocols
     * @param {Array<string>} drms - Acceptable DRM formats
     */

  }, {
    key: "PlayoutOptions",
    value: function () {
      var _PlayoutOptions = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee81(_ref94) {
        var objectId, versionHash, _ref94$protocols, protocols, _ref94$drms, drms, _ref94$hlsjsProfile, hlsjsProfile, libraryId, path, audienceData, playoutOptions, playoutMap, i, option, protocol, drm, licenseServers, protocolMatch, drmMatch;

        return regeneratorRuntime.wrap(function _callee81$(_context81) {
          while (1) {
            switch (_context81.prev = _context81.next) {
              case 0:
                objectId = _ref94.objectId, versionHash = _ref94.versionHash, _ref94$protocols = _ref94.protocols, protocols = _ref94$protocols === void 0 ? ["dash", "hls"] : _ref94$protocols, _ref94$drms = _ref94.drms, drms = _ref94$drms === void 0 ? [] : _ref94$drms, _ref94$hlsjsProfile = _ref94.hlsjsProfile, hlsjsProfile = _ref94$hlsjsProfile === void 0 ? true : _ref94$hlsjsProfile;
                versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
                protocols = protocols.map(function (p) {
                  return p.toLowerCase();
                });
                drms = drms.map(function (d) {
                  return d.toLowerCase();
                });

                if (!objectId) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context81.next = 7;
                return this.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 7:
                libraryId = _context81.sent;

                if (versionHash) {
                  _context81.next = 12;
                  break;
                }

                _context81.next = 11;
                return this.ContentObjectVersions({
                  libraryId: libraryId,
                  objectId: objectId,
                  noAuth: true
                });

              case 11:
                versionHash = _context81.sent.versions[0].hash;

              case 12:
                path = UrlJoin("q", versionHash, "rep", "playout", "default", "options.json");
                audienceData = this.AudienceData({
                  objectId: objectId,
                  versionHash: versionHash,
                  protocols: protocols,
                  drms: drms
                });
                _context81.t0 = Object;
                _context81.t1 = ResponseToJson;
                _context81.t2 = this.HttpClient;
                _context81.next = 19;
                return this.authClient.AuthorizationHeader({
                  objectId: objectId,
                  channelAuth: true,
                  audienceData: audienceData
                });

              case 19:
                _context81.t3 = _context81.sent;
                _context81.t4 = path;
                _context81.t5 = {
                  headers: _context81.t3,
                  method: "GET",
                  path: _context81.t4
                };
                _context81.t6 = _context81.t2.Request.call(_context81.t2, _context81.t5);
                _context81.next = 25;
                return (0, _context81.t1)(_context81.t6);

              case 25:
                _context81.t7 = _context81.sent;
                playoutOptions = _context81.t0.values.call(_context81.t0, _context81.t7);
                playoutMap = {};
                i = 0;

              case 29:
                if (!(i < playoutOptions.length)) {
                  _context81.next = 47;
                  break;
                }

                option = playoutOptions[i];
                protocol = option.properties.protocol;
                drm = option.properties.drm;
                licenseServers = option.properties.license_servers; // Exclude any options that do not satisfy the specified protocols and/or DRMs

                protocolMatch = protocols.includes(protocol);
                drmMatch = drms.includes(drm) || drms.length === 0 && !drm;

                if (!(!protocolMatch || !drmMatch)) {
                  _context81.next = 38;
                  break;
                }

                return _context81.abrupt("continue", 44);

              case 38:
                if (playoutMap[protocol]) {
                  _context81.next = 43;
                  break;
                }

                _context81.next = 41;
                return this.Rep({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  rep: UrlJoin("playout", "default", option.uri),
                  channelAuth: true,
                  queryParams: hlsjsProfile && protocol === "hls" ? {
                    player_profile: "hls-js"
                  } : {}
                });

              case 41:
                _context81.t8 = _context81.sent;
                playoutMap[protocol] = {
                  playoutUrl: _context81.t8
                };

              case 43:
                if (drm) {
                  playoutMap[protocol].drms = _objectSpread({}, playoutMap[protocol].drms || {}, _defineProperty({}, drm, {
                    licenseServers: licenseServers
                  }));
                }

              case 44:
                i++;
                _context81.next = 29;
                break;

              case 47:
                this.Log(playoutMap);
                return _context81.abrupt("return", playoutMap);

              case 49:
              case "end":
                return _context81.stop();
            }
          }
        }, _callee81, this);
      }));

      function PlayoutOptions(_x78) {
        return _PlayoutOptions.apply(this, arguments);
      }

      return PlayoutOptions;
    }()
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
     * @param {Array<string>=} protocols=["dash", "hls"] - Acceptable playout protocols
     * @param {Array<string>=} drms=[] - Acceptable DRM formats
     */

  }, {
    key: "BitmovinPlayoutOptions",
    value: function () {
      var _BitmovinPlayoutOptions = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee82(_ref95) {
        var _this7 = this;

        var objectId, versionHash, _ref95$protocols, protocols, _ref95$drms, drms, playoutOptions, config;

        return regeneratorRuntime.wrap(function _callee82$(_context82) {
          while (1) {
            switch (_context82.prev = _context82.next) {
              case 0:
                objectId = _ref95.objectId, versionHash = _ref95.versionHash, _ref95$protocols = _ref95.protocols, protocols = _ref95$protocols === void 0 ? ["dash", "hls"] : _ref95$protocols, _ref95$drms = _ref95.drms, drms = _ref95$drms === void 0 ? [] : _ref95$drms;
                versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

                if (!objectId) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context82.next = 5;
                return this.PlayoutOptions({
                  objectId: objectId,
                  versionHash: versionHash,
                  protocols: protocols,
                  drms: drms,
                  hlsjsProfile: false
                });

              case 5:
                playoutOptions = _context82.sent;
                config = {
                  drm: {}
                };
                Object.keys(playoutOptions).forEach(function (protocol) {
                  var option = playoutOptions[protocol];
                  config[protocol] = option.playoutUrl;

                  if (option.drms) {
                    Object.keys(option.drms).forEach(function (drm) {
                      // No license URL specified
                      if (!option.drms[drm].licenseServers || option.drms[drm].licenseServers.length === 0) {
                        return;
                      } // Opt for https urls


                      var filterHTTPS = function filterHTTPS(uri) {
                        return uri.toLowerCase().startsWith("https");
                      };

                      var licenseUrls = option.drms[drm].licenseServers;

                      if (licenseUrls.find(filterHTTPS)) {
                        licenseUrls = licenseUrls.filter(filterHTTPS);
                      } // Choose a random license server from the available list


                      var licenseUrl = licenseUrls.sort(function () {
                        return 0.5 - Math.random();
                      })[0];

                      if (!config.drm[drm]) {
                        config.drm[drm] = {
                          LA_URL: licenseUrl,
                          headers: {
                            Authorization: "Bearer ".concat(_this7.authClient.channelContentTokens[objectId])
                          }
                        };
                      }
                    });
                  }
                });
                return _context82.abrupt("return", config);

              case 9:
              case "end":
                return _context82.stop();
            }
          }
        }, _callee82, this);
      }));

      function BitmovinPlayoutOptions(_x79) {
        return _BitmovinPlayoutOptions.apply(this, arguments);
      }

      return BitmovinPlayoutOptions;
    }()
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

  }, {
    key: "CallBitcodeMethod",
    value: function () {
      var _CallBitcodeMethod = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee83(_ref96) {
        var libraryId, objectId, versionHash, writeToken, method, _ref96$queryParams, queryParams, _ref96$body, body, _ref96$headers, headers, _ref96$constant, constant, _ref96$format, format, path, authHeader;

        return regeneratorRuntime.wrap(function _callee83$(_context83) {
          while (1) {
            switch (_context83.prev = _context83.next) {
              case 0:
                libraryId = _ref96.libraryId, objectId = _ref96.objectId, versionHash = _ref96.versionHash, writeToken = _ref96.writeToken, method = _ref96.method, _ref96$queryParams = _ref96.queryParams, queryParams = _ref96$queryParams === void 0 ? {} : _ref96$queryParams, _ref96$body = _ref96.body, body = _ref96$body === void 0 ? {} : _ref96$body, _ref96$headers = _ref96.headers, headers = _ref96$headers === void 0 ? {} : _ref96$headers, _ref96$constant = _ref96.constant, constant = _ref96$constant === void 0 ? true : _ref96$constant, _ref96$format = _ref96.format, format = _ref96$format === void 0 ? "json" : _ref96$format;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (method) {
                  _context83.next = 4;
                  break;
                }

                throw "Bitcode method not specified";

              case 4:
                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", writeToken || versionHash || objectId, "call", method);

                if (libraryId) {
                  path = UrlJoin("qlibs", libraryId, path);
                }

                authHeader = headers.authorization || headers.Authorization;

                if (authHeader) {
                  _context83.next = 12;
                  break;
                }

                _context83.next = 11;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: !constant
                });

              case 11:
                headers.Authorization = _context83.sent.Authorization;

              case 12:
                this.Log("Calling bitcode method: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n      ").concat(constant ? "GET" : "POST", " ").concat(path, "\n      Query Params:\n      ").concat(queryParams, "\n      Body:\n      ").concat(body, "\n      Headers\n      ").concat(headers));
                _context83.t0 = ResponseToFormat;
                _context83.t1 = format;
                _context83.next = 17;
                return this.HttpClient.Request({
                  body: body,
                  headers: headers,
                  method: constant ? "GET" : "POST",
                  path: path,
                  queryParams: queryParams,
                  failover: false
                });

              case 17:
                _context83.t2 = _context83.sent;
                return _context83.abrupt("return", (0, _context83.t0)(_context83.t1, _context83.t2));

              case 19:
              case "end":
                return _context83.stop();
            }
          }
        }, _callee83, this);
      }));

      function CallBitcodeMethod(_x80) {
        return _CallBitcodeMethod.apply(this, arguments);
      }

      return CallBitcodeMethod;
    }()
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
     * @see FabricUrl for creating arbitrary fabric URLs
     *
     * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
     */

  }, {
    key: "Rep",
    value: function () {
      var _Rep = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee84(_ref97) {
        var libraryId, objectId, versionHash, rep, _ref97$queryParams, queryParams, _ref97$channelAuth, channelAuth, _ref97$noAuth, noAuth, _ref97$noCache, noCache;

        return regeneratorRuntime.wrap(function _callee84$(_context84) {
          while (1) {
            switch (_context84.prev = _context84.next) {
              case 0:
                libraryId = _ref97.libraryId, objectId = _ref97.objectId, versionHash = _ref97.versionHash, rep = _ref97.rep, _ref97$queryParams = _ref97.queryParams, queryParams = _ref97$queryParams === void 0 ? {} : _ref97$queryParams, _ref97$channelAuth = _ref97.channelAuth, channelAuth = _ref97$channelAuth === void 0 ? false : _ref97$channelAuth, _ref97$noAuth = _ref97.noAuth, noAuth = _ref97$noAuth === void 0 ? false : _ref97$noAuth, _ref97$noCache = _ref97.noCache, noCache = _ref97$noCache === void 0 ? false : _ref97$noCache;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (rep) {
                  _context84.next = 4;
                  break;
                }

                throw "Rep not specified";

              case 4:
                return _context84.abrupt("return", this.FabricUrl({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  rep: rep,
                  queryParams: queryParams,
                  channelAuth: channelAuth,
                  noAuth: noAuth,
                  noCache: noCache
                }));

              case 5:
              case "end":
                return _context84.stop();
            }
          }
        }, _callee84, this);
      }));

      function Rep(_x81) {
        return _Rep.apply(this, arguments);
      }

      return Rep;
    }()
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
     * @see FabricUrl for creating arbitrary fabric URLs
     *
     * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
     */

  }, {
    key: "PublicRep",
    value: function () {
      var _PublicRep = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee85(_ref98) {
        var libraryId, objectId, versionHash, rep, _ref98$queryParams, queryParams;

        return regeneratorRuntime.wrap(function _callee85$(_context85) {
          while (1) {
            switch (_context85.prev = _context85.next) {
              case 0:
                libraryId = _ref98.libraryId, objectId = _ref98.objectId, versionHash = _ref98.versionHash, rep = _ref98.rep, _ref98$queryParams = _ref98.queryParams, queryParams = _ref98$queryParams === void 0 ? {} : _ref98$queryParams;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (rep) {
                  _context85.next = 4;
                  break;
                }

                throw "Rep not specified";

              case 4:
                return _context85.abrupt("return", this.FabricUrl({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  publicRep: rep,
                  queryParams: queryParams,
                  noAuth: true
                }));

              case 5:
              case "end":
                return _context85.stop();
            }
          }
        }, _callee85, this);
      }));

      function PublicRep(_x82) {
        return _PublicRep.apply(this, arguments);
      }

      return PublicRep;
    }()
    /**
     * Generate a URL to the specified item in the content fabric with appropriate authorization token.
     *
     * @methodGroup URL Generation
     * @namedParams
     * @param {string=} libraryId - ID of an library
     * @param {string=} objectId - ID of an object
     * @param {string=} versionHash - Hash of an object version
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

  }, {
    key: "FabricUrl",
    value: function () {
      var _FabricUrl = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee86(_ref99) {
        var libraryId, objectId, versionHash, partHash, rep, publicRep, call, _ref99$queryParams, queryParams, _ref99$channelAuth, channelAuth, _ref99$noAuth, noAuth, _ref99$noCache, noCache, path;

        return regeneratorRuntime.wrap(function _callee86$(_context86) {
          while (1) {
            switch (_context86.prev = _context86.next) {
              case 0:
                libraryId = _ref99.libraryId, objectId = _ref99.objectId, versionHash = _ref99.versionHash, partHash = _ref99.partHash, rep = _ref99.rep, publicRep = _ref99.publicRep, call = _ref99.call, _ref99$queryParams = _ref99.queryParams, queryParams = _ref99$queryParams === void 0 ? {} : _ref99$queryParams, _ref99$channelAuth = _ref99.channelAuth, channelAuth = _ref99$channelAuth === void 0 ? false : _ref99$channelAuth, _ref99$noAuth = _ref99.noAuth, noAuth = _ref99$noAuth === void 0 ? false : _ref99$noAuth, _ref99$noCache = _ref99.noCache, noCache = _ref99$noCache === void 0 ? false : _ref99$noCache;

                if (objectId || versionHash) {
                  ValidateParameters({
                    libraryId: libraryId,
                    objectId: objectId,
                    versionHash: versionHash
                  });
                }

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                this.Log("Building Fabric URL:\n      libraryId: ".concat(libraryId, "\n      objectId: ").concat(objectId, "\n      versionHash: ").concat(versionHash, "\n      partHash: ").concat(partHash, "\n      rep: ").concat(rep, "\n      publicRep: ").concat(publicRep, "\n      call: ").concat(call, "\n      channelAuth: ").concat(channelAuth, "\n      noAuth: ").concat(noAuth, "\n      noCache: ").concat(noCache, "\n      queryParams: ").concat(JSON.stringify(queryParams || {}, null, 2))); // Clone queryParams to avoid modification of the original

                queryParams = _objectSpread({}, queryParams);
                _context86.next = 7;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  channelAuth: channelAuth,
                  noAuth: noAuth,
                  noCache: noCache
                });

              case 7:
                queryParams.authorization = _context86.sent;
                path = "";

                if (libraryId) {
                  path = UrlJoin(path, "qlibs", libraryId);

                  if (objectId || versionHash) {
                    path = UrlJoin(path, "q", versionHash || objectId);
                  }
                } else if (versionHash) {
                  path = UrlJoin("q", versionHash);
                }

                if (partHash) {
                  path = UrlJoin(path, "data", partHash);
                } else if (rep) {
                  path = UrlJoin(path, "rep", rep);
                } else if (publicRep) {
                  path = UrlJoin(path, "public", publicRep);
                } else if (call) {
                  path = UrlJoin(path, "call", call);
                }

                return _context86.abrupt("return", this.HttpClient.URL({
                  path: path,
                  queryParams: queryParams
                }));

              case 12:
              case "end":
                return _context86.stop();
            }
          }
        }, _callee86, this);
      }));

      function FabricUrl(_x83) {
        return _FabricUrl.apply(this, arguments);
      }

      return FabricUrl;
    }()
    /**
     * Generate a URL to the specified content object file with appropriate authorization token.
     *
     * @methodGroup URL Generation
     * @namedParams
     * @param {string=} libraryId - ID of an library
     * @param {string=} objectId - ID of an object
     * @param {string=} versionHash - Hash of an object version
     * @param {string} filePath - Path to the content object file
     * @param {Object=} queryParams - Query params to add to the URL
     * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
     * whether such a request exists in the client cache. This request will not be cached.
     *
     * @returns {Promise<string>} - URL to the specified file with authorization token
     */

  }, {
    key: "FileUrl",
    value: function () {
      var _FileUrl = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee87(_ref100) {
        var libraryId, objectId, versionHash, filePath, _ref100$queryParams, queryParams, _ref100$noCache, noCache, path, authorizationToken;

        return regeneratorRuntime.wrap(function _callee87$(_context87) {
          while (1) {
            switch (_context87.prev = _context87.next) {
              case 0:
                libraryId = _ref100.libraryId, objectId = _ref100.objectId, versionHash = _ref100.versionHash, filePath = _ref100.filePath, _ref100$queryParams = _ref100.queryParams, queryParams = _ref100$queryParams === void 0 ? {} : _ref100$queryParams, _ref100$noCache = _ref100.noCache, noCache = _ref100$noCache === void 0 ? false : _ref100$noCache;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (filePath) {
                  _context87.next = 4;
                  break;
                }

                throw "File path not specified";

              case 4:
                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                if (libraryId) {
                  path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, "files", filePath);
                } else {
                  path = UrlJoin("q", versionHash, "files", filePath);
                }

                _context87.next = 8;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  noCache: noCache
                });

              case 8:
                authorizationToken = _context87.sent;
                return _context87.abrupt("return", this.HttpClient.URL({
                  path: path,
                  queryParams: _objectSpread({}, queryParams, {
                    authorization: authorizationToken
                  })
                }));

              case 10:
              case "end":
                return _context87.stop();
            }
          }
        }, _callee87, this);
      }));

      function FileUrl(_x84) {
        return _FileUrl.apply(this, arguments);
      }

      return FileUrl;
    }()
    /**
     * Retrieve the version hash of the specified link's target. If the target is the same as the specified
     * object, will return the latest version hash.
     *
     * @methodGroup URL Generation
     * @namedParams
     * @param {string=} libraryId - ID of an library
     * @param {string=} objectId - ID of an object
     * @param {string=} versionHash - Hash of an object version
     * @param {string} linkPath - Path to the content object link
     *
     * @returns {Promise<string>} - Version hash of the link's target
     */

  }, {
    key: "LinkTarget",
    value: function () {
      var _LinkTarget = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee88(_ref101) {
        var libraryId, objectId, versionHash, linkPath, linkInfo, targetHash;
        return regeneratorRuntime.wrap(function _callee88$(_context88) {
          while (1) {
            switch (_context88.prev = _context88.next) {
              case 0:
                libraryId = _ref101.libraryId, objectId = _ref101.objectId, versionHash = _ref101.versionHash, linkPath = _ref101.linkPath;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context88.next = 4;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  metadataSubtree: UrlJoin(linkPath)
                });

              case 4:
                linkInfo = _context88.sent;

                if (!(!linkInfo || !linkInfo["/"])) {
                  _context88.next = 7;
                  break;
                }

                throw Error("No valid link at ".concat(linkPath));

              case 7:
                targetHash = ((linkInfo["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1];

                if (!targetHash) {
                  _context88.next = 10;
                  break;
                }

                return _context88.abrupt("return", targetHash);

              case 10:
                if (libraryId) {
                  _context88.next = 14;
                  break;
                }

                _context88.next = 13;
                return this.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 13:
                libraryId = _context88.sent;

              case 14:
                _context88.next = 16;
                return this.ContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 16:
                return _context88.abrupt("return", _context88.sent.hash);

              case 17:
              case "end":
                return _context88.stop();
            }
          }
        }, _callee88, this);
      }));

      function LinkTarget(_x85) {
        return _LinkTarget.apply(this, arguments);
      }

      return LinkTarget;
    }()
    /**
     * Generate a URL to the specified file link with appropriate authentication
     *
     * @methodGroup URL Generation
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

  }, {
    key: "LinkUrl",
    value: function () {
      var _LinkUrl = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee89(_ref102) {
        var libraryId, objectId, versionHash, linkPath, mimeType, _ref102$queryParams, queryParams, _ref102$noCache, noCache, path, authorizationToken, targetHash;

        return regeneratorRuntime.wrap(function _callee89$(_context89) {
          while (1) {
            switch (_context89.prev = _context89.next) {
              case 0:
                libraryId = _ref102.libraryId, objectId = _ref102.objectId, versionHash = _ref102.versionHash, linkPath = _ref102.linkPath, mimeType = _ref102.mimeType, _ref102$queryParams = _ref102.queryParams, queryParams = _ref102$queryParams === void 0 ? {} : _ref102$queryParams, _ref102$noCache = _ref102.noCache, noCache = _ref102$noCache === void 0 ? false : _ref102$noCache;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (linkPath) {
                  _context89.next = 4;
                  break;
                }

                throw Error("Link path not specified");

              case 4:
                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                if (libraryId) {
                  path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, "meta", linkPath);
                } else {
                  path = UrlJoin("q", versionHash, "meta", linkPath);
                }

                _context89.next = 8;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  noCache: noCache
                });

              case 8:
                authorizationToken = _context89.sent;
                _context89.next = 11;
                return this.LinkTarget({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  linkPath: linkPath
                });

              case 11:
                targetHash = _context89.sent;

                if (!(this.utils.DecodeVersionHash(targetHash).objectId !== objectId)) {
                  _context89.next = 18;
                  break;
                }

                _context89.t0 = authorizationToken;
                _context89.next = 16;
                return this.authClient.AuthorizationToken({
                  versionHash: targetHash,
                  noCache: noCache
                });

              case 16:
                _context89.t1 = _context89.sent;
                authorizationToken = [_context89.t0, _context89.t1];

              case 18:
                queryParams = _objectSpread({}, queryParams, {
                  resolve: true,
                  authorization: authorizationToken
                });

                if (mimeType) {
                  queryParams["header-accept"] = mimeType;
                }

                return _context89.abrupt("return", this.HttpClient.URL({
                  path: path,
                  queryParams: queryParams
                }));

              case 21:
              case "end":
                return _context89.stop();
            }
          }
        }, _callee89, this);
      }));

      function LinkUrl(_x86) {
        return _LinkUrl.apply(this, arguments);
      }

      return LinkUrl;
    }()
    /**
     * Retrieve the data at the specified link in the specified format
     *
     * @methodGroup URL Generation
     * @namedParams
     * @param {string=} libraryId - ID of an library
     * @param {string=} objectId - ID of an object
     * @param {string=} versionHash - Hash of an object version
     * @param {string} linkPath - Path to the content object link
     * @param {string=} format=json - Format of the response
     */

  }, {
    key: "LinkData",
    value: function () {
      var _LinkData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee90(_ref103) {
        var libraryId, objectId, versionHash, linkPath, _ref103$format, format, linkUrl;

        return regeneratorRuntime.wrap(function _callee90$(_context90) {
          while (1) {
            switch (_context90.prev = _context90.next) {
              case 0:
                libraryId = _ref103.libraryId, objectId = _ref103.objectId, versionHash = _ref103.versionHash, linkPath = _ref103.linkPath, _ref103$format = _ref103.format, format = _ref103$format === void 0 ? "json" : _ref103$format;
                _context90.next = 3;
                return this.LinkUrl({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  linkPath: linkPath
                });

              case 3:
                linkUrl = _context90.sent;
                _context90.t0 = ResponseToFormat;
                _context90.t1 = format;
                _context90.next = 8;
                return this.HttpClient.Fetch(linkUrl);

              case 8:
                _context90.t2 = _context90.sent;
                return _context90.abrupt("return", (0, _context90.t0)(_context90.t1, _context90.t2));

              case 10:
              case "end":
                return _context90.stop();
            }
          }
        }, _callee90, this);
      }));

      function LinkData(_x87) {
        return _LinkData.apply(this, arguments);
      }

      return LinkData;
    }()
    /* Access Groups */

    /**
     * Create a access group
     *
     * A new access group contract is deployed from the content space
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} name - Name of the access group
     * @param {string=} description - Description for the access group
     * @param {object=} meta - Metadata for the access group
     *
     * @returns {Promise<string>} - Contract address of created access group
     */

  }, {
    key: "CreateAccessGroup",
    value: function () {
      var _CreateAccessGroup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee91(_ref104) {
        var name, description, _ref104$metadata, metadata, _ref105, contractAddress, objectId, editResponse;

        return regeneratorRuntime.wrap(function _callee91$(_context91) {
          while (1) {
            switch (_context91.prev = _context91.next) {
              case 0:
                name = _ref104.name, description = _ref104.description, _ref104$metadata = _ref104.metadata, metadata = _ref104$metadata === void 0 ? {} : _ref104$metadata;
                this.Log("Creating access group: ".concat(name || "", " ").concat(description || ""));
                _context91.next = 4;
                return this.authClient.CreateAccessGroup();

              case 4:
                _ref105 = _context91.sent;
                contractAddress = _ref105.contractAddress;
                objectId = this.utils.AddressToObjectId(contractAddress);
                this.Log("Access group: ".concat(contractAddress, " ").concat(objectId));
                _context91.next = 10;
                return this.EditContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId
                });

              case 10:
                editResponse = _context91.sent;
                _context91.next = 13;
                return this.ReplaceMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  metadata: _objectSpread({
                    "public": {
                      name: name,
                      description: description
                    },
                    name: name,
                    description: description
                  }, metadata)
                });

              case 13:
                _context91.next = 15;
                return this.FinalizeContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token
                });

              case 15:
                return _context91.abrupt("return", contractAddress);

              case 16:
              case "end":
                return _context91.stop();
            }
          }
        }, _callee91, this);
      }));

      function CreateAccessGroup(_x88) {
        return _CreateAccessGroup.apply(this, arguments);
      }

      return CreateAccessGroup;
    }()
    /**
     * Returns the address of the owner of the specified content object
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} libraryId
     *
     * @returns {Promise<string>} - The account address of the owner
     */

  }, {
    key: "AccessGroupOwner",
    value: function () {
      var _AccessGroupOwner = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee92(_ref106) {
        var contractAddress;
        return regeneratorRuntime.wrap(function _callee92$(_context92) {
          while (1) {
            switch (_context92.prev = _context92.next) {
              case 0:
                contractAddress = _ref106.contractAddress;
                ValidateAddress(contractAddress);
                this.Log("Retrieving owner of access group ".concat(contractAddress));
                _context92.t0 = this.utils;
                _context92.next = 6;
                return this.ethClient.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 6:
                _context92.t1 = _context92.sent;
                return _context92.abrupt("return", _context92.t0.FormatAddress.call(_context92.t0, _context92.t1));

              case 8:
              case "end":
                return _context92.stop();
            }
          }
        }, _callee92, this);
      }));

      function AccessGroupOwner(_x89) {
        return _AccessGroupOwner.apply(this, arguments);
      }

      return AccessGroupOwner;
    }()
    /**
     * Delete an access group
     *
     * Calls the kill method on the specified access group's contract
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} contractAddress - The address of the access group contract
     */

  }, {
    key: "DeleteAccessGroup",
    value: function () {
      var _DeleteAccessGroup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee93(_ref107) {
        var contractAddress;
        return regeneratorRuntime.wrap(function _callee93$(_context93) {
          while (1) {
            switch (_context93.prev = _context93.next) {
              case 0:
                contractAddress = _ref107.contractAddress;
                ValidateAddress(contractAddress);
                this.Log("Deleting access group ".concat(contractAddress));
                _context93.next = 5;
                return this.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "kill",
                  methodArgs: []
                });

              case 5:
              case "end":
                return _context93.stop();
            }
          }
        }, _callee93, this);
      }));

      function DeleteAccessGroup(_x90) {
        return _DeleteAccessGroup.apply(this, arguments);
      }

      return DeleteAccessGroup;
    }()
    /**
     * Get a list of addresses of members of the specified group
     *
     * @methodGroup AccessGroups
     * @namedParams
     * @param contractAddress - The address of the access group contract
     *
     * @return {Promise<Array<string>>} - List of member addresses
     */

  }, {
    key: "AccessGroupMembers",
    value: function () {
      var _AccessGroupMembers = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee95(_ref108) {
        var _this8 = this;

        var contractAddress, length;
        return regeneratorRuntime.wrap(function _callee95$(_context95) {
          while (1) {
            switch (_context95.prev = _context95.next) {
              case 0:
                contractAddress = _ref108.contractAddress;
                ValidateAddress(contractAddress);
                this.Log("Retrieving members for group ".concat(contractAddress));
                _context95.next = 5;
                return this.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "membersNum"
                });

              case 5:
                length = _context95.sent.toNumber();
                _context95.next = 8;
                return Promise.all(_toConsumableArray(Array(length)).map(
                /*#__PURE__*/
                function () {
                  var _ref109 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee94(_, i) {
                    return regeneratorRuntime.wrap(function _callee94$(_context94) {
                      while (1) {
                        switch (_context94.prev = _context94.next) {
                          case 0:
                            _context94.t0 = _this8.utils;
                            _context94.next = 3;
                            return _this8.CallContractMethod({
                              contractAddress: contractAddress,
                              abi: AccessGroupContract.abi,
                              methodName: "membersList",
                              methodArgs: [i]
                            });

                          case 3:
                            _context94.t1 = _context94.sent;
                            return _context94.abrupt("return", _context94.t0.FormatAddress.call(_context94.t0, _context94.t1));

                          case 5:
                          case "end":
                            return _context94.stop();
                        }
                      }
                    }, _callee94);
                  }));

                  return function (_x92, _x93) {
                    return _ref109.apply(this, arguments);
                  };
                }()));

              case 8:
                return _context95.abrupt("return", _context95.sent);

              case 9:
              case "end":
                return _context95.stop();
            }
          }
        }, _callee95, this);
      }));

      function AccessGroupMembers(_x91) {
        return _AccessGroupMembers.apply(this, arguments);
      }

      return AccessGroupMembers;
    }()
    /**
     * Get a list of addresses of managers of the specified group
     *
     * @methodGroup AccessGroups
     * @namedParams
     * @param contractAddress - The address of the access group contract
     *
     * @return {Promise<Array<string>>} - List of manager addresses
     */

  }, {
    key: "AccessGroupManagers",
    value: function () {
      var _AccessGroupManagers = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee97(_ref110) {
        var _this9 = this;

        var contractAddress, length;
        return regeneratorRuntime.wrap(function _callee97$(_context97) {
          while (1) {
            switch (_context97.prev = _context97.next) {
              case 0:
                contractAddress = _ref110.contractAddress;
                ValidateAddress(contractAddress);
                this.Log("Retrieving managers for group ".concat(contractAddress));
                _context97.next = 5;
                return this.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "managersNum"
                });

              case 5:
                length = _context97.sent.toNumber();
                _context97.next = 8;
                return Promise.all(_toConsumableArray(Array(length)).map(
                /*#__PURE__*/
                function () {
                  var _ref111 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee96(_, i) {
                    return regeneratorRuntime.wrap(function _callee96$(_context96) {
                      while (1) {
                        switch (_context96.prev = _context96.next) {
                          case 0:
                            _context96.t0 = _this9.utils;
                            _context96.next = 3;
                            return _this9.CallContractMethod({
                              contractAddress: contractAddress,
                              abi: AccessGroupContract.abi,
                              methodName: "managersList",
                              methodArgs: [i]
                            });

                          case 3:
                            _context96.t1 = _context96.sent;
                            return _context96.abrupt("return", _context96.t0.FormatAddress.call(_context96.t0, _context96.t1));

                          case 5:
                          case "end":
                            return _context96.stop();
                        }
                      }
                    }, _callee96);
                  }));

                  return function (_x95, _x96) {
                    return _ref111.apply(this, arguments);
                  };
                }()));

              case 8:
                return _context97.abrupt("return", _context97.sent);

              case 9:
              case "end":
                return _context97.stop();
            }
          }
        }, _callee97, this);
      }));

      function AccessGroupManagers(_x94) {
        return _AccessGroupManagers.apply(this, arguments);
      }

      return AccessGroupManagers;
    }()
  }, {
    key: "AccessGroupMembershipMethod",
    value: function () {
      var _AccessGroupMembershipMethod = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee98(_ref112) {
        var contractAddress, memberAddress, methodName, eventName, isManager, event, candidate;
        return regeneratorRuntime.wrap(function _callee98$(_context98) {
          while (1) {
            switch (_context98.prev = _context98.next) {
              case 0:
                contractAddress = _ref112.contractAddress, memberAddress = _ref112.memberAddress, methodName = _ref112.methodName, eventName = _ref112.eventName;
                ValidateAddress(contractAddress);
                ValidateAddress(memberAddress); // Ensure caller is the member being acted upon or a manager/owner of the group

                if (this.utils.EqualAddress(this.signer.address, memberAddress)) {
                  _context98.next = 9;
                  break;
                }

                _context98.next = 6;
                return this.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "hasManagerAccess",
                  methodArgs: [this.utils.FormatAddress(this.signer.address)]
                });

              case 6:
                isManager = _context98.sent;

                if (isManager) {
                  _context98.next = 9;
                  break;
                }

                throw Error("Manager access required");

              case 9:
                this.Log("Calling ".concat(methodName, " on group ").concat(contractAddress, " for user ").concat(memberAddress));
                _context98.next = 12;
                return this.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: methodName,
                  methodArgs: [this.utils.FormatAddress(memberAddress)],
                  eventName: eventName,
                  eventValue: "candidate"
                });

              case 12:
                event = _context98.sent;
                candidate = this.ExtractValueFromEvent({
                  abi: AccessGroupContract.abi,
                  event: event,
                  eventName: eventName,
                  eventValue: "candidate"
                });

                if (!(this.utils.FormatAddress(candidate) !== this.utils.FormatAddress(memberAddress))) {
                  _context98.next = 17;
                  break;
                }

                // eslint-disable-next-line no-console
                console.error("Mismatch: " + candidate + " :: " + memberAddress);
                throw Error("Access group method " + methodName + " failed");

              case 17:
                return _context98.abrupt("return", event.transactionHash);

              case 18:
              case "end":
                return _context98.stop();
            }
          }
        }, _callee98, this);
      }));

      function AccessGroupMembershipMethod(_x97) {
        return _AccessGroupMembershipMethod.apply(this, arguments);
      }

      return AccessGroupMembershipMethod;
    }()
    /**
     * Add a member to the access group at the specified contract address. This client's signer must
     * be a manager of the access group.
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} contractAddress - Address of the access group contract
     * @param {string} memberAddress - Address of the member to add
     *
     * @returns {Promise<string>} - The transaction hash of the call to the grantAccess method
     */

  }, {
    key: "AddAccessGroupMember",
    value: function () {
      var _AddAccessGroupMember = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee99(_ref113) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee99$(_context99) {
          while (1) {
            switch (_context99.prev = _context99.next) {
              case 0:
                contractAddress = _ref113.contractAddress, memberAddress = _ref113.memberAddress;
                ValidateAddress(contractAddress);
                ValidateAddress(memberAddress);
                _context99.next = 5;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "grantAccess",
                  eventName: "MemberAdded"
                });

              case 5:
                return _context99.abrupt("return", _context99.sent);

              case 6:
              case "end":
                return _context99.stop();
            }
          }
        }, _callee99, this);
      }));

      function AddAccessGroupMember(_x98) {
        return _AddAccessGroupMember.apply(this, arguments);
      }

      return AddAccessGroupMember;
    }()
    /**
     * Remove a member from the access group at the specified contract address. This client's signer must
     * be a manager of the access group.
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} contractAddress - Address of the access group contract
     * @param {string} memberAddress - Address of the member to remove
     *
     * @returns {Promise<string>} - The transaction hash of the call to the revokeAccess method
     */

  }, {
    key: "RemoveAccessGroupMember",
    value: function () {
      var _RemoveAccessGroupMember = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee100(_ref114) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee100$(_context100) {
          while (1) {
            switch (_context100.prev = _context100.next) {
              case 0:
                contractAddress = _ref114.contractAddress, memberAddress = _ref114.memberAddress;
                ValidateAddress(contractAddress);
                ValidateAddress(memberAddress);
                _context100.next = 5;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "revokeAccess",
                  eventName: "MemberRevoked"
                });

              case 5:
                return _context100.abrupt("return", _context100.sent);

              case 6:
              case "end":
                return _context100.stop();
            }
          }
        }, _callee100, this);
      }));

      function RemoveAccessGroupMember(_x99) {
        return _RemoveAccessGroupMember.apply(this, arguments);
      }

      return RemoveAccessGroupMember;
    }()
    /**
     * Add a manager to the access group at the specified contract address. This client's signer must
     * be a manager of the access group.
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} contractAddress - Address of the access group contract
     * @param {string} memberAddress - Address of the manager to add
     *
     * @returns {Promise<string>} - The transaction hash of the call to the grantManagerAccess method
     */

  }, {
    key: "AddAccessGroupManager",
    value: function () {
      var _AddAccessGroupManager = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee101(_ref115) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee101$(_context101) {
          while (1) {
            switch (_context101.prev = _context101.next) {
              case 0:
                contractAddress = _ref115.contractAddress, memberAddress = _ref115.memberAddress;
                ValidateAddress(contractAddress);
                ValidateAddress(memberAddress);
                _context101.next = 5;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "grantManagerAccess",
                  eventName: "ManagerAccessGranted"
                });

              case 5:
                return _context101.abrupt("return", _context101.sent);

              case 6:
              case "end":
                return _context101.stop();
            }
          }
        }, _callee101, this);
      }));

      function AddAccessGroupManager(_x100) {
        return _AddAccessGroupManager.apply(this, arguments);
      }

      return AddAccessGroupManager;
    }()
    /**
     * Remove a manager from the access group at the specified contract address. This client's signer must
     * be a manager of the access group.
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} contractAddress - Address of the access group contract
     * @param {string} memberAddress - Address of the manager to remove
     *
     * @returns {Promise<string>} - The transaction hash of the call to the revokeManagerAccess method
     */

  }, {
    key: "RemoveAccessGroupManager",
    value: function () {
      var _RemoveAccessGroupManager = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee102(_ref116) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee102$(_context102) {
          while (1) {
            switch (_context102.prev = _context102.next) {
              case 0:
                contractAddress = _ref116.contractAddress, memberAddress = _ref116.memberAddress;
                ValidateAddress(contractAddress);
                ValidateAddress(memberAddress);
                _context102.next = 5;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "revokeManagerAccess",
                  eventName: "ManagerAccessRevoked"
                });

              case 5:
                return _context102.abrupt("return", _context102.sent);

              case 6:
              case "end":
                return _context102.stop();
            }
          }
        }, _callee102, this);
      }));

      function RemoveAccessGroupManager(_x101) {
        return _RemoveAccessGroupManager.apply(this, arguments);
      }

      return RemoveAccessGroupManager;
    }()
    /**
     * List all of the groups with permissions on the specified library.
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} libraryId - The ID of the library* @param {string} libraryId - The ID of the library
     * @param {(Array<string>)=} permissions - Limit permission types. If not specified, all permissions will be included
     *
     * @return {Promise<Object>} - Object mapping group addresses to permissions, as an array
     * - Example: { "0x0": ["accessor", "contributor"], ...}
     */

  }, {
    key: "ContentLibraryGroupPermissions",
    value: function () {
      var _ContentLibraryGroupPermissions = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee105(_ref117) {
        var _this10 = this;

        var libraryId, _ref117$permissions, permissions, libraryPermissions;

        return regeneratorRuntime.wrap(function _callee105$(_context105) {
          while (1) {
            switch (_context105.prev = _context105.next) {
              case 0:
                libraryId = _ref117.libraryId, _ref117$permissions = _ref117.permissions, permissions = _ref117$permissions === void 0 ? [] : _ref117$permissions;
                ValidateLibrary(libraryId);
                libraryPermissions = {};

                if (!permissions || permissions.length === 0) {
                  permissions = ["accessor", "contributor", "reviewer"];
                } else {
                  // Format and validate specified permissions
                  permissions = permissions.map(function (permission) {
                    permission = permission.toLowerCase();

                    if (!["accessor", "contributor", "reviewer"].includes(permission)) {
                      throw Error("Invalid permission: ".concat(permission));
                    }

                    return permission;
                  });
                }

                this.Log("Retrieving ".concat(permissions.join(", "), " group(s) for library ").concat(libraryId));
                _context105.next = 7;
                return Promise.all(permissions.map(
                /*#__PURE__*/
                function () {
                  var _ref118 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee104(type) {
                    var numGroups, accessGroupAddresses;
                    return regeneratorRuntime.wrap(function _callee104$(_context104) {
                      while (1) {
                        switch (_context104.prev = _context104.next) {
                          case 0:
                            _context104.next = 2;
                            return _this10.CallContractMethod({
                              contractAddress: _this10.utils.HashToAddress(libraryId),
                              abi: LibraryContract.abi,
                              methodName: type + "GroupsLength"
                            });

                          case 2:
                            numGroups = _context104.sent;
                            numGroups = parseInt(numGroups._hex, 16);
                            _context104.next = 6;
                            return LimitedMap(3, _toConsumableArray(Array(numGroups).keys()),
                            /*#__PURE__*/
                            function () {
                              var _ref119 = _asyncToGenerator(
                              /*#__PURE__*/
                              regeneratorRuntime.mark(function _callee103(i) {
                                return regeneratorRuntime.wrap(function _callee103$(_context103) {
                                  while (1) {
                                    switch (_context103.prev = _context103.next) {
                                      case 0:
                                        _context103.prev = 0;
                                        _context103.t0 = _this10.utils;
                                        _context103.next = 4;
                                        return _this10.CallContractMethod({
                                          contractAddress: _this10.utils.HashToAddress(libraryId),
                                          abi: LibraryContract.abi,
                                          methodName: type + "Groups",
                                          methodArgs: [i]
                                        });

                                      case 4:
                                        _context103.t1 = _context103.sent;
                                        return _context103.abrupt("return", _context103.t0.FormatAddress.call(_context103.t0, _context103.t1));

                                      case 8:
                                        _context103.prev = 8;
                                        _context103.t2 = _context103["catch"](0);
                                        // eslint-disable-next-line no-console
                                        console.error(_context103.t2);

                                      case 11:
                                      case "end":
                                        return _context103.stop();
                                    }
                                  }
                                }, _callee103, null, [[0, 8]]);
                              }));

                              return function (_x104) {
                                return _ref119.apply(this, arguments);
                              };
                            }());

                          case 6:
                            accessGroupAddresses = _context104.sent;
                            accessGroupAddresses.forEach(function (address) {
                              return libraryPermissions[address] = [].concat(_toConsumableArray(libraryPermissions[address] || []), [type]).sort();
                            });

                          case 8:
                          case "end":
                            return _context104.stop();
                        }
                      }
                    }, _callee104);
                  }));

                  return function (_x103) {
                    return _ref118.apply(this, arguments);
                  };
                }()));

              case 7:
                return _context105.abrupt("return", libraryPermissions);

              case 8:
              case "end":
                return _context105.stop();
            }
          }
        }, _callee105, this);
      }));

      function ContentLibraryGroupPermissions(_x102) {
        return _ContentLibraryGroupPermissions.apply(this, arguments);
      }

      return ContentLibraryGroupPermissions;
    }()
    /**
     * Add accessor, contributor or reviewer permissions for the specified group on the specified library
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} libraryId - The ID of the library
     * @param {string} groupAddress - The address of the group
     * @param {string} permission - The type of permission to add ("accessor", "contributor", "reviewer")
     */

  }, {
    key: "AddContentLibraryGroup",
    value: function () {
      var _AddContentLibraryGroup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee106(_ref120) {
        var libraryId, groupAddress, permission, existingPermissions, event;
        return regeneratorRuntime.wrap(function _callee106$(_context106) {
          while (1) {
            switch (_context106.prev = _context106.next) {
              case 0:
                libraryId = _ref120.libraryId, groupAddress = _ref120.groupAddress, permission = _ref120.permission;
                ValidateLibrary(libraryId);
                ValidateAddress(groupAddress);
                groupAddress = this.utils.FormatAddress(groupAddress);

                if (["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
                  _context106.next = 6;
                  break;
                }

                throw Error("Invalid group type: ".concat(permission));

              case 6:
                this.Log("Adding ".concat(permission, " group ").concat(groupAddress, " to library ").concat(libraryId));
                _context106.next = 9;
                return this.ContentLibraryGroupPermissions({
                  libraryId: libraryId,
                  permissions: [permission]
                });

              case 9:
                existingPermissions = _context106.sent;

                if (!existingPermissions[groupAddress]) {
                  _context106.next = 12;
                  break;
                }

                return _context106.abrupt("return");

              case 12:
                // Capitalize permission to match method and event names
                permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();
                _context106.next = 15;
                return this.CallContractMethodAndWait({
                  contractAddress: this.utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "add".concat(permission, "Group"),
                  methodArgs: [this.utils.FormatAddress(groupAddress)]
                });

              case 15:
                event = _context106.sent;
                _context106.next = 18;
                return this.ExtractEventFromLogs({
                  abi: LibraryContract.abi,
                  event: event,
                  eventName: "".concat(permission, "GroupAdded")
                });

              case 18:
              case "end":
                return _context106.stop();
            }
          }
        }, _callee106, this);
      }));

      function AddContentLibraryGroup(_x105) {
        return _AddContentLibraryGroup.apply(this, arguments);
      }

      return AddContentLibraryGroup;
    }()
    /**
     * Remove accessor, contributor or reviewer permissions for the specified group on the specified library
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} libraryId - The ID of the library
     * @param {string} groupAddress - The address of the group
     * @param {string} permission - The type of permission to remove ("accessor", "contributor", "reviewer")
     */

  }, {
    key: "RemoveContentLibraryGroup",
    value: function () {
      var _RemoveContentLibraryGroup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee107(_ref121) {
        var libraryId, groupAddress, permission, existingPermissions, event;
        return regeneratorRuntime.wrap(function _callee107$(_context107) {
          while (1) {
            switch (_context107.prev = _context107.next) {
              case 0:
                libraryId = _ref121.libraryId, groupAddress = _ref121.groupAddress, permission = _ref121.permission;
                ValidateLibrary(libraryId);
                ValidateAddress(groupAddress);

                if (["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
                  _context107.next = 5;
                  break;
                }

                throw Error("Invalid group type: ".concat(permission));

              case 5:
                this.Log("Removing ".concat(permission, " group ").concat(groupAddress, " from library ").concat(libraryId));
                _context107.next = 8;
                return this.ContentLibraryGroupPermissions({
                  libraryId: libraryId,
                  permissions: [permission]
                });

              case 8:
                existingPermissions = _context107.sent;

                if (existingPermissions[groupAddress]) {
                  _context107.next = 11;
                  break;
                }

                return _context107.abrupt("return");

              case 11:
                // Capitalize permission to match method and event names
                permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();
                _context107.next = 14;
                return this.CallContractMethodAndWait({
                  contractAddress: this.utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "remove".concat(permission, "Group"),
                  methodArgs: [this.utils.FormatAddress(groupAddress)]
                });

              case 14:
                event = _context107.sent;
                _context107.next = 17;
                return this.ExtractEventFromLogs({
                  abi: LibraryContract.abi,
                  event: event,
                  eventName: "".concat(permission, "GroupRemoved")
                });

              case 17:
              case "end":
                return _context107.stop();
            }
          }
        }, _callee107, this);
      }));

      function RemoveContentLibraryGroup(_x106) {
        return _RemoveContentLibraryGroup.apply(this, arguments);
      }

      return RemoveContentLibraryGroup;
    }()
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

  }, {
    key: "Collection",
    value: function () {
      var _Collection = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee108(_ref122) {
        var collectionType, validCollectionTypes, walletAddress;
        return regeneratorRuntime.wrap(function _callee108$(_context108) {
          while (1) {
            switch (_context108.prev = _context108.next) {
              case 0:
                collectionType = _ref122.collectionType;
                validCollectionTypes = ["accessGroups", "contentObjects", "contentTypes", "contracts", "libraries"];

                if (validCollectionTypes.includes(collectionType)) {
                  _context108.next = 4;
                  break;
                }

                throw new Error("Invalid collection type: " + collectionType);

              case 4:
                if (!this.signer) {
                  _context108.next = 10;
                  break;
                }

                _context108.next = 7;
                return this.userProfileClient.WalletAddress();

              case 7:
                _context108.t0 = _context108.sent;
                _context108.next = 11;
                break;

              case 10:
                _context108.t0 = undefined;

              case 11:
                walletAddress = _context108.t0;

                if (walletAddress) {
                  _context108.next = 14;
                  break;
                }

                throw new Error("Unable to get collection: User wallet doesn't exist");

              case 14:
                this.Log("Retrieving ".concat(collectionType, " contract collection for user ").concat(this.signer.address));
                _context108.next = 17;
                return this.ethClient.MakeProviderCall({
                  methodName: "send",
                  args: ["elv_getWalletCollection", [this.contentSpaceId, "iusr".concat(this.utils.AddressToHash(this.signer.address)), collectionType]]
                });

              case 17:
                return _context108.abrupt("return", _context108.sent);

              case 18:
              case "end":
                return _context108.stop();
            }
          }
        }, _callee108, this);
      }));

      function Collection(_x107) {
        return _Collection.apply(this, arguments);
      }

      return Collection;
    }()
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

  }, {
    key: "VerifyContentObject",
    value: function () {
      var _VerifyContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee109(_ref123) {
        var libraryId, objectId, versionHash;
        return regeneratorRuntime.wrap(function _callee109$(_context109) {
          while (1) {
            switch (_context109.prev = _context109.next) {
              case 0:
                libraryId = _ref123.libraryId, objectId = _ref123.objectId, versionHash = _ref123.versionHash;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });
                _context109.next = 4;
                return ContentObjectVerification.VerifyContentObject({
                  client: this,
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 4:
                return _context109.abrupt("return", _context109.sent);

              case 5:
              case "end":
                return _context109.stop();
            }
          }
        }, _callee109, this);
      }));

      function VerifyContentObject(_x108) {
        return _VerifyContentObject.apply(this, arguments);
      }

      return VerifyContentObject;
    }()
    /**
     * Get the proofs associated with a given part
     *
     * @see GET /qlibs/:qlibid/q/:qhit/data/:qparthash/proofs
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

  }, {
    key: "Proofs",
    value: function () {
      var _Proofs = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee110(_ref124) {
        var libraryId, objectId, versionHash, partHash, path;
        return regeneratorRuntime.wrap(function _callee110$(_context110) {
          while (1) {
            switch (_context110.prev = _context110.next) {
              case 0:
                libraryId = _ref124.libraryId, objectId = _ref124.objectId, versionHash = _ref124.versionHash, partHash = _ref124.partHash;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });
                ValidatePartHash(partHash);

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "data", partHash, "proofs");
                _context110.t0 = ResponseToJson;
                _context110.t1 = this.HttpClient;
                _context110.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 9:
                _context110.t2 = _context110.sent;
                _context110.t3 = path;
                _context110.t4 = {
                  headers: _context110.t2,
                  method: "GET",
                  path: _context110.t3
                };
                _context110.t5 = _context110.t1.Request.call(_context110.t1, _context110.t4);
                return _context110.abrupt("return", (0, _context110.t0)(_context110.t5));

              case 14:
              case "end":
                return _context110.stop();
            }
          }
        }, _callee110, this);
      }));

      function Proofs(_x109) {
        return _Proofs.apply(this, arguments);
      }

      return Proofs;
    }()
    /**
     * Get part info in CBOR format
     *
     * @see GET /qparts/:qparthash
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

  }, {
    key: "QParts",
    value: function () {
      var _QParts = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee111(_ref125) {
        var libraryId, objectId, partHash, _ref125$format, format, path;

        return regeneratorRuntime.wrap(function _callee111$(_context111) {
          while (1) {
            switch (_context111.prev = _context111.next) {
              case 0:
                libraryId = _ref125.libraryId, objectId = _ref125.objectId, partHash = _ref125.partHash, _ref125$format = _ref125.format, format = _ref125$format === void 0 ? "blob" : _ref125$format;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });
                ValidatePartHash(partHash);
                path = UrlJoin("qparts", partHash);
                _context111.t0 = ResponseToFormat;
                _context111.t1 = format;
                _context111.t2 = this.HttpClient;
                _context111.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  partHash: partHash
                });

              case 9:
                _context111.t3 = _context111.sent;
                _context111.t4 = path;
                _context111.t5 = {
                  headers: _context111.t3,
                  method: "GET",
                  path: _context111.t4
                };
                _context111.t6 = _context111.t2.Request.call(_context111.t2, _context111.t5);
                return _context111.abrupt("return", (0, _context111.t0)(_context111.t1, _context111.t6));

              case 14:
              case "end":
                return _context111.stop();
            }
          }
        }, _callee111, this);
      }));

      function QParts(_x110) {
        return _QParts.apply(this, arguments);
      }

      return QParts;
    }()
    /* Contracts */

    /**
     * Return the name of the contract, as specified in the contracts "version" string
     *
     * @methodGroup Contracts
     *
     * @namedParams
     * @param {string} contractAddress - Address of the contract
     *
     * @return {Promise<string>} - Name of the contract
     */

  }, {
    key: "ContractName",
    value: function () {
      var _ContractName = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee112(_ref126) {
        var contractAddress;
        return regeneratorRuntime.wrap(function _callee112$(_context112) {
          while (1) {
            switch (_context112.prev = _context112.next) {
              case 0:
                contractAddress = _ref126.contractAddress;
                ValidateAddress(contractAddress);
                _context112.next = 4;
                return this.ethClient.ContractName(contractAddress);

              case 4:
                return _context112.abrupt("return", _context112.sent);

              case 5:
              case "end":
                return _context112.stop();
            }
          }
        }, _callee112, this);
      }));

      function ContractName(_x111) {
        return _ContractName.apply(this, arguments);
      }

      return ContractName;
    }()
    /**
     * Format the arguments to be used for the specified method of the contract
     *
     * @methodGroup Contracts
     * @namedParams
     * @param {Object} abi - ABI of contract
     * @param {string} methodName - Name of method for which arguments will be formatted
     * @param {Array<string>} args - List of arguments
     *
     * @returns {Array<string>} - List of formatted arguments
     */

  }, {
    key: "FormatContractArguments",
    value: function FormatContractArguments(_ref127) {
      var abi = _ref127.abi,
          methodName = _ref127.methodName,
          args = _ref127.args;
      return this.ethClient.FormatContractArguments({
        abi: abi,
        methodName: methodName,
        args: args
      });
    }
    /**
     * Deploy a contract from ABI and bytecode. This client's signer will be the owner of the contract.
     *
     * @methodGroup Contracts
     * @namedParams
     * @param {Object} abi - ABI of contract
     * @param {string} bytecode - Bytecode of the contract
     * @param {Array<string>} constructorArgs - List of arguments to the contract constructor
     * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
     *
     * @returns {Promise<Object>} - Response containing the deployed contract address and the transaction hash of the deployment
     */

  }, {
    key: "DeployContract",
    value: function () {
      var _DeployContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee113(_ref128) {
        var abi, bytecode, constructorArgs, _ref128$overrides, overrides;

        return regeneratorRuntime.wrap(function _callee113$(_context113) {
          while (1) {
            switch (_context113.prev = _context113.next) {
              case 0:
                abi = _ref128.abi, bytecode = _ref128.bytecode, constructorArgs = _ref128.constructorArgs, _ref128$overrides = _ref128.overrides, overrides = _ref128$overrides === void 0 ? {} : _ref128$overrides;
                _context113.next = 3;
                return this.ethClient.DeployContract({
                  abi: abi,
                  bytecode: bytecode,
                  constructorArgs: constructorArgs,
                  overrides: overrides,
                  signer: this.signer
                });

              case 3:
                return _context113.abrupt("return", _context113.sent);

              case 4:
              case "end":
                return _context113.stop();
            }
          }
        }, _callee113, this);
      }));

      function DeployContract(_x112) {
        return _DeployContract.apply(this, arguments);
      }

      return DeployContract;
    }()
    /**
     * Call the specified method on a deployed contract. This action will be performed by this client's signer.
     *
     * Use this method to call constant methods and contract attributes, as well as transaction-performing methods
     * for which the transaction does not need to be awaited.
     *
     * @methodGroup Contracts
     * @namedParams
     * @param {string} contractAddress - Address of the contract to call the specified method on
     * @param {Object} abi - ABI of contract
     * @param {string} methodName - Method to call on the contract
     * @param {Array=} methodArgs - List of arguments to the contract constructor
     * @param {(number | BigNumber)=} value - Amount of ether to include in the transaction
     * @param {boolean=} formatArguments=true - If specified, the arguments will automatically be formatted to the ABI specification
     * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
     *
     * @returns {Promise<*>} - Response containing information about the transaction
     */

  }, {
    key: "CallContractMethod",
    value: function () {
      var _CallContractMethod = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee114(_ref129) {
        var contractAddress, abi, methodName, _ref129$methodArgs, methodArgs, value, _ref129$overrides, overrides, _ref129$formatArgumen, formatArguments, _ref129$cacheContract, cacheContract;

        return regeneratorRuntime.wrap(function _callee114$(_context114) {
          while (1) {
            switch (_context114.prev = _context114.next) {
              case 0:
                contractAddress = _ref129.contractAddress, abi = _ref129.abi, methodName = _ref129.methodName, _ref129$methodArgs = _ref129.methodArgs, methodArgs = _ref129$methodArgs === void 0 ? [] : _ref129$methodArgs, value = _ref129.value, _ref129$overrides = _ref129.overrides, overrides = _ref129$overrides === void 0 ? {} : _ref129$overrides, _ref129$formatArgumen = _ref129.formatArguments, formatArguments = _ref129$formatArgumen === void 0 ? true : _ref129$formatArgumen, _ref129$cacheContract = _ref129.cacheContract, cacheContract = _ref129$cacheContract === void 0 ? true : _ref129$cacheContract;
                ValidateAddress(contractAddress);
                _context114.next = 4;
                return this.ethClient.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: methodName,
                  methodArgs: methodArgs,
                  value: value,
                  overrides: overrides,
                  formatArguments: formatArguments,
                  cacheContract: cacheContract,
                  signer: this.signer
                });

              case 4:
                return _context114.abrupt("return", _context114.sent);

              case 5:
              case "end":
                return _context114.stop();
            }
          }
        }, _callee114, this);
      }));

      function CallContractMethod(_x113) {
        return _CallContractMethod.apply(this, arguments);
      }

      return CallContractMethod;
    }()
    /**
     * Call the specified method on a deployed contract and wait for the transaction to be mined.
     * This action will be performed by this client's signer.
     *
     * Use this method to call transaction-performing methods and wait for the transaction to complete.
     *
     * @methodGroup Contracts
     * @namedParams
     * @param {string} contractAddress - Address of the contract to call the specified method on
     * @param {Object} abi - ABI of contract
     * @param {string} methodName - Method to call on the contract
     * @param {Array<string>=} methodArgs=[] - List of arguments to the contract constructor
     * @param {(number | BigNumber)=} value - Amount of ether to include in the transaction
     * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
     * @param {boolean=} formatArguments=true - If specified, the arguments will automatically be formatted to the ABI specification
     *
     * @see Utils.WeiToEther
     *
     * @returns {Promise<*>} - The event object of this transaction. See the ExtractEventFromLogs method for parsing
     * the resulting event(s)
     */

  }, {
    key: "CallContractMethodAndWait",
    value: function () {
      var _CallContractMethodAndWait = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee115(_ref130) {
        var contractAddress, abi, methodName, methodArgs, value, _ref130$overrides, overrides, _ref130$formatArgumen, formatArguments;

        return regeneratorRuntime.wrap(function _callee115$(_context115) {
          while (1) {
            switch (_context115.prev = _context115.next) {
              case 0:
                contractAddress = _ref130.contractAddress, abi = _ref130.abi, methodName = _ref130.methodName, methodArgs = _ref130.methodArgs, value = _ref130.value, _ref130$overrides = _ref130.overrides, overrides = _ref130$overrides === void 0 ? {} : _ref130$overrides, _ref130$formatArgumen = _ref130.formatArguments, formatArguments = _ref130$formatArgumen === void 0 ? true : _ref130$formatArgumen;
                ValidateAddress(contractAddress);
                _context115.next = 4;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: methodName,
                  methodArgs: methodArgs,
                  value: value,
                  overrides: overrides,
                  formatArguments: formatArguments,
                  signer: this.signer
                });

              case 4:
                return _context115.abrupt("return", _context115.sent);

              case 5:
              case "end":
                return _context115.stop();
            }
          }
        }, _callee115, this);
      }));

      function CallContractMethodAndWait(_x114) {
        return _CallContractMethodAndWait.apply(this, arguments);
      }

      return CallContractMethodAndWait;
    }()
    /**
     * Extract the specified event log from the given event obtained from the
     * CallContractAndMethodAndWait method
     *
     * @methodGroup Contracts
     * @namedParams
     * @param {string} contractAddress - Address of the contract to call the specified method on
     * @param {Object} abi - ABI of contract
     * @param {Object} event - Event of the transaction from CallContractMethodAndWait
     * @param {string} eventName - Name of the event to parse
     *
     * @see Utils.WeiToEther
     *
     * @returns {Promise<Object>} - The parsed event log from the event
     */

  }, {
    key: "ExtractEventFromLogs",
    value: function ExtractEventFromLogs(_ref131) {
      var abi = _ref131.abi,
          event = _ref131.event,
          eventName = _ref131.eventName;
      return this.ethClient.ExtractEventFromLogs({
        abi: abi,
        event: event,
        eventName: eventName
      });
    }
    /**
     * Extract the specified value from the specified event log from the given event obtained
     * from the CallContractAndMethodAndWait method
     *
     * @methodGroup Contracts
     * @namedParams
     * @param {string} contractAddress - Address of the contract to call the specified method on
     * @param {Object} abi - ABI of contract
     * @param {Object} event - Event of the transaction from CallContractMethodAndWait
     * @param {string} eventName - Name of the event to parse
     * @param {string} eventValue - Name of the value to extract from the event
     *
     * @returns {Promise<string>} The value extracted from the event
     */

  }, {
    key: "ExtractValueFromEvent",
    value: function ExtractValueFromEvent(_ref132) {
      var abi = _ref132.abi,
          event = _ref132.event,
          eventName = _ref132.eventName,
          eventValue = _ref132.eventValue;
      var eventLog = this.ethClient.ExtractEventFromLogs({
        abi: abi,
        event: event,
        eventName: eventName,
        eventValue: eventValue
      });
      return eventLog ? eventLog.values[eventValue] : undefined;
    }
    /**
     * Set the custom contract of the specified object with the contract at the specified address
     *
     * Note: This also updates the content object metadata with information about the contract - particularly the ABI
     *
     * @methodGroup Contracts
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} customContractAddress - Address of the deployed custom contract
     * @param {string=} name - Optional name of the custom contract
     * @param {string=} description - Optional description of the custom contract
     * @param {Object} abi - ABI of the custom contract
     * @param {Object=} factoryAbi - If the custom contract is a factory, the ABI of the contract it deploys
     * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
     *
     * @returns {Promise<Object>} - Result transaction of calling the setCustomContract method on the content object contract
     */

  }, {
    key: "SetCustomContentContract",
    value: function () {
      var _SetCustomContentContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee116(_ref133) {
        var libraryId, objectId, customContractAddress, name, description, abi, factoryAbi, _ref133$overrides, overrides, setResult, writeToken;

        return regeneratorRuntime.wrap(function _callee116$(_context116) {
          while (1) {
            switch (_context116.prev = _context116.next) {
              case 0:
                libraryId = _ref133.libraryId, objectId = _ref133.objectId, customContractAddress = _ref133.customContractAddress, name = _ref133.name, description = _ref133.description, abi = _ref133.abi, factoryAbi = _ref133.factoryAbi, _ref133$overrides = _ref133.overrides, overrides = _ref133$overrides === void 0 ? {} : _ref133$overrides;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId
                });
                ValidateAddress(customContractAddress);
                customContractAddress = this.utils.FormatAddress(customContractAddress);
                this.Log("Setting custom contract address: ".concat(objectId, " ").concat(customContractAddress));
                _context116.next = 7;
                return this.ethClient.SetCustomContentContract({
                  contentContractAddress: Utils.HashToAddress(objectId),
                  customContractAddress: customContractAddress,
                  overrides: overrides,
                  signer: this.signer
                });

              case 7:
                setResult = _context116.sent;
                _context116.next = 10;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 10:
                writeToken = _context116.sent.write_token;
                _context116.next = 13;
                return this.ReplaceMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  metadataSubtree: "custom_contract",
                  metadata: {
                    name: name,
                    description: description,
                    address: customContractAddress,
                    abi: abi,
                    factoryAbi: factoryAbi
                  }
                });

              case 13:
                _context116.next = 15;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken
                });

              case 15:
                return _context116.abrupt("return", setResult);

              case 16:
              case "end":
                return _context116.stop();
            }
          }
        }, _callee116, this);
      }));

      function SetCustomContentContract(_x115) {
        return _SetCustomContentContract.apply(this, arguments);
      }

      return SetCustomContentContract;
    }()
    /**
     * Get the custom contract of the specified object
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Version hash of the object
     *
     * @returns {Promise<string> | undefined} - If the object has a custom contract, this will return the address of the custom contract
     */

  }, {
    key: "CustomContractAddress",
    value: function () {
      var _CustomContractAddress = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee117(_ref134) {
        var libraryId, objectId, versionHash, customContractAddress;
        return regeneratorRuntime.wrap(function _callee117$(_context117) {
          while (1) {
            switch (_context117.prev = _context117.next) {
              case 0:
                libraryId = _ref134.libraryId, objectId = _ref134.objectId, versionHash = _ref134.versionHash;
                ValidateParameters({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                if (!(libraryId === this.contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId))) {
                  _context117.next = 5;
                  break;
                }

                return _context117.abrupt("return");

              case 5:
                this.Log("Retrieving custom contract address: ".concat(objectId));
                _context117.next = 8;
                return this.ethClient.CallContractMethod({
                  contractAddress: this.utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "contentContractAddress",
                  methodArgs: [],
                  signer: this.signer
                });

              case 8:
                customContractAddress = _context117.sent;

                if (!(customContractAddress === this.utils.nullAddress)) {
                  _context117.next = 11;
                  break;
                }

                return _context117.abrupt("return");

              case 11:
                return _context117.abrupt("return", this.utils.FormatAddress(customContractAddress));

              case 12:
              case "end":
                return _context117.stop();
            }
          }
        }, _callee117, this);
      }));

      function CustomContractAddress(_x116) {
        return _CustomContractAddress.apply(this, arguments);
      }

      return CustomContractAddress;
    }()
  }, {
    key: "FormatBlockNumbers",
    value: function () {
      var _FormatBlockNumbers = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee118(_ref135) {
        var fromBlock, toBlock, _ref135$count, count, latestBlock;

        return regeneratorRuntime.wrap(function _callee118$(_context118) {
          while (1) {
            switch (_context118.prev = _context118.next) {
              case 0:
                fromBlock = _ref135.fromBlock, toBlock = _ref135.toBlock, _ref135$count = _ref135.count, count = _ref135$count === void 0 ? 10 : _ref135$count;
                _context118.next = 3;
                return this.BlockNumber();

              case 3:
                latestBlock = _context118.sent;

                if (!toBlock) {
                  if (!fromBlock) {
                    toBlock = latestBlock;
                    fromBlock = toBlock - count + 1;
                  } else {
                    toBlock = fromBlock + count - 1;
                  }
                } else if (!fromBlock) {
                  fromBlock = toBlock - count + 1;
                } // Ensure block numbers are valid


                if (toBlock > latestBlock) {
                  toBlock = latestBlock;
                }

                if (fromBlock < 0) {
                  fromBlock = 0;
                }

                return _context118.abrupt("return", {
                  fromBlock: fromBlock,
                  toBlock: toBlock
                });

              case 8:
              case "end":
                return _context118.stop();
            }
          }
        }, _callee118, this);
      }));

      function FormatBlockNumbers(_x117) {
        return _FormatBlockNumbers.apply(this, arguments);
      }

      return FormatBlockNumbers;
    }()
    /**
     * Get all events on the specified contract
     *
     * @methodGroup Contracts
     * @namedParams
     * @param {string} contractAddress - The address of the contract
     * @param {object} abi - The ABI of the contract
     * @param {number=} fromBlock - Limit results to events after the specified block (inclusive)
     * @param {number=} toBlock - Limit results to events before the specified block (inclusive)
     * @param {number=} count=1000 - Maximum range of blocks to search (unless both toBlock and fromBlock are specified)
     * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
     * Note: This requires one extra network call per block, so it should not be used for very large ranges
     * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
     */

  }, {
    key: "ContractEvents",
    value: function () {
      var _ContractEvents = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee119(_ref136) {
        var contractAddress, abi, _ref136$fromBlock, fromBlock, toBlock, _ref136$count, count, _ref136$includeTransa, includeTransaction, blocks;

        return regeneratorRuntime.wrap(function _callee119$(_context119) {
          while (1) {
            switch (_context119.prev = _context119.next) {
              case 0:
                contractAddress = _ref136.contractAddress, abi = _ref136.abi, _ref136$fromBlock = _ref136.fromBlock, fromBlock = _ref136$fromBlock === void 0 ? 0 : _ref136$fromBlock, toBlock = _ref136.toBlock, _ref136$count = _ref136.count, count = _ref136$count === void 0 ? 1000 : _ref136$count, _ref136$includeTransa = _ref136.includeTransaction, includeTransaction = _ref136$includeTransa === void 0 ? false : _ref136$includeTransa;
                ValidateAddress(contractAddress);
                _context119.next = 4;
                return this.FormatBlockNumbers({
                  fromBlock: fromBlock,
                  toBlock: toBlock,
                  count: count
                });

              case 4:
                blocks = _context119.sent;
                this.Log("Querying contract events ".concat(contractAddress, " - Blocks ").concat(blocks.fromBlock, " to ").concat(blocks.toBlock));
                _context119.next = 8;
                return this.ethClient.ContractEvents({
                  contractAddress: contractAddress,
                  abi: abi,
                  fromBlock: blocks.fromBlock,
                  toBlock: blocks.toBlock,
                  includeTransaction: includeTransaction
                });

              case 8:
                return _context119.abrupt("return", _context119.sent);

              case 9:
              case "end":
                return _context119.stop();
            }
          }
        }, _callee119, this);
      }));

      function ContractEvents(_x118) {
        return _ContractEvents.apply(this, arguments);
      }

      return ContractEvents;
    }() // TODO: Not implemented in contracts

  }, {
    key: "WithdrawContractFunds",
    value: function () {
      var _WithdrawContractFunds = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee120(_ref137) {
        var contractAddress, abi, ether;
        return regeneratorRuntime.wrap(function _callee120$(_context120) {
          while (1) {
            switch (_context120.prev = _context120.next) {
              case 0:
                contractAddress = _ref137.contractAddress, abi = _ref137.abi, ether = _ref137.ether;
                ValidateAddress(contractAddress);
                _context120.next = 4;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: "transfer",
                  methodArgs: [this.signer.address, Ethers.utils.parseEther(ether.toString())],
                  signer: this.signer
                });

              case 4:
                return _context120.abrupt("return", _context120.sent);

              case 5:
              case "end":
                return _context120.stop();
            }
          }
        }, _callee120, this);
      }));

      function WithdrawContractFunds(_x119) {
        return _WithdrawContractFunds.apply(this, arguments);
      }

      return WithdrawContractFunds;
    }()
    /* Other blockchain operations */

    /**
     * Get events from the blockchain in reverse chronological order, starting from toBlock. This will also attempt
     * to identify and parse any known Eluvio contract methods. If successful, the method name, signature, and input
     * values will be included in the log entry.
     *
     * @methodGroup Contracts
     * @namedParams
     * @param {number=} toBlock - Limit results to events before the specified block (inclusive) - If not specified, will start from latest block
     * @param {number=} fromBlock - Limit results to events after the specified block (inclusive)
     * @param {number=} count=10 - Max number of events to include (unless both toBlock and fromBlock are specified)
     * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
     * Note: This requires two extra network calls per transaction, so it should not be used for very large ranges
     * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
     */

  }, {
    key: "Events",
    value: function () {
      var _Events = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee121() {
        var _ref138,
            toBlock,
            fromBlock,
            _ref138$count,
            count,
            _ref138$includeTransa,
            includeTransaction,
            blocks,
            _args121 = arguments;

        return regeneratorRuntime.wrap(function _callee121$(_context121) {
          while (1) {
            switch (_context121.prev = _context121.next) {
              case 0:
                _ref138 = _args121.length > 0 && _args121[0] !== undefined ? _args121[0] : {}, toBlock = _ref138.toBlock, fromBlock = _ref138.fromBlock, _ref138$count = _ref138.count, count = _ref138$count === void 0 ? 10 : _ref138$count, _ref138$includeTransa = _ref138.includeTransaction, includeTransaction = _ref138$includeTransa === void 0 ? false : _ref138$includeTransa;
                _context121.next = 3;
                return this.FormatBlockNumbers({
                  fromBlock: fromBlock,
                  toBlock: toBlock,
                  count: count
                });

              case 3:
                blocks = _context121.sent;
                this.Log("Querying events - Blocks ".concat(blocks.fromBlock, " to ").concat(blocks.toBlock));
                _context121.next = 7;
                return this.ethClient.Events({
                  fromBlock: blocks.fromBlock,
                  toBlock: blocks.toBlock,
                  includeTransaction: includeTransaction
                });

              case 7:
                return _context121.abrupt("return", _context121.sent);

              case 8:
              case "end":
                return _context121.stop();
            }
          }
        }, _callee121, this);
      }));

      function Events() {
        return _Events.apply(this, arguments);
      }

      return Events;
    }()
  }, {
    key: "BlockNumber",
    value: function () {
      var _BlockNumber = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee122() {
        return regeneratorRuntime.wrap(function _callee122$(_context122) {
          while (1) {
            switch (_context122.prev = _context122.next) {
              case 0:
                _context122.next = 2;
                return this.ethClient.MakeProviderCall({
                  methodName: "getBlockNumber"
                });

              case 2:
                return _context122.abrupt("return", _context122.sent);

              case 3:
              case "end":
                return _context122.stop();
            }
          }
        }, _callee122, this);
      }));

      function BlockNumber() {
        return _BlockNumber.apply(this, arguments);
      }

      return BlockNumber;
    }()
    /**
     * Get the balance (in ether) of the specified address
     *
     * @methodGroup Signers
     * @namedParams
     * @param {string} address - Address to query
     *
     * @returns {Promise<string>} - Balance of the account, in ether (as string)
     */

  }, {
    key: "GetBalance",
    value: function () {
      var _GetBalance = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee123(_ref139) {
        var address, balance;
        return regeneratorRuntime.wrap(function _callee123$(_context123) {
          while (1) {
            switch (_context123.prev = _context123.next) {
              case 0:
                address = _ref139.address;
                ValidateAddress(address);
                _context123.next = 4;
                return this.ethClient.MakeProviderCall({
                  methodName: "getBalance",
                  args: [address]
                });

              case 4:
                balance = _context123.sent;
                return _context123.abrupt("return", Ethers.utils.formatEther(balance));

              case 6:
              case "end":
                return _context123.stop();
            }
          }
        }, _callee123, this);
      }));

      function GetBalance(_x120) {
        return _GetBalance.apply(this, arguments);
      }

      return GetBalance;
    }()
    /**
     * Send ether from this client's current signer to the specified recipient address
     *
     * @methodGroup Signers
     * @namedParams
     * @param {string} recipient - Address of the recipient
     * @param {number} ether - Amount of ether to send
     *
     * @returns {Promise<Object>} - The transaction receipt
     */

  }, {
    key: "SendFunds",
    value: function () {
      var _SendFunds = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee124(_ref140) {
        var recipient, ether, transaction;
        return regeneratorRuntime.wrap(function _callee124$(_context124) {
          while (1) {
            switch (_context124.prev = _context124.next) {
              case 0:
                recipient = _ref140.recipient, ether = _ref140.ether;
                ValidateAddress(recipient);
                _context124.next = 4;
                return this.signer.sendTransaction({
                  to: recipient,
                  value: Ethers.utils.parseEther(ether.toString())
                });

              case 4:
                transaction = _context124.sent;
                _context124.next = 7;
                return transaction.wait();

              case 7:
                return _context124.abrupt("return", _context124.sent);

              case 8:
              case "end":
                return _context124.stop();
            }
          }
        }, _callee124, this);
      }));

      function SendFunds(_x121) {
        return _SendFunds.apply(this, arguments);
      }

      return SendFunds;
    }()
    /* FrameClient related */
    // Whitelist of methods allowed to be called using the frame API

  }, {
    key: "FrameAllowedMethods",
    value: function FrameAllowedMethods() {
      var forbiddenMethods = ["constructor", "AccessGroupMembershipMethod", "CallFromFrameMessage", "ClearSigner", "FormatBlockNumbers", "FrameAllowedMethods", "FromConfigurationUrl", "GenerateWallet", "InitializeClients", "Log", "SetSigner", "SetSignerFromWeb3Provider", "ToggleLogging"];
      return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (method) {
        return !forbiddenMethods.includes(method);
      });
    } // Call a method specified in a message from a frame

  }, {
    key: "CallFromFrameMessage",
    value: function () {
      var _CallFromFrameMessage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee125(message, Respond) {
        var _this11 = this;

        var callback, method, methodResults, responseError;
        return regeneratorRuntime.wrap(function _callee125$(_context125) {
          while (1) {
            switch (_context125.prev = _context125.next) {
              case 0:
                if (!(message.type !== "ElvFrameRequest")) {
                  _context125.next = 2;
                  break;
                }

                return _context125.abrupt("return");

              case 2:
                if (message.callbackId) {
                  callback = function callback(result) {
                    Respond(_this11.utils.MakeClonable({
                      type: "ElvFrameResponse",
                      requestId: message.callbackId,
                      response: result
                    }));
                  };

                  message.args.callback = callback;
                }

                _context125.prev = 3;
                method = message.calledMethod;

                if (!(message.module === "userProfileClient")) {
                  _context125.next = 13;
                  break;
                }

                if (this.userProfileClient.FrameAllowedMethods().includes(method)) {
                  _context125.next = 8;
                  break;
                }

                throw Error("Invalid user profile method: " + method);

              case 8:
                _context125.next = 10;
                return this.userProfileClient[method](message.args);

              case 10:
                methodResults = _context125.sent;
                _context125.next = 18;
                break;

              case 13:
                if (this.FrameAllowedMethods().includes(method)) {
                  _context125.next = 15;
                  break;
                }

                throw Error("Invalid method: " + method);

              case 15:
                _context125.next = 17;
                return this[method](message.args);

              case 17:
                methodResults = _context125.sent;

              case 18:
                Respond(this.utils.MakeClonable({
                  type: "ElvFrameResponse",
                  requestId: message.requestId,
                  response: methodResults
                }));
                _context125.next = 27;
                break;

              case 21:
                _context125.prev = 21;
                _context125.t0 = _context125["catch"](3);
                // eslint-disable-next-line no-console
                this.Log("Frame Message Error:\n        Method: ".concat(message.calledMethod, "\n        Arguments: ").concat(JSON.stringify(message.args, null, 2), "\n        Error: ").concat(_typeof(_context125.t0) === "object" ? JSON.stringify(_context125.t0, null, 2) : _context125.t0), true); // eslint-disable-next-line no-console

                console.error(_context125.t0);
                responseError = _context125.t0 instanceof Error ? _context125.t0.message : _context125.t0;
                Respond(this.utils.MakeClonable({
                  type: "ElvFrameResponse",
                  requestId: message.requestId,
                  error: responseError
                }));

              case 27:
              case "end":
                return _context125.stop();
            }
          }
        }, _callee125, this, [[3, 21]]);
      }));

      function CallFromFrameMessage(_x122, _x123) {
        return _CallFromFrameMessage.apply(this, arguments);
      }

      return CallFromFrameMessage;
    }()
  }], [{
    key: "Configuration",
    value: function () {
      var _Configuration = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee126(_ref141) {
        var configUrl, region, httpClient, fabricInfo, filterHTTPS, fabricURIs, ethereumURIs;
        return regeneratorRuntime.wrap(function _callee126$(_context126) {
          while (1) {
            switch (_context126.prev = _context126.next) {
              case 0:
                configUrl = _ref141.configUrl, region = _ref141.region;
                _context126.prev = 1;
                httpClient = new HttpClient({
                  uris: [configUrl]
                });
                _context126.next = 5;
                return ResponseToJson(httpClient.Request({
                  method: "GET",
                  path: "/config",
                  queryParams: region ? {
                    elvgeo: region
                  } : ""
                }));

              case 5:
                fabricInfo = _context126.sent;

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
                }

                return _context126.abrupt("return", {
                  nodeId: fabricInfo.node_id,
                  contentSpaceId: fabricInfo.qspace.id,
                  fabricURIs: fabricURIs,
                  ethereumURIs: ethereumURIs
                });

              case 14:
                _context126.prev = 14;
                _context126.t0 = _context126["catch"](1);
                // eslint-disable-next-line no-console
                console.error("Error retrieving fabric configuration:"); // eslint-disable-next-line no-console

                console.error(_context126.t0);
                throw _context126.t0;

              case 19:
              case "end":
                return _context126.stop();
            }
          }
        }, _callee126, null, [[1, 14]]);
      }));

      function Configuration(_x124) {
        return _Configuration.apply(this, arguments);
      }

      return Configuration;
    }()
    /**
     * Create a new ElvClient from the specified configuration URL
     *
     * @methodGroup Constructor
     * @namedParams
     * @param {string} configUrl - Full URL to the config endpoint
     * @param {string=} region - Preferred region - the fabric will auto-detect the best region if not specified
     * - Available regions: na-west-north na-west-south na-east eu-west
     * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
     * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
     *
     * @return {Promise<ElvClient>} - New ElvClient connected to the specified content fabric and blockchain
     */

  }, {
    key: "FromConfigurationUrl",
    value: function () {
      var _FromConfigurationUrl = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee127(_ref142) {
        var configUrl, region, _ref142$noCache, noCache, _ref142$noAuth, noAuth, _ref143, contentSpaceId, fabricURIs, ethereumURIs, client;

        return regeneratorRuntime.wrap(function _callee127$(_context127) {
          while (1) {
            switch (_context127.prev = _context127.next) {
              case 0:
                configUrl = _ref142.configUrl, region = _ref142.region, _ref142$noCache = _ref142.noCache, noCache = _ref142$noCache === void 0 ? false : _ref142$noCache, _ref142$noAuth = _ref142.noAuth, noAuth = _ref142$noAuth === void 0 ? false : _ref142$noAuth;
                _context127.next = 3;
                return ElvClient.Configuration({
                  configUrl: configUrl,
                  region: region
                });

              case 3:
                _ref143 = _context127.sent;
                contentSpaceId = _ref143.contentSpaceId;
                fabricURIs = _ref143.fabricURIs;
                ethereumURIs = _ref143.ethereumURIs;
                client = new ElvClient({
                  contentSpaceId: contentSpaceId,
                  fabricURIs: fabricURIs,
                  ethereumURIs: ethereumURIs,
                  noCache: noCache,
                  noAuth: noAuth
                });
                client.configUrl = configUrl;
                return _context127.abrupt("return", client);

              case 10:
              case "end":
                return _context127.stop();
            }
          }
        }, _callee127);
      }));

      function FromConfigurationUrl(_x125) {
        return _FromConfigurationUrl.apply(this, arguments);
      }

      return FromConfigurationUrl;
    }()
  }]);

  return ElvClient;
}();

exports.ElvClient = ElvClient;