/* eslint-disable no-console */

const ScriptOffering = require("./parentClasses/ScriptOffering");
const fs = require("fs");
const path = require("path");

class OfferingAddImageWatermark extends ScriptOffering {
    async body() {
        const client = await this.client();

        const libraryId = this.args.libraryId;
        const objectId = this.args.objectId;
        const offeringKey = this.args.offeringKey;
        let copyOffering = this.args.copyOffering;
        const watermarkJsonPath = this.args.watermarkJson;
        const watermarkJson = JSON.parse(fs.readFileSync(watermarkJsonPath));

        // client.ToggleLogging(true);

        console.log("Retrieving mezzanine metadata...");

        let metadata = await client.ContentObjectMetadata({libraryId, objectId});

        // read from metadata top level key 'offerings'
        if (!metadata.offerings) {
            console.log(`top level metadata key "offerings" not found`);
        }

        const offeringExists = metadata.offerings.hasOwnProperty(offeringKey);

        // if the offering doesn't exist, or if --copyOffering was specified, we will be copying from an existing offering
        const copying = (!offeringExists || copyOffering);

        // if we are copying, and no --copyOffering was specified, try to copy from default offering
        if (copying && !copyOffering) {
            copyOffering = "default"
            console.log("Using default offering as template...")
        }

        let targetOffering = null;

        if (copying) {
            // See if copyOffering exists
            if (!metadata.offerings.hasOwnProperty(copyOffering)) {
                console.log(`top level metadata key "offerings" does not contain an offering with key: "` + copyOffering + `"`);
                return
            }
            targetOffering = Object.assign({}, metadata.offerings[copyOffering]);
        } else {
            if (!offeringExists) {
                console.log(`top level metadata key "offerings" does not contain an offering with key: "` + offeringKey + `"`);
                return
            }

            targetOffering = Object.assign({}, metadata.offerings[offeringKey]);
        }

        console.log(offeringKey);
        if (targetOffering.simple_watermark) {
            this.throwError("Offering already has a text watermark, " +
                "currently adding both kinds of watermarks on same offering is not supported. " +
                "Please run OfferingRemoveTextWatermark.js first to remove the text watermark");

        }

        console.log("Adding image watermark file...");
        // if image path is of form "./filename" then look for it and upload it
        const re = new RegExp("^\\./([^/]+)$");
        const match = re.exec(watermarkJson.image);
        let response;

        if (match !== null) {
            const imageFilename = match[1];
            const dir = path.dirname(watermarkJsonPath);
            const imagePath = path.join(dir, imageFilename);
            if (fs.existsSync(imagePath)) {
                console.log("File " + imagePath + " found, uploading to object...")

                const {write_token} = await client.EditContentObject({libraryId, objectId});
                const data = client.utils.BufferToArrayBuffer(fs.readFileSync(imagePath));

                const params = {
                    libraryId,
                    objectId,
                    writeToken: write_token,
                    fileInfo: [{
                        data: data,
                        path: path.basename(imagePath),
                        type: "file",
                        mime_type: "image/*",
                        size: data.byteLength
                    }]
                }
                response = await client.UploadFiles(params);

                console.log("Finalizing object with uploaded file...");
                response = await client.FinalizeContentObject({
                    libraryId,
                    objectId,
                    writeToken: write_token
                });

                console.log("New hash: " + response.hash);
                watermarkJson.image = "/qfab/" + response.hash + "/files/" + path.basename(imagePath);
            }
        }

        targetOffering.image_watermark = watermarkJson;

        metadata.offerings[offeringKey] = targetOffering;

        console.log("Writing metadata back to object...");
        const {write_token} = await client.EditContentObject({libraryId, objectId});

        await client.ReplaceMetadata({
            metadata,
            libraryId,
            objectId,
            writeToken: write_token
        });

        console.log("Finalizing object...");
        await client.FinalizeContentObject({
            libraryId,
            objectId,
            writeToken: write_token
        });
    }

    header() {
        return "Adding image watermark to object '" + this.args.objectId + "'... ";
    }

    footer() {
        return "Done with adding image watermark to object '" + this.args.objectId + "'.";
    }

    options() {
        return super.options()
            .option("watermarkJson", {
                demandOption: true,
                describe: "Path to JSON file specifying watermark contents. \nSample WatermarkJsonFile contents:\n \n    {\n" +
                    "      \"align_h\": \"right\",\n" +
                    "      \"align_v\": \"bottom\",\n" +
                    "      \"image\": \"./logo.png\",\n" +
                    "      \"margin_h\": \"1/20\",\n" +
                    "      \"margin_v\": \"1/10\",\n" +
                    "      \"target_video_height\": 1080\n" +
                    "    }",
                type: "string"
            })
            .option("copyOffering", {
                description: "Specify an existing offering to copy metadata metadata from",
                type: "string"
            })
            .describe("offeringKey", "Offering key to add watermark to (if key does not exist, it will be created, using either 'default' offering as template, or offering identified by --copy-offering option)");
    }
}

const script = new OfferingAddImageWatermark;
script.run();
