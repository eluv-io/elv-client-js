/**
 * EditorSignedToken
 *
 * Create an editor-signed-token and access fabric resources.
 *
 * export PRIVATE_KEY - set to the private key of an account with
 *                      Edit rights to the content object.
 */

const { ElvClient } = require("../../src/ElvClient");

const networkName = "demo"; // "main" or "demo"

const contentHash = "hq__93SK4rgxMarq1ZeDSEu9WJkDoptTKYiA2GmYocK7inMthUssGkG6Q9BREBEhNtVCiCBFsPd4Gd";

const Setup = async () => {

  client = await ElvClient.FromNetworkName({networkName});
  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  client.SetSigner({signer});
  client.ToggleLogging(false);

  return client;
}

const MakeEditorSignedToken = async () => {

  const token = await client.CreateSignedToken({
    versionHash: contentHash,
	  duration: 60 * 60 * 1000 // millisec
  });

  return token;
}

/**
 * Retrieve title metadata and playout URLs
 */
 const Play = async ({token}) => {

  client.SetStaticToken({ token });

  // First retrieve title metadata (title, synopsis, cast, ...)
  let meta = await client.ContentObjectMetadata({
    versionHash: contentHash,
    metadataSubtree: "/public/asset_metadata"
  });
  console.log("META", meta);

  // Retrieve playout info (DASH and HLS URLs)
  let res = await client.PlayoutOptions({
    versionHash: contentHash,
    drms: ["clear", "aes-128", "fairplay", "widevine"]
  });

  return res;
}

const Run = async () => {

  client = await Setup();

  // Create an editor-signed access token
  accessToken = await MakeEditorSignedToken({});
  console.log("TOKEN", accessToken);

  // Access content and play
  let playoutOptions = await Play({token: accessToken});
  console.log("PLAYOUT", JSON.stringify(playoutOptions, null, 2));
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

Run();
