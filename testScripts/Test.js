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
      privateKey: "0xbf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6"
    });
    client.SetSigner({signer});

    console.log(await client.ContentLibrary({libraryId: "ilibnonexistant"}));
  } catch(error) {
    console.error(error);
  }
};

Test();


client.ContentLibraries()
  .then(libraries => console.log(libraries))
  .catch(error => console.log(error));


const Path = require("path");

console.log(Path.join("qlibs", "someid"));
