const URI = require("urijs");
const Path = require("path");

const ElvWallet = require("./ElvWallet");
const EthClient = require("./EthClient");
const HttpClient = require("./HttpClient");
const ContentObjectVerification = require("./ContentObjectVerification");
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

const ResponseToJson = async (response) => {
  return ResponseToFormat("json", response);
};

const ResponseToFormat = async (format, response) => {
  response = await HandleErrors(response);

  switch(format.toLowerCase()) {
  case "json":
    return response.json();
  case "text":
    return response.text();
  case "blob":
    return response.blob();
  case "arraybuffer":
    return response.arrayBuffer();
  case "formdata":
    return response.formData();
  default:
    return response;
  }
};

// Node doesn't implement btoa
const B64 = (str) => {
  if(typeof btoa !== "undefined") {
    return btoa(str);
  }

  return Buffer.from(str).toString("base64");
};

class ElvClient {
  constructor({contentSpaceId, hostname, port, useHTTPS, ethHostname, ethPort, ethUseHTTPS}) {
    this.contentSpaceId = contentSpaceId;

    this.fabricURI = new URI()
      .protocol(useHTTPS ? "https" : "http")
      .host(hostname)
      .port(port);

    this.HttpClient = new HttpClient(this.fabricURI);

    this.ethereumURI = new URI()
      .protocol(ethUseHTTPS ? "https" : "http")
      .host(ethHostname)
      .port(ethPort)
      .path("")
      .hash("")
      .toString();

    this.ethClient = new EthClient(this.ethereumURI);

    this.utils = Utils;
  }

  // Authorization: Bearer <token>
  AuthorizationHeader({libraryId, accountAddress, transactionId}) {
    const token = B64(JSON.stringify({
      qspace_id: this.contentSpaceId,
      qlib_id: libraryId,
      addr: accountAddress,
      txid: transactionId
    }));

    const signature = B64("SIGNATURE");

    return {
      Authorization: "Bearer " + token //+ "." + signature
    };
  }

  // Whitelist of methods allowed to be called using the frame API
  FrameAllowedMethods() {
    const forbiddenMethods = [
      "constructor",
      "AuthorizationHeader",
      "FrameAllowedMethods",
      "CallFromFrameMessage",
      "GenerateWallet"
    ];

    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(method => !forbiddenMethods.includes(method));
  }

  // Call a method specified in a message from a frame
  async CallFromFrameMessage(message, signer) {
    if(message.type !== "ElvFrameRequest") { return; }

    try {
      const method = message.calledMethod;
      if (!this.FrameAllowedMethods().includes(method)) {
        throw Error("Invalid method: " + method);
      }

      // Inject signer into method arguments
      let args = message.args;
      if(signer) { args = Object.assign({signer}, message.args || {}); }

      let response = await this[method](args);

      return {
        type: "ElvFrameResponse",
        requestId: message.requestId,
        response
      };
    } catch(error) {
      return {
        type: "ElvFrameResponse",
        requestId: message.requestId,
        error
      };
    }
  }

  GenerateWallet() {
    return new ElvWallet(this.ethereumURI);
  }

  /* Libraries */

  ContentLibraries() {
    let path = Path.join("qlibs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );
  }

  ContentLibrary({libraryId}) {
    let path = Path.join("qlibs", libraryId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  // -- Deploy library contract
  // -- Create library in fabric
  // -- Set library hash in contract
  // -- Return library ID
  async CreateContentLibrary({
    name,
    description,
    publicMetadata={},
    privateMetadata={},
    signer
  }) {
    let path = Path.join("qlibs");

    // Deploy contract
    let contractInfo = await this.ethClient.DeployLibraryContract({
      name,
      signer
    });

    publicMetadata = Object.assign(
      {
        "eluv.name": name,
        "eluv.description": description,
        "eluv.contract_address": contractInfo.address
      },
      publicMetadata || {}
    );

    // Create library in fabric
    let libraryId = (await ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({}),
        method: "POST",
        path: path,
        body: {
          meta: publicMetadata,
          private_meta: privateMetadata
        }
      })
    )).id;

    // Set library hash in contract
    await this.ethClient.SetLibraryHash({
      libraryId,
      contractAddress: contractInfo.address,
      signer
    });

    return {
      libraryId: libraryId,
      contractAddress: contractInfo.address,
      txHash: contractInfo.deployTransaction.hash
    };
  }

