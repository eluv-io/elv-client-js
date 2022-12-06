##elv-client-js/utilities
### INTEGRATION TESTS

These test are designed to run against a fabric node.

#### PREPARATION
  * Create a copy of `sample.test-vars.js`
    * The copy's file name must end in `.ignore.js`, e.g. `demoNode1.test-vars.ignore.js` (this is to prevent accidentally committing this file to the `elv-client-js` GitHub repository)
    * For convenience, the copy can be in the same directory as `sample.test-vars.js`
  * Edit your copy and fill in values for the entries your test(s) will be using, e.g. `/presets/tenant/PRIVATE_KEY` and `/presets/tenant/FABRIC_CONFIG_URL`.  

#### RUNNING A TEST FROM COMMAND LINE

Note that some tests require additional information passed in at runtime. For example, `create_mez.test.js` needs to have `masterHash` passed in (unless you hard code it by adding `masterHash` to your test-vars file, but this is not recommended).

Change the current directory to the integration test directory, e.g.: 

```shell
    cd elv-client-js/utilities/tests/integration
```
Use `node` to execute `RunTest.js`, passing in:
  * test name (omit the `.test.js` portion of filename)
  * path to your copy of the test-vars file
  * (if needed) a JSON string containing additional variables for the test (can also contain overrides to the variables the test normally uses)

Example: (no additional variables needed)
```shell
    node RunTest.js \
      create_master_local \
      ./demoNode1.test-vars.ignore.js
```

Example: (passing in additional variable to use for `--masterHash`)
```shell
    node RunTest.js \
      create_mez \
      ./demoNode1.test-vars.ignore.js \
      '{"masterHash":"hq__MCtvLQ7z1QQseieLZC3fFLZKcudAJkreRGVZ5F21DBcihoN9c4ypDaMNApUp73F9uFXQg2kq2E"}'
```

If the test fails, your environment's exit code (`$?` in bash/zsh, `%errorlevel%` in Windows) will be set to 1, otherwise it will be set to 0.

#### TROUBLESHOOTING YOUR test-vars FILE

You can print out a resolved copy of your test variables (with all `include_presets` entries expanded and merged) by passing your file path to `PrintVars.js`, e.g.:

```shell
    cd elv-client-js/utilities/tests/integration
    
    node PrintVars.js ./demoNode1.test-vars.ignore.js
```

### THE test-vars FILE

These files hold sets of values to pass to tests in `/elv-client-js/utilities/tests/integration`

Your working copy of the file must be given a name ending in `.ignore.js`, e.g. `demo-node-1.test-vars.ignore.js`.

#### STRUCTURE AND FORMAT

There are only 2 top level keys allowed:

 * `defaults` - Contains a group of values that are supplied to all tests.
 * `presets` - Contains groups of values that can be included in `defaults` or used by individual tests.
Preset names (the keys) can be any string except `"defaults"`, `"presets"`, or `"include_presets"`.
By convention, they should use _snake_case_ (all lower case, with underscores separating words).

The `defaults` section and each **preset** define a set of **variables** and their values.

For example, the `"ingest"` preset contains 1 variable `"title"`, with value `"Test video ingest"`:
```js
{
  presets: {
    ...
    ingest: {title: "Test video ingest"},
    ...
  }
}
```

A test can choose to include this preset, and then if it executes a utility script that has a `--title` command line
option it can automatically be set to `"Test video ingest"`.

#### VARIABLES

Variables cannot be named `"defaults"`, `"presets"`, or `"include_presets"`.

If a variable is meant to be passed automatically to a command line option, use the _lowerCamelCase_ form of that option
as the variable name (e.g. `"ethContractTimeout"`).

If a variable is named using _ALL_CAPS_SNAKE_CASE_ (e.g. `"PRIVATE_KEY"`) then it wll be automatically used to set an
environment variable of the same name.

Variables named using other cases (_PascalCase_, _kebab-case_, _snake_case_ etc.) will not automatically flow through to
command line options or environment variables, but allow storing many values to choose from for specific use cases.
For example, the `"tenant"` preset contains a variable named `"mez_lib_id"`, and its value specifies what library should be
used to hold mezzanine objects. Tests that create mezzanines can refer to this variable.

Variable values must be either strings or null. Even numeric and boolean values should be stored as strings (e.g. `"20"`, `"true"`).
A `null` value indicates that the variable should not be used, and this
allows overriding defaults or selectively removing some items from a preset after including it.

