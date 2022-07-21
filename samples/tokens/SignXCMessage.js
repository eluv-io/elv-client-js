
const Ethers = require("ethers");
const {resolve}=require("path");
const { ElvClient } = require("../../src/ElvClient");

const configUrl = "https://main.net955305.contentfabric.io/config"
//const configUrl = "https://main.net955210.contentfabric.io/config"

const Setup = async () => {

  client = await ElvClient.FromConfigurationUrl({configUrl: configUrl});
  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });
  client.SetSigner({signer});
  client.ToggleLogging(false);

  return client;
}

// SingXCMessageABIPack
const DoWork = async () => {

  client = await Setup();

  // Example cross-chain message request
  const req = {
    chain: "eip155:955305",
    method: "balanceOf",
    contract: "0xd4c8153372b0292b364dac40d0ade37da4c4869a",
    owner: "0xcd8323da264e9c599af47a0d559dcdcb335d44ab",
  };

  // Example cross-chain message response
  const resp = {
    chain: "eip155:955305",
    method: "balanceOf",
    contract: "0xd4c8153372b0292b364dac40d0ade37da4c4869a",
    owner: "0xcd8323da264e9c599af47a0d559dcdcb335d44ab",
    block: 1000000,
    balance: 300,
  };

  // Pack
  const chainHex = "0x" + Buffer.from(resp.chain).toString('hex');
  const methodHex = "0x" + Buffer.from(resp.method).toString('hex');

  const chainBytes = Ethers.utils.arrayify(chainHex);
  const methodBytes = Ethers.utils.arrayify(methodHex);
  const contractBytes = Ethers.utils.arrayify(resp.contract);
  const ownerBytes = Ethers.utils.arrayify(resp.owner);
  const balanceBigInt = Ethers.utils.bigNumberify(resp.balance).toHexString();

  let message = Ethers.utils.keccak256(
    Ethers.utils.solidityPack(
      ["bytes", "bytes", "bytes", "bytes", "uint256"],
      [chainBytes, methodBytes, contractBytes, ownerBytes, balanceBigInt]
    )
  );

  //  sig_hex = yield this.rootStore.cryptoStore.SignMetamask(hash, this.rootStore.CurrentAddress(), popup);

  message = Ethers.utils.keccak256(Buffer.from(`\x19Ethereum Signed Message:\n${message.length}${message}`, "utf-8"));

  const signature = await client.authClient.Sign(message);
    
  //console.log("SIGNATURE", signature);

  return {
    ...resp,
    sig_hex: signature
  }
}

if (!process.env.PRIVATE_KEY) {
  console.log("Must set environment variable PRIVATE_KEY");
  return;
}

const Run = async function() {
  let res = await DoWork();
  console.log(res)
};

Run();



