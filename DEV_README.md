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

From a configuration file:

```json
// TestConfiguration.json:
{
  "fabric": {
    "contentSpaceId": "ispc33dJvdsPi3Njj6D6VkDJus2HG9JD",
    "hostname": "localhost",
    "port": 8008,
    "use_https": false
  },
  "ethereum": {
    "hostname": "localhost",
    "port": 8545,
    "use_https": false
  }
}
```

```javascript
const ClientConfiguration = require("TestConfiguration.json");
let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
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

#### Using the client:

The API client will query the fabric endpoint and return the parsed JSON for JSON based endpoints.

For non-JSON endpoints, such as downloading a file, the format can be specified. By default, it will be parsed as a blob. See ```ElvClient#ResponseToFormat``` for available formats. If the specified format is explicitly undefined or otherwise does not match any formats, the raw [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) will be returned.

All query methods are async methods that will return [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).


Examples:

```javascript
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

Non-JSON data like files and parts will be returned as a blob by default, but other formats can be specified (as well as returning the raw [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response))
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

### Blockchain Interaction

### Authorization

Being a decentralized, trustless ecosystem, the content fabric relies on smart contracts and blockchain transactions to verify that a user is allowed to perform an action. Each type of content (content spaces, libraries, objects, types) have associated smart contracts deployed to the blockchain that mediate access.

For example, to access a content object, the requestor must call the accessRequest method on that content object's smart contract, then pass the transaction hash in the authorization token when querying the content fabric API. The content fabric will then verify the transaction before performing the requested action. If the transaction is invalid, access will be denied.

The ElvClient handles all of this automatically. When a method is called, it will create the appropriate transaction and send the correct authorization token with the request.

The contract address of content can be determined by its ID, because the IDs of content in the fabric are multiformat hashes. This means that no additional information is needed to locate the appropriate contract when accessing content.

For example, the library with ID ```ilibVdci1v3nUgXdMxMznXny5NfaPRN``` has its contract located at the blockchain address ```0x236ee22acab8810f75b726079a0b3d3afd505645```. 

#### Wallets and signers

To perform the necessary blockchain interactions, the client requires a *signer*. This is an instance of an [ethers.js](https://github.com/ethers-io/ethers.js/) wallet. ElvClient has a utility class ```ElvWallet``` to make handling this easier.

After creating the ElvClient instance, you can generate an ```ElvWallet``` for the client using ```client.GenerateWallet()```. This class provides simple methods to generate signers from various information, as well as storing and retrieving signers by name. 

Note: you do not need to use the account management functionality of the wallet, you can simply use the wallet to generate signer objects as needed. Omitting the name parameter when calling any of the AddAccount is valid - the signer will only be returned and not stored.

#### Generating the wallet and adding accounts:

```javascript
const wallet = client.GenerateWallet();

// With decrypted private key (synchronous): 
const signer = wallet.AddAccount({
  accountName: "Alice",
  privateKey: "0xbf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6"
});

// With encrypted private key (asynchronous):
const signer = await wallet.AddAccountFromEncryptedPK({
  accountName: "Bob",
  encryptedPrivateKey: {"address":"71b011b67dc8f5c323a34cd14b952721d5750c93","crypto":{"cipher":"aes-128-ctr","ciphertext":"768c0b26476793e52c7e292b6b221fa4d7f82a7d20a7ccc042ce43c072f97f38","cipherparams":{"iv":"049e2bed69573f62da6576c21769b520"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"332b0f7730c580aa86b3ec8e79d228e9f76426bb328c468cb57e99e39132c29f"},"mac":"36079b7f32edf1c3d8d1697313f8088c78be07627ffb6421f655409373fded79"},"id":"8181d812-ab5e-4e5b-b023-e9049c2aec48","version":3},
  password: "test"
});

// Using mnemonics (synchronous)
const mnemonic = wallet.GenerateMnemonic();
// -> coin valve van maximum manual glow nurse puppy wish put sound session

const signer = wallet.AddAccountFromMnemonic({
  accountName: "Carol",
  mnemonic: mnemonic
});

// It is valid to omit the accountName parameter
const signer = wallet.AddAccount({
  privateKey: "0xbf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6"
});
```

#### Setting the client's signer

After obtaining the signer through whatever means, you must set the signer for the client to use.

All blockchain transactions performed by ElvClient will use the signer set by the ```SetSigner``` method. An exception will be thrown if the signer is not set.

```javascript
const signer = wallet.GetAccount({accountName: "Alice"});
client.SetSigner({signer});

client.CreateContentLibrary({
  libraryName: "New Library"
})
```

#### Account utilities

##### Getting account balance

```javascript
const balance = wallet.GetAccountBalance({accountName: "Alice"});

