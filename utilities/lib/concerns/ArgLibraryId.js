// code related to --libraryId

const {StdOpt} = require("../options");

const Library = require("./Library");

const blueprint = {
  name: "ArgLibraryId",
  concerns: [Library],
  options: [
    StdOpt("libraryId")
  ]
};

const New = context => {

  const libInfo = async () => await context.concerns.Library.info({libraryId: context.args.libraryId});

  const libMetadata = async () => (await libInfo()).metadata;

  const libObjectList = async ({filterOptions} = {}) => await context.concerns.Library.objectList({filterOptions, libraryId: context.args.libraryId});

  // instance interface
  return {
    libInfo,
    libMetadata,
    libObjectList
  };
};

module.exports = {
  blueprint,
  New
};