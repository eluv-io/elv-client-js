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
    "constant": false,
    "inputs": [],
    "name": "cleanUpContentObjects",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "content_space",
      "type": "address"
    }],
    "name": "setContentSpace",
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
    "name": "members",
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
      "name": "obj",
      "type": "address"
    }],
    "name": "getContractRights",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "CATEGORY_CONTENT_OBJECT",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "candidate",
      "type": "address"
    }],
    "name": "grantAccess",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "getAccessGroupsLength",
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
    "name": "CATEGORY_GROUP",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
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
    "constant": true,
    "inputs": [{
      "name": "group",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }],
    "name": "checkAccessGroupRights",
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
    "name": "CATEGORY_LIBRARY",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "ACCESS_CONFIRMED",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "obj",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }, {
      "name": "access",
      "type": "uint8"
    }],
    "name": "setContractRights",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "position",
      "type": "uint256"
    }],
    "name": "getAccessGroup",
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
    "name": "cleanUpAll",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }, {
      "name": "",
      "type": "uint256"
    }, {
      "name": "",
      "type": "uint256"
    }, {
      "name": "",
      "type": "uint256"
    }, {
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "group",
      "type": "address"
    }],
    "name": "getAccessGroupRights",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "accessGroups",
    "outputs": [{
      "name": "category",
      "type": "uint8"
    }, {
      "name": "length",
      "type": "uint256"
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
    "constant": false,
    "inputs": [{
      "name": "obj",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }, {
      "name": "access",
      "type": "uint8"
    }],
    "name": "setContentObjectRights",
    "outputs": [],
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
    "inputs": [{
      "name": "candidate",
      "type": "address"
    }],
    "name": "hasManagerAccess",
    "outputs": [{
      "name": "",
      "type": "bool"
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
    "inputs": [],
    "name": "ACCESS_TENTATIVE",
    "outputs": [{
      "name": "",
      "type": "uint8"
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
    "constant": true,
    "inputs": [],
    "name": "getContentTypesLength",
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
    "name": "TYPE_EDIT",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "obj",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }],
    "name": "checkContentObjectRights",
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
    "inputs": [],
    "name": "CATEGORY_CONTRACT",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "lib",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }],
    "name": "checkLibraryRights",
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
    "name": "CATEGORY_CONTENT_TYPE",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "obj",
      "type": "address"
    }],
    "name": "getContentObjectRights",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "contracts",
    "outputs": [{
      "name": "category",
      "type": "uint8"
    }, {
      "name": "length",
      "type": "uint256"
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
    "inputs": [{
      "name": "position",
      "type": "uint256"
    }],
    "name": "getContract",
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
      "name": "manager",
      "type": "address"
    }],
    "name": "grantManagerAccess",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "contractExists",
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
      "name": "lib",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }, {
      "name": "access",
      "type": "uint8"
    }],
    "name": "setLibraryRights",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "index_type",
      "type": "uint8"
    }, {
      "name": "obj",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }],
    "name": "checkRights",
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
    "name": "ACCESS_NONE",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "cleanUpContentTypes",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "candidate",
      "type": "address"
    }],
    "name": "revokeAccess",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "obj",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }, {
      "name": "access",
      "type": "uint8"
    }],
    "name": "setContentTypeRights",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
    "constant": false,
    "inputs": [],
    "name": "cleanUpLibraries",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "candidate",
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
    "constant": true,
    "inputs": [],
    "name": "TYPE_SEE",
    "outputs": [{
      "name": "",
      "type": "uint8"
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
    "inputs": [],
    "name": "contentTypes",
    "outputs": [{
      "name": "category",
      "type": "uint8"
    }, {
      "name": "length",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "index_type",
      "type": "uint8"
    }, {
      "name": "obj",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }],
    "name": "checkDirectRights",
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
      "name": "obj",
      "type": "address"
    }],
    "name": "getContentTypeRights",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "obj",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }],
    "name": "checkContractRights",
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
    "name": "contentObjects",
    "outputs": [{
      "name": "category",
      "type": "uint8"
    }, {
      "name": "length",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "position",
      "type": "uint256"
    }],
    "name": "getContentType",
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
    "inputs": [],
    "name": "updateRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "libraries",
    "outputs": [{
      "name": "category",
      "type": "uint8"
    }, {
      "name": "length",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "getLibrariesLength",
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
      "name": "manager",
      "type": "address"
    }],
    "name": "revokeManagerAccess",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "position",
      "type": "uint256"
    }],
    "name": "getContentObject",
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
      "name": "position",
      "type": "uint256"
    }],
    "name": "getLibrary",
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
    "name": "TYPE_ACCESS",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "cleanUpAccessGroups",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
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
    "constant": true,
    "inputs": [],
    "name": "getContentObjectsLength",
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
      "name": "group",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }, {
      "name": "access",
      "type": "uint8"
    }],
    "name": "setAccessGroupRights",
    "outputs": [],
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
    "inputs": [{
      "name": "lib",
      "type": "address"
    }],
    "name": "getLibraryRights",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "getContractsLength",
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
    "name": "managers",
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
      "name": "obj",
      "type": "address"
    }, {
      "name": "access_type",
      "type": "uint8"
    }],
    "name": "checkContentTypeRights",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "name": "content_space",
      "type": "address"
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
      "name": "candidate",
      "type": "address"
    }],
    "name": "MemberAdded",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "candidate",
      "type": "address"
    }],
    "name": "ManagerAccessGranted",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "candidate",
      "type": "address"
    }],
    "name": "MemberRevoked",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "candidate",
      "type": "address"
    }],
    "name": "ManagerAccessRevoked",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "operationCode",
      "type": "uint256"
    }, {
      "indexed": false,
      "name": "candidate",
      "type": "address"
    }],
    "name": "UnauthorizedOperation",
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
    "inputs": [{
      "indexed": false,
      "name": "principal",
      "type": "address"
    }, {
      "indexed": false,
      "name": "entity",
      "type": "address"
    }, {
      "indexed": false,
      "name": "aggregate",
      "type": "uint8"
    }],
    "name": "RightsChanged",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "label",
      "type": "string"
    }, {
      "indexed": false,
      "name": "index",
      "type": "uint256"
    }, {
      "indexed": false,
      "name": "a",
      "type": "address"
    }],
    "name": "dbgAddress",
    "type": "event"
  }],
  "bytecode": "7f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f416363657373496e6465786f7232303139303532383139343230304d4c00000060045560058054600160ff19909116811761ff0019166102001762ff00001916620300001763ff000000191663040000001764ff0000000019166405000000001790915560e06040526080908152600a60a052606460c052620000ac906006906003620001ed565b507f4564697461626c653230313930373135313035363030504f0000000000000000601b557f42734163636573734374726c47727032303139303732323136313630304d4c006021553480156200010257600080fd5b506040516020806200369a83398101604090815290516001805432600160a060020a031991821681178084556002805484169092179091556005546007805462010000830460ff90811660ff1992831617909255600f805461010085048416908316179055600b8054838516908316179055601380546301000000850484169083161790556017805464010000000090940490921692811692909217905560038054909316600160a060020a039586161790925583166000908152602360209081528582208054841685179055835490941681526022909352929091208054909216179055620002ab565b600183019183908215620002755791602002820160005b838211156200024457835183826101000a81548160ff021916908360ff160217905550926020019260010160208160000104928301926001030262000204565b8015620002735782816101000a81549060ff021916905560010160208160000104928301926001030262000244565b505b506200028392915062000287565b5090565b620002a891905b808211156200028357805460ff191681556001016200028e565b90565b6133df80620002bb6000396000f30060806040526004361061036a5763ffffffff60e060020a600035041662821de3811461036c57806302d05d3f1461039d578063048bd529146103b2578063055af48f146103d957806308ae4b0c146103fa57806308d865d71461042f578063091600e6146104665780630ae5e7391461047b5780630dc10d3f1461049c57806312915a30146104b157806314cfabb3146104c657806315c0bac1146104db57806316aed232146105025780631868973314610517578063224dcba01461052c5780632d474cbd146105595780632fa5c84214610571578063304f4a7b146105b157806330e66949146105d2578063331b86c0146106045780633def51401461061957806341c0e1b51461064657806342e7ba7b1461065b578063446e88261461067c578063479a0c511461068457806354fd4d50146106995780635c1d3059146106ae5780635d97b6c2146105175780635faecb76146106c3578063628449fd146106ea5780636373a411146107745780636813b6d11461078957806368a0469a146107b057806369881c0c146107c55780636c0f79b6146107e65780636d2e4b1b146107fb5780636e3754271461081c5780636ebc8c861461083157806375861a95146108495780637709bc781461086a5780637886f7471461088b5780637ca8f618146108a35780637cbb7bf2146108bb5780637fb52f1a146108e85780638232f3f11461091657806385e0a2001461092b57806385e68531146109405780638635adb5146109615780638da5cb5b1461098e57806392297d7b146109a357806395a078e8146109b857806396eba03d146109165780639867db74146109d95780639f46133e14610a32578063a00b38c414610a47578063a4081d6214610a75578063a864dfa514610a96578063a980892d14610abd578063aa3f695214610ad2578063af570c0414610aea578063c287e0ed14610aff578063c4b1978d14610b14578063cb86806d14610b29578063cdb849b714610b3e578063cf8a750314610b5f578063d15d62a714610b77578063d1aeb65114610684578063d30f8cd014610b8f578063e02dd9c214610ba4578063e1a7071714610bb9578063ebe9314e14610c12578063f17bda9114610c27578063f2fde38b14610c54578063fb52222c14610c75578063fccc134f14610c96578063fdff9b4d14610cab578063fe538c5a14610ccc575b005b34801561037857600080fd5b50610381610cf3565b60408051600160a060020a039092168252519081900360200190f35b3480156103a957600080fd5b50610381610d03565b3480156103be57600080fd5b506103c7610d12565b60408051918252519081900360200190f35b3480156103e557600080fd5b5061036a600160a060020a0360043516610d23565b34801561040657600080fd5b5061041b600160a060020a0360043516610d73565b604080519115158252519081900360200190f35b34801561043b57600080fd5b50610450600160a060020a0360043516610d88565b6040805160ff9092168252519081900360200190f35b34801561047257600080fd5b50610450610da6565b34801561048757600080fd5b5061036a600160a060020a0360043516610daf565b3480156104a857600080fd5b506103c761103e565b3480156104bd57600080fd5b50610450611044565b3480156104d257600080fd5b5061041b611052565b3480156104e757600080fd5b5061041b600160a060020a036004351660ff602435166110ed565b34801561050e57600080fd5b5061045061110d565b34801561052357600080fd5b5061045061111c565b34801561053857600080fd5b5061036a600160a060020a036004351660ff60243581169060443516611121565b34801561056557600080fd5b50610381600435611133565b34801561057d57600080fd5b50610586611160565b6040805195865260208601949094528484019290925260608401526080830152519081900360a00190f35b3480156105bd57600080fd5b50610450600160a060020a03600435166111ab565b3480156105de57600080fd5b506105e76111c9565b6040805160ff909316835260208301919091528051918290030190f35b34801561061057600080fd5b506103c76111d8565b34801561062557600080fd5b5061036a600160a060020a036004351660ff602435811690604435166111de565b34801561065257600080fd5b5061036a6111eb565b34801561066757600080fd5b5061041b600160a060020a0360043516611227565b61041b61124a565b34801561069057600080fd5b5061045061141f565b3480156106a557600080fd5b506103c7611424565b3480156106ba57600080fd5b506103c761142a565b3480156106cf57600080fd5b5061041b600160a060020a036004351660ff60243516611430565b3480156106f657600080fd5b506106ff611444565b6040805160208082528351818301528351919283929083019185019080838360005b83811015610739578181015183820152602001610721565b50505050905090810190601f1680156107665780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561078057600080fd5b506104506114d2565b34801561079557600080fd5b5061041b600160a060020a036004351660ff602435166114e3565b3480156107bc57600080fd5b506104506114fd565b3480156107d157600080fd5b50610450600160a060020a036004351661150d565b3480156107f257600080fd5b506105e761152b565b34801561080757600080fd5b5061036a600160a060020a036004351661153a565b34801561082857600080fd5b5061041b611588565b34801561083d57600080fd5b50610381600435611599565b34801561085557600080fd5b5061036a600160a060020a03600435166115ab565b34801561087657600080fd5b5061041b600160a060020a0360043516611738565b34801561089757600080fd5b506103c7600435611740565b3480156108af57600080fd5b506106ff60043561175f565b3480156108c757600080fd5b5061036a600160a060020a036004351660ff602435811690604435166117d3565b3480156108f457600080fd5b5061041b60ff600435811690600160a060020a036024351690604435166117e0565b34801561092257600080fd5b50610450611997565b34801561093757600080fd5b506103c761199c565b34801561094c57600080fd5b5061036a600160a060020a03600435166119a8565b34801561096d57600080fd5b5061036a600160a060020a036004351660ff60243581169060443516611baa565b34801561099a57600080fd5b50610381611bb7565b3480156109af57600080fd5b506103c7611bc6565b3480156109c457600080fd5b5061041b600160a060020a0360043516611bd2565b3480156109e557600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261036a943694929360249392840191908190840183828082843750949750611bf59650505050505050565b348015610a3e57600080fd5b506105e7611d07565b348015610a5357600080fd5b5061041b60ff600435811690600160a060020a03602435169060443516611d16565b348015610a8157600080fd5b50610450600160a060020a0360043516611e72565b348015610aa257600080fd5b5061041b600160a060020a036004351660ff60243516611e90565b348015610ac957600080fd5b506105e7611eac565b348015610ade57600080fd5b50610381600435611ebb565b348015610af657600080fd5b50610381611ecd565b348015610b0b57600080fd5b5061036a611edc565b348015610b2057600080fd5b506105e7611fb2565b348015610b3557600080fd5b506103c7611fc1565b348015610b4a57600080fd5b5061036a600160a060020a0360043516611fc7565b348015610b6b57600080fd5b5061038160043561213b565b348015610b8357600080fd5b5061038160043561214d565b348015610b9b57600080fd5b506103c761215f565b348015610bb057600080fd5b506106ff61216b565b348015610bc557600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526103c79436949293602493928401919081908401838280828437509497506121c69650505050505050565b348015610c1e57600080fd5b506103c761276e565b348015610c3357600080fd5b5061036a600160a060020a036004351660ff60243581169060443516612774565b348015610c6057600080fd5b5061036a600160a060020a0360043516612781565b348015610c8157600080fd5b50610450600160a060020a03600435166127e6565b348015610ca257600080fd5b506103c7612804565b348015610cb757600080fd5b5061041b600160a060020a036004351661280a565b348015610cd857600080fd5b5061041b600160a060020a036004351660ff6024351661281f565b600354600160a060020a03165b90565b600154600160a060020a031681565b6000610d1e600b61283a565b905090565b600254600160a060020a0316321480610d465750600254600160a060020a031633145b1515610d5157600080fd5b60038054600160a060020a031916600160a060020a0392909216919091179055565b60226020526000908152604090205460ff1681565b600160a060020a031660009081526018602052604090205460ff1690565b60055460ff1681565b336000908152602360205260408120548190819060ff161515600114610dd457600080fd5b600160a060020a038416600081815260226020908152604091829020805460ff19166001179055815192835290517fb251eb052afc73ffd02ffe85ad79990a8b3fed60d76dbc2fa2fdd7123dffd9149281900390910190a16003546040805160e060020a6363e6ffdd028152600160a060020a038781166004830152915191909216945084916363e6ffdd9160248083019260209291908290030181600087803b158015610e8157600080fd5b505af1158015610e95573d6000803e3d6000fd5b505050506040513d6020811015610eab57600080fd5b5051604080517fd1aeb6510000000000000000000000000000000000000000000000000000000081529051919350839250600160a060020a0383169163f17bda91913091849163d1aeb6519160048083019260209291908290030181600087803b158015610f1857600080fd5b505af1158015610f2c573d6000803e3d6000fd5b505050506040513d6020811015610f4257600080fd5b5051604080517f479a0c510000000000000000000000000000000000000000000000000000000081529051600160a060020a0387169163479a0c519160048083019260209291908290030181600087803b158015610f9f57600080fd5b505af1158015610fb3573d6000803e3d6000fd5b505050506040513d6020811015610fc957600080fd5b50516040805160e060020a63ffffffff8716028152600160a060020a03909416600485015260ff92831660248501529116604483015251606480830192600092919082900301818387803b15801561102057600080fd5b505af1158015611034573d6000803e3d6000fd5b5050505050505050565b60125490565b600554610100900460ff1681565b600354604080517f26683e140000000000000000000000000000000000000000000000000000000081523360048201529051600092600160a060020a03169182916326683e149160248082019260209290919082900301818887803b1580156110ba57600080fd5b505af11580156110ce573d6000803e3d6000fd5b505050506040513d60208110156110e457600080fd5b505191505b5090565b60055460009061110690610100900460ff1684846117e0565b9392505050565b60055462010000900460ff1681565b600281565b61112e6017848484612aa7565b505050565b60118054600091908390811061114557fe5b600091825260209091200154600160a060020a031692915050565b6000806000806000611172600761283a565b61117c600f61283a565b611186600b61283a565b611190601361283a565b61119a601761283a565b945094509450945094509091929394565b600160a060020a031660009081526010602052604090205460ff1690565b600f5460125460ff9091169082565b601e5490565b61112e600b848484612aa7565b600254600160a060020a031632148061120e5750600254600160a060020a031633145b151561121957600080fd5b600254600160a060020a0316ff5b600160a060020a031660009081526023602052604090205460ff16151560011490565b6000611254611052565b151561125f57600080fd5b6000601c805460018160011615610100020316600290049050111561130e57601e80546001818101808455600093909352601c80546112d5937f50bb669a95c7b50b7e8a6f09454034b2b14cf2b85c730dca9a539ca82cb6e35001926002610100918316159190910260001901909116046131d9565b5050601d54601f80546001810182556000919091527fa03837a25210ee280c2113ff4b77ca23440b19d4866cca721c801278fd08d80701555b6020805461133191601c91600260001961010060018416150201909116046131d9565b5042601d556040805160208181019283905260009182905261135492909161325a565b5060035460408051600160a060020a0390921680835260208301828152601c8054600260001960018316156101000201909116049385018490527f482875da75e6d9f93f74a5c1a61f14cf08822057c01232f44cb92ae998e30d8e9492939092919060608301908490801561140a5780601f106113df5761010080835404028352916020019161140a565b820191906000526020600020905b8154815290600101906020018083116113ed57829003601f168201915b5050935050505060405180910390a150600190565b600181565b60215481565b60165490565b6005546000906111069060ff1684846117e0565b6020805460408051601f600260001961010060018716150201909416939093049283018490048402810184019091528181529190828201828280156114ca5780601f1061149f576101008083540402835291602001916114ca565b820191906000526020600020905b8154815290600101906020018083116114ad57829003601f168201915b505050505081565b600554640100000000900460ff1681565b6005546000906111069062010000900460ff1684846117e0565b6005546301000000900460ff1681565b600160a060020a03166000908152600c602052604090205460ff1690565b601754601a5460ff9091169082565b600154600160a060020a0316321461155157600080fd5b600160a060020a038116151561156657600080fd5b60018054600160a060020a031916600160a060020a0392909216919091179055565b600254600160a060020a0316321490565b60198054600091908390811061114557fe5b60025460009081908190600160a060020a03163214806115d55750600254600160a060020a031633145b15156115e057600080fd5b600160a060020a03841660008181526023602090815260408083208054600160ff1991821681179092556022845293829020805490941617909255815192835290517f93bcaab179551bde429187645251f8e1fb8ac85801fcb1cf91eb2c9043d611179281900390910190a16003546040805160e060020a6363e6ffdd028152600160a060020a038781166004830152915191909216945084916363e6ffdd9160248083019260209291908290030181600087803b1580156116a157600080fd5b505af11580156116b5573d6000803e3d6000fd5b505050506040513d60208110156116cb57600080fd5b5051604080517f5d97b6c20000000000000000000000000000000000000000000000000000000081529051919350839250600160a060020a0383169163f17bda919130918491635d97b6c29160048083019260209291908290030181600087803b158015610f1857600080fd5b6000903b1190565b601f80548290811061174e57fe5b600091825260209091200154905081565b601e80548290811061176d57fe5b600091825260209182902001805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152935090918301828280156114ca5780601f1061149f576101008083540402835291602001916114ca565b61112e6007848484612aa7565b6000806000806000806117f4898989611d16565b94506001851515141561180a576001955061198b565b600091505b60125482101561190a57601180548390811061182757fe5b600091825260209091200154600160a060020a0316925082156118ff57604080517fa00b38c400000000000000000000000000000000000000000000000000000000815260ff808c166004830152600160a060020a038b81166024840152908a166044830152915194955085949185169163a00b38c4916064808201926020929091908290030181600087803b1580156118c057600080fd5b505af11580156118d4573d6000803e3d6000fd5b505050506040513d60208110156118ea57600080fd5b50511515600114156118ff576001955061198b565b60019091019061180f565b87905080600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561194b57600080fd5b505af115801561195f573d6000803e3d6000fd5b505050506040513d602081101561197557600080fd5b5051600254600160a060020a0390811691161495505b50505050509392505050565b600081565b6000610d1e601361283a565b336000908152602360205260408120548190819060ff161515600114806119d7575033600160a060020a038516145b15156119e257600080fd5b600160a060020a038416600081815260226020908152604091829020805460ff19169055815192835290517f745cd29407db644ed93e3ceb61cbcab96d1dfb496989ac5d5bf514fc5a9fab9c9281900390910190a16003546040805160e060020a6363e6ffdd028152600160a060020a038781166004830152915191909216945084916363e6ffdd9160248083019260209291908290030181600087803b158015611a8c57600080fd5b505af1158015611aa0573d6000803e3d6000fd5b505050506040513d6020811015611ab657600080fd5b5051604080517fd1aeb6510000000000000000000000000000000000000000000000000000000081529051919350839250600160a060020a03831691638635adb5913091849163d1aeb6519160048083019260209291908290030181600087803b158015611b2357600080fd5b505af1158015611b37573d6000803e3d6000fd5b505050506040513d6020811015611b4d57600080fd5b5051604080517f8232f3f10000000000000000000000000000000000000000000000000000000081529051600160a060020a03871691638232f3f19160048083019260209291908290030181600087803b158015610f9f57600080fd5b61112e6013848484612aa7565b600254600160a060020a031681565b6000610d1e600761283a565b600160a060020a031660009081526022602052604090205460ff16151560011490565b611bfd611588565b1515611c0857600080fd5b8051608011611c1657600080fd5b8051611c28906020908184019061325a565b506003547fb3ac059d88af6016aca1aebb7b3e796f2e7420435c59c563687814e9b85daa7590600160a060020a0316611c5f610cf3565b60408051600160a060020a038085168252831660208281019190915260609282018381528154600260001961010060018416150201909116049383018490529092608083019084908015611cf45780601f10611cc957610100808354040283529160200191611cf4565b820191906000526020600020905b815481529060010190602001808311611cd757829003601f168201915b505094505050505060405180910390a150565b60135460165460ff9091169082565b600080839050600260009054906101000a9004600160a060020a0316600160a060020a031681600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015611d7957600080fd5b505af1158015611d8d573d6000803e3d6000fd5b505050506040513d6020811015611da357600080fd5b5051600160a060020a03161415611dbd5760019150611e6a565b60055460ff86811691161415611de057611dd9600b8585612fa9565b9150611e6a565b60055460ff868116610100909204161415611e0157611dd9600f8585612fa9565b60055460ff86811662010000909204161415611e2357611dd960078585612fa9565b60055460ff868116640100000000909204161415611e4757611dd960178585612fa9565b60055460ff8681166301000000909204161415611e6a57611dd960138585612fa9565b509392505050565b600160a060020a031660009081526014602052604090205460ff1690565b60055460009061110690640100000000900460ff1684846117e0565b600b54600e5460ff9091169082565b60158054600091908390811061114557fe5b600354600160a060020a031681565b600254600160a060020a0316331480611ef85750611ef8611052565b1515611f0357600080fd5b604080516020808252601c8054600260001961010060018416150201909116049183018290527f403f30aa5f4f2f89331a7b50054f64a00ce206f4d0a37f566ff344bbe46f8b6593909291829182019084908015611fa25780601f10611f7757610100808354040283529160200191611fa2565b820191906000526020600020905b815481529060010190602001808311611f8557829003601f168201915b50509250505060405180910390a1565b600754600a5460ff9091169082565b600a5490565b60025460009081908190600160a060020a0316331480611fef575033600160a060020a038516145b1515611ffa57600080fd5b600160a060020a038416600081815260236020908152604091829020805460ff19169055815192835290517f2d6aa1a9629d125e23a0cf692cda7cd6795dff1652eedd4673b38ec31e387b959281900390910190a16003546040805160e060020a6363e6ffdd028152600160a060020a038781166004830152915191909216945084916363e6ffdd9160248083019260209291908290030181600087803b1580156120a457600080fd5b505af11580156120b8573d6000803e3d6000fd5b505050506040513d60208110156120ce57600080fd5b5051604080517f5d97b6c20000000000000000000000000000000000000000000000000000000081529051919350839250600160a060020a03831691638635adb59130918491635d97b6c29160048083019260209291908290030181600087803b158015611b2357600080fd5b600d8054600091908390811061114557fe5b60098054600091908390811061114557fe5b6000610d1e600f61283a565b601c805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156114ca5780601f1061149f576101008083540402835291602001916114ca565b6000806000806000806121d7611588565b15156121e257600080fd5b866040516020018082805190602001908083835b602083106122155780518252601f1990920191602091820191016121f6565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b602083106122785780518252601f199092019160209182019101612259565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390209450601c60405160200180828054600181600116156101000203166002900480156123075780601f106122e5576101008083540402835291820191612307565b820191906000526020600020905b8154815290600101906020018083116122f3575b50509150506040516020818303038152906040526040518082805190602001908083835b6020831061234a5780518252601f19909201916020918201910161232b565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912096505050508484141561246b5760408051602081019182905260009081905261239e91601c9161325a565b506000601d81905560035460408051600160a060020a03909216808352908201839052606060208084018281528c51928501929092528b517f238d74c13cda9ba51e904772d41a616a1b9b30d09802484df6279fe1c3c07f519593948d9493909290916080840191860190808383885b8381101561242657818101518382015260200161240e565b50505050905090810190601f1680156124535780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a160009550612764565b6000199250600091505b601e5482101561268157601e80548390811061248d57fe5b9060005260206000200160405160200180828054600181600116156101000203166002900480156124f55780601f106124d35761010080835404028352918201916124f5565b820191906000526020600020905b8154815290600101906020018083116124e1575b50509150506040516020818303038152906040526040518082805190602001908083835b602083106125385780518252601f199092019160209182019101612519565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912093505050508481141561267657601e80548390811061257c57fe5b90600052602060002001600061259291906132c8565b601f8054839081106125a057fe5b6000918252602082200155601e5460001901821461264657601e805460001981019081106125ca57fe5b90600052602060002001601e838154811015156125e357fe5b90600052602060002001908054600181600116156101000203166002900461260c9291906131d9565b50601f8054600019810190811061261f57fe5b9060005260206000200154601f8381548110151561263957fe5b6000918252602090912001555b601e80549061265990600019830161330f565b50601f80549061266d906000198301613333565b50819250612681565b600190910190612475565b60001983141561269057600080fd5b7f238d74c13cda9ba51e904772d41a616a1b9b30d09802484df6279fe1c3c07f51600360009054906101000a9004600160a060020a031688856040518084600160a060020a0316600160a060020a0316815260200180602001838152602001828103825284818151815260200191508051906020019080838360005b8381101561272457818101518382015260200161270c565b50505050905090810190601f1680156127515780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a18295505b5050505050919050565b600e5490565b61112e600f848484612aa7565b600254600160a060020a03163214806127a45750600254600160a060020a031633145b15156127af57600080fd5b600160a060020a03811615156127c457600080fd5b60028054600160a060020a031916600160a060020a0392909216919091179055565b600160a060020a031660009081526008602052604090205460ff1690565b601a5490565b60236020526000908152604090205460ff1681565b600554600090611106906301000000900460ff1684846117e0565b600080805b8360030154811015612aa057612879846002018281548110151561285f57fe5b600091825260209091200154600160a060020a0316611738565b1515612a03577fa33a9370a938260eee2537d9480ca0caa9789521da8e57afb3a0699d3ff9b2608185600201838154811015156128b257fe5b600091825260209182902001546040805192830193909352600160a060020a03168183015260608082526004908201527f6465616400000000000000000000000000000000000000000000000000000000608082015290519081900360a00190a16002840180548290811061292357fe5b60009182526020909120018054600160a060020a03191690556003840154600192909201916000190181146129f25783600201600185600301540381548110151561296a57fe5b600091825260209091200154600285018054600160a060020a03909216918390811061299257fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055508360020160018560030154038154811015156129d857fe5b60009182526020909120018054600160a060020a03191690555b600384018054600019019055612a9b565b7fa33a9370a938260eee2537d9480ca0caa9789521da8e57afb3a0699d3ff9b260818560020183815481101515612a3657fe5b600091825260209182902001546040805192830193909352600160a060020a03168183015260608082526005908201527f616c697665000000000000000000000000000000000000000000000000000000608082015290519081900360a00190a16001015b61283f565b5092915050565b6000806000806000612ab7613357565b600060ff881615612c94576003546040805160e060020a6363e6ffdd0281523260048201529051600160a060020a03909216985088916363e6ffdd916024808201926020929091908290030181600087803b158015612b1557600080fd5b505af1158015612b29573d6000803e3d6000fd5b505050506040513d6020811015612b3f57600080fd5b50519550600160a060020a0386161515612bd45789945084600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015612b9457600080fd5b505af1158015612ba8573d6000803e3d6000fd5b505050506040513d6020811015612bbe57600080fd5b5051600160a060020a03163214612bd457600080fd5b600160a060020a03861615612c94578a54604080517f7fb52f1a00000000000000000000000000000000000000000000000000000000815260ff9092166004830152600160a060020a038c8116602484015260026044840152905188965090861691637fb52f1a9160648083019260209291908290030181600087803b158015612c5d57600080fd5b505af1158015612c71573d6000803e3d6000fd5b505050506040513d6020811015612c8757600080fd5b50511515612c9457600080fd5b600160a060020a038a16600090815260018c01602090815260409182902054600a60ff91821690810682168087526064820681900383169387018490529281039290920316918401919091529250612ceb32611227565b151560011415612e225760ff88161515612d1e5760008260ff8b1660038110612d1057fe5b60ff90921660209290920201525b60018260ff8b1660038110612d2f57fe5b602002015160ff16148015612d48575060ff8816600114155b15612d9357600660ff8a1660038110612d5d57fe5b602081049091015460ff601f9092166101000a9004811689029083908b1660038110612d8557fe5b60ff90921660209290920201525b600160ff891610612de657600660ff8a1660038110612dae57fe5b602091828204019190069054906101000a900460ff16600202828a60ff16600381101515612dd857fe5b60ff90921660209290920201525b60ff8916158015612df9575060ff881615155b15612e1d5760028260ff8b1660038110612e0f57fe5b60ff90921660209290920201525b612ebc565b600160ff891610801590612e4a57508160ff8a1660038110612e4057fe5b602002015160ff16155b15612e9357600660ff8a1660038110612e5f57fe5b602081049091015460ff601f9092166101000a900481169083908b1660038110612e8557fe5b60ff90921660209290920201525b60ff88161515612ebc5760008260ff8b1660038110612eae57fe5b60ff90921660209290920201525b81600260200201518260016020020151836000602002015101019050808b60010160008c600160a060020a0316600160a060020a0316815260200190815260200160002060006101000a81548160ff021916908360ff1602179055508060ff16600014158015612f2d575060ff8316155b15612f3c57612f3c8b8b612ffd565b60ff81161515612f5257612f508b8b613094565b505b60408051308152600160a060020a038c16602082015260ff83168183015290517f23dcae6acc296731e3679d01e7cd963988e5a372850a0a1db2b9b01539e19ff49181900360600190a15050505050505050505050565b600160a060020a038216600090815260018401602052604081205460ff90811690600690841660038110612fd957fe5b60208104919091015460ff601f9092166101000a9004811691161015949350505050565b600282015460038301541015613056578082600201836003015481548110151561302357fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a03160217905550613087565b60028201805460018101825560009182526020909120018054600160a060020a031916600160a060020a0383161790555b5060030180546001019055565b6000805b83600301548110156131cf5782600160a060020a031684600201828154811015156130bf57fe5b600091825260209091200154600160a060020a031614156131c757600284018054829081106130ea57fe5b60009182526020909120018054600160a060020a031916905560038401546000190181146131b25783600201600185600301540381548110151561312a57fe5b600091825260209091200154600285018054600160a060020a03909216918390811061315257fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a0316021790555083600201600185600301540381548110151561319857fe5b60009182526020909120018054600160a060020a03191690555b60038401805460001901905560019150612aa0565b600101613098565b5060009392505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10613212578054855561324e565b8280016001018555821561324e57600052602060002091601f016020900482015b8281111561324e578254825591600101919060010190613233565b506110e9929150613376565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061329b57805160ff191683800117855561324e565b8280016001018555821561324e579182015b8281111561324e5782518255916020019190600101906132ad565b50805460018160011615610100020316600290046000825580601f106132ee575061330c565b601f01602090049060005260206000209081019061330c9190613376565b50565b81548183558181111561112e5760008381526020902061112e918101908301613390565b81548183558181111561112e5760008381526020902061112e918101908301613376565b6060604051908101604052806003906020820280388339509192915050565b610d0091905b808211156110e9576000815560010161337c565b610d0091905b808211156110e95760006133aa82826132c8565b506001016133965600a165627a7a72305820c3bf3762f3721cdc9be829ad1b7a4955267f75be579ce0c624001dbdb3e1623e0029"
};
module.exports = contract;