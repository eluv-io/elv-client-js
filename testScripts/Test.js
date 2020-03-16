const { ElvClient } = require("../src/ElvClient");
const ClientConfiguration = require("../TestConfiguration.json");

//const ContentContract = require("../src/contracts/BaseContent");

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

    const events = await client.Events({count: 100});
    events.forEach(es => {
      es.forEach(async e => {
        if(e.name === "VersionConfirm") {
          console.log(await client.authClient.AccessType(client.utils.AddressToObjectId(e.address)))
        }
      })
    })
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
