// Query the published content of a tenant using the Fabric content index

const {NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const ArgOutfile = require("./lib/concerns/ArgOutfile");

// Joined into a single cell so the table keeps a stable, readable width
const Join = value => Array.isArray(value) ? value.join(", ") : value;

const FlattenMap = obj =>
  Object.entries(obj || {}).map(([k, v]) => `${k}=${v}`).join(", ");

class TenantContent extends Utility {
  blueprint() {
    return {
      concerns: [Client, ArgOutfile],
      options: [
        NewOpt("tenantId", {
          descTemplate: "Tenant to query (should start with 'iten'). Defaults to the tenant of the current user",
          type: "string"
        }),
        NewOpt("filter", {
          descTemplate: "Filter expression(s) '<field>:<comparator>:<value>', combined with AND. " +
            "Reserved fields: tag, group, unique_group.id, unique_group.type, lib/library (eq only), " +
            "created_block_time. Any other name is a query field - prefix with 'qf.' to disambiguate. " +
            "Comparators: co (or ::), nc, eq, ne, lt, le, gt, ge. " +
            "e.g. --filter 'tag:eq:elv:media:live_stream' 'qf.date:ge:2026-09-01'",
          string: true,
          type: "array"
        }),
        NewOpt("sortBy", {
          descTemplate: "Query field name to sort by (not a metadata path). Only one may be given. " +
            "Also restricts results to objects that have the field",
          type: "string"
        }),
        NewOpt("sortDescending", {
          descTemplate: "Sort in descending order",
          type: "boolean"
        }),
        NewOpt("include", {
          descTemplate: "Index data to return with each result: tags, groups, uniquegroups, fields, " +
            "type, name, all, none. Defaults to query fields only",
          string: true,
          type: "array"
        }),
        NewOpt("select", {
          descTemplate: "Metadata subtree path(s) to include in each result. If omitted, no metadata is retrieved",
          string: true,
          type: "array"
        }),
        NewOpt("remove", {
          descTemplate: "Metadata subtree path(s) to omit from each result. Only has an effect with --select",
          string: true,
          type: "array"
        }),
        NewOpt("start", {
          descTemplate: "Index of the first object to retrieve",
          type: "number"
        }),
        NewOpt("limit", {
          descTemplate: "Maximum number of objects to return. Fabric default 100, capped at 998",
          type: "number"
        })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const client = await this.concerns.Client.get();

    const {
      tenantId, filter, sortBy, sortDescending, include, select, remove, start, limit
    } = this.args;

    const response = await client.TenantContent({
      tenantId,
      filter,
      sortBy,
      sortDescending,
      include,
      select,
      remove,
      start,
      limit
    });

    const versions = response.versions || [];

    logger.data("versions", versions);
    logger.data("paging", response.paging);
    logger.log(`Found ${versions.length} object(s)`);

    if(this.args.outfile) {
      this.concerns.ArgOutfile.writeJson({obj: response});
      return;
    }

    // Only show columns that at least one result actually has
    const rows = versions.map(v => {
      const row = {object_id: v.id, hash: v.hash};
      if(v.name !== undefined) row.name = v.name;
      if(v.last_modified_at !== undefined) row.last_modified_at = v.last_modified_at;
      if(v.query_fields !== undefined) row.query_fields = FlattenMap(v.query_fields);
      if(v.tags !== undefined) row.tags = Join(v.tags);
      if(v.groups !== undefined) row.groups = Join(v.groups);
      if(v.unique_groups !== undefined) row.unique_groups = FlattenMap(v.unique_groups);
      if(v.error) row.error = v.error;
      return row;
    });

    if(rows.length > 0) {
      logger.logTable({list: rows});
    } else {
      logger.warn("No content matched the query.");
    }

    if(response.paging) {
      const {items, limit: pageLimit, current} = response.paging;
      logger.log(`Showing ${current || 0}-${(current || 0) + versions.length} of ${items} (page size ${pageLimit})`);
    }
  }

  header() {
    return `Query content for tenant ${this.args.tenantId || "of current user"}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(TenantContent);
} else {
  module.exports = TenantContent;
}
