// Renders the persisted VUSiteTitlePlayoutURLs state (current.ignore.json + runs.ignore.jsonl)
// as a single self-contained HTML dashboard. No fabric/network access needed - reads local
// state only, so this can run without PRIVATE_KEY/FABRIC_CONFIG_URL.
//
// Usage: node utilities/VUSiteTitleDashboard.js [--stateDir <dir>] [--outfile <path>]

const fs = require("fs");
const path = require("path");

function getArg(name, def) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : def;
}

const stateDir = path.resolve(getArg("stateDir", path.join(__dirname, "data", "vu_site_playout_state")));
const outfile = path.resolve(getArg("outfile", path.join(stateDir, "dashboard.html")));

const tenantId = process.env.TENANT_ID || "itenpQ9zSeeFbz8hTHF1pKeD3P3wLpB";
const marketplace = process.env.MARKETPLACE || "iq__3Jh7HXVNQujAWfBbJBCu939rLxXc";

const currentPath = path.join(stateDir, "current.ignore.json");
if(!fs.existsSync(currentPath)) {
  console.error(`No state found at ${currentPath} - run VUSiteTitlePlayoutURLs.js at least once first.`);
  process.exit(1);
}

const current = JSON.parse(fs.readFileSync(currentPath, "utf8"));
// Mints against the wallet actually decoded from the matching offer's own CSAT token
// (EST SKUs mint to the EST wallet, TVOD SKUs to the TVOD wallet) - each offer's account
// is only ever entitled to its own SKUs, so minting to the wrong wallet would defeat the
// point of testing them separately.
const mintEntitlementCommand = (sku, walletAddress) => `./elv-live tenant_mint ${tenantId} ${marketplace} ${sku} ${walletAddress || "<no_wallet_address>"}`;

// ---- flatten titles/playables into rows, cross-referencing failures ----

const failureKey = (objectId, playableObjectId, offering, format) =>
  `${playableObjectId}::${offering}::${format || ""}`;

const failuresByKey = new Map();
for(const f of current.failures || []) {
  const key = failureKey(f.object_id, f.playable_object_id, f.offering, f.format);
  if(!failuresByKey.has(key)) failuresByKey.set(key, []);
  failuresByKey.get(key).push(f.error);
}

// Same territory.variants.variant path shape the source script parses (VUSiteTitlePlayoutURLs.js's RE_TERRITORY_VARIANT).
const RE_TERRITORY_VARIANT = /distributions\.([^.]+)\.variants\.([^.]+)/;

const rows = [];
for(const title of current.titles || []) {
  // Trailers are no longer their own row - each one is matched to its main asset(s) by
  // territory/variant and shown as a reference right under each one instead. The same
  // trailer object commonly serves multiple territory/variant combos (e.g. the same
  // trailer used for both CA and US) - variant_paths carries every path this playable
  // was found at, so all of those contexts get the match, not just the first one seen.
  const trailerByContext = new Map();
  for(const tp of title.playables || []) {
    if(tp.is_trailer && tp.offering !== "sbs") {
      const paths = (tp.variant_paths && tp.variant_paths.length) ? tp.variant_paths : [`distributions.${tp.territory}.variants.${tp.variant}`];
      const contexts = new Set();
      for(const p of paths) {
        const match = RE_TERRITORY_VARIANT.exec(p);
        if(match) contexts.add(`${match[1]}::${match[2]}`);
      }
      if(contexts.size === 0) contexts.add(`${tp.territory}::${tp.variant}`);
      for(const key of contexts) {
        if(!trailerByContext.has(key)) trailerByContext.set(key, tp.playable_object_id);
      }
    }
  }

  for(const p of title.playables || []) {
    // sbs (side-by-side 3D) offerings are excluded entirely - VUSiteTitlePlayoutURLs.js
    // no longer discovers them, but this catches any still lingering in cached state
    // from before that filter existed, until the next forced rediscovery clears them.
    if(p.offering === "sbs") continue;
    if(p.is_trailer) continue;
    const clear = (p.formats || []).find(f => f.format === "dash-clear");
    const widevine = (p.formats || []).find(f => f.format === "dash-widevine");
    const clearFail = failuresByKey.get(failureKey(title.title_object_id, p.playable_object_id, p.offering, "dash-clear")) || [];
    const widevineFail = failuresByKey.get(failureKey(title.title_object_id, p.playable_object_id, p.offering, "dash-widevine")) || [];

    // One signed-URL set per test account (EST/TVOD) - each SKU is only entitled to the
    // wallet behind the matching account, so playback needs verifying separately per
    // offer type rather than through one shared generic CSAT login.
    const signedInfo = (label) => ({
      clear_url: (clear && clear.signed && clear.signed[label]) ? clear.signed[label].url : null,
      clear_error: (clear && clear.signed && clear.signed[label]) ? clear.signed[label].check_error : null,
      widevine_url: (widevine && widevine.signed && widevine.signed[label]) ? widevine.signed[label].url : null,
      widevine_error: (widevine && widevine.signed && widevine.signed[label]) ? widevine.signed[label].check_error : null,
      widevine_license_server_url: (widevine && widevine.signed && widevine.signed[label]) ? widevine.signed[label].license_server_url : null
    });

    rows.push({
      title_name: title.title_name,
      title_type: title.title_type,
      title_master_hash: title.title_master_hash,
      title_object_id: title.title_object_id,
      still_referenced: title.still_referenced !== false,
      offers: p.offers || [],
      territory: p.territory,
      variant: p.variant,
      offering: p.offering,
      playable_object_id: p.playable_object_id,
      trailer_playable_object_id: trailerByContext.get(`${p.territory}::${p.variant}`) || null,
      audio: p.audio || [],
      subtitles: p.subtitles || [],
      playable_policy: p.policy || null,
      last_edited_at: p.last_edited_at || null,
      dash_clear_url: clear ? clear.url : null,
      dash_clear_ok: !!clear && !clearFail.length,
      dash_clear_error: clearFail.join("; ") || null,
      dash_widevine_url: widevine ? widevine.url : null,
      dash_widevine_ok: !!widevine && !widevineFail.length,
      dash_widevine_error: widevineFail.join("; ") || null,
      license_server_url: widevine ? widevine.license_server_url : null,
      signed: { EST: signedInfo("EST"), TVOD: signedInfo("TVOD") }
    });
  }
}

// Human-readable names for known site objects, shown alongside their raw object ID
// wherever a site is referenced (header, Site Comparison block).
const SITE_LABELS = {
  "iq__395wfhZKD9gh8eZ9XDETcZQx6M5r": "VU Master Site (PROD)",
  "iq__3S59EtLbz44nSHfse1U5yLxVKVpy": "VU Affiliate Master Site - Meta (PROD)"
};
const siteLabel = (objectId) => SITE_LABELS[objectId] || null;

const stats = {
  generated_at: current.generated_at,
  site_object_id: current.site_object_id,
  site_version_hash: current.site_version_hash || null,
  site_last_edited_at: current.site_last_edited_at || null,
  token_duration_days: current.token_duration_days,
  fabric_token: current.fabric_token || null,
  signed_tokens: current.signed_tokens || { EST: null, TVOD: null },
  site_titles_total: current.site_titles_total != null
    ? current.site_titles_total
    : current.titles.filter(t => t.still_referenced !== false).length
};

const mainSiteSummary = {
  siteObjectId: stats.site_object_id,
  siteVersionHash: stats.site_version_hash,
  siteLastEditedAt: stats.site_last_edited_at,
  totalObjects: stats.site_titles_total,
  newObjects: (current.object_changes && current.object_changes.added) || [],
  updatedObjects: ((current.object_changes && current.object_changes.metadata_additions) || [])
    .map(c => ({ title_object_id: c.title_object_id, title_name: c.title_name })),
  titles: (current.titles || [])
    .filter(t => t.still_referenced !== false)
    .map(t => ({ title_object_id: t.title_object_id, title_name: t.title_name, title_master_hash: t.title_master_hash })),
  error: null
};

