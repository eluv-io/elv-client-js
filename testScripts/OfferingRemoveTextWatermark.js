/* eslint-disable no-console */

const ScriptOffering = require("./parentClasses/ScriptOffering");
const fs = require("fs");

class OfferingRemoveTextWatermark extends ScriptOffering {
    async body() {
        const client = await this.client();

        const libraryId = this.args.libraryId;
        const objectId = this.args.objectId;
        const offeringKey = this.args.offeringKey;

        // client.ToggleLogging(true);

        console.log("Retrieving mezzanine metadata...");

        const metadata = await client.ContentObjectMetadata({libraryId: libraryId, objectId: objectId});

        this.validateOffering(metadata, offeringKey);

        if (metadata.offerings[offeringKey].simple_watermark == null) {
            console.log("No text watermark found for object '" + objectId + "'.")
        } else {
            metadata.offerings[offeringKey].simple_watermark = null;
        }

        console.log("");
        console.log("Writing metadata back to object.");
        const {write_token} = await client.EditContentObject({
            libraryId: libraryId,
            objectId: objectId
        });
        let response = await client.ReplaceMetadata({
            metadata: metadata,
            libraryId: libraryId,
            objectId: objectId,
            writeToken: write_token
        });
        response = await client.FinalizeContentObject({libraryId: libraryId, objectId: objectId, writeToken: write_token});
    }

    header() {
        return "Removing text watermark from object '" + this.args.objectId + "'... ";
    }

    options() {
        return super.options();
    }
}

const script = new OfferingRemoveTextWatermark;
script.run();