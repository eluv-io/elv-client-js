"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// NOTE: Querying Ethereum requires CORS enabled
// Use --rpccorsdomain "http[s]://hostname:port" or set up proxy
var Ethers = require("ethers");

var LimitedMap = require("./LimitedMap"); // -- Contract javascript files built using build/BuildContracts.js


var FactoryContract = require("./contracts/BaseFactory");

var WalletFactoryContract = require("./contracts/BaseAccessWalletFactory");

var LibraryFactoryContract = require("./contracts/BaseLibraryFactory");

var ContentFactoryContract = require("./contracts/BaseContentFactory");

var ContentSpaceContract = require("./contracts/BaseContentSpace");

var ContentLibraryContract = require("./contracts/BaseLibrary");

var ContentContract = require("./contracts/BaseContent");

var Utils = require("./Utils");

var Topics = require("./events/Topics");

var EthClient =
/*#__PURE__*/
function () {
  _createClass(EthClient, [{
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
      console.error("\n(elv-client-js#EthClient) ".concat(message, "\n")) : // eslint-disable-next-line no-console
      console.log("\n(elv-client-js#EthClient) ".concat(message, "\n")); // eslint-disable-next-line no-console
    }
  }]);

  function EthClient(_ref) {
    var uris = _ref.uris,
        debug = _ref.debug;

    _classCallCheck(this, EthClient);

    this.ethereumURIs = uris;
    this.ethereumURIIndex = 0;
    this.locked = false;
    this.debug = debug;
    this.cachedContracts = {};
    this.contractNames = {};
    Ethers.errors.setLogLevel("error");
  }

  _createClass(EthClient, [{
    key: "Provider",
    value: function Provider() {
      if (!this.provider) {
        this.provider = new Ethers.providers.JsonRpcProvider(this.ethereumURIs[this.ethereumURIIndex]);
      }

      return this.provider;
    }
  }, {
    key: "ContractName",
    value: function () {
      var _ContractName = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(contractAddress) {
        var versionContract, versionBytes32, version;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                versionContract = new Ethers.Contract(contractAddress, ContentSpaceContract.abi, this.Provider());

                if (this.contractNames[contractAddress]) {
                  _context.next = 13;
                  break;
                }

                _context.prev = 2;
                _context.next = 5;
                return this.CallContractMethod({
                  contract: versionContract,
                  abi: ContentSpaceContract.abi,
                  methodName: "version",
                  cacheContract: false
                });

              case 5:
                versionBytes32 = _context.sent;
                version = Ethers.utils.parseBytes32String( // Ensure bytes32 string is null terminated
                versionBytes32.slice(0, -2) + "00");
                this.contractNames[contractAddress] = version.split(/\d+/)[0];
                _context.next = 13;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](2);
                this.contractNames[contractAddress] = "Unknown";

              case 13:
                return _context.abrupt("return", this.contractNames[contractAddress]);

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[2, 10]]);
      }));

      function ContractName(_x) {
        return _ContractName.apply(this, arguments);
      }

      return ContractName;
    }()
  }, {
    key: "Contract",
    value: function Contract(_ref2) {
      var _this = this;

      var contractAddress = _ref2.contractAddress,
          abi = _ref2.abi,
          signer = _ref2.signer,
          cacheContract = _ref2.cacheContract;
      var contract = this.cachedContracts[contractAddress];

      if (!contract) {
        contract = new Ethers.Contract(contractAddress, abi, this.Provider());
        contract = contract.connect(signer); // Redefine deployed to avoid making call to getCode

        contract._deployedPromise = new Promise(function (resolve) {
          return resolve(_this);
        });

        if (cacheContract) {
          this.cachedContracts[contractAddress] = contract;
        }
      }

      return contract;
    }
  }, {
    key: "MakeProviderCall",
    value: function () {
      var _MakeProviderCall = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(_ref3) {
        var methodName, _ref3$args, args, _ref3$attempts, attempts, provider;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                methodName = _ref3.methodName, _ref3$args = _ref3.args, args = _ref3$args === void 0 ? [] : _ref3$args, _ref3$attempts = _ref3.attempts, attempts = _ref3$attempts === void 0 ? 0 : _ref3$attempts;
                _context2.prev = 1;
                provider = this.Provider();
                this.Log("ETH ".concat(provider.connection.url, " ").concat(methodName, " [").concat(args.join(", "), "]"));
                _context2.next = 6;
                return provider[methodName].apply(provider, _toConsumableArray(args));

              case 6:
                return _context2.abrupt("return", _context2.sent);

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](1);
                // eslint-disable-next-line no-console
                console.error(_context2.t0);

                if (!(attempts < this.ethereumURIs.length)) {
                  _context2.next = 17;
                  break;
                }

                this.Log("EthClient failing over: ".concat(attempts + 1, " attempts"), true);
                this.provider = undefined;
                this.ethereumURIIndex = (this.ethereumURIIndex + 1) % this.ethereumURIs.length;
                return _context2.abrupt("return", this.MakeProviderCall({
                  methodName: methodName,
                  args: args,
                  attempts: attempts + 1
                }));

              case 17:
                return _context2.abrupt("return", {});

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 9]]);
      }));

      function MakeProviderCall(_x2) {
        return _MakeProviderCall.apply(this, arguments);
      }

      return MakeProviderCall;
    }()
    /* General contract management */

  }, {
    key: "FormatContractArgument",
    value: function FormatContractArgument(_ref4) {
      var _this2 = this;

      var type = _ref4.type,
          value = _ref4.value;

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

        default:
          return value;
      }
    } // Apply any necessary formatting to contract arguments based on the ABI spec

  }, {
    key: "FormatContractArguments",
    value: function FormatContractArguments(_ref5) {
      var _this3 = this;

      var abi = _ref5.abi,
          methodName = _ref5.methodName,
          args = _ref5.args;
      var method = abi.find(function (func) {
        // Constructor has type=constructor but no name
        return func.name === methodName || func.type === methodName;
      });

      if (method === undefined) {
        throw Error("Unknown method: " + methodName);
      } // Format each argument


      return args.map(function (arg, i) {
        return _this3.FormatContractArgument({
          type: method.inputs[i].type,
          value: arg
        });
      });
    } // Validate signer is set

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
      var _DeployContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(_ref6) {
        var abi, bytecode, _ref6$constructorArgs, constructorArgs, _ref6$overrides, overrides, signer, contractFactory, contract;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                abi = _ref6.abi, bytecode = _ref6.bytecode, _ref6$constructorArgs = _ref6.constructorArgs, constructorArgs = _ref6$constructorArgs === void 0 ? [] : _ref6$constructorArgs, _ref6$overrides = _ref6.overrides, overrides = _ref6$overrides === void 0 ? {} : _ref6$overrides, signer = _ref6.signer;
                this.Log("Deploying contract with args [".concat(constructorArgs.join(", "), "]"));
                signer = signer.connect(this.Provider());
                this.ValidateSigner(signer);
                contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);
                _context3.next = 7;
                return contractFactory.deploy.apply(contractFactory, _toConsumableArray(constructorArgs).concat([overrides]));

              case 7:
                contract = _context3.sent;
                _context3.next = 10;
                return contract.deployed();

              case 10:
                this.Log("Deployed: ".concat(contract.address));
                return _context3.abrupt("return", {
                  contractAddress: Utils.FormatAddress(contract.address),
                  transactionHash: contract.deployTransaction.hash
                });

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function DeployContract(_x3) {
        return _DeployContract.apply(this, arguments);
      }

      return DeployContract;
    }() // Accepts either contract object or contract address

  }, {
    key: "CallContractMethod",
    value: function () {
      var _CallContractMethod = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(_ref7) {
        var contract, contractAddress, abi, methodName, _ref7$methodArgs, methodArgs, value, _ref7$overrides, overrides, _ref7$formatArguments, formatArguments, _ref7$cacheContract, cacheContract, signer, result, success, _contract$functions, latestBlock;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                contract = _ref7.contract, contractAddress = _ref7.contractAddress, abi = _ref7.abi, methodName = _ref7.methodName, _ref7$methodArgs = _ref7.methodArgs, methodArgs = _ref7$methodArgs === void 0 ? [] : _ref7$methodArgs, value = _ref7.value, _ref7$overrides = _ref7.overrides, overrides = _ref7$overrides === void 0 ? {} : _ref7$overrides, _ref7$formatArguments = _ref7.formatArguments, formatArguments = _ref7$formatArguments === void 0 ? true : _ref7$formatArguments, _ref7$cacheContract = _ref7.cacheContract, cacheContract = _ref7$cacheContract === void 0 ? true : _ref7$cacheContract, signer = _ref7.signer;

              case 1:
                if (!this.locked) {
                  _context4.next = 6;
                  break;
                }

                _context4.next = 4;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, 100);
                });

              case 4:
                _context4.next = 1;
                break;

              case 6:
                this.locked = true;
                _context4.prev = 7;
                contract = contract || this.Contract({
                  contractAddress: contractAddress,
                  abi: abi,
                  signer: signer,
                  cacheContract: cacheContract
                });
                abi = contract["interface"].abi; // Automatically format contract arguments

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
                  _context4.next = 14;
                  break;
                }

                throw Error("Unknown method: " + methodName);

              case 14:
                this.Log("Calling contract method:\n        Address: ".concat(contract.address, "\n        Method: ").concat(methodName, "\n        Args: [").concat(methodArgs.join(", "), "]"));
                success = false;

              case 16:
                if (success) {
                  _context4.next = 37;
                  break;
                }

                _context4.prev = 17;
                _context4.next = 20;
                return (_contract$functions = contract.functions)[methodName].apply(_contract$functions, _toConsumableArray(methodArgs).concat([overrides]));

              case 20:
                result = _context4.sent;
                success = true;
                _context4.next = 35;
                break;

              case 24:
                _context4.prev = 24;
                _context4.t0 = _context4["catch"](17);

                if (!(_context4.t0.code === -32000 || _context4.t0.code === "REPLACEMENT_UNDERPRICED")) {
                  _context4.next = 34;
                  break;
                }

                _context4.next = 29;
                return this.MakeProviderCall({
                  methodName: "getBlock",
                  args: ["latest"]
                });

              case 29:
                latestBlock = _context4.sent;
                overrides.gasLimit = latestBlock.gasLimit;
                overrides.gasPrice = overrides.gasPrice ? overrides.gasPrice * 1.50 : 8000000000;
                _context4.next = 35;
                break;

              case 34:
                throw _context4.t0;

              case 35:
                _context4.next = 16;
                break;

              case 37:
                return _context4.abrupt("return", result);

              case 38:
                _context4.prev = 38;
                this.locked = false;
                return _context4.finish(38);

              case 41:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[7,, 38, 41], [17, 24]]);
      }));

      function CallContractMethod(_x4) {
        return _CallContractMethod.apply(this, arguments);
      }

      return CallContractMethod;
    }()
  }, {
    key: "CallContractMethodAndWait",
    value: function () {
      var _CallContractMethodAndWait = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(_ref8) {
        var contractAddress, abi, methodName, methodArgs, value, _ref8$timeout, timeout, _ref8$formatArguments, formatArguments, signer, contract, createMethodCall, interval, elapsed, methodEvent;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                contractAddress = _ref8.contractAddress, abi = _ref8.abi, methodName = _ref8.methodName, methodArgs = _ref8.methodArgs, value = _ref8.value, _ref8$timeout = _ref8.timeout, timeout = _ref8$timeout === void 0 ? 10000 : _ref8$timeout, _ref8$formatArguments = _ref8.formatArguments, formatArguments = _ref8$formatArguments === void 0 ? true : _ref8$formatArguments, signer = _ref8.signer;
                contract = this.Contract({
                  contractAddress: contractAddress,
                  abi: abi,
                  signer: signer
                }); // Make method call

                _context5.next = 4;
                return this.CallContractMethod({
                  contract: contract,
                  abi: abi,
                  methodName: methodName,
                  methodArgs: methodArgs,
                  value: value,
                  formatArguments: formatArguments,
                  signer: signer
                });

              case 4:
                createMethodCall = _context5.sent;
                this.Log("Awaiting transaction completion: ".concat(createMethodCall.hash)); // Poll for transaction completion

                interval = 250;
                elapsed = 0;

              case 8:
                if (!(elapsed < timeout)) {
                  _context5.next = 20;
                  break;
                }

                _context5.next = 11;
                return this.MakeProviderCall({
                  methodName: "getTransactionReceipt",
                  args: [createMethodCall.hash]
                });

              case 11:
                methodEvent = _context5.sent;

                if (!methodEvent) {
                  _context5.next = 15;
                  break;
                }

                methodEvent.logs = methodEvent.logs.map(function (log) {
                  return _objectSpread({}, log, contract["interface"].parseLog(log));
                });
                return _context5.abrupt("break", 20);

              case 15:
                elapsed += interval;
                _context5.next = 18;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, interval);
                });

              case 18:
                _context5.next = 8;
                break;

              case 20:
                if (methodEvent) {
                  _context5.next = 22;
                  break;
                }

                throw Error("Timed out waiting for completion of ".concat(methodName, ". TXID: ").concat(createMethodCall.hash));

              case 22:
                return _context5.abrupt("return", methodEvent);

              case 23:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function CallContractMethodAndWait(_x5) {
        return _CallContractMethodAndWait.apply(this, arguments);
      }

      return CallContractMethodAndWait;
    }()
  }, {
    key: "AwaitEvent",
    value: function () {
      var _AwaitEvent = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(_ref9) {
        var contractAddress, abi, eventName, signer, contract;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                contractAddress = _ref9.contractAddress, abi = _ref9.abi, eventName = _ref9.eventName, signer = _ref9.signer;
                contract = this.Contract({
                  contractAddress: contractAddress,
                  abi: abi,
                  signer: signer
                });
                _context6.next = 4;
                return new Promise(function (resolve) {
                  contract.on(eventName, function (_, __, event) {
                    contract.removeAllListeners(eventName);
                    resolve(event);
                  });
                });

              case 4:
                return _context6.abrupt("return", _context6.sent);

              case 5:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function AwaitEvent(_x6) {
        return _AwaitEvent.apply(this, arguments);
      }

      return AwaitEvent;
    }()
  }, {
    key: "ExtractEventFromLogs",
    value: function ExtractEventFromLogs(_ref10) {
      var abi = _ref10.abi,
          event = _ref10.event,
          eventName = _ref10.eventName;
      var contractInterface = new Ethers.utils.Interface(abi); // Loop through logs to find the desired log

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = event.logs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var log = _step.value;
          var parsedLog = contractInterface.parseLog(log);

          if (parsedLog && parsedLog.name === eventName) {
            return parsedLog;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "DeployDependentContract",
    value: function () {
      var _DeployDependentContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(_ref11) {
        var contractAddress, abi, methodName, _ref11$args, args, eventName, eventValue, signer, event, eventLog, newContractAddress;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                contractAddress = _ref11.contractAddress, abi = _ref11.abi, methodName = _ref11.methodName, _ref11$args = _ref11.args, args = _ref11$args === void 0 ? [] : _ref11$args, eventName = _ref11.eventName, eventValue = _ref11.eventValue, signer = _ref11.signer;
                _context7.next = 3;
                return this.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: methodName,
                  methodArgs: args,
                  signer: signer
                });

              case 3:
                event = _context7.sent;
                eventLog = this.ExtractEventFromLogs({
                  abi: abi,
                  event: event,
                  eventName: eventName,
                  eventValue: eventValue
                });

                if (eventLog) {
                  _context7.next = 7;
                  break;
                }

                throw Error("".concat(methodName, " failed - Log not present in transaction"));

              case 7:
                newContractAddress = eventLog.values[eventValue];
                return _context7.abrupt("return", {
                  contractAddress: Utils.FormatAddress(newContractAddress),
                  transactionHash: event.transactionHash
                });

              case 9:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function DeployDependentContract(_x7) {
        return _DeployDependentContract.apply(this, arguments);
      }

      return DeployDependentContract;
    }()
    /* Specific contract management */

  }, {
    key: "DeployContentSpaceContract",
    value: function () {
      var _DeployContentSpaceContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(_ref12) {
        var name, signer, deploySpaceEvent, factoryContracts, i, _factoryContracts$i, contract, setMethod, factoryAddress;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                name = _ref12.name, signer = _ref12.signer;
                _context8.next = 3;
                return this.DeployContract({
                  abi: ContentSpaceContract.abi,
                  bytecode: ContentSpaceContract.bytecode,
                  constructorArgs: [name],
                  signer: signer
                });

              case 3:
                deploySpaceEvent = _context8.sent;
                factoryContracts = [[FactoryContract, "setFactory"], [WalletFactoryContract, "setWalletFactory"], [LibraryFactoryContract, "setLibraryFactory"], [ContentFactoryContract, "setContentFactory"]];
                i = 0;

              case 6:
                if (!(i < factoryContracts.length)) {
                  _context8.next = 16;
                  break;
                }

                _factoryContracts$i = _slicedToArray(factoryContracts[i], 2), contract = _factoryContracts$i[0], setMethod = _factoryContracts$i[1];
                _context8.next = 10;
                return this.DeployContract({
                  abi: contract.abi,
                  bytecode: contract.bytecode,
                  constructorArgs: [],
                  signer: signer
                });

              case 10:
                factoryAddress = _context8.sent.contractAddress;
                _context8.next = 13;
                return this.CallContractMethodAndWait({
                  contractAddress: deploySpaceEvent.contractAddress,
                  abi: ContentSpaceContract.abi,
                  methodName: setMethod,
                  methodArgs: [factoryAddress],
                  signer: signer
                });

              case 13:
                i++;
                _context8.next = 6;
                break;

              case 16:
                return _context8.abrupt("return", deploySpaceEvent);

              case 17:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function DeployContentSpaceContract(_x8) {
        return _DeployContentSpaceContract.apply(this, arguments);
      }

      return DeployContentSpaceContract;
    }()
  }, {
    key: "DeployAccessGroupContract",
    value: function () {
      var _DeployAccessGroupContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(_ref13) {
        var contentSpaceAddress, signer;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                contentSpaceAddress = _ref13.contentSpaceAddress, signer = _ref13.signer;
                return _context9.abrupt("return", this.DeployDependentContract({
                  contractAddress: contentSpaceAddress,
                  abi: ContentSpaceContract.abi,
                  methodName: "createGroup",
                  args: [],
                  eventName: "CreateGroup",
                  eventValue: "groupAddress",
                  signer: signer
                }));

              case 2:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function DeployAccessGroupContract(_x9) {
        return _DeployAccessGroupContract.apply(this, arguments);
      }

      return DeployAccessGroupContract;
    }()
  }, {
    key: "DeployTypeContract",
    value: function () {
      var _DeployTypeContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(_ref14) {
        var contentSpaceAddress, signer;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                contentSpaceAddress = _ref14.contentSpaceAddress, signer = _ref14.signer;
                return _context10.abrupt("return", this.DeployDependentContract({
                  contractAddress: contentSpaceAddress,
                  abi: ContentSpaceContract.abi,
                  methodName: "createContentType",
                  args: [],
                  eventName: "CreateContentType",
                  eventValue: "contentTypeAddress",
                  signer: signer
                }));

              case 2:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function DeployTypeContract(_x10) {
        return _DeployTypeContract.apply(this, arguments);
      }

      return DeployTypeContract;
    }()
  }, {
    key: "DeployLibraryContract",
    value: function () {
      var _DeployLibraryContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11(_ref15) {
        var contentSpaceAddress, kmsId, signer, kmsAddress;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                contentSpaceAddress = _ref15.contentSpaceAddress, kmsId = _ref15.kmsId, signer = _ref15.signer;
                kmsAddress = Utils.HashToAddress(kmsId);
                return _context11.abrupt("return", this.DeployDependentContract({
                  contractAddress: contentSpaceAddress,
                  abi: ContentSpaceContract.abi,
                  methodName: "createLibrary",
                  args: [kmsAddress],
                  eventName: "CreateLibrary",
                  eventValue: "libraryAddress",
                  signer: signer
                }));

              case 3:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function DeployLibraryContract(_x11) {
        return _DeployLibraryContract.apply(this, arguments);
      }

      return DeployLibraryContract;
    }()
  }, {
    key: "DeployContentContract",
    value: function () {
      var _DeployContentContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(_ref16) {
        var contentLibraryAddress, typeAddress, signer;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                contentLibraryAddress = _ref16.contentLibraryAddress, typeAddress = _ref16.typeAddress, signer = _ref16.signer;
                // If type is not specified, use null address
                typeAddress = typeAddress || Utils.nullAddress;
                return _context12.abrupt("return", this.DeployDependentContract({
                  contractAddress: contentLibraryAddress,
                  abi: ContentLibraryContract.abi,
                  methodName: "createContent",
                  args: [typeAddress],
                  eventName: "ContentObjectCreated",
                  eventValue: "contentAddress",
                  signer: signer
                }));

              case 3:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function DeployContentContract(_x12) {
        return _DeployContentContract.apply(this, arguments);
      }

      return DeployContentContract;
    }()
  }, {
    key: "CommitContent",
    value: function () {
      var _CommitContent = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(_ref17) {
        var contentObjectAddress, versionHash, signer;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                contentObjectAddress = _ref17.contentObjectAddress, versionHash = _ref17.versionHash, signer = _ref17.signer;
                _context13.next = 3;
                return this.CallContractMethodAndWait({
                  contractAddress: contentObjectAddress,
                  abi: ContentContract.abi,
                  methodName: "commit",
                  methodArgs: [versionHash],
                  eventName: "CommitPending",
                  eventValue: "pendingHash",
                  signer: signer
                });

              case 3:
                return _context13.abrupt("return", _context13.sent);

              case 4:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function CommitContent(_x13) {
        return _CommitContent.apply(this, arguments);
      }

      return CommitContent;
    }()
  }, {
    key: "EngageAccountLibrary",
    value: function () {
      var _EngageAccountLibrary = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee14(_ref18) {
        var contentSpaceAddress, signer;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                contentSpaceAddress = _ref18.contentSpaceAddress, signer = _ref18.signer;
                return _context14.abrupt("return", this.CallContractMethodAndWait({
                  contractAddress: contentSpaceAddress,
                  abi: ContentSpaceContract.abi,
                  methodName: "engageAccountLibrary",
                  args: [],
                  signer: signer
                }));

              case 2:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function EngageAccountLibrary(_x14) {
        return _EngageAccountLibrary.apply(this, arguments);
      }

      return EngageAccountLibrary;
    }()
  }, {
    key: "SetCustomContentContract",
    value: function () {
      var _SetCustomContentContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee15(_ref19) {
        var contentContractAddress, customContractAddress, _ref19$overrides, overrides, signer;

        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                contentContractAddress = _ref19.contentContractAddress, customContractAddress = _ref19.customContractAddress, _ref19$overrides = _ref19.overrides, overrides = _ref19$overrides === void 0 ? {} : _ref19$overrides, signer = _ref19.signer;
                _context15.next = 3;
                return this.CallContractMethodAndWait({
                  contractAddress: contentContractAddress,
                  abi: ContentContract.abi,
                  methodName: "setContentContractAddress",
                  methodArgs: [customContractAddress],
                  overrides: overrides,
                  signer: signer
                });

              case 3:
                return _context15.abrupt("return", _context15.sent);

              case 4:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function SetCustomContentContract(_x15) {
        return _SetCustomContentContract.apply(this, arguments);
      }

      return SetCustomContentContract;
    }() // Get all logs for the specified contract in the specified range

  }, {
    key: "ContractEvents",
    value: function () {
      var _ContractEvents = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee17(_ref20) {
        var _this4 = this;

        var contractAddress, abi, _ref20$fromBlock, fromBlock, toBlock, _ref20$includeTransac, includeTransaction, contractLogs, blocks;

        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                contractAddress = _ref20.contractAddress, abi = _ref20.abi, _ref20$fromBlock = _ref20.fromBlock, fromBlock = _ref20$fromBlock === void 0 ? 0 : _ref20$fromBlock, toBlock = _ref20.toBlock, _ref20$includeTransac = _ref20.includeTransaction, includeTransaction = _ref20$includeTransac === void 0 ? false : _ref20$includeTransac;
                _context17.next = 3;
                return this.MakeProviderCall({
                  methodName: "getLogs",
                  args: [{
                    address: contractAddress,
                    fromBlock: fromBlock,
                    toBlock: toBlock
                  }]
                });

              case 3:
                _context17.t0 = _context17.sent;

                if (_context17.t0) {
                  _context17.next = 6;
                  break;
                }

                _context17.t0 = [];

              case 6:
                contractLogs = _context17.t0;

                if (Array.isArray(contractLogs)) {
                  _context17.next = 9;
                  break;
                }

                return _context17.abrupt("return", []);

              case 9:
                blocks = {};
                _context17.next = 12;
                return LimitedMap(5, contractLogs,
                /*#__PURE__*/
                function () {
                  var _ref21 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee16(log) {
                    var eventInterface, parsedLog;
                    return regeneratorRuntime.wrap(function _callee16$(_context16) {
                      while (1) {
                        switch (_context16.prev = _context16.next) {
                          case 0:
                            eventInterface = new Ethers.utils.Interface(abi);
                            parsedLog = _objectSpread({}, log, eventInterface.parseLog(log));

                            if (!includeTransaction) {
                              _context16.next = 10;
                              break;
                            }

                            _context16.t0 = _objectSpread;
                            _context16.t1 = {};
                            _context16.t2 = parsedLog;
                            _context16.next = 8;
                            return _this4.MakeProviderCall({
                              methodName: "getTransaction",
                              args: [log.transactionHash]
                            });

                          case 8:
                            _context16.t3 = _context16.sent;
                            parsedLog = (0, _context16.t0)(_context16.t1, _context16.t2, _context16.t3);

                          case 10:
                            blocks[log.blockNumber] = [parsedLog].concat(blocks[log.blockNumber] || []);

                          case 11:
                          case "end":
                            return _context16.stop();
                        }
                      }
                    }, _callee16);
                  }));

                  return function (_x17) {
                    return _ref21.apply(this, arguments);
                  };
                }());

              case 12:
                return _context17.abrupt("return", Object.values(blocks).sort(function (a, b) {
                  return a[0].blockNumber < b[0].blockNumber ? 1 : -1;
                }));

              case 13:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function ContractEvents(_x16) {
        return _ContractEvents.apply(this, arguments);
      }

      return ContractEvents;
    }() // Look up the log topic and see if it is known. If so, parse it and inject it into the log

  }, {
    key: "ParseUnknownLog",
    value: function ParseUnknownLog(_ref22) {
      var log = _ref22.log;

      if (log.topics && log.topics.length > 0) {
        var topicHash = log.topics[0];
        var topicInfo = Topics[topicHash];

        if (topicInfo) {
          var eventInterface = new Ethers.utils.Interface(topicInfo.abi);

          if (eventInterface) {
            log = _objectSpread({}, log, eventInterface.parseLog(log), {
              contract: topicInfo.contract
            });
          }
        }
      }

      return log;
    } // Get logs for all blocks in the specified range
    // Returns a list, sorted in descending block order, with each entry containing all logs or transactions in that block

  }, {
    key: "Events",
    value: function () {
      var _Events = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee20(_ref23) {
        var _this5 = this;

        var toBlock, fromBlock, _ref23$includeTransac, includeTransaction, logs, i, newLogs, blocks, output;

        return regeneratorRuntime.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                toBlock = _ref23.toBlock, fromBlock = _ref23.fromBlock, _ref23$includeTransac = _ref23.includeTransaction, includeTransaction = _ref23$includeTransac === void 0 ? false : _ref23$includeTransac;
                // Pull logs in batches of 100
                logs = [];
                i = fromBlock;

              case 3:
                if (!(i < toBlock)) {
                  _context20.next = 11;
                  break;
                }

                _context20.next = 6;
                return this.MakeProviderCall({
                  methodName: "getLogs",
                  args: [{
                    fromBlock: i,
                    toBlock: Math.min(toBlock, i + 100)
                  }]
                });

              case 6:
                newLogs = _context20.sent;
                logs = logs.concat(newLogs || []);

              case 8:
                i += 101;
                _context20.next = 3;
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
                _context20.next = 16;
                return LimitedMap(3, _toConsumableArray(Array(toBlock - fromBlock + 1).keys()),
                /*#__PURE__*/
                function () {
                  var _ref24 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee19(i) {
                    var blockNumber, blockInfo, transactionInfo;
                    return regeneratorRuntime.wrap(function _callee19$(_context19) {
                      while (1) {
                        switch (_context19.prev = _context19.next) {
                          case 0:
                            blockNumber = toBlock - i;
                            blockInfo = blocks[blockNumber];

                            if (blockInfo) {
                              _context19.next = 8;
                              break;
                            }

                            _context19.next = 5;
                            return _this5.MakeProviderCall({
                              methodName: "getBlock",
                              args: [blockNumber]
                            });

                          case 5:
                            blockInfo = _context19.sent;
                            blockInfo = blockInfo.transactions.map(function (transactionHash) {
                              return _objectSpread({
                                blockNumber: blockInfo.number,
                                blockHash: blockInfo.hash
                              }, blockInfo, {
                                transactionHash: transactionHash
                              });
                            });
                            blocks[blockNumber] = blockInfo;

                          case 8:
                            if (!includeTransaction) {
                              _context19.next = 13;
                              break;
                            }

                            transactionInfo = {};
                            _context19.next = 12;
                            return Promise.all(blockInfo.map(
                            /*#__PURE__*/
                            function () {
                              var _ref25 = _asyncToGenerator(
                              /*#__PURE__*/
                              regeneratorRuntime.mark(function _callee18(block) {
                                return regeneratorRuntime.wrap(function _callee18$(_context18) {
                                  while (1) {
                                    switch (_context18.prev = _context18.next) {
                                      case 0:
                                        if (transactionInfo[block.transactionHash]) {
                                          _context18.next = 10;
                                          break;
                                        }

                                        _context18.t0 = _objectSpread;
                                        _context18.t1 = {};
                                        _context18.next = 5;
                                        return _this5.MakeProviderCall({
                                          methodName: "getTransaction",
                                          args: [block.transactionHash]
                                        });

                                      case 5:
                                        _context18.t2 = _context18.sent;
                                        _context18.next = 8;
                                        return _this5.MakeProviderCall({
                                          methodName: "getTransactionReceipt",
                                          args: [block.transactionHash]
                                        });

                                      case 8:
                                        _context18.t3 = _context18.sent;
                                        transactionInfo[block.transactionHash] = (0, _context18.t0)(_context18.t1, _context18.t2, _context18.t3);

                                      case 10:
                                        return _context18.abrupt("return", _objectSpread({}, block, transactionInfo[block.transactionHash]));

                                      case 11:
                                      case "end":
                                        return _context18.stop();
                                    }
                                  }
                                }, _callee18);
                              }));

                              return function (_x20) {
                                return _ref25.apply(this, arguments);
                              };
                            }()));

                          case 12:
                            blocks[blockNumber] = _context19.sent;

                          case 13:
                            output.push(blocks[blockNumber]);

                          case 14:
                          case "end":
                            return _context19.stop();
                        }
                      }
                    }, _callee19);
                  }));

                  return function (_x19) {
                    return _ref24.apply(this, arguments);
                  };
                }());

              case 16:
                return _context20.abrupt("return", output);

              case 17:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, this);
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