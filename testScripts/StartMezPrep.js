const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const MezStart = async (libraryId, objectId, offeringKey, jobIndexes, access) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    try {
      // get mez metadata
      const mezMetaData = (await client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "abr_mezzanine/offerings"
      }));

      console.log(JSON.stringify(mezMetaData, null, 2));

      const offering = mezMetaData[offeringKey];
      const masterHash = offering["prod_master_hash"];

      // get file list from master
      // ** temporary workaround for permissions issue
      const masterFileData = (await client.ContentObjectMetadata({
        versionHash: masterHash,
        metadataSubtree: "files"
      }));


      const body = {
        access,
        offering_key: offeringKey,
        job_indexes: jobIndexes,
        production_master_files: masterFileData
      };

      const response = await client.EditContentObject({libraryId, objectId});

      console.log(JSON.stringify(response));
      const {id, write_token} = response;


      const {data, errors, warnings, logs} = await client.CallBitcodeMethod({
        objectId,
        libraryId,
        writeToken: write_token,
        method: "/media/abr_mezzanine/prep_start",
        constant: false,
        body: body
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

const [ , , libraryId, objectId, offeringKey, ...jobIndexes ] = process.argv;

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



if(!libraryId || !objectId || !offeringKey || !jobIndexes ) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/StartMezPrep.js libraryId, objectId, offeringKey, jobIndexes...");
  return;
}

var jobInts = [];
jobIndexes.forEach(function(i) {
  jobInts.push(parseInt(i,10));
});

MezStart(libraryId, objectId, offeringKey, jobInts, access);
