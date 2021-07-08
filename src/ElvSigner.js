const Ethers = require("ethers");
const Utils = require("./Utils");

const networkObject = {
  "Ethereum Mainnet": "https://mainnet.infura.io/v3/029ae68725a144d6800e1f041b5f056c",
  "Rinkeby Test Network": "https://rinkeby.infura.io/v3/029ae68725a144d6800e1f041b5f056c",
  "Ropsten Test Network": "https://ropsten.infura.io/v3/029ae68725a144d6800e1f041b5f056c",
  "Kovan Test Network": "https://kovan.infura.io/v3/029ae68725a144d6800e1f041b5f056c",
  "Goerli Test Network": "https://goerli.infura.io/v3/029ae68725a144d6800e1f041b5f056c",
  "Eluvio Testnet": "https://host-34-105-49-255.testv2.contentfabric.io/eth/"
};

const BASE_URL = "https://host-34-105-49-255.testv2.contentfabric.io/as/";

const _constructorGuard = {};

class ElvSigner extends Ethers.Signer {
  constructor({ OAuthID, RPCUrl, network, address, constructorGuard }) {
    super();
    if(constructorGuard !== _constructorGuard) {
      throw Error("Use the method ElvSigner.ElvSigner instead of the contructor");
    }
    this.provider = new Ethers.providers.JsonRpcProvider(RPCUrl || networkObject["Eluvio Testnet"]);
    // this.OAuthObject = OAuthObject;
    this.id_token = OAuthID;
    this.network = network;
    this.address = address;
  }

  /**
   * Async constructor that sets network and address. 
   */
  static async ElvSigner({ OAuthID, RPCUrl, network, addressOrIndex, createNew }) {
    if(network !== "eth") {throw Error("Unsupported Network: " + this.network);}
    let signer = new ElvSigner({ OAuthID, RPCUrl, constructorGuard: _constructorGuard });
    if(createNew) {
      await signer.createAccount({ network });
      addressOrIndex = -1;
    }
    let accounts = await signer.getAccounts();

    let address;
    if(typeof addressOrIndex === "number") {
      address = accounts[network][addressOrIndex === -1 ? accounts[network].length - 1 : addressOrIndex];
    } else {
      address = addressOrIndex;
    }

    signer.setAccount({
      address,
      network,
    });
    return signer;
  }

