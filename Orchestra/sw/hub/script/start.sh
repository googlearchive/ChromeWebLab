#!/bin/bash

#  Copyright Google Inc, 2013
#  See LICENSE.TXT for licensing information.

# echo "Opening Max..."
# open max/sequencer.maxpat

# Max opens in about 5s, so give it 2x that.
# 
# sleep 10

echo "Starting Python server. If sequencer.maxpat is not already running, stop this server, open it, and start again.."

# cd as --rundir arg to twistd doesn't seem to work
cd orchestra

# for first run, as git doesn't create empty dirs
mkdir -p ../log
mkdir -p ../tmp/pids

# init Python
twistd -y __main__.py \
    --pidfile ../tmp/pids/twistd.pid \
    --logfile ../log/twistd.log

cd ..