const compareSite = current.compare_site_summary || null;
const compareSiteSummary = {
  siteObjectId: compareSite ? compareSite.compare_site_object_id : null,
  siteVersionHash: compareSite ? compareSite.compare_site_version_hash : null,
  siteLastEditedAt: compareSite ? compareSite.compare_site_last_edited_at : null,
  totalObjects: compareSite ? compareSite.compare_site_total : 0,
  newObjects: (compareSite && compareSite.added) || [],
  updatedObjects: (compareSite && compareSite.updated) || [],
  titles: (compareSite && compareSite.titles) || [],
  error: compareSite ? compareSite.error : "No comparison site recorded yet — run VUSiteTitlePlayoutURLs.js to populate it."
};

// ---- render ----

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// user_signed_check_error is { status, statusText, message } | null. httpLabel is just
// "HTTP 403" for a compact badge; fullText adds the message for titles/tooltips.
const checkErrorParts = (err) => {
  if(!err) return null;
  const httpLabel = err.status ? `HTTP ${err.status}${err.statusText ? " " + err.statusText : ""}` : null;
  const fullText = [httpLabel, err.message].filter(Boolean).join(" — ");
  return { httpLabel, message: err.message || null, fullText: fullText || "Request failed" };
};

// DOM-id-safe token for wiring a dot/refresh-button/error-box together for a given
// row+format so the client-side recheck script can find and update all three.
const escId = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, "_");

// This playable's own "_ELV" policy check (VUSiteTitlePlayoutURLs.js's checkObjectPolicy),
// shown right under Last edited in the title column so policy gaps are visible per-row,
// not just in the top-of-page Object Policy summary.
// Bulleted, individually-copyable list of permission addresses (the policy's
// "_NFT_ACCESS" contract meta) - shared between the per-row policy line and the
// top-of-page Object Policy summary.
// permissions_resolved (VUSiteTitlePlayoutURLs.js's resolvePermissionAddresses) maps
// each permission address to the marketplace NFT template/SKU that address actually
// belongs to, when it matches one - shown as a chip so a permission isn't just an
// opaque address.
const renderPermissionsList = (policy) => {
  const permissions = policy && policy.permissions;
  if(!permissions || permissions.length === 0) return "";
  const resolved = policy.permissions_resolved;
  return `<div class="policy-permissions-label">Permissions</div>
  <ul class="policy-permissions">${permissions.map((addr, i) => {
    const r = resolved && resolved[i];
    let matchMark = "";
    if(r) {
      const title = r.matched
        ? `${r.nft_template_name || "Matched"}${r.sku ? " (" + r.sku + ")" : ""}`
        : "No matching template";
      matchMark = `<span class="permission-match ${r.matched ? "permission-match--yes" : "permission-match--no"}" title="${esc(title)}"></span>`;
    }
    return `<li class="policy-permission-item">
      <span class="mono truncate" title="${esc(addr)}">${esc(addr)}</span>
      <button class="icon-btn copy-btn" data-copy="${esc(addr)}" title="Copy permission address" aria-label="Copy permission address">&#10697;</button>
      ${matchMark}
    </li>`;
  }).join("")}</ul>`;
};

// Used both to render the per-row Policy line and to tag the row's data-policy attribute
// for the Policy status filter.
const policyFilterState = (policy) => {
  if(!policy || policy.has_policy == null) return "unchecked";
  return policy.has_policy ? "set" : "missing";
};

const renderPlayablePolicy = (policy) => {
  const label = "<span class=\"id-label\">Policy</span>";
  const state = policyFilterState(policy);
  if(state === "unchecked") {
    const title = policy && policy.error ? ` title="${esc(policy.error)}"` : "";
    return `<div class="id-row">${label}<span class="chip chip-warn"${title}>Unchecked</span></div>`;
  }
  if(state === "missing") {
    return `<div class="id-row">${label}<span class="chip chip-critical">No policy</span></div>`;
  }
  const nameTitle = policy.description ? ` title="${esc(policy.description)}"` : "";
  return `<div class="id-row">${label}<span class="chip chip-good"${nameTitle}>${esc(policy.name || "Policy set")}</span></div>${renderPermissionsList(policy)}`;
};

