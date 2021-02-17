const {ModOpt, StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ArgNoWait = require("./lib/concerns/ArgNoWait");
const ArgType = require("./lib/concerns/ArgType");
const Client = require("./lib/concerns/Client");
const FabricObject = require("./lib/concerns/FabricObject");
const Library = require("./lib/concerns/Library");

class ObjectCreate extends Utility {
  blueprint() {
    return {
      concerns: [Client, Library, FabricObject, ArgType, ArgNoWait],
      options: [
        ModOpt("libraryId", {demand: true}),
        StdOpt("name",
          {
            demand: true,
            forX: "new object"
          }),
        ModOpt("type", {demand: true})
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {libraryId, name} = this.args;
    const type = await this.concerns.ArgType.typVersionHash();
    const options = {
      meta: {public: {name}},
      type
    };

    const client = await this.concerns.Client.get();
    const {objectId, writeToken} = await client.CreateContentObject({
      libraryId,
      options
    });

    logger.log(`New object ID: ${objectId}`);
    logger.data("object_id", objectId);
    logger.log(`write_token: ${writeToken}`);
    logger.data("write_token", writeToken);

    const latestHash = await this.concerns.FinalizeAndWait.finalize(
      {
        libraryId,
        objectId,
        writeToken
      }
    );

    logger.log(`version_hash: ${latestHash}`);
    logger.data("version_hash", latestHash);

  }

  header() {
    return `Create object '${this.args.name}' in lib ${this.args.libraryId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectCreate);
} else {
  module.exports = ObjectCreate;
}