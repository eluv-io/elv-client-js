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
    "constant": true,
    "inputs": [],
    "name": "licensingFee",
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
    "constant": true,
    "inputs": [],
    "name": "percentPartial",
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
      "name": "amount",
      "type": "uint256"
    }],
    "name": "withdraw",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
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
      "name": "status_code",
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
    "name": "STATUS_FINAL_REVIEW",
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
    "name": "partialPayment",
    "outputs": [{
      "name": "",
      "type": "uint8"
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
    "constant": false,
    "inputs": [{
      "name": "content_address",
      "type": "address"
    }, {
      "name": "new_owner",
      "type": "address"
    }],
    "name": "transferContentOwnership",
    "outputs": [{
      "name": "",
      "type": "address"
    }],
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
    "constant": true,
    "inputs": [],
    "name": "STATUS_DRAFT_APPROVED",
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
      "name": "licensing_fee",
      "type": "uint256"
    }],
    "name": "setLicensingFee",
    "outputs": [{
      "name": "",
      "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": true,
    "inputs": [{
      "name": "",
      "type": "address"
    }],
    "name": "licensingStatus",
    "outputs": [{
      "name": "percentComplete",
      "type": "uint8"
    }, {
      "name": "licensingFee",
      "type": "uint256"
    }, {
      "name": "licensingFeePaid",
      "type": "uint256"
    }, {
      "name": "valid",
      "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "partial_payment",
      "type": "uint8"
    }],
    "name": "setPartialPayment",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "constant": false,
    "inputs": [{
      "name": "percent_partial",
      "type": "uint8"
    }],
    "name": "setPercentPartial",
    "outputs": [{
      "name": "",
      "type": "uint8"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
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
    "constant": false,
    "inputs": [{
      "name": "content_address",
      "type": "address"
    }],
    "name": "reclaimContentOwnership",
    "outputs": [{
      "name": "",
      "type": "address"
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
    "constant": false,
    "inputs": [{
      "name": "content_contract",
      "type": "address"
    }, {
      "name": "approved",
      "type": "bool"
    }, {
      "name": "percent_complete",
      "type": "uint8"
    }, {
      "name": "note",
      "type": "string"
    }],
    "name": "reviewContent",
    "outputs": [{
      "name": "",
      "type": "bool"
    }],
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
      "name": "payee",
      "type": "address"
    }, {
      "indexed": false,
      "name": "content",
      "type": "address"
    }, {
      "indexed": false,
      "name": "amount",
      "type": "uint256"
    }],
    "name": "PayCredit",
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
  "bytecode": "60806040527f4f776e61626c6532303139303532383139333830304d4c0000000000000000006000557f436f6e74656e7432303139303531303135313630304d4c0000000000000000006004557f53706c436f6e744c6963656e73696e6732303139303331383130353730304d4c600555678ac7230489e800006006556007805461280061ff001960ff19909216603c179190911617905560018054600160a060020a03199081163290811790925560028054909116909117905561151e806100c96000396000f3006080604052600436106101715763ffffffff60e060020a60003504166302d05d3f81146101735780630779564b146101a45780630f82c16f146101cb578063123e0e8014610290578063176859531461031d5780632d4fac771461032b5780632e1a7d4d146103565780633513a8051461038257806341c0e1b51461038d57806345080442146103a25780634d52fe4b146103ba57806354fd4d50146103cf5780636af27417146103e45780636d2e4b1b146103f95780637b1cdb3e1461041a5780638da5cb5b146104225780638e7f900f146104375780639e99bbea1461044c578063a2e1cf8a14610454578063af570c041461047b578063b261b9e714610490578063b535b03e146104a5578063b6524089146104ba578063ba3c32ea146104d2578063cba43b0d1461051f578063db14178d1461053a578063e870ed9114610555578063e97a08ba14610565578063f185db0c14610579578063f2fde38b1461058e578063f96e91df146105af575b005b34801561017f57600080fd5b50610188610620565b60408051600160a060020a039092168252519081900360200190f35b3480156101b057600080fd5b506101b961062f565b60408051918252519081900360200190f35b3480156101d757600080fd5b5060408051602060046024803582810135848102808701860190975280865261026196843560ff1696369660449591949091019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506106359650505050505050565b6040805160ff958616815293851660208501529190931682820152606082019290925290519081900360800190f35b60408051602060046044358181013583810280860185019096528085526101b9958335956024803560ff1696369695606495939492019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a9989019892975090820195509350839250850190849080828437509497506106449650505050505050565b6101b960043560243561064e565b34801561033757600080fd5b50610340610656565b6040805160ff9092168252519081900360200190f35b34801561036257600080fd5b5061036e60043561065f565b604080519115158252519081900360200190f35b6101b960043561071c565b34801561039957600080fd5b50610171610b9f565b3480156103ae57600080fd5b506101b9600435610bdb565b3480156103c657600080fd5b506101b9610c47565b3480156103db57600080fd5b506101b9610c6b565b3480156103f057600080fd5b50610340610c71565b34801561040557600080fd5b50610171600160a060020a0360043516610c76565b6101b9610cd1565b34801561042e57600080fd5b50610188610d4a565b34801561044357600080fd5b50610340610d59565b6101b9610d67565b34801561046057600080fd5b50610188600160a060020a0360043581169060243516610eb3565b34801561048757600080fd5b50610188610f6b565b34801561049c57600080fd5b506101b9610f7a565b3480156104b157600080fd5b50610340610f9e565b3480156104c657600080fd5b506101b9600435610fa3565b3480156104de57600080fd5b506104f3600160a060020a0360043516610fdd565b6040805160ff909516855260208501939093528383019190915215156060830152519081900360800190f35b34801561052b57600080fd5b5061034060ff60043516611009565b34801561054657600080fd5b5061034060ff6004351661105c565b6101b9600435602435151561064e565b610188600160a060020a03600435166110a4565b34801561058557600080fd5b5061034061129b565b34801561059a57600080fd5b50610171600160a060020a03600435166112a0565b3480156105bb57600080fd5b50604080516020601f60643560048181013592830184900484028501840190955281845261036e94600160a060020a03813516946024803515159560ff6044351695369560849493019181908401838280828437509497506113129650505050505050565b600154600160a060020a031681565b60065481565b60076000808093509350935093565b6000949350505050565b600092915050565b60075460ff1681565b600254600090600160a060020a03163214806106855750600254600160a060020a031633145b151561069057600080fd5b600254604051600160a060020a039091169083156108fc029084906000818181858888f193505050501580156106ca573d6000803e3d6000fd5b5060025460408051600160a060020a03909216825260006020830152818101849052517f6fad978e8a2a7d154cdbeac8b127068f0cb03d8f2d585fe8087161308cc3dd1d9181900360600190a1919050565b3360008181526008602090815260408083208054600282015460019092015483517f27c1c21d0000000000000000000000000000000000000000000000000000000081529351959695869560ff90931694899489949303928492839283928a926327c1c21d92600480820193929182900301818787803b15801561079f57600080fd5b505af11580156107b3573d6000803e3d6000fd5b505050506040513d60208110156107c957600080fd5b50511280156107d8575060008a135b156108005760075460ff908116908716106107f657600394506107fb565b600194505b61088c565b8560ff166064141561081b578915156107fb5782935061088c565b60075460ff90811690871610610886578915156107fb57600160a060020a03881660009081526008602052604090206002810154600754600190920154909160649161010090910460ff160204039150828211610878578161087a565b825b9350600219945061088c565b60001994505b60008411156109aa57828411156108a257600080fd5b86600160a060020a03166302d05d3f6040518163ffffffff1660e060020a028152600401602060405180830381600087803b1580156108e057600080fd5b505af11580156108f4573d6000803e3d6000fd5b505050506040513d602081101561090a57600080fd5b5051600160a060020a03808a16600090815260086020526040808220600201805489019055519293509083169186156108fc0291879190818181858888f1935050505015801561095e573d6000803e3d6000fd5b5060408051600160a060020a0380841682528a16602082015280820186905290517f6fad978e8a2a7d154cdbeac8b127068f0cb03d8f2d585fe8087161308cc3dd1d9181900360600190a15b604080518b81526020810187905281517fb6c1c013bb5004fe8e943c6890e300ccedf9bd73dcd4eb291b31b9f96874feff929181900390910190a1841515610a2c57600160a060020a0388166000908152600860205260408120805460ff19908116825560018201839055600282019290925560030180549091169055610b91565b6000851215610b0f5786600160a060020a031663f2fde38b88600160a060020a03166302d05d3f6040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015610a8257600080fd5b505af1158015610a96573d6000803e3d6000fd5b505050506040513d6020811015610aac57600080fd5b50516040805160e060020a63ffffffff8516028152600160a060020a03909216600483015251602480830192600092919082900301818387803b158015610af257600080fd5b505af1158015610b06573d6000803e3d6000fd5b50505050610b91565b6000851315610b9157604080517ff2fde38b0000000000000000000000000000000000000000000000000000000081523060048201529051600160a060020a0389169163f2fde38b91602480830192600092919082900301818387803b158015610b7857600080fd5b505af1158015610b8c573d6000803e3d6000fd5b505050505b509298975050505050505050565b600254600160a060020a0316321480610bc25750600254600160a060020a031633145b1515610bcd57600080fd5b600254600160a060020a0316ff5b6000816002191415610c0e57507f447261667420617070726f766564000000000000000000000000000000000000610c42565b8160031415610c3e57507f46696e616c20696e207265766965770000000000000000000000000000000000610c42565b5060005b919050565b7f46696e616c20696e20726576696577000000000000000000000000000000000081565b60055481565b600281565b600154600160a060020a03163214610c8d57600080fd5b600160a060020a0381161515610ca257600080fd5b6001805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b6000610cdb6114cb565b5060408051608081018252600080825260065460208084019182528385018381526001606086018181523386526008909352959093209351845460ff9190911660ff19918216178555915194840194909455905160028301559151600390910180549115159190921617905590565b600254600160a060020a031681565b600754610100900460ff1681565b33600081815260086020526040812060030154909190829060ff161515610d915760009250610eae565b81905030600160a060020a031681600160a060020a0316638da5cb5b6040518163ffffffff1660e060020a028152600401602060405180830381600087803b158015610ddc57600080fd5b505af1158015610df0573d6000803e3d6000fd5b505050506040513d6020811015610e0657600080fd5b5051600160a060020a03161415610e4957600160a060020a0382166000908152600860205260409020600281015460019091015414610e4457600080fd5b610e6f565b600160a060020a03821660009081526008602052604090206002015415610e6f57600080fd5b600160a060020a0382166000908152600860205260408120805460ff199081168255600182018390556002820183905560039091018054909116905592505b505090565b6002546000908190600160a060020a0316321480610edb5750600254600160a060020a031633145b1515610ee657600080fd5b50604080517ff2fde38b000000000000000000000000000000000000000000000000000000008152600160a060020a0384811660048301529151859283169163f2fde38b91602480830192600092919082900301818387803b158015610f4b57600080fd5b505af1158015610f5f573d6000803e3d6000fd5b50949695505050505050565b600354600160a060020a031681565b7f447261667420617070726f76656400000000000000000000000000000000000081565b600181565b600254600090600160a060020a0316321480610fc95750600254600160a060020a031633145b1515610fd457600080fd5b60069190915590565b600860205260009081526040902080546001820154600283015460039093015460ff9283169391921684565b600254600090600160a060020a031632148061102f5750600254600160a060020a031633145b151561103a57600080fd5b506007805461ff00191661010060ff9384168102919091179182905590041690565b600254600090600160a060020a03163214806110825750600254600160a060020a031633145b151561108d57600080fd5b506007805460ff191660ff92831617908190551690565b600160a060020a038116600090815260086020526040812060030154819060ff1615156110d057600080fd5b82905080600160a060020a03166302d05d3f6040518163ffffffff1660e060020a028152600401602060405180830381600087803b15801561111157600080fd5b505af1158015611125573d6000803e3d6000fd5b505050506040513d602081101561113b57600080fd5b5051600160a060020a0316321461115157600080fd5b600160a060020a03831660009081526008602052604090206002015434101561117957600080fd5b600160a060020a03808416600090815260086020908152604080832060020183905580517f8280dd8f0000000000000000000000000000000000000000000000000000000081526000196004820152905193851693638280dd8f93602480840194938390030190829087803b1580156111f157600080fd5b505af1158015611205573d6000803e3d6000fd5b505050506040513d602081101561121b57600080fd5b5050604080517ff2fde38b0000000000000000000000000000000000000000000000000000000081523260048201529051600160a060020a0383169163f2fde38b91602480830192600092919082900301818387803b15801561127d57600080fd5b505af1158015611291573d6000803e3d6000fd5b5050505050919050565b600481565b600254600160a060020a03163214806112c35750600254600160a060020a031633145b15156112ce57600080fd5b600160a060020a03811615156112e357600080fd5b6002805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b600160a060020a0384166000818152600860209081526040808320805460ff191660ff881617905580517fb816f5130000000000000000000000000000000000000000000000000000000081529051929388938593849363b816f513926004808301939282900301818787803b15801561138b57600080fd5b505af115801561139f573d6000803e3d6000fd5b505050506040513d60208110156113b557600080fd5b50516040517f87e86b2c000000000000000000000000000000000000000000000000000000008152600160a060020a038a8116600483019081528a15156024840152606060448401908152895160648501528951949650918616936387e86b2c938d938d938c93909260840190602085019080838360005b8381101561144557818101518382015260200161142d565b50505050905090810190601f1680156114725780820380516001836020036101000a031916815260200191505b50945050505050602060405180830381600087803b15801561149357600080fd5b505af11580156114a7573d6000803e3d6000fd5b505050506040513d60208110156114bd57600080fd5b505198975050505050505050565b604080516080810182526000808252602082018190529181018290526060810191909152905600a165627a7a72305820d68389d12ace1e63a2015197f2e7fa6e72ff82ffe9eaeaa74225b0ba03aa63c90029"
};
module.exports = contract;