const {NewOpt} = require("../options");

const blueprint = {
  name: "ArgLroId",
  options: [
    NewOpt("lroId", {
      descTemplate: "ID of LRO{X} (should start with 'tlro')",
      implies: "writeToken",
      type: "string"
    })
  ]
};

const New = context => {
  return context.args.lroId;
};

module.exports = {
  blueprint,
  New
};
