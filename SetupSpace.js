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
