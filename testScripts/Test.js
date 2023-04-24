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

    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    client.ToggleLogging(true);
    const response = await client.CallContractMethod({
      cacheContract: true,
      contractAddress: "0xc4958836b7f883a02e9fedcc11f7ebbcc8c2d5bb",
      formatAgruments: true,
      methodArgs: [1],
      methodName: "membersList",
      overrideCachedContract: false,
      overrides: {}
    });
    client.ToggleLogging(false);

    console.log("response", response)
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

Test();
