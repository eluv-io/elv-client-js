pragma solidity ^0.4.16;

// This contract keeps track of how many times a client has accessed a content, and charges
// a configurable amount (of tokens) when the client has surpassed its fixed allotment
// Currently the contract charges ether to the caller, and credits ether to the contract,
// rather than tokens.

contract CustomContract {

    struct StationObject {

	address id;
	uint count; // number of requests

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

    // hashmap of Station Object address to Obj
    mapping( address => StationObject ) stationObjects; // keymap
    KeyElement[] stationObjectKeys; // key list; required to iterate

    event StationObjectCreate(address id);

    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);

    function CustomContract() public payable
    {
	creator = msg.sender;
    }

    // Create a 'StationObject'
    function stationCreate( ) private returns (address id)
    {

	DbgString("Enter stationCreate()");
     // 0 requests, and position 0 in keyIndex
	var o = StationObject( msg.sender, 0, true, 0 );
	stationObjects[o.id] = o;
	o.keyIndex = stationObjectKeys.push(KeyElement(o.id, true));
	StationObjectCreate(o.id);
	DbgString("Exit stationCreate()");

	return o.id;
    }

    function getStationCount() public constant returns (uint)
    {
	var o = stationObjects [ msg.sender ];
	if ( o.id != 0 )
	    return o.count;
	else
	    return 0;
    }

    function runAccessPre(address sender, uint256 charge, uint256 value, bytes32[] customKeys, bytes32[] customValues, bytes signature)  public payable returns(uint) {
	uint result = 0;

	// Do we have this station yet?
	// If not, create a new one
	var o = stationObjects [ sender ];
	if ( o.id == 0 ) {
	    stationCreate();
	}
	else {
	    //DbgFoundStation( o.id );
	    DbgString("Station exists:");
	    DbgAddress(o.id);
	}

	if(o.count >= 2)
	{
	    //require( msg.value >= charge );
	    if (value < charge) {
		DbgString("Value insufficient. value: charge:");
		DbgUint256(value);
		DbgUint256(charge);
		return 0;
	    }
	}

	o.count = o.count + 1;
	result = 1;

	DbgString("Station count:");
	DbgUint(o.count);
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

}
