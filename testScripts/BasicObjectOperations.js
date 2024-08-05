/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");

const configUrl = "https://test.net955205.contentfabric.io/config";
const libraryId = "ilibE6vhm2YCR6vZCtW9mope6Dbo2Tn"; // to create and edit content

const Tool = async () => {

  const client = await ElvClient.FromConfigurationUrl({configUrl});

  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });

  client.SetSigner({signer});
  //client.ToggleLogging(true);


  try {
    let start = new Date().getTime();
    const {objectId, writeToken} = await client.CreateContentObject({
      libraryId: libraryId,
      options: {
        meta: {commit: "Create Content-" + start.toString()}
      }
    });
    let end = new Date().getTime();
    let timeDifference = end - start;
    console.log("content object completed after: ", timeDifference, "ms");

    start = new Date().getTime();
    const {hash} = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    end = new Date();
    timeDifference = end - start;
    console.log("finalize object completed after: ", timeDifference, "ms");

    start = new Date().getTime();
    const editResponse = await client.EditContentObject({
      libraryId,
      objectId,
    });
    end = new Date().getTime();
    timeDifference = end - start;
    console.log("edit object completed after: ", timeDifference, "ms");

    const metadata = {
      description: "edit content",
    };

    start = new Date().getTime();
    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadata
    });
    end = new Date().getTime();
    timeDifference = end - start;
    console.log("replace metadata completed after: ", timeDifference, "ms");


    start = new Date().getTime();
    await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
    });
    end = new Date().getTime();
    timeDifference = end - start;
    console.log("finalize object completed after: ", timeDifference, "ms");

    console.log(`\nSuccessfully created new content version: ${hash}`);
  } catch(error) {
    console.error("Error creating content object:");
    console.error(error);
  }
};

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  return;
}

Tool();


