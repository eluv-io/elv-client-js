const {ElvClient} = require("../ElvClient");
const Configuration = require("./Configuration");
const {LinkTargetHash} = require("./Utils");
const UrlJoin = require("url-join");

/**
 * @namespace
 * @description This is a utility namespace mostly containing functions for managing
 * multiformat type conversions.
 *
 * Utils can be imported separately from the client:
 *
 * const Utils = require("@eluvio/elv-client-js/src/Utils)
 *
 * or
 *
 * import Utils from "@eluvio/elv-client-js/src/Utils"
 *
 *
 * It can be accessed from ElvClient and FrameClient as client.utils
 */
class ElvMarketplaceClient {
  constructor({client, network, mode, marketplaceInfo}) {
    this.client = client;
    this.loggedIn = false;

    this.network = network;
    this.mode = mode;
    this.purchaseMode = Configuration[network][mode].purchaseMode;
    this.mainSiteId = Configuration[network][mode].siteId;
    this.publicStaticToken = client.staticToken;

    this.selectedMarketplaceInfo = marketplaceInfo;

    this.availableMarketplaces = {};
    this.availableMarketplacesById = {};
    this.marketplaceHashes = {};

    // Caches
    this.cachedMarketplaces = {};
    this.cachedCSS = {};

    this.utils = client.utils;
  }

  Log(message, error=false) {
    if(error) {
      // eslint-disable-next-line no-console
      console.error("Eluvio Marketplace Client:", message);
    } else {
      // eslint-disable-next-line no-console
      console.log("Eluvio Marketplace Client:", message);
    }
  }

  /**
   * Initialize the marketplace client.
   *
   * Specify tenantSlug and marketplaceSlug to automatically associate this tenant with a particular marketplace.
   *
   * @methodGroup Initialization
   * @namedParams
   * @param {string} network=main - Name of the Fabric network to use (`main`, `demo`)
   * @param {string} mode=production - Environment to use (`production`, `staging`)
   * @param {string=} tenantSlug - Slug of a tenant
   * @param {string=} marketplaceSlug - Slug of a marketplace
   *
   * @returns {Promise<ElvMarketplaceClient>}
   */
  static async Initialize({
    network="main",
    mode="production",
    tenantSlug,
    marketplaceSlug,
    marketplaceId,
    marketplaceHash
  }) {
    if(!Configuration[network]) {
      throw Error(`ElvMarketplaceClient: Invalid network ${network}`);
    } else if(!Configuration[network][mode]) {
      throw Error(`ElvMarketplaceClient: Invalid mode ${mode}`);
    }

    const client = await ElvClient.FromNetworkName({networkName: network, assumeV3: true});

    const marketplaceClient = new ElvMarketplaceClient({
      client,
      network,
      mode,
      marketplaceInfo: {
        tenantSlug,
        marketplaceSlug,
        marketplaceId: marketplaceHash ? client.utils.DecodeVersionHash(marketplaceHash).objectId : marketplaceId,
        marketplaceHash
      }
    });

    await marketplaceClient.LoadAvailableMarketplaces();

    return marketplaceClient;
  }

