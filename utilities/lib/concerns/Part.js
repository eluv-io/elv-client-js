// code related to working with a specific content part
const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Part",
  concerns: [Logger, Client]
};

const New = context => {
  // const logger = context.concerns.Logger;

  return {};
};

module.exports = {
  blueprint,
  New
};