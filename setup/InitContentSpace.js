/* eslint-disable no-console */
const { ElvClient } = require("../src/ElvClient");
const ClientConfiguration = require("../TestConfiguration.json");
//const CBOR = require("cbor");
//const multicodec = require("multicodec");

const SpaceContract = require("../src/contracts/BaseContentSpace");

const client = new ElvClient(ClientConfiguration);

if(process.argv.length !== 6) {
  console.error("Usage: node InitContentSpace.js <creator-private-key> <kms-private-key> <kms-url> <node-address>");
  process.exit();
}

const Init = async () => {
  try {
    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({privateKey: process.argv[2]});
    await client.SetSigner({signer});

    /* Create new content space and update QFab configuration */

    // If content space ID is not provided, deploy a new content space contract
    const deployResult = await client.ethClient.DeployContentSpaceContract({
      name: "Content Space",
      signer
    });

    const contentSpaceId = client.utils.AddressToSpaceId(deployResult.contractAddress);
    console.log("\nCreated content space:");

    console.log("\tAddress: " + deployResult.contractAddress);
    console.log("\tID: " + contentSpaceId);

    const kmsSigner = wallet.AddAccount({privateKey: process.argv[3]});
    const kmsId = `ikms${client.utils.AddressToHash(kmsSigner.address)}`;
    const kmsPublicKey = kmsSigner.signingKey.publicKey;
    const kmsUrl = process.argv[4];

    const addKMSResult = await client.CallContractMethodAndWait({
      contractAddress: deployResult.contractAddress,
      abi: SpaceContract.abi,
      methodName: "addKMSLocator",
      methodArgs: [
        kmsId,
        kmsUrl
      ]
    });

    const kmsStatus = client.ExtractValueFromEvent({
      abi: SpaceContract.abi,
      event: addKMSResult,
      eventName: "AddKMSLocator",
      eventValue: "status"
    });

    await client.CallContractMethod({
      contractAddress: deployResult.contractAddress,
      abi: SpaceContract.abi,
      methodName: "setAddressKMS",
      methodArgs: [
        kmsSigner.address
      ]
    });

    await client.CallContractMethod({
      contractAddress: deployResult.contractAddress,
      abi: SpaceContract.abi,
      methodName: "setKMSPublicKey",
      methodArgs: [
        kmsId,
        kmsPublicKey
      ]
    });

    if(kmsStatus.toNumber() !== 0) {
      console.error("Error adding KMS");
      return;
    }

    console.log("\tKMS ID: " + kmsId);
    console.log("\tKMS URL: " + kmsUrl);
    console.log("\tKMS Public Key: " + kmsPublicKey);

    const nodeAddress = process.argv[5];
    //const nodeId = `inod${client.utils.AddressToHash(nodeAddress)}`;

    /*
    const nodeLocators = [
      {
        api: "fabric",
        scheme: "http",
        host: "localhost",
        port: "8008"
      },
      {
        api: "eth",
        scheme: "http",
        host: "localhost",
        port: "8545"
      }
    ];

    console.log(nodeLocators);
    console.log(multicodec.addPrefix("cbor", CBOR.encode(nodeLocators)));
    console.log(multicodec.addPrefix("cbor", CBOR.encode(nodeLocators)).toString());

    const addNodeResult = await client.CallContractMethodAndWait({
      contractAddress: deployResult.contractAddress,
      abi: SpaceContract.abi,
      methodName: "addNode",
      methodArgs: [
        nodeAddress,
        multicodec.addPrefix("cbor", CBOR.encode(nodeLocators))
      ],
      formatArguments: false
    });

    const nodeAddressFromEvent = client.ExtractValueFromEvent({
      abi: SpaceContract.abi,
      event: addNodeResult,
      eventName: "AddNode",
      eventValue: "nodeAddr"
    });

    if(!nodeAddressFromEvent || !client.utils.EqualAddress(nodeAddress, nodeAddressFromEvent)) {
      console.error("Error adding node");
      return;
    }

    console.log("\tNode ID: " + nodeId);
    */

    console.log("\nClient balance:", await client.GetBalance({address: signer.address}));
    console.log("Node balance:", await client.GetBalance({address: nodeAddress}));
    console.log("KMS balance:", await client.GetBalance({address: kmsSigner.address}));
  } catch(error) {
    console.log("Error initializing fabric:");
    console.error(error);
  }
};

Init();
