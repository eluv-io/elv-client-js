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
const mintEntitlementCommand = (sku) => `./elv-live tenant_mint ${tenantId} ${marketplace} ${sku} <to_wallet_address>`;

const currentPath = path.join(stateDir, "current.ignore.json");
if(!fs.existsSync(currentPath)) {
  console.error(`No state found at ${currentPath} - run VUSiteTitlePlayoutURLs.js at least once first.`);
  process.exit(1);
}

const current = JSON.parse(fs.readFileSync(currentPath, "utf8"));

// ---- flatten titles/playables into rows, cross-referencing failures ----

const failureKey = (objectId, playableObjectId, offering, format) =>
  `${playableObjectId}::${offering}::${format || ""}`;

const failuresByKey = new Map();
for(const f of current.failures || []) {
  const key = failureKey(f.object_id, f.playable_object_id, f.offering, f.format);
  if(!failuresByKey.has(key)) failuresByKey.set(key, []);
  failuresByKey.get(key).push(f.error);
}

const rows = [];
for(const title of current.titles || []) {
  for(const p of title.playables || []) {
    const clear = (p.formats || []).find(f => f.format === "dash-clear");
    const widevine = (p.formats || []).find(f => f.format === "dash-widevine");
    const clearFail = failuresByKey.get(failureKey(title.title_object_id, p.playable_object_id, p.offering, "dash-clear")) || [];
    const widevineFail = failuresByKey.get(failureKey(title.title_object_id, p.playable_object_id, p.offering, "dash-widevine")) || [];

    rows.push({
      title_name: title.title_name,
      title_type: title.title_type,
      title_master_hash: title.title_master_hash,
      title_object_id: title.title_object_id,
      still_referenced: title.still_referenced !== false,
      offers: p.offers || [],
      territory: p.territory,
      variant: p.variant,
      is_trailer: !!p.is_trailer,
      offering: p.offering,
      playable_object_id: p.playable_object_id,
      audio: p.audio || [],
      subtitles: p.subtitles || [],
      dash_clear_url: clear ? clear.url : null,
      dash_clear_ok: !!clear && !clearFail.length,
      dash_clear_error: clearFail.join("; ") || null,
      dash_widevine_url: widevine ? widevine.url : null,
      dash_widevine_ok: !!widevine && !widevineFail.length,
      dash_widevine_error: widevineFail.join("; ") || null,
      license_server_url: widevine ? widevine.license_server_url : null,
      dash_clear_user_signed_url: clear ? clear.user_signed_url : null,
      dash_widevine_user_signed_url: widevine ? widevine.user_signed_url : null,
      user_signed_license_server_url: widevine ? widevine.user_signed_license_server_url : null
    });
  }
}

const stats = {
  generated_at: current.generated_at,
  site_object_id: current.site_object_id,
  token_duration_days: current.token_duration_days,
  user_signed_token_available: !!current.user_signed_token_available,
  site_titles_total: current.site_titles_total != null
    ? current.site_titles_total
    : current.titles.filter(t => t.still_referenced !== false).length
};

// ---- render ----

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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

const formatCell = (label, url, ok, error) => {
  if(!url) {
    return `<div class="fmt-cell fmt-missing" title="${esc(error || "Not generated")}">
      <span class="dot dot-critical"></span><span class="fmt-label">${label}</span>
    </div>`;
  }
  return `<div class="fmt-cell" title="${esc(error || "")}">
    <span class="dot ${ok ? "dot-good" : "dot-critical"}"></span>
    <span class="fmt-label">${label}</span>
    <a class="icon-btn" href="${esc(url)}" target="_blank" rel="noopener" title="Open ${label} URL" aria-label="Open ${label} URL">&#8599;</a>
    <button class="icon-btn copy-btn" data-copy="${esc(url)}" title="Copy ${label} URL" aria-label="Copy ${label} URL">&#10697;</button>
  </div>`;
};

