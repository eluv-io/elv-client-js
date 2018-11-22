const bs58 = require("bs58");

/**
 * @namespace
 * @description This is a utility namespace mostly containing functions for managing
 * multiformat type conversions
 *
 *
 * It can be accessed from ElvClient and FrameClient as client.utils
 */
const Utils = {
  /**
   * Convert contract address to multiformat hash
   *
   * @namedParams
   * @param {string} address - Address of contract
   *
   * @returns {string} - Hash of contract address
   */
  AddressToHash: ({address}) => {
    address = address.replace("0x", "");
    return bs58.encode(Buffer.from(address, "hex"));
  },

  /**
   * Convert contract address to content space ID
   *
   * @namedParams
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content space ID from contract address
   */
  AddressToSpaceId: ({address}) => {
    return "ispc" + Utils.AddressToHash({address});
  },

  /**
   * Convert contract address to content library ID
   *
   * @namedParams
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content library ID from contract address
   */
  AddressToLibraryId: ({address}) => {
    return "ilib" + Utils.AddressToHash({address});
  },

  /**
   * Convert contract address to content object ID
   *
   * @namedParams
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content object ID from contract address
   */
  AddressToObjectId: ({address}) => {
    return "iq__" + Utils.AddressToHash({address});
  },

  /**
   * Convert any content fabric ID to the corresponding contract address
   *
   * @namedParams
   * @param {string} hash - Hash to convert to address
   *
   * @returns {string} - Contract address of item
   */
  HashToAddress: ({hash}) => {
    hash = hash.substr(4);
    return "0x" + bs58.decode(hash).toString("hex");
  },

  /**
   * Compare two IDs to determine if the hashes are the same
   * by comparing the contract address they resolve to
   *
   * @param firstHash
   * @param secondHash
   *
   * @returns {boolean} - Whether or not the hashes of the IDs match
   */
  EqualHash(firstHash, secondHash) {
    if((!firstHash || !secondHash) && firstHash !== secondHash) {
      return false;
    }

    return (Utils.HashToAddress({hash: firstHash}) === Utils.HashToAddress({hash: secondHash}));
  },

  /**
   * Convert the specified string to a bytes32 string
   *
   * @namedParams
   * @param {string} string - String to format as a bytes32 string
   *
   * @returns {string} - The given string in bytes32 format
   */
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
  },

  /**
   * Determine if the given value is cloneable - Data passed in messages must be cloneable
   *
   * @param {*} value - Value to check
   * @returns {boolean} - Whether or not the value is cloneable
   */
  IsCloneable: (value) => {
    if(Object(value) !== value) {
      // Primitive value
      return true;
    }

    switch({}.toString.call(value).slice(8,-1)) { // Class
    case "Boolean":
    case "Number":
    case "String":
    case "Date":
    case "RegExp":
    case "Blob":
    case "FileList":
    case "ImageData":
    case "ImageBitmap":
    case "ArrayBuffer":
      return true;
    case "Array":
    case "Object":
      return Object.keys(value).every(prop => Utils.IsCloneable(value[prop]));
    case "Map":
      return [...value.keys()].every(Utils.IsCloneable)
        && [...value.values()].every(Utils.IsCloneable);
    case "Set":
      return [...value.keys()].every(Utils.IsCloneable);
    default:
      return false;
    }
  },

  /**
   * Make the given value cloneable if it is not already.
   *
   * @param {*} value - Value to check
   * @returns {value} - Cloneable value - may be unchanged
   */
  MakeClonable: (value)=> {
    return Utils.IsCloneable(value) ? value : JSON.parse(JSON.stringify(value));
  }
};

module.exports = Utils;
