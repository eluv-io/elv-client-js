// code related to --noWait arg (skip wait for finalized new version to become available)
const {NewOpt} = require("../options");

const Finalize = require("./Finalize");
const Logger = require("./Logger");

const blueprint = {
  name: "ArgNoWait",
  concerns: [Logger, Finalize],
  options: [
    NewOpt("noWait", {
      descTemplate: "When finalizing, exit script immediately after finalize call rather than waiting for publish to finish",
      type: "boolean"
    })
  ]
};

const New = context => {
  const logger = context.concerns.Logger;
  const {noWait} = context.args;

  const finalize = async ({libraryId, objectId, writeToken, commitMessage}) => {
    if(noWait) logger.log("Finalize object (--no-wait)");
    return await context.concerns.Finalize.finalize({
      libraryId,
      noWait,
      objectId,
      writeToken,
      commitMessage
    });
  };

  // Needed as a separate function to call after client.FinalizeABRMezzanine()
  const waitUnlessNo = async ({latestHash, libraryId, objectId}) => {
    if(noWait) {
      logger.log("--no-wait specified, bypassing wait for publish to finish (finalized new object version may take up to several minutes to become available, depending on size and number of parts.");
    } else {
      await context.concerns.Finalize.waitForPublish({libraryId,objectId,latestHash});
    }
  };

  return {finalize, waitUnlessNo};
};

module.exports = {
  blueprint,
  New
};
