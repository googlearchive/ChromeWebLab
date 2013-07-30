#! /usr/bin/bash

# Checks that the user configuration is correct and valid to run sketch bot

# Dependencies:
#   python 2.7
#   appengine 1.8
#   node 0.10
#   libpng
#   cairo
#   pkg-config
#   Pixman
#   node-canvas

function check {
  printf "%s" "Checking for $1"
  checkpath=`command -v $1`
   
  if [ $checkpath ]; then
    printf "%s\n" " [FOUND]"
    printf "%s" "Checking $1 version"
    version=`$1 $2 2>&1 | $3`
    if [[ "$version" -ge  "$4" ]]; then
      printf "%s\n" " [PASS]"
    else
      printf "%s\n" " [FAIL]" 
    fi
  fi
}

check "node" "--version" 'sed s#v0\.\([0-9]*\)\.\([0-9]*\)#\1\2#' 105   # Node > 0.10.5
check "python" "--version" 'sed s#Python.\([0-9]*\)\.\([0-9]*\).\([0-9]*\)#\1\2\3#' 270 # Python > 2.7.0
check "dev_appserver.py"
check "libpng"
check "cairo"
check "pkg-config"
check "node-canvas"

