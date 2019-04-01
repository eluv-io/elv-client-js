/* eslint-disable no-console,no-unused-vars,no-constant-condition */
const { ElvClient } = require("../src/ElvClient.js");
const { ElvMediaPlatform } = require("./ElvMediaPlatformClient.js");
const { ImfService } = require("./SetupImf.js");

const Path = require("path");
const fs = require("fs");

const ContentSpaceContract = require("../src/contracts/BaseContentSpace");
const ContentLibraryContract = require("../src/contracts/BaseLibrary");
const ContentContract = require("../src/contracts/BaseContent");

const AdmgrMarketPlace = require("../src/contracts/AdmgrMarketPlace");
const AdmgrCampaignManager = require("../src/contracts/AdmgrCampaignManager");
const AdmgrCampaign = require("../src/contracts/AdmgrCampaign");
const AdmgrAdvertisement = require("../src/contracts/AdmgrAdvertisement");
const AdmgrCommercialOffering = require("../src/contracts/AdmgrCommercialOffering");

const ClientConfiguration = require("../TestConfiguration.json");

if (process.argv.length < 4) {
  console.log("Usage: <private-key> <emp>");
  process.exit(1);
}

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
  accountName: "Serbans",
  privateKey: process.argv[2],
});

client.SetSigner({signer});

const bitcodePath = "../elv-media-platform/bitcode"; // PENDING(SSS) configure this properly
const appsPath = "../elv-media-platform/apps";
const schemaPath = "../elv-media-platform/schemas";

const empId = process.argv[3];

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
        "campaigns_library": libraryCampaigns,
        "campaigns_library_name": "Campaigns Repository - " + name,
        "name": name
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
  demo.campaign_managers[nameId] = {id: cmgr.id, campaigns_library: libraryCampaigns};
  console.log("    Campaign Manager - " + name + ": " + cmgr.id + " hash: " + cmgr.hash);
};

const MakeChannel = async (emp, name, type="vod") => {

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
        "name": name,
        "channelType": type
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
  adsMeta[demo.ads.axe.id] = {
    "library" : demo.ads_library,
    "versionHash" : demo.ads.axe.hash,
    "max_payout" : 10,
    "name" : "Axe",
    "tags" : assets.axe.pay_tags
  };
  adsMeta[demo.ads.heineken.id] = {
    "library" : demo.ads_library,
    "versionHash" : demo.ads.heineken.hash,
    "max_payout" : 10,
    "name" : "Heineken",
    "tags" : assets.heineken.pay_tags
  };
  adsMeta[demo.ads.japp.id] = {
    "library" : demo.ads_library,
    "versionHash" : demo.ads.japp.hash,
    "max_payout" : 10,
    "name" : "Japp",
    "tags" : assets.japp.pay_tags
  };
  adsMeta[demo.ads.evinrude.id] = {
    "library" : demo.ads_library,
    "versionHash" : demo.ads.evinrude.hash,
    "max_payout" : 10,
    "name" : "Evinrude",
    "tags" : assets.evinrude.pay_tags
  };

  // Make the campagin object
  const draft = await client.CreateContentObject({
    libraryId: campaignManagerMeta.campaigns_library,
    options: {
      "type" : typeObj.hash,
      "meta" : {
        "name": name,
        "ads" : adsMeta,
      }
    }
  });
  const campaign = await client.FinalizeContentObject({
    libraryId: campaignManagerMeta.campaigns_library,
    writeToken: draft.write_token
  });

  // Send funds
  const cc = await client.CustomContractAddress({
    libraryId: campaignManagerMeta.campaigns_library,
    objectId: campaign.id});

  const txFunds = await client.SendFunds({recipient: cc, ether: 20});

  // Set ads contract
  const adArgsAxe = [client.utils.HashToAddress(demo.ads.axe.id), "10000000000000000000"];
  const txAxe = await client.CallContractMethodAndWait({
    contractAddress: cc,
    abi: AdmgrCampaign.abi,
    methodName: "setupAd",
    methodArgs: adArgsAxe});

  const adArgsHeineken = [client.utils.HashToAddress(demo.ads.heineken.id), "10000000000000000000"];
  const txHeineken = await client.CallContractMethodAndWait({
    contractAddress: cc,
    abi: AdmgrCampaign.abi,
    methodName: "setupAd",
    methodArgs: adArgsHeineken});

  const adArgsJapp = [client.utils.HashToAddress(demo.ads.japp.id), "10000000000000000000"];
  const txJapp = await client.CallContractMethodAndWait({
    contractAddress: cc,
    abi: AdmgrCampaign.abi,
    methodName: "setupAd",
    methodArgs: adArgsJapp});

  const adArgsEvinrude = [client.utils.HashToAddress(demo.ads.evinrude.id), "10000000000000000000"];
  const txEvinrude = await client.CallContractMethodAndWait({
    contractAddress: cc,
    abi: AdmgrCampaign.abi,
    methodName: "setupAd",
    methodArgs: adArgsEvinrude});

  console.log("    Campaign - " + name + ": " + campaign.id);
};

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
        "name": name,
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
  demo.ads[nameId] = {id: ad.id, hash: ad.hash}
  console.log("    Advertisement - " + name + ": " + ad.id, " ", ad.hash);

};

