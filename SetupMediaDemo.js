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
  privateKey: "efab66c11603800aaaf5ebf135ea1c23393994c4854346949481960a7a3e2573"  // 955301
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
    }
  });
  await client.AddLibraryContentType({
    libraryId: libraryCampaigns,
    typeId: emp.content_types.campaign,
    customContractAddress: null
  });
  console.log("    Campaign Repository Library: " + libraryCampaigns);

  const typeObj = await client.ContentObject({
    libraryId: contentSpaceLibraryId,
    objectId: emp.content_types.campaign_manager
  });

  console.log("    dbg: " + typeObj.hash);

  // Make the campaign manager object
  const cmgr = await client.CreateContentObject({
    libraryId: emp.ads_marketplace,
    options: {
      "type" : typeObj.hash,
      "meta" : {"test": "SS001", "campaigns_library": libraryCampaigns}
    }
  });
  console.log("    Campaign Manager: " + cmgr);
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
    name: "Media Archive",
    description: "Media Archive",
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
    name: "Commercial Offering",
    description: "Commercial Offering",
    publicMetadata: {
    }
  });
  await client.AddLibraryContentType({
    libraryId: libraryIdCO,
    typeId: emp.content_types.sponsored_content,
    customContractAddress: emp.contracts.sponsored_content.address
  });
  console.log("    Commercial Offering: " + libraryIdCO);

  MakeCampaignManager(emp, "Open Market Campaign Manager");
  MakeCampaignManager(emp, "Dedicated Campaign Manager");
};

SetupMediaDemo();
