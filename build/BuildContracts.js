const fs = require("fs");
const path = require("path");
const nodeSolc = require("solc");
const ethers = require("ethers");

// Create minimal JS containing ABI and bytecode from compiled contract
const BuildContracts = async () => {
  const solc = await new Promise((resolve, reject) =>
    nodeSolc.loadRemoteVersion(
      "v0.4.24+commit.e67f0147",
      (error, solc) => error ? reject(error) : resolve(solc)
    )
  );

  let topicMap = {};
  ["v2", "v3"].forEach(version => {
    const contractFiles = fs.readdirSync(path.join(__dirname, "..", "contracts", version))
      .filter(filename => filename.endsWith(".sol") && filename !== "Migrations.sol");


    let sources = {};
    for(const contractFilename of contractFiles) {
      sources[contractFilename] = fs.readFileSync(path.join(__dirname, "..", "contracts", version, contractFilename)).toString();
    }

    const interfaceContracts = [
      "access_indexor",
      "accessible",
      "container",
      "editable",
      "ownable",
      "transactable"
    ];

    const compilationResult = solc.compile({sources}, 1);

    compilationResult.errors.map(error => console.error(error));

    if(Object.keys(compilationResult.contracts).length === 0) {
      console.error("\n\nFailed to compile\n\n");
    }

    Object.keys(compilationResult.contracts).map((contractKey => {
      const contractName = contractKey.split(":")[1];
      const abi = JSON.parse(compilationResult.contracts[contractKey].interface);
      const contractData = {abi};

      // Write out contract info
      const contractJS = "const contract=" + JSON.stringify(contractData) + "; module.exports=contract;";
      fs.writeFileSync(path.join(__dirname, "..", "src", "contracts", version, contractName + ".js"), contractJS);

      // Map event signature hash (aka "topic") to its interface
      const events = abi.filter(entry => entry.type === "event");
      events.forEach(event => {
        const signature = `${event.name}(${event.inputs.map(input => input.type).join(",")})`;
        const signatureHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature));

        if(!interfaceContracts.includes(contractName.toLowerCase())) {
          if(topicMap[signatureHash]) {
            topicMap[signatureHash].ambiguous = true;
            delete topicMap[signatureHash].contract;
          } else {
            topicMap[signatureHash] = {abi: [event], contract: contractName};
          }
        }
      });
    }));
  });

  const topicMapJS = "const topics=" + JSON.stringify(topicMap) + "; module.exports=topics;";
  fs.writeFileSync(path.join(__dirname, "..", "src", "events", "Topics" + ".js"), topicMapJS);
};

BuildContracts();
