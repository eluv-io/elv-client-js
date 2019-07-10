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
    "constant": true,
    "inputs": [],
    "name": "execStatusNonceFail",
    "outputs": [{
      "name": "",
      "type": "int256"
    }],
    "payable": false,
    "stateMutability": "view",
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
    "inputs": [],
    "name": "execStatusSendFail",
    "outputs": [{
      "name": "",
      "type": "int256"
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
      "name": "content_address",
      "type": "address"
    }, {
      "name": "",
      "type": "bytes"
    }, {
      "name": "level",
      "type": "uint8"
    }, {
      "name": "pke_requestor",
      "type": "string"
    }, {
      "name": "pke_AFGH",
      "type": "string"
    }, {
      "name": "custom_values",
      "type": "bytes32[]"
    }, {
      "name": "stakeholders",
      "type": "address[]"
    }],
    "name": "contentAccessRequest",
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
    "inputs": [],
    "name": "currentTimestamp",
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
    "constant": false,
    "inputs": [{
      "name": "content_address",
      "type": "address"
    }, {
      "name": "",
      "type": "bytes"
    }, {
      "name": "request_ID",
      "type": "uint256"
    }, {
      "name": "score_pct",
      "type": "uint256"
    }, {
      "name": "ml_out_hash",
      "type": "bytes32"
    }],
    "name": "contentAccessComplete",
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
    "constant": false,
    "inputs": [{
      "name": "_guarantor",
      "type": "address"
    }, {
      "name": "_v",
      "type": "uint8"
    }, {
      "name": "_r",
      "type": "bytes32"
    }, {
      "name": "_s",
      "type": "bytes32"
    }, {
      "name": "_dest",
      "type": "address"
    }, {
      "name": "_value",
      "type": "uint256"
    }, {
      "name": "_ts",
      "type": "uint256"
    }],
    "name": "execute",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
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
    "constant": true,
    "inputs": [{
      "name": "_v",
      "type": "uint8"
    }, {
      "name": "_r",
      "type": "bytes32"
    }, {
      "name": "_s",
      "type": "bytes32"
    }, {
      "name": "_dest",
      "type": "address"
    }, {
      "name": "_value",
      "type": "uint256"
    }, {
      "name": "_ts",
      "type": "uint256"
    }],
    "name": "validateTransaction",
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
    "inputs": [],
    "name": "execStatusBalanceFail",
    "outputs": [{
      "name": "",
      "type": "int256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "content_address",
      "type": "address"
    }, {
      "name": "level",
      "type": "uint8"
    }, {
      "name": "pke_requestor",
      "type": "string"
    }, {
      "name": "pke_AFGH",
      "type": "string"
    }, {
      "name": "custom_values",
      "type": "bytes32[]"
    }, {
      "name": "stakeholders",
      "type": "address[]"
    }],
    "name": "accessRequestMsg",
    "outputs": [{
      "name": "",
      "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "pure",
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
    "constant": true,
    "inputs": [],
    "name": "execStatusOk",
    "outputs": [{
      "name": "",
      "type": "int256"
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
    "constant": true,
    "inputs": [{
      "name": "content_address",
      "type": "address"
    }, {
      "name": "request_ID",
      "type": "uint256"
    }, {
      "name": "score_pct",
      "type": "uint256"
    }, {
      "name": "ml_out_hash",
      "type": "bytes32"
    }],
    "name": "accessCompleteMsg",
    "outputs": [{
      "name": "",
      "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "pure",
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
    "name": "execStatusSigFail",
    "outputs": [{
      "name": "",
      "type": "int256"
    }],
    "payable": false,
    "stateMutability": "view",
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
      "name": "_ts",
      "type": "uint256"
    }],
    "name": "validateTimestamp",
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
    "payable": true,
    "stateMutability": "payable",
    "type": "constructor"
  }, {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "guarantor",
      "type": "address"
    }, {
      "indexed": false,
      "name": "code",
      "type": "int256"
    }],
    "name": "ExecStatus",
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
  "bytecode": "7f41636365737369626c6532303139303232323133353930304d4c00000000000060009081557f4f776e61626c6532303139303532383139333830304d4c00000000000000000060019081557f4564697461626c653230313930363037313035363030504f00000000000000006005557f436f6e7461696e657232303139303532393039313830304d4c00000000000000600955600c919091557f416363657373496e6465786f7232303139303532383139343230304d4c000000600e55600f805460ff1916821761ff0019166102001762ff00001916620300001763ff000000191663040000001764ff00000000191664050000000017905560e06040526080908152600a60a052606460c0526200011d906010906003620001f9565b507f427341636365737357616c6c65743230313930363131313230303030504f00006025556040516020806200451d83398101604052516002805432600160a060020a03199182168117909255600380548216909217909155600f546011805462010000830460ff90811660ff1992831617909255601980546101008504841690831617905560158054838516908316179055601d805463010000008504841690831617905560218054640100000000909404909216921691909117905560048054909116600160a060020a03909216919091179055620002b7565b600183019183908215620002815791602002820160005b838211156200025057835183826101000a81548160ff021916908360ff160217905550926020019260010160208160000104928301926001030262000210565b80156200027f5782816101000a81549060ff021916905560010160208160000104928301926001030262000250565b505b506200028f92915062000293565b5090565b620002b491905b808211156200028f57805460ff191681556001016200029a565b90565b61425680620002c76000396000f3006080604052600436106104675763ffffffff60e060020a600035041662821de3811461046957806302d05d3f1461049a578063048bd529146104af57806304f55daf146104d6578063055af48f146104eb57806307a082371461050c57806308d865d714610521578063091600e6146105585780630add6d2a1461056d5780630dc10d3f146106cb5780630eaec2c5146106e05780630f58a7861461071557806312915a301461073c57806314cfabb31461075157806315c0bac11461076657806316aed2321461078d57806318689733146107a25780631cdbee5a146107b75780631e2ff94f146107d85780631f2caaec146107ed578063224dcba01461080557806326683e141461083257806329d002191461085357806329dedde5146108745780632cf99422146108955780632d474cbd146108b65780632fa5c842146108ce578063304f4a7b1461090e57806330e669491461092f57806332eaf21b14610961578063331b86c0146109765780633abaae551461098b5780633dd71d99146109f25780633def514014610a0757806341c0e1b514610a3457806342e7ba7b14610a49578063446e882614610a6a578063479a0c5114610a72578063508ad27814610a8757806354fd4d5014610ac35780635c1d305914610ad85780635d97b6c2146107a25780635faecb7614610aed578063628449fd14610b145780636373a41114610b9e5780636813b6d114610bb357806368a0469a14610bda57806369881c0c14610bef5780636c0f79b614610c105780636d2e4b1b14610c255780636e37542714610c465780636ebc8c8614610c5b578063763d5ee614610c735780637709bc7814610ca65780637ca8f61814610cc75780637cbb7bf214610cdf5780637fb52f1a14610d0c5780638232f3f114610d3a57806385e0a20014610d4f5780638635adb514610d645780638da5cb5b14610d9157806392297d7b14610da65780639476c47814610dbb578063957a3aa414610dd057806395a078e814610eec57806395ba60ba14610f0d57806396eba03d14610d3a5780639751067114610f225780639867db7414610f4c578063991a3a7c14610fa55780639b55f901146106e05780639cb121ba14610fbd5780639f46133e14610fde578063a00b38c414610ff3578063a4081d6214611021578063a864dfa514611042578063a980892d14611069578063aa3f69521461107e578063af570c0414611096578063c287e0ed146110ab578063c4b1978d146110c0578063c65bcbe2146110d5578063c9e8e72d146110ea578063cb86806d1461110b578063cf8a750314611120578063d15d62a714611138578063d1aeb65114610a72578063d30f8cd014611150578063e02dd9c214611165578063e1a707171461117a578063eb23b7aa146111d3578063ebe9314e146111e8578063f1551887146111fd578063f17bda9114611212578063f2fde38b1461123f578063f50b2efe14611260578063fb52222c14611278578063fccc134f14611299578063fd089196146112ae578063fe538c5a146112cf575b005b34801561047557600080fd5b5061047e6112f6565b60408051600160a060020a039092168252519081900360200190f35b3480156104a657600080fd5b5061047e611306565b3480156104bb57600080fd5b506104c4611315565b60408051918252519081900360200190f35b3480156104e257600080fd5b506104c4611326565b3480156104f757600080fd5b50610467600160a060020a036004351661132b565b34801561051857600080fd5b506104c461137b565b34801561052d57600080fd5b50610542600160a060020a0360043516611380565b6040805160ff9092168252519081900360200190f35b34801561056457600080fd5b506105426113a2565b34801561057957600080fd5b5060408051602060046024803582810135601f81018590048502860185019096528585526104c4958335600160a060020a031695369560449491939091019190819084018382808284375050604080516020601f818a01358b0180359182018390048302840183018552818452989b60ff8b35169b909a90999401975091955091820193509150819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506113ab9650505050505050565b3480156106d757600080fd5b506104c46116d6565b3480156106ec57600080fd5b50610701600160a060020a03600435166116dc565b604080519115158252519081900360200190f35b34801561072157600080fd5b50610467600160a060020a036004358116906024351661170b565b34801561074857600080fd5b50610542611880565b34801561075d57600080fd5b5061070161188e565b34801561077257600080fd5b50610701600160a060020a036004351660ff60243516611899565b34801561079957600080fd5b506105426118b9565b3480156107ae57600080fd5b506105426118c8565b3480156107c357600080fd5b5061047e600160a060020a03600435166118cd565b3480156107e457600080fd5b506104c46118e8565b3480156107f957600080fd5b5061047e6004356118ee565b34801561081157600080fd5b50610467600160a060020a036004351660ff60243581169060443516611b72565b34801561083e57600080fd5b50610701600160a060020a0360043516611b84565b34801561085f57600080fd5b50610701600160a060020a0360043516611c25565b34801561088057600080fd5b50610701600160a060020a0360043516611c2b565b3480156108a157600080fd5b50610701600160a060020a0360043516611c49565b3480156108c257600080fd5b5061047e600435611d69565b3480156108da57600080fd5b506108e3611d96565b6040805195865260208601949094528484019290925260608401526080830152519081900360a00190f35b34801561091a57600080fd5b50610542600160a060020a0360043516611de1565b34801561093b57600080fd5b50610944611dff565b6040805160ff909316835260208301919091528051918290030190f35b34801561096d57600080fd5b5061047e611e0e565b34801561098257600080fd5b506104c4611e1d565b60408051602060046024803582810135601f8101859004850286018501909652858552610701958335600160a060020a031695369560449491939091019190819084018382808284375094975050843595505050602083013592604001359150611e239050565b3480156109fe57600080fd5b50610701611ece565b348015610a1357600080fd5b50610467600160a060020a036004351660ff60243581169060443516611ed3565b348015610a4057600080fd5b50610467611ee0565b348015610a5557600080fd5b50610701600160a060020a0360043516611f1c565b610701611f30565b348015610a7e57600080fd5b50610542611326565b348015610a9357600080fd5b50610701600160a060020a0360043581169060ff602435169060443590606435906084351660a43560c4356120b1565b348015610acf57600080fd5b506104c4612388565b348015610ae457600080fd5b506104c461238e565b348015610af957600080fd5b50610701600160a060020a036004351660ff60243516612394565b348015610b2057600080fd5b50610b296123a8565b6040805160208082528351818301528351919283929083019185019080838360005b83811015610b63578181015183820152602001610b4b565b50505050905090810190601f168015610b905780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b348015610baa57600080fd5b50610542612436565b348015610bbf57600080fd5b50610701600160a060020a036004351660ff60243516612447565b348015610be657600080fd5b50610542612461565b348015610bfb57600080fd5b50610542600160a060020a0360043516612471565b348015610c1c57600080fd5b5061094461248f565b348015610c3157600080fd5b50610467600160a060020a036004351661249e565b348015610c5257600080fd5b506107016124ec565b348015610c6757600080fd5b5061047e6004356124fd565b348015610c7f57600080fd5b5061070160ff60043516602435604435600160a060020a036064351660843560a43561250f565b348015610cb257600080fd5b50610701600160a060020a0360043516612678565b348015610cd357600080fd5b50610b29600435612680565b348015610ceb57600080fd5b50610467600160a060020a036004351660ff602435811690604435166126f4565b348015610d1857600080fd5b5061070160ff600435811690600160a060020a03602435169060443516612701565b348015610d4657600080fd5b506105426128b8565b348015610d5b57600080fd5b506104c46128bd565b348015610d7057600080fd5b50610467600160a060020a036004351660ff602435811690604435166128c9565b348015610d9d57600080fd5b5061047e6128d6565b348015610db257600080fd5b506104c46128e5565b348015610dc757600080fd5b506104c46118c8565b348015610ddc57600080fd5b50604080516020600460443581810135601f81018490048402850184019095528484526104c4948235600160a060020a0316946024803560ff169536959460649492019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506128f19650505050505050565b348015610ef857600080fd5b50610701600160a060020a0360043516612ac1565b348015610f1957600080fd5b506104c46128b8565b348015610f2e57600080fd5b506104c4600160a060020a0360043516602435604435606435612ac7565b348015610f5857600080fd5b506040805160206004803580820135601f8101849004840285018401909552848452610467943694929360249392840191908190840183828082843750949750612b7a9650505050505050565b348015610fb157600080fd5b5061047e600435612c8a565b348015610fc957600080fd5b50610701600160a060020a0360043516612cb2565b348015610fea57600080fd5b50610944612d09565b348015610fff57600080fd5b5061070160ff600435811690600160a060020a03602435169060443516612d18565b34801561102d57600080fd5b50610542600160a060020a0360043516612e74565b34801561104e57600080fd5b50610701600160a060020a036004351660ff60243516612e92565b34801561107557600080fd5b50610944612eae565b34801561108a57600080fd5b5061047e600435612ebd565b3480156110a257600080fd5b5061047e612ecf565b3480156110b757600080fd5b50610467612ede565b3480156110cc57600080fd5b50610944612fb4565b3480156110e157600080fd5b506104c4612fc3565b3480156110f657600080fd5b50610467600160a060020a0360043516612fc9565b34801561111757600080fd5b506104c4613019565b34801561112c57600080fd5b5061047e60043561301f565b34801561114457600080fd5b5061047e600435613031565b34801561115c57600080fd5b506104c4613043565b34801561117157600080fd5b50610b2961304f565b34801561118657600080fd5b506040805160206004803580820135601f81018490048402850184019095528484526104c49436949293602493928401919081908401838280828437509497506130aa9650505050505050565b3480156111df57600080fd5b506104c46133f5565b3480156111f457600080fd5b506104c46133fa565b34801561120957600080fd5b50610701613400565b34801561121e57600080fd5b50610467600160a060020a036004351660ff60243581169060443516613431565b34801561124b57600080fd5b50610467600160a060020a036004351661343e565b34801561126c57600080fd5b506107016004356134a3565b34801561128457600080fd5b50610542600160a060020a03600435166134bf565b3480156112a557600080fd5b506104c46134dd565b3480156112ba57600080fd5b50610701600160a060020a03600435166134e3565b3480156112db57600080fd5b50610701600160a060020a036004351660ff60243516613686565b600454600160a060020a03165b90565b600254600160a060020a031681565b600061132160156136a1565b905090565b600181565b600354600160a060020a031632148061134e5750600354600160a060020a031633145b151561135957600080fd5b60048054600160a060020a031916600160a060020a0392909216919091179055565b600481565b600160a060020a03811660009081526022602052604090205460ff165b919050565b600f5460ff1681565b6000806000806000808c945084600160a060020a03166338d0f5048c8a8a6040518463ffffffff1660e060020a028152600401808460ff1660ff1681526020018060200180602001838103835285818151815260200191508051906020019060200280838360005b8381101561142b578181015183820152602001611413565b50505050905001838103825284818151815260200191508051906020019060200280838360005b8381101561146a578181015183820152602001611452565b5050505090500195505050505050606060405180830381600087803b15801561149257600080fd5b505af11580156114a6573d6000803e3d6000fd5b505050506040513d60608110156114bc57600080fd5b508051602082015160409092015195509350915060ff8316156114de57600080fd5b600160a060020a03851663a1ff106e60ff841615156114fe576000611500565b855b8d8d8d8d8d6040518763ffffffff1660e060020a028152600401808660ff1660ff16815260200180602001806020018060200180602001858103855289818151815260200191508051906020019080838360005b8381101561156c578181015183820152602001611554565b50505050905090810190601f1680156115995780820380516001836020036101000a031916815260200191505b5085810384528851815288516020918201918a019080838360005b838110156115cc5781810151838201526020016115b4565b50505050905090810190601f1680156115f95780820380516001836020036101000a031916815260200191505b508581038352875181528751602091820191808a01910280838360005b8381101561162e578181015183820152602001611616565b50505050905001858103825286818151815260200191508051906020019060200280838360005b8381101561166d578181015183820152602001611655565b5050505090500199505050505050505050506020604051808303818588803b15801561169857600080fd5b505af11580156116ac573d6000803e3d6000fd5b50505050506040513d60208110156116c357600080fd5b50519d9c50505050505050505050505050565b601c5490565b600354600090600160a060020a03838116911614806117055750600354600160a060020a031633145b92915050565b600354600160a060020a031632148061172e5750600354600160a060020a031633145b151561173957600080fd5b600160a060020a038083166000908152600d602052604090205416158015611767575061176582612cb2565b155b1561181357600b54600c5410156117bd5781600b600c5481548110151561178a57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a03160217905550611809565b600b80546001810182556000919091527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db9018054600160a060020a031916600160a060020a0384161790555b600c805460010190555b600160a060020a038281166000818152600d60209081526040918290208054600160a060020a0319169486169485179055815192835282019290925281517f280016f7418306a55542432120fd1a239ef9fcc1a92694d8d44ca76be0249ea7929181900390910190a15050565b600f54610100900460ff1681565b600061132133611b84565b600f546000906118b290610100900460ff168484612701565b9392505050565b600f5462010000900460ff1681565b600281565b600d60205260009081526040902054600160a060020a031681565b60265481565b600080805b600b54821015611b6657600b80548390811061190b57fe5b6000918252602091829020015460408051808401889052815180820385018152908201918290528051600160a060020a03909316945092909182918401908083835b6020831061196c5780518252601f19909201916020918201910161194d565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390206000191681600160a060020a031663e02dd9c26040518163ffffffff1660e060020a028152600401600060405180830381600087803b1580156119db57600080fd5b505af11580156119ef573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526020811015611a1857600080fd5b810190808051640100000000811115611a3057600080fd5b82016020810184811115611a4357600080fd5b8151640100000000811182820187101715611a5d57600080fd5b50509291905050506040516020018082805190602001908083835b60208310611a975780518252601f199092019160209182019101611a78565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b60208310611afa5780518252601f199092019160209182019101611adb565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415611b5b57600b805483908110611b3f57fe5b600091825260209091200154600160a060020a03169250611b6b565b6001909101906118f3565b600092505b5050919050565b611b7f6021848484613907565b505050565b60048054604080517f26683e14000000000000000000000000000000000000000000000000000000008152600160a060020a038581169482019490945290516000939092169182916326683e1491602480830192602092919082900301818887803b158015611bf257600080fd5b505af1158015611c06573d6000803e3d6000fd5b505050506040513d6020811015611c1c57600080fd5b50519392505050565b50600090565b6000600c5460001415611c405750600161139d565b61170582612cb2565b60008033600160a060020a03841614611c6157600080fd5b82905080600160a060020a0316638280dd8f60006040518263ffffffff1660e060020a02815260040180828152602001915050602060405180830381600087803b158015611cae57600080fd5b505af1158015611cc2573d6000803e3d6000fd5b505050506040513d6020811015611cd857600080fd5b5050604080517f27c1c21d0000000000000000000000000000000000000000000000000000000081529051600160a060020a038316916327c1c21d9160048083019260209291908290030181600087803b158015611d3557600080fd5b505af1158015611d49573d6000803e3d6000fd5b505050506040513d6020811015611d5f57600080fd5b5051159392505050565b601b80546000919083908110611d7b57fe5b600091825260209091200154600160a060020a031692915050565b6000806000806000611da860116136a1565b611db260196136a1565b611dbc60156136a1565b611dc6601d6136a1565b611dd060216136a1565b945094509450945094509091929394565b600160a060020a03166000908152601a602052604090205460ff1690565b601954601c5460ff9091169082565b600a54600160a060020a031681565b60075490565b604080517f5cc4aa9b00000000000000000000000000000000000000000000000000000000815260048101859052602481018490526044810183905290516000918791600160a060020a03831691635cc4aa9b91606480830192602092919082900301818887803b158015611e9757600080fd5b505af1158015611eab573d6000803e3d6000fd5b505050506040513d6020811015611ec157600080fd5b5051979650505050505050565b600090565b611b7f6015848484613907565b600354600160a060020a0316321480611f035750600354600160a060020a031633145b1515611f0e57600080fd5b600354600160a060020a0316ff5b600354600160a060020a0390811691161490565b6000611f3a61188e565b1515611f4557600080fd5b600060068054600181600116156101000203166002900490501115611fbe5760078054600181810180845560009390935260068054611fbb937fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c6880192600261010091831615919091026000190190911604614050565b50505b60088054611fe19160069160026000196101006001841615020190911604614050565b50604080516020810191829052600090819052612000916008916140d5565b5060408051602080825260068054600260001961010060018416150201909116049183018290527f5ae4ddb3009a8ccdedc04b2011fc66a472807bcdcff04af16286ddb27819ebe1939092918291820190849080156120a05780601f10612075576101008083540402835291602001916120a0565b820191906000526020600020905b81548152906001019060200180831161208357829003601f168201915b50509250505060405180910390a190565b600454600090600160a060020a031681803383148061215d5750604080517fd6be0f490000000000000000000000000000000000000000000000000000000081523360048201529051600091600160a060020a0386169163d6be0f499160248082019260209290919082900301818787803b15801561212f57600080fd5b505af1158015612143573d6000803e3d6000fd5b505050506040513d602081101561215957600080fd5b5051115b151561216857600080fd5b600083600160a060020a031663d6be0f498d6040518263ffffffff1660e060020a0281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b1580156121c557600080fd5b505af11580156121d9573d6000803e3d6000fd5b505050506040513d60208110156121ef57600080fd5b5051116121fb57600080fd5b602654851161223f5760408051600160a060020a038d16815260016020820152815160008051602061420b833981519152929181900390910190a16000935061237a565b30318611156122835760408051600160a060020a038d16815260026020820152815160008051602061420b833981519152929181900390910190a16000935061237a565b6122918a8a8a8a8a8a61250f565b91508115156122d55760408051600160a060020a038d16815260036020820152815160008051602061420b833981519152929181900390910190a16000935061237a565b6026859055604051600160a060020a0388169087156108fc029088906000818181858888f1935050505090508015156123435760408051600160a060020a038d16815260046020820152815160008051602061420b833981519152929181900390910190a16000935061237a565b60408051600160a060020a038d16815260006020820152815160008051602061420b833981519152929181900390910190a1600193505b505050979650505050505050565b60255481565b60205490565b600f546000906118b29060ff168484612701565b6008805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561242e5780601f106124035761010080835404028352916020019161242e565b820191906000526020600020905b81548152906001019060200180831161241157829003601f168201915b505050505081565b600f54640100000000900460ff1681565b600f546000906118b29062010000900460ff168484612701565b600f546301000000900460ff1681565b600160a060020a031660009081526016602052604090205460ff1690565b60215460245460ff9091169082565b600254600160a060020a031632146124b557600080fd5b600160a060020a03811615156124ca57600080fd5b60028054600160a060020a031916600160a060020a0392909216919091179055565b600354600160a060020a0316321490565b602380546000919083908110611d7b57fe5b604080516c01000000000000000000000000308102602080840191909152600160a060020a038716909102603483015260488201859052606880830185905283518084039091018152608890920192839052815160009384938493909282918401908083835b602083106125945780518252601f199092019160209182019101612575565b6001836020036101000a038019825116818451168082178552505050505050905001915050604051809103902091506001828a8a8a604051600081526020016040526040518085600019166000191681526020018460ff1660ff1681526020018360001916600019168152602001826000191660001916815260200194505050505060206040516020810390808403906000865af115801561263a573d6000803e3d6000fd5b5050604051601f190151600354909250600160a060020a038084169116149050612667576000925061266c565b600192505b50509695505050505050565b6000903b1190565b600780548290811061268e57fe5b600091825260209182902001805460408051601f600260001961010060018716150201909416939093049283018590048502810185019091528181529350909183018282801561242e5780601f106124035761010080835404028352916020019161242e565b611b7f6011848484613907565b600080600080600080612715898989612d18565b94506001851515141561272b57600195506128ac565b600091505b601c5482101561282b57601b80548390811061274857fe5b600091825260209091200154600160a060020a03169250821561282057604080517fa00b38c400000000000000000000000000000000000000000000000000000000815260ff808c166004830152600160a060020a038b81166024840152908a166044830152915194955085949185169163a00b38c4916064808201926020929091908290030181600087803b1580156127e157600080fd5b505af11580156127f5573d6000803e3d6000fd5b505050506040513d602081101561280b57600080fd5b505115156001141561282057600195506128ac565b600190910190612730565b87905080600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561286c57600080fd5b505af1158015612880573d6000803e3d6000fd5b505050506040513d602081101561289657600080fd5b5051600354600160a060020a0390811691161495505b50505050509392505050565b600081565b6000611321601d6136a1565b611b7f601d848484613907565b600354600160a060020a031681565b600061132160116136a1565b60008686868686866040516020018087600160a060020a0316600160a060020a03166c010000000000000000000000000281526014018660ff1660ff167f010000000000000000000000000000000000000000000000000000000000000002815260010185805190602001908083835b602083106129805780518252601f199092019160209182019101612961565b51815160209384036101000a600019018019909216911617905287519190930192870191508083835b602083106129c85780518252601f1990920191602091820191016129a9565b51815160209384036101000a60001901801990921691161790528651919093019286810192500280838360005b83811015612a0d5781810151838201526020016129f5565b50505050905001828051906020019060200280838360005b83811015612a3d578181015183820152602001612a25565b5050505090500196505050505050506040516020818303038152906040526040518082805190602001908083835b60208310612a8a5780518252601f199092019160209182019101612a6b565b5181516020939093036101000a600019018019909116921691909117905260405192018290039091209a9950505050505050505050565b50600190565b604080516c01000000000000000000000000600160a060020a0387160260208083019190915260348201869052605482018590526074808301859052835180840390910181526094909201928390528151600093918291908401908083835b60208310612b455780518252601f199092019160209182019101612b26565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912098975050505050505050565b612b826124ec565b1515612b8d57600080fd5b8051608011612b9b57600080fd5b8051612bae9060089060208401906140d5565b506004547fb3ac059d88af6016aca1aebb7b3e796f2e7420435c59c563687814e9b85daa7590600160a060020a0316612be56112f6565b60408051600160a060020a038085168252831660208201526060918101828152600880546002600019610100600184161502019091160493830184905292608083019084908015612c775780601f10612c4c57610100808354040283529160200191612c77565b820191906000526020600020905b815481529060010190602001808311612c5a57829003601f168201915b505094505050505060405180910390a150565b600b805482908110612c9857fe5b600091825260209091200154600160a060020a0316905081565b600080805b600c54811015612d025783600160a060020a0316600b82815481101515612cda57fe5b600091825260209091200154600160a060020a03161415612cfa57600191505b600101612cb7565b5092915050565b601d5460205460ff9091169082565b600080839050600360009054906101000a9004600160a060020a0316600160a060020a031681600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015612d7b57600080fd5b505af1158015612d8f573d6000803e3d6000fd5b505050506040513d6020811015612da557600080fd5b5051600160a060020a03161415612dbf5760019150612e6c565b600f5460ff86811691161415612de257612ddb60158585613e20565b9150612e6c565b600f5460ff868116610100909204161415612e0357612ddb60198585613e20565b600f5460ff86811662010000909204161415612e2557612ddb60118585613e20565b600f5460ff868116640100000000909204161415612e4957612ddb60218585613e20565b600f5460ff8681166301000000909204161415612e6c57612ddb601d8585613e20565b509392505050565b600160a060020a03166000908152601e602052604090205460ff1690565b600f546000906118b290640100000000900460ff168484612701565b60155460185460ff9091169082565b601f80546000919083908110611d7b57fe5b600454600160a060020a031681565b600354600160a060020a0316331480612efa5750612efa61188e565b1515612f0557600080fd5b60408051602080825260068054600260001961010060018416150201909116049183018290527f403f30aa5f4f2f89331a7b50054f64a00ce206f4d0a37f566ff344bbe46f8b6593909291829182019084908015612fa45780601f10612f7957610100808354040283529160200191612fa4565b820191906000526020600020905b815481529060010190602001808311612f8757829003601f168201915b50509250505060405180910390a1565b60115460145460ff9091169082565b600c5481565b600354600160a060020a0316321480612fec5750600354600160a060020a031633145b1515612ff757600080fd5b600a8054600160a060020a031916600160a060020a0392909216919091179055565b60145490565b601780546000919083908110611d7b57fe5b601380546000919083908110611d7b57fe5b600061132160196136a1565b6006805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561242e5780601f106124035761010080835404028352916020019161242e565b60008060008060006130ba6124ec565b15156130c557600080fd5b856040516020018082805190602001908083835b602083106130f85780518252601f1990920191602091820191016130d9565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b6020831061315b5780518252601f19909201916020918201910161313c565b6001836020036101000a038019825116818451168082178552505050505050905001915050604051809103902093506000199250600091505b60075482101561333b5760078054839081106131ac57fe5b9060005260206000200160405160200180828054600181600116156101000203166002900480156132145780601f106131f2576101008083540402835291820191613214565b820191906000526020600020905b815481529060010190602001808311613200575b50509150506040516020818303038152906040526040518082805190602001908083835b602083106132575780518252601f199092019160209182019101613238565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912093505050508381141561333057600780548390811061329b57fe5b9060005260206000200160006132b19190614143565b600754600019018214613314576007805460001981019081106132d057fe5b906000526020600020016007838154811015156132e957fe5b906000526020600020019080546001816001161561010002031660029004613312929190614050565b505b600780549061332790600019830161418a565b5081925061333b565b600190910190613194565b60001983141561334a57600080fd5b7f165c03d1f6eb5280d41c4b5f467649bacdff0baf01ed576facebc59885dd7efa86846040518080602001838152602001828103825284818151815260200191508051906020019080838360005b838110156133b0578181015183820152602001613398565b50505050905090810190601f1680156133dd5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a15090949350505050565b600381565b60185490565b6040516000907fed78a9defa7412748c9513ba9cf680f57703a46dd7e0fb0b1e94063423c73e88908290a150600190565b611b7f6019848484613907565b600354600160a060020a03163214806134615750600354600160a060020a031633145b151561346c57600080fd5b600160a060020a038116151561348157600080fd5b60038054600160a060020a031916600160a060020a0392909216919091179055565b60006026548211156134b75750600161139d565b506000919050565b600160a060020a031660009081526012602052604090205460ff1690565b60245490565b60035460009081908190600160a060020a031632148061350d5750600354600160a060020a031633145b151561351857600080fd5b5050600c546000190160005b600c54811015611b665783600160a060020a0316600b8281548110151561354757fe5b600091825260209091200154600160a060020a0316141561367e57600b80548290811061357057fe5b60009182526020909120018054600160a060020a031916905580821461361557600b80548390811061359e57fe5b600091825260209091200154600b8054600160a060020a0390921691839081106135c457fe5b60009182526020909120018054600160a060020a031916600160a060020a0392909216919091179055600b8054839081106135fb57fe5b60009182526020909120018054600160a060020a03191690555b600c829055600160a060020a0384166000818152600d60209081526040918290208054600160a060020a0319169055815192835290517fd41375b9d347dfe722f90a780731abd23b7855f9cf14ea7063c4cab5f9ae58e29281900390910190a160019250611b6b565b600101613524565b600f546000906118b2906301000000900460ff168484612701565b600080805b8360030154811015612d02576136e084600201828154811015156136c657fe5b600091825260209091200154600160a060020a0316612678565b151561386a577fa33a9370a938260eee2537d9480ca0caa9789521da8e57afb3a0699d3ff9b26081856002018381548110151561371957fe5b600091825260209182902001546040805192830193909352600160a060020a03168183015260608082526004908201527f6465616400000000000000000000000000000000000000000000000000000000608082015290519081900360a00190a16002840180548290811061378a57fe5b60009182526020909120018054600160a060020a0319169055600384015460019290920191600019018114613859578360020160018560030154038154811015156137d157fe5b600091825260209091200154600285018054600160a060020a0390921691839081106137f957fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a0316021790555083600201600185600301540381548110151561383f57fe5b60009182526020909120018054600160a060020a03191690555b600384018054600019019055613902565b7fa33a9370a938260eee2537d9480ca0caa9789521da8e57afb3a0699d3ff9b26081856002018381548110151561389d57fe5b600091825260209182902001546040805192830193909352600160a060020a03168183015260608082526005908201527f616c697665000000000000000000000000000000000000000000000000000000608082015290519081900360a00190a16001015b6136a6565b60008060008060006139176141ae565b600060ff881615613b0b5760048054604080517f63e6ffdd000000000000000000000000000000000000000000000000000000008152329381019390935251600160a060020a03909116985088916363e6ffdd9160248083019260209291908290030181600087803b15801561398c57600080fd5b505af11580156139a0573d6000803e3d6000fd5b505050506040513d60208110156139b657600080fd5b50519550600160a060020a0386161515613a4b5789945084600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015613a0b57600080fd5b505af1158015613a1f573d6000803e3d6000fd5b505050506040513d6020811015613a3557600080fd5b5051600160a060020a03163214613a4b57600080fd5b600160a060020a03861615613b0b578a54604080517f7fb52f1a00000000000000000000000000000000000000000000000000000000815260ff9092166004830152600160a060020a038c8116602484015260026044840152905188965090861691637fb52f1a9160648083019260209291908290030181600087803b158015613ad457600080fd5b505af1158015613ae8573d6000803e3d6000fd5b505050506040513d6020811015613afe57600080fd5b50511515613b0b57600080fd5b600160a060020a038a16600090815260018c01602090815260409182902054600a60ff91821690810682168087526064820681900383169387018490529281039290920316918401919091529250613b6232611f1c565b151560011415613c995760ff88161515613b955760008260ff8b1660038110613b8757fe5b60ff90921660209290920201525b60018260ff8b1660038110613ba657fe5b602002015160ff16148015613bbf575060ff8816600114155b15613c0a57601060ff8a1660038110613bd457fe5b602081049091015460ff601f9092166101000a9004811689029083908b1660038110613bfc57fe5b60ff90921660209290920201525b600160ff891610613c5d57601060ff8a1660038110613c2557fe5b602091828204019190069054906101000a900460ff16600202828a60ff16600381101515613c4f57fe5b60ff90921660209290920201525b60ff8916158015613c70575060ff881615155b15613c945760028260ff8b1660038110613c8657fe5b60ff90921660209290920201525b613d33565b600160ff891610801590613cc157508160ff8a1660038110613cb757fe5b602002015160ff16155b15613d0a57601060ff8a1660038110613cd657fe5b602081049091015460ff601f9092166101000a900481169083908b1660038110613cfc57fe5b60ff90921660209290920201525b60ff88161515613d335760008260ff8b1660038110613d2557fe5b60ff90921660209290920201525b81600260200201518260016020020151836000602002015101019050808b60010160008c600160a060020a0316600160a060020a0316815260200190815260200160002060006101000a81548160ff021916908360ff1602179055508060ff16600014158015613da4575060ff8316155b15613db357613db38b8b613e74565b60ff81161515613dc957613dc78b8b613f0b565b505b60408051308152600160a060020a038c16602082015260ff83168183015290517f23dcae6acc296731e3679d01e7cd963988e5a372850a0a1db2b9b01539e19ff49181900360600190a15050505050505050505050565b600160a060020a038216600090815260018401602052604081205460ff90811690601090841660038110613e5057fe5b60208104919091015460ff601f9092166101000a9004811691161015949350505050565b600282015460038301541015613ecd5780826002018360030154815481101515613e9a57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a03160217905550613efe565b60028201805460018101825560009182526020909120018054600160a060020a031916600160a060020a0383161790555b5060030180546001019055565b6000805b83600301548110156140465782600160a060020a03168460020182815481101515613f3657fe5b600091825260209091200154600160a060020a0316141561403e5760028401805482908110613f6157fe5b60009182526020909120018054600160a060020a0319169055600384015460001901811461402957836002016001856003015403815481101515613fa157fe5b600091825260209091200154600285018054600160a060020a039092169183908110613fc957fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a0316021790555083600201600185600301540381548110151561400f57fe5b60009182526020909120018054600160a060020a03191690555b60038401805460001901905560019150612d02565b600101613f0f565b5060009392505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061408957805485556140c5565b828001600101855582156140c557600052602060002091601f016020900482015b828111156140c55782548255916001019190600101906140aa565b506140d19291506141cd565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061411657805160ff19168380011785556140c5565b828001600101855582156140c5579182015b828111156140c5578251825591602001919060010190614128565b50805460018160011615610100020316600290046000825580601f106141695750614187565b601f01602090049060005260206000209081019061418791906141cd565b50565b815481835581811115611b7f57600083815260209020611b7f9181019083016141e7565b6060604051908101604052806003906020820280388339509192915050565b61130391905b808211156140d157600081556001016141d3565b61130391905b808211156140d15760006142018282614143565b506001016141ed5600583d8312ef7016406c7ea8ba9796b9e55ac1fdc22455754cbc93869509faefada165627a7a72305820003877b645226fe1c56c838d59a0133e87d8b4eaa4f468e6fd0418dcd09008030029"
};
module.exports = contract;