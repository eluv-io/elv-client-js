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
    "inputs": [{
      "name": "new_thing",
      "type": "bytes32"
    }],
    "name": "setSomething",
    "outputs": [{
      "name": "",
      "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
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
    "name": "something",
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
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f436f6e74656e7432303139303531303135313630304d4c00000000000000000060045560018054600160a060020a0319908116329081179092556002805490911690911790556105ef8061007e6000396000f3006080604052600436106101115763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166302d05d3f81146101135780630f82c16f14610144578063123e0e801461020957806317685953146102a85780633513a805146102b657806341c0e1b5146102c157806345080442146102d657806354fd4d50146102ee5780636af27417146103035780636d2e4b1b1461032e5780637b1cdb3e1461034f5780638da5cb5b14610357578063990322191461036c5780639e99bbea1461034f578063a7a0d53714610384578063af570c0414610399578063b535b03e146103ae578063e870ed91146103c3578063f185db0c146103d3578063f2fde38b146103e8575b005b34801561011f57600080fd5b50610128610409565b60408051600160a060020a039092168252519081900360200190f35b34801561015057600080fd5b506040805160206004602480358281013584810280870186019097528086526101da96843560ff1696369660449591949091019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104189650505050505050565b6040805160ff958616815293851660208501529190931682820152606082019290925290519081900360800190f35b6040805160206004604435818101358381028086018501909652808552610296958335956024803560ff1696369695606495939492019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104279650505050505050565b60408051918252519081900360200190f35b610296600435602435610431565b610296600435610439565b3480156102cd57600080fd5b5061011161043c565b3480156102e257600080fd5b50610296600435610478565b3480156102fa57600080fd5b5061029661047e565b34801561030f57600080fd5b50610318610484565b6040805160ff9092168252519081900360200190f35b34801561033a57600080fd5b50610111600160a060020a0360043516610489565b6102966104e4565b34801561036357600080fd5b506101286104e9565b34801561037857600080fd5b506102966004356104f8565b34801561039057600080fd5b50610296610532565b3480156103a557600080fd5b50610128610538565b3480156103ba57600080fd5b50610318610547565b6102966004356024351515610431565b3480156103df57600080fd5b5061031861054c565b3480156103f457600080fd5b50610111600160a060020a0360043516610551565b600154600160a060020a031681565b60076000808093509350935093565b6000949350505050565b600092915050565b90565b600254600160a060020a031632148061045f5750600254600160a060020a031633145b151561046a57600080fd5b600254600160a060020a0316ff5b50600090565b60045481565b600281565b600154600160a060020a031632146104a057600080fd5b600160a060020a03811615156104b557600080fd5b6001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b600090565b600254600160a060020a031681565b600254600090600160a060020a031632148061051e5750600254600160a060020a031633145b151561052957600080fd5b50600581905590565b60055481565b600354600160a060020a031681565b600181565b600481565b600254600160a060020a03163214806105745750600254600160a060020a031633145b151561057f57600080fd5b600160a060020a038116151561059457600080fd5b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600a165627a7a72305820c611cd0e124142f902151d5ad52d484564595aede69ef0099c37b6d97c5af52e0029"
};
module.exports = contract;