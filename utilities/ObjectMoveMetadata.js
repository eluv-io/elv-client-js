// Move metadata from one path to another within a single object
const objectPath = require("object-path");
const R = require("ramda");

const {ModOpt, NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const FabricObject = require("./lib/concerns/FabricObject");
const Metadata = require("./lib/concerns/Metadata");
const ObjectEdit = require("./lib/concerns/ObjectEdit");

class ObjectMoveMetadata extends Utility {
  blueprint() {
    return {
      concerns: [FabricObject, ObjectEdit, Metadata],
      options: [
        ModOpt("objectId", {ofX:" item to modify"}),
        ModOpt("libraryId", {ofX:" object to modify"}),
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
    if(!Metadata.validPathFormat(oldPath)) {
      throw new Error("\"" + oldPath + "\" is not in valid format for a metadata path (make sure it starts with a '/')");
    }
    if(!Metadata.validPathFormat(newPath)) {
      throw new Error("\"" + newPath + "\" is not in valid format for a metadata path (make sure it starts with a '/')");
    }

    await this.concerns.FabricObject.libraryIdArgPopulate();

    const currentMetadata = await this.concerns.FabricObject.getMetadata();

    // check to make sure oldPath exists
    if(!Metadata.pathExists(currentMetadata, oldPath)) {
      throw new Error("Metadata path '" + oldPath + "' not found.");
    }

    // make sure newPath does NOT exist, or --force specified
    this.concerns.Metadata.checkExisting({metadata: currentMetadata, targetPath: newPath, force: this.args.force});

    // move oldPath attribute to newPath
    const valueToMove = Metadata.valueAtPath(currentMetadata, oldPath);
    const revisedMetadata = R.clone(currentMetadata);

    objectPath.del(revisedMetadata,  Metadata.pathPieces(oldPath));
    objectPath.set(revisedMetadata, Metadata.pathPieces(newPath), valueToMove);

    // Write back metadata
    const newHash = await this.concerns.ObjectEdit.writeMetadata({metadata: revisedMetadata});
    this.logger.data("version_hash", newHash);
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
