const URI = require("urijs");
const Path = require("path");
const Ethers = require("ethers");

const AuthClient = require("./AuthorizationClient");
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
  constructor({contentSpaceId, hostname, port, useHTTPS, ethHostname, ethPort, ethUseHTTPS, noCache=false}) {
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

    this.authClient = new AuthClient(this, this.ethClient, noCache);

    this.contentTypes = {};
  }

  static FromConfiguration({configuration}) {
    return new ElvClient({
      contentSpaceId: configuration.fabric.contentSpaceId,
      hostname: configuration.fabric.hostname,
      port: configuration.fabric.port,
      useHTTPS: configuration.fabric.use_https,
      ethHostname: configuration.ethereum.hostname,
      ethPort: configuration.ethereum.port,
      ethUseHTTPS: configuration.ethereum.use_https
    });
  }

  // Authorization: Bearer <token>
  async AuthorizationHeader({libraryId, objectId, transactionHash}) {
    if(!transactionHash) {
      if(objectId) {
        transactionHash = await this.authClient.ContentObjectAccess({objectId});
      } else if(libraryId) {
        transactionHash = await this.authClient.ContentLibraryAccess({libraryId});
      } else {
        transactionHash = await this.authClient.ContentSpaceAccess();
      }
    }

    const token = B64(JSON.stringify({
      qspace_id: this.contentSpaceId,
      qlib_id: libraryId,
      addr: this.signer.signingKey.address,
      txid: transactionHash
    }));

    const signature = B64("SIGNATURE");

    return {
      Authorization: "Bearer " + token + "." + signature
    };
  }

  // Whitelist of methods allowed to be called using the frame API
  FrameAllowedMethods() {
    const forbiddenMethods = [
      "constructor",
      "AuthorizationHeader",
      "CallFromFrameMessage",
      "ConnectSigner",
      "FrameAllowedMethods",
      "GenerateWallet",
      "SetSigner"
    ];

    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(method => !forbiddenMethods.includes(method));
  }

  // Call a method specified in a message from a frame
  async CallFromFrameMessage(message) {
    if(message.type !== "ElvFrameRequest") { return; }

    try {
      const method = message.calledMethod;
      if (!this.FrameAllowedMethods().includes(method)) {
        throw Error("Invalid method: " + method);
      }

      return {
        type: "ElvFrameResponse",
        requestId: message.requestId,
        response: await this[method](message.args)
      };
    } catch(error) {
      return {
        type: "ElvFrameResponse",
        requestId: message.requestId,
        error
      };
    }
  }

  /* Wallet and signers */

  GenerateWallet() {
    return new ElvWallet(this.ethereumURI);
  }

  SetSigner({signer}) {
    this.signer = signer;
  }

  ConnectSigner({signer}) {
    signer.connect(new Ethers.providers.JsonRpcProvider(this.ethereumURI));
    return signer;
  }

  /* Content Spaces */

  async CreateContentSpace({name}) {
    const contentSpaceAddress = await this.ethClient.DeployContentSpaceContract({name, signer: this.signer});

    return Utils.AddressToSpaceId({address: contentSpaceAddress});
  }

  /* Libraries */

  async ContentLibraries() {
    let path = Path.join("qlibs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );
  }

  async ContentLibrary({libraryId}) {
    let path = Path.join("qlibs", libraryId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId}),
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
    privateMetadata={}
  }) {
    // Deploy contract
    let {contractAddress, transactionHash} = await this.ethClient.DeployLibraryContract({
      contentSpaceAddress: Utils.HashToAddress({hash: this.contentSpaceId}),
      name,
      signer: this.signer
    });

    publicMetadata = Object.assign(
      {
        "eluv.name": name,
        "eluv.description": description
      },
      publicMetadata || {}
    );

    const libraryId = this.utils.AddressToLibraryId({address: contractAddress});
    const path = Path.join("qlibs", libraryId);

    // Save transaction hash for authorization on all further requests
    this.authClient.CacheLibraryTransaction({libraryId, transactionHash});

    // Create library in fabric
    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({transactionHash}),
        method: "PUT",
        path: path,
        body: {
          meta: publicMetadata,
          private_meta: privateMetadata
        }
      })
    );

    return libraryId;
  }

  async PublicLibraryMetadata({libraryId}) {
    let path = Path.join("qlibs", libraryId, "meta");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  async ReplacePublicLibraryMetadata({libraryId, metadataSubtree="", metadata={}}) {
    let path = Path.join("qlibs", libraryId, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId}),
        method: "PUT",
        path: path,
        body: metadata
      })
    );
  }

  /* Content Types */

  async ContentTypes() {
    const contentSpaceAddress = this.utils.HashToAddress({hash: this.contentSpaceId});
    const typeLibraryId = this.utils.AddressToLibraryId({address: contentSpaceAddress});

    let path = Path.join("qlibs", typeLibraryId, "q");

    // Does the same as ContentObjects(), but authorization cannot be performed
    // against the content type library because it does not have a library contract
    const response = await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );

    let contentTypes = {};
    response.contents
      .forEach(contentType => {
        const typeInfo = contentType.versions[0];
        if(!typeInfo.meta || !typeInfo.meta["eluv.name"]) { return; }

        contentTypes[typeInfo.meta["eluv.name"]] = {
          id: typeInfo.id,
          hash: typeInfo.hash
        };
      });

    // Cache content types for faster lookup
    this.contentTypes = Object.assign({}, contentTypes);

    return contentTypes;
  }

  async ContentType({name}) {
    if(this.contentTypes[name]) {
      return this.contentTypes[name];
    } else {
      const contentTypes = await this.ContentTypes();

      if(!contentTypes[name]) {
        throw Error("Unknown content type: " + name);
      }

      return contentTypes[name];
    }
  }

  async CreateContentType({name, bitcode}) {
    const contentSpaceAddress = this.utils.HashToAddress({hash: this.contentSpaceId});
    const { contractAddress, transactionHash } = await this.ethClient.DeployTypeContract({
      contentSpaceAddress,
      signer: this.signer
    });

    const typeLibraryId = this.utils.AddressToLibraryId({address: contentSpaceAddress});

    const objectId = this.utils.AddressToObjectId({address: contractAddress});
    const path = Path.join("qlibs", typeLibraryId, "q", objectId);

    // Save transaction hash for authorization on all further requests
    this.authClient.CacheObjectTransaction({objectId, transactionHash});

    /* Create object, upload bitcode and finalize */

    const createResponse = await ResponseToJson(
      this.HttpClient.Request({
        // Note: content type library *does not* have a contract to authorize against
        headers: await this.AuthorizationHeader({}),
        method: "PUT",
        path: path,
        body: {
          type: "",
          meta: {
            "eluv.name": name
          }
        }
      })
    );

    await this.UploadPart({
      libraryId: typeLibraryId,
      objectId,
      writeToken: createResponse.write_token,
      data: bitcode
    });

    await this.FinalizeContentObject({
      libraryId: typeLibraryId,
      objectId,
      writeToken: createResponse.write_token
    });

    return objectId;
  }

  /* Objects */

  async ContentObjects({libraryId}) {
    let path = Path.join("qlibs", libraryId, "q");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId}),
        method: "GET",
        path: path
      })
    );
  }

  async ContentObject({libraryId, objectId, versionHash}) {
    let path = Path.join("q", versionHash || objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  async ContentObjectMetadata({libraryId, objectId, versionHash}) {
    let path = Path.join("q", versionHash || objectId, "meta");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  async ContentObjectVersions({libraryId, objectId}) {
    let path = Path.join("qid", objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Content object creation / modification */

  // TODO: Auto-lookup of content types

  async CreateContentObject({libraryId, options={}}) {
    // Look up content type if type is specified
    if(options.type) {
      options.type = (await this.ContentType({name: options.type})).hash;
    }

    // Deploy contract
    // This calls createContent method of the library contract, which deploys a content contract
    // The address of that deployed contract is returned
    let {contractAddress, transactionHash} = await this.ethClient.DeployContentContract({
      contentLibraryAddress: Utils.HashToAddress({hash: libraryId}),
      type: options.type || "",
      signer: this.signer
    });

    const objectId = this.utils.AddressToObjectId({address: contractAddress});
    const path = Path.join("q", objectId);

    // Save transaction hash for authorization on all further requests
    this.authClient.CacheObjectTransaction({objectId, transactionHash});

    return await ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, transactionHash}),
        method: "PUT",
        path: path,
        body: options
      })
    );
  }

  async EditContentObject({libraryId, objectId, options={}}) {
    // Look up content type if type is specified
    if(options.type) {
      options.type = (await this.ContentType({name: options.type})).hash;
    }

    let path = Path.join("qid", objectId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "POST",
        path: path,
        body: options
      })
    );
  }

  async MergeMetadata({libraryId, objectId, writeToken, metadataSubtree="", metadata={}}) {
    let path = Path.join("q", writeToken, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "POST",
        path: path,
        body: metadata
      })
    );
  }

  async ReplaceMetadata({libraryId, objectId, writeToken, metadataSubtree="", metadata={}}) {
    let path = Path.join("q", writeToken, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "PUT",
        path: path,
        body: metadata
      })
    );
  }

  async DeleteMetadata({libraryId, objectId, writeToken, metadataSubtree=""}) {
    let path = Path.join("q", writeToken, "meta", metadataSubtree);

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "DELETE",
        path: path
      })
    );
  }

  async FinalizeContentObject({libraryId, objectId, writeToken}) {
    let path = Path.join("q", writeToken);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "POST",
        path: path
      })
    );
  }

  /* Files */

  async CreateFileUploadJob({libraryId, objectId, writeToken, fileInfo}) {
    let path = Path.join("q", writeToken, "upload_jobs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "POST",
        path: path,
        body: fileInfo
      })
    );
  }

  async UploadFileData({libraryId, objectId, writeToken, jobId, fileData}) {
    let path = Path.join("q", writeToken, "upload_jobs", jobId);

    return ResponseToJson(
      this.HttpClient.Request({
        method: "POST",
        path: path,
        body: fileData,
        bodyType: "BINARY",
        headers: Object.assign(
          await this.AuthorizationHeader({libraryId, objectId}),
          { "Content-type": "application/octet-stream" }
        )
      })
    );
  }

  async UploadJobStatus({libraryId, objectId, writeToken, jobId}) {
    let path = Path.join("q", writeToken, "upload_jobs", jobId);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  async FinalizeUploadJobs({libraryId, objectId, writeToken}) {
    let path = Path.join("q", writeToken, "files");

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "POST",
        path: path
      })
    );
  }

  async DownloadFile({libraryId, objectId, versionHash, filePath, format="blob"}) {
    let path = Path.join("q", versionHash || objectId, "files", filePath);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Parts */

  async ContentParts({libraryId, objectId, versionHash}) {
    let path = Path.join("q", versionHash || objectId, "parts");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  async DownloadAllParts({libraryId, objectId, versionHash, format="blob"}) {
    let path = Path.join("q", versionHash || objectId, "data");

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  async DownloadPart({libraryId, objectId, versionHash, partHash, format="blob"}) {
    let path = Path.join("q", versionHash || objectId, "data", partHash);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  async UploadPart({libraryId, objectId, writeToken, data}) {
    let path = Path.join("q", writeToken, "data");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "POST",
        path: path,
        body: data,
        bodyType: "BINARY"
      })
    );
  }

  async DeletePart({libraryId, objectId, writeToken, partHash}) {
    let path = Path.join("q", writeToken, "parts", partHash);

    return HandleErrors(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "DELETE",
        path: path
      })
    );
  }

  FabricUrl({libraryId, objectId, versionHash, partHash, queryParams = {}}) {
    let path = "";

    if(libraryId) {
      path = Path.join(path, "qlibs", libraryId);

      if(objectId || versionHash) {
        path = Path.join(path, "q", versionHash || objectId);

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

  async GetByName({name}) {
    let path = Path.join("naming", name);

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({}),
        method: "GET",
        path: path
      })
    );
  }

  async SetByName({name, target}) {
    let path = Path.join("naming");

    await HandleErrors(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({}),
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

    let contentObjectData = await this.ContentObject({libraryId: info.libraryId, objectId: info.objectId});
    contentObjectData.meta = await this.ContentObjectMetadata({
      libraryId: info.libraryId,
      objectId: info.objectId
    });

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
        headers: await this.AuthorizationHeader({}),
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

  async Proofs({libraryId, objectId, versionHash, partHash}) {
    let path = Path.join("q", versionHash || objectId, "data", partHash, "proofs");

    return ResponseToJson(
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({libraryId, objectId}),
        method: "GET",
        path: path
      })
    );
  }

  async QParts({objectId, partHash, format="blob"}) {
    let path = Path.join("qparts", partHash);

    return ResponseToFormat(
      format,
      this.HttpClient.Request({
        headers: await this.AuthorizationHeader({objectId}),
        method: "GET",
        path: path
      })
    );
  }

  /* Contracts */

  FormatContractArguments({abi, methodName, args}) {
    return this.ethClient.FormatContractArguments({abi, methodName, args});
  }

  DeployContract({abi, bytecode, constructorArgs, overrides={}}) {
    return this.ethClient.DeployContract({abi, bytecode, constructorArgs, overrides, signer: this.signer});
  }

  CallContractMethod({contractAddress, abi, methodName, methodArgs, overrides={}}) {
    return this.ethClient.CallContractMethod({contractAddress, abi, methodName, methodArgs, overrides, signer: this.signer});
  }

  CallContractMethodAndWait({contractAddress, abi, methodName, methodArgs, overrides={}}) {
    return this.ethClient.CallContractMethodAndWait({contractAddress, abi, methodName, methodArgs, overrides, signer: this.signer});
  }

  SetCustomContentContract({objectId, customContractAddress, overrides={}}) {
    const contentContractAddress = Utils.HashToAddress({hash: objectId});
    return this.ethClient.SetCustomContentContract({contentContractAddress, customContractAddress, overrides, signer: this.signer});
  }
}

exports.ElvClient = ElvClient;
