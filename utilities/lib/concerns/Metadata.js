const kindOf = require("kind-of");
const objectPath = require("object-path");
const R = require("ramda");

const {NewOpt} = require("../options");

const JSON = require("./JSON");
const Logger = require("./Logger");

const pathRegex = /^(\/[^/]+)+$/;

const pathExists = (metadata, path) => objectPath.has(metadata, pathPieces(path));

const pathPieces = metadataPath => metadataPath.split("/").slice(1);

const valueAtPath = (metadata, path) => objectPath.get(metadata, pathPieces(path));

const validPathFormat = metadataPath => metadataPath.match(pathRegex) && metadataPath.match(pathRegex)[0] === metadataPath;

// Makes sure all attributes along object path are objects or undefined, and that path ends at an undefined attribute
const validTargetPath = (metadata, targetPath) => {
  let pathArr = pathPieces(targetPath);
  let currentSubtree = R.clone(metadata);

  for(const key of pathArr) {

    if(currentSubtree === undefined) {
      // reached end of tree, all the rest of keys in targetPath can be created under this point
      return true;
    }
    if(kindOf(currentSubtree) !== "object") {
      break;
    }
    currentSubtree = currentSubtree[key];
  }
  // Make sure end is undefined
  return currentSubtree === undefined;
};


const blueprint = {
  name: "Metadata",
  concerns: [JSON, Logger],
  options: [
    NewOpt("metadata", {
      descTemplate: "JSON string (or file path if prefixed with '@') to merge into metadata{X}",
      type: "string"
    })
  ]
};

const New = context => {
  const argMetadata = context.args.metadata;
  const J = context.concerns.JSON;

  const asObject = () => {
    if(argMetadata) {
      const metadataObj = J.parseStringOrFile(argMetadata);

      if(!metadataObj.hasOwnProperty("public")) {
        metadataObj.public = {};
      }

      if(kindOf(metadataObj.public) !== "object") {
        throw Error(`Expected metadata /public to be object, got ${kindOf(metadataObj.public)} instead`);
      }
    } else {
      return null;
    }
  };

  const skeleton = () => {
    return {public: {}};
  };

  return {asObject, skeleton};
};

module.exports = {
  blueprint,
  pathExists,
  New,
  validPathFormat,
  validTargetPath,
  valueAtPath
};