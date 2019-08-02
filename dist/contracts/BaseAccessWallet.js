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
    "inputs": [],
    "name": "AccessRequest",
    "type": "event"
  }],
  "bytecode": "7f41636365737369626c6532303139303232323133353930304d4c00000000000060009081557f4f776e61626c6532303139303532383139333830304d4c00000000000000000060019081557f4564697461626c653230313930363037313035363030504f00000000000000006005557f436f6e7461696e657232303139303532393039313830304d4c00000000000000600955600c919091557f416363657373496e6465786f7232303139303532383139343230304d4c000000600e55600f805460ff1916821761ff0019166102001762ff00001916620300001763ff000000191663040000001764ff00000000191664050000000017905560e06040526080908152600a60a052606460c0526200011d906010906003620001f9565b507f4261736541636365737357616c6c65743230313930363131313230303030504f6025556040516020806200404583398101604052516002805432600160a060020a03199182168117909255600380548216909217909155600f546011805462010000830460ff90811660ff1992831617909255601980546101008504841690831617905560158054838516908316179055601d805463010000008504841690831617905560218054640100000000909404909216921691909117905560048054909116600160a060020a03909216919091179055620002b7565b600183019183908215620002815791602002820160005b838211156200025057835183826101000a81548160ff021916908360ff160217905550926020019260010160208160000104928301926001030262000210565b80156200027f5782816101000a81549060ff021916905560010160208160000104928301926001030262000250565b505b506200028f92915062000293565b5090565b620002b491905b808211156200028f57805460ff191681556001016200029a565b90565b613d7e80620002c76000396000f3006080604052600436106104515763ffffffff60e060020a600035041662821de3811461045357806302d05d3f14610484578063048bd5291461049957806304f55daf146104c0578063055af48f146104d557806307a08237146104f657806308d865d71461050b578063091600e6146105425780630add6d2a146105575780630dc10d3f146106b55780630eaec2c5146106ca5780630f58a786146106ff57806312915a301461072657806314cfabb31461073b57806315c0bac11461075057806316aed23214610777578063186897331461078c5780631cdbee5a146107a15780631e2ff94f146107c25780631f2caaec146107d7578063224dcba0146107ef57806326683e141461081c57806329d002191461083d57806329dedde51461085e5780632cf994221461087f5780632d474cbd146108a05780632fa5c842146108b8578063304f4a7b146108f857806330e669491461091957806332eaf21b1461094b578063331b86c0146109605780633abaae55146109755780633dd71d991461073b5780633def5140146109dc57806341c0e1b514610a0957806342e7ba7b14610a1e578063446e882614610a3f578063479a0c5114610a47578063508ad27814610a5c57806354fd4d5014610a985780635c1d305914610aad5780635d97b6c21461078c5780635faecb7614610ac25780636373a41114610ae95780636813b6d114610afe57806368a0469a14610b2557806369881c0c14610b3a5780636c0f79b614610b5b5780636d2e4b1b14610b705780636e37542714610b915780636ebc8c8614610ba6578063763d5ee614610bbe5780637709bc7814610bf15780637ca8f61814610c125780637cbb7bf214610c9f5780637fb52f1a14610ccc5780638232f3f114610cfa57806385e0a20014610d0f5780638635adb514610d245780638da5cb5b14610d5157806392297d7b14610d665780639476c47814610d7b578063957a3aa414610d9057806395a078e814610eac57806395ba60ba14610ecd57806396eba03d14610cfa5780639751067114610ee25780639867db7414610f0c578063991a3a7c14610f655780639b55f901146106ca5780639cb121ba14610f7d5780639f46133e14610f9e578063a00b38c414610fb3578063a4081d6214610fe1578063a864dfa514611002578063a980892d14611029578063aa3f69521461103e578063af570c0414611056578063c287e0ed1461106b578063c4b1978d14611080578063c65bcbe214611095578063c9e8e72d146110aa578063cb86806d146110cb578063cf8a7503146110e0578063d15d62a7146110f8578063d1aeb65114610a47578063d30f8cd014611110578063e02dd9c214611125578063eb23b7aa1461113a578063ebe9314e1461114f578063f155188714611164578063f17bda9114611179578063f2fde38b146111a6578063f50b2efe146111c7578063fb52222c146111df578063fccc134f14611200578063fd08919614611215578063fe538c5a14611236575b005b34801561045f57600080fd5b5061046861125d565b60408051600160a060020a039092168252519081900360200190f35b34801561049057600080fd5b5061046861126d565b3480156104a557600080fd5b506104ae61127c565b60408051918252519081900360200190f35b3480156104cc57600080fd5b506104ae61128d565b3480156104e157600080fd5b50610451600160a060020a0360043516611292565b34801561050257600080fd5b506104ae6112e2565b34801561051757600080fd5b5061052c600160a060020a03600435166112e7565b6040805160ff9092168252519081900360200190f35b34801561054e57600080fd5b5061052c611309565b34801561056357600080fd5b5060408051602060046024803582810135601f81018590048502860185019096528585526104ae958335600160a060020a031695369560449491939091019190819084018382808284375050604080516020601f818a01358b0180359182018390048302840183018552818452989b60ff8b35169b909a90999401975091955091820193509150819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506113129650505050505050565b3480156106c157600080fd5b506104ae61163d565b3480156106d657600080fd5b506106eb600160a060020a0360043516611643565b604080519115158252519081900360200190f35b34801561070b57600080fd5b50610451600160a060020a0360043581169060243516611672565b34801561073257600080fd5b5061052c6117e7565b34801561074757600080fd5b506106eb6117f5565b34801561075c57600080fd5b506106eb600160a060020a036004351660ff602435166117fa565b34801561078357600080fd5b5061052c61181a565b34801561079857600080fd5b5061052c611829565b3480156107ad57600080fd5b50610468600160a060020a036004351661182e565b3480156107ce57600080fd5b506104ae611849565b3480156107e357600080fd5b5061046860043561184f565b3480156107fb57600080fd5b50610451600160a060020a036004351660ff60243581169060443516611ad3565b34801561082857600080fd5b506106eb600160a060020a0360043516611ae5565b34801561084957600080fd5b506106eb600160a060020a0360043516611b86565b34801561086a57600080fd5b506106eb600160a060020a0360043516611b8c565b34801561088b57600080fd5b506106eb600160a060020a0360043516611baa565b3480156108ac57600080fd5b50610468600435611cca565b3480156108c457600080fd5b506108cd611cf7565b6040805195865260208601949094528484019290925260608401526080830152519081900360a00190f35b34801561090457600080fd5b5061052c600160a060020a0360043516611d42565b34801561092557600080fd5b5061092e611d60565b6040805160ff909316835260208301919091528051918290030190f35b34801561095757600080fd5b50610468611d6f565b34801561096c57600080fd5b506104ae611d7e565b60408051602060046024803582810135601f81018590048502860185019096528585526106eb958335600160a060020a031695369560449491939091019190819084018382808284375094975050843595505050602083013592604001359150611d849050565b3480156109e857600080fd5b50610451600160a060020a036004351660ff60243581169060443516611e2f565b348015610a1557600080fd5b50610451611e3c565b348015610a2a57600080fd5b506106eb600160a060020a0360043516611e78565b6106eb611e8c565b348015610a5357600080fd5b5061052c61128d565b348015610a6857600080fd5b506106eb600160a060020a0360043581169060ff602435169060443590606435906084351660a43560c43561200d565b348015610aa457600080fd5b506104ae6122e4565b348015610ab957600080fd5b506104ae6122ea565b348015610ace57600080fd5b506106eb600160a060020a036004351660ff602435166122f0565b348015610af557600080fd5b5061052c612304565b348015610b0a57600080fd5b506106eb600160a060020a036004351660ff60243516612315565b348015610b3157600080fd5b5061052c61232f565b348015610b4657600080fd5b5061052c600160a060020a036004351661233f565b348015610b6757600080fd5b5061092e61235d565b348015610b7c57600080fd5b50610451600160a060020a036004351661236c565b348015610b9d57600080fd5b506106eb6123ba565b348015610bb257600080fd5b506104686004356123cb565b348015610bca57600080fd5b506106eb60ff60043516602435604435600160a060020a036064351660843560a4356123dd565b348015610bfd57600080fd5b506106eb600160a060020a0360043516612546565b348015610c1e57600080fd5b50610c2a60043561254e565b6040805160208082528351818301528351919283929083019185019080838360005b83811015610c64578181015183820152602001610c4c565b50505050905090810190601f168015610c915780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b348015610cab57600080fd5b50610451600160a060020a036004351660ff602435811690604435166125f5565b348015610cd857600080fd5b506106eb60ff600435811690600160a060020a03602435169060443516612602565b348015610d0657600080fd5b5061052c6127b9565b348015610d1b57600080fd5b506104ae6127be565b348015610d3057600080fd5b50610451600160a060020a036004351660ff602435811690604435166127ca565b348015610d5d57600080fd5b506104686127d7565b348015610d7257600080fd5b506104ae6127e6565b348015610d8757600080fd5b506104ae611829565b348015610d9c57600080fd5b50604080516020600460443581810135601f81018490048402850184019095528484526104ae948235600160a060020a0316946024803560ff169536959460649492019190819084018382808284375050604080516020601f89358b018035918201839004830284018301909452808352979a999881019791965091820194509250829150840183828082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506127f29650505050505050565b348015610eb857600080fd5b506106eb600160a060020a03600435166129c2565b348015610ed957600080fd5b506104ae6127b9565b348015610eee57600080fd5b506104ae600160a060020a03600435166024356044356064356129c8565b348015610f1857600080fd5b506040805160206004803580820135601f8101849004840285018401909552848452610451943694929360249392840191908190840183828082843750949750612a7b9650505050505050565b348015610f7157600080fd5b50610468600435612b8b565b348015610f8957600080fd5b506106eb600160a060020a0360043516612bb3565b348015610faa57600080fd5b5061092e612c0a565b348015610fbf57600080fd5b506106eb60ff600435811690600160a060020a03602435169060443516612c19565b348015610fed57600080fd5b5061052c600160a060020a0360043516612d75565b34801561100e57600080fd5b506106eb600160a060020a036004351660ff60243516612d93565b34801561103557600080fd5b5061092e612daf565b34801561104a57600080fd5b50610468600435612dbe565b34801561106257600080fd5b50610468612dd0565b34801561107757600080fd5b50610451612ddf565b34801561108c57600080fd5b5061092e612eb5565b3480156110a157600080fd5b506104ae612ec4565b3480156110b657600080fd5b50610451600160a060020a0360043516612eca565b3480156110d757600080fd5b506104ae612f1a565b3480156110ec57600080fd5b50610468600435612f20565b34801561110457600080fd5b50610468600435612f32565b34801561111c57600080fd5b506104ae612f44565b34801561113157600080fd5b50610c2a612f50565b34801561114657600080fd5b506104ae612fab565b34801561115b57600080fd5b506104ae612fb0565b34801561117057600080fd5b506106eb612fb6565b34801561118557600080fd5b50610451600160a060020a036004351660ff60243581169060443516612fe7565b3480156111b257600080fd5b50610451600160a060020a0360043516612ff4565b3480156111d357600080fd5b506106eb600435613059565b3480156111eb57600080fd5b5061052c600160a060020a0360043516613075565b34801561120c57600080fd5b506104ae613093565b34801561122157600080fd5b506106eb600160a060020a0360043516613099565b34801561124257600080fd5b506106eb600160a060020a036004351660ff6024351661323c565b600454600160a060020a03165b90565b600254600160a060020a031681565b60006112886015613257565b905090565b600181565b600354600160a060020a03163214806112b55750600354600160a060020a031633145b15156112c057600080fd5b60048054600160a060020a031916600160a060020a0392909216919091179055565b600481565b600160a060020a03811660009081526022602052604090205460ff165b919050565b600f5460ff1681565b6000806000806000808c945084600160a060020a03166338d0f5048c8a8a6040518463ffffffff1660e060020a028152600401808460ff1660ff1681526020018060200180602001838103835285818151815260200191508051906020019060200280838360005b8381101561139257818101518382015260200161137a565b50505050905001838103825284818151815260200191508051906020019060200280838360005b838110156113d15781810151838201526020016113b9565b5050505090500195505050505050606060405180830381600087803b1580156113f957600080fd5b505af115801561140d573d6000803e3d6000fd5b505050506040513d606081101561142357600080fd5b508051602082015160409092015195509350915060ff83161561144557600080fd5b600160a060020a03851663a1ff106e60ff84161515611465576000611467565b855b8d8d8d8d8d6040518763ffffffff1660e060020a028152600401808660ff1660ff16815260200180602001806020018060200180602001858103855289818151815260200191508051906020019080838360005b838110156114d35781810151838201526020016114bb565b50505050905090810190601f1680156115005780820380516001836020036101000a031916815260200191505b5085810384528851815288516020918201918a019080838360005b8381101561153357818101518382015260200161151b565b50505050905090810190601f1680156115605780820380516001836020036101000a031916815260200191505b508581038352875181528751602091820191808a01910280838360005b8381101561159557818101518382015260200161157d565b50505050905001858103825286818151815260200191508051906020019060200280838360005b838110156115d45781810151838201526020016115bc565b5050505090500199505050505050505050506020604051808303818588803b1580156115ff57600080fd5b505af1158015611613573d6000803e3d6000fd5b50505050506040513d602081101561162a57600080fd5b50519d9c50505050505050505050505050565b601c5490565b600354600090600160a060020a038381169116148061166c5750600354600160a060020a031633145b92915050565b600354600160a060020a03163214806116955750600354600160a060020a031633145b15156116a057600080fd5b600160a060020a038083166000908152600d6020526040902054161580156116ce57506116cc82612bb3565b155b1561177a57600b54600c5410156117245781600b600c548154811015156116f157fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a03160217905550611770565b600b80546001810182556000919091527f0175b7a638427703f0dbe7bb9bbf987a2551717b34e79f33b5b1008d1fa01db9018054600160a060020a031916600160a060020a0384161790555b600c805460010190555b600160a060020a038281166000818152600d60209081526040918290208054600160a060020a0319169486169485179055815192835282019290925281517f280016f7418306a55542432120fd1a239ef9fcc1a92694d8d44ca76be0249ea7929181900390910190a15050565b600f54610100900460ff1681565b600090565b600f5460009061181390610100900460ff168484612602565b9392505050565b600f5462010000900460ff1681565b600281565b600d60205260009081526040902054600160a060020a031681565b60265481565b600080805b600b54821015611ac757600b80548390811061186c57fe5b6000918252602091829020015460408051808401889052815180820385018152908201918290528051600160a060020a03909316945092909182918401908083835b602083106118cd5780518252601f1990920191602091820191016118ae565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390206000191681600160a060020a031663e02dd9c26040518163ffffffff1660e060020a028152600401600060405180830381600087803b15801561193c57600080fd5b505af1158015611950573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052602081101561197957600080fd5b81019080805164010000000081111561199157600080fd5b820160208101848111156119a457600080fd5b81516401000000008111828201871017156119be57600080fd5b50509291905050506040516020018082805190602001908083835b602083106119f85780518252601f1990920191602091820191016119d9565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040516020818303038152906040526040518082805190602001908083835b60208310611a5b5780518252601f199092019160209182019101611a3c565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020600019161415611abc57600b805483908110611aa057fe5b600091825260209091200154600160a060020a03169250611acc565b600190910190611854565b600092505b5050919050565b611ae060218484846134bd565b505050565b60048054604080517f26683e14000000000000000000000000000000000000000000000000000000008152600160a060020a038581169482019490945290516000939092169182916326683e1491602480830192602092919082900301818887803b158015611b5357600080fd5b505af1158015611b67573d6000803e3d6000fd5b505050506040513d6020811015611b7d57600080fd5b50519392505050565b50600090565b6000600c5460001415611ba157506001611304565b61166c82612bb3565b60008033600160a060020a03841614611bc257600080fd5b82905080600160a060020a0316638280dd8f60006040518263ffffffff1660e060020a02815260040180828152602001915050602060405180830381600087803b158015611c0f57600080fd5b505af1158015611c23573d6000803e3d6000fd5b505050506040513d6020811015611c3957600080fd5b5050604080517f27c1c21d0000000000000000000000000000000000000000000000000000000081529051600160a060020a038316916327c1c21d9160048083019260209291908290030181600087803b158015611c9657600080fd5b505af1158015611caa573d6000803e3d6000fd5b505050506040513d6020811015611cc057600080fd5b5051159392505050565b601b80546000919083908110611cdc57fe5b600091825260209091200154600160a060020a031692915050565b6000806000806000611d096011613257565b611d136019613257565b611d1d6015613257565b611d27601d613257565b611d316021613257565b945094509450945094509091929394565b600160a060020a03166000908152601a602052604090205460ff1690565b601954601c5460ff9091169082565b600a54600160a060020a031681565b60075490565b604080517f5cc4aa9b00000000000000000000000000000000000000000000000000000000815260048101859052602481018490526044810183905290516000918791600160a060020a03831691635cc4aa9b91606480830192602092919082900301818887803b158015611df857600080fd5b505af1158015611e0c573d6000803e3d6000fd5b505050506040513d6020811015611e2257600080fd5b5051979650505050505050565b611ae060158484846134bd565b600354600160a060020a0316321480611e5f5750600354600160a060020a031633145b1515611e6a57600080fd5b600354600160a060020a0316ff5b600354600160a060020a0390811691161490565b6000611e966117f5565b1515611ea157600080fd5b600060068054600181600116156101000203166002900490501115611f1a5760078054600181810180845560009390935260068054611f17937fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c6880192600261010091831615919091026000190190911604613c06565b50505b60088054611f3d9160069160026000196101006001841615020190911604613c06565b50604080516020810191829052600090819052611f5c91600891613c8b565b5060408051602080825260068054600260001961010060018416150201909116049183018290527f5ae4ddb3009a8ccdedc04b2011fc66a472807bcdcff04af16286ddb27819ebe193909291829182019084908015611ffc5780601f10611fd157610100808354040283529160200191611ffc565b820191906000526020600020905b815481529060010190602001808311611fdf57829003601f168201915b50509250505060405180910390a190565b600454600090600160a060020a03168180338314806120b95750604080517fd6be0f490000000000000000000000000000000000000000000000000000000081523360048201529051600091600160a060020a0386169163d6be0f499160248082019260209290919082900301818787803b15801561208b57600080fd5b505af115801561209f573d6000803e3d6000fd5b505050506040513d60208110156120b557600080fd5b5051115b15156120c457600080fd5b600083600160a060020a031663d6be0f498d6040518263ffffffff1660e060020a0281526004018082600160a060020a0316600160a060020a03168152602001915050602060405180830381600087803b15801561212157600080fd5b505af1158015612135573d6000803e3d6000fd5b505050506040513d602081101561214b57600080fd5b50511161215757600080fd5b602654851161219b5760408051600160a060020a038d168152600160208201528151600080516020613d33833981519152929181900390910190a1600093506122d6565b30318611156121df5760408051600160a060020a038d168152600260208201528151600080516020613d33833981519152929181900390910190a1600093506122d6565b6121ed8a8a8a8a8a8a6123dd565b91508115156122315760408051600160a060020a038d168152600360208201528151600080516020613d33833981519152929181900390910190a1600093506122d6565b6026859055604051600160a060020a0388169087156108fc029088906000818181858888f19350505050905080151561229f5760408051600160a060020a038d168152600460208201528151600080516020613d33833981519152929181900390910190a1600093506122d6565b60408051600160a060020a038d168152600060208201528151600080516020613d33833981519152929181900390910190a1600193505b505050979650505050505050565b60255481565b60205490565b600f546000906118139060ff168484612602565b600f54640100000000900460ff1681565b600f546000906118139062010000900460ff168484612602565b600f546301000000900460ff1681565b600160a060020a031660009081526016602052604090205460ff1690565b60215460245460ff9091169082565b600254600160a060020a0316321461238357600080fd5b600160a060020a038116151561239857600080fd5b60028054600160a060020a031916600160a060020a0392909216919091179055565b600354600160a060020a0316321490565b602380546000919083908110611cdc57fe5b604080516c01000000000000000000000000308102602080840191909152600160a060020a038716909102603483015260488201859052606880830185905283518084039091018152608890920192839052815160009384938493909282918401908083835b602083106124625780518252601f199092019160209182019101612443565b6001836020036101000a038019825116818451168082178552505050505050905001915050604051809103902091506001828a8a8a604051600081526020016040526040518085600019166000191681526020018460ff1660ff1681526020018360001916600019168152602001826000191660001916815260200194505050505060206040516020810390808403906000865af1158015612508573d6000803e3d6000fd5b5050604051601f190151600354909250600160a060020a038084169116149050612535576000925061253a565b600192505b50509695505050505050565b6000903b1190565b600780548290811061255c57fe5b600091825260209182902001805460408051601f60026000196101006001871615020190941693909304928301859004850281018501909152818152935090918301828280156125ed5780601f106125c2576101008083540402835291602001916125ed565b820191906000526020600020905b8154815290600101906020018083116125d057829003601f168201915b505050505081565b611ae060118484846134bd565b600080600080600080612616898989612c19565b94506001851515141561262c57600195506127ad565b600091505b601c5482101561272c57601b80548390811061264957fe5b600091825260209091200154600160a060020a03169250821561272157604080517fa00b38c400000000000000000000000000000000000000000000000000000000815260ff808c166004830152600160a060020a038b81166024840152908a166044830152915194955085949185169163a00b38c4916064808201926020929091908290030181600087803b1580156126e257600080fd5b505af11580156126f6573d6000803e3d6000fd5b505050506040513d602081101561270c57600080fd5b505115156001141561272157600195506127ad565b600190910190612631565b87905080600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561276d57600080fd5b505af1158015612781573d6000803e3d6000fd5b505050506040513d602081101561279757600080fd5b5051600354600160a060020a0390811691161495505b50505050509392505050565b600081565b6000611288601d613257565b611ae0601d8484846134bd565b600354600160a060020a031681565b60006112886011613257565b60008686868686866040516020018087600160a060020a0316600160a060020a03166c010000000000000000000000000281526014018660ff1660ff167f010000000000000000000000000000000000000000000000000000000000000002815260010185805190602001908083835b602083106128815780518252601f199092019160209182019101612862565b51815160209384036101000a600019018019909216911617905287519190930192870191508083835b602083106128c95780518252601f1990920191602091820191016128aa565b51815160209384036101000a60001901801990921691161790528651919093019286810192500280838360005b8381101561290e5781810151838201526020016128f6565b50505050905001828051906020019060200280838360005b8381101561293e578181015183820152602001612926565b5050505090500196505050505050506040516020818303038152906040526040518082805190602001908083835b6020831061298b5780518252601f19909201916020918201910161296c565b5181516020939093036101000a600019018019909116921691909117905260405192018290039091209a9950505050505050505050565b50600190565b604080516c01000000000000000000000000600160a060020a0387160260208083019190915260348201869052605482018590526074808301859052835180840390910181526094909201928390528151600093918291908401908083835b60208310612a465780518252601f199092019160209182019101612a27565b5181516020939093036101000a6000190180199091169216919091179052604051920182900390912098975050505050505050565b612a836123ba565b1515612a8e57600080fd5b8051608011612a9c57600080fd5b8051612aaf906008906020840190613c8b565b506004547fb3ac059d88af6016aca1aebb7b3e796f2e7420435c59c563687814e9b85daa7590600160a060020a0316612ae661125d565b60408051600160a060020a038085168252831660208201526060918101828152600880546002600019610100600184161502019091160493830184905292608083019084908015612b785780601f10612b4d57610100808354040283529160200191612b78565b820191906000526020600020905b815481529060010190602001808311612b5b57829003601f168201915b505094505050505060405180910390a150565b600b805482908110612b9957fe5b600091825260209091200154600160a060020a0316905081565b600080805b600c54811015612c035783600160a060020a0316600b82815481101515612bdb57fe5b600091825260209091200154600160a060020a03161415612bfb57600191505b600101612bb8565b5092915050565b601d5460205460ff9091169082565b600080839050600360009054906101000a9004600160a060020a0316600160a060020a031681600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015612c7c57600080fd5b505af1158015612c90573d6000803e3d6000fd5b505050506040513d6020811015612ca657600080fd5b5051600160a060020a03161415612cc05760019150612d6d565b600f5460ff86811691161415612ce357612cdc601585856139d6565b9150612d6d565b600f5460ff868116610100909204161415612d0457612cdc601985856139d6565b600f5460ff86811662010000909204161415612d2657612cdc601185856139d6565b600f5460ff868116640100000000909204161415612d4a57612cdc602185856139d6565b600f5460ff8681166301000000909204161415612d6d57612cdc601d85856139d6565b509392505050565b600160a060020a03166000908152601e602052604090205460ff1690565b600f5460009061181390640100000000900460ff168484612602565b60155460185460ff9091169082565b601f80546000919083908110611cdc57fe5b600454600160a060020a031681565b600354600160a060020a0316331480612dfb5750612dfb6117f5565b1515612e0657600080fd5b60408051602080825260068054600260001961010060018416150201909116049183018290527f403f30aa5f4f2f89331a7b50054f64a00ce206f4d0a37f566ff344bbe46f8b6593909291829182019084908015612ea55780601f10612e7a57610100808354040283529160200191612ea5565b820191906000526020600020905b815481529060010190602001808311612e8857829003601f168201915b50509250505060405180910390a1565b60115460145460ff9091169082565b600c5481565b600354600160a060020a0316321480612eed5750600354600160a060020a031633145b1515612ef857600080fd5b600a8054600160a060020a031916600160a060020a0392909216919091179055565b60145490565b601780546000919083908110611cdc57fe5b601380546000919083908110611cdc57fe5b60006112886019613257565b6006805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156125ed5780601f106125c2576101008083540402835291602001916125ed565b600381565b60185490565b6040516000907fed78a9defa7412748c9513ba9cf680f57703a46dd7e0fb0b1e94063423c73e88908290a150600190565b611ae060198484846134bd565b600354600160a060020a03163214806130175750600354600160a060020a031633145b151561302257600080fd5b600160a060020a038116151561303757600080fd5b60038054600160a060020a031916600160a060020a0392909216919091179055565b600060265482111561306d57506001611304565b506000919050565b600160a060020a031660009081526012602052604090205460ff1690565b60245490565b60035460009081908190600160a060020a03163214806130c35750600354600160a060020a031633145b15156130ce57600080fd5b5050600c546000190160005b600c54811015611ac75783600160a060020a0316600b828154811015156130fd57fe5b600091825260209091200154600160a060020a0316141561323457600b80548290811061312657fe5b60009182526020909120018054600160a060020a03191690558082146131cb57600b80548390811061315457fe5b600091825260209091200154600b8054600160a060020a03909216918390811061317a57fe5b60009182526020909120018054600160a060020a031916600160a060020a0392909216919091179055600b8054839081106131b157fe5b60009182526020909120018054600160a060020a03191690555b600c829055600160a060020a0384166000818152600d60209081526040918290208054600160a060020a0319169055815192835290517fd41375b9d347dfe722f90a780731abd23b7855f9cf14ea7063c4cab5f9ae58e29281900390910190a160019250611acc565b6001016130da565b600f54600090611813906301000000900460ff168484612602565b600080805b8360030154811015612c0357613296846002018281548110151561327c57fe5b600091825260209091200154600160a060020a0316612546565b1515613420577fa33a9370a938260eee2537d9480ca0caa9789521da8e57afb3a0699d3ff9b2608185600201838154811015156132cf57fe5b600091825260209182902001546040805192830193909352600160a060020a03168183015260608082526004908201527f6465616400000000000000000000000000000000000000000000000000000000608082015290519081900360a00190a16002840180548290811061334057fe5b60009182526020909120018054600160a060020a031916905560038401546001929092019160001901811461340f5783600201600185600301540381548110151561338757fe5b600091825260209091200154600285018054600160a060020a0390921691839081106133af57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055508360020160018560030154038154811015156133f557fe5b60009182526020909120018054600160a060020a03191690555b6003840180546000190190556134b8565b7fa33a9370a938260eee2537d9480ca0caa9789521da8e57afb3a0699d3ff9b26081856002018381548110151561345357fe5b600091825260209182902001546040805192830193909352600160a060020a03168183015260608082526005908201527f616c697665000000000000000000000000000000000000000000000000000000608082015290519081900360a00190a16001015b61325c565b60008060008060006134cd613cf9565b600060ff8816156136c15760048054604080517f63e6ffdd000000000000000000000000000000000000000000000000000000008152329381019390935251600160a060020a03909116985088916363e6ffdd9160248083019260209291908290030181600087803b15801561354257600080fd5b505af1158015613556573d6000803e3d6000fd5b505050506040513d602081101561356c57600080fd5b50519550600160a060020a03861615156136015789945084600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b1580156135c157600080fd5b505af11580156135d5573d6000803e3d6000fd5b505050506040513d60208110156135eb57600080fd5b5051600160a060020a0316321461360157600080fd5b600160a060020a038616156136c1578a54604080517f7fb52f1a00000000000000000000000000000000000000000000000000000000815260ff9092166004830152600160a060020a038c8116602484015260026044840152905188965090861691637fb52f1a9160648083019260209291908290030181600087803b15801561368a57600080fd5b505af115801561369e573d6000803e3d6000fd5b505050506040513d60208110156136b457600080fd5b505115156136c157600080fd5b600160a060020a038a16600090815260018c01602090815260409182902054600a60ff9182169081068216808752606482068190038316938701849052928103929092031691840191909152925061371832611e78565b15156001141561384f5760ff8816151561374b5760008260ff8b166003811061373d57fe5b60ff90921660209290920201525b60018260ff8b166003811061375c57fe5b602002015160ff16148015613775575060ff8816600114155b156137c057601060ff8a166003811061378a57fe5b602081049091015460ff601f9092166101000a9004811689029083908b16600381106137b257fe5b60ff90921660209290920201525b600160ff89161061381357601060ff8a16600381106137db57fe5b602091828204019190069054906101000a900460ff16600202828a60ff1660038110151561380557fe5b60ff90921660209290920201525b60ff8916158015613826575060ff881615155b1561384a5760028260ff8b166003811061383c57fe5b60ff90921660209290920201525b6138e9565b600160ff89161080159061387757508160ff8a166003811061386d57fe5b602002015160ff16155b156138c057601060ff8a166003811061388c57fe5b602081049091015460ff601f9092166101000a900481169083908b16600381106138b257fe5b60ff90921660209290920201525b60ff881615156138e95760008260ff8b16600381106138db57fe5b60ff90921660209290920201525b81600260200201518260016020020151836000602002015101019050808b60010160008c600160a060020a0316600160a060020a0316815260200190815260200160002060006101000a81548160ff021916908360ff1602179055508060ff1660001415801561395a575060ff8316155b15613969576139698b8b613a2a565b60ff8116151561397f5761397d8b8b613ac1565b505b60408051308152600160a060020a038c16602082015260ff83168183015290517f23dcae6acc296731e3679d01e7cd963988e5a372850a0a1db2b9b01539e19ff49181900360600190a15050505050505050505050565b600160a060020a038216600090815260018401602052604081205460ff90811690601090841660038110613a0657fe5b60208104919091015460ff601f9092166101000a9004811691161015949350505050565b600282015460038301541015613a835780826002018360030154815481101515613a5057fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a03160217905550613ab4565b60028201805460018101825560009182526020909120018054600160a060020a031916600160a060020a0383161790555b5060030180546001019055565b6000805b8360030154811015613bfc5782600160a060020a03168460020182815481101515613aec57fe5b600091825260209091200154600160a060020a03161415613bf45760028401805482908110613b1757fe5b60009182526020909120018054600160a060020a03191690556003840154600019018114613bdf57836002016001856003015403815481101515613b5757fe5b600091825260209091200154600285018054600160a060020a039092169183908110613b7f57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a03160217905550836002016001856003015403815481101515613bc557fe5b60009182526020909120018054600160a060020a03191690555b60038401805460001901905560019150612c03565b600101613ac5565b5060009392505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10613c3f5780548555613c7b565b82800160010185558215613c7b57600052602060002091601f016020900482015b82811115613c7b578254825591600101919060010190613c60565b50613c87929150613d18565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10613ccc57805160ff1916838001178555613c7b565b82800160010185558215613c7b579182015b82811115613c7b578251825591602001919060010190613cde565b6060604051908101604052806003906020820280388339509192915050565b61126a91905b80821115613c875760008155600101613d1e5600583d8312ef7016406c7ea8ba9796b9e55ac1fdc22455754cbc93869509faefada165627a7a7230582001c90b02217697078cac739e065a683beb4e58c8862c990e442f729fb97e9a540029"
};
module.exports = contract;