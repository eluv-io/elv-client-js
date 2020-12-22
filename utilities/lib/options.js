const R = require("ramda");
const subst = require("./stringTemplate");

// return desc string created by doing var substitution on descTemplate
const descString = optionSpec => {
  const descTemplate = optionSpec.descTemplate || "";
  const forX = optionSpec.forX ? ` for ${optionSpec.forX}` : null;
  const ofX = optionSpec.ofX ? ` of ${optionSpec.ofX}` : null;
  const X = optionSpec.X ? ` ${optionSpec.X}` : null;
  const finalX = forX || ofX || X || "";
  return subst({X: finalX}, descTemplate);
};

// convert camelCase to kebab-case
const camel2kebab = s => {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, "$1-$2")
    .toLowerCase();
};

// Commonly used options (shared by more than one script)

const optionSpecs = {
  assetMetadata: {
    coerce: (arg) => {
      if(arg.constructor.name === "Object") {
        return arg;
      } else {
        throw Error("--assetMetadata must be used with a .FIELD_NAME suffix, e.g.: --assetMetadata.catalog_id movie12345");
      }
    },
    descTemplate: "Additional asset metadata fields: use --assetMetadata.FIELD_NAME to specify each, e.g. --assetMetadata.catalog_id movie12345 --assetMetadata.imdb_title_id tt00000",
    group: "Asset"
  },

  configUrl: {
    descTemplate: "URL to query for Fabric configuration, enclosed in quotes - e.g. for Eluvio demo network: --configUrl \"https://demov3.net955210.contentfabric.io/config\"",
    group: "API",
    type: "string"
  },

  credentials: {
    descTemplate: "Path to JSON file containing credential sets for files stored in cloud",
    group: "Cloud",
    normalize: true,
    type: "string"
  },

  debug: {
    descTemplate: "Print debug logging for API calls",
    group: "API",
    type: "boolean"
  },

  description: {
    descTemplate: "Description{X}",
    type: "string"
  },

  displayTitle: {
    descTemplate: "Display title{X} (set to title if not specified)",
    group: "Asset",
    type: "string"
  },

  encrypt: {
    descTemplate: "Encrypt{X}",
    type: "boolean"
  },

  elvGeo: {
    choices: ["as-east", "au-east", "eu-east", "eu-west", "na-east", "na-west-north", "na-west-south"],
    descTemplate: "Geographic region for the fabric nodes.",
    group: "API",
    type: "string"
  },

  files: {
    descTemplate: "List of files{X}, separated by spaces.",
    string: true,
    type: "array"
  },

  help: {
    descTemplate: "Show help",
    group: "General",
    type: "boolean"
  },

  ipTitleId: {
    descTemplate: "Internal title/asset ID{X} (equivalent to slug if not specified)",
    group: "Asset",
    type: "string"
  },

  json: {
    descTemplate: "Output results in JSON format",
    group: "Logging",
    type: "boolean"
  },

  kmsId: {
    descTemplate: "ID of the KMS to use{X}. If not specified, the default KMS will be used.",
    type: "string"
  },

  libraryId: {
    descTemplate: "Library ID{X} (should start with 'ilib')",
    type: "string"
  },

  metadata: {
    descTemplate: "JSON string (or file path if prefixed with '@') to merge into metadata{X}",
    type: "string"
  },

  name: {
    descTemplate: "Name{X}",
    type: "string"
  },

  objectId: {
    descTemplate: "Name{X}",
    type: "string"
  },

  offeringKey: {
    default: "default",
    descTemplate: "Offering key{X}",
    type: "string"
  },

  slug: {
    descTemplate: "Slug for asset (generated based on title if not specified)",
    group: "Asset",
    type: "string"
  },

  streams: {
    descTemplate: "JSON string (or file path if prefixed with '@') containing stream specifications{X}",
    type: "string"
  },

  s3Copy: {
    conflicts: "s3-reference",
    descTemplate: "If specified, files will be copied from an S3 bucket instead of uploaded from the local filesystem",
    group: "Cloud",
    type: "boolean"
  },

  s3Reference: {
    conflicts: ["s3-copy", "encrypt"],
    descTemplate: "If specified, files will be referenced as links to an S3 bucket instead of copied to fabric",
    group: "Cloud",
    type: "boolean"
  },

  timestamps: {
    descTemplate: "Prefix log messages with timestamps",
    group: "Logging",
    type: "boolean"
  },

  title: {
    descTemplate: "Title of asset",
    group: "Asset",
    type: "string"
  },

  type: {
    descTemplate: "Name, object ID, or version hash of content type{X}",
    type: "string"
  },

  variantKey: {
    descTemplate: "Variant key{X}",
    default: "default",
    type: "string"
  }
};


// Creates a function for the option.
// Invoke the returned function with {forX: "description modifier", ...any additional or replacement attributes}
const optionFactory = (spec, name) => {
  return (modifiers = {}) => {
    // copy name to object body for convenience, apply any overrides
    let revisedSpec = R.mergeAll([
      {name},
      spec,
      modifiers
    ]);

    // create description from descTemplate, substituting {forX, ofX} if needed
    revisedSpec.desc = descString(revisedSpec);

    // add alias if option is camel-cased
    const kebabCase = camel2kebab(name);
    if(kebabCase !== name) {
      if(revisedSpec.alias) {
        revisedSpec.alias = R.uniq([revisedSpec.alias, kebabCase].flat());
      } else {
        revisedSpec.alias = kebabCase;
      }
    }

    // add string: true if type == "string"
    if(revisedSpec.type === "string") {
      revisedSpec.string = true;
    }

    if(revisedSpec.group) {
      // if group: exists, convert to "Options: (group_name)"
      revisedSpec.group = `Options: (${revisedSpec.group})`;
    } else {
      // otherwise set to "Options: (Main)"
      revisedSpec.group = "Options: (Main)";
    }

    // set requiresArg if not boolean
    if(revisedSpec.type !== "boolean") {
      revisedSpec.requiresArg = true;
    }

    return {[name]: revisedSpec};
  };
};

const comp = (a, b) => {
  return a < b
    ? -1
    : a > b
      ? 1
      : 0;
};

// Used to sort [name, spec] pairs
// Forces "Options: (Main)" group to be last
const compareOptionKVPairs = (a, b) => {
  const aName = a[0].toUpperCase();
  const bName = b[0].toUpperCase();

  const aGroup = a[1].group === "Options: (Main)"
    ? "Z"
    : a[1].group.toUpperCase();

  const bGroup = b[1].group === "Options: (Main)"
    ? "Z"
    : b[1].group.toUpperCase();

  return aGroup === bGroup
    ? comp(aName, bName) // both are in same group, sort by arg name
    : comp(aGroup, bGroup); // they are in different groups, sort by group name
};

// create a new object with properties added in an order which alphabetizes by group
// then arg name, with "Options (Main)" last
const sortOptions = R.pipe(
  R.toPairs,
  R.sort(compareOptionKVPairs),
  R.fromPairs);

// convert specs to collection of functions
const opts = R.mapObjIndexed(optionFactory, optionSpecs);

// combine an array of option specs into a single item (later elements overwrite options with same name in earlier elements)
const composeOpts = (...args) => sortOptions(R.mergeAll(args));

const newOpt = (name, spec) => optionFactory(spec, name)();

module.exports = {
  composeOpts,
  newOpt,
  opts
};