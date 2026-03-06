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
     * Each item in `tasks` is a zero-arg async function that returns a result.
     */
    async parallelLimit(tasks, limit) {
        const results = new Array(tasks.length);
        let index = 0;

        async function worker() {
            while (index < tasks.length) {
                const i = index++;
                results[i] = await tasks[i]();
            }
        }

        const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
        await Promise.all(workers);
        return results;
    }

    async downloadFile(url, filepath) {
        return this.retry(() => {
            return new Promise((resolve, reject) => {
                // Keep-alive agent to reuse TCP connections across downloads
                const agent = new https.Agent({ keepAlive: true });

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
                        const filename = path.basename(filepath);

                        const writeStream = fs.createWriteStream(filepath);

                        res.on("data", (chunk) => {
                            downloaded += chunk.length;
                            if (totalSize > 0) {
                                const pct = ((downloaded / totalSize) * 100).toFixed(1);
                                process.stdout.write(`\r[${filename}] ${pct}% (${(downloaded / 1e6).toFixed(2)}/${(totalSize / 1e6).toFixed(2)} MB)`);
                            } else {
                                process.stdout.write(`\r[${filename}] ${(downloaded / 1e6).toFixed(2)} MB downloaded`);
                            }
                        });

                        res.on("end", () => process.stdout.write("\n"));
                        res.pipe(writeStream);
                        writeStream.on("finish", () => writeStream.close(resolve));
                        writeStream.on("error", (err) => {
                            fs.unlink(filepath, () => reject(err));
                        });
                    });

                    // 30s connection timeout only — don't timeout mid-transfer
                    req.setTimeout(30_000, () => {
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
                this.logger.warn(`Download ${reason}. Retrying attempt ${attempt}...`);
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

    async processObject(e, client, libraryId, format, offering, targetDir, failedDownloads) {
        const objectId = e.objectId;
        const objectName = R.path(["metadata", "public", "name"], e) || objectId;

        this.logger.log(`\n--- Processing ${objectName} (${objectId}) ---`);
        const formattedObj = { object_id: objectId, name: objectName };

        // Skip existing
        const existing = fs.readdirSync(targetDir).find((f) => f.includes(objectId));
        if (existing) {
            this.logger.log(`Skipping ${objectName}: already exists (${existing})`);
            formattedObj.download_url = "SKIPPED_ALREADY_EXISTS";
            return formattedObj;
        }

        try {
            const versionHash = await this.retry(() =>
                this.concerns.FabricObject.latestVersionHash({ libraryId, objectId })
            );

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
            this.logger.log(`[${objectName}] Started job ${jobId}`);

            // Poll until complete
            let status;
            let lastProgress = -1;
            do {
                await this.sleep(2000);
                status = await this.retry(() =>
                    client.MakeFileServiceRequest({
                        versionHash,
                        path: `/call/media/files/${jobId}`,
                    })
                );
                const progress = status?.progress || 0;
                if (progress !== lastProgress) {
                    process.stdout.write(`\r[${objectName}] Transcoding: ${progress.toFixed(1)}%`);
                    lastProgress = progress;
                }
            } while (status?.status !== "completed");

            process.stdout.write("\n");

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

            this.logger.log(`[${objectName}] Downloading → ${outputFile}`);
            await this.downloadFile(downloadUrl, outputFile);
            this.logger.log(`[${objectName}] ✔ Completed`);
            return formattedObj;

        } catch (err) {
            this.logger.error(`FAILED: ${objectId} - ${err.message}`);
            failedDownloads.push({
                object_id: objectId,
                name: objectName,
                error: err.message,
                timestamp: new Date().toISOString(),
            });
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

        // Build task list and run in parallel with concurrency cap
        const tasks = objectList.map((obj) => () =>
            this.processObject(obj, client, libraryId, format, offering, targetDir, failedDownloads)
        );

        const results = await this.parallelLimit(tasks, concurrency);

        // Summary
        this.logger.log("\n=== SUMMARY ===");
        this.logger.log(`Processed:  ${objectList.length}`);
        this.logger.log(`Successful: ${results.length - failedDownloads.length}`);
        this.logger.log(`Failed:     ${failedDownloads.length}`);

        if (failedDownloads.length > 0) {
            this.logger.warn("\n=== FAILED DOWNLOADS ===");
            this.logger.logTable({ list: failedDownloads });

            if (this.args.failLog) {
                const failPath = path.resolve(this.args.failLog);
                fs.writeFileSync(failPath, JSON.stringify(failedDownloads, null, 2));
                this.logger.warn(`Failures written to: ${failPath}`);
            }
        }

        return { results, failedDownloads };
    }
}

if (require.main === module) {
    Utility.cmdLineInvoke(LibraryDownloadMp4);
} else {
    module.exports = LibraryDownloadMp4;
}
