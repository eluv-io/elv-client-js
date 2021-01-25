const {seconds} = require("../helpers");

const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Finalize",
  concerns: [Logger, Client]
};

const New = context => {
  const logger = context.concerns.Logger;

  const finalize = async ({libraryId, objectId, writeToken, wait = true}) => {
    logger.log("Finalizing object...");
    const client = await context.concerns.Client.get();

    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    const latestHash = finalizeResponse.hash;
    if(wait) await waitForPublish({libraryId, objectId, latestHash});
    return latestHash;
  };

  const waitForPublish = async ({libraryId, objectId, latestHash}) => {
    logger.log(`Waiting for publishing to finish and new object version ${latestHash} to become visible...`);
    const client = await context.concerns.Client.get();
    let publishFinished = false;
    let latestObjectData = {};
    while(!publishFinished) {
      latestObjectData = await client.ContentObject({libraryId, objectId});
      if(latestObjectData.hash === latestHash) {
        logger.log(`New object version ${latestHash} now visible`);
        publishFinished = true;
      } else {
        logger.log("  new version not visible yet, waiting 15 seconds...");
        await seconds(15);
      }
    }
  };

  return {finalize, waitForPublish};
};

module.exports = {
  blueprint,
  New
};