let WalletConfiguration = {
  demo: {
    configUrl: "https://demov3.net955210.contentfabric.io/config",
    staging: {
      siteId: "iq__2gkNh8CCZqFFnoRpEUmz7P3PaBQG",
      purchaseMode: "develop",
      appUrl: "https://core.test.contentfabric.io/wallet-demo"
    }
  },
  main: {
    configUrl: "https://main.net955305.contentfabric.io/config",
    staging: {
      siteId: "iq__inauxD1KLyKWPHargCWjdCh2ayr",
      purchaseMode: "production",
      appUrl: "https://core.test.contentfabric.io/wallet"
    },
    production: {
      siteId: "iq__suqRJUt2vmXsyiWS5ZaSGwtFU9R",
      purchaseMode: "production",
      appUrl: "https://wallet.contentfabric.io"
    }
  },
  __MARKETPLACE_ORDER: [
    "dolly-marketplace",
    "oc-marketplace",
    "maskverse-marketplace",
    "emp-marketplace",
    "microsoft",
    "indieflix-marketplace",
    "angels-airwaves-marketplace"
  ]
};

// No production environment on demo
WalletConfiguration.demo.production = WalletConfiguration.demo.staging;

// Allow demo to be referred to as demov3
WalletConfiguration.demov3 = WalletConfiguration.demo;

module.exports = WalletConfiguration;
