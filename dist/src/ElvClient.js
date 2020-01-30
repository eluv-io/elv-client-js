"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

require("@babel/polyfill");

if (typeof Buffer === "undefined") {
  Buffer = require("buffer/").Buffer;
}

var UrlJoin = require("url-join");

var URI = require("urijs");

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

var AccessIndexorContract = require("./contracts/AccessIndexor");

var _require = require("./Validation"),
    ValidatePresence = _require.ValidatePresence,
    ValidateLibrary = _require.ValidateLibrary,
    ValidateObject = _require.ValidateObject,
    ValidateVersion = _require.ValidateVersion,
    ValidateWriteToken = _require.ValidateWriteToken,
    ValidatePartHash = _require.ValidatePartHash,
    ValidateAddress = _require.ValidateAddress,
    ValidateParameters = _require.ValidateParameters;

var fs; // Platform specific polyfills

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
    fs = require("fs");
    break;
}

var ResponseToJson = function ResponseToJson(response) {
  return regeneratorRuntime.async(function ResponseToJson$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          return _context.abrupt("return", ResponseToFormat("json", response));

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
};

var ResponseToFormat = function ResponseToFormat(format, response) {
  return regeneratorRuntime.async(function ResponseToFormat$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(response);

        case 2:
          response = _context2.sent;
          _context2.t0 = format.toLowerCase();
          _context2.next = _context2.t0 === "json" ? 6 : _context2.t0 === "text" ? 9 : _context2.t0 === "blob" ? 12 : _context2.t0 === "arraybuffer" ? 15 : _context2.t0 === "formdata" ? 18 : _context2.t0 === "buffer" ? 21 : 24;
          break;

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(response.json());

        case 8:
          return _context2.abrupt("return", _context2.sent);

        case 9:
          _context2.next = 11;
          return regeneratorRuntime.awrap(response.text());

        case 11:
          return _context2.abrupt("return", _context2.sent);

        case 12:
          _context2.next = 14;
          return regeneratorRuntime.awrap(response.blob());

        case 14:
          return _context2.abrupt("return", _context2.sent);

        case 15:
          _context2.next = 17;
          return regeneratorRuntime.awrap(response.arrayBuffer());

        case 17:
          return _context2.abrupt("return", _context2.sent);

        case 18:
          _context2.next = 20;
          return regeneratorRuntime.awrap(response.formData());

        case 20:
          return _context2.abrupt("return", _context2.sent);

        case 21:
          _context2.next = 23;
          return regeneratorRuntime.awrap(response.buffer());

        case 23:
          return _context2.abrupt("return", _context2.sent);

        case 24:
          return _context2.abrupt("return", response);

        case 25:
        case "end":
          return _context2.stop();
      }
    }
  });
};

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

  function ElvClient(_ref) {
    var contentSpaceId = _ref.contentSpaceId,
        fabricURIs = _ref.fabricURIs,
        ethereumURIs = _ref.ethereumURIs,
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
      this.objectLibraryIds = {};
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
    value: function UseRegion(_ref2) {
      var region, _ref3, fabricURIs, ethereumURIs;

      return regeneratorRuntime.async(function UseRegion$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              region = _ref2.region;

              if (this.configUrl) {
                _context3.next = 3;
                break;
              }

              throw Error("Unable to change region: Configuration URL not set");

            case 3:
              _context3.next = 5;
              return regeneratorRuntime.awrap(ElvClient.Configuration({
                configUrl: this.configUrl,
                region: region
              }));

            case 5:
              _ref3 = _context3.sent;
              fabricURIs = _ref3.fabricURIs;
              ethereumURIs = _ref3.ethereumURIs;
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
      return regeneratorRuntime.async(function ResetRegion$(_context4) {
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
              return regeneratorRuntime.awrap(this.UseRegion({
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
    value: function NodeId(_ref4) {
      var region, _ref5, nodeId;

      return regeneratorRuntime.async(function NodeId$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              region = _ref4.region;
              _context5.next = 3;
              return regeneratorRuntime.awrap(ElvClient.Configuration({
                configUrl: this.configUrl,
                region: region
              }));

            case 3:
              _ref5 = _context5.sent;
              nodeId = _ref5.nodeId;
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
    value: function SetSignerFromWeb3Provider(_ref8) {
      var provider, ethProvider;
      return regeneratorRuntime.async(function SetSignerFromWeb3Provider$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              provider = _ref8.provider;
              ethProvider = new Ethers.providers.Web3Provider(provider);
              ethProvider.pollingInterval = 250;
              this.signer = ethProvider.getSigner();
              _context6.next = 6;
              return regeneratorRuntime.awrap(this.signer.getAddress());

            case 6:
              this.signer.address = _context6.sent;
              _context6.next = 9;
              return regeneratorRuntime.awrap(this.InitializeClients());

            case 9:
            case "end":
              return _context6.stop();
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
  }, {
    key: "SetOauthToken",
    value: function SetOauthToken(_ref9) {
      var token = _ref9.token;
      this.oauthToken = token;
      var wallet = this.GenerateWallet();
      var signer = wallet.AddAccountFromMnemonic({
        mnemonic: wallet.GenerateMnemonic()
      });
      this.SetSigner({
        signer: signer
      });
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
    value: function DefaultKMSAddress() {
      return regeneratorRuntime.async(function DefaultKMSAddress$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return regeneratorRuntime.awrap(this.CallContractMethod({
                contractAddress: this.contentSpaceAddress,
                abi: SpaceContract.abi,
                methodName: "addressKMS"
              }));

            case 2:
              return _context7.abrupt("return", _context7.sent);

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
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
    value: function CreateContentSpace(_ref10) {
      var name, contentSpaceAddress;
      return regeneratorRuntime.async(function CreateContentSpace$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              name = _ref10.name;
              _context8.next = 3;
              return regeneratorRuntime.awrap(this.ethClient.DeployContentSpaceContract({
                name: name,
                signer: this.signer
              }));

            case 3:
              contentSpaceAddress = _context8.sent;
              return _context8.abrupt("return", Utils.AddressToSpaceId(contentSpaceAddress));

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentLibraries() {
      var _this = this;

      var libraryAddresses;
      return regeneratorRuntime.async(function ContentLibraries$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return regeneratorRuntime.awrap(this.Collection({
                collectionType: "libraries"
              }));

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
      }, null, this);
    }
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
    value: function ContentLibrary(_ref11) {
      var libraryId, path, library;
      return regeneratorRuntime.async(function ContentLibrary$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              libraryId = _ref11.libraryId;
              ValidateLibrary(libraryId);
              path = UrlJoin("qlibs", libraryId);
              _context10.t0 = regeneratorRuntime;
              _context10.t1 = ResponseToJson;
              _context10.t2 = this.HttpClient;
              _context10.next = 8;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId
              }));

            case 8:
              _context10.t3 = _context10.sent;
              _context10.t4 = path;
              _context10.t5 = {
                headers: _context10.t3,
                method: "GET",
                path: _context10.t4
              };
              _context10.t6 = _context10.t2.Request.call(_context10.t2, _context10.t5);
              _context10.t7 = (0, _context10.t1)(_context10.t6);
              _context10.next = 15;
              return _context10.t0.awrap.call(_context10.t0, _context10.t7);

            case 15:
              library = _context10.sent;
              return _context10.abrupt("return", _objectSpread({}, library, {
                meta: library.meta || {}
              }));

            case 17:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentLibraryOwner(_ref12) {
      var libraryId;
      return regeneratorRuntime.async(function ContentLibraryOwner$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              libraryId = _ref12.libraryId;
              ValidateLibrary(libraryId);
              _context11.t0 = this.utils;
              _context11.next = 5;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
                contractAddress: Utils.HashToAddress(libraryId),
                abi: LibraryContract.abi,
                methodName: "owner",
                methodArgs: [],
                signer: this.signer
              }));

            case 5:
              _context11.t1 = _context11.sent;
              return _context11.abrupt("return", _context11.t0.FormatAddress.call(_context11.t0, _context11.t1));

            case 7:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this);
    }
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
    value: function CreateContentLibrary(_ref13) {
      var name, description, image, _ref13$metadata, metadata, kmsId, _ref14, contractAddress, libraryId, objectId, editResponse;

      return regeneratorRuntime.async(function CreateContentLibrary$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              name = _ref13.name, description = _ref13.description, image = _ref13.image, _ref13$metadata = _ref13.metadata, metadata = _ref13$metadata === void 0 ? {} : _ref13$metadata, kmsId = _ref13.kmsId;

              if (kmsId) {
                _context12.next = 9;
                break;
              }

              _context12.t0 = "ikms";
              _context12.t1 = this.utils;
              _context12.next = 6;
              return regeneratorRuntime.awrap(this.DefaultKMSAddress());

            case 6:
              _context12.t2 = _context12.sent;
              _context12.t3 = _context12.t1.AddressToHash.call(_context12.t1, _context12.t2);
              kmsId = _context12.t0.concat.call(_context12.t0, _context12.t3);

            case 9:
              this.Log("Creating content library");
              this.Log("KMS ID: ".concat(kmsId));
              _context12.next = 13;
              return regeneratorRuntime.awrap(this.authClient.CreateContentLibrary({
                kmsId: kmsId
              }));

            case 13:
              _ref14 = _context12.sent;
              contractAddress = _ref14.contractAddress;
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
              return regeneratorRuntime.awrap(this.EditContentObject({
                libraryId: libraryId,
                objectId: objectId,
                options: {
                  type: "library"
                }
              }));

            case 22:
              editResponse = _context12.sent;
              _context12.next = 25;
              return regeneratorRuntime.awrap(this.ReplaceMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadata: metadata,
                writeToken: editResponse.write_token
              }));

            case 25:
              _context12.next = 27;
              return regeneratorRuntime.awrap(this.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editResponse.write_token
              }));

            case 27:
              if (!image) {
                _context12.next = 30;
                break;
              }

              _context12.next = 30;
              return regeneratorRuntime.awrap(this.SetContentLibraryImage({
                libraryId: libraryId,
                image: image
              }));

            case 30:
              this.Log("Library ".concat(libraryId, " created"));
              return _context12.abrupt("return", libraryId);

            case 32:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this);
    }
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
    value: function SetContentLibraryImage(_ref15) {
      var libraryId, image, objectId;
      return regeneratorRuntime.async(function SetContentLibraryImage$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              libraryId = _ref15.libraryId, image = _ref15.image;
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
      }, null, this);
    }
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
    value: function SetContentObjectImage(_ref16) {
      var libraryId, objectId, image, editResponse, uploadResponse;
      return regeneratorRuntime.async(function SetContentObjectImage$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              libraryId = _ref16.libraryId, objectId = _ref16.objectId, image = _ref16.image;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              _context14.next = 4;
              return regeneratorRuntime.awrap(this.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 4:
              editResponse = _context14.sent;
              _context14.next = 7;
              return regeneratorRuntime.awrap(this.UploadPart({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editResponse.write_token,
                data: image,
                encrypted: false
              }));

            case 7:
              uploadResponse = _context14.sent;
              _context14.next = 10;
              return regeneratorRuntime.awrap(this.MergeMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editResponse.write_token,
                metadata: {
                  "image": uploadResponse.part.hash
                }
              }));

            case 10:
              _context14.next = 12;
              return regeneratorRuntime.awrap(this.MergeMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editResponse.write_token,
                metadataSubtree: "public",
                metadata: {
                  "image": uploadResponse.part.hash
                }
              }));

            case 12:
              _context14.next = 14;
              return regeneratorRuntime.awrap(this.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editResponse.write_token
              }));

            case 14:
            case "end":
              return _context14.stop();
          }
        }
      }, null, this);
    }
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
    value: function DeleteContentLibrary(_ref17) {
      var libraryId, path, authorizationHeader;
      return regeneratorRuntime.async(function DeleteContentLibrary$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              libraryId = _ref17.libraryId;
              ValidateLibrary(libraryId);
              path = UrlJoin("qlibs", libraryId);
              _context15.next = 5;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                update: true
              }));

            case 5:
              authorizationHeader = _context15.sent;
              _context15.next = 8;
              return regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: Utils.HashToAddress(libraryId),
                abi: LibraryContract.abi,
                methodName: "kill",
                methodArgs: []
              }));

            case 8:
              _context15.next = 10;
              return regeneratorRuntime.awrap(this.HttpClient.Request({
                headers: authorizationHeader,
                method: "DELETE",
                path: path
              }));

            case 10:
            case "end":
              return _context15.stop();
          }
        }
      }, null, this);
    }
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
    value: function AddLibraryContentType(_ref18) {
      var libraryId, typeId, typeName, typeHash, customContractAddress, type, typeAddress, event;
      return regeneratorRuntime.async(function AddLibraryContentType$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              libraryId = _ref18.libraryId, typeId = _ref18.typeId, typeName = _ref18.typeName, typeHash = _ref18.typeHash, customContractAddress = _ref18.customContractAddress;
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
              return regeneratorRuntime.awrap(this.ContentType({
                name: typeName
              }));

            case 7:
              type = _context16.sent;
              typeId = type.id;

            case 9:
              this.Log("Type ID: ".concat(typeId));
              typeAddress = this.utils.HashToAddress(typeId);
              customContractAddress = customContractAddress || this.utils.nullAddress;
              _context16.next = 14;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
                contractAddress: Utils.HashToAddress(libraryId),
                abi: LibraryContract.abi,
                methodName: "addContentType",
                methodArgs: [typeAddress, customContractAddress],
                signer: this.signer
              }));

            case 14:
              event = _context16.sent;
              return _context16.abrupt("return", event.transactionHash);

            case 16:
            case "end":
              return _context16.stop();
          }
        }
      }, null, this);
    }
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
    value: function RemoveLibraryContentType(_ref19) {
      var libraryId, typeId, typeName, typeHash, type, typeAddress, event;
      return regeneratorRuntime.async(function RemoveLibraryContentType$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              libraryId = _ref19.libraryId, typeId = _ref19.typeId, typeName = _ref19.typeName, typeHash = _ref19.typeHash;
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
              return regeneratorRuntime.awrap(this.ContentType({
                name: typeName
              }));

            case 7:
              type = _context17.sent;
              typeId = type.id;

            case 9:
              this.Log("Type ID: ".concat(typeId));
              typeAddress = this.utils.HashToAddress(typeId);
              _context17.next = 13;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
                contractAddress: Utils.HashToAddress(libraryId),
                abi: LibraryContract.abi,
                methodName: "removeContentType",
                methodArgs: [typeAddress],
                signer: this.signer
              }));

            case 13:
              event = _context17.sent;
              return _context17.abrupt("return", event.transactionHash);

            case 15:
            case "end":
              return _context17.stop();
          }
        }
      }, null, this);
    }
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
    value: function LibraryContentTypes(_ref20) {
      var _this2 = this;

      var libraryId, typesLength, allowedTypes;
      return regeneratorRuntime.async(function LibraryContentTypes$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              libraryId = _ref20.libraryId;
              ValidateLibrary(libraryId);
              this.Log("Retrieving library content types for ".concat(libraryId));
              _context19.next = 5;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
                contractAddress: Utils.HashToAddress(libraryId),
                abi: LibraryContract.abi,
                methodName: "contentTypesLength",
                methodArgs: [],
                signer: this.signer
              }));

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
              return regeneratorRuntime.awrap(Promise.all(Array.from(new Array(typesLength), function _callee(_, i) {
                var typeAddress, typeId;
                return regeneratorRuntime.async(function _callee$(_context18) {
                  while (1) {
                    switch (_context18.prev = _context18.next) {
                      case 0:
                        _context18.next = 2;
                        return regeneratorRuntime.awrap(_this2.ethClient.CallContractMethod({
                          contractAddress: Utils.HashToAddress(libraryId),
                          abi: LibraryContract.abi,
                          methodName: "contentTypes",
                          methodArgs: [i],
                          signer: _this2.signer
                        }));

                      case 2:
                        typeAddress = _context18.sent;
                        typeId = _this2.utils.AddressToObjectId(typeAddress);
                        _context18.next = 6;
                        return regeneratorRuntime.awrap(_this2.ContentType({
                          typeId: typeId
                        }));

                      case 6:
                        allowedTypes[typeId] = _context18.sent;

                      case 7:
                      case "end":
                        return _context18.stop();
                    }
                  }
                });
              })));

            case 12:
              this.Log(allowedTypes);
              return _context19.abrupt("return", allowedTypes);

            case 14:
            case "end":
              return _context19.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentTypeOwner(_ref21) {
      var name, typeId, versionHash, contentType;
      return regeneratorRuntime.async(function ContentTypeOwner$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              name = _ref21.name, typeId = _ref21.typeId, versionHash = _ref21.versionHash;
              _context20.next = 3;
              return regeneratorRuntime.awrap(this.ContentType({
                name: name,
                typeId: typeId,
                versionHash: versionHash
              }));

            case 3:
              contentType = _context20.sent;
              _context20.t0 = this.utils;
              _context20.next = 7;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
                contractAddress: Utils.HashToAddress(contentType.id),
                abi: ContentTypeContract.abi,
                methodName: "owner",
                methodArgs: [],
                signer: this.signer
              }));

            case 7:
              _context20.t1 = _context20.sent;
              return _context20.abrupt("return", _context20.t0.FormatAddress.call(_context20.t0, _context20.t1));

            case 9:
            case "end":
              return _context20.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentType(_ref22) {
      var name, typeId, versionHash, types, typeInfo, metadata;
      return regeneratorRuntime.async(function ContentType$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              name = _ref22.name, typeId = _ref22.typeId, versionHash = _ref22.versionHash;
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
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: this.contentSpaceLibraryId,
                objectId: this.contentSpaceObjectId,
                metadataSubtree: UrlJoin("contentTypes", name)
              }));

            case 7:
              typeId = _context21.sent;

            case 8:
              if (typeId) {
                _context21.next = 18;
                break;
              }

              this.Log("Looking up type by name in available types...");
              _context21.next = 12;
              return regeneratorRuntime.awrap(this.ContentTypes());

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
              return regeneratorRuntime.awrap(this.ContentObject({
                libraryId: this.contentSpaceLibraryId,
                objectId: typeId
              }));

            case 22:
              typeInfo = _context21.sent;
              delete typeInfo.type;
              _context21.next = 26;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: this.contentSpaceLibraryId,
                objectId: typeId
              }));

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
      }, null, this, [[18, 33]]);
    }
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
    value: function ContentTypes() {
      var _this3 = this;

      var typeAddresses, contentSpaceTypes, contentSpaceTypeAddresses;
      return regeneratorRuntime.async(function ContentTypes$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              this.contentTypes = this.contentTypes || {};
              this.Log("Looking up all available content types"); // Personally available types

              _context23.next = 4;
              return regeneratorRuntime.awrap(this.Collection({
                collectionType: "contentTypes"
              }));

            case 4:
              typeAddresses = _context23.sent;
              this.Log("Personally available types:");
              this.Log(typeAddresses); // Content space types

              _context23.next = 9;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: this.contentSpaceLibraryId,
                objectId: this.contentSpaceObjectId,
                metadataSubtree: "contentTypes"
              }));

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
              return regeneratorRuntime.awrap(Promise.all(typeAddresses.map(function _callee2(typeAddress) {
                var typeId;
                return regeneratorRuntime.async(function _callee2$(_context22) {
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
                        return regeneratorRuntime.awrap(_this3.ContentType({
                          typeId: typeId
                        }));

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
                }, null, null, [[2, 8]]);
              })));

            case 19:
              return _context23.abrupt("return", this.contentTypes);

            case 20:
            case "end":
              return _context23.stop();
          }
        }
      }, null, this);
    }
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
    value: function CreateContentType(_ref23) {
      var name, _ref23$metadata, metadata, bitcode, _ref24, contractAddress, objectId, path, createResponse, uploadResponse;

      return regeneratorRuntime.async(function CreateContentType$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              name = _ref23.name, _ref23$metadata = _ref23.metadata, metadata = _ref23$metadata === void 0 ? {} : _ref23$metadata, bitcode = _ref23.bitcode;
              this.Log("Creating content type: ".concat(name));
              metadata.name = name;
              metadata["public"] = _objectSpread({
                name: name
              }, metadata["public"] || {});
              _context24.next = 6;
              return regeneratorRuntime.awrap(this.authClient.CreateContentType());

            case 6:
              _ref24 = _context24.sent;
              contractAddress = _ref24.contractAddress;
              objectId = this.utils.AddressToObjectId(contractAddress);
              path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);
              this.Log("Created type: ".concat(contractAddress, " ").concat(objectId));
              /* Create object, upload bitcode and finalize */

              _context24.t0 = regeneratorRuntime;
              _context24.t1 = ResponseToJson;
              _context24.t2 = this.HttpClient;
              _context24.next = 16;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: this.contentSpaceLibraryId,
                objectId: objectId,
                update: true
              }));

            case 16:
              _context24.t3 = _context24.sent;
              _context24.t4 = path;
              _context24.t5 = {
                headers: _context24.t3,
                method: "POST",
                path: _context24.t4,
                failover: false
              };
              _context24.t6 = _context24.t2.Request.call(_context24.t2, _context24.t5);
              _context24.t7 = (0, _context24.t1)(_context24.t6);
              _context24.next = 23;
              return _context24.t0.awrap.call(_context24.t0, _context24.t7);

            case 23:
              createResponse = _context24.sent;
              _context24.next = 26;
              return regeneratorRuntime.awrap(this.ReplaceMetadata({
                libraryId: this.contentSpaceLibraryId,
                objectId: objectId,
                writeToken: createResponse.write_token,
                metadata: metadata
              }));

            case 26:
              if (!bitcode) {
                _context24.next = 32;
                break;
              }

              _context24.next = 29;
              return regeneratorRuntime.awrap(this.UploadPart({
                libraryId: this.contentSpaceLibraryId,
                objectId: objectId,
                writeToken: createResponse.write_token,
                data: bitcode,
                encrypted: false
              }));

            case 29:
              uploadResponse = _context24.sent;
              _context24.next = 32;
              return regeneratorRuntime.awrap(this.ReplaceMetadata({
                libraryId: this.contentSpaceLibraryId,
                objectId: objectId,
                writeToken: createResponse.write_token,
                metadataSubtree: "bitcode_part",
                metadata: uploadResponse.part.hash
              }));

            case 32:
              _context24.next = 34;
              return regeneratorRuntime.awrap(this.FinalizeContentObject({
                libraryId: this.contentSpaceLibraryId,
                objectId: objectId,
                writeToken: createResponse.write_token
              }));

            case 34:
              return _context24.abrupt("return", objectId);

            case 35:
            case "end":
              return _context24.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentObjects(_ref25) {
      var libraryId, _ref25$filterOptions, filterOptions, path, queryParams, filterTypeMap, addFilter;

      return regeneratorRuntime.async(function ContentObjects$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              libraryId = _ref25.libraryId, _ref25$filterOptions = _ref25.filterOptions, filterOptions = _ref25$filterOptions === void 0 ? {} : _ref25$filterOptions;
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

              addFilter = function addFilter(_ref26) {
                var key = _ref26.key,
                    type = _ref26.type,
                    filter = _ref26.filter;
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
              _context25.t0 = regeneratorRuntime;
              _context25.t1 = ResponseToJson;
              _context25.t2 = this.HttpClient;
              _context25.next = 21;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId
              }));

            case 21:
              _context25.t3 = _context25.sent;
              _context25.t4 = path;
              _context25.t5 = queryParams;
              _context25.t6 = {
                headers: _context25.t3,
                method: "GET",
                path: _context25.t4,
                queryParams: _context25.t5
              };
              _context25.t7 = _context25.t2.Request.call(_context25.t2, _context25.t6);
              _context25.t8 = (0, _context25.t1)(_context25.t7);
              _context25.next = 29;
              return _context25.t0.awrap.call(_context25.t0, _context25.t8);

            case 29:
              return _context25.abrupt("return", _context25.sent);

            case 30:
            case "end":
              return _context25.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentObject(_ref27) {
      var libraryId, objectId, versionHash, path;
      return regeneratorRuntime.async(function ContentObject$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              libraryId = _ref27.libraryId, objectId = _ref27.objectId, versionHash = _ref27.versionHash;
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
              _context26.t0 = regeneratorRuntime;
              _context26.t1 = ResponseToJson;
              _context26.t2 = this.HttpClient;
              _context26.next = 10;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                noAuth: true
              }));

            case 10:
              _context26.t3 = _context26.sent;
              _context26.t4 = path;
              _context26.t5 = {
                headers: _context26.t3,
                method: "GET",
                path: _context26.t4
              };
              _context26.t6 = _context26.t2.Request.call(_context26.t2, _context26.t5);
              _context26.t7 = (0, _context26.t1)(_context26.t6);
              _context26.next = 17;
              return _context26.t0.awrap.call(_context26.t0, _context26.t7);

            case 17:
              return _context26.abrupt("return", _context26.sent);

            case 18:
            case "end":
              return _context26.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentObjectOwner(_ref28) {
      var objectId;
      return regeneratorRuntime.async(function ContentObjectOwner$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              objectId = _ref28.objectId;
              ValidateObject(objectId);
              this.Log("Retrieving content object owner: ".concat(objectId));
              _context27.t0 = this.utils;
              _context27.next = 6;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
                contractAddress: Utils.HashToAddress(objectId),
                abi: ContentContract.abi,
                methodName: "owner",
                methodArgs: [],
                cacheContract: false,
                signer: this.signer
              }));

            case 6:
              _context27.t1 = _context27.sent;
              return _context27.abrupt("return", _context27.t0.FormatAddress.call(_context27.t0, _context27.t1));

            case 8:
            case "end":
              return _context27.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentObjectLibraryId(_ref29) {
      var objectId, versionHash;
      return regeneratorRuntime.async(function ContentObjectLibraryId$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              objectId = _ref29.objectId, versionHash = _ref29.versionHash;
              versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              if (this.objectLibraryIds[objectId]) {
                _context28.next = 10;
                break;
              }

              this.Log("Retrieving content object library ID: ".concat(objectId || versionHash));
              _context28.t0 = Utils;
              _context28.next = 8;
              return regeneratorRuntime.awrap(this.CallContractMethod({
                contractAddress: Utils.HashToAddress(objectId),
                abi: ContentContract.abi,
                methodName: "libraryAddress"
              }));

            case 8:
              _context28.t1 = _context28.sent;
              this.objectLibraryIds[objectId] = _context28.t0.AddressToLibraryId.call(_context28.t0, _context28.t1);

            case 10:
              return _context28.abrupt("return", this.objectLibraryIds[objectId]);

            case 11:
            case "end":
              return _context28.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "ProduceMetadataLinks",
    value: function ProduceMetadataLinks(_ref30) {
      var _this4 = this;

      var libraryId, objectId, versionHash, _ref30$path, path, metadata, _ref30$noAuth, noAuth, result;

      return regeneratorRuntime.async(function ProduceMetadataLinks$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              libraryId = _ref30.libraryId, objectId = _ref30.objectId, versionHash = _ref30.versionHash, _ref30$path = _ref30.path, path = _ref30$path === void 0 ? "/" : _ref30$path, metadata = _ref30.metadata, _ref30$noAuth = _ref30.noAuth, noAuth = _ref30$noAuth === void 0 ? true : _ref30$noAuth;

              if (!(!metadata || _typeof(metadata) !== "object")) {
                _context31.next = 3;
                break;
              }

              return _context31.abrupt("return", metadata);

            case 3:
              if (!Array.isArray(metadata)) {
                _context31.next = 7;
                break;
              }

              _context31.next = 6;
              return regeneratorRuntime.awrap(LimitedMap(5, metadata, function _callee3(entry, i) {
                return regeneratorRuntime.async(function _callee3$(_context29) {
                  while (1) {
                    switch (_context29.prev = _context29.next) {
                      case 0:
                        _context29.next = 2;
                        return regeneratorRuntime.awrap(_this4.ProduceMetadataLinks({
                          libraryId: libraryId,
                          objectId: objectId,
                          versionHash: versionHash,
                          path: UrlJoin(path, i.toString()),
                          metadata: entry,
                          noAuth: noAuth
                        }));

                      case 2:
                        return _context29.abrupt("return", _context29.sent);

                      case 3:
                      case "end":
                        return _context29.stop();
                    }
                  }
                });
              }));

            case 6:
              return _context31.abrupt("return", _context31.sent);

            case 7:
              if (!(metadata["/"] && (metadata["/"].match(/\.\/(rep|files)\/.+/) || metadata["/"].match(/^\/?qfab\/([\w]+)\/?(rep|files)\/.+/)))) {
                _context31.next = 16;
                break;
              }

              _context31.t0 = _objectSpread;
              _context31.t1 = {};
              _context31.t2 = metadata;
              _context31.next = 13;
              return regeneratorRuntime.awrap(this.LinkUrl({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                linkPath: path
              }));

            case 13:
              _context31.t3 = _context31.sent;
              _context31.t4 = {
                url: _context31.t3
              };
              return _context31.abrupt("return", (0, _context31.t0)(_context31.t1, _context31.t2, _context31.t4));

            case 16:
              result = {};
              _context31.next = 19;
              return regeneratorRuntime.awrap(LimitedMap(5, Object.keys(metadata), function _callee4(key) {
                return regeneratorRuntime.async(function _callee4$(_context30) {
                  while (1) {
                    switch (_context30.prev = _context30.next) {
                      case 0:
                        _context30.next = 2;
                        return regeneratorRuntime.awrap(_this4.ProduceMetadataLinks({
                          libraryId: libraryId,
                          objectId: objectId,
                          versionHash: versionHash,
                          path: UrlJoin(path, key),
                          metadata: metadata[key],
                          noAuth: noAuth
                        }));

                      case 2:
                        result[key] = _context30.sent;

                      case 3:
                      case "end":
                        return _context30.stop();
                    }
                  }
                });
              }));

            case 19:
              return _context31.abrupt("return", result);

            case 20:
            case "end":
              return _context31.stop();
          }
        }
      }, null, this);
    }
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
     * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
     * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata
         Example:
         {
            "resolved-link": {
              ".": {
                "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
              },
              ...
            }
         }
     
     * @param {boolean=} produceLinkUrls=false - If specified, file and rep links will automatically be populated with a
     * full URL
     * @param {boolean=} noAuth=false - If specified, authorization will not be performed for this call
     *
     * @returns {Promise<Object | string>} - Metadata of the content object
     */

  }, {
    key: "ContentObjectMetadata",
    value: function ContentObjectMetadata(_ref31) {
      var libraryId, objectId, versionHash, writeToken, _ref31$metadataSubtre, metadataSubtree, _ref31$resolveLinks, resolveLinks, _ref31$resolveInclude, resolveIncludeSource, _ref31$produceLinkUrl, produceLinkUrls, _ref31$noAuth, noAuth, path, metadata;

      return regeneratorRuntime.async(function ContentObjectMetadata$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              libraryId = _ref31.libraryId, objectId = _ref31.objectId, versionHash = _ref31.versionHash, writeToken = _ref31.writeToken, _ref31$metadataSubtre = _ref31.metadataSubtree, metadataSubtree = _ref31$metadataSubtre === void 0 ? "/" : _ref31$metadataSubtre, _ref31$resolveLinks = _ref31.resolveLinks, resolveLinks = _ref31$resolveLinks === void 0 ? false : _ref31$resolveLinks, _ref31$resolveInclude = _ref31.resolveIncludeSource, resolveIncludeSource = _ref31$resolveInclude === void 0 ? false : _ref31$resolveInclude, _ref31$produceLinkUrl = _ref31.produceLinkUrls, produceLinkUrls = _ref31$produceLinkUrl === void 0 ? false : _ref31$produceLinkUrl, _ref31$noAuth = _ref31.noAuth, noAuth = _ref31$noAuth === void 0 ? true : _ref31$noAuth;
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
              _context32.prev = 5;
              _context32.t0 = regeneratorRuntime;
              _context32.t1 = ResponseToJson;
              _context32.t2 = this.HttpClient;
              _context32.next = 11;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                noAuth: noAuth
              }));

            case 11:
              _context32.t3 = _context32.sent;
              _context32.t4 = {
                resolve: resolveLinks,
                resolve_include_source: resolveIncludeSource
              };
              _context32.t5 = path;
              _context32.t6 = {
                headers: _context32.t3,
                queryParams: _context32.t4,
                method: "GET",
                path: _context32.t5
              };
              _context32.t7 = _context32.t2.Request.call(_context32.t2, _context32.t6);
              _context32.t8 = (0, _context32.t1)(_context32.t7);
              _context32.next = 19;
              return _context32.t0.awrap.call(_context32.t0, _context32.t8);

            case 19:
              metadata = _context32.sent;
              _context32.next = 27;
              break;

            case 22:
              _context32.prev = 22;
              _context32.t9 = _context32["catch"](5);

              if (!(_context32.t9.status !== 404)) {
                _context32.next = 26;
                break;
              }

              throw _context32.t9;

            case 26:
              metadata = metadataSubtree === "/" ? {} : undefined;

            case 27:
              if (produceLinkUrls) {
                _context32.next = 29;
                break;
              }

              return _context32.abrupt("return", metadata);

            case 29:
              _context32.next = 31;
              return regeneratorRuntime.awrap(this.ProduceMetadataLinks({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                path: metadataSubtree,
                metadata: metadata,
                noAuth: noAuth
              }));

            case 31:
              return _context32.abrupt("return", _context32.sent);

            case 32:
            case "end":
              return _context32.stop();
          }
        }
      }, null, this, [[5, 22]]);
    }
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
    value: function ContentObjectVersions(_ref32) {
      var libraryId, objectId, _ref32$noAuth, noAuth, path;

      return regeneratorRuntime.async(function ContentObjectVersions$(_context33) {
        while (1) {
          switch (_context33.prev = _context33.next) {
            case 0:
              libraryId = _ref32.libraryId, objectId = _ref32.objectId, _ref32$noAuth = _ref32.noAuth, noAuth = _ref32$noAuth === void 0 ? false : _ref32$noAuth;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              this.Log("Retrieving content object versions: ".concat(libraryId || "", " ").concat(objectId || versionHash));
              path = UrlJoin("qid", objectId);
              _context33.t0 = ResponseToJson;
              _context33.t1 = this.HttpClient;
              _context33.next = 8;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                noAuth: noAuth
              }));

            case 8:
              _context33.t2 = _context33.sent;
              _context33.t3 = path;
              _context33.t4 = {
                headers: _context33.t2,
                method: "GET",
                path: _context33.t3
              };
              _context33.t5 = _context33.t1.Request.call(_context33.t1, _context33.t4);
              return _context33.abrupt("return", (0, _context33.t0)(_context33.t5));

            case 13:
            case "end":
              return _context33.stop();
          }
        }
      }, null, this);
    }
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
    value: function CreateContentObject(_ref33) {
      var libraryId, objectId, _ref33$options, options, typeId, type, _ref34, contractAddress, path;

      return regeneratorRuntime.async(function CreateContentObject$(_context34) {
        while (1) {
          switch (_context34.prev = _context34.next) {
            case 0:
              libraryId = _ref33.libraryId, objectId = _ref33.objectId, _ref33$options = _ref33.options, options = _ref33$options === void 0 ? {} : _ref33$options;
              ValidateLibrary(libraryId);

              if (objectId) {
                ValidateObject(objectId);
              }

              this.Log("Creating content object: ".concat(libraryId, " ").concat(objectId || "")); // Look up content type, if specified

              if (!options.type) {
                _context34.next = 17;
                break;
              }

              this.Log("Type specified: ".concat(options.type));

              if (options.type.startsWith("hq__")) {
                _context34.next = 12;
                break;
              }

              _context34.next = 9;
              return regeneratorRuntime.awrap(this.ContentType({
                name: options.type
              }));

            case 9:
              type = _context34.sent;
              _context34.next = 15;
              break;

            case 12:
              _context34.next = 14;
              return regeneratorRuntime.awrap(this.ContentType({
                versionHash: options.type
              }));

            case 14:
              type = _context34.sent;

            case 15:
              typeId = type.id;
              options.type = type.hash;

            case 17:
              if (objectId) {
                _context34.next = 27;
                break;
              }

              this.Log("Deploying contract...");
              _context34.next = 21;
              return regeneratorRuntime.awrap(this.authClient.CreateContentObject({
                libraryId: libraryId,
                typeId: typeId
              }));

            case 21:
              _ref34 = _context34.sent;
              contractAddress = _ref34.contractAddress;
              objectId = this.utils.AddressToObjectId(contractAddress);
              this.Log("Contract deployed: ".concat(contractAddress, " ").concat(objectId));
              _context34.next = 34;
              break;

            case 27:
              _context34.t0 = this;
              _context34.t1 = "Contract already deployed for contract type: ";
              _context34.next = 31;
              return regeneratorRuntime.awrap(this.AccessType({
                id: objectId
              }));

            case 31:
              _context34.t2 = _context34.sent;
              _context34.t3 = _context34.t1.concat.call(_context34.t1, _context34.t2);

              _context34.t0.Log.call(_context34.t0, _context34.t3);

            case 34:
              if (!options.visibility) {
                _context34.next = 38;
                break;
              }

              this.Log("Setting visibility to ".concat(options.visibility));
              _context34.next = 38;
              return regeneratorRuntime.awrap(this.CallContractMethod({
                abi: ContentContract.abi,
                contractAddress: this.utils.HashToAddress(objectId),
                methodName: "setVisibility",
                methodArgs: [options.visibility]
              }));

            case 38:
              path = UrlJoin("qid", objectId);
              _context34.t4 = regeneratorRuntime;
              _context34.t5 = ResponseToJson;
              _context34.t6 = this.HttpClient;
              _context34.next = 44;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 44:
              _context34.t7 = _context34.sent;
              _context34.t8 = path;
              _context34.t9 = options;
              _context34.t10 = {
                headers: _context34.t7,
                method: "POST",
                path: _context34.t8,
                body: _context34.t9,
                failover: false
              };
              _context34.t11 = _context34.t6.Request.call(_context34.t6, _context34.t10);
              _context34.t12 = (0, _context34.t5)(_context34.t11);
              _context34.next = 52;
              return _context34.t4.awrap.call(_context34.t4, _context34.t12);

            case 52:
              return _context34.abrupt("return", _context34.sent);

            case 53:
            case "end":
              return _context34.stop();
          }
        }
      }, null, this);
    }
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
    value: function CopyContentObject(_ref35) {
      var libraryId, originalVersionHash, _ref35$options, options;

      return regeneratorRuntime.async(function CopyContentObject$(_context35) {
        while (1) {
          switch (_context35.prev = _context35.next) {
            case 0:
              libraryId = _ref35.libraryId, originalVersionHash = _ref35.originalVersionHash, _ref35$options = _ref35.options, options = _ref35$options === void 0 ? {} : _ref35$options;
              ValidateLibrary(libraryId);
              ValidateVersion(originalVersionHash);
              options.copy_from = originalVersionHash;
              _context35.next = 6;
              return regeneratorRuntime.awrap(this.CreateContentObject({
                libraryId: libraryId,
                options: options
              }));

            case 6:
              return _context35.abrupt("return", _context35.sent);

            case 7:
            case "end":
              return _context35.stop();
          }
        }
      }, null, this);
    }
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
     * type: New type for the object - Object ID, version hash or name of type
     *
     * @returns {Promise<object>} - Response containing the object ID and write token of the draft
     */

  }, {
    key: "EditContentObject",
    value: function EditContentObject(_ref36) {
      var libraryId, objectId, _ref36$options, options, path;

      return regeneratorRuntime.async(function EditContentObject$(_context36) {
        while (1) {
          switch (_context36.prev = _context36.next) {
            case 0:
              libraryId = _ref36.libraryId, objectId = _ref36.objectId, _ref36$options = _ref36.options, options = _ref36$options === void 0 ? {} : _ref36$options;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              this.Log("Opening content draft: ".concat(libraryId, " ").concat(objectId));

              if (!options.type) {
                _context36.next = 19;
                break;
              }

              if (!options.type.startsWith("hq__")) {
                _context36.next = 10;
                break;
              }

              _context36.next = 7;
              return regeneratorRuntime.awrap(this.ContentType({
                versionHash: options.type
              }));

            case 7:
              options.type = _context36.sent.hash;
              _context36.next = 19;
              break;

            case 10:
              if (!options.type.startsWith("iq__")) {
                _context36.next = 16;
                break;
              }

              _context36.next = 13;
              return regeneratorRuntime.awrap(this.ContentType({
                typeId: options.type
              }));

            case 13:
              options.type = _context36.sent.hash;
              _context36.next = 19;
              break;

            case 16:
              _context36.next = 18;
              return regeneratorRuntime.awrap(this.ContentType({
                name: options.type
              }));

            case 18:
              options.type = _context36.sent.hash;

            case 19:
              path = UrlJoin("qid", objectId);
              _context36.t0 = ResponseToJson;
              _context36.t1 = this.HttpClient;
              _context36.next = 24;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 24:
              _context36.t2 = _context36.sent;
              _context36.t3 = path;
              _context36.t4 = options;
              _context36.t5 = {
                headers: _context36.t2,
                method: "POST",
                path: _context36.t3,
                body: _context36.t4,
                failover: false
              };
              _context36.t6 = _context36.t1.Request.call(_context36.t1, _context36.t5);
              return _context36.abrupt("return", (0, _context36.t0)(_context36.t6));

            case 30:
            case "end":
              return _context36.stop();
          }
        }
      }, null, this);
    }
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
    value: function FinalizeContentObject(_ref37) {
      var libraryId, objectId, writeToken, _ref37$publish, publish, _ref37$awaitCommitCon, awaitCommitConfirmation, path, finalizeResponse;

      return regeneratorRuntime.async(function FinalizeContentObject$(_context37) {
        while (1) {
          switch (_context37.prev = _context37.next) {
            case 0:
              libraryId = _ref37.libraryId, objectId = _ref37.objectId, writeToken = _ref37.writeToken, _ref37$publish = _ref37.publish, publish = _ref37$publish === void 0 ? true : _ref37$publish, _ref37$awaitCommitCon = _ref37.awaitCommitConfirmation, awaitCommitConfirmation = _ref37$awaitCommitCon === void 0 ? true : _ref37$awaitCommitCon;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              this.Log("Finalizing content draft: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
              path = UrlJoin("q", writeToken);
              _context37.t0 = regeneratorRuntime;
              _context37.t1 = ResponseToJson;
              _context37.t2 = this.HttpClient;
              _context37.next = 10;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 10:
              _context37.t3 = _context37.sent;
              _context37.t4 = path;
              _context37.t5 = {
                headers: _context37.t3,
                method: "POST",
                path: _context37.t4,
                failover: false
              };
              _context37.t6 = _context37.t2.Request.call(_context37.t2, _context37.t5);
              _context37.t7 = (0, _context37.t1)(_context37.t6);
              _context37.next = 17;
              return _context37.t0.awrap.call(_context37.t0, _context37.t7);

            case 17:
              finalizeResponse = _context37.sent;
              this.Log("Finalized: ".concat(finalizeResponse.hash));

              if (!publish) {
                _context37.next = 22;
                break;
              }

              _context37.next = 22;
              return regeneratorRuntime.awrap(this.PublishContentVersion({
                objectId: objectId,
                versionHash: finalizeResponse.hash,
                awaitCommitConfirmation: awaitCommitConfirmation
              }));

            case 22:
              // Invalidate cached content type, if this is one.
              delete this.contentTypes[objectId];
              return _context37.abrupt("return", finalizeResponse);

            case 24:
            case "end":
              return _context37.stop();
          }
        }
      }, null, this);
    }
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
    value: function PublishContentVersion(_ref38) {
      var objectId, versionHash, _ref38$awaitCommitCon, awaitCommitConfirmation;

      return regeneratorRuntime.async(function PublishContentVersion$(_context38) {
        while (1) {
          switch (_context38.prev = _context38.next) {
            case 0:
              objectId = _ref38.objectId, versionHash = _ref38.versionHash, _ref38$awaitCommitCon = _ref38.awaitCommitConfirmation, awaitCommitConfirmation = _ref38$awaitCommitCon === void 0 ? true : _ref38$awaitCommitCon;
              versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
              this.Log("Publishing: ".concat(objectId || versionHash));

              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              _context38.next = 6;
              return regeneratorRuntime.awrap(this.ethClient.CommitContent({
                contentObjectAddress: this.utils.HashToAddress(objectId),
                versionHash: versionHash,
                signer: this.signer
              }));

            case 6:
              if (!awaitCommitConfirmation) {
                _context38.next = 10;
                break;
              }

              this.Log("Awaiting commit confirmation...");
              _context38.next = 10;
              return regeneratorRuntime.awrap(this.ethClient.AwaitEvent({
                contractAddress: this.utils.HashToAddress(objectId),
                abi: ContentContract.abi,
                eventName: "VersionConfirm",
                signer: this.signer
              }));

            case 10:
            case "end":
              return _context38.stop();
          }
        }
      }, null, this);
    }
    /**
     * Delete specified version of the content object
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be deleted
     */

  }, {
    key: "DeleteContentVersion",
    value: function DeleteContentVersion(_ref39) {
      var versionHash, _this$utils$DecodeVer, objectId;

      return regeneratorRuntime.async(function DeleteContentVersion$(_context39) {
        while (1) {
          switch (_context39.prev = _context39.next) {
            case 0:
              versionHash = _ref39.versionHash;
              ValidateVersion(versionHash);
              this.Log("Deleting content version: ".concat(versionHash));
              _this$utils$DecodeVer = this.utils.DecodeVersionHash(versionHash), objectId = _this$utils$DecodeVer.objectId;
              _context39.next = 6;
              return regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: this.utils.HashToAddress(objectId),
                abi: ContentContract.abi,
                methodName: "deleteVersion",
                methodArgs: [versionHash]
              }));

            case 6:
            case "end":
              return _context39.stop();
          }
        }
      }, null, this);
    }
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
    value: function DeleteContentObject(_ref40) {
      var libraryId, objectId;
      return regeneratorRuntime.async(function DeleteContentObject$(_context40) {
        while (1) {
          switch (_context40.prev = _context40.next) {
            case 0:
              libraryId = _ref40.libraryId, objectId = _ref40.objectId;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              this.Log("Deleting content version: ".concat(libraryId, " ").concat(objectId));
              _context40.next = 5;
              return regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: Utils.HashToAddress(libraryId),
                abi: LibraryContract.abi,
                methodName: "deleteContent",
                methodArgs: [this.utils.HashToAddress(objectId)]
              }));

            case 5:
            case "end":
              return _context40.stop();
          }
        }
      }, null, this);
    }
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
    value: function MergeMetadata(_ref41) {
      var libraryId, objectId, writeToken, _ref41$metadataSubtre, metadataSubtree, _ref41$metadata, metadata, path;

      return regeneratorRuntime.async(function MergeMetadata$(_context41) {
        while (1) {
          switch (_context41.prev = _context41.next) {
            case 0:
              libraryId = _ref41.libraryId, objectId = _ref41.objectId, writeToken = _ref41.writeToken, _ref41$metadataSubtre = _ref41.metadataSubtree, metadataSubtree = _ref41$metadataSubtre === void 0 ? "/" : _ref41$metadataSubtre, _ref41$metadata = _ref41.metadata, metadata = _ref41$metadata === void 0 ? {} : _ref41$metadata;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              this.Log("Merging metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
              this.Log(metadata);
              path = UrlJoin("q", writeToken, "meta", metadataSubtree);
              _context41.t0 = regeneratorRuntime;
              _context41.t1 = this.HttpClient;
              _context41.next = 10;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 10:
              _context41.t2 = _context41.sent;
              _context41.t3 = path;
              _context41.t4 = metadata;
              _context41.t5 = {
                headers: _context41.t2,
                method: "POST",
                path: _context41.t3,
                body: _context41.t4,
                failover: false
              };
              _context41.t6 = _context41.t1.Request.call(_context41.t1, _context41.t5);
              _context41.next = 17;
              return _context41.t0.awrap.call(_context41.t0, _context41.t6);

            case 17:
            case "end":
              return _context41.stop();
          }
        }
      }, null, this);
    }
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
    value: function ReplaceMetadata(_ref42) {
      var libraryId, objectId, writeToken, _ref42$metadataSubtre, metadataSubtree, _ref42$metadata, metadata, path;

      return regeneratorRuntime.async(function ReplaceMetadata$(_context42) {
        while (1) {
          switch (_context42.prev = _context42.next) {
            case 0:
              libraryId = _ref42.libraryId, objectId = _ref42.objectId, writeToken = _ref42.writeToken, _ref42$metadataSubtre = _ref42.metadataSubtree, metadataSubtree = _ref42$metadataSubtre === void 0 ? "/" : _ref42$metadataSubtre, _ref42$metadata = _ref42.metadata, metadata = _ref42$metadata === void 0 ? {} : _ref42$metadata;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              this.Log("Replacing metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
              this.Log(metadata);
              path = UrlJoin("q", writeToken, "meta", metadataSubtree);
              _context42.t0 = regeneratorRuntime;
              _context42.t1 = this.HttpClient;
              _context42.next = 10;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 10:
              _context42.t2 = _context42.sent;
              _context42.t3 = path;
              _context42.t4 = metadata;
              _context42.t5 = {
                headers: _context42.t2,
                method: "PUT",
                path: _context42.t3,
                body: _context42.t4,
                failover: false
              };
              _context42.t6 = _context42.t1.Request.call(_context42.t1, _context42.t5);
              _context42.next = 17;
              return _context42.t0.awrap.call(_context42.t0, _context42.t6);

            case 17:
            case "end":
              return _context42.stop();
          }
        }
      }, null, this);
    }
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
    value: function DeleteMetadata(_ref43) {
      var libraryId, objectId, writeToken, _ref43$metadataSubtre, metadataSubtree, path;

      return regeneratorRuntime.async(function DeleteMetadata$(_context43) {
        while (1) {
          switch (_context43.prev = _context43.next) {
            case 0:
              libraryId = _ref43.libraryId, objectId = _ref43.objectId, writeToken = _ref43.writeToken, _ref43$metadataSubtre = _ref43.metadataSubtree, metadataSubtree = _ref43$metadataSubtre === void 0 ? "/" : _ref43$metadataSubtre;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              this.Log("Deleting metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
              this.Log("Subtree: ".concat(metadataSubtree));
              path = UrlJoin("q", writeToken, "meta", metadataSubtree);
              _context43.t0 = regeneratorRuntime;
              _context43.t1 = this.HttpClient;
              _context43.next = 10;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 10:
              _context43.t2 = _context43.sent;
              _context43.t3 = path;
              _context43.t4 = {
                headers: _context43.t2,
                method: "DELETE",
                path: _context43.t3,
                failover: false
              };
              _context43.t5 = _context43.t1.Request.call(_context43.t1, _context43.t4);
              _context43.next = 16;
              return _context43.t0.awrap.call(_context43.t0, _context43.t5);

            case 16:
            case "end":
              return _context43.stop();
          }
        }
      }, null, this);
    }
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
    value: function ListFiles(_ref44) {
      var libraryId, objectId, versionHash, path;
      return regeneratorRuntime.async(function ListFiles$(_context44) {
        while (1) {
          switch (_context44.prev = _context44.next) {
            case 0:
              libraryId = _ref44.libraryId, objectId = _ref44.objectId, versionHash = _ref44.versionHash;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              path = UrlJoin("q", versionHash || objectId, "meta", "files");
              _context44.t0 = ResponseToJson;
              _context44.t1 = this.HttpClient;
              _context44.next = 8;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 8:
              _context44.t2 = _context44.sent;
              _context44.t3 = path;
              _context44.t4 = {
                headers: _context44.t2,
                method: "GET",
                path: _context44.t3
              };
              _context44.t5 = _context44.t1.Request.call(_context44.t1, _context44.t4);
              return _context44.abrupt("return", (0, _context44.t0)(_context44.t5));

            case 13:
            case "end":
              return _context44.stop();
          }
        }
      }, null, this);
    }
    /**
     * Create links to files, metadata and/or representations of this or or other
     * content objects.
     *
     * Expected format of links:
     *
     [
       {
          path: string (path to link)
          target: string (path to target),
          type: string ("file", "meta", "rep" - default "file")
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
    value: function CreateLinks(_ref45) {
      var libraryId, objectId, writeToken, _ref45$links, links, i, info, path, type, target;

      return regeneratorRuntime.async(function CreateLinks$(_context45) {
        while (1) {
          switch (_context45.prev = _context45.next) {
            case 0:
              libraryId = _ref45.libraryId, objectId = _ref45.objectId, writeToken = _ref45.writeToken, _ref45$links = _ref45.links, links = _ref45$links === void 0 ? [] : _ref45$links;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              i = 0;

            case 4:
              if (!(i < links.length)) {
                _context45.next = 15;
                break;
              }

              info = links[i];
              path = info.path.replace(/^(\/|\.)+/, "");
              type = (info.type || "file") === "file" ? "files" : info.type;
              target = info.target.replace(/^(\/|\.)+/, "");

              if (info.targetHash) {
                target = "/qfab/".concat(info.targetHash, "/").concat(type, "/").concat(target);
              } else {
                target = "./".concat(type, "/").concat(target);
              }

              _context45.next = 12;
              return regeneratorRuntime.awrap(this.ReplaceMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken,
                metadataSubtree: path,
                metadata: {
                  "/": target
                }
              }));

            case 12:
              i++;
              _context45.next = 4;
              break;

            case 15:
            case "end":
              return _context45.stop();
          }
        }
      }, null, this);
    }
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
    value: function UploadFilesFromS3(_ref46) {
      var libraryId, objectId, writeToken, region, bucket, fileInfo, accessKey, secret, _ref46$copy, copy, callback, defaults, ops, _ref47, id, status, done, progress, _progress;

      return regeneratorRuntime.async(function UploadFilesFromS3$(_context46) {
        while (1) {
          switch (_context46.prev = _context46.next) {
            case 0:
              libraryId = _ref46.libraryId, objectId = _ref46.objectId, writeToken = _ref46.writeToken, region = _ref46.region, bucket = _ref46.bucket, fileInfo = _ref46.fileInfo, accessKey = _ref46.accessKey, secret = _ref46.secret, _ref46$copy = _ref46.copy, copy = _ref46$copy === void 0 ? false : _ref46$copy, callback = _ref46.callback;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              this.Log("Uploading files from S3: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
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

              _context46.next = 8;
              return regeneratorRuntime.awrap(this.CreateFileUploadJob({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken,
                ops: ops,
                defaults: defaults
              }));

            case 8:
              _ref47 = _context46.sent;
              id = _ref47.id;

            case 10:
              if (!true) {
                _context46.next = 33;
                break;
              }

              _context46.next = 13;
              return regeneratorRuntime.awrap(new Promise(function (resolve) {
                return setTimeout(resolve, 1000);
              }));

            case 13:
              _context46.next = 15;
              return regeneratorRuntime.awrap(this.UploadStatus({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken,
                uploadId: id
              }));

            case 15:
              status = _context46.sent;

              if (!(status.errors && status.errors.length > 1)) {
                _context46.next = 20;
                break;
              }

              throw status.errors.join("\n");

            case 20:
              if (!status.error) {
                _context46.next = 25;
                break;
              }

              this.Log("S3 file upload failed:\n".concat(JSON.stringify(status, null, 2)));
              throw status.error;

            case 25:
              if (!(status.status.toLowerCase() === "failed")) {
                _context46.next = 27;
                break;
              }

              throw "File upload failed";

            case 27:
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
                _context46.next = 31;
                break;
              }

              return _context46.abrupt("break", 33);

            case 31:
              _context46.next = 10;
              break;

            case 33:
            case "end":
              return _context46.stop();
          }
        }
      }, null, this);
    }
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
          data: File | ArrayBuffer | Buffer | File Descriptor (Node)
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
     * @param {string} encryption="none" - Encryption for uploaded files - cgck | none
     * @param {function=} callback - If specified, will be called after each job segment is finished with the current upload progress
     * - Format: {"filename1": {uploaded: number, total: number}, ...}
     */

  }, {
    key: "UploadFiles",
    value: function UploadFiles(_ref48) {
      var _this5 = this;

      var libraryId, objectId, writeToken, fileInfo, _ref48$encryption, encryption, callback, conk, progress, fileDataMap, i, entry, _ref49, id, jobs, bufferSize, jobSpecs, prepared, uploaded, PrepareJobs, UploadJob, rateTestJobs, rates, j, start, elapsed, size, averageRate, concurrentUploads;

      return regeneratorRuntime.async(function UploadFiles$(_context50) {
        while (1) {
          switch (_context50.prev = _context50.next) {
            case 0:
              libraryId = _ref48.libraryId, objectId = _ref48.objectId, writeToken = _ref48.writeToken, fileInfo = _ref48.fileInfo, _ref48$encryption = _ref48.encryption, encryption = _ref48$encryption === void 0 ? "none" : _ref48$encryption, callback = _ref48.callback;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              this.Log("Uploading files: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));

              if (!(encryption === "cgck")) {
                _context50.next = 8;
                break;
              }

              _context50.next = 7;
              return regeneratorRuntime.awrap(this.EncryptionConk({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken
              }));

            case 7:
              conk = _context50.sent;

            case 8:
              // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
              progress = {};
              fileDataMap = {};

              for (i = 0; i < fileInfo.length; i++) {
                entry = fileInfo[i];
                entry.path = entry.path.replace(/^\/+/, "");

                if (encryption === "cgck") {
                  entry.encryption = {
                    scheme: "cgck"
                  };
                }

                fileDataMap[entry.path] = entry.data;
                delete entry.data;
                entry.type = "file";
                progress[entry.path] = {
                  uploaded: 0,
                  total: entry.size
                };
                fileInfo[i] = entry;
              }

              this.Log(fileInfo);

              if (callback) {
                callback(progress);
              }

              _context50.next = 15;
              return regeneratorRuntime.awrap(this.CreateFileUploadJob({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken,
                ops: fileInfo,
                encryption: encryption
              }));

            case 15:
              _ref49 = _context50.sent;
              id = _ref49.id;
              jobs = _ref49.jobs;
              this.Log("Upload ID: ".concat(id));
              this.Log(jobs); // How far encryption can get ahead of upload

              bufferSize = 100 * 1024 * 1024;
              jobSpecs = [];
              prepared = 0;
              uploaded = 0; // Insert the data to upload into the job spec, encrypting if necessary

              PrepareJobs = function PrepareJobs() {
                var j, jobId, job, f, _fileInfo, data;

                return regeneratorRuntime.async(function PrepareJobs$(_context47) {
                  while (1) {
                    switch (_context47.prev = _context47.next) {
                      case 0:
                        j = 0;

                      case 1:
                        if (!(j < jobs.length)) {
                          _context47.next = 31;
                          break;
                        }

                      case 2:
                        if (!(prepared - uploaded > bufferSize)) {
                          _context47.next = 7;
                          break;
                        }

                        _context47.next = 5;
                        return regeneratorRuntime.awrap(new Promise(function (resolve) {
                          return setTimeout(resolve, 500);
                        }));

                      case 5:
                        _context47.next = 2;
                        break;

                      case 7:
                        // Retrieve job info
                        jobId = jobs[j];
                        _context47.next = 10;
                        return regeneratorRuntime.awrap(_this5.UploadJobStatus({
                          libraryId: libraryId,
                          objectId: objectId,
                          writeToken: writeToken,
                          uploadId: id,
                          jobId: jobId
                        }));

                      case 10:
                        job = _context47.sent;
                        f = 0;

                      case 12:
                        if (!(f < job.files.length)) {
                          _context47.next = 25;
                          break;
                        }

                        _fileInfo = job.files[f];
                        data = void 0;

                        if (typeof fileDataMap[_fileInfo.path] === "number") {
                          // File descriptor - Read data from file
                          data = Buffer.alloc(_fileInfo.len);
                          fs.readSync(fileDataMap[_fileInfo.path], data, 0, _fileInfo.len, _fileInfo.off);
                        } else {
                          // Full data - Slice requested chunk
                          data = fileDataMap[_fileInfo.path].slice(_fileInfo.off, _fileInfo.off + _fileInfo.len);
                        }

                        if (!(encryption === "cgck")) {
                          _context47.next = 20;
                          break;
                        }

                        _context47.next = 19;
                        return regeneratorRuntime.awrap(Crypto.Encrypt(conk, data));

                      case 19:
                        data = _context47.sent;

                      case 20:
                        job.files[f].data = data;
                        prepared += _fileInfo.len;

                      case 22:
                        f++;
                        _context47.next = 12;
                        break;

                      case 25:
                        jobSpecs[j] = job; // Wait for a bit to let upload start

                        _context47.next = 28;
                        return regeneratorRuntime.awrap(new Promise(function (resolve) {
                          return setTimeout(resolve, 50);
                        }));

                      case 28:
                        j++;
                        _context47.next = 1;
                        break;

                      case 31:
                      case "end":
                        return _context47.stop();
                    }
                  }
                });
              };

              UploadJob = function UploadJob(jobId, j) {
                var jobSpec, files, f, _fileInfo2;

                return regeneratorRuntime.async(function UploadJob$(_context48) {
                  while (1) {
                    switch (_context48.prev = _context48.next) {
                      case 0:
                        if (jobSpecs[j]) {
                          _context48.next = 5;
                          break;
                        }

                        _context48.next = 3;
                        return regeneratorRuntime.awrap(new Promise(function (resolve) {
                          return setTimeout(resolve, 500);
                        }));

                      case 3:
                        _context48.next = 0;
                        break;

                      case 5:
                        jobSpec = jobSpecs[j];
                        files = jobSpec.files; // Upload each item

                        f = 0;

                      case 8:
                        if (!(f < files.length)) {
                          _context48.next = 18;
                          break;
                        }

                        _fileInfo2 = files[f];
                        _context48.next = 12;
                        return regeneratorRuntime.awrap(_this5.UploadFileData({
                          libraryId: libraryId,
                          objectId: objectId,
                          writeToken: writeToken,
                          uploadId: id,
                          jobId: jobId,
                          fileData: _fileInfo2.data
                        }));

                      case 12:
                        delete jobSpecs[j].files[f].data;
                        uploaded += _fileInfo2.len;

                        if (callback) {
                          progress[_fileInfo2.path] = _objectSpread({}, progress[_fileInfo2.path], {
                            uploaded: progress[_fileInfo2.path].uploaded + _fileInfo2.len
                          });
                          callback(progress);
                        }

                      case 15:
                        f++;
                        _context48.next = 8;
                        break;

                      case 18:
                      case "end":
                        return _context48.stop();
                    }
                  }
                });
              }; // Preparing jobs is done asyncronously


              PrepareJobs(); // Upload the first several chunks in sequence, to determine average upload rate

              rateTestJobs = Math.min(3, jobs.length);
              rates = [];
              j = 0;

            case 30:
              if (!(j < rateTestJobs)) {
                _context50.next = 40;
                break;
              }

              start = new Date().getTime();
              _context50.next = 34;
              return regeneratorRuntime.awrap(UploadJob(jobs[j], j));

            case 34:
              elapsed = (new Date().getTime() - start) / 1000;
              size = jobSpecs[j].files.map(function (file) {
                return file.len;
              }).reduce(function (length, total) {
                return length + total;
              }, 0);
              rates.push(size / elapsed / (1024 * 1024));

            case 37:
              j++;
              _context50.next = 30;
              break;

            case 40:
              averageRate = rates.reduce(function (mbps, total) {
                return mbps + total;
              }, 0) / rateTestJobs; // Upload remaining jobs in parallel

              concurrentUploads = Math.min(5, Math.ceil(averageRate / 2));
              _context50.next = 44;
              return regeneratorRuntime.awrap(LimitedMap(concurrentUploads, jobs, function _callee5(jobId, j) {
                return regeneratorRuntime.async(function _callee5$(_context49) {
                  while (1) {
                    switch (_context49.prev = _context49.next) {
                      case 0:
                        if (!(j < rateTestJobs)) {
                          _context49.next = 2;
                          break;
                        }

                        return _context49.abrupt("return");

                      case 2:
                        _context49.next = 4;
                        return regeneratorRuntime.awrap(UploadJob(jobId, j));

                      case 4:
                      case "end":
                        return _context49.stop();
                    }
                  }
                });
              }));

            case 44:
            case "end":
              return _context50.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CreateFileUploadJob",
    value: function CreateFileUploadJob(_ref50) {
      var libraryId, objectId, writeToken, ops, _ref50$defaults, defaults, _ref50$encryption, encryption, path, body;

      return regeneratorRuntime.async(function CreateFileUploadJob$(_context51) {
        while (1) {
          switch (_context51.prev = _context51.next) {
            case 0:
              libraryId = _ref50.libraryId, objectId = _ref50.objectId, writeToken = _ref50.writeToken, ops = _ref50.ops, _ref50$defaults = _ref50.defaults, defaults = _ref50$defaults === void 0 ? {} : _ref50$defaults, _ref50$encryption = _ref50.encryption, encryption = _ref50$encryption === void 0 ? "none" : _ref50$encryption;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              this.Log("Creating file upload job: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
              this.Log(ops);
              path = UrlJoin("q", writeToken, "file_jobs");

              if (encryption === "cgck") {
                defaults.encryption = {
                  scheme: "cgck"
                };
              }

              body = {
                seq: 0,
                seq_complete: true,
                defaults: defaults,
                ops: ops
              };
              _context51.t0 = ResponseToJson;
              _context51.t1 = this.HttpClient;
              _context51.next = 12;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true,
                encryption: encryption
              }));

            case 12:
              _context51.t2 = _context51.sent;
              _context51.t3 = path;
              _context51.t4 = body;
              _context51.t5 = {
                headers: _context51.t2,
                method: "POST",
                path: _context51.t3,
                body: _context51.t4,
                failover: false
              };
              _context51.t6 = _context51.t1.Request.call(_context51.t1, _context51.t5);
              return _context51.abrupt("return", (0, _context51.t0)(_context51.t6));

            case 18:
            case "end":
              return _context51.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "UploadStatus",
    value: function UploadStatus(_ref51) {
      var libraryId, objectId, writeToken, uploadId, path;
      return regeneratorRuntime.async(function UploadStatus$(_context52) {
        while (1) {
          switch (_context52.prev = _context52.next) {
            case 0:
              libraryId = _ref51.libraryId, objectId = _ref51.objectId, writeToken = _ref51.writeToken, uploadId = _ref51.uploadId;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              path = UrlJoin("q", writeToken, "file_jobs", uploadId);
              _context52.t0 = ResponseToJson;
              _context52.t1 = this.HttpClient;
              _context52.next = 8;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 8:
              _context52.t2 = _context52.sent;
              _context52.t3 = path;
              _context52.t4 = {
                headers: _context52.t2,
                method: "GET",
                path: _context52.t3,
                failover: false
              };
              _context52.t5 = _context52.t1.Request.call(_context52.t1, _context52.t4);
              return _context52.abrupt("return", (0, _context52.t0)(_context52.t5));

            case 13:
            case "end":
              return _context52.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "UploadJobStatus",
    value: function UploadJobStatus(_ref52) {
      var libraryId, objectId, writeToken, uploadId, jobId, path;
      return regeneratorRuntime.async(function UploadJobStatus$(_context53) {
        while (1) {
          switch (_context53.prev = _context53.next) {
            case 0:
              libraryId = _ref52.libraryId, objectId = _ref52.objectId, writeToken = _ref52.writeToken, uploadId = _ref52.uploadId, jobId = _ref52.jobId;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              path = UrlJoin("q", writeToken, "file_jobs", uploadId, "uploads", jobId);
              _context53.t0 = ResponseToJson;
              _context53.t1 = this.HttpClient;
              _context53.next = 8;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 8:
              _context53.t2 = _context53.sent;
              _context53.t3 = path;
              _context53.t4 = {
                headers: _context53.t2,
                method: "GET",
                path: _context53.t3,
                failover: false
              };
              _context53.t5 = _context53.t1.Request.call(_context53.t1, _context53.t4);
              return _context53.abrupt("return", (0, _context53.t0)(_context53.t5));

            case 13:
            case "end":
              return _context53.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "UploadFileData",
    value: function UploadFileData(_ref53) {
      var libraryId, objectId, writeToken, uploadId, jobId, fileData, path;
      return regeneratorRuntime.async(function UploadFileData$(_context54) {
        while (1) {
          switch (_context54.prev = _context54.next) {
            case 0:
              libraryId = _ref53.libraryId, objectId = _ref53.objectId, writeToken = _ref53.writeToken, uploadId = _ref53.uploadId, jobId = _ref53.jobId, fileData = _ref53.fileData;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              path = UrlJoin("q", writeToken, "file_jobs", uploadId, jobId);
              _context54.t0 = regeneratorRuntime;
              _context54.t1 = ResponseToJson;
              _context54.t2 = this.HttpClient;
              _context54.t3 = path;
              _context54.t4 = fileData;
              _context54.t5 = _objectSpread;
              _context54.t6 = {
                "Content-type": "application/octet-stream"
              };
              _context54.next = 13;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 13:
              _context54.t7 = _context54.sent;
              _context54.t8 = (0, _context54.t5)(_context54.t6, _context54.t7);
              _context54.t9 = {
                method: "POST",
                path: _context54.t3,
                body: _context54.t4,
                bodyType: "BINARY",
                headers: _context54.t8,
                failover: false
              };
              _context54.t10 = _context54.t2.Request.call(_context54.t2, _context54.t9);
              _context54.t11 = (0, _context54.t1)(_context54.t10);
              _context54.next = 20;
              return _context54.t0.awrap.call(_context54.t0, _context54.t11);

            case 20:
            case "end":
              return _context54.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "FinalizeUploadJob",
    value: function FinalizeUploadJob(_ref54) {
      var libraryId, objectId, writeToken, path;
      return regeneratorRuntime.async(function FinalizeUploadJob$(_context55) {
        while (1) {
          switch (_context55.prev = _context55.next) {
            case 0:
              libraryId = _ref54.libraryId, objectId = _ref54.objectId, writeToken = _ref54.writeToken;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              this.Log("Finalizing upload job: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
              path = UrlJoin("q", writeToken, "files");
              _context55.t0 = regeneratorRuntime;
              _context55.t1 = this.HttpClient;
              _context55.t2 = path;
              _context55.next = 10;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 10:
              _context55.t3 = _context55.sent;
              _context55.t4 = {
                method: "POST",
                path: _context55.t2,
                bodyType: "BINARY",
                headers: _context55.t3,
                failover: false
              };
              _context55.t5 = _context55.t1.Request.call(_context55.t1, _context55.t4);
              _context55.next = 15;
              return _context55.t0.awrap.call(_context55.t0, _context55.t5);

            case 15:
            case "end":
              return _context55.stop();
          }
        }
      }, null, this);
    }
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
    value: function DeleteFiles(_ref55) {
      var libraryId, objectId, writeToken, filePaths, ops;
      return regeneratorRuntime.async(function DeleteFiles$(_context56) {
        while (1) {
          switch (_context56.prev = _context56.next) {
            case 0:
              libraryId = _ref55.libraryId, objectId = _ref55.objectId, writeToken = _ref55.writeToken, filePaths = _ref55.filePaths;
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
              _context56.next = 8;
              return regeneratorRuntime.awrap(this.CreateFileUploadJob({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken,
                ops: ops
              }));

            case 8:
            case "end":
              return _context56.stop();
          }
        }
      }, null, this);
    }
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
     * @param {function=} callback - If specified, will be periodically called with current download status
     * - Signature: ({bytesFinished, bytesTotal}) => {}
     *
     * @returns {Promise<ArrayBuffer>} - File data in the requested format
     */

  }, {
    key: "DownloadFile",
    value: function DownloadFile(_ref56) {
      var _this6 = this;

      var libraryId, objectId, versionHash, filePath, _ref56$format, format, callback, fileInfo, path, encrypted, chunkSize, bufferSize, fileSize, totalChunks, outputChunks, downloaded, decrypted, conk, decryptionStream, decryptionPromise, nextChunk;

      return regeneratorRuntime.async(function DownloadFile$(_context58) {
        while (1) {
          switch (_context58.prev = _context58.next) {
            case 0:
              libraryId = _ref56.libraryId, objectId = _ref56.objectId, versionHash = _ref56.versionHash, filePath = _ref56.filePath, _ref56$format = _ref56.format, format = _ref56$format === void 0 ? "arrayBuffer" : _ref56$format, callback = _ref56.callback;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              _context58.next = 5;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                metadataSubtree: UrlJoin("files", filePath)
              }));

            case 5:
              fileInfo = _context58.sent;
              path = UrlJoin("q", versionHash || objectId, "files", filePath);
              encrypted = fileInfo && fileInfo["."].encryption && fileInfo["."].encryption.scheme === "cgck";
              chunkSize = 5000000;
              bufferSize = chunkSize * 5;
              fileSize = fileInfo["."].size;
              totalChunks = Math.ceil(fileSize / chunkSize);
              outputChunks = [];
              downloaded = 0;
              decrypted = 0;

              if (callback) {
                callback({
                  bytesFinished: 0,
                  bytesTotal: fileSize
                });
              }

              if (!encrypted) {
                _context58.next = 24;
                break;
              }

              _context58.next = 19;
              return regeneratorRuntime.awrap(this.EncryptionConk({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 19:
              conk = _context58.sent;
              _context58.next = 22;
              return regeneratorRuntime.awrap(Crypto.OpenDecryptionStream(conk));

            case 22:
              decryptionStream = _context58.sent;
              decryptionPromise = new Promise(function (resolve, reject) {
                decryptionStream.on("data", function (chunk) {
                  outputChunks.push(chunk);
                  decrypted += chunk.length;

                  if (callback) {
                    callback({
                      bytesFinished: decrypted,
                      bytesTotal: fileSize
                    });
                  }
                }).on("finish", function () {
                  resolve();
                }).on("error", function (e) {
                  reject(e);
                });
              });

            case 24:
              nextChunk = 0;
              _context58.next = 27;
              return regeneratorRuntime.awrap(LimitedMap(3, _toConsumableArray(Array(totalChunks)), function _callee6(_, i) {
                var startByte, endByte, chunk;
                return regeneratorRuntime.async(function _callee6$(_context57) {
                  while (1) {
                    switch (_context57.prev = _context57.next) {
                      case 0:
                        startByte = i * chunkSize;
                        endByte = Math.min((i + 1) * chunkSize, fileSize);

                      case 2:
                        if (!(encrypted && downloaded - decrypted > bufferSize)) {
                          _context57.next = 7;
                          break;
                        }

                        _context57.next = 5;
                        return regeneratorRuntime.awrap(new Promise(function (resolve) {
                          return setTimeout(resolve, 500);
                        }));

                      case 5:
                        _context57.next = 2;
                        break;

                      case 7:
                        _context57.t0 = Buffer;
                        _context57.t1 = regeneratorRuntime;
                        _context57.t2 = regeneratorRuntime;
                        _context57.t3 = _this6.HttpClient;
                        _context57.t4 = _objectSpread;
                        _context57.t5 = {};
                        _context57.next = 15;
                        return regeneratorRuntime.awrap(_this6.authClient.AuthorizationHeader({
                          libraryId: libraryId,
                          objectId: objectId,
                          versionHash: versionHash
                        }));

                      case 15:
                        _context57.t6 = _context57.sent;
                        _context57.t7 = {
                          Accept: "*/*",
                          Range: "bytes=".concat(startByte, "-").concat(endByte - 1)
                        };
                        _context57.t8 = (0, _context57.t4)(_context57.t5, _context57.t6, _context57.t7);
                        _context57.t9 = path;
                        _context57.t10 = {
                          headers: _context57.t8,
                          method: "GET",
                          path: _context57.t9
                        };
                        _context57.t11 = _context57.t3.Request.call(_context57.t3, _context57.t10);
                        _context57.next = 23;
                        return _context57.t2.awrap.call(_context57.t2, _context57.t11);

                      case 23:
                        _context57.t12 = _context57.sent.arrayBuffer();
                        _context57.next = 26;
                        return _context57.t1.awrap.call(_context57.t1, _context57.t12);

                      case 26:
                        _context57.t13 = _context57.sent;
                        chunk = _context57.t0.from.call(_context57.t0, _context57.t13);
                        downloaded += chunk.length;

                        if (!decryptionStream) {
                          _context57.next = 39;
                          break;
                        }

                      case 30:
                        if (!(nextChunk !== i)) {
                          _context57.next = 35;
                          break;
                        }

                        _context57.next = 33;
                        return regeneratorRuntime.awrap(new Promise(function (resolve) {
                          return setTimeout(resolve, 500);
                        }));

                      case 33:
                        _context57.next = 30;
                        break;

                      case 35:
                        decryptionStream.write(chunk);
                        nextChunk += 1;
                        _context57.next = 41;
                        break;

                      case 39:
                        outputChunks[i] = chunk;

                        if (callback) {
                          callback({
                            bytesFinished: downloaded,
                            bytesTotal: fileSize
                          });
                        }

                      case 41:
                      case "end":
                        return _context57.stop();
                    }
                  }
                });
              }));

            case 27:
              if (!decryptionStream) {
                _context58.next = 31;
                break;
              }

              decryptionStream.end();
              _context58.next = 31;
              return regeneratorRuntime.awrap(decryptionPromise);

            case 31:
              _context58.next = 33;
              return regeneratorRuntime.awrap(ResponseToFormat(format, new Response(Buffer.concat(outputChunks))));

            case 33:
              return _context58.abrupt("return", _context58.sent);

            case 34:
            case "end":
              return _context58.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentParts(_ref57) {
      var libraryId, objectId, versionHash, path, response;
      return regeneratorRuntime.async(function ContentParts$(_context59) {
        while (1) {
          switch (_context59.prev = _context59.next) {
            case 0:
              libraryId = _ref57.libraryId, objectId = _ref57.objectId, versionHash = _ref57.versionHash;
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
              _context59.t0 = regeneratorRuntime;
              _context59.t1 = ResponseToJson;
              _context59.t2 = this.HttpClient;
              _context59.next = 10;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 10:
              _context59.t3 = _context59.sent;
              _context59.t4 = path;
              _context59.t5 = {
                headers: _context59.t3,
                method: "GET",
                path: _context59.t4
              };
              _context59.t6 = _context59.t2.Request.call(_context59.t2, _context59.t5);
              _context59.t7 = (0, _context59.t1)(_context59.t6);
              _context59.next = 17;
              return _context59.t0.awrap.call(_context59.t0, _context59.t7);

            case 17:
              response = _context59.sent;
              return _context59.abrupt("return", response.parts);

            case 19:
            case "end":
              return _context59.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentPart(_ref58) {
      var libraryId, objectId, versionHash, partHash, path;
      return regeneratorRuntime.async(function ContentPart$(_context60) {
        while (1) {
          switch (_context60.prev = _context60.next) {
            case 0:
              libraryId = _ref58.libraryId, objectId = _ref58.objectId, versionHash = _ref58.versionHash, partHash = _ref58.partHash;
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
              _context60.t0 = regeneratorRuntime;
              _context60.t1 = ResponseToJson;
              _context60.t2 = this.HttpClient;
              _context60.next = 11;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 11:
              _context60.t3 = _context60.sent;
              _context60.t4 = path;
              _context60.t5 = {
                headers: _context60.t3,
                method: "GET",
                path: _context60.t4
              };
              _context60.t6 = _context60.t2.Request.call(_context60.t2, _context60.t5);
              _context60.t7 = (0, _context60.t1)(_context60.t6);
              _context60.next = 18;
              return _context60.t0.awrap.call(_context60.t0, _context60.t7);

            case 18:
              return _context60.abrupt("return", _context60.sent);

            case 19:
            case "end":
              return _context60.stop();
          }
        }
      }, null, this);
    }
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
    value: function DownloadPart(_ref59) {
      var libraryId, objectId, versionHash, partHash, _ref59$format, format, _ref59$chunked, chunked, _ref59$chunkSize, chunkSize, callback, encrypted, encryption, path, headers, conk, response, data, bytesTotal, bytesFinished, stream, totalChunks, i, _response;

      return regeneratorRuntime.async(function DownloadPart$(_context62) {
        while (1) {
          switch (_context62.prev = _context62.next) {
            case 0:
              libraryId = _ref59.libraryId, objectId = _ref59.objectId, versionHash = _ref59.versionHash, partHash = _ref59.partHash, _ref59$format = _ref59.format, format = _ref59$format === void 0 ? "arrayBuffer" : _ref59$format, _ref59$chunked = _ref59.chunked, chunked = _ref59$chunked === void 0 ? false : _ref59$chunked, _ref59$chunkSize = _ref59.chunkSize, chunkSize = _ref59$chunkSize === void 0 ? 10000000 : _ref59$chunkSize, callback = _ref59.callback;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });
              ValidatePartHash(partHash);

              if (!(chunked && !callback)) {
                _context62.next = 5;
                break;
              }

              throw Error("No callback specified for chunked part download");

            case 5:
              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              encrypted = partHash.startsWith("hqpe");
              encryption = encrypted ? "cgck" : undefined;
              path = UrlJoin("q", versionHash || objectId, "data", partHash);
              _context62.next = 11;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                encryption: encryption
              }));

            case 11:
              headers = _context62.sent;

              if (!encrypted) {
                _context62.next = 16;
                break;
              }

              _context62.next = 15;
              return regeneratorRuntime.awrap(this.EncryptionConk({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 15:
              conk = _context62.sent;

            case 16:
              if (chunked) {
                _context62.next = 30;
                break;
              }

              _context62.next = 19;
              return regeneratorRuntime.awrap(this.HttpClient.Request({
                headers: headers,
                method: "GET",
                path: path
              }));

            case 19:
              response = _context62.sent;
              _context62.next = 22;
              return regeneratorRuntime.awrap(response.arrayBuffer());

            case 22:
              data = _context62.sent;

              if (!encrypted) {
                _context62.next = 27;
                break;
              }

              _context62.next = 26;
              return regeneratorRuntime.awrap(Crypto.Decrypt(conk, data));

            case 26:
              data = _context62.sent;

            case 27:
              _context62.next = 29;
              return regeneratorRuntime.awrap(ResponseToFormat(format, new Response(data)));

            case 29:
              return _context62.abrupt("return", _context62.sent);

            case 30:
              _context62.next = 32;
              return regeneratorRuntime.awrap(this.ContentPart({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                partHash: partHash
              }));

            case 32:
              bytesTotal = _context62.sent.part.size;
              bytesFinished = 0;

              if (!encrypted) {
                _context62.next = 39;
                break;
              }

              _context62.next = 37;
              return regeneratorRuntime.awrap(Crypto.OpenDecryptionStream(conk));

            case 37:
              stream = _context62.sent;
              stream = stream.on("data", function _callee7(chunk) {
                var arrayBuffer;
                return regeneratorRuntime.async(function _callee7$(_context61) {
                  while (1) {
                    switch (_context61.prev = _context61.next) {
                      case 0:
                        if (!(format !== "buffer")) {
                          _context61.next = 9;
                          break;
                        }

                        arrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);

                        if (!(format === "arrayBuffer")) {
                          _context61.next = 6;
                          break;
                        }

                        chunk = arrayBuffer;
                        _context61.next = 9;
                        break;

                      case 6:
                        _context61.next = 8;
                        return regeneratorRuntime.awrap(ResponseToFormat(format, new Response(arrayBuffer)));

                      case 8:
                        chunk = _context61.sent;

                      case 9:
                        callback({
                          bytesFinished: bytesFinished,
                          bytesTotal: bytesTotal,
                          chunk: chunk
                        });

                      case 10:
                      case "end":
                        return _context61.stop();
                    }
                  }
                });
              });

            case 39:
              totalChunks = Math.ceil(bytesTotal / chunkSize);
              i = 0;

            case 41:
              if (!(i < totalChunks)) {
                _context62.next = 68;
                break;
              }

              headers["Range"] = "bytes=".concat(bytesFinished, "-").concat(bytesFinished + chunkSize - 1);
              _context62.next = 45;
              return regeneratorRuntime.awrap(this.HttpClient.Request({
                headers: headers,
                method: "GET",
                path: path
              }));

            case 45:
              _response = _context62.sent;
              bytesFinished = Math.min(bytesFinished + chunkSize, bytesTotal);

              if (!encrypted) {
                _context62.next = 57;
                break;
              }

              _context62.t0 = stream;
              _context62.t1 = Uint8Array;
              _context62.next = 52;
              return regeneratorRuntime.awrap(_response.arrayBuffer());

            case 52:
              _context62.t2 = _context62.sent;
              _context62.t3 = new _context62.t1(_context62.t2);

              _context62.t0.write.call(_context62.t0, _context62.t3);

              _context62.next = 65;
              break;

            case 57:
              _context62.t4 = callback;
              _context62.t5 = bytesFinished;
              _context62.t6 = bytesTotal;
              _context62.next = 62;
              return regeneratorRuntime.awrap(ResponseToFormat(format, _response));

            case 62:
              _context62.t7 = _context62.sent;
              _context62.t8 = {
                bytesFinished: _context62.t5,
                bytesTotal: _context62.t6,
                chunk: _context62.t7
              };
              (0, _context62.t4)(_context62.t8);

            case 65:
              i++;
              _context62.next = 41;
              break;

            case 68:
              if (!stream) {
                _context62.next = 72;
                break;
              }

              // Wait for decryption to complete
              stream.end();
              _context62.next = 72;
              return regeneratorRuntime.awrap(new Promise(function (resolve) {
                return stream.on("finish", function () {
                  resolve();
                });
              }));

            case 72:
            case "end":
              return _context62.stop();
          }
        }
      }, null, this);
    }
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
    value: function EncryptionConk(_ref60) {
      var libraryId, objectId, writeToken, owner, capKey, existingUserCap, metadata, kmsAddress, _kmsPublicKey, kmsCapKey, existingKMSCap;

      return regeneratorRuntime.async(function EncryptionConk$(_context63) {
        while (1) {
          switch (_context63.prev = _context63.next) {
            case 0:
              libraryId = _ref60.libraryId, objectId = _ref60.objectId, writeToken = _ref60.writeToken;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });

              if (writeToken) {
                ValidateWriteToken(writeToken);
              }

              _context63.next = 5;
              return regeneratorRuntime.awrap(this.authClient.Owner({
                id: objectId,
                abi: ContentContract.abi
              }));

            case 5:
              owner = _context63.sent;

              if (this.utils.EqualAddress(owner, this.signer.address)) {
                _context63.next = 12;
                break;
              }

              if (this.reencryptionConks[objectId]) {
                _context63.next = 11;
                break;
              }

              _context63.next = 10;
              return regeneratorRuntime.awrap(this.authClient.ReEncryptionConk({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 10:
              this.reencryptionConks[objectId] = _context63.sent;

            case 11:
              return _context63.abrupt("return", this.reencryptionConks[objectId]);

            case 12:
              if (this.encryptionConks[objectId]) {
                _context63.next = 53;
                break;
              }

              capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
              _context63.next = 16;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                // Cap may only exist in draft
                objectId: objectId,
                writeToken: writeToken,
                metadataSubtree: capKey
              }));

            case 16:
              existingUserCap = _context63.sent;

              if (!existingUserCap) {
                _context63.next = 23;
                break;
              }

              _context63.next = 20;
              return regeneratorRuntime.awrap(Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey));

            case 20:
              this.encryptionConks[objectId] = _context63.sent;
              _context63.next = 53;
              break;

            case 23:
              _context63.next = 25;
              return regeneratorRuntime.awrap(Crypto.GeneratePrimaryConk());

            case 25:
              this.encryptionConks[objectId] = _context63.sent;

              if (!writeToken) {
                _context63.next = 53;
                break;
              }

              metadata = {};
              _context63.next = 30;
              return regeneratorRuntime.awrap(Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey));

            case 30:
              metadata[capKey] = _context63.sent;
              _context63.prev = 31;
              _context63.next = 34;
              return regeneratorRuntime.awrap(this.authClient.KMSAddress({
                objectId: objectId
              }));

            case 34:
              kmsAddress = _context63.sent;
              _context63.next = 37;
              return regeneratorRuntime.awrap(this.authClient.KMSInfo({
                objectId: objectId
              }));

            case 37:
              _kmsPublicKey = _context63.sent.publicKey;
              kmsCapKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
              _context63.next = 41;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                // Cap may only exist in draft
                objectId: objectId,
                writeToken: writeToken,
                metadataSubtree: kmsCapKey
              }));

            case 41:
              existingKMSCap = _context63.sent;

              if (existingKMSCap) {
                _context63.next = 46;
                break;
              }

              _context63.next = 45;
              return regeneratorRuntime.awrap(Crypto.EncryptConk(this.encryptionConks[objectId], _kmsPublicKey));

            case 45:
              metadata[kmsCapKey] = _context63.sent;

            case 46:
              _context63.next = 51;
              break;

            case 48:
              _context63.prev = 48;
              _context63.t0 = _context63["catch"](31);
              // eslint-disable-next-line no-console
              console.error("Failed to create encryption cap for KMS with public key " + kmsPublicKey);

            case 51:
              _context63.next = 53;
              return regeneratorRuntime.awrap(this.MergeMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken,
                metadata: metadata
              }));

            case 53:
              return _context63.abrupt("return", this.encryptionConks[objectId]);

            case 54:
            case "end":
              return _context63.stop();
          }
        }
      }, null, this, [[31, 48]]);
    }
    /**
     * Encrypt the specified chunk for the specified object or draft
     *
     * @methodGroup Encryption
     *
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {ArrayBuffer | Buffer} chunk - The data to encrypt
     *
     * @return {Promise<ArrayBuffer>}
     */

  }, {
    key: "Encrypt",
    value: function Encrypt(_ref61) {
      var libraryId, objectId, writeToken, chunk, conk, data;
      return regeneratorRuntime.async(function Encrypt$(_context64) {
        while (1) {
          switch (_context64.prev = _context64.next) {
            case 0:
              libraryId = _ref61.libraryId, objectId = _ref61.objectId, writeToken = _ref61.writeToken, chunk = _ref61.chunk;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              _context64.next = 4;
              return regeneratorRuntime.awrap(this.EncryptionConk({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken
              }));

            case 4:
              conk = _context64.sent;
              _context64.next = 7;
              return regeneratorRuntime.awrap(Crypto.Encrypt(conk, chunk));

            case 7:
              data = _context64.sent;
              return _context64.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

            case 9:
            case "end":
              return _context64.stop();
          }
        }
      }, null, this);
    }
    /**
     * Decrypt the specified chunk for the specified object or draft
     *
     * @methodGroup Encryption
     *
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {ArrayBuffer | Buffer} chunk - The data to decrypt
     *
     * @return {Promise<ArrayBuffer>}
     */

  }, {
    key: "Decrypt",
    value: function Decrypt(_ref62) {
      var libraryId, objectId, writeToken, chunk, conk, data;
      return regeneratorRuntime.async(function Decrypt$(_context65) {
        while (1) {
          switch (_context65.prev = _context65.next) {
            case 0:
              libraryId = _ref62.libraryId, objectId = _ref62.objectId, writeToken = _ref62.writeToken, chunk = _ref62.chunk;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              _context65.next = 4;
              return regeneratorRuntime.awrap(this.EncryptionConk({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken
              }));

            case 4:
              conk = _context65.sent;
              _context65.next = 7;
              return regeneratorRuntime.awrap(Crypto.Decrypt(conk, chunk));

            case 7:
              data = _context65.sent;
              return _context65.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

            case 9:
            case "end":
              return _context65.stop();
          }
        }
      }, null, this);
    }
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
    value: function CreatePart(_ref63) {
      var libraryId, objectId, writeToken, encryption, path, openResponse;
      return regeneratorRuntime.async(function CreatePart$(_context66) {
        while (1) {
          switch (_context66.prev = _context66.next) {
            case 0:
              libraryId = _ref63.libraryId, objectId = _ref63.objectId, writeToken = _ref63.writeToken, encryption = _ref63.encryption;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              path = UrlJoin("q", writeToken, "parts");
              _context66.t0 = regeneratorRuntime;
              _context66.t1 = ResponseToJson;
              _context66.t2 = this.HttpClient;
              _context66.next = 9;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true,
                encryption: encryption
              }));

            case 9:
              _context66.t3 = _context66.sent;
              _context66.t4 = path;
              _context66.t5 = {
                headers: _context66.t3,
                method: "POST",
                path: _context66.t4,
                bodyType: "BINARY",
                body: "",
                failover: false
              };
              _context66.t6 = _context66.t2.Request.call(_context66.t2, _context66.t5);
              _context66.t7 = (0, _context66.t1)(_context66.t6);
              _context66.next = 16;
              return _context66.t0.awrap.call(_context66.t0, _context66.t7);

            case 16:
              openResponse = _context66.sent;
              return _context66.abrupt("return", openResponse.part.write_token);

            case 18:
            case "end":
              return _context66.stop();
          }
        }
      }, null, this);
    }
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
    value: function UploadPartChunk(_ref64) {
      var libraryId, objectId, writeToken, partWriteToken, chunk, encryption, _conk, path;

      return regeneratorRuntime.async(function UploadPartChunk$(_context67) {
        while (1) {
          switch (_context67.prev = _context67.next) {
            case 0:
              libraryId = _ref64.libraryId, objectId = _ref64.objectId, writeToken = _ref64.writeToken, partWriteToken = _ref64.partWriteToken, chunk = _ref64.chunk, encryption = _ref64.encryption;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);

              if (!(encryption && encryption !== "none")) {
                _context67.next = 10;
                break;
              }

              _context67.next = 6;
              return regeneratorRuntime.awrap(this.EncryptionConk({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken
              }));

            case 6:
              _conk = _context67.sent;
              _context67.next = 9;
              return regeneratorRuntime.awrap(Crypto.Encrypt(_conk, chunk));

            case 9:
              chunk = _context67.sent;

            case 10:
              path = UrlJoin("q", writeToken, "parts");
              _context67.t0 = regeneratorRuntime;
              _context67.t1 = ResponseToJson;
              _context67.t2 = this.HttpClient;
              _context67.next = 16;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true,
                encryption: encryption
              }));

            case 16:
              _context67.t3 = _context67.sent;
              _context67.t4 = UrlJoin(path, partWriteToken);
              _context67.t5 = chunk;
              _context67.t6 = {
                headers: _context67.t3,
                method: "POST",
                path: _context67.t4,
                body: _context67.t5,
                bodyType: "BINARY",
                failover: false
              };
              _context67.t7 = _context67.t2.Request.call(_context67.t2, _context67.t6);
              _context67.t8 = (0, _context67.t1)(_context67.t7);
              _context67.next = 24;
              return _context67.t0.awrap.call(_context67.t0, _context67.t8);

            case 24:
            case "end":
              return _context67.stop();
          }
        }
      }, null, this);
    }
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
    value: function FinalizePart(_ref65) {
      var libraryId, objectId, writeToken, partWriteToken, encryption, path;
      return regeneratorRuntime.async(function FinalizePart$(_context68) {
        while (1) {
          switch (_context68.prev = _context68.next) {
            case 0:
              libraryId = _ref65.libraryId, objectId = _ref65.objectId, writeToken = _ref65.writeToken, partWriteToken = _ref65.partWriteToken, encryption = _ref65.encryption;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              path = UrlJoin("q", writeToken, "parts");
              _context68.t0 = regeneratorRuntime;
              _context68.t1 = ResponseToJson;
              _context68.t2 = regeneratorRuntime;
              _context68.t3 = this.HttpClient;
              _context68.next = 10;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true,
                encryption: encryption
              }));

            case 10:
              _context68.t4 = _context68.sent;
              _context68.t5 = UrlJoin(path, partWriteToken);
              _context68.t6 = {
                headers: _context68.t4,
                method: "POST",
                path: _context68.t5,
                bodyType: "BINARY",
                body: "",
                failover: false
              };
              _context68.t7 = _context68.t3.Request.call(_context68.t3, _context68.t6);
              _context68.next = 16;
              return _context68.t2.awrap.call(_context68.t2, _context68.t7);

            case 16:
              _context68.t8 = _context68.sent;
              _context68.t9 = (0, _context68.t1)(_context68.t8);
              _context68.next = 20;
              return _context68.t0.awrap.call(_context68.t0, _context68.t9);

            case 20:
              return _context68.abrupt("return", _context68.sent);

            case 21:
            case "end":
              return _context68.stop();
          }
        }
      }, null, this);
    }
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
    value: function UploadPart(_ref66) {
      var libraryId, objectId, writeToken, data, _ref66$encryption, encryption, partWriteToken;

      return regeneratorRuntime.async(function UploadPart$(_context69) {
        while (1) {
          switch (_context69.prev = _context69.next) {
            case 0:
              libraryId = _ref66.libraryId, objectId = _ref66.objectId, writeToken = _ref66.writeToken, data = _ref66.data, _ref66$encryption = _ref66.encryption, encryption = _ref66$encryption === void 0 ? "none" : _ref66$encryption;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              _context69.next = 5;
              return regeneratorRuntime.awrap(this.CreatePart({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken,
                encryption: encryption
              }));

            case 5:
              partWriteToken = _context69.sent;
              _context69.next = 8;
              return regeneratorRuntime.awrap(this.UploadPartChunk({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken,
                partWriteToken: partWriteToken,
                chunk: data,
                encryption: encryption
              }));

            case 8:
              _context69.next = 10;
              return regeneratorRuntime.awrap(this.FinalizePart({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken,
                partWriteToken: partWriteToken,
                encryption: encryption
              }));

            case 10:
              return _context69.abrupt("return", _context69.sent);

            case 11:
            case "end":
              return _context69.stop();
          }
        }
      }, null, this);
    }
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
    value: function DeletePart(_ref67) {
      var libraryId, objectId, writeToken, partHash, path;
      return regeneratorRuntime.async(function DeletePart$(_context70) {
        while (1) {
          switch (_context70.prev = _context70.next) {
            case 0:
              libraryId = _ref67.libraryId, objectId = _ref67.objectId, writeToken = _ref67.writeToken, partHash = _ref67.partHash;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateWriteToken(writeToken);
              ValidatePartHash(partHash);
              path = UrlJoin("q", writeToken, "parts", partHash);
              _context70.t0 = regeneratorRuntime;
              _context70.t1 = this.HttpClient;
              _context70.next = 9;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 9:
              _context70.t2 = _context70.sent;
              _context70.t3 = path;
              _context70.t4 = {
                headers: _context70.t2,
                method: "DELETE",
                path: _context70.t3,
                failover: false
              };
              _context70.t5 = _context70.t1.Request.call(_context70.t1, _context70.t4);
              _context70.next = 15;
              return _context70.t0.awrap.call(_context70.t0, _context70.t5);

            case 15:
            case "end":
              return _context70.stop();
          }
        }
      }, null, this);
    }
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
     * @param {Object=} fileInfo - Files to upload (See UploadFiles/UploadFilesFromS3 method)
     * @param {boolean=} encrypt=false - (Local files only) - If specified, files will be encrypted
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
    value: function CreateProductionMaster(_ref68) {
      var libraryId, name, description, _ref68$metadata, metadata, fileInfo, _ref68$encrypt, encrypt, access, _ref68$copy, copy, callback, contentType, _ref69, id, write_token, accessParameter, region, bucket, accessKey, secret, _ref70, logs, errors, warnings, finalizeResponse;

      return regeneratorRuntime.async(function CreateProductionMaster$(_context71) {
        while (1) {
          switch (_context71.prev = _context71.next) {
            case 0:
              libraryId = _ref68.libraryId, name = _ref68.name, description = _ref68.description, _ref68$metadata = _ref68.metadata, metadata = _ref68$metadata === void 0 ? {} : _ref68$metadata, fileInfo = _ref68.fileInfo, _ref68$encrypt = _ref68.encrypt, encrypt = _ref68$encrypt === void 0 ? false : _ref68$encrypt, access = _ref68.access, _ref68$copy = _ref68.copy, copy = _ref68$copy === void 0 ? false : _ref68$copy, callback = _ref68.callback;
              ValidateLibrary(libraryId);
              _context71.next = 4;
              return regeneratorRuntime.awrap(this.ContentType({
                name: "Production Master"
              }));

            case 4:
              contentType = _context71.sent;

              if (contentType) {
                _context71.next = 7;
                break;
              }

              throw "Unable to access content type 'Production Master' to create production master";

            case 7:
              _context71.next = 9;
              return regeneratorRuntime.awrap(this.CreateContentObject({
                libraryId: libraryId,
                options: {
                  type: contentType.hash
                }
              }));

            case 9:
              _ref69 = _context71.sent;
              id = _ref69.id;
              write_token = _ref69.write_token;

              if (!fileInfo) {
                _context71.next = 22;
                break;
              }

              if (!access) {
                _context71.next = 20;
                break;
              }

              // S3 Upload
              region = access.region, bucket = access.bucket, accessKey = access.accessKey, secret = access.secret;
              _context71.next = 17;
              return regeneratorRuntime.awrap(this.UploadFilesFromS3({
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
              }));

            case 17:
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
              _context71.next = 22;
              break;

            case 20:
              _context71.next = 22;
              return regeneratorRuntime.awrap(this.UploadFiles({
                libraryId: libraryId,
                objectId: id,
                writeToken: write_token,
                fileInfo: fileInfo,
                callback: callback,
                encryption: encrypt ? "cgck" : "none"
              }));

            case 22:
              _context71.next = 24;
              return regeneratorRuntime.awrap(this.CallBitcodeMethod({
                libraryId: libraryId,
                objectId: id,
                writeToken: write_token,
                method: UrlJoin("media", "production_master", "init"),
                body: {
                  access: accessParameter
                },
                constant: false
              }));

            case 24:
              _ref70 = _context71.sent;
              logs = _ref70.logs;
              errors = _ref70.errors;
              warnings = _ref70.warnings;
              _context71.next = 30;
              return regeneratorRuntime.awrap(this.MergeMetadata({
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
              }));

            case 30:
              _context71.next = 32;
              return regeneratorRuntime.awrap(this.FinalizeContentObject({
                libraryId: libraryId,
                objectId: id,
                writeToken: write_token,
                awaitCommitConfirmation: false
              }));

            case 32:
              finalizeResponse = _context71.sent;
              return _context71.abrupt("return", _objectSpread({
                errors: errors || [],
                logs: logs || [],
                warnings: warnings || []
              }, finalizeResponse));

            case 34:
            case "end":
              return _context71.stop();
          }
        }
      }, null, this);
    }
    /**
     * Create a mezzanine of the given master content object
     *
     * @methodGroup Media
     * @namedParams
     * @param {string} libraryId - ID of the mezzanine library
     * @param {string=} objectId - ID of existing object (if not specified, new object will be created)
     * @param {string} name - Name for mezzanine content object
     * @param {string=} description - Description for mezzanine content object
     * @param {Object=} metadata - Additional metadata for mezzanine content object
     * @param {string} masterVersionHash - The version hash of the production master content object
     * @param {string=} variant=default - What variant of the master content object to use
     * @param {string=} offeringKey=default - The key of the offering to create
     * @param {Object=} abrProfile - Custom ABR profile. If not specified, the profile of the mezzanine library will be used
     *
     * @return {Object} - The finalize response for the object, as well as logs, warnings and errors from the mezzanine initialization
     */

  }, {
    key: "CreateABRMezzanine",
    value: function CreateABRMezzanine(_ref71) {
      var libraryId, objectId, name, description, _ref71$metadata, metadata, masterVersionHash, abrProfile, _ref71$variant, variant, _ref71$offeringKey, offeringKey, abrMezType, id, write_token, editResponse, createResponse, masterName, authorizationTokens, headers, body, storeClear, _ref72, logs, errors, warnings, finalizeResponse;

      return regeneratorRuntime.async(function CreateABRMezzanine$(_context72) {
        while (1) {
          switch (_context72.prev = _context72.next) {
            case 0:
              libraryId = _ref71.libraryId, objectId = _ref71.objectId, name = _ref71.name, description = _ref71.description, _ref71$metadata = _ref71.metadata, metadata = _ref71$metadata === void 0 ? {} : _ref71$metadata, masterVersionHash = _ref71.masterVersionHash, abrProfile = _ref71.abrProfile, _ref71$variant = _ref71.variant, variant = _ref71$variant === void 0 ? "default" : _ref71$variant, _ref71$offeringKey = _ref71.offeringKey, offeringKey = _ref71$offeringKey === void 0 ? "default" : _ref71$offeringKey;
              ValidateLibrary(libraryId);
              ValidateVersion(masterVersionHash);
              _context72.next = 5;
              return regeneratorRuntime.awrap(this.ContentType({
                name: "ABR Master"
              }));

            case 5:
              abrMezType = _context72.sent;

              if (abrMezType) {
                _context72.next = 8;
                break;
              }

              throw Error("Unable to access ABR Master content type in library with ID=" + libraryId);

            case 8:
              if (masterVersionHash) {
                _context72.next = 10;
                break;
              }

              throw Error("Master version hash not specified");

            case 10:
              if (!objectId) {
                _context72.next = 18;
                break;
              }

              _context72.next = 13;
              return regeneratorRuntime.awrap(this.EditContentObject({
                libraryId: libraryId,
                objectId: objectId,
                options: {
                  type: abrMezType.hash
                }
              }));

            case 13:
              editResponse = _context72.sent;
              id = editResponse.id;
              write_token = editResponse.write_token;
              _context72.next = 23;
              break;

            case 18:
              _context72.next = 20;
              return regeneratorRuntime.awrap(this.CreateContentObject({
                libraryId: libraryId,
                options: {
                  type: abrMezType.hash
                }
              }));

            case 20:
              createResponse = _context72.sent;
              id = createResponse.id;
              write_token = createResponse.write_token;

            case 23:
              _context72.next = 25;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                versionHash: masterVersionHash,
                metadataSubtree: "public/name"
              }));

            case 25:
              masterName = _context72.sent;
              // Include authorization for library, master, and mezzanine
              authorizationTokens = [];
              _context72.t0 = authorizationTokens;
              _context72.next = 30;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                libraryId: libraryId,
                objectId: id,
                update: true
              }));

            case 30:
              _context72.t1 = _context72.sent;

              _context72.t0.push.call(_context72.t0, _context72.t1);

              _context72.t2 = authorizationTokens;
              _context72.next = 35;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                libraryId: libraryId
              }));

            case 35:
              _context72.t3 = _context72.sent;

              _context72.t2.push.call(_context72.t2, _context72.t3);

              _context72.t4 = authorizationTokens;
              _context72.next = 40;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                versionHash: masterVersionHash
              }));

            case 40:
              _context72.t5 = _context72.sent;

              _context72.t4.push.call(_context72.t4, _context72.t5);

              headers = {
                Authorization: authorizationTokens.map(function (token) {
                  return "Bearer ".concat(token);
                }).join(",")
              };
              body = {
                offering_key: offeringKey,
                variant_key: variant,
                prod_master_hash: masterVersionHash
              };
              storeClear = false;

              if (!abrProfile) {
                _context72.next = 50;
                break;
              }

              body.abr_profile = abrProfile;
              storeClear = abrProfile.store_clear;
              _context72.next = 53;
              break;

            case 50:
              _context72.next = 52;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: this.utils.AddressToObjectId(this.utils.HashToAddress(libraryId)),
                metadataSubtree: "abr_profile/store_clear"
              }));

            case 52:
              storeClear = _context72.sent;

            case 53:
              if (storeClear) {
                _context72.next = 56;
                break;
              }

              _context72.next = 56;
              return regeneratorRuntime.awrap(this.EncryptionConk({
                libraryId: libraryId,
                objectId: id,
                writeToken: write_token
              }));

            case 56:
              _context72.next = 58;
              return regeneratorRuntime.awrap(this.CallBitcodeMethod({
                libraryId: libraryId,
                objectId: id,
                writeToken: write_token,
                method: UrlJoin("media", "abr_mezzanine", "init"),
                headers: headers,
                body: body,
                constant: false
              }));

            case 58:
              _ref72 = _context72.sent;
              logs = _ref72.logs;
              errors = _ref72.errors;
              warnings = _ref72.warnings;
              _context72.next = 64;
              return regeneratorRuntime.awrap(this.MergeMetadata({
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
              }));

            case 64:
              _context72.next = 66;
              return regeneratorRuntime.awrap(this.FinalizeContentObject({
                libraryId: libraryId,
                objectId: id,
                writeToken: write_token
              }));

            case 66:
              finalizeResponse = _context72.sent;
              return _context72.abrupt("return", _objectSpread({
                logs: logs || [],
                warnings: warnings || [],
                errors: errors || []
              }, finalizeResponse));

            case 68:
            case "end":
              return _context72.stop();
          }
        }
      }, null, this);
    }
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
    value: function StartABRMezzanineJobs(_ref73) {
      var _this7 = this;

      var libraryId, objectId, _ref73$offeringKey, offeringKey, _ref73$access, access, mezzanineMetadata, prepSpecs, masterVersionHashes, authorizationTokens, headers, accessParameter, region, bucket, accessKey, secret, processingDraft, lroInfo, statusDraft, _ref74, data, errors, warnings, logs;

      return regeneratorRuntime.async(function StartABRMezzanineJobs$(_context74) {
        while (1) {
          switch (_context74.prev = _context74.next) {
            case 0:
              libraryId = _ref73.libraryId, objectId = _ref73.objectId, _ref73$offeringKey = _ref73.offeringKey, offeringKey = _ref73$offeringKey === void 0 ? "default" : _ref73$offeringKey, _ref73$access = _ref73.access, access = _ref73$access === void 0 ? {} : _ref73$access;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              _context74.next = 4;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
              }));

            case 4:
              mezzanineMetadata = _context74.sent;
              prepSpecs = mezzanineMetadata[offeringKey].mez_prep_specs || []; // Retrieve all masters associated with this offering

              masterVersionHashes = Object.keys(prepSpecs).map(function (spec) {
                return (prepSpecs[spec].source_streams || []).map(function (stream) {
                  return stream.source_hash;
                });
              }); // Flatten and filter

              masterVersionHashes = [].concat.apply([], masterVersionHashes).filter(function (hash) {
                return hash;
              }).filter(function (v, i, a) {
                return a.indexOf(v) === i;
              }); // Retrieve authorization tokens for all masters and the mezzanine

              _context74.next = 10;
              return regeneratorRuntime.awrap(Promise.all(masterVersionHashes.map(function _callee8(versionHash) {
                return regeneratorRuntime.async(function _callee8$(_context73) {
                  while (1) {
                    switch (_context73.prev = _context73.next) {
                      case 0:
                        _context73.next = 2;
                        return regeneratorRuntime.awrap(_this7.authClient.AuthorizationToken({
                          versionHash: versionHash
                        }));

                      case 2:
                        return _context73.abrupt("return", _context73.sent);

                      case 3:
                      case "end":
                        return _context73.stop();
                    }
                  }
                });
              })));

            case 10:
              authorizationTokens = _context74.sent;
              _context74.next = 13;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 13:
              _context74.t0 = _context74.sent;
              _context74.t1 = _toConsumableArray(authorizationTokens);
              authorizationTokens = [_context74.t0].concat(_context74.t1);
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

              _context74.next = 20;
              return regeneratorRuntime.awrap(this.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 20:
              processingDraft = _context74.sent;
              lroInfo = {
                write_token: processingDraft.write_token,
                node: this.HttpClient.BaseURI().toString(),
                offering: offeringKey
              }; // Update metadata with LRO version write token

              _context74.next = 24;
              return regeneratorRuntime.awrap(this.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 24:
              statusDraft = _context74.sent;
              _context74.next = 27;
              return regeneratorRuntime.awrap(this.ReplaceMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: statusDraft.write_token,
                metadataSubtree: "lro_draft_".concat(offeringKey),
                metadata: lroInfo
              }));

            case 27:
              _context74.next = 29;
              return regeneratorRuntime.awrap(this.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: statusDraft.write_token
              }));

            case 29:
              _context74.next = 31;
              return regeneratorRuntime.awrap(this.CallBitcodeMethod({
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
              }));

            case 31:
              _ref74 = _context74.sent;
              data = _ref74.data;
              errors = _ref74.errors;
              warnings = _ref74.warnings;
              logs = _ref74.logs;
              return _context74.abrupt("return", {
                lro_draft: lroInfo,
                writeToken: processingDraft.write_token,
                data: data,
                logs: logs || [],
                warnings: warnings || [],
                errors: errors || []
              });

            case 37:
            case "end":
              return _context74.stop();
          }
        }
      }, null, this);
    }
    /**
     * Retrieve status information for a long running operation (LRO) on the given object.
     *
     * @methodGroup Media
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string=} offeringKey=default - Offering key of the mezzanine
     *
     * @return {Promise<Object>} - LRO status
     */

  }, {
    key: "LROStatus",
    value: function LROStatus(_ref75) {
      var libraryId, objectId, _ref75$offeringKey, offeringKey, lroDraft, ready, httpClient, error, result;

      return regeneratorRuntime.async(function LROStatus$(_context75) {
        while (1) {
          switch (_context75.prev = _context75.next) {
            case 0:
              libraryId = _ref75.libraryId, objectId = _ref75.objectId, _ref75$offeringKey = _ref75.offeringKey, offeringKey = _ref75$offeringKey === void 0 ? "default" : _ref75$offeringKey;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              _context75.next = 4;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: "lro_draft_".concat(offeringKey)
              }));

            case 4:
              _context75.t0 = _context75.sent;

              if (_context75.t0) {
                _context75.next = 9;
                break;
              }

              _context75.next = 8;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: "lro_draft"
              }));

            case 8:
              _context75.t0 = _context75.sent;

            case 9:
              lroDraft = _context75.t0;

              if (!(!lroDraft || !lroDraft.write_token)) {
                _context75.next = 19;
                break;
              }

              _context75.next = 13;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: UrlJoin("abr_mezzanine", "offerings", offeringKey, "ready")
              }));

            case 13:
              ready = _context75.sent;

              if (!ready) {
                _context75.next = 18;
                break;
              }

              throw Error("Mezzanine already finalized for offering '".concat(offeringKey, "'"));

            case 18:
              throw Error("No LRO draft found for this mezzanine");

            case 19:
              httpClient = this.HttpClient;
              _context75.prev = 20;
              // Point directly to the node containing the draft
              this.HttpClient = new HttpClient({
                uris: [lroDraft.node],
                debug: httpClient.debug
              });
              _context75.next = 24;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: lroDraft.write_token,
                metadataSubtree: "lro_status"
              }));

            case 24:
              result = _context75.sent;
              _context75.next = 30;
              break;

            case 27:
              _context75.prev = 27;
              _context75.t1 = _context75["catch"](20);
              error = _context75.t1;

            case 30:
              _context75.prev = 30;
              this.HttpClient = httpClient;
              return _context75.finish(30);

            case 33:
              if (!error) {
                _context75.next = 35;
                break;
              }

              throw error;

            case 35:
              return _context75.abrupt("return", result);

            case 36:
            case "end":
              return _context75.stop();
          }
        }
      }, null, this, [[20, 27, 30, 33]]);
    }
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
    value: function FinalizeABRMezzanine(_ref76) {
      var libraryId, objectId, _ref76$offeringKey, offeringKey, lroDraft, httpClient, error, result, mezzanineMetadata, masterHash, authorizationTokens, headers, _ref77, data, errors, warnings, logs, finalizeResponse;

      return regeneratorRuntime.async(function FinalizeABRMezzanine$(_context76) {
        while (1) {
          switch (_context76.prev = _context76.next) {
            case 0:
              libraryId = _ref76.libraryId, objectId = _ref76.objectId, _ref76$offeringKey = _ref76.offeringKey, offeringKey = _ref76$offeringKey === void 0 ? "default" : _ref76$offeringKey;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              _context76.next = 4;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: "lro_draft_".concat(offeringKey)
              }));

            case 4:
              lroDraft = _context76.sent;

              if (!(!lroDraft || !lroDraft.write_token)) {
                _context76.next = 7;
                break;
              }

              throw Error("No LRO draft found for this mezzanine");

            case 7:
              httpClient = this.HttpClient;
              _context76.prev = 8;
              // Point directly to the node containing the draft
              this.HttpClient = new HttpClient({
                uris: [lroDraft.node],
                debug: httpClient.debug
              });
              _context76.next = 12;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: lroDraft.write_token,
                metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
              }));

            case 12:
              mezzanineMetadata = _context76.sent;
              masterHash = mezzanineMetadata["default"].prod_master_hash; // Authorization token for mezzanine and master

              _context76.next = 16;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                libraryId: libraryId,
                objectId: objectId,
                update: true
              }));

            case 16:
              _context76.t0 = _context76.sent;
              _context76.next = 19;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                versionHash: masterHash
              }));

            case 19:
              _context76.t1 = _context76.sent;
              authorizationTokens = [_context76.t0, _context76.t1];
              headers = {
                Authorization: authorizationTokens.map(function (token) {
                  return "Bearer ".concat(token);
                }).join(",")
              };
              _context76.next = 24;
              return regeneratorRuntime.awrap(this.CallBitcodeMethod({
                objectId: objectId,
                libraryId: libraryId,
                writeToken: lroDraft.write_token,
                method: UrlJoin("media", "abr_mezzanine", "offerings", offeringKey, "finalize"),
                headers: headers,
                constant: false
              }));

            case 24:
              _ref77 = _context76.sent;
              data = _ref77.data;
              errors = _ref77.errors;
              warnings = _ref77.warnings;
              logs = _ref77.logs;
              _context76.next = 31;
              return regeneratorRuntime.awrap(this.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: lroDraft.write_token,
                awaitCommitConfirmation: false
              }));

            case 31:
              finalizeResponse = _context76.sent;
              result = _objectSpread({
                data: data,
                logs: logs || [],
                warnings: warnings || [],
                errors: errors || []
              }, finalizeResponse);
              _context76.next = 38;
              break;

            case 35:
              _context76.prev = 35;
              _context76.t2 = _context76["catch"](8);
              error = _context76.t2;

            case 38:
              _context76.prev = 38;
              // Ensure original http client is restored
              this.HttpClient = httpClient;
              return _context76.finish(38);

            case 41:
              if (!error) {
                _context76.next = 43;
                break;
              }

              throw error;

            case 43:
              return _context76.abrupt("return", result);

            case 44:
            case "end":
              return _context76.stop();
          }
        }
      }, null, this, [[8, 35, 38, 41]]);
    }
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
    value: function SetAccessCharge(_ref78) {
      var objectId, accessCharge;
      return regeneratorRuntime.async(function SetAccessCharge$(_context77) {
        while (1) {
          switch (_context77.prev = _context77.next) {
            case 0:
              objectId = _ref78.objectId, accessCharge = _ref78.accessCharge;
              ValidateObject(objectId);
              this.Log("Setting access charge: ".concat(objectId, " ").concat(accessCharge));
              _context77.next = 5;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
                contractAddress: Utils.HashToAddress(objectId),
                abi: ContentContract.abi,
                methodName: "setAccessCharge",
                methodArgs: [Utils.EtherToWei(accessCharge).toString()],
                signer: this.signer
              }));

            case 5:
            case "end":
              return _context77.stop();
          }
        }
      }, null, this);
    }
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
    value: function AccessType(_ref79) {
      var id;
      return regeneratorRuntime.async(function AccessType$(_context78) {
        while (1) {
          switch (_context78.prev = _context78.next) {
            case 0:
              id = _ref79.id;
              _context78.next = 3;
              return regeneratorRuntime.awrap(this.authClient.AccessType(id));

            case 3:
              return _context78.abrupt("return", _context78.sent);

            case 4:
            case "end":
              return _context78.stop();
          }
        }
      }, null, this);
    }
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
    value: function AccessInfo(_ref80) {
      var objectId, args, info;
      return regeneratorRuntime.async(function AccessInfo$(_context79) {
        while (1) {
          switch (_context79.prev = _context79.next) {
            case 0:
              objectId = _ref80.objectId, args = _ref80.args;
              ValidateObject(objectId);

              if (!args) {
                args = [0, // Access level
                [], // Custom values
                [] // Stakeholders
                ];
              }

              this.Log("Retrieving access info: ".concat(objectId));
              _context79.next = 6;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
                contractAddress: Utils.HashToAddress(objectId),
                abi: ContentContract.abi,
                methodName: "getAccessInfo",
                methodArgs: args,
                signer: this.signer
              }));

            case 6:
              info = _context79.sent;
              this.Log(info);
              return _context79.abrupt("return", {
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
              return _context79.stop();
          }
        }
      }, null, this);
    }
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
    value: function AccessRequest(_ref81) {
      var libraryId, objectId, versionHash, _ref81$args, args, _ref81$update, update, _ref81$noCache, noCache;

      return regeneratorRuntime.async(function AccessRequest$(_context80) {
        while (1) {
          switch (_context80.prev = _context80.next) {
            case 0:
              libraryId = _ref81.libraryId, objectId = _ref81.objectId, versionHash = _ref81.versionHash, _ref81$args = _ref81.args, args = _ref81$args === void 0 ? [] : _ref81$args, _ref81$update = _ref81.update, update = _ref81$update === void 0 ? false : _ref81$update, _ref81$noCache = _ref81.noCache, noCache = _ref81$noCache === void 0 ? false : _ref81$noCache;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              _context80.next = 5;
              return regeneratorRuntime.awrap(this.authClient.MakeAccessRequest({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                args: args,
                update: update,
                skipCache: true,
                noCache: noCache
              }));

            case 5:
              return _context80.abrupt("return", _context80.sent);

            case 6:
            case "end":
              return _context80.stop();
          }
        }
      }, null, this);
    }
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
    value: function CachedAccessTransaction(_ref82) {
      var libraryId, objectId, versionHash, cacheResult;
      return regeneratorRuntime.async(function CachedAccessTransaction$(_context81) {
        while (1) {
          switch (_context81.prev = _context81.next) {
            case 0:
              libraryId = _ref82.libraryId, objectId = _ref82.objectId, versionHash = _ref82.versionHash;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              _context81.next = 5;
              return regeneratorRuntime.awrap(this.authClient.MakeAccessRequest({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                cacheOnly: true
              }));

            case 5:
              cacheResult = _context81.sent;

              if (!cacheResult) {
                _context81.next = 8;
                break;
              }

              return _context81.abrupt("return", cacheResult.transactionHash);

            case 8:
            case "end":
              return _context81.stop();
          }
        }
      }, null, this);
    }
    /**
     * Generate a state channel token.
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
    value: function GenerateStateChannelToken(_ref83) {
      var objectId, versionHash, _ref83$noCache, noCache, _libraryId, audienceData;

      return regeneratorRuntime.async(function GenerateStateChannelToken$(_context82) {
        while (1) {
          switch (_context82.prev = _context82.next) {
            case 0:
              objectId = _ref83.objectId, versionHash = _ref83.versionHash, _ref83$noCache = _ref83.noCache, noCache = _ref83$noCache === void 0 ? false : _ref83$noCache;
              versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

              if (!versionHash) {
                _context82.next = 6;
                break;
              }

              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              _context82.next = 13;
              break;

            case 6:
              if (this.stateChannelAccess[objectId]) {
                _context82.next = 13;
                break;
              }

              _context82.next = 9;
              return regeneratorRuntime.awrap(this.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 9:
              _libraryId = _context82.sent;
              _context82.next = 12;
              return regeneratorRuntime.awrap(this.ContentObjectVersions({
                libraryId: _libraryId,
                objectId: objectId,
                noAuth: true
              }));

            case 12:
              versionHash = _context82.sent.versions[0].hash;

            case 13:
              this.stateChannelAccess[objectId] = versionHash;
              audienceData = this.AudienceData({
                objectId: objectId,
                versionHash: versionHash
              });
              _context82.next = 17;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                objectId: objectId,
                channelAuth: true,
                oauthToken: this.oauthToken,
                audienceData: audienceData,
                noCache: noCache
              }));

            case 17:
              return _context82.abrupt("return", _context82.sent);

            case 18:
            case "end":
              return _context82.stop();
          }
        }
      }, null, this);
    }
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
    value: function FinalizeStateChannelAccess(_ref84) {
      var objectId, versionHash, percentComplete, _libraryId2, audienceData;

      return regeneratorRuntime.async(function FinalizeStateChannelAccess$(_context83) {
        while (1) {
          switch (_context83.prev = _context83.next) {
            case 0:
              objectId = _ref84.objectId, versionHash = _ref84.versionHash, percentComplete = _ref84.percentComplete;
              versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

              if (!versionHash) {
                _context83.next = 6;
                break;
              }

              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              _context83.next = 16;
              break;

            case 6:
              if (!this.stateChannelAccess[objectId]) {
                _context83.next = 10;
                break;
              }

              versionHash = this.stateChannelAccess[objectId];
              _context83.next = 16;
              break;

            case 10:
              _context83.next = 12;
              return regeneratorRuntime.awrap(this.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 12:
              _libraryId2 = _context83.sent;
              _context83.next = 15;
              return regeneratorRuntime.awrap(this.ContentObjectVersions({
                libraryId: _libraryId2,
                objectId: objectId,
                noAuth: true
              }));

            case 15:
              versionHash = _context83.sent.versions[0].hash;

            case 16:
              this.stateChannelAccess[objectId] = undefined;
              audienceData = this.AudienceData({
                objectId: objectId,
                versionHash: versionHash
              });
              _context83.next = 20;
              return regeneratorRuntime.awrap(this.authClient.ChannelContentFinalize({
                objectId: objectId,
                audienceData: audienceData,
                percent: percentComplete
              }));

            case 20:
            case "end":
              return _context83.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentObjectAccessComplete(_ref85) {
      var objectId, _ref85$score, score;

      return regeneratorRuntime.async(function ContentObjectAccessComplete$(_context84) {
        while (1) {
          switch (_context84.prev = _context84.next) {
            case 0:
              objectId = _ref85.objectId, _ref85$score = _ref85.score, score = _ref85$score === void 0 ? 100 : _ref85$score;
              ValidateObject(objectId);

              if (!(score < 0 || score > 100)) {
                _context84.next = 4;
                break;
              }

              throw Error("Invalid AccessComplete score: " + score);

            case 4:
              _context84.next = 6;
              return regeneratorRuntime.awrap(this.authClient.AccessComplete({
                id: objectId,
                abi: ContentContract.abi,
                score: score
              }));

            case 6:
              return _context84.abrupt("return", _context84.sent);

            case 7:
            case "end":
              return _context84.stop();
          }
        }
      }, null, this);
    }
    /* URL Methods */

    /**
     * Determine available DRM types available in this browser environment.
     *
     * @methodGroup Media
     * @return {Promise<Array<string>>}
     */

  }, {
    key: "AvailableDRMs",
    value: function AvailableDRMs() {
      var availableDRMs, config;
      return regeneratorRuntime.async(function AvailableDRMs$(_context85) {
        while (1) {
          switch (_context85.prev = _context85.next) {
            case 0:
              availableDRMs = ["aes-128"];

              if (window) {
                _context85.next = 3;
                break;
              }

              return _context85.abrupt("return", availableDRMs);

            case 3:
              if (!(typeof window.navigator.requestMediaKeySystemAccess !== "function")) {
                _context85.next = 5;
                break;
              }

              return _context85.abrupt("return", availableDRMs);

            case 5:
              _context85.prev = 5;
              config = [{
                initDataTypes: ["cenc"],
                audioCapabilities: [{
                  contentType: "audio/mp4;codecs=\"mp4a.40.2\""
                }],
                videoCapabilities: [{
                  contentType: "video/mp4;codecs=\"avc1.42E01E\""
                }]
              }];
              _context85.next = 9;
              return regeneratorRuntime.awrap(navigator.requestMediaKeySystemAccess("com.widevine.alpha", config));

            case 9:
              availableDRMs.push("widevine"); // eslint-disable-next-line no-empty

              _context85.next = 14;
              break;

            case 12:
              _context85.prev = 12;
              _context85.t0 = _context85["catch"](5);

            case 14:
              return _context85.abrupt("return", availableDRMs);

            case 15:
            case "end":
              return _context85.stop();
          }
        }
      }, null, null, [[5, 12]]);
    }
  }, {
    key: "AudienceData",
    value: function AudienceData(_ref86) {
      var objectId = _ref86.objectId,
          versionHash = _ref86.versionHash,
          _ref86$protocols = _ref86.protocols,
          protocols = _ref86$protocols === void 0 ? [] : _ref86$protocols,
          _ref86$drms = _ref86.drms,
          drms = _ref86$drms === void 0 ? [] : _ref86$drms;
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
     * The root level playoutOptions[protocol].playoutUrl and playoutOptions[protocol].drms will contain playout
     * information that satisfies the specified DRM requirements (if possible), while playoutOptions[protocol].playoutMethods
     * will contain all available playout options for this content.
     *
     * If only objectId is specified, latest version will be played. To retrieve playout options for
     * a specific version of the content, provide the versionHash parameter (in which case objectId is unnecessary)
     *
     * @methodGroup Media
     * @namedParams
     * @param {string=} objectId - Id of the content
     * @param {string=} versionHash - Version hash of the content
     * @param {string=} linkPath - If playing from a link, the path to the link
     * @param {Array<string>} protocols - Acceptable playout protocols
     * @param {Array<string>} drms - Acceptable DRM formats
     * @param {string=} offering=default - The offering to play
     */

  }, {
    key: "PlayoutOptions",
    value: function PlayoutOptions(_ref87) {
      var objectId, versionHash, linkPath, _ref87$protocols, protocols, _ref87$offering, offering, _ref87$drms, drms, _ref87$hlsjsProfile, hlsjsProfile, libraryId, path, linkTargetLibraryId, linkTargetId, linkTargetHash, audienceData, queryParams, playoutOptions, playoutMap, i, option, protocol, drm, playoutPath, licenseServers, protocolMatch, drmMatch;

      return regeneratorRuntime.async(function PlayoutOptions$(_context86) {
        while (1) {
          switch (_context86.prev = _context86.next) {
            case 0:
              objectId = _ref87.objectId, versionHash = _ref87.versionHash, linkPath = _ref87.linkPath, _ref87$protocols = _ref87.protocols, protocols = _ref87$protocols === void 0 ? ["dash", "hls"] : _ref87$protocols, _ref87$offering = _ref87.offering, offering = _ref87$offering === void 0 ? "default" : _ref87$offering, _ref87$drms = _ref87.drms, drms = _ref87$drms === void 0 ? [] : _ref87$drms, _ref87$hlsjsProfile = _ref87.hlsjsProfile, hlsjsProfile = _ref87$hlsjsProfile === void 0 ? true : _ref87$hlsjsProfile;
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

              _context86.next = 7;
              return regeneratorRuntime.awrap(this.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 7:
              libraryId = _context86.sent;

              if (versionHash) {
                _context86.next = 12;
                break;
              }

              _context86.next = 11;
              return regeneratorRuntime.awrap(this.ContentObjectVersions({
                libraryId: libraryId,
                objectId: objectId,
                noAuth: true
              }));

            case 11:
              versionHash = _context86.sent.versions[0].hash;

            case 12:
              if (!linkPath) {
                _context86.next = 23;
                break;
              }

              _context86.next = 15;
              return regeneratorRuntime.awrap(this.LinkTarget({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                linkPath: linkPath
              }));

            case 15:
              linkTargetHash = _context86.sent;
              linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
              _context86.next = 19;
              return regeneratorRuntime.awrap(this.ContentObjectLibraryId({
                objectId: linkTargetId
              }));

            case 19:
              linkTargetLibraryId = _context86.sent;
              path = UrlJoin("q", versionHash, "meta", linkPath);
              _context86.next = 24;
              break;

            case 23:
              path = UrlJoin("q", versionHash, "rep", "playout", offering, "options.json");

            case 24:
              audienceData = this.AudienceData({
                objectId: linkTargetId || objectId,
                versionHash: linkTargetHash || versionHash,
                protocols: protocols,
                drms: drms
              }); // Add authorization token to playout URLs

              _context86.next = 27;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                objectId: objectId,
                channelAuth: true,
                oauthToken: this.oauthToken,
                audienceData: audienceData
              }));

            case 27:
              _context86.t0 = _context86.sent;
              queryParams = {
                authorization: _context86.t0
              };

              if (linkPath) {
                queryParams.resolve = true;
              }

              _context86.t1 = Object;
              _context86.next = 33;
              return regeneratorRuntime.awrap(ResponseToJson(this.HttpClient.Request({
                path: path,
                method: "GET",
                queryParams: queryParams
              })));

            case 33:
              _context86.t2 = _context86.sent;
              playoutOptions = _context86.t1.values.call(_context86.t1, _context86.t2);
              playoutMap = {};
              i = 0;

            case 37:
              if (!(i < playoutOptions.length)) {
                _context86.next = 70;
                break;
              }

              option = playoutOptions[i];
              protocol = option.properties.protocol;
              drm = option.properties.drm; // Remove authorization parameter from playout path - it's re-added by Rep

              playoutPath = option.uri.split("?")[0];
              licenseServers = option.properties.license_servers; // Create full playout URLs for this protocol / drm combo

              _context86.t3 = _objectSpread;
              _context86.t4 = {};
              _context86.t5 = playoutMap[protocol] || {};
              _context86.t6 = _objectSpread;
              _context86.t7 = {};
              _context86.t8 = (playoutMap[protocol] || {}).playoutMethods || {};
              _context86.t9 = _defineProperty;
              _context86.t10 = {};
              _context86.t11 = drm || "clear";
              _context86.next = 54;
              return regeneratorRuntime.awrap(this.Rep({
                libraryId: linkTargetLibraryId || libraryId,
                objectId: linkTargetId || objectId,
                versionHash: linkTargetHash || versionHash,
                rep: UrlJoin("playout", offering, playoutPath),
                channelAuth: true,
                queryParams: hlsjsProfile && protocol === "hls" ? {
                  player_profile: "hls-js"
                } : {}
              }));

            case 54:
              _context86.t12 = _context86.sent;
              _context86.t13 = drm ? _defineProperty({}, drm, {
                licenseServers: licenseServers
              }) : undefined;
              _context86.t14 = {
                playoutUrl: _context86.t12,
                drms: _context86.t13
              };
              _context86.t15 = (0, _context86.t9)(_context86.t10, _context86.t11, _context86.t14);
              _context86.t16 = (0, _context86.t6)(_context86.t7, _context86.t8, _context86.t15);
              _context86.t17 = {
                playoutMethods: _context86.t16
              };
              playoutMap[protocol] = (0, _context86.t3)(_context86.t4, _context86.t5, _context86.t17);
              // Exclude any options that do not satisfy the specified protocols and/or DRMs
              protocolMatch = protocols.includes(protocol);
              drmMatch = drms.includes(drm) || drms.length === 0 && !drm;

              if (!(!protocolMatch || !drmMatch)) {
                _context86.next = 65;
                break;
              }

              return _context86.abrupt("continue", 67);

            case 65:
              // This protocol / DRM satisfies the specifications
              playoutMap[protocol].playoutUrl = playoutMap[protocol].playoutMethods[drm || "clear"].playoutUrl;
              playoutMap[protocol].drms = playoutMap[protocol].playoutMethods[drm || "clear"].drms;

            case 67:
              i++;
              _context86.next = 37;
              break;

            case 70:
              this.Log(playoutMap);
              return _context86.abrupt("return", playoutMap);

            case 72:
            case "end":
              return _context86.stop();
          }
        }
      }, null, this);
    }
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
     * @param {string=} linkPath - If playing from a link, the path to the link
     * @param {Array<string>=} protocols=["dash", "hls"] - Acceptable playout protocols
     * @param {Array<string>=} drms=[] - Acceptable DRM formats
     * @param {string=} offering=default - The offering to play
     */

  }, {
    key: "BitmovinPlayoutOptions",
    value: function BitmovinPlayoutOptions(_ref89) {
      var _this8 = this;

      var objectId, versionHash, linkPath, _ref89$protocols, protocols, _ref89$drms, drms, _ref89$offering, offering, playoutOptions, config;

      return regeneratorRuntime.async(function BitmovinPlayoutOptions$(_context87) {
        while (1) {
          switch (_context87.prev = _context87.next) {
            case 0:
              objectId = _ref89.objectId, versionHash = _ref89.versionHash, linkPath = _ref89.linkPath, _ref89$protocols = _ref89.protocols, protocols = _ref89$protocols === void 0 ? ["dash", "hls"] : _ref89$protocols, _ref89$drms = _ref89.drms, drms = _ref89$drms === void 0 ? [] : _ref89$drms, _ref89$offering = _ref89.offering, offering = _ref89$offering === void 0 ? "default" : _ref89$offering;
              versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

              if (!objectId) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              _context87.next = 5;
              return regeneratorRuntime.awrap(this.PlayoutOptions({
                objectId: objectId,
                versionHash: versionHash,
                linkPath: linkPath,
                protocols: protocols,
                drms: drms,
                offering: offering,
                hlsjsProfile: false
              }));

            case 5:
              playoutOptions = _context87.sent;
              delete playoutOptions.playoutMethods;
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
                          Authorization: "Bearer ".concat(_this8.authClient.channelContentTokens[objectId])
                        }
                      };
                    }
                  });
                }
              });
              return _context87.abrupt("return", config);

            case 10:
            case "end":
              return _context87.stop();
          }
        }
      }, null, this);
    }
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
    value: function CallBitcodeMethod(_ref90) {
      var libraryId, objectId, versionHash, writeToken, method, _ref90$queryParams, queryParams, _ref90$body, body, _ref90$headers, headers, _ref90$constant, constant, _ref90$format, format, path, authHeader;

      return regeneratorRuntime.async(function CallBitcodeMethod$(_context88) {
        while (1) {
          switch (_context88.prev = _context88.next) {
            case 0:
              libraryId = _ref90.libraryId, objectId = _ref90.objectId, versionHash = _ref90.versionHash, writeToken = _ref90.writeToken, method = _ref90.method, _ref90$queryParams = _ref90.queryParams, queryParams = _ref90$queryParams === void 0 ? {} : _ref90$queryParams, _ref90$body = _ref90.body, body = _ref90$body === void 0 ? {} : _ref90$body, _ref90$headers = _ref90.headers, headers = _ref90$headers === void 0 ? {} : _ref90$headers, _ref90$constant = _ref90.constant, constant = _ref90$constant === void 0 ? true : _ref90$constant, _ref90$format = _ref90.format, format = _ref90$format === void 0 ? "json" : _ref90$format;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (method) {
                _context88.next = 4;
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
                _context88.next = 12;
                break;
              }

              _context88.next = 11;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                update: !constant
              }));

            case 11:
              headers.Authorization = _context88.sent.Authorization;

            case 12:
              this.Log("Calling bitcode method: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n      ").concat(constant ? "GET" : "POST", " ").concat(path, "\n      Query Params:\n      ").concat(queryParams, "\n      Body:\n      ").concat(body, "\n      Headers\n      ").concat(headers));
              _context88.t0 = ResponseToFormat;
              _context88.t1 = format;
              _context88.next = 17;
              return regeneratorRuntime.awrap(this.HttpClient.Request({
                body: body,
                headers: headers,
                method: constant ? "GET" : "POST",
                path: path,
                queryParams: queryParams,
                failover: false
              }));

            case 17:
              _context88.t2 = _context88.sent;
              return _context88.abrupt("return", (0, _context88.t0)(_context88.t1, _context88.t2));

            case 19:
            case "end":
              return _context88.stop();
          }
        }
      }, null, this);
    }
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
    value: function Rep(_ref91) {
      var libraryId, objectId, versionHash, rep, _ref91$queryParams, queryParams, _ref91$channelAuth, channelAuth, _ref91$noAuth, noAuth, _ref91$noCache, noCache;

      return regeneratorRuntime.async(function Rep$(_context89) {
        while (1) {
          switch (_context89.prev = _context89.next) {
            case 0:
              libraryId = _ref91.libraryId, objectId = _ref91.objectId, versionHash = _ref91.versionHash, rep = _ref91.rep, _ref91$queryParams = _ref91.queryParams, queryParams = _ref91$queryParams === void 0 ? {} : _ref91$queryParams, _ref91$channelAuth = _ref91.channelAuth, channelAuth = _ref91$channelAuth === void 0 ? false : _ref91$channelAuth, _ref91$noAuth = _ref91.noAuth, noAuth = _ref91$noAuth === void 0 ? false : _ref91$noAuth, _ref91$noCache = _ref91.noCache, noCache = _ref91$noCache === void 0 ? false : _ref91$noCache;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (rep) {
                _context89.next = 4;
                break;
              }

              throw "Rep not specified";

            case 4:
              return _context89.abrupt("return", this.FabricUrl({
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
              return _context89.stop();
          }
        }
      }, null, this);
    }
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
    value: function PublicRep(_ref92) {
      var libraryId, objectId, versionHash, rep, _ref92$queryParams, queryParams;

      return regeneratorRuntime.async(function PublicRep$(_context90) {
        while (1) {
          switch (_context90.prev = _context90.next) {
            case 0:
              libraryId = _ref92.libraryId, objectId = _ref92.objectId, versionHash = _ref92.versionHash, rep = _ref92.rep, _ref92$queryParams = _ref92.queryParams, queryParams = _ref92$queryParams === void 0 ? {} : _ref92$queryParams;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (rep) {
                _context90.next = 4;
                break;
              }

              throw "Rep not specified";

            case 4:
              return _context90.abrupt("return", this.FabricUrl({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                publicRep: rep,
                queryParams: queryParams,
                noAuth: true
              }));

            case 5:
            case "end":
              return _context90.stop();
          }
        }
      }, null, this);
    }
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
    value: function FabricUrl(_ref93) {
      var libraryId, objectId, versionHash, partHash, rep, publicRep, call, _ref93$queryParams, queryParams, _ref93$channelAuth, channelAuth, _ref93$noAuth, noAuth, _ref93$noCache, noCache, path;

      return regeneratorRuntime.async(function FabricUrl$(_context91) {
        while (1) {
          switch (_context91.prev = _context91.next) {
            case 0:
              libraryId = _ref93.libraryId, objectId = _ref93.objectId, versionHash = _ref93.versionHash, partHash = _ref93.partHash, rep = _ref93.rep, publicRep = _ref93.publicRep, call = _ref93.call, _ref93$queryParams = _ref93.queryParams, queryParams = _ref93$queryParams === void 0 ? {} : _ref93$queryParams, _ref93$channelAuth = _ref93.channelAuth, channelAuth = _ref93$channelAuth === void 0 ? false : _ref93$channelAuth, _ref93$noAuth = _ref93.noAuth, noAuth = _ref93$noAuth === void 0 ? false : _ref93$noAuth, _ref93$noCache = _ref93.noCache, noCache = _ref93$noCache === void 0 ? false : _ref93$noCache;

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
              _context91.next = 7;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                channelAuth: channelAuth,
                noAuth: noAuth,
                noCache: noCache
              }));

            case 7:
              queryParams.authorization = _context91.sent;
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

              return _context91.abrupt("return", this.HttpClient.URL({
                path: path,
                queryParams: queryParams
              }));

            case 12:
            case "end":
              return _context91.stop();
          }
        }
      }, null, this);
    }
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
    value: function FileUrl(_ref94) {
      var libraryId, objectId, versionHash, filePath, _ref94$queryParams, queryParams, _ref94$noCache, noCache, path, authorizationToken;

      return regeneratorRuntime.async(function FileUrl$(_context92) {
        while (1) {
          switch (_context92.prev = _context92.next) {
            case 0:
              libraryId = _ref94.libraryId, objectId = _ref94.objectId, versionHash = _ref94.versionHash, filePath = _ref94.filePath, _ref94$queryParams = _ref94.queryParams, queryParams = _ref94$queryParams === void 0 ? {} : _ref94$queryParams, _ref94$noCache = _ref94.noCache, noCache = _ref94$noCache === void 0 ? false : _ref94$noCache;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (filePath) {
                _context92.next = 4;
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

              _context92.next = 8;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                libraryId: libraryId,
                objectId: objectId,
                noCache: noCache
              }));

            case 8:
              authorizationToken = _context92.sent;
              return _context92.abrupt("return", this.HttpClient.URL({
                path: path,
                queryParams: _objectSpread({}, queryParams, {
                  authorization: authorizationToken
                })
              }));

            case 10:
            case "end":
              return _context92.stop();
          }
        }
      }, null, this);
    }
    /**
     * Retrieve the version hash of the specified link's target. If the target is the same as the specified
     * object and versionHash is not specified, will return the latest version hash.
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
    value: function LinkTarget(_ref95) {
      var libraryId, objectId, versionHash, linkPath, linkInfo, targetHash;
      return regeneratorRuntime.async(function LinkTarget$(_context93) {
        while (1) {
          switch (_context93.prev = _context93.next) {
            case 0:
              libraryId = _ref95.libraryId, objectId = _ref95.objectId, versionHash = _ref95.versionHash, linkPath = _ref95.linkPath;

              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              _context93.next = 4;
              return regeneratorRuntime.awrap(this.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                metadataSubtree: UrlJoin(linkPath),
                resolveLinks: false
              }));

            case 4:
              linkInfo = _context93.sent;

              if (!(!linkInfo || !linkInfo["/"])) {
                _context93.next = 7;
                break;
              }

              throw Error("No valid link at ".concat(linkPath));

            case 7:
              /* For absolute links - extract the hash from the link itself. Otherwise use "container" */
              targetHash = ((linkInfo["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1];

              if (!targetHash) {
                targetHash = linkInfo["."].container;
              }

              if (!targetHash) {
                _context93.next = 13;
                break;
              }

              return _context93.abrupt("return", targetHash);

            case 13:
              if (!versionHash) {
                _context93.next = 15;
                break;
              }

              return _context93.abrupt("return", versionHash);

            case 15:
              if (libraryId) {
                _context93.next = 19;
                break;
              }

              _context93.next = 18;
              return regeneratorRuntime.awrap(this.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 18:
              libraryId = _context93.sent;

            case 19:
              _context93.next = 21;
              return regeneratorRuntime.awrap(this.ContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 21:
              return _context93.abrupt("return", _context93.sent.hash);

            case 22:
            case "end":
              return _context93.stop();
          }
        }
      }, null, this);
    }
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
    value: function LinkUrl(_ref96) {
      var libraryId, objectId, versionHash, linkPath, mimeType, _ref96$queryParams, queryParams, _ref96$noCache, noCache, path;

      return regeneratorRuntime.async(function LinkUrl$(_context94) {
        while (1) {
          switch (_context94.prev = _context94.next) {
            case 0:
              libraryId = _ref96.libraryId, objectId = _ref96.objectId, versionHash = _ref96.versionHash, linkPath = _ref96.linkPath, mimeType = _ref96.mimeType, _ref96$queryParams = _ref96.queryParams, queryParams = _ref96$queryParams === void 0 ? {} : _ref96$queryParams, _ref96$noCache = _ref96.noCache, noCache = _ref96$noCache === void 0 ? false : _ref96$noCache;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (linkPath) {
                _context94.next = 4;
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

              _context94.t0 = _objectSpread;
              _context94.t1 = {};
              _context94.t2 = queryParams;
              _context94.next = 11;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
                libraryId: libraryId,
                objectId: objectId,
                noCache: noCache,
                noAuth: true
              }));

            case 11:
              _context94.t3 = _context94.sent;
              _context94.t4 = {
                resolve: true,
                authorization: _context94.t3
              };
              queryParams = (0, _context94.t0)(_context94.t1, _context94.t2, _context94.t4);

              if (mimeType) {
                queryParams["header-accept"] = mimeType;
              }

              return _context94.abrupt("return", this.HttpClient.URL({
                path: path,
                queryParams: queryParams
              }));

            case 16:
            case "end":
              return _context94.stop();
          }
        }
      }, null, this);
    }
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
    value: function LinkData(_ref97) {
      var libraryId, objectId, versionHash, linkPath, _ref97$format, format, linkUrl;

      return regeneratorRuntime.async(function LinkData$(_context95) {
        while (1) {
          switch (_context95.prev = _context95.next) {
            case 0:
              libraryId = _ref97.libraryId, objectId = _ref97.objectId, versionHash = _ref97.versionHash, linkPath = _ref97.linkPath, _ref97$format = _ref97.format, format = _ref97$format === void 0 ? "json" : _ref97$format;
              _context95.next = 3;
              return regeneratorRuntime.awrap(this.LinkUrl({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                linkPath: linkPath
              }));

            case 3:
              linkUrl = _context95.sent;
              _context95.t0 = ResponseToFormat;
              _context95.t1 = format;
              _context95.next = 8;
              return regeneratorRuntime.awrap(HttpClient.Fetch(linkUrl));

            case 8:
              _context95.t2 = _context95.sent;
              return _context95.abrupt("return", (0, _context95.t0)(_context95.t1, _context95.t2));

            case 10:
            case "end":
              return _context95.stop();
          }
        }
      }, null, this);
    }
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
    value: function CreateAccessGroup(_ref98) {
      var name, description, _ref98$metadata, metadata, _ref99, contractAddress, objectId, editResponse;

      return regeneratorRuntime.async(function CreateAccessGroup$(_context96) {
        while (1) {
          switch (_context96.prev = _context96.next) {
            case 0:
              name = _ref98.name, description = _ref98.description, _ref98$metadata = _ref98.metadata, metadata = _ref98$metadata === void 0 ? {} : _ref98$metadata;
              this.Log("Creating access group: ".concat(name || "", " ").concat(description || ""));
              _context96.next = 4;
              return regeneratorRuntime.awrap(this.authClient.CreateAccessGroup());

            case 4:
              _ref99 = _context96.sent;
              contractAddress = _ref99.contractAddress;
              objectId = this.utils.AddressToObjectId(contractAddress);
              this.Log("Access group: ".concat(contractAddress, " ").concat(objectId));
              _context96.next = 10;
              return regeneratorRuntime.awrap(this.EditContentObject({
                libraryId: this.contentSpaceLibraryId,
                objectId: objectId
              }));

            case 10:
              editResponse = _context96.sent;
              _context96.next = 13;
              return regeneratorRuntime.awrap(this.ReplaceMetadata({
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
              }));

            case 13:
              _context96.next = 15;
              return regeneratorRuntime.awrap(this.FinalizeContentObject({
                libraryId: this.contentSpaceLibraryId,
                objectId: objectId,
                writeToken: editResponse.write_token
              }));

            case 15:
              return _context96.abrupt("return", contractAddress);

            case 16:
            case "end":
              return _context96.stop();
          }
        }
      }, null, this);
    }
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
    value: function AccessGroupOwner(_ref100) {
      var contractAddress;
      return regeneratorRuntime.async(function AccessGroupOwner$(_context97) {
        while (1) {
          switch (_context97.prev = _context97.next) {
            case 0:
              contractAddress = _ref100.contractAddress;
              ValidateAddress(contractAddress);
              this.Log("Retrieving owner of access group ".concat(contractAddress));
              _context97.t0 = this.utils;
              _context97.next = 6;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
                contractAddress: contractAddress,
                abi: AccessGroupContract.abi,
                methodName: "owner",
                methodArgs: [],
                signer: this.signer
              }));

            case 6:
              _context97.t1 = _context97.sent;
              return _context97.abrupt("return", _context97.t0.FormatAddress.call(_context97.t0, _context97.t1));

            case 8:
            case "end":
              return _context97.stop();
          }
        }
      }, null, this);
    }
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
    value: function DeleteAccessGroup(_ref101) {
      var contractAddress;
      return regeneratorRuntime.async(function DeleteAccessGroup$(_context98) {
        while (1) {
          switch (_context98.prev = _context98.next) {
            case 0:
              contractAddress = _ref101.contractAddress;
              ValidateAddress(contractAddress);
              this.Log("Deleting access group ".concat(contractAddress));
              _context98.next = 5;
              return regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: contractAddress,
                abi: AccessGroupContract.abi,
                methodName: "kill",
                methodArgs: []
              }));

            case 5:
            case "end":
              return _context98.stop();
          }
        }
      }, null, this);
    }
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
    value: function AccessGroupMembers(_ref102) {
      var _this9 = this;

      var contractAddress, length;
      return regeneratorRuntime.async(function AccessGroupMembers$(_context100) {
        while (1) {
          switch (_context100.prev = _context100.next) {
            case 0:
              contractAddress = _ref102.contractAddress;
              ValidateAddress(contractAddress);
              this.Log("Retrieving members for group ".concat(contractAddress));
              _context100.next = 5;
              return regeneratorRuntime.awrap(this.CallContractMethod({
                contractAddress: contractAddress,
                abi: AccessGroupContract.abi,
                methodName: "membersNum"
              }));

            case 5:
              length = _context100.sent.toNumber();
              _context100.next = 8;
              return regeneratorRuntime.awrap(Promise.all(_toConsumableArray(Array(length)).map(function _callee9(_, i) {
                return regeneratorRuntime.async(function _callee9$(_context99) {
                  while (1) {
                    switch (_context99.prev = _context99.next) {
                      case 0:
                        _context99.t0 = _this9.utils;
                        _context99.next = 3;
                        return regeneratorRuntime.awrap(_this9.CallContractMethod({
                          contractAddress: contractAddress,
                          abi: AccessGroupContract.abi,
                          methodName: "membersList",
                          methodArgs: [i]
                        }));

                      case 3:
                        _context99.t1 = _context99.sent;
                        return _context99.abrupt("return", _context99.t0.FormatAddress.call(_context99.t0, _context99.t1));

                      case 5:
                      case "end":
                        return _context99.stop();
                    }
                  }
                });
              })));

            case 8:
              return _context100.abrupt("return", _context100.sent);

            case 9:
            case "end":
              return _context100.stop();
          }
        }
      }, null, this);
    }
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
    value: function AccessGroupManagers(_ref103) {
      var _this10 = this;

      var contractAddress, length;
      return regeneratorRuntime.async(function AccessGroupManagers$(_context102) {
        while (1) {
          switch (_context102.prev = _context102.next) {
            case 0:
              contractAddress = _ref103.contractAddress;
              ValidateAddress(contractAddress);
              this.Log("Retrieving managers for group ".concat(contractAddress));
              _context102.next = 5;
              return regeneratorRuntime.awrap(this.CallContractMethod({
                contractAddress: contractAddress,
                abi: AccessGroupContract.abi,
                methodName: "managersNum"
              }));

            case 5:
              length = _context102.sent.toNumber();
              _context102.next = 8;
              return regeneratorRuntime.awrap(Promise.all(_toConsumableArray(Array(length)).map(function _callee10(_, i) {
                return regeneratorRuntime.async(function _callee10$(_context101) {
                  while (1) {
                    switch (_context101.prev = _context101.next) {
                      case 0:
                        _context101.t0 = _this10.utils;
                        _context101.next = 3;
                        return regeneratorRuntime.awrap(_this10.CallContractMethod({
                          contractAddress: contractAddress,
                          abi: AccessGroupContract.abi,
                          methodName: "managersList",
                          methodArgs: [i]
                        }));

                      case 3:
                        _context101.t1 = _context101.sent;
                        return _context101.abrupt("return", _context101.t0.FormatAddress.call(_context101.t0, _context101.t1));

                      case 5:
                      case "end":
                        return _context101.stop();
                    }
                  }
                });
              })));

            case 8:
              return _context102.abrupt("return", _context102.sent);

            case 9:
            case "end":
              return _context102.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "AccessGroupMembershipMethod",
    value: function AccessGroupMembershipMethod(_ref104) {
      var contractAddress, memberAddress, methodName, eventName, isManager, event, candidate;
      return regeneratorRuntime.async(function AccessGroupMembershipMethod$(_context103) {
        while (1) {
          switch (_context103.prev = _context103.next) {
            case 0:
              contractAddress = _ref104.contractAddress, memberAddress = _ref104.memberAddress, methodName = _ref104.methodName, eventName = _ref104.eventName;
              ValidateAddress(contractAddress);
              ValidateAddress(memberAddress); // Ensure caller is the member being acted upon or a manager/owner of the group

              if (this.utils.EqualAddress(this.signer.address, memberAddress)) {
                _context103.next = 9;
                break;
              }

              _context103.next = 6;
              return regeneratorRuntime.awrap(this.CallContractMethod({
                contractAddress: contractAddress,
                abi: AccessGroupContract.abi,
                methodName: "hasManagerAccess",
                methodArgs: [this.utils.FormatAddress(this.signer.address)]
              }));

            case 6:
              isManager = _context103.sent;

              if (isManager) {
                _context103.next = 9;
                break;
              }

              throw Error("Manager access required");

            case 9:
              this.Log("Calling ".concat(methodName, " on group ").concat(contractAddress, " for user ").concat(memberAddress));
              _context103.next = 12;
              return regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: contractAddress,
                abi: AccessGroupContract.abi,
                methodName: methodName,
                methodArgs: [this.utils.FormatAddress(memberAddress)],
                eventName: eventName,
                eventValue: "candidate"
              }));

            case 12:
              event = _context103.sent;
              candidate = this.ExtractValueFromEvent({
                abi: AccessGroupContract.abi,
                event: event,
                eventName: eventName,
                eventValue: "candidate"
              });

              if (!(this.utils.FormatAddress(candidate) !== this.utils.FormatAddress(memberAddress))) {
                _context103.next = 17;
                break;
              }

              // eslint-disable-next-line no-console
              console.error("Mismatch: " + candidate + " :: " + memberAddress);
              throw Error("Access group method " + methodName + " failed");

            case 17:
              return _context103.abrupt("return", event.transactionHash);

            case 18:
            case "end":
              return _context103.stop();
          }
        }
      }, null, this);
    }
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
    value: function AddAccessGroupMember(_ref105) {
      var contractAddress, memberAddress;
      return regeneratorRuntime.async(function AddAccessGroupMember$(_context104) {
        while (1) {
          switch (_context104.prev = _context104.next) {
            case 0:
              contractAddress = _ref105.contractAddress, memberAddress = _ref105.memberAddress;
              ValidateAddress(contractAddress);
              ValidateAddress(memberAddress);
              _context104.next = 5;
              return regeneratorRuntime.awrap(this.AccessGroupMembershipMethod({
                contractAddress: contractAddress,
                memberAddress: memberAddress,
                methodName: "grantAccess",
                eventName: "MemberAdded"
              }));

            case 5:
              return _context104.abrupt("return", _context104.sent);

            case 6:
            case "end":
              return _context104.stop();
          }
        }
      }, null, this);
    }
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
    value: function RemoveAccessGroupMember(_ref106) {
      var contractAddress, memberAddress;
      return regeneratorRuntime.async(function RemoveAccessGroupMember$(_context105) {
        while (1) {
          switch (_context105.prev = _context105.next) {
            case 0:
              contractAddress = _ref106.contractAddress, memberAddress = _ref106.memberAddress;
              ValidateAddress(contractAddress);
              ValidateAddress(memberAddress);
              _context105.next = 5;
              return regeneratorRuntime.awrap(this.AccessGroupMembershipMethod({
                contractAddress: contractAddress,
                memberAddress: memberAddress,
                methodName: "revokeAccess",
                eventName: "MemberRevoked"
              }));

            case 5:
              return _context105.abrupt("return", _context105.sent);

            case 6:
            case "end":
              return _context105.stop();
          }
        }
      }, null, this);
    }
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
    value: function AddAccessGroupManager(_ref107) {
      var contractAddress, memberAddress;
      return regeneratorRuntime.async(function AddAccessGroupManager$(_context106) {
        while (1) {
          switch (_context106.prev = _context106.next) {
            case 0:
              contractAddress = _ref107.contractAddress, memberAddress = _ref107.memberAddress;
              ValidateAddress(contractAddress);
              ValidateAddress(memberAddress);
              _context106.next = 5;
              return regeneratorRuntime.awrap(this.AccessGroupMembershipMethod({
                contractAddress: contractAddress,
                memberAddress: memberAddress,
                methodName: "grantManagerAccess",
                eventName: "ManagerAccessGranted"
              }));

            case 5:
              return _context106.abrupt("return", _context106.sent);

            case 6:
            case "end":
              return _context106.stop();
          }
        }
      }, null, this);
    }
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
    value: function RemoveAccessGroupManager(_ref108) {
      var contractAddress, memberAddress;
      return regeneratorRuntime.async(function RemoveAccessGroupManager$(_context107) {
        while (1) {
          switch (_context107.prev = _context107.next) {
            case 0:
              contractAddress = _ref108.contractAddress, memberAddress = _ref108.memberAddress;
              ValidateAddress(contractAddress);
              ValidateAddress(memberAddress);
              _context107.next = 5;
              return regeneratorRuntime.awrap(this.AccessGroupMembershipMethod({
                contractAddress: contractAddress,
                memberAddress: memberAddress,
                methodName: "revokeManagerAccess",
                eventName: "ManagerAccessRevoked"
              }));

            case 5:
              return _context107.abrupt("return", _context107.sent);

            case 6:
            case "end":
              return _context107.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContentLibraryGroupPermissions(_ref109) {
      var _this11 = this;

      var libraryId, _ref109$permissions, permissions, libraryPermissions;

      return regeneratorRuntime.async(function ContentLibraryGroupPermissions$(_context110) {
        while (1) {
          switch (_context110.prev = _context110.next) {
            case 0:
              libraryId = _ref109.libraryId, _ref109$permissions = _ref109.permissions, permissions = _ref109$permissions === void 0 ? [] : _ref109$permissions;
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
              _context110.next = 7;
              return regeneratorRuntime.awrap(Promise.all(permissions.map(function _callee12(type) {
                var numGroups, accessGroupAddresses;
                return regeneratorRuntime.async(function _callee12$(_context109) {
                  while (1) {
                    switch (_context109.prev = _context109.next) {
                      case 0:
                        _context109.next = 2;
                        return regeneratorRuntime.awrap(_this11.CallContractMethod({
                          contractAddress: _this11.utils.HashToAddress(libraryId),
                          abi: LibraryContract.abi,
                          methodName: type + "GroupsLength"
                        }));

                      case 2:
                        numGroups = _context109.sent;
                        numGroups = parseInt(numGroups._hex, 16);
                        _context109.next = 6;
                        return regeneratorRuntime.awrap(LimitedMap(3, _toConsumableArray(Array(numGroups).keys()), function _callee11(i) {
                          return regeneratorRuntime.async(function _callee11$(_context108) {
                            while (1) {
                              switch (_context108.prev = _context108.next) {
                                case 0:
                                  _context108.prev = 0;
                                  _context108.t0 = _this11.utils;
                                  _context108.next = 4;
                                  return regeneratorRuntime.awrap(_this11.CallContractMethod({
                                    contractAddress: _this11.utils.HashToAddress(libraryId),
                                    abi: LibraryContract.abi,
                                    methodName: type + "Groups",
                                    methodArgs: [i]
                                  }));

                                case 4:
                                  _context108.t1 = _context108.sent;
                                  return _context108.abrupt("return", _context108.t0.FormatAddress.call(_context108.t0, _context108.t1));

                                case 8:
                                  _context108.prev = 8;
                                  _context108.t2 = _context108["catch"](0);
                                  // eslint-disable-next-line no-console
                                  console.error(_context108.t2);

                                case 11:
                                case "end":
                                  return _context108.stop();
                              }
                            }
                          }, null, null, [[0, 8]]);
                        }));

                      case 6:
                        accessGroupAddresses = _context109.sent;
                        accessGroupAddresses.forEach(function (address) {
                          return libraryPermissions[address] = [].concat(_toConsumableArray(libraryPermissions[address] || []), [type]).sort();
                        });

                      case 8:
                      case "end":
                        return _context109.stop();
                    }
                  }
                });
              })));

            case 7:
              return _context110.abrupt("return", libraryPermissions);

            case 8:
            case "end":
              return _context110.stop();
          }
        }
      }, null, this);
    }
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
    value: function AddContentLibraryGroup(_ref110) {
      var libraryId, groupAddress, permission, existingPermissions, event;
      return regeneratorRuntime.async(function AddContentLibraryGroup$(_context111) {
        while (1) {
          switch (_context111.prev = _context111.next) {
            case 0:
              libraryId = _ref110.libraryId, groupAddress = _ref110.groupAddress, permission = _ref110.permission;
              ValidateLibrary(libraryId);
              ValidateAddress(groupAddress);
              groupAddress = this.utils.FormatAddress(groupAddress);

              if (["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
                _context111.next = 6;
                break;
              }

              throw Error("Invalid group type: ".concat(permission));

            case 6:
              this.Log("Adding ".concat(permission, " group ").concat(groupAddress, " to library ").concat(libraryId));
              _context111.next = 9;
              return regeneratorRuntime.awrap(this.ContentLibraryGroupPermissions({
                libraryId: libraryId,
                permissions: [permission]
              }));

            case 9:
              existingPermissions = _context111.sent;

              if (!existingPermissions[groupAddress]) {
                _context111.next = 12;
                break;
              }

              return _context111.abrupt("return");

            case 12:
              // Capitalize permission to match method and event names
              permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();
              _context111.next = 15;
              return regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: this.utils.HashToAddress(libraryId),
                abi: LibraryContract.abi,
                methodName: "add".concat(permission, "Group"),
                methodArgs: [this.utils.FormatAddress(groupAddress)]
              }));

            case 15:
              event = _context111.sent;
              _context111.next = 18;
              return regeneratorRuntime.awrap(this.ExtractEventFromLogs({
                abi: LibraryContract.abi,
                event: event,
                eventName: "".concat(permission, "GroupAdded")
              }));

            case 18:
            case "end":
              return _context111.stop();
          }
        }
      }, null, this);
    }
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
    value: function RemoveContentLibraryGroup(_ref111) {
      var libraryId, groupAddress, permission, existingPermissions, event;
      return regeneratorRuntime.async(function RemoveContentLibraryGroup$(_context112) {
        while (1) {
          switch (_context112.prev = _context112.next) {
            case 0:
              libraryId = _ref111.libraryId, groupAddress = _ref111.groupAddress, permission = _ref111.permission;
              ValidateLibrary(libraryId);
              ValidateAddress(groupAddress);

              if (["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
                _context112.next = 5;
                break;
              }

              throw Error("Invalid group type: ".concat(permission));

            case 5:
              this.Log("Removing ".concat(permission, " group ").concat(groupAddress, " from library ").concat(libraryId));
              _context112.next = 8;
              return regeneratorRuntime.awrap(this.ContentLibraryGroupPermissions({
                libraryId: libraryId,
                permissions: [permission]
              }));

            case 8:
              existingPermissions = _context112.sent;

              if (existingPermissions[groupAddress]) {
                _context112.next = 11;
                break;
              }

              return _context112.abrupt("return");

            case 11:
              // Capitalize permission to match method and event names
              permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();
              _context112.next = 14;
              return regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: this.utils.HashToAddress(libraryId),
                abi: LibraryContract.abi,
                methodName: "remove".concat(permission, "Group"),
                methodArgs: [this.utils.FormatAddress(groupAddress)]
              }));

            case 14:
              event = _context112.sent;
              _context112.next = 17;
              return regeneratorRuntime.awrap(this.ExtractEventFromLogs({
                abi: LibraryContract.abi,
                event: event,
                eventName: "".concat(permission, "GroupRemoved")
              }));

            case 17:
            case "end":
              return _context112.stop();
          }
        }
      }, null, this);
    }
    /**
     * List all of the groups with permissions on the specified object.
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} objectId - The ID of the object
     *
     * @return {Promise<Object>} - Object mapping group addresses to permissions, as an array
     * - Example: { "0x0": ["see", "access"], ...}
     */

  }, {
    key: "ContentObjectGroupPermissions",
    value: function ContentObjectGroupPermissions(_ref112) {
      var _this12 = this;

      var objectId, contractAddress, groupAddresses, groupPermissions;
      return regeneratorRuntime.async(function ContentObjectGroupPermissions$(_context114) {
        while (1) {
          switch (_context114.prev = _context114.next) {
            case 0:
              objectId = _ref112.objectId;
              ValidateObject(objectId);
              this.Log("Retrieving group permissions for object ".concat(objectId));
              contractAddress = this.utils.HashToAddress(objectId); // Access indexor only available on access groups, so must ask each access group
              // we belong to about this object

              _context114.next = 6;
              return regeneratorRuntime.awrap(this.Collection({
                collectionType: "accessGroups"
              }));

            case 6:
              groupAddresses = _context114.sent;
              groupPermissions = {};
              _context114.next = 10;
              return regeneratorRuntime.awrap(Promise.all(groupAddresses.map(function _callee13(groupAddress) {
                var permission, permissions;
                return regeneratorRuntime.async(function _callee13$(_context113) {
                  while (1) {
                    switch (_context113.prev = _context113.next) {
                      case 0:
                        groupAddress = _this12.utils.FormatAddress(groupAddress);
                        _context113.next = 3;
                        return regeneratorRuntime.awrap(_this12.CallContractMethod({
                          contractAddress: groupAddress,
                          abi: AccessIndexorContract.abi,
                          methodName: "getContentObjectRights",
                          methodArgs: [contractAddress]
                        }));

                      case 3:
                        permission = _context113.sent;

                        if (!(permission === 0)) {
                          _context113.next = 6;
                          break;
                        }

                        return _context113.abrupt("return");

                      case 6:
                        permissions = [];

                        if (permission >= 100) {
                          permissions.push("manage");
                        }

                        if (permission % 100 >= 10) {
                          permissions.push("access");
                        }

                        if (permission % 10 > 0) {
                          permissions.push("see");
                        }

                        groupPermissions[groupAddress] = permissions;

                      case 11:
                      case "end":
                        return _context113.stop();
                    }
                  }
                });
              })));

            case 10:
              return _context114.abrupt("return", groupPermissions);

            case 11:
            case "end":
              return _context114.stop();
          }
        }
      }, null, this);
    }
    /**
     * Add a permission on the specified group for the specified object
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} objectId - The ID of the object
     * @param {string} groupAddress - The address of the group
     * @param {string} permission - The type of permission to add ("see", "access", "manage")
     */

  }, {
    key: "AddContentObjectGroupPermission",
    value: function AddContentObjectGroupPermission(_ref113) {
      var objectId, groupAddress, permission, event;
      return regeneratorRuntime.async(function AddContentObjectGroupPermission$(_context115) {
        while (1) {
          switch (_context115.prev = _context115.next) {
            case 0:
              objectId = _ref113.objectId, groupAddress = _ref113.groupAddress, permission = _ref113.permission;
              ValidatePresence("permission", permission);
              ValidateObject(objectId);
              ValidateAddress(groupAddress);
              permission = permission.toLowerCase();
              groupAddress = this.utils.FormatAddress(groupAddress);

              if (["see", "access", "manage"].includes(permission)) {
                _context115.next = 8;
                break;
              }

              throw Error("Invalid permission type: ".concat(permission));

            case 8:
              this.Log("Adding ".concat(permission, " permission to group ").concat(groupAddress, " for ").concat(objectId));
              _context115.next = 11;
              return regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: groupAddress,
                abi: AccessIndexorContract.abi,
                methodName: "setContentObjectRights",
                methodArgs: [this.utils.HashToAddress(objectId), permission === "manage" ? 2 : permission === "access" ? 1 : 0, permission === "none" ? 0 : 2]
              }));

            case 11:
              event = _context115.sent;
              _context115.next = 14;
              return regeneratorRuntime.awrap(this.ExtractEventFromLogs({
                abi: AccessIndexorContract.abi,
                event: event,
                eventName: "RightsChanged"
              }));

            case 14:
            case "end":
              return _context115.stop();
          }
        }
      }, null, this);
    }
    /**
     * Remove a permission on the specified group for the specified object
     *
     * @methodGroup Access Groups
     * @namedParams
     * @param {string} objectId - The ID of the object
     * @param {string} groupAddress - The address of the group
     * @param {string} permission - The type of permission to remove ("see", "access", "manage")
     */

  }, {
    key: "RemoveContentObjectGroupPermission",
    value: function RemoveContentObjectGroupPermission(_ref114) {
      var objectId, groupAddress, permission, event;
      return regeneratorRuntime.async(function RemoveContentObjectGroupPermission$(_context116) {
        while (1) {
          switch (_context116.prev = _context116.next) {
            case 0:
              objectId = _ref114.objectId, groupAddress = _ref114.groupAddress, permission = _ref114.permission;
              ValidatePresence("permission", permission);
              ValidateObject(objectId);
              ValidateAddress(groupAddress);
              permission = permission.toLowerCase();
              groupAddress = this.utils.FormatAddress(groupAddress);

              if (["see", "access", "manage"].includes(permission)) {
                _context116.next = 8;
                break;
              }

              throw Error("Invalid permission type: ".concat(permission));

            case 8:
              this.Log("Removing ".concat(permission, " permission from group ").concat(groupAddress, " for ").concat(objectId));
              _context116.next = 11;
              return regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: groupAddress,
                abi: AccessIndexorContract.abi,
                methodName: "setContentObjectRights",
                methodArgs: [this.utils.HashToAddress(objectId), permission === "manage" ? 2 : permission === "access" ? 1 : 0, 0]
              }));

            case 11:
              event = _context116.sent;
              _context116.next = 14;
              return regeneratorRuntime.awrap(this.ExtractEventFromLogs({
                abi: AccessIndexorContract.abi,
                event: event,
                eventName: "RightsChanged"
              }));

            case 14:
            case "end":
              return _context116.stop();
          }
        }
      }, null, this);
    }
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
    value: function Collection(_ref115) {
      var collectionType, validCollectionTypes, walletAddress;
      return regeneratorRuntime.async(function Collection$(_context117) {
        while (1) {
          switch (_context117.prev = _context117.next) {
            case 0:
              collectionType = _ref115.collectionType;
              validCollectionTypes = ["accessGroups", "contentObjects", "contentTypes", "contracts", "libraries"];

              if (validCollectionTypes.includes(collectionType)) {
                _context117.next = 4;
                break;
              }

              throw new Error("Invalid collection type: " + collectionType);

            case 4:
              if (!this.signer) {
                _context117.next = 10;
                break;
              }

              _context117.next = 7;
              return regeneratorRuntime.awrap(this.userProfileClient.WalletAddress());

            case 7:
              _context117.t0 = _context117.sent;
              _context117.next = 11;
              break;

            case 10:
              _context117.t0 = undefined;

            case 11:
              walletAddress = _context117.t0;

              if (walletAddress) {
                _context117.next = 14;
                break;
              }

              throw new Error("Unable to get collection: User wallet doesn't exist");

            case 14:
              this.Log("Retrieving ".concat(collectionType, " contract collection for user ").concat(this.signer.address));
              _context117.next = 17;
              return regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
                methodName: "send",
                args: ["elv_getWalletCollection", [this.contentSpaceId, "iusr".concat(this.utils.AddressToHash(this.signer.address)), collectionType]]
              }));

            case 17:
              return _context117.abrupt("return", _context117.sent);

            case 18:
            case "end":
              return _context117.stop();
          }
        }
      }, null, this);
    }
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
    value: function VerifyContentObject(_ref116) {
      var libraryId, objectId, versionHash;
      return regeneratorRuntime.async(function VerifyContentObject$(_context118) {
        while (1) {
          switch (_context118.prev = _context118.next) {
            case 0:
              libraryId = _ref116.libraryId, objectId = _ref116.objectId, versionHash = _ref116.versionHash;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });
              _context118.next = 4;
              return regeneratorRuntime.awrap(ContentObjectVerification.VerifyContentObject({
                client: this,
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 4:
              return _context118.abrupt("return", _context118.sent);

            case 5:
            case "end":
              return _context118.stop();
          }
        }
      }, null, this);
    }
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
    value: function Proofs(_ref117) {
      var libraryId, objectId, versionHash, partHash, path;
      return regeneratorRuntime.async(function Proofs$(_context119) {
        while (1) {
          switch (_context119.prev = _context119.next) {
            case 0:
              libraryId = _ref117.libraryId, objectId = _ref117.objectId, versionHash = _ref117.versionHash, partHash = _ref117.partHash;
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
              _context119.t0 = ResponseToJson;
              _context119.t1 = this.HttpClient;
              _context119.next = 9;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 9:
              _context119.t2 = _context119.sent;
              _context119.t3 = path;
              _context119.t4 = {
                headers: _context119.t2,
                method: "GET",
                path: _context119.t3
              };
              _context119.t5 = _context119.t1.Request.call(_context119.t1, _context119.t4);
              return _context119.abrupt("return", (0, _context119.t0)(_context119.t5));

            case 14:
            case "end":
              return _context119.stop();
          }
        }
      }, null, this);
    }
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
    value: function QParts(_ref118) {
      var libraryId, objectId, partHash, _ref118$format, format, path;

      return regeneratorRuntime.async(function QParts$(_context120) {
        while (1) {
          switch (_context120.prev = _context120.next) {
            case 0:
              libraryId = _ref118.libraryId, objectId = _ref118.objectId, partHash = _ref118.partHash, _ref118$format = _ref118.format, format = _ref118$format === void 0 ? "blob" : _ref118$format;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });
              ValidatePartHash(partHash);
              path = UrlJoin("qparts", partHash);
              _context120.t0 = ResponseToFormat;
              _context120.t1 = format;
              _context120.t2 = this.HttpClient;
              _context120.next = 9;
              return regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
                libraryId: libraryId,
                objectId: objectId,
                partHash: partHash
              }));

            case 9:
              _context120.t3 = _context120.sent;
              _context120.t4 = path;
              _context120.t5 = {
                headers: _context120.t3,
                method: "GET",
                path: _context120.t4
              };
              _context120.t6 = _context120.t2.Request.call(_context120.t2, _context120.t5);
              return _context120.abrupt("return", (0, _context120.t0)(_context120.t1, _context120.t6));

            case 14:
            case "end":
              return _context120.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContractName(_ref119) {
      var contractAddress;
      return regeneratorRuntime.async(function ContractName$(_context121) {
        while (1) {
          switch (_context121.prev = _context121.next) {
            case 0:
              contractAddress = _ref119.contractAddress;
              ValidateAddress(contractAddress);
              _context121.next = 4;
              return regeneratorRuntime.awrap(this.ethClient.ContractName(contractAddress));

            case 4:
              return _context121.abrupt("return", _context121.sent);

            case 5:
            case "end":
              return _context121.stop();
          }
        }
      }, null, this);
    }
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
    value: function FormatContractArguments(_ref120) {
      var abi = _ref120.abi,
          methodName = _ref120.methodName,
          args = _ref120.args;
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
    value: function DeployContract(_ref121) {
      var abi, bytecode, constructorArgs, _ref121$overrides, overrides;

      return regeneratorRuntime.async(function DeployContract$(_context122) {
        while (1) {
          switch (_context122.prev = _context122.next) {
            case 0:
              abi = _ref121.abi, bytecode = _ref121.bytecode, constructorArgs = _ref121.constructorArgs, _ref121$overrides = _ref121.overrides, overrides = _ref121$overrides === void 0 ? {} : _ref121$overrides;
              _context122.next = 3;
              return regeneratorRuntime.awrap(this.ethClient.DeployContract({
                abi: abi,
                bytecode: bytecode,
                constructorArgs: constructorArgs,
                overrides: overrides,
                signer: this.signer
              }));

            case 3:
              return _context122.abrupt("return", _context122.sent);

            case 4:
            case "end":
              return _context122.stop();
          }
        }
      }, null, this);
    }
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
    value: function CallContractMethod(_ref122) {
      var contractAddress, abi, methodName, _ref122$methodArgs, methodArgs, value, _ref122$overrides, overrides, _ref122$formatArgumen, formatArguments, _ref122$cacheContract, cacheContract;

      return regeneratorRuntime.async(function CallContractMethod$(_context123) {
        while (1) {
          switch (_context123.prev = _context123.next) {
            case 0:
              contractAddress = _ref122.contractAddress, abi = _ref122.abi, methodName = _ref122.methodName, _ref122$methodArgs = _ref122.methodArgs, methodArgs = _ref122$methodArgs === void 0 ? [] : _ref122$methodArgs, value = _ref122.value, _ref122$overrides = _ref122.overrides, overrides = _ref122$overrides === void 0 ? {} : _ref122$overrides, _ref122$formatArgumen = _ref122.formatArguments, formatArguments = _ref122$formatArgumen === void 0 ? true : _ref122$formatArgumen, _ref122$cacheContract = _ref122.cacheContract, cacheContract = _ref122$cacheContract === void 0 ? true : _ref122$cacheContract;
              ValidateAddress(contractAddress);
              _context123.next = 4;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
                contractAddress: contractAddress,
                abi: abi,
                methodName: methodName,
                methodArgs: methodArgs,
                value: value,
                overrides: overrides,
                formatArguments: formatArguments,
                cacheContract: cacheContract,
                signer: this.signer
              }));

            case 4:
              return _context123.abrupt("return", _context123.sent);

            case 5:
            case "end":
              return _context123.stop();
          }
        }
      }, null, this);
    }
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
    value: function CallContractMethodAndWait(_ref123) {
      var contractAddress, abi, methodName, methodArgs, value, _ref123$overrides, overrides, _ref123$formatArgumen, formatArguments;

      return regeneratorRuntime.async(function CallContractMethodAndWait$(_context124) {
        while (1) {
          switch (_context124.prev = _context124.next) {
            case 0:
              contractAddress = _ref123.contractAddress, abi = _ref123.abi, methodName = _ref123.methodName, methodArgs = _ref123.methodArgs, value = _ref123.value, _ref123$overrides = _ref123.overrides, overrides = _ref123$overrides === void 0 ? {} : _ref123$overrides, _ref123$formatArgumen = _ref123.formatArguments, formatArguments = _ref123$formatArgumen === void 0 ? true : _ref123$formatArgumen;
              ValidateAddress(contractAddress);
              _context124.next = 4;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
                contractAddress: contractAddress,
                abi: abi,
                methodName: methodName,
                methodArgs: methodArgs,
                value: value,
                overrides: overrides,
                formatArguments: formatArguments,
                signer: this.signer
              }));

            case 4:
              return _context124.abrupt("return", _context124.sent);

            case 5:
            case "end":
              return _context124.stop();
          }
        }
      }, null, this);
    }
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
    value: function ExtractEventFromLogs(_ref124) {
      var abi = _ref124.abi,
          event = _ref124.event,
          eventName = _ref124.eventName;
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
    value: function ExtractValueFromEvent(_ref125) {
      var abi = _ref125.abi,
          event = _ref125.event,
          eventName = _ref125.eventName,
          eventValue = _ref125.eventValue;
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
    value: function SetCustomContentContract(_ref126) {
      var libraryId, objectId, customContractAddress, name, description, abi, factoryAbi, _ref126$overrides, overrides, setResult, writeToken;

      return regeneratorRuntime.async(function SetCustomContentContract$(_context125) {
        while (1) {
          switch (_context125.prev = _context125.next) {
            case 0:
              libraryId = _ref126.libraryId, objectId = _ref126.objectId, customContractAddress = _ref126.customContractAddress, name = _ref126.name, description = _ref126.description, abi = _ref126.abi, factoryAbi = _ref126.factoryAbi, _ref126$overrides = _ref126.overrides, overrides = _ref126$overrides === void 0 ? {} : _ref126$overrides;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId
              });
              ValidateAddress(customContractAddress);
              customContractAddress = this.utils.FormatAddress(customContractAddress);
              this.Log("Setting custom contract address: ".concat(objectId, " ").concat(customContractAddress));
              _context125.next = 7;
              return regeneratorRuntime.awrap(this.ethClient.SetCustomContentContract({
                contentContractAddress: Utils.HashToAddress(objectId),
                customContractAddress: customContractAddress,
                overrides: overrides,
                signer: this.signer
              }));

            case 7:
              setResult = _context125.sent;
              _context125.next = 10;
              return regeneratorRuntime.awrap(this.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 10:
              writeToken = _context125.sent.write_token;
              _context125.next = 13;
              return regeneratorRuntime.awrap(this.ReplaceMetadata({
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
              }));

            case 13:
              _context125.next = 15;
              return regeneratorRuntime.awrap(this.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: writeToken
              }));

            case 15:
              return _context125.abrupt("return", setResult);

            case 16:
            case "end":
              return _context125.stop();
          }
        }
      }, null, this);
    }
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
    value: function CustomContractAddress(_ref127) {
      var libraryId, objectId, versionHash, customContractAddress;
      return regeneratorRuntime.async(function CustomContractAddress$(_context126) {
        while (1) {
          switch (_context126.prev = _context126.next) {
            case 0:
              libraryId = _ref127.libraryId, objectId = _ref127.objectId, versionHash = _ref127.versionHash;
              ValidateParameters({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              });

              if (versionHash) {
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
              }

              if (!(libraryId === this.contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId))) {
                _context126.next = 5;
                break;
              }

              return _context126.abrupt("return");

            case 5:
              this.Log("Retrieving custom contract address: ".concat(objectId));
              _context126.next = 8;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
                contractAddress: this.utils.HashToAddress(objectId),
                abi: ContentContract.abi,
                methodName: "contentContractAddress",
                methodArgs: [],
                signer: this.signer
              }));

            case 8:
              customContractAddress = _context126.sent;

              if (!(customContractAddress === this.utils.nullAddress)) {
                _context126.next = 11;
                break;
              }

              return _context126.abrupt("return");

            case 11:
              return _context126.abrupt("return", this.utils.FormatAddress(customContractAddress));

            case 12:
            case "end":
              return _context126.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "FormatBlockNumbers",
    value: function FormatBlockNumbers(_ref128) {
      var fromBlock, toBlock, _ref128$count, count, latestBlock;

      return regeneratorRuntime.async(function FormatBlockNumbers$(_context127) {
        while (1) {
          switch (_context127.prev = _context127.next) {
            case 0:
              fromBlock = _ref128.fromBlock, toBlock = _ref128.toBlock, _ref128$count = _ref128.count, count = _ref128$count === void 0 ? 10 : _ref128$count;
              _context127.next = 3;
              return regeneratorRuntime.awrap(this.BlockNumber());

            case 3:
              latestBlock = _context127.sent;

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

              return _context127.abrupt("return", {
                fromBlock: fromBlock,
                toBlock: toBlock
              });

            case 8:
            case "end":
              return _context127.stop();
          }
        }
      }, null, this);
    }
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
    value: function ContractEvents(_ref129) {
      var contractAddress, abi, _ref129$fromBlock, fromBlock, toBlock, _ref129$count, count, _ref129$includeTransa, includeTransaction, blocks;

      return regeneratorRuntime.async(function ContractEvents$(_context128) {
        while (1) {
          switch (_context128.prev = _context128.next) {
            case 0:
              contractAddress = _ref129.contractAddress, abi = _ref129.abi, _ref129$fromBlock = _ref129.fromBlock, fromBlock = _ref129$fromBlock === void 0 ? 0 : _ref129$fromBlock, toBlock = _ref129.toBlock, _ref129$count = _ref129.count, count = _ref129$count === void 0 ? 1000 : _ref129$count, _ref129$includeTransa = _ref129.includeTransaction, includeTransaction = _ref129$includeTransa === void 0 ? false : _ref129$includeTransa;
              ValidateAddress(contractAddress);
              _context128.next = 4;
              return regeneratorRuntime.awrap(this.FormatBlockNumbers({
                fromBlock: fromBlock,
                toBlock: toBlock,
                count: count
              }));

            case 4:
              blocks = _context128.sent;
              this.Log("Querying contract events ".concat(contractAddress, " - Blocks ").concat(blocks.fromBlock, " to ").concat(blocks.toBlock));
              _context128.next = 8;
              return regeneratorRuntime.awrap(this.ethClient.ContractEvents({
                contractAddress: contractAddress,
                abi: abi,
                fromBlock: blocks.fromBlock,
                toBlock: blocks.toBlock,
                includeTransaction: includeTransaction
              }));

            case 8:
              return _context128.abrupt("return", _context128.sent);

            case 9:
            case "end":
              return _context128.stop();
          }
        }
      }, null, this);
    } // TODO: Not implemented in contracts

  }, {
    key: "WithdrawContractFunds",
    value: function WithdrawContractFunds(_ref130) {
      var contractAddress, abi, ether;
      return regeneratorRuntime.async(function WithdrawContractFunds$(_context129) {
        while (1) {
          switch (_context129.prev = _context129.next) {
            case 0:
              contractAddress = _ref130.contractAddress, abi = _ref130.abi, ether = _ref130.ether;
              ValidateAddress(contractAddress);
              _context129.next = 4;
              return regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
                contractAddress: contractAddress,
                abi: abi,
                methodName: "transfer",
                methodArgs: [this.signer.address, Ethers.utils.parseEther(ether.toString())],
                signer: this.signer
              }));

            case 4:
              return _context129.abrupt("return", _context129.sent);

            case 5:
            case "end":
              return _context129.stop();
          }
        }
      }, null, this);
    }
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
    value: function Events() {
      var _ref131,
          toBlock,
          fromBlock,
          _ref131$count,
          count,
          _ref131$includeTransa,
          includeTransaction,
          blocks,
          _args130 = arguments;

      return regeneratorRuntime.async(function Events$(_context130) {
        while (1) {
          switch (_context130.prev = _context130.next) {
            case 0:
              _ref131 = _args130.length > 0 && _args130[0] !== undefined ? _args130[0] : {}, toBlock = _ref131.toBlock, fromBlock = _ref131.fromBlock, _ref131$count = _ref131.count, count = _ref131$count === void 0 ? 10 : _ref131$count, _ref131$includeTransa = _ref131.includeTransaction, includeTransaction = _ref131$includeTransa === void 0 ? false : _ref131$includeTransa;
              _context130.next = 3;
              return regeneratorRuntime.awrap(this.FormatBlockNumbers({
                fromBlock: fromBlock,
                toBlock: toBlock,
                count: count
              }));

            case 3:
              blocks = _context130.sent;
              this.Log("Querying events - Blocks ".concat(blocks.fromBlock, " to ").concat(blocks.toBlock));
              _context130.next = 7;
              return regeneratorRuntime.awrap(this.ethClient.Events({
                fromBlock: blocks.fromBlock,
                toBlock: blocks.toBlock,
                includeTransaction: includeTransaction
              }));

            case 7:
              return _context130.abrupt("return", _context130.sent);

            case 8:
            case "end":
              return _context130.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "BlockNumber",
    value: function BlockNumber() {
      return regeneratorRuntime.async(function BlockNumber$(_context131) {
        while (1) {
          switch (_context131.prev = _context131.next) {
            case 0:
              _context131.next = 2;
              return regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
                methodName: "getBlockNumber"
              }));

            case 2:
              return _context131.abrupt("return", _context131.sent);

            case 3:
            case "end":
              return _context131.stop();
          }
        }
      }, null, this);
    }
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
    value: function GetBalance(_ref132) {
      var address, balance;
      return regeneratorRuntime.async(function GetBalance$(_context132) {
        while (1) {
          switch (_context132.prev = _context132.next) {
            case 0:
              address = _ref132.address;
              ValidateAddress(address);
              _context132.next = 4;
              return regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
                methodName: "getBalance",
                args: [address]
              }));

            case 4:
              balance = _context132.sent;
              return _context132.abrupt("return", Ethers.utils.formatEther(balance));

            case 6:
            case "end":
              return _context132.stop();
          }
        }
      }, null, this);
    }
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
    value: function SendFunds(_ref133) {
      var recipient, ether, transaction;
      return regeneratorRuntime.async(function SendFunds$(_context133) {
        while (1) {
          switch (_context133.prev = _context133.next) {
            case 0:
              recipient = _ref133.recipient, ether = _ref133.ether;
              ValidateAddress(recipient);
              _context133.next = 4;
              return regeneratorRuntime.awrap(this.signer.sendTransaction({
                to: recipient,
                value: Ethers.utils.parseEther(ether.toString())
              }));

            case 4:
              transaction = _context133.sent;
              _context133.next = 7;
              return regeneratorRuntime.awrap(transaction.wait());

            case 7:
              return _context133.abrupt("return", _context133.sent);

            case 8:
            case "end":
              return _context133.stop();
          }
        }
      }, null, this);
    }
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
    value: function CallFromFrameMessage(message, Respond) {
      var _this13 = this;

      var callback, method, methodResults, responseError;
      return regeneratorRuntime.async(function CallFromFrameMessage$(_context134) {
        while (1) {
          switch (_context134.prev = _context134.next) {
            case 0:
              if (!(message.type !== "ElvFrameRequest")) {
                _context134.next = 2;
                break;
              }

              return _context134.abrupt("return");

            case 2:
              if (message.callbackId) {
                callback = function callback(result) {
                  Respond(_this13.utils.MakeClonable({
                    type: "ElvFrameResponse",
                    requestId: message.callbackId,
                    response: result
                  }));
                };

                message.args.callback = callback;
              }

              _context134.prev = 3;
              method = message.calledMethod;

              if (!(message.module === "userProfileClient")) {
                _context134.next = 13;
                break;
              }

              if (this.userProfileClient.FrameAllowedMethods().includes(method)) {
                _context134.next = 8;
                break;
              }

              throw Error("Invalid user profile method: " + method);

            case 8:
              _context134.next = 10;
              return regeneratorRuntime.awrap(this.userProfileClient[method](message.args));

            case 10:
              methodResults = _context134.sent;
              _context134.next = 18;
              break;

            case 13:
              if (this.FrameAllowedMethods().includes(method)) {
                _context134.next = 15;
                break;
              }

              throw Error("Invalid method: " + method);

            case 15:
              _context134.next = 17;
              return regeneratorRuntime.awrap(this[method](message.args));

            case 17:
              methodResults = _context134.sent;

            case 18:
              Respond(this.utils.MakeClonable({
                type: "ElvFrameResponse",
                requestId: message.requestId,
                response: methodResults
              }));
              _context134.next = 27;
              break;

            case 21:
              _context134.prev = 21;
              _context134.t0 = _context134["catch"](3);
              // eslint-disable-next-line no-console
              this.Log("Frame Message Error:\n        Method: ".concat(message.calledMethod, "\n        Arguments: ").concat(JSON.stringify(message.args, null, 2), "\n        Error: ").concat(_typeof(_context134.t0) === "object" ? JSON.stringify(_context134.t0, null, 2) : _context134.t0), true); // eslint-disable-next-line no-console

              console.error(_context134.t0);
              responseError = _context134.t0 instanceof Error ? _context134.t0.message : _context134.t0;
              Respond(this.utils.MakeClonable({
                type: "ElvFrameResponse",
                requestId: message.requestId,
                error: responseError
              }));

            case 27:
            case "end":
              return _context134.stop();
          }
        }
      }, null, this, [[3, 21]]);
    }
  }], [{
    key: "Configuration",
    value: function Configuration(_ref134) {
      var configUrl, region, uri, fabricInfo, filterHTTPS, fabricURIs, ethereumURIs;
      return regeneratorRuntime.async(function Configuration$(_context135) {
        while (1) {
          switch (_context135.prev = _context135.next) {
            case 0:
              configUrl = _ref134.configUrl, region = _ref134.region;
              _context135.prev = 1;
              uri = new URI(configUrl);

              if (region) {
                uri.addSearch("elvgeo", region);
              }

              _context135.next = 6;
              return regeneratorRuntime.awrap(ResponseToJson(HttpClient.Fetch(uri.toString())));

            case 6:
              fabricInfo = _context135.sent;

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

              return _context135.abrupt("return", {
                nodeId: fabricInfo.node_id,
                contentSpaceId: fabricInfo.qspace.id,
                fabricURIs: fabricURIs,
                ethereumURIs: ethereumURIs
              });

            case 15:
              _context135.prev = 15;
              _context135.t0 = _context135["catch"](1);
              // eslint-disable-next-line no-console
              console.error("Error retrieving fabric configuration:"); // eslint-disable-next-line no-console

              console.error(_context135.t0);
              throw _context135.t0;

            case 20:
            case "end":
              return _context135.stop();
          }
        }
      }, null, null, [[1, 15]]);
    }
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
    value: function FromConfigurationUrl(_ref135) {
      var configUrl, region, _ref135$noCache, noCache, _ref135$noAuth, noAuth, _ref136, contentSpaceId, fabricURIs, ethereumURIs, client;

      return regeneratorRuntime.async(function FromConfigurationUrl$(_context136) {
        while (1) {
          switch (_context136.prev = _context136.next) {
            case 0:
              configUrl = _ref135.configUrl, region = _ref135.region, _ref135$noCache = _ref135.noCache, noCache = _ref135$noCache === void 0 ? false : _ref135$noCache, _ref135$noAuth = _ref135.noAuth, noAuth = _ref135$noAuth === void 0 ? false : _ref135$noAuth;
              _context136.next = 3;
              return regeneratorRuntime.awrap(ElvClient.Configuration({
                configUrl: configUrl,
                region: region
              }));

            case 3:
              _ref136 = _context136.sent;
              contentSpaceId = _ref136.contentSpaceId;
              fabricURIs = _ref136.fabricURIs;
              ethereumURIs = _ref136.ethereumURIs;
              client = new ElvClient({
                contentSpaceId: contentSpaceId,
                fabricURIs: fabricURIs,
                ethereumURIs: ethereumURIs,
                noCache: noCache,
                noAuth: noAuth
              });
              client.configUrl = configUrl;
              return _context136.abrupt("return", client);

            case 10:
            case "end":
              return _context136.stop();
          }
        }
      });
    }
  }]);

  return ElvClient;
}();

exports.ElvClient = ElvClient;