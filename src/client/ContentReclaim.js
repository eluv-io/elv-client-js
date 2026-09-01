/**
 * Methods for reclaiming content objects in bulk.
 *
 * Two shapes of reclamation:
 *
 *  - Retire - every version of an object is deleted but the contract survives, so the
 *    object ID, its content type and its permissions can be built on again. Cheap to
 *    reuse, and it leaves nothing to clean up.
 *
 *  - Delete - the contract itself is destroyed. This frees more state, but it leaves a
 *    dead entry in the owner's access index which must be swept before the sweep
 *    itself outgrows a block. See DeleteContentObjectBatch for why that sweep belongs
 *    in a batch and not in a single delete.
 *
 * Both are bound by transaction count rather than by gas. A transaction and its
 * receipt are written to the chain permanently, so the number of them - not what each
 * one costs - is what these methods minimise.
 *
 * @module ElvClient/ContentReclaim
 */

const UrlJoin = require("url-join");

const {
  ValidateObject,
  ValidatePresence
} = require("../Validation");

// Removing one dead entry from an access index costs roughly this much gas; scanning
// past a live one costs roughly this much. cleanUpContentObjects is a single loop
// over the whole list that cannot resume partway, so a sweep that does not fit in a
// block simply reverts - and every delete that follows pushes it further out of reach.
const INDEX_SWEEP_GAS_PER_REMOVAL = 20000;
const INDEX_SWEEP_GAS_PER_SCAN = 2600;

// Leave headroom in the block for everything else being mined
const INDEX_SWEEP_BLOCK_FRACTION = 0.8;

// Used when the block gas limit cannot be read
const DEFAULT_MAX_DEAD_ENTRIES = 200;

// Objects worked on at once. Sends are serialised by EthClient regardless; this
// bounds how many objects are mid-flight, not how many transactions are in the air.
const DEFAULT_CONCURRENCY = 8;

// Read concurrency for view calls, which are free and not serialised
const DEFAULT_READ_CONCURRENCY = 20;

// Where a retirement record is written on a retired object
const RETIRED_SUBTREE = "retired";

// Where retirements are recorded in a shared pool index object
const DEFAULT_POOL_SUBTREE = "pool/retired";

// A commit is two chain transactions: commit() from us, confirmCommit() from the KMS
const TRANSACTIONS_PER_COMMIT = 2;

