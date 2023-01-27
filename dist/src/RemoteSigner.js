var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");
var _createClass = require("@babel/runtime/helpers/createClass");
var _inherits = require("@babel/runtime/helpers/inherits");
var _possibleConstructorReturn = require("@babel/runtime/helpers/possibleConstructorReturn");
var _getPrototypeOf = require("@babel/runtime/helpers/getPrototypeOf");
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Ethers = require("ethers");
var Utils = require("./Utils");
var HttpClient = require("./HttpClient");
var UrlJoin = require("url-join");
var RemoteSigner = /*#__PURE__*/function (_Ethers$Signer) {
  "use strict";

  _inherits(RemoteSigner, _Ethers$Signer);
  var _super = _createSuper(RemoteSigner);
  function RemoteSigner(_ref) {
    var _this;
    var signerURIs = _ref.signerURIs,
      idToken = _ref.idToken,
      authToken = _ref.authToken,
      tenantId = _ref.tenantId,
      provider = _ref.provider,
      _ref$extraData = _ref.extraData,
      extraData = _ref$extraData === void 0 ? {} : _ref$extraData,
      _ref$unsignedPublicAu = _ref.unsignedPublicAuth,
      unsignedPublicAuth = _ref$unsignedPublicAu === void 0 ? false : _ref$unsignedPublicAu;
    _classCallCheck(this, RemoteSigner);
    _this = _super.call(this);
    _this.remoteSigner = true;
    _this.unsignedPublicAuth = unsignedPublicAuth;
    _this.HttpClient = new HttpClient({
      uris: signerURIs
    });
    _this.idToken = idToken;
    _this.tenantId = tenantId;
    _this.authToken = authToken;
    _this.extraLoginData = extraData || {};
    _this.provider = provider;
    _this.signatureCache = {};
    return _this;
  }
  _createClass(RemoteSigner, [{
    key: "Initialize",
    value: function () {
      var _Initialize = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var _yield$Utils$Response, addr, eth, token, keys, address;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (this.authToken) {
                _context.next = 10;
                break;
              }
              _context.next = 3;
              return Utils.ResponseToJson(this.HttpClient.Request({
                path: UrlJoin("as", "wlt", "login", "jwt"),
                method: "POST",
                body: this.tenantId ? {
                  tid: this.tenantId,
                  ext: this.extraLoginData || {}
                } : {
                  ext: this.extraLoginData || {}
                },
                headers: {
                  Authorization: "Bearer ".concat(this.idToken)
                }
              }));
            case 3:
              _yield$Utils$Response = _context.sent;
              addr = _yield$Utils$Response.addr;
              eth = _yield$Utils$Response.eth;
              token = _yield$Utils$Response.token;
              this.authToken = token;
              this.address = Utils.FormatAddress(addr);
              this.id = eth;
            case 10:
              if (this.address) {
                _context.next = 16;
                break;
              }
              _context.next = 13;
              return Utils.ResponseToJson(this.HttpClient.Request({
                method: "GET",
                path: UrlJoin("as", "wlt", "keys"),
                headers: {
                  Authorization: "Bearer ".concat(this.authToken)
                }
              }));
            case 13:
              keys = _context.sent;
              address = keys.eth[0];
              if (address && address.startsWith("0x")) {
                this.address = address;
              } else {
                this.address = Utils.HashToAddress(keys.eth[0]);
              }
            case 16:
              this.id = this.address ? "ikms".concat(Utils.AddressToHash(this.address)) : undefined;
              this.signer = this.provider.getSigner(this.address);
            case 18:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function Initialize() {
        return _Initialize.apply(this, arguments);
      }
      return Initialize;
    }() // Overrides
  }, {
    key: "getAddress",
    value: function getAddress() {
      return this.address;
    }

    /**
     * Sign a hashed piece of data
     * @param {String} digest - Hex string of hashed data
     * @returns - the signed message as a hex string
     */
  }, {
    key: "signDigest",
    value: function () {
      var _signDigest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(digest) {
        var _this2 = this;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (!this.signatureCache[digest]) {
                this.signatureCache[digest] = new Promise( /*#__PURE__*/function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(resolve, reject) {
                    var signature;
                    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.prev = 0;
                          _context2.next = 3;
                          return Utils.ResponseToJson(_this2.HttpClient.Request({
                            method: "POST",
                            path: UrlJoin("as", "wlt", "sign", "eth", _this2.id),
                            headers: {
                              Authorization: "Bearer ".concat(_this2.authToken)
                            },
                            body: {
                              hash: digest
                            }
                          }));
                        case 3:
                          signature = _context2.sent;
                          signature.v = parseInt(signature.v, 16);
                          signature.recoveryParam = signature.v - 27;
                          resolve(signature);
                          _context2.next = 12;
                          break;
                        case 9:
                          _context2.prev = 9;
                          _context2.t0 = _context2["catch"](0);
                          reject(_context2.t0);
                        case 12:
                        case "end":
                          return _context2.stop();
                      }
                    }, _callee2, null, [[0, 9]]);
                  }));
                  return function (_x2, _x3) {
                    return _ref2.apply(this, arguments);
                  };
                }());
              }
              _context3.next = 3;
              return this.signatureCache[digest];
            case 3:
              return _context3.abrupt("return", _context3.sent);
            case 4:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function signDigest(_x) {
        return _signDigest.apply(this, arguments);
      }
      return signDigest;
    }()
  }, {
    key: "signMessage",
    value: function () {
      var _signMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(message) {
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.t0 = Promise;
              _context4.t1 = Ethers.utils;
              _context4.t2 = "0x";
              _context4.next = 5;
              return this.signDigest(Ethers.utils.hashMessage(message));
            case 5:
              _context4.t3 = _context4.sent;
              _context4.t4 = _context4.t2.concat.call(_context4.t2, _context4.t3);
              _context4.t5 = _context4.t1.joinSignature.call(_context4.t1, _context4.t4);
              return _context4.abrupt("return", _context4.t0.resolve.call(_context4.t0, _context4.t5));
            case 9:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function signMessage(_x4) {
        return _signMessage.apply(this, arguments);
      }
      return signMessage;
    }()
  }, {
    key: "sign",
    value: function () {
      var _sign = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(transaction) {
        var signature;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return Ethers.utils.resolveProperties(transaction);
            case 2:
              transaction = _context5.sent;
              _context5.next = 5;
              return this.signDigest(Ethers.utils.keccak256(Ethers.utils.serializeTransaction(transaction)));
            case 5:
              signature = _context5.sent;
              return _context5.abrupt("return", Ethers.utils.serializeTransaction(transaction, signature));
            case 7:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function sign(_x5) {
        return _sign.apply(this, arguments);
      }
      return sign;
    }()
  }, {
    key: "sendTransaction",
    value: function () {
      var _sendTransaction = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(transaction) {
        var _this3 = this;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              if (!(transaction.nonce == null)) {
                _context6.next = 5;
                break;
              }
              transaction = Ethers.utils.shallowCopy(transaction);
              _context6.next = 4;
              return this.provider.getTransactionCount(this.address, "pending");
            case 4:
              transaction.nonce = _context6.sent;
            case 5:
              return _context6.abrupt("return", Ethers.utils.populateTransaction(transaction, this.provider, this.address).then(function (tx) {
                return _this3.sign(tx).then(function (signedTransaction) {
                  return _this3.provider.sendTransaction(signedTransaction);
                });
              }));
            case 6:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this);
      }));
      function sendTransaction(_x6) {
        return _sendTransaction.apply(this, arguments);
      }
      return sendTransaction;
    }()
  }, {
    key: "connect",
    value: function connect() {}
  }]);
  return RemoteSigner;
}(Ethers.Signer);
module.exports = RemoteSigner;