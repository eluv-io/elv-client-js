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

  // populate --libraryId if missing, to prevent multiple lookups
  const libraryIdArgPopulate = async () => {
    context.args.libraryId = await libraryIdGet();
  };

  const libraryIdGet = async (objectId) => {
    objectId = objectId || context.args.objectId;

    if(context.args.libraryId) return context.args.libraryId;

    const client = await context.concerns.Client.get();
    logger.log(`Looking up library ID for ${objectId}...`);
    const libId = await client.ContentObjectLibraryId({objectId});
    logger.log(`Found library ID: ${libId}...`);
    return libId;
  };

  const readMetadata = async ({objectId, libraryId, metadataSubtree} = {}) => {
    objectId = objectId || context.args.objectId;
    libraryId = libraryId || await libraryIdGet(objectId);

    const client = await context.concerns.Client.get();
    return await client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree
    });
  };

  return {libraryIdArgPopulate, libraryIdGet, readMetadata};
};

module.exports = {
  blueprint,
  New
};