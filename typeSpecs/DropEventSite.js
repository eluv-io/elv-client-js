const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
const languageOptions = require("./LanguageCodes");
const countryOptions = Object.values(require("country-codes-list").customList("countryNameEn", "{countryCode}: {countryNameEn}")).sort();
const currencyOptions = [...new Set(Object.values(require("country-codes-list").customList("countryNameEn", "{currencyCode}")))].filter(c => c).sort();

const eventSiteSpec = {
  "profile": {
    name: "Eluvio LIVE Event Site",
    version: "0.2",
  },
  manageApp: "default",
  associate_permissions: true,
  "hide_image_tab": true,
  controls: [],
  asset_types: [
    "primary"
  ],
  title_types: [
    "site"
  ],
  default_image_keys: [],
  localization: {
    localizations: Object.keys(languageOptions)
  },
  associated_assets: [
    {
      name: "promos",
      label: "Promos (Apple TV)",
      indexed: true,
      slugged: true,
      defaultable: true,
      orderable: true
    },
    {
      name: "channels",
      label: "Channels (Apple TV)",
      indexed: true,
      defaultable: true
    },
  ],
  info_fields: [
    {
      "label": "Basic Info",
      "name": "header_basic_info",
      "type": "header"
    },
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
      "name": "marketplace",
      "type": "fabric_link",
      "hash_only": true,
      "no_localize": true
    },
    {
      "name": "state",
      "type": "select",
      "no_localize": true,
      "options": [
        "Inaccessible",
        "Available",
        "Ended"
      ],
      "default_value": "Inaccessible",
      "hint": "Specify the current state of the event. Inaccessible and ended events will not be visible to users."
    },
    {
      "label": "Accessible (Apple TV)",
      "name": "accessible",
      "type": "checkbox"
    },
    {
      "name": "theme",
      "type": "select",
      "options": [
        "light",
        "dark"
      ],
      "no_localize": true,
    },
    {
      "name": "localizations",
      "label": "Localizations",
      "type": "multiselect",
      "no_localize": true,
      "hint": "Additional languages to support",
      "options": Object.keys(languageOptions)
    },




    {
      "label": "Event Info",
      "name": "header_event_info",
      "type": "header"
    },
    {
      "fields": [
        {
          "label": "Event Info on Hero Image",
          "name": "hero_info",
          "type": "checkbox",
          "hint": "Check this box if your event info is in your hero image. This will reduce the gradient and omit the text, allowing for more visible real estate on the hero image."
        },
        {
          "name": "event_title",
          "type": "text",
          "hint": "The title of the page in the browser"
        },
        {
          "name": "feature_header",
          "type": "text",
          "hint": "Displayed when the event is featured on the main page"
        },
        {
          "name": "feature_button",
          "type": "subsection",
          "hint": "This section configures the button linking to this event when shown on the main site as a featured event.",
          "fields": [
            {
              "name": "text",
              "type": "text",
              "default_value": "Join the Drop"
            },
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
                "color": "#d7bb73"
              }
            }
          ]
        },
        {
          "name": "event_header",
          "type": "text",
          "hint": "Displayed on the main event page"
        },
        {
          "name": "event_subheader",
          "type": "text",
          "hint": "Displayed on the main event page"
        },
        {
          "name": "date_subheader",
          "type": "text",
          "hint": "Displayed on the main page and event page"
        },
        {
          "name": "show_countdown",
          "label": "Show countdown to next drop",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "copyright",
          "type": "rich_text"
        },
        {
          "name": "show_cookie_banner",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "modal_message_get_started",
          "label": "Modal Message (Get Started)",
          "type": "subsection",
          "hint": "If specified, this message will be displayed in a popup modal the 'Get Started' button is pressed. You can use this to communicate event info before they create or sign in to their wallet.",
          "fields": [
            {
              "name": "show",
              "type": "checkbox",
              "hint": "The message box will only be displayed if this is checked"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "message",
              "type": "rich_text"
            },
            {
              "name": "button_text",
              "type": "text",
              "hint": "Text for the button at the bottom of the modal. By default, it will be 'Create Wallet' if login is required for the next drop, otherwise it will be 'Join the Drop'"
            },
            {
              "name": "post_login",
              "label": "Post Login Modal",
              "type": "subsection",
              "hint": "If specified, modal will be shown after a user goes through the login process from the 'Get Started' modal",
              "fields": [
                {
                  "name": "show",
                  "type": "checkbox",
                },
                {
                  "name": "image",
                  "type": "file",
                  "extensions": imageTypes
                },
                {
                  "name": "message",
                  "type": "rich_text"
                },
                {
                  "name": "button_text",
                  "type": "text",
                  "hint": "Text for the button at the bottom of the modal. By default, it will be 'Go to the Marketplace' if 'Show Marketplace' is checked, otherwise it will be 'Close'"
                },
                {
                  "name": "show_marketplace",
                  "type": "checkbox",
                  "hint": "Show the marketplace after the post login modal"
                },
                {
                  "name": "marketplace_filters",
                  "type": "list",
                  "hint": "Use this fields to filter the items shown"
                },
                {
                  "name": "hide_navigation",
                  "label": "Hide Marketplace Navigation",
                  "type": "checkbox",
                  "hint": "If checked, the back button will not be shown in the marketplace."
                }
              ]
            }
          ]
        }
      ],
      "name": "event_info",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "logo",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "logo_link",
          "type": "text",
          "hint": "If a custom logo is set, this field will specify a custom URL for the logo to link to."
        },
        {
          "extensions": imageTypes,
          "name": "hero_background",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "hero_background_mobile",
          "label": "Hero Background (Mobile)",
          "type": "file"
        },
        {
          "name": "hero_video",
          "type": "fabric_link",
          "video_preview": true
        },
        {
          "extensions": imageTypes,
          "label": "Header Image (Dark)",
          "name": "header_dark",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "label": "Header Image (Light)",
          "name": "header_light",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "name": "tv_main_background",
          "type": "file",
          "label": "Main Background (TV)"
        },
        {
          "extensions": imageTypes,
          "name": "tv_main_logo",
          "type": "file",
          "label": "Main Logo (TV)"
        },
        {
          "name": "main_page_banner",
          "type": "subsection",
          "fields": [
            {
              "name": "show",
              "type": "checkbox"
            },
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file"
            },
            {
              "extensions": imageTypes,
              "name": "image_mobile",
              "label": "Image (Mobile)",
              "type": "file"
            },
            {
              "name": "type",
              "type": "select",
              "options": [
                "drop",
                "marketplace",
                "link"
              ],
              "default_value": "marketplace",
              "hint": "Specify what happens when clicking on the banner. The banner can link to a URL or a drop, or it can open the marketplace view."
            },
            {
              "name": "marketplace_filters",
              "type": "list",
              "hint": "If the banner links to the marketplace, you can specify filters to apply when the marketplace is opened via the banner."
            },
            {
              "name": "link",
              "type": "text",
              "hint": "If the banner is a link, specify the URL to link to."
            },
            {
              "label": "Drop UUID",
              "name": "drop_uuid",
              "type": "text",
              "hint": "If the banner links to a drop, you can specify a specific drop to link to. If not specified, the banner will link to the next upcoming drop."
            }
          ]
        }
      ],
      "name": "event_images",
      "type": "subsection"
    },
    {
      "name": "promo_videos",
      "type": "list",
      "fields": [
        {
          "name": "video",
          "type": "fabric_link",
          "video_preview": true
        }
      ]
    },
    {
      "fields": [
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "location",
          "type": "text"
        }
      ],
      "label": "Calendar Event",
      "name": "calendar",
      "type": "subsection"
    },
    {
      "name": "sponsor_tagline",
      "type": "text",
      "hint": "Customize what shows above the sponsor list",
      "default_value": "Sponsored by"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "link",
          "type": "text"
        },
        {
          "extensions": imageTypes,
          "label": "Image (for light background)",
          "name": "image",
          "type": "file"
        },
        {
          "extensions": imageTypes,
          "label": "Image (for dark background)",
          "name": "image_light",
          "type": "file"
        }
      ],
      "name": "sponsors",
      "type": "list"
    },
    {
      "name": "social_media_links",
      "type": "subsection",
      "fields": [
        {
          "name": "youtube",
          "type": "text"
        },
        {
          "name": "instagram",
          "type": "text"
        },
        {
          "name": "twitter",
          "type": "text"
        },
        {
          "name": "website",
          "type": "text"
        },
        {
          "name": "facebook",
          "type": "text"
        },
        {
          "name": "soundcloud",
          "type": "text"
        },
        {
          "name": "apple_music",
          "type": "text"
        },
        {
          "name": "spotify",
          "type": "text"
        }
      ]
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "fields": [
            {
              "hint": "A description displayed next to the 'Next' button when viewing the previous page.",
              "name": "page_title",
              "type": "text"
            },
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file"
            },
            {
              "name": "text_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#000000",
                "label": "Black"
              }
            },
            {
              "name": "background_color",
              "type": "color",
              "no_label": true,
              "default_value": {
                "color": "#FFFFFF",
                "label": "White"
              }
            },
            {
              "name": "text",
              "type": "rich_text"
            }
          ],
          "name": "pages",
          "type": "list"
        }
      ],
      "name": "event_descriptions",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "header_image",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "background_image",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "background_image_mobile",
          "label": "Background Image (Mobile)",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "header_text",
          "type": "text"
        },
        {
          "name": "show_countdown",
          "type": "checkbox",
          "default_value": true
        },
        {
          "name": "message_1",
          "type": "textarea",
          "hint": "Message above the countdown. Default: 'Your Code is Redeemed. Drop Begins In'"
        },
        {
          "name": "message_2",
          "type": "textarea",
          "hint": "Message below the countdown. Default: 'Use the link in your code email to return here at the time of the drop.'"
        }
      ],
      "name": "event_landing_page",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "subheader",
          "type": "text"
        },
        {
          "name": "header",
          "type": "text"
        },
        {
          "name": "stream",
          "type": "fabric_link",
          "video_preview": true
        },
      ],
      "name": "stream_page",
      "type": "subsection"
    },
    {
      "name": "footer_links",
      "type": "list",
      "hint": "Specify links to include in the footer of the event, such as privacy or terms policies. Each item can either be specified as a URL, rich text, or an HTML document. The two latter options will be shown in a modal when clicked.",
      "fields": [
        {
          "name": "text",
          "type": "text"
        },
        {
          "name": "url",
          "label": "URL Link",
          "type": "text"
        },
        {
          "label": "Content (Rich Text)",
          "name": "content_rich_text",
          "type": "rich_text"
        },
        {
          "label": "Content (HTML)",
          "name": "content_html",
          "type": "file",
          "extensions": ["html"]
        }
      ]
    },
    {
      "name": "branding",
      "label": "Custom Branding",
      "type": "subsection",
      "fields": [
        {
          "name": "get_started",
          "label": "'Get Started' Button",
          "type": "subsection",
          "fields": [
            {
              "name": "text",
              "type": "text",
              "default_value": "Get Started"
            },
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
                "color": "#d7bb73"
              }
            }
          ]
        },
        {
          "name": "join_drop",
          "label": "'Join the Drop' Button",
          "type": "subsection",
          "fields": [
            {
              "name": "text",
              "type": "text",
              "default_value": "Join the Drop"
            },
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
                "color": "#d7bb73"
              }
            }
          ]
        },
        {
          "name": "buy_tickets",
          "label": "'Buy Tickets' Button",
          "type": "subsection",
          "fields": [
            {
              "name": "text",
              "type": "text",
              "default_value": "Buy Tickets"
            },
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
                "color": "#000000"
              }
            }
          ]
        },
        {
          "name": "watch_promo",
          "label": "'Watch Promo' Button",
          "type": "subsection",
          "fields": [
            {
              "name": "text",
              "type": "text",
              "default_value": "Watch Promo"
            },
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
                "color": "#d7bb73"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "show_faq",
      "label": "Show FAQ",
      "type": "checkbox",
      "default_value": true
    },
    {
      "name": "faq",
      "label": "FAQ",
      "hint": "Specify a custom FAQ. If blank, the default FAQ will be displayed",
      "type": "list",
      "fields": [
        {
          "name": "question",
          "type": "text"
        },
        {
          "name": "answer",
          "type": "textarea"
        }
      ]
    },




    {
      "label": "Tickets, Products and Coupons",
      "name": "header_tickets_products_coupons",
      "type": "header"
    },
    {
      "name": "shipping_countries",
      "type": "multiselect",
      "no_localize": true,
      "hint": "Countries to which merchandise shipment is available",
      "default_value": ["US: United States of America"],
      "options": countryOptions
    },
    {
      "name": "payment_currencies",
      "type": "multiselect",
      "no_localize": true,
      "hint": "List of accepted currencies for tickets and merchandise",
      "default_value": ["USD"],
      "options": currencyOptions
    },
    {
      "name": "free",
      "type": "checkbox",
      "no_localize": true,
      "hint": "If specified, the event is free for all users and tickets will not be necessary."
    },
    {
      "fields": [
        {
          "name": "coupon_mode",
          "type": "checkbox",
          "no_localize": true,
          "hint": "If specified, coupon redemption will be available"
        },
        {
          "name": "redemption_message",
          "type": "text",
          "hint": "Text to be displayed on coupon redemption page"
        },
        {
          "name": "event_page_message_1",
          "type": "text",
          "hint": "Text to be displayed on event page after redemption"
        },
        {
          "name": "event_page_message_2",
          "type": "text",
          "hint": "Text to be displayed on event page after redemption"
        }
      ],
      "name": "coupon_redemption",
      "type": "subsection"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "label": "Item ID",
          "name": "uuid",
          "no_localize": true,
          "type": "uuid"
        },
        {
          "name": "hidden",
          "type": "checkbox",
          "no_localize": true,
          "hint": "If checked, this ticket class will not be displayed and won't be available for purchase."
        },
        {
          "name": "release_date",
          "type": "datetime",
          "no_localize": true,
          "hint": "If the tickets should not be available for purchase immediately, specify a release date"
        },
        {
          "name": "requires_shipping",
          "type": "checkbox",
          "no_localize": true,
          "hint": "If checked, shipping information and taxes will be collected for purchases of this ticket class."
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file"
        },
        {
          "fields": [
            {
              "name": "label",
              "type": "text"
            },
            {
              "label": "Item ID",
              "name": "uuid",
              "type": "uuid",
              "no_localize": true,
            },
            {
              "name": "hidden",
              "type": "checkbox",
              "no_localize": true,
              "hint": "If checked, this ticket SKU will not be displayed and won't be available for purchase."
            },
            {
              "label": "NTP ID",
              "name": "otp_id",
              "no_localize": true,
              "type": "ntp_id"
            },
            {
              "name": "start_time",
              "type": "datetime",
              "no_localize": true,
            },
            {
              "label": "Start Time (Text)",
              "hint": "This label will be displayed in emails where time zone localization is not possible.",
              "name": "start_time_text",
              "type": "text"
            },
            {
              "name": "end_time",
              "type": "datetime",
              "no_localize": true,
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
              "name": "external_url",
              "hint": "External URL from which to purchase this ticket. If specified, the payment information below is not required."
            }
          ],
          "label": "SKUs",
          "name": "skus",
          "type": "list"
        }
      ],
      "name": "tickets",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "type",
          "options": [
            "merchandise",
            "donation"
          ],
          "type": "select",
          "no_localize": true,
        },
        {
          "name": "name",
          "type": "text"
        },
        {
          "label": "Item ID",
          "name": "uuid",
          "type": "uuid",
          "no_localize": true,
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "fields": [
            {
              "extensions": imageTypes,
              "name": "image",
              "type": "file"
            }
          ],
          "name": "images",
          "type": "list"
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
          "name": "featured",
          "type": "checkbox",
          "no_localize": true,
          "hint": "A featured item will be shown at checkout."
        },
        {
          "fields": [
            {
              "name": "name",
            },
            {
              "name": "type",
              "type": "select",
              "options": [
                "text",
                "color",
                "number"
              ]
            }
          ],
          "hint": "Specify the characteristics each variation of this product has, for example 'Size' and 'Color'",
          "name": "option_fields",
          "no_localize": true,
          "type": "list"
        },
        {
          "name": "product_options",
          "type": "reference_list",
          "no_localize": true,
          "reference": "./option_fields",
          "fields": [
            {
              "label": "SKU ID",
              "name": "uuid",
              "type": "uuid"
            }
          ]
        }
      ],
      "name": "products",
      "type": "list"
    },
    {
      "fields": [
        {
          "name": "title",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "release_date",
          "type": "datetime",
          "no_localize": true,
        },
        {
          "extensions": imageTypes,
          "name": "image",
          "type": "file"
        },
        {
          "name": "package",
          "type": "fabric_link",
          "no_localize": true,
        }
      ],
      "name": "extras",
      "type": "list"
    },





    {
      "label": "Drops",
      "name": "header_drops",
      "type": "header"
    },
    {
      "name": "hide_upcoming_events",
      "type": "checkbox",
      "default_value": false
    },
    {
      "name": "marketplace_drops",
      "type": "list",
      "fields": [
        {
          "name": "uuid",
          "label": "Drop ID",
          "type": "uuid",
          "no_localize": true
        },
        {
          "name": "event_header",
          "type": "text",
          "hint": "Used when displayed in upcoming events"
        },
        {
          "name": "event_image",
          "type": "file",
          "extensions": imageTypes,
          "hint": "Used when displayed in upcoming events"
        },
        {
          "name": "start_date",
          "type": "datetime",
          "no_localize": true
        },
        {
          "name": "store_filters",
          "type": "list",
          "hint": "After the drop, the wallet panel will be redirected to the store. Use these fields to filter the items shown for users who voted"
        },
        {
          "fields": [
            {
              "name": "title",
              "type": "text"
            },
            {
              "name": "description",
              "type": "textarea"
            },
            {
              "name": "location",
              "type": "text"
            }
          ],
          "label": "Calendar Event Info",
          "name": "calendar",
          "type": "subsection"
        }
      ]
    },
    {
      "name": "drops",
      "label": "Drop Events",
      "type": "list",
      "fields": [
        {
          "name": "uuid",
          "label": "Drop ID",
          "type": "uuid",
          "no_localize": true
        },
        {
          "name": "requires_login",
          "type": "checkbox",
          "default_value": true
        },
        {
          "name": "requires_ticket",
          "type": "checkbox",
          "default_value": false
        },
        {
          "name": "event_header",
          "type": "text",
          "hint": "Used when displayed in upcoming events"
        },
        {
          "name": "event_image",
          "type": "file",
          "extensions": imageTypes,
          "hint": "Used when displayed in upcoming events"
        },
        {
          "name": "start_date",
          "type": "datetime",
          "no_localize": true
        },
        {
          "name": "end_date",
          "type": "datetime",
          "no_localize": true
        },
        {
          "name": "votable",
          "type": "checkbox",
          "hint": "If specified, users will be able to vote on the available NFTs",
          "default_value": true
        },
        {
          "name": "minting_animation",
          "type": "fabric_link",
          "video_preview": true,
          "hint": "If specified, this video will play on the status screen while waiting for NFTs to mint"
        },
        {
          "name": "store_filters",
          "type": "list",
          "hint": "After the drop, the wallet panel will be redirected to the store. Use these fields to filter the items shown"
        },
        {
          "name": "store_filters_no_vote",
          "label": "Store Filters (No Vote)",
          "type": "list",
          "hint": "After the drop, the wallet panel will be redirected to the store. Use these fields to filter the items shown for users who have not voted"
        },
        {
          "name": "drop_header",
          "type": "text",
          "hint": "Text to show during the voting stage above the list of NFTs"
        },
        {
          "name": "drop_subheader",
          "type": "text",
          "hint": "Text to show during the voting stage above the list of NFTs"
        },
        {
          "name": "nfts",
          "label": "NFTs",
          "type": "list",
          "hint": "NFTs available in this drop",
          "fields": [
            {
              "name": "label",
              "type": "text"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            },
            {
              "name": "sku",
              "label": "SKU",
              "type": "text",
              "hint": "Find NFT SKUs in the associated Marketplace",
            }
          ]
        },
        {
          "fields": [
            {
              "name": "title",
              "type": "text"
            },
            {
              "name": "description",
              "type": "textarea"
            },
            {
              "name": "location",
              "type": "text"
            }
          ],
          "label": "Calendar Event Info",
          "name": "calendar",
          "type": "subsection"
        },
        {
          "name": "event_state_preroll",
          "label": "Event State: Preroll",
          "type": "subsection",
          "fields": [
            {
              "name": "use_state",
              "type": "checkbox",
              "default_value": true
            },
            {
              "name": "header",
              "type": "text"
            },
            {
              "name": "subheader",
              "type": "text"
            },
            {
              "name": "show_countdown",
              "label": "Show Countdown to Next State",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "use_main_stream",
              "type": "checkbox",
              "default_value": false,
              "hint": "If checked, the stream for the main event will be used instead of one specified in this section"
            },
            {
              "name": "stream",
              "type": "fabric_link",
              "video_preview": true
            },
            {
              "name": "loop_stream",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "modal_message",
              "label": "Modal Message (Pre Event)",
              "type": "subsection",
              "hint": "If specified, this message will be displayed in a popup modal at the start of this part of the event. You can use this to communicate information to users.",
              "fields": [
                {
                  "name": "show",
                  "type": "checkbox",
                  "hint": "The message box will only be displayed if this is checked"
                },
                {
                  "name": "image",
                  "type": "file",
                  "extensions": imageTypes
                },
                {
                  "name": "message",
                  "type": "rich_text"
                }
              ]
            },
          ]
        },
        {
          "name": "event_state_main",
          "label": "Event State: Main",
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
              "name": "start_date",
              "type": "datetime",
              "no_localize": true
            },
            {
              "name": "show_countdown",
              "label": "Show Countdown to Next State",
              "type": "checkbox",
              "default_value": true
            },
            {
              "name": "stream",
              "type": "fabric_link",
              "video_preview": true
            },
            {
              "name": "loop_stream",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "modal_message",
              "label": "Modal Message (Main Event)",
              "type": "subsection",
              "hint": "If specified, this message will be displayed in a popup modal at the start of this part of the event. You can use this to communicate information to users.",
              "fields": [
                {
                  "name": "show",
                  "type": "checkbox",
                  "hint": "The message box will only be displayed if this is checked"
                },
                {
                  "name": "image",
                  "type": "file",
                  "extensions": imageTypes
                },
                {
                  "name": "message",
                  "type": "rich_text"
                }
              ]
            },
          ]
        },
        {
          "name": "event_state_post_vote",
          "label": "Event State: Voting Ended",
          "type": "subsection",
          "fields": [
            {
              "name": "use_state",
              "type": "checkbox",
              "default_value": true
            },
            {
              "name": "header",
              "type": "text"
            },
            {
              "name": "subheader",
              "type": "text"
            },
            {
              "name": "start_date",
              "type": "datetime",
              "no_localize": true
            },
            {
              "name": "show_countdown",
              "label": "Show Countdown to Next State",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "use_main_stream",
              "type": "checkbox",
              "default_value": false,
              "hint": "If checked, the stream for the main event will be used instead of one specified in this section"
            },
            {
              "name": "stream",
              "type": "fabric_link",
              "video_preview": true
            },
            {
              "name": "loop_stream",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "modal_message",
              "label": "Modal Message (Voting Ended)",
              "type": "subsection",
              "hint": "If specified, this message will be displayed in a popup modal at the start of this part of the event. You can use this to communicate information to users.",
              "fields": [
                {
                  "name": "show",
                  "type": "checkbox",
                  "hint": "The message box will only be displayed if this is checked"
                },
                {
                  "name": "image",
                  "type": "file",
                  "extensions": imageTypes
                },
                {
                  "name": "message",
                  "type": "rich_text"
                }
              ]
            },
          ]
        },
        {
          "name": "event_state_mint_start",
          "label": "Event State: Minting Start",
          "type": "subsection",
          "fields": [
            {
              "name": "use_state",
              "type": "checkbox",
              "default_value": true
            },
            {
              "name": "header",
              "type": "text"
            },
            {
              "name": "subheader",
              "type": "text"
            },
            {
              "name": "start_date",
              "type": "datetime",
              "no_localize": true
            },
            {
              "name": "use_main_stream",
              "type": "checkbox",
              "default_value": false,
              "hint": "If checked, the stream for the main event will be used instead of one specified in this section"
            },
            {
              "name": "stream",
              "type": "fabric_link",
              "video_preview": true
            },
            {
              "name": "loop_stream",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "modal_message",
              "label": "Modal Message (Minting Start)",
              "type": "subsection",
              "hint": "If specified, this message will be displayed in a popup modal at the start of this part of the event. You can use this to communicate information to users.",
              "fields": [
                {
                  "name": "show",
                  "type": "checkbox",
                  "hint": "The message box will only be displayed if this is checked"
                },
                {
                  "name": "image",
                  "type": "file",
                  "extensions": imageTypes
                },
                {
                  "name": "message",
                  "type": "rich_text"
                }
              ]
            },
          ]
        },
        {
          "name": "event_state_event_end",
          "label": "Event State: Event Ended",
          "type": "subsection",
          "fields": [
            {
              "name": "use_state",
              "type": "checkbox",
              "default_value": true
            },
            {
              "name": "header",
              "type": "text"
            },
            {
              "name": "subheader",
              "type": "text"
            },
            {
              "name": "start_date",
              "type": "datetime",
              "no_localize": true
            },
            {
              "name": "use_main_stream",
              "type": "checkbox",
              "default_value": false,
              "hint": "If checked, the stream for the main event will be used instead of one specified in this section"
            },
            {
              "name": "stream",
              "type": "fabric_link",
              "video_preview": true
            },
            {
              "name": "loop_stream",
              "type": "checkbox",
              "default_value": false
            },
            {
              "name": "modal_message",
              "label": "Modal Message (Event Ended)",
              "type": "subsection",
              "hint": "If specified, this message will be displayed in a popup modal at the start of this part of the event. You can use this to communicate information to users.",
              "fields": [
                {
                  "name": "show",
                  "type": "checkbox",
                  "hint": "The message box will only be displayed if this is checked"
                },
                {
                  "name": "image",
                  "type": "file",
                  "extensions": imageTypes
                },
                {
                  "name": "message",
                  "type": "rich_text"
                }
              ]
            },
          ]
        }
      ]
    },





    {
      "label": "Search and Analytics",
      "name": "header_search_and_analytics",
      "type": "header"
    },
    {
      "fields": [
        {
          "name": "name",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "location",
          "type": "text"
        },
        {
          "name": "type",
          "type": "select",
          "options": ["Online Only", "Online and In-Person"]
        },
        {
          "name": "images",
          "type": "list",
          "fields": [{
            "name": "image",
            "type": "file",
            "extensions": imageTypes
          }]
        },
        {
          "name": "performers",
          "type": "list",
          "fields": [
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "url",
              "label": "URL",
              "type": "text"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            }
          ]
        },
        {
          "name": "organizers",
          "type": "list",
          "fields": [
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "url",
              "label": "URL",
              "type": "text"
            },
            {
              "name": "image",
              "type": "file",
              "extensions": imageTypes
            }
          ]
        },
        {
          "name": "showings",
          "type": "list",
          "fields": [
            {
              "name": "name",
              "type": "text"
            },
            {
              "name": "start_time",
              "type": "datetime",
              "hint": "Make sure this time exactly matches the corresponding ticket SKU start times"
            },
            {
              "name": "end_time",
              "type": "datetime"
            }
          ]
        }
      ],
      "label": "Search Listing Info",
      "name": "search_data",
      "type": "subsection",
      "hint": "This information will be used to populate data used by search engines for displaying this event",
      "no_localize": true
    },
    {
      "name": "analytics_ids",
      "label": "Analytics IDs",
      "type": "list",
      "no_localize": true,
      "hint": "Specify IDs for your own analytics",
      "fields": [
        {
          "name": "label",
          "type": "text",
          "hint": "A label for this collection of analytics"
        },
        {
          "name": "ids",
          "label": "IDs",
          "type": "list",
          "fields": [
            {
              "name": "type",
              "type": "select",
              "options": [
                "Google Analytics ID",
                "Google Tag Manager ID",
                "Google Conversion ID",
                "Google Conversion Label",
                "Facebook Pixel ID",
                "App Nexus Segment ID",
                "App Nexus Pixel ID",
                "TradeDoubler Organization ID",
                "TradeDoubler Event ID",
              ]
            },
            {
              "name": "id",
              "label": "ID",
              "type": "text"
            }
          ]
        }
      ]
    }
  ]
};

module.exports = eventSiteSpec;
