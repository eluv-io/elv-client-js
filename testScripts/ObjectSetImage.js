/* eslint-disable no-console */

const ScriptBase = require("./parentClasses/ScriptBase");
const MetadataMixin = require("./parentClasses/MetadataMixin");

function getNestedObject(nestedObj, pathArr) {
  return pathArr.reduce((obj, key) =>
    (obj && obj[key] !== "undefined") ? obj[key] : undefined, nestedObj);
}

class ObjectSetImage extends MetadataMixin(ScriptBase) {

  async body() {
    const client = await this.client();

    const metadataImageSubtree = "public/display_image";

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const image = this.args.image;
    if(image.charAt(0) === "/") {
      throw new Error("--image must not start with '/'");
    }

    let filesMap = await client.ListFiles({
      libraryId,
      objectId
    });

    // check to make sure image exists
    const keys =  image.split("/");
    const fileEntry = getNestedObject(filesMap, keys);
    if(!fileEntry) {
      throw new Error("Image file '" + image + "' not found in object");
    }

    // modify and write metadata
    const editResponse = await client.EditContentObject({
      libraryId,
      objectId
    });
    const writeToken = editResponse.write_token;

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: metadataImageSubtree,
      metadata: {
        "/": `./files/${image}`
      }
    });

    console.log("Finalizing object...");
    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    console.log("New version hash: " + finalizeResponse.hash);

  }

  header() {
    return "Setting image for object " + this.args.objectId + " to '" + this.args.image + "'... ";
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
      .option("image", {
        demandOption: true,
        describe: "Image file path within object (do not include leading '/')",
        type: "string"
      });
  }
}

const script = new ObjectSetImage;
script.run();