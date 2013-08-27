/*
    Copyright 2013 Google Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// ConfigParams
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (exports == null){
	var exports = {};
}
var os = require('os');
//var process = require('process');

exports.ConfigParams = {
    /* The name of this sketchbot. This should be all letters and numbers, no punctuation except - and . */
    SKETCHBOT_NAME: 'sketchbot0',
    /* The name of the "domain" in which the sketchbot is working. Sketchbots that are physically or logically near to each other should have the same value here. If this doesn't make sense, then just leave it as-is. */
    SKETCHBOT_DOMAIN: os.hostname(),

    /* if true, then will try to use HTTPS (TLS) communication with the labqueue server. Otherwise we'll use plain HTTP */
    LABQUEUE_USE_HTTPS: false,
    /* server details for communication with api */
    LABQUEUE_HOSTNAME: 'localhost',
    /* port for communication with api, eg. 8080, 80, 443 etc.*/
    LABQUEUE_PORT: 8080,
    LABQUEUE_APP_KEY: '',
    LABQUEUE_APP_SECRET: '',
    /* the labqueue queue topic from which this sketchbot should get drawings */
    QUEUE_TOPIC: 'sketchbot-drawings',
    /* how often to check for a new drawing */
    DRAWING_CHECK_DELAY: 4000,
    /* delay between retries when waiting for media upload before stopping a task */
    TASK_STOP_DELAY: 1000,

    /* target drawing dimensions, in px */
    DRAWING_WIDTH_PX: 260,
    DRAWING_HEIGHT_PX: 364,

    /* when enabled, this tracks the number of failed serial connections since last boot */
    VIDEO_STOP_DELAY: 5000,
    ARTIFACT_POST_RETRY_LIMIT: 10,
    /* when enabled, the sketchbot will take a photo at the end of every drawing, upload the photo to the labqueu server and add a link to the photo to the drawing task record on the server */
    CAPTURE_AND_UPLOAD_MEDIA: true,

    /* set to true to send console output to Loggly <www.loggly.com>. Warning: we generate a LOT of console output! If false, then we will only log to the local console.
    To use Loggly you will also have to set LOGGLY_SUBDOMAIN and LOGGLY_KEY to the values provided by Loggly for your account.
    */
    USE_LOGGLY: true,
    LOGGLY_SUBDOMAIN: 'xxxxxx', //Only needed if USE_LOGGLY is true, get this from your loggly account
    LOGGLY_KEY: 'xxxxxx', //Only needed if USE_LOGGLY is true, get this from your loggly account

    /* while drawing, NodeJsDrawMachine will output various image files and other data to allow you to see what it is
    working on in realtime. WORK_OUTPUT_WATCH_PATH is the path in which those files should be saved. */
    WORK_OUTPUT_WATCH_PATH: 'captured_images',

    /* when being assigned a new drawing task, the sketchbot will save a copy of its source image to disk to make it easier
    to see what the sketchbot is currently working on. WORK_INPUT_WATCH_PATH is the path in which these files should be saved. */
    WORK_INPUT_WATCH_PATH: 'downloaded_images',

    /* NodeJsDrawMachine is capable of internally saving its log output to a file. To use this feature, set LOG_TO_FILE to true
    and set LOG_PATH to the location in which it should save log files. */
    LOG_TO_FILE: false,
    LOG_PATH: 'logs',

    /* when generating g-code from drawings, this is the height, in mm, to which the tool will be raised when making a "travel"
    move (e.g. when one part of the drawing is done and the tool needs to be moved to another spot without making a mark) */
    GCODE_CONVERSION_TOOL_TRAVEL_Z: 10, //mm
    /* when generating g-code from drawings, this is the feed rate, in mm/minute, at which the tool will be moved when making a "travel"
    move (e.g. when one part of the drawing is done and the tool needs to be moved to another spot without making a mark) */
    GCODE_CONVERSION_TOOL_TRAVEL_FEED_RATE: 3000,
    /* when generating g-code from drawings, this is the feed rate, in mm/minute, at which the tool will be moved when the tool is
    in contact with the work material (e.g. when the tool is cutting or extruding material) */
    GCODE_CONVERSION_TOOL_DRAW_FEED_RATE: 900,

    /* when outputting an SVG prepresentation of the current drawing, this is the color used for paths */
    SVG_CONVERSION_PATH_COLOR: '#ec967b',
    
    /* when outputting a PNG prepresentation of the current drawing, this is the color used for paths */
    PNG_CONVERSION_PATH_COLOR: '#ec967b',


    /**
     * general draw machine configuration parameters. These are used by all draw machine types
     */

    /* image dimension, used to scale the drawing */
    CAM_X: 200,
    CAM_Y: Math.floor((200/3.0)*4.0),
    /* max draw time determines the size of the buffer used for commands */
    MAX_DRAW_TIME: 10,
    /*
     * the length of the arm segments
     *
     * See diagram in ../../../docs/images/sketchbots_arm_links.png
     *
     */
    /*
    //These values are applicable to the HomebrewGalil robots used by chromeweblab.com
    LINK_A: 4.3, //distance, in cm, plate from the center of the base axis, along the surface of the base, to the axis of the lower large gear
    LINK_B: 36.4, //distance, in cm, from axis of lower large gear to axis of upper large gear
    LINK_C: 3.5, //distance, in cm, from axis of upper large gear, along its radius, to its intersection with midline of the forearm
    LINK_D: 44.6, //distance, in cm, from aforementioned intersection to tool tip
    BASE_GEAR_RATIO: 18,
    LOWER_ARM_GEAR_RATIO: 9.6,
    UPPER_ARM_GEAR_RATIO: 6.6,
    PAN_GEAR_RATIO: 72,
    */
    //These values are applicable to the MindstormsNXT robots described in ../../../README.md
    LINK_A: 2.25, //LINK_A: 2.46, //distance, in cm, plate from the center of the base axis, along the surface of the base, to the axis of the lower large gear
    LINK_B: 13.75, //distance, in cm, from center of lower large gear to center of upper large gear
    LINK_C: 0.0, //distance, in cm, from axis of upper large gear, along its radius, to its intersection with midline of the forearm
    LINK_D: 18.4, //distance, in cm, from aforementioned intersection to tool tip
    BASEROFFSET = 2.5, // radial distance from center of base gear to center of gear1
    BASEZOFFSET = 3.44, // vertical distance from top of base gear to center of gear1
    GEAR1GEOMOFFSET = 5.593, // degrees, angle of rt triangle with l1 as hyp and 1.34 as opp leg, 1.34 is the offset of gear2 from the plane of l1
    BASEHEIGHT = 6.43, // from top of drawing surface to the top of the base gear

    //Gear ratios
    BASE_GEAR_RATIO: 56/8,
    LOWER_ARM_GEAR_RATIO: 40/8,
    UPPER_ARM_GEAR_RATIO: 1,
    PAN_GEAR_RATIO: 1,
    
    //When the robot zeroes, these are the real world angles the arms rest in
    //See the README to see how to adjust these
    GEAR0ZEROANGLE = 16.187,
    GEAR1ZEROANGLE = 45.584,
    GEAR2ZEROANGLE = -134.5,

    //The 'slop' in the Mindstorm gears. Essentially, the motor control 'thinks' the zero angle is different than it actually is, so we compensate in the IK function
    GEAR0OFFSET = 6,
    GEAR1OFFSET = 8.5,
    GEAR2OFFSET = 12.5,

    /* controls rate and geometry of drawing */

    DRAW_PARAMETERS: {
        'chunkSize':3000,
        'velocity':100,
        'acceleration':200,
        'robotXMin':6, // in cms, might should be in mms
        'robotXMax':22, //
        'robotYMin':6, // 
        'robotYMax':22, //
        'drawPlaneHeight':-9.5,
        'liftDistance':2,
        'turntableTravel':120
    },

    /* // ORIGINAL SETTINGS, KEEPING IN CASE I SCREW SOMETHING UP
    DRAW_PARAMETERS: {
        'chunkSize':3000,
        'velocity':100,
        'acceleration':200,
        'robotXMin':-15,
        'robotXMax':15,
        'robotYMin':25,
        'robotYMax':55,
        'drawPlaneHeight':-9.5,
        'liftDistance':2,
        'turntableTravel':120
    },
    */

    /**************************************************************************************
     **************************************************************************************
     * DRAW_MACHINE_TYPE
     *
     * This parmeter sets the type of draw machine to use. Uncomment the line for the type of draw machine you are using.
     * Uncomment ONE and only ONE DRAW_MACHINE_TYPE line.
     *
     */
     //DRAW_MACHINE_TYPE: 'HomebrewGalil', // For any 4-axis draw machine using a Galil motion controller
     //DRAW_MACHINE_TYPE: 'NoMachine', // Use this setting if you do not have a machine connected to the computer. Drawings will be "drawn" in software only.
     DRAW_MACHINE_TYPE: 'MindstormsNXT', // A 3-axis robot arm built with the LEGO(TM) Mindstorms system. Instructions for building this arm are included in the "hw" folder.
     //DRAW_MACHINE_TYPE: 'LittlePrinter', // Use this for drawing to a pre-configure little printer. 
    /**********************************************************
     *
     * MindstormsNXT-based draw machine configuration parameters
     *
     * See DRAW_MACHINE_TYPE parameter, above.
     * These are only used if for the "MindstormsNXT" draw machine type
     *
     */
    MINDSTORMS_NXT__SERIAL_PORT: '/dev/cu.usbmodem1421',  //'/dev/cu.usbmodemfd121',
    MINDSTORMS_NXT__AXIS_CONFIG: [
        {   //base gearbox
            'motorPort': 1,
            'zeroingDirection': 1,
            'zeroingSpeed': 15,
            'limitSwitchPort': 1,
            'gearBoxConfig': [8, 56] //base gearbox config
        },
        {   //lower arm
            'motorPort': 2,
            'zeroingDirection': 1,
            'zeroingSpeed': 20,
            'limitSwitchPort': null,
            'gearBoxConfig': [8, 40]
        },
        {   //upper arm
            'motorPort': 3,
            'zeroingDirection': 1,
            'zeroingSpeed': 50,
            'limitSwitchPort': null,
            'gearBoxConfig': null
        },
    ],
    
    /*
      Little Printer Configuration
    */
    LITTLE_PRINTER: {
      DEVICE_ID: "N9DQRWTNBHCO" // This needs to be code found at the bottom of http://remote.bergcloud.com/developers/direct_print_codes
    },

    /**********************************************************
     *
     * HomebrewGalil-based draw machine configuration parameters
     *
     * See DRAW_MACHINE_TYPE parameter, above.
     * These are only used if for the "HomebrewGalil" draw machine type
     *
     */

        /* if true, will use the LOWER_SERIAL_PORT and UPPER_SERIAL_PORT direct connections to the arm sensors.
        If false, we will use socket connections to HOMEBREW_GALIL__LOWER_NET_PORT and HOMEBREW_GALIL__UPPER_NET_PORT */
        HOMEBREW_GALIL__USE_DIRECT_SERIAL_ARM_SENSORS: true,
        /* if connecting to serial ports directly, these are the ports for the upper and lower arm sensor arduinos */
        HOMEBREW_GALIL__LOWER_SERIAL_PORT: '/dev/cu.usbmodemfa1341',
        HOMEBREW_GALIL__UPPER_SERIAL_PORT: '/dev/cu.usbmodemfa121',
        /* HOMEBREW_GALIL__ARDUINO_BAUD is the buad rate at which to connect to LOWER_SERIAL_PORT and UPPER_SERIAL_PORT */
        HOMEBREW_GALIL__ARDUINO_BAUD: 38400,
        /* if connecting to serial proxies (serproxy script), these are the ports for the upper and lower arduinos */
        HOMEBREW_GALIL__LOWER_NET_PORT: 10000,
        HOMEBREW_GALIL__UPPER_NET_PORT: 10001,

        /* the IP or hostname of the arm motion controller */
        HOMEBREW_GALIL__CONTROLLER_HOSTNAME: '192.168.3.3',
        HOMEBREW_GALIL__CONTROLLER_TCP_PORT: 23,
        HOMEBREW_GALIL__CONTROLLER_UDP_PORT: 3333,

        /* number of steps in one turn of the motor */
        HOMEBREW_GALIL__MOTOR_STEPS_PER_REV: 200,
        /* number of microsteps per step */
        HOMEBREW_GALIL__MICROSTEPS: 10,
        /* the tip sensor value that indicates the tip is in the sand */
        HOMEBREW_GALIL__TIP_VALUE_THRESHOLD: 40, //cm
        /* how far down the tip goes when checking for sand */
        HOMEBREW_GALIL__SAND_DEPTH_MEASUREMENT_END_POINT: -13,
        /* these angles are used to slightly adjust the coordinate system so it is parallel to the sand */
        HOMEBREW_GALIL__HOMING_UPPER_ANGLE: 90,
        HOMEBREW_GALIL__HOMING_LOWER_ANGLE: 91.5,
        HOMEBREW_GALIL__TURNTABLE_DEGREES_SHORT_WIPE: 90,
        /* used when moving from home (default angles above) to  */
        HOMEBREW_GALIL__SLEEP_STEP_COUNTS_FROM_HOME: [0,0,-2800],
        /* speed acceleration and decelleration for sand pan movement  */
        HOMEBREW_GALIL__PAN_SP: 10000,
        HOMEBREW_GALIL__PAN_AC: 10000,
        HOMEBREW_GALIL__PAN_DC: 10000,

    /*
     * end of HomebrewGalil draw machine parameters
     *
     ***********************************************************/

}; 
