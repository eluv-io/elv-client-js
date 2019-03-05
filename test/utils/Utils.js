const crypto = require("crypto");
const Ethers = require("ethers");
const {ElvClient} = require("../../src/ElvClient");
const ClientConfiguration = require("../../TestConfiguration");
const Path = require("path");
const fs = require("fs");

// Private key can be specified as environment variable
// e.g. PRIVATE_KEY=<private-key> npm run test
let privateKey = process.env["PRIVATE_KEY"] || "0xca3a2b0329b2ed1ce491643917f4b13d1619088f73a03728bb4149ed3fda3fbf";

/*
 * Dynamically wrap class methods in logging functionality. Each time the method is called, it will
 * log the full signature it was called with and the resultant output.
 *
 * If --logMethods is not specified when tests are run, no logging will be done.
 *
 * Results are saved in /docs/methods/<ClassName>/<MethodName>.json
 */
const OutputLogger = (klass, instance, exclude=[]) => {
  if(!process.env["GENERATE_METHOD_LOGS"]) { return instance; }

  const outputDir = Path.join(__dirname, "..", "..", "docs", "methods", klass.name);
  try { fs.mkdirSync(outputDir); } catch(e) {}

  let methodWritten = {};

  // Wrap all methods in logging functionality
  Object.getOwnPropertyNames(klass.prototype).forEach(methodName => {
    if(exclude.includes(methodName)) { return; }

    const file = Path.join(outputDir, methodName + ".json");
    const originalMethod = instance[methodName].bind(instance);

    const writeOutput = (args, result, async=false) => {
      const formattedArgs = args ? JSON.stringify(args) : "";
      let output = {
        signature: `${(async ? "async" : "")} ${methodName}(${formattedArgs});`,
        result: result
      };

      if(methodWritten[methodName]) {
        const currentOutput = JSON.parse(fs.readFileSync(file, "utf8"));
        output = [...currentOutput, output];
      } else {
        output = [output];
      }

      fs.writeFileSync(
        file,
        JSON.stringify(output, null, 2)
      );

      methodWritten[methodName] = true;
    };

    if(originalMethod.constructor.name === "AsyncFunction") {
      instance[methodName] = async (args) => {
        const result = await originalMethod(args);
        if (result) { writeOutput(args, result, true); }
        return result;
      };
    } else {
      instance[methodName] = (args) => {
        const result = originalMethod(args);
        if (result) { writeOutput(args, result, true); }
        return result;
      };
    }
  });

  return instance;
};

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
  CreateClient,
  OutputLogger
};
