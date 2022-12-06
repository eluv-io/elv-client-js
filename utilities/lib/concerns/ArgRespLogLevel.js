const {NewOpt} = require("../options");

const blueprint = {
  name: "ArgRespLogLevel",
  options: [
    NewOpt("respLogLevel", {
      choices: ["warn", "info", "debug"], // trying to set to 'none' or 'error' will have same effect as 'warn',
      descTemplate: "Log level for responses to node media API calls",
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
