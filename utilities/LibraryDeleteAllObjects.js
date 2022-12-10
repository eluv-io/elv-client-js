// Delete all visible objects in a content fabric library
const {ModOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const ArgLibraryId = require("./lib/concerns/ArgLibraryId");

class LibraryDeleteAllObjects extends Utility {
  static blueprint() {
    return {
      concerns: [Client, ArgLibraryId],
      options: [
        ModOpt("libraryId", {X: " containing objects to delete", demand: true})
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const libraryId = this.args.libraryId;

    const list = await this.concerns.ArgLibraryId.libObjectList();
    logger.log(`Objects found: ${list.length}`);
    logger.data("objectsFoundCount", list.length);

    let objects_deleted_count = 0;
    const deletedIds = [];
    logger.data("deletedObjectIds", deletedIds);
    const client = await this.concerns.Client.get();
    for(const {objectId} of list) {
      logger.log(`  Deleting ${objectId}...`);
      await client.DeleteContentObject({
        libraryId,
        objectId
      });
      objects_deleted_count += 1;
      logger.data("objectsDeletedCount", objects_deleted_count);
      logger.dataConcat("deletedObjectIds", objectId);
      deletedIds.push(objectId);
    }
  }

  header() {
    return `Deleting all objects from library ${this.args.libraryId}...`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(LibraryDeleteAllObjects);
} else {
  module.exports = LibraryDeleteAllObjects;
}
