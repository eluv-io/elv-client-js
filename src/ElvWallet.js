const Ethers = require("ethers");

class ElvWallet {
  /**
   * Create a new ElvWallet connected to the given provider
   *
   * NOTE: It is recommended to initialize wallets from the ElvClient, not using this constructor
   *
   * @see ElvClient#GenerateWallet()
   *
   * @param {string} providerUrl - URL of blockchain provider
   */
  constructor(provider) {
    this.provider = provider;
    this.signers = {};
  }

  /**
   * Generate a mnemonic that can be used to initialize a private key
   *
   * @returns {string} - Space-separated list of random words
   */
  GenerateMnemonic() {
    return Ethers.utils.HDNode.entropyToMnemonic(Ethers.utils.randomBytes(16));
  }

  /**
   * Generate a private key from the given mnemonic
   *
   * @namedParams
   * @param {string=} accountName - Name of account to save in wallet. Account will be saved in the wallet if provided.
   * @param {string} mnemonic - Mnemonic from which to generate a private key
   *
   * @returns {Signer} - Signer with the generated private key, connected to the provider
   */
  AddAccountFromMnemonic({accountName, mnemonic}) {
    let signer = Ethers.Wallet.fromMnemonic(mnemonic);

    return this.AddAccount({
      accountName,
      privateKey: signer.privateKey
    });
  }

  /**
   * Add an account from an encrypted private key (Ethereum keystore format)
   *
   * @namedParams
   * @param {string=} accountName - Name of account to save in wallet. Account will be saved in the wallet if provided.
   * @param {string} encryptedPrivateKey - Encrypted private key to decrypt
   * @params {string} password - Password with which to decrypt the private key
   *
   * @returns {Promise<Signer>} - Signer with the decrypted private key, connected to the provider
   */
  async AddAccountFromEncryptedPK({accountName, encryptedPrivateKey, password}) {
    if(typeof encryptedPrivateKey === "object") {
      encryptedPrivateKey = JSON.stringify(encryptedPrivateKey);
    }

    let signer = await Ethers.Wallet.fromEncryptedJson(encryptedPrivateKey, password);

    return this.AddAccount({
      accountName,
      privateKey: signer.privateKey
    });
  }

  /**
   * Add an account from a private key (Ethereum keystore format)
   *
   * @namedParams
   * @param {string=} accountName - Name of account to save in wallet. Account will be saved in the wallet if provided.
   * @param {string} privateKey - Private key to use
   *
   * @returns {Signer} - Signer with the private key, connected to the provider
   */
  AddAccount({accountName, privateKey}) {
    let signer = new Ethers.Wallet(privateKey);
    signer = signer.connect(this.provider);

    if(accountName) {
      this.signers[accountName] = signer;
    }

    return signer;
  }

  /**
   * Get the balance of the account. The account to query can be specified either by
   * passing the signer object, or by passing the account name of a saved account
   *
   * Note: Either the signer OR the account name should be specified
   *
   * @namedParams
   * @param {string=} accountName - Saved account to query the account balance of
   * @param {Signer=} signer - Signer to query the account balance of
   *
   * @returns {number} - Account balance of the specified account, in ETH
   */
  async GetAccountBalance({accountName, signer}) {
    const accountSigner = signer || this.GetAccount({ accountName });

    if(!accountSigner) {
      throw Error("Unknown account: " + accountName);
    }

    return Ethers.utils.formatEther(await accountSigner.getBalance());
  }

  /**
   * Generate the encrypted private key (Ethereum keystore format) of the signer's private key
   * The private key to decrypt can be specified either by passing the signer object, or by passing
   * the account name of a saved account
   *
   * Note: Either the signer OR the account name should be specified
   *
   * @namedParams
   * @param {string=} accountName - Saved account to encrypt the private key of
   * @param {string=} signer - Signer to encrypt the private key of
   * @params {string} password - Password to encrypt the private key with
   *
   * @returns {Promise<string>} - The encrypted private key (in Ethereum keystore format)
   */
  async GenerateEncryptedPrivateKey({accountName, signer, password, options}) {
    const accountSigner = signer || this.GetAccount({ accountName });

    if(!accountSigner) {
      throw Error("Unknown account: " + accountName);
    }

    return await accountSigner.encrypt(password, options);
  }

  /**
   * Get the signer of a previously saved account by name
   *
   * @namedParams
   * @param {string} accountName - Name of the account

   * @returns {(Signer|undefined)} - Signer of the saved account, if it exists
   */
  GetAccount({accountName}) {
    return this.signers[accountName];
  }

  /**
   * Remove a previously saved account from this wallet
   *
   * @namedParams
   * @param {string} accountName - Name of the account to delete
   */
  RemoveAccount({accountName}) {
    delete this.signers[accountName];
  }
}

module.exports = ElvWallet;
