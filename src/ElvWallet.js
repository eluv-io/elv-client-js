const Ethers = require("ethers");

class ElvWallet {
  constructor(providerUrl) {
    this.provider = new Ethers.providers.JsonRpcProvider(providerUrl);
    this.signers = {};
  }

  GenerateMnemonic() {
    return Ethers.utils.HDNode.entropyToMnemonic(Ethers.utils.randomBytes(16));
  }

  AddAccountFromMnemonic({accountName, mnemonic}) {
    let signer = Ethers.Wallet.fromMnemonic(mnemonic);

    return this.AddAccount({
      accountName,
      privateKey: signer.privateKey
    });
  }

  async AddAccountFromEncryptedPK({ accountName, encryptedPrivateKey, password }) {
    if(typeof encryptedPrivateKey === "object") {
      encryptedPrivateKey = JSON.stringify(encryptedPrivateKey);
    }

    let signer = await Ethers.Wallet.fromEncryptedJson(encryptedPrivateKey, password);

    return this.AddAccount({
      accountName,
      privateKey: signer.privateKey
    });
  }

  AddAccount({ accountName, privateKey }) {
    let signer = new Ethers.Wallet(privateKey);
    signer = signer.connect(this.provider);

    if(accountName) {
      this.signers[accountName] = signer;
    }

    return signer;
  }

  async GetAccountBalance({ accountName }) {
    const signer = this.GetAccount({ accountName });

    if(!signer) {
      throw Error("Unknown account: " + accountName);
    }

    return Ethers.utils.formatEther(await signer.getBalance());
  }

  async GetEncryptedPrivateKey({ accountName, password }) {
    const signer = this.GetAccount({ accountName });

    if(!signer) {
      throw Error("Unknown account: " + accountName);
    }

    return await signer.encrypt(password);
  }

  GetAccount({ accountName }) {
    return this.signers[accountName];
  }

  RemoveAccount({ accountName }) {
    delete this.signers[accountName];
  }
}

module.exports = ElvWallet;
