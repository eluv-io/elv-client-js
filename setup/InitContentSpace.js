/* eslint-disable no-console */
const { ElvClient } = require("../src/ElvClient");
const ClientConfiguration = require("../TestConfiguration.json");
const fs = require("fs");
const Path = require("path");

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

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
    const contentSpaceLibraryId = client.utils.AddressToLibraryId(deployResult.contractAddress);
    console.log("\nCreated content space:");

    console.log("\tAddress: " + deployResult.contractAddress);
    console.log("\tID: " + contentSpaceId + "\n");

    console.log("Updating TestConfiguration.json\n");
    ClientConfiguration.fabric.contentSpaceId = contentSpaceId;
    fs.writeFileSync("./TestConfiguration.json", JSON.stringify(ClientConfiguration, null, 2));

    // Reinitialize client
    client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
    client.SetSigner({signer});

    await client.HttpClient.Request({
      headers: await client.authClient.AuthorizationHeader({transactionHash: deployResult.transactionHash}),
      method: "PUT",
      path: Path.join("qlibs", contentSpaceLibraryId),
      body: {
        meta: {
          "name": "Content Types"
        }
      }
    });
  } catch(error) {
    console.log("Error initializing fabric:");
    console.error(error);
  }
};

Init();
