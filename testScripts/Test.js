const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});

    client.HttpClient.uriIndex = 1;

    const libraryId = "ilibMeiZ3F266sx1hk3QvccVsLhQKfp";
    const objectId = "iq__3vpkCFRq9GkCDknRgXZeaCcxVtcV";


    const {write_token} = await client.EditContentObject({libraryId, objectId});

    //const write_token = "tqw_3Gf8m5pm1kug7Mcwji4PNnZD5qKgpAdUk";

    await client.UploadFilesFromS3({
      libraryId,
      objectId,
      writeToken: write_token,
      region: "us-west-1",
      bucket: "eluvio-mez-test",
      filePaths: [
        "ENTIRE_CREED_2min_.mp4"
      ],
      accessKey: "AKIARUSRUCETHFADF7UN",
      secret: "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"
    });

    await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: write_token
    });
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
