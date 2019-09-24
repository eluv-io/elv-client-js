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
      "name": "stream",
      "type": "address"
    }],
    "name": "disableRecording",
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
    "name": "recordingStreams",
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
    "constant": false,
    "inputs": [{
      "name": "stream",
      "type": "address"
    }],
    "name": "enableRecording",
    "outputs": [],
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
    "constant": false,
    "inputs": [{
      "name": "stream",
      "type": "address"
    }, {
      "name": "accessor",
      "type": "address"
    }],
    "name": "authorizeRecording",
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
    "constant": false,
    "inputs": [{
      "name": "stream",
      "type": "address"
    }],
    "name": "registerStream",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
      "name": "stream",
      "type": "address"
    }, {
      "indexed": false,
      "name": "accessor",
      "type": "address"
    }, {
      "indexed": false,
      "name": "decision",
      "type": "bool"
    }],
    "name": "AuthorizeRecording",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "stream",
      "type": "address"
    }],
    "name": "EnableRecording",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "stream",
      "type": "address"
    }],
    "name": "DisableRecording",
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
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f436f6e74656e7432303139303531303135313630304d4c0000000000000000006004557f4c7650726f766964657232303139303932333137353530304d4c00000000000060055560018054600160a060020a0319908116329081179092556002805490911690911790556108f6806100a26000396000f3006080604052600436106101325763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166302d05d3f81146101345780630f82c16f14610165578063123e0e801461022a57806317685953146102c957806320abe3ae146102d7578063250fc29a146102f85780633513a8051461032d57806341c0e1b514610338578063450804421461034d578063514eecff1461036557806354fd4d50146103865780636135c5041461039b5780636af27417146103c25780636d2e4b1b146103ed5780637b1cdb3e1461040e5780638da5cb5b146104165780639e99bbea1461040e578063ad284b121461042b578063af570c041461044c578063b535b03e14610461578063e870ed9114610476578063f185db0c14610486578063f2fde38b1461049b575b005b34801561014057600080fd5b506101496104bc565b60408051600160a060020a039092168252519081900360200190f35b34801561017157600080fd5b506040805160206004602480358281013584810280870186019097528086526101fb96843560ff1696369660449591949091019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104cb9650505050505050565b6040805160ff958616815293851660208501529190931682820152606082019290925290519081900360800190f35b60408051602060046044358181013583810280860185019096528085526102b7958335956024803560ff1696369695606495939492019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104da9650505050505050565b60408051918252519081900360200190f35b6102b76004356024356104e4565b3480156102e357600080fd5b50610132600160a060020a03600435166104ec565b34801561030457600080fd5b50610319600160a060020a0360043516610572565b604080519115158252519081900360200190f35b6102b7600435610587565b34801561034457600080fd5b5061013261058a565b34801561035957600080fd5b506102b76004356105c6565b34801561037157600080fd5b50610132600160a060020a03600435166105cc565b34801561039257600080fd5b506102b7610655565b3480156103a757600080fd5b50610319600160a060020a036004358116906024351661065b565b3480156103ce57600080fd5b506103d76106ca565b6040805160ff9092168252519081900360200190f35b3480156103f957600080fd5b50610132600160a060020a03600435166106cf565b6102b761072a565b34801561042257600080fd5b5061014961072f565b34801561043757600080fd5b50610132600160a060020a036004351661073e565b34801561045857600080fd5b5061014961083f565b34801561046d57600080fd5b506103d761084e565b6102b760043560243515156104e4565b34801561049257600080fd5b506103d7610853565b3480156104a757600080fd5b50610132600160a060020a0360043516610858565b600154600160a060020a031681565b60076000808093509350935093565b6000949350505050565b600092915050565b600254600160a060020a031632148061050f5750600254600160a060020a031633145b151561051a57600080fd5b600160a060020a038116600081815260066020908152604091829020805460ff19169055815192835290517f6317042190d28c86a2c94288b6415af2216320653d1b7fca2145f320833e46ec9281900390910190a150565b60066020526000908152604090205460ff1681565b90565b600254600160a060020a03163214806105ad5750600254600160a060020a031633145b15156105b857600080fd5b600254600160a060020a0316ff5b50600090565b600254600160a060020a03163214806105ef5750600254600160a060020a031633145b15156105fa57600080fd5b600160a060020a038116600081815260066020908152604091829020805460ff19166001179055815192835290517f4c49660aa366f5dbbcb1dbd1ec3af09f0a347b35d038e0cadcaa66a649ba71a19281900390910190a150565b60055481565b600160a060020a0380831660008181526006602090815260408083205481519485529486169184019190915260ff9093168015158385015292519092917fe7f8e24d42ea8b87bac0d5fed794e840346a2473644783f7e209404b34ccaaa4919081900360600190a19392505050565b600281565b600154600160a060020a031632146106e657600080fd5b600160a060020a03811615156106fb57600080fd5b6001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b600090565b600254600160a060020a031681565b600081905032600160a060020a031681600160a060020a0316638da5cb5b6040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401602060405180830381600087803b1580156107a457600080fd5b505af11580156107b8573d6000803e3d6000fd5b505050506040513d60208110156107ce57600080fd5b5051600160a060020a0316146107e357600080fd5b600160a060020a038216600081815260066020908152604091829020805460ff19166001179055815192835290517f4c49660aa366f5dbbcb1dbd1ec3af09f0a347b35d038e0cadcaa66a649ba71a19281900390910190a15050565b600354600160a060020a031681565b600181565b600481565b600254600160a060020a031632148061087b5750600254600160a060020a031633145b151561088657600080fd5b600160a060020a038116151561089b57600080fd5b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600a165627a7a7230582075fe8c17a54c6eb7bf64da8cb40c1319af6e5198e255253a0fedcf0cf235c3680029"
};
module.exports = contract;