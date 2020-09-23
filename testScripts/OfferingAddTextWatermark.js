/* eslint-disable no-console */

const ScriptOffering = require("./parentClasses/ScriptOffering");
const fs = require("fs");

class OfferingAddTextWatermark extends ScriptOffering {
  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const watermarkJsonPath = this.args.watermarkJson;
    const watermarkJson = JSON.parse(fs.readFileSync(watermarkJsonPath));

    // client.ToggleLogging(true);

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    console.log("Retrieving mezzanine metadata...");

    const metadata = await client.ContentObjectMetadata({libraryId: libraryId, objectId: objectId});

    // read from metadata top level key 'offerings'
    if(!metadata.offerings) {
      console.log("top level metadata key \"offerings\" not found");
    }

    if(!metadata.offerings[offeringKey]) {
      console.log("top level metadata key \"offerings\" does not contain a \"" + offeringKey + "\" offering");
    }

    metadata.offerings[offeringKey].simple_watermark = watermarkJson;
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
    return "Adding text watermark to object '" + this.args.objectId + "'... ";
  }

  footer() {
    return "Done with adding text watermark to object '" + this.args.objectId + "'.";
  }

  options() {
    return super.options()
      .option("watermarkJson", {
        demandOption: true,
        describe: "Path to JSON file specifying watermark contents. \nSample WatermarkJsonFile contents:\n \n    {\n      \"font_color\": \"white@0.5\",\n      \"font_relative_height\": 0.05,\n      \"shadow\": true,\n      \"shadow_color\": \"black@0.5\",\n      \"template\": \"DO NOT DISTRIBUTE\",\n      \"x\": \"(w-tw)/2\",\n      \"y\": \"h-(2*lh)\"\n    }",
        type: "string"
      });
  }
}

const script = new OfferingAddTextWatermark;
script.run();