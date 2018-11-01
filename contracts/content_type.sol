pragma solidity ^0.4.21;

contract ContentType {

    address public owner;
    //mapping (address => bool) public managers; //for now let it be restricted to owner
    bytes32 public name;

    string public schema;
    string public terms;
    string public terms_link;

    constructor(string memory content_type, string memory cddl_schema, string memory terms_schema ) public {
        owner = msg.sender;
        name = stringToBytes32(content_type);
        schema = cddl_schema;
        terms = terms_schema;
    }


    // TODO: is ContentType supposed to be Ownable - that's where 'creator' is defined
    function kill() public {
        if (msg.sender == owner)
            selfdestruct(owner);  // kills contract; send remaining funds back to creator
    }

    function set_terms_fabric_link(string memory terms_fabric_link) public {
	terms_link =  terms_fabric_link;
    }

    function stringToBytes32(string memory source) pure internal returns (bytes32 result) {
       bytes memory tempEmptyStringTest = bytes(source);
       if (tempEmptyStringTest.length == 0) {
           return 0x0;
       }
       assembly {
           result := mload(add(source, 32))
       }
    }

    function content_type_name() public view returns (string) {
	bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
          bytesArray[i] = name[i];
        }
        return string(bytesArray);
    }

}
