const { ElvClient } = require("../src/ElvClient");
const ClientConfiguration = require("../TestConfiguration.json");

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

    const libraryId = "ilibzfesE91aYRutzNceLyv6fYiSUwv";
    const createResponse = await client.CreateContentObject({libraryId});
    const objectId = createResponse.id;

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: createResponse.write_token,
      metadata: {
        user_list: {
          "drama": {name:"Drama", "slug": "drama", titleCount: 0},
          "teen-flicks":{name:"Teen Flicks",slug:"teen-flicks", titleCount: 0}
        }
      }
    });

    await client.FinalizeContentObject({libraryId, objectId, writeToken: createResponse.write_token});

    console.log(JSON.stringify(await client.ContentObjectMetadata({libraryId, objectId}), null, 2));

    const editResponse = await client.EditContentObject({libraryId, objectId});

    await client.MergeMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadataSubtree: "user_list",
      metadata: {"drama" : { titleCount: 10 }, "teen-flicks": {titleCount: 15}}
    });

    await client.FinalizeContentObject({libraryId, objectId, writeToken: editResponse.write_token});

    console.log(JSON.stringify(await client.ContentObjectMetadata({libraryId, objectId}), null, 2));

  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
