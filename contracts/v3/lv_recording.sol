pragma solidity 0.4.24;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";
import {BaseAccessControlGroup} from "./base_access_control_group.sol";


/* -- Revision history --
LvProvider20190907122400ML: First versioned released
LvProvider20190910171300ML: Makes recordingStreams public.
LvProvider20190923175500ML: Adds support for split ownership of streams and provider
LvStrmRightsHldr201910172800ML: Changes name, modifies reporting to reflect authorization components
LvStrmRightsHldr20191025153800ML: Uses reporting only function from stream object for authorization
LvStrmRightsHldr20191029121900ML: Adds timestamps to all events
LvStrmRightsHldr20200129095200ML: Adds runEdit default function to ensure compatibility
LvStrmRightsHldr20200211102500ML: Adapted to authV3
*/

contract LvStreamRightsHolder is Content {

    bytes32 public version = "LvStrmRightsHldr20200211102500ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    mapping (address => bool) public recordingStreams;

    event AuthorizeRecording(uint256 timestamp, address stream, address accessor, bool rightsHolder, bool provider, bool membership);
    event EnableRecording(uint256 timestamp, address stream);
    event DisableRecording(uint256 timestamp, address stream);

    function authorizeRecording(address stream, address accessor) returns (bool) {
        bool decision = recordingStreams[stream];
        BaseContent streamObj = BaseContent(stream);
        LvRecordableStream streamContract = LvRecordableStream(streamObj.contentContractAddress());
        bool providerDecision;
        bool isMember;
        (providerDecision , isMember) = streamContract.logRecordingAuthorization(accessor, decision);
        emit AuthorizeRecording(now, stream, accessor, decision, providerDecision, isMember);
        return (decision && providerDecision && isMember);
    }

    function registerStream(address stream) public {
        BaseContent streamObj = BaseContent(stream);
        require(streamObj.owner() == tx.origin);
        recordingStreams[stream] = true;
        emit EnableRecording(now, stream);
    }

    function enableRecording(address stream) onlyOwner {
        recordingStreams[stream] = true;
        emit EnableRecording(now, stream);
    }

    function disableRecording(address stream) onlyOwner {
        recordingStreams[stream] = false;
        emit DisableRecording(now, stream);
    }

    //0 indicates edit can proceed
    //100 indicates that custom contract does not modify default behavior
    function runEdit() public returns (uint) {
        return 100;
    }
}



/* -- Revision history --
LvRecStream20190812201700ML: First versioned released
LvRecStream20190823104800ML: Adding fields to store stream handle, and exposing start to stop time.
LvRecStream20190825165500ML: Adding stream-wide event logging of recordings.
LvRecStream20190907125000ML: Adding provider control
LvRecStream20190910192800ML: Adding recordingStream override
LvRecStream20190922145400ML: Adding mechanism to check authorization to record before attempting it
LvRecStream20190923175600ML: Adds support for split ownership of streams and provider
LvRecStream20191022112900ML: Adds membership and authorization reporting of all controls (RH, Provider, membership)
LvRecStream20191025153500ML: Adds reporting only function for authorization
LvRecStream20191029121700ML: Adds recording deletion event and timestamps to all events
LvRecStream20191029150600ML: Changes playback event to report score
LvRecStream20191030161000ML: Adds right-holder permission check function
LvRecStream20191031162800ML: Adds originator in playback reporting
LvRecStream20191031174500ML: Adds reporting or program details and original request timestamps
LvRecStream20200129095300ML: Adds default runEdit to ensure compatibility
LvRecStream20200130192600ML: Allows accessor with edit right on stream object to modify owner-only parameters
LvRecStream20200316140800ML: Uses generic setRights instead of setContentObjectRights
*/

