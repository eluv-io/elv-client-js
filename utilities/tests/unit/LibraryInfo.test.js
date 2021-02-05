const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const LibraryInfo = require("../../LibraryInfo");

describe("LibraryInfo", () => {

  it("should complain if --libraryId not supplied", () => {
    expect(() => {
      new LibraryInfo(argList2Params());
    }).to.throw("Missing required argument: libraryId");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new LibraryInfo(argList2Params("--libraryId", "ilib001xxxxxxxxxxxxxxxxxxxxxxxx", "--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should call ElvClient.ContentLibrary(), ContentObject(), and ContentObjectMetadata(), and return lib metadata", () => {
    const utility = new LibraryInfo(argList2Params("--libraryId", "ilib001xxxxxxxxxxxxxxxxxxxxxxxx", "--json"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( (retVal) => {
      expect(retVal.library_info.metadata.public.name).to.equal("dev-tenant - Title Masters");
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentLibrary",
        "ContentObject",
        "ContentObjectMetadata"
      ]).length).to.equal(0);
    });
  });
});
