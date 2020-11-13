/* eslint-disable no-console */

/**
 * Remove caption stream from object metadata
 * **/

const ScriptOffering = require("./parentClasses/ScriptOffering");

function streamKeyFound(offeringMetadata, streamKey) {
  const existsInMediaStruct = offeringMetadata.media_struct.streams.hasOwnProperty(streamKey);
  const existsInPlayout = offeringMetadata.playout.streams.hasOwnProperty(streamKey);
  return existsInMediaStruct || existsInPlayout;
}

class OfferingRemoveCaptionStream extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const captionStreamKey = this.args.captionStreamKey;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    let offeringMetadata = metadata.offerings[offeringKey];

    // Throw error if caption stream not found in metadata
    if(!streamKeyFound(offeringMetadata, captionStreamKey)) {
      this.throwError("No caption stream with key " + captionStreamKey + " found.");
    }

    // Delete caption stream from metadata
    delete offeringMetadata.media_struct.streams[captionStreamKey];
    delete offeringMetadata.playout.streams[captionStreamKey];

    // write back to object
    await this.metadataWrite(metadata);

    console.log("\nRemoved caption stream '%s'  from offering '%s' in object '%s'\n", captionStreamKey, offeringKey, objectId);
  }

  header() {
    return "Removing caption stream '" + this.args.captionStreamKey + "' from object '" + this.args.objectId + "'... ";
  }

  options() {
    return super.options()
      .option("captionStreamKey", {
        alias: "caption-stream-key",
        demandOption: true,
        describe: "Key of caption stream to remove. Usually of form 'captions-[label]-[file name]",
        type: "string"
      });
  }

}

const script = new OfferingRemoveCaptionStream;
script.run();
