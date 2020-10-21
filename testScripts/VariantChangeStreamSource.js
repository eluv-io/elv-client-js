/* eslint-disable no-console */

// Change source info for an existing stream in a variant


const ScriptVariant = require("./parentClasses/ScriptVariant");

class VariantChangeStreamSource extends ScriptVariant {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;

    const streamKey = this.args.streamKey;
    const variantKey = this.args.variantKey;
    const filePath = this.args.file;
    const streamIndex = this.args.streamIndex;

    // ===============================================================
    // retrieve metadata from object and validate presence of variant
    // ===============================================================
    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateVariant(metadata, variantKey);
    this.validateStreamSource(metadata, filePath, streamIndex);

    // =======================================
    // find entry for specified stream
    // =======================================

    let variantStreams = metadata.production_master.variants[variantKey].streams;

    if(!variantStreams.hasOwnProperty(streamKey)) {
      this.throwError("Stream '" + streamKey + "' not found in variant '" + variantKey + "'");
    }

    let variantStream = variantStreams[streamKey];
    if(variantStream.sources.length !== 1) {
      this.throwError("Stream '" + streamKey + "' in variant '" + variantKey + "' is not single-source. Currently only variant streams with 1 source are supported.");
    }

    // make our changes

    variantStream.sources[0].files_api_path = filePath;
    variantStream.sources[0].stream_index = streamIndex;

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
      .option("file", {
        alias: "f",
        demandOption: true,
        describe: "File path within object",
        type: "string"
      })
      .option("streamIndex", {
        alias: "stream-index",
        demandOption: true,
        describe: "Index of stream to use from file",
        type: "number"
      });

  }
}

const script = new VariantChangeStreamSource;
script.run();