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
var nodeNxt = require ('node-nxt');
var crypto  = require('crypto');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// Robot
///// Maintains state information about the Mindstorms NXT motion controller and encapsulates movement logic
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.Robot3Axis = new Class({
	Implements: [Events, process.EventEmitter],

	/**
	 * This class emits the following events:
	 *		'connected' - when a connection to the motion controller has been established
	 *		'moveToZeroDone' - when the work of moveToZero() is done
	 *		'synchronizedMoveDone' - when a move requested with synchronizedMove() is done
	 *		
	 */

	/*
	 * public variables
	 *
	 */

	/*
	 * private variables
	 *
	 */
	_serialPortName: null, //the name of the serial port to which the NXT is connected
	_nxt: null, //holds a reference to the active nxt object from the callback to nodeNxt.connect()
	_nxtSync: null, //holds a reference to an _NxtMotorSynchronizer instance
	_allZeroed: false, //set to true after the robot's servo tachos have been zeroed
	_axisConfig: null, //configuration structure for axes
	_axis: null, //an array of Axis objects which represent the NXT's motors
	_gearBoxes: null, //an array of GearBox objects which represent the gearing on each axis


	_zeringOrder: [1, 1, 2, 0], //see initialize()
	_zeroingOrderIndex: 0, //when in the process of running moveToZero(), this contains the index for an element in zeroingOrder, which in turn indicates the index of the axis currently being zeroed

	_syncMoving: false,

	/**
	 * initialize the Mindstorms NXT Robot class. You must call connect() and wait for
	 * the 'conencted' event before doing anything else with this class.
	 *
	 * Arguments:
	 *		serialPortName - the name of the serial port the NXT is using
	 *		axisConfig - an array of objects which contain configuration info for each of this
	 *						robot's axis. Each element in the array should look like this:
	 *						{
								'motorPort': 1, //1=A, 2=B, 3=C
								'zeroingDirection': Robot3Axis.COUNTER_CLOCKWISE, //(or Robot3Axis.CLOCKWISE) - the direction the motor should turn when zeroing
								'zeroingSpeed': 50, //the speed the axis should turn when zeroing
								'limitSwitchPort': null, //null for no limit switch, or 1-4
								'gearBoxConfig': [n, n, ...],  //list of gear sizes starting with the one mounted on the motor's axle
							}
	 *
	 *		zeroingOrder - an array indicating the order in which to zero the axes, defaults to [1, 2, 0]
	 *
	 */
	initialize: function(serialPortName, axisConfig, zeroingOrder) {
		this._serialPortName = serialPortName;
		this._nxt = null;
		this._axisConfig = axisConfig;
		if (zeroingOrder != null) this._zeringOrder = zeroingOrder;
	},

	/**
	 * connects to the motion controller (the NXT brick), will eventually emit
	 * a 'connected' event.
	 *
	 */
	connect: function() {
		nodeNxt.connect(this._serialPortName, function (nxt) {
			//retain a reference to the nxt object
			this._nxt = nxt;
			this._nxtSync = new _NxtMotorSynchronizer(this._nxt);
			this._nxtSync.on('connected', function() {
				//display a message on the NXT brick display
				this._nxt.DisableNXT(0);
				//construct our Axis objects
				this._axis = new Array(this._axisConfig.length);
				this._gearBoxes = new Array(this._axisConfig.length);
				for (var a = 0, al = this._axisConfig.length; a < al; a++) {
					//
					// create the axis object
					//
					this._axis[a] = new _Axis(
						this._nxt,
						this._nxtSync,
						this._axisConfig[a].motorPort,
						this._axisConfig[a].zeroingSpeed,
						this._axisConfig[a].zeroingDirection,
						this._axisConfig[a].limitSwitchPort,
						this._axisConfig[a].runningSpeed
					);
					//
					// create the axis' gearbox config
					//
					if (this._axisConfig[a].gearBoxConfig != null)
						this._gearBoxes[a] = new _SimpleGearBox(this._axisConfig[a].gearBoxConfig);
					else
						this._gearBoxes[a] = new _SimpleGearBox([1]);
				}
				//tell listeners we are done
				this.emit('connected');
			}.bind(this));
		}.bind(this));
	},

	/**
	 * goes through a series of moves in order to determine the robot motors' to their absolute
	 * zero position. When complete, this will cause a 'moveToZeroDone' event to be emitted.
	 *
	 * Will throw an Error if:
	 *		Not yet connected
	 *		Any motor is already moving
	 *
	 */
	moveToZero: function() {
		if (!this._nxt) throw new Error('Robot not yet connected. moveToZero() can only be used after calling connect() and waiting for a "connected" event.');

		//calibrate the motors and reset tacho by calling moveToZero() on each axis
		//and then waiting for all axes to complete the operation
		this._zeroingOrderIndex = 0;
		this._moveNextAxisToZero();
	},


	/**
	 * moves all three motors to specific degree positions with speeds determined
	 * such that all three motors will reach their specified positions at, as nearly as
	 * possible, the same time.
	 *
	 * To leave a motor at its current position specify null for that motor's element in the
	 * targetDegrees argument.
	 *
	 * This method returns immediately. When the move is complete, this class will
	 * emit a 'synchronizedMoveDone' event.
	 *
	 * Arguments:
	 * 		speed - the desired speed for the *entire move*. The actual speed for each motor may be different
	 *		targetDegrees - an Array with exactly three elements, each of which
	 *							is either null (indicating that this motor should not move),
	 *							or a number indicating the degree position to which that
	 *							motor should turn, relative to the zero degree point.
	 *
	 *							Negative numbers are counter-clockwise reltive to 0 degrees; positive numbers are
	 *							clockwise relative to 0 degrees.
	 *
	 *							This is the position you want the output gear of the axis to reach. Assuming that the 'gearBoxConfig'
	 *							parameter of the axis config is correct, the software will automatically account for gearing in order
	 *							to get the output gear to the specified position.
	 *
	 * Will throw an Error if:
	 *		moveToZero() has not yet been called
	 *		the targetDegrees argument does not have the right number of elements
	 *		any motor is already moving
	 *		speed is negative
	 *
	 */
	synchronizedMove: function(targetDegrees) {
		console.log('going to ' + targetDegrees);

		if (!this._allZeroed) throw new Error('Robot not yet zeroed. synchronizedMove() can only be used after calling moveToZero() and waiting for a "moveToZeroDone" event.')
		if (!targetDegrees || targetDegrees.length < this._axis.length) throw new Error('targetDegrees must have exactly '+this._axis.length+' elements');
		if (this._syncMoving) throw new Error('Robot is already moving');

		this._syncMoving = true; //set flag

		var a = 0;
		var al = this._axis.length;
		var gearedPositions = new Array(al);
		var speeds = new Array(al);
		

		//figure the farthest distance to be moved
		console.log('-----------------------------------------------------');
		var turns = 0;
		var maxGearRatio = 0;
		for (a = 0; a < al; a++) {
			gearedPositions[a] = targetDegrees[a] != null ? this._gearBoxes[a].getInputFromOutput(targetDegrees[a]) : null;
			turns = Math.abs(this._gearBoxes[a].getInputFromOutput(1));
			speeds[a] = this._axis[a].getNominalRunSpeed();
			console.log('gearedPositions['+a+'] = '+gearedPositions[a] + ' (motor turns per arm degree='+turns+')');
		}

		this._nxtSync.syncMoveAbs(this._axis, speeds, gearedPositions, function() {
			//all axes have finished their moves
			this._syncMoving = false;
			console.log('ALL AXIS HAVE FINISHED THEIR MOVE');
			console.log('------------------------------------------------------');
			this.emit('synchronizedMoveDone');
		}.bind(this));

	},

	calibrate: function() {
		console.log('------------------------------------');
		console.log('Calibrating motors, see NXT display for details.');
		this._nxtSync.calibrate(this._axis, function() {
			console.log('Done. Final state:');
			for (var a = 0; a < this._axis.length; a++)
				console.log(this._axis[a].toString());
			console.log('------------------------------------');
			this.emit('synchronizedMoveDone');
		}.bind(this));
	},

	/*
	 * private methods
	 *
	 */

	_moveNextAxisToZero: function() {
		if (this._zeroingOrderIndex >= this._zeringOrder.length) return;
		var axisIndex = this._zeringOrder[this._zeroingOrderIndex];
		this._axis[axisIndex].once('moveToZeroDone', function() {
			if (this._allAxisEval(function(axis) {
				return axis.isZeroed();
			})) {
				//all axes have been zeroed
				this._allZeroed = true;
				this.emit('moveToZeroDone');
			} else {
				//still need to zero more axes
				this._zeroingOrderIndex++;
				this._moveNextAxisToZero();
			}

		}.bind(this));
		console.log('Zeroing Axis #'+axisIndex);

		this._axis[axisIndex].moveToZeroAndResetCounter();
	},

	/**
	 * evaluate all axes according to a comparator function and return
	 * true if and only if the fcn returns true for all axes. The fcn
	 * is expected to take one argument, the axis object.
	 *
	 */
	_allAxisEval: function(fcn) {

		console.log("CALLING ALL AXIS EVAL");

		for (var trueCt = 0, a = 0, al = this._axis.length; a < al; a++){
			//console.log("inside _allAxisEval " + trueCt + "this.axis[a]" + this._axis[a]);
			//console.log("typeof: " + typeof(fcn));
			if (fcn(this._axis[a])) trueCt++;
		}
		return trueCt == al;
	},

});

