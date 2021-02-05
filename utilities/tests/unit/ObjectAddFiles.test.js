const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {fixturePath} = require("../helpers/fixtures");
const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const ObjectAddFiles = require("../../ObjectAddFiles");

describe("ObjectAddFiles", () => {

  it("should complain if --objectId missing", () => {
    expect(() => {
      new ObjectAddFiles(argList2Params("--files", "foo.txt"));
    }).to.throw("Missing required argument: objectId");
  });

  it("should complain if --files missing", () => {
    expect(() => {
      new ObjectAddFiles(argList2Params("--objectId", "myObjId"));
    }).to.throw("Missing required argument: files");
  });

  it("should complain if --credentials specified but not --s3Copy or --s3Refere ce", () => {
    expect(() => {
      new ObjectAddFiles(argList2Params(
        "--objectId", "iq__001xxx001xxxxxxxxxxxxxxxxxxx",
        "--credentials", fixturePath("credentials.fixture.json"),
        "--files", "foo.txt"
      ));
    }).to.throw("--credentials supplied but neither --s3Copy nor --s3Reference specified");
  });

  it("should complain if credentials file is bad JSON", () => {
    const utility = new ObjectAddFiles(argList2Params(
      "--objectId", "iq__001xxx001xxxxxxxxxxxxxxxxxxx",
      "--credentials", fixturePath("bad_format.fixture.json"),
      "--files", "foo.txt",
      "--s3Reference"
    ));
    return expect(utility.run()).to.eventually.be.rejectedWith("Unexpected token");
  });

  it("should call ElvClient.UploadFiles() for a local file", () => {
    const utility = new ObjectAddFiles(argList2Params(
      "--objectId", "iq__001xxx001xxxxxxxxxxxxxxxxxxx",
      "--files", fixturePath("lro.status.2.progress.fixture.json"),
      "--noWait", // prevent extra calls in history from checking if new version is visible
      "--json"
    ));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then(() => {
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentObjectLibraryId",
        "EditContentObject",
        "UploadFiles",
        "Finalize"
      ]).length).to.equal(0);
    });
  });
});