const Chunk = (values, size) => {
  const chunks = [];

  for(let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
};

/**
 * Normalise a list of objects into {objectId, libraryId}, resolving libraries where
 * they were not supplied. Entries that cannot be resolved are returned with an error
 * rather than throwing, so one bad ID does not lose the batch.
 */
const ResolveObjects = async function({client, objects, concurrency}) {
  const entries = objects.map(entry => (
    typeof entry === "string" ? {objectId: entry} : {objectId: entry.objectId, libraryId: entry.libraryId}
  ));

  return await client.utils.LimitedMap(concurrency, entries, async entry => {
    try {
      ValidateObject(entry.objectId);

      return {
        objectId: entry.objectId,
        libraryId: entry.libraryId || await client.ContentObjectLibraryId({objectId: entry.objectId})
      };
    } catch(error) {
      return {objectId: entry.objectId, libraryId: entry.libraryId, error: error.message};
    }
  });
};

/**
 * Set the fabric group associations of a draft.
 *
 * Uses the client method where the running version has it, and the fabric endpoint it
 * wraps otherwise, so retirement works against clients that predate it.
 */
const SetGroups = async function({client, libraryId, objectId, writeToken, groups}) {
  if(typeof client.SetContentObjectGroups === "function") {
    return await client.SetContentObjectGroups({libraryId, objectId, writeToken, groups});
  }

  return await client.HttpClient.RequestJsonBody({
    headers: await client.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
    method: "PUT",
    path: UrlJoin("qlibs", libraryId, "q", writeToken, "groups"),
    body: groups,
    allowFailover: false
  });
};

/**
 * Set the indexed query fields of a draft, where the running version supports it.
 * Returns false when it does not, so the caller can report that the pool will not be
 * filterable by age server side.
 */
const SetQueryFields = async function({client, libraryId, objectId, writeToken, queryFields}) {
  try {
    if(typeof client.SetContentObjectQueryFields === "function") {
      await client.SetContentObjectQueryFields({libraryId, objectId, writeToken, queryFields});

      return true;
    }

    await client.HttpClient.RequestJsonBody({
      headers: await client.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "PUT",
      path: UrlJoin("qlibs", libraryId, "q", writeToken, "query_fields"),
      body: queryFields,
      allowFailover: false
    });

    return true;
  } catch(error) {
    return false;
  }
};

/**
 * The wallet contract holding the access index for an address.
 *
 * Accepts either the wallet contract address itself - recognised because it answers
 * getContentObjectsLength - or an account address to resolve. Returns undefined when
 * neither applies, which is the case for objects owned by something that is not a
 * user, and means there is no index to sweep.
 */
const ResolveWallet = async function({client, contractAddress}) {
  try {
    await client.CallContractMethod({
      contractAddress,
      methodName: "getContentObjectsLength",
      formatArguments: false
    });

    return client.utils.FormatAddress(contractAddress);
  } catch(error) {
    try {
      const wallet = await client.userProfileClient.UserWalletAddress({address: contractAddress});

      if(!wallet || client.utils.EqualAddress(wallet, client.utils.nullAddress)) { return undefined; }

      return client.utils.FormatAddress(wallet);
    } catch(walletError) {
      return undefined;
    }
  }
};

/**
 * How many dead entries one cleanUpContentObjects call can remove and still fit in a
 * block. Falls back to a conservative constant when the block gas limit is unreadable.
 */
const SweepBudget = async function({client, indexLength = 0}) {
  let gasLimit = 0;

  try {
    const block = await client.ethClient.MakeProviderCall({methodName: "getBlock", args: ["latest"]});

    if(block && block.gasLimit) { gasLimit = Number(block.gasLimit.toString()); }
  } catch(error) {
    gasLimit = 0;
  }

  if(!gasLimit) { return DEFAULT_MAX_DEAD_ENTRIES; }

  const available = (gasLimit * INDEX_SWEEP_BLOCK_FRACTION) - (INDEX_SWEEP_GAS_PER_SCAN * indexLength);

  return Math.max(1, Math.floor(available / INDEX_SWEEP_GAS_PER_REMOVAL));
};

/**
 * The number of dead entries in the content object index of a wallet or group.
 *
 * Dead entries are addresses with no code - objects that were destroyed without being
 * unregistered, which is every destroyed object, because kill() does not unregister.
 * They are only removable by cleanUpContentObjects, a single unbounded loop, so
 * knowing the count before sending that transaction is what keeps the index from
 * becoming permanently uncleanable.
 *
 * Costs nothing: every call it makes is a view call.
 *
 * @methodGroup Reclamation
 * @namedParams
 * @param {string} contractAddress - Address of a wallet or group contract, or of an
 * account whose wallet should be resolved
 * @param {number=} concurrency=20 - Parallel view calls
 *
 * @returns {Promise<Object>} - {contractAddress, length, dead, live, unknown,
 * maxSweepable, sweepable, addresses}
 */
exports.AccessIndexDebt = async function({contractAddress, concurrency = DEFAULT_READ_CONCURRENCY}) {
  ValidatePresence("contractAddress", contractAddress);

  const wallet = await ResolveWallet({client: this, contractAddress});

  if(!wallet) {
    throw Error(`No access index found for ${contractAddress}`);
  }

  this.Log(`Counting index debt for ${wallet}`);

  const length = (await this.CallContractMethod({
    contractAddress: wallet,
    methodName: "getContentObjectsLength",
    formatArguments: false
  })).toNumber();

  const positions = [];
  for(let i = 0; i < length; i++) { positions.push(i); }

  const addresses = await this.utils.LimitedMap(concurrency, positions, async position => {
    try {
      return await this.CallContractMethod({
        contractAddress: wallet,
        methodName: "getContentObject",
        methodArgs: [position]
      });
    } catch(error) {
      return undefined;
    }
  });

  const states = await this.utils.LimitedMap(concurrency, addresses, async address => {
    if(!address) { return "unknown"; }

    try {
      const code = await this.ethClient.MakeProviderCall({methodName: "getCode", args: [address]});

      return (!code || code === "0x" || code === "0x0") ? "dead" : "live";
    } catch(error) {
      return "unknown";
    }
  });

  const dead = states.filter(state => state === "dead").length;
  const live = states.filter(state => state === "live").length;
  const unknown = states.filter(state => state === "unknown").length;
  const maxSweepable = await SweepBudget({client: this, indexLength: length});

  return {
    contractAddress: wallet,
    length,
    dead,
    live,
    unknown,
    maxSweepable,
    sweepable: dead <= maxSweepable,
    addresses: addresses.map((address, index) => ({address, state: states[index]}))
  };
};

/**
 * The version count of a content object, read from its contract.
 *
 * Works on objects with no versions, which the fabric listing APIs cannot see at all -
 * they are indexes over published versions, so an object with none is not merely
 * absent from the results but outside what the query can express.
 *
 * @methodGroup Reclamation
 * @namedParams
 * @param {string} objectId - ID of the object
 *
 * @returns {Promise<Object>} - {archived, current, total} - current is the object's
 * live version hash, archived the count held in the contract's version array
 */
exports.ContentObjectVersionCount = async function({objectId}) {
  ValidateObject(objectId);

  const contractAddress = this.utils.HashToAddress(objectId);

  const [archived, current] = await Promise.all([
    this.CallContractMethod({contractAddress, methodName: "countVersionHashes", formatArguments: false}),
    this.CallContractMethod({contractAddress, methodName: "objectHash", formatArguments: false})
  ]);

  const count = archived.toNumber();

  return {
    archived: count,
    current: current || undefined,
    total: count + (current ? 1 : 0)
  };
};

/**
 * Delete every version of a content object, leaving the object itself in place.
 *
 * Deletions are ordered so that each one is O(1) on chain. deleteVersion scans the
 * contract's version array hashing each element until it matches, so it is cheapest
 * when the target sits at index 0 - and removeVersionIdx swaps the last element into
 * the hole, which means positions shift on every call and index 0 has to be re-read
 * each time. The object's current version hash is deleted last, once the array is
 * empty, where it is also O(1). Feeding this the fabric's newest-first listing
 * instead makes the whole operation O(n squared).
 *
 * Where the object's contract has a bounded deleteVersions(max), that is used
 * instead and the whole object is emptied in one transaction. Detection is by
 * deployed bytecode rather than by trying the call: BaseContent inherits an empty
 * payable fallback from Ownable, so calling a method it does not have succeeds
 * silently and deletes nothing.
 *
 * @methodGroup Reclamation
 * @namedParams
 * @param {string} objectId - ID of the object
 * @param {string=} libraryId - ID of the library
 * @param {number=} batchSize=50 - Versions per call when the contract supports batched
 * deletion
 * @param {function=} onProgress - Called as ({objectId, deleted, remaining})
 *
 * @returns {Promise<Object>} - {objectId, deleted, transactions, batched}
 */
exports.DeleteContentObjectVersions = async function({objectId, libraryId, batchSize = 50, onProgress}) {
  ValidateObject(objectId);

  const contractAddress = this.utils.HashToAddress(objectId);
  const before = await this.ContentObjectVersionCount({objectId});

  if(before.total === 0) {
    return {objectId, libraryId, deleted: 0, transactions: 0, batched: false};
  }

  this.Log(`Deleting ${before.total} version(s) of ${objectId}`);

  const batched = await this.authClient.ContractHasMethod({
    contractAddress,
    methodName: "deleteVersions"
  });

  let transactions = 0;

  if(batched) {
    for(;;) {
      const remaining = await this.ContentObjectVersionCount({objectId});
      if(remaining.total === 0) { break; }

      await this.CallContractMethodAndWait({
        contractAddress,
        methodName: "deleteVersions",
        methodArgs: [batchSize]
      });
      transactions += 1;

      const after = await this.ContentObjectVersionCount({objectId});

      if(onProgress) {
        onProgress({objectId, deleted: before.total - after.total, remaining: after.total});
      }

      // A call that removes nothing would loop forever - the contract is not doing
      // what its selector says it does
      if(after.total === remaining.total) {
        throw Error(`deleteVersions removed nothing on ${objectId} - ${after.total} version(s) remain`);
      }
    }

    return {objectId, libraryId, deleted: before.total, transactions, batched: true};
  }

  // One deletion per transaction, always taking the cheapest position on chain
  let deleted = 0;
  const limit = before.total + 8;

  for(let pass = 0; pass <= limit; pass++) {
    const archived = (await this.CallContractMethod({
      contractAddress,
      methodName: "countVersionHashes",
      formatArguments: false
    })).toNumber();

    const versionHash = archived > 0 ?
      await this.CallContractMethod({contractAddress, methodName: "versionHashes", methodArgs: [0]}) :
      await this.CallContractMethod({contractAddress, methodName: "objectHash", formatArguments: false});

    if(!versionHash) {
      return {objectId, libraryId, deleted, transactions, batched: false};
    }

    await this.DeleteContentVersion({versionHash});
    deleted += 1;
    transactions += 1;

    if(onProgress) {
      onProgress({objectId, deleted, remaining: archived > 0 ? archived - 1 : 0});
    }
  }

  throw Error(`Deleting versions of ${objectId} did not converge - it is gaining versions faster than they can be removed`);
};

/**
 * Append retirements to a shared pool index object in a single commit.
 *
 * Keyed by object ID so re-retiring an object updates its entry rather than adding a
 * second one, and so claiming an object from the pool can remove one key.
 *
 * The index is a hint, not a source of truth - verify a candidate with
 * ContentObjectVersionCount before building on it. That keeps the index free of the
 * transactional guarantees it could not provide anyway.
 */
const RecordInPoolIndex = async function({client, poolIndex, entries, retiredAt, by, reason}) {
  const objectId = poolIndex.objectId;
  ValidateObject(objectId);

  const libraryId = poolIndex.libraryId || await client.ContentObjectLibraryId({objectId});
  const metadataSubtree = poolIndex.metadataSubtree || DEFAULT_POOL_SUBTREE;

  const record = {};
  entries.forEach(entry => {
    record[entry.objectId] = {
      at: retiredAt,
      by,
      reason,
      previous_name: entry.previous_name,
      versions_deleted: entry.deleted,
      schema: 1
    };
  });

  const {writeToken} = await client.EditContentObject({libraryId, objectId});

  await client.MergeMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree,
    metadata: record
  });

  const finalized = await client.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken,
    commitMessage: reason ?
      `Retired ${entries.length} object(s): ${reason}` :
      `Retired ${entries.length} object(s)`,
    awaitCommitConfirmation: true
  });

  return {objectId, libraryId, metadataSubtree, recorded: entries.length, hash: finalized.hash};
};

