#!/bin/bash

# Script: duya-day1-composition-create.sh
# Generates compositions for Day 1 tables with more than one iq__ object.
# Base object = first row, items = subsequent rows.
# Library: ilib2TKGA6qjm3AcnKk9Q8bGsFvgq1cb | Name: wpa-comp

LIBRARY_ID="ilib2TKGA6qjm3AcnKk9Q8bGsFvgq1cb"
NAME="wpa-comp"
UTIL="node $(dirname "$0")/../utilities/CompositionCreate.js"
CONFIG_URL="https://main.net955305.contentfabric.io/config"

run() {
  local label="$1"
  local base="$2"
  local items="$3"
  echo "--- $label ---"
  $UTIL \
    --library-id "$LIBRARY_ID" \
    --name "$NAME" \
    --base-object-id "$base" \
    --items "$items" \
    --configUrl "$CONFIG_URL" \
    --force
  if [ $? -ne 0 ]; then
    echo "ERROR: Failed on $label — exiting."
    exit 1
  fi
}

run "TV1" \
    "iq__jVDVt88LT2eSsuJxuFStHuty1Nv" \
    "iq__4FyosGPpVLEs7N5FRGSYy44i2XjM,iq__nkf5aPCE1Zy3iw77AUkFzR8tzUy,iq__3ZzeSwoDw6jdACuNjmKiHqqr8yoZ"
# Day 2

# run "TV1" \
#     "iq__3Z7qVYmKzvccqHx3SZhoUTWXT2Td" \
#     "iq__mDLxa1Lmypgnj67i6iThBwa6K87,iq__vtuZsqW57DC6ZvTFzd9e8apedXd,iq__2Qz5dyQLmSS6Cv3KznQgV78dpaEE"

# run "Table 1" \
#     "iq__3Dwk6rtZQW9yDb4MQc382CUf2iHy" \
#     "iq__3LrwyTzdTCHLatUPrHCu6ov9qFxm,iq__HdgeF7RwWonrcv8LtfV8g5MigZC"

# run "Table 2" \
#     "iq__4ZmutfEd8cmTSa9NwaT6TPN5Whq6" \
#     "iq__2dGeCsskH1cCep9sSfysWm6o8NEe,iq__2PRzCdFM57Kb6tQtnTsiUbZayHR4"

# run "Table 3" \
#     "iq__37LCmmdSfjX5861Ud3Mmu8BfsSXQ" \
#     "iq__3wUuMThjyGcCe34L9ZVuXBoV2mP2,iq__3WRxduaUrrJZihejD5ktGSd76Zek,iq__2JKXfSLTd51vcyjcsEeXiyrwVSYa,iq__4QPaHzsUbv8Ux2DVW5dkFV6fHP6M"

# run "Table 4" \
#     "iq__8TcJAC2ZTcBh6FwULgvXVAxT7u4" \
#     "iq__2t5WwnmKTbRexvnrF73wSEmgzzYp,iq__2zvFBpwsC4vJGHuRRqNV2d2W6iWM"

# run "Table 5" \
#     "iq__24n2nyg1bzfzqfazsn2S6rRFtEho" \
#     "iq__4HxeoejrLiKrYMoeoLnzKQRy4Tgp,iq__2TnULKa2AKSgYedgmEPfsG6qGHP8"

# run "Table 6" \
#     "iq__2Bx1ciVfidsCq8QLvkqRV4MrfTzi" \
#     "iq__2CccXwu2XJGL9mJPChUCZtmSfiRY"

# Table 7 — Group 1 (avc1.4D402A)
# run "Table 7" \
#     "iq__2WUa2WE3yiEwPLtJRaH85ToRfebk" \
#     "iq__2TvMADzgkWidoP179AxCfHwciAC9"

# # Table 7 — Group 2 (avc1.4D4028)
# run "Table 7" \
#     "iq__3VQ4YSW9NxXxaybZW4QF4oBJXys8" \
#     "iq__3oM9xszzDbrw1KPXEnQ7CAbNLoaW,iq__WNciA5KUVZSjB8ZsmW4sUDyTivb"

