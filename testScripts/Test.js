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


    const ethUrl = "https://host-216-66-40-19.contentfabric.io/eth";
    const asUrl = "https://host-66-220-3-86.contentfabric.io";

    client.SetNodes({
      ethereumURIs: [
        ethUrl
      ],
      authServiceURIs: [
        asUrl
      ]
    });

    console.log(
      await client.ContentObjectTenantId({
        objectId: "iq__3PXRZX5NCzPQsfTEquCctB2K3KJh"
      })
    )
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

Test();
