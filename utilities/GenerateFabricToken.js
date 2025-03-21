const { ElvClient } = require("../src/ElvClient");

const GenerateFabricToken = async () => {
  try {
    const client = await ElvClient.FromNetworkName({networkName: process.env.ENV ?? "main"});

    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    console.log(await client.CreateFabricToken({
      duration: parseInt(process.env.DURATION ?? 24 * 60 * 60 * 1000),
      context:  JSON.parse(process.env.ELV_TOK_CTX ?? "{}")
      //context: {email:"xyz@eluv.io"}
    }));
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

GenerateFabricToken();
