/* eslint-disable no-console */
const path = require("path");

const {formatError} = require("./error");

const callerFileName = () => {
  const stack = new Error().stack.split("\n");
  return stack[3].split("/").slice(-1)[0].split(":")[0];
};

const cmdLineIntTest = ({debug = false}) => {
  const [, , testFilePath, varFilePath, addlVarsJson] = process.argv;

  if(!testFilePath || !varFilePath) {
    console.error(`\nUsage: node ${callerFileName()} testFilePath varFilePath [addlVarsJson]\n`);
    process.exit(1);
  }

  const addlVars = addlVarsJson ? JSON.parse(addlVarsJson) : {};

  const test = require(path.resolve(process.cwd(), testFilePath));

  new test({varFilePath, addlVars, debug}).run().then(
    successValue => {
      console.log("✅ PASSED");
      process.exit(0);
    },
    failureReason => {
      console.log(`❌ FAILED: ${formatError(failureReason)}`);
      if(debug) throw failureReason;
      process.exit(1);
    }
  );
};

module.exports = {cmdLineIntTest};
