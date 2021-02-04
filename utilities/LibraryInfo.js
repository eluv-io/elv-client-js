// List info about a library

const {ModOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const Logger = require("./lib/concerns/Logger");
const ArgOutfile = require("./lib/concerns/ArgOutfile");

class LibraryInfo extends Utility {
  blueprint() {
    return {
      concerns: [Logger, ArgLibraryId, ArgOutfile],
      options: [
        ModOpt("libraryId", {demand: true})
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const obj = await this.concerns.ArgLibraryId.libInfo();
    logger.data("library_info", obj);
    if(this.args.outfile) {
      this.concerns.ArgOutfile.writeJson({obj});
    } else {
      this.logger.logObject(obj);
    }
  }

  header() {
    return `Get info for library ${this.args.libraryId}`;
  }

}

if(require.main === module) {
  Utility.cmdLineInvoke(LibraryInfo);
} else {
  module.exports = LibraryInfo;
}