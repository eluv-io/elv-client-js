const Utils = require("./Utils");
const UrlJoin = require("url-join");
const { FrameClient } = require("./FrameClient");
const {LogMessage} = require("./LogMessage");

class UserProfileClient {
  Log(message, error=false) {
    LogMessage(this, message, error);
  }

  /**
   * Methods used to access and modify information about the user
   *
   * <h4 id="PromptsAndAccessLevels">A note about access level and prompts: </h4>
   *
   * Note: This section only applies to applications working within Eluvio Core
   *
   * Users can choose whether or not their info is shared to applications. A user
   * may choose to allow open access to their profile, no access to their profile, or
   * they may choose to be prompted to give access when an application requests it. The
   * user's access level can be determined using the <a href="#AccessLevel">AccessLevel</a>
   * method.
   *
   * By default, users will be prompted to give access. For methods that access the user's private information,
   * Eluvio Core will intercept the request and prompt the user for permission before proceeding. In
   * these cases, the normal FrameClient timeout period will be ignored, and the response will come
   * only after the user accepts or rejects the request.
   *
   * Access and modification of user metadata is namespaced to the requesting application when using the
   * FrameClient. Public user metadata can be accessed using the PublicUserMetadata method.
   *
   * If the user refuses to give permission, an error will be thrown. Otherwise, the request will proceed
   * as normal.
   *
   * <h4>Usage</h4>
   *
   * Access the UserProfileClient from ElvClient or FrameClient via client.userProfileClient
   *
   * @example
let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

let wallet = client.GenerateWallet();
let signer = wallet.AddAccount({
  accountName: "Alice",
  privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
});
client.SetSigner({signer});

await client.userProfileClient.UserMetadata()

let frameClient = new FrameClient();
await client.userProfileClient.UserMetadata()
   *
   */
  constructor({client, debug}) {
    this.client = client;
    this.debug = debug;
    this.userWalletAddresses = {};
    this.walletAddress = undefined;
    this.walletAddressRetrieved = false;
  }