  // If marketplace slug is specified, load only that marketplace. Otherwise load all
  async LoadAvailableMarketplaces(forceReload=false) {
    if(!forceReload && Object.keys(this.availableMarketplaces) > 0) {
      return;
    }

    const mainSiteHash = await this.client.LatestVersionHash({objectId: this.mainSiteId});
    const metadata = await this.client.ContentObjectMetadata({
      versionHash: mainSiteHash,
      metadataSubtree: "public/asset_metadata/tenants",
      resolveLinks: true,
      linkDepthLimit: 2,
      resolveIncludeSource: true,
      resolveIgnoreErrors: true,
      produceLinkUrls: true,
      authorizationToken: this.publicStaticToken,
      noAuth: true,
      select: [
        "*/.",
        "*/marketplaces/*/.",
        "*/marketplaces/*/info/tenant_id",
        "*/marketplaces/*/info/tenant_name",
        "*/marketplaces/*/info/branding"
      ],
      remove: [
        "*/marketplaces/*/info/branding/custom_css"
      ]
    });

    let availableMarketplaces = { ...(this.availableMarketplaces || {}) };
    let availableMarketplacesById = { ...(this.availableMarketplacesById || {}) };
    Object.keys(metadata || {}).forEach(tenantSlug => {
      try {
        availableMarketplaces[tenantSlug] = {
          versionHash: metadata[tenantSlug]["."].source
        };

        Object.keys(metadata[tenantSlug].marketplaces || {}).forEach(marketplaceSlug => {
          try {
            const versionHash = metadata[tenantSlug].marketplaces[marketplaceSlug]["."].source;
            const objectId = this.utils.DecodeVersionHash(versionHash).objectId;

            availableMarketplaces[tenantSlug][marketplaceSlug] = {
              ...(metadata[tenantSlug].marketplaces[marketplaceSlug].info || {}),
              tenantName: metadata[tenantSlug].marketplaces[marketplaceSlug].info.tenant_name,
              tenantId: metadata[tenantSlug].marketplaces[marketplaceSlug].info.tenant_id,
              tenantSlug,
              marketplaceSlug,
              marketplaceId: objectId,
              marketplaceHash: versionHash,
              order: Configuration.__MARKETPLACE_ORDER.findIndex(slug => slug === marketplaceSlug)
            };

            availableMarketplacesById[objectId] = availableMarketplaces[tenantSlug][marketplaceSlug];

            this.marketplaceHashes[objectId] = versionHash;

            // Fill out selected marketplace info
            if(this.selectedMarketplaceInfo) {
              if((this.selectedMarketplaceInfo.tenantSlug === tenantSlug && this.selectedMarketplaceInfo.marketplaceSlug === marketplaceSlug) || this.selectedMarketplaceInfo.marketplaceId === objectId) {
                this.selectedMarketplaceInfo = availableMarketplaces[tenantSlug][marketplaceSlug];
              }
            }
          } catch(error) {
            this.Log(`Eluvio Marketplace Client: Unable to load info for marketplace ${tenantSlug}/${marketplaceSlug}`, true);
          }
        });
      } catch(error) {
        this.Log(`Eluvio Marketplace Client: Failed to load tenant info ${tenantSlug}`, true);
        this.Log(error, true);
      }
    });

    this.availableMarketplaces = availableMarketplaces;
    this.availableMarketplacesById = availableMarketplacesById;
  }

  // Get the hash of the currently linked marketplace
  async LatestMarketplaceHash({tenantSlug, marketplaceSlug}) {
    const mainSiteHash = await this.client.LatestVersionHash({objectId: this.mainSiteId});
    const marketplaceLink = await this.client.ContentObjectMetadata({
      versionHash: mainSiteHash,
      metadataSubtree: UrlJoin("/public", "asset_metadata", "tenants", tenantSlug, "marketplaces", marketplaceSlug),
      resolveLinks: false
    });

    return LinkTargetHash(marketplaceLink);
  }

