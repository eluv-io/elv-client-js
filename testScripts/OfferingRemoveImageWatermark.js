/* eslint-disable no-console */

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingRemoveImageWatermark extends ScriptOffering {
  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;

    // client.ToggleLogging(true);

    console.log("Retrieving mezzanine metadata...");

    let metadata = await client.ContentObjectMetadata({libraryId, objectId});

    this.validateOffering(metadata, offeringKey);

    const targetOffering = metadata.offerings[offeringKey];
    if(targetOffering.image_watermark == null) {
      this.throwError("No image watermark found for object '" + objectId + "'.");
    } else {
      targetOffering.image_watermark = null;
    }

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
    return "Removing image watermark from object '" + this.args.objectId + "'... ";
  }

}

const script = new OfferingRemoveImageWatermark;
script.run();