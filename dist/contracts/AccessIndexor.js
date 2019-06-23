"use strict";

var contract = {
  "abi": [{
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
    "inputs": [],
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
  "bytecode": "7f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f416363657373496e6465786f7232303139303532383139343230304d4c00000060045560058054600160ff19909116811761ff0019166102001762ff00001916620300001763ff000000191663040000001764ff0000000019166405000000001790915560e06040526080908152600a60a052606460c052620000ac9060069060036200013a565b506001805432600160a060020a031991821681179092556002805490911690911790556005546007805462010000830460ff90811660ff1992831617909255600f805461010085048416908316179055600b805483851690831617905560138054630100000085048416908316179055601780546401000000009094049092169216919091179055620001f8565b600183019183908215620001c25791602002820160005b838211156200019157835183826101000a81548160ff021916908360ff160217905550926020019260010160208160000104928301926001030262000151565b8015620001c05782816101000a81549060ff021916905560010160208160000104928301926001030262000191565b505b50620001d0929150620001d4565b5090565b620001f591905b80821115620001d057805460ff19168155600101620001db565b90565b611b0080620002086000396000f30060806040526004361061029a5763ffffffff60e060020a60003504166302d05d3f811461029c578063048bd529146102cd578063055af48f146102f457806308d865d714610315578063091600e61461034c5780630dc10d3f1461036157806312915a301461037657806315c0bac11461038b57806316aed232146103c657806318689733146103db578063224dcba0146103f05780632d474cbd1461041d5780632fa5c84214610435578063304f4a7b1461047557806330e66949146104965780633def5140146104c857806341c0e1b5146104f557806342e7ba7b1461050a578063479a0c511461052b57806354fd4d50146105405780635c1d3059146105555780635d97b6c2146103db5780635faecb761461056a5780636373a411146105915780636813b6d1146105a657806368a0469a146105cd57806369881c0c146105e25780636c0f79b6146106035780636d2e4b1b146106185780636ebc8c86146106395780637709bc78146106515780637cbb7bf2146106725780637fb52f1a1461069f5780638232f3f1146106cd57806385e0a200146106e25780638635adb5146106f75780638da5cb5b1461072457806392297d7b1461073957806396eba03d146106cd5780639f46133e1461074e578063a00b38c414610763578063a4081d6214610791578063a864dfa5146107b2578063a980892d146107d9578063aa3f6952146107ee578063af570c0414610806578063c4b1978d1461081b578063cb86806d14610830578063cf8a750314610845578063d15d62a71461085d578063d1aeb6511461052b578063d30f8cd014610875578063ebe9314e1461088a578063f17bda911461089f578063f2fde38b146108cc578063fb52222c146108ed578063fccc134f1461090e578063fe538c5a14610923575b005b3480156102a857600080fd5b506102b161094a565b60408051600160a060020a039092168252519081900360200190f35b3480156102d957600080fd5b506102e2610959565b60408051918252519081900360200190f35b34801561030057600080fd5b5061029a600160a060020a036004351661096a565b34801561032157600080fd5b50610336600160a060020a03600435166109ba565b6040805160ff9092168252519081900360200190f35b34801561035857600080fd5b506103366109d8565b34801561036d57600080fd5b506102e26109e1565b34801561038257600080fd5b506103366109e7565b34801561039757600080fd5b506103b2600160a060020a036004351660ff602435166109f5565b604080519115158252519081900360200190f35b3480156103d257600080fd5b50610336610a15565b3480156103e757600080fd5b50610336610a24565b3480156103fc57600080fd5b5061029a600160a060020a036004351660ff60243581169060443516610a29565b34801561042957600080fd5b506102b1600435610a3b565b34801561044157600080fd5b5061044a610a68565b6040805195865260208601949094528484019290925260608401526080830152519081900360a00190f35b34801561048157600080fd5b50610336600160a060020a0360043516610ab3565b3480156104a257600080fd5b506104ab610ad1565b6040805160ff909316835260208301919091528051918290030190f35b3480156104d457600080fd5b5061029a600160a060020a036004351660ff60243581169060443516610ae0565b34801561050157600080fd5b5061029a610aed565b34801561051657600080fd5b506103b2600160a060020a0360043516610b29565b34801561053757600080fd5b50610336610b3d565b34801561054c57600080fd5b506102e2610b42565b34801561056157600080fd5b506102e2610b48565b34801561057657600080fd5b506103b2600160a060020a036004351660ff60243516610b4e565b34801561059d57600080fd5b50610336610b62565b3480156105b257600080fd5b506103b2600160a060020a036004351660ff60243516610b73565b3480156105d957600080fd5b50610336610b8d565b3480156105ee57600080fd5b50610336600160a060020a0360043516610b9d565b34801561060f57600080fd5b506104ab610bbb565b34801561062457600080fd5b5061029a600160a060020a0360043516610bca565b34801561064557600080fd5b506102b1600435610c18565b34801561065d57600080fd5b506103b2600160a060020a0360043516610c2a565b34801561067e57600080fd5b5061029a600160a060020a036004351660ff60243581169060443516610c32565b3480156106ab57600080fd5b506103b260ff600435811690600160a060020a03602435169060443516610c3f565b3480156106d957600080fd5b50610336610df6565b3480156106ee57600080fd5b506102e2610dfb565b34801561070357600080fd5b5061029a600160a060020a036004351660ff60243581169060443516610e07565b34801561073057600080fd5b506102b1610e14565b34801561074557600080fd5b506102e2610e23565b34801561075a57600080fd5b506104ab610e2f565b34801561076f57600080fd5b506103b260ff600435811690600160a060020a03602435169060443516610e3e565b34801561079d57600080fd5b50610336600160a060020a0360043516610f9a565b3480156107be57600080fd5b506103b2600160a060020a036004351660ff60243516610fb8565b3480156107e557600080fd5b506104ab610fd4565b3480156107fa57600080fd5b506102b1600435610fe3565b34801561081257600080fd5b506102b1610ff5565b34801561082757600080fd5b506104ab611004565b34801561083c57600080fd5b506102e2611013565b34801561085157600080fd5b506102b1600435611019565b34801561086957600080fd5b506102b160043561102b565b34801561088157600080fd5b506102e261103d565b34801561089657600080fd5b506102e2611049565b3480156108ab57600080fd5b5061029a600160a060020a036004351660ff6024358116906044351661104f565b3480156108d857600080fd5b5061029a600160a060020a036004351661105c565b3480156108f957600080fd5b50610336600160a060020a03600435166110c1565b34801561091a57600080fd5b506102e26110df565b34801561092f57600080fd5b506103b2600160a060020a036004351660ff602435166110e5565b600154600160a060020a031681565b6000610965600b611100565b905090565b600254600160a060020a031632148061098d5750600254600160a060020a031633145b151561099857600080fd5b60038054600160a060020a031916600160a060020a0392909216919091179055565b600160a060020a031660009081526018602052604090205460ff1690565b60055460ff1681565b60125490565b600554610100900460ff1681565b600554600090610a0e90610100900460ff168484610c3f565b9392505050565b60055462010000900460ff1681565b600281565b610a36601784848461136d565b505050565b601180546000919083908110610a4d57fe5b600091825260209091200154600160a060020a031692915050565b6000806000806000610a7a6007611100565b610a84600f611100565b610a8e600b611100565b610a986013611100565b610aa26017611100565b945094509450945094509091929394565b600160a060020a031660009081526010602052604090205460ff1690565b600f5460125460ff9091169082565b610a36600b84848461136d565b600254600160a060020a0316321480610b105750600254600160a060020a031633145b1515610b1b57600080fd5b600254600160a060020a0316ff5b600254600160a060020a0390811691161490565b600181565b60045481565b60165490565b600554600090610a0e9060ff168484610c3f565b600554640100000000900460ff1681565b600554600090610a0e9062010000900460ff168484610c3f565b6005546301000000900460ff1681565b600160a060020a03166000908152600c602052604090205460ff1690565b601754601a5460ff9091169082565b600154600160a060020a03163214610be157600080fd5b600160a060020a0381161515610bf657600080fd5b60018054600160a060020a031916600160a060020a0392909216919091179055565b601980546000919083908110610a4d57fe5b6000903b1190565b610a36600784848461136d565b600080600080600080610c53898989610e3e565b945060018515151415610c695760019550610dea565b600091505b601254821015610d69576011805483908110610c8657fe5b600091825260209091200154600160a060020a031692508215610d5e57604080517fa00b38c400000000000000000000000000000000000000000000000000000000815260ff808c166004830152600160a060020a038b81166024840152908a166044830152915194955085949185169163a00b38c4916064808201926020929091908290030181600087803b158015610d1f57600080fd5b505af1158015610d33573d6000803e3d6000fd5b505050506040513d6020811015610d4957600080fd5b5051151560011415610d5e5760019550610dea565b600190910190610c6e565b87905080600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015610daa57600080fd5b505af1158015610dbe573d6000803e3d6000fd5b505050506040513d6020811015610dd457600080fd5b5051600254600160a060020a0390811691161495505b50505050509392505050565b600081565b60006109656013611100565b610a36601384848461136d565b600254600160a060020a031681565b60006109656007611100565b60135460165460ff9091169082565b600080839050600260009054906101000a9004600160a060020a0316600160a060020a031681600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015610ea157600080fd5b505af1158015610eb5573d6000803e3d6000fd5b505050506040513d6020811015610ecb57600080fd5b5051600160a060020a03161415610ee55760019150610f92565b60055460ff86811691161415610f0857610f01600b8585611885565b9150610f92565b60055460ff868116610100909204161415610f2957610f01600f8585611885565b60055460ff86811662010000909204161415610f4b57610f0160078585611885565b60055460ff868116640100000000909204161415610f6f57610f0160178585611885565b60055460ff8681166301000000909204161415610f9257610f0160138585611885565b509392505050565b600160a060020a031660009081526014602052604090205460ff1690565b600554600090610a0e90640100000000900460ff168484610c3f565b600b54600e5460ff9091169082565b601580546000919083908110610a4d57fe5b600354600160a060020a031681565b600754600a5460ff9091169082565b600a5490565b600d80546000919083908110610a4d57fe5b600980546000919083908110610a4d57fe5b6000610965600f611100565b600e5490565b610a36600f84848461136d565b600254600160a060020a031632148061107f5750600254600160a060020a031633145b151561108a57600080fd5b600160a060020a038116151561109f57600080fd5b60028054600160a060020a031916600160a060020a0392909216919091179055565b600160a060020a031660009081526008602052604090205460ff1690565b601a5490565b600554600090610a0e906301000000900460ff168484610c3f565b600080805b83600301548110156113665761113f846002018281548110151561112557fe5b600091825260209091200154600160a060020a0316610c2a565b15156112c9577fa33a9370a938260eee2537d9480ca0caa9789521da8e57afb3a0699d3ff9b26081856002018381548110151561117857fe5b600091825260209182902001546040805192830193909352600160a060020a03168183015260608082526004908201527f6465616400000000000000000000000000000000000000000000000000000000608082015290519081900360a00190a1600284018054829081106111e957fe5b60009182526020909120018054600160a060020a03191690556003840154600192909201916000190181146112b85783600201600185600301540381548110151561123057fe5b600091825260209091200154600285018054600160a060020a03909216918390811061125857fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a0316021790555083600201600185600301540381548110151561129e57fe5b60009182526020909120018054600160a060020a03191690555b600384018054600019019055611361565b7fa33a9370a938260eee2537d9480ca0caa9789521da8e57afb3a0699d3ff9b2608185600201838154811015156112fc57fe5b600091825260209182902001546040805192830193909352600160a060020a03168183015260608082526005908201527f616c697665000000000000000000000000000000000000000000000000000000608082015290519081900360a00190a16001015b611105565b5092915050565b600080600080600061137d611ab5565b600060ff88161561157057600354604080517f63e6ffdd0000000000000000000000000000000000000000000000000000000081523260048201529051600160a060020a03909216985088916363e6ffdd916024808201926020929091908290030181600087803b1580156113f157600080fd5b505af1158015611405573d6000803e3d6000fd5b505050506040513d602081101561141b57600080fd5b50519550600160a060020a03861615156114b05789945084600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561147057600080fd5b505af1158015611484573d6000803e3d6000fd5b505050506040513d602081101561149a57600080fd5b5051600160a060020a031632146114b057600080fd5b600160a060020a03861615611570578a54604080517f7fb52f1a00000000000000000000000000000000000000000000000000000000815260ff9092166004830152600160a060020a038c8116602484015260026044840152905188965090861691637fb52f1a9160648083019260209291908290030181600087803b15801561153957600080fd5b505af115801561154d573d6000803e3d6000fd5b505050506040513d602081101561156357600080fd5b5051151561157057600080fd5b600160a060020a038a16600090815260018c01602090815260409182902054600a60ff918216908106821680875260648206819003831693870184905292810392909203169184019190915292506115c732610b29565b1515600114156116fe5760ff881615156115fa5760008260ff8b16600381106115ec57fe5b60ff90921660209290920201525b60018260ff8b166003811061160b57fe5b602002015160ff16148015611624575060ff8816600114155b1561166f57600660ff8a166003811061163957fe5b602081049091015460ff601f9092166101000a9004811689029083908b166003811061166157fe5b60ff90921660209290920201525b600160ff8916106116c257600660ff8a166003811061168a57fe5b602091828204019190069054906101000a900460ff16600202828a60ff166003811015156116b457fe5b60ff90921660209290920201525b60ff89161580156116d5575060ff881615155b156116f95760028260ff8b16600381106116eb57fe5b60ff90921660209290920201525b611798565b600160ff89161080159061172657508160ff8a166003811061171c57fe5b602002015160ff16155b1561176f57600660ff8a166003811061173b57fe5b602081049091015460ff601f9092166101000a900481169083908b166003811061176157fe5b60ff90921660209290920201525b60ff881615156117985760008260ff8b166003811061178a57fe5b60ff90921660209290920201525b81600260200201518260016020020151836000602002015101019050808b60010160008c600160a060020a0316600160a060020a0316815260200190815260200160002060006101000a81548160ff021916908360ff1602179055508060ff16600014158015611809575060ff8316155b15611818576118188b8b6118d9565b60ff8116151561182e5761182c8b8b611970565b505b60408051308152600160a060020a038c16602082015260ff83168183015290517f23dcae6acc296731e3679d01e7cd963988e5a372850a0a1db2b9b01539e19ff49181900360600190a15050505050505050505050565b600160a060020a038216600090815260018401602052604081205460ff908116906006908416600381106118b557fe5b60208104919091015460ff601f9092166101000a9004811691161015949350505050565b60028201546003830154101561193257808260020183600301548154811015156118ff57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a03160217905550611963565b60028201805460018101825560009182526020909120018054600160a060020a031916600160a060020a0383161790555b5060030180546001019055565b6000805b8360030154811015611aab5782600160a060020a0316846002018281548110151561199b57fe5b600091825260209091200154600160a060020a03161415611aa357600284018054829081106119c657fe5b60009182526020909120018054600160a060020a03191690556003840154600019018114611a8e57836002016001856003015403815481101515611a0657fe5b600091825260209091200154600285018054600160a060020a039092169183908110611a2e57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a03160217905550836002016001856003015403815481101515611a7457fe5b60009182526020909120018054600160a060020a03191690555b60038401805460001901905560019150611366565b600101611974565b5060009392505050565b60606040519081016040528060039060208202803883395091929150505600a165627a7a72305820ad9318a8e327871f14731fdcb96bbb7c84c72465372cf0fa2a81316a098e68af0029"
};
module.exports = contract;