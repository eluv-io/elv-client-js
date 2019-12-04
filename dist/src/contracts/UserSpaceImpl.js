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
  }, {
    "constant": true,
    "inputs": [{
      "name": "_userAddr",
      "type": "address"
    }],
    "name": "getUserWallet",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }],
  "bytecode": "60806040527f55736572537061636532303139303530363135353330304d4c0000000000000060005534801561003457600080fd5b5061018c806100446000396000f3006080604052600436106100565763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166354fd4d50811461005b57806363e6ffdd146100825780639ad54793146100d9575b600080fd5b34801561006757600080fd5b50610070610107565b60408051918252519081900360200190f35b34801561008e57600080fd5b506100b073ffffffffffffffffffffffffffffffffffffffff6004351661010d565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b3480156100e557600080fd5b506100b073ffffffffffffffffffffffffffffffffffffffff60043516610135565b60005481565b60016020526000908152604090205473ffffffffffffffffffffffffffffffffffffffff1681565b73ffffffffffffffffffffffffffffffffffffffff90811660009081526001602052604090205416905600a165627a7a72305820cdba371be72ba46167a23768ded50b6af9f9d94830706b70646eb41ecd3f390b0029"
};
module.exports = contract;