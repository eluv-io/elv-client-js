const R = require("ramda");

const {ModOpt, StdOpt, NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const ArgNoWait = require("./lib/concerns/ArgNoWait");
const ArgType = require("./lib/concerns/ArgType");
const Draft = require("./lib/concerns/Draft");
const Finalize = require("./lib/concerns/Finalize");
const Client = require("./lib/concerns/Client");

class CollectionCreate extends Utility {
  blueprint() {
    return {
      concerns: [ArgLibraryId, ArgType, ArgNoWait, Draft, Finalize],
      options: [
        ModOpt("libraryId", {demand: true}),
        StdOpt("name",
          {
            demand: true,
            forX: "new collection"
          }),
        NewOpt("displayTitle",
          {
            demand: false,
            descTemplate: "Display title for new collection"
          })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {name, displayTitle, noWait, libraryId} = this.args;

    const client = await this.concerns.Client.get()

    const metadata =  {"public":{name}};
    
    const {objectId, writeToken} = await client.CreateContentFolder({
      libraryId, 
      name, 
      displayTitle, 
      tags: [ "elv:content-collection" ]
    });
      
    logger.log(`New object ID: ${objectId}`);
    logger.data("object_id", objectId);

    logger.log(`New write token: ${writeToken}`);
    logger.data("write_token", writeToken);

    await client.SetPermission({
      objectId,
      writeToken,
      permission: "viewable"
    });
         
    const versionHash = await this.concerns.Finalize.finalize({
      libraryId,
      objectId,
      writeToken,
      noWait
    });

    logger.log(`version_hash: ${versionHash}`);
    logger.data("version_hash", versionHash);    
  }

  header() {
    return `Create object '${this.args.name}' in lib ${this.args.libraryId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(CollectionCreate);
} else {
  module.exports = CollectionCreate;
}
