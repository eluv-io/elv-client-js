var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _typeof = require("@babel/runtime/helpers/typeof");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _v, _v2;

var HttpClient = require("./HttpClient");

var Ethers = require("ethers");

var Id = require("./Id");

var Crypto = require("./Crypto");

var Utils = require("./Utils");

var UrlJoin = require("url-join");
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
  OTHER: "other"
};
var CONTRACTS = {
  v2: (_v = {}, _defineProperty(_v, ACCESS_TYPES.SPACE, require("./contracts/v2/BaseContentSpace")), _defineProperty(_v, ACCESS_TYPES.LIBRARY, require("./contracts/v2/BaseLibrary")), _defineProperty(_v, ACCESS_TYPES.TYPE, require("./contracts/v2/BaseContentType")), _defineProperty(_v, ACCESS_TYPES.OBJECT, require("./contracts/v2/BaseContent")), _defineProperty(_v, ACCESS_TYPES.WALLET, require("./contracts/v2/BaseAccessWallet")), _defineProperty(_v, ACCESS_TYPES.GROUP, require("./contracts/v2/BaseAccessControlGroup")), _defineProperty(_v, ACCESS_TYPES.ACCESSIBLE, require("./contracts/v2/Accessible")), _defineProperty(_v, ACCESS_TYPES.EDITABLE, require("./contracts/v2/Editable")), _v),
  v3: (_v2 = {}, _defineProperty(_v2, ACCESS_TYPES.SPACE, require("./contracts/v3/BaseContentSpace")), _defineProperty(_v2, ACCESS_TYPES.LIBRARY, require("./contracts/v3/BaseLibrary")), _defineProperty(_v2, ACCESS_TYPES.TYPE, require("./contracts/v3/BaseContentType")), _defineProperty(_v2, ACCESS_TYPES.OBJECT, require("./contracts/v3/BaseContent")), _defineProperty(_v2, ACCESS_TYPES.WALLET, require("./contracts/v3/BaseAccessWallet")), _defineProperty(_v2, ACCESS_TYPES.GROUP, require("./contracts/v3/BaseAccessControlGroup")), _defineProperty(_v2, ACCESS_TYPES.ACCESSIBLE, require("./contracts/v3/Accessible")), _defineProperty(_v2, ACCESS_TYPES.EDITABLE, require("./contracts/v3/Editable")), _v2)
};

