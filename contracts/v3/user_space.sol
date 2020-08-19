pragma solidity 0.4.24;

import "./base_space_interfaces.sol";

/**
 * UserSpace
 * Seperated from content_space to avoid circular dependencies.
 */

/* -- Revision history --
UserSpace20190506155300ML: First versioned released
*/

contract UserSpace is IUserSpace {

    bytes32 public version ="UserSpace20190506155300ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    mapping(address => address) public userWallets;

    function userWallets(address _userAddr) external view returns (address) {
        return userWallets[_userAddr];
    }

    // STUB impl - meant to be overridden
    function createUserWallet(address _user) external returns (address) {
        require(false);
        return 0x0;
    }
}