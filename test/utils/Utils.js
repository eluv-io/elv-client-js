const crypto = require("crypto");
const Ethers = require("ethers");
const {ElvClient} = require("../../src/ElvClient");
const ClientConfiguration = require("../../TestConfiguration");

// Private key can be specified as environment variable
// e.g. PRIVATE_KEY=<private-key> npm run test
let privateKey = process.env["PRIVATE_KEY"] || "0x0000000000000000000000000000000000000000000000000000000000000000";

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
  const fundedClient = new ElvClient(ClientConfiguration);
  const client = new ElvClient(ClientConfiguration);

  const wallet = client.GenerateWallet();
  const fundedSigner = wallet.AddAccount({privateKey});

  await fundedClient.SetSigner({signer: fundedSigner});

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

  //const signer = wallet.AddAccount({privateKey: "0xb1b912ab6d2024b9edd77a34837e48cb5e1aaac591d964cb3dd1311c131d02e2"});

  // Ensure transaction has time to resolve fully before continuing
  await new Promise(resolve => setTimeout(resolve, 1000));

  await client.SetSigner({signer});

  // Add new account to content space group
  // TODO: Pull access group address from content space when implemented
  await fundedClient.AddAccessGroupManager({
    contractAddress: "0x6b609282d747ded092066728bc7b3071e94384a8",
    memberAddress: signer.address
  });

  return client;
};

module.exports = {
  BufferToArrayBuffer,
  RandomBytes,
  RandomString,
  CreateClient
};
