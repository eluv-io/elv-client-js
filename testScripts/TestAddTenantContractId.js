/* eslint-disable no-console */
const {ElvClient} = require("../src/ElvClient");

const yargs = require("yargs");
const argv = yargs
  .option("configUrl", {
    description: "Fabric configuration URL (e.g. https://main.net955210.contentfabric.io/config)"
  })
  .option("tenantContractId", {
    description: "tenant Contract Id to set for the objects"
  })
  .option("tenantIdToBeReplaced", {
    description: "tenant Id to be changed for the objects"
  })
  .demandOption(
    ["configUrl", "tenantContractId", "tenantIdToBeReplaced" ],
    "\nUsage: PRIVATE_KEY=<private-key> node TestAddTenantContractId --configUrl <config-url> --tenantContractId <tenant_contract_id> --tenantIdToBeReplaced <tenant_id>\n"
  )
  .argv;

/**
 * TestAddTenantContractId adds tenantContractId to wallet,library,group,content-type object
 * and change tenantId to value provided.
 *
 * @param {string} configUrl - Config Url
 * @param {string} tenantContractId - Id of tenantContract to be set
 * @param {string} tenantIdToBeReplaced - Id of tenant admin group to be replaced
 * @returns {Promise<void>}
 * @constructor
 */
const TestAddTenantContractId = async ({configUrl, tenantContractId, tenantIdToBeReplaced}) => {
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
    await client.userProfileClient.SetTenantContractId({tenantContractId});
    console.log(`tenant contract ${await client.userProfileClient.TenantContractId()} set for user ${client.signer.address}`);
    // console.log(await client.userProfileClient.UserMetadata());

    // tenant contract ID set during creation of library
    libraryId = await client.CreateContentLibrary({name: "library_with_tenant_contract_id"});
    libraryAddress = client.utils.HashToAddress(libraryId);
    console.log(`library created: ${libraryId}`);
    let actualTenantContractId = await client.TenantContractId({contractAddress:libraryAddress});
    if(tenantContractId !== actualTenantContractId){
      throw Error(`tenant mismatch, actual: ${actualTenantContractId}, expected: ${tenantContractId}`);
    }
    // console.log(await client.ContentObjectMetadata({libraryId, objectId: client.utils.AddressToObjectId(libraryAddress)}));

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
    actualTenantContractId = await client.TenantContractId({contractAddress:contentTypeAddress});
    if(tenantContractId !== actualTenantContractId){
      throw Error(`tenant mismatch, actual: ${actualTenantContractId}, expected: ${tenantContractId}`);
    }
    // console.log(await client.ContentObjectMetadata({
    //   libraryId: client.contentSpaceLibraryId,
    //   objectId: client.utils.AddressToObjectId(contentTypeAddress)}));

    // tenant contract ID set during creation of access group
    const groupAddress = await client.CreateAccessGroup({name: "Test Group"});
    console.log(`group created: ${groupAddress}`);
    actualTenantContractId = await client.TenantContractId({contractAddress:groupAddress});
    if(tenantContractId !== actualTenantContractId){
      throw Error(`tenant mismatch, actual: ${actualTenantContractId}, expected: ${tenantContractId}`);
    }
    // console.log(await client.ContentObjectMetadata({
    //   libraryId: client.contentSpaceLibraryId,
    //   objectId: client.utils.AddressToObjectId(groupAddress)}));


    // Change tenantID (which in turn changes tenantContractId) to user, group, library and content-type
    await client.userProfileClient.SetTenantId({id: tenantIdToBeReplaced});
    const newTenantId = await client.userProfileClient.TenantId();
    if(newTenantId !== tenantIdToBeReplaced) {
      throw Error(`tenant mismatch, actual: ${tenantInfo.tenantId}, expected: ${tenantIdToBeReplaced}`);
    }
    console.log();
    console.log(`tenantId for user changed to ${tenantIdToBeReplaced}`);

    tenantInfo = await client.SetTenantId({objectId: libraryId, tenantId: tenantIdToBeReplaced});
    if(tenantInfo.tenantId !== tenantIdToBeReplaced) {
      throw Error(`tenant mismatch, actual: ${tenantInfo.tenantId}, expected: ${tenantIdToBeReplaced}`);
    }
    console.log(`tenantId for library changed to ${tenantIdToBeReplaced}`);

    tenantInfo = await client.SetTenantId({contractAddress: contentTypeAddress, tenantId: tenantIdToBeReplaced});
    if(tenantInfo.tenantId !== tenantIdToBeReplaced) {
      throw Error(`tenant mismatch, actual: ${tenantInfo.tenantId}, expected: ${tenantIdToBeReplaced}`);
    }
    console.log(`tenantId for content-type object changed to ${tenantIdToBeReplaced}`)

    tenantInfo = await client.SetTenantId({contractAddress: groupAddress, tenantId: tenantIdToBeReplaced});
    if(tenantInfo.tenantId !== tenantIdToBeReplaced) {
      throw Error(`tenant mismatch, actual: ${tenantInfo.tenantId}, expected: ${tenantIdToBeReplaced}`);
    }
    console.log(`tenantId for group-address changed to ${tenantIdToBeReplaced}`)

  } catch(e){
    console.error(e);
  }
};

TestAddTenantContractId(argv);