var AuthorizationClient =
/*#__PURE__*/
function () {
  "use strict";

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

    this.ACCESS_TYPES = ACCESS_TYPES;
    this.CONTRACTS = CONTRACTS;
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
      groups: {},
      wallets: {},
      other: {}
    };
    this.modifyTransactions = {
      spaces: {},
      libraries: {},
      objects: {},
      encryptedObjects: {},
      types: {},
      groups: {},
      wallets: {},
      other: {}
    };
    this.methodAvailability = {};
    this.accessVersions = {};
    this.accessTypes = {};
    this.channelContentTokens = {};
    this.reencryptionKeys = {};
    this.requestIds = {};
  } // Return authorization token in appropriate headers


  _createClass(AuthorizationClient, [{
    key: "AuthorizationHeader",
    value: function AuthorizationHeader(params) {
      var authorizationToken, headers;
      return _regeneratorRuntime.async(function AuthorizationHeader$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regeneratorRuntime.awrap(this.AuthorizationToken(params));

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
      }, null, this);
    } // Wrapper for GenerateAuthorizationHeader to allow for per-call disabling of cache

  }, {
    key: "AuthorizationToken",
    value: function AuthorizationToken(_ref2) {
      var libraryId, objectId, versionHash, partHash, encryption, audienceData, _ref2$update, update, _ref2$channelAuth, channelAuth, oauthToken, _ref2$noCache, noCache, _ref2$noAuth, noAuth, initialNoCache, authorizationToken;

      return _regeneratorRuntime.async(function AuthorizationToken$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              libraryId = _ref2.libraryId, objectId = _ref2.objectId, versionHash = _ref2.versionHash, partHash = _ref2.partHash, encryption = _ref2.encryption, audienceData = _ref2.audienceData, _ref2$update = _ref2.update, update = _ref2$update === void 0 ? false : _ref2$update, _ref2$channelAuth = _ref2.channelAuth, channelAuth = _ref2$channelAuth === void 0 ? false : _ref2$channelAuth, oauthToken = _ref2.oauthToken, _ref2$noCache = _ref2.noCache, noCache = _ref2$noCache === void 0 ? false : _ref2$noCache, _ref2$noAuth = _ref2.noAuth, noAuth = _ref2$noAuth === void 0 ? false : _ref2$noAuth;
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
              return _regeneratorRuntime.awrap(this.GenerateChannelContentToken({
                objectId: objectId,
                audienceData: audienceData,
                oauthToken: oauthToken
              }));

            case 7:
              authorizationToken = _context2.sent;
              _context2.next = 13;
              break;

            case 10:
              _context2.next = 12;
              return _regeneratorRuntime.awrap(this.GenerateAuthorizationToken({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                partHash: partHash,
                encryption: encryption,
                update: update,
                noAuth: noAuth
              }));

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
      }, null, this, [[2, 16, 19, 22]]);
    }
  }, {
    key: "GenerateAuthorizationToken",
    value: function GenerateAuthorizationToken(_ref3) {
      var libraryId, objectId, versionHash, partHash, encryption, _ref3$update, update, _ref3$noAuth, noAuth, publicKey, owner, cap, token, _ref4, transactionHash, signature, multiSig;

      return _regeneratorRuntime.async(function GenerateAuthorizationToken$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              libraryId = _ref3.libraryId, objectId = _ref3.objectId, versionHash = _ref3.versionHash, partHash = _ref3.partHash, encryption = _ref3.encryption, _ref3$update = _ref3.update, update = _ref3$update === void 0 ? false : _ref3$update, _ref3$noAuth = _ref3.noAuth, noAuth = _ref3$noAuth === void 0 ? false : _ref3$noAuth;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              } // Generate AFGH public key if encryption is specified


              _context3.t0 = encryption && encryption !== "none" && objectId;

              if (!_context3.t0) {
                _context3.next = 9;
                break;
              }

              _context3.next = 6;
              return _regeneratorRuntime.awrap(this.AccessType(objectId));

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
              return _regeneratorRuntime.awrap(this.Owner({
                id: objectId
              }));

            case 12:
              owner = _context3.sent;

              if (Utils.EqualAddress(owner, this.client.signer.address)) {
                _context3.next = 18;
                break;
              }

              _context3.next = 16;
              return _regeneratorRuntime.awrap(this.ReEncryptionConk({
                libraryId: libraryId,
                objectId: objectId
              }));

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
              return _regeneratorRuntime.awrap(this.MakeAccessRequest({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                update: update,
                publicKey: publicKey,
                noCache: this.noCache,
                noAuth: this.noAuth || noAuth
              }));

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
              return _regeneratorRuntime.awrap(this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(token))));

            case 31:
              signature = _context3.sent;
              multiSig = Utils.FormatSignature(signature);
              return _context3.abrupt("return", "".concat(token, ".").concat(Utils.B64(multiSig)));

            case 34:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "MakeAccessRequest",
    value: function MakeAccessRequest(_ref5) {
      var _this = this;

      var libraryId, objectId, versionHash, _ref5$args, args, _ref5$publicKey, publicKey, _ref5$update, update, _ref5$skipCache, skipCache, _ref5$noCache, noCache, cacheOnly, walletContractAddress, walletCreated, id, _ref6, isV3, accessType, abi, _ref7, cache, accessArgs, checkAccessCharge, address, cacheHit, accessRequest;

      return _regeneratorRuntime.async(function MakeAccessRequest$(_context4) {
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
              return _regeneratorRuntime.awrap(this.client.userProfileClient.UserWalletAddress({
                address: this.client.signer.address
              }));

            case 5:
              walletContractAddress = _context4.sent;

              if (walletContractAddress) {
                _context4.next = 12;
                break;
              }

              _context4.next = 9;
              return _regeneratorRuntime.awrap(this.client.userProfileClient.WalletAddress());

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
              return _regeneratorRuntime.awrap(this.ContractInfo({
                id: id
              }));

            case 16:
              _ref6 = _context4.sent;
              isV3 = _ref6.isV3;
              accessType = _ref6.accessType;
              abi = _ref6.abi;
              _context4.next = 22;
              return _regeneratorRuntime.awrap(this.AccessInfo({
                accessType: accessType,
                publicKey: publicKey,
                update: update,
                args: args,
                isV3: isV3
              }));

            case 22:
              _ref7 = _context4.sent;
              cache = _ref7.cache;
              accessArgs = _ref7.accessArgs;
              checkAccessCharge = _ref7.checkAccessCharge;
              address = Utils.HashToAddress(id); // Check cache for existing transaction

              if (!(!noCache && !skipCache)) {
                _context4.next = 31;
                break;
              }

              cacheHit = update ? cache.modify[address] : cache.access[address];

              if (!cacheHit) {
                _context4.next = 31;
                break;
              }

              return _context4.abrupt("return", {
                transactionHash: cacheHit
              });

            case 31:
              if (!cacheOnly) {
                _context4.next = 33;
                break;
              }

              return _context4.abrupt("return");

            case 33:
              accessRequest = {
                transactionHash: ""
              }; // Make the request

              if (!update) {
                _context4.next = 41;
                break;
              }

              this.Log("Making update request on ".concat(accessType, " ").concat(id));
              _context4.next = 38;
              return _regeneratorRuntime.awrap(this.UpdateRequest({
                id: id,
                abi: abi
              }));

            case 38:
              accessRequest = _context4.sent;
              _context4.next = 45;
              break;

            case 41:
              this.Log("Making access request on ".concat(accessType, " ").concat(id));
              _context4.next = 44;
              return _regeneratorRuntime.awrap(this.AccessRequest({
                id: id,
                args: accessArgs,
                checkAccessCharge: checkAccessCharge
              }));

            case 44:
              accessRequest = _context4.sent;

            case 45:
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
              } //this.RecordTags({accessType, libraryId, objectId, versionHash});


              return _context4.abrupt("return", accessRequest);

            case 47:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "AccessRequest",
    value: function AccessRequest(_ref8) {
      var id, _ref8$args, args, _ref8$checkAccessChar, checkAccessCharge, _ref9, isV3, accessType, abi, accessCharge, owner, accessChargeArgs, event, methodName, contractAddress;

      return _regeneratorRuntime.async(function AccessRequest$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              id = _ref8.id, _ref8$args = _ref8.args, args = _ref8$args === void 0 ? [] : _ref8$args, _ref8$checkAccessChar = _ref8.checkAccessCharge, checkAccessCharge = _ref8$checkAccessChar === void 0 ? false : _ref8$checkAccessChar;
              _context5.next = 3;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                id: id
              }));

            case 3:
              _ref9 = _context5.sent;
              isV3 = _ref9.isV3;
              accessType = _ref9.accessType;
              abi = _ref9.abi;
              // Send some bux if access charge is required
              accessCharge = 0;

              if (!(checkAccessCharge && accessType === ACCESS_TYPES.OBJECT)) {
                _context5.next = 19;
                break;
              }

              _context5.next = 11;
              return _regeneratorRuntime.awrap(this.Owner({
                id: id,
                abi: abi
              }));

            case 11:
              owner = _context5.sent;

              if (Utils.EqualAddress(this.client.signer.address, owner)) {
                _context5.next = 19;
                break;
              }

              // Extract level, custom values and stakeholders from accessRequest arguments
              accessChargeArgs = [args[0], args[3], args[4]]; // Access charge is in wei, but methods take ether - convert to charge to ether

              _context5.t0 = Utils;
              _context5.next = 17;
              return _regeneratorRuntime.awrap(this.GetAccessCharge({
                objectId: id,
                args: accessChargeArgs
              }));

            case 17:
              _context5.t1 = _context5.sent;
              accessCharge = _context5.t0.WeiToEther.call(_context5.t0, _context5.t1);

            case 19:
              if (accessCharge > 0) {
                this.Log("Access charge: ".concat(accessCharge));
              }

              contractAddress = Utils.HashToAddress(id);

              if (isV3) {
                methodName = "accessRequestV3";
              } else {
                methodName = "accessRequest";
              }

              _context5.next = 24;
              return _regeneratorRuntime.awrap(this.ContractHasMethod({
                contractAddress: contractAddress,
                abi: abi,
                methodName: methodName
              }));

            case 24:
              if (_context5.sent) {
                _context5.next = 27;
                break;
              }

              this.Log("".concat(accessType, " ").concat(id, " has no ").concat(methodName, " method. Skipping"));
              return _context5.abrupt("return", {
                transactionHash: "",
                logs: []
              });

            case 27:
              _context5.next = 29;
              return _regeneratorRuntime.awrap(this.client.CallContractMethodAndWait({
                contractAddress: contractAddress,
                abi: abi,
                methodName: methodName,
                methodArgs: args,
                value: accessCharge
              }));

            case 29:
              event = _context5.sent;

              if (!(event.logs.length === 0)) {
                _context5.next = 32;
                break;
              }

              throw Error("Access denied");

            case 32:
              return _context5.abrupt("return", event);

            case 33:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "UpdateRequest",
    value: function UpdateRequest(_ref10) {
      var id, abi, event, updateRequestEvent;
      return _regeneratorRuntime.async(function UpdateRequest$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              id = _ref10.id, abi = _ref10.abi;
              _context6.next = 3;
              return _regeneratorRuntime.awrap(this.client.CallContractMethodAndWait({
                contractAddress: Utils.HashToAddress(id),
                abi: abi,
                methodName: "updateRequest",
                methodArgs: []
              }));

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
      }, null, this);
    }
  }, {
    key: "GenerateChannelContentToken",
    value: function GenerateChannelContentToken(_ref11) {
      var objectId, audienceData, oauthToken, _ref11$value, value, nonce, paramTypes, params, packedHash, stateChannelApi, payload, signature, multiSig, token;

      return _regeneratorRuntime.async(function GenerateChannelContentToken$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              objectId = _ref11.objectId, audienceData = _ref11.audienceData, oauthToken = _ref11.oauthToken, _ref11$value = _ref11.value, value = _ref11$value === void 0 ? 0 : _ref11$value;

              if (!oauthToken) {
                _context7.next = 5;
                break;
              }

              _context7.next = 4;
              return _regeneratorRuntime.awrap(this.GenerateOauthChannelToken({
                objectId: objectId,
                token: oauthToken
              }));

            case 4:
              return _context7.abrupt("return", _context7.sent);

            case 5:
              if (!(!this.noCache && this.channelContentTokens[objectId])) {
                _context7.next = 7;
                break;
              }

              return _context7.abrupt("return", this.channelContentTokens[objectId]);

            case 7:
              this.Log("Making state channel access request: ".concat(objectId));
              nonce = Date.now() + Id.next();
              paramTypes = ["address", "address", "uint", "uint"];
              params = [this.client.signer.address, Utils.HashToAddress(objectId), value, nonce];
              packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
              _context7.next = 14;
              return _regeneratorRuntime.awrap(this.Sign(packedHash));

            case 14:
              params[4] = _context7.sent;
              stateChannelApi = "elv_channelContentRequest";

              if (audienceData) {
                stateChannelApi = "elv_channelContentRequestContext";
                params[5] = JSON.stringify(audienceData);
              }

              _context7.next = 19;
              return _regeneratorRuntime.awrap(this.MakeKMSCall({
                objectId: objectId,
                methodName: stateChannelApi,
                params: params
              }));

            case 19:
              payload = _context7.sent;
              _context7.next = 22;
              return _regeneratorRuntime.awrap(this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(payload))));

            case 22:
              signature = _context7.sent;
              multiSig = Utils.FormatSignature(signature);
              token = "".concat(payload, ".").concat(Utils.B64(multiSig));

              if (!this.noCache) {
                this.channelContentTokens[objectId] = token;
              }

              return _context7.abrupt("return", token);

            case 27:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "ChannelContentFinalize",
    value: function ChannelContentFinalize(_ref12) {
      var objectId, audienceData, _ref12$percent, percent, nonce, paramTypes, params, packedHash, result;

      return _regeneratorRuntime.async(function ChannelContentFinalize$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              objectId = _ref12.objectId, audienceData = _ref12.audienceData, _ref12$percent = _ref12.percent, percent = _ref12$percent === void 0 ? 0 : _ref12$percent;
              this.Log("Making state channel finalize request: ".concat(objectId));
              nonce = Date.now() + Id.next();
              paramTypes = ["address", "address", "uint", "uint"];
              params = [this.client.signer.address, Utils.HashToAddress(objectId), percent, nonce];
              packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
              _context8.next = 8;
              return _regeneratorRuntime.awrap(this.Sign(packedHash));

            case 8:
              params[4] = _context8.sent;
              params[5] = JSON.stringify(audienceData);
              _context8.next = 12;
              return _regeneratorRuntime.awrap(this.MakeKMSCall({
                objectId: objectId,
                methodName: "elv_channelContentFinalizeContext",
                params: params
              }));

            case 12:
              result = _context8.sent;
              this.channelContentTokens[objectId] = undefined;
              return _context8.abrupt("return", result);

            case 15:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "GenerateOauthChannelToken",
    value: function GenerateOauthChannelToken(_ref13) {
      var objectId, versionHash, token, kmsUrls, kmsHttpClient, fabricToken;
      return _regeneratorRuntime.async(function GenerateOauthChannelToken$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              objectId = _ref13.objectId, versionHash = _ref13.versionHash, token = _ref13.token;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              if (!(!this.noCache && this.channelContentTokens[objectId])) {
                _context9.next = 4;
                break;
              }

              return _context9.abrupt("return", this.channelContentTokens[objectId]);

            case 4:
              _context9.next = 6;
              return _regeneratorRuntime.awrap(this.KMSInfo({
                objectId: objectId,
                versionHash: versionHash
              }));

            case 6:
              kmsUrls = _context9.sent.urls;

              if (!(!kmsUrls || !kmsUrls[0])) {
                _context9.next = 9;
                break;
              }

              throw Error("No KMS info set for ".concat(versionHash || objectId));

            case 9:
              kmsHttpClient = new HttpClient({
                uris: [kmsUrls[0]],
                debug: this.debug
              });
              _context9.t0 = _regeneratorRuntime;
              _context9.next = 13;
              return _regeneratorRuntime.awrap(kmsHttpClient.Request({
                method: "GET",
                path: UrlJoin("ks", "jwt", "q", objectId),
                bodyType: "NONE",
                headers: {
                  Authorization: "Bearer ".concat(token)
                }
              }));

            case 13:
              _context9.t1 = _context9.sent.text();
              _context9.next = 16;
              return _context9.t0.awrap.call(_context9.t0, _context9.t1);

            case 16:
              fabricToken = _context9.sent;

              if (!this.noCache) {
                this.channelContentTokens[objectId] = fabricToken;
              }

              return _context9.abrupt("return", fabricToken);

            case 19:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CacheTransaction",
    value: function CacheTransaction(_ref14) {
      var accessType = _ref14.accessType,
          address = _ref14.address,
          publicKey = _ref14.publicKey,
          update = _ref14.update,
          transactionHash = _ref14.transactionHash;
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
    key: "IsV3",
    value: function IsV3(_ref15) {
      var id;
      return _regeneratorRuntime.async(function IsV3$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              id = _ref15.id;

              if (this.accessVersions[id]) {
                _context10.next = 5;
                break;
              }

              _context10.next = 4;
              return _regeneratorRuntime.awrap(this.ContractHasMethod({
                contractAddress: this.client.utils.HashToAddress(id),
                abi: this.CONTRACTS.v3[this.ACCESS_TYPES.ACCESSIBLE].abi,
                methodName: "accessRequestV3"
              }));

            case 4:
              this.accessVersions[id] = _context10.sent;

            case 5:
              return _context10.abrupt("return", this.accessVersions[id]);

            case 6:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "AccessInfo",
    value: function AccessInfo(_ref16) {
      var accessType, publicKey, args, isV3, cache, checkAccessCharge;
      return _regeneratorRuntime.async(function AccessInfo$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              accessType = _ref16.accessType, publicKey = _ref16.publicKey, args = _ref16.args, isV3 = _ref16.isV3;
              _context11.t0 = accessType;
              _context11.next = _context11.t0 === ACCESS_TYPES.SPACE ? 4 : _context11.t0 === ACCESS_TYPES.LIBRARY ? 6 : _context11.t0 === ACCESS_TYPES.TYPE ? 8 : _context11.t0 === ACCESS_TYPES.GROUP ? 10 : _context11.t0 === ACCESS_TYPES.WALLET ? 12 : _context11.t0 === ACCESS_TYPES.OBJECT ? 14 : 18;
              break;

            case 4:
              cache = {
                access: this.accessTransactions.spaces,
                modify: this.modifyTransactions.spaces
              };
              return _context11.abrupt("break", 19);

            case 6:
              cache = {
                access: this.accessTransactions.libraries,
                modify: this.modifyTransactions.libraries
              };
              return _context11.abrupt("break", 19);

            case 8:
              cache = {
                access: this.accessTransactions.types,
                modify: this.modifyTransactions.types
              };
              return _context11.abrupt("break", 19);

            case 10:
              cache = {
                access: this.accessTransactions.groups,
                modify: this.modifyTransactions.groups
              };
              return _context11.abrupt("break", 19);

            case 12:
              cache = {
                access: this.accessTransactions.wallets,
                modify: this.modifyTransactions.wallets
              };
              return _context11.abrupt("break", 19);

            case 14:
              cache = publicKey ? {
                access: this.accessTransactions.encryptedObjects,
                modify: this.modifyTransactions.encryptedObjects
              } : {
                access: this.accessTransactions.objects,
                modify: this.modifyTransactions.objects
              };
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

              return _context11.abrupt("break", 19);

            case 18:
              cache = {
                access: this.accessTransactions.other,
                modify: this.modifyTransactions.other
              };

            case 19:
              if (isV3 && (!args || args.length === 0)) {
                args = [[], // customValues
                [] // stakeholders
                ];
              }

              return _context11.abrupt("return", {
                cache: cache,
                accessArgs: args,
                checkAccessCharge: checkAccessCharge
              });

            case 21:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this);
    } // Determine type of ID based on contract version string

  }, {
    key: "AccessType",
    value: function AccessType(id) {
      var contractName, accessType;
      return _regeneratorRuntime.async(function AccessType$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return _regeneratorRuntime.awrap(this.client.ethClient.ContractName(Utils.HashToAddress(id)));

            case 2:
              contractName = _context12.sent;

              if (this.accessTypes[id]) {
                _context12.next = 21;
                break;
              }

              _context12.t0 = contractName;
              _context12.next = _context12.t0 === "BaseContentSpace" ? 7 : _context12.t0 === "BaseLibrary" ? 9 : _context12.t0 === "BaseContentType" ? 11 : _context12.t0 === "BsAccessWallet" ? 13 : _context12.t0 === "BsAccessCtrlGrp" ? 15 : _context12.t0 === "BaseContent" ? 17 : 19;
              break;

            case 7:
              accessType = ACCESS_TYPES.SPACE;
              return _context12.abrupt("break", 20);

            case 9:
              accessType = ACCESS_TYPES.LIBRARY;
              return _context12.abrupt("break", 20);

            case 11:
              accessType = ACCESS_TYPES.TYPE;
              return _context12.abrupt("break", 20);

            case 13:
              accessType = ACCESS_TYPES.WALLET;
              return _context12.abrupt("break", 20);

            case 15:
              accessType = ACCESS_TYPES.GROUP;
              return _context12.abrupt("break", 20);

            case 17:
              accessType = ACCESS_TYPES.OBJECT;
              return _context12.abrupt("break", 20);

            case 19:
              accessType = ACCESS_TYPES.OTHER;

            case 20:
              this.accessTypes[id] = accessType;

            case 21:
              return _context12.abrupt("return", this.accessTypes[id]);

            case 22:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "AccessComplete",
    value: function AccessComplete(_ref17) {
      var id, score, _ref18, abi, address, requestId, event;

      return _regeneratorRuntime.async(function AccessComplete$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              id = _ref17.id, score = _ref17.score;
              this.Log("Calling access complete on ".concat(id, " with score ").concat(score));
              _context13.next = 4;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                id: id
              }));

            case 4:
              _ref18 = _context13.sent;
              abi = _ref18.abi;
              address = Utils.HashToAddress(id);
              requestId = this.requestIds[address];

              if (requestId) {
                _context13.next = 10;
                break;
              }

              throw Error("Unknown request ID for " + id);

            case 10:
              _context13.next = 12;
              return _regeneratorRuntime.awrap(this.client.CallContractMethodAndWait({
                contractAddress: address,
                abi: abi,
                methodName: "accessComplete",
                methodArgs: [requestId, score, ""]
              }));

            case 12:
              event = _context13.sent;
              delete this.requestIds[address];
              delete this.accessTransactions.objects[address];
              return _context13.abrupt("return", event);

            case 16:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this);
    }
    /* Utility methods */

  }, {
    key: "ContractInfo",
    value: function ContractInfo(_ref19) {
      var id, address, isV3, version, accessType;
      return _regeneratorRuntime.async(function ContractInfo$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              id = _ref19.id, address = _ref19.address;

              if (!address) {
                address = Utils.HashToAddress(id);
              }

              if (!id) {
                id = Utils.AddressToObjectId(address);
              }

              _context14.next = 5;
              return _regeneratorRuntime.awrap(this.IsV3({
                id: id
              }));

            case 5:
              isV3 = _context14.sent;
              version = isV3 ? "v3" : "v2";
              _context14.next = 9;
              return _regeneratorRuntime.awrap(this.AccessType(id));

            case 9:
              accessType = _context14.sent;

              if (!(accessType === this.ACCESS_TYPES.OTHER)) {
                _context14.next = 12;
                break;
              }

              return _context14.abrupt("return");

            case 12:
              return _context14.abrupt("return", {
                isV3: isV3,
                accessType: accessType,
                abi: this.CONTRACTS[version][accessType].abi
              });

            case 13:
            case "end":
              return _context14.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "GetAccessCharge",
    value: function GetAccessCharge(_ref20) {
      var objectId, args, _ref21, abi, info;

      return _regeneratorRuntime.async(function GetAccessCharge$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              objectId = _ref20.objectId, args = _ref20.args;
              _context15.next = 3;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                id: objectId
              }));

            case 3:
              _ref21 = _context15.sent;
              abi = _ref21.abi;
              _context15.next = 7;
              return _regeneratorRuntime.awrap(this.client.CallContractMethod({
                contractAddress: Utils.HashToAddress(objectId),
                abi: abi,
                methodName: "getAccessInfo",
                methodArgs: args
              }));

            case 7:
              info = _context15.sent;
              return _context15.abrupt("return", info[2]);

            case 9:
            case "end":
              return _context15.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "Owner",
    value: function Owner(_ref22) {
      var id, ownerAddress;
      return _regeneratorRuntime.async(function Owner$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              id = _ref22.id;

              if (this.client.signer) {
                _context16.next = 3;
                break;
              }

              return _context16.abrupt("return", false);

            case 3:
              _context16.next = 5;
              return _regeneratorRuntime.awrap(this.client.CallContractMethod({
                contractAddress: Utils.HashToAddress(id),
                methodName: "owner",
                methodArgs: []
              }));

            case 5:
              ownerAddress = _context16.sent;
              return _context16.abrupt("return", Utils.FormatAddress(ownerAddress));

            case 7:
            case "end":
              return _context16.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "Sign",
    value: function Sign(message) {
      return _regeneratorRuntime.async(function Sign$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return _regeneratorRuntime.awrap(Promise.resolve(Ethers.utils.joinSignature(this.client.signer.signingKey.signDigest(message))));

            case 2:
              return _context17.abrupt("return", _context17.sent);

            case 3:
            case "end":
              return _context17.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "KMSAddress",
    value: function KMSAddress(_ref23) {
      var objectId, versionHash, _ref24, abi;

      return _regeneratorRuntime.async(function KMSAddress$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              objectId = _ref23.objectId, versionHash = _ref23.versionHash;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              _context18.next = 4;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                id: objectId
              }));

            case 4:
              _ref24 = _context18.sent;
              abi = _ref24.abi;
              _context18.next = 8;
              return _regeneratorRuntime.awrap(this.client.CallContractMethod({
                contractAddress: Utils.HashToAddress(objectId),
                abi: abi,
                methodName: "addressKMS"
              }));

            case 8:
              return _context18.abrupt("return", _context18.sent);

            case 9:
            case "end":
              return _context18.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "KMSInfo",
    value: function KMSInfo(_ref25) {
      var objectId, versionHash, kmsId, KMSInfo, _ref26, abi, _ref27, _abi, publicKey;

      return _regeneratorRuntime.async(function KMSInfo$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              objectId = _ref25.objectId, versionHash = _ref25.versionHash, kmsId = _ref25.kmsId;

              if (!kmsId) {
                _context19.next = 11;
                break;
              }

              _context19.next = 4;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                address: this.client.contentSpaceAddress
              }));

            case 4:
              _ref26 = _context19.sent;
              abi = _ref26.abi;
              _context19.next = 8;
              return _regeneratorRuntime.awrap(this.client.CallContractMethod({
                contractAddress: this.client.contentSpaceAddress,
                abi: abi,
                methodName: "getKMSInfo",
                methodArgs: [kmsId, []],
                formatArguments: false
              }));

            case 8:
              KMSInfo = _context19.sent;
              _context19.next = 19;
              break;

            case 11:
              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              _context19.next = 14;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                id: objectId
              }));

            case 14:
              _ref27 = _context19.sent;
              _abi = _ref27.abi;
              _context19.next = 18;
              return _regeneratorRuntime.awrap(this.client.CallContractMethod({
                contractAddress: Utils.HashToAddress(objectId),
                abi: _abi,
                methodName: "getKMSInfo",
                methodArgs: [[]],
                formatArguments: false
              }));

            case 18:
              KMSInfo = _context19.sent;

            case 19:
              // Public key is compressed and hashed
              publicKey = Ethers.utils.computePublicKey(Utils.HashToAddress(KMSInfo[1]), false);
              return _context19.abrupt("return", {
                urls: KMSInfo[0].split(","),
                publicKey: publicKey
              });

            case 21:
            case "end":
              return _context19.stop();
          }
        }
      }, null, this);
    } // Retrieve symmetric key for object

  }, {
    key: "KMSSymmetricKey",
    value: function KMSSymmetricKey(_ref28) {
      var libraryId, objectId, kmsAddress, kmsCapId, kmsCap, paramTypes, params, packedHash;
      return _regeneratorRuntime.async(function KMSSymmetricKey$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              libraryId = _ref28.libraryId, objectId = _ref28.objectId;

              if (!libraryId) {
                libraryId = this.client.ContentObjectLibraryId({
                  objectId: objectId
                });
              }

              _context20.next = 4;
              return _regeneratorRuntime.awrap(this.KMSAddress({
                objectId: objectId
              }));

            case 4:
              kmsAddress = _context20.sent;
              kmsCapId = "eluv.caps.ikms".concat(Utils.AddressToHash(kmsAddress));
              _context20.next = 8;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: kmsCapId
              }));

            case 8:
              kmsCap = _context20.sent;
              paramTypes = ["string", "string", "string", "string", "string"];
              params = [this.client.contentSpaceId, libraryId, objectId, kmsCap || "", ""];
              packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
              _context20.next = 14;
              return _regeneratorRuntime.awrap(this.Sign(packedHash));

            case 14:
              params[5] = _context20.sent;
              _context20.next = 17;
              return _regeneratorRuntime.awrap(this.MakeKMSCall({
                objectId: objectId,
                methodName: "elv_getSymmetricKeyAuth",
                params: params
              }));

            case 17:
              return _context20.abrupt("return", _context20.sent);

            case 18:
            case "end":
              return _context20.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "MakeKMSCall",
    value: function MakeKMSCall(_ref29) {
      var objectId, versionHash, methodName, params, KMSUrls, i, stateChannelProvider;
      return _regeneratorRuntime.async(function MakeKMSCall$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              objectId = _ref29.objectId, versionHash = _ref29.versionHash, methodName = _ref29.methodName, params = _ref29.params;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              _context21.next = 4;
              return _regeneratorRuntime.awrap(this.KMSInfo({
                objectId: objectId,
                versionHash: versionHash
              }));

            case 4:
              KMSUrls = _context21.sent.urls;
              i = 0;

            case 6:
              if (!(i < KMSUrls.length)) {
                _context21.next = 23;
                break;
              }

              _context21.prev = 7;
              this.Log("Making KMS request:\n          URL: ".concat(KMSUrls[i], "\n          Method: ").concat(methodName, "\n          Params: ").concat(params.join(", ")));
              stateChannelProvider = new Ethers.providers.JsonRpcProvider(KMSUrls[i]);
              _context21.next = 12;
              return _regeneratorRuntime.awrap(stateChannelProvider.send(methodName, params));

            case 12:
              return _context21.abrupt("return", _context21.sent);

            case 15:
              _context21.prev = 15;
              _context21.t0 = _context21["catch"](7);
              this.Log("KMS Call Error: ".concat(_context21.t0), true); // If the request has been attempted on all KMS urls, throw the error

              if (!(i === KMSUrls.length - 1)) {
                _context21.next = 20;
                break;
              }

              throw _context21.t0;

            case 20:
              i++;
              _context21.next = 6;
              break;

            case 23:
            case "end":
              return _context21.stop();
          }
        }
      }, null, this, [[7, 15]]);
    }
  }, {
    key: "ContractHasMethod",
    value: function ContractHasMethod(_ref30) {
      var contractAddress, abi, methodName, key, method, methodSignature, methodId;
      return _regeneratorRuntime.async(function ContractHasMethod$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              contractAddress = _ref30.contractAddress, abi = _ref30.abi, methodName = _ref30.methodName;
              contractAddress = Utils.FormatAddress(contractAddress);
              key = "".concat(contractAddress, "-").concat(methodName);

              if (!(this.methodAvailability[key] === undefined)) {
                _context22.next = 17;
                break;
              }

              this.Log("Checking method availability: ".concat(contractAddress, " ").concat(methodName));

              if (abi) {
                _context22.next = 9;
                break;
              }

              _context22.next = 8;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                address: contractAddress
              }));

            case 8:
              abi = _context22.sent.abi;

            case 9:
              method = abi.find(function (method) {
                return method.name === methodName;
              });

              if (method) {
                _context22.next = 12;
                break;
              }

              return _context22.abrupt("return", false);

            case 12:
              methodSignature = "".concat(method.name, "(").concat(method.inputs.map(function (i) {
                return i.type;
              }).join(","), ")");
              methodId = Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(methodSignature)).replace("0x", "").slice(0, 8);
              _context22.next = 16;
              return _regeneratorRuntime.awrap(this.MakeElvMasterCall({
                methodName: "elv_deployedContractHasMethod",
                params: [contractAddress, methodId]
              }));

            case 16:
              this.methodAvailability[key] = _context22.sent;

            case 17:
              return _context22.abrupt("return", this.methodAvailability[key]);

            case 18:
            case "end":
              return _context22.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "MakeElvMasterCall",
    value: function MakeElvMasterCall(_ref31) {
      var methodName, params, ethUrls, i, url, elvMasterProvider;
      return _regeneratorRuntime.async(function MakeElvMasterCall$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              methodName = _ref31.methodName, params = _ref31.params;
              ethUrls = this.client.ethClient.ethereumURIs;
              i = 0;

            case 3:
              if (!(i < ethUrls.length)) {
                _context23.next = 21;
                break;
              }

              _context23.prev = 4;
              url = ethUrls[i];
              this.Log("Making elv-master request:\n          URL: ".concat(url, "\n          Method: ").concat(methodName, "\n          Params: ").concat(params.join(", ")));
              elvMasterProvider = new Ethers.providers.JsonRpcProvider(url);
              _context23.next = 10;
              return _regeneratorRuntime.awrap(elvMasterProvider.send(methodName, params));

            case 10:
              return _context23.abrupt("return", _context23.sent);

            case 13:
              _context23.prev = 13;
              _context23.t0 = _context23["catch"](4);
              this.Log("elv-master Call Error: ".concat(_context23.t0), true); // If the request has been attempted on all KMS urls, throw the error

              if (!(i === ethUrls.length - 1)) {
                _context23.next = 18;
                break;
              }

              throw _context23.t0;

            case 18:
              i++;
              _context23.next = 3;
              break;

            case 21:
            case "end":
              return _context23.stop();
          }
        }
      }, null, this, [[4, 13]]);
    }
  }, {
    key: "ReEncryptionConk",
    value: function ReEncryptionConk(_ref32) {
      var libraryId, objectId, versionHash, cap;
      return _regeneratorRuntime.async(function ReEncryptionConk$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              libraryId = _ref32.libraryId, objectId = _ref32.objectId, versionHash = _ref32.versionHash;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              if (this.reencryptionKeys[objectId]) {
                _context24.next = 10;
                break;
              }

              _context24.next = 5;
              return _regeneratorRuntime.awrap(Crypto.GenerateTargetConk());

            case 5:
              cap = _context24.sent;
              _context24.next = 8;
              return _regeneratorRuntime.awrap(this.KMSSymmetricKey({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 8:
              cap.symm_key = _context24.sent;
              this.reencryptionKeys[objectId] = cap;

            case 10:
              return _context24.abrupt("return", this.reencryptionKeys[objectId]);

            case 11:
            case "end":
              return _context24.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "RecordTags",
    value: function RecordTags(_ref33) {
      var accessType, libraryId, objectId, versionHash, _ref34, abi, owner;

      return _regeneratorRuntime.async(function RecordTags$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              accessType = _ref33.accessType, libraryId = _ref33.libraryId, objectId = _ref33.objectId, versionHash = _ref33.versionHash;

              if (!(accessType !== ACCESS_TYPES.OBJECT)) {
                _context25.next = 3;
                break;
              }

              return _context25.abrupt("return");

            case 3:
              _context25.next = 5;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                id: objectId
              }));

            case 5:
              _ref34 = _context25.sent;
              abi = _ref34.abi;
              _context25.next = 9;
              return _regeneratorRuntime.awrap(this.Owner({
                id: objectId,
                abi: abi
              }));

            case 9:
              owner = _context25.sent;

              if (Utils.EqualAddress(owner, this.client.signer.address)) {
                _context25.next = 13;
                break;
              }

              _context25.next = 13;
              return _regeneratorRuntime.awrap(this.client.userProfileClient.RecordTags({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 13:
            case "end":
              return _context25.stop();
          }
        }
      }, null, this);
    }
    /* Creation methods */

  }, {
    key: "CreateAccessGroup",
    value: function CreateAccessGroup() {
      var _ref35, contractAddress, transactionHash;

      return _regeneratorRuntime.async(function CreateAccessGroup$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              _context26.next = 2;
              return _regeneratorRuntime.awrap(this.client.ethClient.DeployAccessGroupContract({
                contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                signer: this.client.signer
              }));

            case 2:
              _ref35 = _context26.sent;
              contractAddress = _ref35.contractAddress;
              transactionHash = _ref35.transactionHash;
              return _context26.abrupt("return", {
                contractAddress: contractAddress,
                transactionHash: transactionHash
              });

            case 6:
            case "end":
              return _context26.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CreateContentType",
    value: function CreateContentType() {
      var _ref36, contractAddress, transactionHash;

      return _regeneratorRuntime.async(function CreateContentType$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              _context27.next = 2;
              return _regeneratorRuntime.awrap(this.client.ethClient.DeployTypeContract({
                contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                signer: this.client.signer
              }));

            case 2:
              _ref36 = _context27.sent;
              contractAddress = _ref36.contractAddress;
              transactionHash = _ref36.transactionHash;
              return _context27.abrupt("return", {
                contractAddress: contractAddress,
                transactionHash: transactionHash
              });

            case 6:
            case "end":
              return _context27.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CreateContentLibrary",
    value: function CreateContentLibrary(_ref37) {
      var kmsId, _ref38, contractAddress, transactionHash;

      return _regeneratorRuntime.async(function CreateContentLibrary$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              kmsId = _ref37.kmsId;
              _context28.next = 3;
              return _regeneratorRuntime.awrap(this.client.ethClient.DeployLibraryContract({
                contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                kmsId: kmsId,
                signer: this.client.signer
              }));

            case 3:
              _ref38 = _context28.sent;
              contractAddress = _ref38.contractAddress;
              transactionHash = _ref38.transactionHash;
              return _context28.abrupt("return", {
                contractAddress: contractAddress,
                transactionHash: transactionHash
              });

            case 7:
            case "end":
              return _context28.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CreateContentObject",
    value: function CreateContentObject(_ref39) {
      var libraryId, typeId, _ref40, contractAddress, transactionHash, objectId;

      return _regeneratorRuntime.async(function CreateContentObject$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              libraryId = _ref39.libraryId, typeId = _ref39.typeId;
              _context29.next = 3;
              return _regeneratorRuntime.awrap(this.client.ethClient.DeployContentContract({
                contentLibraryAddress: Utils.HashToAddress(libraryId),
                typeAddress: typeId ? Utils.HashToAddress(typeId) : Utils.nullAddress,
                signer: this.client.signer
              }));

            case 3:
              _ref40 = _context29.sent;
              contractAddress = _ref40.contractAddress;
              transactionHash = _ref40.transactionHash;
              // Cache object creation transaction for use in future updates
              objectId = Utils.AddressToObjectId(contractAddress);

              if (!this.noCache) {
                this.modifyTransactions.objects[objectId] = transactionHash;
              }

              return _context29.abrupt("return", {
                contractAddress: contractAddress,
                transactionHash: transactionHash
              });

            case 9:
            case "end":
              return _context29.stop();
          }
        }
      }, null, this);
    } // Clear cached access transaction IDs and state channel tokens

  }, {
    key: "ClearCache",
    value: function ClearCache() {
      this.accessTransactions = {
        spaces: {},
        libraries: {},
        types: {},
        objects: {},
        encryptedObjects: {},
        groups: {},
        wallets: {},
        other: {}
      };
      this.modifyTransactions = {
        spaces: {},
        libraries: {},
        types: {},
        objects: {},
        encryptedObjects: {},
        groups: {},
        wallets: {},
        other: {}
      };
      this.channelContentTokens = {};
    }
  }]);

  return AuthorizationClient;
}();

module.exports = AuthorizationClient;