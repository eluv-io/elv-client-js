// Delete a single object
const {ModOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const FabricObject = require("./lib/concerns/FabricObject");

class ObjectDelete extends Utility {
  blueprint() {
    return {
      concerns: [FabricObject, Client],
      options: [
        ModOpt("objectId", {ofX:" item to delete"}),
        ModOpt("libraryId", {ofX:" object to delete"})
      ]
    };
  }

  async body() {
    const client = await this.concerns.Client.get();
    const libraryId = await this.concerns.FabricObject.libraryIdGet();
    const objectId = this.args.objectId;

    await client.DeleteContentObject({
      libraryId,
      objectId
    });
  }

  header() {
    return `Delete object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectDelete);
} else {
  module.exports = ObjectDelete;
}