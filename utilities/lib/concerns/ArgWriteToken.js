// code related to --writeToken
const {throwError} = require("../helpers");

const {NewOpt} = require("../options");

const ArgLibraryId = require("./ArgLibraryId");
const ArgObjectId = require("./ArgObjectId");
const Draft = require("./Draft");
const FabricObject = require("./FabricObject");
const Logger = require("./Logger");

const blueprint = {
  name: "ArgWriteToken",
  concerns: [ArgLibraryId, ArgObjectId, Draft, FabricObject, Logger],
  conflicts: "versionHash",
  options: [
    NewOpt("writeToken", {
      descTemplate: "Write token{X}",
      type: "string"
    })
  ]
};

const New = context => {

  let argsProcMemo;

  // fill in implied missing args
  const argsProc = async () => {
    if(!argsProcMemo) {
      const foundObjectId = context.concerns.Draft.objectId({writeToken: context.args.writeToken});

      if(context.args.objectId) {
        if(context.args.objectId !== foundObjectId) throw Error(`--objectId ${context.args.objectId} supplied, but writeToken ${context.args.writeToken} has object ID: ${foundObjectId}`);
      } else {
        context.args.objectId = foundObjectId;
      }

      const foundLibId = await context.concerns.FabricObject.libraryId({objectId: context.args.objectId});
      if(context.args.libraryId) {
        if(context.args.libraryId !== foundLibId) throw Error(`--libraryId ${context.args.libraryId} supplied, but objectId ${context.args.objectId} has library ID: ${foundLibId}`);
      } else {
        context.args.libraryId = foundLibId;
      }

      if(context.args.nodeUrl) {
        await context.concerns.Draft.recordWriteTokenURI({
          writeToken: context.args.writeToken,
          nodeUrl: context.args.nodeUrl
        });
      } else {
        context.concerns.Logger.warn("--nodeUrl not supplied, looking up node for write token (using --nodeUrl is much faster)");
        context.args.nodeUrl = await context.concerns.Draft.nodeURL({writeToken: context.args.writeToken});
        context.concerns.Logger.log(`Found node URL: ${context.args.nodeUrl}`);
      }

      argsProcMemo = context.args;
    }
    return argsProcMemo;
  };

  const decode = () => context.args.writeToken ?
    context.concerns.Draft.decode({writeToken: context.args.writeToken}) :
    throwError("--writeToken missing");

  const dftMetadata = async ({subtree} = {}) => {
    const {libraryId, objectId, writeToken} = await argsProc();
    return await context.concerns.Draft.metadata({
      libraryId,
      objectId,
      subtree,
      writeToken
    });
  };

  const dftPartList = async () => {
    const {libraryId, objectId, writeToken} = await argsProc();
    return await context.concerns.Draft.partList({
      libraryId,
      objectId,
      writeToken
    });
  };

  // instance interface
  return {
    argsProc,
    decode,
    dftMetadata,
    dftPartList
  };
};

module.exports = {
  blueprint,
  New
};
