/**
 * Methods for accessing content types, libraries and objects
 *
 * @module ElvClient/ContentAccess
 */

const UrlJoin = require("url-join");

const HttpClient = require("../HttpClient");
const Crypto = require("../Crypto");

const {
  ValidateLibrary,
  ValidateObject,
  ValidateVersion,
  ValidatePartHash,
  ValidateWriteToken,
  ValidateParameters
} = require("../Validation");


exports.Visibility = async function({id}) {
  try {
    const address = this.utils.HashToAddress(id);

    if(!this.visibilityInfo[address]) {
      // eslint-disable-next-line no-unreachable
      const hasVisibility = await this.authClient.ContractHasMethod({
        contractAddress: address,
        methodName: "visibility"
      });

      if(!hasVisibility) {
        return 1;
      }

      this.visibilityInfo[address] = await this.CallContractMethod({
        contractAddress: this.utils.HashToAddress(id),
        methodName: "visibility"
      });
    }

    return this.visibilityInfo[address];
  // eslint-disable-next-line no-unreachable
  } catch(error) {
    if(error.code === "CALL_EXCEPTION") {
      return 0;
    }

    throw error;
  }
};

/* Content Spaces */

/**
 * Get the address of the default KMS of the content space
 *
 * @methodGroup Content Space
 *
 * @returns {Promise<string>} - Address of the KMS
 */
exports.DefaultKMSAddress = async function() {
  return await this.CallContractMethod({
    contractAddress: this.contentSpaceAddress,
    methodName: "addressKMS",
  });
};

/**
 * Get the ID of the current content space
 *
 * @methodGroup Content Space
 *
 * @return {string} contentSpaceId - The ID of the current content space
 */
exports.ContentSpaceId = function() {
  return this.contentSpaceId;
};


/* Content Types */

/**
 * Returns the address of the owner of the specified content type
 *
 * @methodGroup Content Types
 * @namedParams
 * @param {string=} name - Name of the content type to find
 * @param {string=} typeId - ID of the content type to find
 * @param {string=} versionHash - Version hash of the content type to find
 *
 * @returns {Promise<string>} - The account address of the owner
 */
exports.ContentTypeOwner = async function({name, typeId, versionHash}) {
  const contentType = await this.ContentType({name, typeId, versionHash});

  return this.utils.FormatAddress(
    await this.ethClient.CallContractMethod({
      contractAddress: this.utils.HashToAddress(contentType.id),
      methodName: "owner",
      methodArgs: []
    })
  );
};

/**
 * Find the content type accessible to the current user by name, ID, or version hash
 *
 * @methodGroup Content Types
 * @namedParams
 * @param {string=} name - Name of the content type to find
 * @param {string=} typeId - ID of the content type to find
 * @param {string=} versionHash - Version hash of the content type to find
 * @param {boolean=} publicOnly=false - If specified, will only retrieve public metadata (no access request needed)
 *
 * @return {Promise<Object>} - The content type, if found
 */
exports.ContentType = async function({name, typeId, versionHash, publicOnly=false}) {
  this.Log(`Retrieving content type: ${name || typeId || versionHash}`);

  if(versionHash) { typeId = this.utils.DecodeVersionHash(versionHash).objectId; }

  if(name) {
    this.Log("Looking up type by name in content space metadata...");
    // Look up named type in content space metadata
    typeId = await this.ContentObjectMetadata({
      libraryId: this.contentSpaceLibraryId,
      objectId: this.contentSpaceObjectId,
      metadataSubtree: UrlJoin("contentTypes", name)
    });
  }

  if(!typeId) {
    this.Log("Looking up type by name in available types...");
    const types = await this.ContentTypes();

    if(name) {
      return Object.values(types).find(type => (type.name || "").toLowerCase() === name.toLowerCase());
    } else {
      return Object.values(types).find(type => type.hash === versionHash);
    }
  }

  if(!versionHash) {
    versionHash = await this.LatestVersionHash({objectId: typeId});
  }

  try {
    this.Log("Looking up type by ID...");

    let metadata;
    if(publicOnly) {
      metadata = {
        public: (await this.ContentObjectMetadata({
          libraryId: this.contentSpaceLibraryId,
          objectId: typeId,
          metadataSubtree: "public"
        })) || {}
      };
    } else {
      metadata = (await this.ContentObjectMetadata({
        libraryId: this.contentSpaceLibraryId,
        objectId: typeId
      })) || {};
    }

    return {
      id: typeId,
      hash: versionHash,
      name: (metadata.public && metadata.public.name) || metadata.name || typeId,
      meta: metadata
    };
  } catch(error) {
    this.Log("Error looking up content type:");
    this.Log(error);
    throw new Error(`Content Type ${name || typeId} is invalid`);
  }
};

/**
 * List all content types accessible to this user.
 *
 * @methodGroup Content Types
 * @namedParams
 *
 * @return {Promise<Object>} - Available content types
 */
exports.ContentTypes = async function() {
  this.contentTypes = this.contentTypes || {};

  this.Log("Looking up all available content types");

  // Personally available types
  let typeAddresses = await this.Collection({collectionType: "contentTypes"});

  this.Log("Personally available types:");
  this.Log(typeAddresses);

  // Content space types
  const contentSpaceTypes = await this.ContentObjectMetadata({
    libraryId: this.contentSpaceLibraryId,
    objectId: this.contentSpaceObjectId,
    metadataSubtree: "public/contentTypes"
  }) || {};

  const contentSpaceTypeAddresses = Object.values(contentSpaceTypes)
    .map(typeId => this.utils.HashToAddress(typeId));

  this.Log("Content space types:");
  this.Log(contentSpaceTypeAddresses);

  typeAddresses = typeAddresses
    .concat(contentSpaceTypeAddresses)
    .filter(address => address)
    .map(address => this.utils.FormatAddress(address))
    .filter((v, i, a) => a.indexOf(v) === i);

  await Promise.all(
    typeAddresses.map(async typeAddress => {
      const typeId = this.utils.AddressToObjectId(typeAddress);

      if(!this.contentTypes[typeId]) {
        try {
          this.contentTypes[typeId] = await this.ContentType({typeId, publicOnly: true});
        } catch(error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    })
  );

  return this.contentTypes;
};


/* Content Libraries */

/**
 * List content libraries - returns a list of content library IDs available to the current user
 *
 * @methodGroup Content Libraries
 *
 * @returns {Promise<Array<string>>}
 */
exports.ContentLibraries = async function() {
  const libraryAddresses = await this.Collection({collectionType: "libraries"});

  return libraryAddresses.map(address => this.utils.AddressToLibraryId(address));
};

/**
 * Returns information about the content library
 *
 * @methodGroup Content Libraries
 *
 * @namedParams
 * @param {string} libraryId
 *
 * @returns {Promise<Object>}
 */
exports.ContentLibrary = async function({libraryId}) {
  ValidateLibrary(libraryId);

  const path = UrlJoin("qlibs", libraryId);

  const library = await this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId}),
      method: "GET",
      path: path
    })
  );

  return {
    ...library,
    meta: library.meta || {}
  };
};

