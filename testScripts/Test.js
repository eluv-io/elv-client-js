const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const ClientConfiguration = require("../TestConfiguration.json");
if(typeof Buffer === "undefined") { Buffer = require("buffer/").Buffer; }
const { CreateClient } = require("../test/utils/Utils");

const Test = async () => {
  try {
    /*
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    console.log(await client.AccessGroupMembers({contractAddress: "0x7633944ddb8893482bd0666e5aa58fd605121d0e"}));

     */

    const client = await CreateClient("asd", "0.5");

    console.log(await client.userProfileClient.WalletAddress());
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
