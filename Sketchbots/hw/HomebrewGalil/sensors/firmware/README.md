# Sketchbots

## Warnings and Disclaimers

**WARNING** **WARNING** **WARNING** **WARNING**

Moving machines can cause damage to personal property, personal injury or death. It is the responsibility of the reader of this document to take adequate safety precautions when operating, designing, or building any machinery, or when offering machinery to others for use.

None of the software, documents, firmware, schematics, drawings or other materials accompanying this document have been checked for errors, omissions or mistakes of any kind. Use it at your own risk.

Your use of the software, documents, firmware, schematics, drawings or other materials accompanying this document is governed by the [License Agreement](../../../../LICENSE.txt). Read it before proceeding.

**Safety Cage Warning**

Any machine buit with the parts described in this document **MUST NOT** be operated unless it is enclosed in a rated safety cage.

Copyright Notice:
Copyright 2013 Google Inc. All other copyrights and trademarks are property of their respective owners.

Thsi folder contains a pair of small Arduino sketches which monitor sensors on the
 robot arm and report these values back to the HomebrewGalil DrawMachine module in **robotcontrol** via USB serial connections.

The **arm firmware** runs on external Arduino-compatible boards (we use SparkFun ProMicros).
It is required that **robotcontrol** runs on the computer which is directly connected to the
Arduinos running the **arm firmware** and which has an Ethernet connection to the Sketchbot
motion controller hardware.

## Requirements

### arm sensor firmware

The arm sensor firmware requires the [Metro](http://playground.arduino.cc/code/metro) library and Martin Nawrath's
[library for MLX90316 rotary position sensor](http://interface.khm.de/index.php/lab/experiments/rotary-positionsensor-mlx90316/).
We recommend running the firmware on an [SparkFun ProMicro](https://www.sparkfun.com/products/10998), though it will run on most Arduino-compatible boards.
If you are using the ProMicro you will also need these [add-on files for the Arduino IDE](http://dlnmh9ip6v2uc.cloudfront.net/datasheets/Dev/Arduino/Boards/SF32u4_boards.zip).
* **Note**: These instructions are most useful for Linux and Mac OS X users. However, most parts will work exactly the same on Windows. One exception is that, if you are using Windows, the ProMicro usually requires [special drivers](http://dlnmh9ip6v2uc.cloudfront.net/datasheets/Dev/Arduino/Shields/ProMicroDriver.zip) be installed on the computer.


