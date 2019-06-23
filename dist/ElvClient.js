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

var AccessGroupContract = require("./contracts/BaseAccessControlGroup");

var WalletContract = require("./contracts/BaseAccessWallet"); // Platform specific polyfills


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
            _context2.next = _context2.t0 === "json" ? 6 : _context2.t0 === "text" ? 7 : _context2.t0 === "blob" ? 8 : _context2.t0 === "arraybuffer" ? 9 : _context2.t0 === "formdata" ? 10 : 11;
            break;

          case 6:
            return _context2.abrupt("return", response.json());

          case 7:
            return _context2.abrupt("return", response.text());

          case 8:
            return _context2.abrupt("return", response.blob());

          case 9:
            return _context2.abrupt("return", response.arrayBuffer());

          case 10:
            return _context2.abrupt("return", response.formData());

          case 11:
            return _context2.abrupt("return", response);

          case 12:
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
   * @param {boolean=} viewOnly - If specified, the client will not attempt to create a wallet contract for the user
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  function ElvClient(_ref3) {
    var contentSpaceId = _ref3.contentSpaceId,
        fabricURIs = _ref3.fabricURIs,
        ethereumURIs = _ref3.ethereumURIs,
        _ref3$viewOnly = _ref3.viewOnly,
        viewOnly = _ref3$viewOnly === void 0 ? false : _ref3$viewOnly,
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
    this.viewOnly = viewOnly;
    this.noCache = noCache;
    this.noAuth = noAuth;
    this.contentTypes = {};
    this.InitializeClients();
  }
  /**
   * Create a new ElvClient from the specified configuration URL
   *
   * @methodGroup Constructor
   * @namedParams
   * @param {string} configUrl - Full URL to the config endpoint
   * @param {boolean=} viewOnly - If specified, the client will not attempt to create a wallet contract for the user
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   * @param {boolean=} noAuth=false - If enabled, blockchain authorization will not be performed
   *
   * @return {Promise<ElvClient>} - New ElvClient connected to the specified content fabric and blockchain
   */


  _createClass(ElvClient, [{
    key: "InitializeClients",
    value: function InitializeClients() {
      this.HttpClient = new HttpClient(this.fabricURIs);
      this.ethClient = new EthClient(this.ethereumURIs);
      this.userProfile = new UserProfileClient({
        client: this
      });
      this.authClient = new AuthorizationClient({
        client: this,
        contentSpaceId: this.contentSpaceId,
        signer: this.signer,
        noCache: this.noCache,
        noAuth: this.noAuth
      });
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
    value: function () {
      var _SetSigner = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(_ref4) {
        var signer, walletCreationEvent;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                signer = _ref4.signer;
                signer.connect(this.ethClient.Provider());
                signer.provider.pollingInterval = 250;
                this.signer = signer;
                this.InitializeClients();

                if (this.viewOnly) {
                  _context3.next = 14;
                  break;
                }

                _context3.next = 8;
                return this.CallContractMethod({
                  abi: SpaceContract.abi,
                  contractAddress: this.utils.HashToAddress(this.contentSpaceId),
                  methodName: "userWallets",
                  methodArgs: [signer.address]
                });

              case 8:
                this.walletAddress = _context3.sent;

                if (!(!this.walletAddress || this.walletAddress === this.utils.nullAddress)) {
                  _context3.next = 14;
                  break;
                }

                _context3.next = 12;
                return this.CallContractMethodAndWait({
                  contractAddress: this.utils.HashToAddress(this.contentSpaceId),
                  abi: SpaceContract.abi,
                  methodName: "createAccessWallet",
                  methodArgs: []
                });

              case 12:
                walletCreationEvent = _context3.sent;
                this.walletAddress = this.ExtractValueFromEvent({
                  abi: SpaceContract.abi,
                  event: walletCreationEvent,
                  eventName: "CreateAccessWallet",
                  eventValue: "wallet"
                });

              case 14:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function SetSigner(_x4) {
        return _SetSigner.apply(this, arguments);
      }

      return SetSigner;
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
      var _SetSignerFromWeb3Provider = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(_ref5) {
        var provider, ethProvider;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                provider = _ref5.provider;
                ethProvider = new Ethers.providers.Web3Provider(provider);
                ethProvider.pollingInterval = 250;
                this.signer = ethProvider.getSigner();
                _context4.next = 6;
                return this.signer.getAddress();

              case 6:
                this.signer.address = _context4.sent;
                this.InitializeClients();

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
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
      regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.CallContractMethod({
                  contractAddress: this.contentSpaceAddress,
                  abi: SpaceContract.abi,
                  methodName: "addressKMS"
                });

              case 2:
                return _context5.abrupt("return", _context5.sent);

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
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
      regeneratorRuntime.mark(function _callee6(_ref6) {
        var name, contentSpaceAddress;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                name = _ref6.name;
                _context6.next = 3;
                return this.ethClient.DeployContentSpaceContract({
                  name: name,
                  signer: this.signer
                });

              case 3:
                contentSpaceAddress = _context6.sent;
                return _context6.abrupt("return", Utils.AddressToSpaceId(contentSpaceAddress));

              case 5:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
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
      regeneratorRuntime.mark(function _callee7() {
        var _this = this;

        var libraryAddresses;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.Collection({
                  collectionType: "libraries"
                });

              case 2:
                libraryAddresses = _context7.sent;
                return _context7.abrupt("return", libraryAddresses.map(function (address) {
                  return _this.utils.AddressToLibraryId(address);
                }));

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
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
      regeneratorRuntime.mark(function _callee8(_ref7) {
        var libraryId, path, library;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                libraryId = _ref7.libraryId;
                path = UrlJoin("qlibs", libraryId);
                _context8.t0 = ResponseToJson;
                _context8.t1 = this.HttpClient;
                _context8.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId
                });

              case 6:
                _context8.t2 = _context8.sent;
                _context8.t3 = path;
                _context8.t4 = {
                  headers: _context8.t2,
                  method: "GET",
                  path: _context8.t3
                };
                _context8.t5 = _context8.t1.Request.call(_context8.t1, _context8.t4);
                _context8.next = 12;
                return (0, _context8.t0)(_context8.t5);

              case 12:
                library = _context8.sent;
                return _context8.abrupt("return", _objectSpread({}, library, {
                  meta: library.meta || {}
                }));

              case 14:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
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
      regeneratorRuntime.mark(function _callee9(_ref8) {
        var libraryId;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                libraryId = _ref8.libraryId;
                _context9.next = 3;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 3:
                return _context9.abrupt("return", _context9.sent);

              case 4:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
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
      regeneratorRuntime.mark(function _callee10(_ref9) {
        var name, description, image, _ref9$metadata, metadata, kmsId, _ref9$isUserLibrary, isUserLibrary, libraryId, _ref10, contractAddress, objectId, editResponse;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                name = _ref9.name, description = _ref9.description, image = _ref9.image, _ref9$metadata = _ref9.metadata, metadata = _ref9$metadata === void 0 ? {} : _ref9$metadata, kmsId = _ref9.kmsId, _ref9$isUserLibrary = _ref9.isUserLibrary, isUserLibrary = _ref9$isUserLibrary === void 0 ? false : _ref9$isUserLibrary;

                if (kmsId) {
                  _context10.next = 9;
                  break;
                }

                _context10.t0 = "ikms";
                _context10.t1 = this.utils;
                _context10.next = 6;
                return this.DefaultKMSAddress();

              case 6:
                _context10.t2 = _context10.sent;
                _context10.t3 = _context10.t1.AddressToHash.call(_context10.t1, _context10.t2);
                kmsId = _context10.t0.concat.call(_context10.t0, _context10.t3);

              case 9:
                if (!isUserLibrary) {
                  _context10.next = 13;
                  break;
                }

                libraryId = this.utils.AddressToLibraryId(this.signer.address);
                _context10.next = 19;
                break;

              case 13:
                _context10.next = 15;
                return this.authClient.CreateContentLibrary({
                  kmsId: kmsId
                });

              case 15:
                _ref10 = _context10.sent;
                contractAddress = _ref10.contractAddress;
                metadata = _objectSpread({}, metadata, {
                  name: name,
                  "eluv.description": description
                });
                libraryId = this.utils.AddressToLibraryId(contractAddress);

              case 19:
                // Set library content object type and metadata on automatically created library object
                objectId = libraryId.replace("ilib", "iq__");
                _context10.next = 22;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  options: {
                    type: "library"
                  }
                });

              case 22:
                editResponse = _context10.sent;
                _context10.next = 25;
                return this.ReplaceMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadata: metadata,
                  writeToken: editResponse.write_token
                });

              case 25:
                _context10.next = 27;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token
                });

              case 27:
                if (!image) {
                  _context10.next = 30;
                  break;
                }

                _context10.next = 30;
                return this.SetContentLibraryImage({
                  libraryId: libraryId,
                  image: image
                });

              case 30:
                return _context10.abrupt("return", libraryId);

              case 31:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
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
      regeneratorRuntime.mark(function _callee11(_ref11) {
        var libraryId, image, objectId;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                libraryId = _ref11.libraryId, image = _ref11.image;
                objectId = libraryId.replace("ilib", "iq__");
                return _context11.abrupt("return", this.SetContentObjectImage({
                  libraryId: libraryId,
                  objectId: objectId,
                  image: image
                }));

              case 3:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
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
      regeneratorRuntime.mark(function _callee12(_ref12) {
        var libraryId, objectId, image, editResponse, uploadResponse, metadata;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                libraryId = _ref12.libraryId, objectId = _ref12.objectId, image = _ref12.image;
                _context12.next = 3;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 3:
                editResponse = _context12.sent;
                _context12.next = 6;
                return this.UploadPart({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  data: image,
                  encrypted: false
                });

              case 6:
                uploadResponse = _context12.sent;
                _context12.next = 9;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 9:
                metadata = _context12.sent;
                _context12.next = 12;
                return this.ReplaceMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token,
                  metadata: _objectSpread({}, metadata, {
                    "image": uploadResponse.part.hash
                  })
                });

              case 12:
                _context12.next = 14;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editResponse.write_token
                });

              case 14:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
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
      regeneratorRuntime.mark(function _callee13(_ref13) {
        var libraryId, path, authorizationHeader;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                libraryId = _ref13.libraryId;
                path = UrlJoin("qlibs", libraryId);
                _context13.next = 4;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  update: true
                });

              case 4:
                authorizationHeader = _context13.sent;
                _context13.next = 7;
                return this.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "kill",
                  methodArgs: []
                });

              case 7:
                _context13.next = 9;
                return this.HttpClient.Request({
                  headers: authorizationHeader,
                  method: "DELETE",
                  path: path
                });

              case 9:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
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
      regeneratorRuntime.mark(function _callee14(_ref14) {
        var libraryId, typeId, typeName, typeHash, customContractAddress, type, typeAddress, event;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                libraryId = _ref14.libraryId, typeId = _ref14.typeId, typeName = _ref14.typeName, typeHash = _ref14.typeHash, customContractAddress = _ref14.customContractAddress;

                if (typeHash) {
                  typeId = this.utils.DecodeVersionHash(typeHash).objectId;
                }

                if (typeId) {
                  _context14.next = 7;
                  break;
                }

                _context14.next = 5;
                return this.ContentType({
                  name: typeName
                });

              case 5:
                type = _context14.sent;
                typeId = type.id;

              case 7:
                typeAddress = this.utils.HashToAddress(typeId);
                customContractAddress = customContractAddress || this.utils.nullAddress;
                _context14.next = 11;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "addContentType",
                  methodArgs: [typeAddress, customContractAddress],
                  signer: this.signer
                });

              case 11:
                event = _context14.sent;
                return _context14.abrupt("return", event.transactionHash);

              case 13:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
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
      regeneratorRuntime.mark(function _callee15(_ref15) {
        var libraryId, typeId, typeName, typeHash, type, typeAddress, event;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                libraryId = _ref15.libraryId, typeId = _ref15.typeId, typeName = _ref15.typeName, typeHash = _ref15.typeHash;

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
                _context15.next = 10;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "removeContentType",
                  methodArgs: [typeAddress],
                  signer: this.signer
                });

              case 10:
                event = _context15.sent;
                return _context15.abrupt("return", event.transactionHash);

              case 12:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
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
      regeneratorRuntime.mark(function _callee17(_ref16) {
        var _this2 = this;

        var libraryId, typesLength, allowedTypeAddresses, contentTypes, allowedTypes;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                libraryId = _ref16.libraryId;
                _context17.next = 3;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(libraryId),
                  abi: LibraryContract.abi,
                  methodName: "contentTypesLength",
                  methodArgs: [],
                  signer: this.signer
                });

              case 3:
                typesLength = _context17.sent.toNumber();

                if (!(typesLength === 0)) {
                  _context17.next = 6;
                  break;
                }

                return _context17.abrupt("return", {});

              case 6:
                _context17.next = 8;
                return Promise.all(Array.from(new Array(typesLength),
                /*#__PURE__*/
                function () {
                  var _ref17 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee16(_, i) {
                    var typeAddress;
                    return regeneratorRuntime.wrap(function _callee16$(_context16) {
                      while (1) {
                        switch (_context16.prev = _context16.next) {
                          case 0:
                            _context16.next = 2;
                            return _this2.ethClient.CallContractMethod({
                              contractAddress: Utils.HashToAddress(libraryId),
                              abi: LibraryContract.abi,
                              methodName: "contentTypes",
                              methodArgs: [i],
                              signer: _this2.signer
                            });

                          case 2:
                            typeAddress = _context16.sent;
                            return _context16.abrupt("return", typeAddress.toString().toLowerCase());

                          case 4:
                          case "end":
                            return _context16.stop();
                        }
                      }
                    }, _callee16);
                  }));

                  return function (_x16, _x17) {
                    return _ref17.apply(this, arguments);
                  };
                }()));

              case 8:
                allowedTypeAddresses = _context17.sent;
                _context17.next = 11;
                return this.ContentTypes();

              case 11:
                contentTypes = _context17.sent;
                allowedTypes = {};
                Object.values(contentTypes).map(function (type) {
                  var typeAddress = _this2.utils.HashToAddress(type.id).toLowerCase(); // If type address is allowed, include it


                  if (allowedTypeAddresses.includes(typeAddress)) {
                    allowedTypes[type.id] = type;
                  }
                });
                return _context17.abrupt("return", allowedTypes);

              case 15:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
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
      regeneratorRuntime.mark(function _callee18(_ref18) {
        var name, typeId, versionHash, contentType;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                name = _ref18.name, typeId = _ref18.typeId, versionHash = _ref18.versionHash;
                _context18.next = 3;
                return this.ContentType({
                  name: name,
                  typeId: typeId,
                  versionHash: versionHash
                });

              case 3:
                contentType = _context18.sent;
                _context18.next = 6;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(contentType.id),
                  abi: ContentTypeContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 6:
                return _context18.abrupt("return", _context18.sent);

              case 7:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
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
      regeneratorRuntime.mark(function _callee19(_ref19) {
        var name, typeId, versionHash, types, typeInfo, metadata;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                name = _ref19.name, typeId = _ref19.typeId, versionHash = _ref19.versionHash;

                if (versionHash) {
                  typeId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                if (typeId) {
                  _context19.next = 11;
                  break;
                }

                _context19.next = 5;
                return this.ContentTypes();

              case 5:
                types = _context19.sent;

                if (!name) {
                  _context19.next = 10;
                  break;
                }

                return _context19.abrupt("return", Object.values(types).find(function (type) {
                  return (type.name || "").toLowerCase() === name.toLowerCase();
                }));

              case 10:
                return _context19.abrupt("return", Object.values(types).find(function (type) {
                  return type.hash === versionHash;
                }));

              case 11:
                _context19.prev = 11;
                _context19.next = 14;
                return this.ContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: typeId
                });

              case 14:
                typeInfo = _context19.sent;
                delete typeInfo.type;
                _context19.next = 18;
                return this.ContentObjectMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: typeId
                });

              case 18:
                _context19.t0 = _context19.sent;

                if (_context19.t0) {
                  _context19.next = 21;
                  break;
                }

                _context19.t0 = {};

              case 21:
                metadata = _context19.t0;
                return _context19.abrupt("return", _objectSpread({}, typeInfo, {
                  name: metadata.name,
                  meta: metadata
                }));

              case 25:
                _context19.prev = 25;
                _context19.t1 = _context19["catch"](11);
                throw new Error("Content Type ".concat(name || typeId, " is invalid"));

              case 28:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this, [[11, 25]]);
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
      regeneratorRuntime.mark(function _callee21() {
        var _this3 = this;

        var typeAddresses;
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                this.contentTypes = this.contentTypes || {};
                _context21.next = 3;
                return this.Collection({
                  collectionType: "contentTypes"
                });

              case 3:
                typeAddresses = _context21.sent;
                _context21.next = 6;
                return Promise.all(typeAddresses.map(
                /*#__PURE__*/
                function () {
                  var _ref20 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee20(typeAddress) {
                    var typeId;
                    return regeneratorRuntime.wrap(function _callee20$(_context20) {
                      while (1) {
                        switch (_context20.prev = _context20.next) {
                          case 0:
                            typeId = _this3.utils.AddressToObjectId(typeAddress);

                            if (_this3.contentTypes[typeId]) {
                              _context20.next = 11;
                              break;
                            }

                            _context20.prev = 2;
                            _context20.next = 5;
                            return _this3.ContentType({
                              typeId: typeId
                            });

                          case 5:
                            _this3.contentTypes[typeId] = _context20.sent;
                            _context20.next = 11;
                            break;

                          case 8:
                            _context20.prev = 8;
                            _context20.t0 = _context20["catch"](2);
                            // eslint-disable-next-line no-console
                            console.error(_context20.t0);

                          case 11:
                          case "end":
                            return _context20.stop();
                        }
                      }
                    }, _callee20, null, [[2, 8]]);
                  }));

                  return function (_x20) {
                    return _ref20.apply(this, arguments);
                  };
                }()));

              case 6:
                return _context21.abrupt("return", this.contentTypes);

              case 7:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
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
      regeneratorRuntime.mark(function _callee22(_ref21) {
        var name, _ref21$metadata, metadata, bitcode, _ref22, contractAddress, objectId, path, createResponse, uploadResponse;

        return regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                name = _ref21.name, _ref21$metadata = _ref21.metadata, metadata = _ref21$metadata === void 0 ? {} : _ref21$metadata, bitcode = _ref21.bitcode;
                metadata.name = name;
                _context22.next = 4;
                return this.authClient.CreateContentType();

              case 4:
                _ref22 = _context22.sent;
                contractAddress = _ref22.contractAddress;
                objectId = this.utils.AddressToObjectId(contractAddress);
                path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);
                /* Create object, upload bitcode and finalize */

                _context22.t0 = ResponseToJson;
                _context22.t1 = this.HttpClient;
                _context22.next = 12;
                return this.authClient.AuthorizationHeader({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  update: true
                });

              case 12:
                _context22.t2 = _context22.sent;
                _context22.t3 = path;
                _context22.t4 = {
                  headers: _context22.t2,
                  method: "POST",
                  path: _context22.t3
                };
                _context22.t5 = _context22.t1.Request.call(_context22.t1, _context22.t4);
                _context22.next = 18;
                return (0, _context22.t0)(_context22.t5);

              case 18:
                createResponse = _context22.sent;
                _context22.next = 21;
                return this.ReplaceMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token,
                  metadata: metadata
                });

              case 21:
                if (!bitcode) {
                  _context22.next = 27;
                  break;
                }

                _context22.next = 24;
                return this.UploadPart({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token,
                  data: bitcode,
                  encrypted: false
                });

              case 24:
                uploadResponse = _context22.sent;
                _context22.next = 27;
                return this.ReplaceMetadata({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token,
                  metadataSubtree: "bitcode_part",
                  metadata: uploadResponse.part.hash
                });

              case 27:
                _context22.next = 29;
                return this.FinalizeContentObject({
                  libraryId: this.contentSpaceLibraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token
                });

              case 29:
                return _context22.abrupt("return", objectId);

              case 30:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
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
     * @param libraryId - ID of the library
     *
     * @returns {Promise<Array<Object>>} - List of objects in library
     */

  }, {
    key: "ContentObjects",
    value: function () {
      var _ContentObjects = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee23(_ref23) {
        var libraryId, path, objects;
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                libraryId = _ref23.libraryId;
                path = UrlJoin("qlibs", libraryId, "q");
                _context23.t0 = ResponseToJson;
                _context23.t1 = this.HttpClient;
                _context23.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId
                });

              case 6:
                _context23.t2 = _context23.sent;
                _context23.t3 = path;
                _context23.t4 = {
                  headers: _context23.t2,
                  method: "GET",
                  path: _context23.t3
                };
                _context23.t5 = _context23.t1.Request.call(_context23.t1, _context23.t4);
                _context23.next = 12;
                return (0, _context23.t0)(_context23.t5);

              case 12:
                objects = _context23.sent.contents;
                return _context23.abrupt("return", objects.map(function (object) {
                  return _objectSpread({}, object, {
                    versions: object.versions.map(function (version) {
                      return _objectSpread({}, version, {
                        meta: version.meta || {}
                      });
                    })
                  });
                }));

              case 14:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this);
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
      regeneratorRuntime.mark(function _callee24(_ref24) {
        var libraryId, objectId, versionHash, path;
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                libraryId = _ref24.libraryId, objectId = _ref24.objectId, versionHash = _ref24.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId);
                _context24.t0 = ResponseToJson;
                _context24.t1 = this.HttpClient;
                _context24.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 7:
                _context24.t2 = _context24.sent;
                _context24.t3 = path;
                _context24.t4 = {
                  headers: _context24.t2,
                  method: "GET",
                  path: _context24.t3
                };
                _context24.t5 = _context24.t1.Request.call(_context24.t1, _context24.t4);
                _context24.next = 13;
                return (0, _context24.t0)(_context24.t5);

              case 13:
                return _context24.abrupt("return", _context24.sent);

              case 14:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
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
      regeneratorRuntime.mark(function _callee25(_ref25) {
        var objectId;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                objectId = _ref25.objectId;
                _context25.next = 3;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 3:
                return _context25.abrupt("return", _context25.sent);

              case 4:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function ContentObjectOwner(_x24) {
        return _ContentObjectOwner.apply(this, arguments);
      }

      return ContentObjectOwner;
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
     * @returns {Promise<Object>} - Metadata of the content object
     */

  }, {
    key: "ContentObjectMetadata",
    value: function () {
      var _ContentObjectMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee26(_ref26) {
        var libraryId, objectId, versionHash, _ref26$metadataSubtre, metadataSubtree, _ref26$noAuth, noAuth, path, metadata;

        return regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                libraryId = _ref26.libraryId, objectId = _ref26.objectId, versionHash = _ref26.versionHash, _ref26$metadataSubtre = _ref26.metadataSubtree, metadataSubtree = _ref26$metadataSubtre === void 0 ? "/" : _ref26$metadataSubtre, _ref26$noAuth = _ref26.noAuth, noAuth = _ref26$noAuth === void 0 ? false : _ref26$noAuth;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "meta", metadataSubtree);
                _context26.prev = 3;
                _context26.t0 = ResponseToJson;
                _context26.t1 = this.HttpClient;
                _context26.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  noAuth: noAuth
                });

              case 8:
                _context26.t2 = _context26.sent;
                _context26.t3 = path;
                _context26.t4 = {
                  headers: _context26.t2,
                  method: "GET",
                  path: _context26.t3
                };
                _context26.t5 = _context26.t1.Request.call(_context26.t1, _context26.t4);
                _context26.next = 14;
                return (0, _context26.t0)(_context26.t5);

              case 14:
                metadata = _context26.sent;
                return _context26.abrupt("return", metadata || {});

              case 18:
                _context26.prev = 18;
                _context26.t6 = _context26["catch"](3);

                if (!(_context26.t6.status !== 404)) {
                  _context26.next = 22;
                  break;
                }

                throw _context26.t6;

              case 22:
                return _context26.abrupt("return", metadataSubtree === "/" ? {} : undefined);

              case 23:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this, [[3, 18]]);
      }));

      function ContentObjectMetadata(_x25) {
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
      regeneratorRuntime.mark(function _callee27(_ref27) {
        var libraryId, objectId, path;
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                libraryId = _ref27.libraryId, objectId = _ref27.objectId;
                path = UrlJoin("qid", objectId);
                _context27.t0 = ResponseToJson;
                _context27.t1 = this.HttpClient;
                _context27.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 6:
                _context27.t2 = _context27.sent;
                _context27.t3 = path;
                _context27.t4 = {
                  headers: _context27.t2,
                  method: "GET",
                  path: _context27.t3
                };
                _context27.t5 = _context27.t1.Request.call(_context27.t1, _context27.t4);
                return _context27.abrupt("return", (0, _context27.t0)(_context27.t5));

              case 11:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function ContentObjectVersions(_x26) {
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
      regeneratorRuntime.mark(function _callee28(_ref28) {
        var libraryId, _ref28$options, options, typeId, type, _ref29, contractAddress, objectId, path;

        return regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                libraryId = _ref28.libraryId, _ref28$options = _ref28.options, options = _ref28$options === void 0 ? {} : _ref28$options;

                if (!options.type) {
                  _context28.next = 13;
                  break;
                }

                if (options.type.startsWith("hq__")) {
                  _context28.next = 8;
                  break;
                }

                _context28.next = 5;
                return this.ContentType({
                  name: options.type
                });

              case 5:
                type = _context28.sent;
                _context28.next = 11;
                break;

              case 8:
                _context28.next = 10;
                return this.ContentType({
                  versionHash: options.type
                });

              case 10:
                type = _context28.sent;

              case 11:
                typeId = type.id;
                options.type = type.hash;

              case 13:
                _context28.next = 15;
                return this.authClient.CreateContentObject({
                  libraryId: libraryId,
                  typeId: typeId
                });

              case 15:
                _ref29 = _context28.sent;
                contractAddress = _ref29.contractAddress;
                _context28.next = 19;
                return this.CallContractMethod({
                  abi: ContentContract.abi,
                  contractAddress: contractAddress,
                  methodName: "setVisibility",
                  methodArgs: [10]
                });

              case 19:
                objectId = this.utils.AddressToObjectId(contractAddress);
                path = UrlJoin("qid", objectId);
                _context28.t0 = ResponseToJson;
                _context28.t1 = this.HttpClient;
                _context28.next = 25;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 25:
                _context28.t2 = _context28.sent;
                _context28.t3 = path;
                _context28.t4 = options;
                _context28.t5 = {
                  headers: _context28.t2,
                  method: "POST",
                  path: _context28.t3,
                  body: _context28.t4
                };
                _context28.t6 = _context28.t1.Request.call(_context28.t1, _context28.t5);
                _context28.next = 32;
                return (0, _context28.t0)(_context28.t6);

              case 32:
                return _context28.abrupt("return", _context28.sent);

              case 33:
              case "end":
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function CreateContentObject(_x27) {
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
      regeneratorRuntime.mark(function _callee29(_ref30) {
        var libraryId, originalVersionHash, _ref30$options, options;

        return regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                libraryId = _ref30.libraryId, originalVersionHash = _ref30.originalVersionHash, _ref30$options = _ref30.options, options = _ref30$options === void 0 ? {} : _ref30$options;
                options.copy_from = originalVersionHash;
                _context29.next = 4;
                return this.CreateContentObject({
                  libraryId: libraryId,
                  options: options
                });

              case 4:
                return _context29.abrupt("return", _context29.sent);

              case 5:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function CopyContentObject(_x28) {
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
      regeneratorRuntime.mark(function _callee30(_ref31) {
        var libraryId, objectId, _ref31$options, options, path;

        return regeneratorRuntime.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                libraryId = _ref31.libraryId, objectId = _ref31.objectId, _ref31$options = _ref31.options, options = _ref31$options === void 0 ? {} : _ref31$options;

                if (this.utils.EqualHash(libraryId, objectId)) {
                  _context30.next = 5;
                  break;
                }

                // Don't allow changing of content type in this method
                delete options.type;
                _context30.next = 21;
                break;

              case 5:
                if (!options.type) {
                  _context30.next = 21;
                  break;
                }

                if (!options.type.startsWith("hq__")) {
                  _context30.next = 12;
                  break;
                }

                _context30.next = 9;
                return this.ContentType({
                  versionHash: options.type
                });

              case 9:
                options.type = _context30.sent.hash;
                _context30.next = 21;
                break;

              case 12:
                if (!options.type.startsWith("iq__")) {
                  _context30.next = 18;
                  break;
                }

                _context30.next = 15;
                return this.ContentType({
                  typeId: options.type
                });

              case 15:
                options.type = _context30.sent.hash;
                _context30.next = 21;
                break;

              case 18:
                _context30.next = 20;
                return this.ContentType({
                  name: options.type
                });

              case 20:
                options.type = _context30.sent.hash;

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
                return _context30.abrupt("return", (0, _context30.t0)(_context30.t6));

              case 32:
              case "end":
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function EditContentObject(_x29) {
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
     */

  }, {
    key: "FinalizeContentObject",
    value: function () {
      var _FinalizeContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee31(_ref32) {
        var libraryId, objectId, writeToken, path, finalizeResponse;
        return regeneratorRuntime.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                libraryId = _ref32.libraryId, objectId = _ref32.objectId, writeToken = _ref32.writeToken;
                path = UrlJoin("q", writeToken);
                _context31.t0 = ResponseToJson;
                _context31.t1 = this.HttpClient;
                _context31.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 6:
                _context31.t2 = _context31.sent;
                _context31.t3 = path;
                _context31.t4 = {
                  headers: _context31.t2,
                  method: "POST",
                  path: _context31.t3
                };
                _context31.t5 = _context31.t1.Request.call(_context31.t1, _context31.t4);
                _context31.next = 12;
                return (0, _context31.t0)(_context31.t5);

              case 12:
                finalizeResponse = _context31.sent;
                _context31.next = 15;
                return this.PublishContentVersion({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: finalizeResponse.hash
                });

              case 15:
                // Invalidate cached content type, if this is one.
                delete this.contentTypes[objectId];
                return _context31.abrupt("return", finalizeResponse);

              case 17:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function FinalizeContentObject(_x30) {
        return _FinalizeContentObject.apply(this, arguments);
      }

      return FinalizeContentObject;
    }()
    /**
     * Publish a content object version
     *
     * @see PUT /qlibs/:qlibid/q/:versionHash
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
      regeneratorRuntime.mark(function _callee32(_ref33) {
        var libraryId, objectId, versionHash, path;
        return regeneratorRuntime.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                libraryId = _ref33.libraryId, objectId = _ref33.objectId, versionHash = _ref33.versionHash;
                _context32.next = 3;
                return this.ethClient.CommitContent({
                  contentObjectAddress: this.utils.HashToAddress(objectId),
                  versionHash: versionHash,
                  signer: this.signer
                });

              case 3:
                path = UrlJoin("qlibs", libraryId, "q", versionHash);
                _context32.t0 = this.HttpClient;
                _context32.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 7:
                _context32.t1 = _context32.sent;
                _context32.t2 = path;
                _context32.t3 = {
                  headers: _context32.t1,
                  method: "PUT",
                  path: _context32.t2
                };
                _context32.next = 12;
                return _context32.t0.Request.call(_context32.t0, _context32.t3);

              case 12:
                _context32.next = 14;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, 2000);
                });

              case 14:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function PublishContentVersion(_x31) {
        return _PublishContentVersion.apply(this, arguments);
      }

      return PublishContentVersion;
    }()
    /**
     * Delete specified version of the content object
     *
     * @see DELETE /qlibs/:qlibid/q/:qhit
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be deleted
     */

  }, {
    key: "DeleteContentVersion",
    value: function () {
      var _DeleteContentVersion = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee33(_ref34) {
        var libraryId, objectId, versionHash, path;
        return regeneratorRuntime.wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                libraryId = _ref34.libraryId, objectId = _ref34.objectId, versionHash = _ref34.versionHash;
                path = UrlJoin("q", versionHash || objectId);
                _context33.t0 = this.HttpClient;
                _context33.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context33.t1 = _context33.sent;
                _context33.t2 = path;
                _context33.t3 = {
                  headers: _context33.t1,
                  method: "DELETE",
                  path: _context33.t2
                };
                _context33.next = 10;
                return _context33.t0.Request.call(_context33.t0, _context33.t3);

              case 10:
              case "end":
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }));

      function DeleteContentVersion(_x32) {
        return _DeleteContentVersion.apply(this, arguments);
      }

      return DeleteContentVersion;
    }()
    /**
     * Delete specified content object
     *
     * @see DELETE /qlibs/:qlibid/qid/:objectid
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
      regeneratorRuntime.mark(function _callee34(_ref35) {
        var libraryId, objectId, path, authorizationHeader;
        return regeneratorRuntime.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                libraryId = _ref35.libraryId, objectId = _ref35.objectId;
                path = UrlJoin("qid", objectId);
                _context34.next = 4;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 4:
                authorizationHeader = _context34.sent;
                _context34.next = 7;
                return this.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "kill",
                  methodArgs: []
                });

              case 7:
                _context34.next = 9;
                return this.HttpClient.Request({
                  headers: authorizationHeader,
                  method: "DELETE",
                  path: path
                });

              case 9:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function DeleteContentObject(_x33) {
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
      regeneratorRuntime.mark(function _callee35(_ref36) {
        var libraryId, objectId, writeToken, _ref36$metadataSubtre, metadataSubtree, _ref36$metadata, metadata, path;

        return regeneratorRuntime.wrap(function _callee35$(_context35) {
          while (1) {
            switch (_context35.prev = _context35.next) {
              case 0:
                libraryId = _ref36.libraryId, objectId = _ref36.objectId, writeToken = _ref36.writeToken, _ref36$metadataSubtre = _ref36.metadataSubtree, metadataSubtree = _ref36$metadataSubtre === void 0 ? "/" : _ref36$metadataSubtre, _ref36$metadata = _ref36.metadata, metadata = _ref36$metadata === void 0 ? {} : _ref36$metadata;
                path = UrlJoin("q", writeToken, "meta", metadataSubtree);
                _context35.t0 = this.HttpClient;
                _context35.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context35.t1 = _context35.sent;
                _context35.t2 = path;
                _context35.t3 = metadata;
                _context35.t4 = {
                  headers: _context35.t1,
                  method: "POST",
                  path: _context35.t2,
                  body: _context35.t3
                };
                _context35.next = 11;
                return _context35.t0.Request.call(_context35.t0, _context35.t4);

              case 11:
              case "end":
                return _context35.stop();
            }
          }
        }, _callee35, this);
      }));

      function MergeMetadata(_x34) {
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
      regeneratorRuntime.mark(function _callee36(_ref37) {
        var libraryId, objectId, writeToken, _ref37$metadataSubtre, metadataSubtree, _ref37$metadata, metadata, path;

        return regeneratorRuntime.wrap(function _callee36$(_context36) {
          while (1) {
            switch (_context36.prev = _context36.next) {
              case 0:
                libraryId = _ref37.libraryId, objectId = _ref37.objectId, writeToken = _ref37.writeToken, _ref37$metadataSubtre = _ref37.metadataSubtree, metadataSubtree = _ref37$metadataSubtre === void 0 ? "/" : _ref37$metadataSubtre, _ref37$metadata = _ref37.metadata, metadata = _ref37$metadata === void 0 ? {} : _ref37$metadata;
                path = UrlJoin("q", writeToken, "meta", metadataSubtree);
                _context36.t0 = this.HttpClient;
                _context36.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context36.t1 = _context36.sent;
                _context36.t2 = path;
                _context36.t3 = metadata;
                _context36.t4 = {
                  headers: _context36.t1,
                  method: "PUT",
                  path: _context36.t2,
                  body: _context36.t3
                };
                _context36.next = 11;
                return _context36.t0.Request.call(_context36.t0, _context36.t4);

              case 11:
              case "end":
                return _context36.stop();
            }
          }
        }, _callee36, this);
      }));

      function ReplaceMetadata(_x35) {
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
      regeneratorRuntime.mark(function _callee37(_ref38) {
        var libraryId, objectId, writeToken, _ref38$metadataSubtre, metadataSubtree, path;

        return regeneratorRuntime.wrap(function _callee37$(_context37) {
          while (1) {
            switch (_context37.prev = _context37.next) {
              case 0:
                libraryId = _ref38.libraryId, objectId = _ref38.objectId, writeToken = _ref38.writeToken, _ref38$metadataSubtre = _ref38.metadataSubtree, metadataSubtree = _ref38$metadataSubtre === void 0 ? "/" : _ref38$metadataSubtre;
                path = UrlJoin("q", writeToken, "meta", metadataSubtree);
                _context37.t0 = this.HttpClient;
                _context37.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context37.t1 = _context37.sent;
                _context37.t2 = path;
                _context37.t3 = {
                  headers: _context37.t1,
                  method: "DELETE",
                  path: _context37.t2
                };
                _context37.next = 10;
                return _context37.t0.Request.call(_context37.t0, _context37.t3);

              case 10:
              case "end":
                return _context37.stop();
            }
          }
        }, _callee37, this);
      }));

      function DeleteMetadata(_x36) {
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
      regeneratorRuntime.mark(function _callee38(_ref39) {
        var libraryId, objectId, versionHash, path;
        return regeneratorRuntime.wrap(function _callee38$(_context38) {
          while (1) {
            switch (_context38.prev = _context38.next) {
              case 0:
                libraryId = _ref39.libraryId, objectId = _ref39.objectId, versionHash = _ref39.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "meta", "files");
                _context38.t0 = ResponseToJson;
                _context38.t1 = this.HttpClient;
                _context38.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 7:
                _context38.t2 = _context38.sent;
                _context38.t3 = path;
                _context38.t4 = {
                  headers: _context38.t2,
                  method: "GET",
                  path: _context38.t3
                };
                _context38.t5 = _context38.t1.Request.call(_context38.t1, _context38.t4);
                return _context38.abrupt("return", (0, _context38.t0)(_context38.t5));

              case 12:
              case "end":
                return _context38.stop();
            }
          }
        }, _callee38, this);
      }));

      function ListFiles(_x37) {
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
      regeneratorRuntime.mark(function _callee40(_ref40) {
        var _this4 = this;

        var libraryId, objectId, writeToken, fileInfo, fileDataMap, uploadJobs;
        return regeneratorRuntime.wrap(function _callee40$(_context40) {
          while (1) {
            switch (_context40.prev = _context40.next) {
              case 0:
                libraryId = _ref40.libraryId, objectId = _ref40.objectId, writeToken = _ref40.writeToken, fileInfo = _ref40.fileInfo;
                // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
                fileDataMap = {};
                fileInfo = fileInfo.map(function (entry) {
                  fileDataMap[entry.path] = entry.data;
                  return _objectSpread({}, entry, {
                    data: undefined
                  });
                });
                _context40.next = 5;
                return this.CreateFileUploadJob({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  fileInfo: fileInfo
                });

              case 5:
                uploadJobs = _context40.sent.upload_jobs;
                _context40.next = 8;
                return Promise.all(uploadJobs.map(
                /*#__PURE__*/
                function () {
                  var _ref41 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee39(jobInfo) {
                    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _fileInfo, fileData;

                    return regeneratorRuntime.wrap(function _callee39$(_context39) {
                      while (1) {
                        switch (_context39.prev = _context39.next) {
                          case 0:
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context39.prev = 3;
                            _iterator = jobInfo.files[Symbol.iterator]();

                          case 5:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                              _context39.next = 13;
                              break;
                            }

                            _fileInfo = _step.value;
                            fileData = fileDataMap[_fileInfo.path].slice(_fileInfo.off, _fileInfo.off + _fileInfo.len);
                            _context39.next = 10;
                            return _this4.UploadFileData({
                              libraryId: libraryId,
                              objectId: objectId,
                              writeToken: writeToken,
                              jobId: jobInfo.id,
                              fileData: fileData
                            });

                          case 10:
                            _iteratorNormalCompletion = true;
                            _context39.next = 5;
                            break;

                          case 13:
                            _context39.next = 19;
                            break;

                          case 15:
                            _context39.prev = 15;
                            _context39.t0 = _context39["catch"](3);
                            _didIteratorError = true;
                            _iteratorError = _context39.t0;

                          case 19:
                            _context39.prev = 19;
                            _context39.prev = 20;

                            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                              _iterator["return"]();
                            }

                          case 22:
                            _context39.prev = 22;

                            if (!_didIteratorError) {
                              _context39.next = 25;
                              break;
                            }

                            throw _iteratorError;

                          case 25:
                            return _context39.finish(22);

                          case 26:
                            return _context39.finish(19);

                          case 27:
                          case "end":
                            return _context39.stop();
                        }
                      }
                    }, _callee39, null, [[3, 15, 19, 27], [20,, 22, 26]]);
                  }));

                  return function (_x39) {
                    return _ref41.apply(this, arguments);
                  };
                }()));

              case 8:
                _context40.next = 10;
                return this.FinalizeUploadJobs({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken
                });

              case 10:
              case "end":
                return _context40.stop();
            }
          }
        }, _callee40, this);
      }));

      function UploadFiles(_x38) {
        return _UploadFiles.apply(this, arguments);
      }

      return UploadFiles;
    }()
  }, {
    key: "CreateFileUploadJob",
    value: function () {
      var _CreateFileUploadJob = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee41(_ref42) {
        var libraryId, objectId, writeToken, fileInfo, path;
        return regeneratorRuntime.wrap(function _callee41$(_context41) {
          while (1) {
            switch (_context41.prev = _context41.next) {
              case 0:
                libraryId = _ref42.libraryId, objectId = _ref42.objectId, writeToken = _ref42.writeToken, fileInfo = _ref42.fileInfo;
                path = UrlJoin("q", writeToken, "upload_jobs");
                _context41.t0 = ResponseToJson;
                _context41.t1 = this.HttpClient;
                _context41.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 6:
                _context41.t2 = _context41.sent;
                _context41.t3 = path;
                _context41.t4 = fileInfo;
                _context41.t5 = {
                  headers: _context41.t2,
                  method: "POST",
                  path: _context41.t3,
                  body: _context41.t4
                };
                _context41.t6 = _context41.t1.Request.call(_context41.t1, _context41.t5);
                return _context41.abrupt("return", (0, _context41.t0)(_context41.t6));

              case 12:
              case "end":
                return _context41.stop();
            }
          }
        }, _callee41, this);
      }));

      function CreateFileUploadJob(_x40) {
        return _CreateFileUploadJob.apply(this, arguments);
      }

      return CreateFileUploadJob;
    }()
  }, {
    key: "UploadFileData",
    value: function () {
      var _UploadFileData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee42(_ref43) {
        var libraryId, objectId, writeToken, jobId, fileData, path;
        return regeneratorRuntime.wrap(function _callee42$(_context42) {
          while (1) {
            switch (_context42.prev = _context42.next) {
              case 0:
                libraryId = _ref43.libraryId, objectId = _ref43.objectId, writeToken = _ref43.writeToken, jobId = _ref43.jobId, fileData = _ref43.fileData;
                path = UrlJoin("q", writeToken, "upload_jobs", jobId);
                _context42.t0 = ResponseToJson;
                _context42.t1 = this.HttpClient;
                _context42.t2 = path;
                _context42.t3 = fileData;
                _context42.t4 = _objectSpread;
                _context42.t5 = {
                  "Content-type": "application/octet-stream"
                };
                _context42.next = 10;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 10:
                _context42.t6 = _context42.sent;
                _context42.t7 = (0, _context42.t4)(_context42.t5, _context42.t6);
                _context42.t8 = {
                  method: "POST",
                  path: _context42.t2,
                  body: _context42.t3,
                  bodyType: "BINARY",
                  headers: _context42.t7
                };
                _context42.t9 = _context42.t1.Request.call(_context42.t1, _context42.t8);
                return _context42.abrupt("return", (0, _context42.t0)(_context42.t9));

              case 15:
              case "end":
                return _context42.stop();
            }
          }
        }, _callee42, this);
      }));

      function UploadFileData(_x41) {
        return _UploadFileData.apply(this, arguments);
      }

      return UploadFileData;
    }()
  }, {
    key: "UploadJobStatus",
    value: function () {
      var _UploadJobStatus = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee43(_ref44) {
        var libraryId, objectId, writeToken, jobId, path;
        return regeneratorRuntime.wrap(function _callee43$(_context43) {
          while (1) {
            switch (_context43.prev = _context43.next) {
              case 0:
                libraryId = _ref44.libraryId, objectId = _ref44.objectId, writeToken = _ref44.writeToken, jobId = _ref44.jobId;
                path = UrlJoin("q", writeToken, "upload_jobs", jobId);
                _context43.t0 = ResponseToJson;
                _context43.t1 = this.HttpClient;
                _context43.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 6:
                _context43.t2 = _context43.sent;
                _context43.t3 = path;
                _context43.t4 = {
                  headers: _context43.t2,
                  method: "GET",
                  path: _context43.t3
                };
                _context43.t5 = _context43.t1.Request.call(_context43.t1, _context43.t4);
                return _context43.abrupt("return", (0, _context43.t0)(_context43.t5));

              case 11:
              case "end":
                return _context43.stop();
            }
          }
        }, _callee43, this);
      }));

      function UploadJobStatus(_x42) {
        return _UploadJobStatus.apply(this, arguments);
      }

      return UploadJobStatus;
    }()
  }, {
    key: "FinalizeUploadJobs",
    value: function () {
      var _FinalizeUploadJobs = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee44(_ref45) {
        var libraryId, objectId, writeToken, path;
        return regeneratorRuntime.wrap(function _callee44$(_context44) {
          while (1) {
            switch (_context44.prev = _context44.next) {
              case 0:
                libraryId = _ref45.libraryId, objectId = _ref45.objectId, writeToken = _ref45.writeToken;
                path = UrlJoin("q", writeToken, "files");
                _context44.t0 = this.HttpClient;
                _context44.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 5:
                _context44.t1 = _context44.sent;
                _context44.t2 = path;
                _context44.t3 = {
                  headers: _context44.t1,
                  method: "POST",
                  path: _context44.t2
                };
                _context44.next = 10;
                return _context44.t0.Request.call(_context44.t0, _context44.t3);

              case 10:
              case "end":
                return _context44.stop();
            }
          }
        }, _callee44, this);
      }));

      function FinalizeUploadJobs(_x43) {
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
      regeneratorRuntime.mark(function _callee45(_ref46) {
        var libraryId, objectId, versionHash, filePath, _ref46$format, format, path;

        return regeneratorRuntime.wrap(function _callee45$(_context45) {
          while (1) {
            switch (_context45.prev = _context45.next) {
              case 0:
                libraryId = _ref46.libraryId, objectId = _ref46.objectId, versionHash = _ref46.versionHash, filePath = _ref46.filePath, _ref46$format = _ref46.format, format = _ref46$format === void 0 ? "blob" : _ref46$format;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "files", filePath);
                _context45.t0 = ResponseToFormat;
                _context45.t1 = format;
                _context45.t2 = this.HttpClient;
                _context45.next = 8;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 8:
                _context45.t3 = _context45.sent;
                _context45.t4 = path;
                _context45.t5 = {
                  headers: _context45.t3,
                  method: "GET",
                  path: _context45.t4
                };
                _context45.t6 = _context45.t2.Request.call(_context45.t2, _context45.t5);
                return _context45.abrupt("return", (0, _context45.t0)(_context45.t1, _context45.t6));

              case 13:
              case "end":
                return _context45.stop();
            }
          }
        }, _callee45, this);
      }));

      function DownloadFile(_x44) {
        return _DownloadFile.apply(this, arguments);
      }

      return DownloadFile;
    }()
    /* Parts */

    /**
     * List content object parts
     *
     * @see GET /qlibs/:qlibid/q/:qhit/parts
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
      regeneratorRuntime.mark(function _callee46(_ref47) {
        var libraryId, objectId, versionHash, path, response;
        return regeneratorRuntime.wrap(function _callee46$(_context46) {
          while (1) {
            switch (_context46.prev = _context46.next) {
              case 0:
                libraryId = _ref47.libraryId, objectId = _ref47.objectId, versionHash = _ref47.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "parts");
                _context46.t0 = ResponseToJson;
                _context46.t1 = this.HttpClient;
                _context46.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 7:
                _context46.t2 = _context46.sent;
                _context46.t3 = path;
                _context46.t4 = {
                  headers: _context46.t2,
                  method: "GET",
                  path: _context46.t3
                };
                _context46.t5 = _context46.t1.Request.call(_context46.t1, _context46.t4);
                _context46.next = 13;
                return (0, _context46.t0)(_context46.t5);

              case 13:
                response = _context46.sent;
                return _context46.abrupt("return", response.parts);

              case 15:
              case "end":
                return _context46.stop();
            }
          }
        }, _callee46, this);
      }));

      function ContentParts(_x45) {
        return _ContentParts.apply(this, arguments);
      }

      return ContentParts;
    }()
  }, {
    key: "DecryptPart",
    value: function () {
      var _DecryptPart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee47(_ref48) {
        var libraryId, objectId, partHash, data, owner, cap;
        return regeneratorRuntime.wrap(function _callee47$(_context47) {
          while (1) {
            switch (_context47.prev = _context47.next) {
              case 0:
                libraryId = _ref48.libraryId, objectId = _ref48.objectId, partHash = _ref48.partHash, data = _ref48.data;
                _context47.next = 3;
                return this.authClient.Owner({
                  id: objectId,
                  abi: ContentContract.abi
                });

              case 3:
                owner = _context47.sent;

                if (!this.utils.EqualAddress(owner, this.signer.address)) {
                  _context47.next = 10;
                  break;
                }

                _context47.next = 7;
                return this.EncryptionCap({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 7:
                cap = _context47.sent;
                _context47.next = 13;
                break;

              case 10:
                _context47.next = 12;
                return this.authClient.ReencryptionKey(objectId);

              case 12:
                cap = _context47.sent;

              case 13:
                if (cap) {
                  _context47.next = 15;
                  break;
                }

                throw Error("No encryption capsule for " + partHash);

              case 15:
                _context47.next = 17;
                return Crypto.Decrypt(cap, data);

              case 17:
                return _context47.abrupt("return", _context47.sent);

              case 18:
              case "end":
                return _context47.stop();
            }
          }
        }, _callee47, this);
      }));

      function DecryptPart(_x46) {
        return _DecryptPart.apply(this, arguments);
      }

      return DecryptPart;
    }()
    /**
     * Download a part from a content object
     *
     * @see GET /qlibs/:qlibid/q/:qhit/data/:qparthash
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
     * @param {string} partHash - Hash of the part to download
     * @param {string=} format="blob" - Format in which to return the data ("blob" | "arraybuffer")
     *
     * @returns {Promise<(Blob | ArrayBuffer)>} - Part data as a blob
     */

  }, {
    key: "DownloadPart",
    value: function () {
      var _DownloadPart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee48(_ref49) {
        var libraryId, objectId, versionHash, partHash, _ref49$format, format, encrypted, path, headers, response, data;

        return regeneratorRuntime.wrap(function _callee48$(_context48) {
          while (1) {
            switch (_context48.prev = _context48.next) {
              case 0:
                libraryId = _ref49.libraryId, objectId = _ref49.objectId, versionHash = _ref49.versionHash, partHash = _ref49.partHash, _ref49$format = _ref49.format, format = _ref49$format === void 0 ? "blob" : _ref49$format;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                encrypted = partHash.startsWith("hqpe");
                path = UrlJoin("q", versionHash || objectId, "data", partHash);
                _context48.next = 6;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 6:
                headers = _context48.sent;

                if (encrypted) {
                  headers["X-Content-Fabric-Encryption-Scheme"] = "cgck";
                }

                _context48.next = 10;
                return this.HttpClient.Request({
                  headers: headers,
                  method: "GET",
                  path: path
                });

              case 10:
                response = _context48.sent;
                _context48.next = 13;
                return response.arrayBuffer();

              case 13:
                data = _context48.sent;

                if (!encrypted) {
                  _context48.next = 18;
                  break;
                }

                _context48.next = 17;
                return this.DecryptPart({
                  libraryId: libraryId,
                  objectId: objectId,
                  partHash: partHash,
                  data: data
                });

              case 17:
                data = _context48.sent;

              case 18:
                _context48.next = 20;
                return ResponseToFormat(format, new Response(data));

              case 20:
                return _context48.abrupt("return", _context48.sent);

              case 21:
              case "end":
                return _context48.stop();
            }
          }
        }, _callee48, this);
      }));

      function DownloadPart(_x47) {
        return _DownloadPart.apply(this, arguments);
      }

      return DownloadPart;
    }()
  }, {
    key: "EncryptionCap",
    value: function () {
      var _EncryptionCap = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee49(_ref50) {
        var libraryId, objectId, writeToken, _ref50$blockSize, blockSize, capKey, existingCap, cap, _metadata, kmsAddress, kmsPublicKey, kmsCapKey;

        return regeneratorRuntime.wrap(function _callee49$(_context49) {
          while (1) {
            switch (_context49.prev = _context49.next) {
              case 0:
                libraryId = _ref50.libraryId, objectId = _ref50.objectId, writeToken = _ref50.writeToken, _ref50$blockSize = _ref50.blockSize, blockSize = _ref50$blockSize === void 0 ? 1000000 : _ref50$blockSize;
                capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
                _context49.next = 4;
                return this.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadataSubtree: capKey
                });

              case 4:
                existingCap = _context49.sent;

                if (!existingCap) {
                  _context49.next = 9;
                  break;
                }

                _context49.next = 8;
                return Crypto.DecryptCap(existingCap, this.signer.signingKey.privateKey);

              case 8:
                return _context49.abrupt("return", _context49.sent);

              case 9:
                _context49.next = 11;
                return Crypto.GeneratePrimaryCap(blockSize);

              case 11:
                cap = _context49.sent;

                if (!writeToken) {
                  _context49.next = 43;
                  break;
                }

                _context49.next = 15;
                return this.CallContractMethod({
                  contractAddress: this.utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "addressKMS"
                });

              case 15:
                kmsAddress = _context49.sent;
                _context49.next = 18;
                return this.authClient.KMSInfo({
                  objectId: objectId
                });

              case 18:
                kmsPublicKey = _context49.sent.publicKey;
                kmsCapKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
                _context49.t0 = this;
                _context49.t1 = libraryId;
                _context49.t2 = objectId;
                _context49.t3 = writeToken;
                _metadata = {};
                _context49.t4 = _defineProperty;
                _context49.t5 = _metadata;
                _context49.t6 = capKey;
                _context49.next = 30;
                return Crypto.EncryptCap(cap, this.signer.signingKey.publicKey);

              case 30:
                _context49.t7 = _context49.sent;
                (0, _context49.t4)(_context49.t5, _context49.t6, _context49.t7);
                _context49.t8 = _defineProperty;
                _context49.t9 = _metadata;
                _context49.t10 = kmsCapKey;
                _context49.next = 37;
                return Crypto.EncryptCap(cap, kmsPublicKey);

              case 37:
                _context49.t11 = _context49.sent;
                (0, _context49.t8)(_context49.t9, _context49.t10, _context49.t11);
                _context49.t12 = _metadata;
                _context49.t13 = {
                  libraryId: _context49.t1,
                  objectId: _context49.t2,
                  writeToken: _context49.t3,
                  metadata: _context49.t12
                };
                _context49.next = 43;
                return _context49.t0.MergeMetadata.call(_context49.t0, _context49.t13);

              case 43:
                return _context49.abrupt("return", cap);

              case 44:
              case "end":
                return _context49.stop();
            }
          }
        }, _callee49, this);
      }));

      function EncryptionCap(_x48) {
        return _EncryptionCap.apply(this, arguments);
      }

      return EncryptionCap;
    }()
    /**
     * Upload part to an object draft
     *
     * @see POST /qlibs/:qlibid/q/:write_token/data
     *
     * @methodGroup Content Objects
     * @namedParams
     * @param {string} libraryId - ID of the library
     * @param {string} objectId - ID of the object
     * @param {string} writeToken - Write token of the content object draft
     * @param {(ArrayBuffer | Blob | Buffer)} data - Data to upload
     * @param {number=} chunkSize=1000000 (1MB) - Chunk size, in bytes
     * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
     * @param {function=} callback - If specified, function will be called with upload progress after completion of each chunk
     * - Method signatue: ({uploaded, total})
     *
     * @returns {Promise<Object>} - Response containing information about the uploaded part
     */

  }, {
    key: "UploadPart",
    value: function () {
      var _UploadPart = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee50(_ref51) {
        var libraryId, objectId, writeToken, data, _ref51$chunkSize, chunkSize, _ref51$encryption, encryption, callback, headers, encrypt, encryptionCap, totalSize, uploadResult, path, partWriteToken, uploaded, to, chunk;

        return regeneratorRuntime.wrap(function _callee50$(_context50) {
          while (1) {
            switch (_context50.prev = _context50.next) {
              case 0:
                libraryId = _ref51.libraryId, objectId = _ref51.objectId, writeToken = _ref51.writeToken, data = _ref51.data, _ref51$chunkSize = _ref51.chunkSize, chunkSize = _ref51$chunkSize === void 0 ? 1000000 : _ref51$chunkSize, _ref51$encryption = _ref51.encryption, encryption = _ref51$encryption === void 0 ? "none" : _ref51$encryption, callback = _ref51.callback;
                _context50.next = 3;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 3:
                headers = _context50.sent;
                headers["X-Content-Fabric-Encryption-Scheme"] = encryption || "none";
                encrypt = encryption === "cgck";

                if (!encrypt) {
                  _context50.next = 12;
                  break;
                }

                _context50.next = 9;
                return this.EncryptionCap({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken,
                  blockSize: chunkSize
                });

              case 9:
                _context50.t0 = _context50.sent;
                _context50.next = 13;
                break;

              case 12:
                _context50.t0 = undefined;

              case 13:
                encryptionCap = _context50.t0;
                totalSize = data.size || data.length || data.byteLength;

                if (callback) {
                  callback({
                    uploaded: 0,
                    total: totalSize
                  });
                } // If the file is smaller than the chunk size, just upload it in one pass


                if (!(totalSize < chunkSize)) {
                  _context50.next = 26;
                  break;
                }

                if (!encrypt) {
                  _context50.next = 21;
                  break;
                }

                _context50.next = 20;
                return Crypto.Encrypt(encryptionCap, data);

              case 20:
                data = _context50.sent;

              case 21:
                _context50.next = 23;
                return ResponseToJson(this.HttpClient.Request({
                  headers: headers,
                  method: "POST",
                  path: UrlJoin("q", writeToken, "data"),
                  body: data,
                  bodyType: "BINARY"
                }));

              case 23:
                uploadResult = _context50.sent;

                if (callback) {
                  callback({
                    uploaded: totalSize,
                    total: totalSize
                  });
                }

                return _context50.abrupt("return", uploadResult);

              case 26:
                path = UrlJoin("q", writeToken, "parts"); // Create the part for writing

                _context50.next = 29;
                return ResponseToJson(this.HttpClient.Request({
                  headers: headers,
                  method: "POST",
                  path: path,
                  bodyType: "BINARY",
                  body: ""
                }));

              case 29:
                partWriteToken = _context50.sent.part.write_token;
                uploaded = 0;

              case 31:
                if (!(uploaded < totalSize)) {
                  _context50.next = 44;
                  break;
                }

                to = Math.min(uploaded + chunkSize, totalSize);
                chunk = data.slice(uploaded, to);

                if (!encrypt) {
                  _context50.next = 38;
                  break;
                }

                _context50.next = 37;
                return Crypto.Encrypt(encryptionCap, chunk);

              case 37:
                chunk = _context50.sent;

              case 38:
                _context50.next = 40;
                return ResponseToJson(this.HttpClient.Request({
                  headers: headers,
                  method: "POST",
                  path: UrlJoin(path, partWriteToken),
                  body: chunk,
                  bodyType: "BINARY"
                }));

              case 40:
                if (callback) {
                  callback({
                    uploaded: to,
                    total: totalSize
                  });
                }

              case 41:
                uploaded += chunkSize;
                _context50.next = 31;
                break;

              case 44:
                _context50.t1 = ResponseToJson;
                _context50.next = 47;
                return this.HttpClient.Request({
                  headers: headers,
                  method: "POST",
                  path: UrlJoin(path, partWriteToken),
                  bodyType: "BINARY",
                  body: ""
                });

              case 47:
                _context50.t2 = _context50.sent;
                _context50.next = 50;
                return (0, _context50.t1)(_context50.t2);

              case 50:
                return _context50.abrupt("return", _context50.sent);

              case 51:
              case "end":
                return _context50.stop();
            }
          }
        }, _callee50, this);
      }));

      function UploadPart(_x49) {
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
      regeneratorRuntime.mark(function _callee51(_ref52) {
        var libraryId, objectId, writeToken, partHash, path;
        return regeneratorRuntime.wrap(function _callee51$(_context51) {
          while (1) {
            switch (_context51.prev = _context51.next) {
              case 0:
                libraryId = _ref52.libraryId, objectId = _ref52.objectId, writeToken = _ref52.writeToken, partHash = _ref52.partHash;
                path = UrlJoin("q", writeToken, "parts", partHash);
                _context51.t0 = this.HttpClient;
                _context51.next = 5;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  update: true
                });

              case 5:
                _context51.t1 = _context51.sent;
                _context51.t2 = path;
                _context51.t3 = {
                  headers: _context51.t1,
                  method: "DELETE",
                  path: _context51.t2
                };
                _context51.next = 10;
                return _context51.t0.Request.call(_context51.t0, _context51.t3);

              case 10:
              case "end":
                return _context51.stop();
            }
          }
        }, _callee51, this);
      }));

      function DeletePart(_x50) {
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
      regeneratorRuntime.mark(function _callee52(_ref53) {
        var objectId, accessCharge;
        return regeneratorRuntime.wrap(function _callee52$(_context52) {
          while (1) {
            switch (_context52.prev = _context52.next) {
              case 0:
                objectId = _ref53.objectId, accessCharge = _ref53.accessCharge;
                _context52.next = 3;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "setAccessCharge",
                  methodArgs: [Utils.EtherToWei(accessCharge).toString()],
                  signer: this.signer
                });

              case 3:
              case "end":
                return _context52.stop();
            }
          }
        }, _callee52, this);
      }));

      function SetAccessCharge(_x51) {
        return _SetAccessCharge.apply(this, arguments);
      }

      return SetAccessCharge;
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
      regeneratorRuntime.mark(function _callee53(_ref54) {
        var objectId, args, info;
        return regeneratorRuntime.wrap(function _callee53$(_context53) {
          while (1) {
            switch (_context53.prev = _context53.next) {
              case 0:
                objectId = _ref54.objectId, args = _ref54.args;

                if (!args) {
                  args = [0, // Access level
                  [], // Custom values
                  [] // Stakeholders
                  ];
                }

                _context53.next = 4;
                return this.ethClient.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "getAccessInfo",
                  methodArgs: args,
                  signer: this.signer
                });

              case 4:
                info = _context53.sent;
                return _context53.abrupt("return", {
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
                return _context53.stop();
            }
          }
        }, _callee53, this);
      }));

      function AccessInfo(_x52) {
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
      regeneratorRuntime.mark(function _callee54(_ref55) {
        var libraryId, objectId, versionHash, _ref55$args, args, _ref55$update, update, _ref55$noCache, noCache;

        return regeneratorRuntime.wrap(function _callee54$(_context54) {
          while (1) {
            switch (_context54.prev = _context54.next) {
              case 0:
                libraryId = _ref55.libraryId, objectId = _ref55.objectId, versionHash = _ref55.versionHash, _ref55$args = _ref55.args, args = _ref55$args === void 0 ? [] : _ref55$args, _ref55$update = _ref55.update, update = _ref55$update === void 0 ? false : _ref55$update, _ref55$noCache = _ref55.noCache, noCache = _ref55$noCache === void 0 ? false : _ref55$noCache;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context54.next = 4;
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
                return _context54.abrupt("return", _context54.sent);

              case 5:
              case "end":
                return _context54.stop();
            }
          }
        }, _callee54, this);
      }));

      function AccessRequest(_x53) {
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
      regeneratorRuntime.mark(function _callee55(_ref56) {
        var libraryId, objectId, versionHash, cacheResult;
        return regeneratorRuntime.wrap(function _callee55$(_context55) {
          while (1) {
            switch (_context55.prev = _context55.next) {
              case 0:
                libraryId = _ref56.libraryId, objectId = _ref56.objectId, versionHash = _ref56.versionHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context55.next = 4;
                return this.authClient.MakeAccessRequest({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  cacheOnly: true
                });

              case 4:
                cacheResult = _context55.sent;

                if (!cacheResult) {
                  _context55.next = 7;
                  break;
                }

                return _context55.abrupt("return", cacheResult.transactionHash);

              case 7:
              case "end":
                return _context55.stop();
            }
          }
        }, _callee55, this);
      }));

      function CachedAccessTransaction(_x54) {
        return _CachedAccessTransaction.apply(this, arguments);
      }

      return CachedAccessTransaction;
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
      regeneratorRuntime.mark(function _callee56(_ref57) {
        var objectId, _ref57$score, score;

        return regeneratorRuntime.wrap(function _callee56$(_context56) {
          while (1) {
            switch (_context56.prev = _context56.next) {
              case 0:
                objectId = _ref57.objectId, _ref57$score = _ref57.score, score = _ref57$score === void 0 ? 100 : _ref57$score;

                if (!(score < 0 || score > 100)) {
                  _context56.next = 3;
                  break;
                }

                throw Error("Invalid AccessComplete score: " + score);

              case 3:
                _context56.next = 5;
                return this.authClient.AccessComplete({
                  id: objectId,
                  abi: ContentContract.abi,
                  score: score
                });

              case 5:
                return _context56.abrupt("return", _context56.sent);

              case 6:
              case "end":
                return _context56.stop();
            }
          }
        }, _callee56, this);
      }));

      function ContentObjectAccessComplete(_x55) {
        return _ContentObjectAccessComplete.apply(this, arguments);
      }

      return ContentObjectAccessComplete;
    }()
    /* URL Methods */

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
      regeneratorRuntime.mark(function _callee57(_ref58) {
        var versionHash, _ref58$protocols, protocols, _ref58$drms, drms, objectId, path, playoutOptions, playoutMap, i, option, protocol, drm, licenseServers, protocolMatch, drmMatch;

        return regeneratorRuntime.wrap(function _callee57$(_context57) {
          while (1) {
            switch (_context57.prev = _context57.next) {
              case 0:
                versionHash = _ref58.versionHash, _ref58$protocols = _ref58.protocols, protocols = _ref58$protocols === void 0 ? ["dash", "hls"] : _ref58$protocols, _ref58$drms = _ref58.drms, drms = _ref58$drms === void 0 ? [] : _ref58$drms;
                protocols = protocols.map(function (p) {
                  return p.toLowerCase();
                });
                drms = drms.map(function (d) {
                  return d.toLowerCase();
                });
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                path = UrlJoin("q", versionHash, "rep", "playout", "default", "options.json");
                _context57.t0 = Object;
                _context57.t1 = ResponseToJson;
                _context57.t2 = this.HttpClient;
                _context57.next = 10;
                return this.authClient.AuthorizationHeader({
                  objectId: objectId,
                  channelAuth: true,
                  noAuth: true
                });

              case 10:
                _context57.t3 = _context57.sent;
                _context57.t4 = path;
                _context57.t5 = {
                  headers: _context57.t3,
                  method: "GET",
                  path: _context57.t4
                };
                _context57.t6 = _context57.t2.Request.call(_context57.t2, _context57.t5);
                _context57.next = 16;
                return (0, _context57.t1)(_context57.t6);

              case 16:
                _context57.t7 = _context57.sent;
                playoutOptions = _context57.t0.values.call(_context57.t0, _context57.t7);
                playoutMap = {};
                i = 0;

              case 20:
                if (!(i < playoutOptions.length)) {
                  _context57.next = 38;
                  break;
                }

                option = playoutOptions[i];
                protocol = option.properties.protocol;
                drm = option.properties.drm;
                licenseServers = option.properties.license_servers; // Exclude any options that do not satisfy the specified protocols and/or DRMs

                protocolMatch = protocols.includes(protocol);
                drmMatch = drms.includes(drm) || drms.length === 0 && !drm;

                if (!(!protocolMatch || !drmMatch)) {
                  _context57.next = 29;
                  break;
                }

                return _context57.abrupt("continue", 35);

              case 29:
                if (playoutMap[protocol]) {
                  _context57.next = 34;
                  break;
                }

                _context57.next = 32;
                return this.Rep({
                  versionHash: versionHash,
                  rep: UrlJoin("playout", "default", option.uri)
                });

              case 32:
                _context57.t8 = _context57.sent;
                playoutMap[protocol] = {
                  playoutUrl: _context57.t8
                };

              case 34:
                if (drm) {
                  playoutMap[protocol].drms = _objectSpread({}, playoutMap[protocol].drms || {}, _defineProperty({}, drm, {
                    licenseServers: licenseServers
                  }));
                }

              case 35:
                i++;
                _context57.next = 20;
                break;

              case 38:
                return _context57.abrupt("return", playoutMap);

              case 39:
              case "end":
                return _context57.stop();
            }
          }
        }, _callee57, this);
      }));

      function PlayoutOptions(_x56) {
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
      regeneratorRuntime.mark(function _callee58(_ref59) {
        var _this5 = this;

        var versionHash, _ref59$protocols, protocols, _ref59$drms, drms, objectId, playoutOptions, config;

        return regeneratorRuntime.wrap(function _callee58$(_context58) {
          while (1) {
            switch (_context58.prev = _context58.next) {
              case 0:
                versionHash = _ref59.versionHash, _ref59$protocols = _ref59.protocols, protocols = _ref59$protocols === void 0 ? ["dash", "hls"] : _ref59$protocols, _ref59$drms = _ref59.drms, drms = _ref59$drms === void 0 ? [] : _ref59$drms;
                objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                _context58.next = 4;
                return this.PlayoutOptions({
                  versionHash: versionHash,
                  protocols: protocols,
                  drms: drms
                });

              case 4:
                playoutOptions = _context58.sent;
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
                return _context58.abrupt("return", config);

              case 8:
              case "end":
                return _context58.stop();
            }
          }
        }, _callee58, this);
      }));

      function BitmovinPlayoutOptions(_x57) {
        return _BitmovinPlayoutOptions.apply(this, arguments);
      }

      return BitmovinPlayoutOptions;
    }()
    /**
     * Generate a URL to the specified /call endpoint of a content object to call a bitcode method.
     * URL includes authorization token.
     *
     * Alias for the FabricUrl method with the "call" parameter
     *
     * @methodGroup URL Generation
     * @namedParams
     * @param {string=} libraryId - ID of the library
     * @param {string=} objectId - ID of the object
     * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
     * @param {string} method - Bitcode method to call
     * @param {Object=} queryParams - Query params to add to the URL
     * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
     * token. This is useful for accessing public assets.
     * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of whether such a request exists in the client cache. This request will not be cached.
     *
     * @see FabricUrl for creating arbitrary fabric URLs
     *
     * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
     */

  }, {
    key: "BitcodeMethodUrl",
    value: function () {
      var _BitcodeMethodUrl = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee59(_ref60) {
        var libraryId, objectId, versionHash, method, _ref60$queryParams, queryParams, _ref60$noAuth, noAuth, _ref60$noCache, noCache;

        return regeneratorRuntime.wrap(function _callee59$(_context59) {
          while (1) {
            switch (_context59.prev = _context59.next) {
              case 0:
                libraryId = _ref60.libraryId, objectId = _ref60.objectId, versionHash = _ref60.versionHash, method = _ref60.method, _ref60$queryParams = _ref60.queryParams, queryParams = _ref60$queryParams === void 0 ? {} : _ref60$queryParams, _ref60$noAuth = _ref60.noAuth, noAuth = _ref60$noAuth === void 0 ? false : _ref60$noAuth, _ref60$noCache = _ref60.noCache, noCache = _ref60$noCache === void 0 ? false : _ref60$noCache;
                return _context59.abrupt("return", this.FabricUrl({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  call: method,
                  queryParams: queryParams,
                  noAuth: noAuth,
                  noCache: noCache
                }));

              case 2:
              case "end":
                return _context59.stop();
            }
          }
        }, _callee59, this);
      }));

      function BitcodeMethodUrl(_x58) {
        return _BitcodeMethodUrl.apply(this, arguments);
      }

      return BitcodeMethodUrl;
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
      regeneratorRuntime.mark(function _callee60(_ref61) {
        var libraryId, objectId, versionHash, rep, _ref61$queryParams, queryParams, _ref61$noAuth, noAuth, _ref61$noCache, noCache;

        return regeneratorRuntime.wrap(function _callee60$(_context60) {
          while (1) {
            switch (_context60.prev = _context60.next) {
              case 0:
                libraryId = _ref61.libraryId, objectId = _ref61.objectId, versionHash = _ref61.versionHash, rep = _ref61.rep, _ref61$queryParams = _ref61.queryParams, queryParams = _ref61$queryParams === void 0 ? {} : _ref61$queryParams, _ref61$noAuth = _ref61.noAuth, noAuth = _ref61$noAuth === void 0 ? false : _ref61$noAuth, _ref61$noCache = _ref61.noCache, noCache = _ref61$noCache === void 0 ? false : _ref61$noCache;
                return _context60.abrupt("return", this.FabricUrl({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  rep: rep,
                  queryParams: queryParams,
                  channelAuth: true,
                  noAuth: noAuth,
                  noCache: noCache
                }));

              case 2:
              case "end":
                return _context60.stop();
            }
          }
        }, _callee60, this);
      }));

      function Rep(_x59) {
        return _Rep.apply(this, arguments);
      }

      return Rep;
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
     * @param {string=} call - Bitcode method to call
     * @param {Object=} queryParams - Query params to add to the URL
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
      regeneratorRuntime.mark(function _callee61(_ref62) {
        var libraryId, objectId, versionHash, partHash, rep, call, _ref62$queryParams, queryParams, _ref62$channelAuth, channelAuth, _ref62$noAuth, noAuth, _ref62$noCache, noCache, path;

        return regeneratorRuntime.wrap(function _callee61$(_context61) {
          while (1) {
            switch (_context61.prev = _context61.next) {
              case 0:
                libraryId = _ref62.libraryId, objectId = _ref62.objectId, versionHash = _ref62.versionHash, partHash = _ref62.partHash, rep = _ref62.rep, call = _ref62.call, _ref62$queryParams = _ref62.queryParams, queryParams = _ref62$queryParams === void 0 ? {} : _ref62$queryParams, _ref62$channelAuth = _ref62.channelAuth, channelAuth = _ref62$channelAuth === void 0 ? false : _ref62$channelAuth, _ref62$noAuth = _ref62.noAuth, noAuth = _ref62$noAuth === void 0 ? false : _ref62$noAuth, _ref62$noCache = _ref62.noCache, noCache = _ref62$noCache === void 0 ? false : _ref62$noCache;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                } // Clone queryParams to avoid modification of the original


                queryParams = _objectSpread({}, queryParams);
                path = "";

                if (!libraryId) {
                  _context61.next = 13;
                  break;
                }

                path = UrlJoin(path, "qlibs", libraryId);

                if (objectId || versionHash) {
                  path = UrlJoin(path, "q", versionHash || objectId);

                  if (partHash) {
                    path = UrlJoin(path, "data", partHash);
                  } else if (rep) {
                    path = UrlJoin(path, "rep", rep);
                  } else if (call) {
                    path = UrlJoin(path, "call", call);
                  }
                }

                if (noAuth) {
                  _context61.next = 11;
                  break;
                }

                _context61.next = 10;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  channelAuth: channelAuth,
                  noCache: noCache
                });

              case 10:
                queryParams.authorization = _context61.sent;

              case 11:
                _context61.next = 20;
                break;

              case 13:
                if (!versionHash) {
                  _context61.next = 20;
                  break;
                }

                path = UrlJoin("q", versionHash);

                if (noAuth) {
                  _context61.next = 19;
                  break;
                }

                _context61.next = 18;
                return this.authClient.AuthorizationToken({
                  objectId: objectId,
                  versionHash: versionHash,
                  channelAuth: channelAuth,
                  noCache: noCache
                });

              case 18:
                queryParams.authorization = _context61.sent;

              case 19:
                if (partHash) {
                  path = UrlJoin(path, "data", partHash);
                } else if (rep) {
                  path = UrlJoin(path, "rep", rep);
                } else if (call) {
                  path = UrlJoin(path, "call", call);
                }

              case 20:
                return _context61.abrupt("return", this.HttpClient.URL({
                  path: path,
                  queryParams: queryParams
                }));

              case 21:
              case "end":
                return _context61.stop();
            }
          }
        }, _callee61, this);
      }));

      function FabricUrl(_x60) {
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
      regeneratorRuntime.mark(function _callee62(_ref63) {
        var libraryId, objectId, versionHash, filePath, _ref63$queryParams, queryParams, _ref63$noCache, noCache, path, authorizationToken;

        return regeneratorRuntime.wrap(function _callee62$(_context62) {
          while (1) {
            switch (_context62.prev = _context62.next) {
              case 0:
                libraryId = _ref63.libraryId, objectId = _ref63.objectId, versionHash = _ref63.versionHash, filePath = _ref63.filePath, _ref63$queryParams = _ref63.queryParams, queryParams = _ref63$queryParams === void 0 ? {} : _ref63$queryParams, _ref63$noCache = _ref63.noCache, noCache = _ref63$noCache === void 0 ? false : _ref63$noCache;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                if (libraryId) {
                  path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, "files", filePath);
                } else {
                  path = UrlJoin("q", versionHash, "files", filePath);
                }

                _context62.next = 5;
                return this.authClient.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  noCache: noCache
                });

              case 5:
                authorizationToken = _context62.sent;
                return _context62.abrupt("return", this.HttpClient.URL({
                  path: path,
                  queryParams: _objectSpread({}, queryParams, {
                    authorization: authorizationToken
                  })
                }));

              case 7:
              case "end":
                return _context62.stop();
            }
          }
        }, _callee62, this);
      }));

      function FileUrl(_x61) {
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
     *
     * @returns {Promise<string>} - Contract address of created access group
     */

  }, {
    key: "CreateAccessGroup",
    value: function () {
      var _CreateAccessGroup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee63() {
        var _ref64, contractAddress;

        return regeneratorRuntime.wrap(function _callee63$(_context63) {
          while (1) {
            switch (_context63.prev = _context63.next) {
              case 0:
                _context63.next = 2;
                return this.authClient.CreateAccessGroup();

              case 2:
                _ref64 = _context63.sent;
                contractAddress = _ref64.contractAddress;
                return _context63.abrupt("return", contractAddress);

              case 5:
              case "end":
                return _context63.stop();
            }
          }
        }, _callee63, this);
      }));

      function CreateAccessGroup() {
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
      regeneratorRuntime.mark(function _callee64(_ref65) {
        var contractAddress;
        return regeneratorRuntime.wrap(function _callee64$(_context64) {
          while (1) {
            switch (_context64.prev = _context64.next) {
              case 0:
                contractAddress = _ref65.contractAddress;
                _context64.next = 3;
                return this.ethClient.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "owner",
                  methodArgs: [],
                  signer: this.signer
                });

              case 3:
                return _context64.abrupt("return", _context64.sent);

              case 4:
              case "end":
                return _context64.stop();
            }
          }
        }, _callee64, this);
      }));

      function AccessGroupOwner(_x62) {
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
      regeneratorRuntime.mark(function _callee65(_ref66) {
        var contractAddress;
        return regeneratorRuntime.wrap(function _callee65$(_context65) {
          while (1) {
            switch (_context65.prev = _context65.next) {
              case 0:
                contractAddress = _ref66.contractAddress;
                _context65.next = 3;
                return this.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "kill",
                  methodArgs: []
                });

              case 3:
              case "end":
                return _context65.stop();
            }
          }
        }, _callee65, this);
      }));

      function DeleteAccessGroup(_x63) {
        return _DeleteAccessGroup.apply(this, arguments);
      }

      return DeleteAccessGroup;
    }()
  }, {
    key: "AccessGroupMembershipMethod",
    value: function () {
      var _AccessGroupMembershipMethod = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee66(_ref67) {
        var contractAddress, memberAddress, methodName, eventName, isManager, event, candidate;
        return regeneratorRuntime.wrap(function _callee66$(_context66) {
          while (1) {
            switch (_context66.prev = _context66.next) {
              case 0:
                contractAddress = _ref67.contractAddress, memberAddress = _ref67.memberAddress, methodName = _ref67.methodName, eventName = _ref67.eventName;

                // Ensure address starts with 0x
                if (!memberAddress.startsWith("0x")) {
                  memberAddress = "0x" + memberAddress;
                } // Ensure caller is a manager of the group


                _context66.next = 4;
                return this.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: "hasManagerAccess",
                  methodArgs: [this.signer.address.toLowerCase()]
                });

              case 4:
                isManager = _context66.sent;

                if (isManager) {
                  _context66.next = 7;
                  break;
                }

                throw Error("Manager access required");

              case 7:
                _context66.next = 9;
                return this.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: AccessGroupContract.abi,
                  methodName: methodName,
                  methodArgs: [memberAddress.toLowerCase()],
                  eventName: eventName,
                  eventValue: "candidate"
                });

              case 9:
                event = _context66.sent;
                candidate = this.ExtractValueFromEvent({
                  abi: AccessGroupContract.abi,
                  event: event,
                  eventName: eventName,
                  eventValue: "candidate"
                });

                if (!(this.utils.FormatAddress(candidate) !== this.utils.FormatAddress(memberAddress))) {
                  _context66.next = 14;
                  break;
                }

                // eslint-disable-next-line no-console
                console.error("Mismatch: " + candidate + " :: " + memberAddress);
                throw Error("Access group method " + methodName + " failed");

              case 14:
                return _context66.abrupt("return", event.transactionHash);

              case 15:
              case "end":
                return _context66.stop();
            }
          }
        }, _callee66, this);
      }));

      function AccessGroupMembershipMethod(_x64) {
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
      regeneratorRuntime.mark(function _callee67(_ref68) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee67$(_context67) {
          while (1) {
            switch (_context67.prev = _context67.next) {
              case 0:
                contractAddress = _ref68.contractAddress, memberAddress = _ref68.memberAddress;
                _context67.next = 3;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "grantAccess",
                  eventName: "MemberAdded"
                });

              case 3:
                return _context67.abrupt("return", _context67.sent);

              case 4:
              case "end":
                return _context67.stop();
            }
          }
        }, _callee67, this);
      }));

      function AddAccessGroupMember(_x65) {
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
      regeneratorRuntime.mark(function _callee68(_ref69) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee68$(_context68) {
          while (1) {
            switch (_context68.prev = _context68.next) {
              case 0:
                contractAddress = _ref69.contractAddress, memberAddress = _ref69.memberAddress;
                _context68.next = 3;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "revokeAccess",
                  eventName: "MemberRevoked"
                });

              case 3:
                return _context68.abrupt("return", _context68.sent);

              case 4:
              case "end":
                return _context68.stop();
            }
          }
        }, _callee68, this);
      }));

      function RemoveAccessGroupMember(_x66) {
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
      regeneratorRuntime.mark(function _callee69(_ref70) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee69$(_context69) {
          while (1) {
            switch (_context69.prev = _context69.next) {
              case 0:
                contractAddress = _ref70.contractAddress, memberAddress = _ref70.memberAddress;
                _context69.next = 3;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "grantManagerAccess",
                  eventName: "ManagerAccessGranted"
                });

              case 3:
                return _context69.abrupt("return", _context69.sent);

              case 4:
              case "end":
                return _context69.stop();
            }
          }
        }, _callee69, this);
      }));

      function AddAccessGroupManager(_x67) {
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
      regeneratorRuntime.mark(function _callee70(_ref71) {
        var contractAddress, memberAddress;
        return regeneratorRuntime.wrap(function _callee70$(_context70) {
          while (1) {
            switch (_context70.prev = _context70.next) {
              case 0:
                contractAddress = _ref71.contractAddress, memberAddress = _ref71.memberAddress;
                _context70.next = 3;
                return this.AccessGroupMembershipMethod({
                  contractAddress: contractAddress,
                  memberAddress: memberAddress,
                  methodName: "revokeManagerAccess",
                  eventName: "ManagerAccessRevoked"
                });

              case 3:
                return _context70.abrupt("return", _context70.sent);

              case 4:
              case "end":
                return _context70.stop();
            }
          }
        }, _callee70, this);
      }));

      function RemoveAccessGroupManager(_x68) {
        return _RemoveAccessGroupManager.apply(this, arguments);
      }

      return RemoveAccessGroupManager;
    }()
    /* Collection / Access Indexor methods */

  }, {
    key: "ContractCollection",
    value: function () {
      var _ContractCollection = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee72(_ref72) {
        var _this6 = this;

        var contractAddress, abi, lengthMethod, itemMethod, nCollection;
        return regeneratorRuntime.wrap(function _callee72$(_context72) {
          while (1) {
            switch (_context72.prev = _context72.next) {
              case 0:
                contractAddress = _ref72.contractAddress, abi = _ref72.abi, lengthMethod = _ref72.lengthMethod, itemMethod = _ref72.itemMethod;
                _context72.next = 3;
                return this.CallContractMethod({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: lengthMethod
                });

              case 3:
                nCollection = _context72.sent.toNumber();
                _context72.next = 6;
                return Promise.all(_toConsumableArray(Array(nCollection)).map(
                /*#__PURE__*/
                function () {
                  var _ref73 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee71(_, i) {
                    var itemAddress;
                    return regeneratorRuntime.wrap(function _callee71$(_context71) {
                      while (1) {
                        switch (_context71.prev = _context71.next) {
                          case 0:
                            _context71.next = 2;
                            return _this6.CallContractMethod({
                              contractAddress: contractAddress,
                              abi: abi,
                              methodName: itemMethod,
                              methodArgs: [i]
                            });

                          case 2:
                            itemAddress = _context71.sent;
                            return _context71.abrupt("return", itemAddress);

                          case 4:
                          case "end":
                            return _context71.stop();
                        }
                      }
                    }, _callee71);
                  }));

                  return function (_x70, _x71) {
                    return _ref73.apply(this, arguments);
                  };
                }()));

              case 6:
                return _context72.abrupt("return", _context72.sent);

              case 7:
              case "end":
                return _context72.stop();
            }
          }
        }, _callee72, this);
      }));

      function ContractCollection(_x69) {
        return _ContractCollection.apply(this, arguments);
      }

      return ContractCollection;
    }()
  }, {
    key: "CollectionMethods",
    value: function CollectionMethods(collectionType) {
      var lengthMethod, itemMethod;

      switch (collectionType) {
        case "accessGroups":
          lengthMethod = "getAccessGroupsLength";
          itemMethod = "getAccessGroup";
          break;

        case "contentObjects":
          lengthMethod = "getContentObjectsLength";
          itemMethod = "getContentObject";
          break;

        case "contentTypes":
          lengthMethod = "getContentTypesLength";
          itemMethod = "getContentType";
          break;

        case "contracts":
          lengthMethod = "getContractsLength";
          itemMethod = "getContract";
          break;

        case "libraries":
          lengthMethod = "getLibrariesLength";
          itemMethod = "getLibrary";
          break;

        default:
          throw Error("Invalid access group collection type: " + collectionType);
      }

      return {
        lengthMethod: lengthMethod,
        itemMethod: itemMethod
      };
    }
    /**
     * Get a list of addresses of all of the specified type the current user has access
     * to through their user wallet
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
    key: "WalletCollection",
    value: function () {
      var _WalletCollection = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee73(_ref74) {
        var collectionType, _this$CollectionMetho, lengthMethod, itemMethod;

        return regeneratorRuntime.wrap(function _callee73$(_context73) {
          while (1) {
            switch (_context73.prev = _context73.next) {
              case 0:
                collectionType = _ref74.collectionType;
                _this$CollectionMetho = this.CollectionMethods(collectionType), lengthMethod = _this$CollectionMetho.lengthMethod, itemMethod = _this$CollectionMetho.itemMethod;
                _context73.next = 4;
                return this.ContractCollection({
                  contractAddress: this.walletAddress,
                  abi: WalletContract.abi,
                  lengthMethod: lengthMethod,
                  itemMethod: itemMethod
                });

              case 4:
                return _context73.abrupt("return", _context73.sent);

              case 5:
              case "end":
                return _context73.stop();
            }
          }
        }, _callee73, this);
      }));

      function WalletCollection(_x72) {
        return _WalletCollection.apply(this, arguments);
      }

      return WalletCollection;
    }()
    /**
     * Get a list of addresses of all of the specified type the current user has access
     * to through access groups
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
    key: "AccessGroupsCollection",
    value: function () {
      var _AccessGroupsCollection = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee75(_ref75) {
        var _this7 = this;

        var collectionType, _this$CollectionMetho2, lengthMethod, itemMethod, accessGroups, collections;

        return regeneratorRuntime.wrap(function _callee75$(_context75) {
          while (1) {
            switch (_context75.prev = _context75.next) {
              case 0:
                collectionType = _ref75.collectionType;
                _this$CollectionMetho2 = this.CollectionMethods(collectionType), lengthMethod = _this$CollectionMetho2.lengthMethod, itemMethod = _this$CollectionMetho2.itemMethod;
                _context75.next = 4;
                return this.ContractCollection({
                  contractAddress: this.walletAddress,
                  abi: WalletContract.abi,
                  lengthMethod: "getAccessGroupsLength",
                  itemMethod: "getAccessGroup"
                });

              case 4:
                accessGroups = _context75.sent;
                _context75.next = 7;
                return Promise.all(accessGroups.map(
                /*#__PURE__*/
                function () {
                  var _ref76 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee74(accessGroupAddress) {
                    return regeneratorRuntime.wrap(function _callee74$(_context74) {
                      while (1) {
                        switch (_context74.prev = _context74.next) {
                          case 0:
                            _context74.next = 2;
                            return _this7.ContractCollection({
                              contractAddress: accessGroupAddress,
                              abi: AccessGroupContract.abi,
                              lengthMethod: lengthMethod,
                              itemMethod: itemMethod
                            });

                          case 2:
                            return _context74.abrupt("return", _context74.sent);

                          case 3:
                          case "end":
                            return _context74.stop();
                        }
                      }
                    }, _callee74);
                  }));

                  return function (_x74) {
                    return _ref76.apply(this, arguments);
                  };
                }()));

              case 7:
                collections = _context75.sent;
                return _context75.abrupt("return", collections.flat());

              case 9:
              case "end":
                return _context75.stop();
            }
          }
        }, _callee75, this);
      }));

      function AccessGroupsCollection(_x73) {
        return _AccessGroupsCollection.apply(this, arguments);
      }

      return AccessGroupsCollection;
    }()
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
      regeneratorRuntime.mark(function _callee76(_ref77) {
        var collectionType;
        return regeneratorRuntime.wrap(function _callee76$(_context76) {
          while (1) {
            switch (_context76.prev = _context76.next) {
              case 0:
                collectionType = _ref77.collectionType;
                _context76.next = 3;
                return this.WalletCollection({
                  collectionType: collectionType
                });

              case 3:
                _context76.t0 = _context76.sent;
                _context76.next = 6;
                return this.AccessGroupsCollection({
                  collectionType: collectionType
                });

              case 6:
                _context76.t1 = _context76.sent;

                _context76.t2 = function (v, i, s) {
                  return s.indexOf(v) === i;
                };

                return _context76.abrupt("return", _context76.t0.concat.call(_context76.t0, _context76.t1).filter(_context76.t2));

              case 9:
              case "end":
                return _context76.stop();
            }
          }
        }, _callee76, this);
      }));

      function Collection(_x75) {
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
      regeneratorRuntime.mark(function _callee77(_ref78) {
        var libraryId, objectId, versionHash;
        return regeneratorRuntime.wrap(function _callee77$(_context77) {
          while (1) {
            switch (_context77.prev = _context77.next) {
              case 0:
                libraryId = _ref78.libraryId, objectId = _ref78.objectId, versionHash = _ref78.versionHash;
                _context77.next = 3;
                return ContentObjectVerification.VerifyContentObject({
                  client: this,
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 3:
                return _context77.abrupt("return", _context77.sent);

              case 4:
              case "end":
                return _context77.stop();
            }
          }
        }, _callee77, this);
      }));

      function VerifyContentObject(_x76) {
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
      regeneratorRuntime.mark(function _callee78(_ref79) {
        var libraryId, objectId, versionHash, partHash, path;
        return regeneratorRuntime.wrap(function _callee78$(_context78) {
          while (1) {
            switch (_context78.prev = _context78.next) {
              case 0:
                libraryId = _ref79.libraryId, objectId = _ref79.objectId, versionHash = _ref79.versionHash, partHash = _ref79.partHash;

                if (versionHash) {
                  objectId = this.utils.DecodeVersionHash(versionHash).objectId;
                }

                path = UrlJoin("q", versionHash || objectId, "data", partHash, "proofs");
                _context78.t0 = ResponseToJson;
                _context78.t1 = this.HttpClient;
                _context78.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 7:
                _context78.t2 = _context78.sent;
                _context78.t3 = path;
                _context78.t4 = {
                  headers: _context78.t2,
                  method: "GET",
                  path: _context78.t3
                };
                _context78.t5 = _context78.t1.Request.call(_context78.t1, _context78.t4);
                return _context78.abrupt("return", (0, _context78.t0)(_context78.t5));

              case 12:
              case "end":
                return _context78.stop();
            }
          }
        }, _callee78, this);
      }));

      function Proofs(_x77) {
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
      regeneratorRuntime.mark(function _callee79(_ref80) {
        var libraryId, objectId, partHash, _ref80$format, format, path;

        return regeneratorRuntime.wrap(function _callee79$(_context79) {
          while (1) {
            switch (_context79.prev = _context79.next) {
              case 0:
                libraryId = _ref80.libraryId, objectId = _ref80.objectId, partHash = _ref80.partHash, _ref80$format = _ref80.format, format = _ref80$format === void 0 ? "blob" : _ref80$format;
                path = UrlJoin("qparts", partHash);
                _context79.t0 = ResponseToFormat;
                _context79.t1 = format;
                _context79.t2 = this.HttpClient;
                _context79.next = 7;
                return this.authClient.AuthorizationHeader({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 7:
                _context79.t3 = _context79.sent;
                _context79.t4 = path;
                _context79.t5 = {
                  headers: _context79.t3,
                  method: "GET",
                  path: _context79.t4
                };
                _context79.t6 = _context79.t2.Request.call(_context79.t2, _context79.t5);
                return _context79.abrupt("return", (0, _context79.t0)(_context79.t1, _context79.t6));

              case 12:
              case "end":
                return _context79.stop();
            }
          }
        }, _callee79, this);
      }));

      function QParts(_x78) {
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
    value: function FormatContractArguments(_ref81) {
      var abi = _ref81.abi,
          methodName = _ref81.methodName,
          args = _ref81.args;
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
      regeneratorRuntime.mark(function _callee80(_ref82) {
        var abi, bytecode, constructorArgs, _ref82$overrides, overrides;

        return regeneratorRuntime.wrap(function _callee80$(_context80) {
          while (1) {
            switch (_context80.prev = _context80.next) {
              case 0:
                abi = _ref82.abi, bytecode = _ref82.bytecode, constructorArgs = _ref82.constructorArgs, _ref82$overrides = _ref82.overrides, overrides = _ref82$overrides === void 0 ? {} : _ref82$overrides;
                _context80.next = 3;
                return this.ethClient.DeployContract({
                  abi: abi,
                  bytecode: bytecode,
                  constructorArgs: constructorArgs,
                  overrides: overrides,
                  signer: this.signer
                });

              case 3:
                return _context80.abrupt("return", _context80.sent);

              case 4:
              case "end":
                return _context80.stop();
            }
          }
        }, _callee80, this);
      }));

      function DeployContract(_x79) {
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
      regeneratorRuntime.mark(function _callee81(_ref83) {
        var contractAddress, abi, methodName, _ref83$methodArgs, methodArgs, value, _ref83$overrides, overrides, _ref83$formatArgument, formatArguments;

        return regeneratorRuntime.wrap(function _callee81$(_context81) {
          while (1) {
            switch (_context81.prev = _context81.next) {
              case 0:
                contractAddress = _ref83.contractAddress, abi = _ref83.abi, methodName = _ref83.methodName, _ref83$methodArgs = _ref83.methodArgs, methodArgs = _ref83$methodArgs === void 0 ? [] : _ref83$methodArgs, value = _ref83.value, _ref83$overrides = _ref83.overrides, overrides = _ref83$overrides === void 0 ? {} : _ref83$overrides, _ref83$formatArgument = _ref83.formatArguments, formatArguments = _ref83$formatArgument === void 0 ? true : _ref83$formatArgument;
                _context81.next = 3;
                return this.ethClient.CallContractMethod({
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
                return _context81.abrupt("return", _context81.sent);

              case 4:
              case "end":
                return _context81.stop();
            }
          }
        }, _callee81, this);
      }));

      function CallContractMethod(_x80) {
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
      regeneratorRuntime.mark(function _callee82(_ref84) {
        var contractAddress, abi, methodName, methodArgs, value, _ref84$overrides, overrides, _ref84$formatArgument, formatArguments;

        return regeneratorRuntime.wrap(function _callee82$(_context82) {
          while (1) {
            switch (_context82.prev = _context82.next) {
              case 0:
                contractAddress = _ref84.contractAddress, abi = _ref84.abi, methodName = _ref84.methodName, methodArgs = _ref84.methodArgs, value = _ref84.value, _ref84$overrides = _ref84.overrides, overrides = _ref84$overrides === void 0 ? {} : _ref84$overrides, _ref84$formatArgument = _ref84.formatArguments, formatArguments = _ref84$formatArgument === void 0 ? true : _ref84$formatArgument;
                _context82.next = 3;
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
                return _context82.abrupt("return", _context82.sent);

              case 4:
              case "end":
                return _context82.stop();
            }
          }
        }, _callee82, this);
      }));

      function CallContractMethodAndWait(_x81) {
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
    value: function ExtractEventFromLogs(_ref85) {
      var abi = _ref85.abi,
          event = _ref85.event,
          eventName = _ref85.eventName;
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
    value: function ExtractValueFromEvent(_ref86) {
      var abi = _ref86.abi,
          event = _ref86.event,
          eventName = _ref86.eventName,
          eventValue = _ref86.eventValue;
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
      regeneratorRuntime.mark(function _callee83(_ref87) {
        var libraryId, objectId, customContractAddress, name, description, abi, factoryAbi, _ref87$overrides, overrides, setResult, writeToken;

        return regeneratorRuntime.wrap(function _callee83$(_context83) {
          while (1) {
            switch (_context83.prev = _context83.next) {
              case 0:
                libraryId = _ref87.libraryId, objectId = _ref87.objectId, customContractAddress = _ref87.customContractAddress, name = _ref87.name, description = _ref87.description, abi = _ref87.abi, factoryAbi = _ref87.factoryAbi, _ref87$overrides = _ref87.overrides, overrides = _ref87$overrides === void 0 ? {} : _ref87$overrides;
                customContractAddress = this.utils.FormatAddress(customContractAddress);
                _context83.next = 4;
                return this.ethClient.SetCustomContentContract({
                  contentContractAddress: Utils.HashToAddress(objectId),
                  customContractAddress: customContractAddress,
                  overrides: overrides,
                  signer: this.signer
                });

              case 4:
                setResult = _context83.sent;
                _context83.next = 7;
                return this.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 7:
                writeToken = _context83.sent.write_token;
                _context83.next = 10;
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
                _context83.next = 12;
                return this.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: writeToken
                });

              case 12:
                return _context83.abrupt("return", setResult);

              case 13:
              case "end":
                return _context83.stop();
            }
          }
        }, _callee83, this);
      }));

      function SetCustomContentContract(_x82) {
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
      regeneratorRuntime.mark(function _callee84(_ref88) {
        var libraryId, objectId, customContractAddress;
        return regeneratorRuntime.wrap(function _callee84$(_context84) {
          while (1) {
            switch (_context84.prev = _context84.next) {
              case 0:
                libraryId = _ref88.libraryId, objectId = _ref88.objectId;

                if (!(libraryId === this.contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId))) {
                  _context84.next = 3;
                  break;
                }

                return _context84.abrupt("return");

              case 3:
                _context84.next = 5;
                return this.ethClient.CallContractMethod({
                  contractAddress: this.utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "contentContractAddress",
                  methodArgs: [],
                  signer: this.signer
                });

              case 5:
                customContractAddress = _context84.sent;

                if (!(customContractAddress === this.utils.nullAddress)) {
                  _context84.next = 8;
                  break;
                }

                return _context84.abrupt("return");

              case 8:
                return _context84.abrupt("return", this.utils.FormatAddress(customContractAddress));

              case 9:
              case "end":
                return _context84.stop();
            }
          }
        }, _callee84, this);
      }));

      function CustomContractAddress(_x83) {
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
      regeneratorRuntime.mark(function _callee85(_ref89) {
        var contractAddress, abi, _ref89$fromBlock, fromBlock, toBlock, _ref89$includeTransac, includeTransaction;

        return regeneratorRuntime.wrap(function _callee85$(_context85) {
          while (1) {
            switch (_context85.prev = _context85.next) {
              case 0:
                contractAddress = _ref89.contractAddress, abi = _ref89.abi, _ref89$fromBlock = _ref89.fromBlock, fromBlock = _ref89$fromBlock === void 0 ? 0 : _ref89$fromBlock, toBlock = _ref89.toBlock, _ref89$includeTransac = _ref89.includeTransaction, includeTransaction = _ref89$includeTransac === void 0 ? false : _ref89$includeTransac;
                _context85.next = 3;
                return this.ethClient.ContractEvents({
                  contractAddress: contractAddress,
                  abi: abi,
                  fromBlock: fromBlock,
                  toBlock: toBlock,
                  includeTransaction: includeTransaction
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

      function ContractEvents(_x84) {
        return _ContractEvents.apply(this, arguments);
      }

      return ContractEvents;
    }() // TODO: Not implemented in contracts

  }, {
    key: "WithdrawContractFunds",
    value: function () {
      var _WithdrawContractFunds = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee86(_ref90) {
        var contractAddress, abi, ether;
        return regeneratorRuntime.wrap(function _callee86$(_context86) {
          while (1) {
            switch (_context86.prev = _context86.next) {
              case 0:
                contractAddress = _ref90.contractAddress, abi = _ref90.abi, ether = _ref90.ether;
                _context86.next = 3;
                return this.ethClient.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: "transfer",
                  methodArgs: [this.signer.address, Ethers.utils.parseEther(ether.toString())],
                  signer: this.signer
                });

              case 3:
                return _context86.abrupt("return", _context86.sent);

              case 4:
              case "end":
                return _context86.stop();
            }
          }
        }, _callee86, this);
      }));

      function WithdrawContractFunds(_x85) {
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
      regeneratorRuntime.mark(function _callee87() {
        var _ref91,
            toBlock,
            fromBlock,
            _ref91$count,
            count,
            _ref91$includeTransac,
            includeTransaction,
            latestBlock,
            _args87 = arguments;

        return regeneratorRuntime.wrap(function _callee87$(_context87) {
          while (1) {
            switch (_context87.prev = _context87.next) {
              case 0:
                _ref91 = _args87.length > 0 && _args87[0] !== undefined ? _args87[0] : {}, toBlock = _ref91.toBlock, fromBlock = _ref91.fromBlock, _ref91$count = _ref91.count, count = _ref91$count === void 0 ? 10 : _ref91$count, _ref91$includeTransac = _ref91.includeTransaction, includeTransaction = _ref91$includeTransac === void 0 ? false : _ref91$includeTransac;
                _context87.next = 3;
                return this.BlockNumber();

              case 3:
                latestBlock = _context87.sent;

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
                  _context87.next = 9;
                  break;
                }

                return _context87.abrupt("return", []);

              case 9:
                _context87.next = 11;
                return this.ethClient.Events({
                  toBlock: toBlock,
                  fromBlock: fromBlock,
                  includeTransaction: includeTransaction
                });

              case 11:
                return _context87.abrupt("return", _context87.sent);

              case 12:
              case "end":
                return _context87.stop();
            }
          }
        }, _callee87, this);
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
      regeneratorRuntime.mark(function _callee88() {
        return regeneratorRuntime.wrap(function _callee88$(_context88) {
          while (1) {
            switch (_context88.prev = _context88.next) {
              case 0:
                _context88.next = 2;
                return this.ethClient.MakeProviderCall({
                  methodName: "getBlockNumber"
                });

              case 2:
                return _context88.abrupt("return", _context88.sent);

              case 3:
              case "end":
                return _context88.stop();
            }
          }
        }, _callee88, this);
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
     * @returns {Promise<number>} - Balance of the account, in ether
     */

  }, {
    key: "GetBalance",
    value: function () {
      var _GetBalance = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee89(_ref92) {
        var address, balance;
        return regeneratorRuntime.wrap(function _callee89$(_context89) {
          while (1) {
            switch (_context89.prev = _context89.next) {
              case 0:
                address = _ref92.address;
                _context89.next = 3;
                return this.ethClient.MakeProviderCall({
                  methodName: "getBalance",
                  args: [address]
                });

              case 3:
                balance = _context89.sent;
                _context89.next = 6;
                return Ethers.utils.formatEther(balance);

              case 6:
                return _context89.abrupt("return", _context89.sent);

              case 7:
              case "end":
                return _context89.stop();
            }
          }
        }, _callee89, this);
      }));

      function GetBalance(_x86) {
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
      regeneratorRuntime.mark(function _callee90(_ref93) {
        var recipient, ether, transaction;
        return regeneratorRuntime.wrap(function _callee90$(_context90) {
          while (1) {
            switch (_context90.prev = _context90.next) {
              case 0:
                recipient = _ref93.recipient, ether = _ref93.ether;
                _context90.next = 3;
                return this.signer.sendTransaction({
                  to: recipient,
                  value: Ethers.utils.parseEther(ether.toString())
                });

              case 3:
                transaction = _context90.sent;
                _context90.next = 6;
                return transaction.wait();

              case 6:
                return _context90.abrupt("return", _context90.sent);

              case 7:
              case "end":
                return _context90.stop();
            }
          }
        }, _callee90, this);
      }));

      function SendFunds(_x87) {
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
      regeneratorRuntime.mark(function _callee91(message, Respond) {
        var _this8 = this;

        var callback, method, methodResults, responseError;
        return regeneratorRuntime.wrap(function _callee91$(_context91) {
          while (1) {
            switch (_context91.prev = _context91.next) {
              case 0:
                if (!(message.type !== "ElvFrameRequest")) {
                  _context91.next = 2;
                  break;
                }

                return _context91.abrupt("return");

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

                _context91.prev = 3;
                method = message.calledMethod;

                if (!(message.module === "userProfile")) {
                  _context91.next = 13;
                  break;
                }

                if (this.userProfile.FrameAllowedMethods().includes(method)) {
                  _context91.next = 8;
                  break;
                }

                throw Error("Invalid user profile method: " + method);

              case 8:
                _context91.next = 10;
                return this.userProfile[method](message.args);

              case 10:
                methodResults = _context91.sent;
                _context91.next = 18;
                break;

              case 13:
                if (this.FrameAllowedMethods().includes(method)) {
                  _context91.next = 15;
                  break;
                }

                throw Error("Invalid method: " + method);

              case 15:
                _context91.next = 17;
                return this[method](message.args);

              case 17:
                methodResults = _context91.sent;

              case 18:
                Respond(this.utils.MakeClonable({
                  type: "ElvFrameResponse",
                  requestId: message.requestId,
                  response: methodResults
                }));
                _context91.next = 26;
                break;

              case 21:
                _context91.prev = 21;
                _context91.t0 = _context91["catch"](3);
                // eslint-disable-next-line no-console
                console.error(_context91.t0);
                responseError = _context91.t0 instanceof Error ? _context91.t0.message : _context91.t0;
                Respond(this.utils.MakeClonable({
                  type: "ElvFrameResponse",
                  requestId: message.requestId,
                  error: responseError
                }));

              case 26:
              case "end":
                return _context91.stop();
            }
          }
        }, _callee91, this, [[3, 21]]);
      }));

      function CallFromFrameMessage(_x88, _x89) {
        return _CallFromFrameMessage.apply(this, arguments);
      }

      return CallFromFrameMessage;
    }()
  }], [{
    key: "FromConfigurationUrl",
    value: function () {
      var _FromConfigurationUrl = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee92(_ref94) {
        var configUrl, _ref94$viewOnly, viewOnly, _ref94$noCache, noCache, _ref94$noAuth, noAuth, httpClient, fabricInfo, filterHTTPS, fabricURIs, ethereumURIs;

        return regeneratorRuntime.wrap(function _callee92$(_context92) {
          while (1) {
            switch (_context92.prev = _context92.next) {
              case 0:
                configUrl = _ref94.configUrl, _ref94$viewOnly = _ref94.viewOnly, viewOnly = _ref94$viewOnly === void 0 ? false : _ref94$viewOnly, _ref94$noCache = _ref94.noCache, noCache = _ref94$noCache === void 0 ? false : _ref94$noCache, _ref94$noAuth = _ref94.noAuth, noAuth = _ref94$noAuth === void 0 ? false : _ref94$noAuth;
                httpClient = new HttpClient([configUrl]);
                _context92.next = 4;
                return ResponseToJson(httpClient.Request({
                  method: "GET",
                  path: "/config"
                }));

              case 4:
                fabricInfo = _context92.sent;

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

                return _context92.abrupt("return", new ElvClient({
                  contentSpaceId: fabricInfo.qspace.id,
                  fabricURIs: fabricURIs,
                  ethereumURIs: ethereumURIs,
                  viewOnly: viewOnly,
                  noCache: noCache,
                  noAuth: noAuth
                }));

              case 11:
              case "end":
                return _context92.stop();
            }
          }
        }, _callee92);
      }));

      function FromConfigurationUrl(_x90) {
        return _FromConfigurationUrl.apply(this, arguments);
      }

      return FromConfigurationUrl;
    }()
  }]);

  return ElvClient;
}();

exports.ElvClient = ElvClient;