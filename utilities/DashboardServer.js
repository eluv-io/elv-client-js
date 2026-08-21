// Local web app for running the VU Playout Monitor pipeline (VUSiteTitlePlayoutURLs.js
// then VUSiteTitleDashboard.js) from a browser, so colleagues can regenerate the
// dashboard without a terminal or their own PRIVATE_KEY/EMAIL/PASSWORD env var setup.
//
// Meant to be run locally by each person (node utilities/DashboardServer.js, then open
// http://localhost:4321) - credentials submitted through the form are held only in
// memory for the duration of that run's two child processes and are never written to
// disk, logged, or kept once the run finishes. This process itself is not meant to be
// exposed beyond localhost.
//
// Usage: node utilities/DashboardServer.js [--port 4321]

const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const getArg = (name, def) => {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : def;
};

const PORT = Number(getArg("port", process.env.PORT || 4321));
const REPO_ROOT = path.resolve(__dirname, "..");
const PLAYOUT_SCRIPT = path.join(__dirname, "VUSiteTitlePlayoutURLs.js");
const DASHBOARD_SCRIPT = path.join(__dirname, "VUSiteTitleDashboard.js");
const DASHBOARD_HTML = path.join(__dirname, "data", "vu_site_playout_state", "dashboard.html");
const DEFAULT_TENANT_ID = "itenpQ9zSeeFbz8hTHF1pKeD3P3wLpB";
const DEFAULT_FABRIC_CONFIG_URL = "https://main.net955305.contentfabric.io/config";
const RUN_TTL_MS = 10 * 60 * 1000;

// runId -> { clients: Set<ServerResponse>, log: [{event, data}], done: boolean }
const runs = new Map();
let activeRunId = null;

const broadcast = (runId, event, data) => {
  const run = runs.get(runId);
  if(!run) return;
  run.log.push({ event, data });
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for(const res of run.clients) res.write(payload);
};

const runScript = (scriptPath, env, runId, label) => {
  return new Promise((resolve) => {
    broadcast(runId, "log", { line: `\n$ node ${path.relative(REPO_ROOT, scriptPath)}  (${label})` });
    const child = spawn(process.execPath, [scriptPath], { cwd: REPO_ROOT, env });

    child.stdout.on("data", (chunk) => {
      String(chunk).split("\n").filter(Boolean).forEach(line => broadcast(runId, "log", { line }));
    });
    child.stderr.on("data", (chunk) => {
      String(chunk).split("\n").filter(Boolean).forEach(line => broadcast(runId, "log", { line: `! ${line}` }));
    });
    child.on("close", (code) => resolve(code === 0));
    child.on("error", (err) => {
      broadcast(runId, "log", { line: `! Failed to start: ${err.message}` });
      resolve(false);
    });
  });
};

const performRun = async (runId, creds) => {
  let env = {
    ...process.env,
    PRIVATE_KEY: creds.privateKey,
    EMAIL: creds.email,
    PASSWORD: creds.password,
    TENANT_ID: creds.tenantId || DEFAULT_TENANT_ID,
    FABRIC_CONFIG_URL: process.env.FABRIC_CONFIG_URL || DEFAULT_FABRIC_CONFIG_URL
  };
  // the caller's reference to creds is dropped by the caller right after this is
  // invoked - env (holding the only remaining copy) is cleared once both child
  // processes have exited, win or lose.
  creds = null;

  try {
    const step1Ok = await runScript(PLAYOUT_SCRIPT, env, runId, "discovery + playout URLs");
    if(!step1Ok) {
      broadcast(runId, "log", { line: "\nVUSiteTitlePlayoutURLs.js failed - stopping before dashboard regeneration." });
      broadcast(runId, "done", { ok: false });
      return;
    }
    const step2Ok = await runScript(DASHBOARD_SCRIPT, env, runId, "dashboard regeneration");
    broadcast(runId, "done", { ok: step2Ok });
  } finally {
    env = null;
    activeRunId = null;
  }
};

