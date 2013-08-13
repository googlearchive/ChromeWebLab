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
require('mootools');
var dgram = require('dgram');
var ArmSensorArduino = require("./ArmSensorArduino").ArmSensorArduino;
var ArmSensorArduinoSocket = require("./ArmSensorArduinoSocket").ArmSensorArduinoSocket;

var net = require('net');
var fs = require('fs');
var CommandBuffer = require('./CommandBuffer').CommandBuffer;
var ResponseBuffer = require('./ResponseBuffer').ResponseBuffer;
var ConfigParams = require('../../ConfigParams').ConfigParams;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// Robot
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.Robot = new Class({
    Implements: [Events, Options, process.EventEmitter],

    options: {
        HOST: ConfigParams.HOMEBREW_GALIL__CONTROLLER_HOSTNAME,
        PORT: ConfigParams.HOMEBREW_GALIL__CONTROLLER_TCP_PORT,
        UDP_PORT: ConfigParams.HOMEBREW_GALIL__CONTROLLER_UDP_PORT,
        MAX_BATCH_SIZE: 490,
        BUFFER_COMMAND_COUNT: 5 * 60 * 1000,
        interval: 5,
        framePeriod: 1,
        sandDepth: -8.5 //cm
    },

    _hConnectingWatchdogInterval: null,

    initialize: function(options) {
        this.setOptions(options);
        this.sandDepth = this.options.sandDepth;

        this.HOST = this.options.HOST;
        this.PORT = this.options.PORT;
        this.UDP_PORT = this.options.UDP_PORT;
        this.BUFFER_COMMAND_COUNT = this.options.BUFFER_COMMAND_COUNT;
        this.MAX_BATCH_SIZE = this.options.MAX_BATCH_SIZE;
        this.PRELOAD_COUNT = 10;
        this.BUFFER_MARGIN = 2;
        this.HOMING_START_ANGLE = 89;
        this.HOMING_UPPER_ANGLE = ConfigParams.HOMEBREW_GALIL__HOMING_UPPER_ANGLE;
        this.HOMING_LOWER_ANGLE = ConfigParams.HOMEBREW_GALIL__HOMING_LOWER_ANGLE;
        this.TURNTABLE_DEGREES_SHORT_WIPE = ConfigParams.HOMEBREW_GALIL__TURNTABLE_DEGREES_SHORT_WIPE;
        this.SLEEP_STEP_COUNTS_FROM_HOME = ConfigParams.HOMEBREW_GALIL__SLEEP_STEP_COUNTS_FROM_HOME;
        this.HOMING_SPEED = 1.0;
        this.SAND_DEPTH_MEASUREMENT_OFFSET = 0.5;
        this.PICTURE_TAKING_DELAY = 4000;


        console.log("=================================================");

        console.log("This robot's motion controller is expected to be on the network at " + ConfigParams.HOMEBREW_GALIL__CONTROLLER_HOSTNAME);
        console.log("The motion controller's TCP port is expected to be " + ConfigParams.HOMEBREW_GALIL__CONTROLLER_TCP_PORT + " and the UDP port is expected to be " + ConfigParams.HOMEBREW_GALIL__CONTROLLER_UDP_PORT);

        //This is just a new stream, but on the other end is the motion controller
        this.motionController = new net.Stream();
        this.motionController.on('data', this.handleData.bind(this));

        this.motionController.on('end', function() {
            console.log("Motion controller disconnected");
            this.connected = false; //are we connected to the motion controller?
        }.bind(this));


        this.motionController.on('connect', function() {
            console.log("Motion controller connected");
        }.bind(this));

        // occasionally, there is a write error
        // currently, all we can do is log it.
        this.motionController.on('error', function() {
            console.log("Motion controller TCP net stream error");
            this.motionController.on('close', function() {
                console.log("Motion controller TCP connection closed due to error.");
                if (this._hConnectingWatchdogInterval) clearInterval(this._hConnectingWatchdogInterval);
            }.bind(this));
        }.bind(this));


        //This is a buffering system that you load up with all the commands
        //you can take one at a time or in batches.
        this.commandBuffer = new CommandBuffer({
            MAX_COMMAND_COUNT: this.BUFFER_COMMAND_COUNT
        });
        this.commandBuffer.on('finished', this.finishedDrawing.bind(this));
        this.commandBuffer.on('flushed', function() {
            console.log("Command buffer has been cleared (" + this.commandBuffer.commandCount + " commands in buffer)");
        }.bind(this));



        //Data coming from the motion controller may be partial, so it is all stored in this object
        //It fires events (fullResponse & acknowledgementResponse) when he has a full response parsed
        this.responseBuffer = new ResponseBuffer();
        this.responseBuffer.on('fullResponse', this.handleBufferResponse.bind(this));
        this.responseBuffer.on('acknowledgementResponse', this.handleAcknowledgementResponse.bind(this));
        this.responseBuffer.on('error', function(error) {
            console.log('motion controller error received: "' + error + '"');
        }.bind(this));


        this.connected = false; //are we connected to the motion controller?


        //flags to look for specific responses from the motion controller
        this.lookForAcknowledgementResponse = false;
        this.lookForBatchSizeResponse = false;


        this.batchCommandCounter = 0; //howmany commands we have sent since last checking the controllers's available buffer size
        this.currentBatchSize = 0; //how many commands we should send before checking the controllers's available buffer size

        this.preloading = false; //Are we preloading?


        console.log("Opening arduinos.");

        if (ConfigParams.HOMEBREW_GALIL__USE_DIRECT_SERIAL_ARM_SENSORS) {
            console.log("This robot's arm state sensors are connected via direct serial connections");
            console.log("The lower arm sensor is expected to be on port " + ConfigParams.HOMEBREW_GALIL__LOWER_SERIAL_PORT);
            console.log("The upper arm sensor is expected to be on port " + ConfigParams.HOMEBREW_GALIL__UPPER_SERIAL_PORT);
            this.arduinoLower = new ArmSensorArduino(ConfigParams.HOMEBREW_GALIL__LOWER_SERIAL_PORT, ConfigParams.HOMEBREW_GALIL__ARDUINO_BAUD);
            this.arduinoUpper = new ArmSensorArduino(ConfigParams.HOMEBREW_GALIL__UPPER_SERIAL_PORT, ConfigParams.HOMEBREW_GALIL__ARDUINO_BAUD);
        } else {
            console.log("This robot's arm state sensors are connected via a serial-to-socket proxy (eg serproxy)");
            console.log("The lower arm sensor is expected to be on localhost:" + ConfigParams.HOMEBREW_GALIL__LOWER_NET_PORT);
            console.log("The upper arm sensor is expected to be on localhost:" + ConfigParams.HOMEBREW_GALIL__UPPER_NET_PORT);
            this.arduinoLower = new ArmSensorArduinoSocket(ConfigParams.HOMEBREW_GALIL__LOWER_NET_PORT);
            this.arduinoUpper = new ArmSensorArduinoSocket(ConfigParams.HOMEBREW_GALIL__UPPER_NET_PORT);
        }

        this.arduinoUpper.on('arduinoError', function() {
            this.emit('arduinoError');
        }.bind(this));
        this.arduinoLower.on('arduinoError', function() {
            this.emit('arduinoError');
        }.bind(this));
        this.on('armDoneMoving', function() {
            console.log("Arm is done moving");
        }.bind(this));

        console.log("=================================================");
    },

    handleUdpResponse: function(msg, rinfo) {
        console.log("GALIL UDP: server got: " + msg + " from " +
            rinfo.address + ":" + rinfo.port);
        for (var i = 0; i < msg.length; i++) {
            console.log("Byte: " + msg[i]);
        }
    },

    udpSend: function(message) {
        var messageToSend = new Buffer(message);
        this.udpSocket.send(messageToSend, 0, messageToSend.length, this.UDP_PORT, this.HOST);
    },

    connect: function() {
        ////////////////////////////////////////////////////////////////
        //Connect to the motion controller
        ////////////////////////////////////////////////////////////////
        if (this.connected) return;

        console.log('Connecting to motion controller: step 1 of 2: establishing TCP connection to ' + this.HOST + ' port ' + this.PORT + '...');

        if (this._hConnectingWatchdogInterval) clearInterval(this._hConnectingWatchdogInterval);
        this._hConnectingWatchdogInterval = setInterval(function() {
            console.log('Still trying to connect to motion controller. Waiting ...');
        }.bind(this), 3000);

        this.motionController.connect(this.PORT, this.HOST, function() {
            console.log('Connecting to motion controller: step 1 of 2: OK. TCP connection established.');

            this.initMotors();

            this.connected = true;

            console.log('Connecting to motion controller: step 2 of 2: establishing UDP channel with ' + this.HOST + ' port ' + this.UDP_PORT);
            this.udpSocket = dgram.createSocket("udp4");

            this.udpSocket.on("error", function(msg, rinfo) {
                console.log('UDP error when communicating with motion controller: ' + msg);
            }.bind(this));

            this.udpSocket.on("listening", function() {
                var address = this.udpSocket.address();
                console.log('Connecting to motion controller: step 2 of 2: OK. UDP channel established.');
                console.log('Connected to motion controller.');
                if (this._hConnectingWatchdogInterval) clearInterval(this._hConnectingWatchdogInterval);
                this.emit('connectedToMotionController');
            }.bind(this));

            this.udpSocket.on('message', function(msg, rinfo) {
                var logMsg = "Received UDP message from motion controller: \n";
                for (var i = 0; i < msg.length; i++)
                    logMsg += "value: " + msg[i] + "\n";
                console.log(logMsg);
            }.bind(this));

            this.udpSocket.bind(this.UDP_PORT);
            this.enableUdpInterrupt();
        }.bind(this));
    },

    initMotors: function() {
        console.log("init motors");
        this.motionController.write("MT -2,-2.5,-2.5,-2.5\r"); //motor type low to high, not reversed stepper
        this.motionController.write("ST\r");
        this.motionController.write("DP 0,0,0,0\r"); //Set current position to zero
        this.motionController.write("OE 0,0,0,0\r"); //Set to continue moving on error
        this.motionController.write("ER 2147483647, 2147483647, 2147483647, 2147483647\r"); //set error limit very high

    },

    enableUdpInterrupt: function() {
        console.log("enableUdpInterrupt");
        this.udpSend("HSS=H\r"); //moves to handler H
        //this.udpSend("WH\r");
        this.udpSend("EI 256, 0, 7\r"); //generates an interrupt when all motors have completed motion

    },

    disableUdpInterrupt: function() {
        console.log("disableUdpInterrupt");
        this.udpSend("HSS=H\r"); //moves to handler H
        //this.udpSend("WH\r"); //checks which handler we are listening to
        this.udpSend("EI 0, 0, 7\r"); //generates an interrupt when all motors have completed motion
    },

    // resets the step counter in the motion controller so that it is possible to keep track of
    // where the arm is, relative to a particular position
    resetMotionControllerCounts: function() {
        console.log("Resetting motion controller internal counts.");
        this.motionController.write("DP*=0\r");
    },

    // get the steps needed to get to a given location.
    // only works reliably if resetMotionControllerCounts() was called at home
    // and if updateCurrentStepCountsFromHome() has provided the currentStepCountsFromHome
    getStepsNeededToReachDestination: function(currentStepCountsFromHome, destination) {
        var stepsNeeded = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
            stepsNeeded[i] = destination[i] - currentStepCountsFromHome[i];
        }
        return stepsNeeded;
    },

    updateCurrentStepCountsFromHome: function() {
        //using udp because it is easier to listen to    
        this.udpSocket.once('message', function(msg, rinfo) {
            var values = msg.toString().split(',');
            var currentStepCountsFromHome = [parseInt(values[0]), parseInt(values[1]), parseInt(values[2])];
            this.emit('updatedCurrentStepCountsFromHome', currentStepCountsFromHome);
        }.bind(this));
        //tell motion controller to report the current step counts
        this.udpSend("TD\r");
    },

    // since this function uses relative moves without looking at the sensors, it should be called
    // only in a chain of events that properly calls resetMotionControllerCounts() while the 
    // robot is at home, before this function is called.
    goToSleepPosition: function() {
        this.once('updatedCurrentStepCountsFromHome', function(currentStepCountsFromHome) {
            var stepsToMove = this.getStepsNeededToReachDestination(currentStepCountsFromHome, this.SLEEP_STEP_COUNTS_FROM_HOME);
            var LOWER_PR = stepsToMove[1];
            var UPPER_PR = stepsToMove[2];
            var AC = 4000;
            var DC = 4000;
            var seconds = 2;
            this.motionController.write("AC ," + AC + "," + AC + "\r"); // acceleration
            this.motionController.write("DC ," + DC + "," + DC + "\r"); //decelleration
            var LOWER_SP = Math.abs(LOWER_PR) / seconds * this.HOMING_SPEED;
            var UPPER_SP = Math.abs(UPPER_PR) / seconds * this.HOMING_SPEED;
            if (LOWER_SP < 20) LOWER_SP = 20; // prevent the galil from hanging on a speed too slow
            if (UPPER_SP < 20) UPPER_SP = 20;
            this.motionController.write("SP ," + LOWER_SP + "," + UPPER_SP + "\r"); //speed
            this.motionController.write("PR ," + LOWER_PR + "," + UPPER_PR + "\r"); //move to x steps
            this.motionController.write("BG BC\r"); //
            this.udpSocket.once('message', function(msg, rinfo) {
                if (msg[1] == 216) {
                    console.log("Robot emitting robotSleeping");
                    this.emit('robotSleeping');
                } else {
                    console.log("Unexpected response from motion controller while waiting for robot to reach sleep position: " + msg);
                }
            }.bind(this));
        }.bind(this));
        this.updateCurrentStepCountsFromHome();
    },

    // this is the calibration sequence that the robot goes through at the start of the program
    // it is very similar to the calibration that happens between jobs except it includes a sand depth
    // check and it rotates the table more
    doInitialCalibration: function() {
        console.log("Doing initial calibration of the robot. Going home.");
        this.goHome();
        this.once('robotAtHome', function() {
            // full wipe to start things off
            console.log("Doing a full wipe.");
            this.moveTurntable(720);
            this.once('turntableMotionComplete', function() {
                //once the robot is home and the table has moved, find the sand depth
                console.log("Finding the sand depth.");
                //move the arm towards the sand
                this.findSandDepth();
                // 'tipSpot' will trigger when the tip reports the set sensor value
                // it should happen two times to be considered a read detection
                this.arduinoUpper.once('tipSpot', function(values) {
                    this.arduinoUpper.once('tipSpot', function(values) {
                        //stop the arm quickly now that the tip is at the sand
                        var DC = 107374080; //high decelleration
                        this.motionController.write("DC ," + DC + "," + DC + "\r"); //send decelleration
                        this.motionController.write("ST BC\r"); //sends stop command to galil
                        // get ready for when the sand depth is computed after the stop
                        // which will generate a 'newSandDepth' event
                        this.once('newSandDepth', function() {
                            // once the sand depth has been found, go back home
                            console.log("Got depth, going to sleep position.");
                            this.goToSleepPosition();
                            // once the robot is home, the robot has been calibrated
                            this.once('robotSleeping', function() {
                                console.log("#####Robot is calibrated and waiting in sleep position####");
                                this.emit('robotCalibrated');
                            }.bind(this));
                        }.bind(this));
                        // compute the depth so the 'newSandDepth' event is emitted
                        this.computeAndEmitSandDepth.delay(1000, this);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },

    calibrate: function() {
        console.log("Calibrating the robot.");
        // There are six steps in the calibration process, which must follow in sequence
        // once the robot is home sleep, wipe, find the sand depth, sleep, and wipe again
        this.goHome(); ////////  1
        this.once('robotAtHome', function() {
            this.goToSleepPosition(); /////////  2
            this.once('robotSleeping', function() {
                console.log("Time to take picture.");

                //rotate the drawing away shortly after the picture is taken
                this.once('readyForPicture', function() {
                    this.moveTurntable.delay(this.PICTURE_TAKING_DELAY, this, this.TURNTABLE_DEGREES_SHORT_WIPE); /////////3
                }.bind(this));

                //wait a few seconds before stopping video and taking picture
                //so that the portrait does not move away too soon, and video
                //does not need such drastic slo-mo
                this.emit.delay(4000, this, 'readyForPicture');

                this.once('turntableMotionComplete', function() {
                    // the sand depth is found once when the program starts
                    // and then it is stored until the next restart of node
                    if (ConfigParams.sandDepth) {
                        console.log("Finding the sand depth.");
                        this.findSandDepth(); /////////  4
                        //takes time, so it can be called before the event is set up
                        //wait for the tip to report a value below the threshold twice
                        this.arduinoUpper.once('tipSpot', function(values) {
                            this.arduinoUpper.once('tipSpot', function(values) {
                                // get ready for when the arm stops and the sand depth is checked,
                                // which will generate an 'armDoneMoving' event which may interfere
                                // with subsequent events if it is not part of the chain
                                this.once('armDoneMoving', function() {
                                    //now call the method that will generate the sand depth event
                                    this.computeAndEmitSandDepth();
                                    // once the sand depth has been found, go back to sleeping position
                                    this.once('newSandDepth', function(depth) {
                                        console.log("Got depth. Storing it and going back to sleep.");
                                        ConfigParams.sandDepth = depth;
                                        this.goToSleepPosition.delay(1000, this); /////////  5
                                        // once the robot is sleeping, partial wipe, then it's done calibrating
                                        this.once('robotSleeping', function() {
                                            this.moveTurntable(this.TURNTABLE_DEGREES_SHORT_WIPE); /////  6
                                            this.once('turntableMotionComplete', function() {
                                                console.log("#####Robot is calibrated####");
                                                this.emit('robotCalibrated');
                                            }.bind(this));
                                        }.bind(this));
                                    }.bind(this));
                                }.bind(this));
                                //stop the arm quickly
                                var DC = 107374080;
                                this.motionController.write("DC ," + DC + "," + DC + "\r"); //decelleration high
                                this.motionController.write("ST BC\r"); //sends stop command
                            }.bind(this));
                        }.bind(this));
                    } else {
                        console.log("Using stored sand depth.");
                        this.goToSleepPosition.delay(1000, this); /////////  5
                        // once the robot is sleeping, partial wipe, then it's done calibrating
                        this.once('robotSleeping', function() {
                            this.emit('robotCalibrated');
                        }.bind(this));
                    }
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },

    //calls findZ() to get the current z according to the motion controller steps
    //waits for the 'newZValue' event to be emitted and then adds an offset and emits 'newSandDepth'
    computeAndEmitSandDepth: function() {
        this.once('newZValue', function(newValue) {
            this.sandDepth = newValue + this.SAND_DEPTH_MEASUREMENT_OFFSET;
            console.log("\n*** New sand depth: " + this.sandDepth + "\n");
            this.emit('newSandDepth', this.sandDepth);
        }.bind(this));
        this.findZ();
    },

    moveTurntable: function(deg) {
        //Send command to move the pan

        if (!deg) deg = 120; //default to 120deg

        var PAN_PR = (ConfigParams.PAN_GEAR_RATIO * ConfigParams.HOMEBREW_GALIL__MICROSTEPS * 200) / (360 / deg); // in steps

        console.log("Going to move pan" + PAN_PR);


        //motion controller settings
        this.motionController.write("PR ,,," + PAN_PR + "\r"); //rotate the number of steps needed
        this.motionController.write("SP ,,," + ConfigParams.HOMEBREW_GALIL__PAN_SP + "\r"); //speed
        this.motionController.write("AC ,,," + ConfigParams.HOMEBREW_GALIL__PAN_AC + "\r"); // acceleration
        this.motionController.write("DC ,,," + ConfigParams.HOMEBREW_GALIL__PAN_DC + "\r"); //decellaeration
        this.motionController.write("BGD\r"); //move motor D

        console.log("Waiting for turntable to complete its rotation");
        this.udpSocket.once('message', function(msg, rinfo) {
            if (msg[1] == 216) {
                console.log("Robot emitting turntableMotionComplete");
                this.emit('turntableMotionComplete');
            } else {
                console.log("Unexpected response from motion controller while waiting for the turntable: " + msg);
            }
        }.bind(this));


    },

    moveTurntableStandalone: function(deg) {
        //Send command to move the pan

        if (!deg) deg = 120; //default to 120deg

        var PAN_PR = (ConfigParams.PAN_GEAR_RATIO * ConfigParams.HOMEBREW_GALIL__MICROSTEPS * 200) / (360 / deg); // in steps

        console.log("Going to move pan" + PAN_PR);


        //motion controller settings
        this.motionController.write("PR ,,," + PAN_PR + "\r"); //rotate the number of steps needed
        this.motionController.write("SP ,,," + ConfigParams.HOMEBREW_GALIL__PAN_SP + "\r"); //speed
        this.motionController.write("AC ,,," + ConfigParams.HOMEBREW_GALIL__PAN_AC + "\r"); // acceleration
        this.motionController.write("DC ,,," + ConfigParams.HOMEBREW_GALIL__PAN_DC + "\r"); //decellaeration
        this.motionController.write("BGD\r"); //move motor D

        console.log("Waiting for turntable to complete its rotation");
        this.udpSocket.on('message', function(msg, rinfo) {
            if (msg[1] == 216) {
                console.log("Robot emitting turntableMotionComplete");
                this.emit('turntableMotionComplete');
            } else {
                console.log("Unexpected response from motion controller while waiting for the turntable: " + msg);
            }
        }.bind(this));


    },

    // moves the base joint (vertical axis) until the optical sensor detects that the arm is centered.
    // when the arm is rotated to one side, the sensor sees dark. when it is rotated to the other side,
    // it sees light. depending on the color that the sensor sees, the arm is rotated left or right
    // until there is a change detected. at that instant, the arm is stopped.
    calibrateBase: function(final) {
        //Send command to calibrate the base
        //fast to the center, will overshoot it, then slow back (final decent)

        var speed = (final) ? 100 : 1500;

        var leftBaseSensor = this.arduinoLower.getBase();
        console.log("left base sensor: " + leftBaseSensor);

        if (leftBaseSensor == 'on') {
            //need to move one way
            this.moveBase(45, speed);
        } else if (leftBaseSensor == 'off') {
            //need to move another way
            this.moveBase(-45, speed);
        } else {
            this.calibrateBase.delay('50', this);
            return;
        }


        //TO DO: CHECK IF IT NEVER REACHED THE CENTER AT END OF MOVE AND NOTIFY THE SERVER

        //this fires if the optical sensor detects that the boundary between the dark and light
        //portions of the undersde of the base has just been crossed (the arm is centered)
        this.arduinoLower.once('baseChange', function() {
            console.log("Base change sensed, sending stop command to motion controller");
            this.motionController.write("ST A\r"); //sends stop command to galil
            console.log("Now waiting for base to stop moving.");
            // it is important to wait for the base to halt and for the motioncontroller to
            // notify that the mottion is complete. otherwise, subsequent commands to
            // the motioncontroller might cause it to generate an error (this has been observed)
            this.udpSocket.once('message', function(msg, rinfo) {
                if (msg[1] == 216) {
                    console.log("Base stopped moving");
                    if (final) {
                        console.log("emitting baseCentered");
                        this.emit.delay(1000, this, 'baseCentered');
                    } else {
                        this.calibrateBase.delay(1000, this, true); //true that this will be the final descent
                    }
                } else {
                    console.log("Unexpected response from motion controller while waiting for robot to reach sleep position: " + msg);
                }
            }.bind(this));
        }.bind(this));
    },

    // sends commands to the motion controller that move the base joint (the one that rotates
    // around a vertical axis) by a specified number of degrees
    moveBase: function(deg, speed) {

        if (!deg) {
            console.log('moveBase() needs a number of degrees to move');
            return;
        }

        if (!speed) speed = 1000;


        var BASE_PR = Number.toInt((deg / 360.0) * (ConfigParams.BASE_GEAR_RATIO * ConfigParams.HOMEBREW_GALIL__MICROSTEPS * ConfigParams.HOMEBREW_GALIL__MOTOR_STEPS_PER_REV)); //-80deg in steps
        console.log('going to move base: ' + deg + ' deg = ' + BASE_PR + ' steps');


        //motion controller settings
        this.motionController.write("PR " + BASE_PR + "\r"); //rotate the number of steps needed
        this.motionController.write("SP " + speed + "\r"); //speed
        this.motionController.write("AC 1000\r"); // acceleration
        this.motionController.write("DC 20000\r"); //decellaeration - Needs to be much higher than Accel to stop quickly
        this.motionController.write("BGA\r"); //move motor A
    },


    //sends the robot to its home position, specified in the configuration parameters file
    //this uses "moveBothArmsTo()" to check the current location and move to the home location
    //because there is error introduced by the rotation sensor's mounting, this is done a few
    //times over to approach the true home location as closely as possible.
    //Changing the angles of the home location in the configuration parameter file will not necessarily
    //result in the robot going to precisely that angle, because the rotation sensors' magnets
    //are off-center, creating an arbitrary, roughly sinusoidal deviation from a linear relationship
    //between the sensor read and the true angle. this has been corrected for by manual calibration of
    //each robot's arduinos, placing 90 degrees on the sensor as close as possible to true 90 degrees
    goHome: function() {

        // always approach home from the same location at the same rate
        // this should prevent backlash etc from putting it out of whack        
        console.log("Moving arm to pre-home location");
        this.moveBothArmsTo(this.HOMING_START_ANGLE, this.HOMING_START_ANGLE, 4);

        // once the arm is at the homing start point, move to 90 90
        this.once('armDoneMoving', function() {
            this.moveBothArmsTo(this.HOMING_LOWER_ANGLE, this.HOMING_UPPER_ANGLE, 4);
            // once the arm is at home do the rest of the homing
            this.once('armDoneMoving', function() {
                // do it a second time to arrive at a more precise position
                this.moveBothArmsTo(this.HOMING_LOWER_ANGLE, this.HOMING_UPPER_ANGLE, 1);
                this.once('armDoneMoving', function() {
                    console.log("Arm is at home. Now centering base.");
                    this.arduinoLower.once('newLowerValue', function(lvalue) {
                        console.log("Lower value: " + lvalue);
                    }.bind(this));
                    this.arduinoUpper.once('newUpperValue', function(uvalue) {
                        console.log("Upper value: " + uvalue);
                    }.bind(this));
                    this.calibrateBase(null);
                    this.once('baseCentered', function() {
                        console.log("Base centered. Robot is home. Resetting the motioncontroller counts.");
                        // once at home, prepare to move relative to the home location
                        this.resetMotionControllerCounts();
                        this.emit('robotAtHome');
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));


    },


    //checks the current location of the arm according to the arduinos
    //and moves it to the location specified in the parameters
    moveBothArmsTo: function(lowerDestination, upperDestination, seconds) {
        // the move will only be executed once both arduinos have generated a
        // new data value. this helps avoid using stale data
        console.log("Moving to: " + lowerDestination + " " + upperDestination);
        console.log("Waiting for arduinos to respond.");
        this.arduinoUpper.once('newUpperValue', function(uvalue) {
            console.log("Got upper arduino value: " + uvalue);
            this.arduinoLower.once('newLowerValue', function(lvalue) {
                console.log("Got lower arduino value: " + lvalue);
                var upperArmCurrent = this.arduinoUpper.getUpperArmDegrees();
                //prevent the arm from trying to swing through itself
                if (upperArmCurrent > 180) upperArmCurrent -= 360;
                var lowerArmCurrent = this.arduinoLower.getLowerArmDegrees();
                //prevent the arm from trying to swing through itself
                if (lowerArmCurrent > 180) lowerArmCurrent -= 360;
                var upperDegrees = upperDestination - upperArmCurrent;
                var lowerDegrees = lowerDestination - lowerArmCurrent;
                this.moveBothArmsByDegrees(upperDegrees, lowerDegrees, seconds);
            }.bind(this));
        }.bind(this));

    },

    moveBothArmsByDegrees: function(upperDegrees, lowerDegrees, seconds) {

        //Caculate howmany steps per degree
        var upperDegreesCoef = (ConfigParams.HOMEBREW_GALIL__MOTOR_STEPS_PER_REV * ConfigParams.HOMEBREW_GALIL__MICROSTEPS * ConfigParams.UPPER_ARM_GEAR_RATIO) / 360.0;

        var UPPER_PR = Math.floor(upperDegrees * upperDegreesCoef); //how many steps needed to get where were going

        //Caculate howmany steps per degree on this arm
        var lowerDegreesCoef = (ConfigParams.HOMEBREW_GALIL__MOTOR_STEPS_PER_REV * ConfigParams.HOMEBREW_GALIL__MICROSTEPS * ConfigParams.LOWER_ARM_GEAR_RATIO) / 360.0;

        //So... how many steps do we need to move
        var LOWER_PR = Math.floor(lowerDegrees * lowerDegreesCoef);


        //var SP = 1000; //speed
        var AC = 1; //acceleration
        var DC = 1; //deceleration


        //motion controller settings
        console.log("sending arm calibration motion commands");

        this.motionController.write("AC ," + AC + "," + AC + "\r"); // acceleration
        this.motionController.write("DC ," + DC + "," + DC + "\r"); //decelleration
        //set up the speeds of the arm sections
        var LOWER_SP = Math.abs(LOWER_PR) / seconds * this.HOMING_SPEED;
        var UPPER_SP = Math.abs(UPPER_PR) / seconds * this.HOMING_SPEED;
        if (LOWER_SP < 20) LOWER_SP = 20; // prevent the galil from hanging on a speed too slow
        if (UPPER_SP < 20) UPPER_SP = 20;
        //load in the speed and step count for each motor
        //the preceding comma is there to indicate that no values are being sent to the first channel
        this.motionController.write("SP ," + LOWER_SP + "," + UPPER_SP + "\r"); //speed
        this.motionController.write("PR ," + LOWER_PR + "," + UPPER_PR + "\r"); //move to x steps
        //the motion controller has four output channels:
        // A = base
        // B = lower arm
        // C = upper arm
        // D = pan rotation
        this.motionController.write("BG BC\r"); //starts motion on the arm channels B and C

        console.log("sent arm calibration motion commands");
        var signalMotionComplete;
        signalMotionComplete = function(msg, rinfo) {
            if (msg[1] == 216) {
                console.log("######Reached end of move while moving by: " + lowerDegrees + ", " + upperDegrees);
                this.emit('armDoneMoving');
            } else if (msg[0] == 58) {
                console.log("Ack from motioncontroller while homing. Resetting interrupt handler and waiting for next response.");
                this.udpSocket.once('message', signalMotionComplete);
            } else {
                //Maybe want to check here for other responses and then if empty response, keep checking?
                //Could mess up bots so better be careful
                console.log("Unexpected status code from motioncontroller while homing: " + msg + " May not have moved arms to the final location. This could be normal during a depth check.");
            }
        }.bind(this);
        this.udpSocket.once('message', signalMotionComplete);

    },

    // this function moves the arm towards the sand
    // the code that calls this function stops the arm when the surface of the sand is detected
    // by the sensor at the tip.
    // the move is done in two stages, the first is a quick move to a point above the sand
    // the second is a slower move to a point below the surface of the sand
    findSandDepth: function() {
        var degreesQuick = this.doIK(10, ConfigParams.LINK_D, ConfigParams.HOMEBREW_GALIL__SAND_DEPTH_MEASUREMENT_END_POINT + 3); //go down to initial depth
        var degreesFinal = this.doIK(10, ConfigParams.LINK_D, ConfigParams.HOMEBREW_GALIL__SAND_DEPTH_MEASUREMENT_END_POINT); //go down to -11
        //make a quick move the the rough area
        console.log("Checking depth. Making a quick move close to the target zone.");
        this.moveBothArmsTo(degreesQuick[1], degreesQuick[2], 2);
        this.once('armDoneMoving', function() {
            //make a slow move to the target zone
            console.log("Checking depth. Making a slow move to the target zone.");
            this.moveBothArmsTo.delay(1000, this, [degreesFinal[1], degreesFinal[2], 4]);
        }.bind(this));
    },

    getUpperAngleFromSteps: function(steps) {
        return steps * 360.0 / (ConfigParams.HOMEBREW_GALIL__MOTOR_STEPS_PER_REV * ConfigParams.HOMEBREW_GALIL__MICROSTEPS * ConfigParams.UPPER_ARM_GEAR_RATIO);
    },

    getLowerAngleFromSteps: function(steps) {
        return steps * 360.0 / (ConfigParams.HOMEBREW_GALIL__MOTOR_STEPS_PER_REV * ConfigParams.HOMEBREW_GALIL__MICROSTEPS * ConfigParams.LOWER_ARM_GEAR_RATIO);
    },

    findZ: function() {
        //using udp because it is easier to listen to    
        this.udpSocket.once('message', function(msg, rinfo) {
            var values = msg.toString().split(',');
            // add 90 to make the z value correspond to the joints' rotated
            // positions at home
            var newValue = this.getZFromAngles(this.getLowerAngleFromSteps(parseInt(values[1])) + 90, this.getUpperAngleFromSteps(parseInt(values[2])) + 90);
            console.log("New Z value is:" + newValue);
            this.emit('newZValue', newValue);
        }.bind(this));
        console.log("Requesting current steps from motion controller.");
        //tell motion controller to report the current step counts
        this.udpSend("TD\r");
    },

    findSensedZ: function() {
        //reads the 2 sensors, and returns the Z value of the drawing head from it.


        var lowerDeg = this.arduinoLower.getLowerArmDegrees();
        if (lowerDeg > 180) lowerDeg -= 360;
        var upperDeg = this.arduinoUpper.getUpperArmDegrees();
        if (upperDeg > 180) upperDeg -= 360;

        if (lowerDeg < 0 || upperDeg < 0) {
            this.findSensedZ.delay(50, this);
            return;
        }
        this.getZFromAngles(lowerDeg, upperDeg);
    },

    getZFromAngles: function(lowerDeg, upperDeg) {
        var degToRad = 0.017453293;
        var pi = 3.14159265;

        var A = ConfigParams.LINK_B;
        var hypotCDSQ = ConfigParams.LINK_C * ConfigParams.LINK_C + ConfigParams.LINK_D * ConfigParams.LINK_D;
        var B = Math.sqrt(hypotCDSQ);


        var Z = A * Math.sin((lowerDeg * degToRad)) - B * Math.sin(pi - ((upperDeg + 4.1) * degToRad) - (lowerDeg * degToRad));

        return Z;
    },

    doIK: function(x, y, z) {
        //return an array full of the degrees needed from all 3 motors to achieve a XYZ position.
        //X is untested, and has no affect on y/z

        var radToDeg = 57.2957795;

        var PI_2 = 6.283185307179586;
        var PI_OVER_2 = 1.570796326794897;

        var LINK_A = ConfigParams.LINK_A;
        var LINK_B = ConfigParams.LINK_B;
        var LINK_C = ConfigParams.LINK_C;
        var LINK_D = ConfigParams.LINK_D;

        var ik_sq_linkc_linkd_hypot = LINK_C * LINK_C + LINK_D * LINK_D;
        var ik_linkc_linkd_hypot = Math.sqrt(ik_sq_linkc_linkd_hypot);
        var ik_atan_linkc_o_linkd = Math.atan(LINK_C / LINK_D);
        var ik_sq_linkb = LINK_B * LINK_B;
        var ik_2_linkb = 2.0 * LINK_B;
        var ik_j3_offset = ik_atan_linkc_o_linkd + PI_OVER_2;

        var r = Math.sqrt(x * x + y * y) - LINK_A;
        var h = Math.sqrt(r * r + z * z);
        var t1 = Math.acos(r / h);

        if (z < 0) t1 = -1.0 * t1;

        var sq_h = h * h;

        var t2 = Math.acos((ik_sq_linkb + sq_h - ik_sq_linkc_linkd_hypot) / (ik_2_linkb * h));
        var t3 = Math.acos((ik_sq_linkb + ik_sq_linkc_linkd_hypot - sq_h) / (ik_2_linkb * ik_linkc_linkd_hypot));



        var baseDeg = (Math.atan2(-1.0 * x, y)) * radToDeg;
        var lowerArmDeg = (t1 + t2 - PI_OVER_2) * radToDeg;
        var upperArmDeg = (t3 - ik_j3_offset) * radToDeg;

        lowerArmDeg += 90.0;
        upperArmDeg += 90.0;

        var returnArr = [];

        returnArr[0] = baseDeg;
        returnArr[1] = lowerArmDeg;
        returnArr[2] = upperArmDeg;


        return returnArr;
    },




    reset: function() {
        //flags to look for specific responses from the motion controller
        this.lookForAcknowledgementResponse = false;
        this.lookForBatchSizeResponse = false;

        this.batchCommandCounter = 0; //howmany commands we have sent since last checking the controllers's available buffer size
        this.currentBatchSize = 0; //how many commands we should send before checking the controllers's available buffer size

        this.preloading = false; //Are we proloading?


        this.commandBuffer.flush();

    },



    fillCommandBuffer: function(data) {
        ////////////////////////////////////////////////////////////////
        //Fill the command buffer with all the data we have.
        //We will pull from it when we need commands to send
        ////////////////////////////////////////////////////////////////
        var cmdStart = 0;
        var cmdEnd = 0;

        var cmdEndTokenChar = '\r'.charCodeAt(0); //0/r123\r0123\r

        var commandsPushed = 0;

        for (var i = 0; i < data.length; i++) {
            if (data[cmdEnd] == cmdEndTokenChar) {
                var command = data.toString("utf-8", cmdStart, cmdEnd + 1); //"CD-01,-01,-01\r";
                this.commandBuffer.push(command);
                commandsPushed++;
                //console.log('pushing on: '+command.replace(/\r/gi,"\\r"));
                cmdStart = cmdEnd + 1;
            }
            cmdEnd++;
        }

        this.emit('commandBufferFilled');

        console.log('pushed ' + commandsPushed + ' commands');

    },


    startContourStream: function() {
        ////////////////////////////////////////////////////////////////
        //Start the countour mode on the controller and start the stream going to it
        //Sets up the controller for the stream - Inits preload
        ////////////////////////////////////////////////////////////////

        console.log("Starting Position:");

        this.motionController.write("ST\r");
        this.motionController.write("RP\r");
        this.motionController.write("TM 500\r"); //lowering TM ensures you'll get 1 ms per contour segment
        this.motionController.write("SH\r"); //Servo here (turn on motors)
        this.motionController.write("CM ABC\r"); //start up contour segment
        //this.motionController.write("DT -1\r"); //preload contour mode - MOVED BELOW

        //Timeout to wait for all commands to respond back before starting
        setTimeout(function() {
            console.log("start preload");

            //Will send this many commands during preload - Don't preload more than commands available
            this.currentBatchSize = (this.commandBuffer.commandCount > this.PRELOAD_COUNT) ? this.PRELOAD_COUNT : this.commandBuffer.commandCount;

            this.preloading = true; //start the preloading

            //Set time between command reads
            this.motionController.write("DT -1\r"); //preload contour mode (DT sets time)

            this.sendNextCommandInBatch(); //Start the proces by sending the first command out
        }.bind(this), 2000);

    },


    drawContours: function(data) {
        ////////////////////////////////////////////////////////////////////////
        //Start the contour drawing stuff
        ////////////////////////////////////////////////////////////////////////
        console.log('drawContours');
        this.reset(); //make sure we are all clean before loading the data in
        this.fillCommandBuffer(data);
        this.startContourStream();
    },

    handleData: function(data) {
        ////////////////////////////////////////////////////////////////////////
        //Data came from the controller, send it to the response buffer to take care of
        ////////////////////////////////////////////////////////////////////////		
        this.responseBuffer.parseData(data);
        // Close the client socket completely	
        //client.destroy();
    },

    handleBufferResponse: function(response) {
        ////////////////////////////////////////////////////////////////////////
        //We sent off a command, and the controller responded. This is to handel that response
        ////////////////////////////////////////////////////////////////////////
        //Should we be looking for a batch size response?

        //console.log('response: '+response);


        //A BatchSizeResponse is a response after asking the room left in the controllers buffer
        if (this.lookForBatchSizeResponse) {

            //Convert the response to an int
            this.currentBatchSize = response.toInt() > this.MAX_BATCH_SIZE ? this.MAX_BATCH_SIZE : response.toInt();
            this.currentBatchSize -= this.BUFFER_MARGIN;
            this.currentBatchSize = this.currentBatchSize > 0 ? this.currentBatchSize : 0;
            //console.log('going to stream in '+this.currentBatchSize+' more commands');

            //If the buffer can take more than 0 commands, send more
            if (this.currentBatchSize > 0) {
                this.sendNextCommandInBatch();
                this.lookForBatchSizeResponse = false;
                this.batchCommandCounter = 0;
            } else {
                //If the controller's buffer is full, wait 100ms and check again
                console.log("controller buffer full, checking again in 100ms");
                setTimeout(function() {
                    this.checkControllerBufferSize();
                }.bind(this), 100);

            }
        }
    },

    handleAcknowledgementResponse: function() {
        ////////////////////////////////////////////////////////////////////////
        //An acknolowedgement is when the motioncontroller simply responds ":"
        //But we consider this an acknolowedgement only if we should be watching for one
        ////////////////////////////////////////////////////////////////////////
        if (this.lookForAcknowledgementResponse) {


            //WHAT WE ARE DOING HERE
            //We need to sends the commands to the motion controller one at a time.
            //We wait to get acknowledgement back before sending the next
            //The controller has a specific buffer size, so we cant just send them one will nilly as it could over fill the buffer
            //We dont want to check every time we send a command how full the buffer is so we: Ask howe many we could send, 
            //and we send that many and check again, The controller will probably have run some if not most of the commands by then,
            //But it could also have not, so this is the minimum that we can check the buffer and be sure that we will not overfill it.

            if (this.batchCommandCounter >= this.currentBatchSize - 1) { //the -1 MUST BE here or will overfill

                if (this.preloading) { //is this part of the preload?
                    console.log("we just finished preloading here!");

                    console.log("frame period is: " + this.framePeriod);
                    //this.batchCommandCounter--;
                    this.preloading = false;
                    this.motionController.write("DT " + this.framePeriod + "\r"); //start contouring, 1 sample per ms
                } else {
                    this.checkControllerBufferSize();
                }

                //console.log("Sent over as many as needed, minus margin, checking for new count");

            } else {
                if (this.preloading) {
                    console.log("we are still preloading here!");
                }

                this.sendNextCommandInBatch(); //Got an ack, so send next command
                this.batchCommandCounter++;
            }


        }
        //console.log('from buffer response handler: '+response);

        //acc until we have end of line character
        //generate event when finished		
    },



    setFramePeriod: function(period) {
        this.framePeriod = period;
    },

    checkControllerBufferSize: function() {
        ////////////////////////////////////////////////////////////////
        //Query the motion controller to find out how much room (in commands) is available in its buffer
        ////////////////////////////////////////////////////////////////
        this.lookForBatchSizeResponse = true;
        this.motionController.write("MG_CM\r");
    },

    sendNextCommandInBatch: function() {
        ////////////////////////////////////////////////////////////////
        //Get the next command in the batch and send it off
        // If next command is null, we should shut down
        ////////////////////////////////////////////////////////////////	
        var nextCommand = this.commandBuffer.getNextCommand();

        if (nextCommand != null) {
            this.lookForAcknowledgementResponse = true;
            this.motionController.write(nextCommand);
        } else {
            //shutdown here by sending end command
        }
    },

    finishedDrawing: function() {
        console.log("Robot finished drawing.");

        this.lookForBatchSizeResponse = false;
        this.lookForAcknowledgementResponse = false;

        this.motionController.write("CD 0,0,0=0\r");

        //wait for an entire motioncontrol buffer's worth of data before calling finished
        this.emit.delay(this.framePeriod * 512, this, 'drawingComplete');
    }

});
