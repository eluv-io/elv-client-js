pragma solidity 0.4.21;

/**
 * Ownable
 * The Ownable contract stores owner and creator addresses, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */

contract Ownable {

    bytes32 public version ="Ownable20190221100500ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX
    address public creator;
    address public owner;


    function Ownable() public payable {
        creator = tx.origin;
        owner = tx.origin;
    }

    // "Fallback" function - necessary if this contract needs to be paid
    function () public payable { }

    /**
     * Throws if called by any account other than the owner.
     *  note: both transaction initiator (tx.origin) and caller entity (msg.sender) are considered to also allow
     *       ownership by contracts, not just accounts.
     */
    modifier onlyOwner() {
        require((tx.origin == owner) || (msg.sender == owner));
        _;
    }

    modifier onlyCreator() {
        require(tx.origin == creator);
        _;
    }

    /**
     * Allows the current owner to transfer control of the contract to a newOwner.
     *  newOwner: The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }

    function transferCreatorship(address newCreator) public onlyCreator {
        require(newCreator != address(0));
        creator = newCreator;
    }

    function kill() public onlyOwner {
        selfdestruct(owner);  // kills contract; send remaining funds back to owner
    }


}
