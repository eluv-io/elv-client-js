//const { ElvClient } = require("../src/ElvClient");
const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");

const ClientConfiguration = require("../TestConfiguration.json");

const ContentContract = require("../src/contracts/BaseContent");
const LibraryContract = require("../src/contracts/BaseLibrary");
const SpaceContract = require("../src/contracts/BaseContentSpace");
const WalletContract = require("../src/contracts/BaseAccessWallet");
const AccessGroupContract = require("../src/contracts/BaseAccessControlGroup");
const cbor = require("cbor");
const fs = require("fs");

const Crypto = require("../src/Crypto");
const Ethers = require("ethers");
const UUID = require("uuid/v4");

const KickReplacementFee = async (signer, gasPrice) => {
  try {
    const transaction = await signer.sendTransaction({
      to: signer.address,
      value: 0,
      gasPrice: gasPrice || await signer.provider.getGasPrice()
    });

    return await transaction.wait();
  } catch(error) {
    console.log(error);
    await KickReplacementFee(signer, error.transaction.gasPrice.mul(10));
  }
};

const AddToSpaceGroup = async (client, address) => {
  const groupAddress = await client.ContentObjectMetadata({
    libraryId: client.contentSpaceLibraryId,
    objectId: client.contentSpaceObjectId,
    metadataSubtree: "contentSpaceGroupAddress"
  });

  // Add new account to content space group
  await client.AddAccessGroupManager({
    contractAddress: groupAddress,
    memberAddress: address
  });
};

const Create = async (client) => {
  const libraryId = await client.CreateContentLibrary({name: "Test"});

  const createResponse = await client.CreateContentObject({libraryId});
  const objectId = createResponse.id;

  await client.ReplaceMetadata({
    libraryId,
    objectId,
    writeToken: createResponse.write_token,
    metadata: {meta: "Data"}
  });

  const finalizeResponse = await client.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken: createResponse.write_token
  });

  console.log(libraryId);
  console.log(objectId);
  console.log(finalizeResponse.hash);
};

