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
    })
  ]
};

const New = (context) => {
  const logger = context.concerns.Logger;

  const write = ({data, outfile}) => {
    outfile = outfile || context.args.outfile;
    const fullPath = absPath(outfile, context.cwd);
    if(fs.existsSync(fullPath)) throw Error(`File '${fullPath}' already exists.`);
    logger.log(`Writing data to ${fullPath}...`);
    return fs.writeFileSync(fullPath, data);
  };

  return {write};
};

module.exports = {
  blueprint,
  New
};