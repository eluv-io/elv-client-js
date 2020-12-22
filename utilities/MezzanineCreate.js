// Create a new mezzanine and start jobs
const fs = require("fs");

const R = require("ramda");
const slugify = require("@sindresorhus/slugify");
const countableSlugify = slugify.counter();

const {opts, composeOpts, newOpt} = require("./lib/options");
const ScriptBase = require("./lib/ScriptBase");


class MezzanineCreate extends ScriptBase {
  async body() {
    const client = await this.client();
    const logger = this.logger;

    const libraryId = this.args.libraryId;
    const masterHash = this.args.masterHash;
    const argAssetMetadata = this.args.assetMetadata;
    const argType = this.args.type;
    const argName = this.args.name;
    const argTitle = this.args.title;
    const argDisplayTitle = this.args.displayTitle;
    const argSlug = this.args.slug;
    const argIpTitleId = this.args.ipTitleId;
    let argMetadata = this.args.metadata;
    const variant = this.args.variant;
    const offeringKey = this.args.offeringKey;
    const existingMezId = this.args.existingMezId;
    const argAbrProfile = this.args.abrProfile;
    const credentials = this.args.credentials;
    const wait = this.args.wait;

    let existingPublicMetadata = {};

    if(existingMezId) {
      existingPublicMetadata = (await client.ContentObjectMetadata({
        libraryId,
        objectId: existingMezId,
        metadataSubtree: "public"
      })) || {};
    }

    if(!existingPublicMetadata.asset_metadata) {
      existingPublicMetadata.asset_metadata = {};
    }

    const existingName = existingPublicMetadata.name;

    const {
      existingTitle,
      existingDisplayTitle,
      existingSlug,
      existingIpTitleId
    } = existingPublicMetadata.asset_metadata;

    const abrProfile = argAbrProfile
      ? JSON.parse(fs.readFileSync(argAbrProfile))
      : undefined;

    let suppliedMetadata = {};
    if(argMetadata) {
      if(argMetadata.startsWith("@")) {
        argMetadata = fs.readFileSync(argMetadata.substring(1));
      }
      try {
        suppliedMetadata = JSON.parse(argMetadata) || {};
      } catch(error) {
        logger.error("Error parsing metadata:");
        throw error;
      }
    }
    if(!suppliedMetadata.public) {
      suppliedMetadata.public = {};
    }
    if(!suppliedMetadata.public.asset_metadata) {
      suppliedMetadata.public.asset_metadata = {};
    }

    // apply --assetMetadata.FIELD_NAME arg(s), if any
    if(argAssetMetadata) {
      suppliedMetadata = R.mergeDeepRight(
        suppliedMetadata,
        {public: {asset_metadata: argAssetMetadata}}
      );
    }

    const suppliedName = suppliedMetadata.public.name || suppliedMetadata.name;
    const {
      suppliedTitle,
      suppliedSlug,
      suppliedDisplayTitle,
      suppliedIpTitleId
    } = suppliedMetadata.public.asset_metadata;

    const title = argTitle || suppliedTitle || existingTitle;
    if(!title) {
      throw Error("--title not provided and could not derive from other arguments or existing mezzanine object");
    }

    // Fill in missing values
    // Precedence:
    //  1: present as arg at command line (other than via --assetMetadata.FIELD_NAME)
    //  1: present as arg at command line via --assetMetadata.FIELD_NAME (handled by R.mergeDeepRight above)
    //  2: supplied in --metadata
    //  3: pre-existing value (if --existingMezId specified)
    //  4: derive from other values

    const display_title = argDisplayTitle
      || suppliedDisplayTitle
      || existingDisplayTitle
      || title;

    const slug = argSlug
      || suppliedSlug
      || existingSlug
      || countableSlugify(display_title);

    const name = argName
      || suppliedName
      || existingName
      || `${title} MEZ`;

    const ip_title_id = argIpTitleId
      || suppliedIpTitleId
      || existingIpTitleId
      || slug;

    const metadata = R.mergeDeepRight(
      R.mergeDeepRight(
        {public: existingPublicMetadata},
        suppliedMetadata
      ),
      {
        public: {
          asset_metadata: {
            title,
            display_title,
            slug,
            ip_title_id
          },
          name: name
        }
      }
    );

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

    let type = null;
    if(argType) {
      if(argType.startsWith("iq__")) {
        type = await client.ContentType({typeId: argType});
      } else if(argType.startsWith("hq__")) {
        type = await client.ContentType({versionHash: argType});
      } else {
        type = await client.ContentType({name: argType});
      }
      if(!type) {
        throw Error(`Unable to find content type "${argType}"`);
      }
      type = type.hash;
    }

    const createResponse = await client.CreateABRMezzanine({
      name,
      libraryId,
      objectId: existingMezId,
      type,
      masterVersionHash: masterHash,
      variant,
      offeringKey,
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

    const lroWriteToken = R.path(["lro_draft", "write_token"], startResponse);
    const lroNode = R.path(["lro_draft", "node"], startResponse);

    logger.data("library_id", libraryId);
    logger.data("object_id", objectId);
    logger.data("offering_key", offeringKey);
    logger.data("write_token", lroWriteToken);
    logger.data("write_node", lroNode);

    logger.log_list([
      "",
      `Library ID: ${libraryId}`,
      `Object ID: ${objectId}`,
      `Offering: ${offeringKey}`,
      `Write Token: ${lroWriteToken}`,
      `Write Node: ${lroNode}`,
      ""
    ]);

    if(!wait) {
      return;
    }

    logger.log("Progress:");

    // eslint-disable-next-line no-constant-condition
    while(true) {
      const status = await client.LROStatus({
        libraryId,
        objectId,
        offeringKey
      });

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

    logger.log_list([
      "",
      "ABR mezzanine object created:",
      `  Object ID: ${objectId}`,
      `  Version Hash: ${finalizeResponse.hash}`,
      ""
    ]);

    logger.data("version_hash", finalizeResponse.hash);
  }

  header() {
    return "Creating Mezzanine...";
  }

  options() {
    return composeOpts(
      super.options(),
      opts.libraryId({demandOption: true, forX: "mezzanine"}),
      opts.name({ofX: "mezzanine object (set to title + ' MEZ' if not supplied and --existingMezId and --metadata not specified)"}),
      opts.type({forX: "mezzanine"}),
      opts.title(),
      opts.displayTitle(),
      opts.slug(),
      opts.ipTitleId(),
      opts.metadata({ofX: "mezzanine object"}),
      opts.assetMetadata(),
      opts.credentials(),
      opts.offeringKey({X: "to assign to new offering"}),
      opts.variantKey({X: "to use from production master"}),
      newOpt("masterHash", {
        demand: true,
        description: "Version hash of the master object",
        type: "string"
      }),
      newOpt("existingMezId", {
        description: "Create the offering in existing mezzanine object with specified ID",
        type: "string"
      }),
      newOpt("abrProfile", {
        description: "Path to JSON file containing ABR profile with transcoding parameters and resolution ladders (if omitted, will be read from library metadata)",
        normalize: true,
        type: "string"
      }),
      newOpt("wait", {
        description: "Wait for mezzanine to finish transcoding, then finalize before exiting script (not recommended except for very short titles)",
        type: "boolean"
      })
    );
  }

  OptionsChecks() {
    const inherited = super.OptionsChecks();
    inherited.push(
      (argv) => {
        if(!argv.existingMezId) {
          if(!argv.type) {
            throw Error("--type must be supplied unless --existingMezId is present");
          }
          if(!argv.title) {
            throw Error("--title must be supplied unless --existingMezId is present");
          }
        }
        return true; // tell Yargs that the arguments passed the check
      }
    );
    return inherited;
  }

  report({warnings, errors}) {
    const logger = this.logger;
    if(warnings.length) {
      logger.log("Warnings:");
      logger.warn_list(warnings);
      logger.log();
    }

    if(errors.length > 0) {
      logger.log("Errors:");
      logger.error_list(errors);
      logger.log();
    }
  }
}

const script = new MezzanineCreate;
script.run();
