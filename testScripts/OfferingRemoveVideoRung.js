/* eslint-disable no-console */

// Removes DRM-free playout options from an existing offering of a mezzanine

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingRemoveVideoRung extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const streamKey = this.args.streamKey;
    const rungKey = this.args.rungKey;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    let playoutStreams = metadata.offerings[offeringKey].playout.streams;

    if(!playoutStreams.hasOwnProperty(streamKey)) {
      this.throwError("Key '" + streamKey + "' not found in playout streams for offering '" + offeringKey + "'");
    }

    let stream = playoutStreams[streamKey];
    let reps = stream.representations;

    // make sure this is a video stream, and find the top rung
    const repKeys = Object.keys(reps);
    let topBitrate = -1;
    let topBitrateKey;

    for(let i = 0; i < repKeys.length; i++) {
      const rep = reps[repKeys[i]];
      if(rep.type !== "RepVideo") {
        this.throwError("Non-video rung '" + rep.type + "' found for playout stream.");
      }
      if(rep.bit_rate > topBitrate) {
        topBitrateKey = repKeys[i];
        topBitrate = rep.bit_rate;
      }
    }

    if(topBitrateKey === rungKey) {
      this.throwError("'" + rungKey + "' is the top rung, you cannot remove the top rung for a playout stream.");
    }

    if(!reps.hasOwnProperty(rungKey)) {
      this.throwError("Rung '" + rungKey + "' not found in playout stream.");
    }

    delete reps[rungKey];

    await this.metadataWrite(metadata);
  }

  header() {
    return "Removing video resolution ladder rung '" + this.args.rungKey + "' from stream '" + this.args.streamKey + "' of mezzanine offering '" + this.args.offeringKey + "'... ";
  }

  options() {
    return super.options()
      .option("streamKey", {
        alias: "stream-key",
        default: "video",
        describe: "Playout stream to remove rung from",
        type: "string"
      })
      .option("rungKey", {
        alias: "rung-key",
        describe: "Ladder rung to remove",
        demandOption: true,
        type: "string"
      });
  }
}

const script = new OfferingRemoveVideoRung;
script.run();