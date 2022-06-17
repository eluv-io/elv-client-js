const {ElvClient} = require("../ElvClient");
const {FormatNFT} = require("./Utils");

/**
 * @namespace
 * @description This is a utility namespace mostly containing functions for managing
 * multiformat type conversions.
 *
 * Utils can be imported separately from the client:
 *
 * const Utils = require("@eluvio/elv-client-js/src/Utils)
 *
 * or
 *
 * import Utils from "@eluvio/elv-client-js/src/Utils"
 *
 *
 * It can be accessed from ElvClient and FrameClient as client.utils
 */
class ElvMarketplaceClient {
  constructor(client) {
    this.client = client;
    this.loggedIn = false;

    this.utils = client.utils;
  }

  Log(message, error=false) {
    if(error) {
      console.error("ElvMarketplaceClient:", message);
    } else {
      console.log("ElvMarketplaceClient:", message);
    }
  }

  static async Initialize({networkName, configUrl}) {
    let client;
    if(configUrl) {
      client = await ElvClient.FromConfigurationUrl({configUrl, assumeV3: true});
    } else if(networkName) {
      client = await ElvClient.FromNetworkName({networkName, assumeV3: true});
    } else {
      throw Error("Neither networkName nor configUrl provided in ElvMarketplaceClient.Initialize");
    }

    this.publicStaticToken = client.staticToken;

    return new ElvMarketplaceClient(client);
  }

  /**
   * Authenticate with an ElvMarketplaceClient authorization token
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} token - A previously generated ElvMarketplaceClient authorization token;
   */
  async Authenticate({token}) {
    const { fabricToken, tenantId, address, email, expiresAt } = this.utils.FromB58(token);

    if(Date.now() > expiresAt) {
      throw Error("ElvMarketplaceClient: Provided authorization token has expired");
    }

    this.client.SetStaticToken({token: fabricToken});

    return this.SetAuthorization({fabricToken, tenantId, address, email, expiresAt});
  }

  /**
   * Authenticate with an OAuth ID token
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} idToken - An OAuth ID token
   * @param {string=} tenantId - ID of tenant with which to associate the user
   * @param {string=} email - Email address of the user. If not specified, this method will attempt to extract the email from the ID token.
   * @param {boolean=} shareEmail=false - Whether or not the user consents to sharing their email
   * @param {number=} tokenDuration=24 - Number of hours the generated authorization token will last before expiring
   *
   * @returns {Promise<string>} - Returns an authorization token that can be used to initialize the client using <a href="#Authenticate">Authenticate</a>.
   * Save this token to avoid having to reauthenticate with OAuth. This token expires after 24 hours.
   */
  async AuthenticateOAuth({idToken, tenantId, email, shareEmail=false, tokenDuration=24}) {
    await this.client.SetRemoteSigner({idToken, tenantId, extraData: { share_email: shareEmail }, unsignedPublicAuth: true});

    const expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
    const fabricToken = await this.client.CreateFabricToken({duration: tokenDuration * 60 * 60 * 1000});
    const address = this.client.utils.FormatAddress(this.client.CurrentAccountAddress());

    if(!email) {
      try {
        const decodedToken = JSON.parse(this.utils.FromB64URL(idToken.split(".")[1]));
        email = decodedToken.email;
      } catch(error) {
        throw Error("Failed to decode ID token");
      }
    }

    this.client.SetStaticToken({token: fabricToken});

    return this.SetAuthorization({fabricToken, tenantId, address, email, expiresAt, walletType: "Custodial", walletName: "Eluvio"});
  }

  /**
   * Authenticate with an external Ethereum compatible wallet, like Metamask.
   *
   * @methodGroup Authorization
   * @namedParams
   * @param {string} address - The address of the wallet
   * @param {number=} tokenDuration=24 - Number of hours the generated authorization token will last before expiring
   * @param {string=} walletName=Metamask - Name of the external wallet
   * @param {function=} Sign - The method used for signing by the wallet. If not specified, will attempt to sign with Metamask.
   *
   * @returns {Promise<string>} - Returns an authorization token that can be used to initialize the client using <a href="#Authenticate">Authenticate</a>.
   * Save this token to avoid having to reauthenticate. This token expires after 24 hours.
   */
  async AuthenticateExternalWallet({address, tokenDuration=24, walletName="Metamask", Sign}) {
    if(!address) {
      address = window.ethereum.selectedAddress;
    }

    address = this.utils.FormatAddress(address);

    if(!Sign) {
      Sign = async message => this.SignMetamask({message, address});
    }

    const expiresAt = Date.now() + tokenDuration * 60 * 60 * 1000;
    const fabricToken = await this.client.CreateFabricToken({
      address,
      duration: tokenDuration * 60 * 60 * 1000,
      Sign,
      addEthereumPrefix: false
    });

    return this.SetAuthorization({fabricToken, address, expiresAt, walletType: "External", walletName});
  }

  SetAuthorization({fabricToken, tenantId, address, email, expiresAt, walletType, walletName}) {
    this.authorization = {
      fabricToken,
      tenantId,
      address,
      email,
      expiresAt,
      walletType,
      walletName
    };

    return this.utils.B58(JSON.stringify(this.authorization));
  }

  async SignMetamask({message, address}) {
    if(!window.ethereum) {
      throw Error("ElvMarketplaceClient: Unable to initialize - Metamask not available");
    }

    await window.ethereum.request({method: "eth_requestAccounts"});
    const from = address || window.ethereum.selectedAddress;
    return await window.ethereum.request({
      method: "personal_sign",
      params: [message, from, ""],
    });
  }
}

Object.assign(ElvMarketplaceClient.prototype, require("./ClientMethods"));

exports.ElvMarketplaceClient = ElvMarketplaceClient;
