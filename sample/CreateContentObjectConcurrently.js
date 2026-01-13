const { ElvClient } = require("../src/ElvClient");
const yargs = require("yargs");
const pLimit = require("p-limit");

// Default
const CONCURRENCY = 20;        // max objects per batch
const DEFAULT_RETRIES = 3;     // retry attempts
const DEFAULT_DELAY_MS = 1000; // base delay for exponential backoff
const BATCH_DELAY_MS = 2000;   // wait 2s between batches to allow clear some pending txs.

const limit = pLimit(CONCURRENCY);

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
  .demandOption(
    ["libraryId"],
    "Usage: PRIVATE_KEY=<pk> node CreateContentObjectConcurrently.js " +
    "--libraryId ilib123 " +
    "--count 20 " +
    "--config-url <fabric-config-url>"
  )
  .help()
  .argv;

const ClientConfiguration = argv["config-url"]
  ? { "config-url": argv["config-url"] }
  : require("../TestConfiguration.json");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function createContentObject({ client, libraryId, name }) {
  console.log(`Creating object ${name}...`);

  const { objectId, writeToken } = await client.CreateContentObject({ libraryId });

  // Add name to metadata
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

async function createContentObjectWithRetry({ client, libraryId, name, retries = DEFAULT_RETRIES, delayMs = DEFAULT_DELAY_MS }) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await createContentObject({ client, libraryId, name });
    } catch (err) {
      if (attempt === retries - 1) {
        throw new Error(`Failed creating object ${name} after ${retries} attempts`);
      }
      const wait = delayMs * 2 ** attempt;
      console.warn(`Attempt ${attempt + 1} failed for ${name}: ${err.message}. Retrying in ${wait}ms`);
      await sleep(wait);
    }
  }
}

// Run jobs in batches with a delay between each batch
async function runBatches(jobs) {
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY);
    console.log(`Starting batch ${Math.floor(i / CONCURRENCY) + 1} (${batch.length} jobs)...`);

    await Promise.all(batch.map(job => limit(() => job())));

    if (i + CONCURRENCY < jobs.length) {
      console.log(`Batch ${Math.floor(i / CONCURRENCY) + 1} completed. Waiting ${BATCH_DELAY_MS}ms before next batch...`);
      await sleep(BATCH_DELAY_MS);
    }
  }
}

async function createObjectsConcurrently() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY environment variable must be specified");

  const client = await ElvClient.FromConfigurationUrl({
    configUrl: ClientConfiguration["config-url"],
  });
  console.log("Using client:", client.configUrl);

  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({ privateKey });
  client.SetSigner({ signer });

  const { libraryId, count } = argv;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const objectNames = Array.from({ length: count }, (_, i) => `content_${timestamp}_${i + 1}`);
  const failed = [];

  const jobs = objectNames.map(name => async () => {
    try {
      await createContentObjectWithRetry({ client, libraryId, name });
    } catch (err) {
      console.error(`Failed creating object ${name}: ${err.message}`);
      failed.push(name);
    }
  });

  await runBatches(jobs);

  if (failed.length) {
    console.log("\nFailed objects:");
    failed.forEach(name => console.log(" -", name));
    console.log(`\nTotal failed objects: ${failed.length}`);
  }
}

createObjectsConcurrently().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
