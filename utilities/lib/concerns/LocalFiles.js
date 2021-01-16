// code related to opening local files (generally for upload to fabric)
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const {absPath} = require("../helpers");
const {StdOpt} = require("../options");

const Logger = require("./Logger");

const blueprint = {
  name: "LocalFiles",
  concerns: [Logger],
  options: [
    StdOpt("files", {demand: true}),
  ]
};

const New = context => {

  const callback = progress => {
    Object.keys(progress).sort().forEach(filename => {
      const {uploaded, total} = progress[filename];
      const percentage = total === 0 ? "100.0%" : (100 * uploaded / total).toFixed(1) + "%";
      context.concerns.Logger.log(`${filename}: ${percentage}`);
    });
  };

  const closeFileHandles = fileHandles => fileHandles.forEach(descriptor => fs.closeSync(descriptor));

  const fileInfo = fileHandles => {
    return context.args.files.map(filePath => {
      const fullPath = absPath(filePath, context.cwd);
      const fileDescriptor = fs.openSync(fullPath, "r");
      fileHandles.push(fileDescriptor);
      const size = fs.fstatSync(fileDescriptor).size;
      const mimeType = mime.lookup(fullPath) || "video/mp4";

      return {
        path: path.basename(fullPath),
        type: "file",
        mime_type: mimeType,
        size: size,
        data: fileDescriptor
      };
    });
  };

  return {callback, closeFileHandles, fileInfo};
};

module.exports = {blueprint, New};