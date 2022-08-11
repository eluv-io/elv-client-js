const Utils = require("../Utils");
const UrlJoin = require("url-join");
const {FormatNFTDetails, FormatNFTMetadata, FormatNFT} = require("./Utils");

/**
 * Methods
 *
 * @module ClientMethods
 */

/* USER INFO */


/**
 * <b><i>Requires login</i></b>
 *
 * Retrieve information about the user, including the address, wallet type, and (for custodial users) email address.
 *
 * @methodGroup User
 *
 * @returns {Object} - User info
 */
exports.UserInfo = function() {
  if(!this.loggedIn) { return; }

  return {
    name: this.__authorization.email || this.UserAddress(),
    address: this.UserAddress() ,
    email: this.__authorization.email,
    walletType: this.__authorization.walletType,
    walletName: this.__authorization.walletName
  };
};

/**
 * <b><i>Requires login</i></b>
 *
 * Retrieve the address of the current user.
 *
 * @methodGroup User
 *
 * @returns {string} - The address of the current user
 */
exports.UserAddress = function() {
  if(!this.loggedIn) { return; }

  return this.client.utils.DecodeSignedToken(this.AuthToken()).payload.adr;
};

/**
 * <b><i>Requires login</i></b>
 *
 * Retrieve the fund balances for the current user
 *
 * @methodGroup User
 * @returns {Promise<{Object}>} - Returns balances for the user. All values are in USD.
 *  <ul>
 *  <li>- totalWalletBalance - Total balance of the users sales and wallet balance purchases</li>
 *  <li>- availableWalletBalance - Balance available for purchasing items</li>
 *  <li>- pendingWalletBalance - Balance unavailable for purchasing items</li>
 *  <li>- withdrawableWalletBalance - Amount that is available for withdrawal</li>
 *  <li>- usedBalance - <i>(Only included if user has set up Solana link with the Phantom wallet)</i> Available USDC balance of the user's Solana wallet</li>
 *  </ul>
 */
