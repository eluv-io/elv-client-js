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
  constructor({target=parent, timeout=5}) {
    this.target = target;
    this.timeout = timeout;

    this.utils = Utils;

    // Dynamically defined methods defined in AllowedMethods
    for(const methodName of this.AllowedMethods()){
      this[methodName] = async (args) => {
        return await this.SendMessage({
          options: {
            calledMethod: methodName,
            args: this.utils.MakeClonable(args)
          }
        });
      };
    }
  }

  async SendMessage({options={}}) {
    const requestId = Id.next();

    this.target.postMessage({
      type: "ElvFrameRequest",
      requestId,
      ...options
    }, "*");

    return (await this.AwaitMessage(requestId, 5000));
  }

  AwaitMessage(requestId) {
    return new Promise((resolve, reject) => {
      const listener = async (event) => {
        try {
          const message = event.data;

          if (message.type !== "ElvFrameResponse" || message.requestId !== requestId) {
            return;
          }

          if (message.error) {
            reject(message.error);
          } else {
            resolve(message.response);
          }

          window.removeEventListener("message", listener);
        } catch(error){
          reject(error);

          window.removeEventListener("message", listener);
        }
      };

      if(this.timeout > 0) {
        // If promise has not been resolved after specified timeout,
        // remove listener and send error response
        setTimeout(() => {
          reject("Request timed out " + requestId);

          window.removeEventListener("message", listener);
        }, this.timeout * 1000);
      }

      window.addEventListener("message", listener);
    });
  }

  async GetFramePath() {
    return await this.SendMessage({
      options: {
        operation: "GetFramePath"
      }
    });
  }

  async SetFramePath({path}) {
    await this.SendMessage({
      options: {
        operation: "SetFramePath",
        path
      }
    });
  }

  // List of allowed methods available to frames
  // This should match ElvClient.FrameAvailableMethods()
  // ElvClient will also reject any disallowed methods
  /**
   * @returns {Array<string>} - List of ElvClient methods available to a FrameClient
   */
  AllowedMethods() {
    return [
      "AccessGroupOwner",
      "AddAccessGroupManager",
      "AddAccessGroupMember",
      "CallBitcodeMethod",
      "CallContractMethod",
      "CallContractMethodAndWait",
      "ContentLibraries",
      "ContentLibrary",
      "ContentLibraryOwner",
      "ContentObject",
      "ContentObjectContractEvents",
      "ContentObjectMetadata",
      "ContentObjectOwner",
      "ContentObjectVersions",
      "ContentObjects",
      "ContentParts",
      "ContentType",
      "ContentTypeOwner",
      "ContentTypes",
      "ContractEvents",
      "CreateAccessGroup",
      "CreateContentLibrary",
      "CreateContentObject",
      "CreateContentSpace",
      "CreateContentType",
      "CreateFileUploadJob",
      "CurrentAccountAddress",
      "DeleteAccessGroup",
      "DeleteContentLibrary",
      "DeleteContentObject",
      "DeleteContentVersion",
      "DeleteMetadata",
      "DeleteName",
      "DeletePart",
      "DeployContract",
      "DownloadAllParts",
      "DownloadFile",
      "DownloadPart",
      "EditContentObject",
      "ExtractEventFromLogs",
      "ExtractValueFromEvent",
      "FabricUrl",
      "FinalizeContentObject",
      "FinalizeUploadJobs",
      "FormatContractArguments",
      "GetBalance",
      "GetByName",
      "GetObjectByName",
      "MergeMetadata",
      "Proofs",
      "PublicLibraryMetadata",
      "QParts",
      "RemoveAccessGroupManager",
      "RemoveAccessGroupMember",
      "Rep",
      "ReplaceMetadata",
      "ReplacePublicLibraryMetadata",
      "SendFunds",
      "SetByName",
      "SetContentLibraryImage",
      "SetContentObjectImage",
      "SetCustomContentContract",
      "SetObjectByName",
      "UploadFileData",
      "UploadJobStatus",
      "UploadPart",
      "VerifyContentObject",
      "WithdrawContractFunds"
    ];
  }
}

exports.FrameClient = FrameClient;
