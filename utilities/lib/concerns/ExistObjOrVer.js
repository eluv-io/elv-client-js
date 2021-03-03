// code for scripts that work on either an object or a specific version of an object

const ArgObjectId = require("./ArgObjectId");
const ArgVersionHash = require("./ArgVersionHash");

const chkNoObjectIdOrHash = (argv) => {
  if(!argv.objectId && !argv.versionHash) {
    throw Error("Must supply either --objectId or --versionHash");
  }
  return true; // tell yargs that the arguments passed the check
};

const blueprint = {
  name: "ExistObjOrVer",
  concerns: [ArgObjectId, ArgVersionHash],
  checksMap: {chkNoObjectIdOrHash}
};

const New = context => {

  let argsProcMemo;

  // fill in implied missing args
  const argsProc = async () => {
    if(!argsProcMemo) {
      argsProcMemo = context.args.versionHash
        ? await context.concerns.ArgVersionHash.argsProc()
        : await context.concerns.ArgObjectId.argsProc();
    }
    if(!argsProcMemo.versionHash) {
      argsProcMemo.versionHash = await context.concerns.ArgObjectId.objLatestHash();
    }
    return argsProcMemo;
  };

  const metadata = async ({subtree} = {}) => {
    const {libraryId, objectId, versionHash} = await argsProc();
    return versionHash
      ? await context.concerns.ArgVersionHash.verMetadata({
        libraryId,
        objectId,
        subtree,
        versionHash})
      : await context.concerns.ArgObjectId.objMetadata({
        libraryId,
        objectId,
        subtree});
  };

  const libraryId = async () => {
    const {libraryId} = await argsProc();
    return libraryId;
  };

  const partList = async () => {
    const {libraryId, objectId, versionHash} = await argsProc();
    return versionHash
      ? await context.concerns.ArgVersionHash.verPartList({
        libraryId,
        objectId,
        versionHash})
      : await context.concerns.ArgObjectId.objPartList({
        libraryId,
        objectId});
  };

  return {
    argsProc,
    libraryId,
    metadata,
    partList
  };
};

module.exports = {
  blueprint,
  New
};