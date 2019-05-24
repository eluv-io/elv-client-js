pragma solidity 0.4.24;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";
import {BaseAccessControlGroup} from "./base_access_control_group.sol";


//
// Following features are implemented:
//      - ensure that only owner and accessor registered in a specified group can view the content
//      - ensure that non-owner can only download the package within the availability window
//


/* -- Revision history --
AvlDelivery20190404103300ML: First versioned released
AvlDelivery20190510152500ML: updated for new runAccessInfo API
*/


contract AvailsDelivery is Content {


    bytes32 public version ="AvlDelivery20190510152500ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    struct AvailabilityData {
        bool clearedSD; // cleared for SD
        bool clearedHD; // cleared for HD
        uint startDate; // Available on
        uint endDate; // Unavailable on
        address region; // Territory
    }

    mapping(address => address) public accessors;  // Indexed using OTT Delivery BaseContent address
    mapping(address => AvailabilityData) public availability; // Indexed using OTT Delivery BaseContent address


    function setAvailability(address content, bool sd,bool hd, uint start, uint end, address region ) public {
        BaseContent c = BaseContent(content);
        require(tx.origin == c.owner());
        uint startDate = start;
        if (startDate == 0) {
            startDate = now;
        }
        availability[content] = AvailabilityData(sd, hd, startDate, end, region);
    }

    function setAccessorGroup(address content, address accessor) public {
        BaseContent c = BaseContent(content);
        require(tx.origin == c.owner());
        accessors[content] = accessor;
    }

    function validateAvailability() public view {
        require(hasAccess(msg.sender, tx.origin));
        require(isAvailable(msg.sender, tx.origin) == 0);
    }

    function hasAccess(address content, address accessor) public view returns (bool) {
        address accessorGroup = accessors[content];
        if (accessorGroup == 0x0) {
            return true;
        }
        BaseAccessControlGroup group = BaseAccessControlGroup(accessorGroup);
        return group.hasAccess(accessor);
    }

    function isAvailable(address content, address accessor) public view returns (uint8) {
        uint8 available = 0;
        AvailabilityData storage avail = availability[content];
        address region = avail.region;

        if (region != 0x0) {
            BaseAccessControlGroup group = BaseAccessControlGroup(region);
            if (group.hasAccess(accessor) == false) {
                available = 10;
                //emit Log("Wrong territory");
            }
        }
        if (avail.startDate > now) {
            available = 20;
            //emit Log("Not yet available");
        }
        if ((avail.endDate != 0) && (avail.endDate < now)) {
            available = 30;
            //emit Log("Not longer available");
        }
        return available;
    }


    function runAccessInfo(
        uint8 level,
        bytes32[], /*customValues*/
        address[] /*stakeholders*/
    )
    public view returns (uint8, uint8, uint8, uint256)
    {
        if (level == 0){
            if (hasAccess(msg.sender, tx.origin)) {
                return (0, 0, 0, 0);
            } else {
                return (0, 100, 0, 0); //User not member of accessor group
            }
        }
        uint8 availCode = isAvailable(msg.sender, tx.origin);
        if (availCode != 0) {
            return (0, availCode, 0, 0);
        }
        return (DEFAULT_SEE + DEFAULT_ACCESS, 0, 0, 0);
    }


    function runAccess(
        uint256, /*request_ID*/
        uint8 level, /*level*/
        bytes32[], /*custom_values*/
        address[] /*stake_holders*/
    )
    public payable returns(uint)
    {
        if (level != 0){
            validateAvailability();
        }
        return 0;
    }

}
