/* eslint-disable no-console */
const {ElvClient} = require("../src/ElvClient");

const yargs = require("yargs");
const argv = yargs
  .option("configUrl", {
    description: "Fabric configuration URL (e.g. https://main.net955210.contentfabric.io/config)"
  })
  .option("tenantContractId", {
    description: "tenant Contract Id to set for the user"
  })
  .demandOption(
    ["configUrl", "tenantContractId"],
    "\nUsage: PRIVATE_KEY=<private-key> node CreateUserWithTenantId --configUrl <config-url> --tenantContractId <tenant_id>\n"
  )
  .argv;

const AddTenantContractIdToUser = async ({configUrl, tenantContractId}) => {
  try {
    if(!process.env.PRIVATE_KEY) {
      console.log("ERROR: 'PRIVATE_KEY' environment variable must be set");
    }

    console.log(`\nAdd tenant to User, tenant contract : ${tenantContractId}\n`);

    // create user wallet
    const client = await ElvClient.FromConfigurationUrl({configUrl});
    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({privateKey: process.env.PRIVATE_KEY});
    client.SetSigner({signer});

    // set tenant contract ID for user
    await client.userProfileClient.SetTenantContractId({tenantContractId: tenantContractId});
    console.log(`tenant contract ${await client.userProfileClient.TenantContractId()} set for user ${client.signer.address}`);

    // tenant contract ID set during creation of library
    libraryId = await client.CreateContentLibrary({name: "lib_test_set_tenant_contract_id"});
    libraryAddress = client.utils.HashToAddress(libraryId);
    console.log(`library created: ${libraryId}`);
    let actualTenantContractId = await client.GetLibraryTenantContractId({libraryAddress});
    if(tenantContractId !== actualTenantContractId){
      throw Error(`tenant mismatch, actual: ${actualTenantContractId}, expected: ${tenantContractId}`);
    }

    // tenant contract ID set during creation of content type
    const typeMetadata = {
      bitcode_flags: "abrmaster",
      bitcode_format: "builtin",
      public: {
        "eluv.displayApp": "default",
        "eluv.manageApp": "default",
      }
    };

    const contentTypeId = await client.CreateContentType({
      name: `${tenantContractId} - Title`,
      metadata: {...typeMetadata}
    });
    contentTypeAddress = client.utils.HashToAddress(contentTypeId);
    console.log(`content type - title created: ${contentTypeId}`);
    actualTenantContractId = await client.GetContentTypeTenantContractId({
      contentTypeAddress
    });
    if(tenantContractId !== actualTenantContractId){
      throw Error(`tenant mismatch, actual: ${actualTenantContractId}, expected: ${tenantContractId}`);
    }

    // tenant contract ID set during creation of access group
    const groupAddress = await client.CreateAccessGroup({name: "Test Group"});
    console.log(`group created: ${groupAddress}`);
    actualTenantContractId = await client.GetGroupTenantContractId({
      groupAddress
    });
    if(tenantContractId !== actualTenantContractId){
      throw Error(`tenant mismatch, actual: ${actualTenantContractId}, expected: ${tenantContractId}`);
    }

  } catch(e){
    console.error(e);
  }
};

AddTenantContractIdToUser(argv);