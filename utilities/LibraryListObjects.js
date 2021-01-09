// List all object IDs in a library
const R = require("ramda");

const {StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");

class LibraryListObjects extends Utility {
  blueprint() {
    return {
      concerns: [Client],
      options: [
        StdOpt("libraryId", {demand: true})
      ]
    };
  }

  async body() {
    const client = await this.concerns.Client.get();
    const libraryId = this.args.libraryId;
    const logger = this.logger;

    const response = await client.ContentObjects({
      libraryId,
      filterOptions: {
        limit: 100000
      }
    });

    const object_ids = R.map(R.prop("id"))(response.contents);
    logger.data("object_ids", object_ids);
    logger.logList(...object_ids);
    if(object_ids.length === 0) {
      logger.log("No visible objects found using supplied private key.");
    }
  }

  header() {
    return `Getting list of object IDs from ${this.args.libraryId}...`;
  }

}

if(require.main === module) {
  Utility.cmdLineInvoke(LibraryListObjects);
} else {
  module.exports = LibraryListObjects;
}