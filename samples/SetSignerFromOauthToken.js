#!/usr/bin/env node

/**
 * Sample: SetSignerFromOauthToken
 *
 * Authenticates an ElvClient using an OAuth ID token obtained from an external
 * identity provider. The KMS exchanges the token for a private key that becomes
 * the client's signer.
 *
 * Prerequisites:
 *  - configUrl pointing to a network that has a KMS registered for trustAuthorityId
 *  - A valid OAuth ID token (JWT) issued by the trusted OAuth provider
 *
 * Usage:
 *   node samples/SetSignerFromOauthToken.js \
 *     --config-url https://demov3.net955210.contentfabric.io/config \
 *     --trust-authority-id ikms... \
 *     --oauth-token "<jwt>"
 */

const { ElvClient } = require("../src/ElvClient");
const yargs = require("yargs");

const argv = yargs
  .option("config-url", {
    type: "string",
    description: "Fabric configuration URL",
    demandOption: true,
  })
  .option("trust-authority-id", {
    type: "string",
    description: "KMS trust authority ID (ikms...)",
    demandOption: true,
  })
  .option("oauth-token", {
    type: "string",
    description: "OAuth ID token (JWT) from the identity provider",
    demandOption: true,
  })
  .help()
  .argv;

async function main() {
  const client = await ElvClient.FromConfigurationUrl({
    configUrl: argv["config-url"],
    trustAuthorityId: argv["trust-authority-id"],
  });

  console.log("Client initialized. Setting signer from OAuth token...");

  await client.SetSignerFromOauthToken({ token: argv["oauth-token"] });

  const walletAddress = await client.userProfileClient.WalletAddress();
  console.log("Signer set successfully.");
  console.log("Wallet address:", walletAddress);

  // Example: list libraries accessible with this signer
  const libraries = await client.ContentLibraries();
  console.log(`Accessible libraries (${libraries.length}):`, libraries);
}

main().catch(err => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
