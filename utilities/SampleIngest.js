// Create new production master from specified file(s)
const R = require("ramda");
const fs = require("fs");

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
const STATUS_FILE = "./ingest-status.json";

// Status object - used for reporting and resume.
const status = {
  state: "",
  object_id: "",
  write_token: "",
  master_created: false
};

const SetStatus = statusUpdate => {
  Object.assign(status, statusUpdate);
  fs.writeFileSync(STATUS_FILE, `${JSON.stringify(status, null, 2)}\n`);
};

class SampleIngest extends Utility {
  blueprint() {
    return {
      concerns: [Client, Finalize, LocalFile, ArgLibraryId, ArgTenant, LRO],
      options: [
        ModOpt("libraryId", {demand: false, forX: "new media object"}),
        NewOpt("objectId", {
          demand: false,
          descTemplate: "Existing media object to ingest into",
          type: "string"
        }),
        NewOpt("title", {
          demand: false,
          descTemplate: "Title for new media object (required unless --object-id is given)",
          type: "string"
        }),
        NewOpt("drm", {
          default: false,
          descTemplate: "Use DRM for playback",
          type: "boolean"
        }),
        NewOpt("hdrInfoFile", {
          descTemplate: "Path to HDR info JSON file to enable HDR10 ingest. File format: { \"master_display\": \"G(...)B(...)R(...)WP(...)L(...)\", \"max_cll\": \"...,...\" }",
          type: "string"
        }),
        NewOpt("finalize", {
          default: true,
          descTemplate: "Finalize the content object write token after ingest. Use --no-finalize to leave the draft open.",
          type: "boolean"
        }),
        NewOpt("offeringKey", {
          default: "default",
          descTemplate: "Offering key (default: 'default')",
          type: "string"
        }),
        NewOpt("variantKey", {
          default: "default",
          descTemplate: "Master variant key (default: 'default')",
          type: "string"
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

    // get type from Tenant
    const tenantInfo = await this.concerns.ArgTenant.tenantInfo();

    const type = tenantInfo.typeTitle;

    if(R.isNil(type)) throw Error("Library does not specify content type for sample ingests");

    let {drm, finalize, hdrInfoFile, libraryId, objectId, offeringKey, title, variantKey} = this.args;
    const noFinalize = !finalize;
    const encrypt = true;

    let id;
    let nodeUrl;
    let writeToken;
    if(status.write_token) {
      id = status.object_id;
      writeToken = status.write_token;
      if(!libraryId) {
        libraryId = await client.ContentObjectLibraryId({objectId: id});
      }
      // Re-pin client to the node holding the draft
      nodeUrl = await client.WriteTokenNodeUrlNetwork({writeToken});
      await client.SetNodes({fabricURIs: [nodeUrl]});
      logger.log(`Resuming from write token ${writeToken} on ${nodeUrl}`);
    } else {
      if(!libraryId && !objectId) {
        throw Error("One of library-id or object-id must be specified");
      }

      if(!objectId && !title) {
        throw Error("--title is required when creating a new media object");
      }

      if(objectId) {
        if(!libraryId) {
          libraryId = await client.ContentObjectLibraryId({objectId});
        }
        const editResp = await client.EditContentObject({
          libraryId,
          objectId,
          options: type ? { type } : {}
        });
        id = objectId;
        writeToken = editResp.writeToken;
        nodeUrl = editResp.nodeUrl;
      } else {
        const createResp = await client.CreateContentObject({
          libraryId,
          options: type ? { type } : {}
        });
        id = createResp.id;
        writeToken = createResp.writeToken;
        nodeUrl = createResp.nodeUrl;
      }

      await client.authClient.GenerateAuthorizationToken({
        libraryId,
        objectId: id,
        update: true
      });

      status.object_id = id;
      status.write_token = writeToken;
    }

    SetStatus({state: "object_created"});

    if(!nodeUrl) {
      nodeUrl = client.WriteTokenNodeUrlLocal({writeToken});
    }
    if(!nodeUrl) {
      nodeUrl = await client.WriteTokenNodeUrlNetwork({writeToken});
    }

    logger.data("object_id", id);

    if(!status.master_created) {
      logger.log("Uploading files...");

      const createMasterResponse = await client.CreateProductionMaster({
        libraryId,
        type,
        name: title,
        fileInfo,
        encrypt,
        copy: true,
        callback: this.concerns.LocalFile.callback,
        writeToken
      });

      // Close file handles (if any)
      this.concerns.LocalFile.closeFileHandles(fileHandles);

      logger.errorsAndWarnings(createMasterResponse);

      logger.logList(
        "",
        "Production master default variant created:",
        `  Object ID: ${id}`,
        `  Write token: ${writeToken}`,
        ""
      );

      if(!R.isNil(createMasterResponse.errors) && !R.isEmpty(createMasterResponse.errors)) throw Error(`Error(s) encountered while inspecting uploaded files: ${createMasterResponse.errors.join("\n")}`);

      status.master_created = true;
    } else {
      this.concerns.LocalFile.closeFileHandles(fileHandles);
      logger.log(`Skipping upload + master creation (resume), write token ${writeToken}`);
    }

    SetStatus({state: "master_created", master_created: true});

    // get production master metadata
    const masterMetadata = (await client.ContentObjectMetadata({
      libraryId,
      objectId: id,
      writeToken,
      metadataSubtree: "/production_master"
    }));

    const sources = R.prop("sources", masterMetadata);
    const variant = R.path(["variants", variantKey], masterMetadata);
    if(R.isNil(variant)) throw Error(`Variant '${variantKey}' not found in production master metadata`);

    // add info on source files and variant to data if --json selected
    if(this.args.json) {
      logger.data("media_files", sources);
      logger.data("variant_key", variantKey);
      logger.data("variant", variant);
    }

    // HDR: inject HDR info into first video stream's sources metadata
    let hdrInfo;
    if(hdrInfoFile) {
      hdrInfo = JSON.parse(fs.readFileSync(hdrInfoFile, "utf8"));
      const fileName = Object.keys(sources)[0];
      const streams = sources[fileName].streams;
      const videoStreamIdx = streams.findIndex(s => s.type === "StreamVideo");
      if(videoStreamIdx < 0) throw Error(`No video stream found in /production_master/sources/${fileName}`);

      streams[videoStreamIdx].hdr = hdrInfo;
      logger.log(`Adding HDR info to /production_master/sources/${fileName}/streams/${videoStreamIdx}/hdr`);

      await client.ReplaceMetadata({
        libraryId,
        objectId: id,
        writeToken,
        metadataSubtree: "/production_master/sources",
        metadata: sources
      });
    }

    // generate ABR profile
    const genProfileRetVal = ABR.ABRProfileForVariant(sources, variant, AbrProfile);
    if(!genProfileRetVal.ok) throw Error(`Error(s) encountered while generating ABR profile: ${genProfileRetVal.errors.join("\n")}`);

    // filter DRM/clear as needed
    const filterProfileRetVal = drm ?
      ABR.ProfileExcludeClear(genProfileRetVal.result) :
      ABR.ProfileExcludeDRM(genProfileRetVal.result);
    if(!filterProfileRetVal.ok) throw Error(`Error(s) encountered while setting playout formats: ${filterProfileRetVal.errors.join("\n")}`);

    // HDR: add HEVC/10-bit segment specs to the profile
    if(hdrInfo) {
      filterProfileRetVal.result.segment_specs = filterProfileRetVal.result.segment_specs || {};
      filterProfileRetVal.result.segment_specs.video = {
        ...(filterProfileRetVal.result.segment_specs.video || {}),
        bit_depth: 10,
        encoding: "h265"
      };
    }

    // set up mezzanine offering
    logger.log("Setting up media file conversion...");
    const createMezResponse = await client.CreateABRMezzanine({
      name: title,
      libraryId,
      writeToken,
      type,
      masterWriteToken: writeToken,
      variant: variantKey,
      offeringKey,
      abrProfile: filterProfileRetVal.result
    });

    logger.errorsAndWarnings(createMezResponse);
    const createMezErrors = createMezResponse.errors;
    if(!R.isNil(createMezErrors) && !R.isEmpty(createMezErrors)) throw Error(`Error(s) encountered while setting up media file conversion: ${createMezErrors.join("\n")}`);

    logger.log("Starting conversion to streaming format...");

    const startJobsResponse = await client.StartABRMezzanineJobs({
      libraryId,
      objectId: id,
      offeringKey,
      writeToken
    });

    logger.errorsAndWarnings(startJobsResponse);
    const startJobsErrors = createMezResponse.errors;
    if(!R.isNil(startJobsErrors) && !R.isEmpty(startJobsErrors)) throw Error(`Error(s) encountered while starting file conversion: ${startJobsErrors.join("\n")}`);

    writeToken = startJobsResponse.writeToken || writeToken;
    nodeUrl = startJobsResponse.nodeUrl || nodeUrl;

    const lroWriteToken = R.path(["lro_draft", "write_token"], startJobsResponse) || writeToken;
    const lroNode = R.path(["lro_draft", "node"], startJobsResponse) || nodeUrl;

    logger.data("library_id", libraryId);
    logger.data("object_id", id);
    logger.data("offering_key", offeringKey);
    logger.data("write_token", lroWriteToken);
    logger.data("write_node", lroNode);
    logger.data("node_endpoint", lroNode);

    logger.logList(
      "",
      `Library ID: ${libraryId}`,
      `Object ID: ${id}`,
      `Variant: ${variantKey}`,
      `Offering: ${offeringKey}`,
      `Write Token: ${lroWriteToken}`,
      `Write Node: ${lroNode}`,
      ""
    );

    logger.log("Progress:");

    const lro = this.concerns.LRO;
    let done = false;
    let lastStatus;
    while(!done) {
      const statusMap = await lro.status({libraryId, objectId: id, writeToken}); // TODO: check how offering key is used, if at all
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
      writeToken,
      offeringKey
    });

    logger.errorsAndWarnings(finalizeAbrResponse);
    const finalizeErrors = finalizeAbrResponse.errors;
    if(!R.isNil(finalizeErrors) && !R.isEmpty(finalizeErrors)) throw Error(`Error(s) encountered while finalizing object: ${finalizeErrors.join("\n")}`);

    logger.log("Deleting source files...");
    await client.DeleteFiles({
      libraryId,
      objectId: id,
      writeToken,
      filePaths: fileInfo.map(f => f.path)
    });
    nodeUrl = client.WriteTokenNodeUrlLocal({writeToken}) || nodeUrl;

    let latestHash = "not finalized";

    if(noFinalize) {
      logger.log("Skipping content object finalization (--no-finalize).");
    } else {
      logger.log("Finalizing content object...");
      const sourceFileName = fileInfo[0].path.split("/").pop();
      const finalizeObjResponse = await client.FinalizeContentObject({
        libraryId,
        objectId: id,
        writeToken,
        commitMessage: `Ingest ${sourceFileName}${hdrInfoFile ? " [HDR]" : ""}`
      });

      latestHash = finalizeObjResponse.hash;
    }

    logger.data("version_hash", latestHash);
    logger.data("write_token", writeToken);
    logger.data("write_node", nodeUrl);
    logger.data("node_endpoint", nodeUrl);

    logger.logList(
      "",
      noFinalize ? "Playable media object draft prepared:" : "Playable media object created:",
      `  Object ID: ${id}`,
      `  Version Hash: ${latestHash}`,
      `  Write Token: ${writeToken}`,
      `  Node Endpoint: ${nodeUrl}`,
      ""
    );

    if(!noFinalize) {
      await this.concerns.Finalize.waitForPublish({
        latestHash,
        libraryId,
        objectId: id
      });
    }
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
