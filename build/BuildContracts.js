const fs = require("fs");
const path = require("path");

// Create minimal JS containing ABI and bytecode from compiled contract
const BuildContracts = () => {
  const contractsToBuild = [
    "ContentLibrary"
  ];

  for (const contractFilename of contractsToBuild) {
    const compiledContract = JSON.parse(fs.readFileSync(path.join(__dirname, "contracts", contractFilename + ".json")));

    const contractData = {
      abi: compiledContract.abi,
      bytecode: compiledContract.bytecode
    };

    const contractJS = "const contract=" + JSON.stringify(contractData) + "; module.exports=contract;";

    fs.writeFileSync(path.join(__dirname, "..", "src", "contracts", contractFilename + ".js"), contractJS);
  }
};

BuildContracts();