exports.Robot3Axis.CLOCKWISE = 1;
exports.Robot3Axis.COUNTER_CLOCKWISE = -1;

/**
 * The SimpleGearBox class represents a simple multi-gear gearbox. This class CANNOT represent gearboxes
 * in which one axel drives more than one gear.
 *
 */
var _SimpleGearBox = new Class({
    Implements: [Events, process.EventEmitter],

    /**
     * This class emits no events.
     *
     */

    /*
     * public variables
     *
     */

    /*
     * private variables
     *
     */
    _gears: [],
    _sign: 1,
    _inputTurnsPerOutputTurn: 1,

    /**
     * constructs a GearBox
     *
     * Arguments:
     *			gears - an Array of integers, each indicating the number of teeth on a gear in the gearbox.
     *					The Array should start with the input gear and progress in order toward the last gear
     *					on the output shaft.
     *
     * Throws an error if:
     *		Any of the elements in the gears array are not integers.
     *
     */
    initialize: function(gears) {
        //check the gears array
        var ratio = 1;
        for (var g = 0, gl = gears.length; g < gl; g++) {
            try {
                var i = Math.floor(gears[g]);
                if (i !== gears[g]) throw new Error('Element #' + g + ' (' + gears[g] + ') in gears array is not an integer');
            } catch (err) {
                throw new Error('Element #' + g + ' (' + gears[g] + ') in gears array is not an integer (' + err + ')');
            }
            ratio = gears[g] / ratio;
        }
        this._gears = gears;
        this._inputTurnsPerOutputTurn = ratio;
        this._sign = (this._gears.length & 1) ? 1 : -1; //an even number of gears will result in the input and output gears turning in opposite directions
    },

    /**
     * Given a desired number of degrees of rotation on the output axel, returns the number of required
     * degrees of turn on the input axel.
     *	Positions clockwise from the gear's starting position are represented as positive nubmers;
     *	Positions counterclockwise from the starting position are represented as negative numbers.
     *
     * Arguments:
     *			outputDegrees - the desired position, in degrees of the output axel of the gearbox.
     *							 Positions clockwise from the gear's starting position are represented as positive nubmers;
     *							 Positions counterclockwise from the starting position are represented as negative numbers.
     *
     */
    getInputFromOutput: function(outputDegrees) {
        if (this._gears.length == 1) return outputDegrees; //special case: the most pointless gearbox imaginable
        var p = (outputDegrees * this._inputTurnsPerOutputTurn) * this._sign;
        ////console.log(p);
        return p;
    },

	 /**
	  * Returns the unsigned gear ratio, expressed as the number of input turns per full 360º output turn.
	  */
	 getRatio: function() {
		return this._inputTurnsPerOutputTurn;
	 }

});

