const {NewOpt} = require("../options");

const JSON = require("./JSON");

const blueprint = {
  name: "ArgAddlOfferingSpecs",
  concerns: [JSON],
  options: [
    NewOpt("addlOfferingSpecs", {
      descTemplate: "JSON string (or file path if prefixed with '@') for additional offerings to create via patching",
      implies: "abrProfile",
      type: "string"
    })
  ]
};

const New = context => {
  const argAddlOfferingSpecs = context.args.addlOfferingSpecs;

  // convert --addlOfferingSpecs argument to object (either literal JSON or @filePath)
  const asObject = () => argAddlOfferingSpecs
    ? context.concerns.JSON.parseStringOrFile({strOrPath: argAddlOfferingSpecs})
    : null;

  // instance interface
  return {
    asObject
  };
};

module.exports = {
  blueprint,
  New
};
