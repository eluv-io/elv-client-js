const { ElvClient } = require("../../src/ElvClient");

const networkName = "demo"; // "main" or "demo"

const Setup = async () => {

  client = await ElvClient.FromNetworkName({networkName});
  await client.SetRemoteSigner({idToken: process.env.ID_TOKEN, unsignedPublicAuth: true})
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
    addEthereumPrefix: false,
  });

  console.log("PERSONAL_TOKEN", token);
  return token;
}

const Run = async () => {

  // Stub Date.now()
  const dateNow = Date.now()
  const realDateNow = Date.now.bind(global.Date);
  const dateNowStub = function () { return dateNow };
  global.Date.now = dateNowStub;

  client = await Setup();

  const ethToken = await MakeClientSignedToken({client: client});
  const personalToken = await MakeClientSignedTokenPersonal({client: client});

  if(ethToken == personalToken) {
    console.log("Tokens matched successfully")
  } else {
    console.log("Tokens mismatched")
  }

  // Restore Date.now()
  global.Date.now = realDateNow;
}

if (!process.env.ID_TOKEN) {
  console.log("Must set environment variable ID_TOKEN");
  exit;
}

Run();
