const { ElvClient } = require("../src/ElvClient");
const ClientConfiguration = require("../TestConfiguration.json");

Hash = (code) => {
  const chars = code.split("").map(code => code.charCodeAt(0));
  return chars.reduce((sum, char, i) => (chars[i + 1] ? (sum * 2) + char * chars[i+1] * (i + 1) : sum + char), 0).toString();
};

const siteSelectorVersionHash = "";

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    const codes = await client.ContentObjectMetadata({
      versionHash: siteSelectorVersionHash,
      metadataSubtree: "public/codes"
    });

    const addresses = {};

    Object.values(codes).forEach(code => {
      const key = JSON.parse(client.utils.FromB64(code.ak));
      const site = code.sites[0];

      const hash = `${site.siteKey} (${site.siteId})`;

      addresses[hash] = addresses[hash] || [];
      addresses[hash].push(client.utils.FormatAddress(key.address));
    });

    console.log(JSON.stringify(addresses, null, 2));
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
