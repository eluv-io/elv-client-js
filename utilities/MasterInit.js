// Initialize production master without uploading any files
// - use to turn a manually created object into a production master

// still need to pass in cloud credentials via env vars or --credentials if files are remote

const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const CloudAccess = require("./lib/concerns/CloudAccess");
const FabricObject = require("./lib/concerns/FabricObject");
const Metadata = require("./lib/concerns/Metadata");
const ObjectEdit = require("./lib/concerns/ObjectEdit");

class MasterInit extends Utility {
  blueprint() {
    return {
      concerns: [FabricObject, CloudAccess, Client, ObjectEdit, Metadata]
    };
  }

  async body() {
    const access = this.concerns.CloudAccess.credentialSet(false);

    await this.concerns.FabricObject.libraryIdArgPopulate();
    const {objectId, libraryId} = this.args;

    const writeToken = await this.concerns.ObjectEdit.getWriteToken({
      libraryId,
      objectId
    });

    const client = await this.concerns.Client.get();
    const {data, errors, warnings, logs} = await client.CallBitcodeMethod({
      objectId,
      libraryId,
      method: "/media/production_master/init",
      writeToken,
      body: {access},
      constant: false
    });

    this.logger.errorsAndWarnings({errors, warnings});
    if(logs && logs.length > 0) this.logger.logList("Log:", ...logs);

    const versionHash = await this.concerns.ObjectEdit.finalize({writeToken});

    // Check if all variants in resulting master has an audio and video stream
    // NOTE: only expect single Variant 'draft' after bitcode call
    const variants = (await this.concerns.Metadata.get({
      libraryId,
      objectId,
      versionHash,
      metadataSubtree: "/production_master/variants"
    }));
    for(let variant in variants) {
      let streams = variants[variant].streams;
      if(!streams.hasOwnProperty("audio")) {
        this.logger.warnList("",
          "WARNING: no audio stream found.",
          ""
        );
      }
      if(!streams.hasOwnProperty("video")) {
        this.logger.warnList(
          "",
          "WARNING: no video stream found.",
          ""
        );
      }
    }

    this.logger.data("version_hash", versionHash);
    this.logger.logList(
      "",
      "New version hash: " + versionHash,
      "");
  }

  header() {
    return `Initialize production master metadata for object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(MasterInit);
} else {
  module.exports = MasterInit;
}