  /**
   * Get fabric IDs sorted by network. 
   * @returns {object} - returns object of networks with the ikms (fabric) IDs associated with the oauth key
   */
  async getAccounts() {
    let response = await fetch(BASE_URL + "jwt/keys", {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: "http://localhost:8082/",
        Origin: "http://localhost:8082/",
        Authorization: "Bearer " + this.id_token,
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0",
      },
    });
    let accountsJson = await response.json();
    return accountsJson;
  }

  /**
   * Just for compatibility, does not do anything. 
   */
  connect(provider) {
    provider;
    // this.provider = provider;
  }

  /**
   * @todo enforce network selection w/ provider
   */
  async setAccount({ network, address }) {
    address = "ikms7mdLhRaXRikpurkv64t8cDbVDuT";
    this.provider = new Ethers.providers.JsonRpcProvider(networkObject["Eluvio Testnet"]);
    this.rpcSigner = this.provider.getSigner(Utils.HashToAddress(address));
    this.network = network;
    this.address = address;
  }

  /**
   * Checks that an address has been set and then returns the Fabric ID formatted as 
   * an ETH address. 
   * @returns hex string of address
   */
  async getAddress() {
    if(this.address) { return Utils.HashToAddress(this.address); }
    let accounts = await this.getAccounts();
    if(accounts.length === 0) { throw Error("You need to create an account"); }
    throw Error("No Account set");
  }

  /**
   * Sign a hashed piece of data
   * @param {String} digest - Hex string of hashed data
   * @returns - the signed message as a hex string
   */
  async signDigest(digest) {
    // Format the digest into proper hex string format
    let hash = digest.slice(0, 2) === "0x" ? digest : "0x" + digest;
    let hashRe = /[0-9a-fA-F]/;
    if(!hashRe.test(hash)) {
      throw Error("Malformed digest: " + hash + ". Digest must be a hex string.");
    }

    // Remove prefix 
    hash = Ethers.utils.keccak256(hash).slice(2);
    if(this.network !== "eth") { throw Error("Unsupported Network: " + this.network); }
    // Send sign request to backend
    let response = await fetch(BASE_URL + "jwt/sign/" + this.network + "/" + this.address, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        Authorization: "Bearer " + this.id_token,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0"
      },
      body: JSON.stringify({ "hash": hash, })
    });
    // Parses response. Need to use .text() because .json() throws unexpected character error. 
    let responseText = await response.text();
    let signedMessage = responseText.slice(responseText.search(":") + 1, responseText.search("}"));

    return signedMessage;
  }

  /**
   * @todo UNTESTED
   * @param {String} message - message to be signed
   * @returns Signed message
   */
  async signMessage(message) {
    const msg = Buffer.from(message);
    const formatMessage = (message) => {

      let hashRe = /[0-9a-fA-F]{64}/;
      let messageHash;
      if(hashRe.test(message)) { // Digest
        // eslint-disable-next-line no-console
        console.warn("Are you sure you wanted to signed this hex string? Maybe you wanted to use signDigest.");
      }
      if(typeof message === "string") { // string
        messageHash = Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(message));
      } else { // Byte array
        messageHash = Ethers.utils.keccak256(message);
      }
      return messageHash.slice(2);
    };

    let hash = formatMessage(message);
    let signed = await this.signDigest("0x" + msg.toString("hex"));

    // This is how you verify that the message was correctly signed. 
    const address = Ethers.utils.recoverAddress("0x" + hash, "0x" + signed);

    if((await this.getAddress()) === address) {
      throw Error("Something went wrong in the signature process. Recovered key: " + await this.getAddress() + " Actual key: " + address);
    }

    return signed;
  }


  async sendTransaction(transaction) {
    // Hard coded params
    transaction["gasLimit"] = transaction["gasLimit"] || 8000000;
    transaction["gasPrice"] = transaction["gasPrice"] || Ethers.utils.parseUnits("90", "gwei");
    transaction["nonce"] = this.provider.getTransactionCount(await this.getAddress());
    // Breaks in etherjs 4.0, but isn't necessary because from is computed from signature. 
    // transaction["from"] = Utils.HashToAddress(this.address);
    // Signs txn
    const blockNumber = await this.provider.getBlockNumber();
    let tx = await this.signTransaction(transaction);
    // Verify txn in console
    // let txObj = Ethers.utils.parseTransaction(tx);
    // console.log(txObj);
    // Testing presigned example txn
    // console.log(Ethers.utils.parseTransaction("0xf865808080948ba1f109551bd432803012645ac136ddd64dba72880de0b6b3a7640000801ca0918e294306d177ab7bd664f5e141436563854ebe0a3e523b9690b4922bbb52b8a01181612cec9c431c4257a79b8c9f0c980a2c49bb5a0e6ac52949163eeb565dfc"));
    // Send the transaction using the provider
    let txHash = await this.provider.send("eth_sendRawTransaction", [tx]);
    try {
      // Unfortunately, JSON-RPC only provides and opaque transaction hash
      // for a response, and we need the actual transaction, so we poll
      // for it; it should show up very quickly
      return await Ethers.utils.poll(async () => {
        const tx = await this.provider.getTransaction(txHash);
        if(tx === null) { return undefined; }
        return this.provider._wrapTransaction(tx, txHash, blockNumber);
      }, { oncePoll: this.provider });
    } catch(error) {
      error.transactionHash = txHash;
      throw error;
    }
  }

  async signTransaction(transaction) {
    const tx = await Ethers.utils.resolveProperties(transaction);
    const baseTx = {
      chainId: (tx.chainId || undefined),
      data: (tx.data || undefined),
      gasLimit: (tx.gasLimit || undefined),
      gasPrice: (tx.gasPrice || undefined),
      nonce: (tx.nonce ? Ethers.utils.bigNumberify(tx.nonce).toNumber() : undefined),
      to: (tx.to || undefined),
      value: (tx.value || undefined),
    };
    // Serialize txn
    const unsignedTx = Ethers.utils.serializeTransaction(baseTx);
    // Sign txn
    let signedTx = await this.signDigest(unsignedTx);
    //  Put it into etherjs understandable form, and return it. 
    let finalTx = Ethers.utils.serializeTransaction(tx, "0x" + signedTx.toLowerCase());
    return finalTx;
  }

  async createAccount({ network }) {
    // REMOVE THIS ONCES MORE NETWORKS ARE ADDED
    if(this.network !== "eth") { throw Error("Unsupported Network: " + this.network); }
    let response = await fetch(BASE_URL + "jwt/generate/" + network, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        Authorization: "Bearer " + this.id_token,
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0"
      }
    });

    return response.status == 200;
  }
}

exports.ElvSigner = ElvSigner;