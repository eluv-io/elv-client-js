// code related to writing results to file
const fs = require("fs");

const {absPath} = require("../helpers");
const {NewOpt} = require("../options");

const Logger = require("./Logger");

const blueprint = {
  name: "Outfile",
  concerns: [Logger],
  options: [
    NewOpt("outfile", {
      descTemplate: "Path of file to save{X} to.",
      normalize: true,
      type: "string"
    }),
    NewOpt("overwrite", {
      descTemplate: "Replace file if it already exists.",
      type: "boolean"
    })
  ]
};

const New = (context) => {
  const logger = context.concerns.Logger;

  const write = ({text, outfile}) => {
    outfile = outfile || context.args.outfile;
    const fullPath = absPath(outfile, context.cwd);
    if(fs.existsSync(fullPath)) {
      if(context.args.overwrite) {
        logger.warn(`File '${fullPath}' already exists, --overwrite specified, replacing...`);
      } else {
        throw Error(`File '${fullPath}' already exists.`);
      }
    }
    logger.log(`Writing data to ${fullPath}...`);
    return fs.writeFileSync(fullPath, text);
  };

  const writeJson = ({obj, outfile}) => write(
    {
      text: JSON.stringify(obj, null, 2),
      outfile
    }
  );

  return {write, writeJson};
};

module.exports = {
  blueprint,
  New
};