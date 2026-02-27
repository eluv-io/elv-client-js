const pLimit = require("p-limit");

// Sleep helper
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic batch processor
 * @param {Array} items - list of items to process
 * @param {Function} jobFn - async function to process a single item
 * @param {Object} options
 *    batchSize: number of items per batch
 *    batchDelayMs: delay between batches
 *    concurrency: number of concurrent jobs in a batch
 *    retries: number of retries for each job
 *    retryDelayMs: base delay for retry exponential backoff
 */
async function batchProcess(items, jobFn, {
  batchSize = 20,
  batchDelayMs = 2000,
  concurrency = 5,
  retries = 3,
  retryDelayMs = 1000
} = {}) {
  const limit = pLimit(concurrency);
  const failed = [];

  const runJobWithRetry = async (item) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await jobFn(item);
      } catch (err) {
        if (attempt === retries) {
          failed.push(item);
          console.error(`Failed item ${item}: ${err.message}`);
          return;
        }
        const wait = retryDelayMs * 2 ** attempt;
        console.warn(`Attempt ${attempt + 1} failed for ${item}: ${err.message}. Retrying in ${wait}ms`);
        await sleep(wait);
      }
    }
  };

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} items)...`);

    await Promise.all(
      batch.map(item => limit(() => runJobWithRetry(item)))
    );

    if (i + batchSize < items.length) {
      console.log(`Waiting ${batchDelayMs}ms before next batch...`);
      await sleep(batchDelayMs);
    }
  }

  if (failed.length) {
    console.log(`\nFailed items: ${failed.length}`);
    failed.forEach(item => console.log(" -", item));
  }

  return failed;
}

module.exports = { batchProcess };
