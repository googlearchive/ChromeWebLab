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
var ConfigParams = require('../../ConfigParams').ConfigParams;
var Robot3Axis = require('./Robot3Axis').Robot3Axis;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// DrawMachine
///// Coverts Draw commands into commands for the motion controller.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.DrawMachine = new Class({
	Implements: [Events, Options, process.EventEmitter],
	//Implements: [Events, Options],

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
	buff_vel:  new Array(), //will contain an array of numbers, one element for each slot in the current command buffer; each element is the velocity of one command
	buff_acc:  new Array(), //will contain an array of numbers, one element for each slot in the current command buffer; each element is the acceleration of one command
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
	 * private variables
	 *
	 */
	_robot: null,
	_drawingServoAngles: new Array(),
	_drawingServoAnglesCursor: 0,


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
	},

	/**
	 * zeros out the software state of the machine to assume that it is at its home position.
	 * IMPORTANT: This is about state inside node ONLY. This should NOT move the machine!
	 *
	 */
	zero: function() {
		this._robot.moveToZero();
	},

	/**
	 * causes the internal representation of the machine to be created. Put your communication initialization in here.
	 * Should eventually cause a 'robotConnectedToMotionController' event
	 *
	 */
	createRobot: function() {
		//set up a connection to the machine via the serial port specified in our config
		this._robot = new Robot3Axis(ConfigParams.MINDSTORMS_NXT__SERIAL_PORT, ConfigParams.MINDSTORMS_NXT__AXIS_CONFIG);

		this._robot.on('connected', function() { //connected to the robot, let our listeners know
			console.log('*********** Connected to MindstormsNXT drawing machine ***********');
			this.doInitialCalibration();
			this.emit('robotConnectedToMotionController');
		}.bind(this));
		this._robot.connect();
	},

	/**
	 * causes the machine to rotate its turntable.
	 * The MindstormsNXT DrawMachine does not support a turntable, so
	 * this method will emit a 'turntableMotionComplete' event after a timeout.
	 *
	 */
	moveTurntable: function() {
		//TODO - move the turntable
		this._simulateMachineEvent('turntableMotionComplete');
	},

	/**
	 * causes the machine to completely reset its state, the meaning of which is machine-specific.
	 */
	reset: function() {
		//reset the local machine state using zero()
		this.zero();

		//send the robot home
		this.goHome();
	},

	/**
	 * causes the machine to return to its home position.
	 * Should eventually cause a 'robotAtHome' event
	 *
	 */
	goHome: function() {
		this._robot.once('moveToZeroDone', function() {
			this.emit('robotAtHome');
		}.bind(this));
		this._robot.moveToZero();
	},

	/**
	 * Calibrates the machine, the meaning of which is machine-specific.
	 * Eventually should cause a 'robotCalibrated' event
	 *
	 */
	calibrate: function() {
		this._robot.once('moveToZeroDone', function() {
			this.emit('robotCalibrated');
		}.bind(this));
		this._robot.moveToZero();
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
	 * The MindstormsNXT DrawMachine does not support a turntable, so
	 * this method will emit a 'turntableMotionComplete' event after a timeout.
	 *
	 */
    partialWipe: function(){
    	this._simulateMachineEvent('turntableMotionComplete');
    },


	/**
	 * Causes the machine to start drawing.
	 * Should eventually cause 'timeEstimate', and 'drawingComplete' events, in that order
	 *
	 */
	start: function() {
		console.log("STARTING DRAWING");
		this._calculateDrawingAngles();
		this._drawingServoAnglesCursor = 0;
		this._drawNextPart();
		this._simulateMachineEvent('timeEstimate', 1000, (new Date().getTime()/1000) + 60); //simulate 60 second drawings
		//this._simulateMachineEvent('drawingComplete', 2000);
		//this._simulateMachineEvent('readyForPicture', 3000);
	},

    /*
     * private functions
     *
     */

    _drawNextPart: function() {
    	if (this._drawingServoAnglesCursor >= this._drawingServoAngles.length) {
    		this.emit('drawingComplete');
    		this.emit('readyForPicture');
    		return;
    	}
    	this._robot.removeAllListeners();
    	this._robot.once('synchronizedMoveDone', this._drawNextPart.bind(this));
    	this._robot.synchronizedMove(this.DRAWING_SPEED, this._drawingServoAngles[this._drawingServoAnglesCursor]);
    	this._drawingServoAnglesCursor++;
    },

    _calculateDrawingAngles: function() {
    	this._drawingServoAngles = new Array(this.buff_cart.length);

    	for (var i = 0, il = this._drawingServoAngles.length; i < il; i++) {
    		this._drawingServoAngles[i] = this._doIk(this.buff_cart[0][i], this.buff_cart[1][i], this.buff_cart[2][i]);
    	}
    	console.log("----------------------------------------------------");
    	console.log(this._drawingServoAngles);
    },

    /**
     * given an (x,y,z) point and information about the robot's geometery, determine the correct
     * angles (in degrees) for the three joint motors.
     *
     * Returns a 3-dimensional array, [baseMotorDegrees, lowerMotorDegrees, upperMotorDegrees]
     *
     */
    _doIk: function(x, y, z) {
    	var theta0, theta1,	// base angle, gear angle 1
		    	theta2,	// gear 2 angle
		    	l1,l2,	// leg lengths
					l1sq, l2sq,
					k1, k2,
					d, r,
					dsq,
					xsq, ysq,
					zprime, zprimesq,
					theta2calc,
					sinTheta2,
					cosTheta2,
					theta0deg, theta1deg, theta2deg,
					angsrad, angsdeg,
					nxttheta0, nxttheta1, nxttheta2,
					nxtangs;

			x = this._map(x, 0, 600, 6, 23);
			y = this._map(y, 0, 600, 6, 23);

			console.log("GCODE COORDS => " + x + ' : ' + y + ' : ' + z);

			var GEAR0ZEROANGLE = 16.187;
			var GEAR1ZEROANGLE = 45.584;
			var GEAR2ZEROANGLE = -134.5;

			var GEAR0OFFSET = 6;
			var GEAR1OFFSET = 8.5;
			var GEAR2OFFSET = 12.5;
    
    	var BASEROFFSET = 2.5; // radial distance from center of base gear to center of gear1
    	var BASEZOFFSET = 3.44; // vertical distance from top of base gear to center of gear1
    	var GEAR1GEOMOFFSET = 5.593; // degrees, angle of rt triangle with l1 as hyp and 1.34 as opp leg, 1.34 is the offset of gear2 from the plane of l1

			var baseheight     = 6.43;

			l1 = 13.75; // Link B from ConfigParams.js
			l2 = 18.4;  // Link D from ConfigParams.js
    
			// base angle
			theta0 = Math.atan2(y, x);
    	//console.log('theta0: ' + theta0);
    	var xadj = x - BASEROFFSET*Math.cos(theta0);
    	var yadj = y - BASEROFFSET*Math.sin(theta0);
    	var zadj = z - BASEZOFFSET;
    
    	xsq = xadj*xadj;
			ysq = yadj*yadj;
			d = Math.sqrt(xsq + ysq);
			dsq = d*d;
			zprime = zadj - baseheight;
			zprimesq = zprime*zprime;
			l1sq = l1*l1;
			l2sq = l2*l2;

			theta2calc = (dsq + zprimesq - l1sq - l2sq)/(2*l1*l2);
			//console.log('theta2calc: ' + theta2calc);
			sinTheta2 = Math.sqrt( 1 - Math.pow( theta2calc, 2 ) );
			cosTheta2 = theta2calc;
			//console.log('sinTheta2: ' + sinTheta2 + ', cosTheta2: ' + cosTheta2);
			theta2 = Math.atan2(-sinTheta2, cosTheta2);
			//console.log('theta2: ' + theta2);

			k1 = l1 + l2*Math.cos(theta2);
			k2 = l2*Math.sin(theta2);
			theta1 = Math.atan2(zprime,d) - Math.atan2(k2,k1);
			//console.log('theta1: ' + theta1);

			theta0deg = theta0 * 180 / Math.PI;
			theta1deg = theta1 * 180 / Math.PI;
			theta2deg = theta2 * 180 / Math.PI;
		    
		  //theta2deg = -(180 - Math.abs(theta2deg));
		  //theta1deg = 90 - theta1deg;
		    
		  angsrad = [theta0, theta1, theta2];
			angsdeg = [theta0deg, theta1deg, theta2deg];
		  console.log('thetas in radians: ' + angsrad);
			console.log('thetas in degrees: ' + angsdeg);

			if (theta0deg < GEAR0ZEROANGLE){
				console.log("Coordinate is outside of arm bounds. Gear 0 is the culprit.")
			}
			if (theta1deg > GEAR1ZEROANGLE){
				console.log("Coordinate is outside of arm bounds. Gear 1 is the culprit.")
			}
			if (theta2deg < GEAR2ZEROANGLE){
				console.log("Coordinate is outside of arm bounds. Gear 2 is the culprit.")
			}
    
    	theta1deg -= GEAR1GEOMOFFSET; // account for offset of gear2
			// convert angles into mindstorm space
			nxttheta0 = theta0deg - GEAR0ZEROANGLE;
			nxttheta1 = GEAR1ZEROANGLE - theta1deg;
			nxttheta2 = GEAR2ZEROANGLE - theta2deg;
	
			nxtangs = [ nxttheta0, nxttheta1, nxttheta2 ];
			console.log('angles for nxt in degrees: ' + nxtangs);
	
			nxtangs[0] += GEAR0OFFSET;
			nxtangs[1] += GEAR1OFFSET;
			nxtangs[2] -= GEAR2OFFSET;
			console.log('angles for nxt offset for slop: ' + nxtangs);

			return(nxtangs);
    },

    _map: function(val, inMin, inMax, outMin, outMax) {
    	return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    _simulateMachineEvent: function(eventName, delay, obj) {
    	if (!delay) delay = 1000;
    	if (!obj) obj = null;
    	setTimeout( function() { this.emit(eventName, obj); }.bind(this), delay);
    }

});
