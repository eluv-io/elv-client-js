# Getting Started with the Eluvio SDK

### Cal Hacks 5.0 Edition

Clone this repository and install.

* The Eluvio SDK requires Node and NPM. 
    * To install refer to [https://www.npmjs.com/get-npm](https://www.npmjs.com/get-npm)

Clone this repo: `git clone https://github.com/eluv-io/elv-client-js`

Install with NPM: `cd elv-client-js && npm install`

*To learn what a project does, run the tests!*
 
The test file `test/Test.js` has the following configuration:

```  
let Client = new ElvClient({
    hostname: "q1.contentfabric.io",
    port: 80,
    useHTTPS: false,
    ethHostname: "eth1.contentfabric.io",
    // ethHostname: "127.0.0.1",
    ethPort: 8545,
    ethUseHTTPS: false
});
```

**NOTE!** If you are using the `CalVisitor` wifi port 8545 is blocked!
We have a blockchain test node listening to port 80 at `eth2.contentfabric.io`
The configuration would then be:

```    
ethHostname: "eth2.contentfabric.io",
ethPort: 80
```

As is, this test will run the `TestQueries` function in `test/TestMethods.js` and execute many of the core API's of the content fabric and blockchain application.  

The current configuration will connect to Eluvio's testnet blockchain and development content fabric.
In order to test against the testnet you will need an account - a private key - and test coins.
Please see us at the Eluvio booth on the Field Club level or contact us on Slack at [calhackseluvio.slack.com](calhackseluvio.slack.com) to get an account.

Once you have an account you can configure the test account in `test/Test.js` here:
```  
let signer = wallet.AddAccount({
    accountName: "Alice",
    privateKey: "[INSERT YOUR PRIVATE ELUVIO KEY HERE]"
});
```

Run the test with `node test/Test.js`. If successful you should see output that demonstrates some of the basic interaction with the Eluvio content fabric, including publishing content with metadata, modifying it and accessing it from the fabric.

#### Custom Contract Development with Truffle

One of the powerful features of the Eluvio Content Fabric is the ability to customize content authorization, access and payment rules with custom Ethereum Solidity contracts.
In order to develop and test your own contract you will want to use the SDK's Truffle environment and deploy test contracts on Ganache, a Node.js Ethereum light client.

Truffle is a very powerful and flexible development toolkit for Ethereum. Please refer to [https://truffleframework.com/](https://truffleframework.com/) for more information.

To install and run Ganache refer to [https://truffleframework.com/ganache](https://truffleframework.com/ganache). We recommend that you install and run the full client as opposed to the CLI.

Refer to the project file `truffle.js` to make sure Truffle is configured correctly. The most important setting here is the port that Ganache is listening to; `7545` is the default.

```  
networks: {
    development: {
        host: "127.0.0.1",
        port: 7545,
        network_id: "*" // Match any network id
    }
}
```

The SDK includes some basic tests of contract deployment and customization.
Run the tests with `truffle test`.
In particular, the test `test/TestCustomHelloWorld.js` demonstrates the core interactions of custom contracts with the base contracts of the system.

##### For more information or help, please visit us at the Eluvio booth on the Field Club level or contact us on Slack at [calhackseluvio.slack.com](calhackseluvio.slack.com)!
##### Happy Hacking!