/**
 * Delete a list of content objects in bulk, sweeping the owner wallet(s), any given
 * groups', and any given extra user addresses' access indexes as it goes. See
 * DeleteContentObjectBatch in src/client/ContentReclaim.js for how the sweep chunking
 * works.
 *
 * Usage:
 *   PRIVATE_KEY=0x... node samples/DeleteContentObjects.js <object-list-file> [options]
 *
 * <object-list-file> - a text file with one object ID (iq__...) per line. Blank lines
 * and lines starting with # are ignored.
 *
 * Options:
 *   --groups=igrp1,igrp2   Comma separated group IDs (igrp...) or addresses to also
 *                          sweep, in addition to each object's owner wallet
 *   --users=addr1,addr2    Comma separated extra wallet/account addresses (or iusr...
 *                          IDs) to sweep too - useful when you know other accounts held
 *                          permissions on these objects beyond their owner
 *   --dry-run              Report the deletion/sweep plan and change nothing
 */

const fs = require("fs");
const {ElvClient} = require("../src/ElvClient");

const networkName = "demo"; // "main" or "demo"

const Usage = "Usage: node samples/DeleteContentObjects.js <object-list-file> [--groups=igrp1,igrp2] [--users=addr1,addr2] [--dry-run]";

// Accepts both "--groups=a,b" and "--groups a,b" - a value-taking flag followed by a
// non-flag argument is folded into "--flag=value" before the positional/flag split
const VALUE_FLAGS = ["--groups", "--users"];

const NormalizeArgs = (argv) => {
  const normalized = [];

  for(let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if(VALUE_FLAGS.includes(arg) && argv[i + 1] && !argv[i + 1].startsWith("--")) {
      normalized.push(`${arg}=${argv[i + 1]}`);
      i += 1;
    } else {
      normalized.push(arg);
    }
  }

  return normalized;
};

const ParseArgs = (rawArgv) => {
  const argv = NormalizeArgs(rawArgv);
  const positional = argv.filter(arg => !arg.startsWith("--"));
  const flags = argv.filter(arg => arg.startsWith("--"));

  const objectListFile = positional[0];
  if(!objectListFile) { throw Error(Usage); }

  const groupsFlag = flags.find(flag => flag.startsWith("--groups="));
  const groupIds = groupsFlag ?
    groupsFlag.slice("--groups=".length).split(",").map(id => id.trim()).filter(Boolean) :
    [];

  const usersFlag = flags.find(flag => flag.startsWith("--users="));
  const userIds = usersFlag ?
    usersFlag.slice("--users=".length).split(",").map(id => id.trim()).filter(Boolean) :
    [];

  return {objectListFile, groupIds, userIds, dryRun: flags.includes("--dry-run")};
};

const ReadObjectIds = (path) => (
  fs.readFileSync(path, "utf8")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"))
);

const Setup = async() => {
  const client = await ElvClient.FromNetworkName({networkName});

  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });

  client.SetSigner({signer});

  return client;
};

const LogSweeps = (label, sweeps) => {
  if(sweeps.length === 0) { return; }

  console.log(`\n${label}:`);
  sweeps.forEach(sweep => {
    const detail = sweep.reason ? ` (${sweep.reason})` : "";
    console.log(`  ${sweep.contractAddress}: ${sweep.status}${detail}`);
  });
};

const Run = async() => {
  const {objectListFile, groupIds, userIds, dryRun} = ParseArgs(process.argv.slice(2));
  const objects = ReadObjectIds(objectListFile);

  if(objects.length === 0) {
    console.log(`No object IDs found in ${objectListFile}`);
    return;
  }

  const client = await Setup();

  // These indexes are addressed by contract address either way - igrp.../iusr... IDs
  // need HashToAddress to recover that address; anything already shaped like an
  // address (0x...) passes through. DeleteContentObjectBatch's `groups` param doesn't
  // actually care whether an address is a group or a wallet - both carry the same kind
  // of index and get swept the same way - so extra user addresses just get merged in
  const ResolveAddress = (id) => (/^(0x)?[0-9a-fA-F]{40}$/.test(id) ? id : client.utils.HashToAddress(id));
  const groups = groupIds.map(ResolveAddress);
  const users = userIds.map(ResolveAddress);
  const sweepAddresses = [...groups, ...users];

  console.log(
    `Deleting ${objects.length} object(s) from ${objectListFile}` +
    `${groups.length > 0 ? `, sweeping ${groups.length} group(s)` : ""}` +
    `${users.length > 0 ? `, sweeping ${users.length} extra user address(es)` : ""}` +
    `${dryRun ? " (dry run)" : ""}`
  );

  const result = await client.DeleteContentObjectBatch({
    objects,
    groupOrUserAddresses: sweepAddresses,
    dryRun,
    onProgress: ({phase, objectId, owner, status, reason, done, total}) => {
      if(phase === "delete") {
        const outcome = status === "deleted" ? "deleted" : `failed (${reason})`;
        console.log(`[${done}/${total}] ${objectId}: ${outcome}`);
      }
      if(phase === "sweep") { console.log(`Sweeping owner index ${owner}...`); }
      if(phase === "sweep-groups") { console.log(`Sweeping group index(es) for owner ${owner}...`); }
    }
  });

  console.log(`\nDeleted: ${result.deleted.length}`);
  console.log(`Failed: ${result.failed.length}`);
  console.log(`Transactions: ${result.transactions}`);

  if(result.failed.length > 0) {
    console.log("\nFailures:");
    result.failed.forEach(entry => console.log(`  ${entry.objectId}: ${entry.reason}`));
  }

  LogSweeps("Owner index sweeps", result.sweeps);
  LogSweeps("Group/user index sweeps", result.groupSweeps);
};

Run().catch(error => {
  console.error(error);
  process.exit(1);
});
