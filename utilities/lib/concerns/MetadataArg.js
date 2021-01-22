const kindOf = require("kind-of");

const {NewOpt} = require("../options");

const JSON = require("./JSON");

const blueprint = {
  name: "MetadataArg",
  concerns: [JSON],
  options: [
    NewOpt("metadata", {
      descTemplate: "JSON string (or file path if prefixed with '@') for metadata{X}",
      type: "string"
    })
  ]
};

const New = context => {
  const argMetadata = context.args.metadata;

  // convert --metadata argument to object (either literal JSON or @filePath)
  const asObject = () => {
    if(argMetadata) {
      const metadataObj = context.concerns.JSON.parseStringOrFile(argMetadata);
      if(!metadataObj.hasOwnProperty("public")) metadataObj.public = {};
      if(kindOf(metadataObj.public) !== "object") throw Error(`Expected metadata /public to be object, got ${kindOf(metadataObj.public)} instead`);
      return metadataObj;
    } else {
      return null;
    }
  };

  return {asObject};
};

module.exports = {
  blueprint,
  New
};