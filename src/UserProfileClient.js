const Path = require("path");
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
   * Access the UserProfileClient from ElvClient or FrameClient via client.userProfile
   *
   * @example
let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

let wallet = client.GenerateWallet();
let signer = wallet.AddAccount({
  accountName: "Alice",
  privateKey: "0xbf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6"
});
client.SetSigner({signer});

await client.userProfile.PublicUserMetadata({accountAddress: signer.address})

let frameClient = new FrameClient();
await client.userProfile.PublicUserMetadata({accountAddress: signer.address})
   *
   */
  constructor({client}) {
    this.client = client;
  }

  /**
   * Create an account library for the current user
   *
   * @namedParams
   * @param {object=} publicMetadata - Publicly accessible metadata
   * @param {object=} privateMetadata - Metadata accessible only by this user
   * @param {blob=} image - Profile image for this user
   *
   * @return {Promise<string|*>} - The ID of the created library
   */
  async CreateAccountLibrary({publicMetadata={}, privateMetadata={}, image}={}) {
    if(await this.__IsLibraryCreated({accountAddress: this.client.signer.address})) {
      return Utils.AddressToLibraryId(this.client.signer.address);
    }

    // Initialize fields
    privateMetadata = {
      ...privateMetadata,
      access_level: "prompt",
      collected_data: {}
    };

    const libraryId = await this.client.CreateContentLibrary({
      publicMetadata,
      privateMetadata,
      image,
      isUserLibrary: true
    });

    if(image) {
      const imageHash = await this.PrivateUserMetadata({metadataSubtree: "image"});
      await this.ReplacePublicUserMetadata({metadataSubtree: "image", metadata: imageHash});
    }

    return libraryId;
  }

  // Create the library if it doesn't yet exist
  async __TouchLibrary() {
    if(this.client.signer) {
      if (!(await this.__IsLibraryCreated({accountAddress: this.client.signer.address}))) {
        await this.CreateAccountLibrary();
      }
    }
  }

  // Check if the account library exists
  // TODO: Change logic when user libraries are properly implemented
  async __IsLibraryCreated({accountAddress}) {
    const libraryId = Utils.AddressToLibraryId(accountAddress);

    const libraryIds = await this.client.ContentLibraries();
    return libraryIds.find(id => id === libraryId);
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
    return (await this.PrivateUserMetadata({metadataSubtree: "access_level"})) || "prompt";
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
    if(!["private", "prompt", "public"].includes(level.toLowerCase())) { return; }

    await this.ReplacePrivateUserMetadata({metadataSubtree: "access_level", metadata: level.toLowerCase()});
  }

  /**
   * Get the URL of the specified user's profile image
   *
   * Note: Part hash of profile image will be appended to the URL as a query parameter in order to ensure browsers
   * won't serve old cached versions when the image is updated
   *
   * @namedParams
   * @param {string} accountAddress - Address of the user account
   * @return {Promise<string | undefined>} - URL of the user's profile image. Will be undefined if no profile image is set.
   */
  async UserProfileImage({accountAddress}) {
    const libraryId = Utils.AddressToLibraryId(accountAddress);
    const objectId = Utils.AddressToObjectId(accountAddress);

    // Ensure library is created
    if(!(await this.__IsLibraryCreated({accountAddress}))) { return; }

    // Ensure image is set
    const imageHash = await this.PublicUserMetadata({accountAddress, metadataSubtree: "image"});
    if(!imageHash) { return; }

    return await this.client.Rep({libraryId, objectId, rep: "image", queryParams: {hash: imageHash}, noAuth: true});
  }

  /**
   * Set a new profile image for the current user
   *
   * @namedParams
   * @param {blob} image - The new profile image for the current user
   */
  async SetUserProfileImage({image}) {
    const libraryId = Utils.AddressToLibraryId(this.client.signer.address);

    await this.__TouchLibrary();

    await this.client.SetContentLibraryImage({libraryId, image});

    // Set image hash in public metadata so it is publicly accessible
    const imageHash = await this.PrivateUserMetadata({metadataSubtree: "image"});
    await this.client.ReplacePublicLibraryMetadata({libraryId, metadataSubtree: "image", metadata: imageHash});
  }

  /**
   * Access the specified user account's public metadata
   *
   * @namedParams
   * @param {string} accountAddress - Address of the user account
   * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
   *
   * @return {Promise<Object>} - The user's public profile metadata - returns undefined if no metadata set or subtree doesn't exist
   */
  async PublicUserMetadata({accountAddress, metadataSubtree="/"}) {
    const libraryId = Utils.AddressToLibraryId(accountAddress);

    try {
      return await this.client.PublicLibraryMetadata({libraryId, metadataSubtree});
    } catch(error) {
      if(error.status !== 404) {
        throw error;
      }
    }
  }

  /**
   * Replace the current user's public library metadata
   *
   * @namedParams
   * @param {Object} metadata - New metadata
   * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
   */
  async ReplacePublicUserMetadata({metadataSubtree="/", metadata={}}) {
    const libraryId = Utils.AddressToLibraryId(this.client.signer.address);

    await this.__TouchLibrary();

    return await this.client.ReplacePublicLibraryMetadata({libraryId, metadataSubtree, metadata});
  }

  /**
   * Access the current user's private metadata
   *
   * Note: Subject to user's access level
   *
   * @see <a href="#PromptsAndAccessLevels">Prompts and access levels</a>
   *
   * @namedParams
   * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
   *
   * @return {Promise<Object>} - The user's private profile metadata - returns undefined if no metadata set or subtree doesn't exist
   */
  async PrivateUserMetadata({metadataSubtree="/"}={}) {
    const libraryId = Utils.AddressToLibraryId(this.client.signer.address);
    const objectId = Utils.AddressToObjectId(this.client.signer.address);

    await this.__TouchLibrary();

    return await this.client.ContentObjectMetadata({libraryId, objectId, metadataSubtree});
  }

  /**
   * Merge the current user's public library metadata
   *
   * @namedParams
   * @param {Object} metadata - New metadata
   * @param {string=} metadataSubtree - Subtree to merge into - modifies root metadata if not specified
   */
  async MergePrivateUserMetadata({metadataSubtree="/", metadata={}}) {
    const libraryId = Utils.AddressToLibraryId(this.client.signer.address);
    const objectId = Utils.AddressToObjectId(this.client.signer.address);

    await this.__TouchLibrary();

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.MergeMetadata({libraryId, objectId, writeToken: editRequest.write_token, metadataSubtree, metadata});
    await this.client.FinalizeContentObject({libraryId, objectId, writeToken: editRequest.write_token});
  }

  /**
   * Replace the current user's public library metadata
   *
   * @namedParams
   * @param {Object} metadata - New metadata
   * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
   */
  async ReplacePrivateUserMetadata({metadataSubtree="/", metadata={}}) {
    const libraryId = Utils.AddressToLibraryId(this.client.signer.address);
    const objectId = Utils.AddressToObjectId(this.client.signer.address);

    await this.__TouchLibrary();

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.ReplaceMetadata({libraryId, objectId, writeToken: editRequest.write_token, metadataSubtree, metadata});
    await this.client.FinalizeContentObject({libraryId, objectId, writeToken: editRequest.write_token});
  }

  /**
   * Delete the specified subtree from the users private metadata
   *
   * @namedParams
   * @param {string=} metadataSubtree - Subtree to delete - deletes all metadata if not specified
   */
  async DeletePrivateUserMetadata({metadataSubtree="/"}) {
    const libraryId = Utils.AddressToLibraryId(this.client.signer.address);
    const objectId = Utils.AddressToObjectId(this.client.signer.address);

    await this.__TouchLibrary();

    const editRequest = await this.client.EditContentObject({libraryId, objectId});

    await this.client.DeleteMetadata({libraryId, objectId, writeToken: editRequest.write_token, metadataSubtree});
    await this.client.FinalizeContentObject({libraryId, objectId, writeToken: editRequest.write_token});
  }

  /**
   * Delete the account library for the current user
   */
  async DeleteAccountLibrary() {
    if(!(await this.__IsLibraryCreated({accountAddress: this.client.signer.address}))) {
      return;
    }

    const libraryId = Utils.AddressToLibraryId(this.client.signer.address);
    let path = Path.join("qlibs", libraryId);

    await HandleErrors(
      this.client.HttpClient.Request({
        headers: await this.client.authClient.AuthorizationHeader({libraryId}),
        method: "DELETE",
        path: path
      })
    );
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
    return await this.PrivateUserMetadata({metadataSubtree: "collected_data"}) || {};
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
    await this.__TouchLibrary();

    if(!versionHash) {
      versionHash = (await this.client.ContentObject({libraryId, objectId})).hash;
    }

    // If this object has already been seen, don't re-record tags
    const seen = await this.PrivateUserMetadata({metadataSubtree: Path.join("accessed_content", versionHash)});
    if(seen) { return; }

    const userLibraryId = Utils.AddressToLibraryId(this.client.signer.address);
    const userObjectId = Utils.AddressToObjectId(this.client.signer.address);

    // Mark content as seen
    const editRequest = await this.client.EditContentObject({libraryId: userLibraryId, objectId: userObjectId});
    await this.client.ReplaceMetadata({
      libraryId: userLibraryId,
      objectId: userObjectId,
      writeToken: editRequest.write_token,
      metadataSubtree: Path.join("accessed_content", versionHash),
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
        if (userTags[tag]) {
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
      "PublicUserMetadata",
      "PrivateUserMetadata"
    ];
  }

  // Whitelist of methods allowed to be called using the frame API
  FrameAllowedMethods() {
    const forbiddenMethods = [
      "constructor",
      "FrameAllowedMethods",
      "PromptedMethods",
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
