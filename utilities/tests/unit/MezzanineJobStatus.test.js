const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const MezzanineJobStatus = require("../../MezzanineJobStatus");

describe("MezzanineJobStatus", () => {

  it("should complain if --objectId not supplied", () => {
    expect(() => {
      new MezzanineJobStatus(argList2Params());
    }).to.throw("Missing required argument: objectId");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new MezzanineJobStatus(argList2Params("--objectId","objId", "--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should complain if PRIVATE_KEY not set", () => {
    const utility = new MezzanineJobStatus(argList2Params("--objectId", "objId"));
    return expect(utility.run()).to.eventually.be.rejectedWith("Error: Please set environment variable PRIVATE_KEY");
  });

  it("should complain if FABRIC_CONFIG_URL not set and --configUrl not supplied", () => {
    const utility = new MezzanineJobStatus(params({
      argList: ["--objectId", "objId"],
      env: {PRIVATE_KEY: "key"}
    }));
    return expect(utility.run()).to.eventually.be.rejectedWith("Please either supply --configUrl or set environment variable FABRIC_CONFIG_URL");
  });

  it("should call ElvClient.LROStatus() for a local file", () => {
    const utility = new MezzanineJobStatus(argList2Params(
      "--objectId", "iq__001xxx001xxxxxxxxxxxxxxxxxxx",
      "--json"
    ));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then(() => {
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentObjectLibraryId",
        "LROStatus"
      ]).length).to.equal(0);
    });
  });

});
