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
      //privateKey: "04832aec82a6572d9a5782c4af9d7d88b0eb89116349ee484e96b97daeab5ca6"
      //privateKey: "1307df44f8f5033ec86434a7965234015da85261df149ed498cb29907df38d72"
      privateKey: "0xbf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6"
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
