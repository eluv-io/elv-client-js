// code to handle working with a particular version of an existing object
const {ModOpt, StdOpt} = require("../options");

const Client = require("./Client");
const ExistingObject = require("./ExistingObject");
const Logger = require("./Logger");

const chkNoObjectIdOrHash= (argv) => {
  if(!argv.objectId && !argv.versionHash) {
    throw Error("Must supply either --objectId or --versionHash");
  }
  return true; // tell yargs that the arguments passed the check
};

const blueprint = {
  name: "ExistingVersion",
  concerns: [Client, ExistingObject, Logger],
  options: [
    ModOpt("objectId", {demand: false, conflicts: "versionHash"}),
    StdOpt("versionHash", {conflicts: "objectId"})
  ],
  checksMap: {chkNoObjectIdOrHash}
};

const New = context => {
  const logger = context.concerns.Logger;

  // populate --libraryId if missing, to prevent multiple lookups
  const libraryIdArgPopulate = async () => {
    context.args.libraryId = await libraryIdGet();
  };

  const libraryIdGet = async ({objectId, versionHash} = {}) => {
    if(context.args.libraryId) return context.args.libraryId;

    objectId = objectId || context.args.objectId;
    versionHash = versionHash || context.args.versionHash;

    const client = await context.concerns.Client.get();
    let stringPart = " for";
    if(objectId) stringPart += ` objectId: ${objectId}`;
    if(versionHash) stringPart += ` versionHash: ${versionHash}`;
    logger.log(`Looking up library ID${stringPart}...`);
    const libId = await client.ContentObjectLibraryId({objectId, versionHash});
    logger.log(`Found library ID: ${libId}...`);
    return libId;
  };

  const readMetadata = async ({objectId, libraryId, versionHash, metadataSubtree} = {}) => {
    objectId = objectId || context.args.objectId;
    versionHash = versionHash || context.args.versionHash;
    libraryId = libraryId || await libraryIdGet({objectId, versionHash});

    const client = await context.concerns.Client.get();
    return await client.ContentObjectMetadata({
      libraryId,
      objectId,
      versionHash,
      metadataSubtree
    });
  };

  return {libraryIdArgPopulate, libraryIdGet, readMetadata};
};

module.exports = {
  blueprint,
  New
};