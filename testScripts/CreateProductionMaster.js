const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const path = require("path");

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

    const data = fs.readFileSync(filePath);

    //  TODO: use a lib or mechanism to set mime_type based on file ext?
    //  (e.g. .mov should be video/quicktime)
    //  https://docs.openx.com/Content/publishers/adunit_linearvideo_mime_types.html
    const fileInfo = [
      {
        path: path.basename(filePath),
        type: "file",
        mime_type: "video/mp4",
        size: data.length,
        data
      }
    ];

    console.log("\nCreating Production Master");
    title = path.basename(filePath, path.extname(filePath));

    const { notice, objectInfo } = await client.CreateProductionMaster({
      libraryId: masterLibraryId,
      name: title,
      description: "Production Master for " + title,
      contentTypeName: "Production Master",
      fileInfo,
      callback: progress => console.log(progress)
    });

    if (objectInfo && objectInfo.hash) {
      console.log("\nPRODUCTION MASTER OBJECT CREATED, HASH= " + objectInfo.hash);
    }

    if (notice) {
      if (notice.errors && notice.errors.length > 0) {
        console.log("\nERRORS:");
        notice.errors.forEach((msg)=>console.log("  * " + msg));
      }
      if (notice.warnings && notice.warnings.length > 0) {
        console.log("\nWARNINGS:");
        notice.warnings.forEach((msg)=>console.log("  * " + msg));
      }
      if (notice.full_log && notice.full_log.length > 0) {

      }
    }

  } catch(error) {
    console.error(error);
  }
  console.log("");
};

const masterLibraryId = process.argv[2];
const filePath = process.argv[3];

if(!masterLibraryId || !filePath) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/CreateProductionMaster.js masterLibraryId filePath");
  return;
}

Create(masterLibraryId, filePath);

