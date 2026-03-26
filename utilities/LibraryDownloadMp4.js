// Utility that accepts a library ID and generates a download URL for each object inside of it
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
                })
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
        const {
            retries = 3,
            delay = 1000,
            onRetry = null
        } = opts;

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
                    if (redirCount > 5) {
                        return reject(new Error("Too many redirects"));
                    }

                    const req = https.get(currentUrl, (res) => {
                        // Handle redirects
                        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                            const nextUrl = res.headers.location.startsWith("http")
                                ? res.headers.location
                                : new URL(res.headers.location, currentUrl).href;

                            this.logger.log(`Redirected → ${nextUrl}`);
                            return startDownload(nextUrl, redirCount + 1);
                        }

                        if (res.statusCode !== 200) {
                            return reject(new Error(`Download failed (HTTP ${res.statusCode})`));
                        }

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

                        res.pipe(writeStream);

                        writeStream.on("finish", () => {
                            writeStream.close(() => {
                                if (totalSize > 0 && downloaded !== totalSize) {
                                    fs.unlink(tmpPath, () => {});
                                    return reject(new Error(
                                        `Incomplete download: received ${downloaded} of ${totalSize} bytes`
                                    ));
                                }
                                fs.rename(tmpPath, filepath, (err) => {
                                    if (err) {
                                        fs.unlink(tmpPath, () => {});
                                        return reject(err);
                                    }
                                    resolve();
                                });
                            });
                        });

                        writeStream.on("error", (err) => {
                            fs.unlink(tmpPath, () => reject(err));
                        });
                    });

                    // -----------------------------
                    // Add timeout here
                    // -----------------------------
                    const timeoutMs = 30 * 1000; // 30 seconds of inactivity
                    req.setTimeout(timeoutMs, () => {
                        req.abort();
                        // Throw a special error for retry logic
                        reject(new Error("DOWNLOAD_TIMEOUT"));
                    });

                    // Handle request errors
                    req.on("error", (err) => {
                        if (err.code === "ECONNRESET") {
                            reject(new Error("DOWNLOAD_TIMEOUT"));
                        } else {
                            reject(err);
                        }
                    });
                };

                // begin download
                startDownload(url);
            });
        }, {
            retries: 3, // retry up to 3 times
            onRetry: (err, attempt) => {
                if (err.message === "DOWNLOAD_TIMEOUT") {
                    this.logger.warn(`Download timed out. Retrying attempt ${attempt}...`);
                } else {
                    this.logger.warn(`Download failed: ${err.message}. Retrying attempt ${attempt}...`);
                }
            }
        });
    }


    sanitizeFilename(name, fallback) {
        if (!name) return fallback;
        return name
            .replace(/[^a-zA-Z0-9._-]+/g, "_")
            .replace(/_+/g, "_")
            .substring(0, 180);
    }

    fatalExit(message, failLogPath, failEntry) {
        this.logger.error(`FATAL: ${message}`);
        if (failLogPath && failEntry) {
            this.appendFailEntry(failLogPath, failEntry);
            this.logger.warn(`Failure recorded → ${failLogPath}`);
        }
        process.exit(1);
    }

    appendFailEntry(failLogPath, entry) {
        let entries = [];
        if (fs.existsSync(failLogPath)) {
            try {
                entries = JSON.parse(fs.readFileSync(failLogPath, "utf8"));
            } catch {
                // If the file is malformed just start fresh
            }
        }
        entries.push(entry);
        fs.writeFileSync(failLogPath, JSON.stringify(entries, null, 2));
    }

    async processObject(e, client, libraryId, format, offering, targetDir, failedDownloads, failLogPath) {
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

        let jobId = null;

        try {
            // Version hash
            const versionHash = await this.retry(() =>
                this.concerns.FabricObject.latestVersionHash({ libraryId, objectId })
            );

            // Start job
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

            // Poll job
            let status;
            let lastProgress = -1;
            const noProgressTimeoutMs = 10 * 60 * 1000; // 10 minutes with no progress
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
                if (jobStatus === "failed" || jobStatus === "error") {
                    throw new Error(`Job ${jobId} failed with status: ${jobStatus}`);
                }

                const progress = status?.progress || 0;
                if (progress !== lastProgress) {
                    process.stdout.write(`\rJob progress: ${progress.toFixed(1)}%`);
                    lastProgress = progress;
                    lastProgressTime = Date.now(); // reset stall timer on any progress
                } else if (Date.now() - lastProgressTime > noProgressTimeoutMs) {
                    throw new Error(`Job ${jobId} stalled — no progress for 10 minutes`);
                }
            } while (status?.status !== "completed");

            process.stdout.write("\n");

            const filename = this.sanitizeFilename(
                status.filename,
                `${objectId}.mp4`
            );

            const outputFile = path.join(targetDir, filename);

            let downloadUrl;
            try {
                const noProgressTimeoutMs = 10 * 60 * 1000;
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Download URL generation stalled — no response for 10 minutes")), noProgressTimeoutMs)
                );
                downloadUrl = await Promise.race([
                    this.retry(() =>
                        client.FabricUrl({
                            versionHash,
                            call: `/media/files/${jobId}/download`,
                            service: "files",
                            queryParams: {
                                "header-x_set_content_disposition": `attachment; filename=${filename}`,
                            },
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
                this.logger.log(`Skipping ${objectName}: already exists (${filename})`);
                return formattedObj;
            }

            // NOW using HTTPS downloader
            this.logger.log(`Downloading → ${outputFile}`);
            await this.downloadFile(downloadUrl, outputFile);

            this.logger.log(`✔ Completed: ${outputFile}`);
            return formattedObj;

        } catch (err) {
            this.logger.error(`FAILED: ${objectId} - ${err.message}`);

            const fileServiceUrl = client.FileServiceHttpClient?.uris?.[client.FileServiceHttpClient.uriIndex] || "unknown";

            const failEntry = {
                object_id: objectId,
                name: objectName,
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
        const libraryId = this.args.libraryId;
        const format = this.args.format || "mp4";
        const offering = this.args.offering || "default";

        const filter =
            this.args.filter &&
            this.concerns.JSON.parseStringOrFile({ strOrPath: this.args.filter });

        if (!this.args.fields) this.args.fields = [];

        const select = ["/public/name", ...this.args.fields];

        let objectList = await this.concerns.ArgLibraryId.libObjectList({
            filterOptions: { select, filter },
        });

        this.logger.log(`Found ${objectList.length} object(s)\n`);

        const client = await this.concerns.Client.get();
        const failedDownloads = [];

        const targetDir = this.args.downloadDir
            ? path.resolve(this.args.downloadDir)
            : process.cwd();

        if (!fs.existsSync(targetDir))
            fs.mkdirSync(targetDir, { recursive: true });

        // Ensure fail log file exists with a valid JSON array — never overwrite existing entries
        const failLogPath = this.args.failLog ? path.resolve(this.args.failLog) : null;
        if (failLogPath && !fs.existsSync(failLogPath)) {
            fs.writeFileSync(failLogPath, JSON.stringify([], null, 2));
            this.logger.log(`Fail log created: ${failLogPath}`);
        } else if (failLogPath) {
            this.logger.log(`Fail log will append to: ${failLogPath}`);
        }

        // Sequential downloads
        const results = [];
        for (const obj of objectList) {
            const r = await this.processObject(
                obj,
                client,
                libraryId,
                format,
                offering,
                targetDir,
                failedDownloads,
                failLogPath
            );
            results.push(r);
        }

        // Summary
        this.logger.log("\n=== SUMMARY ===");
        this.logger.log(`Processed:  ${objectList.length}`);
        this.logger.log(`Successful: ${results.length - failedDownloads.length}`);
        this.logger.log(`Failed:     ${failedDownloads.length}`);

        if (failedDownloads.length > 0) {
            this.logger.warn("\n=== FAILED DOWNLOADS ===");
            this.logger.logTable({ list: failedDownloads });

            if (failLogPath) {
                this.logger.warn(`Full failure log: ${failLogPath}`);
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
