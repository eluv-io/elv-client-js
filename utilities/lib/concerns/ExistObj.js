// for scripts that work with an existing fabric object

const {ModOpt} = require("../options");

const ArgObjectId = require("./ArgObjectId");

const blueprint = {
  name: "ExistObj",
  concerns: [ArgObjectId],
  options: [
    ModOpt("objectId", {demand: true})
  ]
};

const New = context => {

  // fill in any implied missing args
  const argsProc = async () => await context.concerns.ArgObjectId.argsProc();

  const libraryId = async () => await argsProc().libraryId;

  const metadata = async ({subtree} = {}) => await context.concerns.ArgObjectId.objMetadata({subtree});

  const partList = async () => await context.concerns.ArgObjectId.objPartList();

  const versionList = async () => await context.concerns.ArgObjectId.objVersionList();

  return {
    argsProc,
    libraryId,
    metadata,
    partList,
    versionList
  };
};

module.exports = {
  blueprint,
  New
};