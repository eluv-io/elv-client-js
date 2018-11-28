const { ElvClient } = require("../src/ElvClient");
//const { ElvClient } = require("../ElvClient-node-min-dev");
//const { ElvClient } = require("../ElvClient-node-min");
const { FrameClient } = require("../src/FrameClient");
const TestMethods = require("./TestMethods");

const ClientConfiguration = require("../TestConfiguration.json");

const ContentContract = require("../src/contracts/BaseContent");

const Test = async () => {
  try {
    let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      accountName: "Alice",
      //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
      privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
    });
    client.SetSigner({signer});

    //await TestMethods.TestQueries(client, signer);

    const filters = await client.ContentObjectContractEvents({objectId: "iq__39whrV3FHxcWiNQt9qEmsgopdYJj"});

    console.log(filters);

    // Ensure ElvClient and FrameClient agree on allowed methods
    const frameClient = new FrameClient({target: this});

    const frameClientMethods = frameClient.AllowedMethods();
    const elvClientMethods = client.FrameAllowedMethods();

    const differentKeys = frameClientMethods
      .filter(x => !elvClientMethods.includes(x))
      .concat(elvClientMethods.filter(x => !frameClientMethods.includes(x)));

    if (differentKeys.length > 0) {
      console.error("MISMATCHED ALLOWED METHODS BETWEEN ELV CLIENT AND FRAME CLIENT");
      console.error(differentKeys);

      console.error("EXPECTED");
      console.log(JSON.stringify(elvClientMethods.sort(), null, 2));
    }
  } catch(error) {
    console.log(error);
  }
};

Test();
