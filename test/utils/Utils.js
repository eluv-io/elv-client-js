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

const CreateClient = async () => {
  const client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
  const wallet = client.GenerateWallet();
  const fundedSigner = wallet.AddAccount({privateKey});

  // Create a new account and send some ether
  const signer = wallet.AddAccountFromMnemonic({
    mnemonic: wallet.GenerateMnemonic()
  });

  // Each test file is run in parallel, so there may be collisions when initializing - retry until success
  for(let i = 0; i < 5; i++) {
    try {
      await fundedSigner.sendTransaction({
        to: signer.address,
        value: Ethers.utils.parseEther("2")
      });

      break;
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Ensure transaction has time to resolve fully before continuing
  await new Promise(resolve => setTimeout(resolve, 1000));

  client.SetSigner({signer});

  return client;
};

module.exports = {
  BufferToArrayBuffer,
  RandomBytes,
  RandomString,
  CreateClient
};
