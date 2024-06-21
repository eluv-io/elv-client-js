const UrlJoin = require("url-join");

const {ValidateParameters} = require("./Validation");

const ContentObjectAudit = {
  async AuditContentObject({client, libraryId, objectId, versionHash, salt, samples, live=false}) {
    ValidateParameters({libraryId, objectId, versionHash});

    if(versionHash) { objectId = client.utils.DecodeVersionHash(versionHash).objectId; }

    let queryParams = {salt, samples};
    if(live) {
      queryParams.now = Date.now();
    }
    let path = UrlJoin("q", versionHash || objectId, live ? "call/live/audit" : "audit");

    let responses = await client.HttpClient.RequestN({
      headers: await client.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
      queryParams: queryParams,
      method: "GET",
      path: path
    });

    let auditHash, verified;
    let audits = [];
    for(response of responses) {
      let url = new URL(response.url);
      let res = await client.utils.ResponseToJson(response);
      let audit = { host: url.hostname };
      if(!response.ok) {
        audit.error = res;
      } else {
        if(auditHash === undefined) {
          auditHash = res.audit_hash;
        } else if(res.audit_hash !== auditHash) {
          verified = false;
        } else if(verified === undefined) {
          verified = true;
        }
        audit.audit_hash = res.audit_hash;
      }
      audits.push(audit);
    }
    verified = verified || false;
    
    return {
      verified,
      audits,
    };
  },
};

module.exports = ContentObjectAudit;
