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
var nodeNxt = require('node-nxt');

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
    _allZeroed: false, //set to true after the robot's servo tachos have been zeroed
    _axisConfig: null, //configuration structure for axes
    _axis: null, //an array of Axis objects which represent the NXT's motors
    _gearBoxes: null, //an array of GearBox objects which represent the gearing on each axis

    _zeringOrder: [1, 2, 0], //see initialize()
    _zeroingOrderIndex: 0, //when in the process of running moveToZero(), this contains the index for an element in zeroingOrder, which in turn indicates the index of the axis currently being zeroed

    _synchMoving: false,

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
        nodeNxt.connect(this._serialPortName, function(nxt) {
            //retain a reference to the nxt object
            this._nxt = nxt;
            //display a message on the NXT brick display
            this._nxt.DisplayText('Sketchbot OK');
            //construct our Axis objects
            this._axis = new Array(this._axisConfig.length);
            this._gearBoxes = new Array(this._axisConfig.length);
            for (var a = 0, al = this._axisConfig.length; a < al; a++) {
                this._axis[a] = new _Axis(
                    this._nxt,
                    this._axisConfig[a].motorPort,
                    this._axisConfig[a].zeroingSpeed,
                    this._axisConfig[a].zeroingDirection,
                    this._axisConfig[a].limitSwitchPort
                );
                if (this._axisConfig[a].gearBoxConfig != null)
                    this._gearBoxes[a] = new _SimpleGearBox(this._axisConfig[a].gearBoxConfig);
                else
                    this._gearBoxes[a] = new _SimpleGearBox([1]);
            }
            //tell listeners we are done
            this.emit('connected');
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
    synchronizedMove: function(speed, targetDegrees) {
        console.log("going to " + targetDegrees);

        if (!this._allZeroed) throw new Error('Robot not yet zeroed. synchronizedMove() can only be used after calling moveToZero() and waiting for a "moveToZeroDone" event.')
        if (!targetDegrees || targetDegrees.length < this._axis.length) throw new Error('targetDegrees must have exactly ' + this._axis.length + ' elements');
        if (speed < 0) throw new Error('Speed is negative');
        if (this._synchMoving) throw new Error('Robot is already moving');

        var a = 0,
            al = this._axis.length,
            realSpeeds = new Array(al),
            realPositions = new Array(al),
            realDeltas = new Array(al),
            maxDelta = 0,
            minDelta = 100000000000,
            delta = 0;

        //figure the farthest distance to be moved
        for (delta = 0, a = 0; a < al; a++) {
            realPositions[a] = this._gearBoxes[a].getInputFromOutput(targetDegrees[a]);
            realDeltas[a] = Math.abs(this._axis[a].getCurrentPosition() - realPositions[a]);
            ////console.log('realpos ' + a + ': ' + realPositions[a]);
            ////console.log('realdel ' + a + ': ' + realDeltas[a]);
            maxDelta = Math.max(maxDelta, realDeltas[a]);
            minDelta = Math.min(minDelta, realDeltas[a]);

        }


        // console.log('al => ' + al);
        // console.log('realSpeeds => ' + realSpeeds);
        // console.log('realPositions => ' + realPositions);
        // console.log('realDeltas => ' + realDeltas);
        // console.log('maxDeltas => ' + maxDelta);
        // console.log('minDelta => ' + minDelta);
        // console.log('delta => ' + al);
        // console.log("------------------------------------------");

        //figure out speeds for each axis and set up listeners
        for (a = 0; a < al; a++) {

            // figure out the right speed for this axis,
            // such that all axes will reach their destinations at
            // the same time.
            //
            // Currently, we assume ideal conditions
            // and do this simply by divvying up the
            // speed proprtional to the distance over which
            // each axis must travel

            realSpeeds[a] = speed; // * (realDeltas[a] / maxDelta);
            //console.log('realspeed ' + a + ': ' + realSpeeds[a]);

            //set up a handler to wait for all axes to finish their moves
            if (targetDegrees[a] != null) {

                //console.log("is axis " + a + " done?");
                //console.log("Axis " + a + " current position: " + this._axis[a].getCurrentPosition());


                this._axis[a].once('moveDone', function() {

                    if (this._allAxisEval(function(axis) {

                        return !axis.isMoving() && this._synchMoving;

                    }.bind(this))) {
                        //all axes have finished their moves
                        this._synchMoving = false;
                        console.log("ALL AXIS HAVE FINISHED THEIR MOVE!");
                        console.log("------------------------------------------------------");
                        this.emit('synchronizedMoveDone');
                    }

                }.bind(this));
            }
        }

        // command all axes
        // IMPORTANT: we don't want to do much (any?) processing inside this loop
        for (a = 0; a < al; a++) {
            //actually command the move:
            //console.log("actually moving axis " + a + " to " + realPositions[a]);
            if (targetDegrees[a] != null) {
                console.log("MOVING AXIS => " + a);
                this._axis[a].move(realSpeeds[a], realPositions[a], a);
            }

        }

        this._synchMoving = true; //set flag
    },

    /*
     * private methods
     *
     */

    _moveNextAxisToZero: function() {
        if (this._zeroingOrderIndex >= this._axis.length) return;
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
        //console.log('Zeroing Axis #'+axisIndex);

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

        for (var trueCt = 0, a = 0, al = this._axis.length; a < al; a++) {
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
    _zeroed: false, //set to true after the axis' servo tachos have been zeroed
    _motorPort: null,
    _moving: false,

    _zeroingSpeed: 0,
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
     *		zeroingDirection  a value which is either Robot3Axis.COUNTER_CLOCKWISE or
     *						Robot3Axis.CLOCKWISE, indicating the direction for
     *						that motor to turn in order to find zero
     *		limitSwitchPort	 the port index for this axis' limit switch, or null if it has none
     *
     */
    initialize: function(nxt, motorPort, zeroingSpeed, zeroingDirection, limitSwitchPort) {
        this._nxt = nxt;
        this._motorPort = motorPort;
        this._zeroingDirection = zeroingDirection;
        this._zeroingSpeed = zeroingSpeed;
        this._limitSwitchPort = limitSwitchPort;
        ////console.log('Created new axis: '+this);
        if (this._limitSwitchPort != null) {
            //set up the limit switch
            this._nxt.InputSetType(this._limitSwitchPort, 1);
        }
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

        //this.stopAndIdleNow();
        this.stopAndHoldNow(); //This seems to hold the axis better than stopAndIdleNow

        //handler for move completion
        this.once('moveDone', function() {
            this._zeroed = true;
            this.emit('moveToZeroDone');
        }.bind(this));

        // reset the motor's tacho reading to zero
        this._nxt.OutputResetTacho(this._motorPort, 1);

        // regulated brake outputs -- http://hempeldesigngroup.com/lego/pblua/nxtfunctiondefs/#OutputAPI
        var factor = 20;
        var divisor = 1;
        var offset = 20;
        this._nxt.OutputSetRegulation(this._motorPort, 1, 1, factor, divisor, offset);

        // find the starting tacho values
        this._nxt.OutputGetStatus(this._motorPort, function(start_speed, start_tacho, start_blocktacho, start_runstate, start_overload, start_rotcount, start_torun) {

            // we know when we have hit zero when we hit a stall
            // we have a stall when either:
            //		the NXT reports a motor overload
            //		the tacho reading from the motor stops changing before we stop the motor

            // these variables let us track how much the tacho is changing
            var last_blocktacho = start_blocktacho,
                sameBlocktachoCount = 0,
                sameBlocktachoTreshold = 4,
                hInterval = null;

            var __foundZero = function() {
                // reset the motor's tacho reading to zero
                this._nxt.OutputResetTacho(this._motorPort, 1);

                //hold the motor at this position
                //console.log("holding-------------------------------");
                this.stopAndHoldNow();

                //now check the actual tacho position -- it is possible that load has altered it!
                this._nxt.OutputGetStatus(this._motorPort, function(cur_speed, cur_tacho, cur_blocktacho, cur_runstate, cur_overload, cur_rotcount, cur_torun) {
                    //store our last known position
                    this._currentTacho = cur_tacho;
                    //set the flag
                    this._zeroed = true;

                    // tell listeners we're done zeroing this axis
                    this.emit('moveToZeroDone');
                }.bind(this));
            }.bind(this);

            // set up a periodic check for stalls
            if (this._limitSwitchPort != null) {
                //
                // limit switch mode
                //
                hInterval = setInterval(function() {
                    this._nxt.InputGetStatus(this._limitSwitchPort, function(rawAD, state0, state1, val) {
                        //debugging:
                        ////console.log(arguments);
                        if (val <= 183) {
                            //switch closed!
                            clearInterval(hInterval);
                            //console.log(this+': Found zero with limit switch='+val);
                            __foundZero();
                        }
                    }.bind(this));
                }.bind(this), 10); //check every 10ms

            } else {
                //
                // closed loop detection mode
                //
                hInterval = setInterval(function() {
                    // where are we now? use OutputGetStatus to find out...
                    this._nxt.OutputGetStatus(this._motorPort, function(cur_speed, cur_tacho, cur_blocktacho, cur_runstate, cur_overload, cur_rotcount, cur_torun) {
                        //debugging:
                        ////console.log(arguments);
                        //see if we have the same (or within sameBlocktachoThreshold counts) blocktacho as we did last time
                        if (Math.abs(last_blocktacho - cur_blocktacho) < sameBlocktachoTreshold)
                            sameBlocktachoCount++; //count how many checks we have been at the same blocktacho count
                        else
                            sameBlocktachoCount = 0; //if blocktacho starts moving again then reset the counter
                        last_blocktacho = cur_blocktacho;

                        //if we are overloaded or have been sitting at the same position for a while, then we have a stall
                        if (cur_overload > 0 || (sameBlocktachoCount > 100)) {
                            //stop checking for stalls
                            clearInterval(hInterval);
                            //console.log(this+': Found zero at cur_tacho='+cur_tacho+' (cur_overload='+cur_overload+' sameBlocktachoCount='+sameBlocktachoCount+' cur_blocktacho='+cur_blocktacho+')');
                            __foundZero();
                        }
                    }.bind(this));
                }.bind(this), 10); //check every 10ms
            } //if in stall-detect mode

            // and, finally, command the motor to move
            this._nxt.OutputSetSpeed(this._motorPort, 0x20, this._zeroingSpeed * this._zeroingDirection);

        }.bind(this));

    },


    /**
     * returns the axis' current position, in degrees.
     *
     * Throws an error if:
     *		The axis has not yet been zeroed
     */
    getCurrentPosition: function() {
        if (!this._zeroed) throw new Error('Axis not yet zeroed. getCurrentPosition() can only be used after calling moveToZeroAndResetCounter() and waiting for a "moveToZeroDone" event.')
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
    move: function(speed, targetDegrees, axisNo) {
        if (!this._zeroed) throw new Error('Axis not yet zeroed. move() can only be used after calling moveToZeroAndResetCounter() and waiting for a "moveToZeroDone" event.')
        if (this._moving) throw new Error('Axis is already moving. Wait for "moveDone", call stopAndIdleNow() or stopAndHoldNow() before calling move() again');
        if (speed < 0) throw new Error('Speed is negative');

        //this.stopAndIdleNow(); //is this necessary?

        //make sure speed an target degrees have the right degree of precision
        speed = Math.floor(speed * 100) / 100;
        targetDegrees = Math.floor(targetDegrees * 100) / 100;
        speed = Math.max(this._minSpeed, this._speedQuantize <= 1 ? Math.floor(speed) : Math.floor((speed / this._speedQuantize) * this._speedQuantize));
        //console.log('final speed: ' + speed);
        targetDegrees = Math.floor(targetDegrees);

        //console.log("TARGET DEG => " + targetDegrees);

        // find the starting tacho value
        //this._nxt.OutputGetStatus(this._motorPort, function(start_speed, start_tacho, start_blocktacho, start_runstate, start_overload, start_rotcount, start_torun) {
        //debugging:
        ////console.log(arguments);

        //this._currentTacho = start_tacho;

        //safety
        var start_tacho = this._currentTacho;
        ////console.log('targetDegrees pre: ' + targetDegrees);
        //console.log('start_tacho: ' + start_tacho);
        ////console.log('targetdeg - start_tacho: ' + (targetDegrees - start_tacho));
        //targetDegrees = Math.min(0, targetDegrees - this._currentTacho);
        targetDegrees = targetDegrees - this._currentTacho;
        ////console.log('targetDegrees post: ' + targetDegrees);

        // set up a periodic check to see if we have reached our destination
        var intervalCleared = false; //safety flag since interval still fires a couple times after clearing
        var hInterval = setInterval(function() {

            console.log("checking nxt status");

            // where are we now? use OutputGetStatus to find out...
            this._nxt.OutputGetStatus(this._motorPort, function(cur_speed, cur_tacho, cur_blocktacho, cur_runstate, cur_overload, cur_rotcount, cur_torun) {

                //store last-known position
                this._currentTacho = cur_tacho;

                //debugging:
                //console.log("current tacho: " + this._currentTacho);

                var n = Math.abs(this._currentTacho - (start_tacho + targetDegrees));

                console.log(n);
                //console.log("n in move: " + n + " : " + this._motorPort);
                if (4 > n) { //what is this number 4 doing in this case?
                    //we're there!
                    clearInterval(hInterval);
                    if (!intervalCleared) { //we want to bar this area from not happening more than once per axis
                        intervalCleared = true;
                        this.stopAndHoldNow(); //is this necessary?
                        this._moving = false;
                        console.log('Move done for axis => ' + axisNo);
                        this.emit('moveDone');
                    }
                }
            }.bind(this));

        }.bind(this), 100); //check every 10ms

        // and, finally, command the motor to move
        //console.log(this+' moving: speed='+speed+' targetDegrees='+targetDegrees);
        //this._nxt.OutputSetSpeed(this._motorPort, 0x20, this._signOf(targetDegrees) * speed, Math.abs(targetDegrees));
        this._nxt.OutputSetSpeed(this._motorPort, 0x20, this._signOf(targetDegrees) * speed, Math.abs(targetDegrees));

        //}.bind(this));
    },

    toString: function() {
        return '[Axis@Port' + this._motorPort + ': zs=' + this._zeroingSpeed + ',zd=' + this._zeroingDirection + ',lp=' + this._limitSwitchPort + ',isMoving=' + this.isMoving() + ']';
    },

    /*
     * private methods
     *
     */

    _signOf: function(n) {
        return n ? n < 0 ? -1 : 1 : 0;
    },

});
