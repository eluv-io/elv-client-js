const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const Edit = require("./lib/concerns/Edit");

class TransferOwnership extends Utility {
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

    const res =  await client.EditContentObject({libraryId, objectId});

    await client.TransferOwnership({
      libraryId,
      objectId,
      writeToken: res.writeToken,
      newOwnerPublicKey: publicKey
    });

    const newOwnerAddr = client.utils.PublicKeyToAddress(client.utils.GetPublicKey(publicKey));
    logger.log(`Transferred ownership of ${objectId} to ${newOwnerAddr}...`);

    const versionHash = await this.concerns.Edit.finalize({
      libraryId,
      objectId,
      writeToken:res.writeToken
    });
    logger.log("version hash", versionHash);
  }

  header() {
    return `Transfer ownership for ${this.args.objectId}'`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(TransferOwnership);
} else {
  module.exports = TransferOwnership;
}