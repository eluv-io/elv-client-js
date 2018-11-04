const { ElvClient } = require("./src/ElvClient.js");
const Ethers = require("ethers");

let client = new ElvClient({
    //contentSpaceId: "ispc6NxBDhWiRuKyDNMWVmpTuCaQssS2iuDfq8hFkivVoeJw",
    hostname: "q.contentfabric.io",
    port: 80,
    useHTTPS: false,
    ethHostname: "localhost",
    ethPort: 7545,
    ethUseHTTPS: false
});

let wallet = client.GenerateWallet();
let signer = wallet.AddAccount({
    accountName: "Alice",
    privateKey: "f4be366a94b771f58fcb4ba2f8648b57f3cf51370e36bdc1eef5003f21e4b8f8"
   // privateKey: "0xcc1b897144dff55303729303778b0f29f0883acdf243c3f9291fee07758bdc04"
});


async function sampleCreateLibrary() {

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
    return libraryInfo
}

async function sampleCreateContent(libraryInfo) {

    // Create a content object
    let contentInfo = await client.ethClient.DeployContentContract({
	libraryAddress: libraryInfo.contractAddress,
	signer
    });

    console.log("Content contract info: " + JSON.stringify(contentInfo));

    let caddr = client.ethClient.GetContractAddress();

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

    return {contentId: contentId, contractAddress: caddr}
}

async function sampleUpdateContent(libraryInfo, contentInfo) {

    let libraryId = libraryInfo.libraryId;
    let contentId = contentInfo.contentId;

    let editResponse = await client.EditContentObject({
      libraryId: libraryId,
      contentId: contentId,
      options: {
          meta: {}
      }
    });

    console.log(JSON.stringify(editResponse, null, 2));

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

    console.log("CREATE LIBRARY");

    let libraryInfo = await sampleCreateLibrary();

    console.log("CREATE CONTENT");

    let contentInfo = await sampleCreateContent(libraryInfo);

    // Set custom contract
    myContractAddress = "0x9Ee3cF760524E6564b0Bbe75E536C4900A896113";
    client.ethClient.SetCustomContract(contentInfo.contractAddress, myContractAddress);

    console.log("UPDATE CONTENT");

    await sampleUpdateContent(libraryInfo, contentInfo)
}

sample()