const Update = async (client, libraryId, objectId, todo) => {
  const editResponse = await client.EditContentObject({libraryId, objectId});

  await todo(editResponse.write_token);

  await client.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken: editResponse.write_token
  });
};

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });


    //const client = await ElvClient.FromConfigurationUrl({configUrl: "http://main.net955304.contentfabric.io/config"});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      //privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
      //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
    });

    await client.SetSigner({signer});

    const Replacer = (name, value) => {
      if(!value || typeof value !== "object" || Array.isArray(value)) { return value; }

      if(Buffer.isBuffer(value) || (value.type === "Buffer" && value.data)) {
        return `<Buffer ${value.size || value.data.length}>`;
      }

      const objectName = (value.toString().match(/\[object\s+(.*)\]/) || [])[1];
      if(!objectName || objectName === "Object") { return value; }

      switch(objectName) {
        case ("ArrayBuffer"):
          return `<ArrayBuffer ${value.byteLength}>`;
        case ("Response"):
          return `<Response ${value.size}>`;
        case ("Object"):
          return value;
        default:
          return `<${objectName}>`;
      }
    };

    const opts = {
      "dash": {
        "playoutUrl": "https://host-66-220-3-82.contentfabric.io/q/hq__BD1BouHkFraAcDjvoyHoiKpVhf4dXzNsDT5USe8mrZ7YDhLPDoZGnoU32iZvDYiQW8vVi6X7rV/rep/playout/default/dash-widevine/dash.mpd?authorization=eyJxc3BhY2VfaWQiOiJpc3BjQXBvV1BRUnJUa1JRVjFLcFlqdnFQeVNBbXhhIiwicWxpYl9pZCI6ImlsaWJxTUdXTVNodUZjcTlLdU1pTHJaa1FNakFLanUiLCJhZGRyIjoiMHg5NmEwMTA0QkE0MzRCMzA2NTFBOTE2NTY4NTg5MDBCZGRDNTcwMzY0IiwicWlkIjoiaXFfXzJ2RGJteFRkYWl2UG5tRG44UktMYnhTSFVNZmoiLCJncmFudCI6InJlYWQiLCJ0eF9yZXF1aXJlZCI6ZmFsc2UsImlhdCI6MTU2NjQxNzMwMywiZXhwIjoxNTY2NTAzNzAzLCJhdXRoX3NpZyI6IkVTMjU2S19BRjNYMmRRQTFCb3JYUGRpbW5UcDhYdkQxSlJDUmdMZnU2Q2s1MTlMY05abllVYXRVallLS1BMRjc2TUsyRXliczZVWWtXaVFKanU4RVZBYVlYWURMcWhWUiIsImFmZ2hfcGsiOiIifQ%3D%3D.RVMyNTZLXzI2dDVvUkpIRlpaZjN3QWJndHk3bzVFR3lzV1A0cHk1ZWpHaXdkOURyOWNxNVJITmNSZEZwd1o1a2NlWjhaS2l4dVJhQW9meEdIU3VFeEFuUnJpU1h6b0J5",
        "drms": {
          "widevine": {
            "licenseServers": [
              "https://host-66-220-3-82.contentfabric.io/wv/?qhash=hq__BD1BouHkFraAcDjvoyHoiKpVhf4dXzNsDT5USe8mrZ7YDhLPDoZGnoU32iZvDYiQW8vVi6X7rV",
              "http://66.220.3.82:8545/wv/?qhash=hq__BD1BouHkFraAcDjvoyHoiKpVhf4dXzNsDT5USe8mrZ7YDhLPDoZGnoU32iZvDYiQW8vVi6X7rV"
            ]
          }
        }
      },
      "hls": {
        "playoutUrl": "https://host-66-220-3-82.contentfabric.io/q/hq__BD1BouHkFraAcDjvoyHoiKpVhf4dXzNsDT5USe8mrZ7YDhLPDoZGnoU32iZvDYiQW8vVi6X7rV/rep/playout/default/hls-aes/playlist.m3u8?authorization=eyJxc3BhY2VfaWQiOiJpc3BjQXBvV1BRUnJUa1JRVjFLcFlqdnFQeVNBbXhhIiwicWxpYl9pZCI6ImlsaWJxTUdXTVNodUZjcTlLdU1pTHJaa1FNakFLanUiLCJhZGRyIjoiMHg5NmEwMTA0QkE0MzRCMzA2NTFBOTE2NTY4NTg5MDBCZGRDNTcwMzY0IiwicWlkIjoiaXFfXzJ2RGJteFRkYWl2UG5tRG44UktMYnhTSFVNZmoiLCJncmFudCI6InJlYWQiLCJ0eF9yZXF1aXJlZCI6ZmFsc2UsImlhdCI6MTU2NjQxNzMwMywiZXhwIjoxNTY2NTAzNzAzLCJhdXRoX3NpZyI6IkVTMjU2S19BRjNYMmRRQTFCb3JYUGRpbW5UcDhYdkQxSlJDUmdMZnU2Q2s1MTlMY05abllVYXRVallLS1BMRjc2TUsyRXliczZVWWtXaVFKanU4RVZBYVlYWURMcWhWUiIsImFmZ2hfcGsiOiIifQ%3D%3D.RVMyNTZLXzI2dDVvUkpIRlpaZjN3QWJndHk3bzVFR3lzV1A0cHk1ZWpHaXdkOURyOWNxNVJITmNSZEZwd1o1a2NlWjhaS2l4dVJhQW9meEdIU3VFeEFuUnJpU1h6b0J5",
        "drms": {
          "aes-128": {}
        }
      }
    }

    fs.writeFileSync("out.txt", JSON.stringify({result: `${JSON.stringify(opts, Replacer, 2)}`}));
  } catch(error) {
    console.error(error);
  }
};

Test();
