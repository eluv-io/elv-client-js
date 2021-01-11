const {expect} = require("chai");

const {loadFixture} = require("../../../helpers/fixtures");
const {concern, concern2utility} = require("../../../helpers/concerns");
const {removeElvEnvVars} = require("../../../helpers/params");

removeElvEnvVars();

const LRO = concern("LRO");

describe("LRO.statusMapProcess()", () => {

  it(`should set run_state to ${LRO.STATE_BAD_PCT} if finished but progress < 100%`, () => {
    const lroUtility = concern2utility(LRO, []);
    const statusMap = loadFixture("lro.status.finished.too.few.parts.fixture.json");
    const revisedMap = lroUtility.concerns.LRO.statusMapProcess(statusMap);
    for(const key of Object.keys(revisedMap)) {
      expect(revisedMap[key].run_state).to.equal(LRO.STATE_BAD_PCT);
    }
  });

});
