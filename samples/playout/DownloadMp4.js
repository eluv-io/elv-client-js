/**
 * Media download (mp4)
 *
 * Download a media clip (or full length).
 * This operation is asynchronous and requires preparation.
 */

const { ElvClient } = require("../../src/ElvClient");

const fileServiceEndpoint = "https://host-76-74-29-4.contentfabric.io/";
const networkName = "main"; // "main" or "demo"

let client;

const Setup = async () => {

  client = await ElvClient.FromNetworkName({networkName});
  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  client.SetSigner({signer});
  client.ToggleLogging(false);

  // Retrieve file service endpoints
  client.SetNodes({fabricURIs: [fileServiceEndpoint]});

  return client;
}

/*

# API

## Create Media File

Create a JOB for preparing a media file with the provided specification. If there was a previous, successful job for the same file specification, that job's ID is returned. If the job previously failed, it is retried with a new job.

POST /q/{QHASH}/call/media/files
{
  "offering": "default",
  "start_ms": "10.5s",
  "end_ms": "25m7s",
  "representation": "videovideo_1920x1080_h264@9500000",
  "audio": "audioaudio_aac@192000",
  "format": "mp4",
  "ttl": "720h"
}

201 Created
{
  "job_id":"tlf_HSVSRdErpwAToGWda6AYWnugVhPJBewRPVpdVBtFHPfbgQJQ5ZFSbXHfesAp2WzKYpcTjHqsRKcgxtRWFNd"
}

## Get File Job Status

Returns the job status, progress of the file creation process and the file spec.

GET /q/{QHASH}/call/media/files/{JOBID}

200 OK
{
  "filename": "TESTMEZ01-The Test Mezzanine-1080@16500000-000010-002507.mp4",
  "offering": "default",
  "start_ms": "10.5s",
  "end_ms": "25m7s",
  "representation": "videovideo_1920x1080_h264@9500000",
  "format": "mp4",
  "ttl": "720h",
  "status": "processing",
  "progress": 49
}

## Download Media File

Downloads the media primary media file or the provided job.

GET /q/{QHASH}/call/media/files/{JOBID}/download

200 OK
Content-Disposition: attachment; filename="TESTMEZ01-The Test Mezzanine--000010-002507.mp4"
Content-Length: 1000
Content-Type: video/mp4

...BYTES...

The endpoint allows overriding the download filename with a header:

X-Content-Fabric-Set-Content-Disposition: attachment; filename="override.mp4"
or with a URL parameter (where the header value to set needs URL encoding):

../download?header-x_set_content_disposition=attachment%3B+filename%3D%22override.mp4%22

*/
const Download = async () => {
  const libraryId = "ilibP5XeH1BCncUxdexqGuKbzfrAL2H";
  const contentId = "iq__3rFn6YCp2FHSwVMju5Fwoy7RsDvf";
  const offering = "default";
  const start = "11m30s"
  const end = "12m30s"

  // Initiate download operation
  try {

    // Make access token
    accessToken = await client.authClient.GenerateAuthorizationToken({
      libraryId: libraryId,
      objectId: contentId,
      update: true
    });
    console.log("ACCCESS TOKEN", accessToken);

    const res = await client.CallBitcodeMethod({
      libraryId: libraryId,
      objectId: contentId,
      method: "/media/files",
      constant: false,
      body: {
        "offering": offering,
        "start_ms": start,
        "end_ms": end,
        "format": "mp4"
      }
    });

    const jobId = res.job_id;
    console.log("DOWNLOAD INITIATED", jobId);

    let jobStatus = {
      status: "not started"
    }

    while (jobStatus.status != "completed" && jobStatus.status != "failed") {
      // Get job status
      jobStatus = await client.CallBitcodeMethod({
        libraryId: libraryId,
        objectId: contentId,
        method: "/media/files/" + jobId,
        constant: true
      });

      console.log("STATUS", jobStatus);
      await sleep(2000);
    }

    /*
     * To overwrite file name set: "X-Content-Fabric-Set-Content-Disposition"
     */
    const url = fileServiceEndpoint + "q/" + contentId + "/call/media/files/" + jobId + "/download" +
      "?authorization=" + accessToken;
    console.log("DOWNLOAD URL", url);

  } catch(e) {
    console.log("ERROR", JSON.stringify(e, null, 2));
  }

  return;
}

const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Run = async () => {
  client = await Setup();
  await Download();
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  exit;
}

Run();
