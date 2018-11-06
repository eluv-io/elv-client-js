# Eluvio JS Client

### Installation 

#### Install using NPM: 

```npm install --save https://github.com/qluvio/elv-client-js```

##### Browser:

```const { ElvClient } = require("elv-client-js");```

##### Node: 

```const { ElvClient } = require("elv-client-js/ElvClient-node-min.js");```

#### Install manually: 

##### Browser: 

include ```./ElvClient-min.js```

##### Node: 

include ```./ElvClient-node-min.js```


See: 
- ```./test/TestMethods.js``` for example usage of most functionality
- ```./test/ExampleOutput.txt``` for example output from these examples
- ```./test/Test.html``` for example usage in browser
- ```./test/Test.js``` for example usage in node

### API Client

See ```./src/ElvClient.js``` for all available endpoints.

#### Initializing the client

```javascript
let client = new ElvClient({
  contentSpaceId: "ispc6NxBDhWiRuKyDNMWVmpTuCaQssS2iuDfq8hFkivVoeJw",
  hostname: "localhost",
  port: 8008,
  useHTTPS: false,
  ethHostname: "localhost",
  port: 8545,
  useHTTPS: false
});
```

All method arguments are **named hashes** for clarity. 

For example:

```javascript
client.DownloadPart({
  libraryId: "ilibWL9CAVcQYZPHB58SDRMkwQ", 
  contentHash: "hq__QmdSKNUk4pabuUTAXo4F2dAkzkioeagy4r1fuAcBHL2k7X", 
  partHash: "hqp_QmU3QKSgShnQQSnKdmEMDgo4AimNHg3JHy4SY7DymVy5WN",
  format: "blob"
})
```

#### Endpoints without blockchain interaction:

The API client will query the fabric endpoint and return the parsed JSON for JSON based endpoints.

