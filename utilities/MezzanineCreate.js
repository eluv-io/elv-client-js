// Create a new mezzanine and start jobs
const R = require("ramda");

const {seconds} = require("./lib/helpers");
const {ModOpt, NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Asset = require("./lib/concerns/Asset");
const Client = require("./lib/concerns/Client");
const CloudAccess = require("./lib/concerns/CloudAccess");
const ContentType = require("./lib/concerns/ContentType");
const ExistingObject = require("./lib/concerns/ExistingObject");
const Finalization = require("./lib/concerns/Finalization");
const Metadata = require("./lib/concerns/Metadata");
const JSON = require("./lib/concerns/JSON");
const LRO =  require("./lib/concerns/LRO");

const checkLibraryPresent = (argv) => {
  if(!argv.existingMezId && !argv.libraryId) {
    throw Error("--libraryId must be supplied unless --existingMezId is present");
  }
  return true;
};

const checkTypePresent = (argv) => {
  if(!argv.existingMezId && !argv.type) {
    throw Error("--type must be supplied unless --existingMezId is present");
  }
  return true;
};

const checkTitlePresent = (argv) => {
  if(!argv.existingMezId && !argv.title) {
    throw Error("--title must be supplied unless --existingMezId is present");
  }
  return true;
};

class MezzanineCreate extends Utility {
  blueprint() {
    return {
      concerns: [
        Asset,
        Client,
        CloudAccess,
        ContentType,
        ExistingObject,
        Finalization,
        JSON,
        LRO,
        Metadata
      ],
      options: [
        ModOpt("libraryId", {forX: "mezzanine"}),
        ModOpt("objectId", {
          alias: ["existingMezId","existing-mez-id"],
          demand: false,
          descTemplate: "Create the offering in existing mezzanine object with specified ID",
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
      checksMap: {checkTypePresent, checkTitlePresent, checkLibraryPresent} // TODO: change to list of commands NewCheck()
    };
  }

  async body() {
    const logger = this.logger;
    const J = this.concerns.JSON;
    const lro = this.concerns.LRO;

    const {existingMezId, offeringKey, masterHash} = this.args;

    // do steps that don't require network access first
    // ----------------------------------------------------
    const abrProfile = this.args.abrProfile
      ? J.parseFile(this.args.abrProfile)
      : undefined;

    let metadataFromArg;
    if(this.args.metadata) {
      metadataFromArg = this.concerns.Metadata.asObject();
    } else {
      metadataFromArg = {};
    }

    let access = this.concerns.CloudAccess.access(false);

    // operations that need to wait on network access
    // ----------------------------------------------------
    const client = await this.concerns.Client.get();
    const libraryId = await this.concerns.ExistingObject.libraryIdGet();

    let existingPublicMetadata = {};
    if(existingMezId) {
      logger.log("Retrieving metadata from existing mezzanine object...");
      existingPublicMetadata = (await this.concerns.ExistingObject.readMetadata({
        libraryId,
        objectId: existingMezId,
        metadataSubtree: "public"
      })) || {};
    }

    if(!existingPublicMetadata.asset_metadata) {
      existingPublicMetadata.asset_metadata = {};
    }

    const mergedExistingAndArgMetadata = R.mergeRight(
      {public: existingPublicMetadata},
      metadataFromArg
    );

    const newPublicMetadata = this.concerns.Asset.publicMetadata(mergedExistingAndArgMetadata.public, "MEZ");

    const metadata = R.mergeDeepRight(
      metadataFromArg,
      {public: newPublicMetadata}
    );

    const type = (existingMezId && !this.args.type)
      ? await this.concerns.ContentType.getForObject({libraryId, objectId: existingMezId})
      : await this.concerns.ContentType.hashLookup();

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
      abrProfile
    });

    logger.errorsAndWarnings(createResponse);

    const objectId = createResponse.id;
    await client.SetVisibility({id: objectId, visibility: 0});

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

    if(!this.args.wait) {
      return;
    }

    logger.log("Progress:");

    let done = false;
    let lastStatus;

    while(!done) {

      const statusMap = await lro.status({libraryId, objectId}); // TODO: check how offering key is used, if at all
      const statusSummary =  lro.statusSummary(statusMap);
      lastStatus = statusSummary.run_state;
      if(lastStatus !== LRO.STATE_RUNNING) done = true;
      logger.log(`run_state: ${lastStatus}`);
      const eta = statusSummary.estimated_time_left_h_m_s;
      if(eta) logger.log(`estimated time left: ${eta}`);
      await seconds(15);
    }

    const finalizeResponse = await client.FinalizeABRMezzanine({
      libraryId,
      objectId,
      offeringKey
    });
    const latestHash = finalizeResponse.hash;

    logger.errorsAndWarnings(finalizeResponse);
    logger.logList(
      "",
      "ABR mezzanine object created:",
      `  Object ID: ${objectId}`,
      `  Version Hash: ${latestHash}`,
      ""
    );
    logger.data("version_hash", latestHash);
    await this.concerns.Finalization.waitOrNot({
      libraryId,
      objectId,
      latestHash
    });
  }

  header() {
    return "Create Mezzanine default offering for master " + this.args.masterHash + "...";
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(MezzanineCreate);
} else {
  module.exports = MezzanineCreate;
}