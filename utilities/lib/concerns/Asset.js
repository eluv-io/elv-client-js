const getProp = require("crocks/Maybe/getProp");
const kindOf = require("kind-of");
const R = require("ramda");
const slugify = require("@sindresorhus/slugify");

const {throwError} = require("../helpers");
const {NonBlankString} = require("../models/Models");
const {NewOpt, StdOpt} = require("../options");

const coerceAssetMetadata = arg => kindOf(arg) === "object"
  ? arg
  : throwError("--assetMetadata must be used with a .FIELD_NAME suffix, e.g.: --assetMetadata.catalog_id movie12345");

const blueprint = {
  name: "Asset",
  options: [
    NewOpt("assetMetadata", {
      coerce: coerceAssetMetadata,
      descTemplate: "Additional asset metadata fields: use --assetMetadata.FIELD_NAME to specify each, e.g. --assetMetadata.catalog_id movie12345 --assetMetadata.imdb_title_id tt00000",
      group: "Asset"
    }),
    NewOpt("displayTitle", {
      descTemplate: "Display title{X} (set to title if not specified)",
      group: "Asset",
      type: "string"
    }),
    NewOpt("ipTitleId", {
      descTemplate: "Internal title/asset ID{X} (equivalent to slug if not specified)",
      group: "Asset",
      type: "string"
    }),
    StdOpt("name", {
      descTemplate: "Object name (derived from ipTitleId and title if not specified)",
      group: "Asset"
    }),
    NewOpt("slug", {
      descTemplate: "Slug for asset (generated based on title if not specified)",
      group: "Asset",
      type: "string"
    }),
    NewOpt("title", {
      descTemplate: "Title of asset",
      group: "Asset",
      type: "string"
    })
  ]
};

const New = (context) => {
  // -------------------------------------
  // closures
  // -------------------------------------
  const args = context.args;

  // -------------------------------------
  // private utility methods
  // -------------------------------------

  const assetMetadataArgField = fieldName => getProp(fieldName, args.assetMetadata).option(undefined);

  const assetMetadataCustomFields = () => R.omit(
    [
      "display_title",
      "ip_title_id",
      "slug",
      "title"
    ],
    args.assetMetadata || {}
  );

  const backupName = (existingPublicMetadata, backupNameSuffix) => {
    const existingAssetMetadata = existingPublicMetadata.asset_metadata || {};
    return title(existingAssetMetadata)
      ? backupNameSuffix
        ? `${title(existingAssetMetadata)} ${backupNameSuffix}`
        : title(existingAssetMetadata)
      : undefined;
  };

  // -------------------------------------
  // interface: Asset
  // -------------------------------------

  // existingAssetMetadata == pre-existing value stored under /public/asset_metadata/
  const displayTitle = (existingAssetMetadata = {}) => args.displayTitle
    || assetMetadataArgField("display_title")
    || existingAssetMetadata.display_title
    || title(existingAssetMetadata);

  // existingAssetMetadata == pre-existing value stored under /public/asset_metadata/
  const ipTitleId = (existingAssetMetadata = {}) => args.ipTitleId
    || assetMetadataArgField("ip_title_id")
    || existingAssetMetadata.ip_title_id
    || slug(existingAssetMetadata);

  // ** NOTE: this function takes value under /public/, e.g. {asset_metadata:{...}, name: "existing_name"}
  const name = (existingPublicMetadata = {}, backupNameSuffix) => args.name
    || assetMetadataArgField("name")
    || existingPublicMetadata.name
    || backupName(existingPublicMetadata, backupNameSuffix);

  // existingAssetMetadata == pre-existing value stored under /public/asset_metadata/
  const slug = (existingAssetMetadata = {}) => args.slug
    || assetMetadataArgField("slug")
    || existingAssetMetadata.slug
    || slugify(displayTitle(existingAssetMetadata));

  // existingAssetMetadata == pre-existing value stored under /public/asset_metadata/
  const title = (existingAssetMetadata = {}) => {
    const t = args.title
      || assetMetadataArgField("title")
      || existingAssetMetadata.title;
    try {
      NonBlankString(t);
    } catch(e) {
      throw Error("--title not supplied and could not determine from other args or existing object");
    }
    return t;
  };

  // ** NOTE: this function takes value under /public/, e.g. {asset_metadata:{...}, name: "existing_name"}
  const publicMetadata = (existingPublicMetadata = {}, backupNameSuffix) => {
    const existingAssetMetadata = existingPublicMetadata.asset_metadata || {};

    const itemsToMerge = {
      asset_metadata: {
        title: title(existingAssetMetadata),
        display_title: displayTitle(existingAssetMetadata),
        slug: slug(existingAssetMetadata),
        ip_title_id: ipTitleId(existingAssetMetadata),
        ...assetMetadataCustomFields()
      },
      name: name(existingPublicMetadata, backupNameSuffix)
    };
    return R.mergeDeepRight(existingPublicMetadata, itemsToMerge);
  };

  return {displayTitle, ipTitleId, name, publicMetadata, slug, title};
};

module.exports = {blueprint, New};