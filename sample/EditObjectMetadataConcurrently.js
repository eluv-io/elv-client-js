#!/usr/bin/env node
const { batchProcess } = require("./batchProcessor");
const { ElvClient } = require("../src/ElvClient");
const yargs = require("yargs");

const argv = yargs
  .option("objects", {
    type: "string",
    description: "Comma-separated list of object IDs",
    coerce: arg => arg.split(",").map(s => s.trim()),
  })
  .option("mergeMetadata", {
    type: "array",
    description: "Metadata to merge (--mergeMetadata <subtree> '<json>')",
  })
  .option("deleteMetadata", {
    type: "array",
    description: "Metadata subtree to delete (--deleteMetadata <subtree>)",
  })
  .option("config-url", {
    type: "string",
    description: "Fabric config URL",
  })
  .demandOption(
    ["objects"],
    "\nUsage: PRIVATE_KEY=<pk> node EditObjectMetadataConcurrently " +
    "--objects iq__1,iq__2 --mergeMetadata /test '{\"a\":1}'")
  .help()
  .argv;

const ClientConfiguration = argv["config-url"]
  ? { "config-url": argv["config-url"] }
  : require("../TestConfiguration.json");

async function processObject({ client, objectId }) {
  const { mergeMetadata = [], deleteMetadata = [] } = argv;

  if (!mergeMetadata.length && !deleteMetadata.length) {
    throw new Error("Either --mergeMetadata or --deleteMetadata must be provided");
  }

  console.log(`\nProcessing ${objectId}`);
  const libraryId = await client.ContentObjectLibraryId({ objectId });
  const { write_token: writeToken } = await client.EditContentObject({ libraryId, objectId });

  // Merge metadata
  for (let i = 0; i < mergeMetadata.length; i += 2) {
    const subtree = mergeMetadata[i];
    const rawMetadata = mergeMetadata[i + 1];

    if (!subtree || !rawMetadata) {
      throw new Error(`Invalid --mergeMetadata arguments for ${objectId}`);
    }

    let metadata;
    try {
      metadata = JSON.parse(rawMetadata);
    } catch (err) {
      throw new Error(`Invalid JSON metadata: ${rawMetadata}`);
    }

    await client.MergeMetadata({ libraryId, objectId, writeToken, metadataSubtree: subtree, metadata });
  }

  // Delete metadata
  for (const subtree of deleteMetadata) {
    await client.DeleteMetadata({ libraryId, objectId, writeToken, metadataSubtree: subtree });
  }

  const { hash } = await client.FinalizeContentObject({ libraryId, objectId, writeToken });
  console.log(`${objectId} finalized: ${hash}`);
}

// ========================

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY environment variable is required");

  const client = await ElvClient.FromConfigurationUrl({ configUrl: ClientConfiguration["config-url"] });
  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({ privateKey });
  client.SetSigner({ signer });

  console.log(`Using signer: ${await signer.getAddress()}`);

  // Run batchProcess
  const failed = await batchProcess(
    argv.objects,
    objectId => processObject({ client, objectId }),
    {
      batchSize: 20,       // number of objects per batch
      batchDelayMs: 2000,  // wait 2s between batches
      concurrency: 5,      // number of concurrent jobs per batch
      retries: 3,          // retry each failed object 3 times
      retryDelayMs: 1000,  // base delay for retry exponential backoff
    }
  );

  if (failed.length) {
    console.log("\nFAILED objects:");
    failed.forEach(id => console.log(" -", id));
    console.log(`\nTotal failed: ${failed.length}`);
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});