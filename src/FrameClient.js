const Id = require("./Id");
const Utils = require("./Utils");
const permissionLevels = require("./client/ContentAccess").permissionLevels;
const {LogMessage} = require("./LogMessage");
const Crypto = require("./Crypto");

class FrameClient {
  Log(message, error = false) {
    LogMessage(this, message, error);
  }

  /**
   * FrameClient is a client that looks to the user like an ElvClient, but works by passing messages
   * to another frame with an actual ElvClient instead of making the calls itself.
   *
   * The purpose of this is to isolate users' private keys and the usage thereof in one trusted application,
   * while still allowing other (possibly less trustworthy) applications to communicate with the content fabric
   * on behalf of the user from a sandboxed IFrame.
   *
   * FrameClient has available almost all of the same methods as ElvClient, and should be transparently
   * interchangable with it from a usage perspective.
   *
   * The methods available in FrameClient are generated automatically from ElvClient. These methods will use a
   * messaging protocol to communicate intent to a specified frame, which can listen for such messages, perform
   * the actions using the real ElvClient, and return the results via a response message.
   *
   * Because the privileged frame is doing the actual work, it may decide to allow or disallow any actions
   * it sees fit - for example, limiting a dependent app to a few safe calls while preventing it from making any
   * significant changes.
   *
   * The most important aspect of this architecture is to prevent leaking of users' private keys. Be careful when
   * setting up a project using this architecture - make sure the untrusted app is properly contained in a sandboxed
   * IFrame and served from a different origin than the privileged app.
   *
   * @see test/frames/Parent.html and test/frames/Client.html for an example setup using this scheme
   *
   * @namedParams
   * @param {Object} target - The window or frame that will listen for messages produced by this client
   * @param {number} timeout - How long to wait for a response after calling a method before giving up
   * and generating a timeout error
   */
  constructor({target, timeout=30}={}) {
    this.permissionLevels = permissionLevels;

    if(!target && typeof window !== "undefined" && window.parent) {
      target = window.parent;
    }

    this.target = target;
    this.timeout = timeout;

    this.utils = Utils;

    this.Crypto = Crypto;
    this.Crypto.ElvCrypto();

    // Dynamically defined methods defined in AllowedMethods
    for(const methodName of this.AllowedMethods()){
      this[methodName] = async (args) => {
        let callback = args && args.callback;
        if(callback) { delete args.callback; }

        return await this.SendMessage({
          options: {
            calledMethod: methodName,
            args: this.utils.MakeClonable(args)
          },
          callback
        });
      };
    }

    this.userProfileClient = {};
    // Dynamically defined user profile methods defined in AllowedUserProfileMethods
    for(const methodName of this.AllowedUserProfileMethods()) {
      this.userProfileClient[methodName] = async (args) => {
        let callback = args && args.callback;
        if(callback) { delete args.callback; }

        return await this.SendMessage({
          options: {
            module: "userProfileClient",
            calledMethod: methodName,
            args: this.utils.MakeClonable(args),
            prompted: FrameClient.PromptedMethods().includes(methodName)
          },
          callback
        });
      };
    }

    this.walletClient = {};
    // Dynamically defined wallet client methods defined in AllowedWalletClientMethods
    for(const methodName of this.AllowedWalletClientMethods()) {
      this.walletClient[methodName] = async (args) => {
        let callback = args && args.callback;
        if(callback) { delete args.callback; }

        return await this.SendMessage({
          options: {
            module: "walletClient",
            calledMethod: methodName,
            args: this.utils.MakeClonable(args)
          },
          callback
        });
      };
    }
  }

  /**
   * Pass an ElvFrameRequest to the target and receive a ElvFrameResponse.
   * Useful when acting as an intermediate between a contained app and a parent app.
   *
   * @namedParams
   * @param {object} request - An ElvFrameRequest
   * @returns {object} - The resultant ElvFrameResponse
   */
  async PassRequest({request, Respond}) {
    let response, error;
    try {
      let callback;
      if(request.callbackId) {
        callback = (result) => Respond({
          type: "ElvFrameResponse",
          requestId: request.callbackId,
          response: result
        });
      }

      response = await this.SendMessage({options: request, callback});
    } catch(e) {
      error = e;
    }

    return {
      type: "ElvFrameResponse",
      requestId: request.requestId,
      response,
      error
    };
  }

