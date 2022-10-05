/* eslint-disable no-console */

const ScriptBase = require("./parentClasses/ScriptBase");

class DraftFinalize extends ScriptBase {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const writeToken = this.args.writeToken;

    console.log("Finalizing object...");
    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    console.log("New version hash: " + finalizeResponse.hash);
  }

  header() {
    return "Finalize draft " + this.args.writeToken + "'... ";
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
      })
      .option("writeToken", {
        alias: "write-token",
        demandOption: true,
        describe: "Write token of draft",
        type: "string"
      });
  }
}

const script = new DraftFinalize;
script.run();
