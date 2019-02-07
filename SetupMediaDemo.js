const { ElvClient } = require("./src/ElvClient.js");

const Path = require("path");
const fs = require("fs");

const ContentSpaceContract = require("./src/contracts/BaseContentSpace");
const ContentLibraryContract = require("./src/contracts/BaseLibrary");
const ContentContract = require("./src/contracts/BaseContent");

const AdmgrMarketPlace = require("./src/contracts/AdmgrMarketPlace");
const AdmgrCampaignManager = require("./src/contracts/AdmgrCampaignManager");
const AdmgrAdvertisement = require("./src/contracts/AdmgrAdvertisement");

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

const empId = process.argv[2];

const contentSpaceAddress = client.utils.HashToAddress(client.contentSpaceId);
const contentSpaceLibraryId = client.utils.AddressToLibraryId(contentSpaceAddress);

const demo = {};

const MakeCampaignManager = async (emp, name, nameId) => {

  // Make library for campaigns
  const libraryCampaigns = await client.CreateContentLibrary({
    name: "Campaigns Repository - " + name,
    description: "Repository for campaigns associated with " + name,
    publicMetadata: {
      "campaign_manager_libraryId": emp.ads_marketplace,
      "campaign_manager_name": name,
      "campaign_manager_objectId": "unset"
    }
  });

  const typeObj = await client.ContentObject({
    libraryId: contentSpaceLibraryId,
    objectId: emp.content_types.campaign_manager
  });

  // Make the campaign manager object
  const cmgrDraft = await client.CreateContentObject({
    libraryId: emp.ads_marketplace,
    options: {
      "type" : typeObj.hash,
      "meta" : {
	"campaign_content_type_id" : emp.content_types.campaign,
	"test": "SS001", "campaigns_library": libraryCampaigns,
	"name": name, "eluv.name": name
      }
    }
  });
  const cmgr = await client.FinalizeContentObject({
    libraryId: emp.ads_marketplace,
    writeToken: cmgrDraft.write_token
  });

  // Retrieve cusstom contract fom the campaign manager
  const contractAddress = client.utils.HashToAddress(cmgr.id);
  const customContractAddress = await client.CallContractMethod({
    contractAddress: contractAddress,
    abi: ContentContract.abi,
    methodName: "contentContractAddress",
    methodArgs: []
  });

  // Update library content types list
  await client.AddLibraryContentType({
    libraryId: libraryCampaigns,
    typeId: emp.content_types.campaign,
    customContractAddress: customContractAddress
  });
  console.log("    Campaign Repository Library: " + libraryCampaigns);

  // Update campaigns library metadata
  await client.ReplacePublicLibraryMetadata({
    libraryId: libraryCampaigns,
    metadataSubtree: "campaign_manager_objectId",
    metadata: cmgr.id
  });
  demo.campaign_managers[nameId] = cmgr.id;
  console.log("    Campaign Manager - " + name + ": " + cmgr.id + " hash: " + cmgr.hash);
};

const MakeChannel = async (emp, name) => {

  const typeObj = await client.ContentObject({
    libraryId: contentSpaceLibraryId,
    objectId: emp.content_types.channel
  });

  // Make the channel object
  const chanDraft = await client.CreateContentObject({
    libraryId: emp.channels,
    options: {
      "type" : typeObj.hash,
      "meta" : {
	"name": name, "eluv.name": name
      }
    }
  });
  const chan = await client.FinalizeContentObject({
    libraryId: emp.channels,
    writeToken: chanDraft.write_token
  });
  console.log("    Channel - " + name + ": " + chan.id + " hash: " + chan.hash);
};

const MakeCampaign = async (emp, name, campaignManager) => {

  const typeObj = await client.ContentObject({
    libraryId: contentSpaceLibraryId,
    objectId: emp.content_types.campaign
  });

  // Get the campaign manager 'campaigns library'
  const campaignManagerMeta = await client.ContentObjectMetadata({
    libraryId: emp.ads_marketplace,
    objectId: campaignManager
  });


  const adsMeta = {};
  adsMeta[demo.ads.axe] = {
    "library" : demo.ads_library,
    "max_payout" : 10,
    "name" : "Axe",
    "tags" : {
      "sports": 0.7,
      "chocolate": 0.3,
      "_other" : 0.1
    }
  };
  adsMeta[demo.ads.heineken] = {
    "library" : demo.ads_library,
    "max_payout" : 10,
    "name" : "Heineken",
    "tags" : {
      "beer": 1.4,
      "drinking": 0.8,
      "summer": 0.3,
      "_other" : 0.1
    }
  };

  // Make the campagin obnect
  const draft = await client.CreateContentObject({
    libraryId: campaignManagerMeta.campaigns_library,
    options: {
      "type" : typeObj.hash,
      "meta" : {
	"name": name, "eluv.name": name,
	"ads" : adsMeta,
      }
    }
  });
  const campaign = await client.FinalizeContentObject({
    libraryId: campaignManagerMeta.campaigns_library,
    writeToken: draft.write_token
  });

  // Send funds
  campaignAddress = client.utils.HashToAddress(campaign.id);
  await client.SendFunds({recipient: campaignAddress, ether: 20});
  console.log("    Campaign - " + name + ": " + campaign.id);
}

