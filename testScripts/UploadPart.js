const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");

const Test = async (filename, chunkSize, encrypt) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: "https://main.net955210.contentfabric.io/config"
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});

    const file = fs.readFileSync(filename);

    const libraryId = "ilibcRF2dvDZQsmu37WGgK6MTcL7XjH";
    const objectId = "iq__2LiTg1c5rGBMwCo169SJqc2vpTZB";

    const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;


    const encryption = encrypt ? "cgck" : "none";


    const partWriteToken = await client.CreatePart({libraryId, objectId, writeToken, encryption});

    const totalChunks = Math.ceil(file.length / chunkSize);

    console.log("\nEncryption:", encryption);
    console.log("Chunk Size:", chunkSize);
    console.log("Total Chunks:", totalChunks, "\n");

    console.time("UPLOAD");
    for(let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
      const from = chunkNumber * chunkSize;
      const to = (from + Number(chunkSize)) > file.length ? file.length : from + Number(chunkSize);

      console.time("CHUNK");
      await client.UploadPartChunk({
        libraryId,
        objectId,
        writeToken,
        partWriteToken,
        chunk: file.slice(from, to),
        encryption
      });
      console.timeEnd("CHUNK");
    }

    console.timeEnd("UPLOAD");
    await client.FinalizePart({libraryId, objectId, writeToken, partWriteToken, encryption});


    await client.FinalizeContentObject({libraryId, objectId, writeToken});
  } catch(error) {
    console.error(error);
  }
};

const filename = process.argv[2];
const chunkSize = process.argv[3];
const encrypt = process.argv[4];
if(!filename || !chunkSize) {
  console.error(
    "\nUsage: PRIVATE_KEY=<private-key> node UploadPart.js <filename> <chunksize> <encrypt>\n"
  );

  return;
}

Test(filename, chunkSize, encrypt);
