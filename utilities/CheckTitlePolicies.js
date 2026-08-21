// Quick, read-only check: for every title referenced by a VU site object, does its
// content-object contract have an "_ELV" policy set? Reads the same two contract meta
// keys as elv-live-js's NftGetPolicyAndPermissions (getMeta("_ELV") for the policy,
// getMeta("_NFT_ACCESS") for permissions), done directly via elv-client-js's own
// CallContractMethod so no elv-live-js dependency is needed. Title-only, no playable
// discovery/URL rendering - much faster than a full VUSiteTitlePlayoutURLs.js run when
// this is all you need.
//
// Usage: PRIVATE_KEY=... FABRIC_CONFIG_URL=... node utilities/CheckTitlePolicies.js
//   [--objectId <site object id>] [--libraryId <site library id>] [--titlesSubtree <path>]

const { ElvClient } = require("../src/ElvClient");
const Ethers = require("ethers");
const yaml = require("js-yaml");
const kindOf = require("kind-of");
const fs = require("fs");
const path = require("path");

const BaseContentAbi = require("../src/contracts/v3/BaseContent.js").abi;

// Minimal .env.local loader (no dotenv dependency) - real environment values always win.
(() => {
  const envPath = path.join(__dirname, "..", ".env.local");
  if(!fs.existsSync(envPath)) return;
  for(const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if(!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if(eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if(/^".*"$/.test(value) || /^'.*'$/.test(value)) value = value.slice(1, -1);
    if(key && !(key in process.env)) process.env[key] = value;
  }
})();

const RE_LINK_HASH = /^\/qfab\/(hq__[a-zA-Z0-9]+)\//;

const getArg = (name, def) => {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : def;
};

const objectId = getArg("objectId", "iq__395wfhZKD9gh8eZ9XDETcZQx6M5r");
const libraryId = getArg("libraryId", "ilibgZ6BxdtQGRd3gmvcwEWtEKrePYo");
const titlesSubtree = getArg("titlesSubtree", "/public/asset_metadata/titles");

const checkObjectPolicy = async (client, titleObjectId) => {
  const address = client.utils.HashToAddress(titleObjectId);
  const readMeta = async (key) => {
    const bytes = await client.CallContractMethod({
      contractAddress: address,
      abi: BaseContentAbi,
      methodName: "getMeta",
      methodArgs: [key],
      formatArguments: true
    });
    return Ethers.utils.toUtf8String(bytes || "0x").trim();
  };

  try {
    const policyText = await readMeta("_ELV");

    let policyName = null;
    if(policyText) {
      try {
        const authPolicy = JSON.parse(policyText).auth_policy || {};
        let bodyDoc = null;
        if(authPolicy.body) {
          try {
            bodyDoc = yaml.load(authPolicy.body);
          } catch(_yamlErr) {
            // body wasn't valid YAML - fall through to the wrapper's own fields
          }
        }
        policyName = (bodyDoc && bodyDoc.name) || authPolicy.description || authPolicy.id || null;
      } catch(_parseErr) {
        // not the expected JSON shape - leave name unknown, has_policy is still true
      }
    }

    return { has_policy: policyText.length > 0, name: policyName, error: null };
  } catch(err) {
    return { has_policy: null, name: null, error: err.message };
  }
};

(async () => {
  const privateKey = process.env.PRIVATE_KEY;
  const configUrl = process.env.FABRIC_CONFIG_URL;
  if(!privateKey) throw Error("Please set environment variable PRIVATE_KEY");
  if(!configUrl) throw Error("Please set environment variable FABRIC_CONFIG_URL");

  console.log(`Initializing elv-client-js... (config URL: ${configUrl})`);
  const client = await ElvClient.FromConfigurationUrl({ configUrl });
  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({ privateKey });
  await client.SetSigner({ signer });

  console.log(`Retrieving titles list from ${objectId}, subtree ${titlesSubtree}...`);
  const titleLinks = await client.ContentObjectMetadata({ libraryId, objectId, metadataSubtree: titlesSubtree });
  if(kindOf(titleLinks) !== "object" || Object.keys(titleLinks).length === 0) {
    throw Error(`No titles found at ${titlesSubtree} on ${objectId}`);
  }

  const entries = [];
  for(const link of Object.values(titleLinks)) {
    const linkPath = link && link["/"];
    const match = linkPath && RE_LINK_HASH.exec(linkPath);
    if(!match) continue;
    const versionHash = match[1];
    entries.push({ versionHash, titleObjectId: client.utils.DecodeVersionHash(versionHash).objectId });
  }

  console.log(`Found ${entries.length} title(s). Checking policy for each...\n`);

  const results = [];
  for(const { titleObjectId, versionHash } of entries) {
    let titleName = titleObjectId;
    try {
      const meta = await client.ContentObjectMetadata({
        versionHash,
        metadataSubtree: "/public/asset_metadata",
        select: ["display_title", "title"]
      });
      titleName = meta.display_title || meta.title || titleObjectId;
    } catch(_metaErr) {
      // fall back to showing the object ID as the name
    }

    const policy = await checkObjectPolicy(client, titleObjectId);
    results.push({ title_name: titleName, title_object_id: titleObjectId, ...policy });

    const status = policy.has_policy === true ? "SET    " : policy.has_policy === false ? "MISSING" : "ERROR  ";
    const nameSuffix = policy.name ? `  [${policy.name}]` : "";
    const errorSuffix = policy.error ? `  ERROR: ${policy.error}` : "";
    console.log(`${status}  ${titleName}  (${titleObjectId})${nameSuffix}${errorSuffix}`);
  }

  const set = results.filter(r => r.has_policy === true);
  const missing = results.filter(r => r.has_policy === false);
  const errored = results.filter(r => r.has_policy == null);

  console.log(`\n${results.length} total - ${set.length} set, ${missing.length} missing, ${errored.length} errored`);

  if(missing.length > 0) {
    console.log("\nTitles with NO policy set:");
    missing.forEach(r => console.log(`  ${r.title_name}  (${r.title_object_id})`));
  }
})().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
