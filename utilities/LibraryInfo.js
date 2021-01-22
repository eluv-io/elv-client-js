// List info about a library

const {ModOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const Library = require("./lib/concerns/Library");
const Logger = require("./lib/concerns/Logger");
const Outfile = require("./lib/concerns/Outfile");

class LibraryInfo extends Utility {
  blueprint() {
    return {
      concerns: [Logger, Library, Outfile],
      options: [
        ModOpt("libraryId", {demand: true})
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const obj = await this.concerns.Library.info();
    logger.data("library_info", obj);
    if(this.args.outfile) {
      this.concerns.Outfile.writeJson({obj});
    } else {
      this.logger.logObject(obj);
    }
  }

  header() {
    return `Get info for library ${this.args.libraryId}...`;
  }

}

if(require.main === module) {
  Utility.cmdLineInvoke(LibraryInfo);
} else {
  module.exports = LibraryInfo;
}