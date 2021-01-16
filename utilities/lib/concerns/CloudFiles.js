const path = require("path");

const {StdOpt, NewOpt} = require("../options");

const CloudAccess = require("./CloudAccess");
const Logger = require("./Logger");

const chkCredsButNoS3 = (argv) => {
  if(argv.credentials) {
    if(!argv.s3Copy && !argv.s3Reference) {
      throw Error("--credentials supplied but neither --s3Copy nor --s3Reference specified");
    }
  }
  return true; // tell yargs that the arguments passed the check
};

const blueprint = {
  name: "CloudFiles",
  concerns: [Logger, CloudAccess],
  options: [
    StdOpt("files", {demand: true}),
    NewOpt("s3Copy", {
      conflicts: "s3-reference",
      descTemplate: "If specified, files will be copied from an S3 bucket instead of uploaded from the local filesystem",
      group: "Cloud",
      type: "boolean"
    }),
    NewOpt("s3Reference",  {
      conflicts: ["s3-copy", "encrypt"],
      descTemplate: "If specified, files will be referenced as links to an S3 bucket instead of copied to fabric",
      group: "Cloud",
      type: "boolean"
    })
  ],
  checksMap: {chkCredsButNoS3}
};

const New = context => {

  const access = context.concerns.CloudAccess.access;

  const callback = context.concerns.Logger.log;

  const fileInfo = () => {
    return context.args.files.map(filePath => ({
      path: path.basename(filePath),
      source: filePath,
    }));
  };

  return {access, callback, fileInfo};
};

module.exports = {blueprint, New};