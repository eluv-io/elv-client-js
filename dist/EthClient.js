"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// NOTE: Querying Ethereum requires CORS enabled
// Use --rpccorsdomain "http[s]://hostname:port" or set up proxy
var Ethers = require("ethers");

var URI = require("urijs"); // -- Contract javascript files built using build/BuildContracts.js


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
  function EthClient(ethereumURIs) {
    _classCallCheck(this, EthClient);

    this.ethereumURIs = ethereumURIs;
    this.ethereumURIIndex = 0;
    this.locked = false;
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
    key: "MakeProviderCall",
    value: function () {
      var _MakeProviderCall = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(_ref) {
        var methodName, _ref$args, args, _ref$attempts, attempts, _this$Provider;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                methodName = _ref.methodName, _ref$args = _ref.args, args = _ref$args === void 0 ? [] : _ref$args, _ref$attempts = _ref.attempts, attempts = _ref$attempts === void 0 ? 0 : _ref$attempts;
                _context.prev = 1;
                _context.next = 4;
                return (_this$Provider = this.Provider())[methodName].apply(_this$Provider, _toConsumableArray(args));

              case 4:
                return _context.abrupt("return", _context.sent);

              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](1);
                // eslint-disable-next-line no-console
                console.error(_context.t0);

                if (!(attempts < this.ethereumURIs.length)) {
                  _context.next = 14;
                  break;
                }

                this.provider = undefined;
                this.ethereumURIIndex = (this.ethereumURIIndex + 1) % this.ethereumURIs.length;
                return _context.abrupt("return", this.MakeProviderCall({
                  methodName: methodName,
                  args: args,
                  attempts: attempts + 1
                }));

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 7]]);
      }));

      function MakeProviderCall(_x) {
        return _MakeProviderCall.apply(this, arguments);
      }

      return MakeProviderCall;
    }()
    /* General contract management */

  }, {
    key: "FormatContractArgument",
    value: function FormatContractArgument(_ref2) {
      var _this = this;

      var type = _ref2.type,
          value = _ref2.value;

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
          return _this.FormatContractArgument({
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
    value: function FormatContractArguments(_ref3) {
      var _this2 = this;

      var abi = _ref3.abi,
          methodName = _ref3.methodName,
          args = _ref3.args;
      var method = abi.find(function (func) {
        // Constructor has type=constructor but no name
        return func.name === methodName || func.type === methodName;
      });

      if (!method) {
        throw Error("Unknown method: " + methodName);
      } // Format each argument


      return args.map(function (arg, i) {
        return _this2.FormatContractArgument({
          type: method.inputs[i].type,
          value: arg
        });
      });
    } // Validate signer is set and provider is correct

  }, {
    key: "ValidateSigner",
    value: function ValidateSigner(signer) {
      if (!signer) {
        throw Error("Signer not set");
      }

      if (!this.ethereumURIs.find(function (ethereumURI) {
        return URI(signer.provider.connection.url).equals(ethereumURI);
      })) {
        throw Error("Signer provider '" + signer.provider.connection.url + "' does not match client provider");
      }
    }
  }, {
    key: "DeployContract",
    value: function () {
      var _DeployContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(_ref4) {
        var abi, bytecode, _ref4$constructorArgs, constructorArgs, _ref4$overrides, overrides, signer, contractFactory, contract;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                abi = _ref4.abi, bytecode = _ref4.bytecode, _ref4$constructorArgs = _ref4.constructorArgs, constructorArgs = _ref4$constructorArgs === void 0 ? [] : _ref4$constructorArgs, _ref4$overrides = _ref4.overrides, overrides = _ref4$overrides === void 0 ? {} : _ref4$overrides, signer = _ref4.signer;
                signer = signer.connect(this.Provider());
                this.ValidateSigner(signer);
                contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);
                _context2.next = 6;
                return contractFactory.deploy.apply(contractFactory, _toConsumableArray(constructorArgs).concat([overrides]));

              case 6:
                contract = _context2.sent;
                _context2.next = 9;
                return contract.deployed();

              case 9:
                return _context2.abrupt("return", {
                  contractAddress: Utils.FormatAddress(contract.address),
                  transactionHash: contract.deployTransaction.hash
                });

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function DeployContract(_x2) {
        return _DeployContract.apply(this, arguments);
      }

      return DeployContract;
    }() // Accepts either contract object or contract address

  }, {
    key: "CallContractMethod",
    value: function () {
      var _CallContractMethod = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(_ref5) {
        var contract, contractAddress, abi, methodName, _ref5$methodArgs, methodArgs, value, _ref5$overrides, overrides, _ref5$formatArguments, formatArguments, signer, result, success, _contract$functions, latestBlock;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                contract = _ref5.contract, contractAddress = _ref5.contractAddress, abi = _ref5.abi, methodName = _ref5.methodName, _ref5$methodArgs = _ref5.methodArgs, methodArgs = _ref5$methodArgs === void 0 ? [] : _ref5$methodArgs, value = _ref5.value, _ref5$overrides = _ref5.overrides, overrides = _ref5$overrides === void 0 ? {} : _ref5$overrides, _ref5$formatArguments = _ref5.formatArguments, formatArguments = _ref5$formatArguments === void 0 ? true : _ref5$formatArguments, signer = _ref5.signer;

              case 1:
                if (!this.locked) {
                  _context3.next = 6;
                  break;
                }

                _context3.next = 4;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, 100);
                });

              case 4:
                _context3.next = 1;
                break;

              case 6:
                this.locked = true;
                _context3.prev = 7;

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

                this.ValidateSigner(signer);

                if (!contract) {
                  contract = new Ethers.Contract(contractAddress, abi, this.Provider());
                  contract = contract.connect(signer);
                }

                if (contract.functions[methodName]) {
                  _context3.next = 14;
                  break;
                }

                throw Error("Unknown method: " + methodName);

              case 14:
                success = false;

              case 15:
                if (success) {
                  _context3.next = 36;
                  break;
                }

                _context3.prev = 16;
                _context3.next = 19;
                return (_contract$functions = contract.functions)[methodName].apply(_contract$functions, _toConsumableArray(methodArgs).concat([overrides]));

              case 19:
                result = _context3.sent;
                success = true;
                _context3.next = 34;
                break;

              case 23:
                _context3.prev = 23;
                _context3.t0 = _context3["catch"](16);

                if (!(_context3.t0.code === -32000 || _context3.t0.code === "REPLACEMENT_UNDERPRICED")) {
                  _context3.next = 33;
                  break;
                }

                _context3.next = 28;
                return this.MakeProviderCall({
                  methodName: "getBlock",
                  args: ["latest"]
                });

              case 28:
                latestBlock = _context3.sent;
                overrides.gasLimit = latestBlock.gasLimit;
                overrides.gasPrice = overrides.gasPrice ? overrides.gasPrice * 1.50 : 8000000000;
                _context3.next = 34;
                break;

              case 33:
                throw _context3.t0;

              case 34:
                _context3.next = 15;
                break;

              case 36:
                return _context3.abrupt("return", result);

              case 37:
                _context3.prev = 37;
                this.locked = false;
                return _context3.finish(37);

              case 40:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[7,, 37, 40], [16, 23]]);
      }));

      function CallContractMethod(_x3) {
        return _CallContractMethod.apply(this, arguments);
      }

      return CallContractMethod;
    }()
  }, {
    key: "CallContractMethodAndWait",
    value: function () {
      var _CallContractMethodAndWait = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(_ref6) {
        var contractAddress, abi, methodName, methodArgs, value, _ref6$timeout, timeout, _ref6$formatArguments, formatArguments, signer, contract, createMethodCall, interval, elapsed, methodEvent;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                contractAddress = _ref6.contractAddress, abi = _ref6.abi, methodName = _ref6.methodName, methodArgs = _ref6.methodArgs, value = _ref6.value, _ref6$timeout = _ref6.timeout, timeout = _ref6$timeout === void 0 ? 10000 : _ref6$timeout, _ref6$formatArguments = _ref6.formatArguments, formatArguments = _ref6$formatArguments === void 0 ? true : _ref6$formatArguments, signer = _ref6.signer;
                contract = new Ethers.Contract(contractAddress, abi, this.Provider());
                contract = contract.connect(signer); // Make method call

                _context4.next = 5;
                return this.CallContractMethod({
                  contract: contract,
                  abi: abi,
                  methodName: methodName,
                  methodArgs: methodArgs,
                  value: value,
                  formatArguments: formatArguments,
                  signer: signer
                });

              case 5:
                createMethodCall = _context4.sent;
                // Poll for transaction completion
                interval = 250;
                elapsed = 0;

              case 8:
                if (!(elapsed < timeout)) {
                  _context4.next = 20;
                  break;
                }

                _context4.next = 11;
                return this.MakeProviderCall({
                  methodName: "getTransactionReceipt",
                  args: [createMethodCall.hash]
                });

              case 11:
                methodEvent = _context4.sent;

                if (!methodEvent) {
                  _context4.next = 15;
                  break;
                }

                methodEvent.logs = methodEvent.logs.map(function (log) {
                  return _objectSpread({}, log, contract["interface"].parseLog(log));
                });
                return _context4.abrupt("break", 20);

              case 15:
                elapsed += interval;
                _context4.next = 18;
                return new Promise(function (resolve) {
                  return setTimeout(resolve, interval);
                });

              case 18:
                _context4.next = 8;
                break;

              case 20:
                if (methodEvent) {
                  _context4.next = 22;
                  break;
                }

                throw Error("Timed out waiting for completion of ".concat(methodName, ". TXID: ").concat(transactionHash));

              case 22:
                return _context4.abrupt("return", methodEvent);

              case 23:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function CallContractMethodAndWait(_x4) {
        return _CallContractMethodAndWait.apply(this, arguments);
      }

      return CallContractMethodAndWait;
    }()
  }, {
    key: "ExtractEventFromLogs",
    value: function ExtractEventFromLogs(_ref7) {
      var abi = _ref7.abi,
          event = _ref7.event,
          eventName = _ref7.eventName;
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

      throw Error(eventName + " event not found");
    }
  }, {
    key: "DeployDependentContract",
    value: function () {
      var _DeployDependentContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(_ref8) {
        var contractAddress, abi, methodName, _ref8$args, args, eventName, eventValue, signer, event, eventLog, newContractAddress;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                contractAddress = _ref8.contractAddress, abi = _ref8.abi, methodName = _ref8.methodName, _ref8$args = _ref8.args, args = _ref8$args === void 0 ? [] : _ref8$args, eventName = _ref8.eventName, eventValue = _ref8.eventValue, signer = _ref8.signer;
                _context5.next = 3;
                return this.CallContractMethodAndWait({
                  contractAddress: contractAddress,
                  abi: abi,
                  methodName: methodName,
                  methodArgs: args,
                  signer: signer
                });

              case 3:
                event = _context5.sent;
                eventLog = this.ExtractEventFromLogs({
                  abi: abi,
                  event: event,
                  eventName: eventName,
                  eventValue: eventValue
                });
                newContractAddress = eventLog.values[eventValue];
                return _context5.abrupt("return", {
                  contractAddress: Utils.FormatAddress(newContractAddress),
                  transactionHash: event.transactionHash
                });

              case 7:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function DeployDependentContract(_x5) {
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
      regeneratorRuntime.mark(function _callee6(_ref9) {
        var name, signer, deploySpaceEvent, factoryContracts, i, _factoryContracts$i, contract, setMethod, factoryAddress;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                name = _ref9.name, signer = _ref9.signer;
                _context6.next = 3;
                return this.DeployContract({
                  abi: ContentSpaceContract.abi,
                  bytecode: ContentSpaceContract.bytecode,
                  constructorArgs: [name],
                  signer: signer
                });

              case 3:
                deploySpaceEvent = _context6.sent;
                factoryContracts = [[FactoryContract, "setFactory"], [WalletFactoryContract, "setWalletFactory"], [LibraryFactoryContract, "setLibraryFactory"], [ContentFactoryContract, "setContentFactory"]];
                i = 0;

              case 6:
                if (!(i < factoryContracts.length)) {
                  _context6.next = 16;
                  break;
                }

                _factoryContracts$i = _slicedToArray(factoryContracts[i], 2), contract = _factoryContracts$i[0], setMethod = _factoryContracts$i[1];
                _context6.next = 10;
                return this.DeployContract({
                  abi: contract.abi,
                  bytecode: contract.bytecode,
                  constructorArgs: [],
                  signer: signer
                });

              case 10:
                factoryAddress = _context6.sent.contractAddress;
                _context6.next = 13;
                return this.CallContractMethodAndWait({
                  contractAddress: deploySpaceEvent.contractAddress,
                  abi: ContentSpaceContract.abi,
                  methodName: setMethod,
                  methodArgs: [factoryAddress],
                  signer: signer
                });

              case 13:
                i++;
                _context6.next = 6;
                break;

              case 16:
                return _context6.abrupt("return", deploySpaceEvent);

              case 17:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function DeployContentSpaceContract(_x6) {
        return _DeployContentSpaceContract.apply(this, arguments);
      }

      return DeployContentSpaceContract;
    }()
  }, {
    key: "DeployAccessGroupContract",
    value: function () {
      var _DeployAccessGroupContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(_ref10) {
        var contentSpaceAddress, signer;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                contentSpaceAddress = _ref10.contentSpaceAddress, signer = _ref10.signer;
                return _context7.abrupt("return", this.DeployDependentContract({
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
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function DeployAccessGroupContract(_x7) {
        return _DeployAccessGroupContract.apply(this, arguments);
      }

      return DeployAccessGroupContract;
    }()
  }, {
    key: "DeployTypeContract",
    value: function () {
      var _DeployTypeContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(_ref11) {
        var contentSpaceAddress, signer;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                contentSpaceAddress = _ref11.contentSpaceAddress, signer = _ref11.signer;
                return _context8.abrupt("return", this.DeployDependentContract({
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
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function DeployTypeContract(_x8) {
        return _DeployTypeContract.apply(this, arguments);
      }

      return DeployTypeContract;
    }()
  }, {
    key: "DeployLibraryContract",
    value: function () {
      var _DeployLibraryContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(_ref12) {
        var contentSpaceAddress, kmsId, signer, kmsAddress;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                contentSpaceAddress = _ref12.contentSpaceAddress, kmsId = _ref12.kmsId, signer = _ref12.signer;
                kmsAddress = Utils.HashToAddress(kmsId);
                return _context9.abrupt("return", this.DeployDependentContract({
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
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function DeployLibraryContract(_x9) {
        return _DeployLibraryContract.apply(this, arguments);
      }

      return DeployLibraryContract;
    }()
  }, {
    key: "DeployContentContract",
    value: function () {
      var _DeployContentContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(_ref13) {
        var contentLibraryAddress, typeAddress, signer;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                contentLibraryAddress = _ref13.contentLibraryAddress, typeAddress = _ref13.typeAddress, signer = _ref13.signer;
                // If type is not specified, use null address
                typeAddress = typeAddress || Utils.nullAddress;
                return _context10.abrupt("return", this.DeployDependentContract({
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
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function DeployContentContract(_x10) {
        return _DeployContentContract.apply(this, arguments);
      }

      return DeployContentContract;
    }()
  }, {
    key: "CommitContent",
    value: function () {
      var _CommitContent = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11(_ref14) {
        var contentObjectAddress, versionHash, signer, event;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                contentObjectAddress = _ref14.contentObjectAddress, versionHash = _ref14.versionHash, signer = _ref14.signer;
                _context11.next = 3;
                return this.CallContractMethodAndWait({
                  contractAddress: contentObjectAddress,
                  abi: ContentContract.abi,
                  methodName: "commit",
                  methodArgs: [versionHash],
                  eventName: "Publish",
                  eventValue: "submitStatus",
                  signer: signer
                });

              case 3:
                event = _context11.sent;
                return _context11.abrupt("return", event);

              case 5:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function CommitContent(_x11) {
        return _CommitContent.apply(this, arguments);
      }

      return CommitContent;
    }()
  }, {
    key: "EngageAccountLibrary",
    value: function () {
      var _EngageAccountLibrary = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(_ref15) {
        var contentSpaceAddress, signer;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                contentSpaceAddress = _ref15.contentSpaceAddress, signer = _ref15.signer;
                return _context12.abrupt("return", this.CallContractMethodAndWait({
                  contractAddress: contentSpaceAddress,
                  abi: ContentSpaceContract.abi,
                  methodName: "engageAccountLibrary",
                  args: [],
                  signer: signer
                }));

              case 2:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function EngageAccountLibrary(_x12) {
        return _EngageAccountLibrary.apply(this, arguments);
      }

      return EngageAccountLibrary;
    }()
  }, {
    key: "SetCustomContentContract",
    value: function () {
      var _SetCustomContentContract = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(_ref16) {
        var contentContractAddress, customContractAddress, _ref16$overrides, overrides, signer;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                contentContractAddress = _ref16.contentContractAddress, customContractAddress = _ref16.customContractAddress, _ref16$overrides = _ref16.overrides, overrides = _ref16$overrides === void 0 ? {} : _ref16$overrides, signer = _ref16.signer;
                _context13.next = 3;
                return this.CallContractMethodAndWait({
                  contractAddress: contentContractAddress,
                  abi: ContentContract.abi,
                  methodName: "setContentContractAddress",
                  methodArgs: [customContractAddress],
                  overrides: overrides,
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

      function SetCustomContentContract(_x13) {
        return _SetCustomContentContract.apply(this, arguments);
      }

      return SetCustomContentContract;
    }() // Get all logs for the specified contract in the specified range

  }, {
    key: "ContractEvents",
    value: function () {
      var _ContractEvents = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee15(_ref17) {
        var _this3 = this;

        var contractAddress, abi, _ref17$fromBlock, fromBlock, toBlock, _ref17$includeTransac, includeTransaction, contractLogs, blocks;

        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                contractAddress = _ref17.contractAddress, abi = _ref17.abi, _ref17$fromBlock = _ref17.fromBlock, fromBlock = _ref17$fromBlock === void 0 ? 0 : _ref17$fromBlock, toBlock = _ref17.toBlock, _ref17$includeTransac = _ref17.includeTransaction, includeTransaction = _ref17$includeTransac === void 0 ? false : _ref17$includeTransac;
                _context15.next = 3;
                return this.MakeProviderCall({
                  methodName: "getLogs",
                  args: [{
                    address: contractAddress,
                    fromBlock: fromBlock,
                    toBlock: toBlock
                  }]
                });

              case 3:
                contractLogs = _context15.sent;
                blocks = {};
                _context15.next = 7;
                return Promise.all(contractLogs.map(
                /*#__PURE__*/
                function () {
                  var _ref18 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee14(log) {
                    var eventInterface, parsedLog;
                    return regeneratorRuntime.wrap(function _callee14$(_context14) {
                      while (1) {
                        switch (_context14.prev = _context14.next) {
                          case 0:
                            eventInterface = new Ethers.utils.Interface(abi);
                            parsedLog = _objectSpread({}, log, eventInterface.parseLog(log));

                            if (!includeTransaction) {
                              _context14.next = 10;
                              break;
                            }

                            _context14.t0 = _objectSpread;
                            _context14.t1 = {};
                            _context14.t2 = parsedLog;
                            _context14.next = 8;
                            return _this3.MakeProviderCall({
                              methodName: "getTransaction",
                              args: [log.transactionHash]
                            });

                          case 8:
                            _context14.t3 = _context14.sent;
                            parsedLog = (0, _context14.t0)(_context14.t1, _context14.t2, _context14.t3);

                          case 10:
                            blocks[log.blockNumber] = [parsedLog].concat(blocks[log.blockNumber] || []);

                          case 11:
                          case "end":
                            return _context14.stop();
                        }
                      }
                    }, _callee14);
                  }));

                  return function (_x15) {
                    return _ref18.apply(this, arguments);
                  };
                }()));

              case 7:
                return _context15.abrupt("return", Object.values(blocks).sort(function (a, b) {
                  return a[0].blockNumber < b[0].blockNumber ? 1 : -1;
                }));

              case 8:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function ContractEvents(_x14) {
        return _ContractEvents.apply(this, arguments);
      }

      return ContractEvents;
    }() // Look up the log topic and see if it is known. If so, parse it and inject it into the log

  }, {
    key: "ParseUnknownLog",
    value: function ParseUnknownLog(_ref19) {
      var log = _ref19.log;

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
      regeneratorRuntime.mark(function _callee17(_ref20) {
        var _this4 = this;

        var toBlock, fromBlock, _ref20$includeTransac, includeTransaction, logs, blocks, output, _loop, blockNumber;

        return regeneratorRuntime.wrap(function _callee17$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                toBlock = _ref20.toBlock, fromBlock = _ref20.fromBlock, _ref20$includeTransac = _ref20.includeTransaction, includeTransaction = _ref20$includeTransac === void 0 ? false : _ref20$includeTransac;
                _context18.next = 3;
                return this.MakeProviderCall({
                  methodName: "getLogs",
                  args: [{
                    fromBlock: fromBlock,
                    toBlock: toBlock
                  }]
                });

              case 3:
                logs = _context18.sent;
                // Group logs by blocknumber
                blocks = {};
                logs.forEach(function (log) {
                  blocks[log.blockNumber] = [_this4.ParseUnknownLog({
                    log: log
                  })].concat(blocks[log.blockNumber] || []);
                }); // Iterate through each block, filling in any missing blocks

                output = [];
                _loop =
                /*#__PURE__*/
                regeneratorRuntime.mark(function _loop(blockNumber) {
                  var blockInfo, transactionInfo;
                  return regeneratorRuntime.wrap(function _loop$(_context17) {
                    while (1) {
                      switch (_context17.prev = _context17.next) {
                        case 0:
                          blockInfo = blocks[blockNumber];

                          if (blockInfo) {
                            _context17.next = 7;
                            break;
                          }

                          _context17.next = 4;
                          return _this4.MakeProviderCall({
                            methodName: "getBlock",
                            args: [blockNumber]
                          });

                        case 4:
                          blockInfo = _context17.sent;
                          blockInfo = blockInfo.transactions.map(function (transactionHash) {
                            return _objectSpread({
                              blockNumber: blockInfo.number,
                              blockHash: blockInfo.hash
                            }, blockInfo, {
                              transactionHash: transactionHash
                            });
                          });
                          blocks[blockNumber] = blockInfo;

                        case 7:
                          if (!includeTransaction) {
                            _context17.next = 12;
                            break;
                          }

                          transactionInfo = {};
                          _context17.next = 11;
                          return Promise.all(blockInfo.map(
                          /*#__PURE__*/
                          function () {
                            var _ref21 = _asyncToGenerator(
                            /*#__PURE__*/
                            regeneratorRuntime.mark(function _callee16(block) {
                              return regeneratorRuntime.wrap(function _callee16$(_context16) {
                                while (1) {
                                  switch (_context16.prev = _context16.next) {
                                    case 0:
                                      if (transactionInfo[block.transactionHash]) {
                                        _context16.next = 10;
                                        break;
                                      }

                                      _context16.t0 = _objectSpread;
                                      _context16.t1 = {};
                                      _context16.next = 5;
                                      return _this4.MakeProviderCall({
                                        methodName: "getTransaction",
                                        args: [block.transactionHash]
                                      });

                                    case 5:
                                      _context16.t2 = _context16.sent;
                                      _context16.next = 8;
                                      return _this4.MakeProviderCall({
                                        methodName: "getTransactionReceipt",
                                        args: [block.transactionHash]
                                      });

                                    case 8:
                                      _context16.t3 = _context16.sent;
                                      transactionInfo[block.transactionHash] = (0, _context16.t0)(_context16.t1, _context16.t2, _context16.t3);

                                    case 10:
                                      return _context16.abrupt("return", _objectSpread({}, block, transactionInfo[block.transactionHash]));

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
                          }()));

                        case 11:
                          blocks[blockNumber] = _context17.sent;

                        case 12:
                          output.push(blocks[blockNumber]);

                        case 13:
                        case "end":
                          return _context17.stop();
                      }
                    }
                  }, _loop);
                });
                blockNumber = toBlock;

              case 9:
                if (!(blockNumber >= fromBlock)) {
                  _context18.next = 14;
                  break;
                }

                return _context18.delegateYield(_loop(blockNumber), "t0", 11);

              case 11:
                blockNumber--;
                _context18.next = 9;
                break;

              case 14:
                return _context18.abrupt("return", output);

              case 15:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee17, this);
      }));

      function Events(_x16) {
        return _Events.apply(this, arguments);
      }

      return Events;
    }()
  }]);

  return EthClient;
}();

module.exports = EthClient;