/**
 * Returns the address of the owner of the specified content library
 *
 * @methodGroup Content Libraries
 * @namedParams
 * @param {string} libraryId
 *
 * @returns {Promise<string>} - The account address of the owner
 */
exports.ContentLibraryOwner = async function({libraryId}) {
  ValidateLibrary(libraryId);

  return this.utils.FormatAddress(
    await this.ethClient.CallContractMethod({
      contractAddress: this.utils.HashToAddress(libraryId),
      methodName: "owner",
      methodArgs: []
    })
  );
};

/**
 * Retrieve the allowed content types for the specified library.
 *
 * Note: If no content types have been set on the library, all types are allowed, but an empty hash will be returned.
 *
 * @see <a href="#ContentTypes">ContentTypes</a>
 *
 * @methodGroup Content Libraries
 * @namedParams
 * @param {string} libraryId - ID of the library
 *
 * @returns {Promise<Object>} - List of accepted content types - return format is equivalent to ContentTypes method
 */
exports.LibraryContentTypes = async function({libraryId}) {
  ValidateLibrary(libraryId);

  this.Log(`Retrieving library content types for ${libraryId}`);

  const typesLength = (await this.ethClient.CallContractMethod({
    contractAddress: this.utils.HashToAddress(libraryId),
    methodName: "contentTypesLength",
    methodArgs: []
  })).toNumber();

  this.Log(`${typesLength} types`);

  // No allowed types set - any type accepted
  if(typesLength === 0) { return {}; }

  // Get the list of allowed content type addresses
  let allowedTypes = {};
  await Promise.all(
    Array.from(new Array(typesLength), async (_, i) => {
      const typeAddress = await this.ethClient.CallContractMethod({
        contractAddress: this.utils.HashToAddress(libraryId),
        methodName: "contentTypes",
        methodArgs: [i]
      });

      const typeId = this.utils.AddressToObjectId(typeAddress);
      allowedTypes[typeId] = await this.ContentType({typeId});
    })
  );

  this.Log(allowedTypes);

  return allowedTypes;
};


/* Content Objects */

/**
 * List content objects in the specified library
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {object=} filterOptions - Pagination, sorting and filtering options
 * @param {boolean=} filterOptions.latestOnly=true - If specified, only latest version of objects will be included
 * @param {number=} filterOptions.start - Start index for pagination
 * @param {number=} filterOptions.limit - Max number of objects to return
 * @param {string=} filterOptions.cacheId - Cache ID corresponding a previous query
 * @param {(Array<string> | string)=} filterOptions.sort - Sort by the specified key(s)
 * * @param {boolean=} filterOptions.sortDesc=false - Sort in descending order
 * @param {(Array<string> | string)=} filterOptions.select - Include only the specified metadata keys
 * @param {(Array<object> | object)=} filterOptions.filter - Filter objects by metadata
 * @param {string=} filterOptions.filter.key - Key to filter on
 * @param {string=} filterOptions.filter.type - Type of filter to use for the specified key:
 * - eq, neq, lt, lte, gt, gte, cnt (contains), ncnt (does not contain),
 * @param {string=} filterOptions.filter.filter - Filter for the specified key
 *
 * @returns {Promise<Array<Object>>} - List of objects in library
 */
exports.ContentObjects = async function({libraryId, filterOptions={}}) {
  ValidateLibrary(libraryId);

  this.Log(`Retrieving content objects from ${libraryId}`);

  let path = UrlJoin("qlibs", libraryId, "q");

  let queryParams = {
    filter: []
  };

  // Cache ID
  if(filterOptions.cacheId) {
    queryParams.cache_id = filterOptions.cacheId;
  }

  // Start index
  if(filterOptions.start) {
    queryParams.start = filterOptions.start;
  }

  // Limit
  if(filterOptions.limit) {
    queryParams.limit = filterOptions.limit;
  }

  // Metadata select options
  if(filterOptions.select) {
    queryParams.select = filterOptions.select;
  }

  // Sorting options
  if(filterOptions.sort) {
    // Sort keys
    queryParams.sort_by = filterOptions.sort;

    // Sort order
    if(filterOptions.sortDesc) {
      queryParams.sort_descending = true;
    }
  }

  if(filterOptions.latestOnly === false) {
    queryParams.latest_version_only = false;
  }

  // Filters
  const filterTypeMap = {
    eq: ":eq:",
    neq: ":ne:",
    lt: ":lt:",
    lte: ":le:",
    gt: ":gt:",
    gte: ":ge:",
    cnt: ":co:",
    ncnt: ":nc:"
  };

  const addFilter = ({key, type, filter}) => {
    queryParams.filter.push(`${key}${filterTypeMap[type]}${filter}`);
  };

  if(filterOptions.filter) {
    if(Array.isArray(filterOptions.filter)) {
      filterOptions.filter.forEach(filter => addFilter(filter));
    } else {
      addFilter(filterOptions.filter);
    }
  }

  this.Log("Filter options:");
  this.Log(filterOptions);

  return await this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId}),
      method: "GET",
      path: path,
      queryParams
    })
  );
};

/**
 * Get a specific content object in the library
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
 *
 * @returns {Promise<Object>} - Description of content object
 */
exports.ContentObject = async function({libraryId, objectId, versionHash}) {
  ValidateParameters({libraryId, objectId, versionHash});

  this.Log(`Retrieving content object: ${libraryId || ""} ${objectId || versionHash}`);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", versionHash || objectId);

  return await this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
      method: "GET",
      path: path
    })
  );
};

