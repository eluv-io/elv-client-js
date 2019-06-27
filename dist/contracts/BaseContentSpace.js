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
    "inputs": [],
    "name": "AccessRequest",
    "type": "event"
  }],
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c00000000000000000060009081557f41636365737369626c6532303139303232323133353930304d4c0000000000006006557f4564697461626c653230313930363037313035363030504f00000000000000006007557f436f6e7461696e657232303139303532393039313830304d4c00000000000000600b55600e557f55736572537061636532303139303530363135353330304d4c000000000000006010557f4e6f6465537061636532303139303532383137303130304d4c000000000000006012557f42617365436f6e74656e7453706163653230313930363132313230303030504f6017553480156200011257600080fd5b5060405162005242380380620052428339810160405280516001805432600160a060020a0319918216811790925560028054909116909117905501805162000162906018906020840190620001c6565b5060038054600160a060020a0319163017905560175460025460408051928352600160a060020a0391909116602083015280517f599bb380c80b69455450a615c515544b8da3b09f2efa116a5f0567682203cf549281900390910190a1506200026b565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200020957805160ff191683800117855562000239565b8280016001018555821562000239579182015b82811115620002395782518255916020019190600101906200021c565b50620002479291506200024b565b5090565b6200026891905b8082111562000247576000815560010162000252565b90565b614fc7806200027b6000396000f30060806040526004361061036a5763ffffffff60e060020a600035041662821de3811461036c57806302d05d3f1461039d57806306fdde03146103b25780630eaec2c51461043c5780630f58a7861461047157806314cfabb314610498578063160eee74146104ad5780631cdbee5a146105065780631f2caaec1461052757806326683e141461053f578063268bfac41461056057806329d00219146106d557806329dedde5146106f65780632cf99422146107175780632f7a781a1461073857806332eaf21b1461074d578063331b86c0146107625780633dd71d991461078957806340b89f061461079e57806341c0e1b5146107bf57806343f59ec7146107d4578063441c5aa3146107e9578063446e8826146107fe5780635272ae171461080657806352f82dd81461081e57806354fd4d5014610836578063575185ed1461084b5780635834028d14610860578063589aafc1146108815780635bb47808146108a257806363e6ffdd146108c357806364f0f050146108e4578063653a92f61461094b57806369e30ff8146109e25780636be9514c146109fa5780636d2e4b1b14610a125780636e37542714610a335780637284e41614610a485780637708bc4114610a5d5780637ca8f61814610a725780637ebf879c14610a8a57806385ce1df114610aab5780638d2a23db14610acc5780638da5cb5b14610b25578063904696a814610b3a57806390c3f38f14610b4f57806395a078e814610ba85780639867db7414610bc9578063991a3a7c14610c225780639b55f9011461043c5780639cb121ba14610c3a5780639d05d18d14610c5b578063a2d67fcf14610c7c578063a69cb73414610c91578063abe596b114610d28578063ac55c90614610d3d578063af570c0414610d96578063b2b99ec914610dab578063b8cfaf0514610dcc578063bf4e088f14610de1578063c287e0ed14610e08578063c45a015514610e1d578063c5c0369914610e32578063c65bcbe214610e47578063c82710c114610e5c578063c9e8e72d14610e71578063d6be0f4914610e92578063dd4c97a014610eb3578063e02dd9c214610ed4578063e542b7cb14610ee9578063e9861ab114610f80578063f15518871461112b578063f2fde38b14611140578063f41a158714611161578063fbd1b4ce14611176578063fd08919614611197578063fe7ac19f146111b8575b005b34801561037857600080fd5b5061038161124f565b60408051600160a060020a039092168252519081900360200190f35b3480156103a957600080fd5b5061038161125f565b3480156103be57600080fd5b506103c761126e565b6040805160208082528351818301528351919283929083019185019080838360005b838110156104015781810151838201526020016103e9565b50505050905090810190601f16801561042e5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561044857600080fd5b5061045d600160a060020a03600435166112fc565b604080519115158252519081900360200190f35b34801561047d57600080fd5b5061036a600160a060020a036004358116906024351661132d565b3480156104a457600080fd5b5061045d6114a2565b3480156104b957600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261036a9436949293602493928401919081908401838280828437509497506114b29650505050505050565b34801561051257600080fd5b50610381600160a060020a0360043516611865565b34801561053357600080fd5b50610381600435611880565b34801561054b57600080fd5b5061045d600160a060020a0360043516611b04565b34801561056c57600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526105f794369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750611b629650505050505050565b604051808060200180602001838103835285818151815260200191508051906020019080838360005b83811015610638578181015183820152602001610620565b50505050905090810190601f1680156106655780820380516001836020036101000a031916815260200191505b50838103825284518152845160209182019186019080838360005b83811015610698578181015183820152602001610680565b50505050905090810190601f1680156106c55780820380516001836020036101000a031916815260200191505b5094505050505060405180910390f35b3480156106e157600080fd5b5061045d600160a060020a0360043516611fab565b34801561070257600080fd5b5061045d600160a060020a0360043516611fb1565b34801561072357600080fd5b5061045d600160a060020a0360043516611fcf565b34801561074457600080fd5b506103816120ef565b34801561075957600080fd5b50610381612269565b34801561076e57600080fd5b50610777612278565b60408051918252519081900360200190f35b34801561079557600080fd5b5061045d61227e565b3480156107aa57600080fd5b50610381600160a060020a0360043516612283565b3480156107cb57600080fd5b5061036a61235e565b3480156107e057600080fd5b5061077761239a565b3480156107f557600080fd5b506103816123a0565b61045d6123af565b34801561081257600080fd5b506103c7600435612530565b34801561082a57600080fd5b506103816004356125a4565b34801561084257600080fd5b506107776125cc565b34801561085757600080fd5b506103816125d2565b34801561086c57600080fd5b5061045d600160a060020a036004351661269c565b34801561088d57600080fd5b506103c7600160a060020a0360043516612838565b3480156108ae57600080fd5b5061036a600160a060020a036004351661284b565b3480156108cf57600080fd5b50610381600160a060020a036004351661289b565b3480156108f057600080fd5b5060408051602060046024803582810135601f810185900485028601850190965285855261036a958335600160a060020a03169536956044949193909101919081908401838280828437509497506128b69650505050505050565b34801561095757600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261045d94369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750612afb9650505050505050565b3480156109ee57600080fd5b506103c7600435612e5e565b348015610a0657600080fd5b50610381600435612e6c565b348015610a1e57600080fd5b5061036a600160a060020a0360043516612e7a565b348015610a3f57600080fd5b5061045d612ec8565b348015610a5457600080fd5b506103c7612ed9565b348015610a6957600080fd5b50610381612f34565b348015610a7e57600080fd5b506103c7600435612f3f565b348015610a9657600080fd5b5061036a600160a060020a0360043516612f4d565b348015610ab757600080fd5b5061036a600160a060020a0360043516612f9d565b348015610ad857600080fd5b506040805160206004803580820135601f8101849004840285018401909552848452610777943694929360249392840191908190840183828082843750949750612fed9650505050505050565b348015610b3157600080fd5b50610381613055565b348015610b4657600080fd5b50610381613064565b348015610b5b57600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261036a9436949293602493928401919081908401838280828437509497506130739650505050505050565b348015610bb457600080fd5b5061045d600160a060020a03600435166130b8565b348015610bd557600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261036a9436949293602493928401919081908401838280828437509497506130be9650505050505050565b348015610c2e57600080fd5b506103816004356131ce565b348015610c4657600080fd5b5061045d600160a060020a03600435166131dc565b348015610c6757600080fd5b5061036a600160a060020a0360043516613233565b348015610c8857600080fd5b50610381613283565b348015610c9d57600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261036a94369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a99988101979196509182019450925082915084018382808284375094975061330f9650505050505050565b348015610d3457600080fd5b5061045d6133b6565b348015610d4957600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103c79436949293602493928401919081908401838280828437509497506134ad9650505050505050565b348015610da257600080fd5b5061038161365b565b348015610db757600080fd5b5061036a600160a060020a036004351661366a565b348015610dd857600080fd5b50610381613736565b348015610ded57600080fd5b50610381600160a060020a03600435811690602435166137fd565b348015610e1457600080fd5b5061036a6138e1565b348015610e2957600080fd5b506103816139b7565b348015610e3e57600080fd5b506103816139c6565b348015610e5357600080fd5b506107776139d5565b348015610e6857600080fd5b506103816139db565b348015610e7d57600080fd5b5061036a600160a060020a0360043516613a15565b348015610e9e57600080fd5b50610777600160a060020a0360043516613a65565b348015610ebf57600080fd5b5061036a600160a060020a0360043516613adb565b348015610ee057600080fd5b506103c7613d1c565b348015610ef557600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261036a94369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750949750613d779650505050505050565b348015610f8c57600080fd5b506040805160206004803580820135838102808601850190965280855261036a95369593946024949385019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750949750613e5f9650505050505050565b34801561113757600080fd5b5061045d614065565b34801561114c57600080fd5b5061036a600160a060020a0360043516614096565b34801561116d57600080fd5b506107776140fb565b34801561118257600080fd5b50610381600160a060020a0360043516614101565b3480156111a357600080fd5b5061045d600160a060020a036004351661411c565b3480156111c457600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261045d94369492936024939284019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a9998810197919650918201945092508291508401838280828437509497506142bf9650505050505050565b600354600160a060020a03165b90565b600154600160a060020a031681565b6018805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156112f45780601f106112c9576101008083540402835291602001916112f4565b820191906000526020600020905b8154815290600101906020018083116112d757829003601f168201915b505050505081565b600254600090600160a060020a03838116911614806113255750600254600160a060020a031633145b90505b919050565b600254600160a060020a03163214806113505750600254600160a060020a031633145b151561135b57600080fd5b600160a060020a038083166000908152600f6020526040902054161580156113895750611387826131dc565b155b1561143557600d54600e5410156113df5781600d600e548154811015156113ac57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a0316021790555061142b565b600d80546001810182556000919091527fd7b6990105719101dabeb77144f2a3385c8033acd3af97e9423a695e81ad1eb5018054600160a060020a031916600160a060020a0384161790555b600e805460010190555b600160a060020a038281166000818152600f60209081526040918290208054600160a060020a0319169486169485179055815192835282019290925281517f280016f7418306a55542432120fd1a239ef9fcc1a92694d8d44ca76be0249ea7929181900390910190a15050565b60006114ad33611b04565b905090565b6115e8601580548060200260200160405190810160405280929190818152602001828054801561150b57602002820191906000526020600020905b8154600160a060020a031681526001909101906020018083116114ed575b50505050506016805480602002602001604051908101604052809291908181526020016000905b828210156115dd5760008481526020908190208301805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156115c95780601f1061159e576101008083540402835291602001916115c9565b820191906000526020600020905b8154815290600101906020018083116115ac57829003601f168201915b505050505081526020019060010190611532565b50505050338461474d565b156115f257600080fd5b61171d601380548060200260200160405190810160405280929190818152602001828054801561164b57602002820191906000526020600020905b8154600160a060020a0316815260019091019060200180831161162d575b50505050506014805480602002602001604051908101604052809291908181526020016000905b828210156115dd5760008481526020908190208301805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156117095780601f106116de57610100808354040283529160200191611709565b820191906000526020600020905b8154815290600101906020018083116116ec57829003601f168201915b505050505081526020019060010190611672565b1561172757600080fd5b60155460641161173657600080fd5b6016805460018101808355600092909252825161177a917fd833147d7dc355ba459fc788f669e58cfaf9dc25ddcd0702e87d69c7b512428901906020850190614de4565b50506015805460018101825560009182527f55f448fdea98c4d29eb340757ef0a66cd03dbb9538908a6a81d96026b71ec475018054600160a060020a0319163390811790915560408051828152602081810183815286519383019390935285517fae5645569f32b946f7a747113c64094a29a6b84c5ddf55816ef4381ce8a3a46d958794926060850192908601918190849084905b8381101561182757818101518382015260200161180f565b50505050905090810190601f1680156118545780820380516001836020036101000a031916815260200191505b50935050505060405180910390a150565b600f60205260009081526040902054600160a060020a031681565b600080805b600d54821015611af857600d80548390811061189d57fe5b6000918252602091829020015460408051808401889052815180820385018152908201918290528051600160a060020a03909316945092909182918401908083835b602083106118fe5780518252601f1990920191602091820191016118df565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390206000191681600160a060020a031663e02dd9c26040518163ffffffff1660e060020a028152600401600060405180830381600087803b15801561196d57600080fd5b505af1158015611981573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405260208110156119aa57600080fd5b8101908080516401000000008111156119c257600080fd5b820160208101848111156119d557600080fd5b81516401000000008111828201871017156119ef57600080fd5b50509291905050506040516020018082805190602001908083835b60208310611a295780518252601f199092019160209182019101611a0a565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b60208310611a8c5780518252601f199092019160209182019101611a6d565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415611aed57600d805483908110611ad157fe5b600091825260209091200154600160a060020a03169250611afd565b600190910190611885565b600092505b5050919050565b6000805b601354811015611b575782600160a060020a0316601382815481101515611b2b57fe5b600091825260209091200154600160a060020a03161415611b4f5760019150611b5c565b600101611b08565b600091505b50919050565b6060806060806060806000601f896040518082805190602001908083835b60208310611b9f5780518252601f199092019160209182019101611b80565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015611c8f5760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015611c7b5780601f10611c5057610100808354040283529160200191611c7b565b820191906000526020600020905b815481529060010190602001808311611c5e57829003601f168201915b505050505081526020019060010190611be4565b5050505094506020896040518082805190602001908083835b60208310611cc75780518252601f199092019160209182019101611ca8565b518151600019602094850361010090810a820192831692199390931691909117909252949092019687526040805197889003820188208054601f6002600183161590980290950116959095049283018290048202880182019052818752929450925050830182828015611d7b5780601f10611d5057610100808354040283529160200191611d7b565b820191906000526020600020905b815481529060010190602001808311611d5e57829003601f168201915b50505050509350845160001415611da8578360206040519081016040528060008152509096509650611f9f565b611db2858961489b565b9250600090505b8251811015611f98576001835103811415611e9d57818382815181101515611ddd57fe5b906020019060200201516040516020018083805190602001908083835b60208310611e195780518252601f199092019160209182019101611dfa565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310611e615780518252601f199092019160209182019101611e42565b6001836020036101000a038019825116818451168082178552505050505050905001925050506040516020818303038152906040529150611f90565b818382815181101515611eac57fe5b906020019060200201516040516020018083805190602001908083835b60208310611ee85780518252601f199092019160209182019101611ec9565b51815160209384036101000a600019018019909216911617905285519190930192850191508083835b60208310611f305780518252601f199092019160209182019101611f11565b6001836020036101000a038019825116818451168082178552505050505050905001807f2c000000000000000000000000000000000000000000000000000000000000008152506001019250505060405160208183030381529060405291505b600101611db9565b8184965096505b50505050509250929050565b50600090565b6000600e5460001415611fc657506001611328565b611325826131dc565b60008033600160a060020a03841614611fe757600080fd5b82905080600160a060020a0316638280dd8f60006040518263ffffffff1660e060020a02815260040180828152602001915050602060405180830381600087803b15801561203457600080fd5b505af1158015612048573d6000803e3d6000fd5b505050506040513d602081101561205e57600080fd5b5050604080517f27c1c21d0000000000000000000000000000000000000000000000000000000081529051600160a060020a038316916327c1c21d9160048083019260209291908290030181600087803b1580156120bb57600080fd5b505af11580156120cf573d6000803e3d6000fd5b505050506040513d60208110156120e557600080fd5b5051159392505050565b336000908152601e602052604081205481908190600160a060020a03161561211657600080fd5b600091505b60135482101561216157601380543391908490811061213657fe5b600091825260209091200154600160a060020a0316141561215657612161565b60019091019061211b565b601354821061216f57600080fd5b601a54604080517f5c6dc2190000000000000000000000000000000000000000000000000000000081523360048201529051600160a060020a0390921691635c6dc219916024808201926020929091908290030181600087803b1580156121d557600080fd5b505af11580156121e9573d6000803e3d6000fd5b505050506040513d60208110156121ff57600080fd5b5051336000908152601e60209081526040918290208054600160a060020a031916600160a060020a038516908117909155825190815291519293507f4575facd117046c9c28b69a3eb9c08939f2462a5a22ea6c6dcd4f79b8dd124e992918290030190a192915050565b600c54600160a060020a031681565b60095490565b600090565b601c54604080517f40b89f06000000000000000000000000000000000000000000000000000000008152600160a060020a0384811660048301529151600093849316916340b89f0691602480830192602092919082900301818787803b1580156122ec57600080fd5b505af1158015612300573d6000803e3d6000fd5b505050506040513d602081101561231657600080fd5b505160408051600160a060020a038316815290519192507f473c07a6d0228c4fb8fe2be3b4617c3b5fb7c0f8cd9ba4b67e8631844b9b6571919081900360200190a192915050565b600254600160a060020a03163214806123815750600254600160a060020a031633145b151561238c57600080fd5b600254600160a060020a0316ff5b60145490565b601c54600160a060020a031681565b60006123b96114a2565b15156123c457600080fd5b60006008805460018160011615610100020316600290049050111561243d576009805460018181018084556000939093526008805461243a937f6e1540171b6c0c960b71a7020d9f60077f6af931a8bbf590da0223dacf75c7af0192600261010091831615919091026000190190911604614e5e565b50505b600a80546124609160089160026000196101006001841615020190911604614e5e565b5060408051602081019182905260009081905261247f91600a91614de4565b5060408051602080825260088054600260001961010060018416150201909116049183018290527f5ae4ddb3009a8ccdedc04b2011fc66a472807bcdcff04af16286ddb27819ebe19390929182918201908490801561251f5780601f106124f45761010080835404028352916020019161251f565b820191906000526020600020905b81548152906001019060200180831161250257829003601f168201915b50509250505060405180910390a190565b601480548290811061253e57fe5b600091825260209182902001805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152935090918301828280156112f45780601f106112c9576101008083540402835291602001916112f4565b60138054829081106125b257fe5b600091825260209091200154600160a060020a0316905081565b60175481565b600080601a60009054906101000a9004600160a060020a0316600160a060020a031663575185ed6040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561262857600080fd5b505af115801561263c573d6000803e3d6000fd5b505050506040513d602081101561265257600080fd5b505160408051600160a060020a038316815290519192507fa3b1fe71ae61bad8cffa485b230e24e518938f76182a30fa0d9979e7237ad159919081900360200190a18091505b5090565b600160a060020a0380821660009081526011602052604081205490918291829116156126cb5760009250611afd565b601b60009054906101000a9004600160a060020a0316600160a060020a0316637708bc416040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561271e57600080fd5b505af1158015612732573d6000803e3d6000fd5b505050506040513d602081101561274857600080fd5b5051604080517ff2fde38b000000000000000000000000000000000000000000000000000000008152600160a060020a03878116600483015291519294508493509083169163f2fde38b9160248082019260009290919082900301818387803b1580156127b457600080fd5b505af11580156127c8573d6000803e3d6000fd5b505050600160a060020a038086166000908152601160209081526040918290208054938716600160a060020a031990941684179055815192835290517f56c4bf13bebaa9f2be39ac3f2f4619a0dd1b694bb8c5f43c6b244a6dba0f0cca9350918290030190a15060019392505050565b60606113256128456149a0565b836149a5565b600254600160a060020a031632148061286e5750600254600160a060020a031633145b151561287957600080fd5b601a8054600160a060020a031916600160a060020a0392909216919091179055565b601160205260009081526040902054600160a060020a031681565b600254600160a060020a03163214806128d95750600254600160a060020a031633145b15156128e457600080fd5b612a1a601380548060200260200160405190810160405280929190818152602001828054801561293d57602002820191906000526020600020905b8154600160a060020a0316815260019091019060200180831161291f575b50505050506014805480602002602001604051908101604052809291908181526020016000905b82821015612a0f5760008481526020908190208301805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156129fb5780601f106129d0576101008083540402835291602001916129fb565b820191906000526020600020905b8154815290600101906020018083116129de57829003601f168201915b505050505081526020019060010190612964565b50505050848461474d565b15612a2457600080fd5b6013805460018082019092557f66de8ffda797e3de9c05e8fc57b3bf0ec28a930d40b0d285d93c06501cf6a090018054600160a060020a031916600160a060020a0385161790556014805491820180825560009190915282519091612ab2917fce6d7b5282bd9a3661ae061feed1dbda4e52ab073b1f9285be6e155d9c38d4ec909101906020850190614de4565b505060408051338152600160a060020a038416602082015281517f2bb0f9ba138ffddb5a8f974e9885b65a7814d3002654f1cf3f2d3f619a4006c4929181900390910190a15050565b6002546000906060908290600160a060020a0316321480612b265750600254600160a060020a031633145b1515612b3157600080fd5b601f856040518082805190602001908083835b60208310612b635780518252601f199092019160209182019101612b44565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b82821015612c535760008481526020908190208301805460408051601f6002600019610100600187161502019094169390930492830185900485028101850190915281815292830182828015612c3f5780601f10612c1457610100808354040283529160200191612c3f565b820191906000526020600020905b815481529060010190602001808311612c2257829003601f168201915b505050505081526020019060010190612ba8565b505050509150600090505b8151811015612d8f57836040518082805190602001908083835b60208310612c975780518252601f199092019160209182019101612c78565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912085519093508592508491508110612cd357fe5b906020019060200201516040518082805190602001908083835b60208310612d0c5780518252601f199092019160209182019101612ced565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415612d8757604080513381526001602082015281517fdf8127994c229011ce9c4764bdc0375bb71c06cf1544f034cd81a42f37233319929181900390910190a160009250612e56565b600101612c5e565b601f856040518082805190602001908083835b60208310612dc15780518252601f199092019160209182019101612da2565b51815160209384036101000a600019018019909216911617905292019485525060405193849003810190932080546001810180835560009283529185902089519295612e14955091019250880190614de4565b5050604080513381526000602082015281517fdf8127994c229011ce9c4764bdc0375bb71c06cf1544f034cd81a42f37233319929181900390910190a1600192505b505092915050565b601680548290811061253e57fe5b60158054829081106125b257fe5b600154600160a060020a03163214612e9157600080fd5b600160a060020a0381161515612ea657600080fd5b60018054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a0316321490565b6019805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156112f45780601f106112c9576101008083540402835291602001916112f4565b60006114ad32614a1d565b600980548290811061253e57fe5b600254600160a060020a0316321480612f705750600254600160a060020a031633145b1515612f7b57600080fd5b601b8054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a0316321480612fc05750600254600160a060020a031633145b1515612fcb57600080fd5b601d8054600160a060020a031916600160a060020a0392909216919091179055565b6000601f826040518082805190602001908083835b602083106130215780518252601f199092019160209182019101613002565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922054949350505050565b600254600160a060020a031681565b601d54600160a060020a031681565b600254600160a060020a03163214806130965750600254600160a060020a031633145b15156130a157600080fd5b80516130b4906019906020840190614de4565b5050565b50600190565b6130c6612ec8565b15156130d157600080fd5b80516080116130df57600080fd5b80516130f290600a906020840190614de4565b506003547fb3ac059d88af6016aca1aebb7b3e796f2e7420435c59c563687814e9b85daa7590600160a060020a031661312961124f565b60408051600160a060020a038085168252831660208201526060918101828152600a805460026000196101006001841615020190911604938301849052926080830190849080156131bb5780601f10613190576101008083540402835291602001916131bb565b820191906000526020600020905b81548152906001019060200180831161319e57829003601f168201915b505094505050505060405180910390a150565b600d8054829081106125b257fe5b600080805b600e5481101561322c5783600160a060020a0316600d8281548110151561320457fe5b600091825260209091200154600160a060020a0316141561322457600191505b6001016131e1565b5092915050565b600254600160a060020a03163214806132565750600254600160a060020a031633145b151561326157600080fd5b601c8054600160a060020a031916600160a060020a0392909216919091179055565b326000908152601160205260408120548190600160a060020a031615156132b3576132ac612f34565b90506132ce565b5032600090815260116020526040902054600160a060020a03165b60408051600160a060020a038316815290517f1c917c3c2698bd5b98acb9772728da62f2ce3670e4578910a6465b955f63e1579181900360200190a1919050565b600254600160a060020a03163214806133325750600254600160a060020a031633145b151561333d57600080fd5b806020836040518082805190602001908083835b602083106133705780518252601f199092019160209182019101613351565b51815160209384036101000a600019018019909216911617905292019485525060405193849003810190932084516133b19591949190910192509050614de4565b505050565b336000908152601e60205260408120548190600160a060020a031615156133dc57600080fd5b50336000908152601e60205260408082208054600160a060020a0319811690915581517f41c0e1b50000000000000000000000000000000000000000000000000000000081529151600160a060020a039091169283926341c0e1b5926004808301939282900301818387803b15801561345457600080fd5b505af1158015613468573d6000803e3d6000fd5b505060408051600160a060020a038516815290517fb98695ab4c6cedb3b4dfe62479a9d39a59aa2cb38b8bd92bbb6ce5856e42bdf49350908190036020019150a15090565b60606000806020845111151561356757505081518083015160008181526004602090815260409182902080548351601f60026101006001851615026000190190931692909204918201849004840281018401909452808452939493909183018282801561355b5780601f106135305761010080835404028352916020019161355b565b820191906000526020600020905b81548152906001019060200180831161353e57829003601f168201915b50505050509250611afd565b6005846040518082805190602001908083835b602083106135995780518252601f19909201916020918201910161357a565b518151600019602094850361010090810a820192831692199390931691909117909252949092019687526040805197889003820188208054601f600260018316159098029095011695909504928301829004820288018201905281875292945092505083018282801561364d5780601f106136225761010080835404028352916020019161364d565b820191906000526020600020905b81548152906001019060200180831161363057829003601f168201915b505050505092505050919050565b600354600160a060020a031681565b600254600090600160a060020a03163214806136905750600254600160a060020a031633145b151561369b57600080fd5b5060005b6013548110156130b45781600160a060020a03166013828154811015156136c257fe5b600091825260209091200154600160a060020a0316141561372e576136ea8160136014614bc7565b60408051338152600160a060020a038416602082015281517f41ec5b9efdbf61871df6a18b687e04bea93d5793af5f8c8b4626e155b23dc19d929181900390910190a15b60010161369f565b600080601a60009054906101000a9004600160a060020a0316600160a060020a031663b8cfaf056040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561378c57600080fd5b505af11580156137a0573d6000803e3d6000fd5b505050506040513d60208110156137b657600080fd5b505160408051600160a060020a038316815290519192507f9e69777f30c55126be256664fa7beff4b796ac32ebceab94df5071b0148017f8919081900360200190a1919050565b601d54604080517fbf4e088f000000000000000000000000000000000000000000000000000000008152600160a060020a038581166004830152848116602483015291516000938493169163bf4e088f91604480830192602092919082900301818787803b15801561386e57600080fd5b505af1158015613882573d6000803e3d6000fd5b505050506040513d602081101561389857600080fd5b505160408051600160a060020a038316815290519192507fa0633ea0b3cb5796607e5f551ae79c7eeee0dc7ee0c3ff8996506261651368ce919081900360200190a19392505050565b600254600160a060020a03163314806138fd57506138fd6114a2565b151561390857600080fd5b60408051602080825260088054600260001961010060018416150201909116049183018290527f403f30aa5f4f2f89331a7b50054f64a00ce206f4d0a37f566ff344bbe46f8b65939092918291820190849080156139a75780601f1061397c576101008083540402835291602001916139a7565b820191906000526020600020905b81548152906001019060200180831161398a57829003601f168201915b50509250505060405180910390a1565b601a54600160a060020a031681565b601b54600160a060020a031681565b600e5481565b6040805132815290516000917f53ce35a7383a3ea3f695bdf0f87d7e5485ba816b382673e849bfdd24e7f5e3ca919081900360200190a190565b600254600160a060020a0316321480613a385750600254600160a060020a031633145b1515613a4357600080fd5b600c8054600160a060020a031916600160a060020a0392909216919091179055565b60006060613a7283612838565b9050601f816040518082805190602001908083835b60208310613aa65780518252601f199092019160209182019101613a87565b51815160209384036101000a600019018019909216911617905292019485525060405193849003019092205495945050505050565b6002546000908190600160a060020a0316321480613b035750600254600160a060020a031633145b1515613b0e57600080fd5b5060009050805b601554811015613d105782600160a060020a0316601582815481101515613b3857fe5b600091825260209091200154600160a060020a03161415613d08576013601582815481101515613b6457fe5b6000918252602080832090910154835460018101855593835291209091018054600160a060020a031916600160a060020a03909216919091179055601680546014919083908110613bb157fe5b60009182526020808320845460018181018088559686529290942092018054613bf59493909301929091600261010091831615919091026000190190911604614e5e565b50507fd644c8164f225d3b7fdbcc404f279bb1e823ef0d93f88dd4b24e85d0e7bc6a54601582815481101515613c2757fe5b60009182526020909120015460168054600160a060020a039092169184908110613c4d57fe5b600091825260209182902060408051600160a060020a0386168152938401818152919092018054600260001961010060018416150201909116049284018390529291606083019084908015613ce35780601f10613cb857610100808354040283529160200191613ce3565b820191906000526020600020905b815481529060010190602001808311613cc657829003601f168201915b5050935050505060405180910390a1613cff8160156016614bc7565b60019150613d10565b600101613b15565b8115156133b157600080fd5b6008805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156112f45780601f106112c9576101008083540402835291602001916112f4565b6002546000908190600160a060020a0316321480613d9f5750600254600160a060020a031633145b1515613daa57600080fd5b8351602010613de357505081518083015160008181526004602090815260409091208451929392613ddd92860190614de4565b50613e59565b826005856040518082805190602001908083835b60208310613e165780518252601f199092019160209182019101613df7565b51815160209384036101000a60001901801990921691161790529201948552506040519384900381019093208451613e579591949190910192509050614de4565b505b50505050565b60025460009081908190600160a060020a0316331480613e8757506000613e8533613a65565b115b1515613e9257600080fd5b88518a5114613ea057600080fd5b8751895114613eae57600080fd5b8651885114613ebc57600080fd5b8551875114613eca57600080fd5b8451865114613ed857600080fd5b8351855114613ee657600080fd5b600092505b8951831015614059578683815181101515613f0257fe5b90602001906020020151915081600160a060020a031663508ad278338c86815181101515613f2c57fe5b906020019060200201518c87815181101515613f4457fe5b906020019060200201518c88815181101515613f5c57fe5b906020019060200201518b89815181101515613f7457fe5b906020019060200201518b8a815181101515613f8c57fe5b906020019060200201518b8b815181101515613fa457fe5b60209081029091018101516040805160e060020a63ffffffff8c16028152600160a060020a03998a16600482015260ff90981660248901526044880196909652606487019490945291909516608485015260a484019490945260c48301525160e480830193928290030181600087803b15801561402057600080fd5b505af1158015614034573d6000803e3d6000fd5b505050506040513d602081101561404a57600080fd5b50519050600190920191613eeb565b50505050505050505050565b6040516000907fed78a9defa7412748c9513ba9cf680f57703a46dd7e0fb0b1e94063423c73e88908290a150600190565b600254600160a060020a03163214806140b95750600254600160a060020a031633145b15156140c457600080fd5b600160a060020a03811615156140d957600080fd5b60028054600160a060020a031916600160a060020a0392909216919091179055565b60165490565b601e60205260009081526040902054600160a060020a031681565b60025460009081908190600160a060020a03163214806141465750600254600160a060020a031633145b151561415157600080fd5b5050600e546000190160005b600e54811015611af85783600160a060020a0316600d8281548110151561418057fe5b600091825260209091200154600160a060020a031614156142b757600d8054829081106141a957fe5b60009182526020909120018054600160a060020a031916905580821461424e57600d8054839081106141d757fe5b600091825260209091200154600d8054600160a060020a0390921691839081106141fd57fe5b60009182526020909120018054600160a060020a031916600160a060020a0392909216919091179055600d80548390811061423457fe5b60009182526020909120018054600160a060020a03191690555b600e829055600160a060020a0384166000818152600f60209081526040918290208054600160a060020a0319169055815192835290517fd41375b9d347dfe722f90a780731abd23b7855f9cf14ea7063c4cab5f9ae58e29281900390910190a160019250611afd565b60010161415d565b6002546000906060908290600160a060020a03163214806142ea5750600254600160a060020a031633145b15156142f557600080fd5b601f856040518082805190602001908083835b602083106143275780518252601f199092019160209182019101614308565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820185208054808402870184019092528186529350915060009084015b828210156144175760008481526020908190208301805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152928301828280156144035780601f106143d857610100808354040283529160200191614403565b820191906000526020600020905b8154815290600101906020018083116143e657829003601f168201915b50505050508152602001906001019061436c565b505050509150600090505b815181101561470757836040518082805190602001908083835b6020831061445b5780518252601f19909201916020918201910161443c565b5181516020939093036101000a600019018019909116921691909117905260405192018290039091208551909350859250849150811061449757fe5b906020019060200201516040518082805190602001908083835b602083106144d05780518252601f1990920191602091820191016144b1565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390206000191614156146ff5781516000190181146145bb5781518290600019810190811061452557fe5b90602001906020020151601f866040518082805190602001908083835b602083106145615780518252601f199092019160209182019101614542565b51815160209384036101000a600019018019909216911617905292019485525060405193849003019092208054909250849150811061459c57fe5b9060005260206000200190805190602001906145b9929190614de4565b505b601f856040518082805190602001908083835b602083106145ed5780518252601f1990920191602091820191016145ce565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020600183510381548110151561463157fe5b9060005260206000200160006146479190614ed3565b6001601f866040518082805190602001908083835b6020831061467b5780518252601f19909201916020918201910161465c565b51815160209384036101000a60001901801990921691161790529201948552506040519384900301909220805493909303926146ba9250905082614f1a565b50604080513381526000602082015281517f5f463eb53cddf646852b82c0d9bdb1d1ec215c3802b780e8b7beea8b6e99f94c929181900390910190a160019250612e56565b600101614422565b604080513381526001602082015281517f5f463eb53cddf646852b82c0d9bdb1d1ec215c3802b780e8b7beea8b6e99f94c929181900390910190a1506000949350505050565b6000808451865114151561476057600080fd5b5060005b855181101561488d57826040518082805190602001908083835b6020831061479d5780518252601f19909201916020918201910161477e565b5181516020939093036101000a60001901801990911692169190911790526040519201829003909120885190935088925084915081106147d957fe5b906020019060200201516040518082805190602001908083835b602083106148125780518252601f1990920191602091820191016147f3565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161480614877575083600160a060020a0316868281518110151561486257fe5b90602001906020020151600160a060020a0316145b156148855760019150614892565b600101614764565b600091505b50949350505050565b6060600080825b85518210156148e3576148cc86838151811015156148bc57fe5b9060200190602002015186614d1d565b156148d8576001909201915b6001909101906148a2565b8260405190808252806020026020018201604052801561491757816020015b60608152602001906001900390816149025790505b50905082151561492957809350614997565b60009250600091505b85518210156149935761494c86838151811015156148bc57fe5b1561498857858281518110151561495f57fe5b90602001906020020151818481518110151561497757fe5b602090810290910101526001909201915b600190910190614932565b8093505b50505092915050565b600b90565b604080517f6d616b654944537472696e6728696e742c6164647265737329000000000000008152905190819003601901812080825260e060020a8402600483018190526008830184905260609260ff90848160288160008681f1801515614a0b57600080fd5b50606081016040529695505050505050565b600160a060020a038082166000908152601160205260408120549091829182911615614a4857600080fd5b601b60009054906101000a9004600160a060020a0316600160a060020a0316637708bc416040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015614a9b57600080fd5b505af1158015614aaf573d6000803e3d6000fd5b505050506040513d6020811015614ac557600080fd5b50519150600160a060020a0384163214614b575750604080517ff2fde38b000000000000000000000000000000000000000000000000000000008152600160a060020a0385811660048301529151839283169163f2fde38b91602480830192600092919082900301818387803b158015614b3e57600080fd5b505af1158015614b52573d6000803e3d6000fd5b505050505b60408051600160a060020a038416815290517f56c4bf13bebaa9f2be39ac3f2f4619a0dd1b694bb8c5f43c6b244a6dba0f0cca9181900360200190a150600160a060020a0392831660009081526011602052604090208054600160a060020a031916938216939093179092555090565b815483108015614bd75750805483105b1515614be257600080fd5b8154600019018314614ca957805481906000198101908110614c0057fe5b906000526020600020018184815481101515614c1857fe5b906000526020600020019080546001816001161561010002031660029004614c41929190614e5e565b50815482906000198101908110614c5457fe5b6000918252602090912001548254600160a060020a0390911690839085908110614c7a57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055505b805481906000198101908110614cbb57fe5b906000526020600020016000614cd19190614ed3565b8054614ce1826000198301614f1a565b50815482906000198101908110614cf457fe5b60009182526020909120018054600160a060020a03191690558154613e59836000198301614f3e565b6000806000835191508451821115614d3457845191505b5060005b81811015614dd9578381815181101515614d4e57fe5b90602001015160f860020a900460f860020a027effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168582815181101515614d9157fe5b60209101015160f860020a90819004027fff000000000000000000000000000000000000000000000000000000000000001614614dd15760009250612e56565b600101614d38565b506001949350505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10614e2557805160ff1916838001178555614e52565b82800160010185558215614e52579182015b82811115614e52578251825591602001919060010190614e37565b50612698929150614f5e565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10614e975780548555614e52565b82800160010185558215614e5257600052602060002091601f016020900482015b82811115614e52578254825591600101919060010190614eb8565b50805460018160011615610100020316600290046000825580601f10614ef95750614f17565b601f016020900490600052602060002090810190614f179190614f5e565b50565b8154818355818111156133b1576000838152602090206133b1918101908301614f78565b8154818355818111156133b1576000838152602090206133b19181019083015b61125c91905b808211156126985760008155600101614f64565b61125c91905b80821115612698576000614f928282614ed3565b50600101614f7e5600a165627a7a72305820f24e90f75aaf64056c5b055de07f65455b4dbd5df4e4386dd0332830a8d24e780029"
};
module.exports = contract;