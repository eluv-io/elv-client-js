// Reads a VU site object's titles list, resolves each title's master hash, and generates
// dash-clear / dash-widevine playout URLs for every unique playable variant found in each
// title (all territories, all variants, plus their trailers), along with each variant's
// audio and subtitle specification so playout can be tested.
//
// Incremental: structural discovery (PlayoutOptions/AvailableOfferings calls) is only
// redone for titles whose master hash changed since the last run - persisted in a state
// directory as manifest.ignore.json. Every run still re-renders fresh, non-expired
// signed-token URLs for ALL known titles (cheap - no network calls), and appends a summary
// to runs.ignore.jsonl (never truncated, so pass/fail history accumulates across runs).
// Titles that disappear from the site's list (e.g. an old object ID left behind after
// a re-ingest under a new one) are removed from the manifest on the next run.

const kindOf = require("kind-of");
const Ethers = require("ethers");
const yaml = require("js-yaml");
const deepEqual = require("deep-equal");

const { NewOpt, StdOpt } = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const ArgOutfile = require("./lib/concerns/ArgOutfile");
const Version = require("./lib/concerns/Version");

const BaseContentAbi = require("../src/contracts/v3/BaseContent.js").abi;

const fs = require("fs");
const path = require("path");

// Minimal .env.local loader (no dotenv dependency, matching this repo's utilities'
// low-dependency style) - values already set in the real environment always win, so
// shell-exported overrides still work as expected. Never logs values, only that the
// file was found.
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
const RE_TERRITORY_VARIANT = /distributions\.([^.]+)\.variants\.([^.]+)/;

