// Replace metadata at a key
const objectPath = require("object-path");
const R = require("ramda");

const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const FabricObject = require("./lib/concerns/FabricObject");
const Metadata = require("./lib/concerns/Metadata");
const MetadataArg = require("./lib/concerns/MetadataArg");
const ObjectEdit = require("./lib/concerns/ObjectEdit");

class ObjectSetMetadata extends Utility {
  blueprint() {
    return {
      concerns: [
        Client,
        ObjectEdit,
        FabricObject,
        Metadata,
        MetadataArg,
        ObjectEdit
      ],
      options: [
        NewOpt("path", {
          descTemplate: "Path to store metadata (start with '/'). If omitted, all existing metadata will be replaced.",
          type: "string"
        }),
        NewOpt("force", {
          descTemplate: "If target metadata path within object exists, overwrite and replace",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {path} = this.args;

    // Check that path is a valid path string
    if(path && !Metadata.validPathFormat(path)) {
      throw new Error("\"" + path + "\" is not in valid format for a metadata path (make sure it starts with a '/')");
    }

    const metadataFromArg = this.concerns.MetadataArg.asObject();

    // operations that need to wait on network access
    // ----------------------------------------------------
    await this.concerns.ObjectEdit.libraryIdArgPopulate();
    const {libraryId, objectId} = this.args;

    logger.log("Retrieving existing metadata from object...");
    const currentMetadata = await this.concerns.FabricObject.getMetadata({
      libraryId,
      objectId
    });

    // make sure path does NOT exist, or --force specified
    this.concerns.Metadata.checkExisting({metadata: currentMetadata, targetPath: path, force: this.args.force});

    const revisedMetadata = R.clone(currentMetadata);
    objectPath.set(revisedMetadata, Metadata.pathPieces(path), metadataFromArg);

    // Write back metadata
    const newHash = await this.concerns.ObjectEdit.writeMetadata({metadata: revisedMetadata});
    this.logger.data("version_hash", newHash);

  }

  header() {
    return `Replace metadata ${this.args.subtree ? `at ${this.args.subtree} ` : ""}for object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectSetMetadata);
} else {
  module.exports = ObjectSetMetadata;
}