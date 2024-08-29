const { ElvWalletClient } = require("../src/walletClient/index");
const fs = require('fs');
const { ElvClient } = require("../src/ElvClient");
const readline = require('readline');

const Tool = async () => {
    try {
        const configUrl = process.argv[2];
        const objectIdsFilePath = process.argv[3];

        if (!configUrl || !objectIdsFilePath) {
            console.error("Usage: node Tool.js <configUrl> <objectIdsFilePath>");
            return;
        }

        const client = await ElvClient.FromConfigurationUrl({ configUrl: configUrl });
        
        let wallet = client.GenerateWallet();

        let signer = wallet.AddAccount({
            privateKey: process.env.PRIVATE_KEY
        });
        
        client.SetSigner({ signer });

        client.ToggleLogging(false);

        async function readLines(filePath) {
            const fileStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            const lines = [];
            for await (const line of rl) {
                lines.push(line);
            }
            return lines;
        }

        const object_ids = await readLines(objectIdsFilePath);
        console.log(object_ids);

        const contractPromises = object_ids.map((object_id) => {
            return client.CallContractMethod({
                contractAddress: client.utils.HashToAddress(object_id),
                methodName: "setVisibility",
                methodArgs: [1],
            }).then(() => {
                console.log(`Successfully called contract method for object_id: ${object_id}`);
            });
        });

        await Promise.all(contractPromises);
        console.log("All contract methods have been successfully called.");
    }
    catch (error) {
        console.error("An error occurred:", error);
    }
}

Tool();
