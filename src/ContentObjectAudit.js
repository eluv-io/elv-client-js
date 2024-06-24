const UrlJoin = require("url-join");
const HttpClient = require("./HttpClient");
const UUID = require("uuid").v4;

const {ValidateParameters} = require("./Validation");

const ContentObjectAudit = {
  async AuditContentObject({client, libraryId, objectId, versionHash, salt, samples, live=false}) {
    if(!salt){
      salt = client.utils.B64(UUID());
    }

    if(!samples) {
      samples = [
        Math.random() * 0.33,
        Math.random() * 0.33 + 0.33,
        Math.random() * 0.33 + 0.66
      ];
    }

    // Ensure only a max of 3 samples
    samples = samples.slice(0, 3);

    if(versionHash) {
      objectId = client.utils.DecodeVersionHash(versionHash).objectId;
    }

    if(!libraryId) {
      libraryId = await client.ContentObjectLibraryId({objectId});
    }

    ValidateParameters({libraryId, objectId, versionHash});

    let queryParams = {salt, samples};


    if(live) {
      queryParams.now = Date.now();
    }

    // Test against the node the client is currently using, plus a batch of fresh nodes
    const uris = [
      client.HttpClient.uris[client.HttpClient.uriIndex],
      ...(await client.Configuration({
        configUrl: client.configUrl,
        clientIP: client.clientIP,
        region: client.region
      })).fabricURIs
    ]
      .filter((v, i, s) => s.indexOf(v) === i);

    const httpClient = new HttpClient({uris});

    let path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, live ? "call/live/audit" : "audit");
    let responses = await httpClient.RequestAll({
      headers: await client.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
      queryParams: queryParams,
      method: "GET",
      path
    });

    let auditHash, verified;
    let audits = [];
    for(const response of responses) {
      let url = new URL(response.url);
      let audit = { host: url.hostname };

      if(!response.ok) {
        audit.error = response;
        audit.errorMessage = response.message || JSON.stringify(response);
      } else {
        let res = await client.utils.ResponseToJson(response);
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
      salt,
      samples,
      audits,
    };
  },
};

module.exports = ContentObjectAudit;
