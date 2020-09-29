/* eslint-disable no-console */

// Adds HLS Fairplay DRM playout option to the default offering of a mezzanine that already has HLS Sample-AES playout option
// (the new Fairplay option will use the same keys as the existing Sample-AES option)

// Note that this script depends on the AES-128 playout_format having the key 'hls-sample-aes'
// It does not actually check the contents stored under that playout_format key

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingAddHlsFairplay extends ScriptOffering {
  async body() {
    const client = await this.client();
    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    // make sure key '/offerings/OFFERING_KEY/playout/playout_formats/hls-sample-aes' exists
    if(!metadata.offerings[offeringKey].playout.playout_formats.hasOwnProperty("hls-sample-aes")) {
      this.throwError("Offering '" + offeringKey + "' does not contain playout_format 'hls-sample-aes'");
    }

    // make sure 'hls-fairplay' does not exist already
    if(metadata.offerings[offeringKey].playout.playout_formats.hasOwnProperty("hls-fairplay")) {
      this.throwError("Offering '" + offeringKey + "' already has playout_format 'hls-fairplay'");
    }

    console.log("Playout format 'hls-sample-aes' found, using same keys under enc scheme 'cbcs' to create hls-fairplay playout format...");

    metadata.offerings[offeringKey].playout.playout_formats["hls-fairplay"] = {
      drm: {
        enc_scheme_name: "cbcs",
        license_servers: [],
        type: "DrmFairplay"
      },
      protocol: {
        type: "ProtoHls"
      }
    };

    await this.metadataWrite(metadata);
  }

  header() {
    return "Adding HLS Fairplay DRM playout_format to mezzanine offering '" + this.args.offeringKey + "'... ";
  }

}

const script = new OfferingAddHlsFairplay;

script.run();