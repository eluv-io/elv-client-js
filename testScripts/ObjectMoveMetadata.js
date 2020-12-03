/* eslint-disable no-console */

const objectPath = require("object-path");
const ScriptBase = require("./parentClasses/ScriptBase");
const MetadataMixin = require("./parentClasses/MetadataMixin");

const regex = /^(\/[^/]+)+$/;

// Makes sure all attributes along object path are objects or undefined, and that path ends at an undefined attribute
function validateObjectPath(nestedObj, pathArr) {
  let obj = nestedObj;
  for(const key of pathArr) {
    if(obj === undefined) {
      return true;
    }
    if(obj.constructor.name !== "Object") {
      break;
    }
    obj = obj[key];
  }
  // Make sure end is undefined
  return obj === undefined;
}

class ObjectMoveMetadata extends MetadataMixin(ScriptBase) {
  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const newKey = this.args.newKey;
    const oldKey = this.args.oldKey;

    // Check that keys are valid path strings
    if(newKey.match(regex)[0] !== newKey) {
      throw new Error(newKey + " is not a valid metadata path.");
    }
    if(oldKey.match(regex)[0] !== oldKey) {
      throw new Error(oldKey + " is not a valid metadata path.");
    }

    // split object path into arrays
    const oldKeyArr = oldKey.split("/").slice(1);

    const newKeyArr = newKey.split("/").slice(1);

    // get object metadata
    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    // check to make sure oldKey exists
    if(!objectPath.has(metadata, oldKeyArr)) {
      throw new Error("Metadata path '" + oldKey + "' not found.");
    }

    // make sure newKey does NOT exist
    if(!validateObjectPath(metadata, newKeyArr)) {
      throw new Error("Metadata path '" + newKey + "' is invalid.");
    }

    // move oldKey attribute to newKey
    const toMove = objectPath.get(metadata, oldKeyArr);
    objectPath.del(metadata, oldKeyArr);
    objectPath.set(metadata, newKeyArr, toMove);

    // Write back metadata
    await this.metadataWrite(metadata);

  }

  header() {
    return "Moving metadata from '" + this.args.oldKey + "' to '" + this.args.newKey + " for object '" + this.args.objectId + "'... ";
  }

  options() {
    return super.options()
      .option("libraryId", {
        alias: "library-id",
        demandOption: true,
        describe: "Library ID (should start with 'ilib')",
        type: "string"
      })
      .option("objectId", {
        alias: "object-id",
        demandOption: true,
        describe: "Object ID (should start with 'iq__')",
        type: "string"
      })
      .option("oldKey", {
        demandOption: true,
        describe: "Old metadata object path to indicating attribute to be moved (include leading '/')",
        type: "string"
      })
      .option("newKey", {
        demandOption: true,
        describe: "New metadata file path within object indicating attribute to be added (include leading '/')",
        type: "string"
      });
  }
}

const script = new ObjectMoveMetadata;
script.run();