if(typeof globalThis.Buffer === "undefined") { globalThis.Buffer = require("buffer/").Buffer; }

const bs58 = require("bs58");
const Stream = require("readable-stream");
const Utils = require("./Utils");

if(!globalThis.process) {
  globalThis.process = require("process/browser");
}

if(typeof crypto === "undefined") {
  const crypto = require("crypto");
  crypto.getRandomValues = arr => crypto.randomBytes(arr.length);
  globalThis.crypto = crypto;
}

/**
 * @namespace
 * @description This namespace contains cryptographic helper methods to encrypt and decrypt
 * data with automatic handling of keys
 */
const Crypto = {
  ElvCrypto: async () => {
    try {
      if(!Crypto.elvCrypto) {
        const ElvCrypto = (await import("@eluvio/crypto")).default;
        Crypto.elvCrypto = await new ElvCrypto().init();
      }

      return Crypto.elvCrypto;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Error initializing ElvCrypto:");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  },

  EncryptedSize: (clearSize) => {
    const clearBlockSize = 1000000;

    const blocks = Math.floor(clearSize / clearBlockSize);

    let encryptedBlockSize = Crypto.EncryptedBlockSize(clearBlockSize);

    let encryptedFileSize = blocks * encryptedBlockSize;
    if(clearSize % clearBlockSize !== 0) {
      encryptedFileSize += Crypto.EncryptedBlockSize(clearSize % clearBlockSize);
    }

    return encryptedFileSize;
  },

  EncryptedBlockSize: (clearSize, reencrypt=false) => {
    const primaryEncBlockOverhead = 129;
    const targetEncBlockOverhead = 608;
    const MODBYTES_384_58 = 48;
    const clearElementByteSize = 12 * (MODBYTES_384_58 - 1);
    const encElementByteSize = 12 * MODBYTES_384_58;
    let encryptedBlockSize = Math.floor((clearSize / clearElementByteSize)) * encElementByteSize;

    if(clearSize % clearElementByteSize !== 0) {
      encryptedBlockSize += encElementByteSize;
    }

    return reencrypt ? encryptedBlockSize + targetEncBlockOverhead : encryptedBlockSize + primaryEncBlockOverhead;
  },

  async EncryptConk(conk, publicKey) {
    const elvCrypto = await Crypto.ElvCrypto();
    publicKey = new Uint8Array(Buffer.from(publicKey.replace("0x", ""), "hex"));
    conk = new Uint8Array(Buffer.from(JSON.stringify(conk)));

    const {data, ephemeralKey, tag} = await elvCrypto.encryptECIES(conk, publicKey);

    const cap = Buffer.concat([
      Buffer.from(ephemeralKey),
      Buffer.from(tag),
      Buffer.from(data)
    ]);

    return Utils.B64(cap);
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

  async GeneratePrimaryConk({spaceId, objectId}) {
    const elvCrypto = await Crypto.ElvCrypto();

    const {secretKey, publicKey} = elvCrypto.generatePrimaryKeys();
    const symmetricKey = (elvCrypto.generateSymmetricKey()).key;

    return {
      symm_key: `kpsy${bs58.encode(Buffer.from(symmetricKey))}`,
      secret_key: `kpsk${bs58.encode(Buffer.from(secretKey))}`,
      public_key: `kppk${bs58.encode(Buffer.from(publicKey))}`,
      sid: spaceId,
      qid: objectId
    };
  },

  async GenerateTargetConk() {
    const elvCrypto = await Crypto.ElvCrypto();

    const {secretKey, publicKey} = elvCrypto.generateTargetKeys();

    return {
      secret_key: `kpsk${bs58.encode(Buffer.from(secretKey))}`,
      public_key: `ktpk${bs58.encode(Buffer.from(publicKey))}`
    };
  },

  CapToConk(cap) {
    const keyToBytes = key => new Uint8Array(bs58.decode(key.slice(4)));

    return {
      symmetricKey: keyToBytes(cap.symm_key),
      secretKey: keyToBytes(cap.secret_key),
      publicKey: keyToBytes(cap.public_key)
    };
  },

  async EncryptionContext(cap) {
    const elvCrypto = await Crypto.ElvCrypto();

    const {symmetricKey, secretKey, publicKey} = Crypto.CapToConk(cap);

    let context, type;
    if(publicKey.length === elvCrypto.PRIMARY_PK_KEY_SIZE) {
      // Primary context
      type = elvCrypto.CRYPTO_TYPE_PRIMARY;
      context = elvCrypto.newPrimaryContext(
        publicKey,
        secretKey,
        symmetricKey
      );
    } else {
      // Target context
      type = elvCrypto.CRYPTO_TYPE_TARGET;
      context = elvCrypto.newTargetDecryptionContext(
        secretKey,
        symmetricKey
      );
    }

    return {context, type};
  },

  /**
   * Encrypt data with headers
   *
   * @namedParams
   * @param {Object} cap - Encryption "capsule" containing keys
   * @param {ArrayBuffer | Buffer} data - Data to encrypt
   *
   * @returns {Promise<Buffer>} - Decrypted data
   */
  Encrypt: async (cap, data) => {
    const stream = await Crypto.OpenEncryptionStream(cap);

    // Convert Blob to ArrayBuffer if necessary
    if(!Buffer.isBuffer(data) && !(data instanceof ArrayBuffer)) {
      data = Buffer.from(await new Response(data).arrayBuffer());
    }

    const dataArray = new Uint8Array(data);

    for(let i = 0; i < dataArray.length; i += 1000000) {
      const end = Math.min(dataArray.length, i + 1000000);
      stream.write(dataArray.slice(i, end));
    }

    stream.end();

    let encryptedChunks = [];
    await new Promise((resolve, reject) => {
      stream
        .on("data", chunk => {
          encryptedChunks.push(chunk);
        })
        .on("finish", () => {
          resolve();
        })
        .on("error", (e) => {
          reject(e);
        });
    });

    return Buffer.concat(encryptedChunks);
  },

  OpenEncryptionStream: async (cap) => {
    const elvCrypto = await Crypto.ElvCrypto();
    const {context} = await Crypto.EncryptionContext(cap);

    const stream = new Stream.PassThrough();
    const cipher = elvCrypto.createCipher(context);

    return stream
      .pipe(cipher)
      .on("finish", () => {
        context.free();
      })
      .on("error", (e) => {
        throw Error(e);
      });
  },

  /**
   * Decrypt data with headers
   *
   * @namedParams
   * @param {Object} cap - Encryption "capsule" containing keys
   * @param {ArrayBuffer | Buffer} encryptedData - Data to decrypt
   *
   * @returns {Promise<Buffer>} - Decrypted data
   */
  Decrypt: async (cap, encryptedData) => {
    const stream = await Crypto.OpenDecryptionStream(cap);

    const dataArray = new Uint8Array(encryptedData);
    for(let i = 0; i < dataArray.length; i += 1000000) {
      const end = Math.min(dataArray.length, i + 1000000);
      stream.write(dataArray.slice(i, end));
    }

    stream.end();

    let decryptedChunks = [];
    await new Promise((resolve, reject) => {
      stream
        .on("data", chunk => {
          decryptedChunks.push(chunk);
        })
        .on("finish", () => {
          resolve();
        })
        .on("error", (e) => {
          reject(e);
        });
    });

    return Buffer.concat(decryptedChunks);
  },

  OpenDecryptionStream: async (cap) => {
    const elvCrypto = await Crypto.ElvCrypto();
    const {context, type} = await Crypto.EncryptionContext(cap);

    const stream = new Stream.PassThrough();
    const decipher = elvCrypto.createDecipher(type, context);

    return stream
      .pipe(decipher)
      .on("finish", () => {
        context.free();
      })
      .on("error", (e) => {
        throw Error(e);
      });
  }
};

module.exports = Crypto;