/**
 * Returns the address of the owner of the specified content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId
 *
 * @returns {Promise<string>} - The account address of the owner
 */
exports.ContentObjectOwner = async function({objectId}) {
  ValidateObject(objectId);

  this.Log(`Retrieving content object owner: ${objectId}`);

  return this.utils.FormatAddress(
    await this.ethClient.CallContractMethod({
      contractAddress: this.utils.HashToAddress(objectId),
      methodName: "owner",
      methodArgs: []
    })
  );
};

/**
 * Retrieve the library ID for the specified content object
 *
 * @methodGroup Content Objects
 *
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 *
 * @returns {Promise<string>} - Library ID of the object
 */
exports.ContentObjectLibraryId = async function({objectId, versionHash}) {
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  switch(await this.authClient.AccessType(objectId)) {
    case this.authClient.ACCESS_TYPES.LIBRARY:
      return this.utils.AddressToLibraryId(this.utils.HashToAddress(objectId));
    case this.authClient.ACCESS_TYPES.OBJECT:
      if(!this.objectLibraryIds[objectId]) {
        this.Log(`Retrieving content object library ID: ${objectId || versionHash}`);

        this.objectLibraryIds[objectId] = this.utils.AddressToLibraryId(
          await this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "libraryAddress"
          })
        );
      }

      return this.objectLibraryIds[objectId];
    default:
      return this.contentSpaceLibraryId;
  }
};

exports.ProduceMetadataLinks = async function({
  libraryId,
  objectId,
  versionHash,
  path="/",
  metadata
}) {
  // Primitive
  if(!metadata || typeof metadata !== "object") { return metadata; }

  // Array
  if(Array.isArray(metadata)) {
    return await this.utils.LimitedMap(
      5,
      metadata,
      async (entry, i) => await this.ProduceMetadataLinks({
        libraryId,
        objectId,
        versionHash,
        path: UrlJoin(path, i.toString()),
        metadata: entry
      })
    );
  }

  // Object
  if(metadata["/"] &&
    (metadata["/"].match(/\.\/(rep|files)\/.+/) ||
      metadata["/"].match(/^\/?qfab\/([\w]+)\/?(rep|files)\/.+/)))
  {
    // Is file or rep link - produce a url
    return {
      ...metadata,
      url: await this.LinkUrl({libraryId, objectId, versionHash, linkPath: path})
    };
  }

  let result = {};
  await this.utils.LimitedMap(
    5,
    Object.keys(metadata),
    async key => {
      result[key] = await this.ProduceMetadataLinks({
        libraryId,
        objectId,
        versionHash,
        path: UrlJoin(path, key),
        metadata: metadata[key]
      });
    }
  );

  return result;
};

/**
 * Get the metadata of a content object
 *
 * @methodGroup Metadata
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
 * @param {string=} writeToken - Write token of an object draft - if specified, will read metadata from the draft
 * @param {string=} metadataSubtree - Subtree of the object metadata to retrieve
 * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
 * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata

   Example:
       {
          "resolved-link": {
            ".": {
              "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
            },
            ...
          }
       }

 * @param {boolean=} produceLinkUrls=false - If specified, file and rep links will automatically be populated with a
 * full URL
 * @param {boolean=} noAuth=false - If specified, authorization will not be performed for this call
 *
 * @returns {Promise<Object | string>} - Metadata of the content object
 */
exports.ContentObjectMetadata = async function({
  libraryId,
  objectId,
  versionHash,
  writeToken,
  metadataSubtree="/",
  resolveLinks=false,
  resolveIncludeSource=false,
  produceLinkUrls=false
}) {
  ValidateParameters({libraryId, objectId, versionHash});

  this.Log(
    `Retrieving content object metadata: ${libraryId || ""} ${objectId || versionHash} ${writeToken || ""}
       Subtree: ${metadataSubtree}`
  );

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", writeToken || versionHash || objectId, "meta", metadataSubtree);

  let metadata;
  try {
    const visibility = await this.Visibility({id: objectId});
    const noAuth = visibility >= 10 ||
      ((metadataSubtree || "").replace(/^\/+/, "").startsWith("public") && visibility >= 1);

    metadata = await this.utils.ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, noAuth}),
        queryParams: {
          resolve: resolveLinks,
          resolve_include_source: resolveIncludeSource
        },
        method: "GET",
        path: path
      })
    );
  } catch(error) {
    if(error.status !== 404) {
      throw error;
    }

    metadata = metadataSubtree === "/" ? {} : undefined;
  }

  if(!produceLinkUrls) { return metadata; }

  return await this.ProduceMetadataLinks({
    libraryId,
    objectId,
    versionHash,
    path: metadataSubtree,
    metadata
  });
};

/**
 * List the versions of a content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 *
 * @returns {Promise<Object>} - Response containing versions of the object
 */
exports.ContentObjectVersions = async function({libraryId, objectId}) {
  ValidateParameters({libraryId, objectId});

  this.Log(`Retrieving content object versions: ${libraryId || ""} ${objectId}`);

  let path = UrlJoin("qid", objectId);

  return this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
      method: "GET",
      path: path
    })
  );
};

/**
 * Retrieve the version hash of the latest version of the specified object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 *
 * @returns {Promise<string>} - The latest version hash of the object
 */
exports.LatestVersionHash = async function({objectId, versionHash}) {
  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  ValidateObject(objectId);

  return await this.CallContractMethod({
    contractAddress: this.utils.HashToAddress(objectId),
    methodName: "objectHash"
  });
};

/* URL Methods */

/**
 * Determine available DRM types available in this browser environment.
 *
 * @methodGroup Media
 * @return {Promise<Array<string>>}
 */
exports.AvailableDRMs = async function() {
  const availableDRMs = ["clear", "aes-128"];

  if(!window) {
    return availableDRMs;
  }

  if(typeof window !== "undefined" && typeof window.navigator.requestMediaKeySystemAccess !== "function") {
    return availableDRMs;
  }

  try {
    const config = [{
      initDataTypes: ["cenc"],
      audioCapabilities: [{
        contentType: "audio/mp4;codecs=\"mp4a.40.2\""
      }],
      videoCapabilities: [{
        contentType: "video/mp4;codecs=\"avc1.42E01E\""
      }]
    }];

    await navigator.requestMediaKeySystemAccess("com.widevine.alpha", config);

    availableDRMs.push("widevine");
    // eslint-disable-next-line no-empty
  } catch(e) {}

  return availableDRMs;
};

