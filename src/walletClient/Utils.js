const Utils = require("../Utils");

const RarityToPercentage = (rarity) => {
  if(!rarity) {
    return "";
  }

  rarity = rarity.toString();

  if(!rarity.includes("/")) {
    return rarity;
  }

  const [ numerator, denominator ] = rarity.split("/");
  let percentage = 100 * parseInt(numerator) / parseInt(denominator);

  if(percentage < 1) {
    percentage = percentage.toFixed(2);
  } else {
    percentage = percentage.toFixed(1).toString().replace(".0", "");
  }

  return percentage;
};

// Format NFT or listing result into consistent format
const FormatNFTDetails = function(entry) {
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

exports.FormatNFTDetails = FormatNFTDetails;


const FormatNFTMetadata = function(nft) {
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

exports.FormatNFTMetadata = FormatNFTMetadata;

exports.FormatNFT = function (item) {
  return FormatNFTMetadata(FormatNFTDetails(item));
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

// https://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
const Popup = ({url, title, w, h}) => {
  // Fixes dual-screen position
  const dualScreenLeft = window.screenLeft || window.screenX;
  const dualScreenTop = window.screenTop || window.screenY;

  const width = window.innerWidth || document.documentElement.clientWidth || screen.width;
  const height = window.innerHeight || document.documentElement.clientHeight || screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;
  const newWindow = window.open(url, title,
    `
      width=${w / systemZoom},
      height=${h / systemZoom},
      top=${top},
      left=${left}
    `
  );

  if(window.focus) newWindow.focus();

  return newWindow;
};

exports.ActionPopup = async ({mode="tab", url, onMessage, onCancel}) => {
  await new Promise(resolve => {
    const newWindow = mode === "popup" ?
      Popup({url, title: "Eluvio Media Wallet", w: 500, h: 850}) :
      window.open(url);

    const closeCheck = setInterval(async () => {
      if(newWindow.closed) {
        clearInterval(closeCheck);

        if(onCancel) {
          await onCancel();
        }

        resolve();
      }
    }, 500);

    window.addEventListener("message", async event => {
      await onMessage(
        event,
        () => {
          clearInterval(closeCheck);
          newWindow.close();
          resolve();
        }
      );
    });
  });
};
