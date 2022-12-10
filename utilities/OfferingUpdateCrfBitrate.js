// set video bitrate

const R = require("ramda");

const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ExistObj = require("./lib/concerns/ExistObj");
const Metadata = require("./lib/concerns/Metadata");


class OfferingUpdateCrfBitrate extends Utility {
  static blueprint() {
    return {
      concerns: [
        ExistObj, Metadata
      ],
      options: [
        NewOpt("offeringKey", {
          default: "default",
          descTemplate: "Name of offering.",
          type: "string"
        })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {offeringKey} = this.args;
    const {libraryId, objectId} = await this.concerns.ExistObj.argsProc();

    const partList = await this.concerns.ExistObj.partList();
    const partSizeMap = R.reduce((acc, val) => {
      acc[val.hash] = val.size;
      return acc;
    }, {}, partList);

    logger.log("Retrieving existing metadata from object...");
    const currentMetadata = await this.concerns.ExistObj.metadata();
    const revisedMetadata = R.clone(currentMetadata);

    // find video streams
    for(const [streamKey, stream] of R.toPairs(currentMetadata.offerings[offeringKey].media_struct.streams)) {
      if(stream.codec_type === "video") {
        const streamSize = stream.sources.reduce((acc, val) => acc + partSizeMap[val.source], 0);

        const bitRate = streamSize * 8 / stream.duration.float;
        const roundedBitRate = Number((bitRate).toPrecision(3));
        revisedMetadata.offerings[offeringKey].media_struct.streams[streamKey].bit_rate = Math.round(bitRate);

        logger.log(`Average bitrate: ${roundedBitRate.toLocaleString("en-US")}`);

        // find playout format for this stream
        const reps = currentMetadata.offerings[offeringKey].playout.streams[streamKey].representations;
        if(Object.keys(reps).length > 1) throw Error("More than one representation found for video stream");
        const newReps = {};
        for(const [repKey, rep] of R.toPairs(reps)) {
          const newKey = repKey.split("@")[0] + "@" + roundedBitRate;
          const newRep = R.clone(rep);
          newRep.bit_rate = roundedBitRate;
          newReps[newKey] = newRep;
        }
        revisedMetadata.offerings[offeringKey].playout.streams[streamKey].representations = newReps;
      }
    }

    // Write back metadata
    const newHash = await this.concerns.Metadata.write({
      libraryId,
      metadata: revisedMetadata,
      objectId,
      commitMessage: `Update CRF bitrate for video stream(s) in offering '${offeringKey}'`
    });
    logger.data("versionHash", newHash);
    logger.log("New version hash: " + newHash);
  }

  header() {
    return `Update bitrate for CRF stream(s) in offering '${this.args.offeringKey}', object ${this.args.objectId}.`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(OfferingUpdateCrfBitrate);
} else {
  module.exports = OfferingUpdateCrfBitrate;
}
