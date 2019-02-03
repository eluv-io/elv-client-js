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
   * Access the UserProfileClient from ElvClient or FrameClient via client.userProfile
   *
   * @example
let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

let wallet = client.GenerateWallet();
let signer = wallet.AddAccount({
  accountName: "Alice",
  privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
});
client.SetSigner({signer});

await client.userProfile.PublicUserMetadata({accountAddress: signer.address})

let frameClient = new FrameClient();
await client.userProfile.PublicUserMetadata({accountAddress: signer.address})
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

    return await this.client.CreateContentLibrary({
      publicMetadata,
      privateMetadata,
      image,
      isUserLibrary: true
    });
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
  async __IsLibraryCreated({accountAddress}) {
    const libraryId = Utils.AddressToLibraryId(accountAddress);

    try {
      await this.client.PublicLibraryMetadata({libraryId});

      return true;
    } catch(error) {
      if(error.status !== 404) {
        throw error;
      }
    }
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
      if(error.status === 404) {
        return {};
      } else {
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
   * @namedParams
   * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
   *
   * @return {Promise<Object>} - The user's private profile metadata - returns undefined if no metadata set or subtree doesn't exist
   */
  async PrivateUserMetadata({metadataSubtree="/"}) {
    const libraryId = Utils.AddressToLibraryId(this.client.signer.address);
    const objectId = Utils.AddressToObjectId(this.client.signer.address);

    await this.__TouchLibrary();

    return await this.client.ContentObjectMetadata({libraryId, objectId, metadataSubtree});
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
   * Delete the account library for the current user
   */
  async DeleteAccountLibrary() {
    const libraryId = Utils.AddressToLibraryId(this.client.signer.address);
    let path = Path.join("qlibs", libraryId);

    return HandleErrors(
      this.client.HttpClient.Request({
        headers: await this.client.authClient.AuthorizationHeader({libraryId}),
        method: "DELETE",
        path: path
      })
    );
  }

  // Whitelist of methods allowed to be called using the frame API
  FrameAllowedMethods() {
    const forbiddenMethods = [
      "constructor",
      "FrameAllowedMethods",
      "__IsLibraryCreated",
      "__TouchLibrary",
    ];

    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(method => !forbiddenMethods.includes(method));
  }
}

module.exports = UserProfileClient;
