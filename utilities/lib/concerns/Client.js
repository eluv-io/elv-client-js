const {ElvClient} = require("../../../src/ElvClient");

const elvRegions = require("../data/elv_regions");

const {NewOpt} = require("../options");

const Logger = require("./Logger");

const blueprint = {
  name: "Client",
  concerns: [Logger],
  options: [
    NewOpt("configUrl", {
      descTemplate: "URL to query for Fabric configuration, enclosed in quotes - e.g. for Eluvio demo network: --configUrl \"https://demov3.net955210.contentfabric.io/config\" (you can choose to set env var FABRIC_CONFIG_URL instead)",
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
    configUrl = configUrl.slice(1, -1);
  }
  const {debug, ethContractTimeout} = context.args;
  const region = context.args.elvGeo;
  const logger = context.concerns.Logger;
  const privateKey = context.env.PRIVATE_KEY;
  let elvClient = null; // cache for default client
  let altElvClients = {}; // cache for clients requested with specific node url

  // -------------------------------------
  // interface: client
  // -------------------------------------

  const altConfigUrl = nodeUrl => {
    if(!elvClient) throw Error("cannot request alternate ElvClient without first initializing the main ElvClient instance");

    let url = new URL(nodeUrl);
    url.pathname = "/config";
    url.search = `?self&qspace=${elvClient.networkName}`;
    return url.href;
  };

  const get = async (nodeUrl = null) => {
    let cachedClient = nodeUrl
      ? altElvClients[nodeUrl]
      : elvClient;

    if(cachedClient) return cachedClient;


    // not found in cache, init new client
    if(!privateKey) {
      throw Error("Please set environment variable PRIVATE_KEY");
    }
    if(!nodeUrl && !configUrl) {
      throw Error("Please either supply --configUrl or set environment variable FABRIC_CONFIG_URL");
    }

    const url = nodeUrl
      ? altConfigUrl(nodeUrl)
      : configUrl;

    logger.log(`Initializing elv-client-js... (config URL: ${url})`);
    let client = await ElvClient.FromConfigurationUrl({
      configUrl: url,
      region,
      ethereumContractTimeout: ethContractTimeout
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({privateKey});
    await client.SetSigner({signer});

    client.ToggleLogging(
      debug,
      {
        log: logger.log,
        error: logger.error,
      }
    );

    if(nodeUrl) {
      altElvClients[nodeUrl] = client;
    } else {
      elvClient = client;
    }
    return client;
  };

  // instance interface
  return {
    altConfigUrl,
    get
  };
};

module.exports = {
  blueprint,
  New
};
