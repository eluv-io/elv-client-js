const { ElvClient } = require("./src/ElvClient.js");

const ContentSpaceContract = require("./src/contracts/BaseContentSpace");
const ContentLibraryContract = require("./src/contracts/BaseLibrary");
const ContentContract = require("./src/contracts/BaseContent");

const ClientConfiguration = require("./TestConfiguration.json");

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
    //accountName: "Alice",
    //privateKey: "04832aec82a6572d9a5782c4af9d7d88b0eb89116349ee484e96b97daeab5ca6"
    //  privateKey: "1307df44f8f5033ec86434a7965234015da85261df149ed498cb29907df38d72"
    accountName: "Owner",
    privateKey: "bf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6"
});

client.SetSigner({signer});

const SetupSpace = async () => {

    contentSpaceId = "ispc22PzfU3u1xzJdMpzBfmhoAF1Ucnc";
    libraryId = "ilib22PzfU3u1xzJdMpzBfmhoAF1Ucnc";

    contractAddress = client.utils.HashToAddress(contentSpaceId);

    const event = await client.ethClient.CallContractMethodAndWait({
      contractAddress: contractAddress,
	abi: ContentSpaceContract.abi,
	methodName: "engageAccountLibrary",
	value: 0,
	signer: signer
    });

    console.log("\nUsing content space: " + contentSpaceId);
    console.log("\Transaction: " + event.transactionHash);

    const token = await client.authClient.FormatAuthToken({
	libraryId: libraryId,
	transactionHash: event.transactionHash
    });

    console.log("\nAuth token: " + token);
    console.log("\n");
};

SetupSpace();