exports.AudienceData = function({objectId, versionHash, protocols=[], drms=[]}) {
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  this.Log(`Retrieving audience data: ${objectId}`);

  let data = {
    user_address: this.utils.FormatAddress(this.signer.address),
    content_id: objectId || this.utils.DecodeVersionHash(versionHash).id,
    content_hash: versionHash,
    hostname: this.HttpClient.BaseURI().hostname(),
    access_time: Math.round(new Date().getTime()).toString(),
    format: protocols.join(","),
    drm: drms.join(",")
  };

  if(typeof window !== "undefined" && window.navigator) {
    data.user_string = window.navigator.userAgent;
    data.language = window.navigator.language;
  }

  this.Log(data);

  return data;
};

/**
 * Retrieve playout options for the specified content that satisfy the given protocol and DRM requirements
 *
 * The root level playoutOptions[protocol].playoutUrl and playoutOptions[protocol].drms will contain playout
 * information that satisfies the specified DRM requirements (if possible), while playoutOptions[protocol].playoutMethods
 * will contain all available playout options for this content.
 *
 * If only objectId is specified, latest version will be played. To retrieve playout options for
 * a specific version of the content, provide the versionHash parameter (in which case objectId is unnecessary)
 *
 * @methodGroup Media
 * @namedParams
 * @param {string=} objectId - Id of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {Array<string>} protocols=["dash", "hls"] - Acceptable playout protocols ("dash", "hls")
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "widevine")
 * @param {string=} offering=default - The offering to play
 */
exports.PlayoutOptions = async function({
  objectId,
  versionHash,
  linkPath,
  protocols=["dash", "hls"],
  offering="default",
  drms=[],
  hlsjsProfile=true
}) {
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  protocols = protocols.map(p => p.toLowerCase());
  drms = drms.map(d => d.toLowerCase());

  if(!objectId) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  }

  const libraryId = await this.ContentObjectLibraryId({objectId});

  let path, linkTargetLibraryId, linkTargetId, linkTargetHash;
  if(linkPath) {
    linkTargetHash = await this.LinkTarget({libraryId, objectId, versionHash, linkPath});
    linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
    linkTargetLibraryId = await this.ContentObjectLibraryId({objectId: linkTargetId});
    path = UrlJoin("q", versionHash || objectId, "meta", linkPath);
  } else {
    path = UrlJoin("q", versionHash || objectId, "rep", "playout", offering, "options.json");
  }

  const audienceData = this.AudienceData({
    objectId: linkTargetId || objectId,
    versionHash: linkTargetHash || versionHash || await this.LatestVersionHash({objectId}),
    protocols,
    drms
  });

  // Add authorization token to playout URLs
  let queryParams = {
    authorization: await this.authClient.AuthorizationToken({
      libraryId: linkTargetLibraryId || libraryId,
      objectId: linkTargetId || objectId,
      channelAuth: true,
      oauthToken: this.oauthToken,
      audienceData
    })
  };

  if(linkPath) {
    queryParams.resolve = true;
  }

  const playoutOptions = Object.values(
    await this.utils.ResponseToJson(
      this.HttpClient.Request({
        path: path,
        method: "GET",
        queryParams
      })
    )
  );

  let playoutMap = {};
  for(let i = 0; i < playoutOptions.length; i++) {
    const option = playoutOptions[i];
    const protocol = option.properties.protocol;
    const drm = option.properties.drm;
    // Remove authorization parameter from playout path - it's re-added by Rep
    const playoutPath = option.uri.split("?")[0];
    const licenseServers = option.properties.license_servers;

    // Create full playout URLs for this protocol / drm combo
    playoutMap[protocol] = {
      ...(playoutMap[protocol] || {}),
      playoutMethods: {
        ...((playoutMap[protocol] || {}).playoutMethods || {}),
        [drm || "clear"]: {
          playoutUrl: await this.Rep({
            libraryId: linkTargetLibraryId || libraryId,
            objectId: linkTargetId || objectId,
            versionHash: linkTargetHash || versionHash,
            rep: UrlJoin("playout", offering, playoutPath),
            channelAuth: true,
            queryParams: hlsjsProfile && protocol === "hls" ? {player_profile: "hls-js"} : {}
          }),
          drms: drm ? {[drm]: {licenseServers}} : undefined
        }
      }
    };

    // Exclude any options that do not satisfy the specified protocols and/or DRMs
    const protocolMatch = protocols.includes(protocol);
    const drmMatch = drms.includes(drm || "clear") || (drms.length === 0 && !drm);
    if(!protocolMatch || !drmMatch) {
      continue;
    }

    // This protocol / DRM satisfies the specifications (prefer DRM over clear, if available)
    if(!playoutMap[protocol].playoutUrl || (drm && drm !== "clear")) {
      playoutMap[protocol].playoutUrl = playoutMap[protocol].playoutMethods[drm || "clear"].playoutUrl;
      playoutMap[protocol].drms = playoutMap[protocol].playoutMethods[drm || "clear"].drms;
    }
  }

  this.Log(playoutMap);

  return playoutMap;
};

/**
 * Retrieve playout options in BitMovin player format for the specified content that satisfy
 * the given protocol and DRM requirements
 *
 * If only objectId is specified, latest version will be played. To retrieve playout options for
 * a specific version of the content, provide the versionHash parameter (in which case objectId is unnecessary)
 *
 * @methodGroup Media
 * @namedParams
 * @param {string=} objectId - Id of the content
 * @param {string} versionHash - Version hash of the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {Array<string>} protocols=["dash", "hls"] - Acceptable playout protocols ("dash", "hls")
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "widevine")
 * @param {string=} offering=default - The offering to play
 */
