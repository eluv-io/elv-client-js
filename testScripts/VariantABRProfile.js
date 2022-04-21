/* eslint-disable no-console */


const ScriptVariant = require("./parentClasses/ScriptVariant");
const ABR = require("@eluvio/elv-abr-profile");

class VariantABRProfile extends ScriptVariant {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;

    // get media info from production master
    const masterMetadata = await client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: "/production_master"
    });

    // adapt ABR Profile to production master's video properties
    const generatedProfile = ABR.ABRProfileForVariant(
      masterMetadata.sources,
      masterMetadata.variants.default
    );

    if(!generatedProfile.ok) {
      console.error("Error generating ABR Profile:\n" + generatedProfile.errors.join("\n"));
    } else {
      console.log(JSON.stringify(generatedProfile.result, null, 2));
    }
  }

  header() {
    return `Generate ABR Profile for production master ${this.args.objectId}, default variant`;
  }

  options() {
    return super.options();
  }
}

const script = new VariantABRProfile;
script.run();
