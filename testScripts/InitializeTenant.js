/* eslint-disable no-console */
const { ElvClient } = require("../src/ElvClient");

const yargs = require("yargs");
const argv = yargs
  .option("configUrl", {
    description: "Fabric configuration URL (e.g. https://main.net955210.contentfabric.io/config)"
  })
  .option("kmsId", {
    description: "KMS ID to set for the tenant libraries"
  })
  .option("tenantName", {
    description: "Name of the tenant - Libraries and types will be create as `[tenantName] - Properties`, etc."
  })
  .demandOption(
    ["configUrl", "kmsId", "tenantName"],
    "\nUsage: PRIVATE_KEY=<private-key> node InitializeTenant --configUrl <config-url> --kmsId <ikms...> ---tenantName <tenant-name>\n"
  )
  .argv;

const AddLibraryToGroup = async (client, libraryId, groupAddress) => {
  await client.AddContentLibraryGroup({
    libraryId,
    groupAddress,
    permission: "accessor"
  });

  await client.AddContentLibraryGroup({
    libraryId,
    groupAddress,
    permission: "contributor"
  });
};

const InitializeTenant = async ({configUrl, kmsId, tenantName}) => {
  if(!process.env.PRIVATE_KEY) {
    console.log("ERROR: 'PRIVATE_KEY' environment variable must be set");
  }

  const client = await ElvClient.FromConfigurationUrl({configUrl});
  const wallet = client.GenerateWallet();
  const fundedSigner = wallet.AddAccount({privateKey: process.env.PRIVATE_KEY});

  const mnemonic = wallet.GenerateMnemonic();
  const tenantAdminSigner = wallet.AddAccountFromMnemonic({mnemonic});

  // Transfer funds to new account
  client.SetSigner({signer: fundedSigner});
  await client.SendFunds({recipient: tenantAdminSigner.address, ether: 10});

  // Switch to new tenant admin account
  client.SetSigner({signer: tenantAdminSigner});

  const tenantSlug = tenantName.toLowerCase().replace(/ /g, "-");
  await client.userProfileClient.MergeUserMetadata({
    metadata: {
      public: {
        name: `${tenantSlug}-elv-admin`
      }
    }
  });

  console.log("\nAdmin account:\n");
  console.log(`\t${tenantSlug}-elv-admin`);
  console.log(`\t${tenantAdminSigner.address}`);
  console.log(`\t${tenantAdminSigner.signingKey.privateKey}`);
  console.log(`\t${mnemonic}`);

  // Initialize admin group
  const adminGroupAddress = await client.CreateAccessGroup({
    name: `${tenantName} Content Admins`
  });

  await client.AddAccessGroupManager({
    contractAddress: adminGroupAddress,
    memberAddress: tenantAdminSigner.address
  });

  console.log("\nContent Admins Group:\n");
  console.log(`\t${adminGroupAddress}`);

  /* Content Types - Create Title, Title Collection and Production Master and add each to the group */

  const typeMetadata = {
    bitcode_flags: "abrmaster",
    bitcode_format: "builtin",
    public: {
      "eluv.displayApp": "default",
      "eluv.manageApp": "default",
    }
  };

  const titleTypeId = await client.CreateContentType({
    name: `${tenantName} - Title`,
    metadata: { ...typeMetadata }
  });

  await client.AddContentObjectGroupPermission({
    objectId: titleTypeId,
    groupAddress: adminGroupAddress,
    permission: "manage"
  });

  const titleCollectionTypeId = await client.CreateContentType({
    name: `${tenantName} - Title Collection`,
    metadata: { ...typeMetadata }
  });

  await client.AddContentObjectGroupPermission({
    objectId: titleCollectionTypeId,
    groupAddress: adminGroupAddress,
    permission: "manage"
  });

  typeMetadata.bitcode_flags = "production_master";
  const masterTypeId = await client.CreateContentType({
    name: `${tenantName} - Title Master`,
    metadata: { ...typeMetadata }
  });

  await client.AddContentObjectGroupPermission({
    objectId: masterTypeId,
    groupAddress: adminGroupAddress,
    permission: "manage"
  });

  console.log("\nTenant Types:\n");
  console.log(`\t${tenantName} - Title: ${titleTypeId}`);
  console.log(`\t${tenantName} - Title Collection: ${titleCollectionTypeId}`);
  console.log(`\t${tenantName} - Title Master: ${masterTypeId}`);

  /* Create libraries - Properties, Title Masters, Title Mezzanines and add each to the group */

  const propertiesLibraryId = await client.CreateContentLibrary({
    name: `${tenantName} - Properties`,
    kmsId
  });

  await AddLibraryToGroup(client, propertiesLibraryId, adminGroupAddress);

  const mastersLibraryId = await client.CreateContentLibrary({
    name: `${tenantName} - Title Masters`,
    kmsId
  });

  await AddLibraryToGroup(client, mastersLibraryId, adminGroupAddress);

  const mezzanineLibraryId = await client.CreateContentLibrary({
    name: `${tenantName} - Title Mezzanines`,
    kmsId
  });

  await AddLibraryToGroup(client, mezzanineLibraryId, adminGroupAddress);

  console.log("\nTenant Libraries:\n");
  console.log(`\t${tenantName} - Properties: ${propertiesLibraryId}`);
  console.log(`\t${tenantName} - Title Masters: ${mastersLibraryId}`);
  console.log(`\t${tenantName} - Title Mezzanines: ${mezzanineLibraryId}`);

  /* Create a site object */
  const { id, write_token } = await client.CreateContentObject({
    libraryId: propertiesLibraryId,
    options: { type: titleCollectionTypeId }
  });

  await client.ReplaceMetadata({
    libraryId: propertiesLibraryId,
    objectId: id,
    writeToken: write_token,
    metadataSubtree: "public",
    metadata: {
      name: `Site - ${tenantName}`,
      asset_metadata: {
        title: `Site - ${tenantName}`,
        display_title: `Site - ${tenantName}`,
        slug: `site-${tenantSlug}`,
        title_type: "site",
        asset_type: "primary"
      }
    }
  });

  await client.FinalizeContentObject({
    libraryId: propertiesLibraryId,
    objectId: id,
    writeToken: write_token
  });

  await client.AddContentObjectGroupPermission({
    objectId: id,
    groupAddress: adminGroupAddress,
    permission: "manage"
  });

  console.log("\nSite Object: \n");
  console.log(`\tSite - ${tenantName}: ${id}\n\n`);
};

InitializeTenant(argv);