// the only two playout formats requested
const PLAYOUT_FORMATS = [
  { key: "dash-clear", protocol: "dash", drms: [] },
  { key: "dash-widevine", protocol: "dash", drms: ["widevine"] }
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// elv-client-js's own CallContractMethod (src/EthClient.js) retries forever with no cap
// whenever the underlying provider error message contains "invalid response" - a real
// hang risk for the per-playable policy/commit checks below, since not every playable's
// derived contract address is guaranteed to be a live BaseContent contract. This is an
// external safety net around that: race the call against a timeout so one bad object
// can't block the whole run.
const CHECK_TIMEOUT_MS = Number(process.env.CHECK_TIMEOUT_MS || 15000);
const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Error(`Timed out after ${ms}ms${label ? ` (${label})` : ""}`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

// same tenant the dashboard's Mint Entitlement command targets - kept in sync with
// utilities/VUSiteTitleDashboard.js's TENANT_ID default.
const ENTITLEMENT_TENANT_ID = process.env.TENANT_ID || "itenpQ9zSeeFbz8hTHF1pKeD3P3wLpB";

// rebuild a Rep()-style playout URL (specific node host, pinned to whatever version was
// latest when this call resolved it) into the network-alias form, addressed by object ID
// rather than version hash so the URL keeps resolving to whatever is current after future
// re-ingests instead of going stale. Returns the *relative path only* (no query params) -
// query params (resolve/authorization) are added later at render time, separately, so this
// path can be cached and reused across runs without re-hitting the fabric.
// e.g. /q/iq__.../rep/playout/default/dash-clear/dash.mpd
const RE_QLIBS_PREFIX = /^\/qlibs\/[^/]+(\/q\/hq__.*)$/;
const RE_PATH_HASH_SEGMENT = /\/q\/hq__[a-zA-Z0-9]+\//;
const extractGlobalRelativePath = ({ playoutUrl, objectId }) => {
  let relativePath = new URL(playoutUrl).pathname;
  const qlibsMatch = RE_QLIBS_PREFIX.exec(relativePath);
  if(qlibsMatch) relativePath = qlibsMatch[1];
  return relativePath.replace(RE_PATH_HASH_SEGMENT, `/q/${objectId}/`);
};

const globalHostFor = (client) => {
  const network = client.NetworkInfo().name;
  const globalHost = network === "main" ?
    "https://main.net955305.contentfabric.io" :
    "https://demov3.net955210.contentfabric.io";
  return { network, globalHost };
};

// splice a fresh authorization token into a cached relative path -> full playout URL
const renderPlayoutUrl = ({ client, relativePath, authorizationToken }) => {
  const { network, globalHost } = globalHostFor(client);
  const url = new URL(`${globalHost}/s/${network}${relativePath}`);
  url.searchParams.set("resolve", "false");
  url.searchParams.set("authorization", authorizationToken);
  return url.toString();
};

// splice a fresh authorization token into a cached license server base URL -> full URL
// (kept on its own node host, unlike the playout URL - mirrors the raw license_servers
// value). Unlike the playout URL, the widevine license server wants an exact version
// hash rather than an object ID, so qhash is the playable's latest version hash.
const renderLicenseServerUrl = ({ licenseServerBase, qhash, authorizationToken }) => {
  if(!licenseServerBase) return null;
  const url = new URL(licenseServerBase);
  url.searchParams.set("authorization", authorizationToken);
  url.searchParams.set("qhash", qhash);
  url.searchParams.set("resolve", "false");
  url.searchParams.set("exo", "1");
  return url.toString();
};

const pickLicenseServerBase = (licenseServers) => {
  if(!licenseServers || licenseServers.length === 0) return null;
  const httpsServers = licenseServers.filter(uri => uri.toLowerCase().startsWith("https"));
  const base = (httpsServers.length > 0 ? httpsServers : licenseServers)[0];
  // strip query params - we only want host+path, params are added fresh at render time
  const url = new URL(base);
  url.search = "";
  return url.toString();
};

class VUSiteTitlePlayoutURLs extends Utility {
  blueprint() {
    return {
      concerns: [Client, ArgOutfile],
      options: [
        StdOpt("objectId", {
          default: "iq__395wfhZKD9gh8eZ9XDETcZQx6M5r",
          descTemplate: "Site object ID{X} containing the titles list"
        }),
        StdOpt("libraryId", {
          default: "ilibgZ6BxdtQGRd3gmvcwEWtEKrePYo",
          descTemplate: "Library ID{X} containing the site object"
        }),
        NewOpt("titlesSubtree", {
          default: "/public/asset_metadata/titles",
          descTemplate: "Metadata subtree{X} on the site object holding the list of title links",
          type: "string"
        }),
        NewOpt("indexObjectId", {
          default: "iq__3PAHXWd19DDzQmi2nkLqhituSg54",
          descTemplate: "Catalog/index object ID{X} to reconcile the site's titles list against",
          type: "string"
        }),
        NewOpt("indexTitlesSubtree", {
          default: "/indexer/permissions/sorted_ids",
          descTemplate: "Metadata subtree{X} on the index object holding the sorted list of indexed object/version IDs",
          type: "string"
        }),
        NewOpt("compareSiteObjectId", {
          default: "iq__3S59EtLbz44nSHfse1U5yLxVKVpy",
          descTemplate: "Another VU site object ID{X} to compare this site's titles list against (which titles are present/missing on each side)",
          type: "string"
        }),
        NewOpt("marketplaceObjectId", {
          default: process.env.MARKETPLACE || "iq__3Jh7HXVNQujAWfBbJBCu939rLxXc",
          descTemplate: "Marketplace object ID{X} to read items/NFT templates from - kept in sync with VUSiteTitleDashboard.js's own marketplace default",
          type: "string"
        }),
        NewOpt("tokenDurationDays", {
          default: 14,
          descTemplate: "Expiration{X}, in days, for the Backend Fabric Token embedded in each playout URL",
          type: "number"
        }),
        NewOpt("stateDir", {
          default: path.join(__dirname, "data", "vu_site_playout_state"),
          descTemplate: "Directory{X} for the persisted discovery manifest and append-only run log",
          type: "string"
        }),
        NewOpt("forceRediscover", {
          descTemplate: "Ignore the cached manifest and re-run structural discovery for every title{X}, even unchanged ones",
          type: "boolean"
        }),
        NewOpt("limit", {
          descTemplate: "Only discover the first N new/changed title(s){X} (for testing; unrelated cached titles still render)",
          type: "number"
        }),
        NewOpt("failLog", {
          descTemplate: "Write failures to a JSON file{X}",
          type: "string"
        })
      ]
    };
  }

  header() {
    return `Generate playout URLs for titles referenced by site ${this.args.objectId}`;
  }

  // recursively find every node shaped like a playable unit: {playable: "iq__...", offerings: {...}}
  findPlayables(node, breadcrumb = []) {
    let found = [];
    if(kindOf(node) !== "object" && kindOf(node) !== "array") return found;

    if(kindOf(node) === "object" &&
      kindOf(node.playable) === "string" && node.playable.startsWith("iq__") &&
      kindOf(node.offerings) === "object") {
      found.push({
        playableObjectId: node.playable,
        offeringKeys: Object.keys(node.offerings),
        path: breadcrumb.join("."),
        audio: (node.specification && node.specification.audio) || [],
        subtitles: (node.specification && node.specification.subtitles) || []
      });
    }

    for(const [key, value] of Object.entries(node)) {
      found = found.concat(this.findPlayables(value, [...breadcrumb, key]));
    }
    return found;
  }

  // pull territory/variant/trailer context out of a breadcrumb path like
  // "distributions.US.variants.uhd-2d-sdr.trailer"
  variantContext(nodePath) {
    const match = RE_TERRITORY_VARIANT.exec(nodePath);
    return {
      territory: match ? match[1] : null,
      variant: match ? match[2] : null,
      isTrailer: /(^|\.)trailer(\.|$)/.test(nodePath)
    };
  }

  // shared by the site's titles list and the index object's titles list: both are
  // metadata subtrees shaped as {index: {"/": "/qfab/hq__.../..."}}
  extractTitleLinks({ titleLinks, logger }) {
    const entries = [];
    for(const [index, link] of Object.entries(titleLinks)) {
      const linkPath = link && link["/"];
      const match = linkPath && RE_LINK_HASH.exec(linkPath);
      if(!match) {
        logger.warn(`Title index ${index}: could not extract master hash from link: ${JSON.stringify(link)}`);
        continue;
      }
      entries.push({ index, versionHash: match[1], objectId: Version.decode({ versionHash: match[1] }).objectId });
    }
    return entries;
  }

  // indexer/permissions/sorted_ids (and similar index subtrees) is typically a flat
  // array of ID/hash strings rather than a link map - tolerate a few shapes since the
  // exact schema varies: plain "hq__..."/"iq__..." strings, {id|object_id: "..."}
  // objects, or link objects like {"/": "/qfab/hq__.../..."}.
  extractSortedIds({ node, logger }) {
    const items = Array.isArray(node) ? node : (kindOf(node) === "object" ? Object.values(node) : []);
    const entries = [];
    for(const item of items) {
      let raw = item;
      if(kindOf(item) === "object") {
        if(kindOf(item["/"]) === "string") {
          const match = RE_LINK_HASH.exec(item["/"]);
          raw = match ? match[1] : null;
        } else {
          raw = item.id || item.object_id || item.hash || null;
        }
      }
      if(kindOf(raw) !== "string") continue;
      if(raw.startsWith("hq__")) {
        entries.push({ versionHash: raw, objectId: Version.decode({ versionHash: raw }).objectId });
      } else if(raw.startsWith("iq__")) {
        entries.push({ versionHash: null, objectId: raw });
      } else {
        logger.warn(`Could not interpret index entry as an object/version ID: ${JSON.stringify(item)}`);
      }
    }
    return entries;
  }

  // compares the site's titles list against a separate catalog/index object's titles
  // list by object ID, so drift between the two (missing/extra titles) is visible on
  // the dashboard without needing full playout discovery for the index's titles.
  async compareAgainstIndex({ client, indexObjectId, indexTitlesSubtree, siteTitleEntries, siteTitleNames, logger }) {
    logger.log(`\nComparing site titles against index object ${indexObjectId}, subtree ${indexTitlesSubtree}...`);

    const indexLibraryId = await client.ContentObjectLibraryId({ objectId: indexObjectId });
    const indexNode = await client.ContentObjectMetadata({
      libraryId: indexLibraryId,
      objectId: indexObjectId,
      metadataSubtree: indexTitlesSubtree
    });

    const indexTitleEntries = this.extractSortedIds({ node: indexNode, logger });
    if(indexTitleEntries.length === 0) {
      throw Error(`No IDs found at ${indexTitlesSubtree} on index object ${indexObjectId}`);
    }

    const siteObjectIds = new Set(siteTitleEntries.map(t => t.objectId));
    const indexObjectIds = new Set(indexTitleEntries.map(t => t.objectId));

    const nameCache = new Map(siteTitleNames);
    const libraryIdCache = new Map();
    const resolveName = async (objectId, versionHash) => {
      if(nameCache.has(objectId)) return nameCache.get(objectId);
      try {
        let libraryId;
        if(!versionHash) {
          if(!libraryIdCache.has(objectId)) {
            libraryIdCache.set(objectId, await client.ContentObjectLibraryId({ objectId }));
          }
          libraryId = libraryIdCache.get(objectId);
        }
        const meta = await client.ContentObjectMetadata({
          libraryId, objectId, versionHash,
          metadataSubtree: "/public/asset_metadata",
          select: ["display_title", "title", "title_type"]
        });
        const name = meta.display_title || meta.title || objectId;
        nameCache.set(objectId, name);
        return name;
      } catch(err) {
        return objectId;
      }
    };

    const missingFromSite = [];
    for(const t of indexTitleEntries) {
      if(!siteObjectIds.has(t.objectId)) {
        missingFromSite.push({ object_id: t.objectId, version_hash: t.versionHash, title_name: await resolveName(t.objectId, t.versionHash) });
      }
    }

    const missingFromIndex = siteTitleEntries
      .filter(t => !indexObjectIds.has(t.objectId))
      .map(t => ({ object_id: t.objectId, version_hash: t.versionHash, title_name: nameCache.get(t.objectId) || t.objectId }));

    logger.log(`Index has ${indexTitleEntries.length} title(s); ${missingFromSite.length} missing from site, ${missingFromIndex.length} on site but missing from index`);

    return {
      index_object_id: indexObjectId,
      index_titles_subtree: indexTitlesSubtree,
      index_total: indexTitleEntries.length,
      site_total: siteTitleEntries.length,
      missing_from_site: missingFromSite,
      missing_from_index: missingFromIndex,
      compared_at: new Date().toISOString()
    };
  }

  loadCompareSiteSnapshot(stateDir, compareSiteObjectId) {
    const snapshotPath = path.join(stateDir, "compare_site.ignore.json");
    if(!fs.existsSync(snapshotPath)) return { site_object_id: compareSiteObjectId, titles: {} };
    try {
      const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
      // a different comparison site than last run - nothing to diff against
      if(snapshot.site_object_id !== compareSiteObjectId) return { site_object_id: compareSiteObjectId, titles: {} };
      return snapshot;
    } catch(err) {
      this.logger.warn(`Could not parse existing comparison site snapshot at ${snapshotPath}, starting fresh: ${err.message}`);
      return { site_object_id: compareSiteObjectId, titles: {} };
    }
  }

  saveCompareSiteSnapshot(stateDir, snapshot) {
    fs.writeFileSync(path.join(stateDir, "compare_site.ignore.json"), JSON.stringify(snapshot, null, 2));
  }

  // Lightweight, snapshot-based tracking for a second VU site object: just its titles
  // list and their master hashes (no playable/offering discovery, unlike the full
  // per-title pipeline this site gets), diffed against a snapshot persisted across runs
  // to report which titles are new and which changed since the previous run.
  async trackCompareSite({ client, compareSiteObjectId, titlesSubtree, stateDir, logger }) {
    logger.log(`\nTracking comparison site ${compareSiteObjectId}, subtree ${titlesSubtree}...`);

    const compareSiteVersionHash = await client.LatestVersionHash({ objectId: compareSiteObjectId });
    const compareSiteLastEditedAt = await this.getLastCommitTime({ client, versionHash: compareSiteVersionHash, logger });

    const compareLibraryId = await client.ContentObjectLibraryId({ objectId: compareSiteObjectId });
    const compareTitleLinks = await client.ContentObjectMetadata({
      libraryId: compareLibraryId,
      objectId: compareSiteObjectId,
      metadataSubtree: titlesSubtree
    });

    if(kindOf(compareTitleLinks) !== "object" || Object.keys(compareTitleLinks).length === 0) {
      throw Error(`No titles found at ${titlesSubtree} on comparison site ${compareSiteObjectId}`);
    }

    const compareTitleEntries = this.extractTitleLinks({ titleLinks: compareTitleLinks, logger });
    // Same staleness issue as the main site (see body()) - the comparison site's own
    // titles link can lag behind a title's actual latest version, so resolve it directly
    // rather than trusting the link.
    for(const entry of compareTitleEntries) {
      try {
        entry.versionHash = await client.LatestVersionHash({ objectId: entry.objectId });
      } catch(err) {
        logger.warn(`  Could not resolve latest version for ${entry.objectId}, falling back to the comparison site's own link (${entry.versionHash}): ${err.message}`);
      }
    }
    const previousTitles = this.loadCompareSiteSnapshot(stateDir, compareSiteObjectId).titles || {};

    const resolveName = async (objectId, versionHash) => {
      try {
        const meta = await client.ContentObjectMetadata({
          objectId, versionHash,
          metadataSubtree: "/public/asset_metadata",
          select: ["display_title", "title", "title_type"]
        });
        return meta.display_title || meta.title || objectId;
      } catch(err) {
        return objectId;
      }
    };

    const added = [];
    const updated = [];
    const currentTitles = {};
    for(const t of compareTitleEntries) {
      const prev = previousTitles[t.objectId];
      if(!prev) {
        const name = await resolveName(t.objectId, t.versionHash);
        currentTitles[t.objectId] = { title_object_id: t.objectId, title_name: name, title_master_hash: t.versionHash };
        added.push({ title_object_id: t.objectId, title_name: name });
      } else if(prev.title_master_hash !== t.versionHash) {
        const name = await resolveName(t.objectId, t.versionHash);
        currentTitles[t.objectId] = { title_object_id: t.objectId, title_name: name, title_master_hash: t.versionHash };
        updated.push({ title_object_id: t.objectId, title_name: name });
      } else {
        currentTitles[t.objectId] = prev;
      }
    }

    this.saveCompareSiteSnapshot(stateDir, { site_object_id: compareSiteObjectId, titles: currentTitles, last_run_at: new Date().toISOString() });

    logger.log(`Comparison site has ${compareTitleEntries.length} title(s); ${added.length} new, ${updated.length} updated since last run`);

    return {
      compare_site_object_id: compareSiteObjectId,
      compare_site_version_hash: compareSiteVersionHash,
      compare_site_last_edited_at: compareSiteLastEditedAt,
      compare_site_total: compareTitleEntries.length,
      // Full current membership (not just this run's added/updated delta) - lets the
      // dashboard flag, per title, whether it's also present on the comparison site.
      // Matched by name, not object ID: each site has its own independently-created
      // title objects for the same movie, so object IDs never coincide across sites.
      title_names: compareTitleEntries
        .map(t => ((currentTitles[t.objectId] && currentTitles[t.objectId].title_name) || "").trim().toLowerCase())
        .filter(Boolean),
      // Full title entries (name + object id + version hash) for the site's title list display.
      titles: compareTitleEntries.map(t => currentTitles[t.objectId]).filter(Boolean),
      added,
      updated,
      tracked_at: new Date().toISOString()
    };
  }

  // A resolved link's target can come back shaped either as the target object's full
  // metadata tree (nft_template linked at the object root - "public" is a top-level key)
  // or as just the /public subtree directly (nft_template linked straight to /public) -
  // this tolerates either.
  extractNftTemplateFields(resolved) {
    if(!resolved || kindOf(resolved) !== "object") return { name: null, address: null, publicKeys: [] };
    const pub = resolved.public && kindOf(resolved.public) === "object" ? resolved.public : resolved;
    // "name" isn't consistently in the same spot across templates in practice - try the
    // common candidates before giving up.
    const name = pub.name
      || pub.display_name
      || (pub.nft && pub.nft.name)
      || (pub.asset_metadata && pub.asset_metadata.name)
      || null;
    return {
      name,
      address: (pub.nft && pub.nft.address) || null,
      publicKeys: Object.keys(pub)
    };
  }

  // Marketplace items (public/asset_metadata/info/items), each carrying an nft_template
  // link. The link's own hq__ version hash is pulled out explicitly (same RE_LINK_HASH
  // pattern used for title links) rather than relying on resolveLinks to opaquely
  // dereference it - that gives an explicit version hash to display, and a version-hash
  // cache since many items commonly share the same handful of templates. Falls back to a
  // manual objectId-based fetch if nft_template turns out to be a plain object ID string
  // instead of a fabric link.
  async fetchMarketplaceItems({ client, marketplaceObjectId, logger }) {
    logger.log(`\nFetching marketplace items from ${marketplaceObjectId}...`);

    const marketplaceLibraryId = await client.ContentObjectLibraryId({ objectId: marketplaceObjectId });
    const items = await client.ContentObjectMetadata({
      libraryId: marketplaceLibraryId,
      objectId: marketplaceObjectId,
      metadataSubtree: "/public/asset_metadata/info/items"
    });

    if(kindOf(items) !== "object" && kindOf(items) !== "array") {
      logger.warn(`No marketplace items found at /public/asset_metadata/info/items on ${marketplaceObjectId}`);
      return [];
    }

    const entries = Array.isArray(items) ? items.map((item, i) => [String(i), item]) : Object.entries(items);
    const templateCache = new Map(); // versionHash -> { name, address }
    const results = [];
    let loggedMissingNameKeys = false;

    const resolveTemplate = async (versionHash, itemKey) => {
      if(templateCache.has(versionHash)) return templateCache.get(versionHash);
      try {
        const meta = await client.ContentObjectMetadata({ versionHash, metadataSubtree: "/public" });
        const fields = this.extractNftTemplateFields(meta);
        if(!fields.name && fields.address && !loggedMissingNameKeys) {
          logger.warn(`  nft_template resolved but no name field found (tried name/display_name/nft.name/asset_metadata.name) - actual keys under its public subtree: ${fields.publicKeys.join(", ")}`);
          loggedMissingNameKeys = true;
        }
        const resolved = { name: fields.name, address: fields.address };
        templateCache.set(versionHash, resolved);
        return resolved;
      } catch(err) {
        logger.warn(`  Could not resolve nft_template for marketplace item ${itemKey}: ${err.message}`);
        return { name: null, address: null };
      }
    };

    for(const [itemKey, item] of entries) {
      if(kindOf(item) !== "object") continue;

      const sku = item.sku || null;
      const itemName = item.name || null;
      const template = item.nft_template;

      let templateVersionHash = null;
      let templateName = null;
      let nftAddress = null;

      const linkPath = template && kindOf(template) === "object" && template["/"];
      const hashMatch = linkPath && RE_LINK_HASH.exec(linkPath);

      if(hashMatch) {
        templateVersionHash = hashMatch[1];
        const resolved = await resolveTemplate(templateVersionHash, itemKey);
        templateName = resolved.name;
        nftAddress = resolved.address;
      } else if(typeof template === "string" && template.startsWith("iq__")) {
        try {
          templateVersionHash = await client.LatestVersionHash({ objectId: template });
          const resolved = await resolveTemplate(templateVersionHash, itemKey);
          templateName = resolved.name;
          nftAddress = resolved.address;
        } catch(err) {
          logger.warn(`  Could not resolve nft_template for marketplace item ${itemKey}: ${err.message}`);
        }
      }

      results.push({
        item_key: itemKey, sku, item_name: itemName,
        nft_template_name: templateName, nft_address: nftAddress,
        nft_template_version_hash: templateVersionHash
      });
    }

    logger.log(`Found ${results.length} marketplace item(s), ${results.filter(r => r.nft_address).length} with a resolved NFT template address`);
    return results;
  }

  // Cross-references a policy's permission addresses (from checkObjectPolicy) against
  // the marketplace's NFT template addresses, so a permission can be traced back to the
  // SKU/template it actually grants access for. "matched" requires BOTH that the address
  // resolves to a known marketplace template AND that the address is one of ownAddresses
  // (the addresses actually linked to this specific object's own playable offer SKUs) -
  // an address that happens to belong to some unrelated marketplace template is not a
  // valid permission for this object, even though it's a real template somewhere in the
  // marketplace. sku/nft_template_name are still reported either way, so a wrong-but-known
  // match can be told apart from a genuinely unknown address.
  resolvePermissionAddresses({ client, permissions, templateAddressMap, ownAddresses }) {
    return (permissions || []).map(address => {
      let normalized = null;
      try {
        normalized = client.utils.FormatAddress(address).toLowerCase();
      } catch(_err) {
        // not a well-formed address - leave unmatched below
      }
      const template = normalized ? templateAddressMap.get(normalized) : null;
      const isOwnAddress = !!(normalized && ownAddresses && ownAddresses.has(normalized));
      return {
        address,
        matched: !!template && isOwnAddress,
        known_elsewhere_in_marketplace: !!template && !isOwnAddress,
        sku: template ? template.sku : null,
        nft_template_name: template ? template.nft_template_name : null
      };
    });
  }

  loadManifest(stateDir) {
    const manifestPath = path.join(stateDir, "manifest.ignore.json");
    if(!fs.existsSync(manifestPath)) return { site_object_id: null, titles: {} };
    try {
      return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch(err) {
      this.logger.warn(`Could not parse existing manifest at ${manifestPath}, starting fresh: ${err.message}`);
      return { site_object_id: null, titles: {} };
    }
  }

  saveManifest(stateDir, manifest) {
    fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(path.join(stateDir, "manifest.ignore.json"), JSON.stringify(manifest, null, 2));
  }

  saveCurrent(stateDir, current) {
    fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(path.join(stateDir, "current.ignore.json"), JSON.stringify(current, null, 2));
  }

  appendRunLog(stateDir, entry) {
    fs.mkdirSync(stateDir, { recursive: true });
    fs.appendFileSync(path.join(stateDir, "runs.ignore.jsonl"), JSON.stringify(entry) + "\n");
  }

  // Baseline snapshot of trailer playables from the last run, kept separate from
  // current.ignore.json (which is fully overwritten each run) so each run can diff
  // against it to report trailers added/removed since last time.
  loadTrailerSnapshot(stateDir) {
    const snapshotPath = path.join(stateDir, "trailers.ignore.json");
    if(!fs.existsSync(snapshotPath)) return [];
    try {
      return JSON.parse(fs.readFileSync(snapshotPath, "utf8")).trailers || [];
    } catch(err) {
      this.logger.warn(`Could not parse existing trailer snapshot at ${snapshotPath}, treating as empty: ${err.message}`);
      return [];
    }
  }

  saveTrailerSnapshot(stateDir, trailers) {
    fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(
      path.join(stateDir, "trailers.ignore.json"),
      JSON.stringify({ generated_at: new Date().toISOString(), trailers }, null, 2)
    );
  }

  // extracts every trailer playable from the rendered titles, keyed by
  // title+playable+offering so the same trailer re-appearing across runs is
  // recognized as unchanged rather than added+removed.
  extractTrailers(results) {
    const trailers = [];
    for(const title of results) {
      for(const p of title.playables) {
        if(!p.is_trailer) continue;
        trailers.push({
          key: `${title.title_object_id}::${p.playable_object_id}::${p.offering}`,
          title_object_id: title.title_object_id,
          title_name: title.title_name,
          playable_object_id: p.playable_object_id,
          territory: p.territory,
          variant: p.variant,
          offering: p.offering
        });
      }
    }
    return trailers;
  }

  diffTrailers({ previousTrailers, currentTrailers }) {
    const previousKeys = new Set(previousTrailers.map(t => t.key));
    const currentKeys = new Set(currentTrailers.map(t => t.key));
    return {
      added: currentTrailers.filter(t => !previousKeys.has(t.key)),
      removed: previousTrailers.filter(t => !currentKeys.has(t.key))
    };
  }

  // commercial offers (e.g. EST/VOD) configured on one distribution/variant node,
  // each holding one or more packages with a SKU.
  extractOffers(offersNode) {
    if(kindOf(offersNode) !== "object") return [];

    return Object.entries(offersNode).map(([offerName, packages]) => {
      const packageEntries = kindOf(packages) === "object" ? Object.entries(packages) : [];
      return {
        offer_name: offerName,
        packages: packageEntries.map(([packageId, pkg]) => ({
          package_id: packageId,
          sku: (kindOf(pkg) === "object" && pkg.sku) || null
        }))
      };
    });
  }

  // offers live at distributions.{territory}.variants.{variant}.offers - sibling to
  // that variant's playable/offerings nodes - so build a {territory::variant -> offers}
  // lookup once per title, matched against each playable's own territory/variant later.
  offersByDistributionVariant(titleMeta) {
    const lookup = new Map();
    const distributions = titleMeta.distributions;
    if(kindOf(distributions) !== "object") return lookup;

    for(const [territory, distNode] of Object.entries(distributions)) {
      const variants = distNode && distNode.variants;
      if(kindOf(variants) !== "object") continue;
      for(const [variant, variantNode] of Object.entries(variants)) {
        lookup.set(`${territory}::${variant}`, this.extractOffers(variantNode && variantNode.offers));
      }
    }
    return lookup;
  }

  // structural discovery for one title: playables/offerings/formats -> cacheable relative
  // paths and license server bases. No tokens involved - safe to persist and reuse.
  async discoverTitle({ client, index, versionHash, failures }) {
    const logger = this.logger;
    const objectId = Version.decode({ versionHash }).objectId;
    logger.log(`--- Discovering title ${index}: ${objectId} (${versionHash}) ---`);

    const titleMeta = await client.ContentObjectMetadata({
      objectId,
      versionHash,
      metadataSubtree: "/public/asset_metadata"
    });

    const titleName = titleMeta.display_title || titleMeta.title ||
      (titleMeta.info && titleMeta.info.title) || objectId;
    const titleType = titleMeta.title_type || (titleMeta.info && titleMeta.info.type) || "unknown";
    const offersLookup = this.offersByDistributionVariant(titleMeta);

    const rawPlayables = this.findPlayables(titleMeta);

    // dedupe by playable objectId + offering ("unique playable assets"), covering
    // every territory/variant/trailer combination found anywhere in the title metadata
    const uniqueMap = new Map();
    for(const p of rawPlayables) {
      for(const offering of p.offeringKeys) {
        if(offering === "sbs") continue; // sbs (side-by-side 3D) offerings are excluded entirely
        const key = `${p.playableObjectId}::${offering}`;
        if(!uniqueMap.has(key)) {
          const context = this.variantContext(p.path);
          uniqueMap.set(key, {
            playableObjectId: p.playableObjectId,
            offering,
            paths: [p.path],
            audio: p.audio,
            subtitles: p.subtitles,
            offers: offersLookup.get(`${context.territory}::${context.variant}`) || [],
            ...context
          });
        } else {
          uniqueMap.get(key).paths.push(p.path);
        }
      }
    }

    logger.log(`  Title: "${titleName}" (${titleType}) - ${uniqueMap.size} unique playable/offering combo(s)`);

    // Not persisted (kept only for this title's discovery pass) - used below to flag
    // whether same-variant playables across different territories carry matching media
    // structure, then discarded so current.ignore.json doesn't balloon with raw stream reps.
    const streamsByPlayable = new Map();

    const playables = [];
    for(const { playableObjectId, offering, paths, audio, subtitles, territory, variant, isTrailer, offers } of uniqueMap.values()) {
      try {
        const availableOfferings = Object.keys(await client.AvailableOfferings({ objectId: playableObjectId }));

        if(!availableOfferings.includes(offering)) {
          logger.warn(`    Skipping ${playableObjectId} offering="${offering}": not present in object's actual offerings (${availableOfferings.join(", ") || "none"})`);
          failures.push({
            index, object_id: objectId, playable_object_id: playableObjectId, offering,
            error: `offering not found on object (available: ${availableOfferings.join(", ") || "none"})`
          });
          continue;
        }

        const formats = [];
        for(const { key: formatKey, protocol, drms } of PLAYOUT_FORMATS) {
          try {
            logger.log(`    Discovering ${formatKey}: ${playableObjectId} offering="${offering}"...`);
            const playoutMap = await client.PlayoutOptions({
              objectId: playableObjectId,
              offering,
              protocols: [protocol],
              drms
            });

            if(!playoutMap[protocol] || !playoutMap[protocol].playoutUrl) {
              logger.warn(`      No ${formatKey} option available for ${playableObjectId} offering="${offering}"`);
              failures.push({
                index, object_id: objectId, playable_object_id: playableObjectId, offering,
                format: formatKey, error: `${formatKey} not available for this offering`
              });
              continue;
            }

            const drmsInfo = playoutMap[protocol].drms || null;
            const widevineLicenseServers = drmsInfo && drmsInfo.widevine && drmsInfo.widevine.licenseServers;

            formats.push({
              format: formatKey,
              relative_path: extractGlobalRelativePath({
                playoutUrl: playoutMap[protocol].playoutUrl,
                objectId: playableObjectId
              }),
              license_server_base: pickLicenseServerBase(widevineLicenseServers)
            });
          } catch(err) {
            logger.warn(`      FAILED ${formatKey}: ${playableObjectId} offering="${offering}": ${err.message}`);
            failures.push({
              index, object_id: objectId, playable_object_id: playableObjectId, offering,
              format: formatKey, error: err.message
            });
          }
        }

        // Fetched once per playable/offering, held only in streamsByPlayable for the
        // cross-territory comparison right after this loop - not stored on the playable
        // itself (see the comment on streamsByPlayable above). drmVerified (checkDrmKeyIds)
        // IS stored directly on the playable - it's a standalone per-playable pass/fail,
        // not something compared across territories.
        let drmVerified; // undefined for trailers - not checked
        if(!isTrailer) {
          let playableVersionHash = null;
          try {
            playableVersionHash = await client.LatestVersionHash({ objectId: playableObjectId });
          } catch(err) {
            logger.warn(`    Could not resolve version hash for ${playableObjectId}: ${err.message}`);
          }

          if(playableVersionHash) {
            try {
              const streams = await client.ContentObjectMetadata({
                versionHash: playableVersionHash,
                metadataSubtree: `offerings/${offering}/media_struct/streams`
              });
              streamsByPlayable.set(playableObjectId, streams || null);
            } catch(err) {
              logger.warn(`    Could not read media_struct/streams for ${playableObjectId} offering="${offering}": ${err.message}`);
              streamsByPlayable.set(playableObjectId, undefined); // undefined = fetch failed, distinct from null = fetched empty
            }

            try {
              drmVerified = await this.checkDrmKeyIds({ client, versionHash: playableVersionHash, offering, logger });
            } catch(err) {
              logger.warn(`    Could not verify DRM key IDs for ${playableObjectId} offering="${offering}": ${err.message}`);
              drmVerified = null; // checked but failed/errored, distinct from undefined (never checked)
            }
          } else {
            streamsByPlayable.set(playableObjectId, undefined);
            drmVerified = null;
          }
        }

        playables.push({
          playable_object_id: playableObjectId,
          offering,
          territory,
          variant,
          is_trailer: isTrailer,
          variant_paths: paths,
          audio,
          subtitles,
          offers,
          formats,
          drm_verified: drmVerified
        });
      } catch(err) {
        logger.warn(`    FAILED: ${playableObjectId} offering="${offering}": ${err.message}`);
        failures.push({ index, object_id: objectId, playable_object_id: playableObjectId, offering, error: err.message });
      }
    }

    // Cross-territory media-structure checks: same offering+variant (e.g. "default"/
    // "uhd-2d-sdr") commonly appears once per territory (CA, US, ...) as separate playable
    // objects - each should carry the exact same streams. Group by offering+variant (never
    // territory - that's the axis being compared across) and flag every playable against
    // the first one seen in its group. A group with only one territory has nothing to
    // compare against, so its playable(s) are left unchecked.
    //
    // Two tests, both against offerings/{offering}/media_struct/streams:
    // 1. streams_match: the full set of stream keys matches exactly, hash suffix included
    //    (e.g. "spanish_latin_am_dub_dolby_5_1__81836d65e49ce252bf51d6068c2270a5") - not
    //    just the same tracks, but the identical underlying source per track.
    // 2. streams_sources_match: for every stream key common to both sides, the "hqp_..."
    //    part reference(s) inside streams/{stream}/sources/sources match - a finer-grained
    //    check than key equality alone, since two streams could share a key but still point
    //    at different source parts underneath. Deliberately NOT a raw deep-equal of
    //    sources.sources as a whole: that field's shape differs by territory in practice
    //    (e.g. CA: sources: [["hqp_...", "168595427"], ...] vs US: sources: [{source:
    //    "hqp_...", duration, entry_point, timeline_start, timeline_end}, ...]) even when
    //    both reference the identical part, so only the "hqp_" identifiers themselves -
    //    wherever they appear in that structure - are pulled out and compared.
    const extractHqpValues = (node) => {
      const found = [];
      const walk = (v) => {
        if(typeof v === "string") {
          if(v.startsWith("hqp_")) found.push(v);
        } else if(Array.isArray(v)) {
          v.forEach(walk);
        } else if(v && typeof v === "object") {
          Object.values(v).forEach(walk);
        }
      };
      walk(node);
      return found;
    };

    const streamsGroups = new Map();
    for(const p of playables) {
      if(p.is_trailer) continue;
      const key = `${p.offering}::${p.variant}`;
      if(!streamsGroups.has(key)) streamsGroups.set(key, []);
      streamsGroups.get(key).push(p);
    }

    for(const groupPlayables of streamsGroups.values()) {
      const territories = new Set(groupPlayables.map(p => p.territory));
      if(territories.size < 2) continue; // only one territory present - nothing to compare

      let reference = null;
      for(const p of groupPlayables) {
        const streams = streamsByPlayable.get(p.playable_object_id);
        if(streams === undefined) {
          p.streams_match = null; // fetch failed - unknown, not flagged either way
          p.streams_sources_match = null;
          continue;
        }
        const keys = Object.keys(streams).sort();
        if(!reference) {
          reference = { territory: p.territory, streams, keys };
          p.streams_match = true;
          p.streams_match_common = keys; // trivially - it's compared against itself
          p.streams_sources_match = true;
          p.streams_sources_match_list = keys;
          p.streams_sources_hqp = {};
          for(const k of keys) p.streams_sources_hqp[k] = extractHqpValues(streams[k]?.sources?.sources);
          continue;
        }

        const missing = reference.keys.filter(k => !keys.includes(k));
        const extra = keys.filter(k => !reference.keys.includes(k));
        const commonKeys = keys.filter(k => reference.keys.includes(k));
        p.streams_match = missing.length === 0 && extra.length === 0;
        p.streams_match_reference_territory = reference.territory;
        p.streams_match_common = commonKeys; // present (and thus identical) on both sides
        if(!p.streams_match) {
          // relative to the reference territory: missing = stream keys it has that this
          // one lacks, extra = stream keys this one has that it doesn't
          p.streams_match_diff = { missing, extra };
        }

        const hqpByKey = {}; // this playable's own hqp_ value(s) per common stream key
        const referenceHqpByKey = {}; // reference territory's, only kept for mismatched keys
        const sourcesMismatches = commonKeys.filter(k => {
          const a = extractHqpValues(reference.streams[k]?.sources?.sources);
          const b = extractHqpValues(streams[k]?.sources?.sources);
          hqpByKey[k] = b;
          if(!deepEqual(a, b, { strict: true })) {
            referenceHqpByKey[k] = a;
            return true;
          }
          return false;
        });
        const sourcesMatches = commonKeys.filter(k => !sourcesMismatches.includes(k));
        p.streams_sources_match = commonKeys.length > 0 ? sourcesMismatches.length === 0 : null;
        p.streams_sources_match_reference_territory = reference.territory;
        p.streams_sources_match_list = sourcesMatches; // common stream keys whose sources.sources also matched
        p.streams_sources_hqp = hqpByKey; // this playable's hqp_ value(s), keyed by stream
        if(sourcesMismatches.length > 0) {
          p.streams_sources_diff = sourcesMismatches;
          p.streams_sources_diff_reference_hqp = referenceHqpByKey; // reference's hqp_ value(s) for the differing keys
        }
      }
    }

    return {
      title_master_hash: versionHash,
      title_object_id: objectId,
      title_name: titleName,
      title_type: titleType,
      discovered_at: new Date().toISOString(),
      playables
    };
  }

  // Compares a title's previous vs. newly (re-)discovered playables to describe what
  // metadata was added since the last run that changed this title's master hash - new
  // territory/variant/offering combos, new audio/subtitle tracks, or new offer SKUs.
  // Additions only (not removals/edits) - this is a "what's new to check" list, not a
  // full diff.
  diffTitleMetadata({ previous, current }) {
    const additions = [];
    const prevByKey = new Map((previous.playables || []).map(p => [`${p.playable_object_id}::${p.offering}`, p]));

    for(const p of current.playables || []) {
      const key = `${p.playable_object_id}::${p.offering}`;
      const prevP = prevByKey.get(key);
      const context = [p.territory, p.variant].filter(Boolean).join("/") || p.offering;

      if(!prevP) {
        additions.push({
          playable_object_id: p.playable_object_id,
          text: `New offering: ${context} (${p.offering})${p.is_trailer ? " [trailer]" : ""}`
        });
        continue;
      }

      const prevAudio = new Set((prevP.audio || []).map(a => JSON.stringify(a)));
      for(const a of p.audio || []) {
        if(!prevAudio.has(JSON.stringify(a))) {
          additions.push({ playable_object_id: p.playable_object_id, text: `New audio track on ${context}: ${a.label || a.language_code || "?"}` });
        }
      }

      const prevSubs = new Set((prevP.subtitles || []).map(s => JSON.stringify(s)));
      for(const s of p.subtitles || []) {
        if(!prevSubs.has(JSON.stringify(s))) {
          additions.push({ playable_object_id: p.playable_object_id, text: `New subtitle track on ${context}: ${s.label || s.language_code || "?"}` });
        }
      }

      const prevSkus = new Set();
      for(const offer of prevP.offers || []) {
        for(const pkg of offer.packages || []) {
          if(pkg.sku) prevSkus.add(pkg.sku);
        }
      }
      for(const offer of p.offers || []) {
        for(const pkg of offer.packages || []) {
          if(pkg.sku && !prevSkus.has(pkg.sku)) {
            additions.push({ playable_object_id: p.playable_object_id, text: `New SKU on ${context}: ${pkg.sku} (${offer.offer_name})` });
          }
        }
      }
    }

    return additions;
  }

  // Second, independent way to authorize playout URLs: instead of the fabric client's
  // own object-scoped signed token, sign in as a real user (tenant + email + password)
  // and use the resulting fabric_token. One token per run (not per playable - this
  // endpoint authenticates a user session, not a specific object), reused everywhere.
  // Entirely optional: returns null (not an error) when TENANT_ID/EMAIL/PASSWORD aren't set.
  async fetchUserSignedToken({ email, password, tenantId, logger, label }) {
    const authorityUrl = process.env.AUTHORITY_URL || "https://host-76-74-28-232.contentfabric.io";
    const nonce = process.env.NONCE || "test_nonce__";
    const exp = Number(process.env.EXP || 86400); // 24 hours
    const tag = label ? `${label} ` : "";

    if(!tenantId || !email || !password) {
      logger.log(`${tag}TENANT_ID/email/password not set - skipping ${tag}user-signed player commands`);
      return null;
    }

    const url = `${authorityUrl}/as/wlt/ory/sign_in`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ tid: tenantId, email, password, nonce, exp })
    });
    const body = await response.json();

    if(!response.ok) {
      throw Error(`HTTP ${response.status}: ${JSON.stringify(body)}`);
    }
    if(!body.fabric_token) {
      throw Error(`No fabric_token returned: ${JSON.stringify(body)}`);
    }

    const expiresAt = new Date(Date.now() + exp * 1000).toISOString();
    logger.log(`${tag}user-signed token acquired for ${email} (expires ${expiresAt})`);
    return { token: body.fabric_token, expiresAt, email };
  }

  // Live-checks a User CSAT playout URL (its own manifest/license request, not the
  // playable's format check earlier) so a token/entitlement problem specific to the
  // signed-in user shows up on the dashboard even when the backend-signed URL is fine.
  async checkUserSignedUrl(url) {
    try {
      const response = await fetch(url);
      if(response.ok) return null;
      const bodyText = await response.text().catch(() => "");
      // Eluvio fabric error bodies are JSON like {"errors":[{"kind":"permission denied",...}]} -
      // surface just the kind instead of dumping the whole nested error object.
      let message = bodyText.slice(0, 200);
      try {
        const firstError = JSON.parse(bodyText).errors?.[0];
        if(firstError && firstError.kind) message = firstError.kind;
      } catch(_parseErr) {
        // body wasn't JSON - keep the truncated raw text
      }
      return { status: response.status, statusText: response.statusText || null, message: message || null };
    } catch(err) {
      return { status: null, statusText: null, message: err.message };
    }
  }

  // Reads the object's on-chain "_ELV" contract metadata key directly (same call
  // elv-live-js's NftGetPolicyAndPermissions makes via ElvFabric.GetContractMeta), so a
  // title's content-object contract can be checked for a set policy without shelling out
  // to elv-live. Empty/unset metadata comes back as zero-length bytes, not an error.
  async checkObjectPolicy({ client, objectId }) {
    const address = client.utils.HashToAddress(objectId);
    const readMeta = async (key) => {
      const bytes = await withTimeout(
        client.CallContractMethod({
          contractAddress: address,
          abi: BaseContentAbi,
          methodName: "getMeta",
          methodArgs: [key],
          formatArguments: true
        }),
        CHECK_TIMEOUT_MS,
        `getMeta(${key}) for ${objectId}`
      );
      return Ethers.utils.toUtf8String(bytes || "0x").trim();
    };

    try {
      const policyText = await readMeta("_ELV");

      // The value elv-live's ContentSetPolicy writes is JSON like
      // {"auth_policy":{"version":"1.0","body":"name: ...\ndesc: |\n  ...","id":"",...}}.
      // The wrapper's own id/description are usually left blank - the policy's actual
      // name/description live inside "body", which is itself a YAML document.
      let policyVersion = null;
      let policyName = null;
      let policyDescription = null;
      if(policyText) {
        try {
          const authPolicy = JSON.parse(policyText).auth_policy || {};
          policyVersion = authPolicy.version || null;
          let bodyDoc = null;
          if(authPolicy.body) {
            try {
              bodyDoc = yaml.load(authPolicy.body);
            } catch(_yamlErr) {
              // body wasn't valid YAML - fall through to the wrapper's own fields
            }
          }
          policyName = (bodyDoc && bodyDoc.name) || authPolicy.description || authPolicy.id || null;
          const desc = bodyDoc && (bodyDoc.desc || bodyDoc.description);
          policyDescription = desc ? desc.replace(/\s+/g, " ").trim() : null;
        } catch(_parseErr) {
          // not the expected JSON shape - leave name/version unknown, has_policy is still true
        }
      }

      // _NFT_ACCESS is a JSON array of addresses permitted by the policy (same second
      // read NftGetPolicyAndPermissions makes) - a missing/invalid value just means no
      // permissions are recorded, not a failure of the whole check.
      let permissions = [];
      try {
        const permissionsText = await readMeta("_NFT_ACCESS");
        if(permissionsText) permissions = JSON.parse(permissionsText);
      } catch(_permErr) {
        permissions = [];
      }

      return {
        has_policy: policyText.length > 0,
        version: policyVersion,
        name: policyName,
        description: policyDescription,
        permissions,
        error: null,
        checked_at: new Date().toISOString()
      };
    } catch(err) {
      return { has_policy: null, version: null, name: null, description: null, permissions: [], error: err.message, checked_at: new Date().toISOString() };
    }
  }

  // Timestamp of the object's latest commit, for a "Last edited" hint on the dashboard.
  // The "commit" metadata subtree (auto-populated on every commit) has {author, message,
  // timestamp} - confirmed against this SDK's own test suite (test/ElvClient.test.js,
  // "Set Commit Message"), unlike the versions-list endpoint which doesn't document a
  // timestamp field at all. No libraryId needed - same as the title metadata read above.
  // ContentObjectMetadata requires either a versionHash or a libraryId+objectId pair
  // (ValidateParameters in src/Validation.js) - passing a bare objectId throws "Library ID
  // not specified". versionHash sidesteps that entirely, so this takes one instead of
  // objectId (the caller already has it cached from getLatestVersionHash).
  async getLastCommitTime({ client, versionHash, logger }) {
    try {
      const commit = await withTimeout(
        client.ContentObjectMetadata({ versionHash, metadataSubtree: "commit" }),
        CHECK_TIMEOUT_MS,
        `commit metadata for ${versionHash}`
      );
      if(!commit || !commit.timestamp) {
        if(logger) logger.warn(`  No commit.timestamp for ${versionHash}: ${JSON.stringify(commit)}`);
        return null;
      }
      const ms = Date.parse(commit.timestamp);
      if(!Number.isFinite(ms)) {
        if(logger) logger.warn(`  Could not parse commit.timestamp "${commit.timestamp}" for ${versionHash}`);
        return null;
      }
      return new Date(ms).toISOString();
    } catch(err) {
      if(logger) logger.warn(`  Could not read commit metadata for ${versionHash}: ${err.message}`);
      return null;
    }
  }

  // Ports check_key_ids.py: every key_id referenced by offerings/{offering}/playout/
  // streams/*/encryption_schemes/{cenc,aes-128,cbcs}/key_id must appear as a key in BOTH
  // elv/crypt/drm/kids and offerings/{offering}/playout/drm_keys - a DRM key referenced
  // by a stream but missing from either lookup means playback would fail to decrypt.
  // No key_ids referenced at all is treated as a pass, matching the script's exit-0
  // "no key_ids found" case.
  async checkDrmKeyIds({ client, versionHash, offering, logger }) {
    const [playoutStreams, drmKeys, drmKids] = await Promise.all([
      withTimeout(
        client.ContentObjectMetadata({ versionHash, metadataSubtree: `offerings/${offering}/playout/streams` }),
        CHECK_TIMEOUT_MS, `playout streams for ${versionHash}`
      ),
      withTimeout(
        client.ContentObjectMetadata({ versionHash, metadataSubtree: `offerings/${offering}/playout/drm_keys` }),
        CHECK_TIMEOUT_MS, `drm_keys for ${versionHash}`
      ),
      withTimeout(
        client.ContentObjectMetadata({ versionHash, metadataSubtree: "elv/crypt/drm/kids" }),
        CHECK_TIMEOUT_MS, `drm kids for ${versionHash}`
      )
    ]);

    const schemeNames = ["cenc", "aes-128", "cbcs"];
    const keyIds = new Set();
    const streamList = Array.isArray(playoutStreams) ? playoutStreams
      : (playoutStreams && typeof playoutStreams === "object") ? Object.values(playoutStreams) : [];
    for(const stream of streamList) {
      if(!stream || typeof stream !== "object") continue;
      const schemes = stream.encryption_schemes;
      if(!schemes || typeof schemes !== "object") continue;
      for(const schemeName of schemeNames) {
        const scheme = schemes[schemeName];
        if(scheme && scheme.key_id) keyIds.add(scheme.key_id);
      }
    }

    if(keyIds.size === 0) {
      if(logger) logger.warn(`    No DRM key_ids found under offerings/${offering}/playout/streams for ${versionHash} - treating as verified`);
      return true;
    }

    const kidsObj = (drmKids && typeof drmKids === "object") ? drmKids : {};
    const keysObj = (drmKeys && typeof drmKeys === "object") ? drmKeys : {};
    for(const kid of keyIds) {
      if(!(kid in kidsObj) || !(kid in keysObj)) return false;
    }
    return true;
  }

  // cheap pass: splice the shared Backend Fabric Token into every cached title's
  // relative paths/license bases. Only network call beyond local signing is one
  // LatestVersionHash lookup per playable that has a widevine license server (cached
  // per run so it's never repeated for the same playable across formats). policyCache
  // and commitTimeCache are shared across the whole run too - the same playable_object_id
  // commonly recurs across several offerings/territories within a title.
  async renderTitle({ client, titleEntry, hashCache, fabricToken, signedTokens, checkUserSignedUrls, checkPolicy, policyCache, commitTimeCache, logger }) {
    const getLatestVersionHash = async (playableObjectId) => {
      if(!hashCache.has(playableObjectId)) {
        hashCache.set(playableObjectId, await client.LatestVersionHash({ objectId: playableObjectId }));
      }
      return hashCache.get(playableObjectId);
    };

    const getPlayablePolicy = async (playableObjectId) => {
      if(!policyCache.has(playableObjectId)) {
        policyCache.set(playableObjectId, await this.checkObjectPolicy({ client, objectId: playableObjectId }));
      }
      return policyCache.get(playableObjectId);
    };

    const getCommitTime = async (playableObjectId) => {
      if(!commitTimeCache.has(playableObjectId)) {
        const versionHash = await getLatestVersionHash(playableObjectId);
        commitTimeCache.set(playableObjectId, await this.getLastCommitTime({ client, versionHash, logger }));
      }
      return commitTimeCache.get(playableObjectId);
    };

    const { token: authorizationToken, expiresAt } = fabricToken;
    const tokenLabels = Object.keys(signedTokens || {});

    const renderedPlayables = [];
    for(const p of titleEntry.playables) {
      const formats = [];
      for(const f of p.formats) {
        let licenseServerUrl = null;
        let qhash = null;
        if(f.license_server_base) {
          qhash = await getLatestVersionHash(p.playable_object_id);
          licenseServerUrl = renderLicenseServerUrl({ licenseServerBase: f.license_server_base, qhash, authorizationToken });
        }

        // One signed URL per test account (EST/TVOD/...), so each offer can be verified
        // against the specific wallet that's actually entitled to it.
        const signed = {};
        for(const label of tokenLabels) {
          const tokenInfo = signedTokens[label];
          if(!tokenInfo) continue;
          const signedUrl = renderPlayoutUrl({ client, relativePath: f.relative_path, authorizationToken: tokenInfo.token });
          const signedLicenseServerUrl = f.license_server_base
            ? renderLicenseServerUrl({ licenseServerBase: f.license_server_base, qhash, authorizationToken: tokenInfo.token })
            : null;
          signed[label] = {
            url: signedUrl,
            license_server_url: signedLicenseServerUrl,
            check_error: (checkUserSignedUrls && signedUrl) ? await this.checkUserSignedUrl(signedUrl) : null
          };
        }

        formats.push({
          format: f.format,
          url: renderPlayoutUrl({ client, relativePath: f.relative_path, authorizationToken }),
          license_server_url: licenseServerUrl,
          signed
        });
      }

      const playablePolicy = checkPolicy ? await getPlayablePolicy(p.playable_object_id) : null;
      const lastEditedAt = await getCommitTime(p.playable_object_id);

      renderedPlayables.push({ ...p, token_expires_at: expiresAt, formats, policy: playablePolicy, last_edited_at: lastEditedAt });
    }

    const policy = checkPolicy ? await this.checkObjectPolicy({ client, objectId: titleEntry.title_object_id }) : null;

    return { ...titleEntry, playables: renderedPlayables, policy };
  }

  async body() {
    const {
      objectId: siteObjectId, libraryId, titlesSubtree, tokenDurationDays,
      indexObjectId, indexTitlesSubtree, compareSiteObjectId, marketplaceObjectId,
      stateDir, forceRediscover, limit, failLog
    } = this.args;
    const logger = this.logger;
    const client = await this.concerns.Client.get();
    const tokenDurationMs = tokenDurationDays * MS_PER_DAY;

    const manifest = this.loadManifest(stateDir);
    manifest.titles = manifest.titles || {};

    logger.log(`Resolving latest version of site object ${siteObjectId}...`);
    const siteVersionHash = await client.LatestVersionHash({ objectId: siteObjectId });
    const siteLastEditedAt = await this.getLastCommitTime({ client, versionHash: siteVersionHash, logger });

    logger.log(`Retrieving titles list from ${siteObjectId}, subtree ${titlesSubtree}...`);
    const titleLinks = await client.ContentObjectMetadata({
      libraryId,
      objectId: siteObjectId,
      metadataSubtree: titlesSubtree
    });

    if(kindOf(titleLinks) !== "object" || Object.keys(titleLinks).length === 0) {
      throw Error(`No titles found at ${titlesSubtree} on ${siteObjectId}`);
    }

    const titleEntries = this.extractTitleLinks({ titleLinks, logger });

    logger.log(`Found ${titleEntries.length} title(s) referenced by the site`);
    // The site's own titles link freezes whatever version was latest when the SITE object
    // was last published - if a title gets a new version afterward (metadata edit, new
    // offer, policy fix, ...) without the site being re-published, that link keeps
    // pointing at the stale version forever, and --forceRediscover re-discovers the same
    // stale version on every run since it never asks the title object itself what its
    // actual latest version is. Resolve that here instead of trusting the site's link.
    logger.log(`Resolving each title's own latest version (may differ from the site's link if the title changed since the site was last published)...`);
    for(const entry of titleEntries) {
      try {
        entry.versionHash = await client.LatestVersionHash({ objectId: entry.objectId });
      } catch(err) {
        logger.warn(`  Could not resolve latest version for ${entry.objectId}, falling back to the site's own link (${entry.versionHash}): ${err.message}`);
      }
    }
    logger.log("");

    const failures = [];
    const currentlyReferencedIds = new Set();
    let newCount = 0, changedCount = 0, unchangedCount = 0, deferredCount = 0, discoveredThisRun = 0;
    // Objects/metadata newly seen this run vs. the manifest as it was loaded at the top
    // of this run (i.e. since the previous run) - surfaced on the dashboard.
    const addedObjects = [];
    const metadataAdditions = [];

    for(const { index, versionHash, objectId } of titleEntries) {
      currentlyReferencedIds.add(objectId);

      const cached = manifest.titles[objectId];
      const isNew = !cached;
      const isChanged = cached && cached.title_master_hash !== versionHash;

      if(!isNew && !isChanged && !forceRediscover) {
        unchangedCount++;
        cached.index = index;
        cached.still_referenced = true;
        continue;
      }

      if(limit && discoveredThisRun >= limit) {
        deferredCount++;
        logger.log(`--limit ${limit} reached, deferring remaining new/changed titles to a later run`);
        continue;
      }
      discoveredThisRun++;
      if(isNew) newCount++; else changedCount++;

      try {
        const discovered = await this.discoverTitle({ client, index, versionHash, failures });
        discovered.still_referenced = true;

        if(isNew) {
          addedObjects.push({ title_object_id: objectId, title_name: discovered.title_name, title_type: discovered.title_type });
        } else {
          const additions = this.diffTitleMetadata({ previous: cached, current: discovered });
          if(additions.length > 0) {
            metadataAdditions.push({
              title_object_id: objectId,
              title_name: discovered.title_name,
              title_master_hash: discovered.title_master_hash,
              additions
            });
          }
        }

        manifest.titles[objectId] = discovered;
      } catch(err) {
        logger.warn(`  Could not discover title ${objectId}: ${err.message}`);
        failures.push({ index, object_id: objectId, version_hash: versionHash, error: err.message });
      }
    }

    // titles no longer referenced by the site are removed outright (e.g. an old object
    // ID left behind after a title was re-ingested under a new one) - not flagged/kept.
    let removedCount = 0;
    for(const objectId of Object.keys(manifest.titles)) {
      if(!currentlyReferencedIds.has(objectId)) {
        delete manifest.titles[objectId];
        removedCount++;
      }
    }
    if(removedCount > 0) logger.log(`Removed ${removedCount} title(s) no longer referenced by the site`);

    manifest.site_object_id = siteObjectId;
    manifest.last_run_at = new Date().toISOString();
    this.saveManifest(stateDir, manifest);

    // render pass: fresh tokens/URLs for every known title, not just ones touched this run
    logger.log("\nRendering fresh playout URLs for all known titles...");

    // Backend Fabric Token: a single unscoped token (not tied to any one object) shared
    // across every playout URL this run - required, so a failure here aborts the run.
    const fabricTokenValue = await client.CreateFabricToken({ duration: tokenDurationMs });
    const fabricToken = { token: fabricTokenValue, expiresAt: new Date(Date.now() + tokenDurationMs).toISOString() };
    logger.log(`Backend Fabric Token acquired (expires ${fabricToken.expiresAt})`);

    // Two independent test accounts, one per offer type - each SKU is only entitled to
    // the wallet behind the matching account, so testing EST/TVOD playback separately
    // means signing in as each one rather than sharing a single generic CSAT user.
    const signedTokens = {};
    const walletAddresses = {};
    for(const label of ["EST", "TVOD"]) {
      try {
        const tokenInfo = await this.fetchUserSignedToken({
          email: process.env[`${label}_EMAIL`],
          password: process.env[`${label}_PASSWORD`],
          tenantId: ENTITLEMENT_TENANT_ID,
          logger, label
        });
        signedTokens[label] = tokenInfo;
        walletAddresses[label] = tokenInfo ? client.utils.DecodeSignedToken(tokenInfo.token).payload.adr : null;
      } catch(err) {
        logger.warn(`Could not acquire ${label} user-signed token, skipping ${label} user-signed player commands: ${err.message}`);
        signedTokens[label] = null;
        walletAddresses[label] = null;
      }
    }

    const hashCache = new Map();
    const policyCache = new Map();
    const commitTimeCache = new Map();
    const results = [];
    const allTitles = Object.values(manifest.titles);
    logger.log(`\nChecking policy + last-edited for every title and playable (${allTitles.length} titles) - this does one or more network calls per unique playable, so it can take a while on a large site...`);
    let renderedCount = 0;
    for(const titleEntry of allTitles) {
      results.push(await this.renderTitle({
        client, titleEntry, hashCache, fabricToken,
        signedTokens,
        checkUserSignedUrls: true,
        checkPolicy: true,
        policyCache, commitTimeCache, logger
      }));
      renderedCount++;
      if(renderedCount % 10 === 0 || renderedCount === allTitles.length) {
        logger.log(`  ...${renderedCount}/${allTitles.length} titles rendered (${policyCache.size} unique playables policy-checked, ${commitTimeCache.size} commit-time-checked)`);
      }
    }

    logger.log("");
    logger.log("=== SUMMARY ===");
    const summaryRows = [];
    for(const title of results) {
      for(const p of title.playables) {
        summaryRows.push({
          title: title.title_name,
          referenced: title.still_referenced,
          territory: p.territory,
          variant: p.variant,
          trailer: p.is_trailer,
          offering: p.offering,
          formats: p.formats.map(f => f.format).join(",")
        });
      }
    }
    logger.logTable({ list: summaryRows });

    logger.log(`\nNew: ${newCount}, changed: ${changedCount}, unchanged (skipped discovery): ${unchangedCount}, deferred by --limit: ${deferredCount}`);

    if(failures.length > 0) {
      logger.warn(`\n${failures.length} failure(s)`);
      logger.logTable({ list: failures });
      if(failLog) {
        const failLogPath = path.resolve(failLog);
        fs.writeFileSync(failLogPath, JSON.stringify(failures, null, 2));
        logger.warn(`Failure log written to ${failLogPath}`);
      }
    }

    let indexComparison;
    try {
      const siteTitleNames = results.map(t => [t.title_object_id, t.title_name]);
      indexComparison = await this.compareAgainstIndex({
        client, indexObjectId, indexTitlesSubtree, siteTitleEntries: titleEntries, siteTitleNames, logger
      });
    } catch(err) {
      logger.warn(`Could not compare against index object ${indexObjectId}: ${err.message}`);
      indexComparison = { index_object_id: indexObjectId, index_titles_subtree: indexTitlesSubtree, error: err.message, compared_at: new Date().toISOString() };
    }

    let compareSiteSummary;
    try {
      compareSiteSummary = await this.trackCompareSite({
        client, compareSiteObjectId, titlesSubtree, stateDir, logger
      });
    } catch(err) {
      logger.warn(`Could not track comparison site ${compareSiteObjectId}: ${err.message}`);
      compareSiteSummary = { compare_site_object_id: compareSiteObjectId, error: err.message, tracked_at: new Date().toISOString() };
    }

    // Marketplace items/NFT templates: cross-referenced against every policy's
    // permission addresses (which permission actually maps to which SKU/template) and
    // against every offer package's SKU (which template mints that package's entitlement).
    let marketplaceItems = [];
    try {
      marketplaceItems = await this.fetchMarketplaceItems({ client, marketplaceObjectId, logger });
    } catch(err) {
      logger.warn(`Could not fetch marketplace items from ${marketplaceObjectId}: ${err.message}`);
    }

    const templateAddressMap = new Map();
    const skuToTemplate = new Map();
    for(const item of marketplaceItems) {
      if(item.nft_address) {
        try {
          templateAddressMap.set(client.utils.FormatAddress(item.nft_address).toLowerCase(), item);
        } catch(_err) {
          // not a well-formed address on this item - just skip indexing it
        }
      }
      if(item.sku) skuToTemplate.set(item.sku, item);
    }

    // The address behind a SKU, resolved via the same skuToTemplate lookup used below to
    // annotate packages - kept separate so ownAddresses can be computed before that
    // annotation pass runs.
    const skuAddress = (sku) => {
      const template = sku && skuToTemplate.get(sku);
      if(!template || !template.nft_address) return null;
      try {
        return client.utils.FormatAddress(template.nft_address).toLowerCase();
      } catch(_err) {
        return null;
      }
    };

    for(const title of results) {
      // Every address actually linked to one of this title's own playable offer SKUs
      // (across all its playables) - a title-level policy permission only counts as
      // matched if it's one of these, not just any address found somewhere in the
      // marketplace.
      const titleOwnAddresses = new Set();
      for(const p of title.playables) {
        if(p.offering === "sbs") continue;
        for(const offer of (p.offers || [])) {
          for(const pkg of (offer.packages || [])) {
            const addr = skuAddress(pkg.sku);
            if(addr) titleOwnAddresses.add(addr);
          }
        }
      }

      if(title.policy && title.policy.permissions) {
        title.policy.permissions_resolved = this.resolvePermissionAddresses({ client, permissions: title.policy.permissions, templateAddressMap, ownAddresses: titleOwnAddresses });
      }
      for(const p of title.playables) {
        if(p.policy && p.policy.permissions) {
          // A playable-level policy permission is scoped even tighter - only this specific
          // playable's own offer SKUs count, not its sibling playables' (e.g. the US
          // uhd-2d-sdr playable's policy shouldn't be "matched" by the US uhd-3d-hdr
          // playable's SKU just because they're the same title).
          const playableOwnAddresses = new Set();
          for(const offer of (p.offers || [])) {
            for(const pkg of (offer.packages || [])) {
              const addr = skuAddress(pkg.sku);
              if(addr) playableOwnAddresses.add(addr);
            }
          }
          p.policy.permissions_resolved = this.resolvePermissionAddresses({ client, permissions: p.policy.permissions, templateAddressMap, ownAddresses: playableOwnAddresses });
        }
        for(const offer of (p.offers || [])) {
          for(const pkg of (offer.packages || [])) {
            if(pkg.sku && skuToTemplate.has(pkg.sku)) {
              const template = skuToTemplate.get(pkg.sku);
              pkg.nft_template_name = template.nft_template_name || null;
              pkg.nft_template_address = template.nft_address || null;
              pkg.nft_template_version_hash = template.nft_template_version_hash || null;
            }
          }
        }
      }
    }

    const currentTrailers = this.extractTrailers(results);
    const previousTrailers = this.loadTrailerSnapshot(stateDir);
    const trailerDiff = this.diffTrailers({ previousTrailers, currentTrailers });
    this.saveTrailerSnapshot(stateDir, currentTrailers);

    if(trailerDiff.added.length > 0 || trailerDiff.removed.length > 0) {
      logger.log(`\nTrailers: ${currentTrailers.length} total, ${trailerDiff.added.length} added, ${trailerDiff.removed.length} removed since last run`);
      if(trailerDiff.added.length > 0) {
        logger.log("Added:");
        logger.logTable({ list: trailerDiff.added.map(t => ({ title: t.title_name, territory: t.territory, variant: t.variant, offering: t.offering })) });
      }
      if(trailerDiff.removed.length > 0) {
        logger.log("Removed:");
        logger.logTable({ list: trailerDiff.removed.map(t => ({ title: t.title_name, territory: t.territory, variant: t.variant, offering: t.offering })) });
      }
    } else {
      logger.log(`\nTrailers: ${currentTrailers.length} total, no changes since last run`);
    }

    if(addedObjects.length > 0) {
      logger.log(`\n${addedObjects.length} new object(s) since last run:`);
      logger.logTable({ list: addedObjects.map(o => ({ title: o.title_name, object_id: o.title_object_id, type: o.title_type })) });
    }
    if(metadataAdditions.length > 0) {
      const totalAdditions = metadataAdditions.reduce((sum, m) => sum + m.additions.length, 0);
      logger.log(`\n${totalAdditions} metadata addition(s) across ${metadataAdditions.length} object(s) since last run:`);
      logger.logTable({ list: metadataAdditions.flatMap(m => m.additions.map(a => ({ title: m.title_name, master_hash: m.title_master_hash, playable: a.playable_object_id, addition: a.text }))) });
    }

    const current = {
      site_object_id: siteObjectId, token_duration_days: tokenDurationDays,
      site_version_hash: siteVersionHash, site_last_edited_at: siteLastEditedAt,
      generated_at: new Date().toISOString(), site_titles_total: titleEntries.length,
      titles: results, failures, index_comparison: indexComparison, compare_site_summary: compareSiteSummary,
      marketplace_items: marketplaceItems,
      trailer_changes: { total: currentTrailers.length, added: trailerDiff.added, removed: trailerDiff.removed },
      object_changes: { added: addedObjects, metadata_additions: metadataAdditions },
      fabric_token: fabricToken.token,
      fabric_token_expires_at: fabricToken.expiresAt,
      signed_tokens: {
        EST: signedTokens.EST ? {
          available: true, token: signedTokens.EST.token, expires_at: signedTokens.EST.expiresAt,
          email: signedTokens.EST.email, wallet_address: walletAddresses.EST
        } : { available: false, token: null, expires_at: null, email: null, wallet_address: null },
        TVOD: signedTokens.TVOD ? {
          available: true, token: signedTokens.TVOD.token, expires_at: signedTokens.TVOD.expiresAt,
          email: signedTokens.TVOD.email, wallet_address: walletAddresses.TVOD
        } : { available: false, token: null, expires_at: null, email: null, wallet_address: null }
      }
    };
    this.saveCurrent(stateDir, current);

    this.appendRunLog(stateDir, {
      timestamp: current.generated_at,
      site_object_id: siteObjectId,
      titles_total: results.length,
      titles_new: newCount,
      titles_changed: changedCount,
      titles_unchanged: unchangedCount,
      titles_deferred: deferredCount,
      playables_total: results.reduce((n, t) => n + t.playables.length, 0),
      trailers_total: currentTrailers.length,
      trailers_added: trailerDiff.added,
      trailers_removed: trailerDiff.removed,
      failures_count: failures.length,
      failures
    });
    logger.log(`\nState written to ${stateDir} (manifest.ignore.json, current.ignore.json, trailers.ignore.json, runs.ignore.jsonl appended)`);

    if(this.args.outfile) {
      this.concerns.ArgOutfile.writeJson({ obj: current });
    }

    logger.data("titles", results);
    logger.data("failures", failures);

    return { titles: results, failures };
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(VUSiteTitlePlayoutURLs);
} else {
  module.exports = VUSiteTitlePlayoutURLs;
}
