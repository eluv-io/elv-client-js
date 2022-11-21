var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _v, _v2;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var HttpClient = require("./HttpClient");

var Ethers = require("ethers");

var Utils = require("./Utils");

var UrlJoin = require("url-join");

var _require = require("./LogMessage"),
    LogMessage = _require.LogMessage;

var _require2 = require("./Validation"),
    ValidateObject = _require2.ValidateObject;

var Pako = require("pako");
/*
// -- Contract javascript files built using build/BuildContracts.js
const SpaceContract = require("./contracts/BaseContentSpace");
const LibraryContract = require("./contracts/BaseLibrary");
const TypeContract = require("./contracts/BaseContentType");
const ContentContract = require("./contracts/BaseContent");
const AccessGroupContract = require("./contracts/BaseAccessControlGroup");
const WalletContract = require("./contracts/BaseAccessWallet");
const AccessibleContract = require("./contracts/Accessible");
const EditableContract = require("./contracts/Editable");
 */


var ACCESS_TYPES = {
  SPACE: "space",
  LIBRARY: "library",
  TYPE: "type",
  OBJECT: "object",
  WALLET: "wallet",
  GROUP: "group",
  ACCESSIBLE: "accessible",
  EDITABLE: "editable",
  TENANT: "tenant",
  OTHER: "other"
};
var CONTRACTS = {
  v2: (_v = {}, _defineProperty(_v, ACCESS_TYPES.SPACE, require("./contracts/v2/BaseContentSpace")), _defineProperty(_v, ACCESS_TYPES.LIBRARY, require("./contracts/v2/BaseLibrary")), _defineProperty(_v, ACCESS_TYPES.TYPE, require("./contracts/v2/BaseContentType")), _defineProperty(_v, ACCESS_TYPES.OBJECT, require("./contracts/v2/BaseContent")), _defineProperty(_v, ACCESS_TYPES.WALLET, require("./contracts/v2/BaseAccessWallet")), _defineProperty(_v, ACCESS_TYPES.GROUP, require("./contracts/v2/BaseAccessControlGroup")), _defineProperty(_v, ACCESS_TYPES.ACCESSIBLE, require("./contracts/v2/Accessible")), _defineProperty(_v, ACCESS_TYPES.EDITABLE, require("./contracts/v2/Editable")), _v),
  v3: (_v2 = {}, _defineProperty(_v2, ACCESS_TYPES.SPACE, require("./contracts/v3/BaseContentSpace")), _defineProperty(_v2, ACCESS_TYPES.LIBRARY, require("./contracts/v3/BaseLibrary")), _defineProperty(_v2, ACCESS_TYPES.TYPE, require("./contracts/v3/BaseContentType")), _defineProperty(_v2, ACCESS_TYPES.OBJECT, require("./contracts/v3/BaseContent")), _defineProperty(_v2, ACCESS_TYPES.WALLET, require("./contracts/v3/BaseAccessWallet")), _defineProperty(_v2, ACCESS_TYPES.GROUP, require("./contracts/v3/BaseAccessControlGroup")), _defineProperty(_v2, ACCESS_TYPES.ACCESSIBLE, require("./contracts/v3/Accessible")), _defineProperty(_v2, ACCESS_TYPES.EDITABLE, require("./contracts/v3/Editable")), _defineProperty(_v2, ACCESS_TYPES.TENANT, require("./contracts/v3/BaseTenantSpace")), _v2)
};

