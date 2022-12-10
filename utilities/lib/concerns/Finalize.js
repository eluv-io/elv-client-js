const {seconds} = require("../helpers");

const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Finalize",
  concerns: [Logger, Client]
};

const New = context => {
  const logger = context.concerns.Logger;

  const finalize = async ({libraryId, noWait, objectId, writeToken, commitMessage}) => {
    const client = await context.concerns.Client.get();
    logger.log("Finalizing object...");
    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken,
      commitMessage
    });
    const latestHash = finalizeResponse.hash;
    logger.log(`Finalized, new version hash: ${latestHash}`);
    if(noWait) {
      logger.log("Skipping wait for new hash to become available (finalized new object version may take up to several minutes to become available, depending on size and number of parts.)");
    } else {
      await waitForPublish({libraryId, objectId, latestHash});
    }
    return latestHash;
  };

  const waitForPublish = async ({latestHash, libraryId, objectId}) => {
    logger.log("Waiting for publishing to finish and new object version to become available...");
    const client = await context.concerns.Client.get();
    let publishFinished = false;
    let latestObjectData = {};
    while(!publishFinished) {
      latestObjectData = await client.ContentObject({libraryId, objectId});
      if(latestObjectData.hash === latestHash) {
        logger.log(`New object version now available: ${latestHash}`);
        publishFinished = true;
      } else {
        logger.log("  new version not available yet, waiting 15 seconds...");
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
