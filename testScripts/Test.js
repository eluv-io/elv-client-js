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

    const libraryId = "ilib4BJnAwiwy7XfKvtYEpR1n3xcXnWj";
    const objectId = "iq__3ZUhwxucJXDjhPoPAiW2jjPzyJaP";

    const po = await client.PlayoutOptions({
      objectId,
      linkPath: "public/asset_metadata/titles/0/flirty-dancing/sources/default"
    });

    console.log(po);




  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
