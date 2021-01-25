// Create new production master from specified file(s)

const {ModOpt, StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const CloudFile = require("./lib/concerns/CloudFile");
const ObjectEdit = require("./lib/concerns/ObjectEdit");
const LocalFile = require("./lib/concerns/LocalFile");
const Logger = require("./lib/concerns/Logger");

class ObjectAddFiles extends Utility {
  blueprint() {
    return {
      concerns: [Logger, ObjectEdit, LocalFile, CloudFile],
      options: [
        ModOpt("files", {X: "to add"}),
        StdOpt("encrypt", {X: "uploaded files"})
      ]
    };
  }

  async body() {
    const logger = this.logger;
    await this.concerns.ObjectEdit.libraryIdArgPopulate();
    const {libraryId, objectId, encrypt} = this.args;

    let access;
    if(this.args.s3Reference || this.args.s3Copy) access = this.concerns.CloudFile.credentialSet();

    let fileHandles = [];
    const fileInfo = access
      ? this.concerns.CloudFile.fileInfo()
      : this.concerns.LocalFile.fileInfo(fileHandles);

    const writeToken = await this.concerns.ObjectEdit.getWriteToken();

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

    const hash = await this.concerns.ObjectEdit.finalize({writeToken});

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