const { NewOpt } = require("./lib/options");
const Utility = require("./lib/Utility");
const FabricObject = require("./lib/concerns/FabricObject");

class TestCreateFabricToken extends Utility {
    blueprint() {
        return {
            concerns: [FabricObject],
            options: [
                NewOpt("objectId", {
                    descTemplate: "Object ID to generate an access token for",
                    demand: true,
                    type: "string",
                }),
            ],
        };
    }

    header() {
        return "Test object-scoped authorization token";
    }

    async body() {
        const { objectId } = this.args;
        const client = await this.concerns.Client.get();

        const versionHash = await this.concerns.FabricObject.latestVersionHash({ objectId });

        const token = await client.CreateSignedToken({
            versionHash,
            duration: 60 * 60 * 1000, // 1 hour in milliseconds
        });

        console.log("\nGenerated token:");
        console.log(token);

        process.exit(0);
    }
}

if (require.main === module) {
    Utility.cmdLineInvoke(TestCreateFabricToken);
} else {
    module.exports = TestCreateFabricToken;
}
