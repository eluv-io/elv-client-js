const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const ObjectDelete = require("../../ObjectDelete");

describe("ObjectDelete", () => {

  it("should complain if --objectId missing", () => {
    expect(() => {
      new ObjectDelete(argList2Params());
    }).to.throw("Missing required argument: objectId");
  });

  it("should call ElvClient.DeleteContentObject()", () => {
    const utility = new ObjectDelete(argList2Params("--objectId", "iq__001xxx001xxxxxxxxxxxxxxxxxxx", "--json"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then(() => {
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentObjectLibraryId",
        "DeleteContentObject"
      ]).length).to.equal(0);
    });
  });

});