const MakeAds = async (emp, name, nameId, fileImg, fileVideo) => {

  const typeObj = await client.ContentObject({
    libraryId: contentSpaceLibraryId,
    objectId: emp.content_types.advertisement
  });

  const adDraft = await client.CreateContentObject({
    libraryId: demo.ads_library,
    options: {
      "type" : typeObj.hash,
      "meta" : {
	"name": name, "eluv.name": name
      }
    }
  });
  const img = fs.readFileSync(fileImg);
  const uploadImg = await client.UploadPart({
    libraryId: demo.ads_library,
    writeToken: adDraft.write_token,
    data:img,
    encrypted: false
  });
  const video = fs.readFileSync(fileVideo);
  const uploadVideo = await client.UploadPart({
    libraryId: demo.ads_library,
    writeToken: adDraft.write_token,
    data: video,
    encrypted: false
  });

  await client.MergeMetadata({
    libraryId: demo.ads_library,
    objectId: adDraft.id,
    writeToken: adDraft.write_token,
    metadata: {
      "image" : uploadImg.part.hash,
      "video" : uploadVideo.part.hash
    }
  });

  const ad = await client.FinalizeContentObject({
    libraryId: demo.ads_library,
    writeToken: adDraft.write_token
  });
  demo.ads[nameId] = ad.id;
  console.log("    Advertisement - " + name + ": " + ad.id);

}

const MakeCommercialOffering = async (emp, name) => {
  const typeObj = await client.ContentObject({
    libraryId: contentSpaceLibraryId,
    objectId: emp.content_types.commercial_offering
  });

  const draft = await client.CreateContentObject({
    libraryId: emp.commercial_offerings,
    options: {
      "type" : typeObj.hash,
      "meta" : {
	"name": name, "eluv.name": name
      }
    }
  });

  // SSS HERE
}

const SetupMediaDemo = async () => {

  console.log("EMP: " + empId);

  // Read media platform metadata
  const emp = await client.PublicLibraryMetadata({libraryId: empId, metadataSubtree: "/emp"});
  console.log("EMP: " + JSON.stringify(emp));

  console.log("Creating libraries:");

  // Make library - Ads
  const libraryIdAds = await client.CreateContentLibrary({
    name: "Ads Library",
    description: "Ads Library",
    publicMetadata: {
    }
  });
  await client.AddLibraryContentType({
    libraryId: libraryIdAds,
    typeId: emp.content_types.advertisement,
    customContractAddress: emp.contracts.advertisement.address
  });
  demo.ads_library = libraryIdAds;
  console.log("    Ads Library: " + libraryIdAds);

  // Make library - Media Archive
  const libraryIdMedia = await client.CreateContentLibrary({
    name: "Acme Media Archive",
    description: "Acme Media Archive",
    publicMetadata: {
    }
  });
  await client.AddLibraryContentType({
    libraryId: libraryIdMedia,
    typeId: emp.content_types.avmaster_imf,
    customContractAddress: null
  });
  console.log("    Acme Media Archive: " + libraryIdMedia);

  // Make library - Acme Commercial Offering
  const libraryIdCO = await client.CreateContentLibrary({
    name: "Acme Commercial Offering",
    description: "Acme Commercial Offering",
    publicMetadata: {
    }
  });
  await client.AddLibraryContentType({
    libraryId: libraryIdCO,
    typeId: emp.content_types.sponsored_content,
    customContractAddress: null
  });
  console.log("    Acme Commercial Offering: " + libraryIdCO);

  demo.campaign_managers = {};
  await MakeCampaignManager(emp, "Open Market Campaign Manager", "open_market");
  await MakeCampaignManager(emp, "Dedicated Campaign Manager", "dedicated");

  await MakeChannel(emp, "Acme All Day");
  await MakeChannel(emp, "Acme Spring Special");

  demo.ads = {};
  await MakeAds(emp, "Axe", "axe",
		"../demo/media/ads/axe.png", "../demo/media/ads/Axe Effect.mp4");
  await MakeAds(emp, "Heineken", "heineken",
		"../demo/media/ads/heineken.png", "../demo/media/ads/Heineken.mp4");
  await MakeAds(emp, "Japp La Porsche", "japp",
		"../demo/media/ads/japp.png", "../demo/media/ads/Japp La Porsche.mp4");
  await MakeAds(emp, "Evinrude", "evinrude",
		"../demo/media/ads/evinrude.png", "../demo/media/ads/Evinrude Short.mp4");

  try {
    await MakeCampaign(emp, "Creative Campaign for Spring", demo.campaign_managers.open_market);
    await MakeCampaign(emp, "Dedicated Campaign Axe and Stuff", demo.campaign_managers.dedicated);
  } catch (e) {
    console.log(e);
  }

};

SetupMediaDemo();
