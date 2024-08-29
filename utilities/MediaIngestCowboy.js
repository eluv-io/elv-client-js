/*
 * Media ingest streamlined.
 *
 * This script is hard-coded for cowboy video
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
const {seconds} = require("./lib/helpers");
const AbrProfile = require("./lib/abr_profiles/abr_profile_clear.json");

class MediaIngest extends Utility {
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
    client.ToggleLogging(false);

    // get type from Tenant
    const tenantInfo = await this.concerns.ArgTenant.tenantInfo();
    const type = tenantInfo.typeTitle;

    if(R.isNil(type)) throw Error("Library does not specify content type for sample ingests");

    const {drm, libraryId, title} = this.args;
    const encrypt = true;
    status.content_type = type;

    status.name = "VOD TEST - " + title;
    status.library_id = libraryId;

    // RESUME STATUS
    //status.object_id = "iq__jF4cpTUz4LnanJrhr2QGQ1971AC";
    //status.access_token = "eyJxc3BhY2VfaWQiOiJpc3BjM0FOb1ZTek5BM1A2dDdhYkxSNjlobzVZUFBaVSIsImFkZHIiOiIweDc2MWY0NTI4N2VhMzY0ZGI2YjIxNmJkNjU1OTEwNDMwYWZhM2U4MzkiLCJ0eF9pZCI6IjB4MDQ1ODBlNTI4YTU0NWNkNTE1OGM1YTMwZWM5ZGRlNzM3MmYzZThlYTczNzAxMmExOTE0Y2Q5NDYzZDM4NTk2MCIsInFsaWJfaWQiOiJpbGliMkhXQnh3c1hyZ3RSemdNVlZ4QXptMW9QSDUzVSJ9.RVMyNTZLXzNwMlRvY0RuWUV3N2ZWZGlNZEFvcmYxbU5wNU41Wlg0VEdxQ0g4WjQ4Vm1meDZ6cmtiMUFkcURnV1NxNDhydmFYZldjeWcycThUVUgzaUtZN3NTUWVDZ2NB";
    //status.write_token = "tqw__HSRzdpiWfWsKm1EP7fCxg3iSqsJHdCeU35woWkLwJ6sMJmHdxUj2ypxjpifkSDjvM4kxMixxbriaHEpG44r";

    // Create and finalize content object
    // The reason to finalize is that we need two separate write tokens for master and mez
    const {id} = await client.CreateAndFinalizeContentObject({
      libraryId,
      options: {
        type,
        meta: {
          public : {
            name: "VOD TEST - " + title,
            asset_metadata: {
              title: title
            }
          }
        }
       }
    });
    const objectId = id;

    status.state = "created";
    status.object_id = objectId;

    status.access_token = await client.authClient.GenerateAuthorizationToken({
      libraryId,
      objectId,
      update: true
    });

    // Create master and mez write tokens
    const masterEdit = await client.EditContentObject({
      libraryId,
      objectId
    });
    const masterWriteToken = masterEdit.writeToken;

    const mezEdit = await client.EditContentObject({
      libraryId,
      objectId
    });
    const mezWriteToken = mezEdit.writeToken;

    status.master_write_token = masterWriteToken;
    status.write_token = mezWriteToken;

    logger.log("Object", status);

    logger.log("Uploading files...");

    const createMasterResponse = await client.CreateProductionMaster({
      libraryId,
      writeToken: masterWriteToken,
      type,
      name: "VOD MASTER - " + title,
      description: `Media object created: ${title}`,
      fileInfo,
      encrypt: false,
      copy: true,
      callback: this.concerns.LocalFile.callback
    });

    // Close file handles (if any)
    this.concerns.LocalFile.closeFileHandles(fileHandles);

    logger.errorsAndWarnings(createMasterResponse);

    if(!R.isNil(createMasterResponse.errors) && !R.isEmpty(createMasterResponse.errors)) throw Error(`Error(s) encountered while inspecting uploaded files: ${createMasterResponse.errors.join("\n")}`);

  // get production master metadata
    const masterMetadata = (await client.ContentObjectMetadata({
      libraryId,
      objectId: status.object_id,
      writeToken: masterWriteToken,
      metadataSubtree: "/production_master"
    }));

    // Set audio specs 2MONO_1STEREO
    logger.log("Set audio specs");
    let streams = masterMetadata.variants.default.streams;
    streams.audio = {
        default_for_media_type: true,
        label: "audio",
        language: "",
        mapping_info: "2MONO_1STEREO",
        sources: [
          {
            files_api_path: fileInfo[0].path,
            stream_index: 1
          },
          {
            files_api_path: fileInfo[0].path,
            stream_index: 2
          }
        ],
        type: "audio"
    }

    console.log("Replace master metadata");
    await client.ReplaceMetadata({
      libraryId,
      objectId: status.object_id,
      writeToken: masterWriteToken,
      metadataSubtree: "/production_master",
      metadata: masterMetadata
    });

    status.state = "created_master";

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
    logger.log("Setting up media file conversion");
    const createMezResponse = await client.CreateABRMezzanine({
      name: "VOD TEST - " + title,
      libraryId,
      writeToken: mezWriteToken,
      type,
      masterWriteToken: masterWriteToken,
      variant: "default",
      offeringKey: "default",
      abrProfile: filterProfileRetVal.result
    });

    logger.errorsAndWarnings(createMezResponse);
    const createMezErrors = createMezResponse.errors;
    if(!R.isNil(createMezErrors) && !R.isEmpty(createMezErrors)) throw Error(`Error(s) encountered while setting up media file conversion: ${createMezErrors.join("\n")}`);

    status.state = "created_mez";

    let m = await client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken: mezWriteToken
    });

    // PENDING(SS) Set deinterlacing parameters
    logger.log("Set deinterlacing parameters");

    m.abr_mezzanine.offerings.default.mez_prep_specs.video.deinterlace = 1;
    m.abr_mezzanine.offerings.default.mez_prep_specs.video.video_time_base = 60000;
    m.abr_mezzanine.offerings.default.mez_prep_specs.video.video_frame_duration_ts = 1001;
    m.abr_mezzanine.offerings.default.mez_prep_specs.video.key_frame_interval = 120;
    m.abr_mezzanine.offerings.default.mez_prep_specs.video.bit_rate = 0;
    m.abr_mezzanine.offerings.default.mez_prep_specs.video.crf = 22;

    console.log("Replace metadata");
    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: mezWriteToken,
      metadataSubtree: "/",
      metadata: m
    });

    logger.log("Starting conversion to streaming format");

    const startJobsResponse = await client.StartABRMezzanineJobs({
      libraryId,
      objectId: id,
      offeringKey: "default",
      writeToken: mezWriteToken
    });

    console.log("Jobs", startJobsResponse);

    logger.errorsAndWarnings(startJobsResponse);
    const startJobsErrors = createMezResponse.errors;
    if(!R.isNil(startJobsErrors) && !R.isEmpty(startJobsErrors)) throw Error(`Error(s) encountered while starting file conversion: ${startJobsErrors.join("\n")}`);

    const lroWriteToken = R.path(["lro_draft", "write_token"], startJobsResponse);
    const lroNode = R.path(["lro_draft", "node"], startJobsResponse);

    logger.log("Progress:");

    const lro = this.concerns.LRO;
    let done = false;
    let lastStatus;
    while(!done) {
      const statusMap = await lro.status({libraryId, objectId, writeToken: mezWriteToken}); // TODO: check how offering key is used, if at all
      const statusSummary = lro.statusSummary(statusMap);
      lastStatus = statusSummary.run_state;
      if(lastStatus !== LRO.STATE_RUNNING) done = true;
      logger.log(`run_state: ${lastStatus}`);
      const eta = statusSummary.estimated_time_left_h_m_s;
      if(eta) logger.log(`estimated time left: ${eta}`);
      await seconds(10);
    }

    status.state = "mez_complete";

    console.log("Calling ABR finalize");
    const finalizeAbrResponse = await client.FinalizeABRMezzanine({
      libraryId,
      objectId: id,
      writeToken: mezWriteToken,
      offeringKey: "default"
    });

    status.state = "mez_finalized";
    console.log("Finalize", finalizeAbrResponse);

    logger.errorsAndWarnings(finalizeAbrResponse);
    const finalizeErrors = finalizeAbrResponse.errors;
    if(!R.isNil(finalizeErrors) && !R.isEmpty(finalizeErrors)) throw Error(`Error(s) encountered while finalizing object: ${finalizeErrors.join("\n")}`);

    // Delete source file (this currently not needed becuase we have a separate master write token)
    logger.log("Delete source files");
    await client.DeleteFiles({
      libraryId,
      objectId,
      writeToken: masterWriteToken,
      filePaths: [
        fileInfo[0].path
      ]
    });

    await client.DeleteWriteToken({
      libraryId,
      writeToken: masterWriteToken
    });

    console.log("Status", status);

    logger.log("Finalze content object");
    const finRes = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: mezWriteToken,
    });
    console.log("Finalize", finRes);
    status.hash = finRes.hash;

    logger.log("Wait for publish");
    await this.concerns.Finalize.waitForPublish({
      latestHash: status.hash,
      libraryId,
      objectId: id
    });

    console.log("Finalized Status", status);
  }

  header() {
    return "Create playable media object";
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(MediaIngest);
} else {
  module.exports = MediaIngest;
}
