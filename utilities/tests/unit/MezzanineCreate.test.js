const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {argList2Params, removeElvEnvVars} = require("../helpers/params");

const MezzanineCreate = require("../../MezzanineCreate");

const dummyRequiredArgs = [
  "--masterHash", "myHash",
  "--libraryId", "myLibId",
];

removeElvEnvVars();

describe("MezzanineCreate", () => {

  it("should complain if required args not supplied", () => {
    expect(() => {
      new MezzanineCreate(argList2Params("--existingMezId", "mezId"));
    }).to.throw("Missing required arguments: libraryId, masterHash");
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

});
