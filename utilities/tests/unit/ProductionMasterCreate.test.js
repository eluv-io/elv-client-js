const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {fixturePath} = require("../helpers/fixtures");
const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const ProductionMasterCreate = require("../../ProductionMasterCreate");

const dummyRequiredArgs = [
  "--title", "myTitle",
  "--files", "myFile",
  "--type", "myType",
  "--libraryId", "myLibId",
];

describe("ProductionMasterCreate", () => {

  it("should complain if required args not supplied", () => {
    expect(() => {
      new ProductionMasterCreate(argList2Params());
    }).to.throw("Missing required arguments: title, files, libraryId, type");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new ProductionMasterCreate(argList2Params(...dummyRequiredArgs, "--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });

  it("should complain if both s3Copy and s3Reference specified", () => {
    expect(() => {
      new ProductionMasterCreate(argList2Params(
        ...dummyRequiredArgs,
        "--s3Copy",
        "--s3Reference"
      ));
    }).to.throw("Arguments s3Copy and s3Reference are mutually exclusive");
  });

  it("should complain if credentials specified but no s3Copy or s3Reference specified", () => {
    expect(() => {
      new ProductionMasterCreate(argList2Params(
        ...dummyRequiredArgs,
        "--credentials", "../../fixtures/credentials.fixture.json"
      ));
    }).to.throw("--credentials supplied but neither --s3Copy nor --s3Reference specified");
  });

  it("should complain if credentials file path is bad", () => {
    const utility = new ProductionMasterCreate(argList2Params(
      ...dummyRequiredArgs,
      "--s3Reference",
      "--credentials",
      "../../fixtures/nonexistent_file"
    ));
    return expect(utility.run()).to.eventually.be.rejectedWith("ENOENT: no such file or directory");
  });

  it("should complain if credentials file is bad JSON", () => {
    const utility = new ProductionMasterCreate(argList2Params(
      ...dummyRequiredArgs,
      "--s3Reference",
      "--credentials",
      "../fixtures/bad_format.fixture.json"
    ));
    return expect(utility.run()).to.eventually.be.rejectedWith("Unexpected token");
  });

  it("should call ElvClient.CreateProductionMaster()", () => {
    const utility = new ProductionMasterCreate(argList2Params(
      "--title", "myTitle",
      "--files", fixturePath("lro.status.2.progress.fixture.json"),
      "--type", "iq__002xxx001xxxxxxxxxxxxxxxxxx",
      "--libraryId", "iq__001xxxxxxxxxxxxxxxxxxxxxxxx",
      "--json"
    ));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then(() => {
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentType",
        "CreateProductionMaster",
        "SetVisibility",
        "ContentObjectMetadata", // checks stream info
        "ContentObjectMetadata" // get sources info
      ]).length).to.equal(0);
    });
  });

});
