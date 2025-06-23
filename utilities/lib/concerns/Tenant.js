// code related to tenant data
const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Tenant",
  concerns: [Client, Logger]
};

const New = context => {
  const logger = context.concerns.Logger;

  const info = async () => {
    const client = await context.concerns.Client.get();
    const tenantId = await client.userProfileClient.TenantContractId();
    logger.log(`Getting info for tenant ${tenantId}...`);

    const metadata = await client.ContentObjectMetadata({
      libraryId: tenantId.replace("iten", "ilib"),
      objectId: tenantId.replace("iten", "iq__"),
      metadataSubtree: "public",
      select: [
        "sites/live_streams",
        "content_types/live_stream",
        "content_types/title"
      ]
    });

    const typeTitle = metadata.content_types && metadata.content_types.title;
    const typeLiveStream = metadata.content_types && metadata.content_types.live_stream;
    const sitesLiveStream = metadata.sites && metadata.sites.live_streams;

    return {
      typeTitle,
      typeLiveStream,
      sitesLiveStream,
      tenantId
    };
  };

  return {info};
};

module.exports = {
  blueprint,
  New
};
