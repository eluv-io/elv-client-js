const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {fixturePath} = require("../helpers/fixtures");
const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const MasterInit = require("../../MasterInit");

describe("MasterInit", () => {

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new MasterInit(argList2Params("--objectId", "myObjId", "--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should complain if --objectId missing", () => {
    expect(() => {
      new MasterInit(argList2Params());
    }).to.throw("Missing required argument: objectId");
  });

  it("should complain if credentials file is bad JSON", () => {
    const utility = new MasterInit(argList2Params(
      "--objectId", "iq__001xxx001xxxxxxxxxxxxxxxxxxx",
      "--credentials", fixturePath("bad_format.fixture.json")
    ));
    return expect(utility.run()).to.eventually.be.rejectedWith("Unexpected token");
  });

  it("should call ElvClient.CallBitcodeMethod()", () => {
    const utility = new MasterInit(argList2Params(
      "--objectId", "iq__001xxx001xxxxxxxxxxxxxxxxxxx",
      "--json"
    ));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( (retVal) => {
      expect(retVal.version_hash).to.equal("hq__fake_new_hash");
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentObjectLibraryId",
        "EditContentObject",
        "CallBitcodeMethod",
        "FinalizeContentObject",
        "ContentObject",
        "ContentObjectMetadata"
      ]).length).to.equal(0);
    });
  });

});
