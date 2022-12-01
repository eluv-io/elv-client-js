// Create a new mezzanine and start jobs
const R = require("ramda");

const {seconds} = require("./lib/helpers");
const {ModOpt, NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const preFinalizeFn = require("./lib/misc/codecDescPrefinalizeFn");

const ArgAddlOfferingSpecs = require("./lib/concerns/ArgAddlOfferingSpecs");
const ArgAssetMetadata = require("./lib/concerns/ArgAssetMetadata");
const ArgMetadata = require("./lib/concerns/ArgMetadata");
const ArgObjectId = require("./lib/concerns/ArgObjectId");
const ArgType = require("./lib/concerns/ArgType");
const Client = require("./lib/concerns/Client");
const CloudAccess = require("./lib/concerns/CloudAccess");
const ContentType = require("./lib/concerns/ContentType");
const FabricObject = require("./lib/concerns/FabricObject");
const Finalize = require("./lib/concerns/Finalize");
const JSON = require("./lib/concerns/JSON");
const LRO = require("./lib/concerns/LRO");

const chkLibraryPresent = (argv) => {
  if(!argv.existingMezId && !argv.libraryId) {
    throw Error("--libraryId must be supplied unless --existingMezId is present");
  }
  return true;
};

const chkTypePresent = (argv) => {
  if(!argv.existingMezId && !argv.type) {
    throw Error("--type must be supplied unless --existingMezId is present");
  }
  return true;
};

const chkTitlePresent = (argv) => {
  if(!argv.existingMezId && !argv.title) {
    throw Error("--title must be supplied unless --existingMezId is present");
  }
  return true;
};

class MezzanineCreate extends Utility {
  blueprint() {
    return {
      concerns: [
        ArgAddlOfferingSpecs,
        ArgAssetMetadata,
        ArgMetadata,
        ArgObjectId,
        ArgType,
        Client,
        CloudAccess,
        ContentType,
        FabricObject,
        Finalize,
        JSON,
        LRO
      ],
      options: [
        ModOpt("libraryId", {forX: "mezzanine"}),
        ModOpt("objectId", {
          alias: ["existingMezId", "existing-mez-id"],
          demand: false,
          descTemplate: "Create the offering in existing mezzanine object with specified ID",
        }),
        NewOpt("keepOtherOfferings", {
          descTemplate: "Preserve existing offerings stored under keys different than the current one (when using a pre-existing object for mezzanine)",
          implies: "existingMezId",
          type: "boolean"
        }),
        NewOpt("keepOtherStreams", {
          descTemplate: "Preserve existing streams other than the ones currently being generated (when using a pre-existing object for mezzanine, and the offering key already exists)",
          implies: "existingMezId",
          type: "boolean"
        }),
        ModOpt("type", {forX: "mezzanine"}),
        ModOpt("metadata", {ofX: "mezzanine object"}),
        ModOpt("name", {ofX: "mezzanine object (set to title + ' MEZ' if not supplied and --existingMezId and --metadata not specified)"}),
        NewOpt("masterHash", {
          demand: true,
          descTemplate: "Version hash of the master object",
          type: "string"
        }),
        NewOpt("offeringKey", {
          default: "default",
          descTemplate: "Key to assign to new offering",
          type: "string"
        }),
        NewOpt("variantKey", {
          default: "default",
          descTemplate: "Variant to use from production master",
          type: "string"
        }),
        NewOpt("wait", {
          descTemplate: "Wait for mezzanine to finish transcoding, then finalize before exiting script (not recommended except for very short titles)",
          type: "boolean"
        }),
        NewOpt("abrProfile", {
          descTemplate: "Path to JSON file containing ABR profile with transcoding parameters and resolution ladders (if omitted, will be read from library metadata)",
          normalize: true,
          type: "string"
        })
      ],
      checksMap: {chkTypePresent, chkTitlePresent, chkLibraryPresent}
    };
  }

  async body() {
    const logger = this.logger;

    const {
      existingMezId,
      keepOtherOfferings,
      keepOtherStreams,
      masterHash,
      offeringKey
    } = this.args;

    // do steps that don't require network access first
    // ----------------------------------------------------
    const abrProfile = this.args.abrProfile
      ? this.concerns.JSON.parseFile({path: this.args.abrProfile})
      : undefined;

    const metadataFromArg = this.concerns.ArgMetadata.asObject() || {};

    const addlOfferingSpecsFromArg = this.concerns.ArgAddlOfferingSpecs.asObject() || undefined;

    let access = this.concerns.CloudAccess.credentialSet(false);

    // operations that may need to wait on network access
    // ----------------------------------------------------
    if(existingMezId) await this.concerns.ArgObjectId.argsProc();
    const {libraryId} = this.args;

    const client = await this.concerns.Client.get();
    let existingPublicMetadata = {};
    if(existingMezId) {
      logger.log(`Retrieving metadata from existing mezzanine object ${existingMezId}...`);
      existingPublicMetadata = (await this.concerns.FabricObject.metadata({
        libraryId,
        objectId: existingMezId,
        subtree: "public"
      })) || {};
    }

    if(!existingPublicMetadata.asset_metadata) existingPublicMetadata.asset_metadata = {};

    const mergedExistingAndArgMetadata = R.mergeDeepRight(
      {public: existingPublicMetadata},
      metadataFromArg
    );

    const newPublicMetadata = this.concerns.ArgAssetMetadata.publicMetadata({
      oldPublicMetadata: mergedExistingAndArgMetadata.public,
      backupNameSuffix: "MEZ"
    });

    const metadata = R.mergeDeepRight(
      metadataFromArg,
      {public: newPublicMetadata}
    );

    const type = (existingMezId && !this.args.type)
      ? await this.concerns.ContentType.forItem({libraryId, objectId: existingMezId})
      : await this.concerns.ArgType.typVersionHash();

    if(existingMezId) {
      logger.log("Updating existing mezzanine object...");
    } else {
      logger.log("Creating new mezzanine object...");
    }

    const createResponse = await client.CreateABRMezzanine({
      name: metadata.public.name,
      libraryId,
      objectId: existingMezId,
      type,
      masterVersionHash: masterHash,
      variant: this.args.variantKey,
      offeringKey,
      metadata,
      addlOfferingSpecs: addlOfferingSpecsFromArg,
      abrProfile,
      keepOtherOfferings,
      keepOtherStreams
    });

    logger.errorsAndWarnings(createResponse);

    const objectId = createResponse.id;

    logger.log("Starting Mezzanine Job(s)");

    const startResponse = await client.StartABRMezzanineJobs({
      libraryId,
      objectId,
      offeringKey,
      access
    });

    logger.errorsAndWarnings(startResponse);

    const lroWriteToken = R.path(["lro_draft", "write_token"], startResponse);
    const lroNode = R.path(["lro_draft", "node"], startResponse);

    logger.data("library_id", libraryId);
    logger.data("object_id", objectId);
    logger.data("offering_key", offeringKey);
    logger.data("write_token", lroWriteToken);
    logger.data("write_node", lroNode);

    logger.logList(
      "",
      `Library ID: ${libraryId}`,
      `Object ID: ${objectId}`,
      `Offering: ${offeringKey}`,
      `Write Token: ${lroWriteToken}`,
      `Write Node: ${lroNode}`,
      ""
    );

    if(!this.args.wait) return;

    logger.log("Progress:");

    const lro = this.concerns.LRO;
    let done = false;
    let lastStatus;
    while(!done) {
      const statusMap = await lro.status({
        libraryId,
        objectId,
        offeringKey
      });
      const statusSummary = lro.statusSummary(statusMap);
      lastStatus = statusSummary.run_state;
      if(lastStatus !== LRO.STATE_RUNNING) done = true;
      logger.log(`run_state: ${lastStatus}`);
      const eta = statusSummary.estimated_time_left_h_m_s;
      if(eta) logger.log(`estimated time left: ${eta}`);
      await seconds(15);
    }

    const finalizeAbrResponse = await client.FinalizeABRMezzanine({
      libraryId,
      objectId,
      offeringKey,
      preFinalizeFn, // Before object is finalized, try to set codec descriptors
    });
    const latestHash = finalizeAbrResponse.hash;

    logger.errorsAndWarnings(finalizeAbrResponse);
    logger.logList(
      "",
      "ABR mezzanine object created:",
      `  Object ID: ${objectId}`,
      `  Version Hash: ${latestHash}`,
      ""
    );
    logger.data("version_hash", latestHash);
    await this.concerns.Finalize.waitForPublish({
      latestHash,
      libraryId,
      objectId
    });
  }

  header() {
    return `Create Mezzanine default offering for master ${this.args.masterHash}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(MezzanineCreate);
} else {
  module.exports = MezzanineCreate;
}
