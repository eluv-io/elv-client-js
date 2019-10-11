const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const path = require("path");

const ClientConfiguration = require("../TestConfiguration.json");

const Create = async (masterLibraryId, mezLibraryId, filePath) => {
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

    console.log("Creating Master");
    title = path.basename(filePath, path.extname(filePath));

    const { hash } = await client.CreateMediaMaster({
      libraryId: masterLibraryId,
      name: title + " (master)",
      description: "Master for " + title,
      fileInfo,
      callback: progress => console.log(progress)
    });

    console.log("Master hash: ", hash);

    console.log("Creating Mezzanine");
    const mezzanine = await client.CreateMediaMezzanine({
      libraryId: mezLibraryId,
      name: title + " (mezzanine)",
      description: "Mezzanine for " + title,
      masterVersionHash: hash
    });

    console.log(mezzanine);
  } catch(error) {
    console.error(error);
  }
};

const masterLibraryId = process.argv[2];
const mezLibraryId = process.argv[3];
const filePath = process.argv[4];

if(!masterLibraryId || !mezLibraryId || !filePath) {
  console.error("Usage: PRIVATE_KEY=<private-key> node testScripts/UploadMedia.js masterLibraryId mezLibraryId filePath");
  return;
}

Create(masterLibraryId, mezLibraryId, filePath);
