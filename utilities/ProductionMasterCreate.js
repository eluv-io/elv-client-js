// Create new production master from specified file(s)
const R = require("ramda");

const {ModOpt, NewOpt, StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const V = require("./lib/models/Variant");
const VariantModel = V.VariantModel;

const Asset = require("./lib/concerns/Asset");
const Client = require("./lib/concerns/Client");
const CloudFiles = require("./lib/concerns/CloudFiles");
const LocalFiles = require("./lib/concerns/LocalFiles");
const Metadata = require("./lib/concerns/Metadata");
const ContentType = require("./lib/concerns/ContentType");

class ProductionMasterCreate extends Utility {
  blueprint() {
    return {
      concerns: [Client, CloudFiles, LocalFiles, Asset, Metadata, ContentType],
      options: [
        StdOpt("libraryId",{demand: true, forX: "new production master"}),
        ModOpt("type",{demand: true, forX: "new production master"}),
        ModOpt("metadata", {ofX: "production master object"}),
        ModOpt("title", {demand: true}),
        ModOpt("files", {forX: "for new production master"}),
        StdOpt("encrypt", {X: "uploaded files"}),
        NewOpt("streams", {
          descTemplate: "JSON string (or file path if prefixed with '@') containing stream specifications for variant in new production master",
          type: "string"
        })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const J = this.concerns.JSON;

    let access;
    if(this.args.s3Reference || this.args.s3Copy) {
      access = this.concerns.CloudFiles.access();
    }

    let metadataFromArg;
    if(this.args.metadata) {
      metadataFromArg = this.concerns.Metadata.asObject();
    } else {
      metadataFromArg = this.concerns.Metadata.skeleton();
    }

    let streams;
    if(this.args.streams) {
      streams = J.parseStringOrFile(this.args.streams);
      const variant = {streams};
      // validate
      VariantModel(variant);
    }

    const newPublicMetadata = this.concerns.Asset.publicMetadata(metadataFromArg.public, "MASTER");
    const metadata = R.mergeRight(metadataFromArg, {public: newPublicMetadata});

    let fileHandles = [];
    const fileInfo = access
      ? this.concerns.CloudFiles.fileInfo()
      : this.concerns.LocalFiles.fileInfo(fileHandles);

    // delay getting elvClient until this point so script exits faster
    // if there is a validation error above
    const client = await this.concerns.Client.get();

    const type = await this.concerns.ContentType.hashLookup();
    const {libraryId, encrypt, s3Copy, s3Reference} = this.args;

    const createResponse = await client.CreateProductionMaster({
      libraryId,
      type,
      name: metadata.public.name,
      description: "Production Master for " + metadata.public.asset_metadata.title,
      metadata,
      fileInfo,
      encrypt,
      access,
      copy: s3Copy && !s3Reference,
      callback: (access ? this.concerns.CloudFiles : this.concerns.LocalFiles).callback
    });

    const {errors, warnings, id} = createResponse;
    // Log object id immediately, in case of error later in script
    // Don't log hash yet, it will change if --streams was provided (or any other revision to object is needed)
    logger.data("object_id", id);

    let hash = createResponse.hash;

    // Close file handles (if any)
    this.concerns.LocalFiles.closeFileHandles(fileHandles);

    await client.SetVisibility({id, visibility: 0});

    if(errors.length > 0) {
      logger.log("Errors:");
      logger.errorList(...errors);
      logger.log();
    }

    if(warnings.length) {
      logger.log("Warnings:");
      logger.warnList(...warnings);
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

    logger.logList(
      "",
      "Production master object created:",
      `  Object ID: ${id}`,
      `  Version Hash: ${hash}`,
      ""
    );

    logger.data("version_hash", hash);

    if(!streams) {
      // Check if resulting variant has an audio and a video stream
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
  }

  header() {
    return "Creating production master...";
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ProductionMasterCreate);
} else {
  module.exports = ProductionMasterCreate;
}