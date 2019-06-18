/* eslint-disable no-unused-vars,no-console */
const { ElvClient } = require("../src/ElvClient.js");
const { ElvMediaPlatform } = require("./ElvMediaPlatformClient.js");
const { ImfService } = require("./SetupImf.js");

const Path = require("path");
const fs = require("fs");

const ClientConfiguration = require("../TestConfiguration.json");

if(process.argv.length < 5) {
  console.log("Usage: <private-key> <emp> <media-archive-lib-id>");
  process.exit(1);
}

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
  accountName: "Serbans",
  privateKey: process.argv[2],
});

client.SetSigner({signer});

const assetsDir = "../demo/media/.large_assets";

const empId = process.argv[3];

let demo = {};
demo.acme_movie_archive = process.argv[4];

const contentSpaceAddress = client.utils.HashToAddress(client.contentSpaceId);
const contentSpaceLibraryId = client.utils.AddressToLibraryId(contentSpaceAddress);

const ReadDir = (path) => {

  var pathlist = [];
  const dir = fs.readdirSync(path, {withFileTypes: true});

  console.log("Read dir: " + path);
  dir.forEach(item => {
    const itemPath = Path.join(path, item.name);
    console.log("- path: " + itemPath);
    if(item.isFile()) {
      pathlist.push(itemPath);
    } else if(item.isDirectory()) {
      dirpath = ReadDir(itemPath);
      console.log("Subdir dirpath: " + JSON.stringify(dirpath));
      pathlist = pathlist.concat(dirpath);
    }
  });
  return pathlist;
};


const MakeIMFs = async (assets) => {

  // Read media platform metadata
  const emp = await client.PublicLibraryMetadata({libraryId: empId, metadataSubtree: "/emp"});
  console.log("EMP: " + JSON.stringify(emp));

  await MakeIMF(emp, demo, assets.starwars);
  await MakeIMF(emp, demo, assets.coral);
  await MakeIMF(emp, demo, assets.meridian);
};

const MakeIMF = async (emp, demo, asset) => {
  try {
    let imf = new ImfService(client);

    const dir = Path.join(assetsDir, asset.path);
    //const dir = "/s/QCODE/TEST/MEDIA/IMF-STARWARS-v3";
    const pathlist = await ReadDir(dir);

    const typeObj = await client.ContentObject({
      libraryId: contentSpaceLibraryId,
      objectId: emp.content_types.avmaster_imf
    });

    const payload = {
      name: asset.name,
      libraryId: demo.acme_movie_archive,
      files: pathlist,
      type: typeObj.hash,
      video_tags: asset.video_tags
    };

    console.log("Creating IMF: " + asset.name + " payload: " + JSON.stringify(payload));
    const q = await imf.createImfTitle(payload);
    console.log("Content IMF: " + asset.name + " id: " + q.id + " hash: " + q.hash);
  } catch (err){
    console.log(err);
  }
};

/* Asset metadata */

var assets = {"starwars":{}, "coral":{}, "meridian":{}};

assets.starwars.path = "IMF-STARWARS";
assets.starwars.name = "Star Wars (IMF)";

assets.coral.path= "IMF-CORAL";
assets.coral.name = "Blue Planet - Coral (IMF)";

assets.meridian.path = "IMF-MERIDIAN-30fps";
assets.meridian.name = "Meridian (IMF)";

assets.starwars.video_tags =
[
  {
    "tags": [
      {
        "tag": "Star Wars",
        "score": 0.99
      },
      {
        "tag": "Darth Vader",
        "score": 0.72
      },
      {
        "tag": "Jedi",
        "score": 0.60
      },
      {
        "tag": "R2-D2",
        "score": 0.47
      },
      {
        "tag": "Stormtrooper (Star Wars)",
        "score": 0.13
      }
    ],
    "time_in": "00:00:00.000",
    "time_out": "01:00:00.000"
  }
];

assets.coral.video_tags =
[
  {
    "tags": [
      {
        "tag": "Animal",
        "score": 0.2727
      },
      {
        "tag": "Aquarium",
        "score": 0.163949
      },
      {
        "tag": "Fish",
        "score": 0.134049
      }
    ],
    "time_in": "00:00:00.000",
    "time_out": "01:00:00.000"
  }
];

assets.meridian.video_tags =
[
  {
    "tags": [
      {
        "tag": "Car",
        "score": 0.2727
      },
      {
        "tag": "Vehicle",
        "score": 0.163949
      },
      {
        "tag": "Premium Car",
        "score": 0.17961107
      },
      {
        "tag": "Murder",
        "score": 0.17865066
      }
    ],
    "time_in": "00:00:00.000",
    "time_out": "01:00:00.000"
  }
];

MakeIMFs(assets);
