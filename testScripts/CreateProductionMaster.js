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
  .option("type", {
    description: "Name, object ID, or version hash of the type for the mezzanine"
  })
  .option("title", {
    description: "Title for the master"
  })
  .option("metadata", {
    description: "Metadata JSON string to include in the object metadata or file path prefixed with '@'"
  })
  .option("files", {
    type: "array",
    description: "List of files to upload to the master object"
  })
  .option("encrypt", {
    type: "boolean",
    description: "If specified, files will be encrypted (local files only)"
  })
  .option("s3-copy", {
    type: "boolean",
    description: "If specified, files will be pulled from an S3 bucket instead of the local system"
  })
  .option("s3-reference", {
    type: "boolean",
    description: "If specified, files will be referenced from an S3 bucket instead of the local system"
  })
  .option("elv-geo", {
    type: "string",
    description: "Geographic region for the fabric nodes. Available regions: na-west-north|na-west-south|na-east|eu-west"
  })
  .option("config-url", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
  })
  .demandOption(
    ["library", "type", "title", "files"],
    "\nUsage: PRIVATE_KEY=<private-key> node CreateProductionMaster.js --library <master-library-id> --title <title> --metadata '<metadata-json>' --files <file1> (<file2>...) (--s3-copy || --s3-reference)\n"
  )
  .argv;
const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]}

const Create = async ({
  elvGeo,
  libraryId,
  type,
  title,
  metadata,
  files,
  encrypt=false,
  access,
  copy=false
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

    let fileInfo;
    let fileHandles=[];
    if(access) {
      fileInfo = files.map(path => ({
        path: Path.basename(path),
        source: path,
      }));
    } else {
      fileInfo = files.map(path => {
        const fileDescriptor = fs.openSync(path, "r");
        fileHandles.push(fileDescriptor);
        const size = fs.fstatSync(fileDescriptor).size;
        const mimeType = mime.lookup(path) || "video/mp4";

        return {
          path: Path.basename(path),
          type: "file",
          mime_type: mimeType,
          size: size,
          data: fileDescriptor
        };
      });
    }

    console.log("\nCreating Production Master");

    console.log(type);
    const originalType = type;
    if(type.startsWith("iq__")) {
      type = await client.ContentType({typeId: type});
    } else if(type.startsWith("hq__")) {
      type = await client.ContentType({versionHash: type});
    } else {
      type = await client.ContentType({name: type});
    }

    if(!type) {
      throw Error(`Unable to find content type "${originalType}"`);
    }

    type = type.hash;

    try {
      const {errors, warnings, id, hash} = await client.CreateProductionMaster({
        libraryId,
        type,
        name: title,
        description: "Production Master for " + title,
        metadata,
        fileInfo,
        encrypt,
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

      // Close file handles
      fileHandles.forEach(descriptor => fs.closeSync(descriptor));

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

let {library, type, title, metadata, files, encrypt, s3Reference, s3Copy, elvGeo} = argv;

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
  if(metadata.startsWith("@")) {
    metadata = fs.readFileSync(metadata.substring(1));
  }

  try {
    metadata = JSON.parse(metadata);
  } catch(error) {
    console.error("Error parsing metadata:");
    console.error(error);
    return;
  }
}

Create({
  elvGeo,
  libraryId: library,
  type,
  title,
  metadata,
  files,
  encrypt,
  access,
  copy: s3Copy && !s3Reference
});
