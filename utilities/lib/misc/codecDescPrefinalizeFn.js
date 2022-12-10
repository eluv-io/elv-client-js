const ObjectGetMetadata = require("../../ObjectGetMetadata");
const MezSetCodecDescs = require("../../MezSetCodecDescs");

const preFinalizeFn = async ({elvClient, nodeUrl, writeToken}) => {

  const configUrl = `${nodeUrl}config?self&qspace=${elvClient.networkName}`;
  const key = elvClient.signer.signingKey.privateKey;

  // read metadata from draft
  const metadataReader = new ObjectGetMetadata({
    argList: [
      "--subtree", "/abr_mezzanine/offerings",
      "--writeToken", writeToken,
      "--nodeUrl", nodeUrl,
      "--json", "--silent"
    ],
    env: {
      "FABRIC_CONFIG_URL": configUrl,
      "PRIVATE_KEY": key
    }
  });
  const result = await metadataReader.run();

  if(result.exitCode !== 0) throw Error(`codecDescPrefinalizeFn: failed to read metadata /abr_mezzanine/offerings from draft: ${result.errors && result.errors[0]}`);
  if(!result.data.metadata) throw Error("codecDescPrefinalizeFn: null metadata /abr_mezzanine/offerings from draft");

  // get offering keys (there will be more than one if addlOfferingSpecs was used)
  const offeringKeys = Object.keys(result.data.metadata);
  if(offeringKeys.length === 0) throw Error("codecDescPrefinalizeFn: no offering keys found in draft's /abr_mezzanine/offerings");

  for(const offeringKey of offeringKeys){
    const setter = new MezSetCodecDescs({
      argList: [
        "--offeringKey", offeringKey,
        "--writeToken", writeToken,
        "--nodeUrl", nodeUrl
      ],
      env: {
        "FABRIC_CONFIG_URL": configUrl,
        "PRIVATE_KEY": key
      }
    });
    const result = await setter.run();
    if(result.exitCode !== 0) throw Error(`codecDescPrefinalizeFn: error while trying to set codec strings for offering ${offeringKey}: ${result.errors && result.errors[0]}`);
  }
};

module.exports = preFinalizeFn;
