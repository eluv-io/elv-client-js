// Iterates over every object in a library, finds the highest-bitrate video
// representation in the default offering, and writes a JSON file containing
// the download URL and ready-to-run curl command for each object.
// The output JSON is the input format consumed by BatchDownloadFromJson.js.


const R = require("ramda");
const { ModOpt, NewOpt } = require("./lib/options");
const Utility = require("./lib/Utility");
const JSONConcern = require("./lib/concerns/JSON");
const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const FabricObject = require("./lib/concerns/FabricObject");
const fs = require("fs");
const path = require("path");

class LibraryGenerateCurlUrls extends Utility {
    blueprint() {
        return {
            concerns: [JSONConcern, ArgLibraryId, FabricObject],
            options: [
                ModOpt("libraryId", { demand: true }),
                NewOpt("offering", {
                    default: "default",
                    descTemplate: "Offering name to inspect for video representations (default: default)",
                    type: "string",
                }),
                NewOpt("outfile", {
                    descTemplate: "Path to write the output JSON file (default: curl_urls.json)",
                    normalize: true,
                    type: "string",
                }),
                NewOpt("filter", {
                    descTemplate:
                        "JSON expression (or path to JSON file if starting with '@') to filter objects by (public) metadata",
                    type: "string",
                }),
            ],
        };
    }

    header() {
        return `Generate curl download URLs for all objects in library ${this.args.libraryId}`;
    }

    sanitizeFilename(name, fallback) {
        if (!name) return fallback;
        return name
            .replace(/[^a-zA-Z0-9._-]+/g, "_")
            .replace(/_+/g, "_")
            .substring(0, 180);
    }

    // Pick the video representation with the highest bitrate from the offering streams.
    // Returns { streamKey, repKey } or null if no video rep is found.
    bestVideoRep(streams) {
        let best = null;
        let bestBitrate = -1;

        for (const [streamKey, stream] of Object.entries(streams || {})) {
            const reps = stream?.representations;
            if (!reps || typeof reps !== "object") continue;

            for (const repKey of Object.keys(reps)) {
                // Video rep keys contain a resolution (e.g. 1920x1080); audio keys don't.
                if (!/\d+x\d+/.test(repKey)) continue;

                // Parse bitrate from the trailing @<number> suffix.
                const bitrateMatch = repKey.match(/@(\d+)$/);
                const bitrate = bitrateMatch ? parseInt(bitrateMatch[1], 10) : 0;

                if (bitrate > bestBitrate) {
                    bestBitrate = bitrate;
                    best = { streamKey, repKey };
                }
            }
        }

        return best;
    }

    async body() {
        const { libraryId, offering = "default" } = this.args;

        const filter =
            this.args.filter &&
            this.concerns.JSON.parseStringOrFile({ strOrPath: this.args.filter });

        const objectList = await this.concerns.ArgLibraryId.libObjectList({
            filterOptions: { select: ["/public/name"], filter },
        });

        this.logger.log(`Found ${objectList.length} object(s)\n`);

        const client = await this.concerns.Client.get();
        const results = [];

        for (const e of objectList) {
            const objectId = e.objectId;
            const objectName = R.path(["metadata", "public", "name"], e) || objectId;

            this.logger.log(`Processing: ${objectName} (${objectId})`);

            try {
                const versionHash = await this.concerns.FabricObject.latestVersionHash({
                    libraryId,
                    objectId,
                });

                const streams = await client.ContentObjectMetadata({
                    versionHash,
                    metadataSubtree: `/offerings/${offering}/playout/streams`,
                });

                const match = this.bestVideoRep(streams);

                if (!match) {
                    this.logger.warn(`  No video representations found`);
                    results.push({ object_id: objectId, name: objectName, error: "No video representations found" });
                    continue;
                }

                const { streamKey, repKey } = match;
                const fullRepKey = `${streamKey}${repKey}`;
                const filename = this.sanitizeFilename(objectName, objectId) + ".mp4";

                // Build a URL without an auth token — BatchDownloadFromJson injects a fresh
                // token at download time, and the curl field leaves the Bearer value empty
                // for the same reason.
                // --node can be a bare hostname or a full URL
                const nodeArg = this.args.node;
                const baseUri = nodeArg
                    ? (/^https?:\/\//i.test(nodeArg) ? nodeArg : `https://${nodeArg}`).replace(/\/$/, "")
                    : client.HttpClient.BaseURI().toString().replace(/\/$/, "");
                const downloadUrl = `${baseUri}/q/${versionHash}/rep/media_download/${offering}/${fullRepKey}`;

                const curlCmd = `curl -o "${filename}" "${downloadUrl}" -H "Authorization: Bearer "`;

                results.push({
                    object_id: objectId,
                    name: objectName,
                    version_hash: versionHash,
                    representation: fullRepKey,
                    filename,
                    download_url: downloadUrl,
                    curl: curlCmd,
                });

                this.logger.log(`  ✔ ${fullRepKey}`);
            } catch (err) {
                this.logger.error(`  ✘ ${objectId}: ${err.message}`);
                results.push({ object_id: objectId, name: objectName, error: err.message });
            }
        }

        const outfile = path.resolve(this.args.outfile || "curl_urls.json");
        fs.writeFileSync(outfile, JSON.stringify(results, null, 2));

        const succeeded = results.filter(r => !r.error).length;
        const failed = results.filter(r => r.error).length;

        this.logger.log(`\nOutput written to: ${outfile}`);
        this.logger.log("\n=== SUMMARY ===");
        this.logger.log(`Total:    ${results.length}`);
        this.logger.log(`Success:  ${succeeded}`);
        this.logger.log(`Failed:   ${failed}`);

        return results;
    }
}

if (require.main === module) {
    Utility.cmdLineInvoke(LibraryGenerateCurlUrls);
} else {
    module.exports = LibraryGenerateCurlUrls;
}
