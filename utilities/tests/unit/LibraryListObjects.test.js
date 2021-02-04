const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");

const {argList2Params, removeElvEnvVars} = require("../helpers/params");

const LibraryListObjects = require("../../LibraryListObjects");

removeElvEnvVars();

beforeEach(removeStubs);

describe("LibraryListObjects", () => {

  it("should complain if --libraryId not supplied", () => {
    expect(() => {
      new LibraryListObjects(argList2Params());
    }).to.throw("Missing required argument: libraryId");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new LibraryListObjects(argList2Params("--libraryId", "ilib001xxxxxxxxxxxxxxxxxxxxxxxx", "--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should call ElvClient.ContentObjects(), and return list", () => {
    const utility = new LibraryListObjects(argList2Params("--libraryId", "ilib001xxxxxxxxxxxxxxxxxxxxxxxx", "--json"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( (retVal) => {
      expect(retVal.object_list.length).to.be.greaterThan(0);
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistory()[0]).to.include("ContentObjects");
    });
  });
});
