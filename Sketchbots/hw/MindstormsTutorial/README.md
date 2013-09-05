# Sketchbot Tutorial with Lego Mindstorms  NXT


**WARNING** **WARNING** **WARNING** **WARNING**

Moving machines can cause damage to personal property, personal injury or death. It is the responsibility of the reader of this document to take adequate safety precautions when operating, designing, or building any machinery, or when offering machinery to others for use.

None of the software, documents, firmware, schematics, drawings or other materials accompanying this document have been checked for errors, omissions or mistakes of any kind. Use it at your own risk.

Your use of the software, documents, firmware, schematics, drawings or other materials accompanying this document is governed by the [License Agreement](../LICENSE.txt). Read it before proceeding.

All trademarks are the property of their respective owners.

---

### Introduction

In this tutorial you will learn to use the Chrome Web Lab's Sketchbot open source Sketchbot library in order to build your very own web-controlled drawing machine!

Since building robots can be an expensive endeavor we will try to minimize cost (and complexity) by making a drawing robot using [Lego Mindstorms NXT](http://mindstorms.lego.com/).

Like its bigger brother, the Mindstorms Sketchbot will use a 3-axis arm to manipulate a physical 'stylus' in order to tranposes a vector-based image onto a two-dimensional surface like paper.

After assembling Lego Mindstorms NXT drawing robot, getting the dependencies installed on your machine and running the Sketchbot code, the library will handle everything from the image capture, to the conversion to vector-based machine code (i.e. [gcode](http://en.wikipedia.org/wiki/G-code)) that the drawing robot can understand.

For a full description of the history and concept of the project see [this page](https://github.com/GoogleChrome/ChromeWebLab/tree/master/Sketchbot).

Here's an example video of what you can expect after getting everything setup!

/////////// **TODO: Add Video Here** ///////////

---

*NOTE:*

*The Lego Mindstorms NXT sketchbot is NOT a high-precision drawing robot--far from it. This is primarily due to its physical motor limitations and loose tolerances. However, it does demonstrate how a complete drawing system works, by going from web interface to physical sketch and providing a great jumping off point for anyone interested in building more advanced drawing machines using the Chrome Web Lab's Sketchbot library.*

---

###References

* [Lego Mindstorms NXT](http://mindstorms.lego.com/)
* [Inverse Kinematics](http://en.wikipedia.org/wiki/Inverse_kinematics)
* [GCode](http://en.wikipedia.org/wiki/G-code))
* [Chrome Experiments](http://www.chromeexperiments.com/)

---

###PART 1: Gather Materials

The first step is to acquire all of the parts we will need to build this project. 


* LEGO® MINDSTORMS® NXT Kit (such as [LEGO kit number 8527](http://www.brickset.com/detail/?Set=8527-1))
* Pen, Pencil or Brush to attach to the stylus
* Paper or other drawing surface--try sand if you like
* A good metric ruler or, better still, a good metric [dial caliper](http://en.wikipedia.org/wiki/Caliper#Dial_caliper). Yes, you should use metric units.

---

###PART 2: Software Configuration

First, we will set up the software needed for this project. This will be done on a computer, as well as on the "NXT brick" from the LEGO kit.

The NXT brick is the motion controller for LEGO's robotics system and handles taking higher level motion commands and moving the motors appropriately. The NXT Brick comes from LEGO with a stock firmware installed. Happily, LEGO freely allows builders to install their own new firmware. We will use the community-developed [pbLua firmware](http://hempeldesigngroup.com/lego/pblua) rather than the stock LEGO firmware.

1. Follow the instructions in the [Getting Started Guide, Basic Setup section](https://github.com/GoogleChrome/ChromeWebLab/tree/master/Sketchbots#getting-started-basic-setup) for the main Sketchbot Library and follow the procedures there. Once you can verify the system works without any LEGOs attached head back.
2. If you haven't done so already, make sure that the basic LEGO Mindstorms NXT software is installed and running properly on your computer. Instructions are included in the Mindstorms NXT box and on [LEGO's web site](http://mindstorms.lego.com/en-us/support/buildinginstructions/8547/8547%20user%20guide%20english.aspx).
3. Follow [these instructions](http://hempeldesigngroup.com/lego/pblua/tutorial/pbluainstall/) to install the pbLua firmware on the NXT brick.
4. Open the [ConfigParams.js](sw/robotcontrol/src/ConfigParams.js) file from the [robotcontrol/src](sw/robotcontrol/src/) folder.
6. Locate the `DRAW_MACHINE_TYPE` setting. Make sure it is set as follows: ```DRAW_MACHINE_TYPE: "MindstormsNXT",``` 
7. If you built your drawing machine according to the instructions referenced in step 1, above, then the robot geometry settings included in ConfigParams.js can be used as-is. If you modified the machine or want to understand these settings in more detail, please see the [DrawMachine Geometry Configuration section](#drawmachine-geometry-configuration).
8. Connect the NXT brick to the computer via USB or Bluetooth. See your computer operating system's documentation for details on how to create a Bluetooth connection.
9. Determine the name of the serial port by looking in the **/dev** directory in a shell or Mac OS X terminal. For Bluetooth devices on Mac OS X, the port is usually called **/dev/cu.NXT-DevB**.
10. Back in ConfigParams.js, set the `MINDSTORMS_NXT__SERIAL_PORT` to the name of the serial port from step 9.
11. Save changes to ConfigParams.js.

> #### Stop and test
>
> Now we should re-test the entire system to make sure that it still works.
> 
> 1. In the shell, change to the [**robotcontrol/** folder](sw/robotcontrol) (one level up from the **src** folder).
> 2. Run `./start_robot_control`
> 3. You should see the following message in the console: `********************** Connected to MindstormsNXT drawing machine **********************`
> 4. You should also see "Sketchbot OK" on the Mindstorms NXT brick LCD display. **Troubleshooting**: If you do not see *both* the message in the console on the computer and on the LCD, then you may have the wrong serial port configured in ConfigParams.js. Review Step 9 above and try again.

> 5. Switch to the UI running in your browser. If the UI is not running, switch to App Engine Launcher, select *labqueue* and press the *Run* button. Click the *Browse* button to display the UI in your browser.
> 6. Click the *New from File* button
> 7. Select the [testpattern.png](sw/test/testpattern.png) file which is part of this repository. You can find it in the [sw/test](sw/test) folder.
> 8. Click the *Save* button
> 9. A few seconds later **robotcontrol** should pick up the new drawing task and begin commanding the drawing machine.
> 
> **Troubleshooting**: 
> 	* If **robotcontrol** does not detect the new drawing task then there may be a fundamental misconfiguration in **robotcontrol** itself. Review the [Getting Started: Basic Setup](#getting-started-basic-setup) instructions.
> 	* If **robotcontrol** detects the new task but the robot does not start drawing then review the troubleshooting tips for step 3 in this test procedure.
> 	* If the drawing machine starts drawing but does not draw correctly, you may need to check the physical build of the machine. Review the [build instructions here](hw/MindstormsNXT/README.md). You should also re-check the dimensional and gear ratio settings as shown in step 7, above.
> 

--

###PART 3: Assemble the Lego Sketchbot

We will start with the base from a robot arm designed by [Dave Parker](http://www.nxtprograms.com), then add a new arm section on top.

**Special thanks** to Dave for making such a great collection of Mindstorms projects available.

####Build the Base
To build the base, [follow the instructions through step 9 for Dave Parker's robot arm](http://www.nxtprograms.com/robot_arm/steps.html) (cached copy [here](http://webcache.googleusercontent.com/search?q=cache:4DkidHRrL44J:www.nxtprograms.com/robot_arm/steps.html+&cd=1&hl=en&ct=clnk&gl=us)) then **return here**. Don't do steps 10 or later.

####Build the Middle Arm Segment
1. http://www.youtube.com/watch?v=oXg4AtbPvps
2. http://www.youtube.com/watch?v=3XTaGui2jnM
3. http://www.youtube.com/watch?v=9fZ-UtHjJJk
4. http://www.youtube.com/watch?v=cgvkJ4SA5oA
5. http://www.youtube.com/watch?v=VrQFO2uMBqI

####Connect the Middle Arm to the Base
http://www.youtube.com/watch?v=P2TK4dvqAxU

####Test the Middle Arm Connection
http://www.youtube.com/watch?v=qYW05iyw0Yk

####Build the Limit Switch
http://www.youtube.com/watch?v=JPnMxgQ9hYE

####Connect the Limit Switch to the Base
http://www.youtube.com/watch?v=-udeuvL_3iU

####Build the Stylus
http://www.youtube.com/watch?v=naYiju-byI0

####Connect the Stylus to the Middle Arm
http://www.youtube.com/watch?v=Ie9yU_NviAk

####Connect the Cables
http://www.youtube.com/watch?v=aOploTPSCBQ

--

###PART 4: Test the Sketchbot
--

### Troubleshooting 





