// start-player.sh copy-paste commands for headset testing: dash-clear takes one URL
// arg, dash-widevine takes the playout URL plus the license server URL. Referenced by
// its actual location (~/Desktop) so the command works regardless of the current
// working directory when pasted into a terminal.
const shQuote = (s) => `"${String(s).replace(/"/g, '\\"')}"`;
const startPlayerCommand = (urls) => `~/Desktop/start-player.sh ${urls.map(shQuote).join(" ")}`;

const playerCell = (label, cmd) => {
  if(!cmd) {
    return `<div class="player-cell-item player-missing"><span class="fmt-label">${label}</span><span class="text-dim">&mdash;</span></div>`;
  }
  return `<div class="player-cell-item">
    <span class="fmt-label">${label}</span>
    <button class="icon-btn copy-btn" data-copy="${esc(cmd)}" title="Copy ${label} start-player.sh command" aria-label="Copy ${label} start-player.sh command">&#10697;</button>
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

// Per-row confirmation that this playable's data has been copied into the external
// QC spreadsheet, persisted per playable+offering in localStorage.
const qcSheetToggle = (r) => {
  const key = `${r.playable_object_id}::${r.offering}`;
  return `<button type="button" class="qcsheet-toggle" data-state="off" data-qcsheet-key="${esc(key)}" aria-pressed="false">
    <span class="qcsheet-check"></span><span class="qcsheet-label">Added to QC Sheet</span>
  </button>`;
};

// Commercial offers (EST/VOD/etc.) configured per distribution/variant, so these can
// differ row to row within the same title depending on territory/variant.
const renderOffers = (offers) => {
  if(!offers || offers.length === 0) return `<span class="text-dim">None</span>`;

  const blocks = offers.map(offer => {
    const packages = offer.packages.map(pkg => {
      const mintBtn = pkg.sku
        ? `<button type="button" class="qc-mini-btn copy-btn offer-mint-btn" data-copy="${esc(mintEntitlementCommand(pkg.sku))}" title="Copy tenant_mint command for this SKU">Mint Entitlement</button>`
        : "";
      return `<div class="offer-package">
        <ul class="offer-package-list">
          <li><span class="text-dim">Package ID:</span> <span class="mono">${esc(pkg.package_id)}</span></li>
          ${pkg.sku ? `<li><span class="text-dim">SKU:</span> <span class="mono">${esc(pkg.sku)}</span></li>` : ""}
        </ul>
        ${mintBtn}
      </div>`;
    }).join("");
    return `<div class="offer-block">
      <div class="offer-name">${esc(offer.offer_name)}</div>
      ${packages}
    </div>`;
  }).join("");

  return `<div class="offers-cell">${blocks}</div>`;
};

const titleBlocks = titleOrder.map(titleObjectId => {
  const titleRows = rowsByTitle.get(titleObjectId);
  const first = titleRows[0];
  const removedBadge = !first.still_referenced ? `<span class="chip chip-removed">No longer on site</span>` : "";
  const rowsHtml = titleRows.map(r => {
    const clearPlayerCmd = r.dash_clear_url ? startPlayerCommand([r.dash_clear_url]) : null;
    const widevinePlayerCmd = (r.dash_widevine_url && r.license_server_url)
      ? startPlayerCommand([r.dash_widevine_url, r.license_server_url]) : null;
    const clearUserSignedPlayerCmd = r.dash_clear_user_signed_url ? startPlayerCommand([r.dash_clear_user_signed_url]) : null;
    const widevineUserSignedPlayerCmd = (r.dash_widevine_user_signed_url && r.user_signed_license_server_url)
      ? startPlayerCommand([r.dash_widevine_user_signed_url, r.user_signed_license_server_url]) : null;
    return `
    <tr class="data-row" data-search="${esc([r.title_name, r.territory, r.variant, r.offering, r.playable_object_id].join(" ").toLowerCase())}">
      <td><div class="title-id-cell">
        <div class="id-row"><span class="id-label">Territory</span><span>${esc(r.territory) || "—"}</span></div>
        <div class="id-row"><span class="id-label">Variant</span><span>${esc(r.variant) || "—"}${r.is_trailer ? '<span class="chip chip-trailer">Trailer</span>' : ""}</span></div>
        <div class="id-row"><span class="id-label">Offering</span><span>${esc(r.offering)}</span></div>
        <div class="id-row"><span class="id-label">Playable</span><span class="mono truncate" title="${esc(r.playable_object_id)}">${esc(r.playable_object_id)}</span></div>
      </div></td>
      <td>${renderOffers(r.offers)}</td>
      <td class="qc-cell" data-qc-type="audio">${qcColumn(r, "audio", r.audio)}</td>
      <td class="qc-cell" data-qc-type="subtitle">${qcColumn(r, "subtitle", r.subtitles)}</td>
      <td><div class="url-stack">
        ${formatCell("Clear", r.dash_clear_url, r.dash_clear_ok, r.dash_clear_error)}
        ${formatCell("Widevine", r.dash_widevine_url, r.dash_widevine_ok, r.dash_widevine_error)}
        ${r.license_server_url ? formatCell("License", r.license_server_url, true, null) : '<div class="fmt-cell fmt-missing"><span class="dot dot-critical"></span><span class="fmt-label">License</span></div>'}
      </div></td>
      <td>
        <div class="signed-group">
          <div class="signed-group-label">Backend Fabric Token</div>
          <div class="player-cell">${playerCell("Clear", clearPlayerCmd)}${playerCell("Widevine", widevinePlayerCmd)}</div>
        </div>
        <div class="signed-group">
          <div class="signed-group-label">User CSAT</div>
          <div class="player-cell">${playerCell("Clear", clearUserSignedPlayerCmd)}${playerCell("Widevine", widevineUserSignedPlayerCmd)}</div>
        </div>
      </td>
      <td>${qcSheetToggle(r)}</td>
    </tr>`;
  }).join("");

  return `
    <section class="title-group" data-title-search="${esc(first.title_name.toLowerCase())}">
      <h3 class="title-heading">
        <span>${esc(first.title_name)}</span>
        <span class="chip chip-type">${esc(first.title_type)}</span>
        ${removedBadge}
        <span class="text-dim mono title-hash" title="Master VU Hash">${esc(first.title_master_hash)}</span>
      </h3>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Offers</th>
              <th>Audio</th>
              <th>Subtitle</th>
              <th>Direct URLs</th>
              <th>Playout URLs</th>
              <th>QC Sheet</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </section>`;
}).join("\n");

// Reconciles the site's titles list against a separate catalog/index object, so drift
// (titles missing from one side or the other) is visible without digging through logs.
const renderIndexComparison = () => {
  const cmp = current.index_comparison;
  if(!cmp) {
    return `<div class="index-compare">
      <div class="index-compare-head"><span class="eyebrow">Index vs Site</span></div>
      <div class="text-dim">No index comparison recorded yet — run VUSiteTitlePlayoutURLs.js to populate it.</div>
    </div>`;
  }

  if(cmp.error) {
    return `<div class="index-compare">
      <div class="index-compare-head">
        <div>
          <span class="eyebrow">Index vs Site</span>
          <div class="text-dim mono index-compare-id">${esc(cmp.index_object_id)}</div>
        </div>
      </div>
      <div class="index-compare-error">Comparison failed: ${esc(cmp.error)}</div>
    </div>`;
  }

  const missingFromSite = cmp.missing_from_site || [];
  const missingFromIndex = cmp.missing_from_index || [];
  const mismatchCount = missingFromSite.length + missingFromIndex.length;

  const mismatchList = (label, cls, items) => {
    if(!items.length) return "";
    const itemsHtml = items.map(it => `<li class="mismatch-item">
      <span class="chip chip-${cls}">${esc(label)}</span>
      <span>${esc(it.title_name)}</span>
      <span class="mono text-dim truncate">${esc(it.object_id)}</span>
    </li>`).join("");
    return `<ul class="mismatch-list">${itemsHtml}</ul>`;
  };

  return `<div class="index-compare">
    <div class="index-compare-head">
      <div>
        <span class="eyebrow">Index vs Site</span>
        <div class="text-dim mono index-compare-id">${esc(cmp.index_object_id)}</div>
      </div>
      <div class="index-compare-stats">
        <div><span class="mono num">${cmp.index_total}</span><span class="text-dim">in index</span></div>
        <div><span class="mono num">${cmp.site_total}</span><span class="text-dim">on site</span></div>
        <div><span class="mono num ${mismatchCount > 0 ? "text-critical" : "text-good"}">${mismatchCount}</span><span class="text-dim">mismatch${mismatchCount === 1 ? "" : "es"}</span></div>
      </div>
    </div>
    ${mismatchCount === 0
      ? '<div class="index-compare-ok">All index titles match the site.</div>'
      : mismatchList("Missing from site", "critical", missingFromSite) + mismatchList("Missing from index", "warn", missingFromIndex)
    }
  </div>`;
};

// Trailer additions/removals since the previous run, diffed by VUSiteTitlePlayoutURLs.js
// against trailers.ignore.json and stored on current.trailer_changes.
const renderTrailerChanges = () => {
  const tc = current.trailer_changes;
  if(!tc) {
    return `<div class="index-compare">
      <div class="index-compare-head"><span class="eyebrow">Trailers</span></div>
      <div class="text-dim">No trailer history recorded yet — run VUSiteTitlePlayoutURLs.js to populate it.</div>
    </div>`;
  }

  const added = tc.added || [];
  const removed = tc.removed || [];
  const changeCount = added.length + removed.length;

  const trailerList = (label, cls, items) => {
    if(!items.length) return "";
    const itemsHtml = items.map(it => `<li class="mismatch-item">
      <span class="chip chip-${cls}">${esc(label)}</span>
      <span>${esc(it.title_name)}</span>
      <span class="text-dim">${esc([it.territory, it.variant, it.offering].filter(Boolean).join(" "))}</span>
    </li>`).join("");
    return `<ul class="mismatch-list">${itemsHtml}</ul>`;
  };

  return `<div class="index-compare">
    <div class="index-compare-head">
      <div><span class="eyebrow">Trailers</span></div>
      <div class="index-compare-stats">
        <div><span class="mono num">${tc.total}</span><span class="text-dim">total</span></div>
        <div><span class="mono num ${added.length > 0 ? "text-good" : "text-dim"}">${added.length}</span><span class="text-dim">added</span></div>
        <div><span class="mono num ${removed.length > 0 ? "text-critical" : "text-dim"}">${removed.length}</span><span class="text-dim">removed</span></div>
      </div>
    </div>
    ${changeCount === 0
      ? '<div class="index-compare-ok">No trailer changes since last run.</div>'
      : trailerList("Added", "good", added) + trailerList("Removed", "critical", removed)
    }
  </div>`;
};

const html = `<div class="dash-root">
  <header class="dash-header">
    <div>
      <div class="eyebrow">VU Playout Monitor</div>
      <h1>Site <span class="mono">${esc(stats.site_object_id)}</span></h1>
    </div>
    <div class="header-meta">
      <div><span class="text-dim">Generated</span> ${fmtDate(stats.generated_at)}</div>
      <div><span class="text-dim">Token lifetime</span> ${stats.token_duration_days}d</div>
      <div><span class="text-dim">User CSAT token</span> <span class="${stats.user_signed_token_available ? "text-good" : "text-dim"}">${stats.user_signed_token_available ? "available" : "not configured"}</span></div>
    </div>
  </header>

  <section class="top-summary">
    <div class="hero-stat">
      <div class="hero-stat-value">${stats.site_titles_total}</div>
      <div class="hero-stat-label">Titles on site</div>
    </div>
    ${renderIndexComparison()}
    ${renderTrailerChanges()}
  </section>

  <section class="filter-bar">
    <input id="search" type="search" placeholder="Search title, territory, variant, offering, playable ID&hellip;" aria-label="Search" />
    <div class="chip-filters" role="group" aria-label="Filter by QC Sheet status">
      <button class="chip-filter active" data-filter="all">All</button>
      <button class="chip-filter" data-filter="qc-yes">Added to QC Sheet</button>
      <button class="chip-filter" data-filter="qc-no">Not Added</button>
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
.header-meta { display: flex; gap: 20px; font-size: 13px; }
.header-meta .text-dim { margin-right: 4px; }

.top-summary {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: stretch;
}
.hero-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius);
  padding: 16px 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 170px;
}
.hero-stat-value { font-family: var(--font-mono); font-size: 38px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; }
.hero-stat-label { font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; }

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
.index-compare-id { font-size: 11px; margin-top: 2px; }
.index-compare-stats { display: flex; gap: 20px; }
.index-compare-stats > div { display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
.index-compare-stats .num { font-size: 18px; }
.index-compare-ok { color: var(--good); font-size: 13px; font-weight: 600; }
.index-compare-error { color: var(--critical); font-size: 13px; }
.mismatch-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; }
.mismatch-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; flex-wrap: wrap; }
.mismatch-item .truncate { max-width: 220px; }