const MakeCommercialOffering = async (emp, name, nameId, campaignManager, mandatorySponsoring) => {
  const typeObj = await client.ContentObject({
    libraryId: contentSpaceLibraryId,
    objectId: emp.content_types.commercial_offering
  });

  const draft = await client.CreateContentObject({
    libraryId: emp.commercial_offerings,
    options: {
      "type" : typeObj.hash,
      "meta" : {
        "name": name
      }
    }
  });

  await ElvMediaPlatform.SetCommercialOffering({
    client,
    emp,
    libraryId: emp.commercial_offerings,
    objectId: draft.id,
    writeToken: draft.write_token,
    campaignManager: campaignManager,
    mandatorySponsoring: mandatorySponsoring,
    presetAccessCharge: 2,
    mandatoryPresetAccessCharge: false
  });

  const q = await client.FinalizeContentObject({
    libraryId: emp.commercial_offerings,
    writeToken: draft.write_token
  });
  demo.commoff[nameId] = q.id;
  console.log("    Commercial Offering - " + name + ": " + q.id);
};

const SetupMediaDemo = async () => {

  console.log("EMP: " + empId);

  // Read media platform metadata
  const emp = await client.PublicLibraryMetadata({libraryId: empId, metadataSubtree: "/emp"});
  console.log("EMP: " + JSON.stringify(emp));

  if (true) {
    console.log("Creating libraries:");

    // Make library - Ads
    const libraryIdAds = await client.CreateContentLibrary({
      name: "Ads Library", "eluv.name": "Ads Library", // PENDING(SSS) still needed by campaign app
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

    // Make library - Social Contributions
    const libraryIdSocial = await client.CreateContentLibrary({
      name: "Social Contributions",
      description: "Submissiosn by individual contributors",
      publicMetadata: {
      }
    });
    await client.AddLibraryContentType({
      libraryId: libraryIdSocial,
      typeId: emp.content_types.submission,
      customContractAddress: emp.contracts.submission.address
    });
    console.log("    Social Contributions: " + libraryIdSocial);

  } // if (false)

  demo.campaign_managers = {};
  await MakeCampaignManager(emp, "Open Market Campaign Manager", "open_market");
  await MakeCampaignManager(emp, "Dedicated Campaign Manager", "dedicated");

  if (true) {
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

    await MakeCampaign(emp, "Recreation", demo.campaign_managers.open_market.id);
    await MakeCampaign(emp, "Dedicated - Axe and Stuff", demo.campaign_managers.dedicated.id);
  } // if (false)

  try {
    demo.commoff = {};
    await MakeCommercialOffering(emp, "Pay per view - No Ads", "airline",
      null, false); // Only pay option
    await MakeCommercialOffering(emp, "Ad Sponsored - Open Market", "open",
      demo.campaign_managers.open_market, false); // Either pay or ads
    await MakeCommercialOffering(emp, "Ad Sponsored - Dedicated", "dedicated",
      demo.campaign_managers.dedicated, true); // Mandatory ads

  } catch (e) {
    console.log(e);
    console.trace();
  }

};

var assets = {"axe":{}, "japp":{}, "heineken":{}, "evinrude":{}};
assets.axe.pay_tags =  {
  "sports": 0.7,
  "Jedi": 0.5,        // Match Star Wars
  "James Bond": 1,
  "Making Out/Kissing": 1.2,
  "_other" : 0.1
};
assets.heineken.pay_tags =  {
  "beer": 0.7,
  "summer": 0.3,
  "Star Wars": 0.4,   // Match Star Wars
  "_other" : 0.1
};
assets.japp.pay_tags =  {
  "chocolate": 0.7,
  "summer": 0.3,
  "Car": 0.4,         // Match Meridian
  "Premium Car": 1,
  "_other" : 0.1
};
assets.evinrude.pay_tags =  {
  "boat": 0.7,
  "motor": 0.3,
  "Fish": 0.4,        // Match Coral
  "Lake": 0.5,
  "_other" : 0.1
};


SetupMediaDemo();
