/**
 * Methods for creating and managing shared authorization tokens
 *
 * @module ElvClient/Shares
 */

const UrlJoin = require("url-join");

/**
 * Create a share
 *
 * @namedParams
 * @param {string} objectId - The object to create a share for
 * @param {Date} expiresAt - The expiration time of the share
 * @param {Object=} params - Additional parameters
 *
 * @returns {Promise<Object>} - Info about the created share
 */
exports.CreateShare = async function({objectId, expiresAt, params={}}) {
  const tenantId = await this.userProfileClient.TenantContractId();

  params.object_id = objectId;

  if(expiresAt) {
    params.end_time = Math.floor(new Date(expiresAt).getTime() / 1000);
  }

  return await this.MakeAuthServiceRequest({
    path: UrlJoin("as", "sharing", tenantId, "share"),
    method: "POST",
    body: params,
    headers: {
      Authorization: `Bearer ${this.signedToken}`
    }
  });
};

/**
 * List shares associated with your tenancy
 *
 * @namedParams
 * @param {string=} objectId - If specified, the results will be limited shares for the specified object
 * @param {number=} limit=100 - Maximum number of results to return
 * @param {number=} offset=0 - Offset from which to return results
 *
 * @returns {Promise<Array<Object>>} - Info about the shares
 */
exports.Shares = async function({objectId, limit=100, offset=0}={}) {
  const tenantId = await this.userProfileClient.TenantContractId();

  const response = await this.MakeAuthServiceRequest({
    path: UrlJoin("as", "sharing", tenantId, "shares"),
    method: objectId ? "POST" : "GET",
    queryParams: { limit, offset },
    body: objectId ? {object_id: objectId} : undefined,
    format: "JSON",
    headers: {
      Authorization: `Bearer ${this.signedToken}`
    }
  });

  // Convert dates from seconds to date strings
  if(response && response.shares) {
    response.shares = response.shares.map(share => ({
      ...share,
      start_time: share.start_time ? new Date(share.start_time * 1000).toISOString() : null,
      end_time: share.end_time ? new Date(share.end_time * 1000).toISOString() : null,
    }));
  }

  return response;
};

/**
 * Update the specified share
 *
 * @namedParams
 * @param {string} shareId - The ID of the share to modify
 * @param {Date=} expiresAt - The new expiration time of the share
 * @param {Object=} params - Additional parameters
 *
 * @returns {Promise<Object>} - Info about the updated share
 */
exports.UpdateShare = async function({shareId, expiresAt, params={}}) {
  const tenantId = await this.userProfileClient.TenantContractId();

  if(expiresAt) {
    params.end_time = Math.floor(new Date(expiresAt).getTime() / 1000);
  }

  return await this.MakeAuthServiceRequest({
    path: UrlJoin("as", "sharing", tenantId, "share", shareId),
    method: "PUT",
    format: "JSON",
    body: params,
    headers: {
      Authorization: `Bearer ${this.signedToken}`
    }
  });
};

/**
 * Revoke the specified share
 *
 * @namedParams
 * @param {string} shareId - The ID of the share to modify
 */
exports.RevokeShare = async function({shareId}) {
  const tenantId = await this.userProfileClient.TenantContractId();

  return await this.MakeAuthServiceRequest({
    path: UrlJoin("as", "sharing", tenantId, "share", shareId, "revoke"),
    method: "PUT",
    format: "JSON",
    headers: {
      Authorization: `Bearer ${this.signedToken}`
    }
  });
};

/**
 * Retrieve info about the specified share
 *
 * @namedParams
 * @param {string} shareId - The ID of the share
 *
 * @returns {Promise<Object>} - Info about the share
 */
exports.ShareInfo = async function({shareId}) {
  const {share} = await this.MakeAuthServiceRequest({
    path: UrlJoin("as", "sharing", "share", shareId, "info"),
    method: "GET",
    format: "JSON"
  });

  if(share.start_time) {
    share.start_time = new Date(share.start_time * 1000).toISOString();
  }

  if(share.end_time) {
    share.end_time = new Date(share.end_time * 1000).toISOString();
  }

  return share;
};

/**
 * Retrieve the authorization token for the specified share
 *
 * @namedParams
 * @param {string} shareId - The ID of the share
 *
 * @returns {Promise<Object>} - The authorization token for the share
 */
exports.RedeemShareToken = async function({shareId}) {
  return (await this.MakeAuthServiceRequest({
    path: UrlJoin("as", "sharing", "share", shareId, "token"),
    method: "GET",
    format: "JSON"
  })).token;
};
