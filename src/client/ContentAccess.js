/**
 * Methods for accessing content types, libraries and objects
 *
 * @module ElvClient/ContentAccess
 */

const UrlJoin = require("url-join");

const HttpClient = require("../HttpClient");

const {
  ValidateLibrary,
  ValidateObject,
  ValidateVersion,
  ValidatePartHash,
  ValidateWriteToken,
  ValidateParameters,
} = require("../Validation");

const MergeWith = require("lodash/mergeWith");


// Note: Keep these ordered by most-restrictive to least-restrictive
exports.permissionLevels = {
  "owner": {
    short: "Owner Only",
    description: "Only the owner has access to the object and ability to change permissions",
    settings: { visibility: 0, statusCode: -1, kmsConk: false }
  },
  "editable": {
    short: "Editable",
    description: "Members of the editors group have full access to the object and the ability to change permissions",
    settings: { visibility: 0, statusCode: -1, kmsConk: true }
  },
  "viewable": {
    short: "Viewable",
    description: "In addition to editors, members of the 'accessor' group can have read-only access to the object including playing video and retrieving metadata, images and documents",
    settings: { visibility: 0, statusCode: 0, kmsConk: true }
  },
  "listable": {
    short: "Publicly Listable",
    description: "Anyone can list the public portion of this object but only accounts with specific rights can access",
    settings: { visibility: 1, statusCode: 0, kmsConk: true }
  },
  "public": {
    short: "Public",
    description: "Anyone can access this object",
    settings: { visibility: 10, statusCode: 0, kmsConk: true }
  }
};

exports.Visibility = async function({id}) {
  try {
    const address = this.utils.HashToAddress(id);

    if(!this.visibilityInfo[address]) {
      this.visibilityInfo[address] = new Promise(async (resolve, reject) => {
        try {
          const hasVisibility = await this.authClient.ContractHasMethod({
            contractAddress: address,
            methodName: "visibility"
          });

          if(!hasVisibility) {
            resolve(0);
            return;
          }

          resolve(await this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(id),
            methodName: "visibility"
          }));
        } catch(error) {
          reject(error);
        }
      });
    }

    try {
      return await this.visibilityInfo[address];
    } catch(error) {
      delete this.visibilityInfo[address];

      throw error;
    }
  // eslint-disable-next-line no-unreachable
  } catch(error) {
    if(error.code === "CALL_EXCEPTION") {
      return 0;
    }

    throw error;
  }
};

/**
 * Get the current permission level for the specified object. See client.permissionLevels for all available permissions.
 *
 * Note: This method is only intended for normal content objects, not types, libraries, etc.
 *
 * @methodGroup Content Objects
 * @param {string} objectId - The ID of the object
 *
 * @return {string} - Key for the permission of the object - Use this to retrieve more details from client.permissionLevels
 */
exports.Permission = async function({objectId}) {
  ValidateObject(objectId);

  if((await this.AccessType({id: objectId})) !== this.authClient.ACCESS_TYPES.OBJECT) {
    throw Error("Permission only valid for normal content objects: " + objectId);
  }

  const visibility = await this.Visibility({id: objectId});

  const kmsAddress = await this.CallContractMethod({
    contractAddress: this.utils.HashToAddress(objectId),
    methodName: "addressKMS"
  });

  const kmsId = kmsAddress && `ikms${this.utils.AddressToHash(kmsAddress)}`;

  let hasKmsConk = false;
  if(kmsId) {
    hasKmsConk = !!(await this.ContentObjectMetadata({
      libraryId: await this.ContentObjectLibraryId({objectId}),
      objectId,
      metadataSubtree: `eluv.caps.${kmsId}`
    }));
  }

  let statusCode = await this.CallContractMethod({
    contractAddress: this.utils.HashToAddress(objectId),
    methodName: "statusCode"
  });
  statusCode = parseInt(statusCode._hex, 16);

  let permission = Object.keys(this.permissionLevels).filter(permissionKey => {
    const settings = this.permissionLevels[permissionKey].settings;

    return visibility >= settings.visibility && statusCode >= settings.statusCode && hasKmsConk === settings.kmsConk;
  });

  if(!permission) {
    permission = hasKmsConk ? ["editable"] : ["owner"];
  }

  return permission.slice(-1)[0];
};

/* Content Spaces */

/**
 * Get the address of the default KMS of the content space or the provided tenant
 *
 * @methodGroup Content Space
 * @namedParams
 * @param {string=} tenantId - An ID of a tenant contract - if not specified, the content space contract will be used
 *
 * @returns {Promise<string>} - Address of the KMS
 */
