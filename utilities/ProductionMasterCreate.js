const fs = require("fs");
const Path = require("path");
const mime = require("mime-types");
const ScriptBase = require("./lib/ScriptBase");

class ProductionMasterCreate extends ScriptBase {

  async body() {
    const client = await this.client();
    const logger = this.logger;

    const libraryId = this.args.libraryId;
    let type = this.args.type;
    let name = this.args.name;
    const title = this.args.title;
    const displayTitle = this.args.displayTitle;
    const slug = this.args.slug;
    let ipTitleId = this.args.ipTitleId;
    // force ipTitleId to be a string, if present
    if(ipTitleId) {
      ipTitleId = ipTitleId.toString();
    }
    let metadata = this.args.metadata;
    const files = this.args.files;
    const encrypt = this.args.encrypt;
    const s3Copy = this.args.s3Copy;
    const s3Reference = this.args.s3Reference;
    const credentials = this.args.credentials;

    let access;
    if(s3Reference || s3Copy) {
      if(credentials) {
        access = JSON.parse(fs.readFileSync(credentials));
      } else {
        if(!process.env.AWS_REGION || !process.env.AWS_BUCKET || !process.env.AWS_KEY || !process.env.AWS_SECRET) {
          throw new Error("Missing required S3 environment variables: AWS_REGION AWS_BUCKET AWS_KEY AWS_SECRET");
        }
        access = [
          {
            path_matchers: [".*"],
            remote_access: {
              protocol: "s3",
              platform: "aws",
              path: process.env.AWS_BUCKET + "/",
              storage_endpoint: {
                region: process.env.AWS_REGION
              },
              cloud_credentials: {
                access_key_id: process.env.AWS_KEY,
                secret_access_key: process.env.AWS_SECRET
              }
            }
          }
        ];
      }
    }

    if(metadata) {
      try {
        if(metadata.startsWith("@")) {
          metadata = fs.readFileSync(metadata.substring(1));
        }

        metadata = JSON.parse(metadata) || {};
        if(!metadata.public) {
          metadata.public = {};
        }

        name = name || metadata.public.name || metadata.name;
      } catch(error) {
        logger.error("Error parsing metadata");
        throw error;
      }
    } else {
      metadata = {public: {asset_metadata: {}}};
    }

    metadata.public.asset_metadata = {
      title,
      ...(metadata.public.asset_metadata || {})
    };

    if(ipTitleId) {
      metadata.public.asset_metadata.ip_title_id = ipTitleId;
    }
    if(displayTitle) {
      metadata.public.asset_metadata.displayTitle = displayTitle;
    }
    if(slug) {
      metadata.public.asset_metadata.slug = slug;
    }

    name = name || title + " MASTER";

    let fileInfo;
    let fileHandles = [];
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
        name,
        description: "Production Master for " + title,
        metadata,
        fileInfo,
        encrypt,
        access,
        copy: s3Copy && !s3Reference,
        callback: progress => {
          if(access) {
            logger.log(progress);
          } else {
            // logger.log();

            Object.keys(progress).sort().forEach(filename => {
              const {uploaded, total} = progress[filename];
              const percentage = total === 0 ? "100.0%" : (100 * uploaded / total).toFixed(1) + "%";

              logger.log(`${filename}: ${percentage}`);
            });
          }
        }
      });

      // Close file handles
      fileHandles.forEach(descriptor => fs.closeSync(descriptor));

      await client.SetVisibility({id, visibility: 0});

      logger.log();
      logger.log("Production master object created:");
      logger.log("  Object ID: " + id);
      logger.data("object_id", id);
      logger.log("  Version Hash: " + hash);
      logger.data("version_hash", hash);
      logger.log();

      if(errors.length > 0) {
        logger.log("Errors:");
        for(const e of errors) {
          logger.error(e);
        }
        logger.log();
      }

      if(warnings.length) {
        logger.log("Warnings:");
        for(const w of warnings) {
          logger.warn(w);
        }
        logger.log();
      }

      // Check if resulting variant has an audio and video stream
      const streams = (await client.ContentObjectMetadata({
        libraryId,
        objectId: id,
        versionHash: hash,
        metadataSubtree: "/production_master/variants/default/streams"
      }));
      if(!streams.hasOwnProperty("audio")) {
        logger.log();
        logger.warn("WARNING: no audio stream found");
        logger.log();
        logger.data("audio_found", false);
      } else {
        logger.data("audio_found", true);
      }

      if(!streams.hasOwnProperty("video")) {
        logger.log();
        logger.warn("WARNING: no video stream found");
        logger.log();
        logger.data("video_found", false);
      } else {
        logger.data("video_found", true);
      }

      logger.data("variant_streams", streams);

      // add info on source files to data if --json selected
      if(this.args.json) {
        // Get source info
        const sources = (await client.ContentObjectMetadata({
          libraryId,
          objectId: id,
          versionHash: hash,
          metadataSubtree: "/production_master/sources"
        }));
        logger.data("media_files", sources);
      }
    } catch(error) {
      logger.error("Unrecoverable error:");
      throw error;
    }
  }

  header() {
    return "Creating Production Master...";
  }

  options() {
    return super.options()
      .option("libraryId", {
        alias: "library-id",
        demandOption: true,
        describe: "ID of the library in which to create the master (should start with 'ilib')",
        type: "string"
      })
      .option("type", {
        demandOption: true,
        description: "Name, object ID, or version hash of the type for the master"
      })
      .option("name", {
        description: "Name for the master object (derived from ipTitleId and title if not specified)"
      })
      .option("title", {
        demandOption: true,
        description: "Title for the asset"
      })
      .option("displayTitle", {
        alias: "display-title",
        description: "Display title for the asset (set to title if not specified)"
      })
      .option("slug", {
        description: "Slug for the master (generated based on title if not specified)"
      })
      .option("ipTitleId", {
        alias: "ip-title-id",
        description: "IP title ID for the master (equivalent to slug if not specified)",
        type: "string"
      })
      .option("metadata", {
        description: "Metadata JSON string (or file path if prefixed with '@') to include in the object metadata",
      })
      .option("files", {
        demandOption: true,
        description: "List of files to upload to the master object",
        type: "array"
      })
      .option("encrypt", {
        conflicts: "s3-reference",
        description: "If specified, files will be encrypted (incompatible with s3Reference)",
        type: "boolean"
      })
      .option("s3Copy", {
        alias: "s3-copy",
        conflicts: "s3-reference",
        description: "If specified, files will be copied from an S3 bucket instead of uploaded from the local filesystem",
        type: "boolean"
      })
      .option("s3Reference", {
        alias: "s3-reference",
        conflicts: "s3-copy",
        type: "boolean",
        description: "If specified, files will be referenced as links to an S3 bucket instead of copied to fabric"
      })
      .option("credentials", {
        type: "string",
        description: "Path to JSON file containing credential sets for files stored in cloud"
      }).usage("\nUsage: PRIVATE_KEY=<private-key> node ProductionMasterCreate.js --libraryId <master-library-id> --type <type> --title <title> --metadata '<metadata-json>' --files <file1> (<file2>...) (--s3-copy || --s3-reference)\n");
  }
}

const script = new ProductionMasterCreate;
script.run();