exports.BitmovinPlayoutOptions = async function({
  objectId,
  versionHash,
  linkPath,
  protocols=["dash", "hls"],
  drms=[],
  offering="default"
}) {
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  if(!objectId) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  }

  const playoutOptions = await this.PlayoutOptions({
    objectId,
    versionHash,
    linkPath,
    protocols,
    drms,
    offering,
    hlsjsProfile: false
  });

  delete playoutOptions.playoutMethods;

  let linkTargetId, linkTargetHash;
  if(linkPath) {
    const libraryId = await this.ContentObjectLibraryId({objectId, versionHash});
    linkTargetHash = await this.LinkTarget({libraryId, objectId, versionHash, linkPath});
    linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
  }

  const authToken = await this.authClient.AuthorizationToken({
    objectId: linkTargetId || objectId,
    channelAuth: true,
    oauthToken: this.oauthToken,
  });

  let config = {
    drm: {}
  };

  Object.keys(playoutOptions).forEach(protocol => {
    const option = playoutOptions[protocol];
    config[protocol] = option.playoutUrl;

    if(option.drms) {
      Object.keys(option.drms).forEach(drm => {
        // No license URL specified
        if(!option.drms[drm].licenseServers || option.drms[drm].licenseServers.length === 0) { return; }

        // Opt for https urls
        const filterHTTPS = uri => uri.toLowerCase().startsWith("https");
        let licenseUrls = option.drms[drm].licenseServers;
        if(licenseUrls.find(filterHTTPS)) {
          licenseUrls = licenseUrls.filter(filterHTTPS);
        }

        // Choose a random license server from the available list
        const licenseUrl = licenseUrls.sort(() => 0.5 - Math.random())[0];

        if(!config.drm[drm]) {
          config.drm[drm] = {
            LA_URL: licenseUrl,
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          };
        }
      });
    }
  });

  return config;
};

/**
 * Call the specified bitcode method on the specified object
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 * @param {string=} writeToken - Write token of an object draft - if calling bitcode of a draft object
 * @param {string} method - Bitcode method to call
 * @param {Object=} queryParams - Query parameters to include in the request
 * @param {Object=} body - Request body to include, if calling a non-constant method
 * @param {Object=} headers - Request headers to include
 * @param {boolean=} constant=true - If specified, a GET request authenticated with an AccessRequest will be made.
 * Otherwise, a POST with an UpdateRequest will be performed
 * @param {string=} format=json - The format of the response
 *
 * @returns {Promise<format>} - The response from the call in the specified format
 */
exports.CallBitcodeMethod = async function({
  libraryId,
  objectId,
  versionHash,
  writeToken,
  method,
  queryParams={},
  body={},
  headers={},
  constant=true,
  format="json"
}) {
  ValidateParameters({libraryId, objectId, versionHash});
  if(!method) { throw "Bitcode method not specified"; }

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", writeToken || versionHash || objectId, "call", method);

  if(libraryId) {
    path = UrlJoin("qlibs", libraryId, path);
  }

  let authHeader = headers.authorization || headers.Authorization;
  if(!authHeader) {
    headers.Authorization = (
      await this.authClient.AuthorizationHeader({
        libraryId,
        objectId,
        update: !constant
      })
    ).Authorization;
  }

  this.Log(
    `Calling bitcode method: ${libraryId || ""} ${objectId || versionHash} ${writeToken || ""}
      ${constant ? "GET" : "POST"} ${path}
      Query Params:
      ${queryParams}
      Body:
      ${body}
      Headers
      ${headers}`
  );

  return this.utils.ResponseToFormat(
    format,
    await this.HttpClient.Request({
      body,
      headers,
      method: constant ? "GET" : "POST",
      path,
      queryParams,
      failover: false
    })
  );
};

/**
 * Generate a URL to the specified /rep endpoint of a content object. URL includes authorization token.
 *
 * Alias for the FabricUrl method with the "rep" parameter
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 * @param {string} rep - Representation to use
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {boolean=} channelAuth=false - If specified, state channel authorization will be performed instead of access request authorization
 * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
 * token. This is useful for accessing public assets.
 * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
 * whether such a request exists in the client cache. This request will not be cached. This option has no effect if noAuth is true.
 *
 * @see <a href="#FabricUrl">FabricUrl</a> for creating arbitrary fabric URLs
 *
 * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
 */
exports.Rep = async function({libraryId, objectId, versionHash, rep, queryParams={}, channelAuth=false, noAuth=false, noCache=false}) {
  ValidateParameters({libraryId, objectId, versionHash});
  if(!rep) { throw "Rep not specified"; }

  return this.FabricUrl({libraryId, objectId, versionHash, rep, queryParams, channelAuth, noAuth, noCache});
};

/**
 * Generate a URL to the specified /public endpoint of a content object. URL includes authorization token.
 *
 * Alias for the FabricUrl method with the "rep" parameter
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 * @param {string} rep - Representation to use
 * @param {Object=} queryParams - Query params to add to the URL
 *
 * @see <a href="#FabricUrl">FabricUrl</a> for creating arbitrary fabric URLs
 *
 * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
 */
exports.PublicRep = async function({libraryId, objectId, versionHash, rep, queryParams={}}) {
  ValidateParameters({libraryId, objectId, versionHash});
  if(!rep) { throw "Rep not specified"; }

  return this.FabricUrl({libraryId, objectId, versionHash, publicRep: rep, queryParams, noAuth: true});
};

/**
 * Generate a URL to the specified item in the content fabric with appropriate authorization token.
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string=} writeToken - A write token for a draft of the object (requires libraryId)
 * @param {string=} partHash - Hash of a part - Requires object ID
 * @param {string=} rep - Rep parameter of the url
 * @param {string=} publicRep - Public rep parameter of the url
 * @param {string=} call - Bitcode method to call
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {boolean=} channelAuth=false - If specified, state channel authorization will be used instead of access request authorization
 * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
 * token. This is useful for accessing public assets.
 * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
 * whether such a request exists in the client cache. This request will not be cached. This option has no effect if noAuth is true.
 *
 * @returns {Promise<string>} - URL to the specified endpoint with authorization token
 */
