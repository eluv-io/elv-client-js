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
      "name": "request_ID",
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
    "name": "tokenCreditPerAd",
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
      "name": "creditPerAd",
      "type": "uint256"
    }],
    "name": "setTokenCreditPerAd",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
      "name": "tokenCreditPerAd",
      "type": "uint256"
    }],
    "name": "TokenCreditPerAd",
    "type": "event"
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
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f436f6e74656e7432303139303531303135313630304d4c0000000000000000006004557f53706c436f6e74416476657274736e6732303139303232363131353430304d4c60055560018054600160a060020a031990811632908117909255600280549091169091179055610770806100a26000396000f3006080604052600436106101115763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166302d05d3f81146101135780630f82c16f14610144578063123e0e801461020957806317685953146102a85780633513a805146102b657806341c0e1b5146102c157806345080442146102d657806354fd4d50146102ee5780636af27417146103035780636d2e4b1b1461032e5780637b1cdb3e1461034f5780638b778284146103575780638da5cb5b1461036c5780639e99bbea1461034f578063af570c0414610381578063b535b03e14610396578063b82acb59146103ab578063e870ed91146103c3578063f185db0c146103d3578063f2fde38b146103e8575b005b34801561011f57600080fd5b50610128610409565b60408051600160a060020a039092168252519081900360200190f35b34801561015057600080fd5b506040805160206004602480358281013584810280870186019097528086526101da96843560ff1696369660449591949091019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104189650505050505050565b6040805160ff958616815293851660208501529190931682820152606082019290925290519081900360800190f35b6040805160206004604435818101358381028086018501909652808552610296958335956024803560ff1696369695606495939492019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104279650505050505050565b60408051918252519081900360200190f35b610296600435602435610431565b610296600435610583565b3480156102cd57600080fd5b50610111610586565b3480156102e257600080fd5b506102966004356105c2565b3480156102fa57600080fd5b506102966105c8565b34801561030f57600080fd5b506103186105ce565b6040805160ff9092168252519081900360200190f35b34801561033a57600080fd5b50610111600160a060020a03600435166105d3565b61029661062e565b34801561036357600080fd5b50610296610633565b34801561037857600080fd5b50610128610639565b34801561038d57600080fd5b50610128610648565b3480156103a257600080fd5b50610318610657565b3480156103b757600080fd5b5061011160043561065c565b61029660043560243515156106c5565b3480156103df57600080fd5b506103186106cd565b3480156103f457600080fd5b50610111600160a060020a03600435166106d2565b600154600160a060020a031681565b60076000808093509350935093565b6000949350505050565b60008060008060008033945084600160a060020a0316631a735f18896040518263ffffffff167c010000000000000000000000000000000000000000000000000000000002815260040180828152602001915050608060405180830381600087803b15801561049f57600080fd5b505af11580156104b3573d6000803e3d6000fd5b505050506040513d60808110156104c957600080fd5b50805160208201516040830151606090930151919650945092509050600160a060020a0384163214801561050057508060000b6001145b151561050b57600080fd5b600654604051329180156108fc02916000818181858888f19350505050158015610539573d6000803e3d6000fd5b50604080518981526000602082015281517fbf0f2215c45c5ee802d4c20bdfc915308c4459b0f6a78f23ad350e6408bf2891929181900390910190a1506000979650505050505050565b90565b600254600160a060020a03163214806105a95750600254600160a060020a031633145b15156105b457600080fd5b600254600160a060020a0316ff5b50600090565b60055481565b600281565b600154600160a060020a031632146105ea57600080fd5b600160a060020a03811615156105ff57600080fd5b6001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b600090565b60065481565b600254600160a060020a031681565b600354600160a060020a031681565b600181565b600254600160a060020a031632148061067f5750600254600160a060020a031633145b151561068a57600080fd5b60068190556040805182815290517ffad6c097c568a4bcebf08faf3b35206ff6b371b1f71c78ea7a483d026e4ac5c49181900360200190a150565b600092915050565b600481565b600254600160a060020a03163214806106f55750600254600160a060020a031633145b151561070057600080fd5b600160a060020a038116151561071557600080fd5b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600a165627a7a7230582064f47a345f08c962279f91738efc4e43655699e0c8e355da1d9d88c53a3030660029"
};
module.exports = contract;