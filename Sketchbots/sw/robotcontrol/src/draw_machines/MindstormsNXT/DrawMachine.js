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

	    console.log("------------------------------------------------------");
	    console.log("INITIALIZING MINDSTORM-NXT DRAWMACHINE");
	 	console.log("------------------------------------------------------");

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

	    this.DRAW_TIMEOUT_DELAY = 500;

		//Do NOT initialize communication with the machine here
		//instead do that in createRobot()

		//TODO - other initialization

		this.zero(); //always call this at the end of initialize()
	},

	/**
	 * zeros out the software state of the machine to assume that it is at its home position.
	 * IMPORTANT: This is about state inside node ONLY. This should NOT move the machine!
	 *
	 */
	zero: function() {
		this.buff_type = new Array();
		this.buff_vel =  new Array();
		this.buff_acc =  new Array();
		this.buff_dist = new Array();
		this.buff_cart = [
			new Array(), //buf_cart[0] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the X coordinate for the target point of that command
			new Array(), //buf_cart[1] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the Y coordinate for the target point of that command
			new Array(), //buf_cart[2] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the Z coordinate ("lift" or position of the drawing machine's tool above the sand) for the target point of that command
		];
		this.buff_control = [
			new Array(), //buff_control[0] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the X1 coordinate for the control point of that command (see buff_type)
			new Array(), //buff_control[1] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the Y1 coordinate for the control point of that command (see buff_type)
			new Array(), //buff_control[2] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the X2 coordinate for the control point of that command (see buff_type)
			new Array(), //buff_control[3] will contain an array of numbers, one element for each slot in the current command buffer;  each element contains the Y2 coordinate for the control point of that command (see buff_type)
		];
		this.maxBufferIndex = 0; //an integer indicating the maximum populated index for all of the buff_* variables
		this.currentBufferIndex = 0; //an integer indicating the read position in the command buffer (this should always be <= maxBufferIndex)
		this._drawingServoAngles = new Array();
		this._drawingServoAnglesCursor = 0;
	},

	/**
	 * causes the internal representation of the machine to be created. Put your communication initialization in here.
	 * Should eventually cause a 'robotConnectedToMotionController' event
	 *
	 */
	createRobot: function() {
		//set up a connection to the machine via the serial port specified in our config
		this._robot = new Robot3Axis(ConfigParams.MINDSTORMS_NXT__SERIAL_PORT, ConfigParams.MINDSTORMS_NXT__AXIS_CONFIG);

		this._robot.on('connected', function() {
			//connected to the robot, let our listeners know
			console.log('********************** Connected to MindstormsNXT drawing machine **********************');
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
		//this.goHome();
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
		console.log(this._robot);
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
	doInitialCalibration: function(){
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
		this._calculateDrawingAngles(); //calculates all drawing angles

	    console.log("------------------------------------------------------");
	    console.log("BEGINNING TO DRAW");
	    console.log("------------------------------------------------------");

		this._simulateMachineEvent('timeEstimate', 1000, (new Date().getTime()/1000) + 60); //simulate 60 second drawings

		//this._drawingServoAnglesCursor = 0; //using currentBufferIndex instead
		this._drawNextPart();

		//this._simulateMachineEvent('drawingComplete', 2000);
		//this._simulateMachineEvent('readyForPicture', 3000);
	},

    /*
     * private functions
     *
     */

    _drawNextPart: function() {
    	
    	//console.log("removing all listeners");
    	this._robot.removeAllListeners();

    	console.log("DRAWING NEXT PART: Index #" + this.currentBufferIndex);

    	
    	if (this.currentBufferIndex >= this.maxBufferIndex) {
    		console.log("DRAWING COMPLETE / READY FOR NEXT PICTURE");
    		this.emit('drawingComplete');
    		this.emit('readyForPicture');
    		return;

    	} else {

  			console.log('Going to next coord at:  ' + this._drawingServoAngles[this.currentBufferIndex] + ' in 1 second');
	        console.log('X = ' + this.buff_cart[0][this.currentBufferIndex] + ' Y = ' + this.buff_cart[1][this.currentBufferIndex] + ' Z = ' + this.buff_cart[2][this.currentBufferIndex]);

  			setTimeout(function() {

  				this._robot.once('synchronizedMoveDone', function() {
		            this.currentBufferIndex++;
		            console.log("remaining coords => " + (this.maxBufferIndex - this.currentBufferIndex));
		          	this._drawNextPart(); //recursion
  				}.bind(this));

  				console.log("a: " + this._drawingServoAngles[this.currentBufferIndex]);
  				this._robot.synchronizedMove(this._drawingServoAngles[this.currentBufferIndex]);

  			}.bind(this), this.DRAW_TIMEOUT_DELAY);

  		}
    	
    },

    _calculateDrawingAngles: function() {
    	//this._drawingServoAngles = new Array(this.buff_cart.length);
    	this._drawingServoAngles = new Array(this.maxBufferIndex);

    	for (var i = 0, il = this._drawingServoAngles.length; i < il; i++) {
    		this._drawingServoAngles[i] = this._doIk(this.buff_cart[0][i], this.buff_cart[1][i], this.buff_cart[2][i]);
    		console.log("ANGLES: " + this._drawingServoAngles[i]);
    	}
    	    	
    },

    /**
     * given an (x,y,z) point and information about the robot's geometery, determine the correct
     * angles (in degrees) for the three joint motors.
     *
     * Returns a 3-dimensional array, [baseMotorDegrees, lowerMotorDegrees, upperMotorDegrees]
     *
     * Calculations based on this paper by Dr. Rainer Hessmer, October 2009
     * http://www.hessmer.org/uploads/RobotArm/Inverse%20Kinematics%20for%20Robot%20Arm.pdf
     *
     */
    _doIk: function(x, y, z) {

    	console.log("X: " + x + " Y: " + y + " : " + z);

    	if(x < ConfigParams.DRAW_PARAMETERS.robotXMin || x > ConfigParams.DRAW_PARAMETERS.robotXMax) {
    		console.log("DrawMachine: x == "+x+", which is outside the range set by ConfigParams.DRAW_PARAMETERS.robotXMin ("+ConfigParams.DRAW_PARAMETERS.robotXMin+") and robotXMax ("+ConfigParams.DRAW_PARAMETERS.robotXMax+")" );
    	}

    	if(y < ConfigParams.DRAW_PARAMETERS.robotYMin || y > ConfigParams.DRAW_PARAMETERS.robotYMax) {
    		console.log("DrawMachine: y == "+y+", which is outside the range set by ConfigParams.DRAW_PARAMETERS.robotYMin ("+ConfigParams.DRAW_PARAMETERS.robotYMin+") and robotYMax ("+ConfigParams.DRAW_PARAMETERS.robotYMax+")" );
    	}

    	var xadj, yadj, zadj, // adjust x, y, z from center of base gear to center of gear 1 because of turntable
    		theta0, theta1,	theta2, // base angle, gear angle 1, gear 2 angle
	    	l1,l2,	// leg lengths
				l1sq, l2sq, // leg lengths squared
				k1, k2,
				d, r,
				dsq,
				xsq, ysq,
				zprime, zprimesq, // z prime 
				theta2calc,
				sinTheta2,
				cosTheta2,
				theta0deg, theta1deg, theta2deg,
				angsrad, angsdeg,
				nxttheta0, nxttheta1, nxttheta2,
				nxtangs,
				radianToDegree;

		// first get the base angle so we can offset the x,y,z for the turntable
		theta0 = Math.atan2(y, x);

			// now go ahead and set the variables and square them for easier reference
	    xadj = x - ConfigParams.BASEROFFSET*Math.cos(theta0);
	    yadj = y - ConfigParams.BASEROFFSET*Math.sin(theta0);
	    zadj = z - ConfigParams.BASEZOFFSET;
	    l1 = ConfigParams.LINK_B;
		l2 = ConfigParams.LINK_D;
	    xsq = xadj*xadj;
		ysq = yadj*yadj;
		d = Math.sqrt(xsq + ysq);
		dsq = d*d;
		zprime = zadj - ConfigParams.BASEHEIGHT;
		zprimesq = zprime*zprime;
		l1sq = l1*l1;
		l2sq = l2*l2;
		radianToDegree = 180 / Math.PI;

		// calculate theta2, the gear 2 angle
		theta2calc = (dsq + zprimesq - l1sq - l2sq)/(2*l1*l2);
		sinTheta2 = Math.sqrt( 1 - Math.pow( theta2calc, 2 ) );
		cosTheta2 = theta2calc;
		theta2 = Math.atan2(-sinTheta2, cosTheta2);

		// use theta2 to calculate theta1, the gear 1 angle
		k1 = l1 + l2*Math.cos(theta2);
		k2 = l2*Math.sin(theta2);
		theta1 = Math.atan2(zprime,d) - Math.atan2(k2,k1);

		// convert from radians to degrees
		theta0deg = theta0 * radianToDegree;
		theta1deg = theta1 * radianToDegree;
		theta2deg = theta2 * radianToDegree;
	    
	    // don't really need this step, but good for debugging
	    // log out the raw angles to check arm positions
	  	angsrad = [theta0, theta1, theta2];
			angsdeg = [theta0deg, theta1deg, theta2deg];
	  	//console.log('thetas in radians: ' + angsrad);
			console.log('thetas in degrees: ' + angsdeg);

			// if angles are outside of arm bounds, warn the user, but don't stop the drawing
			if (theta0deg < ConfigParams.GEAR0ZEROANGLE){
				console.log("******** Coordinate is outside of arm bounds because it would require Axis 0 to go beyond its rotation range ********")
			}
			if (theta1deg > ConfigParams.GEAR1ZEROANGLE){
				console.log("******** Coordinate is outside of arm bounds because it would require Axis 1 to go beyond its rotation range ********")
			}
			if (theta2deg < ConfigParams.GEAR2ZEROANGLE){
				console.log("******** Coordinate is outside of arm bounds because it would require Axis 2 to go beyond its rotation range ********")
			}

			// convert angles into mindstorm space
			theta1deg -= ConfigParams.GEAR1GEOMOFFSET; // account for offset of gear2
			nxttheta0 = theta0deg - ConfigParams.GEAR0ZEROANGLE;
			nxttheta1 = ConfigParams.GEAR1ZEROANGLE - theta1deg;
			nxttheta2 = ConfigParams.GEAR2ZEROANGLE - theta2deg;

			// log out nxt angles to check arm positions
			nxtangs = [ nxttheta0, nxttheta1, nxttheta2 ];
			//console.log('angles for nxt in degrees: ' + nxtangs);

			// add in the 'slop' of the mindstorm gears
			nxtangs[0] += ConfigParams.GEAR0OFFSET;
			//nxtangs[0] = 0;
			nxtangs[1] += ConfigParams.GEAR1OFFSET; 
			//nxtangs[1] = 0;
			nxtangs[2] -= ConfigParams.GEAR2OFFSET;
			//nxtangs[2] = 0;
			//console.log('angles for nxt offset for slop: ' + nxtangs);

			return(nxtangs);
    },

    _simulateMachineEvent: function(eventName, delay, obj) {
    	if (!delay) delay = 1000;
    	if (!obj) obj = null;
    	setTimeout( function() { this.emit(eventName, obj); }.bind(this), delay);
    }

});