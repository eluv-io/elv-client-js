const {NewOpt} = require("../options");

const Finalize = require("./Finalize");
const Logger = require("./Logger");

const blueprint = {
  name: "FinalizeAndWait",
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

  const finalize = async ({libraryId, objectId, writeToken}) => {
    const latestHash = await context.concerns.Finalize.finalize({libraryId, objectId, writeToken, wait: !context.args.noWait});
    // Did prior line wait? If not, inform user
    if(context.args.noWait) logger.log("--no-wait specified, bypassing wait for publish to finish (finalized new object version may take up to several minutes to become available, depending on size and number of parts.");
    return latestHash;
  };

  // Needed as a separate function to call after client.FinalizeABRMezzanine()
  const waitUnlessNo = async ({libraryId,objectId,latestHash}) => {
    if(context.args.noWait) {
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