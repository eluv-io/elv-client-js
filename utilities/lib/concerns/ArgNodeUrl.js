// code related to --nodeUrl
const {NewOpt} = require("../options");

const Client = require("./Client");
const Draft = require("./Draft");
const Logger = require("./Logger");

const blueprint = {
  name: "ArgNodeUrl",
  concerns: [Client, Draft, Logger],
  implies: "writeToken",
  options: [
    NewOpt("nodeUrl", {
      descTemplate: "URL of node that generated write token",
      type: "string"
    })
  ]
};

const New = context => {
  // instance interface
  return {
  };
};

module.exports = {
  blueprint,
  New
};
