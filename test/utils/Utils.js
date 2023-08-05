const crypto = require("crypto");
const Ethers = require("ethers");
const Source = require("../../src/ElvClient");
//const Min = require("../../dist/ElvClient-node-min");
const ClientConfiguration = require("../../TestConfiguration");
const ElvCrypto = require("../../src/Crypto");

const configUrl = process.env["CONFIG_URL"] || ClientConfiguration["config-url"];

// Uses source by default. If USE_BUILD is specified, uses the minified node version
//const ElvClient = process.env["USE_BUILD"] ? Min.ElvClient : Source.ElvClient;
const ElvClient = Source.ElvClient;


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
    // Un-initialize global.window so that elv-crypto knows it's running in node
    const w = globalThis.window;
    globalThis.window = undefined;

    const fundedClient = await ElvClient.FromConfigurationUrl({configUrl});
    const client = await ElvClient.FromConfigurationUrl({configUrl});

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

    // Reset client's crypto module with one created for node
    client.Crypto = ElvCrypto;
    await client.Crypto.ElvCrypto();

    // Re-initialize global.window for frame client and ensure that window.crypto is set for elv-crypto
    globalThis.window = w;
    if(typeof w !== "undefined") {
      globalThis.window.crypto = globalThis.crypto;
    }

    if(process.env["DEBUG"]) {
      client.ToggleLogging(true);
    }

    // Create user wallet
    await client.userProfileClient.CreateWallet();

    return client;
  } catch(error) {
    console.error("ERROR INITIALIZING TEST CLIENT: ");
    console.error(error);

    throw (error);
  }
};

const ReturnBalance = async (client) => {
  const balance = await client.GetBalance({address: client.signer.address});

  if(balance < 0.5) {
    return;
  }

  const wallet = client.GenerateWallet();
  const fundedSigner = wallet.AddAccount({privateKey});

  console.log(`\n${client.clientName} used ${(client.initialBalance - balance).toFixed(3)} ether\n`);
  await client.SendFunds({
    recipient: fundedSigner.address,
    ether: balance - 0.25
  });
};

const Initialize = () => {
  return new (require("../TestSuite/TestSuite"))();
};

module.exports = {
  Initialize,
  BufferToArrayBuffer,
  RandomBytes,
  RandomString,
  CreateClient,
  ReturnBalance
};
