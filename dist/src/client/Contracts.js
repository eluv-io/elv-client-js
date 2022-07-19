var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _typeof = require("@babel/runtime/helpers/typeof");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Methods for deploying and interacting with contracts
 *
 * @module ElvClient/Contracts
 */
var Ethers = require("ethers"); //const ContentContract = require("../contracts/BaseContent");


var _require = require("../Validation"),
    ValidateAddress = _require.ValidateAddress,
    ValidateParameters = _require.ValidateParameters,
    ValidatePresence = _require.ValidatePresence;
/**
 * Return the name of the contract, as specified in the contracts "version" string
 *
 * @methodGroup Contracts
 *
 * @namedParams
 * @param {string} contractAddress - Address of the contract
 *
 * @return {Promise<string>} - Name of the contract
 */


exports.ContractName = function _callee(_ref) {
  var contractAddress;
  return _regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          contractAddress = _ref.contractAddress;
          contractAddress = ValidateAddress(contractAddress);
          _context.next = 4;
          return _regeneratorRuntime.awrap(this.ethClient.ContractName(contractAddress));

        case 4:
          return _context.abrupt("return", _context.sent);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve the ABI for the given contract via its address or a Fabric ID. Contract must be a standard Eluvio contract
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string=} contractAddress - The address of the contract
 * @param {string=} id - The Fabric ID of the contract
 *
 * @return {Promise<Object>} - The ABI for the given contract
 *
 * @throws If ABI is not able to be determined, throws an error
 */


exports.ContractAbi = function _callee2(_ref2) {
  var contractAddress, id, contractInfo;
  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          contractAddress = _ref2.contractAddress, id = _ref2.id;
          _context2.next = 3;
          return _regeneratorRuntime.awrap(this.authClient.ContractInfo({
            address: contractAddress,
            id: id
          }));

        case 3:
          contractInfo = _context2.sent;

          if (contractInfo) {
            _context2.next = 6;
            break;
          }

          throw Error("Unable to determine contract info for ".concat(contractAddress));

        case 6:
          return _context2.abrupt("return", contractInfo.abi);

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};
/**
 * Format the arguments to be used for the specified method of the contract
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {Object} abi - ABI of contract
 * @param {string} methodName - Name of method for which arguments will be formatted
 * @param {Array<string>} args - List of arguments
 *
 * @returns {Array<string>} - List of formatted arguments
 */


exports.FormatContractArguments = function (_ref3) {
  var abi = _ref3.abi,
      methodName = _ref3.methodName,
      args = _ref3.args;
  return this.ethClient.FormatContractArguments({
    abi: abi,
    methodName: methodName,
    args: args
  });
};
/**
 * Deploy a contract from ABI and bytecode. This client's signer will be the owner of the contract.
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {Object} abi - ABI of contract
 * @param {string} bytecode - Bytecode of the contract
 * @param {Array<string>} constructorArgs - List of arguments to the contract constructor
 * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
 *
 * @returns {Promise<Object>} - Response containing the deployed contract address and the transaction hash of the deployment
 */


exports.DeployContract = function _callee3(_ref4) {
  var abi, bytecode, constructorArgs, _ref4$overrides, overrides;

  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          abi = _ref4.abi, bytecode = _ref4.bytecode, constructorArgs = _ref4.constructorArgs, _ref4$overrides = _ref4.overrides, overrides = _ref4$overrides === void 0 ? {} : _ref4$overrides;
          _context3.next = 3;
          return _regeneratorRuntime.awrap(this.ethClient.DeployContract({
            abi: abi,
            bytecode: bytecode,
            constructorArgs: constructorArgs,
            overrides: overrides,
            signer: this.signer
          }));

        case 3:
          return _context3.abrupt("return", _context3.sent);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
};
/**
 * Get all events on the specified contract
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string} contractAddress - The address of the contract
 * @param {Object=} abi - ABI of contract - If the contract is a standard Eluvio contract, this can be determined automatically if not specified
 * @param {number=} fromBlock - Limit results to events after the specified block (inclusive)
 * @param {number=} toBlock - Limit results to events before the specified block (inclusive)
 * @param {number=} count=1000 - Maximum range of blocks to search (unless both toBlock and fromBlock are specified)
 * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
 * Note: This requires one extra network call per block, so it should not be used for very large ranges
 * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
 */


