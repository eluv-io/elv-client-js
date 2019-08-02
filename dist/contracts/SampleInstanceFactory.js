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
    "inputs": [{
      "name": "centralized_ownership",
      "type": "bool"
    }],
    "name": "setCentralizedOwnership",
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
    "constant": true,
    "inputs": [],
    "name": "centralizedOwnership",
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
      "name": "logMsg",
      "type": "string"
    }, {
      "indexed": false,
      "name": "addr",
      "type": "address"
    }],
    "name": "dbgAddress",
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
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f436f6e74656e7432303139303531303135313630304d4c0000000000000000006004556005805460ff1916905560018054600160a060020a031990811632908117909255600280549091169091179055610de0806100886000396000f3006080604052600436106101115763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166302d05d3f81146101135780630a384186146101445780630f82c16f14610172578063123e0e801461023757806317685953146102d65780633513a805146102e457806341c0e1b5146102ef578063450804421461030457806354fd4d501461031c5780636af27417146103315780636d2e4b1b1461035c5780637b1cdb3e1461037d5780638da5cb5b1461038557806394188e3a1461039a5780639e99bbea146103af578063af570c04146103b7578063b535b03e146103cc578063e870ed91146103e1578063f185db0c146103f1578063f2fde38b14610406575b005b34801561011f57600080fd5b50610128610427565b60408051600160a060020a039092168252519081900360200190f35b34801561015057600080fd5b5061015e6004351515610436565b604080519115158252519081900360200190f35b34801561017e57600080fd5b5060408051602060046024803582810135848102808701860190975280865261020896843560ff1696369660449591949091019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104819650505050505050565b6040805160ff958616815293851660208501529190931682820152606082019290925290519081900360800190f35b60408051602060046044358181013583810280860185019096528085526102c4958335956024803560ff1696369695606495939492019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104909650505050505050565b60408051918252519081900360200190f35b6102c460043560243561049a565b6102c46004356104a2565b3480156102fb57600080fd5b506101116104a5565b34801561031057600080fd5b506102c46004356104e1565b34801561032857600080fd5b506102c46104e7565b34801561033d57600080fd5b506103466104ed565b6040805160ff9092168252519081900360200190f35b34801561036857600080fd5b50610111600160a060020a03600435166104f2565b6102c461054d565b34801561039157600080fd5b5061012861068f565b3480156103a657600080fd5b5061015e61069e565b6102c46106a7565b3480156103c357600080fd5b506101286106ac565b3480156103d857600080fd5b506103466106bb565b6102c4600435602435151561049a565b3480156103fd57600080fd5b506103466106c0565b34801561041257600080fd5b50610111600160a060020a03600435166106c5565b600154600160a060020a031681565b600254600090600160a060020a031632148061045c5750600254600160a060020a031633145b151561046757600080fd5b506005805460ff1916911515919091179081905560ff1690565b60076000808093509350935093565b6000949350505050565b600092915050565b90565b600254600160a060020a03163214806104c85750600254600160a060020a031633145b15156104d357600080fd5b600254600160a060020a0316ff5b50600090565b60045481565b600281565b600154600160a060020a0316321461050957600080fd5b600160a060020a038116151561051e57600080fd5b6001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b60008060008061055b610737565b604051809103906000f080158015610577573d6000803e3d6000fd5b50604080517fe5385303000000000000000000000000000000000000000000000000000000008152600160a060020a03831660048201529051919450339350839163e53853039160248082019260009290919082900301818387803b1580156105df57600080fd5b505af11580156105f3573d6000803e3d6000fd5b505060055460ff1615915061068590505750600254604080517ff2fde38b000000000000000000000000000000000000000000000000000000008152600160a060020a0392831660048201529051849283169163f2fde38b91602480830192600092919082900301818387803b15801561066c57600080fd5b505af1158015610680573d6000803e3d6000fd5b505050505b6000935050505090565b600254600160a060020a031681565b60055460ff1681565b600090565b600354600160a060020a031681565b600181565b600481565b600254600160a060020a03163214806106e85750600254600160a060020a031633145b15156106f357600080fd5b600160a060020a038116151561070857600080fd5b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b60405161066d8061074883390190560060806040527f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f436f6e74656e7432303139303531303135313630304d4c00000000000000000060045560018054600160a060020a0319908116329081179092556002805490911690911790556105ef8061007e6000396000f3006080604052600436106101115763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166302d05d3f81146101135780630f82c16f14610144578063123e0e801461020957806317685953146102a85780633513a805146102b657806341c0e1b5146102c157806345080442146102d657806354fd4d50146102ee5780636af27417146103035780636d2e4b1b1461032e5780637b1cdb3e1461034f5780638da5cb5b14610357578063990322191461036c5780639e99bbea1461034f578063a7a0d53714610384578063af570c0414610399578063b535b03e146103ae578063e870ed91146103c3578063f185db0c146103d3578063f2fde38b146103e8575b005b34801561011f57600080fd5b50610128610409565b60408051600160a060020a039092168252519081900360200190f35b34801561015057600080fd5b506040805160206004602480358281013584810280870186019097528086526101da96843560ff1696369660449591949091019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104189650505050505050565b6040805160ff958616815293851660208501529190931682820152606082019290925290519081900360800190f35b6040805160206004604435818101358381028086018501909652808552610296958335956024803560ff1696369695606495939492019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506104279650505050505050565b60408051918252519081900360200190f35b610296600435602435610431565b610296600435610439565b3480156102cd57600080fd5b5061011161043c565b3480156102e257600080fd5b50610296600435610478565b3480156102fa57600080fd5b5061029661047e565b34801561030f57600080fd5b50610318610484565b6040805160ff9092168252519081900360200190f35b34801561033a57600080fd5b50610111600160a060020a0360043516610489565b6102966104e4565b34801561036357600080fd5b506101286104e9565b34801561037857600080fd5b506102966004356104f8565b34801561039057600080fd5b50610296610532565b3480156103a557600080fd5b50610128610538565b3480156103ba57600080fd5b50610318610547565b6102966004356024351515610431565b3480156103df57600080fd5b5061031861054c565b3480156103f457600080fd5b50610111600160a060020a0360043516610551565b600154600160a060020a031681565b60076000808093509350935093565b6000949350505050565b600092915050565b90565b600254600160a060020a031632148061045f5750600254600160a060020a031633145b151561046a57600080fd5b600254600160a060020a0316ff5b50600090565b60045481565b600281565b600154600160a060020a031632146104a057600080fd5b600160a060020a03811615156104b557600080fd5b6001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b600090565b600254600160a060020a031681565b600254600090600160a060020a031632148061051e5750600254600160a060020a031633145b151561052957600080fd5b50600581905590565b60055481565b600354600160a060020a031681565b600181565b600481565b600254600160a060020a03163214806105745750600254600160a060020a031633145b151561057f57600080fd5b600160a060020a038116151561059457600080fd5b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600a165627a7a723058205270c3eebbe6d4acd4fd17173ddd867dad513250af7898c15f038cac16daf6430029a165627a7a723058200c34592b63b275027db4fbf6cee164e1434cf26def5e93cb1fe9325a2e81e5a70029"
};
module.exports = contract;