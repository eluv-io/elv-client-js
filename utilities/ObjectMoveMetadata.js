// Move metadata from one path to another within a single object
const objectPath = require("object-path");
const R = require("ramda");

const {ModOpt, NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const ExistingObject = require("./lib/concerns/ExistingObject");
const Metadata = require("./lib/concerns/Metadata");
const ObjectEditing = require("./lib/concerns/ObjectEditing");

class ObjectMoveMetadata extends Utility {
  blueprint() {
    return {
      concerns: [ExistingObject, ObjectEditing],
      options: [
        ModOpt("objectId", {ofX:" item to delete"}),
        ModOpt("libraryId", {ofX:" object to delete"}),
        NewOpt("oldPath", {
          descTemplate: "Old metadata path pointing to value or subtree to be moved (include leading '/')",
          type: "string"
        }),
        NewOpt("newPath", {
          demand: true,
          descTemplate: "New metadata path within object indicating new location for value or subtree (include leading '/')",
          type: "string"
        }),
        NewOpt("force", {
          descTemplate: "If target new metadata path within object exists, overwrite and replace",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const {newPath, oldPath} = this.args;

    // Check that keys are valid path strings
    if(!Metadata.validPathFormat(oldPath)) {
      throw new Error("\"" + oldPath + "\" is not in valid format for a metadata path (make sure it starts with a '/')");
    }
    if(!Metadata.validPathFormat(newPath)) {
      throw new Error("\"" + newPath + "\" is not in valid format for a metadata path (make sure it starts with a '/')");
    }

    await this.concerns.ExistingObject.libraryIdArgPopulate();

    const currentMetadata = await this.concerns.ExistingObject.readMetadata();

    // check to make sure oldKey exists
    if(!Metadata.pathExists(currentMetadata, oldPath)) {
      throw new Error("Metadata path '" + oldPath + "' not found.");
    }

    // make sure newKey does NOT exist, or --force specified
    if(!Metadata.validTargetPath(currentMetadata, newPath)) {
      const existingTargetValue = JSON.stringify(Metadata.valueAtPath(currentMetadata, newPath), null, 2);
      if(this.args.force) {
        this.logger.warn("Data already exists at '" + newPath + "', --force specified, replacing...\nOverwritten data: " + existingTargetValue);
      } else {
        throw new Error("Metadata path '" + newPath + "' is invalid (already exists, use --force to replace). Existing data: " + existingTargetValue);
      }
    }

    // move oldPath attribute to newPath
    const valueToMove = Metadata.valueAtPath(currentMetadata, oldPath);
    const revisedMetadata = R.clone(currentMetadata);

    objectPath.del(revisedMetadata,  Metadata.pathPieces(oldPath));
    objectPath.set(revisedMetadata, Metadata.pathPieces(newPath), valueToMove);

    // Write back metadata
    const newHash = await this.concerns.ObjectEditing.writeMetadata({metadata: revisedMetadata});
    this.logger.data("version_hash", newHash);
  }

  header() {
    return "Move metadata for object " + this.args.objectId + "... ";
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectMoveMetadata);
} else {
  module.exports = ObjectMoveMetadata;
}
