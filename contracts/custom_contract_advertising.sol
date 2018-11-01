pragma solidity ^0.4.21;

//
// This contract implements a "free" watch-ads to access model.
// When an ad is served this custom contract is called.
// The pre access hook simply returns (not charging the client)
// The finalize metho pays the client a configured token credit
// for watching the ad.
//


contract CustomContract {

    address creator;
    uint256 tokenCreditPerAd; // tokens earned per ad access

    function () public payable {
    }

    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);
    event TokenCreditPerAd(string s, uint256 tokenCreditPerAd);
    event RunAccessPre(string s, uint256 charge, uint256 value);
    event RunAccessPost(string s);
    event RunFinalize(string s);
    event PaidClient(string s, address addr, uint256 credit);

    function CustomContract() public payable
    {
        creator = msg.sender;
    }

    function setTokenCreditPerAd(uint256 c) public
    {
        // Only if sender of this transaction is the contract owner
           if (msg.sender == creator) {
           tokenCreditPerAd = c;
           emit TokenCreditPerAd("Setting TokenCreditPerAd: ", tokenCreditPerAd);
        }
    }

    function getTokenCreditPerAd() public constant returns (uint256)
    {
        return tokenCreditPerAd;
    }

    function runAccessPre(address sender, uint256 charge, uint256 value, bytes32[] customKeys, bytes32[] customValues, bytes signature ) public payable returns(uint)
    {

        emit RunAccessPre("Enter runAccessPre. charge, value: ", charge, value);

        uint result = 1;

        // We do nothing - the client will watch an ad so we won't charge
        return result;
        sender;
        customKeys;
        customValues;
        signature;

    }

    function runAccessPost() public returns(uint)
    {
        emit RunAccessPost("Enter runAccessPost");
          uint result = 1;
          return result;
    }

    function runFinalize(address sender) public payable returns(bool)
    {
        emit RunFinalize("Enter runFinalize.");
        // Here we need to pay the client
        sender.transfer(tokenCreditPerAd);
        emit PaidClient("Paid client. address: tokenCredit: ", sender, tokenCreditPerAd);
    }


    function testWatchAd() public payable returns(uint)
    {
        uint r = 0;
        emit DbgString("TestWatchAd. msg.value:");
        emit DbgUint(msg.value);

        setTokenCreditPerAd(2);

        bytes32[] memory customKeys = new bytes32[](4);
        bytes32[] memory customValues = new bytes32[](4);

        customKeys[0] = "content_rating_EU";
        customKeys[1] = "content_rating_NA";
        customKeys[2] = "content_rating_MEA";
        customKeys[3] = "client_region";
        customValues[0] = "FSA_16";
        customValues[1] = "PG-13";
        customValues[2] = "Restricted";
        customValues[3] = "MEA";

        string memory sigstr  = "SIGNATURE 001177";

        r = runAccessPre(msg.sender, 10, msg.value, customKeys, customValues, bytes(sigstr));

        if ( r == 1 ) {
           runAccessPost();
       runFinalize(msg.sender);

    }

    return r;

    }

}
