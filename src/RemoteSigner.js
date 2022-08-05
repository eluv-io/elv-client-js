const Ethers = require("ethers");
const Utils = require("./Utils");
const HttpClient = require("./HttpClient");
const UrlJoin = require("url-join");

class RemoteSigner extends Ethers.Signer {
  constructor({
    signerURIs,
    idToken,
    authToken,
    tenantId,
    provider,
    extraData={},
    unsignedPublicAuth=false
  }) {
    super();

    this.remoteSigner = true;
    this.unsignedPublicAuth = unsignedPublicAuth;

    this.HttpClient = new HttpClient({uris: signerURIs});
    this.idToken = idToken;
    this.tenantId = tenantId;

    this.authToken = authToken;
    this.extraLoginData = extraData || {};

    this.provider = provider;

    this.signatureCache = {};
  }

  async Initialize() {
    if(!this.authToken) {
      const {addr, eth, token} = await Utils.ResponseToJson(
        this.HttpClient.Request({
          path: UrlJoin("as", "wlt", "login", "jwt"),
          method: "POST",
          body: this.tenantId ? { tid: this.tenantId, ext: this.extraLoginData || {} } : { ext: this.extraLoginData || {} },
          headers: {
            Authorization: `Bearer ${this.idToken}`
          }
        })
      );

      this.authToken = token;
      this.address = Utils.FormatAddress(addr);
      this.id = eth;
    }

    if(!this.address) {
      const keys = await Utils.ResponseToJson(
        this.HttpClient.Request({
          method: "GET",
          path: UrlJoin("as", "wlt", "keys"),
          headers: {
            Authorization: `Bearer ${this.authToken}`
          }
        })
      );

      const address = keys.eth[0];

      if(address && address.startsWith("0x")) {
        this.address = address;
      } else {
        this.address = Utils.HashToAddress(keys.eth[0]);
      }
    }

    this.id = this.address ? `ikms${Utils.AddressToHash(this.address)}` : undefined;
    this.signer = this.provider.getSigner(this.address);
  }

  // Overrides

  getAddress() {
    return this.address;
  }

  /**
   * Sign a hashed piece of data
   * @param {String} digest - string of hashed data
   * @param {Boolean} usePersonal - use EIP-191 personal_sign
   * @returns - the signed message as a hex string
   */
  async signDigest(digest, usePersonal=false) {
    if(!this.signatureCache[digest]) {
      this.signatureCache[digest] = new Promise(async (resolve, reject) => {
        try {
          let path;
          let body;
          if(usePersonal) {
            path = UrlJoin("as", "wlt", "sign", "personal", this.id);
            body = { message: digest };
          } else {
            path = UrlJoin("as", "wlt", "sign", "eth", this.id);
            body = { hash: digest };
          }
          let signature = await Utils.ResponseToJson(
            this.HttpClient.Request({
              method: "POST",
              path: path,
              headers: {
                Authorization: `Bearer ${this.authToken}`
              },
              body: body,
            })
          );

          signature.v = parseInt(signature.v, 16);
          signature.recoveryParam = signature.v - 27;

          resolve(signature);
        } catch(error) {
          reject(error);
        }
      });
    }

    return await this.signatureCache[digest];
  }

  async signMessage(message) {
    return Promise.resolve(Ethers.utils.joinSignature(`0x${await this.signDigest(Ethers.utils.hashMessage(message))}`));
  }

  async sign(transaction) {
    transaction = await Ethers.utils.resolveProperties(transaction);

    const signature = await this.signDigest(
      Ethers.utils.keccak256(
        Ethers.utils.serializeTransaction(transaction)
      )
    );

    return Ethers.utils.serializeTransaction(transaction, signature);
  }

  async sendTransaction(transaction) {
    if(transaction.nonce == null) {
      transaction = Ethers.utils.shallowCopy(transaction);
      transaction.nonce = await this.provider.getTransactionCount(this.address, "pending");
    }

    return Ethers.utils.populateTransaction(transaction, this.provider, this.address).then((tx) => {
      return this.sign(tx).then((signedTransaction) => {
        return this.provider.sendTransaction(signedTransaction);
      });
    });
  }

  connect() {}
}

module.exports = RemoteSigner;
