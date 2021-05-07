const kindOf = require("kind-of");
const objectPath = require("object-path");
const R = require("ramda");

const {fabricItemDesc} = require("../helpers");

const Client = require("./Client");
const Edit = require("./Edit");
const JSON = require("./JSON");
const Logger = require("./Logger");

const pathRegex = /^(\/[^/]+)+$/;

const pathDesc = path => path ? `path '${path}' ` : "";

const pathExists = ({metadata, path}) => objectPath.has(metadata, pathPieces({path}));

// convert path piece to int if it is a string representation of an int
const pathPieceCast = str => pathPieceIsInt(str) ? parseInt(str, 10) : str;

const pathPieceIsInt = str => parseInt(str, 10).toString() === str;

// convert path in slash format to an array for use with object-path
// numbers are assumed to be array indexes rather than map keys
// path must start with "/"
const pathPieces = ({path}) => {
  if(path.slice(0,1) !== "/") throw Error("Metadata.pathPieces(): path must start with '/'");
  let result = path.split("/");
  // remove empty string at beginning (should always be present)
  result.shift();
  if(result.slice(-1)==="") result.pop();

  return result.map(pathPieceCast);
};

const pretty = ({obj}) => JSON.stringify(obj, null, 2);

const skeleton = () => Object({public: {}});

const validatePathExists = ({metadata, path}) => {
  if(!pathExists({metadata, path})) throw Error(`'${path}' not found in metadata`);
};

const validatePathFormat = ({path}) => {
  if(!validPathFormat({path})) throw Error(`'${path}' is not in valid format for a metadata path (make sure it starts with '/')`);
};

const validPathFormat = ({path}) => path.match(pathRegex) && path.match(pathRegex)[0] === path;

// Makes sure all attributes along object path are objects or undefined, and that path ends at an undefined attribute
const validTargetPath = ({metadata, targetPath}) => {
  let pathArr = pathPieces({path: targetPath});
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

const valueAtPath = ({metadata, path}) => objectPath.get(metadata, pathPieces({path}));




const blueprint = {
  name: "Metadata",
  concerns: [Logger, Client, Edit]
};

const New = context => {
  const logger = context.concerns.Logger;

  const checkTargetPath = ({force, metadata, targetPath}) => {
    if(!validTargetPath({metadata, targetPath})) {
      const existingExcerpt = JSON.shortString({
        obj: valueAtPath({
          metadata,
          path:targetPath
        })
      });
      if(force) {
        logger.warn(`Data already exists at '${targetPath}', --force specified, replacing...\nOverwritten data: ${existingExcerpt}`);
      } else {
        throw new Error(`Metadata path '${targetPath}' is invalid (already exists, use --force to replace). Existing data: ${existingExcerpt}`);
      }
    }
  };

  const commitInfo = async  ({libraryId, objectId, versionHash, writeToken}) => {
    logger.log(`Retrieving commit info for ${fabricItemDesc({objectId, versionHash, writeToken})}...`);
    return await get({
      libraryId,
      objectId,
      subtree: "/commit",
      versionHash,
      writeToken
    });
  };

  const get = async ({libraryId, subtree, objectId, versionHash, writeToken}) => {
    const client = await context.concerns.Client.get();
    logger.log(`Retrieving metadata ${pathDesc(subtree)}from ${fabricItemDesc({objectId, versionHash, writeToken})}...`);
    return await client.ContentObjectMetadata({
      libraryId,
      metadataSubtree: subtree,
      objectId,
      versionHash,
      writeToken
    });
  };

  const write = async ({libraryId, metadata, noWait, objectId, writeToken}) => {
    return await context.concerns.Edit.writeMetadata({
      libraryId,
      metadata,
      noWait,
      objectId,
      writeToken,
    });
  };

  return {checkTargetPath, commitInfo, get, write};
};

module.exports = {
  blueprint,
  pathExists,
  pathPieces,
  pretty,
  New,
  skeleton,
  validatePathExists,
  validatePathFormat,
  validPathFormat,
  validTargetPath,
  valueAtPath
};