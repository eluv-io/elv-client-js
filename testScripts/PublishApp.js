/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");

const yargs = require("yargs");
const argv = yargs
  .option("typeName", {
    description: "Name of the type to publish to"
  })
  .option("typeId", {
    description: "ID of the content type to publish to"
  })
  .option("app", {
    description: "Path to app - must be a single HTML file"
  })
  .option("role", {
    description: "Role of the app"
  })
  .demandOption(
    ["app", "role"],
    "\nUsage: PRIVATE_KEY=<private-key> node PublishApp (--typeName <name> | --typeId <id>) --app <app.html> --role (manage|display)"
  )
  .argv;

const ClientConfiguration = require("../TestConfiguration.json");

const Publish = async ({privateKey, typeName, typeId, app, role}) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({privateKey});

    await client.SetSigner({signer});

    const appData = fs.readFileSync(app);

    if(!typeId) {
      typeId = (await client.ContentType({name: typeName})).id;
    }

    const writeToken = (await client.EditContentObject({
      libraryId: client.contentSpaceLibraryId,
      objectId: typeId
    })).write_token;

    const fileInfo = [{
      path: `${role}App/index.html`,
      type: "file",
      mime_type: "text/html",
      size: appData.length,
      data: appData
    }];

    await client.UploadFiles({
      libraryId: client.contentSpaceLibraryId,
      objectId: typeId,
      writeToken,
      fileInfo
    });

    await client.ReplaceMetadata({
      libraryId: client.contentSpaceLibraryId,
      objectId: typeId,
      writeToken,
      metadataSubtree: `eluv.${role}App`,
      metadata: `${role}App/index.html`
    });

    await client.FinalizeContentObject({
      libraryId: client.contentSpaceLibraryId,
      objectId: typeId,
      writeToken
    });

    console.log("Successfully updated app");
  } catch(error) {
    console.error("Failed to update:");
    console.error(error);
  }
};

let {typeName, typeId, app, role} = argv;

if(!typeName && !typeId) {
  console.error("Type name or ID must be specified");
  return;
}

role = role.toLowerCase();
if(!["display", "manage"].includes(role)) {
  console.error("Role must be 'display' or 'manage'");
  return;
}

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  return;
}

Publish({privateKey, typeName, typeId, app, role});
