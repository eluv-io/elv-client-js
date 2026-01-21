// Utility that accepts an object ID and generates a download URL

const { NewOpt } = require("./lib/options");
const Utility = require("./lib/Utility");
const path = require("path");
const fs = require("fs");
const https = require("https");

const ArgOutfile = require("./lib/concerns/ArgOutfile");
const ExistObj = require("./lib/concerns/ExistObj");
const FabricObject = require("./lib/concerns/FabricObject");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const sanitizeFilename = (name, fallback) => {
  if (!name) return fallback;
  return name
    .replace(/\s+/g, "_")
    .replace(/\//g, "_")
    .replace(/ - /g, "-")
};

class ObjectDownloadFile extends Utility {
  blueprint() {
    return {
      concerns: [ArgOutfile, ExistObj, FabricObject],
      options: [
        NewOpt("versionHash", {
          descTemplate: "specific versionHash to download (optional)",
          type: "string"
        }),
        NewOpt("offering", {
          descTemplate: "Offering name to use, defaults to 'default'",
          type: "string"
        }),
        NewOpt("format", {
          descTemplate: "Format to request (default mp4)",
          type: "string"
        }),
        NewOpt("downloadDir", {
          descTemplate: "Directory to save downloaded file",
          type: "string"
        })
      ]
    };
  }

  header() {
    return `Download file for object ${this.args.objectId}`;
  }

  async body() {
    const { libraryId, objectId } = await this.concerns.ExistObj.argsProc();
    const client = await this.concerns.Client.get();

    // -----------------------
    // Determine versionHash
    // -----------------------
    const versionHash = await this.concerns.FabricObject.latestVersionHash({
      libraryId,
      objectId
    });

    const offeringName = this.args.offering || "default";
    const format = this.args.format || "mp4";

    try {
      // Start media download job
      const response = await client.MakeFileServiceRequest({
        versionHash,
        path: "/call/media/files",
        method: "POST",
        body: {
          format,
          offering: offeringName
        }
      });

      const jobId = response.job_id;

      // Poll job progress
      let status;
      do {
        await sleep(2000);
        status = await client.MakeFileServiceRequest({
          versionHash,
          path: `/call/media/files/${jobId}`
        });

        this.logger.log(`${(status?.progress || 0).toFixed(1)} / 100`);
      } while (status?.status !== "completed");

      // Clean filename
      const filename = sanitizeFilename(status.filename, "file_download");

      // Build download URL
      const downloadUrl = await client.FabricUrl({
        versionHash,
        call: `/media/files/${jobId}/download`,
        service: "files",
        queryParams: {
          "header-x_set_content_disposition": `attachment; filename=${filename}`
        }
      });

      const output = {
        libraryId,
        objectId,
        versionHash,
        jobId,
        filename,
        downloadUrl
      };

      // Display
      this.logger.log("\n=== Download Info ===\n");
      this.logger.logTable([{
        "Version Hash": output.versionHash,
        "Filename": output.filename
      }]);
      this.logger.log("Download URL:\n", output.downloadUrl, "\n");

      // -----------------------
      // HTTPS download with progress bar
      // -----------------------
      if (downloadUrl) {

        const targetDir = this.args.downloadDir
          ? path.resolve(this.args.downloadDir)
          : process.cwd();

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const outputFile = path.join(targetDir, output.filename || "download.mp4");

        this.logger.log(`Downloading via https → ${outputFile}\n`);

        const downloadFile = (url, dest, attempt = 5) => {
          return new Promise((resolve, reject) => {
            https.get(url, (res) => {

              // Handle Redirects
              if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const newUrl = res.headers.location.startsWith("http")
                  ? res.headers.location
                  : new URL(res.headers.location, url).href;

                this.logger.log(`Redirected → ${newUrl}`);
                return resolve(downloadFile(newUrl, dest, attempt + 1));
              }

              if (res.statusCode !== 200) {
                return reject(new Error(`Download failed (HTTP ${res.statusCode})`));
              }

              const totalSize = parseInt(res.headers["content-length"] || "0", 10);
              let downloaded = 0;

              const writeStream = fs.createWriteStream(dest);

              // Progress bar
              res.on("data", chunk => {
                downloaded += chunk.length;

                if (totalSize > 0) {
                  const percent = (downloaded / totalSize) * 100;
                  const mbDownloaded = (downloaded / (1024 * 1024)).toFixed(2);
                  const mbTotal = (totalSize / (1024 * 1024)).toFixed(2);

                  const barLength = 30;
                  const filledBar = Math.round((percent / 100) * barLength);
                  const bar = "█".repeat(filledBar) + "░".repeat(barLength - filledBar);

                  process.stdout.write(
                    `\r${bar} ${percent.toFixed(1)}%  (${mbDownloaded} MB / ${mbTotal} MB)`
                  );
                } else {
                  process.stdout.write(`\rDownloaded ${(downloaded / (1024 * 1024)).toFixed(2)} MB`);
                }
              });

              res.on("end", () => {
                process.stdout.write("\n");
              });

              res.pipe(writeStream);

              writeStream.on("finish", () => {
                writeStream.close(() => resolve());
              });

              writeStream.on("error", (err) => {
                fs.unlink(dest, () => reject(err));
              });

            }).on("error", (err) => {
              reject(err);
            });
          });
        };

        try {
          await downloadFile(downloadUrl, outputFile);
          this.logger.log(`\nDownload complete: ${outputFile}`);
        } catch (err) {
          this.logger.error("\nHTTPS download failed:", err.message);
        }
      }

      // -----------------------
      // Outfile support
      // -----------------------
      if (this.args.outfile) {
        if (this.args.json) {
          this.concerns.ArgOutfile.writeJson({ obj: output });
        } else {
          this.concerns.ArgOutfile.writeTable({ list: [output] });
        }
      }

    } catch (error) {
      this.logger.error(error);
      this.logger.error(JSON.stringify(error, null, 2));
      throw error;
    }
  }
}

if (require.main === module) {
  Utility.cmdLineInvoke(ObjectDownloadFile);
} else {
  module.exports = ObjectDownloadFile;
}