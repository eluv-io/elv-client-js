const kindOf = require("kind-of");

const {NewOpt} = require("../options");

const JSON = require("./JSON");
const Logger = require("./Logger");

const blueprint = {
  name: "Metadata",
  concerns: [JSON, Logger],
  options: [
    NewOpt("metadata", {
      descTemplate: "JSON string (or file path if prefixed with '@') to merge into metadata{X}",
      type: "string"
    })
  ]
};

const New = context => {
  const argMetadata = context.args.metadata;
  const J = context.concerns.JSON;

  const asObject = () => {
    if(argMetadata) {
      const metadataObj = J.parseStringOrFile(argMetadata);

      if(!metadataObj.hasOwnProperty("public")) {
        metadataObj.public = {};
      }

      if(kindOf(metadataObj.public) !== "object") {
        throw Error(`Expected metadata /public to be object, got ${kindOf(metadataObj.public)} instead`);
      }
    } else {
      return null;
    }
  };

  const skeleton = () => {
    return {public: {}};
  };

  return {asObject, skeleton};
};

module.exports = {blueprint, New};