  async SendMessage({options={}, callback, noResponse=false}) {
    const requestId = Id.next();

    let callbackId;
    if(callback) { callbackId = Id.next(); }

    this.target.postMessage({
      ...options,
      type: "ElvFrameRequest",
      requestId,
      callbackId
    }, "*");

    // No timeout for prompted methods
    if(noResponse) { return; }

    const operation = options.calledMethod || options.operation;
    const isFileOperation = FrameClient.FileMethods().includes(options.calledMethod);

    let timeout = this.timeout;
    if(options.prompted || isFileOperation) {
      timeout = 0;
    } else if(options.args && options.args.fcTimeout) {
      timeout = options.args.fcTimeout;
    }

    return (await this.AwaitMessage(requestId, timeout, callback, callbackId, operation));
  }

  async AwaitMessage(requestId, timeout, callback, callbackId, operation) {
    return await new Promise((resolve, reject) => {
      let methodListener;

      // Initialize or reset timeout
      let timeoutId;
      const touchTimeout = () => {
        if(timeoutId) {
          clearTimeout(timeoutId);
        }

        if(timeout > 0) {
          timeoutId = setTimeout(() => {
            if(typeof window !== "undefined") {
              window.removeEventListener("message", methodListener);

              if(callbackListener) {
                window.removeEventListener("message", callbackListener);
              }
            }
            reject(`Request ${requestId} timed out (${operation})`);
          }, timeout * 1000);
        }
      };

      // Set up callback listener
      let callbackListener;
      if(callbackId) {
        callbackListener = (event) => {
          try {
            touchTimeout();

            const message = event.data;

            if(message.type !== "ElvFrameResponse" || message.requestId !== callbackId) {
              return;
            }

            callback(message.response);
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
        };

        window.addEventListener("message", callbackListener);
      }

      // Set up final method response listener
      methodListener = async (event) => {
        try {
          const message = event.data;
          if(message.type !== "ElvFrameResponse" || message.requestId !== requestId) {
            return;
          }

          clearTimeout(timeoutId);

          window.removeEventListener("message", methodListener);
          if(callbackListener) { window.removeEventListener("message", callbackListener); }

          if(message.error) {
            reject(message.error);
          } else {
            resolve(message.response);
          }
        } catch(error){
          clearTimeout(timeoutId);

          window.removeEventListener("message", methodListener);
          if(callbackListener) { window.removeEventListener("message", callbackListener); }

          reject(error);
        }
      };

      // Start the timeout
      touchTimeout();

      window.addEventListener("message", methodListener);
    });
  }

  // List of methods that may require a prompt - these should have an unlimited timeout period
  static PromptedMethods() {
    return [
      "CollectedTags",
      "DeleteUserMetadata",
      "MergeUserMetadata",
      "ReplaceUserMetadata",
      "UserMetadata",
    ];
  }

  static MetadataMethods() {
    return [
      "DeleteUserMetadata",
      "MergeUserMetadata",
      "ReplaceUserMetadata",
      "UserMetadata"
    ];
  }

  static FileMethods() {
    return [
      "CreateFileUploadJob",
      "DownloadEncrypted",
      "DownloadFile",
      "DownloadPart",
      "FinalizeUploadJob",
      "UpdateContentObjectGraph",
      "UploadFileData",
      "UploadFiles",
      "UploadFilesFromS3",
      "UploadJobStatus",
      "UploadPart",
      "UploadPartChunk",
      "UploadStatus"
    ];
  }

  // List of methods that are defined separately in FrameClient
  OverriddenMethods() {
    return [
      "UploadFiles"
    ];
  }

  // List of allowed methods available to frames
  // This should match ElvClient.FrameAvailableMethods()
  // ElvClient will also reject any disallowed methods
  /**
   * @returns {Array<string>} - List of ElvClient methods available to a FrameClient
   */
  AllowedMethods() {
    return [
      "AccessGroupManagers",
      "AccessGroupMembers",
      "AccessGroupOwner",
      "AccessInfo",
      "AccessRequest",
      "AccessType",
      "AddAccessGroupManager",
      "AddAccessGroupMember",
      "AddContentLibraryGroup",
      "AddContentObjectGroupPermission",
      "AddLibraryContentType",
      "AssetMetadata",
      "AvailableDRMs",
      "AvailableOfferings",
      "AwaitPending",
      "BitmovinPlayoutOptions",
      "BlockNumber",
      "CallBitcodeMethod",
      "CallContractMethod",
      "CallContractMethodAndWait",
      "ClearCache",
      "ClearStaticToken",
      "Collection",
      "CollectionTransactions",
      "ConfigUrl",
      "ContentLibraries",
      "ContentLibrary",
      "ContentLibraryGroupPermissions",
      "ContentLibraryOwner",
      "ContentObject",
      "ContentObjectAccessComplete",
      "ContentObjectGraph",
      "ContentObjectGroupPermissions",
      "ContentObjectImageUrl",
      "ContentObjectLibraryId",
      "ContentObjectMetadata",
      "ContentObjectOwner",
      "ContentObjectTenantId",
      "ContentObjectVersions",
      "ContentObjects",
      "ContentPart",
      "ContentParts",
      "ContentSpaceId",
      "ContentType",
      "ContentTypeOwner",
      "ContentTypes",
      "ContractAbi",
      "ContractEvents",
      "ContractInfo",
      "ContractMetadata",
      "ContractName",
      "CopyContentObject",
      "CreateABRMezzanine",
      "CreateAccessGroup",
      "CreateAndFinalizeContentObject",
      "CreateContentLibrary",
      "CreateContentObject",
      "CreateContentType",
      "CreateEncryptionConk",
      "CreateFabricToken",
      "CreateFileDirectories",
      "CreateFileUploadJob",
      "CreateLinks",
      "CreateNTPInstance",
      "CreateNonOwnerCap",
      "CreatePart",
      "CreateProductionMaster",
      "CreateSignedToken",
      "CurrentAccountAddress",
      "CustomContractAddress",
      "Decrypt",
      "DecryptECIES",
      "DefaultKMSAddress",
      "DeleteAccessGroup",
      "DeleteContentLibrary",
      "DeleteContentObject",
      "DeleteContentVersion",
      "DeleteFiles",
      "DeleteMetadata",
      "DeleteNTPInstance",
      "DeletePart",
      "DeployContract",
      "Download",
      "DownloadEncrypted",
      "DownloadFile",
      "DownloadPart",
      "EditAndFinalizeContentObject",
      "EditContentObject",
      "EmbedUrl",
      "Encrypt",
      "EncryptECIES",
      "EncryptionConk",
      "Events",
      "ExtractEventFromLogs",
      "ExtractValueFromEvent",
      "FabricUrl",
      "FileUrl",
      "FinalizeABRMezzanine",
      "FinalizeContentObject",
      "FinalizePart",
      "FinalizeStateChannelAccess",
      "FinalizeUploadJob",
      "FormatContractArguments",
      "GenerateStateChannelToken",
      "GenerateSignedLinkToken",
      "GetBalance",
      "InitializeAuthPolicy",
      "IssueNTPCode",
      "IssueSignedNTPCode",
      "LatestVersionHash",
      "LibraryContentTypes",
      "LinkAccessGroupToOauth",
      "LinkData",
      "LinkTarget",
      "LinkUrl",
      "ListAccessGroups",
      "ListFiles",
      "ListNTPInstances",
      "LRODraftInfo",
      "LROStatus",
      "MakeAuthServiceRequest",
      "MergeContractMetadata",
      "MergeMetadata",
      "MetadataAuth",
      "MintNFT",
      "MoveFiles",
      "NetworkInfo",
      "NodeId",
      "Nodes",
      "NTPInstance",
      "Permission",
      "PlayoutOptions",
      "PlayoutPathResolution",
      "ProduceMetadataLinks",
      "Proofs",
      "PublicRep",
      "PublishContentVersion",
      "QParts",
      "RecordWriteToken",
      "RedeemCode",
      "RemoveAccessGroupManager",
      "RemoveAccessGroupMember",
      "RemoveContentObjectGroupPermission",
      "RemoveContentLibraryGroup",
      "RemoveLibraryContentType",
      "Rep",
      "ReplaceContractMetadata",
      "ReplaceMetadata",
      "Request",
      "ResetRegion",
      "SendFunds",
      "SetAccessCharge",
      "SetAuth",
      "SetAuthContext",
      "SetAuthPolicy",
      "SetContentLibraryImage",
      "SetContentObjectImage",
      "SetCustomContentContract",
      "SetGroupPermission",
      "SetNodes",
      "SetOauthToken",
      "SetPolicyAuthorization",
      "SetSignerFromOauthToken",
      "SetStaticToken",
      "SetVisibility",
      "SetPermission",
      "SpaceNodes",
      "StartABRMezzanineJobs",
      "StreamConfig",
      "StreamCreate",
      "StreamInitialize",
      "StreamInsertion",
      "StreamStatus",
      "StreamStartOrStopOrReset",
      "StreamStopSession",
      "SuspendNTPInstance",
      "UnlinkAccessGroupFromOauth",
      "UpdateContentObjectGraph",
      "UpdateNTPInstance",
      "UploadFileData",
      "UploadFilesFromS3",
      "UploadJobStatus",
      "UploadPart",
      "UploadPartChunk",
      "UploadStatus",
      "UseRegion",
      "VerifyContentObject",
      "Visibility",
      "WriteTokenNodeUrl"
    ];
  }

  AllowedUserProfileMethods() {
    return [
      "AccessLevel",
      "CollectedTags",
      "CreateWallet",
      "DeleteUserMetadata",
      "MergeUserMetadata",
      "PublicUserMetadata",
      "ReplaceUserMetadata",
      "TenantContractId",
      "TenantId",
      "UserMetadata",
      "UserProfileImage",
      "UserWalletAddress",
      "UserWalletObjectInfo",
      "WalletAddress"
    ];
  }

  AllowedWalletClientMethods() {
    return [
      "AcceptMarketplaceOffer",
      "AddNotificationListener",
      "AvailableMarketplaces",
      "CanSign",
      "CastVote",
      "ClaimItem",
      "ClaimStatus",
      "CollectionRedemptionStatus",
      "CreateListing",
      "CreateMarketplaceOffer",
      "DeployTenant",
      "DropStatus",
      "ExchangeRate",
      "FilteredQuery",
      "LatestMarketplaceHash",
      "Leaderboard",
      "Listing",
      "ListingAttributes",
      "ListingEditionNames",
      "ListingNames",
      "ListingPurchaseStatus",
      "ListingStats",
      "ListingStatus",
      "Listings",
      "LoadAvailableMarketplaces",
      "LoadDrop",
      "LoadMarketplace",
      "Marketplace",
      "MarketplaceCSS",
      "MarketplaceInfo",
      "MarketplaceOffers",
      "MarketplaceStock",
      "MintingStatus",
      "NFT",
      "NFTContractStats",
      "Notifications",
      "PackOpenStatus",
      "Profile",
      "ProfileMetadata",
      "PurchaseStatus",
      "PushNotification",
      "RejectMarketplaceOffer",
      "RemoveListing",
      "RemoveMarketplaceOffer",
      "RemoveProfileMetadata",
      "RevokeVote",
      "Sales",
      "SalesNames",
      "SalesStats",
      "SetProfileMetadata",
      "SubmitDropVote",
      "TenantConfiguration",
      "TransferNFT",
      "Transfers",
      "UserAddress",
      "UserInfo",
      "UserItemAttributes",
      "UserItemEditionNames",
      "UserItemNames",
      "UserItems",
      "UserListings",
      "UserNameToAddress",
      "UserSales",
      "UserTransfers",
      "UserWalletBalance",
      "VoteStatus"
    ];
  }
}

const { UploadFiles } = require("./client/Files");
FrameClient.prototype.UploadFiles = UploadFiles;

exports.FrameClient = FrameClient;
