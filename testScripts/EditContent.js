/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const Path = require("path");
const mime = require("mime-types");

const yargs = require("yargs");
const argv = yargs
  .option("objectId", {
    description: "ID of the object to modify"
  })
  .option("mergeMetadata", {
    type: "array",
    description: "Metadata to merge into the content metadata (--mergeMetadata metadata-subtree 'metadata-json')"
  })
  .option("replaceMetadata", {
    type: "array",
    description: "Metadata to replace in the content metadata (--replaceMetadata metadata-subtree 'metadata-json')"
  })
  .option("deleteMetadata", {
    type: "array",
    description: "Metadata to delete the content metadata (--deleteMetadata metadata-subtree)"
  })
  .option("files", {
    type: "array",
    description: "List of files to upload to the object"
  })
  .option("s3-copy", {
    type: "boolean",
    description: "If specified, files will be pulled from an S3 bucket instead of the local system"
  })
  .option("s3-reference", {
    type: "boolean",
    description: "If specified, files will be referenced from an S3 bucket instead of the local system"
  })
  .option("type", {
    type: "string",
    description: "New type for this object (object ID, version hash or name of type)"
  })
  .option("config-url", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
  })
  .demandOption(
    ["objectId"],
    "\nUsage: PRIVATE_KEY=<private-key> node EditContent --objectId <object-id> --replaceMetadata <subtree> '<metadata-json>'  (--config-url \"<fabric-config-url>\") ..."
  )
  .argv;

const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]};

const EditContent = async ({
  objectId,
  replaceMetadata,
  mergeMetadata,
  deleteMetadata,
  files,
  access,
  s3Reference,
  s3Copy,
  type
}) => {
  const client = await ElvClient.FromConfigurationUrl({
    configUrl: ClientConfiguration["config-url"]
  });

  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });

  client.SetSigner({signer});

  try {
    const libraryId = await client.ContentObjectLibraryId({objectId});

    const {write_token} = await client.EditContentObject({
      libraryId,
      objectId,
      options: {
        type
      }
    });

    while(replaceMetadata && replaceMetadata.length > 0) {
      const metadataSubtree = replaceMetadata.shift() || "";
      let metadata = replaceMetadata.shift() || "";

      if(!metadataSubtree || !metadata) {
        console.error(`Invalid metadata or subtree in replaceMetadata: ${metadataSubtree} ${metadata}`);
        return;
      }

      try {
        metadata = JSON.parse(metadata);
      } catch(error) {
        console.error(`Invalid metadata in replaceMetadata: ${metadata}`);
        console.error(error);
      }

      await client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken: write_token,
        metadataSubtree,
        metadata
      });
    }

    while(mergeMetadata && mergeMetadata.length > 0) {
      const metadataSubtree = mergeMetadata.shift() || "";
      let metadata = mergeMetadata.shift() || "";

      if(!metadataSubtree || !metadata) {
        console.error(`Invalid metadata or subtree in mergeMetadata: ${metadataSubtree} ${metadata}`);
        return;
      }

      try {
        metadata = JSON.parse(metadata);
      } catch(error) {
        console.error(`Invalid metadata in mergeMetadata: ${metadata}`);
        console.error(error);
      }

      await client.MergeMetadata({
        libraryId,
        objectId,
        writeToken: write_token,
        metadataSubtree,
        metadata
      });
    }

    while(deleteMetadata && deleteMetadata.length > 0) {
      const metadataSubtree = deleteMetadata.shift();

      await client.DeleteMetadata({
        libraryId,
        objectId,
        writeToken: write_token,
        metadataSubtree
      });
    }

    if(files) {
      if(access) {
        // S3 Upload
        const {region, bucket, accessKey, secret} = access;

        await client.UploadFilesFromS3({
          libraryId,
          objectId,
          writeToken: write_token,
          filePaths: files,
          region,
          bucket,
          accessKey,
          secret,
          copy: s3Copy && !s3Reference,
          callback: console.log
        });
      } else {
        const fileInfo = files.map(path => {
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

        await client.UploadFiles({
          libraryId,
          objectId,
          writeToken: write_token,
          fileInfo,
          callback: progress => {
            console.log();
            Object.keys(progress).forEach(filename => {
              const percent = (100 * progress[filename].uploaded / progress[filename].total).toFixed(1);
              console.log(`${filename}: ${percent}%`);
            });
          }
        });
      }
    }

    const {hash} = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: write_token
    });

    console.log(`\nSuccessfully created new content version: ${hash}`);
  } catch(error) {
    console.error("Error editing content object:");
    console.error(error);
  }
};

let {objectId, replaceMetadata, mergeMetadata, deleteMetadata, files, s3Reference, s3Copy, type} = argv;

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

EditContent({
  objectId,
  replaceMetadata,
  mergeMetadata,
  deleteMetadata,
  files,
  access,
  s3Reference,
  s3Copy,
  type
});
