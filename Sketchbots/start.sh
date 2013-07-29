#! /usr/bin/bash

#
#  This script launches the Sketchbot experiement
#

(
  cd sw/labqueue
  echo "Starting LabQueue on port 8080"
  dev_appserver.py --port=8080 . &> ../logs/labqueue.log &
)
(
  cd sw/robotcontrol
  echo "Starting RobotControl (node server)"
  sh start_robot_control &> ../logs/robotcontrol.log &
)
echo "open http://localhost:8080/ui"
