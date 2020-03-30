var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _typeof = require("@babel/runtime/helpers/typeof");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// NOTE: Querying Ethereum requires CORS enabled
// Use --rpccorsdomain "http[s]://hostname:port" or set up proxy
var Ethers = require("ethers"); // -- Contract javascript files built using build/BuildContracts.js


var ContentSpaceContract = require("./contracts/BaseContentSpace");

var ContentLibraryContract = require("./contracts/BaseLibrary");

var ContentContract = require("./contracts/BaseContent");

var Utils = require("./Utils");

var Topics = require("./events/Topics");

var EthClient =
/*#__PURE__*/
function () {
  "use strict";

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
    value: function ContractName(contractAddress) {
      var versionContract, versionBytes32, version;
      return _regeneratorRuntime.async(function ContractName$(_context) {
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
              return _regeneratorRuntime.awrap(this.CallContractMethod({
                contract: versionContract,
                abi: ContentSpaceContract.abi,
                methodName: "version",
                cacheContract: false
              }));

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
      }, null, this, [[2, 10]]);
    }
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
    value: function MakeProviderCall(_ref3) {
      var methodName, _ref3$args, args, _ref3$attempts, attempts, provider;

      return _regeneratorRuntime.async(function MakeProviderCall$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              methodName = _ref3.methodName, _ref3$args = _ref3.args, args = _ref3$args === void 0 ? [] : _ref3$args, _ref3$attempts = _ref3.attempts, attempts = _ref3$attempts === void 0 ? 0 : _ref3$attempts;
              _context2.prev = 1;
              provider = this.Provider();
              this.Log("ETH ".concat(provider.connection.url, " ").concat(methodName, " [").concat(args.join(", "), "]"));
              _context2.next = 6;
              return _regeneratorRuntime.awrap(provider[methodName].apply(provider, _toConsumableArray(args)));

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
      }, null, this, [[1, 9]]);
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
      var abi, bytecode, _ref6$constructorArgs, constructorArgs, _ref6$overrides, overrides, signer, contractFactory, contract;

      return _regeneratorRuntime.async(function DeployContract$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              abi = _ref6.abi, bytecode = _ref6.bytecode, _ref6$constructorArgs = _ref6.constructorArgs, constructorArgs = _ref6$constructorArgs === void 0 ? [] : _ref6$constructorArgs, _ref6$overrides = _ref6.overrides, overrides = _ref6$overrides === void 0 ? {} : _ref6$overrides, signer = _ref6.signer;
              this.Log("Deploying contract with args [".concat(constructorArgs.join(", "), "]"));
              signer = signer.connect(this.Provider());
              this.ValidateSigner(signer);
              contractFactory = new Ethers.ContractFactory(abi, bytecode, signer);
              _context3.next = 7;
              return _regeneratorRuntime.awrap(contractFactory.deploy.apply(contractFactory, _toConsumableArray(constructorArgs).concat([overrides])));

            case 7:
              contract = _context3.sent;
              _context3.next = 10;
              return _regeneratorRuntime.awrap(contract.deployed());

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
      }, null, this);
    } // Accepts either contract object or contract address

  }, {
    key: "CallContractMethod",
    value: function CallContractMethod(_ref7) {
      var contract, contractAddress, abi, methodName, _ref7$methodArgs, methodArgs, value, _ref7$overrides, overrides, _ref7$formatArguments, formatArguments, _ref7$cacheContract, cacheContract, signer, result, success, _contract$functions, latestBlock;

      return _regeneratorRuntime.async(function CallContractMethod$(_context4) {
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
              return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                return setTimeout(resolve, 100);
              }));

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
                _context4.next = 38;
                break;
              }

              _context4.prev = 17;
              _context4.next = 20;
              return _regeneratorRuntime.awrap((_contract$functions = contract.functions)[methodName].apply(_contract$functions, _toConsumableArray(methodArgs).concat([overrides])));

            case 20:
              result = _context4.sent;
              success = true;
              _context4.next = 36;
              break;

            case 24:
              _context4.prev = 24;
              _context4.t0 = _context4["catch"](17);

              if (!(_context4.t0.code === -32000 || _context4.t0.code === "REPLACEMENT_UNDERPRICED")) {
                _context4.next = 34;
                break;
              }

              _context4.next = 29;
              return _regeneratorRuntime.awrap(this.MakeProviderCall({
                methodName: "getBlock",
                args: ["latest"]
              }));

            case 29:
              latestBlock = _context4.sent;
              overrides.gasLimit = latestBlock.gasLimit;
              overrides.gasPrice = overrides.gasPrice ? overrides.gasPrice * 1.50 : 8000000000;
              _context4.next = 36;
              break;

            case 34:
              this.Log(_typeof(_context4.t0) === "object" ? JSON.stringify(_context4.t0, null, 2) : _context4.t0, true);
              throw _context4.t0;

            case 36:
              _context4.next = 16;
              break;

            case 38:
              return _context4.abrupt("return", result);

            case 39:
              _context4.prev = 39;
              this.locked = false;
              return _context4.finish(39);

            case 42:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this, [[7,, 39, 42], [17, 24]]);
    }
  }, {
    key: "CallContractMethodAndWait",
    value: function CallContractMethodAndWait(_ref8) {
      var contractAddress, abi, methodName, methodArgs, value, _ref8$timeout, timeout, _ref8$formatArguments, formatArguments, signer, contract, createMethodCall, interval, elapsed, methodEvent;

      return _regeneratorRuntime.async(function CallContractMethodAndWait$(_context5) {
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
              return _regeneratorRuntime.awrap(this.CallContractMethod({
                contract: contract,
                abi: abi,
                methodName: methodName,
                methodArgs: methodArgs,
                value: value,
                formatArguments: formatArguments,
                signer: signer
              }));

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
              return _regeneratorRuntime.awrap(this.MakeProviderCall({
                methodName: "getTransactionReceipt",
                args: [createMethodCall.hash]
              }));

            case 11:
              methodEvent = _context5.sent;

              if (!methodEvent) {
                _context5.next = 15;
                break;
              }

              methodEvent.logs = methodEvent.logs.map(function (log) {
                return _objectSpread({}, log, {}, contract["interface"].parseLog(log));
              });
              return _context5.abrupt("break", 20);

            case 15:
              elapsed += interval;
              _context5.next = 18;
              return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                return setTimeout(resolve, interval);
              }));

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
      }, null, this);
    }
  }, {
    key: "AwaitEvent",
    value: function AwaitEvent(_ref9) {
      var contractAddress, abi, eventName, signer, contract;
      return _regeneratorRuntime.async(function AwaitEvent$(_context6) {
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
              return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                contract.on(eventName, function (_, __, event) {
                  contract.removeAllListeners(eventName);
                  resolve(event);
                });
              }));

            case 4:
              return _context6.abrupt("return", _context6.sent);

            case 5:
            case "end":
              return _context6.stop();
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
      var contractAddress, abi, methodName, _ref11$args, args, eventName, eventValue, signer, event, eventLog, newContractAddress;

      return _regeneratorRuntime.async(function DeployDependentContract$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              contractAddress = _ref11.contractAddress, abi = _ref11.abi, methodName = _ref11.methodName, _ref11$args = _ref11.args, args = _ref11$args === void 0 ? [] : _ref11$args, eventName = _ref11.eventName, eventValue = _ref11.eventValue, signer = _ref11.signer;
              _context7.next = 3;
              return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: contractAddress,
                abi: abi,
                methodName: methodName,
                methodArgs: args,
                signer: signer
              }));

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
      }, null, this);
    }
    /* Specific contract management */

  }, {
    key: "DeployAccessGroupContract",
    value: function DeployAccessGroupContract(_ref12) {
      var contentSpaceAddress, signer;
      return _regeneratorRuntime.async(function DeployAccessGroupContract$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              contentSpaceAddress = _ref12.contentSpaceAddress, signer = _ref12.signer;
              return _context8.abrupt("return", this.DeployDependentContract({
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
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "DeployTypeContract",
    value: function DeployTypeContract(_ref13) {
      var contentSpaceAddress, signer;
      return _regeneratorRuntime.async(function DeployTypeContract$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              contentSpaceAddress = _ref13.contentSpaceAddress, signer = _ref13.signer;
              return _context9.abrupt("return", this.DeployDependentContract({
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
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "DeployLibraryContract",
    value: function DeployLibraryContract(_ref14) {
      var contentSpaceAddress, kmsId, signer, kmsAddress;
      return _regeneratorRuntime.async(function DeployLibraryContract$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              contentSpaceAddress = _ref14.contentSpaceAddress, kmsId = _ref14.kmsId, signer = _ref14.signer;
              kmsAddress = Utils.HashToAddress(kmsId);
              return _context10.abrupt("return", this.DeployDependentContract({
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
              return _context10.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "DeployContentContract",
    value: function DeployContentContract(_ref15) {
      var contentLibraryAddress, typeAddress, signer;
      return _regeneratorRuntime.async(function DeployContentContract$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              contentLibraryAddress = _ref15.contentLibraryAddress, typeAddress = _ref15.typeAddress, signer = _ref15.signer;
              // If type is not specified, use null address
              typeAddress = typeAddress || Utils.nullAddress;
              return _context11.abrupt("return", this.DeployDependentContract({
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
              return _context11.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "CommitContent",
    value: function CommitContent(_ref16) {
      var contentObjectAddress, versionHash, signer;
      return _regeneratorRuntime.async(function CommitContent$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              contentObjectAddress = _ref16.contentObjectAddress, versionHash = _ref16.versionHash, signer = _ref16.signer;
              _context12.next = 3;
              return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: contentObjectAddress,
                abi: ContentContract.abi,
                methodName: "commit",
                methodArgs: [versionHash],
                eventName: "CommitPending",
                eventValue: "pendingHash",
                signer: signer
              }));

            case 3:
              return _context12.abrupt("return", _context12.sent);

            case 4:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "EngageAccountLibrary",
    value: function EngageAccountLibrary(_ref17) {
      var contentSpaceAddress, signer;
      return _regeneratorRuntime.async(function EngageAccountLibrary$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              contentSpaceAddress = _ref17.contentSpaceAddress, signer = _ref17.signer;
              return _context13.abrupt("return", this.CallContractMethodAndWait({
                contractAddress: contentSpaceAddress,
                abi: ContentSpaceContract.abi,
                methodName: "engageAccountLibrary",
                args: [],
                signer: signer
              }));

            case 2:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "SetCustomContentContract",
    value: function SetCustomContentContract(_ref18) {
      var contentContractAddress, customContractAddress, _ref18$overrides, overrides, signer;

      return _regeneratorRuntime.async(function SetCustomContentContract$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              contentContractAddress = _ref18.contentContractAddress, customContractAddress = _ref18.customContractAddress, _ref18$overrides = _ref18.overrides, overrides = _ref18$overrides === void 0 ? {} : _ref18$overrides, signer = _ref18.signer;
              _context14.next = 3;
              return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
                contractAddress: contentContractAddress,
                abi: ContentContract.abi,
                methodName: "setContentContractAddress",
                methodArgs: [customContractAddress],
                overrides: overrides,
                signer: signer
              }));

            case 3:
              return _context14.abrupt("return", _context14.sent);

            case 4:
            case "end":
              return _context14.stop();
          }
        }
      }, null, this);
    } // Get all logs for the specified contract in the specified range

  }, {
    key: "ContractEvents",
    value: function ContractEvents(_ref19) {
      var _this4 = this;

      var contractAddress, abi, _ref19$fromBlock, fromBlock, toBlock, _ref19$includeTransac, includeTransaction, contractLogs, blocks;

      return _regeneratorRuntime.async(function ContractEvents$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              contractAddress = _ref19.contractAddress, abi = _ref19.abi, _ref19$fromBlock = _ref19.fromBlock, fromBlock = _ref19$fromBlock === void 0 ? 0 : _ref19$fromBlock, toBlock = _ref19.toBlock, _ref19$includeTransac = _ref19.includeTransaction, includeTransaction = _ref19$includeTransac === void 0 ? false : _ref19$includeTransac;
              _context16.next = 3;
              return _regeneratorRuntime.awrap(this.MakeProviderCall({
                methodName: "getLogs",
                args: [{
                  address: contractAddress,
                  fromBlock: fromBlock,
                  toBlock: toBlock
                }]
              }));

            case 3:
              _context16.t0 = _context16.sent;

              if (_context16.t0) {
                _context16.next = 6;
                break;
              }

              _context16.t0 = [];

            case 6:
              contractLogs = _context16.t0;

              if (Array.isArray(contractLogs)) {
                _context16.next = 9;
                break;
              }

              return _context16.abrupt("return", []);

            case 9:
              blocks = {};
              _context16.next = 12;
              return _regeneratorRuntime.awrap(Utils.LimitedMap(5, contractLogs, function _callee(log) {
                var eventInterface, parsedLog;
                return _regeneratorRuntime.async(function _callee$(_context15) {
                  while (1) {
                    switch (_context15.prev = _context15.next) {
                      case 0:
                        eventInterface = new Ethers.utils.Interface(abi);
                        parsedLog = _objectSpread({}, log, {}, eventInterface.parseLog(log));

                        if (!includeTransaction) {
                          _context15.next = 11;
                          break;
                        }

                        _context15.t0 = _objectSpread;
                        _context15.t1 = {};
                        _context15.t2 = parsedLog;
                        _context15.t3 = {};
                        _context15.next = 9;
                        return _regeneratorRuntime.awrap(_this4.MakeProviderCall({
                          methodName: "getTransaction",
                          args: [log.transactionHash]
                        }));

                      case 9:
                        _context15.t4 = _context15.sent;
                        parsedLog = (0, _context15.t0)(_context15.t1, _context15.t2, _context15.t3, _context15.t4);

                      case 11:
                        blocks[log.blockNumber] = [parsedLog].concat(blocks[log.blockNumber] || []);

                      case 12:
                      case "end":
                        return _context15.stop();
                    }
                  }
                });
              }));

            case 12:
              return _context16.abrupt("return", Object.values(blocks).sort(function (a, b) {
                return a[0].blockNumber < b[0].blockNumber ? 1 : -1;
              }));

            case 13:
            case "end":
              return _context16.stop();
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

      return _regeneratorRuntime.async(function Events$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              toBlock = _ref21.toBlock, fromBlock = _ref21.fromBlock, _ref21$includeTransac = _ref21.includeTransaction, includeTransaction = _ref21$includeTransac === void 0 ? false : _ref21$includeTransac;
              // Pull logs in batches of 100
              logs = [];
              i = fromBlock;

            case 3:
              if (!(i < toBlock)) {
                _context19.next = 11;
                break;
              }

              _context19.next = 6;
              return _regeneratorRuntime.awrap(this.MakeProviderCall({
                methodName: "getLogs",
                args: [{
                  fromBlock: i,
                  toBlock: Math.min(toBlock, i + 100)
                }]
              }));

            case 6:
              newLogs = _context19.sent;
              logs = logs.concat(newLogs || []);

            case 8:
              i += 101;
              _context19.next = 3;
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
              _context19.next = 16;
              return _regeneratorRuntime.awrap(Utils.LimitedMap(3, _toConsumableArray(Array(toBlock - fromBlock + 1).keys()), function _callee3(i) {
                var blockNumber, blockInfo, transactionInfo;
                return _regeneratorRuntime.async(function _callee3$(_context18) {
                  while (1) {
                    switch (_context18.prev = _context18.next) {
                      case 0:
                        blockNumber = toBlock - i;
                        blockInfo = blocks[blockNumber];

                        if (blockInfo) {
                          _context18.next = 8;
                          break;
                        }

                        _context18.next = 5;
                        return _regeneratorRuntime.awrap(_this5.MakeProviderCall({
                          methodName: "getBlock",
                          args: [blockNumber]
                        }));

                      case 5:
                        blockInfo = _context18.sent;
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
                          _context18.next = 13;
                          break;
                        }

                        transactionInfo = {};
                        _context18.next = 12;
                        return _regeneratorRuntime.awrap(Promise.all(blockInfo.map(function _callee2(block) {
                          return _regeneratorRuntime.async(function _callee2$(_context17) {
                            while (1) {
                              switch (_context17.prev = _context17.next) {
                                case 0:
                                  if (transactionInfo[block.transactionHash]) {
                                    _context17.next = 11;
                                    break;
                                  }

                                  _context17.t0 = _objectSpread;
                                  _context17.t1 = {};
                                  _context17.next = 5;
                                  return _regeneratorRuntime.awrap(_this5.MakeProviderCall({
                                    methodName: "getTransaction",
                                    args: [block.transactionHash]
                                  }));

                                case 5:
                                  _context17.t2 = _context17.sent;
                                  _context17.t3 = {};
                                  _context17.next = 9;
                                  return _regeneratorRuntime.awrap(_this5.MakeProviderCall({
                                    methodName: "getTransactionReceipt",
                                    args: [block.transactionHash]
                                  }));

                                case 9:
                                  _context17.t4 = _context17.sent;
                                  transactionInfo[block.transactionHash] = (0, _context17.t0)(_context17.t1, _context17.t2, _context17.t3, _context17.t4);

                                case 11:
                                  return _context17.abrupt("return", _objectSpread({}, block, {}, transactionInfo[block.transactionHash]));

                                case 12:
                                case "end":
                                  return _context17.stop();
                              }
                            }
                          });
                        })));

                      case 12:
                        blocks[blockNumber] = _context18.sent;

                      case 13:
                        output.push(blocks[blockNumber]);

                      case 14:
                      case "end":
                        return _context18.stop();
                    }
                  }
                });
              }));

            case 16:
              return _context19.abrupt("return", output);

            case 17:
            case "end":
              return _context19.stop();
          }
        }
      }, null, this);
    }
  }]);

  return EthClient;
}();

module.exports = EthClient;