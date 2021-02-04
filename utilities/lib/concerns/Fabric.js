// Code to factor out commonalities in dealing with library vs. object vs. version vs. draft
const R = require("ramda");

const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Fabric",
  concerns: [Client, Logger]
};

const New = context => {
  const logger = context.concerns.Logger;

  const partList = async ({libraryId, objectId, versionHash, writeToken}) => {
    const client = await context.concerns.Client.get();
    logger.log("Retrieving part list...");
    return await client.ContentParts({
      libraryId,
      objectId,
      versionHash,
      writeToken
    });
  };

  const versionList = async ({libraryId, objectId}) => {
    const client = await context.concerns.Client.get();
    logger.log(`Retrieving version list for object ${objectId}...`);
    const response = await client.ContentObjectVersions({
      libraryId,
      objectId
    });
    return R.map(R.pick(["hash", "type"]), response.versions);
  };

  // instance interface
  return {
    partList,
    versionList
  };
};

module.exports = {
  blueprint,
  New
};