# # Table 8 — Group 1 (avc1.4D402A)
# run "Table 8" \
#     "iq__3uPJqGf6F6tWCbL1E2gH6G6ZqYsX" \
#     "iq__7MFXG1U1EnJAvGquB5PGYfvqcDt"

# # Table 8 — Group 2 (avc1.4D4028)
# run "Table 8" \
#     "iq__2gdejarsezJZvKh8YqWzZitmjN2u" \
#     "iq__2Rhbm9NtRpJAyXhyozSBa5jy9T5Q,iq__41imtXosszXaHeMGhD8MeUZvvYbo"

# # Table 9 — Group 1 (avc1.4D402A)
# run "Table 9" \
#     "iq__35B5TVH3UWNfzELZxTgWPvQupEdL" \
#     "iq__zpmrH1THyhtU2oMK4XVKoJyyRkT,iq__3CPj5XLtB2HxGzgKEh5KZoYA8GVd"

# # Table 9 — Group 2 (avc1.4D4028)
# run "Table 9" \
#     "iq__25aESgmGMAJRCqwPPrxp3VJMoZJv" \
#     "iq__3mcUNbgyce8BSoApKEw4rjCvswYs,iq__3jinzzw4tYcHRd237NrFma4LuDVr,iq__2Qn1mtsNMf2ExWnd3dukvUD32Zco"
# run "Table 10" \
#     "iq__324JcBgvxxDRgP3g4g9YmQSxMUAo" \
#     "iq__2YQq86DnfEpVtjhY5MPXWgukUwG5,iq__4Q5SmzMcBmD2JZGkw8oSfTJ4D7gg,iq__4QzNiz4vwcmqLji4stCMbg66UJ6R,iq__2jpu9FqBudK5mgMcPwZL46pgXNbA"

# run "Table 11" \
#     "iq__3it3YWHKFEw5UQba62aLmRy7YDpZ" \
#     "iq__4Zi73vKkT7hBHsi9qCk19W5odkrK,iq__4EnHoCXnHPMu9nEepPb67kbAM8XG"

# run "Table 12" \
#     "iq__4HZwbjPsQdHTJv28qFTuvei44KXa" \
#     "iq__45TvuwdvpQwDRPMokW1ib8vthAyx,iq__3FN3LqycpMUvVzhim1UHfpQcGmpz"

# run "Table 13" \
#     "iq__rCtXTabutoKkDXMaCQ9xqZvXaKP" \
#     "iq__hhL9J2nT1bLEZ8ZBw5StTutGqmJ,iq__ZDjJvG6a65dQuyXwdUBbckXQKX3"

# run "Table 14" \
#     "iq__3ikcQMXCaPCcDfk7CqsUvamxdro2" \
#     "iq__2dXL4nKa2nJZAZLZYgvtz1DxP5n,iq__3KJbiECTkCwqX1Jkiow7r7P7idoF"

# run "Table 15" \
#     "iq__395BZXtN1tdhN7zhbrmEbsqVkG2" \
#     "iq__3z3uZVE6CE1fYAWuL1TCnwpZRTET,iq__3ejKzfCWtSeALdBfNBe8SBpHhtof"

# Day 3

# run "TV1" \
#     "iq__4EWdFB1e1HrqJvn4gDu2wtjwDMz4" \
#     "iq__3JmAmsH6jT7Xvn4cMCox78BnLPLX,iq__3YhYXd7LmJWRra684vtUYZ9xvetQ,iq__4HSG4mxrnkKXssZnfGaKyoATkawj,iq__2Mnp1WkRre6zJJ9ELBkVoH7JNn4w"

# run "Table 1" \
#     "iq__HbD4zo2zFLPKaDJuHmK2VCa9kfL" \
#     "iq__V52RKBmuWGFkPcoTEK1WBbucktf,iq__2i5hXonMRz2Tw2uozxkjr6nAfrRW"

