const fs = require("fs");

const ScriptBase = require("./lib/ScriptBase");

const Slugify = str =>
  (str || "").toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "");


class MezzanineCreate extends ScriptBase {
  async body() {
    const client = await this.client();
    const logger = this.logger;

    const libraryId = this.args.libraryId;
    const masterHash = this.args.masterHash;
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
    const titleType = this.args.titleType;
    const assetType = this.args.assetType;
    let metadata = this.args.metadata;
    const variant = this.args.variant;
    const offeringKey = this.args.offeringKey;
    const existingMezId = this.args.existingMezId;
    let abrProfile = this.args.abrProfile;
    const credentials = this.args.credentials;
    const wait = this.args.wait;

    if(!existingMezId && !title) {
      throw Error("--title argument is required unless --existingMezId is specified");
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
        logger.error("Error parsing metadata:");
        throw error;
      }
    } else if(existingMezId) {
      const assetMetadata = (await client.ContentObjectMetadata({
        libraryId,
        objectId: existingMezId,
        metadataSubtree: "public/asset_metadata"
      })) || {};

      const existingName = (await client.ContentObjectMetadata({
        libraryId,
        objectId: existingMezId,
        metadataSubtree: "public/name"
      })) || {};

      metadata = {
        public: {
          asset_metadata: assetMetadata || {},
          name: name || existingName || ""
        }
      };

      if(!title && !metadata.public.asset_metadata.title) {
        throw Error("Existing mez does not have 'title' set and title argument was not provided");
      }
    } else {
      metadata = {public: {asset_metadata: {}}};
    }

    if(abrProfile) {
      abrProfile = JSON.parse(fs.readFileSync(abrProfile));
    }

    metadata.public.asset_metadata = {
      title,
      display_title: displayTitle || title,
      slug: slug || Slugify(displayTitle || title),
      ip_title_id: ipTitleId || slug || Slugify(displayTitle || title),
      title_type: titleType,
      asset_type: assetType,
      ...(metadata.public.asset_metadata || {})
    };

    name = name || metadata.public.name || metadata.public.asset_metadata.title + " MEZ";

    let access;
    if(credentials) {
      access = JSON.parse(fs.readFileSync(credentials));
    } else {
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

    const createResponse = await client.CreateABRMezzanine({
      name,
      libraryId,
      objectId: existingMezId,
      type,
      masterVersionHash: masterHash,
      variant,
      offeringKey: offeringKey,
      metadata,
      abrProfile
    });

    this.report(createResponse);

    const objectId = createResponse.id;
    await client.SetVisibility({id: objectId, visibility: 0});

    logger.log("Starting Mezzanine Job(s)");

    const startResponse = await client.StartABRMezzanineJobs({
      libraryId,
      objectId,
      offeringKey,
      access
    });

    this.report(startResponse);

    logger.log();
    logger.log("Library ID: ", libraryId);
    logger.data("library_id", libraryId);

    logger.log("Object ID", objectId);
    logger.data("object_id", objectId);

    logger.log("Offering:", offeringKey);
    logger.data("offering_key", offeringKey);

    logger.log("Write Token:", startResponse.lro_draft.write_token);
    logger.data("write_token", startResponse.lro_draft.write_token);

    logger.log("Write Node:", startResponse.lro_draft.node);
    logger.data("write_node", startResponse.lro_draft.node);
    logger.log();

    if(!wait) {
      return;
    }

    logger.log("Progress:");

    // eslint-disable-next-line no-constant-condition
    while(true) {
      const status = await client.LROStatus({libraryId: libraryId, objectId, offeringKey});

      let done = true;
      const progress = Object.keys(status).map(id => {
        const info = status[id];

        if(!info.end) {
          done = false;
        }

        if(done && info.run_state !== "finished") {
          throw Error(`LRO ${id} failed with status ${info.run_state}`);
        }

        return `${id}: ${parseFloat(info.progress.percentage || 0).toFixed(1)}%`;
      });

      logger.log(progress.join(" "));

      if(done) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    const finalizeResponse = await client.FinalizeABRMezzanine({
      libraryId,
      objectId,
      offeringKey: offeringKey
    });

    this.report(finalizeResponse);

    logger.log();
    logger.log("ABR mezzanine object created:");
    logger.log("  Object ID:", objectId);
    logger.log("  Version Hash:", finalizeResponse.hash);
    logger.data("version_hash", finalizeResponse.hash);
    logger.log();
  }


  header() {
    return "Creating Mezzanine...";
  }

  options() {
    return super.options()
      .option("libraryId", {
        alias: "library-id",
        demandOption: true,
        description: "ID of the library in which to create the mezzanine"
      })
      .option("masterHash", {
        alias: "master-hash",
        demandOption: true,
        description: "Version hash of the master object"
      })
      .option("type", {
        demandOption: true,
        description: "Name, object ID, or version hash of the type for the mezzanine",
        type: "string"
      })
      .option("name", {
        description: "Name for the mezzanine object (derived from ip-title-id and title if not provided)",
        type: "string"
      })
      .option("title", {
        description: "Title for the mezzanine",
        type: "string"
      })
      .option("displayTitle", {
        alias: "display-title",
        description: "Display title for the mezzanine (set to title if not specified)",
        type: "string"
      })
      .option("slug", {
        description: "Slug for the mezzanine (generated based on title if not specified)",
        type: "string"
      })
      .option("ipTitleId", {
        alias: "ip-title-id",
        description: "IP title ID for the mezzanine (equivalent to slug if not specified)",
        type: "string"
      })
      .option("titleType", {
        alias: "title-type",
        description: "Title type for the mezzanine",
        default: "title",
        type: "string"
      })
      .option("assetType", {
        alias: "asset-type",
        description: "Asset type for the mezzanine",
        default: "primary",
        type: "string"
      })
      .option("metadata", {
        description: "Metadata JSON string (or file path if prefixed with '@') to include in the object metadata",
        type: "string"
      })
      .option("variant", {
        description: "Variant of the mezzanine",
        default: "default",
        type: "string"
      })
      .option("offeringKey", {
        alias: "offering-key",
        description: "Offering key for the new mezzanine",
        default: "default",
        type: "string"
      })
      .option("existingMezId", {
        alias: "existing-mez-id",
        description: "If re-running the mezzanine process, the ID of an existing mezzanine object",
        type: "string"
      })
      .option("abrProfile", {
        alias: "abr-profile",
        description: "Path to JSON file containing alternative ABR profile",
        type: "string"
      })
      .option("credentials", {
        description: "Path to JSON file containing credential sets for files stored in cloud",
        type: "string"
      })
      .option("wait", {
        description: "Wait for mezzanine to finish transcoding, then finalize before exiting script",
        type: "boolean"
      })
      .usage("\nUsage: PRIVATE_KEY=<private-key> node MezzanineCreate.js --libraryId <mezzanine-library-id> --masterHash <production-master-hash> --title <title> (--variant <variant>) (--metadata '<metadata-json>') (--existingMezId <object-id>) (--elv-geo eu-west)\n");
  }

  report({errors, warnings}) {
    if(errors.length > 0) {
      this.logger.log("Errors:");
      for(const e of errors) {
        this.logger.error(e);
      }
      this.logger.log();
    }

    if(warnings.length) {
      this.logger.log("Warnings:");
      for(const w of warnings) {
        this.logger.warn(w);
      }
      this.logger.log();
    }
  }
}

const script = new MezzanineCreate;
script.run();
