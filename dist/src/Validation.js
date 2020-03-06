exports.ValidatePresence = function (name, thing) {
  if (!thing) {
    throw Error("".concat(name, " not specified"));
  }
};

exports.ValidateLibrary = function (libraryId) {
  if (!libraryId) {
    throw Error("Library ID not specified");
  } else if (!libraryId.toString().startsWith("ilib")) {
    throw Error("Invalid library ID: ".concat(libraryId));
  }
};

exports.ValidateObject = function (objectId) {
  if (!objectId) {
    throw "Object ID not specified";
  } else if (!objectId.toString().startsWith("iq__")) {
    throw Error("Invalid object ID: ".concat(objectId));
  }
};

exports.ValidateVersion = function (versionHash) {
  if (!versionHash) {
    throw Error("Version hash not specified");
  } else if (!versionHash.toString().startsWith("hq__")) {
    throw Error("Invalid version hash: ".concat(versionHash));
  }
};

exports.ValidateWriteToken = function (writeToken) {
  if (!writeToken) {
    throw Error("Write token not specified");
  } else if (!writeToken.toString().startsWith("tqw_")) {
    throw Error("Invalid write token: ".concat(writeToken));
  }
};

exports.ValidatePartHash = function (partHash) {
  if (!partHash) {
    throw Error("Part hash not specified");
  } else if (!partHash.toString().startsWith("hqp_") && !partHash.toString().startsWith("hqpe")) {
    throw Error("Invalid part hash: ".concat(partHash));
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