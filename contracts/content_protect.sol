pragma solidity ^0.4.21;

import './ownable.sol';

contract ContentProtect {

    address private creator;
    address private customContractAddress;
    address public content_type;
    uint256 private accessCharge;
    bool refundable;
    uint256 maxCredit;

    struct ContentObject {
	address creator;
	string pkbOwner;
	string pkbKMS;
	bytes32 hash;

	// internal elements
	bool valid; // to distinguish non-existing objects
	uint256 keyIndex; // index in the 'key list'
    }

    struct KeyElement {
	bytes32 key; // will be the hash of the content subobj

	//internal elements
	bool valid; // set to 'false' when the element is deleted
    }

    // Note: there should be one event PartAccessRequest
    //       Making two separate ones temporarily because we can't read two
    //       arguments with go-ethereum 'abi'
    event ContentObjectCreate(address from, string cid, bytes32 hash);
    event PartAccessRequestHash(bytes32 hash);
    event PartAccessRequestPKE(string pkeRequestor);
    event PartAccessGrantedHash(bytes32 hash);
    event PartAccessGrantedPKB(string pkbRequestor);
    event PartAccessGrantedRK(string reKey);

    // Debug events
    event SetCustomContract(address custom_contract);
    event SetAccessCharge(uint256 new_access_charge);
    event InvokeCustomPreHook(address custom_contract);
    event ReturnCustomHook(address custom_contract, uint256 result);
    event InvokeCustomPostHook(address custom_contract);
    event InsufficientFunds(uint256 charge, uint256 tx_value);
    event AccessRequest(bytes32 content_hash);
    event Finalize(uint256 score, bytes32 ml_hash, bool refundable);

    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);
    event DbgBytes32(bytes32 b);

    mapping ( bytes32 => ContentObject ) private contentObjects;  // key map
    KeyElement[] private contentObjectKeys; // key list; required to iterate

    // "Fallback" function - necessary if this contract needs to be paid
    function () public payable {
    }

    function ContentProtect(address content_type) public payable
    {
	creator = msg.sender;
	refundable = false;
    }

    function kill() public
    {
	if (msg.sender == creator)
	    selfdestruct(creator);  // kills contract; send remaining funds back to creator
    }


    // Create a 'ContentObject'
    function create(bytes32 hash, string pkbOwner, string pkbKMS, string cid) public
    {

	var o = ContentObject(msg.sender, pkbOwner, pkbKMS, hash, true, 0);

	// TODO verify hash is not already in the map (and list)
	contentObjects[hash] = o;
	// TODO find unused index instead of appending one more entry
	o.keyIndex = contentObjectKeys.push(KeyElement(hash, true));

	// Send Events
	ContentObjectCreate(msg.sender, cid, hash);
    }

    // Return 'pkbOwner' for a given content part 'hash'
    function getPKBOwner(bytes32 hash) constant public returns (string pkbOwner)
    {
	ContentObject storage o = contentObjects[hash];
	require (o.valid == true);
	return (o.pkbOwner);
    }

    // Return 'pkbKMS' for a given contract part 'hash'
    function getPKBKMS(bytes32 hash) constant public returns (string pkbRequestor)
    {
	ContentObject storage o = contentObjects[hash];
	require (o.valid == true);
	return (o.pkbKMS);
    }

    function setCustomContractAddress(address addr) public
    {
	// Only if creator is sender
	if (msg.sender == creator)
	{
	    customContractAddress = addr;
	    SetCustomContract(customContractAddress);
	}
    }

    function getCustomContractAddress( ) constant public returns (address)
    {
	return customContractAddress;
    }

    function setAccessCharge (uint256 charge) public
    {
	// Only if creator is sender
       if (msg.sender == creator)
	{
	    accessCharge = charge;
	    SetAccessCharge(accessCharge);
	}
    }

    function getAccessCharge ( ) constant public returns (uint256)
    {
	return accessCharge;
    }

    function setRefundable(bool enabled) public
    {
	// Only if creator is sender
	if (msg.sender == creator)
	{
	    refundable = enabled;
	}
    }

    function getRefundable() public constant returns (bool)
    {
	return refundable;
    }

    function setMaxCredit(uint256 m) public
    {
	// Only if creator is sender
	if (msg.sender == creator)
	{
	    maxCredit = m;
	}

    }

    function getMaxCredit() public constant returns (uint256)
    {
	return maxCredit;
    }

    function runCustomPreHook( bytes32[] customKeys, bytes32[] customValues, bytes signature ) private returns(uint)
    {
	InvokeCustomPreHook(customContractAddress);
	if (customContractAddress == 0) {
	   if (msg.value < accessCharge) {
	      InsufficientFunds(accessCharge, msg.value);
	      return 0;
	    }
	   return 1;
	}
	CustomContract c = CustomContract(customContractAddress);
	uint result = c.runAccessPre(msg.sender, accessCharge, msg.value, customKeys, customValues, signature);
	return result;
    }

    function runCustomPostHook( ) private returns(uint)
    {
	InvokeCustomPostHook(customContractAddress);
	if (customContractAddress == 0) {
	   return 1;
	}
	CustomContract c = CustomContract(customContractAddress);
	uint result = c.runAccessPost();
	return result;
    }

    //  cid - is the content id of the content object created
    //  hash - is the  hash of the subobject created for which we are requesting access
    //  pkeRequestor - ephemeral public key of the requestor
    function accessRequest(string cid, bytes32 hash, string pkeRequestor, bytes32[] customKeys, bytes32[] customValues, bytes signature) public payable returns(bool)
    {
	AccessRequest(hash);

	uint r = runCustomPreHook(customKeys, customValues, signature);

	ReturnCustomHook(customContractAddress, r);
	if ( r <= 0 )
	   return false;

	// Raise Event
	PartAccessRequestHash(hash);
	PartAccessRequestPKE(pkeRequestor);

	r = runCustomPostHook();
	ReturnCustomHook(customContractAddress, r);
	if ( r <= 0 )
	   return false;
	else
	   return true;
    }

    function accessGranted(bytes32 hash, string pkbRequestor, string reKey) public returns(bool)
    {
	PartAccessGrantedHash(hash);
	PartAccessGrantedPKB(pkbRequestor);
	PartAccessGrantedRK(reKey);
	return true;
    }

    // sender passes the quality score as pct of best possible (converted to 1-100 scale)
    // the fabric provides to this access,
    // hash of the version of the ML-computed segment matrix used (stored as a'part'),
    // and a maximum credit to a client based on failed SLA (quality)
    // score and hash are recorded in an event
    // contract has astate variable creditBack
    // a credit refund is calculated for the caller (if )
    // will true up the charge based on the quality score by transferring tokens back
    // to the sender
    //
    // add a state variable in the contract indicating whether to credit back based on quality score

    function finalize( uint256 scorePct, bytes32 mlOutHash ) public payable returns(bool)
    {
	// record to event
	Finalize(scorePct, mlOutHash, refundable);

	if (refundable == true) {
	    payCredit(scorePct);
	} else {
	}

        bool result = true;
        if (customContractAddress != 0) {
            CustomContract c = CustomContract(customContractAddress);
            result = c.runFinalize(msg.sender);
	}
	return result;
    }

    function payCredit(uint256 scorePct) public {
	// credit the transaction caller
	uint256 amount = maxCredit * (100 - scorePct) / 100;
	DbgString("Credit the tx sender: address: amount:");
	DbgAddress(msg.sender);
	DbgUint256(amount);
	msg.sender.transfer(amount);
    }

     // Creates a new content object and tests accessing it
     function testCreateAndAccess(address addr, string cid, bytes32 hash, string pkbOwner, string pkbKMS, string pkeRequestor, string pkbRequestor, string reKey) public payable returns(bool)
    {
	DbgString("EnterTestCreateAndAccess. msg.value:");
	DbgUint(msg.value);

	bytes32[] memory customKeys = new bytes32[](4);
	bytes32[] memory customValues = new bytes32[](4);

	customKeys[0] = "content_rating_EU";
	customKeys[1] = "content_rating_NA";
	customKeys[2] = "content_rating_MEA";
	customKeys[3] = "client_region";
	customValues[0] = "FSA_16";
	customValues[1] = "PG-13";
	customValues[2] = "Restricted";
	customValues[3] = "EU";

	var sigstr  = "SIGNATURE 001177";

	setCustomContractAddress( addr );
	setAccessCharge( 10 );
	setRefundable( true );
	setMaxCredit ( 10 );

	create(hash, pkbOwner, pkbKMS, cid);

	bool r = accessRequest(cid, hash, pkeRequestor, customKeys, customValues, bytes(sigstr));
	if (r) {
	     accessGranted(hash, pkbRequestor, reKey);
	     finalize(80, "0xffff");
		  return true;
	}
	else {
	    return false;
	}
    }
}

contract CustomContract
{
    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);
    event DbgBytes32(bytes32 b);

    function runAccessPre(address sender, uint256 charge, uint256 value, bytes32[] customKeys, bytes32[] customValues, bytes signature) public payable returns(uint);
    function runAccessPost() public returns(uint);
    function runFinalize(address sender) public returns(bool);
}