/**
 * Retire content objects in bulk - delete every version, but keep the object.
 *
 * The object ID, its content type and its permissions survive, so a retired object can
 * be built on again by passing its ID to CreateContentObject. This is the cheaper half
 * of reclamation: it costs one transaction per version (or one per object where the
 * contract has a batched delete) and leaves no index debt behind.
 *
 * How retired objects are found again afterwards is chosen by the caller, and the
 * choice matters more than it looks. An emptied object is invisible to
 * QueryTenantContent and to ContentObjects, both of which index published versions, so
 * something has to record the retirement:
 *
 *  - poolIndex - one entry per object written into a single shared index object. Two
 *    transactions for the whole batch. Recommended.
 *
 *  - groups - a marker version committed on each object carrying those fabric groups,
 *    which makes the object visible to QueryTenantContent under a pool group. Two
 *    transactions per object, and each one waits on the KMS to confirm the commit.
 *    Use when the pool has to be visible to tooling that already queries by group.
 *
 *  - neither - the objects are emptied and left loose, to be found later by walking
 *    the owner's access index on chain. No transaction cost, but nothing records that
 *    the object was retired deliberately, so reclaiming one means inferring
 *    abandonment from absence.
 *
 * @methodGroup Reclamation
 * @namedParams
 * @param {Array<string | Object>} objects - Object IDs, or {objectId, libraryId}
 * @param {Object=} poolIndex - {objectId, libraryId, metadataSubtree} of a shared index
 * object to record the retirements in. metadataSubtree defaults to "pool/retired"
 * @param {Array<string>=} groups - Fabric groups to set on a per-object marker version.
 * Omit for no marker version
 * @param {Object=} markerMetadata - Extra metadata merged into each marker's retirement
 * record
 * @param {string=} reason - Recorded with each retirement
 * @param {number=} concurrency=8 - Objects worked on at once
 * @param {number=} batchSize=50 - Versions per call where the contract supports batched
 * deletion
 * @param {boolean=} dryRun=false - Report what would happen and change nothing
 * @param {function=} onProgress - Called as ({phase, objectId, done, total})
 *
 * @returns {Promise<Object>} - {retired, failed, transactions, poolIndex, dryRun}
 */
