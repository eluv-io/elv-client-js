const { ElvClient } = require("../src/ElvClient");
const { ElvWalletClient } = require("../src/walletClient/index");
const ClientConfiguration = require("../TestConfiguration.json");

const ethers = require("ethers");

const Test = async () => {
  try {
    /*
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});
*/
    const client2 = await ElvClient.FromNetworkName({
      networkName: "main"
    });

    const client = await ElvWalletClient.Initialize({
      network: "main",
      mode: "staging"
    });

    /*
    console.log(
      await client.AuthenticateOAuth({
        idToken,
        signerURIs: [
          "https://wlt.stg.svc.eluv.io"
        ]
      })
    );

     */

    await client.Authenticate({
      token: "DYxK5cLMW5ofVh3pU23TmbAzkpFAsYrQQLsantU3uHFCJgyAjNoRHE7HvSCbQzZx1F33JM65R6oWZ1ZLYPEUhfA3WrnN9emo69A6AAKyFNBecKSFn3T6PP5MxMMPZRwN6AgwmuRgZMJQthF1xo7cMUqVwZCXtdHARYSrTHoRe3QMPggd6EJ6MzK7WHv2Sb7MPGGyVCR8uC4mK9SbncNm77Fj4H2LWxQpQggnF579GWv3SwAYiUBhbtgnfw6WEzyo1ZmBTV8vSkMiDAyBoMC138nokWNZc6DkpBNkyn6z3GwszoPsdXezKv7vANEVF6rrD3odbjosJpRoWbeEoPkebjoVySTgU8ywJybCDzeoFcg2XC1FQ4nyBhv5o3UVyXWispw3hN7oNs65vt9DaXmXwy45HzG3vL7PNdK8qviBg5XttCHUxkQ2aeYXTXcUzBYJ34PgDTXPBUwrj7a5FBa3gyC42eu48DAyxaFtV6GC5SXJCczTgQW6DPTrXiwzyEkBbVCoyDbMepaAA5MWH5WmpeWWzuexbHhKd3qW2ukWMHyjJpwAy1aUMZXGrAx3eGjTTmev342DqsV8ECHw9zPuzKv7MufkU7A9N9Wgi6jWoZXZvbMySxuRo81CV7XQZ6Zvcfy2xXFbtu5rgYA1xxhZaGZBioMUgT3HwEo1eqJuvs7r1QW3t1mMx9zbAJDTJtHFsYu4nkvyrDHQwDgKvQmnzSDhUs7yxeKeVKeFi2wy4QkXz56VJKxp3CtB9gM8qMLP3eUg1B3BRaNH8uPmy7qVYn3wn9epwPA2fDwR6MbunU5C4kx7rTbZmiQtKW4VUVP8iL6MvVy6Wx3NEXCeTmaSDz2BAfkrv7zFmC9ERyeqfrPvCYDyeTV2PHA6vVmdh5cXo6meJWKCD6jc5QAd6J7D1hJw6PWP8gyUQZGtZ6Xd9v82v3cP1L6njMWc4kpivB41mUF7Q86Zy8EoZ2xYhFrU3MoUuNPV3ApVKRqUmcL4cpKhbcSCgPi8QvnhUCjZGyEtxLwzCaRhXa"
    })

    console.log(
      await client.PersonalSign({message: "test"})
    )
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

Test();
