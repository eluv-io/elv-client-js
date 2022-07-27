const { ElvClient } = require("../../src/ElvClient");

const configUrl = "https://main.net955305.contentfabric.io/config"
//const configUrl = "https://main.net955210.contentfabric.io/config"

const sampleXcmsg = {
  chain: 'eip155:955305',
  method: 'balanceOf',
  contract: '0xd4c8153372b0292b364dac40d0ade37da4c4869a',
  owner: '0xcd8323da264e9c599af47a0d559dcdcb335d44ab',
  block: 1000000,
  balance: 300,
  sig_hex: '0xdb6208a9e7ffd804859483382bc6419e2d0f94b498d48ce210956ad387cd52ac374dcd0c70a52086e26d4865fdf1aed66f78699c2019bdf4a4e5b40b7c1effd51c'
};

const Setup = async () => {

  client = await ElvClient.FromConfigurationUrl({configUrl: configUrl});
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


  const ctx = {
    "ctx" : {
      "xcmsg" : {
        ...sampleXcmsg
      }
    }
  };

  const token = await client.CreateFabricToken({
	  duration: 60 * 60 * 1000, // millisec
    spec: ctx,
  });

  console.log("TOKEN", token);
  return token;
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

MakeClientSignedToken();
