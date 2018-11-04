const { ElvClient } = require("./src/ElvClient.js");
const Ethers = require("ethers");

let client = new ElvClient({
    //contentSpaceId: "ispc6NxBDhWiRuKyDNMWVmpTuCaQssS2iuDfq8hFkivVoeJw",
    hostname: "q.contentfabric.io",
    port: 80,
    useHTTPS: false,
    ethHostname: "localhost",   // eth.contentfabric.io
    ethPort: 7545,              // 8545
    ethUseHTTPS: false
});

let pk955301 = "0xcc1b897144dff55303729303778b0f29f0883acdf243c3f9291fee07758bdc04"

let wallet = client.GenerateWallet();
let signer = wallet.AddAccount({
    accountName: "Alice",
    privateKey: "f4be366a94b771f58fcb4ba2f8648b57f3cf51370e36bdc1eef5003f21e4b8f8"
   // privateKey: "0xcc1b897144dff55303729303778b0f29f0883acdf243c3f9291fee07758bdc04"
});

var libraryId
var contentId

async function sampleCreate() {

//    let s2 = await Ethers.Wallet.fromEncryptedJson('{"address":"c11e9c1849dd0e3fe0ed63751dc46395f9719644","crypto":{"cipher":"aes-128-ctr","ciphertext":"b14509316eb61e776e91e179efe99ddb80c2532d1117fb513c64e63089169009","cipherparams":{"iv":"a527f97756c6eb6feb1d0c86bcf6e554"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"cf69febd8c1a26e48edeea6ad79e30dc5b85774f22ac1d7b0a83c6e5728e306a"},"mac":"ce4cb6da3a2561e142fbd9b71f5b426027ecfed0c744c45a78d82ded76097081"},"id":"0a429d80-2461-4ea2-89db-031f845f9273","version":3}', "test");
//    console.log(JSON.stringify(s2));

    // Create a library

    var libraryInfo = await client.CreateContentLibrary({
	libraryName: "Hello World Library",
	libraryDescription: "Test library",
	signer
    });

    console.log("Library id=" + libraryInfo.libraryId +
		" addr=" + libraryInfo.contractAddress +
		" txid=" + libraryInfo.txHash);

    console.log("LIBRARY CONTRACT ADDRESS: " + libraryInfo.contractAddress);

    libraryId = libraryInfo.libraryId;
    console.log("LIBRARY ID: " + libraryId);

    // Create a content object
    let contentInfo = await client.ethClient.DeployContentContract({
	libraryAddress: libraryInfo.contractAddress,
	signer
    });

    console.log("Content contract: " + JSON.stringify(contentInfo));

    // TODO -- must figure out how to decde event
    // ContentObjectCreate - caddr is first argument
    let provider = new Ethers.providers.JsonRpcProvider(client.ethereumURI);
    let filter = {
    fromBlock: "latest",
    toBlock: "latest",
    }
    provider.getLogs(filter).then((result) => {
	console.log("EVENTS=" +  JSON.stringify(result));
    })

    // Example caddr = "0x22fd62dc680f261296defe6e2a6cdc3754916b69";
    let caddr = "0x22fd62dc680f261296defe6e2a6cdc3754916b69";

    let createResponse = await (
      client.CreateContentObject({
        libraryId: libraryInfo.libraryId,
        options: {
          meta: {
            "name": "My new contract",
            "description": "Special contract to handle my special project",
            "caddr": caddr
          }
        }
      })
    );
    console.log("Content contract: " + JSON.stringify(createResponse));

    let fin = await (
      client.FinalizeContentObject({
        libraryId: libraryInfo.libraryId,
        writeToken: createResponse.write_token
      })
    );

    console.log("Content final: " + JSON.stringify(fin));

    contentId = fin.id
    console.log("CONTENT ID: " + contentId);

}

async function sampleUpdate(libraryId, contentId) {

    let editResponse = await client.EditContentObject({
      libraryId: libraryId,
      contentId: contentId,
      options: {
          meta: {}
      }
    });

    console.log(JSON.stringify(editResponse, null, 2) + "\n\n");

    await client.MergeMetadata({
      libraryId,
      writeToken: editResponse.write_token,
      metadata: { "latest_count": 700, "latest_level": 400 }
    });

    await (
      client.FinalizeContentObject({
        libraryId,
        writeToken: editResponse.write_token
      })
    );

}

async function sample() {

    console.log("CREATE LIBRARY AND CONTENT");
    await sampleCreate()

    console.log("UPDATE CONTENT " + libraryId + " " + contentId);
    //libraryId="ilib5AUpTgrSK1TNvMA5fVaGsL"
    //contentId="iq__docAsZnUB9yiJypLGoekM"
    await sampleUpdate(libraryId, contentId)
}

sample()
