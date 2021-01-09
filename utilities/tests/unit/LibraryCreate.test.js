const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const {argList2Params, removeElvEnvVars} = require("../helpers/params");

const LibraryCreate = require("../../LibraryCreate");

removeElvEnvVars();

describe("LibraryCreate", () => {

  it("should complain if --name not supplied", () => {
    expect(() => {
      new LibraryCreate({argList: []});
    }).to.throw("Missing required argument: name");
  });

  it("should complain if unrecognized option supplied", () => {
    expect(() => {
      new LibraryCreate(argList2Params("--name", "new lib", "--illegalOption"));
    }).to.throw("Unknown argument: illegalOption");
  });




});