exports.DefaultKMSAddress = async function({tenantId}={}) {
  // Ensure tenant ID, if specified, is a tenant contract and not a group contract
  if(tenantId && (await this.AccessType({id: tenantId})) === this.authClient.ACCESS_TYPES.TENANT) {
    const kmsAddress = await this.CallContractMethod({
      contractAddress: this.utils.HashToAddress(tenantId),
      methodName: "addressKMS",
    });

    if(kmsAddress) {
      return kmsAddress;
    }
  }

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
    try {
      typeId = await this.ContentObjectMetadata({
        libraryId: this.contentSpaceLibraryId,
        objectId: this.contentSpaceObjectId,
        metadataSubtree: UrlJoin("public", "contentTypes", name)
      });
    // eslint-disable-next-line no-empty
    } catch(error) {}
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
          versionHash,
          metadataSubtree: "public"
        })) || {}
      };
    } else {
      metadata = (await this.ContentObjectMetadata({
        libraryId: this.contentSpaceLibraryId,
        objectId: typeId,
        versionHash
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
  let contentSpaceTypes = {};
  try {
    contentSpaceTypes = await this.ContentObjectMetadata({
      libraryId: this.contentSpaceLibraryId,
      objectId: this.contentSpaceObjectId,
      metadataSubtree: "public/contentTypes"
    }) || {};
  // eslint-disable-next-line no-empty
  } catch(error) {}

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
 * @param {number=} filterOptions.start - Start index for pagination
 * @param {number=} filterOptions.limit - Max number of objects to return
 * @param {(Array<string> | string)=} filterOptions.sort - Sort by the specified key(s)
 * @param {boolean=} filterOptions.sortDesc - Sort in descending order
 * @param {(Array<string> | string)=} filterOptions.select - Include only the specified metadata keys (all must start with /public)
 * @param {(Array<object> | object)=} filterOptions.filter - Filter objects by metadata
 * @param {string=} filterOptions.filter.key - Key to filter on (must start with /public)
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
 * Retrieve the tenant ID associated with the specified content object
 *
 * @methodGroup Content Objects
 *
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 *
 * @returns {Promise<string>} - Tenant ID of the object
 */
exports.ContentObjectTenantId = async function({objectId, versionHash}) {
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  if(!this.objectTenantIds[objectId]) {
    this.objectTenantIds[objectId] = await this.authClient.MakeElvMasterCall({
      methodName: "elv_getTenantById",
      params: [
        this.contentSpaceId,
        objectId
      ]
    });
  }

  return this.objectTenantIds[objectId];
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

        this.objectLibraryIds[objectId] = new Promise(async (resolve, reject) => {
          try {
            resolve(
              this.utils.AddressToLibraryId(
                await this.CallContractMethod({
                  contractAddress: this.utils.HashToAddress(objectId),
                  methodName: "libraryAddress"
                })
              )
            );
          } catch(error) {
            reject(error);
          }
        });
      }

      try {
        return await this.objectLibraryIds[objectId];
      } catch(error) {
        delete this.objectLibraryIds[objectId];

        throw error;
      }
    case this.authClient.ACCESS_TYPES.OTHER:
      throw Error(`Unable to retrieve library ID for ${versionHash || objectId}: Unknown type. (wrong network or deleted object?)`);
    default:
      return this.contentSpaceLibraryId;
  }
};

exports.ProduceMetadataLinks = async function({
  libraryId,
  objectId,
  versionHash,
  path="/",
  metadata,
  authorizationToken,
  noAuth
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
        metadata: entry,
        authorizationToken,
        noAuth
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
      url: await this.LinkUrl({libraryId, objectId, versionHash, linkPath: path, authorizationToken})
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
        metadata: metadata[key],
        authorizationToken,
        noAuth
      });
    }
  );

  return result;
};

