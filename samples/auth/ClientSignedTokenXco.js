/**
 * ClientSignedTokenXco
 *
 * Use a cross-chain oracle signed message to access fabric resources.
 *
 * export PRIVATE_KEY - set to the private key of an account that owns
 *                      a token (asset).
 */

const { ElvClient } = require("../../src/ElvClient");
const Utils = require("../../src/Utils");

const Pako = require("pako");

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

/**
 * Create a simple local private key-based signer
 */
const LocalSigner = async () => {
  tmpClient = await ElvClient.FromNetworkName({networkName});
  let wallet = tmpClient.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  return signer;
}

/**
 * Create a signed authorization token used for calling the cross-chain oracle
 */
 const CreateOracleAccessToken = async ({
  duration,
  contentSpaceId,
  signer
}) => {

  const address = await signer.getAddress();

  let token = {
    sub:`iusr${Utils.AddressToHash(address)}`,
    adr: Buffer.from(address.replace(/^0x/, ""), "hex").toString("base64"),
    spc: contentSpaceId,
    iat: Date.now(),
    exp: Date.now() + duration,
  };

  let message = `Eluvio Content Fabric Access Token 1.0\n${JSON.stringify(token)}`;

  const signature = await signer.signMessage(message);

  const compressedToken = Pako.deflateRaw(Buffer.from(JSON.stringify(token), "utf-8"));
  return `acspjc${Utils.B58(
    Buffer.concat([
      Buffer.from(signature.replace(/^0x/, ""), "hex"),
      Buffer.from(compressedToken)
    ])
  )}`;
}

/**
 * Make a cross-chain oracle call
 */
 const XcoView = async ({contentSpaceId, signer}) => {

  // Create a client-signed access token  in order to access the cross-chain oracle API
  let xcoToken = await CreateOracleAccessToken({
    duration: 1 * 1000, // millisec
    contentSpaceId: contentSpaceId,
    address: signer.getAddress(),
    signer: client.signer
  });
  console.log("ORACLE ACCESS TOKEN", xcoToken);

  // Format cross-chain oracle request
  const xcoReq = {
    chain_type: 'eip155',
    chain_id: '955210',
    asset_type: 'erc721',
    asset_id: '0xc21ea77699666e2bb6b96dd20157db08f22cb9c3',
    method: 'balance'
  };

  // Call the cross-chain oracle 'view' API
  let res = await Utils.ResponseToFormat(
    "json",
    client.authClient.MakeAuthServiceRequest({
      method: "POST",
      path: "/as/xco/view",  // On main/dev net /as/xco/view
      body: xcoReq,
      headers: {
        Authorization: `Bearer ${xcoToken}`,
      },
    })
  );

  return res;
}

/**
 * Retrieve playout URLs
 */
const Play = async ({}) => {

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

  let client = await Setup();

  // Set custom signer here (for example a web3 metamask signer)
  // This example just uses a simple private key signer
  let signer = await LocalSigner();

  // Call the oracle cross-chain 'view' API 'balance'
  let xcoResp = await XcoView({
    contentSpaceId: client.ContentSpaceId(),
    signer: signer
  });
  console.log("FABRIC ACCESS TOKEN", JSON.stringify(xcoResp));
  accessToken = xcoResp.token;

  // Create a client object and use the access token returned by the
  // cross-chain oracle.
  client.SetStaticToken({ token: accessToken });

  // Play
  let playoutOptions = await Play({});
  console.log("PLAYOUT", JSON.stringify(playoutOptions, null, 2));
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  return;
}

Run();
