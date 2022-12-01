const ObjectGetMetadata = require("../../ObjectGetMetadata");
const MezSetCodecDescs = require("../../MezSetCodecDescs");

const preFinalizeFn = async ({configUrl, writeToken}) => {
  const url = new URL(configUrl);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  const nodeUrl = url.href;

  // read metadata from draft
  const metadataReader = new ObjectGetMetadata({
    argList: [
      "--subtree", "/abr_mezzanine/offerings",
      "--writeToken", writeToken,
      "--nodeUrl", nodeUrl,
      "--json", "--silent"
    ],
    env: {
      "FABRIC_CONFIG_URL": configUrl
    }
  });
  const result = await metadataReader.run();
  if(result.exit_code !== 0) throw Error("codecDescPrefinalizeFn: failed to read metadata /abr_mezzanine/offerings from draft");
  if(!result.metadata) throw Error("codecDescPrefinalizeFn: null metadata /abr_mezzanine/offerings from draft");

  // get offering keys (there will be more than one if addlOfferingSpecs was used)
  const offeringKeys = Object.keys(result.metadata);
  if(offeringKeys.length === 0) throw Error("codecDescPrefinalizeFn: no offering keys found in draft's /abr_mezzanine/offerings");

  for(const offeringKey of offeringKeys){
    const setter = new MezSetCodecDescs({
      argList: [
        "--offeringKey", offeringKey,
        "--writeToken", writeToken,
        "--nodeUrl", nodeUrl
      ],
      env: {
        "FABRIC_CONFIG_URL": configUrl
      }
    });
    await setter.run();
  }
};

module.exports = preFinalizeFn;
