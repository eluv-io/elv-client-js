/* eslint-disable no-console */

// initialize production master without uploading any files
// - use to turn a manually created object into a production master

// still need to pass in cloud credentials via env vars or --credentials if files are remote

const fs = require("fs");

const { ElvClient } = require("../src/ElvClient");

const yargs = require("yargs");
const argv = yargs
  .option("libraryId", {
    description: "ID of the library containing master"
  })
  .option("objectId", {
    description: "ID of the master object"
  })
  .option("elv-geo", {
    type: "string",
    description: "Geographic region for the fabric nodes. Available regions: na-west-north, na-west-south, na-east, eu-west, eu-east, as-east, au-east"
  })
  .option("config-url", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
  })
  .option("credentials", {
    type: "string",
    description: "Path to JSON file containing credential sets for files stored in cloud"
  })
  .demandOption(
    ["libraryId", "objectId"],
    "\nUsage: PRIVATE_KEY=<private-key> node ProductionMasterInit.js --libraryId <master-library-id> --objectId <master-object-id>  (--config-url \"<fabric-config-url>\") (--elv-geo eu-west) \n"
  )
  .argv;

const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]};

const ProductionMasterInit = async ({libraryId, objectId, access, elvGeo}) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"],
      region: elvGeo
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

      // Check if all variants in resulting master has an audio and video stream
      const variants = (await client.ContentObjectMetadata({
        libraryId: libraryId,
        objectId: objectId,
        versionHash: finalizeResponse.hash,
        metadataSubtree: "/production_master/variants"
      }));
      for(let variant in variants){
        let streams = variants[variant].streams;
        if(!streams.hasOwnProperty("audio")) {
          console.warn("\nWARNING: no suitable audio found for variant '" + variant + "'");
        }
        if(!streams.hasOwnProperty("video")) {
          console.warn("\nWARNING: no video found for variant '" + variant + "'");
        }
      }

      console.log("New version hash: " + finalizeResponse.hash + "\n");

    } catch(error) {
      console.error("Unrecoverable error:");
      console.error(error.body ? error.body : error);
    }
  } catch(error) {
    console.error(error);
  }
};

let {libraryId, objectId, elvGeo, credentials} = argv;

let access;

if(credentials) {
  access = JSON.parse(fs.readFileSync(credentials));
} else {
  access = [
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
}

ProductionMasterInit({libraryId, objectId, elvGeo, access});