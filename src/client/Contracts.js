/**
 * Methods for deploying and interacting with contracts
 *
 * @module ElvClient/Contracts
 */

const Ethers = require("ethers");
//const ContentContract = require("../contracts/BaseContent");

const {
  ValidateAddress,
  ValidateParameters,
  ValidatePresence,
  ValidateObject,
  ValidateVersion
} = require("../Validation");
const Utils=require("../Utils");

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
exports.ContractName = async function({contractAddress}) {
  contractAddress = ValidateAddress(contractAddress);

  return await this.ethClient.ContractName(contractAddress);
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
exports.ContractAbi = async function({contractAddress, id}) {
  const contractInfo = await this.authClient.ContractInfo({address: contractAddress, id});

  if(!contractInfo) {
    throw Error(`Unable to determine contract info for ${contractAddress}`);
  }

  return contractInfo.abi;
};

/**
 * Retrieve the ABI, access type, and whether V3 is used for a given contract via its address or a Fabric ID.
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string=} id - The Fabric ID of the contract
 * @param {string=} address - The address of the contract
 *
 * @return {Promise<Object>} - The ABI, access type, and isV3 for the given contract
 */
exports.ContractInfo = async function({id, address}) {
  return this.authClient.ContractInfo({id, address});
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
exports.FormatContractArguments = function({abi, methodName, args}) {
  return this.ethClient.FormatContractArguments({abi, methodName, args});
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
exports.DeployContract = async function({abi, bytecode, constructorArgs, overrides={}}) {
  return await this.ethClient.DeployContract({abi, bytecode, constructorArgs, overrides, signer: this.signer});
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
exports.ContractEvents = async function({
  contractAddress,
  abi,
  fromBlock=0,
  toBlock,
  count=1000,
  topics,
  includeTransaction=false
}) {
  contractAddress = ValidateAddress(contractAddress);

  if(!abi) { abi = await this.ContractAbi({contractAddress}); }

  const blocks = await this.FormatBlockNumbers({fromBlock, toBlock, count});

  this.Log(`Querying contract events ${contractAddress} - Blocks ${blocks.fromBlock} to ${blocks.toBlock}`);

  return await this.ethClient.ContractEvents({
    contractAddress,
    abi,
    fromBlock: blocks.fromBlock,
    toBlock: blocks.toBlock,
    topics,
    includeTransaction
  });
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
exports.CallContractMethod = async function({
  contractAddress,
  abi,
  methodName,
  methodArgs=[],
  value,
  overrides={},
  formatArguments=true,
  cacheContract=true,
  overrideCachedContract=false
}) {
  contractAddress = ValidateAddress(contractAddress);

  // Delete cached visibility value if it is being changed
  contractAddress = this.utils.FormatAddress(contractAddress);
  if(methodName === "setVisibility" && this.visibilityInfo[contractAddress]) {
    delete this.visibilityInfo[contractAddress];
  }

  if(!abi) { abi = await this.ContractAbi({contractAddress}); }

  return await this.ethClient.CallContractMethod({
    contractAddress,
    abi,
    methodName,
    methodArgs,
    value,
    overrides,
    formatArguments,
    cacheContract,
    overrideCachedContract
  });
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
exports.CallContractMethodAndWait = async function({
  contractAddress,
  abi,
  methodName,
  methodArgs,
  value,
  overrides={},
  formatArguments=true,
  cacheContract=true,
  overrideCachedContract=false
}) {
  contractAddress = ValidateAddress(contractAddress);

  // Delete cached visibility value if it is being changed
  contractAddress = this.utils.FormatAddress(contractAddress);
  if(methodName === "setVisibility" && this.visibilityInfo[contractAddress]) {
    delete this.visibilityInfo[contractAddress];
  }

  if(!abi) { abi = await this.ContractAbi({contractAddress}); }

  return await this.ethClient.CallContractMethodAndWait({
    contractAddress,
    abi,
    methodName,
    methodArgs,
    value,
    overrides,
    formatArguments,
    cacheContract,
    overrideCachedContract
  });
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
exports.ContractMetadata = async function({contractAddress, metadataKey, }) {
  ValidatePresence("contractAddress", contractAddress);
  ValidatePresence("metadataKey", metadataKey);

  try {
    const metadata = await this.CallContractMethod({
      contractAddress,
      methodName: "getMeta",
      methodArgs: [metadataKey]
    });

    const data = Buffer.from((metadata || "").replace("0x", ""), "hex").toString("utf-8");

    try {
      return JSON.parse(data);
    } catch(error) {
      return data;
    }
  } catch(error) {
    return "";
  }
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
exports.MergeContractMetadata = async function({contractAddress, metadataKey, metadata}) {
  ValidatePresence("contractAddress", contractAddress);
  ValidatePresence("metadataKey", metadataKey);

  const existingMetadata = await this.ContractMetadata({contractAddress, metadataKey}) || {};

  if(typeof existingMetadata === "object") {
    metadata = {
      ...existingMetadata,
      ...metadata
    };
  }

  await this.CallContractMethodAndWait({
    contractAddress,
    methodName: "putMeta",
    methodArgs: [
      metadataKey,
      JSON.stringify(metadata)
    ]
  });
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
exports.ReplaceContractMetadata = async function({contractAddress, metadataKey, metadata}) {
  ValidatePresence("contractAddress", contractAddress);
  ValidatePresence("metadataKey", metadataKey);

  if(typeof metadata === "object") {
    metadata = JSON.stringify(metadata);
  }

  await this.CallContractMethodAndWait({
    contractAddress,
    methodName: "putMeta",
    methodArgs: [
      metadataKey,
      metadata
    ]
  });
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
exports.CustomContractAddress = async function({libraryId, objectId, versionHash}) {
  ValidateParameters({libraryId, objectId, versionHash});

  if(versionHash) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  }

  if(libraryId === this.contentSpaceLibraryId || this.utils.EqualHash(libraryId, objectId)) {
    // Content type or content library object - no custom contract
    return;
  }

  this.Log(`Retrieving custom contract address: ${objectId}`);

  const abi = await this.ContractAbi({id: objectId});
  const customContractAddress = await this.ethClient.CallContractMethod({
    contractAddress: this.utils.HashToAddress(objectId),
    abi,
    methodName: "contentContractAddress",
    methodArgs: []
  });

  if(customContractAddress === this.utils.nullAddress) { return; }

  return this.utils.FormatAddress(customContractAddress);
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
exports.SetCustomContentContract = async function({
  libraryId,
  objectId,
  customContractAddress,
  name,
  description,
  abi,
  factoryAbi,
  overrides={}
}) {
  ValidateParameters({libraryId, objectId});
  customContractAddress = ValidateAddress(customContractAddress);

  customContractAddress = this.utils.FormatAddress(customContractAddress);

  this.Log(`Setting custom contract address: ${objectId} ${customContractAddress}`);

  const setResult = await this.ethClient.SetCustomContentContract({
    contentContractAddress: this.utils.HashToAddress(objectId),
    customContractAddress,
    overrides,
    signer: this.signer
  });

  const writeToken = (await this.EditContentObject({libraryId, objectId})).write_token;

  await this.ReplaceMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: "custom_contract",
    metadata: {
      name,
      description,
      address: customContractAddress,
      abi,
      factoryAbi
    }
  });

  await this.FinalizeContentObject({libraryId, objectId, writeToken, commitMessage: "Set custom contract"});

  return setResult;
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
exports.ExtractEventFromLogs = function({abi, event, eventName}) {
  return this.ethClient.ExtractEventFromLogs({abi, event, eventName});
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
exports.ExtractValueFromEvent = function({abi, event, eventName, eventValue}) {
  const eventLog = this.ethClient.ExtractEventFromLogs({abi, event, eventName, eventValue});
  return eventLog ? eventLog.args[eventValue] : undefined;
};

exports.FormatBlockNumbers = async function({fromBlock, toBlock, count=10}) {
  const latestBlock = await this.BlockNumber();

  if(!toBlock) {
    if(!fromBlock) {
      toBlock = latestBlock;
      fromBlock = toBlock - count + 1;
    } else {
      toBlock = fromBlock + count - 1;
    }
  } else if(!fromBlock) {
    fromBlock = toBlock - count + 1;
  }

  // Ensure block numbers are valid
  if(toBlock > latestBlock) {
    toBlock = latestBlock;
  }

  if(fromBlock < 0) {
    fromBlock = 0;
  }

  return { fromBlock, toBlock };
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
exports.Events = async function({toBlock, fromBlock, count=10, includeTransaction=false}={}) {
  const blocks = await this.FormatBlockNumbers({fromBlock, toBlock, count});

  this.Log(`Querying events - Blocks ${blocks.fromBlock} to ${blocks.toBlock}`);

  return await this.ethClient.Events({
    fromBlock: blocks.fromBlock,
    toBlock: blocks.toBlock,
    includeTransaction
  });
};

/**
 * Retrieve the latest block number on the blockchain
 *
 * @methodGroup Blockchain
 *
 * @returns {Promise<number>} - The latest block number
 */
exports.BlockNumber = async function() {
  return await this.ethClient.MakeProviderCall({methodName: "getBlockNumber"});
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
exports.GetBalance = async function({address}) {
  address = ValidateAddress(address);

  const balance = await this.ethClient.MakeProviderCall({methodName: "getBalance", args: [address]});

  return Ethers.utils.formatEther(balance);
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
exports.SendFunds = async function({recipient, ether}) {
  recipient = ValidateAddress(recipient);

  const transaction = await this.signer.sendTransaction({
    to: recipient,
    value: Ethers.utils.parseEther(ether.toString())
  });

  return await transaction.wait();
};

const GetObjectIDAndContractAddress = async function({contractAddress, objectId, versionHash}){
  if(contractAddress){
    ValidateAddress(contractAddress);
    objectId = Utils.AddressToObjectId(contractAddress);
  } else if(versionHash){
    ValidateVersion(versionHash);
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
    contractAddress = Utils.HashToAddress(objectId);
  } else if(objectId){
    ValidateObject(objectId);
    contractAddress=Utils.HashToAddress(objectId);
  } else {
    throw Error("contractAddress or objectId or versionHash not specified");
  }

  return {
    contractAddress,
    objectId
  };
};

/**
 * Retrieve the ID of the tenant admin group set for the specified object
 *
 * @methodGroup Tenant
 * @namedParams
 * @param {string=} contractAddress - The address of the object
 * @param {string=} objectId - The ID of the object
 * @param {string=} versionHash - A version hash of the object
 *
 * @returns {Promise<string|undefined>}
 */
exports.TenantId = async function({contractAddress, objectId, versionHash}) {

  objectInfo = await GetObjectIDAndContractAddress({contractAddress, objectId, versionHash});
  contractAddress = objectInfo.contractAddress;
  objectId = objectInfo.objectId;

  let tenantId;
  try {
    const hasGetMetaMethod = await this.authClient.ContractHasMethod({
      contractAddress: contractAddress,
      methodName: "getMeta"
    });

    if(hasGetMetaMethod) {
      tenantId = await this.ContractMetadata({
        contractAddress:contractAddress,
        metadataKey:"_tenantId"
      });
    }

    // If the getMeta method does not exist or is not set in the contract, check the fabric metadata.
    if(tenantId === undefined) {
      const libraryId = await this.ContentObjectLibraryId({ objectId });

      tenantId = await this.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "tenantId",
      });
    }
    return tenantId;
  } catch(e) {
    return "";
  }
};

/**
 * Retrieve the ID of the tenant contract for the specified object
 *
 * @methodGroup Tenant
 * @namedParams
 * @param {string=} contractAddress - The address of the object
 * @param {string=} objectId - The ID of the object
 * @param {string=} versionHash - A version hash of the object
 *
 * @returns {Promise<string|undefined>}
 */
exports.TenantContractId = async function({contractAddress, objectId, versionHash}) {

  objectInfo = await GetObjectIDAndContractAddress({contractAddress, objectId, versionHash});
  contractAddress = objectInfo.contractAddress;
  objectId = objectInfo.objectId;

  try {
    const hasGetMetaMethod = await this.authClient.ContractHasMethod({
      contractAddress: contractAddress,
      methodName: "getMeta"
    });
    let tenantContractId;
    if(hasGetMetaMethod) {
      tenantContractId = await this.ContractMetadata({
        contractAddress:contractAddress,
        metadataKey:"_ELV_TENANT_ID"
      });
    }

    // If the getMeta method does not exist or is not set in the contract, check the fabric metadata.
    if(tenantContractId === undefined) {
      const libraryId = await this.ContentObjectLibraryId({ objectId });

      tenantContractId = await this.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "tenantContractId",
      });
    }
    return tenantContractId;
  } catch(e) {
    return "";
  }
};

/**
 * Set the tenant contract ID and tenant admin group ID for the specified object
 * when tenant admin group ID is provided
 *
 * @methodGroup Tenant
 * @namedParams
 * @param {string=} contractAddress - The address of the object
 * @param {string=} objectId - The ID of the object
 * @param {string=} versionHash - A version hash of the object
 * @param {string} tenantContractId - The tenant contract ID to set
 * @param {string} tenantId - The tenant ID to set
 *
 * @returns {Promise<{tenantId: (undefined|string), tenantContractId}>}
 */
exports.SetTenantId = async function({contractAddress, objectId, versionHash, tenantId}) {
  objectInfo = await GetObjectIDAndContractAddress({contractAddress, objectId, versionHash});
  contractAddress = objectInfo.contractAddress;
  objectId = objectInfo.objectId;

  const objectVersion = await this.authClient.AccessType(objectId);
  if(objectVersion !== this.authClient.ACCESS_TYPES.GROUP &&
    objectVersion !== this.authClient.ACCESS_TYPES.WALLET &&
    objectVersion !== this.authClient.ACCESS_TYPES.LIBRARY &&
    objectVersion !== this.authClient.ACCESS_TYPES.TYPE &&
    objectVersion !== this.authClient.ACCESS_TYPES.TENANT) {
    throw Error(`Invalid object ID: ${objectId}, 
    applicable only for wallet,group, library or content_type object.`);
  }

  ValidateObject(tenantId);

  if(!tenantId.startsWith("iten") || !Utils.ValidHash(tenantId)) {
    throw Error(`Invalid tenant ID: ${tenantId}`);
  }

  const version = await this.authClient.AccessType(tenantId);
  if(version !== this.authClient.ACCESS_TYPES.GROUP) {
    throw Error("Invalid tenant ID: " + tenantId);
  }

  // get tenantContractId set for the tenant admin group
  tenantContractId = await this.TenantContractId({
    objectId: tenantId
  });
  if(tenantContractId){
    return await this.SetTenantContractId({
      contractAddress,
      objectId,
      versionHash,
      tenantContractId
    });
  } else {
    throw Error("Invalid tenantId: tenant contract id not found");
  }
};


/**
 * Set the tenant contract ID and tenant admin group ID for the specified object
 * when tenant contract ID is provided
 *
 * @methodGroup Tenant
 * @namedParams
 * @param {string=} contractAddress - The address of the object
 * @param {string=} objectId - The ID of the object
 * @param {string=} versionHash - A version hash of the object
 * @param {string} tenantContractId - The tenant contract ID to set
 *
 * @returns {Promise<{tenantId: (undefined|string), tenantContractId}>}
 */
exports.SetTenantContractId = async function({contractAddress, objectId, versionHash, tenantContractId}) {

  objectInfo = await GetObjectIDAndContractAddress({contractAddress, objectId, versionHash});
  contractAddress = objectInfo.contractAddress;
  objectId = objectInfo.objectId;

  const objectVersion = await this.authClient.AccessType(objectId);
  if(objectVersion !== this.authClient.ACCESS_TYPES.GROUP &&
    objectVersion !== this.authClient.ACCESS_TYPES.WALLET &&
    objectVersion !== this.authClient.ACCESS_TYPES.LIBRARY &&
    objectVersion !== this.authClient.ACCESS_TYPES.TYPE &&
    objectVersion !== this.authClient.ACCESS_TYPES.TENANT) {
    throw Error(`Invalid object ID: ${objectId}, 
    applicable only for wallet,group, library or content_type object.`);
  }

  ValidateObject(tenantContractId);

  if(tenantContractId && (!tenantContractId.startsWith("iten") || !Utils.ValidHash(tenantContractId))) {
    throw Error(`Invalid tenant ID: ${tenantContractId}`);
  }
  const tenantAddress = Utils.HashToAddress(tenantContractId);

  const version = await this.authClient.AccessType(tenantContractId);
  if(version !== this.authClient.ACCESS_TYPES.TENANT) {
    throw Error("Invalid tenant ID: " + tenantContractId);
  }

  // get tenant admin group
  const tenantAdminGroupAddress = await this.CallContractMethod({
    contractAddress: tenantAddress,
    methodName: "groupsMapping",
    methodArgs: ["tenant_admin", 0],
    formatArguments: true,
  });

  const hasPutMetaMethod = await this.authClient.ContractHasMethod({
    contractAddress: contractAddress,
    methodName: "putMeta"
  });

  if(hasPutMetaMethod) {

    await this.ReplaceContractMetadata({
      contractAddress: contractAddress,
      metadataKey: "_ELV_TENANT_ID",
      metadata: tenantContractId
    });

    if(tenantAdminGroupAddress){
      await this.ReplaceContractMetadata({
        contractAddress: contractAddress,
        metadataKey: "_tenantId",
        metadata: `iten${Utils.AddressToHash(tenantAdminGroupAddress)}`
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn("No tenant ID associated with current tenant.");
    }
  } else {
    const libraryId = await this.ContentObjectLibraryId({ objectId });
    const editRequest = await this.EditContentObject({libraryId, objectId});

    await this.MergeMetadata({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      metadata:  {
        tenantContractId,
        tenantId: !tenantAdminGroupAddress ? undefined : `iten${Utils.AddressToHash(tenantAdminGroupAddress)}`
      },
    });

    await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      commitMessage: "set tenant_contract_id"
    });
  }

  return {
    tenantContractId: tenantContractId,
    tenantId: !tenantAdminGroupAddress ? undefined : `iten${Utils.AddressToHash(tenantAdminGroupAddress)}`
  };
};

/**
 * Remove the tenant contract ID and tenant admin group ID for the specified object
 *
 * @methodGroup Tenant
 * @namedParams
 * @param {string=} contractAddress - The address of the object
 * @param {string=} objectId - The ID of the object
 * @param {string=} versionHash - A version hash of the object
 *
 * @returns {Promise<void>}
 */
exports.ResetTenantId = async function({contractAddress, objectId, versionHash}) {

  objectInfo = await GetObjectIDAndContractAddress({contractAddress, objectId, versionHash});
  contractAddress = objectInfo.contractAddress;
  objectId = objectInfo.objectId;

  const objectVersion = await this.authClient.AccessType(objectId);
  if(objectVersion !== this.authClient.ACCESS_TYPES.GROUP &&
    objectVersion !== this.authClient.ACCESS_TYPES.WALLET &&
    objectVersion !== this.authClient.ACCESS_TYPES.LIBRARY &&
    objectVersion !== this.authClient.ACCESS_TYPES.TYPE &&
    objectVersion !== this.authClient.ACCESS_TYPES.TENANT) {
    throw Error(`Invalid object ID: ${objectId}, 
    applicable only for wallet,group, library or content_type object.`);
  }

  let tenantContractId = this.TenantContractId({objectId});
  let tenantId = this.TenantId({objectId});

  if(tenantContractId || tenantId){
    const hasPutMetaMethod = await this.authClient.ContractHasMethod({
      contractAddress: contractAddress,
      methodName: "putMeta"
    });

    if(hasPutMetaMethod) {

      await this.ReplaceContractMetadata({
        contractAddress: contractAddress,
        metadataKey: "_ELV_TENANT_ID",
        metadata: ""
      });

      await this.ReplaceContractMetadata({
        contractAddress: contractAddress,
        metadataKey: "_tenantId",
        metadata: ""
      });

    } else {
      const libraryId = await this.ContentObjectLibraryId({ objectId });
      const editRequest = await this.EditContentObject({libraryId, objectId});

      await this.MergeMetadata({
        libraryId,
        objectId,
        writeToken: editRequest.write_token,
        metadata:  {
          tenantContractId: undefined,
          tenantId: undefined
        },
      });

      await this.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken: editRequest.write_token,
        commitMessage: "remove tenant_contract_id"
      });
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn("No tenant ID associated with current tenant.");
  }
};

/**
 * Enum for object types that can be cleaned up after object deletion.
 * Used by the ObjectCleanup method to determine which associated objects to clean.
 *
 * @property {string=} LIBRARY - Cleanup libraries
 * @property {string=} CONTENT_OBJECT - Cleanup content objects
 * @property {string=} GROUP - Cleanup access groups
 * @property {string=} CONTENT_TYPE - Cleanup content types
 * @property {string=} ALL - Cleanup all of the above
 */
const ObjectTypesToClean = Object.freeze({
  LIBRARY: "library",
  CONTENT_OBJECT: "content_object",
  GROUP: "group",
  CONTENT_TYPE: "content_type",
  ALL: "all"
});

/**
 * Cleans up objects (libraries, content objects, groups or content types)
 * associated with a given user or object
 *
 * @methodGroup Contracts
 * @namedParams
 * @param {string=} contractAddress - The address of the object
 * @param {string=} objectId - The ID of the object
 * @param {string=} versionHash - A version hash of the object
 * @param {string=} objectTypeToClean - The type of object to clean: one of "library", "content_object", "group", "content_type", or "all"
 * @returns {Promise<Object>} - Resolves with an object showing the count of items before and after cleanup.
 *
 * Example return value:
 * {
 *   beforeCleanup: {
 *     librariesLength: 2,
 *     contentObjectsLength: 4,
 *     accessGroupsLength: 1,
 *     contentTypesLength: 3
 *   },
 *   afterCleanup: {
 *     librariesLength: 0,
 *     contentObjectsLength: 0,
 *     accessGroupsLength: 0,
 *     contentTypesLength: 0
 *   }
 * }
 */
exports.ObjectCleanup = async function ({
  contractAddress,
  objectId,
  versionHash,
  objectTypeToClean = ObjectTypesToClean.ALL
}) {
  objectInfo = await GetObjectIDAndContractAddress({contractAddress, objectId, versionHash});
  contractAddress = objectInfo.contractAddress;

  // Check if the contract is a user wallet address
  try {
    await this.client.CallContractMethod({
      contractAddress,
      methodName: "getLibrariesLength",
      formatArguments: false,
    });
  } catch(e) {
    try {
      contractAddress = await this.client.userProfileClient.UserWalletAddress({address: contractAddress});
    } catch(walletError) {
      throw new Error(`Invalid object: ${walletError.message}`);
    }
  }

  const allowedTypes = Object.values(ObjectTypesToClean);
  if(!allowedTypes.includes(objectTypeToClean)) {
    throw Error(`Invalid objectType '${objectTypeToClean}'. Allowed types: ${allowedTypes.join(", ")}`);
  }

  let res = {
    beforeCleanup: {},
    afterCleanup: {}
  };

  const cleanupTasks = {
    [ObjectTypesToClean.LIBRARY]: async () => {
      const before = await this.CallContractMethod({
        contractAddress,
        methodName: "getLibrariesLength",
        formatArguments: false,
      });
      res.beforeCleanup.librariesLength = before.toNumber();

      await this.CallContractMethodAndWait({
        contractAddress,
        methodName: "cleanUpLibraries",
        formatArguments: true,
      });

      const after = await this.CallContractMethod({
        contractAddress,
        methodName: "getLibrariesLength",
        formatArguments: false,
      });
      res.afterCleanup.librariesLength = after.toNumber();
    },

    [ObjectTypesToClean.CONTENT_OBJECT]: async () => {
      const before = await this.CallContractMethod({
        contractAddress,
        methodName: "getContentObjectsLength",
        formatArguments: false,
      });
      res.beforeCleanup.contentObjectsLength = before.toNumber();

      await this.CallContractMethodAndWait({
        contractAddress,
        methodName: "cleanUpContentObjects",
        formatArguments: true,
      });

      const after = await this.CallContractMethod({
        contractAddress,
        methodName: "getContentObjectsLength",
        formatArguments: false,
      });
      res.afterCleanup.contentObjectsLength = after.toNumber();
    },

    [ObjectTypesToClean.GROUP]: async () => {
      let before = await this.CallContractMethod({
        contractAddress,
        methodName: "getAccessGroupsLength",
        formatArguments: false,
      });
      res.beforeCleanup.accessGroupsLength = before.toNumber();

      await this.CallContractMethodAndWait({
        contractAddress,
        methodName: "cleanUpAccessGroups",
        formatArguments: true,
      });

      const after = await this.CallContractMethod({
        contractAddress,
        methodName: "getAccessGroupsLength",
        formatArguments: false,
      });
      res.afterCleanup.accessGroupsLength = after.toNumber();
    },

    [ObjectTypesToClean.CONTENT_TYPE]: async () => {
      const before = await this.CallContractMethod({
        contractAddress,
        methodName: "getContentTypesLength",
        formatArguments: false,
      });
      res.beforeCleanup.contentTypesLength = before.toNumber();

      await this.CallContractMethodAndWait({
        contractAddress,
        methodName: "cleanUpContentTypes",
        formatArguments: true,
      });

      const after = await this.CallContractMethod({
        contractAddress,
        methodName: "getContentTypesLength",
        formatArguments: false,
      });
      res.afterCleanup.contentTypesLength = after.toNumber();
    }
  };

  try {
    if(objectTypeToClean === ObjectTypesToClean.ALL) {
      for(const type of Object.keys(cleanupTasks)) {
        await cleanupTasks[type]();
      }
    } else {
      await cleanupTasks[objectTypeToClean]();
    }
  } catch(e) {
    throw new Error(`Error during cleanup of '${objectTypeToClean}': ${e.message}`);
  }
  return res;
};

