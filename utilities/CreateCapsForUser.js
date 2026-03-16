const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const Edit = require("./lib/concerns/Edit");

class CreateCapsForUser extends Utility {
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

    if (!(await client.HasCaps({ libraryId, objectId }))) {
      logger.log("no CAPS found in object");
      return;
    }

    const userPublicKey = client.utils.GetPublicKey(publicKey);
    const userAddress = client.utils.PublicKeyToAddress(userPublicKey);

    const callerHasCaps = await client.HasCapsForUser({libraryId, objectId, userAddress:client.signer.address});
    if(!callerHasCaps) {
      throw new Error (`current caller has no CAPS for ${objectId}, but other CAPS exist`);
    }

    const userHasCaps =await client.HasCapsForUser({libraryId, objectId, userAddress});

    if(!userHasCaps){
      await client.CreateNonOwnerCap({
        libraryId,
        objectId,
        publicKey
      });
      logger.log("Creation of CAPS for user provided is complete");
      return;
    }

    logger.log("CAPS already exists for the user provided");
  }



  header() {
    return `Create CAPS for the user provided for object '${this.args.objectId}'`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(CreateCapsForUser);
} else {
  module.exports = CreateCapsForUser;
}