  async LoadMarketplace({tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash}) {
    const marketplaceInfo = this.MarketplaceInfo({tenantSlug, marketplaceSlug, marketplaceId, marketplaceHash});

    marketplaceId = marketplaceInfo.marketplaceId;
    marketplaceHash = await this.LatestMarketplaceHash({tenantSlug: marketplaceInfo.tenantSlug, marketplaceSlug: marketplaceInfo.marketplaceSlug});

    if(this.cachedMarketplaces[marketplaceId] && this.cachedMarketplaces[marketplaceId].versionHash !== marketplaceHash) {
      delete this.cachedMarketplaces[marketplaceId];
    }

    if(!this.cachedMarketplaces[marketplaceId]) {
      let marketplace = await this.client.ContentObjectMetadata({
        versionHash: marketplaceHash,
        metadataSubtree: "public/asset_metadata/info",
        linkDepthLimit: 2,
        resolveLinks: true,
        resolveIgnoreErrors: true,
        resolveIncludeSource: true,
        produceLinkUrls: true,
        authorizationToken: this.publicStaticToken
      });

      marketplace.items = await Promise.all(
        marketplace.items.map(async (item, index) => {
          if(this.loggedIn && item.requires_permissions) {
            try {
              await this.client.ContentObjectMetadata({
                versionHash: LinkTargetHash(item.nft_template),
                metadataSubtree: "permissioned"
              });

              item.authorized = true;
            } catch(error) {
              item.authorized = false;
            }
          }

          item.nftTemplateMetadata = ((item.nft_template || {}).nft || {});
          item.itemIndex = index;

          return item;
        })
      );

      marketplace.collections = (marketplace.collections || []).map((collection, collectionIndex) => ({
        ...collection,
        collectionIndex
      }));

      marketplace.retrievedAt = Date.now();
      marketplace.marketplaceId = marketplaceId;
      marketplace.versionHash = marketplaceHash;

      // Generate embed URLs for pack opening animations
      ["purchase_animation", "purchase_animation__mobile", "reveal_animation", "reveal_animation_mobile"].forEach(key => {
        try {
          if(marketplace.storefront[key]) {
            let embedUrl = new URL("https://embed.v3.contentfabric.io");
            const targetHash = LinkTargetHash(marketplace.storefront[key]);
            embedUrl.searchParams.set("p", "");
            embedUrl.searchParams.set("net", this.network === "main" ? "main" : "demo");
            embedUrl.searchParams.set("ath", (this.__authorization || {}).authToken || this.publicStaticToken);
            embedUrl.searchParams.set("vid", targetHash);
            embedUrl.searchParams.set("ap", "");

            if(!key.startsWith("reveal")) {
              embedUrl.searchParams.set("m", "");
              embedUrl.searchParams.set("lp", "");
            }

            marketplace.storefront[`${key}_embed_url`] = embedUrl.toString();
          }
          // eslint-disable-next-line no-empty
        } catch(error) {
        }
      });

      this.cachedMarketplaces[marketplaceId] = marketplace;
    }

    return this.cachedMarketplaces[marketplaceId];
  }

  /**
   * Retrieve information about the user, including the address, wallet type, and (for custodial users) email address.
   *
   * @methodGroup User
   *
   * @returns {Object} - User info
   */
  User() {
    if(!this.loggedIn) { return; }

    return {
      address: this.UserAddress() ,
      email: this.__authorization.email,
      walletType: this.__authorization.walletType,
      walletName: this.__authorization.walletName
    };
  }

