const {NewOpt} = require("../options");

const JSON = require("./JSON");

const blueprint = {
  name: "JPath",
  options: [
    NewOpt("jpath", {
      descTemplate: "JSON Path expression{X} (see https://www.npmjs.com/package/jsonpath-plus for examples).",
      type: "string"
    })
  ]
};

const New = context => {
  const jpathArg = context.args.jpath;

  // convert --metadata argument to object (either literal JSON or @filePath)
  const match = ({pattern = jpathArg, metadata}) => JSON.jPath({pattern, metadata});

  return {match};
};

module.exports = {
  blueprint,
  New
};