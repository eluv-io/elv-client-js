if(typeof Buffer === "undefined") { Buffer = require("buffer/").Buffer; }

const bs58 = require("bs58");
const BigNumber = require("bignumber.js").default;
const VarInt = require("varint");
const URI = require("urijs");

const {
  keccak256,
  getAddress
} = require("ethers").utils;

/**
 * @namespace
 * @description This is a utility namespace mostly containing functions for managing
 * multiformat type conversions.
 *
 * Utils can be imported separately from the client:
 *
 * const Utils = require("@eluvio/elv-client-js/src/Utils)
 *
 * or
 *
 * import Utils from "@eluvio/elv-client-js/src/Utils"
 *
 *
 * It can be accessed from ElvClient and FrameClient as client.utils
 */
const Utils = {
  name: "Utils",
  nullAddress: "0x0000000000000000000000000000000000000000",
  weiPerEther: new BigNumber("1000000000000000000"),

  /**
   * Convert number or string to BigNumber
   *
   * @param {string | number} value - Value to convert to BigNumber
   *
   * @see https://github.com/MikeMcl/bignumber.js
   *
   * @returns {BigNumber} - Given value as a BigNumber
   */
  ToBigNumber: (value) => {
    return new BigNumber(value);
  },

  /**
   * Convert wei to ether
   *
   * @param {string | BigNumber} wei - Wei value to convert to ether
   *
   * @see https://github.com/MikeMcl/bignumber.js
   *
   * @returns {BigNumber} - Given value in ether
   */
  WeiToEther: (wei) => {
    return Utils.ToBigNumber(wei).div(Utils.weiPerEther);
  },

  /**
   * Convert ether to wei
   *
   * @param {number | string | BigNumber} ether - Ether value to convert to wei
   *
   * @see https://github.com/indutny/bn.js/
   *
   * @returns {BigNumber} - Given value in wei
   */
  EtherToWei: (ether) => {
    return Utils.ToBigNumber(ether).times(Utils.weiPerEther);
  },

  /**
   * Convert address to normalized form - lower case with "0x" prefix
   *
   * @param {string} address - Address to format
   *
   * @returns {string} - Formatted address
   */
  FormatAddress: (address) => {
    if(!address || typeof address !== "string") {
      return "";
    }

    address = address.trim();

    if(!address.startsWith("0x")) {
      address = "0x" + address;
    }
    return address.toLowerCase();
  },

  /**
   * Formats a signature into multi-sig
   *
   * @param {string} sig - Hex representation of signature
   *
   * @returns {string} - Multi-sig string representation of signature
   */
  FormatSignature: (sig) => {
    sig = sig.replace("0x", "");
    return "ES256K_" + bs58.encode(Buffer.from(sig, "hex"));
  },

  /**
   * Decode the specified version hash into its component parts
   *
   * @param versionHash
   *
   * @returns {Object} - Components of the version hash.
   */
  DecodeVersionHash: (versionHash) => {
    if(!(versionHash.startsWith("hq__") || versionHash.startsWith("tq__"))) {
      throw new Error(`Invalid version hash: "${versionHash}"`);
    }

    versionHash = versionHash.slice(4);

    // Decode base58 payload
    let bytes = Utils.FromB58(versionHash);

    // Remove 32 byte SHA256 digest
    const digestBytes = bytes.slice(0, 32);
    const digest = digestBytes.toString("hex");
    bytes = bytes.slice(32);

    // Determine size of varint content size
    let sizeLength = 0;
    while(bytes[sizeLength] >= 128) {
      sizeLength++;
    }
    sizeLength++;

    // Remove size
    const sizeBytes = bytes.slice(0, sizeLength);
    const size = VarInt.decode(sizeBytes);
    bytes = bytes.slice(sizeLength);

    // Remaining bytes is object ID
    const objectId = "iq__" + Utils.B58(bytes);

    // Part hash is B58 encoded version hash without the ID
    const partHash = "hqp_" + Utils.B58(Buffer.concat([digestBytes, sizeBytes]));

    return {
      digest,
      size,
      objectId,
      partHash
    };
  },

  /**
   * Decode the specified write token into its component parts
   * Format:
   * - content write token, LRO:
   *   - prefix: "tq__", "tqw__", "tlro"
   *   - format:
   *     prefix + base58(uvarint(len(QID) | QID |
   *                     uvarint(len(NID) | NID |
   *                     uvarint(len(RAND_BYTES) | RAND_BYTES)
   * - content part write token:
   *   - prefix: "tqp_"
   *   - format:
   *     prefix + base58(scheme | flags | uvarint(len(RAND_BYTES) | RAND_BYTES)
   * - content write token v1, content part write token v1:
   *   - prefix: "tqw_", "tqpw"
   *   - format:
   *     prefix + base58(RAND_BYTES)
   *
   * @param writeToken
   *
   * @returns {Object} - Components of the write token.
   */
  DecodeWriteToken: (writeToken) => {
    if(writeToken.length<4){
      throw new Error(`Invalid write token: ["${writeToken}"] (unknown prefix)`);
    }

    let writeTokenType;

    if(writeToken.startsWith("tqw__")) {
      writeTokenType = "tq__";
      writeToken = writeToken.slice(5);
    } else {
      writeTokenType = writeToken.slice(0, 4);
      writeToken = writeToken.slice(4);
    }
    if(writeToken.length===0){
      throw new Error(`Invalid write token: ["${writeToken}"] (too short)`);
    }

    switch(writeTokenType) {
      case "tqw_":
      case "tq__":
      case "tqpw":
      case "tqp_":
      case "tlro":
        break;
      default:
        throw new Error(`Invalid write token: ["${writeToken}"] (unknown prefix)`);
    }

    // decode base58 payload
    let bytes = Utils.FromB58(writeToken);

    function decodeBytes(isID, prefix) {
      let bsize = VarInt.decode(bytes,0);
      let offset = VarInt.decode.bytes;
      let theBytes;
      let ret;

      if(isID) {
        theBytes = bytes.slice(offset+1, bsize+1); // 1 byte size + 1 byte type
        if(theBytes.length===0){
          ret = "";
        } else {
          ret = prefix + Utils.B58(theBytes);
        }
      } else {
        theBytes = bytes.slice(offset, bsize+1);
        ret = "0x" + theBytes.toString("hex");
      }
      bytes = bytes.slice(bsize+1);
      return ret;
    }

    let tokId;
    let qid;
    let nid;
    let scheme;
    let flags;

    switch(writeTokenType) {
      case "tqw_": // content write token v1
      case "tqpw": // content part write token v1
        tokId = "0x" + bytes.toString("hex");
        break;
      case "tlro": // LRO,
      case "tq__": // content write token
        qid = decodeBytes(true, "iq__");
        nid = decodeBytes(true, "inod");
        tokId = decodeBytes(false, "");
        break;
      case "tqp_": // content part write token
        if(bytes.length<3) {
          throw new Error(`Invalid write token: ["${writeToken}"] (token truncated)`);
        }
        scheme=bytes[0];
        flags=bytes[1];
        bytes = bytes.slice(2);
        tokId = decodeBytes(false, "");
        break;
      default:
        // already raised
        throw new Error(`Invalid write token: ["${writeToken}"] (unknown prefix)`);
    }

    return {
      writeTokenType,
      tokId,
      qid,
      nid,
      scheme,
      flags
    };
  },

  /**
   * Convert contract address to multiformat hash
   *
   * @param {string} address - Address of contract
   * @param {boolean} key - Whether or not the first param is a public key. Defaults to address type
   *
   * @returns {string} - Hash of contract address
   */
  AddressToHash: (address, key=false) => {
    address = address.replace(key ? "0x04" : "0x", "");
    return bs58.encode(Buffer.from(address, "hex"));
  },

  /**
   * Convert contract address to content space ID
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content space ID from contract address
   */
  AddressToSpaceId: (address) => {
    return "ispc" + Utils.AddressToHash(address);
  },

  /**
   * Convert contract address to content library ID
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content library ID from contract address
   */
  AddressToLibraryId: (address) => {
    return "ilib" + Utils.AddressToHash(address);
  },

  /**
   * Convert contract address to content object ID
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content object ID from contract address
   */
  AddressToObjectId: (address) => {
    return "iq__" + Utils.AddressToHash(address);
  },

  /**
   * Convert any content fabric ID to the corresponding contract address
   *
   * @param {string} hash - Hash to convert to address
   * @param {boolean} key - Whether or not the first param is a key. Defaults to address type
   *
   * @returns {string} - Contract address of item
   */
  HashToAddress: (hash, key=false) => {
    hash = key ? hash : hash.substr(4);
    return Utils.FormatAddress((key ? "0x04" : "0x") + bs58.decode(hash).toString("hex"));
  },

  /**
   * Compare two addresses to determine if they are the same, regardless of format/capitalization
   *
   * @param firstAddress
   * @param secondAddress
   *
   * @returns {boolean} - Whether or not the addresses match
   */
  EqualAddress(firstAddress, secondAddress) {
    if(!firstAddress || !secondAddress) {
      return false;
    }

    return (Utils.FormatAddress(firstAddress) === Utils.FormatAddress(secondAddress));
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
    if(!firstHash || !secondHash) {
      return false;
    }

    if(firstHash.length <= 4 || secondHash.length <= 4) {
      return false;
    }

    return (Utils.HashToAddress(firstHash) === Utils.HashToAddress(secondHash));
  },

  /**
   * Determine whether the address is valid
   *
   * @param {string} address - Address to validate
   *
   * @returns {boolean} - Whether or not the address is valid
   */
  ValidAddress: (address) => {
    try {
      getAddress(address);
      return true;
    } catch(error) {
      this.Log(error);
      return false;
    }
  },

  /**
   * Determine whether the hash is valid
   *
   * @param {string} hash - Hash to validate
   *
   * @returns {boolean} - Whether or not the hash is valid
   */
  ValidHash: (hash) => {
    return Utils.ValidAddress(Utils.HashToAddress(hash));
  },

  /**
   * Convert the specified string to a bytes32 string
   *
   * @param {string} string - String to format as a bytes32 string
   *
   * @returns {string} - The given string in bytes32 format
   */
  ToBytes32: (string) => {
    const bytes32 = string.split("").map(char => {
      return char.charCodeAt(0).toString(16);
    }).join("");

    return "0x" + bytes32.slice(0, 64).padEnd(64, "0");
  },

  BufferToArrayBuffer: (buffer) => {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  },

  B64: str => {
    return Buffer.from(str, "utf-8").toString("base64");
  },

  FromB64: str => {
    return Buffer.from(str, "base64").toString("utf-8");
  },

  B58: arr => {
    return bs58.encode(Buffer.from(arr));
  },

  FromB58: str => {
    return bs58.decode(str);
  },

  /**
   * Decode the given fabric authorization token
   *
   * @param {string} token - The authorization token to decode
   * @return {Object} - Token Info: {qspace_id, qlib_id*, addr, tx_id*, afgh_pk*, signature}
   */
  DecodeAuthorizationToken: token => {
    token = decodeURIComponent(token);

    let [info, signature] = token.split(".");

    info = JSON.parse(Utils.FromB64(info));

    return {
      ...info,
      signature
    };
  },

  LimitedMap: async (limit, array, f) => {
    let index = 0;
    let locked = false;
    const nextIndex = async () => {
      while(locked) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      locked = true;
      const thisIndex = index;
      index += 1;
      locked = false;

      return thisIndex;
    };

    let results = [];
    let active = 0;
    return new Promise((resolve, reject) => {
      [...Array(limit || 1)].forEach(async () => {
        active += 1;
        let index = await nextIndex();

        while(index < array.length) {
          try {
            results[index] = await f(array[index], index);
          } catch(error) {
            reject(error);
          }

          index = await nextIndex();
        }

        // When finished and no more workers are active, resolve
        active -= 1;
        if(active === 0) {
          resolve(results);
        }
      });
    });
  },

  ResponseToJson: async (response) => {
    return Utils.ResponseToFormat("json", response);
  },

  ResponseToFormat: async (format, response) => {
    response = await response;

    switch(format.toLowerCase()) {
      case "json":
        return await response.json();
      case "text":
        return await response.text();
      case "blob":
        return await response.blob();
      case "arraybuffer":
        return await response.arrayBuffer();
      case "formdata":
        return await response.formData();
      case "buffer":
        return await response.buffer();
      default:
        return response;
    }
  },

  /**
   * Resize the image file or link URL to the specified maximum height. Can also be used to remove
   * max height parameter(s) from a url if height is not specified.
   *
   * @param imageUrl - Url to an image file or link in the Fabric
   * @param {number=} height - The maximum height for the image to be scaled to.
   *
   * @returns {string} - The modified URL with the height parameter
   */
  ResizeImage({imageUrl, height}) {
    if(!imageUrl || (imageUrl && !imageUrl.startsWith("http"))) {
      return imageUrl;
    }

    imageUrl = URI(imageUrl)
      .removeSearch("height")
      .removeSearch("header-x_image_height");

    if(height && !isNaN(parseInt(height))) {
      imageUrl.addSearch("height", parseInt(height));
    }

    return imageUrl.toString();
  },

  SafeTraverse(object, ...keys) {
    if(!object) { return object; }

    if(keys.length === 1 && Array.isArray(keys[0])) {
      keys = keys[0];
    }

    let result = object;

    for(let i = 0; i < keys.length; i++){
      result = result[keys[i]];

      if(result === undefined) { return undefined; }
    }

    return result;
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

    switch({}.toString.call(value).slice(8, -1)) { // Class
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
   * Note: this will remove or transform any attributes of the object that are not cloneable (e.g. functions)
   *
   * Transformations:
   * - Buffer: Converted to ArrayBuffer
   * - Error: Converted to string (error.message)
   *
   * @param {*} value - Value to check
   * @returns {*} - Cloneable value
   */
  MakeClonable: (value) => {
    if(Utils.IsCloneable(value)) { return value; }

    if(Buffer.isBuffer(value)) {
      return Utils.BufferToArrayBuffer(value);
    }

    switch({}.toString.call(value).slice(8, -1)) { // Class
      case "Response":
      case "Function":
        return undefined;
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
        return value;
      case "Array":
        return value.map(element => Utils.MakeClonable(element));
      case "Set":
        return new Set(Array.from(value.keys()).map(entry => Utils.MakeClonable(entry)));
      case "Map":
        let cloneableMap = new Map();
        Array.from(value.keys()).forEach(key => {
          const cloneable = Utils.MakeClonable(value.get(key));

          if(cloneable) {
            cloneableMap.set(key, cloneable);
          }
        });
        return cloneableMap;
      case "Error":
        return value.message;
      case "Object":
        let cloneableObject = {};
        Object.keys(value).map(key => {
          const cloneable = Utils.MakeClonable(value[key]);

          if(cloneable) {
            cloneableObject[key] = cloneable;
          }
        });
        return cloneableObject;
      default:
        return JSON.parse(JSON.stringify(value));
    }
  },

  /**
   * Converts the given string to a public address
   *
   * @param key - Public key to convert to a public address
   *
   * @returns {string} - the public address
   */
  PublicKeyToAddress: (key) => {
    const keyData = new Uint8Array(Buffer.from(key.replace("0x04", ""), "hex"));
    const keccakHash = keccak256(keyData);
    const address = "0x" + keccakHash.slice(26);

    return Utils.FormatAddress(address);
  },

  PLATFORM_NODE: "node",
  PLATFORM_WEB: "web",
  PLATFORM_REACT_NATIVE: "react-native",

  Platform: () => {
    if(typeof navigator !== "undefined" && navigator.product === "ReactNative") {
      return Utils.PLATFORM_REACT_NATIVE;
    } else if(
      (typeof process !== "undefined") &&
      (typeof process.versions !== "undefined") &&
      (typeof process.versions.node !== "undefined")
    ) {
      return Utils.PLATFORM_NODE;
    } else {
      return Utils.PLATFORM_WEB;
    }
  },
};

module.exports = Utils;
