const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {argList2Params, removeElvEnvVars} = require("../helpers/params");

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");

const MasterInit = require("../../MasterInit");

removeElvEnvVars();

beforeEach(removeStubs);

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

  it("should call ElvClient.CallBitcodeMethod()", () => {
    const utility = new MasterInit(argList2Params("--objectId", "iq__001xxx001xxxxxxxxxxxxxxxxxxx", "--json"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( (retVal) => {
      expect(retVal.version_hash).to.equal("hq__fake_new_hash");
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistory()[0]).to.include("ContentObjectLibraryId");
      expect(stub.callHistory()[1]).to.include("EditContentObject");
      expect(stub.callHistory()[2]).to.include("CallBitcodeMethod");
      // expect(stub.callHistory()[1]).to.include("ContentParts");
    });
  });

});
