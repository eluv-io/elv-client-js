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
      writeToken = this.args.resume;
      try {
        let res = await this.concerns.CloudFile.listFilesJob({
          libraryId,
          objectId,
          writeToken
        });

        const inprogessIds = res
          .filter(item => item.status === "IN_PROGRESS")
          .map(item => item.id);
        if (inprogessIds.length === 0) {
          logger.logList("No in-progress jobs found");
        } else {
          logger.logList(`In-progress job IDs: ${inprogessIds}`);
        }
        // resume job

        for(const jobId in inprogessIds) {
          res = await this.concerns.CloudFile.resumeFilesJob({
            libraryId,
            objectId,
            writeToken,
            jobId,
            encrypt
          });
          console.log("RES", res);
        }

        return inprogessIds;
      } catch(e){
        throw e;
      }
    }

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