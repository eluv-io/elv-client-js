// Create new production master from specified file(s)

const {ModOpt, StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ArgNoWait = require("./lib/concerns/ArgNoWait");
const ExistObj = require("./lib/concerns/ExistObj");
const CloudFile = require("./lib/concerns/CloudFile");
const Edit = require("./lib/concerns/Edit");
const LocalFile = require("./lib/concerns/LocalFile");
const Logger = require("./lib/concerns/Logger");

class ObjectAddFiles extends Utility {
  blueprint() {
    return {
      concerns: [Logger, ExistObj, Edit, ArgNoWait, LocalFile, CloudFile],
      options: [
        ModOpt("files", {X: "to add"}),
        StdOpt("encrypt", {X: "uploaded files"})
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {encrypt, noWait} = this.args;

    let access;
    if(this.args.s3Reference || this.args.s3Copy) access = this.concerns.CloudFile.credentialSet();

    let fileHandles = [];
    const fileInfo = access
      ? this.concerns.CloudFile.fileInfo()
      : this.concerns.LocalFile.fileInfo(fileHandles);

    const {libraryId, objectId} = await this.concerns.ExistObj.argsProc();

    let writeToken;
    if(this.args.resume){
      // resume with existing write token
      writeToken = this.args.resume;

      if(access) {
        await this.concerns.CloudFile.resume({
          libraryId,
          objectId,
          writeToken,
          access,
          fileInfo,
          encrypt
        });
      } else {
        // TODO for local file
      }

    } else {

      // create new write token
      writeToken = await this.concerns.Edit.getWriteToken({
        libraryId,
        objectId
      });

      if(access) {
        await this.concerns.CloudFile.add({
          libraryId,
          objectId,
          writeToken,
          access,
          fileInfo,
          encrypt
        });
      } else {
        await this.concerns.LocalFile.add({
          libraryId,
          objectId,
          writeToken,
          fileInfo,
          encrypt
        });
        // Close file handles
        this.concerns.LocalFile.closeFileHandles(fileHandles);
      }

    }

    // finalize the write token
    const hash = await this.concerns.Edit.finalize({
      libraryId,
      noWait,
      objectId,
      writeToken
    });

    logger.logList(
      "",
      "File(s) added.",
      `New version hash: ${hash}`,
      ""
    );

    logger.data("version_hash", hash);
  }

  header() {
    return `Add file(s) to object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectAddFiles);
} else {
  module.exports = ObjectAddFiles;
}