// Utility that accepts an object ID and generates a download URL

const { NewOpt } = require("./lib/options");
const Utility = require("./lib/Utility");
const path = require("path");
const fs = require("fs");
const https = require("https");

const ArgOutfile = require("./lib/concerns/ArgOutfile");
const ExistObj = require("./lib/concerns/ExistObj");
const FabricObject = require("./lib/concerns/FabricObject");
const DownloadFile = require("./lib/downloadFile");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const sanitizeFilename = (name, fallback) => {
  if (!name) return fallback;
  return name
    .replace(/\s+/g, "_")
    .replace(/\//g, "_")
    .replace(/ - /g, "-")
};

class MezDownloadMp4 extends Utility {
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

        try {
          await DownloadFile({
            url: downloadUrl,
            dest: outputFile,
            logger: this.logger,
            maxRedirects: 5,
          });

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
  Utility.cmdLineInvoke(MezDownloadMp4);
} else {
  module.exports = MezDownloadMp4;
}