#!/usr/bin/env node
// Reads a content object's info and metadata given its object ID.
const { ElvClient } = require("../src/ElvClient");
const yargs = require("yargs");

const argv = yargs
  .option("objectId", {
    type: "string",
    description: "Object ID to read",
    demandOption: true,
  })
  .option("privateKey", {
    type: "string",
    description: "Private key of the signer (falls back to PRIVATE_KEY env var)",
  })
  .option("config-url", {
    type: "string",
    description: "Fabric config URL",
    default: "https://main.net955305.contentfabric.io/config",
  })
  .option("noAuth", {
    type: "boolean",
    description: "to create plain signed tokens for tenant or content admins",
    default: false,
  })
  .option("mode", {
    type: "string",
    choices: ["token", "perCall"],
    description:
      "token: generate the noAuth token once via MetadataAuth and pass it explicitly to each call. " +
      "perCall: pass noAuth directly to each call and let it derive its own token internally.",
    default: "perCall",
  })
  .option("metadataPath", {
    type: "string",
    description: "Path to the metadata to read",
    default: "/offerings/all/media_struct/streams",
  })
  .option("debug", {
    type: "boolean",
    description: "Print debug logging for API calls",
    default: false,
  })
  .help()
  .argv;

async function main() {
  const { objectId } = argv;
  const privateKey = argv.privateKey || process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Private key must be specified via --privateKey or PRIVATE_KEY environment variable");
  }

  const client = await ElvClient.FromConfigurationUrl({
    configUrl: argv["config-url"],
  });

  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({ privateKey });
  client.SetSigner({ signer });

  if (argv.debug) {
    client.ToggleLogging(argv.debug);
  }

  console.log(`Reading object ${objectId}...`);

  const libraryId = await client.ContentObjectLibraryId({ objectId });

  // example private metadata path
  const metadataSubtree = argv.metadataPath;

  // If noAuth is specified, generate a token once and pass it to each call.
  let authorizationToken;
  if (argv.mode === "token") {
    authorizationToken = await client.MetadataAuth({
      libraryId,
      objectId,
      path: metadataSubtree,
      noAuth: true,
    });
    console.log("\nnoAuth token:", authorizationToken);
  }

  const info = await client.ContentObject({ objectId, authorizationToken });
  const res = await client.ContentObjectMetadata({
    libraryId,
    objectId,
    metadataSubtree,
    noAuth: argv.noAuth,
    authorizationToken,
  });

  // console.log("\nLibrary ID:", libraryId);
  // console.log("\nObject info:");
  // console.log(JSON.stringify(info, null, 2));
  console.log(`\n${metadataSubtree}:`);
  if (typeof res === "string") {
    console.log(res);
  } else {
    console.log(JSON.stringify(res, null, 2));
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
