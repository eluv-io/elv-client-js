const fs = require("fs");
const https = require("https");

/**
 * Download a file over HTTPS with redirect handling and progress reporting.
 *
 * @param {Object} params
 * @param {string} params.url - Initial download URL
 * @param {string} params.dest - Destination file path
 * @param {Object} [params.logger=console] - Logger with log/error methods
 * @param {number} [params.maxRedirects=5] - Maximum redirect depth
 * @returns {Promise<void>}
 */
const DownloadFile = ({
  url,
  dest,
  logger = console,
  maxRedirects = 5
}) => {
  const download = (currentUrl, redirects = 0) =>
    new Promise((resolve, reject) => {
      if (redirects > maxRedirects) {
        return reject(new Error("Too many redirects"));
      }

      https.get(currentUrl, res => {

        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const nextUrl = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, currentUrl).href;

          logger.log(`Redirected → ${nextUrl}`);
          return resolve(download(nextUrl, redirects + 1));
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed (HTTP ${res.statusCode})`));
        }

        const totalSize = parseInt(res.headers["content-length"] || "0", 10);
        let downloaded = 0;

        const writeStream = fs.createWriteStream(dest);

        // Progress reporting
        res.on("data", chunk => {
          downloaded += chunk.length;

          if (totalSize > 0) {
            const percent = (downloaded / totalSize) * 100;
            const mbDownloaded = (downloaded / (1024 * 1024)).toFixed(2);
            const mbTotal = (totalSize / (1024 * 1024)).toFixed(2);

            const barLength = 30;
            const filled = Math.round((percent / 100) * barLength);
            const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

            process.stdout.write(
              `\r${bar} ${percent.toFixed(1)}%  (${mbDownloaded} MB / ${mbTotal} MB)`
            );
          } else {
            process.stdout.write(
              `\rDownloaded ${(downloaded / (1024 * 1024)).toFixed(2)} MB`
            );
          }
        });

        res.on("end", () => process.stdout.write("\n"));

        res.pipe(writeStream);

        writeStream.on("finish", () => {
          writeStream.close(resolve);
        });

        writeStream.on("error", err => {
          fs.unlink(dest, () => reject(err));
        });

      }).on("error", reject);
    });

  return download(url);
};

module.exports = DownloadFile;
