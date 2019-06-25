const Utils = require("./Utils");
const UrlJoin = require("url-join");

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
   * If the user refuses to give permission, an error will be thrown. Otherwise, the request will proceed
   * as normal.
   *
   * For all prompted methods, an extra argument "requestor" is required.
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

await client.userProfileClient.UserMetadata({accountAddress: signer.address})

let frameClient = new FrameClient();
await client.userProfileClient.UserMetadata({accountAddress: signer.address})
   *
   */
  constructor({client}) {
    this.client = client;

    this.libraryCreated = false;
    this.cachedPrivateMetadata = undefined;
  }

  /**
   * Get the contract address of the current user's BaseAccessWallet contract
   *
   * @return {Promise<string>} - The contract address of the current user's wallet contract
   */
  async WalletAddress() {
    if(!this.walletAddress) {
      // Get existing wallet contract address
      this.walletAddress = await this.client.CallContractMethod({
        abi: SpaceContract.abi,
        contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
        methodName: "userWallets",
        methodArgs: [this.client.signer.address]
      });

      // No wallet contract for the current user - create one
      if(!this.walletAddress || this.walletAddress === Utils.nullAddress) {
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
    }

    return this.walletAddress;
  }

  async Initialize() {
    const walletAddress = await this.WalletAddress();
    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(walletAddress);

    try {
      // Ensure wallet object is created
      await this.client.ContentObject({libraryId, objectId});
    } catch(error) {
      if(error.status === 404) {
        const createResponse = await this.client.CreateContentObject({libraryId, objectId, options: {type: "library"}});
        await this.client.FinalizeContentObject({libraryId, objectId, writeToken: createResponse.write_token});
      }
    }
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
   * @return {Promise<Object>} - The user's profile metadata - returns undefined if no metadata set or subtree doesn't exist
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
        libraryId:
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
   * @return {Promise<string | undefined>} - URL of the user's profile image. Will be undefined if no profile image is set.
   */
  async UserProfileImage() {
    const imageHash = await this.UserMetadata({metadataSubtree: "image"});

    if(!imageHash) { return; }

    const libraryId = this.client.contentSpaceLibraryId;
    const objectId = Utils.AddressToObjectId(await this.WalletAddress());

    return await this.client.Rep({
      libraryId,
      objectId,
      rep: "image",
      queryParams: {hash: imageHash}
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

    await this.client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: editRequest.write_token,
      metadataSubtree: "image",
      metadata: uploadResponse.part.hash
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
      metadataSubtree: "video_tags",
      noAuth: true
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
    return [
      "CollectedTags",
      "UserMetadata"
    ];
  }

  // Whitelist of methods allowed to be called using the frame API
  FrameAllowedMethods() {
    const forbiddenMethods = [
      "constructor",
      "FrameAllowedMethods",
      "PromptedMethods",
      "SetAccessLevel",
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
