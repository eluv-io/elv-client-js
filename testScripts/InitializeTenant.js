/* eslint-disable no-console */
const {ElvClient} = require("../src/ElvClient");

const reportTypes = [
  "Platform Percentages",
  "Summary by Date",
  "Summary by Month",
  "Summary by Title",
  "Title Playout Session Details",
  "Title Playout Session Details by Auth Address",
  "Title Playout Starts Detail",
  "Title Playout Summary",
  "Total Video Seconds by Month",
  "Views Over Program Duration"
];

const liveTypes = [
  { name: "Eluvio LIVE Drop Event Site", spec: require("../typeSpecs/DropEventSite") },
  { name: "Eluvio LIVE Marketplace", spec: require("../typeSpecs/Marketplace") },
  { name: "Eluvio LIVE Tenant", spec: require("../typeSpecs/EventTenant") },
  { name: "NFT Collection", spec: require("../typeSpecs/NFTCollection") },
  { name: "NFT Template", spec: require("../typeSpecs/NFTTemplate") }
];

const STANDARD_DRM_CERT={
  elv: {
    media: {
      drm: {
        fps: {
          cert: "MIIExzCCA6+gAwIBAgIIHyfkXhxLHC4wDQYJKoZIhvcNAQEFBQAwfzELMAkGA1UEBhMCVVMxEzARBgNVBAoMCkFwcGxlIEluYy4xJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MTMwMQYDVQQDDCpBcHBsZSBLZXkgU2VydmljZXMgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwHhcNMjAwOTEyMDMzMjI0WhcNMjIwOTEzMDMzMjI0WjBgMQswCQYDVQQGEwJVUzETMBEGA1UECgwKRWx1dmlvIEluYzETMBEGA1UECwwKMktIOEtDM01NWDEnMCUGA1UEAwweRmFpclBsYXkgU3RyZWFtaW5nOiBFbHV2aW8gSW5jMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDslbBURB6gj07g7VrS7Ojixe7FNZOupomcZt+mtMvyavjg7X7/T4RccmKUQxOoMLKCJcQ6WrdHhIpN8+bciq7lr0mNzaN467zREiUNYOpkVPi13sJLieY2m2MEPOQTbIl52Cu1YyH+4/g1dKPmeguSnzZRo36jsCGHlJBjHq0jkQIDAQABo4IB6DCCAeQwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBRj5EdUy4VxWUYsg6zMRDFkZwMsvjCB4gYDVR0gBIHaMIHXMIHUBgkqhkiG92NkBQEwgcYwgcMGCCsGAQUFBwICMIG2DIGzUmVsaWFuY2Ugb24gdGhpcyBjZXJ0aWZpY2F0ZSBieSBhbnkgcGFydHkgYXNzdW1lcyBhY2NlcHRhbmNlIG9mIHRoZSB0aGVuIGFwcGxpY2FibGUgc3RhbmRhcmQgdGVybXMgYW5kIGNvbmRpdGlvbnMgb2YgdXNlLCBjZXJ0aWZpY2F0ZSBwb2xpY3kgYW5kIGNlcnRpZmljYXRpb24gcHJhY3RpY2Ugc3RhdGVtZW50cy4wNQYDVR0fBC4wLDAqoCigJoYkaHR0cDovL2NybC5hcHBsZS5jb20va2V5c2VydmljZXMuY3JsMB0GA1UdDgQWBBR4jerseBHEUDC7mU+NQuIzZqHRFDAOBgNVHQ8BAf8EBAMCBSAwOAYLKoZIhvdjZAYNAQMBAf8EJgFuNnNkbHQ2OXFuc3l6eXp5bWFzdmdudGthbWd2bGE1Y212YzdpMC4GCyqGSIb3Y2QGDQEEAQH/BBwBd252bHhlbGV1Y3Vpb2JyZW4yeHZlZmV6N2Y5MA0GCSqGSIb3DQEBBQUAA4IBAQBM17YYquw0soDPAadr1aIM6iC6BQ/kOGYu3y/6AlrwYgAQNFy8DjsQUoqlQWFuA0sigp57bTUymkXEBf9yhUmXXiPafGjbxzsPF5SPFLIciolWbxRCB153L1a/Vh2wg3rhf4IvAZuJpnml6SSg5SjD19bN+gD7zrtp3yWKBKuarLSjDvVIB1SoxEToBs3glAEqoBiA2eZjikBA0aBlbvjUF2gqOmZjZJ7dmG1Tos2Zd4SdGL6ltSpKUeSGSxyv41aqF83vNpymNJmey2t2kPPtC7mt0LM32Ift3AkAl8Za9JbV/pOnc95oAfPhVTOGOI+u2BuB2qaKWjqHwkfqCz4A"
        }
      }
    }
  }
};

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