exports.FabricUrl = async function({
  libraryId,
  objectId,
  versionHash,
  writeToken,
  partHash,
  rep,
  publicRep,
  call,
  queryParams={},
  channelAuth=false,
  noAuth=false,
  noCache=false
}) {
  if(objectId || versionHash) {
    ValidateParameters({libraryId, objectId, versionHash});
  }

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  this.Log(
    `Building Fabric URL:
      libraryId: ${libraryId}
      objectId: ${objectId}
      versionHash: ${versionHash}
      writeToken: ${writeToken}
      partHash: ${partHash}
      rep: ${rep}
      publicRep: ${publicRep}
      call: ${call}
      channelAuth: ${channelAuth}
      noAuth: ${noAuth}
      noCache: ${noCache}
      queryParams: ${JSON.stringify(queryParams || {}, null, 2)}`
  );

  // Clone queryParams to avoid modification of the original
  queryParams = {...queryParams};

  queryParams.authorization = await this.authClient.AuthorizationToken({libraryId, objectId, versionHash, channelAuth, noAuth, noCache});

  let path = "";
  if(libraryId) {
    path = UrlJoin(path, "qlibs", libraryId);

    if(objectId || versionHash) {
      path = UrlJoin(path, "q", writeToken || versionHash || objectId);
    }
  } else if(versionHash) {
    path = UrlJoin("q", versionHash);
  }

  if(partHash){
    path = UrlJoin(path, "data", partHash);
  } else if(rep) {
    path = UrlJoin(path, "rep", rep);
  } else if(publicRep) {
    path = UrlJoin(path, "public", publicRep);
  } else if(call) {
    path = UrlJoin(path, "call", call);
  }

  return this.HttpClient.URL({
    path,
    queryParams
  });
};

/**
 * Generate a URL to the specified content object file with appropriate authorization token.
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string=} writeToken - A write token for a draft of the object (requires libraryId)
 * @param {string} filePath - Path to the content object file
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
 * whether such a request exists in the client cache. This request will not be cached.
 *
 * @returns {Promise<string>} - URL to the specified file with authorization token
 */
exports.FileUrl = async function({libraryId, objectId, versionHash, writeToken, filePath, queryParams={}, noCache=false}) {
  ValidateParameters({libraryId, objectId, versionHash});
  if(!filePath) { throw "File path not specified"; }
  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path;

  if(libraryId) {
    path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash || objectId, "files", filePath);
  } else {
    path = UrlJoin("q", versionHash, "files", filePath);
  }

  const authorizationToken = await this.authClient.AuthorizationToken({libraryId, objectId, noCache});

  return this.HttpClient.URL({
    path: path,
    queryParams: {
      ...queryParams,
      authorization: authorizationToken
    }
  });
};

/**
 * Get the image URL for the specified object
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is used
 *
 * @returns {Promise<string | undefined>} - If the object has an image, will return a URL for that image.
 */
exports.ContentObjectImageUrl = async function({libraryId, objectId, versionHash}) {
  ValidateParameters({libraryId, objectId, versionHash});

  if(!versionHash) {
    versionHash = await this.LatestVersionHash({objectId});
  }

  this.Log(`Retrieving content object image url: ${libraryId} ${objectId} ${versionHash}`);

  if(!this.objectImageUrls[versionHash]) {
    const imageMetadata = await this.ContentObjectMetadata({versionHash, metadataSubtree: "public/display_image"});

    if(!imageMetadata) {
      this.Log(`No image url set: ${libraryId} ${objectId} ${versionHash}`);
      return;
    }

    this.objectImageUrls[versionHash] = await this.LinkUrl({
      versionHash,
      linkPath: "public/display_image"
    });
  }

  return this.objectImageUrls[versionHash];
};

/* Links */

/**
 * Get a specific content object in the library
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
 * @param {boolean=} autoUpdate=false - If true, lists only links marked as auto-update links
 * @param {(string | Array<string>)=} select - Limit metadata fields return in link details
 *
 * @returns {Promise<Object>} - Description of created object
 */
exports.ContentObjectGraph = async function({libraryId, objectId, versionHash, autoUpdate=false, select}) {
  ValidateParameters({libraryId, objectId, versionHash});

  this.Log(`Retrieving content object graph: ${libraryId || ""} ${objectId || versionHash}`);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", versionHash || objectId, "links");

  try {
    return await this.utils.ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, noAuth: true}),
        queryParams: {
          auto_update: autoUpdate,
          select
        },
        method: "GET",
        path: path
      })
    );
  } catch(error) {
    // If a cycle is present, do some work to present useful information about it
    let errorInfo;
    try {
      const cycles = error.body.errors[0].cause.cause.cause.cycle;

      if(!cycles || cycles.length === 0) { throw error; }

      let info = {};
      await Promise.all(
        cycles.map(async cycleHash => {
          if(info[cycleHash]) { return; }

          const cycleId = (this.utils.DecodeVersionHash(cycleHash)).objectId;
          const name = (
            await this.ContentObjectMetadata({versionHash: cycleHash, metadataSubtree: "public/asset_metadata/display_title"}) ||
            await this.ContentObjectMetadata({versionHash: cycleHash, metadataSubtree: "public/name"}) ||
            await this.ContentObjectMetadata({versionHash: cycleHash, metadataSubtree: "name"}) ||
            cycleId
          );

          info[cycleHash] = { name, objectId: cycleId };
        })
      );

      errorInfo = cycles.map(cycleHash => `${info[cycleHash].name} (${info[cycleHash].objectId})`);
    } catch(e) {
      throw error;
    }

    throw new Error(
      `Cycle found in links: ${errorInfo.join(" -> ")}`
    );
  }
};

/**
 * Retrieve the version hash of the specified link's target. If the target is the same as the specified
 * object and versionHash is not specified, will return the latest version hash.
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string} linkPath - Path to the content object link
 *
 * @returns {Promise<string>} - Version hash of the link's target
 */
