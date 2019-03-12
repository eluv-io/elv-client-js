### Eluvio Javascript Client

#### [Read the docs](https://eluv-io.github.io/elv-client-js/ElvClient.html)

The Eluvio Javascript Client is designed to make interacting with the Eluvio Content Fabric simple by encapsulating all of the HTTP requests, authorization, and blockchain interaction involved.

##### Wallets and signers

To perform the necessary blockchain interactions, the client requires a *signer* containing the user's private key. This is an instance of an [ethers.js](https://github.com/ethers-io/ethers.js/) wallet. ElvClient has a utility class ```ElvWallet``` to make handling this easier.

After creating the ElvClient instance, you can generate an ```ElvWallet``` for the client using ```client.GenerateWallet()```. This class provides simple methods to generate signers from various information, as well as storing and retrieving signers by name. 

After creating a signer using one of the AddAccount methods, you can set the signer for ElvClient using ``client.SetSigner``.

```javascript
const client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
  privateKey: "0xbf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6"
});

client.SetSigner({signer});
```

Note: you do not need to use the account management functionality of the wallet, you can simply use the wallet to generate signer objects as needed. Omitting the name parameter when calling any of the AddAccount is valid - the signer will only be returned and not stored.



#### Authorization

Being a decentralized, trustless ecosystem, the content fabric relies on smart contracts and blockchain transactions to verify that a user is allowed to perform an action. Each type of content (content spaces, libraries, objects, types) have associated smart contracts deployed to the blockchain that mediate access.

For example, to access a content object, the requestor must call the accessRequest method on that content object's smart contract, then pass the transaction hash in the authorization token when querying the content fabric API. The content fabric will then verify the transaction before performing the requested action. If the transaction is invalid, access will be denied.

The ElvClient handles all of this automatically. When a method is called, it will create the appropriate transaction and send the correct authorization token with the request.

The contract address of content can be determined by its ID, because the IDs of content in the fabric are multiformat hashes. This means that no additional information is needed to locate the appropriate contract when accessing content.

For example, the library with ID ```ilibVdci1v3nUgXdMxMznXny5NfaPRN``` has its contract located at the blockchain address ```0x236ee22acab8810f75b726079a0b3d3afd505645```. 

#### Frame Client

To protect access to users private keys and unify account management functionality, applications are run within an IFrame by elv-core-js. The FrameClient can be used transparently in place of ElvClient within this restricted IFrame without having access to any user keys.

The frame client contains dynamically defined methods corresponding to those in ElvClient, and works by passing a message to the elv-core-js frame with the method name and arguments. Core then takes that message, calls the method in its own client (which has the key for the current user) with the provided arguments, and passes the results back in another message. FrameClient then hands the results back to the caller.

With few exceptions, using FrameClient within elv-core-js works identically to the full ElvClient.

See ./test/frames/Parent.html and ./test/frames/Child.html for example usage. elv-fabric-browser also uses FrameClient exclusively.

NOTE: Raw response objects cannot be passed in message. When using non-json endpoints (e.g. DownloadPart), you must specify a valid type in the format field or accept the default blob format. The available formats correspond to Response methods (.json(), .blob(), .text(), etc.)
