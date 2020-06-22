/* eslint-disable no-console */

// Copies an offering from one offering key to another

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingCopy extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const targetOfferingKey = this.args.targetOfferingKey;


    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    metadata.offerings[targetOfferingKey] = metadata.offerings[offeringKey];

    await this.metadataWrite(metadata);
  }

  header() {
    return "Copying offering '" + this.args.offeringKey + "' to '" + this.args.targetOfferingKey + "'... ";
  }

  options() {
    return super.options()
      .option("targetOfferingKey", {
        alias: "target-offering-key",
        demandOption: true,
        describe: "Offering key to copy to",
        type: "string"
      });
  }

}

const script = new OfferingCopy;
script.run();