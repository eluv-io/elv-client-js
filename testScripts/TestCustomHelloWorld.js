const ContentLibrary = artifacts.require("ContentLibrary");
const Content = artifacts.require("Content");
const HelloWorld = artifacts.require("HelloWorld");
const Utils = artifacts.require("Utils");

var assert = require("assert");

contract("HelloWorld", accounts => {

  it("creates content object attached to library", async () => {

    const utils = await Utils.deployed();

    // get the deployed content library
    const clib = await ContentLibrary.deployed();
    assert.notStrictEqual(clib, undefined, "should have instance for deployed library");

    // get the deployed content object contract
    const cont = await Content.deployed();
    assert.notStrictEqual(cont, undefined, "should have instance for deployed content");

    // get the deployed content object contract
    const helloworld = await HelloWorld.deployed();
    assert.notStrictEqual(helloworld, undefined, "should have instance for deployed custom content HelloWorld");

    // fund the custom contract
    await helloworld.sendTransaction({from:accounts[0], value: 5 * 1000000000000000000});

    let credit = 1.5 * 1000000000000000000;
    await helloworld.setCredit(credit);

    // set access charge for content
    // function setAccessCharge (uint256 charge) public onlyOwner returns (uint256) {
    await cont.setAccessCharge(1000000000000000000); // one ether

    await cont.setCustomContractAddress(helloworld.address);

    let libraryBalance = await utils.getBalance.call(clib.address);

    console.log(`got balance: ${libraryBalance}`);

    let requesterAccount = accounts[1];
    // make access request from requester account
    // function accessRequest(uint8 level, string pkeRequestor, bytes32[] customValues, address[] stakeholders) public payable returns(bool)
    // function accessRequest(uint8 level, string pkeRequestor, string pkeAFGH, bytes32[] customValues, address[] stakeholders) public payable returns(bool)
    let result = await cont.accessRequest(0, "DEADBEEF", "ABABABAB", [], [], {from: requesterAccount, value: 2000000000000000000});

    var requestId;
    var requestValid;
    // event AccessRequest(uint request_validity, uint256 request_id, uint8 level, bytes32 versionHash, string pkeRequestor);
    result.logs.forEach(function(logEntry) {
      if (logEntry.event == "AccessRequest") {
        requestId = logEntry.args["request_id"];
        requestValid = logEntry.args["request_validity"];
      }
    });
    assert.notStrictEqual(requestId, undefined, "should have found request ID from AccessRequest message");
    assert.strictEqual(requestValid.toNumber(), 1, `should fail runAccess due to missing stake_holder: ${requestValid}`);

    // New request, now with a stake holder
    let result2 = await cont.accessRequest(0, "DEADBEEF", "ABABABAB", ["hello again"], [clib.address], {from: requesterAccount, value: 2000000000000000000});

    // event AccessRequest(uint request_validity, uint256 request_id, uint8 level, bytes32 versionHash, string pkeRequestor);
    result2.logs.forEach(function(logEntry) {
      if (logEntry.event === "AccessRequest") {
        requestId = logEntry.args["request_id"];
        requestValid = logEntry.args["request_validity"];
      }
    });
    assert.notStrictEqual(requestId, undefined, "should have found request ID from AccessRequest message");
    assert.equal(requestValid, 0, "should succeed if a stake holder is passed in" + ": " + requestValid);

    let libraryBalanceAfter = await utils.getBalance.call(clib.address);
    assert.strictEqual(libraryBalanceAfter.toNumber(), libraryBalance.toNumber() + credit,
      "should pay the library");
  });

});
