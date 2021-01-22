const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");

const {argList2Params, removeElvEnvVars} = require("../helpers/params");

const LibraryDeleteAllObjects = require("../../LibraryDeleteAllObjects");

removeElvEnvVars();

beforeEach(removeStubs);

describe("LibraryDeleteAllObjects", () => {

  it("should complain if --libraryId not supplied", () => {
    expect(() => {
      new LibraryDeleteAllObjects(argList2Params());
    }).to.throw("Missing required argument: libraryId");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new LibraryDeleteAllObjects(argList2Params("--libraryId", "dummyNewLibId", "--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should call ElvClient.ContentObjects()", () => {
    const utility = new LibraryDeleteAllObjects(argList2Params("--libraryId", "ilib001xxxxxxxxxxxxxxxxxxxxxxxx", "--json"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then((retVal) => {
      expect(stub.callHistory()[0]).to.include("ContentObjects");
      expect(stub.callHistory()[1]).to.include("DeleteContentObject");
    });
  });
});