  /**
   * Retrieve the address of the current user.
   *
   * @methodGroup User
   *
   * @returns {string} - The address of the current user
   */
  UserAddress() {
    if(!this.loggedIn) { return; }

    return this.client.utils.FormatAddress(this.__authorization.address);
  }

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
  async UserWalletBalance(checkOnboard=false) {
    if(!this.loggedIn) { return; }

    // eslint-disable-next-line no-unused-vars
    const { balance, usage_hold, payout_hold, stripe_id, stripe_payouts_enabled } = await this.client.utils.ResponseToJson(
      await this.client.authClient.MakeAuthServiceRequest({
        path: UrlJoin("as", "wlt", "mkt", "bal"),
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.__authorization.fabricToken}`
        }
      })
    );

    const userStripeId = stripe_id;
    const userStripeEnabled = stripe_payouts_enabled;
    const totalWalletBalance = parseFloat(balance || 0);
    const availableWalletBalance = Math.max(0, this.totalWalletBalance - parseFloat(usage_hold || 0));
    const pendingWalletBalance = Math.max(0, this.totalWalletBalance - this.availableWalletBalance);
    const withdrawableWalletBalance = Math.max(0, this.totalWalletBalance - parseFloat(payout_hold || 0));

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
          Authorization: `Bearer ${this.__authorization.fabricToken}`
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
  }


  /**
   * Authenticate with an ElvMarketplaceClient authorization token
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} token - A previously generated ElvMarketplaceClient authorization token;
   */
  async Authenticate({token}) {
    let decodedToken;
    try {
      decodedToken = JSON.parse(this.utils.FromB58ToStr(token)) || {};
    } catch(error) {
      throw new Error("Invalid authorization token " + token);
    }

    if(!decodedToken.expiresAt || Date.now() > decodedToken.expiresAt) {
      throw Error("ElvMarketplaceClient: Provided authorization token has expired");
    }

    this.client.SetStaticToken({token: decodedToken.fabricToken});

    return this.SetAuthorization(decodedToken);
  }

  /**
   * Authenticate with an OAuth ID token
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} idToken - An OAuth ID token
   * @param {string=} tenantId - ID of tenant with which to associate the user. If marketplace info was set upon initialization, this will be determined automatically.
   * @param {string=} email - Email address of the user. If not specified, this method will attempt to extract the email from the ID token.
   * @param {boolean=} shareEmail=false - Whether or not the user consents to sharing their email
   * @param {number=} tokenDuration=24 - Number of hours the generated authorization token will last before expiring
   *
   * @returns {Promise<string>} - Returns an authorization token that can be used to initialize the client using <a href="#Authenticate">Authenticate</a>.
   * Save this token to avoid having to reauthenticate with OAuth. This token expires after 24 hours.
   */
  async AuthenticateOAuth({idToken, tenantId, email, shareEmail=false, tokenDuration=24}) {
    if(!tenantId && this.selectedMarketplaceInfo) {
      // Load tenant ID automatically from selected marketplace
      await this.AvailableMarketplaces();
      tenantId = this.selectedMarketplaceInfo.tenantId;
    }

    await this.client.SetRemoteSigner({idToken, tenantId, extraData: { share_email: shareEmail }, unsignedPublicAuth: true});

    const expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
    const fabricToken = await this.client.CreateFabricToken({duration: tokenDuration * 60 * 60 * 1000});
    const address = this.client.utils.FormatAddress(this.client.CurrentAccountAddress());

    if(!email) {
      try {
        const decodedToken = JSON.parse(this.utils.FromB64URL(idToken.split(".")[1]));
        email = decodedToken.email;
      } catch(error) {
        throw Error("Failed to decode ID token");
      }
    }

    this.client.SetStaticToken({token: fabricToken});

    return this.SetAuthorization({fabricToken, tenantId, address, email, expiresAt, walletType: "Custodial", walletName: "Eluvio"});
  }

  /**
   * Authenticate with an external Ethereum compatible wallet, like Metamask.
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} address - The address of the wallet
   * @param {number=} tokenDuration=24 - Number of hours the generated authorization token will last before expiring
   * @param {string=} walletName=Metamask - Name of the external wallet
   * @param {function=} Sign - The method used for signing by the wallet. If not specified, will attempt to sign with Metamask.
   *
   * @returns {Promise<string>} - Returns an authorization token that can be used to initialize the client using <a href="#Authenticate">Authenticate</a>.
   * Save this token to avoid having to reauthenticate. This token expires after 24 hours.
   */
  async AuthenticateExternalWallet({address, tokenDuration=24, walletName="Metamask", Sign}) {
    if(!address) {
      address = window.ethereum.selectedAddress;
    }

    address = this.utils.FormatAddress(address);

    if(!Sign) {
      Sign = async message => this.SignMetamask({message, address});
    }

    const expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
    const fabricToken = await this.client.CreateFabricToken({
      address,
      duration: tokenDuration * 60 * 60 * 1000,
      Sign,
      addEthereumPrefix: false
    });

    return this.SetAuthorization({fabricToken, address, expiresAt, walletType: "External", walletName});
  }

  async LogOut() {
    this.__authorization = {};
    this.loggedIn = false;

    this.cachedMarketplaces = {};
  }

  SetAuthorization({fabricToken, tenantId, address, email, expiresAt, walletType, walletName}) {
    address = this.client.utils.FormatAddress(address);

    this.__authorization = {
      fabricToken,
      tenantId,
      address,
      email,
      expiresAt,
      walletType,
      walletName
    };

    this.loggedIn = true;

    this.cachedMarketplaces = {};

    return this.utils.B58(JSON.stringify(this.__authorization));
  }

  async SignMetamask({message, address}) {
    if(!window.ethereum) {
      throw Error("ElvMarketplaceClient: Unable to initialize - Metamask not available");
    }

    await window.ethereum.request({method: "eth_requestAccounts"});
    const from = address || window.ethereum.selectedAddress;
    return await window.ethereum.request({
      method: "personal_sign",
      params: [message, from, ""],
    });
  }
}

Object.assign(ElvMarketplaceClient.prototype, require("./ClientMethods"));

exports.ElvMarketplaceClient = ElvMarketplaceClient;
