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
const { execSync } = require("child_process");

class LibraryListObjectsWithDownload extends Utility {
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

    async retry(fn, retries = 3, delay = 1000) {
        let attempt = 0;
        while (attempt < retries) {
            try {
                return await fn();
            } catch (err) {
                attempt++;
                if (attempt >= retries) throw err;

                this.logger.warn(
                    `Retry ${attempt}/${retries} after error: ${err.message}`
                );
                await this.sleep(delay * Math.pow(2, attempt));
            }
        }
    }

    async downloadFile(url, filepath) {
        return this.retry(
            () =>
                execSync(`curl -L --fail -o "${filepath}" "${url}"`, {
                    stdio: "inherit",
                }),
            3,
            1500
        );
    }

    sanitizeFilename(name, fallback) {
        if (!name) return fallback;
        return name
            .replace(/[^a-zA-Z0-9._-]+/g, "_")
            .replace(/_+/g, "_")
            .substring(0, 180); // avoid OS filename length issues
    }

    async processObject(e, client, libraryId, format, offering, targetDir, failedDownloads) {
        const objectId = e.objectId;
        const objectName = R.path(["metadata", "public", "name"], e) || objectId;

        this.logger.log(`\n--- Processing ${objectName} (${objectId}) ---`);

        const formattedObj = { object_id: objectId, name: objectName };

        // Skip existing files
        const existing = fs.readdirSync(targetDir).find((f) => f.includes(objectId));
        if (existing) {
            this.logger.log(`Skipping ${objectName}: already exists (${existing})`);
            formattedObj.download_url = "SKIPPED_ALREADY_EXISTS";
            return formattedObj;
        }

        try {
            // 1. Version hash
            const versionHash = await this.retry(() =>
                this.concerns.FabricObject.latestVersionHash({ libraryId, objectId })
            );

            // 2. Start media job
            const response = await this.retry(() =>
                client.MakeFileServiceRequest({
                    versionHash,
                    path: "/call/media/files",
                    method: "POST",
                    body: { format, offering },
                })
            );

            const jobId = response.job_id;
            this.logger.log(`Started job ${jobId}`);

            // 3. Poll progress
            let status;
            let lastUpdate = -1;

            do {
                await this.sleep(2000);

                status = await this.retry(() =>
                    client.MakeFileServiceRequest({
                        versionHash,
                        path: `/call/media/files/${jobId}`,
                    })
                );

                let progress = status?.progress || 0;
                if (progress !== lastUpdate) {
                    process.stdout.write(`Progress: ${progress.toFixed(1)}%\r`);
                    lastUpdate = progress;
                }
            } while (status?.status !== "completed");

            process.stdout.write("\n");

            // 4. Final filename
            const filename = this.sanitizeFilename(
                status.filename,
                `${objectId}.mp4`
            );
            const outputFile = path.join(targetDir, filename);

            // 5. Build download URL
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

            // 6. Download file
            this.logger.log(`Downloading → ${outputFile}`);
            await this.downloadFile(downloadUrl, outputFile);

            this.logger.log(`✔ Completed: ${outputFile}`);
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

        // --------------------------
        // SEQUENTIAL DOWNLOADS
        // --------------------------
        const results = [];
        for (const obj of objectList) {
            const r = await this.processObject(
                obj,
                client,
                libraryId,
                format,
                offering,
                targetDir,
                failedDownloads
            );
            results.push(r);
        }

        // --------------------------
        // Summary
        // --------------------------
        this.logger.log("\n=== SUMMARY ===");
        this.logger.log(`Processed: ${objectList.length}`);
        this.logger.log(`Successful: ${results.length - failedDownloads.length}`);
        this.logger.log(`Failed: ${failedDownloads.length}`);

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
    Utility.cmdLineInvoke(LibraryListObjectsWithDownload);
} else {
    module.exports = LibraryListObjectsWithDownload;
}
