const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");
var solc = require("solc");
const fs = require("fs");

const TestDeploy = async () => {
  let Client = new ElvClient({
    hostname: "q1.contentfabric.io",
    port: 80,
    useHTTPS: false,
    // ethHostname: "eth1.contentfabric.io",
    ethHostname: "127.0.0.1", // try locally first !!!
    ethPort: 7545,
    ethUseHTTPS: false
  });

  let wallet = Client.GenerateWallet();
  let signer = wallet.AddAccount({
    accountName: "Alice",
    privateKey: "74ea3bbaf5cb5477c79af43dd6bdc302512e9baf336b0a3c74ab4c9bc2c61dc0"
  });

  var solOwnable = fs.readFileSync("../contracts/ownable.sol", "utf8");
  var solLibrary = fs.readFileSync("../contracts/library.sol", "utf8");
  var solCustom = fs.readFileSync("../contracts/custom_content_helloworld.sol", "utf8");

  const input = {
    sources: {
      "ownable.sol": solOwnable,
      "library.sol": solLibrary,
      "custom_content_helloworld.sol": solCustom
    }
  };

  const output = solc.compile(input, 1);

  const bytecode = output.contracts["custom_content_helloworld.sol:HelloWorld"].bytecode;
  const abi = JSON.parse(output.contracts["custom_content_helloworld.sol:HelloWorld"].interface);

  // TODO if your constructor has arguments
  /*
  const constructorArgs = Client.FormatContractArguments({
    abi: abi,
    methodName: "constructor",
    args: []
  });
  */

  var result = await Client.DeployContract({
    abi: abi,
    bytecode: bytecode,
    // constructorArgs,
    constructorArgs: [],
    signer: signer
  });

  console.log(result);

};

// TestDeploy();
