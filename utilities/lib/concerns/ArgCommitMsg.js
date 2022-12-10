// code related to --libraryId

const {NewOpt} = require("../options");

const blueprint = {
  name: "ArgCommitMsg",
  options: [
    NewOpt("commitMsg", {
      descTemplate: "Commit message",
      conflicts: "writeToken", // normally conflicts, unless command is to finalize draft
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
