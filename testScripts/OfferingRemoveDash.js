/* eslint-disable no-console */

// Removes HLS playout options from an existing offering of a mezzanine

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingRemoveDash extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;

    let dashFound = false;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    // loop through playout formats, delete ones where protocol is Dash
    const playoutFormatKeys = Object.keys(metadata.offerings[offeringKey].playout.playout_formats);
    for(let i = 0; i < playoutFormatKeys.length; i++) {
      const key = playoutFormatKeys[i];
      if(metadata.offerings[offeringKey].playout.playout_formats[key].protocol.type === "ProtoDash") {
        console.log("Found Dash playout format '" + key + "', removing...");
        delete metadata.offerings[offeringKey].playout.playout_formats[key];
        dashFound = true;
      }
    }

    if(dashFound) {
      await this.metadataWrite(metadata);
    } else {
      console.log("No playout formats found with Dash");
    }
  }

  header() {
    return "Removing playout formats with Dash from mezzanine offering '" + this.args.offeringKey + "'... ";
  }
}

const script = new OfferingRemoveDash;
script.run();
