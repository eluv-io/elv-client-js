// Utility that accepts a library ID and generates a download URL for each object inside of it

const R = require("ramda");
const { ModOpt, NewOpt } = require("./lib/options");
const Utility = require("./lib/Utility");

const { PublicMetadataPathArrayModel } = require("./lib/models/PublicMetadataPath");

const JSON = require("./lib/concerns/JSON");
const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const Metadata = require("./lib/concerns/Metadata");
const FabricObject = require("./lib/concerns/FabricObject");

class LibraryListObjectsWithDownload extends Utility {
    blueprint() {
        return {
            concerns: [JSON, ArgLibraryId, Metadata, FabricObject],
            options: [
                ModOpt("libraryId", { demand: true }),
                NewOpt("filter", {
                    descTemplate: "JSON expression (or path to JSON file if starting with '@') to filter objects by (public) metadata",
                    type: "string"
                }),
                NewOpt("date", {
                    descTemplate: "include latest commit date/time if available",
                    type: "boolean"
                }),
                NewOpt("fields", {
                    coerce: PublicMetadataPathArrayModel,
                    descTemplate: "Path(s) for additional metadata values to include (each must start with /public/)",
                    string: true,
                    type: "array"
                }),
                NewOpt("hash", {
                    descTemplate: "include latest version hash",
                    type: "boolean"
                }),
                NewOpt("name", {
                    descTemplate: "include object name if available",
                    type: "boolean"
                }),
                NewOpt("size", {
                    descTemplate: "include object total size",
                    type: "boolean"
                }),
                NewOpt("offering", {
                    descTemplate: "Offering name for download URL",
                    type: "string"
                }),
                NewOpt("format", {
                    descTemplate: "Format for download URL (default mp4)",
                    type: "string"
                })
            ]
        };
    }

    header() {
        return `List objects and generate download URLs in library ${this.args.libraryId}`;
    }

    async body() {
        const libraryId = this.args.libraryId;
        const format = this.args.format || "mp4";
        const offering = this.args.offering || "default";

        const filter = this.args.filter && this.concerns.JSON.parseStringOrFile({ strOrPath: this.args.filter });
        if (!this.args.fields) this.args.fields = [];

        const select = ["/public/name", ...this.args.fields];

        // Get object list
        let objectList = await this.concerns.ArgLibraryId.libObjectList({
            filterOptions: { select, filter }
        });

        const formattedObjList = [];
        this.logger.log(`Found ${objectList.length} object(s) in library ${libraryId}\n`);

        const client = await this.concerns.Client.get();

        for (const e of objectList) {
            const objectId = e.objectId;
            const objectName = R.path(["metadata", "public", "name"], e) || objectId;

            this.logger.log(`=== Processing object: ${objectName} (${objectId}) ===`);

            const formattedObj = { object_id: objectId, name: objectName };

            if (this.args.hash) formattedObj.latest_hash = e.latestHash;

            // Additional metadata fields
            for (const field of this.args.fields) {
                const metaPath = field.split("/").slice(1);
                const label = metaPath.slice(1).join("/");
                formattedObj[label] = R.path(["metadata", ...metaPath], e);
            }

            if (this.args.date) {
                const commitInfo = await this.concerns.Metadata.commitInfo({ libraryId, objectId });
                formattedObj.commit_date = commitInfo?.timestamp;
            }

            if (this.args.size) {
                formattedObj.size = await this.concerns.FabricObject.size({ libraryId, objectId });
            }

            // ---------------------------
            // Start media download job and track progress
            // ---------------------------
            try {
                const versionHash = await this.concerns.FabricObject.latestVersionHash({ libraryId, objectId });

                // Start the download job
                const response = await client.MakeFileServiceRequest({
                    versionHash,
                    path: "/call/media/files",
                    method: "POST",
                    body: { format, offering }
                });

                const jobId = response.job_id;

                this.logger.log(`Started download job ${jobId} for ${objectName}`);

                // Poll job progress
                let status;
                do {
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    status = await client.MakeFileServiceRequest({
                        versionHash,
                        path: `/call/media/files/${jobId}`
                    });

                    process.stdout.write(`Progress: ${(status?.progress || 0).toFixed(1)} / 100\r`);
                } while (status?.status !== "completed");

                process.stdout.write("\n"); // move to next line after job completes

                // Clean filename
                const filename = status.filename
                    ?.replace(/\s+/g, "_")
                    .replace(/\//g, "_")
                    .replace(/ - /g, "-");

                // Generate download URL
                const downloadUrl = await client.FabricUrl({
                    versionHash,
                    call: `/media/files/${jobId}/download`,
                    service: "files",
                    queryParams: {
                        "header-x_set_content_disposition": `attachment; filename=${filename}`
                    }
                });

                formattedObj.download_url = downloadUrl;

                this.logger.log(`Download URL ready for ${objectName}: ${downloadUrl}\n`);
            } catch (err) {
                this.logger.warn(`Failed to generate download URL for ${objectId}: ${err.message}\n`);
                formattedObj.download_url = null;
            }

            formattedObjList.push(formattedObj);
        }

        //   // Final output table
        //   this.logger.data("object_list", formattedObjList);
        //   this.logger.logTable({ list: formattedObjList });

        //   if (formattedObjList.length === 0) {
        //     this.logger.warn("No visible objects found using supplied private key.");
        //   }

        //   return formattedObjList; // return full array for further processing
    }
}

if (require.main === module) {
    Utility.cmdLineInvoke(LibraryListObjectsWithDownload);
} else {
    module.exports = LibraryListObjectsWithDownload;
}
