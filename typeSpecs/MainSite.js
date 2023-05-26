const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const mainSiteSelectorSpec = {
  "profile": {
    name: "Eluvio LIVE Main Site",
    version: "0.1",
  },
  manageApp: "default",
  show_searchables_tab: true,
  controls: [
    "images",
  ],
  asset_types: [
    "primary",
  ],
  title_types: [
    "site-selector"
  ],
  "associated_assets": [
    {
      "name": "promo_videos",
      "indexed": true,
      "orderable": true,
      "slugged": false,
    },
    {
      "name": "featured_events",
      "indexed": true,
      "slugged": true,
      "orderable": true
    },
    {
      "name": "carousel_events",
      "indexed": true,
      "slugged": true
    },
    {
      "name": "tenants",
      "indexed": false,
      "slugged": true,
    },
  ],
  "info_fields": [
    {
      "name": "mode",
      "type": "select",
      "options": ["test", "production"],
      "default_value": "test"
    },
    {
      "name": "domain_map",
      "label": "Domain Name Mapping",
      "type": "list",
      "fields": [
        {
          "name": "domain",
          "type": "text"
        },
        {
          "name": "tenant_slug",
          "type": "text"
        },
        {
          "name": "event_slug",
          "type": "text"
        },
      ]
    },
    {
      "name": "site_images",
      "type": "subsection",
      "fields": [
        {
          "extensions": imageTypes,
          "label": "Eluvio Live Logo (Light)",
          "name": "eluvio_live_logo_light",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "label": "Eluvio Live Logo (Dark)",
          "name": "eluvio_live_logo_dark",
          "type": "file"
        }
      ]
    },
    {
      "fields": [
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "beautiful_quality",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "directly_to_fans",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "retain_control",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "push_boundaries",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "main_image",
              "type": "file"
            },
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "remonetize_endlessly",
          "type": "subsection"
        },
        {
          "fields": [
            {
              "type": "list",
              "name": "card_images",
              "fields": [
                {
                  "extensions": imageTypes,
                  "name": "card_image",
                  "type": "file"
                },
                {
                  "name": "title"
                }
              ]
            }
          ],
          "name": "nft_collections",
          "label": "NFT Collections",
          "type": "subsection"
        },
      ],
      "name": "images",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "text",
          "type": "textarea"
        },
        {
          "name": "image",
          "type": "file",
          "extensions": imageTypes
        }
      ],
      "name": "production_partners",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "text",
          "type": "textarea"
        },
        {
          "name": "image",
          "type": "file",
          "extensions": imageTypes
        }
      ],
      "name": "merchandise_partners",
      "type": "list"
    }
  ]
};

module.exports = mainSiteSelectorSpec;
