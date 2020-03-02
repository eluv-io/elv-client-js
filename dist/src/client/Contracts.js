var _regeneratorRuntime = require("@babel/runtime/regenerator");

/**
 * Methods for deploying and interacting with contracts
 *
 * @module ElvClient/Contracts
 */
var Ethers = require("ethers");

var _require = require("../Validation"),
    ValidateAddress = _require.ValidateAddress,
    ValidateParameters = _require.ValidateParameters;
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
          ValidateAddress(contractAddress);
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


exports.FormatContractArguments = function (_ref2) {
  var abi = _ref2.abi,
      methodName = _ref2.methodName,
      args = _ref2.args;
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


exports.DeployContract = function _callee2(_ref3) {
  var abi, bytecode, constructorArgs, _ref3$overrides, overrides;

  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          abi = _ref3.abi, bytecode = _ref3.bytecode, constructorArgs = _ref3.constructorArgs, _ref3$overrides = _ref3.overrides, overrides = _ref3$overrides === void 0 ? {} : _ref3$overrides;
          _context2.next = 3;
          return _regeneratorRuntime.awrap(this.ethClient.DeployContract({
            abi: abi,
            bytecode: bytecode,
            constructorArgs: constructorArgs,
            overrides: overrides,
            signer: this.signer
          }));

        case 3:
          return _context2.abrupt("return", _context2.sent);

        case 4:
        case "end":
          return _context2.stop();
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
 * @param {object} abi - The ABI of the contract
 * @param {number=} fromBlock - Limit results to events after the specified block (inclusive)
 * @param {number=} toBlock - Limit results to events before the specified block (inclusive)
 * @param {number=} count=1000 - Maximum range of blocks to search (unless both toBlock and fromBlock are specified)
 * @param {boolean=} includeTransaction=false - If specified, more detailed transaction info will be included.
 * Note: This requires one extra network call per block, so it should not be used for very large ranges
 * @returns {Promise<Array<Array<Object>>>} - List of blocks, in ascending order by block number, each containing a list of the events in the block.
 */


exports.ContractEvents = function _callee3(_ref4) {
  var contractAddress, abi, _ref4$fromBlock, fromBlock, toBlock, _ref4$count, count, _ref4$includeTransact, includeTransaction, blocks;

  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          contractAddress = _ref4.contractAddress, abi = _ref4.abi, _ref4$fromBlock = _ref4.fromBlock, fromBlock = _ref4$fromBlock === void 0 ? 0 : _ref4$fromBlock, toBlock = _ref4.toBlock, _ref4$count = _ref4.count, count = _ref4$count === void 0 ? 1000 : _ref4$count, _ref4$includeTransact = _ref4.includeTransaction, includeTransaction = _ref4$includeTransact === void 0 ? false : _ref4$includeTransact;
          ValidateAddress(contractAddress);
          _context3.next = 4;
          return _regeneratorRuntime.awrap(this.FormatBlockNumbers({
            fromBlock: fromBlock,
            toBlock: toBlock,
            count: count
          }));

        case 4:
          blocks = _context3.sent;
          this.Log("Querying contract events ".concat(contractAddress, " - Blocks ").concat(blocks.fromBlock, " to ").concat(blocks.toBlock));
          _context3.next = 8;
          return _regeneratorRuntime.awrap(this.ethClient.ContractEvents({
            contractAddress: contractAddress,
            abi: abi,
            fromBlock: blocks.fromBlock,
            toBlock: blocks.toBlock,
            includeTransaction: includeTransaction
          }));

        case 8:
          return _context3.abrupt("return", _context3.sent);

        case 9:
        case "end":
          return _context3.stop();
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
 * @param {Object} abi - ABI of contract
 * @param {string} methodName - Method to call on the contract
 * @param {Array=} methodArgs - List of arguments to the contract constructor
 * @param {(number | BigNumber)=} value - Amount of ether to include in the transaction
 * @param {boolean=} formatArguments=true - If specified, the arguments will automatically be formatted to the ABI specification
 * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
 *
 * @returns {Promise<*>} - Response containing information about the transaction
 */


exports.CallContractMethod = function _callee4(_ref5) {
  var contractAddress, abi, methodName, _ref5$methodArgs, methodArgs, value, _ref5$overrides, overrides, _ref5$formatArguments, formatArguments, _ref5$cacheContract, cacheContract;

  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          contractAddress = _ref5.contractAddress, abi = _ref5.abi, methodName = _ref5.methodName, _ref5$methodArgs = _ref5.methodArgs, methodArgs = _ref5$methodArgs === void 0 ? [] : _ref5$methodArgs, value = _ref5.value, _ref5$overrides = _ref5.overrides, overrides = _ref5$overrides === void 0 ? {} : _ref5$overrides, _ref5$formatArguments = _ref5.formatArguments, formatArguments = _ref5$formatArguments === void 0 ? true : _ref5$formatArguments, _ref5$cacheContract = _ref5.cacheContract, cacheContract = _ref5$cacheContract === void 0 ? true : _ref5$cacheContract;
          ValidateAddress(contractAddress);
          _context4.next = 4;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: contractAddress,
            abi: abi,
            methodName: methodName,
            methodArgs: methodArgs,
            value: value,
            overrides: overrides,
            formatArguments: formatArguments,
            cacheContract: cacheContract,
            signer: this.signer
          }));

        case 4:
          return _context4.abrupt("return", _context4.sent);

        case 5:
        case "end":
          return _context4.stop();
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
 * @param {Object} abi - ABI of contract
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


exports.CallContractMethodAndWait = function _callee5(_ref6) {
  var contractAddress, abi, methodName, methodArgs, value, _ref6$overrides, overrides, _ref6$formatArguments, formatArguments;

  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          contractAddress = _ref6.contractAddress, abi = _ref6.abi, methodName = _ref6.methodName, methodArgs = _ref6.methodArgs, value = _ref6.value, _ref6$overrides = _ref6.overrides, overrides = _ref6$overrides === void 0 ? {} : _ref6$overrides, _ref6$formatArguments = _ref6.formatArguments, formatArguments = _ref6$formatArguments === void 0 ? true : _ref6$formatArguments;
          ValidateAddress(contractAddress);
          _context5.next = 4;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: contractAddress,
            abi: abi,
            methodName: methodName,
            methodArgs: methodArgs,
            value: value,
            overrides: overrides,
            formatArguments: formatArguments,
            signer: this.signer
          }));

        case 4:
          return _context5.abrupt("return", _context5.sent);

        case 5:
        case "end":
          return _context5.stop();
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


