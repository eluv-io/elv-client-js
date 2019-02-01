const { ElvClient } = require("./src/ElvClient.js");

const ContentSpaceContract = require("./src/contracts/BaseContentSpace");
const ContentLibraryContract = require("./src/contracts/BaseLibrary");
const ContentContract = require("./src/contracts/BaseContent");

const AdmgrMarketPlace = require("./src/contracts/AdmgrMarketPlace");
const AdmgrCampaignManager = require("./src/contracts/AdmgrCampaignManager");
const AdmgrAdvertisement = require("./src/contracts/AdmgrAdvertisement");
const AdmgrSponsoredContent = require("./src/contracts/AdmgrSponsoredContent");

const ClientConfiguration = require("./TestConfiguration.json");

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
    //accountName: "Alice",
    //privateKey: "04832aec82a6572d9a5782c4af9d7d88b0eb89116349ee484e96b97daeab5ca6"
    //  privateKey: "1307df44f8f5033ec86434a7965234015da85261df149ed498cb29907df38d72"
    accountName: "Owner",
    privateKey: "bf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6"
});

client.SetSigner({signer});

const SetupMediaPlatform = async () => {

    contentSpaceId = "ispc22PzfU3u1xzJdMpzBfmhoAF1Ucnc";

    emp = {
	"contracts":{},
	"content_types":{}
    }

    // Make contract AdsMarketplace
    const deployResultMkt = await client.DeployContract({
	abi: AdmgrMarketPlace.abi,
	bytecode: AdmgrMarketPlace.bytecode
    });
    emp.contracts.marketplace = {"address": deployResultMkt.contractAddress};
    console.log("Contract - AdsMarketPlace: " + deployResultMkt.contractAddress);

    // Make contract CampaignManager
    const deployResultMgr = await client.DeployContract({
	abi: AdmgrCampaignManager.abi,
	bytecode: AdmgrCampaignManager.bytecode
    });
    emp.contracts.campaign_manager = {"address": deployResultMgr.contractAddress};
    console.log("Contract - CampaignManager: " + deployResultMgr.contractAddress);

    // Make contract Advertisement
    const deployResultAd = await client.DeployContract({
	abi: AdmgrAdvertisement.abi,
	bytecode: AdmgrAdvertisement.bytecode
    });
    emp.contracts.advertisement = {"address": deployResultAd.contractAddress};
    console.log("Contract - Advertisment: " + deployResultAd.contractAddress);

    // Make contract SponsoredContent
    const deployResultSp = await client.DeployContract({
	abi: AdmgrSponsoredContent.abi,
	bytecode: AdmgrSponsoredContent.bytecode
    });
    emp.contracts.sponsored_content = {"address" : deployResultSp.contractAddress};
    console.log("Contract - SponsoredContent: " + deployResultSp.contractAddress);

    // Make the main library "Eluvio Media Platform"
    const libraryId = await client.CreateContentLibrary({
	name: "Eluvio Media Platform",
	description: "Eluvio Media Platform",
	publicMetadata: {
	    emp
	}
    });
    console.log("\nEluvio Media Platform: " + libraryId);

};

SetupMediaPlatform();
