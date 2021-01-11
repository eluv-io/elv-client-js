/* eslint-disable no-console */
const ScriptBase = require("./parentClasses/ScriptBase");
ScriptBase.deprecationNotice("ObjectAddGroupPerms.js");

const { ElvClient } = require("../src/ElvClient");

const yargs = require("yargs");
const argv = yargs
  .option("objectId", {
    description: "ID of the object"
  })
  .option("groupAddress", {
    description: "address of group"
  })
  .option("config-url", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
  })
  .option("permissions", {
    type: "array",
    description: "One or more permissions to add",
    choices: ["see","access","manage"]
  })
  .demandOption(
    ["objectId", "groupAddress", "permissions"],
    "\nUsage: PRIVATE_KEY=<private-key> node AddGroupPermissions.js --objectId <object-id> --groupAddress <address-of-group> --permissions <see access manage> (--config-url \"<fabric-config-url>\")\n"
  )
  .argv;

const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]};

const AddPermissions = async ({
  objectId,
  groupAddress,
  permissions
}) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});
    // client.ToggleLogging(true);

    if(permissions.includes("see")) {
      await client.AddContentObjectGroupPermission({
        objectId,
        groupAddress,
        permission: "see"
      });
    }

    if(permissions.includes("access")) {
      await client.AddContentObjectGroupPermission({
        objectId,
        groupAddress,
        permission: "access"
      });
    }

    if(permissions.includes("manage")) {
      await client.AddContentObjectGroupPermission({
        objectId,
        groupAddress,
        permission: "manage"
      });
    }

    console.log("Done");
  } catch(error) {
    console.error("Error:");
    console.error(error.body ? JSON.stringify(error, null, 2): error);
  }
};

let {
  objectId,
  groupAddress,
  permissions
} = argv;

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  return;
}

AddPermissions({
  objectId,
  groupAddress,
  permissions
});
