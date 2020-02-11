/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");
const readline = require("readline");
const Path = require("path");
const mime = require("mime-types");
const fs = require("fs");

const yargs = require("yargs");
const argv = yargs
  .option("library", {
    description: "ID of the library in which to create the mezzanine"
  })
  .option("masterHash", {
    description: "Version hash of the master object"
  })
  .option("type", {
    description: "Name, object ID, or version hash of the type for the mezzanine"
  })
  .option("title", {
    description: "Title for the mezzanine"
  })
  .option("poster", {
    description: "Poster image for this mezzanine"
  })
  .option("metadata", {
    description: "Metadata JSON string to include in the object metadata"
  })
  .option("variant", {
    description: "Variant of the mezzanine",
    default: "default"
  })
  .option("offering-key", {
    description: "Offering key for the new mezzanine",
    default: "default"
  })
  .option("existingMezzId", {
    description: "If re-running the mezzanine process, the ID of an existing mezzanine object"
  })
  .option("abr-profile", {
    description: "Path to JSON file containing alternative ABR profile"
  })
  .option("s3-copy", {
    type: "boolean",
    description: "If specified, poster file will be pulled from an S3 bucket instead of the local system"
  })
  .option("s3-reference", {
    type: "boolean",
    description: "If specified, poster file will be referenced from an S3 bucket instead of the local system"
  })
  .option("elv-geo", {
    type: "string",
    description: "Geographic region for the fabric nodes. Available regions: na-west-north|na-west-south|na-east|eu-west"
  })
  .demandOption(
    ["library", "masterHash"],
    "\nUsage: PRIVATE_KEY=<private-key> node CreateABRMezzanine.js --library <mezzanine-library-id> --masterHash <production-master-hash> --title <title> --poster <path-to-poster-image> (--variant <variant>) (--metadata '<metadata-json>') (--existingMezzId <object-id>) (--s3-copy || --s3-reference) (--elv-geo eu-west)\n"
  )
  .argv;

const ClientConfiguration = require("../TestConfiguration.json");

const Report = response => {
  if(response.errors.length > 0) {
    console.error("Errors:");
    console.error(response.errors.join("\n"), "\n");
  }

  if(response.warnings.length) {
    console.warn("Warnings:");
    console.warn(response.warnings.join("\n"), "\n");
  }
};

const Create = async ({
  library,
  masterHash,
  type,
  variant,
  offeringKey,
  title,
  poster,
  metadata,
  existingMezzId,
  abrProfile,
  s3Copy,
  s3Reference,
  elvGeo,
  wait=false
}) => {
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

    const access = {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      accessKey: process.env.AWS_KEY,
      secret: process.env.AWS_SECRET
    };

    if(!type && !existingMezzId) {
      const abrMasterType = await client.ContentType({name: "ABR Master"});

      if(!abrMasterType) {
        throw Error("Unable to find content type 'ABR Master'");
      }

      type = abrMasterType.id;
    } else if(type) {
      if(type.startsWith("hq__")) {
        type = await client.ContentType({versionHash: type});
      } else if(type.startsWith("iq__")) {
        type = await client.ContentType({typeId: type});
      } else {
        type = await client.ContentType({name: type});
      }

      if(!type) {
        throw Error(`Unable to find content type '${type}'`);
      }

      type = type.id;
    }

    console.log("\nCreating ABR Mezzanine...");
    const createResponse = await client.CreateABRMezzanine({
      name: title,
      libraryId: library,
      objectId: existingMezzId,
      type,
      masterVersionHash: masterHash,
      variant,
      offeringKey: offeringKey,
      metadata,
      abrProfile,
      access
    });

    Report(createResponse);

    const objectId = createResponse.id;

    if(poster) {
      const {write_token} = await client.EditContentObject({libraryId: library, objectId});

      if(s3Copy || s3Reference) {
        const {region, bucket, accessKey, secret} = access;

        await client.UploadFilesFromS3({
          libraryId: library,
          objectId,
          writeToken: write_token,
          fileInfo: [{
            path: Path.basename(poster),
            source: poster
          }],
          region,
          bucket,
          accessKey,
          secret,
          copy: s3Copy,
        });
      } else {
        const data = fs.readFileSync(poster);

        await client.UploadFiles({
          libraryId: library,
          objectId,
          writeToken: write_token,
          fileInfo: [{
            path: Path.basename(poster),
            type: "file",
            mimeType: mime.lookup(poster) || "image/*",
            size: data.length,
            data
          }]
        });
      }

      await client.CreateLinks({
        libraryId: library,
        objectId,
        writeToken: write_token,
        links: [
          {
            target: Path.basename(poster),
            path: "asset_metadata/components/poster"
          }
        ]
      });

      await client.FinalizeContentObject({libraryId: library, objectId, writeToken: write_token});
    }

    console.log("Starting Mezzanine Job(s)");

    const startResponse = await client.StartABRMezzanineJobs({
      libraryId: library,
      objectId,
      offeringKey,
      access
    });

    Report(startResponse);

    console.log("\nLibrary ID", library);
    console.log("Object ID", objectId);
    console.log("Offering:", offeringKey);
    console.log("Write Token:", startResponse.lro_draft.write_token);
    console.log("Write Node:", startResponse.lro_draft.node, "\n");

    if(!wait) { return; }

    console.log("Progress:");

    // eslint-disable-next-line no-constant-condition
    while(true) {
      const status = await client.LROStatus({libraryId: library, objectId, offeringKey});

      let done = true;
      const progress = Object.keys(status).map(id => {
        const info = status[id];

        if(!info.end) { done = false; }

        if(done && info.run_state !== "finished") {
          throw Error(`LRO ${id} failed with status ${info.run_state}`);
        }

        return `${id}: ${parseFloat(info.progress.percentage || 0).toFixed(1)}%`;
      });

      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);
      process.stdout.write(progress.join(" "));

      if(done) { break; }

      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    const finalizeResponse = await client.FinalizeABRMezzanine({
      libraryId: library,
      objectId,
      offeringKey: offeringKey
    });

    Report(finalizeResponse);

    console.log("\n\nABR mezzanine object created:");
    console.log("\tObject ID:", objectId);
    console.log("\tVersion Hash:", finalizeResponse.hash, "\n");
  } catch(error) {
    console.error("Error creating mezzanine:");
    console.error(error.body ? JSON.stringify(error, null, 2): error);
  }
};

let {
  library,
  masterHash,
  type,
  title,
  poster,
  existingMezzId,
  abrProfile,
  variant,
  offeringKey,
  metadata,
  wait,
  s3Reference,
  s3Copy,
  elvGeo
} = argv;

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  return;
}

if(metadata) {
  try {
    metadata = JSON.parse(metadata);
  } catch(error) {
    console.error("Error parsing metadata:");
    console.error(error);
  }
}

if(abrProfile) {
  abrProfile = JSON.parse(fs.readFileSync(abrProfile));
}

Create({
  library,
  masterHash,
  type,
  variant,
  offeringKey,
  title,
  poster,
  metadata,
  existingMezzId,
  abrProfile,
  s3Copy,
  s3Reference,
  elvGeo,
  wait
});
