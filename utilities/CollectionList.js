const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");


class CollectionList extends Utility {
  blueprint() {
    return {
      concerns: [ Client  ],
      options: [
        NewOpt("collectionId", {
          demand: false,
          descTemplate: "ID of collection to list contents of"
        })
      ]
    };
  }

  async body() {
    const {collectionId} = await this.args;

    const client = await this.concerns.Client.get();

    
    if (collectionId) {
      this.logger.log(`Listing contents of collection ${collectionId}...`);
      const response = await client.TenantContent({
        filter: ["group:eq:" + collectionId],
        select: ["public/name"]
      })
      for (const item of response?.versions || []) {
        this.logger.log(`  ${item.id} - ${item.meta?.public?.name}`);
      }
      this.logger.data("content_count", response?.versions?.length || 0);
    } else {
      this.logger.log(`Listing all collections...`);
      const response = await client.TenantContent({
        filter: ["tag:eq:elv:content-collection"],
        select: ["public/name"]
      })
      for (const item of response?.versions || []) {
        this.logger.log(`  ${item.id} - ${item.meta?.public?.name}`);
      }
      this.logger.data("collection_count", response?.versions?.length || 0);    
    }
    
  }

  header() {
    return `List all collections, or contents of one V2 Fabric Folder / Collection`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(CollectionList);
} else {
  module.exports = CollectionList;
}
