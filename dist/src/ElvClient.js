"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var SpaceContract = require("./contracts/BaseContentSpace");

var LibraryContract = require("./contracts/BaseLibrary");

var ContentContract = require("./contracts/BaseContent");

var ContentTypeContract = require("./contracts/BaseContentType");

var AccessGroupContract = require("./contracts/BaseAccessControlGroup"); // Platform specific polyfills


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
    this.contentTypes = {};
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
      this.HttpClient = new HttpClient(this.fabricURIs);
      this.ethClient = new EthClient(this.ethereumURIs);
      this.authClient = new AuthorizationClient({
        client: this,
        contentSpaceId: this.contentSpaceId,
        signer: this.signer,
        noCache: this.noCache,
        noAuth: this.noAuth
      });
      this.userProfileClient = new UserProfileClient({
        client: this
      });

      if (this.signer) {
        this.userProfileClient.WalletAddress();
      }
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
    value: function () {
      var _SetSignerFromWeb3Provider = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(_ref8) {
        var provider, ethProvider;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                provider = _ref8.provider;
                ethProvider = new Ethers.providers.Web3Provider(provider);
                ethProvider.pollingInterval = 250;
                this.signer = ethProvider.getSigner();
                _context5.next = 6;
                return this.signer.getAddress();

              case 6:
                this.signer.address = _context5.sent;
                _context5.next = 9;
                return this.InitializeClients();

              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function SetSignerFromWeb3Provider(_x5) {
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
      regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.CallContractMethod({
                  contractAddress: this.contentSpaceAddress,
                  abi: SpaceContract.abi,
                  methodName: "addressKMS"
                });

              case 2:
                return _context6.abrupt("return", _context6.sent);

              case 3:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
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
      regeneratorRuntime.mark(function _callee7(_ref9) {
        var name, contentSpaceAddress;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                name = _ref9.name;
                _context7.next = 3;
                return this.ethClient.DeployContentSpaceContract({
                  name: name,
                  signer: this.signer
                });

              case 3:
                contentSpaceAddress = _context7.sent;
                return _context7.abrupt("return", Utils.AddressToSpaceId(contentSpaceAddress));

              case 5:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function CreateContentSpace(_x6) {
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
      regeneratorRuntime.mark(function _callee8() {
        var _this = this;

        var libraryAddresses;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.Collection({
                  collectionType: "libraries"
                });

              case 2:
                libraryAddresses = _context8.sent;
                return _context8.abrupt("return", libraryAddresses.map(function (address) {
                  return _this.utils.AddressToLibraryId(address);
                }));

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
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
      regeneratorRuntime.mark(function _callee9(_ref10) {
        var libraryId, path, library;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                libraryId = _ref10.libraryId;
                path = UrlJoin("qlibs", libraryId);
                _context9.t0 = ResponseToJson;
                _context9.t1 = this.HttpClient;
                _context9.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId
                });

              case 6:
                _context9.t2 = _context9.sent;
                _context9.t3 = path;
                _context9.t4 = {
                  headers: _context9.t2,
                  method: "GET",
                  path: _context9.t3
                };
                _context9.t5 = _context9.t1.Request.call(_context9.t1, _context9.t4);
                _context9.next = 12;
                return (0, _context9.t0)(_context9.t5);

              case 12:
                library = _context9.sent;
                return _context9.abrupt("return", _objectSpread({}, library, {
                  meta: library.meta || {}
                }));

              case 14:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function ContentLibrary(_x7) {
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
      regeneratorRuntime.mark(function _callee10(_ref11) {
        var libraryId;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                libraryId = _ref11.libraryId;
                _context10.next = 3;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 3:
                return _context10.abrupt("return", _context10.sent);

              case 4:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function ContentLibraryOwner(_x8) {
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
      regeneratorRuntime.mark(function _callee11(_ref12) {
        var name, description, image, _ref12$metadata, metadata, kmsId, _ref13, contractAddress, libraryId, objectId, editResponse;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                name = _ref12.name, description = _ref12.description, image = _ref12.image, _ref12$metadata = _ref12.metadata, metadata = _ref12$metadata === void 0 ? {} : _ref12$metadata, kmsId = _ref12.kmsId;

                if (kmsId) {
                  _context11.next = 9;
                  break;
                }

                _context11.t0 = "ikms";
                _context11.t1 = this.utils;
                _context11.next = 6;
                return this.DefaultKMSAddress();

              case 6:
                _context11.t2 = _context11.sent;
                _context11.t3 = _context11.t1.AddressToHash.call(_context11.t1, _context11.t2);
                kmsId = _context11.t0.concat.call(_context11.t0, _context11.t3);

              case 9:
                _context11.next = 11;
                return this.authClient.CreateContentLibrary({
                  kmsId: kmsId
                });

              case 11:
                _ref13 = _context11.sent;
                contractAddress = _ref13.contractAddress;
                metadata = _objectSpread({}, metadata, {
                  name: name,
                  "eluv.description": description
                });
                libraryId = this.utils.AddressToLibraryId(contractAddress); // Set library content object type and metadata on automatically created library object

                objectId = libraryId.replace("ilib", "iq__");
                _context11.next = 18;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  options: {
                    type: "library"
                  }
                });

              case 18:
                editResponse = _context11.sent;
                _context11.next = 21;
                return this.ReplaceMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadata: metadata,
                  writeToken: editResponse.write_token
                });

              case 21:
                _context11.next = 23;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token
                });

              case 23:
                if (!image) {
                  _context11.next = 26;
                  break;
                }

                _context11.next = 26;
                return this.SetContentLibraryImage({
                  libraryId: libraryId,
                  image: image
                });

              case 26:
                return _context11.abrupt("return", libraryId);

              case 27:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function CreateContentLibrary(_x9) {
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
     * @param {blob} image - Image to upload
     */

  }, {
    key: "SetContentLibraryImage",
    value: function () {
      var _SetContentLibraryImage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(_ref14) {
        var libraryId, image, objectId;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                libraryId = _ref14.libraryId, image = _ref14.image;
                objectId = libraryId.replace("ilib", "iq__");
                return _context12.abrupt("return", this.SetContentObjectImage({
                  libraryId: libraryId,
                  objectId: objectId,
                  image: image
                }));

              case 3:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function SetContentLibraryImage(_x10) {
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
     * @param {blob} image - Image to upload
     */

  }, {
    key: "SetContentObjectImage",
    value: function () {
      var _SetContentObjectImage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(_ref15) {
        var libraryId, objectId, image, editResponse, uploadResponse;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                libraryId = _ref15.libraryId, objectId = _ref15.objectId, image = _ref15.image;
                _context13.next = 3;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 3:
                editResponse = _context13.sent;
                _context13.next = 6;
                return this.UploadPart({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  data: image,
                  encrypted: false
                });

              case 6:
                uploadResponse = _context13.sent;
                _context13.next = 9;
                return this.MergeMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  metadata: {
                    "image": uploadResponse.part.hash
                  }
                });

              case 9:
                _context13.next = 11;
                return this.MergeMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  metadataSubtree: "public",
                  metadata: {
                    "image": uploadResponse.part.hash
                  }
                });

              case 11:
                _context13.next = 13;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token
                });

              case 13:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function SetContentObjectImage(_x11) {
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
      regeneratorRuntime.mark(function _callee14(_ref16) {
        var libraryId, path, authorizationHeader;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                libraryId = _ref16.libraryId;
                path = UrlJoin("qlibs", libraryId);
                _context14.next = 4;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  update: true
                });

              case 4:
                authorizationHeader = _context14.sent;
                _context14.next = 7;
                return this.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "kill",
                  methodArgs: []
                });

              case 7:
                _context14.next = 9;
                return this.HttpClient.Request({
                  headers: authorizationHeader,
                  method: "DELETE",
                  path: path
                });

              case 9:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function DeleteContentLibrary(_x12) {
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
      regeneratorRuntime.mark(function _callee15(_ref17) {
        var libraryId, typeId, typeName, typeHash, customContractAddress, type, typeAddress, event;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                libraryId = _ref17.libraryId, typeId = _ref17.typeId, typeName = _ref17.typeName, typeHash = _ref17.typeHash, customContractAddress = _ref17.customContractAddress;

                if (typeHash) {
                  typeId = this.utils.DecodeVersionHash(typeHash).objectId;
                }

                if (typeId) {
                  _context15.next = 7;
                  break;
                }

                _context15.next = 5;
                return this.ContentType({
                  name: typeName
                });

              case 5:
                type = _context15.sent;
                typeId = type.id;

              case 7:
                typeAddress = this.utils.HashToAddress(typeId);
                customContractAddress = customContractAddress || this.utils.nullAddress;
                _context15.next = 11;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "addContentType",
                  methodArgs: [typeAddress, customContractAddress],
                  signer: this.signer
                });

              case 11:
                event = _context15.sent;
                return _context15.abrupt("return", event.transactionHash);

              case 13:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function AddLibraryContentType(_x13) {
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
      regeneratorRuntime.mark(function _callee16(_ref18) {
        var libraryId, typeId, typeName, typeHash, type, typeAddress, event;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                libraryId = _ref18.libraryId, typeId = _ref18.typeId, typeName = _ref18.typeName, typeHash = _ref18.typeHash;

                if (typeHash) {
                  typeId = this.utils.DecodeVersionHash(typeHash).objectId;
                }

                if (typeId) {
                  _context16.next = 7;
                  break;
                }

                _context16.next = 5;
                return this.ContentType({
                  name: typeName
                });

              case 5:
                type = _context16.sent;
                typeId = type.id;

              case 7:
                typeAddress = this.utils.HashToAddress(typeId);
                _context16.next = 10;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "removeContentType",
                  methodArgs: [typeAddress],
                  signer: this.signer
                });

              case 10:
                event = _context16.sent;
                return _context16.abrupt("return", event.transactionHash);

              case 12:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function RemoveLibraryContentType(_x14) {
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
     * @returns {Promise<Array<object>>} - List of accepted content types - return format is equivalent to ContentTypes method
     */

  }, {
    key: "LibraryContentTypes",
    value: function () {
      var _LibraryContentTypes = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee18(_ref19) {
        var _this2 = this;

        var libraryId, typesLength, allowedTypeAddresses, contentTypes, allowedTypes;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                libraryId = _ref19.libraryId;
                _context18.next = 3;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "contentTypesLength",
                  methodArgs: [],
                  signer: this.signer
                });

              case 3:
                typesLength = _context18.sent.toNumber();

                if (!(typesLength === 0)) {
                  _context18.next = 6;
                  break;
                }

                return _context18.abrupt("return", {});

              case 6:
                _context18.next = 8;
                return Promise.all(Array.from(new Array(typesLength),
                /*#__PURE__*/
                function () {
                  var _ref20 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee17(_, i) {
                    var typeAddress;
                    return regeneratorRuntime.wrap(function _callee17$(_context17) {
                      while (1) {
                        switch (_context17.prev = _context17.next) {
                          case 0:
                            _context17.next = 2;
                            return _this2.ethClient.CallContractMethod({
                              contractAddress: Utils.HashToAddress(libraryId),
                              abi: LibraryContract.abi,
                              methodName: "contentTypes",
                              methodArgs: [i],
                              signer: _this2.signer
                            });

                          case 2:
                            typeAddress = _context17.sent;
                            return _context17.abrupt("return", typeAddress.toString().toLowerCase());

                          case 4:
                          case "end":
                            return _context17.stop();
                        }
                      }
                    }, _callee17);
                  }));

                  return function (_x16, _x17) {
                    return _ref20.apply(this, arguments);
                  };
                }()));

              case 8:
                allowedTypeAddresses = _context18.sent;
                _context18.next = 11;
                return this.ContentTypes();

              case 11:
                contentTypes = _context18.sent;
                allowedTypes = {};
                Object.values(contentTypes).map(function (type) {
                  var typeAddress = _this2.utils.HashToAddress(type.id).toLowerCase(); // If type address is allowed, include it


                  if (allowedTypeAddresses.includes(typeAddress)) {
                    allowedTypes[type.id] = type;
                  }
                });
                return _context18.abrupt("return", allowedTypes);

              case 15:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function LibraryContentTypes(_x15) {
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
      regeneratorRuntime.mark(function _callee19(_ref21) {
        var name, typeId, versionHash, contentType;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                name = _ref21.name, typeId = _ref21.typeId, versionHash = _ref21.versionHash;
                _context19.next = 3;
                return this.ContentType({
                  name: name,
                  typeId: typeId,
                  versionHash: versionHash
                });

              case 3:
                contentType = _context19.sent;
                _context19.next = 6;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(contentType.id),
                  abi: ContentTypeContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 6:
                return _context19.abrupt("return", _context19.sent);

              case 7:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function ContentTypeOwner(_x18) {
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
      regeneratorRuntime.mark(function _callee20(_ref22) {
        var name, typeId, versionHash, types, typeInfo, metadata;
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                name = _ref22.name, typeId = _ref22.typeId, versionHash = _ref22.versionHash;

                if (versionHash) {
                  typeId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                if (!name) {
                  _context20.next = 6;
                  break;
                }

                _context20.next = 5;
                return this.ContentObjectMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: this.contentSpaceObjectId,
                  metadataSubtree: UrlJoin("contentTypes", name)
                });

              case 5:
                typeId = _context20.sent;

              case 6:
                if (typeId) {
                  _context20.next = 15;
                  break;
                }

                _context20.next = 9;
                return this.ContentTypes();

              case 9:
                types = _context20.sent;

                if (!name) {
                  _context20.next = 14;
                  break;
                }

                return _context20.abrupt("return", Object.values(types).find(function (type) {
                  return (type.name || "").toLowerCase() === name.toLowerCase();
                }));

              case 14:
                return _context20.abrupt("return", Object.values(types).find(function (type) {
                  return type.hash === versionHash;
                }));

              case 15:
                _context20.prev = 15;
                _context20.next = 18;
                return this.ContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: typeId
                });

              case 18:
                typeInfo = _context20.sent;
                delete typeInfo.type;
                _context20.next = 22;
                return this.ContentObjectMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: typeId
                });

              case 22:
                _context20.t0 = _context20.sent;

                if (_context20.t0) {
                  _context20.next = 25;
                  break;
                }

                _context20.t0 = {};

              case 25:
                metadata = _context20.t0;
                return _context20.abrupt("return", _objectSpread({}, typeInfo, {
                  name: metadata.name,
                  meta: metadata
                }));

              case 29:
                _context20.prev = 29;
                _context20.t1 = _context20["catch"](15);
                throw new Error("Content Type ".concat(name || typeId, " is invalid"));

              case 32:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this, [[15, 29]]);
      }));

      function ContentType(_x19) {
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
     * @return {Promise<Array<Object>>} - A list of content types
     */

  }, {
    key: "ContentTypes",
    value: function () {
      var _ContentTypes = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee22() {
        var _this3 = this;

        var typeAddresses;
        return regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                this.contentTypes = this.contentTypes || {};
                _context22.next = 3;
                return this.Collection({
                  collectionType: "contentTypes"
                });

              case 3:
                typeAddresses = _context22.sent;
                _context22.next = 6;
                return Promise.all(typeAddresses.map(
                /*#__PURE__*/
                function () {
                  var _ref23 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee21(typeAddress) {
                    var typeId;
                    return regeneratorRuntime.wrap(function _callee21$(_context21) {
                      while (1) {
                        switch (_context21.prev = _context21.next) {
                          case 0:
                            typeId = _this3.utils.AddressToObjectId(typeAddress);

                            if (_this3.contentTypes[typeId]) {
                              _context21.next = 10;
                              break;
                            }

                            _context21.prev = 2;
                            _context21.next = 5;
                            return _this3.ContentType({
                              typeId: typeId
                            });

                          case 5:
                            _this3.contentTypes[typeId] = _context21.sent;
                            _context21.next = 10;
                            break;

                          case 8:
                            _context21.prev = 8;
                            _context21.t0 = _context21["catch"](2);

                          case 10:
                          case "end":
                            return _context21.stop();
                        }
                      }
                    }, _callee21, null, [[2, 8]]);
                  }));

                  return function (_x20) {
                    return _ref23.apply(this, arguments);
                  };
                }()));

              case 6:
                return _context22.abrupt("return", this.contentTypes);

              case 7:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
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
      regeneratorRuntime.mark(function _callee23(_ref24) {
        var name, _ref24$metadata, metadata, bitcode, _ref25, contractAddress, objectId, path, createResponse, uploadResponse;

        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                name = _ref24.name, _ref24$metadata = _ref24.metadata, metadata = _ref24$metadata === void 0 ? {} : _ref24$metadata, bitcode = _ref24.bitcode;
                metadata.name = name;
                _context23.next = 4;
                return this.authClient.CreateContentType();

              case 4:
                _ref25 = _context23.sent;
                contractAddress = _ref25.contractAddress;
                objectId = this.utils.AddressToObjectId(contractAddress);
                path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);
                /* Create object, upload bitcode and finalize */

                _context23.t0 = ResponseToJson;
                _context23.t1 = this.HttpClient;
                _context23.next = 12;
                return this.authClient.AuthorizationHeader({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  update: true
                });

              case 12:
                _context23.t2 = _context23.sent;
                _context23.t3 = path;
                _context23.t4 = {
                  headers: _context23.t2,
                  method: "POST",
                  path: _context23.t3
                };
                _context23.t5 = _context23.t1.Request.call(_context23.t1, _context23.t4);
                _context23.next = 18;
                return (0, _context23.t0)(_context23.t5);

              case 18:
                createResponse = _context23.sent;
                _context23.next = 21;
                return this.ReplaceMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token,
                  metadata: metadata
                });

              case 21:
                if (!bitcode) {
                  _context23.next = 27;
                  break;
                }

                _context23.next = 24;
                return this.UploadPart({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token,
                  data: bitcode,
                  encrypted: false
                });

              case 24:
                uploadResponse = _context23.sent;
                _context23.next = 27;
                return this.ReplaceMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token,
                  metadataSubtree: "bitcode_part",
                  metadata: uploadResponse.part.hash
                });

              case 27:
                _context23.next = 29;
                return this.FinalizeContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token
                });

              case 29:
                return _context23.abrupt("return", objectId);

              case 30:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function CreateContentType(_x21) {
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
      regeneratorRuntime.mark(function _callee24(_ref26) {
        var libraryId, _ref26$filterOptions, filterOptions, path, queryParams, filterTypeMap, addFilter;

        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                libraryId = _ref26.libraryId, _ref26$filterOptions = _ref26.filterOptions, filterOptions = _ref26$filterOptions === void 0 ? {} : _ref26$filterOptions;
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

                addFilter = function addFilter(_ref27) {
                  var key = _ref27.key,
                      type = _ref27.type,
                      filter = _ref27.filter;
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

                _context24.t0 = ResponseToJson;
                _context24.t1 = this.HttpClient;
                _context24.next = 16;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId
                });

              case 16:
                _context24.t2 = _context24.sent;
                _context24.t3 = path;
                _context24.t4 = queryParams;
                _context24.t5 = {
                  headers: _context24.t2,
                  method: "GET",
                  path: _context24.t3,
                  queryParams: _context24.t4
                };
                _context24.t6 = _context24.t1.Request.call(_context24.t1, _context24.t5);
                _context24.next = 23;
                return (0, _context24.t0)(_context24.t6);

              case 23:
                return _context24.abrupt("return", _context24.sent);

              case 24:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function ContentObjects(_x22) {
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
      regeneratorRuntime.mark(function _callee25(_ref28) {
        var libraryId, objectId, versionHash, path;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                libraryId = _ref28.libraryId, objectId = _ref28.objectId, versionHash = _ref28.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId);
                _context25.t0 = ResponseToJson;
                _context25.t1 = this.HttpClient;
                _context25.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  noAuth: true
                });

              case 7:
                _context25.t2 = _context25.sent;
                _context25.t3 = path;
                _context25.t4 = {
                  headers: _context25.t2,
                  method: "GET",
                  path: _context25.t3
                };
                _context25.t5 = _context25.t1.Request.call(_context25.t1, _context25.t4);
                _context25.next = 13;
                return (0, _context25.t0)(_context25.t5);

              case 13:
                return _context25.abrupt("return", _context25.sent);

              case 14:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function ContentObject(_x23) {
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
      regeneratorRuntime.mark(function _callee26(_ref29) {
        var objectId;
        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                objectId = _ref29.objectId;
                _context26.next = 3;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  cacheContract: false,
                  signer: this.signer
                });

              case 3:
                return _context26.abrupt("return", _context26.sent);

              case 4:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function ContentObjectOwner(_x24) {
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
      regeneratorRuntime.mark(function _callee27(_ref30) {
        var objectId, versionHash;
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                objectId = _ref30.objectId, versionHash = _ref30.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context27.t0 = Utils;
                _context27.next = 5;
                return this.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "libraryAddress"
                });

              case 5:
                _context27.t1 = _context27.sent;
                return _context27.abrupt("return", _context27.t0.AddressToLibraryId.call(_context27.t0, _context27.t1));

              case 7:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function ContentObjectLibraryId(_x25) {
        return _ContentObjectLibraryId.apply(this, arguments);
      }

      return ContentObjectLibraryId;
    }()
    /**
     * Get the metadata of a content object
     *
     * @see /qlibs/:qlibid/q/:qhit/meta
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
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
      regeneratorRuntime.mark(function _callee28(_ref31) {
        var libraryId, objectId, versionHash, _ref31$metadataSubtre, metadataSubtree, _ref31$noAuth, noAuth, path;

        return regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                libraryId = _ref31.libraryId, objectId = _ref31.objectId, versionHash = _ref31.versionHash, _ref31$metadataSubtre = _ref31.metadataSubtree, metadataSubtree = _ref31$metadataSubtre === void 0 ? "/" : _ref31$metadataSubtre, _ref31$noAuth = _ref31.noAuth, noAuth = _ref31$noAuth === void 0 ? true : _ref31$noAuth;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "meta", metadataSubtree);
                _context28.prev = 3;
                _context28.t0 = ResponseToJson;
                _context28.t1 = this.HttpClient;
                _context28.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  noAuth: noAuth
                });

              case 8:
                _context28.t2 = _context28.sent;
                _context28.t3 = path;
                _context28.t4 = {
                  headers: _context28.t2,
                  method: "GET",
                  path: _context28.t3
                };
                _context28.t5 = _context28.t1.Request.call(_context28.t1, _context28.t4);
                _context28.next = 14;
                return (0, _context28.t0)(_context28.t5);

              case 14:
                return _context28.abrupt("return", _context28.sent);

              case 17:
                _context28.prev = 17;
                _context28.t6 = _context28["catch"](3);

                if (!(_context28.t6.status !== 404)) {
                  _context28.next = 21;
                  break;
                }

                throw _context28.t6;

              case 21:
                return _context28.abrupt("return", metadataSubtree === "/" ? {} : undefined);

              case 22:
              case "end":
                return _context28.stop();
            }
          }
        }, _callee28, this, [[3, 17]]);
      }));

      function ContentObjectMetadata(_x26) {
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
      regeneratorRuntime.mark(function _callee29(_ref32) {
        var libraryId, objectId, path;
        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                libraryId = _ref32.libraryId, objectId = _ref32.objectId;
                path = UrlJoin("qid", objectId);
                _context29.t0 = ResponseToJson;
                _context29.t1 = this.HttpClient;
                _context29.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 6:
                _context29.t2 = _context29.sent;
                _context29.t3 = path;
                _context29.t4 = {
                  headers: _context29.t2,
                  method: "GET",
                  path: _context29.t3
                };
                _context29.t5 = _context29.t1.Request.call(_context29.t1, _context29.t4);
                return _context29.abrupt("return", (0, _context29.t0)(_context29.t5));

              case 11:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function ContentObjectVersions(_x27) {
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
      regeneratorRuntime.mark(function _callee30(_ref33) {
        var libraryId, objectId, _ref33$options, options, typeId, type, _ref34, contractAddress, path;

        return regeneratorRuntime.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                libraryId = _ref33.libraryId, objectId = _ref33.objectId, _ref33$options = _ref33.options, options = _ref33$options === void 0 ? {} : _ref33$options;

                if (!options.type) {
                  _context30.next = 13;
                  break;
                }

                if (options.type.startsWith("hq__")) {
                  _context30.next = 8;
                  break;
                }

                _context30.next = 5;
                return this.ContentType({
                  name: options.type
                });

              case 5:
                type = _context30.sent;
                _context30.next = 11;
                break;

              case 8:
                _context30.next = 10;
                return this.ContentType({
                  versionHash: options.type
                });

              case 10:
                type = _context30.sent;

              case 11:
                typeId = type.id;
                options.type = type.hash;

              case 13:
                if (objectId) {
                  _context30.next = 21;
                  break;
                }

                _context30.next = 16;
                return this.authClient.CreateContentObject({
                  libraryId: libraryId,
                  typeId: typeId
                });

              case 16:
                _ref34 = _context30.sent;
                contractAddress = _ref34.contractAddress;
                _context30.next = 20;
                return this.CallContractMethod({
                  abi: ContentContract.abi,
                  contractAddress: contractAddress,
                  methodName: "setVisibility",
                  methodArgs: [100]
                });

              case 20:
                objectId = this.utils.AddressToObjectId(contractAddress);

              case 21:
                path = UrlJoin("qid", objectId);
                _context30.t0 = ResponseToJson;
                _context30.t1 = this.HttpClient;
                _context30.next = 26;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 26:
                _context30.t2 = _context30.sent;
                _context30.t3 = path;
                _context30.t4 = options;
                _context30.t5 = {
                  headers: _context30.t2,
                  method: "POST",
                  path: _context30.t3,
                  body: _context30.t4
                };
                _context30.t6 = _context30.t1.Request.call(_context30.t1, _context30.t5);
                _context30.next = 33;
                return (0, _context30.t0)(_context30.t6);

              case 33:
                return _context30.abrupt("return", _context30.sent);

              case 34:
              case "end":
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function CreateContentObject(_x28) {
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
      regeneratorRuntime.mark(function _callee31(_ref35) {
        var libraryId, originalVersionHash, _ref35$options, options;

        return regeneratorRuntime.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                libraryId = _ref35.libraryId, originalVersionHash = _ref35.originalVersionHash, _ref35$options = _ref35.options, options = _ref35$options === void 0 ? {} : _ref35$options;
                options.copy_from = originalVersionHash;
                _context31.next = 4;
                return this.CreateContentObject({
                  libraryId: libraryId,
                  options: options
                });

              case 4:
                return _context31.abrupt("return", _context31.sent);

              case 5:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function CopyContentObject(_x29) {
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
      regeneratorRuntime.mark(function _callee32(_ref36) {
        var libraryId, objectId, _ref36$options, options, path;

        return regeneratorRuntime.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                libraryId = _ref36.libraryId, objectId = _ref36.objectId, _ref36$options = _ref36.options, options = _ref36$options === void 0 ? {} : _ref36$options;

                if (this.utils.EqualHash(libraryId, objectId)) {
                  _context32.next = 5;
                  break;
                }

                // Don't allow changing of content type in this method
                delete options.type;
                _context32.next = 21;
                break;

              case 5:
                if (!options.type) {
                  _context32.next = 21;
                  break;
                }

                if (!options.type.startsWith("hq__")) {
                  _context32.next = 12;
                  break;
                }

                _context32.next = 9;
                return this.ContentType({
                  versionHash: options.type
                });

              case 9:
                options.type = _context32.sent.hash;
                _context32.next = 21;
                break;

              case 12:
                if (!options.type.startsWith("iq__")) {
                  _context32.next = 18;
                  break;
                }

                _context32.next = 15;
                return this.ContentType({
                  typeId: options.type
                });

              case 15:
                options.type = _context32.sent.hash;
                _context32.next = 21;
                break;

              case 18:
                _context32.next = 20;
                return this.ContentType({
                  name: options.type
                });

              case 20:
                options.type = _context32.sent.hash;

              case 21:
                path = UrlJoin("qid", objectId);
                _context32.t0 = ResponseToJson;
                _context32.t1 = this.HttpClient;
                _context32.next = 26;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 26:
                _context32.t2 = _context32.sent;
                _context32.t3 = path;
                _context32.t4 = options;
                _context32.t5 = {
                  headers: _context32.t2,
                  method: "POST",
                  path: _context32.t3,
                  body: _context32.t4
                };
                _context32.t6 = _context32.t1.Request.call(_context32.t1, _context32.t5);
                return _context32.abrupt("return", (0, _context32.t0)(_context32.t6));

              case 32:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function EditContentObject(_x30) {
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
     */

  }, {
    key: "FinalizeContentObject",
    value: function () {
      var _FinalizeContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee33(_ref37) {
        var libraryId, objectId, writeToken, _ref37$publish, publish, path, finalizeResponse;

        return regeneratorRuntime.wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                libraryId = _ref37.libraryId, objectId = _ref37.objectId, writeToken = _ref37.writeToken, _ref37$publish = _ref37.publish, publish = _ref37$publish === void 0 ? true : _ref37$publish;
                path = UrlJoin("q", writeToken);
                _context33.t0 = ResponseToJson;
                _context33.t1 = this.HttpClient;
                _context33.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 6:
                _context33.t2 = _context33.sent;
                _context33.t3 = path;
                _context33.t4 = {
                  headers: _context33.t2,
                  method: "POST",
                  path: _context33.t3
                };
                _context33.t5 = _context33.t1.Request.call(_context33.t1, _context33.t4);
                _context33.next = 12;
                return (0, _context33.t0)(_context33.t5);

              case 12:
                finalizeResponse = _context33.sent;

                if (!publish) {
                  _context33.next = 16;
                  break;
                }

                _context33.next = 16;
                return this.PublishContentVersion({
                  objectId: objectId,
                  versionHash: finalizeResponse.hash
                });

              case 16:
                // Invalidate cached content type, if this is one.
                delete this.contentTypes[objectId];
                return _context33.abrupt("return", finalizeResponse);

              case 18:
              case "end":
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }));

      function FinalizeContentObject(_x31) {
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
     */

  }, {
    key: "PublishContentVersion",
    value: function () {
      var _PublishContentVersion = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee34(_ref38) {
        var objectId, versionHash;
        return regeneratorRuntime.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                objectId = _ref38.objectId, versionHash = _ref38.versionHash;
                _context34.next = 3;
                return this.ethClient.CommitContent({
                  contentObjectAddress: this.utils.HashToAddress(objectId),
                  versionHash: versionHash,
                  signer: this.signer
                });

              case 3:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function PublishContentVersion(_x32) {
        return _PublishContentVersion.apply(this, arguments);
      }

      return PublishContentVersion;
    }()
    /**
     * Wait for committed content to be confirmed. Can be called after FinalizeContentObject or
     * PublishContentObject to ensure that the committed content has been confirmed before continuing.
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} objectId - ID of the object
     * @param {string} versionHash - The version hash of the content object to publish
     */

  }, {
    key: "AwaitCommitConfirmation",
    value: function () {
      var _AwaitCommitConfirmation = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee35(_ref39) {
        var objectId, versionHash, pendingHash;
        return regeneratorRuntime.wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                objectId = _ref39.objectId, versionHash = _ref39.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                pendingHash = "";

              case 3:
                _context35.next = 5;
                return this.CallContractMethod({
                  contractAddress: this.utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "pendingHash"
                });

              case 5:
                pendingHash = _context35.sent;

                if (!pendingHash) {
                  _context35.next = 9;
                  break;
                }

                _context35.next = 9;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, 500);
                });

              case 9:
                if (pendingHash) {
                  _context35.next = 3;
                  break;
                }

              case 10:
              case "end":
                return _context35.stop();
            }
          }
        }, _callee35, this);
      }));

      function AwaitCommitConfirmation(_x33) {
        return _AwaitCommitConfirmation.apply(this, arguments);
      }

      return AwaitCommitConfirmation;
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
      regeneratorRuntime.mark(function _callee36(_ref40) {
        var versionHash, _this$utils$DecodeVer, objectId;

        return regeneratorRuntime.wrap(function _callee36$(_context36) {
          while (1) {
            switch (_context36.prev = _context36.next) {
              case 0:
                versionHash = _ref40.versionHash;
                _this$utils$DecodeVer = this.utils.DecodeVersionHash(versionHash), objectId = _this$utils$DecodeVer.objectId;
                _context36.next = 4;
                return this.CallContractMethodAndWait({
                  contractAddress: this.utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "deleteVersion",
                  methodArgs: [versionHash]
                });

              case 4:
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
      regeneratorRuntime.mark(function _callee37(_ref41) {
        var libraryId, objectId;
        return regeneratorRuntime.wrap(function _callee37$(_context37) {
          while (1) {
            switch (_context37.prev = _context37.next) {
              case 0:
                libraryId = _ref41.libraryId, objectId = _ref41.objectId;
                _context37.next = 3;
                return this.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "deleteContent",
                  methodArgs: [this.utils.HashToAddress(objectId)]
                });

              case 3:
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
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee38(_ref42) {
        var libraryId, objectId, writeToken, _ref42$metadataSubtre, metadataSubtree, _ref42$metadata, metadata, path;

        return regeneratorRuntime.wrap(function _callee38$(_context38) {
          while (1) {
            switch (_context38.prev = _context38.next) {
              case 0:
                libraryId = _ref42.libraryId, objectId = _ref42.objectId, writeToken = _ref42.writeToken, _ref42$metadataSubtre = _ref42.metadataSubtree, metadataSubtree = _ref42$metadataSubtre === void 0 ? "/" : _ref42$metadataSubtre, _ref42$metadata = _ref42.metadata, metadata = _ref42$metadata === void 0 ? {} : _ref42$metadata;
                path = UrlJoin("q", writeToken, "meta", metadataSubtree);
                _context38.t0 = this.HttpClient;
                _context38.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context38.t1 = _context38.sent;
                _context38.t2 = path;
                _context38.t3 = metadata;
                _context38.t4 = {
                  headers: _context38.t1,
                  method: "POST",
                  path: _context38.t2,
                  body: _context38.t3
                };
                _context38.next = 11;
                return _context38.t0.Request.call(_context38.t0, _context38.t4);

              case 11:
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
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee39(_ref43) {
        var libraryId, objectId, writeToken, _ref43$metadataSubtre, metadataSubtree, _ref43$metadata, metadata, path;

        return regeneratorRuntime.wrap(function _callee39$(_context39) {
          while (1) {
            switch (_context39.prev = _context39.next) {
              case 0:
                libraryId = _ref43.libraryId, objectId = _ref43.objectId, writeToken = _ref43.writeToken, _ref43$metadataSubtre = _ref43.metadataSubtree, metadataSubtree = _ref43$metadataSubtre === void 0 ? "/" : _ref43$metadataSubtre, _ref43$metadata = _ref43.metadata, metadata = _ref43$metadata === void 0 ? {} : _ref43$metadata;
                path = UrlJoin("q", writeToken, "meta", metadataSubtree);
                _context39.t0 = this.HttpClient;
                _context39.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context39.t1 = _context39.sent;
                _context39.t2 = path;
                _context39.t3 = metadata;
                _context39.t4 = {
                  headers: _context39.t1,
                  method: "PUT",
                  path: _context39.t2,
                  body: _context39.t3
                };
                _context39.next = 11;
                return _context39.t0.Request.call(_context39.t0, _context39.t4);

              case 11:
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
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee40(_ref44) {
        var libraryId, objectId, writeToken, _ref44$metadataSubtre, metadataSubtree, path;

        return regeneratorRuntime.wrap(function _callee40$(_context40) {
          while (1) {
            switch (_context40.prev = _context40.next) {
              case 0:
                libraryId = _ref44.libraryId, objectId = _ref44.objectId, writeToken = _ref44.writeToken, _ref44$metadataSubtre = _ref44.metadataSubtree, metadataSubtree = _ref44$metadataSubtre === void 0 ? "/" : _ref44$metadataSubtre;
                path = UrlJoin("q", writeToken, "meta", metadataSubtree);
                _context40.t0 = this.HttpClient;
                _context40.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context40.t1 = _context40.sent;
                _context40.t2 = path;
                _context40.t3 = {
                  headers: _context40.t1,
                  method: "DELETE",
                  path: _context40.t2
                };
                _context40.next = 10;
                return _context40.t0.Request.call(_context40.t0, _context40.t3);

              case 10:
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
     * @see GET /qlibs/:qlibid/q/:qhit/meta/files
     *
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee41(_ref45) {
        var libraryId, objectId, versionHash, path;
        return regeneratorRuntime.wrap(function _callee41$(_context41) {
          while (1) {
            switch (_context41.prev = _context41.next) {
              case 0:
                libraryId = _ref45.libraryId, objectId = _ref45.objectId, versionHash = _ref45.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "meta", "files");
                _context41.t0 = ResponseToJson;
                _context41.t1 = this.HttpClient;
                _context41.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 7:
                _context41.t2 = _context41.sent;
                _context41.t3 = path;
                _context41.t4 = {
                  headers: _context41.t2,
                  method: "GET",
                  path: _context41.t3
                };
                _context41.t5 = _context41.t1.Request.call(_context41.t1, _context41.t4);
                return _context41.abrupt("return", (0, _context41.t0)(_context41.t5));

              case 12:
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
     * Upload files to a content object.
     * This method encapsulates the complexity of creating upload jobs and uploading data to them.
     * It is highly recommended to use this method over using CreateFileUploadJob, UploadFileData and FinalizeUploadJobs
     * individually
     *
     * @see GET /qlibs/:qlibid/q/:qhit/meta/files
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the draft
     * @param {Array<object>} fileInfo - List of files to upload, including their size, type, and contents
     */

  }, {
    key: "UploadFiles",
    value: function () {
      var _UploadFiles = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee43(_ref46) {
        var _this4 = this;

        var libraryId, objectId, writeToken, fileInfo, fileDataMap, uploadJobs;
        return regeneratorRuntime.wrap(function _callee43$(_context43) {
          while (1) {
            switch (_context43.prev = _context43.next) {
              case 0:
                libraryId = _ref46.libraryId, objectId = _ref46.objectId, writeToken = _ref46.writeToken, fileInfo = _ref46.fileInfo;
                // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
                fileDataMap = {};
                fileInfo = fileInfo.map(function (entry) {
                  fileDataMap[entry.path] = entry.data;
                  return _objectSpread({}, entry, {
                    data: undefined
                  });
                });
                _context43.next = 5;
                return this.CreateFileUploadJob({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  fileInfo: fileInfo
                });

              case 5:
                uploadJobs = _context43.sent.upload_jobs;
                _context43.next = 8;
                return Promise.all(uploadJobs.map(
                /*#__PURE__*/
                function () {
                  var _ref47 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee42(jobInfo) {
                    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _fileInfo, fileData;

                    return regeneratorRuntime.wrap(function _callee42$(_context42) {
                      while (1) {
                        switch (_context42.prev = _context42.next) {
                          case 0:
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context42.prev = 3;
                            _iterator = jobInfo.files[Symbol.iterator]();

                          case 5:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                              _context42.next = 13;
                              break;
                            }

                            _fileInfo = _step.value;
                            fileData = fileDataMap[_fileInfo.path].slice(_fileInfo.off, _fileInfo.off + _fileInfo.len);
                            _context42.next = 10;
                            return _this4.UploadFileData({
                              libraryId: libraryId,
                              objectId: objectId,
                              writeToken: writeToken,
                              jobId: jobInfo.id,
                              fileData: fileData
                            });

                          case 10:
                            _iteratorNormalCompletion = true;
                            _context42.next = 5;
                            break;

                          case 13:
                            _context42.next = 19;
                            break;

                          case 15:
                            _context42.prev = 15;
                            _context42.t0 = _context42["catch"](3);
                            _didIteratorError = true;
                            _iteratorError = _context42.t0;

                          case 19:
                            _context42.prev = 19;
                            _context42.prev = 20;

                            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                              _iterator["return"]();
                            }

                          case 22:
                            _context42.prev = 22;

                            if (!_didIteratorError) {
                              _context42.next = 25;
                              break;
                            }

                            throw _iteratorError;

                          case 25:
                            return _context42.finish(22);

                          case 26:
                            return _context42.finish(19);

                          case 27:
                          case "end":
                            return _context42.stop();
                        }
                      }
                    }, _callee42, null, [[3, 15, 19, 27], [20,, 22, 26]]);
                  }));

                  return function (_x41) {
                    return _ref47.apply(this, arguments);
                  };
                }()));

              case 8:
                _context43.next = 10;
                return this.FinalizeUploadJobs({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken
                });

              case 10:
              case "end":
                return _context43.stop();
            }
          }
        }, _callee43, this);
      }));

      function UploadFiles(_x40) {
        return _UploadFiles.apply(this, arguments);
      }

      return UploadFiles;
    }()
  }, {
    key: "CreateFileUploadJob",
    value: function () {
      var _CreateFileUploadJob = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee44(_ref48) {
        var libraryId, objectId, writeToken, fileInfo, path;
        return regeneratorRuntime.wrap(function _callee44$(_context44) {
          while (1) {
            switch (_context44.prev = _context44.next) {
              case 0:
                libraryId = _ref48.libraryId, objectId = _ref48.objectId, writeToken = _ref48.writeToken, fileInfo = _ref48.fileInfo;
                path = UrlJoin("q", writeToken, "upload_jobs");
                _context44.t0 = ResponseToJson;
                _context44.t1 = this.HttpClient;
                _context44.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 6:
                _context44.t2 = _context44.sent;
                _context44.t3 = path;
                _context44.t4 = fileInfo;
                _context44.t5 = {
                  headers: _context44.t2,
                  method: "POST",
                  path: _context44.t3,
                  body: _context44.t4
                };
                _context44.t6 = _context44.t1.Request.call(_context44.t1, _context44.t5);
                return _context44.abrupt("return", (0, _context44.t0)(_context44.t6));

              case 12:
              case "end":
                return _context44.stop();
            }
          }
        }, _callee44, this);
      }));

      function CreateFileUploadJob(_x42) {
        return _CreateFileUploadJob.apply(this, arguments);
      }

      return CreateFileUploadJob;
    }()
  }, {
    key: "UploadFileData",
    value: function () {
      var _UploadFileData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee45(_ref49) {
        var libraryId, objectId, writeToken, jobId, fileData, path;
        return regeneratorRuntime.wrap(function _callee45$(_context45) {
          while (1) {
            switch (_context45.prev = _context45.next) {
              case 0:
                libraryId = _ref49.libraryId, objectId = _ref49.objectId, writeToken = _ref49.writeToken, jobId = _ref49.jobId, fileData = _ref49.fileData;
                path = UrlJoin("q", writeToken, "upload_jobs", jobId);
                _context45.t0 = ResponseToJson;
                _context45.t1 = this.HttpClient;
                _context45.t2 = path;
                _context45.t3 = fileData;
                _context45.t4 = _objectSpread;
                _context45.t5 = {
                  "Content-type": "application/octet-stream"
                };
                _context45.next = 10;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 10:
                _context45.t6 = _context45.sent;
                _context45.t7 = (0, _context45.t4)(_context45.t5, _context45.t6);
                _context45.t8 = {
                  method: "POST",
                  path: _context45.t2,
                  body: _context45.t3,
                  bodyType: "BINARY",
                  headers: _context45.t7
                };
                _context45.t9 = _context45.t1.Request.call(_context45.t1, _context45.t8);
                return _context45.abrupt("return", (0, _context45.t0)(_context45.t9));

              case 15:
              case "end":
                return _context45.stop();
            }
          }
        }, _callee45, this);
      }));

      function UploadFileData(_x43) {
        return _UploadFileData.apply(this, arguments);
      }

      return UploadFileData;
    }()
  }, {
    key: "UploadJobStatus",
    value: function () {
      var _UploadJobStatus = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee46(_ref50) {
        var libraryId, objectId, writeToken, jobId, path;
        return regeneratorRuntime.wrap(function _callee46$(_context46) {
          while (1) {
            switch (_context46.prev = _context46.next) {
              case 0:
                libraryId = _ref50.libraryId, objectId = _ref50.objectId, writeToken = _ref50.writeToken, jobId = _ref50.jobId;
                path = UrlJoin("q", writeToken, "upload_jobs", jobId);
                _context46.t0 = ResponseToJson;
                _context46.t1 = this.HttpClient;
                _context46.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 6:
                _context46.t2 = _context46.sent;
                _context46.t3 = path;
                _context46.t4 = {
                  headers: _context46.t2,
                  method: "GET",
                  path: _context46.t3
                };
                _context46.t5 = _context46.t1.Request.call(_context46.t1, _context46.t4);
                return _context46.abrupt("return", (0, _context46.t0)(_context46.t5));

              case 11:
              case "end":
                return _context46.stop();
            }
          }
        }, _callee46, this);
      }));

      function UploadJobStatus(_x44) {
        return _UploadJobStatus.apply(this, arguments);
      }

      return UploadJobStatus;
    }()
  }, {
    key: "FinalizeUploadJobs",
    value: function () {
      var _FinalizeUploadJobs = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee47(_ref51) {
        var libraryId, objectId, writeToken, path;
        return regeneratorRuntime.wrap(function _callee47$(_context47) {
          while (1) {
            switch (_context47.prev = _context47.next) {
              case 0:
                libraryId = _ref51.libraryId, objectId = _ref51.objectId, writeToken = _ref51.writeToken;
                path = UrlJoin("q", writeToken, "files");
                _context47.t0 = this.HttpClient;
                _context47.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context47.t1 = _context47.sent;
                _context47.t2 = path;
                _context47.t3 = {
                  headers: _context47.t1,
                  method: "POST",
                  path: _context47.t2
                };
                _context47.next = 10;
                return _context47.t0.Request.call(_context47.t0, _context47.t3);

              case 10:
              case "end":
                return _context47.stop();
            }
          }
        }, _callee47, this);
      }));

      function FinalizeUploadJobs(_x45) {
        return _FinalizeUploadJobs.apply(this, arguments);
      }

      return FinalizeUploadJobs;
    }()
    /**
     * Download a file from a content object
     *
     * @see GET /qlibs/:qlibid/q/:qhit/files/:filePath
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
     * @param {string} filePath - Path to the file to download
     * @param {string=} format="blob" - Format in which to return the data ("blob" | "arraybuffer")
     *
     * @returns {Promise<(Blob | ArrayBuffer)>} - Part data as a blob
     */

  }, {
    key: "DownloadFile",
    value: function () {
      var _DownloadFile = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee48(_ref52) {
        var libraryId, objectId, versionHash, filePath, _ref52$format, format, path;

        return regeneratorRuntime.wrap(function _callee48$(_context48) {
          while (1) {
            switch (_context48.prev = _context48.next) {
              case 0:
                libraryId = _ref52.libraryId, objectId = _ref52.objectId, versionHash = _ref52.versionHash, filePath = _ref52.filePath, _ref52$format = _ref52.format, format = _ref52$format === void 0 ? "blob" : _ref52$format;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "files", filePath);
                _context48.t0 = ResponseToFormat;
                _context48.t1 = format;
                _context48.t2 = this.HttpClient;
                _context48.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 8:
                _context48.t3 = _context48.sent;
                _context48.t4 = path;
                _context48.t5 = {
                  headers: _context48.t3,
                  method: "GET",
                  path: _context48.t4
                };
                _context48.t6 = _context48.t2.Request.call(_context48.t2, _context48.t5);
                return _context48.abrupt("return", (0, _context48.t0)(_context48.t1, _context48.t6));

              case 13:
              case "end":
                return _context48.stop();
            }
          }
        }, _callee48, this);
      }));

      function DownloadFile(_x46) {
        return _DownloadFile.apply(this, arguments);
      }

      return DownloadFile;
    }()
    /* Parts */

    /**
     * List content object parts
     *
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee49(_ref53) {
        var libraryId, objectId, versionHash, path, response;
        return regeneratorRuntime.wrap(function _callee49$(_context49) {
          while (1) {
            switch (_context49.prev = _context49.next) {
              case 0:
                libraryId = _ref53.libraryId, objectId = _ref53.objectId, versionHash = _ref53.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "parts");
                _context49.t0 = ResponseToJson;
                _context49.t1 = this.HttpClient;
                _context49.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 7:
                _context49.t2 = _context49.sent;
                _context49.t3 = path;
                _context49.t4 = {
                  headers: _context49.t2,
                  method: "GET",
                  path: _context49.t3
                };
                _context49.t5 = _context49.t1.Request.call(_context49.t1, _context49.t4);
                _context49.next = 13;
                return (0, _context49.t0)(_context49.t5);

              case 13:
                response = _context49.sent;
                return _context49.abrupt("return", response.parts);

              case 15:
              case "end":
                return _context49.stop();
            }
          }
        }, _callee49, this);
      }));

      function ContentParts(_x47) {
        return _ContentParts.apply(this, arguments);
      }

      return ContentParts;
    }()
    /**
     * Get information on a specific part
     *
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee50(_ref54) {
        var libraryId, objectId, versionHash, partHash, path;
        return regeneratorRuntime.wrap(function _callee50$(_context50) {
          while (1) {
            switch (_context50.prev = _context50.next) {
              case 0:
                libraryId = _ref54.libraryId, objectId = _ref54.objectId, versionHash = _ref54.versionHash, partHash = _ref54.partHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "parts", partHash);
                _context50.t0 = ResponseToJson;
                _context50.t1 = this.HttpClient;
                _context50.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 7:
                _context50.t2 = _context50.sent;
                _context50.t3 = path;
                _context50.t4 = {
                  headers: _context50.t2,
                  method: "GET",
                  path: _context50.t3
                };
                _context50.t5 = _context50.t1.Request.call(_context50.t1, _context50.t4);
                _context50.next = 13;
                return (0, _context50.t0)(_context50.t5);

              case 13:
                return _context50.abrupt("return", _context50.sent);

              case 14:
              case "end":
                return _context50.stop();
            }
          }
        }, _callee50, this);
      }));

      function ContentPart(_x48) {
        return _ContentPart.apply(this, arguments);
      }

      return ContentPart;
    }()
    /**
     * Download a part from a content object. The fromByte and range parameters can be used to specify a
     * specific section of the part to download.
     *
     * @see GET /qlibs/:qlibid/q/:qhit/data/:qparthash
     *
     * @methodGroup Content Objects
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
     * @returns {Promise<(Blob | ArrayBuffer)>} - Part data as a blob
     */

  }, {
    key: "DownloadPart",
    value: function () {
      var _DownloadPart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee52(_ref55) {
        var libraryId, objectId, versionHash, partHash, _ref55$format, format, _ref55$chunked, chunked, _ref55$chunkSize, chunkSize, callback, encrypted, encryption, path, headers, response, data, encryptionCap, bytesTotal, bytesFinished, stream, _encryptionCap, totalChunks, i, _response;

        return regeneratorRuntime.wrap(function _callee52$(_context52) {
          while (1) {
            switch (_context52.prev = _context52.next) {
              case 0:
                libraryId = _ref55.libraryId, objectId = _ref55.objectId, versionHash = _ref55.versionHash, partHash = _ref55.partHash, _ref55$format = _ref55.format, format = _ref55$format === void 0 ? "arrayBuffer" : _ref55$format, _ref55$chunked = _ref55.chunked, chunked = _ref55$chunked === void 0 ? false : _ref55$chunked, _ref55$chunkSize = _ref55.chunkSize, chunkSize = _ref55$chunkSize === void 0 ? 10000000 : _ref55$chunkSize, callback = _ref55.callback;

                if (!(chunked && !callback)) {
                  _context52.next = 3;
                  break;
                }

                throw Error("No callback specified for chunked part download");

              case 3:
                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                encrypted = partHash.startsWith("hqpe");
                encryption = encrypted ? "cgck" : "none";
                path = UrlJoin("q", versionHash || objectId, "data", partHash);
                _context52.next = 9;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  encryption: encryption
                });

              case 9:
                headers = _context52.sent;

                if (chunked) {
                  _context52.next = 27;
                  break;
                }

                _context52.next = 13;
                return this.HttpClient.Request({
                  headers: headers,
                  method: "GET",
                  path: path
                });

              case 13:
                response = _context52.sent;
                _context52.next = 16;
                return response.arrayBuffer();

              case 16:
                data = _context52.sent;

                if (!encrypted) {
                  _context52.next = 24;
                  break;
                }

                _context52.next = 20;
                return this.EncryptionCap({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 20:
                encryptionCap = _context52.sent;
                _context52.next = 23;
                return Crypto.Decrypt(encryptionCap, data);

              case 23:
                data = _context52.sent;

              case 24:
                _context52.next = 26;
                return ResponseToFormat(format, new Response(data));

              case 26:
                return _context52.abrupt("return", _context52.sent);

              case 27:
                _context52.next = 29;
                return this.ContentPart({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  partHash: partHash
                });

              case 29:
                bytesTotal = _context52.sent.part.size;
                bytesFinished = 0;

                if (!encrypted) {
                  _context52.next = 39;
                  break;
                }

                _context52.next = 34;
                return this.EncryptionCap({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 34:
                _encryptionCap = _context52.sent;
                _context52.next = 37;
                return Crypto.OpenDecryptionStream(_encryptionCap);

              case 37:
                stream = _context52.sent;
                stream = stream.on("data",
                /*#__PURE__*/
                function () {
                  var _ref56 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee51(chunk) {
                    var arrayBuffer;
                    return regeneratorRuntime.wrap(function _callee51$(_context51) {
                      while (1) {
                        switch (_context51.prev = _context51.next) {
                          case 0:
                            if (!(format !== "buffer")) {
                              _context51.next = 9;
                              break;
                            }

                            arrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);

                            if (!(format === "arrayBuffer")) {
                              _context51.next = 6;
                              break;
                            }

                            chunk = arrayBuffer;
                            _context51.next = 9;
                            break;

                          case 6:
                            _context51.next = 8;
                            return ResponseToFormat(format, new Response(arrayBuffer));

                          case 8:
                            chunk = _context51.sent;

                          case 9:
                            callback({
                              bytesFinished: bytesFinished,
                              bytesTotal: bytesTotal,
                              chunk: chunk
                            });

                          case 10:
                          case "end":
                            return _context51.stop();
                        }
                      }
                    }, _callee51);
                  }));

                  return function (_x50) {
                    return _ref56.apply(this, arguments);
                  };
                }());

              case 39:
                totalChunks = Math.ceil(bytesTotal / chunkSize);
                i = 0;

              case 41:
                if (!(i < totalChunks)) {
                  _context52.next = 68;
                  break;
                }

                headers["Range"] = "bytes=".concat(bytesFinished, "-").concat(bytesFinished + chunkSize - 1);
                _context52.next = 45;
                return this.HttpClient.Request({
                  headers: headers,
                  method: "GET",
                  path: path
                });

              case 45:
                _response = _context52.sent;
                bytesFinished = Math.min(bytesFinished + chunkSize, bytesTotal);

                if (!encrypted) {
                  _context52.next = 57;
                  break;
                }

                _context52.t0 = stream;
                _context52.t1 = Uint8Array;
                _context52.next = 52;
                return _response.arrayBuffer();

              case 52:
                _context52.t2 = _context52.sent;
                _context52.t3 = new _context52.t1(_context52.t2);

                _context52.t0.write.call(_context52.t0, _context52.t3);

                _context52.next = 65;
                break;

              case 57:
                _context52.t4 = callback;
                _context52.t5 = bytesFinished;
                _context52.t6 = bytesTotal;
                _context52.next = 62;
                return ResponseToFormat(format, _response);

              case 62:
                _context52.t7 = _context52.sent;
                _context52.t8 = {
                  bytesFinished: _context52.t5,
                  bytesTotal: _context52.t6,
                  chunk: _context52.t7
                };
                (0, _context52.t4)(_context52.t8);

              case 65:
                i++;
                _context52.next = 41;
                break;

              case 68:
                if (!stream) {
                  _context52.next = 72;
                  break;
                }

                // Wait for decryption to complete
                stream.end();
                _context52.next = 72;
                return new Promise(function (resolve) {
                  return stream.on("finish", function () {
                    resolve();
                  });
                });

              case 72:
              case "end":
                return _context52.stop();
            }
          }
        }, _callee52, this);
      }));

      function DownloadPart(_x49) {
        return _DownloadPart.apply(this, arguments);
      }

      return DownloadPart;
    }()
  }, {
    key: "EncryptionCap",
    value: function () {
      var _EncryptionCap = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee53(_ref57) {
        var libraryId, objectId, writeToken, owner, capKey, existingCap, cap, kmsAddress, kmsPublicKey, kmsCapKey, metadata;
        return regeneratorRuntime.wrap(function _callee53$(_context53) {
          while (1) {
            switch (_context53.prev = _context53.next) {
              case 0:
                libraryId = _ref57.libraryId, objectId = _ref57.objectId, writeToken = _ref57.writeToken;
                _context53.next = 3;
                return this.authClient.Owner({
                  id: objectId,
                  abi: ContentContract.abi
                });

              case 3:
                owner = _context53.sent;

                if (this.utils.EqualAddress(owner, this.signer.address)) {
                  _context53.next = 8;
                  break;
                }

                _context53.next = 7;
                return this.authClient.ReEncryptionCap({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 7:
                return _context53.abrupt("return", _context53.sent);

              case 8:
                // Primary encryption
                capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
                _context53.next = 11;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  // Cap may only exist in draft
                  objectId: writeToken || objectId,
                  metadataSubtree: capKey
                });

              case 11:
                existingCap = _context53.sent;

                if (!existingCap) {
                  _context53.next = 16;
                  break;
                }

                _context53.next = 15;
                return Crypto.DecryptCap(existingCap, this.signer.signingKey.privateKey);

              case 15:
                return _context53.abrupt("return", _context53.sent);

              case 16:
                _context53.next = 18;
                return Crypto.GeneratePrimaryCap();

              case 18:
                cap = _context53.sent;

                if (!writeToken) {
                  _context53.next = 42;
                  break;
                }

                _context53.next = 22;
                return this.authClient.KMSAddress({
                  objectId: objectId
                });

              case 22:
                kmsAddress = _context53.sent;
                _context53.next = 25;
                return this.authClient.KMSInfo({
                  objectId: objectId
                });

              case 25:
                kmsPublicKey = _context53.sent.publicKey;
                kmsCapKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
                metadata = {};
                _context53.next = 30;
                return Crypto.EncryptCap(cap, this.signer.signingKey.publicKey);

              case 30:
                metadata[capKey] = _context53.sent;
                _context53.prev = 31;
                _context53.next = 34;
                return Crypto.EncryptCap(cap, kmsPublicKey);

              case 34:
                metadata[kmsCapKey] = _context53.sent;
                _context53.next = 40;
                break;

              case 37:
                _context53.prev = 37;
                _context53.t0 = _context53["catch"](31);
                // eslint-disable-next-line no-console
                console.error("Failed to create encryption cap for KMS with public key " + kmsPublicKey);

              case 40:
                _context53.next = 42;
                return this.MergeMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  metadata: metadata
                });

              case 42:
                return _context53.abrupt("return", cap);

              case 43:
              case "end":
                return _context53.stop();
            }
          }
        }, _callee53, this, [[31, 37]]);
      }));

      function EncryptionCap(_x51) {
        return _EncryptionCap.apply(this, arguments);
      }

      return EncryptionCap;
    }()
    /**
     * Create a part upload draft
     *
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee54(_ref58) {
        var libraryId, objectId, writeToken, encryption, path, openResponse;
        return regeneratorRuntime.wrap(function _callee54$(_context54) {
          while (1) {
            switch (_context54.prev = _context54.next) {
              case 0:
                libraryId = _ref58.libraryId, objectId = _ref58.objectId, writeToken = _ref58.writeToken, encryption = _ref58.encryption;
                path = UrlJoin("q", writeToken, "parts");
                _context54.t0 = ResponseToJson;
                _context54.t1 = this.HttpClient;
                _context54.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true,
                  encryption: encryption
                });

              case 6:
                _context54.t2 = _context54.sent;
                _context54.t3 = path;
                _context54.t4 = {
                  headers: _context54.t2,
                  method: "POST",
                  path: _context54.t3,
                  bodyType: "BINARY",
                  body: ""
                };
                _context54.t5 = _context54.t1.Request.call(_context54.t1, _context54.t4);
                _context54.next = 12;
                return (0, _context54.t0)(_context54.t5);

              case 12:
                openResponse = _context54.sent;
                return _context54.abrupt("return", openResponse.part.write_token);

              case 14:
              case "end":
                return _context54.stop();
            }
          }
        }, _callee54, this);
      }));

      function CreatePart(_x52) {
        return _CreatePart.apply(this, arguments);
      }

      return CreatePart;
    }()
    /**
     * Upload data to an open part draft
     *
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee55(_ref59) {
        var libraryId, objectId, writeToken, partWriteToken, chunk, encryption, encryptionCap, path;
        return regeneratorRuntime.wrap(function _callee55$(_context55) {
          while (1) {
            switch (_context55.prev = _context55.next) {
              case 0:
                libraryId = _ref59.libraryId, objectId = _ref59.objectId, writeToken = _ref59.writeToken, partWriteToken = _ref59.partWriteToken, chunk = _ref59.chunk, encryption = _ref59.encryption;

                if (!(encryption && encryption !== "none")) {
                  _context55.next = 8;
                  break;
                }

                _context55.next = 4;
                return this.EncryptionCap({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken
                });

              case 4:
                encryptionCap = _context55.sent;
                _context55.next = 7;
                return Crypto.Encrypt(encryptionCap, chunk);

              case 7:
                chunk = _context55.sent;

              case 8:
                path = UrlJoin("q", writeToken, "parts");
                _context55.t0 = ResponseToJson;
                _context55.t1 = this.HttpClient;
                _context55.next = 13;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true,
                  encryption: encryption
                });

              case 13:
                _context55.t2 = _context55.sent;
                _context55.t3 = UrlJoin(path, partWriteToken);
                _context55.t4 = chunk;
                _context55.t5 = {
                  headers: _context55.t2,
                  method: "POST",
                  path: _context55.t3,
                  body: _context55.t4,
                  bodyType: "BINARY"
                };
                _context55.t6 = _context55.t1.Request.call(_context55.t1, _context55.t5);
                _context55.next = 20;
                return (0, _context55.t0)(_context55.t6);

              case 20:
              case "end":
                return _context55.stop();
            }
          }
        }, _callee55, this);
      }));

      function UploadPartChunk(_x53) {
        return _UploadPartChunk.apply(this, arguments);
      }

      return UploadPartChunk;
    }()
    /**
     * Finalize an open part draft
     *
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee56(_ref60) {
        var libraryId, objectId, writeToken, partWriteToken, encryption, path;
        return regeneratorRuntime.wrap(function _callee56$(_context56) {
          while (1) {
            switch (_context56.prev = _context56.next) {
              case 0:
                libraryId = _ref60.libraryId, objectId = _ref60.objectId, writeToken = _ref60.writeToken, partWriteToken = _ref60.partWriteToken, encryption = _ref60.encryption;
                path = UrlJoin("q", writeToken, "parts");
                _context56.t0 = ResponseToJson;
                _context56.t1 = this.HttpClient;
                _context56.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true,
                  encryption: encryption
                });

              case 6:
                _context56.t2 = _context56.sent;
                _context56.t3 = UrlJoin(path, partWriteToken);
                _context56.t4 = {
                  headers: _context56.t2,
                  method: "POST",
                  path: _context56.t3,
                  bodyType: "BINARY",
                  body: ""
                };
                _context56.next = 11;
                return _context56.t1.Request.call(_context56.t1, _context56.t4);

              case 11:
                _context56.t5 = _context56.sent;
                _context56.next = 14;
                return (0, _context56.t0)(_context56.t5);

              case 14:
                return _context56.abrupt("return", _context56.sent);

              case 15:
              case "end":
                return _context56.stop();
            }
          }
        }, _callee56, this);
      }));

      function FinalizePart(_x54) {
        return _FinalizePart.apply(this, arguments);
      }

      return FinalizePart;
    }()
    /**
     * Upload part to an object draft
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {(ArrayBuffer | Buffer)} data - Data to upload
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
      regeneratorRuntime.mark(function _callee57(_ref61) {
        var libraryId, objectId, writeToken, data, _ref61$encryption, encryption, partWriteToken;

        return regeneratorRuntime.wrap(function _callee57$(_context57) {
          while (1) {
            switch (_context57.prev = _context57.next) {
              case 0:
                libraryId = _ref61.libraryId, objectId = _ref61.objectId, writeToken = _ref61.writeToken, data = _ref61.data, _ref61$encryption = _ref61.encryption, encryption = _ref61$encryption === void 0 ? "none" : _ref61$encryption;
                _context57.next = 3;
                return this.CreatePart({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  encryption: encryption
                });

              case 3:
                partWriteToken = _context57.sent;
                _context57.next = 6;
                return this.UploadPartChunk({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  partWriteToken: partWriteToken,
                  chunk: data,
                  encryption: encryption
                });

              case 6:
                _context57.next = 8;
                return this.FinalizePart({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  partWriteToken: partWriteToken,
                  encryption: encryption
                });

              case 8:
                return _context57.abrupt("return", _context57.sent);

              case 9:
              case "end":
                return _context57.stop();
            }
          }
        }, _callee57, this);
      }));

      function UploadPart(_x55) {
        return _UploadPart.apply(this, arguments);
      }

      return UploadPart;
    }()
    /**
     * Delete the specified part from a content draft
     *
     * @see DELETE /qlibs/:qlibid/q/:write_token/parts/:qparthash
     *
     * @methodGroup Content Objects
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
      regeneratorRuntime.mark(function _callee58(_ref62) {
        var libraryId, objectId, writeToken, partHash, path;
        return regeneratorRuntime.wrap(function _callee58$(_context58) {
          while (1) {
            switch (_context58.prev = _context58.next) {
              case 0:
                libraryId = _ref62.libraryId, objectId = _ref62.objectId, writeToken = _ref62.writeToken, partHash = _ref62.partHash;
                path = UrlJoin("q", writeToken, "parts", partHash);
                _context58.t0 = this.HttpClient;
                _context58.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context58.t1 = _context58.sent;
                _context58.t2 = path;
                _context58.t3 = {
                  headers: _context58.t1,
                  method: "DELETE",
                  path: _context58.t2
                };
                _context58.next = 10;
                return _context58.t0.Request.call(_context58.t0, _context58.t3);

              case 10:
              case "end":
                return _context58.stop();
            }
          }
        }, _callee58, this);
      }));

      function DeletePart(_x56) {
        return _DeletePart.apply(this, arguments);
      }

      return DeletePart;
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
      regeneratorRuntime.mark(function _callee59(_ref63) {
        var objectId, accessCharge;
        return regeneratorRuntime.wrap(function _callee59$(_context59) {
          while (1) {
            switch (_context59.prev = _context59.next) {
              case 0:
                objectId = _ref63.objectId, accessCharge = _ref63.accessCharge;
                _context59.next = 3;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "setAccessCharge",
                  methodArgs: [Utils.EtherToWei(accessCharge).toString()],
                  signer: this.signer
                });

              case 3:
              case "end":
                return _context59.stop();
            }
          }
        }, _callee59, this);
      }));

      function SetAccessCharge(_x57) {
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
     * @return {Promise<string>} - Contract type of the item
     * - space
     * - library
     * - type,
     * - object
     * - wallet
     * - group
     * - other
     */

  }, {
    key: "AccessType",
    value: function () {
      var _AccessType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee60(_ref64) {
        var id;
        return regeneratorRuntime.wrap(function _callee60$(_context60) {
          while (1) {
            switch (_context60.prev = _context60.next) {
              case 0:
                id = _ref64.id;
                _context60.next = 3;
                return this.authClient.AccessType(id);

              case 3:
                return _context60.abrupt("return", _context60.sent);

              case 4:
              case "end":
                return _context60.stop();
            }
          }
        }, _callee60, this);
      }));

      function AccessType(_x58) {
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
      regeneratorRuntime.mark(function _callee61(_ref65) {
        var objectId, args, info;
        return regeneratorRuntime.wrap(function _callee61$(_context61) {
          while (1) {
            switch (_context61.prev = _context61.next) {
              case 0:
                objectId = _ref65.objectId, args = _ref65.args;

                if (!args) {
                  args = [0, // Access level
                  [], // Custom values
                  [] // Stakeholders
                  ];
                }

                _context61.next = 4;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "getAccessInfo",
                  methodArgs: args,
                  signer: this.signer
                });

              case 4:
                info = _context61.sent;
                return _context61.abrupt("return", {
                  visibilityCode: info[0],
                  visible: info[0] >= 1,
                  accessible: info[0] >= 10,
                  editable: info[0] >= 100,
                  hasAccess: info[1] === 0,
                  accessCode: info[1],
                  accessCharge: Utils.WeiToEther(info[2]).toString()
                });

              case 6:
              case "end":
                return _context61.stop();
            }
          }
        }, _callee61, this);
      }));

      function AccessInfo(_x59) {
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
     * TODO: Content space and library access requests are currently disabled for performance reasons
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
      regeneratorRuntime.mark(function _callee62(_ref66) {
        var libraryId, objectId, versionHash, _ref66$args, args, _ref66$update, update, _ref66$noCache, noCache;

        return regeneratorRuntime.wrap(function _callee62$(_context62) {
          while (1) {
            switch (_context62.prev = _context62.next) {
              case 0:
                libraryId = _ref66.libraryId, objectId = _ref66.objectId, versionHash = _ref66.versionHash, _ref66$args = _ref66.args, args = _ref66$args === void 0 ? [] : _ref66$args, _ref66$update = _ref66.update, update = _ref66$update === void 0 ? false : _ref66$update, _ref66$noCache = _ref66.noCache, noCache = _ref66$noCache === void 0 ? false : _ref66$noCache;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context62.next = 4;
                return this.authClient.MakeAccessRequest({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  args: args,
                  update: update,
                  skipCache: true,
                  noCache: noCache
                });

              case 4:
                return _context62.abrupt("return", _context62.sent);

              case 5:
              case "end":
                return _context62.stop();
            }
          }
        }, _callee62, this);
      }));

      function AccessRequest(_x60) {
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
      regeneratorRuntime.mark(function _callee63(_ref67) {
        var libraryId, objectId, versionHash, cacheResult;
        return regeneratorRuntime.wrap(function _callee63$(_context63) {
          while (1) {
            switch (_context63.prev = _context63.next) {
              case 0:
                libraryId = _ref67.libraryId, objectId = _ref67.objectId, versionHash = _ref67.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context63.next = 4;
                return this.authClient.MakeAccessRequest({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  cacheOnly: true
                });

              case 4:
                cacheResult = _context63.sent;

                if (!cacheResult) {
                  _context63.next = 7;
                  break;
                }

                return _context63.abrupt("return", cacheResult.transactionHash);

              case 7:
              case "end":
                return _context63.stop();
            }
          }
        }, _callee63, this);
      }));

      function CachedAccessTransaction(_x61) {
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
      regeneratorRuntime.mark(function _callee64(_ref68) {
        var objectId, versionHash, _ref68$noCache, noCache, audienceData;

        return regeneratorRuntime.wrap(function _callee64$(_context64) {
          while (1) {
            switch (_context64.prev = _context64.next) {
              case 0:
                objectId = _ref68.objectId, versionHash = _ref68.versionHash, _ref68$noCache = _ref68.noCache, noCache = _ref68$noCache === void 0 ? false : _ref68$noCache;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                audienceData = this.AudienceData({
                  versionHash: versionHash
                });
                _context64.next = 5;
                return this.authClient.AuthorizationToken({
                  objectId: objectId,
                  channelAuth: true,
                  audienceData: audienceData,
                  noCache: noCache
                });

              case 5:
                return _context64.abrupt("return", _context64.sent);

              case 6:
              case "end":
                return _context64.stop();
            }
          }
        }, _callee64, this);
      }));

      function GenerateStateChannelToken(_x62) {
        return _GenerateStateChannelToken.apply(this, arguments);
      }

      return GenerateStateChannelToken;
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
      regeneratorRuntime.mark(function _callee65(_ref69) {
        var objectId, _ref69$score, score;

        return regeneratorRuntime.wrap(function _callee65$(_context65) {
          while (1) {
            switch (_context65.prev = _context65.next) {
              case 0:
                objectId = _ref69.objectId, _ref69$score = _ref69.score, score = _ref69$score === void 0 ? 100 : _ref69$score;

                if (!(score < 0 || score > 100)) {
                  _context65.next = 3;
                  break;
                }

                throw Error("Invalid AccessComplete score: " + score);

              case 3:
                _context65.next = 5;
                return this.authClient.AccessComplete({
                  id: objectId,
                  abi: ContentContract.abi,
                  score: score
                });

              case 5:
                return _context65.abrupt("return", _context65.sent);

              case 6:
              case "end":
                return _context65.stop();
            }
          }
        }, _callee65, this);
      }));

      function ContentObjectAccessComplete(_x63) {
        return _ContentObjectAccessComplete.apply(this, arguments);
      }

      return ContentObjectAccessComplete;
    }()
    /* URL Methods */

    /**
     * Determine available DRM types available in this browser environment.
     *
     * @methodGroup URL Generation
     * @return {Promise<Array<string>>}
     */

  }, {
    key: "AvailableDRMs",
    value: function () {
      var _AvailableDRMs = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee66() {
        var availableDRMs, config;
        return regeneratorRuntime.wrap(function _callee66$(_context66) {
          while (1) {
            switch (_context66.prev = _context66.next) {
              case 0:
                availableDRMs = ["aes-128"];

                if (window) {
                  _context66.next = 3;
                  break;
                }

                return _context66.abrupt("return", availableDRMs);

              case 3:
                if (!(typeof window.navigator.requestMediaKeySystemAccess !== "function")) {
                  _context66.next = 5;
                  break;
                }

                return _context66.abrupt("return", availableDRMs);

              case 5:
                _context66.prev = 5;
                config = [{
                  initDataTypes: ["cenc"],
                  audioCapabilities: [{
                    contentType: "audio/mp4;codecs=\"mp4a.40.2\""
                  }],
                  videoCapabilities: [{
                    contentType: "video/mp4;codecs=\"avc1.42E01E\""
                  }]
                }];
                _context66.next = 9;
                return navigator.requestMediaKeySystemAccess("com.widevine.alpha", config);

              case 9:
                availableDRMs.push("widevine"); // eslint-disable-next-line no-empty

                _context66.next = 14;
                break;

              case 12:
                _context66.prev = 12;
                _context66.t0 = _context66["catch"](5);

              case 14:
                return _context66.abrupt("return", availableDRMs);

              case 15:
              case "end":
                return _context66.stop();
            }
          }
        }, _callee66, null, [[5, 12]]);
      }));

      function AvailableDRMs() {
        return _AvailableDRMs.apply(this, arguments);
      }

      return AvailableDRMs;
    }()
  }, {
    key: "AudienceData",
    value: function AudienceData(_ref70) {
      var versionHash = _ref70.versionHash,
          _ref70$protocols = _ref70.protocols,
          protocols = _ref70$protocols === void 0 ? [] : _ref70$protocols,
          _ref70$drms = _ref70.drms,
          drms = _ref70$drms === void 0 ? [] : _ref70$drms;
      var data = {
        user_address: this.utils.FormatAddress(this.signer.address),
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

      return data;
    }
    /**
     * Retrieve playout options for the specified content that satisfy the given protocol and DRM requirements
     *
     * @methodGroup URL Generation
     * @namedParams
     * @param {string} versionHash - Version hash of the content
     * @param {Array<string>} protocols - Acceptable playout protocols
     * @param {Array<string>} drms - Acceptable DRM formats
     */

  }, {
    key: "PlayoutOptions",
    value: function () {
      var _PlayoutOptions = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee67(_ref71) {
        var versionHash, _ref71$protocols, protocols, _ref71$drms, drms, _ref71$hlsjsProfile, hlsjsProfile, objectId, libraryId, path, audienceData, playoutOptions, playoutMap, i, option, protocol, drm, licenseServers, protocolMatch, drmMatch;

        return regeneratorRuntime.wrap(function _callee67$(_context67) {
          while (1) {
            switch (_context67.prev = _context67.next) {
              case 0:
                versionHash = _ref71.versionHash, _ref71$protocols = _ref71.protocols, protocols = _ref71$protocols === void 0 ? ["dash", "hls"] : _ref71$protocols, _ref71$drms = _ref71.drms, drms = _ref71$drms === void 0 ? [] : _ref71$drms, _ref71$hlsjsProfile = _ref71.hlsjsProfile, hlsjsProfile = _ref71$hlsjsProfile === void 0 ? true : _ref71$hlsjsProfile;
                protocols = protocols.map(function (p) {
                  return p.toLowerCase();
                });
                drms = drms.map(function (d) {
                  return d.toLowerCase();
                });
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                _context67.next = 6;
                return this.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 6:
                libraryId = _context67.sent;
                path = UrlJoin("q", versionHash, "rep", "playout", "default", "options.json");
                audienceData = this.AudienceData({
                  versionHash: versionHash,
                  protocols: protocols,
                  drms: drms
                });
                _context67.t0 = Object;
                _context67.t1 = ResponseToJson;
                _context67.t2 = this.HttpClient;
                _context67.next = 14;
                return this.authClient.AuthorizationHeader({
                  objectId: objectId,
                  channelAuth: true,
                  audienceData: audienceData
                });

              case 14:
                _context67.t3 = _context67.sent;
                _context67.t4 = path;
                _context67.t5 = {
                  headers: _context67.t3,
                  method: "GET",
                  path: _context67.t4
                };
                _context67.t6 = _context67.t2.Request.call(_context67.t2, _context67.t5);
                _context67.next = 20;
                return (0, _context67.t1)(_context67.t6);

              case 20:
                _context67.t7 = _context67.sent;
                playoutOptions = _context67.t0.values.call(_context67.t0, _context67.t7);
                playoutMap = {};
                i = 0;

              case 24:
                if (!(i < playoutOptions.length)) {
                  _context67.next = 42;
                  break;
                }

                option = playoutOptions[i];
                protocol = option.properties.protocol;
                drm = option.properties.drm;
                licenseServers = option.properties.license_servers; // Exclude any options that do not satisfy the specified protocols and/or DRMs

                protocolMatch = protocols.includes(protocol);
                drmMatch = drms.includes(drm) || drms.length === 0 && !drm;

                if (!(!protocolMatch || !drmMatch)) {
                  _context67.next = 33;
                  break;
                }

                return _context67.abrupt("continue", 39);

              case 33:
                if (playoutMap[protocol]) {
                  _context67.next = 38;
                  break;
                }

                _context67.next = 36;
                return this.Rep({
                  libraryId: libraryId,
                  versionHash: versionHash,
                  rep: UrlJoin("playout", "default", option.uri),
                  channelAuth: true,
                  queryParams: hlsjsProfile && protocol === "hls" ? {
                    player_profile: "hls-js"
                  } : {}
                });

              case 36:
                _context67.t8 = _context67.sent;
                playoutMap[protocol] = {
                  playoutUrl: _context67.t8
                };

              case 38:
                if (drm) {
                  playoutMap[protocol].drms = _objectSpread({}, playoutMap[protocol].drms || {}, _defineProperty({}, drm, {
                    licenseServers: licenseServers
                  }));
                }

              case 39:
                i++;
                _context67.next = 24;
                break;

              case 42:
                return _context67.abrupt("return", playoutMap);

              case 43:
              case "end":
                return _context67.stop();
            }
          }
        }, _callee67, this);
      }));

      function PlayoutOptions(_x64) {
        return _PlayoutOptions.apply(this, arguments);
      }

      return PlayoutOptions;
    }()
    /**
     * Retrieve playout options in BitMovin player format for the specified content that satisfy
     * the given protocol and DRM requirements
     *
     * @methodGroup URL Generation
     * @namedParams
     * @param {string} versionHash - Version hash of the content
     * @param {Array<string>=} protocols=["dash", "hls"] - Acceptable playout protocols
     * @param {Array<string>=} drms=[] - Acceptable DRM formats
     */

  }, {
    key: "BitmovinPlayoutOptions",
    value: function () {
      var _BitmovinPlayoutOptions = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee68(_ref72) {
        var _this5 = this;

        var versionHash, _ref72$protocols, protocols, _ref72$drms, drms, objectId, playoutOptions, config;

        return regeneratorRuntime.wrap(function _callee68$(_context68) {
          while (1) {
            switch (_context68.prev = _context68.next) {
              case 0:
                versionHash = _ref72.versionHash, _ref72$protocols = _ref72.protocols, protocols = _ref72$protocols === void 0 ? ["dash", "hls"] : _ref72$protocols, _ref72$drms = _ref72.drms, drms = _ref72$drms === void 0 ? [] : _ref72$drms;
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                _context68.next = 4;
                return this.PlayoutOptions({
                  versionHash: versionHash,
                  protocols: protocols,
                  drms: drms,
                  hlsjsProfile: false
                });

              case 4:
                playoutOptions = _context68.sent;
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
                            Authorization: "Bearer ".concat(_this5.authClient.channelContentTokens[objectId])
                          }
                        };
                      }
                    });
                  }
                });
                return _context68.abrupt("return", config);

              case 8:
              case "end":
                return _context68.stop();
            }
          }
        }, _callee68, this);
      }));

      function BitmovinPlayoutOptions(_x65) {
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
      regeneratorRuntime.mark(function _callee69(_ref73) {
        var libraryId, objectId, versionHash, writeToken, method, _ref73$queryParams, queryParams, _ref73$constant, constant, _ref73$format, format, path;

        return regeneratorRuntime.wrap(function _callee69$(_context69) {
          while (1) {
            switch (_context69.prev = _context69.next) {
              case 0:
                libraryId = _ref73.libraryId, objectId = _ref73.objectId, versionHash = _ref73.versionHash, writeToken = _ref73.writeToken, method = _ref73.method, _ref73$queryParams = _ref73.queryParams, queryParams = _ref73$queryParams === void 0 ? {} : _ref73$queryParams, _ref73$constant = _ref73.constant, constant = _ref73$constant === void 0 ? true : _ref73$constant, _ref73$format = _ref73.format, format = _ref73$format === void 0 ? "json" : _ref73$format;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", writeToken || versionHash || objectId, "call", method);
                _context69.t0 = ResponseToFormat;
                _context69.t1 = format;
                _context69.t2 = this.HttpClient;
                _context69.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: !constant
                });

              case 8:
                _context69.t3 = _context69.sent;
                _context69.t4 = constant ? "GET" : "POST";
                _context69.t5 = path;
                _context69.t6 = queryParams;
                _context69.t7 = {
                  headers: _context69.t3,
                  method: _context69.t4,
                  path: _context69.t5,
                  queryParams: _context69.t6
                };
                _context69.next = 15;
                return _context69.t2.Request.call(_context69.t2, _context69.t7);

              case 15:
                _context69.t8 = _context69.sent;
                return _context69.abrupt("return", (0, _context69.t0)(_context69.t1, _context69.t8));

              case 17:
              case "end":
                return _context69.stop();
            }
          }
        }, _callee69, this);
      }));

      function CallBitcodeMethod(_x66) {
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
      regeneratorRuntime.mark(function _callee70(_ref74) {
        var libraryId, objectId, versionHash, rep, _ref74$queryParams, queryParams, _ref74$channelAuth, channelAuth, _ref74$noAuth, noAuth, _ref74$noCache, noCache;

        return regeneratorRuntime.wrap(function _callee70$(_context70) {
          while (1) {
            switch (_context70.prev = _context70.next) {
              case 0:
                libraryId = _ref74.libraryId, objectId = _ref74.objectId, versionHash = _ref74.versionHash, rep = _ref74.rep, _ref74$queryParams = _ref74.queryParams, queryParams = _ref74$queryParams === void 0 ? {} : _ref74$queryParams, _ref74$channelAuth = _ref74.channelAuth, channelAuth = _ref74$channelAuth === void 0 ? false : _ref74$channelAuth, _ref74$noAuth = _ref74.noAuth, noAuth = _ref74$noAuth === void 0 ? false : _ref74$noAuth, _ref74$noCache = _ref74.noCache, noCache = _ref74$noCache === void 0 ? false : _ref74$noCache;
                return _context70.abrupt("return", this.FabricUrl({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  rep: rep,
                  queryParams: queryParams,
                  channelAuth: channelAuth,
                  noAuth: noAuth,
                  noCache: noCache
                }));

              case 2:
              case "end":
                return _context70.stop();
            }
          }
        }, _callee70, this);
      }));

      function Rep(_x67) {
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
      regeneratorRuntime.mark(function _callee71(_ref75) {
        var libraryId, objectId, versionHash, rep, _ref75$queryParams, queryParams;

        return regeneratorRuntime.wrap(function _callee71$(_context71) {
          while (1) {
            switch (_context71.prev = _context71.next) {
              case 0:
                libraryId = _ref75.libraryId, objectId = _ref75.objectId, versionHash = _ref75.versionHash, rep = _ref75.rep, _ref75$queryParams = _ref75.queryParams, queryParams = _ref75$queryParams === void 0 ? {} : _ref75$queryParams;
                return _context71.abrupt("return", this.FabricUrl({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  publicRep: rep,
                  queryParams: queryParams,
                  noAuth: true
                }));

              case 2:
              case "end":
                return _context71.stop();
            }
          }
        }, _callee71, this);
      }));

      function PublicRep(_x68) {
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
      regeneratorRuntime.mark(function _callee72(_ref76) {
        var libraryId, objectId, versionHash, partHash, rep, publicRep, call, _ref76$queryParams, queryParams, _ref76$channelAuth, channelAuth, _ref76$noAuth, noAuth, _ref76$noCache, noCache, path;

        return regeneratorRuntime.wrap(function _callee72$(_context72) {
          while (1) {
            switch (_context72.prev = _context72.next) {
              case 0:
                libraryId = _ref76.libraryId, objectId = _ref76.objectId, versionHash = _ref76.versionHash, partHash = _ref76.partHash, rep = _ref76.rep, publicRep = _ref76.publicRep, call = _ref76.call, _ref76$queryParams = _ref76.queryParams, queryParams = _ref76$queryParams === void 0 ? {} : _ref76$queryParams, _ref76$channelAuth = _ref76.channelAuth, channelAuth = _ref76$channelAuth === void 0 ? false : _ref76$channelAuth, _ref76$noAuth = _ref76.noAuth, noAuth = _ref76$noAuth === void 0 ? false : _ref76$noAuth, _ref76$noCache = _ref76.noCache, noCache = _ref76$noCache === void 0 ? false : _ref76$noCache;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                } // Clone queryParams to avoid modification of the original


                queryParams = _objectSpread({}, queryParams);
                _context72.next = 5;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  channelAuth: channelAuth,
                  noAuth: noAuth,
                  noCache: noCache
                });

              case 5:
                queryParams.authorization = _context72.sent;
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

                return _context72.abrupt("return", this.HttpClient.URL({
                  path: path,
                  queryParams: queryParams
                }));

              case 10:
              case "end":
                return _context72.stop();
            }
          }
        }, _callee72, this);
      }));

      function FabricUrl(_x69) {
        return _FabricUrl.apply(this, arguments);
      }

      return FabricUrl;
    }()
    /**
     * Generate a URL to the specified content object file with appropriate authorization token.
     *
     * @methodGroup URL Generation
     * @namedParams
     * @param {string=} libraryId - ID of an library - Required if versionHash not specified
     * @param {string=} objectId - ID of an object
     * @param {string=} versionHash - Hash of an object version - Required if libraryId is not specified
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
      regeneratorRuntime.mark(function _callee73(_ref77) {
        var libraryId, objectId, versionHash, filePath, _ref77$queryParams, queryParams, _ref77$noCache, noCache, path, authorizationToken;

        return regeneratorRuntime.wrap(function _callee73$(_context73) {
          while (1) {
            switch (_context73.prev = _context73.next) {
              case 0:
                libraryId = _ref77.libraryId, objectId = _ref77.objectId, versionHash = _ref77.versionHash, filePath = _ref77.filePath, _ref77$queryParams = _ref77.queryParams, queryParams = _ref77$queryParams === void 0 ? {} : _ref77$queryParams, _ref77$noCache = _ref77.noCache, noCache = _ref77$noCache === void 0 ? false : _ref77$noCache;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                if (libraryId) {
                  path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, "files", filePath);
                } else {
                  path = UrlJoin("q", versionHash, "files", filePath);
                }

                _context73.next = 5;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  noCache: noCache
                });

              case 5:
                authorizationToken = _context73.sent;
                return _context73.abrupt("return", this.HttpClient.URL({
                  path: path,
                  queryParams: _objectSpread({}, queryParams, {
                    authorization: authorizationToken
                  })
                }));

              case 7:
              case "end":
                return _context73.stop();
            }
          }
        }, _callee73, this);
      }));

      function FileUrl(_x70) {
        return _FileUrl.apply(this, arguments);
      }

      return FileUrl;
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
     * @param {object=} meta - Metadata for the access group
     *
     * @returns {Promise<string>} - Contract address of created access group
     */

  }, {
    key: "CreateAccessGroup",
    value: function () {
      var _CreateAccessGroup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee74(_ref78) {
        var name, _ref78$metadata, metadata, _ref79, contractAddress, objectId, editResponse;

        return regeneratorRuntime.wrap(function _callee74$(_context74) {
          while (1) {
            switch (_context74.prev = _context74.next) {
              case 0:
                name = _ref78.name, _ref78$metadata = _ref78.metadata, metadata = _ref78$metadata === void 0 ? {} : _ref78$metadata;
                _context74.next = 3;
                return this.authClient.CreateAccessGroup();

              case 3:
                _ref79 = _context74.sent;
                contractAddress = _ref79.contractAddress;
                objectId = this.utils.AddressToObjectId(contractAddress);
                _context74.next = 8;
                return this.EditContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId
                });

              case 8:
                editResponse = _context74.sent;
                _context74.next = 11;
                return this.ReplaceMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  metadata: _objectSpread({
                    name: name
                  }, metadata)
                });

              case 11:
                _context74.next = 13;
                return this.FinalizeContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token
                });

              case 13:
                return _context74.abrupt("return", contractAddress);

              case 14:
              case "end":
                return _context74.stop();
            }
          }
        }, _callee74, this);
      }));

      function CreateAccessGroup(_x71) {
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
      regeneratorRuntime.mark(function _callee75(_ref80) {
        var contractAddress;
        return regeneratorRuntime.wrap(function _callee75$(_context75) {
          while (1) {
            switch (_context75.prev = _context75.next) {
              case 0:
                contractAddress = _ref80.contractAddress;
                _context75.next = 3;
                return this.ethClient.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 3:
                return _context75.abrupt("return", _context75.sent);

              case 4:
              case "end":
                return _context75.stop();
            }
          }
        }, _callee75, this);
      }));

      function AccessGroupOwner(_x72) {
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
      regeneratorRuntime.mark(function _callee76(_ref81) {
        var contractAddress;
        return regeneratorRuntime.wrap(function _callee76$(_context76) {
          while (1) {
            switch (_context76.prev = _context76.next) {
              case 0:
                contractAddress = _ref81.contractAddress;
                _context76.next = 3;
                return this.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "kill",
                  methodArgs: []
                });

              case 3:
              case "end":
                return _context76.stop();
            }
          }
        }, _callee76, this);
      }));

      function DeleteAccessGroup(_x73) {
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
      regeneratorRuntime.mark(function _callee78(_ref82) {
        var _this6 = this;

        var contractAddress, length;
        return regeneratorRuntime.wrap(function _callee78$(_context78) {
          while (1) {
            switch (_context78.prev = _context78.next) {
              case 0:
                contractAddress = _ref82.contractAddress;
                _context78.next = 3;
                return this.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "membersNum"
                });

              case 3:
                length = _context78.sent.toNumber();
                _context78.next = 6;
                return Promise.all(_toConsumableArray(Array(length)).map(
                /*#__PURE__*/
                function () {
                  var _ref83 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee77(_, i) {
                    return regeneratorRuntime.wrap(function _callee77$(_context77) {
                      while (1) {
                        switch (_context77.prev = _context77.next) {
                          case 0:
                            _context77.t0 = _this6.utils;
                            _context77.next = 3;
                            return _this6.CallContractMethod({
                              contractAddress: contractAddress,
                              abi: AccessGroupContract.abi,
                              methodName: "membersList",
                              methodArgs: [i]
                            });

                          case 3:
                            _context77.t1 = _context77.sent;
                            return _context77.abrupt("return", _context77.t0.FormatAddress.call(_context77.t0, _context77.t1));

                          case 5:
                          case "end":
                            return _context77.stop();
                        }
                      }
                    }, _callee77);
                  }));

                  return function (_x75, _x76) {
                    return _ref83.apply(this, arguments);
                  };
                }()));

              case 6:
                return _context78.abrupt("return", _context78.sent);

              case 7:
              case "end":
                return _context78.stop();
            }
          }
        }, _callee78, this);
      }));

      function AccessGroupMembers(_x74) {
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
      regeneratorRuntime.mark(function _callee80(_ref84) {
        var _this7 = this;

        var contractAddress, length;
        return regeneratorRuntime.wrap(function _callee80$(_context80) {
          while (1) {
            switch (_context80.prev = _context80.next) {
              case 0:
                contractAddress = _ref84.contractAddress;
                _context80.next = 3;
                return this.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "managersNum"
                });

              case 3:
                length = _context80.sent.toNumber();
                _context80.next = 6;
                return Promise.all(_toConsumableArray(Array(length)).map(
                /*#__PURE__*/
                function () {
                  var _ref85 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee79(_, i) {
                    return regeneratorRuntime.wrap(function _callee79$(_context79) {
                      while (1) {
                        switch (_context79.prev = _context79.next) {
                          case 0:
                            _context79.t0 = _this7.utils;
                            _context79.next = 3;
                            return _this7.CallContractMethod({
                              contractAddress: contractAddress,
                              abi: AccessGroupContract.abi,
                              methodName: "managersList",
                              methodArgs: [i]
                            });

                          case 3:
                            _context79.t1 = _context79.sent;
                            return _context79.abrupt("return", _context79.t0.FormatAddress.call(_context79.t0, _context79.t1));

                          case 5:
                          case "end":
                            return _context79.stop();
                        }
                      }
                    }, _callee79);
                  }));

                  return function (_x78, _x79) {
                    return _ref85.apply(this, arguments);
                  };
                }()));

              case 6:
                return _context80.abrupt("return", _context80.sent);

              case 7:
              case "end":
                return _context80.stop();
            }
          }
        }, _callee80, this);
      }));

      function AccessGroupManagers(_x77) {
        return _AccessGroupManagers.apply(this, arguments);
      }

      return AccessGroupManagers;
    }()
  }, {
    key: "AccessGroupMembershipMethod",
    value: function () {
      var _AccessGroupMembershipMethod = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee81(_ref86) {
        var contractAddress, memberAddress, methodName, eventName, isManager, event, candidate;
        return regeneratorRuntime.wrap(function _callee81$(_context81) {
          while (1) {
            switch (_context81.prev = _context81.next) {
              case 0:
                contractAddress = _ref86.contractAddress, memberAddress = _ref86.memberAddress, methodName = _ref86.methodName, eventName = _ref86.eventName;

                if (this.utils.EqualAddress(this.signer.address, memberAddress)) {
                  _context81.next = 7;
                  break;
                }

                _context81.next = 4;
                return this.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "hasManagerAccess",
                  methodArgs: [this.utils.FormatAddress(this.signer.address)]
                });

              case 4:
                isManager = _context81.sent;

                if (isManager) {
                  _context81.next = 7;
                  break;
                }

                throw Error("Manager access required");

              case 7:
                _context81.next = 9;
                return this.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: methodName,
                  methodArgs: [this.utils.FormatAddress(memberAddress)],
                  eventName: eventName,
                  eventValue: "candidate"
                });

              case 9:
                event = _context81.sent;
                candidate = this.ExtractValueFromEvent({
                  abi: AccessGroupContract.abi,
                  event: event,
                  eventName: eventName,
                  eventValue: "candidate"
                });

                if (!(this.utils.FormatAddress(candidate) !== this.utils.FormatAddress(memberAddress))) {
                  _context81.next = 14;
                  break;
                }

                // eslint-disable-next-line no-console
                console.error("Mismatch: " + candidate + " :: " + memberAddress);
                throw Error("Access group method " + methodName + " failed");

              case 14:
                return _context81.abrupt("return", event.transactionHash);

              case 15:
              case "end":
                return _context81.stop();
            }
          }
        }, _callee81, this);
      }));

      function AccessGroupMembershipMethod(_x80) {
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
      regeneratorRuntime.mark(function _callee82(_ref87) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee82$(_context82) {
          while (1) {
            switch (_context82.prev = _context82.next) {
              case 0:
                contractAddress = _ref87.contractAddress, memberAddress = _ref87.memberAddress;
                _context82.next = 3;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "grantAccess",
                  eventName: "MemberAdded"
                });

              case 3:
                return _context82.abrupt("return", _context82.sent);

              case 4:
              case "end":
                return _context82.stop();
            }
          }
        }, _callee82, this);
      }));

      function AddAccessGroupMember(_x81) {
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
      regeneratorRuntime.mark(function _callee83(_ref88) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee83$(_context83) {
          while (1) {
            switch (_context83.prev = _context83.next) {
              case 0:
                contractAddress = _ref88.contractAddress, memberAddress = _ref88.memberAddress;
                _context83.next = 3;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "revokeAccess",
                  eventName: "MemberRevoked"
                });

              case 3:
                return _context83.abrupt("return", _context83.sent);

              case 4:
              case "end":
                return _context83.stop();
            }
          }
        }, _callee83, this);
      }));

      function RemoveAccessGroupMember(_x82) {
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
      regeneratorRuntime.mark(function _callee84(_ref89) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee84$(_context84) {
          while (1) {
            switch (_context84.prev = _context84.next) {
              case 0:
                contractAddress = _ref89.contractAddress, memberAddress = _ref89.memberAddress;
                _context84.next = 3;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "grantManagerAccess",
                  eventName: "ManagerAccessGranted"
                });

              case 3:
                return _context84.abrupt("return", _context84.sent);

              case 4:
              case "end":
                return _context84.stop();
            }
          }
        }, _callee84, this);
      }));

      function AddAccessGroupManager(_x83) {
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
      regeneratorRuntime.mark(function _callee85(_ref90) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee85$(_context85) {
          while (1) {
            switch (_context85.prev = _context85.next) {
              case 0:
                contractAddress = _ref90.contractAddress, memberAddress = _ref90.memberAddress;
                _context85.next = 3;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "revokeManagerAccess",
                  eventName: "ManagerAccessRevoked"
                });

              case 3:
                return _context85.abrupt("return", _context85.sent);

              case 4:
              case "end":
                return _context85.stop();
            }
          }
        }, _callee85, this);
      }));

      function RemoveAccessGroupManager(_x84) {
        return _RemoveAccessGroupManager.apply(this, arguments);
      }

      return RemoveAccessGroupManager;
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
      regeneratorRuntime.mark(function _callee86(_ref91) {
        var collectionType, validCollectionTypes, walletAddress;
        return regeneratorRuntime.wrap(function _callee86$(_context86) {
          while (1) {
            switch (_context86.prev = _context86.next) {
              case 0:
                collectionType = _ref91.collectionType;
                validCollectionTypes = ["accessGroups", "contentObjects", "contentTypes", "contracts", "libraries"];

                if (validCollectionTypes.includes(collectionType)) {
                  _context86.next = 4;
                  break;
                }

                throw new Error("Invalid collection type: " + collectionType);

              case 4:
                if (!this.signer) {
                  _context86.next = 10;
                  break;
                }

                _context86.next = 7;
                return this.userProfileClient.WalletAddress();

              case 7:
                _context86.t0 = _context86.sent;
                _context86.next = 11;
                break;

              case 10:
                _context86.t0 = undefined;

              case 11:
                walletAddress = _context86.t0;

                if (walletAddress) {
                  _context86.next = 14;
                  break;
                }

                throw new Error("Unable to get collection: User wallet doesn't exist");

              case 14:
                _context86.next = 16;
                return this.ethClient.MakeProviderCall({
                  methodName: "send",
                  args: ["elv_getWalletCollection", [this.contentSpaceId, "iusr".concat(this.utils.AddressToHash(this.signer.address)), collectionType]]
                });

              case 16:
                return _context86.abrupt("return", _context86.sent);

              case 17:
              case "end":
                return _context86.stop();
            }
          }
        }, _callee86, this);
      }));

      function Collection(_x85) {
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
      regeneratorRuntime.mark(function _callee87(_ref92) {
        var libraryId, objectId, versionHash;
        return regeneratorRuntime.wrap(function _callee87$(_context87) {
          while (1) {
            switch (_context87.prev = _context87.next) {
              case 0:
                libraryId = _ref92.libraryId, objectId = _ref92.objectId, versionHash = _ref92.versionHash;
                _context87.next = 3;
                return ContentObjectVerification.VerifyContentObject({
                  client: this,
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 3:
                return _context87.abrupt("return", _context87.sent);

              case 4:
              case "end":
                return _context87.stop();
            }
          }
        }, _callee87, this);
      }));

      function VerifyContentObject(_x86) {
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
      regeneratorRuntime.mark(function _callee88(_ref93) {
        var libraryId, objectId, versionHash, partHash, path;
        return regeneratorRuntime.wrap(function _callee88$(_context88) {
          while (1) {
            switch (_context88.prev = _context88.next) {
              case 0:
                libraryId = _ref93.libraryId, objectId = _ref93.objectId, versionHash = _ref93.versionHash, partHash = _ref93.partHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "data", partHash, "proofs");
                _context88.t0 = ResponseToJson;
                _context88.t1 = this.HttpClient;
                _context88.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 7:
                _context88.t2 = _context88.sent;
                _context88.t3 = path;
                _context88.t4 = {
                  headers: _context88.t2,
                  method: "GET",
                  path: _context88.t3
                };
                _context88.t5 = _context88.t1.Request.call(_context88.t1, _context88.t4);
                return _context88.abrupt("return", (0, _context88.t0)(_context88.t5));

              case 12:
              case "end":
                return _context88.stop();
            }
          }
        }, _callee88, this);
      }));

      function Proofs(_x87) {
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
      regeneratorRuntime.mark(function _callee89(_ref94) {
        var libraryId, objectId, partHash, _ref94$format, format, path;

        return regeneratorRuntime.wrap(function _callee89$(_context89) {
          while (1) {
            switch (_context89.prev = _context89.next) {
              case 0:
                libraryId = _ref94.libraryId, objectId = _ref94.objectId, partHash = _ref94.partHash, _ref94$format = _ref94.format, format = _ref94$format === void 0 ? "blob" : _ref94$format;
                path = UrlJoin("qparts", partHash);
                _context89.t0 = ResponseToFormat;
                _context89.t1 = format;
                _context89.t2 = this.HttpClient;
                _context89.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  partHash: partHash
                });

              case 7:
                _context89.t3 = _context89.sent;
                _context89.t4 = path;
                _context89.t5 = {
                  headers: _context89.t3,
                  method: "GET",
                  path: _context89.t4
                };
                _context89.t6 = _context89.t2.Request.call(_context89.t2, _context89.t5);
                return _context89.abrupt("return", (0, _context89.t0)(_context89.t1, _context89.t6));

              case 12:
              case "end":
                return _context89.stop();
            }
          }
        }, _callee89, this);
      }));

      function QParts(_x88) {
        return _QParts.apply(this, arguments);
      }

      return QParts;
    }()
    /* Contracts */

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
    value: function FormatContractArguments(_ref95) {
      var abi = _ref95.abi,
          methodName = _ref95.methodName,
          args = _ref95.args;
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
      regeneratorRuntime.mark(function _callee90(_ref96) {
        var abi, bytecode, constructorArgs, _ref96$overrides, overrides;

        return regeneratorRuntime.wrap(function _callee90$(_context90) {
          while (1) {
            switch (_context90.prev = _context90.next) {
              case 0:
                abi = _ref96.abi, bytecode = _ref96.bytecode, constructorArgs = _ref96.constructorArgs, _ref96$overrides = _ref96.overrides, overrides = _ref96$overrides === void 0 ? {} : _ref96$overrides;
                _context90.next = 3;
                return this.ethClient.DeployContract({
                  abi: abi,
                  bytecode: bytecode,
                  constructorArgs: constructorArgs,
                  overrides: overrides,
                  signer: this.signer
                });

              case 3:
                return _context90.abrupt("return", _context90.sent);

              case 4:
              case "end":
                return _context90.stop();
            }
          }
        }, _callee90, this);
      }));

      function DeployContract(_x89) {
        return _DeployContract.apply(this, arguments);
      }

      return DeployContract;
    }()
    /**
     * Call the specified method on a deployed contract. This action will be performed by this client's signer.
     *
     * NOTE: This method will only wait for the transaction to be created. If you want to wait for the transaction
     * to be mined, use the CallContractMethodAndWait method.
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
      regeneratorRuntime.mark(function _callee91(_ref97) {
        var contractAddress, abi, methodName, _ref97$methodArgs, methodArgs, value, _ref97$overrides, overrides, _ref97$formatArgument, formatArguments, _ref97$cacheContract, cacheContract;

        return regeneratorRuntime.wrap(function _callee91$(_context91) {
          while (1) {
            switch (_context91.prev = _context91.next) {
              case 0:
                contractAddress = _ref97.contractAddress, abi = _ref97.abi, methodName = _ref97.methodName, _ref97$methodArgs = _ref97.methodArgs, methodArgs = _ref97$methodArgs === void 0 ? [] : _ref97$methodArgs, value = _ref97.value, _ref97$overrides = _ref97.overrides, overrides = _ref97$overrides === void 0 ? {} : _ref97$overrides, _ref97$formatArgument = _ref97.formatArguments, formatArguments = _ref97$formatArgument === void 0 ? true : _ref97$formatArgument, _ref97$cacheContract = _ref97.cacheContract, cacheContract = _ref97$cacheContract === void 0 ? true : _ref97$cacheContract;
                _context91.next = 3;
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

              case 3:
                return _context91.abrupt("return", _context91.sent);

              case 4:
              case "end":
                return _context91.stop();
            }
          }
        }, _callee91, this);
      }));

      function CallContractMethod(_x90) {
        return _CallContractMethod.apply(this, arguments);
      }

      return CallContractMethod;
    }()
    /**
     * Call the specified method on a deployed contract and wait for the transaction to be mined.
     * This action will be performed by this client's signer.
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
     * @returns {Promise<*>} - The event object of this transaction
     */

  }, {
    key: "CallContractMethodAndWait",
    value: function () {
      var _CallContractMethodAndWait = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee92(_ref98) {
        var contractAddress, abi, methodName, methodArgs, value, _ref98$overrides, overrides, _ref98$formatArgument, formatArguments;

        return regeneratorRuntime.wrap(function _callee92$(_context92) {
          while (1) {
            switch (_context92.prev = _context92.next) {
              case 0:
                contractAddress = _ref98.contractAddress, abi = _ref98.abi, methodName = _ref98.methodName, methodArgs = _ref98.methodArgs, value = _ref98.value, _ref98$overrides = _ref98.overrides, overrides = _ref98$overrides === void 0 ? {} : _ref98$overrides, _ref98$formatArgument = _ref98.formatArguments, formatArguments = _ref98$formatArgument === void 0 ? true : _ref98$formatArgument;
                _context92.next = 3;
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

              case 3:
                return _context92.abrupt("return", _context92.sent);

              case 4:
              case "end":
                return _context92.stop();
            }
          }
        }, _callee92, this);
      }));

      function CallContractMethodAndWait(_x91) {
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
    value: function ExtractEventFromLogs(_ref99) {
      var abi = _ref99.abi,
          event = _ref99.event,
          eventName = _ref99.eventName;
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
    value: function ExtractValueFromEvent(_ref100) {
      var abi = _ref100.abi,
          event = _ref100.event,
          eventName = _ref100.eventName,
          eventValue = _ref100.eventValue;
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
      regeneratorRuntime.mark(function _callee93(_ref101) {
        var libraryId, objectId, customContractAddress, name, description, abi, factoryAbi, _ref101$overrides, overrides, setResult, writeToken;

        return regeneratorRuntime.wrap(function _callee93$(_context93) {
          while (1) {
            switch (_context93.prev = _context93.next) {
              case 0:
                libraryId = _ref101.libraryId, objectId = _ref101.objectId, customContractAddress = _ref101.customContractAddress, name = _ref101.name, description = _ref101.description, abi = _ref101.abi, factoryAbi = _ref101.factoryAbi, _ref101$overrides = _ref101.overrides, overrides = _ref101$overrides === void 0 ? {} : _ref101$overrides;
                customContractAddress = this.utils.FormatAddress(customContractAddress);
                _context93.next = 4;
                return this.ethClient.SetCustomContentContract({
                  contentContractAddress: Utils.HashToAddress(objectId),
                  customContractAddress: customContractAddress,
                  overrides: overrides,
                  signer: this.signer
                });

              case 4:
                setResult = _context93.sent;
                _context93.next = 7;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 7:
                writeToken = _context93.sent.write_token;
                _context93.next = 10;
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

              case 10:
                _context93.next = 12;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken
                });

              case 12:
                return _context93.abrupt("return", setResult);

              case 13:
              case "end":
                return _context93.stop();
            }
          }
        }, _callee93, this);
      }));

      function SetCustomContentContract(_x92) {
        return _SetCustomContentContract.apply(this, arguments);
      }

      return SetCustomContentContract;
    }()
    /**
     * Get the custom contract of the specified object
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     *
     * @returns {Promise<string> | undefined} - If the object has a custom contract, this will return the address of the custom contract
     */

  }, {
    key: "CustomContractAddress",
    value: function () {
      var _CustomContractAddress = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee94(_ref102) {
        var libraryId, objectId, customContractAddress;
        return regeneratorRuntime.wrap(function _callee94$(_context94) {
          while (1) {
            switch (_context94.prev = _context94.next) {
              case 0:
                libraryId = _ref102.libraryId, objectId = _ref102.objectId;

                if (!(libraryId === this.contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId))) {
                  _context94.next = 3;
                  break;
                }

                return _context94.abrupt("return");

              case 3:
                _context94.next = 5;
                return this.ethClient.CallContractMethod({
                  contractAddress: this.utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "contentContractAddress",
                  methodArgs: [],
                  signer: this.signer
                });

              case 5:
                customContractAddress = _context94.sent;

                if (!(customContractAddress === this.utils.nullAddress)) {
                  _context94.next = 8;
                  break;
                }

                return _context94.abrupt("return");

              case 8:
                return _context94.abrupt("return", this.utils.FormatAddress(customContractAddress));

              case 9:
              case "end":
                return _context94.stop();
            }
          }
        }, _callee94, this);
      }));

      function CustomContractAddress(_x93) {
        return _CustomContractAddress.apply(this, arguments);
      }

      return CustomContractAddress;
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
     * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
     * Note: This requires one extra network call per block, so it should not be used for very large ranges
     * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
     */

  }, {
    key: "ContractEvents",
    value: function () {
      var _ContractEvents = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee95(_ref103) {
        var contractAddress, abi, _ref103$fromBlock, fromBlock, toBlock, _ref103$includeTransa, includeTransaction;

        return regeneratorRuntime.wrap(function _callee95$(_context95) {
          while (1) {
            switch (_context95.prev = _context95.next) {
              case 0:
                contractAddress = _ref103.contractAddress, abi = _ref103.abi, _ref103$fromBlock = _ref103.fromBlock, fromBlock = _ref103$fromBlock === void 0 ? 0 : _ref103$fromBlock, toBlock = _ref103.toBlock, _ref103$includeTransa = _ref103.includeTransaction, includeTransaction = _ref103$includeTransa === void 0 ? false : _ref103$includeTransa;
                _context95.next = 3;
                return this.ethClient.ContractEvents({
                  contractAddress: contractAddress,
                  abi: abi,
                  fromBlock: fromBlock,
                  toBlock: toBlock,
                  includeTransaction: includeTransaction
                });

              case 3:
                return _context95.abrupt("return", _context95.sent);

              case 4:
              case "end":
                return _context95.stop();
            }
          }
        }, _callee95, this);
      }));

      function ContractEvents(_x94) {
        return _ContractEvents.apply(this, arguments);
      }

      return ContractEvents;
    }() // TODO: Not implemented in contracts

  }, {
    key: "WithdrawContractFunds",
    value: function () {
      var _WithdrawContractFunds = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee96(_ref104) {
        var contractAddress, abi, ether;
        return regeneratorRuntime.wrap(function _callee96$(_context96) {
          while (1) {
            switch (_context96.prev = _context96.next) {
              case 0:
                contractAddress = _ref104.contractAddress, abi = _ref104.abi, ether = _ref104.ether;
                _context96.next = 3;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: "transfer",
                  methodArgs: [this.signer.address, Ethers.utils.parseEther(ether.toString())],
                  signer: this.signer
                });

              case 3:
                return _context96.abrupt("return", _context96.sent);

              case 4:
              case "end":
                return _context96.stop();
            }
          }
        }, _callee96, this);
      }));

      function WithdrawContractFunds(_x95) {
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
     * @param {number=} count=10 - Max number of events to include (unless both toBlock and fromBlock are unspecified)
     * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
     * Note: This requires two extra network calls per transaction, so it should not be used for very large ranges
     * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
     */

  }, {
    key: "Events",
    value: function () {
      var _Events = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee97() {
        var _ref105,
            toBlock,
            fromBlock,
            _ref105$count,
            count,
            _ref105$includeTransa,
            includeTransaction,
            latestBlock,
            _args97 = arguments;

        return regeneratorRuntime.wrap(function _callee97$(_context97) {
          while (1) {
            switch (_context97.prev = _context97.next) {
              case 0:
                _ref105 = _args97.length > 0 && _args97[0] !== undefined ? _args97[0] : {}, toBlock = _ref105.toBlock, fromBlock = _ref105.fromBlock, _ref105$count = _ref105.count, count = _ref105$count === void 0 ? 10 : _ref105$count, _ref105$includeTransa = _ref105.includeTransaction, includeTransaction = _ref105$includeTransa === void 0 ? false : _ref105$includeTransa;
                _context97.next = 3;
                return this.BlockNumber();

              case 3:
                latestBlock = _context97.sent;

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

                if (!(fromBlock > toBlock)) {
                  _context97.next = 9;
                  break;
                }

                return _context97.abrupt("return", []);

              case 9:
                _context97.next = 11;
                return this.ethClient.Events({
                  toBlock: toBlock,
                  fromBlock: fromBlock,
                  includeTransaction: includeTransaction
                });

              case 11:
                return _context97.abrupt("return", _context97.sent);

              case 12:
              case "end":
                return _context97.stop();
            }
          }
        }, _callee97, this);
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
      regeneratorRuntime.mark(function _callee98() {
        return regeneratorRuntime.wrap(function _callee98$(_context98) {
          while (1) {
            switch (_context98.prev = _context98.next) {
              case 0:
                _context98.next = 2;
                return this.ethClient.MakeProviderCall({
                  methodName: "getBlockNumber"
                });

              case 2:
                return _context98.abrupt("return", _context98.sent);

              case 3:
              case "end":
                return _context98.stop();
            }
          }
        }, _callee98, this);
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
      regeneratorRuntime.mark(function _callee99(_ref106) {
        var address, balance;
        return regeneratorRuntime.wrap(function _callee99$(_context99) {
          while (1) {
            switch (_context99.prev = _context99.next) {
              case 0:
                address = _ref106.address;
                _context99.next = 3;
                return this.ethClient.MakeProviderCall({
                  methodName: "getBalance",
                  args: [address]
                });

              case 3:
                balance = _context99.sent;
                _context99.next = 6;
                return Ethers.utils.formatEther(balance);

              case 6:
                return _context99.abrupt("return", _context99.sent);

              case 7:
              case "end":
                return _context99.stop();
            }
          }
        }, _callee99, this);
      }));

      function GetBalance(_x96) {
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
      regeneratorRuntime.mark(function _callee100(_ref107) {
        var recipient, ether, transaction;
        return regeneratorRuntime.wrap(function _callee100$(_context100) {
          while (1) {
            switch (_context100.prev = _context100.next) {
              case 0:
                recipient = _ref107.recipient, ether = _ref107.ether;
                _context100.next = 3;
                return this.signer.sendTransaction({
                  to: recipient,
                  value: Ethers.utils.parseEther(ether.toString())
                });

              case 3:
                transaction = _context100.sent;
                _context100.next = 6;
                return transaction.wait();

              case 6:
                return _context100.abrupt("return", _context100.sent);

              case 7:
              case "end":
                return _context100.stop();
            }
          }
        }, _callee100, this);
      }));

      function SendFunds(_x97) {
        return _SendFunds.apply(this, arguments);
      }

      return SendFunds;
    }()
    /* FrameClient related */
    // Whitelist of methods allowed to be called using the frame API

  }, {
    key: "FrameAllowedMethods",
    value: function FrameAllowedMethods() {
      var forbiddenMethods = ["constructor", "AccessGroupMembershipMethod", "CallFromFrameMessage", "ClearSigner", "FrameAllowedMethods", "FromConfigurationUrl", "GenerateWallet", "InitializeClients", "SetSigner", "SetSignerFromWeb3Provider"];
      return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (method) {
        return !forbiddenMethods.includes(method);
      });
    } // Call a method specified in a message from a frame

  }, {
    key: "CallFromFrameMessage",
    value: function () {
      var _CallFromFrameMessage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee101(message, Respond) {
        var _this8 = this;

        var callback, method, methodResults, responseError;
        return regeneratorRuntime.wrap(function _callee101$(_context101) {
          while (1) {
            switch (_context101.prev = _context101.next) {
              case 0:
                if (!(message.type !== "ElvFrameRequest")) {
                  _context101.next = 2;
                  break;
                }

                return _context101.abrupt("return");

              case 2:
                if (message.callbackId) {
                  callback = function callback(result) {
                    Respond(_this8.utils.MakeClonable({
                      type: "ElvFrameResponse",
                      requestId: message.callbackId,
                      response: result
                    }));
                  };

                  message.args.callback = callback;
                }

                _context101.prev = 3;
                method = message.calledMethod;

                if (!(message.module === "userProfileClient")) {
                  _context101.next = 13;
                  break;
                }

                if (this.userProfileClient.FrameAllowedMethods().includes(method)) {
                  _context101.next = 8;
                  break;
                }

                throw Error("Invalid user profile method: " + method);

              case 8:
                _context101.next = 10;
                return this.userProfileClient[method](message.args);

              case 10:
                methodResults = _context101.sent;
                _context101.next = 18;
                break;

              case 13:
                if (this.FrameAllowedMethods().includes(method)) {
                  _context101.next = 15;
                  break;
                }

                throw Error("Invalid method: " + method);

              case 15:
                _context101.next = 17;
                return this[method](message.args);

              case 17:
                methodResults = _context101.sent;

              case 18:
                Respond(this.utils.MakeClonable({
                  type: "ElvFrameResponse",
                  requestId: message.requestId,
                  response: methodResults
                }));
                _context101.next = 26;
                break;

              case 21:
                _context101.prev = 21;
                _context101.t0 = _context101["catch"](3);
                // eslint-disable-next-line no-console
                console.error(_context101.t0);
                responseError = _context101.t0 instanceof Error ? _context101.t0.message : _context101.t0;
                Respond(this.utils.MakeClonable({
                  type: "ElvFrameResponse",
                  requestId: message.requestId,
                  error: responseError
                }));

              case 26:
              case "end":
                return _context101.stop();
            }
          }
        }, _callee101, this, [[3, 21]]);
      }));

      function CallFromFrameMessage(_x98, _x99) {
        return _CallFromFrameMessage.apply(this, arguments);
      }

      return CallFromFrameMessage;
    }()
  }], [{
    key: "Configuration",
    value: function () {
      var _Configuration = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee102(_ref108) {
        var configUrl, region, httpClient, fabricInfo, filterHTTPS, fabricURIs, ethereumURIs;
        return regeneratorRuntime.wrap(function _callee102$(_context102) {
          while (1) {
            switch (_context102.prev = _context102.next) {
              case 0:
                configUrl = _ref108.configUrl, region = _ref108.region;
                httpClient = new HttpClient([configUrl]);
                _context102.next = 4;
                return ResponseToJson(httpClient.Request({
                  method: "GET",
                  path: "/config",
                  queryParams: region ? {
                    elvgeo: region
                  } : ""
                }));

              case 4:
                fabricInfo = _context102.sent;

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

                return _context102.abrupt("return", {
                  contentSpaceId: fabricInfo.qspace.id,
                  fabricURIs: fabricURIs,
                  ethereumURIs: ethereumURIs
                });

              case 11:
              case "end":
                return _context102.stop();
            }
          }
        }, _callee102);
      }));

      function Configuration(_x100) {
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
      regeneratorRuntime.mark(function _callee103(_ref109) {
        var configUrl, region, _ref109$noCache, noCache, _ref109$noAuth, noAuth, _ref110, contentSpaceId, fabricURIs, ethereumURIs, client;

        return regeneratorRuntime.wrap(function _callee103$(_context103) {
          while (1) {
            switch (_context103.prev = _context103.next) {
              case 0:
                configUrl = _ref109.configUrl, region = _ref109.region, _ref109$noCache = _ref109.noCache, noCache = _ref109$noCache === void 0 ? false : _ref109$noCache, _ref109$noAuth = _ref109.noAuth, noAuth = _ref109$noAuth === void 0 ? false : _ref109$noAuth;
                _context103.next = 3;
                return ElvClient.Configuration({
                  configUrl: configUrl,
                  region: region
                });

              case 3:
                _ref110 = _context103.sent;
                contentSpaceId = _ref110.contentSpaceId;
                fabricURIs = _ref110.fabricURIs;
                ethereumURIs = _ref110.ethereumURIs;
                this.configUrl = configUrl;
                client = new ElvClient({
                  contentSpaceId: contentSpaceId,
                  fabricURIs: fabricURIs,
                  ethereumURIs: ethereumURIs,
                  noCache: noCache,
                  noAuth: noAuth
                });
                client.configUrl = configUrl;
                return _context103.abrupt("return", client);

              case 11:
              case "end":
                return _context103.stop();
            }
          }
        }, _callee103, this);
      }));

      function FromConfigurationUrl(_x101) {
        return _FromConfigurationUrl.apply(this, arguments);
      }

      return FromConfigurationUrl;
    }()
  }]);

  return ElvClient;
}();

exports.ElvClient = ElvClient;