const { ElvClient } = require("../../src/ElvClient");

const networkName = "main"; // "main" or "demo"

const contentHash = "hq__JeguCAwyRqLRZ65Ec3iV2tMsDYFMhfDzS4VMWaX3F4H3mZxG7wpSatWibciBtpGnCbEbeHFrBt";

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

// stand alone (no policy)
// for a specific content
const MakeEditorSignedToken = async () => {

  const token = await client.CreateSignedToken({
    versionHash: contentHash,
	  duration: 60 * 60 * 1000 // millisec
  });

  return token;
}

// Create an editor-signed access token that uses a predefined policy
// - not specific to a content object (rather authorized objects are specified in the context)
const MakeEditorSignedTokenWithPolicy = async () =>  {

  const policyId = "iq__3xwVrzkETZzfZrCY83msWfCFvHt2";
  const context = {

    authorized_qids: [
      "iq__W22h2kTV5hcKcw6B6NLjkqBs2PW",
      "iq__4SPYKeY43UaZf6RoDRqVpSTSN8Wn"
    ],
    "authorized_meta": [
      "/test"
    ],
    "authorized_files": [
      "/files/Meridian_00-00_37_05.png"
    ],
    "authorized_offerings": [
      "restrict1"
    ]

  };

  let res = await client.CreateSignedToken({
    objectId: policyId,
    policyId,
    subject: "poseidon@eluv.io",
    duration: 60 * 60 * 1000, // millisec
    context
  });

  console.log(res);

}

/**
 * Retrieve playout URLs
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

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

const Run = async () => {

  client = await Setup();


  MakeEditorSignedTokenWithPolicy({});
  return;

  // Create an editor-signed access token
  accessToken = await MakeEditorSignedToken({});
  console.log("TOKEN", accessToken);

  client.SetStaticToken({ token: accessToken });

  // First retrieve title metadata (title, synopsis, cast, ...)
  let meta = await client.ContentObjectMetadata({
    versionHash: contentHash,
    metadataSubtree: "/public/asset_metadata"
  });
  console.log("META", meta);
  return;

  // Access content and play
  let playoutOptions = await Play({token: accessToken});
  console.log("PLAYOUT", JSON.stringify(playoutOptions, null, 2));
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

Run();