/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");
const readline = require("readline");
const Path = require("path");
const mime = require("mime-types");

const yargs = require("yargs");
const argv = yargs
  .option("library", {
    description: "ID of the library in which to create the mezzanine"
  })
  .option("masterHash", {
    description: "Version hash of the master object"
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
  .option("existingMezzId", {
    description: "If re-running the mezzanine process, the ID of an existing mezzanine object"
  })
  .option("s3-copy", {
    type: "boolean",
    description: "If specified, poster file will be pulled from an S3 bucket instead of the local system"
  })
  .option("s3-reference", {
    type: "boolean",
    description: "If specified, poster file will be referenced from an S3 bucket instead of the local system"
  })
  .demandOption(
    ["library", "title", "masterHash"],
    "\nUsage: PRIVATE_KEY=<private-key> node CreateABRMezzanine.js --library <mezzanine-library-id> --masterHash <production-master-hash> --title <title> --poster <path-to-poster-image> (--variant <variant>) (--metadata '<metadata-json>') (--existingMezzId <object-id>) (--s3-copy || --s3-reference)\n"
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

const Create = async (
  mezLibraryId,
  productionMasterHash,
  productionMasterVariant="default",
  title,
  poster,
  metadata,
  existingMezzId
) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
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

    let objectId;
    if(existingMezzId) {
      objectId = existingMezzId;
    } else {
      console.log("\nCreating ABR Mezzanine...");
      const createResponse = await client.CreateABRMezzanine({
        name: title,
        libraryId: mezLibraryId,
        masterVersionHash: productionMasterHash,
        variant: productionMasterVariant,
        metadata,
        access
      });

      Report(createResponse);

      objectId = createResponse.id;
    }

    if(poster) {
      const {write_token} = await client.EditContentObject({libraryId: mezLibraryId, objectId});

      if(s3Copy || s3Reference) {
        const {region, bucket, accessKey, secret} = access;

        await this.UploadFilesFromS3({
          libraryId: mezLibraryId,
          objectId,
          writeToken: write_token,
          filePaths: [poster],
          region,
          bucket,
          accessKey,
          secret,
          copy: s3Copy,
        });
      } else {
        const data = fs.readFileSync(poster);
        const fileInfo = [
          {
            path: Path.basename(poster),
            type: "file",
            mimeType: mime.lookup(poster) || "image/*",
            size: data.length,
            data
          }
        ];

        await client.UploadFiles({
          libraryId: mezLibraryId,
          objectId,
          writeToken: write_token,
          fileInfo
        });
      }

      await client.FinalizeContentObject({libraryId: mezLibraryId, objectId, writeToken: write_token});
    }

    console.log("Starting Mezzanine Job(s)");

    const startResponse = await client.StartABRMezzanineJobs({
      libraryId: mezLibraryId,
      objectId,
      offeringKey: productionMasterVariant,
      access
    });

    Report(startResponse);

    const writeToken = startResponse.writeToken;

    console.log("\nProgress:");

    while(true) {
      const status = await client.ContentObjectMetadata({
        libraryId: mezLibraryId,
        objectId,
        writeToken,
        metadataSubtree: "lro_status"
      });

      let done = true;
      const progress = Object.keys(status).map(id => {
        const info = status[id];

        if(!info.end) { done = false; }

        return `${id}: ${parseFloat(info.progress.percentage || 0).toFixed(1)}%`;
      });

      if(done) { break; }

      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);
      process.stdout.write(progress.join(" "));

      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    const finalizeResponse = await client.FinalizeABRMezzanine({
      libraryId: mezLibraryId,
      objectId,
      writeToken,
      offeringKey: productionMasterVariant
    });

    Report(finalizeResponse);

    console.log("\nABR mezzanine object created:");
    console.log("\tObject ID:", objectId);
    console.log("\tVersion Hash:", finalizeResponse.hash, "\n");
  } catch(error) {
    console.error("Error creating mezzanine:");
    console.error(error.body ? JSON.stringify(error, null, 2): error);
  }
};

let {library, masterHash, title, poster, existingMezzId, variant, metadata, s3Reference, s3Copy} = argv;

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

Create(library, masterHash, variant, title, poster, metadata, existingMezzId, s3Copy, s3Reference);
