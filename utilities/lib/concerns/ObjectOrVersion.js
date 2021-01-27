// code to handle working with a particular version of an existing object
const {ModOpt, StdOpt} = require("../options");

const FabricObject = require("./FabricObject");
const Library = require("./Library");
const Metadata = require("./Metadata");
const Part = require("./Part");

const chkNoObjectIdOrHash= (argv) => {
  if(!argv.objectId && !argv.versionHash) {
    throw Error("Must supply either --objectId or --versionHash");
  }
  return true; // tell yargs that the arguments passed the check
};

const blueprint = {
  name: "ObjectOrVersion",
  concerns: [Metadata, Library, FabricObject, Part],
  options: [
    ModOpt("objectId",{demand: false}),
    StdOpt("versionHash")
  ],
  checksMap: {chkNoObjectIdOrHash}
};

const New = context => {
  const getMetadata = async ({objectId, libraryId, versionHash, metadataSubtree} = {}) => {
    objectId = objectId || context.args.objectId;
    versionHash = versionHash || context.args.versionHash;
    libraryId = libraryId || await libraryIdGet({objectId, versionHash});
    return await context.concerns.Metadata.get({
      libraryId,
      objectId,
      versionHash,
      metadataSubtree
    });
  };

  // populate --libraryId if missing, to prevent multiple lookups
  const libraryIdArgPopulate = async () => context.args.libraryId = await libraryIdGet();

  const libraryIdGet = async ({objectId, versionHash} = {}) => {
    if(context.args.libraryId) return context.args.libraryId;
    objectId = objectId || context.args.objectId;
    versionHash = versionHash || context.args.versionHash;
    return await context.concerns.Library.forObject({objectId, versionHash});
  };

  const partList = async ({libraryId, objectId, versionHash} = {}) => {
    objectId = objectId || context.args.objectId;
    versionHash = versionHash || context.args.versionHash;
    libraryId = libraryId || await libraryIdGet({objectId, versionHash});
    return await context.concerns.Part.list({libraryId, objectId, versionHash});
  };

  return {
    getMetadata,
    libraryIdArgPopulate,
    libraryIdGet,
    partList
  };
};

module.exports = {
  blueprint,
  New
};