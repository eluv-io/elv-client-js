// for scripts that work with Drafts (new unfinalized objects/versions)
const Client = require("./Client");
const Logger = require("./Logger");
const Utils = require("../../../src/Utils");

const blueprint = {
  name: "Draft",
  concerns: [Client, Logger]
};

const New = context => {
  const logger = context.concerns.Logger;

  const create = async ({libraryId, objectId, metadata, type}) => {
    if(!libraryId && !objectId) throw Error("Draft.create() - no libraryId or objectId supplied");
    const client = await context.concerns.Client.get();
    const options = {
      meta: metadata,
      type
    };

    let response;
    if(objectId) {
      // create new draft version
      logger.log(`Creating new draft version for object ${objectId}...`);
      response = await client.EditContentObject({
        libraryId,
        objectId,
        options
      });
    } else {
      // create new draft object
      logger.log(`Creating new draft object in library ${libraryId}...`);
      response = await client.CreateContentObject({
        libraryId,
        options
      });
      logger.log(`New object ID: ${response.objectId}`);
    }

    logger.log(`New write token: ${response.writeToken}`);
    return {
      objectId: response.objectId,
      writeToken: response.writeToken
    };
  };

  const decode = ({writeToken}) => {
    if(!writeToken) throw Error("Draft.decode() - missing writeToken");
    return Utils.DecodeWriteToken(writeToken);
  };

  // instance interface
  return {
    create,
    decode
  };
};

module.exports = {
  blueprint,
  New
};