89.787462796
```

##### Generating signer's encrypted private key (keystore format)
```javascript
const encryptedPrivateKey = await wallet.GenerateEncryptedPrivateKey({accountName: "Alice", password: "test"});

"{\"address\":\"93cc134901c40f6164ab357f4f18bbf4aa058477\",\"id\":\"dc5b06ca-f284-4a47-875a-176d857f6d9d\",\"version\":3,\"ElvCrypto\":{\"cipher\":\"aes-128-ctr\",\"cipherparams\":{\"iv\":\"ca349dad2df26ed5786b987fd54e195d\"},\"ciphertext\":\"c4e1d0e1bf21cb8e2c4c732040245ea65f22cd4af0666dc79da1b3fbe23c6a27\",\"kdf\":\"scrypt\",\"kdfparams\":{\"salt\":\"27695860062f440d91d1863c37349a28518ed98799d0d96b8f9a39c9e23b953a\",\"n\":131072,\"dklen\":32,\"p\":1,\"r\":8},\"mac\":\"2b0fe21ba893c40ab193694ef2f86c7982138fc17b19148b25f65bfccdbb4fbd\"}}"
```

Note: This method is equivalent to ```signer.encrypt(password)``` - if you already have the signer object, calling encrypt directly may be easier.

### Deploying custom contracts

#### Compilation and contract code handling

In order to deploy custom contracts, the ABI and bytecode of the compiled contract are required. For further contract interaction, such as calling contract methods, only the ABI is necessary.

Contract compilation is outside the scope of this library, but there are many ways to get contracts compiled and the ABI and bytecode available to your javascript code. The following advice assumes the contracts are written in Solidity.

##### Compilers: 
- Using the [Solidity compiler](https://github.com/ethereum/solidity)
- Using [Truffle](https://github.com/trufflesuite/truffle)
- Using [solc-js](https://www.npmjs.com/package/solc) (node only)
- Using [browser-solc](https://github.com/ericxtang/browser-solc) (browser only)

##### Managing compiled contracts

Once your contract has been compiled, there are several ways you can get the ABI and bytecode into your javascript environment.

From a usage perspective, the easiest way is to get this data into valid javascript. If you do not expect your contract code to change much, you can add the ABI and bytecode strings directly to your code.

This client relies on several of Eluvio's contracts. In order to easily pull these contracts in to the code and to allow us to minify this library into a single file with no dependencies, we compile these contracts and format them into easily importable javascript using a build script.

 ```./build/BuildContracts.js``` is the script that compiles the contracts and generates the javascript files, and ```./src/contracts``` is where those javascript files are written. These scripts are then used in ```./src/EthClient.js```.

Compiling to a JSON format would also be easily usable in a javascript environment. For example:

```json
// Contract.json:
{
  "abi": <abi>,
  "bytecode": <bytecode>
}
```

```javascript
// UseContract.js
const contractData = require("Contract.json");

