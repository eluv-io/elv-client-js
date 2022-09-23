/**
 * ClientSignedToken
 *
 * Create a client-signed-token and access fabric resources.
 *
 * Using a private key:
 *   - export PRIVATE_KEY - set to the private key of an account with
 *                          access to the content object.
 *
 * Using a custodial wallet user:
 *   - export ID_TOKEN - set to the JWT id token obtained from the
 *                       open id sign in
 *
 */
const { ElvClient } = require("../../src/ElvClient");

const networkName = "demo"; // "main" or "demo"

const contentHash = "hq__93SK4rgxMarq1ZeDSEu9WJkDoptTKYiA2GmYocK7inMthUssGkG6Q9BREBEhNtVCiCBFsPd4Gd";

const SetupWithCustodialWallet = async () => {

  client = await ElvClient.FromNetworkName({networkName});
  await client.SetRemoteSigner({idToken: process.env.ID_TOKEN, unsignedPublicAuth: true})
  client.ToggleLogging(false);

  return client;
}

const SetupWithPrivateKey = async () => {

  client = await ElvClient.FromNetworkName({networkName});
  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  client.SetSigner({signer});
  client.ToggleLogging(false);

  return client;
}

/**
 * Create a client signed token using the client object's signer.
*/
const MakeClientSignedToken = async ({client}) => {

  const token = await client.CreateFabricToken({
	  duration: 60 * 60 * 1000 // millisec
  });

  console.log("TOKEN", token);
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

  const signer = "custodial_wallet"; // Use "private_key" or "custodial_wallet"

  let token;

  if (process.env.ID_TOKEN) {

    // Initialize client using custodial wallet id token
    client = await SetupWithCustodialWallet();

  } else if (process.env.PRIVATE_KEY) {

    // Initialize client using custodial wallet id token
    client = await SetupWithPrivateKey();

  }

  token = await MakeClientSignedToken({client});

  // Access content and play
  let playoutOptions = await Play({token});
  console.log("PLAYOUT", JSON.stringify(playoutOptions, null, 2));
}

if (!process.env.ID_TOKEN && !process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY or ID_TOKEN");
  return;
}

Run();
