require("colors");
const Lodash = require("lodash");
const { performance } = require("perf_hooks");
const ReadLine = require("readline");

// Incremental numerical IDs
let __id = 0;

class Id {
  static next(){
    __id++;
    return __id;
  }
}

const Log = (message, rewrite=false, color) => {
  if(color) { message = message[color]; }
  if(rewrite) {
    ReadLine.clearLine(process.stdout);
    ReadLine.cursorTo(process.stdout, 0);
  }

  process.stdout.write(message);
};

const mockCallback = (object, methodName) => {
  let calls = [];

  let originalFn;
  if(object && methodName) {
    originalFn = object[methodName];
  }

  let callback = async (...args) => {
    calls.push(args);

    if(originalFn) {
      return await originalFn.call(object, ...args);
    }
  };

  callback.calls = calls;

  callback.methodName = methodName || "Mock Function";

  return callback;
};

const spyOn = (object, methodName) => {
  if(!object[methodName]) {
    throw Error(`Can't spy on method ${methodName}: Method is missing`);
  }

  object[methodName] = mockCallback(object, methodName);
};

const expect = (value) => {
  const ops = {
    toBeDefined: () => value !== undefined,
    toBeTruthy: () => !!value,
    toBeFalsy: () => !value,
    toEqual: (otherValue) => Lodash.isEqual(value, otherValue),
    toMatchObject: (object) => Lodash.isMatch(value, object),
    toBeGreaterThan: (otherValue) => value > otherValue,
    toBeGreaterThanOrEqual: (otherValue) => value >= otherValue,
    toBeLessThan: (otherValue) => value < otherValue,
    toBeLessThanOrEqual: (otherValue) => value <= otherValue,
    toContain: (entry) => Lodash.includes(value, entry),
    toHaveBeenCalled: () => !!value.calls && value.calls.length > 0,
    toHaveBeenCalledTimes: (times) => !!value.calls && value.calls.length === times,
    toHaveBeenCalledWith: (args) => !!value.calls && !!value.calls.find(calledArgs => Lodash.isMatch(calledArgs, args))
  };

  const errorMessage = (opName, maybeOtherValue, not) =>
    `\n\n\tAssertion failed:\n\n\t\texpect(${typeof value === "function" ? value.methodName : JSON.stringify(value)}).${not ? "not." : ""}${opName}(${JSON.stringify(maybeOtherValue) || ""})\n`;

  const functions = {};
  Object.keys(ops).forEach(opName => {
    functions[opName] = (maybeOtherValue) => {
      let success = ops[opName](maybeOtherValue);

      if(!success) {
        throw Error(errorMessage(opName, maybeOtherValue));
      }
    };
  });

  const notFunctions = {};
  Object.keys(ops).forEach(opName => {
    notFunctions[opName] = (maybeOtherValue) => {
      let success = !ops[opName](maybeOtherValue);

      if(!success) {
        throw Error(errorMessage(opName, maybeOtherValue, true));
      }
    };
  });

  functions.not = notFunctions;

  return functions;
};

class TestSuite {
  constructor() {
    this.timeout = 240000;

    this.expect = expect;
    this.mockCallback = mockCallback;
    this.spyOn = spyOn;

    this.testList = [];
    this.describeBlocks = {};
    this.describeBlockTiming = {};

    this.currentDescribeBlocks = [];

    this.runTests = this.runTests.bind(this);
    this.describe = this.describe.bind(this);
    this.test = this.test.bind(this);
    this.skip = this.skip.bind(this);
    this.beforeAll = this.beforeAll.bind(this);
    this.afterAll = this.afterAll.bind(this);

    this.test.skip = this.skip;
  }

