"use strict";

exports.ValidateLibrary = function (libraryId) {
  if (!libraryId) {
    throw "Library ID not specified";
  } else if (!libraryId.toString().startsWith("ilib")) {
    throw "Invalid library ID: ".concat(libraryId);
  }
};

exports.ValidateObject = function (objectId) {
  if (!objectId) {
    throw "Object ID not specified";
  } else if (!objectId.toString().startsWith("iq__")) {
    throw "Invalid object ID: ".concat(objectId);
  }
};

exports.ValidateVersion = function (versionHash) {
  if (!versionHash) {
    throw "Version hash not specified";
  } else if (!versionHash.toString().startsWith("hq__")) {
    throw "Invalid version hash: ".concat(versionHash);
  }
};

exports.ValidateWriteToken = function (writeToken) {
  if (!writeToken) {
    throw "Write token not specified";
  } else if (!writeToken.toString().startsWith("tqw_")) {
    throw "Invalid write token: ".concat(writeToken);
  }
};

exports.ValidatePartHash = function (partHash) {
  if (!partHash) {
    throw "Part hash not specified";
  } else if (!partHash.toString().startsWith("hqp_") && !partHash.toString().startsWith("hqpe")) {
    throw "Invalid part hash: ".concat(partHash);
  }
};

exports.ValidateParameters = function (_ref) {
  var libraryId = _ref.libraryId,
      objectId = _ref.objectId,
      versionHash = _ref.versionHash;

  if (versionHash) {
    exports.ValidateVersion(versionHash);
  } else {
    exports.ValidateLibrary(libraryId);
    exports.ValidateObject(objectId);
  }
};

exports.ValidateAddress = function (address) {
  if (!address) {
    throw "Address not specified";
  } else if (address.toString().trim().replace("0x", "").length !== 40) {
    throw "Invalid address: ".concat(address);
  }
};