.filter-bar {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--bg);
  padding: 10px 0;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid var(--border);
}
#search {
  flex: 1 1 280px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius);
  padding: 9px 12px;
  font-size: 14px;
  font-family: var(--font-sans);
}
#search:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.chip-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.chip-filter {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 7px 13px;
  font-size: 12.5px;
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
.chip-trailer { background: var(--surface-2); color: var(--text-dim); margin-left: 6px; text-transform: none; font-size: 10px; padding: 1px 6px; }
.chip-removed { background: color-mix(in srgb, var(--removed) 22%, transparent); color: var(--removed); }
.chip-critical { background: color-mix(in srgb, var(--critical) 20%, transparent); color: var(--critical); }
.chip-warn { background: color-mix(in srgb, var(--warn) 20%, transparent); color: var(--warn); }
.chip-good { background: color-mix(in srgb, var(--good) 20%, transparent); color: var(--good); }

.table-scroll { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); }
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

.offers-cell { display: flex; flex-direction: column; gap: 10px; min-width: 200px; max-width: 260px; font-size: 12px; }
.offer-block { display: flex; flex-direction: column; gap: 3px; }
.offer-name {
  font-weight: 700; color: var(--accent); text-transform: uppercase;
  font-size: 11px; letter-spacing: 0.04em;
}
.offer-package { display: flex; flex-direction: column; gap: 5px; }
.offer-package-list { margin: 0; padding-left: 16px; list-style: disc; color: var(--text-dim); line-height: 1.5; }
.offer-package-list li::marker { color: var(--border); }
.offer-package-list .mono { color: var(--text); }
.offer-mint-btn { align-self: flex-start; }

