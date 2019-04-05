const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");

const ClientConfiguration = require("../TestConfiguration.json");
const Response = (require("node-fetch")).Response;
const Utils = require("../src/Utils");

const KickReplacementFee = async (signer, gasPrice) => {
  try {
    const transaction = await signer.sendTransaction({
      to: signer.address,
      value: 0,
      gasPrice: gasPrice || await signer.provider.getGasPrice()
    });

    return await transaction.wait();
  } catch(error) {
    await KickReplacementFee(signer, error.transaction.gasPrice.mul(10));
  }
};

const UserProfileClient = require("../src/UserProfileClient");

const Test = async () => {
  try {
    //ClientConfiguration.noAuth = true;
    let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "0x72b42864c76fadf92b63ad5d6840efcd049495f82eaf23843381e6b97b762595"
    });
    client.SetSigner({signer});

    const libraryId = "ilib3XxtJsRr1qvM18qRGJfmcELzTX1k";
    const objectId = "iq__2XdCuga9NbAZK7NN3F4Pa3umPbAK";

    console.log(parseFloat(await client.GetBalance({address: signer.address})));
  } catch(error) {
    console.error(error);
  }
};

Test();