exports.RetireContentObjectBatch = async function({
  objects,
  poolIndex,
  groups,
  markerMetadata = {},
  reason,
  concurrency = DEFAULT_CONCURRENCY,
  batchSize = 50,
  dryRun = false,
  onProgress
}) {
  ValidatePresence("objects", objects);

  if(!Array.isArray(objects)) { throw Error("objects must be an array"); }

  const resolved = await ResolveObjects({client: this, objects, concurrency});
  const usable = resolved.filter(entry => !entry.error);
  const failed = resolved.filter(entry => entry.error)
    .map(entry => ({objectId: entry.objectId, status: "failed", reason: entry.error}));

  const retiredAt = new Date().toISOString();
  let by;
  try {
    by = await this.CurrentAccountAddress();
  } catch(error) {
    by = undefined;
  }

  this.Log(`Retiring ${usable.length} object(s)${dryRun ? " (dry run)" : ""}`);

  let done = 0;
  const results = await this.utils.LimitedMap(concurrency, usable, async entry => {
    const {objectId, libraryId} = entry;
    const result = {objectId, libraryId, transactions: 0};

    try {
      const counts = await this.ContentObjectVersionCount({objectId});
      result.versions = counts.total;

      // Read the name before it is deleted, so the retirement record can say what the
      // object used to be
      let previousName;
      try {
        previousName = await this.ContentObjectMetadata({
          libraryId,
          objectId,
          metadataSubtree: "public/name"
        });
      } catch(error) {
        previousName = undefined;
      }
      result.previous_name = previousName;

      if(dryRun) {
        return {...result, status: "planned"};
      }

      const deletion = await this.DeleteContentObjectVersions({
        objectId,
        libraryId,
        batchSize,
        onProgress: onProgress ? progress => onProgress({phase: "versions", ...progress}) : undefined
      });
      result.transactions += deletion.transactions;
      result.batched = deletion.batched;
      result.deleted = deletion.deleted;

      if(groups && groups.length > 0) {
        const record = {
          at: retiredAt,
          by,
          reason,
          previous_name: previousName,
          schema: 1,
          ...markerMetadata
        };

        const {writeToken} = await this.EditContentObject({libraryId, objectId});

        await this.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadataSubtree: RETIRED_SUBTREE,
          metadata: record
        });

        await SetGroups({client: this, libraryId, objectId, writeToken, groups});

        // Lets the pool be filtered and aged server side rather than paged into the
        // client. Not fatal where the running fabric does not support it
        result.query_fields = await SetQueryFields({
          client: this,
          libraryId,
          objectId,
          writeToken,
          queryFields: {retired_at: retiredAt}
        });

        const finalized = await this.FinalizeContentObject({
          libraryId,
          objectId,
          writeToken,
          commitMessage: reason ? `Retired: ${reason}` : "Retired",
          awaitCommitConfirmation: true
        });

        result.marker = finalized.hash;
        result.groups = groups;
        result.transactions += TRANSACTIONS_PER_COMMIT;
      }

      return {...result, status: "retired"};
    } catch(error) {
      return {...result, status: "failed", reason: error.message};
    } finally {
      done += 1;
      if(onProgress) { onProgress({phase: "retire", objectId, done, total: usable.length}); }
    }
  });

  const retired = results.filter(result => result.status !== "failed");
  const errors = failed.concat(results.filter(result => result.status === "failed"));

  let transactions = results.reduce((total, result) => total + result.transactions, 0);
  let poolIndexResult;

  // One commit for the whole batch, rather than one marker version per object
  if(poolIndex && !dryRun && retired.length > 0) {
    try {
      poolIndexResult = await RecordInPoolIndex({
        client: this,
        poolIndex,
        entries: retired,
        retiredAt,
        by,
        reason
      });
      transactions += TRANSACTIONS_PER_COMMIT;
    } catch(error) {
      poolIndexResult = {error: error.message};
    }
  }

  return {
    retired,
    failed: errors,
    transactions,
    poolIndex: poolIndexResult,
    dryRun
  };
};


