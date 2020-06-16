/* eslint-disable no-console */

// Adds HLS SampleAES DRM playout option to the default offering of a mezzanine that already has HLS AES-128 playout option
// (the new SampleAES option will use the same keys as the existing AES-128 option)

// Note that this script depends on the AES-128 playout_format having the key 'hls-aes128'
// It does not actually check the contents stored under that playout_format key

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingAddSampleAes extends ScriptOffering {
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

    // make sure key '/offerings/OFFERING_KEY/playout/playout_formats/hls-aes128' exists
    if(!metadata.offerings[offeringKey].playout.playout_formats.hasOwnProperty("hls-aes128")) {
      throw new Error("Offering '" + offeringKey + "' does not contain playout_format 'hls-aes128'");
    }

    // make sure 'hls-sample-aes' does not exist already
    if(metadata.offerings[offeringKey].playout.playout_formats.hasOwnProperty("hls-sample-aes")) {
      throw new Error("Offering '" + offeringKey + "' already has playout_format 'hls-sample-aes'");
    }

    console.log("Playout format 'hls-aes128' found, using as basis to create hls-sample-aes playout format...");

    metadata.offerings[offeringKey].playout.playout_formats["hls-sample-aes"] = {
      drm: {
        enc_scheme_name: "cbcs",
        type: "DrmSampleAes"
      },
      protocol: {
        type: "ProtoHls"
      }
    };

    // loop through streams, add 'cbcs' encryption scheme to each, copying keys from 'aes-128'
    const streamKeys = Object.keys(metadata.offerings[offeringKey].playout.streams);
    for(let i = 0; i < streamKeys.length; i++) {
      const streamKey = streamKeys[i];
      const stream = metadata.offerings[offeringKey].playout.streams[streamKey];
      if(stream.encryption_schemes.hasOwnProperty("aes-128")) {
        let new_enc_scheme = Object.assign({}, stream.encryption_schemes["aes-128"]);
        new_enc_scheme.type = "EncSchemeCbcs";
        stream.encryption_schemes["cbcs"] = new_enc_scheme;
      } else {
        console.log("Stream '" + streamKey + "' has no encryption_scheme 'aes-128', skipping...");
      }
    }

    await this.metadataWrite(metdata);
  }

  header() {
    return "Adding HLS SampleAes DRM  playout_format to mezzanine offering '" + this.args.offeringKey + "'... ";
  }

}

const script = new OfferingAddSampleAes;
script.run();