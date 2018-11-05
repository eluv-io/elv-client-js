const Ethers = require("ethers");

class ElvWallet {
  constructor(providerUrl) {
    this.provider = new Ethers.providers.JsonRpcProvider(providerUrl);
    this.signers = {};
  }

  async AddAccountFromEncryptedPK({ accountName, encryptedPrivateKey, password }) {
    if(typeof encryptedPrivateKey === "object") {
      encryptedPrivateKey = JSON.stringify(encryptedPrivateKey);
    }

    let signer = await Ethers.Wallet.fromEncryptedJson(encryptedPrivateKey, password);
    signer = signer.connect(this.provider);
    this.signers[accountName] = signer;
    return signer;
  }

  AddAccount({ accountName, privateKey }) {
    let signer = new Ethers.Wallet(privateKey, this.provider);
    this.signers[accountName] = signer;
    return signer;
  }

  GetAccount({ accountName }) {
    return this.signers[accountName];
  }

  RemoveAccount({ accountName }) {
    delete this.signers[accountName];
  }
}

module.exports = ElvWallet;
