// List all access gropus visible to the current private key

const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const Logger = require("./lib/concerns/Logger");

class ListAccessGroups extends Utility {
  blueprint() {
    return {
      concerns: [Logger, Client]
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
    return "Get list of access groups";
  }

}

if(require.main === module) {
  Utility.cmdLineInvoke(ListAccessGroups);
} else {
  module.exports = ListAccessGroups;
}
