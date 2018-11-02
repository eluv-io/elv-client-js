const { ElvClient } = require("../src/ElvClient");
//const { ElvClient } = require("../ElvClient-node-min-dev");
//const { ElvClient } = require("../ElvClient-node-min");
const TestMethods = require("./TestMethods");

const Test = async () => {
  let Client = new ElvClient({
    //contentSpaceId: "ispc6NxBDhWiRuKyDNMWVmpTuCaQssS2iuDfq8hFkivVoeJw",
    hostname: "q1.contentfabric.io",
    port: 80,
    useHTTPS: false,
    ethHostname: "eth1.contentfabric.io",
    // ethHostname: "127.0.0.1",
    ethPort: 8545,
    ethUseHTTPS: false
  });

  let wallet = Client.GenerateWallet();
  let signer = wallet.AddAccount({
    accountName: "Alice",
    privateKey: "04832aec82a6572d9a5782c4af9d7d88b0eb89116349ee484e96b97daeab5ca6"
  });

  TestMethods.TestQueries(Client, signer).then(result => console.log(result));
};

Test();

