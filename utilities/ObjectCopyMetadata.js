// Copy metadata from one path to another within a single object
const objectPath = require("object-path");
const R = require("ramda");

const {ModOpt, NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ExistObj = require("./lib/concerns/ExistObj");
const Metadata = require("./lib/concerns/Metadata");

class ObjectCopyMetadata extends Utility {
  static blueprint() {
    return {
      concerns: [ExistObj, Metadata],
      options: [
        ModOpt("objectId", {ofX: " item to modify"}),
        ModOpt("libraryId", {ofX: " object to modify"}),
        NewOpt("sourcePath", {
          demand: true,
          descTemplate: "Metadata path pointing to value or subtree to be copied (include leading '/')",
          type: "string"
        }),
        NewOpt("targetPath", {
          demand: true,
          descTemplate: "Metadata path within object indicating location to copy to for value or subtree (include leading '/')",
          type: "string"
        }),
        NewOpt("force", {
          descTemplate: "If target metadata path within object exists, overwrite and replace existing value/subtree",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const {targetPath, sourcePath} = this.args;

    // Check that paths are valid path strings
    Metadata.validatePathFormat({path: sourcePath});
    Metadata.validatePathFormat({path: targetPath});

    const {libraryId, objectId} = await this.concerns.ExistObj.argsProc();
    const currentMetadata = await this.concerns.ExistObj.metadata();

    // check to make sure sourcePath exists
    Metadata.validatePathExists({metadata: currentMetadata, path: sourcePath});

    // make sure targetPath does NOT exist, or --force specified
    this.concerns.Metadata.checkTargetPath({
      force: this.args.force,
      metadata: currentMetadata,
      targetPath
    });

    // copy sourcePath attribute to targetPath
    const valueToCopy = Metadata.valueAtPath({
      metadata: currentMetadata,
      path: sourcePath
    });
    const revisedMetadata = R.clone(currentMetadata);
    objectPath.set(revisedMetadata, Metadata.pathPieces({path: targetPath}), valueToCopy);

    // Write back metadata
    const newHash = await this.concerns.Metadata.write({
      libraryId,
      metadata: revisedMetadata,
      objectId
    });
    this.logger.data("versionHash", newHash);
  }

  header() {
    return `Copy metadata for object ${this.args.objectId} from ${this.args.sourcePath} to ${this.args.targetPath}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectCopyMetadata);
} else {
  module.exports = ObjectCopyMetadata;
}
