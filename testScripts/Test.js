const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");

const ClientConfiguration = require("../TestConfiguration.json");
const Response = (require("node-fetch")).Response;
const Utils = require("../src/Utils");

const Test = async () => {
  try {
    //ClientConfiguration.noAuth = true;
    let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      accountName: "Alice",
      //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
      //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
    });
    client.SetSigner({signer});

    console.log(await client.ContentLibrary({libraryId: "ilibnonexistant"}));
  } catch(error) {
    console.error(error);
  }
};

Test();
