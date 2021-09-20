const imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

const NFTCollectionSpec = {
  "profile": {
    "name": "NFT Collection",
    "version": "0.2",
  },
  "manageApp": "default",
  "hide_image_tab": true,
  "asset_types": [
    "primary"
  ],
  "title_types": [
    "collection"
  ],
  "controls": [],
  "associated_assets": [],
  "info_fields": [
    {
      "name": "name",
      "type": "text",
    },
    {
      "name": "description",
      "type": "text",
    },
    {
      "extensions": imageTypes,
      "name": "image",
      "type": "file"
    },
    {
      "name": "nfts",
      "label": "NFTs",
      "type": "list",
      "fields": [
        {
          "label": "NFT Template",
          "name": "nft_template",
          "type": "fabric_link",
          "no_localize": true,
          "version": true
        },
        {
          "name": "placeholder",
          "type": "subsection",
          "hint": "These fields will be used for display if the user does not yet have access to the NFT",
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
              "name": "image",
              "type": "file",
              "extensions": imageTypes,
            }
          ]
        }
      ]
    }
  ]
};

module.exports = NFTCollectionSpec;
