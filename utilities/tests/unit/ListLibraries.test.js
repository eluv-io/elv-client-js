const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const ListLibraries = require("../../ListLibraries");

describe("ListLibraries", () => {

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new ListLibraries(argList2Params("--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should call ElvClient.ContentLibraries() and return list", () => {
    const utility = new ListLibraries(argList2Params("--json"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( (retVal) => {
      expect(retVal.libraries.length).to.be.greaterThan(0);
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentLibraries"
      ]).length).to.equal(0);
    });
  });
});
