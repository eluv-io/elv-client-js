/**
 * Methods for creating and managing NFTs
 *
 * @module ElvClient/NFT
 */

const UUID = require("uuid");
const UrlJoin = require("url-join");
const {
  ValidateAddress,
  ValidateObject,
  ValidatePresence
} = require("../Validation");

/**
 * Mint NFTs for the specified user
 *
 * @methodGroup Minting
 * @namedParams
 * @param {string} tenantId - The ID of the tenant
 * @param {string=} address - The address of the NFT recipient
 * @param {string} marketplaceId - The ID of the marketplace containing the NFT
 * @param {Array<Object>} items - List of items
 * @param {string} items.sku - SKU of the NFT
 * @param {number=} items.quantity=1 - Number to mint
 * @param {(string | Array<string>)=} items.tokenId - Custom token IDs for these items (must be unique).
 * @param {Object=} items.extraData={} - Additional data to put in the transaction
 * @param {Object=} extraData={} - Additional data to put in the transaction
 *
 * @return Promise<Object> - An object containing the address for whom the NFT was minted and the transactionId of the minting request.
 */
exports.MintNFT = async function({tenantId, address, marketplaceId, items, extraData={}}) {
  ValidatePresence("tenantId", tenantId);
  ValidatePresence("address", address);
  ValidatePresence("marketplaceId", marketplaceId);
  ValidatePresence("items", items);

  ValidateObject(marketplaceId);
  ValidateAddress(address);

  let requestBody = {
    tickets: null,
    products: items.map(item => ({
      sku: item.sku,
      quant: item.quantity || 1,
      extra: item.tokenId ?
        { ...(item.extraData || {}), token_id: item.tokenId } :
        { ...(item.extraData || {}) }
    })),
    ident: address,
    cust_name: address,
    extra: {
      ...extraData,
      elv_addr: address
    }
  };

  const transactionId = this.utils.B58(UUID.parse(UUID.v4()));
  requestBody.ts = Date.now();
  requestBody.trans_id = transactionId;

  const mintSignature = await this.Sign(
    JSON.stringify(requestBody)
  );

  await this.authClient.MakeAuthServiceRequest({
    method: "POST",
    path: UrlJoin("/as/tnt/trans/base", tenantId, marketplaceId),
    body: requestBody,
    headers: {
      "Authorization": `Bearer ${mintSignature}`
    }
  });

  return {
    address,
    transactionId
  };
};

/**
 * Retrieve information about transactions for the specified collection
 *
 * @methodGroup Transactions
 * @namedParams
 * @param {string} tenantId - The ID of the tenant
 * @param {string} collectionId - The ID of the NFT collection containing the NFT
 * @param {Object=} filterOptions={} - Options for filtering transactions
 * @param {string=} filterOptions.email - Filter transactions by email.
 * @param {string=} filterOptions.transactionId - Filter transactions by transaction ID.
 * @param {string=} filterOptions.max - The maximum number of transactions to return. Default is 500.
 * @param {string=} filterOptions.status -- Filter transactions by status. Allowed statuses are 'complete', 'failed' and (empty), meaning unprocessed.
 * @param {string=} filterOptions.fromOrdinal - The internal transaction ordinal to start from. Note that negative values are supported and are interpreted as meaning 'from the last current transaction'. Default is 0 - i.e. the beginning.
 *
 * @return Promise<Array<Object>> - A list of transactions matching the specified filters.
 */
exports.CollectionTransactions = async function({tenantId, collectionId, filterOptions={}}) {
  const ts = Date.now();

  let queryParams = {
    ts
  };

  const allowedOptions = {
    "email": "email",
    "fromOrdinal": "from_ord",
    "max": "max",
    "status": "status",
    "transactionId": "trans_id"
  };

  Object.keys(allowedOptions).forEach(option => { if(filterOptions[option]){ queryParams[allowedOptions[option]] = filterOptions[option]; } });

  let path = this.AuthHttpClient.BaseURI()
    .path(UrlJoin("/tnt", "trans", tenantId, collectionId))
    .query(queryParams)
    .hash("")
    .resource();

  const signature = await this.Sign(path);

  return await this.utils.ResponseToJson(
    this.authClient.MakeAuthServiceRequest({
      method: "GET",
      path: UrlJoin("as", "tnt", "trans", tenantId, collectionId),
      queryParams,
      headers: {
        "Authorization": `Bearer ${signature}`
      }
    })
  );
};
