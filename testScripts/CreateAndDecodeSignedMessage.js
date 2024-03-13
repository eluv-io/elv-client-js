const { ElvClient } = require("../src/ElvClient");

const yargs = require("yargs");
const argv = yargs
.option("msg", {
  description: "message to be signed and decoded",
  type: "string"
})
.option("config-url", {
  type: "string",
  description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
})
.demandOption(
  ["msg"],
  "\nUsage: PRIVATE_KEY=<private-key> node CreateAndDecodeSignedMessage.js --msg <message>\n"
)
.strict().argv;
const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]};

const CreateAndDecodeSignedMessage = async ({msg}) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"],
    });
    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    const signedMessage = await client.CreateSignedMessageJSON({
      message:msg,
    });

    const decodedMessage = await client.DecodeSignedMessageJSON({
      signedMessage,
    });


    console.log(signedMessage);
    console.log(decodedMessage);
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

CreateAndDecodeSignedMessage({msg: argv.msg});
