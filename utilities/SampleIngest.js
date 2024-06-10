// Create new production master from specified file(s)
const R = require("ramda");

const {ModOpt, NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ABR = require("@eluvio/elv-abr-profile");

const Client = require("./lib/concerns/Client");
const Finalize = require("./lib/concerns/Finalize");
const LocalFile = require("./lib/concerns/LocalFile");
const LRO = require("./lib/concerns/LRO");
const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const ArgTenant = require("./lib/concerns/ArgTenant");
const {seconds} = require("./lib/helpers");
const AbrProfile = require("./lib/abr_profiles/abr_profile_clear.json");

class SampleIngest extends Utility {
  blueprint() {
    return {
      concerns: [Client, Finalize, LocalFile, ArgLibraryId, ArgTenant, LRO],
      options: [
        ModOpt("libraryId", {demand: true, forX: "new media object"}),
        NewOpt("title", {
          demand: true,
          descTemplate: "Title for new media object",
          type: "string"
        }),
        NewOpt("drm", {
          default: false,
          descTemplate: "Use DRM for playback",
          type: "boolean"
        }),
        ModOpt("files", {forX: "for new media object"})
      ]
    };
  }

  async body() {
    const logger = this.logger;

    let fileHandles = [];
    const fileInfo = this.concerns.LocalFile.fileInfo(fileHandles);

    // delay getting elvClient until this point so script exits faster
    // if there is a validation error above
    const client = await this.concerns.Client.get();

    // get metadata from Library
    const libInfo = await this.concerns.ArgLibraryId.libInfo();

    // get type from Tenant
    const tenantInfo = await this.concerns.ArgTenant.tenantInfo();

    const type = tenantInfo.typeTitle;

    if(R.isNil(type)) throw Error("Library does not specify content type for sample ingests");

    const libMezManageGroups = R.path(["metadata", "abr", "mez_manage_groups"], libInfo);

    const {drm, libraryId, title} = this.args;
    const encrypt = true;

    const {id, writeToken} = await client.CreateContentObject({
      libraryId,
      options: type ? { type } : {}
    });

    logger.log("Uploading files...");

    const createMasterResponse = await client.CreateProductionMaster({
      libraryId,
      type,
      name: title,
      description: `Media object created via sample ingest: ${title}`,
      fileInfo,
      encrypt,
      copy: true,
      callback: this.concerns.LocalFile.callback,
      writeToken
    });

    // Log object id immediately, in case of error later in script
    // Don't log hash yet, it will change if --streams was provided (or any other revision to object is needed)
    logger.data("object_id", id);

    // Close file handles (if any)
    this.concerns.LocalFile.closeFileHandles(fileHandles);

    logger.errorsAndWarnings(createMasterResponse);

    logger.logList(
      "",
      "Production master default variant created:",
      `  Object ID: ${id}`,
      ""
    );

    if(!R.isNil(createMasterResponse.errors) && !R.isEmpty(createMasterResponse.errors)) throw Error(`Error(s) encountered while inspecting uploaded files: ${createMasterResponse.errors.join("\n")}`);

    // get production master metadata
    const masterMetadata = (await client.ContentObjectMetadata({
      libraryId,
      objectId: id,
      writeToken,
      metadataSubtree: "/production_master"
    }));

    const sources = R.prop("sources", masterMetadata);
    const variant = R.path(["variants", "default"], masterMetadata);

    // add info on source files and variant to data if --json selected
    if(this.args.json) {
      logger.data("media_files", sources);
      logger.data("variant_default", variant);
    }

    // generate ABR profile
    const genProfileRetVal = ABR.ABRProfileForVariant(sources, variant, AbrProfile);
    if(!genProfileRetVal.ok) throw Error(`Error(s) encountered while generating ABR profile: ${genProfileRetVal.errors.join("\n")}`);

    // filter DRM/clear as needed
    const filterProfileRetVal = drm ?
      ABR.ProfileExcludeClear(genProfileRetVal.result) :
      ABR.ProfileExcludeDRM(genProfileRetVal.result);
    if(!filterProfileRetVal.ok) throw Error(`Error(s) encountered while setting playout formats: ${filterProfileRetVal.errors.join("\n")}`);

    // set up mezzanine offering
    logger.log("Setting up media file conversion...");
    const createMezResponse = await client.CreateABRMezzanine({
      name: title,
      libraryId,
      objectId: id,
      type,
      masterWriteToken: writeToken,
      variant: "default",
      offeringKey: "default",
      abrProfile: filterProfileRetVal.result
    });

    logger.errorsAndWarnings(createMezResponse);
    const createMezErrors = createMezResponse.errors;
    if(!R.isNil(createMezErrors) && !R.isEmpty(createMezErrors)) throw Error(`Error(s) encountered while setting up media file conversion: ${createMezErrors.join("\n")}`);

    logger.log("Starting conversion to streaming format...");

    const startJobsResponse = await client.StartABRMezzanineJobs({
      libraryId,
      objectId: id,
      offeringKey: "default",
      writeToken
    });

    logger.errorsAndWarnings(startJobsResponse);
    const startJobsErrors = createMezResponse.errors;
    if(!R.isNil(startJobsErrors) && !R.isEmpty(startJobsErrors)) throw Error(`Error(s) encountered while starting file conversion: ${startJobsErrors.join("\n")}`);

    const lroWriteToken = R.path(["lro_draft", "write_token"], startJobsResponse);
    const lroNode = R.path(["lro_draft", "node"], startJobsResponse);

    logger.data("library_id", libraryId);
    logger.data("object_id", id);
    logger.data("offering_key", "default");
    logger.data("write_token", lroWriteToken);
    logger.data("write_node", lroNode);

    logger.logList(
      "",
      `Library ID: ${libraryId}`,
      `Object ID: ${id}`,
      "Offering: default",
      `Write Token: ${lroWriteToken}`,
      `Write Node: ${lroNode}`,
      ""
    );

    // wait for latest version hash to become visible (if publish not finished, then checking progress can fail
    // as metadata /lro_draft_default will not be found)

    await this.concerns.Finalize.waitForPublish({
      latestHash: startJobsResponse.hash,
      libraryId,
      objectId: id
    });

    logger.log("Progress:");

    const lro = this.concerns.LRO;
    let done = false;
    let lastStatus;
    while(!done) {
      const statusMap = await lro.status({libraryId, objectId: id}); // TODO: check how offering key is used, if at all
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
      objectId: id,
      offeringKey: "default"
    });
    const latestHash = finalizeAbrResponse.hash;

    logger.errorsAndWarnings(finalizeAbrResponse);
    const finalizeErrors = finalizeAbrResponse.errors;
    if(!R.isNil(finalizeErrors) && !R.isEmpty(finalizeErrors)) throw Error(`Error(s) encountered while finalizing object: ${finalizeErrors.join("\n")}`);

    if(libMezManageGroups && libMezManageGroups.length > 0){
      for(const groupAddress of libMezManageGroups){
        logger.log("Setting access permissions for managers");
        await client.AddContentObjectGroupPermission({
          objectId: id,
          groupAddress,
          permission: "manage"
        });

      }
    }

    logger.logList(
      "",
      "Playable media object created:",
      `  Object ID: ${id}`,
      `  Version Hash: ${latestHash}`,
      ""
    );
    logger.data("version_hash", latestHash);
    await this.concerns.Finalize.waitForPublish({
      latestHash,
      libraryId,
      objectId: id
    });
  }

  header() {
    return "Create playable media object via sample ingest";
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(SampleIngest);
} else {
  module.exports = SampleIngest;
}