const fmtDate = (iso) => {
  if(!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

// group rows by title, preserving first-seen order
const titleOrder = [];
const rowsByTitle = new Map();
for(const r of rows) {
  if(!rowsByTitle.has(r.title_object_id)) {
    rowsByTitle.set(r.title_object_id, []);
    titleOrder.push(r.title_object_id);
  }
  rowsByTitle.get(r.title_object_id).push(r);
}

// start-player.sh copy-paste commands for headset testing: dash-clear takes one URL
// arg, dash-widevine takes the playout URL plus the license server URL. Referenced by
// its actual location (~/Desktop) so the command works regardless of the current
// working directory when pasted into a terminal.
const shQuote = (s) => `"${String(s).replace(/"/g, '\\"')}"`;
const startPlayerCommand = (urls) => `~/Desktop/start-player.sh ${urls.map(shQuote).join(" ")}`;

// Single-quoting (vs. shQuote's double-quoting) for arbitrary tokens like signed URLs -
// safe against every shell metacharacter, not just double-quote-sensitive ones ($, `).
const shQuoteSingle = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;
// -L follows redirects the same way fetch() does by default (the fabric responds 307 to
// route to the right node); -i includes the final response's status/headers above the
// body, so a 403's error JSON is visible in one command - useful for confirming a mint
// outside the browser's CORS jail.
const curlCheckCommand = (url) => `curl -sS -L -i ${shQuoteSingle(url)}`;

// checkError: undefined = no play check performed (no dot shown), null = checked and
// played fine (green dot), {status,statusText,message} = checked and failed (red dot).
// checkMeta: {checkId, url} when this format has a live URL that can be re-checked from
// the browser (adds a refresh/"reload" button, wired to #dot-<checkId>/#err-<checkId> via
// JS). curlUrl: when given, adds a button that copies a curl command for that same URL -
// a way to verify playback outside the browser's CORS jail, alongside the live recheck.
const playerCell = (label, cmd, checkError, checkMeta, curlUrl) => {
  const checked = checkError !== undefined;
  const parts = checkErrorParts(checkError);
  const dotId = checkMeta ? ` id="dot-${esc(checkMeta.checkId)}"` : "";
  const dot = checked ? `<span class="dot ${parts ? "dot-critical" : "dot-good"}"${dotId} title="${esc(parts ? parts.fullText : "Plays OK")}"></span>` : "";
  const refreshBtn = checkMeta
    ? `<button type="button" class="icon-btn recheck-btn" data-check-url="${esc(checkMeta.url)}" data-check-target="${esc(checkMeta.checkId)}" data-check-label="${esc(label)}" title="Re-check ${esc(label)} playback" aria-label="Re-check ${esc(label)} playback">&#8635;</button>`
    : "";
  const curlBtn = curlUrl
    ? `<button type="button" class="qc-mini-btn copy-btn" data-copy="${esc(curlCheckCommand(curlUrl))}" title="Copy curl command for ${esc(label)}" aria-label="Copy curl command for ${esc(label)}">curl</button>`
    : "";
  if(!cmd) {
    return `<div class="player-cell-item player-missing"><span class="fmt-label">${label}</span>${dot}${refreshBtn}<span class="text-dim">&mdash;</span>${curlBtn}</div>`;
  }
  return `<div class="player-cell-item">
    <span class="fmt-label">${label}</span>${dot}${refreshBtn}
    <button class="icon-btn copy-btn" data-copy="${esc(cmd)}" title="Copy ${label} start-player.sh command" aria-label="Copy ${label} start-player.sh command">&#10697;</button>
    ${curlBtn}
  </div>`;
};

// Always rendered (hidden when there's no error) when checkMeta exists, so the
// recheck button's JS handler can find it by id and fill it in after a live re-check.
const renderSignedError = (label, err, checkMeta) => {
  if(!checkMeta) return "";
  const parts = checkErrorParts(err);
  const hiddenClass = parts ? "" : " signed-error-hidden";
  return `<div class="signed-error${hiddenClass}" id="err-${esc(checkMeta.checkId)}">
    <span class="fmt-label">${esc(label)}</span>
    <span class="chip chip-critical signed-error-http">${parts && parts.httpLabel ? esc(parts.httpLabel) : ""}</span>
    <span class="signed-error-msg">${parts && parts.message ? esc(parts.message) : ""}</span>
    <button type="button" class="icon-btn copy-btn signed-error-curl-btn" data-copy="${esc(curlCheckCommand(checkMeta.url))}" title="Copy curl command to test this URL" aria-label="Copy curl command to test this URL">&#10697;</button>
  </div>`;
};

// One User CSAT signed-group per test account (EST/TVOD) - each carries its own
// Clear/Widevine playout URLs (signed with that account's own token), so both offers'
// entitlements can be checked side by side in the same row without the URLs mixing.
const renderSignedGroup = (label, signedData, checkIdBase) => {
  if(!signedData || (!signedData.clear_url && !signedData.widevine_url)) return "";

  const clearCmd = signedData.clear_url ? startPlayerCommand([signedData.clear_url]) : null;
  const widevineCmd = (signedData.widevine_url && signedData.widevine_license_server_url)
    ? startPlayerCommand([signedData.widevine_url, signedData.widevine_license_server_url]) : null;

  const labelSlug = label.toLowerCase();
  const clearCheckMeta = signedData.clear_url ? { checkId: `${checkIdBase}-${labelSlug}-clear`, url: signedData.clear_url } : null;
  const widevineCheckMeta = signedData.widevine_url ? { checkId: `${checkIdBase}-${labelSlug}-widevine`, url: signedData.widevine_url } : null;

  return `<div class="signed-group">
    <div class="signed-group-label">User CSAT (${esc(label)})</div>
    <div class="player-cell">${playerCell("Clear", clearCmd, signedData.clear_url ? signedData.clear_error : undefined, clearCheckMeta, signedData.clear_url)}${playerCell("Widevine", widevineCmd, signedData.widevine_url ? signedData.widevine_error : undefined, widevineCheckMeta, signedData.widevine_url)}</div>
    ${renderSignedError("Clear", signedData.clear_error, clearCheckMeta)}
    ${renderSignedError("Widevine", signedData.widevine_error, widevineCheckMeta)}
  </div>`;
};

// Audio/subtitle track checklist: each track gets a click-to-cycle pass/fail toggle
// (untested -> pass -> fail -> untested), persisted per-track in localStorage so
// QA progress survives a page reload or a redeploy to the same artifact URL.
const qcColumn = (r, type, entries) => {
  if(!entries.length) return `<span class="text-dim">None</span>`;
  const items = entries.map(e => {
    const label = `${e.label} (${e.language_code})`;
    const key = `${r.playable_object_id}::${type}::${e.label}::${e.language_code}`;
    return `<li class="qc-item" data-qc-key="${esc(key)}" data-qc-label="${esc(label)}">
      <button type="button" class="qc-toggle" data-state="untested" aria-label="Toggle QC status for ${esc(label)}"></button>
      <span class="qc-label">${esc(label)}</span>
    </li>`;
  }).join("");
  return `<div class="qc-col">
    <ul class="qc-list">${items}</ul>
    <div class="qc-copy-row">
      <button type="button" class="qc-mini-btn qc-copy-meta-btn" title="Copy ${type} metadata (no pass/fail) as one bulleted cell">Copy metadata</button>
      <button type="button" class="qc-mini-btn qc-copy-btn" title="Copy ${type} metadata with pass/fail results as one bulleted cell">Copy results</button>
    </div>
  </div>`;
};

// Commercial offers (EST/VOD/etc.) configured per distribution/variant, so these can
// differ row to row within the same title depending on territory/variant.
// signedByLabel: the row's r.signed ({EST: {...}, TVOD: {...}}) - each offer named EST or
// TVOD gets its own matching CSAT playout URLs nested right under it, since that account
// is what's actually being tested against that offer's entitlement. checkIdBase wires up
// the nested recheck buttons the same way the old Playout URLs column did.
const renderOffers = (offers, signedByLabel, checkIdBase) => {
  if(!offers || offers.length === 0) return `<span class="text-dim">None</span>`;

  const blocks = offers.map(offer => {
    const walletAddress = stats.signed_tokens[offer.offer_name]
      ? stats.signed_tokens[offer.offer_name].wallet_address
      : null;
    const packages = offer.packages.map(pkg => {
      const mintBtn = pkg.sku
        ? `<button type="button" class="qc-mini-btn copy-btn offer-mint-btn" data-copy="${esc(mintEntitlementCommand(pkg.sku, walletAddress))}" title="Copy tenant_mint command for this SKU">Mint Entitlement</button>`
        : "";
      return `<div class="offer-package">
        <ul class="offer-package-list">
          <li><span class="text-dim">Package ID:</span> <span class="mono">${esc(pkg.package_id)}</span></li>
          ${pkg.sku ? `<li><span class="text-dim">SKU:</span> <span class="mono">${esc(pkg.sku)}</span></li>` : ""}
          ${pkg.nft_template_name ? `<li><span class="text-dim">NFT Template:</span> ${esc(pkg.nft_template_name)}</li>` : ""}
          ${pkg.nft_template_version_hash ? `<li class="offer-nft-line"><span class="text-dim">Version:</span> <span class="mono truncate" title="${esc(pkg.nft_template_version_hash)}">${esc(pkg.nft_template_version_hash)}</span></li>` : ""}
          ${pkg.nft_template_address ? `<li class="offer-nft-line"><span class="text-dim">NFT Address:</span> <span class="mono truncate" title="${esc(pkg.nft_template_address)}">${esc(pkg.nft_template_address)}</span><button type="button" class="icon-btn copy-btn" data-copy="${esc(pkg.nft_template_address)}" title="Copy NFT template address" aria-label="Copy NFT template address">&#10697;</button></li>` : ""}
        </ul>
        ${mintBtn}
      </div>`;
    }).join("");
    const signedGroup = signedByLabel ? renderSignedGroup(offer.offer_name, signedByLabel[offer.offer_name], checkIdBase) : "";
    return `<div class="offer-block">
      <div class="offer-name">${esc(offer.offer_name)}</div>
      ${packages}
      ${signedGroup}
    </div>`;
  }).join("");

  return `<div class="offers-cell">${blocks}</div>`;
};

// Titles also present on the comparison site (current.compare_site_summary.title_names -
// the site's full current membership, not just this run's added/updated delta). Matched
// by name, not object ID: each site has its own independently-created title objects for
// the same movie, so object IDs never coincide across sites.
const compareSiteTitleNames = new Set(
  ((current.compare_site_summary && current.compare_site_summary.title_names) || []).map(n => n.trim().toLowerCase())
);
const inCompareSite = (titleName) => compareSiteTitleNames.has((titleName || "").trim().toLowerCase());

const titleBlocks = titleOrder.map(titleObjectId => {
  const titleRows = rowsByTitle.get(titleObjectId);
  const first = titleRows[0];
  const removedBadge = !first.still_referenced ? `<span class="chip chip-removed">No longer on site</span>` : "";
  const rowsHtml = titleRows.map(r => {
    const clearPlayerCmd = r.dash_clear_url ? startPlayerCommand([r.dash_clear_url]) : null;
    const widevinePlayerCmd = (r.dash_widevine_url && r.license_server_url)
      ? startPlayerCommand([r.dash_widevine_url, r.license_server_url]) : null;
    const checkIdBase = escId([r.title_object_id, r.playable_object_id, r.territory, r.variant, r.offering].join("_"));
    return `
    <tr class="data-row" data-search="${esc([r.title_name, r.territory, r.variant, r.offering, r.playable_object_id].join(" ").toLowerCase())}" data-policy="${policyFilterState(r.playable_policy)}" data-offers="${(r.offers && r.offers.length > 0) ? "yes" : "no"}" data-last-edited="${esc(r.last_edited_at || "")}">
      <td><div class="title-id-cell">
        <div class="id-row"><span class="id-label">Territory</span><span>${esc(r.territory) || "—"}</span></div>
        <div class="id-row"><span class="id-label">Variant</span><span>${esc(r.variant) || "—"}</span></div>
        <div class="id-row"><span class="id-label">Offering</span><span>${esc(r.offering)}</span></div>
        <div class="id-row"><span class="id-label">Playable</span><span class="mono truncate" title="${esc(r.playable_object_id)}">${esc(r.playable_object_id)}</span></div>
        ${r.trailer_playable_object_id ? `<div class="id-row"><span class="id-label">Trailer</span><span class="mono truncate" title="${esc(r.trailer_playable_object_id)}">${esc(r.trailer_playable_object_id)}</span></div>` : ""}
        <div class="id-row last-edited"><span class="id-label">Last edited</span><span>${r.last_edited_at ? fmtDate(r.last_edited_at) : "—"}</span></div>
        ${renderPlayablePolicy(r.playable_policy)}
      </div></td>
      <td>${renderOffers(r.offers, r.signed, checkIdBase)}</td>
      <td class="qc-cell">
        <div class="qc-subsection" data-qc-type="audio">
          <div class="signed-group-label">Audio</div>
          ${qcColumn(r, "audio", r.audio)}
        </div>
        <div class="qc-subsection" data-qc-type="subtitle">
          <div class="signed-group-label">Subtitle</div>
          ${qcColumn(r, "subtitle", r.subtitles)}
        </div>
      </td>
      <td>
        <div class="signed-group">
          <div class="signed-group-label">Backend Fabric Token</div>
          <div class="player-cell">${playerCell("Clear", clearPlayerCmd)}${playerCell("Widevine", widevinePlayerCmd)}</div>
        </div>
      </td>
    </tr>`;
  }).join("");

  return `
    <section class="title-group" data-title-search="${esc(first.title_name.toLowerCase())}" data-meta-site="${inCompareSite(first.title_name) ? "yes" : "no"}">
      <h3 class="title-heading">
        <span>${esc(first.title_name)}</span>
        <span class="chip chip-type">${esc(first.title_type)}</span>
        ${removedBadge}
        ${inCompareSite(first.title_name) ? `<span class="chip chip-good" title="Also present on ${esc(siteLabel(current.compare_site_summary.compare_site_object_id) || "the comparison site")}">IN META PROD SITE</span>` : ""}
        <span class="text-dim mono title-hash" title="Master VU Hash">${esc(first.title_master_hash)}</span>
      </h3>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Offers</th>
              <th>Audio / Subtitle</th>
              <th>Playout URLs</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </section>`;
}).join("\n");

// The site's own display name doubles as the card's title header - drop the standalone
// word "Site" from it since the card itself already makes that clear from context.
const siteHeaderName = (objectId) => {
  const label = siteLabel(objectId);
  if(!label) return objectId;
  return label.replace(/\bSite\b/gi, "").replace(/\s{2,}/g, " ").trim();
};

// Objects newly seen on the site since the previous run, diffed by
// VUSiteTitlePlayoutURLs.js against its manifest and stored on current.object_changes.added.
// One stat card per site (this site + the comparison site), each showing total object
// count, newly added objects, and updated objects since the previous run - replaces the
// old missing-title comparison view with per-site activity instead.
const renderSiteSummary = ({ siteObjectId, siteVersionHash, siteLastEditedAt, totalObjects, newObjects, updatedObjects, titles, error }) => {
  const headerName = siteObjectId ? siteHeaderName(siteObjectId) : "Site";
  const idLine = siteObjectId
    ? `<div class="text-dim index-compare-id"><span class="mono">${esc(siteObjectId)}</span></div>`
    : "";
  const versionLine = (siteVersionHash || siteLastEditedAt)
    ? `<div class="site-version-info">
        ${siteVersionHash ? `<span class="mono truncate" title="${esc(siteVersionHash)}">${esc(siteVersionHash)}</span>` : ""}
        ${siteLastEditedAt ? `<span class="text-dim">Last edited ${fmtDate(siteLastEditedAt)}</span>` : ""}
      </div>`
    : "";

  if(error) {
    return `<div class="index-compare">
      <div class="index-compare-head"><div><h4 class="index-compare-title">${esc(headerName)}</h4>${idLine}${versionLine}</div></div>
      <div class="index-compare-error">Could not track this site: ${esc(error)}</div>
    </div>`;
  }

  const activityCount = newObjects.length + updatedObjects.length;
  const itemList = (label, cls, items) => items.map(it => `<li class="mismatch-item">
    <span class="chip chip-${cls}">${esc(label)}</span>
    <span>${esc(it.title_name)}</span>
    <span class="mono text-dim truncate">${esc(it.title_object_id)}</span>
  </li>`).join("");

  const sortedTitles = (titles || []).slice().sort((a, b) => (a.title_name || "").localeCompare(b.title_name || ""));
  const titleListHtml = sortedTitles.length > 0
    ? `<ul class="site-title-list">${sortedTitles.map(t => `<li class="site-title-list-item">
        <span class="truncate" title="${esc(t.title_name)}">${esc(t.title_name)}</span>
        <span class="mono text-dim truncate" title="${esc(t.title_master_hash)}">${esc(t.title_master_hash)}</span>
      </li>`).join("")}</ul>`
    : `<div class="index-compare-ok">No titles found.</div>`;

  return `<div class="index-compare">
    <div class="index-compare-head">
      <div><h4 class="index-compare-title">${esc(headerName)}</h4>${idLine}${versionLine}</div>
      <div class="index-compare-stats">
        <div><span class="mono num">${totalObjects}</span><span class="text-dim">total objects</span></div>
        <div><span class="mono num ${newObjects.length > 0 ? "text-good" : "text-dim"}">${newObjects.length}</span><span class="text-dim">new</span></div>
        <div><span class="mono num ${updatedObjects.length > 0 ? "text-good" : "text-dim"}">${updatedObjects.length}</span><span class="text-dim">updated</span></div>
      </div>
    </div>
    ${activityCount === 0
      ? '<div class="index-compare-ok">No new or updated objects since last run.</div>'
      : `<ul class="mismatch-list">${itemList("New", "good", newObjects) + itemList("Updated", "warn", updatedObjects)}</ul>`
    }
    <details class="site-title-list-details">
      <summary>Titles on this site (${sortedTitles.length})</summary>
      ${titleListHtml}
    </details>
  </div>`;
};

// Every metadata addition since the previous run (new offerings, audio/subtitle tracks,
// or SKUs), flattened to one table row per playable-level change - the same underlying
// diff VUSiteTitlePlayoutURLs.js's diffTitleMetadata computes, from
// current.object_changes.metadata_additions.
const renderUpdatedPlayables = () => {
  const changes = (current.object_changes && current.object_changes.metadata_additions) || [];
  const rows = [];
  for(const c of changes) {
    for(const a of c.additions || []) {
      rows.push({ title_name: c.title_name, title_object_id: c.title_object_id, playable_object_id: a.playable_object_id, text: a.text });
    }
  }

  return `<section class="updated-objects">
    <div class="updated-objects-head">
      <span class="eyebrow">Updated</span>
      ${rows.length > 0
        ? `<span class="text-dim">${rows.length} change${rows.length === 1 ? "" : "s"} across ${changes.length} object${changes.length === 1 ? "" : "s"} since last run</span>`
        : ""
      }
    </div>
    ${rows.length === 0
      ? '<div class="index-compare-ok">No playable object changes since last run.</div>'
      : `<div class="table-scroll">
          <table class="updated-table">
            <thead><tr><th>Title</th><th>Playable</th><th>Change</th></tr></thead>
            <tbody>${rows.map(r => `<tr>
              <td>${esc(r.title_name)}<div class="mono text-dim truncate" title="${esc(r.title_object_id)}">${esc(r.title_object_id)}</div></td>
              <td>${r.playable_object_id ? `<span class="mono truncate" title="${esc(r.playable_object_id)}">${esc(r.playable_object_id)}</span>` : "—"}</td>
              <td>${esc(r.text)}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>`
    }
  </section>`;
};

// Every title is expected to carry both a CA and a US distribution, each with an EST and
// a TVOD offer. Flags any title (still referenced on the site) missing one of those four
// combinations, so gaps are visible without hunting through each title's rows.
const REQUIRED_TERRITORIES = ["CA", "US"];
const REQUIRED_OFFER_NAMES = ["EST", "TVOD"];

const renderMissingDistributions = () => {
  const rows = [];
  const typesSeen = new Map(); // type slug -> label, in first-seen order

  for(const title of current.titles || []) {
    if(title.still_referenced === false) continue;

    const offersByTerritory = new Map();
    for(const p of title.playables || []) {
      if(p.offering === "sbs" || p.is_trailer) continue;
      if(!offersByTerritory.has(p.territory)) offersByTerritory.set(p.territory, new Set());
      const offerSet = offersByTerritory.get(p.territory);
      for(const o of p.offers || []) offerSet.add(o.offer_name);
    }

    const missing = [];
    for(const territory of REQUIRED_TERRITORIES) {
      if(!offersByTerritory.has(territory)) {
        missing.push({ type: `no-${territory.toLowerCase()}`, label: `No ${territory} distribution` });
        continue;
      }
      const offerSet = offersByTerritory.get(territory);
      for(const offerName of REQUIRED_OFFER_NAMES) {
        if(!offerSet.has(offerName)) {
          missing.push({ type: `${territory.toLowerCase()}-missing-${offerName.toLowerCase()}`, label: `${territory} missing ${offerName}` });
        }
      }
    }

    if(missing.length > 0) {
      for(const m of missing) {
        if(!typesSeen.has(m.type)) typesSeen.set(m.type, m.label);
      }
      rows.push({ title_name: title.title_name, title_object_id: title.title_object_id, missing });
    }
  }

  const filterBar = rows.length > 0
    ? `<div class="discrepancy-filters" role="group" aria-label="Filter by discrepancy type">
        <button type="button" class="chip-filter active" data-discrepancy-filter="all">All</button>
        ${Array.from(typesSeen.entries()).map(([type, label]) =>
          `<button type="button" class="chip-filter" data-discrepancy-filter="${esc(type)}">${esc(label)}</button>`
        ).join("")}
      </div>`
    : "";

  return `<section class="updated-objects">
    <div class="updated-objects-head">
      <span class="eyebrow">Discrepancies</span>
      <span class="text-dim">Every title should have CA + US distributions, each with EST and TVOD offers</span>
    </div>
    ${filterBar}
    ${rows.length === 0
      ? '<div class="index-compare-ok">All titles have CA + US distributions with EST and TVOD offers.</div>'
      : `<div class="table-scroll discrepancies-scroll">
          <table class="updated-table">
            <thead><tr><th>Title</th><th>Missing</th></tr></thead>
            <tbody>${rows.map(r => `<tr data-discrepancy-types="${esc(r.missing.map(m => m.type).join(" "))}">
              <td>${esc(r.title_name)}<div class="mono text-dim truncate" title="${esc(r.title_object_id)}">${esc(r.title_object_id)}</div></td>
              <td>${r.missing.map(m => `<span class="chip chip-critical">${esc(m.label)}</span>`).join(" ")}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>`
    }
  </section>`;
};

const html = `<div class="dash-root">
  <header class="dash-header">
    <div>
      <div class="eyebrow">VU Playout Monitor</div>
    </div>
    <div class="header-right">
      <div class="header-meta">
        <div><span class="text-dim">Generated</span> ${fmtDate(stats.generated_at)}</div>
        <div><span class="text-dim">Token lifetime</span> ${stats.token_duration_days}d</div>
        <div><span class="text-dim">EST CSAT</span> <span class="${stats.signed_tokens.EST && stats.signed_tokens.EST.available ? "text-good" : "text-dim"}">${stats.signed_tokens.EST && stats.signed_tokens.EST.available ? "available" : "not configured"}</span></div>
        <div><span class="text-dim">TVOD CSAT</span> <span class="${stats.signed_tokens.TVOD && stats.signed_tokens.TVOD.available ? "text-good" : "text-dim"}">${stats.signed_tokens.TVOD && stats.signed_tokens.TVOD.available ? "available" : "not configured"}</span></div>
      </div>
      <div class="header-tokens">
        <div class="header-token-item">
          <span class="text-dim">Backend Fabric Token</span>
          ${stats.fabric_token
            ? `<button class="icon-btn copy-btn" data-copy="${esc(stats.fabric_token)}" title="Copy Backend Fabric Token" aria-label="Copy Backend Fabric Token">&#10697;</button>`
            : `<span class="text-dim">&mdash;</span>`}
        </div>
        ${["EST", "TVOD"].map(label => {
          const t = stats.signed_tokens[label];
          return `<div class="header-token-item">
            <span class="text-dim">${label} CSAT Token</span>
            ${t && t.token
              ? `<button class="icon-btn copy-btn" data-copy="${esc(t.token)}" title="Copy ${label} CSAT Token" aria-label="Copy ${label} CSAT Token">&#10697;</button>`
              : `<span class="text-dim">&mdash;</span>`}
            ${t && t.email ? `<span class="header-token-email">${esc(t.email)}</span>` : ""}
          </div>`;
        }).join("")}
      </div>
    </div>
  </header>

  <section class="site-summary-stack">
    ${renderSiteSummary(mainSiteSummary)}
    ${renderSiteSummary(compareSiteSummary)}
  </section>

  ${renderUpdatedPlayables()}
  ${renderMissingDistributions()}

  <section class="filter-bar">
    <input id="search" type="search" placeholder="Search title, territory, variant, offering, playable ID&hellip;" aria-label="Search" />
    <div class="filter-group">
      <span class="filter-group-label">Policy</span>
      <div class="chip-filters" data-filter-group="policy" role="group" aria-label="Filter by policy status">
        <button class="chip-filter active" data-filter="all">All</button>
        <button class="chip-filter" data-filter="set">Set</button>
        <button class="chip-filter" data-filter="missing">Missing</button>
        <button class="chip-filter" data-filter="unchecked">Unchecked</button>
      </div>
    </div>
    <div class="filter-group">
      <span class="filter-group-label">Offers</span>
      <div class="chip-filters" data-filter-group="offers" role="group" aria-label="Filter by offers created">
        <button class="chip-filter active" data-filter="all">All</button>
        <button class="chip-filter" data-filter="yes">Has Offers</button>
        <button class="chip-filter" data-filter="no">No Offers</button>
      </div>
    </div>
    <div class="filter-group">
      <span class="filter-group-label">Meta Prod Site</span>
      <div class="chip-filters" data-filter-group="metaSite" role="group" aria-label="Filter by presence on VU Affiliate Master Site">
        <button class="chip-filter active" data-filter="all">All</button>
        <button class="chip-filter" data-filter="yes">In Meta Prod Site</button>
        <button class="chip-filter" data-filter="no">Not Meta Prod Site</button>
      </div>
    </div>
    <div class="filter-group">
      <span class="filter-group-label">Last Edited</span>
      <div class="chip-filters" data-filter-group="edited" role="group" aria-label="Filter by last edited">
        <button class="chip-filter active" data-filter="all">Any Time</button>
        <button class="chip-filter" data-filter="24h">Last 24hrs</button>
      </div>
    </div>
  </section>

  <main id="titles-container">
    ${titleBlocks}
  </main>

  <div id="toast" class="toast" role="status" aria-live="polite"></div>

  <div id="copyModal" class="copy-modal" role="dialog" aria-modal="true" aria-label="Copy to clipboard">
    <div class="copy-modal-inner">
      <div class="copy-modal-head">
        <span>Clipboard access is blocked here &mdash; text is selected, press Ctrl/Cmd+C to copy</span>
        <button type="button" id="copyModalClose" class="icon-btn" aria-label="Close">&times;</button>
      </div>
      <textarea id="copyModalText" class="copy-modal-text" readonly rows="4"></textarea>
    </div>
  </div>
</div>`;

const css = `
:root {
  --bg: #0C1116;
  --surface: #141B22;
  --surface-2: #1B242D;
  --border: #26313C;
  --text: #E6ECF1;
  --text-dim: #8D9AA8;
  --accent: #5FB3E0;
  --accent-ink: #06222E;
  --good: #4FBE82;
  --warn: #E0A83D;
  --critical: #E36B6B;
  --removed: #6B7684;
  --radius: 8px;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", Consolas, monospace;
}
@media (prefers-color-scheme: light) {
  :root {
    --bg: #F2F5F7; --surface: #FFFFFF; --surface-2: #EBEFF2; --border: #D7DEE4;
    --text: #1A222B; --text-dim: #5B6773; --accent: #1D7FB0; --accent-ink: #FFFFFF;
    --good: #2E9E62; --warn: #B8791E; --critical: #C6453F; --removed: #8A94A0;
  }
}
:root[data-theme="dark"] {
  --bg: #0C1116; --surface: #141B22; --surface-2: #1B242D; --border: #26313C;
  --text: #E6ECF1; --text-dim: #8D9AA8; --accent: #5FB3E0; --accent-ink: #06222E;
  --good: #4FBE82; --warn: #E0A83D; --critical: #E36B6B; --removed: #6B7684;
}
:root[data-theme="light"] {
  --bg: #F2F5F7; --surface: #FFFFFF; --surface-2: #EBEFF2; --border: #D7DEE4;
  --text: #1A222B; --text-dim: #5B6773; --accent: #1D7FB0; --accent-ink: #FFFFFF;
  --good: #2E9E62; --warn: #B8791E; --critical: #C6453F; --removed: #8A94A0;
}

* { box-sizing: border-box; }
.dash-root {
  font-family: var(--font-sans);
  color: var(--text);
  background: var(--bg);
  min-height: 100%;
  padding: clamp(16px, 3vw, 40px);
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.mono { font-family: var(--font-mono); }
.num { font-variant-numeric: tabular-nums; }
.text-dim { color: var(--text-dim); }
.text-warn { color: var(--warn); }
.text-good { color: var(--good); }
.text-critical { color: var(--critical); }
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}
.dash-header h1 {
  margin: 4px 0 0;
  font-size: clamp(20px, 2.4vw, 28px);
  font-weight: 700;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.dash-header h1 .mono { font-size: 0.62em; color: var(--text-dim); font-weight: 500; }
.site-version-info { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 12px; margin-top: 4px; font-size: 12px; color: var(--text-dim); }
.site-version-info .truncate { max-width: 280px; }
.header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.header-meta { display: flex; gap: 20px; font-size: 13px; }
.header-meta .text-dim { margin-right: 4px; }
.header-tokens { display: flex; gap: 16px; font-size: 12px; }
.header-token-item { display: flex; align-items: center; gap: 6px; }
.header-token-item .text-dim { margin-right: 2px; }
.header-token-email { color: var(--text-dim); font-size: 11px; }

.site-summary-stack { display: flex; flex-direction: row; flex-wrap: wrap; gap: 14px; align-items: flex-start; }

.updated-objects { margin: 16px 0; }
.updated-objects-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
table.updated-table { min-width: 0; }
table.updated-table .truncate { max-width: 280px; }

.index-compare {
  flex: 1 1 420px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.index-compare-head { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.index-compare-title { margin: 0; font-size: 15px; font-weight: 700; }
.index-compare-id { font-size: 11px; margin-top: 2px; }
.index-compare-stats { display: flex; gap: 20px; }
.index-compare-stats > div { display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
.index-compare-stats .num { font-size: 18px; }
.index-compare-ok { color: var(--good); font-size: 13px; font-weight: 600; }
.index-compare-error { color: var(--critical); font-size: 13px; }
.mismatch-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; }
.mismatch-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; flex-wrap: wrap; }
.mismatch-item .truncate { max-width: 220px; }
.site-title-list-details { border-top: 1px solid var(--border); padding-top: 10px; }
.site-title-list-details summary { cursor: pointer; font-size: 12px; font-weight: 600; color: var(--text-dim); user-select: none; }
.site-title-list-details summary:hover { color: var(--text); }
.site-title-list { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow-y: auto; }
.site-title-list-item { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; padding: 3px 0; }
.site-title-list-item .truncate:first-child { max-width: 55%; }
.site-title-list-item .mono { max-width: 42%; }
.policy-permissions-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-dim); font-weight: 700; margin-top: 2px; }
.policy-permissions { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; width: 100%; }
.policy-permission-item { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 11px; }
.policy-permission-item .truncate { max-width: 200px; }
.permission-match {
  width: 14px; height: 14px; border-radius: 4px; flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 9px; line-height: 1;
}
.permission-match--yes { background: var(--good); color: var(--accent-ink); }
.permission-match--yes::after { content: "\\2713"; }
.permission-match--no { background: transparent; border: 1px solid var(--border); color: var(--text-dim); }
.permission-match--no::after { content: "\\2715"; }

.filter-bar {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--bg);
  padding: 10px 0;
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  align-items: center;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
}
#search {
  flex: 0 1 170px;
  min-width: 120px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius);
  padding: 7px 9px;
  font-size: 13px;
  font-family: var(--font-sans);
}
#search:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.filter-group { display: flex; flex-direction: row; align-items: center; gap: 5px; flex: none; white-space: nowrap; }
.filter-group-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-dim); font-weight: 700; }
.chip-filters { display: flex; gap: 4px; flex-wrap: nowrap; }
.chip-filter {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
}
.chip-filter:hover { color: var(--text); border-color: var(--accent); }
.chip-filter.active { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }

.title-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
.title-heading {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}
.title-hash { font-size: 11px; margin-left: auto; }
.chip { border-radius: 5px; padding: 2px 7px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.chip-type { background: var(--surface-2); color: var(--text-dim); }
.chip-removed { background: color-mix(in srgb, var(--removed) 22%, transparent); color: var(--removed); }
.chip-critical { background: color-mix(in srgb, var(--critical) 20%, transparent); color: var(--critical); }
.chip-warn { background: color-mix(in srgb, var(--warn) 20%, transparent); color: var(--warn); }
.chip-good { background: color-mix(in srgb, var(--good) 20%, transparent); color: var(--good); }

.table-scroll { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); }
.discrepancies-scroll { max-height: 217px; overflow-y: auto; }
.discrepancies-scroll thead th { position: sticky; top: 0; background: var(--surface); }
.discrepancy-filters { display: flex; gap: 4px; flex-wrap: wrap; margin: 4px 0 10px; }
table { border-collapse: collapse; width: 100%; min-width: 1180px; font-size: 13px; }
thead th {
  text-align: left;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
  background: var(--surface-2);
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
tbody td { padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: top; background: var(--surface); }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--surface-2); }
.truncate { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.title-id-cell { display: flex; flex-direction: column; gap: 4px; min-width: 170px; }
.id-row { display: flex; align-items: baseline; gap: 8px; font-size: 12.5px; }
.id-label { flex: none; min-width: 54px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-dim); }
.id-row.last-edited { margin-top: 2px; padding-top: 4px; border-top: 1px dashed var(--border); color: var(--text-dim); font-size: 11.5px; }

.offers-cell { display: flex; flex-direction: row; flex-wrap: wrap; align-items: flex-start; font-size: 12px; }
.offer-block { display: flex; flex-direction: column; gap: 6px; min-width: 200px; max-width: 260px; }
.offer-block + .offer-block { margin-left: 10px; padding-left: 10px; border-left: 1px solid var(--border); }
.offer-name {
  font-weight: 700; color: var(--accent); text-transform: uppercase;
  font-size: 11px; letter-spacing: 0.04em;
}
.offer-package { display: flex; flex-direction: column; gap: 5px; }
.offer-package-list { margin: 0; padding-left: 16px; list-style: disc; color: var(--text-dim); line-height: 1.5; }
.offer-package-list li::marker { color: var(--border); }
.offer-package-list .mono { color: var(--text); }
.offer-package-list li.offer-nft-line { display: flex; align-items: center; gap: 6px; flex-wrap: nowrap; white-space: nowrap; }
.offer-package-list li.offer-nft-line .truncate { max-width: 140px; }
.offer-mint-btn { align-self: flex-start; }

.player-cell { display: flex; flex-direction: column; gap: 4px; }
.player-cell-item { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.player-missing { color: var(--text-dim); }

.signed-group { display: flex; flex-direction: column; gap: 4px; }
.signed-group + .signed-group { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.signed-group-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-dim); font-weight: 700; }
.signed-error {
  display: flex; align-items: center; flex-wrap: wrap; gap: 5px 7px;
  max-width: 240px; padding: 4px 7px; border-radius: 5px; line-height: 1.4;
  background: color-mix(in srgb, var(--critical) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--critical) 28%, transparent);
}
.signed-error .fmt-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-dim); }
.signed-error-msg { color: var(--critical); font-size: 11px; }
.signed-error.signed-error-hidden { display: none; }
.signed-error-http:empty { display: none; }
.signed-error-msg:empty { display: none; }

.qc-cell { min-width: 200px; max-width: 260px; vertical-align: top; }
.qc-subsection + .qc-subsection { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }
.qc-col { display: flex; flex-direction: column; gap: 6px; }
.qc-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.qc-item { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; line-height: 1.35; }
.qc-toggle {
  width: 16px; height: 16px; margin-top: 1px;
  border-radius: 4px; border: 1px solid var(--border);
  background: var(--surface-2); flex: none; cursor: pointer; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; line-height: 1; color: transparent;
}
.qc-toggle::after { content: ""; }
.qc-toggle[data-state="pass"] {
  background: color-mix(in srgb, var(--good) 28%, var(--surface-2));
  border-color: var(--good); color: var(--good);
}
.qc-toggle[data-state="pass"]::after { content: "\\2713"; }
.qc-toggle[data-state="fail"] {
  background: color-mix(in srgb, var(--critical) 28%, var(--surface-2));
  border-color: var(--critical); color: var(--critical);
}
.qc-toggle[data-state="fail"]::after { content: "\\2715"; }
.qc-toggle:hover { border-color: var(--accent); }
.qc-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.qc-label { color: var(--text); }
.qc-copy-row { display: flex; gap: 6px; flex-wrap: wrap; }
.qc-mini-btn {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text-dim);
  border-radius: 5px; padding: 3px 9px; font-size: 11px; font-weight: 600;
  cursor: pointer; font-family: var(--font-sans); white-space: nowrap;
}
.qc-mini-btn:hover { color: var(--accent); border-color: var(--accent); }
.qc-mini-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

.fmt-label { font-size: 12px; }
.dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.dot-good { background: var(--good); }
.dot-critical { background: var(--critical); }
.dot-checking { background: var(--warn); animation: dot-pulse 1s ease-in-out infinite; }
@keyframes dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@media (prefers-reduced-motion: reduce) { .dot-checking { animation: none; } }
.icon-btn {
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-dim);
  width: 22px; height: 22px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  font-family: var(--font-sans);
}
.icon-btn:hover { color: var(--accent); border-color: var(--accent); }
.icon-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.icon-btn:disabled { opacity: 0.5; cursor: default; }
.recheck-btn.is-checking { animation: recheck-spin 0.8s linear infinite; }
@keyframes recheck-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .recheck-btn.is-checking { animation: none; } }

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(12px);
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 9px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

.copy-modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.copy-modal.show { display: flex; }
.copy-modal-inner {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: min(560px, 100%);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 12px 32px color-mix(in srgb, var(--bg) 60%, transparent);
}
.copy-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--text-dim);
}
.copy-modal-text {
  width: 100%;
  resize: vertical;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  padding: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
}
.copy-modal-text:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

@media (prefers-reduced-motion: reduce) { .toast { transition: none; } }
`;

const js = `
(function () {
  var search = document.getElementById("search");
  var filterGroupEls = Array.prototype.slice.call(document.querySelectorAll(".chip-filters"));
  var groups = Array.prototype.slice.call(document.querySelectorAll(".title-group"));
  var DAY_MS = 24 * 60 * 60 * 1000;

  // one entry per filter group (policy/offers/metaSite/edited), each defaulting to "all"
  var activeFilters = {};
  filterGroupEls.forEach(function (el) {
    activeFilters[el.getAttribute("data-filter-group")] = "all";
  });

  function editedFilterOk(bucket, lastEditedAt) {
    if (bucket === "all") return true;
    var editedMs = lastEditedAt ? Date.parse(lastEditedAt) : NaN;
    var ageMs = isNaN(editedMs) ? Infinity : (Date.now() - editedMs);
    return ageMs <= DAY_MS;
  }

  function applyFilters() {
    var q = (search.value || "").toLowerCase().trim();
    groups.forEach(function (group) {
      // In Meta Prod Site is per-title (data-meta-site on the group), not per row.
      var metaSiteFilter = activeFilters.metaSite || "all";
      var metaSiteOk = metaSiteFilter === "all" || metaSiteFilter === group.getAttribute("data-meta-site");

      if (!metaSiteOk) {
        group.style.display = "none";
        return;
      }

      var rows = Array.prototype.slice.call(group.querySelectorAll(".data-row"));
      var titleMatches = group.getAttribute("data-title-search").indexOf(q) !== -1;
      var visibleCount = 0;
      rows.forEach(function (row) {
        var policyFilter = activeFilters.policy || "all";
        var policyOk = policyFilter === "all" || policyFilter === row.getAttribute("data-policy");

        var offersFilter = activeFilters.offers || "all";
        var offersOk = offersFilter === "all" || offersFilter === row.getAttribute("data-offers");

        var editedOk = editedFilterOk(activeFilters.edited || "all", row.getAttribute("data-last-edited"));

        var textOk = q === "" || titleMatches || row.getAttribute("data-search").indexOf(q) !== -1;
        var visible = policyOk && offersOk && editedOk && textOk;
        row.style.display = visible ? "" : "none";
        if (visible) visibleCount++;
      });
      group.style.display = visibleCount > 0 ? "" : "none";
    });
  }

  search.addEventListener("input", applyFilters);
  filterGroupEls.forEach(function (groupEl) {
    var groupKey = groupEl.getAttribute("data-filter-group");
    var btns = Array.prototype.slice.call(groupEl.querySelectorAll(".chip-filter"));
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeFilters[groupKey] = btn.getAttribute("data-filter");
        applyFilters();
      });
    });
  });

  // Discrepancies table's own filter row - independent of the main title filter-bar above,
  // filters that table's rows directly rather than gating whole title groups.
  var discrepancyFilterBtns = Array.prototype.slice.call(document.querySelectorAll(".discrepancy-filters .chip-filter"));
  var discrepancyRows = Array.prototype.slice.call(document.querySelectorAll(".discrepancies-scroll tbody tr"));
  discrepancyFilterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      discrepancyFilterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-discrepancy-filter");
      discrepancyRows.forEach(function (row) {
        var types = (row.getAttribute("data-discrepancy-types") || "").split(" ");
        row.style.display = (filter === "all" || types.indexOf(filter) !== -1) ? "" : "none";
      });
    });
  });

  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1600);
  }

  // Artifact pages run in a sandboxed iframe where navigator.clipboard is often
  // blocked by Permissions-Policy even on https. Fall back to a hidden-textarea
  // execCommand copy, and if that's blocked too, open a modal with the text
  // pre-selected so the user can copy it with Ctrl/Cmd+C themselves.
  var copyModal = document.getElementById("copyModal");
  var copyModalText = document.getElementById("copyModalText");
  var copyModalClose = document.getElementById("copyModalClose");

  function execCommandCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(textarea);
    return ok;
  }

  function showManualCopy(text) {
    copyModalText.value = text;
    copyModal.classList.add("show");
    copyModalText.focus();
    copyModalText.select();
  }

  function hideManualCopy() {
    copyModal.classList.remove("show");
  }

  copyModalClose.addEventListener("click", hideManualCopy);
  copyModal.addEventListener("click", function (e) {
    if (e.target === copyModal) hideManualCopy();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && copyModal.classList.contains("show")) hideManualCopy();
  });
  copyModalText.addEventListener("click", function () { copyModalText.select(); });

  function copyText(text, okMsg) {
    if (window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast(okMsg); }).catch(function () {
        if (execCommandCopy(text)) showToast(okMsg); else showManualCopy(text);
      });
    } else if (execCommandCopy(text)) {
      showToast(okMsg);
    } else {
      showManualCopy(text);
    }
  }

  // Live re-check of a User CSAT playout URL: after minting an entitlement, click the
  // refresh button to re-fetch the URL from the browser and update its dot/error box in
  // place, without re-running the whole discovery script. This does a real cross-origin
  // fetch, so it only works when the dashboard is opened directly (or via a local
  // server) - published Claude Artifact pages block outbound fetch via CSP, so the
  // button will just report a failure there.
  function formatCheckHttpLabel(status, statusText) {
    if (!status) return null;
    return "HTTP " + status + (statusText ? " " + statusText : "");
  }

  function recheckUrl(url) {
    return fetch(url).then(function (response) {
      if (response.ok) return null;
      return response.text().catch(function () { return ""; }).then(function (bodyText) {
        var message = bodyText.slice(0, 200);
        try {
          var parsed = JSON.parse(bodyText);
          var firstError = parsed && parsed.errors && parsed.errors[0];
          if (firstError && firstError.kind) message = firstError.kind;
        } catch (parseErr) { /* body wasn't JSON - keep the truncated raw text */ }
        return { status: response.status, statusText: response.statusText || null, message: message || null };
      });
    }).catch(function (err) {
      // A bare "Failed to fetch"/"NetworkError" here is almost always the browser's CORS
      // policy blocking the request, not a real fabric error - the copy-curl button next
      // to this message bypasses it entirely.
      var message = err.message + " (likely CORS - use the curl button below to test directly)";
      return { status: null, statusText: null, message: message };
    });
  }

  function applyCheckResult(target, err) {
    var dot = document.getElementById("dot-" + target);
    var errBox = document.getElementById("err-" + target);
    var httpLabel = err ? formatCheckHttpLabel(err.status, err.statusText) : null;
    if (dot) {
      dot.classList.remove("dot-checking", "dot-good", "dot-critical");
      dot.classList.add(err ? "dot-critical" : "dot-good");
      var fullText = err ? ([httpLabel, err.message].filter(Boolean).join(" — ") || "Request failed") : "Plays OK";
      dot.setAttribute("title", fullText);
    }
    if (errBox) {
      if (err) {
        errBox.classList.remove("signed-error-hidden");
        var httpEl = errBox.querySelector(".signed-error-http");
        var msgEl = errBox.querySelector(".signed-error-msg");
        if (httpEl) httpEl.textContent = httpLabel || "";
        if (msgEl) msgEl.textContent = err.message || "";
      } else {
        errBox.classList.add("signed-error-hidden");
      }
    }
  }

  Array.prototype.slice.call(document.querySelectorAll(".recheck-btn")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      var url = btn.getAttribute("data-check-url");
      var target = btn.getAttribute("data-check-target");
      var label = btn.getAttribute("data-check-label") || "URL";
      if (!url || !target) return;
      btn.disabled = true;
      btn.classList.add("is-checking");
      var dot = document.getElementById("dot-" + target);
      if (dot) dot.classList.add("dot-checking");
      recheckUrl(url).then(function (err) {
        applyCheckResult(target, err);
        showToast(label + (err ? " still failing" : " now plays OK"));
      }).finally(function () {
        btn.disabled = false;
        btn.classList.remove("is-checking");
      });
    });
  });

  // QC checklist: click-to-cycle pass/fail toggle per audio/subtitle track,
  // persisted in localStorage so state survives reloads and redeploys.
  var QC_STATES = ["untested", "pass", "fail"];
  var QC_STORAGE_PREFIX = "vupm_qc:";

  function qcStorageGet(key) {
    try { return localStorage.getItem(QC_STORAGE_PREFIX + key); } catch (e) { return null; }
  }
  function qcStorageSet(key, value) {
    try { localStorage.setItem(QC_STORAGE_PREFIX + key, value); } catch (e) { /* ignore */ }
  }

  function qcColumnMeta(col) {
    if (!col) return [];
    return Array.prototype.slice.call(col.querySelectorAll(".qc-item")).map(function (item) {
      return item.getAttribute("data-qc-label");
    });
  }
  function qcColumnResults(col) {
    if (!col) return [];
    return Array.prototype.slice.call(col.querySelectorAll(".qc-item")).map(function (item) {
      var state = item.querySelector(".qc-toggle").getAttribute("data-state") || "untested";
      var mark = state === "pass" ? "PASS" : state === "fail" ? "FAIL" : "UNTESTED";
      return "[" + mark + "] " + item.getAttribute("data-qc-label");
    });
  }

  // Plain-text clipboard paste in spreadsheets splits on every literal tab/newline
  // regardless of surrounding quotes (CSV quote-awareness only applies to actual file
  // import, not a plain-text paste) - so bullets must stay on one line per cell, with
  // no embedded newline, or the paste splits apart into extra rows.
  function bulletCell(list) {
    return list.map(function (item) { return "• " + item; }).join(" ");
  }

  Array.prototype.slice.call(document.querySelectorAll(".qc-toggle")).forEach(function (toggle) {
    var key = toggle.closest(".qc-item").getAttribute("data-qc-key");
    var saved = qcStorageGet(key);
    if (saved && QC_STATES.indexOf(saved) !== -1) toggle.setAttribute("data-state", saved);
  });

  document.addEventListener("click", function (e) {
    var qcToggle = e.target.closest(".qc-toggle");
    if (qcToggle) {
      var current = qcToggle.getAttribute("data-state") || "untested";
      var next = QC_STATES[(QC_STATES.indexOf(current) + 1) % QC_STATES.length];
      qcToggle.setAttribute("data-state", next);
      qcStorageSet(qcToggle.closest(".qc-item").getAttribute("data-qc-key"), next);
      return;
    }

    var qcCopyMetaBtn = e.target.closest(".qc-copy-meta-btn");
    if (qcCopyMetaBtn) {
      copyText(bulletCell(qcColumnMeta(qcCopyMetaBtn.closest(".qc-col"))), "Metadata copied");
      return;
    }

    var qcCopyBtn = e.target.closest(".qc-copy-btn");
    if (qcCopyBtn) {
      copyText(bulletCell(qcColumnResults(qcCopyBtn.closest(".qc-col"))), "QC results copied");
      return;
    }

    var copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      copyText(copyBtn.getAttribute("data-copy"), "Copied to clipboard");
    }
  });
})();
`;

const fullHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>VU Playout Monitor</title>
<style>${css}</style>
</head>
<body>
${html}
<script>${js}</script>
</body>
</html>`;

fs.mkdirSync(path.dirname(outfile), { recursive: true });
fs.writeFileSync(outfile, fullHtml);
console.log(`Dashboard written to ${outfile}`);
const objectChanges = current.object_changes || {};
const missingPolicyCount = (current.titles || []).filter(t => t.policy && t.policy.has_policy === false).length;
console.log(`Stats: ${stats.site_titles_total} titles on site, ${(objectChanges.added || []).length} new object(s), ${missingPolicyCount} missing policy`);