exports.UserWalletBalance = async function(checkOnboard=false) {
  if(!this.loggedIn) { return; }

  // eslint-disable-next-line no-unused-vars
  const { balance, usage_hold, payout_hold, stripe_id, stripe_payouts_enabled } = await this.client.utils.ResponseToJson(
    await this.client.authClient.MakeAuthServiceRequest({
      path: UrlJoin("as", "wlt", "mkt", "bal"),
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.AuthToken()}`
      }
    })
  );

  const userStripeId = stripe_id;
  const userStripeEnabled = stripe_payouts_enabled;
  const totalWalletBalance = parseFloat(balance || 0);
  const availableWalletBalance = Math.max(0, totalWalletBalance - parseFloat(usage_hold || 0));
  const pendingWalletBalance = Math.max(0, totalWalletBalance - availableWalletBalance);
  const withdrawableWalletBalance = Math.max(0, totalWalletBalance - parseFloat(payout_hold || 0));

  if(checkOnboard && stripe_id && !stripe_payouts_enabled) {
    // Refresh stripe enabled flag
    const rootUrl = new URL(UrlJoin(window.location.origin, window.location.pathname)).toString();
    await this.client.authClient.MakeAuthServiceRequest({
      path: UrlJoin("as", "wlt", "onb", "stripe"),
      method: "POST",
      body: {
        country: "US",
        mode: this.mode,
        refresh_url: rootUrl.toString(),
        return_url: rootUrl.toString()
      },
      headers: {
        Authorization: `Bearer ${this.AuthToken()}`
      }
    });

    return await this.UserWalletBalance(false);
  }

  let balances = {
    totalWalletBalance,
    availableWalletBalance,
    pendingWalletBalance,
    withdrawableWalletBalance,
  };

  if(userStripeEnabled) {
    balances.userStripeId = userStripeId;
    balances.userStripeEnabled = userStripeEnabled;
  }

  // TODO: integrate
  /*
  if(cryptoStore.usdcConnected) {
    balances.usdcBalance = cryptoStore.phantomUSDCBalance;
  }

   */

  return balances;
};


/**
 * Returns basic contract info about the items the specified/current user owns, organized by contract address + token ID
 *
 * This method is significantly faster than <a href="#.UserItems">UserItems</a>, but does not include any NFT metadata.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of the user to query for. If unspecified, will use the currently logged in user.
 *
 * @returns {Promise<Object>} - Basic info about all owned items.
 */
exports.UserItemInfo = async function ({userAddress}={}) {
  const accountId = `iusr${Utils.AddressToHash(userAddress || this.UserAddress())}`;
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
 * <b><i>Requires login</i></b>
 *
 * Retrieve items owned by the specified or current user matching the specified parameters.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user. If not specified, will return results for current user
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `default`, `meta/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */
exports.UserItems = async function() {
  return this.FilteredQuery({mode: "owned", ...(arguments[0] || {})});
};

/**
 * Return all listings for the current user. Not paginated.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user. If not specified, will return results for current user
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `info/token_id`, `info/ordinal`, `price`, `nft/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 *
 * @returns {Promise<Array<Object>>} - List of current user's listings
 */
exports.UserListings = async function({userAddress, sortBy="created", sortDesc=false, contractAddress, tokenId, marketplaceParams}={}) {
  return (
    await this.FilteredQuery({
      mode: "listings",
      start: 0,
      limit: 10000,
      sortBy,
      sortDesc,
      sellerAddress: userAddress || this.UserAddress(),
      marketplaceParams,
      contractAddress,
      tokenId
    })
  ).results;
};

/**
 * Return all sales for the current user. Not paginated.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user. If not specified, will return results for current user
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Array<Object>>} - List of current user's sales
 */
exports.UserSales = async function({userAddress, sortBy="created", sortDesc=false, contractAddress, tokenId, marketplaceParams}={}) {
  return (
    await this.FilteredQuery({
      mode: "sales",
      start: 0,
      limit: 10000,
      sortBy,
      sortDesc,
      sellerAddress: userAddress || this.UserAddress(),
      marketplaceParams,
      contractAddress,
      tokenId
    })
  ).results;
};

/**
 * Return all transfers and sales for the current user. Not paginated.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user. If not specified, will return results for current user
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Array<Object>>} - List of current user's sales
 */
exports.UserTransfers = async function({userAddress, sortBy="created", sortDesc=false, contractAddress, tokenId, marketplaceParams}={}) {
  return (
    await this.FilteredQuery({
      mode: "transfers",
      start: 0,
      limit: 10000,
      sortBy,
      sortDesc,
      sellerAddress: userAddress || this.UserAddress(),
      marketplaceParams,
      contractAddress,
      tokenId
    })
  ).results;
};

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
    return await Utils.ResponseToJson(
      this.client.authClient.MakeAuthServiceRequest({
        path: contractAddress ?
          UrlJoin("as", "config", "nft", contractAddress) :
          UrlJoin("as", "config", "tnt", tenantId),
        method: "GET",
      })
    );
  } catch(error) {
    this.Log("Failed to load tenant configuration", true, error);

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
 * @param {Object} marketplaceParams - Parameters of the marketplace
 *
 * @returns {Promise<Object>} - Stock info for items in the marketplace
 */
exports.MarketplaceStock = async function ({marketplaceParams, tenantId}) {
  if(!tenantId) {
    const marketplaceInfo = this.MarketplaceInfo({marketplaceParams});
    tenantId = marketplaceInfo.tenantId;
  }

  if(this.loggedIn) {
    return await Utils.ResponseToJson(
      this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "wlt", "nft", "info", tenantId),
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.AuthToken()}`
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
 * To retrieve full metadata for the marketplace, use the <a href="#.Marketplace">Marketplace</a> method.
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 *
 * @returns {Promise<Object>} - Info about the marketplace
 */
exports.MarketplaceInfo = function ({marketplaceParams}) {
  let { tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash } = (marketplaceParams || {});

  let marketplaceInfo;
  if(tenantSlug && marketplaceSlug) {
    marketplaceInfo = (this.availableMarketplaces[tenantSlug] || {})[marketplaceSlug];
  } else {
    marketplaceId = marketplaceHash ? this.client.utils.DecodeVersionHash(marketplaceHash).objectId : marketplaceId;
    marketplaceInfo = this.availableMarketplacesById[marketplaceId];
  }

  if(!marketplaceInfo) {
    throw Error(`Eluvio Wallet Client: Unable to find marketplace with parameters ${JSON.stringify(arguments)}`);
  }

  return marketplaceInfo;
};

/**
 * Retrieve custom CSS for the specified marketplace
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 *
 * @returns {Promise<string>} - The CSS of the marketplace
 */
exports.MarketplaceCSS = async function ({marketplaceParams}) {
  const marketplaceInfo = this.MarketplaceInfo({marketplaceParams});

  const marketplaceHash = marketplaceInfo.marketplaceHash;

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
 * @param {Object} marketplaceParams - Parameters of the marketplace
 *
 * @returns {Promise<Object>} - The full information for the marketplace
 */
exports.Marketplace = async function ({marketplaceParams}) {
  return this.LoadMarketplace(marketplaceParams);
};


/* NFTS */

/**
 * Return info about the specified NFT contract, including the cap, current total supply, and total minted and burned.
 *
 * @methodGroup NFTs
 * @namedParams
 * @param {string} contractAddress - The contract address of the NFT
 *
 * @returns {Promise<Object>} - Information about the specified contract
 */
exports.NFTContractStats = async function({contractAddress}) {
  return await Utils.ResponseToJson(
    this.client.authClient.MakeAuthServiceRequest({
      path: UrlJoin("as", "nft", "info", contractAddress),
      method: "GET"
    })
  );
};

/**
 * Load full info for the specified NFT
 *
 * @methodGroup NFTs
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

  return FormatNFTMetadata(this, nft);
};

/**
 * <b><i>Requires login</i></b>
 *
 * Transfer the specified NFT owned by the current user to the specified address
 *
 * @methodGroup NFTs
 * @namedParams
 * @param {string} contractAddress - The contract address of the NFT
 * @param {string} tokenId - The token ID of the NFT
 * @param {string} targetAddress - The address to which to transfer the NFT
 */
exports.TransferNFT = async function({contractAddress, tokenId, targetAddress}) {
  if(!targetAddress || !Utils.ValidAddress(targetAddress)) {
    throw Error("Eluvio Wallet Client: Invalid or missing target address in UserTransferNFT");
  }

  return await this.client.authClient.MakeAuthServiceRequest({
    path: UrlJoin("as", "wlt", "mkt", "xfer"),
    method: "POST",
    body: {
      contract: Utils.FormatAddress(contractAddress),
      token: tokenId,
      to_addr: Utils.FormatAddress(targetAddress)
    },
    headers: {
      Authorization: `Bearer ${this.AuthToken()}`
    }
  });
};


/** LISTINGS */

/**
 * Retrieve the status of the specified listing
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string=} listingId - The ID of the listing
 *
 * @returns {Promise<Object>} - The status of the listing
 */
exports.ListingStatus = async function({listingId}) {
  try {
    return await Utils.ResponseToJson(
      await this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "mkt", "status", listingId),
        method: "GET"
      })
    );
  } catch(error) {
    if(error.status === 404) { return; }

    throw error;
  }
};

/**
 * Retrieve a specific listing
 *
 * NOTE: When a listing is sold or deleted, it will no longer be queryable with this API. Use <a href="#.ListingStatus">ListingStatus</a> instead.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string=} listingId - The ID of the listing
 *
 * @returns {Promise<Object>} - The listing
 */
exports.Listing = async function({listingId}) {
  return FormatNFT(
    this,
    await Utils.ResponseToJson(
      await this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "mkt", "l", listingId),
        method: "GET",
      })
    )
  );
};


/**
 * Retrieve listings matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `info/token_id`, `info/ordinal`, `price`, `nft/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>=} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {Object=} priceRange - Filter min and/or max price (e.g. `{min: 1}` `{max: 2}` `{min: 1.50, max: 10.50})
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */
exports.Listings = async function() {
  return this.FilteredQuery({mode: "listings", ...(arguments[0] || {})});
};

/**
 * Retrieve stats for listings matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `info/token_id`, `info/ordinal`, `price`, `nft/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {Object=} priceRange - Filter min and/or max price (e.g. `{min: 1}` `{max: 2}` `{min: 1.50, max: 10.50})
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Statistics about listings. All prices in USD.
 */
exports.ListingStats = async function() {
  return this.FilteredQuery({mode: "listing-stats", ...(arguments[0] || {})});
};

/**
 * Retrieve sales matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */
exports.Sales = async function() {
  return this.FilteredQuery({mode: "sales", ...(arguments[0] || {})});
};

/**
 * Retrieve sales and transfers matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */
exports.Transfers = async function() {
  return this.FilteredQuery({mode: "transfers", ...(arguments[0] || {})});
};

/**
 * Retrieve stats for listings matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" -
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Statistics about sales. All prices in USD.
 */
exports.SalesStats = async function() {
  return this.FilteredQuery({mode: "sales-stats", ...(arguments[0] || {})});
};

exports.Leaderboard = async function() {
  return this.FilteredQuery({mode: "leaderboard", ...(arguments[0] || {})});
};



/**
 * <b><i>Requires login</i></b>
 *
 * Create or update a listing for the specified item
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string} contractAddress - The NFT contract address of the item
 * @param {string} tokenId - The token ID of the item
 * @param {number} price - The price of the listing, in USD
 * @param {string=} listingId - (When editing a listing) The ID of the existing listing
 *
 * @returns {Promise<string>} - The listing ID of the created listing
 */
exports.CreateListing = async function({contractAddress, tokenId, price, listingId}) {
  contractAddress = Utils.FormatAddress(contractAddress);

  if(listingId) {
    // Update
    return await Utils.ResponseToFormat(
      "text",
      await this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "wlt", "mkt"),
        method: "PUT",
        body: {
          id: listingId,
          price: parseFloat(price)
        },
        headers: {
          Authorization: `Bearer ${this.AuthToken()}`
        }
      })
    );
  } else {
    // Create
    return await Utils.ResponseToJson(
      await this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "wlt", "mkt"),
        method: "POST",
        body: {
          contract: contractAddress,
          token: tokenId,
          price: parseFloat(price)
        },
        headers: {
          Authorization: `Bearer ${this.AuthToken()}`
        }
      })
    );
  }
};

/**
 * <b><i>Requires login</i></b>
 *
 * Remove the specified listing
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string} listingId - The ID of the listing to remove
 */
exports.RemoveListing = async function({listingId}) {
  await this.client.authClient.MakeAuthServiceRequest({
    path: UrlJoin("as", "wlt", "mkt", listingId),
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${this.AuthToken()}`
    }
  });
};

/**
 * Retrieve all valid names for filtering listings. Full item names are required for filtering listing results by name.
 *
 * Specify marketplace information to filter the results to only items offered in that marketplace.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of a marketplace to filter results by
 *
 * @returns {Promise<Array<String>>} - A list of item names
 */
exports.ListingNames = async function({marketplaceParams}) {
  let tenantId;
  if(marketplaceParams) {
    tenantId = (await this.MarketplaceInfo({marketplaceParams})).tenantId;
  }

  return await Utils.ResponseToJson(
    await this.client.authClient.MakeAuthServiceRequest({
      path: UrlJoin("as", "mkt", "names"),
      method: "GET",
      queryParams: tenantId ? { filter: `tenant:eq:${tenantId}` } : {}
    })
  );
};


/**
 * Retrieve all valid edition names of the specified item. Full item edition names are required for filtering listing results by edition.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string} displayName - Display name of the item from which to request edition names
 *
 * @returns {Promise<Array<String>>} - A list of item editions
 */
exports.ListingEditionNames = async function({displayName}) {
  return await Utils.ResponseToJson(
    await this.client.authClient.MakeAuthServiceRequest({
      path: UrlJoin("as", "mkt", "editions"),
      queryParams: {
        filter: `nft/display_name:eq:${displayName}`
      },
      method: "GET"
    })
  );
};

/**
 * Retrieve names of all valid attributes for listed tiems. Full attribute names and values are required for filtering listing results by attributes.
 *
 * Specify marketplace information to filter the results to only items offered in that marketplace.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {Object=} marketplaceParams - Parameters of a marketplace to filter results by
 * @param {string=} displayName - Display name of the item from which to request attributes
 *
 * @returns {Promise<Array<String>>} - A list of valid attributes
 */
exports.ListingAttributes = async function({marketplaceParams, displayName}={}) {
  let filters = [];

  if(marketplaceParams) {
    filters.push(`tenant:eq:${(await this.MarketplaceInfo({marketplaceParams})).tenantId}`);
  }

  if(displayName) {
    filters.push(`nft/display_name:eq:${displayName}`);
  }

  const attributes = await Utils.ResponseToJson(
    await this.client.authClient.MakeAuthServiceRequest({
      path: UrlJoin("as", "mkt", "attributes"),
      method: "GET",
      queryParams: {
        filter: filters
      }
    })
  );

  return attributes
    .map(({trait_type, values}) => ({ name: trait_type, values }))
    .filter(({name}) =>
      !["Content Fabric Hash", "Total Minted Supply", "Creator"].includes(name)
    );
};

/* PURCHASE / CLAIM */

/**
 * Claim the specified item from the specified marketplace
 *
 * Use the <a href="#.ClaimStatus">ClaimStatus</a> method to check minting status after claiming
 *
 * @methodGroup Purchase
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 * @param {string} sku - The SKU of the item to claime
 */
exports.ClaimItem = async function({marketplaceParams, sku}) {
  const marketplaceInfo = await this.MarketplaceInfo({marketplaceParams});

  await this.client.authClient.MakeAuthServiceRequest({
    method: "POST",
    path: UrlJoin("as", "wlt", "act", marketplaceInfo.tenant_id),
    body: {
      op: "nft-claim",
      sid: marketplaceInfo.marketplaceId,
      sku
    },
    headers: {
      Authorization: `Bearer ${this.AuthToken()}`
    }
  });
};

/* MINTING STATUS */

/**
 * Return status of the specified listing purchase
 *
 * @methodGroup Status
 * @namedParams
 * @param {string} listingId - The ID of the listing
 * @param {string} confirmationId - The confirmation ID of the purchase
 *
 * @returns {Promise<Object>} - The status of the purchase
 */
exports.ListingPurchaseStatus = async function({listingId, confirmationId}) {
  try {
    const listingStatus = await this.ListingStatus({listingId});

    if(!listingStatus) {
      throw Error("Unable to find info for listing " + listingId);
    }

    const statuses = await this.MintingStatus({tenantId: listingStatus.tenant});

    return statuses
      .find(status =>
        status.op === "nft-transfer" &&
        status.extra && status.extra[0] === confirmationId
      ) || { status: "none" };
  } catch(error) {
    this.Log(error, true);
    return { status: "unknown" };
  }
};

/**
 * Return status of the specified marketplace purchase
 *
 * @methodGroup Status
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 * @param {string} confirmationId - The confirmation ID of the purchase
 *
 * @returns {Promise<Object>} - The minting status of the purchaseed item(s)
 */
exports.PurchaseStatus = async function({marketplaceParams, confirmationId}) {
  try {
    const marketplaceInfo = await this.MarketplaceInfo({marketplaceParams});
    const statuses = await this.MintingStatus({tenantId: marketplaceInfo.tenant_id});

    return statuses.find(status => status.op === "nft-buy" && status.confirmationId === confirmationId) || { status: "none" };
  } catch(error) {
    this.Log(error, true);
    return { status: "unknown" };
  }
};

/**
 * Return status of the specified item claim
 *
 * @methodGroup Status
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 * @param {string} sku - The SKU of the item claimed
 *
 * @returns {Promise<Object>} - The minting status of the claim
 */
exports.ClaimStatus = async function({marketplaceParams, sku}) {
  try {
    const marketplaceInfo = await this.MarketplaceInfo({marketplaceParams});
    const statuses = await this.MintingStatus({tenantId: marketplaceInfo.tenantId});

    return statuses.find(status => status.op === "nft-claim" && status.marketplaceId === marketplaceInfo.marketplaceId && status.confirmationId === sku) || { status: "none" };
  } catch(error) {
    this.Log(error, true);
    return { status: "unknown" };
  }
};

/**
 * Return status of the specified pack opening
 *
 * @methodGroup Status
 * @namedParams
 * @param {string} contractAddress - The NFT contract address of the opened pack
 * @param {string} tokenId - The token ID of the opened pack
 *
 * @returns {Promise<Object>} - The status of the pack opening
 */
exports.PackOpenStatus = async function({contractAddress, tokenId}) {
  try {
    const tenantConfig = await this.TenantConfiguration({contractAddress});

    const statuses = await this.MintingStatus({tenantId: tenantConfig.tenant});

    return statuses.find(status => status.op === "nft-open" && Utils.EqualAddress(contractAddress, status.address) && status.tokenId === tokenId) || { status: "none" };
  } catch(error) {
    this.Log(error, true);
    return { status: "unknown" };
  }
};

/**
 * Return status of the specified collection redemption
 *
 * @methodGroup Status
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 * @param {string} confirmationId - The confirmation ID of the redemption
 *
 * @returns {Promise<Object>} - The status of the collection redemption
 */
exports.CollectionRedemptionStatus = async function({marketplaceParams, confirmationId}) {
  try {
    const statuses = await this.MintingStatus({marketplaceParams});

    return statuses.find(status => status.op === "nft-redeem" && status.confirmationId === confirmationId) || { status: "none" };
  } catch(error) {
    this.Log(error, true);
    return { status: "unknown" };
  }
};

/* EVENTS */


exports.LoadDrop = async function({tenantSlug, eventSlug, dropId}) {
  if(!this.drops){
    this.drops = {};
  }

  if(!this.drops[tenantSlug]) {
    this.drops[tenantSlug] = {};
  }

  if(!this.drops[tenantSlug][eventSlug]) {
    this.drops[tenantSlug][eventSlug] = {};
  }

  if(!this.drops[tenantSlug][eventSlug][dropId]) {
    const mainSiteHash = await this.client.LatestVersionHash({objectId: this.mainSiteId});
    const event = (await this.client.ContentObjectMetadata({
      versionHash: mainSiteHash,
      metadataSubtree: UrlJoin("public", "asset_metadata", "tenants", tenantSlug, "sites", eventSlug, "info"),
      resolveLinks: true,
      linkDepthLimit: 2,
      resolveIncludeSource: true,
      produceLinkUrls: true,
      select: [".", "drops"],
      noAuth: true
    })) || [];

    const eventId = Utils.DecodeVersionHash(event["."].source).objectId;

    event.drops.forEach(drop => {
      drop = {
        ...drop,
        eventId
      };

      this.drops[tenantSlug][eventSlug][drop.uuid] = drop;
      this.drops[drop.uuid] = drop;
    });
  }

  return this.drops[dropId];
};

exports.SubmitDropVote = async function({marketplaceParams, eventId, dropId, sku}) {
  const marketplaceInfo = await this.MarketplaceInfo({marketplaceParams});
  await this.client.authClient.MakeAuthServiceRequest({
    path: UrlJoin("as", "wlt", "act", marketplaceInfo.tenant_id),
    method: "POST",
    body: {
      op: "vote-drop",
      evt: eventId,
      id: dropId,
      itm: sku
    },
    headers: {
      Authorization: `Bearer ${this.AuthToken()}`
    }
  });
};

exports.DropStatus = async function({marketplace, eventId, dropId}) {
  try {
    const response = await Utils.ResponseToJson(
      this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "wlt", "act", marketplace.tenant_id, eventId, dropId),
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.AuthToken()}`
        }
      })
    );

    return response.sort((a, b) => a.ts > b.ts ? 1 : -1)[0] || { status: "none" };
  } catch(error) {
    this.Log(error, true);
    return "";
  }
};
