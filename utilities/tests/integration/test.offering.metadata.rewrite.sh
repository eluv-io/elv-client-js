#!/bin/bash
unset ELV_ENABLE_CHAINING

print_spaced() {
  echo
  echo $*
  echo
}

print_heading() {
  echo
  echo ---------------------------------------
  echo $*
  echo ---------------------------------------
  echo
}


print_output() {
  echo
  JSON_OUTPUT=$(echo $OUTPUT | jq 2>/dev/null)
  if [ $? -ne 0 ]
  then
    echo $OUTPUT
  else
    echo $JSON_OUTPUT
    ERRORS=$(echo $OUTPUT | jq '.errors' 2>/dev/null)
    if [ $? -eq 0 ]
    then
      if [ "$ERRORS" != "[]" ]
      then
        echo
        echo ERRORS:
        echo $ERRORS
        echo
      fi
    fi
  fi
}

check_exit_code() {
  EXIT_CODE=$1
  if [ $EXIT_CODE -ne 0 ]
  then
    print_output
    print_spaced FAIL
    exit 1
  else
    if [ "$VERBOSE" = "1" ]
    then
      print_output
    fi
  fi
}


if [ -z "$1" ]
  then
    print_spaced Missing name of variable setting script file.
    print_spaced Usage: $0 NAME_OF_SCRIPT_TO_SET_VARS
    exit 1
fi

# =========================
# SET VARIABLES
# =========================

export ELV_CALLER_SHELL_LEVEL=$SHLVL
source $1

# =========================
# TEST START
# =========================

echo
echo -------------------
echo INTEGRATION TEST START
echo $0
echo MEZ_ID: $MEZ_ID
echo $S3_PATH
echo -------------------
echo

# -------------------------
# TEST METADATA MODIFICATION
# -------------------------
print_heading Disable playback: Mez

OUTPUT=$(node $ELV_CLIENT_PATH/utilities/ObjectMoveMetadata.js \
  --objectId $MEZ_ID \
  --oldPath /offerings \
  --newPath /xofferings \
  --ethContractTimeout $ETH_CONTRACT_TIMEOUT \
  --json -v)

check_exit_code $?

print_heading Re-enable playback: Mez

OUTPUT=$(node $ELV_CLIENT_PATH/utilities/ObjectMoveMetadata.js \
  --objectId $MEZ_ID \
  --oldPath /xofferings \
  --newPath /offerings \
  --ethContractTimeout $ETH_CONTRACT_TIMEOUT \
  --json -v)

check_exit_code $?

# -------------------------
# SIGNAL SUCCESS
# -------------------------
print_spaced SUCCESS
exit 0