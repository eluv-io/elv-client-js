const { ElvClient } = require("../src/ElvClient");
const yargs = require("yargs");


// PRIVATE_KEY="xxx" node testScripts/PlayoutOptions.js --objectId iq__... \
// --protocols hls,dash \
// --drms fairplay,widevine,playready,aes-128,sample-aes,clear \
// --config-url XXX
const argv = yargs
  .option("objectId", {
    description: "Object ID of the content"
  })
  .option("versionHash", {
    description: "Version hash of the content"
  })
  .option("offering", {
    description: "Offering key",
    default: "default"
  })
  .option("protocols", {
    description: "Comma-separated list of protocols (hls, dash)",
    default: "hls,dash"
  })
  .option("drms", {
    description: "Comma-separated list of DRMs (aes-128, fairplay, widevine, playready, sample-aes, clear). Leave empty for clear.",
    default: ""
  })
  .option("config-url", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
  })
  .option("debug", {
    type: "boolean",
    description: "Enable client logging"
  })
  .check(argv => {
    if(!argv.objectId && !argv.versionHash) {
      throw new Error("Either --objectId or --versionHash must be specified");
    }
    return true;
  })
  .strict().argv;

const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]};

const Run = async () => {
  const privateKey = process.env.PRIVATE_KEY;
  if(!privateKey) {
    console.error("PRIVATE_KEY environment variable must be specified");
    process.exitCode = 1;
    return;
  }

  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({privateKey});
    await client.SetSigner({signer});

    if(argv.debug) {
      client.ToggleLogging(true);
    }

    const protocols = argv.protocols.split(",").map(p => p.trim()).filter(Boolean);
    const drms = argv.drms ? argv.drms.split(",").map(d => d.trim()).filter(Boolean) : [];

    const playoutOptions = await client.PlayoutOptions({
      objectId: argv.objectId,
      versionHash: argv.versionHash,
      offering: argv.offering,
      protocols,
      drms
    });

    console.log(JSON.stringify(playoutOptions, null, 2));
  } catch(error) {
    console.error("Error getting playout options:");
    console.error(error.body ? JSON.stringify(error, null, 2) : error);
    process.exitCode = 1;
  }
};

Run();
