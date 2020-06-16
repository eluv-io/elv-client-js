/* eslint-disable no-console */

// Removes DRM-free playout options from an existing offering of a mezzanine

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingRemoveClear extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;

    let clearFound = false;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    // loop through playout formats, delete ones where drm is null
    const playoutFormatKeys = Object.keys(metadata.offerings[offeringKey].playout.playout_formats);
    for(let i = 0; i < playoutFormatKeys.length; i++) {
      const key = playoutFormatKeys[i];
      if(!metadata.offerings[offeringKey].playout.playout_formats[key].drm) {
        console.log("Found clear playout format '" + key + "', removing...");
        delete metadata.offerings[offeringKey].playout.playout_formats[key];
        clearFound = true;
      }
    }

    if(clearFound) {
      await this.metadataWrite(metadata);
    } else {
      console.log("No playout formats found with {drm: null}");
    }
  }

  header() {
    return "Removing playout formats with {drm: null} from mezzanine offering '" + this.args.offeringKey + "'... ";
  }
}

const script = new OfferingRemoveClear;
script.run();