"use strict";

var contract = {
  "abi": [{
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
    "inputs": [{
      "name": "",
      "type": "address"
    }],
    "name": "userWallets",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }],
  "bytecode": "60806040527f55736572537061636532303139303530363135353330304d4c0000000000000060005534801561003457600080fd5b5061011f806100446000396000f30060806040526004361060485763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166354fd4d508114604d57806363e6ffdd146071575b600080fd5b348015605857600080fd5b50605f60c5565b60408051918252519081900360200190f35b348015607c57600080fd5b50609c73ffffffffffffffffffffffffffffffffffffffff6004351660cb565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b60005481565b60016020526000908152604090205473ffffffffffffffffffffffffffffffffffffffff16815600a165627a7a7230582071a4dfe2201fceedd751412b21ec96c083afdb74126c595dac4ae7d03a194a210029"
};
module.exports = contract;