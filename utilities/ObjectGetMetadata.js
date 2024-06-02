// Retrieve metadata from object
const kindOf = require("kind-of");

const {ModOpt, NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const JPath = require("./lib/concerns/JPath");
const Metadata = require("./lib/concerns/Metadata");
const ExistObjOrVer = require("./lib/concerns/ExistObjOrVer");
const ArgOutfile = require("./lib/concerns/ArgOutfile");

class ObjectGetMetadata extends Utility {
  blueprint() {
    return {
      concerns: [JPath, ExistObjOrVer, ArgOutfile],
      options: [
        ModOpt("jpath", {X: "to extract"}),
        NewOpt("subtree", {
          descTemplate: "Path of subtree to retrieve (include leading '/'). If omitted, all metadata is retrieved.",
          type: "string"
        })
      ]
    };
  }

  async body() {
    const {subtree, outfile} = this.args;

    // Check that keys are valid path strings
    if(subtree && !Metadata.validPathFormat({path: subtree})) {
      throw Error("\"" + subtree + "\" is not in valid format for a metadata path (make sure it starts with a '/')");
    }

    await this.concerns.ExistObjOrVer.argsProc();

    const metadata = await this.concerns.ExistObjOrVer.metadata({subtree});
    if(kindOf(metadata) === "undefined") throw Error("no metadata found");
    const filteredMetadata = this.args.jpath
      ? this.concerns.JPath.match({metadata})
      : metadata;
    if(kindOf(filteredMetadata) === "undefined") throw Error("no metadata matched --jpath filter");

    if(outfile) {
      this.concerns.ArgOutfile.writeJson({obj: filteredMetadata});
    } else {
      this.logger.logObject(filteredMetadata);
    }
    this.logger.data("metadata", filteredMetadata);
  }

  header() {
    return `Get metadata for ${this.args.versionHash || this.args.objectId}${this.args.subtree ? ` subtree: ${this.args.subtree}` : ""}`;
  }
}

// avoid fetch ExperimentalWarnings
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if(name === `warning` && typeof data === `object` && data.name === `ExperimentalWarning`) {
    return false;
  }
  return originalEmit.apply(process, arguments);
};

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectGetMetadata);
} else {
  module.exports = ObjectGetMetadata;
}
