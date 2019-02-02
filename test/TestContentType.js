const { ElvClient } = require("./src/ElvClient.js");

const Path = require("path");
const fs = require("fs");

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
  //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
  //  privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
  accountName: "Serbans",
  privateKey: "efab66c11603800aaaf5ebf135ea1c23393994c4854346949481960a7a3e2573"
});

client.SetSigner({signer});

const bitcodePath = "../elv-media-platform/bitcode"; // PENDING(SSS) configure this properly
const appsPath = "../elv-media-platform/apps";
const schemaPath = "../elv-media-platform/schemas";

/* Helper - read the specified files and format them to be used by UploadFiles
 *
 * @namedParams
 * @param {} array of {path: "", name: ""} where name is manageApp.html, etc (per content type spec)
 */
const PrepareFiles = (files) => {
  let fileInfo = [];

  files.forEach(item => {
    const fileData = fs.readFileSync(item.path);
    fileInfo.push({
      path: item.name,
      type: "file",
      size: fileData.length,
      data: fileData
    });
  });
  return fileInfo;
};

const TestContentType = async () => {

  contentSpaceId = "ispc22PzfU3u1xzJdMpzBfmhoAF1Ucnc";

  const contract = "0xE4E89323A53f23283197D532c743eecC2DE3C454"; // campaign manager

  const md = {name: "campaign_manager", 'eluv.name': "campaign_manager",
	      class: "content_type",
	      test: "SS001"};
  const bitcode = fs.readFileSync(Path.join(bitcodePath, "adsmanager.bc"));
  const schemaCampaignManager = JSON.parse(fs.readFileSync(Path.join(schemaPath, "campaign_manager.json"), "utf8"));
  const appPathsCampaignManager = [{path: "../elv-media-platform/apps/elv-ads.html", name: "manageApp.html"},
				   {path: "../elv-media-platform/apps/elv-campaign-manager.html", name: "displayApp.html"}];
  const appFilesCampaignManager = PrepareFiles(appPathsCampaignManager);
  const o = await client.CreateContentType2({metadata: md,
					     bitcode: bitcode,
					     appsFileInfo: appFilesCampaignManager,
					     schema: schemaCampaignManager,
					     contract: contract})
  console.log("Content Type: " + o);
};


TestContentType();
