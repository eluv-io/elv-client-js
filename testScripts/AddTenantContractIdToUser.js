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

    const client = await ElvClient.FromConfigurationUrl({configUrl});
    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({privateKey: process.env.PRIVATE_KEY});
    client.SetSigner({signer});

    await client.userProfileClient.SetTenantContractId({tenantContractId: tenantContractId});
    console.log(`tenant contract ${await client.userProfileClient.TenantContractId()} set for user ${client.signer.address}`);

  } catch(e){
    console.error(e);
  }
};

AddTenantContractIdToUser(argv);