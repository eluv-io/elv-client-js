// Code to factor out commonalities in dealing with library vs. object vs. version vs. draft

const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Fabric",
  concerns: [Client, Logger]
};

const New = context => {
  // const logger = context.concerns.Logger;

  // instance interface
  return {};
};

module.exports = {
  blueprint,
  New
};