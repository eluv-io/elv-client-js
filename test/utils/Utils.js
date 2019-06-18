const crypto = require("crypto");
const Ethers = require("ethers");
const {ElvClient} = require("../../src/ElvClient");
const ClientConfiguration = require("../../TestConfiguration");

// Private key can be specified as environment variable
// e.g. PRIVATE_KEY=<private-key> npm run test
let privateKey = process.env["PRIVATE_KEY"] || "0xbf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6";

const BufferToArrayBuffer = (buffer) => {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

// Create an ArrayBuffer of the specified size with random data
const RandomBytes = (size) => {
  return BufferToArrayBuffer(crypto.randomBytes(size));
};

// Create an ArrayBuffer of the specified size with random data
const RandomString = (size) => {
  return crypto.randomBytes(size).toString("hex");
};

const CreateClient = async (bux="2") => {
  try {
    const fundedClient = await ElvClient.FromConfigurationUrl({configUrl: ClientConfiguration["config-url"]});
    const client = await ElvClient.FromConfigurationUrl({configUrl: ClientConfiguration["config-url"]});

    const wallet = client.GenerateWallet();
    const fundedSigner = wallet.AddAccount({privateKey});

    await fundedClient.SetSigner({signer: fundedSigner});

    const groupAddress = await fundedClient.ContentObjectMetadata({
      libraryId: fundedClient.contentSpaceLibraryId,
      objectId: fundedClient.contentSpaceObjectId,
      metadataSubtree: "contentSpaceGroupAddress"
    });

    // Create a new account and send some ether
    const signer = wallet.AddAccountFromMnemonic({
      mnemonic: wallet.GenerateMnemonic()
    });

    // Each test file is run in parallel, so there may be collisions when initializing - retry until success
    for(let i = 0; i < 5; i++) {
      try {
        await fundedSigner.sendTransaction({
          to: signer.address,
          value: Ethers.utils.parseEther(bux)
        });

        break;
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Ensure transaction has time to resolve fully before continuing
    await new Promise(resolve => setTimeout(resolve, 1000));

    await client.SetSigner({signer});

    // Add new account to content space group
    await fundedClient.AddAccessGroupManager({
      contractAddress: groupAddress,
      memberAddress: signer.address
    });

    return client;
  } catch (error) {
    console.error("ERROR INITIALIZING TEST CLIENT: ");
    console.error(error);
  }
};

module.exports = {
  BufferToArrayBuffer,
  RandomBytes,
  RandomString,
  CreateClient
};
