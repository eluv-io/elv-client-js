/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");

const yargs = require("yargs");
const argv = yargs
  .option("site-selector-id", {
    description: "Object ID of the site selector"
  })
  .option("site-key", {
    description: "Metadata key of the site for which to generate the account, e.g. 'for-your-consideration'"
  })
  .option("site-id", {
    description: "Object ID of the site"
  })
  .option("site-group-address", {
    description: "Address of the site group to add the user to"
  })
  .option("user-name", {
    description: "Name for the new user"
  })
  .option("user-group-name", {
    description: "Name of the group to create for the user"
  })
  .option("code", {
    description: "Code with which to encrypt the key"
  })
  .demandOption(
    ["site-selector-id", "site-key", "site-id", "code", "user-name"],
    "\nUsage: PRIVATE_KEY=<private-key> node CreateSiteAccount.js --siteSelectorId <site-id> --siteKey <site-key> --code <code> --siteGroupAddress <address> --userName <user-name> --userGroupName <user-group-name>"
  )
  .argv;

const Hash = (code) => {
  const chars = code.split("").map(code => code.charCodeAt(0));
  return chars.reduce((sum, char, i) => (chars[i + 1] ? (sum * 2) + char * chars[i+1] * (i + 1) : sum + char), 0).toString();
};

const Create = async ({
  siteSelectorId,
  siteKey,
  siteId,
  userName,
  siteGroupAddress,
  userGroupName,
  code
}) => {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey) {
      console.error("PRIVATE_KEY environment variable must be specified");
      return;
    }

    const configUrl = process.env.CONFIG_URL || "https://main.net955305.contentfabric.io/config";

    const client = await ElvClient.FromConfigurationUrl({configUrl});
    const newClient = await ElvClient.FromConfigurationUrl({configUrl});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});

    const siteLibraryId = await client.ContentObjectLibraryId({objectId: siteSelectorId});

    // Create new account
    const newSigner = wallet.AddAccountFromMnemonic({
      mnemonic: await wallet.GenerateMnemonic()
    });

    // Send funds to new account
    await client.SendFunds({
      recipient: newSigner.address,
      ether: 10
    });

    // Create the user wallet for the new account
    await newClient.SetSigner({signer: newSigner});
    await newClient.userProfileClient.ReplaceUserMetadata({metadataSubtree: "public/name", metadata: userName || userGroupName || "user"});

    // Generate encrypted private key with code
    const encryptedPrivateKey = await wallet.GenerateEncryptedPrivateKey({
      signer: newSigner,
      password: code,
      options: {scrypt: {N: 16384}}
    });

    // Generate key hash for quick lookup
    const codeHash = Hash(code);

    let existingCodeInfo = await client.ContentObjectMetadata({
      libraryId: siteLibraryId,
      objectId: siteSelectorId,
      metadataSubtree: `public/codes/${codeHash}`
    });

    if(existingCodeInfo) {
      console.error("Code already exists:");
      console.error(existingCodeInfo);
      return;
    }

    // Update site selector
    const { write_token } = await client.EditContentObject({libraryId: siteLibraryId, objectId: siteSelectorId});

    await client.ReplaceMetadata({
      libraryId: siteLibraryId,
      objectId: siteSelectorId,
      writeToken: write_token,
      metadataSubtree: `public/codes/${codeHash}`,
      metadata: {
        ak: client.utils.B64(encryptedPrivateKey),
        sites: [{
          siteId,
          siteKey
        }]
      }
    });

    await client.FinalizeContentObject({libraryId: siteLibraryId, objectId: siteSelectorId, writeToken: write_token});

    // Add user to site group
    if(siteGroupAddress) {
      await client.AddAccessGroupMember({contractAddress: siteGroupAddress, memberAddress: newSigner.address});
    }

    // Create new group for user
    let newGroupAddress;
    if(userGroupName) {
      newGroupAddress = await client.CreateAccessGroup({name: userGroupName});
      await client.AddAccessGroupMember({contractAddress: newGroupAddress, memberAddress: newSigner.address});
    }

    console.log();
    console.log("Created account:");
    console.log(newSigner.address);
    console.log(newSigner.privateKey, "\n");
    console.log(encryptedPrivateKey);
    console.log("\nCode:", code);
    console.log("Code Hash:", codeHash, "\n");

    if(newGroupAddress) {
      console.log(`\nUser Group '${userGroupName}': ${newGroupAddress}\n`);
    }
  } catch(error) {
    console.error("Error:");
    console.error(error.body ? JSON.stringify(error, null, 2) : error);
  }
};

Create(argv);
