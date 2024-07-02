/* eslint-disable no-console */

// Ensures that an existing offering has only strong DRM playout options (FairPlay, PlayReady, and Widevine)

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingEnsureStrongDrm extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const force = this.args.force;

    let changesMade = false;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    // if offering has store_clear: false, abort
    if(metadata.offerings[offeringKey].store_clear) {
      if(force){
        console.warn("WARNING: Offering '" + offeringKey + "' has 'store_clear' set to true, this is insecure! Proceeding anyway due to --force being specified...");
      } else {
        this.throwError("Offering '" + offeringKey + "' has 'store_clear' set to true. Use --force to execute command anyway.");
      }
    }

    if(metadata.offerings[offeringKey].drm_optional) {
      console.log("Offering '" + offeringKey + "' has 'drm_optional' set to true: changing to false...");
      metadata.offerings[offeringKey].drm_optional = false;
      changesMade = true;
    }


    // loop through playout formats, delete ones where drm is null or is weak
    const playoutFormatKeys = Object.keys(metadata.offerings[offeringKey].playout.playout_formats);
    const originalFormatCount = playoutFormatKeys.length;
    if(originalFormatCount === 0){
      this.throwError("Offering '" + offeringKey + "' has no playout formats.");
    }

    for(let i = 0; i < originalFormatCount; i++) {
      const key = playoutFormatKeys[i];
      const drm = metadata.offerings[offeringKey].playout.playout_formats[key].drm;
      if(!drm || !["DrmWidevine", "DrmFairplay", "DrmPlayReady"].includes(drm.type)) {
        console.log("Deleting playout format '" + key + "'...");
        delete metadata.offerings[offeringKey].playout.playout_formats[key];
        changesMade = true;
      }
    }

    const newFormatCount = Object.keys(metadata.offerings[offeringKey].playout.playout_formats).length;
    if(newFormatCount === 0) {
      this.throwError("Offering '" + offeringKey + "' would have no playout formats remaining after this operation.");
    }

    if(changesMade) {
      console.log(newFormatCount + " playout format(s) remaining after operation.");
      await this.metadataWrite(metadata);
    } else {
      console.log("No playout formats removed.");
    }
  }

  header() {
    return "Removing playout formats with weak (or no) DRM from mezzanine offering '" + this.args.offeringKey + "'... ";
  }

  options() {
    return super.options()
      .option("force", {
        describe: "Force operation, even if 'store_clear' is set to 'true'",
        type: "boolean"
      });
  }
}

const script = new OfferingEnsureStrongDrm;
script.run();
