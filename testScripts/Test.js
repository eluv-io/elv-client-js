const { ElvClient } = require("../src/ElvClient");
const fs = require("fs");
const ClientConfiguration = require("../TestConfiguration.json");
if(typeof Buffer === "undefined") { Buffer = require("buffer/").Buffer; }

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"],
      trustAuthorityId: "ikms2s41ivY1BDJ8K5PJyAtTtJZQcHZ"
    });

    const token = "eyJraWQiOiJ1MjIxQXZsLV9vTU1PQTlzRWQ0WlQ1NkVlaTExa1IxSFU1eTZTY3FJS2JVIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHV6bWpwc0JsbTcyS09vSDR4NSIsIm5hbWUiOiJLZXZpbiBUYWxtYWRnZSIsImVtYWlsIjoia2V2aW4udGFsbWFkZ2VAZWx1di5pbyIsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly9kZXYtODI3NDE1Lm9rdGEuY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiMG9hMTA1NGlkNGZaQ2UydWQ0eDYiLCJpYXQiOjE1ODQzODM4OTEsImV4cCI6MTU4NDM4NzQ5MSwianRpIjoiSUQuWHBBaktXUDVwSUxYMVBDSXRWc1l2eTB0R0FSMU9iZ21wbFJNdjdnMno5SSIsImFtciI6WyJwd2QiXSwiaWRwIjoiMDBvb3hpa2w2MHlRdDhXMXU0eDUiLCJub25jZSI6IjFzSmxFZmxnd3FuWEZSMlE1NDBBVFFTVG5RZ3BaWmVKOFpMVHc2MGJqcGUwMUs2bFB4dWxITVVFVjBJMHNJV3YiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJrZXZpbi50YWxtYWRnZUBlbHV2LmlvIiwiYXV0aF90aW1lIjoxNTg0MzgzODg0LCJhdF9oYXNoIjoibkNtRUpTOU4xdzIydWo2RFRhcVNzZyIsImdyb3VwcyI6WyJFdmVyeW9uZSIsIkNvb2wgUGVvcGxlIl0sInNwYWNlX2lkIjoiaXNwYzJ6cWE0Z1o4TjNESDFRV2FrUjJlNVVvd0RMRjEifQ.BIl4ihIl8zzRjypswCpg3MHhD-xzUFPJNQQfpAza2O6G_teH5TkxTVPZU_vwifhUFm2AN3yOCiIu5tVlvMSWGReXBqKehPJfBcpwoSDtbyS8TiDB_fyD-eMn7Kvmj7JudZaw45E9vM1laH9PHQLrtVVg5FKYeKj3JvisL7wGdZnnds2Xijh0Wl73VJJdDPlAuHGdh3Vrpiyay9fV6fSmzkqkN88FzABC1rzRtAcMM6dQQ6CKApkNUW9gAdwWunaD0ahHUXtOI5IMY2T1jSUKNSV0U78MAO4eQfYQ4T428ruvQ41DuDBtqudMuufT0oS0mVBjyYG98oNnq0cA3m0iPg";

    client.ToggleLogging(true);
    await client.SetSignerFromOauthToken({token});

    console.log(
      await client.ContentLibraries()
    );

    /*
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    console.log(
      await client.authClient.KMSInfo({
        kmsId: "ikms2s41ivY1BDJ8K5PJyAtTtJZQcHZ"
      })
    );

     */
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }
};

Test();
