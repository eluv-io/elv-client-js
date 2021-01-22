const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const kindOf = require("kind-of");

const {argList2Params, removeElvEnvVars} = require("../helpers/params");

const ObjectAddGroupPerms = require("../../ObjectAddGroupPerms");

removeElvEnvVars();

describe("ObjectAddGroupPerms", () => {

  it("should complain if --libraryId supplied", () => {
    expect(() => {
      new ObjectAddGroupPerms(argList2Params("--libraryId","myLibId", "--objectId", "myObjId", "--groupAddress", "0x67b70ea8be90b566337b9533d8335fcc3c5fc302", "--permissions", "manage"));
    }).to.throw("Unknown argument: libraryId");
  });

  it("should complain if --objectId missing", () => {
    expect(() => {
      new ObjectAddGroupPerms(argList2Params("--groupAddress", "myGroup", "--permissions", "manage"));
    }).to.throw("Missing required argument: objectId");
  });

  it("should complain if --groupAddress missing", () => {
    expect(() => {
      new ObjectAddGroupPerms(argList2Params("--objectId", "myObjId", "--permissions", "manage"));
    }).to.throw("Missing required argument: groupAddress");
  });

  it("should complain if --permissions missing", () => {
    expect(() => {
      new ObjectAddGroupPerms(argList2Params("--objectId", "myObjId", "--groupAddress", "myGroup"));
    }).to.throw("Missing required argument: permissions");
  });

  it("should parse hex groupAddress as string", () => {
    const utility = new ObjectAddGroupPerms(argList2Params("--objectId", "myObjId", "--groupAddress", "0x67b70ea8be90b566337b9533d8335fcc3c5fc302", "--permissions", "manage"));
    expect(utility.args.groupAddress).to.equal("0x67b70ea8be90b566337b9533d8335fcc3c5fc302");
    expect(kindOf(utility.args.groupAddress)).to.equal("string");
  });

});
