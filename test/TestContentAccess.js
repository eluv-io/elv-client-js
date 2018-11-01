const ContentLibrary = artifacts.require("ContentLibrary");
const Content = artifacts.require("Content");
const Utils = artifacts.require("Utils");

var assert = require("assert");

contract("Content", accounts => {

  it("creates content object attached to library", async () => {

    // get the deployed content library
    const clib = await ContentLibrary.deployed();
    assert.notStrictEqual(clib, undefined, "should have instance for deployed library");

    // get the deployed content object contract
    const cont = await Content.deployed();
    assert.notStrictEqual(cont, undefined, "should have instance for deployed content");

    // set access charge for content
    // function setAccessCharge (uint256 charge) public onlyOwner returns (uint256) {
    await cont.setAccessCharge(1000000000000000000); // one ether

    let requesterAccount = accounts[1];
    // make access request from requester account
    // function accessRequest(uint8 level, string pkeRequestor, bytes32[] customValues, address[] stakeholders) public payable returns(bool)
    let result = await cont.accessRequest(0, "DEADBEEF", "BABA", [], [], {from: requesterAccount, value: 2000000000000000000});

    var requestId;
    // event AccessRequest(uint request_validity, uint256 request_id, uint8 level, bytes32 contentHash, string pkeRequestor);
    result.logs.forEach(function(logEntry) {
      if (logEntry.event == "AccessRequest")
        requestId = logEntry.args["request_id"];
    });
    assert.notStrictEqual(requestId, undefined, "should have found request ID from AccessRequest message");

    const kmsAccount = accounts[2];

    // set the KMS account address on the content object
    // function setAddressKMS(address address_KMS) public onlyOwner {
    await cont.setAddressKMS(kmsAccount);
    const checkAddress = await cont.addressKMS.call();
    assert.strictEqual(kmsAccount, checkAddress, "should have set the KMS address on the content object");

    var grantRequestId;
    // function accessGrant(uint256 request_ID, bool access_granted, string reKey, string encrypted_AES_key) public returns(bool)
    let resultGrant = await cont.accessGrant(requestId, true, "THE_RENC", "THE_AES", {from: kmsAccount});
    resultGrant.logs.forEach(function(logEntry) {
      if (logEntry.event == "AccessGrant") {
        grantRequestId = logEntry.args["request_ID"];
      }
    });

    assert.strictEqual(requestId.toString(), grantRequestId.toString(), `access request and grant should provide same request_id: ${requestId}, ${grantRequestId}`);

  });

});
