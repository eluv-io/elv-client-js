const Client = require("./Client");
const ExistingObject = require("./ExistingObject");
const Finalization = require("./Finalization");
const Logger = require("./Logger");

const blueprint = {
  name: "ObjectEditing",
  concerns: [Logger, Client, ExistingObject, Finalization]
};

const New = context => {
  const logger = context.concerns.Logger;

  const writeMetadata =  async ({libraryId, objectId, metadata}) => {
    objectId = objectId || context.args.objectId;
    libraryId = libraryId || await context.concerns.ExistingObject.libraryIdGet({objectId});

    const client = await context.concerns.Client.get();
    const editResponse = await client.EditContentObject({
      libraryId,
      objectId
    });

    const writeToken = editResponse.write_token;

    logger.log("Writing metadata back to object...");
    await client.ReplaceMetadata({
      libraryId,
      metadata,
      objectId,
      writeToken
    });

    logger.log("Finalizing object...");
    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    logger.log("New version hash: " + finalizeResponse.hash);
    return finalizeResponse.hash;
  };

  return {writeMetadata};
};

module.exports = {
  blueprint,
  New
};