exports.ContractEvents = function _callee4(_ref5) {
  var contractAddress, abi, _ref5$fromBlock, fromBlock, toBlock, _ref5$count, count, topics, _ref5$includeTransact, includeTransaction, blocks;

  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          contractAddress = _ref5.contractAddress, abi = _ref5.abi, _ref5$fromBlock = _ref5.fromBlock, fromBlock = _ref5$fromBlock === void 0 ? 0 : _ref5$fromBlock, toBlock = _ref5.toBlock, _ref5$count = _ref5.count, count = _ref5$count === void 0 ? 1000 : _ref5$count, topics = _ref5.topics, _ref5$includeTransact = _ref5.includeTransaction, includeTransaction = _ref5$includeTransact === void 0 ? false : _ref5$includeTransact;
          contractAddress = ValidateAddress(contractAddress);

          if (abi) {
            _context4.next = 6;
            break;
          }

          _context4.next = 5;
          return _regeneratorRuntime.awrap(this.ContractAbi({
            contractAddress: contractAddress
          }));

        case 5:
          abi = _context4.sent;

        case 6:
          _context4.next = 8;
          return _regeneratorRuntime.awrap(this.FormatBlockNumbers({
            fromBlock: fromBlock,
            toBlock: toBlock,
            count: count
          }));

        case 8:
          blocks = _context4.sent;
          this.Log("Querying contract events ".concat(contractAddress, " - Blocks ").concat(blocks.fromBlock, " to ").concat(blocks.toBlock));
          _context4.next = 12;
          return _regeneratorRuntime.awrap(this.ethClient.ContractEvents({
            contractAddress: contractAddress,
            abi: abi,
            fromBlock: blocks.fromBlock,
            toBlock: blocks.toBlock,
            topics: topics,
            includeTransaction: includeTransaction
          }));

        case 12:
          return _context4.abrupt("return", _context4.sent);

        case 13:
        case "end":
          return _context4.stop();
      }
    }
  }, null, this);
};
/**
 * Call the specified method on a deployed contract. This action will be performed by this client's signer.
 *
 * Use this method to call constant methods and contract attributes, as well as transaction-performing methods
 * for which the transaction does not need to be awaited.
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string} contractAddress - Address of the contract to call the specified method on
 * @param {Object=} abi - ABI of contract - If the contract is a standard Eluvio contract, this can be determined automatically if not specified
 * @param {string} methodName - Method to call on the contract
 * @param {Array=} methodArgs - List of arguments to the contract constructor
 * @param {(number | BigNumber)=} value - Amount of ether to include in the transaction
 * @param {boolean=} formatArguments=true - If specified, the arguments will automatically be formatted to the ABI specification
 * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
 *
 * @returns {Promise<*>} - Response containing information about the transaction
 */


exports.CallContractMethod = function _callee5(_ref6) {
  var contractAddress, abi, methodName, _ref6$methodArgs, methodArgs, value, _ref6$overrides, overrides, _ref6$formatArguments, formatArguments, _ref6$cacheContract, cacheContract, _ref6$overrideCachedC, overrideCachedContract;

  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          contractAddress = _ref6.contractAddress, abi = _ref6.abi, methodName = _ref6.methodName, _ref6$methodArgs = _ref6.methodArgs, methodArgs = _ref6$methodArgs === void 0 ? [] : _ref6$methodArgs, value = _ref6.value, _ref6$overrides = _ref6.overrides, overrides = _ref6$overrides === void 0 ? {} : _ref6$overrides, _ref6$formatArguments = _ref6.formatArguments, formatArguments = _ref6$formatArguments === void 0 ? true : _ref6$formatArguments, _ref6$cacheContract = _ref6.cacheContract, cacheContract = _ref6$cacheContract === void 0 ? true : _ref6$cacheContract, _ref6$overrideCachedC = _ref6.overrideCachedContract, overrideCachedContract = _ref6$overrideCachedC === void 0 ? false : _ref6$overrideCachedC;
          contractAddress = ValidateAddress(contractAddress); // Delete cached visibility value if it is being changed

          contractAddress = this.utils.FormatAddress(contractAddress);

          if (methodName === "setVisibility" && this.visibilityInfo[contractAddress]) {
            delete this.visibilityInfo[contractAddress];
          }

          if (abi) {
            _context5.next = 8;
            break;
          }

          _context5.next = 7;
          return _regeneratorRuntime.awrap(this.ContractAbi({
            contractAddress: contractAddress
          }));

        case 7:
          abi = _context5.sent;

        case 8:
          _context5.next = 10;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: contractAddress,
            abi: abi,
            methodName: methodName,
            methodArgs: methodArgs,
            value: value,
            overrides: overrides,
            formatArguments: formatArguments,
            cacheContract: cacheContract,
            overrideCachedContract: overrideCachedContract
          }));

        case 10:
          return _context5.abrupt("return", _context5.sent);

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  }, null, this);
};
/**
 * Call the specified method on a deployed contract and wait for the transaction to be mined.
 * This action will be performed by this client's signer.
 *
 * Use this method to call transaction-performing methods and wait for the transaction to complete.
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string} contractAddress - Address of the contract to call the specified method on
 * @param {Object=} abi - ABI of contract - If the contract is a standard Eluvio contract, this can be determined automatically if not specified
 * @param {string} methodName - Method to call on the contract
 * @param {Array<string>=} methodArgs=[] - List of arguments to the contract constructor
 * @param {(number | BigNumber)=} value - Amount of ether to include in the transaction
 * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
 * @param {boolean=} formatArguments=true - If specified, the arguments will automatically be formatted to the ABI specification
 *
 * @see Utils.WeiToEther
 *
 * @returns {Promise<*>} - The event object of this transaction. See the ExtractEventFromLogs method for parsing
 * the resulting event(s)
 */


