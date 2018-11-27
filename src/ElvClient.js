const URI = require("urijs");
const Path = require("path");
const Ethers = require("ethers");

const AuthorizationClient = require("./AuthorizationClient");
const ElvWallet = require("./ElvWallet");
const EthClient = require("./EthClient");
const HttpClient = require("./HttpClient");
const ContentObjectVerification = require("./ContentObjectVerification");
const Utils = require("./Utils");

const HandleErrors = async (response) => {
  response = await response;

  if(!response.ok){
    let errorInfo = {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    };
    throw errorInfo;
  }

  return response;
};

const ResponseToJson = async (response) => {
  return ResponseToFormat("json", response);
};

const ResponseToFormat = async (format, response) => {
  response = await HandleErrors(response);

  switch(format.toLowerCase()) {
  case "json":
    return response.json();
  case "text":
    return response.text();
  case "blob":
    return response.blob();
  case "arraybuffer":
    return response.arrayBuffer();
  case "formdata":
    return response.formData();
  default:
    return response;
  }
};

class ElvClient {
  /**
   * Create a new ElvClient
   *
   * @constructor
   *
   * @namedParams
   * @param {string} contentSpaceId - ID of the content space
   * @param {string} hostname - Hostname of the content fabric API
   * @param {string} port - Port of the content fabric API
   * @param {boolean} useHTTPS - Use HTTPS when communicating with the fabric
   * @param {string} ethHostname - Hostname of the blockchain RPC endpoint
   * @param {string} ethPort - Port of the blockchain RPC endpoint
   * @param {boolean} ethUseHTTPS - Use HTTPS when communicating with the blockchain
   * @param {boolean=} noCache=false - If enabled, blockchain transactions will not be cached
   *
   * @return {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  constructor({contentSpaceId, hostname, port, useHTTPS, ethHostname, ethPort, ethUseHTTPS, noCache=false}) {
    this.contentSpaceId = contentSpaceId;

    this.fabricURI = new URI()
      .protocol(useHTTPS ? "https" : "http")
      .host(hostname)
      .port(port);

    this.HttpClient = new HttpClient(this.fabricURI);

    this.ethereumURI = new URI()
      .protocol(ethUseHTTPS ? "https" : "http")
      .host(ethHostname)
      .port(ethPort)
      .path("")
      .hash("")
      .toString();

    this.ethClient = new EthClient(this.ethereumURI);
    // Throw error if authorization is attempted before setting the signer
    this.authClient = { AuthorizationHeader: () => { throw Error("Signer not set"); }};

    this.noCache = noCache;

    this.utils = Utils;

    this.contentTypes = {};
  }

  /**
   * Create a new ElvClient from a formatted configuration
   * @see TestConfiguration.json for format of configuration
   *
   * @namedParams
   * @param {Object} configuration - Configuration containing information on connecting
   * to the content fabric and blockchain
   *
   *
   * @returns {ElvClient} - New ElvClient connected to the specified content fabric and blockchain
   */
  static FromConfiguration({configuration}) {
    return new ElvClient({
      contentSpaceId: configuration.fabric.contentSpaceId,
      hostname: configuration.fabric.hostname,
      port: configuration.fabric.port,
      useHTTPS: configuration.fabric.use_https,
      ethHostname: configuration.ethereum.hostname,
      ethPort: configuration.ethereum.port,
      ethUseHTTPS: configuration.ethereum.use_https
    });
  }

  /* Wallet and signers */

  /**
   * Generate a new ElvWallet that is connected to the client's provider
   *
   * @returns {ElvWallet} - ElvWallet instance with this client's provider
   */
  GenerateWallet() {
    return new ElvWallet(this.ethereumURI);
  }

  /**
   * Set the signer for this client to use for blockchain transactions
   *
   * @namedParams
   * @param {object} signer - The ethers.js signer object
   */
  SetSigner({signer}) {
    signer.connect(new Ethers.providers.JsonRpcProvider(this.ethereumURI));
    this.signer = signer;

    this.authClient = new AuthorizationClient({
      ethClient: this.ethClient,
      contentSpaceId: this.contentSpaceId,
      signer: signer,
      noCache: this.noCache
    });
  }

