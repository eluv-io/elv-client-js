const MultiHash = require("multihashes");

const Utils = {
  AddressToHash: ({address}) => {
    address = address.replace("0x", "");
    return MultiHash.toB58String(Buffer.from(address, "hex"));
  },

  HashToAddress: ({hash}) => {
    hash = hash.substr(4);
    return "0x" + MultiHash.fromB58String(hash).toString("hex");
  },
};

module.exports = Utils;
