const clib = artifacts.require("ContentLibrary");
const hw = artifacts.require("HelloWorld");
const cont = artifacts.require("Content");
const utils = artifacts.require("Utils");
const Verifier = artifacts.require("Verifier");

module.exports = function(deployer) {
  deployer.deploy(Verifier);
  deployer.deploy(utils);
  deployer.deploy(clib, "library1", "space1", 0x0)
    .then(() => {
      console.log("got DEPLOYED library address: " + clib.address);
      return deployer.deploy(cont, clib.address, "CONTENT_TYPE");
    }).then(() => console.log("got DEPLOYED content address: " + cont.address));
  deployer.deploy(hw);
};
