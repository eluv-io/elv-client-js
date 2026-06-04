// Utility that accepts a JSON file of object IDs and downloads each one
const R = require("ramda");
const { NewOpt } = require("./lib/options");
const Utility = require("./lib/Utility");

const FabricObject = require("./lib/concerns/FabricObject");

const path = require("path");
const fs = require("fs");
const https = require("https");

class ObjectListDownloadMp4 extends Utility {
    blueprint() {
        return {
            concerns: [FabricObject],
            options: [
                NewOpt("objectIds", {
                    descTemplate: "Path to a JSON file containing an array of object IDs to download",
                    demand: true,
                    type: "string",
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
            ],
        };
    }

    header() {
        return `Download objects from object ID list`;
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

    async downloadFile(url, filepath) {
        return this.retry(() => {
            return new Promise((resolve, reject) => {
                const startDownload = (currentUrl, redirCount = 0) => {
                    if (redirCount > 5) return reject(new Error("Too many redirects"));

                    const req = https.get(currentUrl, (res) => {
                        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                            const nextUrl = res.headers.location.startsWith("http")
                                ? res.headers.location
                                : new URL(res.headers.location, currentUrl).href;
                            this.logger.log(`Redirected → ${nextUrl}`);
                            return startDownload(nextUrl, redirCount + 1);
                        }

                        if (res.statusCode !== 200)
                            return reject(new Error(`Download failed (HTTP ${res.statusCode})`));

                        const totalSize = parseInt(res.headers["content-length"] || "0", 10);
                        let downloaded = 0;

                        const tmpPath = filepath + ".tmp";
                        const writeStream = fs.createWriteStream(tmpPath);

                        res.on("data", (chunk) => {
                            downloaded += chunk.length;
                            if (totalSize > 0) {
                                const pct = (downloaded / totalSize) * 100;
                                process.stdout.write(`\rDownloading: ${pct.toFixed(1)}% (${(downloaded / 1e6).toFixed(2)}MB / ${(totalSize / 1e6).toFixed(2)}MB)`);
                            } else {
                                process.stdout.write(`\rDownloading: ${(downloaded / 1e6).toFixed(2)}MB`);
                            }
                        });

                        res.on("end", () => process.stdout.write("\n"));
                        res.on("error", (err) => { fs.unlink(tmpPath, () => reject(err)); });
                        res.pipe(writeStream);

                        writeStream.on("finish", () => {
                            writeStream.close(() => {
                                if (!res.complete) {
                                    fs.unlink(tmpPath, () => {});
                                    return reject(new Error("Incomplete download: connection closed before transfer completed"));
                                }
                                if (totalSize > 0 && downloaded !== totalSize) {
                                    fs.unlink(tmpPath, () => {});
                                    return reject(new Error(`Incomplete download: received ${downloaded} of ${totalSize} bytes`));
                                }
                                fs.rename(tmpPath, filepath, (err) => {
                                    if (err) { fs.unlink(tmpPath, () => {}); return reject(err); }
                                    resolve();
                                });
                            });
                        });

                        writeStream.on("error", (err) => { fs.unlink(tmpPath, () => reject(err)); });
                    });

                    req.setTimeout(30 * 1000, () => { req.abort(); reject(new Error("DOWNLOAD_TIMEOUT")); });
                    req.on("error", (err) => {
                        if (err.code === "ECONNRESET") reject(new Error("DOWNLOAD_TIMEOUT"));
                        else reject(err);
                    });
                };

                startDownload(url);
            });
        }, {
            retries: 3,
            onRetry: (err, attempt) => {
                if (err.message === "DOWNLOAD_TIMEOUT")
                    this.logger.warn(`Download timed out. Retrying attempt ${attempt}...`);
                else
                    this.logger.warn(`Download failed: ${err.message}. Retrying attempt ${attempt}...`);
            },
        });
    }

    sanitizeFilename(name, fallback) {
        if (!name) return fallback;
        return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_").substring(0, 180);
    }

    appendFailEntry(failLogPath, entry) {
        let entries = [];
        if (fs.existsSync(failLogPath)) {
            try { entries = JSON.parse(fs.readFileSync(failLogPath, "utf8")); } catch { }
        }
        entries.push(entry);
        fs.writeFileSync(failLogPath, JSON.stringify(entries, null, 2));
    }

    loadManifest(manifestPath) {
        if (fs.existsSync(manifestPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
                return new Set(Array.isArray(data) ? data : []);
            } catch { }
        }
        return new Set();
    }

    recordManifest(manifestPath, objectId) {
        const ids = this.loadManifest(manifestPath);
        ids.add(objectId);
        fs.writeFileSync(manifestPath, JSON.stringify([...ids], null, 2));
    }

    async processObject(objectId, client, format, offering, targetDir, failedDownloads, failLogPath, manifestPath) {
        this.logger.log(`\n--- Processing ${objectId} ---`);
        const formattedObj = { object_id: objectId };
        let jobId = null;

        try {
            const predictedBase = this.sanitizeFilename(objectId, objectId);
            const existingFile = fs.readdirSync(targetDir).find((f) => {
                const fBase = path.basename(f, path.extname(f));
                const pBase = path.basename(predictedBase, path.extname(predictedBase));
                return fBase === pBase;
            });
            if (existingFile) {
                this.logger.log(`Skipping ${objectId}: file already exists (${existingFile})`);
                this.recordManifest(manifestPath, objectId);
                formattedObj.download_url = "SKIPPED_ALREADY_EXISTS";
                return formattedObj;
            }

            const versionHash = await this.retry(() =>
                this.concerns.FabricObject.latestVersionHash({ objectId })
            );

            let response;
            try {
                response = await this.retry(() =>
                    client.MakeFileServiceRequest({
                        versionHash,
                        path: "/call/media/files",
                        method: "POST",
                        body: { format, offering },
                    })
                );
            } catch (err) {
                throw new Error(`File service request failed for ${objectId}: ${err.message}`);
            }

            jobId = response.job_id;
            this.logger.log(`Started job ${jobId}`);

            let status;
            let lastProgress = -1;
            const noProgressTimeoutMs = 10 * 60 * 1000;
            let lastProgressTime = Date.now();

            do {
                await this.sleep(2000);
                try {
                    status = await this.retry(() =>
                        client.MakeFileServiceRequest({
                            versionHash,
                            path: `/call/media/files/${jobId}`,
                        })
                    );
                } catch (err) {
                    throw new Error(`File service poll failed for job ${jobId} (${objectId}): ${err.message}`);
                }

                const jobStatus = status?.status;
                if (jobStatus === "failed" || jobStatus === "error")
                    throw new Error(`Job ${jobId} failed with status: ${jobStatus}`);

                const progress = status?.progress || 0;
                if (progress !== lastProgress) {
                    process.stdout.write(`\rJob progress: ${progress.toFixed(1)}%`);
                    lastProgress = progress;
                    lastProgressTime = Date.now();
                } else if (Date.now() - lastProgressTime > noProgressTimeoutMs) {
                    throw new Error(`Job ${jobId} stalled — no progress for 10 minutes`);
                }
            } while (status?.status !== "completed");

            process.stdout.write("\n");

            const filename = this.sanitizeFilename(status.filename, `${objectId}.mp4`);
            const outputFile = path.join(targetDir, filename);

            let downloadUrl;
            try {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Download URL generation stalled — no response for 10 minutes")), noProgressTimeoutMs)
                );
                downloadUrl = await Promise.race([
                    this.retry(() =>
                        client.FabricUrl({
                            versionHash,
                            call: `/media/files/${jobId}/download`,
                            service: "files",
                            queryParams: { "header-x_set_content_disposition": `attachment; filename=${filename}` },
                        })
                    ),
                    timeoutPromise,
                ]);
            } catch (err) {
                throw new Error(`Failed to build download URL for ${objectId}: ${err.message}`);
            }

            console.log("downloadUrl:", downloadUrl);
            formattedObj.download_url = downloadUrl;

            if (fs.existsSync(outputFile)) {
                this.logger.log(`Skipping download — file already exists: ${outputFile}`);
                this.recordManifest(manifestPath, objectId);
                return formattedObj;
            }

            this.logger.log(`Downloading → ${outputFile}`);
            await this.downloadFile(downloadUrl, outputFile);

            this.recordManifest(manifestPath, objectId);
            this.logger.log(`✔ Completed: ${outputFile}`);
            return formattedObj;

        } catch (err) {
            this.logger.error(`FAILED: ${objectId} - ${err.message}`);

            const fileServiceUrl = client.FileServiceHttpClient?.uris?.[client.FileServiceHttpClient.uriIndex] || "unknown";
            const failEntry = {
                object_id: objectId,
                job_id: jobId,
                error: err.message,
                file_service_url: fileServiceUrl,
                timestamp: new Date().toISOString(),
            };

            failedDownloads.push(failEntry);

            if (failLogPath) {
                this.appendFailEntry(failLogPath, failEntry);
                this.logger.warn(`Failure recorded → ${failLogPath}`);
            }

            return formattedObj;
        }
    }

    async body() {
        const format = this.args.format || "mp4";
        const offering = this.args.offering || "default";

        const objectIdsPath = path.resolve(this.args.objectIds);
        if (!fs.existsSync(objectIdsPath))
            throw new Error(`Object IDs file not found: ${objectIdsPath}`);

        let objectIds;
        try {
            objectIds = JSON.parse(fs.readFileSync(objectIdsPath, "utf8"));
        } catch (err) {
            throw new Error(`Failed to parse object IDs file: ${err.message}`);
        }

        if (!Array.isArray(objectIds) || objectIds.length === 0)
            throw new Error("Object IDs file must contain a non-empty JSON array of object ID strings");

        this.logger.log(`Loaded ${objectIds.length} object ID(s) from ${objectIdsPath}\n`);

        const client = await this.concerns.Client.get();
        const failedDownloads = [];

        const targetDir = this.args.downloadDir ? path.resolve(this.args.downloadDir) : process.cwd();
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const failLogPath = this.args.failLog ? path.resolve(this.args.failLog) : null;
        if (failLogPath && !fs.existsSync(failLogPath)) {
            fs.writeFileSync(failLogPath, JSON.stringify([], null, 2));
            this.logger.log(`Fail log created: ${failLogPath}`);
        } else if (failLogPath) {
            this.logger.log(`Fail log will append to: ${failLogPath}`);
        }

        const manifestPath = path.join(targetDir, "_manifest.json");
        const downloadedIds = this.loadManifest(manifestPath);

        const alreadyDownloaded = objectIds.filter((id) => downloadedIds.has(id));
        if (alreadyDownloaded.length > 0) {
            this.logger.log(`Skipping ${alreadyDownloaded.length} already downloaded object(s):`);
            for (const id of alreadyDownloaded) this.logger.log(`  - ${id}`);
        }

        const remaining = objectIds.filter((id) => !downloadedIds.has(id));
        this.logger.log(`Starting downloads for ${remaining.length} remaining object(s)\n`);

        const results = [];
        for (const objectId of remaining) {
            const r = await this.processObject(
                objectId,
                client,
                format,
                offering,
                targetDir,
                failedDownloads,
                failLogPath,
                manifestPath
            );
            results.push(r);
        }

        this.logger.log("\n=== SUMMARY ===");
        this.logger.log(`Skipped:    ${alreadyDownloaded.length}`);
        this.logger.log(`Processed:  ${remaining.length}`);
        this.logger.log(`Successful: ${results.length - failedDownloads.length}`);
        this.logger.log(`Failed:     ${failedDownloads.length}`);

        if (failedDownloads.length > 0) {
            this.logger.warn("\n=== FAILED DOWNLOADS ===");
            this.logger.logTable({ list: failedDownloads });
            if (failLogPath) this.logger.warn(`Full failure log: ${failLogPath}`);
        }

        return { results, failedDownloads };
    }
}

if (require.main === module) {
    Utility.cmdLineInvoke(ObjectListDownloadMp4);
} else {
    module.exports = ObjectListDownloadMp4;
}
