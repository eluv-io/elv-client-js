let ElvCrypto;
if(typeof window === "undefined") {
  // Running in node
  ElvCrypto = require("@eluvio/crypto/dist/elv-crypto.bundle.node").default;
} else {
  // Running in browser
  ElvCrypto = require("@eluvio/crypto/dist/elv-crypto.bundle.js").default;
}

const HexToUInt8Array = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const UInt8ArrayToHex = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"),"");

const keys = {
  target: {
    privateKey: HexToUInt8Array("0000000000000000000000000000000018d1a9fb51d47e6e73e9cba3f4156132f3c8e9f7bf291ae3e1d294fe0af05655"),
    publicKey: HexToUInt8Array("0409bb41a10fe8d8a639cb95b423077fa84f41cefa94f2bbc1503b0c28ee6d9e2c9ca33ded0a99ffce1fe8e1bb6705ec720b98122a203746187b6701f2302ce343a2674381c1ade579e0b37b53a6bf725e47687e5809596f0b5a16a39b07a1ca5d173ccc3b6d432d620d3452644703a758fb5f44a35b3aee4966bae345a7e88cc03ede169922d3150ea8f3ed91fadbacff182ccf4bf487a7bc24fd37f2997c17b27fcd45cb9e2629a103db2bcd4374b7e17db0f58e9a5541110f229d814682d5f7")
  },
  primary: {
    privateKey: HexToUInt8Array("000000000000000000000000000000000b9a85e10e7b6f7ba0995c082d3bb8cf962ad5d3eb44ffc7ef037798325c0e7b"),
    publicKey: HexToUInt8Array("04168f6e4e3369a9ff68226990c8e08f8af3c2fd2c325ae1f002456864b394d89b541fea9f8d773ea454f8e72653447c86163256e3928acdc579b85d6195df2e7b23097bb28b8069a652f4390cb0bda74a0aa7d057a05d8abb524ade09a8db83f7")
  },
  symmetric: {
    iv: HexToUInt8Array("4af2743bb2d81403fc8c42f4"),
    key: HexToUInt8Array("37d79b30b2a8e801864b023e330c4b02")
  },
  reEnc: HexToUInt8Array("04103e15d19c5280b783afd21b3668cfe0e7e587a8710b4deaa337f258d970f05ecbc5dd562f106f8a6bb1a475de2f16a41884d3b69900829e7eb0c7487e8b0865d26ed55028c54a1086019a2636ffed2c958fe2b418264bac438c191611a5bfa208020d0c6dab7abb823c8a1f0e1d0523e97ba9b7f8adaa1f0b7591f05300f0028d533900ebf244e72f8a41ad45dd636207b89663afd240ad7330e3e00ce02719aa2bff5c31d31bab77d89317a217e567723c92c370808bda6a9889e8cb0ec2bc")
};


/**
 * @namespace
 * @description This namespace contains cryptographic helper methods to encrypt and decrypt
 * data with automatic handling of keys
 */
const Crypto = {
  /**
   * Encrypt data with headers
   *
   * @namedParams
   * @param {ArrayBuffer} data - Data to encrypt
   *
   * @returns {Promise<Buffer>} - Encrypted data
   */
  Encrypt: async ({data}) => {
    const crypto = await new ElvCrypto().init();

    const context = crypto.newPrimaryContext(
      keys.primary.publicKey,
      keys.primary.privateKey,
      keys.symmetric.key
    );

    const dataArray = new Uint8Array(data);

    const encryptedData = crypto.encryptPrimaryH(context, dataArray);
    const encryptedDataBuffer = Buffer.from(encryptedData);

    context.free();

    return encryptedDataBuffer;
  },

  /**
   * Decrypt data with headers
   *
   * @namedParams
   * @param {ArrayBuffer} encryptedData - Data to decrypt
   *
   * @returns {Promise<Buffer>} - Decrypted data
   */
  Decrypt: async ({encryptedData}) => {
    const crypto = await new ElvCrypto().init();

    const context = crypto.newPrimaryContext(
      keys.primary.publicKey,
      keys.primary.privateKey,
      keys.symmetric.key
    );

    const encryptedDataArray = new Uint8Array(encryptedData);
    const decryptedData = crypto.decryptH(
      crypto.CRYPTO_TYPE_PRIMARY,
      context,
      encryptedDataArray
    );

    const dataBuffer = Buffer.from(decryptedData);

    context.free();

    return dataBuffer;
  }
};

module.exports = Crypto;
