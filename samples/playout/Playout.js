/**
 * Playout
 *
 * Retrieve playout offerings and playout URLs (DASH, HLS with DRM options).
 */

const { ElvClient } = require("../../src/ElvClient");
const Utils = require("../../src/Utils");

const networkName = "main"; // "main" or "demo"

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
 * Retrieve playout URLs for a given content object hash.
 */
const Play = async () => {
  const contentHash = "hq__EnCvjHbQ5CcSJsUeDSYWMA55dkyVAdxKw7QzMMgam9hPwcY9Cyb33tV24kE96Rb7fuAy8AiBS7";

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

/**
 * Retrieve playout URLs using a metadata link to a playable content.
 */
 const PlayFromLink = async () => {
  const contentHash = "hq__93SK4rgxMarq1ZeDSEu9WJkDoptTKYiA2GmYocK7inMthUssGkG6Q9BREBEhNtVCiCBFsPd4Gd";
  const linkPath = "assets/test001.mov/preview/playout";

  // Retrieve available 'offerings'
  let offerings = await client.AvailableOfferings({
    versionHash: contentHash,
    linkPath
  });
  console.log("LINK PLAYOUT OFFERINGS", offerings);

  let offering = 'default';

  // Retrieve playout info (DASH and HLS URLs)
  let res = await client.PlayoutOptions({
    versionHash: contentHash,
    linkPath,
    offering,
    drms: ["clear", "aes-128", "fairplay", "widevine"]
  });

  return res;
}

const Run = async () => {

  client = await Setup();

  // Play
  let playoutOptions = await Play();
  console.log("PLAYOUT", JSON.stringify(playoutOptions, null, 2));

  // Play from Link
  let linkPlayoutOptions = await PlayFromLink();
  console.log("LINK PLAYOUT", JSON.stringify(linkPlayoutOptions));
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

Run();
