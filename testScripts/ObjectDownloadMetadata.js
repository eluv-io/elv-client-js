/* eslint-disable no-console */
const ScriptBase = require("./parentClasses/ScriptBase");
ScriptBase.deprecationNotice("ObjectGetMetadata.js");

const fs = require("fs");
const {JSONPath} = require("jsonpath-plus");

const MetadataMixin = require("./parentClasses/MetadataMixin");

class ObjectDownloadMetadata extends MetadataMixin(ScriptBase) {
  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const jsonPath = this.args.jsonPath;
    const file = this.args.file;

    // get object metadata
    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    let result;

    // if jsonPath supplied, use
    if(jsonPath) {
      result = JSONPath({
        json: metadata,
        path: jsonPath,
        wrap: false
      });
    } else {
      result = metadata;
    }

    if(result === undefined) {
      throw new Error("no matching metadata found");
    }
    fs.writeFileSync(file, JSON.stringify(result, null, 2));
  }

  header() {
    return "Downloading metadata from '" + this.args.objectId + "' to '" + this.args.file + "'";
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
      .option("jsonPath", {
        alias: "json-path",
        describe: "JSON Path expression for subset to save (see https://www.npmjs.com/package/jsonpath-plus for examples). If omitted, all metadata will be saved.",
        type: "string"
      })
      .option("file", {
        demandOption: true,
        describe: "File name/path to save to",
        type: "string"
      });
  }
}

const script = new ObjectDownloadMetadata;
script.run();