exports.CustomContractAddress = function _callee6(_ref7) {
  var libraryId, objectId, versionHash, customContractAddress;
  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          libraryId = _ref7.libraryId, objectId = _ref7.objectId, versionHash = _ref7.versionHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (!(libraryId === this.contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId))) {
            _context6.next = 5;
            break;
          }

          return _context6.abrupt("return");

        case 5:
          this.Log("Retrieving custom contract address: ".concat(objectId));
          _context6.next = 8;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: ContentContract.abi,
            methodName: "contentContractAddress",
            methodArgs: [],
            signer: this.signer
          }));

        case 8:
          customContractAddress = _context6.sent;

          if (!(customContractAddress === this.utils.nullAddress)) {
            _context6.next = 11;
            break;
          }

          return _context6.abrupt("return");

        case 11:
          return _context6.abrupt("return", this.utils.FormatAddress(customContractAddress));

        case 12:
        case "end":
          return _context6.stop();
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


exports.SetCustomContentContract = function _callee7(_ref8) {
  var libraryId, objectId, customContractAddress, name, description, abi, factoryAbi, _ref8$overrides, overrides, setResult, writeToken;

  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          libraryId = _ref8.libraryId, objectId = _ref8.objectId, customContractAddress = _ref8.customContractAddress, name = _ref8.name, description = _ref8.description, abi = _ref8.abi, factoryAbi = _ref8.factoryAbi, _ref8$overrides = _ref8.overrides, overrides = _ref8$overrides === void 0 ? {} : _ref8$overrides;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateAddress(customContractAddress);
          customContractAddress = this.utils.FormatAddress(customContractAddress);
          this.Log("Setting custom contract address: ".concat(objectId, " ").concat(customContractAddress));
          _context7.next = 7;
          return _regeneratorRuntime.awrap(this.ethClient.SetCustomContentContract({
            contentContractAddress: Utils.HashToAddress(objectId),
            customContractAddress: customContractAddress,
            overrides: overrides,
            signer: this.signer
          }));

        case 7:
          setResult = _context7.sent;
          _context7.next = 10;
          return _regeneratorRuntime.awrap(this.EditContentObject({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 10:
          writeToken = _context7.sent.write_token;
          _context7.next = 13;
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
          _context7.next = 15;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 15:
          return _context7.abrupt("return", setResult);

        case 16:
        case "end":
          return _context7.stop();
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
 * @param {Object} abi - ABI of contract
 * @param {Object} event - Event of the transaction from CallContractMethodAndWait
 * @param {string} eventName - Name of the event to parse
 *
 * @see Utils.WeiToEther
 *
 * @returns {Promise<Object>} - The parsed event log from the event
 */


exports.ExtractEventFromLogs = function (_ref9) {
  var abi = _ref9.abi,
      event = _ref9.event,
      eventName = _ref9.eventName;
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


exports.ExtractValueFromEvent = function (_ref10) {
  var abi = _ref10.abi,
      event = _ref10.event,
      eventName = _ref10.eventName,
      eventValue = _ref10.eventValue;
  var eventLog = this.ethClient.ExtractEventFromLogs({
    abi: abi,
    event: event,
    eventName: eventName,
    eventValue: eventValue
  });
  return eventLog ? eventLog.values[eventValue] : undefined;
};

exports.FormatBlockNumbers = function _callee8(_ref11) {
  var fromBlock, toBlock, _ref11$count, count, latestBlock;

  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          fromBlock = _ref11.fromBlock, toBlock = _ref11.toBlock, _ref11$count = _ref11.count, count = _ref11$count === void 0 ? 10 : _ref11$count;
          _context8.next = 3;
          return _regeneratorRuntime.awrap(this.BlockNumber());

        case 3:
          latestBlock = _context8.sent;

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

          return _context8.abrupt("return", {
            fromBlock: fromBlock,
            toBlock: toBlock
          });

        case 8:
        case "end":
          return _context8.stop();
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


exports.Events = function _callee9() {
  var _ref12,
      toBlock,
      fromBlock,
      _ref12$count,
      count,
      _ref12$includeTransac,
      includeTransaction,
      blocks,
      _args9 = arguments;

  return _regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _ref12 = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : {}, toBlock = _ref12.toBlock, fromBlock = _ref12.fromBlock, _ref12$count = _ref12.count, count = _ref12$count === void 0 ? 10 : _ref12$count, _ref12$includeTransac = _ref12.includeTransaction, includeTransaction = _ref12$includeTransac === void 0 ? false : _ref12$includeTransac;
          _context9.next = 3;
          return _regeneratorRuntime.awrap(this.FormatBlockNumbers({
            fromBlock: fromBlock,
            toBlock: toBlock,
            count: count
          }));

        case 3:
          blocks = _context9.sent;
          this.Log("Querying events - Blocks ".concat(blocks.fromBlock, " to ").concat(blocks.toBlock));
          _context9.next = 7;
          return _regeneratorRuntime.awrap(this.ethClient.Events({
            fromBlock: blocks.fromBlock,
            toBlock: blocks.toBlock,
            includeTransaction: includeTransaction
          }));

        case 7:
          return _context9.abrupt("return", _context9.sent);

        case 8:
        case "end":
          return _context9.stop();
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


exports.BlockNumber = function _callee10() {
  return _regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return _regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
            methodName: "getBlockNumber"
          }));

        case 2:
          return _context10.abrupt("return", _context10.sent);

        case 3:
        case "end":
          return _context10.stop();
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


exports.GetBalance = function _callee11(_ref13) {
  var address, balance;
  return _regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          address = _ref13.address;
          ValidateAddress(address);
          _context11.next = 4;
          return _regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
            methodName: "getBalance",
            args: [address]
          }));

        case 4:
          balance = _context11.sent;
          return _context11.abrupt("return", Ethers.utils.formatEther(balance));

        case 6:
        case "end":
          return _context11.stop();
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


exports.SendFunds = function _callee12(_ref14) {
  var recipient, ether, transaction;
  return _regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          recipient = _ref14.recipient, ether = _ref14.ether;
          ValidateAddress(recipient);
          _context12.next = 4;
          return _regeneratorRuntime.awrap(this.signer.sendTransaction({
            to: recipient,
            value: Ethers.utils.parseEther(ether.toString())
          }));

        case 4:
          transaction = _context12.sent;
          _context12.next = 7;
          return _regeneratorRuntime.awrap(transaction.wait());

        case 7:
          return _context12.abrupt("return", _context12.sent);

        case 8:
        case "end":
          return _context12.stop();
      }
    }
  }, null, this);
};
/*
// TODO: Not implemented in contracts
exports.WithdrawContractFunds = async function({contractAddress, abi, ether}) {
  ValidateAddress(contractAddress);

  return await this.ethClient.CallContractMethodAndWait({
    contractAddress,
    abi,
    methodName: "transfer",
    methodArgs: [this.signer.address, Ethers.utils.parseEther(ether.toString())],
    signer: this.signer
  });
}
*/