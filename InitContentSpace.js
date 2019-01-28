const { ElvClient } = require("./src/ElvClient");
const ClientConfiguration = require("./TestConfiguration.json");

const Path = require("path");
const fs = require("fs");
const readLine = require("readline");

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

if(process.argv.length !== 5 && process.argv.length !== 6) {
  console.error("Usage: node InitContentSpace.js <path-to-qfab-config.json> <path-to-content-fabric-dir> <private-key> [existing-content-space-id]");
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
let contentSpaceId = process.argv[5];

const PromptRestart = async () => {
  console.log("\n\n=======================");
  console.log("RESTART QFAB DAEMON NOW");
  console.log("=======================\n\n");

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

    let contractAddress;
    let transactionHash;
    if(!contentSpaceId) {
      // If content space ID is not provided, deploy a new content space contract
      const deployResult = await client.ethClient.DeployContentSpaceContract({
        name: "Content Space",
        signer
      });
      contractAddress = deployResult.contractAddress;
      transactionHash = deployResult.transactionHash;
      contentSpaceId = client.utils.AddressToSpaceId(contractAddress);
      console.log("\nCreated content space:");
    } else {
      // If existing content space ID is provided, authorize against content space library
      contractAddress = client.utils.HashToAddress(contentSpaceId);
      transactionHash = await client.authClient.ContentLibraryUpdate({
        libraryId: client.utils.AddressToLibraryId(contractAddress)
      });
      console.log("\nUsing content space:");
    }

    console.log("\tAddress: " + contractAddress);
    console.log("\tID: " + contentSpaceId + "\n");

    const originalConfig = qfabConfig.qspaces[0] || {};
    const originalEthConfig = originalConfig.ethereum || {};

    qfabConfig.qspaces = [
      {
        ...originalConfig,
        id: contentSpaceId,
        type: "Ethereum",
        ethereum: {
          ...originalEthConfig,
          url: client.ethereumURI,
          chain_id: 955301
        }
      }
    ];

    console.log("Updating qfab daemon configuration at " + qfabConfigPath);
    fs.writeFileSync(qfabConfigPath, JSON.stringify(qfabConfig, null, 2));

    /* Update local test configuration and re-initialize client */

    console.log("Updating TestConfiguration.json");
    ClientConfiguration.fabric.contentSpaceId = contentSpaceId;
    fs.writeFileSync("./TestConfiguration.json", JSON.stringify(ClientConfiguration, null, 2));

    client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
    client.SetSigner({signer});

    /* Prompt the user to restart their qfab daemon */

    await PromptRestart();

    /*
    * Create the content types library (aka content space library)
    *
    * Note: Content space library is a special library backed by the content space contract,
    *       not a library contract, so we can't use client.CreateContentLibrary
    */

    const libraryId = client.utils.AddressToLibraryId(contractAddress);
    const path = "/qlibs/" + libraryId;

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

    // Read the specified directory and format it to be used by UploadFiles
    const ReadDir = (path) => {
      let fileInfo = [];
      const dir = fs.readdirSync(path, {withFileTypes: true});

      dir.forEach(item => {
        const itemPath = Path.join(path, item.name);
        if(item.isFile()) {
          const fileData = fs.readFileSync(itemPath);
          fileInfo.push({
            path: itemPath,
            type: "file",
            size: fileData.length,
            data: fileData
          });
        } else {
          fileInfo = fileInfo.concat(ReadDir(itemPath));
        }
      });

      return fileInfo;
    };

    // List all directories in content-fabric/bitcode
    const bitcodePath = Path.join(process.argv[3], "bitcode");
    const bitcodeDirs = fs.readdirSync(bitcodePath, {withFileTypes: true})
      .filter(item => item.isDirectory());

    // Find the bitcode in each directory and create a content type with it
    for (const bitcodeDir of bitcodeDirs) {
      const bitcodeFiles = fs.readdirSync(Path.join(bitcodePath, bitcodeDir.name), {withFileTypes: true})
        .filter(item => item.isFile() && item.name.endsWith(".bc"));

      for (const bitcodeFile of bitcodeFiles) {
        const name = bitcodeFile.name.split(".")[0];
        const bitcode = fs.readFileSync(Path.join(bitcodePath, bitcodeDir.name, bitcodeFile.name));

        console.log("\tCreating " + name + "...");
        await client.CreateContentType({
          metadata: {
            "eluv.name": name,
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
