/* eslint-disable no-console */

// parent class for scripts that work with offerings

const ScriptBase = require("./ScriptBase");
const MetadataMixin = require("./MetadataMixin");

module.exports = class ScriptOffering extends MetadataMixin(ScriptBase) {

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
      .option("offeringKey", {
        alias: "offering-key",
        default: "default",
        describe: "Mezzanine offering key",
        type: "string"
      });
  }

  validateOffering(metadata, offeringKey) {
    // check to make sure we have offerings
    if(!metadata.offerings) {
      throw new Error("No offerings found in mezzanine metadata");
    }

    // check for specified offering key
    if(!metadata.offerings.hasOwnProperty(offeringKey)) {
      throw new Error("Offering '" + offeringKey + "' not found in mezzanine metadata");
    }
  }
};