/* eslint-disable no-console */

// Change source info for an existing stream in a variant


const ScriptVariant = require("./parentClasses/ScriptVariant");

class VariantAddStream extends ScriptVariant {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;

    const streamKey = this.args.streamKey;
    const label = this.args.label;
    const language = this.args.language;
    const default_for_media_type = this.args.isDefault;
    const variantKey = this.args.variantKey;
    const filePath = this.args.file;
    const channelIndexes = this.args.channelIndex;
    const streamIndexes = this.args.streamIndex;
    const mappingInfo = this.args.mapping;

    // ===============================================================
    // retrieve metadata from object and validate presence of variant
    // ===============================================================
    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });
    this.validateVariant(metadata, variantKey);

    if(channelIndexes) {
      if(channelIndexes.length() > 0 && streamIndexes.length() !== 1) {
        this.throwError("when using --channelIndex, you may only specify one --streamIndex");
      }
    }

    let sources = [];

    for(const streamIndex of streamIndexes) {
      if(channelIndexes) {
        for(const channelIndex of channelIndexes) {
          this.validateStreamSource(metadata, filePath, streamIndex, channelIndex);
          sources.push({
            channel_index: channelIndex,
            files_api_path: filePath,
            stream_index: streamIndex
          });
        }
      } else {
        this.validateStreamSource(metadata, filePath, streamIndex);
        sources.push({
          files_api_path: filePath,
          stream_index: streamIndex
        });
      }
    }

    // =======================================
    // make sure entry for specified stream does not already exist
    // =======================================

    let variantStreams = metadata.production_master.variants[variantKey].streams;

    if(variantStreams.hasOwnProperty(streamKey)) {
      this.throwError("Stream '" + streamKey + "' is already present in variant '" + variantKey + "'");
    }

    // make our changes
    // merge into object variant metadata
    variantStreams[streamKey] = {
      default_for_media_type,
      label,
      language,
      mapping_info: mappingInfo || "",
      sources
    };

    // write back to object
    await this.metadataWrite(metadata);
  }

  header() {
    return "Adding stream '" + this.args.streamKey + "' to variant '" + this.args.variantKey + "'... ";
  }

  options() {
    return super.options()
      .option("streamKey", {
        alias: "stream-key",
        demandOption: true,
        describe: "Key for new stream",
        type: "string"
      })
      .option("label", {
        demandOption: true,
        describe: "Label to display for stream",
        type: "string"
      })
      .option("language", {
        alias: "lang",
        demandOption: true,
        describe: "Language code for stream (some older players may use this as the label)",
        type: "string"
      })
      .option("isDefault", {
        alias: "is-default",
        default: false,
        demandOption: false,
        describe: "Stream should be chosen by default",
        type: "boolean"
      })
      .option("file", {
        alias: "f",
        demandOption: true,
        describe: "File path within object",
        type: "string"
      })
      .option("mapping", {
        alias: "m",
        demandOption: false,
        describe: "Mapping info for stream",
        type: "string"
      })
      .option("channelIndex", {
        alias: "channel-index",
        describe: "Channel(s) of stream to use from file. (Only applies to audio streams)",
        type: "array"
      })
      .option("streamIndex", {
        alias: "stream-index",
        demandOption: true,
        describe: "Index(es) of stream(s) to use from file. (Currently only audio streams can use 2 stream indexes)",
        type: "array"
      });
  }
}

const script = new VariantAddStream;
script.run();