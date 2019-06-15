const bs58 = require("bs58");
const Stream = require("stream");

let ElvCrypto;
if(typeof window === "undefined") {
  // Running in node
  ElvCrypto = require("@eluvio/crypto/dist/elv-crypto.bundle.node").default;
} else {
  // Running in browser
  ElvCrypto = require("@eluvio/crypto/dist/elv-crypto.bundle.js").default;
}

// Node doesn't implement btoa
const B64 = (str) => {
  if(typeof btoa !== "undefined") {
    return btoa(str);
  }

  return Buffer.from(str).toString("base64");
};

/**
 * @namespace
 * @description This namespace contains cryptographic helper methods to encrypt and decrypt
 * data with automatic handling of keys
 */
const Crypto = {
  ElvCrypto: async () => {
    if(!Crypto.elvCrypto) {
      Crypto.elvCrypto = await new ElvCrypto().init();
    }

    return Crypto.elvCrypto;
  },

  async EncryptCap(cap, publicKey) {
    const elvCrypto = await Crypto.ElvCrypto();
    publicKey = new Uint8Array(Buffer.from(publicKey.replace("0x", ""), "hex"));
    cap = new Uint8Array(Buffer.from(JSON.stringify(cap)));

    const {data, ephemeralKey, tag} = await elvCrypto.encryptECIES(cap, publicKey);

    const encryptedCap = Buffer.concat([ephemeralKey, tag, data]);

    return B64(encryptedCap);
  },

  async DecryptCap(encryptedCap, privateKey) {
    const elvCrypto = await Crypto.ElvCrypto();

    privateKey = new Uint8Array(Buffer.from(privateKey.replace("0x", ""), "hex"));

    encryptedCap = Buffer.from(encryptedCap, "base64");
    const ephemeralKey = encryptedCap.slice(0, 65);
    const tag = encryptedCap.slice(65, 81);
    const data = encryptedCap.slice(81);

    const cap = elvCrypto.decryptECIES(
      new Uint8Array(data),
      privateKey,
      new Uint8Array(ephemeralKey),
      new Uint8Array(tag)
    );

    return JSON.parse(Buffer.from(cap).toString());
  },

  async GeneratePrimaryCap(blockSize=1000000) {
    const elvCrypto = await Crypto.ElvCrypto();

    const {secretKey, publicKey} = elvCrypto.generatePrimaryKeys();
    const symmetricKey = (elvCrypto.generateSymmetricKey()).key;

    return {
      symm_key: `kpsy${bs58.encode(Buffer.from(symmetricKey))}`,
      secret_key: `kpsk${bs58.encode(Buffer.from(secretKey))}`,
      public_key: `kppk${bs58.encode(Buffer.from(publicKey))}`,
      block_size: blockSize
    };
  },

  CapToKeys(cap) {
    const keyToBytes = (key) => new Uint8Array(bs58.decode(key.slice(4)));

    return {
      symmetricKey: keyToBytes(cap.symm_key),
      secretKey: keyToBytes(cap.secret_key),
      publicKey: keyToBytes(cap.public_key),
      blockSize: cap.block_size
    };
  },

  /**
   * Encrypt data with headers
   *
   * @namedParams
   * @param {ArrayBuffer | Buffer} data - Data to encrypt
   * @param {Object} cap - Encryption "capsule" containing keys
   *
   * @returns {Promise<Buffer>} - Encrypted data
   */
  Encrypt: async (cap, data) => {
    const elvCrypto = await Crypto.ElvCrypto();

    const {symmetricKey, secretKey, publicKey} = Crypto.CapToKeys(cap);
    const context = elvCrypto.newPrimaryContext(
      publicKey,
      secretKey,
      symmetricKey
    );

    const dataArray = new Uint8Array(data);
    const encryptedData = elvCrypto.encryptPrimaryH(context, dataArray);
    const encryptedDataBuffer = Buffer.from(encryptedData);

    context.free();

    return encryptedDataBuffer;
  },

  /**
   * Decrypt data with headers
   *
   * @namedParams
   * @param {ArrayBuffer | Buffer} encryptedData - Data to encrypt
   * @param {Object} cap - Encryption "capsule" containing keys
   *
   * @returns {Promise<Buffer>} - Decrypted data
   */
  PrimaryDecrypt: async (cap, encryptedData) => {
    const elvCrypto = await Crypto.ElvCrypto();

    const {symmetricKey, secretKey, publicKey} = Crypto.CapToKeys(cap);
    const context = elvCrypto.newPrimaryContext(
      publicKey,
      secretKey,
      symmetricKey
    );

    const input = new Stream.PassThrough();
    const decipher = elvCrypto.createDecipher(elvCrypto.CRYPTO_TYPE_PRIMARY, context);
    input.end(new Uint8Array(encryptedData));

    let decryptedChunks = [];
    await new Promise((resolve, reject) => {
      input
        .pipe(decipher)
        .on("data", chunk => {
          decryptedChunks.push(chunk);
        })
        .on("finish", () => {
          context.free();
          resolve();
        })
        .on("error", (e) => {
          reject(e);
        });
    });

    return Buffer.concat(decryptedChunks);
  },
};

module.exports = Crypto;
