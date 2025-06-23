// code related to tenant

const Tenant = require("./Tenant");

const blueprint = {
  name: "ArgTenant",
  concerns: [Tenant],
  options: []
};

const New = context => {
  const tenantInfo = async () => await context.concerns.Tenant.info();

  // instance interface
  return {
    tenantInfo
  };
};

module.exports = {
  blueprint,
  New
};
