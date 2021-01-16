#!/bin/bash

if [ -z "$1" ]
  then
    echo
    echo Missing name of variable setting script file.
    echo
    echo Usage: test.s3.ingest.sh NAME_OF_SCRIPT_TO_SET_VARS
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
echo $S3_PATH
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
  --s3Reference \
  --json -v \
  --files $S3_PATH)

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


OBJECT_ID=$(echo $OUTPUT | jq '.data.object_id' | tr -d '"')
echo object_id=$OBJECT_ID

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
    --objectId $OBJECT_ID \
    --json)


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
  --objectId $OBJECT_ID \
  --finalize \
  --json)

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