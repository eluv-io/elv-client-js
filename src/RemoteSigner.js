const Ethers = require("ethers");
const Utils = require("./Utils");
const HttpClient = require("./HttpClient");
const UrlJoin = require("url-join");

class RemoteSigner extends Ethers.Signer {
  constructor({
    rpcUris,
    idToken,
    provider
  }) {
    super();

    this.HttpClient = new HttpClient({uris: rpcUris});
    this.idToken = idToken;

    this.provider = provider;
  }

  async Initialize() {
    let accounts = await this.Accounts();

    if(!accounts || accounts.length === 0) {
      await this.CreateAccount();
      accounts = await this.Accounts();
    }

    this.id = accounts[0];
    this.address = Utils.HashToAddress(this.id);

    this.signer = this.provider.getSigner(this.address);
  }

  async CreateAccount() {
    return await this.HttpClient.Request({
      path: UrlJoin("as", "jwt", "generate", "eth"),
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.idToken}`
      }
    });
  }

  /**
   * Get fabric IDs sorted by network.
   * @returns {object} - returns object of networks with the ikms (fabric) IDs associated with the oauth key
   */
  async Accounts() {
    return ((await Utils.ResponseToJson(
      this.HttpClient.Request({
        path: UrlJoin("as", "jwt", "keys"),
        headers: {
          Authorization: `Bearer ${this.idToken}`,
          "Cache-Control": "no-cache",
        }
      })
    )).eth || []).sort();
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
        path: UrlJoin("as", "jwt", "sign", "eth", this.id),
        headers: {
          Authorization: `Bearer ${this.idToken}`
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
