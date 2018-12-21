const { ElvClient } = require("../src/ElvClient");
//const { ElvClient } = require("../ElvClient-node-min-dev");
//const { ElvClient } = require("../ElvClient-node-min");
const { FrameClient } = require("../src/FrameClient");
const TestMethods = require("./TestMethods");

const ClientConfiguration = require("../TestConfiguration.json");

const ethers = require("ethers");
const BaseContract = require("../src/contracts/BaseContent");

const Test = async () => {
  try {
    let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      accountName: "Alice",
      //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
      //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
    });
    client.SetSigner({signer});

    //await TestMethods.TestQueries(client, signer);


    let events = await client.ContractEvents({
      contractAddress: "0x13e83f5d81240f261c4be64d39c0cb988832e321",
      abi: BaseContract.abi,
    });

    console.log(events);


    events = await client.ContractEvents({
      abi: BaseContract.abi,
      transactionHash: ""
    });

    console.log(events);


    //const event = await signer.provider.getLogs("0xeee96b5ecae3f271001e37913885aac16cd37cc28ab702607ad6e39b33521d47");
    //console.log(event);

    // Ensure ElvClient and FrameClient agree on allowed methods
    const frameClient = new FrameClient({target: this});

    const frameClientMethods = frameClient.AllowedMethods();
    const elvClientMethods = client.FrameAllowedMethods();

    const differentKeys = frameClientMethods
      .filter(x => !elvClientMethods.includes(x))
      .concat(elvClientMethods.filter(x => !frameClientMethods.includes(x)));

    if (differentKeys.length > 0) {
      console.error("MISMATCHED ALLOWED METHODS BETWEEN ELV CLIENT AND FRAME CLIENT");
      console.error(differentKeys);

      console.error("EXPECTED");
      console.error(JSON.stringify(elvClientMethods.sort(), null, 2));
    }
  } catch(error) {
    console.error(error);
  }
};

Test();
