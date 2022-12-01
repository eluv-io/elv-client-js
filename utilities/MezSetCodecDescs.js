// Set codec descriptor strings for video stream representations
// If --writeToken passed in, do not finalize. Otherwise, a new write token
// is obtained, changes made, then draft is finalized.

const {fabricItemDesc} = require("./lib/helpers");
const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ExistObjOrDft = require("./lib/concerns/ExistObjOrDft");
const OfferingCodecDesc = require("./lib/concerns/OfferingCodecDesc");

class MezSetCodecDescs extends Utility {
  blueprint() {
    return {
      concerns: [
        ExistObjOrDft, OfferingCodecDesc
      ],
      options: [
        NewOpt("offeringKey", {
          descTemplate: "Offering key (in object metadata /offerings/). If omitted, all offerings will be processed.",
          type: "string"
        })
      ]
    };
  }

  async body() {
    const {offeringKey} = this.args;
    const {libraryId, objectId, writeToken} = await this.concerns.ExistObjOrDft.argsProc();

    await this.concerns.OfferingCodecDesc.setVideoRepCodecDescs({
      libraryId,
      objectId,
      offeringKey,
      writeToken
    });
  }

  header() {
    return `Set codec descriptor strings in bitrate ladder for video stream(s) in ${fabricItemDesc(this.args)}${this.args.offeringKey ? ` (offering '${this.args.offeringKey}')` : ""}.`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(MezSetCodecDescs);
} else {
  module.exports = MezSetCodecDescs;
}
