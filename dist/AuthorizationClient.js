"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Ethers = require("ethers");

var Id = require("./Id");

var Crypto = require("./Crypto");

var Utils = require("./Utils"); // -- Contract javascript files built using build/BuildContracts.js


var SpaceContract = require("./contracts/BaseContentSpace");

var LibraryContract = require("./contracts/BaseLibrary");

var TypeContract = require("./contracts/BaseContentType");

var ContentContract = require("./contracts/BaseContent");

var OwnableContract = require("./contracts/Ownable");

var AccessibleContract = require("./contracts/Accessible");

var EditableContract = require("./contracts/Editable");

var ACCESS_TYPES = {
  SPACE: "space",
  LIBRARY: "library",
  TYPE: "type",
  OBJECT: "object",
  WALLET: "wallet",
  GROUP: "group",
  OTHER: "other"
};

var AuthorizationClient =
/*#__PURE__*/
function () {
  function AuthorizationClient(_ref) {
    var client = _ref.client,
        contentSpaceId = _ref.contentSpaceId,
        _ref$noCache = _ref.noCache,
        noCache = _ref$noCache === void 0 ? false : _ref$noCache,
        _ref$noAuth = _ref.noAuth,
        noAuth = _ref$noAuth === void 0 ? false : _ref$noAuth;

    _classCallCheck(this, AuthorizationClient);

    this.client = client;
    this.contentSpaceId = contentSpaceId;
    this.noCache = noCache;
    this.noAuth = noAuth;
    this.accessTransactions = {
      spaces: {},
      libraries: {},
      objects: {},
      types: {},
      other: {}
    };
    this.modifyTransactions = {
      spaces: {},
      libraries: {},
      objects: {},
      types: {},
      other: {}
    };
    this.channelContentTokens = {};
    this.reencryptionKeys = {};
    this.requestIds = {};
    this.accessTypes = {};
  }

  _createClass(AuthorizationClient, [{
    key: "AuthorizationHeader",
    value: function () {
      var _AuthorizationHeader = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(_ref2) {
        var libraryId, objectId, versionHash, partHash, encryption, _ref2$update, update, _ref2$channelAuth, channelAuth, _ref2$noCache, noCache, _ref2$noAuth, noAuth, authorizationToken, headers;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                libraryId = _ref2.libraryId, objectId = _ref2.objectId, versionHash = _ref2.versionHash, partHash = _ref2.partHash, encryption = _ref2.encryption, _ref2$update = _ref2.update, update = _ref2$update === void 0 ? false : _ref2$update, _ref2$channelAuth = _ref2.channelAuth, channelAuth = _ref2$channelAuth === void 0 ? false : _ref2$channelAuth, _ref2$noCache = _ref2.noCache, noCache = _ref2$noCache === void 0 ? false : _ref2$noCache, _ref2$noAuth = _ref2.noAuth, noAuth = _ref2$noAuth === void 0 ? false : _ref2$noAuth;
                _context.next = 3;
                return this.AuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  partHash: partHash,
                  encryption: encryption,
                  update: update,
                  channelAuth: channelAuth,
                  noCache: noCache,
                  noAuth: noAuth
                });

              case 3:
                authorizationToken = _context.sent;
                headers = {
                  Authorization: "Bearer " + authorizationToken
                };

                if (encryption && encryption !== "none") {
                  headers["X-Content-Fabric-Encryption-Scheme"] = encryption;
                }

                return _context.abrupt("return", headers);

              case 7:
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
    }() // Wrapper for GenerateAuthorizationHeader to allow for per-call disabling of cache

  }, {
    key: "AuthorizationToken",
    value: function () {
      var _AuthorizationToken = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(_ref3) {
        var libraryId, objectId, versionHash, partHash, encryption, _ref3$update, update, _ref3$channelAuth, channelAuth, _ref3$noCache, noCache, _ref3$noAuth, noAuth, initialNoCache, authorizationToken;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                libraryId = _ref3.libraryId, objectId = _ref3.objectId, versionHash = _ref3.versionHash, partHash = _ref3.partHash, encryption = _ref3.encryption, _ref3$update = _ref3.update, update = _ref3$update === void 0 ? false : _ref3$update, _ref3$channelAuth = _ref3.channelAuth, channelAuth = _ref3$channelAuth === void 0 ? false : _ref3$channelAuth, _ref3$noCache = _ref3.noCache, noCache = _ref3$noCache === void 0 ? false : _ref3$noCache, _ref3$noAuth = _ref3.noAuth, noAuth = _ref3$noAuth === void 0 ? false : _ref3$noAuth;
                initialNoCache = this.noCache;
                _context2.prev = 2;

                // noCache enabled for this call
                if (noCache && !this.noCache) {
                  this.noCache = true;
                }

                if (!channelAuth) {
                  _context2.next = 10;
                  break;
                }

                _context2.next = 7;
                return this.GenerateChannelContentToken({
                  objectId: objectId
                });

              case 7:
                authorizationToken = _context2.sent;
                _context2.next = 13;
                break;

              case 10:
                _context2.next = 12;
                return this.GenerateAuthorizationToken({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  partHash: partHash,
                  encryption: encryption,
                  update: update,
                  noAuth: noAuth
                });

              case 12:
                authorizationToken = _context2.sent;

              case 13:
                this.noCache = initialNoCache;
                return _context2.abrupt("return", authorizationToken);

              case 17:
                _context2.prev = 17;
                _context2.t0 = _context2["catch"](2);
                // Ensure nocache is properly reset
                this.noCache = initialNoCache;
                throw _context2.t0;

              case 21:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[2, 17]]);
      }));

      function AuthorizationToken(_x2) {
        return _AuthorizationToken.apply(this, arguments);
      }

      return AuthorizationToken;
    }()
  }, {
    key: "Owner",
    value: function () {
      var _Owner = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(_ref4) {
        var id, abi, ownerAddress;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                id = _ref4.id, abi = _ref4.abi;

                if (this.client.signer) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return", false);

              case 3:
                _context3.next = 5;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(id),
                  abi: abi,
                  methodName: "owner",
                  methodArgs: []
                });

              case 5:
                ownerAddress = _context3.sent;
                return _context3.abrupt("return", Utils.FormatAddress(ownerAddress));

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function Owner(_x3) {
        return _Owner.apply(this, arguments);
      }

      return Owner;
    }()
  }, {
    key: "Sign",
    value: function () {
      var _Sign = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(message) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return Promise.resolve(Ethers.utils.joinSignature(this.client.signer.signingKey.signDigest(message)));

              case 2:
                return _context4.abrupt("return", _context4.sent);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function Sign(_x4) {
        return _Sign.apply(this, arguments);
      }

      return Sign;
    }()
  }, {
    key: "KMSInfo",
    value: function () {
      var _KMSInfo = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(_ref5) {
        var objectId, versionHash, KMSInfo;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                objectId = _ref5.objectId, versionHash = _ref5.versionHash;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                } // Get KMS info for the object


                _context5.next = 4;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "getKMSInfo",
                  methodArgs: [[]]
                });

              case 4:
                KMSInfo = _context5.sent;
                return _context5.abrupt("return", {
                  urls: KMSInfo[0],
                  publicKey: KMSInfo[1]
                });

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function KMSInfo(_x5) {
        return _KMSInfo.apply(this, arguments);
      }

      return KMSInfo;
    }()
  }, {
    key: "KMSUrl",
    value: function () {
      var _KMSUrl = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(_ref6) {
        var objectId, versionHash, KMSUrls;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                objectId = _ref6.objectId, versionHash = _ref6.versionHash;
                _context6.next = 3;
                return this.KMSInfo({
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 3:
                KMSUrls = _context6.sent.urls;
                // Randomize order of URLs so the same one isn't chosen every time
                KMSUrls = KMSUrls.split(",").sort(function () {
                  return 0.5 - Math.random();
                }); // Prefer HTTPS urls

                return _context6.abrupt("return", KMSUrls.find(function (url) {
                  return url.startsWith("https");
                }) || KMSUrls.find(function (url) {
                  return url.startsWith("http");
                }));

              case 6:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function KMSUrl(_x6) {
        return _KMSUrl.apply(this, arguments);
      }

      return KMSUrl;
    }()
  }, {
    key: "ReEncryptionCap",
    value: function () {
      var _ReEncryptionCap = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(_ref7) {
        var libraryId, objectId, cap, args, stateChannelUri, stateChannelProvider;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                libraryId = _ref7.libraryId, objectId = _ref7.objectId;

                if (this.reencryptionKeys[objectId]) {
                  _context7.next = 20;
                  break;
                }

                _context7.next = 4;
                return Crypto.GenerateTargetCap();

              case 4:
                cap = _context7.sent;

                if (libraryId) {
                  _context7.next = 11;
                  break;
                }

                _context7.t0 = Utils;
                _context7.next = 9;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "libraryAddress"
                });

              case 9:
                _context7.t1 = _context7.sent;
                libraryId = _context7.t0.AddressToLibraryId.call(_context7.t0, _context7.t1);

              case 11:
                args = [this.client.contentSpaceId, libraryId, objectId, ""];
                _context7.next = 14;
                return this.KMSUrl({
                  objectId: objectId
                });

              case 14:
                stateChannelUri = _context7.sent;
                stateChannelProvider = new Ethers.providers.JsonRpcProvider(stateChannelUri);
                _context7.next = 18;
                return stateChannelProvider.send("elv_getSymmetricKey", args);

              case 18:
                cap.symm_key = _context7.sent;
                this.reencryptionKeys[objectId] = cap;

              case 20:
                return _context7.abrupt("return", this.reencryptionKeys[objectId]);

              case 21:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function ReEncryptionCap(_x7) {
        return _ReEncryptionCap.apply(this, arguments);
      }

      return ReEncryptionCap;
    }()
  }, {
    key: "GenerateChannelContentToken",
    value: function () {
      var _GenerateChannelContentToken = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(_ref8) {
        var objectId, _ref8$value, value, nonce, paramTypes, params, packedHash, stateChannelUri, stateChannelProvider, payload, signature, multiSig, token;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                objectId = _ref8.objectId, _ref8$value = _ref8.value, value = _ref8$value === void 0 ? 0 : _ref8$value;

                if (!(!this.noCache && this.channelContentTokens[objectId])) {
                  _context8.next = 3;
                  break;
                }

                return _context8.abrupt("return", this.channelContentTokens[objectId]);

              case 3:
                nonce = Date.now() + Id.next();
                paramTypes = ["address", "address", "uint", "uint"];
                params = [this.client.signer.address, Utils.HashToAddress(objectId), value, nonce];
                packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
                _context8.next = 9;
                return this.Sign(packedHash);

              case 9:
                params[4] = _context8.sent;
                _context8.next = 12;
                return this.KMSUrl({
                  objectId: objectId
                });

              case 12:
                stateChannelUri = _context8.sent;
                stateChannelProvider = new Ethers.providers.JsonRpcProvider(stateChannelUri);
                _context8.next = 16;
                return stateChannelProvider.send("elv_channelContentRequest", params);

              case 16:
                payload = _context8.sent;
                _context8.next = 19;
                return this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(payload)));

              case 19:
                signature = _context8.sent;
                multiSig = Utils.FormatSignature(signature);
                token = "".concat(payload, ".").concat(Utils.B64(multiSig));

                if (!this.noCache) {
                  this.channelContentTokens[objectId] = token;
                }

                return _context8.abrupt("return", token);

              case 24:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function GenerateChannelContentToken(_x8) {
        return _GenerateChannelContentToken.apply(this, arguments);
      }

      return GenerateChannelContentToken;
    }()
  }, {
    key: "GenerateAuthorizationToken",
    value: function () {
      var _GenerateAuthorizationToken = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(_ref9) {
        var libraryId, objectId, versionHash, partHash, encryption, _ref9$update, update, _ref9$noAuth, noAuth, _ref10, transactionHash, token, owner, cap, signature, multiSig;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                libraryId = _ref9.libraryId, objectId = _ref9.objectId, versionHash = _ref9.versionHash, partHash = _ref9.partHash, encryption = _ref9.encryption, _ref9$update = _ref9.update, update = _ref9$update === void 0 ? false : _ref9$update, _ref9$noAuth = _ref9.noAuth, noAuth = _ref9$noAuth === void 0 ? false : _ref9$noAuth;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                _context9.next = 4;
                return this.MakeAccessRequest({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  update: update,
                  noCache: this.noCache,
                  noAuth: this.noAuth || noAuth
                });

              case 4:
                _ref10 = _context9.sent;
                transactionHash = _ref10.transactionHash;
                token = {
                  qspace_id: this.contentSpaceId,
                  addr: (this.client.signer && this.client.signer.address || "").replace("0x", ""),
                  tx_id: (transactionHash || "").replace("0x", "")
                };

                if (libraryId) {
                  token.qlib_id = libraryId;
                }

                if (partHash) {
                  token.qphash = partHash;
                }

                _context9.t1 = objectId;

                if (!_context9.t1) {
                  _context9.next = 16;
                  break;
                }

                _context9.next = 13;
                return this.AccessType(objectId);

              case 13:
                _context9.t2 = _context9.sent;
                _context9.t3 = ACCESS_TYPES.OBJECT;
                _context9.t1 = _context9.t2 === _context9.t3;

              case 16:
                _context9.t0 = _context9.t1;

                if (!_context9.t0) {
                  _context9.next = 19;
                  break;
                }

                _context9.t0 = encryption;

              case 19:
                if (!_context9.t0) {
                  _context9.next = 28;
                  break;
                }

                _context9.next = 22;
                return this.Owner({
                  id: objectId,
                  abi: ContentContract.abi
                });

              case 22:
                owner = _context9.sent;

                if (Utils.EqualAddress(owner, this.client.signer.address)) {
                  _context9.next = 28;
                  break;
                }

                _context9.next = 26;
                return this.ReEncryptionCap({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 26:
                cap = _context9.sent;
                token.afgh_pk = cap.public_key;

              case 28:
                token = Utils.B64(JSON.stringify(token));
                _context9.next = 31;
                return this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(token)));

              case 31:
                signature = _context9.sent;
                multiSig = Utils.FormatSignature(signature);
                return _context9.abrupt("return", "".concat(token, ".").concat(Utils.B64(multiSig)));

              case 34:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function GenerateAuthorizationToken(_x9) {
        return _GenerateAuthorizationToken.apply(this, arguments);
      }

      return GenerateAuthorizationToken;
    }() // Generate proper authorization header based on the information provided

  }, {
    key: "MakeAccessRequest",
    value: function () {
      var _MakeAccessRequest = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(_ref11) {
        var _this = this;

        var libraryId, objectId, versionHash, _ref11$args, args, _ref11$update, update, _ref11$skipCache, skipCache, _ref11$noCache, noCache, _ref11$noAuth, noAuth, cacheOnly, id, accessType, cacheCollection, abi, cache, checkAccessCharge, accessRequest;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                libraryId = _ref11.libraryId, objectId = _ref11.objectId, versionHash = _ref11.versionHash, _ref11$args = _ref11.args, args = _ref11$args === void 0 ? [] : _ref11$args, _ref11$update = _ref11.update, update = _ref11$update === void 0 ? false : _ref11$update, _ref11$skipCache = _ref11.skipCache, skipCache = _ref11$skipCache === void 0 ? false : _ref11$skipCache, _ref11$noCache = _ref11.noCache, noCache = _ref11$noCache === void 0 ? false : _ref11$noCache, _ref11$noAuth = _ref11.noAuth, noAuth = _ref11$noAuth === void 0 ? false : _ref11$noAuth, cacheOnly = _ref11.cacheOnly;

                if (!(noAuth || !this.client.signer)) {
                  _context10.next = 3;
                  break;
                }

                return _context10.abrupt("return", {
                  transactionHash: ""
                });

              case 3:
                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                id = objectId || libraryId || this.contentSpaceId;
                _context10.next = 7;
                return this.AccessType(id);

              case 7:
                accessType = _context10.sent;
                cacheCollection = update ? this.modifyTransactions : this.accessTransactions;
                checkAccessCharge = false;
                _context10.t0 = accessType;
                _context10.next = _context10.t0 === ACCESS_TYPES.SPACE ? 13 : _context10.t0 === ACCESS_TYPES.LIBRARY ? 16 : _context10.t0 === ACCESS_TYPES.TYPE ? 19 : _context10.t0 === ACCESS_TYPES.OBJECT ? 22 : 27;
                break;

              case 13:
                abi = SpaceContract.abi;
                cache = cacheCollection.spaces;
                return _context10.abrupt("break", 29);

              case 16:
                abi = LibraryContract.abi;
                cache = cacheCollection.libraries;
                return _context10.abrupt("break", 29);

              case 19:
                abi = TypeContract.abi;
                cache = cacheCollection.types;
                return _context10.abrupt("break", 29);

              case 22:
                abi = ContentContract.abi;
                cache = cacheCollection.objects;
                checkAccessCharge = true;

                if (args && args.length > 0) {
                  // Inject public key of requester
                  args[1] = this.client.signer.signingKey ? this.client.signer.signingKey.publicKey : "";
                } else {
                  // Set default args
                  args = [0, // Access level
                  this.client.signer.signingKey ? this.client.signer.signingKey.publicKey : "", // Public key of requester
                  "", //cap.public_key,
                  [], // Custom values
                  [] // Stakeholders
                  ];
                }

                return _context10.abrupt("break", 29);

              case 27:
                abi = update ? EditableContract.abi : AccessibleContract.abi;
                cache = cacheCollection.other;

              case 29:
                if (!(!noCache && !skipCache)) {
                  _context10.next = 32;
                  break;
                }

                if (!cache[id]) {
                  _context10.next = 32;
                  break;
                }

                return _context10.abrupt("return", {
                  transactionHash: cache[id]
                });

              case 32:
                if (!cacheOnly) {
                  _context10.next = 34;
                  break;
                }

                return _context10.abrupt("return");

              case 34:
                accessRequest = {
                  transactionHash: ""
                }; // Make the request

                if (!update) {
                  _context10.next = 41;
                  break;
                }

                _context10.next = 38;
                return this.UpdateRequest({
                  id: id,
                  abi: abi
                });

              case 38:
                accessRequest = _context10.sent;
                _context10.next = 44;
                break;

              case 41:
                _context10.next = 43;
                return this.AccessRequest({
                  id: id,
                  abi: abi,
                  args: args,
                  checkAccessCharge: checkAccessCharge
                });

              case 43:
                accessRequest = _context10.sent;

              case 44:
                // Cache the transaction hash
                if (!noCache) {
                  cache[id] = accessRequest.transactionHash; // Save request ID if present

                  accessRequest.logs.some(function (log) {
                    if (log.values && log.values.requestID) {
                      _this.requestIds[id] = log.values.requestID;
                      return true;
                    }
                  });
                }

                _context10.next = 47;
                return this.RecordTags({
                  accessType: accessType,
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 47:
                return _context10.abrupt("return", accessRequest);

              case 48:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function MakeAccessRequest(_x10) {
        return _MakeAccessRequest.apply(this, arguments);
      }

      return MakeAccessRequest;
    }()
  }, {
    key: "RecordTags",
    value: function () {
      var _RecordTags = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11(_ref12) {
        var accessType, libraryId, objectId, versionHash, owner;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                accessType = _ref12.accessType, libraryId = _ref12.libraryId, objectId = _ref12.objectId, versionHash = _ref12.versionHash;

                if (!(accessType !== ACCESS_TYPES.OBJECT)) {
                  _context11.next = 3;
                  break;
                }

                return _context11.abrupt("return");

              case 3:
                _context11.next = 5;
                return this.Owner({
                  id: objectId,
                  abi: ContentContract.abi
                });

              case 5:
                owner = _context11.sent;

                if (Utils.EqualAddress(owner, this.client.signer.address)) {
                  _context11.next = 9;
                  break;
                }

                _context11.next = 9;
                return this.client.userProfileClient.RecordTags({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 9:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function RecordTags(_x11) {
        return _RecordTags.apply(this, arguments);
      }

      return RecordTags;
    }()
  }, {
    key: "CacheLibraryTransaction",
    value: function CacheLibraryTransaction(_ref13) {
      var libraryId = _ref13.libraryId,
          transactionHash = _ref13.transactionHash;
      this.modifyTransactions.libraries[libraryId] = transactionHash;
    }
  }, {
    key: "CacheObjectTransaction",
    value: function CacheObjectTransaction(_ref14) {
      var objectId = _ref14.objectId,
          transactionHash = _ref14.transactionHash;
      this.modifyTransactions.objects[objectId] = transactionHash;
    }
    /* Access */

  }, {
    key: "AccessType",
    value: function () {
      var _AccessType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(id) {
        var accessType, version;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!this.accessTypes[id]) {
                  _context12.next = 2;
                  break;
                }

                return _context12.abrupt("return", this.accessTypes[id]);

              case 2:
                _context12.prev = 2;
                _context12.t0 = Ethers.utils;
                _context12.next = 6;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(id),
                  abi: OwnableContract.abi,
                  methodName: "version"
                });

              case 6:
                _context12.t1 = _context12.sent;
                version = _context12.t0.parseBytes32String.call(_context12.t0, _context12.t1);

                if (version.match(/BaseContentSpace\d+.*/)) {
                  // BaseContentSpace20190612120000PO
                  accessType = ACCESS_TYPES.SPACE;
                } else if (version.match(/BaseLibrary\d+.*/)) {
                  // BaseLibrary20190605150200ML
                  accessType = ACCESS_TYPES.LIBRARY;
                } else if (version.match(/BaseContentType\d+.*/)) {
                  // BaseContentType20190605150100ML
                  accessType = ACCESS_TYPES.TYPE;
                } else if (version.match(/BsAccessWallet\d+.*/)) {
                  // BaseContent20190611120000PO
                  accessType = ACCESS_TYPES.WALLET;
                } else if (version.match(/BsAccessCtrlGrp\d+.*/)) {
                  // BaseContent20190611120000PO
                  accessType = ACCESS_TYPES.GROUP;
                } else if (version.match(/BaseContent\d+.*/)) {
                  // BaseContent20190611120000PO
                  accessType = ACCESS_TYPES.OBJECT;
                } else {
                  accessType = ACCESS_TYPES.OTHER;
                }

                _context12.next = 14;
                break;

              case 11:
                _context12.prev = 11;
                _context12.t2 = _context12["catch"](2);
                accessType = ACCESS_TYPES.OTHER;

              case 14:
                this.accessTypes[id] = accessType;
                return _context12.abrupt("return", accessType);

              case 16:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[2, 11]]);
      }));

      function AccessType(_x12) {
        return _AccessType.apply(this, arguments);
      }

      return AccessType;
    }()
  }, {
    key: "GetAccessCharge",
    value: function () {
      var _GetAccessCharge = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(_ref15) {
        var objectId, args, info;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                objectId = _ref15.objectId, args = _ref15.args;
                _context13.next = 3;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "getAccessInfo",
                  methodArgs: args
                });

              case 3:
                info = _context13.sent;
                return _context13.abrupt("return", info[2]);

              case 5:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function GetAccessCharge(_x13) {
        return _GetAccessCharge.apply(this, arguments);
      }

      return GetAccessCharge;
    }()
  }, {
    key: "AccessComplete",
    value: function () {
      var _AccessComplete = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee14(_ref16) {
        var id, abi, score, requestId, event;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                id = _ref16.id, abi = _ref16.abi, score = _ref16.score;
                requestId = this.requestIds[id];

                if (requestId) {
                  _context14.next = 4;
                  break;
                }

                throw Error("Unknown request ID for " + id);

              case 4:
                _context14.next = 6;
                return this.client.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(id),
                  abi: abi,
                  methodName: "accessComplete",
                  methodArgs: [requestId, score, ""]
                });

              case 6:
                event = _context14.sent;
                delete this.requestIds[id];
                delete this.accessTransactions.objects[id];
                return _context14.abrupt("return", event);

              case 10:
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
  }, {
    key: "AccessRequest",
    value: function () {
      var _AccessRequest = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee15(_ref17) {
        var id, abi, _ref17$args, args, _ref17$checkAccessCha, checkAccessCharge, accessCharge, accessType, owner, accessChargeArgs, event, accessRequestEvent;

        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                id = _ref17.id, abi = _ref17.abi, _ref17$args = _ref17.args, args = _ref17$args === void 0 ? [] : _ref17$args, _ref17$checkAccessCha = _ref17.checkAccessCharge, checkAccessCharge = _ref17$checkAccessCha === void 0 ? false : _ref17$checkAccessCha;
                // Send some bux if access charge is required
                accessCharge = 0;
                _context15.next = 4;
                return this.AccessType(id);

              case 4:
                accessType = _context15.sent;

                if (!(checkAccessCharge && accessType === ACCESS_TYPES.OBJECT)) {
                  _context15.next = 16;
                  break;
                }

                _context15.next = 8;
                return this.Owner({
                  id: id,
                  abi: abi
                });

              case 8:
                owner = _context15.sent;

                if (Utils.EqualAddress(this.client.signer.address, owner)) {
                  _context15.next = 16;
                  break;
                }

                // Extract level, custom values and stakeholders from accessRequest arguments
                accessChargeArgs = [args[0], args[3], args[4]]; // Access charge is in wei, but methods take ether - convert to charge to ether

                _context15.t0 = Utils;
                _context15.next = 14;
                return this.GetAccessCharge({
                  objectId: id,
                  args: accessChargeArgs
                });

              case 14:
                _context15.t1 = _context15.sent;
                accessCharge = _context15.t0.WeiToEther.call(_context15.t0, _context15.t1);

              case 16:
                _context15.next = 18;
                return this.client.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(id),
                  abi: abi,
                  methodName: "accessRequest",
                  methodArgs: args,
                  value: accessCharge
                });

              case 18:
                event = _context15.sent;
                accessRequestEvent = this.client.ExtractEventFromLogs({
                  abi: abi,
                  event: event,
                  eventName: "AccessRequest"
                });

                if (!(event.logs.length === 0 || !accessRequestEvent)) {
                  _context15.next = 22;
                  break;
                }

                throw Error("Access denied");

              case 22:
                return _context15.abrupt("return", event);

              case 23:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function AccessRequest(_x15) {
        return _AccessRequest.apply(this, arguments);
      }

      return AccessRequest;
    }()
  }, {
    key: "UpdateRequest",
    value: function () {
      var _UpdateRequest = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee16(_ref18) {
        var id, abi;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                id = _ref18.id, abi = _ref18.abi;
                _context16.next = 3;
                return this.client.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(id),
                  abi: abi,
                  methodName: "updateRequest",
                  methodArgs: []
                });

              case 3:
                return _context16.abrupt("return", _context16.sent);

              case 4:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function UpdateRequest(_x16) {
        return _UpdateRequest.apply(this, arguments);
      }

      return UpdateRequest;
    }()
    /* Creation methods */

  }, {
    key: "CreateAccessGroup",
    value: function () {
      var _CreateAccessGroup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee17() {
        var _ref19, contractAddress, transactionHash;

        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                _context17.next = 2;
                return this.client.ethClient.DeployAccessGroupContract({
                  contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                  signer: this.client.signer
                });

              case 2:
                _ref19 = _context17.sent;
                contractAddress = _ref19.contractAddress;
                transactionHash = _ref19.transactionHash;
                return _context17.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 6:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function CreateAccessGroup() {
        return _CreateAccessGroup.apply(this, arguments);
      }

      return CreateAccessGroup;
    }()
  }, {
    key: "CreateContentType",
    value: function () {
      var _CreateContentType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee18() {
        var _ref20, contractAddress, transactionHash;

        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                _context18.next = 2;
                return this.client.ethClient.DeployTypeContract({
                  contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                  signer: this.client.signer
                });

              case 2:
                _ref20 = _context18.sent;
                contractAddress = _ref20.contractAddress;
                transactionHash = _ref20.transactionHash;
                return _context18.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 6:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function CreateContentType() {
        return _CreateContentType.apply(this, arguments);
      }

      return CreateContentType;
    }()
  }, {
    key: "CreateContentLibrary",
    value: function () {
      var _CreateContentLibrary = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee19(_ref21) {
        var kmsId, _ref22, contractAddress, transactionHash;

        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                kmsId = _ref21.kmsId;
                _context19.next = 3;
                return this.client.ethClient.DeployLibraryContract({
                  contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                  kmsId: kmsId,
                  signer: this.client.signer
                });

              case 3:
                _ref22 = _context19.sent;
                contractAddress = _ref22.contractAddress;
                transactionHash = _ref22.transactionHash;
                return _context19.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 7:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function CreateContentLibrary(_x17) {
        return _CreateContentLibrary.apply(this, arguments);
      }

      return CreateContentLibrary;
    }()
  }, {
    key: "CreateContentObject",
    value: function () {
      var _CreateContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee20(_ref23) {
        var libraryId, typeId, _ref24, contractAddress, transactionHash;

        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                libraryId = _ref23.libraryId, typeId = _ref23.typeId;
                _context20.next = 3;
                return this.client.ethClient.DeployContentContract({
                  contentLibraryAddress: Utils.HashToAddress(libraryId),
                  typeAddress: typeId ? Utils.HashToAddress(typeId) : Utils.nullAddress,
                  signer: this.client.signer
                });

              case 3:
                _ref24 = _context20.sent;
                contractAddress = _ref24.contractAddress;
                transactionHash = _ref24.transactionHash;
                return _context20.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 7:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this);
      }));

      function CreateContentObject(_x18) {
        return _CreateContentObject.apply(this, arguments);
      }

      return CreateContentObject;
    }() // Clear cached access transaction IDs and state channel tokens

  }, {
    key: "ClearCache",
    value: function ClearCache() {
      this.accessTransactions = {
        spaces: {},
        libraries: {},
        types: {},
        objects: {},
        other: {}
      };
      this.modifyTransactions = {
        spaces: {},
        libraries: {},
        types: {},
        objects: {},
        other: {}
      };
      this.channelContentTokens = {};
    }
  }]);

  return AuthorizationClient;
}();

module.exports = AuthorizationClient;