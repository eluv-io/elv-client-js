/**
 * LiveOutputs.js - Manage live outputs
 *
 * Usage:
 *   PRIVATE_KEY=<key> node utilities/LiveOutputs.js <command> [options]
 *
 * Commands:
 *   list                                                   List all outputs with config and state
 *   status  <output_id>                                    Show config and live state for an output
 *   create  --stream <id> [--node <id> | --geo <geo>]      Create a new output
 *           [--passphrase <pass>] [--name <name>]
 *   modify  <output_id> [--stream <id>] [--enable true|false]  Modify an existing output
 *           [--passphrase <pass>] [--name <name>]
 *   modify-batch <json_file>                               Modify multiple outputs from a JSON file
 *   delete  <output_id>                                    Delete an output
 *
 * Examples:
 *   node utilities/LiveOutputs.js list
 *   node utilities/LiveOutputs.js status out005
 *   node utilities/LiveOutputs.js create --stream iq__abc123 --node inod123 --name "My Output"
 *   node utilities/LiveOutputs.js create --stream iq__abc123 --geo na-west-north
 *   node utilities/LiveOutputs.js modify out005 --enable false
 *   node utilities/LiveOutputs.js modify out005 --stream iq_def456 --passphrase "new-secret" --name "Renamed"
 *   node utilities/LiveOutputs.js delete out005
 */
const { ElvClient } = require("../src/ElvClient");

const OBJECT_ID = "iq__eiDtwuBbAfyJCQqFKS5drdeDToL";  // demov3

const Init = async () => {
  const client = await ElvClient.FromNetworkName({networkName: "demov3"});
  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({privateKey: process.env.PRIVATE_KEY});
  client.SetSigner({signer});
  client.ToggleLogging(false);
  return client;
};

const List = async () => {
  const client = await Init();
  const outputs = await client.OutputsList({objectId: OBJECT_ID, includeState: true});
  console.log(JSON.stringify(outputs, null, 2));
};

const Status = async (outputId) => {
  const client = await Init();
  const state = await client.OutputsState({objectId: OBJECT_ID, outputId, includeState: true});
  console.log(JSON.stringify(state, null, 2));
};

const Create = async ({streamId, nodeId, geo, passphrase, name}) => {
  const client = await Init();
  const result = await client.OutputsCreate({
    objectId: OBJECT_ID,
    streamObjectId: streamId,
    enabled: true,
    name,
    nodeIds: nodeId ? [nodeId] : undefined,
    geos: geo ? [geo] : [],
    passphrase,
    stripRtp: true
  });
  console.log(JSON.stringify(result, null, 2));
};

const Modify = async (outputId, {streamId, enable, passphrase, name}) => {
  const client = await Init();

  // Read current output to use as base
  let output = await client.OutputsState({objectId: OBJECT_ID, outputId, includeState: false})

  if(streamId !== undefined) {
    output.input = {stream: streamId};
  }
  if(enable !== undefined) {
    output.enabled = enable;
  }
  if(passphrase !== undefined) {
    output.srt_pull = output.srt_pull || {};
    output.srt_pull.passphrase = passphrase;
  }
  if(name !== undefined) {
    output.name = name;
  }

  const result = await client.OutputsModify({objectId: OBJECT_ID, outputId, output});
  console.log(JSON.stringify(result, null, 2));
};

const ModifyBatch = async (jsonFile) => {
  const client = await Init();
  const outputs = JSON.parse(require("fs").readFileSync(jsonFile, "utf8"));
  const result = await client.OutputsModifyBatch({objectId: OBJECT_ID, outputs});
  console.log(JSON.stringify(result, null, 2));
};

const Delete = async (outputId) => {
  const client = await Init();
  const result = await client.OutputsDelete({objectId: OBJECT_ID, outputId});
  console.log(JSON.stringify(result, null, 2));
};

const Run = async (fn) => {
  try {
    await fn();
  } catch(error) {
    if(error.status) {
      console.error(`${error.status} ${error.statusText} ${error.url || ""}`);
      if(error.body) {
        console.error(JSON.stringify(error.body, null, 2));
      }
    } else {
      console.error(error.message || error);
    }
    process.exit(1);
  }
};

const getArg = (args, flag) => args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined;

const [cmd, ...args] = process.argv.slice(2);

switch(cmd) {
  case "list":
    Run(List);
    break;
  case "status":
    Run(() => Status(args[0]));
    break;
  case "create":
    Run(() => Create({
      streamId: getArg(args, "--stream"),
      nodeId: getArg(args, "--node"),
      geo: getArg(args, "--geo"),
      passphrase: getArg(args, "--passphrase"),
      name: getArg(args, "--name")
    }));
    break;
  case "modify":
    Run(() => Modify(args[0], {
      streamId: getArg(args, "--stream"),
      enable: args.includes("--enable") ? getArg(args, "--enable") === "true" : undefined,
      passphrase: getArg(args, "--passphrase"),
      name: getArg(args, "--name")
    }));
    break;
  case "modify-batch":
    Run(() => ModifyBatch(args[0]));
    break;
  case "delete":
    Run(() => Delete(args[0]));
    break;
  default:
    console.log("Usage: PRIVATE_KEY=<key> node utilities/LiveOutputs.js <command>\n");
    console.log("  list");
    console.log("  status   <output_id>");
    console.log("  create   --stream <stream_object_id> [--node <node_id> | --geo <geo>] [--passphrase <pass>] [--name <name>]");
    console.log("  modify   <output_id> [--stream <stream_object_id>] [--enable true|false] [--passphrase <pass>] [--name <name>]");
    console.log("  modify-batch <json_file>");
    console.log("  delete   <output_id>");
}
