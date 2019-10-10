require("elv-components-js/src/utils/LimitedMap");

const Id = require("./Id");
const Utils = require("./Utils");

class FrameClient {
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
  constructor({target=parent, timeout=30}={}) {
    this.target = target;
    this.timeout = timeout;

    this.utils = Utils;

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
    let response;
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
    } catch(error) {
      response = JSON.parse(JSON.stringify(error));
    }

    return {
      type: "ElvFrameResponse",
      requestId: request.requestId,
      response
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
    if(!noResponse) {
      const operation = options.calledMethod || options.operation;
      const timeout = options.prompted ? 0 : this.timeout;
      return (await this.AwaitMessage(requestId, timeout, callback, callbackId, operation));
    }
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
            reject(`Request ${requestId} timed out (${operation})`);

            window.removeEventListener("message", methodListener);
            if(callbackListener) { window.removeEventListener("message", callbackListener); }
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

          if(message.error) {
            reject(message.error);
          } else {
            resolve(message.response);
          }

          window.removeEventListener("message", methodListener);
          if(callbackListener) { window.removeEventListener("message", callbackListener); }
        } catch(error){
          reject(error);

          window.removeEventListener("message", methodListener);
          if(callbackListener) { window.removeEventListener("message", callbackListener); }
        }
      };

      // Start the timeout
      touchTimeout();

      window.addEventListener("message", methodListener);
    });
  }

  // Reimplementation of ElvClient#UploadFiles to ensure usage of HTML File API to avoid reading all files into memory
  // and avoid timeout issues with large / many files
  async UploadFiles({libraryId, objectId, writeToken, fileInfo, callback}) {
    // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
    let progress = {};
    let fileDataMap = {};
    fileInfo = fileInfo.map(entry => {
      entry.path = entry.path.replace(/^\/+/, "");

      fileDataMap[entry.path] = entry.data;

      delete entry.data;
      entry.type = "file";

      progress[entry.path] = {
        uploaded: 0,
        total: entry.size
      };

      return entry;
    });

    if(callback) {
      callback(progress);
    }

    const {id, jobs} = await this.CreateFileUploadJob({libraryId, objectId, writeToken, fileInfo});

    await jobs.limitedMap(
      5,
      async jobId => {
        // Retrieve item list for this job
        const files = (
          await this.UploadJobStatus({
            libraryId,
            objectId,
            writeToken,
            uploadId: id,
            jobId
          })
        ).files;

        // Upload each item
        for(let i = 0; i < files.length; i++) {
          const fileInfo = files[i];
          const fileData = fileDataMap[fileInfo.path].slice(fileInfo.off, fileInfo.off + fileInfo.len);

          await this.UploadFileData({libraryId, objectId, writeToken, uploadId: id, jobId, fileData});

          progress[fileInfo.path] = {
            ...progress[fileInfo.path],
            uploaded: progress[fileInfo.path].uploaded + fileInfo.len
          };

          if(callback) {
            callback(progress);
          }
        }
      }
    );
  }


  // List of methods that may require a prompt - these should have an unlimited timeout period
  static PromptedMethods() {
    return [
      "CollectedTags",
      "DeleteUserMetadata",
      "MergeUserMetadata",
      "ReplaceUserMetadata",
      "UserMetadata"
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
      "AddLibraryContentType",
      "AvailableDRMs",
      "BitmovinPlayoutOptions",
      "BlockNumber",
      "CachedAccessTransaction",
      "CallBitcodeMethod",
      "CallContractMethod",
      "CallContractMethodAndWait",
      "ClearCache",
      "Collection",
      "Configuration",
      "ContentLibraries",
      "ContentLibrary",
      "ContentLibraryOwner",
      "ContentObject",
      "ContentObjectAccessComplete",
      "ContentObjectLibraryId",
      "ContentObjectMetadata",
      "ContentObjectOwner",
      "ContentObjectVersions",
      "ContentObjects",
      "ContentPart",
      "ContentParts",
      "ContentSpaceId",
      "ContentType",
      "ContentTypeOwner",
      "ContentTypes",
      "ContractEvents",
      "CopyContentObject",
      "CreateAccessGroup",
      "CreateContentLibrary",
      "CreateContentObject",
      "CreateContentSpace",
      "CreateContentType",
      "CreateFileUploadJob",
      "CreatePart",
      "CurrentAccountAddress",
      "CustomContractAddress",
      "DefaultKMSAddress",
      "DeleteAccessGroup",
      "DeleteContentLibrary",
      "DeleteContentObject",
      "DeleteContentVersion",
      "DeleteFiles",
      "DeleteMetadata",
      "DeletePart",
      "DeployContract",
      "DownloadFile",
      "DownloadPart",
      "EditContentObject",
      "Encrypt",
      "Events",
      "ExtractEventFromLogs",
      "ExtractValueFromEvent",
      "FabricUrl",
      "FileUrl",
      "FinalizeContentObject",
      "FinalizePart",
      "FinalizeUploadJobs",
      "FormatContractArguments",
      "GenerateStateChannelToken",
      "GetBalance",
      "LibraryContentTypes",
      "ListFiles",
      "MergeMetadata",
      "NodeId",
      "Nodes",
      "PlayoutOptions",
      "Proofs",
      "PublicRep",
      "PublishContentVersion",
      "QParts",
      "RemoveAccessGroupManager",
      "RemoveAccessGroupMember",
      "RemoveLibraryContentType",
      "Rep",
      "ReplaceMetadata",
      "ResetRegion",
      "SendFunds",
      "SetAccessCharge",
      "SetAuth",
      "SetContentLibraryImage",
      "SetContentObjectImage",
      "SetCustomContentContract",
      "SetNodes",
      "UploadFileData",
      //"UploadFiles",
      "UploadJobStatus",
      "UploadPart",
      "UploadPartChunk",
      "UseRegion",
      "VerifyContentObject",
      "WithdrawContractFunds"
    ];
  }

  AllowedUserProfileMethods() {
    return [
      "AccessLevel",
      "CollectedTags",
      "DeleteUserMetadata",
      "Initialize",
      "MergeUserMetadata",
      "PublicUserMetadata",
      "ReplaceUserMetadata",
      "UserMetadata",
      "UserProfileImage",
      "UserWalletAddress",
      "WalletAddress"
    ];
  }
}

exports.FrameClient = FrameClient;
