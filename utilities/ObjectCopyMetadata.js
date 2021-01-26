// Copy metadata from one path to another within a single object
const objectPath = require("object-path");
const R = require("ramda");

const {ModOpt, NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const FabricObject = require("./lib/concerns/FabricObject");
const Metadata = require("./lib/concerns/Metadata");
const ObjectEdit = require("./lib/concerns/ObjectEdit");

class ObjectCopyMetadata extends Utility {
  blueprint() {
    return {
      concerns: [FabricObject, ObjectEdit],
      options: [
        ModOpt("objectId", {ofX:" item to modify"}),
        ModOpt("libraryId", {ofX:" object to modify"}),
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
    if(!Metadata.validPathFormat(sourcePath)) {
      throw new Error("\"" + sourcePath + "\" is not in valid format for a metadata path (make sure it starts with a '/')");
    }
    if(!Metadata.validPathFormat(targetPath)) {
      throw new Error("\"" + targetPath + "\" is not in valid format for a metadata path (make sure it starts with a '/')");
    }

    await this.concerns.FabricObject.libraryIdArgPopulate();

    const currentMetadata = await this.concerns.FabricObject.getMetadata();

    // check to make sure sourcePath exists
    if(!Metadata.pathExists(currentMetadata, sourcePath)) {
      throw new Error("Metadata path '" + sourcePath + "' not found.");
    }

    // make sure targetPath does NOT exist, or --force specified
    if(!Metadata.validTargetPath(currentMetadata, targetPath)) {
      const existingTargetValue = JSON.stringify(Metadata.valueAtPath(currentMetadata, targetPath), null, 2);
      if(this.args.force) {
        this.logger.warn("Data already exists at '" + targetPath + "', --force specified, replacing...\nOverwritten data: " + existingTargetValue);
      } else {
        throw new Error("Metadata path '" + targetPath + "' is invalid (already exists, use --force to replace). Existing data: " + existingTargetValue);
      }
    }

    // copy sourcePath attribute to targetPath
    const valueToCopy = Metadata.valueAtPath(currentMetadata, sourcePath);
    const revisedMetadata = R.clone(currentMetadata);

    objectPath.set(revisedMetadata, Metadata.pathPieces(targetPath), valueToCopy);

    // Write back metadata
    const newHash = await this.concerns.ObjectEdit.writeMetadata({metadata: revisedMetadata});
    this.logger.data("version_hash", newHash);
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
