const fs = require("fs");
const path = require("path");
const solc = require("solc");
const ethers = require("ethers");

// Create minimal JS containing ABI and bytecode from compiled contract
const BuildContracts = () => {
  const contractFiles = fs.readdirSync(path.join(__dirname, "..", "contracts"))
    .filter(filename => filename.endsWith(".sol") && filename !== "Migrations.sol");

  let sources = {};
  for (const contractFilename of contractFiles) {
    sources[contractFilename] = fs.readFileSync(path.join(__dirname, "..", "contracts", contractFilename)).toString();
  }

  const compilationResult = solc.compile({ sources }, 1);
  let topicMap = {};
  Object.keys(compilationResult.contracts).map((contractKey => {
    const contractName = contractKey.split(":")[1];
    const abi = JSON.parse(compilationResult.contracts[contractKey].interface);
    const contractData = {
      abi,
      bytecode: compilationResult.contracts[contractKey].bytecode
    };

    // Write out contract info
    const contractJS = "const contract=" + JSON.stringify(contractData) + "; module.exports=contract;";
    fs.writeFileSync(path.join(__dirname, "..", "src", "contracts", contractName + ".js"), contractJS);

    // Map event signature hash (aka "topic") to its interface
    const events = abi.filter(entry => entry.type === "event");
    events.forEach(event => {
      const signature = `${event.name}(${event.inputs.map(input => input.type).join(",")})`;
      const signatureHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature));
      if(!topicMap[signatureHash] || contractName.startsWith("Base")) {
        // Base contracts take priority of there are methods with identical signatures
        topicMap[signatureHash] = {abi: [event], contract: contractName};
      }
    });
  }));

  const topicMapJS = "const topics=" + JSON.stringify(topicMap) + "; module.exports=topics;";
  fs.writeFileSync(path.join(__dirname, "..", "src", "events", "Topics" + ".js"), topicMapJS);
};

BuildContracts();
