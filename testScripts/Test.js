const { ElvClient } = require("../src/index");
const { ElvWalletClient } = require("../src/walletClient/index");
const ClientConfiguration = require("../TestConfiguration.json");
const fs = require("fs");
const HttpClient = require("../src/HttpClient");
//const NodeFetch = require("node-fetch");

const Test = async () => {
  // For some reason, fetch isn't defined for ethers in the build node version, need to set this
  //globalThis.fetch = NodeFetch;

  try {
    const client = await ElvClient.FromNetworkName({
      networkName: "demo"
    });

    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    console.log(await client.ContentLibraries());
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

Test();
