exports.ValidateLibrary = (libraryId) => {
  if(!libraryId) {
    throw "Library ID not specified";
  } else if(!libraryId.toString().startsWith("ilib")) {
    throw `Invalid library ID: ${libraryId}`;
  }
};

exports.ValidateObject = (objectId) => {
  if(!objectId) {
    throw "Object ID not specified";
  } else if(!objectId.toString().startsWith("iq__")) {
    throw `Invalid object ID: ${objectId}`;
  }
};

exports.ValidateVersion = (versionHash) => {
  if(!versionHash) {
    throw "Version hash not specified";
  } else if(!versionHash.toString().startsWith("hq__")) {
    throw `Invalid version hash: ${versionHash}`;
  }
};

exports.ValidateWriteToken = (writeToken) => {
  if(!writeToken) {
    throw "Write token not specified";
  } else if(!writeToken.toString().startsWith("tqw_")) {
    throw `Invalid write token: ${writeToken}`;
  }
};

exports.ValidatePartHash = (partHash) => {
  if(!partHash) {
    throw "Part hash not specified";
  } else if(!partHash.toString().startsWith("hqp_") && !partHash.toString().startsWith("hqpe")) {
    throw `Invalid part hash: ${partHash}`;
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
