// initialize production master without uploading any files
// - use to turn a manually created object into a production master

// still need to pass in cloud credentials if files are remote

const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const ProductionMasterInit = async (libraryId, objectId, access) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    console.log("\nCalling production_master/init");

    try {

      const response = await client.EditContentObject({libraryId, objectId});

      console.log(JSON.stringify(response));
      const {id, write_token} = response;

      const {data, errors, warnings, logs} = await client.CallBitcodeMethod({
        objectId,
        libraryId,
        method: "/media/production_master/init",
        writeToken: write_token,
        body: {access},
        constant: false
      });

      const finalizeResponse = await client.FinalizeContentObject({
        libraryId,
        objectId: id,
        writeToken: write_token,
        awaitCommitConfirmation: false
      });

      console.log(JSON.stringify(data, null, 2));

      if(errors && errors.length > 0) {
        console.error("Errors:");
        console.error(errors.join("\n"), "\n");
      }

      if(warnings && warnings.length > 0) {
        console.warn("Warnings:");
        console.warn(warnings.join("\n"), "\n");
      }

      if(logs && logs.length > 0) {
        console.log("Log:");
        console.log(logs.join("\n"), "\n");
      }

    } catch(error) {
      console.error("Unrecoverable error:");
      console.error(error.body ? error.body : error);
    }
  } catch(error) {
    console.error(error);
  }
};

const [ , , libraryId, objectId ] = process.argv;

// const access = null;

// Example access if all files in filePaths are in S3 bucket
//
const access = [
  {
    "path_matchers": [".*"],
    "remote_access": {
      "protocol": "s3",
      "platform": "aws",
      "path": process.env.AWS_BUCKET + "/",
      "storage_endpoint": {
        "region":  process.env.AWS_REGION
      },
      "cloud_credentials": {
        "access_key_id": process.env.AWS_KEY,
        "secret_access_key": process.env.AWS_SECRET
      }
    }
  }
];


if(!libraryId || !objectId ) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/ProductionMasterInit.js libraryId objectId");
  return;
}

ProductionMasterInit(libraryId, objectId, access);
