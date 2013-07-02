#!/bin/bash

#    Copyright 2013 Google Inc
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

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
