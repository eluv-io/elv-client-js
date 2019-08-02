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
    "name": "kill",
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
    "name": "contentSpace",
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
      "name": "newOwner",
      "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
  }],
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c00000000000000000060005560018054600160a060020a0319908116329081179092556002805490911690911790556102c58061005a6000396000f3006080604052600436106100825763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166302d05d3f811461008457806341c0e1b5146100b557806354fd4d50146100ca5780636d2e4b1b146100f15780638da5cb5b14610112578063af570c0414610127578063f2fde38b1461013c575b005b34801561009057600080fd5b5061009961015d565b60408051600160a060020a039092168252519081900360200190f35b3480156100c157600080fd5b5061008261016c565b3480156100d657600080fd5b506100df6101a8565b60408051918252519081900360200190f35b3480156100fd57600080fd5b50610082600160a060020a03600435166101ae565b34801561011e57600080fd5b50610099610209565b34801561013357600080fd5b50610099610218565b34801561014857600080fd5b50610082600160a060020a0360043516610227565b600154600160a060020a031681565b600254600160a060020a031632148061018f5750600254600160a060020a031633145b151561019a57600080fd5b600254600160a060020a0316ff5b60005481565b600154600160a060020a031632146101c557600080fd5b600160a060020a03811615156101da57600080fd5b6001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b600254600160a060020a031681565b600354600160a060020a031681565b600254600160a060020a031632148061024a5750600254600160a060020a031633145b151561025557600080fd5b600160a060020a038116151561026a57600080fd5b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600a165627a7a7230582023e7c7f4b062e3e2891bacda4af48c706c6b2fe2d44eaec904554039b0c585df0029"
};
module.exports = contract;