client.DeployContract({
  abi: contractData.abi,
  bytecode: contractData.bytecode,
  constructorArgs: []
})
```


Other methods may be more difficult and prone to error due to the difficulty of importing non-javascript files into javascript.

- If you are using webpack, you can use the [raw-loader](https://github.com/webpack-contrib/raw-loader) to import your compiled contract data.
- On node.js, you can use fs to read files
- In a browser, you can do an XHR or fetch request to access the file

##### Deploying contracts

The ElvClient can be used to deploy custom contracts, provided the ABI and bytecode of the contract.

The arguments to both the contract constructor and contract methods are provided as an ordered array. Some arguments have special required formats - Bytes32 strings, for example. The FormatContractArguments helper can perform this formatting automatically by referencing the ABI.

For example, the second argument to this contract constructor is a bytes32 string:

```javascript
const constructorArgs = client.FormatContractArguments({
  abi,
  methodName: "constructor",
  args: [
    "First Argument",
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

It is recommended to always run your arguments array through the FormatContractArguments method before deploying a contract or calling a contract method unless you explicitly handle argument formatting yourself.

To deploy a contract, simply pass the ABI, bytecode, and formatted constructor arguments.

```javascript
return await client.DeployContract({
  abi,
  bytecode,
  constructorArgs
});
```

Calling a method on a deployed contract is similarly simple:

```javascript
return await client.CallContractMethod({
  contractAddress,
  abi,
  methodName: "myMethod",
  methodArgs
});
```

### Other blockchain interaction

The signer object, as described above, is an instance of an [ethers.js](https://github.com/ethers-io/ethers.js/) wallet that is connected to the client's specified blockchain (provider). It can be used independently of the ElvClient to do anything outlined in the [documentation](https://docs.ethers.io/ethers.js/html/api-wallet.html).

This signer can be used in conjunction with the ethers.js library, or even another ethereum library like web3 (by extracting the private key), to deploy contracts, sign transactions and perform other functions not explicitly supported in the ElvClient.

Refer to src/EthClient.js to see how ElvClient uses ethers.js to interact with the blockchain.

### Error handling
 
Error checking is performed by the client for all queries. If an error occurs or if the response is ```!.ok``` (response code not in 200 range), an error of the following format will be thrown:

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
  "hash": "hq__QmchT4PFtSdbLnQjMNeyoMB42jncU6QwiZe4wS1ymvgVK1",
  "qref": {
    "valid": true,
    "hash": "hqp_QmchT4PFtSdbLnQjMNeyoMB42jncU6QwiZe4wS1ymvgVK1"
  },
  "qmd": {
    "valid": true,
    "hash": "hqp_QmQ4V6Zi4Z4oGkAiZEYFoYaK5gs55r458dbJXer5hcS4ZB",
    "check": {
      "valid": true,
      "invalidValues": []
    }
  },
  "qstruct": {
    "valid": true,
    "hash": "hqp_QmNweqiWD85twj1f3HmhmSANoSpdra7cJzraZYetrkxh4c",
    "parts": [
      {
        "hash": "hqp_QmSYmLooWwynAzeJ54Gn1dMBnXnQTj6FMSSs3tLusCQFFB",
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
  "hash": "hq__QmchT4PFtSdbLnQjMNeyoMB42jncU6QwiZe4wS1ymvgVK1",
  "qref": {
    "valid": true,
    "hash": "hqp_QmchT4PFtSdbLnQjMNeyoMB42jncU6QwiZe4wS1ymvgVK1"
  },
  "qmd": {
    "valid": true,
    "hash": "hqp_QmQ4V6Zi4Z4oGkAiZEYFoYaK5gs55r458dbJXer5hcS4ZB"
  },
  "qstruct": {
    "valid": true,
    "hash": "hqp_QmNweqiWD85twj1f3HmhmSANoSpdra7cJzraZYetrkxh4c",
    "parts": [
      {
        "hash": "hqp_QmSYmLooWwynAzeJ54Gn1dMBnXnQTj6FMSSs3tLusCQFFB",
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

The API client can be used transparently by an restricted IFrame using the FrameClient (./ElvFrameClient-min.js).

See ./test/frames/Parent.html and ./test/frames/Child.html for example usage

NOTE: Raw response objects cannot be passed in message. When using non-json endpoints (e.g. DownloadPart), you must specify a valid type in the format field or accept the default blob format. The available formats correspond to Response methods (.json(), .blob(), .text(), etc.)

### Content Type Schema

#### Type Schema Grammar:

* **Schema**: [ **Entry** ]
* **Entry**: { **Key**, **Type**, { **Options** } }
* **Key**: string
* **Type**:
  "label" |
  "string" |
  "text" |
  "integer" |
  "number" |
  "json" |
  "boolean" |
  "choice" |
  "list" |
  "object" |
  "file" |
  "attachedFile"
* **Options** - Each type may have additional options that can modify contents, display properties, or validation of the field
  - \*
    - label: string
      - The label for this field. If not set, the key will be used as the label
    - required: boolean
      - Whether or not this field is required. Validation will be performed on the form
         using the html5 "required" attribute
  - "label":
    - text: string
      - The text to be displayed in the label
  - "object":
    - fields: **Schema**
      - The fields of an object are described as a schema
    - flattenDisplay: boolean
      - If true, the fields will not be wrapped in a subsection in the form with the object label -- the fields will appear as if they were not contained in an object.
  - "choice":
    - options: [ [label, value], ...]
      - List of options to choose from. Each entry is a pair consisting of the label of the entry and its value
  - "file":
    - multiple: boolean
      - If specified, will allow uploading of multiple files. Otherwise, only a single file will
         be allowed
    - accept: mime-type-string | [ mime-type-string ]
      - Limits the allowed filetypes to be upload to the specified mime-types
    - preview: boolean
      - If specified, a preview of the selected image will be shown above the selection when an image is chosen
      - "accept" should be an image type. If multiple inputs are allowed, only the first selection will be shown
  - "attachedFile":
    - hash: string
      - The hash of the content type part corresponding to the attached file
    - filename: string
      - The filename to use when the file is downloaded. If not provided, the label or the key will be used.

##### Notes
*attachedFile* is a special field that corresponds to a file uploaded to the content type. This file will be available in the form via a download link. This type may be useful for terms and conditions, instructions, or other information the contributor may need.

Schema are specified in the "eluv.schema" tag in the content type metadata.

Custom metadata manipulation can be allowed by setting "eluv.allowCustomMetadata" to true in the content type metadata.