  async CreateWallet() {
    if(this.creatingWallet) {
      while(this.creatingWallet) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    this.creatingWallet = true;

    try {
      // Check if wallet contract exists
      if(!this.walletAddress || Utils.EqualAddress(this.walletAddress, Utils.nullAddress)) {
        this.Log(`Creating user wallet for user ${this.client.signer.address}`);

        // Don't attempt to create a user wallet if user has no funds
        const balance = await this.client.GetBalance({address: this.client.signer.address});
        if(balance < 0.1) {
          return undefined;
        }

        const walletCreationEvent = await this.client.CallContractMethodAndWait({
          contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
          methodName: "createAccessWallet",
          methodArgs: []
        });

        const abi = await this.client.ContractAbi({contractAddress: this.client.contentSpaceAddress});
        this.walletAddress = this.client.ExtractValueFromEvent({
          abi,
          event: walletCreationEvent,
          eventName: "CreateAccessWallet",
          eventValue: "wallet"
        });

        this.userWalletAddresses[Utils.FormatAddress(this.client.signer.address)] = this.walletAddress;
      }

      // Check if wallet object is created
      const libraryId = this.client.contentSpaceLibraryId;
      const objectId = Utils.AddressToObjectId(this.walletAddress);

      try {
        await this.client.ContentObject({libraryId, objectId});
      } catch(error) {
        if(error.status === 404) {
          this.Log(`Creating wallet object for user ${this.client.signer.address}`);
          const createResponse = await this.client.CreateContentObject({libraryId, objectId});

          await this.client.FinalizeContentObject({
            libraryId,
            objectId,
            writeToken: createResponse.write_token,
            commitMessage: "Create user wallet object"
          });
        }
      }
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to create wallet contract:");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      this.creatingWallet = false;
    }
  }

  /**
   * Get the contract address of the current user's BaseAccessWallet contract
   *
   * @return {Promise<string>} - The contract address of the current user's wallet contract
   */
  async WalletAddress(autoCreate = true) {
    if(this.walletAddress || this.walletAddressRetrieved) {
      return this.walletAddress;
    }

    if(!this.walletAddressPromise) {
      this.walletAddressPromise = this.client.CallContractMethod({
        contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
        methodName: "userWallets",
        methodArgs: [this.client.signer.address]
      });
    }

    const walletAddress = await this.walletAddressPromise;

    if(!Utils.EqualAddress(walletAddress, Utils.nullAddress)) {
      this.walletAddress = walletAddress;
    }

    if(!this.walletAddress && autoCreate) {
      await this.CreateWallet();
    }

    this.walletAddressRetrieved = true;

    return this.walletAddress;
  }

  /**
   * Get the user wallet address for the specified user, if it exists
   *
   * @namedParams
   * @param {string} address - The address of the user
   *
   * @return {Promise<string>} - The wallet address of the specified user, if it exists
   */
  async UserWalletAddress({address}) {
    if(Utils.EqualAddress(address, this.client.signer.address)) {
      return await this.WalletAddress();
    }

    if(!this.userWalletAddresses[address]) {
      this.Log(`Retrieving user wallet address for user ${address}`);

      const walletAddress =
        await this.client.CallContractMethod({
          contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
          methodName: "userWallets",
          methodArgs: [address]
        });

      if(!Utils.EqualAddress(walletAddress, Utils.nullAddress)) {
        this.userWalletAddresses[address] = walletAddress;
      }
    }

    return this.userWalletAddresses[address];
  }

  /**
   * Retrieve the user wallet object information (library ID and object ID)
   *
   * The user's wallet can be modified in the same way as any other object, using
   * EditContentObject to get a write token, modification methods to change it,
   * and FinalizeContentObject to finalize the draft
   *
   * @return {Promise<{Object}>} - An object containing the libraryId and objectId for the wallet object.
   */
  async UserWalletObjectInfo({address}={}) {

    const walletAddress = address ?
      await this.UserWalletAddress({address}) :
      await this.WalletAddress();

    return {
      libraryId: this.client.contentSpaceLibraryId,
      objectId: walletAddress ? Utils.AddressToObjectId(walletAddress) : ""
    };
  }

  /**
   * Access the specified user's public profile metadata
   *
   * @namedParams
   * @param {string=} address - The address of the user
   * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
   * @param {Object=} queryParams={} - Additional query params for the call
   * @param {Array<string>=} select - Limit the returned metadata to the specified attributes
   * - Note: Selection is relative to "metadataSubtree". For example, metadataSubtree="public" and select=["name", "description"] would select "public/name" and "public/description"
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
   *
   * @return {Promise<Object|string>}
   */
  async PublicUserMetadata({
    address,
    metadataSubtree="/",
    queryParams={},
    select=[],
    resolveLinks=false,
    resolveIncludeSource=false,
    resolveIgnoreErrors=false,
    linkDepthLimit=1
  }) {
    if(!address) {
      return;
    }

    const walletAddress = await this.UserWalletAddress({address});

    if(!walletAddress) {
      return;
    }

    metadataSubtree = UrlJoin("public", metadataSubtree || "/");

    const { libraryId, objectId } = await this.UserWalletObjectInfo({address});

    if(!objectId) {
      return;
    }

    return await this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      queryParams,
      select,
      metadataSubtree,
      resolveLinks,
      resolveIncludeSource,
      resolveIgnoreErrors,
      linkDepthLimit
    });
  }

  /**
   * Access the current user's metadata
   *
   * Note: Subject to user's access level
   *
   * @see <a href="#PromptsAndAccessLevels">Prompts and access levels</a>
   *
   * @namedParams
   * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
   * @param {Object=} queryParams={} - Additional query params for the call
   * @param {Array<string>=} select - Limit the returned metadata to the specified attributes
   * - Note: Selection is relative to "metadataSubtree". For example, metadataSubtree="public" and select=["name", "description"] would select "public/name" and "public/description"
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
   *
   * @return {Promise<Object|string>} - The user's profile metadata - returns undefined if no metadata set or subtree doesn't exist
   */
  async UserMetadata({
    metadataSubtree="/",
    queryParams={},
    select=[],
    resolveLinks=false,
    resolveIncludeSource=false,
    resolveIgnoreErrors=false,
    linkDepthLimit=1
  }={}) {
    this.Log(`Accessing private user metadata at ${metadataSubtree}`);

    const { libraryId, objectId } = await this.UserWalletObjectInfo();

    return await this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree,
      queryParams,
      select,
      resolveLinks,
      resolveIncludeSource,
      resolveIgnoreErrors,
      linkDepthLimit
    });
  }

  /**
   * Merge the current user's profile metadata
   *
   * @namedParams
   * @param {Object} metadata - New metadata
   * @param {string=} metadataSubtree - Subtree to merge into - modifies root metadata if not specified
   */
  async MergeUserMetadata({metadataSubtree="/", metadata={}}) {
    this.Log(`Merging user metadata at ${metadataSubtree}`);

    const { libraryId, objectId } = await this.UserWalletObjectInfo();

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.MergeMetadata({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      metadataSubtree,
      metadata
    });
    await this.client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      commitMessage: "Merge user metadata"
    });
  }

  /**
   * Replace the current user's profile metadata
   *
   * @namedParams
   * @param {Object} metadata - New metadata
   * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
   */
  async ReplaceUserMetadata({metadataSubtree="/", metadata={}}) {
    this.Log(`Replacing user metadata at ${metadataSubtree}`);

    const { libraryId, objectId } = await this.UserWalletObjectInfo();

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      metadataSubtree,
      metadata
    });
    await this.client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      commitMessage: "Replace user metadata"
    });
  }

  /**
   * Delete the specified subtree from the users profile metadata
   *
   * @namedParams
   * @param {string=} metadataSubtree - Subtree to delete - deletes all metadata if not specified
   */
  async DeleteUserMetadata({metadataSubtree="/"}) {
    this.Log(`Deleting user metadata at ${metadataSubtree}`);

    const { libraryId, objectId } = await this.UserWalletObjectInfo();

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.DeleteMetadata({libraryId, objectId, writeToken: editRequest.write_token, metadataSubtree});
    await this.client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      commitMessage: "Delete user metadata"
    });
  }

  /**
   * Return the permissions the current user allows for apps to access their profile.
   *
   * "private" - No access allowed
   * "prompt" - (default) - When access is requested by an app, the user will be prompted to give permission
   * "public - Public - Any access allowed
   *
   * @return {Promise<string>} - Access setting
   */
  async AccessLevel() {
    return (await this.UserMetadata({metadataSubtree: "access_level"})) || "prompt";
  }

  /**
   * Set the current user's access level.
   *
   * Note: This method is not accessible to applications. Eluvio core will drop the request.
   *
   * @namedParams
   * @param level
   */
  async SetAccessLevel({level}) {
    level = level.toLowerCase();

    if(!["private", "prompt", "public"].includes(level)) {
      throw new Error("Invalid access level: " + level);
    }

    await this.ReplaceUserMetadata({metadataSubtree: "access_level", metadata: level});
  }

  /**
   * Return the ID of the tenant this user belongs to, if set.
   *
   * @return {Promise<string>} - Tenant ID
   */
  async TenantId() {
    if(!this.tenantId) {
      this.tenantId = await this.UserMetadata({metadataSubtree: "tenantId"});
    }

    return this.tenantId;
  }

  /**
   * Set the current user's tenant
   *
   * Note: This method is not accessible to applications. Eluvio core will drop the request.
   *
   * @namedParams
   * @param {string} id - The tenant ID in hash format
   * @param {string} address - The group address to use in the hash if id is not provided
   */
  async SetTenantId({id, address}) {
    if(id && (!id.startsWith("iten") || !Utils.ValidHash(id))) {
      throw Error(`Invalid tenant ID: ${id}`);
    }

    if(address) {
      if(!Utils.ValidAddress(address)) {
        throw Error(`Invalid address: ${address}`);
      }

      id = `iten${Utils.AddressToHash(address)}`;
    }

    try {
      const version = await this.client.AccessType({id});

      if(version !== this.client.authClient.ACCESS_TYPES.GROUP) {
        throw Error("Invalid tenant ID: " + id);
      }
    } catch(error) {
      throw Error("Invalid tenant ID: " + id);
    }

    await this.ReplaceUserMetadata({metadataSubtree: "tenantId", metadata: id});

    this.tenantId = id;
  }

  /**
   * Return the ID of the tenant contract this user belongs to, if set.
   *
   * @return {Promise<string>} - Tenant Contract ID
   */
  async TenantContractId() {
    if(!this.tenantContractId) {
      const {libraryId, objectId} = await this.UserWalletObjectInfo();
      this.tenantContractId = await this.client.TenantContractId(
        libraryId,
        objectId
      );
    }
    return this.tenantContractId;
  }

  /**
   * Set the current user's tenant contract.
   *
   * Note: This method is not accessible to applications. Eluvio core will drop the request.
   *
   * @namedParams
   * @param {string} tenantContractId - The tenant contract ID in hash format
   * @param {string} address - The tenant address to use in the hash if id is not provided
   */
  async SetTenantContractId({tenantContractId}) {
    const {objectId} = await this.UserWalletObjectInfo();

    const tenantInfo = await this.client.SetTenantContractId(
      this.client.utils.HashToAddress(objectId),
      tenantContractId
    );
    this.tenantContractId = tenantInfo.tenantContractId;
  }

  /**
   * Get the URL of the current user's profile image
   *
   * Note: Part hash of profile image will be appended to the URL as a query parameter to invalidate
   * browser caching when the image is updated
   *
   * @namedParams
   * @param {string=} address - The address of the user. If not specified, the address of the current user will be used.
   * @param {number=} height - If specified, the image will be scaled to the specified maximum height
   *
   * @see <a href="Utils.html#.ResizeImage">Utils#ResizeImage</a>
   *
   * @return {Promise<string | undefined>} - URL of the user's profile image. Will be undefined if no profile image is set.
   */
  async UserProfileImage({address, height}={}) {
    let walletAddress;
    if(address) {
      walletAddress = await this.UserWalletAddress({address});
    } else {
      address = this.client.signer.address;
      walletAddress = this.walletAddress;
    }

    if(!walletAddress) { return; }

    const { libraryId, objectId } = await this.UserWalletObjectInfo({address});
    return this.client.ContentObjectImageUrl({libraryId, objectId, height, imagePath: "public/profile_image"});
  }

  /**
   * Set a new profile image for the current user
   *
   * @namedParams
   * @param {blob} image - The new profile image for the current user
   */
  async SetUserProfileImage({image}) {
    this.Log(`Setting profile image for user ${this.client.signer.address}`);

    const size = image.length || image.byteLength || image.size;
    if(size > 5000000) {
      throw Error("Maximum profile image size is 5MB");
    }

    const { libraryId, objectId } = await this.UserWalletObjectInfo();

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.SetContentObjectImage({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      image,
      imageName: "profile_image",
      imagePath: "public/profile_image"
    });

    await this.client.FinalizeContentObject({libraryId, objectId, writeToken: editRequest.write_token, commitMessage: "Set user profile image"});
  }

  /**
   * Get the accumulated tags for the current user
   *
   * Note: Subject to user's access level
   *
   * @see <a href="#PromptsAndAccessLevels">Prompts and access levels</a>
   *
   * @return {Promise<Object>} - User tags
   */
  async CollectedTags() {
    return await this.UserMetadata({metadataSubtree: "collected_data"}) || {};
  }

  // Ensure recording tags never causes action to fail
  async RecordTags({libraryId, objectId, versionHash}) {
    try {
      await this.__RecordTags({libraryId, objectId, versionHash});
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  async __RecordTags({libraryId, objectId, versionHash}) {
    const accessType = await this.client.AccessType({id: objectId});
    if(accessType !== "object") { return; }

    if(!versionHash && !libraryId) {
      libraryId = await this.client.ContentObjectLibraryId({objectId});
    }

    if(!versionHash) {
      versionHash = (await this.client.ContentObject({libraryId, objectId})).hash;
    }

    // If this object has already been seen, don't re-record tags
    const seen = await this.UserMetadata({metadataSubtree: UrlJoin("accessed_content", versionHash)});
    if(seen) { return; }

    const walletObjectInfo = await this.UserWalletObjectInfo();
    const userLibraryId = walletObjectInfo.libraryId;
    const userObjectId = walletObjectInfo.objectId;

    // Mark content as seen
    const editRequest = await this.client.EditContentObject({libraryId: userLibraryId, objectId: userObjectId});
    await this.client.ReplaceMetadata({
      libraryId: userLibraryId,
      objectId: userObjectId,
      writeToken: editRequest.write_token,
      metadataSubtree: UrlJoin("accessed_content", versionHash),
      metadata: Date.now()
    });

    const contentTags = await this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      versionHash,
      metadataSubtree: "video_tags"
    });

    if(contentTags && contentTags.length > 0) {
      let userTags = await this.CollectedTags();
      const formattedTags = this.__FormatVideoTags(contentTags);

      Object.keys(formattedTags).forEach(tag => {
        if(userTags[tag]) {
          // User has seen this tag before
          userTags[tag].occurrences += 1;
          userTags[tag].aggregate += formattedTags[tag];
        } else {
          // New tag
          userTags[tag] = {
            occurrences: 1,
            aggregate: formattedTags[tag]
          };
        }
      });

      // Update user tags
      await this.client.ReplaceMetadata({
        libraryId: userLibraryId,
        objectId: userObjectId,
        writeToken: editRequest.write_token,
        metadataSubtree: "collected_data",
        metadata: userTags
      });
    }

    await this.client.FinalizeContentObject({
      libraryId: userLibraryId,
      objectId: userObjectId,
      writeToken: editRequest.write_token,
      commitMessage: "Record user tags",
      awaitCommitConfirmation: false
    });
  }

  /*
    Format video tags into an easier format and average scores
    Example content tags:
    [
    {
      "tags": [
        {
          "score": 0.3,
          "tag": "cherry"
        },
        {
          "score": 0.8,
          "tag": "chocolate"
        },
        {
          "score": 0.6,
          "tag": "boat"
        }
      ],
      "time_in": "00:00:00.000",
      "time_out": "00:03:00.000"
    },
    ...
    ]
 */
  __FormatVideoTags(videoTags) {
    let collectedTags = {};

    videoTags.forEach(videoTag => {
      const tags = videoTag["tags"];

      tags.forEach(tag => {
        if(collectedTags[tag.tag]) {
          collectedTags[tag.tag].occurrences += 1;
          collectedTags[tag.tag].aggregate += tag.score;
        } else {
          collectedTags[tag.tag] = {
            occurrences: 1,
            aggregate: tag.score
          };
        }
      });
    });

    let formattedTags = {};
    Object.keys(collectedTags).forEach(tag => {
      formattedTags[tag] = collectedTags[tag].aggregate / collectedTags[tag].occurrences;
    });

    return formattedTags;
  }

  // List of methods that may require a prompt - these should have an unlimited timeout period
  PromptedMethods() {
    return FrameClient.PromptedMethods();
  }

  // List of methods for accessing user metadata - these should be namespaced when used by an app
  MetadataMethods() {
    return FrameClient.MetadataMethods();
  }

  // Whitelist of methods allowed to be called using the frame API
  FrameAllowedMethods() {
    const forbiddenMethods = [
      "constructor",
      "FrameAllowedMethods",
      "Log",
      "MetadataMethods",
      "PromptedMethods",
      "RecordTags",
      "SetAccessLevel",
      "SetTenantId",
      "SetUserProfileImage",
      "__IsLibraryCreated",
      "__TouchLibrary",
      "__FormatVideoTags",
      "__RecordTags"
    ];

    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(method => !forbiddenMethods.includes(method));
  }
}

module.exports = UserProfileClient;
