const { ElvClient } = require("../src/ElvClient.js");
const { ImfService } = require("./SetupImf.js");

const EluvioAppConfiguration = {
  fabric: {
    contentSpaceId: "ispc22PzfU3u1xzJdMpzBfmhoAF1Ucnc",
    hostname: "192.168.90.211",
    port: 8008,
    use_https: false
  },
  ethereum: {
    hostname: "192.168.90.211",
    port: 8545,
    use_https: false,
  }
};


let elvclient = ElvClient.FromConfiguration({configuration: EluvioAppConfiguration});
let wallet = elvclient.GenerateWallet();
let signer = wallet.AddAccount({
  accountName: "Michael",
  privateKey: "0xdfd4633c3594c3b937428238f9848cc3eb61f3a38f7fd58da0cd9668503bfcce"
});
elvclient.SetSigner({signer});



let imf = new ImfService(elvclient);

let pathlist = [
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/ASSETMAP.xml",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/CPL_4dfae610-d33a-41be-8bf3-8b4951ef4692.xml",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/CPL_5ce5406c-c918-415c-9ccd-603cbba549cd.xml",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/CPL_6534ebfc-a3fa-482c-b68c-fda4dc538175.xml",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/EN_audio_stereo.mxf",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/EN_video_master.mxf",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/IT_audio_stereo.mxf",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/IT_video_title_crawl.mxf",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/JA_video_title_crawl.mxf",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/OPL_English.xml",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/OPL_Italian.xml",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/OPL_Japanese.xml",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/PKL_1415554e-cb1c-45cb-b626-2fbf3431d854.xml",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/ladder.json",
  "/Users/michaelparker/Eluvio/vue2/src/assets/sampleData/star wars dummy/star-wars-poster.jpg"
];

let payload = {
  name: "star wars dummy (will not play)",
  libraryId: "ilib3Pm4LAVC1xziA17BJbusUVZczSi7",
  files: pathlist,
  type: "hq__QmNfM4Ce9UR8nEUVn4F8vhrJLrBE6sz9KPp7oGHoiwv1WY"
};

imf.createImfTitle(payload);

