const { ElvClient } = require("../src/ElvClient");
const { ElvWalletClient } = require("../src/walletClient/index");
const ClientConfiguration = require("../TestConfiguration.json");

const WalletConfiguration = require("../src/walletClient/Configuration");

const ethers = require("ethers");
const UrlJoin = require("url-join");

// pull data we're working on creating index backends for.
// see https://github.com/qluvio/elv-apps-projects/issues/197

const Test = async () => {
  try {
    const network = "main";
    const mode = "production";

    const client = await ElvClient.FromNetworkName({
      networkName: network,
    });

    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    client.SetSigner({signer});

    //console.log("client", client);
    //console.log("wallet", wallet);
    //console.log("WalletConfiguration", WalletConfiguration);

    this.mainSiteLibraryId = WalletConfiguration[network][mode].siteLibraryId;
    this.mainSiteId = WalletConfiguration[network][mode].siteId;

	marketplaceData = await client.ContentObjectMetadata({
      libraryId: this.mainSiteLibraryId,
      objectId: this.mainSiteId,
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
        "*/marketplaces/*/info/branding",
        "*/marketplaces/*/info/storefront/background",
        "*/marketplaces/*/info/storefront/background_mobile"
      ],
      remove: [
        "*/marketplaces/*/info/branding/custom_css"
      ]
    });
    console.log("marketplaceData", marketplaceData);

    let ts = firstKey(marketplaceData);
    //  eg: vsn: { '.': { source: 'hq__2pxwW8Fsiow9evzmaF4KAN3rYtTSKAQQPis4LjvyanJK36GbpHuLEQki43vdcT3Z73jEwPAE88' },
    //             marketplaces: { '218f1f86-26c9-442c-9402-c6d8312815a7': [Object] } },
    const marketplaces = (marketplaceData[ts]).marketplaces;
    const ms = firstKey(marketplaces);

    let marketplaceInfo = { tenantSlug: ts, marketplaceSlug: ms };

    let marketplace = await client.ContentObjectMetadata({
        libraryId: this.mainSiteLibraryId,
        objectId: this.mainSiteId,
        metadataSubtree: UrlJoin("/public", "asset_metadata", "tenants", marketplaceInfo.tenantSlug, "marketplaces", marketplaceInfo.marketplaceSlug, "info"),
        localizationSubtree: this.localization ? UrlJoin("public", "asset_metadata", "localizations", this.localization, "info") : "",
        linkDepthLimit: 1,
        resolveLinks: true,
        resolveIgnoreErrors: true,
        resolveIncludeSource: true,
        produceLinkUrls: true,
        authorizationToken: this.publicStaticToken
    });

    console.log("marketplace", marketplace);


  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

function firstKey(obj) {
    return Object.keys(obj)[0];
}

function firstVal(obj) {
    return obj[Object.keys(obj)[0]];
}

Test();
