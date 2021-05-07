// code related to working with a specific content part
const {fabricItemDesc} = require("../helpers");

const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Part",
  concerns: [Logger, Client]
};

const New = context => {
  const logger = context.concerns.Logger;

  const list = async ({libraryId, objectId, versionHash, writeToken}) => {
    if(!objectId && !versionHash && !writeToken) throw Error("Part.list() - need objectId, versionHash, or writeToken");

    const client = await context.concerns.Client.get();
    logger.log(`Retrieving part list for ${fabricItemDesc({objectId, versionHash, writeToken})}...`);
    return await client.ContentParts({
      libraryId,
      objectId,
      versionHash,
      writeToken
    });
  };

  // instance interface
  return {
    list
  };
};

module.exports = {
  blueprint,
  New
};