const {ElvClient} = require("../../../src/ElvClient");

const elvRegions = require("../data/elv_regions");
const networkSpecs = require("../data/network_specs.json");

const {NewOpt} = require("../options");

const Logger = require("./Logger");

const DEFAULT_NETWORK = "main";
const networkChoices = [...new Set([
  ...Object.keys(ElvClient.Networks()),
  ...Object.keys(networkSpecs)
])].sort();

const blueprint = {
  name: "Client",
  concerns: [Logger],
  options: [
    NewOpt("configUrl", {
      descTemplate: "URL to query for Fabric configuration, enclosed in quotes - e.g. for Eluvio demo network: --configUrl \"https://demov3.net955210.contentfabric.io/config\" (you can choose to set env var FABRIC_CONFIG_URL instead)",
      group: "API",
      type: "string"
    }),
    NewOpt("network", {
      choices: networkChoices,
      descTemplate: `Network to use. Defaults to "${DEFAULT_NETWORK}" when neither --configUrl nor FABRIC_CONFIG_URL is supplied. Custom networks in utilities/lib/data/network_specs.json are initialized directly.`,
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
    }),
    NewOpt("node", {
      descTemplate: "Pin all fabric and file-service requests to a specific node hostname or URL (e.g. host-76-74-28-240.contentfabric.io). Overrides the nodes returned by the config URL.",
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
  const {debug, ethContractTimeout, network, node} = context.args;
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

      if(network && networkSpecs[network]) {
        // Initialize directly from a custom network spec, no config URL fetched.
        const spec = networkSpecs[network];
        const fabricURIs = spec.fabricURIs;
        const ethereumURIs = spec.ethereumURIs;
        const fileServiceURIs = spec.fileServiceURIs || fabricURIs;

        logger.log(`Initializing elv-client-js from network spec "${network}" (no config URL)...`);
        logger.log(`  Content space: ${spec.contentSpaceId}`);
        logger.log(`  Fabric API:    ${fabricURIs.join(", ")}`);
        logger.log(`  Ethereum API:  ${ethereumURIs.join(", ")}`);

        elvClient = new ElvClient({
          contentSpaceId: spec.contentSpaceId,
          networkId: spec.networkId,
          networkName: spec.networkName || network,
          fabricVersion: spec.fabricVersion || 3,
          fabricURIs,
          ethereumURIs,
          fileServiceURIs,
          authServiceURIs: spec.authServiceURIs || [],
          searchURIs: spec.searchURIs || [],
          ethereumContractTimeout: ethContractTimeout
        });
      } else if(network) {
        logger.log(`Initializing elv-client-js from network "${network}"...`);
        elvClient = await ElvClient.FromNetworkName({
          networkName: network,
          region,
          ethereumContractTimeout: ethContractTimeout
        });
      } else {
        if(configUrl) {
          logger.log(`Initializing elv-client-js... (config URL: ${configUrl})`);
          elvClient = await ElvClient.FromConfigurationUrl({
            configUrl,
            region,
            ethereumContractTimeout: ethContractTimeout
          });
        } else {
          logger.log(`Initializing elv-client-js from default network "${DEFAULT_NETWORK}"...`);
          elvClient = await ElvClient.FromNetworkName({
            networkName: DEFAULT_NETWORK,
            region,
            ethereumContractTimeout: ethContractTimeout
          });
        }
      }

      if(node) {
        const nodeUrl = /^https?:\/\//i.test(node) ? node : `https://${node}`;
        logger.log(`Pinning fabric and file-service requests to ${nodeUrl}...`);
        elvClient.SetNodes({
          fabricURIs: [nodeUrl],
          fileServiceURIs: [nodeUrl]
        });
      }

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

  // instance interface
  return {get};
};

module.exports = {
  blueprint,
  New
};
