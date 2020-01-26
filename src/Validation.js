exports.ValidatePresence = (name, thing) => {
  if(!thing) {
    throw Error(`${name} not specified`);
  }
};

exports.ValidateLibrary = (libraryId) => {
  if(!libraryId) {
    throw Error("Library ID not specified");
  } else if(!libraryId.toString().startsWith("ilib")) {
    throw Error(`Invalid library ID: ${libraryId}`);
  }
};

exports.ValidateObject = (objectId) => {
  if(!objectId) {
    throw "Object ID not specified";
  } else if(!objectId.toString().startsWith("iq__")) {
    throw Error(`Invalid object ID: ${objectId}`);
  }
};

exports.ValidateVersion = (versionHash) => {
  if(!versionHash) {
    throw Error("Version hash not specified");
  } else if(!versionHash.toString().startsWith("hq__")) {
    throw Error(`Invalid version hash: ${versionHash}`);
  }
};

exports.ValidateWriteToken = (writeToken) => {
  if(!writeToken) {
    throw Error("Write token not specified");
  } else if(!writeToken.toString().startsWith("tqw_")) {
    throw Error(`Invalid write token: ${writeToken}`);
  }
};

exports.ValidatePartHash = (partHash) => {
  if(!partHash) {
    throw Error("Part hash not specified");
  } else if(!partHash.toString().startsWith("hqp_") && !partHash.toString().startsWith("hqpe")) {
    throw Error(`Invalid part hash: ${partHash}`);
  }
};

exports.ValidateParameters = ({libraryId, objectId, versionHash}) => {
  if(versionHash) {
    exports.ValidateVersion(versionHash);
  } else {
    exports.ValidateLibrary(libraryId);
    exports.ValidateObject(objectId);
  }
};

exports.ValidateAddress = (address) => {
  if(!address) {
    throw "Address not specified";
  } else if(address.toString().trim().replace("0x", "").length !== 40) {
    throw `Invalid address: ${address}`;
  }
};
