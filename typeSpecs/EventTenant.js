const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const eventTenantSpec = {
  "profile": {
    name: "Eluvio LIVE Tenant",
    version: "0.3",
  },
  "hide_image_tab": true,
  manageApp: "default",
  controls: [
    "images",
  ],
  asset_types: [
    "primary",
  ],
  title_types: [
    "site-selector"
  ],
  info_fields: [
    {
      "name": "name",
      "type": "text"
    },
    {
      "extensions": imageTypes,
      "name": "logo",
      "type": "file"
    },
    {
      "name": "copyright",
      "type": "text"
    },
    {
      "name": "privacy_policy",
      "type": "rich_text"
    },
    {
      "label": "Privacy Policy (HTML)",
      "name": "privacy_policy_html",
      "type": "file",
      "extensions": ["html"]
    },
    {
      "label": "Terms and Conditions",
      "name": "terms",
      "type": "rich_text"
    },
    {
      "label": "Terms and Conditions (HTML)",
      "name": "terms_html",
      "type": "file",
      "extensions": ["html"]
    }
  ],
  localizations: [],
  associated_assets: [
    {
      name: "sites",
      label: "Events",
      indexed: false,
      slugged: true,
      defaultable: false,
      orderable: false,
      title_types: ["site"]
    },
    {
      name: "marketplaces",
      index: false,
      slugged: true,
      defaultable: false,
      orderable: false,
      title_types: ["marketplace"]
    },
    {
      name: "collections",
      label: "Collections",
      indexed: false,
      slugged: true,
      defaultable: false,
      orderable: false,
      title_types: ["collection"]
    }
  ]
};

module.exports = eventTenantSpec;
