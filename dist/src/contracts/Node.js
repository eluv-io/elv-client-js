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
      "name": "label",
      "type": "string"
    }],
    "name": "log",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
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
  }],
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f4e6f646532303139303331353130353130304d4c00000000000000000000000060045560018054600160a060020a0319908116329081179092556002805490911690911790556103f38061007e6000396000f30060806040526004361061008d5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166302d05d3f811461008f57806341304fac146100c057806341c0e1b51461011957806354fd4d501461012e5780636d2e4b1b146101555780638da5cb5b14610176578063af570c041461018b578063f2fde38b146101a0575b005b34801561009b57600080fd5b506100a46101c1565b60408051600160a060020a039092168252519081900360200190f35b3480156100cc57600080fd5b506040805160206004803580820135601f810184900484028501840190955284845261008d9436949293602493928401919081908401838280828437509497506101d09650505050505050565b34801561012557600080fd5b5061008d61029a565b34801561013a57600080fd5b506101436102d6565b60408051918252519081900360200190f35b34801561016157600080fd5b5061008d600160a060020a03600435166102dc565b34801561018257600080fd5b506100a4610337565b34801561019757600080fd5b506100a4610346565b3480156101ac57600080fd5b5061008d600160a060020a0360043516610355565b600154600160a060020a031681565b600254600160a060020a03163214806101f35750600254600160a060020a031633145b15156101fe57600080fd5b7fcf34ef537ac33ee1ac626ca1587a0a7e8e51561e5514f8cb36afa1c5102b3bab816040518080602001828103825283818151815260200191508051906020019080838360005b8381101561025d578181015183820152602001610245565b50505050905090810190601f16801561028a5780820380516001836020036101000a031916815260200191505b509250505060405180910390a150565b600254600160a060020a03163214806102bd5750600254600160a060020a031633145b15156102c857600080fd5b600254600160a060020a0316ff5b60045481565b600154600160a060020a031632146102f357600080fd5b600160a060020a038116151561030857600080fd5b6001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b600254600160a060020a031681565b600354600160a060020a031681565b600254600160a060020a03163214806103785750600254600160a060020a031633145b151561038357600080fd5b600160a060020a038116151561039857600080fd5b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555600a165627a7a723058208a4aa8e4e08612c61fc5310cf0c518b171d02ca645f980b1bd61ad9e7746c4860029"
};
module.exports = contract;