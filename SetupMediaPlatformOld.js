const { ElvClient } = require("./src/ElvClient.js");

const Path = require("path");
const fs = require("fs");

const ContentSpaceContract = require("./src/contracts/BaseContentSpace");
const ContentLibraryContract = require("./src/contracts/BaseLibrary");
const ContentContract = require("./src/contracts/BaseContent");

const AdmgrMarketPlace = require("./src/contracts/AdmgrMarketPlace");
const AdmgrCampaignManager = require("./src/contracts/AdmgrCampaignManager");
const AdmgrAdvertisement = require("./src/contracts/AdmgrAdvertisement");
const AdmgrCommercialOfferingManager = require("./src/contracts/AdmgrCommercialOfferingManager");

const ClientConfiguration = require("./TestConfiguration.json");

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
  accountName: "Serbans",
  //privateKey: "efab66c11603800aaaf5ebf135ea1c23393994c4854346949481960a7a3e2573"  // 955301
  //privateKey: "33235d5d6dbc0b877ce1b505068a7de0e449f77425374d67a4c44f7218c6ddf8" // Ganache
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

const SetupContentTypes = async (client, enp) => {

  ct = {"content_types":{}};

  // Make content type - Campaign
  const mdCampaign = {name: "campaign", 'name': "campaign",
	      class: "content_type",
	      test: "SS002"};
  const appPathsCampaign = [{path: "../elv-media-platform/apps/elv-campaign.html", name: "manageApp.html"},
				   {path: "../elv-media-platform/apps/elv-campaign.html", name: "displayApp.html"}];
  const appFilesCampaign = PrepareFiles(appPathsCampaign);

  const typeCampaign = await client.CreateContentTypeFull({metadata: mdCampaign,
							   bitcode: null,
							   appsFileInfo: appFilesCampaign,
							   schema: {},
							   contract: null})
  ct.content_types.campaign = typeCampaign;
  console.log("Content Type - Campaign: " + typeCampaign);

  // Make contract - CampaignManager
  const md = {name: "campaign_manager", 'name': "campaign_manager",
	      class: "content_type",
	      campaign_content_type: ct.content_types.campaign,
	      test: "SS001"};
  const bitcode = fs.readFileSync(Path.join(bitcodePath, "adsmanager.bc"));
  const schemaCampaignManager = {};
  const appPathsCampaignManager = [{path: "../elv-media-platform/apps/elv-campaign-manager.html", name: "manageApp.html"},
				   {path: "../elv-media-platform/apps/elv-campaign-manager.html", name: "displayApp.html"}];
  const appFilesCampaignManager = PrepareFiles(appPathsCampaignManager);

  const typeCampaignManager = await client.CreateContentTypeFull({metadata: md,
								  bitcode: bitcode,
								  appsFileInfo: appFilesCampaignManager,
								  schema: schemaCampaignManager,
								  contract: emp.contracts.marketplace});
  ct.content_types.campaign_manager = typeCampaignManager;
  console.log("Content Type - CampaignManager: " + typeCampaignManager);

  // Make content type - CommercialOffering
  const mdCommOff = {name: "commercial_offering", 'name': "commercial_offering",
	      class: "content_type",
	      test: "SS002"};
  const appPathsCommOff = [{path: "../elv-media-platform/apps/elv-commercial-offering.html", name: "manageApp.html"},
			   {path: "../elv-media-platform/apps/elv-commercial-offering.html", name: "displayApp.html"}];
  const appFilesCommOff = PrepareFiles(appPathsCommOff);

  const typeCommOff = await client.CreateContentTypeFull({metadata: mdCommOff,
							  bitcode: null,
							  appsFileInfo: appFilesCommOff,
							  schema: {},
							  contract: emp.contracts.commercial_offering_manager});
  ct.content_types.commercial_offering = typeCommOff;
  console.log("Content Type - CommercialOffering: " + typeCommOff);

  // Make content type - Advertisement
  const mdAd = {name: "advertisement", 'name': "advertisement",
	      class: "content_type",
	      test: "SS001"};
  const bitcodeAd = fs.readFileSync(Path.join(bitcodePath, "avmaster2000.imf.bc"));
  const appPathsAd = [{path: "../elv-media-platform/apps/elv-ads.html", name: "manageApp.html"},
		      {path: "../elv-media-platform/apps/elv-ads.html", name: "displayApp.html"}];
  const appFilesAd = PrepareFiles(appPathsAd);

  const typeAd = await client.CreateContentTypeFull({metadata: mdAd,
						     bitcode: bitcodeAd,
						     appsFileInfo: appFilesAd,
						     schema: {},
						     contract: emp.contracts.advertisement})
  ct.content_types.advertisement = typeAd;
  console.log("Content Type - Advertisement: " + typeAd);

  // Make content type - SponsoredContent
  const mdSponsored = {name: "sponsored_content", 'name': "sponsored_content",
	      class: "content_type",
	      test: "SS001"};
  const bitcodeSponsored = fs.readFileSync(Path.join(bitcodePath, "avmaster2000.imf.bc"));
  const appPathsSponsored = [{path: "../elv-media-platform/apps/elv-sponsored-content.html", name: "manageApp.html"},
			     {path: "../elv-media-platform/apps/elv-sponsored-content.html", name: "displayApp.html"}];
  const appFilesSponsored = PrepareFiles(appPathsSponsored);

  const typeSponsored = await client.CreateContentTypeFull({metadata: mdSponsored,
							    bitcode: bitcodeSponsored,
							    appsFileInfo: appFilesSponsored,
							    schema: {},
							    contract: null})
  ct.content_types.sponsored_content = typeSponsored;
  console.log("Content Type - SponsoredContent: " + typeSponsored);

  // Make content type - AVMaster IMF
  const mdIMF = {name: "avmaster_imf", 'name': "avmaster_imf",
		 class: "content_type",
		 test: "SS001"};
  const bitcodeIMF = fs.readFileSync(Path.join(bitcodePath, "avmaster2000.imf.bc"));
  const appPathsIMF = [{path: "../elv-media-platform/apps/elv-avmaster2000.imf-MP-manage.html", name: "manageApp.html"},
		       {path: "../elv-media-platform/apps/elv-avmaster2000.imf-MP-display.html", name: "displayApp.html"}];
  const appFilesIMF = PrepareFiles(appPathsIMF);

  const typeIMF = await client.CreateContentTypeFull({metadata: mdIMF,
						      bitcode: bitcodeIMF,
						      appsFileInfo: appFilesIMF,
						      schema: {},
						      contract: null})
  ct.content_types.avmaster_imf = typeIMF;
  console.log("Content Type - AVMasterIMF: " + typeIMF);

  // Make content type - Channel
  const mdChan = {name: "channel", 'name': "channel",
		 class: "content_type",
		 test: "SS001"};
  const appPathsChan = [];
  const appFilesChan = PrepareFiles(appPathsIMF);

  const typeChan = await client.CreateContentTypeFull({metadata: mdChan,
						       bitcode: null,
						       appsFileInfo: appFilesChan,
						       schema: {},
						       contract: null})
  ct.content_types.channel = typeChan;
  console.log("Content Type - Channels: " + typeChan);

  return ct;
};

