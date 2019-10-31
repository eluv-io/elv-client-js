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
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c00000000000000000060009081557f41636365737369626c6532303139303232323133353930304d4c0000000000006006557f4564697461626c6532303139303830313133353530304d4c00000000000000006007557f436f6e7461696e657232303139303532393039313830304d4c00000000000000600e556011557f55736572537061636532303139303530363135353330304d4c000000000000006013557f4e6f6465537061636532303139303532383137303130304d4c000000000000006015557f42617365436f6e74656e74537061636532303139303830313134303430304d4c601a553480156200011257600080fd5b50604051620058c5380380620058c58339810160405280516001805432600160a060020a031991821681179092556002805490911690911790550180516200016290601b906020840190620001c6565b5060038054600160a060020a03191630179055601a5460025460408051928352600160a060020a0391909116602083015280517f599bb380c80b69455450a615c515544b8da3b09f2efa116a5f0567682203cf549281900390910190a1506200026b565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200020957805160ff191683800117855562000239565b8280016001018555821562000239579182015b82811115620002395782518255916020019190600101906200021c565b50620002479291506200024b565b5090565b6200026891905b8082111562000247576000815560010162000252565b90565b61564a806200027b6000396000f3006080604052600436106103965763ffffffff60e060020a600035041662821de3811461039857806302d05d3f146103c957806306fdde03146103de5780630eaec2c5146104685780630f58a7861461049d57806314cfabb3146104c4578063160eee74146104d95780631cdbee5a146105325780631f2caaec1461055357806326683e141461056b578063268bfac41461058c57806329d002191461070157806329dedde5146107225780632cf99422146107435780632f7a781a1461076457806332eaf21b14610779578063331b86c01461078e5780633dd71d99146107b557806340b89f06146107ca57806341c0e1b5146107eb57806343f59ec714610800578063441c5aa314610815578063446e88261461082a5780635272ae171461083257806352f82dd81461084a57806354fd4d5014610862578063575185ed14610877578063589aafc11461088c5780635bb47808146108ad578063628449fd146108ce57806363e6ffdd146108e357806364f0f05014610904578063653a92f61461096b57806369e30ff814610a025780636be9514c14610a1a5780636d2e4b1b14610a325780636e37542714610a535780637284e41614610a685780637708bc4114610a7d5780637886f74714610a925780637ca8f61814610aaa5780637ebf879c14610ac2578063837b3b9314610ae357806385ce1df114610b045780638d2a23db14610b255780638da5cb5b14610b7e578063904696a814610b9357806390c3f38f14610ba857806395a078e814610c015780639867db7414610c22578063991a3a7c14610c7b5780639b55f901146104685780639cb121ba14610c935780639d05d18d14610cb4578063a2d67fcf14610cd5578063a69cb73414610cea578063abe596b114610d81578063ac55c90614610d96578063af570c0414610def578063b04b6caa14610e04578063b2b99ec914610e19578063b8cfaf0514610e3a578063bf4e088f14610e4f578063c287e0ed14610e76578063c45a015514610e8b578063c5c0369914610ea0578063c65bcbe214610eb5578063c82710c114610eca578063c9e8e72d14610edf578063d6be0f4914610f00578063dd4c97a014610f21578063e02dd9c214610f42578063e1a7071714610f57578063e542b7cb14610fb0578063e9861ab114611047578063f1551887146111f2578063f2fde38b14611207578063f41a158714611228578063fbd1b4ce1461123d578063fd0891961461125e578063fe7ac19f1461127f575b005b3480156103a457600080fd5b506103ad611316565b60408051600160a060020a039092168252519081900360200190f35b3480156103d557600080fd5b506103ad611326565b3480156103ea57600080fd5b506103f3611335565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561042d578181015183820152602001610415565b50505050905090810190601f16801561045a5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561047457600080fd5b50610489600160a060020a03600435166113c3565b604080519115158252519081900360200190f35b3480156104a957600080fd5b50610396600160a060020a03600435811690602435166113f4565b3480156104d057600080fd5b50610489611569565b3480156104e557600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103969436949293602493928401919081908401838280828437509497506115799650505050505050565b34801561053e57600080fd5b506103ad600160a060020a036004351661192c565b34801561055f57600080fd5b506103ad600435611947565b34801561057757600080fd5b50610489600160a060020a0360043516611bcb565b34801561059857600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261062394369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750611c299650505050505050565b604051808060200180602001838103835285818151815260200191508051906020019080838360005b8381101561066457818101518382015260200161064c565b50505050905090810190601f1680156106915780820380516001836020036101000a031916815260200191505b50838103825284518152845160209182019186019080838360005b838110156106c45781810151838201526020016106ac565b50505050905090810190601f1680156106f15780820380516001836020036101000a031916815260200191505b5094505050505060405180910390f35b34801561070d57600080fd5b50610489600160a060020a0360043516612072565b34801561072e57600080fd5b50610489600160a060020a0360043516612078565b34801561074f57600080fd5b50610489600160a060020a0360043516612096565b34801561077057600080fd5b506103ad6121b6565b34801561078557600080fd5b506103ad612330565b34801561079a57600080fd5b506107a361233f565b60408051918252519081900360200190f35b3480156107c157600080fd5b50610489612345565b3480156107d657600080fd5b506103ad600160a060020a036004351661234a565b3480156107f757600080fd5b50610396612425565b34801561080c57600080fd5b506107a3612461565b34801561082157600080fd5b506103ad612467565b610489612476565b34801561083e57600080fd5b506103f3600435612666565b34801561085657600080fd5b506103ad6004356126da565b34801561086e57600080fd5b506107a3612702565b34801561088357600080fd5b506103ad612708565b34801561089857600080fd5b506103f3600160a060020a03600435166127d2565b3480156108b957600080fd5b50610396600160a060020a03600435166127e5565b3480156108da57600080fd5b506103f3612835565b3480156108ef57600080fd5b506103ad600160a060020a0360043516612890565b34801561091057600080fd5b5060408051602060046024803582810135601f8101859004850286018501909652858552610396958335600160a060020a03169536956044949193909101919081908401838280828437509497506128ab9650505050505050565b34801561097757600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261048994369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750612af09650505050505050565b348015610a0e57600080fd5b506103f3600435612e53565b348015610a2657600080fd5b506103ad600435612e61565b348015610a3e57600080fd5b50610396600160a060020a0360043516612e6f565b348015610a5f57600080fd5b50610489612ebd565b348015610a7457600080fd5b506103f3612ece565b348015610a8957600080fd5b506103ad612f29565b348015610a9e57600080fd5b506107a3600435612f34565b348015610ab657600080fd5b506103f3600435612f53565b348015610ace57600080fd5b50610396600160a060020a0360043516612f61565b348015610aef57600080fd5b50610396600160a060020a0360043516612fb1565b348015610b1057600080fd5b50610396600160a060020a0360043516613001565b348015610b3157600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526107a39436949293602493928401919081908401838280828437509497506130519650505050505050565b348015610b8a57600080fd5b506103ad6130b9565b348015610b9f57600080fd5b506103ad6130c8565b348015610bb457600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103969436949293602493928401919081908401838280828437509497506130d79650505050505050565b348015610c0d57600080fd5b50610489600160a060020a036004351661311c565b348015610c2e57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103969436949293602493928401919081908401838280828437509497506131229650505050505050565b348015610c8757600080fd5b506103ad60043561324f565b348015610c9f57600080fd5b50610489600160a060020a036004351661325d565b348015610cc057600080fd5b50610396600160a060020a03600435166132b4565b348015610ce157600080fd5b506103ad613304565b348015610cf657600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261039694369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506133909650505050505050565b348015610d8d57600080fd5b50610489613437565b348015610da257600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103f394369492936024939284019190819084018382808284375094975061352e9650505050505050565b348015610dfb57600080fd5b506103ad6136dc565b348015610e1057600080fd5b506103ad6136eb565b348015610e2557600080fd5b50610396600160a060020a03600435166136fa565b348015610e4657600080fd5b506103ad6137c6565b348015610e5b57600080fd5b506103ad600160a060020a036004358116906024351661388d565b348015610e8257600080fd5b50610396613971565b348015610e9757600080fd5b506103ad613a47565b348015610eac57600080fd5b506103ad613a56565b348015610ec157600080fd5b506107a3613a65565b348015610ed657600080fd5b506103ad613a6b565b348015610eeb57600080fd5b50610396600160a060020a0360043516613aa5565b348015610f0c57600080fd5b506107a3600160a060020a0360043516613af5565b348015610f2d57600080fd5b50610396600160a060020a0360043516613b6b565b348015610f4e57600080fd5b506103f3613dac565b348015610f6357600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526107a3943694929360249392840191908190840183828082843750949750613e079650505050505050565b348015610fbc57600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261039694369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506143af9650505050505050565b34801561105357600080fd5b506040805160206004803580820135838102808601850190965280855261039695369593946024949385019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506144979650505050505050565b3480156111fe57600080fd5b5061048961469d565b34801561121357600080fd5b50610396600160a060020a03600435166146ce565b34801561123457600080fd5b506107a3614733565b34801561124957600080fd5b506103ad600160a060020a0360043516614739565b34801561126a57600080fd5b50610489600160a060020a0360043516614754565b34801561128b57600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261048994369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506148f79650505050505050565b600354600160a060020a03165b90565b600154600160a060020a031681565b601b805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113bb5780601f10611390576101008083540402835291602001916113bb565b820191906000526020600020905b81548152906001019060200180831161139e57829003601f168201915b505050505081565b600254600090600160a060020a03838116911614806113ec5750600254600160a060020a031633145b90505b919050565b600254600160a060020a03163214806114175750600254600160a060020a031633145b151561142257600080fd5b600160a060020a0380831660009081526012602052604090205416158015611450575061144e8261325d565b155b156114fc5760105460115410156114a65781601060115481548110151561147357fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055506114f2565b601080546001810182556000919091527f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae672018054600160a060020a031916600160a060020a0384161790555b6011805460010190555b600160a060020a038281166000818152601260209081526040918290208054600160a060020a0319169486169485179055815192835282019290925281517f280016f7418306a55542432120fd1a239ef9fcc1a92694d8d44ca76be0249ea7929181900390910190a15050565b600061157433611bcb565b905090565b6116af60188054806020026020016040519081016040528092919081815260200182805480156115d257602002820191906000526020600020905b8154600160a060020a031681526001909101906020018083116115b4575b50505050506019805480602002602001604051908101604052809291908181526020016000905b828210156116a45760008481526020908190208301805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156116905780601f1061166557610100808354040283529160200191611690565b820191906000526020600020905b81548152906001019060200180831161167357829003601f168201915b5050505050815260200190600101906115f9565b505050503384614d85565b156116b957600080fd5b6117e4601680548060200260200160405190810160405280929190818152602001828054801561171257602002820191906000526020600020905b8154600160a060020a031681526001909101906020018083116116f4575b50505050506017805480602002602001604051908101604052809291908181526020016000905b828210156116a45760008481526020908190208301805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156117d05780601f106117a5576101008083540402835291602001916117d0565b820191906000526020600020905b8154815290600101906020018083116117b357829003601f168201915b505050505081526020019060010190611739565b156117ee57600080fd5b6018546064116117fd57600080fd5b60198054600181018083556000929092528251611841917f944998273e477b495144fb8794c914197f3ccb46be2900f4698fd0ef743c96950190602085019061541c565b50506018805460018101825560009182527fb13d2d76d1f4b7be834882e410b3e3a8afaf69f83600ae24db354391d2378d2e018054600160a060020a0319163390811790915560408051828152602081810183815286519383019390935285517fae5645569f32b946f7a747113c64094a29a6b84c5ddf55816ef4381ce8a3a46d958794926060850192908601918190849084905b838110156118ee5781810151838201526020016118d6565b50505050905090810190601f16801561191b5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a150565b601260205260009081526040902054600160a060020a031681565b600080805b601054821015611bbf57601080548390811061196457fe5b6000918252602091829020015460408051808401889052815180820385018152908201918290528051600160a060020a03909316945092909182918401908083835b602083106119c55780518252601f1990920191602091820191016119a6565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390206000191681600160a060020a031663e02dd9c26040518163ffffffff1660e060020a028152600401600060405180830381600087803b158015611a3457600080fd5b505af1158015611a48573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526020811015611a7157600080fd5b810190808051640100000000811115611a8957600080fd5b82016020810184811115611a9c57600080fd5b8151640100000000811182820187101715611ab657600080fd5b50509291905050506040516020018082805190602001908083835b60208310611af05780518252601f199092019160209182019101611ad1565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b60208310611b535780518252601f199092019160209182019101611b34565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415611bb4576010805483908110611b9857fe5b600091825260209091200154600160a060020a03169250611bc4565b60019091019061194c565b600092505b5050919050565b6000805b601654811015611c1e5782600160a060020a0316601682815481101515611bf257fe5b600091825260209091200154600160a060020a03161415611c165760019150611c23565b600101611bcf565b600091505b50919050565b60608060608060608060006023896040518082805190602001908083835b60208310611c665780518252601f199092019160209182019101611c47565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015611d565760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015611d425780601f10611d1757610100808354040283529160200191611d42565b820191906000526020600020905b815481529060010190602001808311611d2557829003601f168201915b505050505081526020019060010190611cab565b5050505094506024896040518082805190602001908083835b60208310611d8e5780518252601f199092019160209182019101611d6f565b518151600019602094850361010090810a820192831692199390931691909117909252949092019687526040805197889003820188208054601f6002600183161590980290950116959095049283018290048202880182019052818752929450925050830182828015611e425780601f10611e1757610100808354040283529160200191611e42565b820191906000526020600020905b815481529060010190602001808311611e2557829003601f168201915b50505050509350845160001415611e6f578360206040519081016040528060008152509096509650612066565b611e798589614ed3565b9250600090505b825181101561205f576001835103811415611f6457818382815181101515611ea457fe5b906020019060200201516040516020018083805190602001908083835b60208310611ee05780518252601f199092019160209182019101611ec1565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310611f285780518252601f199092019160209182019101611f09565b6001836020036101000a038019825116818451168082178552505050505050905001925050506040516020818303038152906040529150612057565b818382815181101515611f7357fe5b906020019060200201516040516020018083805190602001908083835b60208310611faf5780518252601f199092019160209182019101611f90565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310611ff75780518252601f199092019160209182019101611fd8565b6001836020036101000a038019825116818451168082178552505050505050905001807f2c000000000000000000000000000000000000000000000000000000000000008152506001019250505060405160208183030381529060405291505b600101611e80565b8184965096505b50505050509250929050565b50600090565b60006011546000141561208d575060016113ef565b6113ec8261325d565b60008033600160a060020a038416146120ae57600080fd5b82905080600160a060020a0316638280dd8f60006040518263ffffffff1660e060020a02815260040180828152602001915050602060405180830381600087803b1580156120fb57600080fd5b505af115801561210f573d6000803e3d6000fd5b505050506040513d602081101561212557600080fd5b5050604080517f27c1c21d0000000000000000000000000000000000000000000000000000000081529051600160a060020a038316916327c1c21d9160048083019260209291908290030181600087803b15801561218257600080fd5b505af1158015612196573d6000803e3d6000fd5b505050506040513d60208110156121ac57600080fd5b5051159392505050565b3360009081526022602052604081205481908190600160a060020a0316156121dd57600080fd5b600091505b6016548210156122285760168054339190849081106121fd57fe5b600091825260209091200154600160a060020a0316141561221d57612228565b6001909101906121e2565b601654821061223657600080fd5b601d54604080517f5c6dc2190000000000000000000000000000000000000000000000000000000081523360048201529051600160a060020a0390921691635c6dc219916024808201926020929091908290030181600087803b15801561229c57600080fd5b505af11580156122b0573d6000803e3d6000fd5b505050506040513d60208110156122c657600080fd5b5051336000908152602260209081526040918290208054600160a060020a031916600160a060020a038516908117909155825190815291519293507f4575facd117046c9c28b69a3eb9c08939f2462a5a22ea6c6dcd4f79b8dd124e992918290030190a192915050565b600f54600160a060020a031681565b600a5490565b600090565b60208054604080517f40b89f06000000000000000000000000000000000000000000000000000000008152600160a060020a0385811660048301529151600094859493909316926340b89f06926024808201939182900301818787803b1580156123b357600080fd5b505af11580156123c7573d6000803e3d6000fd5b505050506040513d60208110156123dd57600080fd5b505160408051600160a060020a038316815290519192507f473c07a6d0228c4fb8fe2be3b4617c3b5fb7c0f8cd9ba4b67e8631844b9b6571919081900360200190a192915050565b600254600160a060020a03163214806124485750600254600160a060020a031633145b151561245357600080fd5b600254600160a060020a0316ff5b60175490565b602054600160a060020a031681565b6000612480611569565b151561248b57600080fd5b600d5460ff16151561249c57600080fd5b60006008805460018160011615610100020316600290049050111561254b57600a8054600181810180845560009390935260088054612512937fc65a7bb8d6351c1cf70c95a316cc6a92839c986682d98bc35f958f4883f9d2a80192600261010091831615919091026000190190911604615496565b5050600954600b80546001810182556000919091527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db901555b600c805461256e9160089160026000196101006001841615020190911604615496565b504260095560408051602081019182905260009081905261259191600c9161541c565b50600d805460ff1916905560035460408051600160a060020a039092168083526020830182815260088054600260001960018316156101000201909116049385018490527f482875da75e6d9f93f74a5c1a61f14cf08822057c01232f44cb92ae998e30d8e949293909291906060830190849080156126515780601f1061262657610100808354040283529160200191612651565b820191906000526020600020905b81548152906001019060200180831161263457829003601f168201915b5050935050505060405180910390a150600190565b601780548290811061267457fe5b600091825260209182902001805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152935090918301828280156113bb5780601f10611390576101008083540402835291602001916113bb565b60168054829081106126e857fe5b600091825260209091200154600160a060020a0316905081565b601a5481565b600080601e60009054906101000a9004600160a060020a0316600160a060020a031663575185ed6040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561275e57600080fd5b505af1158015612772573d6000803e3d6000fd5b505050506040513d602081101561278857600080fd5b505160408051600160a060020a038316815290519192507fa3b1fe71ae61bad8cffa485b230e24e518938f76182a30fa0d9979e7237ad159919081900360200190a18091505b5090565b60606113ec6127df614fd8565b83614fdd565b600254600160a060020a03163214806128085750600254600160a060020a031633145b151561281357600080fd5b601d8054600160a060020a031916600160a060020a0392909216919091179055565b600c805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113bb5780601f10611390576101008083540402835291602001916113bb565b601460205260009081526040902054600160a060020a031681565b600254600160a060020a03163214806128ce5750600254600160a060020a031633145b15156128d957600080fd5b612a0f601680548060200260200160405190810160405280929190818152602001828054801561293257602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311612914575b50505050506017805480602002602001604051908101604052809291908181526020016000905b82821015612a045760008481526020908190208301805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156129f05780601f106129c5576101008083540402835291602001916129f0565b820191906000526020600020905b8154815290600101906020018083116129d357829003601f168201915b505050505081526020019060010190612959565b505050508484614d85565b15612a1957600080fd5b6016805460018082019092557fd833147d7dc355ba459fc788f669e58cfaf9dc25ddcd0702e87d69c7b5124289018054600160a060020a031916600160a060020a0385161790556017805491820180825560009190915282519091612aa7917fc624b66cc0138b8fabc209247f72d758e1cf3343756d543badbf24212bed8c1590910190602085019061541c565b505060408051338152600160a060020a038416602082015281517f2bb0f9ba138ffddb5a8f974e9885b65a7814d3002654f1cf3f2d3f619a4006c4929181900390910190a15050565b6002546000906060908290600160a060020a0316321480612b1b5750600254600160a060020a031633145b1515612b2657600080fd5b6023856040518082805190602001908083835b60208310612b585780518252601f199092019160209182019101612b39565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015612c485760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015612c345780601f10612c0957610100808354040283529160200191612c34565b820191906000526020600020905b815481529060010190602001808311612c1757829003601f168201915b505050505081526020019060010190612b9d565b505050509150600090505b8151811015612d8457836040518082805190602001908083835b60208310612c8c5780518252601f199092019160209182019101612c6d565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912085519093508592508491508110612cc857fe5b906020019060200201516040518082805190602001908083835b60208310612d015780518252601f199092019160209182019101612ce2565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415612d7c57604080513381526001602082015281517fdf8127994c229011ce9c4764bdc0375bb71c06cf1544f034cd81a42f37233319929181900390910190a160009250612e4b565b600101612c53565b6023856040518082805190602001908083835b60208310612db65780518252601f199092019160209182019101612d97565b51815160209384036101000a600019018019909216911617905292019485525060405193849003810190932080546001810180835560009283529185902089519295612e0995509101925088019061541c565b5050604080513381526000602082015281517fdf8127994c229011ce9c4764bdc0375bb71c06cf1544f034cd81a42f37233319929181900390910190a1600192505b505092915050565b601980548290811061267457fe5b60188054829081106126e857fe5b600154600160a060020a03163214612e8657600080fd5b600160a060020a0381161515612e9b57600080fd5b60018054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a0316321490565b601c805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113bb5780601f10611390576101008083540402835291602001916113bb565b600061157432615055565b600b805482908110612f4257fe5b600091825260209091200154905081565b600a80548290811061267457fe5b600254600160a060020a0316321480612f845750600254600160a060020a031633145b1515612f8f57600080fd5b601f8054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a0316321480612fd45750600254600160a060020a031633145b1515612fdf57600080fd5b601e8054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a03163214806130245750600254600160a060020a031633145b151561302f57600080fd5b60218054600160a060020a031916600160a060020a0392909216919091179055565b60006023826040518082805190602001908083835b602083106130855780518252601f199092019160209182019101613066565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922054949350505050565b600254600160a060020a031681565b602154600160a060020a031681565b600254600160a060020a03163214806130fa5750600254600160a060020a031633145b151561310557600080fd5b805161311890601c90602084019061541c565b5050565b50600190565b61312a612ebd565b151561313557600080fd5b600d5460ff161561314557600080fd5b805160801161315357600080fd5b805161316690600c90602084019061541c565b50600d805460ff191660011790556003547fb3ac059d88af6016aca1aebb7b3e796f2e7420435c59c563687814e9b85daa7590600160a060020a03166131aa611316565b60408051600160a060020a038085168252831660208201526060918101828152600c8054600260001961010060018416150201909116049383018490529260808301908490801561323c5780601f106132115761010080835404028352916020019161323c565b820191906000526020600020905b81548152906001019060200180831161321f57829003601f168201915b505094505050505060405180910390a150565b60108054829081106126e857fe5b600080805b6011548110156132ad5783600160a060020a031660108281548110151561328557fe5b600091825260209091200154600160a060020a031614156132a557600191505b600101613262565b5092915050565b600254600160a060020a03163214806132d75750600254600160a060020a031633145b15156132e257600080fd5b60208054600160a060020a031916600160a060020a0392909216919091179055565b326000908152601460205260408120548190600160a060020a031615156133345761332d612f29565b905061334f565b5032600090815260146020526040902054600160a060020a03165b60408051600160a060020a038316815290517f1c917c3c2698bd5b98acb9772728da62f2ce3670e4578910a6465b955f63e1579181900360200190a1919050565b600254600160a060020a03163214806133b35750600254600160a060020a031633145b15156133be57600080fd5b806024836040518082805190602001908083835b602083106133f15780518252601f1990920191602091820191016133d2565b51815160209384036101000a60001901801990921691161790529201948552506040519384900381019093208451613432959194919091019250905061541c565b505050565b336000908152602260205260408120548190600160a060020a0316151561345d57600080fd5b50336000908152602260205260408082208054600160a060020a0319811690915581517f41c0e1b50000000000000000000000000000000000000000000000000000000081529151600160a060020a039091169283926341c0e1b5926004808301939282900301818387803b1580156134d557600080fd5b505af11580156134e9573d6000803e3d6000fd5b505060408051600160a060020a038516815290517fb98695ab4c6cedb3b4dfe62479a9d39a59aa2cb38b8bd92bbb6ce5856e42bdf49350908190036020019150a15090565b6060600080602084511115156135e857505081518083015160008181526004602090815260409182902080548351601f6002610100600185161502600019019093169290920491820184900484028101840190945280845293949390918301828280156135dc5780601f106135b1576101008083540402835291602001916135dc565b820191906000526020600020905b8154815290600101906020018083116135bf57829003601f168201915b50505050509250611bc4565b6005846040518082805190602001908083835b6020831061361a5780518252601f1990920191602091820191016135fb565b518151600019602094850361010090810a820192831692199390931691909117909252949092019687526040805197889003820188208054601f60026001831615909802909501169590950492830182900482028801820190528187529294509250508301828280156136ce5780601f106136a3576101008083540402835291602001916136ce565b820191906000526020600020905b8154815290600101906020018083116136b157829003601f168201915b505050505092505050919050565b600354600160a060020a031681565b601e54600160a060020a031681565b600254600090600160a060020a03163214806137205750600254600160a060020a031633145b151561372b57600080fd5b5060005b6016548110156131185781600160a060020a031660168281548110151561375257fe5b600091825260209091200154600160a060020a031614156137be5761377a81601660176151ff565b60408051338152600160a060020a038416602082015281517f41ec5b9efdbf61871df6a18b687e04bea93d5793af5f8c8b4626e155b23dc19d929181900390910190a15b60010161372f565b600080601d60009054906101000a9004600160a060020a0316600160a060020a031663b8cfaf056040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561381c57600080fd5b505af1158015613830573d6000803e3d6000fd5b505050506040513d602081101561384657600080fd5b505160408051600160a060020a038316815290519192507f9e69777f30c55126be256664fa7beff4b796ac32ebceab94df5071b0148017f8919081900360200190a1919050565b602154604080517fbf4e088f000000000000000000000000000000000000000000000000000000008152600160a060020a038581166004830152848116602483015291516000938493169163bf4e088f91604480830192602092919082900301818787803b1580156138fe57600080fd5b505af1158015613912573d6000803e3d6000fd5b505050506040513d602081101561392857600080fd5b505160408051600160a060020a038316815290519192507fa0633ea0b3cb5796607e5f551ae79c7eeee0dc7ee0c3ff8996506261651368ce919081900360200190a19392505050565b600254600160a060020a031633148061398d575061398d611569565b151561399857600080fd5b60408051602080825260088054600260001961010060018416150201909116049183018290527f403f30aa5f4f2f89331a7b50054f64a00ce206f4d0a37f566ff344bbe46f8b6593909291829182019084908015613a375780601f10613a0c57610100808354040283529160200191613a37565b820191906000526020600020905b815481529060010190602001808311613a1a57829003601f168201915b50509250505060405180910390a1565b601d54600160a060020a031681565b601f54600160a060020a031681565b60115481565b6040805132815290516000917f53ce35a7383a3ea3f695bdf0f87d7e5485ba816b382673e849bfdd24e7f5e3ca919081900360200190a190565b600254600160a060020a0316321480613ac85750600254600160a060020a031633145b1515613ad357600080fd5b600f8054600160a060020a031916600160a060020a0392909216919091179055565b60006060613b02836127d2565b90506023816040518082805190602001908083835b60208310613b365780518252601f199092019160209182019101613b17565b51815160209384036101000a600019018019909216911617905292019485525060405193849003019092205495945050505050565b6002546000908190600160a060020a0316321480613b935750600254600160a060020a031633145b1515613b9e57600080fd5b5060009050805b601854811015613da05782600160a060020a0316601882815481101515613bc857fe5b600091825260209091200154600160a060020a03161415613d98576016601882815481101515613bf457fe5b6000918252602080832090910154835460018101855593835291209091018054600160a060020a031916600160a060020a03909216919091179055601980546017919083908110613c4157fe5b60009182526020808320845460018181018088559686529290942092018054613c859493909301929091600261010091831615919091026000190190911604615496565b50507fd644c8164f225d3b7fdbcc404f279bb1e823ef0d93f88dd4b24e85d0e7bc6a54601882815481101515613cb757fe5b60009182526020909120015460198054600160a060020a039092169184908110613cdd57fe5b600091825260209182902060408051600160a060020a0386168152938401818152919092018054600260001961010060018416150201909116049284018390529291606083019084908015613d735780601f10613d4857610100808354040283529160200191613d73565b820191906000526020600020905b815481529060010190602001808311613d5657829003601f168201915b5050935050505060405180910390a1613d8f81601860196151ff565b60019150613da0565b600101613ba5565b81151561343257600080fd5b6008805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113bb5780601f10611390576101008083540402835291602001916113bb565b600080600080600080613e18612ebd565b1515613e2357600080fd5b866040516020018082805190602001908083835b60208310613e565780518252601f199092019160209182019101613e37565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b60208310613eb95780518252601f199092019160209182019101613e9a565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020945060086040516020018082805460018160011615610100020316600290048015613f485780601f10613f26576101008083540402835291820191613f48565b820191906000526020600020905b815481529060010190602001808311613f34575b50509150506040516020818303038152906040526040518082805190602001908083835b60208310613f8b5780518252601f199092019160209182019101613f6c565b5181516020939093036101000a600019018019909116921691909117905260405192018290039091209650505050848414156140ac57604080516020810191829052600090819052613fdf9160089161541c565b506000600981905560035460408051600160a060020a03909216808352908201839052606060208084018281528c51928501929092528b517f238d74c13cda9ba51e904772d41a616a1b9b30d09802484df6279fe1c3c07f519593948d9493909290916080840191860190808383885b8381101561406757818101518382015260200161404f565b50505050905090810190601f1680156140945780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a1600095506143a5565b6000199250600091505b600a548210156142c257600a8054839081106140ce57fe5b9060005260206000200160405160200180828054600181600116156101000203166002900480156141365780601f10614114576101008083540402835291820191614136565b820191906000526020600020905b815481529060010190602001808311614122575b50509150506040516020818303038152906040526040518082805190602001908083835b602083106141795780518252601f19909201916020918201910161415a565b5181516020939093036101000a600019018019909116921691909117905260405192018290039091209350505050848114156142b757600a8054839081106141bd57fe5b9060005260206000200160006141d3919061550b565b600b8054839081106141e157fe5b6000918252602082200155600a5460001901821461428757600a8054600019810190811061420b57fe5b90600052602060002001600a8381548110151561422457fe5b90600052602060002001908054600181600116156101000203166002900461424d929190615496565b50600b8054600019810190811061426057fe5b9060005260206000200154600b8381548110151561427a57fe5b6000918252602090912001555b600a80549061429a906000198301615552565b50600b8054906142ae906000198301615576565b508192506142c2565b6001909101906140b6565b6000198314156142d157600080fd5b7f238d74c13cda9ba51e904772d41a616a1b9b30d09802484df6279fe1c3c07f51600360009054906101000a9004600160a060020a031688856040518084600160a060020a0316600160a060020a0316815260200180602001838152602001828103825284818151815260200191508051906020019080838360005b8381101561436557818101518382015260200161434d565b50505050905090810190601f1680156143925780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a18295505b5050505050919050565b6002546000908190600160a060020a03163214806143d75750600254600160a060020a031633145b15156143e257600080fd5b835160201061441b575050815180830151600081815260046020908152604090912084519293926144159286019061541c565b50614491565b826005856040518082805190602001908083835b6020831061444e5780518252601f19909201916020918201910161442f565b51815160209384036101000a6000190180199092169116179052920194855250604051938490038101909320845161448f959194919091019250905061541c565b505b50505050565b60025460009081908190600160a060020a03163314806144bf575060006144bd33613af5565b115b15156144ca57600080fd5b88518a51146144d857600080fd5b87518951146144e657600080fd5b86518851146144f457600080fd5b855187511461450257600080fd5b845186511461451057600080fd5b835185511461451e57600080fd5b600092505b895183101561469157868381518110151561453a57fe5b90602001906020020151915081600160a060020a031663508ad278338c8681518110151561456457fe5b906020019060200201518c8781518110151561457c57fe5b906020019060200201518c8881518110151561459457fe5b906020019060200201518b898151811015156145ac57fe5b906020019060200201518b8a8151811015156145c457fe5b906020019060200201518b8b8151811015156145dc57fe5b60209081029091018101516040805160e060020a63ffffffff8c16028152600160a060020a03998a16600482015260ff90981660248901526044880196909652606487019490945291909516608485015260a484019490945260c48301525160e480830193928290030181600087803b15801561465857600080fd5b505af115801561466c573d6000803e3d6000fd5b505050506040513d602081101561468257600080fd5b50519050600190920191614523565b50505050505050505050565b6040516000907fed78a9defa7412748c9513ba9cf680f57703a46dd7e0fb0b1e94063423c73e88908290a150600190565b600254600160a060020a03163214806146f15750600254600160a060020a031633145b15156146fc57600080fd5b600160a060020a038116151561471157600080fd5b60028054600160a060020a031916600160a060020a0392909216919091179055565b60195490565b602260205260009081526040902054600160a060020a031681565b60025460009081908190600160a060020a031632148061477e5750600254600160a060020a031633145b151561478957600080fd5b50506011546000190160005b601154811015611bbf5783600160a060020a03166010828154811015156147b857fe5b600091825260209091200154600160a060020a031614156148ef5760108054829081106147e157fe5b60009182526020909120018054600160a060020a031916905580821461488657601080548390811061480f57fe5b60009182526020909120015460108054600160a060020a03909216918390811061483557fe5b60009182526020909120018054600160a060020a031916600160a060020a0392909216919091179055601080548390811061486c57fe5b60009182526020909120018054600160a060020a03191690555b6011829055600160a060020a0384166000818152601260209081526040918290208054600160a060020a0319169055815192835290517fd41375b9d347dfe722f90a780731abd23b7855f9cf14ea7063c4cab5f9ae58e29281900390910190a160019250611bc4565b600101614795565b6002546000906060908290600160a060020a03163214806149225750600254600160a060020a031633145b151561492d57600080fd5b6023856040518082805190602001908083835b6020831061495f5780518252601f199092019160209182019101614940565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015614a4f5760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015614a3b5780601f10614a1057610100808354040283529160200191614a3b565b820191906000526020600020905b815481529060010190602001808311614a1e57829003601f168201915b5050505050815260200190600101906149a4565b505050509150600090505b8151811015614d3f57836040518082805190602001908083835b60208310614a935780518252601f199092019160209182019101614a74565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912085519093508592508491508110614acf57fe5b906020019060200201516040518082805190602001908083835b60208310614b085780518252601f199092019160209182019101614ae9565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415614d37578151600019018114614bf357815182906000198101908110614b5d57fe5b906020019060200201516023866040518082805190602001908083835b60208310614b995780518252601f199092019160209182019101614b7a565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922080549092508491508110614bd457fe5b906000526020600020019080519060200190614bf192919061541c565b505b6023856040518082805190602001908083835b60208310614c255780518252601f199092019160209182019101614c06565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390206001835103815481101515614c6957fe5b906000526020600020016000614c7f919061550b565b60016023866040518082805190602001908083835b60208310614cb35780518252601f199092019160209182019101614c94565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922080549390930392614cf2925090508261559a565b50604080513381526000602082015281517f5f463eb53cddf646852b82c0d9bdb1d1ec215c3802b780e8b7beea8b6e99f94c929181900390910190a160019250612e4b565b600101614a5a565b604080513381526001602082015281517f5f463eb53cddf646852b82c0d9bdb1d1ec215c3802b780e8b7beea8b6e99f94c929181900390910190a1506000949350505050565b60008084518651141515614d9857600080fd5b5060005b8551811015614ec557826040518082805190602001908083835b60208310614dd55780518252601f199092019160209182019101614db6565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912088519093508892508491508110614e1157fe5b906020019060200201516040518082805190602001908083835b60208310614e4a5780518252601f199092019160209182019101614e2b565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161480614eaf575083600160a060020a03168682815181101515614e9a57fe5b90602001906020020151600160a060020a0316145b15614ebd5760019150614eca565b600101614d9c565b600091505b50949350505050565b6060600080825b8551821015614f1b57614f048683815181101515614ef457fe5b9060200190602002015186615355565b15614f10576001909201915b600190910190614eda565b82604051908082528060200260200182016040528015614f4f57816020015b6060815260200190600190039081614f3a5790505b509050821515614f6157809350614fcf565b60009250600091505b8551821015614fcb57614f848683815181101515614ef457fe5b15614fc0578582815181101515614f9757fe5b906020019060200201518184815181101515614faf57fe5b602090810290910101526001909201915b600190910190614f6a565b8093505b50505092915050565b600b90565b604080517f6d616b654944537472696e6728696e742c6164647265737329000000000000008152905190819003601901812080825260e060020a8402600483018190526008830184905260609260ff90848160288160008681f180151561504357600080fd5b50606081016040529695505050505050565b600160a060020a03808216600090815260146020526040812054909182918291161561508057600080fd5b601f60009054906101000a9004600160a060020a0316600160a060020a0316637708bc416040518163ffffffff1660e060020a028152600401602060405180830381600087803b1580156150d357600080fd5b505af11580156150e7573d6000803e3d6000fd5b505050506040513d60208110156150fd57600080fd5b50519150600160a060020a038416321461518f5750604080517ff2fde38b000000000000000000000000000000000000000000000000000000008152600160a060020a0385811660048301529151839283169163f2fde38b91602480830192600092919082900301818387803b15801561517657600080fd5b505af115801561518a573d6000803e3d6000fd5b505050505b60408051600160a060020a038416815290517f56c4bf13bebaa9f2be39ac3f2f4619a0dd1b694bb8c5f43c6b244a6dba0f0cca9181900360200190a150600160a060020a0392831660009081526014602052604090208054600160a060020a031916938216939093179092555090565b81548310801561520f5750805483105b151561521a57600080fd5b81546000190183146152e15780548190600019810190811061523857fe5b90600052602060002001818481548110151561525057fe5b906000526020600020019080546001816001161561010002031660029004615279929190615496565b5081548290600019810190811061528c57fe5b6000918252602090912001548254600160a060020a03909116908390859081106152b257fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055505b8054819060001981019081106152f357fe5b906000526020600020016000615309919061550b565b805461531982600019830161559a565b5081548290600019810190811061532c57fe5b60009182526020909120018054600160a060020a03191690558154614491836000198301615576565b600080600083519150845182111561536c57845191505b5060005b8181101561541157838181518110151561538657fe5b90602001015160f860020a900460f860020a027effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191685828151811015156153c957fe5b60209101015160f860020a90819004027fff0000000000000000000000000000000000000000000000000000000000000016146154095760009250612e4b565b600101615370565b506001949350505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061545d57805160ff191683800117855561548a565b8280016001018555821561548a579182015b8281111561548a57825182559160200191906001019061546f565b506127ce9291506155be565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106154cf578054855561548a565b8280016001018555821561548a57600052602060002091601f016020900482015b8281111561548a5782548255916001019190600101906154f0565b50805460018160011615610100020316600290046000825580601f10615531575061554f565b601f01602090049060005260206000209081019061554f91906155be565b50565b815481835581811115613432576000838152602090206134329181019083016155d8565b815481835581811115613432576000838152602090206134329181019083016155be565b815481835581811115613432576000838152602090206134329181019083016155fb565b61132391905b808211156127ce57600081556001016155c4565b61132391905b808211156127ce5760006155f2828261550b565b506001016155de565b61132391905b808211156127ce576000615615828261550b565b506001016156015600a165627a7a723058203f32d135c25dd7f323dc7bfa582aca7f3da8da8b5d322f2ee22b4cf18af5bfc30029"
};
module.exports = contract;