exports.CallContractMethodAndWait = function _callee6(_ref7) {
  var contractAddress, abi, methodName, methodArgs, value, _ref7$overrides, overrides, _ref7$formatArguments, formatArguments, _ref7$cacheContract, cacheContract, _ref7$overrideCachedC, overrideCachedContract;

  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          contractAddress = _ref7.contractAddress, abi = _ref7.abi, methodName = _ref7.methodName, methodArgs = _ref7.methodArgs, value = _ref7.value, _ref7$overrides = _ref7.overrides, overrides = _ref7$overrides === void 0 ? {} : _ref7$overrides, _ref7$formatArguments = _ref7.formatArguments, formatArguments = _ref7$formatArguments === void 0 ? true : _ref7$formatArguments, _ref7$cacheContract = _ref7.cacheContract, cacheContract = _ref7$cacheContract === void 0 ? true : _ref7$cacheContract, _ref7$overrideCachedC = _ref7.overrideCachedContract, overrideCachedContract = _ref7$overrideCachedC === void 0 ? false : _ref7$overrideCachedC;
          contractAddress = ValidateAddress(contractAddress); // Delete cached visibility value if it is being changed

          contractAddress = this.utils.FormatAddress(contractAddress);

          if (methodName === "setVisibility" && this.visibilityInfo[contractAddress]) {
            delete this.visibilityInfo[contractAddress];
          }

          if (abi) {
            _context6.next = 8;
            break;
          }

          _context6.next = 7;
          return _regeneratorRuntime.awrap(this.ContractAbi({
            contractAddress: contractAddress
          }));

        case 7:
          abi = _context6.sent;

        case 8:
          _context6.next = 10;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: contractAddress,
            abi: abi,
            methodName: methodName,
            methodArgs: methodArgs,
            value: value,
            overrides: overrides,
            formatArguments: formatArguments,
            cacheContract: cacheContract,
            overrideCachedContract: overrideCachedContract
          }));

        case 10:
          return _context6.abrupt("return", _context6.sent);

        case 11:
        case "end":
          return _context6.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve metadata from the specified contract
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string} contractAddress - The address of the contract
 * @param {string} metadataKey - The metadata key to retrieve
 *
 * @return {Promise<Object|string>}
 */


exports.ContractMetadata = function _callee7(_ref8) {
  var contractAddress, metadataKey, metadata, data;
  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          contractAddress = _ref8.contractAddress, metadataKey = _ref8.metadataKey;
          ValidatePresence("contractAddress", contractAddress);
          ValidatePresence("metadataKey", metadataKey);
          _context7.prev = 3;
          _context7.next = 6;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: contractAddress,
            methodName: "getMeta",
            methodArgs: [metadataKey]
          }));

        case 6:
          metadata = _context7.sent;
          data = Buffer.from((metadata || "").replace("0x", ""), "hex").toString("utf-8");
          _context7.prev = 8;
          return _context7.abrupt("return", JSON.parse(data));

        case 12:
          _context7.prev = 12;
          _context7.t0 = _context7["catch"](8);
          return _context7.abrupt("return", data);

        case 15:
          _context7.next = 20;
          break;

        case 17:
          _context7.prev = 17;
          _context7.t1 = _context7["catch"](3);
          return _context7.abrupt("return", "");

        case 20:
        case "end":
          return _context7.stop();
      }
    }
  }, null, this, [[3, 17], [8, 12]]);
};
/**
 * Merge contract metadata at the specified key.
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string} contractAddress - The address of the contract
 * @param {string} metadataKey - The metadata key to retrieve
 * @param {string} metadata
 */


