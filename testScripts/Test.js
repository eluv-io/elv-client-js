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
      privateKey: "0x55320cdb03a77d941ad41d15c5920d67cb51723aed691f6e2d03be609475017b"
    });
    client.SetSigner({signer});

    const libraryId = "ilib3XxtJsRr1qvM18qRGJfmcELzTX1k";
    const objectId = "iq__2XdCuga9NbAZK7NN3F4Pa3umPbAK";

    await client.ContentObjectMetadata({libraryId, objectId});

  } catch(error) {
    console.error(error);
  }
};

Test();
