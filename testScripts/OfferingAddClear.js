/* eslint-disable no-console */

// Adds DRM-free playout options 'dash-clear' and 'hls-clear' to an existing offering of a mezzanine

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingAddClear extends ScriptOffering {

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

    metadata.offerings[offeringKey].playout.playout_formats["hls-clear"] = {
      drm: null,
      protocol: {
        type: "ProtoHls"
      }
    };

    metadata.offerings[offeringKey].playout.playout_formats["dash-clear"] = {
      drm: null,
      protocol: {
        min_buffer_length: 2,
        type: "ProtoDash"
      }
    };

    await this.metadataWrite(metadata);
  }

  header() {
    return "Adding hls-clear and dash-clear playout format to mezzanine offering '" + this.args.offeringKey + "'... ";
  }

}

const script = new OfferingAddClear;
script.run();