/**
 * The Axis class represents a single motor on the NXT
 *
 */
var _Axis = new Class({
	Implements: [Events, process.EventEmitter],

	/**
	 * This class emits the following events:
	 *		'moveToZeroDone' - when the work of moveToZeroAndResetCounter() is done
	 *		'moveDone' - when a move requested with move() is done
	 *		
	 */

	/*
	 * public variables
	 *
	 */

	/*
	 * private variables
	 *
	 */
	_nxt: null, //holds a reference to the active nxt object from the callback to nodeNxt.connect()
	_nxtSync: null, //holds a reference to an _NxtMotorSynchronizer instance
	_zeroed: false, //set to true after the axis' servo tachos have been zeroed
	_motorPort: null,
	_moving: false,

	_zeroingSpeed: 0,
	_runningSpeed: 0,
	_zeroingDirection: null,
	_limitSwitchPort: null,
	_currentTacho: null,

	//_axisCheckIntervals

	_minSpeed: 4, // the minimum actual speed at which this axis can truly move (Mindstorms motors cannot push their own weight below a certain speed)
	_speedQuantize: 1, // if > 1, then the actual speed value sent to the motor controller will be divided into steps of this number (e.g. for _speedQuantize of 5, input speed will be mapped to speeds 5, 10, 15, 20 but nothing in between etc.)

	/*
	 * public methods
	 *
	 */

	/**
	 * constructs an Axis
	 *
	 * Arguments:
	 *      nxt a reference to the Nxt object
	 *      motorPort a value, 1-3 which specifies the physical port on the NXT brick to which the motor is connected
	 *      zeroingSpeed the speed at which the motor should be zeroed
	 *		zeroingDirection  a value which is either Robot3Axis.COUNTER_CLOCKWISE or
	 *						Robot3Axis.CLOCKWISE, indicating the direction for
	 *						that motor to turn in order to find zero
	 *		limitSwitchPort	 the port index for this axis' limit switch, or null if it has none
	 *      runningSpeed the nominal speed at which the motor should run when drawing
	 *
	 */
	initialize: function(nxt, nxtSync, motorPort, zeroingSpeed, zeroingDirection, limitSwitchPort, runningSpeed) {
		this._nxt = nxt;
		this._nxtSync = nxtSync;
		this._motorPort = motorPort;
		this._zeroingDirection = zeroingDirection;
		this._zeroingSpeed = zeroingSpeed;
		this._runningSpeed = runningSpeed;
		this._limitSwitchPort = limitSwitchPort;
		////console.log('Created new axis: '+this);
		// if (this._limitSwitchPort != null) {
		// 	//set up the limit switch
		// 	this._nxt.InputSetType(this._limitSwitchPort, 1);
		// }
	},


	/**
	 * moves this motor in the specified direction until it reaches zero, at which
	 * point this class will emit a 'moveToZeroDone' event
	 *
	 * Arguments:
	 *
	 * Throws an error if:
	 *		This axis is already moving
	 */
	moveToZeroAndResetCounter: function() {
		if (this._moving) throw new Error('Axis is already moving. Wait for "moveDone", call stopAndIdleNow() or stopAndHoldNow() before calling moveToZeroAndResetCounter() again');
		this._moving = true;
		if (this._limitSwitchPort != null) {
			this._nxtSync.zeroUntilLimit(this._motorPort, this._zeroingSpeed, this._zeroingDirection, this._limitSwitchPort, function() {
				this._zeroed = true;
				this._moving = false;
				this.emit('moveToZeroDone');
			}.bind(this));
		} else {
			this._nxtSync.zeroUntilBlocked(this._motorPort, this._zeroingSpeed, this._zeroingDirection, function() {
				this._zeroed = true;
				this._moving = false;
				this.emit('moveToZeroDone');
			}.bind(this));
		}
		
	},

	// moveToZeroAndResetCounter: function() {
	// 	if (this._moving) throw new Error('Axis is already moving. Wait for "moveDone", call stopAndIdleNow() or stopAndHoldNow() before calling moveToZeroAndResetCounter() again');
	// 	this._moving = true;
		
	// 	//this.stopAndIdleNow();
	// 	this.stopAndHoldNow(); //This seems to hold the axis better than stopAndIdleNow

	// 	//handler for move completion
	// 	this.once('moveDone', function() {
	// 		this._zeroed = true;
	// 		this.emit('moveToZeroDone');
	// 	}.bind(this));

	// 	// reset the motor's tacho reading to zero
	// 	//this._nxt.OutputResetTacho(this._motorPort, 1);

	// 	// regulated brake outputs -- http://hempeldesigngroup.com/lego/pblua/nxtfunctiondefs/#OutputAPI
	// 	var factor = 20;
	// 	var divisor = 1;
	// 	var offset = 20; // minimum speed when regulated
	// 	this._nxt.OutputSetRegulation(this._motorPort, 1, 1, factor, divisor, offset);

	// 	// find the starting tacho values
	// 	this._nxt.OutputGetStatus(this._motorPort, function(start_speed, start_tacho, start_blocktacho, start_runstate, start_overload, start_rotcount, start_torun) {

	// 		// we know when we have hit zero when we hit a stall
	// 		// we have a stall when either:
	// 		//		the NXT reports a motor overload
	// 		//		the tacho reading from the motor stops changing before we stop the motor

	// 		// these variables let us track how much the tacho is changing
	// 		var last_blocktacho = start_blocktacho,
	// 			sameBlocktachoCount = 0,
	// 			sameBlocktachoTreshold = 4,
	// 			hInterval = null;

	// 		var __foundZero = function() {
	// 			// reset the motor's tacho reading to zero
	// 			this._nxt.OutputResetTacho(this._motorPort, 1);

	// 			//hold the motor at this position
	// 			//console.log("holding-------------------------------");
	// 			this.stopAndHoldNow();

	// 			//now check the actual tacho position -- it is possible that load has altered it!
	// 			this._nxt.OutputGetStatus(this._motorPort, function(cur_speed, cur_tacho, cur_blocktacho, cur_runstate, cur_overload, cur_rotcount, cur_torun) {
	// 				//store our last known position
	// 				this._currentTacho = cur_tacho;
	// 				//set the flag
	// 				this._zeroed = true;

	// 				// tell listeners we're done zeroing this axis
	// 				this.emit('moveToZeroDone');
	// 			}.bind(this));
	// 		}.bind(this);

	// 		// set up a periodic check for stalls
	// 		if (this._limitSwitchPort != null) {
	// 			//
	// 			// limit switch mode
	// 			//
	// 			var __limitSwitchCheck = function(rawAD, state0, state1, val) {
	// 				//debugging:
	// 				////console.log(arguments);
	// 				if (val != null && val <= 183) {
	// 					//switch closed!
	// 					//console.log(this+': Found zero with limit switch='+val);
	// 					__foundZero();
	// 				} else {
	// 					setTimeout(function() {
	// 						this._nxt.InputGetStatus(this._limitSwitchPort, __limitSwitchCheck);
	// 					}.bind(this), 10); //recursion
	// 				}
	// 			}.bind(this);
	// 			__limitSwitchCheck(null, null, null, null); //start the limit switch check

	// 		} else {
	// 			//
	// 			// closed loop detection mode
	// 			//
	// 			var __blockCheck = function(cur_speed, cur_tacho, cur_blocktacho, cur_runstate, cur_overload, cur_rotcount, cur_torun) {
	// 				if (cur_speed != null) {
	// 					//debugging:
	// 					////console.log(arguments);
	// 					//see if we have the same (or within sameBlocktachoThreshold counts) blocktacho as we did last time
	// 					if (Math.abs(last_blocktacho - cur_blocktacho) < sameBlocktachoTreshold)
	// 						sameBlocktachoCount++; //count how many checks we have been at the same blocktacho count
	// 					else
	// 						sameBlocktachoCount=0; //if blocktacho starts moving again then reset the counter
	// 					last_blocktacho = cur_blocktacho;
	// 				}

	// 				//if we are overloaded or have been sitting at the same position for a while, then we have a stall
	// 				if (cur_speed != null && cur_overload > 0 || (sameBlocktachoCount > 100)) {
	// 					//stop checking for stalls
	// 					clearInterval(hInterval);
	// 					//console.log(this+': Found zero at cur_tacho='+cur_tacho+' (cur_overload='+cur_overload+' sameBlocktachoCount='+sameBlocktachoCount+' cur_blocktacho='+cur_blocktacho+')');
	// 					__foundZero();
	// 				} else {
	// 					setTimeout(function() {
	// 						this._nxt.OutputGetStatus(this._motorPort, __blockCheck);
	// 					}.bind(this), 10); //recursion
	// 				}
	// 			}.bind(this);
	// 			__blockCheck(null, null, null, null, null, null, null); //start the block check

	// 		} //if in stall-detect mode

	// 		if (this._limitSwitchPort == null) {
	// 			//block-checking mode, so back off slightly before moving
	// 			this._nxt.OutputSetSpeed(this._motorPort, 0x20, this._zeroingSpeed * this._zeroingDirection * -1, 4);
	// 		}

	// 		// and, finally, command the motor to move after a slight pause
	// 		setTimeout(function() {
	// 			this._nxt.OutputSetSpeed(this._motorPort, 0x20, this._zeroingSpeed * this._zeroingDirection);
	// 		}.bind(this), 500);

	// 	}.bind(this));

	// },

	/**
	 * Should be called whenever this axis is being moved by another class in conjunction with other axes,
	 * to prevent concurrent move problems.
	 *
	 */
	flagMultiAxisMoveStarting: function() {
		this._moving = true;
	},

	/**
	 * Should be called whenever this axis is done being moved by another class in conjunction with other axes,
	 * to prevent concurrent move problems.
	 *
	 * @param newTacho The new current position of this axis' motor
	 *
	 */
	flagMultiAxisMoveFinished: function(newTacho) {
		this._currentTacho = newTacho;
		this._moving = false;
		console.log(this+" has finished a multi-motor move. New position is "+this.getCurrentPosition());
	},


	/**
	 * returns the axis' current position, in degrees.
	 *
	 * Throws an error if:
	 *		The axis has not yet been zeroed
	 */
	getCurrentPosition: function() {
		if (!this._zeroed) throw new Error('Axis not yet zeroed. getCurrentPosition() can only be used after calling moveToZeroAndResetCounter() and waiting for a "moveToZeroDone" event.');
		if (this._moving) throw new Error('Axis is moving. getCurrentPosition() cannot be called because position is indeterminite until motion has stopped.');
		return this._currentTacho;
	},


	/**
	 * causes this axis to immediately stop and go idle, cancelling all in-progress moves (including a move to zero)
	 * see also stopAndHoldNow()
	 *
	 */
	stopAndIdleNow: function() {
		this._nxt.OutputSetSpeed(this._motorPort, 0, 0);
		this._moving = false;
	},


	/**
	 * causes this axis to immediately stop and hold the current position, cancelling all in-progress moves (including a move to zero)
	 * see also stopAndIdleNow()
	 *
	 */
	stopAndHoldNow: function() {
		this._nxt.OutputSetSpeed(this._motorPort, 0x60, 0);
		this._moving = false;
	},


	/**
	 * returns true if this axis has been zeroed
	 *
	 */
	isZeroed: function() {
		return this._zeroed;
	},

	/**
	 * returns true if this axis is moving right now
	 *
	 */
	isMoving: function() {
		return this._moving;
	},

	/**
	 * moves the motor to the specified position at the specified speed
	 * when it reaches the specified position the class will emit the 'moveDone' event
	 *
	 * Arguments:
	 *		speed - the speed at which to move the motor
	 *		targetDegrees - the target position to which to move the motor
	 *
	 * Throws an error if:
	 *		The axis has not yet been zeroed
	 *		Speed is negative
	 *		This axis is already moving
	 *
	 */
	// move: function(speed, targetDegrees, axisNo) {
	// 	if (!this._zeroed) throw new Error('Axis not yet zeroed. move() can only be used after calling moveToZeroAndResetCounter() and waiting for a "moveToZeroDone" event.')
	// 	if (this._moving) throw new Error('Axis is already moving. Wait for "moveDone", call stopAndIdleNow() or stopAndHoldNow() before calling move() again');
	// 	if (speed < 0) throw new Error('Speed is negative');

	// 	//this.stopAndIdleNow(); //is this necessary?

	// 	//make sure speed an target degrees have the right degree of precision
	// 	speed = Math.floor(speed * 100) / 100;
	// 	targetDegrees = Math.floor(targetDegrees * 100) / 100;
	// 	speed = Math.max(this._minSpeed, this._speedQuantize <= 1 ? Math.floor(speed) : Math.floor((speed / this._speedQuantize) * this._speedQuantize));
	// 	//console.log('final speed: ' + speed);
	// 	targetDegrees = Math.floor(targetDegrees);

	// 	//console.log("TARGET DEG => " + targetDegrees);

	// 	// find the starting tacho value
	// 	//this._nxt.OutputGetStatus(this._motorPort, function(start_speed, start_tacho, start_blocktacho, start_runstate, start_overload, start_rotcount, start_torun) {
	// 		//debugging:
	// 		////console.log(arguments);

	// 		//this._currentTacho = start_tacho;

	// 		//safety
	// 		var start_tacho = this._currentTacho;
	// 		////console.log('targetDegrees pre: ' + targetDegrees);
	// 		//console.log('start_tacho: ' + start_tacho);
	// 		////console.log('targetdeg - start_tacho: ' + (targetDegrees - start_tacho));
	// 		//targetDegrees = Math.min(0, targetDegrees - this._currentTacho);
	// 		targetDegrees = targetDegrees - this._currentTacho;
	// 		////console.log('targetDegrees post: ' + targetDegrees);

	// 		// set up a periodic check to see if we have reached our destination
	// 		var intervalCleared = false; //safety flag since interval still fires a couple times after clearing
	// 		var hInterval = setInterval(function() {

	// 			//console.log("checking nxt status");

	// 			// where are we now? use OutputGetStatus to find out...
	// 			this._nxt.OutputGetStatus(this._motorPort, function(cur_speed, cur_tacho, cur_blocktacho, cur_runstate, cur_overload, cur_rotcount, cur_torun) {

	// 				//store last-known position
	// 				this._currentTacho = cur_tacho;

	// 				//debugging:
	// 				//console.log("current tacho: " + this._currentTacho);

	// 				var n = Math.abs(this._currentTacho - (start_tacho + targetDegrees));

	// 				//console.log(n);
	// 				//console.log("n in move: " + n + " : " + this._motorPort);
	// 				if (4 > n) { //the number 4 is the number of tacho counts of tolerance within which we need to get before deciding we have arrived
	// 					//we're there!
	// 					clearInterval(hInterval);
	// 					if(!intervalCleared) { //we want to bar this area from not happening more than once per axis
	// 						intervalCleared = true;
	// 						this.stopAndHoldNow(); //is this necessary?
	// 						this._moving = false;
	// 						console.log('Move done for axis => ' + axisNo);
	// 						this.emit('moveDone');
	// 					}
	// 				}
	// 			}.bind(this));

	// 		}.bind(this), 100); //check every 10ms

	// 		// and, finally, command the motor to move
	// 		//console.log(this+' moving: speed='+speed+' targetDegrees='+targetDegrees);
	// 		//this._nxt.OutputSetSpeed(this._motorPort, 0x20, this._signOf(targetDegrees) * speed, Math.abs(targetDegrees));
	// 		this._nxt.OutputSetSpeed(this._motorPort, 0x20, this._signOf(targetDegrees) * speed, Math.abs(targetDegrees));

	// 	//}.bind(this));
	// },

	/**
	 * Returns the NXT motor port number for this axis.
	 */
	getPort: function() {
		return this._motorPort;
	},

	toString: function() {
		return '[Axis@Port'+this._motorPort+': zs='+this._zeroingSpeed+',zd='+this._zeroingDirection+',lp='+this._limitSwitchPort+',rs='+this._runningSpeed+',isMoving='+this.isMoving()+']';
	},

	/**
	 * Returns the nominal run speed for this axis.
	 *
	 */
	getNominalRunSpeed: function() {
		return this._runningSpeed;
	},

	/*
	 * private methods
	 *
	 */

	_signOf: function(n) {
		return n ? n < 0 ? -1 : 1 : 0;
	},

});

