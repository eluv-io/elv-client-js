// This file supplies settings for running tests in /utilities/tests/integration
//
// Your working copy of this file must be given a name ending in ".ignore.js", e.g. "demo-node-1.test-vars.ignore.js"

const vars = {

  defaults: {include_presets: ["client", "tenant"]},

  presets: {

    client: {ethContractTimeout: "20"}, // value in seconds

    tenant: {
      // Demo network: https://demov3.net955210.contentfabric.io/config
      // Production network: https://main.net955305.contentfabric.io/config
      // Local development node: http://localhost:8008/config?qspace=dev&self
      FABRIC_CONFIG_URL: "http://localhost:8008/config?qspace=dev&self",

      PRIVATE_KEY: "your-private-key", // 0x...

      admin_group_address: "your-content-admins-group-address", // 0x... contract address for 'Content Admins' access group
      master_lib_id: "your-master-lib-id", // should start with 'ilib'
      master_type: "your-master-content-type", // should start with 'iq__'
      mez_lib_id: "your-mez-lib-id", // should start with 'ilib'
      mez_type: "your-mez-content-type" // should start with 'iq__'
    },

    drm: {lib_drm_cert: "MIIExzCCA6+gAwIBAgIIHyfkXhxLHC4wDQYJKoZIhvcNAQEFBQAwfzELMAkGA1UEBhMCVVMxEzARBgNVBAoMCkFwcGxlIEluYy4xJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MTMwMQYDVQQDDCpBcHBsZSBLZXkgU2VydmljZXMgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwHhcNMjAwOTEyMDMzMjI0WhcNMjIwOTEzMDMzMjI0WjBgMQswCQYDVQQGEwJVUzETMBEGA1UECgwKRWx1dmlvIEluYzETMBEGA1UECwwKMktIOEtDM01NWDEnMCUGA1UEAwweRmFpclBsYXkgU3RyZWFtaW5nOiBFbHV2aW8gSW5jMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDslbBURB6gj07g7VrS7Ojixe7FNZOupomcZt+mtMvyavjg7X7/T4RccmKUQxOoMLKCJcQ6WrdHhIpN8+bciq7lr0mNzaN467zREiUNYOpkVPi13sJLieY2m2MEPOQTbIl52Cu1YyH+4/g1dKPmeguSnzZRo36jsCGHlJBjHq0jkQIDAQABo4IB6DCCAeQwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBRj5EdUy4VxWUYsg6zMRDFkZwMsvjCB4gYDVR0gBIHaMIHXMIHUBgkqhkiG92NkBQEwgcYwgcMGCCsGAQUFBwICMIG2DIGzUmVsaWFuY2Ugb24gdGhpcyBjZXJ0aWZpY2F0ZSBieSBhbnkgcGFydHkgYXNzdW1lcyBhY2NlcHRhbmNlIG9mIHRoZSB0aGVuIGFwcGxpY2FibGUgc3RhbmRhcmQgdGVybXMgYW5kIGNvbmRpdGlvbnMgb2YgdXNlLCBjZXJ0aWZpY2F0ZSBwb2xpY3kgYW5kIGNlcnRpZmljYXRpb24gcHJhY3RpY2Ugc3RhdGVtZW50cy4wNQYDVR0fBC4wLDAqoCigJoYkaHR0cDovL2NybC5hcHBsZS5jb20va2V5c2VydmljZXMuY3JsMB0GA1UdDgQWBBR4jerseBHEUDC7mU+NQuIzZqHRFDAOBgNVHQ8BAf8EBAMCBSAwOAYLKoZIhvdjZAYNAQMBAf8EJgFuNnNkbHQ2OXFuc3l6eXp5bWFzdmdudGthbWd2bGE1Y212YzdpMC4GCyqGSIb3Y2QGDQEEAQH/BBwBd252bHhlbGV1Y3Vpb2JyZW4yeHZlZmV6N2Y5MA0GCSqGSIb3DQEBBQUAA4IBAQBM17YYquw0soDPAadr1aIM6iC6BQ/kOGYu3y/6AlrwYgAQNFy8DjsQUoqlQWFuA0sigp57bTUymkXEBf9yhUmXXiPafGjbxzsPF5SPFLIciolWbxRCB153L1a/Vh2wg3rhf4IvAZuJpnml6SSg5SjD19bN+gD7zrtp3yWKBKuarLSjDvVIB1SoxEToBs3glAEqoBiA2eZjikBA0aBlbvjUF2gqOmZjZJ7dmG1Tos2Zd4SdGL6ltSpKUeSGSxyv41aqF83vNpymNJmey2t2kPPtC7mt0LM32Ift3AkAl8Za9JbV/pOnc95oAfPhVTOGOI+u2BuB2qaKWjqHwkfqCz4A"},

    ingest: {title: "Test video ingest"},

    ingest_master: {
      include_presets: ["ingest", "use_master_lib", "use_master_type"]
    },

    ingest_master_local: {
      include_presets: ["ingest_master"],
      files: "$ELV_CLIENT_DIR/test/files/Video.mp4"
    },

    ingest_mez: {
      include_presets: ["ingest", "use_mez_lib", "use_mez_type"],
      abrProfile: "$ELV_CLIENT_DIR/utilities/example_files/abr_profile_clear_store_unencrypted.json"
    },

    s3: {
      AWS_BUCKET: "your-bucket-name",
      AWS_KEY: "yourAwsKey", // AK...
      AWS_REGION: "region-name", // e.g. us-west-1
      AWS_SECRET: "yourAwsSecret",
    },

    s3_remove: {
      AWS_BUCKET: null,
      AWS_KEY: null,
      AWS_REGION: null,
      AWS_SECRET: null
    },

    // set --libraryId to final value of "master_lib_id"
    use_master_lib: {libraryId: "$master_lib_id"},

    // set --type to final value of "master_type"
    use_master_type: {type: "$master_type"},

    // set --libraryId to final value of "mez_lib_id"
    use_mez_lib: {libraryId: "$mez_lib_id"},

    // set --type to final value of "mez_type"
    use_mez_type: {type: "$mez_type"}
  }
};

module.exports = vars;
