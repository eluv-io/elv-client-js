#!/bin/bash

if [ -z "$1" ]
  then
    echo
    echo Missing name of variable setting script file.
    echo
    echo Usage: $0 NAME_OF_SCRIPT_TO_SET_VARS
    echo
    exit 1
fi

# =========================
# SET VARIABLES
# =========================

source $1

# =========================
# TEST START
# =========================

echo
echo -------------------
echo TEST START
echo Title: $TITLE
echo $LOCAL_PATH
echo -------------------
echo

# -------------------------
# CREATE PRODUCTION MASTER
# -------------------------

TIMESTAMP=$(date +%Y-%m-%dT%H:%M:%S%z)

echo
echo -------------------
echo Create Master
echo -------------------
echo

OUTPUT=$(node "$ELV_CLIENT_PATH/utilities/ProductionMasterCreate.js" \
  --type $MASTER_TYPE \
  --libraryId $MASTER_LIB \
  --title "$TITLE $TIMESTAMP" \
  --json -v \
  --files $LOCAL_PATH)

if [ "$VERBOSE" = "1" ]
then
  echo
  echo $OUTPUT | jq
  echo
fi

if [ $? -ne 0 ]
then
  echo
  echo FAIL
  echo
  exit 1
fi

MASTER_OBJECT_ID=$(echo $OUTPUT | jq '.data.object_id' | tr -d '"')
echo object_id=$MASTER_OBJECT_ID

VERSION_HASH=$(echo $OUTPUT | jq '.data.version_hash' | tr -d '"')
echo version_hash=$VERSION_HASH

# -------------------------
# CREATE MEZZANINE
# -------------------------

echo
echo -------------------
echo Create Mez
echo -------------------
echo

OUTPUT=$(node "$ELV_CLIENT_PATH/utilities/MezzanineCreate.js" \
  --type $MEZ_TYPE \
  --libraryId $MEZ_LIB \
  --title "$TITLE $TIMESTAMP" \
  --masterHash $VERSION_HASH \
  --abrProfile $ABR_PROFILE_PATH \
  --json -v)

if [ "$VERBOSE" = "1" ]
then
  echo
  echo $OUTPUT | jq
  echo
fi

if [ $? -ne 0 ]
then
  echo
  echo FAIL
  echo
  exit 1
fi


MEZ_OBJECT_ID=$(echo $OUTPUT | jq '.data.object_id' | tr -d '"')
echo object_id=$MEZ_OBJECT_ID

RUN_STATE=running

# -------------------------
# CHECK STATUS
# -------------------------

while [ "$RUN_STATE" = "running" ]
do
  echo
  echo -------------------
  echo Check Mez Status
  echo -------------------
  echo

  OUTPUT=$(node $ELV_CLIENT_PATH/utilities/MezzanineJobStatus.js \
    --objectId $MEZ_OBJECT_ID \
    --json -v)


  if [ "$VERBOSE" = "1" ]
  then
    echo
    echo $OUTPUT | jq
    echo
  fi

  if [ $? -ne 0 ]
  then
    echo $OUTPUT
    echo
    echo FAIL
    echo
    exit 1
  fi

  RUN_STATE=$(echo $OUTPUT | jq '.data.status_summary.run_state' | tr -d '"')
  echo run_state=$RUN_STATE

  ETA=$(echo $OUTPUT | jq '.data.status_summary.estimated_time_left_h_m_s' | tr -d '"')
  echo ETA=$ETA

  if [ "$RUN_STATE" = "running" ]
  then
    echo sleep 30
    sleep 30
  fi

done

echo Final run state: $RUN_STATE

if [ "$RUN_STATE" != "finished" ]
then
  exit 1
fi


# -------------------------
# FINALIZE
# -------------------------

echo
echo -------------------
echo Finalize Mez
echo -------------------
echo

OUTPUT=$(node $ELV_CLIENT_PATH/utilities/MezzanineJobStatus.js \
  --objectId $MEZ_OBJECT_ID \
  --finalize \
  --json -v)

if [ "$VERBOSE" = "1" ]
then
  echo
  echo $OUTPUT | jq
  echo
fi

if [ $? -ne 0 ]
then
  echo
  echo FAIL
  echo
  exit 1
fi


# -------------------------
# ADD GROUP PERMISSIONS
# -------------------------

echo
echo -------------------
echo Add group permission: Master
echo -------------------
echo

OUTPUT=$(node $ELV_CLIENT_PATH/utilities/ObjectAddGroupPerms.js \
  --objectId $MASTER_OBJECT_ID \
  --groupAddress $ADMINS_GROUP_ADDRESS \
  --permissions manage \
  --json -v)

if [ "$VERBOSE" = "1" ]
then
  echo
  echo $OUTPUT | jq
  echo
fi

if [ $? -ne 0 ]
then
  echo
  echo FAIL
  echo
  exit 1
fi


echo
echo -------------------
echo Add group permission: Mez
echo -------------------
echo

OUTPUT=$(node $ELV_CLIENT_PATH/utilities/ObjectAddGroupPerms.js \
  --objectId $MEZ_OBJECT_ID \
  --groupAddress $ADMINS_GROUP_ADDRESS \
  --permissions manage \
  --json -v)

if [ "$VERBOSE" = "1" ]
then
  echo
  echo $OUTPUT | jq
  echo
fi

if [ $? -ne 0 ]
then
  echo
  echo FAIL
  echo
  exit 1
fi

echo
echo -------------------
echo Disable playback: Mez
echo -------------------
echo

OUTPUT=$(node $ELV_CLIENT_PATH/utilities/ObjectMoveMetadata.js \
  --objectId $MEZ_OBJECT_ID \
  --oldPath /offerings \
  --newPath /xofferings \
  --json -v)

if [ "$VERBOSE" = "1" ]
then
  echo
  echo $OUTPUT | jq
  echo
fi

if [ $? -ne 0 ]
then
  echo
  echo FAIL
  echo
  exit 1
fi



echo
echo -------------------
echo Re-enable playback: Mez
echo -------------------
echo

OUTPUT=$(node $ELV_CLIENT_PATH/utilities/ObjectMoveMetadata.js \
  --objectId $MEZ_OBJECT_ID \
  --oldPath /xofferings \
  --newPath /offerings \
  --json -v)

if [ "$VERBOSE" = "1" ]
then
  echo
  echo $OUTPUT | jq
  echo
fi

if [ $? -ne 0 ]
then
  echo
  echo FAIL
  echo
  exit 1
fi




echo
echo SUCCESS
echo

exit 0