  async PublicLibraryMetadata({libraryId}) {
    let path = Path.join("qlibs", libraryId, "meta");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  async ReplacePublicLibraryMetadata({libraryId, metadataSubtree="", metadata={}}) {
    let path = Path.join("qlibs", libraryId, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "PUT",
        path: path,
        body: metadata
      })
    );
  }

  /* Objects */

  ContentObjects({libraryId}) {
    let path = Path.join("qlibs", libraryId, "q");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  ContentObject({libraryId, contentHash}) {
    let path = Path.join("q", contentHash);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  ContentObjectMetadata({libraryId, contentHash}) {
    let path = Path.join("q", contentHash, "meta");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  ContentObjectVersions({libraryId, objectId}) {
    let path = Path.join("qid", objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Content object creation / modification */

  async CreateContentObject({libraryId, libraryContractAddress, options={}, signer}) {
    let path = Path.join("q");

    // Deploy contract
    // This calls createContent method of the library contract, which deploys a content contract
    // The address of that deployed contract is returned
    let contentContractAddress = await this.ethClient.DeployContentContract({
      libraryContractAddress,
      type: "Hello World Object",
      signer
    });

    // Inject contract address into metadata
    const metadata = options.meta || {};
    metadata.caddr = contentContractAddress;
    options.meta = metadata;

    const createResponse = await ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "POST",
        path: path,
        body: options
      })
    );

    // Inject contract address into create response
    createResponse.contractAddress = contentContractAddress;

    return createResponse;
  }

  EditContentObject({libraryId, contentId, options={}}) {
    let path = Path.join("qid", contentId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "POST",
        path: path,
        body: options
      })
    );
  }

  async MergeMetadata({libraryId, writeToken, metadataSubtree="", metadata={}}) {
    let path = Path.join("q", writeToken, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "POST",
        path: path,
        body: metadata
      })
    );
  }

  async ReplaceMetadata({libraryId, writeToken, metadataSubtree="", metadata={}}) {
    let path = Path.join("q", writeToken, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "PUT",
        path: path,
        body: metadata
      })
    );
  }

  async DeleteMetadata({libraryId, writeToken, metadataSubtree=""}) {
    let path = Path.join("q", writeToken, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "DELETE",
        path: path
      })
    );
  }

  FinalizeContentObject({libraryId, writeToken}) {
    let path = Path.join("q", writeToken);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "POST",
        path: path
      })
    );
  }

  /* Files */

  CreateFileUploadJob({libraryId, writeToken, fileInfo}) {
    let path = Path.join("q", writeToken, "upload_jobs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "POST",
        path: path,
        body: fileInfo
      })
    );
  }

  UploadFileData({libraryId, writeToken, jobId, fileData}) {
    let path = Path.join("q", writeToken, "upload_jobs", jobId);

    return ResponseToJson(
      this.HttpClient.Request({
        method: "POST",
        path: path,
        body: fileData,
        bodyType: "BINARY",
        headers: Object.assign(
          this.AuthorizationHeader({libraryId}),
          { "Content-type": "application/octet-stream" }
        )
      })
    );
  }

  UploadJobStatus({libraryId, writeToken, jobId}) {
    let path = Path.join("q", writeToken, "upload_jobs", jobId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  async FinalizeUploadJobs({libraryId, writeToken}) {
    let path = Path.join("q", writeToken, "files");

    await HandleErrors(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "POST",
        path: path
      })
    );
  }

  DownloadFile({libraryId, contentHash, filePath, format="blob"}) {
    let path = Path.join("q", contentHash, "files", filePath);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Parts */

  ContentParts({libraryId, contentHash}) {
    let path = Path.join("q", contentHash, "parts");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  DownloadAllParts({libraryId, contentHash, format="blob"}) {
    let path = Path.join("q", contentHash, "data");

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  DownloadPart({libraryId, contentHash, partHash, format="blob"}) {
    let path = Path.join("q", contentHash, "data", partHash);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  UploadPart({libraryId, writeToken, data}) {
    let path = Path.join("q", writeToken, "data");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "POST",
        path: path,
        body: data,
        bodyType: "BINARY"
      })
    );
  }

  DeletePart({libraryId, writeToken, partHash}) {
    let path = Path.join("q", writeToken, "parts", partHash);

    return HandleErrors(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "DELETE",
        path: path
      })
    );
  }

  FabricUrl({libraryId, contentHash, partHash, queryParams = {}}) {
    let path = "";

    if(libraryId) {
      path = Path.join(path, "qlibs", libraryId);

      if(contentHash) {
        path = Path.join(path, "q", contentHash);

        if(partHash){
          path = Path.join(path, "data", partHash);
        }
      }
    }

    return this.HttpClient.URL({
      path: path,
      queryParams
    });
  }

  /* Naming */

  GetByName({name}) {
    let path = Path.join("naming", name);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );
  }

  async SetByName({name, target}) {
    let path = Path.join("naming");

    await HandleErrors(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({}),
        method: "PUT",
        path: path,
        body: {name, target}
      })
    );
  }

  async GetObjectByName({name}) {
    let response = await this.GetByName({name});

    let info = JSON.parse(response.target);

    if(!info.libraryId) {
      throw Error("No library ID");
    }

    if(!info.objectId) {
      throw Error("No content object ID");
    }

    let contentObjectData = await this.ContentObject({libraryId: info.libraryId, contentHash: info.objectId});
    contentObjectData.meta = await this.ContentObjectMetadata({libraryId: info.libraryId, contentHash: info.objectId});

    return contentObjectData;
  }

  SetObjectByName({name, libraryId, objectId}) {
    return this.SetByName({
      name,
      target: JSON.stringify({
        libraryId,
        objectId
      })
    });
  }

  async DeleteName({name}) {
    let path = Path.join("naming", name);

    await HandleErrors(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({}),
        method: "DELETE",
        path: path
      })
    );
  }

  /* Verification */

  VerifyContentObject({libraryId, partHash}) {
    return ContentObjectVerification.VerifyContentObject({
      client: this,
      libraryId: libraryId,
      partHash: partHash
    });
  }

  Proofs({libraryId, contentHash, partHash}) {
    let path = Path.join("q", contentHash, "data", partHash, "proofs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  QParts({partHash, format="blob"}) {
    let path = Path.join("qparts", partHash);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: this.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );
  }

  /* Contracts */

  FormatContractArguments({abi, methodName, args}) {
    return this.ethClient.FormatContractArguments({abi, methodName, args});
  }

  DeployContract({abi, bytecode, constructorArgs, overrides={}, signer}) {
    return this.ethClient.DeployContract({abi, bytecode, constructorArgs, overrides, signer});
  }

  CallContractMethod({contractAddress, abi, methodName, methodArgs, overrides={}, signer}) {
    return this.ethClient.CallContractMethod({contractAddress, abi, methodName, methodArgs, overrides, signer});
  }

  SetCustomContentContract({contentContractAddress, customContractAddress, overrides={}, signer}) {
    return this.ethClient.SetCustomContentContract({contentContractAddress, customContractAddress, overrides, signer});
  }
}

exports.ElvClient = ElvClient;
