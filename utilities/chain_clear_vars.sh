#!/bin/bash
if [ $SHLVL != 1 ] ; then
  echo
  echo "Please run script using 'source' or '.'"
  echo
  exit 1
else
  echo
  echo "Clearing env vars for elv-client-js argument chaining"
  echo
fi

# unset any existing ELV_CHAIN_ vars
while read var; do unset $var; done < <(env | grep -e ^ELV_CHAIN_ | awk -F= '!/no_proxy/{print $1}')

unset ELV_ENABLE_CHAINING

echo Done.
echo