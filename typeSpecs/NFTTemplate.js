const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const NFTTemplateSpec = {
  "profile": {
    "name": "NFT Template",
    "version": "0.1",
  },
  "playable": true,
  "display_app": "default",
  "manage_app": "default",
  "hide_image_tab": true,
  "associate_permissions": false,
  "associated_assets": [],
  "controls": [],
  "asset_types": [
    "primary"
  ],
  "title_types": [
    "nft_template"
  ],
  "default_image_keys": [],
  "info_fields": [
    {
      "name": "permission",
      "type": "metadata_link",
      "default_value": "/permissioned",
      "readonly": true
    },
    {
      "name": "mint_private",
      "label": "Minting Info (Private)",
      "type": "subsection",
      "path": "/permissioned",
      "fields": [
        {
          "name": "address",
          "type": "text"
        }
      ]
    },
    {
      "name": "mint",
      "label": "Minting Info",
      "type": "subsection",
      "top_level": true,
      "fields": [
        {
          "name": "merge_meta",
          "label": "Merge Metadata",
          "type": "json"
        },
        {
          "name": "token_template",
          "label": "Token ID Template",
          "type": "text"
        },
        {
          "name": "cauth_id",
          "label": "Mint Key ID",
          "type": "text"
        },
        {
          "name": "fauth_id",
          "label": "Fabric Key ID",
          "type": "text"
        },
      ]
    },
    {
      "name": "nft",
      "label": "NFT Details",
      "type": "subsection",
      "top_level": true,
      "fields": [
        {
          "name": "template_id",
          "label": "Template ID",
          "type": "uuid"
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "display_name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "rich_text",
          "type": "rich_text"
        },
        {
          "name": "address",
          "label": "NFT Contract Address",
          "type": "text"
        },
        {
          "name": "edition_name",
          "type": "text"
        },
        {
          "name": "total_supply",
          "type": "integer"
        },
        {
          "name": "creator",
          "type": "text"
        },
        {
          "name": "copyright",
          "type": "text"
        },
        {
          "name": "created_at",
          "type": "datetime"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file_url",
          "hint": "Square image recommended"
        },
        {
          "name": "playable",
          "type": "checkbox",
          "default_value": true
        },
        {
          "name": "token_uri",
          "label": "Token URI",
          "type": "self_metadata_url",
          "path": "public/asset_metadata/nft"
        },
        {
          "name": "embed_url",
          "label": "Embed URL",
          "type": "self_embed_url",
          "version": true,
          "auto_update": true,
          // Player options
          "loop": true,
          "hide_controls": true,
          "muted": true,
          "autoplay": true
        },
        {
          "name": "external_url",
          "label": "External URL",
          "type": "self_embed_url",
          "version": true,
          "auto_update": true,
          // Player options
          "loop": true,
          "hide_controls": true,
          "muted": true,
          "autoplay": true
        },
        {
          "name": "background_color",
          "type": "color"
        },
        {
          "name": "enable_watermark",
          "type": "checkbox",
        },
        {
          "name": "marketplace_attributes",
          "type": "subsection",
          "fields": [
            {
              "name": "opensea",
              "label": "OpenSea",
              "type": "subsection",
              "fields": [
                {
                  "name": "youtube_url",
                  "type": "self_embed_url",
                  "version": true,
                  "auto_update": true,
                  // Player options
                  "loop": true,
                  "hide_controls": true,
                  "muted": true,
                  "autoplay": true
                }
              ]
            },
            {
              "name": "Eluvio",
              "type": "subsection",
              "fields": [
                {
                  "name": "marketplace_id",
                  "label": "Marketplace ID",
                  "type": "text"
                },
                {
                  "name": "sku",
                  "label": "SKU",
                  "type": "text"
                }
              ]
            }
          ]
        },
        {
          "name": "attributes",
          "label": "Custom Attributes",
          "type": "list",
          "fields": [
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "type",
              "type": "select",
              "default_value": "text",
              "options": [
                "checkbox",
                "color",
                "datetime",
                "fabric_link",
                "file",
                "file_url",
                "integer",
                "json",
                "number",
                "text",
                "textarea",
                "uuid"
              ]
            },
            {
              "name": "value",
              "type": "reference_type",
              "reference": "./type"
            }
          ]
        },
        {
          "name": "pack_options",
          "type": "subsection",
          "fields": [
            {
              "name": "is_openable",
              "type": "checkbox"
            },
            {
              "name": "open_animation",
              "type": "fabric_link",
              "video_preview": true
            },
            {
              "name": "item_slots",
              "type": "list",
              "fields": [
                {
                  "name": "possible_items",
                  "type": "list",
                  "fields": [
                    {
                      "name": "nft",
                      "label": "NFT Template or Collection",
                      "type": "fabric_link"
                    },
                    {
                      "name": "probability",
                      "type": "integer",
                      "hint": "Integer percentage from 0 to 100",
                      "default_value": 100
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

module.exports = NFTTemplateSpec;
