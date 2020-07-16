/* eslint-disable no-console */

// Outputs the resolution ladder(s) for all streams in an offering

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingAddVideoRung extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const streamKey = this.args.streamKey;
    const ignoreAspectRatio = this.args.ignoreAspectRatio;

    const newHeight = this.args.height;
    let newWidth = this.args.width;
    let newBitrate = this.args.bitrate;
    this.validateNonNegativeInt(newHeight, "height");

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
    let topBitrateHeight = -1;
    let topBitrateWidth = -1;

    for(let i = 0; i < repKeys.length; i++) {
      const rep = reps[repKeys[i]];
      if(rep.type !== "RepVideo") {
        this.throwError("Non-video rung '" + rep.type + "' found for playout stream.");
      }
      if(rep.bit_rate > topBitrate) {
        topBitrate = rep.bit_rate;
        topBitrateHeight = rep.height;
        topBitrateWidth = rep.width;
      }
    }

    if(topBitrateHeight === -1) {
      this.throwError("No valid existing rungs found for playout stream.");
    }

    if(newHeight > topBitrateHeight) {
      this.throwError("Height must be less than or equal to top rung's height (" + topBitrateHeight + ")");
    }

    const topRungAspectRatio = topBitrateWidth / topBitrateHeight;
    const topRungBitsPerPixel = topBitrate / (topBitrateWidth * topBitrateHeight);

    // validate or compute width and bitrate
    if(newWidth) {
      this.validateNonNegativeInt(newWidth, "width");
      if(newWidth > topBitrateWidth) {
        this.throwError("Width must be less than or equal to top rung's width (" + topBitrateWidth + ")");
      }
    } else {
      newWidth = Math.round(newHeight * topRungAspectRatio);
      console.log("Computed width for new rung: " + newWidth);
      this.validateNonNegativeInt(newWidth, "automatically computed width");
      if(newWidth > topBitrateWidth) {
        this.throwError("Automatically computed width must be less than or equal to existing top rung's width (" + topBitrateWidth + ")" );
      }
    }

    if(!ignoreAspectRatio) {
      const newAspectRatio = newWidth / newHeight;
      const deviation = Math.abs(topRungAspectRatio - newAspectRatio)/topRungAspectRatio;
      if(deviation >= 0.05) {
        this.throwError("New rung's aspect ratio (" + newAspectRatio + ") differs from existing top rung's aspect ratio (" + topRungAspectRatio + ") by more than 5% (difference: " + (deviation * 100) +"%)" );
      }
    }

    if(newBitrate) {
      this.validateNonNegativeInt(newBitrate, "bitrate");
      if(newBitrate >= topBitrate) {
        this.throwError("Bitrate must be smaller than existing top rung's bitrate (" + topBitrate + ")" );
      }
    } else {
      newBitrate = Math.round(newWidth * newHeight * topRungBitsPerPixel);
      console.log("Computed bitrate for new rung: " + newBitrate);
      // the following 2 checks should be superfluous, but better to be safe
      this.validateNonNegativeInt(newBitrate, "automatically computed bitrate");
      if(newBitrate >= topBitrate) {
        this.throwError("Automatically computed bitrate must be smaller than existing top rung's bitrate (" + topBitrate + ")" );
      }
    }

    const newRepKey = streamKey + "_" + newWidth + "x" + newHeight + "@" + newBitrate;

    if(reps.hasOwnProperty(newRepKey)) {
      this.throwError("Playout stream already has a ladder rung with key '" + newRepKey + "'");
    }

    // check for existing rung with identical parameters
    for(let i = 0; i < repKeys.length; i++) {
      const rep = reps[repKeys[i]];
      if(rep.width === newWidth && rep.height === newHeight && rep.bit_rate === newBitrate) {
        this.throwError("Rung with identical width/height/bitrate already exists (" + repKeys[i] + ")");
      }
    }

    console.log("New rung key: " + newRepKey);
    reps[newRepKey] = {
      bit_rate: newBitrate,
      crf: 0,
      height: newHeight,
      media_struct_stream_key: streamKey,
      type: "RepVideo",
      width: newWidth
    };

    await this.metadataWrite(metadata);
  }

  header() {
    return "Adding video rung to playout stream '" + this.args.streamKey + "' in offering '" + this.args.offeringKey + "'";
  }

  options() {
    return super.options()
      .option("streamKey", {
        alias: "stream-key",
        default: "video",
        describe: "Playout stream to add rung to",
        type: "string"
      })
      .option("width", {
        describe: "Horizontal resolution for new rung (if omitted, will be calculated based on aspect ratio of existing top rung and new height)",
        type: "number"
      })
      .option("height", {
        describe: "Vertical resolution for new rung",
        demandOption: true,
        type: "number"
      })
      .option("bitrate", {
        describe: "Bitrate for new rung (if omitted, will be calculated based on number of pixels compared to existing top rung)",
        type: "number"
      })
      .option("ignoreAspectRatio", {
        alias: "ignore-aspect-ratio",
        describe: "Add even if new rung's aspect ratio differs more than 5% from existing top rung",
        type: "boolean"
      });
  }

}

const script = new OfferingAddVideoRung;
script.run();