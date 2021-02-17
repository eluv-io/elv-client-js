// code related to --type
const {NewOpt} = require("../options");

const ContentType = require("./ContentType");

const blueprint = {
  name: "ArgType",
  concerns: [ContentType],
  options: [
    NewOpt("type", {
      descTemplate: "Name, object ID, or version hash of content type{X}",
      type: "string"
    })
  ]
};

const New = context => {

  const typVersionHash = async () => await context.concerns.ContentType.refToVersionHash({typeRef: context.args.type});

  // instance interface
  return {typVersionHash};
};

module.exports = {
  blueprint,
  New
};