// Delete all visible objects in a content fabric library
const {StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");

class LibraryDeleteAllObjects extends Utility {
  blueprint() {
    return {
      concerns: [Client],
      options: [
        StdOpt("libraryId", {X: " containing objects to delete", demand: true})
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const client = await this.concerns.Client.get();

    const libraryId = this.args.libraryId;

    const response = await client.ContentObjects({
      libraryId: libraryId,
      filterOptions: {
        limit: 100000
      }
    });

    const rows = response.contents;
    logger.log(`Objects found: ${rows.length}`);
    logger.data("objects_found_count", rows.length);

    let objects_deleted_count = 0;
    const deletedIds = [];
    logger.data("objects_deleted_count", objects_deleted_count);
    logger.data("deleted_object_ids", deletedIds);

    for(const r of rows) {
      const objectId = r.id;
      logger.log(`  Deleting ${objectId}...`);
      await client.DeleteContentObject({
        libraryId,
        objectId
      });
      objects_deleted_count += 1;
      logger.data("objects_deleted_count", objects_deleted_count);
      deletedIds.push(objectId);
    }
  }

  header() {
    return `Deleting all objects from library '${this.args.libraryId}'...`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(LibraryDeleteAllObjects);
} else {
  module.exports = LibraryDeleteAllObjects;
}