  async runTests() {
    let stats = {
      passed: [],
      skipped: [],
      failed: [],
      timing: {}
    };

    let currentDescribeBlocks = [];

    for(let i = 0; i < this.testList.length; i++) {
      const { name, f, describeBlocks, skip } = this.testList[i];

      if(!Lodash.isEqual(describeBlocks, currentDescribeBlocks)) {
        console.log();
        // Print headers for each new describe block we encounter
        describeBlocks.forEach((id, index) => {
          if(id === currentDescribeBlocks[index]) { return; }

          // Finish timing on old block
          if(currentDescribeBlocks[index]) {
            const time = (performance.now() - this.describeBlockTiming[currentDescribeBlocks[index]]) / 1000;
            Log(`\n${"\t".repeat(index)}${this.describeBlocks[currentDescribeBlocks[index]].name} (${time.toFixed(1)})s\n`);
          }

          // Start timing on new block
          this.describeBlockTiming[describeBlocks[index]] = performance.now();

          Log(`\n${"\t".repeat(index)}${this.describeBlocks[id].name}\n\n`);
        });
      }

      currentDescribeBlocks = describeBlocks;

      const tabs = "\t".repeat(currentDescribeBlocks.length);

      const outputDescribeBlocks = currentDescribeBlocks.map(id => this.describeBlocks[id]);

      if(skip) {
        Log(`${tabs}<SKIP> ${name}\n`, false, "yellow");
        stats.skipped.push({
          name,
          describeBlocks: outputDescribeBlocks,
          time: 0
        });
      } else {
        Log(`${tabs}${name}`, false, "cyan");

        const startTime = performance.now();

        try {
          let error;
          await Promise.race([
            f,
            new Promise(resolve =>
              setTimeout(
                () => { error = "Test timed out"; resolve(); },
                this.timeout
              )
            )
          ]);

          await f();

          if(error) {
            throw error;
          }

          const time = performance.now() - startTime;
          stats.passed.push({
            name,
            describeBlocks: outputDescribeBlocks,
            time
          });

          Log(`${tabs}${name} ✓   (${(time / 1000).toFixed(1)}s)\n`, true, "green");
        } catch(error) {
          let message;
          message = error.stack || error.message || error;

          const time = performance.now() - startTime;
          stats.failed.push({
            name,
            describeBlocks: outputDescribeBlocks,
            message,
            error,
            time
          });

          Log(`${tabs}<ERROR> ${name} ✗   (${(time / 1000).toFixed(1)}s)\n`, true, "red");

          console.log();
          console.log(message);
          console.log(JSON.stringify(error, null, 2));
          console.log("\n");
        }
      }
    }

    for(let i = currentDescribeBlocks.length - 1; i >= 0; i--) {
      const id = currentDescribeBlocks[i];
      const time = (performance.now() - this.describeBlockTiming[id]) / 1000;
      Log(`\n${"\t".repeat(i)}${this.describeBlocks[id].name} (${time.toFixed(1)})s\n`);
    }
    console.log();

    return stats;
  }

  describe(name, f) {
    const describeBlockId = Id.next();

    this.describeBlocks[describeBlockId] = {
      name
    };

    const originalTests = this.testList;
    this.testList = [];

    this.currentDescribeBlocks.push(describeBlockId);

    f();

    let newTests = this.testList;

    if(this.describeBlocks[describeBlockId].beforeAll) {
      newTests.unshift({
        name: "beforeAll",
        f: this.describeBlocks[describeBlockId].beforeAll,
        describeBlocks: [...this.currentDescribeBlocks]
      });
    }

    if(this.describeBlocks[describeBlockId].afterAll) {
      newTests.push({
        name: "afterAll",
        f: this.describeBlocks[describeBlockId].afterAll,
        describeBlocks: [...this.currentDescribeBlocks]
      });
    }

    this.testList = [
      ...originalTests,
      ...newTests
    ];

    this.currentDescribeBlocks.pop();
  }

  test(name, f) {
    this.testList.push({
      name,
      f,
      describeBlocks: [...this.currentDescribeBlocks]
    });
  }

  skip(name) {
    this.testList.push({
      name,
      skip: true,
      describeBlocks: [...this.currentDescribeBlocks]
    });
  }

  beforeAll(f) {
    const describeBlockId = this.currentDescribeBlocks.slice(-1).pop();

    if(this.describeBlocks[describeBlockId].beforeAll) {
      const name = this.describeBlocks[describeBlockId].name;
      throw Error("Multiple 'beforeAll' methods for " + name);
    }

    this.describeBlocks[describeBlockId].beforeAll = f;
  }

  afterAll(f) {
    const describeBlockId = this.currentDescribeBlocks.slice(-1).pop();

    if(this.describeBlocks[describeBlockId].afterAll) {
      const name = this.describeBlocks[describeBlockId].name;
      throw Error("Multiple 'afterAll' methods for " + name);
    }

    this.describeBlocks[describeBlockId].afterAll = f;
  }
}

module.exports = TestSuite;