exports.MetadataAuth = async function({
  libraryId,
  objectId,
  versionHash,
  path="/",
  channelAuth=false,
  noAuth=false
}) {
  ValidateParameters({libraryId, objectId, versionHash});

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  noAuth = this.noAuth || noAuth;
  let isPublic = noAuth;
  let accessType;
  if(!noAuth) {
    const visibility = await this.Visibility({id: objectId});
    accessType = await this.AccessType({id: objectId});
    isPublic = (path || "").replace(/^\/+/, "").startsWith("public");
    noAuth = visibility >= 10 || (isPublic && visibility >= 1);
  }

  if(this.oauthToken) {
    // Check that KMS is set on this object
    const kmsAddress = await this.authClient.KMSAddress({objectId, versionHash});

    if(kmsAddress && !this.utils.EqualAddress(kmsAddress, this.utils.nullAddress)) {
      return await this.authClient.AuthorizationToken({
        libraryId,
        objectId,
        versionHash,
        channelAuth: true,
        oauthToken: this.oauthToken
      });
    }
  }

  if(!this.inaccessibleLibraries[libraryId] && isPublic && accessType === this.authClient.ACCESS_TYPES.OBJECT && !channelAuth) {
    // Content object public metadata can be accessed using library access request
    try {
      return await this.authClient.AuthorizationToken({
        libraryId: libraryId || await this.ContentObjectLibraryId({objectId, versionHash}),
        noAuth
      });
    } catch(error) {
      if(error.message && error.message.toLowerCase().startsWith("access denied")) {
        this.inaccessibleLibraries[libraryId] = true;

        return await this.authClient.AuthorizationToken({libraryId, objectId, versionHash, noAuth, channelAuth});
      }

      throw error;
    }
  } else {
    return await this.authClient.AuthorizationToken({libraryId, objectId, versionHash, noAuth, channelAuth});
  }
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
 * @param {Object=} queryParams={} - Additional query params for the call
 * @param {Array<string>=} select - Limit the returned metadata to the specified attributes
 * - Note: Selection is relative to "metadataSubtree". For example, metadataSubtree="public" and select=["name", "description"] would select "public/name" and "public/description"
 * @param {Array<string>=} remove - Exclude the specified items from the retrieved metadata
 * @param {string=} authorizationToken - Additional authorization token for this request
 * @param {string=} noAuth=false - If specified, the normal authorization flow will be skipped. Useful if you know the metadata you're retrieving is publicly accessible
 * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
 * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata

   Example:

       {
          "resolved-link": {
            ".": {
              "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
            },
            "public": {
              "name": "My Linked Object",
            }
            ...
          }
       }

 * @param {boolean=} resolveIgnoreErrors=false - If specified, link errors within the requested metadata will not cause the entire response to result in an error
 * @param {number=} linkDepthLimit=1 - Limit link resolution to the specified depth. Default link depth is 1 (only links directly in the object's metadata will be resolved)
 * @param {boolean=} produceLinkUrls=false - If specified, file and rep links will automatically be populated with a
 * full URL
 *
 * @returns {Promise<Object | string>} - Metadata of the content object
 */
exports.ContentObjectMetadata = async function({
  libraryId,
  objectId,
  versionHash,
  writeToken,
  metadataSubtree="/",
  queryParams={},
  select=[],
  remove=[],
  authorizationToken,
  noAuth=false,
  resolveLinks=false,
  resolveIncludeSource=false,
  resolveIgnoreErrors=false,
  linkDepthLimit=1,
  produceLinkUrls=false,
}) {
  ValidateParameters({libraryId, objectId, versionHash});

  this.Log(
    `Retrieving content object metadata: ${libraryId || ""} ${objectId || versionHash} ${writeToken || ""}
       Subtree: ${metadataSubtree}`
  );

  queryParams = { ...(queryParams || {}) };

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", writeToken || versionHash || objectId, "meta", metadataSubtree);

  // Main authorization
  let defaultAuthToken = await this.MetadataAuth({libraryId, objectId, versionHash, path: metadataSubtree, noAuth});

  // All authorization
  const authTokens = [authorizationToken, queryParams.authorization, defaultAuthToken].flat().filter(token => token);
  delete queryParams.authorization;

  let metadata;
  try {
    metadata = await this.utils.ResponseToJson(
      this.HttpClient.Request({
        headers: { "Authorization": authTokens.map(token => `Bearer ${token}`) },
        queryParams: {
          ...queryParams,
          select,
          remove,
          link_depth: linkDepthLimit,
          resolve: resolveLinks,
          resolve_include_source: resolveIncludeSource,
          resolve_ignore_errors: resolveIgnoreErrors,
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
    metadata,
    authorizationToken,
    noAuth
  });
};


/** Retrive public/asset_metadata from the specified object, performing automatic localization override based on the specified localization info.
 *
 * File and rep links will have urls generated automatically within them (See the `produceLinkUrls` parameter in `ContentObjectMetadata`)
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
 * @param {Object=} metadata - If you have already retrieved metadata for the object and just want to perform localization, the metadata <i>(Starting from public/asset_metadata)</i> can be
 * provided to avoid re-fetching the metadata.
 * @param {Array} localization - A list of locations of localized metadata, ordered from highest to lowest priority

     localization: [
       ["info_territories", "France", "FR"],
       ["info_locals", "FR"]
     ]

 * @returns {Promise<Object>} - public/asset_metadata of the specified object, overwritten with specified localization
 * @param {boolean=} produceLinkUrls=false - If specified, file and rep links will automatically be populated with a
 * full URL
 */
exports.AssetMetadata = async function({libraryId, objectId, versionHash, metadata, localization, noAuth, produceLinkUrls=false}) {
  ValidateParameters({libraryId, objectId, versionHash});

  if(!objectId) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  }

  if(!metadata) {
    metadata = (await this.ContentObjectMetadata({
      libraryId,
      objectId,
      versionHash,
      metadataSubtree: "public/asset_metadata",
      resolveLinks: true,
      linkDepthLimit: 2,
      resolveIgnoreErrors: true,
      produceLinkUrls,
      noAuth
    })) || {};
  } else if(produceLinkUrls) {
    metadata = await this.ProduceMetadataLinks({
      libraryId,
      objectId,
      versionHash,
      path: UrlJoin("public", "asset_metadata"),
      metadata,
      noAuth
    });
  }

  if(!metadata.info) {
    metadata.info = {};
  }

  let mergedMetadata = { ...metadata };
  if(localization) {
    localization.reverse().forEach(keys => {
      const localizedMetadata = this.utils.SafeTraverse(metadata, ...keys) || {};
      mergedMetadata = MergeWith({}, mergedMetadata, localizedMetadata, (a, b) => b === null || b === "" ? a : undefined);
    });
  }

  return mergedMetadata;
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

  let latestHash;
  try {
    latestHash = await this.CallContractMethod({
      contractAddress: this.utils.HashToAddress(objectId),
      methodName: "objectHash"
    });
  // eslint-disable-next-line no-empty
  } catch(error) {}

  if(!latestHash) {
    const versionCount = await this.CallContractMethod({
      contractAddress: this.utils.HashToAddress(objectId),
      methodName: "countVersionHashes"
    });

    if(!versionCount.toNumber()) {
      throw Error(`Unable to determine latest version hash for ${versionHash || objectId} - Item deleted?`);
    }

    latestHash = await this.CallContractMethod({
      contractAddress: this.utils.HashToAddress(objectId),
      methodName: "versionHashes",
      methodArgs: [versionCount - 1]
    });
  }

  return latestHash;
};

/* URL Methods */

/**
 * Determine available DRM types available in this browser environment.
 *
 * @methodGroup Media
 * @return {Promise<Array<string>>}
 */
exports.AvailableDRMs = async function() {
  let availableDRMs = ["clear", "aes-128"];

  if(typeof window === "undefined") {
    return availableDRMs;
  }

  // Detect iOS > 13.1 or Safari > 13.1 and replace aes-128 with sample-aes
  if(window.navigator && window.navigator.userAgent) {
    // Test iOS
    const info = window.navigator.userAgent.match(/(iPad|iPhone|iphone|iPod).*?(OS |os |OS_)(\d+((_|\.)\d)?((_|\.)\d)?)/);

    if(info && info[3]) {
      const version = info[3].split("_");
      const major = parseInt(version[0]);
      const minor = parseInt(version[1]);

      if(major > 13 || (major === 13 && minor >= 1)) {
        availableDRMs[1] = "sample-aes";
        availableDRMs[2] = "fairplay";
      }
    }

    // Test Safari
    if(/^((?!chrome|android).)*safari/i.test(window.navigator.userAgent)) {
      const version = window.navigator.userAgent.match(/.+Version\/(\d+)\.(\d+)/);

      if(version && version[2]) {
        const major = parseInt(version[1]);
        const minor = parseInt(version[2]);

        if(major > 13 || (major === 13 && minor >= 1)) {
          availableDRMs[1] = "sample-aes";
          availableDRMs[2] = "fairplay";
        }
      }
    }
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

exports.PlayoutPathResolution = async function({
  libraryId,
  objectId,
  versionHash,
  writeToken,
  linkPath,
  handler,
  offering="",
  signedLink=false,
  authorizationToken
}) {
  if(!libraryId) {
    libraryId = await this.ContentObjectLibraryId({objectId});
  }

  if(!versionHash) {
    versionHash = await this.LatestVersionHash({objectId});
  }

  let path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash, "rep", handler, offering, "options.json");

  let linkTargetLibraryId, linkTargetId, linkTargetHash, multiOfferingLink;
  if(linkPath) {
    const linkInfo = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      versionHash,
      writeToken,
      metadataSubtree: linkPath,
      resolveLinks: false,
      resolveIgnoreErrors: true,
      resolveIncludeSource: true,
      authorizationToken
    });

    multiOfferingLink = !!linkInfo && !!linkInfo["/"] && !linkInfo["/"].endsWith("options.json");

    // Default case: Use link path directly
    path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash, "meta", linkPath);

    if(!signedLink) {
      // If the link is not signed, we want to authorize against the target object instead of the source object
      linkTargetHash = await this.LinkTarget({
        libraryId,
        objectId,
        versionHash,
        writeToken,
        linkPath,
        linkInfo,
        authorizationToken
      });
      linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
      linkTargetLibraryId = await this.ContentObjectLibraryId({objectId: linkTargetId});

      if(!multiOfferingLink && !offering) {
        // If the offering is not specified, the intent is to get available offerings. For a single offering link, must
        // access available offerings on the object directly
        path = UrlJoin("q", linkTargetHash, "rep", handler, "options.json");
      }
    }

    if(multiOfferingLink) {
      // The link points to rep/<handler> instead of rep/<handler>/<offering>/options.json
      path = UrlJoin(path, offering, "options.json");
    }
  }

  return {
    path,
    multiOfferingLink,
    linkTarget: {
      libraryId: linkTargetLibraryId,
      objectId: linkTargetId,
      versionHash: linkTargetHash
    }
  };
};

/**
 * Retrieve available playout offerings for the specified content
 *
 * @methodGroup Media
 * @param {string=} objectId - Id of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} writeToken - Write token for the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {boolean=} signedLink - Specify if linkPath is referring to a signed link
 * @param {boolean=} directLink - Specify if linkPath is pointing directly to the offerings endpoint
 * @param {string=} handler=playout - The handler to use for playout (not used with links)
 * @param {Object=} authorizationToken - Additional authorization token for authorizing this request
 *
 * @return {Promise<Object>} - The available offerings
 */
exports.AvailableOfferings = async function({
  objectId,
  versionHash,
  writeToken,
  linkPath,
  signedLink,
  directLink,
  handler="playout",
  authorizationToken
}) {
  if(!objectId) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  }

  if(directLink) {
    return await this.ContentObjectMetadata({
      libraryId: await this.ContentObjectLibraryId({objectId}),
      objectId,
      versionHash,
      metadataSubtree: linkPath,
      resolveLinks: true,
      authorizationToken
    });
  }

  const { path } = await this.PlayoutPathResolution({
    objectId,
    versionHash,
    writeToken,
    linkPath,
    signedLink,
    handler,
    authorizationToken
  });

  try {
    let authorization = [
      authorizationToken,
      await this.authClient.AuthorizationToken({
        objectId,
        channelAuth: true,
        oauthToken: this.oauthToken
      })
    ]
      .flat()
      .filter(token => token);

    return await this.utils.ResponseToJson(
      this.HttpClient.Request({
        path: path,
        method: "GET",
        headers: {
          Authorization: `Bearer ${authorization.join(",")}`
        }
      })
    );
  } catch(error) {
    if(error.status && parseInt(error.status) === 500) {
      return {};
    }

    throw error;
  }
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
 * @param {string=} offeringURI - A URI pointing directly to the playout options endpoint
 * @param {string=} objectId - ID of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} writeToken - Write token for the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {boolean=} signedLink - Specify if linkPath is referring to a signed link
 * @param {Array<string>} protocols=["dash","hls"]] - Acceptable playout protocols ("dash", "hls")
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "widevine")
 * @param {string=} handler=playout - The handler to use for playout (not used with links)
 * @param {string=} offering=default - The offering to play
 * @param {string=} playoutType - The type of playout
 * @param {Object=} context - Additional audience data to include in the authorization request.
 * - Note: Context must be a map of string->string
 * @param {Object=} authorizationToken - Additional authorization token for authorizing this request
 * @param {Object=} options - Additional query parameters to pass when requesting available playout options, such as clipping parameters.
 */
