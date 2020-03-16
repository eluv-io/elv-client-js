pragma solidity 0.4.24;

/* -- Revision history --
Accessible20190222135900ML: First versioned released
Accessible20190315141600ML: Migrated to 0.4.24
*/

contract Accessible {

    bytes32 public version ="Accessible20190222135900ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    event AccessRequest();

    function accessRequest() public returns (bool) {
        emit AccessRequest();
        return true;
    }

}
