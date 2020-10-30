/* eslint-disable no-console */

// parent class for scripts that work with variants

const ScriptBase = require("./ScriptBase");
const MetadataMixin = require("./MetadataMixin");

module.exports = class ScriptVariant extends MetadataMixin(ScriptBase) {

  options() {
    return super.options()
      .option("libraryId", {
        alias: "library-id",
        demandOption: true,
        describe: "Library ID (should start with 'ilib')",
        type: "string"
      })
      .option("objectId", {
        alias: "object-id",
        demandOption: true,
        describe: "Object ID (should start with 'iq__')",
        type: "string"
      })
      .option("variantKey", {
        alias: "variant-key",
        default: "default",
        describe: "Production Master variant key",
        type: "string"
      });
  }

  validateVariant(metadata, variantKey) {
    // check to make sure we have production_master
    if(!metadata.production_master) {
      this.throwError("Key '/production_master' not found in object metadata");
    }

    // check to make sure we have variants
    if(!metadata.production_master.variants) {
      this.throwError("Key '/production_master/variants' not found in object metadata");
    }

    // check for specified variant key
    if(!metadata.production_master.variants.hasOwnProperty(variantKey)) {
      this.throwError("Variant '" + variantKey + "' not found in production master metadata");
    }
  }

  validateStreamSource(metadata, filePath, streamIndex) {
    const sources = metadata.production_master.sources;
    if(!sources.hasOwnProperty(filePath)) {
      const sourceList = Object.keys(sources).join("\n  ");
      this.throwError("'" + filePath + "' not found in Production Master source list. Make sure file path is correct. If you have recently added a new file to the master, try running ProductionMasterInit.js first.\n\nSources found in master:\n\n  " + sourceList);
    }

    const sourceStreams = metadata.production_master.sources[filePath].streams;
    if(streamIndex < 0 || streamIndex >= sourceStreams.length) {
      this.throwError("streamIndex must be between 0 and " + (sourceStreams.length - 1) + " for file '" + filePath + "'");
    }

    const sourceStream = metadata.production_master.sources[filePath].streams[streamIndex];
    if(sourceStream.type !== "StreamAudio" && sourceStream.type !== "StreamVideo") {
      this.throwError("streamIndex " + streamIndex + " in file '" + filePath + "' is of type '" + sourceStream.type + "', currently only StreamAudio and StreamVideo are supported");
    }

    // if(sourceStream.type === "StreamAudio" && sourceStream.channels !== 2) {
    //   this.throwError("streamIndex " + streamIndex + " in file '" + filePath + "' is audio but has " + sourceStream.channels + " channel(s), currently only audio streams with 2 channels are supported");
    // }
  }
};