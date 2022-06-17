const UrlJoin = require("url-join");

exports.TenantConfiguration = async ({tenantId, contractAddress}) => {
  try {
    return await this.utils.ResponseToJson(
      this.client.authClient.MakeAuthServiceRequest({
        path: contractAddress ?
          UrlJoin("as", "config", "nft", contractAddress) :
          UrlJoin("as", "config", "tnt", tenantId),
        method: "GET",
      })
    );
  } catch(error) {
    this.Log("Failed to load tenant configuration", true);
    this.Log(error, true);

    return {};
  }
};