exports.MergeContractMetadata = function _callee8(_ref9) {
  var contractAddress, metadataKey, metadata, existingMetadata;
  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          contractAddress = _ref9.contractAddress, metadataKey = _ref9.metadataKey, metadata = _ref9.metadata;
          ValidatePresence("contractAddress", contractAddress);
          ValidatePresence("metadataKey", metadataKey);
          _context8.next = 5;
          return _regeneratorRuntime.awrap(this.ContractMetadata({
            contractAddress: contractAddress,
            metadataKey: metadataKey
          }));

        case 5:
          _context8.t0 = _context8.sent;

          if (_context8.t0) {
            _context8.next = 8;
            break;
          }

          _context8.t0 = {};

        case 8:
          existingMetadata = _context8.t0;

          if (_typeof(existingMetadata) === "object") {
            metadata = _objectSpread({}, existingMetadata, {}, metadata);
          }

          _context8.next = 12;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: contractAddress,
            methodName: "putMeta",
            methodArgs: [metadataKey, JSON.stringify(metadata)]
          }));

        case 12:
        case "end":
          return _context8.stop();
      }
    }
  }, null, this);
};
/**
 * Replace the contract metadata at the specified key
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string} contractAddress - The address of the contract
 * @param {string} metadataKey - The metadata key to retrieve
 * @param {string|Object} metadata - The metadata to insert
 */


exports.ReplaceContractMetadata = function _callee9(_ref10) {
  var contractAddress, metadataKey, metadata;
  return _regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          contractAddress = _ref10.contractAddress, metadataKey = _ref10.metadataKey, metadata = _ref10.metadata;
          ValidatePresence("contractAddress", contractAddress);
          ValidatePresence("metadataKey", metadataKey);
          _context9.next = 5;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: contractAddress,
            methodName: "putMeta",
            methodArgs: [metadataKey, JSON.stringify(metadata)]
          }));

        case 5:
        case "end":
          return _context9.stop();
      }
    }
  }, null, this);
};
/**
 * Get the custom contract of the specified object
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 *
 * @returns {Promise<string> | undefined} - If the object has a custom contract, this will return the address of the custom contract
 */


exports.CustomContractAddress = function _callee10(_ref11) {
  var libraryId, objectId, versionHash, abi, customContractAddress;
  return _regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          libraryId = _ref11.libraryId, objectId = _ref11.objectId, versionHash = _ref11.versionHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (!(libraryId === this.contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId))) {
            _context10.next = 5;
            break;
          }

          return _context10.abrupt("return");

        case 5:
          this.Log("Retrieving custom contract address: ".concat(objectId));
          _context10.next = 8;
          return _regeneratorRuntime.awrap(this.ContractAbi({
            id: objectId
          }));

        case 8:
          abi = _context10.sent;
          _context10.next = 11;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: abi,
            methodName: "contentContractAddress",
            methodArgs: []
          }));

        case 11:
          customContractAddress = _context10.sent;

          if (!(customContractAddress === this.utils.nullAddress)) {
            _context10.next = 14;
            break;
          }

          return _context10.abrupt("return");

        case 14:
          return _context10.abrupt("return", this.utils.FormatAddress(customContractAddress));

        case 15:
        case "end":
          return _context10.stop();
      }
    }
  }, null, this);
};
/**
 * Set the custom contract of the specified object with the contract at the specified address
 *
 * Note: This also updates the content object metadata with information about the contract - particularly the ABI
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} customContractAddress - Address of the deployed custom contract
 * @param {string=} name - Optional name of the custom contract
 * @param {string=} description - Optional description of the custom contract
 * @param {Object} abi - ABI of the custom contract
 * @param {Object=} factoryAbi - If the custom contract is a factory, the ABI of the contract it deploys
 * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
 *
 * @returns {Promise<Object>} - Result transaction of calling the setCustomContract method on the content object contract
 */


