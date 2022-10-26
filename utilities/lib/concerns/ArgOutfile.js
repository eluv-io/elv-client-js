// code related to writing results to file
const fs = require("fs");

const columnify = require("columnify");
const R = require("ramda");

const {absPath, identity} = require("../helpers");
const {NewOpt} = require("../options");

const Logger = require("./Logger");

const blueprint = {
  name: "ArgOutfile",
  concerns: [Logger],
  options: [
    NewOpt("outfile", {
      descTemplate: "Path of file to save{X} to.",
      normalize: true,
      type: "string"
    }),
    NewOpt("overwrite", {
      descTemplate: "Replace output file if it already exists.",
      type: "boolean"
    })
  ]
};

const New = (context) => {
  const logger = context.concerns.Logger;

  const write = ({text}) => {
    const {outfile} = context.args;
    if(!outfile) throw Error("ArgOutfile.write() - missing --outfile");
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

  const writeJson = ({obj}) => write({text: JSON.stringify(obj, null, 2)});

  const writeTable = ({list, options = {}}) => {
    const mergedOptions = R.mergeDeepRight(
      {headingTransform: identity},
      options
    );
    write({text: columnify(list, mergedOptions)});
  };

  // instance interface
  return {
    write,
    writeJson,
    writeTable
  };
};

module.exports = {
  blueprint,
  New
};
