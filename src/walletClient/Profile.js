const Utils = require("../Utils");
const UrlJoin = require("url-join");

const StateStorePath = ({network, path}) => {
  return UrlJoin(network === "main" ? "/main" : "/dv3", path);
};

const UserProfilePath = ({network, appId, userAddress, key, type, mode}) => {
  return StateStorePath({network, path: UrlJoin(type === "app" ? "app" : "usr", type === "app" ? appId : "", userAddress, mode === "public" ? "pub" : "pri", key || "")});
};

/**
 * Methods related to getting and setting user profile data.
 *
 * @module ProfileMethods
 */

/**
 * Retrieve user profile metadata for the specified user
 *
 * @methodGroup ProfileMetadata
 * @namedParams
 * @param {string=} type="app" - Specify `app` or `user` metadata.
 * @param {string=} mode="public" - Specify `public` or `private` metadata. If private is specified, you may only retrieve metadata for the current user.
 * @param {string=} appId - Namespace to use for the metadata, if retrieving app metadata. Uses the app ID specified on client initialization by default.
 * @param {string=} userAddress - User to retrieve metadata for. If not specified, will retrieve metadata for the current user
 * @param {string=} key - The metadata key to retrieve
 *
 * @returns {Promise<Object|String>} - Returns the specified metadata
 */
exports.ProfileMetadata = async function({type="app", mode="public", appId, userAddress, key}) {
  try {
    const response = await this.stateStoreClient.Request({
      path: UserProfilePath({
        network: this.network,
        appId: appId || this.appId,
        userAddress: userAddress || this.UserAddress(),
        type,
        mode,
        key
      }),
      headers: mode === "private" ?
        {Authorization: `Bearer ${this.AuthToken()}`} : undefined
    });

    if(!response.ok) {
      throw response;
    }

    return (await Utils.ResponseToJson(response))[key];
  } catch(error) {
    if(error.status === 404) {
      return undefined;
    }

    throw error;
  }
};

/**
 * Set user profile metadata for the current user
 *
 * @methodGroup ProfileMetadata
 * @namedParams
 * @param {string=} type="app" - Specify `app` or `user` metadata.
 * @param {string=} mode="public" - Specify `public` or `private` metadata.
 * @param {string=} appId - Namespace to use for the metadata, if retrieving app metadata. Uses the app ID specified on client initialization by default.
 * @param {string} key - The metadata key to set
 * @param {string} value - The metadata value to set
 */
exports.SetProfileMetadata = async function({type="app", mode="public", appId, key, value}) {
  await this.stateStoreClient.Request({
    method: "POST",
    path: UserProfilePath({
      network: this.network,
      appId: appId || this.appId,
      userAddress: this.UserAddress(),
      type,
      mode,
      key
    }),
    body: value,
    bodyType: typeof value === "object" ? "JSON" : "string",
    headers: {
      Authorization: `Bearer ${this.AuthToken()}`
    }
  });
};


/**
 * Remove user profile metadata for the current user
 *
 * @methodGroup ProfileMetadata
 * @namedParams
 * @param {string=} type="app" - Specify `app` or `user` metadata.
 * @param {string=} mode="public" - Specify `public` or `private` metadata.
 * @param {string=} appId - Namespace to use for the metadata, if retrieving app metadata.. Uses the app ID specified on client initialization by default.
 * @param {string} key - The metadata key to set
 */
exports.RemoveProfileMetadata = async function({type="app", mode="public", appId, key}) {
  await this.stateStoreClient.Request({
    method: "DELETE",
    path: UserProfilePath({
      network: this.network,
      appId: appId || this.appId,
      userAddress: this.UserAddress(),
      type,
      mode,
      key
    }),
    headers: {
      Authorization: `Bearer ${this.AuthToken()}`
    }
  });
};

/**
 * Retrieve profile info for the specified user, including address, username, profile image (if set) and badges (if any)
 *
 * @methodGroup Profile
 * @param {string=} userAddress - Address of the user
 * @param {string=} userName - Username of the user
 *
 * @returns {Promise<Object>} - Profile info of the specified user
 */
exports.Profile = async function({userAddress, userName}) {
  if(userName) {
    userAddress = await this.UserNameToAddress({userName});
  }

  if(!userAddress) {
    throw Error("Eluvio Wallet Client: Unable to determine profile - user address not specified");
  }

  if(!userName) {
    userName = await this.ProfileMetadata({type: "user", userAddress, key: "username"});
  }

  const imageUrl = await this.ProfileMetadata({type: "user", userAddress, key: "icon_url"});

  let badgeData = await this.ProfileMetadata({
    type: "app",
    mode: "public",
    appId: "elv-badge-srv",
    userAddress: this.badgerAddress,
    key: `badges_${Utils.FormatAddress(userAddress)}`
  });

  let badges = [];
  if(badgeData) {
    try {
      badgeData = (JSON.parse(badgeData)).badges;
      badges = Object.keys(badgeData).map(badgeName => ({
        ...badgeData[badgeName],
        name: badgeName
      }));
    } catch(error) {
      this.Log(`Failed to load badge info for ${userName || userAddress}`, true);
      this.Log(error, true);
    }
  }

  return {
    userAddress: Utils.FormatAddress(userAddress),
    userName,
    imageUrl,
    badges
  };
};

exports.UserNameToAddress = async function({userName}) {
  try {
    const response = await this.stateStoreClient.Request({
      method: "GET",
      path: StateStorePath({network: this.network, path: UrlJoin("usr", "profile_for_username", userName)}),
    });

    if(!response.ok) {
      throw response;
    }

    return (await Utils.ResponseToJson(response)).address;
  } catch(error) {
    if(error.status !== 404) {
      throw error;
    }
  }

  return undefined;
};












