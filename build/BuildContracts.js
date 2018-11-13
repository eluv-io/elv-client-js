const fs = require("fs");
const path = require("path");
const solc = require("solc").setupMethods(require("./soljson-v0.4.21+commit.dfe3193c"));

// Create minimal JS containing ABI and bytecode from compiled contract
const BuildContracts = () => {
  const contractSource = [
    "base_content.sol",
    "base_content_space.sol",
    "base_library.sol",
    "content.sol",
    "editable.sol",
    "base_access_control_group.sol",
    "base_content_type.sol",
    "ownable.sol"
  ];

  let sources = {};
  for (const contractFilename of contractSource) {
    sources[contractFilename] = fs.readFileSync(path.join(__dirname, "..", "contracts", "base", contractFilename)).toString();
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