const SetupMediaPlatform = async () => {

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

  // Make contract Advertisement
  const deployResultAd = await client.DeployContract({
    abi: AdmgrAdvertisement.abi,
    bytecode: AdmgrAdvertisement.bytecode
  });
  emp.contracts.advertisement = {"address": deployResultAd.contractAddress};
  console.log("Contract - Advertisment: " + deployResultAd.contractAddress);

  // Make contract CommercialOfferingManager
  const deployResultCommOffMgr = await client.DeployContract({
    abi: AdmgrCommercialOfferingManager.abi,
    bytecode: AdmgrCommercialOfferingManager.bytecode
  });
  emp.contracts.commercial_offering_manager = {"address" : deployResultCommOffMgr.contractAddress};
  console.log("Contract - Commercial Offering Manager: " + deployResultCommOffMgr.contractAddress);

  // Make content types
  const ct = await SetupContentTypes(client, emp);
  emp.content_types = ct.content_types;

  // Make library - Ads Marketplace
  const libraryIdAdsMarketplace = await client.CreateContentLibrary({
    name: "Ads Marketplace",
    description: "Ads Marketplace",
    publicMetadata: {
      "name": "Ads Marketplace"
    }
  });
  emp.ads_marketplace = libraryIdAdsMarketplace;

  await client.AddLibraryContentType({
    libraryId: emp.ads_marketplace,
    typeId: emp.content_types.campaign_manager,
    customContractAddress: emp.contracts.marketplace.address
  });
  console.log("Library - Ads Marketplace: " + libraryIdAdsMarketplace);

  // Make library - Commercial Offerings
  const libraryIdCommOffs = await client.CreateContentLibrary({
    name: "Commercial Offerings",
    description: "Special library that creates commercial offerings",
    publicMetadata: {
    }
  });
  emp.commercial_offerings = libraryIdCommOffs;

  await client.AddLibraryContentType({
    libraryId: emp.commercial_offerings,
    typeId: emp.content_types.commercial_offering,
    customContractAddress: emp.contracts.commercial_offering_manager.address
  });
  console.log("Library - Commercial Offerings: " + libraryIdCommOffs);

  // Make library - Channels
  const libraryIdChannels = await client.CreateContentLibrary({
    name: "Channels",
    description: "Library for public channels",
    publicMetadata: {
    }
  });
  emp.channels = libraryIdChannels;
  await client.AddLibraryContentType({
    libraryId: emp.channels,
    typeId: emp.content_types.channel,
    customContractAddress: null
  });
  console.log("Library - Channels: " + libraryIdChannels);

  // Make the main library "Eluvio Media Platform"
  const libraryId = await client.CreateContentLibrary({
    name: "Eluvio Media Platform",
    description: "Eluvio Media Platform",
    publicMetadata: {
      class: "platform",
      emp
    }
  });
  console.log("\nEluvio Media Platform: " + libraryId);
};

SetupMediaPlatform();
