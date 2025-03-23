/**
 * SiteAndCollections.js
 *
 * Sample API calls illustrating a front end accessing a content site organized
 * using the default content management convention.
 * The example assumes the front end is getting an 'editor signed access token' from the
 * backend.
 */

const { ElvClient } = require("../../src/ElvClient");
const url = require('url');

const networkName = "demo"; // "main" or "demo"
const staticUrls = {
  main: "https://main.net955305.contentfabric.io"
}

// ilib8qRSALEyqA14xTVY17wm6JDd2nH/iq__3M51eddxPUdUnrLANnRVcYGSFaaD

const starflicksSiteHash = "hq__BHiyHgvGD3S6kL4rWfpQoEjELMBapMd5BPFj5xgmrJUuaYpSQhaLtx87A5wCjDYDCwTaHap94M";


const SetupFrontEnd = async ({accessToken}) => {

  // Initialize front-end client
  let client = await ElvClient.FromNetworkName({networkName, staticToken: accessToken});

  // Generate base content fabric URL
  let baseUrlStr = await client.FabricUrl({
    versionHash: starflicksSiteHash
  });

  return {
    client,
    baseUrlStr
  }
}

/**
 */
const SetupBackend = async () => {

  let client = await ElvClient.FromNetworkName({networkName});
  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  client.SetSigner({signer});
  client.ToggleLogging(false);

  // Make an editor-signed access token for the front end
  const editorSignedAccessToken = await client.CreateSignedToken({
    versionHash: starflicksSiteHash,
	  duration: 60 * 60 * 1000 // millisec
  });

  // Make a client-signed access token
  const clientSignedAccessToken = await client.CreateFabricToken({
    duration: 60 * 60 * 1000 // millisec
  });

  // Make a legacy authorizatin token
  const legacyPlainAccessToken = await client.authClient.AuthorizationToken({
    duration: 60 * 60 * 1000 // millisec
  });

  return {
    editorSignedAccessToken,
    clientSignedAccessToken,
    legacyPlainAccessToken,
    siteHash: starflicksSiteHash
  };
}

/**
 * Retrieve high level metadata about site contents
 */
 const SiteOverview = async ({client, baseUrlStr}) => {

  var baseUrl = new url.URL(baseUrlStr);

  var u = baseUrl;
  u.pathname = baseUrl.pathname + "/meta/public/asset_metadata";
  u.searchParams.append('link_depth', 3);
  u.searchParams.append('resolve_include_source', true);
  u.searchParams.append('resolve_ignore_errors', true);

  return u.href;
}

/**
 * Retrieve high level metadata about the movies
 */
const ListSummary = async ({client, baseUrlStr, listKey}) => {

  var baseUrl = new url.URL(baseUrlStr);

  var u = baseUrl;
  u.pathname = baseUrl.pathname + "/meta/public/asset_metadata/" + listKey;
  u.searchParams.append('link_depth', 1);
  u.searchParams.append('resolve_include_source', true);
  u.searchParams.append('resolve_ignore_errors', true);
  u.searchParams.append('select', '/*/*/display_title');
  u.searchParams.append('select', '/*/*/info/synopsis');
  u.searchParams.append('select', '/*/*/info/Genre');

  return u.href;
}

/**
 * Get an image (full res or thumbnail)
 */
const GetImage = async ({client, baseUrlStr, imageKey, width = 0}) => {

  var baseUrl = new url.URL(baseUrlStr);

  var u = baseUrl;
  u.pathname = baseUrl.pathname + "/meta/public/asset_metadata/" + imageKey + ((width == 0) ? '/default' : '/thumbnail');
  if (width != 0) {
    u.searchParams.append('width', width);
  }
  return u.href;
}

const PlayoutUrl = async ({client, baseUrlStr, linkKey}) => {

  const res = await client.PlayoutOptions({
    versionHash: starflicksSiteHash,
    linkPath: "/public/asset_metadata/" + linkKey
  });
  return res;
}


const Run = async () => {

  // Initialize backend
  let info = await SetupBackend();

  // Initialze front-end
  let clientInfo = await SetupFrontEnd({accessToken: info.legacyPlainAccessToken});
  let client = clientInfo.client;
  let baseUrlStr = clientInfo.baseUrlStr;

  // Read the struture of the site
  let url = await SiteOverview({client, baseUrlStr});
  console.log("\nSITE OVERVIEW URL\n", url);

  // Get summary info for the movies on the site
  url = await ListSummary({client, baseUrlStr, listKey: "titles"});
  console.log("\nMOVIES OVERVIEW\n", url);

  // Get summary info for the series on the site
  url = await ListSummary({client, baseUrlStr, listKey: "series"});
  console.log("\nSERIES OVERVIEW\n", url);

  // Get summary info for the episodes in the series
  url = await ListSummary({client, baseUrlStr, listKey: "series/0/series-caminandes/episodes"});
  console.log("\nSERIES EPISODES OVERVIEW\n", url);

  // Get the hero image of the site
  url = await GetImage({client, baseUrlStr, imageKey: 'images/hero'});
  console.log("\nSERIES HERO\n", url);
  url = await GetImage({client, baseUrlStr, imageKey: 'images/hero', width: 160});
  console.log("\nSERIES HERO RESIZED\n", url);

  // Get thumbnail and poster for one of the movies
  url = await GetImage({client, baseUrlStr, imageKey: 'titles/0/meridian/images/poster',});
  console.log("\nMOVIE POSTER\n", url);
  url = await GetImage({client, baseUrlStr, imageKey: 'titles/0/meridian/images/thumbnail', width: 160});
  console.log("\nMOVIE THUMBNAIL\n", url);

  // Play trailer for one of the movies: get hash, call playout options, choose playout URL
  var playoutInfo = await PlayoutUrl({client, linkKey: 'titles/0/meridian/trailers/0/meridian-trailer/sources/default'});
  console.log("\nPLAY TRAILER\n", playoutInfo);

  // Play one of the movies
  playoutInfo = await PlayoutUrl({client, linkKey: 'titles/0/meridian/sources/default'});
  console.log("\nPLAY MOVIE\n", playoutInfo);

  // Play one of the videos in the series
  playoutInfo = await PlayoutUrl({client, linkKey: 'series/0/series-caminandes/episodes/0/caminandes-ep-1-mezz/sources/default',});
  console.log("\nPLAY EPISODE\n", playoutInfo);

}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

Run();
