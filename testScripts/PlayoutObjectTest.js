const { ElvClient } = require("../../elv-client-js/src/ElvClient.js");
const { PlayoutObject } = require("./PlayoutObject.js");

const Test = async () => {

  try {

    const client = await ElvClient.FromConfigurationUrl({configUrl: "https://main.net955210.contentfabric.io"});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "aa556d0e470091e03a465b11d815bb88602b7f7d1024c637c5b1b8a939ca7422" // REPLACE
    });
    client.SetSigner({signer});

    let playout = new PlayoutObject(client);

    let args = {
      name: "Big Bucks Bunny (v1)",
      description: "",
      libraryId: "ilib3VRPAueW1Ns4GKKz4CviXQ4HqyXz",
      type: "hq__HxxmBu1NGh9RoLaYz8phbXQV5uvRd2cWE5xEQKNyrMCn75LdyqzSmCzpdMuUkacmG4yZUoowtt",
      dir: "BigBuckBunny_4k"
    }

    playout.submit(args);

  } catch(error) {
    console.error(error);
  }

}

Test();
