const { ElvClient } = require("../src/ElvClient");
const { ElvWalletClient } = require("../src/walletClient/index");
const ClientConfiguration = require("../TestConfiguration.json");
const fs = require("fs");

const createHash = require("node:crypto").createHash;
const MD5 = str => {
  const f = createHash("md5");
  f.update(str);
  return f.digest("hex");
};

const Test = async () => {
  try {
    const client = await ElvClient.FromNetworkName({
      networkName: "demo"
    });

    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    const dirname = `upload-test-${Date.now()}`;
    const fileList = fs.readdirSync("/Users/kevin/Downloads/upload-test");
    const fileInfo = fileList.map(filename => {
      const data = fs.readFileSync(`/Users/kevin/Downloads/upload-test/${filename}`);

      return {
        path: `${dirname}/${filename}`,
        size: data.length,
        data
      };
    }).sort(() => Math.random() > 0.5 ? -1 : 1);


    const libraryId = "ilib3Drbefo7VPfWvY1NVup4VZFzDJ68";
    const objectId = "iq__2aqbcJhSKdkuRmAUqs6v99SLRRp";

    const {hash} = await client.EditAndFinalizeContentObject({
      libraryId,
      objectId,
      callback: async ({writeToken}) => {
        await client.UploadFiles({
          libraryId,
          objectId,
          writeToken,
          //callback: console.log,
          //encryption: "cgck",
          fileInfo
        });
      }
    });

    console.log("\n\n");
    for(let i = 0; i < fileInfo.length; i++) {
      const {path, data} = fileInfo[i];

      const downloadedData = await client.DownloadFile({
        versionHash: hash,
        format: "buffer",
        filePath: path
      });

      console.log(path);
      console.log(MD5(data.toString()));
      console.log(MD5(downloadedData.toString()));
      console.log(MD5(data.toString()) === MD5(downloadedData.toString()));
      console.log();
    }
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

Test();
