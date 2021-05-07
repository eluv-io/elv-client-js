const {expect} = require("chai");

const Result = require("crocks/Result");
const {Ok} = Result;

const {valOrThrow} = require("../../../lib/helpers");
const {EmptyWidgetData} = require("../../../lib/models/WidgetData");

const options = require("../../../lib/options");
const CloudFile = require("../../../lib/concerns/CloudFile");

describe("fConcernsReducer", () => {

  it("should return non-empty checksMap when given a concern that has checksMap", () => {
    const rAccWidget = Ok(EmptyWidgetData());
    const rResultWidget = options.fConcernsReducer(rAccWidget, CloudFile);
    const widget = valOrThrow(rResultWidget);
    const checksMap = widget.checksMap;
    expect(checksMap).to.not.be.empty;
  });

});


describe("optDef2YargsOpt", () => {

  it("should set string=true if type=='string'", () => {
    const blueprint = {
      name: "TestBlueprint",
      options: [
        options.NewOpt(
          "dummyOption",
          {
            descTemplate: "dummy string option",
            type:"string"
          })
      ]
    };

    const widgetData = options.BuildWidget(blueprint).data();

    expect(widgetData.yargsOptMap.dummyOption.string).to.be.true;
  });

});

// const {dumpJson, formattedInspect} = require("./helpers");
//
// const {_addStdOpt, BuildWidget, DelOpt, ModOpt, NewOpt, StdOpt} = require("./options");
//
// const Logger = require("./concerns/Logger");
// const Client = require("./concerns/Client");
//
// // TEST DATA
//
// // accumulatedOptionSpecs
// const accOptSpecs_Good = {
//   preExisting: {
//     descTemplate: "Already defined option",
//     type: "boolean"
//   }
// };
// const accOptSpecs_Bad_Format = {
//   preExisting: {
//     badAccOptSpecs: 3
//   }
// };
// const accOptSpecs = [accOptSpecs_Good, accOptSpecs_Bad_Format];
//
// // name
// const name_Good = "type";
// const name_Bad_Format = {bad_name_format: true};
// const name_Bad_NotStdOption = "unknownOption";
// const name_Bad_AlreadyAdded = "preExisting";
// const names = [name_Good, name_Bad_Format, name_Bad_NotStdOption, name_Bad_AlreadyAdded];
//
// // overrides
// const overrides_Good = {demand: true, descTemplate: "override for descTemplate"};
// const overrides_Bad_Format = "bad_format_overrides";
// const overrides_Bad_Property = {badOverrideProperty: true};
// const overrideSets = [overrides_Good, overrides_Bad_Format, overrides_Bad_Property];
//
// // expected results
// const happyPath = "Ok { preExisting: { descTemplate: \"Already defined option\", type: \"boolean\" }, type: { descTemplate: \"override for descTemplate\", type: \"string\", demand: true } }";
// const badOverrideFormat = "Err Error: Not a valid OptDefOverride: expecting Object, got String \"bad_format_overrides\" Unrecognized property name(s): 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19";
//
// const badOverrideProperty = "Err Error: Not a valid OptDefOverride: Unrecognized property name(s): badOverrideProperty";
// const badNameFormat =  "Err Error: Not a valid NonBlankString: expecting String, got Object { bad_name_format: true } assertion \"isNotBlank\" returned TypeError: str.trim is not a function for value { bad_name_format: true }";
// const badNameNotStd = "Err Error: \"unknownOption\" is not a standard option";
// const badNamePreexisting = "Err Error: \"preExisting\" already added";
// const badAccOptSpecFormat = "Err Error: Not a valid OptDefMap: assertion \"checkType\" returned false for value { preExisting: { badAccOptSpecs: 3 } }";
//
// const expectedResults = {
//   "000": happyPath,
//   "001": badOverrideFormat,
//   "002": badOverrideProperty,
//   "010": badNameFormat,
//   "011": badNameFormat,
//   "012": badNameFormat,
//   "020": badNameNotStd,
//   "021": badNameNotStd,
//   "022": badNameNotStd,
//   "030": badNamePreexisting,
//   "031": badNamePreexisting,
//   "032": badNamePreexisting,
//   "100": badAccOptSpecFormat,
//   "101": badAccOptSpecFormat,
//   "102": badAccOptSpecFormat,
//   "110": badAccOptSpecFormat,
//   "111": badAccOptSpecFormat,
//   "112": badAccOptSpecFormat,
//   "120": badAccOptSpecFormat,
//   "121": badAccOptSpecFormat,
//   "122": badAccOptSpecFormat,
//   "130": badAccOptSpecFormat,
//   "131": badAccOptSpecFormat,
//   "132": badAccOptSpecFormat
// };
//
// for(const [i, accOptSpec] of accOptSpecs.entries()) {
//   for(const [j, name] of names.entries()) {
//     for(const [k, overrides] of overrideSets.entries()) {
//       const result = _addStdOpt(accOptSpec, name, overrides);
//       const actual = formattedInspect(result);
//       const expected = expectedResults[`${i}${j}${k}`];
//       // eslint-disable-next-line no-console
//       console.log(i, j, k, actual === expected ? " PASS" : ` FAIL - got: ${actual}\n     expected: ${expected}`);
//     }
//   }
// }
//
// const testScriptSpec = {
//   concerns: [Logger, Client],
//   options: [
//     StdOpt("description", {forX: "new library"}),
//     StdOpt("name", {
//       demand: true,
//       forX: "new library"
//     }),
//     StdOpt("type"),
//     NewOpt("reverse", {
//       descTemplate: "print output backwards"
//     }),
//     ModOpt("reverse", {
//       descTemplate:"sdrawkcab tuptuo tnirp"
//     }),
//     DelOpt("elvGeo")
//   ]
// };
//
// const compiled = BuildWidget(testScriptSpec);
// dumpJson(compiled.data());