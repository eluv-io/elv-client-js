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
    "constant": false,
    "inputs": [],
    "name": "accessRequest",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "anonymous": false,
    "inputs": [],
    "name": "AccessRequest",
    "type": "event"
  }],
  "bytecode": "60806040527f41636365737369626c6532303139303232323133353930304d4c00000000000060005534801561003457600080fd5b5060fa806100436000396000f30060806040526004361060485763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166354fd4d508114604d578063f1551887146071575b600080fd5b348015605857600080fd5b50605f6097565b60408051918252519081900360200190f35b348015607c57600080fd5b506083609d565b604080519115158252519081900360200190f35b60005481565b6040516000907fed78a9defa7412748c9513ba9cf680f57703a46dd7e0fb0b1e94063423c73e88908290a1506001905600a165627a7a72305820bec58e816050bb0f256a76993bcb5f7ad9daac448844d592b5c932571b97dd930029"
};
module.exports = contract;