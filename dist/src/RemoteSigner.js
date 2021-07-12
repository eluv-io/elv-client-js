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
        provider = _ref.provider;

    _classCallCheck(this, RemoteSigner);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RemoteSigner).call(this));
    _this.HttpClient = new HttpClient({
      uris: rpcUris
    });
    _this.idToken = idToken;
    _this.provider = provider;
    return _this;
  }

  _createClass(RemoteSigner, [{
    key: "Initialize",
    value: function Initialize() {
      var accounts;
      return _regeneratorRuntime.async(function Initialize$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regeneratorRuntime.awrap(this.Accounts());

            case 2:
              accounts = _context.sent;

              if (!(!accounts || accounts.length === 0)) {
                _context.next = 9;
                break;
              }

              _context.next = 6;
              return _regeneratorRuntime.awrap(this.CreateAccount());

            case 6:
              _context.next = 8;
              return _regeneratorRuntime.awrap(this.Accounts());

            case 8:
              accounts = _context.sent;

            case 9:
              this.id = accounts[0];
              this.address = Utils.HashToAddress(this.id);
              this.signer = this.provider.getSigner(this.address);

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CreateAccount",
    value: function CreateAccount() {
      return _regeneratorRuntime.async(function CreateAccount$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regeneratorRuntime.awrap(this.HttpClient.Request({
                path: UrlJoin("as", "jwt", "generate", "eth"),
                method: "POST",
                headers: {
                  Authorization: "Bearer ".concat(this.idToken)
                }
              }));

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get fabric IDs sorted by network.
     * @returns {object} - returns object of networks with the ikms (fabric) IDs associated with the oauth key
     */

  }, {
    key: "Accounts",
    value: function Accounts() {
      return _regeneratorRuntime.async(function Accounts$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.HttpClient.Request({
                path: UrlJoin("as", "jwt", "keys"),
                headers: {
                  Authorization: "Bearer ".concat(this.idToken),
                  "Cache-Control": "no-cache"
                }
              })));

            case 2:
              _context3.t0 = _context3.sent.eth;

              if (_context3.t0) {
                _context3.next = 5;
                break;
              }

              _context3.t0 = [];

            case 5:
              return _context3.abrupt("return", _context3.t0.sort());

            case 6:
            case "end":
              return _context3.stop();
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
      return _regeneratorRuntime.async(function signDigest$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.HttpClient.Request({
                method: "POST",
                path: UrlJoin("as", "jwt", "sign", "eth", this.id),
                headers: {
                  Authorization: "Bearer ".concat(this.idToken)
                },
                body: {
                  hash: digest
                }
              })));

            case 2:
              signature = _context4.sent;
              signature.v = parseInt(signature.v, 16);
              signature.recoveryParam = signature.v - 27;
              return _context4.abrupt("return", signature);

            case 6:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "signMessage",
    value: function signMessage(message) {
      return _regeneratorRuntime.async(function signMessage$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.t0 = Promise;
              _context5.t1 = Ethers.utils;
              _context5.t2 = "0x";
              _context5.next = 5;
              return _regeneratorRuntime.awrap(this.signDigest(Ethers.utils.hashMessage(message)));

            case 5:
              _context5.t3 = _context5.sent;
              _context5.t4 = _context5.t2.concat.call(_context5.t2, _context5.t3);
              _context5.t5 = _context5.t1.joinSignature.call(_context5.t1, _context5.t4);
              return _context5.abrupt("return", _context5.t0.resolve.call(_context5.t0, _context5.t5));

            case 9:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "sign",
    value: function sign(transaction) {
      var signature;
      return _regeneratorRuntime.async(function sign$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _regeneratorRuntime.awrap(Ethers.utils.resolveProperties(transaction));

            case 2:
              transaction = _context6.sent;
              _context6.next = 5;
              return _regeneratorRuntime.awrap(this.signDigest(Ethers.utils.keccak256(Ethers.utils.serializeTransaction(transaction))));

            case 5:
              signature = _context6.sent;
              return _context6.abrupt("return", Ethers.utils.serializeTransaction(transaction, signature));

            case 7:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "sendTransaction",
    value: function sendTransaction(transaction) {
      var _this2 = this;

      return _regeneratorRuntime.async(function sendTransaction$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (!(transaction.nonce == null)) {
                _context7.next = 5;
                break;
              }

              transaction = Ethers.utils.shallowCopy(transaction);
              _context7.next = 4;
              return _regeneratorRuntime.awrap(this.provider.getTransactionCount(this.address, "pending"));

            case 4:
              transaction.nonce = _context7.sent;

            case 5:
              return _context7.abrupt("return", Ethers.utils.populateTransaction(transaction, this.provider, this.address).then(function (tx) {
                return _this2.sign(tx).then(function (signedTransaction) {
                  return _this2.provider.sendTransaction(signedTransaction);
                });
              }));

            case 6:
            case "end":
              return _context7.stop();
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