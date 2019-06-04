pragma solidity 0.4.24;

import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import "./accessible.sol";
import "./base_content_space.sol";
import "./access_indexor.sol";


/* -- Revision history --
BaseContentType20190222145700ML: First versioned released
BaseContentType20190318101200ML: Migrated to 0.4.24
BaseContentType20190506153900ML: Adds access indexing
BaseContentType20190515104000ML: Overloads canPublish to take into account EDIT privilege granted for update request and commit
BaseContentType20190528194000ML: Removes contentSpace is field as it is now inherited from Ownable
BaseContentType20190604112500ML: Fixed setGroupRights to use the right index.
*/


contract BaseContentType is Accessible, Editable {

    bytes32 public version ="BaseContentType20190604112500ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    constructor(address content_space) public payable {
        contentSpace = content_space;
    }

    function canPublish() public view returns (bool) {
        if ((tx.origin == owner) || (msg.sender == owner)) {
            return true;
        }

        BaseContentSpace spc = BaseContentSpace(contentSpace);
        bool nodePublish = spc.canNodePublish(msg.sender);
        if (nodePublish) return true;

        address userWallet = spc.userWallets(tx.origin);
        if (userWallet != 0x0) {
            AccessIndexor wallet = AccessIndexor(userWallet);
            if (wallet.checkContentTypeRights(address(this), wallet.TYPE_EDIT()) == true) {
                return true;
            }
        }
        return false;
    }


    function setRights(address stakeholder, uint8 access_type, uint8 access) public {
        BaseContentSpace contentSpaceObj = BaseContentSpace(contentSpace);
        address walletAddress = contentSpaceObj.userWallets(stakeholder);
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
