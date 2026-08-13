const {expect} = require("chai");

const {ElvClient} = require("../../../../../src/ElvClient");
const Client = require("../../../../lib/concerns/Client");

const logger = {
  error: () => {},
  log: () => {}
};

const context = ({args={}, env={}} = {}) => ({
  args: {
    ethContractTimeout: 10,
    ...args
  },
  concerns: {Logger: logger},
  env: {
    PRIVATE_KEY: "private-key",
    ...env
  }
});

const fakeClient = () => {
  const nodeSelections = [];

  return {
    GenerateWallet: () => ({AddAccount: () => ({})}),
    SetNodes: nodes => nodeSelections.push(nodes),
    SetSigner: async () => {},
    ToggleLogging: () => {},
    nodeSelections
  };
};

describe("Client concern", () => {
  let originalFromConfigurationUrl;
  let originalFromNetworkName;

  beforeEach(() => {
    originalFromConfigurationUrl = ElvClient.FromConfigurationUrl;
    originalFromNetworkName = ElvClient.FromNetworkName;
  });

  afterEach(() => {
    ElvClient.FromConfigurationUrl = originalFromConfigurationUrl;
    ElvClient.FromNetworkName = originalFromNetworkName;
  });

  it("uses the main network by default", async () => {
    let initArgs;
    ElvClient.FromNetworkName = async args => {
      initArgs = args;
      return fakeClient();
    };

    await Client.New(context()).get();

    expect(initArgs.networkName).to.equal("main");
  });

  it("uses a supplied config URL instead of the default network", async () => {
    let initArgs;
    ElvClient.FromConfigurationUrl = async args => {
      initArgs = args;
      return fakeClient();
    };

    await Client.New(context({args: {configUrl: "https://example.com/config"}})).get();

    expect(initArgs.configUrl).to.equal("https://example.com/config");
  });

  it("uses an explicitly selected built-in network", async () => {
    let initArgs;
    ElvClient.FromNetworkName = async args => {
      initArgs = args;
      return fakeClient();
    };

    await Client.New(context({args: {network: "demo"}})).get();

    expect(initArgs.networkName).to.equal("demo");
  });

  it("pins fabric and file-service requests to the supplied node", async () => {
    const client = fakeClient();
    ElvClient.FromNetworkName = async () => client;

    await Client.New(context({args: {node: "fabric.example.com"}})).get();

    expect(client.nodeSelections).to.deep.equal([{
      fabricURIs: ["https://fabric.example.com"],
      fileServiceURIs: ["https://fabric.example.com"]
    }]);
  });
});
