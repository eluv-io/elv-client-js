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

const txh = "0x22f8af910c5105aba8f60813e193579305005b1d6017ff11c4246217bd76f6a3";

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

const UpdateRequest = async ({client, objectId}) => {

  const { isV3, accessType, abi } = await client.authClient.ContractInfo({id: objectId});

  const event = await client.CallContractMethodAndWait({
    contractAddress: Utils.HashToAddress(objectId),
    abi,
    methodName: "updateRequest",
    methodArgs: [],
  });

  const updateRequestEvent = client.ExtractEventFromLogs({
    abi,
    event,
    eventName: "UpdateRequest"
  });

  if(event.logs.length === 0 || !updateRequestEvent) {
    throw Error(`Update request denied for ${objectId}`);
  }

  return event;
}

/**
 * Create a signed an "EDIT" access token
 */
 const CreateEditToken = async ({
  client,
  contentSpaceId,
  libraryId,
  objectId,
  signer
}) => {

  const address = await signer.getAddress();

  const event = await UpdateRequest({client, objectId});
  const txh = event.transactionHash;

  let token = {
    txh: Buffer.from(txh.replace(/^0x/, ""), "hex").toString("base64"), // tx hash for an updateRequest
    adr: Buffer.from(address.replace(/^0x/, ""), "hex").toString("base64"),
    spc: contentSpaceId,
    lib: libraryId
  };

  let message = `Eluvio Content Fabric Access Token 1.0\n${JSON.stringify(token)}`;

  const signature = await signer.signMessage(message);

  const compressedToken = Pako.deflateRaw(Buffer.from(JSON.stringify(token), "utf-8"));
  return `atxpjc${Utils.B58(
    Buffer.concat([
      Buffer.from(signature.replace(/^0x/, ""), "hex"),
      Buffer.from(compressedToken)
    ])
  )}`;
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

  const contentSpaceId = "ispc3ANoVSzNA3P6t7abLR69ho5YPPZU";
  const libraryId  = "ilib3MUNGcWxTNmK2WCJ5HYCvpxdSfFE";
  const objectId = "iq__2gT74zSivCodXieqM3pt52tQo2E3";

  let tok = await CreateEditToken({
    client,
    contentSpaceId,
    libraryId,
    objectId,
    duration: 10000000,
    signer});
  console.log("FABRIC EDIT TOKEN", tok);

  client.SetStaticToken({ token: tok });

  let res = await client.EditContentObject({
    libraryId,
    objectId
  });
  console.log("EDIT", JSON.stringify(res));

  await client.MergeMetadata({
    libraryId,
    objectId,
    writeToken: res.write_token,
    metadata: { "sstest": "try 1"},
    metadataSubtree: "/"
  });

  let fin = await client.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken: res.write_token
  });
  console.log("FIN", JSON.stringify(fin));

}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  return;
}

Run();
