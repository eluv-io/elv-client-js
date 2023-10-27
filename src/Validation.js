const Utils = require("./Utils");

exports.ValidatePresence = (name, thing) => {
  if(!thing) {
    throw Error(`${name} not specified`);
  }
};

exports.ValidateLibrary = (libraryId) => {
  if(!libraryId) {
    throw Error("Library ID not specified");
  } else if(!libraryId.toString().startsWith("i")) {
    throw Error(`Invalid library ID: ${libraryId}`);
  }
};

exports.ValidateObject = (objectId) => {
  if(!objectId) {
    throw Error("Object ID not specified");
  } else if(!objectId.toString().startsWith("i")) {
    throw Error(`Invalid object ID: ${objectId}`);
  }
};

exports.ValidateVersion = (versionHash) => {
  if(!versionHash) {
    throw Error("Version hash not specified");
  } else if(!versionHash.toString().startsWith("h")) {
    throw Error(`Invalid version hash: ${versionHash}`);
  }
};

exports.ValidateWriteToken = (writeToken) => {
  if(!writeToken) {
    throw Error("Write token not specified");
  } else if(!writeToken.toString().startsWith("t")) {
    throw Error(`Invalid write token: ${writeToken}`);
  }
};

exports.ValidatePartHash = (partHash) => {
  if(!partHash) {
    throw Error("Part hash not specified");
  }
  else if(!partHash.toString().startsWith("hqp_") &&
          !partHash.toString().startsWith("hqpe") &&
          !partHash.toString().startsWith("hqt_") &&
          !partHash.toString().startsWith("hqte") &&
          !partHash.toString().startsWith("hql_") &&
          !partHash.toString().startsWith("hqle")) {
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
    throw Error("Address not specified");
  } else if(!/^(0x)?[0-9a-f]{40}$/i.test(address.toLowerCase())) {
    throw Error(`Invalid address: ${address}`);
  }

  return Utils.FormatAddress(address);
};

exports.ValidatePermission = (permission) => {
  if(permission && permission !== "full-access" && permission !== "no-access") {
    throw Error(`Invalid profile permission: ${permission}`);
  }

  return permission;
};

exports.ValidateDate = (date) => {
  if(!date) { return; }

  if(isNaN(new Date(date))) {
    throw Error(`Invalid date: ${date}`);
  }

  return new Date(date).getTime();
};

exports.ValidateUserWallet = async ({address, client}) => {
  if(!address) {
    throw Error("Address not specified");
  }

  const walletAddress = await client.userProfileClient.UserWalletAddress({address});

  if(!walletAddress) {
    throw Error(`User address has no wallet: ${address}`);
  }

  const balance = await client.GetBalance({address});

  if(balance < 0.1) {
    throw Error(`User has no funds: ${address}`);
  }
};