contract LvRecordableStream is Content {

    bytes32 public version = "LvRecStream20200316140800ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    uint public startTime;
    uint public endTime;
    bool public recordingEnabled;
    string public handle;

    address public recordingStream; //the content object for the recordable stream

    address public rightsHolder;
    address[] public membershipGroups;
    uint256 public membershipGroupsLength;

    event AuthorizeRecording(uint256 timestamp, address accessor, bool rightsHolder, bool provider, bool membership);
    event CreateRecording(uint256 timestamp, address accessor, address recObj, address recContract);
    event DeleteRecording(uint256 timestamp, address accessor, address recObj, address recContract);
    event SetRecordingTimes(uint256 timestamp, address accessor, address recObj, uint recStartTime, uint recEndTime);
    event SetRecordingStatus(uint256 timestamp, address accessor, address recObj, string recStatus);
    event RecordingPlaybackStarted(uint256 timestamp, address accessor, address recObj, uint256 requestNonce, uint256 accessTimestamp);
    event RecordingPlaybackCompleted(uint256 timestamp, address accessor, address recObj, uint256 requestNonce, uint8 percentPlayed, uint256 finalizeTimestamp);
    event RecordedProgramId(uint256 timestamp, address accessor, address recObj, string programId, uint256 programStart, uint256 programEnd, string programTitle);

    event MembershipGroupRemoved(uint256 timestamp, address group);
    event MembershipGroupAdded(uint256 timestamp, address group);

    event StartStream(uint256 timestamp);
    event StopStream(uint256 timestamp);
    event EnableRecording(uint256 timestamp);
    event DisableRecording(uint256 timestamp);

    constructor() public payable {
        if (msg.sender != tx.origin) {
            recordingStream = msg.sender;
        }
        startTime = 0;
        endTime = 0;
        handle = "";
    }

    modifier onlyEditor() {
        BaseContent content  = BaseContent(recordingStream);
        require((tx.origin == owner) || content.canEdit());
        _;
    }

    function setRecordingStream(address stream) public onlyEditor  { //only required if contract is instanciated manually, otherwise it is set correctly in the constructor
       recordingStream = stream;
    }

    //0 indicates edit can proceed
    //100 indicates that custom contract does not modify default behavior
    function runEdit() public returns (uint) {
        return 100;
    }

    // When a recordable stream is created a contract is created to track copies of that recording
    function runCreate() public payable returns (uint) {
        if (recordingStream == 0x0) {
            setRecordingStream(msg.sender);
            enableRecording();
            return 0;
        }

        if (rightsHolder != 0x0) {
            LvStreamRightsHolder provObj = LvStreamRightsHolder(rightsHolder);
            require(provObj.authorizeRecording(recordingStream, tx.origin));
        } else {
            bool isMember;
            require(authorizeRecording(tx.origin));
        }

        address instanceAddress = new LvRecording();
        LvRecording rec = LvRecording(instanceAddress);
        rec.setContentAddress(msg.sender);
        BaseContent obj = BaseContent(msg.sender);
        obj.setContentContractAddress(instanceAddress);
        emit CreateRecording(now, tx.origin, msg.sender, instanceAddress);
        return 0;
    }

    function hasRightsHolderPermission() public view returns (bool) {
        if (rightsHolder != 0x0) {
            LvStreamRightsHolder provObj = LvStreamRightsHolder(rightsHolder);
            return provObj.recordingStreams(recordingStream);
        }
        return true;
    }

    function canRecord() public view returns (bool) {
        if (recordingEnabled && hasMembership(tx.origin)) {
            return hasRightsHolderPermission();
        }
        return false;
    }

    function authorizeRecording(address accessor) public returns (bool){
        if (rightsHolder != 0x0) {
            LvStreamRightsHolder provObj = LvStreamRightsHolder(rightsHolder);
            return provObj.authorizeRecording(recordingStream, tx.origin);
        } else {
            bool isMember;
            ( , isMember) = logRecordingAuthorization(tx.origin, true);
            return (isMember && recordingEnabled);
        }
    }

    //Can be used to generate a transaction to indicate authorization failure as otherwise negative event a rolled back and thus never emitted
    function logRecordingAuthorization(address accessor, bool rightsHolderDecision) public returns(bool, bool){
        require((msg.sender == rightsHolder) || ((rightsHolder == 0x0) && rightsHolderDecision)); //can only be called by the rightsholder or as a bypass if rightsholder is not set
        bool isMember = hasMembership(accessor);
        emit AuthorizeRecording(now, accessor, rightsHolderDecision, recordingEnabled, isMember);
        return (recordingEnabled, isMember);
    }

    function enableRecording() public onlyEditor  {
        recordingEnabled = true;
        emit EnableRecording(now);
    }

    function disableRecording() public onlyEditor  {
        recordingEnabled = false;
        emit DisableRecording(now);
    }


    function hasMembership(address accessor) public view returns (bool) {
        if (membershipGroupsLength == 0) {
            return true;
        }
        for (uint i = 0; i < membershipGroupsLength; i++) {
            if (membershipGroups[i] != 0x0) {
                BaseAccessControlGroup groupContract = BaseAccessControlGroup(membershipGroups[i]);
                if (groupContract.hasAccess(accessor)) {
                    return true;
                }
            }
        }
        return false;
    }

    function addMembershipGroup(address group) public onlyEditor {
        uint256 prevLen = membershipGroupsLength;
        membershipGroupsLength = addToGroupList(group, membershipGroups, prevLen);
        if (membershipGroupsLength > prevLen) {
            emit MembershipGroupAdded(now, group);
            /*
            BaseAccessControlGroup accessIndex = BaseAccessControlGroup(group);
            accessIndex.setContentObjectRights(recordingStream, accessIndex.TYPE_ACCESS(), accessIndex.ACCESS_TENTATIVE());
            */
            BaseContent(recordingStream).setRights(group, 1 /*TYPE_ACCESS*/, 1 /*ACCESS_TENTATIVE*/);
        }
    }

    function removeMembershipGroup(address group) public onlyEditor returns (bool) {
        uint256 prevLen = membershipGroupsLength;
        membershipGroupsLength = removeFromGroupList(group, membershipGroups, prevLen);
        if (membershipGroupsLength < prevLen) {
            emit MembershipGroupRemoved(now, group);
            /*
            BaseAccessControlGroup accessIndex = BaseAccessControlGroup(group);
            accessIndex.setContentObjectRights(recordingStream, accessIndex.TYPE_ACCESS(), accessIndex.ACCESS_NONE());
            */
            BaseContent(recordingStream).setRights(group, 1 /*TYPE_ACCESS*/, 0 /*ACCESS_NONE*/);
            return true;
        }
        return false;
    }

    function addToGroupList(address _addGroup, address[] storage _groupList, uint256 _groupListLength) internal returns (uint256) {
        for (uint256 i = 0; i < _groupListLength; i++) {
            if (_addGroup == _groupList[i]) {
                return _groupListLength;
            }
        }
        if (_groupListLength < _groupList.length) {
            _groupList[_groupListLength] = _addGroup;
        } else {
            _groupList.push(_addGroup);
        }
        return (_groupListLength + 1);
    }

    function removeFromGroupList(address _removeGroup, address[] storage _groupList, uint256 _groupListLength) internal returns (uint256) {
        for (uint256 i = 0; i < _groupListLength; i++) {
            if (_removeGroup == _groupList[i]) {
                delete _groupList[i];
                if (i != (_groupListLength - 1)) {
                    _groupList[i] = _groupList[_groupListLength - 1];
                    delete _groupList[_groupListLength - 1];
                }
                return (_groupListLength - 1);
            }
        }
        return _groupListLength;
    }


    function setRightsHolder(address _rightsHolder) public onlyEditor  {
        rightsHolder = _rightsHolder;
        LvStreamRightsHolder provObj = LvStreamRightsHolder(rightsHolder);
        provObj.registerStream(recordingStream);
    }

    function startStream(string _handle) public onlyEditor  {
        handle = _handle;
        startTime = now;
        endTime = 0; //to allow re-opening
        emit StartStream(now);
    }

    function stopStream() public onlyEditor  {
        handle = "";
        endTime = now;
        emit StopStream(now);
    }

    function logRecordingStatus() public returns (uint8){
        LvRecording rec = LvRecording(msg.sender);
        uint8 recStatus = rec.recordingStatus();
        if ( recStatus == 10) {
            emit SetRecordingStatus(now, tx.origin, rec.contentAddress(), "recording");
            return recStatus;
        }
        if ( recStatus == 100) {
            emit SetRecordingStatus(now, tx.origin, rec.contentAddress(), "complete");
        }
        return recStatus;
    }

    function logRecordingTimes() public {
        LvRecording rec = LvRecording(msg.sender);
        emit SetRecordingTimes(now, tx.origin, rec.contentAddress(), rec.startTime(), rec.endTime());
    }

    function logRecordingPlaybackStarted(uint256 requestNonce, address originator, uint256 requestTimestamp) public {
        LvRecording rec = LvRecording(msg.sender);
        emit RecordingPlaybackStarted(now, originator, rec.contentAddress(), requestNonce, requestTimestamp);
    }

    function logRecordingPlaybackCompleted(uint256 requestNonce, uint8 percentPlayed, address originator, uint256 requestTimestamp) public {
        LvRecording rec = LvRecording(msg.sender);
        emit RecordingPlaybackCompleted(now, originator, rec.contentAddress(), requestNonce, percentPlayed, requestTimestamp);
    }

    function logRecordingDeletion() public {
        LvRecording rec = LvRecording(msg.sender);
        emit DeleteRecording(now, tx.origin, rec.contentAddress(), msg.sender);
    }

    function logRecordedProgramId(string programId, uint256 programStart, uint256 programEnd, string programTitle){
        LvRecording rec = LvRecording(msg.sender);
        emit RecordedProgramId(now, tx.origin, rec.contentAddress(), programId, programStart,  programEnd, programTitle);
    }

}




