var contract = {
  "abi": [{
    "constant": true,
    "inputs": [],
    "name": "parentAddress",
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
    "inputs": [],
    "name": "canConfirm",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "countVersionHashes",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "commitPending",
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
    "name": "kill",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [],
    "name": "confirmCommit",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": true,
    "stateMutability": "payable",
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
    "inputs": [],
    "name": "clearPending",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "pendingHash",
    "outputs": [{
      "name": "",
      "type": "string"
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
    "name": "canCommit",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "versionTimestamp",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "uint256"
    }],
    "name": "versionHashes",
    "outputs": [{
      "name": "",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
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
    "inputs": [{
      "name": "_objectHash",
      "type": "string"
    }],
    "name": "commit",
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
    "constant": false,
    "inputs": [],
    "name": "updateRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [],
    "name": "objectHash",
    "outputs": [{
      "name": "",
      "type": "string"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "_versionHash",
      "type": "string"
    }],
    "name": "deleteVersion",
    "outputs": [{
      "name": "",
      "type": "int256"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
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
      "name": "spaceAddress",
      "type": "address"
    }, {
      "indexed": false,
      "name": "parentAddress",
      "type": "address"
    }, {
      "indexed": false,
      "name": "objectHash",
      "type": "string"
    }],
    "name": "CommitPending",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "objectHash",
      "type": "string"
    }],
    "name": "UpdateRequest",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "spaceAddress",
      "type": "address"
    }, {
      "indexed": false,
      "name": "objectHash",
      "type": "string"
    }],
    "name": "VersionConfirm",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "name": "spaceAddress",
      "type": "address"
    }, {
      "indexed": false,
      "name": "versionHash",
      "type": "string"
    }, {
      "indexed": false,
      "name": "index",
      "type": "int256"
    }],
    "name": "VersionDelete",
    "type": "event"
  }]
};
module.exports = contract;