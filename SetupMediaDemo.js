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

const MakeCampaignManager = async (emp, name) => {

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
  console.log("    Media Archive: " + libraryIdMedia);

  // Make library - Commercial Offering
  const libraryIdCO = await client.CreateContentLibrary({
    name: "Acme Commercial Offering",
    description: "Acme Commercial Offering",
    publicMetadata: {
    }
  });
  await client.AddLibraryContentType({
    libraryId: libraryIdCO,
    typeId: emp.content_types.sponsored_content,
    customContractAddress: emp.contracts.sponsored_content.address
  });
  console.log("    Commercial Offering: " + libraryIdCO);

  await MakeCampaignManager(emp, "Open Market Campaign Manager");
  await MakeCampaignManager(emp, "Dedicated Campaign Manager");

  await MakeChannel(emp, "Acme All Day");
  await MakeChannel(emp, "Acme Spring Special");
};

SetupMediaDemo();
