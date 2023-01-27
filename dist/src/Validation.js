var Utils = require("./Utils");
exports.ValidatePresence = function (name, thing) {
  if (!thing) {
    throw Error("".concat(name, " not specified"));
  }
};
exports.ValidateLibrary = function (libraryId) {
  if (!libraryId) {
    throw Error("Library ID not specified");
  } else if (!libraryId.toString().startsWith("i")) {
    throw Error("Invalid library ID: ".concat(libraryId));
  }
};
exports.ValidateObject = function (objectId) {
  if (!objectId) {
    throw Error("Object ID not specified");
  } else if (!objectId.toString().startsWith("i")) {
    throw Error("Invalid object ID: ".concat(objectId));
  }
};
exports.ValidateVersion = function (versionHash) {
  if (!versionHash) {
    throw Error("Version hash not specified");
  } else if (!versionHash.toString().startsWith("h")) {
    throw Error("Invalid version hash: ".concat(versionHash));
  }
};
exports.ValidateWriteToken = function (writeToken) {
  if (!writeToken) {
    throw Error("Write token not specified");
  } else if (!writeToken.toString().startsWith("t")) {
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
    throw Error("Address not specified");
  } else if (!/^(0x)?[0-9a-f]{40}$/i.test(address.toLowerCase())) {
    throw Error("Invalid address: ".concat(address));
  }
  return Utils.FormatAddress(address);
};
exports.ValidatePermission = function (permission) {
  if (permission && permission !== "full-access" && permission !== "no-access") {
    throw Error("Invalid profile permission: ".concat(permission));
  }
  return permission;
};
exports.ValidateDate = function (date) {
  if (!date) {
    return;
  }
  if (isNaN(new Date(date))) {
    throw Error("Invalid date: ".concat(date));
  }
  return new Date(date).getTime();
};