const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const Path = require("path");
const mime = require("mime-types");

const ClientConfiguration = require("../TestConfiguration.json");

const Create = async (masterLibraryId, title, copy, filePaths) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    const s3 = !!process.env.AWS_KEY;

    let fileInfo, access;
    if(s3) {
      access = {
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_BUCKET,
        accessKey: process.env.AWS_KEY,
        secret: process.env.AWS_SECRET
      };
    } else {
      fileInfo = filePaths.map(path => {
        const data = fs.readFileSync(path);
        const mimeType = mime.lookup(path) || "video/mp4";

        return {
          path: Path.basename(path),
          type: "file",
          mime_type: mimeType,
          size: data.length,
          data
        };
      });
    }

    console.log("\nCreating Production Master");

    try {
      const {errors, warnings, id, hash} = await client.CreateProductionMaster({
        libraryId: masterLibraryId,
        name: title,
        description: "Production Master for " + title,
        fileInfo,
        filePaths,
        access,
        copy,
        callback: progress => {
          if(s3) {
            console.log(progress);
          } else {
            console.log();

            Object.keys(progress).sort().forEach(filename => {
              const {uploaded, total} = progress[filename];
              const percentage = total === 0 ? "100.0%" : (100 * uploaded / total).toFixed(1) + "%";

              console.log(`${filename}: ${percentage}`);
            });
          }
        }
      });

      console.log("\nProduction master object created:");
      console.log("\tObject ID:", id);
      console.log("\tVersion Hash:", hash, "\n");

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
      console.error(error.body ? JSON.stringify(error.body, null, 2): error);
    }
  } catch(error) {
    console.error(error);
  }
};

const masterLibraryId = process.argv[2];
const title = process.argv[3];
const filePaths = process.argv.slice(4);

if(!masterLibraryId || !title || filePaths.length === 0) {
  console.error("\nLocal File Usage:\n");
  console.error(
    "\tPRIVATE_KEY=<private-key> node ./testScripts/CreateProductionMaster.js <master-library-id> <title> <file-path1> (<file-path2> ...)\n"
  );
  console.error("\nS3 Usage:\n");
  console.error(
    "\tPRIVATE_KEY=<private-key> AWS_REGION=<aws-region> AWS_BUCKET=<aws-bucket> AWS_KEY=<aws-key> AWS_SECRET=<aws-secret> " +
    "node ./testScripts/CreateProductionMaster.js <master-library-id> <title> <file-path1> (<file-path2> ...)\n"
  );

  return;
}

Create(masterLibraryId, title, true, filePaths);
