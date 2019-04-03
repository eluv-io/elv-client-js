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
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
    });
    client.SetSigner({signer});

    const libraryId = "ilib3XxtJsRr1qvM18qRGJfmcELzTX1k";
    const objectId = "iq__2XdCuga9NbAZK7NN3F4Pa3umPbAK";

    console.log(await client.ContentObjectMetadata({libraryId, objectId}));
  } catch(error) {
    console.error(error);
  }
};

Test();
