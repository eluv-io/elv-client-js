/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const Path = require("path");

const yargs = require("yargs");
const argv = yargs
  .option("library", {
    description: "ID of the library"
  })
  .option("objectId", {
    description: "ID of the object"
  })
  .option("file", {
    type: "string",
    description: "Path to the file to download"
  })
  .option("out", {
    type: "string",
    description: "Path to the output directory"
  })
  .option("config-url", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
  })
  .demandOption(
    ["objectId","file","out"],
    "\nUsage: PRIVATE_KEY=<private-key> node DownloadFile --objectId <object-id> --library <library-Id> --file <file> --out <dir>  (--config-url \"<fabric-config-url>\") ..."
  )
  .argv;

const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]};

const FileDownload = async ({
  library,
  objectId,
  file,
  out
}) => {
  const client = await ElvClient.FromConfigurationUrl({
    configUrl: ClientConfiguration["config-url"]
  });

  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });

  client.SetSigner({signer});
  try {
    if (fs.existsSync(out)) {
      const info = await client.DownloadFile({
        libraryId : library,
        objectId : objectId,
        filePath : file,
        format : "buffer"
      });

      outFilePath = Path.join(out,Path.parse(file).base);
      fs.writeFileSync(outFilePath, info);
      console.log(`\nSuccessfully downloaded file: ${outFilePath}`);
    } else {
      console.error(`Directory does not exist: ${out}`);
    }
  } catch(error) {
    console.error("Error downloading file:");
    console.error(error);
  }
};

let {library, objectId, file, out} = argv;

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  return;
}

FileDownload({
  library,
  objectId,
  file,
  out
});