exports.PlayoutOptions = async function({
  offeringURI,
  objectId,
  versionHash,
  writeToken,
  linkPath,
  signedLink=false,
  protocols=["dash", "hls"],
  handler="playout",
  offering="default",
  playoutType,
  drms=[],
  context,
  hlsjsProfile=true,
  authorizationToken,
  options={}
}) {
  if(offeringURI) {
    const uriInfo = offeringURI.match(/(hq__[^/]+)\/rep\/([^/]+)\/([^/]+)\/options.json/);
    versionHash = uriInfo[1];
    handler = uriInfo[2];
    offering = uriInfo[3];

    if(!versionHash || !handler || !offering) {
      throw Error(`Invalid offering URI: ${offeringURI}`);
    }
  }

  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  protocols = protocols.map(p => p.toLowerCase());
  drms = drms.map(d => d.toLowerCase());

  if(!objectId) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  } else if(!versionHash) {
    versionHash = await this.LatestVersionHash({objectId});
  }

  const libraryId = await this.ContentObjectLibraryId({objectId});

  try {
    // If public/asset_metadata/sources/<offering> exists, use that instead of directly calling on object
    if(!linkPath) {
      const offeringPath = UrlJoin("public", "asset_metadata", "sources", offering);
      const link = await this.ContentObjectMetadata({
        libraryId,
        objectId,
        versionHash,
        metadataSubtree: offeringPath,
        authorizationToken
      });

      if(link) { linkPath = offeringPath; }
    }
  // eslint-disable-next-line no-empty
  } catch(error) {}

  const {
    path,
    linkTarget
  } = await this.PlayoutPathResolution({
    libraryId,
    objectId,
    versionHash,
    writeToken,
    linkPath,
    signedLink,
    handler,
    offering,
    authorizationToken
  });

  const audienceData = this.authClient.AudienceData({
    objectId: linkTarget.objectId || objectId,
    versionHash: linkTarget.versionHash || versionHash || await this.LatestVersionHash({objectId}),
    protocols,
    drms,
    context
  });

  let authorization = [
    authorizationToken,
    await this.authClient.AuthorizationToken({
      libraryId,
      objectId,
      channelAuth: true,
      oauthToken: this.oauthToken,
      audienceData
    })
  ]
    .flat()
    .filter(token => token);

  let queryParams = {
    authorization,
    resolve: !!linkPath,
    ...options
  };

  const playoutOptions = Object.values(
    await this.utils.ResponseToJson(
      this.HttpClient.Request({
        path,
        method: "GET",
        queryParams
      })
    )
  );

  if(!signedLink && linkTarget.versionHash) {
    // Link target is different object and not signed link - switch auth token to target object
    queryParams.authorization = [
      authorizationToken,
      await this.authClient.AuthorizationToken({
        libraryId: linkTarget.libraryId,
        objectId: linkTarget.objectId,
        channelAuth: true,
        oauthToken: this.oauthToken,
        audienceData
      })
    ]
      .flat()
      .filter(token => token);
  }

  let playoutMap = {};
  let sessionId, multiview;
  for(let i = 0; i < playoutOptions.length; i++) {
    const option = playoutOptions[i];
    const protocol = option.properties.protocol;
    const drm = option.properties.drm;
    sessionId = sessionId || option.sid;
    multiview = multiview || !!option.properties.multiview;

    if(sessionId) {
      queryParams.sid = sessionId;
    }

    // Remove authorization parameter from playout path - it's re-added by Rep
    let playoutPath = option.uri.split("?")[0];

    if(playoutType) {
      playoutPath = playoutPath.replace("playlist", `playlist-${playoutType}`);
    }

    const licenseServers = option.properties.license_servers;
    const cert = option.properties.cert;

    if(hlsjsProfile && protocol === "hls" && drm === "aes-128") {
      queryParams.player_profile = "hls-js";
    }

    // Create full playout URLs for this protocol / drm combo
    playoutMap[protocol] = {
      ...(playoutMap[protocol] || {}),
      playoutMethods: {
        ...((playoutMap[protocol] || {}).playoutMethods || {}),
        [drm || "clear"]: {
          playoutUrl:
            signedLink ?
              await this.LinkUrl({
                versionHash,
                linkPath: UrlJoin(linkPath, offering, playoutPath),
                queryParams,
                noAuth: true
              }) :
              await this.Rep({
                libraryId: linkTarget.libraryId || libraryId,
                objectId: linkTarget.objectId || objectId,
                versionHash: linkTarget.versionHash || versionHash,
                rep: UrlJoin(handler, offering, playoutPath),
                noAuth: true,
                queryParams
              }),
          drms: drm ? {[drm]: {licenseServers, cert}} : undefined
        }
      }
    };

    // Add .cert_url if playoutMap[protocol].playoutMethods[].drms[].cert is present
    // (for clients that need cert supplied as a URL reference rather than as a string literal)
    for(const method in playoutMap[protocol].playoutMethods) {
      if(playoutMap[protocol].playoutMethods[method].drms &&
        playoutMap[protocol].playoutMethods[method].drms[drm] &&
        playoutMap[protocol].playoutMethods[method].drms[drm].cert) {
        // construct by replacing last part of playout URL path (e.g. "playlist.m3u8", "live.m3u8") with "drm.cert"
        let certUrl = new URL(playoutMap[protocol].playoutMethods[method].playoutUrl);
        certUrl.pathname = certUrl.pathname.split("/").slice(0,-1).concat(["drm.cert"]).join("/");
        playoutMap[protocol].playoutMethods[method].drms[drm].cert_url = certUrl.toString();
      }
    }

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

  // Callbacks for retrieving and setting multiview views
  if(multiview && sessionId) {
    playoutMap.sessionId = sessionId;
    playoutMap.multiview = true;

    playoutMap.AvailableViews = async () => {
      return await this.utils.ResponseToFormat(
        "json",
        await this.HttpClient.Request({
          path: UrlJoin("q", linkTarget.versionHash || versionHash, "rep", handler, offering, "views.json"),
          method: "GET",
          queryParams: {
            sid: sessionId,
            authorization
          }
        })
      );
    };

    playoutMap.SwitchView = async (view) => {
      await this.HttpClient.Request({
        path: UrlJoin("q", linkTarget.versionHash || versionHash, "rep", handler, offering, "select_view"),
        method: "POST",
        queryParams: {
          sid: sessionId,
          authorization
        },
        body: { view }
      });
    };
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
 * @param {string=} objectId - ID of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} writeToken - Write token for the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {boolean=} signedLink - Specify if linkPath is referring to a signed link
 * @param {Array<string>} protocols=["dash","hls"]] - Acceptable playout protocols ("dash", "hls")
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "sample-aes", "widevine")
 * @param {string=} handler=playout - The handler to use for playout
 * @param {string=} offering=default - The offering to play
 * @param {string=} playoutType - The type of playout
 * @param {Object=} context - Additional audience data to include in the authorization request
 * - Note: Context must be a map of string->string
 * @param {Object=} authorizationToken - Additional authorization token for authorizing this request
 * @param {Object=} options - Additional query parameters to pass when requesting available playout options, such as clipping parameters.
 */
