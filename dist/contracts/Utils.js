"use strict";

var contract = {
  "abi": [{
    "constant": true,
    "inputs": [{
      "name": "addr",
      "type": "address"
    }],
    "name": "getBalance",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }],
  "bytecode": "608060405234801561001057600080fd5b5060c68061001f6000396000f300608060405260043610603e5763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663f8b2cb4f81146043575b600080fd5b348015604e57600080fd5b50606e73ffffffffffffffffffffffffffffffffffffffff600435166080565b60408051918252519081900360200190f35b73ffffffffffffffffffffffffffffffffffffffff1631905600a165627a7a72305820c28e740e4f494b0e9f7cc32a9c1dd94dd439c426a360595a48ba1ef58fe04c370029"
};
module.exports = contract;