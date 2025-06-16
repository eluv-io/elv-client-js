const Ethers = require("ethers");
const Utils = require("./Utils");
const HttpClient = require("./HttpClient");
const UrlJoin = require("url-join");
const UUID = require("uuid");

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

  async RetrieveCSAT({email, nonce, tenantId, force=false, duration=24}) {
    nonce = nonce || Utils.B58(UUID.parse(UUID.v4()));

    let response = await Utils.ResponseToJson(
      this.HttpClient.Request({
        method: "POST",
        body: {
          email,
          nonce,
          force,
          tid: tenantId,
          exp: duration * 60 * 60
        },
        path: UrlJoin("as", "wlt", "sign", "csat"),
        headers: {
          Authorization: `Bearer ${this.authToken}`
        },
      })
    );

    response.nonce = nonce;

    return response;
  }

  async CSATStatus({accessToken}) {
    try {
      const response = await Utils.ResponseToJson(
        this.HttpClient.Request({
          method: "POST",
          path: UrlJoin("as", "wlt", "login", "status"),
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
        })
      );

      return response && response.is_active;
    } catch(error) {
      return !error || error.status !== 403;
    }
  }

  async ReleaseCSAT({accessToken}) {
    return await Utils.ResponseToJson(
      this.HttpClient.Request({
        method: "POST",
        path: UrlJoin("as", "wlt", "login", "release"),
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      })
    );
  }

  // Overrides

  getAddress() {
    return this.address;
  }

  async signDigest(digest) {
    if(!this.signatureCache[digest]) {
      this.signatureCache[digest] = new Promise(async (resolve, reject) => {
        try {
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

    return this.populateTransaction(transaction, this.provider, this.address).then((tx) => {
      return this.sign(tx).then((signedTransaction) => {
        return this.provider.sendTransaction(signedTransaction);
      });
    });
  }

  connect() {}
}

module.exports = RemoteSigner;
