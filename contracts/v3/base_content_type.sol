pragma solidity 0.4.24;

import {Editable} from "./editable.sol";
import "./accessible.sol";
//import "./access_indexor.sol";
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
BaseContentType20200109163600ML: Supports visibility default filter
BaseContentType20200210110700ML: Supports authv3 API
BaseContentType20200316135100ML: Leverages inherited hasAccess
*/


contract BaseContentType is Editable {

    bytes32 public version ="BaseContentType20200316135100ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    constructor(address content_space) public payable {
        contentSpace = content_space;
        visibility = 0;
        indexCategory =  4; // AccessIndexor CATEGORY_CONTENT_TYPE
    }
/*
    function canEdit() public view returns (bool) {
        if (visibility >= 100) {
         return true;
        }
        IUserSpace userSpaceObj = IUserSpace(contentSpace);
        address walletAddress = userSpaceObj.userWallets(tx.origin);
        AccessIndexor wallet = AccessIndexor(walletAddress);
        return wallet.checkContentTypeRights(address(this), wallet.TYPE_EDIT());
    }
*/
/*
    function hasAccess(address _candidate) public constant returns (bool) {
        if ((visibility < 10 ) || (_candidate == owner)) {
            IUserSpace userSpaceObj = IUserSpace(contentSpace);
            address walletAddress = userSpaceObj.userWallets(_candidate);
            AccessIndexor wallet = AccessIndexor(walletAddress);
            return wallet.checkContentTypeRights(address(this), wallet.TYPE_ACCESS());
        }
        return true;
    }
*/

    function canCommit() public view returns (bool) {
        return canEdit();
    }

    function canConfirm() public view returns (bool) {
        INodeSpace spc = INodeSpace(contentSpace);
        return spc.canNodePublish(msg.sender);
    }

}
