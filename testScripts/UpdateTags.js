const { ElvClient } = require("../src/ElvClient");
const ClientConfiguration = require("../TestConfiguration.json");

const fs = require("fs");
const UrlJoin = require("url-join");

if(process.argv.length !== 6) {
  console.error("\nUsage: PRIVATE_KEY=<private-key> node UpdateTags.js <objectId> <filename> <track key> <track name>\n");
  return;
}

const objectId = process.argv[2];
const filename = process.argv[3];
const trackKey = process.argv[4];
const trackName = process.argv[5];

const tags = JSON.parse(
  fs.readFileSync(filename)
);

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});

    const libraryId = await client.ContentObjectLibraryId({objectId});
    const { write_token } = await client.EditContentObject({libraryId, objectId});

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: write_token,
      metadataSubtree: UrlJoin("metadata_tags", trackKey),
      metadata: {
        name: trackName,
        entries: tags
      }
    });

    await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: write_token
    });
  } catch(error) {
    console.error(error);
  }
};

Test();
