const fs = require("fs");

const {absPath} = require("../helpers");

const Logger = require("./Logger");

const blueprint = {
  name: "JSON",
  concerns: [Logger]
};

// prevent loss of access to built-in JSON methods
// when a file includes "const JSON = require("concerns/JSON");"
const parse = JSON.parse;
const stringify = JSON.stringify;

const New = (context) => {
  const logger = context.concerns.Logger;

  const readFile = (filePath) => {
    const fullPath = absPath(filePath, context.cwd);
    logger.log(`Reading JSON from ${fullPath}...`);
    return fs.readFileSync(fullPath);
  };

  const stringOrFileContents = (str) => str.startsWith("@")
    ? readFile(str.substring(1))
    : str;

  const parseFile = (pathStr) => parseString(readFile(pathStr));

  const parseStringOrFile = (str) => parseString(stringOrFileContents(str));

  const parseString = (str) => {
    let parsed;
    try {
      parsed = JSON.parse(str);
    } catch(e) {
      logger.error("Failed to parse JSON");
      throw e;
    }
    return parsed;
  };

  return {parse, parseFile, parseString, parseStringOrFile, stringify};
};

module.exports = {blueprint, New};