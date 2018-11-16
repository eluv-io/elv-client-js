const Id = require("./Id");
const Utils = require("./Utils");

const IsCloneable = (value) => {
  if(Object(value) !== value) {
    // Primitive valueue
    return true;
  }

  switch({}.toString.call(value).slice(8,-1)) { // Class
  case "Boolean":
  case "Number":
  case "String":
  case "Date":
  case "RegExp":
  case "Blob":
  case "FileList":
  case "ImageData":
  case "ImageBitmap":
  case "ArrayBuffer":
    return true;
  case "Array":
  case "Object":
    return Object.keys(value).every(prop => IsCloneable(value[prop]));
  case "Map":
    return [...value.keys()].every(IsCloneable)
      && [...value.values()].every(IsCloneable);
  case "Set":
    return [...value.keys()].every(IsCloneable);
  default:
    return false;
  }
};

class FrameClient {
  constructor({target=parent, timeout=5}) {
    this.timeout = timeout;

    this.utils = Utils;

    // Dynamically defined methods defined in AllowedMethods
    for(const methodName of this.AllowedMethods()){
      this[methodName] = async (args) => {
        const requestId = Id.next();

        // TODO: Instead of serializing the whole thing, only serialize / remove non-clonable
        if(!IsCloneable(args)) {
          args = JSON.parse(JSON.stringify(args));
        }

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
      "CallContractMethod",
      "CallContractMethodAndWait",
      "ContentLibraries",
      "ContentLibrary",
      "ContentObject",
      "ContentObjectMetadata",
      "ContentObjectVersions",
      "ContentObjects",
      "ContentParts",
      "ContentType",
      "ContentTypes",
      "CreateContentLibrary",
      "CreateContentObject",
      "CreateContentSpace",
      "CreateContentType",
      "CreateFileUploadJob",
      "DeleteContentLibrary",
      "DeleteContentObject",
      "DeleteMetadata",
      "DeleteName",
      "DeletePart",
      "DeployContract",
      "DownloadAllParts",
      "DownloadFile",
      "DownloadPart",
      "EditContentObject",
      "FabricUrl",
      "FinalizeContentObject",
      "FinalizeUploadJobs",
      "FormatContractArguments",
      "GetByName",
      "GetObjectByName",
      "MergeMetadata",
      "Proofs",
      "PublicLibraryMetadata",
      "QParts",
      "Rep",
      "ReplaceMetadata",
      "ReplacePublicLibraryMetadata",
      "SetByName",
      "SetCustomContentContract",
      "SetObjectByName",
      "UploadFileData",
      "UploadJobStatus",
      "UploadPart",
      "VerifyContentObject"
    ];
  }
}

exports.FrameClient = FrameClient;
