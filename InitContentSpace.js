const { ElvClient } = require("./src/ElvClient");
const ClientConfiguration = require("./TestConfiguration.json");

const fs = require("fs");
const readLine = require("readline");

const client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

let wallet = client.GenerateWallet();
let signer = wallet.AddAccount({
  accountName: "Alice",
  //privateKey: "04832aec82a6572d9a5782c4af9d7d88b0eb89116349ee484e96b97daeab5ca6"
  privateKey: "1307df44f8f5033ec86434a7965234015da85261df149ed498cb29907df38d72"
});
client.SetSigner({signer});

if(process.argv.length !== 3) {
  console.error("Usage: node InitContentSpace.js <path-to-qfab-config.json>");
  process.exit();
}

const qfabConfigPath = process.argv[2];

const PromptRestart = async () => {
  console.log("Restart QFab Daemon now\n");

  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let restarted = false;

  while(!restarted) {
    restarted = await new Promise(
      resolve => rl.question("QFab daemon restarted? (y/n) ", (answer) => {
        if(answer === "y") {
          rl.close();
          resolve(true);
        } else {
          resolve(false);
        }
      })
    );
  }
};

const Init = async () => {
  /* Create new content space and update QFab configuration */

  let qfabConfig = JSON.parse(fs.readFileSync(qfabConfigPath).toString());

  const {contractAddress, transactionHash} = await client.ethClient.DeployContentSpaceContract({
    name: "Content Space",
    signer
  });
  const contentSpaceId = client.utils.AddressToSpaceId({address: contractAddress});

  console.log("\nCreated content space:");
  console.log("\tAddress: " + contractAddress);
  console.log("\tID: " + contentSpaceId + "\n");

  qfabConfig.qspaces = [
    {
      id: contentSpaceId,
      type: "Ethereum",
      ethereum: {
        url: client.ethereumURI,
        chain_id: 955301
      }
    }
  ];

  fs.writeFileSync(qfabConfigPath, JSON.stringify(qfabConfig, null, 2));

  console.log("Updated qfab daemon configuration");

  /* Update local test configuration */

  ClientConfiguration.fabric.contentSpaceId = contentSpaceId;
  fs.writeFileSync("./TestConfiguration.json", JSON.stringify(ClientConfiguration, null, 2));

  console.log("Updated elv-client-js test configuration\n");

  client.contentSpaceId = contentSpaceId;

  /* Prompt the user to restart their qfab daemon */

  await PromptRestart();

  /* Create the content types library */

  const libraryId = client.utils.AddressToLibraryId({address: contractAddress});
  const path = "/qlibs/" + libraryId;

  // Create library in fabric
  client.HttpClient.Request({
    headers: await client.AuthorizationHeader({transactionHash}),
    method: "PUT",
    path: path,
    body: {
      meta: {
        "eluv.name": "Content Types"
      }
    }
  });

  console.log("\nCreated content types library: ");
  console.log("\tID: " + libraryId + "\n");
};

Init();