exports.LinkTarget = async function({libraryId, objectId, versionHash, linkPath}) {
  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  const linkInfo = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    versionHash,
    metadataSubtree: UrlJoin(linkPath),
    resolveLinks: false
  });

  if(!linkInfo || !linkInfo["/"]) {
    throw Error(`No valid link at ${linkPath}`);
  }

  /* For absolute links - extract the hash from the link itself. Otherwise use "container" */
  let targetHash = ((linkInfo["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1];
  if(!targetHash) {
    targetHash = linkInfo["."].container;
  }

  if(targetHash) {
    return targetHash;
  } else if(versionHash) {
    return versionHash;
  }

  // Link points to this object - get latest version
  return await this.LatestVersionHash({objectId});
};

/**
 * Generate a URL to the specified file link with appropriate authentication
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string} linkPath - Path to the content object link
 * @param {string=} mimeType - Mime type to use when rendering the file
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
 * whether such a request exists in the client cache. This request will not be cached.
 *
 * @returns {Promise<string>} - URL to the specified file with authorization token
 */
exports.LinkUrl = async function({libraryId, objectId, versionHash, linkPath, mimeType, queryParams={}, noCache=false}) {
  ValidateParameters({libraryId, objectId, versionHash});

  if(!linkPath) { throw Error("Link path not specified"); }

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path;
  if(libraryId) {
    path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, "meta", linkPath);
  } else {
    path = UrlJoin("q", versionHash, "meta", linkPath);
  }

  const visibility = await this.Visibility({id: objectId});
  const noAuth = visibility >= 10 ||
    ((linkPath || "").replace(/^\/+/, "").startsWith("public") && visibility >= 1);

  queryParams = {
    ...queryParams,
    resolve: true,
    authorization: await this.authClient.AuthorizationToken({libraryId, objectId, noCache, noAuth})
  };

  if(mimeType) { queryParams["header-accept"] = mimeType; }

  return this.HttpClient.URL({
    path: path,
    queryParams
  });
};

/**
 * Retrieve the data at the specified link in the specified format
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string} linkPath - Path to the content object link
 * @param {string=} format=json - Format of the response
 */
exports.LinkData = async function({libraryId, objectId, versionHash, linkPath, format="json"}) {
  const linkUrl = await this.LinkUrl({libraryId, objectId, versionHash, linkPath});

  return this.utils.ResponseToFormat(
    format,
    await HttpClient.Fetch(linkUrl)
  );
};


/* Encryption */

/**
 * Retrieve the encryption conk for the specified object. If one has not yet been created
 * and a writeToken has been specified, this method will create a new conk and
 * save it to the draft metadata
 *
 * @methodGroup Encryption
 *
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string=} writeToken - Write token of the content object draft
 *
 * @return Promise<Object> - The encryption conk for the object
 */
exports.EncryptionConk = async function({libraryId, objectId, writeToken}) {
  ValidateParameters({libraryId, objectId});
  if(writeToken) { ValidateWriteToken(writeToken); }

  const owner = await this.authClient.Owner({id: objectId});

  if(!this.utils.EqualAddress(owner, this.signer.address)) {
    // Target decryption
    if(!this.reencryptionConks[objectId]) {
      this.reencryptionConks[objectId] = await this.authClient.ReEncryptionConk({libraryId, objectId});
    }

    return this.reencryptionConks[objectId];
  }

  // Primary encryption
  if(!this.encryptionConks[objectId]) {
    const capKey = `eluv.caps.iusr${this.utils.AddressToHash(this.signer.address)}`;

    const existingUserCap =
      await this.ContentObjectMetadata({
        libraryId,
        // Cap may only exist in draft
        objectId,
        writeToken,
        metadataSubtree: capKey
      });

    if(existingUserCap) {
      this.encryptionConks[objectId] = await Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey);
    } else {
      this.encryptionConks[objectId] = await Crypto.GeneratePrimaryConk();

      // If write token is specified, add it to the metadata
      if(writeToken) {
        let metadata = {};
        metadata[capKey] = await Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey);

        try {
          const kmsAddress = await this.authClient.KMSAddress({objectId});
          const kmsPublicKey = (await this.authClient.KMSInfo({objectId})).publicKey;
          const kmsCapKey = `eluv.caps.ikms${this.utils.AddressToHash(kmsAddress)}`;
          const existingKMSCap =
            await this.ContentObjectMetadata({
              libraryId,
              // Cap may only exist in draft
              objectId,
              writeToken,
              metadataSubtree: kmsCapKey
            });

          if(!existingKMSCap) {
            metadata[kmsCapKey] = await Crypto.EncryptConk(this.encryptionConks[objectId], kmsPublicKey);
          }
        } catch(error) {
          // eslint-disable-next-line no-console
          console.error("Failed to create encryption cap for KMS with public key " + kmsPublicKey);
        }

        await this.MergeMetadata({
          libraryId,
          objectId,
          writeToken,
          metadata
        });
      }
    }
  }

  return this.encryptionConks[objectId];
};

/**
 * Encrypt the specified chunk for the specified object or draft
 *
 * @methodGroup Encryption
 *
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {ArrayBuffer | Buffer} chunk - The data to encrypt
 *
 * @return {Promise<ArrayBuffer>}
 */
exports.Encrypt = async function({libraryId, objectId, writeToken, chunk}) {
  ValidateParameters({libraryId, objectId});

  const conk = await this.EncryptionConk({libraryId, objectId, writeToken});
  const data = await Crypto.Encrypt(conk, chunk);

  // Convert to ArrayBuffer
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
};

/**
 * Decrypt the specified chunk for the specified object or draft
 *
 * @methodGroup Encryption
 *
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {ArrayBuffer | Buffer} chunk - The data to decrypt
 *
 * @return {Promise<ArrayBuffer>}
 */
exports.Decrypt = async function({libraryId, objectId, writeToken, chunk}) {
  ValidateParameters({libraryId, objectId});

  const conk = await this.EncryptionConk({libraryId, objectId, writeToken});
  const data = await Crypto.Decrypt(conk, chunk);

  // Convert to ArrayBuffer
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
};

/* Content Object Access */

/**
 * Return the type of contract backing the specified ID
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} id - ID of the item
 *
 * @return {Promise<string>} - Contract type of the item - "space", "library", "type", "object", "wallet", "group", or "other"
 */
exports.AccessType = async function({id}) {
  return await this.authClient.AccessType(id);
};

/**
 * Retrieve info about the access charge and permissions for the specified object.
 *
 * Note: Access charge is specified in ether
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} objectId - ID of the object
 * @param {object=} args - Arguments to the getAccessInfo method - See the base content contract
 *
 * @return {Promise<Object>} - Info about the access charge and whether or not the object is accessible to the current user   */
exports.AccessInfo = async function({objectId, args}) {
  ValidateObject(objectId);

  if(!args) {
    args = [
      0, // Access level
      [], // Custom values
      [] // Stakeholders
    ];
  }

  this.Log(`Retrieving access info: ${objectId}`);

  const info = await this.ethClient.CallContractMethod({
    contractAddress: this.utils.HashToAddress(objectId),
    methodName: "getAccessInfo",
    methodArgs: args
  });

  this.Log(info);

  return {
    visibilityCode: info[0],
    visible: info[0] >= 1,
    accessible: info[0] >= 10,
    editable: info[0] >= 100,
    hasAccess: info[1] === 0,
    accessCode: info[1],
    accessCharge: this.utils.WeiToEther(info[2]).toString()
  };
};

