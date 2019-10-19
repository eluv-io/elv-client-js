const Utils = require("./Utils");
const UrlJoin = require("url-join");
const { FrameClient } = require("./FrameClient");

const SpaceContract = require("./contracts/BaseContentSpace");

class UserProfileClient {
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
  constructor({client}) {
    this.client = client;
    this.userWalletAddresses = {};
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
    if(!this.userWalletAddresses[address]) {
      const walletAddress =
        await this.client.CallContractMethod({
          abi: SpaceContract.abi,
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
   * Get the contract address of the current user's BaseAccessWallet contract
   *
   * @return {Promise<string>} - The contract address of the current user's wallet contract
   */
  async WalletAddress() {
    if(this.walletAddress) { return this.walletAddress; }

    this.walletAddress = await this.UserWalletAddress({address: this.client.signer.address});

    // No wallet contract for the current user - create one
    if(!this.walletAddress || this.walletAddress === Utils.nullAddress) {
      // Don't attempt to create a user wallet if user has no funds
      const balance = await this.client.GetBalance({address: this.client.signer.address});
      if(balance < 0.1) {
        return undefined;
      }

      const walletCreationEvent = await this.client.CallContractMethodAndWait({
        contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
        abi: SpaceContract.abi,
        methodName: "createAccessWallet",
        methodArgs: []
      });

      this.walletAddress = this.client.ExtractValueFromEvent({
        abi: SpaceContract.abi,
        event: walletCreationEvent,
        eventName: "CreateAccessWallet",
        eventValue: "wallet"
      });
    }

    // Ensure wallet object is created
    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(this.walletAddress);

    try {
      await this.client.ContentObject({libraryId, objectId});
    } catch(error) {
      if(error.status === 404) {
        const createResponse = await this.client.CreateContentObject({libraryId, objectId});

        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken: createResponse.write_token,
          metadata: {
            "bitcode_flags": "abrmaster",
            "bitcode_format": "builtin"
          }
        });

        await this.client.FinalizeContentObject({
          libraryId,
          objectId,
          writeToken: createResponse.write_token
        });
      }
    }

    return this.walletAddress;
  }

  __InvalidateCache() {
    this.cachedPrivateMetadata = undefined;
  }

  __CacheMetadata(metadata) {
    this.cachedPrivateMetadata = metadata;
  }

  __GetCachedMetadata(subtree) {
    subtree = subtree.replace(/\/*/, "");

    if(!subtree) { return this.cachedPrivateMetadata; }

    let pointer = this.cachedPrivateMetadata || {};

    subtree = subtree.replace(/\/*/, "");

    const keys = subtree.split("/");
    for(let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if(!pointer || !pointer.hasOwnProperty(key)) {
        return undefined;
      }

      pointer = pointer[key];
    }

    const lastKey = keys[keys.length - 1];
    if(pointer && pointer.hasOwnProperty(lastKey)) {
      return pointer[lastKey];
    }
  }

  /**
   * Access the specified user's public profile metadata
   *
   * @namedParams
   * @param {string=} address - The address of the user
   * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
   *
   * @return {Promise<Object|string>}
   */
  async PublicUserMetadata({address, metadataSubtree="/"}) {
    const walletAddress = await this.UserWalletAddress({address});

    if(!walletAddress) { return; }

    metadataSubtree = UrlJoin("public", metadataSubtree || "/");

    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(walletAddress);

    // If caching not enabled, make direct query to object
    return await this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree
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
   * @param {boolean=} noCache=false - If specified, it will always query for metadata instead of returning from the cache
   *
   * @return {Promise<Object|string>} - The user's profile metadata - returns undefined if no metadata set or subtree doesn't exist
   */
  async UserMetadata({metadataSubtree="/", noCache=false}={}) {
    if(!noCache && this.cachedPrivateMetadata) {
      return this.__GetCachedMetadata(metadataSubtree);
    }

    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(await this.WalletAddress());

    // If caching not enabled, make direct query to object
    if(noCache) {
      return await this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree
      });
    }

    // If caching is enabled, just get all the metadata and store it.
    const metadata = await this.client.ContentObjectMetadata({libraryId, objectId});
    this.__CacheMetadata(metadata);
    return this.__GetCachedMetadata(metadataSubtree);
  }

  /**
   * Merge the current user's profile metadata
   *
   * @namedParams
   * @param {Object} metadata - New metadata
   * @param {string=} metadataSubtree - Subtree to merge into - modifies root metadata if not specified
   */
  async MergeUserMetadata({metadataSubtree="/", metadata={}}) {
    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(await this.WalletAddress());

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.MergeMetadata({libraryId, objectId, writeToken: editRequest.write_token, metadataSubtree, metadata});
    await this.client.FinalizeContentObject({libraryId, objectId, writeToken: editRequest.write_token});

    this.__InvalidateCache();
  }

  /**
   * Replace the current user's profile metadata
   *
   * @namedParams
   * @param {Object} metadata - New metadata
   * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
   */
  async ReplaceUserMetadata({metadataSubtree="/", metadata={}}) {
    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(await this.WalletAddress());

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.ReplaceMetadata({libraryId, objectId, writeToken: editRequest.write_token, metadataSubtree, metadata});
    await this.client.FinalizeContentObject({libraryId, objectId, writeToken: editRequest.write_token});

    this.__InvalidateCache();
  }

  /**
   * Delete the specified subtree from the users profile metadata
   *
   * @namedParams
   * @param {string=} metadataSubtree - Subtree to delete - deletes all metadata if not specified
   */
  async DeleteUserMetadata({metadataSubtree="/"}) {
    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(await this.WalletAddress());

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.DeleteMetadata({libraryId, objectId, writeToken: editRequest.write_token, metadataSubtree});
    await this.client.FinalizeContentObject({libraryId, objectId, writeToken: editRequest.write_token});

    this.__InvalidateCache();
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
   * Get the URL of the current user's profile image
   *
   * Note: Part hash of profile image will be appended to the URL as a query parameter to invalidate
   * browser caching when the image is updated
   *
   * @namedParams
   * @param {string=} address - The address of the user. If not specified, the address of the current user will be used.
   *
   * @return {Promise<string | undefined>} - URL of the user's profile image. Will be undefined if no profile image is set.
   */
  async UserProfileImage({address}={}) {
    let walletAddress;
    if(address) {
      walletAddress = await this.UserWalletAddress({address});
    } else {
      address = this.client.signer.address;
      walletAddress = this.walletAddress;
    }

    if(!walletAddress) { return; }

    const imageHash = await this.PublicUserMetadata({address, metadataSubtree: "image"});

    if(!imageHash) { return; }

    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(walletAddress);

    return await this.client.PublicRep({
      libraryId,
      objectId,
      rep: "image",
      queryParams: {hash: imageHash},
      noAuth: true,
      channelAuth: false
    });
  }

  /**
   * Set a new profile image for the current user
   *
   * @namedParams
   * @param {blob} image - The new profile image for the current user
   */
  async SetUserProfileImage({image}) {
    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(await this.WalletAddress());

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    const uploadResponse = await this.client.UploadPart({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      data: image
    });

    await this.client.MergeMetadata({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      metadata: {
        image: uploadResponse.part.hash
      }
    });

    await this.client.MergeMetadata({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      metadataSubtree: "public",
      metadata: {
        image: uploadResponse.part.hash
      }
    });

    await this.client.FinalizeContentObject({libraryId, objectId, writeToken: editRequest.write_token});

    this.__InvalidateCache();
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

    this.__InvalidateCache();
  }

  async __RecordTags({libraryId, objectId, versionHash}) {
    if(!versionHash) {
      versionHash = (await this.client.ContentObject({libraryId, objectId})).hash;
    }

    // If this object has already been seen, don't re-record tags
    const seen = await this.UserMetadata({metadataSubtree: UrlJoin("accessed_content", versionHash)});
    if(seen) { return; }

    const userLibraryId = this.client.contentSpaceLibraryId;
    const userObjectId = Utils.AddressToObjectId(await this.WalletAddress());

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

    await this.client.FinalizeContentObject({libraryId: userLibraryId, objectId: userObjectId, writeToken: editRequest.write_token});
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
      "PromptedMethods",
      "RecordTags",
      "SetAccessLevel",
      "SetUserProfileImage",
      "__CacheMetadata",
      "__GetCachedMetadata",
      "__InvalidateCache",
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
