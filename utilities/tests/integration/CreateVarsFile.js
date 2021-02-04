// creates a vars.TENANT_NAME.*.ignore.sh file based on existing vars file and a tenancy info file

const fs = require("fs");
const path = require("path");

const reTenantName = /^Setting up tenant '(.+)'/m;
const reContentAdmins = /Content Admins Group: (0x[0-9a-f]+)/m;
const rePrivateKey = /(0x[0-9a-f]{64})/m;
const reMasterType = /Title Master: (iq__\S+)/m;
const reMezType = /Title: (iq__\S+)/m;
const reMasterLib = /Title Masters: (ilib\S+)/m;
const reMezLib = /Title Mezzanines: (ilib\S+)/m;


const [ , , varFilePath, tenantFilePath, network ] = process.argv;

if(!varFilePath || !tenantFilePath || !network) {
  // eslint-disable-next-line no-console
  console.error("\nUsage: node CreateVarsFile.js varFilePath tenantFilePath (prod|demo|test|local)\n");
  process.exit(1);
}

let configUrl;
switch(network) {
  case "prod":
    configUrl = "https://main.net955305.contentfabric.io/config";
    break;
  case "demo":
    configUrl = "https://demov3.net955210.contentfabric.io/config";
    break;
  case "test":
    configUrl = "https://test.net955203.contentfabric.io/config ";
    break;
  case "local":
    configUrl = "http://localhost:8008/config?qspace=dev&self";
    break;
  default:
    throw Error(`unrecognized network ${network}`);
}


const tenantFile = fs.readFileSync(tenantFilePath, "utf8");
const varFile = fs.readFileSync(varFilePath, "utf8");

const tenantName = reTenantName.exec(tenantFile)[1];
const privateKey = rePrivateKey.exec(tenantFile)[1];
const contentAdmins = reContentAdmins.exec(tenantFile)[1];
const masterType = reMasterType.exec(tenantFile)[1];
const mezType = reMezType.exec(tenantFile)[1];
const masterLib = reMasterLib.exec(tenantFile)[1];
const mezLib = reMezLib.exec(tenantFile)[1];


let revisedVarFile = varFile.replace("export MASTER_TYPE=MY_MASTER_CONTENT_TYPE_ID", `export MASTER_TYPE=${masterType}`);
revisedVarFile = revisedVarFile.replace("export PRIVATE_KEY=MY_FABRIC_PRIVATE_KEY", `export PRIVATE_KEY=${privateKey}`);
revisedVarFile = revisedVarFile.replace("export ADMINS_GROUP_ADDRESS=MY_GROUP_ADDRESS", `export ADMINS_GROUP_ADDRESS=${contentAdmins}`);
revisedVarFile = revisedVarFile.replace("export MASTER_TYPE=MY_MASTER_CONTENT_TYPE_ID", `export MASTER_TYPE=${masterType}`);
revisedVarFile = revisedVarFile.replace("export MEZ_TYPE=MY_MEZZANINE_CONTENT_TYPE_ID", `export MEZ_TYPE=${mezType}`);
revisedVarFile = revisedVarFile.replace("export MASTER_LIB=MY_MASTER_LIBRARY_ID", `export MASTER_LIB=${masterLib}`);
revisedVarFile = revisedVarFile.replace("export MEZ_LIB=MY_MEZ_LIBRARY_ID", `export MEZ_LIB=${mezLib}`);
revisedVarFile = revisedVarFile.replace("export FABRIC_CONFIG_URL=MY_CONFIG_URL", `export FABRIC_CONFIG_URL="${configUrl}"`);
revisedVarFile = revisedVarFile.replace(/TENANT_NAME/g, tenantName);

const varFileNamePieces = path.basename(varFilePath).split(".");
const varFileDir = path.dirname(varFilePath);
const revisedPieces = [varFileNamePieces[0], tenantName, ...varFileNamePieces.slice(1, -1), "ignore", ...varFileNamePieces.slice(-1)];
const revisedVarFilePath = path.join(varFileDir, revisedPieces.join("."));

// eslint-disable-next-line no-console
console.log(`\nWriting to ${revisedVarFilePath}\n`);
fs.writeFileSync(revisedVarFilePath, revisedVarFile);
// eslint-disable-next-line no-console
console.log("\nDone.\n");