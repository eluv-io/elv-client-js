const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");

const {argList2Params, removeElvEnvVars} = require("../helpers/params");

const LibraryCreate = require("../../LibraryCreate");

removeElvEnvVars();

beforeEach(removeStubs);

describe("LibraryCreate", () => {

  it("should complain if --name not supplied", () => {
    expect(() => {
      new LibraryCreate(argList2Params());
    }).to.throw("Missing required argument: name");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new LibraryCreate(argList2Params("--name", "new lib", "--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should call ElvClient.CreateContentLibrary() and include library_id in return value", () => {
    const utility = new LibraryCreate(argList2Params("--name", "new lib", "--json"));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then( (retVal) => {
      expect(retVal.library_id).to.equal("ilib_dummy_new_lib");
      expect(stub.callHistory()[0]).to.include("CreateContentLibrary");
    });
  });

});
