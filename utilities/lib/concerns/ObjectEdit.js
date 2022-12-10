const Client = require("./Client");
const FabricObject = require("./FabricObject");
const FinalizeAndWait = require("./FinalizeAndWait");
const Logger = require("./Logger");

const blueprint = {
  name: "ObjectEdit",
  concerns: [Logger, Client, FabricObject, FinalizeAndWait]
};

const New = context => {
  const logger = context.concerns.Logger;

  // const addFiles = async () => {
  //
  // };

  const finalize = async ({libraryId, objectId, writeToken, commitMessage}) => {
    objectId = objectId || context.args.objectId;
    libraryId = libraryId || await context.concerns.FabricObject.libraryId({objectId});

    return await context.concerns.FinalizeAndWait.finalize({
      libraryId,
      objectId,
      writeToken,
      commitMessage
    });
  };

  const getWriteToken = async ({libraryId, objectId} = {}) => {
    objectId = objectId || context.args.objectId;
    libraryId = libraryId || await context.concerns.FabricObject.libraryId({objectId});

    const client = await context.concerns.Client.get();
    const editResponse = await client.EditContentObject({
      libraryId,
      objectId
    });
    return editResponse.write_token;
  };

  const libraryIdArgPopulate = context.concerns.FabricObject. libraryIdArgPopulate;

  const writeMetadata =  async ({libraryId, metadata, metadataSubtree, objectId, writeToken, commitMessage = `write metadata to ${metadataSubtree || "/"}`}) => {
    objectId = objectId || context.args.objectId;
    libraryId = libraryId || await context.concerns.FabricObject.libraryId({objectId});
    writeToken = writeToken || await getWriteToken({libraryId, objectId});

    logger.log("Writing metadata to object...");
    const client = await context.concerns.Client.get();
    await client.ReplaceMetadata({
      libraryId,
      metadata,
      metadataSubtree,
      objectId,
      writeToken
    });

    return await finalize({
      libraryId,
      objectId,
      writeToken,
      commitMessage
    });
  };

  return {finalize, getWriteToken, libraryIdArgPopulate, writeMetadata};
};

module.exports = {
  blueprint,
  New
};
