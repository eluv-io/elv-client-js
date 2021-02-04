const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");

const {argList2Params, removeElvEnvVars} = require("../helpers/params");

const LibraryAddDrmCert = require("../../LibraryAddDrmCert");

removeElvEnvVars();

beforeEach(removeStubs);

describe("LibraryAddDrmCert", () => {

  it("should complain if --libraryId not supplied", () => {
    expect(() => {
      new LibraryAddDrmCert(argList2Params());
    }).to.throw("Missing required argument: libraryId");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new LibraryAddDrmCert(argList2Params("--libraryId", "dummyNewLibId", "--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should call ElvClient.ContentLibrary() et. al.", () => {
    const utility = new LibraryAddDrmCert(argList2Params("--libraryId", "ilib001xxxxxxxxxxxxxxxxxxxxxxxx", "--json", "--noWait"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then((retVal) => {
      expect(retVal.version_hash).to.equal("hq__fake_new_hash");
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistory()[0]).to.include("ContentLibrary");
      expect(stub.callHistory()[1]).to.include("ContentObject");
      expect(stub.callHistory()[2]).to.include("ContentObjectMetadata");
      expect(stub.callHistory()[3]).to.include("ContentObjectLibraryId");
      expect(stub.callHistory()[4]).to.include("EditContentObject");
      expect(stub.callHistory()[5]).to.include("ReplaceMetadata");
      expect(stub.callHistory()[6]).to.include("FinalizeContentObject");
    });
  });
});