For non-JSON endpoints, such as downloading a file, the format can be specified. By default, it will be parsed as 
a blob. See ```ElvClient#ResponseToFormat``` for available formats. If the specified format is explicitly undefined
or otherwise does not match any formats, the raw [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
will be returned.

All query methods are async methods that will return [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).


Examples:

```javascript
let client = new ElvClient({
  contentSpaceId: "ispc6NxBDhWiRuKyDNMWVmpTuCaQssS2iuDfq8hFkivVoeJw",
  hostname: "localhost",
  port: 8008,
  useHTTPS: false,
  ethHostname: "localhost",
  port: 8545,
  useHTTPS: false
});

// Using .then
let query = client.ContentLibraries();
query.then(contentLibraries => console.log(contentLibraries));


// Using async/await
let response = await client.ContentLibraries();
console.log(json);


/* Result:

[ 'ilib181m5UqiibeHCkvydb5zvs',
  'ilib2nhndXbwNsZpSW4vGKZtUL',
  'ilib6M65FWP5VURJAgg5UgH49F',
  'ilib7HDyiWuH2qecS8aAciv7n4',
  'ilibBSZ8isuvUfsejLwfHAqY5',
  'ilibCAB6N2uAokYSCsDdx4D1ho',
  'ilibEWFJtGT2J2qJ2U8one7rqL',
  'ilibGHb9b8yxAeG1ZgGF9GZNj8',
  'ilibGuftC7MRHF4HWwe7SpN9U3',
  'ilibHR9n78xEztxzZuCrr6zcAg',
  'ilibMKsosn5FoZNsY42S6JkbFm',
  'ilibMjtps7qHeaLtyZ5RL9msU2',
  'ilibQWUSXUaZdj4gUG3PU96F9U',
  'ilibS3AiQca535GpdN8wR1guTR',
  'ilibUJqT5tEgi8NtdFedaUxcQL',
  'ilibUZNhCvvaFF9c2m2o2pjfqN',
  'ilibWL9CAVcQYZPHB58SDRMkwQ' ]
 */
```

Non-JSON data will be returned as a blob by default, but other formats can be specified (as well as returning 
the raw [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response))
```javascript
// Using .then
let query = client.QParts({
  partHash: "hqp_QmWuCKNpTeVp2mUP1sQwaJLVVTWvepxCqWks3Mrt2UZCRQ",
  format: "arraybuffer"
});

query.then(arrayBuffer => console.log(Buffer.from(arrayBuffer)));


// Using async/await
let response = await client.QParts({
  partHash: "hqp_QmWuCKNpTeVp2mUP1sQwaJLVVTWvepxCqWks3Mrt2UZCRQ",
  format: "arrayBuffer"
});
console.log(buffer);


// Result
// <Buffer 06 2f 63 62 6f 72 0a a2 67 51 6d 64 48 61 73 68 58 23 02 12 20 7f ee 10 b7 b4 9c 71 38 59 81 83 cc ed 06 d7 09 60 07 a7 0d ed 2d 55 56 0e 9c 7b 79 ca ... >
```
#### Create Content Library, Create Object Draft, Upload to Object and Finalize Parts ####
   
    // from eluv-io/test/TestMethods.js
    output += "CREATING LIBRARY \n";
    let libraryId = await (
      client.CreateContentLibrary({
        libraryName: "New library",
        libraryDescription: "Library Description",
        signer
      })
    );

    output += "LIBRARY CREATED: " + libraryId + "\n\n";
    let libraryResponse = await(
      client.ContentLibrary({libraryId})
    );
    output += JSON.stringify(libraryResponse, null, 2) + "\n\n";

    output += "CREATING OBJECT... \n";

    let createResponse = await (
      client.CreateContentObject({
        libraryId,
        options: {
          meta: {
            "meta": "data",
            "to_delete": {
              "value": "value"
            },
            "subtree": {
              "to_delete": "value"
            }
          }
        }
      })
    );

    let objectId = createResponse.id;

    output += "CREATED " + objectId + "\n\n";

    output += "CREATING PART...\n";

    let partResponse = await (
      client.UploadPart({
        libraryId,
        writeToken: createResponse.write_token,
        data: "some form of data"
      })
    );

    let partHash = partResponse.part.hash;

    output += "CREATED " + partHash + "\n\n";

    output += "FINALIZING OBJECT... \n";

    await (
      client.FinalizeContentObject({
        libraryId,
        writeToken: createResponse.write_token
      })
    );



### Blockchain Interaction

#### Wallets and signers

Actions involving blockchain transactions will require a *signer*. This is an instance of 
an [ethers.js](https://github.com/ethers-io/ethers.js/) wallet. ElvClient has a utility class
```ElvWallet``` to make handling this easier.

After creating the ElvClient instance, you can generate an ```ElvWallet``` for the client using
```client.GenerateWallet()```. This class provides simple methods to generate signers from various
information, as well as store and retrieve signers by name. 

Note: you do not need to use the account 
management functionality of the wallet, you can simply use the wallet to generate signer objects as 
needed.

#### Generating the wallet and adding accounts:

```javascript
let wallet = client.GenerateWallet();

// With decrypted private key (synchronous): 
let signer = wallet.AddAccount({
  accountName: "Alice",
  privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
});

// With encrypted private key (asynchronous):
let signer = await wallet.AddAccountFromEncryptedPK({
  accountName: "Bob",
  encryptedPrivateKey: {"address":"71b011b67dc8f5c323a34cd14b952721d5750c93","crypto":{"cipher":"aes-128-ctr","ciphertext":"768c0b26476793e52c7e292b6b221fa4d7f82a7d20a7ccc042ce43c072f97f38","cipherparams":{"iv":"049e2bed69573f62da6576c21769b520"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"332b0f7730c580aa86b3ec8e79d228e9f76426bb328c468cb57e99e39132c29f"},"mac":"36079b7f32edf1c3d8d1697313f8088c78be07627ffb6421f655409373fded79"},"id":"8181d812-ab5e-4e5b-b023-e9049c2aec48","version":3},
  password: "test"
});

// Using mnemonics
let mnemonic = wallet.GenerateMnemonic();
// -> coin valve van maximum manual glow nurse puppy wish put sound session

let signer = wallet.AddAccountFromMnemonic({
  accountName: "Carol",
  mnemonic: mnemonic
});
```

#### Retrieving and using accounts

```javascript
let signer = wallet.GetAccount({accountName: "Alice"});

client.CreateContentLibrary({
  libraryName: "New Library",
  signer
})

```

#### Account utilities

##### Getting account balance

```javascript
const balance = wallet.GetAccountBalance({accountName: "Alice"});

89.787462796
```

##### Generating encrypted private key (keystore format)
```javascript
const encryptedPrivateKey = wallet.GetEncryptedPrivateKey({accountName: "Alice", password: "test"});

"{\"address\":\"93cc134901c40f6164ab357f4f18bbf4aa058477\",\"id\":\"dc5b06ca-f284-4a47-875a-176d857f6d9d\",\"version\":3,\"Crypto\":{\"cipher\":\"aes-128-ctr\",\"cipherparams\":{\"iv\":\"ca349dad2df26ed5786b987fd54e195d\"},\"ciphertext\":\"c4e1d0e1bf21cb8e2c4c732040245ea65f22cd4af0666dc79da1b3fbe23c6a27\",\"kdf\":\"scrypt\",\"kdfparams\":{\"salt\":\"27695860062f440d91d1863c37349a28518ed98799d0d96b8f9a39c9e23b953a\",\"n\":131072,\"dklen\":32,\"p\":1,\"r\":8},\"mac\":\"2b0fe21ba893c40ab193694ef2f86c7982138fc17b19148b25f65bfccdbb4fbd\"}}"
```

Note: This method is equivalent to ```signer.encrypt(password)``` - if you already have the signer object,
calling encrypt directly may be easier.

### Deploying custom contracts

The ElvClient can be used to deploy custom contracts, provided the ABI and bytecode of the contract.

To deploy a contract, simply pass the ABI, bytecode, any constructor arguments, and the signer.

```javascript
return await client.DeployContract({
  abi,
  bytecode,
  constructorArgs,
  signer
});
```

Calling a method on a deployed contract is similarly simple:

```javascript
return await client.CallContractMethod({
  contractAddress,
  abi,
  methodName: "setLibraryHash",
  methodArgs,
  signer
});
```

The arguments to both the constructor and any methods are provided as an ordered array. Some arguments have special 
required formats - Bytes32 strings, for example. The FormatContractArguments helper can perform this formatting
automatically by referencing the ABI.

For example, the ContentLibrary contract constructor requires 3 arguments - a string, a bytes32 string, and an address.
The FormatContractArguments method will automatically perform the bytes32 string transformation on the second argument. 

```javascript
const constructorArgs = client.FormatContractArguments({
  abi,
  methodName: "constructor",
  args: [
    "New Library",
    "Content Space",
    "0x0000000000000000000000000000000000000000"
  ]
});

/* Result

[ 'New library',
  '0x436f6e74656e7420537061636500000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000000' ]
 
*/
```

### Other blockchain interaction

The signer object, as described above, is an instance of an [ethers.js](https://github.com/ethers-io/ethers.js/)
wallet that is connected to the client's specified blockchain (provider). It can be used independently of the ElvClient 
to do anything outlined in the [documentation](https://docs.ethers.io/ethers.js/html/api-wallet.html) - namely, 
signing transactions.

This wallet can be used in conjunction with the ethers.js library, or even another ethereum library like web3
(by extracting the private key), to deploy contracts, sign transactions and perform other functions not explicitly
supported in the ElvClient.

Refer to src/EthClient.js to see how ElvClient uses ethers.js to interact with the blockchain.

### Error handling
 
Error checking is performed by the client for all queries. If an error occurs or if the response 
is ```!.ok``` (response code not in 200 range), an error of the following format will be thrown:

```json
{ 
  "status": 500,
  "statusText": "request to http://localhost:8008/qlibs failed, reason: connect ECONNREFUSED 127.0.0.1:8008",
  "url": "http://localhost:8008/qlibs" 
} 
```

These should be caught and handled using .catch or try/catch blocks

```javascript
// Using .catch
 client.ContentLibraries()
   .then(libraryIds => console.log(libraryIds))
   .catch(error => console.log(error.statusText));

// Using async/await
try {
  let libraryIds = await client.ContentLibraries();
  console.log(libraryIds);
} catch(error) {
  console.log(error.statusText);
}
```



See ```./test/TestMethods.js``` for full working examples.




### Content Object Verification

```javascript
let client = new ElvClient({
  contentSpaceId: "ispc6NxBDhWiRuKyDNMWVmpTuCaQssS2iuDfq8hFkivVoeJw",
  hostname: "localhost",
  port: 8008,
  useHTTPS: false,
  ethHostname: "localhost",
  port: 8545,
  useHTTPS: false
});


// Using promise:
client.VerifyContentObject({
  partHash: "hq__QmWapFBE3sZ8z7cipsrHtE97VjtJ6rfiCVvWkC7mgYfLVb",
  libraryId: "ilibWL9CAVcQYZPHB58SDRMkwQ"
}).then(result => { console.log(result); });


// Using async / await
let result = await client.VerifyContentObject({
  partHash: "hq__QmWapFBE3sZ8z7cipsrHtE97VjtJ6rfiCVvWkC7mgYfLVb",
  libraryId: "ilibWL9CAVcQYZPHB58SDRMkwQ"
});
console.log(result);

/* Result:

{
  "hash": "hq__QmWapFBE3sZ8z7cipsrHtE97VjtJ6rfiCVvWkC7mgYfLVb",
  "qref": {
    "valid": true,
    "hash": "hqp_QmWapFBE3sZ8z7cipsrHtE97VjtJ6rfiCVvWkC7mgYfLVb"
  },
  "qmd": {
    "valid": true,
    "hash": "hqp_QmdWDY2CaCYXLxz4ZFtiqUBTsp6eBDN7B7UnTCheHYMVpA",
    "check": {
      "valid": true,
      "invalidValues": []
    }
  },
  "qstruct": {
    "valid": true,
    "hash": "hqp_QmUiLv4D22kNTMnLcUPRcofv1VmcEHf6wEnwyGVbpMoZzQ",
    "parts": [
      {
        "hash": "hqp_QmSYmLooWwynAzeJ54Gn1dMBnXnQTj6FMSSs3tLusCQFFB",
        "proofs": {
          "rootHash": "ee088e8d93a295066aeb0ef9bc39b126a88a90c553ad3391924d015714ccbaa8",
          "chunkSize": 49,
          "chunkNum": 49,
          "chunkLen": 49,
          "finalized": 116
        },
        "size": 17
      }
    ]
  },
  "valid": true
}
*/

// Library ID is optional
// If provided, up to 5 metadata fields will be checked against the /meta endpoint
// If not provided, additional metadata check will not be performed
let result = await client.VerifyContentObject({
  partHash: "hq__QmWapFBE3sZ8z7cipsrHtE97VjtJ6rfiCVvWkC7mgYfLVb"
})
console.log(result);

/*
Result:

{
  "hash": "hq__QmWapFBE3sZ8z7cipsrHtE97VjtJ6rfiCVvWkC7mgYfLVb",
  "qref": {
    "valid": true,
    "hash": "hqp_QmWapFBE3sZ8z7cipsrHtE97VjtJ6rfiCVvWkC7mgYfLVb"
  },
  "qmd": {
    "valid": true,
    "hash": "hqp_QmdWDY2CaCYXLxz4ZFtiqUBTsp6eBDN7B7UnTCheHYMVpA"
  },
  "qstruct": {
    "valid": true,
    "hash": "hqp_QmUiLv4D22kNTMnLcUPRcofv1VmcEHf6wEnwyGVbpMoZzQ",
    "parts": [
      {
        "hash": "hqp_QmSYmLooWwynAzeJ54Gn1dMBnXnQTj6FMSSs3tLusCQFFB",
        "proofs": {
          "rootHash": "ee088e8d93a295066aeb0ef9bc39b126a88a90c553ad3391924d015714ccbaa8",
          "chunkSize": 49,
          "chunkNum": 49,
          "chunkLen": 49,
          "finalized": 116
        },
        "size": 17
      }
    ]
  },
  "valid": true
}
*/


// Both "hqp_" and "hq__" format are acceptable
let result = await client.VerifyContentObject({
  partHash: "hq__QmWuCKNpTeVp2mUP1sQwaJLVVTWvepxCqWks3Mrt2UZCRQ"
})
console.log(result);


// Example error result:
/*
{
  "valid": false,
  "part": {
    "valid": true
  },
  "metadata": {
    "valid": true,
    "check": {
      "valid": false,
      "invalidValues": [
        {
          "key": "eluv.version",
          "cborValue": "2asd",
          "metadataValue": "2"
        },
        {
          "key": "eluv.contract_address",
          "cborValue": "0xc6629e8fad87eb91f6faedcbd7802fc71f5be99dasd",
          "metadataValue": "0xc6629e8fad87eb91f6faedcbd7802fc71f5be99d"
        },
        {
          "key": "eluv.access.type",
          "cborValue": "freeasd",
          "metadataValue": "free"
        },
        {
          "key": "name",
          "cborValue": "best contentasd",
          "metadataValue": "best content"
        },
        {
          "key": "image",
          "cborValue": "hqp_QmU3QKSgShnQQSnKdmEMDgo4AimNHg3JHy4SY7DymVy5WNasd",
          "metadataValue": "hqp_QmU3QKSgShnQQSnKdmEMDgo4AimNHg3JHy4SY7DymVy5WN"
        }
      ]
    }
  },
  "struct": {
    "valid": false,
    "error": "Invalid typed array length: 8445309507702284000"
  }
}
*/
```

### IFrame Client

The API client can be used transparently by an disprivileged IFrame using the FrameClient (./ElvFrameClient-min.js).

See ./test/frames/Parent.html and ./test/frames/Child.html for example usage

NOTE: Raw response objects cannot be passed in message. When using non-json endpoints (e.g. DownloadPart),
you must specify a valid type in the format field or accept the default blob format. The available formats 
correspond to Response methods (.json(), .blob(), .text(), etc.)
