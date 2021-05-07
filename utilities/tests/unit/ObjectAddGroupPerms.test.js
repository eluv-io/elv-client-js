const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
chai.use(chaiAsPromised);

const kindOf = require("kind-of");

const {removeStubs, stubClient} = require("../mocks/ElvClient.mock");
const {argList2Params, removeElvEnvVars} = require("../helpers/params");

removeElvEnvVars();
beforeEach(removeStubs);

const ObjectAddGroupPerms = require("../../ObjectAddGroupPerms");

describe("ObjectAddGroupPerms", () => {

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

  it("should call ElvClient.AddContentObjectGroupPermission()", () => {
    const utility = new ObjectAddGroupPerms(argList2Params(
      "--objectId", "iq__001xxx001xxxxxxxxxxxxxxxxxxx",
      "--groupAddress", "0x67b70ea8be90b566337b9533d8335fcc3c5fc302",
      "--permissions", "manage",
      "--json"
    ));
    const stub = stubClient(utility.concerns.Client);
    stub.resetHistory();
    return utility.run().then(() => {
      // console.log(JSON.stringify(retVal, null, 2));
      expect(stub.callHistoryMismatches([
        "ContentObjectLibraryId",
        "AddContentObjectGroupPermission"
      ]).length).to.equal(0);
    });
  });
});
