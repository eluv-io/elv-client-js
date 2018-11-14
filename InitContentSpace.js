const { ElvClient } = require("./src/ElvClient");
const fs = require("fs");

const client = new ElvClient({
  hostname: "localhost",
  port: 8008,
  useHTTPS: false,
  ethHostname: "localhost",
  ethPort: 8545,
  ethUseHTTPS: false
});

let wallet = client.GenerateWallet();
let signer = wallet.AddAccount({
  accountName: "Alice",
  //privateKey: "04832aec82a6572d9a5782c4af9d7d88b0eb89116349ee484e96b97daeab5ca6"
  privateKey: "1307df44f8f5033ec86434a7965234015da85261df149ed498cb29907df38d72"
});
client.SetSigner({signer});

if(process.argv.length !== 3) {
  console.error("Usage: node InitContentSpace.js <path-to-qfab-config.json>");
  process.exit();
}

const qfabConfigPath = process.argv[2];

const Init = async () => {
  let qfabConfig = JSON.parse(fs.readFileSync(qfabConfigPath).toString());

  const contentSpaceAddress = await client.ethClient.DeployContentSpaceContract({
    name: "Content Space",
    signer
  });
  const contentSpaceId = client.utils.AddressToSpaceId({address: contentSpaceAddress});

  console.log("\nCreated content space:");
  console.log("\tAddress: " + contentSpaceAddress);
  console.log("\tID: " + contentSpaceId + "\n");

  qfabConfig.qspaces = [
    {
      id: contentSpaceId,
      type: "Ethereum",
      ethereum: {
        url: client.ethereumURI,
        chain_id: 955301
      }
    }
  ];

  fs.writeFileSync(qfabConfigPath, JSON.stringify(qfabConfig, null, 2));
};

Init();
