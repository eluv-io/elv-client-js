// code for scripts that work on either an object, a specific version of an object, or a draft of object

const ArgNodeUrl = require("./ArgNodeUrl");
const ArgObjectId = require("./ArgObjectId");
const ArgVersionHash = require("./ArgVersionHash");
const ArgWriteToken = require("./ArgWriteToken");

const chkNoObjectIdOrHashOrToken = (argv) => {
  if(!argv.objectId && !argv.versionHash && !argv.writeToken) {
    throw Error("Must supply one of: --objectId, --versionHash or --writeToken");
  }
  return true; // tell yargs that the arguments passed the check
};

const blueprint = {
  name: "ExistObjOrVerOrDft",
  concerns: [ArgNodeUrl, ArgObjectId, ArgVersionHash, ArgWriteToken],
  checksMap: {chkNoObjectIdOrHashOrToken}
};

const New = context => {

  let argsProcMemo;

  // fill in implied missing args
  const argsProc = async () => {
    if(!argsProcMemo) {
      argsProcMemo = context.args.writeToken
        ? await context.concerns.ArgWriteToken.argsProc()
        : context.args.versionHash
          ? await context.concerns.ArgVersionHash.argsProc()
          : await context.concerns.ArgObjectId.argsProc();
    }
    if(!argsProcMemo.versionHash && !argsProcMemo.writeToken) {
      argsProcMemo.versionHash = await context.concerns.ArgObjectId.objLatestHash();
    }
    return argsProcMemo;
  };

  const metadata = async ({subtree} = {}) => {
    const {libraryId, objectId, versionHash, writeToken} = await argsProc();
    return writeToken
      ? await context.concerns.ArgWriteToken.dftMetadata({
        libraryId,
        objectId,
        subtree,
        writeToken
      })
      : versionHash
        ? await context.concerns.ArgVersionHash.verMetadata({
          libraryId,
          objectId,
          subtree,
          versionHash
        })
        : await context.concerns.ArgObjectId.objMetadata({
          libraryId,
          objectId,
          subtree
        });
  };

  const libraryId = async () => {
    const {libraryId} = await argsProc();
    return libraryId;
  };

  const objectId = async () => {
    const {objectId} = await argsProc();
    return objectId;
  };

  const partList = async () => {
    const {libraryId, objectId, versionHash, writeToken} = await argsProc();
    return writeToken
      ? await context.concerns.ArgWriteToken.dftPartList({
        libraryId,
        objectId,
        versionHash,
        writeToken
      })
      : versionHash
        ? await context.concerns.ArgVersionHash.verPartList({
          libraryId,
          objectId,
          versionHash
        })
        : await context.concerns.ArgObjectId.objPartList({
          libraryId,
          objectId
        });
  };

  return {
    argsProc,
    libraryId,
    metadata,
    objectId,
    partList
  };
};

module.exports = {
  blueprint,
  New
};