/**
 * The retired objects recorded in a shared pool index, newest first.
 *
 * Entries are verified on chain before being returned, because the index is a hint:
 * an object listed there may have been built on since, or may no longer exist.
 *
 * @methodGroup Reclamation
 * @namedParams
 * @param {Object} poolIndex - {objectId, libraryId, metadataSubtree}
 * @param {boolean=} verify=true - Drop entries whose objects are not actually empty
 * @param {number=} minimumAge=0 - Only return entries retired at least this many
 * seconds ago
 * @param {number=} concurrency=20 - Parallel view calls when verifying
 *
 * @returns {Promise<Array<Object>>} - {objectId, at, by, reason, previous_name, verified}
 */
exports.PoolIndexEntries = async function({
  poolIndex,
  verify = true,
  minimumAge = 0,
  concurrency = DEFAULT_READ_CONCURRENCY
}) {
  ValidatePresence("poolIndex", poolIndex);

  const objectId = poolIndex.objectId;
  ValidateObject(objectId);

  const libraryId = poolIndex.libraryId || await this.ContentObjectLibraryId({objectId});
  const metadataSubtree = poolIndex.metadataSubtree || DEFAULT_POOL_SUBTREE;

  const record = await this.ContentObjectMetadata({libraryId, objectId, metadataSubtree}) || {};
  const cutoff = Date.now() - (minimumAge * 1000);

  const entries = Object.keys(record).map(id => ({objectId: id, ...record[id]}))
    .filter(entry => {
      if(!minimumAge) { return true; }

      const at = Date.parse(entry.at);

      // An entry with no usable timestamp cannot be shown to be old enough
      return !isNaN(at) && at <= cutoff;
    })
    .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));

  if(!verify) { return entries; }

  const verified = await this.utils.LimitedMap(concurrency, entries, async entry => {
    try {
      const counts = await this.ContentObjectVersionCount({objectId: entry.objectId});

      return {...entry, verified: counts.total === 0, versions: counts.total};
    } catch(error) {
      // No contract, or unreadable - either way it cannot be handed out
      return {...entry, verified: false, reason: error.message};
    }
  });

  return verified.filter(entry => entry.verified);
};

