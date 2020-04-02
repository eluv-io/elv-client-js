var contract = {
  "abi": [{
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
  }]
};
module.exports = contract;