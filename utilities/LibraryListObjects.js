// List all object IDs in a library
const R = require("ramda");

const {ModOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Library = require("./lib/concerns/Library");

class LibraryListObjects extends Utility {
  blueprint() {
    return {
      concerns: [Library],
      options: [
        ModOpt("libraryId", {demand: true})
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const list = await this.concerns.Library.objectList();

    const object_ids = R.map(R.prop("objectId"))(list);
    logger.data("object_ids", object_ids);
    logger.logList(...object_ids);
    if(object_ids.length === 0) logger.warn("No visible objects found using supplied private key.");
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