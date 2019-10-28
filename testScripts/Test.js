const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    console.log(await client.PlayoutOptions({
      versionHash: "hq__4SEQeYSN7aB7UUeB9wLU9v7yHtVGVteNxQPxrZ1F83fP6AfoHCCJrWYVjcVYsSfsjMnsuD2GYF"
    }))
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
