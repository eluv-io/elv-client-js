// List all libraries visible to the current private key

const Utility = require("./lib/Utility");

const Library = require("./lib/concerns/Library");
const Logger = require("./lib/concerns/Logger");

class ListLibraries extends Utility {
  blueprint() {
    return {
      concerns: [Logger, Library]
    };
  }

  async body() {
    const logger = this.logger;
    const libList = await this.concerns.Library.list();
    logger.data("libraries", libList);

    logger.logList(libList);
    if(libList.length === 0) logger.warn("No visible libraries found using supplied private key.");
  }

  header() {
    return "Get list of libraries";
  }

}

if(require.main === module) {
  Utility.cmdLineInvoke(ListLibraries);
} else {
  module.exports = ListLibraries;
}