/* eslint-disable no-console */

/**
 * Delete an entry from metadata top level /offerings,
 * e.g. node OfferingRemove.js --config-url URL --libraryId LIB_ID --objectId OBJ_ID --offeringKey KEY
 *
 * Throws error if command would delete the last (only) offering, leaving /offerings empty
 * unless --force flag used.
 * **/

const ScriptOffering = require("./parentClasses/ScriptOffering");

class OfferingRemove extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const force = this.args.force;

    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    this.validateOffering(metadata, offeringKey);

    const offerings = metadata.offerings;

    if(Object.keys(offerings).length) {
      if(force) {
        console.warn("WARNING: Deleting last offering…");
      } else {
        this.throwError("Only one offering remaining. \nRe-run with '--force' if you want to delete anyways.");
      }
    }

    delete offerings[offeringKey];

    await this.metadataWrite(metadata);
  }

  header() {
    return "Removing offering '" + this.args.offeringKey + "' from object '" + this.args.objectId + "'... ";
  }

  options() {
    // change offeringKey to a required arg by adding key to 'demandedOptions' map (value under key doesn't matter, 'undefined' is sufficient - key just has to exist)
    let opts = super.options();
    let previouslyDefinedOptDefs = opts.getOptions();
    previouslyDefinedOptDefs.demandedOptions.offeringKey = undefined;
    delete previouslyDefinedOptDefs.default.offeringKey;

    return opts.option("force", {
      default: false,
      describe: "Force remove offering from metadata, even if last one.",
      type: "boolean"
    });
  }

}

const script = new OfferingRemove;
script.run();
