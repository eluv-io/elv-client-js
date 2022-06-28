const Utils = require("../Utils");
const UrlJoin = require("url-join");
const {FormatNFTDetails, FormatNFTMetadata} = require("./Utils");

/* TENANT */

/**
 * Retrieve configuration information about the specified tenant, or the tenant associated with the specified contract.
 *
 * This information includes the royalty rate the tenant receives for secondary sales.
 *
 * @methodGroup Tenants
 * @namedParams
 * @param {string=} tenantId - The ID of the tenant for which to retrieve configuration
 * @param {string=} contractAddress - The ID of an nft contract for which to retrieve configuration
 *
 * @returns {Promise<{Object}>} - The tenant configuration
 */
exports.TenantConfiguration = async function({tenantId, contractAddress}) {
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


/* MARKETPLACE */

/**
 * Retrieve available stock for the specified marketplace, organized by SKU.
 *
 * If a user is logged in, stock information will also include how many of that item the user has purchased.
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {string=} tenantSlug - Tenant slug of the marketplace
 * @param {string=} marketplaceSlug - Slug of the marketplace
 * @param {string=} marketplaceId - Object ID of the marketplace
 * @param {string=} marketplaceHash - Version hash of the marketplace
 *
 * @returns {Promise<Object>} - Stock info for items in the marketplace
 */
exports.MarketplaceStock = async function ({tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash, tenantId}) {
  if(!tenantId) {
    const marketplaceInfo = this.MarketplaceInfo({tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash});
    tenantId = marketplaceInfo.tenantId;
  }

  if(this.loggedIn) {
    return await Utils.ResponseToJson(
      this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "wlt", "nft", "info", tenantId),
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.__authorization.fabricToken}`
        }
      })
    );
  }

  return await Utils.ResponseToJson(
    this.client.authClient.MakeAuthServiceRequest({
      path: UrlJoin("as", "nft", "stock", tenantId),
      method: "GET"
    })
  );
};

/**
 * Retrieve basic information about a specific available marketplace with the specified tenant/marketplace slug, ID, or hash.
 *
 * Includes the slugs, ID and hash of the marketplace, as well as branding information.
 *
 * To retrieve full metadata for the marketplace, use the <a href="#Marketplace">Marketplace</a> method.
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {string=} tenantSlug - Tenant slug of the marketplace
 * @param {string=} marketplaceSlug - Slug of the marketplace
 * @param {string=} marketplaceId - Object ID of the marketplace
 * @param {string=} marketplaceHash - Version hash of the marketplace
 *
 * @returns {Promise<Object>} - Info about the marketplace
 */
exports.MarketplaceInfo = function ({tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash}) {
  let marketplaceInfo;
  if(tenantSlug && marketplaceSlug) {
    marketplaceInfo = (this.availableMarketplaces[tenantSlug] || {})[marketplaceSlug];
  } else {
    marketplaceInfo = this.availableMarketplacesById[marketplaceId || this.client.utils.DecodeVersionHash(marketplaceHash).objectId];
  }

  if(!marketplaceInfo) {
    throw Error(`Eluvio Marketplace Client: Unable to find marketplace with parameters ${JSON.stringify(arguments)}`);
  }

  return marketplaceInfo;
};

/**
 * Retrieve custom CSS for the specified marketplace
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {string=} tenantSlug - Tenant slug of the marketplace
 * @param {string=} marketplaceSlug - Slug of the marketplace
 * @param {string=} marketplaceId - Object ID of the marketplace
 * @param {string=} marketplaceHash - Version hash of the marketplace
 *
 * @returns {Promise<string>} - The CSS of the marketplace
 */
exports.MarketplaceCSS = async function ({tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash}) {
  const marketplaceInfo = this.MarketplaceInfo({tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash});

  marketplaceHash = marketplaceInfo.marketplaceHash;

  if(!this.cachedCSS[marketplaceHash]) {
    this.cachedCSS[marketplaceHash] = await this.client.ContentObjectMetadata({
      versionHash: marketplaceHash,
      metadataSubtree: "public/asset_metadata/info/branding/custom_css",
      authorizationToken: this.publicStaticToken,
      noAuth: true
    });
  }

  return this.cachedCSS[marketplaceHash] || "";
};

/**
 * Retrieve info about all available marketplaces
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {boolean=} organizeById - By default, the returned marketplace info is organized by tenant and marketplace slug. If this option is enabled, the marketplaces will be organized by marketplace ID instead.
 * @param {boolean=} forceReload=false - If specified, a new request will be made to check the currently available marketplaces instead of returning cached info
 *
 * @returns {Promise<{Object}>} - Info about available marketplaces
 */
exports.AvailableMarketplaces = async function ({organizeById, forceReload=false}={}) {
  if(forceReload) {
    await this.LoadAvailableMarketplaces(true);
  }

  return {
    ...(organizeById ? this.availableMarketplacesById : this.availableMarketplaces)
  };
};

/**
 * Retrieve full information about the specified marketplace
 *
 * <b><i>Note</i></b> - Upon changing login state, the marketplace should be retrieved again as permission info in marketplace items may be different depending on the current user's permissions.
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {string=} tenantSlug - Tenant slug of the marketplace
 * @param {string=} marketplaceSlug - Slug of the marketplace
 * @param {string=} marketplaceId - Object ID of the marketplace
 * @param {string=} marketplaceHash - Version hash of the marketplace
 * @param {boolean=} forceReload=false - If specified, a new request will be made to check the currently available marketplaces instead of returning cached info
 *
 * @returns {Promise<Object>} - The full information for the marketplace
 */
exports.Marketplace = async function ({tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash}) {
  return this.LoadMarketplace({tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash});
};


/* NFTS */

/**
 * Returns basic contract info about the items the current user owns, organized by contract address + token ID
 *
 * This method is significantly faster than <a href="#OwnedItems">OwnedItems</a>, but does not include any NFT metadata.
 *
 * @methodGroup Owned Items
 *
 * @returns {Promise<Object>} - Basic info about all owned items.
 */
exports.OwnedItemInfo = async function () {
  if(!this.loggedIn) { return {}; }

  const accountId = `iusr${Utils.AddressToHash(this.UserAddress())}`;
  this.profileData = await this.client.ethClient.MakeProviderCall({
    methodName: "send",
    args: [
      "elv_getAccountProfile",
      [this.client.contentSpaceId, accountId]
    ]
  });

  if(!this.profileData || !this.profileData.NFTs) { return {}; }

  let nftInfo = {};
  Object.keys(this.profileData.NFTs).map(tenantId =>
    this.profileData.NFTs[tenantId].forEach(details => {
      const versionHash = (details.TokenUri || "").split("/").find(s => (s || "").startsWith("hq__"));

      if(!versionHash) {
        return;
      }

      if(details.TokenHold) {
        details.TokenHoldDate = new Date(parseInt(details.TokenHold) * 1000);
      }

      const contractAddress = Utils.FormatAddress(details.ContractAddr);
      const key = `${contractAddress}-${details.TokenIdStr}`;
      nftInfo[key] = {
        ...details,
        ContractAddr: Utils.FormatAddress(details.ContractAddr),
        ContractId: `ictr${Utils.AddressToHash(details.ContractAddr)}`,
        VersionHash: versionHash
      };
    })
  );

  this.nftInfo = nftInfo;

  return this.nftInfo;
};

/**
 * Load full info for the specified NFT
 *
 * @methodGroup Items
 * @namedParams
 * @param {string} contractAddress - The contract address of the NFT
 * @param {string} tokenId - The token ID of the NFT
 */
exports.NFT = async function({tokenId, contractAddress}) {
  let nft = FormatNFTDetails(
    await Utils.ResponseToJson(
      this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "nft", "info", contractAddress, tokenId),
        method: "GET"
      })
    )
  );

  nft.metadata = {
    ...(
      (await this.client.ContentObjectMetadata({
        versionHash: nft.details.VersionHash,
        metadataSubtree: "public/asset_metadata/nft",
        produceLinkUrls: true
      })) || {}
    ),
    ...(nft.metadata || {})
  };

  nft.config = await this.TenantConfiguration({contractAddress});

  return FormatNFTMetadata(nft);
};


