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
   * Format a cross-chain oracle request.
   * Used as the xcoRequest argument to this.XcoView().
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string=} chain_type - the chain type; "eip155", "flow", "solana"
   * @param {string=} chain_id - the chain ID; a number for ethereum (eip155), "mainnet" or "testnet" for flow,
   * - a hash "4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ" or "8E9rvCKLFQia2Y35HXjjpWzj8weVo44K" for solana
   * @param {string=} asset_type - the asset type; "erc721" or "erc20" for an ethereum token or NFT,
   * - "NonFungibleToken" for a flow NFT
   * @param {string=} asset_id - the asset contract ID; a hex address "0x123.." for ethereum,
   * - a hex:string - "0x...:NFT_NAME" for flow,
   * - a base58 string for solana
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
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {object} xcoRequest - Object containing specification of the chain asset to query for token balance
   */
  async XcoBalanceView({xcoRequest}) {
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
}

module.exports = CrossChainOracle;
