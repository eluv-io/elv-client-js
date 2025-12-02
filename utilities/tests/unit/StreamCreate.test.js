const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const StreamCreate = require("../../StreamCreate");

describe("StreamCreate", () => {
  it("should complain if --libraryId not supplied", () => {
    expect(() => {
      new StreamCreate(argList2Params("--url", "http://example.com"));
    }).to.throw("Missing required argument: libraryId");
  });

  it("should complain if --url not supplied", () => {
    expect(() => {
      new StreamCreate(argList2Params("--libraryId", "ilib123"));
    }).to.throw("Missing required argument: url");
  });

  it("should call StreamCreateObject() and include object_id in return value", () => {
    const utility = new StreamCreate(argList2Params("--libraryId", "ilib123", "--url", "http://example.com", "--json"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( (retVal) => {
      expect(retVal.object_id).to.equal("iq__dummy_new_id");

      expect(stub.callHistoryMismatches([
        "StreamCreateObject"
      ]).length).to.equal(0);
    });
  });
});
