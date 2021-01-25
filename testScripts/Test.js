/* eslint-disable no-console */
const moment = require("moment");

console.log(`${moment().format()} require ElvClient`);
const { ElvClient } = require("../src/ElvClient");

console.log(`${moment().format()} require TestConfiguration.json`);
const ClientConfiguration = require("../TestConfiguration.json");

const Test = async () => {
  try {
    console.log(`${moment().format()} await ElvClient.FromConfigurationUrl`);
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    console.log(`${moment().format()} client.GenerateWallet`);
    let wallet = client.GenerateWallet();
    console.log(`${moment().format()} wallet.AddAccount`);
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    console.log(`${moment().format()} client.SetSigner`);
    client.SetSigner({signer});
  } catch(error) {
    console.error(moment().format(), error);
    console.error(JSON.stringify(error, null, 2));
  }
};

console.log(`${moment().format()} Test()`);
Test().then(r => {
  console.log(`${moment().format()} Test().then(), r==${r}`);
});
console.log(`${moment().format()} after Test()`);

