var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _typeof = require("@babel/runtime/helpers/typeof");
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");
var _createClass = require("@babel/runtime/helpers/createClass");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
// NOTE: Querying Ethereum requires CORS enabled
// Use --rpccorsdomain "http[s]://hostname:port" or set up proxy
var Ethers = require("ethers");
var HttpClient = require("./HttpClient");

/*
// -- Contract javascript files built using build/BuildContracts.js
const ContentSpaceContract = require("./contracts/BaseContentSpace");
const ContentLibraryContract = require("./contracts/BaseLibrary");
const ContentContract = require("./contracts/BaseContent");
 */

var AccessibleContract = require("./contracts/v3/Accessible");
var Utils = require("./Utils");
var _require = require("./LogMessage"),
  LogMessage = _require.LogMessage;
var Topics = require("./events/Topics");
var EthClient = /*#__PURE__*/function () {
  "use strict";

  function EthClient(_ref) {
    var client = _ref.client,
      uris = _ref.uris,
      networkId = _ref.networkId,
      debug = _ref.debug,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 10 : _ref$timeout;
    _classCallCheck(this, EthClient);
    this.client = client;
    this.networkId = networkId;
    this.ethereumURIs = uris;
    this.ethereumURIIndex = 0;
    this.locked = false;
    this.debug = debug;
    // convert to milliseconds
    this.timeout = Math.floor(timeout * 1000);
    this.cachedContracts = {};
    this.contractNames = {};

    // HTTP client for making misc calls to elv-master
    this.HttpClient = new HttpClient({
      uris: this.ethereumURIs,
      debug: this.debug
    });

    //Ethers.errors.setLogLevel("error");
  }
  _createClass(EthClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      LogMessage(this, message, error);
    }
  }, {
    key: "SetEthereumURIs",
    value: function SetEthereumURIs(uris) {
      this.ethereumURIs = uris;
      this.ethereumURIIndex = 0;
      this.HttpClient = new HttpClient({
        uris: this.ethereumURIs,
        debug: this.debug
      });
    }
  }, {
    key: "Provider",
    value: function Provider() {
      if (!this.provider) {
        this.provider = new Ethers.providers.JsonRpcProvider(this.ethereumURIs[this.ethereumURIIndex], this.networkId);

        // Ethers.js uses eth_getCode to ensure a contract is deployed and nothing else - this pulls a large chunk of pointless
        // data every time a contract is initialized in the client (often). Ethers.js just checks that the code isn't == "0x", so
        // we can give it some dummy string instead and assume the contract is fine
        this.provider.getCode = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
          return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", "0x123");
              case 1:
              case "end":
                return _context.stop();
            }
          }, _callee);
        }));
        this.provider.pollingInterval = 500;
      }
      return this.provider;
    }
  }, {
    key: "ContractName",
    value: function () {
      var _ContractName = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(contractAddress) {
        var _this = this;
        var full,
          versionContract,
          version,
          _args3 = arguments;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              full = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : false;
              versionContract = new Ethers.Contract(contractAddress, AccessibleContract.abi, this.Provider());
              if (!this.contractNames[contractAddress]) {
                this.contractNames[contractAddress] = new Promise( /*#__PURE__*/function () {
                  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(resolve) {
                    var versionBytes32, _version;
                    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.prev = 0;
                          _context2.next = 3;
                          return _this.CallContractMethod({
                            contract: versionContract,
                            abi: AccessibleContract.abi,
                            methodName: "version",
                            cacheContract: false
                          });
                        case 3:
                          versionBytes32 = _context2.sent;
                          _version = Ethers.utils.parseBytes32String(
                          // Ensure bytes32 string is null terminated
                          versionBytes32.slice(0, -2) + "00");
                          resolve(_version);
                          _context2.next = 11;
                          break;
                        case 8:
                          _context2.prev = 8;
                          _context2.t0 = _context2["catch"](0);
                          resolve("Unknown");
                        case 11:
                        case "end":
                          return _context2.stop();
                      }
                    }, _callee2, null, [[0, 8]]);
                  }));
                  return function (_x2) {
                    return _ref3.apply(this, arguments);
                  };
                }());
              }
              _context3.next = 5;
              return this.contractNames[contractAddress];
            case 5:
              version = _context3.sent;
              if (!full) {
                _context3.next = 10;
                break;
              }
              return _context3.abrupt("return", version);
            case 10:
              return _context3.abrupt("return", version.split(/\d+/)[0]);
            case 11:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function ContractName(_x) {
        return _ContractName.apply(this, arguments);
      }
      return ContractName;
    }()
  }, {
    key: "Contract",
    value: function Contract(_ref4) {
      var contractAddress = _ref4.contractAddress,
        abi = _ref4.abi,
        cacheContract = _ref4.cacheContract,
        overrideCachedContract = _ref4.overrideCachedContract;
      var contract;
      if (!overrideCachedContract) {
        contract = this.cachedContracts[contractAddress];
      }
      if (!abi) {
        throw Error("No ABI for contract ".concat(contractAddress, " - Wrong network or deleted item?"));
      }
      if (!contract) {
        contract = new Ethers.Contract(contractAddress, abi, this.Provider());
        contract = contract.connect(this.client.signer);
        if (cacheContract) {
          this.cachedContracts[contractAddress] = contract;
        }
      }
      return contract;
    }
  }, {
    key: "MakeProviderCall",
    value: function () {
      var _MakeProviderCall = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(_ref5) {
        var methodName, _ref5$args, args, _ref5$attempts, attempts, provider;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              methodName = _ref5.methodName, _ref5$args = _ref5.args, args = _ref5$args === void 0 ? [] : _ref5$args, _ref5$attempts = _ref5.attempts, attempts = _ref5$attempts === void 0 ? 0 : _ref5$attempts;
              _context4.prev = 1;
              provider = this.Provider();
              _context4.next = 5;
              return this.provider.getNetwork();
            case 5:
              this.Log("ETH ".concat(provider.connection.url, " ").concat(methodName, " [").concat(args.join(", "), "]"));
              _context4.next = 8;
              return provider[methodName].apply(provider, _toConsumableArray(args));
            case 8:
              return _context4.abrupt("return", _context4.sent);
            case 11:
              _context4.prev = 11;
              _context4.t0 = _context4["catch"](1);
              // eslint-disable-next-line no-console
              console.error(_context4.t0);
              if (!(attempts < this.ethereumURIs.length)) {
                _context4.next = 19;
                break;
              }
              this.Log("EthClient failing over: ".concat(attempts + 1, " attempts"), true);
              this.provider = undefined;
              this.ethereumURIIndex = (this.ethereumURIIndex + 1) % this.ethereumURIs.length;
              return _context4.abrupt("return", this.MakeProviderCall({
                methodName: methodName,
                args: args,
                attempts: attempts + 1
              }));
            case 19:
              return _context4.abrupt("return", {});
            case 20:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this, [[1, 11]]);
      }));
      function MakeProviderCall(_x3) {
        return _MakeProviderCall.apply(this, arguments);
      }
      return MakeProviderCall;
    }() /* General contract management */
  }, {
    key: "FormatContractArgument",
    value: function FormatContractArgument(_ref6) {
      var _this2 = this;
      var type = _ref6.type,
        value = _ref6.value;
      // For array types, parse into array if necessary, then format each value.
      if (type.endsWith("[]")) {
        if (typeof value === "string") {
          if (value.trim() === "") {
            return [];
          }
          value = value.split(",").map(function (s) {
            return s.trim();
          });
        }
        var singleType = type.replace("[]", "");
        return value.map(function (element) {
          return _this2.FormatContractArgument({
            type: singleType,
            value: element
          });
        });
      }
      switch (type.toLowerCase()) {
        case "bytes32":
          return Ethers.utils.formatBytes32String(value);
        case "bytes":
          return Ethers.utils.toUtf8Bytes(value);
        case "address":
          return Utils.FormatAddress(value);
        default:
          return value;
      }
    }

    // Apply any necessary formatting to contract arguments based on the ABI spec
  }, {
    key: "FormatContractArguments",
    value: function FormatContractArguments(_ref7) {
      var _this3 = this;
      var abi = _ref7.abi,
        methodName = _ref7.methodName,
        args = _ref7.args;
      var method = abi.find(function (func) {
        // Constructor has type=constructor but no name
        return func.name === methodName || func.type === methodName;
      });
      if (method === undefined) {
        throw Error("Unknown method: " + methodName);
      }

      // Format each argument
      return args.map(function (arg, i) {
        return _this3.FormatContractArgument({
          type: method.inputs[i].type,
          value: arg
        });
      });
    }

    // Validate signer is set
  }, {
    key: "ValidateSigner",
    value: function ValidateSigner(signer) {
      if (!signer) {
        throw Error("Signer not set");
      }
    }
  }, {
    key: "DeployContract",
    value: function () {
      var _DeployContract = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_ref8) {
        var abi, bytecode, _ref8$constructorArgs, constructorArgs, _ref8$overrides, overrides, provider, signer, contractFactory, contract;
        return _regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              abi = _ref8.abi, bytecode = _ref8.bytecode, _ref8$constructorArgs = _ref8.constructorArgs, constructorArgs = _ref8$constructorArgs === void 0 ? [] : _ref8$constructorArgs, _ref8$overrides = _ref8.overrides, overrides = _ref8$overrides === void 0 ? {} : _ref8$overrides;
              this.Log("Deploying contract with args [".concat(constructorArgs.join(", "), "]"));
              provider = this.Provider();
              provider.getNetwork();
              signer = this.client.signer.connect(provider);
              this.ValidateSigner(signer);
              contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);
              _context5.next = 9;
              return contractFactory.deploy.apply(contractFactory, _toConsumableArray(constructorArgs).concat([overrides]));
            case 9:
              contract = _context5.sent;
              _context5.next = 12;
              return contract.deployed();
            case 12:
              this.Log("Deployed: ".concat(contract.address));
              return _context5.abrupt("return", {
                contractAddress: Utils.FormatAddress(contract.address),
                transactionHash: contract.deployTransaction.hash
              });
            case 14:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function DeployContract(_x4) {
        return _DeployContract.apply(this, arguments);
      }
      return DeployContract;
    }() // Accepts either contract object or contract address
  }, {
    key: "CallContractMethod",
    value: function () {
      var _CallContractMethod = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref9) {
        var contract, contractAddress, abi, methodName, _ref9$methodArgs, methodArgs, value, _ref9$overrides, overrides, _ref9$formatArguments, formatArguments, _ref9$cacheContract, cacheContract, _ref9$overrideCachedC, overrideCachedContract, methodAbi, result, success, _contract, latestBlock;
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              contract = _ref9.contract, contractAddress = _ref9.contractAddress, abi = _ref9.abi, methodName = _ref9.methodName, _ref9$methodArgs = _ref9.methodArgs, methodArgs = _ref9$methodArgs === void 0 ? [] : _ref9$methodArgs, value = _ref9.value, _ref9$overrides = _ref9.overrides, overrides = _ref9$overrides === void 0 ? {} : _ref9$overrides, _ref9$formatArguments = _ref9.formatArguments, formatArguments = _ref9$formatArguments === void 0 ? true : _ref9$formatArguments, _ref9$cacheContract = _ref9.cacheContract, cacheContract = _ref9$cacheContract === void 0 ? true : _ref9$cacheContract, _ref9$overrideCachedC = _ref9.overrideCachedContract, overrideCachedContract = _ref9$overrideCachedC === void 0 ? false : _ref9$overrideCachedC;
              if (abi) {
                _context6.next = 5;
                break;
              }
              _context6.next = 4;
              return this.client.ContractAbi({
                contractAddress: contractAddress
              });
            case 4:
              abi = _context6.sent;
            case 5:
              contract = contract || this.Contract({
                contractAddress: contractAddress,
                abi: abi,
                cacheContract: cacheContract,
                overrideCachedContract: overrideCachedContract
              });
              abi = contract["interface"].fragments;

              // Automatically format contract arguments
              if (formatArguments) {
                methodArgs = this.FormatContractArguments({
                  abi: abi,
                  methodName: methodName,
                  args: methodArgs
                });
              }
              if (value) {
                // Convert Ether to Wei
                overrides.value = "0x" + Utils.EtherToWei(value.toString()).toString(16);
              }
              if (!(contract.functions[methodName] === undefined)) {
                _context6.next = 11;
                break;
              }
              throw Error("Unknown method: " + methodName);
            case 11:
              this.Log("Calling contract method:\n        Provider: ".concat(this.Provider().connection.url, "\n        Address: ").concat(contract.address, "\n        Method: ").concat(methodName, "\n        Args: [").concat(methodArgs.join(", "), "]"));
              methodAbi = contract["interface"].fragments.find(function (method) {
                return method.name === methodName;
              }); // Lock if performing a transaction
              if (!(!methodAbi || !methodAbi.constant)) {
                _context6.next = 20;
                break;
              }
            case 14:
              if (!this.locked) {
                _context6.next = 19;
                break;
              }
              _context6.next = 17;
              return new Promise(function (resolve) {
                return setTimeout(resolve, 100);
              });
            case 17:
              _context6.next = 14;
              break;
            case 19:
              this.locked = true;
            case 20:
              _context6.prev = 20;
              success = false;
            case 22:
              if (success) {
                _context6.next = 49;
                break;
              }
              _context6.prev = 23;
              _context6.next = 26;
              return (_contract = contract)[methodName].apply(_contract, _toConsumableArray(methodArgs).concat([overrides]));
            case 26:
              result = _context6.sent;
              success = true;
              _context6.next = 47;
              break;
            case 30:
              _context6.prev = 30;
              _context6.t0 = _context6["catch"](23);
              if (!(_context6.t0.code === -32000 || _context6.t0.code === "REPLACEMENT_UNDERPRICED")) {
                _context6.next = 40;
                break;
              }
              _context6.next = 35;
              return this.MakeProviderCall({
                methodName: "getBlock",
                args: ["latest"]
              });
            case 35:
              latestBlock = _context6.sent;
              overrides.gasLimit = latestBlock.gasLimit;
              overrides.gasPrice = overrides.gasPrice ? overrides.gasPrice * 1.50 : 8000000000;
              _context6.next = 47;
              break;
            case 40:
              if (!(_context6.t0.code === "NONCE_EXPIRED" && _context6.t0.reason === "nonce has already been used")) {
                _context6.next = 44;
                break;
              }
              this.Log("Retrying method call ".concat(methodName));
              _context6.next = 47;
              break;
            case 44:
              if ((_context6.t0.message || _context6.t0).includes("invalid response")) {
                _context6.next = 47;
                break;
              }
              this.Log(_typeof(_context6.t0) === "object" ? JSON.stringify(_context6.t0, null, 2) : _context6.t0, true);
              throw _context6.t0;
            case 47:
              _context6.next = 22;
              break;
            case 49:
              return _context6.abrupt("return", result);
            case 50:
              _context6.prev = 50;
              // Unlock if performing a transaction
              if (!methodAbi || !methodAbi.constant) {
                this.locked = false;
              }
              return _context6.finish(50);
            case 53:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this, [[20,, 50, 53], [23, 30]]);
      }));
      function CallContractMethod(_x5) {
        return _CallContractMethod.apply(this, arguments);
      }
      return CallContractMethod;
    }()
  }, {
    key: "CallContractMethodAndWait",
    value: function () {
      var _CallContractMethodAndWait = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(_ref10) {
        var contractAddress, abi, methodName, methodArgs, value, timeout, _ref10$formatArgument, formatArguments, _ref10$cacheContract, cacheContract, _ref10$overrideCached, overrideCachedContract, contract, createMethodCall, interval, elapsed, methodEvent;
        return _regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              contractAddress = _ref10.contractAddress, abi = _ref10.abi, methodName = _ref10.methodName, methodArgs = _ref10.methodArgs, value = _ref10.value, timeout = _ref10.timeout, _ref10$formatArgument = _ref10.formatArguments, formatArguments = _ref10$formatArgument === void 0 ? true : _ref10$formatArgument, _ref10$cacheContract = _ref10.cacheContract, cacheContract = _ref10$cacheContract === void 0 ? true : _ref10$cacheContract, _ref10$overrideCached = _ref10.overrideCachedContract, overrideCachedContract = _ref10$overrideCached === void 0 ? false : _ref10$overrideCached;
              timeout = timeout || this.timeout || 10000;
              if (abi) {
                _context7.next = 6;
                break;
              }
              _context7.next = 5;
              return this.client.ContractAbi({
                contractAddress: contractAddress
              });
            case 5:
              abi = _context7.sent;
            case 6:
              contract = this.Contract({
                contractAddress: contractAddress,
                abi: abi,
                cacheContract: cacheContract,
                overrideCachedContract: overrideCachedContract
              }); // Make method call
              _context7.next = 9;
              return this.CallContractMethod({
                contract: contract,
                abi: abi,
                methodName: methodName,
                methodArgs: methodArgs,
                value: value,
                formatArguments: formatArguments,
                cacheContract: cacheContract
              });
            case 9:
              createMethodCall = _context7.sent;
              this.Log("Awaiting transaction completion: ".concat(createMethodCall.hash));

              // Poll for transaction completion
              interval = this.Provider().pollingInterval;
              elapsed = 0;
            case 13:
              if (!(elapsed < timeout)) {
                _context7.next = 25;
                break;
              }
              _context7.next = 16;
              return this.MakeProviderCall({
                methodName: "getTransactionReceipt",
                args: [createMethodCall.hash]
              });
            case 16:
              methodEvent = _context7.sent;
              if (!methodEvent) {
                _context7.next = 20;
                break;
              }
              methodEvent.logs = methodEvent.logs.map(function (log) {
                var parsedLogs = {};
                try {
                  parsedLogs = contract["interface"].parseLog(log);
                  // eslint-disable-next-line no-empty
                } catch (error) {}
                return _objectSpread(_objectSpread({}, log), parsedLogs);
              });
              return _context7.abrupt("break", 25);
            case 20:
              elapsed += interval;
              _context7.next = 23;
              return new Promise(function (resolve) {
                return setTimeout(resolve, interval);
              });
            case 23:
              _context7.next = 13;
              break;
            case 25:
              if (methodEvent) {
                _context7.next = 27;
                break;
              }
              throw Error("Timed out waiting for completion of ".concat(methodName, ". TXID: ").concat(createMethodCall.hash));
            case 27:
              return _context7.abrupt("return", methodEvent);
            case 28:
            case "end":
              return _context7.stop();
          }
        }, _callee7, this);
      }));
      function CallContractMethodAndWait(_x6) {
        return _CallContractMethodAndWait.apply(this, arguments);
      }
      return CallContractMethodAndWait;
    }()
  }, {
    key: "AwaitEvent",
    value: function () {
      var _AwaitEvent = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(_ref11) {
        var contractAddress, abi, eventName, contract;
        return _regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              contractAddress = _ref11.contractAddress, abi = _ref11.abi, eventName = _ref11.eventName;
              contract = this.Contract({
                contractAddress: contractAddress,
                abi: abi
              });
              _context8.next = 4;
              return new Promise(function (resolve) {
                contract.on(eventName, function (_, __, event) {
                  contract.removeAllListeners(eventName);
                  resolve(event);
                });
              });
            case 4:
              return _context8.abrupt("return", _context8.sent);
            case 5:
            case "end":
              return _context8.stop();
          }
        }, _callee8, this);
      }));
      function AwaitEvent(_x7) {
        return _AwaitEvent.apply(this, arguments);
      }
      return AwaitEvent;
    }()
  }, {
    key: "ExtractEventFromLogs",
    value: function ExtractEventFromLogs(_ref12) {
      var abi = _ref12.abi,
        event = _ref12.event,
        eventName = _ref12.eventName;
      var contractInterface = new Ethers.utils.Interface(abi);
      // Loop through logs to find the desired log
      var _iterator = _createForOfIteratorHelper(event.logs),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var log = _step.value;
          try {
            var parsedLog = contractInterface.parseLog(log);
            if (parsedLog && parsedLog.name === eventName) {
              return parsedLog;
            }
            // eslint-disable-next-line no-empty
          } catch (error) {}
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "DeployDependentContract",
    value: function () {
      var _DeployDependentContract = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(_ref13) {
        var contractAddress, methodName, _ref13$args, args, eventName, eventValue, abi, event, eventLog, newContractAddress;
        return _regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              contractAddress = _ref13.contractAddress, methodName = _ref13.methodName, _ref13$args = _ref13.args, args = _ref13$args === void 0 ? [] : _ref13$args, eventName = _ref13.eventName, eventValue = _ref13.eventValue;
              _context9.next = 3;
              return this.client.ContractAbi({
                contractAddress: contractAddress
              });
            case 3:
              abi = _context9.sent;
              _context9.next = 6;
              return this.CallContractMethodAndWait({
                contractAddress: contractAddress,
                abi: abi,
                methodName: methodName,
                methodArgs: args
              });
            case 6:
              event = _context9.sent;
              eventLog = this.ExtractEventFromLogs({
                abi: abi,
                event: event,
                eventName: eventName,
                eventValue: eventValue
              });
              if (eventLog) {
                _context9.next = 10;
                break;
              }
              throw Error("".concat(methodName, " failed - Log not present in transaction"));
            case 10:
              newContractAddress = eventLog.args[eventValue];
              return _context9.abrupt("return", {
                contractAddress: Utils.FormatAddress(newContractAddress),
                transactionHash: event.transactionHash
              });
            case 12:
            case "end":
              return _context9.stop();
          }
        }, _callee9, this);
      }));
      function DeployDependentContract(_x8) {
        return _DeployDependentContract.apply(this, arguments);
      }
      return DeployDependentContract;
    }() /* Specific contract management */
  }, {
    key: "DeployAccessGroupContract",
    value: function () {
      var _DeployAccessGroupContract = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(_ref14) {
        var contentSpaceAddress;
        return _regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              contentSpaceAddress = _ref14.contentSpaceAddress;
              return _context10.abrupt("return", this.DeployDependentContract({
                contractAddress: contentSpaceAddress,
                methodName: "createGroup",
                args: [],
                eventName: "CreateGroup",
                eventValue: "groupAddress"
              }));
            case 2:
            case "end":
              return _context10.stop();
          }
        }, _callee10, this);
      }));
      function DeployAccessGroupContract(_x9) {
        return _DeployAccessGroupContract.apply(this, arguments);
      }
      return DeployAccessGroupContract;
    }()
  }, {
    key: "DeployTypeContract",
    value: function () {
      var _DeployTypeContract = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref15) {
        var contentSpaceAddress;
        return _regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              contentSpaceAddress = _ref15.contentSpaceAddress;
              return _context11.abrupt("return", this.DeployDependentContract({
                contractAddress: contentSpaceAddress,
                methodName: "createContentType",
                args: [],
                eventName: "CreateContentType",
                eventValue: "contentTypeAddress"
              }));
            case 2:
            case "end":
              return _context11.stop();
          }
        }, _callee11, this);
      }));
      function DeployTypeContract(_x10) {
        return _DeployTypeContract.apply(this, arguments);
      }
      return DeployTypeContract;
    }()
  }, {
    key: "DeployLibraryContract",
    value: function () {
      var _DeployLibraryContract = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(_ref16) {
        var contentSpaceAddress, kmsId, kmsAddress;
        return _regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              contentSpaceAddress = _ref16.contentSpaceAddress, kmsId = _ref16.kmsId;
              kmsAddress = Utils.HashToAddress(kmsId);
              return _context12.abrupt("return", this.DeployDependentContract({
                contractAddress: contentSpaceAddress,
                methodName: "createLibrary",
                args: [kmsAddress],
                eventName: "CreateLibrary",
                eventValue: "libraryAddress"
              }));
            case 3:
            case "end":
              return _context12.stop();
          }
        }, _callee12, this);
      }));
      function DeployLibraryContract(_x11) {
        return _DeployLibraryContract.apply(this, arguments);
      }
      return DeployLibraryContract;
    }()
  }, {
    key: "DeployContentContract",
    value: function () {
      var _DeployContentContract = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(_ref17) {
        var contentLibraryAddress, typeAddress;
        return _regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) switch (_context13.prev = _context13.next) {
            case 0:
              contentLibraryAddress = _ref17.contentLibraryAddress, typeAddress = _ref17.typeAddress;
              // If type is not specified, use null address
              typeAddress = typeAddress || Utils.nullAddress;
              return _context13.abrupt("return", this.DeployDependentContract({
                contractAddress: contentLibraryAddress,
                methodName: "createContent",
                args: [typeAddress],
                eventName: "ContentObjectCreated",
                eventValue: "contentAddress"
              }));
            case 3:
            case "end":
              return _context13.stop();
          }
        }, _callee13, this);
      }));
      function DeployContentContract(_x12) {
        return _DeployContentContract.apply(this, arguments);
      }
      return DeployContentContract;
    }()
  }, {
    key: "CommitContent",
    value: function () {
      var _CommitContent = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref18) {
        var contentObjectAddress, versionHash;
        return _regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              contentObjectAddress = _ref18.contentObjectAddress, versionHash = _ref18.versionHash;
              _context14.next = 3;
              return this.CallContractMethodAndWait({
                contractAddress: contentObjectAddress,
                methodName: "commit",
                methodArgs: [versionHash],
                eventName: "CommitPending"
              });
            case 3:
              return _context14.abrupt("return", _context14.sent);
            case 4:
            case "end":
              return _context14.stop();
          }
        }, _callee14, this);
      }));
      function CommitContent(_x13) {
        return _CommitContent.apply(this, arguments);
      }
      return CommitContent;
    }()
  }, {
    key: "EngageAccountLibrary",
    value: function () {
      var _EngageAccountLibrary = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(_ref19) {
        var contentSpaceAddress;
        return _regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) switch (_context15.prev = _context15.next) {
            case 0:
              contentSpaceAddress = _ref19.contentSpaceAddress;
              return _context15.abrupt("return", this.CallContractMethodAndWait({
                contractAddress: contentSpaceAddress,
                methodName: "engageAccountLibrary",
                args: []
              }));
            case 2:
            case "end":
              return _context15.stop();
          }
        }, _callee15, this);
      }));
      function EngageAccountLibrary(_x14) {
        return _EngageAccountLibrary.apply(this, arguments);
      }
      return EngageAccountLibrary;
    }()
  }, {
    key: "SetCustomContentContract",
    value: function () {
      var _SetCustomContentContract = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16(_ref20) {
        var contentContractAddress, customContractAddress, _ref20$overrides, overrides;
        return _regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) switch (_context16.prev = _context16.next) {
            case 0:
              contentContractAddress = _ref20.contentContractAddress, customContractAddress = _ref20.customContractAddress, _ref20$overrides = _ref20.overrides, overrides = _ref20$overrides === void 0 ? {} : _ref20$overrides;
              _context16.next = 3;
              return this.CallContractMethodAndWait({
                contractAddress: contentContractAddress,
                methodName: "setContentContractAddress",
                methodArgs: [customContractAddress],
                overrides: overrides
              });
            case 3:
              return _context16.abrupt("return", _context16.sent);
            case 4:
            case "end":
              return _context16.stop();
          }
        }, _callee16, this);
      }));
      function SetCustomContentContract(_x15) {
        return _SetCustomContentContract.apply(this, arguments);
      }
      return SetCustomContentContract;
    }() // Get all logs for the specified contract in the specified range
  }, {
    key: "ContractEvents",
    value: function () {
      var _ContractEvents = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18(_ref21) {
        var _this4 = this;
        var contractAddress, abi, _ref21$fromBlock, fromBlock, toBlock, topics, _ref21$includeTransac, includeTransaction, filter, contractLogs, blocks;
        return _regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) switch (_context18.prev = _context18.next) {
            case 0:
              contractAddress = _ref21.contractAddress, abi = _ref21.abi, _ref21$fromBlock = _ref21.fromBlock, fromBlock = _ref21$fromBlock === void 0 ? 0 : _ref21$fromBlock, toBlock = _ref21.toBlock, topics = _ref21.topics, _ref21$includeTransac = _ref21.includeTransaction, includeTransaction = _ref21$includeTransac === void 0 ? false : _ref21$includeTransac;
              filter = {
                address: contractAddress,
                fromBlock: fromBlock,
                toBlock: toBlock
              };
              if (topics) {
                filter.topics = topics;
              }
              _context18.next = 5;
              return this.MakeProviderCall({
                methodName: "getLogs",
                args: [filter]
              });
            case 5:
              _context18.t0 = _context18.sent;
              if (_context18.t0) {
                _context18.next = 8;
                break;
              }
              _context18.t0 = [];
            case 8:
              contractLogs = _context18.t0;
              if (Array.isArray(contractLogs)) {
                _context18.next = 11;
                break;
              }
              return _context18.abrupt("return", []);
            case 11:
              blocks = {};
              _context18.next = 14;
              return Utils.LimitedMap(5, contractLogs, /*#__PURE__*/function () {
                var _ref22 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(log) {
                  var eventInterface, parsedLog;
                  return _regeneratorRuntime.wrap(function _callee17$(_context17) {
                    while (1) switch (_context17.prev = _context17.next) {
                      case 0:
                        eventInterface = new Ethers.utils.Interface(abi);
                        parsedLog = _objectSpread(_objectSpread({}, log), eventInterface.parseLog(log));
                        if (!includeTransaction) {
                          _context17.next = 9;
                          break;
                        }
                        _context17.t0 = _objectSpread;
                        _context17.t1 = _objectSpread({}, parsedLog);
                        _context17.next = 7;
                        return _this4.MakeProviderCall({
                          methodName: "getTransaction",
                          args: [log.transactionHash]
                        });
                      case 7:
                        _context17.t2 = _context17.sent;
                        parsedLog = (0, _context17.t0)(_context17.t1, _context17.t2);
                      case 9:
                        blocks[log.blockNumber] = [parsedLog].concat(blocks[log.blockNumber] || []);
                      case 10:
                      case "end":
                        return _context17.stop();
                    }
                  }, _callee17);
                }));
                return function (_x17) {
                  return _ref22.apply(this, arguments);
                };
              }());
            case 14:
              return _context18.abrupt("return", Object.values(blocks).sort(function (a, b) {
                return a[0].blockNumber < b[0].blockNumber ? 1 : -1;
              }));
            case 15:
            case "end":
              return _context18.stop();
          }
        }, _callee18, this);
      }));
      function ContractEvents(_x16) {
        return _ContractEvents.apply(this, arguments);
      }
      return ContractEvents;
    }() // Look up the log topic and see if it is known. If so, parse it and inject it into the log
  }, {
    key: "ParseUnknownLog",
    value: function ParseUnknownLog(_ref23) {
      var log = _ref23.log;
      if (log.topics && log.topics.length > 0) {
        var topicHash = log.topics[0];
        var topicInfo = Topics[topicHash];
        if (topicInfo) {
          var eventInterface = new Ethers.utils.Interface(topicInfo.abi);
          if (eventInterface) {
            log = _objectSpread(_objectSpread(_objectSpread({}, log), eventInterface.parseLog(log)), {}, {
              contract: topicInfo.contract
            });
          }
        }
      }
      return log;
    }

    // Get logs for all blocks in the specified range
    // Returns a list, sorted in descending block order, with each entry containing all logs or transactions in that block
  }, {
    key: "Events",
    value: function () {
      var _Events = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee21(_ref24) {
        var _this5 = this;
        var toBlock, fromBlock, _ref24$includeTransac, includeTransaction, logs, i, newLogs, blocks, output;
        return _regeneratorRuntime.wrap(function _callee21$(_context21) {
          while (1) switch (_context21.prev = _context21.next) {
            case 0:
              toBlock = _ref24.toBlock, fromBlock = _ref24.fromBlock, _ref24$includeTransac = _ref24.includeTransaction, includeTransaction = _ref24$includeTransac === void 0 ? false : _ref24$includeTransac;
              // Pull logs in batches of 100
              logs = [];
              i = fromBlock;
            case 3:
              if (!(i < toBlock)) {
                _context21.next = 11;
                break;
              }
              _context21.next = 6;
              return this.MakeProviderCall({
                methodName: "getLogs",
                args: [{
                  fromBlock: i,
                  toBlock: Math.min(toBlock, i + 100)
                }]
              });
            case 6:
              newLogs = _context21.sent;
              logs = logs.concat(newLogs || []);
            case 8:
              i += 101;
              _context21.next = 3;
              break;
            case 11:
              // Group logs by blocknumber
              blocks = {};
              logs.forEach(function (log) {
                blocks[log.blockNumber] = [_this5.ParseUnknownLog({
                  log: log
                })].concat(blocks[log.blockNumber] || []);
              });
              output = [];
              _context21.next = 16;
              return Utils.LimitedMap(3, _toConsumableArray(Array(toBlock - fromBlock + 1).keys()), /*#__PURE__*/function () {
                var _ref25 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee20(i) {
                  var blockNumber, blockInfo, transactionInfo;
                  return _regeneratorRuntime.wrap(function _callee20$(_context20) {
                    while (1) switch (_context20.prev = _context20.next) {
                      case 0:
                        blockNumber = toBlock - i;
                        blockInfo = blocks[blockNumber];
                        if (blockInfo) {
                          _context20.next = 8;
                          break;
                        }
                        _context20.next = 5;
                        return _this5.MakeProviderCall({
                          methodName: "getBlock",
                          args: [blockNumber]
                        });
                      case 5:
                        blockInfo = _context20.sent;
                        blockInfo = blockInfo.transactions.map(function (transactionHash) {
                          return _objectSpread(_objectSpread({
                            blockNumber: blockInfo.number,
                            blockHash: blockInfo.hash
                          }, blockInfo), {}, {
                            transactionHash: transactionHash
                          });
                        });
                        blocks[blockNumber] = blockInfo;
                      case 8:
                        if (!includeTransaction) {
                          _context20.next = 13;
                          break;
                        }
                        transactionInfo = {};
                        _context20.next = 12;
                        return Promise.all(blockInfo.map( /*#__PURE__*/function () {
                          var _ref26 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee19(block) {
                            return _regeneratorRuntime.wrap(function _callee19$(_context19) {
                              while (1) switch (_context19.prev = _context19.next) {
                                case 0:
                                  if (transactionInfo[block.transactionHash]) {
                                    _context19.next = 12;
                                    break;
                                  }
                                  _context19.t0 = _objectSpread;
                                  _context19.t1 = _objectSpread;
                                  _context19.t2 = {};
                                  _context19.next = 6;
                                  return _this5.MakeProviderCall({
                                    methodName: "getTransaction",
                                    args: [block.transactionHash]
                                  });
                                case 6:
                                  _context19.t3 = _context19.sent;
                                  _context19.t4 = (0, _context19.t1)(_context19.t2, _context19.t3);
                                  _context19.next = 10;
                                  return _this5.MakeProviderCall({
                                    methodName: "getTransactionReceipt",
                                    args: [block.transactionHash]
                                  });
                                case 10:
                                  _context19.t5 = _context19.sent;
                                  transactionInfo[block.transactionHash] = (0, _context19.t0)(_context19.t4, _context19.t5);
                                case 12:
                                  return _context19.abrupt("return", _objectSpread(_objectSpread({}, block), transactionInfo[block.transactionHash]));
                                case 13:
                                case "end":
                                  return _context19.stop();
                              }
                            }, _callee19);
                          }));
                          return function (_x20) {
                            return _ref26.apply(this, arguments);
                          };
                        }()));
                      case 12:
                        blocks[blockNumber] = _context20.sent;
                      case 13:
                        output.push(blocks[blockNumber]);
                      case 14:
                      case "end":
                        return _context20.stop();
                    }
                  }, _callee20);
                }));
                return function (_x19) {
                  return _ref25.apply(this, arguments);
                };
              }());
            case 16:
              return _context21.abrupt("return", output);
            case 17:
            case "end":
              return _context21.stop();
          }
        }, _callee21, this);
      }));
      function Events(_x18) {
        return _Events.apply(this, arguments);
      }
      return Events;
    }()
  }]);
  return EthClient;
}();
module.exports = EthClient;