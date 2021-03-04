#!/bin/bash
# SET VARIABLES FOR USE BY test.offering.metadata.rewrite.sh
# (make your own copy of this file and replace values)

# -----------------------------------------------------------------
# TEST-SPECIFIC VARS
# -----------------------------------------------------------------
export MEZ_ID=iq__MY_MEZ_OBJECT_ID # <- should start with 'iq__'

# -----------------------------------------------------------------
# ACCOUNT / NETWORK / CREDENTIALS INFO
# -----------------------------------------------------------------
export FABRIC_CONFIG_URL=MY_CONFIG_URL # <- https://demov3.net955210.contentfabric.io/config for demo network, https://main.net955305.contentfabric.io/config for production network
export PRIVATE_KEY=MY_FABRIC_PRIVATE_KEY # <- should start with 0x

# -----------------------------------------------------------------
# CLIENT RUNTIME ENVIRONMENT
# -----------------------------------------------------------------
export ELV_CLIENT_PATH=~/elv-client-js # <- change if elv-client-js installed at a different location

# -----------------------------------------------------------------
# GENERIC VARS APPLICABLE TO MOST TESTS
# -----------------------------------------------------------------
VERBOSE=1 # If set to 1, will print output from each elv-client-js script
export ETH_CONTRACT_TIMEOUT=20


# =================================================================
# UTILITY FUNCTIONS AND CHECKS (do not alter)
# =================================================================

print_spaced() {
  echo; echo $*; echo
}

# CHECK THAT WE WERE CALLED WITH 'source' OR '.'
if [ -z ${ELV_CALLER_SHELL_LEVEL+x} ]
then
  # ELV_CALLER_SHELL_LEVEL not set, called interactively
  if [ $SHLVL != 1 ]; then print_spaced "Please run script using 'source' or '.'"; exit 1
  else print_spaced "Setting env vars ($0)"; fi
else
  if [ $SHLVL != $ELV_CALLER_SHELL_LEVEL ]; then print_spaced "Please make sure your script is calling $0 using 'source' or '.'"; exit 1
  else print_spaced "Setting env vars ($0)"; fi
fi

