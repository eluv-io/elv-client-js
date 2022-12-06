const {NewOpt} = require("../options");

const blueprint = {
  name: "ArgStructLogLevel",
  options: [
    NewOpt("structLogLevel", {
      choices: ["none", "error", "warn", "info", "debug"],
      descTemplate: "Logging level for saving messages to object metadata during node media API calls",
      type: "string"
    })
  ]
};

const New = context => {
  // instance interface
  return {};
};

module.exports = {
  blueprint,
  New
};
