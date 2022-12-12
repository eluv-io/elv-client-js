const {NewOpt} = require("../options");

const Version = require("./Version");

const hashDecodes = argv => {
  const versionHash = argv.masterHash;
  try {
    Version.decode({versionHash});
  } catch(e) {
    throw Error(`Decoding masterHash '${JSON.stringify(versionHash)}' failed: ${e}`);
  }
  return true;
};

const blueprint = {
  name: "ArgMasterHash",
  options: [
    NewOpt("masterHash", {
      demand: true,
      descTemplate: "Version hash of the master object",
      type: "string"
    })
  ],
  checksMap: {hashDecodes}
};

const New = context => {
  // instance interface
  return {};
};

module.exports = {
  blueprint,
  New
};
