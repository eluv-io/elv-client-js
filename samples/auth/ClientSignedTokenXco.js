/**
 * ClientSignedTokenXco
 *
 * Create a client-signed-token using a cross-chain oracle signed message (xco_msg) and
 * access fabric resources. Then, repeat using EIP-191 personal_sign.
 */

const { ElvClient } = require("../../src/ElvClient");
const Utils = require("../../src/Utils");

const networkName = "demo"; // "main" or "demo"

const Setup = async () => {

  const signerURIs = ["https://host-216-66-89-94.contentfabric.io/as"];

  client = await ElvClient.FromNetworkName({networkName});
  await client.SetRemoteSigner({signerURIs, idToken: process.env.ID_TOKEN, unsignedPublicAuth: true})
  client.ToggleLogging(false);

  // Overwrite auth service endpoints (until the cross-chain feature is fully deployed)
  //client.authServiceURIs = ["http://127.0.0.1:6546"];  // Dev instance
  client.authServiceURIs = signerURIs;
  client.AuthHttpClient.uris = signerURIs;

  return client;
}

/**
 * Make a cross-chain oracle call
 */
const XcoView = async ({msg, usePersonal=false}) => {

  // Create a client-signed-token in order to access the cross-chain oracle API
  const token = await client.CreateFabricToken({
	  duration: 60 * 60 * 1000, // millisec
    addEthereumPrefix: !usePersonal,
  });

  // Call the cross-chain oracle 'view' API
  let res = await Utils.ResponseToFormat(
    "json",
    client.authClient.MakeAuthServiceRequest({
      method: "POST",
      path: "/as/xco/view",  // On main/dev net /as/xco/view
      body: msg,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  );

  return res;
}

/**
 * Retrieve playout URLs
 */
const Play = async ({token}) => {
  const contentHash = "hq__93SK4rgxMarq1ZeDSEu9WJkDoptTKYiA2GmYocK7inMthUssGkG6Q9BREBEhNtVCiCBFsPd4Gd";

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

  const xcoReq = {
    chain_type: 'eip155',
    chain_id: '955210',
    asset_type: 'erc721',
    asset_id: '0xc21ea77699666e2bb6b96dd20157db08f22cb9c3',
    method: 'balance',
    params: {
      owner: '0x9d4a49b2b6aff4ae42767d95664cbd948d89e0c1'
    }
  };

  // Call the oracle cross-chain 'view' API 'balance'
  let xcoResp = await XcoView({msg: xcoReq});
  console.log("TOKEN", JSON.stringify(xcoResp));
  accessToken = xcoResp.token;

  // Play
  let playoutOptions = await Play({token: accessToken});
  console.log("PLAYOUT", JSON.stringify(playoutOptions, null, 2));
}

if (!process.env.ID_TOKEN) {
  console.log("Must set environment variable ID_TOKEN");
  exit;
}

Run();
