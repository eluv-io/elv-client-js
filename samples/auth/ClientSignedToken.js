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

const MakeClientSignedToken = async () => {

  client = await Setup();

  const token = await client.CreateFabricToken({
	  duration: 60 * 60 * 1000, // millisec
  });

  console.log("TOKEN", token);
  return token;
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

MakeClientSignedToken();