const SetLibraryPermissions = async (client, libraryId, tenantAdmins, contentAdmins, contentUsers) => {
  const promises = [
    // Tenant admins
    client.AddContentLibraryGroup({libraryId, groupAddress: tenantAdmins, permission: "accessor"}),
    client.AddContentLibraryGroup({libraryId, groupAddress: tenantAdmins, permission: "contributor"}),

    // Content admins
    client.AddContentLibraryGroup({libraryId, groupAddress: contentAdmins, permission: "accessor"}),
    client.AddContentLibraryGroup({libraryId, groupAddress: contentAdmins, permission: "contributor"}),

    // Content users
    client.AddContentLibraryGroup({libraryId, groupAddress: contentUsers, permission: "accessor"})
  ];

  await Promise.all(promises);
};

const SetObjectPermissions = async (client, objectId, tenantAdmins, contentAdmins, contentUsers) => {
  let promises = [
    // Tenant admins
    client.AddContentObjectGroupPermission({objectId, groupAddress: tenantAdmins, permission: "see"}),
    client.AddContentObjectGroupPermission({objectId, groupAddress: tenantAdmins, permission: "access"}),
    client.AddContentObjectGroupPermission({objectId, groupAddress: tenantAdmins, permission: "manage"}),

    // Content admins
    client.AddContentObjectGroupPermission({objectId, groupAddress: contentAdmins, permission: "see"}),
    client.AddContentObjectGroupPermission({objectId, groupAddress: contentAdmins, permission: "access"}),
    client.AddContentObjectGroupPermission({objectId, groupAddress: contentAdmins, permission: "manage"}),

    // Content users
    client.AddContentObjectGroupPermission({objectId, groupAddress: contentUsers, permission: "see"}),
    client.AddContentObjectGroupPermission({objectId, groupAddress: contentUsers, permission: "access"})
  ];

  await Promise.all(promises);
};

