// for scripts that make media API calls

const ArgRespLogLevel = require("./ArgRespLogLevel");
const ArgStructLogLevel = require("./ArgStructLogLevel");

const blueprint = {
  name: "MediaAPI",
  concerns: [ArgRespLogLevel, ArgStructLogLevel]
};

const New = context => {
  // instance interface
  return {};
};

module.exports = {
  blueprint,
  New
};
