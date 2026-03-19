// Give a group permissions to an object
const {ModOpt, NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const ArgNoWait = require("./lib/concerns/ArgNoWait");
const ArgObjectId = require("./lib/concerns/ArgObjectId");
const Logger = require("./lib/concerns/Logger");
const Edit = require("./lib/concerns/Edit");


class CollectionManageObject extends Utility {
  blueprint() {
    return {
      concerns: [Logger, ArgNoWait, ArgObjectId, Client, Edit],
      options: [
        ModOpt("objectId", {demand: true, X:" to be added or removed from a collection / content group"}),
        NewOpt("groupIds",{
          demand: true,
          descTemplate: "collection / content groups to add the content to",
          type: "array"
        }),
        NewOpt("remove", {
          descTemplate: "remove the object from the collection / content group(s) ",
          type: "boolean"
        }),
        NewOpt("add", {
          descTemplate: "add the object to the collection / content group(s) ",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const logger = this.concerns.Logger;
    const client = await this.concerns.Client.get();

    const {objectId, libraryId, groupIds, add, remove, noWait} = await this.concerns.ArgObjectId.argsProc();

    if (!add && !remove) {
      throw Error("Must specify either --add or --remove");
    } else if (add && remove) {
      throw Error("Cannot specify both --add and --remove");
    }

    const writeToken = await this.concerns.Edit.getWriteToken({libraryId, objectId});

    logger.log(`Write token: ${writeToken}`);
    logger.data("write_token", writeToken);

    if (add) {
      logger.log(`Adding object ${objectId} to groups: ${groupIds.join(", ")}`);

      const response = await client.AddContentObjectFolders({
        libraryId,
        objectId,
        writeToken,
        groupIds: groupIds
      });
      logger.log(`AddContentObjectFolders response: ${JSON.stringify(response)}`);
      logger.data("add_response", response);
    }

    if (remove) {
      logger.log(`Removing object ${objectId} from groups: ${groupIds.join(", ")}`);

      const response = await client.RemoveContentObjectFolders({        
        libraryId,
        objectId,
        writeToken,
        groupIds: groupIds
      });
      logger.log(`RemoveContentFolders response: ${JSON.stringify(response)}`);
      logger.data("remove_response", response);
    }

    const versionHash = await this.concerns.Edit.finalize({
      libraryId,
      objectId,
      writeToken,
      noWait
    });

    logger.log(`version_hash: ${versionHash}`);
    logger.data("version_hash", versionHash);

    const response = await client.ContentObjectFolders({
      libraryId,
      objectId,
    })

    logger.log(`ContentObjectFolders response: ${JSON.stringify(response)}`);
  }

  header() {
    return `Add or remove ${this.args.objectId} to/from groups ${this.args.groupIds.join(", ")}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(CollectionManageObject);
} else {
  module.exports = CollectionManageObject;
}