const InitializeTenant = async ({configUrl, kmsId, tenantName}) => {
  try {
    if(!process.env.PRIVATE_KEY) {
      console.log("ERROR: 'PRIVATE_KEY' environment variable must be set");
    }

    console.log(`\nSetting up tenant '${tenantName}'\n`);

    const client = await ElvClient.FromConfigurationUrl({configUrl});
    const wallet = client.GenerateWallet();
    const fundedSigner = wallet.AddAccount({privateKey: process.env.PRIVATE_KEY});

    const kmsWalletAddress = await client.userProfileClient.UserWalletAddress({
      address: client.utils.HashToAddress(kmsId)
    });

    if(!kmsWalletAddress) {
      console.error("Error: Specified KMS does not have a wallet address. Wrong KMS ID?\n");
      return;
    }

    const mnemonic = wallet.GenerateMnemonic();
    const tenantAdminSigner = wallet.AddAccountFromMnemonic({mnemonic});

    // Transfer funds to new account
    client.SetSigner({signer: fundedSigner});
    await client.SendFunds({recipient: tenantAdminSigner.address, ether: 20});

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

    console.log("\nFabric config URL:\n");
    console.log(`\t${configUrl}`);

    console.log("\nAdmin account:\n");
    console.log(`\t${tenantSlug}-elv-admin`);
    console.log(`\t${client.utils.FormatAddress(tenantAdminSigner.address)}`);
    console.log(`\t${tenantAdminSigner.signingKey.privateKey}`);
    console.log(`\t${mnemonic}`);

    /* Access groups - Create tenant admin, content admin and content user groups */
    const tenantAdminGroupAddress = await client.CreateAccessGroup({
      name: `${tenantName} Tenant Admins`
    });

    const contentAdminGroupAddress = await client.CreateAccessGroup({
      name: `${tenantName} Content Admins`
    });

    const contentUserGroupAddress = await client.CreateAccessGroup({
      name: `${tenantName} Content Users`
    });

    await client.AddAccessGroupManager({
      contractAddress: tenantAdminGroupAddress,
      memberAddress: tenantAdminSigner.address
    });

    await client.AddAccessGroupManager({
      contractAddress: contentAdminGroupAddress,
      memberAddress: tenantAdminSigner.address
    });

    await client.AddAccessGroupManager({
      contractAddress: contentUserGroupAddress,
      memberAddress: tenantAdminSigner.address
    });

    await client.userProfileClient.SetTenantId({address: tenantAdminGroupAddress});

    // Add KMS to tenant admins group
    await client.AddAccessGroupMember({
      contractAddress: tenantAdminGroupAddress,
      memberAddress: client.utils.HashToAddress(kmsId)
    });

    console.log("\nTenant Admins ID:\n");
    console.log("\t", await client.userProfileClient.TenantId());

    console.log("\nAccess Groups:\n");
    console.log(`\tOrganization Admins Group: ${tenantAdminGroupAddress}`);
    console.log(`\tContent Admins Group: ${contentAdminGroupAddress}`);
    console.log(`\tContent Users Group: ${contentUserGroupAddress}`);


    /* Content Types - Create Title, Title Collection and Production Master and add each to the groups */

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
      metadata: {...typeMetadata}
    });

    await SetObjectPermissions(client, titleTypeId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    const titleCollectionTypeId = await client.CreateContentType({
      name: `${tenantName} - Title Collection`,
      metadata: {...typeMetadata}
    });

    await SetObjectPermissions(client, titleCollectionTypeId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    const masterTypeId = await client.CreateContentType({
      name: `${tenantName} - Title Master`,
      metadata: {
        bitcode_flags: "abrmaster",
        bitcode_format: "builtin",
        public: {
          "eluv.manageApp": "default",
        }
      }
    });

    await SetObjectPermissions(client, masterTypeId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    const permissionsTypeId = await client.CreateContentType({
      name: `${tenantName} - Permissions`,
      metadata: {...typeMetadata, public: {"eluv.manageApp": "avails-manager"}}
    });

    await SetObjectPermissions(client, permissionsTypeId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    const channelTypeId = await client.CreateContentType({
      name: `${tenantName} - Channel`,
      metadata: {
        ...typeMetadata,
        public: {
          ...typeMetadata.public,
          title_configuration: {
            "controls": [
              "credits",
              "playlists",
              "gallery",
              "channel"
            ],
          }
        }
      }
    });

    await SetObjectPermissions(client, channelTypeId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    const streamTypeId = await client.CreateContentType({
      name: `${tenantName} - Live Stream`,
      metadata: {
        bitcode_flags: "playout_live",
        bitcode_format: "builtin",
        public: {
          ...typeMetadata.public,
          title_configuration: {
            "controls":[
              "credits",
              "playlists",
              "gallery",
              "live_stream"
            ]
          }
        }
      }
    });

    await SetObjectPermissions(client, streamTypeId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    console.log("\nTenant Types:\n");
    console.log(`\t${tenantName} - Title: ${titleTypeId}`);
    console.log(`\t${tenantName} - Title Collection: ${titleCollectionTypeId}`);
    console.log(`\t${tenantName} - Title Master: ${masterTypeId}`);
    console.log(`\t${tenantName} - Permissions: ${permissionsTypeId}`);
    console.log(`\t${tenantName} - Channel: ${channelTypeId}`);
    console.log(`\t${tenantName} - Live Stream: ${streamTypeId}`);

    for(let i = 0; i < liveTypes.length; i++) {
      const typeId = await client.CreateContentType({
        name: `${tenantName} - ${liveTypes[i].name}`,
        metadata: {
          ...typeMetadata,
          public: {
            ...typeMetadata.public,
            title_configuration: liveTypes[i].spec
          }
        }
      });

      await SetObjectPermissions(client, typeId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

      console.log(`\t${tenantName} - ${liveTypes[i].name}: ${typeId}`);
    }


    /* Create libraries - Properties, Title Masters, Title Mezzanines and add each to the groups */

    const propertiesLibraryId = await client.CreateContentLibrary({
      name: `${tenantName} - Properties`,
      kmsId
    });

    await SetLibraryPermissions(client, propertiesLibraryId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    const mastersLibraryId = await client.CreateContentLibrary({
      name: `${tenantName} - Title Masters`,
      kmsId
    });

    await SetLibraryPermissions(client, mastersLibraryId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    const mezzanineLibraryId = await client.CreateContentLibrary({
      name: `${tenantName} - Title Mezzanines`,
      kmsId,
      metadata: STANDARD_DRM_CERT
    });

    await SetLibraryPermissions(client, mezzanineLibraryId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    const reportingLibraryId = await client.CreateContentLibrary({
      name: `${tenantName} - Reports`,
      kmsId
    });

    await SetLibraryPermissions(client, reportingLibraryId, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    console.log("\nTenant Libraries:\n");
    console.log(`\t${tenantName} - Properties: ${propertiesLibraryId}`);
    console.log(`\t${tenantName} - Title Masters: ${mastersLibraryId}`);
    console.log(`\t${tenantName} - Title Mezzanines: ${mezzanineLibraryId}`);
    console.log(`\t${tenantName} - Reports: ${reportingLibraryId}`);

    /* Create a site object */
    const {id, write_token} = await client.CreateContentObject({
      libraryId: propertiesLibraryId,
      options: {type: titleCollectionTypeId}
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

    await SetObjectPermissions(client, id, tenantAdminGroupAddress, contentAdminGroupAddress, contentUserGroupAddress);

    console.log("\nSite Object: \n");
    console.log(`\tSite - ${tenantName}: ${id}\n\n`);


    /* Create report objects */

    console.log("\nCreating Reporting Objects...\n");

    for(let i = 0; i < reportTypes.length; i++) {
      const report = reportTypes[i];

      console.log(`\t${report}`);

      const {id, write_token} = await client.CreateContentObject({
        libraryId: reportingLibraryId,
      });

      await client.CreateEncryptionConk({
        libraryId: reportingLibraryId,
        objectId: id,
        writeToken: write_token,
        createKMSConk: true
      });

      await client.ReplaceMetadata({
        libraryId: reportingLibraryId,
        objectId: id,
        writeToken: write_token,
        metadataSubtree: "public",
        metadata: {
          name: `Org Internal - ${report}`,
        }
      });

      await client.FinalizeContentObject({
        libraryId: reportingLibraryId,
        objectId: id,
        writeToken: write_token
      });

      await client.SetVisibility({id, visibility: 0});

      await client.AddContentObjectGroupPermission({
        objectId: id,
        groupAddress: tenantAdminGroupAddress,
        permission: "manage"
      });
    }

    console.log();

  } catch(error) {
    console.log("Error initializing tenant:");
    console.log(error);
  }
};

InitializeTenant(argv);
