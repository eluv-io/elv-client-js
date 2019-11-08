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

    //console.log(await client.CallBitcodeMethod({libraryId: "ilib4CNaYcMsgtw7pYsA9G89kmLvXed8", objectId: "iq__36pXM8UBRA7vbujDpQTxFtmNzAw4", method: "image"}));
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
