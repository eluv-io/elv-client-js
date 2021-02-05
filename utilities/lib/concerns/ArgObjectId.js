// code related to --objectId

const {StdOpt} = require("../options");

const ArgLibraryId = require("./ArgLibraryId");
const FabricObject = require("./FabricObject");

const blueprint = {
  name: "ArgObjectId",
  concerns: [ArgLibraryId, FabricObject],
  options: [
    StdOpt("objectId")
  ]
};

const New = context => {

  let argsProcMemo;

  // fill in implied missing args
  const argsProc = async () => {
    if(!argsProcMemo) {
      const foundLibId = await context.concerns.FabricObject.libraryId({objectId: context.args.objectId});
      if(context.args.libraryId) {
        if(context.args.libraryId !== foundLibId) throw Error(`--libraryId ${context.args.libraryId} supplied, but objectId ${context.args.objectId} has library ID: ${foundLibId}`);
      } else {
        context.args.libraryId = foundLibId;
      }
      argsProcMemo = context.args;
    }
    return argsProcMemo;
  };

  const objDelete = async () => {
    const {libraryId, objectId} = await argsProc();
    return await context.concerns.FabricObject.del({
      libraryId,
      objectId
    });
  };

  const objMetadata = async ({subtree} = {}) => {
    const {libraryId, objectId} = await argsProc();
    return await context.concerns.FabricObject.metadata({
      libraryId,
      objectId,
      subtree
    });
  };

  const objPartList = async () => {
    const {libraryId, objectId} = await argsProc();
    return await context.concerns.FabricObject.partList({
      libraryId,
      objectId
    });
  };

  const objVersionList = async () => {
    const {libraryId, objectId} = await argsProc();
    return await context.concerns.FabricObject.versionList({
      libraryId,
      objectId
    });
  };

  // instance interface
  return {
    argsProc,
    objDelete,
    objMetadata,
    objPartList,
    objVersionList
  };
};

module.exports = {
  blueprint,
  New
};