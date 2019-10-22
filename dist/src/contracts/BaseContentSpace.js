"use strict";

var contract = {
  "abi": [{
    "constant": true,
    "inputs": [],
    "name": "parentAddress",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "creator",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{
      "name": "",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "_candidate",
      "type": "address"
    }],
    "name": "canContribute",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "content_type",
      "type": "address"
    }, {
      "name": "content_contract",
      "type": "address"
    }],
    "name": "addContentType",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "canConfirm",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_locator",
      "type": "bytes"
    }],
    "name": "submitNode",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "address"
    }],
    "name": "contentTypeContracts",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "typeHash",
      "type": "bytes32"
    }],
    "name": "findTypeByHash",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "candidate",
      "type": "address"
    }],
    "name": "canNodePublish",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "_kmsID",
      "type": "string"
    }, {
      "name": "prefix",
      "type": "bytes"
    }],
    "name": "getKMSInfo",
    "outputs": [{
      "name": "",
      "type": "string"
    }, {
      "name": "",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "address"
    }],
    "name": "canReview",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "content_type",
      "type": "address"
    }],
    "name": "validType",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "contentObj",
      "type": "address"
    }],
    "name": "publish",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "registerSpaceNode",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "addressKMS",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "countVersionHashes",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "requiresReview",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "address_KMS",
      "type": "address"
    }],
    "name": "createLibrary",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "kill",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "numActiveNodes",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "libraryFactory",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "confirmCommit",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "activeNodeLocators",
    "outputs": [{
      "name": "",
      "type": "bytes"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "activeNodeAddresses",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "version",
    "outputs": [{
      "name": "",
      "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "createGroup",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_user",
      "type": "address"
    }],
    "name": "createUserGuarantorWallet",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "_kmsAddr",
      "type": "address"
    }],
    "name": "getKMSID",
    "outputs": [{
      "name": "",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "new_factory",
      "type": "address"
    }],
    "name": "setFactory",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "pendingHash",
    "outputs": [{
      "name": "",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "address"
    }],
    "name": "userWallets",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_nodeAddr",
      "type": "address"
    }, {
      "name": "_locator",
      "type": "bytes"
    }],
    "name": "addNode",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_kmsID",
      "type": "string"
    }, {
      "name": "_locator",
      "type": "bytes"
    }],
    "name": "addKMSLocator",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "pendingNodeLocators",
    "outputs": [{
      "name": "",
      "type": "bytes"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "pendingNodeAddresses",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "newCreator",
      "type": "address"
    }],
    "name": "transferCreatorship",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "canCommit",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "description",
    "outputs": [{
      "name": "",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "createAccessWallet",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "versionTimestamp",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "versionHashes",
    "outputs": [{
      "name": "",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "new_factory",
      "type": "address"
    }],
    "name": "setWalletFactory",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "new_factory",
      "type": "address"
    }],
    "name": "setGroupFactory",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "new_factory",
      "type": "address"
    }],
    "name": "setContentFactory",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "_kmsIdStr",
      "type": "string"
    }],
    "name": "checkKMS",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "contentFactory",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "content_space_description",
      "type": "string"
    }],
    "name": "setDescription",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "address"
    }],
    "name": "hasAccess",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_objectHash",
      "type": "string"
    }],
    "name": "commit",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "contentTypes",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "_candidate",
      "type": "address"
    }],
    "name": "canPublish",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "content_type",
      "type": "address"
    }],
    "name": "whitelistedType",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "new_factory",
      "type": "address"
    }],
    "name": "setLibraryFactory",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "getAccessWallet",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_kmsID",
      "type": "string"
    }, {
      "name": "_pubKey",
      "type": "string"
    }],
    "name": "setKMSPublicKey",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "unregisterSpaceNode",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "key",
      "type": "bytes"
    }],
    "name": "getMeta",
    "outputs": [{
      "name": "",
      "type": "bytes"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "contentSpace",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "groupFactory",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_nodeAddr",
      "type": "address"
    }],
    "name": "removeNode",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "createContentType",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "lib",
      "type": "address"
    }, {
      "name": "content_type",
      "type": "address"
    }],
    "name": "createContent",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "updateRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "factory",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "walletFactory",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "contentTypesLength",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "engageAccountLibrary",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "address_KMS",
      "type": "address"
    }],
    "name": "setAddressKMS",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "_kmsAddr",
      "type": "address"
    }],
    "name": "checkKMSAddr",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_nodeAddr",
      "type": "address"
    }],
    "name": "approveNode",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "objectHash",
    "outputs": [{
      "name": "",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_versionHash",
      "type": "string"
    }],
    "name": "deleteVersion",
    "outputs": [{
      "name": "",
      "type": "int256"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "key",
      "type": "bytes"
    }, {
      "name": "value",
      "type": "bytes"
    }],
    "name": "putMeta",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_v",
      "type": "uint8[]"
    }, {
      "name": "_r",
      "type": "bytes32[]"
    }, {
      "name": "_s",
      "type": "bytes32[]"
    }, {
      "name": "_from",
      "type": "address[]"
    }, {
      "name": "_dest",
      "type": "address[]"
    }, {
      "name": "_value",
      "type": "uint256[]"
    }, {
      "name": "_ts",
      "type": "uint256[]"
    }],
    "name": "executeBatch",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "accessRequest",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "newOwner",
      "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "numPendingNodes",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "address"
    }],
    "name": "nodeMapping",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "content_type",
      "type": "address"
    }],
    "name": "removeContentType",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_kmsID",
      "type": "string"
    }, {
      "name": "_locator",
      "type": "bytes"
    }],
    "name": "removeKMSLocator",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "name": "content_space_name",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  }, {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "contentTypeAddress",
      "type": "address"
    }],
    "name": "CreateContentType",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "libraryAddress",
      "type": "address"
    }],
    "name": "CreateLibrary",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "groupAddress",
      "type": "address"
    }],
    "name": "CreateGroup",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "contentAddress",
      "type": "address"
    }],
    "name": "CreateContent",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "wallet",
      "type": "address"
    }],
    "name": "CreateAccessWallet",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "accountAddress",
      "type": "address"
    }],
    "name": "EngageAccountLibrary",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "factory",
      "type": "address"
    }],
    "name": "SetFactory",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "nodeObjAddr",
      "type": "address"
    }],
    "name": "RegisterNode",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "nodeObjAddr",
      "type": "address"
    }],
    "name": "UnregisterNode",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "sender",
      "type": "address"
    }, {
      "indexed": false,
      "name": "status",
      "type": "uint256"
    }],
    "name": "AddKMSLocator",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "sender",
      "type": "address"
    }, {
      "indexed": false,
      "name": "status",
      "type": "uint256"
    }],
    "name": "RemoveKMSLocator",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "version",
      "type": "bytes32"
    }, {
      "indexed": false,
      "name": "owner",
      "type": "address"
    }],
    "name": "CreateSpace",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "walletAddress",
      "type": "address"
    }],
    "name": "GetAccessWallet",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "addr",
      "type": "address"
    }, {
      "indexed": false,
      "name": "locator",
      "type": "bytes"
    }],
    "name": "NodeSubmitted",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "addr",
      "type": "address"
    }, {
      "indexed": false,
      "name": "locator",
      "type": "bytes"
    }],
    "name": "NodeApproved",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "ownerAddr",
      "type": "address"
    }, {
      "indexed": false,
      "name": "nodeAddr",
      "type": "address"
    }],
    "name": "AddNode",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "ownerAddr",
      "type": "address"
    }, {
      "indexed": false,
      "name": "nodeAddr",
      "type": "address"
    }],
    "name": "RemoveNode",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "contentType",
      "type": "address"
    }, {
      "indexed": false,
      "name": "contentContract",
      "type": "address"
    }],
    "name": "ContentTypeAdded",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "contentType",
      "type": "address"
    }],
    "name": "ContentTypeRemoved",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "spaceAddress",
      "type": "address"
    }, {
      "indexed": false,
      "name": "parentAddress",
      "type": "address"
    }, {
      "indexed": false,
      "name": "objectHash",
      "type": "string"
    }],
    "name": "CommitPending",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "objectHash",
      "type": "string"
    }],
    "name": "UpdateRequest",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "spaceAddress",
      "type": "address"
    }, {
      "indexed": false,
      "name": "objectHash",
      "type": "string"
    }],
    "name": "VersionConfirm",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "spaceAddress",
      "type": "address"
    }, {
      "indexed": false,
      "name": "versionHash",
      "type": "string"
    }, {
      "indexed": false,
      "name": "index",
      "type": "int256"
    }],
    "name": "VersionDelete",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [],
    "name": "AccessRequest",
    "type": "event"
  }],
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c00000000000000000060009081557f41636365737369626c6532303139303232323133353930304d4c0000000000006006557f4564697461626c6532303139303830313133353530304d4c00000000000000006007557f436f6e7461696e657232303139303532393039313830304d4c00000000000000600d556010557f55736572537061636532303139303530363135353330304d4c000000000000006012557f4e6f6465537061636532303139303532383137303130304d4c000000000000006014557f42617365436f6e74656e74537061636532303139303830313134303430304d4c6019553480156200011257600080fd5b5060405162005a5538038062005a558339810160405280516001805432600160a060020a031991821681179092556002805490911690911790550180516200016290601a906020840190620001c6565b5060038054600160a060020a0319163017905560195460025460408051928352600160a060020a0391909116602083015280517f599bb380c80b69455450a615c515544b8da3b09f2efa116a5f0567682203cf549281900390910190a1506200026b565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200020957805160ff191683800117855562000239565b8280016001018555821562000239579182015b82811115620002395782518255916020019190600101906200021c565b50620002479291506200024b565b5090565b6200026891905b8082111562000247576000815560010162000252565b90565b6157da806200027b6000396000f3006080604052600436106103a15763ffffffff60e060020a600035041662821de381146103a357806302d05d3f146103d457806306fdde03146103e95780630eaec2c5146104735780630f58a786146104a857806314cfabb3146104cf578063160eee74146104e45780631cdbee5a1461053d5780631f2caaec1461055e57806326683e1414610576578063268bfac41461059757806329d002191461070c57806329dedde51461072d5780632cf994221461074e5780632f7a781a1461076f57806332eaf21b14610784578063331b86c0146107995780633dd71d99146107c057806340b89f06146107d557806341c0e1b5146107f657806343f59ec71461080b578063441c5aa314610820578063446e8826146108355780635272ae171461083d57806352f82dd81461085557806354fd4d501461086d578063575185ed146108825780635834028d14610897578063589aafc1146108b85780635bb47808146108d9578063628449fd146108fa57806363e6ffdd1461090f57806364f0f05014610930578063653a92f61461099757806369e30ff814610a2e5780636be9514c14610a465780636d2e4b1b14610a5e5780636e37542714610a7f5780637284e41614610a945780637708bc4114610aa95780637886f74714610abe5780637ca8f61814610ad65780637ebf879c14610aee578063837b3b9314610b0f57806385ce1df114610b305780638d2a23db14610b515780638da5cb5b14610baa578063904696a814610bbf57806390c3f38f14610bd457806395a078e814610c2d5780639867db7414610c4e578063991a3a7c14610ca75780639b55f901146104735780639cb121ba14610cbf5780639d05d18d14610ce0578063a2d67fcf14610d01578063a69cb73414610d16578063abe596b114610dad578063ac55c90614610dc2578063af570c0414610e1b578063b04b6caa14610e30578063b2b99ec914610e45578063b8cfaf0514610e66578063bf4e088f14610e7b578063c287e0ed14610ea2578063c45a015514610eb7578063c5c0369914610ecc578063c65bcbe214610ee1578063c82710c114610ef6578063c9e8e72d14610f0b578063d6be0f4914610f2c578063dd4c97a014610f4d578063e02dd9c214610f6e578063e1a7071714610f83578063e542b7cb14610fdc578063e9861ab114611073578063f15518871461121e578063f2fde38b14611233578063f41a158714611254578063fbd1b4ce14611269578063fd0891961461128a578063fe7ac19f146112ab575b005b3480156103af57600080fd5b506103b8611342565b60408051600160a060020a039092168252519081900360200190f35b3480156103e057600080fd5b506103b8611352565b3480156103f557600080fd5b506103fe611361565b6040805160208082528351818301528351919283929083019185019080838360005b83811015610438578181015183820152602001610420565b50505050905090810190601f1680156104655780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561047f57600080fd5b50610494600160a060020a03600435166113ef565b604080519115158252519081900360200190f35b3480156104b457600080fd5b506103a1600160a060020a0360043581169060243516611420565b3480156104db57600080fd5b50610494611595565b3480156104f057600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103a19436949293602493928401919081908401838280828437509497506115a59650505050505050565b34801561054957600080fd5b506103b8600160a060020a0360043516611958565b34801561056a57600080fd5b506103b8600435611973565b34801561058257600080fd5b50610494600160a060020a0360043516611bf7565b3480156105a357600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261062e94369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750611c559650505050505050565b604051808060200180602001838103835285818151815260200191508051906020019080838360005b8381101561066f578181015183820152602001610657565b50505050905090810190601f16801561069c5780820380516001836020036101000a031916815260200191505b50838103825284518152845160209182019186019080838360005b838110156106cf5781810151838201526020016106b7565b50505050905090810190601f1680156106fc5780820380516001836020036101000a031916815260200191505b5094505050505060405180910390f35b34801561071857600080fd5b50610494600160a060020a036004351661209e565b34801561073957600080fd5b50610494600160a060020a03600435166120a4565b34801561075a57600080fd5b50610494600160a060020a03600435166120c2565b34801561077b57600080fd5b506103b86121e2565b34801561079057600080fd5b506103b861235c565b3480156107a557600080fd5b506107ae61236b565b60408051918252519081900360200190f35b3480156107cc57600080fd5b50610494612371565b3480156107e157600080fd5b506103b8600160a060020a0360043516612376565b34801561080257600080fd5b506103a1612451565b34801561081757600080fd5b506107ae61248d565b34801561082c57600080fd5b506103b8612493565b6104946124a2565b34801561084957600080fd5b506103fe600435612677565b34801561086157600080fd5b506103b86004356126eb565b34801561087957600080fd5b506107ae612713565b34801561088e57600080fd5b506103b8612719565b3480156108a357600080fd5b50610494600160a060020a03600435166127e3565b3480156108c457600080fd5b506103fe600160a060020a036004351661297f565b3480156108e557600080fd5b506103a1600160a060020a0360043516612992565b34801561090657600080fd5b506103fe6129e2565b34801561091b57600080fd5b506103b8600160a060020a0360043516612a3d565b34801561093c57600080fd5b5060408051602060046024803582810135601f81018590048502860185019096528585526103a1958335600160a060020a0316953695604494919390910191908190840183828082843750949750612a589650505050505050565b3480156109a357600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261049494369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750612c9d9650505050505050565b348015610a3a57600080fd5b506103fe600435613000565b348015610a5257600080fd5b506103b860043561300e565b348015610a6a57600080fd5b506103a1600160a060020a036004351661301c565b348015610a8b57600080fd5b5061049461306a565b348015610aa057600080fd5b506103fe61307b565b348015610ab557600080fd5b506103b86130d6565b348015610aca57600080fd5b506107ae6004356130e1565b348015610ae257600080fd5b506103fe600435613100565b348015610afa57600080fd5b506103a1600160a060020a036004351661310e565b348015610b1b57600080fd5b506103a1600160a060020a036004351661315e565b348015610b3c57600080fd5b506103a1600160a060020a03600435166131ae565b348015610b5d57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526107ae9436949293602493928401919081908401838280828437509497506131fe9650505050505050565b348015610bb657600080fd5b506103b8613266565b348015610bcb57600080fd5b506103b8613275565b348015610be057600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103a19436949293602493928401919081908401838280828437509497506132849650505050505050565b348015610c3957600080fd5b50610494600160a060020a03600435166132c9565b348015610c5a57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103a19436949293602493928401919081908401838280828437509497506132cf9650505050505050565b348015610cb357600080fd5b506103b86004356133df565b348015610ccb57600080fd5b50610494600160a060020a03600435166133ed565b348015610cec57600080fd5b506103a1600160a060020a0360043516613444565b348015610d0d57600080fd5b506103b8613494565b348015610d2257600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103a194369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506135209650505050505050565b348015610db957600080fd5b506104946135c7565b348015610dce57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103fe9436949293602493928401919081908401838280828437509497506136be9650505050505050565b348015610e2757600080fd5b506103b861386c565b348015610e3c57600080fd5b506103b861387b565b348015610e5157600080fd5b506103a1600160a060020a036004351661388a565b348015610e7257600080fd5b506103b8613956565b348015610e8757600080fd5b506103b8600160a060020a0360043581169060243516613a1d565b348015610eae57600080fd5b506103a1613b01565b348015610ec357600080fd5b506103b8613bd7565b348015610ed857600080fd5b506103b8613be6565b348015610eed57600080fd5b506107ae613bf5565b348015610f0257600080fd5b506103b8613bfb565b348015610f1757600080fd5b506103a1600160a060020a0360043516613c35565b348015610f3857600080fd5b506107ae600160a060020a0360043516613c85565b348015610f5957600080fd5b506103a1600160a060020a0360043516613cfb565b348015610f7a57600080fd5b506103fe613f3c565b348015610f8f57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526107ae943694929360249392840191908190840183828082843750949750613f979650505050505050565b348015610fe857600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103a194369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a99988101979196509182019450925082915084018382808284375094975061453f9650505050505050565b34801561107f57600080fd5b50604080516020600480358082013583810280860185019096528085526103a195369593946024949385019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506146279650505050505050565b34801561122a57600080fd5b5061049461482d565b34801561123f57600080fd5b506103a1600160a060020a036004351661485e565b34801561126057600080fd5b506107ae6148c3565b34801561127557600080fd5b506103b8600160a060020a03600435166148c9565b34801561129657600080fd5b50610494600160a060020a03600435166148e4565b3480156112b757600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261049494369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750614a879650505050505050565b600354600160a060020a03165b90565b600154600160a060020a031681565b601a805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113e75780601f106113bc576101008083540402835291602001916113e7565b820191906000526020600020905b8154815290600101906020018083116113ca57829003601f168201915b505050505081565b600254600090600160a060020a03838116911614806114185750600254600160a060020a031633145b90505b919050565b600254600160a060020a03163214806114435750600254600160a060020a031633145b151561144e57600080fd5b600160a060020a038083166000908152601160205260409020541615801561147c575061147a826133ed565b155b1561152857600f5460105410156114d25781600f60105481548110151561149f57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a0316021790555061151e565b600f80546001810182556000919091527f8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac802018054600160a060020a031916600160a060020a0384161790555b6010805460010190555b600160a060020a038281166000818152601160209081526040918290208054600160a060020a0319169486169485179055815192835282019290925281517f280016f7418306a55542432120fd1a239ef9fcc1a92694d8d44ca76be0249ea7929181900390910190a15050565b60006115a033611bf7565b905090565b6116db60178054806020026020016040519081016040528092919081815260200182805480156115fe57602002820191906000526020600020905b8154600160a060020a031681526001909101906020018083116115e0575b50505050506018805480602002602001604051908101604052809291908181526020016000905b828210156116d05760008481526020908190208301805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156116bc5780601f10611691576101008083540402835291602001916116bc565b820191906000526020600020905b81548152906001019060200180831161169f57829003601f168201915b505050505081526020019060010190611625565b505050503384614f15565b156116e557600080fd5b611810601580548060200260200160405190810160405280929190818152602001828054801561173e57602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311611720575b50505050506016805480602002602001604051908101604052809291908181526020016000905b828210156116d05760008481526020908190208301805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156117fc5780601f106117d1576101008083540402835291602001916117fc565b820191906000526020600020905b8154815290600101906020018083116117df57829003601f168201915b505050505081526020019060010190611765565b1561181a57600080fd5b60175460641161182957600080fd5b6018805460018101808355600092909252825161186d917fb13d2d76d1f4b7be834882e410b3e3a8afaf69f83600ae24db354391d2378d2e019060208501906155ac565b50506017805460018101825560009182527fc624b66cc0138b8fabc209247f72d758e1cf3343756d543badbf24212bed8c15018054600160a060020a0319163390811790915560408051828152602081810183815286519383019390935285517fae5645569f32b946f7a747113c64094a29a6b84c5ddf55816ef4381ce8a3a46d958794926060850192908601918190849084905b8381101561191a578181015183820152602001611902565b50505050905090810190601f1680156119475780820380516001836020036101000a031916815260200191505b50935050505060405180910390a150565b601160205260009081526040902054600160a060020a031681565b600080805b600f54821015611beb57600f80548390811061199057fe5b6000918252602091829020015460408051808401889052815180820385018152908201918290528051600160a060020a03909316945092909182918401908083835b602083106119f15780518252601f1990920191602091820191016119d2565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390206000191681600160a060020a031663e02dd9c26040518163ffffffff1660e060020a028152600401600060405180830381600087803b158015611a6057600080fd5b505af1158015611a74573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526020811015611a9d57600080fd5b810190808051640100000000811115611ab557600080fd5b82016020810184811115611ac857600080fd5b8151640100000000811182820187101715611ae257600080fd5b50509291905050506040516020018082805190602001908083835b60208310611b1c5780518252601f199092019160209182019101611afd565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b60208310611b7f5780518252601f199092019160209182019101611b60565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415611be057600f805483908110611bc457fe5b600091825260209091200154600160a060020a03169250611bf0565b600190910190611978565b600092505b5050919050565b6000805b601554811015611c4a5782600160a060020a0316601582815481101515611c1e57fe5b600091825260209091200154600160a060020a03161415611c425760019150611c4f565b600101611bfb565b600091505b50919050565b60608060608060608060006022896040518082805190602001908083835b60208310611c925780518252601f199092019160209182019101611c73565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015611d825760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015611d6e5780601f10611d4357610100808354040283529160200191611d6e565b820191906000526020600020905b815481529060010190602001808311611d5157829003601f168201915b505050505081526020019060010190611cd7565b5050505094506023896040518082805190602001908083835b60208310611dba5780518252601f199092019160209182019101611d9b565b518151600019602094850361010090810a820192831692199390931691909117909252949092019687526040805197889003820188208054601f6002600183161590980290950116959095049283018290048202880182019052818752929450925050830182828015611e6e5780601f10611e4357610100808354040283529160200191611e6e565b820191906000526020600020905b815481529060010190602001808311611e5157829003601f168201915b50505050509350845160001415611e9b578360206040519081016040528060008152509096509650612092565b611ea58589615063565b9250600090505b825181101561208b576001835103811415611f9057818382815181101515611ed057fe5b906020019060200201516040516020018083805190602001908083835b60208310611f0c5780518252601f199092019160209182019101611eed565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310611f545780518252601f199092019160209182019101611f35565b6001836020036101000a038019825116818451168082178552505050505050905001925050506040516020818303038152906040529150612083565b818382815181101515611f9f57fe5b906020019060200201516040516020018083805190602001908083835b60208310611fdb5780518252601f199092019160209182019101611fbc565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b602083106120235780518252601f199092019160209182019101612004565b6001836020036101000a038019825116818451168082178552505050505050905001807f2c000000000000000000000000000000000000000000000000000000000000008152506001019250505060405160208183030381529060405291505b600101611eac565b8184965096505b50505050509250929050565b50600090565b6000601054600014156120b95750600161141b565b611418826133ed565b60008033600160a060020a038416146120da57600080fd5b82905080600160a060020a0316638280dd8f60006040518263ffffffff1660e060020a02815260040180828152602001915050602060405180830381600087803b15801561212757600080fd5b505af115801561213b573d6000803e3d6000fd5b505050506040513d602081101561215157600080fd5b5050604080517f27c1c21d0000000000000000000000000000000000000000000000000000000081529051600160a060020a038316916327c1c21d9160048083019260209291908290030181600087803b1580156121ae57600080fd5b505af11580156121c2573d6000803e3d6000fd5b505050506040513d60208110156121d857600080fd5b5051159392505050565b3360009081526021602052604081205481908190600160a060020a03161561220957600080fd5b600091505b60155482101561225457601580543391908490811061222957fe5b600091825260209091200154600160a060020a0316141561224957612254565b60019091019061220e565b601554821061226257600080fd5b601c54604080517f5c6dc2190000000000000000000000000000000000000000000000000000000081523360048201529051600160a060020a0390921691635c6dc219916024808201926020929091908290030181600087803b1580156122c857600080fd5b505af11580156122dc573d6000803e3d6000fd5b505050506040513d60208110156122f257600080fd5b5051336000908152602160209081526040918290208054600160a060020a031916600160a060020a038516908117909155825190815291519293507f4575facd117046c9c28b69a3eb9c08939f2462a5a22ea6c6dcd4f79b8dd124e992918290030190a192915050565b600e54600160a060020a031681565b600a5490565b600090565b601f54604080517f40b89f06000000000000000000000000000000000000000000000000000000008152600160a060020a0384811660048301529151600093849316916340b89f0691602480830192602092919082900301818787803b1580156123df57600080fd5b505af11580156123f3573d6000803e3d6000fd5b505050506040513d602081101561240957600080fd5b505160408051600160a060020a038316815290519192507f473c07a6d0228c4fb8fe2be3b4617c3b5fb7c0f8cd9ba4b67e8631844b9b6571919081900360200190a192915050565b600254600160a060020a03163214806124745750600254600160a060020a031633145b151561247f57600080fd5b600254600160a060020a0316ff5b60165490565b601f54600160a060020a031681565b60006124ac611595565b15156124b757600080fd5b60006008805460018160011615610100020316600290049050111561256657600a805460018181018084556000939093526008805461252d937fc65a7bb8d6351c1cf70c95a316cc6a92839c986682d98bc35f958f4883f9d2a80192600261010091831615919091026000190190911604615626565b5050600954600b80546001810182556000919091527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db901555b600c80546125899160089160026000196101006001841615020190911604615626565b50426009556040805160208101918290526000908190526125ac91600c916155ac565b5060035460408051600160a060020a039092168083526020830182815260088054600260001960018316156101000201909116049385018490527f482875da75e6d9f93f74a5c1a61f14cf08822057c01232f44cb92ae998e30d8e949293909291906060830190849080156126625780601f1061263757610100808354040283529160200191612662565b820191906000526020600020905b81548152906001019060200180831161264557829003601f168201915b5050935050505060405180910390a150600190565b601680548290811061268557fe5b600091825260209182902001805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152935090918301828280156113e75780601f106113bc576101008083540402835291602001916113e7565b60158054829081106126f957fe5b600091825260209091200154600160a060020a0316905081565b60195481565b600080601d60009054906101000a9004600160a060020a0316600160a060020a031663575185ed6040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561276f57600080fd5b505af1158015612783573d6000803e3d6000fd5b505050506040513d602081101561279957600080fd5b505160408051600160a060020a038316815290519192507fa3b1fe71ae61bad8cffa485b230e24e518938f76182a30fa0d9979e7237ad159919081900360200190a18091505b5090565b600160a060020a0380821660009081526013602052604081205490918291829116156128125760009250611bf0565b601e60009054906101000a9004600160a060020a0316600160a060020a0316637708bc416040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561286557600080fd5b505af1158015612879573d6000803e3d6000fd5b505050506040513d602081101561288f57600080fd5b5051604080517ff2fde38b000000000000000000000000000000000000000000000000000000008152600160a060020a03878116600483015291519294508493509083169163f2fde38b9160248082019260009290919082900301818387803b1580156128fb57600080fd5b505af115801561290f573d6000803e3d6000fd5b505050600160a060020a038086166000908152601360209081526040918290208054938716600160a060020a031990941684179055815192835290517f56c4bf13bebaa9f2be39ac3f2f4619a0dd1b694bb8c5f43c6b244a6dba0f0cca9350918290030190a15060019392505050565b606061141861298c615168565b8361516d565b600254600160a060020a03163214806129b55750600254600160a060020a031633145b15156129c057600080fd5b601c8054600160a060020a031916600160a060020a0392909216919091179055565b600c805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113e75780601f106113bc576101008083540402835291602001916113e7565b601360205260009081526040902054600160a060020a031681565b600254600160a060020a0316321480612a7b5750600254600160a060020a031633145b1515612a8657600080fd5b612bbc6015805480602002602001604051908101604052809291908181526020018280548015612adf57602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311612ac1575b50505050506016805480602002602001604051908101604052809291908181526020016000905b82821015612bb15760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015612b9d5780601f10612b7257610100808354040283529160200191612b9d565b820191906000526020600020905b815481529060010190602001808311612b8057829003601f168201915b505050505081526020019060010190612b06565b505050508484614f15565b15612bc657600080fd5b6015805460018082019092557f55f448fdea98c4d29eb340757ef0a66cd03dbb9538908a6a81d96026b71ec475018054600160a060020a031916600160a060020a0385161790556016805491820180825560009190915282519091612c54917fd833147d7dc355ba459fc788f669e58cfaf9dc25ddcd0702e87d69c7b51242899091019060208501906155ac565b505060408051338152600160a060020a038416602082015281517f2bb0f9ba138ffddb5a8f974e9885b65a7814d3002654f1cf3f2d3f619a4006c4929181900390910190a15050565b6002546000906060908290600160a060020a0316321480612cc85750600254600160a060020a031633145b1515612cd357600080fd5b6022856040518082805190602001908083835b60208310612d055780518252601f199092019160209182019101612ce6565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015612df55760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015612de15780601f10612db657610100808354040283529160200191612de1565b820191906000526020600020905b815481529060010190602001808311612dc457829003601f168201915b505050505081526020019060010190612d4a565b505050509150600090505b8151811015612f3157836040518082805190602001908083835b60208310612e395780518252601f199092019160209182019101612e1a565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912085519093508592508491508110612e7557fe5b906020019060200201516040518082805190602001908083835b60208310612eae5780518252601f199092019160209182019101612e8f565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415612f2957604080513381526001602082015281517fdf8127994c229011ce9c4764bdc0375bb71c06cf1544f034cd81a42f37233319929181900390910190a160009250612ff8565b600101612e00565b6022856040518082805190602001908083835b60208310612f635780518252601f199092019160209182019101612f44565b51815160209384036101000a600019018019909216911617905292019485525060405193849003810190932080546001810180835560009283529185902089519295612fb69550910192508801906155ac565b5050604080513381526000602082015281517fdf8127994c229011ce9c4764bdc0375bb71c06cf1544f034cd81a42f37233319929181900390910190a1600192505b505092915050565b601880548290811061268557fe5b60178054829081106126f957fe5b600154600160a060020a0316321461303357600080fd5b600160a060020a038116151561304857600080fd5b60018054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a0316321490565b601b805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113e75780601f106113bc576101008083540402835291602001916113e7565b60006115a0326151e5565b600b8054829081106130ef57fe5b600091825260209091200154905081565b600a80548290811061268557fe5b600254600160a060020a03163214806131315750600254600160a060020a031633145b151561313c57600080fd5b601e8054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a03163214806131815750600254600160a060020a031633145b151561318c57600080fd5b601d8054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a03163214806131d15750600254600160a060020a031633145b15156131dc57600080fd5b60208054600160a060020a031916600160a060020a0392909216919091179055565b60006022826040518082805190602001908083835b602083106132325780518252601f199092019160209182019101613213565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922054949350505050565b600254600160a060020a031681565b602054600160a060020a031681565b600254600160a060020a03163214806132a75750600254600160a060020a031633145b15156132b257600080fd5b80516132c590601b9060208401906155ac565b5050565b50600190565b6132d761306a565b15156132e257600080fd5b80516080116132f057600080fd5b805161330390600c9060208401906155ac565b506003547fb3ac059d88af6016aca1aebb7b3e796f2e7420435c59c563687814e9b85daa7590600160a060020a031661333a611342565b60408051600160a060020a038085168252831660208201526060918101828152600c805460026000196101006001841615020190911604938301849052926080830190849080156133cc5780601f106133a1576101008083540402835291602001916133cc565b820191906000526020600020905b8154815290600101906020018083116133af57829003601f168201915b505094505050505060405180910390a150565b600f8054829081106126f957fe5b600080805b60105481101561343d5783600160a060020a0316600f8281548110151561341557fe5b600091825260209091200154600160a060020a0316141561343557600191505b6001016133f2565b5092915050565b600254600160a060020a03163214806134675750600254600160a060020a031633145b151561347257600080fd5b601f8054600160a060020a031916600160a060020a0392909216919091179055565b326000908152601360205260408120548190600160a060020a031615156134c4576134bd6130d6565b90506134df565b5032600090815260136020526040902054600160a060020a03165b60408051600160a060020a038316815290517f1c917c3c2698bd5b98acb9772728da62f2ce3670e4578910a6465b955f63e1579181900360200190a1919050565b600254600160a060020a03163214806135435750600254600160a060020a031633145b151561354e57600080fd5b806023836040518082805190602001908083835b602083106135815780518252601f199092019160209182019101613562565b51815160209384036101000a600019018019909216911617905292019485525060405193849003810190932084516135c295919491909101925090506155ac565b505050565b336000908152602160205260408120548190600160a060020a031615156135ed57600080fd5b50336000908152602160205260408082208054600160a060020a0319811690915581517f41c0e1b50000000000000000000000000000000000000000000000000000000081529151600160a060020a039091169283926341c0e1b5926004808301939282900301818387803b15801561366557600080fd5b505af1158015613679573d6000803e3d6000fd5b505060408051600160a060020a038516815290517fb98695ab4c6cedb3b4dfe62479a9d39a59aa2cb38b8bd92bbb6ce5856e42bdf49350908190036020019150a15090565b60606000806020845111151561377857505081518083015160008181526004602090815260409182902080548351601f60026101006001851615026000190190931692909204918201849004840281018401909452808452939493909183018282801561376c5780601f106137415761010080835404028352916020019161376c565b820191906000526020600020905b81548152906001019060200180831161374f57829003601f168201915b50505050509250611bf0565b6005846040518082805190602001908083835b602083106137aa5780518252601f19909201916020918201910161378b565b518151600019602094850361010090810a820192831692199390931691909117909252949092019687526040805197889003820188208054601f600260018316159098029095011695909504928301829004820288018201905281875292945092505083018282801561385e5780601f106138335761010080835404028352916020019161385e565b820191906000526020600020905b81548152906001019060200180831161384157829003601f168201915b505050505092505050919050565b600354600160a060020a031681565b601d54600160a060020a031681565b600254600090600160a060020a03163214806138b05750600254600160a060020a031633145b15156138bb57600080fd5b5060005b6015548110156132c55781600160a060020a03166015828154811015156138e257fe5b600091825260209091200154600160a060020a0316141561394e5761390a816015601661538f565b60408051338152600160a060020a038416602082015281517f41ec5b9efdbf61871df6a18b687e04bea93d5793af5f8c8b4626e155b23dc19d929181900390910190a15b6001016138bf565b600080601c60009054906101000a9004600160a060020a0316600160a060020a031663b8cfaf056040518163ffffffff1660e060020a028152600401602060405180830381600087803b1580156139ac57600080fd5b505af11580156139c0573d6000803e3d6000fd5b505050506040513d60208110156139d657600080fd5b505160408051600160a060020a038316815290519192507f9e69777f30c55126be256664fa7beff4b796ac32ebceab94df5071b0148017f8919081900360200190a1919050565b60208054604080517fbf4e088f000000000000000000000000000000000000000000000000000000008152600160a060020a038681166004830152858116602483015291516000948594939093169263bf4e088f926044808201939182900301818787803b158015613a8e57600080fd5b505af1158015613aa2573d6000803e3d6000fd5b505050506040513d6020811015613ab857600080fd5b505160408051600160a060020a038316815290519192507fa0633ea0b3cb5796607e5f551ae79c7eeee0dc7ee0c3ff8996506261651368ce919081900360200190a19392505050565b600254600160a060020a0316331480613b1d5750613b1d611595565b1515613b2857600080fd5b60408051602080825260088054600260001961010060018416150201909116049183018290527f403f30aa5f4f2f89331a7b50054f64a00ce206f4d0a37f566ff344bbe46f8b6593909291829182019084908015613bc75780601f10613b9c57610100808354040283529160200191613bc7565b820191906000526020600020905b815481529060010190602001808311613baa57829003601f168201915b50509250505060405180910390a1565b601c54600160a060020a031681565b601e54600160a060020a031681565b60105481565b6040805132815290516000917f53ce35a7383a3ea3f695bdf0f87d7e5485ba816b382673e849bfdd24e7f5e3ca919081900360200190a190565b600254600160a060020a0316321480613c585750600254600160a060020a031633145b1515613c6357600080fd5b600e8054600160a060020a031916600160a060020a0392909216919091179055565b60006060613c928361297f565b90506022816040518082805190602001908083835b60208310613cc65780518252601f199092019160209182019101613ca7565b51815160209384036101000a600019018019909216911617905292019485525060405193849003019092205495945050505050565b6002546000908190600160a060020a0316321480613d235750600254600160a060020a031633145b1515613d2e57600080fd5b5060009050805b601754811015613f305782600160a060020a0316601782815481101515613d5857fe5b600091825260209091200154600160a060020a03161415613f28576015601782815481101515613d8457fe5b6000918252602080832090910154835460018101855593835291209091018054600160a060020a031916600160a060020a03909216919091179055601880546016919083908110613dd157fe5b60009182526020808320845460018181018088559686529290942092018054613e159493909301929091600261010091831615919091026000190190911604615626565b50507fd644c8164f225d3b7fdbcc404f279bb1e823ef0d93f88dd4b24e85d0e7bc6a54601782815481101515613e4757fe5b60009182526020909120015460188054600160a060020a039092169184908110613e6d57fe5b600091825260209182902060408051600160a060020a0386168152938401818152919092018054600260001961010060018416150201909116049284018390529291606083019084908015613f035780601f10613ed857610100808354040283529160200191613f03565b820191906000526020600020905b815481529060010190602001808311613ee657829003601f168201915b5050935050505060405180910390a1613f1f816017601861538f565b60019150613f30565b600101613d35565b8115156135c257600080fd5b6008805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113e75780601f106113bc576101008083540402835291602001916113e7565b600080600080600080613fa861306a565b1515613fb357600080fd5b866040516020018082805190602001908083835b60208310613fe65780518252601f199092019160209182019101613fc7565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b602083106140495780518252601f19909201916020918201910161402a565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390209450600860405160200180828054600181600116156101000203166002900480156140d85780601f106140b65761010080835404028352918201916140d8565b820191906000526020600020905b8154815290600101906020018083116140c4575b50509150506040516020818303038152906040526040518082805190602001908083835b6020831061411b5780518252601f1990920191602091820191016140fc565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912096505050508484141561423c5760408051602081019182905260009081905261416f916008916155ac565b506000600981905560035460408051600160a060020a03909216808352908201839052606060208084018281528c51928501929092528b517f238d74c13cda9ba51e904772d41a616a1b9b30d09802484df6279fe1c3c07f519593948d9493909290916080840191860190808383885b838110156141f75781810151838201526020016141df565b50505050905090810190601f1680156142245780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a160009550614535565b6000199250600091505b600a5482101561445257600a80548390811061425e57fe5b9060005260206000200160405160200180828054600181600116156101000203166002900480156142c65780601f106142a45761010080835404028352918201916142c6565b820191906000526020600020905b8154815290600101906020018083116142b2575b50509150506040516020818303038152906040526040518082805190602001908083835b602083106143095780518252601f1990920191602091820191016142ea565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912093505050508481141561444757600a80548390811061434d57fe5b906000526020600020016000614363919061569b565b600b80548390811061437157fe5b6000918252602082200155600a5460001901821461441757600a8054600019810190811061439b57fe5b90600052602060002001600a838154811015156143b457fe5b9060005260206000200190805460018160011615610100020316600290046143dd929190615626565b50600b805460001981019081106143f057fe5b9060005260206000200154600b8381548110151561440a57fe5b6000918252602090912001555b600a80549061442a9060001983016156e2565b50600b80549061443e906000198301615706565b50819250614452565b600190910190614246565b60001983141561446157600080fd5b7f238d74c13cda9ba51e904772d41a616a1b9b30d09802484df6279fe1c3c07f51600360009054906101000a9004600160a060020a031688856040518084600160a060020a0316600160a060020a0316815260200180602001838152602001828103825284818151815260200191508051906020019080838360005b838110156144f55781810151838201526020016144dd565b50505050905090810190601f1680156145225780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a18295505b5050505050919050565b6002546000908190600160a060020a03163214806145675750600254600160a060020a031633145b151561457257600080fd5b83516020106145ab575050815180830151600081815260046020908152604090912084519293926145a5928601906155ac565b50614621565b826005856040518082805190602001908083835b602083106145de5780518252601f1990920191602091820191016145bf565b51815160209384036101000a6000190180199092169116179052920194855250604051938490038101909320845161461f95919491909101925090506155ac565b505b50505050565b60025460009081908190600160a060020a031633148061464f5750600061464d33613c85565b115b151561465a57600080fd5b88518a511461466857600080fd5b875189511461467657600080fd5b865188511461468457600080fd5b855187511461469257600080fd5b84518651146146a057600080fd5b83518551146146ae57600080fd5b600092505b89518310156148215786838151811015156146ca57fe5b90602001906020020151915081600160a060020a031663508ad278338c868151811015156146f457fe5b906020019060200201518c8781518110151561470c57fe5b906020019060200201518c8881518110151561472457fe5b906020019060200201518b8981518110151561473c57fe5b906020019060200201518b8a81518110151561475457fe5b906020019060200201518b8b81518110151561476c57fe5b60209081029091018101516040805160e060020a63ffffffff8c16028152600160a060020a03998a16600482015260ff90981660248901526044880196909652606487019490945291909516608485015260a484019490945260c48301525160e480830193928290030181600087803b1580156147e857600080fd5b505af11580156147fc573d6000803e3d6000fd5b505050506040513d602081101561481257600080fd5b505190506001909201916146b3565b50505050505050505050565b6040516000907fed78a9defa7412748c9513ba9cf680f57703a46dd7e0fb0b1e94063423c73e88908290a150600190565b600254600160a060020a03163214806148815750600254600160a060020a031633145b151561488c57600080fd5b600160a060020a03811615156148a157600080fd5b60028054600160a060020a031916600160a060020a0392909216919091179055565b60185490565b602160205260009081526040902054600160a060020a031681565b60025460009081908190600160a060020a031632148061490e5750600254600160a060020a031633145b151561491957600080fd5b50506010546000190160005b601054811015611beb5783600160a060020a0316600f8281548110151561494857fe5b600091825260209091200154600160a060020a03161415614a7f57600f80548290811061497157fe5b60009182526020909120018054600160a060020a0319169055808214614a1657600f80548390811061499f57fe5b600091825260209091200154600f8054600160a060020a0390921691839081106149c557fe5b60009182526020909120018054600160a060020a031916600160a060020a0392909216919091179055600f8054839081106149fc57fe5b60009182526020909120018054600160a060020a03191690555b6010829055600160a060020a0384166000818152601160209081526040918290208054600160a060020a0319169055815192835290517fd41375b9d347dfe722f90a780731abd23b7855f9cf14ea7063c4cab5f9ae58e29281900390910190a160019250611bf0565b600101614925565b6002546000906060908290600160a060020a0316321480614ab25750600254600160a060020a031633145b1515614abd57600080fd5b6022856040518082805190602001908083835b60208310614aef5780518252601f199092019160209182019101614ad0565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015614bdf5760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015614bcb5780601f10614ba057610100808354040283529160200191614bcb565b820191906000526020600020905b815481529060010190602001808311614bae57829003601f168201915b505050505081526020019060010190614b34565b505050509150600090505b8151811015614ecf57836040518082805190602001908083835b60208310614c235780518252601f199092019160209182019101614c04565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912085519093508592508491508110614c5f57fe5b906020019060200201516040518082805190602001908083835b60208310614c985780518252601f199092019160209182019101614c79565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415614ec7578151600019018114614d8357815182906000198101908110614ced57fe5b906020019060200201516022866040518082805190602001908083835b60208310614d295780518252601f199092019160209182019101614d0a565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922080549092508491508110614d6457fe5b906000526020600020019080519060200190614d819291906155ac565b505b6022856040518082805190602001908083835b60208310614db55780518252601f199092019160209182019101614d96565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390206001835103815481101515614df957fe5b906000526020600020016000614e0f919061569b565b60016022866040518082805190602001908083835b60208310614e435780518252601f199092019160209182019101614e24565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922080549390930392614e82925090508261572a565b50604080513381526000602082015281517f5f463eb53cddf646852b82c0d9bdb1d1ec215c3802b780e8b7beea8b6e99f94c929181900390910190a160019250612ff8565b600101614bea565b604080513381526001602082015281517f5f463eb53cddf646852b82c0d9bdb1d1ec215c3802b780e8b7beea8b6e99f94c929181900390910190a1506000949350505050565b60008084518651141515614f2857600080fd5b5060005b855181101561505557826040518082805190602001908083835b60208310614f655780518252601f199092019160209182019101614f46565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912088519093508892508491508110614fa157fe5b906020019060200201516040518082805190602001908083835b60208310614fda5780518252601f199092019160209182019101614fbb565b6001836020036101000a038019825116818451168082178552505050505050905001915050604051809103902060001916148061503f575083600160a060020a0316868281518110151561502a57fe5b90602001906020020151600160a060020a0316145b1561504d576001915061505a565b600101614f2c565b600091505b50949350505050565b6060600080825b85518210156150ab57615094868381518110151561508457fe5b90602001906020020151866154e5565b156150a0576001909201915b60019091019061506a565b826040519080825280602002602001820160405280156150df57816020015b60608152602001906001900390816150ca5790505b5090508215156150f15780935061515f565b60009250600091505b855182101561515b57615114868381518110151561508457fe5b1561515057858281518110151561512757fe5b90602001906020020151818481518110151561513f57fe5b602090810290910101526001909201915b6001909101906150fa565b8093505b50505092915050565b600b90565b604080517f6d616b654944537472696e6728696e742c6164647265737329000000000000008152905190819003601901812080825260e060020a8402600483018190526008830184905260609260ff90848160288160008681f18015156151d357600080fd5b50606081016040529695505050505050565b600160a060020a03808216600090815260136020526040812054909182918291161561521057600080fd5b601e60009054906101000a9004600160a060020a0316600160a060020a0316637708bc416040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561526357600080fd5b505af1158015615277573d6000803e3d6000fd5b505050506040513d602081101561528d57600080fd5b50519150600160a060020a038416321461531f5750604080517ff2fde38b000000000000000000000000000000000000000000000000000000008152600160a060020a0385811660048301529151839283169163f2fde38b91602480830192600092919082900301818387803b15801561530657600080fd5b505af115801561531a573d6000803e3d6000fd5b505050505b60408051600160a060020a038416815290517f56c4bf13bebaa9f2be39ac3f2f4619a0dd1b694bb8c5f43c6b244a6dba0f0cca9181900360200190a150600160a060020a0392831660009081526013602052604090208054600160a060020a031916938216939093179092555090565b81548310801561539f5750805483105b15156153aa57600080fd5b8154600019018314615471578054819060001981019081106153c857fe5b9060005260206000200181848154811015156153e057fe5b906000526020600020019080546001816001161561010002031660029004615409929190615626565b5081548290600019810190811061541c57fe5b6000918252602090912001548254600160a060020a039091169083908590811061544257fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055505b80548190600019810190811061548357fe5b906000526020600020016000615499919061569b565b80546154a982600019830161572a565b508154829060001981019081106154bc57fe5b60009182526020909120018054600160a060020a03191690558154614621836000198301615706565b60008060008351915084518211156154fc57845191505b5060005b818110156155a157838181518110151561551657fe5b90602001015160f860020a900460f860020a027effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916858281518110151561555957fe5b60209101015160f860020a90819004027fff0000000000000000000000000000000000000000000000000000000000000016146155995760009250612ff8565b600101615500565b506001949350505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106155ed57805160ff191683800117855561561a565b8280016001018555821561561a579182015b8281111561561a5782518255916020019190600101906155ff565b506127df92915061574e565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061565f578054855561561a565b8280016001018555821561561a57600052602060002091601f016020900482015b8281111561561a578254825591600101919060010190615680565b50805460018160011615610100020316600290046000825580601f106156c157506156df565b601f0160209004906000526020600020908101906156df919061574e565b50565b8154818355818111156135c2576000838152602090206135c2918101908301615768565b8154818355818111156135c2576000838152602090206135c291810190830161574e565b8154818355818111156135c2576000838152602090206135c291810190830161578b565b61134f91905b808211156127df5760008155600101615754565b61134f91905b808211156127df576000615782828261569b565b5060010161576e565b61134f91905b808211156127df5760006157a5828261569b565b506001016157915600a165627a7a72305820ae1a53bc65e028fe4655a0221649969c8a8718a4381b77d4dc494e21d75418e50029"
};
module.exports = contract;