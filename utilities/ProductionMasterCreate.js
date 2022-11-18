// Create new production master from specified file(s)
const R = require("ramda");

const {ModOpt, NewOpt, StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const V = require("./lib/models/Variant");
const VariantModel = V.VariantModel;

const ArgAssetMetadata = require("./lib/concerns/ArgAssetMetadata");
const ArgMetadata = require("./lib/concerns/ArgMetadata");
const ArgType = require("./lib/concerns/ArgType");
const Client = require("./lib/concerns/Client");
const CloudFile = require("./lib/concerns/CloudFile");
const ContentType = require("./lib/concerns/ContentType");
const LocalFile = require("./lib/concerns/LocalFile");

class ProductionMasterCreate extends Utility {
  blueprint() {
    return {
      concerns: [Client, CloudFile, LocalFile, ArgAssetMetadata, ArgMetadata, ContentType, ArgType],
      options: [
        StdOpt("libraryId", {demand: true, forX: "new production master"}),
        ModOpt("type", {demand: true, forX: "new production master"}),
        ModOpt("metadata", {ofX: "production master object"}),
        ModOpt("title", {demand: true}),
        ModOpt("files", {forX: "for new production master"}),
        StdOpt("encrypt", {descTemplate: "DEPRECATED: uploaded/copied files will always be stored encrypted unless --unencrypted is specified."}),
        NewOpt("unencrypted", {
          descTemplate: "Store uploaded/copied files unencrypted",
          type: "boolean"
        }),
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

    const {encrypt, unencrypted} = this.args;

    if(encrypt && unencrypted) throw new Error("Cannot specify both --encrypt and --unencrypted");

    let access;
    if(this.args.s3Reference || this.args.s3Copy) {
      access = this.concerns.CloudFile.credentialSet();
    }

    const metadataFromArg = this.concerns.ArgMetadata.asObject() || {};

    let streams;
    if(this.args.streams) {
      streams = J.parseStringOrFile({strOrPath: this.args.streams});
      const variant = {streams};
      // validate
      VariantModel(variant);
    }

    const newPublicMetadata = this.concerns.ArgAssetMetadata.publicMetadata({
      oldPublicMetadata: metadataFromArg.public,
      backupNameSuffix: "MASTER"
    });
    const metadata = R.mergeRight(metadataFromArg, {public: newPublicMetadata});

    let fileHandles = [];
    const fileInfo = access
      ? this.concerns.CloudFile.fileInfo()
      : this.concerns.LocalFile.fileInfo(fileHandles);

    // delay getting elvClient until this point so script exits faster
    // if there is a validation error above
    const client = await this.concerns.Client.get();

    const type = await await this.concerns.ArgType.typVersionHash();
    const {libraryId, s3Copy, s3Reference} = this.args;


    const createResponse = await client.CreateProductionMaster({
      libraryId,
      type,
      name: metadata.public.name,
      description: "Production Master for " + metadata.public.asset_metadata.title,
      metadata,
      fileInfo,
      encrypt: !unencrypted,
      access,
      copy: s3Copy && !s3Reference,
      callback: (access ? this.concerns.CloudFile : this.concerns.LocalFile).callback
    });

    const {errors, warnings, id} = createResponse;
    // Log object id immediately, in case of error later in script
    // Don't log hash yet, it will change if --streams was provided (or any other revision to object is needed)
    logger.data("object_id", id);

    let hash = createResponse.hash;

    // Close file handles (if any)
    this.concerns.LocalFile.closeFileHandles(fileHandles);

    await client.SetVisibility({id, visibility: 0});

    logger.errorsAndWarnings({errors, warnings});

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
        metadataSubtree: "/production_master/variants/default/streams"
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
    return "Create production master";
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ProductionMasterCreate);
} else {
  module.exports = ProductionMasterCreate;
}
