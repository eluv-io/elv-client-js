const { ElvClient } = require("../src/ElvClient");
//const { ElvClient } = require("../ElvClient-node-min-dev");
//const { ElvClient } = require("../ElvClient-node-min");
const { FrameClient } = require("../src/FrameClient");
const TestMethods = require("./TestMethods");

const ClientConfiguration = require("../TestConfiguration.json");

const CompareMethods = (frameClientMethods, elvClientMethods) => {
  const differentKeys = frameClientMethods
    .filter(x => !elvClientMethods.includes(x))
    .concat(elvClientMethods.filter(x => !frameClientMethods.includes(x)));

  if (differentKeys.length > 0) {
    console.error("MISMATCHED ALLOWED METHODS BETWEEN ELV CLIENT AND FRAME CLIENT");
    console.error(differentKeys);

    console.error("EXPECTED");
    console.error(JSON.stringify(elvClientMethods.sort(), null, 2));
  }
};

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

    await TestMethods.TestQueries(client, signer);

    // Ensure ElvClient and FrameClient agree on allowed methods
    const frameClient = new FrameClient({target: this});

    CompareMethods(frameClient.AllowedMethods(), client.FrameAllowedMethods());
    CompareMethods(frameClient.AllowedUserProfileMethods(), client.userProfile.FrameAllowedMethods());

  } catch(error) {
    console.error(error);
  }
};

Test();
