#!/usr/bin/env node
const { batchProcess } = require("./batchProcessor");
const { ElvClient } = require("../src/ElvClient");
const yargs = require("yargs");

const argv = yargs
  .option("libraryId", {
    type: "string",
    description: "Library ID",
    demandOption: true,
  })
  .option("count", {
    type: "number",
    description: "Number of objects to create",
    default: 10,
  })
  .option("config-url", {
    type: "string",
    description: "Fabric config URL",
  })
  .help()
  .argv;

// Configuration
const ClientConfiguration = argv["config-url"]
  ? { "config-url": argv["config-url"] }
  : require("../TestConfiguration.json");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function createContentObject({ client, libraryId, name }) {
  console.log(`Creating object ${name}...`);

  const { objectId, writeToken } = await client.CreateContentObject({ libraryId });

  // Add name metadata
  await client.MergeMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: "/public/name",
    metadata: name,
  });

  await client.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken,
    commitMessage: "Create new object",
  });

  console.log(`Created object ${objectId} (${name})`);
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable must be specified");
  }

  // Initialize ElvClient
  const client = await ElvClient.FromConfigurationUrl({
    configUrl: ClientConfiguration["config-url"],
  });

  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({ privateKey });
  client.SetSigner({ signer });

  const { libraryId, count } = argv;

  // Generate object names with timestamps
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const objectNames = Array.from({ length: count }, (_, i) => `content_${timestamp}_${i + 1}`);

  console.log(`Starting batch creation of ${objectNames.length} objects in library ${libraryId}`);

  // Run batch process
  const failed = await batchProcess(
    objectNames,
    async (name) => createContentObject({ client, libraryId, name }),
    {
      batchSize: 20,        // number of objects per batch
      concurrency: 3,       // concurrent jobs in a batch
      batchDelayMs: 2000,   // wait time between batches
      retries: 3,           // retry failed jobs
      retryDelayMs: 1000,   // base delay for exponential backoff
    }
  );

  if (failed.length > 0) {
    console.log(`\nFailed objects:`);
    failed.forEach(name => console.log(" -", name));
    console.log(`\nTotal Failed objects: ${failed.length}`)
  } else {
    console.log("\nAll objects created successfully!");
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