exports.SetCustomContentContract = function _callee11(_ref12) {
  var libraryId, objectId, customContractAddress, name, description, abi, factoryAbi, _ref12$overrides, overrides, setResult, writeToken;

  return _regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          libraryId = _ref12.libraryId, objectId = _ref12.objectId, customContractAddress = _ref12.customContractAddress, name = _ref12.name, description = _ref12.description, abi = _ref12.abi, factoryAbi = _ref12.factoryAbi, _ref12$overrides = _ref12.overrides, overrides = _ref12$overrides === void 0 ? {} : _ref12$overrides;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          customContractAddress = ValidateAddress(customContractAddress);
          customContractAddress = this.utils.FormatAddress(customContractAddress);
          this.Log("Setting custom contract address: ".concat(objectId, " ").concat(customContractAddress));
          _context11.next = 7;
          return _regeneratorRuntime.awrap(this.ethClient.SetCustomContentContract({
            contentContractAddress: this.utils.HashToAddress(objectId),
            customContractAddress: customContractAddress,
            overrides: overrides,
            signer: this.signer
          }));

        case 7:
          setResult = _context11.sent;
          _context11.next = 10;
          return _regeneratorRuntime.awrap(this.EditContentObject({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 10:
          writeToken = _context11.sent.write_token;
          _context11.next = 13;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: "custom_contract",
            metadata: {
              name: name,
              description: description,
              address: customContractAddress,
              abi: abi,
              factoryAbi: factoryAbi
            }
          }));

        case 13:
          _context11.next = 15;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            commitMessage: "Set custom contract"
          }));

        case 15:
          return _context11.abrupt("return", setResult);

        case 16:
        case "end":
          return _context11.stop();
      }
    }
  }, null, this);
};
/**
 * Extract the specified event log from the given event obtained from the
 * CallContractAndMethodAndWait method
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string} contractAddress - Address of the contract to call the specified method on
 *
 * @param {Object} event - Event of the transaction from CallContractMethodAndWait
 * @param {string} eventName - Name of the event to parse
 *
 * @see Utils.WeiToEther
 *
 * @returns {Promise<Object>} - The parsed event log from the event
 */


exports.ExtractEventFromLogs = function (_ref13) {
  var abi = _ref13.abi,
      event = _ref13.event,
      eventName = _ref13.eventName;
  return this.ethClient.ExtractEventFromLogs({
    abi: abi,
    event: event,
    eventName: eventName
  });
};
/**
 * Extract the specified value from the specified event log from the given event obtained
 * from the CallContractAndMethodAndWait method
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string} contractAddress - Address of the contract to call the specified method on
 * @param {Object} abi - ABI of contract
 * @param {Object} event - Event of the transaction from CallContractMethodAndWait
 * @param {string} eventName - Name of the event to parse
 * @param {string} eventValue - Name of the value to extract from the event
 *
 * @returns {Promise<string>} The value extracted from the event
 */


exports.ExtractValueFromEvent = function (_ref14) {
  var abi = _ref14.abi,
      event = _ref14.event,
      eventName = _ref14.eventName,
      eventValue = _ref14.eventValue;
  var eventLog = this.ethClient.ExtractEventFromLogs({
    abi: abi,
    event: event,
    eventName: eventName,
    eventValue: eventValue
  });
  return eventLog ? eventLog.values[eventValue] : undefined;
};

exports.FormatBlockNumbers = function _callee12(_ref15) {
  var fromBlock, toBlock, _ref15$count, count, latestBlock;

  return _regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          fromBlock = _ref15.fromBlock, toBlock = _ref15.toBlock, _ref15$count = _ref15.count, count = _ref15$count === void 0 ? 10 : _ref15$count;
          _context12.next = 3;
          return _regeneratorRuntime.awrap(this.BlockNumber());

        case 3:
          latestBlock = _context12.sent;

          if (!toBlock) {
            if (!fromBlock) {
              toBlock = latestBlock;
              fromBlock = toBlock - count + 1;
            } else {
              toBlock = fromBlock + count - 1;
            }
          } else if (!fromBlock) {
            fromBlock = toBlock - count + 1;
          } // Ensure block numbers are valid


          if (toBlock > latestBlock) {
            toBlock = latestBlock;
          }

          if (fromBlock < 0) {
            fromBlock = 0;
          }

          return _context12.abrupt("return", {
            fromBlock: fromBlock,
            toBlock: toBlock
          });

        case 8:
        case "end":
          return _context12.stop();
      }
    }
  }, null, this);
};
/**
 * Get events from the blockchain in reverse chronological order, starting from toBlock. This will also attempt
 * to identify and parse any known Eluvio contract methods. If successful, the method name, signature, and input
 * values will be included in the log entry.
 *
 * @methodGroup Blockchain
 * @namedParams
 * @param {number=} toBlock - Limit results to events before the specified block (inclusive) - If not specified, will start from latest block
 * @param {number=} fromBlock - Limit results to events after the specified block (inclusive)
 * @param {number=} count=10 - Max number of events to include (unless both toBlock and fromBlock are specified)
 * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
 * Note: This requires two extra network calls per transaction, so it should not be used for very large ranges
 * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
 */