var AuthorizationClient = /*#__PURE__*/function () {
  "use strict";

  function AuthorizationClient(_ref) {
    var client = _ref.client,
        contentSpaceId = _ref.contentSpaceId,
        _ref$debug = _ref.debug,
        debug = _ref$debug === void 0 ? false : _ref$debug,
        _ref$noCache = _ref.noCache,
        noCache = _ref$noCache === void 0 ? false : _ref$noCache,
        _ref$noAuth = _ref.noAuth,
        noAuth = _ref$noAuth === void 0 ? false : _ref$noAuth;

    _classCallCheck(this, AuthorizationClient);

    this.ACCESS_TYPES = ACCESS_TYPES;
    this.CONTRACTS = CONTRACTS;
    this.client = client;
    this.contentSpaceId = contentSpaceId;
    this.noCache = noCache;
    this.noAuth = noAuth;
    this.debug = debug;
    this.accessTransactions = {};
    this.modifyTransactions = {};
    this.transactionLocks = {};
    this.methodAvailability = {};
    this.accessVersions = {};
    this.accessTypes = {};
    this.channelContentTokens = {};
    this.encryptionKeys = {};
    this.reencryptionKeys = {};
    this.requestIds = {};
    this.providers = {};
  }

  _createClass(AuthorizationClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      LogMessage(this, message, error);
    }
  }, {
    key: "CreateStaticToken",
    value: function CreateStaticToken(_ref2) {
      var libraryId = _ref2.libraryId;
      var token = {
        qspace_id: this.client.contentSpaceId
      };

      if (libraryId) {
        token.qlib_id = libraryId;
      }

      return Utils.B64(JSON.stringify(token));
    } // Return authorization token in appropriate headers

  }, {
    key: "AuthorizationHeader",
    value: function () {
      var _AuthorizationHeader = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(params) {
        var authorizationToken, headers;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.AuthorizationToken(params);

              case 2:
                authorizationToken = _context.sent;
                headers = {
                  Authorization: "Bearer " + authorizationToken
                };

                if (params.encryption && params.encryption !== "none") {
                  headers["X-Content-Fabric-Encryption-Scheme"] = params.encryption;
                }

                return _context.abrupt("return", headers);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function AuthorizationHeader(_x) {
        return _AuthorizationHeader.apply(this, arguments);
      }

      return AuthorizationHeader;
    }()
  }, {
    key: "AuthorizationToken",
    value: function () {
      var _AuthorizationToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(_ref3) {
        var libraryId, objectId, versionHash, partHash, encryption, audienceData, context, _ref3$update, update, _ref3$channelAuth, channelAuth, oauthToken, _ref3$noCache, noCache, _ref3$noAuth, noAuth, isWalletRequest, initialNoCache, authorizationToken;

        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                libraryId = _ref3.libraryId, objectId = _ref3.objectId, versionHash = _ref3.versionHash, partHash = _ref3.partHash, encryption = _ref3.encryption, audienceData = _ref3.audienceData, context = _ref3.context, _ref3$update = _ref3.update, update = _ref3$update === void 0 ? false : _ref3$update, _ref3$channelAuth = _ref3.channelAuth, channelAuth = _ref3$channelAuth === void 0 ? false : _ref3$channelAuth, oauthToken = _ref3.oauthToken, _ref3$noCache = _ref3.noCache, noCache = _ref3$noCache === void 0 ? false : _ref3$noCache, _ref3$noAuth = _ref3.noAuth, noAuth = _ref3$noAuth === void 0 ? false : _ref3$noAuth;

                if (versionHash) {
                  objectId = this.client.utils.DecodeVersionHash(versionHash).objectId;
                }

                _context2.t0 = objectId && this.client.signer;

                if (!_context2.t0) {
                  _context2.next = 10;
                  break;
                }

                _context2.t1 = this.client.utils;
                _context2.next = 7;
                return this.client.userProfileClient.WalletAddress(false);

              case 7:
                _context2.t2 = _context2.sent;
                _context2.t3 = this.client.utils.HashToAddress(objectId);
                _context2.t0 = _context2.t1.EqualAddress.call(_context2.t1, _context2.t2, _context2.t3);

              case 10:
                isWalletRequest = _context2.t0;

                if (!(this.client.staticToken && !isWalletRequest)) {
                  _context2.next = 13;
                  break;
                }

                return _context2.abrupt("return", this.client.staticToken);

              case 13:
                initialNoCache = this.noCache;
                _context2.prev = 14;

                // noCache enabled for this call
                if (noCache && !this.noCache) {
                  this.noCache = true;
                }

                if (channelAuth && this.client.signer && this.client.signer.remoteSigner) {
                  // Channel auth not supported for remote signer, use a self-signed no-auth token instead
                  noAuth = true;
                  channelAuth = false;
                }

                if (!channelAuth) {
                  _context2.next = 23;
                  break;
                }

                _context2.next = 20;
                return this.GenerateChannelContentToken({
                  objectId: objectId,
                  versionHash: versionHash,
                  audienceData: audienceData,
                  context: context,
                  oauthToken: oauthToken
                });

              case 20:
                authorizationToken = _context2.sent;
                _context2.next = 28;
                break;

              case 23:
                if (!(noAuth && this.client.signer && this.client.signer.remoteSigner && this.client.signer.unsignedPublicAuth)) {
                  _context2.next = 25;
                  break;
                }

                return _context2.abrupt("return", this.CreateStaticToken({
                  libraryId: libraryId
                }));

              case 25:
                _context2.next = 27;
                return this.GenerateAuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  partHash: partHash,
                  encryption: encryption,
                  update: update,
                  noAuth: noAuth
                });

              case 27:
                authorizationToken = _context2.sent;

              case 28:
                return _context2.abrupt("return", authorizationToken);

              case 31:
                _context2.prev = 31;
                _context2.t4 = _context2["catch"](14);
                throw _context2.t4;

              case 34:
                _context2.prev = 34;
                this.noCache = initialNoCache;
                return _context2.finish(34);

              case 37:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[14, 31, 34, 37]]);
      }));

      function AuthorizationToken(_x2) {
        return _AuthorizationToken.apply(this, arguments);
      }

      return AuthorizationToken;
    }()
  }, {
    key: "GenerateAuthorizationToken",
    value: function () {
      var _GenerateAuthorizationToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref4) {
        var libraryId, objectId, versionHash, partHash, encryption, _ref4$update, update, _ref4$noAuth, noAuth, publicKey, owner, ownerCapKey, ownerCap, cap, token, _yield$this$MakeAcces, transactionHash, signature, multiSig;

        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                libraryId = _ref4.libraryId, objectId = _ref4.objectId, versionHash = _ref4.versionHash, partHash = _ref4.partHash, encryption = _ref4.encryption, _ref4$update = _ref4.update, update = _ref4$update === void 0 ? false : _ref4$update, _ref4$noAuth = _ref4.noAuth, noAuth = _ref4$noAuth === void 0 ? false : _ref4$noAuth;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                } // Generate AFGH public key if encryption is specified


                _context3.t0 = encryption && encryption !== "none" && objectId;

                if (!_context3.t0) {
                  _context3.next = 9;
                  break;
                }

                _context3.next = 6;
                return this.AccessType(objectId);

              case 6:
                _context3.t1 = _context3.sent;
                _context3.t2 = ACCESS_TYPES.OBJECT;
                _context3.t0 = _context3.t1 === _context3.t2;

              case 9:
                if (!_context3.t0) {
                  _context3.next = 22;
                  break;
                }

                _context3.next = 12;
                return this.Owner({
                  id: objectId
                });

              case 12:
                owner = _context3.sent;
                ownerCapKey = "eluv.caps.iusr".concat(Utils.AddressToHash(this.client.signer.address));
                _context3.next = 16;
                return this.client.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadataSubtree: ownerCapKey
                });

              case 16:
                ownerCap = _context3.sent;

                if (!(!Utils.EqualAddress(owner, this.client.signer.address) && !ownerCap)) {
                  _context3.next = 22;
                  break;
                }

                _context3.next = 20;
                return this.ReEncryptionConk({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 20:
                cap = _context3.sent;
                publicKey = cap.public_key;

              case 22:
                token = {
                  qspace_id: this.contentSpaceId,
                  addr: Utils.FormatAddress(this.client.signer && this.client.signer.address || "")
                };

                if (this.noAuth || noAuth) {
                  _context3.next = 29;
                  break;
                }

                _context3.next = 26;
                return this.MakeAccessRequest({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  update: update,
                  publicKey: publicKey,
                  noCache: this.noCache,
                  noAuth: this.noAuth || noAuth
                });

              case 26:
                _yield$this$MakeAcces = _context3.sent;
                transactionHash = _yield$this$MakeAcces.transactionHash;

                if (transactionHash) {
                  token.tx_id = transactionHash;
                }

              case 29:
                if (libraryId) {
                  token.qlib_id = libraryId;
                }

                if (partHash) {
                  token.qphash = partHash;
                }

                if (publicKey) {
                  token.afgh_pk = publicKey;
                }

                token = Utils.B64(JSON.stringify(token));
                _context3.next = 35;
                return this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(token)));

              case 35:
                signature = _context3.sent;
                multiSig = Utils.FormatSignature(signature);
                return _context3.abrupt("return", "".concat(token, ".").concat(Utils.B64(multiSig)));

              case 38:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function GenerateAuthorizationToken(_x3) {
        return _GenerateAuthorizationToken.apply(this, arguments);
      }

      return GenerateAuthorizationToken;
    }()
  }, {
    key: "GenerateSignedLinkToken",
    value: function () {
      var _GenerateSignedLinkToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(_ref5) {
        var containerId, versionHash, link, canEdit, _Utils$DecodeVersionH, objectId, signerAddress, token, compressedToken, signature;

        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                containerId = _ref5.containerId, versionHash = _ref5.versionHash, link = _ref5.link;
                ValidateObject(containerId);
                _context4.next = 4;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(containerId),
                  methodName: "canEdit"
                });

              case 4:
                canEdit = _context4.sent;
                _Utils$DecodeVersionH = Utils.DecodeVersionHash(versionHash), objectId = _Utils$DecodeVersionH.objectId;

                if (canEdit) {
                  _context4.next = 8;
                  break;
                }

                throw Error("Current user does not have permission to edit content object ".concat(objectId));

              case 8:
                signerAddress = this.client.CurrentAccountAddress();
                _context4.t0 = Utils.B64(signerAddress.replace("0x", ""), "hex");
                _context4.next = 12;
                return this.client.ContentSpaceId();

              case 12:
                _context4.t1 = _context4.sent;
                _context4.next = 15;
                return this.client.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 15:
                _context4.t2 = _context4.sent;
                _context4.t3 = objectId;
                _context4.t4 = Utils.FormatAddress(signerAddress);
                _context4.t5 = Date.now();
                _context4.t6 = Date.now() + 3600000;
                _context4.t7 = {
                  elv: {
                    lnk: link,
                    src: containerId
                  }
                };
                token = {
                  adr: _context4.t0,
                  spc: _context4.t1,
                  lib: _context4.t2,
                  qid: _context4.t3,
                  sub: _context4.t4,
                  gra: "read",
                  iat: _context4.t5,
                  exp: _context4.t6,
                  ctx: _context4.t7
                };
                compressedToken = Pako.deflateRaw(Buffer.from(JSON.stringify(token), "utf-8"));
                _context4.next = 25;
                return this.Sign(Ethers.utils.keccak256(compressedToken));

              case 25:
                signature = _context4.sent;
                return _context4.abrupt("return", "aslsjc".concat(Utils.B58(Buffer.concat([Buffer.from(signature.replace(/^0x/, ""), "hex"), Buffer.from(compressedToken)]))));

              case 27:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function GenerateSignedLinkToken(_x4) {
        return _GenerateSignedLinkToken.apply(this, arguments);
      }

      return GenerateSignedLinkToken;
    }()
  }, {
    key: "MakeAccessRequest",
    value: function () {
      var _MakeAccessRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_ref6) {
        var _this = this;

        var libraryId, objectId, versionHash, _ref6$args, args, _ref6$publicKey, publicKey, _ref6$update, update, _ref6$skipCache, skipCache, _ref6$noCache, noCache, cacheOnly, walletContractAddress, walletCreated, id, _yield$this$ContractI, isV3, accessType, abi, _yield$this$AccessInf, accessArgs, checkAccessCharge, address, elapsed, _cache, accessRequest, cache;

        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                libraryId = _ref6.libraryId, objectId = _ref6.objectId, versionHash = _ref6.versionHash, _ref6$args = _ref6.args, args = _ref6$args === void 0 ? [] : _ref6$args, _ref6$publicKey = _ref6.publicKey, publicKey = _ref6$publicKey === void 0 ? "" : _ref6$publicKey, _ref6$update = _ref6.update, update = _ref6$update === void 0 ? false : _ref6$update, _ref6$skipCache = _ref6.skipCache, skipCache = _ref6$skipCache === void 0 ? false : _ref6$skipCache, _ref6$noCache = _ref6.noCache, noCache = _ref6$noCache === void 0 ? false : _ref6$noCache, cacheOnly = _ref6.cacheOnly;

                if (this.client.signer) {
                  _context5.next = 3;
                  break;
                }

                return _context5.abrupt("return", {
                  transactionHash: ""
                });

              case 3:
                _context5.next = 5;
                return this.client.userProfileClient.UserWalletAddress({
                  address: this.client.signer.address
                });

              case 5:
                walletContractAddress = _context5.sent;

                if (walletContractAddress) {
                  _context5.next = 12;
                  break;
                }

                _context5.next = 9;
                return this.client.userProfileClient.WalletAddress();

              case 9:
                walletCreated = _context5.sent;

                if (walletCreated) {
                  _context5.next = 12;
                  break;
                }

                throw Error("User wallet contract is required to make access requests");

              case 12:
                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                id = objectId || libraryId || this.contentSpaceId;
                _context5.next = 16;
                return this.ContractInfo({
                  id: id
                });

              case 16:
                _yield$this$ContractI = _context5.sent;
                isV3 = _yield$this$ContractI.isV3;
                accessType = _yield$this$ContractI.accessType;
                abi = _yield$this$ContractI.abi;

                if (!(typeof accessType === "undefined")) {
                  _context5.next = 22;
                  break;
                }

                throw Error("Unable to determine contract info for ".concat(id, " (").concat(this.client.utils.HashToAddress(id), ") - Wrong network?"));

              case 22:
                _context5.next = 24;
                return this.AccessInfo({
                  accessType: accessType,
                  publicKey: publicKey,
                  update: update,
                  args: args,
                  isV3: isV3
                });

              case 24:
                _yield$this$AccessInf = _context5.sent;
                accessArgs = _yield$this$AccessInf.accessArgs;
                checkAccessCharge = _yield$this$AccessInf.checkAccessCharge;
                address = Utils.HashToAddress(id);
                elapsed = 0;

              case 29:
                if (!this.transactionLocks[id]) {
                  _context5.next = 36;
                  break;
                }

                _context5.next = 32;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, 100);
                });

              case 32:
                elapsed += 100;

                if (elapsed > 15000) {
                  this.Log("Lock never released for ".concat(id, " - releasing lock"));
                  delete this.transactionLocks[id];
                }

                _context5.next = 29;
                break;

              case 36:
                _context5.prev = 36;
                this.transactionLocks[id] = true; // Check cache for existing transaction

                if (!(!noCache && !skipCache)) {
                  _context5.next = 46;
                  break;
                }

                _cache = update ? this.modifyTransactions : this.accessTransactions;

                if (!_cache[address]) {
                  _context5.next = 46;
                  break;
                }

                if (!(_cache[address].issuedAt > Date.now() - 12 * 60 * 60 * 1000)) {
                  _context5.next = 45;
                  break;
                }

                return _context5.abrupt("return", _cache[address]);

              case 45:
                // Token expired
                delete _cache[address];

              case 46:
                if (!cacheOnly) {
                  _context5.next = 48;
                  break;
                }

                return _context5.abrupt("return");

              case 48:
                if (!update) {
                  _context5.next = 55;
                  break;
                }

                this.Log("Making update request on ".concat(accessType, " ").concat(id));
                _context5.next = 52;
                return this.UpdateRequest({
                  id: id,
                  abi: abi
                });

              case 52:
                accessRequest = _context5.sent;
                _context5.next = 59;
                break;

              case 55:
                this.Log("Making access request on ".concat(accessType, " ").concat(id));
                _context5.next = 58;
                return this.AccessRequest({
                  id: id,
                  args: accessArgs,
                  checkAccessCharge: checkAccessCharge
                });

              case 58:
                accessRequest = _context5.sent;

              case 59:
                cache = update ? this.modifyTransactions : this.accessTransactions;
                _context5.prev = 60;

                if (!noCache) {
                  cache[address] = {
                    issuedAt: Date.now(),
                    transactionHash: accessRequest.transactionHash
                  }; // Save request ID if present

                  accessRequest.logs.some(function (log) {
                    if (log.values && (log.values.requestID || log.values.requestNonce)) {
                      _this.requestIds[address] = (log.values.requestID || log.values.requestNonce || "").toString().replace(/^0x/, "");
                      return true;
                    }
                  });
                }

                return _context5.abrupt("return", accessRequest);

              case 65:
                _context5.prev = 65;
                _context5.t0 = _context5["catch"](60);

                if (!noCache) {
                  delete cache[address];
                }

                throw _context5.t0;

              case 69:
                _context5.prev = 69;
                delete this.transactionLocks[id];
                return _context5.finish(69);

              case 72:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[36,, 69, 72], [60, 65]]);
      }));

      function MakeAccessRequest(_x5) {
        return _MakeAccessRequest.apply(this, arguments);
      }

      return MakeAccessRequest;
    }()
  }, {
    key: "AccessRequest",
    value: function () {
      var _AccessRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref7) {
        var id, _ref7$args, args, _ref7$checkAccessChar, checkAccessCharge, _yield$this$ContractI2, isV3, accessType, abi, accessCharge, owner, accessChargeArgs, event, methodName, contractAddress;

        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                id = _ref7.id, _ref7$args = _ref7.args, args = _ref7$args === void 0 ? [] : _ref7$args, _ref7$checkAccessChar = _ref7.checkAccessCharge, checkAccessCharge = _ref7$checkAccessChar === void 0 ? false : _ref7$checkAccessChar;
                _context6.next = 3;
                return this.ContractInfo({
                  id: id
                });

              case 3:
                _yield$this$ContractI2 = _context6.sent;
                isV3 = _yield$this$ContractI2.isV3;
                accessType = _yield$this$ContractI2.accessType;
                abi = _yield$this$ContractI2.abi;
                // Send some bux if access charge is required
                accessCharge = 0;

                if (!(checkAccessCharge && accessType === ACCESS_TYPES.OBJECT)) {
                  _context6.next = 26;
                  break;
                }

                _context6.next = 11;
                return this.Owner({
                  id: id,
                  abi: abi
                });

              case 11:
                owner = _context6.sent;

                if (Utils.EqualAddress(this.client.signer.address, owner)) {
                  _context6.next = 26;
                  break;
                }

                _context6.prev = 13;
                // Extract level, custom values and stakeholders from accessRequest arguments
                accessChargeArgs = isV3 ? [0, [], []] : [args[0], args[3], args[4]]; // Access charge is in wei, but methods take ether - convert to charge to ether

                _context6.t0 = Utils;
                _context6.next = 18;
                return this.GetAccessCharge({
                  objectId: id,
                  args: accessChargeArgs
                });

              case 18:
                _context6.t1 = _context6.sent;
                accessCharge = _context6.t0.WeiToEther.call(_context6.t0, _context6.t1);
                _context6.next = 26;
                break;

              case 22:
                _context6.prev = 22;
                _context6.t2 = _context6["catch"](13);
                this.Log("Failed to get access charge for", id);
                this.Log(_context6.t2);

              case 26:
                if (accessCharge > 0) {
                  this.Log("Access charge: ".concat(accessCharge));
                }

                contractAddress = Utils.HashToAddress(id);

                if (isV3) {
                  methodName = "accessRequestV3";
                } else {
                  methodName = "accessRequest";
                }

                _context6.next = 31;
                return this.ContractHasMethod({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: methodName
                });

              case 31:
                if (_context6.sent) {
                  _context6.next = 34;
                  break;
                }

                this.Log("".concat(accessType, " ").concat(id, " has no ").concat(methodName, " method. Skipping"));
                return _context6.abrupt("return", {
                  transactionHash: "",
                  logs: []
                });

              case 34:
                _context6.next = 36;
                return this.client.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: methodName,
                  methodArgs: args,
                  value: accessCharge
                });

              case 36:
                event = _context6.sent;

                if (!(event.logs.length === 0)) {
                  _context6.next = 39;
                  break;
                }

                throw Error("Access denied (".concat(id, ")"));

              case 39:
                return _context6.abrupt("return", event);

              case 40:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[13, 22]]);
      }));

      function AccessRequest(_x6) {
        return _AccessRequest.apply(this, arguments);
      }

      return AccessRequest;
    }()
  }, {
    key: "UpdateRequest",
    value: function () {
      var _UpdateRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(_ref8) {
        var id, abi, event, updateRequestEvent;
        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                id = _ref8.id, abi = _ref8.abi;
                _context7.next = 3;
                return this.client.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(id),
                  abi: abi,
                  methodName: "updateRequest",
                  methodArgs: []
                });

              case 3:
                event = _context7.sent;
                updateRequestEvent = this.client.ExtractEventFromLogs({
                  abi: abi,
                  event: event,
                  eventName: "UpdateRequest"
                });

                if (!(event.logs.length === 0 || !updateRequestEvent)) {
                  _context7.next = 7;
                  break;
                }

                throw Error("Update request denied for ".concat(id));

              case 7:
                return _context7.abrupt("return", event);

              case 8:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function UpdateRequest(_x7) {
        return _UpdateRequest.apply(this, arguments);
      }

      return UpdateRequest;
    }()
  }, {
    key: "AudienceData",
    value: function AudienceData(_ref9) {
      var objectId = _ref9.objectId,
          versionHash = _ref9.versionHash,
          _ref9$protocols = _ref9.protocols,
          protocols = _ref9$protocols === void 0 ? [] : _ref9$protocols,
          _ref9$drms = _ref9.drms,
          drms = _ref9$drms === void 0 ? [] : _ref9$drms,
          context = _ref9.context;
      this.Log("Retrieving audience data: ".concat(objectId));
      context = context || this.client.authContext || {};

      if (Object.values(context).find(function (value) {
        return typeof value !== "string";
      })) {
        throw Error("Context must be a map of string->string");
      }

      var data = _objectSpread({
        user_address: Utils.FormatAddress(this.client.signer.address),
        content_id: objectId || Utils.DecodeVersionHash(versionHash).id,
        content_hash: versionHash,
        hostname: this.client.HttpClient.BaseURI().hostname(),
        access_time: Math.round(new Date().getTime()).toString(),
        format: protocols.join(","),
        drm: drms.join(",")
      }, context);

      if (typeof window !== "undefined" && window.navigator) {
        data.user_string = window.navigator.userAgent;
        data.language = window.navigator.language;
      }

      this.Log(data);
      return data;
    }
  }, {
    key: "GenerateChannelContentToken",
    value: function () {
      var _GenerateChannelContentToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(_ref10) {
        var objectId, versionHash, issuer, code, email, audienceData, context, oauthToken, _ref10$value, value, token, tenantId, kmsAddress, stateChannelApi, additionalParams, payload, signature, multiSig;

        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                objectId = _ref10.objectId, versionHash = _ref10.versionHash, issuer = _ref10.issuer, code = _ref10.code, email = _ref10.email, audienceData = _ref10.audienceData, context = _ref10.context, oauthToken = _ref10.oauthToken, _ref10$value = _ref10.value, value = _ref10$value === void 0 ? 0 : _ref10$value;

                if (!oauthToken) {
                  _context8.next = 5;
                  break;
                }

                _context8.next = 4;
                return this.GenerateOauthChannelToken({
                  objectId: objectId,
                  token: oauthToken
                });

              case 4:
                return _context8.abrupt("return", _context8.sent);

              case 5:
                if (!(!this.noCache && this.channelContentTokens[objectId])) {
                  _context8.next = 11;
                  break;
                }

                if (!(this.channelContentTokens[objectId].issuedAt > Date.now() - 12 * 60 * 60 * 1000)) {
                  _context8.next = 10;
                  break;
                }

                return _context8.abrupt("return", this.channelContentTokens[objectId].token);

              case 10:
                // Token expired
                delete this.channelContentTokens[objectId];

              case 11:
                this.Log("Making state channel access request: ".concat(objectId));

                if (!issuer) {
                  _context8.next = 43;
                  break;
                }

                // Ticket API
                tenantId = issuer.replace(/^\//, "").split("/")[2];
                _context8.prev = 14;
                _context8.next = 17;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(tenantId),
                  methodName: "addressKMS"
                });

              case 17:
                kmsAddress = _context8.sent;

                if (kmsAddress) {
                  _context8.next = 20;
                  break;
                }

                throw "";

              case 20:
                _context8.next = 27;
                break;

              case 22:
                _context8.prev = 22;
                _context8.t0 = _context8["catch"](14);
                _context8.next = 26;
                return this.client.DefaultKMSAddress();

              case 26:
                kmsAddress = _context8.sent;

              case 27:
                _context8.prev = 27;
                _context8.next = 30;
                return Utils.ResponseToFormat("text", this.MakeAuthServiceRequest({
                  kmsId: "ikms" + Utils.AddressToHash(kmsAddress),
                  method: "POST",
                  path: UrlJoin("as", issuer),
                  body: {
                    "_PASSWORD": code,
                    "_EMAIL": email
                  }
                }));

              case 30:
                token = _context8.sent;
                _context8.next = 40;
                break;

              case 33:
                _context8.prev = 33;
                _context8.t1 = _context8["catch"](27);
                this.Log("/as token redemption failed:", true);
                this.Log(_context8.t1, true);
                _context8.next = 39;
                return Utils.ResponseToFormat("text", this.MakeKMSRequest({
                  kmsId: "ikms" + Utils.AddressToHash(kmsAddress),
                  method: "POST",
                  path: UrlJoin("ks", issuer),
                  body: {
                    "_PASSWORD": code,
                    "_EMAIL": email
                  }
                }));

              case 39:
                token = _context8.sent;

              case 40:
                // Pull target object from token so token can be cached
                objectId = JSON.parse(Utils.FromB64(token)).qid;
                _context8.next = 54;
                break;

              case 43:
                // State channel API
                if (!audienceData) {
                  audienceData = this.AudienceData({
                    objectId: objectId,
                    versionHash: versionHash,
                    context: context
                  });
                }

                stateChannelApi = "elv_channelContentRequestContext";
                additionalParams = [JSON.stringify(audienceData)];
                _context8.next = 48;
                return this.MakeKMSCall({
                  objectId: objectId,
                  methodName: stateChannelApi,
                  paramTypes: ["address", "address", "uint", "uint"],
                  params: [this.client.signer.address, Utils.HashToAddress(objectId), value, Date.now()],
                  additionalParams: additionalParams
                });

              case 48:
                payload = _context8.sent;
                _context8.next = 51;
                return this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(payload)));

              case 51:
                signature = _context8.sent;
                multiSig = Utils.FormatSignature(signature);
                token = "".concat(payload, ".").concat(Utils.B64(multiSig));

              case 54:
                if (!this.noCache) {
                  this.channelContentTokens[objectId] = {
                    token: token,
                    issuedAt: Date.now()
                  };
                }

                return _context8.abrupt("return", token);

              case 56:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[14, 22], [27, 33]]);
      }));

      function GenerateChannelContentToken(_x8) {
        return _GenerateChannelContentToken.apply(this, arguments);
      }

      return GenerateChannelContentToken;
    }()
  }, {
    key: "ChannelContentFinalize",
    value: function () {
      var _ChannelContentFinalize = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(_ref11) {
        var objectId, versionHash, _ref11$percent, percent, result;

        return _regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                objectId = _ref11.objectId, versionHash = _ref11.versionHash, _ref11$percent = _ref11.percent, percent = _ref11$percent === void 0 ? 0 : _ref11$percent;
                this.Log("Making state channel finalize request: ".concat(objectId));
                _context9.next = 4;
                return this.MakeKMSCall({
                  objectId: objectId,
                  methodName: "elv_channelContentFinalizeContext",
                  paramTypes: ["address", "address", "uint", "uint"],
                  params: [this.client.signer.address, Utils.HashToAddress(objectId), percent, Date.now()],
                  additionalParams: [JSON.stringify(this.AudienceData({
                    objectId: objectId,
                    versionHash: versionHash
                  }))]
                });

              case 4:
                result = _context9.sent;
                this.channelContentTokens[objectId] = undefined;
                return _context9.abrupt("return", result);

              case 7:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function ChannelContentFinalize(_x9) {
        return _ChannelContentFinalize.apply(this, arguments);
      }

      return ChannelContentFinalize;
    }()
  }, {
    key: "GenerateOauthChannelToken",
    value: function () {
      var _GenerateOauthChannelToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(_ref12) {
        var objectId, versionHash, token, fabricToken;
        return _regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                objectId = _ref12.objectId, versionHash = _ref12.versionHash, token = _ref12.token;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                if (!(!this.noCache && this.channelContentTokens[objectId])) {
                  _context10.next = 6;
                  break;
                }

                if (!(this.channelContentTokens[objectId].issuedAt > Date.now() - 12 * 60 * 60 * 1000)) {
                  _context10.next = 5;
                  break;
                }

                return _context10.abrupt("return", this.channelContentTokens[objectId].token);

              case 5:
                // Token expired
                this.channelContentTokens[objectId] = undefined;

              case 6:
                _context10.next = 8;
                return this.MakeKMSRequest({
                  objectId: objectId,
                  versionHash: versionHash,
                  method: "GET",
                  path: UrlJoin("ks", "jwt", "q", objectId),
                  bodyType: "NONE",
                  headers: {
                    Authorization: "Bearer ".concat(token)
                  }
                });

              case 8:
                _context10.next = 10;
                return _context10.sent.text();

              case 10:
                fabricToken = _context10.sent;

                if (!this.noCache) {
                  this.channelContentTokens[objectId] = {
                    token: fabricToken,
                    issuedAt: Date.now()
                  };
                }

                return _context10.abrupt("return", fabricToken);

              case 13:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function GenerateOauthChannelToken(_x10) {
        return _GenerateOauthChannelToken.apply(this, arguments);
      }

      return GenerateOauthChannelToken;
    }()
  }, {
    key: "IsV3",
    value: function () {
      var _IsV = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref13) {
        var id, contractName;
        return _regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                id = _ref13.id;

                if (!this.client.assumeV3) {
                  _context11.next = 3;
                  break;
                }

                return _context11.abrupt("return", true);

              case 3:
                _context11.next = 5;
                return this.client.ethClient.ContractName(Utils.HashToAddress(id), true);

              case 5:
                contractName = _context11.sent;

                if (!this.accessVersions[contractName]) {
                  this.accessVersions[contractName] = this.ContractHasMethod({
                    contractAddress: this.client.utils.HashToAddress(id),
                    abi: this.CONTRACTS.v3[this.ACCESS_TYPES.ACCESSIBLE].abi,
                    methodName: "accessRequestV3"
                  });
                }

                _context11.next = 9;
                return this.accessVersions[contractName];

              case 9:
                return _context11.abrupt("return", _context11.sent);

              case 10:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function IsV3(_x11) {
        return _IsV.apply(this, arguments);
      }

      return IsV3;
    }()
  }, {
    key: "AccessInfo",
    value: function () {
      var _AccessInfo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(_ref14) {
        var accessType, publicKey, args, isV3, checkAccessCharge;
        return _regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                accessType = _ref14.accessType, publicKey = _ref14.publicKey, args = _ref14.args, isV3 = _ref14.isV3;
                checkAccessCharge = false;

                if (accessType === ACCESS_TYPES.OBJECT) {
                  checkAccessCharge = true;

                  if (!isV3) {
                    if (args && args.length > 0) {
                      // Inject public key of requester
                      args[1] = this.client.signer.signingKey ? this.client.signer.signingKey.publicKey : "";
                    } else {
                      // Set default args
                      args = [0, // Access level
                      this.client.signer.signingKey ? this.client.signer.signingKey.publicKey : "", // Public key of requester
                      publicKey, //cap.public_key,
                      [], // Custom values
                      [] // Stakeholders
                      ];
                    }
                  }
                }

                if (isV3 && (!args || args.length === 0)) {
                  args = [[], // customValues
                  [] // stakeholders
                  ];
                }

                return _context12.abrupt("return", {
                  accessArgs: args,
                  checkAccessCharge: checkAccessCharge
                });

              case 5:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function AccessInfo(_x12) {
        return _AccessInfo.apply(this, arguments);
      }

      return AccessInfo;
    }() // Determine type of ID based on contract version string

  }, {
    key: "AccessType",
    value: function () {
      var _AccessType = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(id) {
        var contractName, accessType;
        return _regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return this.client.ethClient.ContractName(Utils.HashToAddress(id));

              case 2:
                contractName = _context13.sent;

                if (this.accessTypes[id]) {
                  _context13.next = 23;
                  break;
                }

                _context13.t0 = contractName;
                _context13.next = _context13.t0 === "BaseContentSpace" ? 7 : _context13.t0 === "BaseLibrary" ? 9 : _context13.t0 === "BaseContentType" ? 11 : _context13.t0 === "BsAccessWallet" ? 13 : _context13.t0 === "BsAccessCtrlGrp" ? 15 : _context13.t0 === "BaseContent" ? 17 : _context13.t0 === "BaseTenantSpace" ? 19 : 21;
                break;

              case 7:
                accessType = ACCESS_TYPES.SPACE;
                return _context13.abrupt("break", 22);

              case 9:
                accessType = ACCESS_TYPES.LIBRARY;
                return _context13.abrupt("break", 22);

              case 11:
                accessType = ACCESS_TYPES.TYPE;
                return _context13.abrupt("break", 22);

              case 13:
                accessType = ACCESS_TYPES.WALLET;
                return _context13.abrupt("break", 22);

              case 15:
                accessType = ACCESS_TYPES.GROUP;
                return _context13.abrupt("break", 22);

              case 17:
                accessType = ACCESS_TYPES.OBJECT;
                return _context13.abrupt("break", 22);

              case 19:
                accessType = ACCESS_TYPES.TENANT;
                return _context13.abrupt("break", 22);

              case 21:
                accessType = ACCESS_TYPES.OTHER;

              case 22:
                this.accessTypes[id] = accessType;

              case 23:
                return _context13.abrupt("return", this.accessTypes[id]);

              case 24:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function AccessType(_x13) {
        return _AccessType.apply(this, arguments);
      }

      return AccessType;
    }()
  }, {
    key: "AccessComplete",
    value: function () {
      var _AccessComplete = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref15) {
        var id, score, _yield$this$ContractI3, abi, isV3, address, requestId, event;

        return _regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                id = _ref15.id, score = _ref15.score;
                this.Log("Calling access complete on ".concat(id, " with score ").concat(score));
                _context14.next = 4;
                return this.ContractInfo({
                  id: id
                });

              case 4:
                _yield$this$ContractI3 = _context14.sent;
                abi = _yield$this$ContractI3.abi;
                isV3 = _yield$this$ContractI3.isV3;
                address = Utils.HashToAddress(id);
                requestId = this.requestIds[address];

                if (requestId) {
                  _context14.next = 11;
                  break;
                }

                throw Error("Unknown request ID for " + id);

              case 11:
                if (!isV3) {
                  _context14.next = 17;
                  break;
                }

                _context14.next = 14;
                return this.client.CallContractMethodAndWait({
                  contractAddress: address,
                  abi: abi,
                  methodName: "accessCompleteV3",
                  methodArgs: [requestId, [], []]
                });

              case 14:
                event = _context14.sent;
                _context14.next = 20;
                break;

              case 17:
                _context14.next = 19;
                return this.client.CallContractMethodAndWait({
                  contractAddress: address,
                  abi: abi,
                  methodName: isV3 ? "accessCompleteV3" : "accessComplete",
                  methodArgs: [requestId, score, ""]
                });

              case 19:
                event = _context14.sent;

              case 20:
                delete this.requestIds[address];
                delete this.accessTransactions[address];
                return _context14.abrupt("return", event);

              case 23:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function AccessComplete(_x14) {
        return _AccessComplete.apply(this, arguments);
      }

      return AccessComplete;
    }()
    /* Utility methods */

  }, {
    key: "ContractInfo",
    value: function () {
      var _ContractInfo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(_ref16) {
        var id, address, isV3, version, accessType;
        return _regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                id = _ref16.id, address = _ref16.address;

                if (!address) {
                  address = Utils.HashToAddress(id);
                }

                if (!id) {
                  id = Utils.AddressToObjectId(address);
                }

                _context15.next = 5;
                return this.IsV3({
                  id: id
                });

              case 5:
                isV3 = _context15.sent;
                version = isV3 ? "v3" : "v2";
                _context15.next = 9;
                return this.AccessType(id);

              case 9:
                accessType = _context15.sent;

                if (!(accessType === this.ACCESS_TYPES.OTHER)) {
                  _context15.next = 12;
                  break;
                }

                return _context15.abrupt("return", {});

              case 12:
                return _context15.abrupt("return", {
                  isV3: isV3,
                  accessType: accessType,
                  abi: this.CONTRACTS[version][accessType].abi
                });

              case 13:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function ContractInfo(_x15) {
        return _ContractInfo.apply(this, arguments);
      }

      return ContractInfo;
    }()
  }, {
    key: "GetAccessCharge",
    value: function () {
      var _GetAccessCharge = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16(_ref17) {
        var objectId, args, _yield$this$ContractI4, abi, info;

        return _regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                objectId = _ref17.objectId, args = _ref17.args;
                _context16.next = 3;
                return this.ContractInfo({
                  id: objectId
                });

              case 3:
                _yield$this$ContractI4 = _context16.sent;
                abi = _yield$this$ContractI4.abi;
                _context16.next = 7;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: abi,
                  methodName: "getAccessInfo",
                  methodArgs: args
                });

              case 7:
                info = _context16.sent;
                return _context16.abrupt("return", info[1] === 0 ? 0 : info[2]);

              case 9:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function GetAccessCharge(_x16) {
        return _GetAccessCharge.apply(this, arguments);
      }

      return GetAccessCharge;
    }()
  }, {
    key: "Owner",
    value: function () {
      var _Owner = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(_ref18) {
        var id, address, ownerAddress;
        return _regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                id = _ref18.id, address = _ref18.address;

                if (this.client.signer) {
                  _context17.next = 3;
                  break;
                }

                return _context17.abrupt("return", false);

              case 3:
                if (id) {
                  address = Utils.HashToAddress(id);
                }

                _context17.next = 6;
                return this.client.CallContractMethod({
                  contractAddress: address,
                  methodName: "owner",
                  methodArgs: []
                });

              case 6:
                ownerAddress = _context17.sent;
                return _context17.abrupt("return", Utils.FormatAddress(ownerAddress));

              case 8:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function Owner(_x17) {
        return _Owner.apply(this, arguments);
      }

      return Owner;
    }()
  }, {
    key: "Sign",
    value: function () {
      var _Sign = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18(message) {
        return _regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                _context18.t0 = Ethers.utils;

                if (!this.client.signer.signDigest) {
                  _context18.next = 7;
                  break;
                }

                _context18.next = 4;
                return this.client.signer.signDigest(message);

              case 4:
                _context18.t1 = _context18.sent;
                _context18.next = 10;
                break;

              case 7:
                _context18.next = 9;
                return this.client.signer.signingKey.signDigest(message);

              case 9:
                _context18.t1 = _context18.sent;

              case 10:
                _context18.t2 = _context18.t1;
                _context18.next = 13;
                return _context18.t0.joinSignature.call(_context18.t0, _context18.t2);

              case 13:
                return _context18.abrupt("return", _context18.sent);

              case 14:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function Sign(_x18) {
        return _Sign.apply(this, arguments);
      }

      return Sign;
    }()
  }, {
    key: "KMSAddress",
    value: function () {
      var _KMSAddress = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee19(_ref19) {
        var objectId, versionHash, _yield$this$ContractI5, abi;

        return _regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                objectId = _ref19.objectId, versionHash = _ref19.versionHash;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                _context19.next = 4;
                return this.ContractInfo({
                  id: objectId
                });

              case 4:
                _yield$this$ContractI5 = _context19.sent;
                abi = _yield$this$ContractI5.abi;

                if (abi) {
                  _context19.next = 8;
                  break;
                }

                throw Error("Unable to determine contract info for ".concat(objectId, " - wrong network?"));

              case 8:
                _context19.next = 10;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: abi,
                  methodName: "addressKMS"
                });

              case 10:
                return _context19.abrupt("return", _context19.sent);

              case 11:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function KMSAddress(_x19) {
        return _KMSAddress.apply(this, arguments);
      }

      return KMSAddress;
    }()
  }, {
    key: "KMSInfo",
    value: function () {
      var _KMSInfo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee20(_ref20) {
        var objectId, versionHash, kmsId, KMSInfo, _yield$this$ContractI6, abi, _yield$this$ContractI7, _abi, publicKey;

        return _regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                objectId = _ref20.objectId, versionHash = _ref20.versionHash, kmsId = _ref20.kmsId;

                if (!kmsId) {
                  _context20.next = 11;
                  break;
                }

                _context20.next = 4;
                return this.ContractInfo({
                  address: this.client.contentSpaceAddress
                });

              case 4:
                _yield$this$ContractI6 = _context20.sent;
                abi = _yield$this$ContractI6.abi;
                _context20.next = 8;
                return this.client.CallContractMethod({
                  contractAddress: this.client.contentSpaceAddress,
                  abi: abi,
                  methodName: "getKMSInfo",
                  methodArgs: [kmsId, []],
                  formatArguments: false
                });

              case 8:
                KMSInfo = _context20.sent;
                _context20.next = 19;
                break;

              case 11:
                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                _context20.next = 14;
                return this.ContractInfo({
                  id: objectId
                });

              case 14:
                _yield$this$ContractI7 = _context20.sent;
                _abi = _yield$this$ContractI7.abi;
                _context20.next = 18;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: _abi,
                  methodName: "getKMSInfo",
                  methodArgs: [[]],
                  formatArguments: false
                });

              case 18:
                KMSInfo = _context20.sent;

              case 19:
                // Public key is compressed and hashed
                publicKey = Ethers.utils.computePublicKey(Utils.HashToAddress(KMSInfo[1]), false);
                return _context20.abrupt("return", {
                  urls: KMSInfo[0].split(","),
                  publicKey: publicKey
                });

              case 21:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function KMSInfo(_x20) {
        return _KMSInfo.apply(this, arguments);
      }

      return KMSInfo;
    }() // Retrieve symmetric key for object

  }, {
    key: "RetrieveConk",
    value: function () {
      var _RetrieveConk = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee21(_ref21) {
        var libraryId, objectId, kmsAddress, kmsCapId, kmsCap, cap;
        return _regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                libraryId = _ref21.libraryId, objectId = _ref21.objectId;

                if (libraryId) {
                  _context21.next = 5;
                  break;
                }

                _context21.next = 4;
                return this.client.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 4:
                libraryId = _context21.sent;

              case 5:
                _context21.next = 7;
                return this.KMSAddress({
                  objectId: objectId
                });

              case 7:
                kmsAddress = _context21.sent;
                kmsCapId = "eluv.caps.ikms".concat(Utils.AddressToHash(kmsAddress));
                _context21.next = 11;
                return this.client.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadataSubtree: kmsCapId
                });

              case 11:
                kmsCap = _context21.sent;

                if (kmsCap) {
                  _context21.next = 14;
                  break;
                }

                throw Error("No KMS key set for this object");

              case 14:
                _context21.next = 16;
                return this.MakeKMSCall({
                  objectId: objectId,
                  methodName: "elv_getEncryptionKey",
                  paramTypes: ["string", "string", "string", "string", "string"],
                  params: [this.client.contentSpaceId, libraryId, objectId, kmsCap || "", ""]
                });

              case 16:
                cap = _context21.sent;
                return _context21.abrupt("return", JSON.parse(Utils.FromB58(cap.replace(/^kp__/, "")).toString("utf-8")));

              case 18:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function RetrieveConk(_x21) {
        return _RetrieveConk.apply(this, arguments);
      }

      return RetrieveConk;
    }() // Retrieve symmetric key for object

  }, {
    key: "RetrieveReencryptionSymmetricKey",
    value: function () {
      var _RetrieveReencryptionSymmetricKey = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee22(_ref22) {
        var libraryId, objectId, kmsAddress, kmsCapId, kmsCap;
        return _regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                libraryId = _ref22.libraryId, objectId = _ref22.objectId;

                if (libraryId) {
                  _context22.next = 5;
                  break;
                }

                _context22.next = 4;
                return this.client.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 4:
                libraryId = _context22.sent;

              case 5:
                _context22.next = 7;
                return this.KMSAddress({
                  objectId: objectId
                });

              case 7:
                kmsAddress = _context22.sent;
                kmsCapId = "eluv.caps.ikms".concat(Utils.AddressToHash(kmsAddress));
                _context22.next = 11;
                return this.client.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadataSubtree: kmsCapId
                });

              case 11:
                kmsCap = _context22.sent;

                if (kmsCap) {
                  _context22.next = 14;
                  break;
                }

                throw Error("No KMS key set for this object");

              case 14:
                _context22.next = 16;
                return this.MakeKMSCall({
                  objectId: objectId,
                  methodName: "elv_getSymmetricKeyAuth",
                  paramTypes: ["string", "string", "string", "string", "string"],
                  params: [this.client.contentSpaceId, libraryId, objectId, kmsCap || "", ""]
                });

              case 16:
                return _context22.abrupt("return", _context22.sent);

              case 17:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function RetrieveReencryptionSymmetricKey(_x22) {
        return _RetrieveReencryptionSymmetricKey.apply(this, arguments);
      }

      return RetrieveReencryptionSymmetricKey;
    }() // Make an RPC call to the KMS with signed parameters

  }, {
    key: "MakeKMSCall",
    value: function () {
      var _MakeKMSCall = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee23(_ref23) {
        var kmsId, tenantId, objectId, versionHash, methodName, params, paramTypes, _ref23$additionalPara, additionalParams, _ref23$signature, signature, packedHash, KMSUrls, i, kmsUrl;

        return _regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                kmsId = _ref23.kmsId, tenantId = _ref23.tenantId, objectId = _ref23.objectId, versionHash = _ref23.versionHash, methodName = _ref23.methodName, params = _ref23.params, paramTypes = _ref23.paramTypes, _ref23$additionalPara = _ref23.additionalParams, additionalParams = _ref23$additionalPara === void 0 ? [] : _ref23$additionalPara, _ref23$signature = _ref23.signature, signature = _ref23$signature === void 0 ? true : _ref23$signature;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                if (objectId) {
                  _context23.next = 10;
                  break;
                }

                _context23.t0 = "ikms";
                _context23.t1 = Utils;
                _context23.next = 7;
                return this.client.DefaultKMSAddress({
                  tenantId: tenantId
                });

              case 7:
                _context23.t2 = _context23.sent;
                _context23.t3 = _context23.t1.AddressToHash.call(_context23.t1, _context23.t2);
                kmsId = _context23.t0.concat.call(_context23.t0, _context23.t3);

              case 10:
                if (!signature) {
                  _context23.next = 17;
                  break;
                }

                packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
                _context23.t4 = params;
                _context23.next = 15;
                return this.Sign(packedHash);

              case 15:
                _context23.t5 = _context23.sent;

                _context23.t4.push.call(_context23.t4, _context23.t5);

              case 17:
                params = params.concat(additionalParams);
                _context23.next = 20;
                return this.KMSInfo({
                  kmsId: kmsId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 20:
                KMSUrls = _context23.sent.urls;
                i = 0;

              case 22:
                if (!(i < KMSUrls.length)) {
                  _context23.next = 40;
                  break;
                }

                _context23.prev = 23;
                this.Log("Making KMS request:\n          URL: ".concat(KMSUrls[i], "\n          Method: ").concat(methodName, "\n          Params: ").concat(params.join(", ")));
                kmsUrl = KMSUrls[i];

                if (!this.providers[kmsUrl]) {
                  this.providers[kmsUrl] = new Ethers.providers.JsonRpcProvider(kmsUrl, this.client.networkId);
                }

                _context23.next = 29;
                return this.providers[kmsUrl].send(methodName, params);

              case 29:
                return _context23.abrupt("return", _context23.sent);

              case 32:
                _context23.prev = 32;
                _context23.t6 = _context23["catch"](23);
                this.Log("KMS Call Error: ".concat(_context23.t6), true); // If the request has been attempted on all KMS urls, throw the error

                if (!(i === KMSUrls.length - 1)) {
                  _context23.next = 37;
                  break;
                }

                throw _context23.t6;

              case 37:
                i++;
                _context23.next = 22;
                break;

              case 40:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this, [[23, 32]]);
      }));

      function MakeKMSCall(_x23) {
        return _MakeKMSCall.apply(this, arguments);
      }

      return MakeKMSCall;
    }() // Make an arbitrary HTTP call to an authority server

  }, {
    key: "MakeAuthServiceRequest",
    value: function () {
      var _MakeAuthServiceRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee24(_ref24) {
        var kmsId, objectId, versionHash, _ref24$method, method, path, bodyType, _ref24$body, body, _ref24$queryParams, queryParams, headers;

        return _regeneratorRuntime.wrap(function _callee24$(_context24) {
          while (1) {
            switch (_context24.prev = _context24.next) {
              case 0:
                kmsId = _ref24.kmsId, objectId = _ref24.objectId, versionHash = _ref24.versionHash, _ref24$method = _ref24.method, method = _ref24$method === void 0 ? "GET" : _ref24$method, path = _ref24.path, bodyType = _ref24.bodyType, _ref24$body = _ref24.body, body = _ref24$body === void 0 ? {} : _ref24$body, _ref24$queryParams = _ref24.queryParams, queryParams = _ref24$queryParams === void 0 ? {} : _ref24$queryParams, headers = _ref24.headers;

                if (!(this.client.authServiceURIs.length === 0)) {
                  _context24.next = 5;
                  break;
                }

                _context24.next = 4;
                return this.MakeKMSRequest({
                  kmsId: kmsId,
                  objectId: objectId,
                  versionHash: versionHash,
                  method: method,
                  path: path,
                  bodyType: bodyType,
                  body: body,
                  queryParams: queryParams,
                  headers: headers
                });

              case 4:
                return _context24.abrupt("return", _context24.sent);

              case 5:
                _context24.next = 7;
                return this.client.AuthHttpClient.Request({
                  method: method,
                  path: path,
                  bodyType: bodyType,
                  body: body,
                  headers: headers,
                  queryParams: queryParams
                });

              case 7:
                return _context24.abrupt("return", _context24.sent);

              case 8:
              case "end":
                return _context24.stop();
            }
          }
        }, _callee24, this);
      }));

      function MakeAuthServiceRequest(_x24) {
        return _MakeAuthServiceRequest.apply(this, arguments);
      }

      return MakeAuthServiceRequest;
    }() // Make an arbitrary HTTP call to the KMS

  }, {
    key: "MakeKMSRequest",
    value: function () {
      var _MakeKMSRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee25(_ref25) {
        var kmsId, objectId, versionHash, _ref25$method, method, path, bodyType, _ref25$body, body, _ref25$queryParams, queryParams, headers, kmsUrls, kmsHttpClient;

        return _regeneratorRuntime.wrap(function _callee25$(_context25) {
          while (1) {
            switch (_context25.prev = _context25.next) {
              case 0:
                kmsId = _ref25.kmsId, objectId = _ref25.objectId, versionHash = _ref25.versionHash, _ref25$method = _ref25.method, method = _ref25$method === void 0 ? "GET" : _ref25$method, path = _ref25.path, bodyType = _ref25.bodyType, _ref25$body = _ref25.body, body = _ref25$body === void 0 ? {} : _ref25$body, _ref25$queryParams = _ref25.queryParams, queryParams = _ref25$queryParams === void 0 ? {} : _ref25$queryParams, headers = _ref25.headers;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                if (!(!objectId && !kmsId)) {
                  _context25.next = 10;
                  break;
                }

                _context25.t0 = "ikms";
                _context25.t1 = Utils;
                _context25.next = 7;
                return this.client.DefaultKMSAddress();

              case 7:
                _context25.t2 = _context25.sent;
                _context25.t3 = _context25.t1.AddressToHash.call(_context25.t1, _context25.t2);
                kmsId = _context25.t0.concat.call(_context25.t0, _context25.t3);

              case 10:
                _context25.next = 12;
                return this.KMSInfo({
                  kmsId: kmsId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 12:
                kmsUrls = _context25.sent.urls;

                if (!(!kmsUrls || !kmsUrls[0])) {
                  _context25.next = 15;
                  break;
                }

                throw Error("No KMS info set for ".concat(versionHash || objectId || "default KMS"));

              case 15:
                kmsHttpClient = new HttpClient({
                  uris: kmsUrls
                });
                _context25.next = 18;
                return kmsHttpClient.Request({
                  method: method,
                  path: path,
                  bodyType: bodyType,
                  body: body,
                  headers: headers,
                  queryParams: queryParams
                });

              case 18:
                return _context25.abrupt("return", _context25.sent);

              case 19:
              case "end":
                return _context25.stop();
            }
          }
        }, _callee25, this);
      }));

      function MakeKMSRequest(_x25) {
        return _MakeKMSRequest.apply(this, arguments);
      }

      return MakeKMSRequest;
    }()
  }, {
    key: "ContractHasMethod",
    value: function () {
      var _ContractHasMethod = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee26(_ref26) {
        var contractAddress, abi, methodName, key, method, methodSignature, methodId;
        return _regeneratorRuntime.wrap(function _callee26$(_context26) {
          while (1) {
            switch (_context26.prev = _context26.next) {
              case 0:
                contractAddress = _ref26.contractAddress, abi = _ref26.abi, methodName = _ref26.methodName;
                contractAddress = Utils.FormatAddress(contractAddress);
                key = "".concat(contractAddress, "-").concat(methodName);

                if (!(this.methodAvailability[key] === undefined)) {
                  _context26.next = 19;
                  break;
                }

                this.Log("Checking method availability: ".concat(contractAddress, " ").concat(methodName));

                if (abi) {
                  _context26.next = 9;
                  break;
                }

                _context26.next = 8;
                return this.ContractInfo({
                  address: contractAddress
                });

              case 8:
                abi = _context26.sent.abi;

              case 9:
                if (abi) {
                  _context26.next = 11;
                  break;
                }

                throw Error("No ABI for contract ".concat(contractAddress, " - Wrong network or deleted item?"));

              case 11:
                method = abi.find(function (method) {
                  return method.name === methodName;
                });

                if (method) {
                  _context26.next = 14;
                  break;
                }

                return _context26.abrupt("return", false);

              case 14:
                methodSignature = "".concat(method.name, "(").concat(method.inputs.map(function (i) {
                  return i.type;
                }).join(","), ")");
                methodId = Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(methodSignature)).replace("0x", "").slice(0, 8);
                _context26.next = 18;
                return this.MakeElvMasterCall({
                  methodName: "elv_deployedContractHasMethod",
                  params: [contractAddress, methodId]
                });

              case 18:
                this.methodAvailability[key] = _context26.sent;

              case 19:
                return _context26.abrupt("return", this.methodAvailability[key]);

              case 20:
              case "end":
                return _context26.stop();
            }
          }
        }, _callee26, this);
      }));

      function ContractHasMethod(_x26) {
        return _ContractHasMethod.apply(this, arguments);
      }

      return ContractHasMethod;
    }()
  }, {
    key: "MakeElvMasterCall",
    value: function () {
      var _MakeElvMasterCall = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee27(_ref27) {
        var methodName, params;
        return _regeneratorRuntime.wrap(function _callee27$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                methodName = _ref27.methodName, params = _ref27.params;
                _context27.next = 3;
                return this.client.ethClient.MakeProviderCall({
                  methodName: "send",
                  args: [methodName, params]
                });

              case 3:
                return _context27.abrupt("return", _context27.sent);

              case 4:
              case "end":
                return _context27.stop();
            }
          }
        }, _callee27, this);
      }));

      function MakeElvMasterCall(_x27) {
        return _MakeElvMasterCall.apply(this, arguments);
      }

      return MakeElvMasterCall;
    }()
  }, {
    key: "ReEncryptionConk",
    value: function () {
      var _ReEncryptionConk = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee28(_ref28) {
        var libraryId, objectId, versionHash, cap;
        return _regeneratorRuntime.wrap(function _callee28$(_context28) {
          while (1) {
            switch (_context28.prev = _context28.next) {
              case 0:
                libraryId = _ref28.libraryId, objectId = _ref28.objectId, versionHash = _ref28.versionHash;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                if (this.reencryptionKeys[objectId]) {
                  _context28.next = 10;
                  break;
                }

                _context28.next = 5;
                return this.client.Crypto.GenerateTargetConk();

              case 5:
                cap = _context28.sent;
                _context28.next = 8;
                return this.RetrieveReencryptionSymmetricKey({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 8:
                cap.symm_key = _context28.sent;
                this.reencryptionKeys[objectId] = cap;

              case 10:
                return _context28.abrupt("return", this.reencryptionKeys[objectId]);

              case 11:
              case "end":
                return _context28.stop();
            }
          }
        }, _callee28, this);
      }));

      function ReEncryptionConk(_x28) {
        return _ReEncryptionConk.apply(this, arguments);
      }

      return ReEncryptionConk;
    }()
  }, {
    key: "EncryptionConk",
    value: function () {
      var _EncryptionConk = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee29(_ref29) {
        var libraryId, objectId, versionHash, conk, _yield$this$client$Cr, secret_key;

        return _regeneratorRuntime.wrap(function _callee29$(_context29) {
          while (1) {
            switch (_context29.prev = _context29.next) {
              case 0:
                libraryId = _ref29.libraryId, objectId = _ref29.objectId, versionHash = _ref29.versionHash;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                if (libraryId) {
                  _context29.next = 6;
                  break;
                }

                _context29.next = 5;
                return this.client.ContentObjectLibraryId({
                  objectId: objectId
                });

              case 5:
                libraryId = _context29.sent;

              case 6:
                if (this.encryptionKeys[objectId]) {
                  _context29.next = 16;
                  break;
                }

                _context29.next = 9;
                return this.RetrieveConk({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 9:
                conk = _context29.sent;
                _context29.next = 12;
                return this.client.Crypto.GeneratePrimaryConk({
                  objectId: objectId
                });

              case 12:
                _yield$this$client$Cr = _context29.sent;
                secret_key = _yield$this$client$Cr.secret_key;
                conk.secret_key = secret_key; // { secret_key, public_key, symm_key, block_size }

                this.encryptionKeys[objectId] = conk;

              case 16:
                return _context29.abrupt("return", this.encryptionKeys[objectId]);

              case 17:
              case "end":
                return _context29.stop();
            }
          }
        }, _callee29, this);
      }));

      function EncryptionConk(_x29) {
        return _EncryptionConk.apply(this, arguments);
      }

      return EncryptionConk;
    }()
  }, {
    key: "RecordTags",
    value: function () {
      var _RecordTags = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee30(_ref30) {
        var accessType, libraryId, objectId, versionHash, _yield$this$ContractI8, abi, owner;

        return _regeneratorRuntime.wrap(function _callee30$(_context30) {
          while (1) {
            switch (_context30.prev = _context30.next) {
              case 0:
                accessType = _ref30.accessType, libraryId = _ref30.libraryId, objectId = _ref30.objectId, versionHash = _ref30.versionHash;

                if (!(accessType !== ACCESS_TYPES.OBJECT)) {
                  _context30.next = 3;
                  break;
                }

                return _context30.abrupt("return");

              case 3:
                _context30.next = 5;
                return this.ContractInfo({
                  id: objectId
                });

              case 5:
                _yield$this$ContractI8 = _context30.sent;
                abi = _yield$this$ContractI8.abi;
                _context30.next = 9;
                return this.Owner({
                  id: objectId,
                  abi: abi
                });

              case 9:
                owner = _context30.sent;

                if (Utils.EqualAddress(owner, this.client.signer.address)) {
                  _context30.next = 13;
                  break;
                }

                _context30.next = 13;
                return this.client.userProfileClient.RecordTags({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 13:
              case "end":
                return _context30.stop();
            }
          }
        }, _callee30, this);
      }));

      function RecordTags(_x30) {
        return _RecordTags.apply(this, arguments);
      }

      return RecordTags;
    }()
    /* Creation methods */

  }, {
    key: "CreateAccessGroup",
    value: function () {
      var _CreateAccessGroup = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee31() {
        var _yield$this$client$et, contractAddress, transactionHash;

        return _regeneratorRuntime.wrap(function _callee31$(_context31) {
          while (1) {
            switch (_context31.prev = _context31.next) {
              case 0:
                _context31.next = 2;
                return this.client.ethClient.DeployAccessGroupContract({
                  contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                  signer: this.client.signer
                });

              case 2:
                _yield$this$client$et = _context31.sent;
                contractAddress = _yield$this$client$et.contractAddress;
                transactionHash = _yield$this$client$et.transactionHash;
                return _context31.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 6:
              case "end":
                return _context31.stop();
            }
          }
        }, _callee31, this);
      }));

      function CreateAccessGroup() {
        return _CreateAccessGroup.apply(this, arguments);
      }

      return CreateAccessGroup;
    }()
  }, {
    key: "CreateContentType",
    value: function () {
      var _CreateContentType = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee32() {
        var _yield$this$client$et2, contractAddress, transactionHash;

        return _regeneratorRuntime.wrap(function _callee32$(_context32) {
          while (1) {
            switch (_context32.prev = _context32.next) {
              case 0:
                _context32.next = 2;
                return this.client.ethClient.DeployTypeContract({
                  contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                  signer: this.client.signer
                });

              case 2:
                _yield$this$client$et2 = _context32.sent;
                contractAddress = _yield$this$client$et2.contractAddress;
                transactionHash = _yield$this$client$et2.transactionHash;
                return _context32.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 6:
              case "end":
                return _context32.stop();
            }
          }
        }, _callee32, this);
      }));

      function CreateContentType() {
        return _CreateContentType.apply(this, arguments);
      }

      return CreateContentType;
    }()
  }, {
    key: "CreateContentLibrary",
    value: function () {
      var _CreateContentLibrary = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee33(_ref31) {
        var kmsId, _yield$this$client$et3, contractAddress, transactionHash;

        return _regeneratorRuntime.wrap(function _callee33$(_context33) {
          while (1) {
            switch (_context33.prev = _context33.next) {
              case 0:
                kmsId = _ref31.kmsId;
                _context33.next = 3;
                return this.client.ethClient.DeployLibraryContract({
                  contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                  kmsId: kmsId,
                  signer: this.client.signer
                });

              case 3:
                _yield$this$client$et3 = _context33.sent;
                contractAddress = _yield$this$client$et3.contractAddress;
                transactionHash = _yield$this$client$et3.transactionHash;
                return _context33.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 7:
              case "end":
                return _context33.stop();
            }
          }
        }, _callee33, this);
      }));

      function CreateContentLibrary(_x31) {
        return _CreateContentLibrary.apply(this, arguments);
      }

      return CreateContentLibrary;
    }()
  }, {
    key: "CreateContentObject",
    value: function () {
      var _CreateContentObject = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee34(_ref32) {
        var libraryId, typeId, _yield$this$client$et4, contractAddress, transactionHash;

        return _regeneratorRuntime.wrap(function _callee34$(_context34) {
          while (1) {
            switch (_context34.prev = _context34.next) {
              case 0:
                libraryId = _ref32.libraryId, typeId = _ref32.typeId;
                _context34.next = 3;
                return this.client.ethClient.DeployContentContract({
                  contentLibraryAddress: Utils.HashToAddress(libraryId),
                  typeAddress: typeId ? Utils.HashToAddress(typeId) : Utils.nullAddress,
                  signer: this.client.signer
                });

              case 3:
                _yield$this$client$et4 = _context34.sent;
                contractAddress = _yield$this$client$et4.contractAddress;
                transactionHash = _yield$this$client$et4.transactionHash;
                return _context34.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 7:
              case "end":
                return _context34.stop();
            }
          }
        }, _callee34, this);
      }));

      function CreateContentObject(_x32) {
        return _CreateContentObject.apply(this, arguments);
      }

      return CreateContentObject;
    }() // Clear cached access transaction IDs and state channel tokens

  }, {
    key: "ClearCache",
    value: function ClearCache() {
      this.accessTransactions = {};
      this.modifyTransactions = {};
      this.channelContentTokens = {};
    }
  }]);

  return AuthorizationClient;
}();

module.exports = AuthorizationClient;