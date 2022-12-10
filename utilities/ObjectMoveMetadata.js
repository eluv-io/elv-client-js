// Move metadata from one path to another within a single object
const objectPath = require("object-path");
const R = require("ramda");

const {ModOpt, NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const ExistObj = require("./lib/concerns/ExistObj");
const Metadata = require("./lib/concerns/Metadata");

class ObjectMoveMetadata extends Utility {
  static blueprint() {
    return {
      concerns: [ExistObj, Metadata],
      options: [
        ModOpt("objectId", {ofX: " item to modify"}),
        ModOpt("libraryId", {ofX: " object to modify"}),
        NewOpt("oldPath", {
          demand: true,
          descTemplate: "Old metadata path pointing to value or subtree to be moved (include leading '/')",
          type: "string"
        }),
        NewOpt("newPath", {
          demand: true,
          descTemplate: "New metadata path within object indicating new location for value or subtree (include leading '/')",
          type: "string"
        }),
        NewOpt("force", {
          descTemplate: "If target new metadata path within object exists, overwrite and replace existing value/subtree",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const {newPath, oldPath} = this.args;

    // Check that paths are valid path strings
    Metadata.validatePathFormat({path: oldPath});
    Metadata.validatePathFormat({path: newPath});

    const {libraryId, objectId} = await this.concerns.ExistObj.argsProc();
    const currentMetadata = await this.concerns.ExistObj.metadata();

    // check to make sure oldPath exists
    if(!Metadata.pathExists({
      metadata: currentMetadata,
      path: oldPath
    })) throw new Error("Metadata path '" + oldPath + "' not found.");

    // make sure newPath does NOT exist, or --force specified
    this.concerns.Metadata.checkTargetPath({
      force: this.args.force,
      metadata: currentMetadata,
      targetPath: newPath
    });

    // move oldPath attribute to newPath
    const valueToMove = Metadata.valueAtPath({
      metadata: currentMetadata,
      path: oldPath
    });
    const revisedMetadata = R.clone(currentMetadata);

    objectPath.del(revisedMetadata, Metadata.pathPieces({path: oldPath}));
    objectPath.set(revisedMetadata, Metadata.pathPieces({path: newPath}), valueToMove);

    // Write back metadata
    const newHash = await this.concerns.Metadata.write({
      libraryId,
      metadata: revisedMetadata,
      objectId,
      commitMessage: `Move metadata from ${oldPath} to ${newPath}`
    });
    this.logger.data("versionHash", newHash);
  }

  header() {
    return `Move metadata for object ${this.args.objectId} from ${this.args.oldPath} to ${this.args.newPath}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectMoveMetadata);
} else {
  module.exports = ObjectMoveMetadata;
}
