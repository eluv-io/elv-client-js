const {CreateClient, OutputLogger} = require("./utils/Utils");

const ElvWallet = require("../src/ElvWallet");

let client, wallet;

// Describe blocks and tests within them are run in order
describe("Test ElvWallet", () => {
  beforeAll(async () => {
    jest.setTimeout(30000);

    client = await CreateClient();
    wallet = OutputLogger(ElvWallet, client.GenerateWallet());
  });

  test("Generate Wallet", () => {
    expect(wallet).toBeDefined();
    expect(wallet.provider).toBeDefined();
  });

  test("Add/Remove Accounts", () => {
    const privateKey = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const accountName = "test";

    wallet.AddAccount({accountName, privateKey});

    const signer = wallet.GetAccount({accountName});
    expect(signer).toBeDefined();
    expect(signer.privateKey).toEqual(privateKey);

    wallet.RemoveAccount({accountName});

    const removedSigner = wallet.GetAccount({accountName});
    expect(removedSigner).not.toBeDefined();
  });

  test("Mnemonic", async () => {
    const mnemonic = wallet.GenerateMnemonic();
    const accountName = "mnemonic";

    expect(mnemonic).toBeDefined();

    const signer = wallet.AddAccountFromMnemonic({accountName, mnemonic});
    expect(signer).toBeDefined();
    expect(signer.address).toBeDefined();
    expect(signer.privateKey).toBeDefined();

    const balance = await wallet.GetAccountBalance({accountName});
    expect(balance).toEqual("0.0");
  });

  test("Private Key", async () => {
    const privateKey = "0x0000000000000000000000000000000000000000000000000000000000000000";

    const signer = wallet.AddAccount({accountName: "private key", privateKey});
    expect(signer).toBeDefined();
    expect(signer.address).toBeDefined();
    expect(signer.privateKey).toBeDefined();
    expect(signer.privateKey).toEqual(privateKey);

    const balance = await wallet.GetAccountBalance({signer});
    expect(balance).toEqual("0.0");
  });

  test("Encrypted Private Key As String", async () => {
    const encryptedPrivateKey = "{\"address\":\"ef55143b962328914c35c16e225b8aa768434abf\",\"crypto\":{\"cipher\":\"aes-128-ctr\",\"ciphertext\":\"4314d3d5b80ac0c87add387cb3fdf940a4d6d9d999501aa18b5b224f4be70a74\",\"cipherparams\":{\"iv\":\"41cb3d70282553819d836f51540dcca3\"},\"kdf\":\"scrypt\",\"kdfparams\":{\"dklen\":32,\"n\":262144,\"p\":1,\"r\":8,\"salt\":\"03003c0e1f63de7890226b63bf0768fc4faa98eb6c7c1767a72a0cf34c791ac1\"},\"mac\":\"5afd202da30fdadb880dec99a2e8ff4a209fb7aa38c2dd662cc4a375667ce582\"},\"id\":\"05f541df-9dd5-4485-8704-71998d90e6cc\",\"version\":3}";

    const signer = await wallet.AddAccountFromEncryptedPK({accountName: "private key", encryptedPrivateKey, password: "test"});
    expect(signer).toBeDefined();
    expect(signer.address).toBeDefined();
    expect(signer.privateKey).toBeDefined();

    client.SetSigner({signer});
    const balance = await client.GetBalance({address: signer.address});
    expect(balance).toEqual("0.0");
  });

  test("Encrypted Private Key Object", async () => {
    const encryptedPrivateKey = {
      "address": "ef55143b962328914c35c16e225b8aa768434abf",
      "crypto": {
        "cipher": "aes-128-ctr",
        "ciphertext": "4314d3d5b80ac0c87add387cb3fdf940a4d6d9d999501aa18b5b224f4be70a74",
        "cipherparams": {
          "iv": "41cb3d70282553819d836f51540dcca3"
        },
        "kdf": "scrypt",
        "kdfparams": {
          "dklen": 32,
          "n": 262144,
          "p": 1,
          "r": 8,
          "salt": "03003c0e1f63de7890226b63bf0768fc4faa98eb6c7c1767a72a0cf34c791ac1"
        },
        "mac": "5afd202da30fdadb880dec99a2e8ff4a209fb7aa38c2dd662cc4a375667ce582"
      },
      "id": "05f541df-9dd5-4485-8704-71998d90e6cc",
      "version": 3
    };

    const signer = await wallet.AddAccountFromEncryptedPK({accountName: "private key", encryptedPrivateKey, password: "test"});
    expect(signer).toBeDefined();
    expect(signer.address).toBeDefined();
    expect(signer.privateKey).toBeDefined();

    client.SetSigner({signer});
    const balance = await client.GetBalance({address: signer.address});
    expect(balance).toEqual("0.0");
  });

  test("Encrypt/Decrypt Private Key", async () => {
    const privateKey = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const options = {
      scrypt: {N: 16384}
    };

    const signer = wallet.AddAccount({privateKey});
    const encryptedPrivateKey = await wallet.GenerateEncryptedPrivateKey({signer, password: "test", options});

    expect(encryptedPrivateKey).toBeDefined();

    const signerFromEncrypted = await wallet.AddAccountFromEncryptedPK({encryptedPrivateKey, password: "test"});

    expect(signerFromEncrypted).toBeDefined();
    expect(signer.privateKey).toEqual(privateKey);
  });
});
