// Utility that accepts a library ID and generates a download URL for each object inside of it
// OPTIMIZED: Parallel downloads with configurable concurrency
const R = require("ramda");
const { ModOpt, NewOpt } = require("./lib/options");
const Utility = require("./lib/Utility");
const { PublicMetadataPathArrayModel } = require("./lib/models/PublicMetadataPath");

const JSONConcern = require("./lib/concerns/JSON");
const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const Metadata = require("./lib/concerns/Metadata");
const FabricObject = require("./lib/concerns/FabricObject");

const path = require("path");
const fs = require("fs");
const https = require("https");

/**
 * Manages a fixed block of N terminal lines for parallel progress display.
 * Each slot occupies one dedicated line; updates use ANSI cursor movement so
 * concurrent jobs never overwrite each other.
 *
 * Layout (after start()):
 *   [slot 0 line]
 *   [slot 1 line]
 *   ...
 *   [slot N-1 line]
 *   <- cursor stays here
 *
 * logAbove() inserts a new line above the block (permanent log output) and
 * keeps the block intact below it.
 */
class MultiProgressDisplay {
    constructor(numSlots) {
        this.numSlots = numSlots;
        this.lines = new Array(numSlots).fill("");
    }

    /** Reserve N blank lines for the progress block. Call once before any updates. */
    start() {
        for (let i = 0; i < this.numSlots; i++) {
            process.stdout.write("\n");
        }
    }

    /**
     * Overwrite the line for `slot` with `text`.
     * Cursor returns to the position below slot N-1 after each call.
     */
    update(slot, text) {
        this.lines[slot] = text;
        const up = this.numSlots - slot; // always >= 1
        process.stdout.write(`\x1B[${up}A\r\x1B[2K${text}\x1B[${up}B`);
    }

    /**
     * Print `text` as a persistent log line above the progress block.
     * Uses CSI IL (insert line) so no existing slot content is lost.
     */
    logAbove(text) {
        // Move cursor to slot 0 line, insert a blank line (shifts all slots down),
        // write the message, then move down past all N slots back to base position.
        process.stdout.write(
            `\x1B[${this.numSlots}A` +      // up to slot 0
            `\x1B[1L` +                      // insert blank line; slots shift to +1..+N
            `\r\x1B[2K${text}` +             // write log line
            `\x1B[${this.numSlots + 1}B`     // down N+1 lines back to base
        );
    }

    /** Clear all progress lines (call after all tasks finish). */
    finish() {
        for (let slot = 0; slot < this.numSlots; slot++) {
            this.update(slot, "");
        }
    }
}

class LibraryDownloadMp4 extends Utility {
    blueprint() {
        return {
            concerns: [JSONConcern, ArgLibraryId, Metadata, FabricObject],
            options: [
                ModOpt("libraryId", { demand: true }),
                NewOpt("filter", {
                    descTemplate:
                        "JSON expression (or path to JSON file if starting with '@') to filter objects by (public) metadata",
                    type: "string",
                }),
                NewOpt("date", {
                    descTemplate: "include latest commit date/time if available",
                    type: "boolean",
                }),
                NewOpt("fields", {
                    coerce: PublicMetadataPathArrayModel,
                    descTemplate:
                        "Path(s) for additional metadata values to include (each must start with /public/)",
                    string: true,
                    type: "array",
                }),
                NewOpt("hash", {
                    descTemplate: "include latest version hash",
                    type: "boolean",
                }),
                NewOpt("name", {
                    descTemplate: "include object name if available",
                    type: "boolean",
                }),
                NewOpt("size", {
                    descTemplate: "include object total size",
                    type: "boolean",
                }),
                NewOpt("offering", {
                    descTemplate: "Offering name for download URL",
                    type: "string",
                }),
                NewOpt("format", {
                    descTemplate: "Format for download URL (default mp4)",
                    type: "string",
                }),
                NewOpt("downloadDir", {
                    descTemplate: "Directory to save files",
                    type: "string",
                }),
                NewOpt("failLog", {
                    descTemplate: "Write failures to a JSON file",
                    type: "string",
                }),
                NewOpt("concurrency", {
                    descTemplate: "Number of parallel downloads (default: 5)",
                    type: "number",
                    default: 5,
                }),
            ],
        };
    }

