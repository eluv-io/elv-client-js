/**
 * Generate an Editor Signed Access Token (ESAT)
 *
 * ESAT tokens can be content-based or policy-based.
 * - content-based tokens are specifically for one content
 * - policy-based tokens can give permissions to a list of content objects and can specifically
 *   restrict access to playout offerings, files, metadata subtrees and /rep calls
 */
const { ElvClient } = require("../src/ElvClient");

const yargs = require("yargs");
const argv = yargs
.option("object-id", {
  description: "Object ID to give access to",
  type: "string"
})
.option("subject", {
  description: "Subject (user) of the token",
  type: "string"
})
.demandOption(
  ["subject"],
  "\nUsage: PRIVATE_KEY=<private-key> node GenerateEditorSignedAccessToken.js --subject <sub> --object-id <qid>\n"
)
.strict().argv;

const sampleContext = {
  usr: {
    email: 'jane@example.com',
    tags: ["000", "001"]
  },
  authorized_offerings: [
    "default",
    "default_clear"
  ],
  authorized_qids: [
    "iq__2LUxseAk7qkZ5t5XFNWE45vBmwhZ"
  ],
  authorized_meta: [
    "/offerings/default"
  ],
  authorized_reps: [
    "playout",
    "image",
    "thumbnails",
    "media_download"
  ]
};

const GenerateEditorSignedAccessToken = async ({objectId, subject}) => {
  const client = await ElvClient.FromNetworkName({networkName: "main"});

  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });

  client.SetSigner({signer});

  var tok = await client.CreateSignedToken({
    objectId,
    subject,
    duration: 30 * 86400000 // 1 month
    //policyId,
    //context,
  });
  console.log(tok);
  return tok;
}

GenerateEditorSignedAccessToken({objectId: argv["object-id"], subject: argv.subject});

