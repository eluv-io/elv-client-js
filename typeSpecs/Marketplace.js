const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
const currencyOptions = [...new Set(Object.values(require("country-codes-list").customList("countryNameEn", "{currencyCode}")))].filter(c => c).sort();

const MarketplaceSpec = {
  "profile": {
    "name": "Eluvio LIVE Marketplace",
    "version": "0.3",
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
      "label": "Branding and Customization",
      "name": "header_branding",
      "type": "header"
    },
    {
      "name": "tenant_id",
      "label": "Tenant ID",
      "type": "Text"
    },
    {
      "name": "branding",
      "type": "subsection",
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "subheader",
          "type": "text",
          "default_value": "Marketplace"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "round_logo",
          "extensions": imageTypes,
          "type": "file",
          "hint": "This logo will be displayed in the list of available marketplaces"
        },
        {
          "name": "card_banner",
          "extensions": imageTypes,
          "type": "file",
          "hint": "This banner will be displayed in the list of available marketplaces. It should be roughly 16:10 aspect ratio."
        },
        {
          "name": "tags",
          "type": "multiselect",
          "hint": "These tags will be used to help users discover your marketplace based on their interests.",
          "options": [
            "Film",
            "Music",
            "Software",
            "TV"
          ]
        },
        {
          "name": "color_scheme",
          "type": "select",
          "default_value": "Light",
          "options": [
            "Light",
            "Dark",
            "User Preference"
          ]
        },
        {
          "name": "font",
          "type": "select",
          "options": [
            "Helvetica Neue",
            "Inter",
            "Selawik"
          ]
        }
      ]
    },
    {
      "name": "login_customization",
      "label": "Login Customization",
      "type": "subsection",
      "fields": [
        {
          "label": "Login Page Logo",
          "name": "logo",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "label": "Login Page Background",
          "name": "background",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "background_mobile",
          "label": "Login Page Background (Mobile)",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "large_logo_mode",
          "type": "checkbox",
          "hint": "If specified, the logo in the login box will be significantly larger, but *the background image will NOT be visible in the Live app*."
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
          "name": "require_consent",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "consent_form_text",
          "type": "rich_text"
        },
        {
          "name": "privacy_policy",
          "type": "subsection",
          "fields": [
            {
              "name": "link",
              "type": "text",
              "hint": "Specify a URL to your privacy policy"
            },
            {
              "name": "rich_text",
              "type": "rich_text",
              "hint": "Input your privacy policy in the text editor"
            },
            {
              "name": "html",
              "label": "HTML",
              "type": "file",
              "hint": "Input your privacy policy as an HTML file",
              "extensions": ["html"]
            }
          ]
        },
        {
          "name": "require_email_verification",
          "type": "checkbox",
          "default_value": true
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
    },



    {
      "label": "Item Definitions",
      "name": "header_items",
      "type": "header"
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
          "label": "Release date",
          "name": "available_at",
          "type": "datetime",
          "hint": "(Optional) - If specified, this item will not be available for purchase until the specified time"
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
      "label": "Storefront Organization",
      "name": "header_storefront",
      "type": "header"
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
          "name": "purchase_animation",
          "type": "fabric_link",
          "video_preview": true,
          "hint": "If specified, this video will play on the status screen after a purchase is made until minting is complete"
        },
        {
          "name": "tabs",
          "type": "subsection",
          "fields": [
            {
              "name": "store",
              "type": "text",
              "default_value": "Store"
            },
            {
              "name": "collection",
              "label": "My Items",
              "type": "text",
              "default_value": "My Items"
            }
          ]
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
      "label": "Collections",
      "name": "header_collections",
      "type": "header"
    },
    {
      "name": "collections",
      "type": "list",
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "collection_header",
          "type": "text"
        },
        {
          "name": "collection_subheader",
          "type": "text"
        },
        {
          "extensions": imageTypes,
          "name": "collection_icon",
          "type": "file"
        },
        {
          "name": "placeholder",
          "type": "subsection",
          "hint": "Used for explicitly unspecified item slots (<None>). Will not override item definitions.",
          "fields": [
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "description",
              "type": "text"
            },
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file"
            }
          ]
        },
        {
          "name": "collection_info_modal",
          "type": "subsection",
          "fields": [
            {
              "name": "show",
              "type": "checkbox",
              "hint": "The modal will only be displayed if this is checked"
            },
            {
              "name": "message",
              "type": "rich_text"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "background_image",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "button_text",
              "type": "text",
              "hint": "Text for the button at the bottom of the modal. By default, it will be 'Create Wallet' if login is required for the next drop, otherwise it will be 'Join the Drop'"
            }
          ]
        },
        {
          "name": "items",
          "type": "reference_multiselect",
          "reference": "/items",
          "label_key": "name",
          "value_key": "sku",
          "allow_null": true
        }
      ]
    }
  ]
};

module.exports = MarketplaceSpec;
