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

###STEP 1: Gather Materials

The first step is to acquire all of the parts we will need to build this project. 

* LEGO® MINDSTORMS® NXT 2.0 Kit
* Pen, Pencil or Brush to attach to the stylus
* Paper

---

###STEP 2: Download the Libary and Install Dependencies

To get up and running with the code you can head over the [Getting Started Guide](https://github.com/GoogleChrome/ChromeWebLab/tree/master/Sketchbots#getting-started-basic-setup) for the main Sketchbot Library and follow the procedures there. Once you can verify the application works, head back here for instructions on building the hardware components.


--

###STEP 3: Assemble the Lego Sketchbot

####Build the Base

####Build the Middle Arm

Middle Arm Construction (5 parts):
http://www.youtube.com/watch?v=oXg4AtbPvps

http://www.youtube.com/watch?v=3XTaGui2jnM

http://www.youtube.com/watch?v=9fZ-UtHjJJk

http://www.youtube.com/watch?v=cgvkJ4SA5oA

http://www.youtube.com/watch?v=VrQFO2uMBqI

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

###STEP 4: Test the Sketchbot
--

### Troubleshooting 





















