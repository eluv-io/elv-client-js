const {expect} = require("chai");

const {loadFixture} = require("../../../helpers/fixtures");
const {concern, concern2utility} = require("../../../helpers/concerns");
const {removeElvEnvVars} = require("../../../helpers/params");

removeElvEnvVars();

const LRO = concern("LRO");
const lroUtility = concern2utility(LRO, []);

describe("LRO.statusMapProcess()", () => {

  it(`should set run_state to ${LRO.STATE_BAD_PCT} if finished but progress < 100%`, () => {
    const statusMap = loadFixture("lro.status.finished.too.few.parts.fixture.json");
    const revisedMap = lroUtility.concerns.LRO.statusMapProcess(statusMap);
    for(const key of Object.keys(revisedMap)) {
      expect(revisedMap[key].run_state).to.equal(LRO.STATE_BAD_PCT);
    }
  });

  it("should not include ETA if there is a running job that hasn't reported progress yet", () => {
    const statusMap = loadFixture("lro.status.only.1.progress.fixture.json");
    for(k of Object.keys(statusMap)) {
      statusMap[k].start = (new Date).toISOString();
    }
    const revisedMap = lroUtility.concerns.LRO.statusMapProcess(statusMap);
    const summary = lroUtility.concerns.LRO.statusSummary(revisedMap);
    expect(summary.estimated_time_left_h_m_s).to.be.undefined;
  });

  it("should include ETA if all running jobs have progress > 0", () => {
    const statusMap = loadFixture("lro.status.2.progress.fixture.json");
    for(k of Object.keys(statusMap)) {
      statusMap[k].start = (new Date).toISOString();
    }
    const revisedMap = lroUtility.concerns.LRO.statusMapProcess(statusMap);
    const summary = lroUtility.concerns.LRO.statusSummary(revisedMap);
    expect(summary.estimated_time_left_h_m_s).to.not.be.undefined;
  });

});
