pragma solidity 0.4.24;

import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import "./accessible.sol";
import "./access_indexor.sol";
import "./user_space.sol";
import "./node_space.sol";


/* -- Revision history --
BaseContentType20190222145700ML: First versioned released
BaseContentType20190318101200ML: Migrated to 0.4.24
BaseContentType20190506153900ML: Adds access indexing
BaseContentType20190515104000ML: Overloads canPublish to take into account EDIT privilege granted for update request and commit
BaseContentType20190528194000ML: Removes contentSpace is field as it is now inherited from Ownable
BaseContentType20190604112500ML: Fixes setGroupRights to use the right index.
BaseContentType20190605150100ML: Splits out canConfirm from canPublish
BaseContentType20190813105000ML: Modifies canCommit to ensure it is a view
*/


contract BaseContentType is Accessible, Editable {

    bytes32 public version ="BaseContentType20190813105000ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    constructor(address content_space) public payable {
        contentSpace = content_space;
    }

    function canCommit() public view returns (bool) {
        UserSpace spc = UserSpace(contentSpace);
        address walletAddress = spc.getUserWallet(tx.origin);
        if (walletAddress != 0x0) {
            AccessIndexor wallet = AccessIndexor(walletAddress);
            return wallet.checkContentTypeRights(address(this), wallet.TYPE_EDIT());
        } else {
            return false;
        }

    }

    function canConfirm() public view returns (bool) {
        NodeSpace spc = NodeSpace(contentSpace);
        return spc.canNodePublish(msg.sender);
    }


    function setRights(address stakeholder, uint8 access_type, uint8 access) public {
        UserSpace userSpaceObj = UserSpace(contentSpace);
        address walletAddress = userSpaceObj.getUserWallet(stakeholder);
        if (walletAddress == 0x0){
            //stakeholder is not a user (hence group or wallet)
            setGroupRights(stakeholder, access_type, access);
        } else {
            setGroupRights(walletAddress, access_type, access);
        }
    }

    function setGroupRights(address group, uint8 access_type, uint8 access) public {
        AccessIndexor indexor = AccessIndexor(group);
        indexor.setContentTypeRights(address(this), access_type, access);
    }

}
