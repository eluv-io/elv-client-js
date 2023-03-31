let WalletConfiguration = {
  demo: {
    configUrl: "https://demov3.net955210.contentfabric.io/config",
    stateStoreUrls: ["https://appsvc.svc.eluv.io/dv3"],
    badgerAddress: "0x39e9d567137217e8f7dae73bf168db28d242bb31",
    staging: {
      siteLibraryId: "ilib36Wi5fJDLXix8ckL7ZfaAJwJXWGD",
      siteId: "iq__2gkNh8CCZqFFnoRpEUmz7P3PaBQG",
      purchaseMode: "develop",
      appUrl: "https://wallet.demov3.contentfabric.io"
    }
  },
  main: {
    configUrl: "https://main.net955305.contentfabric.io/config",
    stateStoreUrls: ["https://appsvc.svc.eluv.io/main"],
    badgerAddress: "0xa042a585bbbac4419ba39c397f35ab749fc470f0",
    staging: {
      siteLibraryId: "ilib2GdaYEFxB7HyLPhSDPKMyPLhV8x9",
      siteId: "iq__inauxD1KLyKWPHargCWjdCh2ayr",
      purchaseMode: "production",
      appUrl: "https://wallet.preview.contentfabric.io",
    },
    production: {
      siteLibraryId: "ilib2GdaYEFxB7HyLPhSDPKMyPLhV8x9",
      siteId: "iq__suqRJUt2vmXsyiWS5ZaSGwtFU9R",
      purchaseMode: "production",
      appUrl: "https://wallet.contentfabric.io"
    }
  },
  __MARKETPLACE_ORDER: [
    "PREVIEW",
    "masked-singer-brazil-marketplace",
    "eluvio-live-marketplace-globo-taf",
    "de228e92-ed45-4fe0-8e52-658cf366e962",
    "wwe-marketplace-main",
    "maskverse-marketplace",
    "dolly-marketplace",
    "eluvio-live-marketplace-sonark",
    "cirkay-marketplace",
    "eluvio-live-marketplace-fuudge",
    "oc-marketplace",
    "emp-marketplace",
    "microsoft",
    "indieflix-marketplace",
    "angels-airwaves-marketplace",
    "realcannonballrun-marketplace"
  ]
};

// No production environment on demo
WalletConfiguration.demo.production = WalletConfiguration.demo.staging;

// Allow demo to be referred to as demov3
WalletConfiguration.demov3 = WalletConfiguration.demo;

module.exports = WalletConfiguration;