/* -- Revision history --
LvRecording20190812210100ML: First versioned released
LvRecording20190825165500ML: Adds stream-wide event logging of recordings.
LvRecording20191022104400ML: Adds runAccess, runFinalize and (un-used) runEdit hook for future use.
LvRecording20191029123400ML: Adds timestamps to all events, adds programId reporting
LvRecording20191029150500ML: Adds score to playback events
LvRecording20191031162800ML: Adds originator to playback events in case of state channel originated transactions
LvRecording20191031174500ML: Adds playback ID and reporting of program details
LvRecording20191031204100ML: Bug fix in runAccess
LvRecording20200211165400ML: Modified to conform to authV3 API
*/

contract LvRecording is Content {

    bytes32 public version ="LvRecording20200211165400ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    uint public startTime;
    uint public endTime;

    uint8 public recordingStatus; //0: not started, 10: started, 100: completed

    address public recordingStreamContract;
    address public contentAddress;

    uint256 playbackId;
    uint256[] playbacks;
    uint256 playbacksLength;

    event SetTimes(uint256 timestamp, uint startTime, uint endTime);
    event UpdateRecordingStatus(uint256 timestamp, uint8 status);
    event RecordProgramId(uint256 timestamp, string programId);

    constructor() public payable {
        startTime = 0;
        endTime = 0;
        recordingStreamContract = msg.sender;
        recordingStatus = 0;
        playbackId = 0;
        playbacksLength = 0;
    }

    function setContentAddress(address _contentAddress) public onlyOwner {
         contentAddress = _contentAddress;
    }

    function setStartTime(uint _startTime) public onlyOwner { //whether start and end time can be modified is debatable
        //modification is restricted to owner of recording content object or someone with editor privilege
        if (_startTime == 0) {
            // We could assume 0 means the beginning of the stream, but since we are assuming a single stream object, it does not make sense
            startTime = now;
        } else {
            startTime = _startTime;
        }
        emit SetTimes(now, startTime, endTime);
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        stream.logRecordingTimes();
    }

    function setEndTime(uint _endTime) public { //whether start and end time can be modified is debatable
        //modification is restricted to owner of recording content object or someone with editor privilege
        if (_endTime == 0) { //0 ends the recording
            endTime = now;
        } else {
            endTime = _endTime;
        }
        emit SetTimes(now, startTime, endTime);
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        stream.logRecordingTimes();
    }

    function setTimes(uint _startTime, uint _endTime) public {
        startTime = _startTime;
        endTime = _endTime;
        emit SetTimes(now, startTime, endTime);
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        stream.logRecordingTimes();
    }

    function updateRecordingStatus(uint8 _recordingStatus) public onlyOwner {
        recordingStatus = _recordingStatus;
        emit UpdateRecordingStatus(now, recordingStatus);
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        stream.logRecordingStatus();
    }

    //timestamp of original request can be passed in customValues[0] state-channel
    function runAccess(uint256 requestNonce,  bytes32[] customValues, address[] stakeholders, address accessor) public payable returns(uint) {
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        if (customValues.length ==  0) {
            stream.logRecordingPlaybackStarted(requestNonce, accessor, now);
        } else {
            stream.logRecordingPlaybackStarted(requestNonce, accessor, uint256(customValues[0]));
        }
        return 0;
    }

    //function to help formatting the percent complete to be provided in actionComplete
    function encodeScore(uint8 percent) public pure returns (bytes32) {
        return bytes32(percent);
    }

    function encodeTimestamp(uint256 timestamp) public pure returns (bytes32) {
        return bytes32(timestamp);
    }

    //timestamp of original request can be passed in customValues[1] state-channel, prc_complete is passed in customValues[0]
    function runFinalize(
        uint256 requestNonce,
        bytes32[] customValues,
        address[], /*stakeholders*/
        address accessor
    ) public payable returns (uint) {
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        uint256 timestamp = now;
        if (customValues.length >=  2) {
            timestamp = uint256(customValues[1]);
        }
        stream.logRecordingPlaybackCompleted(requestNonce, uint8(customValues[0]), accessor, timestamp);
        return 0;
    }


    /*
    function runFinalizeExt(uint256 requestID, uint256 score_pct, address originator) public payable returns (uint) {
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        if (playbacksLength > 0) {
            stream.logRecordingPlaybackCompleted(playbacks[playbacksLength - 1], uint8(score_pct), originator, requestID);
            delete playbacks[playbacksLength - 1];
            playbacksLength = playbacksLength - 1;
        } else {
            stream.logRecordingPlaybackCompleted(0, uint8(score_pct), originator, requestID);
        }
        return 0;
    }
    */

    function runKill() public payable returns (uint) {
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        stream.logRecordingDeletion();
        return 100; //when base content object is destroyed, custom contract should be too
    }

    //Not used yet. The idea is to add a hook in the base content contract to validate edits with its custom contract
    function runEdit() public returns (uint) {
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        if (stream.canRecord()) {
            return 0;
        } else {
            return 10;
        }
    }

    function logProgramId(string programId, uint256 programStart, uint256 programEnd, string programTitle, byte[] signature) public onlyOwner {
        LvRecordableStream stream = LvRecordableStream(recordingStreamContract);
        stream.logRecordedProgramId(programId, programStart, programEnd, programTitle);
        emit RecordProgramId(now, programId);
    }

}
