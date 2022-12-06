/* eslint-disable no-console */

// Utility to help troubleshoot test variable sets. Prints out resolved varFile, with all 'include_presets' items
// expanded and merged.

const {varsFromFile} = require("../helpers/TestVars");

const [, , varFilePath] = process.argv;

if(!varFilePath) {
  console.error("\nUsage: node PrintVars.js varFilePath\n");
  process.exit(1);
}

console.log(
  JSON.stringify(
    varsFromFile(varFilePath),
    null,
    2
  )
);
