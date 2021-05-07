// Initialize production master without uploading any files
// - use to turn a manually created object into a production master

// still need to pass in cloud credentials via env vars or --credentials if files are remote

const kindOf = require("kind-of");

const {ModOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const CloudAccess = require("./lib/concerns/CloudAccess");
const ArgObjectId = require("./lib/concerns/ArgObjectId");
const Metadata = require("./lib/concerns/Metadata");
const Edit = require("./lib/concerns/Edit");

class MasterInit extends Utility {
  blueprint() {
    return {
      concerns: [ArgObjectId, CloudAccess, Client, Edit, Metadata],
      options: [
        ModOpt("objectId", {demand: true})
      ]
    };
  }

  async body() {
    const access = this.concerns.CloudAccess.credentialSet(false);

    await this.concerns.ArgObjectId.argsProc();
    const {objectId, libraryId} = this.args;

    const writeToken = await this.concerns.Edit.getWriteToken({
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

    const versionHash = await this.concerns.Edit.finalize({
      libraryId,
      objectId,
      writeToken
    });

    // Check if variants in resulting master has an audio and video stream
    // NOTE: only expect single Variant 'draft' after bitcode call
    const variants = (await this.concerns.Metadata.get({
      libraryId,
      objectId,
      versionHash,
      subtree: "/production_master/variants"
    }));

    if(kindOf(variants)!=="object") throw Error("no variants found after init");
    if(Object.keys(variants).length !== 1) throw Error(`unexpected number of variants found (${variants.length})`);
    if(!variants.hasOwnProperty("default")) throw Error(`unexpected variant key '${Object.keys(variants)[0]}' (expected 'default')`);

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
