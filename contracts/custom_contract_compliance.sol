pragma solidity ^0.4.16;

//
// This contract enforces distribution compliance on content based
// on custom data passed including the content rating by region,
// and the client's region.
// On the access request we execute a custom compliance check function
// that checks the client's region, and grants access accordingly.

contract CustomContract {

    struct ClientObject {
	address id; // client address requesting
	// internal elements
	bool valid; // to distinguish non-existing objects
	uint256 keyIndex; // index in the 'key list'
    }

    struct KeyElement {
	address key;
	bool valid; // set to 'false' when the element is deleted
    }

    address creator;

    function () public payable {
    }

    // hashmap of Client Object addresses to Obj
    mapping( address => ClientObject ) clientObjects; // keymap
    KeyElement[] clientObjectKeys; // key list; required to iterate

    event ClientObjectCreate(address id);

    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);
    event DbgBytes32(bytes32 b);

    function CustomContract() public payable
    {
	creator = msg.sender;
    }

    // Create a 'ClientObject'
    function clientCreate( ) private returns (address id)
    {
	DbgString("Enter clientCreate()");
     // 0 requests, and position 0 in keyIndex
	var o = ClientObject( msg.sender, true, 0 );
	clientObjects[o.id] = o;
	o.keyIndex = clientObjectKeys.push(KeyElement(o.id, true));
	ClientObjectCreate(o.id);
	DbgString("Exit clientCreate()");
	return o.id;
    }

    function checkRegionalCompliance( bytes32[] customKeys, bytes32[] customValues ) private returns(uint)
    {
	uint i = 0;
	bytes32 region = 0;
	bytes32 rating = 0;
	bytes32 ratingVal = 0;
	uint result = 1;

	DbgString("Enter CheckRegionalCompliance");

	for (i = 0; i < customKeys.length; i++)
	{
	    if (customKeys[i] == "client_region") {
	    //    DbgString("Found clientRegion");
		region = customValues[i];
		if (region=="MEA")
		    rating = "content_rating_MEA";
		if (region=="EU")
		    rating = "content_rating_EU";
		if (region=="NA")
		    rating = "content_rating_NA";
	    }
	}
	// Find value
	for (i = 0; i < customKeys.length; i++)
	{
	    if (customKeys[i] == rating) {
	    //    DbgString("found rating");
		ratingVal = customValues[i];
		if ( ratingVal == "Restricted" ) {
		    DbgString("Content is Restricted unless modified. region: rating:");
		    DbgString(bytes32ToStr(region));
		    DbgString(bytes32ToStr(ratingVal));
		    DbgString("Serving modified content ... ");
		    result = 0;
		}
		else {
		    DbgString("Content is Allowed as-is. region: rating:");
		    DbgString(bytes32ToStr(region));
		    DbgString(bytes32ToStr(ratingVal));
		}
	    }
	}

	return result;
    }

    function runAccessPre(address sender, uint256 charge, uint256 value, bytes32[] customKeys, bytes32[] customValues, bytes signature) public payable returns(uint)
    {

	uint result = 1;

	DbgString("Enter runAccessPre. tx charge: value:");
	DbgUint256(charge);
	DbgUint256(value);

	DbgString("Verifying Signature.");
	DbgString("Mock - verified.");

	if (value < charge) {
	    DbgString("Value insufficient. value: charge:");
	    DbgUint256(value);
	    DbgUint256(charge);
	    DbgString("Exit runAccessPre.");
	    result = 0;
	    return result;
	}

	DbgString("Charging for Access:");
	DbgUint256(charge);

	result = checkRegionalCompliance(customKeys, customValues);

	return result;
    }

    function runAccessPost() pure public returns(uint)
    {
      uint result = 1;
      return result;
    }

    function runFinalize(address sender) pure public returns(bool)
    {
	return true;
    }

    // Transaction sender ("this client") requests access
    // Access pre check runs a compliance check and returns a boolean val
    // allowing access to the content as-is or not
    // In this case the compliance check finds the content rating for the
    // client's region and denies access if rating is Restricted
    //
    function testComplianceCheck() public payable returns(uint)
    {
	uint r = 0;
	DbgString("EnterTestComplianceCheck. msg.value:");
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
	customValues[3] = "MEA";

	var sigstr  = "SIGNATURE 001177";

	r = runAccessPre( msg.sender, 10, msg.value, customKeys, customValues, bytes(sigstr) );

	return r;

     }

     function bytes32ToStr(bytes32 b32) pure public returns (string) {
	// string memory str = string(_bytes32);
	// TypeError: Explicit type conversion not allowed from "bytes32" to "string storage pointer"
	// thus we should fist convert bytes32 to bytes (to dynamically-sized byte array)

	bytes memory bytesArray = new bytes(32);
	for (uint256 i; i < 32; i++) {
	    bytesArray[i] = b32[i];
	   // if (bytesArray[i]=="0") break;
	}
	return string(bytesArray);
    }

}
