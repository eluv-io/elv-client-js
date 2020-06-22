/* eslint-disable no-console */

// mixin to factor out common code for dealing with metadata

module.exports = MetadataMixin = Base => class extends Base {
  async metadataWrite(metadata) {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;

    const editResponse = await client.EditContentObject({
      libraryId,
      objectId
    });

    const writeToken = editResponse.write_token;

    console.log("Writing metadata back to object...");
    await client.ReplaceMetadata({
      libraryId,
      metadata,
      objectId,
      writeToken
    });

    console.log("Finalizing object...");
    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    console.log("New version hash: " + finalizeResponse.hash);
  }
};