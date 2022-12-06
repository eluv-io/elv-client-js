// Give a group permissions to an object
const {ModOpt, NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const ArgObjectId = require("./lib/concerns/ArgObjectId");
const Logger = require("./lib/concerns/Logger");

const permissionTypes = ["see","access","manage"];

class ObjectAddGroupPerms extends Utility {
  static blueprint() {
    return {
      concerns: [Logger, ArgObjectId, Client],
      options: [
        ModOpt("objectId", {demand: true, X:" to add group permissions to"}),
        NewOpt("groupAddress",{
          demand: true,
          descTemplate: "address of group to grant permissions to",
          type: "string"
        }),
        NewOpt("permissions", {
          choices: permissionTypes,
          demand: true,
          descTemplate: "One or more permissions to add",
          string: true,
          type: "array"
        })
      ]
    };
  }

  async body() {
    const logger = this.concerns.Logger;
    const client = await this.concerns.Client.get();

    const {objectId, groupAddress} = await this.concerns.ArgObjectId.argsProc();

    for(const permission of permissionTypes) {
      if(this.args.permissions.includes(permission)) {
        logger.log(`Adding permission: ${permission}...`);
        await client.AddContentObjectGroupPermission({
          objectId,
          groupAddress,
          permission
        });
      }
    }
  }

  header() {
    return `Add permission(s) to ${this.args.objectId} for group ${this.args.groupAddress}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectAddGroupPerms);
} else {
  module.exports = ObjectAddGroupPerms;
}