/**
 * Delete content objects in bulk, then repay the index debt the deletions leave.
 *
 * kill() never unregisters the object from its owner's access index, so every deletion
 * leaves a dead address in that list. The only repair, cleanUpContentObjects, is a
 * single unbounded loop that cannot resume partway - past roughly
 * (block gas limit / 20,000) dead entries it exceeds the block limit and the index
 * becomes permanently uncleanable. Wallet contracts are factory-deployed and not
 * upgradeable, so an existing wallet can never be given a paged version.
 *
 * This method is therefore structured so dead entries never accumulate past one chunk:
 * objects are grouped by owner wallet, each owner's work is chunked to what a sweep can
 * remove in a block, and the sweep for a chunk is awaited and verified before the next
 * chunk starts. That ordering is the point of the method - deleting everything first
 * and sweeping afterwards is exactly the failure it exists to prevent.
 *
 * @methodGroup Reclamation
 * @namedParams
 * @param {Array<string | Object>} objects - Object IDs, or {objectId, libraryId}
 * @param {boolean=} cleanUpIndexes=true - Sweep each affected owner's index
 * @param {number=} maxDeadEntriesPerSweep - Objects deleted between sweeps. Defaults to
 * what the current block gas limit allows
 * @param {number=} concurrency=8 - Objects deleted at once within a chunk
 * @param {boolean=} dryRun=false - Report the plan, including chunking, and change nothing
 * @param {function=} onProgress - Called as ({phase, objectId, owner, done, total})
 *
 * @returns {Promise<Object>} - {deleted, failed, sweeps, transactions, dryRun}
 */
