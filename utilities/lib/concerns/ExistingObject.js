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

  const libraryId = async () => {
    if(context.args.libraryId) return context.args.libraryId;

    const client = await context.concerns.Client.get();
    logger.log(`Looking up library ID for ${context.args.objectId}...`);
    return await client.ContentObjectLibraryId({objectId: context.args.objectId});
  };

  return {libraryId};
};

module.exports = {
  blueprint,
  New
};