// code related to --libraryId

const {StdOpt} = require("../options");

const FabricObject = require("./FabricObject");
const Library = require("./Library");

const blueprint = {
  name: "ArgLibraryId",
  concerns: [FabricObject, Library],
  options: [
    StdOpt("libraryId")
  ]
};

const New = context => {

  const libCreateObject = async ({metadata, noWait, type}) => await context.concerns.FabricObject.create({
    libraryId: context.args.libraryId,
    metadata,
    noWait,
    type
  });

  const libInfo = async () => await context.concerns.Library.info({libraryId: context.args.libraryId});

  const libMetadata = async () => (await libInfo()).metadata;

  const libObjectList = async ({filterOptions} = {}) => await context.concerns.Library.objectList({filterOptions, libraryId: context.args.libraryId});

  // instance interface
  return {
    libCreateObject,
    libInfo,
    libMetadata,
    libObjectList
  };
};

module.exports = {
  blueprint,
  New
};
