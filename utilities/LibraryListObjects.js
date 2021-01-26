// List all object IDs in a library

const {ModOpt, NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const JSON = require("./lib/concerns/JSON");
const Library = require("./lib/concerns/Library");

class LibraryListObjects extends Utility {
  blueprint() {
    return {
      concerns: [JSON, Library],
      options: [
        ModOpt("libraryId", {demand: true}),
        NewOpt("filter", {
          descTemplate: "JSON expression (or path to JSON file if starting with '@') to filter objects by metadata",
          type: "string"
        })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const filter = this.args.filter && this.concerns.JSON.parseStringOrFile(this.args.filter);

    const objectList = await this.concerns.Library.objectList(
      {
        filterOptions: {
          select: ["/public/name", "/offerings"],
          filter
        }
      }
    );
    const formattedObjList = objectList.map(x => ({
      object_id: x.objectId,
      latest_hash: x.latestHash,
      name: x.metadata.public.name
    }));
    logger.data("object_list", formattedObjList);

    logger.logTable(formattedObjList);
    if(formattedObjList.length === 0) logger.warn("No visible objects found using supplied private key.");
  }

  header() {
    return `List objects in library ${this.args.libraryId}`;
  }

}

if(require.main === module) {
  Utility.cmdLineInvoke(LibraryListObjects);
} else {
  module.exports = LibraryListObjects;
}