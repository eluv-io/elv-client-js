const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const Edit = require("./lib/concerns/Edit");

class MigrateEncryptionConkForNewUser extends Utility {
  blueprint() {
    return {
      concerns: [Client, Edit],
      options: [
        NewOpt("objectId",
          {
            descTemplate: "object Id",
            type: "string",
            demand: true
          }),
        NewOpt("publicKey",
          {
            descTemplate: "new user public key with/without encoded form",
            type: "string",
            demand: true
          })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {objectId, publicKey} = this.args;

    const client = await this.concerns.Client.get();
    const libraryId = await client.ContentObjectLibraryId({objectId});

    await client.CreateNonOwnerCap({
      libraryId,
      objectId,
      publicKey
    });
    logger.log("Migration of encryption conk is complete...");
  }

  header() {
    return `Migrate encryption conk to the user provided for object '${this.args.objectId}'`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(MigrateEncryptionConkForNewUser);
} else {
  module.exports = MigrateEncryptionConkForNewUser;
}