const {NewOpt} = require("../options");
const {seconds} = require("../helpers");

const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Finalization",
  concerns: [Logger, Client],
  options: [
    NewOpt("noWait", {
      descTemplate: "When finalizing, exit script immediately after finalize call rather than waiting for publish to finish",
      type: "boolean"
    })
  ]
};

const New = context => {
  const logger = context.concerns.Logger;
  const waitOrNot = async ({libraryId, objectId, latestHash}) => {
    if(context.args.noWait) {
      logger.log("--no-wait specified, bypassing wait for publish to finish (finalized new object version may take up to several minutes to become visible, depending on size and number of parts.");
    } else {
      logger.log("Waiting for publishing to finish and new object version to become visible...");
      const client = await context.concerns.Client.get();
      let publishFinished = false;
      let latestObjectData = {};
      while(!publishFinished) {
        latestObjectData = await client.ContentObject({libraryId, objectId});
        if(latestObjectData.hash === latestHash) {
          publishFinished = true;
        } else {
          logger.log("  new version not visible yet, waiting 15 seconds...");
          await seconds(15);
        }
      }
    }
  };

  return {waitOrNot};
};

module.exports = {
  blueprint,
  New
};