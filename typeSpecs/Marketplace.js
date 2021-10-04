const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
const currencyOptions = [...new Set(Object.values(require("country-codes-list").customList("countryNameEn", "{currencyCode}")))].filter(c => c).sort();

const MarketplaceSpec = {
  "profile": {
    "name": "Eluvio LIVE Marketplace",
    "version": "0.1",
  },
  "manageApp": "default",
  "hide_image_tab": true,
  "asset_types": [
    "primary"
  ],
  "title_types": [
    "marketplace"
  ],
  "controls": [],
  "associated_assets": [],
  "info_fields": [
    {
      "name": "tenant_id",
      "label": "Tenant ID",
      "type": "Text"
    },
    {
      "label": "Eluvio LIVE Tenant",
      "name": "tenant",
      "type": "fabric_link",
      "hash_only": true,
      "no_localize": true
    },
    {
      "name": "name",
      "type": "text",
    },
    {
      "name": "description",
      "type": "textarea",
    },
    {
      "fields": [
        {
          "extensions": imageTypes,
          "name": "logo",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file"
        }
      ],
      "name": "images",
      "type": "subsection"
    },
    {
      "name": "events",
      "type": "list",
      "no_localize": true,
      "fields": [{
        "name": "event",
        "type": "fabric_link"
      }]
    },
    {
      "name": "payment_currencies",
      "type": "multiselect",
      "no_localize": true,
      "hint": "List of accepted currencies",
      "default_value": ["USD"],
      "options": currencyOptions
    },
    {
      "fields": [
        {
          "label": "SKU",
          "name": "sku",
          "type": "uuid"
        },
        {
          "name": "type",
          "type": "select",
          "options": [
            "nft",
            "ticket",
            "other"
          ]
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file",
          "hint": "For type 'nft', the image from the NFT template will be used if this field is not specified"
        },
        {
          "name": "for_sale",
          "type": "checkbox",
          "default_value": true
        },
        {
          "name": "requires_permissions",
          "type": "checkbox",
          "default_value": false,
          "hint": "If checked, users must have special permissions to the NFT template in order to view and buy the NFT in the marketplace"
        },
        {
          "name": "max_per_user",
          "label": "Purchase Limit",
          "type": "integer"
        },
        {
          "name": "free",
          "type": "checkbox",
          "hint": "If checked, this NFT will be free to claim. WARNING: This option will override any price value set below"
        },
        {
          "name": "price",
          "type": "reference_subsection",
          "no_localize": true,
          "reference": "/payment_currencies",
          "value_type": "number",
          "hint": "Available price currencies are based on the 'Payment Currencies' field above",
        },
        {
          "name": "tags",
          "type": "list"
        },
        {
          "label": "NFT Template",
          "name": "nft_template",
          "type": "fabric_link",
          "hint": "For type 'nft' only",
          "no_localize": true,
          "version": true,
          "video_preview": true
        }
      ],
      "name": "items",
      "type": "list"
    },
    {
      "name": "storefront",
      "type": "subsection",
      "fields": [
        {
          "name": "header",
          "type": "text"
        },
        {
          "name": "subheader",
          "type": "text"
        },
        {
          "name": "sections",
          "type": "list",
          "fields": [
            {
              "name": "section_header",
              "type": "text"
            },
            {
              "name": "section_subheader",
              "type": "text"
            },
            {
              "name": "items",
              "type": "reference_multiselect",
              "reference": "/items",
              "label_key": "name",
              "value_key": "sku"
            }
          ]
        },
      ]
    },
    {
      "name": "collections",
      "type": "list",
      "fields": [
        {
          "name": "collection_header",
          "type": "text"
        },
        {
          "name": "collection_subheader",
          "type": "text"
        },
        {
          "name": "items",
          "type": "reference_multiselect",
          "reference": "/items",
          "label_key": "name",
          "value_key": "sku"
        }
      ]
    },
    {
      "name": "login_customization",
      "label": "Custom Branding",
      "type": "subsection",
      "fields": [
        {
          "name": "font",
          "type": "select",
          "options": [
            "Helvetica Neue",
            "Inter",
            "Selawik"
          ]
        },
        {
          "name": "logo",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "background",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "background_mobile",
          "label": "Background (Mobile)",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "log_in_button",
          "type": "subsection",
          "fields": [
            {
              "name": "text_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#FFFFFF"
              }
            },
            {
              "name": "background_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#0885fb"
              }
            },
            {
              "name": "border_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#0885fb"
              }
            }
          ]
        },
        {
          "name": "sign_up_button",
          "type": "subsection",
          "fields": [
            {
              "name": "text_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#000000"
              }
            },
            {
              "name": "background_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#FFFFFF"
              }
            },
            {
              "name": "border_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#000000"
              }
            }
          ]
        },
        {
          "name": "disable_third_party",
          "label": "Disable third party login providers",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "disable_private_key",
          "label": "Disable Private Key Login",
          "type": "checkbox",
          "default_value": false
        }
      ]
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
  ]
};

module.exports = MarketplaceSpec;