/**
 * Make an explicit call to accessRequest or updateRequest of the appropriate contract. Unless noCache is specified on
 * this method or on the client, the resultant transaction hash of this method will be cached for all subsequent
 * access to this contract.
 *
 * Note: Access and update requests are handled automatically by ElvClient. Use this method only if you need to make
 * an explicit call. For example, if you need to specify custom arguments to access a content object, you can call
 * this method explicitly with those arguments. Since the result is cached (by default), all subsequent calls to
 * that content object will be authorized with that AccessRequest transaction.
 *
 * Note: If the access request has an associated charge, this charge will be determined and supplied automatically.
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 * @param {Array=} args=[] - Custom arguments to the accessRequest or updateRequest methods
 * @param {boolean=} update=false - If true, will call updateRequest instead of accessRequest
 * @param {boolean=} noCache=false - If true, the resultant transaction hash will not be cached for future use
 *
 * @return {Promise<Object>} - Resultant AccessRequest or UpdateRequest event
 */
exports.AccessRequest = async function({libraryId, objectId, versionHash, args=[], update=false, noCache=false}) {
  ValidateParameters({libraryId, objectId, versionHash});

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  return await this.authClient.MakeAccessRequest({
    libraryId,
    objectId,
    versionHash,
    args,
    update,
    skipCache: true,
    noCache
  });
};

/**
 * Generate a state channel token.
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 * @param {boolean=} noCache=false - If specified, a new state channel token will be generated
 * regardless whether or not one has been previously cached
 *
 * @return {Promise<string>} - The state channel token
 */
exports.GenerateStateChannelToken = async function({objectId, versionHash, noCache=false}) {
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  if(versionHash) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  } else if(!this.stateChannelAccess[objectId]) {
    versionHash = await this.LatestVersionHash({objectId});
  }

  this.stateChannelAccess[objectId] = versionHash;

  const audienceData = this.AudienceData({objectId, versionHash});

  return await this.authClient.AuthorizationToken({
    objectId,
    channelAuth: true,
    oauthToken: this.oauthToken,
    audienceData,
    noCache
  });
};

/**
 * Finalize state channel access
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 * @param {number} percentComplete - Completion percentage of the content
 */
exports.FinalizeStateChannelAccess = async function({objectId, versionHash, percentComplete}) {
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  if(versionHash) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  } else {
    if(this.stateChannelAccess[objectId]) {
      versionHash = this.stateChannelAccess[objectId];
    } else {
      versionHash = await this.LatestVersionHash({objectId});
    }
  }

  this.stateChannelAccess[objectId] = undefined;

  const audienceData = this.AudienceData({objectId, versionHash});

  await this.authClient.ChannelContentFinalize({
    objectId,
    audienceData,
    percent: percentComplete
  });
};

/**
 * Call accessComplete on the specified content object contract using a previously cached requestID.
 * Caching must be enabled and an access request must have been previously made on the specified
 * object by this client instance.
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} objectId - ID of the object
 * @param {number} score - Percentage score (0-100)
 *
 * @returns {Promise<Object>} - Transaction log of the AccessComplete event
 */
exports.ContentObjectAccessComplete = async function({objectId, score=100}) {
  ValidateObject(objectId);

  if(score < 0 || score > 100) { throw Error("Invalid AccessComplete score: " + score); }

  return await this.authClient.AccessComplete({id: objectId, score});
};

/* Collection */

/**
 * Get a list of unique addresses of all of the specified type the current user has access
 * to through both their user wallet and through access groups
 *
 * @methodGroup Collections
 * @namedParams
 * @param {string} collectionType - Type of collection to retrieve
 * - accessGroups
 * - contentObjects
 * - contentTypes
 * - contracts
 * - libraries
 *
 * @return {Promise<Array<string>>} - List of addresses of available items
 */
exports.Collection = async function({collectionType}) {
  const validCollectionTypes = [
    "accessGroups",
    "contentObjects",
    "contentTypes",
    "contracts",
    "libraries"
  ];

  if(!validCollectionTypes.includes(collectionType)) {
    throw new Error("Invalid collection type: " + collectionType);
  }

  const walletAddress = this.signer ? await this.userProfileClient.WalletAddress() : undefined;
  if(!walletAddress) {
    throw new Error("Unable to get collection: User wallet doesn't exist");
  }

  this.Log(`Retrieving ${collectionType} contract collection for user ${this.signer.address}`);

  return await this.ethClient.MakeProviderCall({
    methodName: "send",
    args: [
      "elv_getWalletCollection",
      [
        this.contentSpaceId,
        `iusr${this.utils.AddressToHash(this.signer.address)}`,
        collectionType
      ]
    ]
  });
};


/* Verification */

/**
 * Verify the specified content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} versionHash - Hash of the content object version
 *
 * @returns {Promise<Object>} - Response describing verification results
 */
exports.VerifyContentObject = async function({libraryId, objectId, versionHash}) {
  ValidateParameters({libraryId, objectId, versionHash});

  return await ContentObjectVerification.VerifyContentObject({
    client: this,
    libraryId,
    objectId,
    versionHash
  });
};

/**
 * Get the proofs associated with a given part
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - If not specified, latest version will be used
 * @param {string} partHash - Hash of the part
 *
 * @returns {Promise<Object>} - Response containing proof information
 */
exports.Proofs = async function({libraryId, objectId, versionHash, partHash}) {
  ValidateParameters({libraryId, objectId, versionHash});
  ValidatePartHash(partHash);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", versionHash || objectId, "data", partHash, "proofs");

  return this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
      method: "GET",
      path: path
    })
  );
};

/**
 * Get part info in CBOR format
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library - required for authentication
 * @param {string} objectId - ID of the object - required for authentication
 * @param {string} partHash - Hash of the part
 * @param {string} format - Format to retrieve the response - defaults to Blob
 *
 * @returns {Promise<Format>} - Response containing the CBOR response in the specified format
 */
exports.QParts = async function({libraryId, objectId, partHash, format="blob"}) {
  ValidateParameters({libraryId, objectId, versionHash});
  ValidatePartHash(partHash);

  let path = UrlJoin("qparts", partHash);

  return this.utils.ResponseToFormat(
    format,
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, partHash}),
      method: "GET",
      path: path
    })
  );
};
