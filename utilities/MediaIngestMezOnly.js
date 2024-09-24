/*
 * Media ingest streamlined.
 *
 * Use a single 'write token' for master and mez creation.
 */
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
const AbrProfile = require("./lib/abr_profiles/abr_profile_clear.json");
const {seconds} = require("./lib/helpers");

class SimpleIngest extends Utility {
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
    const status = {
      state: "starting"
    }

    let fileHandles = [];
    const fileInfo = this.concerns.LocalFile.fileInfo(fileHandles);

    // delay getting elvClient until this point so script exits faster
    // if there is a validation error above
    const client = await this.concerns.Client.get();

    // get type from Tenant
    const tenantInfo = await this.concerns.ArgTenant.tenantInfo();

    const type = tenantInfo.typeTitle;

    const {drm, libraryId, title} = this.args;
    const encrypt = true;

    status.content_type = type;
    status.name = "VOD - " + title;
    status.library_id = libraryId;

    // Create content object (don't finalize)
    const createResponse = await client.CreateContentObject({
      libraryId,
      options: {
        type,
        meta: {
          public : {
            name: status.name,
            description: "Source: " + fileInfo[0].path,
            asset_metadata: {
              title: title
            }
          }
        }
       }
    });
    const objectId = createResponse.id;
    const writeToken = createResponse.writeToken;

    status.state = "created";
    status.object_id = objectId;
    status.write_token = writeToken;

    // Generate a single access token to be used with all read and write operations
    status.access_token = await client.authClient.GenerateAuthorizationToken({
      libraryId,
      objectId,
      update: true
    });
    client.SetStaticToken({token: status.access_token});

    logger.log("Status", status);

    logger.log("Uploading files...");

    // PENDING(SS) to resume file uploads we should upload the files first
    // and init master once uploads are completed.

    // Upload files and initialize master
    const createMasterResponse = await client.CreateProductionMaster({
      libraryId,
      writeToken,
      type,
      name: "VOD - " + title,
      fileInfo,
      encrypt: false,
      copy: true,
      callback: this.concerns.LocalFile.callback
    });

    // Close file handles (if any)
    this.concerns.LocalFile.closeFileHandles(fileHandles);

    logger.errorsAndWarnings(createMasterResponse);

    if(!R.isNil(createMasterResponse.errors) && !R.isEmpty(createMasterResponse.errors)) throw Error(`Error(s) encountered while inspecting uploaded files: ${createMasterResponse.errors.join("\n")}`);

    status.state = "created_master";

    // get production master metadata
    const masterMetadata = (await client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/production_master"
    }));

    // PENDING(SS) process master variants here!!!
    // Add special audio specs
    // Add deinterlacing specs

    status.state = "created_master_variants";

    // generate ABR profile
    const sources = R.prop("sources", masterMetadata);
    const variant = R.path(["variants", "default"], masterMetadata);
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
      name: "VOD - " + title,
      libraryId,
      writeToken,
      type,
      masterWriteToken: writeToken,
      variant: "default",
      offeringKey: "default",
      abrProfile: filterProfileRetVal.result
    });

    logger.errorsAndWarnings(createMezResponse);
    const createMezErrors = createMezResponse.errors;
    if(!R.isNil(createMezErrors) && !R.isEmpty(createMezErrors)) throw Error(`Error(s) encountered while setting up media file conversion: ${createMezErrors.join("\n")}`);

    status.state = "created_mez";

    let mezMeta = await client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/abr_mezzanine"
    });

    // PENDING(SS) set deinterlacing parameters here

    logger.log("Starting conversion to streaming format...");

    const startJobsResponse = await client.StartABRMezzanineJobs({
      libraryId,
      objectId,
      writeToken,
      offeringKey: "default"
    });

    logger.errorsAndWarnings(startJobsResponse);
    const startJobsErrors = createMezResponse.errors;
    if(!R.isNil(startJobsErrors) && !R.isEmpty(startJobsErrors)) throw Error(`Error(s) encountered while starting file conversion: ${startJobsErrors.join("\n")}`);

    status.lro_draft = startJobsResponse;
    status.state = "mez_making";

    logger.log("Status", status);

    logger.log("Progress:");

    const lro = this.concerns.LRO;
    let done = false;
    let lastStatus;
    while(!done) {
      const statusMap = await lro.status({libraryId, objectId, writeToken}); // TODO: check how offering key is used, if at all
      const statusSummary = lro.statusSummary(statusMap);
      lastStatus = statusSummary.run_state;
      if(lastStatus !== LRO.STATE_RUNNING) done = true;
      logger.log(`run_state: ${lastStatus}`);
      const eta = statusSummary.estimated_time_left_h_m_s;
      if(eta) logger.log(`estimated time left: ${eta}`);
      await seconds(10);
    }

    status.state = "mez_complete";

    // finalize ABR mezzanine (don't finalize object)
    const finalizeAbrResponse = await client.FinalizeABRMezzanine({
      libraryId,
      objectId,
      writeToken,
      offeringKey: "default"
    });

    status.state = "mez_finalized";

    logger.errorsAndWarnings(finalizeAbrResponse);
    const finalizeErrors = finalizeAbrResponse.errors;
    if(!R.isNil(finalizeErrors) && !R.isEmpty(finalizeErrors)) throw Error(`Error(s) encountered while finalizing object: ${finalizeErrors.join("\n")}`);

    // Delete source file (currently only 1 file supported)
    logger.log("Delete source files");
    await client.DeleteFiles({
      libraryId,
      objectId,
      writeToken,
      filePaths: [
        fileInfo[0].path
      ]
    });

    logger.log("Status", status);

    logger.log("Finalze content object ...");
    const finRes = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    status.hash = finRes.hash;

    logger.log("Wait for publish ...");
    await this.concerns.Finalize.waitForPublish({
      latestHash: status.hash,
      libraryId,
      objectId
    });

    status.state = "mez_published";

    logger.log("Final Status", status);
  }

  header() {
    return "Create playable media object via simple ingest";
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(SimpleIngest);
} else {
  module.exports = SimpleIngest;
}
