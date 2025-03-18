// for scripts that work on a specific version of an object

const {ModOpt} = require("../options");

const ArgVersionHash = require("./ArgVersionHash");

const blueprint = {
  name: "ExistVer",
  concerns: [ArgVersionHash],
  options: [
    ModOpt("versionHash", {demand: true})
  ]
};

const New = context => {

  // fill in implied missing args
  const argsProc = async () => await context.concerns.ArgVersionHash.argsProc();

  const del = async () => await context.concerns.ArgVersionHash.verDelete();

  const libraryId = async () => await context.concerns.ArgVersionHash.verLibraryId;

  const metadata = async ({subtree} = {}) => await context.concerns.ArgVersionHash.verMetadata({subtree});

  const objectId = async () => await context.concerns.ArgVersionHash.verObjectId;

  const partList = async () => await context.concerns.ArgVersionHash.verPartList();

  const status = async () => await context.concerns.ArgVersionHash.verStatus();

  return {
    argsProc,
    del,
    libraryId,
    metadata,
    objectId,
    partList,
    status
  };
};

module.exports = {
  blueprint,
  New
};