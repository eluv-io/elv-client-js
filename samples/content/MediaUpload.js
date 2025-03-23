const { ElvClient } = require("../../src/ElvClient");
const fs = require('fs');

// Backend flow - upload files
const TestUpload = async () => {

  const libraryId = "ilib3xjQjKgtB1d1aKwEwaB1hUioYFar"
  const objectId = "iq__3drKwYnkwoKHKpym579YFd4EoAWe"

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
  const writeToken = (await backendClient.EditContentObject({libraryId, objectId})).write_token;
  const authToken = await backendClient.authClient.AuthorizationToken({libraryId, objectId, update: true});
  const node = await backendClient.WriteTokenNodeUrl({writeToken});
  console.log("Send to front end", "writeToken", writeToken, "authToken", authToken, "node", node);

  //
  // FRONT END
  //
  let frontendClient = await ElvClient.FromNetworkName({networkName: "demov3"});
  frontendClient.SetNodes({fabricURIs: [node]});
  frontendClient.SetStaticToken({token: authToken});

  const filePaths = [
    "x.mp4",
  ];
  let fileInfo = [];
  for (let i = 0; i < filePaths.length; i ++) {
    const fd = fs.openSync(filePaths[i]);
    const stats = fs.statSync(filePaths[i]);
    fileInfo.push({
      path: `video1.mp4`,
      type: "file",
      size: stats.size,
      data: fd
    })
  }

  const callback = (fileUploadStatus) => {
    console.log(fileUploadStatus);
  };

  try {
    await frontendClient.UploadFiles({
      libraryId,
      objectId,
      writeToken,
      encrypted: false,
      fileInfo,
      callback,
      encryption: "none"
    });
    console.log("Upload complete");
  } catch(e) {
    console.log("ERROR", e);
  }

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

  try {

    // Initialize 'production master'
    await backendClient2.CallBitcodeMethod({
      libraryId,
      objectId,
      writeToken,
      method: "media/production_master/init",
      queryParams: {
        response_log_level: "warn",
        struct_log_level: "none"
      },
      body: {},
      constant: false
    });

    const finalize = true;
    if (finalize) {
      await backendClient2.FinalizeUploadJob({
        libraryId,
        objectId,
        writeToken,
      });

      let fin = await backendClient2.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken,
      });
      console.log("Finalize", fin);
    }
  } catch(e) {
    console.log("ERROR", e);
  }
}

TestUpload();
