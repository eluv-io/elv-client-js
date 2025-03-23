/**
 * Image
 *
 * Retrieve images using various methods.
 */

const { ElvClient } = require("../../src/ElvClient");

const networkName = "demo"; // "main" or "demo"

const Setup = async () => {

  let client = await ElvClient.FromNetworkName({networkName});
  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  client.SetSigner({signer});
  client.ToggleLogging(false);

  return client;
}

/**
 * Retrieve an image as a file.
 * Optionally resize to a given width.
 */
const ImageFile = async ({client}) => {
  const contentHash = "hq__HUZ5hbejxZXhz5iXkoy4FYM2pmJXYSGmYJCbkyKERJE9KsGK1d6ZSe2XDdvUXepwE9wgMRGijg";
  const filePath = "/assets/test.jpg";

  // Retrieve image file
  let res = await client.FileUrl({
    versionHash: contentHash,
    filePath
  });

  return res;
}

/**
 * Retrieve an image using the 'rep' and on offering
 */
 const ImageWithOffering = async ({client}) => {
  const contentHash = "hq__HUZ5hbejxZXhz5iXkoy4FYM2pmJXYSGmYJCbkyKERJE9KsGK1d6ZSe2XDdvUXepwE9wgMRGijg";
  const filePath = "/assets/test.jpg";

  let offering = 'watermark';

  // Retrieve image
  let res = await client.FabricUrl({
    versionHash: contentHash,
    rep: 'image/' + offering + "/files" + filePath
  });

  return res;
}

const Run = async () => {

  let client = await Setup();

  let url = await ImageFile({client});
  console.log("IMAGE URL", url);

  let offeringUrl = await ImageWithOffering({client});
  console.log("IMAGE OFFERING URL", JSON.stringify(offeringUrl));
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

Run();
