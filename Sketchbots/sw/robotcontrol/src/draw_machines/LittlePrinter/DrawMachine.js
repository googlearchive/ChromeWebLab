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

var restler = require('restler');
var ConfigParams = require('../../ConfigParams').ConfigParams;

var Canvas = require('canvas'),
    Image = Canvas.Image,
    fs = require('fs');


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// DrawMachine
///// Coverts Draw commands into steps for the motion controller.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.DrawMachine = new Class({
    Implements: [Events, Options, process.EventEmitter],

    /**
     * This class is required to emit only these events:
     *      'sensorError' - if there is a downstream error which means that sensor values are unreliable or unavailable
     *      'robotConnectedToMotionController' - when we have a successful connection between robot and motion controller
     *      'turntableMotionComplete' - when the draw machine has finished moving the turntable (e.g. to wipe the sand)
     *      'robotAtHome' - when the draw machine's robotics are in their home position
     *      'readyForPicture' - when the draw machine is in a state where it is appropriate to capture an image of the current drawing
     *      'robotCalibrated' - when the draw machine has finished its self-calibration routine
     *      'timeEstimate' - when the draw machine has a new or updated estimate on the time that its current drawing will be complete. The payload of the event should be the time estimate, expressed as a Unix timestamp.
     *      'drawingComplete' - when the draw machine is done with the current drawing
     *
     */

    options: {},

    /*
     * public variables
     *
     */

    buff_type: new Array(), //will contain an array of integers, one element for each slot in the current command buffer; each element in the array will have one of these values: 0=point, 1=line, 2=bezier
    buff_vel: new Array(), //will contain an array of numbers, one element for each slot in the current command buffer; each element is the velocity of one command
    buff_acc: new Array(), //will contain an array of numbers, one element for each slot in the current command buffer; each element is the acceleration of one command
    buff_dist: new Array(), //will contain an array of numbers, one element for each slot in the current command buffer; each element is the distance parameter of one command
    buff_cart: [
        new Array(), //buf_cart[0] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the X coordinate for the target point of that command
        new Array(), //buf_cart[1] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the Y coordinate for the target point of that command
        new Array(), //buf_cart[2] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the Z coordinate ("lift" or position of the drawing machine's tool above the sand) for the target point of that command
    ],
    buff_control: [
        new Array(), //buff_control[0] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the X1 coordinate for the control point of that command (see buff_type)
        new Array(), //buff_control[1] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the Y1 coordinate for the control point of that command (see buff_type)
        new Array(), //buff_control[2] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the X2 coordinate for the control point of that command (see buff_type)
        new Array(), //buff_control[3] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the Y2 coordinate for the control point of that command (see buff_type)
    ],
    maxBufferIndex: 0, //an integer indicating the maximum populated index for all of the buff_* variables
    currentBufferIndex: 0, //an integer indicating the read position in the command buffer (this should always be <= maxBufferIndex)

    /*
     * public functions
     *
     */


    /**
     * initialize the DrawMachine class. Do not set up machine communication here. This is for state initialization.
     *
     */
    initialize: function(options) {
        this.setOptions(options);

        this.BUFFER_SIZE = 3000;
        this.maxBufferIndex = 0;
        this.currentBufferIndex = 0;
        this.buff_vel = new Array(this.BUFFER_SIZE);
        this.buff_acc = new Array(this.BUFFER_SIZE);
        this.buff_dist = new Array(this.BUFFER_SIZE);
        this.buff_cart = new Array(3);
        this.buff_cart[0] = new Array(this.BUFFER_SIZE);
        this.buff_cart[1] = new Array(this.BUFFER_SIZE);
        this.buff_cart[2] = new Array(this.BUFFER_SIZE);
        this.buff_control = new Array(3);
        this.buff_control[0] = new Array(this.BUFFER_SIZE);
        this.buff_control[1] = new Array(this.BUFFER_SIZE);
        this.buff_control[2] = new Array(this.BUFFER_SIZE);
        this.buff_control[3] = new Array(this.BUFFER_SIZE);
        this.buff_type = new Array(this.BUFFER_SIZE);

        //Do NOT initialize communication with the machine here
        //instead do that in createRobot()

        //TODO - other initialization

        this.zero(); //always call this at the end of initialize()
    },

    /**
     * causes the internal representation of the machine to be created. Put your communication initialization in here.
     * Should eventually cause a 'robotConnectedToMotionController' event
     *
     */
    createRobot: function() {
        //TODO - set up a connection to the machine
        console.log("LITTLE PRINTER CONNECTED")
        this.emit('robotConnectedToMotionController');
    },

    /**
     * causes the machine to rotate its turntable.
     * Should eventually cause a 'turntableMotionComplete' event
     *
     */
    moveTurntable: function() {
        //TODO - move the turntable
        console.log('turntableMotionComplete')
        this.emit('turntableMotionComplete');
    },

    /**
     * causes the machine to completely reset its state, the meaning of which is machine-specific.
     */
    reset: function() {
        //TODO - reset the machine
        console.log('reset')
        this.zero();
        this.goHome();
    },

    /**
     * causes the machine to return to its home position.
     * Should eventually cause a 'robotAtHome' event
     *
     */
    goHome: function() {
        console.log('robotAtHome:', this);
        this.emit('robotAtHome');
        return
    },

    /**
     * Causes the machine to start drawing.
     * Should eventually cause 'timeEstimate', and 'drawingComplete' events, in that order
     *
     */
    start: function() {
        //TODO - start drawing

        console.log("LITTLE PRINTER: Start")
        console.log(this.maxBufferIndex)
        console.log(JSON.stringify(this.buff_cart))
        this._simulateMachineEvent('timeEstimate', 1000, (new Date().getTime() / 1000) + 60); //simulate 60 second drawings
        var canvas = new Canvas(640, 480);
        var ctx = canvas.getContext('2d');
        var scale = 10
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 640, 480);
        ctx.save();
        ctx.fillStyle = "#000000";

        var minX = 100000,
            maxX = 0
        var minY = 100000,
            maxY = 0;
        for (var i = 0; i < this.maxBufferIndex; i++) {
            var x = parseFloat(this.buff_cart[0][i]);
            var y = parseFloat(this.buff_cart[1][i]);

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        var scaleX = 640 / (maxX - minX);
        var scaleY = 480 / (maxY - minY);

        var xOffset = 0;
        if (minX < 0)
            xOffset = -minX;
        else
            xOffset = minX;

        var yOffset = 0;
        if (minY < 0)
            yOffset = minY;
        else
            yOffset = -minY;

        var penDown = true;
        for (var i = 0; i < this.maxBufferIndex; i++) {
            var x = parseFloat(this.buff_cart[0][i]);
            var y = parseFloat(this.buff_cart[1][i]);
            var z = parseFloat(this.buff_cart[2][i]);

            var xD = 640 - Math.floor(((x + xOffset) / (maxX - minX)) * 640)
            var yD = 480 - Math.floor(((y + yOffset) / (maxY - minY)) * 480)

            if (z == 1 && penDown == false) {
                // The pen needs to be put down
                ctx.save()
                ctx.beginPath();
                ctx.moveTo(xD, yD);

                penDown = true;
            } else if (z == 1 && penDown == true) {
                // the pen needs to come up
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                ctx.stroke();
                ctx.restore();
                penDown = false;
            }

            if (z == 0) {
                // We know the pen must be down, so draw lines.
                ctx.lineTo(xD, yD);
            }

        }

        var that = this;

        canvas.toBuffer(function(err, buf) {
            if (err) throw err;

            var uri = canvas.toDataURL("image/png");
            var htmlstring = '<html><body><h1>Web Lab</h1><img style="width:384px; height: 288px;" src="' + uri + '"></body></html>';
            console.log(htmlstring);

            restler.post("http://remote.bergcloud.com/playground/direct_print/" + ConfigParams.LITTLE_PRINTER.DEVICE_ID, {
                data: {
                    html: htmlstring
                }
            }).on("complete", function(data, response) {
                console.log(data)
                console.log(response)
                that.emit('drawingComplete');
                that.emit('readyForPicture');
            });
        });
    },

    /**
     * zeros out the software state of the machine to assume that it is at its home position.
     * IMPORTANT: This is about state inside node ONLY. This should NOT move the machine!
     *
     */
    zero: function() {
        //TODO - zero the machine state
    },

    /**
     * Calibrates the machine, the meaning of which is machine-specific.
     * Eventually should cause a 'robotCalibrated' event
     *
     */
    calibrate: function() {
        console.log('robotCalibrated')
        this.emit('robotCalibrated');
    },

    /**
     * indicates that the machine should do "initial" calibration, which could be more involved than subsequent calibration.
     * If the machine does nothing different on initial or subsequent calibration, then this function should just call calibrate()
     * See calibrate().
     * Eventually should cause a 'robotCalibrated' event
     *
     */
    doInitialCalibration: function() {

        this.calibrate();
    },

    /**
     * Causes the machine to perform a partial wipe, usually done right after calibration completes.
     * Should eventually cause a 'turntableMotionComplete' event.
     *
     */
    partialWipe: function() {
        //TODO - perform partial wipe
        this.emit('turntableMotionComplete');
    },

    /*
     * private functions
     *
     */

    _simulateMachineEvent: function(eventName, delay, obj) {
        if (!delay) delay = 1000;
        if (!obj) obj = null;
        setTimeout(function() {
            this.emit(eventName, obj);
        }.bind(this), delay);
    },
});