exports.DeleteContentObjectBatch = async function({
  objects,
  cleanUpIndexes = true,
  maxDeadEntriesPerSweep,
  concurrency = DEFAULT_CONCURRENCY,
  dryRun = false,
  onProgress
}) {
  ValidatePresence("objects", objects);

  if(!Array.isArray(objects)) { throw Error("objects must be an array"); }

  const resolved = await ResolveObjects({client: this, objects, concurrency});
  const usable = resolved.filter(entry => !entry.error);
  const failed = resolved.filter(entry => entry.error)
    .map(entry => ({objectId: entry.objectId, status: "failed", reason: entry.error}));

  // The owner has to be read before the object is destroyed - afterwards there is no
  // contract to ask. Grouping by wallet is what lets each index be swept once
  const owned = await this.utils.LimitedMap(concurrency, usable, async entry => {
    try {
      const owner = await this.ContentObjectOwner({objectId: entry.objectId});
      const wallet = await ResolveWallet({client: this, contractAddress: owner});

      return {...entry, owner, wallet};
    } catch(error) {
      return {...entry, owner: undefined, wallet: undefined};
    }
  });

  const byWallet = {};
  owned.forEach(entry => {
    const key = entry.wallet || "unowned";
    if(!byWallet[key]) { byWallet[key] = []; }
    byWallet[key].push(entry);
  });

  const chunkSize = maxDeadEntriesPerSweep || await SweepBudget({client: this});

  this.Log(
    `Deleting ${usable.length} object(s) across ${Object.keys(byWallet).length} index(es), ` +
    `${chunkSize} per sweep${dryRun ? " (dry run)" : ""}`
  );

  const deleted = [];
  const errors = failed.slice();
  const sweeps = [];
  let transactions = 0;
  let done = 0;

  for(const wallet of Object.keys(byWallet)) {
    const entries = byWallet[wallet];
    const sweepable = cleanUpIndexes && wallet !== "unowned";
    const chunks = sweepable ? Chunk(entries, chunkSize) : [entries];

    for(const chunk of chunks) {
      if(dryRun) {
        chunk.forEach(entry => deleted.push({
          objectId: entry.objectId,
          libraryId: entry.libraryId,
          owner: entry.owner,
          wallet: entry.wallet,
          status: "planned"
        }));

        if(sweepable) {
          sweeps.push({contractAddress: wallet, objects: chunk.length, status: "planned"});
        }

        done += chunk.length;
        continue;
      }

      const chunkResults = await this.utils.LimitedMap(concurrency, chunk, async entry => {
        try {
          await this.DeleteContentObject({libraryId: entry.libraryId, objectId: entry.objectId});

          return {
            objectId: entry.objectId,
            libraryId: entry.libraryId,
            owner: entry.owner,
            wallet: entry.wallet,
            status: "deleted"
          };
        } catch(error) {
          return {objectId: entry.objectId, libraryId: entry.libraryId, status: "failed", reason: error.message};
        } finally {
          done += 1;
          if(onProgress) {
            onProgress({phase: "delete", objectId: entry.objectId, owner: wallet, done, total: usable.length});
          }
        }
      });

      chunkResults.forEach(result => {
        if(result.status === "failed") {
          errors.push(result);
        } else {
          // Counted per confirmed delete - a failure may or may not have reached the
          // chain, so attributing a transaction to it would overstate the total
          transactions += 1;
          deleted.push(result);
        }
      });

      if(!sweepable) { continue; }

      // Awaited and verified, before the next chunk adds more dead entries
      if(onProgress) { onProgress({phase: "sweep", owner: wallet, done, total: usable.length}); }

      try {
        const debt = await this.AccessIndexDebt({contractAddress: wallet});

        if(!debt.sweepable) {
          sweeps.push({
            contractAddress: wallet,
            status: "skipped",
            reason: `${debt.dead} dead entries exceeds the ${debt.maxSweepable} a sweep can remove in one block`,
            dead: debt.dead,
            maxSweepable: debt.maxSweepable
          });

          continue;
        }

        const result = await this.ObjectCleanup({
          contractAddress: wallet,
          objectTypeToClean: "content_object"
        });
        transactions += 1;

        const lengths = (result[wallet] || result[this.utils.FormatAddress(wallet)] || {});
        const before = (lengths.beforeCleanup || {}).contentObjectsLength;
        const after = (lengths.afterCleanup || {}).contentObjectsLength;

        sweeps.push({
          contractAddress: wallet,
          status: "swept",
          dead: debt.dead,
          before,
          after,
          removed: (before === undefined || after === undefined) ? undefined : before - after
        });
      } catch(error) {
        sweeps.push({contractAddress: wallet, status: "failed", reason: error.message});
      }
    }
  }

  return {deleted, failed: errors, sweeps, transactions, dryRun};
};
