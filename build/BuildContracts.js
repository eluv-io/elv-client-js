const fs = require("fs");
const path = require("path");
const solc = require("solc").setupMethods(require("./soljson-v0.4.21+commit.dfe3193c"));

// Create minimal JS containing ABI and bytecode from compiled contract
const BuildContracts = () => {
  const contractFiles = fs.readdirSync(path.join(__dirname, "..", "contracts"))
    .filter(filename => filename.endsWith(".sol") && filename !== "Migrations.sol");

  let sources = {};
  for (const contractFilename of contractFiles) {
    sources[contractFilename] = fs.readFileSync(path.join(__dirname, "..", "contracts", contractFilename)).toString();
  }

  const compilationResult = solc.compile({ sources }, 1);

  Object.keys(compilationResult.contracts).map((contractKey => {
    const contractName = contractKey.split(":")[1];

    const contractData = {
      abi: JSON.parse(compilationResult.contracts[contractKey].interface),
      bytecode: compilationResult.contracts[contractKey].bytecode
    };

    const contractJS = "const contract=" + JSON.stringify(contractData) + "; module.exports=contract;";

    fs.writeFileSync(path.join(__dirname, "..", "src", "contracts", contractName + ".js"), contractJS);
  }));
};

BuildContracts();
