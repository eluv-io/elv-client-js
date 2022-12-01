// code related to editing fabric objects
const kindOf = require("kind-of");

const Client = require("./Client");
const Finalize = require("./Finalize");
const Logger = require("./Logger");

const blueprint = {
  name: "Edit",
  concerns: [Finalize, Logger, Client]
};

const New = context => {
  const logger = context.concerns.Logger;

  const finalize = async ({libraryId, noWait, objectId, writeToken}) => {
    return await context.concerns.Finalize.finalize({
      libraryId,
      noWait,
      objectId,
      writeToken
    });
  };

  const getWriteToken = async ({libraryId, objectId} = {}) => {
    logger.log("Getting write token...");
    const client = await context.concerns.Client.get();
    const editResponse = await client.EditContentObject({
      libraryId,
      objectId
    });
    logger.log(`New write token: ${editResponse.write_token}`);
    return editResponse.write_token;
  };

  // if writeToken passed in, don't finalize
  // if writeToken not passed in, get one and finalize after
  const writeMetadata =  async ({libraryId, metadata, metadataSubtree, noWait, objectId, writeToken}) => {
    const writeTokenSupplied = kindOf(writeToken) === "string";
    if(!writeTokenSupplied ) writeToken = await getWriteToken({libraryId, objectId});

    logger.log("Writing metadata to object...");
    const client = await context.concerns.Client.get();
    await client.ReplaceMetadata({
      libraryId,
      metadata,
      metadataSubtree,
      objectId,
      writeToken
    });

    if(!writeTokenSupplied) {
      // return latest version hash
      return await finalize({
        libraryId,
        noWait,
        objectId,
        writeToken
      });
    }

  };

  return {
    finalize,
    getWriteToken,
    writeMetadata
  };
};

module.exports = {
  blueprint,
  New
};