.url-stack { display: flex; flex-direction: column; gap: 5px; }

.player-cell { display: flex; flex-direction: column; gap: 4px; }
.player-cell-item { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.player-missing { color: var(--text-dim); }

.signed-group { display: flex; flex-direction: column; gap: 4px; }
.signed-group + .signed-group { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.signed-group-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-dim); font-weight: 700; }

.qc-cell { min-width: 200px; max-width: 260px; vertical-align: top; }
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

.qcsheet-toggle {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text-dim);
  border-radius: 999px; padding: 6px 12px; font-size: 11.5px; font-weight: 600;
  cursor: pointer; font-family: var(--font-sans); white-space: nowrap;
}
.qcsheet-toggle:hover { border-color: var(--accent); }
.qcsheet-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.qcsheet-check {
  width: 14px; height: 14px; border-radius: 4px; border: 1px solid var(--border);
  background: var(--surface); flex: none; display: inline-flex; align-items: center; justify-content: center;
  font-size: 9px; line-height: 1; color: transparent;
}
.qcsheet-check::after { content: "\\2713"; }
.qcsheet-toggle[data-state="on"] { background: color-mix(in srgb, var(--good) 22%, var(--surface-2)); border-color: var(--good); color: var(--good); }
.qcsheet-toggle[data-state="on"] .qcsheet-check { background: var(--good); border-color: var(--good); color: var(--accent-ink); }

