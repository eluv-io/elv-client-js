const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const ClientConfiguration = require("../TestConfiguration.json");

const Create = async (masterLibraryId, filePath) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    const title = path.basename(filePath);
    const mimeType = mime.lookup(title) || "video/mp4";

    console.log(`Detected mime type ${mimeType} for ${title}`);

    const data = fs.readFileSync(filePath);
    const fileInfo = [{
      path: path.basename(filePath),
      type: "file",
      // mime_type: mimeType,
      size: data.length,
      data
    }];

    console.log("\nCreating Production Master");

    try {
      const {errors, warnings, id, hash} = await client.CreateProductionMaster({
        libraryId: masterLibraryId,
        name: title,
        description: "Production Master for " + title,
        contentTypeName: "Production Master",
        fileInfo,
        callback: progress => {
          console.log();

          Object.keys(progress).sort().forEach(filename => {
            const {uploaded, total} = progress[filename];
            const percentage = total === 0 ? "100.0%" : (100 * uploaded / total).toFixed(1) + "%";

            console.log(`${filename}: ${percentage}`);
          });
        }
      });

      console.log("returned from CreateProductionMaster")
      if(id && hash) {
        console.log("\nProduction master object created:");
        console.log("\tObject ID:", id);
        console.log("\tVersion Hash:", hash, "\n");
      }

      if(errors.length > 0) {
        console.error("Errors:");
        console.error(errors.join("\n"), "\n");
      }

      if(warnings.length) {
        console.warn("Warnings:");
        console.warn(warnings.join("\n"), "\n");
      }
    } catch(error) {
      console.error("Unrecoverable error:");
      console.log(JSON.stringify(error, null, 2));
      console.error(error.body ? error.body : error);
    }
  } catch(error) {
    console.error(error);
  }
};

const masterLibraryId = process.argv[2];
const filePath = process.argv[3];

if(!masterLibraryId || !filePath) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/CreateProductionMaster.js masterLibraryId filePath");
  return;
}

Create(masterLibraryId, filePath);
