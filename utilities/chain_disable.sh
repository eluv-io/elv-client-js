#!/bin/bash
if [ $SHLVL != 1 ] ; then
  echo
  echo "Please run script using 'source' or '.'"
  echo
  exit 1
else
  echo
  echo "Disabling elv-client-js argument chaining"
  echo
fi

unset ELV_ENABLE_CHAINING

echo Done.
echo