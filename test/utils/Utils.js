const crypto = require("crypto");
const Ethers = require("ethers");
const {ElvClient} = require("../../src/ElvClient");
const ClientConfiguration = require("../../TestConfiguration");

// Private key can be specified as environment variable
// e.g. PRIVATE_KEY=<private-key> npm run test
let privateKey = process.env["PRIVATE_KEY"];

if(!privateKey) { throw Error("No private key specified"); }

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

const CreateClient = async (bux="10") => {
  try {
    const fundedClient = await ElvClient.FromConfigurationUrl({configUrl: ClientConfiguration["config-url"]});
    const client = await ElvClient.FromConfigurationUrl({configUrl: ClientConfiguration["config-url"]});

    const wallet = client.GenerateWallet();
    const fundedSigner = wallet.AddAccount({privateKey});

    await fundedClient.SetSigner({signer: fundedSigner});

    const mnemonic = wallet.GenerateMnemonic();
    // Create a new account and send some ether
    const signer = wallet.AddAccountFromMnemonic({mnemonic});

    // Each test file is run in parallel, so there may be collisions when initializing - retry until success
    for(let i = 0; i < 5; i++) {
      try {
        await fundedSigner.sendTransaction({
          to: signer.address,
          value: Ethers.utils.parseEther(bux)
        });

        break;
      } catch(e) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Ensure transaction has time to resolve fully before continuing
    await new Promise(resolve => setTimeout(resolve, 1000));

    await client.SetSigner({signer});
    return client;
  } catch(error) {
    console.error("ERROR INITIALIZING TEST CLIENT: ");
    console.error(error);

    throw (error);
  }
};

const ReturnBalance = async (client) => {
  const balance = await client.GetBalance({address: client.signer.address});

  if(balance < 1) {
    return;
  }

  const wallet = client.GenerateWallet();
  const fundedSigner = wallet.AddAccount({privateKey});

  console.log("Returning ", balance);
  await client.SendFunds({
    recipient: fundedSigner.address,
    ether: balance - 1
  });
};

module.exports = {
  BufferToArrayBuffer,
  RandomBytes,
  RandomString,
  CreateClient,
  ReturnBalance
};
