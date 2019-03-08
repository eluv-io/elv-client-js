/* eslint-disable no-console,no-unused-vars,no-constant-condition */

const { ElvClient } = require("../src/ElvClient.js");

const Path = require("path");
const fs = require("fs");

const ContentSpaceContract = require("../src/contracts/BaseContentSpace");
const ContentLibraryContract = require("../src/contracts/BaseLibrary");
const ContentContract = require("../src/contracts/BaseContent");

const AdmgrMarketPlace = require("../src/contracts/AdmgrMarketPlace");
const AdmgrCampaignManager = require("../src/contracts/AdmgrCampaignManager");
const AdmgrAdvertisement = require("../src/contracts/AdmgrAdvertisement");

const ClientConfiguration = require("../TestConfiguration.json");

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
  accountName: "Serbans",
  privateKey: "1482699ff0483ee9f430820c55e6616b3b23ccfa97889d552d85de51f645dbfa" //955301
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

const MakeMediaCommOff = async (emp, name, libraryId, copyFromHash, campaignManager, offeringId, offeringLib) => {

  try {

    // TO REMOVE
    console.log("EMP: " + empId);
    emp = await client.PublicLibraryMetadata({libraryId: empId, metadataSubtree: "/emp"});
    console.log("EMP: " + JSON.stringify(emp));
    //

    const typeObj = await client.ContentObject({
      libraryId: contentSpaceLibraryId,
      objectId: emp.content_types.sponsored_content
    });

    const draft = await client.CopyContentObject({
      libraryId: libraryId,
      originalVersionHash: copyFromHash,
      options: {
        "type" : typeObj.hash,
        "meta" : {
          "name": name, "eluv.name": name,
          "campaign_manager": campaignManager,
          "commercial_offering" : offeringId + "@" + offeringLib
        }
      }
    });

    // SS TEMPORARY for testing
    const video = fs.readFileSync("../demo/media/ads/Heineken.mp4");
    const uploadVideo = await client.UploadPart({
      libraryId: libraryId,
      writeToken: draft.write_token,
      data: video,
      encrypted: false
    });

    await client.MergeMetadata({
      libraryId: libraryId,
      objectId: draft.id,
      writeToken: draft.write_token,
      metadata: {
        "video" : uploadVideo.part.hash,
        "video_tags": [
          {
            "tags": [
              {
                "score": 0.8,
                "tag": "chocolate"
              }
            ],
            "time_in": "00:00:00.000",
            "time_out": "10:00:00.000"
          }
        ]
      }
    });

    const q = await client.FinalizeContentObject({
      libraryId: libraryId,
      writeToken: draft.write_token
    });

    // Retrieve commercial offering custom contract
    const cc = await client.CustomContractAddress({libraryId: offeringLib, objectId: offeringId});
    console.log("DBG offering cc: " + cc);

    // Set the custom contract of the new commercial offering mediia
    const setcc = await client.SetCustomContentContract({objectId: q.id, customContractAddress: cc});

    console.log("    AVMaster Commercial OFfering - " + name + ": " + q.id);


  } catch(e) {
    console.log(e);
  }

};

const emp = {};

const lib = "ilib2iqhxv6Dz1hDQYkuB48rhkzo4sX8"; // Library Acme Commercial OFferings
const orig = "hq__QmYpHwLte6AoDCZBT7yGKVMmm8cgpBeZE2CSefq7CJ9ev5";
const campaignManager = "ilibXvNW1JUhGYQxGcJYJWvPorMRXL8";
const offeringId = "iq__4R9eed8XjoaYSyNuveFk6LB6kaFa";
const offeringLib = "ilibEYXJqXEZ5eeZKKeaDNNudjrJBNk";

MakeMediaCommOff(
  emp,
  "SSTEST 4 CO",
  lib,
  orig,
  campaignManager,
  offeringId,
  offeringLib
);
