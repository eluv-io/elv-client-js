// code related to parts
const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Part",
  concerns: [Logger, Client]
};

const New = context => {
  const logger = context.concerns.Logger;

  const list = async ({objectId, libraryId, versionHash} = {}) => {
    const client = await context.concerns.Client.get();
    logger.log("Retrieving part list from object...");
    return await client.ContentParts({
      libraryId,
      objectId,
      versionHash
    });
  };

  return {list};
};

module.exports = {
  blueprint,
  New
};