exports.BitmovinPlayoutOptions = async function({
  objectId,
  versionHash,
  writeToken,
  linkPath,
  signedLink=false,
  protocols=["dash", "hls"],
  drms=[],
  handler="playout",
  offering="default",
  playoutType,
  context,
  authorizationToken,
  options={}
}) {
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  if(!objectId) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  }

  const playoutOptions = await this.PlayoutOptions({
    objectId,
    versionHash,
    writeToken,
    linkPath,
    signedLink,
    protocols,
    drms,
    handler,
    offering,
    playoutType,
    hlsjsProfile: false,
    context,
    authorizationToken,
    options
  });

  delete playoutOptions.playoutMethods;

  const {
    linkTarget
  } = await this.PlayoutPathResolution({
    objectId,
    versionHash,
    writeToken,
    linkPath,
    signedLink,
    handler,
    offering,
    authorizationToken
  });

  let authorization = [];

  if(authorizationToken) { authorization.push(authorizationToken); }

  if(signedLink || !linkTarget.versionHash) {
    // Target is same object or signed link - authorize against original object
    authorization.push(
      await this.authClient.AuthorizationToken({
        objectId,
        channelAuth: true,
        oauthToken: this.oauthToken,
      })
    );
  } else {
    // Target is different object and not signed link - switch auth token to target object
    authorization.push(
      await this.authClient.AuthorizationToken({
        libraryId: linkTarget.libraryId,
        objectId: linkTarget.objectId,
        channelAuth: true,
        oauthToken: this.oauthToken
      })
    );
  }

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
              Authorization: `Bearer ${authorization.flat().filter(token => token).join(",")}`
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
      ${JSON.stringify(queryParams || "")}
      Body:
      ${JSON.stringify(body || "")}
      Headers
      ${JSON.stringify(headers || "")}`
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

  let authorization = [];

  if(queryParams.authorization) {
    authorization.push(queryParams.authorization);
  }

  if(!(noAuth && queryParams.authorization)) {
    authorization.push(
      await this.authClient.AuthorizationToken({
        libraryId,
        objectId,
        versionHash,
        channelAuth,
        noAuth,
        noCache
      })
    );
  }

  // Clone queryParams to avoid modification of the original
  queryParams = {
    ...queryParams,
    authorization: authorization.flat()
  };

  if((rep || publicRep) && objectId && !versionHash) {
    versionHash = await this.LatestVersionHash({objectId});
  }

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
    path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash || objectId);
  } else {
    path = UrlJoin("q", versionHash);
  }

  const authorizationToken = await this.authClient.AuthorizationToken({libraryId, objectId, noCache});

  queryParams = {
    ...queryParams,
    authorization: authorizationToken
  };

  const fileInfo = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    versionHash,
    writeToken,
    metadataSubtree: UrlJoin("files", filePath)
  });

  const encrypted = fileInfo && fileInfo["."].encryption && fileInfo["."].encryption.scheme === "cgck";

  if(encrypted) {
    path = UrlJoin(path, "rep", "files_download", filePath);
    queryParams["header-x_decryption_mode"] = "decrypt";
  } else {
    path = UrlJoin(path, "files", filePath);
  }

  return this.HttpClient.URL({
    path: path,
    queryParams
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
 * @param {number=} height - If specified, the image will be scaled to the specified maximum height
 * @param {string=} imagePath=public/display_image - Metadata path to the image link
 *
 * @see <a href="Utils.html#.ResizeImage">Utils#ResizeImage</a>
 *
 * @returns {Promise<string | undefined>} - If the object has an image, will return a URL for that image.
 */
exports.ContentObjectImageUrl = async function({libraryId, objectId, versionHash, height, imagePath="public/display_image"}) {
  ValidateParameters({libraryId, objectId, versionHash});

  if(!versionHash) {
    versionHash = await this.LatestVersionHash({objectId});
  }

  this.Log(`Retrieving content object image url: ${libraryId} ${objectId} ${versionHash}`);

  if(!this.objectImageUrls[versionHash]) {
    try {
      const imageMetadata = await this.ContentObjectMetadata({versionHash, metadataSubtree: imagePath});

      if(!imageMetadata) {
        this.Log(`No image url set: ${libraryId} ${objectId} ${versionHash}`);
        return;
      }
    } catch(error) {
      this.Log(`Unable to query for image metadata: ${libraryId} ${objectId} ${versionHash}`, true);
      this.Log(error, true);
    }

    let queryParams = {};
    if(height && !isNaN(parseInt(height))) {
      queryParams["height"] = parseInt(height);
    }

    this.objectImageUrls[versionHash] = await this.LinkUrl({
      versionHash,
      linkPath: imagePath,
      queryParams
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
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
        queryParams: {
          auto_update: autoUpdate,
          select
        },
        method: "GET",
        path: path,
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
 * Retrieve the version hash of the target of the specified link. If the target is the same as the specified
 * object and versionHash is not specified, will return the latest version hash.
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string=} writeToken - The write token for the object
 * @param {string} linkPath - Path to the content object link
 * @param {string=} authorizationToken - Additional authorization token for this request
 *
 * @returns {Promise<string>} - Version hash of the link's target
 */
exports.LinkTarget = async function({libraryId, objectId, versionHash, writeToken, linkPath, authorizationToken, linkInfo}) {
  ValidateParameters({libraryId, objectId, versionHash});
  if(writeToken) { ValidateWriteToken(writeToken); }

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  if(writeToken && !libraryId) {
    libraryId = await this.ContentObjectLibraryId({objectId});
  }

  // Assume linkPath points directly at a link - retrieve unresolved link and extract hash
  if(!linkInfo) {
    linkInfo = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      versionHash,
      writeToken,
      metadataSubtree: linkPath,
      resolveLinks: false,
      resolveIgnoreErrors: true,
      resolveIncludeSource: true,
      authorizationToken
    });
  }

  if(linkInfo && linkInfo["/"]) {
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
    return versionHash || await this.LatestVersionHash({objectId});
  }

  // linkPath does not point at a link - try to resolve the metadata and extract the source
  linkInfo = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    versionHash,
    writeToken,
    metadataSubtree: linkPath,
    resolveIncludeSource: true,
    authorizationToken
  });

  if(!linkInfo || !linkInfo["."]) {
    // If metadata is not a literal value, it must be within the original object
    if(typeof linkInfo === "object") {
      return versionHash || await this.LatestVersionHash({objectId});
    }

    // linkPath is not a direct link, but points to a literal value - back up one path element to find the container
    const subPath = linkPath.split("/").slice(0, -1).join("/");

    if(!subPath) {
      return versionHash || await this.LatestVersionHash({objectId});
    }

    // linkPath does not point at a link - try to resolve the metadata and extract the source
    linkInfo = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      versionHash,
      writeToken,
      metadataSubtree: subPath,
      resolveIncludeSource: true,
      authorizationToken
    });
  }

  return linkInfo["."].source;
};

/**
 * Generate a URL to the specified file link with appropriate authentication
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string=} writeToken - The write token for the object
 * @param {string} linkPath - Path to the content object link
 * @param {string=} mimeType - Mime type to use when rendering the file
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {string=} authorizationToken - Additional authorization token
 * @param {boolean=} channelAuth=false - If specified, state channel authorization will be performed instead of access request authorization
 * @param {boolean=} noAuth - If specified, no authorization (other than the authorizationToken parameter and queryParams.authorization) will be added
 *
 * @returns {Promise<string>} - URL to the specified file with authorization token
 */
exports.LinkUrl = async function({
  libraryId,
  objectId,
  versionHash,
  writeToken,
  linkPath,
  mimeType,
  authorizationToken,
  queryParams={},
  channelAuth=false,
  noAuth=false
}) {
  ValidateParameters({libraryId, objectId, versionHash});
  if(writeToken) { ValidateWriteToken(writeToken); }

  if(!linkPath) { throw Error("Link path not specified"); }

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path;
  if(libraryId) {
    path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash || objectId, "meta", linkPath);
  } else {
    path = UrlJoin("q", versionHash, "meta", linkPath);
  }

  let authorization = [ authorizationToken ];
  authorization.push(await this.MetadataAuth({libraryId, objectId, versionHash, path: linkPath, channelAuth, noAuth}));

  if(queryParams.authorization) {
    authorization.push(queryParams.authorization);
  }

  queryParams = {
    ...queryParams,
    authorization: authorization.flat().filter(token => token),
    resolve: true
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
 * @param {string=} writeToken - The write token for the object
 * @param {string} linkPath - Path to the content object link
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {string=} format=json - Format of the response
 * @param {boolean=} channelAuth=false - If specified, state channel authorization will be performed instead of access request authorization
 */
exports.LinkData = async function({libraryId, objectId, versionHash, writeToken, linkPath, queryParams={}, format="json", channelAuth}) {
  const linkUrl = await this.LinkUrl({libraryId, objectId, versionHash, writeToken, linkPath, queryParams, channelAuth});

  return this.utils.ResponseToFormat(
    format,
    await HttpClient.Fetch(linkUrl)
  );
};


/* Encryption */

exports.CreateEncryptionConk = async function({libraryId, objectId, versionHash, writeToken, createKMSConk=true}) {
  if(this.signer.remoteSigner) {
    return;
  }

  ValidateParameters({libraryId, objectId, versionHash});
  ValidateWriteToken(writeToken);

  if(!objectId) {
    objectId = client.DecodeVersionHash(versionHash).objectId;
  }

  if(!libraryId) {
    libraryId = await this.ContentObjectLibraryId({objectId});
  }

  const capKey = `eluv.caps.iusr${this.utils.AddressToHash(this.signer.address)}`;

  const existingUserCap =
    await this.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: capKey
    });

  if(existingUserCap) {
    this.encryptionConks[objectId] = await this.Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey);
  } else {
    this.encryptionConks[objectId] = await this.Crypto.GeneratePrimaryConk({
      spaceId: this.contentSpaceId,
      objectId
    });

    await this.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: capKey,
      metadata: await this.Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey)
    });
  }

  if(createKMSConk) {
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
        await this.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: kmsCapKey,
          metadata: await this.Crypto.EncryptConk(this.encryptionConks[objectId], kmsPublicKey)
        });
      }
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to create encryption cap for KMS:");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  return this.encryptionConks[objectId];
};

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
 * @param {string} versionHash - Version hash of the object
 * @param {string=} writeToken - Write token of the content object draft
 * @param {boolean=} download=false - If specified, will return keys appropriate for download (if the current user is not
 * the owner of the object, download will be performed via proxy-reencryption)
 *
 * @return Promise<Object> - The encryption conk for the object
 */
exports.EncryptionConk = async function({libraryId, objectId, versionHash, writeToken, download=false}) {
  ValidateParameters({libraryId, objectId, versionHash});
  if(writeToken) { ValidateWriteToken(writeToken); }

  if(!objectId) {
    objectId = client.DecodeVersionHash(versionHash).objectId;
  }

  const owner = await this.authClient.Owner({id: objectId});

  const ownerCapKey = `eluv.caps.iusr${this.utils.AddressToHash(this.signer.address)}`;
  const ownerCap = await this.ContentObjectMetadata({libraryId, objectId, metadataSubtree: ownerCapKey});

  if(!this.utils.EqualAddress(owner, this.signer.address) && !ownerCap) {
    if(download) {
      return await this.authClient.ReEncryptionConk({libraryId, objectId, versionHash});
    } else {
      return await this.authClient.EncryptionConk({libraryId, objectId, versionHash});
    }
  }

  // Primary encryption
  if(!this.encryptionConks[objectId]) {
    const capKey = `eluv.caps.iusr${this.utils.AddressToHash(this.signer.address)}`;

    const existingUserCap =
      await this.ContentObjectMetadata({
        libraryId,
        objectId,
        versionHash,
        // Cap may only exist in draft
        writeToken,
        metadataSubtree: capKey
      });

    if(existingUserCap) {
      this.encryptionConks[objectId] = await this.Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey);
    } else if(writeToken) {
      await this.CreateEncryptionConk({libraryId, objectId, versionHash, writeToken, createKMSConk: false});
    } else {
      throw "No encryption conk present for " + objectId;
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
  const data = await this.Crypto.Encrypt(conk, chunk);

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

  const conk = await this.EncryptionConk({libraryId, objectId, writeToken, download: true});
  const data = await this.Crypto.Decrypt(conk, chunk);

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
 * Specify additional context to include in all state channel requests made by the client (e.g. for playout)
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {Object=} context - Additional context to include in state channel requests
 * - Note: Context must be a map of string->string
 */
exports.SetAuthContext = function({context}) {
  if(context && Object.values(context).find(value => typeof value !== "string")) {
    throw Error("Context must be a map of string->string");
  }

  this.authContext = context;
};

/**
 * Generate a state channel token.
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 * @param {Object=} context - Additional audience data to include in the authorization request
 * - Note: Context must be a map of string->string
 * @param {boolean=} noCache=false - If specified, a new state channel token will be generated
 * regardless whether or not one has been previously cached
 *
 * @return {Promise<string>} - The state channel token
 */
exports.GenerateStateChannelToken = async function({objectId, versionHash, context, noCache=false}) {
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

  if(versionHash) {
    objectId = this.utils.DecodeVersionHash(versionHash).objectId;
  } else if(!this.stateChannelAccess[objectId]) {
    versionHash = await this.LatestVersionHash({objectId});
  }

  this.stateChannelAccess[objectId] = versionHash;

  return await this.authClient.AuthorizationToken({
    objectId,
    channelAuth: true,
    oauthToken: this.oauthToken,
    context,
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

  await this.authClient.ChannelContentFinalize({
    objectId,
    versionHash,
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

  return (await this.ethClient.MakeProviderCall({
    methodName: "send",
    args: [
      "elv_getWalletCollection",
      [
        this.contentSpaceId,
        `iusr${this.utils.AddressToHash(this.signer.address)}`,
        collectionType
      ]
    ]
  })) || [];
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
