#! /usr/bin/bash

#
#  This script launches the Sketchbot experiement
#

(
  cd sw/labqueue
  dev_appserver.py --port=8080 . > ../logs/labqueue.log &
)
(
  cd sw/robotcontrol
  sh start_robot_control > ../logs/robotcontrol.log
)
