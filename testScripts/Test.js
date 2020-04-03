const { ElvClient } = require("../src/ElvClient");
const ClientConfiguration = require("../TestConfiguration.json");

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "0x39a75f46a47080b38aa41760910105bf17f7fedeaf04663e7bca032d4dfb351b"
    });

    client.SetSigner({signer});

    console.log(JSON.stringify(await client.ContentObjects({libraryId: "ilib3v96fU1nPVAB2AFsffg2FPSG7Fbg"}),null,2));
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
