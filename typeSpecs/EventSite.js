const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
const countryOptions = Object.values(require("country-codes-list").customList("countryNameEn", "{countryCode}: {countryNameEn}")).sort();
const currencyOptions = [...new Set(Object.values(require("country-codes-list").customList("countryNameEn", "{currencyCode}")))].filter(c => c).sort();
const languageOptions = require("./LanguageCodes");

const eventSiteSpec = {
  "profile": {
    name: "Eluvio LIVE Event Site",
    version: "0.13",
  },
  manageApp: "default",
  "hide_image_tab": true,
  associate_permissions: true,
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
      label: "Promos",
      indexed: true,
      slugged: true,
      defaultable: true,
      orderable: true
    },
    {
      name: "channels",
      label: "Channels",
      indexed: true,
      defaultable: true
    },
  ],
  info_fields: [
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
        "Live Available",
        "Live Ended",
        "VoD Available"
      ],
      "default_value": "Inaccessible",
      "hint": "Specify the current state of the event. Inaccessible and ended events will not be visible to users."
    },
    {
      "name": "free",
      "type": "checkbox",
      "no_localize": true,
      "hint": "If specified, the event is free for all users and tickets will not be necessary."
    },
    {
      "label": "Tenant ID",
      "name": "tenant_id",
      "type": "text",
      "no_localize": true,
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
          "name": "feature_subheader",
          "type": "text",
          "hint": "Displayed when the event is featured on the main page"
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
          "name": "location",
          "type": "text"
        },
        {
          "name": "date",
          "type": "text"
        },
        {
          "name": "description",
          "type": "textarea"
        },
        {
          "name": "copyright",
          "type": "textarea"
        }
      ],
      "name": "event_info",
      "type": "subsection"
    },
    {
      "fields": [
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
          "extensions": imageTypes,
          "name": "card_image",
          "label": "Feature Card Image",
          "type": "file",
          "hint": "Used when featured in upcoming events on the main page"
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
        }
      ],
      "name": "event_images",
      "type": "subsection"
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
          ],
          "name": "social_media_links",
          "type": "subsection",
        }
      ],
      "name": "artist_info",
      "type": "subsection",
      "label": "Links",
      "no_localize": true
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
          "name": "header_image",
          "type": "file",
          "extensions": imageTypes
        },
        {
          "name": "header_text",
          "type": "text"
        },
        {
          "name": "hide_countdown",
          "type": "checkbox"
        },
        {
          "name": "message_1",
          "type": "textarea",
          "hint": "Message above the countdown. Default: 'Your Ticket is Redeemed. Event Begins In'"
        },
        {
          "name": "message_2",
          "type": "textarea",
          "hint": "Message below the countdown. Default: 'Use the link in your ticket email to return here at the time of the event'"
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
        }
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
      "hint": "This information will be used to populate data used by search engines for displaying this event"
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
    }
  ]
};

module.exports = eventSiteSpec;
