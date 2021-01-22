const kindOf = require("kind-of");
const objectPath = require("object-path");
const R = require("ramda");

const Client = require("./Client");
const Logger = require("./Logger");

const pathRegex = /^(\/[^/]+)+$/;

const pathExists = (metadata, path) => objectPath.has(metadata, pathPieces(path));

const pathPieces = metadataPath => metadataPath.split("/").slice(1);

const pretty = obj => JSON.stringify(obj, null, 2);

const skeleton = () => {
  return {public: {}};
};

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
  concerns: [Logger, Client]
};

const New = context => {
  const logger = context.concerns.Logger;

  const get = async ({objectId, libraryId, versionHash, writeToken, metadataSubtree} = {}) => {
    const client = await context.concerns.Client.get();
    logger.log("Retrieving metadata from object...");
    return await client.ContentObjectMetadata({
      libraryId,
      objectId,
      versionHash,
      writeToken,
      metadataSubtree
    });
  };

  return {get};
};

module.exports = {
  blueprint,
  pathExists,
  pathPieces,
  pretty,
  New,
  skeleton,
  validPathFormat,
  validTargetPath,
  valueAtPath
};