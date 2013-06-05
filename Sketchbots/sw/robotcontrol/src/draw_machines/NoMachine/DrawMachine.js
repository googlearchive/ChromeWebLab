/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
require('mootools');
var ConfigParams = require('../../ConfigParams').ConfigParams;


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
	 initialize: function(options){
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
		this._simulateMachineEvent('robotConnectedToMotionController');
	},

	/**
	 * causes the machine to rotate its turntable.
	 * Should eventually cause a 'turntableMotionComplete' event
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
		//TODO - reset the machine
	},

	/**
	 * causes the machine to return to its home position.
	 * Should eventually cause a 'robotAtHome' event
	 *
	 */
	goHome: function() {
		//TODO - home the machine
		this._simulateMachineEvent('robotAtHome');
	},

	/**
	 * Causes the machine to start drawing.
	 * Should eventually cause 'timeEstimate', and 'drawingComplete' events, in that order
	 *
	 */
	start: function() {
		//TODO - start drawing
		this._simulateMachineEvent('timeEstimate', 1000, (new Date().getTime()/1000) + 60); //simulate 60 second drawings
		this._simulateMachineEvent('drawingComplete', 2000);
		this._simulateMachineEvent('readyForPicture', 3000);
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
		//TODO - calibrate the robot
		this._simulateMachineEvent('robotCalibrated');
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
	 * Should eventually cause a 'turntableMotionComplete' event.
	 *
	 */
    partialWipe: function(){
    	//TODO - perform partial wipe
    	this._simulateMachineEvent('turntableMotionComplete');
    },

    /*
     * private functions
     *
     */

    _simulateMachineEvent: function(eventName, delay, obj) {
    	if (!delay) delay = 1000;
    	if (!obj) obj = null;
    	setTimeout( function() { this.emit(eventName, obj); }.bind(this), delay);
    },


});





