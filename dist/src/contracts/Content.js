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
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint8"
    }, {
      "name": "",
      "type": "bytes32[]"
    }, {
      "name": "",
      "type": "address[]"
    }],
    "name": "runAccessInfo",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }, {
      "name": "",
      "type": "uint8"
    }, {
      "name": "",
      "type": "uint8"
    }, {
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }, {
      "name": "",
      "type": "uint8"
    }, {
      "name": "",
      "type": "bytes32[]"
    }, {
      "name": "",
      "type": "address[]"
    }],
    "name": "runAccess",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }, {
      "name": "",
      "type": "uint256"
    }],
    "name": "runFinalize",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "proposed_status_code",
      "type": "int256"
    }],
    "name": "runStatusChange",
    "outputs": [{
      "name": "",
      "type": "int256"
    }],
    "payable": true,
    "stateMutability": "payable",
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
      "name": "",
      "type": "int256"
    }],
    "name": "runDescribeStatus",
    "outputs": [{
      "name": "",
      "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "pure",
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
    "name": "DEFAULT_ACCESS",
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
      "name": "newCreator",
      "type": "address"
    }],
    "name": "transferCreatorship",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "runCreate",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": true,
    "stateMutability": "payable",
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
    "name": "runKill",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": true,
    "stateMutability": "payable",
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
    "name": "DEFAULT_SEE",
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
      "name": "",
      "type": "uint256"
    }, {
      "name": "",
      "type": "bool"
    }],
    "name": "runGrant",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "requestID",
      "type": "uint256"
    }, {
      "name": "score_pct",
      "type": "uint256"
    }, {
      "name": "originator",
      "type": "address"
    }],
    "name": "runFinalizeExt",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "DEFAULT_CHARGE",
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
      "name": "newOwner",
      "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "label",
      "type": "string"
    }],
    "name": "Log",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "label",
      "type": "string"
    }, {
      "indexed": false,
      "name": "b",
      "type": "bool"
    }],
    "name": "LogBool",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "label",
      "type": "string"
    }, {
      "indexed": false,
      "name": "a",
      "type": "address"
    }],
    "name": "LogAddress",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "label",
      "type": "string"
    }, {
      "indexed": false,
      "name": "u",
      "type": "uint256"
    }],
    "name": "LogUint256",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "label",
      "type": "string"
    }, {
      "indexed": false,
      "name": "u",
      "type": "int256"
    }],
    "name": "LogInt256",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "label",
      "type": "string"
    }, {
      "indexed": false,
      "name": "b",
      "type": "bytes32"
    }],
    "name": "LogBytes32",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "label",
      "type": "string"
    }, {
      "indexed": false,
      "name": "payee",
      "type": "address"
    }, {
      "indexed": false,
      "name": "amount",
      "type": "uint256"
    }],
    "name": "LogPayment",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "result",
      "type": "uint256"
    }],
    "name": "RunCreate",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "result",
      "type": "uint256"
    }],
    "name": "RunKill",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "proposedStatusCode",
      "type": "int256"
    }, {
      "indexed": false,
      "name": "returnStatusCode",
      "type": "int256"
    }],
    "name": "RunStatusChange",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "level",
      "type": "uint8"
    }, {
      "indexed": false,
      "name": "calculateAccessCharge",
      "type": "int256"
    }],
    "name": "RunAccessCharge",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "requestID",
      "type": "uint256"
    }, {
      "indexed": false,
      "name": "result",
      "type": "uint256"
    }],
    "name": "RunAccess",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "requestID",
      "type": "uint256"
    }, {
      "indexed": false,
      "name": "result",
      "type": "uint256"
    }],
    "name": "RunFinalize",
    "type": "event"
  }],
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f436f6e74656e7432303139313033313136323030304d4c00000000000000000060045560018054600160a060020a03199081163290811790925560028054909116909117905561059a8061007e6000396000f3006080604052600436106101065763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166302d05d3f81146101085780630f82c16f14610139578063123e0e80146101fe578063176859531461029d5780633513a805146102ab57806341c0e1b5146102b657806345080442146102cb57806354fd4d50146102e35780636af27417146102f85780636d2e4b1b146103235780637b1cdb3e146103445780638da5cb5b1461034c5780639e99bbea14610344578063af570c0414610361578063b535b03e14610376578063e870ed911461038b578063eb81eff01461039b578063f185db0c146103b5578063f2fde38b146103ca575b005b34801561011457600080fd5b5061011d6103eb565b60408051600160a060020a039092168252519081900360200190f35b34801561014557600080fd5b506040805160206004602480358281013584810280870186019097528086526101cf96843560ff1696369660449591949091019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506103fa9650505050505050565b6040805160ff958616815293851660208501529190931682820152606082019290925290519081900360800190f35b604080516020600460443581810135838102808601850190965280855261028b958335956024803560ff1696369695606495939492019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104099650505050505050565b60408051918252519081900360200190f35b61028b600435602435610413565b61028b60043561041b565b3480156102c257600080fd5b5061010661041e565b3480156102d757600080fd5b5061028b60043561045a565b3480156102ef57600080fd5b5061028b610460565b34801561030457600080fd5b5061030d610466565b6040805160ff9092168252519081900360200190f35b34801561032f57600080fd5b50610106600160a060020a036004351661046b565b61028b6104c6565b34801561035857600080fd5b5061011d6104cb565b34801561036d57600080fd5b5061011d6104da565b34801561038257600080fd5b5061030d6104e9565b61028b6004356024351515610413565b61028b600435602435600160a060020a03604435166104ee565b3480156103c157600080fd5b5061030d6104f7565b3480156103d657600080fd5b50610106600160a060020a03600435166104fc565b600154600160a060020a031681565b60076000808093509350935093565b6000949350505050565b600092915050565b90565b600254600160a060020a03163214806104415750600254600160a060020a031633145b151561044c57600080fd5b600254600160a060020a0316ff5b50600090565b60045481565b600281565b600154600160a060020a0316321461048257600080fd5b600160a060020a038116151561049757600080fd5b6001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b600090565b600254600160a060020a031681565b600354600160a060020a031681565b600181565b60009392505050565b600481565b600254600160a060020a031632148061051f5750600254600160a060020a031633145b151561052a57600080fd5b600160a060020a038116151561053f57600080fd5b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600a165627a7a723058203a49f41eefb5d7ac566847ca5f2b81538ac7bce828a5eb2d6409a9f0aa0ec0460029"
};
module.exports = contract;