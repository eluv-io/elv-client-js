const { ElvClient } = require("./src/ElvClient.js");

const ContentSpaceContract = require("./src/contracts/BaseContentSpace");
const ContentLibraryContract = require("./src/contracts/BaseLibrary");
const ContentContract = require("./src/contracts/BaseContent");

const ClientConfiguration = require("./TestConfiguration.json");

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
    //accountName: "Alice",
    //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
    //  privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
    accountName: "Owner",
    privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
});

client.SetSigner({signer});

const SetupSpace = async () => {

  contentSpaceId = "ispc22PzfU3u1xzJdMpzBfmhoAF1Ucnc";

  contractAddress = client.utils.HashToAddress(contentSpaceId);

  transactionHash = await client.authClient.GenerateAuthorizationToken({
    libraryId: client.utils.AddressToLibraryId(contractAddress),
    update: true
  });
  console.log("\nUsing content space: " + contentSpaceId);

  const libraryId = client.utils.AddressToLibraryId(contractAddress);
  const path = "/qlibs/" + libraryId;

  client.HttpClient.Request({
    headers: await client.authClient.AuthorizationHeader({transactionHash}),
    method: "PUT",
    path: path,
    body: {
      meta: {
        "eluv.name": "Content Types",
	"class": "content_space_library"
      }
    }
  });

  console.log("\nCreated content types library: ");
  console.log("\tID: " + libraryId + "\n");

  console.log("\n");
};

SetupSpace();
