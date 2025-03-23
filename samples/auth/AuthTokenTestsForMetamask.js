/**
 * AuthToken
 *
 * Create plain tokens (and optionally accessRequest transaction-based tokens)
 *
 * export PRIVATE_KEY - set to the private key of an account with
 *                      rights to the content object.
 */

const { ElvClient } = require("../../src/ElvClient");

const networkName = "demo"; // "main" or "demo"

const objectId = "iq__43HBatpRLVM2LwEUxChe7C9eBRMo";
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

const MakePlainToken = async ({client}) => {

  const token = await client.authClient.AuthorizationToken({
    noAuth: true  // Don't create an accessRequest blockchain transaction
  });

  return token;
}

const MakeScopedPlainToken = async ({client}) => {

  const token = await client.authClient.AuthorizationToken({
    objectId,
    noAuth: true  // Don't create an accessRequest blockchain transaction
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
  accessToken = await MakePlainToken({client});
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
