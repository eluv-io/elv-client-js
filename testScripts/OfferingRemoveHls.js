/* eslint-disable no-console */

// Removes HLS playout options from an existing offering of a mezzanine

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingRemoveHls extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;

    let hlsFound = false;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    // loop through playout formats, delete ones where protocol is HLS
    const playoutFormatKeys = Object.keys(metadata.offerings[offeringKey].playout.playout_formats);
    for(let i = 0; i < playoutFormatKeys.length; i++) {
      const key = playoutFormatKeys[i];
      if(metadata.offerings[offeringKey].playout.playout_formats[key].protocol.type === "ProtoHls") {
        console.log("Found HLS playout format '" + key + "', removing...");
        delete metadata.offerings[offeringKey].playout.playout_formats[key];
        hlsFound = true;
      }
    }

    if(hlsFound) {
      await this.metadataWrite(metadata);
    } else {
      console.log("No playout formats found with HLS");
    }
  }

  header() {
    return "Removing playout formats with HLS from mezzanine offering '" + this.args.offeringKey + "'... ";
  }
}

const script = new OfferingRemoveHls;
script.run();