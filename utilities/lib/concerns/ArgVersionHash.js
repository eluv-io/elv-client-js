// code related to --versionHash

const {StdOpt} = require("../options");

const ArgObjectId = require("./ArgObjectId");
const Version = require("./Version");

const blueprint = {
  name: "ArgVersionHash",
  concerns: [ArgObjectId, Version],
  options: [
    StdOpt("versionHash")
  ]
};

const New = context => {

  let argsProcMemo;

  // fill in implied missing args
  const argsProc = async () => {
    if(!argsProcMemo) {
      const foundObjId = context.concerns.Version.objectId({versionHash: context.args.versionHash});
      if(context.args.objectId && context.args.objectId !== foundObjId) throw Error(`--objectId ${context.args.objectId} supplied, but --versionHash ${context.args.versionHash} is for object ID: ${foundObjId}`);
      context.args.objectId = foundObjId;
      argsProcMemo = await context.concerns.ArgObjectId.argsProc();
    }
    return argsProcMemo;
  };

  const verDelete = async () => await context.concerns.Version.del({versionHash: context.args.versionHash});

  const verLibraryId = async () => await argsProc().libraryId;

  const verMetadata = async ({subtree}={}) => {
    const {libraryId, objectId, versionHash} = await argsProc();
    return await context.concerns.Version.metadata({
      libraryId,
      objectId,
      subtree,
      versionHash
    });
  };

  const verPartList = async () => {
    const {libraryId, objectId, versionHash} = await argsProc();
    return await context.concerns.Version.partList({
      libraryId,
      objectId,
      versionHash
    });
  };

  return {
    argsProc,
    verDelete,
    verLibraryId,
    verMetadata,
    verPartList
  };
};

module.exports = {
  blueprint,
  New
};