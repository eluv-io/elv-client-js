/* eslint-disable no-console */

// Removes DRM playout options from an existing offering of a mezzanine

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingRemoveDrm extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;

    let drmFound = false;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    // loop through playout formats, delete ones where drm is not null
    const playoutFormatKeys = Object.keys(metadata.offerings[offeringKey].playout.playout_formats);
    for(let i = 0; i < playoutFormatKeys.length; i++) {
      const key = playoutFormatKeys[i];
      if(metadata.offerings[offeringKey].playout.playout_formats[key].drm) {
        console.log("Found DRM playout format '" + key + "', removing...");
        delete metadata.offerings[offeringKey].playout.playout_formats[key];
        drmFound = true;
      }
    }

    if(drmFound) {
      // also delete drm keys
      delete metadata.offerings[offeringKey].playout.drm_keys;
      await this.metadataWrite(metadata);
    } else {
      console.log("No playout formats found with DRM");
    }
  }

  header() {
    return "Removing playout formats with DRM from mezzanine offering '" + this.args.offeringKey + "'... ";
  }
}

const script = new OfferingRemoveDrm;
script.run();