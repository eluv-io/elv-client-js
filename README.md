## Eluvio Javascript Client

The Eluvio Javascript Client is designed to make interacting with the Eluvio Content Fabric simple by encapsulating all of the necessary HTTP requests, authorization, and blockchain interaction.

## [API Documentation](https://eluv-io.github.io/elv-client-js/ElvClient.html)

- [ Installation ](#installation)
- [ Getting Started ](#initialization)
- [ Authorization ](#authorization)
- [ Identifying Content ](#id-format)
- [ Creating and Editing Content ](#editing)
- [ Playing Video ](#video)
- [ Publishing ABR Video Content ](#abr-publishing)
- [ Other Resources](#resources)

<a name="installation"></a>
## Installation

#### Install from NPM: 

```
npm install --save @eluvio/elv-client-js
```

#### Usage

```
// From source
import { ElvClient } from "elv-client-js";
const { ElvClient } = require("elv-client-js");

// From babel-compiled source
import { ElvClient } from "elv-client-js/dist/src/ElvClient.js";
const { ElvClient } = require("elv-client-js/dist/src/ElvClient.js");

// Minified (browser)
import { ElvClient } from "elv-client-js/dist/ElvClient-min.js";
const { ElvClient } = require("elv-client-js/dist/ElvClient-min.js");

// Minified (node)
import { ElvClient } from "elv-client-js/dist/ElvClient-node-min.js";
const { ElvClient } = require("elv-client-js/dist/ElvClient-node-min.js");

// HTML
<script src=".../elv-client-js/dist/ElvClient-min.js"></script>
```

<a name="initialization"></a>
## Initializing the Client

Initializing the client is as simple as pointing it at the appropriate Eluvio configuration URL. This URL will automatically return information about the best Fabric, blockchain and KMS nodes, as well as the Fabric's content space - all the information the client needs to know to communicate with the Fabric.

For the main net:

```javascript
const client = await ElvClient.FromConfigurationUrl({
  configUrl: "https://main.net955305.contentfabric.io/config"
});
```

For the demo net:

```javascript
const client = await ElvClient.FromConfigurationUrl({
  configUrl: "https://demov3.net955210.contentfabric.io/config"
});
```


<a name="authorization"></a>
## Authorization

### Wallets and Signers

Built on blockchain technology, interaction with the Fabric requires the use of an ethereum private key - representing a user account - in order to verify and authenticate requests, perform encryption, transfer funds, interact with smart contracts, and generally serve as an identity for the user. 


To perform the necessary blockchain interactions, the client requires a *signer* containing the user's private key. This is an instance of an [ethers.js](https://github.com/ethers-io/ethers.js/) wallet. ElvClient has a utility class ```ElvWallet``` to make handling this easier. (Note: the new elv-media-wallet takes advantage of new Fabric APIs that manage the signer on behalf of the user. For more info, please contact support@eluv.io)

After creating the ElvClient instance, you can generate an ```ElvWallet``` for the client using ```client.GenerateWallet()```. This class provides simple methods to generate signers from various information, as well as storing and retrieving signers by name. 

After creating a signer using one of the AddAccount methods, you can set the signer for ElvClient using ``client.SetSigner``.

```javascript
const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
  privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
});

client.SetSigner({signer});
```

You do not need to use the account management functionality of the wallet, you can simply use the wallet to generate signer objects as needed. Omitting the name parameter when calling any of the AddAccount is valid - the signer will only be returned and not stored.

Note that most operations on the Fabric require funds. If the account does not have any funds, most operations will fail. You can send funds from one account to another using [ElvClient#SendFunds](https://eluv-io.github.io/elv-client-js/ElvClient.html#SendFunds). 

State channel authentication (as used in [ElvClient#PlayoutOptions](https://eluv-io.github.io/elv-client-js/ElvClient.html#PlayoutOptions)) does not require funds.

**Note: Always treat private keys (and mnemonics) as private, sensitive user data. Always store and transfer them encrypted (the client has a method for encrypting private keys with a password - see [ElvWallet#GenerateEncryptedPrivateKey](https://eluv-io.github.io/elv-client-js/ElvWallet.html#GenerateEncryptedPrivateKey)). A plaintext private key or mnemonic should *never* leave the user's browser - all use of the private key is done on the client.**

### Accessing Content
As a decentralized, trustless ecosystem, the content Fabric relies on smart contracts and blockchain transactions to verify that a user is allowed to perform an action. Each type of content (content spaces, libraries, objects, types, etc.) have associated smart contracts deployed to the blockchain that mediate access.

For example, to access a content object, the requester must call the accessRequest method on that content object's smart contract, then pass the transaction hash in the authorization token when querying the content Fabric API. The content Fabric will then verify the transaction before performing the requested action. If the transaction is missing or invalid, access will be denied.

The ElvClient handles all of this automatically. When a method is called, it will perform the appropriate transaction and send the correct authorization token with the request.

<a name="id-format"></a>
## Content, Contracts and Multi-format Hashes

As mentioned previously, every entity on the Fabric is backed by a smart contract. This contract is used for authorization and other functionality, but it is also used as the identity of the entity.

Every smart contract has a blockchain address. For example:

```
0x0472ec0185ebb8202f3d4ddb0226998889663cf2
```

This address is used when interacting with the contract directly, to call methods and perform transactions.

However, this address can be transformed into an ID to address the content on the Fabric.

By encoding the address in Base58, we get:

```
4bWCz6SZZiJ51VUkAb4xGLTgKGm
```

Each different type of entity on the Fabric has a prefix. For a library, it is `ilib`. If this contract is a content library contract, we can refer to the corresponding library on the Fabric using the library ID 

```
ilib4bWCz6SZZiJ51VUkAb4xGLTgKGm
```

We can then use this ID as the `libraryId` argument in the client.

Additionally, we can go the opposite direction - convert a Fabric ID to its corresponding contract address. This is critically useful - when we want to access content, we need to make a call to the contract of that content. With this scheme, we just easily determine the contract address from a Fabric ID. 

In short, every Fabric ID contains

- the type of the entity (library, object, type, user wallet, etc.) as a 4 byte prefix
- the address of its contract

This conversion should not be something that must be done often, as the client encapsulates a lot of the common interactions between Fabric and blockchain, but it is useful when you want to call methods on the content's contract. 

The client contains utility methods to make this conversion simple.

```javascript
const address = "0x0472ec0185ebb8202f3d4ddb0226998889663cf2";

// Convert to multihash
const id = client.utils.AddressToHash(address);

// Convenience methods for automatically adding prefixes
const libraryId = client.utils.AddressToLibraryId(address);
const objectId = client.utils.AddressToObjectId(address);

// Convert back to address (requires prefix)
client.utils.HashToAddress(libraryId);
```

### Version Hashes

Content objects on the Fabric are comprised of immutable versions. Whenever content is modified, a new version is created, while older versions remain unchanged.

When referring to an object, an object ID (`iq__2vDbmxTdaivPnmDn8RKLbxSHUMfj`) refers to the object as a whole. Referring to content with an object ID will refer to the latest version.

However, you can also refer to a specific version of the object using a version hash. One such version of this object is `hq__BD1BouHkFraAcDjvoyHoiKpVhf4dXzNsDT5USe8mrZ7YDhLPDoZGnoU32iZvDYiQW8vVi6X7rV`.

As an analogy, referring to an object with an object ID compared to referring it using version hash is like referring to a Git repo versus referring to a repo at a specific commit. The former refers to the entity as a whole and updates as changes are made, while the latter refers to the entity at a specific point in time and does not change.

This version hash is a Base58 encoded string with the following format:

```
hq__<Base58(<SHA256 digest><size><object ID>)>
```

In short, the version hash refers to a specific of content on the Fabric, and it also contains the object ID, which means we can determine its contract address.

The client contains a utility method for parsing version hashes:

```javascript
client.utils.DecodeVersionHash("hq__BD1BouHkFraAcDjvoyHoiKpVhf4dXzNsDT5USe8mrZ7YDhLPDoZGnoU32iZvDYiQW8vVi6X7rV")

/*
{
  "digest": "7e98af41257c1446a4c5fcab9306e5d4f783145391cfa996bf9eca0197dd9388",
  "size": 139,
  "objectId": "iq__2vDbmxTdaivPnmDn8RKLbxSHUMfj",
  "partHash": "hqp_3rzPdsErVFeqjdG9o31rhr62fpEGhg5qv7QJjL6esVLV47i"
}
*/
``` 

Note that version hashes can not be generated from contract addresses like object IDs. They are specific to the Fabric and must be retrieved using the object ID. 

See [ElvClient#ContentObjectVersions](https://eluv-io.github.io/elv-client-js/ElvClient.html#ContentObjectVersions)

<a name="editing"></a>
## Creating and Editing Content

As mentioned in the previous section, content is comprised of immutable versions. These versions are created by making a draft, modifying that draft, then finalizing and committing the draft.

In this client, new drafts are created with the `CreateContentObject` and `EditContentObject` methods. The former creates a new content object, with the draft referring to the initial version of the object, while the latter creates a new draft based on the latest version of the specified content object.

Both methods return *write tokens*. These tokens are used in all of the methods used to modify content and in the finalize method to refer to the draft.

When the object is finalized, the draft is closed for editing, the version hash is created for the new version, and the object is committed and distributed across the fabric.

The process for creating or editing a content object is the following:
- Open draft and retrieve a write token
- Use the write token to modify the content (update metadata, upload files, etc.)
- Finalize the draft to create a new version of the content

Here is an example of creating new content with files and metadata:

```javascript
const createResponse = await client.CreateContentObject({libraryId});
const objectId = createResponse.id;
const writeToken = createResponse.write_token;

await client.ReplaceMetadata({
  libraryId,
  objectId,
  writeToken,
  metadata: {
    tags: [
      "video",
      "audio"
    ]
  }
});

await client.UploadFiles({
  libraryId,
  objectId,
  writeToken,
  fileInfo: [
    {
      path: "image.jpg",
      mime_type: "image/jpeg",
      size: 10000,
      data: (<ArrayBuffer 10000>)
    }
  ]
});

const finalizeResponse = await client.FinalizeContentObject({
  libraryId,
  objectId,
  writeToken
});

const versionHash = finalizeResponse.hash;
```

Regardless of what kind of edits are made, the process of editing content will always be bookended by `CreateContentObject` or `EditContentObject` to open a draft, and `FinalizeContentObject` to publish it.

Besides content objects, other entities on the fabric can be accessed and modified in the same way, including libraries, access groups and user wallets. To do so, obtain the objectId of the entity by converting its address:

```javascript
const libraryId = "ilib2vDbmxTdaivPnmDn8RKLbxSHUMfj";
const libraryAddress = client.utils.HashToAddress(libraryId);
const libraryObjectId = client.utils.AddressToObjectId(libraryAddress);
```

The objectId can then be used in these methods to modify them as content objects. For the libraryId parameter, specify libraryId for libraries, and `client.contentSpaceLibraryId` for other types.

**NOTE** By default, `FinalizeContentObject` will wait for the new version to be distributed and confirmed across the fabric. In most cases, this occurs very quickly. However, if a lot of file content is uploaded in a draft, this may take some time. In this case, you can specify not to wait when finalizing so your program can continue:

```javascript
await client.FinalizeContentObject({
  libraryId,
  objectId,
  writeToken,
  awaitCommitConfirmation: false
});
```

Only the modifications made within a version are distributed, so this is only a factor when large files are uploaded within an edit.

<a name="frame-client"></a>
## Frame Client

To protect access to users private keys and unify account management functionality, applications are run within an IFrame by [Eluvio Core](https://github.com/eluv-io/elv-fabric-browser). The FrameClient can be used equivalently in place of ElvClient within this restricted IFrame without having access to any user keys.

The frame client contains dynamically defined methods corresponding to those in ElvClient, and works by passing a message to the Eluvio Core frame with the method name and arguments. Core then takes that message, calls the method in its own client (which has the key for the current user) with the provided arguments, and passes the results back in another message. The frame client then hands the results back to the caller.

With few exceptions, using FrameClient within Core works identically to the full client.

Note that functions can not be passed between frames - any functions, including those contained in objects, will be automatically stripped out of the sent message by the browser.

Both the [Eluvio Fabric Browser](https://github.com/eluv-io/elv-fabric-browser) and the [Eluvio Video Editor](https://github.com/eluv-io/elv-video-editor) use the FrameClient exclusively.

<a name="video"></a>
## Playing Video from the Fabric

See the [Stream Sample App](https://github.com/eluv-io/elv-stream-sample) for a detailed explanation on playing video from the Fabric using the Eluvio JavaScript client.

<a name="abr-publishing"></a>
## Publishing ABR Video Content on the Fabric

For more information on how to publish ABR content see [this detailed guide](https://eluv-io.github.io/elv-client-js/abr/index.html).

<a name="resources"></a>
## Other Resources

Our Core, Fabric Browser and Video Editor apps are all completely open source, and make extensive use of this client:

* [Eluvio Core](https://github.com/eluv-io/elv-fabric-browser)
* [Eluvio Fabric Browser](https://github.com/eluv-io/elv-fabric-browser)
* [Eluvio Video Editor](https://github.com/eluv-io/elv-fabric-browser)

You can also look at the source and test code for this client. It contains many examples of how to interact with the Fabric, blockchain, and contract code.
