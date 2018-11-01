const { ElvClient } = require("../src/ElvClient");
//const { ElvClient } = require("../ElvClient-node-min-dev");
//const { ElvClient } = require("../ElvClient-node-min");
const TestMethods = require("./TestMethods");

const Test = async () => {
  let Client = new ElvClient({
    //contentSpaceId: "ispc6NxBDhWiRuKyDNMWVmpTuCaQssS2iuDfq8hFkivVoeJw",
    hostname: "localhost",
    port: 8008,
    useHTTPS: false,
    ethHostname: "localhost",
    ethPort: 7545,
    ethUseHTTPS: false
  });

  let wallet = Client.GenerateWallet();
  let signer = wallet.AddAccount({
    accountName: "Alice",
    privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
  });

  TestMethods.TestQueries(Client, signer).then(result => console.log(result));
};

Test();

