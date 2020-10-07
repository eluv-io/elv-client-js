/* eslint-disable no-console */
const ScriptBase = require("./parentClasses/ScriptBase");

class ObjectSetPermissions extends ScriptBase {
  async body() {
    const client = await this.client();

    const objectId = this.args.objectId;
    let permissionLevel = this.args.value;

    switch(permissionLevel) {
      case "Public":
        permissionLevel = "public";
        break;
      case "PubliclyListable":
        permissionLevel = "listable";
        break;
      case "Viewable":
        permissionLevel ="viewable";
        break;
      case "Editable":
        permissionLevel = "editable";
        break;
      case "OwnerOnly":
        permissionLevel = "owner";
        break;
    }

    const prevHash = await client.LatestVersionHash({objectId: objectId});
    await client.SetPermission({objectId: objectId, permission: permissionLevel});
    const newHash = await client.LatestVersionHash({objectId: objectId});

    if(prevHash === newHash) {
      console.log("\nVersion hash unchanged: " + newHash + "\n");
    } else {
      console.log("\nNew version hash: " + newHash + "\n");
    }
  }

  options() {
    return super.options()
      .option("objectId", {
        alias: "object-id",
        demandOption: true,
        describe: "Object ID (should start with 'iq__')",
        type: "string"
      })
      .option("value", {
        demandOption: true,
        describe: "Object permissions value",
        choices: ["OwnerOnly", "owner", "Editable", "editable", "Viewable", "viewable", "PubliclyListable", "listable", "Public", "public"],
        type: "string"
      });
  }

  header() {
    return ("Changing object '" + this.args.objectId + "' permissions to '" + this.args.value + "'...");
  }
}

const script = new ObjectSetPermissions;
script.run();