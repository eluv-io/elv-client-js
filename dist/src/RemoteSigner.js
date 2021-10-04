var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

var _possibleConstructorReturn = require("@babel/runtime/helpers/possibleConstructorReturn");

var _getPrototypeOf = require("@babel/runtime/helpers/getPrototypeOf");

var _inherits = require("@babel/runtime/helpers/inherits");

var Ethers = require("ethers");

var Utils = require("./Utils");

var HttpClient = require("./HttpClient");

var UrlJoin = require("url-join");

var RemoteSigner =
/*#__PURE__*/
function (_Ethers$Signer) {
  "use strict";

  _inherits(RemoteSigner, _Ethers$Signer);

  function RemoteSigner(_ref) {
    var _this;

    var rpcUris = _ref.rpcUris,
        idToken = _ref.idToken,
        authToken = _ref.authToken,
        address = _ref.address,
        tenantId = _ref.tenantId,
        provider = _ref.provider,
        _ref$extraData = _ref.extraData,
        extraData = _ref$extraData === void 0 ? {} : _ref$extraData;

    _classCallCheck(this, RemoteSigner);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RemoteSigner).call(this));
    _this.remoteSigner = true;
    _this.HttpClient = new HttpClient({
      uris: rpcUris
    });
    _this.idToken = idToken;
    _this.tenantId = tenantId;
    _this.authToken = authToken;
    _this.address = address ? Utils.FormatAddress(address) : undefined;
    _this.id = _this.address ? "ikms".concat(Utils.AddressToHash(_this.address)) : undefined;
    _this.extraLoginData = extraData || {};
    _this.provider = provider;
    return _this;
  }

  _createClass(RemoteSigner, [{
    key: "Initialize",
    value: function Initialize() {
      var _ref2, addr, eth, token;

      return _regeneratorRuntime.async(function Initialize$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (this.authToken) {
                _context.next = 10;
                break;
              }

              _context.next = 3;
              return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.HttpClient.Request({
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
              })));

            case 3:
              _ref2 = _context.sent;
              addr = _ref2.addr;
              eth = _ref2.eth;
              token = _ref2.token;
              this.authToken = token;
              this.address = Utils.FormatAddress(addr);
              this.id = eth;

            case 10:
              this.signer = this.provider.getSigner(this.address);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    } // Overrides

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
    value: function signDigest(digest) {
      var signature;
      return _regeneratorRuntime.async(function signDigest$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.HttpClient.Request({
                method: "POST",
                path: UrlJoin("as", "wlt", "sign", "eth", this.id),
                headers: {
                  Authorization: "Bearer ".concat(this.authToken)
                },
                body: {
                  hash: digest
                }
              })));

            case 2:
              signature = _context2.sent;
              signature.v = parseInt(signature.v, 16);
              signature.recoveryParam = signature.v - 27;
              return _context2.abrupt("return", signature);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "signMessage",
    value: function signMessage(message) {
      return _regeneratorRuntime.async(function signMessage$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.t0 = Promise;
              _context3.t1 = Ethers.utils;
              _context3.t2 = "0x";
              _context3.next = 5;
              return _regeneratorRuntime.awrap(this.signDigest(Ethers.utils.hashMessage(message)));

            case 5:
              _context3.t3 = _context3.sent;
              _context3.t4 = _context3.t2.concat.call(_context3.t2, _context3.t3);
              _context3.t5 = _context3.t1.joinSignature.call(_context3.t1, _context3.t4);
              return _context3.abrupt("return", _context3.t0.resolve.call(_context3.t0, _context3.t5));

            case 9:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "sign",
    value: function sign(transaction) {
      var signature;
      return _regeneratorRuntime.async(function sign$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regeneratorRuntime.awrap(Ethers.utils.resolveProperties(transaction));

            case 2:
              transaction = _context4.sent;
              _context4.next = 5;
              return _regeneratorRuntime.awrap(this.signDigest(Ethers.utils.keccak256(Ethers.utils.serializeTransaction(transaction))));

            case 5:
              signature = _context4.sent;
              return _context4.abrupt("return", Ethers.utils.serializeTransaction(transaction, signature));

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "sendTransaction",
    value: function sendTransaction(transaction) {
      var _this2 = this;

      return _regeneratorRuntime.async(function sendTransaction$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!(transaction.nonce == null)) {
                _context5.next = 5;
                break;
              }

              transaction = Ethers.utils.shallowCopy(transaction);
              _context5.next = 4;
              return _regeneratorRuntime.awrap(this.provider.getTransactionCount(this.address, "pending"));

            case 4:
              transaction.nonce = _context5.sent;

            case 5:
              return _context5.abrupt("return", Ethers.utils.populateTransaction(transaction, this.provider, this.address).then(function (tx) {
                return _this2.sign(tx).then(function (signedTransaction) {
                  return _this2.provider.sendTransaction(signedTransaction);
                });
              }));

            case 6:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "connect",
    value: function connect() {}
  }]);

  return RemoteSigner;
}(Ethers.Signer);

module.exports = RemoteSigner;