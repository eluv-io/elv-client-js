const Path = require("path");
const fs = require("fs");
const isEqual = require("lodash.isequal");

const Replacer = (name, value) => {
  if(!value || typeof value !== "object" || Array.isArray(value)) { return value; }

  if(Buffer.isBuffer(value) || (value.type === "Buffer" && value.data)) {
    return `<Buffer ${value.size || value.data.length}>`;
  }

  const objectName = (value.toString().match(/\[object\s+(.*)\]/) || [])[1];
  if(!objectName || objectName === "Object") { return value; }

  switch(objectName) {
    case ("ArrayBuffer"):
      return `<ArrayBuffer ${value.byteLength}>`;
    case ("Response"):
      return `<Response ${value.size}>`;
    case ("Object"):
      return value;
    default:
      return `<${objectName}>`;
  }
};

const FormatArgs = (args) => {
  if(args === undefined) { return ""; }

  if(typeof args !== "object") {
    return JSON.stringify(args);
    //return `${args}`;
  }

  let formattedArgs = {...args};

  // Signers
  if(formattedArgs.signer) {
    formattedArgs.signer = "<Ethers#Wallet>";
  }

  formattedArgs = JSON.stringify(formattedArgs, Replacer, 2);

  // Remove unnecessary quotes object representations
  const match = (formattedArgs.match(/^"<(.*)>"$/) || []);
  return match[1] ? `<${match[1]}>` : formattedArgs;
};

const FormatResult = (result) => {
  if(result === undefined) { return; }

  // Signers
  if(result.signingKey && result.provider) {
    return "<Ethers#Wallet>";
  }

  let formattedResult = JSON.stringify(result, Replacer, 2);

  // Remove unnecessary quotes object representations
  const match = (formattedResult.match(/^"<(.*)>"$/) || []);
  return match[1] ? `<${match[1]}>` : formattedResult;};

/*
 * Dynamically wrap class methods in logging functionality. Each time the method is called, it will
 * log the full signature it was called with and the resultant output.
 *
 * If --logMethods is not specified when tests are run, no logging will be done.
 *
 * Results are saved in /docs/methods/<ClassName>/<MethodName>.json
 */
const OutputLogger = (klass, instance, exclude=[]) => {
  if(!process.env["GENERATE_METHOD_LOGS"]) { return instance; }

  const outputDir = Path.join(__dirname, "..", "..", "docs", "methods", klass.name);

  // eslint-disable-next-line no-empty
  try { fs.mkdirSync(outputDir); } catch (e) {}

  let methodWritten = {};

  const methods = Object.getOwnPropertyNames(klass.prototype || klass)
    .filter(propName => typeof instance[propName] === "function");

  // Wrap all methods in logging functionality
  methods.forEach(methodName => {
    if(exclude.includes(methodName)) { return; }
    const file = Path.join(outputDir, methodName + ".json");
    const originalMethod = instance[methodName].bind(instance);

    const writeOutput = (args, result, async=false) => {
      const formattedArgs = args.map(arg => FormatArgs(arg)).join(", ");
      const formattedResult = FormatResult(result);
      let output = {
        signature: `${(async ? "async" : "")} ${methodName}(${formattedArgs});`,
        result: formattedResult !== undefined ? `${formattedResult}` : undefined
      };

      if(methodWritten[methodName]) {
        const currentOutput = JSON.parse(fs.readFileSync(file, "utf8"));

        if(currentOutput.find(oldOutput => isEqual(oldOutput, output))) {
          // Duplicate output - skip
          return;
        }

        output = [...currentOutput, output];
      } else {
        output = [output];
      }

      fs.writeFileSync(
        file,
        JSON.stringify(output, null, 2)
      );

      methodWritten[methodName] = true;
    };

    if(originalMethod.constructor.name === "AsyncFunction") {
      instance[methodName] = async (...args) => {
        const result = await originalMethod(...args);
        writeOutput(args, result, true);
        return result;
      };
    } else {
      instance[methodName] = (...args) => {
        const result = originalMethod(...args);
        writeOutput(args, result, false);
        return result;
      };
    }
  });

  return instance;
};

module.exports = OutputLogger;
