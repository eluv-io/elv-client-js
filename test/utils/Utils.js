const crypto = require("crypto");
const Ethers = require("ethers");
const Source = require("../../src/ElvClient");
const Min = require("../../dist/ElvClient-node-min");
const ClientConfiguration = require("../../TestConfiguration");

// Uses source by default. If USE_BUILD is specified, uses the minified node version
const ElvClient = process.env["USE_BUILD"] ? Min.ElvClient : Source.ElvClient;

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

const CreateClient = async (name, bux="2") => {
  try {
    const fundedClient = await ElvClient.FromConfigurationUrl({configUrl: ClientConfiguration["config-url"]});
    const client = await ElvClient.FromConfigurationUrl({configUrl: ClientConfiguration["config-url"]});

    const wallet = client.GenerateWallet();
    const fundedSigner = wallet.AddAccount({privateKey});

    const balance = await wallet.GetAccountBalance({signer: fundedSigner});
    if(balance < parseFloat(bux)) {
      throw Error(`Insufficient balance: Funded account only has ${balance} ether`);
    }

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

    client.clientName = name;
    client.initialBalance = parseFloat(bux);

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

  console.log(`${client.clientName} used ${(client.initialBalance - balance).toFixed(3)} ether`);
  await client.SendFunds({
    recipient: fundedSigner.address,
    ether: balance - 0.25
  });
};

module.exports = {
  BufferToArrayBuffer,
  RandomBytes,
  RandomString,
  CreateClient,
  ReturnBalance
};
