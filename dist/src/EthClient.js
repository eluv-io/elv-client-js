var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _typeof = require("@babel/runtime/helpers/typeof");

var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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

var EthClient =
/*#__PURE__*/
function () {
  "use strict";

  _createClass(EthClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      LogMessage(this, message, error);
    }
  }]);

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
    this.debug = debug; // convert to milliseconds

    this.timeout = Math.floor(timeout * 1000);
    this.cachedContracts = {};
    this.contractNames = {}; // HTTP client for making misc calls to elv-master

    this.HttpClient = new HttpClient({
      uris: this.ethereumURIs,
      debug: this.debug
    });
    Ethers.errors.setLogLevel("error");
  }

  _createClass(EthClient, [{
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
        this.provider = new Ethers.providers.JsonRpcProvider(this.ethereumURIs[this.ethereumURIIndex], this.networkId); // Ethers.js uses eth_getCode to ensure a contract is deployed and nothing else - this pulls a large chunk of pointless
        // data every time a contract is initialized in the client (often). Ethers.js just checks that the code isn't == "0x", so
        // we can give it some dummy string instead and assume the contract is fine

        this.provider.getCode = function _callee() {
          return _regeneratorRuntime.async(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", "0x123");

                case 1:
                case "end":
                  return _context.stop();
              }
            }
          });
        };

        this.provider.pollingInterval = 500;
      }

      return this.provider;
    }
  }, {
    key: "ContractName",
    value: function ContractName(contractAddress) {
      var _this = this;

      var full,
          versionContract,
          version,
          _args3 = arguments;
      return _regeneratorRuntime.async(function ContractName$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              full = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : false;
              versionContract = new Ethers.Contract(contractAddress, AccessibleContract.abi, this.Provider());

              if (!this.contractNames[contractAddress]) {
                this.contractNames[contractAddress] = new Promise(function _callee2(resolve) {
                  var versionBytes32, _version;

                  return _regeneratorRuntime.async(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.prev = 0;
                          _context2.next = 3;
                          return _regeneratorRuntime.awrap(_this.CallContractMethod({
                            contract: versionContract,
                            abi: AccessibleContract.abi,
                            methodName: "version",
                            cacheContract: false
                          }));

                        case 3:
                          versionBytes32 = _context2.sent;
                          _version = Ethers.utils.parseBytes32String( // Ensure bytes32 string is null terminated
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
                    }
                  }, null, null, [[0, 8]]);
                });
              }

              _context3.next = 5;
              return _regeneratorRuntime.awrap(this.contractNames[contractAddress]);

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
        }
      }, null, this);
    }
  }, {
    key: "Contract",
    value: function Contract(_ref2) {
      var contractAddress = _ref2.contractAddress,
          abi = _ref2.abi,
          cacheContract = _ref2.cacheContract,
          overrideCachedContract = _ref2.overrideCachedContract;
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
    value: function MakeProviderCall(_ref3) {
      var methodName, _ref3$args, args, _ref3$attempts, attempts, provider;

      return _regeneratorRuntime.async(function MakeProviderCall$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              methodName = _ref3.methodName, _ref3$args = _ref3.args, args = _ref3$args === void 0 ? [] : _ref3$args, _ref3$attempts = _ref3.attempts, attempts = _ref3$attempts === void 0 ? 0 : _ref3$attempts;
              _context4.prev = 1;
              provider = this.Provider();
              _context4.next = 5;
              return _regeneratorRuntime.awrap(this.provider.getNetwork());

            case 5:
              this.Log("ETH ".concat(provider.connection.url, " ").concat(methodName, " [").concat(args.join(", "), "]"));
              _context4.next = 8;
              return _regeneratorRuntime.awrap(provider[methodName].apply(provider, _toConsumableArray(args)));

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
        }
      }, null, this, [[1, 11]]);
    }
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

        case "address":
          return Utils.FormatAddress(value);

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
    value: function DeployContract(_ref6) {
      var abi, bytecode, _ref6$constructorArgs, constructorArgs, _ref6$overrides, overrides, provider, signer, contractFactory, contract;

      return _regeneratorRuntime.async(function DeployContract$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              abi = _ref6.abi, bytecode = _ref6.bytecode, _ref6$constructorArgs = _ref6.constructorArgs, constructorArgs = _ref6$constructorArgs === void 0 ? [] : _ref6$constructorArgs, _ref6$overrides = _ref6.overrides, overrides = _ref6$overrides === void 0 ? {} : _ref6$overrides;
              this.Log("Deploying contract with args [".concat(constructorArgs.join(", "), "]"));
              provider = this.Provider();
              provider.getNetwork();
              signer = this.client.signer.connect(provider);
              this.ValidateSigner(signer);
              contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);
              _context5.next = 9;
              return _regeneratorRuntime.awrap(contractFactory.deploy.apply(contractFactory, _toConsumableArray(constructorArgs).concat([overrides])));

            case 9:
              contract = _context5.sent;
              _context5.next = 12;
              return _regeneratorRuntime.awrap(contract.deployed());

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
        }
      }, null, this);
    } // Accepts either contract object or contract address

  }, {
    key: "CallContractMethod",
    value: function CallContractMethod(_ref7) {
      var contract, contractAddress, abi, methodName, _ref7$methodArgs, methodArgs, value, _ref7$overrides, overrides, _ref7$formatArguments, formatArguments, _ref7$cacheContract, cacheContract, _ref7$overrideCachedC, overrideCachedContract, methodAbi, result, success, _contract$functions, latestBlock;

      return _regeneratorRuntime.async(function CallContractMethod$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              contract = _ref7.contract, contractAddress = _ref7.contractAddress, abi = _ref7.abi, methodName = _ref7.methodName, _ref7$methodArgs = _ref7.methodArgs, methodArgs = _ref7$methodArgs === void 0 ? [] : _ref7$methodArgs, value = _ref7.value, _ref7$overrides = _ref7.overrides, overrides = _ref7$overrides === void 0 ? {} : _ref7$overrides, _ref7$formatArguments = _ref7.formatArguments, formatArguments = _ref7$formatArguments === void 0 ? true : _ref7$formatArguments, _ref7$cacheContract = _ref7.cacheContract, cacheContract = _ref7$cacheContract === void 0 ? true : _ref7$cacheContract, _ref7$overrideCachedC = _ref7.overrideCachedContract, overrideCachedContract = _ref7$overrideCachedC === void 0 ? false : _ref7$overrideCachedC;

              if (abi) {
                _context6.next = 5;
                break;
              }

              _context6.next = 4;
              return _regeneratorRuntime.awrap(this.client.ContractAbi({
                contractAddress: contractAddress
              }));

            case 4:
              abi = _context6.sent;

            case 5:
              contract = contract || this.Contract({
                contractAddress: contractAddress,
                abi: abi,
                cacheContract: cacheContract,
                overrideCachedContract: overrideCachedContract
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
                _context6.next = 11;
                break;
              }

              throw Error("Unknown method: " + methodName);

            case 11:
              this.Log("Calling contract method:\n        Provider: ".concat(this.Provider().connection.url, "\n        Address: ").concat(contract.address, "\n        Method: ").concat(methodName, "\n        Args: [").concat(methodArgs.join(", "), "]"));
              methodAbi = contract["interface"].abi.find(function (method) {
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
              return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                return setTimeout(resolve, 100);
              }));

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
                _context6.next = 45;
                break;
              }

              _context6.prev = 23;
              _context6.next = 26;
              return _regeneratorRuntime.awrap((_contract$functions = contract.functions)[methodName].apply(_contract$functions, _toConsumableArray(methodArgs).concat([overrides])));

            case 26:
              result = _context6.sent;
              success = true;
              _context6.next = 43;
              break;

            case 30:
              _context6.prev = 30;
              _context6.t0 = _context6["catch"](23);

              if (!(_context6.t0.code === -32000 || _context6.t0.code === "REPLACEMENT_UNDERPRICED")) {
                _context6.next = 40;
                break;
              }

              _context6.next = 35;
              return _regeneratorRuntime.awrap(this.MakeProviderCall({
                methodName: "getBlock",
                args: ["latest"]
              }));

            case 35:
              latestBlock = _context6.sent;
              overrides.gasLimit = latestBlock.gasLimit;
              overrides.gasPrice = overrides.gasPrice ? overrides.gasPrice * 1.50 : 8000000000;
              _context6.next = 43;
              break;

            case 40:
              if ((_context6.t0.message || _context6.t0).includes("invalid response")) {
                _context6.next = 43;
                break;
              }

              this.Log(_typeof(_context6.t0) === "object" ? JSON.stringify(_context6.t0, null, 2) : _context6.t0, true);
              throw _context6.t0;

            case 43:
              _context6.next = 22;
              break;

            case 45:
              return _context6.abrupt("return", result);

            case 46:
              _context6.prev = 46;

              // Unlock if performing a transaction
              if (!methodAbi || !methodAbi.constant) {
                this.locked = false;
              }

              return _context6.finish(46);

            case 49:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this, [[20,, 46, 49], [23, 30]]);
    }
  }, {
    key: "CallContractMethodAndWait",
    value: function CallContractMethodAndWait(_ref8) {
      var contractAddress, abi, methodName, methodArgs, value, timeout, _ref8$formatArguments, formatArguments, _ref8$cacheContract, cacheContract, _ref8$overrideCachedC, overrideCachedContract, contract, createMethodCall, interval, elapsed, methodEvent;

      return _regeneratorRuntime.async(function CallContractMethodAndWait$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              contractAddress = _ref8.contractAddress, abi = _ref8.abi, methodName = _ref8.methodName, methodArgs = _ref8.methodArgs, value = _ref8.value, timeout = _ref8.timeout, _ref8$formatArguments = _ref8.formatArguments, formatArguments = _ref8$formatArguments === void 0 ? true : _ref8$formatArguments, _ref8$cacheContract = _ref8.cacheContract, cacheContract = _ref8$cacheContract === void 0 ? true : _ref8$cacheContract, _ref8$overrideCachedC = _ref8.overrideCachedContract, overrideCachedContract = _ref8$overrideCachedC === void 0 ? false : _ref8$overrideCachedC;
              timeout = timeout || this.timeout || 10000;

              if (abi) {
                _context7.next = 6;
                break;
              }

              _context7.next = 5;
              return _regeneratorRuntime.awrap(this.client.ContractAbi({
                contractAddress: contractAddress
              }));

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
              return _regeneratorRuntime.awrap(this.CallContractMethod({
                contract: contract,
                abi: abi,
                methodName: methodName,
                methodArgs: methodArgs,
                value: value,
                formatArguments: formatArguments,
                cacheContract: cacheContract
              }));

            case 9:
              createMethodCall = _context7.sent;
              this.Log("Awaiting transaction completion: ".concat(createMethodCall.hash)); // Poll for transaction completion

              interval = this.Provider().pollingInterval;
              elapsed = 0;

            case 13:
              if (!(elapsed < timeout)) {
                _context7.next = 25;
                break;
              }

              _context7.next = 16;
              return _regeneratorRuntime.awrap(this.MakeProviderCall({
                methodName: "getTransactionReceipt",
                args: [createMethodCall.hash]
              }));

            case 16:
              methodEvent = _context7.sent;

              if (!methodEvent) {
                _context7.next = 20;
                break;
              }

              methodEvent.logs = methodEvent.logs.map(function (log) {
                return _objectSpread({}, log, {}, contract["interface"].parseLog(log));
              });
              return _context7.abrupt("break", 25);

            case 20:
              elapsed += interval;
              _context7.next = 23;
              return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                return setTimeout(resolve, interval);
              }));

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
        }
      }, null, this);
    }
  }, {
    key: "AwaitEvent",
    value: function AwaitEvent(_ref9) {
      var contractAddress, abi, eventName, contract;
      return _regeneratorRuntime.async(function AwaitEvent$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              contractAddress = _ref9.contractAddress, abi = _ref9.abi, eventName = _ref9.eventName;
              contract = this.Contract({
                contractAddress: contractAddress,
                abi: abi
              });
              _context8.next = 4;
              return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                contract.on(eventName, function (_, __, event) {
                  contract.removeAllListeners(eventName);
                  resolve(event);
                });
              }));

            case 4:
              return _context8.abrupt("return", _context8.sent);

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
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
    value: function DeployDependentContract(_ref11) {
      var contractAddress, methodName, _ref11$args, args, eventName, eventValue, abi, event, eventLog, newContractAddress;

      return _regeneratorRuntime.async(function DeployDependentContract$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              contractAddress = _ref11.contractAddress, methodName = _ref11.methodName, _ref11$args = _ref11.args, args = _ref11$args === void 0 ? [] : _ref11$args, eventName = _ref11.eventName, eventValue = _ref11.eventValue;
              _context9.next = 3;
              return _regeneratorRuntime.awrap(this.client.ContractAbi({
                contractAddress: contractAddress
              }));

            case 3:
              abi = _context9.sent;
              _context9.next = 6;
              return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: contractAddress,
                abi: abi,
                methodName: methodName,
                methodArgs: args
              }));

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
              newContractAddress = eventLog.values[eventValue];
              return _context9.abrupt("return", {
                contractAddress: Utils.FormatAddress(newContractAddress),
                transactionHash: event.transactionHash
              });

            case 12:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
    /* Specific contract management */

  }, {
    key: "DeployAccessGroupContract",
    value: function DeployAccessGroupContract(_ref12) {
      var contentSpaceAddress;
      return _regeneratorRuntime.async(function DeployAccessGroupContract$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              contentSpaceAddress = _ref12.contentSpaceAddress;
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
        }
      }, null, this);
    }
  }, {
    key: "DeployTypeContract",
    value: function DeployTypeContract(_ref13) {
      var contentSpaceAddress;
      return _regeneratorRuntime.async(function DeployTypeContract$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              contentSpaceAddress = _ref13.contentSpaceAddress;
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
        }
      }, null, this);
    }
  }, {
    key: "DeployLibraryContract",
    value: function DeployLibraryContract(_ref14) {
      var contentSpaceAddress, kmsId, kmsAddress;
      return _regeneratorRuntime.async(function DeployLibraryContract$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              contentSpaceAddress = _ref14.contentSpaceAddress, kmsId = _ref14.kmsId;
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
        }
      }, null, this);
    }
  }, {
    key: "DeployContentContract",
    value: function DeployContentContract(_ref15) {
      var contentLibraryAddress, typeAddress;
      return _regeneratorRuntime.async(function DeployContentContract$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              contentLibraryAddress = _ref15.contentLibraryAddress, typeAddress = _ref15.typeAddress;
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
        }
      }, null, this);
    }
  }, {
    key: "CommitContent",
    value: function CommitContent(_ref16) {
      var contentObjectAddress, versionHash;
      return _regeneratorRuntime.async(function CommitContent$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              contentObjectAddress = _ref16.contentObjectAddress, versionHash = _ref16.versionHash;
              _context14.next = 3;
              return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: contentObjectAddress,
                methodName: "commit",
                methodArgs: [versionHash],
                eventName: "CommitPending"
              }));

            case 3:
              return _context14.abrupt("return", _context14.sent);

            case 4:
            case "end":
              return _context14.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "EngageAccountLibrary",
    value: function EngageAccountLibrary(_ref17) {
      var contentSpaceAddress;
      return _regeneratorRuntime.async(function EngageAccountLibrary$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              contentSpaceAddress = _ref17.contentSpaceAddress;
              return _context15.abrupt("return", this.CallContractMethodAndWait({
                contractAddress: contentSpaceAddress,
                methodName: "engageAccountLibrary",
                args: []
              }));

            case 2:
            case "end":
              return _context15.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "SetCustomContentContract",
    value: function SetCustomContentContract(_ref18) {
      var contentContractAddress, customContractAddress, _ref18$overrides, overrides;

      return _regeneratorRuntime.async(function SetCustomContentContract$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              contentContractAddress = _ref18.contentContractAddress, customContractAddress = _ref18.customContractAddress, _ref18$overrides = _ref18.overrides, overrides = _ref18$overrides === void 0 ? {} : _ref18$overrides;
              _context16.next = 3;
              return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: contentContractAddress,
                methodName: "setContentContractAddress",
                methodArgs: [customContractAddress],
                overrides: overrides
              }));

            case 3:
              return _context16.abrupt("return", _context16.sent);

            case 4:
            case "end":
              return _context16.stop();
          }
        }
      }, null, this);
    } // Get all logs for the specified contract in the specified range

  }, {
    key: "ContractEvents",
    value: function ContractEvents(_ref19) {
      var _this4 = this;

      var contractAddress, abi, _ref19$fromBlock, fromBlock, toBlock, topics, _ref19$includeTransac, includeTransaction, filter, contractLogs, blocks;

      return _regeneratorRuntime.async(function ContractEvents$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              contractAddress = _ref19.contractAddress, abi = _ref19.abi, _ref19$fromBlock = _ref19.fromBlock, fromBlock = _ref19$fromBlock === void 0 ? 0 : _ref19$fromBlock, toBlock = _ref19.toBlock, topics = _ref19.topics, _ref19$includeTransac = _ref19.includeTransaction, includeTransaction = _ref19$includeTransac === void 0 ? false : _ref19$includeTransac;
              filter = {
                address: contractAddress,
                fromBlock: fromBlock,
                toBlock: toBlock
              };

              if (topics) {
                filter.topics = topics;
              }

              _context18.next = 5;
              return _regeneratorRuntime.awrap(this.MakeProviderCall({
                methodName: "getLogs",
                args: [filter]
              }));

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
              return _regeneratorRuntime.awrap(Utils.LimitedMap(5, contractLogs, function _callee3(log) {
                var eventInterface, parsedLog;
                return _regeneratorRuntime.async(function _callee3$(_context17) {
                  while (1) {
                    switch (_context17.prev = _context17.next) {
                      case 0:
                        eventInterface = new Ethers.utils.Interface(abi);
                        parsedLog = _objectSpread({}, log, {}, eventInterface.parseLog(log));

                        if (!includeTransaction) {
                          _context17.next = 11;
                          break;
                        }

                        _context17.t0 = _objectSpread;
                        _context17.t1 = {};
                        _context17.t2 = parsedLog;
                        _context17.t3 = {};
                        _context17.next = 9;
                        return _regeneratorRuntime.awrap(_this4.MakeProviderCall({
                          methodName: "getTransaction",
                          args: [log.transactionHash]
                        }));

                      case 9:
                        _context17.t4 = _context17.sent;
                        parsedLog = (0, _context17.t0)(_context17.t1, _context17.t2, _context17.t3, _context17.t4);

                      case 11:
                        blocks[log.blockNumber] = [parsedLog].concat(blocks[log.blockNumber] || []);

                      case 12:
                      case "end":
                        return _context17.stop();
                    }
                  }
                });
              }));

            case 14:
              return _context18.abrupt("return", Object.values(blocks).sort(function (a, b) {
                return a[0].blockNumber < b[0].blockNumber ? 1 : -1;
              }));

            case 15:
            case "end":
              return _context18.stop();
          }
        }
      }, null, this);
    } // Look up the log topic and see if it is known. If so, parse it and inject it into the log

  }, {
    key: "ParseUnknownLog",
    value: function ParseUnknownLog(_ref20) {
      var log = _ref20.log;

      if (log.topics && log.topics.length > 0) {
        var topicHash = log.topics[0];
        var topicInfo = Topics[topicHash];

        if (topicInfo) {
          var eventInterface = new Ethers.utils.Interface(topicInfo.abi);

          if (eventInterface) {
            log = _objectSpread({}, log, {}, eventInterface.parseLog(log), {
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
    value: function Events(_ref21) {
      var _this5 = this;

      var toBlock, fromBlock, _ref21$includeTransac, includeTransaction, logs, i, newLogs, blocks, output;

      return _regeneratorRuntime.async(function Events$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              toBlock = _ref21.toBlock, fromBlock = _ref21.fromBlock, _ref21$includeTransac = _ref21.includeTransaction, includeTransaction = _ref21$includeTransac === void 0 ? false : _ref21$includeTransac;
              // Pull logs in batches of 100
              logs = [];
              i = fromBlock;

            case 3:
              if (!(i < toBlock)) {
                _context21.next = 11;
                break;
              }

              _context21.next = 6;
              return _regeneratorRuntime.awrap(this.MakeProviderCall({
                methodName: "getLogs",
                args: [{
                  fromBlock: i,
                  toBlock: Math.min(toBlock, i + 100)
                }]
              }));

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
              return _regeneratorRuntime.awrap(Utils.LimitedMap(3, _toConsumableArray(Array(toBlock - fromBlock + 1).keys()), function _callee5(i) {
                var blockNumber, blockInfo, transactionInfo;
                return _regeneratorRuntime.async(function _callee5$(_context20) {
                  while (1) {
                    switch (_context20.prev = _context20.next) {
                      case 0:
                        blockNumber = toBlock - i;
                        blockInfo = blocks[blockNumber];

                        if (blockInfo) {
                          _context20.next = 8;
                          break;
                        }

                        _context20.next = 5;
                        return _regeneratorRuntime.awrap(_this5.MakeProviderCall({
                          methodName: "getBlock",
                          args: [blockNumber]
                        }));

                      case 5:
                        blockInfo = _context20.sent;
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
                          _context20.next = 13;
                          break;
                        }

                        transactionInfo = {};
                        _context20.next = 12;
                        return _regeneratorRuntime.awrap(Promise.all(blockInfo.map(function _callee4(block) {
                          return _regeneratorRuntime.async(function _callee4$(_context19) {
                            while (1) {
                              switch (_context19.prev = _context19.next) {
                                case 0:
                                  if (transactionInfo[block.transactionHash]) {
                                    _context19.next = 11;
                                    break;
                                  }

                                  _context19.t0 = _objectSpread;
                                  _context19.t1 = {};
                                  _context19.next = 5;
                                  return _regeneratorRuntime.awrap(_this5.MakeProviderCall({
                                    methodName: "getTransaction",
                                    args: [block.transactionHash]
                                  }));

                                case 5:
                                  _context19.t2 = _context19.sent;
                                  _context19.t3 = {};
                                  _context19.next = 9;
                                  return _regeneratorRuntime.awrap(_this5.MakeProviderCall({
                                    methodName: "getTransactionReceipt",
                                    args: [block.transactionHash]
                                  }));

                                case 9:
                                  _context19.t4 = _context19.sent;
                                  transactionInfo[block.transactionHash] = (0, _context19.t0)(_context19.t1, _context19.t2, _context19.t3, _context19.t4);

                                case 11:
                                  return _context19.abrupt("return", _objectSpread({}, block, {}, transactionInfo[block.transactionHash]));

                                case 12:
                                case "end":
                                  return _context19.stop();
                              }
                            }
                          });
                        })));

                      case 12:
                        blocks[blockNumber] = _context20.sent;

                      case 13:
                        output.push(blocks[blockNumber]);

                      case 14:
                      case "end":
                        return _context20.stop();
                    }
                  }
                });
              }));

            case 16:
              return _context21.abrupt("return", output);

            case 17:
            case "end":
              return _context21.stop();
          }
        }
      }, null, this);
    }
  }]);

  return EthClient;
}();

module.exports = EthClient;