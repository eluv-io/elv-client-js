/* eslint-disable no-console */

// Edit specs for an existing stream in a variant


const ScriptVariant = require("./parentClasses/ScriptVariant");

class VariantRemoveStream extends ScriptVariant {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;

    const streamKey = this.args.streamKey;
    const variantKey = this.args.variantKey;

    // ===============================================================
    // retrieve metadata from object and validate presence of variant
    // ===============================================================
    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    // =======================================
    // find entry for specified stream
    // =======================================

    let variantStreams = metadata.production_master.variants[variantKey].streams;

    if(!variantStreams.hasOwnProperty(streamKey)) {
      this.throwError("Stream '" + streamKey + "' not found in variant '" + variantKey + "'");
    }

    // delete key
    delete metadata.production_master.variants[variantKey].streams[streamKey];

    // write back to object
    await this.metadataWrite(metadata);
  }

  header() {
    return "Deleting stream '" + this.args.streamKey + "' from variant '" + this.args.variantKey + "'... ";
  }

  options() {
    return super.options()
      .option("streamKey", {
        alias: "stream-key",
        demandOption: true,
        describe: "Stream within variant to delete",
        type: "string"
      });
  }
}

const script = new VariantRemoveStream;
script.run();