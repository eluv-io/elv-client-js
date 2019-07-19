"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

if (typeof Buffer === "undefined") {
  Buffer = require("buffer/").Buffer;
}

var bs58 = require("bs58");

var BigNumber = require("bignumber.js");

var MultiHash = require("multihashes");

var VarInt = require("varint");
/**
 * @namespace
 * @description This is a utility namespace mostly containing functions for managing
 * multiformat type conversions
 *
 *
 * It can be accessed from ElvClient and FrameClient as client.utils
 */


var Utils = {
  name: "Utils",
  nullAddress: "0x0000000000000000000000000000000000000000",
  weiPerEther: BigNumber("1000000000000000000"),

  /**
   * Convert number or string to BigNumber
   *
   * @param {string | number} value - Value to convert to BigNumber
   *
   * @see https://github.com/MikeMcl/bignumber.js
   *
   * @returns {BigNumber} - Given value as a BigNumber
   */
  ToBigNumber: function ToBigNumber(value) {
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
  WeiToEther: function WeiToEther(wei) {
    wei = new BigNumber(wei);
    return BigNumber(wei).div(Utils.weiPerEther);
  },

  /**
   * Convert ether to wei
   *
   * @param {number | string | BigNumber} ether - Ether value to convert to wei
   *
   * @see https://github.com/MikeMcl/bignumber.js
   *
   * @returns {BigNumber} - Given value in wei
   */
  EtherToWei: function EtherToWei(ether) {
    return BigNumber(ether).times(Utils.weiPerEther);
  },

  /**
   * Convert address to normalized form - lower case with "0x" prefix
   *
   * @param {string} address - Address to format
   *
   * @returns {string} - Formatted address
   */
  FormatAddress: function FormatAddress(address) {
    if (!address || typeof address !== "string") {
      return "";
    }

    if (!address.startsWith("0x")) {
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
  FormatSignature: function FormatSignature(sig) {
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
  DecodeVersionHash: function DecodeVersionHash(versionHash) {
    if (!versionHash.startsWith("hq__")) {
      throw new Error("Invalid version hash: \"".concat(versionHash, "\""));
    }

    versionHash = versionHash.replace("hq__", ""); // Decode base58 payload

    var bytes = MultiHash.fromB58String(versionHash); // Remove 32 byte SHA256 digest

    var digestBytes = bytes.slice(0, 32);
    var digest = digestBytes.toString("hex");
    bytes = bytes.slice(32); // Determine size of varint content size

    var sizeLength = 0;

    while (bytes[sizeLength] >= 128) {
      sizeLength++;
    }

    sizeLength++; // Remove size

    var sizeBytes = bytes.slice(0, sizeLength);
    var size = VarInt.decode(sizeBytes);
    bytes = bytes.slice(sizeLength); // Remaining bytes is object ID

    var objectId = "iq__" + MultiHash.toB58String(bytes); // Part hash is B58 encoded version hash without the ID

    var partHash = "hqp_" + MultiHash.toB58String(Buffer.concat([digestBytes, sizeBytes]));
    return {
      digest: digest,
      size: size,
      objectId: objectId,
      partHash: partHash
    };
  },

  /**
   * Convert contract address to multiformat hash
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Hash of contract address
   */
  AddressToHash: function AddressToHash(address) {
    address = address.replace("0x", "");
    return bs58.encode(Buffer.from(address, "hex"));
  },

  /**
   * Convert contract address to content space ID
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content space ID from contract address
   */
  AddressToSpaceId: function AddressToSpaceId(address) {
    return "ispc" + Utils.AddressToHash(address);
  },

  /**
   * Convert contract address to content library ID
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content library ID from contract address
   */
  AddressToLibraryId: function AddressToLibraryId(address) {
    return "ilib" + Utils.AddressToHash(address);
  },

  /**
   * Convert contract address to content object ID
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content object ID from contract address
   */
  AddressToObjectId: function AddressToObjectId(address) {
    return "iq__" + Utils.AddressToHash(address);
  },

  /**
   * Convert any content fabric ID to the corresponding contract address
   *
   * @param {string} hash - Hash to convert to address
   *
   * @returns {string} - Contract address of item
   */
  HashToAddress: function HashToAddress(hash) {
    hash = hash.substr(4);
    return "0x" + bs58.decode(hash).toString("hex");
  },

  /**
   * Compare two addresses to determine if they are the same, regardless of format/capitalization
   *
   * @param firstAddress
   * @param secondAddress
   *
   * @returns {boolean} - Whether or not the addresses match
   */
  EqualAddress: function EqualAddress(firstAddress, secondAddress) {
    if (!firstAddress || !secondAddress) {
      return false;
    }

    return Utils.FormatAddress(firstAddress) === Utils.FormatAddress(secondAddress);
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
  EqualHash: function EqualHash(firstHash, secondHash) {
    if (!firstHash || !secondHash) {
      return false;
    }

    if (firstHash.length <= 4 || secondHash.length <= 4) {
      return false;
    }

    return Utils.HashToAddress(firstHash) === Utils.HashToAddress(secondHash);
  },

  /**
   * Convert the specified string to a bytes32 string
   *
   * @param {string} string - String to format as a bytes32 string
   *
   * @returns {string} - The given string in bytes32 format
   */
  ToBytes32: function ToBytes32(string) {
    var bytes32 = string.split("").map(function (_char) {
      return _char.charCodeAt(0).toString(16);
    }).join("");
    return "0x" + bytes32.slice(0, 64).padEnd(64, "0");
  },
  BufferToArrayBuffer: function BufferToArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  },
  B64: function B64(str) {
    return Buffer.from(str).toString("base64");
  },

  /**
   * Determine if the given value is cloneable - Data passed in messages must be cloneable
   *
   * @param {*} value - Value to check
   * @returns {boolean} - Whether or not the value is cloneable
   */
  IsCloneable: function IsCloneable(value) {
    if (Object(value) !== value) {
      // Primitive value
      return true;
    }

    switch ({}.toString.call(value).slice(8, -1)) {
      // Class
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
        return Object.keys(value).every(function (prop) {
          return Utils.IsCloneable(value[prop]);
        });

      case "Map":
        return _toConsumableArray(value.keys()).every(Utils.IsCloneable) && _toConsumableArray(value.values()).every(Utils.IsCloneable);

      case "Set":
        return _toConsumableArray(value.keys()).every(Utils.IsCloneable);

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
  MakeClonable: function MakeClonable(value) {
    if (Utils.IsCloneable(value)) {
      return value;
    }

    if (Buffer.isBuffer(value)) {
      return Utils.BufferToArrayBuffer(value);
    }

    switch ({}.toString.call(value).slice(8, -1)) {
      // Class
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
        return value.map(function (element) {
          return Utils.MakeClonable(element);
        });

      case "Set":
        return new Set(Array.from(value.keys()).map(function (entry) {
          return Utils.MakeClonable(entry);
        }));

      case "Map":
        var cloneableMap = new Map();
        Array.from(value.keys()).forEach(function (key) {
          var cloneable = Utils.MakeClonable(value.get(key));

          if (cloneable) {
            cloneableMap.set(key, cloneable);
          }
        });
        return cloneableMap;

      case "Error":
        return value.message;

      case "Object":
        var cloneableObject = {};
        Object.keys(value).map(function (key) {
          var cloneable = Utils.MakeClonable(value[key]);

          if (cloneable) {
            cloneableObject[key] = cloneable;
          }
        });
        return cloneableObject;

      default:
        return JSON.parse(JSON.stringify(value));
    }
  },
  PLATFORM_NODE: "node",
  PLATFORM_WEB: "web",
  PLATFORM_REACT_NATIVE: "react-native",
  Platform: function Platform() {
    if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
      return Utils.PLATFORM_REACT_NATIVE;
    } else if (typeof process !== "undefined" && typeof process.versions.node !== "undefined") {
      return Utils.PLATFORM_NODE;
    } else {
      return Utils.PLATFORM_WEB;
    }
  }
};
module.exports = Utils;