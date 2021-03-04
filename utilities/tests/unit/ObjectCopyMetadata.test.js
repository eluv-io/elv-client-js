const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const ObjectCopyMetadata = require("../../ObjectCopyMetadata");

describe("ObjectCopyMetadata", () => {

  it("should complain if --objectId not supplied", () => {
    expect(() => {
      new ObjectCopyMetadata(argList2Params("--sourcePath", "/offerings/default", "--targetPath", "/offerings/watermarked"));
    }).to.throw("Missing required argument: objectId");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new ObjectCopyMetadata(argList2Params(
        "--objectId", "myId",
        "--sourcePath", "/offerings/default",
        "--targetPath", "/offerings/watermarked",
        "--illegalOption"
      ));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should call ElvClient.ContentObjectMetadata()", () => {
    const utility = new ObjectCopyMetadata(argList2Params(
      "--objectId", "iq__001xxx002xxxxxxxxxxxxxxxxxxx",
      "--sourcePath", "/production_master/variants/default",
      "--targetPath", "/production_master/variants/hdr",
      "--json"
    ));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( () => {
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentObjectLibraryId",
        "ContentObjectMetadata",
        "EditContentObject",
        "ReplaceMetadata",
        "FinalizeContentObject",
        "ContentObject"
      ]).length).to.equal(0);
    });
  });
});
