// convert an offering to a just-started VoD-as-Live item

const R = require("ramda");

const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ExistObj = require("./lib/concerns/ExistObj");
const Metadata = require("./lib/concerns/Metadata");


class OfferingStartAsVaL extends Utility {
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
    const now = (new Date).toISOString();

    const metadataToMerge = {
      offerings: {
        [offeringKey]: {
          offer_as_live: true,
          offer_live_end_tol: 30,
          offer_live_seg_count: 3,
          offer_live_start_time: now,
        }
      }
    };

    // operations that need to wait on network access
    // ----------------------------------------------------
    const {libraryId, objectId} = await this.concerns.ExistObj.argsProc();

    logger.log("Retrieving existing metadata from object...");
    const currentMetadata = await this.concerns.ExistObj.metadata();

    const metadata = R.mergeDeepRight(currentMetadata, metadataToMerge);

    // Write back metadata
    const newHash = await this.concerns.Metadata.write({
      libraryId,
      metadata,
      objectId
    });
    this.logger.data("versionHash", newHash);
  }

  header() {
    return `"Start" VoD offering '${this.args.offeringKey}' in object ${this.args.objectId} as a live program`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(OfferingStartAsVaL);
} else {
  module.exports = OfferingStartAsVaL;
}
