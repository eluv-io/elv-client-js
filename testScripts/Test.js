const { ElvClient } = require("../src/ElvClient");
const { ElvWalletClient } = require("../src/walletClient/index");
const ClientConfiguration = require("../TestConfiguration.json");
const fs = require("fs");
const HttpClient = require("../src/HttpClient");

const Test = async () => {
  try {
    const client = await ElvClient.FromNetworkName({
      networkName: "demo"
    });
    // const client = await ElvClient.FromConfigurationUrl({
    //   configUrl: "http://localhost:8008/config?qspace=demov3&self"
    // });

    /*
    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});
<<<<<<< Updated upstream
=======

     */

    console.log(JSON.stringify(
    await client.PlayoutOptions({objectId: "iq__3ZiTAEQarHZL7P1qSQ5W3a3gSPKj"}),null,2))

>>>>>>> Stashed changes
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

Test();
