const Ethers = require("ethers");
const Utils = require("./Utils");
const {LogMessage} = require("./LogMessage");
const Pako = require("pako");

class CrossChainOracle {

  constructor({client, contentSpaceId, debug=false}) {
    this.client = client;
    this.contentSpaceId = contentSpaceId;
    this.debug = debug;
  }

  Log(...message) {
    LogMessage(this, message, false);
  }

  /**
   * Create a signed authorization token used for calling the cross-chain oracle.
   * No need to call this externally, is called via this.XcoView().
   */
  async CreateOracleAccessToken() {
    const address = this.client.signer.address;
    let token = {
      sub: `iusr${Utils.AddressToHash(address)}`,
      adr: Buffer.from(address.replace(/^0x/, ""), "hex").toString("base64"),
      spc: this.contentSpaceId,
      iat: Date.now(),
      exp: Date.now() + 15 * 1000,
    };

    let message = `Eluvio Content Fabric Access Token 1.0\n${JSON.stringify(
      token
    )}`;

    const signature = await this.client.signDigest(message);

    const compressedToken = Pako.deflateRaw(
      Buffer.from(JSON.stringify(token), "utf-8")
    );
    return `acspjc${Utils.B58(
      Buffer.concat([
        Buffer.from(signature.replace(/^0x/, ""), "hex"),
        Buffer.from(compressedToken),
      ])
    )}`;
  }

  /**
   * Format a cross-chain oracle request.  Used as the xcoRequest argument to this.XcoView().
   */
  CreateXcoRequest({chain_type= "eip155", chain_id= "1", asset_type= "erc721", asset_id}) {
    const xcoReq = {
      chain_type: chain_type,
      chain_id: chain_id,
      asset_type: asset_type,
      asset_id: asset_id,
      method: "balance"
    };
    this.Log("xcoReq: ", xcoReq);
    return xcoReq;
  }

  /**
   * Make a cross-chain oracle call for the chain asset specified in the xcoRequest.
   * Create the xcoRequest via this.CreateXcoRequest().
   */
  async XcoView({xcoRequest}) {
    // Create a client-signed access token  in order to access the cross-chain oracle API
    const xcoToken = await this.CreateOracleAccessToken();
    this.Log("oracle access token", xcoToken);
    this.Log("oracle decoded token", this.client.utils.DecodeSignedToken(xcoToken));
    this.Log("xcoRequest: ", xcoRequest);

    // Call the cross-chain oracle 'view' API
    try {
      let res = await Utils.ResponseToFormat(
        "json",
        this.client.authClient.MakeAuthServiceRequest({
          method: "POST",
          path: "/as/xco/view",
          body: xcoRequest,
          headers: {
            Authorization: `Bearer ${xcoToken}`,
          },
        })
      );
      this.Log("xcoResponse", res);
      return res;
    } catch(err) {
      this.Log("XcoView error: ", err);
      return null;
    }
  }

  async Sign(message) {
    const signer=this.client.signer;
    let signDigest;
    if(signer.signDigest) {
      signDigest = signer.signDigest;
    } else if(signer.signingKey && signer.signingKey.signDigest) {
      signDigest = signer.signingKey.signDigest;
    } else if(signer.provider && signer.provider.request) {
      signDigest = (_message) => {
        return signer.provider.request({
          method: "personal_sign",
          params: [signer.address, _message],
        });
      };
    } else if(signer.provider && signer.provider.provider && signer.provider.provider.request) {
      signDigest = (_message) => {
        return signer.provider.provider.request({
          method: "personal_sign",
          params: [signer.address, _message],
        });
      };
    }
    this.client.signDigest = signDigest;
    this.client.signer.signDigest = signDigest;

    return Ethers.utils.joinSignature(await this.client.signDigest(message));
  }
}

module.exports = CrossChainOracle;