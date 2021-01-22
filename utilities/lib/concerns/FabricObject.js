// code relating to working with fabric objects. Named 'FabricObject' instead of 'Object' to prevent conflicts with built-in JS 'Object'
const {StdOpt} = require("../options");

const Library = require("./Library");
const Metadata = require("./Metadata");

const blueprint = {
  name: "FabricObject",
  concerns: [Library, Metadata],
  options: [
    StdOpt("objectId", {demand: true})
  ]
};

const New = context => {
  // populate --libraryId if missing, to prevent multiple lookups
  const libraryIdArgPopulate = async () => {
    context.args.libraryId = await libraryIdGet();
  };

  const libraryIdGet = async ({objectId} = {}) => {
    if(context.args.libraryId) return context.args.libraryId;
    objectId = objectId || context.args.objectId;
    return await context.concerns.Library.forObject({objectId});
  };

  const getMetadata = async ({objectId, libraryId, metadataSubtree} = {}) => {
    objectId = objectId || context.args.objectId;
    libraryId = libraryId || await libraryIdGet({objectId});
    return await context.concerns.Metadata.get({
      libraryId,
      objectId,
      metadataSubtree
    });
  };

  return {libraryIdArgPopulate, libraryIdGet, getMetadata};
};

module.exports = {
  blueprint,
  New
};