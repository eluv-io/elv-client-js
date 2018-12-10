const { ElvClient } = require("./src/ElvClient");
const ClientConfiguration = require("./TestConfiguration.json");

const Path = require("path");
const fs = require("fs");
const readLine = require("readline");

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

if(process.argv.length !== 5) {
  console.error("Usage: node InitContentSpace.js <path-to-qfab-config.json> <path-to-content-fabric-dir> <private-key>");
  process.exit();
}

const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
  accountName: "Alice",
  //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
  privateKey: process.argv[4]
});
client.SetSigner({signer});

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
  try {
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

    /* Update local test configuration and re-initialize client */

    ClientConfiguration.fabric.contentSpaceId = contentSpaceId;
    fs.writeFileSync("./TestConfiguration.json", JSON.stringify(ClientConfiguration, null, 2));

    console.log("Updated elv-client-js test configuration\n");

    client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
    client.SetSigner({signer});

    /* Prompt the user to restart their qfab daemon */

    await PromptRestart();

    /* Create the content types library */

    const libraryId = client.utils.AddressToLibraryId({address: contractAddress});
    const path = "/qlibs/" + libraryId;

    // Create library in fabric
    client.HttpClient.Request({
      headers: await client.authClient.AuthorizationHeader({transactionHash}),
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

    /* Create content types from bitcode */

    console.log("Creating content types: ");

    const bitcodePath = Path.join(process.argv[3], "bitcode");
    const bitcodeDirs = fs.readdirSync(bitcodePath)
      .filter(name => name !== ".gitignore");

    for (const bitcodeDirName of bitcodeDirs) {
      const bitcodeFiles = fs.readdirSync(Path.join(bitcodePath, bitcodeDirName))
        .filter(filename => filename.endsWith(".bc"));

      for (const bitcodeFilename of bitcodeFiles) {
        const name = bitcodeFilename.split(".")[0];
        const bitcode = fs.readFileSync(Path.join(bitcodePath, bitcodeDirName, bitcodeFilename));

        console.log("\tCreating " + name + "...");
        await client.CreateContentType({
          metadata: {
            "eluv.name": name
          },
          bitcode
        });
      }
    }

    console.log();
  } catch(error) {
    console.log("Error initializing fabric:");
    console.error(error);
  }
};

Init();
