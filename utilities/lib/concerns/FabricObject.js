// code relating to working with fabric objects. Named 'FabricObject' instead of 'Object' to prevent conflicts with built-in JS 'Object'
const {StdOpt} = require("../options");

const Library = require("./Library");
const Metadata = require("./Metadata");
const Part = require("./Part");

const blueprint = {
  name: "FabricObject",
  concerns: [Part, Library, Metadata],
  options: [
    StdOpt("objectId", {demand: true})
  ]
};

const New = context => {
  const getMetadata = async ({objectId, libraryId, metadataSubtree} = {}) => {
    objectId = objectId || context.args.objectId;
    libraryId = libraryId || await libraryIdGet({objectId});
    return await context.concerns.Metadata.get({
      libraryId,
      objectId,
      metadataSubtree
    });
  };

  // populate --libraryId if missing, to prevent multiple lookups
  const libraryIdArgPopulate = async () => {
    context.args.libraryId = await libraryIdGet();
  };

  const libraryIdGet = async ({objectId} = {}) => {
    if(context.args.libraryId) return context.args.libraryId;
    objectId = objectId || context.args.objectId;
    return await context.concerns.Library.forObject({objectId});
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