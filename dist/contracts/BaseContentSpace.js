"use strict";

var contract = {
  "abi": [{
    "constant": false,
    "inputs": [],
    "name": "parentAddress",
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
      "name": "objectHash",
      "type": "string"
    }],
    "name": "VersionConfirm",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
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
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c00000000000000000060009081557f41636365737369626c6532303139303232323133353930304d4c0000000000006006557f4564697461626c653230313930363037313035363030504f00000000000000006007557f436f6e7461696e657232303139303532393039313830304d4c00000000000000600b55600e557f55736572537061636532303139303530363135353330304d4c000000000000006010557f4e6f6465537061636532303139303532383137303130304d4c000000000000006012557f42617365436f6e74656e7453706163653230313930373033313230303030504f6017553480156200011257600080fd5b50604051620056b3380380620056b38339810160405280516001805432600160a060020a0319918216811790925560028054909116909117905501805162000162906018906020840190620001c6565b5060038054600160a060020a0319163017905560175460025460408051928352600160a060020a0391909116602083015280517f599bb380c80b69455450a615c515544b8da3b09f2efa116a5f0567682203cf549281900390910190a1506200026b565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200020957805160ff191683800117855562000239565b8280016001018555821562000239579182015b82811115620002395782518255916020019190600101906200021c565b50620002479291506200024b565b5090565b6200026891905b8082111562000247576000815560010162000252565b90565b615438806200027b6000396000f3006080604052600436106103805763ffffffff60e060020a600035041662821de3811461038257806302d05d3f146103b357806306fdde03146103c85780630eaec2c5146104525780630f58a7861461048757806314cfabb3146104ae578063160eee74146104c35780631cdbee5a1461051c5780631f2caaec1461053d57806326683e1414610555578063268bfac41461057657806329d00219146106eb57806329dedde51461070c5780632cf994221461072d5780632f7a781a1461074e57806332eaf21b14610763578063331b86c0146107785780633dd71d991461079f57806340b89f06146107b457806341c0e1b5146107d557806343f59ec7146107ea578063441c5aa3146107ff578063446e8826146108145780635272ae171461081c57806352f82dd81461083457806354fd4d501461084c578063575185ed146108615780635834028d14610876578063589aafc1146108975780635bb47808146108b8578063628449fd146108d957806363e6ffdd146108ee57806364f0f0501461090f578063653a92f61461097657806369e30ff814610a0d5780636be9514c14610a255780636d2e4b1b14610a3d5780636e37542714610a5e5780637284e41614610a735780637708bc4114610a885780637ca8f61814610a9d5780637ebf879c14610ab557806385ce1df114610ad65780638d2a23db14610af75780638da5cb5b14610b50578063904696a814610b6557806390c3f38f14610b7a57806395a078e814610bd35780639867db7414610bf4578063991a3a7c14610c4d5780639b55f901146104525780639cb121ba14610c655780639d05d18d14610c86578063a2d67fcf14610ca7578063a69cb73414610cbc578063abe596b114610d53578063ac55c90614610d68578063af570c0414610dc1578063b2b99ec914610dd6578063b8cfaf0514610df7578063bf4e088f14610e0c578063c287e0ed14610e33578063c45a015514610e48578063c5c0369914610e5d578063c65bcbe214610e72578063c82710c114610e87578063c9e8e72d14610e9c578063d6be0f4914610ebd578063dd4c97a014610ede578063e02dd9c214610eff578063e1a7071714610f14578063e542b7cb14610f6d578063e9861ab114611004578063f1551887146111af578063f2fde38b146111c4578063f41a1587146111e5578063fbd1b4ce146111fa578063fd0891961461121b578063fe7ac19f1461123c575b005b34801561038e57600080fd5b506103976112d3565b60408051600160a060020a039092168252519081900360200190f35b3480156103bf57600080fd5b506103976112e3565b3480156103d457600080fd5b506103dd6112f2565b6040805160208082528351818301528351919283929083019185019080838360005b838110156104175781810151838201526020016103ff565b50505050905090810190601f1680156104445780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561045e57600080fd5b50610473600160a060020a0360043516611380565b604080519115158252519081900360200190f35b34801561049357600080fd5b50610380600160a060020a03600435811690602435166113b1565b3480156104ba57600080fd5b50610473611526565b3480156104cf57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103809436949293602493928401919081908401838280828437509497506115369650505050505050565b34801561052857600080fd5b50610397600160a060020a03600435166118e9565b34801561054957600080fd5b50610397600435611904565b34801561056157600080fd5b50610473600160a060020a0360043516611b88565b34801561058257600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261060d94369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750611be69650505050505050565b604051808060200180602001838103835285818151815260200191508051906020019080838360005b8381101561064e578181015183820152602001610636565b50505050905090810190601f16801561067b5780820380516001836020036101000a031916815260200191505b50838103825284518152845160209182019186019080838360005b838110156106ae578181015183820152602001610696565b50505050905090810190601f1680156106db5780820380516001836020036101000a031916815260200191505b5094505050505060405180910390f35b3480156106f757600080fd5b50610473600160a060020a036004351661202f565b34801561071857600080fd5b50610473600160a060020a0360043516612035565b34801561073957600080fd5b50610473600160a060020a0360043516612053565b34801561075a57600080fd5b50610397612173565b34801561076f57600080fd5b506103976122ed565b34801561078457600080fd5b5061078d6122fc565b60408051918252519081900360200190f35b3480156107ab57600080fd5b50610473612302565b3480156107c057600080fd5b50610397600160a060020a0360043516612307565b3480156107e157600080fd5b506103806123e2565b3480156107f657600080fd5b5061078d61241e565b34801561080b57600080fd5b50610397612424565b610473612433565b34801561082857600080fd5b506103dd6004356125b4565b34801561084057600080fd5b50610397600435612628565b34801561085857600080fd5b5061078d612650565b34801561086d57600080fd5b50610397612656565b34801561088257600080fd5b50610473600160a060020a0360043516612720565b3480156108a357600080fd5b506103dd600160a060020a03600435166128bc565b3480156108c457600080fd5b50610380600160a060020a03600435166128cf565b3480156108e557600080fd5b506103dd61291f565b3480156108fa57600080fd5b50610397600160a060020a036004351661297a565b34801561091b57600080fd5b5060408051602060046024803582810135601f8101859004850286018501909652858552610380958335600160a060020a03169536956044949193909101919081908401838280828437509497506129959650505050505050565b34801561098257600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261047394369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750612bda9650505050505050565b348015610a1957600080fd5b506103dd600435612f3d565b348015610a3157600080fd5b50610397600435612f4b565b348015610a4957600080fd5b50610380600160a060020a0360043516612f59565b348015610a6a57600080fd5b50610473612fa7565b348015610a7f57600080fd5b506103dd612fb8565b348015610a9457600080fd5b50610397613013565b348015610aa957600080fd5b506103dd60043561301e565b348015610ac157600080fd5b50610380600160a060020a036004351661302c565b348015610ae257600080fd5b50610380600160a060020a036004351661307c565b348015610b0357600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261078d9436949293602493928401919081908401838280828437509497506130cc9650505050505050565b348015610b5c57600080fd5b50610397613134565b348015610b7157600080fd5b50610397613143565b348015610b8657600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103809436949293602493928401919081908401838280828437509497506131529650505050505050565b348015610bdf57600080fd5b50610473600160a060020a0360043516613197565b348015610c0057600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261038094369492936024939284019190819084018382808284375094975061319d9650505050505050565b348015610c5957600080fd5b506103976004356132ad565b348015610c7157600080fd5b50610473600160a060020a03600435166132bb565b348015610c9257600080fd5b50610380600160a060020a0360043516613312565b348015610cb357600080fd5b50610397613362565b348015610cc857600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261038094369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506133ee9650505050505050565b348015610d5f57600080fd5b50610473613495565b348015610d7457600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103dd94369492936024939284019190819084018382808284375094975061358c9650505050505050565b348015610dcd57600080fd5b5061039761373a565b348015610de257600080fd5b50610380600160a060020a0360043516613749565b348015610e0357600080fd5b50610397613815565b348015610e1857600080fd5b50610397600160a060020a03600435811690602435166138dc565b348015610e3f57600080fd5b506103806139c0565b348015610e5457600080fd5b50610397613a96565b348015610e6957600080fd5b50610397613aa5565b348015610e7e57600080fd5b5061078d613ab4565b348015610e9357600080fd5b50610397613aba565b348015610ea857600080fd5b50610380600160a060020a0360043516613af4565b348015610ec957600080fd5b5061078d600160a060020a0360043516613b44565b348015610eea57600080fd5b50610380600160a060020a0360043516613bba565b348015610f0b57600080fd5b506103dd613dfb565b348015610f2057600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261078d943694929360249392840191908190840183828082843750949750613e569650505050505050565b348015610f7957600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261038094369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506141a19650505050505050565b34801561101057600080fd5b506040805160206004803580820135838102808601850190965280855261038095369593946024949385019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506142899650505050505050565b3480156111bb57600080fd5b5061047361448f565b3480156111d057600080fd5b50610380600160a060020a03600435166144c0565b3480156111f157600080fd5b5061078d614525565b34801561120657600080fd5b50610397600160a060020a036004351661452b565b34801561122757600080fd5b50610473600160a060020a0360043516614546565b34801561124857600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261047394369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506146e99650505050505050565b600354600160a060020a03165b90565b600154600160a060020a031681565b6018805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113785780601f1061134d57610100808354040283529160200191611378565b820191906000526020600020905b81548152906001019060200180831161135b57829003601f168201915b505050505081565b600254600090600160a060020a03838116911614806113a95750600254600160a060020a031633145b90505b919050565b600254600160a060020a03163214806113d45750600254600160a060020a031633145b15156113df57600080fd5b600160a060020a038083166000908152600f60205260409020541615801561140d575061140b826132bb565b155b156114b957600d54600e5410156114635781600d600e5481548110151561143057fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055506114af565b600d80546001810182556000919091527fd7b6990105719101dabeb77144f2a3385c8033acd3af97e9423a695e81ad1eb5018054600160a060020a031916600160a060020a0384161790555b600e805460010190555b600160a060020a038281166000818152600f60209081526040918290208054600160a060020a0319169486169485179055815192835282019290925281517f280016f7418306a55542432120fd1a239ef9fcc1a92694d8d44ca76be0249ea7929181900390910190a15050565b600061153133611b88565b905090565b61166c601580548060200260200160405190810160405280929190818152602001828054801561158f57602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311611571575b50505050506016805480602002602001604051908101604052809291908181526020016000905b828210156116615760008481526020908190208301805460408051601f600260001961010060018716150201909416939093049283018590048502810185019091528181529283018282801561164d5780601f106116225761010080835404028352916020019161164d565b820191906000526020600020905b81548152906001019060200180831161163057829003601f168201915b5050505050815260200190600101906115b6565b505050503384614b77565b1561167657600080fd5b6117a160138054806020026020016040519081016040528092919081815260200182805480156116cf57602002820191906000526020600020905b8154600160a060020a031681526001909101906020018083116116b1575b50505050506014805480602002602001604051908101604052809291908181526020016000905b828210156116615760008481526020908190208301805460408051601f600260001961010060018716150201909416939093049283018590048502810185019091528181529283018282801561178d5780601f106117625761010080835404028352916020019161178d565b820191906000526020600020905b81548152906001019060200180831161177057829003601f168201915b5050505050815260200190600101906116f6565b156117ab57600080fd5b6015546064116117ba57600080fd5b601680546001810180835560009290925282516117fe917fd833147d7dc355ba459fc788f669e58cfaf9dc25ddcd0702e87d69c7b51242890190602085019061520e565b50506015805460018101825560009182527f55f448fdea98c4d29eb340757ef0a66cd03dbb9538908a6a81d96026b71ec475018054600160a060020a0319163390811790915560408051828152602081810183815286519383019390935285517fae5645569f32b946f7a747113c64094a29a6b84c5ddf55816ef4381ce8a3a46d958794926060850192908601918190849084905b838110156118ab578181015183820152602001611893565b50505050905090810190601f1680156118d85780820380516001836020036101000a031916815260200191505b50935050505060405180910390a150565b600f60205260009081526040902054600160a060020a031681565b600080805b600d54821015611b7c57600d80548390811061192157fe5b6000918252602091829020015460408051808401889052815180820385018152908201918290528051600160a060020a03909316945092909182918401908083835b602083106119825780518252601f199092019160209182019101611963565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390206000191681600160a060020a031663e02dd9c26040518163ffffffff1660e060020a028152600401600060405180830381600087803b1580156119f157600080fd5b505af1158015611a05573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526020811015611a2e57600080fd5b810190808051640100000000811115611a4657600080fd5b82016020810184811115611a5957600080fd5b8151640100000000811182820187101715611a7357600080fd5b50509291905050506040516020018082805190602001908083835b60208310611aad5780518252601f199092019160209182019101611a8e565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b60208310611b105780518252601f199092019160209182019101611af1565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415611b7157600d805483908110611b5557fe5b600091825260209091200154600160a060020a03169250611b81565b600190910190611909565b600092505b5050919050565b6000805b601354811015611bdb5782600160a060020a0316601382815481101515611baf57fe5b600091825260209091200154600160a060020a03161415611bd35760019150611be0565b600101611b8c565b600091505b50919050565b6060806060806060806000601f896040518082805190602001908083835b60208310611c235780518252601f199092019160209182019101611c04565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015611d135760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015611cff5780601f10611cd457610100808354040283529160200191611cff565b820191906000526020600020905b815481529060010190602001808311611ce257829003601f168201915b505050505081526020019060010190611c68565b5050505094506020896040518082805190602001908083835b60208310611d4b5780518252601f199092019160209182019101611d2c565b518151600019602094850361010090810a820192831692199390931691909117909252949092019687526040805197889003820188208054601f6002600183161590980290950116959095049283018290048202880182019052818752929450925050830182828015611dff5780601f10611dd457610100808354040283529160200191611dff565b820191906000526020600020905b815481529060010190602001808311611de257829003601f168201915b50505050509350845160001415611e2c578360206040519081016040528060008152509096509650612023565b611e368589614cc5565b9250600090505b825181101561201c576001835103811415611f2157818382815181101515611e6157fe5b906020019060200201516040516020018083805190602001908083835b60208310611e9d5780518252601f199092019160209182019101611e7e565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310611ee55780518252601f199092019160209182019101611ec6565b6001836020036101000a038019825116818451168082178552505050505050905001925050506040516020818303038152906040529150612014565b818382815181101515611f3057fe5b906020019060200201516040516020018083805190602001908083835b60208310611f6c5780518252601f199092019160209182019101611f4d565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310611fb45780518252601f199092019160209182019101611f95565b6001836020036101000a038019825116818451168082178552505050505050905001807f2c000000000000000000000000000000000000000000000000000000000000008152506001019250505060405160208183030381529060405291505b600101611e3d565b8184965096505b50505050509250929050565b50600090565b6000600e546000141561204a575060016113ac565b6113a9826132bb565b60008033600160a060020a0384161461206b57600080fd5b82905080600160a060020a0316638280dd8f60006040518263ffffffff1660e060020a02815260040180828152602001915050602060405180830381600087803b1580156120b857600080fd5b505af11580156120cc573d6000803e3d6000fd5b505050506040513d60208110156120e257600080fd5b5050604080517f27c1c21d0000000000000000000000000000000000000000000000000000000081529051600160a060020a038316916327c1c21d9160048083019260209291908290030181600087803b15801561213f57600080fd5b505af1158015612153573d6000803e3d6000fd5b505050506040513d602081101561216957600080fd5b5051159392505050565b336000908152601e602052604081205481908190600160a060020a03161561219a57600080fd5b600091505b6013548210156121e55760138054339190849081106121ba57fe5b600091825260209091200154600160a060020a031614156121da576121e5565b60019091019061219f565b60135482106121f357600080fd5b601a54604080517f5c6dc2190000000000000000000000000000000000000000000000000000000081523360048201529051600160a060020a0390921691635c6dc219916024808201926020929091908290030181600087803b15801561225957600080fd5b505af115801561226d573d6000803e3d6000fd5b505050506040513d602081101561228357600080fd5b5051336000908152601e60209081526040918290208054600160a060020a031916600160a060020a038516908117909155825190815291519293507f4575facd117046c9c28b69a3eb9c08939f2462a5a22ea6c6dcd4f79b8dd124e992918290030190a192915050565b600c54600160a060020a031681565b60095490565b600090565b601c54604080517f40b89f06000000000000000000000000000000000000000000000000000000008152600160a060020a0384811660048301529151600093849316916340b89f0691602480830192602092919082900301818787803b15801561237057600080fd5b505af1158015612384573d6000803e3d6000fd5b505050506040513d602081101561239a57600080fd5b505160408051600160a060020a038316815290519192507f473c07a6d0228c4fb8fe2be3b4617c3b5fb7c0f8cd9ba4b67e8631844b9b6571919081900360200190a192915050565b600254600160a060020a03163214806124055750600254600160a060020a031633145b151561241057600080fd5b600254600160a060020a0316ff5b60145490565b601c54600160a060020a031681565b600061243d611526565b151561244857600080fd5b6000600880546001816001161561010002031660029004905011156124c157600980546001818101808455600093909352600880546124be937f6e1540171b6c0c960b71a7020d9f60077f6af931a8bbf590da0223dacf75c7af0192600261010091831615919091026000190190911604615288565b50505b600a80546124e49160089160026000196101006001841615020190911604615288565b5060408051602081019182905260009081905261250391600a9161520e565b5060408051602080825260088054600260001961010060018416150201909116049183018290527f5ae4ddb3009a8ccdedc04b2011fc66a472807bcdcff04af16286ddb27819ebe1939092918291820190849080156125a35780601f10612578576101008083540402835291602001916125a3565b820191906000526020600020905b81548152906001019060200180831161258657829003601f168201915b50509250505060405180910390a190565b60148054829081106125c257fe5b600091825260209182902001805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152935090918301828280156113785780601f1061134d57610100808354040283529160200191611378565b601380548290811061263657fe5b600091825260209091200154600160a060020a0316905081565b60175481565b600080601a60009054906101000a9004600160a060020a0316600160a060020a031663575185ed6040518163ffffffff1660e060020a028152600401602060405180830381600087803b1580156126ac57600080fd5b505af11580156126c0573d6000803e3d6000fd5b505050506040513d60208110156126d657600080fd5b505160408051600160a060020a038316815290519192507fa3b1fe71ae61bad8cffa485b230e24e518938f76182a30fa0d9979e7237ad159919081900360200190a18091505b5090565b600160a060020a03808216600090815260116020526040812054909182918291161561274f5760009250611b81565b601b60009054906101000a9004600160a060020a0316600160a060020a0316637708bc416040518163ffffffff1660e060020a028152600401602060405180830381600087803b1580156127a257600080fd5b505af11580156127b6573d6000803e3d6000fd5b505050506040513d60208110156127cc57600080fd5b5051604080517ff2fde38b000000000000000000000000000000000000000000000000000000008152600160a060020a03878116600483015291519294508493509083169163f2fde38b9160248082019260009290919082900301818387803b15801561283857600080fd5b505af115801561284c573d6000803e3d6000fd5b505050600160a060020a038086166000908152601160209081526040918290208054938716600160a060020a031990941684179055815192835290517f56c4bf13bebaa9f2be39ac3f2f4619a0dd1b694bb8c5f43c6b244a6dba0f0cca9350918290030190a15060019392505050565b60606113a96128c9614dca565b83614dcf565b600254600160a060020a03163214806128f25750600254600160a060020a031633145b15156128fd57600080fd5b601a8054600160a060020a031916600160a060020a0392909216919091179055565b600a805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113785780601f1061134d57610100808354040283529160200191611378565b601160205260009081526040902054600160a060020a031681565b600254600160a060020a03163214806129b85750600254600160a060020a031633145b15156129c357600080fd5b612af96013805480602002602001604051908101604052809291908181526020018280548015612a1c57602002820191906000526020600020905b8154600160a060020a031681526001909101906020018083116129fe575b50505050506014805480602002602001604051908101604052809291908181526020016000905b82821015612aee5760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015612ada5780601f10612aaf57610100808354040283529160200191612ada565b820191906000526020600020905b815481529060010190602001808311612abd57829003601f168201915b505050505081526020019060010190612a43565b505050508484614b77565b15612b0357600080fd5b6013805460018082019092557f66de8ffda797e3de9c05e8fc57b3bf0ec28a930d40b0d285d93c06501cf6a090018054600160a060020a031916600160a060020a0385161790556014805491820180825560009190915282519091612b91917fce6d7b5282bd9a3661ae061feed1dbda4e52ab073b1f9285be6e155d9c38d4ec90910190602085019061520e565b505060408051338152600160a060020a038416602082015281517f2bb0f9ba138ffddb5a8f974e9885b65a7814d3002654f1cf3f2d3f619a4006c4929181900390910190a15050565b6002546000906060908290600160a060020a0316321480612c055750600254600160a060020a031633145b1515612c1057600080fd5b601f856040518082805190602001908083835b60208310612c425780518252601f199092019160209182019101612c23565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015612d325760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015612d1e5780601f10612cf357610100808354040283529160200191612d1e565b820191906000526020600020905b815481529060010190602001808311612d0157829003601f168201915b505050505081526020019060010190612c87565b505050509150600090505b8151811015612e6e57836040518082805190602001908083835b60208310612d765780518252601f199092019160209182019101612d57565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912085519093508592508491508110612db257fe5b906020019060200201516040518082805190602001908083835b60208310612deb5780518252601f199092019160209182019101612dcc565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415612e6657604080513381526001602082015281517fdf8127994c229011ce9c4764bdc0375bb71c06cf1544f034cd81a42f37233319929181900390910190a160009250612f35565b600101612d3d565b601f856040518082805190602001908083835b60208310612ea05780518252601f199092019160209182019101612e81565b51815160209384036101000a600019018019909216911617905292019485525060405193849003810190932080546001810180835560009283529185902089519295612ef395509101925088019061520e565b5050604080513381526000602082015281517fdf8127994c229011ce9c4764bdc0375bb71c06cf1544f034cd81a42f37233319929181900390910190a1600192505b505092915050565b60168054829081106125c257fe5b601580548290811061263657fe5b600154600160a060020a03163214612f7057600080fd5b600160a060020a0381161515612f8557600080fd5b60018054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a0316321490565b6019805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113785780601f1061134d57610100808354040283529160200191611378565b600061153132614e47565b60098054829081106125c257fe5b600254600160a060020a031632148061304f5750600254600160a060020a031633145b151561305a57600080fd5b601b8054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a031632148061309f5750600254600160a060020a031633145b15156130aa57600080fd5b601d8054600160a060020a031916600160a060020a0392909216919091179055565b6000601f826040518082805190602001908083835b602083106131005780518252601f1990920191602091820191016130e1565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922054949350505050565b600254600160a060020a031681565b601d54600160a060020a031681565b600254600160a060020a03163214806131755750600254600160a060020a031633145b151561318057600080fd5b805161319390601990602084019061520e565b5050565b50600190565b6131a5612fa7565b15156131b057600080fd5b80516080116131be57600080fd5b80516131d190600a90602084019061520e565b506003547fb3ac059d88af6016aca1aebb7b3e796f2e7420435c59c563687814e9b85daa7590600160a060020a03166132086112d3565b60408051600160a060020a038085168252831660208201526060918101828152600a8054600260001961010060018416150201909116049383018490529260808301908490801561329a5780601f1061326f5761010080835404028352916020019161329a565b820191906000526020600020905b81548152906001019060200180831161327d57829003601f168201915b505094505050505060405180910390a150565b600d80548290811061263657fe5b600080805b600e5481101561330b5783600160a060020a0316600d828154811015156132e357fe5b600091825260209091200154600160a060020a0316141561330357600191505b6001016132c0565b5092915050565b600254600160a060020a03163214806133355750600254600160a060020a031633145b151561334057600080fd5b601c8054600160a060020a031916600160a060020a0392909216919091179055565b326000908152601160205260408120548190600160a060020a031615156133925761338b613013565b90506133ad565b5032600090815260116020526040902054600160a060020a03165b60408051600160a060020a038316815290517f1c917c3c2698bd5b98acb9772728da62f2ce3670e4578910a6465b955f63e1579181900360200190a1919050565b600254600160a060020a03163214806134115750600254600160a060020a031633145b151561341c57600080fd5b806020836040518082805190602001908083835b6020831061344f5780518252601f199092019160209182019101613430565b51815160209384036101000a60001901801990921691161790529201948552506040519384900381019093208451613490959194919091019250905061520e565b505050565b336000908152601e60205260408120548190600160a060020a031615156134bb57600080fd5b50336000908152601e60205260408082208054600160a060020a0319811690915581517f41c0e1b50000000000000000000000000000000000000000000000000000000081529151600160a060020a039091169283926341c0e1b5926004808301939282900301818387803b15801561353357600080fd5b505af1158015613547573d6000803e3d6000fd5b505060408051600160a060020a038516815290517fb98695ab4c6cedb3b4dfe62479a9d39a59aa2cb38b8bd92bbb6ce5856e42bdf49350908190036020019150a15090565b60606000806020845111151561364657505081518083015160008181526004602090815260409182902080548351601f60026101006001851615026000190190931692909204918201849004840281018401909452808452939493909183018282801561363a5780601f1061360f5761010080835404028352916020019161363a565b820191906000526020600020905b81548152906001019060200180831161361d57829003601f168201915b50505050509250611b81565b6005846040518082805190602001908083835b602083106136785780518252601f199092019160209182019101613659565b518151600019602094850361010090810a820192831692199390931691909117909252949092019687526040805197889003820188208054601f600260018316159098029095011695909504928301829004820288018201905281875292945092505083018282801561372c5780601f106137015761010080835404028352916020019161372c565b820191906000526020600020905b81548152906001019060200180831161370f57829003601f168201915b505050505092505050919050565b600354600160a060020a031681565b600254600090600160a060020a031632148061376f5750600254600160a060020a031633145b151561377a57600080fd5b5060005b6013548110156131935781600160a060020a03166013828154811015156137a157fe5b600091825260209091200154600160a060020a0316141561380d576137c98160136014614ff1565b60408051338152600160a060020a038416602082015281517f41ec5b9efdbf61871df6a18b687e04bea93d5793af5f8c8b4626e155b23dc19d929181900390910190a15b60010161377e565b600080601a60009054906101000a9004600160a060020a0316600160a060020a031663b8cfaf056040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561386b57600080fd5b505af115801561387f573d6000803e3d6000fd5b505050506040513d602081101561389557600080fd5b505160408051600160a060020a038316815290519192507f9e69777f30c55126be256664fa7beff4b796ac32ebceab94df5071b0148017f8919081900360200190a1919050565b601d54604080517fbf4e088f000000000000000000000000000000000000000000000000000000008152600160a060020a038581166004830152848116602483015291516000938493169163bf4e088f91604480830192602092919082900301818787803b15801561394d57600080fd5b505af1158015613961573d6000803e3d6000fd5b505050506040513d602081101561397757600080fd5b505160408051600160a060020a038316815290519192507fa0633ea0b3cb5796607e5f551ae79c7eeee0dc7ee0c3ff8996506261651368ce919081900360200190a19392505050565b600254600160a060020a03163314806139dc57506139dc611526565b15156139e757600080fd5b60408051602080825260088054600260001961010060018416150201909116049183018290527f403f30aa5f4f2f89331a7b50054f64a00ce206f4d0a37f566ff344bbe46f8b6593909291829182019084908015613a865780601f10613a5b57610100808354040283529160200191613a86565b820191906000526020600020905b815481529060010190602001808311613a6957829003601f168201915b50509250505060405180910390a1565b601a54600160a060020a031681565b601b54600160a060020a031681565b600e5481565b6040805132815290516000917f53ce35a7383a3ea3f695bdf0f87d7e5485ba816b382673e849bfdd24e7f5e3ca919081900360200190a190565b600254600160a060020a0316321480613b175750600254600160a060020a031633145b1515613b2257600080fd5b600c8054600160a060020a031916600160a060020a0392909216919091179055565b60006060613b51836128bc565b9050601f816040518082805190602001908083835b60208310613b855780518252601f199092019160209182019101613b66565b51815160209384036101000a600019018019909216911617905292019485525060405193849003019092205495945050505050565b6002546000908190600160a060020a0316321480613be25750600254600160a060020a031633145b1515613bed57600080fd5b5060009050805b601554811015613def5782600160a060020a0316601582815481101515613c1757fe5b600091825260209091200154600160a060020a03161415613de7576013601582815481101515613c4357fe5b6000918252602080832090910154835460018101855593835291209091018054600160a060020a031916600160a060020a03909216919091179055601680546014919083908110613c9057fe5b60009182526020808320845460018181018088559686529290942092018054613cd49493909301929091600261010091831615919091026000190190911604615288565b50507fd644c8164f225d3b7fdbcc404f279bb1e823ef0d93f88dd4b24e85d0e7bc6a54601582815481101515613d0657fe5b60009182526020909120015460168054600160a060020a039092169184908110613d2c57fe5b600091825260209182902060408051600160a060020a0386168152938401818152919092018054600260001961010060018416150201909116049284018390529291606083019084908015613dc25780601f10613d9757610100808354040283529160200191613dc2565b820191906000526020600020905b815481529060010190602001808311613da557829003601f168201915b5050935050505060405180910390a1613dde8160156016614ff1565b60019150613def565b600101613bf4565b81151561349057600080fd5b6008805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156113785780601f1061134d57610100808354040283529160200191611378565b6000806000806000613e66612fa7565b1515613e7157600080fd5b856040516020018082805190602001908083835b60208310613ea45780518252601f199092019160209182019101613e85565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b60208310613f075780518252601f199092019160209182019101613ee8565b6001836020036101000a038019825116818451168082178552505050505050905001915050604051809103902093506000199250600091505b6009548210156140e7576009805483908110613f5857fe5b906000526020600020016040516020018082805460018160011615610100020316600290048015613fc05780601f10613f9e576101008083540402835291820191613fc0565b820191906000526020600020905b815481529060010190602001808311613fac575b50509150506040516020818303038152906040526040518082805190602001908083835b602083106140035780518252601f199092019160209182019101613fe4565b5181516020939093036101000a600019018019909116921691909117905260405192018290039091209350505050838114156140dc57600980548390811061404757fe5b90600052602060002001600061405d91906152fd565b6009546000190182146140c05760098054600019810190811061407c57fe5b9060005260206000200160098381548110151561409557fe5b9060005260206000200190805460018160011615610100020316600290046140be929190615288565b505b60098054906140d3906000198301615344565b508192506140e7565b600190910190613f40565b6000198314156140f657600080fd5b7f165c03d1f6eb5280d41c4b5f467649bacdff0baf01ed576facebc59885dd7efa86846040518080602001838152602001828103825284818151815260200191508051906020019080838360005b8381101561415c578181015183820152602001614144565b50505050905090810190601f1680156141895780820380516001836020036101000a031916815260200191505b50935050505060405180910390a15090949350505050565b6002546000908190600160a060020a03163214806141c95750600254600160a060020a031633145b15156141d457600080fd5b835160201061420d575050815180830151600081815260046020908152604090912084519293926142079286019061520e565b50614283565b826005856040518082805190602001908083835b602083106142405780518252601f199092019160209182019101614221565b51815160209384036101000a60001901801990921691161790529201948552506040519384900381019093208451614281959194919091019250905061520e565b505b50505050565b60025460009081908190600160a060020a03163314806142b1575060006142af33613b44565b115b15156142bc57600080fd5b88518a51146142ca57600080fd5b87518951146142d857600080fd5b86518851146142e657600080fd5b85518751146142f457600080fd5b845186511461430257600080fd5b835185511461431057600080fd5b600092505b895183101561448357868381518110151561432c57fe5b90602001906020020151915081600160a060020a031663508ad278338c8681518110151561435657fe5b906020019060200201518c8781518110151561436e57fe5b906020019060200201518c8881518110151561438657fe5b906020019060200201518b8981518110151561439e57fe5b906020019060200201518b8a8151811015156143b657fe5b906020019060200201518b8b8151811015156143ce57fe5b60209081029091018101516040805160e060020a63ffffffff8c16028152600160a060020a03998a16600482015260ff90981660248901526044880196909652606487019490945291909516608485015260a484019490945260c48301525160e480830193928290030181600087803b15801561444a57600080fd5b505af115801561445e573d6000803e3d6000fd5b505050506040513d602081101561447457600080fd5b50519050600190920191614315565b50505050505050505050565b6040516000907fed78a9defa7412748c9513ba9cf680f57703a46dd7e0fb0b1e94063423c73e88908290a150600190565b600254600160a060020a03163214806144e35750600254600160a060020a031633145b15156144ee57600080fd5b600160a060020a038116151561450357600080fd5b60028054600160a060020a031916600160a060020a0392909216919091179055565b60165490565b601e60205260009081526040902054600160a060020a031681565b60025460009081908190600160a060020a03163214806145705750600254600160a060020a031633145b151561457b57600080fd5b5050600e546000190160005b600e54811015611b7c5783600160a060020a0316600d828154811015156145aa57fe5b600091825260209091200154600160a060020a031614156146e157600d8054829081106145d357fe5b60009182526020909120018054600160a060020a031916905580821461467857600d80548390811061460157fe5b600091825260209091200154600d8054600160a060020a03909216918390811061462757fe5b60009182526020909120018054600160a060020a031916600160a060020a0392909216919091179055600d80548390811061465e57fe5b60009182526020909120018054600160a060020a03191690555b600e829055600160a060020a0384166000818152600f60209081526040918290208054600160a060020a0319169055815192835290517fd41375b9d347dfe722f90a780731abd23b7855f9cf14ea7063c4cab5f9ae58e29281900390910190a160019250611b81565b600101614587565b6002546000906060908290600160a060020a03163214806147145750600254600160a060020a031633145b151561471f57600080fd5b601f856040518082805190602001908083835b602083106147515780518252601f199092019160209182019101614732565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b828210156148415760008481526020908190208301805460408051601f600260001961010060018716150201909416939093049283018590048502810185019091528181529283018282801561482d5780601f106148025761010080835404028352916020019161482d565b820191906000526020600020905b81548152906001019060200180831161481057829003601f168201915b505050505081526020019060010190614796565b505050509150600090505b8151811015614b3157836040518082805190602001908083835b602083106148855780518252601f199092019160209182019101614866565b5181516020939093036101000a60001901801990911692169190911790526040519201829003909120855190935085925084915081106148c157fe5b906020019060200201516040518082805190602001908083835b602083106148fa5780518252601f1990920191602091820191016148db565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415614b295781516000190181146149e55781518290600019810190811061494f57fe5b90602001906020020151601f866040518082805190602001908083835b6020831061498b5780518252601f19909201916020918201910161496c565b51815160209384036101000a60001901801990921691161790529201948552506040519384900301909220805490925084915081106149c657fe5b9060005260206000200190805190602001906149e392919061520e565b505b601f856040518082805190602001908083835b60208310614a175780518252601f1990920191602091820191016149f8565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390206001835103815481101515614a5b57fe5b906000526020600020016000614a7191906152fd565b6001601f866040518082805190602001908083835b60208310614aa55780518252601f199092019160209182019101614a86565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922080549390930392614ae49250905082615368565b50604080513381526000602082015281517f5f463eb53cddf646852b82c0d9bdb1d1ec215c3802b780e8b7beea8b6e99f94c929181900390910190a160019250612f35565b60010161484c565b604080513381526001602082015281517f5f463eb53cddf646852b82c0d9bdb1d1ec215c3802b780e8b7beea8b6e99f94c929181900390910190a1506000949350505050565b60008084518651141515614b8a57600080fd5b5060005b8551811015614cb757826040518082805190602001908083835b60208310614bc75780518252601f199092019160209182019101614ba8565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912088519093508892508491508110614c0357fe5b906020019060200201516040518082805190602001908083835b60208310614c3c5780518252601f199092019160209182019101614c1d565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161480614ca1575083600160a060020a03168682815181101515614c8c57fe5b90602001906020020151600160a060020a0316145b15614caf5760019150614cbc565b600101614b8e565b600091505b50949350505050565b6060600080825b8551821015614d0d57614cf68683815181101515614ce657fe5b9060200190602002015186615147565b15614d02576001909201915b600190910190614ccc565b82604051908082528060200260200182016040528015614d4157816020015b6060815260200190600190039081614d2c5790505b509050821515614d5357809350614dc1565b60009250600091505b8551821015614dbd57614d768683815181101515614ce657fe5b15614db2578582815181101515614d8957fe5b906020019060200201518184815181101515614da157fe5b602090810290910101526001909201915b600190910190614d5c565b8093505b50505092915050565b600b90565b604080517f6d616b654944537472696e6728696e742c6164647265737329000000000000008152905190819003601901812080825260e060020a8402600483018190526008830184905260609260ff90848160288160008681f1801515614e3557600080fd5b50606081016040529695505050505050565b600160a060020a038082166000908152601160205260408120549091829182911615614e7257600080fd5b601b60009054906101000a9004600160a060020a0316600160a060020a0316637708bc416040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015614ec557600080fd5b505af1158015614ed9573d6000803e3d6000fd5b505050506040513d6020811015614eef57600080fd5b50519150600160a060020a0384163214614f815750604080517ff2fde38b000000000000000000000000000000000000000000000000000000008152600160a060020a0385811660048301529151839283169163f2fde38b91602480830192600092919082900301818387803b158015614f6857600080fd5b505af1158015614f7c573d6000803e3d6000fd5b505050505b60408051600160a060020a038416815290517f56c4bf13bebaa9f2be39ac3f2f4619a0dd1b694bb8c5f43c6b244a6dba0f0cca9181900360200190a150600160a060020a0392831660009081526011602052604090208054600160a060020a031916938216939093179092555090565b8154831080156150015750805483105b151561500c57600080fd5b81546000190183146150d35780548190600019810190811061502a57fe5b90600052602060002001818481548110151561504257fe5b90600052602060002001908054600181600116156101000203166002900461506b929190615288565b5081548290600019810190811061507e57fe5b6000918252602090912001548254600160a060020a03909116908390859081106150a457fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055505b8054819060001981019081106150e557fe5b9060005260206000200160006150fb91906152fd565b805461510b826000198301615368565b5081548290600019810190811061511e57fe5b60009182526020909120018054600160a060020a0319169055815461428383600019830161538c565b600080600083519150845182111561515e57845191505b5060005b8181101561520357838181518110151561517857fe5b90602001015160f860020a900460f860020a027effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191685828151811015156151bb57fe5b60209101015160f860020a90819004027fff0000000000000000000000000000000000000000000000000000000000000016146151fb5760009250612f35565b600101615162565b506001949350505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061524f57805160ff191683800117855561527c565b8280016001018555821561527c579182015b8281111561527c578251825591602001919060010190615261565b5061271c9291506153ac565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106152c1578054855561527c565b8280016001018555821561527c57600052602060002091601f016020900482015b8281111561527c5782548255916001019190600101906152e2565b50805460018160011615610100020316600290046000825580601f106153235750615341565b601f01602090049060005260206000209081019061534191906153ac565b50565b815481835581811115613490576000838152602090206134909181019083016153c6565b815481835581811115613490576000838152602090206134909181019083016153e9565b815481835581811115613490576000838152602090206134909181019083015b6112e091905b8082111561271c57600081556001016153b2565b6112e091905b8082111561271c5760006153e082826152fd565b506001016153cc565b6112e091905b8082111561271c57600061540382826152fd565b506001016153ef5600a165627a7a7230582007b144d3500d8370b88765bd24ff7bafaf778bd289d593a191e63e6691fa27ce0029"
};
module.exports = contract;