    header() {
        return `List and download objects for library ${this.args.libraryId}`;
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async retry(fn, opts = {}) {
        const { retries = 3, delay = 1000, onRetry = null } = opts;
        let attempt = 0;
        while (attempt < retries) {
            try {
                return await fn();
            } catch (err) {
                attempt++;
                if (attempt >= retries) throw err;
                if (onRetry) onRetry(err, attempt);
                else this.logger.warn(`Retry ${attempt}/${retries} after error: ${err.message}`);
                await this.sleep(delay * Math.pow(2, attempt));
            }
        }
    }

    /**
     * Run an array of async task factories with a max concurrency limit.
     * Each task factory receives its worker slot index (0-based) so it can
     * update the correct progress line.
     */
    async parallelLimit(tasks, limit) {
        const results = new Array(tasks.length);
        let index = 0;

        const worker = async (slot) => {
            while (index < tasks.length) {
                const i = index++;
                results[i] = await tasks[i](slot);
            }
        };

        const numWorkers = Math.min(limit, tasks.length);
        await Promise.all(Array.from({ length: numWorkers }, (_, slot) => worker(slot)));
        return results;
    }

    /** Render a compact ASCII progress bar for download progress. */
    renderBar(downloaded, totalSize, width = 24) {
        const dlMB = (downloaded / 1e6).toFixed(1);
        if (totalSize > 0) {
            const pct = Math.min(100, (downloaded / totalSize) * 100);
            const filled = Math.round((pct / 100) * width);
            const bar = "█".repeat(filled) + "░".repeat(width - filled);
            const totalMB = (totalSize / 1e6).toFixed(1);
            return `[${bar}] ${pct.toFixed(1)}% ${dlMB}/${totalMB} MB`;
        }
        return `[${"▒".repeat(width)}] ${dlMB} MB`;
    }

    async downloadFile(url, filepath, slot, display) {
        return this.retry(() => {
            return new Promise((resolve, reject) => {
                // Keep-alive agent to reuse TCP connections across downloads
                const agent = new https.Agent({ keepAlive: true });
                const filename = path.basename(filepath);

                const startDownload = (currentUrl, redirCount = 0) => {
                    if (redirCount > 5) return reject(new Error("Too many redirects"));

                    const req = https.get(currentUrl, { agent }, (res) => {
                        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                            const nextUrl = res.headers.location.startsWith("http")
                                ? res.headers.location
                                : new URL(res.headers.location, currentUrl).href;
                            return startDownload(nextUrl, redirCount + 1);
                        }

                        if (res.statusCode !== 200) {
                            return reject(new Error(`Download failed (HTTP ${res.statusCode})`));
                        }

                        const totalSize = parseInt(res.headers["content-length"] || "0", 10);
                        let downloaded = 0;

                        const writeStream = fs.createWriteStream(filepath);

                        res.on("data", (chunk) => {
                            downloaded += chunk.length;
                            const bar = this.renderBar(downloaded, totalSize);
                            const line = `  [${filename}] ${bar}`;
                            if (display != null && slot != null) {
                                display.update(slot, line);
                            } else {
                                process.stdout.write(`\r${line}`);
                            }
                        });

                        res.on("end", () => {
                            if (display == null) process.stdout.write("\n");
                        });

                        res.pipe(writeStream);
                        writeStream.on("finish", () => writeStream.close(resolve));
                        writeStream.on("error", (err) => {
                            fs.unlink(filepath, () => reject(err));
                        });
                    });

                    // 5-minute socket inactivity timeout — generous for large video files
                    req.setTimeout(300_000, () => {
                        req.abort();
                        reject(new Error("DOWNLOAD_TIMEOUT"));
                    });

                    req.on("error", (err) => {
                        if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
                            reject(new Error("DOWNLOAD_TIMEOUT"));
                        } else {
                            reject(err);
                        }
                    });
                };

                startDownload(url);
            });
        }, {
            retries: 3,
            onRetry: (err, attempt) => {
                const reason = err.message === "DOWNLOAD_TIMEOUT" ? "timed out" : `failed: ${err.message}`;
                if (display != null && slot != null) {
                    display.logAbove(`  [WARN] ${path.basename(filepath)}: ${reason} — retry ${attempt}/3`);
                } else {
                    this.logger.warn(`Download ${reason}. Retrying attempt ${attempt}...`);
                }
            },
        });
    }

    sanitizeFilename(name, fallback) {
        if (!name) return fallback;
        return name
            .replace(/[^a-zA-Z0-9._-]+/g, "_")
            .replace(/_+/g, "_")
            .substring(0, 180);
    }

    async processObject(e, client, libraryId, format, offering, targetDir, failedDownloads, failPath, slot, display) {
        const objectId = e.objectId;
        const objectName = R.path(["metadata", "public", "name"], e) || objectId;
        // Truncate long names so progress lines stay within one terminal line
        const shortName = objectName.length > 40 ? objectName.substring(0, 37) + "..." : objectName;

        const formattedObj = { object_id: objectId, name: objectName, version_hash: null, file_service_url: null, download_url: null };

        const updateSlot = (text) => {
            if (display != null && slot != null) {
                display.update(slot, `  [${shortName}] ${text}`);
            }
        };

        const logLine = (text) => {
            if (display != null) {
                display.logAbove(text);
            } else {
                this.logger.log(text);
            }
        };

        // Skip existing
        const existing = fs.readdirSync(targetDir).find((f) => f.includes(objectId));
        if (existing) {
            logLine(`  SKIP  ${shortName} — already exists`);
            updateSlot("skipped (already exists)");
            formattedObj.download_url = "SKIPPED_ALREADY_EXISTS";
            return formattedObj;
        }

        updateSlot("starting...");

        try {
            const versionHash = await this.retry(() =>
                this.concerns.FabricObject.latestVersionHash({ libraryId, objectId })
            );

            formattedObj.version_hash = versionHash;

            // Resolve the file service base URL for this object
            const fileServiceUrl = await this.retry(() =>
                client.FabricUrl({
                    versionHash,
                    call: "/media/files",
                    service: "files",
                })
            );

            formattedObj.file_service_url = fileServiceUrl;

            // Start transcoding job
            const response = await this.retry(() =>
                client.MakeFileServiceRequest({
                    versionHash,
                    path: "/call/media/files",
                    method: "POST",
                    body: { format, offering },
                })
            );

            const jobId = response.job_id;
            logLine(`  START ${shortName} (job ${jobId})`);
            logLine(`        ID:              ${objectId}`);
            logLine(`        Version hash:    ${versionHash}`);
            logLine(`        File svc URL:    ${fileServiceUrl}`);

            // Poll until complete, with stall detection and absolute timeout
            const STALL_TIMEOUT_MS  = 10 * 60 * 1000; // 10 min without progress change → stall
            const TOTAL_TIMEOUT_MS  = 2  * 60 * 60 * 1000; // 2 h absolute cap
            const TERMINAL_STATUSES = new Set(["completed", "failed", "error", "cancelled"]);

            let status;
            let lastProgress   = -1;
            let lastProgressAt = Date.now();
            const jobStartedAt = Date.now();

            do {
                await this.sleep(2000);
                status = await this.retry(() =>
                    client.MakeFileServiceRequest({
                        versionHash,
                        path: `/call/media/files/${jobId}`,
                    })
                );

                const progress = status?.progress || 0;
                const now = Date.now();

                if (progress !== lastProgress) {
                    lastProgress   = progress;
                    lastProgressAt = now;
                    const filled = Math.round((progress / 100) * 20);
                    const bar = "█".repeat(filled) + "░".repeat(20 - filled);
                    updateSlot(`transcoding [${bar}] ${progress.toFixed(1)}%`);
                }

                if (TERMINAL_STATUSES.has(status?.status) && status?.status !== "completed") {
                    throw new Error(`Transcoding job ${jobId} ended with status "${status.status}"`);
                }

                if (now - lastProgressAt > STALL_TIMEOUT_MS) {
                    throw new Error(`Transcoding stalled at ${lastProgress.toFixed(1)}% for >10 min`);
                }

                if (now - jobStartedAt > TOTAL_TIMEOUT_MS) {
                    throw new Error(`Transcoding exceeded 2-hour absolute timeout`);
                }
            } while (status?.status !== "completed");

            const filename = this.sanitizeFilename(status.filename, `${objectId}.mp4`);
            const outputFile = path.join(targetDir, filename);

            const downloadUrl = await this.retry(() =>
                client.FabricUrl({
                    versionHash,
                    call: `/media/files/${jobId}/download`,
                    service: "files",
                    queryParams: {
                        "header-x_set_content_disposition": `attachment; filename=${filename}`,
                    },
                })
            );

            formattedObj.download_url = downloadUrl;
            updateSlot("downloading...");

            await this.downloadFile(downloadUrl, outputFile, slot, display);

            logLine(`  DONE  ${shortName} → ${filename}`);
            logLine(`        Download URL:    ${downloadUrl}`);
            updateSlot("done ✔");
            return formattedObj;

        } catch (err) {
            logLine(`  FAIL  ${shortName}: ${err.message}`);
            updateSlot(`failed: ${err.message}`);
            const entry = {
                object_id: objectId,
                name: objectName,
                error: err.message,
                timestamp: new Date().toISOString(),
            };
            failedDownloads.push(entry);
            if (failPath) {
                // Rewrite the full array so the file is always valid JSON
                fs.writeFileSync(failPath, JSON.stringify(failedDownloads, null, 2));
            }
            return formattedObj;
        }
    }

    async body() {
        const libraryId = this.args.libraryId;
        const format = this.args.format || "mp4";
        const offering = this.args.offering || "default";
        const concurrency = Math.max(1, this.args.concurrency || 5);

        const filter =
            this.args.filter &&
            this.concerns.JSON.parseStringOrFile({ strOrPath: this.args.filter });

        if (!this.args.fields) this.args.fields = [];
        const select = ["/public/name", ...this.args.fields];

        let objectList = await this.concerns.ArgLibraryId.libObjectList({
            filterOptions: { select, filter },
        });

        this.logger.log(`Found ${objectList.length} object(s). Running with concurrency=${concurrency}\n`);

        const client = await this.concerns.Client.get();
        const failedDownloads = [];

        const targetDir = this.args.downloadDir
            ? path.resolve(this.args.downloadDir)
            : process.cwd();

        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        // Create (or reset) the fail log immediately so it exists from the start
        const failPath = this.args.failLog ? path.resolve(this.args.failLog) : null;
        if (failPath) {
            fs.writeFileSync(failPath, "[]");
            this.logger.log(`Failure log: ${failPath}\n`);
        }

        // Start the multi-line progress display (one line per concurrent worker slot)
        const numSlots = Math.min(concurrency, objectList.length);
        const display = new MultiProgressDisplay(numSlots);
        display.start();

        // Each task factory receives its worker slot index from parallelLimit
        const tasks = objectList.map((obj) => (slot) =>
            this.processObject(obj, client, libraryId, format, offering, targetDir, failedDownloads, failPath, slot, display)
        );

        const results = await this.parallelLimit(tasks, concurrency);

        // Clear the progress lines before printing summary
        display.finish();

        // Summary
        this.logger.log("\n=== SUMMARY ===");
        this.logger.log(`Processed:  ${objectList.length}`);
        this.logger.log(`Successful: ${results.length - failedDownloads.length}`);
        this.logger.log(`Failed:     ${failedDownloads.length}`);

        if (failedDownloads.length > 0) {
            this.logger.warn("\n=== FAILED DOWNLOADS ===");
            this.logger.logTable({ list: failedDownloads });
            if (failPath) this.logger.warn(`Failures logged to: ${failPath}`);
        }

        return { results, failedDownloads };
    }
}

if (require.main === module) {
    Utility.cmdLineInvoke(LibraryDownloadMp4);
} else {
    module.exports = LibraryDownloadMp4;
}
