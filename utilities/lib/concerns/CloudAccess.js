const {CredentialSetModel} = require("../models/CredentialSet");
const {NewOpt} = require("../options");

const JSON = require("./JSON");

const blueprint = {
  name: "CloudAccess",
  concerns: [JSON],
  options: [
    NewOpt("credentials", {
      descTemplate: "Path to JSON file containing credential sets for files stored in cloud",
      group: "Cloud",
      normalize: true,
      type: "string"
    })
  ]
};

const New = context => {
  const J = context.concerns.JSON;

  const access = (errOnMissing = true) => {
    let credentialSet;
    if(context.args.credentials) {
      credentialSet = J.parseFile(context.args.credentials);
      // validate
      CredentialSetModel(credentialSet);
    } else {
      if(!context.env.AWS_REGION || !context.env.AWS_BUCKET || !context.env.AWS_KEY || !context.env.AWS_SECRET) {
        if(errOnMissing) {
          throw Error("Missing required S3 environment variables: AWS_REGION AWS_BUCKET AWS_KEY AWS_SECRET");
        }
      } else {
        credentialSet = [
          {
            path_matchers: [".*"],
            remote_access: {
              protocol: "s3",
              platform: "aws",
              path: context.env.AWS_BUCKET + "/",
              storage_endpoint: {
                region: context.env.AWS_REGION
              },
              cloud_credentials: {
                access_key_id: context.env.AWS_KEY,
                secret_access_key: context.env.AWS_SECRET
              }
            }
          }
        ];
      }
    }
    return credentialSet;
  };

  return {access};
};

module.exports = {blueprint, New};