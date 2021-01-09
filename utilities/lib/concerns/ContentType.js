const {NewOpt} = require("../options");

const Client = require("./Client");

const blueprint = {
  name: "ContentType",
  concerns: [Client],
  options: [
    NewOpt("type", {
      descTemplate: "Name, object ID, or version hash of content type{X}",
      type: "string"
    })
  ]
};

const New = context => {

  const getForObject = async ({libraryId, objectId, versionHash}) => {
    const client = await context.concerns.Client.get();
    const response = await client.ContentObject({libraryId, objectId, versionHash});
    return response.type;
  };

  // make sure to call with 'await'
  const hashLookup = async () => {
    const client = await context.concerns.Client.get();

    if(!context.args.type) {
      throw Error("--type not supplied");
    }
    let fieldName = "name";
    const typeArg = context.args.type;
    if(typeArg.startsWith("iq__")) {
      fieldName = "typeId";
    } else if(typeArg.startsWith("hq__")) {
      fieldName = "versionHash";
    }
    const contentType = await client.ContentType({[fieldName]: typeArg});
    if(!contentType) {
      throw Error(`Unable to find content type "${typeArg}"`);
    }
    return contentType.hash;
  };

  return {getForObject, hashLookup};
};

module.exports = {blueprint, New};