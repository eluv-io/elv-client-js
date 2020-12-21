/* eslint-disable no-console */
const fs = require("fs");
const {JSONPath} = require("jsonpath-plus");

/* eslint-disable no-console */

const ScriptBase = require("./parentClasses/ScriptBase");

class JsonQuery extends ScriptBase {

  async body() {

    const json = JSON.parse(fs.readFileSync(this.args.file));
    const path = this.args.jsonPath;
    const result = JSONPath({
      json,
      path,
      wrap: false
    });

    if(result === undefined) {
      throw new Error("no matching metadata found");
    } else {
      console.log(JSON.stringify(result, null, 2));
    }

  }

  header() {
    return "Executing jsonpath-plus query... ";
  }

  options() {
    return super.options()
      .option("file", {
        demandOption: true,
        describe: "File name/path of JSON file",
        type: "string"
      })
      .option("jsonPath", {
        alias: "json-path",
        demandOption: true,
        describe: "JSON Path expression (see https://www.npmjs.com/package/jsonpath-plus for examples).",
        type: "string"
      });
  }
}

const script = new JsonQuery;
script.run();