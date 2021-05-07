const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const ObjectGetMetadata = require("../../ObjectGetMetadata");

describe("ObjectGetMetadata", () => {

  // TODO: Add support for writeToken
  it("should complain if no objectId, or versionHash supplied", () => {
    expect(() => {
      new ObjectGetMetadata(argList2Params());
    }).to.throw("Must supply either --objectId or --versionHash");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new ObjectGetMetadata(argList2Params(
        "--versionHash", "myHash",
        "--illegalOption"
      ));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should call ElvClient.ContentObjectMetadata()", () => {
    const utility = new ObjectGetMetadata(argList2Params(
      "--versionHash", "hq__6VrSGdAq5cwtzdueW35LukHXfXj2U7tsKNK3xBgVKZ6JewmtaHARFzWRZv8kL2SyEdjuFwi8U4",
      "--json"
    ));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( () => {
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentObjectLibraryId",
        "ContentObjectMetadata"
      ]).length).to.equal(0);
    });
  });
});
