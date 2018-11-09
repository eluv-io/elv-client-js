const bs58 = require("bs58");

const Utils = {
  AddressToHash: ({address}) => {
    address = address.replace("0x", "");
    return bs58.encode(Buffer.from(address, "hex"));
  },

  HashToAddress: ({hash}) => {
    hash = hash.substr(4);
    return "0x" + bs58.decode(hash).toString("hex");
  },

  ToBytes32: ({string}) => {
    const bytes32 = string.split("").map(char => {
      return char.charCodeAt(0).toString(16);
    }).join("");

    return "0x" + bytes32.slice(0, 64).padEnd(64, "0");
  },

  HashToBytes32: ({hash}) => {
    // Parse hash as address and remove 0x and first 4 digits
    let address = Utils.HashToAddress({hash});
    address = address.replace("0x", "").slice(4);

    return Utils.ToBytes32({string: address});
  }
};

module.exports = Utils;