#### THE include_presets "VARIABLE"

Any **preset** can include other presets by listing them in an array under the special name `"include_presets"`. For example,
the `"ingest_master"` preset includes 3 other presets, then the `"ingest_master_local"` preset builds on this by 
including `"ingest_master"` and then adding the variable `"files"`: 

```js
{
  presets: {
    ...
    ingest_master: {
      include_presets: ["ingest", "use_master_lib", "use_master_type"]
    },
    
    ingest_master_local: {
      include_presets: ["ingest_master"],
      files: "$ELV_CLIENT_DIR/test/files/Video.mp4"
    },
  ...
  }
}
```
This allows constructing a range of presets from the very general to the very specific presets for use by tests. 

The items in `"include_presets"` are processed in order. Variables in later items overwrite variables of the same name from earlier items.

Finally, any variables defined in a preset will overwrite any variable of the same name that came from an included preset. 
In the example above, if the `"ingest"` preset included a `"files"` variable, it would flow through to the
`"ingest_master_local"` preset but then get overwritten, and the `"ingest_master_local"` would use its own value
`"$ELV_CLIENT_DIR/test/files/Video.mp4"` instead.

The `"defaults"` section can also have an `"include_presets"` entry. 

Note the use of `$ELV_CLIENT_DIR` to refer to the root directory of `elv-client-js`. When the variables are loaded
by a test any instances of `"$ELV_CLIENT_DIR"` in variable values will be replaced by the appropriate path.

#### VARIABLE SUBSTITUTIONS

The substitution of `"$ELV_CLIENT_DIR"` is a special case. The test-vars file also supports defining values that include
other variables, by using `$` + variable name. 

**NOTE:** These `$variable_name`expressions have nothing to do with bash/zsh environment variables. Defining a value as `"$HOME"` will
not cause your home directory path to be substituted in.

For example, there is a preset named `"use_master_lib"` which has a `"libraryId"` variable that refers to another variable
named `"master_lib_id"`:
```js
{
  presets: {
    ...
    // set --libraryId to final value of "master_lib_id"
    use_master_lib: {libraryId: "$master_lib_id"},
    ...
  }
}
```
This is used to automatically funnel the value under `"master_lib_id"` to the `--libraryId` command line option.

This variable substitution is delayed until just before running one of the scripts in `/elv-client-js/utilities` and is done
after all other includes/overrides are resolved. Although `"master_lib_id"` is defined in the `"tenant"` preset, the final value
substituted for `"$master_lib_id"` may be different depending on what overrides were used by the test.

**NOTE:** In order to find the substitution variable it must exist in the set that is used by the test, i.e. one of the following must be true:
 * It is defined in `defaults` or one of the presets it includes
 * It is present (either directly defined, or indirectly included via `"include_presets"`) in one of the presets included by the test (in the test's `testVarPresets` static property)
 * It is supplied as an additional variable by the test itself (in the test's `testBody()` function)
 * It is supplied as an additional variable by whatever is executing the test (e.g. by passing in a JSON string to `RunTest.js`)

Failure to find the named substitution variable will cause an error. 

If you need a value to include a dollar sign, use 2 dollar signs in a row, these will be ignored by variable substitution
and converted to single dollar signs before running the utility script.

### USING VARIABLES IN TESTS

#### INCLUDING PRESETS

The simplest test just executes a single script in `/elv-client-js/utilities` to make sure it does not error out. The example 
below imports the `"ingest_master_local"` preset, which will get merged into the items defined by the `"defaults"` 
section of the test-vars file.

This provides all the information needed to run `/elv-client-js/utilities/ProductionMasterCreate.js`:

```js
const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static testVarPresets = ["ingest_master_local"];

  async testBody() {
    const assert = this.assert;
    const vars = this.vars;
    return await this.runUtility("ProductionMasterCreate", vars);
  }
}  
```

If you saved the above as `elv-client-js/utilities/tests/integration/create_master_local.test.js`, (and you had your
copy of the test-vars file saved as `elv-client-js/utilities/tests/integration/demoNode1.test-vars.ignore.js`) you could run it with:
```shell
cd elv-client-js/utilities/tests/integration

node RunTest.js \
  create_master_local \
  ./demoNode1.test-vars.ignore.js
```

#### OVERRIDING VALUES FROM test-vars FILE

_(to write)_


