const fs = require("fs");

const Tests = {
  Utils: require("./Utils.test"),
  Wallet: require("./ElvWallet.test"),
  FrameClient: require("./FrameClient.test"),
  UserProfileClient: require("./UserProfileClient.test"),
  ElvClient: require("./ElvClient.test")
};

const RunTests = async () => {
  return new Promise(async resolve => {
    let keys = Object.keys(Tests);

    if(process.argv.length > 2) {
      keys = keys.filter(key => process.argv.includes(key));
    }

    let stats = {};

    for(let i = 0; i < keys.length; i++) {
      try {
        console.log("\nRunning Test Suite:", keys[i]);
        stats[keys[i]] = await Tests[keys[i]]();
      } catch(error) {
        console.error("Test suite failure:", keys[i]);
        console.error(error);
      }
    }

    fs.writeFileSync("TestResults.json", JSON.stringify(stats, null, 2));

    resolve();
  });
};

const promise = RunTests();

promise.then("DONE");
