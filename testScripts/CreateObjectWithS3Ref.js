const {ElvClient} = require("../src/ElvClient");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const ClientConfiguration = require("../TestConfiguration.json");

const Create = async (libraryId, contentTypeName, filePaths, remote_info, name = "untitled", description = "", metadata = {}) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    const contentType = await client.ContentType({name: contentTypeName});

    if(!contentType) {
      throw "Unable to access content type '" + contentTypeName + "' to create object";
    }

    const {id, write_token} = await client.CreateContentObject({
      libraryId,
      options: {
        type: contentType.hash
      }
    });

    console.log(remote_info);

    response = await client.UploadFilesFromS3({
      libraryId,
      objectId: id,
      writeToken: write_token,
      region: remote_info.region,
      bucket: remote_info.bucket,
      filePaths: filePaths,
      accessKey: remote_info.accessKey,
      secret: remote_info.secret,
      copy: false
    });
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log(JSON.stringify(response));

    await client.MergeMetadata({
      libraryId,
      objectId: id,
      writeToken: write_token,
      metadata: {
        name,
        description,
        public: {
          name: name || "",
          description: description || ""
        },
        elv_created_at: new Date().getTime(),
        ...(metadata || {})
      }
    });

    await

      console.log("finalizing object");

    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId: id,
      writeToken: write_token,
      awaitCommitConfirmation: true
    });

    console.log("returned from finalize");
    console.log(JSON.stringify(finalizeResponse, null, 2));


  } catch(error) {
    console.error("Unrecoverable error:");
    console.log(JSON.stringify(error, null, 2));
    console.error(error.body ? error.body : error);
  }
};

const libraryId = process.argv[2];
const filePath = process.argv[3];

if(!libraryId || !filePath) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/CreateObjectWithS3Ref.js libraryId filePath");
  return;
}

Create(
  libraryId,
  "ABR Mezzanine",
  [filePath],
  {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
    accessKey: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET
  },
  filePath
);
