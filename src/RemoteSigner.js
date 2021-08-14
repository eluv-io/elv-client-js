const Ethers = require("ethers");
const Utils = require("./Utils");
const HttpClient = require("./HttpClient");
const UrlJoin = require("url-join");

class RemoteSigner extends Ethers.Signer {
  constructor({
    rpcUris,
    idToken,
    authToken,
    address,
    tenantId,
    provider
  }) {
    super();

    this.HttpClient = new HttpClient({uris: rpcUris});
    this.idToken = idToken;
    this.tenantId = tenantId;

    this.authToken = authToken;
    this.address = address ? Utils.FormatAddress(address) : undefined;
    this.id = this.address ? `ikms${Utils.AddressToHash(this.address)}` : undefined;

    this.provider = provider;
  }

  async Initialize() {
    if(!this.authToken) {
      const {addr, eth, token} = await Utils.ResponseToJson(
        this.HttpClient.Request({
          path: UrlJoin("as", "wlt", "login", "jwt"),
          method: "POST",
          body: this.tenantId ? {tid: this.tenantId} : {},
          headers: {
            Authorization: `Bearer ${this.idToken}`
          }
        })
      );

      this.authToken = token;
      this.address = Utils.FormatAddress(addr);
      this.id = eth;
    }

    this.signer = this.provider.getSigner(this.address);
  }

  // Overrides

  getAddress() {
    return this.address;
  }

  /**
   * Sign a hashed piece of data
   * @param {String} digest - Hex string of hashed data
   * @returns - the signed message as a hex string
   */
  async signDigest(digest) {
    let signature = await Utils.ResponseToJson(
      this.HttpClient.Request({
        method: "POST",
        path: UrlJoin("as", "wlt", "sign", "eth", this.id),
        headers: {
          Authorization: `Bearer ${this.authToken}`
        },
        body: {
          hash: digest
        }
      })
    );

    signature.v = parseInt(signature.v, 16);
    signature.recoveryParam = signature.v - 27;

    return signature;
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
