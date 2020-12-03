/* eslint-disable no-console */
const fs = require("fs");

const ScriptBase = require("./parentClasses/ScriptBase");

class ObjectDownloadPart extends ScriptBase {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const partHash = this.args.partHash;

    const arrayBuffer = await client.DownloadPart({
      libraryId,
      objectId,
      partHash
    });

    fs.writeFileSync(partHash, Buffer.from(arrayBuffer));
  }

  header() {
    return "Downloading part " + this.args.partHash + " from object " + this.args.objectId + "... ";
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
      .option("partHash", {
        alias: "part-hash",
        demandOption: true,
        describe: "Object ID (should start with 'hpq_ or hqpe')",
        type: "string"
      });
  }
}

const script = new ObjectDownloadPart;
script.run();