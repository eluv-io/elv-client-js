const {ElvClient} = require("../../../src/ElvClient");

const elvRegions = require("../data/elv_regions");

const {NewOpt} = require("../options");

const Logger = require("./Logger");

const blueprint = {
  name: "Client",
  concerns: [Logger],
  options: [
    NewOpt("configUrl", {
      descTemplate: "URL to query for Fabric configuration, enclosed in quotes - e.g. for Eluvio demo network: --configUrl \"https://demov3.net955210.contentfabric.io/config\"",
      group: "API",
      type: "string"
    }),
    NewOpt("debug", {
      descTemplate: "Print debug logging for API calls",
      group: "API",
      type: "boolean"
    }),
    NewOpt("ethContractTimeout", {
      default: 10,
      descTemplate: "Number of seconds to wait for ethereum contract calls",
      group: "API",
      type: "number"
    }),
    NewOpt("elvGeo", {
      choices: Object.keys(elvRegions).sort(),
      descTemplate: "Geographic region for the fabric nodes.",
      group: "API",
      type: "string"
    })
  ]
};

const New = (context) => {
  // -------------------------------------
  // closures
  // -------------------------------------
  let configUrl = context.args.configUrl || context.env.FABRIC_CONFIG_URL;
  // strip beginning/end quotes if included
  if(/^".+"$/.test(configUrl)) {
    configUrl = configUrl.slice(1,-1);
  }
  const {debug, ethContractTimeout} = context.args;
  const region = context.args.elvGeo;
  const logger = context.concerns.Logger;
  const privateKey = context.env.PRIVATE_KEY;
  let elvClient = null;

  // -------------------------------------
  // interface: client
  // -------------------------------------

  const get = async () => {
    // get client if we have not already
    if(!elvClient) {
      if(!privateKey) {
        throw Error("Please set environment variable PRIVATE_KEY");
      }
      if(!configUrl) {
        throw Error("Please either supply --configUrl or set environment variable FABRIC_CONFIG_URL");
      }

      logger.log(`Initializing elv-client-js... (config URL: ${configUrl})`);
      elvClient = await ElvClient.FromConfigurationUrl({
        configUrl,
        region,
        ethereumContractTimeout: ethContractTimeout
      });

      let wallet = elvClient.GenerateWallet();
      let signer = wallet.AddAccount({privateKey});
      await elvClient.SetSigner({signer});

      elvClient.ToggleLogging(
        debug,
        {
          log: logger.log,
          error: logger.error,
        }
      );
    }
    return elvClient;
  };

  return {get};
};

module.exports = {blueprint, New};