  /* Content Spaces */

  /**
   * Deploy a new content space contract
   *
   * @namedParams
   * @param {String} name - Name of the content space
   *
   * @returns {Promise<contentSpaceId>} - Content space ID of the created content space
   */
  async CreateContentSpace({name}) {
    const contentSpaceAddress = await this.ethClient.DeployContentSpaceContract({name, signer: this.signer});

    return Utils.AddressToSpaceId({address: contentSpaceAddress});
  }

  /* Libraries */

  /**
   * List content libraries - returns a list of content library IDs
   *
   * @see GET /qlibs
   *
   * @returns {Promise<Array<string>>}
   */
  async ContentLibraries() {
    let path = Path.join("qlibs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Returns information about the content library
   *
   * @see GET /qlibs/:qlibid
   *
   * @namedParams
   * @param {string} libraryId
   *
   * @returns {Promise<*>}
   */
  async ContentLibrary({libraryId}) {
    let path = Path.join("qlibs", libraryId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Library creation and deletion */

  /**
   * Create a new content library.
   *
   * A new content library contract is deployed from
   * the content space, and that contract ID is used to determine the library ID to
   * create in the fabric.
   *
   * @see PUT /qlibs/:qlibid
   *
   * @namedParams
   * @param {string} name - Library name
   * @param {string} description - Library description
   * @param {blob=} image - Image associated with the library
   * @param {Object} publicMetadata - Public library metadata
   * @param {Object} privateMetadata - Private library metadata (metadata of library object)
   *
   * @returns {Promise<string>} - Library ID of created library
   */
  async CreateContentLibrary({
    name,
    description,
    image,
    publicMetadata={},
    privateMetadata={},
  }) {
    const { contractAddress, transactionHash } = await this.authClient.CreateContentLibrary();

    publicMetadata = Object.assign(
      {
        "eluv.name": name,
        "eluv.description": description
      },
      publicMetadata || {}
    );

    const libraryId = this.utils.AddressToLibraryId({address: contractAddress});
    const path = Path.join("qlibs", libraryId);

    // Create library in fabric
    await HandleErrors(
      this.HttpClient.Request({
        // Don't add libraryId to header or it will crash because the library doesn't exist yet
        headers: await this.authClient.AuthorizationHeader({transactionHash}),
        method: "PUT",
        path: path,
        body: {
          meta: publicMetadata,
          private_meta: privateMetadata
        }
      })
    );

    // Set library content object type
    const objectId = libraryId.replace("ilib", "iq__");

    const editResponse = await this.EditContentObject({
      libraryId,
      objectId,
      options: {
        type: "library"
      }
    });

    await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editResponse.write_token
    });

    // Upload image if provided
    if(image) {
      await this.SetContentLibraryImage({
        libraryId,
        image
      });
    }

    return libraryId;
  }

  /**
   * Set the image associated with this library
   *
   * @param {string} libraryId - ID of the library
   * @param {blob} image - Image to upload
   */
  async SetContentLibraryImage({libraryId, image}) {
    const objectId = libraryId.replace("ilib", "iq__");

    return this.SetContentObjectImage({
      libraryId,
      objectId,
      image
    });
  }

  /**
   * Set the image associated with this library
   *
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {blob} image - Image to upload
   */
  async SetContentObjectImage({libraryId, objectId, image}) {
    const editResponse = await this.EditContentObject({
      libraryId,
      objectId
    });

    const uploadResponse = await this.UploadPart({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      data: image
    });

    let metadata = await this.ContentObjectMetadata({
      libraryId,
      objectId
    });

    metadata = Object.assign(
      {
        "image": uploadResponse.part.hash,
        "eluv.image": uploadResponse.part.hash
      },
      metadata
    );

    await this.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadata
    });


    await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editResponse.write_token
    });
  }

  /**
   * Delete the specified content library
   *
   * @see DELETE /qlibs/:qlibid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library to delete
   */
  async DeleteContentLibrary({libraryId}) {
    let path = Path.join("qlibs", libraryId);

    return HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, update: true}),
        method: "DELETE",
        path: path
      })
    );
  }

  /* Library metadata */

  /**
   * Get the public metadata of the specified library
   *
   * @see GET /qlibs/:qlibid/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string=} metadataSubtree - Subtree of the library metadata to retrieve
   * @returns {Promise<Object>} - Public metadata of the library
   */
  async PublicLibraryMetadata({libraryId, metadataSubtree=""}) {
    let path = Path.join("qlibs", libraryId, "meta", metadataSubtree);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Replace the specified library's public metadata
   *
   * @see PUT /qlibs/:qlibid/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {Object} metadata - New metadata
   * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
   */
  async ReplacePublicLibraryMetadata({libraryId, metadataSubtree="", metadata={}}) {
    let path = Path.join("qlibs", libraryId, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, update: true}),
        method: "PUT",
        path: path,
        body: metadata
      })
    );
  }

  /* Content Types */

  /**
   * List the content types available in this content space
   *
   * @see test/ExampleOutput.txt for example response
   *
   * @returns {Promise<Object>}
   */
  async ContentTypes() {
    const contentSpaceAddress = this.utils.HashToAddress({hash: this.contentSpaceId});
    const typeLibraryId = this.utils.AddressToLibraryId({address: contentSpaceAddress});

    let path = Path.join("qlibs", typeLibraryId, "q");

    // Does the same as ContentObjects(), but authorization cannot be performed
    // against the content type library because it does not have a library contract
    const response = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );

    let contentTypes = {};
    response.contents
      .forEach(contentType => {
        const typeInfo = contentType.versions[0];
        if(!typeInfo.meta || !typeInfo.meta["eluv.name"]) { return; }

        contentTypes[typeInfo.meta["eluv.name"]] = {
          id: typeInfo.id,
          hash: typeInfo.hash
        };
      });

    // Cache content types for faster lookup
    this.contentTypes = Object.assign({}, contentTypes);

    return contentTypes;
  }

  /**
   * Look up content type record by name
   *
   * @namedParams
   * @param name
   *
   * @returns {Promise<Object>}
   */
  async ContentType({name}) {
    if(this.contentTypes[name]) {
      return this.contentTypes[name];
    } else {
      const contentTypes = await this.ContentTypes();

      if(!contentTypes[name]) {
        throw Error("Unknown content type: " + name);
      }

      return contentTypes[name];
    }
  }

  /**
   * Create a new content type.
   *
   * A new content type contract is deployed from
   * the content space, and that contract ID is used to determine the object ID to
   * create in the fabric. The content type object will be created in the special
   * content space library (ilib<content-space-hash>)
   *
   * @namedParams
   * @param {string} name - Name of the new content type
   * @param {(string|blob)} bitcode - Bitcode to be used for the content type
   *
   * @returns {Promise<string>} - Object ID of created content type
   */
  async CreateContentType({name, bitcode}) {
    const { contractAddress, transactionHash } = await this.authClient.CreateContentType();

    const contentSpaceAddress = this.utils.HashToAddress({hash: this.contentSpaceId});
    const typeLibraryId = this.utils.AddressToLibraryId({address: contentSpaceAddress});

    const objectId = this.utils.AddressToObjectId({address: contractAddress});
    const path = Path.join("qlibs", typeLibraryId, "q", objectId);

    /* Create object, upload bitcode and finalize */

    const createResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({transactionHash}),
        method: "PUT",
        path: path,
        body: {
          type: "",
          meta: {
            "eluv.name": name
          }
        }
      })
    );

    await this.UploadPart({
      libraryId: typeLibraryId,
      objectId,
      writeToken: createResponse.write_token,
      data: bitcode
    });

    await this.FinalizeContentObject({
      libraryId: typeLibraryId,
      objectId,
      writeToken: createResponse.write_token
    });

    return objectId;
  }

  /* Objects */

  /**
   * List content objects in the specified library
   *
   * @see /qlibs/:qlibid/q
   *
   * @namedParams
   * @param libraryId - ID of the library
   *
   * @returns {Promise<Array<Object>>} - List of objects in library
   */
  async ContentObjects({libraryId}) {
    let path = Path.join("qlibs", libraryId, "q");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Get a specific content object in the library
   *
   * @see /qlibs/:qlibid/q/:qhit
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Version of the object -- if not specified, latest version is returned
   *
   * @returns {Promise<Object>} - Description of created object
   */
  async ContentObject({libraryId, objectId, versionHash}) {
    let path = Path.join("q", versionHash || objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Get the metadata of a content object
   *
   * @see /qlibs/:qlibid/q/:qhit/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
   * @param {string=} metadataSubtree - Subtree of the object metadata to retrieve
   *
   * @returns {Promise<Object>} - Metadata of the content object
   */
  async ContentObjectMetadata({libraryId, objectId, versionHash, metadataSubtree=""}) {
    let path = Path.join("q", versionHash || objectId, "meta");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * List the versions of a content object
   *
   * @see /qlibs/:qlibid/qid/:objectid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   *
   * @returns {Promise<Object>} - Response containing versions of the object
   */
  async ContentObjectVersions({libraryId, objectId}) {
    let path = Path.join("qid", objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Content object creation, modification, deletion */

  /**
   * Create a new content object draft.
   *
   * A new content object contract is deployed from
   * the content library, and that contract ID is used to determine the object ID to
   * create in the fabric.
   *
   * @see PUT /qlibs/:qlibid/q/:objectid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {Object=} options -
   * type: Name of content type to use for the new object
   *
   * meta: Metadata to use for the new object
   *
   * @returns {Promise<Object>} - Response containing the object ID and write token of the draft
   */
  async CreateContentObject({libraryId, options={}}) {
    // Look up content type if type is specified
    if(options.type) {
      options.type = (await this.ContentType({name: options.type})).hash;
    }

    // Deploy contract
    const { contractAddress, transactionHash } = await this.authClient.CreateContentObject({libraryId});

    const objectId = this.utils.AddressToObjectId({address: contractAddress});
    const path = Path.join("q", objectId);

    return await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, transactionHash}),
        method: "PUT",
        path: path,
        body: options
      })
    );
  }

  /**
   * Create a new content object draft from an existing object.
   *
   * @see POST /qlibs/:qlibid/qid/:objectid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {Object=} options -
   * type: Name of content type to set the object to - will replace existing type if specified
   *
   * meta: New metadata for the object - will replace existing metadata if specified
   *
   * @returns {Promise<Object>} - Response containing the object ID and write token of the draft
   */
  async EditContentObject({libraryId, objectId, options={}}) {
    // Look up content type if type is specified
    if(options.type) {
      options.type = (await this.ContentType({name: options.type})).hash;
    }

    let path = Path.join("qid", objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
        path: path,
        body: options
      })
    );
  }

  /**
   * Finalize content draft
   *
   * @see POST /qlibs/:qlibid/q/:write_token
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   */
  async FinalizeContentObject({libraryId, objectId, writeToken}) {
    let path = Path.join("q", writeToken);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
        path: path
      })
    );
  }

  /**
   * Delete specified version of the content object
   *
   * @see DELETE /qlibs/:qlibid/q/:qhit
   *
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be deleted
   */
  async DeleteContentVersion({libraryId, objectId, versionHash}) {
    let path = Path.join("q", versionHash || objectId);

    return HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "DELETE",
        path: path
      })
    );
  }

  /**
   * Delete specified content object
   *
   * @see DELETE /qlibs/:qlibid/qid/:objectid
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   */
  async DeleteContentObject({libraryId, objectId}) {
    let path = Path.join("qid", objectId);

    return HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "DELETE",
        path: path
      })
    );
  }

  /* Content object metadata */

  /**
   * Merge specified metadata into existing content object metadata
   *
   * @see POST /qlibs/:qlibid/q/:write_token/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Object} metadata - New metadata to merge
   * @param {string=} metadataSubtree - Subtree of the object metadata to modify
   */
  async MergeMetadata({libraryId, objectId, writeToken, metadataSubtree="", metadata={}}) {
    let path = Path.join("q", writeToken, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
        path: path,
        body: metadata
      })
    );
  }

  /**
   * Replace content object metadata with specified metadata
   *
   * @see PUT /qlibs/:qlibid/q/:write_token/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {Object} metadata - New metadata to merge
   * @param {string=} metadataSubtree - Subtree of the object metadata to modify
   */
  async ReplaceMetadata({libraryId, objectId, writeToken, metadataSubtree="", metadata={}}) {
    let path = Path.join("q", writeToken, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "PUT",
        path: path,
        body: metadata
      })
    );
  }

  /**
   * Delete content object metadata of specified subtree
   *
   * @see DELETE /qlibs/:qlibid/q/:write_token/meta
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the draft
   * @param {string=} metadataSubtree - Subtree of the object metadata to modify
   * - if not specified, all metadata will be deleted
   */
  async DeleteMetadata({libraryId, objectId, writeToken, metadataSubtree=""}) {
    let path = Path.join("q", writeToken, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "DELETE",
        path: path
      })
    );
  }

  /* Files */

  async CreateFileUploadJob({libraryId, objectId, writeToken, fileInfo}) {
    let path = Path.join("q", writeToken, "upload_jobs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "POST",
        path: path,
        body: fileInfo
      })
    );
  }

  async UploadFileData({libraryId, objectId, writeToken, jobId, fileData}) {
    let path = Path.join("q", writeToken, "upload_jobs", jobId);

    return ResponseToJson(
      this.HttpClient.Request({
        method: "POST",
        path: path,
        body: fileData,
        bodyType: "BINARY",
        headers: Object.assign(
          await this.authClient.AuthorizationHeader({libraryId, objectId}),
          { "Content-type": "application/octet-stream" }
        )
      })
    );
  }

  async UploadJobStatus({libraryId, objectId, writeToken, jobId}) {
    let path = Path.join("q", writeToken, "upload_jobs", jobId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  async FinalizeUploadJobs({libraryId, objectId, writeToken}) {
    let path = Path.join("q", writeToken, "files");

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "POST",
        path: path
      })
    );
  }

  async DownloadFile({libraryId, objectId, versionHash, filePath, format="blob"}) {
    let path = Path.join("q", versionHash || objectId, "files", filePath);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Parts */

  /**
   * List content object parts
   *
   * @see GET /qlibs/:qlibid/q/:qhit/parts
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   *
   * @returns {Promise<Object>} - Response containing list of parts of the object
   */
  async ContentParts({libraryId, objectId, versionHash}) {
    let path = Path.join("q", versionHash || objectId, "parts");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Download all parts of an object
   *
   * @see GET /qlibs/:qlibid/q/:qhit/data
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string=} format - Format of the response - default is Blob
   *
   * @returns {Promise<Format>} - Part data in the specified format
   */
  async DownloadAllParts({libraryId, objectId, versionHash, format="blob"}) {
    let path = Path.join("q", versionHash || objectId, "data");

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Download specified part
   *
   * @see GET /qlibs/:qlibid/q/:qhit/data/:qparthash
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} partHash - Hash of the part to download
   * @param {string=} format - Format of the response - default is Blob
   *
   * @returns {Promise<Format>} - Part data in the specified format
   */
  async DownloadPart({libraryId, objectId, versionHash, partHash, format="blob"}) {
    let path = Path.join("q", versionHash || objectId, "data", partHash);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Upload part to an object draft
   *
   * @see POST /qlibs/:qlibid/q/:write_token/data
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {(string|blob)} data - Data to upload
   *
   * @returns {Promise<Object>} - Response containing information about the uploaded part
   */
  async UploadPart({libraryId, objectId, writeToken, data}) {
    let path = Path.join("q", writeToken, "data");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "POST",
        path: path,
        body: data,
        bodyType: "BINARY"
      })
    );
  }

  /**
   * Delete the specified part from a content draft
   *
   * @see DELETE /qlibs/:qlibid/q/:write_token/parts/:qparthash
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string} writeToken - Write token of the content object draft
   * @param {string} partHash - Hash of the part to delete
   */
  async DeletePart({libraryId, objectId, writeToken, partHash}) {
    let path = Path.join("q", writeToken, "parts", partHash);

    return HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
        method: "DELETE",
        path: path
      })
    );
  }

  /**
   * Generate a URL to the specified /call endpoint of a content object to call a bitcode method.
   * URL includes authorization token.
   *
   * @namedParmas
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} method - Bitcode method to call
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noCache - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached.
   *
   * @see FabricUrl for creating arbitrary fabric URLs
   *
   * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
   */
  async CallBitcodeMethod({libraryId, objectId, versionHash, method, queryParams={}, noCache=false}) {
    return this.FabricUrl({libraryId, objectId, versionHash, call: method, queryParams, noCache});
  }

  /**
   * Generate a URL to the specified /rep endpoint of a content object. URL includes authorization token.
   *
   * @namedParmas
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
   * @param {string} rep - Representation to use
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noCache - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached.
   *
   * @see FabricUrl for creating arbitrary fabric URLs
   *
   * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
   */
  async Rep({libraryId, objectId, versionHash, rep, queryParams={}, noCache=false}) {
    return this.FabricUrl({libraryId, objectId, versionHash, rep, queryParams, noCache});
  }

  /**
   * Generate a URL to the specified item in the content fabric with appropriate authorization token.
   *
   * @namedParmas
   * @param {string=} libraryId - ID of an library
   * @param {string=} objectId - ID of an object - Required if using versionHash
   * @param {string=} versionHash - Hash of an object version - If specified, will be used instead of objectID in URL
   * @param {string=} partHash - Hash of a part - Requires object ID
   * @param {string=} rep - Rep parameter of the url
   * @param {string=} call - Bitcode method to call
   * @param {Object=} queryParams - Query params to add to the URL
   * @param {boolean=} noCache - If specified, a new access request will be made for the authorization regardless of
   * whether such a request exists in the client cache. This request will not be cached.
   *
   * @returns {Promise<string>} - URL to the specified endpoint with authorization token
   *
   * @example client.FabricUrl({libraryId: "ilibVdci1v3nUgXdMxMznXny5NfaPRN"});
=> http://localhost:8008/qlibs/ilibVdci1v3nUgXdMxMznXny5NfaPRN?authorization=...

client.FabricUrl({libraryId: "ilibVdci1v3nUgXdMxMznXny5NfaPRN", objectId: "iq__4EwJBLZfKpdUSsF4h6pfk777pd5s"});
=> http://localhost:8008/qlibs/ilibVdci1v3nUgXdMxMznXny5NfaPRN/q/iq__4EwJBLZfKpdUSsF4h6pfk777pd5s?authorization=...

client.FabricUrl({
  libraryId: "ilibVdci1v3nUgXdMxMznXny5NfaPRN",
  objectId: "iq__4EwJBLZfKpdUSsF4h6pfk777pd5s",
  versionHash: "hq__QmNxqnnEakWBMyW3yxghJekadnxUSjaStjAhHqAp8yaBhL",
  partHash: "hqp_QmSYmLooWwynAzeJ54Gn1dMBnXnQTj6FMSSs3tLusCQFFB"
});
=> http://localhost:8008/qlibs/ilibVdci1v3nUgXdMxMznXny5NfaPRN/q/hq__QmNxqnnEakWBMyW3yxghJekadnxUSjaStjAhHqAp8yaBhL/data/hqp_QmSYmLooWwynAzeJ54Gn1dMBnXnQTj6FMSSs3tLusCQFFB?authorization=...
   */
  async FabricUrl({libraryId, objectId, versionHash, partHash, rep, call, queryParams={}, noCache=false}) {
    let path = "";

    if(libraryId) {
      path = Path.join(path, "qlibs", libraryId);

      if(objectId || versionHash) {
        path = Path.join(path, "q", versionHash || objectId);

        if(partHash){
          path = Path.join(path, "data", partHash);
        } else if(rep) {
          path = Path.join(path, "rep", rep);
        } else if(call) {
          path = Path.join(path, "call", call);
        }
      }
    }

    const authorization = (await this.authClient.AuthorizationHeader({libraryId, objectId, noCache}))
      .Authorization.replace("Bearer ", "");

    return this.HttpClient.URL({
      path: path,
      queryParams: Object.assign({
        authorization,
      }, queryParams)
    });
  }

  /* Naming */

  async GetByName({name}) {
    let path = Path.join("naming", name);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );
  }

  async SetByName({name, target}) {
    let path = Path.join("naming");

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({}),
        method: "PUT",
        path: path,
        body: {name, target}
      })
    );
  }

  async GetObjectByName({name}) {
    let response = await this.GetByName({name});

    let info = JSON.parse(response.target);

    if(!info.libraryId) {
      throw Error("No library ID");
    }

    if(!info.objectId) {
      throw Error("No content object ID");
    }

    let contentObjectData = await this.ContentObject({libraryId: info.libraryId, objectId: info.objectId});
    contentObjectData.meta = await this.ContentObjectMetadata({
      libraryId: info.libraryId,
      objectId: info.objectId
    });

    return contentObjectData;
  }

  SetObjectByName({name, libraryId, objectId}) {
    return this.SetByName({
      name,
      target: JSON.stringify({
        libraryId,
        objectId
      })
    });
  }

  async DeleteName({name}) {
    let path = Path.join("naming", name);

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({}),
        method: "DELETE",
        path: path
      })
    );
  }

  /* Verification */

  /**
   * Verify the specified content object
   *
   * @namedParams
   * @param {string} libraryId - ID of the library
   * @param {string} partHash - Hash of the content object version
   *
   * @returns {Promise<Object>} - Response describing verification results
   */
  VerifyContentObject({libraryId, partHash}) {
    return ContentObjectVerification.VerifyContentObject({
      client: this,
      libraryId: libraryId,
      partHash: partHash
    });
  }

  /**
   * Get the proofs associated with a given part
   *
   * @see GET /qlibs/:qlibid/q/:qhit/data/:qparthash/proofs
   *
   * @namedParmas
   * @param {string} libraryId - ID of the library
   * @param {string} objectId - ID of the object
   * @param {string=} versionHash - Hash of the object version - If not specified, latest version will be used
   * @param {string} partHash - Hash of the part
   *
   * @returns {Promise<Object>} - Response containing proof information
   */
  async Proofs({libraryId, objectId, versionHash, partHash}) {
    let path = Path.join("q", versionHash || objectId, "data", partHash, "proofs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /**
   * Get part info in CBOR format
   *
   * @see GET /qparts/:qparthash
   *
   * @namedParmas
   * @param {string} objectId - ID of the object - required for authentication
   * @param {string} partHash - Hash of the part
   * @param {string} format - Format to retrieve the response - defaults to Blob
   *
   * @returns {Promise<Format>} - Response containing the CBOR response in the specified format
   */
  async QParts({objectId, partHash, format="blob"}) {
    let path = Path.join("qparts", partHash);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.authClient.AuthorizationHeader({objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Contracts */

  /**
   * Format the arguments to be used for the specified method of the contract
   *
   * @namedParams
   * @param {Object} abi - ABI of contract
   * @param {string} methodName - Name of method for which arguments will be formatted
   * @param {Array<string>} args - List of arguments
   *
   * @returns {Array<string>} - List of formatted arguments
   */
  FormatContractArguments({abi, methodName, args}) {
    return this.ethClient.FormatContractArguments({abi, methodName, args});
  }

  /**
   * Deploy a contract from ABI and bytecode. This client's signer will be the owner of the contract.
   *
   * @namedParams
   * @param {Object} abi - ABI of contract
   * @param {string} bytecode - Bytecode of the contract
   * @param {Array<string>} constructorArgs - List of arguments to the contract constructor
   * - it is recommended to format these arguments using the FormatContractArguments method
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   *
   * @returns {Promise<Object>} - Response containing the deployed contract address and the transaction hash of the deployment
   */
  async DeployContract({abi, bytecode, constructorArgs, overrides={}}) {
    return await this.ethClient.DeployContract({abi, bytecode, constructorArgs, overrides, signer: this.signer});
  }

  /**
   * Call the specified method on a deployed contract. This action will be performed by this client's signer.
   *
   * NOTE: This method will only wait for the transaction to be created. If you want to wait for the transaction
   * to be mined, use the CallContractMethodAndWait method.
   *
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {string} methodName - Method to call on the contract
   * @param {Array<string>} methodArgs - List of arguments to the contract constructor
   * - it is recommended to format these arguments using the FormatContractArguments method
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   *
   * @returns {Promise<Object>} - Response containing information about the transaction
   */
  async CallContractMethod({contractAddress, abi, methodName, methodArgs, overrides={}}) {
    return await this.ethClient.CallContractMethod({contractAddress, abi, methodName, methodArgs, overrides, signer: this.signer});
  }

  /**
   * Call the specified method on a deployed contract and wait for the transaction to be mined.
   * This action will be performed by this client's signer.
   *
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {string} methodName - Method to call on the contract
   * @param {Array<string>} methodArgs - List of arguments to the contract constructor
   * - it is recommended to format these arguments using the FormatContractArguments method
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   *
   * @returns {Promise<Object>} - The event object of this transaction
   */
  async CallContractMethodAndWait({contractAddress, abi, methodName, methodArgs, overrides={}}) {
    return await this.ethClient.CallContractMethodAndWait({contractAddress, abi, methodName, methodArgs, overrides, signer: this.signer});
  }

  /**
   * Extract the specified value from the given event obtained from the CallContractAndMethodAndWait method
   *
   * @see "./src/EthClient#DeployDependentContract" and its callers for example usage
   *
   * @namedParams
   * @param {string} contractAddress - Address of the contract to call the specified method on
   * @param {Object} abi - ABI of contract
   * @param {Object} event - Event of the transaction from CallContractMethodAndWait
   * @param {string} eventName - Name of the event to parse
   * @param {string} eventValue - Name of the value to extract from the event
   *
   * @returns {Promise<*>} - The value extracted from the event
   */
  ExtractValueFromEvent({abi, event, eventName, eventValue}) {
    this.ethClient.ExtractValueFromEvent({abi, event, eventName, eventValue});
  }

  /**
   * Set the custom contract of the specified object with the contract at the specified address
   *
   * @param {string} objectId - ID of the object
   * @param {string} customContractAddress - Address of the deployed custom contract
   * @param {Object=} overrides - Change default gasPrice or gasLimit used for this action
   *
   * @returns {Promise<Object>} - Result transaction of calling the setCustomContract method on the content object contract
   */
  async SetCustomContentContract({objectId, customContractAddress, overrides={}}) {
    const contentContractAddress = Utils.HashToAddress({hash: objectId});
    return await this.ethClient.SetCustomContentContract({contentContractAddress, customContractAddress, overrides, signer: this.signer});
  }

  /* FrameClient related */

  // Whitelist of methods allowed to be called using the frame API
  FrameAllowedMethods() {
    const forbiddenMethods = [
      "constructor",
      "CallFromFrameMessage",
      "FrameAllowedMethods",
      "GenerateWallet",
      "SetSigner"
    ];

    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(method => !forbiddenMethods.includes(method));
  }

  // Call a method specified in a message from a frame
  async CallFromFrameMessage(message) {
    if(message.type !== "ElvFrameRequest") { return; }

    try {
      const method = message.calledMethod;
      if (!this.FrameAllowedMethods().includes(method)) {
        throw Error("Invalid method: " + method);
      }

      return this.utils.MakeClonable({
        type: "ElvFrameResponse",
        requestId: message.requestId,
        response: await this[method](message.args)
      });
    } catch(error) {
      return this.utils.MakeClonable({
        type: "ElvFrameResponse",
        requestId: message.requestId,
        error
      });
    }
  }
}

exports.ElvClient = ElvClient;
