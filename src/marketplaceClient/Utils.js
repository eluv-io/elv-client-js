const Utils = require("../Utils");

/**
 * Format NFT or listing result into consistent format
 */
exports.FormatNFTDetails = function(entry) {
  const isListing = !!entry.id;

  const metadata = (isListing ? entry.nft : entry.meta) || {};
  const info = (isListing ? entry.info : entry);

  let details = {
    USDCAccepted: !!(entry.accepts || []).find(entry => entry.type === "sol"),
    USDCOnly: ((entry.accepts || []).find(entry => entry.type === "sol") || {}).preferred,
    TenantId: entry.tenant || entry.tenant_id,
    ContractAddr: info.contract_addr,
    ContractId: `ictr${Utils.AddressToHash(info.contract_addr)}`,
    ContractName: info.contract_name,
    Cap: info.cap,
    TokenIdStr: info.token_id_str,
    TokenUri: info.token_uri,
    TokenOrdinal: info.ordinal,
    TokenHold: info.hold,
    TokenHoldDate: info.hold ? new Date(parseInt(info.hold) * 1000) : undefined,
    TokenOwner: info.token_owner ? Utils.FormatAddress(info.token_owner) : "",
    VersionHash: (info.token_uri || "").split("/").find(s => (s || "").startsWith("hq__")),
  };

  if(isListing) {
    details = {
      ...details,
      // Listing specific fields
      ListingId: entry.id,
      CreatedAt: entry.created * 1000,
      UpdatedAt: entry.updated * 1000,
      CheckoutLockedUntil: entry.checkout ? entry.checkout * 1000 : undefined,
      SellerAddress: Utils.FormatAddress(entry.seller),
      Price: entry.price,
      Fee: entry.fee
    };
  }

  return {
    metadata,
    details
  };
};

exports.FormatNFTMetadata = function(nft) {
  nft.formatted = true;

  // Surface relevant details to top level
  nft.contractAddress = nft.details.ContractAddr;
  nft.contractId = nft.details.ContractId;
  nft.tokenId = nft.details.TokenIdStr;
  nft.name = nft.metadata.display_name;

  if(nft.details.ListingId) {
    nft.listingId = nft.details.ListingId;
  }

  // Format traits
  const FILTERED_ATTRIBUTES = ["Content Fabric Hash", "Creator", "Total Minted Supply"];
  nft.metadata.attributes = (nft.metadata.attributes || [])
    .filter(attribute => attribute && !FILTERED_ATTRIBUTES.includes(attribute.trait_type))
    .map(trait => ({...trait, name: trait.trait_type, rarity_percent: RarityToPercentage(trait.rarity)}));

  // Generate embed URLs for additional media
  if(nft.metadata.additional_media) {
    nft.metadata.additional_media = nft.metadata.additional_media.map(media => {
      try {
        // Generate embed URLs for additional media
        const mediaType = (media.media_type || "").toLowerCase();

        if(mediaType === "image") {
          return {
            ...media,
            embed_url: media.media_file.url
          };
        }

        let embedUrl = new URL("https://embed.v3.contentfabric.io");
        embedUrl.searchParams.set("p", "");
        embedUrl.searchParams.set("net", rootStore.network === "demo" ? "demo" : "main");
        embedUrl.searchParams.set("ath", rootStore.authToken);

        if(mediaType === "video") {
          embedUrl.searchParams.set("vid", LinkTargetHash(media.media_link));
          embedUrl.searchParams.set("ct", "h");
          embedUrl.searchParams.set("ap", "");
        } else if(mediaType === "ebook") {
          embedUrl.searchParams.set("type", "ebook");
          embedUrl.searchParams.set("vid", media.media_file["."].container);
          embedUrl.searchParams.set("murl", btoa(media.media_file.url));
        }

        return {
          ...media,
          embed_url: embedUrl.toString()
        };
      } catch(error) {
        return media;
      }
    });
  }

  // Generate embed URLs for pack opening animations
  ["open_animation", "open_animation__mobile", "reveal_animation", "reveal_animation_mobile"].forEach(key => {
    try {
      if(nft.metadata.pack_options && nft.metadata.pack_options[key]) {
        let embedUrl = new URL("https://embed.v3.contentfabric.io");
        embedUrl.searchParams.set("p", "");
        embedUrl.searchParams.set("net", rootStore.network === "demo" ? "demo" : "main");
        embedUrl.searchParams.set("ath", rootStore.authToken || rootStore.staticToken);
        embedUrl.searchParams.set("vid", LinkTargetHash(nft.metadata.pack_options[key]));
        embedUrl.searchParams.set("ap", "");

        if(!key.startsWith("reveal")) {
          embedUrl.searchParams.set("m", "");
          embedUrl.searchParams.set("lp", "");
        }

        nft.metadata.pack_options[`${key}_embed_url`] = embedUrl.toString();
      }
    // eslint-disable-next-line no-empty
    } catch(error) {}
  });

  return nft;
};


exports.LinkTargetHash = function(link) {
  if(!link) { return; }

  if(link["."] && link["."].source) {
    return link["."].source;
  }

  if(link["/"] && link["/"].startsWith("/qfab/")) {
    return link["/"].split("/").find(segment => segment.startsWith("hq__"));
  }

  if(link["."] && link["."].container) {
    return link["."].container;
  }
};

