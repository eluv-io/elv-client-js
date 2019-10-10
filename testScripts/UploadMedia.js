const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");

const ClientConfiguration = require("../TestConfiguration.json");

const Create = async (libraryId, file) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});

    const data = fs.readFileSync(file);

    const fileInfo = [
      {
        path: "shrek-retold.mp4",
        type: "file",
        mime_type: "video/mp4",
        size: data.length,
        data
      }
    ];

    console.log("Creating Master");
    const { hash } = await client.CreateMediaMaster({
      libraryId,
      name: "Test Master",
      description: "Test Master",
      fileInfo,
      callback: progress => console.log(progress)
    });

    console.log("Master hash: ", hash);


    console.log("Creating Mezzanine");
    const mezzanine = await client.CreateMediaMezzanine({
      libraryId,
      name: "Test Mezzanine",
      description: "Test Mezzanine",
      masterVersionHash: hash
    });

    console.log(mezzanine);
  } catch(error) {
    console.error(error);
  }
};

const libraryId = process.argv[2];
const file = process.argv[3];

if(!libraryId || !file) {
  console.error("Usage: PRIVATE_KEY=<private-key> node testScripts/UploadMedia.js libraryId file");
  return;
}

Create(libraryId, file);
