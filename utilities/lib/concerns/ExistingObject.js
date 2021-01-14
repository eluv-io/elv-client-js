const {StdOpt} = require("../options");

const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "ExistingObject",
  concerns: [Logger, Client],
  options: [
    StdOpt("libraryId", ),
    StdOpt("objectId", {demand: true})
  ]
};

const New = context => {
  const logger = context.concerns.Logger;

  const libraryIdGet = async (objectId) => {
    objectId = objectId || context.args.objectId;

    if(context.args.libraryId) return context.args.libraryId;

    const client = await context.concerns.Client.get();
    logger.log(`Looking up library ID for ${objectId}...`);
    return await client.ContentObjectLibraryId({objectId});
  };

  const readMetadata = async ({objectId, libraryId, metadataSubtree} = {}) => {
    objectId = objectId || context.args.objectId;
    libraryId = libraryId || await libraryIdGet({objectId});

    return await client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree
    });
  };

  return {libraryIdGet, readMetadata};
};

module.exports = {
  blueprint,
  New
};