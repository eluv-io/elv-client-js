pragma solidity 0.4.21;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */

contract Ownable {

    address public creator;
    address public owner;

    function Ownable() public {
        creator = tx.origin;
        owner = tx.origin;
    }

    // "Fallback" function - necessary if this contract needs to be paid
    function () public payable { }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(tx.origin == owner);
        _;
    }

    modifier onlyCreator() {
        require(tx.origin == creator);
        _;
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }

    function transferCreatorship(address newCreator) public onlyCreator {
        require(newCreator != address(0));
        if (owner == creator) {
            owner = newCreator;
        }
        creator = newCreator;
    }

    function kill() public onlyOwner {
        selfdestruct(owner);  // kills contract; send remaining funds back to owner
    }


}
