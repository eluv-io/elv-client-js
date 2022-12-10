// Regenerate DRM keys
// If --writeToken passed in, do not finalize. Otherwise, a new write token
// is obtained, changes made, then draft is finalized.

const {fabricItemDesc} = require("./lib/helpers");
const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const Logger = require("./lib/concerns/Logger");
const ExistObjOrDft = require("./lib/concerns/ExistObjOrDft");
const MediaAPI = require("./lib/concerns/MediaAPI");
const Offerings = require("./lib/concerns/Offerings");

class MezRegenDRMKeys extends Utility {
  static blueprint() {
    return {
      concerns: [Logger, Client, MediaAPI, ExistObjOrDft, Offerings],
      options: [
        NewOpt("offeringKey", {
          descTemplate: "Offering key (in object metadata /offerings/). If omitted, all offerings will be processed.",
          type: "string"
        })
      ]
    };
  }

  async body() {
    const {
      offeringKey,
      respLogLevel,
      structLogLevel
    } = this.args;

    const {
      libraryId,
      objectId,
      writeToken
    } = await this.concerns.ExistObjOrDft.argsProc();

    const logger = this.concerns.Logger;

    const offeringKeys = offeringKey
      ? [offeringKey]
      : await this.concerns.Offerings.list({
        libraryId,
        objectId,
        writeToken
      });

    if(offeringKeys.length === 0) throw Error("No offerings found");
    logger.data("foundOfferingKeys", offeringKeys);
    logger.data("processedOfferingKeys", []);

    // if write token wasn't passed in, obtain one
    const callWriteToken = writeToken || await this.concerns.Edit.getWriteToken({libraryId, objectId});
    logger.data("writeToken", callWriteToken);

    logger.data("finalized", false);

    const client = await this.concerns.Client.get();

    for(const offeringKey of offeringKeys) {
      const {data, logs, errors, warnings} = await client.CallBitcodeMethod({
        libraryId,
        objectId,
        writeToken: callWriteToken,
        method: `/media/offerings/${offeringKey}/regen_drm`,
        constant: false,
        queryParams: {
          response_log_level: respLogLevel,
          struct_log_level: structLogLevel
        }
      });
      this.concerns.Logger.errorsAndWarnings({errors, warnings});
      logger.dataConcat("processedOfferingKeys", offeringKey);
    }


    if(!writeToken) {
      const versionHash = await this.concerns.Edit.finalize({
        libraryId,
        objectId,
        writeToken: callWriteToken,
        commitMessage: `Add/regenerate DRM keys for offering(s): ${offeringKeys.join(", ")}`
      });
      logger.data("versionHash", versionHash);
    }
  }

  header() {
    return `Set codec descriptor strings in bitrate ladder for video stream(s) in ${fabricItemDesc(this.args)}${this.args.offeringKey ? ` (offering '${this.args.offeringKey}')` : ""}.`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(MezRegenDRMKeys);
} else {
  module.exports = MezRegenDRMKeys;
}
