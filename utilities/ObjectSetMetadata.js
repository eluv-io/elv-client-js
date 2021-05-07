// Replace metadata at a key
const objectPath = require("object-path");
const R = require("ramda");

const {ModOpt, NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ExistObj = require("./lib/concerns/ExistObj");
const Metadata = require("./lib/concerns/Metadata");
const ArgMetadata = require("./lib/concerns/ArgMetadata");

class ObjectSetMetadata extends Utility {
  blueprint() {
    return {
      concerns: [
        ExistObj,
        Metadata,
        ArgMetadata
      ],
      options: [
        NewOpt("path", {
          descTemplate: "Path within metadata to set (start with '/'). If omitted, all existing metadata will be replaced.",
          type: "string"
        }),
        NewOpt("force", {
          descTemplate: "If target metadata path within object exists, overwrite and replace",
          type: "boolean"
        }),
        ModOpt("metadata", {demand:true})
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {path} = this.args;

    // Check that path is a valid path string
    Metadata.validatePathFormat({path});

    const metadataFromArg = this.concerns.ArgMetadata.asObject();

    // operations that may need to wait on network access
    // ----------------------------------------------------
    const {libraryId, objectId} = await this.concerns.ExistObj.argsProc();

    logger.log("Retrieving existing metadata from object...");
    const currentMetadata = await this.concerns.ExistObj.metadata();

    // make sure targetPath does NOT exist, or --force specified
    this.concerns.Metadata.checkTargetPath({
      force: this.args.force,
      metadata: currentMetadata,
      targetPath: path
    });

    const revisedMetadata = R.clone(currentMetadata);
    objectPath.set(revisedMetadata, Metadata.pathPieces({path}), metadataFromArg);

    // Write back metadata
    const newHash = await this.concerns.Metadata.write({
      libraryId,
      metadata: revisedMetadata,
      objectId
    });
    this.logger.data("version_hash", newHash);
  }

  header() {
    return `Replace metadata ${this.args.path ? `at ${this.args.path} ` : ""}for object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectSetMetadata);
} else {
  module.exports = ObjectSetMetadata;
}