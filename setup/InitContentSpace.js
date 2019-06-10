/* eslint-disable no-console */
const { ElvClient } = require("../src/ElvClient");
const ClientConfiguration = require("../TestConfiguration.json");
const fs = require("fs");

const client = new ElvClient(ClientConfiguration);

if(process.argv.length !== 3) {
  console.error("Usage: node InitContentSpace.js <private-key>");
  process.exit();
}

const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({privateKey: process.argv[2]});
client.SetSigner({signer});

const Init = async () => {
  try {
    /* Create new content space and update QFab configuration */

    // If content space ID is not provided, deploy a new content space contract
    const deployResult = await client.ethClient.DeployContentSpaceContract({
      name: "Content Space",
      signer
    });

    const contentSpaceId = client.utils.AddressToSpaceId(deployResult.contractAddress);
    console.log("\nCreated content space:");

    console.log("\tAddress: " + deployResult.contractAddress);
    console.log("\tID: " + contentSpaceId + "\n");

    ClientConfiguration.contentSpaceId = contentSpaceId;
    fs.writeFileSync("./TestConfiguration.json", JSON.stringify(ClientConfiguration, null, 2));

    console.log("Updated TestConfiguration.json\n");
  } catch(error) {
    console.log("Error initializing fabric:");
    console.error(error);
  }
};

Init();
