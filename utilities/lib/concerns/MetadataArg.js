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
  const asObject = () => argMetadata
    ? context.concerns.JSON.parseStringOrFile(argMetadata)
    : null;

  return {asObject};
};

module.exports = {
  blueprint,
  New
};