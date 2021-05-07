const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const MezzanineCreate = require("../../MezzanineCreate");
const dummyRequiredArgs = ["--masterHash", "myHash"];

describe("MezzanineCreate", () => {

  it("should complain if required args not supplied", () => {
    expect(() => {
      new MezzanineCreate(argList2Params("--existingMezId", "mezId"));
    }).to.throw("Missing required argument: masterHash");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new MezzanineCreate(argList2Params("--illegalOption", ...dummyRequiredArgs));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should complain if neither existingMezId nor type are specified", () => {
    expect(() => {
      new MezzanineCreate(argList2Params(...dummyRequiredArgs, "--title", "myTitle"));
    }).to.throw("--type must be supplied unless --existingMezId is present");
  });

  it("should complain if neither existingMezId nor title are specified", () => {
    expect(() => {
      new MezzanineCreate(argList2Params(...dummyRequiredArgs, "--type", "myType"));
    }).to.throw("--title must be supplied unless --existingMezId is present");
  });

  it("should complain if credentials file is bad JSON", () => {
    const utility = new MezzanineCreate(argList2Params(
      ...dummyRequiredArgs,
      "--existingMezId", "mezId",
      "--title", "myTitle",
      "--credentials",
      "../fixtures/bad_format.fixture.json"
    ));
    return expect(utility.run()).to.eventually.be.rejectedWith("Unexpected token");
  });

  it("should call ElvClient.CreateABRMezzanine()", () => {
    const utility = new MezzanineCreate(argList2Params(
      "--masterHash",
      "hq__001xxx002xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "--type",
      "iq__002xxx002xxxxxxxxxxxxxxxxxx",
      "--title",
      "My Movie",
      "--libraryId",
      "ilib001xxxxxxxxxxxxxxxxxxxxxxxx",
      "--json"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( (retVal) => {
      expect(retVal.object_id).to.equal("iq__dummy_new_id");
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentType",
        "CreateABRMezzanine", // finalize call is not simulated by mock.CreateABRMezzanine()
        "SetVisibility",
        "StartABRMezzanineJobs" // metadata editing and finalization etc not simulated by mock.StartABRMezzanineJobs()
      ]).length).to.equal(0);
    });
  });
});
