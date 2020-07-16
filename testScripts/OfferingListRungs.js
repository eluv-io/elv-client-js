/* eslint-disable no-console */

// Outputs the resolution ladder(s) for all streams in an offering

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingListRungs extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const streamKey = this.args.streamKey;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    let playoutStreams = metadata.offerings[offeringKey].playout.streams;

    if(streamKey && !playoutStreams.hasOwnProperty(streamKey)) {
      this.throwError("Stream with key '" + streamKey + "' not found in offering '" + offeringKey + "'");
    }

    // remove unwanted data
    const keys = Object.keys(playoutStreams);
    for(let i = 0; i < keys.length; i++) {
      if(streamKey && keys[i] !== streamKey) {
        delete playoutStreams[keys[i]];
      } else {
        delete playoutStreams[keys[i]].encryption_schemes;
      }
    }

    console.log(JSON.stringify(playoutStreams, null, 2));
  }

  header() {
    return "Listing resolution ladder rungs for " +
      (this.args.streamKey ? " stream '" + this.args.streamKey + "'" : "all streams") +
      " in offering '" + this.args.offeringKey + "'";
  }

  options() {
    return super.options()
      .option("streamKey", {
        alias: "stream-key",
        describe: "Stream to list rungs for (if omitted, all streams will be listed)",
        type: "string"
      });
  }

}

const script = new OfferingListRungs;
script.run();