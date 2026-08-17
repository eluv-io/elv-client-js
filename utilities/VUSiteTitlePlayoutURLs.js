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

const { NewOpt, StdOpt } = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const ArgOutfile = require("./lib/concerns/ArgOutfile");
const Version = require("./lib/concerns/Version");

const fs = require("fs");
const path = require("path");

const RE_LINK_HASH = /^\/qfab\/(hq__[a-zA-Z0-9]+)\//;
const RE_TERRITORY_VARIANT = /distributions\.([^.]+)\.variants\.([^.]+)/;

// the only two playout formats requested
const PLAYOUT_FORMATS = [
  { key: "dash-clear", protocol: "dash", drms: [] },
  { key: "dash-widevine", protocol: "dash", drms: ["widevine"] }
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
          formats
        });
      } catch(err) {
        logger.warn(`    FAILED: ${playableObjectId} offering="${offering}": ${err.message}`);
        failures.push({ index, object_id: objectId, playable_object_id: playableObjectId, offering, error: err.message });
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

  // Second, independent way to authorize playout URLs: instead of the fabric client's
  // own object-scoped signed token, sign in as a real user (tenant + email + password)
  // and use the resulting fabric_token. One token per run (not per playable - this
  // endpoint authenticates a user session, not a specific object), reused everywhere.
  // Entirely optional: returns null (not an error) when TENANT_ID/EMAIL/PASSWORD aren't set.
  async fetchUserSignedToken({ logger }) {
    const authorityUrl = process.env.AUTHORITY_URL || "https://host-76-74-28-232.contentfabric.io";
    const tenantId = process.env.TENANT_ID || "itenpQ9zSeeFbz8hTHF1pKeD3P3wLpB";
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const nonce = process.env.NONCE || "test_nonce__";
    const exp = Number(process.env.EXP || 86400); // 24 hours

    if(!tenantId || !email || !password) {
      logger.log("TENANT_ID/EMAIL/PASSWORD not set - skipping user-signed player commands");
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
    logger.log(`User-signed token acquired (expires ${expiresAt})`);
    return { token: body.fabric_token, expiresAt };
  }

  // cheap pass: splice the shared Backend Fabric Token into every cached title's
  // relative paths/license bases. Only network call beyond local signing is one
  // LatestVersionHash lookup per playable that has a widevine license server (cached
  // per run so it's never repeated for the same playable across formats).
  async renderTitle({ client, titleEntry, hashCache, fabricToken, userSignedToken }) {
    const getLatestVersionHash = async (playableObjectId) => {
      if(!hashCache.has(playableObjectId)) {
        hashCache.set(playableObjectId, await client.LatestVersionHash({ objectId: playableObjectId }));
      }
      return hashCache.get(playableObjectId);
    };

    const { token: authorizationToken, expiresAt } = fabricToken;

    const renderedPlayables = [];
    for(const p of titleEntry.playables) {
      const formats = [];
      for(const f of p.formats) {
        let licenseServerUrl = null;
        let userSignedLicenseServerUrl = null;
        if(f.license_server_base) {
          const qhash = await getLatestVersionHash(p.playable_object_id);
          licenseServerUrl = renderLicenseServerUrl({ licenseServerBase: f.license_server_base, qhash, authorizationToken });
          if(userSignedToken) {
            userSignedLicenseServerUrl = renderLicenseServerUrl({ licenseServerBase: f.license_server_base, qhash, authorizationToken: userSignedToken });
          }
        }
        formats.push({
          format: f.format,
          url: renderPlayoutUrl({ client, relativePath: f.relative_path, authorizationToken }),
          license_server_url: licenseServerUrl,
          user_signed_url: userSignedToken ? renderPlayoutUrl({ client, relativePath: f.relative_path, authorizationToken: userSignedToken }) : null,
          user_signed_license_server_url: userSignedLicenseServerUrl
        });
      }

      renderedPlayables.push({ ...p, token_expires_at: expiresAt, formats });
    }

    return { ...titleEntry, playables: renderedPlayables };
  }

  async body() {
    const {
      objectId: siteObjectId, libraryId, titlesSubtree, tokenDurationDays,
      indexObjectId, indexTitlesSubtree, stateDir, forceRediscover, limit, failLog
    } = this.args;
    const logger = this.logger;
    const client = await this.concerns.Client.get();
    const tokenDurationMs = tokenDurationDays * MS_PER_DAY;

    const manifest = this.loadManifest(stateDir);
    manifest.titles = manifest.titles || {};

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

    logger.log(`Found ${titleEntries.length} title(s) referenced by the site\n`);

    const failures = [];
    const currentlyReferencedIds = new Set();
    let newCount = 0, changedCount = 0, unchangedCount = 0, deferredCount = 0, discoveredThisRun = 0;

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

    let userSignedToken = null;
    try {
      userSignedToken = await this.fetchUserSignedToken({ logger });
    } catch(err) {
      logger.warn(`Could not acquire user-signed token, skipping user-signed player commands: ${err.message}`);
      userSignedToken = null;
    }

    const hashCache = new Map();
    const results = [];
    for(const titleEntry of Object.values(manifest.titles)) {
      results.push(await this.renderTitle({
        client, titleEntry, hashCache, fabricToken,
        userSignedToken: userSignedToken && userSignedToken.token
      }));
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

    const current = {
      site_object_id: siteObjectId, token_duration_days: tokenDurationDays,
      generated_at: new Date().toISOString(), site_titles_total: titleEntries.length,
      titles: results, failures, index_comparison: indexComparison,
      trailer_changes: { total: currentTrailers.length, added: trailerDiff.added, removed: trailerDiff.removed },
      user_signed_token_available: !!userSignedToken,
      user_signed_token_expires_at: userSignedToken ? userSignedToken.expiresAt : null
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
