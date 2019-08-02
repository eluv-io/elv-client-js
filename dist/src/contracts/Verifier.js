"use strict";

var contract = {
  "abi": [{
    "constant": true,
    "inputs": [{
      "name": "_addr",
      "type": "address"
    }, {
      "name": "msgHash",
      "type": "bytes32"
    }, {
      "name": "v",
      "type": "uint8"
    }, {
      "name": "r",
      "type": "bytes32"
    }, {
      "name": "s",
      "type": "bytes32"
    }],
    "name": "isSigned",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "msgHash",
      "type": "bytes32"
    }, {
      "name": "v",
      "type": "uint8"
    }, {
      "name": "r",
      "type": "bytes32"
    }, {
      "name": "s",
      "type": "bytes32"
    }],
    "name": "recoverAddr",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
  }],
  "bytecode": "608060405234801561001057600080fd5b50610226806100206000396000f30060806040526004361061004b5763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416638677ebe88114610050578063e5df669f146100a1575b600080fd5b34801561005c57600080fd5b5061008d73ffffffffffffffffffffffffffffffffffffffff6004351660243560ff604435166064356084356100ee565b604080519115158252519081900360200190f35b3480156100ad57600080fd5b506100c560043560ff6024351660443560643561018d565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b604080516000808252602080830180855288905260ff87168385015260608301869052608083018590529251909273ffffffffffffffffffffffffffffffffffffffff89169260019260a08083019392601f19830192908190039091019087865af1158015610161573d6000803e3d6000fd5b5050506020604051035173ffffffffffffffffffffffffffffffffffffffff1614905095945050505050565b604080516000808252602080830180855288905260ff87168385015260608301869052608083018590529251909260019260a080820193601f198101928190039091019086865af11580156101e6573d6000803e3d6000fd5b5050604051601f19015196955050505050505600a165627a7a72305820a2a60ae608fb3e0f95dee7916c282c0968c93c9a141768b64bb714b8a71611e10029"
};
module.exports = contract;