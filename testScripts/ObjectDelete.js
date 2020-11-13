/* eslint-disable no-console */

const ScriptBase = require("./parentClasses/ScriptBase");

class ObjectDelete extends ScriptBase {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;

    await client.DeleteContentObject({
      libraryId,
      objectId
    });
  }

  header() {
    return "Deleting object " + this.args.objectId + "... ";
  }

  options() {
    return super.options()
      .option("libraryId", {
        alias: "library-id",
        demandOption: true,
        describe: "Library ID (should start with 'ilib')",
        type: "string"
      })
      .option("objectId", {
        alias: "object-id",
        demandOption: true,
        describe: "Object ID (should start with 'iq__')",
        type: "string"
      });
  }
}

const script = new ObjectDelete;
script.run();