const HTML_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>VU Playout Monitor - Run</title>
<style>
  :root {
    --bg: #0C1116; --surface: #141B22; --surface-2: #1B242D; --border: #232E38;
    --text: #E7EDF3; --text-dim: #8A97A6; --accent: #59B7FF; --accent-ink: #05131F;
    --good: #33D17A; --critical: #FF5C6C;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 32px 20px;
  }
  .wrap { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: var(--text-dim); font-size: 13px; margin: 0 0 24px; line-height: 1.5; }
  form {
    background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
    padding: 20px; display: flex; flex-direction: column; gap: 14px;
  }
  label { font-size: 12px; color: var(--text-dim); display: flex; flex-direction: column; gap: 6px; }
  input {
    background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
    border-radius: 6px; padding: 9px 10px; font-size: 14px; font-family: inherit;
  }
  input:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
  button {
    background: var(--accent); color: var(--accent-ink); border: none; border-radius: 6px;
    padding: 11px 16px; font-size: 14px; font-weight: 700; cursor: pointer;
  }
  button:disabled { opacity: 0.5; cursor: default; }
  .note { font-size: 11.5px; color: var(--text-dim); line-height: 1.5; }
  .error { color: var(--critical); font-size: 13px; display: none; }
  .log {
    margin-top: 20px; background: #05090D; border: 1px solid var(--border); border-radius: 10px;
    padding: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
    line-height: 1.5; white-space: pre-wrap; max-height: 420px; overflow-y: auto; display: none;
  }
  .log-line--err { color: var(--critical); }
  .result { margin-top: 16px; display: none; }
  .result a {
    display: inline-block; background: var(--good); color: #05130A; text-decoration: none;
    font-weight: 700; padding: 10px 16px; border-radius: 6px; font-size: 14px;
  }
  .result.failed a { background: var(--critical); color: #1A0508; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>VU Playout Monitor</h1>
    <p class="sub">Enter your fabric credentials to run discovery and regenerate the dashboard. Nothing is stored on this server &mdash; credentials are used only for this run and discarded as soon as it finishes.</p>
    <form id="runForm">
      <label>Private Key
        <input type="password" id="privateKey" autocomplete="off" required />
      </label>
      <label>Email
        <input type="email" id="email" autocomplete="off" required />
      </label>
      <label>Password
        <input type="password" id="password" autocomplete="off" required />
      </label>
      <label>Tenant ID
        <input type="text" id="tenantId" autocomplete="off" placeholder="${DEFAULT_TENANT_ID}" />
      </label>
      <div class="error" id="formError"></div>
      <button type="submit" id="runBtn">Run pipeline</button>
      <div class="note">Runs VUSiteTitlePlayoutURLs.js, then VUSiteTitleDashboard.js. This can take several minutes on a large site.</div>
    </form>
    <div class="log" id="log"></div>
    <div class="result" id="result"></div>
  </div>
  <script>
    const form = document.getElementById("runForm");
    const runBtn = document.getElementById("runBtn");
    const logEl = document.getElementById("log");
    const resultEl = document.getElementById("result");
    const errorEl = document.getElementById("formError");

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.style.display = "block";
      runBtn.disabled = false;
      runBtn.textContent = "Run pipeline";
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.style.display = "none";
      resultEl.style.display = "none";
      resultEl.className = "result";
      logEl.textContent = "";
      logEl.style.display = "block";
      runBtn.disabled = true;
      runBtn.textContent = "Running\\u2026";

      const body = {
        privateKey: document.getElementById("privateKey").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        tenantId: document.getElementById("tenantId").value
      };

      let res;
      try {
        res = await fetch("/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } catch (err) {
        showError("Could not reach the server: " + err.message);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.error || ("Request failed (" + res.status + ")"));
        return;
      }

      // credentials are no longer needed in the page once the run has started
      document.getElementById("privateKey").value = "";
      document.getElementById("password").value = "";

      const source = new EventSource("/run-stream/" + data.runId);
      source.addEventListener("log", (evt) => {
        const payload = JSON.parse(evt.data);
        const line = document.createElement("div");
        if (payload.line && payload.line.trim().startsWith("!")) line.className = "log-line--err";
        line.textContent = payload.line;
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
      });
      source.addEventListener("done", (evt) => {
        const payload = JSON.parse(evt.data);
        source.close();
        runBtn.disabled = false;
        runBtn.textContent = "Run pipeline";
        resultEl.style.display = "block";
        if (payload.ok) {
          resultEl.className = "result";
          resultEl.innerHTML = '<a href="/dashboard" target="_blank">Open dashboard</a>';
        } else {
          resultEl.className = "result failed";
          resultEl.innerHTML = '<a href="#" onclick="return false;">Run failed \\u2014 see log above</a>';
        }
      });
      source.onerror = () => {
        source.close();
        runBtn.disabled = false;
        runBtn.textContent = "Run pipeline";
      };
    });
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if(req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML_PAGE);
    return;
  }

  if(req.method === "GET" && url.pathname === "/dashboard") {
    if(!fs.existsSync(DASHBOARD_HTML)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("No dashboard has been generated yet. Run the pipeline first.");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(DASHBOARD_HTML).pipe(res);
    return;
  }

  if(req.method === "POST" && url.pathname === "/run") {
    if(activeRunId) {
      res.writeHead(409, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "A run is already in progress on this server." }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      let creds;
      try {
        creds = JSON.parse(body);
      } catch(err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request body." }));
        return;
      }
      if(!creds.privateKey || !creds.email || !creds.password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Private key, email, and password are required." }));
        return;
      }

      const runId = crypto.randomBytes(8).toString("hex");
      runs.set(runId, { clients: new Set(), log: [], done: false });
      activeRunId = runId;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ runId }));

      performRun(runId, creds).then(() => {
        const run = runs.get(runId);
        if(run) run.done = true;
        setTimeout(() => runs.delete(runId), RUN_TTL_MS);
      });
      creds = null;
    });
    return;
  }

  if(req.method === "GET" && url.pathname.startsWith("/run-stream/")) {
    const runId = url.pathname.split("/").pop();
    const run = runs.get(runId);
    if(!run) {
      res.writeHead(404);
      res.end();
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    for(const { event, data } of run.log) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
    run.clients.add(res);
    req.on("close", () => run.clients.delete(res));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`VU Playout Monitor dashboard server running at http://localhost:${PORT}`);
  console.log("This is meant for local use only - do not expose this port beyond your own machine.");
});
