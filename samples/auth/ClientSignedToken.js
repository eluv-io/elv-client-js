const { ElvClient } = require("../../src/ElvClient");

const networkName = "demo"; // "main" or "demo"

const Setup = async () => {

  client = await ElvClient.FromNetworkName({networkName});
  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  client.SetSigner({signer});
  client.ToggleLogging(false);

  return client;
}

const MakeClientSignedToken = async ({client}) => {

  const token = await client.CreateFabricToken({
	  duration: 60 * 60 * 1000, // millisec
  });

  console.log("ETH_TOKEN", token);
  return token;
}

const MakeClientSignedTokenPersonal = async ({client}) => {

  const token = await client.CreateFabricToken({
    duration: 60 * 60 * 1000, // millisec
    addEthereumPrefix: false;
  });

  console.log("PERSONAL_TOKEN", token);
  return token;
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

const Run = async () => {

  client = await Setup();

  const ethToken = await MakeClientSignedToken({client: client});
  const personalToken = await MakeClientSignedTokenPersonal({client: client});

  if(ethToken !== personalToken) {
    console.Log("Tokens mismatched")
  }
}

Run();
