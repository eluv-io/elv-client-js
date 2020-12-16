var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _typeof = require("@babel/runtime/helpers/typeof");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _v, _v2;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var HttpClient = require("./HttpClient");

var Ethers = require("ethers");

var Utils = require("./Utils");

var UrlJoin = require("url-join");

var bs58 = require("bs58");
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
    }
  }, {
    key: "AuthorizationToken",
    value: function AuthorizationToken(_ref2) {
      var libraryId, objectId, versionHash, partHash, encryption, audienceData, context, _ref2$update, update, _ref2$channelAuth, channelAuth, oauthToken, _ref2$noCache, noCache, _ref2$noAuth, noAuth, isWalletRequest, initialNoCache, authorizationToken;

      return _regeneratorRuntime.async(function AuthorizationToken$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              libraryId = _ref2.libraryId, objectId = _ref2.objectId, versionHash = _ref2.versionHash, partHash = _ref2.partHash, encryption = _ref2.encryption, audienceData = _ref2.audienceData, context = _ref2.context, _ref2$update = _ref2.update, update = _ref2$update === void 0 ? false : _ref2$update, _ref2$channelAuth = _ref2.channelAuth, channelAuth = _ref2$channelAuth === void 0 ? false : _ref2$channelAuth, oauthToken = _ref2.oauthToken, _ref2$noCache = _ref2.noCache, noCache = _ref2$noCache === void 0 ? false : _ref2$noCache, _ref2$noAuth = _ref2.noAuth, noAuth = _ref2$noAuth === void 0 ? false : _ref2$noAuth;

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
              return _regeneratorRuntime.awrap(this.client.userProfileClient.WalletAddress(false));

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

              if (!channelAuth) {
                _context2.next = 22;
                break;
              }

              _context2.next = 19;
              return _regeneratorRuntime.awrap(this.GenerateChannelContentToken({
                objectId: objectId,
                versionHash: versionHash,
                audienceData: audienceData,
                context: context,
                oauthToken: oauthToken
              }));

            case 19:
              authorizationToken = _context2.sent;
              _context2.next = 25;
              break;

            case 22:
              _context2.next = 24;
              return _regeneratorRuntime.awrap(this.GenerateAuthorizationToken({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                partHash: partHash,
                encryption: encryption,
                update: update,
                noAuth: noAuth
              }));

            case 24:
              authorizationToken = _context2.sent;

            case 25:
              return _context2.abrupt("return", authorizationToken);

            case 28:
              _context2.prev = 28;
              _context2.t4 = _context2["catch"](14);
              throw _context2.t4;

            case 31:
              _context2.prev = 31;
              this.noCache = initialNoCache;
              return _context2.finish(31);

            case 34:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[14, 28, 31, 34]]);
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

              if (transactionHash) {
                token.tx_id = transactionHash;
              }

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

      var libraryId, objectId, versionHash, _ref5$args, args, _ref5$publicKey, publicKey, _ref5$update, update, _ref5$skipCache, skipCache, _ref5$noCache, noCache, cacheOnly, walletContractAddress, walletCreated, id, _ref6, isV3, accessType, abi, _ref7, accessArgs, checkAccessCharge, address, elapsed, _cache, accessRequest, cache;

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

              if (!(typeof accessType === "undefined")) {
                _context4.next = 22;
                break;
              }

              throw Error("Unable to determine contract info for ".concat(id, " (").concat(this.client.utils.HashToAddress(id), ") - Wrong network?"));

            case 22:
              _context4.next = 24;
              return _regeneratorRuntime.awrap(this.AccessInfo({
                accessType: accessType,
                publicKey: publicKey,
                update: update,
                args: args,
                isV3: isV3
              }));

            case 24:
              _ref7 = _context4.sent;
              accessArgs = _ref7.accessArgs;
              checkAccessCharge = _ref7.checkAccessCharge;
              address = Utils.HashToAddress(id);
              elapsed = 0;

            case 29:
              if (!this.transactionLocks[id]) {
                _context4.next = 36;
                break;
              }

              _context4.next = 32;
              return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                return setTimeout(resolve, 100);
              }));

            case 32:
              elapsed += 100;

              if (elapsed > 15000) {
                this.Log("Lock never released for ".concat(id, " - releasing lock"));
                delete this.transactionLocks[id];
              }

              _context4.next = 29;
              break;

            case 36:
              _context4.prev = 36;
              this.transactionLocks[id] = true; // Check cache for existing transaction

              if (!(!noCache && !skipCache)) {
                _context4.next = 46;
                break;
              }

              _cache = update ? this.modifyTransactions : this.accessTransactions;

              if (!_cache[address]) {
                _context4.next = 46;
                break;
              }

              if (!(_cache[address].issuedAt > Date.now() - 12 * 60 * 60 * 1000)) {
                _context4.next = 45;
                break;
              }

              return _context4.abrupt("return", _cache[address]);

            case 45:
              // Token expired
              delete _cache[address];

            case 46:
              if (!cacheOnly) {
                _context4.next = 48;
                break;
              }

              return _context4.abrupt("return");

            case 48:
              if (!update) {
                _context4.next = 55;
                break;
              }

              this.Log("Making update request on ".concat(accessType, " ").concat(id));
              _context4.next = 52;
              return _regeneratorRuntime.awrap(this.UpdateRequest({
                id: id,
                abi: abi
              }));

            case 52:
              accessRequest = _context4.sent;
              _context4.next = 59;
              break;

            case 55:
              this.Log("Making access request on ".concat(accessType, " ").concat(id));
              _context4.next = 58;
              return _regeneratorRuntime.awrap(this.AccessRequest({
                id: id,
                args: accessArgs,
                checkAccessCharge: checkAccessCharge
              }));

            case 58:
              accessRequest = _context4.sent;

            case 59:
              cache = update ? this.modifyTransactions : this.accessTransactions;
              _context4.prev = 60;

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

              return _context4.abrupt("return", accessRequest);

            case 65:
              _context4.prev = 65;
              _context4.t0 = _context4["catch"](60);

              if (!noCache) {
                delete cache[address];
              }

              throw _context4.t0;

            case 69:
              _context4.prev = 69;
              delete this.transactionLocks[id];
              return _context4.finish(69);

            case 72:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this, [[36,, 69, 72], [60, 65]]);
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
                _context5.next = 26;
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
                _context5.next = 26;
                break;
              }

              _context5.prev = 13;
              // Extract level, custom values and stakeholders from accessRequest arguments
              accessChargeArgs = isV3 ? [0, [], []] : [args[0], args[3], args[4]]; // Access charge is in wei, but methods take ether - convert to charge to ether

              _context5.t0 = Utils;
              _context5.next = 18;
              return _regeneratorRuntime.awrap(this.GetAccessCharge({
                objectId: id,
                args: accessChargeArgs
              }));

            case 18:
              _context5.t1 = _context5.sent;
              accessCharge = _context5.t0.WeiToEther.call(_context5.t0, _context5.t1);
              _context5.next = 26;
              break;

            case 22:
              _context5.prev = 22;
              _context5.t2 = _context5["catch"](13);
              this.Log("Failed to get access charge for", id);
              this.Log(_context5.t2);

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

              _context5.next = 31;
              return _regeneratorRuntime.awrap(this.ContractHasMethod({
                contractAddress: contractAddress,
                abi: abi,
                methodName: methodName
              }));

            case 31:
              if (_context5.sent) {
                _context5.next = 34;
                break;
              }

              this.Log("".concat(accessType, " ").concat(id, " has no ").concat(methodName, " method. Skipping"));
              return _context5.abrupt("return", {
                transactionHash: "",
                logs: []
              });

            case 34:
              _context5.next = 36;
              return _regeneratorRuntime.awrap(this.client.CallContractMethodAndWait({
                contractAddress: contractAddress,
                abi: abi,
                methodName: methodName,
                methodArgs: args,
                value: accessCharge
              }));

            case 36:
              event = _context5.sent;

              if (!(event.logs.length === 0)) {
                _context5.next = 39;
                break;
              }

              throw Error("Access denied (".concat(id, ")"));

            case 39:
              return _context5.abrupt("return", event);

            case 40:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this, [[13, 22]]);
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

              throw Error("Update request denied for ".concat(id));

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
    key: "AudienceData",
    value: function AudienceData(_ref11) {
      var objectId = _ref11.objectId,
          versionHash = _ref11.versionHash,
          _ref11$protocols = _ref11.protocols,
          protocols = _ref11$protocols === void 0 ? [] : _ref11$protocols,
          _ref11$drms = _ref11.drms,
          drms = _ref11$drms === void 0 ? [] : _ref11$drms,
          context = _ref11.context;
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
    value: function GenerateChannelContentToken(_ref12) {
      var objectId, versionHash, issuer, code, email, audienceData, context, oauthToken, _ref12$value, value, token, tenantId, kmsAddress, stateChannelApi, additionalParams, payload, signature, multiSig;

      return _regeneratorRuntime.async(function GenerateChannelContentToken$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              objectId = _ref12.objectId, versionHash = _ref12.versionHash, issuer = _ref12.issuer, code = _ref12.code, email = _ref12.email, audienceData = _ref12.audienceData, context = _ref12.context, oauthToken = _ref12.oauthToken, _ref12$value = _ref12.value, value = _ref12$value === void 0 ? 0 : _ref12$value;

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
                _context7.next = 11;
                break;
              }

              if (!(this.channelContentTokens[objectId].issuedAt > Date.now() - 12 * 60 * 60 * 1000)) {
                _context7.next = 10;
                break;
              }

              return _context7.abrupt("return", this.channelContentTokens[objectId].token);

            case 10:
              // Token expired
              delete this.channelContentTokens[objectId];

            case 11:
              this.Log("Making state channel access request: ".concat(objectId));

              if (!issuer) {
                _context7.next = 43;
                break;
              }

              // Ticket API
              tenantId = issuer.replace(/^\//, "").split("/")[2];
              _context7.prev = 14;
              _context7.next = 17;
              return _regeneratorRuntime.awrap(this.client.CallContractMethod({
                contractAddress: Utils.HashToAddress(tenantId),
                methodName: "addressKMS"
              }));

            case 17:
              kmsAddress = _context7.sent;

              if (kmsAddress) {
                _context7.next = 20;
                break;
              }

              throw "";

            case 20:
              _context7.next = 27;
              break;

            case 22:
              _context7.prev = 22;
              _context7.t0 = _context7["catch"](14);
              _context7.next = 26;
              return _regeneratorRuntime.awrap(this.client.DefaultKMSAddress());

            case 26:
              kmsAddress = _context7.sent;

            case 27:
              _context7.prev = 27;
              _context7.next = 30;
              return _regeneratorRuntime.awrap(Utils.ResponseToFormat("text", this.MakeKMSRequest({
                kmsId: "ikms" + Utils.AddressToHash(kmsAddress),
                method: "POST",
                path: UrlJoin("as", issuer),
                body: {
                  "_PASSWORD": code,
                  "_EMAIL": email
                }
              })));

            case 30:
              token = _context7.sent;
              _context7.next = 40;
              break;

            case 33:
              _context7.prev = 33;
              _context7.t1 = _context7["catch"](27);
              this.Log("/as token redemption failed:", true);
              this.Log(_context7.t1, true);
              _context7.next = 39;
              return _regeneratorRuntime.awrap(Utils.ResponseToFormat("text", this.MakeKMSRequest({
                kmsId: "ikms" + Utils.AddressToHash(kmsAddress),
                method: "POST",
                path: UrlJoin("ks", issuer),
                body: {
                  "_PASSWORD": code,
                  "_EMAIL": email
                }
              })));

            case 39:
              token = _context7.sent;

            case 40:
              // Pull target object from token so token can be cached
              objectId = JSON.parse(Utils.FromB64(token)).qid;
              _context7.next = 54;
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
              _context7.next = 48;
              return _regeneratorRuntime.awrap(this.MakeKMSCall({
                objectId: objectId,
                methodName: stateChannelApi,
                paramTypes: ["address", "address", "uint", "uint"],
                params: [this.client.signer.address, Utils.HashToAddress(objectId), value, Date.now()],
                additionalParams: additionalParams
              }));

            case 48:
              payload = _context7.sent;
              _context7.next = 51;
              return _regeneratorRuntime.awrap(this.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(payload))));

            case 51:
              signature = _context7.sent;
              multiSig = Utils.FormatSignature(signature);
              token = "".concat(payload, ".").concat(Utils.B64(multiSig));

            case 54:
              if (!this.noCache) {
                this.channelContentTokens[objectId] = {
                  token: token,
                  issuedAt: Date.now()
                };
              }

              return _context7.abrupt("return", token);

            case 56:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this, [[14, 22], [27, 33]]);
    }
  }, {
    key: "ChannelContentFinalize",
    value: function ChannelContentFinalize(_ref13) {
      var objectId, versionHash, _ref13$percent, percent, result;

      return _regeneratorRuntime.async(function ChannelContentFinalize$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              objectId = _ref13.objectId, versionHash = _ref13.versionHash, _ref13$percent = _ref13.percent, percent = _ref13$percent === void 0 ? 0 : _ref13$percent;
              this.Log("Making state channel finalize request: ".concat(objectId));
              _context8.next = 4;
              return _regeneratorRuntime.awrap(this.MakeKMSCall({
                objectId: objectId,
                methodName: "elv_channelContentFinalizeContext",
                paramTypes: ["address", "address", "uint", "uint"],
                params: [this.client.signer.address, Utils.HashToAddress(objectId), percent, Date.now()],
                additionalParams: [JSON.stringify(this.AudienceData({
                  objectId: objectId,
                  versionHash: versionHash
                }))]
              }));

            case 4:
              result = _context8.sent;
              this.channelContentTokens[objectId] = undefined;
              return _context8.abrupt("return", result);

            case 7:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "GenerateOauthChannelToken",
    value: function GenerateOauthChannelToken(_ref14) {
      var objectId, versionHash, token, fabricToken;
      return _regeneratorRuntime.async(function GenerateOauthChannelToken$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              objectId = _ref14.objectId, versionHash = _ref14.versionHash, token = _ref14.token;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              if (!(!this.noCache && this.channelContentTokens[objectId])) {
                _context9.next = 6;
                break;
              }

              if (!(this.channelContentTokens[objectId].issuedAt > Date.now() - 12 * 60 * 60 * 1000)) {
                _context9.next = 5;
                break;
              }

              return _context9.abrupt("return", this.channelContentTokens[objectId].token);

            case 5:
              // Token expired
              this.channelContentTokens[objectId] = undefined;

            case 6:
              _context9.t0 = _regeneratorRuntime;
              _context9.next = 9;
              return _regeneratorRuntime.awrap(this.MakeKMSRequest({
                objectId: objectId,
                versionHash: versionHash,
                method: "GET",
                path: UrlJoin("ks", "jwt", "q", objectId),
                bodyType: "NONE",
                headers: {
                  Authorization: "Bearer ".concat(token)
                }
              }));

            case 9:
              _context9.t1 = _context9.sent.text();
              _context9.next = 12;
              return _context9.t0.awrap.call(_context9.t0, _context9.t1);

            case 12:
              fabricToken = _context9.sent;

              if (!this.noCache) {
                this.channelContentTokens[objectId] = {
                  token: fabricToken,
                  issuedAt: Date.now()
                };
              }

              return _context9.abrupt("return", fabricToken);

            case 15:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "IsV3",
    value: function IsV3(_ref15) {
      var id, contractName;
      return _regeneratorRuntime.async(function IsV3$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              id = _ref15.id;
              _context10.next = 3;
              return _regeneratorRuntime.awrap(this.client.ethClient.ContractName(Utils.HashToAddress(id), true));

            case 3:
              contractName = _context10.sent;

              if (!this.accessVersions[contractName]) {
                this.accessVersions[contractName] = this.ContractHasMethod({
                  contractAddress: this.client.utils.HashToAddress(id),
                  abi: this.CONTRACTS.v3[this.ACCESS_TYPES.ACCESSIBLE].abi,
                  methodName: "accessRequestV3"
                });
              }

              _context10.next = 7;
              return _regeneratorRuntime.awrap(this.accessVersions[contractName]);

            case 7:
              return _context10.abrupt("return", _context10.sent);

            case 8:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "AccessInfo",
    value: function AccessInfo(_ref16) {
      var accessType, publicKey, args, isV3, checkAccessCharge;
      return _regeneratorRuntime.async(function AccessInfo$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              accessType = _ref16.accessType, publicKey = _ref16.publicKey, args = _ref16.args, isV3 = _ref16.isV3;
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

              return _context11.abrupt("return", {
                accessArgs: args,
                checkAccessCharge: checkAccessCharge
              });

            case 5:
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
                _context12.next = 23;
                break;
              }

              _context12.t0 = contractName;
              _context12.next = _context12.t0 === "BaseContentSpace" ? 7 : _context12.t0 === "BaseLibrary" ? 9 : _context12.t0 === "BaseContentType" ? 11 : _context12.t0 === "BsAccessWallet" ? 13 : _context12.t0 === "BsAccessCtrlGrp" ? 15 : _context12.t0 === "BaseContent" ? 17 : _context12.t0 === "BaseTenantSpace" ? 19 : 21;
              break;

            case 7:
              accessType = ACCESS_TYPES.SPACE;
              return _context12.abrupt("break", 22);

            case 9:
              accessType = ACCESS_TYPES.LIBRARY;
              return _context12.abrupt("break", 22);

            case 11:
              accessType = ACCESS_TYPES.TYPE;
              return _context12.abrupt("break", 22);

            case 13:
              accessType = ACCESS_TYPES.WALLET;
              return _context12.abrupt("break", 22);

            case 15:
              accessType = ACCESS_TYPES.GROUP;
              return _context12.abrupt("break", 22);

            case 17:
              accessType = ACCESS_TYPES.OBJECT;
              return _context12.abrupt("break", 22);

            case 19:
              accessType = ACCESS_TYPES.TENANT;
              return _context12.abrupt("break", 22);

            case 21:
              accessType = ACCESS_TYPES.OTHER;

            case 22:
              this.accessTypes[id] = accessType;

            case 23:
              return _context12.abrupt("return", this.accessTypes[id]);

            case 24:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "AccessComplete",
    value: function AccessComplete(_ref17) {
      var id, score, _ref18, abi, isV3, address, requestId, event;

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
              isV3 = _ref18.isV3;
              address = Utils.HashToAddress(id);
              requestId = this.requestIds[address];

              if (requestId) {
                _context13.next = 11;
                break;
              }

              throw Error("Unknown request ID for " + id);

            case 11:
              if (!isV3) {
                _context13.next = 17;
                break;
              }

              _context13.next = 14;
              return _regeneratorRuntime.awrap(this.client.CallContractMethodAndWait({
                contractAddress: address,
                abi: abi,
                methodName: "accessCompleteV3",
                methodArgs: [requestId, [], []]
              }));

            case 14:
              event = _context13.sent;
              _context13.next = 20;
              break;

            case 17:
              _context13.next = 19;
              return _regeneratorRuntime.awrap(this.client.CallContractMethodAndWait({
                contractAddress: address,
                abi: abi,
                methodName: isV3 ? "accessCompleteV3" : "accessComplete",
                methodArgs: [requestId, score, ""]
              }));

            case 19:
              event = _context13.sent;

            case 20:
              delete this.requestIds[address];
              delete this.accessTransactions[address];
              return _context13.abrupt("return", event);

            case 23:
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

              return _context14.abrupt("return", {});

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
              return _context15.abrupt("return", info[1] === 0 ? 0 : info[2]);

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
      var id, address, ownerAddress;
      return _regeneratorRuntime.async(function Owner$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              id = _ref22.id, address = _ref22.address;

              if (this.client.signer) {
                _context16.next = 3;
                break;
              }

              return _context16.abrupt("return", false);

            case 3:
              if (id) {
                address = Utils.HashToAddress(id);
              }

              _context16.next = 6;
              return _regeneratorRuntime.awrap(this.client.CallContractMethod({
                contractAddress: address,
                methodName: "owner",
                methodArgs: []
              }));

            case 6:
              ownerAddress = _context16.sent;
              return _context16.abrupt("return", Utils.FormatAddress(ownerAddress));

            case 8:
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

              if (abi) {
                _context18.next = 8;
                break;
              }

              throw Error("Unable to determine contract info for ".concat(objectId, " - wrong network?"));

            case 8:
              _context18.next = 10;
              return _regeneratorRuntime.awrap(this.client.CallContractMethod({
                contractAddress: Utils.HashToAddress(objectId),
                abi: abi,
                methodName: "addressKMS"
              }));

            case 10:
              return _context18.abrupt("return", _context18.sent);

            case 11:
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
    key: "RetrieveConk",
    value: function RetrieveConk(_ref28) {
      var libraryId, objectId, kmsAddress, kmsCapId, kmsCap, cap;
      return _regeneratorRuntime.async(function RetrieveConk$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              libraryId = _ref28.libraryId, objectId = _ref28.objectId;

              if (libraryId) {
                _context20.next = 5;
                break;
              }

              _context20.next = 4;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 4:
              libraryId = _context20.sent;

            case 5:
              _context20.next = 7;
              return _regeneratorRuntime.awrap(this.KMSAddress({
                objectId: objectId
              }));

            case 7:
              kmsAddress = _context20.sent;
              kmsCapId = "eluv.caps.ikms".concat(Utils.AddressToHash(kmsAddress));
              _context20.next = 11;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: kmsCapId
              }));

            case 11:
              kmsCap = _context20.sent;

              if (kmsCap) {
                _context20.next = 14;
                break;
              }

              throw Error("No KMS key set for this object");

            case 14:
              _context20.next = 16;
              return _regeneratorRuntime.awrap(this.MakeKMSCall({
                objectId: objectId,
                methodName: "elv_getEncryptionKey",
                paramTypes: ["string", "string", "string", "string", "string"],
                params: [this.client.contentSpaceId, libraryId, objectId, kmsCap || "", ""]
              }));

            case 16:
              cap = _context20.sent;
              return _context20.abrupt("return", JSON.parse(bs58.decode(cap.replace(/^kp__/, "")).toString("utf-8")));

            case 18:
            case "end":
              return _context20.stop();
          }
        }
      }, null, this);
    } // Retrieve symmetric key for object

  }, {
    key: "RetrieveReencryptionSymmetricKey",
    value: function RetrieveReencryptionSymmetricKey(_ref29) {
      var libraryId, objectId, kmsAddress, kmsCapId, kmsCap;
      return _regeneratorRuntime.async(function RetrieveReencryptionSymmetricKey$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              libraryId = _ref29.libraryId, objectId = _ref29.objectId;

              if (libraryId) {
                _context21.next = 5;
                break;
              }

              _context21.next = 4;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 4:
              libraryId = _context21.sent;

            case 5:
              _context21.next = 7;
              return _regeneratorRuntime.awrap(this.KMSAddress({
                objectId: objectId
              }));

            case 7:
              kmsAddress = _context21.sent;
              kmsCapId = "eluv.caps.ikms".concat(Utils.AddressToHash(kmsAddress));
              _context21.next = 11;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: kmsCapId
              }));

            case 11:
              kmsCap = _context21.sent;

              if (kmsCap) {
                _context21.next = 14;
                break;
              }

              throw Error("No KMS key set for this object");

            case 14:
              _context21.next = 16;
              return _regeneratorRuntime.awrap(this.MakeKMSCall({
                objectId: objectId,
                methodName: "elv_getSymmetricKeyAuth",
                paramTypes: ["string", "string", "string", "string", "string"],
                params: [this.client.contentSpaceId, libraryId, objectId, kmsCap || "", ""]
              }));

            case 16:
              return _context21.abrupt("return", _context21.sent);

            case 17:
            case "end":
              return _context21.stop();
          }
        }
      }, null, this);
    } // Make an RPC call to the KMS with signed parameters

  }, {
    key: "MakeKMSCall",
    value: function MakeKMSCall(_ref30) {
      var kmsId, tenantId, objectId, versionHash, methodName, params, paramTypes, _ref30$additionalPara, additionalParams, _ref30$signature, signature, packedHash, KMSUrls, i, stateChannelProvider;

      return _regeneratorRuntime.async(function MakeKMSCall$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              kmsId = _ref30.kmsId, tenantId = _ref30.tenantId, objectId = _ref30.objectId, versionHash = _ref30.versionHash, methodName = _ref30.methodName, params = _ref30.params, paramTypes = _ref30.paramTypes, _ref30$additionalPara = _ref30.additionalParams, additionalParams = _ref30$additionalPara === void 0 ? [] : _ref30$additionalPara, _ref30$signature = _ref30.signature, signature = _ref30$signature === void 0 ? true : _ref30$signature;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              if (objectId) {
                _context22.next = 10;
                break;
              }

              _context22.t0 = "ikms";
              _context22.t1 = Utils;
              _context22.next = 7;
              return _regeneratorRuntime.awrap(this.client.DefaultKMSAddress({
                tenantId: tenantId
              }));

            case 7:
              _context22.t2 = _context22.sent;
              _context22.t3 = _context22.t1.AddressToHash.call(_context22.t1, _context22.t2);
              kmsId = _context22.t0.concat.call(_context22.t0, _context22.t3);

            case 10:
              if (!signature) {
                _context22.next = 17;
                break;
              }

              packedHash = Ethers.utils.solidityKeccak256(paramTypes, params);
              _context22.t4 = params;
              _context22.next = 15;
              return _regeneratorRuntime.awrap(this.Sign(packedHash));

            case 15:
              _context22.t5 = _context22.sent;

              _context22.t4.push.call(_context22.t4, _context22.t5);

            case 17:
              params = params.concat(additionalParams);
              _context22.next = 20;
              return _regeneratorRuntime.awrap(this.KMSInfo({
                kmsId: kmsId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 20:
              KMSUrls = _context22.sent.urls;
              i = 0;

            case 22:
              if (!(i < KMSUrls.length)) {
                _context22.next = 39;
                break;
              }

              _context22.prev = 23;
              this.Log("Making KMS request:\n          URL: ".concat(KMSUrls[i], "\n          Method: ").concat(methodName, "\n          Params: ").concat(params.join(", ")));
              stateChannelProvider = new Ethers.providers.JsonRpcProvider(KMSUrls[i]);
              _context22.next = 28;
              return _regeneratorRuntime.awrap(stateChannelProvider.send(methodName, params));

            case 28:
              return _context22.abrupt("return", _context22.sent);

            case 31:
              _context22.prev = 31;
              _context22.t6 = _context22["catch"](23);
              this.Log("KMS Call Error: ".concat(_context22.t6), true); // If the request has been attempted on all KMS urls, throw the error

              if (!(i === KMSUrls.length - 1)) {
                _context22.next = 36;
                break;
              }

              throw _context22.t6;

            case 36:
              i++;
              _context22.next = 22;
              break;

            case 39:
            case "end":
              return _context22.stop();
          }
        }
      }, null, this, [[23, 31]]);
    } // Make an arbitrary HTTP call to the KMS

  }, {
    key: "MakeKMSRequest",
    value: function MakeKMSRequest(_ref31) {
      var kmsId, objectId, versionHash, _ref31$method, method, path, bodyType, _ref31$body, body, _ref31$queryParams, queryParams, headers, kmsUrls, kmsHttpClient;

      return _regeneratorRuntime.async(function MakeKMSRequest$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              kmsId = _ref31.kmsId, objectId = _ref31.objectId, versionHash = _ref31.versionHash, _ref31$method = _ref31.method, method = _ref31$method === void 0 ? "GET" : _ref31$method, path = _ref31.path, bodyType = _ref31.bodyType, _ref31$body = _ref31.body, body = _ref31$body === void 0 ? {} : _ref31$body, _ref31$queryParams = _ref31.queryParams, queryParams = _ref31$queryParams === void 0 ? {} : _ref31$queryParams, headers = _ref31.headers;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              if (!(!objectId && !kmsId)) {
                _context23.next = 10;
                break;
              }

              _context23.t0 = "ikms";
              _context23.t1 = Utils;
              _context23.next = 7;
              return _regeneratorRuntime.awrap(this.client.DefaultKMSAddress());

            case 7:
              _context23.t2 = _context23.sent;
              _context23.t3 = _context23.t1.AddressToHash.call(_context23.t1, _context23.t2);
              kmsId = _context23.t0.concat.call(_context23.t0, _context23.t3);

            case 10:
              _context23.next = 12;
              return _regeneratorRuntime.awrap(this.KMSInfo({
                kmsId: kmsId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 12:
              kmsUrls = _context23.sent.urls;

              if (!(!kmsUrls || !kmsUrls[0])) {
                _context23.next = 15;
                break;
              }

              throw Error("No KMS info set for ".concat(versionHash || objectId || "default KMS"));

            case 15:
              kmsHttpClient = new HttpClient({
                uris: kmsUrls,
                debug: true
              });
              _context23.next = 18;
              return _regeneratorRuntime.awrap(kmsHttpClient.Request({
                method: method,
                path: path,
                bodyType: bodyType,
                body: body,
                headers: headers,
                queryParams: queryParams
              }));

            case 18:
              return _context23.abrupt("return", _context23.sent);

            case 19:
            case "end":
              return _context23.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "ContractHasMethod",
    value: function ContractHasMethod(_ref32) {
      var contractAddress, abi, methodName, key, method, methodSignature, methodId;
      return _regeneratorRuntime.async(function ContractHasMethod$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              contractAddress = _ref32.contractAddress, abi = _ref32.abi, methodName = _ref32.methodName;
              contractAddress = Utils.FormatAddress(contractAddress);
              key = "".concat(contractAddress, "-").concat(methodName);

              if (!(this.methodAvailability[key] === undefined)) {
                _context24.next = 19;
                break;
              }

              this.Log("Checking method availability: ".concat(contractAddress, " ").concat(methodName));

              if (abi) {
                _context24.next = 9;
                break;
              }

              _context24.next = 8;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                address: contractAddress
              }));

            case 8:
              abi = _context24.sent.abi;

            case 9:
              if (abi) {
                _context24.next = 11;
                break;
              }

              throw Error("No ABI for specified contract (wrong network?)");

            case 11:
              method = abi.find(function (method) {
                return method.name === methodName;
              });

              if (method) {
                _context24.next = 14;
                break;
              }

              return _context24.abrupt("return", false);

            case 14:
              methodSignature = "".concat(method.name, "(").concat(method.inputs.map(function (i) {
                return i.type;
              }).join(","), ")");
              methodId = Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(methodSignature)).replace("0x", "").slice(0, 8);
              _context24.next = 18;
              return _regeneratorRuntime.awrap(this.MakeElvMasterCall({
                methodName: "elv_deployedContractHasMethod",
                params: [contractAddress, methodId]
              }));

            case 18:
              this.methodAvailability[key] = _context24.sent;

            case 19:
              return _context24.abrupt("return", this.methodAvailability[key]);

            case 20:
            case "end":
              return _context24.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "MakeElvMasterCall",
    value: function MakeElvMasterCall(_ref33) {
      var methodName, params, ethUrls, i, url, elvMasterProvider;
      return _regeneratorRuntime.async(function MakeElvMasterCall$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              methodName = _ref33.methodName, params = _ref33.params;
              ethUrls = this.client.ethClient.ethereumURIs;
              i = 0;

            case 3:
              if (!(i < ethUrls.length)) {
                _context25.next = 21;
                break;
              }

              _context25.prev = 4;
              url = ethUrls[i];
              this.Log("Making elv-master request:\n          URL: ".concat(url, "\n          Method: ").concat(methodName, "\n          Params: ").concat(params.join(", ")));
              elvMasterProvider = new Ethers.providers.JsonRpcProvider(url);
              _context25.next = 10;
              return _regeneratorRuntime.awrap(elvMasterProvider.send(methodName, params));

            case 10:
              return _context25.abrupt("return", _context25.sent);

            case 13:
              _context25.prev = 13;
              _context25.t0 = _context25["catch"](4);
              this.Log("elv-master Call Error: ".concat(_context25.t0), true); // If the request has been attempted on all KMS urls, throw the error

              if (!(i === ethUrls.length - 1)) {
                _context25.next = 18;
                break;
              }

              throw _context25.t0;

            case 18:
              i++;
              _context25.next = 3;
              break;

            case 21:
            case "end":
              return _context25.stop();
          }
        }
      }, null, this, [[4, 13]]);
    }
  }, {
    key: "ReEncryptionConk",
    value: function ReEncryptionConk(_ref34) {
      var libraryId, objectId, versionHash, cap;
      return _regeneratorRuntime.async(function ReEncryptionConk$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              libraryId = _ref34.libraryId, objectId = _ref34.objectId, versionHash = _ref34.versionHash;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              if (this.reencryptionKeys[objectId]) {
                _context26.next = 10;
                break;
              }

              _context26.next = 5;
              return _regeneratorRuntime.awrap(this.client.Crypto.GenerateTargetConk());

            case 5:
              cap = _context26.sent;
              _context26.next = 8;
              return _regeneratorRuntime.awrap(this.RetrieveReencryptionSymmetricKey({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 8:
              cap.symm_key = _context26.sent;
              this.reencryptionKeys[objectId] = cap;

            case 10:
              return _context26.abrupt("return", this.reencryptionKeys[objectId]);

            case 11:
            case "end":
              return _context26.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "EncryptionConk",
    value: function EncryptionConk(_ref35) {
      var libraryId, objectId, versionHash, conk, _ref36, secret_key;

      return _regeneratorRuntime.async(function EncryptionConk$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              libraryId = _ref35.libraryId, objectId = _ref35.objectId, versionHash = _ref35.versionHash;

              if (versionHash) {
                objectId = Utils.DecodeVersionHash(versionHash).objectId;
              }

              if (libraryId) {
                _context27.next = 6;
                break;
              }

              _context27.next = 5;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 5:
              libraryId = _context27.sent;

            case 6:
              if (this.encryptionKeys[objectId]) {
                _context27.next = 16;
                break;
              }

              _context27.next = 9;
              return _regeneratorRuntime.awrap(this.RetrieveConk({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 9:
              conk = _context27.sent;
              _context27.next = 12;
              return _regeneratorRuntime.awrap(this.client.Crypto.GeneratePrimaryConk({
                objectId: objectId
              }));

            case 12:
              _ref36 = _context27.sent;
              secret_key = _ref36.secret_key;
              conk.secret_key = secret_key; // { secret_key, public_key, symm_key, block_size }

              this.encryptionKeys[objectId] = conk;

            case 16:
              return _context27.abrupt("return", this.encryptionKeys[objectId]);

            case 17:
            case "end":
              return _context27.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "RecordTags",
    value: function RecordTags(_ref37) {
      var accessType, libraryId, objectId, versionHash, _ref38, abi, owner;

      return _regeneratorRuntime.async(function RecordTags$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              accessType = _ref37.accessType, libraryId = _ref37.libraryId, objectId = _ref37.objectId, versionHash = _ref37.versionHash;

              if (!(accessType !== ACCESS_TYPES.OBJECT)) {
                _context28.next = 3;
                break;
              }

              return _context28.abrupt("return");

            case 3:
              _context28.next = 5;
              return _regeneratorRuntime.awrap(this.ContractInfo({
                id: objectId
              }));

            case 5:
              _ref38 = _context28.sent;
              abi = _ref38.abi;
              _context28.next = 9;
              return _regeneratorRuntime.awrap(this.Owner({
                id: objectId,
                abi: abi
              }));

            case 9:
              owner = _context28.sent;

              if (Utils.EqualAddress(owner, this.client.signer.address)) {
                _context28.next = 13;
                break;
              }

              _context28.next = 13;
              return _regeneratorRuntime.awrap(this.client.userProfileClient.RecordTags({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 13:
            case "end":
              return _context28.stop();
          }
        }
      }, null, this);
    }
    /* Creation methods */

  }, {
    key: "CreateAccessGroup",
    value: function CreateAccessGroup() {
      var _ref39, contractAddress, transactionHash;

      return _regeneratorRuntime.async(function CreateAccessGroup$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              _context29.next = 2;
              return _regeneratorRuntime.awrap(this.client.ethClient.DeployAccessGroupContract({
                contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                signer: this.client.signer
              }));

            case 2:
              _ref39 = _context29.sent;
              contractAddress = _ref39.contractAddress;
              transactionHash = _ref39.transactionHash;
              return _context29.abrupt("return", {
                contractAddress: contractAddress,
                transactionHash: transactionHash
              });

            case 6:
            case "end":
              return _context29.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CreateContentType",
    value: function CreateContentType() {
      var _ref40, contractAddress, transactionHash;

      return _regeneratorRuntime.async(function CreateContentType$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              _context30.next = 2;
              return _regeneratorRuntime.awrap(this.client.ethClient.DeployTypeContract({
                contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                signer: this.client.signer
              }));

            case 2:
              _ref40 = _context30.sent;
              contractAddress = _ref40.contractAddress;
              transactionHash = _ref40.transactionHash;
              return _context30.abrupt("return", {
                contractAddress: contractAddress,
                transactionHash: transactionHash
              });

            case 6:
            case "end":
              return _context30.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CreateContentLibrary",
    value: function CreateContentLibrary(_ref41) {
      var kmsId, _ref42, contractAddress, transactionHash;

      return _regeneratorRuntime.async(function CreateContentLibrary$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              kmsId = _ref41.kmsId;
              _context31.next = 3;
              return _regeneratorRuntime.awrap(this.client.ethClient.DeployLibraryContract({
                contentSpaceAddress: Utils.HashToAddress(this.contentSpaceId),
                kmsId: kmsId,
                signer: this.client.signer
              }));

            case 3:
              _ref42 = _context31.sent;
              contractAddress = _ref42.contractAddress;
              transactionHash = _ref42.transactionHash;
              return _context31.abrupt("return", {
                contractAddress: contractAddress,
                transactionHash: transactionHash
              });

            case 7:
            case "end":
              return _context31.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CreateContentObject",
    value: function CreateContentObject(_ref43) {
      var libraryId, typeId, _ref44, contractAddress, transactionHash;

      return _regeneratorRuntime.async(function CreateContentObject$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              libraryId = _ref43.libraryId, typeId = _ref43.typeId;
              _context32.next = 3;
              return _regeneratorRuntime.awrap(this.client.ethClient.DeployContentContract({
                contentLibraryAddress: Utils.HashToAddress(libraryId),
                typeAddress: typeId ? Utils.HashToAddress(typeId) : Utils.nullAddress,
                signer: this.client.signer
              }));

            case 3:
              _ref44 = _context32.sent;
              contractAddress = _ref44.contractAddress;
              transactionHash = _ref44.transactionHash;
              return _context32.abrupt("return", {
                contractAddress: contractAddress,
                transactionHash: transactionHash
              });

            case 7:
            case "end":
              return _context32.stop();
          }
        }
      }, null, this);
    } // Clear cached access transaction IDs and state channel tokens

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