"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
  _createClass(AuthorizationClient, [{
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
      console.error("\n(elv-client-js#AuthorizationClient) ".concat(message, "\n")) : // eslint-disable-next-line no-console
      console.log("\n(elv-client-js#AuthorizationClient) ".concat(message, "\n"));
    }
  }]);

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

    this.client = client;
    this.contentSpaceId = contentSpaceId;
    this.noCache = noCache;
    this.noAuth = noAuth;
    this.debug = debug;
    this.accessTransactions = {
      spaces: {},
      libraries: {},
      objects: {},
      encryptedObjects: {},
      types: {},
      other: {}
    };
    this.modifyTransactions = {
      spaces: {},
      libraries: {},
      objects: {},
      encryptedObjects: {},
      types: {},
      other: {}
    };
    this.channelContentTokens = {};
    this.reencryptionKeys = {};
    this.requestIds = {};
  } // Return authorization token in appropriate headers


  _createClass(AuthorizationClient, [{
    key: "AuthorizationHeader",
    value: function () {
      var _AuthorizationHeader = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(params) {
        var authorizationToken, headers;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
    }() // Wrapper for GenerateAuthorizationHeader to allow for per-call disabling of cache

  }, {
    key: "AuthorizationToken",
    value: function () {
      var _AuthorizationToken = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(_ref2) {
        var libraryId, objectId, versionHash, partHash, encryption, audienceData, _ref2$update, update, _ref2$channelAuth, channelAuth, _ref2$noCache, noCache, _ref2$noAuth, noAuth, initialNoCache, authorizationToken;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                libraryId = _ref2.libraryId, objectId = _ref2.objectId, versionHash = _ref2.versionHash, partHash = _ref2.partHash, encryption = _ref2.encryption, audienceData = _ref2.audienceData, _ref2$update = _ref2.update, update = _ref2$update === void 0 ? false : _ref2$update, _ref2$channelAuth = _ref2.channelAuth, channelAuth = _ref2$channelAuth === void 0 ? false : _ref2$channelAuth, _ref2$noCache = _ref2.noCache, noCache = _ref2$noCache === void 0 ? false : _ref2$noCache, _ref2$noAuth = _ref2.noAuth, noAuth = _ref2$noAuth === void 0 ? false : _ref2$noAuth;
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
                  objectId: objectId,
                  audienceData: audienceData
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
                return _context2.abrupt("return", authorizationToken);

              case 16:
                _context2.prev = 16;
                _context2.t0 = _context2["catch"](2);
                throw _context2.t0;

              case 19:
                _context2.prev = 19;
                this.noCache = initialNoCache;
                return _context2.finish(19);

              case 22:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[2, 16, 19, 22]]);
      }));

      function AuthorizationToken(_x2) {
        return _AuthorizationToken.apply(this, arguments);
      }

      return AuthorizationToken;
    }()
  }, {
    key: "GenerateAuthorizationToken",
    value: function () {
      var _GenerateAuthorizationToken = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(_ref3) {
        var libraryId, objectId, versionHash, partHash, encryption, _ref3$update, update, _ref3$noAuth, noAuth, publicKey, owner, cap, token, _ref4, transactionHash, signature, multiSig;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                libraryId = _ref3.libraryId, objectId = _ref3.objectId, versionHash = _ref3.versionHash, partHash = _ref3.partHash, encryption = _ref3.encryption, _ref3$update = _ref3.update, update = _ref3$update === void 0 ? false : _ref3$update, _ref3$noAuth = _ref3.noAuth, noAuth = _ref3$noAuth === void 0 ? false : _ref3$noAuth;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                } // Generate AFGH public key if encryption is specified


                _context3.t0 = encryption && objectId;

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
                  _context3.next = 18;
                  break;
                }

                _context3.next = 12;
                return this.Owner({
                  id: objectId,
                  abi: ContentContract.abi
                });

              case 12:
                owner = _context3.sent;

                if (Utils.EqualAddress(owner, this.client.signer.address)) {
                  _context3.next = 18;
                  break;
                }

                _context3.next = 16;
                return this.ReEncryptionConk({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 16:
                cap = _context3.sent;
                publicKey = cap.public_key;

              case 18:
                token = {
                  qspace_id: this.contentSpaceId,
                  addr: Utils.FormatAddress(this.client.signer && this.client.signer.address || "")
                };

                if (this.noAuth || noAuth) {
                  _context3.next = 25;
                  break;
                }

                _context3.next = 22;
                return this.MakeAccessRequest({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  update: update,
                  publicKey: publicKey,
                  noCache: this.noCache,
                  noAuth: this.noAuth || noAuth
                });

              case 22:
                _ref4 = _context3.sent;
                transactionHash = _ref4.transactionHash;
                token.tx_id = transactionHash;

              case 25:
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
                _context3.next = 31;
                return this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(token)));

              case 31:
                signature = _context3.sent;
                multiSig = Utils.FormatSignature(signature);
                return _context3.abrupt("return", "".concat(token, ".").concat(Utils.B64(multiSig)));

              case 34:
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
    key: "MakeAccessRequest",
    value: function () {
      var _MakeAccessRequest = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(_ref5) {
        var _this = this;

        var libraryId, objectId, versionHash, _ref5$args, args, _ref5$publicKey, publicKey, _ref5$update, update, _ref5$skipCache, skipCache, _ref5$noCache, noCache, cacheOnly, walletContractAddress, walletCreated, id, accessType, _this$AccessInfo, abi, cache, accessArgs, checkAccessCharge, address, cacheHit, accessRequest;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                libraryId = _ref5.libraryId, objectId = _ref5.objectId, versionHash = _ref5.versionHash, _ref5$args = _ref5.args, args = _ref5$args === void 0 ? [] : _ref5$args, _ref5$publicKey = _ref5.publicKey, publicKey = _ref5$publicKey === void 0 ? "" : _ref5$publicKey, _ref5$update = _ref5.update, update = _ref5$update === void 0 ? false : _ref5$update, _ref5$skipCache = _ref5.skipCache, skipCache = _ref5$skipCache === void 0 ? false : _ref5$skipCache, _ref5$noCache = _ref5.noCache, noCache = _ref5$noCache === void 0 ? false : _ref5$noCache, cacheOnly = _ref5.cacheOnly;

                if (this.client.signer) {
                  _context4.next = 3;
                  break;
                }

                return _context4.abrupt("return", {
                  transactionHash: ""
                });

              case 3:
                _context4.next = 5;
                return this.client.userProfileClient.UserWalletAddress({
                  address: this.client.signer.address
                });

              case 5:
                walletContractAddress = _context4.sent;

                if (walletContractAddress) {
                  _context4.next = 12;
                  break;
                }

                _context4.next = 9;
                return this.client.userProfileClient.WalletAddress();

              case 9:
                walletCreated = _context4.sent;

                if (walletCreated) {
                  _context4.next = 12;
                  break;
                }

                throw Error("User wallet contract is required to make access requests");

              case 12:
                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                id = objectId || libraryId || this.contentSpaceId;
                _context4.next = 16;
                return this.AccessType(id);

              case 16:
                accessType = _context4.sent;
                _this$AccessInfo = this.AccessInfo({
                  accessType: accessType,
                  publicKey: publicKey,
                  update: update,
                  args: args
                }), abi = _this$AccessInfo.abi, cache = _this$AccessInfo.cache, accessArgs = _this$AccessInfo.accessArgs, checkAccessCharge = _this$AccessInfo.checkAccessCharge;
                address = Utils.HashToAddress(id); // Check cache for existing transaction

                if (!(!noCache && !skipCache)) {
                  _context4.next = 23;
                  break;
                }

                cacheHit = update ? cache.modify[address] : cache.access[address];

                if (!cacheHit) {
                  _context4.next = 23;
                  break;
                }

                return _context4.abrupt("return", {
                  transactionHash: cacheHit
                });

              case 23:
                if (!cacheOnly) {
                  _context4.next = 25;
                  break;
                }

                return _context4.abrupt("return");

              case 25:
                accessRequest = {
                  transactionHash: ""
                }; // Make the request

                if (!update) {
                  _context4.next = 33;
                  break;
                }

                this.Log("Making update request on ".concat(accessType, " ").concat(id));
                _context4.next = 30;
                return this.UpdateRequest({
                  id: id,
                  abi: abi
                });

              case 30:
                accessRequest = _context4.sent;
                _context4.next = 37;
                break;

              case 33:
                this.Log("Making access request on ".concat(accessType, " ").concat(id));
                _context4.next = 36;
                return this.AccessRequest({
                  id: id,
                  abi: abi,
                  args: accessArgs,
                  checkAccessCharge: checkAccessCharge
                });

              case 36:
                accessRequest = _context4.sent;

              case 37:
                // Cache the transaction hash
                if (!noCache) {
                  this.CacheTransaction({
                    accessType: accessType,
                    address: address,
                    publicKey: publicKey,
                    update: update,
                    transactionHash: accessRequest.transactionHash
                  }); // Save request ID if present

                  accessRequest.logs.some(function (log) {
                    if (log.values && log.values.requestID) {
                      _this.requestIds[address] = log.values.requestID;
                      return true;
                    }
                  });
                }

                this.RecordTags({
                  accessType: accessType,
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });
                return _context4.abrupt("return", accessRequest);

              case 40:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function MakeAccessRequest(_x4) {
        return _MakeAccessRequest.apply(this, arguments);
      }

      return MakeAccessRequest;
    }()
  }, {
    key: "AccessRequest",
    value: function () {
      var _AccessRequest = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(_ref6) {
        var id, abi, _ref6$args, args, _ref6$checkAccessChar, checkAccessCharge, accessCharge, accessType, owner, accessChargeArgs, event, accessRequestEvent;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                id = _ref6.id, abi = _ref6.abi, _ref6$args = _ref6.args, args = _ref6$args === void 0 ? [] : _ref6$args, _ref6$checkAccessChar = _ref6.checkAccessCharge, checkAccessCharge = _ref6$checkAccessChar === void 0 ? false : _ref6$checkAccessChar;
                // Send some bux if access charge is required
                accessCharge = 0;
                _context5.next = 4;
                return this.AccessType(id);

              case 4:
                accessType = _context5.sent;

                if (!(checkAccessCharge && accessType === ACCESS_TYPES.OBJECT)) {
                  _context5.next = 16;
                  break;
                }

                _context5.next = 8;
                return this.Owner({
                  id: id,
                  abi: abi
                });

              case 8:
                owner = _context5.sent;

                if (Utils.EqualAddress(this.client.signer.address, owner)) {
                  _context5.next = 16;
                  break;
                }

                // Extract level, custom values and stakeholders from accessRequest arguments
                accessChargeArgs = [args[0], args[3], args[4]]; // Access charge is in wei, but methods take ether - convert to charge to ether

                _context5.t0 = Utils;
                _context5.next = 14;
                return this.GetAccessCharge({
                  objectId: id,
                  args: accessChargeArgs
                });

              case 14:
                _context5.t1 = _context5.sent;
                accessCharge = _context5.t0.WeiToEther.call(_context5.t0, _context5.t1);

              case 16:
                if (accessCharge > 0) {
                  this.Log("Access charge: ".concat(accessCharge));
                } // If access request did not succeed, no event will be emitted


                _context5.next = 19;
                return this.client.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(id),
                  abi: abi,
                  methodName: "accessRequest",
                  methodArgs: args,
                  value: accessCharge
                });

              case 19:
                event = _context5.sent;
                accessRequestEvent = this.client.ExtractEventFromLogs({
                  abi: abi,
                  event: event,
                  eventName: "AccessRequest"
                });

                if (!(event.logs.length === 0 || !accessRequestEvent)) {
                  _context5.next = 23;
                  break;
                }

                throw Error("Access denied");

              case 23:
                return _context5.abrupt("return", event);

              case 24:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function AccessRequest(_x5) {
        return _AccessRequest.apply(this, arguments);
      }

      return AccessRequest;
    }()
  }, {
    key: "UpdateRequest",
    value: function () {
      var _UpdateRequest = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(_ref7) {
        var id, abi, event, updateRequestEvent;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                id = _ref7.id, abi = _ref7.abi;
                _context6.next = 3;
                return this.client.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(id),
                  abi: abi,
                  methodName: "updateRequest",
                  methodArgs: []
                });

              case 3:
                event = _context6.sent;
                updateRequestEvent = this.client.ExtractEventFromLogs({
                  abi: abi,
                  event: event,
                  eventName: "UpdateRequest"
                });

                if (!(event.logs.length === 0 || !updateRequestEvent)) {
                  _context6.next = 7;
                  break;
                }

                throw Error("Update request denied");

              case 7:
                return _context6.abrupt("return", event);

              case 8:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function UpdateRequest(_x6) {
        return _UpdateRequest.apply(this, arguments);
      }

      return UpdateRequest;
    }()
  }, {
    key: "GenerateChannelContentToken",
    value: function () {
      var _GenerateChannelContentToken = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(_ref8) {
        var objectId, audienceData, _ref8$value, value, nonce, paramTypes, params, packedHash, stateChannelApi, payload, signature, multiSig, token;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                objectId = _ref8.objectId, audienceData = _ref8.audienceData, _ref8$value = _ref8.value, value = _ref8$value === void 0 ? 0 : _ref8$value;

                if (!(!this.noCache && this.channelContentTokens[objectId])) {
                  _context7.next = 3;
                  break;
                }

                return _context7.abrupt("return", this.channelContentTokens[objectId]);

              case 3:
                this.Log("Making state channel access request: ".concat(objectId));
                nonce = Date.now() + Id.next();
                paramTypes = ["address", "address", "uint", "uint"];
                params = [this.client.signer.address, Utils.HashToAddress(objectId), value, nonce];
                packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
                _context7.next = 10;
                return this.Sign(packedHash);

              case 10:
                params[4] = _context7.sent;
                stateChannelApi = "elv_channelContentRequest";

                if (audienceData) {
                  stateChannelApi = "elv_channelContentRequestContext";
                  params[5] = JSON.stringify(audienceData);
                }

                _context7.next = 15;
                return this.MakeKMSCall({
                  objectId: objectId,
                  methodName: stateChannelApi,
                  params: params
                });

              case 15:
                payload = _context7.sent;
                _context7.next = 18;
                return this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(payload)));

              case 18:
                signature = _context7.sent;
                multiSig = Utils.FormatSignature(signature);
                token = "".concat(payload, ".").concat(Utils.B64(multiSig));

                if (!this.noCache) {
                  this.channelContentTokens[objectId] = token;
                }

                return _context7.abrupt("return", token);

              case 23:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function GenerateChannelContentToken(_x7) {
        return _GenerateChannelContentToken.apply(this, arguments);
      }

      return GenerateChannelContentToken;
    }()
  }, {
    key: "ChannelContentFinalize",
    value: function () {
      var _ChannelContentFinalize = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(_ref9) {
        var objectId, audienceData, _ref9$percent, percent, nonce, paramTypes, params, packedHash;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                objectId = _ref9.objectId, audienceData = _ref9.audienceData, _ref9$percent = _ref9.percent, percent = _ref9$percent === void 0 ? 0 : _ref9$percent;
                this.Log("Making state channel finalize request: ".concat(objectId));
                nonce = Date.now() + Id.next();
                paramTypes = ["address", "address", "uint", "uint"];
                params = [this.client.signer.address, Utils.HashToAddress(objectId), percent, nonce];
                packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
                _context8.next = 8;
                return this.Sign(packedHash);

              case 8:
                params[4] = _context8.sent;
                params[5] = JSON.stringify(audienceData);
                _context8.next = 12;
                return this.MakeKMSCall({
                  objectId: objectId,
                  methodName: "elv_channelContentFinalizeContext",
                  params: params
                });

              case 12:
                return _context8.abrupt("return", _context8.sent);

              case 13:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function ChannelContentFinalize(_x8) {
        return _ChannelContentFinalize.apply(this, arguments);
      }

      return ChannelContentFinalize;
    }()
  }, {
    key: "CacheTransaction",
    value: function CacheTransaction(_ref10) {
      var accessType = _ref10.accessType,
          address = _ref10.address,
          publicKey = _ref10.publicKey,
          update = _ref10.update,
          transactionHash = _ref10.transactionHash;
      var cache = update ? this.modifyTransactions : this.accessTransactions;

      switch (accessType) {
        case ACCESS_TYPES.SPACE:
          cache = cache.spaces;
          break;

        case ACCESS_TYPES.LIBRARY:
          cache = cache.libraries;
          break;

        case ACCESS_TYPES.TYPE:
          cache = cache.types;
          break;

        case ACCESS_TYPES.OBJECT:
          cache = publicKey ? cache.encryptedObjects : cache.objects;
          break;

        default:
          cache = cache.other;
      }

      cache[address] = transactionHash;
    }
  }, {
    key: "AccessInfo",
    value: function AccessInfo(_ref11) {
      var accessType = _ref11.accessType,
          publicKey = _ref11.publicKey,
          _ref11$update = _ref11.update,
          update = _ref11$update === void 0 ? false : _ref11$update,
          args = _ref11.args;
      var abi, cache, checkAccessCharge;

      switch (accessType) {
        case ACCESS_TYPES.SPACE:
          abi = SpaceContract.abi;
          cache = {
            access: this.accessTransactions.spaces,
            modify: this.modifyTransactions.spaces
          };
          break;

        case ACCESS_TYPES.LIBRARY:
          abi = LibraryContract.abi;
          cache = {
            access: this.accessTransactions.libraries,
            modify: this.modifyTransactions.libraries
          };
          break;

        case ACCESS_TYPES.TYPE:
          abi = TypeContract.abi;
          cache = {
            access: this.accessTransactions.types,
            modify: this.modifyTransactions.types
          };
          break;

        case ACCESS_TYPES.OBJECT:
          abi = ContentContract.abi;
          cache = publicKey ? {
            access: this.accessTransactions.encryptedObjects,
            modify: this.modifyTransactions.encryptedObjects
          } : {
            access: this.accessTransactions.objects,
            modify: this.modifyTransactions.objects
          };
          checkAccessCharge = true;

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

          break;

        default:
          abi = update ? EditableContract.abi : AccessibleContract.abi;
          cache = {
            access: this.accessTransactions.other,
            modify: this.modifyTransactions.other
          };
      }

      return {
        abi: abi,
        cache: cache,
        accessArgs: args,
        checkAccessCharge: checkAccessCharge
      };
    } // Determine type of ID based on contract version string

  }, {
    key: "AccessType",
    value: function () {
      var _AccessType = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(id) {
        var contractName;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.client.ethClient.ContractName(Utils.HashToAddress(id));

              case 2:
                contractName = _context9.sent;
                _context9.t0 = contractName;
                _context9.next = _context9.t0 === "BaseContentSpace" ? 6 : _context9.t0 === "BaseLibrary" ? 7 : _context9.t0 === "BaseContentType" ? 8 : _context9.t0 === "BsAccessWallet" ? 9 : _context9.t0 === "BsAccessCtrlGrp" ? 10 : _context9.t0 === "BaseContent" ? 11 : 12;
                break;

              case 6:
                return _context9.abrupt("return", ACCESS_TYPES.SPACE);

              case 7:
                return _context9.abrupt("return", ACCESS_TYPES.LIBRARY);

              case 8:
                return _context9.abrupt("return", ACCESS_TYPES.TYPE);

              case 9:
                return _context9.abrupt("return", ACCESS_TYPES.WALLET);

              case 10:
                return _context9.abrupt("return", ACCESS_TYPES.GROUP);

              case 11:
                return _context9.abrupt("return", ACCESS_TYPES.OBJECT);

              case 12:
                return _context9.abrupt("return", ACCESS_TYPES.OTHER);

              case 13:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function AccessType(_x9) {
        return _AccessType.apply(this, arguments);
      }

      return AccessType;
    }()
  }, {
    key: "AccessComplete",
    value: function () {
      var _AccessComplete = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(_ref12) {
        var id, abi, score, address, requestId, event;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                id = _ref12.id, abi = _ref12.abi, score = _ref12.score;
                this.Log("Calling access complete on ".concat(id, " with score ").concat(score));
                address = Utils.HashToAddress(id);
                requestId = this.requestIds[address];

                if (requestId) {
                  _context10.next = 6;
                  break;
                }

                throw Error("Unknown request ID for " + id);

              case 6:
                _context10.next = 8;
                return this.client.CallContractMethodAndWait({
                  contractAddress: address,
                  abi: abi,
                  methodName: "accessComplete",
                  methodArgs: [requestId, score, ""]
                });

              case 8:
                event = _context10.sent;
                delete this.requestIds[address];
                delete this.accessTransactions.objects[address];
                return _context10.abrupt("return", event);

              case 12:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function AccessComplete(_x10) {
        return _AccessComplete.apply(this, arguments);
      }

      return AccessComplete;
    }()
    /* Utility methods */

  }, {
    key: "GetAccessCharge",
    value: function () {
      var _GetAccessCharge = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11(_ref13) {
        var objectId, args, info;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                objectId = _ref13.objectId, args = _ref13.args;
                _context11.next = 3;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "getAccessInfo",
                  methodArgs: args
                });

              case 3:
                info = _context11.sent;
                return _context11.abrupt("return", info[2]);

              case 5:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function GetAccessCharge(_x11) {
        return _GetAccessCharge.apply(this, arguments);
      }

      return GetAccessCharge;
    }()
  }, {
    key: "Owner",
    value: function () {
      var _Owner = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(_ref14) {
        var id, abi, ownerAddress;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                id = _ref14.id, abi = _ref14.abi;

                if (this.client.signer) {
                  _context12.next = 3;
                  break;
                }

                return _context12.abrupt("return", false);

              case 3:
                _context12.next = 5;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(id),
                  abi: abi,
                  methodName: "owner",
                  methodArgs: []
                });

              case 5:
                ownerAddress = _context12.sent;
                return _context12.abrupt("return", Utils.FormatAddress(ownerAddress));

              case 7:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function Owner(_x12) {
        return _Owner.apply(this, arguments);
      }

      return Owner;
    }()
  }, {
    key: "Sign",
    value: function () {
      var _Sign = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(message) {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return Promise.resolve(Ethers.utils.joinSignature(this.client.signer.signingKey.signDigest(message)));

              case 2:
                return _context13.abrupt("return", _context13.sent);

              case 3:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function Sign(_x13) {
        return _Sign.apply(this, arguments);
      }

      return Sign;
    }()
  }, {
    key: "KMSAddress",
    value: function () {
      var _KMSAddress = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee14(_ref15) {
        var objectId, versionHash;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                objectId = _ref15.objectId, versionHash = _ref15.versionHash;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                _context14.next = 4;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "addressKMS"
                });

              case 4:
                return _context14.abrupt("return", _context14.sent);

              case 5:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function KMSAddress(_x14) {
        return _KMSAddress.apply(this, arguments);
      }

      return KMSAddress;
    }()
  }, {
    key: "KMSInfo",
    value: function () {
      var _KMSInfo = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee15(_ref16) {
        var objectId, versionHash, KMSInfo, publicKey;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                objectId = _ref16.objectId, versionHash = _ref16.versionHash;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                } // Get KMS info for the object


                _context15.next = 4;
                return this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(objectId),
                  abi: ContentContract.abi,
                  methodName: "getKMSInfo",
                  methodArgs: [[]],
                  formatArguments: false
                });

              case 4:
                KMSInfo = _context15.sent;
                // Public key is compressed and hashed
                publicKey = Ethers.utils.computePublicKey(Utils.HashToAddress(KMSInfo[1]), false);
                return _context15.abrupt("return", {
                  urls: KMSInfo[0].split(","),
                  publicKey: publicKey
                });

              case 7:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function KMSInfo(_x15) {
        return _KMSInfo.apply(this, arguments);
      }

      return KMSInfo;
    }() // Retrieve symmetric key for object

  }, {
    key: "KMSSymmetricKey",
    value: function () {
      var _KMSSymmetricKey = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee16(_ref17) {
        var libraryId, objectId, kmsAddress, kmsCapId, kmsCap;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                libraryId = _ref17.libraryId, objectId = _ref17.objectId;

                if (!libraryId) {
                  libraryId = this.client.ContentObjectLibraryId({
                    objectId: objectId
                  });
                }

                _context16.next = 4;
                return this.KMSAddress({
                  objectId: objectId
                });

              case 4:
                kmsAddress = _context16.sent;
                kmsCapId = "eluv.caps.ikms".concat(Utils.AddressToHash(kmsAddress));
                _context16.next = 8;
                return this.client.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadataSubtree: kmsCapId
                });

              case 8:
                kmsCap = _context16.sent;
                _context16.next = 11;
                return this.MakeKMSCall({
                  objectId: objectId,
                  methodName: "elv_getSymmetricKey",
                  params: [this.client.contentSpaceId, libraryId, objectId, kmsCap]
                });

              case 11:
                return _context16.abrupt("return", _context16.sent);

              case 12:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function KMSSymmetricKey(_x16) {
        return _KMSSymmetricKey.apply(this, arguments);
      }

      return KMSSymmetricKey;
    }()
  }, {
    key: "MakeKMSCall",
    value: function () {
      var _MakeKMSCall = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee17(_ref18) {
        var objectId, versionHash, methodName, params, KMSUrls, i, stateChannelProvider;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                objectId = _ref18.objectId, versionHash = _ref18.versionHash, methodName = _ref18.methodName, params = _ref18.params;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                _context17.next = 4;
                return this.KMSInfo({
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 4:
                KMSUrls = _context17.sent.urls;
                i = 0;

              case 6:
                if (!(i < KMSUrls.length)) {
                  _context17.next = 23;
                  break;
                }

                _context17.prev = 7;
                this.Log("Making KMS request:\n          URL: ".concat(KMSUrls[i], "\n          Method: ").concat(methodName, "\n          Params: ").concat(params.join(", ")));
                stateChannelProvider = new Ethers.providers.JsonRpcProvider(KMSUrls[i]);
                _context17.next = 12;
                return stateChannelProvider.send(methodName, params);

              case 12:
                return _context17.abrupt("return", _context17.sent);

              case 15:
                _context17.prev = 15;
                _context17.t0 = _context17["catch"](7);
                this.Log("KMS Call Error: ".concat(_context17.t0), true); // If the request has been attempted on all KMS urls, throw the error

                if (!(i === KMSUrls.length - 1)) {
                  _context17.next = 20;
                  break;
                }

                throw _context17.t0;

              case 20:
                i++;
                _context17.next = 6;
                break;

              case 23:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this, [[7, 15]]);
      }));

      function MakeKMSCall(_x17) {
        return _MakeKMSCall.apply(this, arguments);
      }

      return MakeKMSCall;
    }()
  }, {
    key: "ReEncryptionConk",
    value: function () {
      var _ReEncryptionConk = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee18(_ref19) {
        var libraryId, objectId, versionHash, cap;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                libraryId = _ref19.libraryId, objectId = _ref19.objectId, versionHash = _ref19.versionHash;

                if (versionHash) {
                  objectId = Utils.DecodeVersionHash(versionHash).objectId;
                }

                if (this.reencryptionKeys[objectId]) {
                  _context18.next = 10;
                  break;
                }

                _context18.next = 5;
                return Crypto.GenerateTargetConk();

              case 5:
                cap = _context18.sent;
                _context18.next = 8;
                return this.KMSSymmetricKey({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 8:
                cap.symm_key = _context18.sent;
                this.reencryptionKeys[objectId] = cap;

              case 10:
                return _context18.abrupt("return", this.reencryptionKeys[objectId]);

              case 11:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function ReEncryptionConk(_x18) {
        return _ReEncryptionConk.apply(this, arguments);
      }

      return ReEncryptionConk;
    }()
  }, {
    key: "RecordTags",
    value: function () {
      var _RecordTags = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee19(_ref20) {
        var accessType, libraryId, objectId, versionHash, owner;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                accessType = _ref20.accessType, libraryId = _ref20.libraryId, objectId = _ref20.objectId, versionHash = _ref20.versionHash;

                if (!(accessType !== ACCESS_TYPES.OBJECT)) {
                  _context19.next = 3;
                  break;
                }

                return _context19.abrupt("return");

              case 3:
                _context19.next = 5;
                return this.Owner({
                  id: objectId,
                  abi: ContentContract.abi
                });

              case 5:
                owner = _context19.sent;

                if (Utils.EqualAddress(owner, this.client.signer.address)) {
                  _context19.next = 9;
                  break;
                }

                _context19.next = 9;
                return this.client.userProfileClient.RecordTags({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 9:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function RecordTags(_x19) {
        return _RecordTags.apply(this, arguments);
      }

      return RecordTags;
    }()
    /* Creation methods */

  }, {
    key: "CreateAccessGroup",
    value: function () {
      var _CreateAccessGroup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee20() {
        var _ref21, contractAddress, transactionHash;

        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                _context20.next = 2;
                return this.client.ethClient.DeployAccessGroupContract({
                  contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                  signer: this.client.signer
                });

              case 2:
                _ref21 = _context20.sent;
                contractAddress = _ref21.contractAddress;
                transactionHash = _ref21.transactionHash;
                return _context20.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 6:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this);
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
      regeneratorRuntime.mark(function _callee21() {
        var _ref22, contractAddress, transactionHash;

        return regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                _context21.next = 2;
                return this.client.ethClient.DeployTypeContract({
                  contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                  signer: this.client.signer
                });

              case 2:
                _ref22 = _context21.sent;
                contractAddress = _ref22.contractAddress;
                transactionHash = _ref22.transactionHash;
                return _context21.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 6:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
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
      regeneratorRuntime.mark(function _callee22(_ref23) {
        var kmsId, _ref24, contractAddress, transactionHash;

        return regeneratorRuntime.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                kmsId = _ref23.kmsId;
                _context22.next = 3;
                return this.client.ethClient.DeployLibraryContract({
                  contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                  kmsId: kmsId,
                  signer: this.client.signer
                });

              case 3:
                _ref24 = _context22.sent;
                contractAddress = _ref24.contractAddress;
                transactionHash = _ref24.transactionHash;
                return _context22.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 7:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, this);
      }));

      function CreateContentLibrary(_x20) {
        return _CreateContentLibrary.apply(this, arguments);
      }

      return CreateContentLibrary;
    }()
  }, {
    key: "CreateContentObject",
    value: function () {
      var _CreateContentObject = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee23(_ref25) {
        var libraryId, typeId, _ref26, contractAddress, transactionHash, objectId;

        return regeneratorRuntime.wrap(function _callee23$(_context23) {
          while (1) {
            switch (_context23.prev = _context23.next) {
              case 0:
                libraryId = _ref25.libraryId, typeId = _ref25.typeId;
                _context23.next = 3;
                return this.client.ethClient.DeployContentContract({
                  contentLibraryAddress: Utils.HashToAddress(libraryId),
                  typeAddress: typeId ? Utils.HashToAddress(typeId) : Utils.nullAddress,
                  signer: this.client.signer
                });

              case 3:
                _ref26 = _context23.sent;
                contractAddress = _ref26.contractAddress;
                transactionHash = _ref26.transactionHash;
                // Cache object creation transaction for use in future updates
                objectId = Utils.AddressToObjectId(contractAddress);

                if (!this.noCache) {
                  this.modifyTransactions.objects[objectId] = transactionHash;
                }

                return _context23.abrupt("return", {
                  contractAddress: contractAddress,
                  transactionHash: transactionHash
                });

              case 9:
              case "end":
                return _context23.stop();
            }
          }
        }, _callee23, this);
      }));

      function CreateContentObject(_x21) {
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
        encryptedObjects: {},
        other: {}
      };
      this.modifyTransactions = {
        spaces: {},
        libraries: {},
        types: {},
        objects: {},
        encryptedObjects: {},
        other: {}
      };
      this.channelContentTokens = {};
    }
  }]);

  return AuthorizationClient;
}();

module.exports = AuthorizationClient;