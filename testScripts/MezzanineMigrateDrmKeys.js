/* eslint-disable no-console */

// Migrates ABR Mezzanine DRM keys to new metadata key /elv/crypt/drm

const ScriptBase = require("./parentClasses/ScriptBase");

class MezzanineMigrateDrmKeys extends ScriptBase {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;

    const editResponse = await client.EditContentObject({
      libraryId,
      objectId
    });

    const writeToken = editResponse.write_token;

    await client.CallBitcodeMethod({
      constant: false,
      libraryId,
      method: "/media/abr_mezzanine/migrate",
      objectId,
      writeToken
    });

    console.log("Finalizing object...");
    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    console.log("New version hash: " + finalizeResponse.hash);
  }

  header() {
    return "Migrating DRM keys for mezzanine " + this.args.objectId + "... ";
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

const script = new MezzanineMigrateDrmKeys();
script.run();