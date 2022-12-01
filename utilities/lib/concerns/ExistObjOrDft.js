// code for scripts that work on either an object or a draft of an object

const ArgObjectId = require("./ArgObjectId");
const ArgNodeUrl = require("./ArgNodeUrl");
const ArgWriteToken = require("./ArgWriteToken");

const chkNoObjectIdOrToken = (argv) => {
  if(!argv.objectId && !argv.writeToken) {
    throw Error("Must supply either --objectId or --writeToken");
  }
  return true; // tell yargs that the arguments passed the check
};

const blueprint = {
  name: "ExistObjOrDft",
  concerns: [ArgNodeUrl, ArgObjectId, ArgWriteToken],
  checksMap: {chkNoObjectIdOrToken}
};

const New = context => {

  let argsProcMemo;

  // fill in implied missing args
  const argsProc = async () => {
    if(!argsProcMemo) {
      argsProcMemo = context.args.writeToken
        ? await context.concerns.ArgWriteToken.argsProc()
        : await context.concerns.ArgObjectId.argsProc();
    }
    return argsProcMemo;
  };

  const metadata = async ({subtree} = {}) => {
    const {libraryId, objectId, writeToken} = await argsProc();
    return writeToken
      ? await context.concerns.ArgWriteToken.dftMetadata({
        libraryId,
        objectId,
        subtree,
        writeToken})
      : await context.concerns.ArgObjectId.objMetadata({
        libraryId,
        objectId,
        subtree});
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
    const {libraryId, objectId, writeToken} = await argsProc();
    return writeToken
      ? await context.concerns.ArgWriteToken.dftPartList({
        libraryId,
        objectId,
        writeToken})
      : await context.concerns.ArgObjectId.objPartList({
        libraryId,
        objectId});
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
