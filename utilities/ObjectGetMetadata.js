// Retrieve metadata form object
const kindOf = require("kind-of");

// .option("jsonPath", {
//   alias: "json-path",
//   describe: "JSON Path expression for subset to save (see https://www.npmjs.com/package/jsonpath-plus for examples). If omitted, all metadata will be saved.",
//   type: "string"
// })



const {NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const ExistingVersion = require("./lib/concerns/ExistingVersion");
const Metadata = require("./lib/concerns/Metadata");
const Outfile = require("./lib/concerns/Outfile");

class ObjectMoveMetadata extends Utility {
  blueprint() {
    return {
      concerns: [ExistingVersion, Outfile],
      options: [
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
    if(subtree && !Metadata.validPathFormat(subtree)) {
      throw Error("\"" + subtree + "\" is not in valid format for a metadata path (make sure it starts with a '/')");
    }

    await this.concerns.ExistingVersion.libraryIdArgPopulate();

    const metadata = await this.concerns.ExistingVersion.readMetadata({metadataSubtree: subtree});
    if(kindOf(metadata) === "undefined") throw Error("no metadata found");
    const data = Metadata.pretty(metadata);
    if(outfile) {
      this.concerns.Outfile.write({data});
    } else {
      this.logger.log(data);
    }
    this.logger.data("metadata", metadata);
  }

  header() {
    return "Get metadata for " + (this.args.objectId || this.args.versionHash) + "... ";
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectMoveMetadata);
} else {
  module.exports = ObjectMoveMetadata;
}