exports.Events = function _callee13() {
  var _ref16,
      toBlock,
      fromBlock,
      _ref16$count,
      count,
      _ref16$includeTransac,
      includeTransaction,
      blocks,
      _args13 = arguments;

  return _regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _ref16 = _args13.length > 0 && _args13[0] !== undefined ? _args13[0] : {}, toBlock = _ref16.toBlock, fromBlock = _ref16.fromBlock, _ref16$count = _ref16.count, count = _ref16$count === void 0 ? 10 : _ref16$count, _ref16$includeTransac = _ref16.includeTransaction, includeTransaction = _ref16$includeTransac === void 0 ? false : _ref16$includeTransac;
          _context13.next = 3;
          return _regeneratorRuntime.awrap(this.FormatBlockNumbers({
            fromBlock: fromBlock,
            toBlock: toBlock,
            count: count
          }));

        case 3:
          blocks = _context13.sent;
          this.Log("Querying events - Blocks ".concat(blocks.fromBlock, " to ").concat(blocks.toBlock));
          _context13.next = 7;
          return _regeneratorRuntime.awrap(this.ethClient.Events({
            fromBlock: blocks.fromBlock,
            toBlock: blocks.toBlock,
            includeTransaction: includeTransaction
          }));

        case 7:
          return _context13.abrupt("return", _context13.sent);

        case 8:
        case "end":
          return _context13.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve the latest block number on the blockchain
 *
 * @methodGroup Blockchain
 *
 * @returns {Promise<number>} - The latest block number
 */


exports.BlockNumber = function _callee14() {
  return _regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return _regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
            methodName: "getBlockNumber"
          }));

        case 2:
          return _context14.abrupt("return", _context14.sent);

        case 3:
        case "end":
          return _context14.stop();
      }
    }
  }, null, this);
};
/**
 * Get the balance (in ether) of the specified address
 *
 * @methodGroup Blockchain
 * @namedParams
 * @param {string} address - Address to query
 *
 * @returns {Promise<string>} - Balance of the account, in ether (as string)
 */


exports.GetBalance = function _callee15(_ref17) {
  var address, balance;
  return _regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          address = _ref17.address;
          address = ValidateAddress(address);
          _context15.next = 4;
          return _regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
            methodName: "getBalance",
            args: [address]
          }));

        case 4:
          balance = _context15.sent;
          return _context15.abrupt("return", Ethers.utils.formatEther(balance));

        case 6:
        case "end":
          return _context15.stop();
      }
    }
  }, null, this);
};
/**
 * Send ether from this client's current signer to the specified recipient address
 *
 * @methodGroup Blockchain
 * @namedParams
 * @param {string} recipient - Address of the recipient
 * @param {number} ether - Amount of ether to send
 *
 * @returns {Promise<Object>} - The transaction receipt
 */


exports.SendFunds = function _callee16(_ref18) {
  var recipient, ether, transaction;
  return _regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          recipient = _ref18.recipient, ether = _ref18.ether;
          recipient = ValidateAddress(recipient);
          _context16.next = 4;
          return _regeneratorRuntime.awrap(this.signer.sendTransaction({
            to: recipient,
            value: Ethers.utils.parseEther(ether.toString())
          }));

        case 4:
          transaction = _context16.sent;
          _context16.next = 7;
          return _regeneratorRuntime.awrap(transaction.wait());

        case 7:
          return _context16.abrupt("return", _context16.sent);

        case 8:
        case "end":
          return _context16.stop();
      }
    }
  }, null, this);
};