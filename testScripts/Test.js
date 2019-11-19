const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");
const fs = require("fs");

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    const libraryId = "ilib9m1WXW6sQofxkFYxSCcGVe2ETcY";
    const objectId = "iq__FSrkRJ7Fq41h7bcEPE3srU56Zyu";

    console.time("asd");
    console.log(
      JSON.stringify(
        await client.ContentObjectMetadata({
          //versionHash: "hq__35GmXEdcU78DnEb4h31nXGPmrpWpLGkTk5D6UinUTMmK6yZGCCyW6wH36UFJV7vadwYrQennxE",
          libraryId,
          objectId,
          metadataSubtree: "",
          resolveLinks: false,
          produceLinkUrls: true
        }),
        null, 2
      )
    );
    console.timeEnd("asd");

    /*
    const fileData = fs.readFileSync("./master_Trailer-CASINO-ROYALE.json", "utf-8");
    const tags = Object.values(JSON.parse(fileData))[0];

    console.log(tags);

    const objectId = "iq__4S4jH2mKZ538MigwoYe3rF6f4mw2";
    const libraryId = "ilib2CMWNrRRDUo7zg7y5PqKDy6343AM";

    const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadata: tags.metadata_tags,
      metadataSubtree: "metadata_tags"
    });

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadata: tags.overlay_tags,
      metadataSubtree: "overlay_tags"
    });

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadata: tags.video_level_tags,
      metadataSubtree: "video_level_tags"
    });



    await client.FinalizeContentObject({libraryId, objectId, writeToken});

    /*
    const libraryId = "ilibq8CvN3qJdQHGAjujuctBxZfUd3u";
    const objectId = "iq__odR6QAaBjy3S6wsmKPUfmokjQaM";

    const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

    await client.CreateLinks({
      libraryId,
      objectId,
      writeToken,
      links: [
        {
          target: "favicon.png",
          path: "image"
        },
        {
          target: "public/something",
          path: "links/metadataLink",
          type: "meta"
        }
      ]
    });

    await client.FinalizeContentObject({libraryId, objectId, writeToken});

    console.log(JSON.stringify(await client.ContentObjectMetadata({libraryId, objectId, resolveLinks: false}), null , 2));
    console.log(JSON.stringify(await client.ContentObjectMetadata({libraryId, objectId, resolveLinks: true}), null , 2));

     */
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
