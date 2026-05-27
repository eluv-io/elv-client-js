const { ElvClient } = require("../../src/ElvClient");
const fs = require('fs');
const path = require('path');


// Simple Media Ingest 
// This script allows for the upload of a single media file from a Front End client with an authorization token
// It creates a single playable object for each media file uploaded



const MediaUpload = async () => {

  //
  // BACK END
  //

  let backendClient = await ElvClient.FromNetworkName({networkName: "demov3"});
  let wallet = backendClient.GenerateWallet();
  let backendSigner = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  backendClient.SetSigner({signer: backendSigner});
  // Send these 3 items to the front end: writeToken, authToken, node



  // Constants from tenancy
  const libraryId = "ilibxxxx;
  const mezzType = "iq__xxxx";
  const masterType = "iq__xxx";
  const objectName = "Object Name";
  const filePath = path.resolve(__dirname, 'abr_profile.json');
  const abrProfile = JSON.parse(fs.readFileSync(filePath, 'utf8'));



  // Upload by creating a new object
  const newObject = await backendClient.CreateContentObject({
    libraryId, 
    options: {
    meta: {
      public: {
        name: objectName,
      }
    },
    type: mezzType
  }
  })
  const objectId = newObject.id;
  const writeToken = newObject.write_token;




  // Upload to an exisiting object
  // const objectId = "iq__2o68yG4v44LwffBuKetPXGX79K9M"
  // const writeToken = (await backendClient.EditContentObject({libraryId, objectId})).write_token;




  // Generate auth token
  const authToken = await backendClient.authClient.AuthorizationToken({libraryId, objectId, update: true});
  const node = await backendClient.WriteTokenNodeUrl({writeToken});
  console.log("Send to front end", "writeToken", writeToken, "authToken", authToken, "node", node);




  //
  // FRONT END
  //

  let frontendClient = await ElvClient.FromNetworkName({networkName: "demov3"});
  frontendClient.SetNodes({fabricURIs: [node]});
  frontendClient.SetStaticToken({token: authToken, update: true});

  // Upload Files
  const filePaths = [
    "file/path/file_name.mp4",
  ];
  let fileInfo = [];
  for (let i = 0; i < filePaths.length; i ++) {
    const fd = fs.openSync(filePaths[i]);
    const stats = fs.statSync(filePaths[i]);
    fileInfo.push({
      path: `file_name.mp4`,
      type: "file",
      size: stats.size,
      data: fd
    })
  }

  const callback = (fileUploadStatus) => {
    console.log(fileUploadStatus);
  };



  
  //
  // BACK END
  //

  let backendClient2 = await ElvClient.FromNetworkName({networkName: "demov3"});
  let wallet2 = backendClient.GenerateWallet();
  let backendSigner2 = wallet2.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  backendClient2.SetSigner({signer: backendSigner2});
  backendClient2.SetNodes({fabricURIs: [node]});

  // For debbuging purposes
  // backendClient2.ToggleLogging(true);

  try {

    // Create Production Master
    const createMasterResponse = await backendClient2.CreateProductionMaster({
      libraryId,
      objectId,
      fileInfo,
      callback,
      encrypt: true,
      type: masterType,
      name: objectName,
      writeToken
    })
    console.log("Master Response", createMasterResponse);

    // Create ABR Mezzanine
    const createABRMezzResponse = await backendClient2.CreateABRMezzanine({
      libraryId,
      writeToken,
      objectId,
      type: mezzType,
      masterWriteToken: writeToken,
      variant: "default",
      offeringKey: "default",
      abrProfile
    });
    console.log("Create ABR Mezzanine", createABRMezzResponse);


    // Start ABR Job
    const startJobsResponse = await backendClient2.StartABRMezzanineJobs({
      libraryId,
      objectId,
      offeringKey: "default",
      writeToken
    });

    const lroWriteToken = startJobsResponse.lro_draft.write_token;
    const lroNode = startJobsResponse.lro_draft.node;
    const lroData = startJobsResponse.data;

    console.log("LRO Write Token", lroWriteToken);
    console.log("LRO Node", lroNode);
    console.log("LRO Data", lroData);


    // Check ABR Job is Finished
    let done = false;
    while (!done) {
      const lroStatus = await backendClient.LROStatus({ libraryId, objectId, writeToken });
      console.log("LRO Status", lroStatus);
      const lastStatus = lroData.every(lro => lroStatus[lro]?.run_state === "finished")
      console.log(lastStatus);
      if (lastStatus) done = true;
    }   




    // Finalize Mezzanine Object
    if (done) {
      let finalizeAbrResponse = await backendClient2.FinalizeABRMezzanine({
        libraryId,
        objectId,
        writeToken,
        offeringKey: "default"
      });
      console.log("Finalize ABR", finalizeAbrResponse);

      let finalizeContentObject = await backendClient2.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken,
      });
      console.log("Finalize Object", finalizeContentObject);
    }
  } catch(e) {
    console.log("ERROR", e);
  }
}

MediaUpload();
