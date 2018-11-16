const bs58 = require("bs58");

const Utils = {
  AddressToHash: ({address}) => {
    address = address.replace("0x", "");
    return bs58.encode(Buffer.from(address, "hex"));
  },

  AddressToSpaceId: ({address}) => {
    return "ispc" + Utils.AddressToHash({address});
  },

  AddressToLibraryId: ({address}) => {
    return "ilib" + Utils.AddressToHash({address});
  },

  AddressToObjectId: ({address}) => {
    return "iq__" + Utils.AddressToHash({address});
  },

  HashToAddress: ({hash}) => {
    hash = hash.substr(4);
    return "0x" + bs58.decode(hash).toString("hex");
  },

  EqualHash(firstHash, secondHash) {
    if((!firstHash || !secondHash) && firstHash !== secondHash) {
      return false;
    }

    return (Utils.HashToAddress({hash: firstHash}) === Utils.HashToAddress({hash: secondHash}));
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
    return "0x" + address.replace("0x", "").slice(4);
  }
};

module.exports = Utils;
