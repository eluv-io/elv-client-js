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
  name: "ArgAssetMetadata",
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

  const backupName = (oldPublicMetadata, backupNameSuffix) => {
    const oldAssetMetadata = oldPublicMetadata.asset_metadata || {};
    return title({oldAssetMetadata})
      ? backupNameSuffix
        ? `${title({oldAssetMetadata})} ${backupNameSuffix}`
        : title({oldAssetMetadata})
      : undefined;
  };

  // -------------------------------------
  // public interface methods
  // -------------------------------------

  // oldAssetMetadata == pre-existing value stored under /public/asset_metadata/
  const displayTitle = ({oldAssetMetadata = {}}) => args.displayTitle
    || assetMetadataArgField("display_title")
    || oldAssetMetadata.display_title
    || title({oldAssetMetadata});

  // oldAssetMetadata == pre-existing value stored under /public/asset_metadata/
  const ipTitleId = ({oldAssetMetadata = {}}) => args.ipTitleId
    || assetMetadataArgField("ip_title_id")
    || oldAssetMetadata.ip_title_id
    || slug({oldAssetMetadata});

  // ** NOTE: this function takes value under /public/, e.g. {asset_metadata:{...}, name: "existing_name"}
  const name = ({oldPublicMetadata = {}, backupNameSuffix}) => args.name
    || assetMetadataArgField("name")
    || oldPublicMetadata.name
    || backupName(oldPublicMetadata, backupNameSuffix);

  // ** NOTE: this function takes value under /public/, e.g. {asset_metadata:{...}, name: "existing_name"}
  const publicMetadata = ({oldPublicMetadata = {}, backupNameSuffix}) => {
    const oldAssetMetadata = oldPublicMetadata.asset_metadata || {};

    const itemsToMerge = {
      asset_metadata: {
        title: title({oldAssetMetadata}),
        display_title: displayTitle({oldAssetMetadata}),
        slug: slug({oldAssetMetadata}),
        ip_title_id: ipTitleId({oldAssetMetadata}),
        ...assetMetadataCustomFields()
      },
      name: name({oldPublicMetadata, backupNameSuffix})
    };
    return R.mergeDeepRight(oldPublicMetadata, itemsToMerge);
  };
  
  // oldAssetMetadata == pre-existing value stored under /public/asset_metadata/
  const slug = ({oldAssetMetadata = {}}) => args.slug
    || assetMetadataArgField("slug")
    || oldAssetMetadata.slug
    || slugify(displayTitle({oldAssetMetadata}));

  // oldAssetMetadata == pre-existing value stored under /public/asset_metadata/
  const title = ({oldAssetMetadata = {}}) => {
    const t = args.title
      || assetMetadataArgField("title")
      || oldAssetMetadata.title;
    try {
      NonBlankString(t);
    } catch(e) {
      throw Error("--title not supplied and could not determine from other args or existing object");
    }
    return t;
  };

  // instance interface
  return {
    displayTitle,
    ipTitleId,
    name,
    publicMetadata,
    slug,
    title
  };
};

module.exports = {
  blueprint,
  New
};