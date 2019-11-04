/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const Path = require("path");
const mime = require("mime-types");

const yargs = require("yargs");
const argv = yargs
  .option("library", {
    description: "ID of the library in which to create the master"
  })
  .option("title", {
    description: "Title for the master"
  })
  .option("metadata", {
    description: "Metadata JSON string to include in the object metadata"
  })
  .option("files", {
    type: "array",
    description: "List of files to upload to the master object"
  })
  .option("s3-copy", {
    type: "boolean",
    description: "If specified, files will be pulled from an S3 bucket instead of the local system"
  })
  .option("s3-reference", {
    type: "boolean",
    description: "If specified, files will be referenced from an S3 bucket instead of the local system"
  })
  .demandOption(
    ["library", "title", "files"],
    "\nUsage: PRIVATE_KEY=<private-key> node CreateProductionMaster.js --library <master-library-id> --title <title> --metadata '<metadata-json>' --files <file1> (<file2>...) (--s3-copy || --s3-reference)\n"
  )
  .argv;


const ClientConfiguration = require("../TestConfiguration.json");

const Create = async (masterLibraryId, title, metadata, files, access, copy=false) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    let fileInfo;
    if(!access) {
      fileInfo = files.map(path => {
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
        metadata,
        fileInfo,
        filePaths: files,
        access,
        copy,
        callback: progress => {
          if(access) {
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

let {library, title, metadata, files, s3Reference, s3Copy} = argv;

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  return;
}

let access;
if(s3Reference || s3Copy) {
  access = {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
    accessKey: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET
  };

  if(!access.region || !access.bucket || !access.accessKey || !access.secret) {
    console.error("Missing required S3 environment variables: AWS_REGION AWS_BUCKET AWS_KEY AWS_SECRET");
    return;
  }
}

if(metadata) {
  try {
    metadata = JSON.parse(metadata);
  } catch(error) {
    console.error("Error parsing metadata:");
    console.error(error);
    return
  }
}

Create(library, title, metadata, files, access, s3Copy && !s3Reference);
