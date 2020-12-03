/* eslint-disable no-console */

// Edit specs for an existing stream in a variant


const ScriptVariant = require("./parentClasses/ScriptVariant");

class VariantEditStream extends ScriptVariant {

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

    let sources = [];
    this.validateVariant(metadata, variantKey);

    if(channelIndexes) {
      if(channelIndexes.length() > 0 && streamIndexes.length() !== 1) {
        this.throwError("when using --channelIndex, you may only specify one --streamIndex");
      }
    }

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
    // find entry for specified stream
    // =======================================

    let variantStreams = metadata.production_master.variants[variantKey].streams;

    if(!variantStreams.hasOwnProperty(streamKey)) {
      this.throwError("Stream '" + streamKey + "' not found in variant '" + variantKey + "'");
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
    return "Changing source for stream '" + this.args.streamKey + "' in variant '" + this.args.variantKey + "'... ";
  }

  options() {
    return super.options()
      .option("streamKey", {
        alias: "stream-key",
        demandOption: true,
        describe: "Stream within variant to change",
        type: "string"
      })
      .option("label", {
        default: "",
        describe: "Label to display for stream",
        type: "string"
      })
      .option("language", {
        alias: "lang",
        default: "",
        describe: "Language code for stream (some older players may use this as the label)",
        type: "string"
      })
      .option("isDefault", {
        alias: "is-default",
        default: false,
        describe: "Stream should be chosen by default (will be set to false if not included)",
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
        default: "",
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

const script = new VariantEditStream;
script.run();