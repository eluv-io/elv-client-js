// Create new production master from specified file(s)
const fs = require("fs");
const Path = require("path");
const mime = require("mime-types");

const V = require("./lib/models/Variant");
const Variant = V.Production_Variant;

const {opts, composeOpts} = require("./lib/options");
const ScriptBase = require("./lib/ScriptBase");

class ProductionMasterCreate extends ScriptBase {

  async body() {
    const logger = this.logger;

    const libraryId = this.args.libraryId;
    let type = this.args.type;
    let name = this.args.name;
    const title = this.args.title;
    const displayTitle = this.args.displayTitle;
    const slug = this.args.slug;
    const ipTitleId = this.args.ipTitleId;
    let metadata = this.args.metadata;
    const files = this.args.files;
    const encrypt = this.args.encrypt;
    const s3Copy = this.args.s3Copy;
    const s3Reference = this.args.s3Reference;
    const credentials = this.args.credentials;
    let streams = this.args.streams;

    // initial sanity checking of --streams if present
    if(streams) {
      if(streams.startsWith("@")) {
        streams = fs.readFileSync(streams.substring(1));
      }
      const s = JSON.parse(streams);
      const v = {streams: s};
      streams = Variant(v);
    }

    let access;
    if(s3Reference || s3Copy) {
      if(credentials) {
        access = JSON.parse(fs.readFileSync(credentials));
      } else {
        if(!this.env.AWS_REGION || !this.env.AWS_BUCKET || !this.env.AWS_KEY || !this.env.AWS_SECRET) {
          throw Error("Missing required S3 environment variables: AWS_REGION AWS_BUCKET AWS_KEY AWS_SECRET");
        }
        access = [
          {
            path_matchers: [".*"],
            remote_access: {
              protocol: "s3",
              platform: "aws",
              path: this.env.AWS_BUCKET + "/",
              storage_endpoint: {
                region: this.env.AWS_REGION
              },
              cloud_credentials: {
                access_key_id: this.env.AWS_KEY,
                secret_access_key: this.env.AWS_SECRET
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

    // delay getting elvClient until this point so script exits faster
    // if there is a validation error above
    const client = await this.client();

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
      const createResponse = await client.CreateProductionMaster({
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
      const {errors, warnings, id} = createResponse;
      // Log object id immediately, in case of error later in script
      // Don't log hash yet, it will change if --streams was provided (or any other revision to object is needed)
      logger.data("object_id", id);

      let hash = createResponse.hash;

      // Close file handles
      fileHandles.forEach(descriptor => fs.closeSync(descriptor));

      await client.SetVisibility({id, visibility: 0});

      if(errors.length > 0) {
        logger.log("Errors:");
        logger.error_list(errors);
        logger.log();
      }

      if(warnings.length) {
        logger.log("Warnings:");
        logger.warn_list(warnings);
        logger.log();
      }

      // was stream info supplied at command line?
      if(streams) {
        // replace variant stream info
        const {write_token} = await client.EditContentObject(
          {
            libraryId,
            objectId: id
          }
        );

        await client.ReplaceMetadata({
          libraryId,
          objectId: id,
          writeToken: write_token,
          metadata: streams,
          metadataSubtree: "/production_master/variants/default"
        });

        const finalizeResponse = await client.FinalizeContentObject({
          libraryId,
          objectId: id,
          writeToken: write_token
        });
        hash = finalizeResponse.hash;
      }

      logger.log_list([
        "",
        "Production master object created:",
        `  Object ID: ${id}`,
        `  Version Hash: ${hash}`,
        ""
      ]);

      logger.data("version_hash", hash);

      if(!streams) {
        // Check if resulting variant has an audio and video stream
        const streamsFromServer = (await client.ContentObjectMetadata({
          libraryId,
          objectId: id,
          versionHash: hash,
          metadataSubtree: "/production_master/variants/default/streams"
        }));
        if(!streamsFromServer.hasOwnProperty("audio")) {
          logger.log();
          logger.warn("WARNING: no audio stream found");
          logger.log();
          logger.data("audio_found", false);
        } else {
          logger.data("audio_found", true);
        }

        if(!streamsFromServer.hasOwnProperty("video")) {
          logger.log();
          logger.warn("WARNING: no video stream found");
          logger.log();
          logger.data("video_found", false);
        } else {
          logger.data("video_found", true);
        }
        logger.data("variant_streams", streamsFromServer);
      }

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
    return composeOpts(
      super.options(),
      opts.libraryId({demandOption: true, forX: "new production master"}),
      opts.name({forX: "new production master object (derived from ipTitleId and title if not specified)"}),
      opts.type({demand: true, forX: "new production master"}),
      opts.title({demand: true}),
      opts.displayTitle(),
      opts.slug(),
      opts.ipTitleId(),
      opts.metadata({ofX: "production master object"}),
      opts.files({demand: true, forX: "for new production master"}),
      opts.encrypt({X: "uploaded files"}),
      opts.streams({forX: "variant in new production master"}),
      opts.s3Copy(),
      opts.s3Reference(),
      opts.credentials()
    );
  }

  OptionsChecks() {
    const inherited = super.OptionsChecks();
    inherited.push(
      (argv) => {
        if(argv.credentials) {
          if(!argv.s3Copy && !argv.s3Reference) {
            throw Error("--credentials supplied but neither --s3Copy nor --s3Reference specified");
          }
        }
        return true; // tell Yargs that the arguments passed the check
      }
    );
    return inherited;
  }
}

if(require.main === module) {
  const script = new ProductionMasterCreate;
  script.run();
} else {
  module.exports = ProductionMasterCreate;
}