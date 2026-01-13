const { ElvClient } = require("../src/ElvClient");
const yargs = require("yargs");
const pLimit = require("p-limit");

// Config
const CONCURRENCY = 20;       // max objects per batch
const DEFAULT_RETRIES = 3;     // retry attempts
const DEFAULT_DELAY_MS = 1000; // base delay for exponential backoff
const BATCH_DELAY_MS = 2000;   // wait 2s between batches

const limit = pLimit(CONCURRENCY);

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
    description: "Fabric config URL (e.g. https://main.net955210.contentfabric.io/config)",
  })
  .demandOption(
    ["objects"],
    "\nUsage: PRIVATE_KEY=<pk> node EditObjectMetadataConcurrently " +
    "--objects iq__1,iq__2 --mergeMetadata /test '{\"a\":1}'"
  )
  .help()
  .argv;

const ClientConfiguration = argv["config-url"]
  ? { "config-url": argv["config-url"] }
  : require("../TestConfiguration.json");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


async function processObject({ client, objectId, mergeMetadata = [], deleteMetadata = [] }) {
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

    await client.MergeMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: subtree,
      metadata,
    });
  }

  // Delete metadata
  for (const subtree of deleteMetadata) {
    await client.DeleteMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: subtree,
    });
  }

  const { hash } = await client.FinalizeContentObject({ libraryId, objectId, writeToken });
  console.log(`${objectId} finalized: ${hash}`);
}

// Retry wrapper with exponential backoff
async function processObjectWithRetries({ client, objectId, mergeMetadata, deleteMetadata, retries = DEFAULT_RETRIES, delayMs = DEFAULT_DELAY_MS }) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await processObject({ client, objectId, mergeMetadata, deleteMetadata });
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = delayMs * 2 ** attempt;
      console.log(`Attempt ${attempt + 1} failed for ${objectId}: ${err.message}. Retrying in ${wait}ms`);
      await sleep(wait);
    }
  }
}

// Batch runner
async function runBatches(jobs) {
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY);
    console.log(`Starting batch ${Math.floor(i / CONCURRENCY) + 1} (${batch.length} jobs)...`);
    await Promise.all(batch.map(job => limit(() => job())));
    if (i + CONCURRENCY < jobs.length) {
      console.log(`Batch ${Math.floor(i / CONCURRENCY) + 1} complete. Waiting ${BATCH_DELAY_MS}ms before next batch...`);
      await sleep(BATCH_DELAY_MS);
    }
  }
}


async function editObjectMetadataConcurrently() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY environment variable is required");

  const client = await ElvClient.FromConfigurationUrl({
    configUrl: ClientConfiguration["config-url"],
  });

  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({ privateKey });
  client.SetSigner({ signer });

  console.log(`Using signer: ${await signer.getAddress()}`);

  const failed = [];
  const jobs = argv.objects.map(objectId => async () => {
    try {
      await processObjectWithRetries({
        client,
        objectId,
        mergeMetadata: [...(argv.mergeMetadata || [])],
        deleteMetadata: [...(argv.deleteMetadata || [])],
      });
    } catch (err) {
      console.error(`Failed updating ${objectId}: ${err.message}`);
      failed.push(objectId);
    }
  });

  await runBatches(jobs);

  if (failed.length) {
    console.log("\nFAILED objects:");
    failed.forEach(id => console.log(" -", id));
    console.log(`\nTotal failed: ${failed.length}`);
  }
}

editObjectMetadataConcurrently().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
