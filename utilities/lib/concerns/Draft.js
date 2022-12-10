// for scripts that work with Drafts (new unfinalized objects/versions)
const CBOR = require("cbor");
const fetch = require("node-fetch").default;
const URI = require("urijs");

const Client = require("./Client");
const Logger = require("./Logger");
const Utils = require("../../../src/Utils");

const blueprint = {
  name: "Draft",
  concerns: [Client, Logger]
};

const New = context => {
  const logger = context.concerns.Logger;

  const create = async ({libraryId, objectId, metadata, type}) => {
    if(!libraryId && !objectId) throw Error("Draft.create() - no libraryId or objectId supplied");
    const client = await context.concerns.Client.get();
    const options = {
      meta: metadata,
      type
    };

    let response;
    if(objectId) {
      // create new draft version
      logger.log(`Creating new draft version for object ${objectId}...`);
      response = await client.EditContentObject({
        libraryId,
        objectId,
        options
      });
    } else {
      // create new draft object
      logger.log(`Creating new draft object in library ${libraryId}...`);
      response = await client.CreateContentObject({
        libraryId,
        options
      });
      logger.log(`New object ID: ${response.objectId}`);
    }

    logger.log(`New write token: ${response.writeToken}`);
    return {
      objectId: response.objectId,
      writeToken: response.writeToken
    };
  };

  const decode = ({writeToken}) => {
    if(!writeToken) throw Error("Draft.decode() - missing writeToken");
    return Utils.DecodeWriteToken(writeToken);
  };

  const metadata = async ({libraryId, objectId, subtree, writeToken}) => {
    if(!writeToken) throw Error("Draft.metadata() - missing writeToken");
    return await context.concerns.Metadata.get({
      libraryId,
      objectId,
      subtree,
      writeToken
    });
  };

  const nodeInfo = async ({writeToken}) => {
    if(!writeToken) throw Error("Draft.node() - missing writeToken");
    logger.log(`Getting node info for write token ${writeToken}...`);
    const {nodeId} = decode({writeToken});
    const nodeAddress = Utils.HashToAddress(nodeId);
    const client = await context.concerns.Client.get();

    const numActiveNodes = await client.CallContractMethod({
      contractAddress: client.contentSpaceAddress,
      methodName: "numActiveNodes"
    });

    for(let i = 0; i < numActiveNodes; i++){
      const activeNodeAddress = await client.CallContractMethod({
        contractAddress: client.contentSpaceAddress,
        methodName: "activeNodeAddresses",
        methodArgs: [i]
      });
      if(Utils.FormatAddress(activeNodeAddress) === Utils.FormatAddress(nodeAddress)){
        const nodeInfoCBOR = await client.CallContractMethod({
          contractAddress: client.contentSpaceAddress,
          methodName: "activeNodeLocators",
          methodArgs: [i]
        });
        return CBOR.decodeFirstSync(nodeInfoCBOR.slice(16, nodeInfoCBOR.length));
      }
    }
    throw Error(`No match found for node: ${nodeId} (possibly wrong network - double-check your fabric config url)`);
  };

  const nodeURL = async ({writeToken}) => {
    const info = await nodeInfo({writeToken});
    const fabricInfo = info.fab[0];
    const url = new URL("https://dummy");
    url.protocol = fabricInfo.scheme;
    url.hostname = fabricInfo.host;
    if(fabricInfo.port !== "") {
      url.port = parseInt(fabricInfo.port);
    }
    const nodeUrl = url.href;
    await recordWriteTokenURI({writeToken, nodeUrl});
    return nodeUrl;
  };

  const nodeURLValidate = async ({nodeUrl, writeToken}) => {
    if(!nodeUrl) throw Error("Draft.nodeURLValidate() - nodeUrl missing");
    if(!writeToken) throw Error("Draft.nodeURLValidate() - writeToken missing");

    const tokenInfo = decode({writeToken});
    const client = await context.concerns.Client.get();

    const nodeConfigUrl = context.concerns.Client.altConfigUrl(nodeUrl);

    const response = await fetch(nodeConfigUrl);
    if(!response.ok) throw Error(`Check that nodeUrl '${nodeUrl}' is for network '${client.networkName}'. Node config response: '${response.statusText}'`);
    const body = await response.json();

    if(tokenInfo.nodeId !== body.node_id){
      throw Error(`--nodeUrl incorrect for --writeToken (nodeUrl node ID:${tokenInfo.nodeId}, writeToken node ID:${body.node_id})`);
    }
  };

  const objectId = ({writeToken}) => writeToken
    ? decode({writeToken}).objectId
    : throwError("Draft.objectId() - writeToken missing");

  const partList = async ({libraryId, objectId, writeToken}) => {
    if(!writeToken) throw Error("Draft.partList() - missing writeToken");
    return await context.concerns.Part.list({libraryId, objectId, writeToken});
  };

  const recordWriteTokenURI = async ({writeToken, nodeUrl}) => {
    await nodeURLValidate({writeToken, nodeUrl});
    // save url to HttpClient.draftURIs so request URLs containing this writeToken get routed to proper node
    const client = await context.concerns.Client.get();
    client.HttpClient.RecordWriteToken(writeToken, new URI(nodeUrl));
  };

  // instance interface
  return {
    create,
    decode,
    metadata,
    nodeInfo,
    nodeURL,
    nodeURLValidate,
    objectId,
    partList,
    recordWriteTokenURI
  };
};

module.exports = {
  blueprint,
  New
};
