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
///// IK
///// Provides inverse kinematics for the Mindstorms NXT DrawMachine
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.IK = {
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

    	console.log('------------------------------------------------');
    	console.log("X: " + x + " Y: " + y + " Z: " + z);

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
		zprime = zadj - ConfigParams.DRAW_PARAMETERS.drawPlaneHeight;
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
			theta1deg -= ConfigParams.GEAR1GEOMOFFSET; // account for offset of gear between link b and link d
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

			return nxtangs;
    },
};

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
	_HOME_POSITION: {
		x: ConfigParams.DRAW_PARAMETERS.robotXMin + ((ConfigParams.DRAW_PARAMETERS.robotXMax - ConfigParams.DRAW_PARAMETERS.robotXMin)/2),
		y: ConfigParams.DRAW_PARAMETERS.robotYMin,
		z: ConfigParams.MINDSTORMS_NXT__TRAVEL_MOVE_Z
	},

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
		//Do NOT initialize communication with the machine here
		//instead do that in createRobot()

		//TODO - other initialization?

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

	    this.DRAW_TIMEOUT_DELAY = 1;
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
			this._robot.once('synchronizedMoveDone', function() {
				this.emit('robotAtHome');
			}.bind(this));
			this._robot.synchronizedMove(exports.IK._doIk(this._HOME_POSITION.x, this._HOME_POSITION.y, this._HOME_POSITION.z));
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
			this._robot.once('synchronizedMoveDone', function() {
				this.emit('robotCalibrated');
			}.bind(this));
			this._robot.synchronizedMove(exports.IK._doIk(this._HOME_POSITION.x, this._HOME_POSITION.y, this._HOME_POSITION.z));
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

		this.emit('timeEstimate', (new Date().getTime()/1000) + (this.maxBufferIndex * 15)); //guesstimate based on 15s per drawing part

		this._drawingServoAnglesCursor = 0;
		this._drawNextPart();
	},

    /*
     * private functions
     *
     */

    _drawNextPart: function() {
    	
    	//console.log("removing all listeners");
    	this._robot.removeAllListeners();

    	console.log("DRAWING NEXT PART: Index #" + this._drawingServoAnglesCursor + " (max="+this._drawingServoAngles.length+")");

    	
    	if (this._drawingServoAnglesCursor >= this._drawingServoAngles.length) {
    		console.log("DRAWING COMPLETE / READY FOR NEXT PICTURE");
    		this.emit('drawingComplete');
    		this.emit('readyForPicture');
    		return;

    	} else {

  			console.log('Going to next axis configuration. Angles will be ' + this._drawingServoAngles[this._drawingServoAnglesCursor] + ' in '+this.DRAW_TIMEOUT_DELAY+' ms');

  			setTimeout(function() {

  				this._robot.once('synchronizedMoveDone', function() {
		            this._drawingServoAnglesCursor++;
		            console.log("remaining coords => " + (this._drawingServoAngles.length - this._drawingServoAnglesCursor));
		          	this._drawNextPart(); //recursion
  				}.bind(this));

  				this._robot.synchronizedMove(this._drawingServoAngles[this._drawingServoAnglesCursor]);

  			}.bind(this), this.DRAW_TIMEOUT_DELAY);

  		}
    	
    },

    _calculateDrawingAngles: function() {
    	//
    	// figure out the translation/scale to make the drawing fill
    	// the entire robot coordinate space
    	//
    	var minX = 100000000,
    		maxX = 0,
    		minY = 100000000,
    		maxY = 0,
    		xlateX = 0,
    		xlateY = 0,
    		scaleX = 1.0,
    		scaleY = 1.0,
    		originalW = 0,
    		originalH = 0,
    		targetW = ConfigParams.DRAW_PARAMETERS.robotXMax - ConfigParams.DRAW_PARAMETERS.robotXMin,
    		targetH = ConfigParams.DRAW_PARAMETERS.robotYMax - ConfigParams.DRAW_PARAMETERS.robotYMin,
    		il = this.maxBufferIndex;

    	// find bounds of original drawing and ensure that all coordinates are numbers, not strings
    	for (var i = 0; i < this.maxBufferIndex; i++) {
    		//ensure type correctness for all
    		this.buff_cart[0][i] = parseFloat(this.buff_cart[0][i]);
    		this.buff_cart[1][i] = parseFloat(this.buff_cart[1][i]);
    		this.buff_cart[2][i] = parseFloat(this.buff_cart[2][i]);
    		//find bounds
	    	if (this.buff_cart[0][i] < minX) minX = this.buff_cart[0][i];
	    	if (this.buff_cart[0][i] > maxX) maxX = this.buff_cart[0][i];
	    	if (this.buff_cart[1][i] < minY) minY = this.buff_cart[1][i];
	    	if (this.buff_cart[1][i] > maxY) maxY = this.buff_cart[1][i];
	    }
	    originalW = maxX - minX;
	    originalH = maxY - minY;

	    if (originalW >= originalH) {
	    	scaleX = targetW / originalW;
	    	scaleY = scaleX;
	    } else {
	    	scaleY = targetH / originalH;
	    	scaleX = scaleY;
	    }
	    xlateX = ConfigParams.DRAW_PARAMETERS.robotXMin - minX;
	    xlateY = ConfigParams.DRAW_PARAMETERS.robotYMin - minY;

	    console.log('-----------------------------------------------');
	    console.log('Original drawing specs:');
	    console.log('  maxX = '+maxX);
	    console.log('  minX = '+minX);
	    console.log('  maxY = '+maxY);
	    console.log('  minY = '+minY);
	    console.log('  width = '+originalW);
	    console.log('  height = '+originalH);
	    console.log('Translation/scale:');
	    console.log('  xlateX = '+xlateX+' ('+typeOf(xlateX)+')');
	    console.log('  xlateY = '+xlateY+' ('+typeOf(xlateY)+')');
	    console.log('  scaleX = '+scaleX+' ('+typeOf(scaleX)+')');
	    console.log('  scaleY = '+scaleY+' ('+typeOf(scaleY)+')');
	    console.log('Translated/scaled drawing specs:');
	    console.log('  maxX = '+(((maxX - minX) * scaleX) + ConfigParams.DRAW_PARAMETERS.robotXMin));
	    console.log('  minX = '+(((minX - minX) * scaleX) + ConfigParams.DRAW_PARAMETERS.robotXMin));
	    console.log('  maxY = '+(((maxY - minY) * scaleX) + ConfigParams.DRAW_PARAMETERS.robotXMin));
	    console.log('  minY = '+(((minY - minY) * scaleX) + ConfigParams.DRAW_PARAMETERS.robotXMin));
	    console.log('  width = '+((originalW * scaleX)));
	    console.log('  height = '+((originalH * scaleY)));
	    console.log('-----------------------------------------------');

    	//
    	// initialize our angle stack
    	//
    	//this._drawingServoAngles = new Array(this.buff_cart.length);
    	this._drawingServoAngles = new Array();
    	this._drawingServoAnglesCursor = 0;

    	var lastCart = {
    		x: this._HOME_POSITION.x,
    		y: this._HOME_POSITION.y,
    		z: this._HOME_POSITION.z
    	};

    	//
    	// translate, scale and convert points into angles
    	//
    	for (var i = 0; i < il; i++) {

    		// figure out where we are heading in this next step of the buffer
	    	var thisTargetCart = {
	    		x: ((this.buff_cart[0][i] - minX) * scaleX) + ConfigParams.DRAW_PARAMETERS.robotXMin,
	    		y: ((this.buff_cart[1][i] - minY) * scaleY) + ConfigParams.DRAW_PARAMETERS.robotYMin,
	    		z: this.buff_cart[2][i]
	    	}

	    	//safety on the Z parameter
	    	if (thisTargetCart.z > ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z) {
	    		//
	    		// travel move, just get there as quickly as possible
	    		//
	    		thisTargetCart.z = ConfigParams.MINDSTORMS_NXT__TRAVEL_MOVE_Z;
	    		this._pushServoAnglesForPt(thisTargetCart.x, thisTargetCart.y, thisTargetCart.z);

	    	} else {
	    		//
	    		// drawing move, get there safely and as acurately as possible
	    		//
	    		thisTargetCart.z = ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z;

		    	if (lastCart.z == thisTargetCart.z) {
			    	// calculate linear distance from lastCart to thisTargetCart
			    	// and lerp from the last (x,y) position to the target, in case the buffer has insufficient reslotion?
			    	var d, pointsAdded = 0;

			    	console.log('Distance from last point: '+this._dist2d(lastCart, thisTargetCart));

			    	console.log('-----------------------------');
			    	while ((d = this._dist2d(lastCart, thisTargetCart)) > 0.25) {
				    	var p = this._lerp([lastCart.x, lastCart.y], [thisTargetCart.x, thisTargetCart.y], 1);
				    	console.log('d = '+d+', adding lerp point ('+p[0]+','+p[1]+')...');
				    	this._pushServoAnglesForPt(p[0], p[1], ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z);
				    	lastCart.x = p[0];
				    	lastCart.y = p[1];
				    	lastCart.z = ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z;
				    	pointsAdded++;
			    	}
			    	console.log('Lerp points added: '+pointsAdded);
		    	}

		    	this._pushServoAnglesForPt(thisTargetCart.x, thisTargetCart.y, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z);

	    	}

	    	// retain the position we reached so that we can interpolate to the next position if needed
			lastCart = {
				x: thisTargetCart.x,
				y: thisTargetCart.y,
				z: thisTargetCart.z
			};

    	} // for each part in the buffer
    },


    _pushServoAnglesForPt: function(x, y, z) {
    	if (z > ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z) {
	    	this._drawingServoAngles.push(exports.IK._doIk(
	    		x, y, ConfigParams.MINDSTORMS_NXT__TRAVEL_MOVE_Z
	    	));
    	} else {
	    	if (ConfigParams.MINDSTORMS_NXT__STIPPLE == true) {
		    	//
		    	// stippling mode
		    	//
		    	var liftedAngles = exports.IK._doIk(
		    		x, y, ConfigParams.MINDSTORMS_NXT__TRAVEL_MOVE_Z
		    	);
		    	var angles = exports.IK._doIk(
		    		x, y, z
		    	);
		    	// 1. make sure we start at lifted depth
		    	// redundant: this._drawingServoAngles.push([liftedAngles[0], liftedAngles[1], angles[2]]); //NOTE: the third angle is UNCHANGED from the drawn point
		    	// 2. each point is made by moving the stylus to the target point at travel depth...
		    	this._drawingServoAngles.push([angles[0], null, angles[2]]);
		    	// 3. ..then dropping it to drawing depth
		    	this._drawingServoAngles.push(angles);
		    	// 4. ...and then lift only the middle axis
		    	this._drawingServoAngles.push([null, liftedAngles[1], null]);
		    	// 5. ...then get the other two axes into position
		    	//this._drawingServoAngles.push([liftedAngles[0], liftedAngles[1], liftedAngles[2]]); //NOTE: the third angle is UNCHANGED from the drawn point

	    	} else {
	    		//
	    		// regular line mode
	    		//
		    	var angles = exports.IK._doIk(
		    		x, y, z
		    	);
		    	this._drawingServoAngles.push(angles);
	    	}
    	}
    },


	_dist2d: function( point1, point2 ) {
	  var xs = 0;
	  var ys = 0;

	  xs = point2.x - point1.x;
	  xs = xs * xs;

	  ys = point2.y - point1.y;
	  ys = ys * ys;

	  return Math.abs(Math.sqrt(xs + ys));
	},

	_lerp: function(v1, v2, t) {
		var l = v1.length;
		if (v2.length != l) throw new Error("_lerp: cannot lerp because v1.length = "+v1.length+" while v2.length="+v2.length);
		var r = [];
		for (var i = 0; i < l; i++)
			r.push(v1[i] + t * (v2[i] - v1[i]));
		return r;
	},

    _simulateMachineEvent: function(eventName, delay, obj) {
    	if (!delay) delay = 1000;
    	if (!obj) obj = null;
    	setTimeout( function() { this.emit(eventName, obj); }.bind(this), delay);
    }

});