.fmt-cell { display: flex; align-items: center; gap: 5px; white-space: nowrap; }
.fmt-label { font-size: 12px; }
.dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.dot-good { background: var(--good); }
.dot-critical { background: var(--critical); }
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
  var filters = Array.prototype.slice.call(document.querySelectorAll(".chip-filter"));
  var groups = Array.prototype.slice.call(document.querySelectorAll(".title-group"));
  var activeFilter = "all";

  function applyFilters() {
    var q = (search.value || "").toLowerCase().trim();
    groups.forEach(function (group) {
      var rows = Array.prototype.slice.call(group.querySelectorAll(".data-row"));
      var titleMatches = group.getAttribute("data-title-search").indexOf(q) !== -1;
      var visibleCount = 0;
      rows.forEach(function (row) {
        var qcToggleEl = row.querySelector(".qcsheet-toggle");
        var qcAdded = !!qcToggleEl && qcToggleEl.getAttribute("data-state") === "on";
        var qcOk = activeFilter === "all" ||
          (activeFilter === "qc-yes" && qcAdded) ||
          (activeFilter === "qc-no" && !qcAdded);
        var textOk = q === "" || titleMatches || row.getAttribute("data-search").indexOf(q) !== -1;
        var visible = qcOk && textOk;
        row.style.display = visible ? "" : "none";
        if (visible) visibleCount++;
      });
      group.style.display = visibleCount > 0 ? "" : "none";
    });
  }

  search.addEventListener("input", applyFilters);
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter");
      applyFilters();
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

  // "Added to QC Sheet" row toggle: binary on/off, also persisted in localStorage.
  var QCSHEET_STORAGE_PREFIX = "vupm_qcsheet:";
  function qcSheetStorageGet(key) {
    try { return localStorage.getItem(QCSHEET_STORAGE_PREFIX + key); } catch (e) { return null; }
  }
  function qcSheetStorageSet(key, value) {
    try { localStorage.setItem(QCSHEET_STORAGE_PREFIX + key, value); } catch (e) { /* ignore */ }
  }

  Array.prototype.slice.call(document.querySelectorAll(".qcsheet-toggle")).forEach(function (toggle) {
    var saved = qcSheetStorageGet(toggle.getAttribute("data-qcsheet-key"));
    if (saved === "on") {
      toggle.setAttribute("data-state", "on");
      toggle.setAttribute("aria-pressed", "true");
    }
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

    var qcSheetToggle = e.target.closest(".qcsheet-toggle");
    if (qcSheetToggle) {
      var isOn = qcSheetToggle.getAttribute("data-state") === "on";
      var nextState = isOn ? "off" : "on";
      qcSheetToggle.setAttribute("data-state", nextState);
      qcSheetToggle.setAttribute("aria-pressed", nextState === "on" ? "true" : "false");
      qcSheetStorageSet(qcSheetToggle.getAttribute("data-qcsheet-key"), nextState);
      applyFilters();
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
const cmpSummary = current.index_comparison && !current.index_comparison.error
  ? `${(current.index_comparison.missing_from_site || []).length + (current.index_comparison.missing_from_index || []).length} mismatch(es) vs index`
  : "no index comparison";
console.log(`Stats: ${stats.site_titles_total} titles on site, ${cmpSummary}`);
