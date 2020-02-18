const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const ClientConfiguration = require("../TestConfiguration.json");
if(typeof Buffer === "undefined") { Buffer = require("buffer/").Buffer; }

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
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
