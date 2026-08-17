/**
 * Lists the first N objects in a library and outputs a JSON file with:
 *  - name
 *  - size (sum of all parts, in bytes)
 *  - latest version hash
 *  - duration from offering/default/media_struct/streams/video/duration/rat
 *
 * Usage:
 *   node scripts/list-library-objects.js \
 *     --libraryId <ilib...> \
 *     [--limit 10] \
 *     [--out objects.json]
 */

const { ElvClient } = require("@eluvio/elv-client-js");
const fs = require("fs");

const args = process.argv.slice(2).reduce((acc, val, i, arr) => {
  if (val.startsWith("--")) acc[val.slice(2)] = arr[i + 1];
  return acc;
}, {});

const LIBRARY_ID = args.libraryId;
const LIMIT      = parseInt(args.limit ?? "10", 10);
const OUT_FILE   = args.out ?? "objects.json";
const CONFIG_URL = args.configUrl ?? "https://main.net955305.contentfabric.io";

if (!LIBRARY_ID) {
  console.error("Error: --libraryId is required");
  process.exit(1);
}

if (!process.env.PRIVATE_KEY) {
  console.error("Error: PRIVATE_KEY environment variable is not set");
  process.exit(1);
}

(async () => {
  const client = await ElvClient.FromConfigurationUrl({ configUrl: CONFIG_URL });

  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({ privateKey: process.env.PRIVATE_KEY });
  await client.SetSigner({ signer });

  const response = await client.ContentObjects({
    libraryId: LIBRARY_ID,
    filterOptions: {
      limit: LIMIT,
      select: ["/public/name"],
    },
  });

  const objects = (response.contents ?? []).slice(0, LIMIT);
  console.log(`Fetched ${objects.length} object(s) from ${LIBRARY_ID}`);

  const results = [];

  for (const obj of objects) {
    const objectId   = obj.id;
    const latestHash = obj.versions?.[0]?.hash ?? null;
    const name       = obj.versions?.[0]?.meta?.public?.name ?? null;

    // Size — sum of all parts
    let size = null;
    try {
      const parts = await client.ContentParts({ libraryId: LIBRARY_ID, objectId });
      size = (parts ?? []).reduce((sum, p) => sum + (p.size ?? 0), 0);
    } catch {
      // object may have no parts
    }

    // Duration from private metadata
    let duration = null;
    try {
      duration = await client.ContentObjectMetadata({
        libraryId: LIBRARY_ID,
        objectId,
        metadataSubtree: "offerings/default/media_struct/streams/video/duration/rat",
      });
    } catch {
      // field may not exist on this object
    }

    results.push({ object_id: objectId, name, latest_hash: latestHash, size, duration });
    console.log(`  ✓ ${objectId}  ${name ?? "(no name)"}`);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} record(s) to ${OUT_FILE}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