# run "Table 2" \
#     "iq__qhjANvRGWj7MFLTK39WpSr3gyvF" \
#     "iq__4C2kCWW5Fg8MweH4fvUGURxLDLuW,iq__3QLfTyAMRhz7xzzPDqFkdr3gtdDz"

# run "Table 3" \
#     "iq__3drDQytzmKeU4gZe8ji3eWa67ppF" \
#     "iq__4ZqZXp1v2TNjqgUvoFtdYL54g9GU,iq__Kou2pzJ85FFpYdQZZZZFFfRdNSo,iq__jM4CXBaG6WLE37HzBzrKxFq8sCz,iq__25K4DH5qVnBAZQMCgTEJXUv8g7VY"

# run "Table 4" \
#     "iq__6Qde1Pgxd2okvPXhqwMt8xo7BW8" \
#     "iq__3VJ5qX9UyTut3xTWSKW2W3ZnEfS2"

# run "Table 5" \
#     "iq__2kcHhh32HfdCqXAssJgFTusiXwYB" \
#     "iq__4XPEbyWBZbw1CevHmt6kqS24vQnr,iq__NWMiMkjzttTLsxTchiSTZ2BFuRN,iq__WJZEzYACAkVg6trK7sskH5U6uG7"

# run "Table 6" \
#     "iq__4PPzFtX9JSZARHDCKgkUkep6F5dq" \
#     "iq__2oz4mJhB9ej87XemaD6u51xSyNCz,iq__2JXXdYiosZbqTaaSwdQoYFnXqGDe"

# run "Table 7" \
#     "iq__Si9GhX3h6zfKN5bmq5xdQi4jEVS" \
#     "iq__xZy1dEEJqCojmHeKp2j3ZEJVVq2,iq__qS3VUPapLz6Zuv53Qz9rteSaNuB"

# run "Table 8" \
#     "iq__2gVRjkuPfyrKL8HRkqyZ3D6UkVtj" \
#     "iq__3kqeULgzfcJcyUHdrth384inHWN4,iq__3iTVBc1CLSvXLBVDBhBuDATsDeXs"

# run "Table 9" \
#     "iq__2k4vHKw2gFhJdjdDXTHHRGjYbrxf" \
#     "iq__VYPFoeTWt3nLLgVZfiEognNh7X2,iq__3kvgMXeqy7R1isgKF3jwEmRUc2MA"

# run "Table 10" \
#     "iq__2GwEh6k6BrKZJBDT31jhEbKvN97a" \
#     "iq__3WAYJGgcgV8QjviXpFd2N6aSZQrz,iq__43N3HUTwQYxazuSLphnevA9ukTRf"

# run "Table 11" \
#     "iq__buRsgJ8Mb3i3jxyX4BS7XyX5Yio" \
#     "iq__2C6PMTgZMCoi5ea6p54C3Geybd4t,iq__2nZ7ML3iP21B6nBHbXaiJWPDKzNp"

# run "Table 12" \
#     "iq__j9QzwnCaqW6aYezg9xWiwEGxnmM" \
#     "iq__2V7pvu33DXNFCcP7bxm1vyeDtjKZ,iq__2HBZxS2dC1dSKChhfswbF1AHjJ9A"

# run "Table 13" \
#     "iq__41hJfcszH6vbHgCZDDhNsxPbe1PQ" \
#     "iq__DyUzFR7BoByA4gHXRtUEXErqy88,iq__M58gWiFso9ZpWGCUMcr2L61G9jh"

# run "Table 14" \
#     "iq__3oNmLK4cvshbh4peWM1KjU69zErh" \
#     "iq__3gy2rNRNs39GDkktYLHUUCCrvs2X,iq__4JFprHY4J98yaYWEcM6dVrLxv58S"

# run "Table 15" \
#     "iq__34nbZkk9c7RQaZegAw1t9UVjKuEe" \
#     "iq__45RV4NRi1FdeCHKCzXQXaS1nLmtz,iq__G5PndnpJQHzwnJnxCH4KKPaSaGc"

echo ""
echo "Done. All compositions created."
