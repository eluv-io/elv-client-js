const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const ClientConfiguration = require("../TestConfiguration.json");
if(typeof Buffer === "undefined") { Buffer = require("buffer/").Buffer; }

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});


    const libraryId = "ilib4Cg6nGmJ22tvCH5z3rL3DGyK9NNb";
    const objectId = "iq__4U6dfEgv5EFQmzWSgfvwQkoM7pgW";

    const {write_token} = await client.EditContentObject({libraryId, objectId});
    await client.ReplaceMetadata({libraryId, objectId,
    writeToken: write_token,
      metadataSubtree: "public/asset_metadata/info/talent/test/0/character_name",
      metadata: null
    })

    await client.FinalizeContentObject({libraryId, objectId, writeToken: write_token});

    return;


    // Parts
    fs.writeFileSync("TestChunkedPart.mp4", "");
    await client.DownloadPart({
      libraryId: "ilibF4heaUUdDxYMNupGoJbsYvwAacu",
      objectId: "iq__32uuNXNP2WZw94fY4MFYtSKaVHoQ",
      partHash: "hqpe4ssSdiLnVvRZi3o7f1uCRMAy9GjrtgBnfvYTmnUmGvXw8s4xb",
      chunked: true,
      chunkSize: 1000000,
      format: "buffer",
      callback: ({bytesFinished, bytesTotal, chunk}) => {
        console.log(bytesFinished, "/", bytesTotal);
        console.log(chunk);
        fs.appendFileSync("TestChunkedPart.mp4", chunk);
      }
    });

    const part = await client.DownloadPart({
      libraryId: "ilibF4heaUUdDxYMNupGoJbsYvwAacu",
      objectId: "iq__32uuNXNP2WZw94fY4MFYtSKaVHoQ",
      partHash: "hqpe4ssSdiLnVvRZi3o7f1uCRMAy9GjrtgBnfvYTmnUmGvXw8s4xb",
      format: "buffer",
      callback: ({bytesFinished, bytesTotal}) => {
        console.log(bytesFinished, "/", bytesTotal);
      }
    });
    fs.writeFileSync("TestWholePart.mp4", part);

    // Files
    fs.writeFileSync("TestChunkedFile.mp4", "");
    await client.DownloadFile({
      libraryId: "ilibF4heaUUdDxYMNupGoJbsYvwAacu",
      objectId: "iq__32uuNXNP2WZw94fY4MFYtSKaVHoQ",
      filePath: "bigbuckbunny_720x480_30mb_timecode_25_1.mp4",
      format: "buffer",
      chunked: true,
      callback: ({bytesFinished, bytesTotal, chunk}) => {
        console.log(bytesFinished, "/", bytesTotal);
        fs.appendFileSync("TestChunkedFile.mp4", chunk);
      }
    });

    const file  = await client.DownloadFile({
      libraryId: "ilibF4heaUUdDxYMNupGoJbsYvwAacu",
      objectId: "iq__32uuNXNP2WZw94fY4MFYtSKaVHoQ",
      filePath: "bigbuckbunny_720x480_30mb_timecode_25_1.mp4",
      format: "buffer",
      callback: ({bytesFinished, bytesTotal}) => {
        console.log(bytesFinished, "/", bytesTotal);
      }
    });
    fs.writeFileSync("TestWholeFile.mp4", file);

    /*

    // Parts
    fs.writeFileSync("TestChunkedPart.mp4", "");
    await client.DownloadPart({
      libraryId: "ilibF4heaUUdDxYMNupGoJbsYvwAacu",
      objectId: "iq__32uuNXNP2WZw94fY4MFYtSKaVHoQ",
      partHash: "hqp_2cZdN54Q1G1EgBKbjQABSq89gpZbQ5vygJSmCzsTVKAvGqk8rR",
      chunked: true,
      chunkSize: 1000000,
      format: "buffer",
      callback: ({bytesFinished, bytesTotal, chunk}) => {
        console.log("Chunked Part")
        console.log(bytesFinished, "/", bytesTotal);
        console.log(chunk);
        fs.appendFileSync("TestChunkedPart.mp4", chunk);
      }
    });

    const part = await client.DownloadPart({
      libraryId: "ilibF4heaUUdDxYMNupGoJbsYvwAacu",
      objectId: "iq__32uuNXNP2WZw94fY4MFYtSKaVHoQ",
      partHash: "hqp_2cZdN54Q1G1EgBKbjQABSq89gpZbQ5vygJSmCzsTVKAvGqk8rR",
      format: "buffer",
      callback: ({bytesFinished, bytesTotal}) => {
        console.log("Whole Part")
        console.log(bytesFinished, "/", bytesTotal);
      }
    });
    fs.writeFileSync("TestWholePart.mp4", part);

    // Files
    fs.writeFileSync("TestChunkedFile.mp4", "");
    await client.DownloadFile({
      libraryId: "ilibF4heaUUdDxYMNupGoJbsYvwAacu",
      objectId: "iq__32uuNXNP2WZw94fY4MFYtSKaVHoQ",
      filePath: "tc_29.97fps_df_60min.mp4",
      format: "buffer",
      chunked: true,
      callback: ({bytesFinished, bytesTotal, chunk}) => {
        console.log("Chunk File");
        console.log(bytesFinished, "/", bytesTotal);
        fs.appendFileSync("TestChunkedFile.mp4", chunk);
      }
    });

    const file  = await client.DownloadFile({
      libraryId: "ilibF4heaUUdDxYMNupGoJbsYvwAacu",
      objectId: "iq__32uuNXNP2WZw94fY4MFYtSKaVHoQ",
      filePath: "tc_29.97fps_df_60min.mp4",
      format: "buffer",
      callback: ({bytesFinished, bytesTotal}) => {
        console.log("Whole File");
        console.log(bytesFinished, "/", bytesTotal);
      }
    });
    fs.writeFileSync("TestWholeFile.mp4", file);

 */
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
