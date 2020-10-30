const fs = require("fs");
const { performance } = require("perf_hooks");
const ClientConfiguration = require("../TestConfiguration");

const Tests = {
  Utils: require("./Utils.test"),
  Wallet: require("./ElvWallet.test"),
  FrameClient: require("./FrameClient.test"),
  UserProfileClient: require("./UserProfileClient.test"),
  ElvClient: require("./ElvClient.test"),
  PermissionsClient: require("./PermissionsClient.test")
};

const RunTests = async () => {
  console.log(`\nUsing Configuration URL '${process.env["CONFIG_URL"] || ClientConfiguration["config-url"]}'\n`);

  let keys = Object.keys(Tests);

  if(process.argv.length > 2) {
    keys = keys.filter(key => process.argv.includes(key));
  }

  let stats = {};
  let count = {
    passed: 0,
    failed: 0,
    skipped: 0,
    suites: {}
  };

  const startTime = performance.now();
  for(let i = 0; i < keys.length; i++) {
    const suiteStartTime = performance.now();
    try {
      console.log(`\n== Running Test Suite: ${keys[i]} ==`);
      stats[keys[i]] = await Tests[keys[i]]();

      const passed = stats[keys[i]].passed.length;
      const failed = stats[keys[i]].failed.length;
      const skipped = stats[keys[i]].skipped.length;

      count.suites[keys[i]] = {
        passed,
        failed,
        skipped
      };

      count.passed += passed;
      count.failed += failed;
      count.skipped += skipped;

      const time = (performance.now() - suiteStartTime) / 1000;
      console.log(`== Test Suite ${keys[i]} Finished in ${time.toFixed(1)}s: ${passed} Passed, ${failed} Failed, ${skipped} Skipped ==`);
    } catch(error) {
      console.error(`!== Test suite failure: ${keys[i]} ==!`);
      console.error(error);
    }
  }

  console.log();

  const time = (performance.now() - startTime) / 1000;
  console.log(`==== All test suites finished in ${time.toFixed(1)}s: ${count.passed} Passed, ${count.failed} Failed, ${count.skipped} Skipped ====\n`);

  stats.results = count;

  fs.writeFileSync("TestResults.json", JSON.stringify(stats, null, 2));

  process.exit();
};

RunTests();