/**
 * _NxtMotorSynchronizer is a wrapper class for the Nxt class from node-nxt.
 * It adds the ability to do synchronized motor moves with all synch logic running on the nxt.
 *
 */
var _NxtMotorSynchronizer = new Class({
	Implements: [Events, process.EventEmitter],

	_nxt: null, //holds a reference to the active nxt object from the callback to nodeNxt.connect()
	_moving: false,

	initialize: function(nxt) {
		this._nxt = nxt;

		var md5sum = crypto.createHash('md5');

		var lua = [
			'nxt.DisplayText("Loading [      ] ")',

			'function sign(i)',
			'  if i < 0 then return -1 else return 1 end',
			'end',

			'nxt.DisplayText("Loading [ #    ] ")',

			'function zeroUntilLimit(motorport,speed,direction,switchport)',
			'  nxt.InputSetType(switchport, 1)',
			'  nxt.OutputSetRegulation(motorport,1)',
			'  nxt.OutputSetSpeed(motorport,0x20,speed * direction)',

			//wait for a bit
			'  t = nxt.TimerRead()',
			'  while t + 2000 > nxt.TimerRead() do', //2 sec. delay
			'     -- nothing',
			'  end',

			'  val = 1000000',
			'  repeat',
			'    _,_,_,val = nxt.InputGetStatus(switchport)',
			'    print(val)',
			'  until val <= 183',

			'  nxt.OutputSetSpeed(motorport,0x60,0)',
			'  nxt.OutputResetTacho(motorport,1,1,1)',
			'  return true',
			'end',

			'nxt.DisplayText("Loading [ ##   ] ")',

			'function zeroUntilBlocked(motorport,speed,direction)',
			'  lasttacho = 0',
			'  tachohistory = 0',

			'  lasttacho = nxt.OutputGetStatus(motorport)',

			'  nxt.OutputSetRegulation(motorport,1)',
			'  nxt.OutputSetSpeed(motorport,0x20,speed * direction)',

			'  repeat',
			'    tacho = nxt.OutputGetStatus(motorport)',
			//'    print(tacho)',
			'    if lasttacho == tacho then',
			'      tachohistory = tachohistory + 1',
			'    else',
			'      tachohistory = 0',
			'    end',
			'    lasttacho = tacho',
			'  until tachohistory > 100',

			'  nxt.OutputSetSpeed(motorport,0x60,0)',
			'  nxt.OutputResetTacho(motorport,1,1,1)',
			'  return true',
			'end',
			
			'nxt.DisplayText("Loading [ ###  ] ")',

			'function calibrate()',
			'  tachos = {0,0,0}',

			'  nxt.DisplayText("Orange btn to",0,6*8)',
			'  nxt.DisplayText("exit calibration",0,7*8)',

			// set all motors to allow free rotation
			'  for i=1,3 do',
			'    nxt.OutputSetSpeed(i,0x00)',
			'  end',

			'  repeat',
			'    for i=1,3 do',
			'      speed, tachos[i], blocktacho, runstate, overload, rotcount, torun = nxt.OutputGetStatus(i)',
			'      nxt.DisplayText(""..i..": "..tachos[i].."        ",0,i*8)',
			'    end',
			'  until( 8 == nxt.ButtonRead() )',
			'  return tachos[1], tachos[2], tachos[3]',
			'end',

			'nxt.DisplayText("Loading [ #### ] ")',

			'function syncMoveAbs(speeds,degrees)',

			'  nxt.DisplayText("Sketchbot moving... ")',

			'  tacho = {0, 0, 0}', //IMPORTANT: In Lua, it is conventional for the first element in an array to be index 1, not 0
			'  motorsdone = {false, false, false}',
			'  tachohistory = {0, 0, 0}', //used for dynamic position tolerance below
			'  lasttacho = {0, 0, 0}', //used for dynamic position tolerance below
			'  tolerance = {0, 0, 0}', //used for dynamic position tolerance below
			'  delta = 0',
			'  mindelta = 100000',

			'  for i=1,3 do',
			'    nxt.OutputSetRegulation(i, 1, 1)',
			'    _,tacho[i] = nxt.OutputGetStatus(i)',
			'    print("start tacho "..i..": "..tacho[i])',
			'    motorsdone[i] = (degrees[i] == nil) or (degrees[i] == tacho[i])', // don't more motors that are already done, or which aren't being commanded (degrees[i] == nil)
			'    if not motorsdone[i] then',
			'      delta = math.abs(degrees[i] - tacho[i])',
			'      if delta < mindelta then mindelta = delta end',
			'    end',
			'  end',

			// compensate for differences in distance traveled by each motor
			'  for i=1,3 do',
			'    if not motorsdone[i] then',
			'      print("calculating new speed for motor "..i)',
			'      delta = degrees[i] - tacho[i]',
			//'      print("delta for "..i..": "..delta)',
			'      speeds[i] = sign(delta) * (speeds[i] * (math.abs(delta) / mindelta))', // round to nearest whole number
			'      if speeds[i] > 300 then speeds[i] = 300 end', // max speed
			'      if speeds[i] < -300 then speeds[i] = -300 end', // max speed
			//'      speeds[i] = nxt.int(speeds[i])',
			'      print("new speed "..i..": "..speeds[i])',
			'      nxt.OutputSetRegulation(i,1)',
			'    end',
			'  end',


			// do as little computation in this loop as possible so that motors have
			// as near as possible to a simultaneous start
			'  nxt.DisableNXT(1);',
			'  for n, i in ipairs({3,2,1}) do',
			'    if not motorsdone[i] then nxt.OutputSetSpeed(i,0x20,speeds[i],math.abs(degrees[i] - tacho[i])) end',
			//'    if not motorsdone[i] then nxt.OutputSetSpeed(i,0x20,speeds[i]) end',
			'  end',
			'  nxt.DisableNXT(0);',

			// '  print("starting...")',

			'  repeat',
			'    for n, i in ipairs({3,2,1}) do',
			'      if not motorsdone[i] then',
			//'        print("inner before "..motorsdone)',
			'        _,curtacho = nxt.OutputGetStatus(i)',

			//
			// dynamically adjust our motor precision tolerance based on how long we've been sitting at
			// the same position. Don't try to move a mountain with a lego motor.
			//
			'        if curtacho - lasttacho[i] == 0 then',
			'          tachohistory[i] = tachohistory[i] + 1',
			'        else',
			'          tachohistory[i] = 0',
			'        end',
			'        lasttacho[i] = curtacho',

			'        if tachohistory[i] > 10 then',
			'          tolerance[i] = tolerance[i] + 1',
			'          nxt.DisplayText("tol"..i.."="..tolerance[i],0,i*8)',
			'        end',

			// '        print("---------")',
			// '        print("tolerance "..i.." = "..tolerance[i])',
			// '        print("tachohistory "..i.." = "..tachohistory[i])',
			// '        print("curtacho "..i.." = "..curtacho)',

			'        if tolerance[i] >= math.abs(curtacho - degrees[i]) then',
			'          nxt.OutputSetSpeed(i,0x60,0)',
			//'          print("-- stopped motor "..i.." curtacho="..curtacho)',
			'          motorsdone[i] = true',
			'        end',
			'        if speeds[i] < 0 and curtacho < degrees[i] then',
			'          nxt.OutputSetSpeed(i,0x60,0)',
			//'          print("-- stopped motor "..i.." curtacho="..curtacho)',
			'          motorsdone[i] = true',
			'        end',
			'        if speeds[i] > 0 and curtacho > degrees[i] then',
			'          nxt.OutputSetSpeed(i,0x60,0)',
			//'          print("-- stopped motor "..i.." curtacho="..curtacho)',
			'          motorsdone[i] = true',
			'        end',

			'      end',
			'    end',
			'  until motorsdone[1] and motorsdone[2] and motorsdone[3]',

			'  for i=1,3 do',
			'    _,tacho[i] = nxt.OutputGetStatus(i)',
			'    print("end tacho "..i..": "..tacho[i])',
			'  end',
			'  nxt.DisplayText("Sketchbot ready. ")',
			'  return tacho[1], tacho[2], tacho[3]',
			'end',

			'nxt.DisplayText("Loading [ #### ]  ")',
			'nxt.DisplayText("Sketchbot ready. ")',
			];

		// check if we need to update the NXT program by comparing a fingerprint of the Lua source code
		var luaHash = md5sum.update(lua.join("\n")).digest('hex');
		lua.push('function getProgramHash() return "'+luaHash+'" end');

		this._nxt._send('getProgramHash and (getProgramHash() == "'+luaHash+'")', function(programOK) {
			if (programOK != 'true') {
				console.log('---------------------------------');
				console.log('Sketchbot program on NXT does not match version in Robot3Axis.js, updating NXT...');
				// the program on the controller needs to be updated
				for (var n = 0; n < lua.length; n++)
					this._nxt._send(lua[n]);

				// verify that the program is programmed by checking the hash again
				// don't emit 'connected' until we are sure the program is on the device
				console.log('Sending program update to NXT... (version '+luaHash+')');
				this._nxt._send('getProgramHash()', function(deviceHash) {
					console.log('NXT reports current program vesion as '+deviceHash);
					if (deviceHash == luaHash) {
						console.log('---------------------------------');
						this.emit('connected');
					} else {
						console.log('Fatal error: program versio on NXT after update does not match the version of the program which was sent to the NXT.');
						console.log('Please shut down the NXT brick by removing power or turning it off, then restart it. Please restart robotcontrol to re-initialize the robot.');
						throw new Error('Program version on NXT after update does not match the version of the program which was sent to the NXT. Expected '+luaHash+' but device reports version '+deviceHash);
						// do not emit connected in this case. We're stuck.
					}
				}.bind(this));

			} else {
				console.log('---------------------------------');
				console.log('Not updating program on NXT because it is already up-to-date with version '+luaHash);
				console.log('---------------------------------');
				this.emit('connected');
			}
		}.bind(this));

	},

	/**
	 * zeroes the motor on the specified port by moving it
	 * at the given speed, in the given direction until the motor stalls
	 * (due to hitting an obstacle).
	 *
	 */
	zeroUntilBlocked: function(motorport, speed, direction, callback) {
		var cmd = 'zeroUntilBlocked('+motorport+','+speed+','+direction+')';
		this._nxt._send(cmd, callback);
	},

	/**
	 * zeroes the motor on the specified port by moving it
	 * at the given speed, in the given direction until a switch
	 * is depressed.
	 *
	 */
	zeroUntilLimit: function(motorport, speed, direction, switchport, callback) {
		var cmd = 'zeroUntilLimit('+motorport+','+speed+','+direction+','+switchport+')';
		this._nxt._send(cmd, callback);
	},

	/**
	 * Turns all motors into sensors and sets their tachos to the reported position
	 *
	 */
	calibrate: function(axes, callback) {
	
		for (var a = 0; a < axes.length; a++)
			axes[a].flagMultiAxisMoveStarting();

		this._nxt._send('calibrate()', function(tacho0, tacho1, tacho2) {
			newTachos = [tacho0, tacho1, tacho2];
			// update new position on each axis
			for (var a = 0; a < newTachos.length; a++)
				axes[a].flagMultiAxisMoveFinished(new Number(newTachos[a]));
			callback();
		}.bind(this));
	},

	/**
	 * Try to do a synchronized move on all three axes so that
	 * they complete their moves at the same time.
	 *
	 * Will throw an Error if:
	 *		the targetDegrees argument does not have the right number of elements
	 *		any motor is already moving
	 *		speed is negative
	 *
	 */
	syncMoveAbs: function(axes, speeds, targetDegrees, callback) {
		if (!targetDegrees || targetDegrees.length < axes.length) throw new Error('targetDegrees must have exactly '+axes.length+' elements');
		if (!speeds || speeds.length < axes.length) throw new Error('speeds must have exactly '+axes.length+' elements');

		//round targets and prepare axes
		for (var a = 0; a < targetDegrees.length; a++) {
			if (speeds[a] < 0) throw new Error('Speed for axis '+a+' is negative');
			if (targetDegrees[a] != null) {
				// check if this axis is already moving
				if (axes[a].isMoving()) throw new Error('Robot axis '+a+' is already moving');

				targetDegrees[a] = Math.round(targetDegrees[a]); // pbLua can't deal with floats yet
				axes[a].flagMultiAxisMoveStarting();
			}
		}

		// perform the move using the controller-side syncMoveAbs method
		var cmd = 'syncMoveAbs({'+
			speeds[0]+','+
			speeds[1]+','+
			speeds[2]+
			'},{'+
			(targetDegrees[0] == null ? 'nil' : targetDegrees[0] )+','+
			(targetDegrees[1] == null ? 'nil' : targetDegrees[1] )+','+
			(targetDegrees[2] == null ? 'nil' : targetDegrees[2] )+'})';
		
		this._nxt._send(cmd, function(tacho0, tacho1, tacho2) {
			newTachos = [tacho0, tacho1, tacho2];
			
			// update new position on each axis
			for (var a = 0; a < targetDegrees.length; a++)
				if (targetDegrees[a])
					axes[a].flagMultiAxisMoveFinished(new Number(newTachos[a]));

			// repeat once
			// this._nxt._send(cmd, function(tacho0, tacho1, tacho2) {
			// 	newTachos = [tacho0, tacho1, tacho2];
				
			// 	// update new position on each axis
			// 	for (var a = 0; a < targetDegrees.length; a++)
			// 		if (targetDegrees[a])
			// 			axes[a].flagMultiAxisMoveFinished(new Number(newTachos[a]));

			// 	// call the callback
				callback();
			// }.bind(this));
		}.bind(this));
	}

});

