const Id = require("./Id");

class FrameClient {
  constructor({target=parent, timeout=5}) {
    this.timeout = timeout;

    // Dynamically defined methods defined in AllowedMethods
    for(const methodName of this.AllowedMethods()){
      this[methodName] = async (args) => {
        const requestId = Id.next();

        if(args) { args = JSON.parse(JSON.stringify(args)); }

        target.postMessage({
          type: "ElvFrameRequest",
          requestId,
          calledMethod: methodName,
          args
        }, "*");

        return await this.AwaitMessage(requestId, 5000);
      };
    }
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

  // List of allowed methods available to frames
  // This should match ElvClient.FrameAvailableMethods()
  // ElvClient will also reject any disallowed methods
  AllowedMethods() {
    return [
      "ContentLibraries",
      "ContentLibrary",
      "CreateContentLibrary",
      "ContentObjects",
      "ContentObject",
      "ContentObjectMetadata",
      "ContentObjectVersions",
      "CreateContentObject",
      "EditContentObject",
      "MergeMetadata",
      "ReplaceMetadata",
      "FinalizeContentObject",
      "CreateFileUploadJob",
      "UploadFileData",
      "UploadJobStatus",
      "FinalizeUploadJobs",
      "DownloadFile",
      "ContentParts",
      "DownloadAllParts",
      "DownloadPart",
      "UploadPart",
      "DeletePart",
      "PartUrl",
      "GetByName",
      "SetByName",
      "GetObjectByName",
      "SetObjectByName",
      "DeleteName",
      "VerifyContentObject",
      "Proofs",
      "QParts",
      "FormatContractArguments",
      "DeployContract",
      "CallContractMethod"
    ];
  }
}

exports.FrameClient = FrameClient;
