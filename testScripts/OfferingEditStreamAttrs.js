/* eslint-disable no-console */

// Edits existing stream attributes for an offering: default_for_media_type, label, and language

const ScriptOffering = require("./parentClasses/ScriptOffering");


function streamKeyFound(offeringMetadata, streamKey) {
  const existsInMediaStruct = offeringMetadata.media_struct.streams.hasOwnProperty(streamKey);
  const existsInPlayout = offeringMetadata.playout.streams.hasOwnProperty(streamKey);
  return existsInMediaStruct || existsInPlayout;
}


class OfferingEditStreamAttrs extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const streamKey = this.args.streamKey;

    const label = this.args.label;
    const language = this.args.language;
    const default_for_media_type = this.args.isDefault || false;


    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    let offeringMetadata = metadata.offerings[offeringKey];

    // Throw error if stream not found in metadata
    if(!streamKeyFound(offeringMetadata, streamKey)) {
      this.throwError("No stream with key " + streamKey + " found.");
    }

    offeringMetadata.media_struct.streams[streamKey].default_for_media_type = default_for_media_type;
    offeringMetadata.media_struct.streams[streamKey].label = label;
    offeringMetadata.media_struct.streams[streamKey].language = language;

    await this.metadataWrite(metadata);
  }

  header() {
    return "Editing attributes for stream '" + this.args.streamKey + "' in offering '" + this.args.offeringKey + "'... ";
  }

  options() {
    return super.options()
      .option("isDefault", {
        alias: "is-default",
        describe: "Stream should be chosen by default (if omitted, will be set to false)",
        type: "boolean"
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
      .option("streamKey", {
        alias: "stream-key",
        demandOption: true,
        describe: "Stream to edit",
        type: "string"
      });
  }
}

const script = new OfferingEditStreamAttrs;
script.run();